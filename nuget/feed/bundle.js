(function () {
    'use strict';

    function load(url, success, error) {
        $.ajax({
            url: url,
            success: function (data) { return success(data); },
            error: function (_, textStatus, errorThrown) { return error(textStatus, errorThrown); }
        });
    }

    var CatalogPoller = (function () {
        function CatalogPoller(feedUrl, pollDelay, pageCallback) {
            var _this = this;
            this.feedUrl = feedUrl;
            this.pollDelay = pollDelay;
            this.pageCallback = pageCallback;
            this.poll();
            this.intervalId = window.setInterval(function () { return _this.onTimer(); }, this.pollDelay);
        }
        CatalogPoller.prototype.disable = function () {
            window.clearInterval(this.intervalId);
        };
        CatalogPoller.prototype.poll = function () {
            var _this = this;
            $.ajax({
                url: this.feedUrl,
                success: function (data) { return _this.onCatalogIndexReceived(data); },
                error: function (_, textStatus, errorThrown) { return console.log("Failed to get catalog index " + _this.feedUrl + ": " + textStatus); }
            });
        };
        CatalogPoller.prototype.onTimer = function () {
            var _this = this;
            if (!this.lastPageUrl) {
                return;
            }
            $.ajax({
                url: this.lastPageUrl,
                success: function (data) { return _this.onLatestPageReceived(data); },
                error: function (_, textStatus, errorThrown) { return console.log("Failed to get the latest catalog page " + _this.lastPageUrl + ": " + textStatus); }
            });
        };
        CatalogPoller.prototype.onCatalogIndexReceived = function (catalogIndex) {
            var _this = this;
            catalogIndex.items.sort(function (a, b) { return -a.commitTimeStamp.localeCompare(b.commitTimeStamp); });
            var latestPage = catalogIndex.items[0];
            $.ajax({
                url: latestPage["@id"],
                success: function (data) { return _this.onLatestPageReceived(data); },
                error: function (_, textStatus, errorThrown) { return console.log("Failed to get catalog page " + latestPage["@id"] + ": " + textStatus); }
            });
        };
        CatalogPoller.prototype.onLatestPageReceived = function (page) {
            this.pageCallback(page);
            this.lastPageUrl = page["@id"];
            this.tryNextPage(page);
        };
        CatalogPoller.prototype.tryNextPage = function (page) {
            var _this = this;
            if (page.count < 540) {
                return;
            }
            var pageUrl = page["@id"];
            var match = /^(.*?)page(\d+)\.json$/.exec(pageUrl);
            if (!match) {
                return;
            }
            var pageIndex = parseInt(match[2], 10);
            var nextPage = pageIndex + 1;
            var url = match[1] + ("page" + nextPage + ".json");
            $.ajax({
                url: url,
                success: function (data) { return _this.onLatestPageReceived(data); }
            });
        };
        return CatalogPoller;
    }());

    var PackageState;
    (function (PackageState) {
        PackageState[PackageState["Unknown"] = 0] = "Unknown";
        PackageState[PackageState["PresentInCatalog"] = 1] = "PresentInCatalog";
        PackageState[PackageState["PresentInRegistration"] = 2] = "PresentInRegistration";
        PackageState[PackageState["PresentInSearch"] = 4] = "PresentInSearch";
        PackageState[PackageState["PresentInFlatContainer"] = 8] = "PresentInFlatContainer";
        PackageState[PackageState["Deleted"] = 65536] = "Deleted";
        PackageState[PackageState["CatalogOnly"] = 1] = "CatalogOnly";
        PackageState[PackageState["Available"] = 15] = "Available";
    })(PackageState || (PackageState = {}));
    var Package = (function () {
        function Package(viewState) {
            var _this = this;
            this.state = ko.observable(PackageState.Unknown);
            this.id = ko.observable("");
            this.normalizedVersion = ko.observable("");
            this.originalVersion = ko.observable("");
            this.galleryUrl = ko.pureComputed(function () {
                return _this.id()
                    ? (_this.normalizedVersion()
                        ? "https://www.nuget.org/packages/" + _this.id() + "/" + _this.normalizedVersion()
                        : "https://www.nuget.org/packages/" + _this.id())
                    : null;
            });
            this.catalogLeafUrl = ko.observable("javascript:;");
            this.registrationUrl = ko.observable("javascript:;");
            this.flatContainerUrl = ko.observable("javascript:;");
            this.searchUrl = ko.observable("javascript:;");
            this.catalogItemTimestamp = ko.observable(new Date());
            this.catalogItemAgeMinutes = ko.pureComputed(function () { return (viewState.now().valueOf() - _this.catalogItemTimestamp().valueOf()) / 60000; });
            this.listed = ko.observable(true);
        }
        return Package;
    }());
    var ViewState = (function () {
        function ViewState() {
            this.packages = ko.observableArray();
            this.now = ko.observable(new Date());
            this.packageLookup = {};
        }
        ViewState.prototype.getOrAddPackage = function (id) {
            var pkg = this.packageLookup[id];
            if (!pkg) {
                pkg = new Package(this);
                this.packages.unshift(pkg);
                this.packageLookup[id] = pkg;
            }
            return pkg;
        };
        return ViewState;
    }());
    var viewState = new ViewState();

    function removeVersionMetadata(version) {
        version = version.toLowerCase();
        var plusPos = version.indexOf('+');
        if (plusPos >= 0) {
            return version.substring(0, plusPos);
        }
        return version;
    }

    var CatalogItemType;
    (function (CatalogItemType) {
        CatalogItemType["PackageDetails"] = "nuget:PackageDetails";
        CatalogItemType["PackageDelete"] = "nuget:PackageDelete";
    })(CatalogItemType || (CatalogItemType = {}));
    var CatalogPageProcessor = (function () {
        function CatalogPageProcessor(pageItemProcessor, leafProcessor) {
            this.seenIds = {};
            this.pageItemProcessor = pageItemProcessor;
            this.leafProcessor = leafProcessor;
        }
        CatalogPageProcessor.prototype.processCatalogPage = function (page) {
            var _this = this;
            page.items.sort(function (a, b) { return -a.commitTimeStamp.localeCompare(b.commitTimeStamp); });
            var firstTime = false;
            if (Object.keys(this.seenIds).length === 0) {
                if (page.items.length > 50) {
                    page.items = page.items.slice(0, 50);
                }
                this.cutoffTime = new Date(page.items[page.items.length - 1].commitTimeStamp);
                firstTime = true;
            }
            page.items.reverse();
            page.items.forEach(function (pageItem) {
                var id = pageItem["@type"] + pageItem["@id"];
                if (!_this.seenIds[id]) {
                    _this.seenIds[id] = true;
                    var itemTs = new Date(pageItem.commitTimeStamp);
                    if (!firstTime && itemTs <= _this.cutoffTime) {
                        return;
                    }
                    var pkg_1 = viewState.getOrAddPackage(id);
                    var state = pageItem["@type"] === CatalogItemType.PackageDelete ? PackageState.Deleted : PackageState.CatalogOnly;
                    var packageId = pageItem["nuget:id"];
                    var packageVersion = pageItem["nuget:version"];
                    var leafUrl = pageItem["@id"];
                    pkg_1.state(state);
                    pkg_1.id(packageId);
                    pkg_1.originalVersion(packageVersion);
                    pkg_1.catalogLeafUrl(leafUrl);
                    pkg_1.catalogItemTimestamp(itemTs);
                    if (pageItem["@type"] === CatalogItemType.PackageDetails) {
                        $.ajax({
                            url: pageItem["@id"],
                            success: function (data) { return _this.processPackageDetails(pkg_1, data); },
                            error: function (_, textStatus, errorThrown) { return console.log("Failed to get the package details " + pageItem["@id"] + ": " + textStatus); }
                        });
                        if (_this.pageItemProcessor) {
                            _this.pageItemProcessor(pageItem, pkg_1);
                        }
                    }
                }
            });
        };
        CatalogPageProcessor.prototype.processPackageDetails = function (pkg, data) {
            pkg.normalizedVersion(removeVersionMetadata(data.version));
            if (this.leafProcessor) {
                this.leafProcessor(data, pkg);
            }
        };
        return CatalogPageProcessor;
    }());

    var SemVer = (function () {
        function SemVer() {
            this.major = 0;
            this.minor = 0;
            this.patch = 0;
            this.build = 0;
            this.preRelease = [];
            this.metadata = null;
        }
        SemVer.prototype.compare = function (other) {
            if (this.major < other.major) {
                return -1;
            }
            if (this.major > other.major) {
                return 1;
            }
            if (this.minor < other.minor) {
                return -1;
            }
            if (this.minor > other.minor) {
                return 1;
            }
            if (this.patch < other.patch) {
                return -1;
            }
            if (this.patch > other.patch) {
                return 1;
            }
            if (this.build < other.build) {
                return -1;
            }
            if (this.build > other.build) {
                return 1;
            }
            var numIdentifiers = Math.min(this.preRelease.length, other.preRelease.length);
            for (var i = 0; i < numIdentifiers; ++i) {
                var our = this.preRelease[i];
                var their = other.preRelease[i];
                if (typeof (our) === "number" && typeof (their) === "string") {
                    return -1;
                }
                if (typeof (our) === "string" && typeof (their) === "number") {
                    return 1;
                }
                if (typeof (our) === "string" && typeof (their) === "string") {
                    var cmp = our.localeCompare(their);
                    if (cmp !== 0) {
                        return cmp;
                    }
                }
                if (typeof (our) === "number" && typeof (their) === "number") {
                    var cmp = our - their;
                    if (cmp !== 0) {
                        return cmp;
                    }
                }
            }
            return this.preRelease.length - other.preRelease.length;
        };
        SemVer.tryParse = function (version) {
            var result = new SemVer();
            var re = /^(\d+)\.(\d+)\.(\d+)(\.\d+)?(-[^+]+)?(\+.*)?$/;
            var match = re.exec(version);
            if (!match) {
                return null;
            }
            result.major = parseInt(match[1], 10);
            if (isNaN(result.major)) {
                return null;
            }
            result.minor = parseInt(match[2], 10);
            if (isNaN(result.minor)) {
                return null;
            }
            result.patch = parseInt(match[3], 10);
            if (isNaN(result.patch)) {
                return null;
            }
            if (match[4]) {
                var buildVersionStr = match[4].substring(1);
                result.build = parseInt(buildVersionStr, 10);
                if (isNaN(result.build)) {
                    return null;
                }
            }
            if (match[5]) {
                var preReleaseData = match[5].substring(1);
                var split = preReleaseData.split(/\.+/);
                for (var _i = 0, split_1 = split; _i < split_1.length; _i++) {
                    var element = split_1[_i];
                    var numeric = parseInt(element, 10);
                    if (isNaN(numeric)) {
                        result.preRelease.push(element);
                    }
                    else {
                        result.preRelease.push(numeric);
                    }
                }
            }
            if (match[6]) {
                result.metadata = match[6].substring(1);
            }
            return result;
        };
        return SemVer;
    }());

    var ListItem = (function () {
        function ListItem(object) {
            this.object = object;
            this.created = new Date();
        }
        return ListItem;
    }());
    var IntervalPoller = (function () {
        function IntervalPoller(interval, callback, maxAge) {
            var _this = this;
            this.objects = [];
            this.callback = callback;
            this.interval = interval;
            this.maxAge = maxAge;
            this.intervalHandle = window.setInterval(function () { return _this.onTimer(); }, this.interval);
        }
        IntervalPoller.prototype.add = function (obj) {
            this.objects.push(new ListItem(obj));
        };
        IntervalPoller.prototype.remove = function (obj) {
            var index = this.objects.findIndex(function (i) { return i.object === obj; });
            if (index >= 0) {
                this.objects.splice(index, 1);
                return true;
            }
            return false;
        };
        IntervalPoller.prototype.stop = function () {
            window.clearInterval(this.intervalHandle);
        };
        IntervalPoller.prototype.onTimer = function () {
            var objectsToDelete = [];
            for (var _i = 0, _a = this.objects; _i < _a.length; _i++) {
                var o = _a[_i];
                if (Date.now() - o.created.valueOf() > this.maxAge) {
                    objectsToDelete.push(o.object);
                }
                else {
                    this.callback(o.object);
                }
            }
            for (var _b = 0, objectsToDelete_1 = objectsToDelete; _b < objectsToDelete_1.length; _b++) {
                var d = objectsToDelete_1[_b];
                this.remove(d);
            }
        };
        return IntervalPoller;
    }());

    var PackageInfo = (function () {
        function PackageInfo() {
        }
        return PackageInfo;
    }());
    var RegistrationPoller = (function () {
        function RegistrationPoller(baseUrl) {
            var _this = this;
            this.baseUrl = baseUrl;
            this.poller = new IntervalPoller(30000, function (pi) { return _this.doRequest(pi); }, 30 * 60 * 1000);
        }
        RegistrationPoller.prototype.add = function (leaf, pkg) {
            var pi = new PackageInfo();
            pi.id = leaf["nuget:id"].toLowerCase();
            pi.normalizedVersion = leaf["nuget:version"].toLowerCase();
            pi.expectedLeafUrl = leaf["@id"];
            pi.package = pkg;
            this.poller.add(pi);
            this.doRequest(pi);
        };
        RegistrationPoller.prototype.doRequest = function (pi) {
            var _this = this;
            var url = "" + this.baseUrl + pi.id + "/index.json";
            pi.package.registrationUrl(url);
            $.ajax({
                url: url,
                success: function (data) { return _this.onReceivedRegistrationIndex(pi, data); },
                error: function (_, textStatus, errorThrown) { return console.log("Failed to get the registration blob " + url + ": " + textStatus); }
            });
        };
        RegistrationPoller.prototype.onReceivedRegistrationIndex = function (pi, data) {
            var _this = this;
            var version = SemVer.tryParse(pi.normalizedVersion);
            if (!version) {
                return;
            }
            var page = RegistrationPoller.findPage(version, data.items);
            if (!page) {
                return;
            }
            if (page.items) {
                this.processRegistrationPage(pi, page);
            }
            else {
                $.ajax({
                    url: page["@id"],
                    success: function (data) { return _this.processRegistrationPage(pi, data); },
                    error: function (_, textStatus, errorThrown) { return console.log("Failed to get the registration page " + page["@id"] + ": " + textStatus); }
                });
            }
        };
        RegistrationPoller.findPage = function (version, pages) {
            for (var _i = 0, pages_1 = pages; _i < pages_1.length; _i++) {
                var page = pages_1[_i];
                var lower = SemVer.tryParse(page.lower);
                if (!lower) {
                    console.warn("Failed to parse registaration page's lower version: " + page.lower + " (" + page["@id"] + ")");
                    continue;
                }
                var upper = SemVer.tryParse(page.upper);
                if (!upper) {
                    console.warn("Failed to parse registration page's upper version: " + page.upper + " (" + page["@id"] + ")");
                }
                if (lower.compare(version) <= 0 && version.compare(upper) <= 0) {
                    return page;
                }
            }
            return null;
        };
        RegistrationPoller.prototype.processRegistrationPage = function (pi, page) {
            for (var _i = 0, _a = page.items; _i < _a.length; _i++) {
                var leaf = _a[_i];
                if (leaf.catalogEntry["@id"] === pi.expectedLeafUrl) {
                    var state = pi.package.state();
                    state |= PackageState.PresentInRegistration;
                    pi.package.state(state);
                    pi.package.registrationUrl(page["@id"]);
                    this.poller.remove(pi);
                }
            }
        };
        return RegistrationPoller;
    }());

    var FlatContainerPoller = (function () {
        function FlatContainerPoller(baseUrl) {
            var _this = this;
            this.baseUrl = baseUrl;
            this.poller = new IntervalPoller(30000, function (fci) { return _this.doRequest(fci); }, 30 * 60 * 1000);
        }
        FlatContainerPoller.prototype.add = function (packageId, normalizedVersion, pkg) {
            var id = packageId.toLowerCase();
            var ver = removeVersionMetadata(normalizedVersion.toLowerCase());
            var own = {
                id: id,
                normalizedVersion: ver,
                package: pkg,
                url: "",
            };
            this.poller.add(own);
            this.doRequest(own);
        };
        FlatContainerPoller.prototype.doRequest = function (fci) {
            var _this = this;
            fci.url = "" + this.baseUrl + fci.id + "/" + fci.normalizedVersion + "/" + fci.id + "." + fci.normalizedVersion + ".nupkg";
            fci.package.flatContainerUrl(fci.url);
            $.ajax({
                url: fci.url,
                method: "HEAD",
                success: function (_) { return _this.onNupkgExists(fci); }
            });
        };
        FlatContainerPoller.prototype.onNupkgExists = function (fci) {
            this.poller.remove(fci);
            var state = fci.package.state();
            state |= PackageState.PresentInFlatContainer;
            fci.package.state(state);
        };
        return FlatContainerPoller;
    }());

    var SearchPoller = (function () {
        function SearchPoller(baseUrl) {
            var _this = this;
            this.baseUrl = baseUrl;
            this.poller = new IntervalPoller(30000, function (i) { return _this.doRequest(i); }, 30 * 60 * 1000);
        }
        SearchPoller.prototype.add = function (id, normalizedVersion, isListed, pkg) {
            var info = {
                id: id.toLowerCase(),
                version: normalizedVersion.toLowerCase(),
                isListed: isListed,
                isPrerelease: false,
                package: pkg,
            };
            var semver = SemVer.tryParse(info.version);
            if (!semver) {
                console.warn("Failed to parse the version for " + id + " " + normalizedVersion);
                return;
            }
            else {
                if (semver.preRelease) {
                    info.isPrerelease = true;
                }
            }
            this.poller.add(info);
            this.doRequest(info);
        };
        SearchPoller.prototype.doRequest = function (info) {
            var _this = this;
            var url = this.baseUrl + "?q=PackageId:" + info.id + "&semVerLevel=2.0.0&prerelease=" + info.isPrerelease;
            info.package.searchUrl(url);
            $.ajax({
                url: url,
                success: function (data) { return _this.processSearchResult(info, data, url); },
                error: function (_, textStatus, errorThrown) { return console.log("Failed to get the search response " + url + ": " + textStatus + " " + errorThrown); }
            });
        };
        SearchPoller.prototype.processSearchResult = function (info, data, url) {
            if (data.totalHits === 0) {
                if (!info.isListed) {
                    this.markFound(info);
                }
                return;
            }
            if (data.totalHits !== 1) {
                console.warn("Unexpected number of responses to " + url + ": " + data.totalHits);
                this.poller.remove(info);
            }
            var result = data.data[0];
            var idx = result.versions.findIndex(function (e) { return e.version === info.version; });
            if ((info.isListed && idx >= 0) || (!info.isListed && idx < 0)) {
                this.markFound(info);
            }
        };
        SearchPoller.prototype.markFound = function (info) {
            this.poller.remove(info);
            var state = info.package.state();
            state |= PackageState.PresentInSearch;
            info.package.state(state);
        };
        return SearchPoller;
    }());

    window.addEventListener("DOMContentLoaded", function (event) {
        var catalogPoller;
        var registrationPoller;
        var pageProcessor;
        var flatContainerPoller;
        var searchPoller;
        load("https://api.nuget.org/v3/index.json", onServiceIndexLoad, function (status, error) { return console.log(status); });
        function onServiceIndexLoad(serviceIndex) {
            var catalogResource = serviceIndex.resources.filter(function (e) { return e["@type"] === "Catalog/3.0.0"; })[0];
            var registrationBase = serviceIndex.resources.filter(function (e) { return e["@type"] === "RegistrationsBaseUrl/3.6.0"; })[0];
            var flatContainerBase = serviceIndex.resources.filter(function (e) { return e["@type"] === "PackageBaseAddress/3.0.0"; })[0];
            var searchService = serviceIndex.resources.filter(function (e) { return e["@type"] === "SearchQueryService"; })[0];
            registrationPoller = new RegistrationPoller(registrationBase["@id"]);
            flatContainerPoller = new FlatContainerPoller(flatContainerBase["@id"]);
            searchPoller = new SearchPoller(searchService["@id"]);
            pageProcessor = new CatalogPageProcessor(function (pageItem, pkg) { return pageItemProcessor(pageItem, pkg); }, function (leaf, pkg) { return catalogLeafProcessor(leaf, pkg); });
            catalogPoller = new CatalogPoller(catalogResource["@id"], 30000, function (page) { return pageProcessor.processCatalogPage(page); });
        }
        function pageItemProcessor(pageItem, pkg) {
            registrationPoller.add(pageItem, pkg);
            flatContainerPoller.add(pageItem["nuget:id"], pageItem["nuget:version"], pkg);
        }
        function catalogLeafProcessor(leaf, pkg) {
            searchPoller.add(leaf.id, leaf.version, leaf.listed, pkg);
        }
        function refreshTimeAgo() {
            viewState.now(new Date());
        }
        ko.applyBindings(viewState, document.getElementById("nuget-container"));
        var koTimeAgoIntervalId = window.setInterval(refreshTimeAgo, 10000);
    });

}());
