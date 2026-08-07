const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]);
const HEIC_TYPES = new Set(["image/heic", "image/heif"]);
const HEIC_EXTENSIONS = new Set([".heic", ".heif"]);
const HEIC_CONVERTED_TYPE = "image/jpeg";
const HEIC_CONVERTED_EXTENSION = ".jpg";
const HEIC_CONVERTED_QUALITY = 0.9;
const TOKEN_KEY = "imageHost.jwt";
const API_BASE_KEY = "imageHost.apiBase";
const APP_CONFIG = window.APP_CONFIG && typeof window.APP_CONFIG === "object" ? window.APP_CONFIG : {};
const CONFIGURED_API_BASE = normalizeApiBase(APP_CONFIG.apiBaseUrl);
const TRUSTED_API_ORIGINS = buildTrustedApiOrigins(APP_CONFIG, CONFIGURED_API_BASE);

const state = {
  token: localStorage.getItem(TOKEN_KEY) || "",
  me: null,
  apiBase: getInitialApiBase(),
  imageFilterTags: [],
  tags: [],
  registrationEnabled: true
};

const $ = (id) => document.getElementById(id);

document.addEventListener("DOMContentLoaded", () => {
  bindForms();
  bindTabs();
  refreshSession();
});

function getInitialApiBase() {
  const stored = localStorage.getItem(API_BASE_KEY);
  if (stored) {
    sanitizeApiBase(stored);
    localStorage.removeItem(API_BASE_KEY);
  }
  return defaultApiBase();
}

function defaultApiBase() {
  return CONFIGURED_API_BASE || sameOriginApiBase();
}

function sameOriginApiBase() {
  return `${window.location.origin}/api`;
}

function normalizeApiBase(value) {
  if (typeof value !== "string") return "";
  const candidate = value.trim().replace(/\/+$/, "");
  if (!candidate) return "";
  try {
    const url = new URL(candidate);
    if (!isHttpUrl(url)) return "";
    return url.href.replace(/\/+$/, "");
  } catch {
    return "";
  }
}

function buildTrustedApiOrigins(config, configuredApiBase) {
  const origins = new Set([window.location.origin]);
  addTrustedOrigin(origins, configuredApiBase);
  const configuredOrigins = Array.isArray(config.trustedApiOrigins) ? config.trustedApiOrigins : [];
  configuredOrigins.forEach((origin) => addTrustedOrigin(origins, origin));
  return [...origins];
}

function addTrustedOrigin(origins, value) {
  const origin = normalizeApiOrigin(value);
  if (origin) origins.add(origin);
}

function normalizeApiOrigin(value) {
  if (typeof value !== "string") return "";
  const candidate = value.trim();
  if (!candidate) return "";
  try {
    const url = new URL(candidate);
    return isHttpUrl(url) ? url.origin : "";
  } catch {
    return "";
  }
}

function isHttpUrl(url) {
  return url.protocol === "http:" || url.protocol === "https:";
}

function isTrustedApiOrigin(url) {
  try {
    const origin = normalizeApiOrigin(url);
    return !!origin && TRUSTED_API_ORIGINS.includes(origin);
  } catch {
    return false;
  }
}

function sanitizeApiBase(value) {
  const normalized = normalizeApiBase(value);
  return normalized && isTrustedApiOrigin(normalized) ? normalized : defaultApiBase();
}

function trustedApiBase() {
  const sanitized = sanitizeApiBase(state.apiBase);
  if (sanitized !== state.apiBase) {
    state.apiBase = sanitized;
    localStorage.removeItem(API_BASE_KEY);
  }
  return sanitized;
}

function authorizationHeaderForUrl(url) {
  return state.token && isTrustedApiOrigin(url) ? `Bearer ${state.token}` : "";
}

function setAuthorizationHeader(target, url) {
  const value = authorizationHeaderForUrl(url);
  if (!value) return false;
  if (typeof target.setRequestHeader === "function") target.setRequestHeader("Authorization", value);
  else target.set("Authorization", value);
  return true;
}

function bindForms() {
  $("registerForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const body = formJson(form);
    setMessage("registerMessage", "Creating account...");
    try {
      const result = await apiFetch("/register", { method: "POST", body });
      const status = pick(result, "approvalStatus") || "pending";
      const firstAdmin = Boolean(pick(result, "isFirstAdmin"));
      setMessage(
        "registerMessage",
        firstAdmin
          ? "Account created as the first approved admin. Log in to continue."
          : `Account created. Status: ${status}. Awaiting admin approval before upload.`,
        "ok"
      );
      form.reset();
    } catch (error) {
      setMessage("registerMessage", error.message, "error");
    }
  });

  $("loginForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    setMessage("loginMessage", "Signing in...");
    try {
      const result = await apiFetch("/login", { method: "POST", body: formJson(form) });
      state.token = pick(result, "token") || result;
      localStorage.setItem(TOKEN_KEY, state.token);
      state.me = normalizeUser(pick(result, "user")) || null;
      form.reset();
      await refreshSession();
    } catch (error) {
      setMessage("loginMessage", error.message, "error");
    }
  });

  $("logoutButton").addEventListener("click", async () => {
    try {
      if (state.token) await apiFetch("/logout", { method: "POST", auth: true, allowNoContent: true });
    } catch {
      // Logging out locally is still correct if the backend is unavailable.
    }
    state.token = "";
    state.me = null;
    localStorage.removeItem(TOKEN_KEY);
    setMessage("loginMessage", "");
    setMessage("registerMessage", "");
    refreshUi();
  });

  $("uploadForm").addEventListener("submit", uploadImage);
  bindUploadDropZone();
  $("refreshImages").addEventListener("click", loadImages);
  $("tagFilterForm").addEventListener("submit", (event) => {
    event.preventDefault();
    setImageFilter(parseTags($("tagFilterInput").value));
  });
  $("clearTagFilter").addEventListener("click", () => setImageFilter([]));
  $("refreshTags").addEventListener("click", loadTags);
  $("createKey").addEventListener("click", createApiKey);
  $("refreshKeys").addEventListener("click", loadApiKeys);
  $("refreshUsers").addEventListener("click", loadUsers);
  $("registrationEnabledToggle").addEventListener("change", updateRegistrationEnabled);
}

function bindUploadDropZone() {
  const dropZone = $("dropZone");
  const imageFile = $("imageFile");

  dropZone.addEventListener("keydown", (event) => {
    if (event.target === imageFile) return;
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    imageFile.click();
  });

  imageFile.addEventListener("change", () => updateSelectedFileName(imageFile.files));

  for (const eventName of ["dragenter", "dragover"]) {
    dropZone.addEventListener(eventName, (event) => {
      event.preventDefault();
      dropZone.classList.add("dragover");
    });
  }

  dropZone.addEventListener("dragleave", (event) => {
    if (!dropZone.contains(event.relatedTarget)) dropZone.classList.remove("dragover");
  });

  dropZone.addEventListener("drop", (event) => {
    event.preventDefault();
    dropZone.classList.remove("dragover");
    const droppedFiles = Array.from(event.dataTransfer.files);
    if (!droppedFiles.length) return;

    const files = new DataTransfer();
    for (const file of droppedFiles) files.items.add(file);
    imageFile.files = files.files;
    updateSelectedFileName(imageFile.files);
  });
}

function bindTabs() {
  document.querySelectorAll("[data-tab]").forEach((button) => {
    button.addEventListener("click", () => showTab(button.dataset.tab));
  });
}

async function refreshSession() {
  await loadSiteConfig();
  if (!state.token) {
    refreshUi();
    return;
  }
  try {
    state.me = normalizeUser(await apiFetch("/me", { auth: true }));
  } catch (error) {
    state.token = "";
    state.me = null;
    localStorage.removeItem(TOKEN_KEY);
    setMessage("loginMessage", `Session expired or unavailable: ${error.message}`, "error");
  }
  refreshUi();
}

function refreshUi() {
  const signedIn = Boolean(state.token && state.me);
  $("authPanel").classList.toggle("hidden", signedIn);
  $("appPanel").classList.toggle("hidden", !signedIn);
  $("logoutButton").classList.toggle("hidden", !signedIn);
  $("adminTab").classList.toggle("hidden", !signedIn || !state.me?.isAdmin);

  if (!signedIn) {
    $("sessionStatus").textContent = "Signed out";
    return;
  }

  const status = state.me.approvalStatus || "unknown";
  $("sessionStatus").textContent = `${state.me.username} · ${status}${state.me.isAdmin ? " · admin" : ""}`;
  const approved = status.toLowerCase() === "approved";
  $("approvalNotice").classList.toggle("hidden", approved);
  $("uploadButton").disabled = !approved;
  $("createKey").disabled = !approved;

  if (!state.me.isAdmin && currentTab() === "admin") showTab("upload");
  if (currentTab() === "tags") loadTags();
  if (currentTab() === "keys") loadApiKeys();
  if (currentTab() === "images") loadImages();
  if (currentTab() === "admin" && state.me.isAdmin) loadUsers();
}

async function loadSiteConfig() {
  try {
    const config = await apiFetch("/config");
    state.registrationEnabled = pick(config, "registrationEnabled") !== false;
  } catch {
    state.registrationEnabled = true;
  }
  applyRegistrationConfig();
  syncAdminSettingsControl();
}

function applyRegistrationConfig() {
  $("registerPanel").classList.toggle("hidden", !state.registrationEnabled);
  $("authPanel").classList.toggle("auth-single", !state.registrationEnabled);
}

function syncAdminSettingsControl() {
  const toggle = $("registrationEnabledToggle");
  toggle.checked = state.registrationEnabled;
}

function currentTab() {
  return document.querySelector(".tabs button.active")?.dataset.tab || "upload";
}

function showTab(name) {
  document.querySelectorAll(".tabs button").forEach((button) => {
    button.classList.toggle("active", button.dataset.tab === name);
  });
  for (const tab of ["upload", "images", "tags", "keys", "admin"]) {
    const panelId = tab === "admin" ? "adminTabPanel" : `${tab}Tab`;
    $(panelId).classList.toggle("hidden", tab !== name);
  }
  if (name === "images") loadImages();
  if (name === "tags") loadTags();
  if (name === "keys") loadApiKeys();
  if (name === "admin") loadUsers();
}

async function uploadImage(event) {
  event.preventDefault();
  await handleSelectedFiles($("imageFile").files);
}

function validateUploadFile(file) {
  return (ALLOWED_TYPES.has(file.type) || isHeicFile(file)) && file.size <= MAX_UPLOAD_BYTES;
}

function isHeicFile(file) {
  const type = String(file?.type || "").toLowerCase();
  const name = String(file?.name || "").toLowerCase();
  return HEIC_TYPES.has(type) || Array.from(HEIC_EXTENSIONS).some((extension) => name.endsWith(extension));
}

function partitionUploadFiles(fileList) {
  const supported = [];
  const skipped = [];
  Array.from(fileList || []).forEach((file, index) => {
    (validateUploadFile(file) ? supported : skipped).push({ file, index });
  });
  return { supported, skipped };
}

async function handleSelectedFiles(fileList) {
  const uploadTags = parseTags($("uploadTags").value);
  const { supported, skipped } = partitionUploadFiles(fileList);
  $("uploadResult").replaceChildren();
  $("uploadResult").classList.add("hidden");

  if (!supported.length) {
    setMessage("uploadMessage", "No supported images found. Use JPEG, PNG, WebP, HEIC, or HEIF up to 25 MB.", "error");
    $("uploadForm").reset();
    updateSelectedFileName();
    return;
  }

  $("uploadProgress").classList.remove("hidden");
  let uploaded = 0;
  let failed = 0;
  let taggingFailed = 0;
  const totalFiles = supported.length + skipped.length;

  for (const { file, index } of supported) {
    $("uploadProgress").value = 0;
    setMessage("uploadMessage", `${isHeicFile(file) ? "Converting" : "Uploading"} ${index + 1} of ${totalFiles}: ${file.name}...`);
    try {
      const result = isHeicFile(file)
        ? await convertAndUploadHeicFile(file, index, totalFiles)
        : await uploadRawFile(file);
      const image = normalizeImage(result);
      uploaded += 1;
      if (uploadTags.length) {
        try {
          if (!image.imageId) throw new Error("Upload response did not include an image ID.");
          await apiFetch(`/images/${encodeURIComponent(image.imageId)}/tags`, { method: "POST", auth: true, body: { tags: uploadTags } });
        } catch {
          taggingFailed += 1;
        }
      }
      renderImageResult("uploadResult", image, true);
    } catch {
      failed += 1;
    }
  }

  const message = uploadSummaryMessage(uploaded, skipped.length, failed, uploadTags.length, taggingFailed);
  const level = uploaded ? "ok" : "error";
  setMessage("uploadMessage", message, level);
  $("uploadProgress").classList.add("hidden");
  $("uploadForm").reset();
  updateSelectedFileName();
}

function uploadSummaryMessage(uploaded, skipped, failed, tagCount = 0, taggingFailed = 0) {
  const tagNote = uploadTagSummaryMessage(uploaded, tagCount, taggingFailed);
  if (!skipped && !failed) {
    const message = uploaded === 1 ? "Uploaded 1 image." : `Uploaded ${uploaded} images.`;
    return tagNote ? `${message.slice(0, -1)}; ${tagNote}.` : message;
  }

  const parts = [`Uploaded ${uploaded}`];
  if (skipped) parts.push(`skipped ${skipped} unsupported ${skipped === 1 ? "file" : "files"}`);
  if (failed) parts.push(`${failed} failed`);
  return tagNote ? `${parts.join(", ")}; ${tagNote}.` : `${parts.join(", ")}.`;
}

function uploadTagSummaryMessage(uploaded, tagCount, taggingFailed) {
  if (!tagCount || !uploaded) return "";
  if (taggingFailed) return `tagging failed for ${taggingFailed}`;
  return `tagged with ${tagCount} ${tagCount === 1 ? "tag" : "tags"}`;
}

function uploadRawFile(file) {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    const url = apiUrl("/images");
    request.open("POST", url);
    setAuthorizationHeader(request, url);
    request.setRequestHeader("X-File-Name", file.name);
    request.setRequestHeader("Content-Type", file.type);
    request.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) $("uploadProgress").value = Math.round((event.loaded / event.total) * 100);
    });
    request.addEventListener("load", () => {
      if (request.status >= 200 && request.status < 300) {
        resolve(request.responseText ? JSON.parse(request.responseText) : {});
      } else {
        reject(new Error(parseErrorText(request.responseText, request.status)));
      }
    });
    request.addEventListener("error", () => reject(new Error("Upload failed. Check the API base URL and CORS settings.")));
    request.send(file);
  });
}

async function convertAndUploadHeicFile(file, index, totalFiles) {
  if (typeof window.heic2any !== "function") {
    throw new Error("HEIC converter is unavailable. Refresh the page and try again.");
  }

  $("uploadProgress").removeAttribute("value");
  setMessage("uploadMessage", `Converting ${index + 1} of ${totalFiles}: ${file.name}...`);
  const converted = await window.heic2any({
    blob: file,
    toType: HEIC_CONVERTED_TYPE,
    quality: HEIC_CONVERTED_QUALITY
  });
  const convertedBlob = Array.isArray(converted) ? converted[0] : converted;
  if (!(convertedBlob instanceof Blob)) {
    throw new Error("HEIC conversion did not produce an image blob.");
  }

  const convertedFile = new File([convertedBlob], convertedImageFileName(file.name), { type: HEIC_CONVERTED_TYPE });
  $("uploadProgress").value = 0;
  setMessage("uploadMessage", `Uploading converted image ${index + 1} of ${totalFiles}: ${convertedFile.name}...`);
  return uploadMultipartFile(convertedFile, file);
}

function convertedImageFileName(fileName) {
  const safeName = String(fileName || "image");
  const dot = safeName.lastIndexOf(".");
  const baseName = dot > 0 ? safeName.slice(0, dot) : safeName;
  return `${baseName}${HEIC_CONVERTED_EXTENSION}`;
}

function uploadMultipartFile(imageFile, sourceOriginal) {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append("image", imageFile, imageFile.name);
    form.append("sourceOriginal", sourceOriginal, sourceOriginal.name);

    const request = new XMLHttpRequest();
    const url = apiUrl("/images");
    request.open("POST", url);
    setAuthorizationHeader(request, url);
    request.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) $("uploadProgress").value = Math.round((event.loaded / event.total) * 100);
    });
    request.addEventListener("load", () => {
      if (request.status >= 200 && request.status < 300) {
        resolve(request.responseText ? JSON.parse(request.responseText) : {});
      } else {
        reject(new Error(parseErrorText(request.responseText, request.status)));
      }
    });
    request.addEventListener("error", () => reject(new Error("Upload failed. Check the API base URL and CORS settings.")));
    request.send(form);
  });
}

function updateSelectedFileName(file) {
  const files = file && typeof file.length === "number" ? Array.from(file) : file ? [file] : [];
  if (!files.length) {
    $("selectedFileName").textContent = "No file selected";
  } else if (files.length === 1) {
    $("selectedFileName").textContent = `Selected: ${files[0].name}`;
  } else {
    $("selectedFileName").textContent = `Selected: ${files.length} files`;
  }
}

async function loadImages() {
  setMessage("imagesMessage", "Loading images...");
  $("imagesList").replaceChildren();
  renderActiveTagFilters();
  try {
    const path = state.imageFilterTags.length
      ? `/images?tags=${encodeURIComponent(state.imageFilterTags.join(","))}`
      : "/images";
    const result = await apiFetch(path, { auth: true });
    const images = asArray(result).map(normalizeImage);
    await hydrateImageTags(images);
    if (!images.length) {
      setMessage("imagesMessage", state.imageFilterTags.length ? "No images match those tags." : "No uploads yet.", "ok");
      return;
    }
    setMessage("imagesMessage", "");
    for (const image of images) $("imagesList").append(renderImageCard(image));
  } catch (error) {
    const missing = error.status === 404 || error.status === 405;
    setMessage(
      "imagesMessage",
      missing
        ? "The backend image-list endpoint (GET /api/images) is not available yet. Upload still works; listing needs backend support."
        : error.message,
      missing ? "" : "error"
    );
  }
}

function setImageFilter(tags) {
  state.imageFilterTags = uniqueTags(tags);
  $("tagFilterInput").value = state.imageFilterTags.join(", ");
  renderActiveTagFilters();
  if (currentTab() !== "images") {
    showTab("images");
    return;
  }
  loadImages();
}

function renderActiveTagFilters() {
  const container = $("activeTagFilters");
  container.replaceChildren();
  for (const tag of state.imageFilterTags) {
    container.append(tagPill(tag, () => setImageFilter(state.imageFilterTags.filter((item) => item !== tag))));
  }
}

async function hydrateImageTags(images) {
  for (const image of images) image.tags = uniqueTags([...image.tags, ...state.imageFilterTags]);
}

async function loadTags() {
  setMessage("tagsMessage", "Loading tags...");
  $("tagsList").replaceChildren();
  try {
    const tags = await fetchTags();
    if (!tags.length) {
      setMessage("tagsMessage", "No tags yet. Add tags from My Images.", "ok");
      return;
    }
    setMessage("tagsMessage", "");
    for (const tag of tags) $("tagsList").append(renderTag(tag));
  } catch (error) {
    const missing = error.status === 404 || error.status === 405;
    setMessage(
      "tagsMessage",
      missing ? "The backend tags endpoint (GET /api/tags) is not available yet." : error.message,
      missing ? "" : "error"
    );
  }
}

async function fetchTags() {
  const tags = asArray(await apiFetch("/tags", { auth: true })).map(normalizeTag).filter((tag) => tag.name);
  state.tags = tags;
  return tags;
}

async function createApiKey() {
  $("newKey").classList.add("hidden");
  setMessage("keysMessage", "Creating API key...");
  try {
    const result = await apiFetch("/api-keys", { method: "POST", auth: true });
    const secret = pick(result, "apiKey") || pick(result, "secret") || "";
    $("newKey").replaceChildren(
      textNode("Copy now. This secret is shown once:"),
      copyRow("API key", secret)
    );
    $("newKey").classList.remove("hidden");
    setMessage("keysMessage", "API key created.", "ok");
    loadApiKeys();
  } catch (error) {
    setMessage("keysMessage", error.message, "error");
  }
}

async function loadApiKeys() {
  setMessage("keysMessage", "Loading API keys...");
  $("keysList").replaceChildren();
  try {
    const keys = asArray(await apiFetch("/api-keys", { auth: true }));
    if (!keys.length) {
      setMessage("keysMessage", "No API keys yet.", "ok");
      return;
    }
    setMessage("keysMessage", "");
    for (const key of keys) $("keysList").append(renderKey(key));
  } catch (error) {
    setMessage("keysMessage", error.message, "error");
  }
}

async function revokeApiKey(keyId) {
  if (!confirm("Revoke this API key? Existing clients using it will stop working.")) return;
  try {
    await apiFetch(`/api-keys/${encodeURIComponent(keyId)}`, { method: "DELETE", auth: true, allowNoContent: true });
    await loadApiKeys();
  } catch (error) {
    setMessage("keysMessage", error.message, "error");
  }
}

async function loadUsers() {
  if (!state.me?.isAdmin) return;
  setMessage("adminMessage", "Loading settings and users...");
  $("usersList").replaceChildren();
  await loadSiteConfig();
  try {
    const users = asArray(await apiFetch("/admin/users", { auth: true })).map(normalizeUser);
    setMessage("adminMessage", users.length ? "" : "No users found.", users.length ? "" : "ok");
    for (const user of users) $("usersList").append(renderUser(user));
  } catch (error) {
    setMessage("adminMessage", error.message, "error");
  }
}

async function updateRegistrationEnabled(event) {
  const checkbox = event.currentTarget;
  const registrationEnabled = checkbox.checked;
  checkbox.disabled = true;
  setMessage("adminMessage", "Saving registration setting...");
  try {
    const result = await apiFetch("/admin/settings", { method: "PUT", body: { registrationEnabled }, auth: true });
    state.registrationEnabled = pick(result, "registrationEnabled") !== false;
    applyRegistrationConfig();
    syncAdminSettingsControl();
    setMessage("adminMessage", state.registrationEnabled ? "Registration enabled." : "Registration disabled.", "ok");
  } catch (error) {
    checkbox.checked = state.registrationEnabled;
    setMessage("adminMessage", error.message, "error");
  } finally {
    checkbox.disabled = false;
  }
}

async function adminAction(userId, action, method = "POST") {
  try {
    await apiFetch(`/admin/users/${encodeURIComponent(userId)}/${action}`, { method, auth: true });
    await loadUsers();
  } catch (error) {
    setMessage("adminMessage", error.message, "error");
  }
}

function renderImageResult(containerId, image, append = false) {
  const container = $(containerId);
  if (!append) container.replaceChildren();
  container.append(renderImageResultCard(image));
  container.classList.remove("hidden");
}

function renderImageResultCard(image) {
  const card = element("article", { className: "result-card" });
  card.append(
    imageElement(image),
    linkRow("Original", image.originalUrl || "")
  );
  return card;
}

function renderImageCard(image) {
  const collapsedTags = renderCollapsedImageTags(image);
  const expandedImage = imageElement(image);
  expandedImage.loading = "eager";
  const expandedPanel = element("div", { className: "image-card-overlay" },
    linkRow("Original", image.originalUrl || ""),
    sourceOriginalAction(image),
    renderImageTags(image, () => renderCollapsedImageTags(image, collapsedTags))
  );
  const card = element("article", {
    className: "image-card",
    role: "button",
    tabIndex: 0,
    ariaExpanded: "false"
  });
  card.append(
    imageElement(image),
    collapsedTags,
    expandedPanel
  );
  expandedPanel.prepend(
    expandedImage,
    element("p", { className: "image-card-title" }, image.fileName || image.imageId || "")
  );
  if (image.variants.length) {
    const variantRows = image.variants.map((variant) => linkRow(`${variant.width}px`, variant.url));
    expandedPanel.append(
      element(
        "details",
        { className: "variant-details" },
        element("summary", {}, `Reduced sizes (${image.variants.length})`),
        ...variantRows
      )
    );
  }
  const deleteButton = element("button", { type: "button", className: "danger" }, "Delete");
  deleteButton.addEventListener("click", () => deleteOwnImage(image, card, deleteButton));
  expandedPanel.append(element("div", { className: "card-actions" }, deleteButton));
  card.addEventListener("click", (event) => {
    if (!shouldToggleImageCard(event.target)) return;
    toggleImageCard(card);
  });
  card.addEventListener("keydown", (event) => {
    if ((event.key !== "Enter" && event.key !== " ") || event.target !== card) return;
    event.preventDefault();
    toggleImageCard(card);
  });
  return card;
}

function renderCollapsedImageTags(image, container = element("div", { className: "collapsed-tag-list" })) {
  container.replaceChildren();
  container.classList.toggle("hidden", !image.tags.length);
  for (const tag of image.tags) container.append(tagPill(tag));
  return container;
}

function sourceOriginalAction(image) {
  if (!image.sourceOriginal?.downloadUrl) return null;
  const extension = image.sourceOriginal.filename?.match(/\.[^.]+$/)?.[0]?.toLowerCase() || ".heic";
  const link = element("a", { href: "#", className: "source-original-action" }, `Download original (${extension})`);
  link.addEventListener("click", (event) => {
    event.preventDefault();
    if (link.getAttribute("aria-disabled") === "true") return;
    downloadSourceOriginal(image, link);
  });
  return element("div", { className: "link-row source-original-row" }, link);
}

async function downloadSourceOriginal(image, control) {
  const original = image.sourceOriginal;
  control.setAttribute("aria-disabled", "true");
  const previousText = control.textContent;
  control.textContent = "Downloading...";
  try {
    const url = sourceOriginalApiUrl(original.downloadUrl);
    const headers = new Headers();
    const authorization = authorizationHeaderForUrl(url);
    if (authorization) headers.set("Authorization", authorization);
    const response = await fetch(url, { headers });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(parseErrorText(text, response.status));
    }
    const blob = await response.blob();
    triggerBlobDownload(blob, original.filename || `${image.imageId || "source-original"}${extensionForContentType(original.contentType)}`);
    setMessage("imagesMessage", "Original downloaded.", "ok");
  } catch (error) {
    setMessage("imagesMessage", error.message, "error");
  } finally {
    control.removeAttribute("aria-disabled");
    control.textContent = previousText;
  }
}

function sourceOriginalApiUrl(downloadUrl) {
  const value = String(downloadUrl || "");
  if (/^https?:\/\//i.test(value)) return value;
  const apiBase = trustedApiBase().replace(/\/$/, "");
  if (value.toLowerCase().startsWith("/api/")) {
    return `${apiBase.replace(/\/api$/i, "")}${value}`;
  }
  return `${apiBase}${value.startsWith("/") ? "" : "/"}${value}`;
}

function triggerBlobDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = element("a", { href: url, download: filename });
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

function extensionForContentType(contentType) {
  const type = String(contentType || "").toLowerCase();
  if (type === "image/heif") return ".heif";
  if (type === "image/jpeg") return ".jpg";
  if (type === "image/png") return ".png";
  if (type === "image/webp") return ".webp";
  return ".heic";
}

function shouldToggleImageCard(target) {
  if (!(target instanceof Element)) return true;
  return !target.closest("button, input, textarea, select, a, summary, details, label");
}

function toggleImageCard(card) {
  if (card.classList.contains("expanded")) {
    collapseImageCard(card);
    return;
  }
  const current = $("imagesList").querySelector(".image-card.expanded");
  if (current && current !== card) collapseImageCard(current);
  card.classList.add("expanded");
  card.ariaExpanded = "true";
}

function collapseImageCard(card) {
  card.classList.remove("expanded");
  card.ariaExpanded = "false";
}

async function deleteOwnImage(image, card, button) {
  const label = image.fileName || image.imageId || "this image";
  if (!window.confirm(`Delete ${label}? This cannot be undone.`)) return;
  button.disabled = true;
  try {
    await apiFetch(`/images/${encodeURIComponent(image.imageId)}`, { method: "DELETE", auth: true });
    card.remove();
    if ($("imagesList").children.length) {
      setMessage("imagesMessage", "Image deleted.", "ok");
    } else {
      setMessage("imagesMessage", state.imageFilterTags.length ? "No images match those tags." : "No uploads yet.", "ok");
    }
    if (currentTab() === "tags") await loadTags();
  } catch (error) {
    setMessage("imagesMessage", error.message, "error");
    button.disabled = false;
  }
}

function renderImageTags(image, onTagsChanged) {
  const container = element("div", { className: "tag-management" });

  const rerender = () => {
    const chips = element("div", { className: "tag-list" });
    if (image.tags.length) {
      for (const tag of image.tags) chips.append(tagPill(tag, () => removeImageTag(image, tag, rerender, onTagsChanged)));
    } else {
      chips.append(element("span", { className: "muted" }, "No tags"));
    }

    const input = element("input", { placeholder: "tag-one, tag_two" });
    const form = element("form", {},
      input,
      element("button", { type: "submit" }, "Add tags")
    );
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      addImageTags(image, input.value, rerender, onTagsChanged);
    });

    container.replaceChildren(
      element("strong", {}, "Tags"),
      chips,
      form
    );
  };

  rerender();
  return container;
}

async function addImageTags(image, value, rerender, onTagsChanged) {
  const tags = parseTags(value);
  if (!tags.length) {
    setMessage("imagesMessage", "Enter at least one tag.", "error");
    return;
  }
  try {
    await apiFetch(`/images/${encodeURIComponent(image.imageId)}/tags`, { method: "POST", auth: true, body: { tags } });
    image.tags = uniqueTags([...image.tags, ...tags]);
    rerender();
    if (onTagsChanged) onTagsChanged();
    setMessage("imagesMessage", "Tags added.", "ok");
    if (currentTab() === "tags") await loadTags();
  } catch (error) {
    setMessage("imagesMessage", error.message, "error");
  }
}

async function removeImageTag(image, tag, rerender, onTagsChanged) {
  try {
    await apiFetch(`/images/${encodeURIComponent(image.imageId)}/tags/${encodeURIComponent(tag)}`, { method: "DELETE", auth: true, allowNoContent: true });
    image.tags = image.tags.filter((item) => item !== tag);
    rerender();
    if (onTagsChanged) onTagsChanged();
    setMessage("imagesMessage", "Tag removed.", "ok");
    if (currentTab() === "tags") await loadTags();
  } catch (error) {
    setMessage("imagesMessage", error.message, "error");
  }
}

function renderTag(tag) {
  const item = element("div", { className: "list-item" });
  const status = element("span", { className: "pill" }, tag.isPublic ? "public" : "private");
  const filter = element("button", { className: "secondary", type: "button" }, "View images");
  filter.addEventListener("click", () => setImageFilter([tag.name]));
  const toggle = element("button", { type: "button" }, tag.isPublic ? "Make private" : "Make public");
  toggle.addEventListener("click", () => {
    const nextIsPublic = !tag.isPublic;
    setTagVisibility(tag, nextIsPublic, nextIsPublic ? tag.galleryHeader || null : undefined, item, toggle);
  });
  const actions = element("div", { className: "list-actions" }, filter, toggle);

  item.append(
    element("div", { className: "section-heading" }, element("strong", {}, tag.name), status),
    element("p", { className: "muted" }, `Created: ${formatDate(tag.createdAt) || "unknown"}`),
    actions
  );

  if (tag.isPublic && tag.galleryId) {
    const url = publicGalleryUrl(tag.galleryId);
    const preview = element("a", { href: url, target: "_blank", rel: "noopener" }, "Open preview");
    const headerInputId = `gallery-header-${tag.galleryId}`;
    const headerInput = element("input", {
      id: headerInputId,
      maxLength: 200,
      placeholder: "Shown as the gallery's title",
      value: tag.galleryHeader
    });
    const saveHeader = element("button", { type: "submit" }, "Save header");
    const headerForm = element("form", { className: "gallery-header-form" },
      element("label", { htmlFor: headerInputId }, "Gallery header (optional)"),
      headerInput,
      saveHeader
    );
    headerForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const input = headerInput;
      if (await setTagVisibility(tag, true, input.value.trim(), item, saveHeader)) {
        setMessage("tagsMessage", "Gallery header saved.", "ok");
      }
    });
    item.append(copyRow("Gallery", url), preview, headerForm);
  }

  return item;
}

async function setTagVisibility(tag, isPublic, header, item, control) {
  if (control) control.disabled = true;
  try {
    const data = await apiFetch(`/tags/${encodeURIComponent(tag.name)}`, { method: "PUT", auth: true, body: { isPublic, header: header ?? null } });
    applyTagVisibilityUpdate(tag, isPublic, header, data);
    if (item?.isConnected) item.replaceWith(renderTag(tag));
    return true;
  } catch (error) {
    setMessage("tagsMessage", error.message, "error");
    if (control) control.disabled = false;
    return false;
  }
}

function applyTagVisibilityUpdate(tag, isPublic, header, data) {
  const responseTag = data && typeof data === "object" ? normalizeTag(data) : null;
  const responseHeader = pick(data, "galleryHeader");
  tag.isPublic = isPublic;
  tag.createdAt = responseTag?.createdAt || tag.createdAt;
  tag.galleryId = responseTag?.galleryId || (isPublic ? tag.galleryId : "");
  if (responseHeader !== undefined) {
    tag.galleryHeader = responseHeader || "";
  } else if (isPublic && header !== undefined) {
    tag.galleryHeader = header || "";
  }
}

function imageElement(image) {
  const img = document.createElement("img");
  img.alt = image.fileName ? `Uploaded image ${image.fileName}` : `Uploaded image ${image.imageId || ""}`;
  img.loading = "lazy";
  img.src = thumbnailUrl(image) || image.originalUrl || "";
  return img;
}

function renderKey(key) {
  const keyId = pick(key, "keyId") || "";
  const revokedAt = pick(key, "revokedAt");
  const item = element("div", { className: "list-item" });
  item.append(
    element("div", { className: "section-heading" },
      element("strong", {}, keyId),
      element("span", { className: "pill" }, revokedAt ? "revoked" : "active")
    ),
    element("p", { className: "muted" }, `Created: ${formatDate(pick(key, "createdAt"))}`),
    element("p", { className: "muted" }, `Last used: ${formatDate(pick(key, "lastUsedAt")) || "never"}`)
  );
  const button = element("button", { className: "danger", type: "button" }, "Revoke");
  button.disabled = Boolean(revokedAt);
  button.addEventListener("click", () => revokeApiKey(keyId));
  item.append(button);
  return item;
}

function renderUser(user) {
  const item = element("div", { className: "list-item" });
  item.append(
    element("div", { className: "section-heading" },
      element("strong", {}, user.username),
      element("span", { className: "pill" }, `${user.approvalStatus}${user.isAdmin ? " · admin" : ""}${user.isFirstAdmin ? " · first admin" : ""}`)
    )
  );
  const actions = element("div", { className: "list-actions" });
  const approve = actionButton("Approve", () => adminAction(user.userId, "approve"));
  const disable = actionButton("Disable", () => adminAction(user.userId, "disable"));
  const admin = user.isAdmin
    ? actionButton("Revoke admin", () => adminAction(user.userId, "admin", "DELETE"))
    : actionButton("Grant admin", () => adminAction(user.userId, "admin"));
  for (const button of [approve, disable, admin]) button.disabled = user.isFirstAdmin;
  actions.append(approve, disable, admin);
  item.append(actions);
  return item;
}

function actionButton(label, onClick) {
  const button = element("button", { type: "button", className: label.includes("Disable") || label.includes("Revoke") ? "danger" : "" }, label);
  button.addEventListener("click", onClick);
  return button;
}

async function apiFetch(path, options = {}) {
  const url = apiUrl(path);
  const headers = new Headers(options.headers || {});
  if (options.body !== undefined) headers.set("Content-Type", "application/json");
  if (options.auth) setAuthorizationHeader(headers, url);
  const response = await fetch(url, {
    method: options.method || "GET",
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined
  });
  if (response.status === 204 && options.allowNoContent) return null;
  const text = await response.text();
  const data = text ? safeJson(text) : null;
  if (!response.ok) {
    const error = new Error(parseError(data, text, response.status));
    error.status = response.status;
    throw error;
  }
  return data;
}

function apiUrl(path) {
  return `${trustedApiBase().replace(/\/$/, "")}${path}`;
}

function normalizeUser(value) {
  if (!value) return null;
  return {
    userId: pick(value, "userId") || "",
    username: pick(value, "username") || "",
    isFirstAdmin: Boolean(pick(value, "isFirstAdmin")),
    isAdmin: Boolean(pick(value, "isAdmin")),
    approvalStatus: pick(value, "approvalStatus") || ""
  };
}

function normalizeImage(value) {
  const variants = asArray(pick(value, "variants") || pick(value, "variantUrls")).map((variant) => ({
    width: Number(pick(variant, "width") || pick(variant, "key") || 0),
    url: String(pick(variant, "url") || pick(variant, "value") || "")
  })).filter((variant) => variant.url);
  const sourceOriginal = normalizeSourceOriginal(pick(value, "sourceOriginal"));
  return {
    imageId: pick(value, "imageId") || "",
    fileName: String(pick(value, "originalFilename") || ""),
    originalUrl: String(pick(value, "originalUrl") || pick(value, "url") || ""),
    variants: variants.sort((a, b) => a.width - b.width),
    contentType: pick(value, "contentType") || "",
    width: pick(value, "width"),
    height: pick(value, "height"),
    tags: uniqueTags(asArray(pick(value, "tags")).map((tag) => typeof tag === "string" ? tag : pick(tag, "name"))),
    sourceOriginal
  };
}

function normalizeSourceOriginal(value) {
  if (!value || typeof value !== "object") return null;
  const downloadUrl = String(pick(value, "downloadUrl") || "");
  if (!downloadUrl) return null;
  return {
    filename: String(pick(value, "filename") || ""),
    contentType: String(pick(value, "contentType") || ""),
    sizeBytes: Number(pick(value, "sizeBytes") || 0),
    downloadUrl
  };
}

function normalizeTag(value) {
  return {
    name: String(pick(value, "name") || ""),
    isPublic: Boolean(pick(value, "isPublic")),
    galleryId: pick(value, "galleryId") || "",
    createdAt: pick(value, "createdAt"),
    galleryHeader: pick(value, "galleryHeader") || ""
  };
}

function thumbnailUrl(image) {
  return image.variants.find((variant) => variant.width === 320)?.url
    || image.variants[0]?.url
    || image.originalUrl;
}

function copyRow(label, url) {
  const fragment = $("copyRowTemplate").content.cloneNode(true);
  const row = fragment.querySelector(".copy-row");
  fragment.querySelector("span").textContent = label;
  const input = fragment.querySelector("input");
  input.value = url;
  const button = fragment.querySelector("button");
  button.addEventListener("click", async () => {
    await navigator.clipboard.writeText(url);
    button.textContent = "Copied";
    setTimeout(() => { button.textContent = "Copy"; }, 1300);
  });
  return row;
}

function linkRow(label, url) {
  return element("div", { className: "link-row" },
    element("a", { href: url, target: "_blank", rel: "noopener" }, label)
  );
}

function tagPill(tag, onRemove) {
  const pill = element("span", { className: "pill tag-pill" }, tag);
  if (onRemove) {
    const button = element("button", { type: "button", title: `Remove ${tag}` }, "×");
    button.addEventListener("click", onRemove);
    pill.append(button);
  }
  return pill;
}

function formJson(form) {
  return Object.fromEntries(new FormData(form).entries());
}

function parseTags(value) {
  return uniqueTags(String(value || "").split(",").map((tag) => tag.trim()).filter(Boolean));
}

function uniqueTags(tags) {
  const seen = new Set();
  const result = [];
  for (const tag of tags.map((item) => String(item || "").trim()).filter(Boolean)) {
    const key = tag.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      result.push(tag);
    }
  }
  return result;
}

function setMessage(id, text, kind = "") {
  const node = $(id);
  node.textContent = text || "";
  node.className = `message ${kind}`.trim();
}

function asArray(value) {
  if (Array.isArray(value)) return value;
  for (const name of ["items", "images", "users", "keys", "tags"]) {
    const nested = pick(value, name);
    if (Array.isArray(nested)) return nested;
  }
  return [];
}

function publicGalleryUrl(galleryId) {
  const root = trustedApiBase().replace(/\/$/, "").replace(/\/api$/i, "");
  return `${root}/g/${encodeURIComponent(galleryId)}`;
}

function pick(object, camelName) {
  if (!object || typeof object !== "object") return undefined;
  const pascalName = camelName.charAt(0).toUpperCase() + camelName.slice(1);
  return object[camelName] ?? object[pascalName];
}

function safeJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function parseError(data, text, status) {
  if (data && typeof data === "object") {
    return pick(data, "message") || pick(data, "error") || pick(data, "title") || `Request failed (${status}).`;
  }
  return text || `Request failed (${status}).`;
}

function parseErrorText(text, status) {
  return parseError(safeJson(text), text, status);
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? String(value) : date.toLocaleString();
}

function element(tag, props = {}, ...children) {
  const node = document.createElement(tag);
  Object.assign(node, props);
  node.append(...children.flat().filter((child) => child !== null && child !== undefined));
  return node;
}

function textNode(text) {
  return document.createTextNode(text);
}
