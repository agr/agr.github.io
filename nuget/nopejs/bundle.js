(function () {
	'use strict';

	var _documentCurrentScript = typeof document !== 'undefined' ? document.currentScript : null;
	/*
	 Copyright (c) 2022 Gildas Lormeau. All rights reserved.

	 Redistribution and use in source and binary forms, with or without
	 modification, are permitted provided that the following conditions are met:

	 1. Redistributions of source code must retain the above copyright notice,
	 this list of conditions and the following disclaimer.

	 2. Redistributions in binary form must reproduce the above copyright 
	 notice, this list of conditions and the following disclaimer in 
	 the documentation and/or other materials provided with the distribution.

	 3. The names of the authors may not be used to endorse or promote products
	 derived from this software without specific prior written permission.

	 THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESSED OR IMPLIED WARRANTIES,
	 INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
	 FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL JCRAFT,
	 INC. OR ANY CONTRIBUTORS TO THIS SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT,
	 INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
	 LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
	 OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
	 LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
	 NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
	 EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
	 */

	const MAX_32_BITS = 0xffffffff;
	const MAX_16_BITS = 0xffff;
	const MAX_8_BITS = 0xff;
	const COMPRESSION_METHOD_DEFLATE = 0x08;
	const COMPRESSION_METHOD_DEFLATE_64 = 0x09;
	const COMPRESSION_METHOD_STORE = 0x00;
	const COMPRESSION_METHOD_AES = 0x63;

	const LOCAL_FILE_HEADER_SIGNATURE = 0x04034b50;
	const SPLIT_ZIP_FILE_SIGNATURE = 0x08074b50;
	const TEMPORARY_SPLIT_ZIP_FILE_SIGNATURE = 0x30304b50;
	const DATA_DESCRIPTOR_RECORD_SIGNATURE = SPLIT_ZIP_FILE_SIGNATURE;
	const ARCHIVE_EXTRA_DATA_SIGNATURE = 0x08064b50;
	const DIGITAL_SIGNATURE_RECORD_SIGNATURE = 0x05054b50;
	const CENTRAL_FILE_HEADER_SIGNATURE = 0x02014b50;
	const END_OF_CENTRAL_DIR_SIGNATURE = 0x06054b50;
	const ZIP64_END_OF_CENTRAL_DIR_SIGNATURE = 0x06064b50;
	const ZIP64_END_OF_CENTRAL_DIR_LOCATOR_SIGNATURE = 0x07064b50;
	const CENTRAL_FILE_HEADER_LENGTH = 46;
	const END_OF_CENTRAL_DIR_LENGTH = 22;
	const ZIP64_END_OF_CENTRAL_DIR_LOCATOR_LENGTH = 20;
	const ZIP64_END_OF_CENTRAL_DIR_LENGTH = 56;

	const DATA_DESCRIPTOR_RECORD_LENGTH = 12;
	const DATA_DESCRIPTOR_RECORD_ZIP_64_LENGTH = 20;
	const DATA_DESCRIPTOR_RECORD_SIGNATURE_LENGTH = 4;
	const SPLIT_ZIP_FILE_SIGNATURE_LENGTH = 4;

	const EXTRAFIELD_TYPE_ZIP64 = 0x0001;
	const EXTRAFIELD_TYPE_AES = 0x9901;
	const EXTRAFIELD_TYPE_NTFS = 0x000a;
	const EXTRAFIELD_TYPE_NTFS_TAG1 = 0x0001;
	const EXTRAFIELD_TYPE_EXTENDED_TIMESTAMP = 0x5455;
	const EXTRAFIELD_TYPE_UNICODE_PATH = 0x7075;
	const EXTRAFIELD_TYPE_UNICODE_COMMENT = 0x6375;
	const EXTRAFIELD_TYPE_USDZ = 0x1986;
	const EXTRAFIELD_TYPE_INFOZIP = 0x7875;
	const EXTRAFIELD_TYPE_UNIX = 0x7855;
	const EXTRAFIELD_TYPE_UNIX_TYPE1 = 0x5855;
	const EXTRAFIELD_TYPE_PKWARE_UNIX = 0x000d;

	const BITFLAG_ENCRYPTED = 0b1;
	const BITFLAG_LEVEL = 0b0110;
	const BITFLAG_DATA_DESCRIPTOR = 0b1000;
	const BITFLAG_COMPRESSED_PATCHED_DATA = 0b100000;
	const BITFLAG_STRONG_ENCRYPTION = 0b1000000;
	const BITFLAG_LANG_ENCODING_FLAG = 0b100000000000;
	const BITFLAG_MASKED_LOCAL_HEADERS = 0b10000000000000;
	const FILE_ATTR_MSDOS_DIR_MASK = 0b10000;
	const FILE_ATTR_MSDOS_READONLY_MASK = 0x01;
	const FILE_ATTR_MSDOS_HIDDEN_MASK = 0x02;
	const FILE_ATTR_MSDOS_SYSTEM_MASK = 0x04;
	const FILE_ATTR_MSDOS_ARCHIVE_MASK = 0x20;
	const FILE_ATTR_UNIX_TYPE_MASK = 0o170000;
	const FILE_ATTR_UNIX_TYPE_DIR = 0o040000;
	const FILE_ATTR_UNIX_TYPE_SYMLINK = 0o120000;
	const FILE_ATTR_UNIX_EXECUTABLE_MASK = 0o111;
	const FILE_ATTR_UNIX_DEFAULT_MASK = 0o644;
	const FILE_ATTR_UNIX_SETUID_MASK = 0o4000;
	const FILE_ATTR_UNIX_SETGID_MASK = 0o2000;
	const FILE_ATTR_UNIX_STICKY_MASK = 0o1000;

	const DIRECTORY_SIGNATURE = "/";

	const HEADER_SIZE = 30;
	const HEADER_OFFSET_SIGNATURE = 10;
	const HEADER_OFFSET_COMPRESSED_SIZE = 14;
	const HEADER_OFFSET_UNCOMPRESSED_SIZE = 18;
	const MIN_DATE = new Date(1980, 0, 1);

	const UNDEFINED_VALUE = undefined;
	const UNDEFINED_TYPE = "undefined";
	const FUNCTION_TYPE = "function";
	const STRING_TYPE = "string";
	const NUMBER_TYPE = "number";
	const BOOLEAN_TYPE = "boolean";

	const EMPTY_UINT8_ARRAY = new Uint8Array();

	/*
	 Copyright (c) 2022 Gildas Lormeau. All rights reserved.

	 Redistribution and use in source and binary forms, with or without
	 modification, are permitted provided that the following conditions are met:

	 1. Redistributions of source code must retain the above copyright notice,
	 this list of conditions and the following disclaimer.

	 2. Redistributions in binary form must reproduce the above copyright 
	 notice, this list of conditions and the following disclaimer in 
	 the documentation and/or other materials provided with the distribution.

	 3. The names of the authors may not be used to endorse or promote products
	 derived from this software without specific prior written permission.

	 THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESSED OR IMPLIED WARRANTIES,
	 INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
	 FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL JCRAFT,
	 INC. OR ANY CONTRIBUTORS TO THIS SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT,
	 INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
	 LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
	 OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
	 LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
	 NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
	 EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
	 */


	const OPTION_FILENAME_ENCODING = "filenameEncoding";
	const OPTION_COMMENT_ENCODING = "commentEncoding";
	const OPTION_DECODE_TEXT = "decodeText";
	const OPTION_EXTRACT_PREPENDED_DATA = "extractPrependedData";
	const OPTION_EXTRACT_APPENDED_DATA = "extractAppendedData";
	const OPTION_PASSWORD = "password";
	const OPTION_RAW_PASSWORD = "rawPassword";
	const OPTION_PASS_THROUGH = "passThrough";
	const OPTION_SIGNAL = "signal";
	const OPTION_CHECK_PASSWORD_ONLY = "checkPasswordOnly";
	const OPTION_CHECK_OVERLAPPING_ENTRY_ONLY = "checkOverlappingEntryOnly";
	const OPTION_CHECK_OVERLAPPING_ENTRY = "checkOverlappingEntry";
	const OPTION_CHECK_AMBIGUITY = "checkAmbiguity";
	const OPTION_CHECK_LOCAL_DIRECTORY = "checkLocalDirectory";
	const OPTION_CHECK_SIGNATURE = "checkSignature";
	const OPTION_CHECK_CRC32 = "checkCrc32";
	const OPTION_CHECK_AUTHENTICATION_CODE = "checkAuthenticationCode";
	const OPTION_USE_WEB_WORKERS = "useWebWorkers";
	const OPTION_USE_COMPRESSION_STREAM = "useCompressionStream";
	const OPTION_TRANSFER_STREAMS = "transferStreams";
	const OPTION_PREVENT_CLOSE = "preventClose";
	const OPTION_STRICTNESS = "strictness";
	const OPTION_FILENAME_VALIDATION = "filenameValidation";
	const OPTION_NORMALIZE_FILENAME = "normalizeFilename";
	const OPTION_MAX_APPENDED_DATA_SIZE = "maxAppendedDataSize";
	const OPTION_DECRYPT_CENTRAL_DIRECTORY = "decryptCentralDirectory";
	const TEXT_TYPE_FILENAME = "filename";
	const TEXT_TYPE_COMMENT = "comment";
	const STRICTNESS_STRICT = "strict";
	const STRICTNESS_BALANCED = "balanced";
	const STRICTNESS_TOLERANT = "tolerant";

	const ERR_INVALID_FUNCTION_OPTION = "Invalid option (must be a function)";
	const ERR_INVALID_SIGNAL = "Invalid signal (must be an AbortSignal instance)";
	const ERR_INVALID_PASSWORD_TYPE = "Invalid password (password must be a string, rawPassword must be a Uint8Array)";

	function checkFunctionOption(value) {
		if (value && typeof value != FUNCTION_TYPE) {
			throw new Error(ERR_INVALID_FUNCTION_OPTION);
		}
		return value;
	}

	function checkSignalOption(signal) {
		if (signal && (typeof signal.addEventListener != FUNCTION_TYPE || typeof signal.aborted != BOOLEAN_TYPE)) {
			throw new Error(ERR_INVALID_SIGNAL);
		}
		return signal || UNDEFINED_VALUE;
	}

	function checkPasswordOption(password, rawPassword) {
		if ((password && typeof password != STRING_TYPE) || (rawPassword && !(rawPassword instanceof Uint8Array))) {
			throw new Error(ERR_INVALID_PASSWORD_TYPE);
		}
	}

	function toNumber(value) {
		return typeof value == STRING_TYPE && value.trim() ? Number(value) : value;
	}

	/*
	 Copyright (c) 2025 Gildas Lormeau. All rights reserved.

	 Redistribution and use in source and binary forms, with or without
	 modification, are permitted provided that the following conditions are met:

	 1. Redistributions of source code must retain the above copyright notice,
	 this list of conditions and the following disclaimer.

	 2. Redistributions in binary form must reproduce the above copyright 
	 notice, this list of conditions and the following disclaimer in 
	 the documentation and/or other materials provided with the distribution.

	 3. The names of the authors may not be used to endorse or promote products
	 derived from this software without specific prior written permission.

	 THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESSED OR IMPLIED WARRANTIES,
	 INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
	 FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL JCRAFT,
	 INC. OR ANY CONTRIBUTORS TO THIS SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT,
	 INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
	 LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
	 OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
	 LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
	 NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
	 EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
	 */


	const DEFAULT_CHUNK_SIZE$1 = 64 * 1024;
	const MINIMUM_CHUNK_SIZE = 64;
	const MINIMUM_PROPERTY_VALUE = 1;
	const ERR_INVALID_MAX_WORKERS = "Invalid maxWorkers (must be an integer greater than 0)";
	let maxWorkers = 2;
	try {
		if (typeof navigator != UNDEFINED_TYPE && navigator.hardwareConcurrency) {
			maxWorkers = navigator.hardwareConcurrency;
		}
	} catch {
		// ignored
	}
	const DEFAULT_CONFIGURATION = {
		workerURI: "./core/web-worker-wasm.js",
		wasmURI: "./core/streams/zlib-wasm/zlib-streams.wasm",
		chunkSize: DEFAULT_CHUNK_SIZE$1,
		maxWorkers,
		terminateWorkerTimeout: 5000,
		workerStarvationTimeout: 5000,
		workerStartupTimeout: 5000,
		useWebWorkers: true,
		useCompressionStream: true,
		transferStreams: true,
		CompressionStream: typeof CompressionStream != UNDEFINED_TYPE && CompressionStream,
		DecompressionStream: typeof DecompressionStream != UNDEFINED_TYPE && DecompressionStream
	};

	const PROPERTY_NAME_MAX_WORKERS = "maxWorkers";

	const STRING_PROPERTY_NAMES = [
		"baseURI",
		"wasmURI",
		"workerURI"
	];
	const BOOLEAN_PROPERTY_NAMES = [
		"useCompressionStream",
		"useWebWorkers",
		"transferStreams"
	];
	const NUMBER_PROPERTY_NAMES = [
		"chunkSize",
		PROPERTY_NAME_MAX_WORKERS,
		"terminateWorkerTimeout",
		"workerStarvationTimeout",
		"workerStartupTimeout"
	];
	const FUNCTION_PROPERTY_NAMES = [
		"createWorker",
		"CompressionStream",
		"DecompressionStream",
		"CompressionStreamFallback",
		"DecompressionStreamFallback"
	];
	const CONFIGURABLE_PROPERTY_NAMES = [
		...STRING_PROPERTY_NAMES,
		...BOOLEAN_PROPERTY_NAMES,
		...NUMBER_PROPERTY_NAMES,
		...FUNCTION_PROPERTY_NAMES
	];

	const config = { ...DEFAULT_CONFIGURATION };

	function getConfiguration() {
		return config;
	}

	function getChunkSize(config) {
		return normalizeChunkSize(config.chunkSize);
	}

	function normalizeChunkSize(chunkSize) {
		chunkSize = toNumber(chunkSize);
		return Number.isInteger(chunkSize) && chunkSize >= MINIMUM_PROPERTY_VALUE ? Math.max(chunkSize, MINIMUM_CHUNK_SIZE) : DEFAULT_CHUNK_SIZE$1;
	}

	function checkConfiguration(configuration) {
		const checkedConfiguration = {};
		for (const propertyName of CONFIGURABLE_PROPERTY_NAMES) {
			const propertyValue = configuration[propertyName];
			if (propertyValue !== UNDEFINED_VALUE) {
				checkedConfiguration[propertyName] = checkPropertyValue(propertyName, propertyValue);
			}
		}
		return checkedConfiguration;
	}

	function checkPropertyValue(propertyName, propertyValue) {
		if (NUMBER_PROPERTY_NAMES.includes(propertyName)) {
			propertyValue = toNumber(propertyValue);
			if (propertyName == PROPERTY_NAME_MAX_WORKERS && (!Number.isInteger(propertyValue) || propertyValue < MINIMUM_PROPERTY_VALUE)) {
				throw new Error(ERR_INVALID_MAX_WORKERS);
			}
		} else if (FUNCTION_PROPERTY_NAMES.includes(propertyName)) {
			checkFunctionOption(propertyValue);
		}
		return propertyValue;
	}

	function normalizeConfiguration(configuration) {
		configuration = configuration || {};
		const { CompressionStreamZlib, DecompressionStreamZlib } = configuration;
		if (CompressionStreamZlib === UNDEFINED_VALUE && DecompressionStreamZlib === UNDEFINED_VALUE) {
			return configuration;
		}
		const normalizedConfiguration = Object.assign({}, configuration);
		if (normalizedConfiguration.CompressionStreamFallback === UNDEFINED_VALUE) {
			normalizedConfiguration.CompressionStreamFallback = CompressionStreamZlib;
		}
		if (normalizedConfiguration.DecompressionStreamFallback === UNDEFINED_VALUE) {
			normalizedConfiguration.DecompressionStreamFallback = DecompressionStreamZlib;
		}
		return normalizedConfiguration;
	}

	function setDefaultConfiguration(configuration) {
		const checkedConfiguration = checkConfiguration(normalizeConfiguration(configuration));
		Object.assign(DEFAULT_CONFIGURATION, checkedConfiguration);
		Object.assign(config, checkedConfiguration);
	}

	const t$1=new Uint8Array(288);t$1.fill(8,0,144),t$1.fill(9,144,256),t$1.fill(7,256,280),t$1.fill(8,280,288),new Uint8Array(30).fill(5);const e$1="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",n$1=t=>t({workerURI:t=>{const n="text/javascript";let s='!function(t){"function"==typeof define&&define.amd?define(t):t()}(function(){"use strict";const{Array:t,Object:n,Number:e,Math:s,Error:r,Uint8Array:o,Uint16Array:c,Uint32Array:i,Int32Array:a,Map:f,DataView:u,Promise:l,TextEncoder:w,crypto:h,postMessage:p,TransformStream:d,ReadableStream:y,WritableStream:m,CompressionStream:S,DecompressionStream:g}=self,v=void 0,b="undefined",k="function",z=new o,C=[[],[],[],[],[],[],[],[]];for(let t=0;t<256;t++){let n=t;for(let t=0;t<8;t++)n=1&n?n>>>1^3988292384:n>>>1;C[0][t]=n}for(let t=0;t<256;t++)for(let n=1;n<8;n++){const e=C[n-1][t];C[n][t]=e>>>8^C[0][255&e]}const[I,A,x,M,P,B,D,F]=C;class R{constructor(t){this.o=t||-1}append(t){let n=0|this.o;const e=0|t.length;let s=0;if(e>=8&&t.buffer){const r=new u(t.buffer,t.byteOffset,e),o=e-8;for(;s<=o;s+=8){const t=n^r.getInt32(s,!0),e=r.getInt32(s+4,!0);n=F[255&t]^D[t>>>8&255]^B[t>>>16&255]^P[t>>>24&255]^M[255&e]^x[e>>>8&255]^A[e>>>16&255]^I[e>>>24&255]}}for(;s<e;s++)n=n>>>8^I[255&(n^t[s])];this.o=n}get(){return~this.o}}class U extends d{constructor(){let t;const n=new R;super({transform(t,e){n.append(t),e.enqueue(t)},flush(){const e=new o(4);new u(e.buffer).setUint32(0,n.get()),t.value=e}}),t=this}}function W(t,n){const e=new o(t.length+n.length);return e.set(t),e.set(n,t.length),e}function _(t){return new u(t.buffer,t.byteOffset,t.byteLength)}const T={concat(t,n){if(0===t.length||0===n.length)return t.concat(n);const e=t[t.length-1],s=T.l(e);return 32===s?t.concat(n):T.h(n,s,0|e,t.slice(0,t.length-1))},bitLength(t){const n=t.length;if(0===n)return 0;const e=t[n-1];return 32*(n-1)+T.l(e)},m(t,n){if(32*t.length<n)return t;const e=(t=t.slice(0,s.ceil(n/32))).length;return n&=31,e>0&&n&&(t[e-1]=T.S(n,t[e-1]&2147483648>>n-1,1)),t},S:(t,n,e)=>32===t?n:(e?0|n:n<<32-t)+1099511627776*t,l:t=>s.round(t/1099511627776)||32,h(t,n,e,s){for(void 0===s&&(s=[]);n>=32;n-=32)s.push(e),e=0;if(0===n)return s.concat(t);for(let r=0;r<t.length;r++)s.push(e|t[r]>>>n),e=t[r]<<32-n;const r=t.length?t[t.length-1]:0,o=T.l(r);return s.push(T.S(n+o&31,n+o>32?e:s.pop(),1)),s}},V={bytes:{v(t){const n=T.bitLength(t)/8,e=new o(n);let s;for(let r=0;r<n;r++)3&r||(s=t[r/4]),e[r]=s>>>24,s<<=8;return e},C(t){const n=[];let e,s=0;for(e=0;e<t.length;e++)s=s<<8|t[e],3&~e||(n.push(s),s=0);return 3&e&&n.push(T.S(8*(3&e),s)),n}}},K=class{constructor(t){const n=this;n.blockSize=512,n.I=[1732584193,4023233417,2562383102,271733878,3285377520],n.A=[1518500249,1859775393,2400959708,3395469782],t?(n.M=t.M.slice(0),n.P=t.P.slice(0),n.B=t.B):n.reset()}reset(){const t=this;return t.M=t.I.slice(0),t.P=[],t.B=0,t}update(t){const n=this;"string"==typeof t&&(t=V.D.C(t));const e=n.P=T.concat(n.P,t),s=n.B,o=n.B=s+T.bitLength(t);if(o>9007199254740991)throw new r("Cannot hash more than 2^53 - 1 bits");const c=new i(e);let a=0;for(let t=n.blockSize+s-(n.blockSize+s&n.blockSize-1);t<=o;t+=n.blockSize)n.F(c.subarray(16*a,16*(a+1))),a+=1;return e.splice(0,16*a),n}R(){const t=this;let n=t.P;const e=t.M;n=T.concat(n,[T.S(1,1)]);for(let t=n.length+2;15&t;t++)n.push(0);for(n.push(s.floor(t.B/4294967296)),n.push(0|t.B);n.length;)t.F(n.splice(0,16));return t.reset(),e}U(t,n,e,s){return t<=19?n&e|~n&s:t<=39?n^e^s:t<=59?n&e|n&s|e&s:t<=79?n^e^s:void 0}W(t,n){return n<<t|n>>>32-t}F(n){const e=this,r=e.M,o=t(80);for(let t=0;t<16;t++)o[t]=n[t];let c=r[0],i=r[1],a=r[2],f=r[3],u=r[4];for(let t=0;t<=79;t++){t>=16&&(o[t]=e.W(1,o[t-3]^o[t-8]^o[t-14]^o[t-16]));const n=e.W(5,c)+e.U(t,i,a,f)+u+o[t]+e.A[s.floor(t/20)]|0;u=f,f=a,a=e.W(30,i),i=c,c=n}r[0]=r[0]+c|0,r[1]=r[1]+i|0,r[2]=r[2]+a|0,r[3]=r[3]+f|0,r[4]=r[4]+u|0}},E={importKey:t=>new E._(V.bytes.C(t)),T(t,n,e,s){if(e=e||1e4,s<0||e<0)throw new r("invalid params to pbkdf2");const o=1+(s>>5)<<2;let c,i,a,f,l;const w=new ArrayBuffer(o),h=new u(w);let p=0;const d=T;for(n=V.bytes.C(n),l=1;p<(o||1);l++){for(c=i=t.encrypt(d.concat(n,[l])),a=1;a<e;a++)for(i=t.encrypt(i),f=0;f<i.length;f++)c[f]^=i[f];for(a=0;p<(o||1)&&a<c.length;a++)h.setInt32(p,c[a]),p+=4}return w.slice(0,s/8)},_:class{constructor(t){const n=this,e=n.V=K,s=[[],[]];n.K=[new e,new e];const r=n.K[0].blockSize/32;t.length>r&&(t=(new e).update(t).R());for(let n=0;n<r;n++)s[0][n]=909522486^t[n],s[1][n]=1549556828^t[n];n.K[0].update(s[0]),n.K[1].update(s[1]),n.L=new e(n.K[0])}reset(){const t=this;t.L=new t.V(t.K[0]),t.O=!1}update(t){this.O=!0,this.L.update(t)}digest(){const t=this,n=t.L.R(),e=new t.V(t.K[1]).update(n).R();return t.reset(),e}encrypt(t){if(this.O)throw new r("encrypt on already updated hmac called!");return this.update(t),this.digest(t)}}},L=typeof h!=b&&typeof h.getRandomValues==k,O="Invalid password",j="zipjs-abort-check-password";function H(t){if(L)return h.getRandomValues(t);throw new r("Crypto API not supported")}const N=16,q={name:"PBKDF2"},G=n.assign({hash:{name:"HMAC"}},q),J=n.assign({iterations:1e3,hash:{name:"SHA-1"}},q),Q=["deriveBits"],X=[8,12,16],Y=[16,24,32],Z=10,$=[0,0,0,0],tt=typeof h!=b,nt=tt&&h.subtle,et=tt&&typeof nt!=b,st=V.bytes,rt=class{constructor(t){const n=this;n.j=[[[],[],[],[],[]],[[],[],[],[],[]]],n.j[0][0][0]||n.H();const e=n.j[0][4],s=n.j[1],o=t.length;let c,i,a,f=1;if(4!==o&&6!==o&&8!==o)throw new r("invalid aes key size");for(n.A=[i=t.slice(0),a=[]],c=o;c<4*o+28;c++){let t=i[c-1];(c%o===0||8===o&&c%o===4)&&(t=e[t>>>24]<<24^e[t>>16&255]<<16^e[t>>8&255]<<8^e[255&t],c%o===0&&(t=t<<8^t>>>24^f<<24,f=f<<1^283*(f>>7))),i[c]=i[c-o]^t}for(let t=0;c;t++,c--){const n=i[3&t?c:c-4];a[t]=c<=4||t<4?n:s[0][e[n>>>24]]^s[1][e[n>>16&255]]^s[2][e[n>>8&255]]^s[3][e[255&n]]}}encrypt(t){return this.N(t,0)}decrypt(t){return this.N(t,1)}H(){const t=this.j[0],n=this.j[1],e=t[4],s=n[4],r=[],o=[];let c,i,a,f;for(let t=0;t<256;t++)o[(r[t]=t<<1^283*(t>>7))^t]=t;for(let u=c=0;!e[u];u^=i||1,c=o[c]||1){let o=c^c<<1^c<<2^c<<3^c<<4;o=o>>8^255&o^99,e[u]=o,s[o]=u,f=r[a=r[i=r[u]]];let l=16843009*f^65537*a^257*i^16843008*u,w=257*r[o]^16843008*o;for(let e=0;e<4;e++)t[e][u]=w=w<<24^w>>>8,n[e][o]=l=l<<24^l>>>8}for(let e=0;e<5;e++)t[e]=t[e].slice(0),n[e]=n[e].slice(0)}N(t,n){if(4!==t.length)throw new r("invalid aes block size");const e=this.A[n],s=e.length/4-2,o=[0,0,0,0],c=this.j[n],i=c[0],a=c[1],f=c[2],u=c[3],l=c[4];let w,h,p,d=t[0]^e[0],y=t[n?3:1]^e[1],m=t[2]^e[2],S=t[n?1:3]^e[3],g=4;for(let t=0;t<s;t++)w=i[d>>>24]^a[y>>16&255]^f[m>>8&255]^u[255&S]^e[g],h=i[y>>>24]^a[m>>16&255]^f[S>>8&255]^u[255&d]^e[g+1],p=i[m>>>24]^a[S>>16&255]^f[d>>8&255]^u[255&y]^e[g+2],S=i[S>>>24]^a[d>>16&255]^f[y>>8&255]^u[255&m]^e[g+3],g+=4,d=w,y=h,m=p;for(let t=0;t<4;t++)o[n?3&-t:t]=l[d>>>24]<<24^l[y>>16&255]<<16^l[m>>8&255]<<8^l[255&S]^e[g++],w=d,d=y,y=m,m=S,S=w;return o}},ot=class{constructor(t,n){this.G=t,this.J=n,this.X=n}reset(){this.X=this.J}update(t){return this.Y(this.G,t,this.X)}Z(t){if(255&~(t>>24))t+=1<<24;else{let n=t>>16&255,e=t>>8&255,s=255&t;255===n?(n=0,255===e?(e=0,255===s?s=0:++s):++e):++n,t=0,t+=n<<16,t+=e<<8,t+=s}return t}$(t){0===(t[0]=this.Z(t[0]))&&(t[1]=this.Z(t[1]))}Y(t,n,e){let s;if(!(s=n.length))return[];const r=T.bitLength(n);for(let r=0;r<s;r+=4){this.$(e);const s=t.encrypt(e);n[r]^=s[0],n[r+1]^=s[1],n[r+2]^=s[2],n[r+3]^=s[3]}return T.m(n,r)}},ct=E._;let it=tt&&et&&typeof nt.importKey==k,at=tt&&et&&typeof nt.deriveBits==k;class ft extends d{constructor({password:t,rawPassword:n,encryptionStrength:e,checkPasswordOnly:s,checkAuthenticationCode:c=!0}){super({start(){lt(this,t,n,e)},async transform(t,n){const e=this,{password:c,strength:i,nt:a,ready:f}=e;c?(await async function(t,n,e,s){const o=await ht(t,n,e,dt(s,0,X[n])),c=dt(s,X[n]);if(o[0]!=c[0]||o[1]!=c[1])throw new r(O)}(e,i,c,dt(t,0,X[i]+2)),t=dt(t,X[i]+2),s?n.error(new r(j)):a()):await f;const u=new o(t.length-Z-(t.length-Z)%N);n.enqueue(wt(e,t,u,0,Z,!0))},async flush(t){const{et:n,st:e,ot:s,ready:o}=this;if(e&&n){await o;const i=dt(s,0,s.length-Z),a=dt(s,s.length-Z);let f=z;if(i.length){const t=mt(st,i);e.update(t);const s=n.update(t);f=yt(st,s)}const u=dt(yt(st,e.digest()),0,Z);let l=s.length<Z?1:0;for(let t=0;t<Z;t++)l|=u[t]^a[t];if(l&&c)throw new r("Invalid authentication code");t.enqueue(f)}}})}}class ut extends d{constructor({password:t,rawPassword:n,encryptionStrength:e}){super({start(){lt(this,t,n,e)},async transform(t,n){const e=this,{password:s,strength:r,nt:c,ready:i}=e;let a=z;s?(a=await async function(t,n,e){const s=H(new o(X[n]));return W(s,await ht(t,n,e,s))}(e,r,s),c()):await i;const f=new o(a.length+t.length-t.length%N);f.set(a,0),n.enqueue(wt(e,t,f,a.length,0))},async flush(t){const{et:n,st:e,ot:s,ready:r}=this;if(e&&n){await r;let o=z;if(s.length){const t=n.update(mt(st,s));e.update(t),o=yt(st,t)}const c=yt(st,e.digest()).slice(0,Z);t.enqueue(W(o,c))}}})}}function lt(t,e,s,r){n.assign(t,{ready:new l(n=>t.nt=n),password:pt(e,s),strength:r-1,ot:z})}function wt(t,n,e,s,r,c){const{et:i,st:a,ot:f}=t;f.length&&(n=W(f,n));const u=n.length-r;let l;for(e=function(t,n){if(n&&n>t.length){const e=t;(t=new o(n)).set(e,0)}return t}(e,s+(u-u%N)),l=0;l<=u-N;l+=N){const t=mt(st,dt(n,l,l+N));c&&a.update(t);const r=i.update(t);c||a.update(r),e.set(yt(st,r),l+s)}return t.ot=dt(n,l),e}async function ht(e,s,r,c){e.password=null;const i=await async function(t,n,e,s,r){if(!it)return E.importKey(n);try{return await nt.importKey("raw",n,e,!1,r)}catch{return it=!1,E.importKey(n)}}(0,r,G,0,Q),a=await async function(t,n,e){if(!at)return E.T(n,t.salt,J.iterations,e);try{return await nt.deriveBits(t,n,e)}catch{return at=!1,E.T(n,t.salt,J.iterations,e)}}(n.assign({salt:c},J),i,8*(2*Y[s]+2)),f=new o(a),u=mt(st,dt(f,0,Y[s])),l=mt(st,dt(f,Y[s],2*Y[s])),w=dt(f,2*Y[s]);return n.assign(e,{keys:{key:u,ct:l,passwordVerification:w},et:new ot(new rt(u),t.from($)),st:new ct(l)}),w}function pt(t,n){return n===v?function(t){if(typeof w==b){t=unescape(encodeURIComponent(t));const n=new o(t.length);for(let e=0;e<n.length;e++)n[e]=t.charCodeAt(e);return n}return(new w).encode(t)}(t):n}function dt(t,n,e){return t.subarray(n,e)}function yt(t,n){return t.v(n)}function mt(t,n){return t.C(n)}class St extends d{constructor({password:t,rawPassword:n,passwordVerification:e,checkPasswordOnly:s}){super({start(){vt(this,t,n,e)},transform(t,n){const e=this;if(e.password||e.rawPassword){const n=bt(e,t.subarray(0,12));if(e.password=e.rawPassword=null,0!=(n[11]^e.passwordVerification))throw new r(O);t=t.subarray(12)}s?n.error(new r(j)):n.enqueue(bt(e,t))}})}}class gt extends d{constructor({password:t,rawPassword:n,passwordVerification:e}){super({start(){vt(this,t,n,e)},transform(t,n){const e=this;let s,r;if(e.password||e.rawPassword){e.password=e.rawPassword=null;const n=H(new o(12));n[11]=e.passwordVerification,s=new o(t.length+n.length),s.set(kt(e,n),0),r=12}else s=new o(t.length),r=0;s.set(kt(e,t),r),n.enqueue(s)}})}}function vt(t,e,s,r){n.assign(t,{password:e,rawPassword:s,passwordVerification:r}),function(t,e,s){const r=[305419896,591751049,878082192];if(n.assign(t,{keys:r,it:new R(r[0]),ft:new R(r[2])}),s)for(let n=0;n<s.length;n++)zt(t,s[n]);else for(let n=0;n<e.length;n++)zt(t,e.charCodeAt(n))}(t,e,s)}function bt(t,n){const e=new o(n.length);for(let s=0;s<n.length;s++)e[s]=Ct(t)^n[s],zt(t,e[s]);return e}function kt(t,n){const e=new o(n.length);for(let s=0;s<n.length;s++)e[s]=Ct(t)^n[s],zt(t,n[s]);return e}function zt(t,n){let[,e]=t.keys;t.it.append([n]);const r=~t.it.get();e=At(s.imul(At(e+It(r)),134775813)+1),t.ft.append([e>>>24]);const o=~t.ft.get();t.keys=[r,e,o]}function Ct(t){const n=2|t.keys[2];return It(s.imul(n,1^n)>>>8)}function It(t){return 255&t}function At(t){return 4294967295&t}function xt(t){if(t instanceof y)return t;const n=t.getReader();return new y({async pull(t){const{value:e,done:s}=await n.read();s?t.close():t.enqueue(e)},cancel:t=>n.cancel(t)})}const Mt=new f;function Pt(t){return Mt.get(t)}const Bt="Invalid uncompressed size",Dt="deflate-raw",Ft="gzip",Rt=[31,139,8];class Ut extends d{constructor(t,{chunkSize:n,CompressionStreamFallback:e,CompressionStream:s}){super({});const{compressed:r,encrypted:o,useCompressionStream:c,zipCrypto:i,computeCrc32:a,level:f,deflate64:l,format:w,compressionMethod:h,inputSize:p}=t,d=this;let y,m,S,g=super.readable;const v=w&&Pt(w),b=a&&r&&!l&&!v&&(!o||i)&&Boolean(c&&s);if(o&&!i||!a||b||(y=new U,g=Lt(g,y)),r)if(v)g=Ot(g,Kt(v.CompressionStream,w,{level:f,chunkSize:n,compressionMethod:h,uncompressedSize:p}));else if(b)S=new Wt,g=Ot(g,new s(Ft)),g=Lt(g,S);else try{g=Et(g,c,{level:f,chunkSize:n},s,e)}catch(t){let n;try{n=new s(Ft)}catch{throw t}g=Ot(g,n),g=Lt(g,new Wt)}o&&(i?g=Lt(g,new gt(t)):(m=new ut(t),g=Lt(g,m))),Vt(d,g,()=>{o&&!i||!a||(d.crc32=b?S.crc32:new u(y.value.buffer).getUint32(0))})}}class Wt extends d{constructor(){let t,n=10,e=new o(0);super({transform(t,r){if(n){const e=s.min(n,t.length);if(n-=e,!(t=t.subarray(e)).length)return}const o=e.length+t.length;if(o<=8)return void(e=W(e,t));const c=o-8,i=s.min(c,e.length);r.enqueue(W(e.subarray(0,i),t.subarray(0,c-i))),e=W(e.subarray(i),t.subarray(c-i))},flush(){const n=_(e);t.crc32=n.getUint32(0,!0),t.uncompressedSize=n.getUint32(4,!0)}}),t=this}}class _t extends d{constructor(t,{chunkSize:n,DecompressionStreamFallback:e,DecompressionStream:s}){super({});const{zipCrypto:c,encrypted:i,checkCrc32:a,crc32:f,compressed:w,useCompressionStream:h,deflate64:p,format:m,compressionMethod:S,rawBitFlag:g,outputSize:b}=t;let k,z,C=super.readable;if(i&&(c?C=Lt(C,new St(t)):(z=new ft(t),C=Lt(C,z))),w){const t=m&&Pt(m);if(t)C=Ot(C,Kt(t.DecompressionStream,m,{chunkSize:n,compressionMethod:S,rawBitFlag:g,uncompressedSize:b}));else try{C=Et(C,h,{chunkSize:n,deflate64:p},s,e)}catch(t){if(p||b===v)throw t;let n;try{n=new s(Ft)}catch{throw t}C=function(t,n,e){const s=new R;let c,i,a,f=0,u=!1;const w=new l((t,n)=>{i=t,a=n});w.catch(()=>{}),e||i();const h=new d({start(t){const n=new o(10);n.set(Rt),t.enqueue(n)},transform(t,n){n.enqueue(t)},async flush(t){u=!0,y();try{await w}finally{m()}const n=new o(8),r=_(n);r.setUint32(0,s.get(),!0),r.setUint32(4,e,!0),t.enqueue(n)},cancel(t){a(t)}}),p=new d({transform(t,n){s.append(t),f+=t.length,f>=e?i():u&&y(),n.enqueue(t)},cancel(t){a(t)}});return t=Lt(t,h),Lt(t=Ot(t,n),p);function y(){m(),c=setTimeout(()=>a(new r(Bt)),5e3)}function m(){clearTimeout(c)}}(C,n,b)}C=function(t){const n=t.getReader();return new y({async pull(t){let e;try{e=await n.read()}catch(t){if(t&&t.message)throw t;const n=new r("Invalid compressed data");throw n.cause=t,n}const{value:s,done:o}=e;o?t.close():t.enqueue(s)},cancel:t=>n.cancel(t)})}(C)}a&&(k=new U,C=Lt(C,k)),Vt(this,C,()=>{if(a){const t=new u(k.value.buffer);if(f!=t.getUint32(0,!1))throw new r("Invalid CRC32")}})}}const Tt=new f;function Vt(t,e,s){e=Lt(e,new d({flush:s})),n.defineProperty(t,"readable",{get:()=>e})}function Kt(t,n,e){if(!t)throw new r("Compression method not supported");return new t(n,e)}function Et(t,n,e,s,r){const o=n&&s?s:r||s,c=e.deflate64?"deflate64-raw":Dt;let i;try{i=new o(c,e)}catch(t){if(!n||!r||o==r)throw t;i=new r(c,e)}return Ot(t,i)}function Lt(t,n){return xt(t).pipeThrough(n)}function Ot(t,n){const e=n.writable.getWriter(),s=t.getReader();return async function(){try{for(;;){await e.ready;const t=await s.read();if(t.done){await e.close();break}await e.write(t.value)}}catch(t){await async function(t,n){try{await t.abort(n)}catch{}}(e,t),await async function(t,n){try{await t.cancel(n)}catch{}}(s,t)}}(),n.readable}const jt="data",Ht="close",Nt="deflate";class qt extends d{constructor(t,e){super({});const s=this,{codecType:o}=t;let c;o.startsWith(Nt)?c=Ut:o.startsWith("inflate")&&(c=_t),s.outputSize=0;let i=0;const a=new c(t,e),f=super.readable,u=new d({transform(t,n){t&&t.length&&(i+=t.length,n.enqueue(t))},flush(){n.assign(s,{inputSize:i})}}),l=new d({transform(n,e){if(n&&n.length&&(e.enqueue(n),s.outputSize+=n.length,t.outputSize!==v&&s.outputSize>t.outputSize))throw new r(Bt)},flush(){const{crc32:t}=a;n.assign(s,{crc32:t,inputSize:i})}});n.defineProperty(s,"readable",{get:()=>f.pipeThrough(u).pipeThrough(a).pipeThrough(l)})}}class Gt extends d{constructor(t){const n=[];let s=0;function r(){const e=new o(t);let r=0;for(;r<t;){const s=n[0],o=t-r;s.length<=o?(e.set(s,r),r+=s.length,n.shift()):(e.set(s.subarray(0,o),r),n[0]=s.subarray(o),r+=o)}return s-=t,e}(!e.isFinite(t)||t<1)&&(t=65536),super({transform(e,o){for(n.push(e),s+=e.length;s>t;)o.enqueue(r())},flush(t){s&&t.enqueue(function(t,n){const e=new o(n);let s=0;for(const n of t)e.set(n,s),s+=n.length;return e}(n,s))}})}}let Jt=2;try{typeof navigator!=b&&navigator.hardwareConcurrency&&(Jt=navigator.hardwareConcurrency)}catch{}const Qt=new f,Xt=new f;let Yt,Zt=0;async function $t(t){let n,o;try{const{options:c,config:i}=t;if(c.format)try{await async function(t,n){!Mt.has(t)&&n&&function(t,n){const{CompressionStream:e,DecompressionStream:s}=n;if(typeof e!=k&&typeof s!=k)throw new r("Invalid codec module");Mt.set(t,{CompressionStream:e,DecompressionStream:s})}(t,await(import(n)))}(c.format,c.codecURI)}catch(t){throw t.codecImportFailed=!0,t}if(i.CompressionStream=self.CompressionStream,i.DecompressionStream=self.DecompressionStream,c.compressed&&!c.format)if(c.useCompressionStream){if(!function(t,n){if(!t)return!1;let e=Tt.get(t);e||(e=new f,Tt.set(t,e));let s=e.get(n);if(s===v){try{new t(n),s=!0}catch{s=!1}e.set(n,s)}return s}(c.codecType.startsWith(Nt)?i.CompressionStream:i.DecompressionStream,Dt))try{await self.initModule(t.config)}catch{}}else try{await self.initModule(t.config)}catch{c.useCompressionStream=!0}!i.CompressionStreamFallback&&i.CompressionStreamZlib&&(i.CompressionStreamFallback=i.CompressionStreamZlib),!i.DecompressionStreamFallback&&i.DecompressionStreamZlib&&(i.DecompressionStreamFallback=i.DecompressionStreamZlib);const a={highWaterMark:1},u=t.readable?xt(t.readable):new y({async pull(t){const n=new l(t=>Qt.set(Zt,t));tn({type:"pull",messageId:Zt}),Zt=(Zt+1)%e.MAX_SAFE_INTEGER;const{value:s,done:r}=await n;t.enqueue(s),r&&t.close()}},a);o=t.writable?function(t){if(t instanceof m)return t;const n=t.getWriter();return new m({write:t=>n.write(t),close:()=>n.close(),abort:t=>n.abort(t)})}(t.writable):new m({async write(t){let n;const s=new l(t=>n=t);Xt.set(Zt,n),tn({type:jt,value:t,messageId:Zt}),Zt=(Zt+1)%e.MAX_SAFE_INTEGER,await s}},a),n=new qt(c,i),Yt=new AbortController;const{signal:w}=Yt;await u.pipeThrough(n).pipeThrough(new Gt(function(t){return r="string"==typeof(n=r=t.chunkSize)&&n.trim()?e(n):n,e.isInteger(r)&&r>=1?s.max(r,64):65536;var n,r}(i))).pipeTo(o,{signal:w,preventClose:!0,preventAbort:!0}),await o.getWriter().close();const{crc32:h,inputSize:p,outputSize:d}=n;tn({type:Ht,result:{crc32:h,inputSize:p,outputSize:d}})}catch(t){if(t.outputSize=n?n.outputSize:0,o&&!o.locked)try{await o.getWriter().close()}catch{}nn(t)}}function tn(t){const{value:n}=t;if(n)if(n.length)try{t.value=(e=n,e.byteOffset||e.byteLength!=e.buffer.byteLength?new o(e):e).buffer,p(t,[t.value])}catch{p(t)}else p(t);else p(t);var e}function nn(t=new r("Unknown error")){const{message:n,stack:e,code:s,name:o,outputSize:c,cause:i,codecImportFailed:a}=t,f={message:n,stack:e,code:s,name:o,outputSize:c};i&&(f.cause={name:i.name,message:i.message}),a&&(f.codecImportFailed=!0),p({error:f})}addEventListener("message",({data:t})=>{const{type:n,messageId:e,value:s,done:r}=t;try{if("start"==n&&$t(t),n==jt){const t=Qt.get(e);Qt.delete(e),t({value:s||new o,done:r})}if("ack"==n){const t=Xt.get(e);Xt.delete(e),t()}n==Ht&&Yt.abort()}catch(t){nn(t)}}),p({type:"ready"});const en="deflate",sn="deflate-raw",rn="deflate64-raw",on="gzip";let cn,an,fn,un,ln;function wn(t,n,e={}){if(!cn){const t=new r("WASM module not loaded");throw t.cause=ln,t}const c="number"==typeof e.level?e.level:-1,i="number"==typeof e.outBuffer?e.outBuffer:65536,a="number"==typeof e.inBufferSize?e.inBufferSize:65536;return new d({start(){try{let e;if(this.ut=an(i),this.in=an(a),this.inBufferSize=a,!this.ut||!this.in)throw new r("allocation failed");if(this.lt=new o(i),t?(this.wt=cn.deflate_process,this.ht=cn.deflate_last_consumed,this.yt=cn.deflate_end,this.St=cn.deflate_new(),e=n===on?cn.deflate_init_gzip(this.St,c):n===sn?cn.deflate_init_raw(this.St,c):cn.deflate_init(this.St,c)):n===rn?(this.wt=cn.inflate9_process,this.ht=cn.inflate9_last_consumed,this.yt=cn.inflate9_end,this.St=cn.inflate9_new(),e=cn.inflate9_init_raw(this.St)):(this.wt=cn.inflate_process,this.ht=cn.inflate_last_consumed,this.yt=cn.inflate_end,this.St=cn.inflate_new(),e=n===sn?cn.inflate_init_raw(this.St):n===on?cn.inflate_init_gzip(this.St):cn.inflate_init(this.St)),0!==e)throw new r("init failed:"+e)}catch(t){throw f(this),t}},transform(t,n){try{const e=t,c=new o(un.buffer),a=this.wt,f=this.ht,u=this.ut,l=this.lt;let w=0;for(;w<e.length;){const t=s.min(e.length-w,32768);if((!this.in||this.inBufferSize<t)&&(this.in&&fn&&(fn(this.in),this.in=0),this.in=an(t),this.inBufferSize=t,!this.in))throw new r("allocation failed");c.set(e.subarray(w,w+t),this.in);const o=a(this.St,this.in,t,u,i,0),h=o>>24&255,p=128&h?h-256:h;if(p<0)throw new r("process error:"+p);const d=16777215&o;d&&(l.set(c.subarray(u,u+d),0),n.enqueue(l.slice(0,d)));const y=f(this.St);if(0===y&&0===d)break;w+=y}}catch(t){f(this),n.error(t)}},flush(t){try{const n=new o(un.buffer),e=this.wt,s=this.ut,c=this.lt;for(;;){const o=e(this.St,0,0,s,i,4),a=o>>24&255,f=128&a?a-256:a;if(f<0)throw new r("process error:"+f);const u=16777215&o;if(u&&(c.set(n.subarray(s,s+u),0),t.enqueue(c.slice(0,u))),1===a||0===u)break}}catch(n){t.error(n)}finally{const n=f(this);0!==n&&t.error(new r("end error:"+n))}},cancel(){f(this)}});function f(t){let n=0;return t.St&&t.yt&&(n=t.yt(t.St)),t.St=0,t.in&&fn&&fn(t.in),t.in=0,t.ut&&fn&&fn(t.ut),t.ut=0,n}}class hn{constructor(t=en,n){return wn(!0,t,n)}}class pn{constructor(t=en,n){return wn(!1,t,n)}}hn.gt=!0,pn.gt=!0,hn.vt=[en,sn,on],pn.vt=[en,sn,on,rn];let dn=!1;!function(t={}){const{init:n}=t,e=t.CompressionStreamFallback||t.CompressionStreamZlib,s=t.DecompressionStreamFallback||t.DecompressionStreamZlib;self.initModule=async t=>{n&&await n(t),e&&(t.CompressionStreamFallback=e),s&&(t.DecompressionStreamFallback=s)}}({CompressionStreamFallback:hn,DecompressionStreamFallback:pn,init:t=>async function(t,{baseURI:n}){if(!dn)try{await async function(t,n){let e,s;try{try{s=new URL(t,n)}catch{}const r=await fetch(s);e=await r.arrayBuffer()}catch(n){if(!t.startsWith("data:application/wasm;base64,"))throw n;e=function(t){const n=t.split(",")[1],e=atob(n),s=e.length,r=new o(s);for(let t=0;t<s;++t)r[t]=e.charCodeAt(t);return r.buffer}(t)}!function(t){if(cn=t,({malloc:an,free:fn,memory:un}=cn),"function"!=typeof an||"function"!=typeof fn||!un)throw cn=an=fn=un=null,new r("Invalid WASM module")}((await WebAssembly.instantiate(e)).instance.exports)}(t,n),dn=!0}catch(t){throw function(t){ln=t}(t),t}}(t.wasmURI,t)})});\n';if("string"==typeof s&&(s=(new TextEncoder).encode(s)),t){const t=new Blob([s],{type:n});return URL.createObjectURL(t)}return "data:"+n+";base64,"+function(t){let n="";const s=t.length;let r=0;for(;r+2<s;r+=3){const s=t[r]<<16|t[r+1]<<8|t[r+2];n+=e$1[s>>18&63]+e$1[s>>12&63]+e$1[s>>6&63]+e$1[63&s];}const o=s-r;if(1===o){const s=t[r]<<16;n+=e$1[s>>18&63]+e$1[s>>12&63]+"==";}else if(2===o){const s=t[r]<<16|t[r+1]<<8;n+=e$1[s>>18&63]+e$1[s>>12&63]+e$1[s>>6&63]+"=";}return n}(s)}});

	/*
	 Copyright (c) 2026 Gildas Lormeau. All rights reserved.

	 Redistribution and use in source and binary forms, with or without
	 modification, are permitted provided that the following conditions are met:

	 1. Redistributions of source code must retain the above copyright notice,
	 this list of conditions and the following disclaimer.

	 2. Redistributions in binary form must reproduce the above copyright
	 notice, this list of conditions and the following disclaimer in
	 the documentation and/or other materials provided with the distribution.

	 3. The names of the authors may not be used to endorse or promote products
	 derived from this software without specific prior written permission.

	 THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESSED OR IMPLIED WARRANTIES,
	 INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
	 FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL JCRAFT,
	 INC. OR ANY CONTRIBUTORS TO THIS SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT,
	 INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
	 LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
	 OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
	 LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
	 NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
	 EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
	 */


	function concat(first, second) {
		const result = new Uint8Array(first.length + second.length);
		result.set(first);
		result.set(second, first.length);
		return result;
	}

	function toExactUint8Array(array) {
		return array.byteOffset || array.byteLength != array.buffer.byteLength ? new Uint8Array(array) : array;
	}

	function getDataView(array) {
		return new DataView(array.buffer, array.byteOffset, array.byteLength);
	}

	/*
	 Copyright (c) 2022 Gildas Lormeau. All rights reserved.

	 Redistribution and use in source and binary forms, with or without
	 modification, are permitted provided that the following conditions are met:

	 1. Redistributions of source code must retain the above copyright notice,
	 this list of conditions and the following disclaimer.

	 2. Redistributions in binary form must reproduce the above copyright 
	 notice, this list of conditions and the following disclaimer in 
	 the documentation and/or other materials provided with the distribution.

	 3. The names of the authors may not be used to endorse or promote products
	 derived from this software without specific prior written permission.

	 THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESSED OR IMPLIED WARRANTIES,
	 INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
	 FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL JCRAFT,
	 INC. OR ANY CONTRIBUTORS TO THIS SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT,
	 INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
	 LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
	 OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
	 LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
	 NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
	 EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
	 */

	// Slicing-by-8 CRC-32 (Intel / zlib). The eight 256-entry tables let the inner loop
	// consume 8 bytes per iteration with a shorter dependency chain, ~4x the byte-at-a-time
	// rate (measured ~320 -> ~1400 MB/s on 64KB chunks).
	//
	// Every table MUST stay a PACKED_SMI array: build with array literals (not `new Array(n)`,
	// which is HOLEY) and store the signed int32 XOR result (no `>>> 0`). An unsigned or holey
	// table becomes a V8 FixedDoubleArray whose every hot-loop lookup unboxes a double (~1.6x
	// slower). Signedness is irrelevant to the result: the reads mask/shift it and the final
	// `~crc` normalizes it. Do NOT reintroduce `>>> 0` here or switch to `new Array(256)`.
	const T = [[], [], [], [], [], [], [], []];
	for (let n = 0; n < 256; n++) {
		let t = n;
		for (let j = 0; j < 8; j++) {
			t = (t & 1) ? (t >>> 1) ^ 0xEDB88320 : t >>> 1;
		}
		T[0][n] = t;
	}
	for (let n = 0; n < 256; n++) {
		for (let k = 1; k < 8; k++) {
			const previous = T[k - 1][n];
			T[k][n] = (previous >>> 8) ^ T[0][previous & 0xFF];
		}
	}
	const [T0, T1, T2, T3, T4, T5, T6, T7] = T;

	class Crc32 {

		constructor(crc) {
			this.crc = crc || -1;
		}

		append(data) {
			let crc = this.crc | 0;
			const length = data.length | 0;
			let offset = 0;
			// Process 8 bytes per iteration over the typed-array body. DataView.getInt32(le)
			// reads an unaligned little-endian word as a signed int32 (no double boxing), so no
			// alignment or endianness handling is needed; data.buffer guards non-typed inputs.
			if (length >= 8 && data.buffer) {
				const view = new DataView(data.buffer, data.byteOffset, length);
				const end = length - 8;
				for (; offset <= end; offset += 8) {
					const a = crc ^ view.getInt32(offset, true);
					const b = view.getInt32(offset + 4, true);
					crc = T7[a & 0xFF] ^ T6[(a >>> 8) & 0xFF] ^ T5[(a >>> 16) & 0xFF] ^ T4[(a >>> 24) & 0xFF] ^
						T3[b & 0xFF] ^ T2[(b >>> 8) & 0xFF] ^ T1[(b >>> 16) & 0xFF] ^ T0[(b >>> 24) & 0xFF];
				}
			}
			// Remaining tail (and non-typed inputs) byte-at-a-time with the base table.
			for (; offset < length; offset++) {
				crc = (crc >>> 8) ^ T0[(crc ^ data[offset]) & 0xFF];
			}
			this.crc = crc;
		}

		get() {
			return ~this.crc;
		}
	}

	/*
	 Copyright (c) 2022 Gildas Lormeau. All rights reserved.

	 Redistribution and use in source and binary forms, with or without
	 modification, are permitted provided that the following conditions are met:

	 1. Redistributions of source code must retain the above copyright notice,
	 this list of conditions and the following disclaimer.

	 2. Redistributions in binary form must reproduce the above copyright 
	 notice, this list of conditions and the following disclaimer in 
	 the documentation and/or other materials provided with the distribution.

	 3. The names of the authors may not be used to endorse or promote products
	 derived from this software without specific prior written permission.

	 THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESSED OR IMPLIED WARRANTIES,
	 INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
	 FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL JCRAFT,
	 INC. OR ANY CONTRIBUTORS TO THIS SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT,
	 INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
	 LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
	 OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
	 LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
	 NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
	 EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
	 */


	class Crc32Stream extends TransformStream {

		constructor() {
			// deno-lint-ignore prefer-const
			let stream;
			const crc32 = new Crc32();
			super({
				transform(chunk, controller) {
					crc32.append(chunk);
					controller.enqueue(chunk);
				},
				flush() {
					const value = new Uint8Array(4);
					const dataView = new DataView(value.buffer);
					dataView.setUint32(0, crc32.get());
					stream.value = value;
				}
			});
			stream = this;
		}
	}

	/*
	 Copyright (c) 2022 Gildas Lormeau. All rights reserved.

	 Redistribution and use in source and binary forms, with or without
	 modification, are permitted provided that the following conditions are met:

	 1. Redistributions of source code must retain the above copyright notice,
	 this list of conditions and the following disclaimer.

	 2. Redistributions in binary form must reproduce the above copyright 
	 notice, this list of conditions and the following disclaimer in 
	 the documentation and/or other materials provided with the distribution.

	 3. The names of the authors may not be used to endorse or promote products
	 derived from this software without specific prior written permission.

	 THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESSED OR IMPLIED WARRANTIES,
	 INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
	 FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL JCRAFT,
	 INC. OR ANY CONTRIBUTORS TO THIS SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT,
	 INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
	 LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
	 OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
	 LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
	 NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
	 EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
	 */


	function encodeText(value) {
		// deno-lint-ignore valid-typeof
		if (typeof TextEncoder == UNDEFINED_TYPE) {
			value = unescape(encodeURIComponent(value));
			const result = new Uint8Array(value.length);
			for (let i = 0; i < result.length; i++) {
				result[i] = value.charCodeAt(i);
			}
			return result;
		} else {
			return new TextEncoder().encode(value);
		}
	}

	// Derived from https://github.com/xqdoo00o/jszip/blob/master/lib/sjcl.js and https://github.com/bitwiseshiftleft/sjcl

	// deno-lint-ignore-file no-this-alias

	/*
	 * SJCL is open. You can use, modify and redistribute it under a BSD
	 * license or under the GNU GPL, version 2.0.
	 */

	/** @fileOverview Javascript cryptography implementation.
	 *
	 * Crush to remove comments, shorten variable names and
	 * generally reduce transmission size.
	 *
	 * @author Emily Stark
	 * @author Mike Hamburg
	 * @author Dan Boneh
	 */

	/*jslint indent: 2, bitwise: false, nomen: false, plusplus: false, white: false, regexp: false */

	/** @fileOverview Arrays of bits, encoded as arrays of Numbers.
	 *
	 * @author Emily Stark
	 * @author Mike Hamburg
	 * @author Dan Boneh
	 */

	/**
	 * Arrays of bits, encoded as arrays of Numbers.
	 * @namespace
	 * @description
	 * <p>
	 * These objects are the currency accepted by SJCL's crypto functions.
	 * </p>
	 *
	 * <p>
	 * Most of our crypto primitives operate on arrays of 4-byte words internally,
	 * but many of them can take arguments that are not a multiple of 4 bytes.
	 * This library encodes arrays of bits (whose size need not be a multiple of 8
	 * bits) as arrays of 32-bit words.  The bits are packed, big-endian, into an
	 * array of words, 32 bits at a time.  Since the words are double-precision
	 * floating point numbers, they fit some extra data.  We use this (in a private,
	 * possibly-changing manner) to encode the number of bits actually  present
	 * in the last word of the array.
	 * </p>
	 *
	 * <p>
	 * Because bitwise ops clear this out-of-band data, these arrays can be passed
	 * to ciphers like AES which want arrays of words.
	 * </p>
	 */
	const bitArray = {
		/**
		 * Concatenate two bit arrays.
		 * @param {bitArray} a1 The first array.
		 * @param {bitArray} a2 The second array.
		 * @return {bitArray} The concatenation of a1 and a2.
		 */
		concat(a1, a2) {
			if (a1.length === 0 || a2.length === 0) {
				return a1.concat(a2);
			}

			const last = a1[a1.length - 1], shift = bitArray.getPartial(last);
			if (shift === 32) {
				return a1.concat(a2);
			} else {
				return bitArray._shiftRight(a2, shift, last | 0, a1.slice(0, a1.length - 1));
			}
		},

		/**
		 * Find the length of an array of bits.
		 * @param {bitArray} a The array.
		 * @return {Number} The length of a, in bits.
		 */
		bitLength(a) {
			const l = a.length;
			if (l === 0) {
				return 0;
			}
			const x = a[l - 1];
			return (l - 1) * 32 + bitArray.getPartial(x);
		},

		/**
		 * Truncate an array.
		 * @param {bitArray} a The array.
		 * @param {Number} len The length to truncate to, in bits.
		 * @return {bitArray} A new array, truncated to len bits.
		 */
		clamp(a, len) {
			if (a.length * 32 < len) {
				return a;
			}
			a = a.slice(0, Math.ceil(len / 32));
			const l = a.length;
			len = len & 31;
			if (l > 0 && len) {
				a[l - 1] = bitArray.partial(len, a[l - 1] & 0x80000000 >> (len - 1), 1);
			}
			return a;
		},

		/**
		 * Make a partial word for a bit array.
		 * @param {Number} len The number of bits in the word.
		 * @param {Number} x The bits.
		 * @param {Number} [_end=0] Pass 1 if x has already been shifted to the high side.
		 * @return {Number} The partial word.
		 */
		partial(len, x, _end) {
			if (len === 32) {
				return x;
			}
			return (_end ? x | 0 : x << (32 - len)) + len * 0x10000000000;
		},

		/**
		 * Get the number of bits used by a partial word.
		 * @param {Number} x The partial word.
		 * @return {Number} The number of bits used by the partial word.
		 */
		getPartial(x) {
			return Math.round(x / 0x10000000000) || 32;
		},

		/** Shift an array right.
		 * @param {bitArray} a The array to shift.
		 * @param {Number} shift The number of bits to shift.
		 * @param {Number} [carry=0] A byte to carry in
		 * @param {bitArray} [out=[]] An array to prepend to the output.
		 * @private
		 */
		_shiftRight(a, shift, carry, out) {
			if (out === undefined) {
				out = [];
			}

			for (; shift >= 32; shift -= 32) {
				out.push(carry);
				carry = 0;
			}
			if (shift === 0) {
				return out.concat(a);
			}

			for (let i = 0; i < a.length; i++) {
				out.push(carry | a[i] >>> shift);
				carry = a[i] << (32 - shift);
			}
			const last2 = a.length ? a[a.length - 1] : 0;
			const shift2 = bitArray.getPartial(last2);
			out.push(bitArray.partial(shift + shift2 & 31, (shift + shift2 > 32) ? carry : out.pop(), 1));
			return out;
		}
	};

	/** @fileOverview Bit array codec implementations.
	 *
	 * @author Emily Stark
	 * @author Mike Hamburg
	 * @author Dan Boneh
	 */

	/**
	 * Arrays of bytes
	 * @namespace
	 */
	const codec = {
		bytes: {
			/** Convert from a bitArray to an array of bytes. */
			fromBits(arr) {
				const bl = bitArray.bitLength(arr);
				const byteLength = bl / 8;
				const out = new Uint8Array(byteLength);
				let tmp;
				for (let i = 0; i < byteLength; i++) {
					if ((i & 3) === 0) {
						tmp = arr[i / 4];
					}
					out[i] = tmp >>> 24;
					tmp <<= 8;
				}
				return out;
			},
			/** Convert from an array of bytes to a bitArray. */
			toBits(bytes) {
				const out = [];
				let i;
				let tmp = 0;
				for (i = 0; i < bytes.length; i++) {
					tmp = tmp << 8 | bytes[i];
					if ((i & 3) === 3) {
						out.push(tmp);
						tmp = 0;
					}
				}
				if (i & 3) {
					out.push(bitArray.partial(8 * (i & 3), tmp));
				}
				return out;
			}
		}
	};

	const hash = {};

	/**
	 * Context for a SHA-1 operation in progress.
	 * @constructor
	 */
	hash.sha1 = class {
		constructor(hash) {
			const sha1 = this;
			/**
			 * The hash's block size, in bits.
			 * @constant
			 */
			sha1.blockSize = 512;
			/**
			 * The SHA-1 initialization vector.
			 * @private
			 */
			sha1._init = [0x67452301, 0xEFCDAB89, 0x98BADCFE, 0x10325476, 0xC3D2E1F0];
			/**
			 * The SHA-1 hash key.
			 * @private
			 */
			sha1._key = [0x5A827999, 0x6ED9EBA1, 0x8F1BBCDC, 0xCA62C1D6];
			if (hash) {
				sha1._h = hash._h.slice(0);
				sha1._buffer = hash._buffer.slice(0);
				sha1._length = hash._length;
			} else {
				sha1.reset();
			}
		}

		/**
		 * Reset the hash state.
		 * @return this
		 */
		reset() {
			const sha1 = this;
			sha1._h = sha1._init.slice(0);
			sha1._buffer = [];
			sha1._length = 0;
			return sha1;
		}

		/**
		 * Input several words to the hash.
		 * @param {bitArray|String} data the data to hash.
		 * @return this
		 */
		update(data) {
			const sha1 = this;
			if (typeof data === "string") {
				data = codec.utf8String.toBits(data);
			}
			const b = sha1._buffer = bitArray.concat(sha1._buffer, data);
			const ol = sha1._length;
			const nl = sha1._length = ol + bitArray.bitLength(data);
			if (nl > 9007199254740991) {
				throw new Error("Cannot hash more than 2^53 - 1 bits");
			}
			const c = new Uint32Array(b);
			let j = 0;
			for (let i = sha1.blockSize + ol - ((sha1.blockSize + ol) & (sha1.blockSize - 1)); i <= nl;
				i += sha1.blockSize) {
				sha1._block(c.subarray(16 * j, 16 * (j + 1)));
				j += 1;
			}
			b.splice(0, 16 * j);
			return sha1;
		}

		/**
		 * Complete hashing and output the hash value.
		 * @return {bitArray} The hash value, an array of 5 big-endian words. TODO
		 */
		finalize() {
			const sha1 = this;
			let b = sha1._buffer;
			const h = sha1._h;

			// Round out and push the buffer
			b = bitArray.concat(b, [bitArray.partial(1, 1)]);
			// Round out the buffer to a multiple of 16 words, less the 2 length words.
			for (let i = b.length + 2; i & 15; i++) {
				b.push(0);
			}

			// append the length
			b.push(Math.floor(sha1._length / 0x100000000));
			b.push(sha1._length | 0);

			while (b.length) {
				sha1._block(b.splice(0, 16));
			}

			sha1.reset();
			return h;
		}

		/**
		 * The SHA-1 logical functions f(0), f(1), ..., f(79).
		 * @private
		 */
		_f(t, b, c, d) {
			if (t <= 19) {
				return (b & c) | (~b & d);
			} else if (t <= 39) {
				return b ^ c ^ d;
			} else if (t <= 59) {
				return (b & c) | (b & d) | (c & d);
			} else if (t <= 79) {
				return b ^ c ^ d;
			}
		}

		/**
		 * Circular left-shift operator.
		 * @private
		 */
		_S(n, x) {
			return (x << n) | (x >>> 32 - n);
		}

		/**
		 * Perform one cycle of SHA-1.
		 * @param {Uint32Array|bitArray} words one block of words.
		 * @private
		 */
		_block(words) {
			const sha1 = this;
			const h = sha1._h;
			// When words is passed to _block, it has 16 elements. SHA1 _block
			// function extends words with new elements (at the end there are 80 elements). 
			// The problem is that if we use Uint32Array instead of Array, 
			// the length of Uint32Array cannot be changed. Thus, we replace words with a 
			// normal Array here.
			const w = Array(80); // do not use Uint32Array here as the instantiation is slower
			for (let j = 0; j < 16; j++) {
				w[j] = words[j];
			}

			let a = h[0];
			let b = h[1];
			let c = h[2];
			let d = h[3];
			let e = h[4];

			for (let t = 0; t <= 79; t++) {
				if (t >= 16) {
					w[t] = sha1._S(1, w[t - 3] ^ w[t - 8] ^ w[t - 14] ^ w[t - 16]);
				}
				const tmp = (sha1._S(5, a) + sha1._f(t, b, c, d) + e + w[t] +
					sha1._key[Math.floor(t / 20)]) | 0;
				e = d;
				d = c;
				c = sha1._S(30, b);
				b = a;
				a = tmp;
			}

			h[0] = (h[0] + a) | 0;
			h[1] = (h[1] + b) | 0;
			h[2] = (h[2] + c) | 0;
			h[3] = (h[3] + d) | 0;
			h[4] = (h[4] + e) | 0;
		}
	};

	/** @fileOverview Low-level AES implementation.
	 *
	 * This file contains a low-level implementation of AES, optimized for
	 * size and for efficiency on several browsers.  It is based on
	 * OpenSSL's aes_core.c, a public-domain implementation by Vincent
	 * Rijmen, Antoon Bosselaers and Paulo Barreto.
	 *
	 * An older version of this implementation is available in the public
	 * domain, but this one is (c) Emily Stark, Mike Hamburg, Dan Boneh,
	 * Stanford University 2008-2010 and BSD-licensed for liability
	 * reasons.
	 *
	 * @author Emily Stark
	 * @author Mike Hamburg
	 * @author Dan Boneh
	 */

	const cipher = {};

	/**
	 * Schedule out an AES key for both encryption and decryption.  This
	 * is a low-level class.  Use a cipher mode to do bulk encryption.
	 *
	 * @constructor
	 * @param {Array} key The key as an array of 4, 6 or 8 words.
	 */
	cipher.aes = class {
		constructor(key) {
			/**
			 * The expanded S-box and inverse S-box tables.  These will be computed
			 * on the client so that we don't have to send them down the wire.
			 *
			 * There are two tables, _tables[0] is for encryption and
			 * _tables[1] is for decryption.
			 *
			 * The first 4 sub-tables are the expanded S-box with MixColumns.  The
			 * last (_tables[01][4]) is the S-box itself.
			 *
			 * @private
			 */
			const aes = this;
			aes._tables = [[[], [], [], [], []], [[], [], [], [], []]];

			if (!aes._tables[0][0][0]) {
				aes._precompute();
			}

			const sbox = aes._tables[0][4];
			const decTable = aes._tables[1];
			const keyLen = key.length;

			let i, encKey, decKey, rcon = 1;

			if (keyLen !== 4 && keyLen !== 6 && keyLen !== 8) {
				throw new Error("invalid aes key size");
			}

			aes._key = [encKey = key.slice(0), decKey = []];

			// schedule encryption keys
			for (i = keyLen; i < 4 * keyLen + 28; i++) {
				let tmp = encKey[i - 1];

				// apply sbox
				if (i % keyLen === 0 || (keyLen === 8 && i % keyLen === 4)) {
					tmp = sbox[tmp >>> 24] << 24 ^ sbox[tmp >> 16 & 255] << 16 ^ sbox[tmp >> 8 & 255] << 8 ^ sbox[tmp & 255];

					// shift rows and add rcon
					if (i % keyLen === 0) {
						tmp = tmp << 8 ^ tmp >>> 24 ^ rcon << 24;
						rcon = rcon << 1 ^ (rcon >> 7) * 283;
					}
				}

				encKey[i] = encKey[i - keyLen] ^ tmp;
			}

			// schedule decryption keys
			for (let j = 0; i; j++, i--) {
				const tmp = encKey[j & 3 ? i : i - 4];
				if (i <= 4 || j < 4) {
					decKey[j] = tmp;
				} else {
					decKey[j] = decTable[0][sbox[tmp >>> 24]] ^
						decTable[1][sbox[tmp >> 16 & 255]] ^
						decTable[2][sbox[tmp >> 8 & 255]] ^
						decTable[3][sbox[tmp & 255]];
				}
			}
		}
		// public
		/* Something like this might appear here eventually
		name: "AES",
		blockSize: 4,
		keySizes: [4,6,8],
		*/

		/**
		 * Encrypt an array of 4 big-endian words.
		 * @param {Array} data The plaintext.
		 * @return {Array} The ciphertext.
		 */
		encrypt(data) {
			return this._crypt(data, 0);
		}

		/**
		 * Decrypt an array of 4 big-endian words.
		 * @param {Array} data The ciphertext.
		 * @return {Array} The plaintext.
		 */
		decrypt(data) {
			return this._crypt(data, 1);
		}

		/**
		 * Expand the S-box tables.
		 *
		 * @private
		 */
		_precompute() {
			const encTable = this._tables[0];
			const decTable = this._tables[1];
			const sbox = encTable[4];
			const sboxInv = decTable[4];
			const d = [];
			const th = [];
			let xInv, x2, x4, x8;

			// Compute double and third tables
			for (let i = 0; i < 256; i++) {
				th[(d[i] = i << 1 ^ (i >> 7) * 283) ^ i] = i;
			}

			for (let x = xInv = 0; !sbox[x]; x ^= x2 || 1, xInv = th[xInv] || 1) {
				// Compute sbox
				let s = xInv ^ xInv << 1 ^ xInv << 2 ^ xInv << 3 ^ xInv << 4;
				s = s >> 8 ^ s & 255 ^ 99;
				sbox[x] = s;
				sboxInv[s] = x;

				// Compute MixColumns
				x8 = d[x4 = d[x2 = d[x]]];
				let tDec = x8 * 0x1010101 ^ x4 * 0x10001 ^ x2 * 0x101 ^ x * 0x1010100;
				let tEnc = d[s] * 0x101 ^ s * 0x1010100;

				for (let i = 0; i < 4; i++) {
					encTable[i][x] = tEnc = tEnc << 24 ^ tEnc >>> 8;
					decTable[i][s] = tDec = tDec << 24 ^ tDec >>> 8;
				}
			}

			// Compactify.  Considerable speedup on Firefox.
			for (let i = 0; i < 5; i++) {
				encTable[i] = encTable[i].slice(0);
				decTable[i] = decTable[i].slice(0);
			}
		}

		/**
		 * Encryption and decryption core.
		 * @param {Array} input Four words to be encrypted or decrypted.
		 * @param dir The direction, 0 for encrypt and 1 for decrypt.
		 * @return {Array} The four encrypted or decrypted words.
		 * @private
		 */
		_crypt(input, dir) {
			if (input.length !== 4) {
				throw new Error("invalid aes block size");
			}

			const key = this._key[dir];

			const nInnerRounds = key.length / 4 - 2;
			const out = [0, 0, 0, 0];
			const table = this._tables[dir];

			// load up the tables
			const t0 = table[0];
			const t1 = table[1];
			const t2 = table[2];
			const t3 = table[3];
			const sbox = table[4];

			// state variables a,b,c,d are loaded with pre-whitened data
			let a = input[0] ^ key[0];
			let b = input[dir ? 3 : 1] ^ key[1];
			let c = input[2] ^ key[2];
			let d = input[dir ? 1 : 3] ^ key[3];
			let kIndex = 4;
			let a2, b2, c2;

			// Inner rounds.  Cribbed from OpenSSL.
			for (let i = 0; i < nInnerRounds; i++) {
				a2 = t0[a >>> 24] ^ t1[b >> 16 & 255] ^ t2[c >> 8 & 255] ^ t3[d & 255] ^ key[kIndex];
				b2 = t0[b >>> 24] ^ t1[c >> 16 & 255] ^ t2[d >> 8 & 255] ^ t3[a & 255] ^ key[kIndex + 1];
				c2 = t0[c >>> 24] ^ t1[d >> 16 & 255] ^ t2[a >> 8 & 255] ^ t3[b & 255] ^ key[kIndex + 2];
				d = t0[d >>> 24] ^ t1[a >> 16 & 255] ^ t2[b >> 8 & 255] ^ t3[c & 255] ^ key[kIndex + 3];
				kIndex += 4;
				a = a2; b = b2; c = c2;
			}

			// Last round.
			for (let i = 0; i < 4; i++) {
				out[dir ? 3 & -i : i] =
					sbox[a >>> 24] << 24 ^
					sbox[b >> 16 & 255] << 16 ^
					sbox[c >> 8 & 255] << 8 ^
					sbox[d & 255] ^
					key[kIndex++];
				a2 = a; a = b; b = c; c = d; d = a2;
			}

			return out;
		}
	};

	/** @fileOverview CTR mode implementation.
	 *
	 * Special thanks to Roy Nicholson for pointing out a bug in our
	 * implementation.
	 *
	 * @author Emily Stark
	 * @author Mike Hamburg
	 * @author Dan Boneh
	 */

	/** Brian Gladman's CTR Mode.
	* @constructor
	* @param {Object} _prf The aes instance to generate key.
	* @param {bitArray} _iv The iv for ctr mode, it must be 128 bits.
	*/

	const mode = {};

	/**
	 * Brian Gladman's CTR Mode.
	 * @namespace
	 */
	mode.ctrGladman = class {
		constructor(prf, iv) {
			this._prf = prf;
			this._initIv = iv;
			this._iv = iv;
		}

		reset() {
			this._iv = this._initIv;
		}

		/** Input some data to calculate.
		 * @param {bitArray} data the data to process, it must be intergral multiple of 128 bits unless it's the last.
		 */
		update(data) {
			return this.calculate(this._prf, data, this._iv);
		}

		incWord(word) {
			if (((word >> 24) & 0xff) === 0xff) { //overflow
				let b1 = (word >> 16) & 0xff;
				let b2 = (word >> 8) & 0xff;
				let b3 = word & 0xff;

				if (b1 === 0xff) { // overflow b1   
					b1 = 0;
					if (b2 === 0xff) {
						b2 = 0;
						if (b3 === 0xff) {
							b3 = 0;
						} else {
							++b3;
						}
					} else {
						++b2;
					}
				} else {
					++b1;
				}

				word = 0;
				word += (b1 << 16);
				word += (b2 << 8);
				word += b3;
			} else {
				word += (0x01 << 24);
			}
			return word;
		}

		incCounter(counter) {
			if ((counter[0] = this.incWord(counter[0])) === 0) {
				// encr_data in fileenc.c from  Dr Brian Gladman's counts only with DWORD j < 8
				counter[1] = this.incWord(counter[1]);
			}
		}

		calculate(prf, data, iv) {
			let l;
			if (!(l = data.length)) {
				return [];
			}
			const bl = bitArray.bitLength(data);
			for (let i = 0; i < l; i += 4) {
				this.incCounter(iv);
				const e = prf.encrypt(iv);
				data[i] ^= e[0];
				data[i + 1] ^= e[1];
				data[i + 2] ^= e[2];
				data[i + 3] ^= e[3];
			}
			return bitArray.clamp(data, bl);
		}
	};

	const misc = {
		importKey(password) {
			return new misc.hmacSha1(codec.bytes.toBits(password));
		},
		pbkdf2(prf, salt, count, length) {
			count = count || 10000;
			if (length < 0 || count < 0) {
				throw new Error("invalid params to pbkdf2");
			}
			const byteLength = ((length >> 5) + 1) << 2;
			let u, ui, i, j, k;
			const arrayBuffer = new ArrayBuffer(byteLength);
			const out = new DataView(arrayBuffer);
			let outLength = 0;
			const b = bitArray;
			salt = codec.bytes.toBits(salt);
			for (k = 1; outLength < (byteLength || 1); k++) {
				u = ui = prf.encrypt(b.concat(salt, [k]));
				for (i = 1; i < count; i++) {
					ui = prf.encrypt(ui);
					for (j = 0; j < ui.length; j++) {
						u[j] ^= ui[j];
					}
				}
				for (i = 0; outLength < (byteLength || 1) && i < u.length; i++) {
					out.setInt32(outLength, u[i]);
					outLength += 4;
				}
			}
			return arrayBuffer.slice(0, length / 8);
		}
	};

	/** @fileOverview HMAC implementation.
	 *
	 * @author Emily Stark
	 * @author Mike Hamburg
	 * @author Dan Boneh
	 */

	/** HMAC with the specified hash function.
	 * @constructor
	 * @param {bitArray} key the key for HMAC.
	 * @param {Object} [Hash=hash.sha1] The hash function to use.
	 */
	misc.hmacSha1 = class {

		constructor(key) {
			const hmac = this;
			const Hash = hmac._hash = hash.sha1;
			const exKey = [[], []];
			hmac._baseHash = [new Hash(), new Hash()];
			const bs = hmac._baseHash[0].blockSize / 32;

			if (key.length > bs) {
				key = new Hash().update(key).finalize();
			}

			for (let i = 0; i < bs; i++) {
				exKey[0][i] = key[i] ^ 0x36363636;
				exKey[1][i] = key[i] ^ 0x5C5C5C5C;
			}

			hmac._baseHash[0].update(exKey[0]);
			hmac._baseHash[1].update(exKey[1]);
			hmac._resultHash = new Hash(hmac._baseHash[0]);
		}
		reset() {
			const hmac = this;
			hmac._resultHash = new hmac._hash(hmac._baseHash[0]);
			hmac._updated = false;
		}

		update(data) {
			const hmac = this;
			hmac._updated = true;
			hmac._resultHash.update(data);
		}

		digest() {
			const hmac = this;
			const w = hmac._resultHash.finalize();
			const result = new (hmac._hash)(hmac._baseHash[1]).update(w).finalize();

			hmac.reset();

			return result;
		}

		encrypt(data) {
			if (!this._updated) {
				this.update(data);
				return this.digest(data);
			} else {
				throw new Error("encrypt on already updated hmac called!");
			}
		}
	};

	/*
	 Copyright (c) 2022 Gildas Lormeau. All rights reserved.

	 Redistribution and use in source and binary forms, with or without
	 modification, are permitted provided that the following conditions are met:

	 1. Redistributions of source code must retain the above copyright notice,
	 this list of conditions and the following disclaimer.

	 2. Redistributions in binary form must reproduce the above copyright 
	 notice, this list of conditions and the following disclaimer in 
	 the documentation and/or other materials provided with the distribution.

	 3. The names of the authors may not be used to endorse or promote products
	 derived from this software without specific prior written permission.

	 THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESSED OR IMPLIED WARRANTIES,
	 INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
	 FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL JCRAFT,
	 INC. OR ANY CONTRIBUTORS TO THIS SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT,
	 INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
	 LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
	 OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
	 LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
	 NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
	 EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
	 */


	const GET_RANDOM_VALUES_SUPPORTED = typeof crypto != UNDEFINED_TYPE && typeof crypto.getRandomValues == FUNCTION_TYPE;

	const ERR_INVALID_PASSWORD = "Invalid password";
	const ERR_INVALID_AUTHENTICATION_CODE = "Invalid authentication code";
	const ERR_ABORT_CHECK_PASSWORD = "zipjs-abort-check-password";
	const ERR_UNSUPPORTED_CRYPTO_API = "Crypto API not supported";

	function getRandomValues(array) {
		if (GET_RANDOM_VALUES_SUPPORTED) {
			return crypto.getRandomValues(array);
		} else {
			throw new Error(ERR_UNSUPPORTED_CRYPTO_API);
		}
	}

	/*
	 Copyright (c) 2022 Gildas Lormeau. All rights reserved.

	 Redistribution and use in source and binary forms, with or without
	 modification, are permitted provided that the following conditions are met:

	 1. Redistributions of source code must retain the above copyright notice,
	 this list of conditions and the following disclaimer.

	 2. Redistributions in binary form must reproduce the above copyright 
	 notice, this list of conditions and the following disclaimer in 
	 the documentation and/or other materials provided with the distribution.

	 3. The names of the authors may not be used to endorse or promote products
	 derived from this software without specific prior written permission.

	 THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESSED OR IMPLIED WARRANTIES,
	 INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
	 FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL JCRAFT,
	 INC. OR ANY CONTRIBUTORS TO THIS SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT,
	 INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
	 LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
	 OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
	 LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
	 NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
	 EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
	 */


	const BLOCK_LENGTH = 16;
	const RAW_FORMAT = "raw";
	const PBKDF2_ALGORITHM = { name: "PBKDF2" };
	const HASH_ALGORITHM = { name: "HMAC" };
	const HASH_FUNCTION = "SHA-1";
	const BASE_KEY_ALGORITHM = Object.assign({ hash: HASH_ALGORITHM }, PBKDF2_ALGORITHM);
	const DERIVED_BITS_ALGORITHM = Object.assign({ iterations: 1000, hash: { name: HASH_FUNCTION } }, PBKDF2_ALGORITHM);
	const DERIVED_BITS_USAGE = ["deriveBits"];
	const SALT_LENGTH = [8, 12, 16];
	const KEY_LENGTH = [16, 24, 32];
	const AUTHENTICATION_CODE_LENGTH = 10;
	const COUNTER_DEFAULT_VALUE = [0, 0, 0, 0];
	// deno-lint-ignore valid-typeof
	const CRYPTO_API_SUPPORTED = typeof crypto != UNDEFINED_TYPE;
	const subtle = CRYPTO_API_SUPPORTED && crypto.subtle;
	const SUBTLE_API_SUPPORTED = CRYPTO_API_SUPPORTED && typeof subtle != UNDEFINED_TYPE;
	const codecBytes = codec.bytes;
	const Aes = cipher.aes;
	const CtrGladman = mode.ctrGladman;
	const HmacSha1 = misc.hmacSha1;

	let IMPORT_KEY_SUPPORTED = CRYPTO_API_SUPPORTED && SUBTLE_API_SUPPORTED && typeof subtle.importKey == FUNCTION_TYPE;
	let DERIVE_BITS_SUPPORTED = CRYPTO_API_SUPPORTED && SUBTLE_API_SUPPORTED && typeof subtle.deriveBits == FUNCTION_TYPE;

	class AESDecryptionStream extends TransformStream {

		constructor({ password, rawPassword, encryptionStrength, checkPasswordOnly, checkAuthenticationCode = true }) {
			super({
				start() {
					initAesCrypto(this, password, rawPassword, encryptionStrength);
				},
				async transform(chunk, controller) {
					const aesCrypto = this;
					const {
						password,
						strength,
						resolveReady,
						ready
					} = aesCrypto;
					if (password) {
						await createDecryptionKeys(aesCrypto, strength, password, subarray(chunk, 0, SALT_LENGTH[strength] + 2));
						chunk = subarray(chunk, SALT_LENGTH[strength] + 2);
						if (checkPasswordOnly) {
							controller.error(new Error(ERR_ABORT_CHECK_PASSWORD));
						} else {
							resolveReady();
						}
					} else {
						await ready;
					}
					const output = new Uint8Array(chunk.length - AUTHENTICATION_CODE_LENGTH - ((chunk.length - AUTHENTICATION_CODE_LENGTH) % BLOCK_LENGTH));
					controller.enqueue(append(aesCrypto, chunk, output, 0, AUTHENTICATION_CODE_LENGTH, true));
				},
				async flush(controller) {
					const {
						ctr,
						hmac,
						pendingInput,
						ready
					} = this;
					if (hmac && ctr) {
						await ready;
						const chunkToDecrypt = subarray(pendingInput, 0, pendingInput.length - AUTHENTICATION_CODE_LENGTH);
						const originalAuthenticationCode = subarray(pendingInput, pendingInput.length - AUTHENTICATION_CODE_LENGTH);
						let decryptedChunkArray = EMPTY_UINT8_ARRAY;
						if (chunkToDecrypt.length) {
							const encryptedChunk = toBits(codecBytes, chunkToDecrypt);
							hmac.update(encryptedChunk);
							const decryptedChunk = ctr.update(encryptedChunk);
							decryptedChunkArray = fromBits(codecBytes, decryptedChunk);
						}
						const authenticationCode = subarray(fromBits(codecBytes, hmac.digest()), 0, AUTHENTICATION_CODE_LENGTH);
						let invalidAuthenticationCode = pendingInput.length < AUTHENTICATION_CODE_LENGTH ? 1 : 0;
						for (let indexByte = 0; indexByte < AUTHENTICATION_CODE_LENGTH; indexByte++) {
							invalidAuthenticationCode |= authenticationCode[indexByte] ^ originalAuthenticationCode[indexByte];
						}
						if (invalidAuthenticationCode && checkAuthenticationCode) {
							throw new Error(ERR_INVALID_AUTHENTICATION_CODE);
						}
						controller.enqueue(decryptedChunkArray);
					}
				}
			});
		}
	}

	class AESEncryptionStream extends TransformStream {

		constructor({ password, rawPassword, encryptionStrength }) {
			super({
				start() {
					initAesCrypto(this, password, rawPassword, encryptionStrength);
				},
				async transform(chunk, controller) {
					const aesCrypto = this;
					const {
						password,
						strength,
						resolveReady,
						ready
					} = aesCrypto;
					let preamble = EMPTY_UINT8_ARRAY;
					if (password) {
						preamble = await createEncryptionKeys(aesCrypto, strength, password);
						resolveReady();
					} else {
						await ready;
					}
					const output = new Uint8Array(preamble.length + chunk.length - (chunk.length % BLOCK_LENGTH));
					output.set(preamble, 0);
					controller.enqueue(append(aesCrypto, chunk, output, preamble.length, 0));
				},
				async flush(controller) {
					const {
						ctr,
						hmac,
						pendingInput,
						ready
					} = this;
					if (hmac && ctr) {
						await ready;
						let encryptedChunkArray = EMPTY_UINT8_ARRAY;
						if (pendingInput.length) {
							const encryptedChunk = ctr.update(toBits(codecBytes, pendingInput));
							hmac.update(encryptedChunk);
							encryptedChunkArray = fromBits(codecBytes, encryptedChunk);
						}
						const authenticationCode = fromBits(codecBytes, hmac.digest()).slice(0, AUTHENTICATION_CODE_LENGTH);
						controller.enqueue(concat(encryptedChunkArray, authenticationCode));
					}
				}
			});
		}
	}

	function initAesCrypto(aesCrypto, password, rawPassword, encryptionStrength) {
		Object.assign(aesCrypto, {
			ready: new Promise(resolve => aesCrypto.resolveReady = resolve),
			password: encodePassword(password, rawPassword),
			strength: encryptionStrength - 1,
			pendingInput: EMPTY_UINT8_ARRAY
		});
	}

	function append(aesCrypto, input, output, paddingStart, paddingEnd, verifyAuthenticationCode) {
		const {
			ctr,
			hmac,
			pendingInput
		} = aesCrypto;
		if (pendingInput.length) {
			input = concat(pendingInput, input);
		}
		const inputLength = input.length - paddingEnd;
		output = expand(output, paddingStart + (inputLength - (inputLength % BLOCK_LENGTH)));
		let offset;
		for (offset = 0; offset <= inputLength - BLOCK_LENGTH; offset += BLOCK_LENGTH) {
			const inputChunk = toBits(codecBytes, subarray(input, offset, offset + BLOCK_LENGTH));
			if (verifyAuthenticationCode) {
				hmac.update(inputChunk);
			}
			const outputChunk = ctr.update(inputChunk);
			if (!verifyAuthenticationCode) {
				hmac.update(outputChunk);
			}
			output.set(fromBits(codecBytes, outputChunk), offset + paddingStart);
		}
		aesCrypto.pendingInput = subarray(input, offset);
		return output;
	}

	async function createDecryptionKeys(decrypt, strength, password, preamble) {
		const passwordVerificationKey = await createKeys$1(decrypt, strength, password, subarray(preamble, 0, SALT_LENGTH[strength]));
		const passwordVerification = subarray(preamble, SALT_LENGTH[strength]);
		if (passwordVerificationKey[0] != passwordVerification[0] || passwordVerificationKey[1] != passwordVerification[1]) {
			throw new Error(ERR_INVALID_PASSWORD);
		}
	}

	async function createEncryptionKeys(encrypt, strength, password) {
		const salt = getRandomValues(new Uint8Array(SALT_LENGTH[strength]));
		const passwordVerification = await createKeys$1(encrypt, strength, password, salt);
		return concat(salt, passwordVerification);
	}

	async function createKeys$1(aesCrypto, strength, password, salt) {
		aesCrypto.password = null;
		const baseKey = await importKey(RAW_FORMAT, password, BASE_KEY_ALGORITHM, false, DERIVED_BITS_USAGE);
		const derivedBits = await deriveBits(Object.assign({ salt }, DERIVED_BITS_ALGORITHM), baseKey, 8 * ((KEY_LENGTH[strength] * 2) + 2));
		const compositeKey = new Uint8Array(derivedBits);
		const key = toBits(codecBytes, subarray(compositeKey, 0, KEY_LENGTH[strength]));
		const authentication = toBits(codecBytes, subarray(compositeKey, KEY_LENGTH[strength], KEY_LENGTH[strength] * 2));
		const passwordVerification = subarray(compositeKey, KEY_LENGTH[strength] * 2);
		Object.assign(aesCrypto, {
			keys: {
				key,
				authentication,
				passwordVerification
			},
			ctr: new CtrGladman(new Aes(key), Array.from(COUNTER_DEFAULT_VALUE)),
			hmac: new HmacSha1(authentication)
		});
		return passwordVerification;
	}

	async function importKey(format, password, algorithm, extractable, keyUsages) {
		if (IMPORT_KEY_SUPPORTED) {
			try {
				return await subtle.importKey(format, password, algorithm, extractable, keyUsages);
			} catch {
				IMPORT_KEY_SUPPORTED = false;
				return misc.importKey(password);
			}
		} else {
			return misc.importKey(password);
		}
	}

	async function deriveBits(algorithm, baseKey, length) {
		if (DERIVE_BITS_SUPPORTED) {
			try {
				return await subtle.deriveBits(algorithm, baseKey, length);
			} catch {
				DERIVE_BITS_SUPPORTED = false;
				return misc.pbkdf2(baseKey, algorithm.salt, DERIVED_BITS_ALGORITHM.iterations, length);
			}
		} else {
			return misc.pbkdf2(baseKey, algorithm.salt, DERIVED_BITS_ALGORITHM.iterations, length);
		}
	}

	function encodePassword(password, rawPassword) {
		if (rawPassword === UNDEFINED_VALUE) {
			return encodeText(password);
		} else {
			return rawPassword;
		}
	}

	function expand(inputArray, length) {
		if (length && length > inputArray.length) {
			const array = inputArray;
			inputArray = new Uint8Array(length);
			inputArray.set(array, 0);
		}
		return inputArray;
	}

	function subarray(array, begin, end) {
		return array.subarray(begin, end);
	}

	function fromBits(codecBytes, chunk) {
		return codecBytes.fromBits(chunk);
	}
	function toBits(codecBytes, chunk) {
		return codecBytes.toBits(chunk);
	}

	/*
	 Copyright (c) 2022 Gildas Lormeau. All rights reserved.

	 Redistribution and use in source and binary forms, with or without
	 modification, are permitted provided that the following conditions are met:

	 1. Redistributions of source code must retain the above copyright notice,
	 this list of conditions and the following disclaimer.

	 2. Redistributions in binary form must reproduce the above copyright 
	 notice, this list of conditions and the following disclaimer in 
	 the documentation and/or other materials provided with the distribution.

	 3. The names of the authors may not be used to endorse or promote products
	 derived from this software without specific prior written permission.

	 THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESSED OR IMPLIED WARRANTIES,
	 INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
	 FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL JCRAFT,
	 INC. OR ANY CONTRIBUTORS TO THIS SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT,
	 INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
	 LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
	 OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
	 LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
	 NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
	 EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
	 */


	const HEADER_LENGTH = 12;

	class ZipCryptoDecryptionStream extends TransformStream {

		constructor({ password, rawPassword, passwordVerification, checkPasswordOnly }) {
			super({
				start() {
					initZipCrypto(this, password, rawPassword, passwordVerification);
				},
				transform(chunk, controller) {
					const zipCrypto = this;
					if (zipCrypto.password || zipCrypto.rawPassword) {
						const decryptedHeader = decrypt(zipCrypto, chunk.subarray(0, HEADER_LENGTH));
						zipCrypto.password = zipCrypto.rawPassword = null;
						if ((decryptedHeader[HEADER_LENGTH - 1] ^ zipCrypto.passwordVerification) != 0) {
							throw new Error(ERR_INVALID_PASSWORD);
						}
						chunk = chunk.subarray(HEADER_LENGTH);
					}
					if (checkPasswordOnly) {
						controller.error(new Error(ERR_ABORT_CHECK_PASSWORD));
					} else {
						controller.enqueue(decrypt(zipCrypto, chunk));
					}
				}
			});
		}
	}

	class ZipCryptoEncryptionStream extends TransformStream {

		constructor({ password, rawPassword, passwordVerification }) {
			super({
				start() {
					initZipCrypto(this, password, rawPassword, passwordVerification);
				},
				transform(chunk, controller) {
					const zipCrypto = this;
					let output;
					let offset;
					if (zipCrypto.password || zipCrypto.rawPassword) {
						zipCrypto.password = zipCrypto.rawPassword = null;
						const header = getRandomValues(new Uint8Array(HEADER_LENGTH));
						header[HEADER_LENGTH - 1] = zipCrypto.passwordVerification;
						output = new Uint8Array(chunk.length + header.length);
						output.set(encrypt(zipCrypto, header), 0);
						offset = HEADER_LENGTH;
					} else {
						output = new Uint8Array(chunk.length);
						offset = 0;
					}
					output.set(encrypt(zipCrypto, chunk), offset);
					controller.enqueue(output);
				}
			});
		}
	}

	function initZipCrypto(zipCrypto, password, rawPassword, passwordVerification) {
		Object.assign(zipCrypto, {
			password,
			rawPassword,
			passwordVerification
		});
		createKeys(zipCrypto, password, rawPassword);
	}

	function decrypt(target, input) {
		const output = new Uint8Array(input.length);
		for (let index = 0; index < input.length; index++) {
			output[index] = getByte(target) ^ input[index];
			updateKeys(target, output[index]);
		}
		return output;
	}

	function encrypt(target, input) {
		const output = new Uint8Array(input.length);
		for (let index = 0; index < input.length; index++) {
			output[index] = getByte(target) ^ input[index];
			updateKeys(target, input[index]);
		}
		return output;
	}

	function createKeys(target, password, rawPassword) {
		const keys = [0x12345678, 0x23456789, 0x34567890];
		Object.assign(target, {
			keys,
			crcKey0: new Crc32(keys[0]),
			crcKey2: new Crc32(keys[2])
		});
		if (rawPassword) {
			for (let index = 0; index < rawPassword.length; index++) {
				updateKeys(target, rawPassword[index]);
			}
		} else {
			for (let index = 0; index < password.length; index++) {
				updateKeys(target, password.charCodeAt(index));
			}
		}
	}

	function updateKeys(target, byte) {
		let [, key1] = target.keys;
		target.crcKey0.append([byte]);
		const key0 = ~target.crcKey0.get();
		key1 = getInt32(Math.imul(getInt32(key1 + getInt8(key0)), 134775813) + 1);
		target.crcKey2.append([key1 >>> 24]);
		const key2 = ~target.crcKey2.get();
		target.keys = [key0, key1, key2];
	}

	function getByte(target) {
		const temp = target.keys[2] | 2;
		return getInt8(Math.imul(temp, (temp ^ 1)) >>> 8);
	}

	function getInt8(number) {
		return number & 0xFF;
	}

	function getInt32(number) {
		return number & 0xFFFFFFFF;
	}

	/*
	 Copyright (c) 2026 Gildas Lormeau. All rights reserved.

	 Redistribution and use in source and binary forms, with or without
	 modification, are permitted provided that the following conditions are met:

	 1. Redistributions of source code must retain the above copyright notice,
	 this list of conditions and the following disclaimer.

	 2. Redistributions in binary form must reproduce the above copyright
	 notice, this list of conditions and the following disclaimer in
	 the documentation and/or other materials provided with the distribution.

	 3. The names of the authors may not be used to endorse or promote products
	 derived from this software without specific prior written permission.

	 THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESSED OR IMPLIED WARRANTIES,
	 INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
	 FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL JCRAFT,
	 INC. OR ANY CONTRIBUTORS TO THIS SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT,
	 INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
	 LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
	 OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
	 LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
	 NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
	 EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
	 */


	function toCompatibleReadable(readable) {
		if (readable instanceof ReadableStream) {
			return readable;
		}
		const reader = readable.getReader();
		return new ReadableStream({
			async pull(controller) {
				const { value, done } = await reader.read();
				if (done) {
					controller.close();
				} else {
					controller.enqueue(value);
				}
			},
			cancel(reason) {
				return reader.cancel(reason);
			}
		});
	}

	function streamToBlob(readable, contentType) {
		readable = toCompatibleReadable(readable);
		const blobOptions = contentType ? { type: contentType } : {};
		if (responseSupportsGlobalReadable()) {
			return new Response(readable).blob().then(blob => contentType ? new Blob([blob], blobOptions) : blob);
		}
		const chunks = [];
		return readable
			.pipeTo(new WritableStream({
				write(chunk) {
					chunks.push(chunk);
				}
			}))
			.then(() => new Blob(chunks, blobOptions));
	}

	function responseSupportsGlobalReadable() {
		return typeof Blob.prototype.stream != FUNCTION_TYPE || new Blob([]).stream() instanceof ReadableStream;
	}

	function toCompatibleWritable(writable) {
		if (writable instanceof WritableStream) {
			return writable;
		}
		const writer = writable.getWriter();
		return new WritableStream({
			write(chunk) {
				return writer.write(chunk);
			},
			close() {
				return writer.close();
			},
			abort(reason) {
				return writer.abort(reason);
			}
		});
	}

	/*
	 Copyright (c) 2025 Gildas Lormeau. All rights reserved.

	 Redistribution and use in source and binary forms, with or without
	 modification, are permitted provided that the following conditions are met:

	 1. Redistributions of source code must retain the above copyright notice,
	 this list of conditions and the following disclaimer.

	 2. Redistributions in binary form must reproduce the above copyright
	 notice, this list of conditions and the following disclaimer in
	 the documentation and/or other materials provided with the distribution.

	 3. The names of the authors may not be used to endorse or promote products
	 derived from this software without specific prior written permission.

	 THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESSED OR IMPLIED WARRANTIES,
	 INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
	 FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL JCRAFT,
	 INC. OR ANY CONTRIBUTORS TO THIS SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT,
	 INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
	 LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
	 OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
	 LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
	 NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
	 EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
	 */

	const ERR_INVALID_CODEC_MODULE = "Invalid codec module";
	const ERR_UNSUPPORTED_COMPRESSION = "Compression method not supported";

	const registeredCodecs = new Map();
	const codecStreams = new Map();

	function getRegisteredCodec(compressionMethod) {
		return registeredCodecs.get(compressionMethod);
	}

	function getCodecStreams(format) {
		return codecStreams.get(format);
	}

	function setCodecStreams(format, streams) {
		const { CompressionStream, DecompressionStream } = streams;
		if (typeof CompressionStream != FUNCTION_TYPE && typeof DecompressionStream != FUNCTION_TYPE) {
			throw new Error(ERR_INVALID_CODEC_MODULE);
		}
		codecStreams.set(format, { CompressionStream, DecompressionStream });
	}

	async function ensureCodecStreams(format, codecURI) {
		if (!codecStreams.has(format) && codecURI) {
			setCodecStreams(format, await import(/* webpackIgnore: true */ /* @vite-ignore */ codecURI));
		}
	}

	/*
	 Copyright (c) 2025 Gildas Lormeau. All rights reserved.

	 Redistribution and use in source and binary forms, with or without
	 modification, are permitted provided that the following conditions are met:

	 1. Redistributions of source code must retain the above copyright notice,
	 this list of conditions and the following disclaimer.

	 2. Redistributions in binary form must reproduce the above copyright 
	 notice, this list of conditions and the following disclaimer in 
	 the documentation and/or other materials provided with the distribution.

	 3. The names of the authors may not be used to endorse or promote products
	 derived from this software without specific prior written permission.

	 THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESSED OR IMPLIED WARRANTIES,
	 INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
	 FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL JCRAFT,
	 INC. OR ANY CONTRIBUTORS TO THIS SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT,
	 INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
	 LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
	 OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
	 LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
	 NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
	 EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
	 */


	const ERR_INVALID_UNCOMPRESSED_SIZE = "Invalid uncompressed size";
	const ERR_INVALID_COMPRESSED_DATA = "Invalid compressed data";
	const ERR_INVALID_CRC32 = "Invalid CRC32";
	const FORMAT_DEFLATE_RAW$1 = "deflate-raw";
	const FORMAT_DEFLATE64_RAW$1 = "deflate64-raw";
	const FORMAT_GZIP$1 = "gzip";
	const GZIP_HEADER_LENGTH = 10;
	const GZIP_TRAILER_LENGTH = 8;
	const GZIP_HEADER_BYTES = [0x1f, 0x8b, 0x08];
	const GZIP_OUTPUT_STALL_TIMEOUT = 5000;

	class DeflateStream extends TransformStream {

		constructor(options, { chunkSize, CompressionStreamFallback, CompressionStream }) {
			super({});
			const { compressed, encrypted, useCompressionStream, zipCrypto, computeCrc32, level, deflate64, format, compressionMethod, inputSize } = options;
			const stream = this;
			let crc32Stream, encryptionStream, gzipCrc32Stream;
			let readable = super.readable;
			const codecStreams = format && getCodecStreams(format);
			const useGzipCrc32 = computeCrc32 && compressed && !deflate64 && !codecStreams && (!encrypted || zipCrypto) &&
				Boolean(useCompressionStream && CompressionStream);
			if ((!encrypted || zipCrypto) && computeCrc32 && !useGzipCrc32) {
				crc32Stream = new Crc32Stream();
				readable = pipeThrough(readable, crc32Stream);
			}
			if (compressed) {
				if (codecStreams) {
					readable = pipeThroughBackpressured(readable, createCodecStream(codecStreams.CompressionStream, format, { level, chunkSize, compressionMethod, uncompressedSize: inputSize }));
				} else if (useGzipCrc32) {
					gzipCrc32Stream = new GzipToRawDeflateStream();
					readable = pipeThroughBackpressured(readable, new CompressionStream(FORMAT_GZIP$1));
					readable = pipeThrough(readable, gzipCrc32Stream);
				} else {
					try {
						readable = pipeThroughCompressionStream(readable, useCompressionStream, { level, chunkSize }, CompressionStream, CompressionStreamFallback);
					} catch (error) {
						let gzipStream;
						try {
							gzipStream = new CompressionStream(FORMAT_GZIP$1);
						} catch {
							throw error;
						}
						readable = pipeThroughBackpressured(readable, gzipStream);
						readable = pipeThrough(readable, new GzipToRawDeflateStream());
					}
				}
			}
			if (encrypted) {
				if (zipCrypto) {
					readable = pipeThrough(readable, new ZipCryptoEncryptionStream(options));
				} else {
					encryptionStream = new AESEncryptionStream(options);
					readable = pipeThrough(readable, encryptionStream);
				}
			}
			setReadable(stream, readable, () => {
				if ((!encrypted || zipCrypto) && computeCrc32) {
					stream.crc32 = useGzipCrc32 ? gzipCrc32Stream.crc32 : new DataView(crc32Stream.value.buffer).getUint32(0);
				}
			});
		}
	}

	class GzipToRawDeflateStream extends TransformStream {

		constructor() {
			// deno-lint-ignore prefer-const
			let stream;
			let headerBytesLeft = GZIP_HEADER_LENGTH;
			let trailerCandidate = new Uint8Array(0);
			super({
				transform(chunk, controller) {
					if (headerBytesLeft) {
						const droppedLength = Math.min(headerBytesLeft, chunk.length);
						headerBytesLeft -= droppedLength;
						chunk = chunk.subarray(droppedLength);
						if (!chunk.length) {
							return;
						}
					}
					const availableLength = trailerCandidate.length + chunk.length;
					if (availableLength <= GZIP_TRAILER_LENGTH) {
						trailerCandidate = concat(trailerCandidate, chunk);
						return;
					}
					const emitLength = availableLength - GZIP_TRAILER_LENGTH;
					const emittedFromTrailer = Math.min(emitLength, trailerCandidate.length);
					controller.enqueue(concat(
						trailerCandidate.subarray(0, emittedFromTrailer),
						chunk.subarray(0, emitLength - emittedFromTrailer)));
					trailerCandidate = concat(
						trailerCandidate.subarray(emittedFromTrailer),
						chunk.subarray(emitLength - emittedFromTrailer));
				},
				flush() {
					const dataView = getDataView(trailerCandidate);
					stream.crc32 = dataView.getUint32(0, true);
					stream.uncompressedSize = dataView.getUint32(4, true);
				}
			});
			stream = this;
		}
	}

	function pipeThroughGzipDecompressionStream(readable, gzipStream, outputSize) {
		const crc32 = new Crc32();
		let outputLength = 0;
		let inputDone = false;
		let watchdogTimeout;
		let resolveTrailerReady, rejectTrailerReady;
		const trailerReady = new Promise((resolve, reject) => {
			resolveTrailerReady = resolve;
			rejectTrailerReady = reject;
		});
		trailerReady.catch(() => { });
		if (!outputSize) {
			resolveTrailerReady();
		}
		const gzipWrapStream = new TransformStream({
			start(controller) {
				const header = new Uint8Array(GZIP_HEADER_LENGTH);
				header.set(GZIP_HEADER_BYTES);
				controller.enqueue(header);
			},
			transform(chunk, controller) {
				controller.enqueue(chunk);
			},
			async flush(controller) {
				inputDone = true;
				startWatchdog();
				try {
					await trailerReady;
				} finally {
					stopWatchdog();
				}
				const trailer = new Uint8Array(GZIP_TRAILER_LENGTH);
				const dataView = getDataView(trailer);
				dataView.setUint32(0, crc32.get(), true);
				dataView.setUint32(4, outputSize, true);
				controller.enqueue(trailer);
			},
			cancel(reason) {
				rejectTrailerReady(reason);
			}
		});
		const outputStream = new TransformStream({
			transform(chunk, controller) {
				crc32.append(chunk);
				outputLength += chunk.length;
				if (outputLength >= outputSize) {
					resolveTrailerReady();
				} else if (inputDone) {
					startWatchdog();
				}
				controller.enqueue(chunk);
			},
			cancel(reason) {
				rejectTrailerReady(reason);
			}
		});
		readable = pipeThrough(readable, gzipWrapStream);
		readable = pipeThroughBackpressured(readable, gzipStream);
		return pipeThrough(readable, outputStream);

		function startWatchdog() {
			stopWatchdog();
			watchdogTimeout = setTimeout(() => rejectTrailerReady(new Error(ERR_INVALID_UNCOMPRESSED_SIZE)), GZIP_OUTPUT_STALL_TIMEOUT);
		}

		function stopWatchdog() {
			clearTimeout(watchdogTimeout);
		}
	}

	class InflateStream extends TransformStream {

		constructor(options, { chunkSize, DecompressionStreamFallback, DecompressionStream }) {
			super({});
			const { zipCrypto, encrypted, checkCrc32, crc32, compressed, useCompressionStream, deflate64, format, compressionMethod, rawBitFlag, outputSize } = options;
			let crc32Stream, decryptionStream;
			let readable = super.readable;
			if (encrypted) {
				if (zipCrypto) {
					readable = pipeThrough(readable, new ZipCryptoDecryptionStream(options));
				} else {
					decryptionStream = new AESDecryptionStream(options);
					readable = pipeThrough(readable, decryptionStream);
				}
			}
			if (compressed) {
				const codecStreams = format && getCodecStreams(format);
				if (codecStreams) {
					readable = pipeThroughBackpressured(readable, createCodecStream(codecStreams.DecompressionStream, format, { chunkSize, compressionMethod, rawBitFlag, uncompressedSize: outputSize }));
				} else {
					try {
						readable = pipeThroughCompressionStream(readable, useCompressionStream, { chunkSize, deflate64 }, DecompressionStream, DecompressionStreamFallback);
					} catch (error) {
						if (deflate64 || outputSize === UNDEFINED_VALUE) {
							throw error;
						}
						let gzipStream;
						try {
							gzipStream = new DecompressionStream(FORMAT_GZIP$1);
						} catch {
							throw error;
						}
						readable = pipeThroughGzipDecompressionStream(readable, gzipStream, outputSize);
					}
				}
				readable = mapInflateStreamError(readable);
			}
			if (checkCrc32) {
				crc32Stream = new Crc32Stream();
				readable = pipeThrough(readable, crc32Stream);
			}
			setReadable(this, readable, () => {
				if (checkCrc32) {
					const computedCrc32View = new DataView(crc32Stream.value.buffer);
					if (crc32 != computedCrc32View.getUint32(0, false)) {
						throw new Error(ERR_INVALID_CRC32);
					}
				}
			});
		}
	}

	const formatSupportByStream = new Map();

	function supportsFormat(StreamClass, format) {
		if (!StreamClass) {
			return false;
		}
		let supportByFormat = formatSupportByStream.get(StreamClass);
		if (!supportByFormat) {
			supportByFormat = new Map();
			formatSupportByStream.set(StreamClass, supportByFormat);
		}
		let supported = supportByFormat.get(format);
		if (supported === UNDEFINED_VALUE) {
			try {
				new StreamClass(format);
				supported = true;
			} catch {
				supported = false;
			}
			supportByFormat.set(format, supported);
		}
		return supported;
	}

	function supportsDeflateRaw(StreamClass) {
		return supportsFormat(StreamClass, FORMAT_DEFLATE_RAW$1);
	}

	function setReadable(stream, readable, flush) {
		readable = pipeThrough(readable, new TransformStream({ flush }));
		Object.defineProperty(stream, "readable", {
			get() {
				return readable;
			}
		});
	}

	function createCodecStream(CodecStreamClass, format, options) {
		if (!CodecStreamClass) {
			throw new Error(ERR_UNSUPPORTED_COMPRESSION);
		}
		return new CodecStreamClass(format, options);
	}

	function pipeThroughCompressionStream(readable, useCompressionStream, options, CompressionStreamNative, CompressionStreamFallback) {
		const Stream = useCompressionStream && CompressionStreamNative ?
			CompressionStreamNative :
			CompressionStreamFallback || CompressionStreamNative;
		const format = options.deflate64 ? FORMAT_DEFLATE64_RAW$1 : FORMAT_DEFLATE_RAW$1;
		let codecStream;
		try {
			codecStream = new Stream(format, options);
		} catch (error) {
			if (useCompressionStream && CompressionStreamFallback && Stream != CompressionStreamFallback) {
				codecStream = new CompressionStreamFallback(format, options);
			} else {
				throw error;
			}
		}
		return pipeThroughBackpressured(readable, codecStream);
	}

	function pipeThrough(readable, transformStream) {
		return toCompatibleReadable(readable).pipeThrough(transformStream);
	}

	function pipeThroughBackpressured(readable, transformStream) {
		const writer = transformStream.writable.getWriter();
		const reader = readable.getReader();
		pump();
		return transformStream.readable;

		async function pump() {
			try {
				for (; ;) {
					await writer.ready;
					const result = await reader.read();
					if (result.done) {
						await writer.close();
						break;
					}
					await writer.write(result.value);
				}
			} catch (error) {
				await abort(writer, error);
				await cancel(reader, error);
			}
		}
	}

	async function abort(writer, error) {
		try {
			await writer.abort(error);
		} catch {
			// ignored: the writable may already be errored/closed
		}
	}

	async function cancel(reader, error) {
		try {
			await reader.cancel(error);
		} catch {
			// ignored: the readable may already be errored/closed
		}
	}

	function mapInflateStreamError(readable) {
		const reader = readable.getReader();
		return new ReadableStream({
			async pull(controller) {
				let result;
				try {
					result = await reader.read();
				} catch (error) {
					if (error && error.message) {
						throw error;
					}
					const mappedError = new Error(ERR_INVALID_COMPRESSED_DATA);
					mappedError.cause = error;
					throw mappedError;
				}
				const { value, done } = result;
				if (done) {
					controller.close();
				} else {
					controller.enqueue(value);
				}
			},
			cancel(reason) {
				return reader.cancel(reason);
			}
		});
	}

	/*
	 Copyright (c) 2022 Gildas Lormeau. All rights reserved.

	 Redistribution and use in source and binary forms, with or without
	 modification, are permitted provided that the following conditions are met:

	 1. Redistributions of source code must retain the above copyright notice,
	 this list of conditions and the following disclaimer.

	 2. Redistributions in binary form must reproduce the above copyright 
	 notice, this list of conditions and the following disclaimer in 
	 the documentation and/or other materials provided with the distribution.

	 3. The names of the authors may not be used to endorse or promote products
	 derived from this software without specific prior written permission.

	 THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESSED OR IMPLIED WARRANTIES,
	 INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
	 FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL JCRAFT,
	 INC. OR ANY CONTRIBUTORS TO THIS SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT,
	 INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
	 LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
	 OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
	 LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
	 NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
	 EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
	 */


	const DEFAULT_CHUNK_SIZE = 64 * 1024;
	const MESSAGE_EVENT_TYPE = "message";
	const MESSAGE_START = "start";
	const MESSAGE_PULL = "pull";
	const MESSAGE_DATA = "data";
	const MESSAGE_ACK_DATA = "ack";
	const MESSAGE_CLOSE = "close";
	const CODEC_DEFLATE = "deflate";
	const CODEC_INFLATE = "inflate";

	class CodecStream extends TransformStream {

		constructor(options, config) {
			super({});
			const codec = this;
			const { codecType } = options;
			let Stream;
			if (codecType.startsWith(CODEC_DEFLATE)) {
				Stream = DeflateStream;
			} else if (codecType.startsWith(CODEC_INFLATE)) {
				Stream = InflateStream;
			}
			codec.outputSize = 0;
			let inputSize = 0;
			const stream = new Stream(options, config);
			const readable = super.readable;
			const inputSizeStream = new TransformStream({
				transform(chunk, controller) {
					if (chunk && chunk.length) {
						inputSize += chunk.length;
						controller.enqueue(chunk);
					}
				},
				flush() {
					Object.assign(codec, {
						inputSize
					});
				}
			});
			const outputSizeStream = new TransformStream({
				transform(chunk, controller) {
					if (chunk && chunk.length) {
						controller.enqueue(chunk);
						codec.outputSize += chunk.length;
						if (options.outputSize !== UNDEFINED_VALUE && codec.outputSize > options.outputSize) {
							throw new Error(ERR_INVALID_UNCOMPRESSED_SIZE);
						}
					}
				},
				flush() {
					const { crc32 } = stream;
					Object.assign(codec, {
						crc32,
						inputSize
					});
				}
			});
			Object.defineProperty(codec, "readable", {
				get() {
					return readable.pipeThrough(inputSizeStream).pipeThrough(stream).pipeThrough(outputSizeStream);
				}
			});
		}
	}

	class ChunkStream extends TransformStream {

		constructor(chunkSize) {
			const pendingChunks = [];
			let pendingLength = 0;
			if (!Number.isFinite(chunkSize) || chunkSize < 1) {
				chunkSize = DEFAULT_CHUNK_SIZE;
			}
			super({
				transform(chunk, controller) {
					pendingChunks.push(chunk);
					pendingLength += chunk.length;
					while (pendingLength > chunkSize) {
						controller.enqueue(shiftChunk());
					}
				},
				flush(controller) {
					if (pendingLength) {
						controller.enqueue(concatChunks(pendingChunks, pendingLength));
					}
				}
			});

			function shiftChunk() {
				const result = new Uint8Array(chunkSize);
				let resultOffset = 0;
				while (resultOffset < chunkSize) {
					const firstChunk = pendingChunks[0];
					const remainingLength = chunkSize - resultOffset;
					if (firstChunk.length <= remainingLength) {
						result.set(firstChunk, resultOffset);
						resultOffset += firstChunk.length;
						pendingChunks.shift();
					} else {
						result.set(firstChunk.subarray(0, remainingLength), resultOffset);
						pendingChunks[0] = firstChunk.subarray(remainingLength);
						resultOffset += remainingLength;
					}
				}
				pendingLength -= chunkSize;
				return result;
			}

			function concatChunks(chunks, length) {
				const result = new Uint8Array(length);
				let offset = 0;
				for (const chunk of chunks) {
					result.set(chunk, offset);
					offset += chunk.length;
				}
				return result;
			}
		}
	}

	/*
	 Copyright (c) 2025 Gildas Lormeau. All rights reserved.

	 Redistribution and use in source and binary forms, with or without
	 modification, are permitted provided that the following conditions are met:

	 1. Redistributions of source code must retain the above copyright notice,
	 this list of conditions and the following disclaimer.

	 2. Redistributions in binary form must reproduce the above copyright
	 notice, this list of conditions and the following disclaimer in
	 the documentation and/or other materials provided with the distribution.

	 3. The names of the authors may not be used to endorse or promote products
	 derived from this software without specific prior written permission.

	 THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESSED OR IMPLIED WARRANTIES,
	 INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
	 FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL JCRAFT,
	 INC. OR ANY CONTRIBUTORS TO THIS SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT,
	 INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
	 LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
	 OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
	 LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
	 NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
	 EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
	 */


	const ERR_WORKER_STARTUP_TIMEOUT = "Worker startup timeout";

	let webWorkerSupported, createWorkerFailed, webWorkerBackend;
	let initModule$1 = () => { };

	function configureWorker({ initModule: initModuleFunction }) {
		initModule$1 = initModuleFunction;
	}

	function setWebWorkerBackend(backend) {
		webWorkerBackend = backend;
	}

	function disableWebWorker(workerData) {
		if (workerData.createWorker) {
			createWorkerFailed = true;
		} else {
			webWorkerSupported = false;
		}
	}

	class CodecWorker {

		constructor(workerData, { readable, writable }, { options, config, streamOptions, useWebWorkers, transferStreams, workerURI, createWorker }, onTaskFinished) {
			const { signal } = streamOptions;
			if (createWorkerFailed) {
				createWorker = UNDEFINED_VALUE;
			}
			Object.assign(workerData, {
				busy: true,
				generation: (workerData.generation || 0) + 1,
				readable: readable
					.pipeThrough(new ChunkStream(getChunkSize(config)))
					.pipeThrough(new ProgressWatcherStream(streamOptions), { signal }),
				writable,
				options: Object.assign({}, options),
				workerURI,
				createWorker,
				transferStreams,
				terminate() {
					return new Promise(resolve => {
						const { worker, busy } = workerData;
						if (worker) {
							if (busy) {
								workerData.resolveTerminated = resolve;
							} else {
								worker.terminate();
								resolve();
							}
							workerData.interface = null;
						} else {
							resolve();
						}
					});
				},
				onTaskFinished() {
					if (workerData.busy) {
						const { resolveTerminated } = workerData;
						if (resolveTerminated) {
							workerData.resolveTerminated = null;
							workerData.terminated = true;
							workerData.worker.terminate();
							resolveTerminated();
						}
						workerData.busy = false;
						onTaskFinished(workerData);
					}
				}
			});
			if (webWorkerSupported === UNDEFINED_VALUE) {
				// deno-lint-ignore valid-typeof
				webWorkerSupported = typeof Worker != UNDEFINED_TYPE;
			}
			return (useWebWorkers && webWorkerBackend && ((webWorkerSupported && workerURI) || createWorker) ? webWorkerBackend : createWorkerInterface)(workerData, config);
		}
	}

	class ProgressWatcherStream extends TransformStream {

		constructor({ onstart, onprogress, size, onend }) {
			let chunkOffset = 0;
			super({
				async start() {
					if (onstart) {
						await callHandler(onstart, size);
					}
				},
				async transform(chunk, controller) {
					chunkOffset += chunk.length;
					if (onprogress) {
						await callHandler(onprogress, chunkOffset, size);
					}
					controller.enqueue(chunk);
				},
				async flush() {
					if (onend) {
						await callHandler(onend, chunkOffset);
					}
				}
			});
		}
	}

	async function callHandler(handler, ...parameters) {
		try {
			await handler(...parameters);
		} catch {
			// ignored
		}
	}

	function createWorkerInterface(workerData, config) {
		return {
			run: () => runWorker$1(workerData, config)
		};
	}

	async function runWorker$1({ options, readable, writable, onTaskFinished }, config) {
		let codecStream;
		try {
			if (options.compressed && !options.format) {
				const deflate = options.codecType.startsWith(CODEC_DEFLATE);
				const FallbackStream = deflate ? config.CompressionStreamFallback : config.DecompressionStreamFallback;
				const NativeStream = deflate ? config.CompressionStream : config.DecompressionStream;
				if (!options.useCompressionStream) {
					try {
						await initModule$1(config);
					} catch {
						if (!FallbackStream || FallbackStream.requiresModule) {
							options.useCompressionStream = true;
						}
					}
				} else if (FallbackStream && FallbackStream.requiresModule && !supportsDeflateRaw(NativeStream)) {
					try {
						await initModule$1(config);
					} catch {
						// ignored
					}
				}
			}
			codecStream = new CodecStream(options, config);
			await readable
				.pipeThrough(codecStream)
				.pipeThrough(new ChunkStream(getChunkSize(config)))
				.pipeTo(writable, { preventClose: true, preventAbort: true });
			const {
				crc32,
				inputSize,
				outputSize
			} = codecStream;
			return {
				crc32,
				inputSize,
				outputSize
			};
		} catch (error) {
			if (codecStream) {
				error.outputSize = codecStream.outputSize;
			}
			throw error;
		} finally {
			onTaskFinished();
		}
	}

	/*
	 Copyright (c) 2025 Gildas Lormeau. All rights reserved.

	 Redistribution and use in source and binary forms, with or without
	 modification, are permitted provided that the following conditions are met:

	 1. Redistributions of source code must retain the above copyright notice,
	 this list of conditions and the following disclaimer.

	 2. Redistributions in binary form must reproduce the above copyright
	 notice, this list of conditions and the following disclaimer in
	 the documentation and/or other materials provided with the distribution.

	 3. The names of the authors may not be used to endorse or promote products
	 derived from this software without specific prior written permission.

	 THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESSED OR IMPLIED WARRANTIES,
	 INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
	 FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL JCRAFT,
	 INC. OR ANY CONTRIBUTORS TO THIS SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT,
	 INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
	 LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
	 OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
	 LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
	 NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
	 EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
	 */


	const MODULE_WORKER_OPTIONS = { type: "module" };
	const ERROR_EVENT_TYPE = "error";
	const MESSAGE_ERROR_EVENT_TYPE = "messageerror";

	let webWorkerSource, webWorkerURI, webWorkerOptions;
	let transferStreamsSupported = true;
	try {
		transferStreamsSupported = typeof structuredClone == FUNCTION_TYPE && structuredClone(new DOMException("", "AbortError")).code !== UNDEFINED_VALUE;
	} catch {
		// ignored
	}

	setWebWorkerBackend(createWebWorkerInterface);

	function createWebWorkerInterface(workerData, config) {
		const { baseURI, chunkSize, workerStartupTimeout } = config;
		let { wasmURI } = config;

		if (!workerData.interface) {
			// deno-lint-ignore valid-typeof
			if (typeof wasmURI == FUNCTION_TYPE) {
				wasmURI = wasmURI();
			}
			let worker;
			try {
				worker = getWebWorker(workerData.workerURI, baseURI, workerData);
			} catch {
				disableWebWorker(workerData);
				return createWorkerInterface(workerData, config);
			}
			Object.assign(workerData, {
				worker,
				workerAlive: false,
				terminated: false,
				startupError: null,
				interface: {
					run: async () => {
						try {
							return await runWebWorker(workerData, { chunkSize, wasmURI, baseURI, workerStartupTimeout });
						} catch (error) {
							if (error && error.workerStartupFailed) {
								disableWebWorker(workerData);
								releaseWorkerStreams(workerData);
								return runWorker$1(workerData, config);
							}
							if (error && error.codecImportFailed) {
								if (workerData.reader) {
									releaseWorkerStreams(workerData);
									return runWorker$1(workerData, config);
								}
								workerData.onTaskFinished();
							}
							throw error;
						}
					}
				}
			});
		}
		return workerData.interface;
	}

	async function runWebWorker(workerData, config) {
		if (!workerData.worker) {
			const { startupError } = workerData;
			workerData.startupError = null;
			const error = startupError || new Error(ERR_WORKER_STARTUP_TIMEOUT);
			error.workerStartupFailed = true;
			throw error;
		}
		let resolveResult, rejectResult;
		const result = new Promise((resolve, reject) => {
			resolveResult = resolve;
			rejectResult = reject;
		});
		Object.assign(workerData, {
			reader: null,
			writer: null,
			resolveResult,
			rejectResult,
			result
		});
		const { readable, options } = workerData;
		const { writable, closed, abortPipe } = watchClosedStream(workerData.writable);
		let streamsTransferred;
		try {
			streamsTransferred = sendMessage({
				type: MESSAGE_START,
				options,
				config,
				readable,
				writable
			}, workerData);
		} catch (error) {
			abortPipe();
			try {
				await closed;
			} catch {
				// ignored
			}
			workerData.onTaskFinished();
			throw error;
		}
		if (!streamsTransferred) {
			Object.assign(workerData, {
				reader: readable.getReader(),
				writer: writable.getWriter()
			});
		}
		const { workerStartupTimeout } = config;
		if (!workerData.workerAlive && Number.isFinite(workerStartupTimeout) && workerStartupTimeout >= 0) {
			workerData.startupTimeout = setTimeout(() => onStartupTimeout(workerData), workerStartupTimeout);
		}
		try {
			const resultValue = await result;
			await closeWritable();
			await closed;
			return resultValue;
		} catch (error) {
			await closeWritable();
			abortPipe();
			try {
				await closed;
			} catch {
				// ignored
			}
			throw error;
		}

		async function closeWritable() {
			if (!streamsTransferred && !writable.locked) {
				try {
					await writable.getWriter().close();
				} catch {
					// ignored
				}
			}
		}
	}

	function watchClosedStream(writableSource) {
		const abortController = new AbortController();
		const { writable, readable } = new TransformStream();
		const closed = readable.pipeTo(writableSource, { preventClose: true, preventAbort: true, signal: abortController.signal });
		closed.catch(() => { });
		return { writable, closed, abortPipe: () => abortController.abort() };
	}

	function releaseWorkerStreams(workerData) {
		const { reader } = workerData;
		if (reader) {
			reader.releaseLock();
		}
		workerData.reader = null;
		workerData.writer = null;
	}

	function terminateWorker$1(workerData) {
		const { worker } = workerData;
		if (worker) {
			try {
				worker.terminate();
			} catch {
				// ignored
			}
		}
		workerData.interface = null;
	}

	function getWebWorker(url, baseURI, workerData, isModuleType, useBlobURI = true) {
		const { createWorker } = workerData;
		let worker, resolvedURI, resolvedOptions;
		if (createWorker) {
			worker = createWorker();
		} else if (webWorkerURI === UNDEFINED_VALUE || webWorkerSource !== url) {
			// deno-lint-ignore valid-typeof
			const isFunctionURI = typeof url == FUNCTION_TYPE;
			if (isFunctionURI) {
				resolvedURI = url(useBlobURI);
			} else {
				resolvedURI = url;
			}
			const isDataURI = resolvedURI.startsWith("data:");
			const isBlobURI = resolvedURI.startsWith("blob:");
			if (isDataURI || isBlobURI) {
				if (isModuleType === UNDEFINED_VALUE) {
					isModuleType = false;
				}
				if (isModuleType) {
					resolvedOptions = MODULE_WORKER_OPTIONS;
				}
				try {
					worker = new Worker(resolvedURI, resolvedOptions);
				} catch (error) {
					if (isBlobURI) {
						try {
							URL.revokeObjectURL(resolvedURI);
						} catch {
							// ignored
						}
					}
					if (isFunctionURI && isBlobURI) {
						return getWebWorker(url, baseURI, workerData, isModuleType, false);
					} else if (!isModuleType) {
						return getWebWorker(url, baseURI, workerData, true, false);
					} else {
						throw error;
					}
				}
			} else {
				if (isModuleType === UNDEFINED_VALUE) {
					isModuleType = true;
				}
				if (isModuleType) {
					resolvedOptions = MODULE_WORKER_OPTIONS;
				}
				try {
					resolvedURI = new URL(resolvedURI, baseURI);
				} catch {
					// ignored
				}
				try {
					worker = new Worker(resolvedURI, resolvedOptions);
				} catch (error) {
					if (isModuleType) {
						return getWebWorker(url, baseURI, workerData, false, useBlobURI);
					} else {
						throw error;
					}
				}
			}
			webWorkerSource = url;
			webWorkerURI = resolvedURI;
			webWorkerOptions = resolvedOptions;
		} else {
			worker = new Worker(webWorkerURI, webWorkerOptions);
		}
		worker.addEventListener(MESSAGE_EVENT_TYPE, event => {
			workerData.workerAlive = true;
			clearStartupTimeout(workerData);
			onMessage(event, workerData);
		});
		worker.addEventListener(ERROR_EVENT_TYPE, event => onWorkerError(event, workerData));
		worker.addEventListener(MESSAGE_ERROR_EVENT_TYPE, event => onWorkerError(event, workerData));
		return worker;
	}

	function onStartupTimeout(workerData) {
		workerData.startupTimeout = null;
		if (workerData.workerAlive) {
			return;
		}
		const { rejectResult, writer } = workerData;
		terminateWorker$1(workerData);
		workerData.worker = null;
		if (rejectResult) {
			const error = new Error(ERR_WORKER_STARTUP_TIMEOUT);
			error.workerStartupFailed = true;
			rejectResult(error);
			if (writer) {
				writer.releaseLock();
			}
		}
	}

	function clearStartupTimeout(workerData) {
		const { startupTimeout } = workerData;
		if (startupTimeout) {
			clearTimeout(startupTimeout);
			workerData.startupTimeout = null;
		}
	}

	function onWorkerError(event, workerData) {
		if (event.preventDefault) {
			event.preventDefault();
		}
		clearStartupTimeout(workerData);
		const { workerAlive, rejectResult, writer, onTaskFinished } = workerData;
		terminateWorker$1(workerData);
		if (!workerAlive) {
			workerData.worker = null;
		}
		let error = event.error || new Error(event.message || ERROR_EVENT_TYPE);
		if (!workerAlive) {
			error = Object.assign(new Error(error.message || ERROR_EVENT_TYPE), { workerStartupFailed: true });
			workerData.startupError = error;
		}
		if (rejectResult) {
			rejectResult(error);
			if (writer) {
				writer.releaseLock();
			}
			if (workerAlive) {
				onTaskFinished();
			}
		}
	}

	function sendMessage(message, { worker, writer, transferStreams, workerAlive }) {
		try {
			const { value, readable, writable } = message;
			const transferables = [];
			if (value) {
				message.value = toExactUint8Array(value);
				transferables.push(message.value.buffer);
			}
			if (transferStreams && transferStreamsSupported && workerAlive) {
				if (readable) {
					transferables.push(readable);
				}
				if (writable) {
					transferables.push(writable);
				}
			} else {
				message.readable = message.writable = null;
			}
			if (transferables.length) {
				try {
					worker.postMessage(message, transferables);
					return true;
				} catch {
					transferStreamsSupported = false;
					message.readable = message.writable = null;
					worker.postMessage(message);
				}
			} else {
				worker.postMessage(message);
			}
		} catch (error) {
			if (writer) {
				writer.releaseLock();
			}
			throw error;
		}
	}

	async function onMessage({ data }, workerData) {
		const { type, value, messageId, result, error } = data;
		const { reader, writer, resolveResult, rejectResult, onTaskFinished, generation } = workerData;
		const stale = () => workerData.generation != generation;
		try {
			if (error) {
				const { message, stack, code, name, outputSize, cause, codecImportFailed } = error;
				const responseError = new Error(message);
				Object.assign(responseError, { stack, code, name, outputSize });
				if (cause) {
					responseError.cause = Object.assign(new Error(cause.message), { name: cause.name });
				}
				if (codecImportFailed) {
					responseError.codecImportFailed = true;
				}
				close(responseError);
			} else {
				if (type == MESSAGE_PULL) {
					const { value, done } = await reader.read();
					if (!stale()) {
						sendMessage({ type: MESSAGE_DATA, value, done, messageId }, workerData);
					}
				}
				if (type == MESSAGE_DATA) {
					await writer.ready;
					await writer.write(new Uint8Array(value));
					if (!stale()) {
						sendMessage({ type: MESSAGE_ACK_DATA, messageId }, workerData);
					}
				}
				if (type == MESSAGE_CLOSE) {
					close(null, result);
				}
			}
		} catch (error) {
			if (!stale()) {
				terminateWorker$1(workerData);
				close(error);
			}
		}

		function close(error, result) {
			if (stale()) {
				return;
			}
			if (error) {
				rejectResult(error);
			} else {
				resolveResult(result);
			}
			if (writer) {
				writer.releaseLock();
			}
			if (!(error && error.codecImportFailed)) {
				onTaskFinished();
			}
		}
	}

	/*
	 Copyright (c) 2025 Gildas Lormeau. All rights reserved.

	 Redistribution and use in source and binary forms, with or without
	 modification, are permitted provided that the following conditions are met:

	 1. Redistributions of source code must retain the above copyright notice,
	 this list of conditions and the following disclaimer.

	 2. Redistributions in binary form must reproduce the above copyright 
	 notice, this list of conditions and the following disclaimer in 
	 the documentation and/or other materials provided with the distribution.

	 3. The names of the authors may not be used to endorse or promote products
	 derived from this software without specific prior written permission.

	 THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESSED OR IMPLIED WARRANTIES,
	 INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
	 FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL JCRAFT,
	 INC. OR ANY CONTRIBUTORS TO THIS SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT,
	 INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
	 LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
	 OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
	 LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
	 NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
	 EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
	 */


	let pool = [];
	const pendingRequests = [];
	let starvationTimeout;
	let starvationDelay;

	let indexWorker = 0;

	async function runWorker(stream, workerOptions) {
		const { options, config } = workerOptions;
		const { transferStreams, useWebWorkers, useCompressionStream, compressed, checkCrc32, computeCrc32, encrypted, format, codecURI } = options;
		const { workerURI, createWorker, maxWorkers } = config;
		if (format) {
			if (codecURI) {
				options.codecURI = resolveCodecURI(codecURI, config.baseURI);
			}
			await ensureCodecStreams(format, options.codecURI);
		}
		workerOptions.transferStreams = !format && (transferStreams || (transferStreams === UNDEFINED_VALUE && config.transferStreams));
		const streamCopy = !compressed && !checkCrc32 && !computeCrc32 && !encrypted;
		const workerSupported = format === UNDEFINED_VALUE || Boolean(options.codecURI);
		workerOptions.useWebWorkers = !streamCopy && workerSupported && (useWebWorkers || (useWebWorkers === UNDEFINED_VALUE && config.useWebWorkers));
		workerOptions.workerURI = workerOptions.useWebWorkers && workerURI ? workerURI : UNDEFINED_VALUE;
		workerOptions.createWorker = workerOptions.useWebWorkers && createWorker ? createWorker : UNDEFINED_VALUE;
		options.useCompressionStream = useCompressionStream || (useCompressionStream === UNDEFINED_VALUE && config.useCompressionStream);
		return (await getWorker()).run();

		// deno-lint-ignore require-await
		async function getWorker() {
			const workerData = pool.find(workerData => !workerData.busy);
			if (workerData) {
				clearTerminateTimeout(workerData);
				return new CodecWorker(workerData, stream, workerOptions, onTaskFinished);
			} else if (pool.length < maxWorkers) {
				const workerData = { indexWorker };
				indexWorker++;
				pool.push(workerData);
				return new CodecWorker(workerData, stream, workerOptions, onTaskFinished);
			} else {
				return new Promise(resolve => {
					pendingRequests.push({ resolve, stream, workerOptions });
					starvationDelay = config.workerStarvationTimeout;
					armStarvationTimeout();
				});
			}
		}

		function onTaskFinished(workerData) {
			clearStarvationTimeout();
			if (pendingRequests.length) {
				const [{ resolve, stream, workerOptions }] = pendingRequests.splice(0, 1);
				resolve(new CodecWorker(workerData, stream, workerOptions, onTaskFinished));
				armStarvationTimeout();
			} else if (workerData.worker) {
				clearTerminateTimeout(workerData);
				terminateWorker(workerData, workerOptions);
			} else {
				pool = pool.filter(data => data != workerData);
			}
		}
	}

	function resolveCodecURI(codecURI, baseURI) {
		try {
			return new URL(codecURI, baseURI).toString();
		} catch {
			return codecURI;
		}
	}

	function armStarvationTimeout() {
		if (!starvationTimeout && pendingRequests.length && Number.isFinite(starvationDelay) && starvationDelay >= 0) {
			starvationTimeout = setTimeout(onWorkerStarvation, starvationDelay);
		}
	}

	function clearStarvationTimeout() {
		if (starvationTimeout) {
			clearTimeout(starvationTimeout);
			starvationTimeout = null;
		}
	}

	function onWorkerStarvation() {
		starvationTimeout = null;
		if (pendingRequests.length) {
			const [{ resolve, stream, workerOptions }] = pendingRequests.splice(0, 1);
			const inlineWorkerOptions = Object.assign({}, workerOptions, { useWebWorkers: false, workerURI: UNDEFINED_VALUE, createWorker: UNDEFINED_VALUE });
			resolve(new CodecWorker({}, stream, inlineWorkerOptions, onInlineTaskFinished));
			armStarvationTimeout();
		}
	}

	function onInlineTaskFinished() {
		clearStarvationTimeout();
		armStarvationTimeout();
	}

	function terminateWorker(workerData, workerOptions) {
		const { config } = workerOptions;
		const { terminateWorkerTimeout } = config;
		if (Number.isFinite(terminateWorkerTimeout) && terminateWorkerTimeout >= 0) {
			if (workerData.terminated) {
				workerData.terminated = false;
			} else {
				workerData.terminateTimeout = setTimeout(async () => {
					pool = pool.filter(data => data != workerData);
					try {
						await workerData.terminate();
					} catch {
						// ignored
					}
				}, terminateWorkerTimeout);
			}
		}
	}

	function clearTerminateTimeout(workerData) {
		const { terminateTimeout } = workerData;
		if (terminateTimeout) {
			clearTimeout(terminateTimeout);
			workerData.terminateTimeout = null;
		}
	}

	/*
	 Copyright (c) 2022 Gildas Lormeau. All rights reserved.

	 Redistribution and use in source and binary forms, with or without
	 modification, are permitted provided that the following conditions are met:

	 1. Redistributions of source code must retain the above copyright notice,
	 this list of conditions and the following disclaimer.

	 2. Redistributions in binary form must reproduce the above copyright 
	 notice, this list of conditions and the following disclaimer in 
	 the documentation and/or other materials provided with the distribution.

	 3. The names of the authors may not be used to endorse or promote products
	 derived from this software without specific prior written permission.

	 THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESSED OR IMPLIED WARRANTIES,
	 INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
	 FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL JCRAFT,
	 INC. OR ANY CONTRIBUTORS TO THIS SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT,
	 INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
	 LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
	 OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
	 LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
	 NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
	 EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
	 */

	const CP437 = "\0\u263A\u263B\u2665\u2666\u2663\u2660\u2022\u25D8\u25CB\u25D9\u2642\u2640\u266A\u266B\u263C\u25BA\u25C4\u2195\u203C\u00B6\u00A7\u25AC\u21A8\u2191\u2193\u2192\u2190\u221F\u2194\u25B2\u25BC !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~\u2302\u00C7\u00FC\u00E9\u00E2\u00E4\u00E0\u00E5\u00E7\u00EA\u00EB\u00E8\u00EF\u00EE\u00EC\u00C4\u00C5\u00C9\u00E6\u00C6\u00F4\u00F6\u00F2\u00FB\u00F9\u00FF\u00D6\u00DC\u00A2\u00A3\u00A5\u20A7\u0192\u00E1\u00ED\u00F3\u00FA\u00F1\u00D1\u00AA\u00BA\u00BF\u2310\u00AC\u00BD\u00BC\u00A1\u00AB\u00BB\u2591\u2592\u2593\u2502\u2524\u2561\u2562\u2556\u2555\u2563\u2551\u2557\u255D\u255C\u255B\u2510\u2514\u2534\u252C\u251C\u2500\u253C\u255E\u255F\u255A\u2554\u2569\u2566\u2560\u2550\u256C\u2567\u2568\u2564\u2565\u2559\u2558\u2552\u2553\u256B\u256A\u2518\u250C\u2588\u2584\u258C\u2590\u2580\u03B1\u00DF\u0393\u03C0\u03A3\u03C3\u00B5\u03C4\u03A6\u0398\u03A9\u03B4\u221E\u03C6\u03B5\u2229\u2261\u00B1\u2265\u2264\u2320\u2321\u00F7\u2248\u00B0\u2219\u00B7\u221A\u207F\u00B2\u25A0\u00A0".split("");

	function decodeCP437(stringValue) {
		let result = "";
		for (let indexCharacter = 0; indexCharacter < stringValue.length; indexCharacter++) {
			result += CP437[stringValue[indexCharacter]];
		}
		return result;
	}

	/*
	 Copyright (c) 2022 Gildas Lormeau. All rights reserved.

	 Redistribution and use in source and binary forms, with or without
	 modification, are permitted provided that the following conditions are met:

	 1. Redistributions of source code must retain the above copyright notice,
	 this list of conditions and the following disclaimer.

	 2. Redistributions in binary form must reproduce the above copyright 
	 notice, this list of conditions and the following disclaimer in 
	 the documentation and/or other materials provided with the distribution.

	 3. The names of the authors may not be used to endorse or promote products
	 derived from this software without specific prior written permission.

	 THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESSED OR IMPLIED WARRANTIES,
	 INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
	 FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL JCRAFT,
	 INC. OR ANY CONTRIBUTORS TO THIS SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT,
	 INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
	 LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
	 OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
	 LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
	 NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
	 EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
	 */


	function decodeText(value, encoding) {
		return decode(value, encoding, true);
	}

	function decodeTextRemovingBOM(value, encoding) {
		return decode(value, encoding, false);
	}

	function decode(value, encoding, ignoreBOM) {
		if (encoding && encoding.trim().toLowerCase() == "cp437") {
			return decodeCP437(value);
		} else {
			return new TextDecoder(encoding, { ignoreBOM }).decode(value);
		}
	}

	/*
	 Copyright (c) 2025 Gildas Lormeau. All rights reserved.

	 Redistribution and use in source and binary forms, with or without
	 modification, are permitted provided that the following conditions are met:

	 1. Redistributions of source code must retain the above copyright notice,
	 this list of conditions and the following disclaimer.

	 2. Redistributions in binary form must reproduce the above copyright 
	 notice, this list of conditions and the following disclaimer in 
	 the documentation and/or other materials provided with the distribution.

	 3. The names of the authors may not be used to endorse or promote products
	 derived from this software without specific prior written permission.

	 THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESSED OR IMPLIED WARRANTIES,
	 INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
	 FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL JCRAFT,
	 INC. OR ANY CONTRIBUTORS TO THIS SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT,
	 INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
	 LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
	 OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
	 LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
	 NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
	 EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
	 */


	const ERR_HTTP_STATUS = "HTTP error ";
	const ERR_HTTP_RANGE = "HTTP Range not supported";
	const ERR_HTTP_RESOURCE_CHANGED = "HTTP resource changed";
	const ERR_ITERATOR_COMPLETED_TOO_SOON = "Writer iterator completed too soon";
	const ERR_WRITER_NOT_INITIALIZED = "Writer not initialized";
	const HTTP_HEADER_CONTENT_LENGTH = "Content-Length";
	const HTTP_HEADER_CONTENT_ENCODING = "Content-Encoding";
	const HTTP_HEADER_CONTENT_RANGE = "Content-Range";
	const HTTP_HEADER_ACCEPT_RANGES = "Accept-Ranges";
	const HTTP_HEADER_RANGE = "Range";
	const HTTP_HEADER_ETAG = "Etag";
	const HTTP_HEADER_LAST_MODIFIED = "Last-Modified";
	const HTTP_METHOD_HEAD = "HEAD";
	const HTTP_METHOD_GET = "GET";
	const HTTP_RANGE_UNIT = "bytes";
	const DEFAULT_MAXIMUM_RANGE_SIZE = 16 * 1024 * 1024;

	const PROPERTY_NAME_WRITABLE = "writable";
	const DISK_BOUNDARY = Symbol();

	class Stream {

		constructor() {
			this.size = 0;
		}

		init() {
			this.initialized = true;
		}
	}

	class Reader extends Stream {

		get readable() {
			return this.createReadable();
		}

		createReadable({ offset = 0, size, chunkSize = getChunkSize(getConfiguration()) } = {}) {
			const reader = this;
			let chunkOffset = 0;
			chunkSize = normalizeChunkSize(chunkSize);
			return new ReadableStream({
				async pull(controller) {
					const dataSize = size === UNDEFINED_VALUE ? chunkSize : Math.min(chunkSize, size - chunkOffset);
					const data = await readUint8Array(reader, offset + chunkOffset, dataSize);
					if (data.length) {
						controller.enqueue(data);
					}
					if ((chunkOffset + chunkSize >= size) || (!data.length && dataSize)) {
						controller.close();
					} else {
						chunkOffset += chunkSize;
					}
				}
			});
		}
	}

	class Writer extends Stream {

		constructor() {
			super();
			const writer = this;
			const writable = new WritableStream({
				write(chunk) {
					if (!writer.initialized) {
						throw new Error(ERR_WRITER_NOT_INITIALIZED);
					}
					return writer.writeUint8Array(toExactUint8Array(chunk));
				}
			});
			Object.defineProperty(writer, PROPERTY_NAME_WRITABLE, {
				get() {
					return writable;
				}
			});
		}

		writeUint8Array() {
			// abstract
		}
	}

	class Data64URIWriter extends Writer {

		constructor(contentType) {
			super();
			Object.assign(this, {
				contentType,
				data: "data:" + (contentType || "") + ";base64,",
				pendingCharacters: ""
			});
		}

		writeUint8Array(array) {
			const writer = this;
			let indexArray;
			let dataString = writer.pendingCharacters;
			const delta = writer.pendingCharacters.length;
			writer.pendingCharacters = "";
			for (indexArray = 0; indexArray < (Math.floor((delta + array.length) / 3) * 3) - delta; indexArray++) {
				dataString += String.fromCharCode(array[indexArray]);
			}
			for (; indexArray < array.length; indexArray++) {
				writer.pendingCharacters += String.fromCharCode(array[indexArray]);
			}
			if (dataString.length > 2) {
				writer.data += btoa(dataString);
			} else {
				writer.pendingCharacters = dataString + writer.pendingCharacters;
			}
		}

		getData() {
			return this.data + btoa(this.pendingCharacters);
		}
	}

	let blobSliceReliable;
	let blobSliceProbe;

	function probeBlobSliceReliability() {
		blobSliceProbe = (async () => {
			try {
				const slicedBlob = new Blob([new Uint8Array(3)]).slice(1, 2);
				const streamReader = slicedBlob.stream().getReader();
				let streamedLength = 0;
				let result = await streamReader.read();
				while (!result.done) {
					streamedLength += result.value.length;
					result = await streamReader.read();
				}
				blobSliceReliable = streamedLength == 1;
			} catch {
				blobSliceReliable = false;
			}
		})();
	}

	class BlobReader extends Reader {

		constructor(blob) {
			super();
			Object.assign(this, {
				sourceBlob: blob,
				size: blob.size
			});
			if (!blobSliceProbe) {
				probeBlobSliceReliability();
			}
		}

		createReadable(options) {
			const reader = this;
			const { sourceBlob, size } = reader;
			const { offset = 0, size: readSize = size - offset } = options || {};
			if (!offset && readSize >= size) {
				return toCompatibleReadable(sourceBlob.stream());
			}
			if (blobSliceReliable) {
				return toCompatibleReadable(sourceBlob.slice(offset, offset + readSize).stream());
			}
			return super.createReadable(options);
		}

		async readUint8Array(offset, length) {
			const reader = this;
			const offsetEnd = offset + length;
			const readsWholeBlob = !offset && offsetEnd >= reader.size;
			const blob = readsWholeBlob ? reader.sourceBlob : reader.sourceBlob.slice(offset, offsetEnd);
			let arrayBuffer = await blob.arrayBuffer();
			const sliceIgnoredByBuggyImplementation = arrayBuffer.byteLength > length;
			if (sliceIgnoredByBuggyImplementation) {
				arrayBuffer = arrayBuffer.slice(offset, offsetEnd);
			}
			return new Uint8Array(arrayBuffer);
		}
	}

	class BlobWriter extends Stream {

		constructor(contentType) {
			super();
			const writer = this;
			const transformStream = new TransformStream();
			Object.defineProperty(writer, PROPERTY_NAME_WRITABLE, {
				get() {
					return transformStream.writable;
				}
			});
			writer.contentType = contentType;
			writer.blobPromise = streamToBlob(transformStream.readable, contentType);
			writer.blobPromise.catch(() => { });
		}

		getData() {
			return this.blobPromise;
		}
	}

	class TextWriter extends BlobWriter {

		constructor(encoding) {
			super();
			Object.assign(this, {
				encoding,
				utf8: !encoding || encoding.toLowerCase() == "utf-8"
			});
		}

		async getData() {
			const {
				encoding,
				utf8
			} = this;
			const blob = await super.getData();
			if (blob.text && utf8) {
				return blob.text();
			} else {
				return decodeTextRemovingBOM(new Uint8Array(await blob.arrayBuffer()), encoding);
			}
		}
	}

	class FetchReader extends Reader {

		constructor(url, options) {
			super();
			createHttpReader(this, url, options);
		}

		async init() {
			await initHttpReader(this, sendFetchRequest, getFetchRequestData);
			super.init();
		}

		createReadable(options) {
			const reader = this;
			const { useRangeHeader, forceRangeRequests, size } = reader;
			if ((useRangeHeader || forceRangeRequests) && size !== UNDEFINED_VALUE) {
				const { offset = 0, size: readSize = size - offset } = options || {};
				if (readSize > 0 && offset < size) {
					return createRangeReadable(reader, offset, Math.min(readSize, size - offset));
				}
			}
			return super.createReadable(options);
		}

		readUint8Array(index, length) {
			return readUint8ArrayHttpReader(this, index, length, sendFetchRequest, getFetchRequestData);
		}
	}

	class XHRReader extends Reader {

		constructor(url, options) {
			super();
			createHttpReader(this, url, options);
		}

		async init() {
			await initHttpReader(this, sendXMLHttpRequest, getXMLHttpRequestData);
			super.init();
		}

		readUint8Array(index, length) {
			return readUint8ArrayHttpReader(this, index, length, sendXMLHttpRequest, getXMLHttpRequestData);
		}
	}

	function createHttpReader(httpReader, url, options) {
		const {
			preventHeadRequest,
			useRangeHeader,
			forceRangeRequests,
			combineSizeEocd,
			checkResourceChanges = true,
			maximumRangeSize = DEFAULT_MAXIMUM_RANGE_SIZE,
			fetch
		} = options;
		options = Object.assign({}, options);
		delete options.preventHeadRequest;
		delete options.useRangeHeader;
		delete options.forceRangeRequests;
		delete options.combineSizeEocd;
		delete options.checkResourceChanges;
		delete options.maximumRangeSize;
		delete options.useXHR;
		delete options.fetch;
		Object.assign(httpReader, {
			url,
			options,
			preventHeadRequest,
			useRangeHeader,
			forceRangeRequests,
			combineSizeEocd,
			checkResourceChanges,
			maximumRangeSize,
			fetch
		});
	}

	async function initHttpReader(httpReader, sendRequest, getRequestData) {
		const {
			url,
			preventHeadRequest,
			useRangeHeader,
			forceRangeRequests,
			combineSizeEocd
		} = httpReader;
		if (isHttpFamily(url) && (useRangeHeader || forceRangeRequests) && (typeof preventHeadRequest == UNDEFINED_TYPE || preventHeadRequest)) {
			const response = await sendRequest(HTTP_METHOD_GET, httpReader, getRangeHeaders(httpReader, combineSizeEocd ? -END_OF_CENTRAL_DIR_LENGTH : undefined));
			const acceptRanges = response.headers.get(HTTP_HEADER_ACCEPT_RANGES);
			if (!forceRangeRequests && (!acceptRanges || acceptRanges.toLowerCase() != HTTP_RANGE_UNIT)) {
				throw new Error(ERR_HTTP_RANGE);
			} else {
				if (combineSizeEocd) {
					const eocdCache = new Uint8Array(await response.arrayBuffer());
					if (response.status == 206 && eocdCache.length == END_OF_CENTRAL_DIR_LENGTH) {
						httpReader.eocdCache = eocdCache;
					}
				}
				setResourceValidators(httpReader, response);
				const contentSize = getContentRangeSize(response);
				if (contentSize === UNDEFINED_VALUE) {
					await getContentLength(httpReader, sendRequest, getRequestData);
				} else {
					httpReader.size = contentSize;
				}
			}
		} else {
			await getContentLength(httpReader, sendRequest, getRequestData);
		}
	}

	async function readUint8ArrayHttpReader(httpReader, index, length, sendRequest, getRequestData) {
		const {
			useRangeHeader,
			forceRangeRequests,
			eocdCache,
			size,
			options
		} = httpReader;
		if (useRangeHeader || forceRangeRequests) {
			if (eocdCache && index == size - END_OF_CENTRAL_DIR_LENGTH && length == END_OF_CENTRAL_DIR_LENGTH) {
				return eocdCache;
			}
			if (index >= size || length === 0) {
				return EMPTY_UINT8_ARRAY;
			} else {
				if (index + length > size) {
					length = size - index;
				}
				const response = await sendRequest(HTTP_METHOD_GET, httpReader, getRangeHeaders(httpReader, index, length));
				if (response.status != 206) {
					throw new Error(ERR_HTTP_RANGE);
				}
				const contentRangeHeader = response.headers.get(HTTP_HEADER_CONTENT_RANGE);
				if (contentRangeHeader) {
					const rangeStart = Number(contentRangeHeader.trim().split(/[\s-]+/)[1]);
					if (!Number.isNaN(rangeStart) && rangeStart != index) {
						throw new Error(ERR_HTTP_RANGE);
					}
				}
				checkResourceValidators(httpReader, response);
				setResourceValidators(httpReader, response);
				const data = new Uint8Array(await response.arrayBuffer());
				if (data.length != length) {
					throw new Error(ERR_HTTP_RANGE);
				}
				return data;
			}
		} else {
			const { data } = httpReader;
			if (!data) {
				await getRequestData(httpReader, options);
			}
			return httpReader.data.subarray(index, index + length);
		}
	}

	function createRangeReadable(httpReader, offset, size) {
		let bodyReader;
		let windowOffset = offset;
		let windowRemainingLength = 0;
		let remainingLength = size;
		return new ReadableStream({
			start() {
				return openWindow();
			},
			async pull(controller) {
				if (!bodyReader) {
					await openWindow();
				}
				const { value, done } = await bodyReader.read();
				if (done) {
					throw new Error(ERR_HTTP_RANGE);
				}
				const chunk = value.length > windowRemainingLength ? value.subarray(0, windowRemainingLength) : value;
				windowRemainingLength -= chunk.length;
				remainingLength -= chunk.length;
				if (chunk.length) {
					controller.enqueue(chunk);
				}
				if (!windowRemainingLength) {
					await closeWindow();
					if (!remainingLength) {
						controller.close();
					}
				}
			},
			cancel(reason) {
				return bodyReader && bodyReader.cancel(reason);
			}
		});

		async function openWindow() {
			const windowLength = Math.min(httpReader.maximumRangeSize, remainingLength);
			const response = await sendFetchRequest(HTTP_METHOD_GET, httpReader, getRangeHeaders(httpReader, windowOffset, windowLength));
			if (response.status != 206) {
				throw new Error(ERR_HTTP_RANGE);
			}
			const contentRangeHeader = response.headers.get(HTTP_HEADER_CONTENT_RANGE);
			if (contentRangeHeader) {
				const rangeStart = Number(contentRangeHeader.trim().split(/[\s-]+/)[1]);
				if (!Number.isNaN(rangeStart) && rangeStart != windowOffset) {
					throw new Error(ERR_HTTP_RANGE);
				}
			}
			checkResourceValidators(httpReader, response);
			setResourceValidators(httpReader, response);
			windowOffset += windowLength;
			windowRemainingLength = windowLength;
			bodyReader = response.body.getReader();
		}

		async function closeWindow() {
			const currentBodyReader = bodyReader;
			bodyReader = UNDEFINED_VALUE;
			await currentBodyReader.cancel();
		}
	}

	function getContentRangeSize(response) {
		const contentRangeHeader = response.headers.get(HTTP_HEADER_CONTENT_RANGE);
		if (contentRangeHeader) {
			const headerValue = contentRangeHeader.trim().split(/\s*\/\s*/)[1];
			if (headerValue && headerValue != "*") {
				const contentSize = Number(headerValue);
				if (!Number.isNaN(contentSize)) {
					return contentSize;
				}
			}
		}
	}

	function getResourceValidators({ headers }) {
		return {
			etag: headers.get(HTTP_HEADER_ETAG) || UNDEFINED_VALUE,
			lastModified: headers.get(HTTP_HEADER_LAST_MODIFIED) || UNDEFINED_VALUE
		};
	}

	function setResourceValidators(httpReader, response) {
		const { checkResourceChanges, resourceValidators } = httpReader;
		if (checkResourceChanges && !resourceValidators && response.status == 206) {
			httpReader.resourceValidators = getResourceValidators(response);
		}
	}

	function checkResourceValidators(httpReader, response) {
		const { checkResourceChanges, resourceValidators, size } = httpReader;
		if (checkResourceChanges) {
			const contentRangeSize = getContentRangeSize(response);
			if (contentRangeSize !== UNDEFINED_VALUE && size !== UNDEFINED_VALUE && contentRangeSize != size) {
				throw new Error(ERR_HTTP_RESOURCE_CHANGED);
			}
			if (resourceValidators) {
				const validators = getResourceValidators(response);
				const changed = Object.entries(resourceValidators).some(([name, value]) =>
					value !== UNDEFINED_VALUE && validators[name] !== UNDEFINED_VALUE && value != validators[name]);
				if (changed) {
					throw new Error(ERR_HTTP_RESOURCE_CHANGED);
				}
			}
		}
	}

	function getRangeHeaders(httpReader, index = 0, length = 1) {
		return Object.assign({}, getHeaders(httpReader), { [HTTP_HEADER_RANGE]: HTTP_RANGE_UNIT + "=" + (index < 0 ? index : index + "-" + (index + length - 1)) });
	}

	function getHeaders({ options }) {
		const { headers } = options;
		if (headers) {
			if (Symbol.iterator in headers) {
				return Object.fromEntries(headers);
			} else {
				return headers;
			}
		}
	}

	async function getFetchRequestData(httpReader) {
		await getRequestData(httpReader, sendFetchRequest);
	}

	async function getXMLHttpRequestData(httpReader) {
		await getRequestData(httpReader, sendXMLHttpRequest);
	}

	async function getRequestData(httpReader, sendRequest) {
		const response = await sendRequest(HTTP_METHOD_GET, httpReader, getHeaders(httpReader));
		httpReader.data = new Uint8Array(await response.arrayBuffer());
		httpReader.size = httpReader.data.length;
	}

	async function getContentLength(httpReader, sendRequest, getRequestData) {
		if (httpReader.preventHeadRequest) {
			await getRequestData(httpReader, httpReader.options);
		} else {
			const response = await sendRequest(HTTP_METHOD_HEAD, httpReader, getHeaders(httpReader));
			const contentLength = response.headers.get(HTTP_HEADER_CONTENT_LENGTH);
			if (contentLength && !response.headers.get(HTTP_HEADER_CONTENT_ENCODING)) {
				httpReader.size = Number(contentLength);
			} else {
				await getRequestData(httpReader, httpReader.options);
			}
		}
	}

	async function sendFetchRequest(method, { fetch: fetchFunction = fetch, options, url }, headers) {
		const response = await fetchFunction(url, Object.assign({}, options, { method, headers }));
		if (response.status < 400) {
			return response;
		} else {
			throw response.status == 416 ? new Error(ERR_HTTP_RANGE) : new Error(ERR_HTTP_STATUS + (response.statusText || response.status));
		}
	}

	function sendXMLHttpRequest(method, { url }, headers) {
		return new Promise((resolve, reject) => {
			const request = new XMLHttpRequest();
			request.addEventListener("load", () => {
				if (request.status < 400) {
					const headers = [];
					request.getAllResponseHeaders().trim().split(/[\r\n]+/).forEach(header => {
						const splitHeader = header.trim().split(/\s*:\s*/);
						splitHeader[0] = splitHeader[0].trim().replace(/^[a-z]|-[a-z]/g, value => value.toUpperCase());
						headers.push(splitHeader);
					});
					resolve({
						status: request.status,
						arrayBuffer: () => request.response,
						headers: new Map(headers)
					});
				} else {
					reject(request.status == 416 ? new Error(ERR_HTTP_RANGE) : new Error(ERR_HTTP_STATUS + (request.statusText || request.status)));
				}
			}, false);
			request.addEventListener("error", event => reject(event.detail ? event.detail.error : new Error("Network error")), false);
			request.open(method, url);
			if (headers) {
				for (const entry of Object.entries(headers)) {
					request.setRequestHeader(entry[0], entry[1]);
				}
			}
			request.responseType = "arraybuffer";
			request.send();
		});
	}

	class HttpReader extends Reader {

		constructor(url, options = {}) {
			super();
			Object.assign(this, {
				url,
				reader: options.useXHR && !options.fetch ? new XHRReader(url, options) : new FetchReader(url, options)
			});
		}

		set size(value) {
			// ignored
		}

		get size() {
			return this.reader.size;
		}

		async init() {
			await this.reader.init();
			super.init();
		}

		createReadable(options) {
			return this.reader.createReadable(options);
		}

		readUint8Array(index, length) {
			return this.reader.readUint8Array(index, length);
		}
	}

	class HttpRangeReader extends HttpReader {

		constructor(url, options = {}) {
			super(url, Object.assign({}, options, { useRangeHeader: true }));
		}
	}

	class SplitDataReader extends Reader {

		constructor(readers) {
			super();
			this.readers = readers;
		}

		async init() {
			const reader = this;
			reader.lastDiskNumber = 0;
			const readers = reader.readers = await Promise.all(reader.readers.map(initDiskReader));
			reader.diskOffsets = readers.map(diskReader => {
				const diskOffset = reader.size;
				reader.size += diskReader.size;
				return diskOffset;
			});
			super.init();
		}

		getDiskOffset(diskNumber) {
			const { diskOffsets, size } = this;
			const diskOffset = diskOffsets[diskNumber];
			return diskOffset === UNDEFINED_VALUE ? size : diskOffset;
		}

		async readUint8Array(offset, length) {
			const reader = this;
			const { readers } = this;
			let result;
			let currentDiskNumber = 0;
			let currentReaderOffset = offset;
			while (readers[currentDiskNumber] && currentReaderOffset >= readers[currentDiskNumber].size) {
				currentReaderOffset -= readers[currentDiskNumber].size;
				currentDiskNumber++;
			}
			const currentReader = readers[currentDiskNumber];
			if (currentReader) {
				const currentReaderSize = currentReader.size;
				if (currentReaderOffset + length <= currentReaderSize) {
					result = await readUint8Array(currentReader, currentReaderOffset, length);
				} else {
					const chunkLength = currentReaderSize - currentReaderOffset;
					const firstPart = await readUint8Array(currentReader, currentReaderOffset, chunkLength);
					const secondPart = await reader.readUint8Array(offset + chunkLength, length - chunkLength);
					result = concat(firstPart, secondPart);
				}
			} else {
				result = EMPTY_UINT8_ARRAY;
			}
			reader.lastDiskNumber = Math.max(currentDiskNumber, reader.lastDiskNumber);
			return result;
		}
	}

	class SplitDataWriter extends Stream {

		constructor(writerGenerator, maxSize = 4294967295) {
			super();
			const writer = this;
			Object.assign(writer, {
				diskNumber: 0,
				diskOffset: 0,
				size: 0,
				maxSize,
				availableSize: maxSize
			});
			let diskSourceWriter, diskWritable, diskWriter;
			const writable = new WritableStream({
				async write(chunk) {
					if (chunk === DISK_BOUNDARY) {
						if (diskWriter) {
							await endDisk();
						}
						return;
					}
					const { availableSize } = writer;
					if (!diskWriter) {
						const { value, done } = await writerGenerator.next();
						if (done && !value) {
							throw new Error(ERR_ITERATOR_COMPLETED_TOO_SOON);
						} else {
							diskSourceWriter = value;
							diskSourceWriter.size = 0;
							if (diskSourceWriter.maxSize) {
								writer.maxSize = diskSourceWriter.maxSize;
							}
							writer.availableSize = writer.maxSize;
							await initStream(diskSourceWriter);
							diskWritable = value.writable;
							diskWriter = diskWritable.getWriter();
						}
						await this.write(chunk);
					} else if (chunk.length >= availableSize) {
						await writeChunk(chunk.subarray(0, availableSize));
						await endDisk();
						if (chunk.length > availableSize) {
							await this.write(chunk.subarray(availableSize));
						}
					} else {
						await writeChunk(chunk);
					}
				},
				async close() {
					if (diskWriter) {
						await diskWriter.ready;
						await closeDiskWriter();
					}
				},
				async abort(reason) {
					if (diskWriter) {
						await diskWriter.abort(reason);
					}
				}
			});
			Object.defineProperty(writer, PROPERTY_NAME_WRITABLE, {
				get() {
					return writable;
				}
			});

			async function writeChunk(chunk) {
				const chunkLength = chunk.length;
				if (chunkLength) {
					await diskWriter.ready;
					await diskWriter.write(chunk);
					diskSourceWriter.size += chunkLength;
					writer.availableSize -= chunkLength;
				}
			}

			async function endDisk() {
				await closeDiskWriter();
				writer.diskOffset += diskSourceWriter.size;
				writer.diskNumber++;
				diskWriter = null;
				writer.availableSize = writer.maxSize;
			}

			async function closeDiskWriter() {
				await diskWriter.close();
			}
		}

		async closeDisk() {
			const streamWriter = this.writable.getWriter();
			try {
				await streamWriter.ready;
				await streamWriter.write(DISK_BOUNDARY);
			} finally {
				streamWriter.releaseLock();
			}
		}
	}

	class GenericReader {

		constructor(reader) {
			if (Array.isArray(reader)) {
				reader = new SplitDataReader(reader);
			}
			if (reader instanceof ReadableStream || typeof reader.getReader == FUNCTION_TYPE) {
				reader = {
					readable: toCompatibleReadable(reader)
				};
			}
			return reader;
		}
	}

	class GenericWriter {

		constructor(writer) {
			if (writer.writable === UNDEFINED_VALUE && typeof writer.next == FUNCTION_TYPE) {
				writer = new SplitDataWriter(writer);
			}
			if (writer instanceof WritableStream || typeof writer.getWriter == FUNCTION_TYPE) {
				writer = {
					writable: toCompatibleWritable(writer)
				};
			}
			if (writer.size === UNDEFINED_VALUE) {
				writer.size = 0;
			}
			return writer;
		}
	}

	function ownsWritable(writer) {
		return Boolean(writer && writer.getData);
	}

	function isHttpFamily(url) {
		const { baseURI } = getConfiguration();
		const { protocol } = new URL(url, baseURI);
		return protocol == "http:" || protocol == "https:";
	}

	async function initStream(stream, initSize) {
		if (stream.init && !stream.initialized) {
			await stream.init(initSize);
		} else {
			return Promise.resolve();
		}
	}

	async function initDiskReader(diskReader) {
		diskReader = new GenericReader(diskReader);
		await initStream(diskReader);
		if (diskReader.size === UNDEFINED_VALUE || !diskReader.readUint8Array) {
			diskReader = new BlobReader(await streamToBlob(diskReader.readable));
			await initStream(diskReader);
		}
		return diskReader;
	}

	function readUint8Array(reader, offset, size) {
		return reader.readUint8Array(offset, size);
	}

	/*
	 Copyright (c) 2025 Gildas Lormeau. All rights reserved.

	 Redistribution and use in source and binary forms, with or without
	 modification, are permitted provided that the following conditions are met:

	 1. Redistributions of source code must retain the above copyright notice,
	 this list of conditions and the following disclaimer.

	 2. Redistributions in binary form must reproduce the above copyright 
	 notice, this list of conditions and the following disclaimer in 
	 the documentation and/or other materials provided with the distribution.

	 3. The names of the authors may not be used to endorse or promote products
	 derived from this software without specific prior written permission.

	 THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESSED OR IMPLIED WARRANTIES,
	 INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
	 FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL JCRAFT,
	 INC. OR ANY CONTRIBUTORS TO THIS SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT,
	 INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
	 LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
	 OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
	 LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
	 NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
	 EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
	 */

	const PROPERTY_NAME_FILENAME = "filename";
	const PROPERTY_NAME_RAW_FILENAME = "rawFilename";
	const PROPERTY_NAME_COMMENT = "comment";
	const PROPERTY_NAME_RAW_COMMENT = "rawComment";
	const PROPERTY_NAME_UNCOMPRESSED_SIZE = "uncompressedSize";
	const PROPERTY_NAME_COMPRESSED_SIZE = "compressedSize";
	const PROPERTY_NAME_OFFSET = "offset";
	const PROPERTY_NAME_DISK_NUMBER_START = "diskNumberStart";
	const PROPERTY_NAME_LAST_MODIFICATION_DATE = "lastModDate";
	const PROPERTY_NAME_RAW_LAST_MODIFICATION_DATE = "rawLastModDate";
	const PROPERTY_NAME_LAST_ACCESS_DATE = "lastAccessDate";
	const PROPERTY_NAME_RAW_LAST_ACCESS_DATE = "rawLastAccessDate";
	const PROPERTY_NAME_CREATION_DATE = "creationDate";
	const PROPERTY_NAME_RAW_CREATION_DATE = "rawCreationDate";
	const PROPERTY_NAME_INTERNAL_FILE_ATTRIBUTES = "internalFileAttributes";
	const PROPERTY_NAME_EXTERNAL_FILE_ATTRIBUTES = "externalFileAttributes";
	const PROPERTY_NAME_MSDOS_ATTRIBUTES_RAW = "msdosAttributesRaw";
	const PROPERTY_NAME_MSDOS_ATTRIBUTES = "msdosAttributes";
	const PROPERTY_NAME_MS_DOS_COMPATIBLE = "msDosCompatible";
	const PROPERTY_NAME_ZIP64 = "zip64";
	const PROPERTY_NAME_ENCRYPTED = "encrypted";
	const PROPERTY_NAME_VERSION = "version";
	const PROPERTY_NAME_VERSION_MADE_BY = "versionMadeBy";
	const PROPERTY_NAME_ZIPCRYPTO = "zipCrypto";
	const PROPERTY_NAME_DIRECTORY = "directory";
	const PROPERTY_NAME_EXECUTABLE = "executable";
	const PROPERTY_NAME_SYMLINK = "symlink";
	const PROPERTY_NAME_COMPRESSION_METHOD = "compressionMethod";
	const PROPERTY_NAME_SIGNATURE = "signature";
	const PROPERTY_NAME_CRC32 = "crc32";
	const PROPERTY_NAME_EXTRA_FIELD = "extraField";
	const PROPERTY_NAME_EXTRA_FIELD_INFOZIP = "extraFieldInfoZip";
	const PROPERTY_NAME_EXTRA_FIELD_UNIX = "extraFieldUnix";
	const PROPERTY_NAME_EXTRA_FIELD_UNIX_TYPE1 = "extraFieldUnixType1";
	const PROPERTY_NAME_EXTRA_FIELD_PKWARE_UNIX = "extraFieldPkwareUnix";
	const PROPERTY_NAME_UID = "uid";
	const PROPERTY_NAME_GID = "gid";
	const PROPERTY_NAME_UNIX_MODE = "unixMode";
	const PROPERTY_NAME_SETUID = "setuid";
	const PROPERTY_NAME_SETGID = "setgid";
	const PROPERTY_NAME_STICKY = "sticky";
	const PROPERTY_NAME_BITFLAG = "bitFlag";
	const PROPERTY_NAME_RAW_BITFLAG = "rawBitFlag";
	const PROPERTY_NAME_FILENAME_LENGTH = "filenameLength";
	const PROPERTY_NAME_EXTRA_FIELD_LENGTH = "extraFieldLength";
	const PROPERTY_NAME_UNIX_EXTERNAL_UPPER = "unixExternalUpper";
	const PROPERTY_NAME_FILENAME_UTF8 = "filenameUTF8";
	const PROPERTY_NAME_COMMENT_UTF8 = "commentUTF8";
	const PROPERTY_NAME_RAW_EXTRA_FIELD = "rawExtraField";
	const PROPERTY_NAME_EXTRA_FIELD_ZIP64 = "extraFieldZip64";
	const PROPERTY_NAME_EXTRA_FIELD_UNICODE_PATH = "extraFieldUnicodePath";
	const PROPERTY_NAME_EXTRA_FIELD_UNICODE_COMMENT = "extraFieldUnicodeComment";
	const PROPERTY_NAME_EXTRA_FIELD_AES = "extraFieldAES";
	const PROPERTY_NAME_EXTRA_FIELD_NTFS = "extraFieldNTFS";
	const PROPERTY_NAME_EXTRA_FIELD_EXTENDED_TIMESTAMP = "extraFieldExtendedTimestamp";
	const PROPERTY_NAME_EXTRA_FIELD_USDZ = "extraFieldUSDZ";

	const PROPERTY_NAMES = [
		PROPERTY_NAME_FILENAME,
		PROPERTY_NAME_RAW_FILENAME,
		PROPERTY_NAME_UNCOMPRESSED_SIZE,
		PROPERTY_NAME_COMPRESSED_SIZE,
		PROPERTY_NAME_LAST_MODIFICATION_DATE,
		PROPERTY_NAME_RAW_LAST_MODIFICATION_DATE,
		PROPERTY_NAME_COMMENT,
		PROPERTY_NAME_RAW_COMMENT,
		PROPERTY_NAME_LAST_ACCESS_DATE,
		PROPERTY_NAME_RAW_LAST_ACCESS_DATE,
		PROPERTY_NAME_CREATION_DATE,
		PROPERTY_NAME_RAW_CREATION_DATE,
		PROPERTY_NAME_OFFSET,
		PROPERTY_NAME_DISK_NUMBER_START,
		PROPERTY_NAME_INTERNAL_FILE_ATTRIBUTES,
		PROPERTY_NAME_EXTERNAL_FILE_ATTRIBUTES,
		PROPERTY_NAME_MSDOS_ATTRIBUTES_RAW,
		PROPERTY_NAME_MSDOS_ATTRIBUTES,
		PROPERTY_NAME_MS_DOS_COMPATIBLE,
		PROPERTY_NAME_ZIP64,
		PROPERTY_NAME_ENCRYPTED,
		PROPERTY_NAME_VERSION,
		PROPERTY_NAME_VERSION_MADE_BY,
		PROPERTY_NAME_ZIPCRYPTO,
		PROPERTY_NAME_DIRECTORY,
		PROPERTY_NAME_EXECUTABLE,
		PROPERTY_NAME_SYMLINK,
		PROPERTY_NAME_COMPRESSION_METHOD,
		PROPERTY_NAME_SIGNATURE,
		PROPERTY_NAME_CRC32,
		PROPERTY_NAME_EXTRA_FIELD,
		PROPERTY_NAME_EXTRA_FIELD_UNIX,
		PROPERTY_NAME_EXTRA_FIELD_INFOZIP,
		PROPERTY_NAME_EXTRA_FIELD_UNIX_TYPE1,
		PROPERTY_NAME_EXTRA_FIELD_PKWARE_UNIX,
		PROPERTY_NAME_UID,
		PROPERTY_NAME_GID,
		PROPERTY_NAME_UNIX_MODE,
		PROPERTY_NAME_UNIX_EXTERNAL_UPPER,
		PROPERTY_NAME_SETUID,
		PROPERTY_NAME_SETGID,
		PROPERTY_NAME_STICKY,
		PROPERTY_NAME_BITFLAG,
		PROPERTY_NAME_RAW_BITFLAG,
		PROPERTY_NAME_FILENAME_LENGTH,
		PROPERTY_NAME_EXTRA_FIELD_LENGTH,
		PROPERTY_NAME_FILENAME_UTF8,
		PROPERTY_NAME_COMMENT_UTF8,
		PROPERTY_NAME_RAW_EXTRA_FIELD,
		PROPERTY_NAME_EXTRA_FIELD_ZIP64,
		PROPERTY_NAME_EXTRA_FIELD_UNICODE_PATH,
		PROPERTY_NAME_EXTRA_FIELD_UNICODE_COMMENT,
		PROPERTY_NAME_EXTRA_FIELD_AES,
		PROPERTY_NAME_EXTRA_FIELD_NTFS,
		PROPERTY_NAME_EXTRA_FIELD_EXTENDED_TIMESTAMP,
		PROPERTY_NAME_EXTRA_FIELD_USDZ
	];

	class Entry {

		constructor(data) {
			PROPERTY_NAMES.forEach(name => this[name] = data[name]);
		}

	}

	/*
	 Copyright (c) 2025 Gildas Lormeau. All rights reserved.

	 Redistribution and use in source and binary forms, with or without
	 modification, are permitted provided that the following conditions are met:

	 1. Redistributions of source code must retain the above copyright notice,
	 this list of conditions and the following disclaimer.

	 2. Redistributions in binary form must reproduce the above copyright
	 notice, this list of conditions and the following disclaimer in
	 the documentation and/or other materials provided with the distribution.

	 3. The names of the authors may not be used to endorse or promote products
	 derived from this software without specific prior written permission.

	 THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESSED OR IMPLIED WARRANTIES,
	 INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
	 FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL JCRAFT,
	 INC. OR ANY CONTRIBUTORS TO THIS SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT,
	 INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
	 LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
	 OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
	 LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
	 NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
	 EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
	 */


	const ERR_BAD_FORMAT = "File format is not recognized";
	const ERR_EOCDR_NOT_FOUND = "End of central directory not found";
	const ERR_EOCDR_LOCATOR_ZIP64_NOT_FOUND = "End of Zip64 central directory locator not found";
	const ERR_CENTRAL_DIRECTORY_NOT_FOUND = "Central directory header not found";
	const ERR_LOCAL_FILE_HEADER_NOT_FOUND = "Local file header not found";
	const ERR_EXTRAFIELD_ZIP64_NOT_FOUND = "Zip64 extra field not found";
	const ERR_ENCRYPTED = "File contains encrypted entry";
	const ERR_UNSUPPORTED_ENCRYPTION = "Encryption method not supported";
	const ERR_SPLIT_ZIP_FILE = "Split zip file";
	const ERR_OVERLAPPING_ENTRY = "Overlapping entry found";
	const ERR_ENTRY_DATA_OUT_OF_BOUNDS = "Entry data out of bounds";
	const ERR_AMBIGUOUS_ARCHIVE = "Ambiguous archive";
	const ERR_ENCRYPTED_CENTRAL_DIRECTORY = "Encrypted central directory is not supported";
	const ERR_UNSAFE_FILENAME = "Unsafe filename";
	const ERR_INVALID_STRICTNESS = "Invalid strictness (must be 'strict', 'balanced' or 'tolerant')";
	const ERR_INVALID_FILENAME_VALIDATION = "Invalid filenameValidation (must be 'strict', 'balanced' or 'tolerant')";
	const ERR_INVALID_MAX_APPENDED_DATA_SIZE = "Invalid maxAppendedDataSize (must be a number greater than or equal to 0)";
	const ERR_UNSUPPORTED_UINT64 = "64-bit value exceeds Number.MAX_SAFE_INTEGER";
	const WARNING_UNSORTED_CENTRAL_DIRECTORY = "unsorted central directory";
	const WARNING_UNKNOWN_VERSION = "unknown version needed to extract";
	const WARNING_COMPRESSED_PATCHED_DATA = "compressed patched data";
	const WARNING_MALFORMED_EXTRA_FIELD = "malformed extra field";
	const WARNING_UNKNOWN_ZIP64_EXTENSIBLE_DATA = "unknown zip64 extensible data";
	const WARNING_WRAPPED_ENTRIES_COUNT = "wrapped entries count";
	const WARNING_APPENDED_DATA = "appended data";
	const WARNING_PREPENDED_DATA = "prepended data";
	const WARNING_PREPENDED_CENTRAL_DIRECTORY = "prepended central directory";
	const WARNING_TRAILING_CENTRAL_DIRECTORY_DATA = "trailing central directory data";
	const WARNING_DUPLICATE_FILENAME = "duplicate filename";
	const WARNING_MISMATCHED_ZIP64_END_OF_CENTRAL_DIRECTORY = "mismatched zip64 end of central directory record";
	const WARNING_MISMATCHED_LOCAL_FILE_HEADER_BIT_FLAG = "mismatched local file header (general purpose bit flag)";
	const WARNING_MISMATCHED_LOCAL_FILE_HEADER_COMPRESSION_METHOD = "mismatched local file header (compression method)";
	const WARNING_MISMATCHED_LOCAL_FILE_HEADER_CRC32_OR_SIZES = "mismatched local file header (crc32 or sizes)";
	const MAX_KNOWN_VERSION = 63;
	const DRIVE_LETTER_REGEXP = /^[a-zA-Z]:/;
	const CHARSET_UTF8 = "utf-8";
	const PROPERTY_NAME_UTF8_SUFFIX = "UTF8";
	const CHARSET_CP437 = "cp437";
	const BITFLAG_AMBIGUITY_MASK = BITFLAG_ENCRYPTED | BITFLAG_DATA_DESCRIPTOR | BITFLAG_LANG_ENCODING_FLAG;
	const VENDOR_VERSION_AE_1 = 1;
	const ZIP64_PROPERTIES = [
		[PROPERTY_NAME_UNCOMPRESSED_SIZE, MAX_32_BITS],
		[PROPERTY_NAME_COMPRESSED_SIZE, MAX_32_BITS],
		[PROPERTY_NAME_OFFSET, MAX_32_BITS],
		[PROPERTY_NAME_DISK_NUMBER_START, MAX_16_BITS]
	];
	const ZIP64_EXTRACTION = {
		[MAX_16_BITS]: {
			getValue: getUint32,
			bytes: 4
		},
		[MAX_32_BITS]: {
			getValue: getBigUint64,
			bytes: 8
		}
	};
	const MAX_SAFE_UINT64 = BigInt(Number.MAX_SAFE_INTEGER);
	const MAX_END_OF_CENTRAL_DIR_PROBES = 64;
	const MAX_DEFLATE_EXPANSION_RATIO = 1032;
	const CENTRAL_DIRECTORY_UNREACHABLE = 0;
	const CENTRAL_DIRECTORY_PLAUSIBLE = 1;
	const CENTRAL_DIRECTORY_REACHABLE = 2;

	class ZipReader {

		constructor(reader, options = {}) {
			Object.assign(this, {
				reader: new GenericReader(reader),
				options,
				readRanges: new Map()
			});
		}

		async* getEntriesGenerator(options = {}) {
			const zipReader = this;
			let { reader } = zipReader;
			await initStream(reader);
			if (reader.size === UNDEFINED_VALUE || !reader.readUint8Array) {
				reader = new BlobReader(await streamToBlob(reader.readable));
				await initStream(reader);
			}
			if (reader.size < END_OF_CENTRAL_DIR_LENGTH) {
				throw new Error(ERR_BAD_FORMAT);
			}
			const warnings = zipReader.warnings = [];
			const strictness = getStrictness(options, zipReader.options);
			const checkAmbiguity = strictness == STRICTNESS_STRICT;
			const rejectAmbiguousEndOfDirectory = strictness != STRICTNESS_TOLERANT;
			const maxAppendedDataSize = getMaxAppendedDataSize(getOptionValue(zipReader, options, OPTION_MAX_APPENDED_DATA_SIZE), strictness);
			const filenameValidation = getFilenameValidation(getOptionValue(zipReader, options, OPTION_FILENAME_VALIDATION), strictness);
			const normalizeFilename = getOptionValue(zipReader, options, OPTION_NORMALIZE_FILENAME);
			const { endOfDirectoryInfo, endOfDirectoryReachingEndCount } = await findEndOfCentralDirectory(reader, rejectAmbiguousEndOfDirectory, maxAppendedDataSize);
			if (!endOfDirectoryInfo) {
				if (await startsWithSplitZipSignature(reader)) {
					throw new Error(ERR_SPLIT_ZIP_FILE);
				} else {
					throw new Error(ERR_EOCDR_NOT_FOUND);
				}
			}
			if (rejectAmbiguousEndOfDirectory && endOfDirectoryReachingEndCount > 1) {
				throwAmbiguousArchive("multiple end of central directory records");
			}
			const endOfDirectoryView = getDataView(endOfDirectoryInfo);
			let directoryDataLength = getUint32(endOfDirectoryView, 12);
			let directoryDataOffset = getUint32(endOfDirectoryView, 16);
			const commentOffset = endOfDirectoryInfo.offset;
			const commentLength = getUint16(endOfDirectoryView, 20);
			const appendedDataOffset = commentOffset + END_OF_CENTRAL_DIR_LENGTH + commentLength;
			const appendedDataLength = reader.size - appendedDataOffset;
			if (appendedDataLength > maxAppendedDataSize) {
				throwAmbiguousArchive(WARNING_APPENDED_DATA);
			}
			if (appendedDataLength > 0) {
				addWarning(warnings, WARNING_APPENDED_DATA);
			}
			let lastDiskNumber = getUint16(endOfDirectoryView, 4);
			const expectedLastDiskNumber = reader.lastDiskNumber || 0;
			let diskNumber = getUint16(endOfDirectoryView, 6);
			let filesLength = getUint16(endOfDirectoryView, 10);
			let prependedDataLength = 0;
			let prependedCentralDirectory;
			let startOffset;
			let zip64EndOfDirectory;
			let zip64EndOfDirectoryVersion2;
			let zip64EndOfDirectoryLength = ZIP64_END_OF_CENTRAL_DIR_LENGTH;
			let directoryEncryptionInfo;
			const requiresZip64 = directoryDataOffset == MAX_32_BITS || directoryDataLength == MAX_32_BITS || filesLength == MAX_16_BITS || diskNumber == MAX_16_BITS;
			if (directoryDataOffset != MAX_32_BITS && diskNumber != MAX_16_BITS) {
				directoryDataOffset += getDiskOffset(reader, diskNumber);
			}
			if (requiresZip64) {
				const endOfDirectoryLocatorArray = endOfDirectoryInfo.offset >= ZIP64_END_OF_CENTRAL_DIR_LOCATOR_LENGTH ?
					await readUint8Array(reader, endOfDirectoryInfo.offset - ZIP64_END_OF_CENTRAL_DIR_LOCATOR_LENGTH, ZIP64_END_OF_CENTRAL_DIR_LOCATOR_LENGTH) :
					EMPTY_UINT8_ARRAY;
				const endOfDirectoryLocatorView = getDataView(endOfDirectoryLocatorArray);
				if (endOfDirectoryLocatorArray.length == ZIP64_END_OF_CENTRAL_DIR_LOCATOR_LENGTH &&
					getUint32(endOfDirectoryLocatorView, 0) == ZIP64_END_OF_CENTRAL_DIR_LOCATOR_SIGNATURE) {
					directoryDataOffset = getDiskOffset(reader, getUint32(endOfDirectoryLocatorView, 4)) + getBigUint64(endOfDirectoryLocatorView, 8);
					let endOfDirectoryArray = await readUint8Array(reader, directoryDataOffset, ZIP64_END_OF_CENTRAL_DIR_LENGTH);
					let endOfDirectoryView = getDataView(endOfDirectoryArray);
					const expectedDirectoryDataOffset = endOfDirectoryInfo.offset - ZIP64_END_OF_CENTRAL_DIR_LOCATOR_LENGTH - ZIP64_END_OF_CENTRAL_DIR_LENGTH;
					if ((endOfDirectoryArray.length < ZIP64_END_OF_CENTRAL_DIR_LENGTH || getUint32(endOfDirectoryView, 0) != ZIP64_END_OF_CENTRAL_DIR_SIGNATURE) &&
						directoryDataOffset != expectedDirectoryDataOffset && expectedDirectoryDataOffset >= 0) {
						const originalDirectoryDataOffset = directoryDataOffset;
						directoryDataOffset = expectedDirectoryDataOffset;
						if (directoryDataOffset > originalDirectoryDataOffset) {
							prependedDataLength = directoryDataOffset - originalDirectoryDataOffset;
						}
						endOfDirectoryArray = await readUint8Array(reader, directoryDataOffset, ZIP64_END_OF_CENTRAL_DIR_LENGTH);
						endOfDirectoryView = getDataView(endOfDirectoryArray);
					}
					if (endOfDirectoryArray.length < ZIP64_END_OF_CENTRAL_DIR_LENGTH || getUint32(endOfDirectoryView, 0) != ZIP64_END_OF_CENTRAL_DIR_SIGNATURE) {
						throw new Error(ERR_EOCDR_LOCATOR_ZIP64_NOT_FOUND);
					}
					zip64EndOfDirectory = true;
					zip64EndOfDirectoryVersion2 = getBigUint64(endOfDirectoryView, 4) > ZIP64_END_OF_CENTRAL_DIR_LENGTH - 12;
					if (zip64EndOfDirectoryVersion2) {
						const extensibleDataLength = Math.min(
							getBigUint64(endOfDirectoryView, 4) - (ZIP64_END_OF_CENTRAL_DIR_LENGTH - 12),
							reader.size - directoryDataOffset - ZIP64_END_OF_CENTRAL_DIR_LENGTH);
						if (extensibleDataLength > 0) {
							zip64EndOfDirectoryLength += extensibleDataLength;
							const rawExtensibleData = await readUint8Array(reader, directoryDataOffset + ZIP64_END_OF_CENTRAL_DIR_LENGTH, extensibleDataLength);
							directoryEncryptionInfo = getDirectoryEncryptionInfo(rawExtensibleData);
						}
					}
					if (lastDiskNumber == MAX_16_BITS) {
						lastDiskNumber = getUint32(endOfDirectoryView, 16);
					} else if (lastDiskNumber != getUint32(endOfDirectoryView, 16)) {
						reportAmbiguity(checkAmbiguity, warnings, WARNING_MISMATCHED_ZIP64_END_OF_CENTRAL_DIRECTORY);
					}
					if (diskNumber == MAX_16_BITS) {
						diskNumber = getUint32(endOfDirectoryView, 20);
					} else if (diskNumber != getUint32(endOfDirectoryView, 20)) {
						reportAmbiguity(checkAmbiguity, warnings, WARNING_MISMATCHED_ZIP64_END_OF_CENTRAL_DIRECTORY);
					}
					if (filesLength == MAX_16_BITS) {
						filesLength = getBigUint64(endOfDirectoryView, 32);
					} else if (filesLength != getBigUint64(endOfDirectoryView, 32)) {
						reportAmbiguity(checkAmbiguity, warnings, WARNING_MISMATCHED_ZIP64_END_OF_CENTRAL_DIRECTORY);
					}
					if (directoryDataLength == MAX_32_BITS) {
						directoryDataLength = getBigUint64(endOfDirectoryView, 40);
					} else if (directoryDataLength != getBigUint64(endOfDirectoryView, 40)) {
						reportAmbiguity(checkAmbiguity, warnings, WARNING_MISMATCHED_ZIP64_END_OF_CENTRAL_DIRECTORY);
					}
					directoryDataOffset = getDiskOffset(reader, diskNumber) + getBigUint64(endOfDirectoryView, 48) + prependedDataLength;
				}
			}
			let declaredDirectoryDataLength = directoryDataLength;
			const centralDirectoryEndOffset = endOfDirectoryInfo.offset -
				(zip64EndOfDirectory ? zip64EndOfDirectoryLength + ZIP64_END_OF_CENTRAL_DIR_LOCATOR_LENGTH : 0);
			if (directoryDataOffset >= reader.size) {
				prependedDataLength = reader.size - directoryDataOffset - directoryDataLength - END_OF_CENTRAL_DIR_LENGTH;
				directoryDataOffset = reader.size - directoryDataLength - END_OF_CENTRAL_DIR_LENGTH;
			}
			if (expectedLastDiskNumber != lastDiskNumber) {
				throw new Error(ERR_SPLIT_ZIP_FILE);
			}
			if (directoryDataOffset < 0) {
				throw new Error(ERR_BAD_FORMAT);
			}
			let offset = 0;
			let directoryArray = await readUint8Array(reader, directoryDataOffset, directoryDataLength);
			let directoryView = getDataView(directoryArray);
			if (directoryDataLength) {
				if (directoryArray.length < 4) {
					throw new Error(ERR_BAD_FORMAT);
				}
				const expectedDirectoryDataOffset = centralDirectoryEndOffset - directoryDataLength;
				if (directoryDataOffset != expectedDirectoryDataOffset && diskNumber == lastDiskNumber) {
					const storedPointsAtDirectory = getUint32(directoryView, offset) == CENTRAL_FILE_HEADER_SIGNATURE ||
						Boolean(directoryEncryptionInfo && directoryEncryptionInfo.compressedSize) ||
						detectEncryptedCentralDirectory(directoryView);
					let reconcile = !storedPointsAtDirectory;
					if (!reconcile && expectedDirectoryDataOffset >= 0 && expectedDirectoryDataOffset + 4 <= reader.size) {
						const expectedSignatureArray = await readUint8Array(reader, expectedDirectoryDataOffset, 4);
						reconcile = getUint32(getDataView(expectedSignatureArray), 0) == CENTRAL_FILE_HEADER_SIGNATURE;
					}
					if (reconcile) {
						const originalDirectoryDataOffset = directoryDataOffset;
						directoryDataOffset = expectedDirectoryDataOffset;
						if (directoryDataOffset > originalDirectoryDataOffset) {
							prependedDataLength += directoryDataOffset - originalDirectoryDataOffset;
							prependedCentralDirectory = storedPointsAtDirectory;
						}
						directoryArray = await readUint8Array(reader, directoryDataOffset, directoryDataLength);
						directoryView = getDataView(directoryArray);
					}
				}
			}
			const expectedDirectoryDataLength = centralDirectoryEndOffset - directoryDataOffset;
			if (directoryDataLength != expectedDirectoryDataLength && expectedDirectoryDataLength >= 0 && diskNumber == lastDiskNumber) {
				directoryDataLength = expectedDirectoryDataLength;
				directoryArray = await readUint8Array(reader, directoryDataOffset, directoryDataLength);
				directoryView = getDataView(directoryArray);
			}
			if (directoryDataOffset < 0 || directoryDataOffset >= reader.size) {
				throw new Error(ERR_BAD_FORMAT);
			}
			zipReader.directoryOffset = directoryDataOffset;
			zipReader.directoryLength = declaredDirectoryDataLength;
			const decryptCentralDirectory = getFunctionOptionValue(zipReader, options, OPTION_DECRYPT_CENTRAL_DIRECTORY);
			let decryptedDirectory, dataAfterEncryptedDirectory;
			if (decryptCentralDirectory && filesLength && directoryArray.length >= 4 &&
				getUint32(directoryView, 0) != CENTRAL_FILE_HEADER_SIGNATURE &&
				(zip64EndOfDirectoryVersion2 || detectEncryptedCentralDirectory(directoryView))) {
				const encryptedDirectoryDataLength = getEncryptedDirectoryDataLength(directoryEncryptionInfo, declaredDirectoryDataLength, directoryArray.length);
				dataAfterEncryptedDirectory = directoryArray.subarray(encryptedDirectoryDataLength);
				directoryArray = await decryptCentralDirectory(directoryArray.subarray(0, encryptedDirectoryDataLength), directoryEncryptionInfo);
				directoryView = getDataView(directoryArray);
				declaredDirectoryDataLength = directoryArray.length;
				decryptedDirectory = true;
			}
			if (directoryEncryptionInfo && !decryptedDirectory &&
				(directoryArray.length < 4 || getUint32(directoryView, 0) == CENTRAL_FILE_HEADER_SIGNATURE)) {
				addWarning(warnings, WARNING_UNKNOWN_ZIP64_EXTENSIBLE_DATA);
			}
			startOffset = directoryDataOffset;
			const filenameEncoding = getOptionValue(zipReader, options, OPTION_FILENAME_ENCODING);
			const commentEncoding = getOptionValue(zipReader, options, OPTION_COMMENT_ENCODING);
			const filenames = new Set();
			let duplicateFilename;
			let previousEntryPosition = -1;
			const recoverWrappedFilesLength = !checkAmbiguity && !zip64EndOfDirectory;
			if (!filesLength && recoverWrappedFilesLength) {
				filesLength = getWrappedFilesLength(directoryView, directoryArray, offset);
				if (filesLength) {
					addWarning(warnings, WARNING_WRAPPED_ENTRIES_COUNT);
				}
			}
			for (let indexFile = 0; indexFile < filesLength; indexFile++) {
				const fileEntry = new ZipEntry(reader, zipReader.options);
				if (offset + CENTRAL_FILE_HEADER_LENGTH > directoryArray.length || getUint32(directoryView, offset) != CENTRAL_FILE_HEADER_SIGNATURE) {
					if (indexFile == 0 && !decryptedDirectory && (zip64EndOfDirectoryVersion2 || detectEncryptedCentralDirectory(directoryView))) {
						throw new Error(ERR_ENCRYPTED_CENTRAL_DIRECTORY);
					}
					throw new Error(ERR_CENTRAL_DIRECTORY_NOT_FOUND);
				}
				readCommonHeader(fileEntry, directoryView, offset + 6);
				const languageEncodingFlag = Boolean(fileEntry.bitFlag.languageEncodingFlag);
				const filenameOffset = offset + CENTRAL_FILE_HEADER_LENGTH;
				const extraFieldOffset = filenameOffset + fileEntry.filenameLength;
				const commentOffset = extraFieldOffset + fileEntry.extraFieldLength;
				const versionMadeBy = getUint16(directoryView, offset + 4);
				const msDosCompatible = versionMadeBy >> 8 == 0;
				const unixCompatible = versionMadeBy >> 8 == 3;
				const rawFilename = directoryArray.subarray(filenameOffset, extraFieldOffset);
				const commentLength = getUint16(directoryView, offset + 32);
				const endOffset = commentOffset + commentLength;
				const rawComment = directoryArray.subarray(commentOffset, endOffset);
				const filenameUTF8 = languageEncodingFlag;
				const commentUTF8 = languageEncodingFlag;
				const externalFileAttributes = getUint32(directoryView, offset + 38);
				const msdosAttributesRaw = externalFileAttributes & MAX_8_BITS;
				const msdosAttributes = {
					readOnly: Boolean(msdosAttributesRaw & FILE_ATTR_MSDOS_READONLY_MASK),
					hidden: Boolean(msdosAttributesRaw & FILE_ATTR_MSDOS_HIDDEN_MASK),
					system: Boolean(msdosAttributesRaw & FILE_ATTR_MSDOS_SYSTEM_MASK),
					directory: Boolean(msdosAttributesRaw & FILE_ATTR_MSDOS_DIR_MASK),
					archive: Boolean(msdosAttributesRaw & FILE_ATTR_MSDOS_ARCHIVE_MASK)
				};
				const offsetFileEntry = getUint32(directoryView, offset + 42);
				const decode = getFunctionOptionValue(zipReader, options, OPTION_DECODE_TEXT) || decodeText;
				const rawFilenameEncoding = filenameUTF8 ? CHARSET_UTF8 : filenameEncoding || CHARSET_CP437;
				const rawCommentEncoding = commentUTF8 ? CHARSET_UTF8 : commentEncoding || CHARSET_CP437;
				let filename = decode(rawFilename, rawFilenameEncoding, TEXT_TYPE_FILENAME);
				if (filename === UNDEFINED_VALUE) {
					filename = decodeText(rawFilename, rawFilenameEncoding);
				}
				if (normalizeFilename) {
					const normalizedFilename = normalizeFilename(filename);
					if (normalizedFilename !== UNDEFINED_VALUE) {
						filename = normalizedFilename;
					}
				}
				if (isUnsafeFilename(filename, filenameValidation)) {
					const error = new Error(ERR_UNSAFE_FILENAME);
					error.filename = filename;
					throw error;
				}
				let comment = decode(rawComment, rawCommentEncoding, TEXT_TYPE_COMMENT);
				if (comment === UNDEFINED_VALUE) {
					comment = decodeText(rawComment, rawCommentEncoding);
				}
				Object.assign(fileEntry, {
					index: indexFile,
					decryptedDirectory,
					versionMadeBy,
					msDosCompatible,
					zip64: false,
					compressedSize: 0,
					uncompressedSize: 0,
					commentLength,
					offset: offsetFileEntry,
					diskNumberStart: getUint16(directoryView, offset + 34),
					internalFileAttributes: getUint16(directoryView, offset + 36),
					externalFileAttributes,
					msdosAttributesRaw,
					msdosAttributes,
					rawFilename,
					filenameUTF8,
					commentUTF8,
					rawExtraField: directoryArray.subarray(extraFieldOffset, commentOffset),
					rawComment,
					filename,
					comment
				});
				if (readCommonFooter(fileEntry, fileEntry, directoryView, offset + 6)) {
					addWarning(warnings, WARNING_MALFORMED_EXTRA_FIELD, filename);
				}
				fileEntry.offset += prependedDataLength;
				const entryPosition = getDiskOffset(reader, fileEntry.diskNumberStart) + fileEntry.offset;
				startOffset = Math.min(entryPosition, startOffset);
				if (entryPosition < previousEntryPosition) {
					addWarning(warnings, WARNING_UNSORTED_CENTRAL_DIRECTORY, filename);
				}
				previousEntryPosition = entryPosition;
				if ((fileEntry.version & MAX_8_BITS) > MAX_KNOWN_VERSION) {
					addWarning(warnings, WARNING_UNKNOWN_VERSION, filename);
				}
				if ((fileEntry.rawBitFlag & BITFLAG_COMPRESSED_PATCHED_DATA) == BITFLAG_COMPRESSED_PATCHED_DATA) {
					addWarning(warnings, WARNING_COMPRESSED_PATCHED_DATA, filename);
				}
				if (filenames.has(fileEntry.filename)) {
					duplicateFilename = true;
				}
				filenames.add(fileEntry.filename);
				const unixExternalUpper = (fileEntry.externalFileAttributes >> 16) & MAX_16_BITS;
				if (fileEntry.unixMode === UNDEFINED_VALUE && (unixExternalUpper & (FILE_ATTR_UNIX_DEFAULT_MASK | FILE_ATTR_UNIX_EXECUTABLE_MASK | FILE_ATTR_UNIX_TYPE_DIR)) != 0) {
					fileEntry.unixMode = unixExternalUpper;
				}
				const setuid = Boolean(fileEntry.unixMode & FILE_ATTR_UNIX_SETUID_MASK);
				const setgid = Boolean(fileEntry.unixMode & FILE_ATTR_UNIX_SETGID_MASK);
				const sticky = Boolean(fileEntry.unixMode & FILE_ATTR_UNIX_STICKY_MASK);
				const unixType = fileEntry.unixMode === UNDEFINED_VALUE ? unixExternalUpper : fileEntry.unixMode;
				const symlink = (unixType & FILE_ATTR_UNIX_TYPE_MASK) == FILE_ATTR_UNIX_TYPE_SYMLINK;
				const executable = !symlink && ((fileEntry.unixMode !== UNDEFINED_VALUE)
					? ((fileEntry.unixMode & FILE_ATTR_UNIX_EXECUTABLE_MASK) != 0)
					: (unixCompatible && ((unixExternalUpper & FILE_ATTR_UNIX_EXECUTABLE_MASK) != 0)));
				const modeIsDir = fileEntry.unixMode !== UNDEFINED_VALUE && ((fileEntry.unixMode & FILE_ATTR_UNIX_TYPE_MASK) == FILE_ATTR_UNIX_TYPE_DIR);
				const upperIsDir = ((unixExternalUpper & FILE_ATTR_UNIX_TYPE_MASK) == FILE_ATTR_UNIX_TYPE_DIR);
				Object.assign(fileEntry, {
					setuid,
					setgid,
					sticky,
					symlink,
					unixExternalUpper,
					executable,
					directory: modeIsDir || upperIsDir || (msDosCompatible && msdosAttributes.directory) || fileEntry.filename.endsWith(DIRECTORY_SIGNATURE),
					zipCrypto: fileEntry.encrypted && !fileEntry.extraFieldAES
				});
				const entry = new Entry(fileEntry);
				entry.getData = (writer, options) => fileEntry.getData(writer, entry, zipReader.readRanges, options);
				entry.arrayBuffer = async options => {
					const writer = new TransformStream();
					const arrayBufferPromise = streamToBlob(writer.readable).then(blob => blob.arrayBuffer());
					arrayBufferPromise.catch(() => { });
					await fileEntry.getData(writer, entry, zipReader.readRanges, options);
					return arrayBufferPromise;
				};
				offset = endOffset;
				if (indexFile == filesLength - 1 && recoverWrappedFilesLength) {
					const wrappedFilesLength = getWrappedFilesLength(directoryView, directoryArray, offset);
					if (wrappedFilesLength) {
						filesLength += wrappedFilesLength;
						addWarning(warnings, WARNING_WRAPPED_ENTRIES_COUNT);
					}
				}
				const { onprogress } = options;
				if (onprogress) {
					try {
						await onprogress(indexFile + 1, filesLength, new Entry(fileEntry));
					} catch {
						// ignored
					}
				}
				yield entry;
			}
			let offsetAfterSignature = offset;
			let digitalSignature = readDigitalSignature(directoryArray.subarray(offset)) ||
				(decryptedDirectory ? readDigitalSignature(dataAfterEncryptedDirectory) : UNDEFINED_VALUE);
			if (!digitalSignature && !decryptedDirectory) {
				const signatureRecordOffset = directoryDataOffset + offset;
				const signatureRecordLength = Math.min(centralDirectoryEndOffset - signatureRecordOffset, 6 + MAX_16_BITS);
				if (signatureRecordLength >= 6) {
					digitalSignature = readDigitalSignature(await readUint8Array(reader, signatureRecordOffset, signatureRecordLength));
				}
			}
			if (digitalSignature) {
				zipReader.digitalSignature = digitalSignature;
				offsetAfterSignature = offset + 6 + digitalSignature.length;
			}
			if ((offset != declaredDirectoryDataLength && offsetAfterSignature != declaredDirectoryDataLength) ||
				(!decryptedDirectory && offset != directoryDataLength && offsetAfterSignature != directoryDataLength)) {
				reportAmbiguity(checkAmbiguity, warnings, WARNING_TRAILING_CENTRAL_DIRECTORY_DATA);
			}
			if (duplicateFilename) {
				reportAmbiguity(checkAmbiguity, warnings, WARNING_DUPLICATE_FILENAME);
			}
			const extractPrependedData = getOptionValue(zipReader, options, OPTION_EXTRACT_PREPENDED_DATA);
			const extractAppendedData = getOptionValue(zipReader, options, OPTION_EXTRACT_APPENDED_DATA);
			const splitZipSignatureLength = (checkAmbiguity || extractPrependedData) && filesLength &&
				startOffset == SPLIT_ZIP_FILE_SIGNATURE_LENGTH && await startsWithSplitZipMarker(reader) ? SPLIT_ZIP_FILE_SIGNATURE_LENGTH : 0;
			if (checkAmbiguity && (prependedDataLength || (filesLength && startOffset > splitZipSignatureLength))) {
				throwAmbiguousArchive(WARNING_PREPENDED_DATA);
			}
			if (prependedDataLength || (filesLength && startOffset > SPLIT_ZIP_FILE_SIGNATURE_LENGTH)) {
				addWarning(warnings, WARNING_PREPENDED_DATA);
			}
			if (prependedCentralDirectory) {
				addWarning(warnings, WARNING_PREPENDED_CENTRAL_DIRECTORY);
			}
			if (extractPrependedData) {
				zipReader.prependedData = startOffset > splitZipSignatureLength ?
					await readUint8Array(reader, splitZipSignatureLength, startOffset - splitZipSignatureLength) :
					EMPTY_UINT8_ARRAY;
			}
			zipReader.comment = commentLength ? await readUint8Array(reader, commentOffset + END_OF_CENTRAL_DIR_LENGTH, commentLength) : EMPTY_UINT8_ARRAY;
			if (extractAppendedData) {
				zipReader.appendedData = appendedDataOffset < reader.size ? await readUint8Array(reader, appendedDataOffset, reader.size - appendedDataOffset) : EMPTY_UINT8_ARRAY;
			}
			return true;
		}

		async getEntries(options = {}) {
			const entries = [];
			for await (const entry of this.getEntriesGenerator(options)) {
				entries.push(entry);
			}
			return entries;
		}

		async close() {
			const { reader } = this;
			if (!reader.readUint8Array && reader.readable && !reader.readable.locked) {
				await reader.readable.cancel();
			}
		}
	}

	class ZipEntry {

		constructor(reader, options) {
			Object.assign(this, {
				reader,
				options
			});
		}

		async getData(writer, fileEntry, readRanges, options = {}) {
			const zipEntry = this;
			const config = getConfiguration();
			const {
				reader,
				index,
				offset,
				diskNumberStart,
				extraFieldAES,
				extraFieldZip64,
				compressionMethod,
				bitFlag,
				rawBitFlag,
				crc32,
				rawLastModDate,
				uncompressedSize,
				compressedSize
			} = zipEntry;
			const {
				dataDescriptor
			} = bitFlag;
			const localDirectory = fileEntry.localDirectory = {};
			const warnings = fileEntry.warnings = [];
			const localHeaderOffset = getDiskOffset(reader, diskNumberStart) + offset;
			const dataArray = await readUint8Array(reader, localHeaderOffset, HEADER_SIZE);
			const dataView = getDataView(dataArray);
			let password = getOptionValue(zipEntry, options, OPTION_PASSWORD);
			let rawPassword = getOptionValue(zipEntry, options, OPTION_RAW_PASSWORD);
			const passThrough = getOptionValue(zipEntry, options, OPTION_PASS_THROUGH);
			checkPasswordOption(password, rawPassword);
			password = password && password.length && password;
			rawPassword = rawPassword && rawPassword.length && rawPassword;
			if (extraFieldAES) {
				if (extraFieldAES.originalCompressionMethod != COMPRESSION_METHOD_AES) {
					throw new Error(ERR_UNSUPPORTED_COMPRESSION);
				}
			}
			if (dataArray.length < HEADER_SIZE || getUint32(dataView, 0) != LOCAL_FILE_HEADER_SIGNATURE) {
				throw new Error(ERR_LOCAL_FILE_HEADER_NOT_FOUND);
			}
			readCommonHeader(localDirectory, dataView, 4);
			const {
				extraFieldLength,
				filenameLength
			} = localDirectory;
			const dataOffset = localDirectory.dataOffset = localHeaderOffset + HEADER_SIZE + filenameLength + extraFieldLength;
			const checkLocalDirectoryOption = getOptionValue(zipEntry, options, OPTION_CHECK_LOCAL_DIRECTORY);
			const entryStrictness = getStrictness(options, zipEntry.options);
			const checkLocalDirectory = getCheckLocalDirectory(checkLocalDirectoryOption, entryStrictness);
			const checkLocalFilename = getCheckLocalFilename(checkLocalDirectoryOption, entryStrictness);
			let rawLocalFilename = EMPTY_UINT8_ARRAY;
			if (checkLocalFilename && (filenameLength || extraFieldLength)) {
				const trailingDataArray = await readUint8Array(reader, localHeaderOffset + HEADER_SIZE, filenameLength + extraFieldLength);
				rawLocalFilename = trailingDataArray.subarray(0, filenameLength);
				localDirectory.rawExtraField = trailingDataArray.subarray(filenameLength);
			} else {
				localDirectory.rawExtraField = extraFieldLength ?
					await readUint8Array(reader, localHeaderOffset + HEADER_SIZE + filenameLength, extraFieldLength) :
					EMPTY_UINT8_ARRAY;
			}
			if (checkLocalFilename) {
				localDirectory.rawFilename = rawLocalFilename;
			}
			if (readCommonFooter(zipEntry, localDirectory, dataView, 4, true)) {
				addWarning(warnings, WARNING_MALFORMED_EXTRA_FIELD);
			}
			validateLocalDirectory(zipEntry, localDirectory, rawLocalFilename, checkLocalFilename, checkLocalDirectory ? UNDEFINED_VALUE : warnings);
			const { lastAccessDate, creationDate, uid, gid } = localDirectory;
			if (lastAccessDate) {
				fileEntry.lastAccessDate = lastAccessDate;
			}
			if (creationDate) {
				fileEntry.creationDate = creationDate;
			}
			if (uid !== UNDEFINED_VALUE && fileEntry.uid === UNDEFINED_VALUE) {
				fileEntry.uid = uid;
			}
			if (gid !== UNDEFINED_VALUE && fileEntry.gid === UNDEFINED_VALUE) {
				fileEntry.gid = gid;
			}
			const encrypted = zipEntry.encrypted && localDirectory.encrypted && !passThrough;
			const zipCrypto = encrypted && !extraFieldAES;
			if (!passThrough) {
				fileEntry.zipCrypto = zipCrypto;
			}
			if (encrypted && (localDirectory.rawBitFlag & BITFLAG_STRONG_ENCRYPTION) == BITFLAG_STRONG_ENCRYPTION) {
				throw new Error(ERR_UNSUPPORTED_ENCRYPTION);
			}
			const registeredCodec = passThrough ? UNDEFINED_VALUE : getRegisteredCodec(compressionMethod);
			if (compressionMethod != COMPRESSION_METHOD_STORE && compressionMethod != COMPRESSION_METHOD_DEFLATE && compressionMethod != COMPRESSION_METHOD_DEFLATE_64 && !registeredCodec && !passThrough) {
				throw new Error(ERR_UNSUPPORTED_COMPRESSION);
			}
			if (encrypted) {
				if (!zipCrypto && (extraFieldAES.strength < 1 || extraFieldAES.strength > 3)) {
					throw new Error(ERR_UNSUPPORTED_ENCRYPTION);
				} else if (!password && !rawPassword) {
					throw new Error(ERR_ENCRYPTED);
				}
			}
			if (dataOffset + compressedSize > reader.size) {
				throw new Error(ERR_ENTRY_DATA_OUT_OF_BOUNDS);
			}
			const size = compressedSize;
			const readable = toCompatibleReadable(reader.createReadable({ offset: dataOffset, size }));
			const signal = checkSignalOption(getOptionValue(zipEntry, options, OPTION_SIGNAL));
			const checkPasswordOnly = getOptionValue(zipEntry, options, OPTION_CHECK_PASSWORD_ONLY);
			let checkOverlappingEntry = getOptionValue(zipEntry, options, OPTION_CHECK_OVERLAPPING_ENTRY);
			const checkOverlappingEntryOnly = getOptionValue(zipEntry, options, OPTION_CHECK_OVERLAPPING_ENTRY_ONLY);
			if (checkOverlappingEntryOnly) {
				checkOverlappingEntry = true;
			}
			const { onstart, onprogress, onend } = options;
			const compressed = compressionMethod != COMPRESSION_METHOD_STORE && !passThrough;
			const outputSize = passThrough ? compressedSize : uncompressedSize;
			const deflate64 = compressionMethod == COMPRESSION_METHOD_DEFLATE_64;
			let useCompressionStream = getOptionValue(zipEntry, options, OPTION_USE_COMPRESSION_STREAM);
			if (deflate64) {
				useCompressionStream = false;
			}
			const checkCrc32Option = getOptionValue(zipEntry, options, OPTION_CHECK_CRC32);
			const checkCrc32 = (checkCrc32Option === UNDEFINED_VALUE ?
				getOptionValue(zipEntry, options, OPTION_CHECK_SIGNATURE) :
				checkCrc32Option) && !passThrough &&
				(!encrypted || zipCrypto || (extraFieldAES && extraFieldAES.vendorVersion == VENDOR_VERSION_AE_1));
			const workerOptions = {
				options: {
					codecType: CODEC_INFLATE,
					password,
					rawPassword,
					zipCrypto,
					encryptionStrength: extraFieldAES && extraFieldAES.strength,
					checkCrc32,
					checkAuthenticationCode: getOptionValue(zipEntry, options, OPTION_CHECK_AUTHENTICATION_CODE),
					passwordVerification: zipCrypto && (dataDescriptor ? ((rawLastModDate >>> 8) & MAX_8_BITS) : ((crc32 >>> 24) & MAX_8_BITS)),
					outputSize,
					crc32,
					compressed,
					encrypted,
					useWebWorkers: getOptionValue(zipEntry, options, OPTION_USE_WEB_WORKERS),
					useCompressionStream,
					transferStreams: getOptionValue(zipEntry, options, OPTION_TRANSFER_STREAMS),
					deflate64,
					format: registeredCodec ? registeredCodec.format : UNDEFINED_VALUE,
					codecURI: registeredCodec ? registeredCodec.codecURI : UNDEFINED_VALUE,
					compressionMethod,
					rawBitFlag,
					checkPasswordOnly
				},
				config,
				streamOptions: { signal, size, onstart, onprogress, onend }
			};
			if (checkOverlappingEntry) {
				await detectOverlappingEntry({
					reader,
					fileEntry,
					index,
					offset: localHeaderOffset,
					crc32,
					compressedSize,
					uncompressedSize,
					dataOffset,
					dataDescriptor: dataDescriptor || localDirectory.bitFlag.dataDescriptor,
					extraFieldZip64: extraFieldZip64 || localDirectory.extraFieldZip64,
					readRanges
				});
			}
			let writable, abortError;
			try {
				if (!checkOverlappingEntryOnly) {
					if (checkPasswordOnly) {
						writer = new WritableStream();
					}
					writer = new GenericWriter(writer);
					await initStream(writer, getDecodableOutputSize(outputSize, compressedSize, compressed));
					({ writable } = writer);
					const { outputSize: writtenSize } = await runWorker({ readable, writable }, workerOptions);
					writer.size += writtenSize;
					if (writtenSize != outputSize) {
						throw new Error(ERR_INVALID_UNCOMPRESSED_SIZE);
					}
				}
			} catch (error) {
				if (error.outputSize !== UNDEFINED_VALUE) {
					writer.size += error.outputSize;
				}
				if (!checkPasswordOnly || error.message != ERR_ABORT_CHECK_PASSWORD) {
					abortError = error;
					throw error;
				}
			} finally {
				const preventClose = !ownsWritable(writer) && getOptionValue(zipEntry, options, OPTION_PREVENT_CLOSE);
				if (!preventClose && writable && !writable.locked) {
					const writableWriter = writable.getWriter();
					if (abortError) {
						try {
							await writableWriter.abort(abortError);
						} catch {
							// the error being propagated is more relevant; ignored
						}
					} else {
						await writableWriter.close();
					}
				}
			}
			return checkPasswordOnly || checkOverlappingEntryOnly ? UNDEFINED_VALUE : writer.getData ? writer.getData() : writable;
		}
	}

	function detectEncryptedCentralDirectory(directoryView) {
		const maxOffset = Math.min(directoryView.byteLength, 1024) - 3;
		for (let offset = 0; offset < maxOffset; offset++) {
			if (getUint32(directoryView, offset) == ARCHIVE_EXTRA_DATA_SIGNATURE) {
				return true;
			}
		}
		return false;
	}

	function getWrappedFilesLength(directoryView, directoryArray, offset) {
		let wrappedFilesLength = 0;
		while (offset + CENTRAL_FILE_HEADER_LENGTH <= directoryArray.length && getUint32(directoryView, offset) == CENTRAL_FILE_HEADER_SIGNATURE) {
			offset += CENTRAL_FILE_HEADER_LENGTH +
				getUint16(directoryView, offset + 28) + getUint16(directoryView, offset + 30) + getUint16(directoryView, offset + 32);
			wrappedFilesLength++;
		}
		return wrappedFilesLength % (MAX_16_BITS + 1) ? 0 : wrappedFilesLength;
	}

	function readDigitalSignature(signatureRecordArray) {
		if (signatureRecordArray.length >= 6) {
			const signatureRecordView = getDataView(signatureRecordArray);
			if (getUint32(signatureRecordView, 0) == DIGITAL_SIGNATURE_RECORD_SIGNATURE) {
				const signatureDataLength = getUint16(signatureRecordView, 4);
				if (6 + signatureDataLength <= signatureRecordArray.length) {
					return signatureRecordArray.subarray(6, 6 + signatureDataLength);
				}
			}
		}
	}

	function getEncryptedDirectoryDataLength(directoryEncryptionInfo, declaredDirectoryDataLength, directoryDataLength) {
		const encryptedDirectoryDataLength = directoryEncryptionInfo && directoryEncryptionInfo.compressedSize ?
			directoryEncryptionInfo.compressedSize :
			declaredDirectoryDataLength;
		return encryptedDirectoryDataLength > 0 && encryptedDirectoryDataLength <= directoryDataLength ?
			encryptedDirectoryDataLength :
			directoryDataLength;
	}

	function getDirectoryEncryptionInfo(rawExtensibleData) {
		const directoryEncryptionInfo = { rawExtensibleData };
		if (rawExtensibleData.length >= 28) {
			const extensibleDataView = getDataView(rawExtensibleData);
			const hashDataLength = getUint16(extensibleDataView, 26);
			Object.assign(directoryEncryptionInfo, {
				compressionMethod: getUint16(extensibleDataView, 0),
				compressedSize: getBigUint64(extensibleDataView, 2),
				uncompressedSize: getBigUint64(extensibleDataView, 10),
				encryptionAlgorithm: getUint16(extensibleDataView, 18),
				bitLength: getUint16(extensibleDataView, 20),
				flags: getUint16(extensibleDataView, 22),
				hashAlgorithm: getUint16(extensibleDataView, 24),
				hashData: rawExtensibleData.subarray(28, 28 + hashDataLength)
			});
		}
		return directoryEncryptionInfo;
	}

	function readCommonHeader(directory, dataView, offset) {
		const rawBitFlag = directory.rawBitFlag = getUint16(dataView, offset + 2);
		const encrypted = (rawBitFlag & BITFLAG_ENCRYPTED) == BITFLAG_ENCRYPTED;
		const rawLastModDate = getUint32(dataView, offset + 6);
		Object.assign(directory, {
			encrypted,
			version: getUint16(dataView, offset),
			bitFlag: {
				level: (rawBitFlag & BITFLAG_LEVEL) >> 1,
				dataDescriptor: (rawBitFlag & BITFLAG_DATA_DESCRIPTOR) == BITFLAG_DATA_DESCRIPTOR,
				languageEncodingFlag: (rawBitFlag & BITFLAG_LANG_ENCODING_FLAG) == BITFLAG_LANG_ENCODING_FLAG
			},
			rawLastModDate,
			lastModDate: getDate(rawLastModDate),
			filenameLength: getUint16(dataView, offset + 22),
			extraFieldLength: getUint16(dataView, offset + 24)
		});
	}

	function readCommonFooter(fileEntry, directory, dataView, offset, localDirectory) {
		const { rawExtraField } = directory;
		const extraField = directory.extraField = new Map();
		const rawExtraFieldView = getDataView(rawExtraField);
		let offsetExtraField = 0;
		let malformedExtraField = false;
		try {
			while (offsetExtraField < rawExtraField.length) {
				const type = getUint16(rawExtraFieldView, offsetExtraField);
				const size = getUint16(rawExtraFieldView, offsetExtraField + 2);
				extraField.set(type, {
					type,
					data: rawExtraField.slice(offsetExtraField + 4, offsetExtraField + 4 + size)
				});
				offsetExtraField += 4 + size;
			}
		} catch {
			malformedExtraField = true;
		}
		if (offsetExtraField > rawExtraField.length) {
			malformedExtraField = true;
		}
		const compressionMethod = getUint16(dataView, offset + 4);
		Object.assign(directory, {
			signature: getUint32(dataView, offset + HEADER_OFFSET_SIGNATURE),
			crc32: getUint32(dataView, offset + HEADER_OFFSET_SIGNATURE),
			compressedSize: getUint32(dataView, offset + HEADER_OFFSET_COMPRESSED_SIZE),
			uncompressedSize: getUint32(dataView, offset + HEADER_OFFSET_UNCOMPRESSED_SIZE)
		});
		const extraFieldZip64 = extraField.get(EXTRAFIELD_TYPE_ZIP64);
		if (extraFieldZip64) {
			readExtraFieldZip64(extraFieldZip64, directory);
			directory.extraFieldZip64 = extraFieldZip64;
		}
		const extraFieldUnicodePath = extraField.get(EXTRAFIELD_TYPE_UNICODE_PATH);
		if (extraFieldUnicodePath) {
			readExtraFieldUnicode(extraFieldUnicodePath, PROPERTY_NAME_FILENAME, PROPERTY_NAME_RAW_FILENAME, directory, fileEntry);
			directory.extraFieldUnicodePath = extraFieldUnicodePath;
		}
		const extraFieldUnicodeComment = extraField.get(EXTRAFIELD_TYPE_UNICODE_COMMENT);
		if (extraFieldUnicodeComment) {
			readExtraFieldUnicode(extraFieldUnicodeComment, PROPERTY_NAME_COMMENT, PROPERTY_NAME_RAW_COMMENT, directory, fileEntry);
			directory.extraFieldUnicodeComment = extraFieldUnicodeComment;
		}
		const extraFieldAES = extraField.get(EXTRAFIELD_TYPE_AES);
		if (extraFieldAES && extraFieldAES.data.length >= 7) {
			readExtraFieldAES(extraFieldAES, directory, compressionMethod);
			directory.extraFieldAES = extraFieldAES;
		} else {
			directory.compressionMethod = compressionMethod;
		}
		const extraFieldPkwareUnix = extraField.get(EXTRAFIELD_TYPE_PKWARE_UNIX);
		if (extraFieldPkwareUnix) {
			readExtraFieldUnixDates(extraFieldPkwareUnix, directory);
			directory.extraFieldPkwareUnix = extraFieldPkwareUnix;
		}
		const extraFieldUnixType1 = extraField.get(EXTRAFIELD_TYPE_UNIX_TYPE1);
		if (extraFieldUnixType1) {
			readExtraFieldUnixDates(extraFieldUnixType1, directory);
			directory.extraFieldUnixType1 = extraFieldUnixType1;
		}
		const extraFieldNTFS = extraField.get(EXTRAFIELD_TYPE_NTFS);
		if (extraFieldNTFS) {
			readExtraFieldNTFS(extraFieldNTFS, directory);
			directory.extraFieldNTFS = extraFieldNTFS;
		}
		const extraFieldUnix = extraField.get(EXTRAFIELD_TYPE_UNIX);
		let unixIdsRead;
		if (extraFieldUnix) {
			unixIdsRead = readExtraFieldUnix(extraFieldUnix, directory, false);
			directory.extraFieldUnix = extraFieldUnix;
		}
		if (!unixIdsRead) {
			const extraFieldInfoZip = extraField.get(EXTRAFIELD_TYPE_INFOZIP);
			if (extraFieldInfoZip) {
				readExtraFieldUnix(extraFieldInfoZip, directory, true);
				directory.extraFieldInfoZip = extraFieldInfoZip;
			}
		}
		const extraFieldExtendedTimestamp = extraField.get(EXTRAFIELD_TYPE_EXTENDED_TIMESTAMP);
		if (extraFieldExtendedTimestamp) {
			readExtraFieldExtendedTimestamp(extraFieldExtendedTimestamp, directory, localDirectory);
			directory.extraFieldExtendedTimestamp = extraFieldExtendedTimestamp;
		}
		const extraFieldUSDZ = extraField.get(EXTRAFIELD_TYPE_USDZ);
		if (extraFieldUSDZ) {
			directory.extraFieldUSDZ = extraFieldUSDZ;
		}
		return malformedExtraField;
	}

	function readExtraFieldZip64(extraFieldZip64, directory) {
		directory.zip64 = true;
		const extraFieldView = getDataView(extraFieldZip64.data);
		const missingProperties = ZIP64_PROPERTIES.filter(([propertyName, max]) => directory[propertyName] == max);
		const requiredLength = missingProperties.reduce((length, [, max]) => length + ZIP64_EXTRACTION[max].bytes, 0);
		if (extraFieldZip64.data.length < requiredLength) {
			throw new Error(ERR_EXTRAFIELD_ZIP64_NOT_FOUND);
		}
		for (let indexMissingProperty = 0, offset = 0; indexMissingProperty < missingProperties.length; indexMissingProperty++) {
			const [propertyName, max] = missingProperties[indexMissingProperty];
			const extraction = ZIP64_EXTRACTION[max];
			directory[propertyName] = extraFieldZip64[propertyName] = extraction.getValue(extraFieldView, offset);
			offset += extraction.bytes;
		}
	}

	function readExtraFieldUnicode(extraFieldUnicode, propertyName, rawPropertyName, directory, fileEntry) {
		if (extraFieldUnicode.data.length < 5) {
			extraFieldUnicode.valid = false;
			return;
		}
		const extraFieldView = getDataView(extraFieldUnicode.data);
		const computedCrc32 = new Crc32();
		computedCrc32.append(fileEntry[rawPropertyName]);
		const computedCrc32View = getDataView(new Uint8Array(4));
		computedCrc32View.setUint32(0, computedCrc32.get(), true);
		const nameCrc32 = getUint32(extraFieldView, 1);
		const version = getUint8(extraFieldView, 0);
		Object.assign(extraFieldUnicode, {
			version,
			[propertyName]: decodeText(extraFieldUnicode.data.subarray(5)),
			valid: version == 1 && !fileEntry.bitFlag.languageEncodingFlag && nameCrc32 == getUint32(computedCrc32View, 0)
		});
		if (extraFieldUnicode.valid) {
			directory[propertyName] = extraFieldUnicode[propertyName];
			directory[propertyName + PROPERTY_NAME_UTF8_SUFFIX] = true;
		}
	}

	function readExtraFieldAES(extraFieldAES, directory, compressionMethod) {
		const extraFieldView = getDataView(extraFieldAES.data);
		const strength = getUint8(extraFieldView, 4);
		Object.assign(extraFieldAES, {
			vendorVersion: getUint8(extraFieldView, 0),
			vendorId: getUint8(extraFieldView, 2),
			strength,
			originalCompressionMethod: compressionMethod,
			compressionMethod: getUint16(extraFieldView, 5)
		});
		directory.compressionMethod = extraFieldAES.compressionMethod;
		if (extraFieldAES.vendorVersion != VENDOR_VERSION_AE_1) {
			directory.crc32 = UNDEFINED_VALUE;
		}
	}

	function readExtraFieldNTFS(extraFieldNTFS, directory) {
		const extraFieldView = getDataView(extraFieldNTFS.data);
		let offsetExtraField = 4;
		let tag1Data;
		try {
			while (offsetExtraField < extraFieldNTFS.data.length && !tag1Data) {
				const tagValue = getUint16(extraFieldView, offsetExtraField);
				const attributeSize = getUint16(extraFieldView, offsetExtraField + 2);
				if (tagValue == EXTRAFIELD_TYPE_NTFS_TAG1) {
					tag1Data = extraFieldNTFS.data.slice(offsetExtraField + 4, offsetExtraField + 4 + attributeSize);
				}
				offsetExtraField += 4 + attributeSize;
			}
		} catch {
			// ignored
		}
		if (tag1Data && tag1Data.length == 24) {
			const tag1View = getDataView(tag1Data);
			const rawLastModDate = tag1View.getBigUint64(0, true);
			const rawLastAccessDate = tag1View.getBigUint64(8, true);
			const rawCreationDate = tag1View.getBigUint64(16, true);
			Object.assign(extraFieldNTFS, {
				rawLastModDate,
				rawLastAccessDate,
				rawCreationDate
			});
			const lastModDate = getDateNTFS(rawLastModDate);
			const lastAccessDate = getDateNTFS(rawLastAccessDate);
			const creationDate = getDateNTFS(rawCreationDate);
			const extraFieldData = { lastModDate, lastAccessDate, creationDate };
			Object.assign(extraFieldNTFS, extraFieldData);
			Object.assign(directory, extraFieldData, { rawLastAccessDate, rawCreationDate });
		}
	}

	function readExtraFieldUnixDates(extraField, directory) {
		if (extraField.data.length < 8) {
			return;
		}
		const extraFieldView = getDataView(extraField.data);
		const lastAccessDate = new Date((getUint32(extraFieldView, 0) | 0) * 1000);
		const lastModDate = new Date((getUint32(extraFieldView, 4) | 0) * 1000);
		const extraFieldData = { lastAccessDate, lastModDate };
		if (extraField.data.length >= 12) {
			extraFieldData.uid = getUint16(extraFieldView, 8);
			extraFieldData.gid = getUint16(extraFieldView, 10);
		}
		Object.assign(extraField, extraFieldData);
		Object.assign(directory, extraFieldData);
	}

	function readExtraFieldUnix(extraField, directory, isInfoZip) {
		try {
			const view = getDataView(extraField.data);
			let uid, gid;
			if (isInfoZip) {
				let offset = 0;
				const version = getUint8(view, offset++);
				const uidSize = getUint8(view, offset++);
				uid = unpackUnixId(extraField.data.subarray(offset, offset + uidSize));
				offset += uidSize;
				const gidSize = getUint8(view, offset++);
				gid = unpackUnixId(extraField.data.subarray(offset, offset + gidSize));
				Object.assign(extraField, { version, uid, gid });
			} else if (extraField.data.length >= 4) {
				uid = getUint16(view, 0);
				gid = getUint16(view, 2);
				Object.assign(extraField, { uid, gid });
			}
			if (uid !== UNDEFINED_VALUE) {
				directory.uid = uid;
			}
			if (gid !== UNDEFINED_VALUE) {
				directory.gid = gid;
			}
			return uid !== UNDEFINED_VALUE || gid !== UNDEFINED_VALUE;
		} catch {
			// ignored
		}
	}

	function unpackUnixId(bytes) {
		const buffer = new Uint8Array(4);
		buffer.set(bytes, 0);
		const view = new DataView(buffer.buffer, buffer.byteOffset, 4);
		return view.getUint32(0, true);
	}

	function readExtraFieldExtendedTimestamp(extraFieldExtendedTimestamp, directory, localDirectory) {
		if (!extraFieldExtendedTimestamp.data.length) {
			return;
		}
		const extraFieldView = getDataView(extraFieldExtendedTimestamp.data);
		const flags = getUint8(extraFieldView, 0);
		const timeProperties = [];
		const timeRawProperties = [];
		if (localDirectory) {
			if ((flags & 0x1) == 0x1) {
				timeProperties.push(PROPERTY_NAME_LAST_MODIFICATION_DATE);
				timeRawProperties.push(PROPERTY_NAME_RAW_LAST_MODIFICATION_DATE);
			}
			if ((flags & 0x2) == 0x2) {
				timeProperties.push(PROPERTY_NAME_LAST_ACCESS_DATE);
				timeRawProperties.push(PROPERTY_NAME_RAW_LAST_ACCESS_DATE);
			}
			if ((flags & 0x4) == 0x4) {
				timeProperties.push(PROPERTY_NAME_CREATION_DATE);
				timeRawProperties.push(PROPERTY_NAME_RAW_CREATION_DATE);
			}
		} else if (extraFieldExtendedTimestamp.data.length >= 5) {
			timeProperties.push(PROPERTY_NAME_LAST_MODIFICATION_DATE);
			timeRawProperties.push(PROPERTY_NAME_RAW_LAST_MODIFICATION_DATE);
		}
		let offset = 1;
		timeProperties.forEach((propertyName, indexProperty) => {
			if (extraFieldExtendedTimestamp.data.length >= offset + 4) {
				const time = getUint32(extraFieldView, offset);
				directory[propertyName] = extraFieldExtendedTimestamp[propertyName] = new Date((time | 0) * 1000);
				const rawPropertyName = timeRawProperties[indexProperty];
				extraFieldExtendedTimestamp[rawPropertyName] = time;
			}
			offset += 4;
		});
	}

	async function detectOverlappingEntry({
		reader,
		fileEntry,
		index,
		offset,
		crc32,
		compressedSize,
		uncompressedSize,
		dataOffset,
		dataDescriptor,
		extraFieldZip64,
		readRanges
	}) {
		let dataDescriptorLength = 0;
		if (dataDescriptor) {
			if (extraFieldZip64) {
				dataDescriptorLength = DATA_DESCRIPTOR_RECORD_ZIP_64_LENGTH;
			} else {
				dataDescriptorLength = DATA_DESCRIPTOR_RECORD_LENGTH;
			}
		}
		if (dataDescriptorLength) {
			const dataDescriptorArray = await readUint8Array(reader, dataOffset + compressedSize, dataDescriptorLength + DATA_DESCRIPTOR_RECORD_SIGNATURE_LENGTH);
			const dataDescriptorView = getDataView(dataDescriptorArray);
			let signature = dataDescriptorArray.length == dataDescriptorLength + DATA_DESCRIPTOR_RECORD_SIGNATURE_LENGTH &&
				getUint32(dataDescriptorView, 0) == DATA_DESCRIPTOR_RECORD_SIGNATURE;
			if (signature) {
				const signedDataDescriptor = readDataDescriptor(dataDescriptorView, DATA_DESCRIPTOR_RECORD_SIGNATURE_LENGTH, extraFieldZip64);
				const matchCrc32 = (fileEntry.encrypted && !fileEntry.zipCrypto) || signedDataDescriptor.crc32 == crc32;
				if (matchCrc32 &&
					signedDataDescriptor.compressedSize == compressedSize &&
					signedDataDescriptor.uncompressedSize == uncompressedSize) {
					dataDescriptorLength += DATA_DESCRIPTOR_RECORD_SIGNATURE_LENGTH;
				} else {
					signature = false;
				}
			}
			if (dataDescriptorArray.length >= dataDescriptorLength) {
				const localDataDescriptor = readDataDescriptor(dataDescriptorView, signature ? DATA_DESCRIPTOR_RECORD_SIGNATURE_LENGTH : 0, extraFieldZip64);
				localDataDescriptor.signature = signature;
				fileEntry.localDirectory.dataDescriptor = localDataDescriptor;
			}
		}
		const range = {
			start: offset,
			end: dataOffset + compressedSize + dataDescriptorLength,
			fileEntry
		};
		for (const [otherIndex, otherRange] of readRanges) {
			if (otherIndex != index && range.start < otherRange.end && otherRange.start < range.end) {
				const error = new Error(ERR_OVERLAPPING_ENTRY);
				error.overlappingEntry = otherRange.fileEntry;
				throw error;
			}
		}
		readRanges.set(index, range);
	}

	function readDataDescriptor(dataDescriptorView, offset, extraFieldZip64) {
		const crc32 = getUint32(dataDescriptorView, offset);
		let compressedSize;
		let uncompressedSize;
		if (extraFieldZip64) {
			compressedSize = getBigUint64(dataDescriptorView, offset + 4);
			uncompressedSize = getBigUint64(dataDescriptorView, offset + 12);
		} else {
			compressedSize = getUint32(dataDescriptorView, offset + 4);
			uncompressedSize = getUint32(dataDescriptorView, offset + 8);
		}
		return { crc32, compressedSize, uncompressedSize };
	}

	function getDiskOffset(reader, diskNumber) {
		return reader.getDiskOffset ? reader.getDiskOffset(diskNumber) : 0;
	}

	async function startsWithSplitZipSignature(reader) {
		return await getFirstSignature(reader) == SPLIT_ZIP_FILE_SIGNATURE;
	}

	async function startsWithSplitZipMarker(reader) {
		const signature = await getFirstSignature(reader);
		return signature == SPLIT_ZIP_FILE_SIGNATURE || signature == TEMPORARY_SPLIT_ZIP_FILE_SIGNATURE;
	}

	async function getFirstSignature(reader) {
		const signatureArray = await readUint8Array(reader, 0, SPLIT_ZIP_FILE_SIGNATURE_LENGTH);
		return getUint32(getDataView(signatureArray));
	}

	function isStrictnessValue(value) {
		return value === STRICTNESS_STRICT || value === STRICTNESS_BALANCED || value === STRICTNESS_TOLERANT;
	}

	function getDecodableOutputSize(outputSize, compressedSize, compressed) {
		return Math.min(outputSize, compressed ? compressedSize * MAX_DEFLATE_EXPANSION_RATIO : compressedSize);
	}

	function getStrictness(options, inheritedOptions) {
		return resolveStrictness(options, resolveStrictness(inheritedOptions, STRICTNESS_BALANCED));
	}

	function resolveStrictness(options, inheritedStrictness) {
		const strictness = options[OPTION_STRICTNESS];
		if (strictness !== UNDEFINED_VALUE) {
			if (!isStrictnessValue(strictness)) {
				throw new Error(ERR_INVALID_STRICTNESS);
			}
			return strictness;
		}
		const checkAmbiguity = options[OPTION_CHECK_AMBIGUITY];
		if (checkAmbiguity === UNDEFINED_VALUE) {
			return inheritedStrictness;
		}
		if (checkAmbiguity) {
			return STRICTNESS_STRICT;
		}
		return inheritedStrictness == STRICTNESS_TOLERANT ? STRICTNESS_TOLERANT : STRICTNESS_BALANCED;
	}

	function getCheckLocalDirectory(checkLocalDirectory, strictness) {
		if (checkLocalDirectory === UNDEFINED_VALUE) {
			return strictness != STRICTNESS_TOLERANT;
		}
		return Boolean(checkLocalDirectory);
	}

	function getCheckLocalFilename(checkLocalFilename, strictness) {
		if (checkLocalFilename === UNDEFINED_VALUE) {
			return strictness == STRICTNESS_STRICT;
		}
		return Boolean(checkLocalFilename);
	}

	function getFilenameValidation(filenameValidation, strictness) {
		if (filenameValidation === UNDEFINED_VALUE) {
			return strictness;
		}
		if (!isStrictnessValue(filenameValidation)) {
			throw new Error(ERR_INVALID_FILENAME_VALIDATION);
		}
		return filenameValidation;
	}

	function isUnsafeFilename(filename, filenameValidation) {
		if (filenameValidation == STRICTNESS_TOLERANT) {
			return false;
		}
		const pathParts = filename.split("/");
		if (pathParts.length > 1 && pathParts[pathParts.length - 1] === "") {
			pathParts.pop();
		}
		if (pathParts.includes("..") || filename.startsWith("/") || filename.startsWith("\\\\") || DRIVE_LETTER_REGEXP.test(filename)) {
			return true;
		}
		return filenameValidation == STRICTNESS_STRICT && (pathParts.includes(".") || pathParts.includes(""));
	}

	function getMaxAppendedDataSize(maxAppendedDataSize, strictness) {
		if (maxAppendedDataSize !== UNDEFINED_VALUE) {
			const size = toNumber(maxAppendedDataSize);
			if (typeof size != NUMBER_TYPE || Number.isNaN(size) || size < 0) {
				throw new Error(ERR_INVALID_MAX_APPENDED_DATA_SIZE);
			}
			return size;
		}
		if (strictness == STRICTNESS_STRICT) {
			return 0;
		}
		if (strictness == STRICTNESS_TOLERANT) {
			return Infinity;
		}
		return MAX_16_BITS;
	}

	async function findEndOfCentralDirectory(reader, rejectAmbiguous, maxAppendedDataSize) {
		const { size } = reader;
		const anchoredLength = Math.min(size, END_OF_CENTRAL_DIR_LENGTH + MAX_16_BITS);
		const remoteProbeBudget = { count: MAX_END_OF_CENTRAL_DIR_PROBES };
		let endOfDirectoryInfo;
		let plausibleEndOfDirectoryInfo;
		let endOfDirectoryReachingEndCount = 0;
		for await (const [anchoredView, anchoredOffset, anchoredArray, indexByte, offset] of scanEndOfCentralDirectory(reader, anchoredLength)) {
			const commentLength = getUint16(anchoredView, indexByte + 20);
			if (offset + END_OF_CENTRAL_DIR_LENGTH + commentLength == size) {
				const reachability = await getCentralDirectoryReachability(reader, anchoredView, anchoredOffset, indexByte, offset, size, remoteProbeBudget);
				if (reachability == CENTRAL_DIRECTORY_REACHABLE) {
					if (!endOfDirectoryInfo) {
						endOfDirectoryInfo = getEndOfCentralDirectoryInfo(anchoredArray, indexByte, offset);
					}
					endOfDirectoryReachingEndCount++;
					if (!rejectAmbiguous || endOfDirectoryReachingEndCount > 1) {
						break;
					}
				} else if (reachability == CENTRAL_DIRECTORY_PLAUSIBLE && !plausibleEndOfDirectoryInfo) {
					plausibleEndOfDirectoryInfo = getEndOfCentralDirectoryInfo(anchoredArray, indexByte, offset);
				}
			}
		}
		if (!endOfDirectoryInfo) {
			endOfDirectoryInfo = plausibleEndOfDirectoryInfo;
		}
		if (!endOfDirectoryInfo) {
			endOfDirectoryInfo = await seekEndOfCentralDirectory(reader, maxAppendedDataSize, remoteProbeBudget);
		}
		return { endOfDirectoryInfo, endOfDirectoryReachingEndCount };
	}

	async function seekEndOfCentralDirectory(reader, maxAppendedDataSize, remoteProbeBudget) {
		const { size } = reader;
		const searchLength = Math.min(size, maxAppendedDataSize == Infinity ? size :
			END_OF_CENTRAL_DIR_LENGTH + MAX_16_BITS + maxAppendedDataSize);
		let firstSignatureInfo, plausibleInfo;
		for await (const [searchView, searchOffset, searchArray, indexByte, offset] of scanEndOfCentralDirectory(reader, searchLength)) {
			const record = getEndOfCentralDirectoryInfo(searchArray, indexByte, offset);
			if (!firstSignatureInfo) {
				firstSignatureInfo = record;
			}
			const reachability = await getCentralDirectoryReachability(reader, searchView, searchOffset, indexByte, offset, size, remoteProbeBudget);
			if (reachability == CENTRAL_DIRECTORY_REACHABLE) {
				return record;
			}
			if (reachability == CENTRAL_DIRECTORY_PLAUSIBLE && !plausibleInfo) {
				plausibleInfo = record;
			}
		}
		return plausibleInfo || firstSignatureInfo;
	}

	async function* scanEndOfCentralDirectory(reader, scanLength) {
		const scanOffset = reader.size - scanLength;
		const scanArray = await readUint8Array(reader, scanOffset, scanLength);
		const scanView = getDataView(scanArray);
		for (let indexByte = scanArray.length - END_OF_CENTRAL_DIR_LENGTH; indexByte >= 0; indexByte--) {
			if (getUint32(scanView, indexByte) == END_OF_CENTRAL_DIR_SIGNATURE) {
				yield [scanView, scanOffset, scanArray, indexByte, scanOffset + indexByte];
			}
		}
	}

	function getEndOfCentralDirectoryInfo(scanArray, indexByte, offset) {
		return { offset, buffer: scanArray.slice(indexByte, indexByte + END_OF_CENTRAL_DIR_LENGTH).buffer };
	}

	async function getCentralDirectoryReachability(reader, view, anchoredOffset, indexByte, offset, size, remoteProbeBudget) {
		const filesLength = getUint16(view, indexByte + 10);
		const directoryDataLength = getUint32(view, indexByte + 12);
		const directoryDataOffset = getUint32(view, indexByte + 16);
		if (filesLength == MAX_16_BITS || directoryDataLength == MAX_32_BITS || directoryDataOffset == MAX_32_BITS) {
			const locatorSignature = await readSignature(reader, view, anchoredOffset, offset - ZIP64_END_OF_CENTRAL_DIR_LOCATOR_LENGTH, size, remoteProbeBudget);
			return locatorSignature == ZIP64_END_OF_CENTRAL_DIR_LOCATOR_SIGNATURE ? CENTRAL_DIRECTORY_REACHABLE : CENTRAL_DIRECTORY_UNREACHABLE;
		}
		if (!filesLength && !directoryDataLength) {
			return CENTRAL_DIRECTORY_PLAUSIBLE;
		}
		const directoryDiskNumber = getUint16(view, indexByte + 6);
		for (const centralDirectoryOffset of [offset - directoryDataLength, getDiskOffset(reader, directoryDiskNumber) + directoryDataOffset]) {
			if (await readSignature(reader, view, anchoredOffset, centralDirectoryOffset, size, remoteProbeBudget) == CENTRAL_FILE_HEADER_SIGNATURE) {
				return CENTRAL_DIRECTORY_REACHABLE;
			}
		}
		return CENTRAL_DIRECTORY_UNREACHABLE;
	}

	async function readSignature(reader, view, anchoredOffset, signatureOffset, size, remoteProbeBudget) {
		if (signatureOffset < 0 || signatureOffset + 4 > size) {
			return UNDEFINED_VALUE;
		}
		if (signatureOffset >= anchoredOffset) {
			return getUint32(view, signatureOffset - anchoredOffset);
		}
		if (remoteProbeBudget.count > 0) {
			remoteProbeBudget.count--;
			const signatureArray = await readUint8Array(reader, signatureOffset, 4);
			return getUint32(getDataView(signatureArray), 0);
		}
		return UNDEFINED_VALUE;
	}

	function validateLocalDirectory(zipEntry, localDirectory, rawLocalFilename, checkLocalFilename, warnings) {
		const { rawFilename } = zipEntry;
		const reject = !warnings;
		const maskedLocalDirectory = zipEntry.decryptedDirectory &&
			(localDirectory.rawBitFlag & BITFLAG_MASKED_LOCAL_HEADERS) == BITFLAG_MASKED_LOCAL_HEADERS;
		if (checkLocalFilename && !maskedLocalDirectory &&
			(rawLocalFilename.length != rawFilename.length ||
				rawLocalFilename.some((byteValue, indexByte) => byteValue != rawFilename[indexByte]))) {
			reportAmbiguity(reject, warnings, "mismatched local file header (filename)");
		}
		if ((localDirectory.rawBitFlag & BITFLAG_AMBIGUITY_MASK) != (zipEntry.rawBitFlag & BITFLAG_AMBIGUITY_MASK)) {
			reportAmbiguity(reject, warnings, WARNING_MISMATCHED_LOCAL_FILE_HEADER_BIT_FLAG);
		}
		if (localDirectory.compressionMethod != zipEntry.compressionMethod) {
			reportAmbiguity(reject, warnings, WARNING_MISMATCHED_LOCAL_FILE_HEADER_COMPRESSION_METHOD);
		}
		if (!localDirectory.bitFlag.dataDescriptor && !maskedLocalDirectory &&
			(localDirectory.crc32 || localDirectory.compressedSize || localDirectory.uncompressedSize) &&
			(localDirectory.crc32 != zipEntry.crc32 ||
				localDirectory.compressedSize != zipEntry.compressedSize ||
				localDirectory.uncompressedSize != zipEntry.uncompressedSize)) {
			reportAmbiguity(reject, warnings, WARNING_MISMATCHED_LOCAL_FILE_HEADER_CRC32_OR_SIZES);
		}
	}

	function reportAmbiguity(reject, warnings, reason) {
		if (reject) {
			throwAmbiguousArchive(reason);
		} else {
			addWarning(warnings, reason);
		}
	}

	function addWarning(warnings, reason, filename) {
		if (!warnings.some(warning => warning.reason == reason)) {
			const warning = { reason };
			if (filename !== UNDEFINED_VALUE) {
				warning.filename = filename;
			}
			warnings.push(warning);
		}
	}

	function throwAmbiguousArchive(reason) {
		const error = new Error(ERR_AMBIGUOUS_ARCHIVE);
		error.reason = reason;
		throw error;
	}

	function getOptionValue(zipReader, options, name) {
		return options[name] === UNDEFINED_VALUE ? zipReader.options[name] : options[name];
	}

	function getFunctionOptionValue(zipReader, options, name) {
		return checkFunctionOption(getOptionValue(zipReader, options, name));
	}


	function getDate(timeRaw) {
		const date = (timeRaw & 0xffff0000) >> 16, time = timeRaw & MAX_16_BITS;
		const result = new Date(1980 + ((date & 0xFE00) >> 9), ((date & 0x01E0) >> 5) - 1, date & 0x001F, (time & 0xF800) >> 11, (time & 0x07E0) >> 5, (time & 0x001F) * 2, 0);
		return result < MIN_DATE ? MIN_DATE : result;
	}

	function getDateNTFS(timeRaw) {
		return new Date((Number((timeRaw / BigInt(10000)) - BigInt(11644473600000))));
	}

	function getUint8(view, offset) {
		return view.getUint8(offset);
	}

	function getUint16(view, offset) {
		return view.getUint16(offset, true);
	}

	function getUint32(view, offset) {
		return view.getUint32(offset, true);
	}

	function getBigUint64(view, offset) {
		const value = view.getBigUint64(offset, true);
		if (value > MAX_SAFE_UINT64) {
			throw new Error(ERR_UNSUPPORTED_UINT64);
		}
		return Number(value);
	}

	/*
	 Copyright (c) 2025 Gildas Lormeau. All rights reserved.

	 Redistribution and use in source and binary forms, with or without
	 modification, are permitted provided that the following conditions are met:

	 1. Redistributions of source code must retain the above copyright notice,
	 this list of conditions and the following disclaimer.

	 2. Redistributions in binary form must reproduce the above copyright
	 notice, this list of conditions and the following disclaimer in
	 the documentation and/or other materials provided with the distribution.

	 3. The names of the authors may not be used to endorse or promote products
	 derived from this software without specific prior written permission.

	 THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESSED OR IMPLIED WARRANTIES,
	 INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
	 FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL JCRAFT,
	 INC. OR ANY CONTRIBUTORS TO THIS SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT,
	 INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
	 LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
	 OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
	 LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
	 NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
	 EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
	 */

	BigInt(0);
	BigInt("0x7fffffffffffffff");

	/*
	 Copyright (c) 2025 Gildas Lormeau. All rights reserved.

	 Redistribution and use in source and binary forms, with or without
	 modification, are permitted provided that the following conditions are met:

	 1. Redistributions of source code must retain the above copyright notice,
	 this list of conditions and the following disclaimer.

	 2. Redistributions in binary form must reproduce the above copyright
	 notice, this list of conditions and the following disclaimer in
	 the documentation and/or other materials provided with the distribution.

	 3. The names of the authors may not be used to endorse or promote products
	 derived from this software without specific prior written permission.

	 THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESSED OR IMPLIED WARRANTIES,
	 INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
	 FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL JCRAFT,
	 INC. OR ANY CONTRIBUTORS TO THIS SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT,
	 INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
	 LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
	 OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
	 LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
	 NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
	 EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
	 */


	try {
		setDefaultConfiguration({ baseURI: (_documentCurrentScript && _documentCurrentScript.tagName.toUpperCase() === 'SCRIPT' && _documentCurrentScript.src || new URL('bundle.js', document.baseURI).href) });
	} catch {
		// ignored
	}

	const t=[3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258],e=[0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0],n=[1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577],o=[0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13],r=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15],V=new Uint8Array(288);V.fill(8,0,144),V.fill(9,144,256),V.fill(7,256,280),V.fill(8,280,288);const l=new Uint8Array(30).fill(5);function a(t){const e=new Uint16Array(16);for(const n of t)e[n]++;e[0]=0;const n=new Uint16Array(17);for(let t=1;t<=15;t++)n[t+1]=n[t]+e[t];const o=new Uint16Array(t.length);for(let e=0;e<t.length;e++)t[e]&&(o[n[t[e]]++]=e);return {o:e,symbols:o}}const f="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";function s(s){let m;s({wasmURI:()=>(m||(m="data:application/wasm;base64,"+function(t){let e="";const n=t.length;let o=0;for(;o+2<n;o+=3){const n=t[o]<<16|t[o+1]<<8|t[o+2];e+=f[n>>18&63]+f[n>>12&63]+f[n>>6&63]+f[63&n];}const r=n-o;if(1===r){const n=t[o]<<16;e+=f[n>>18&63]+f[n>>12&63]+"==";}else if(2===r){const n=t[o]<<16|t[o+1]<<8;e+=f[n>>18&63]+f[n>>12&63]+f[n>>6&63]+"=";}return e}(function(f){let s=0,m=0,q=0,i=new Uint8Array(1024),K=0,y=0;for(;!y;){y=W(1);const t=W(2);if(0==t)Y();else if(1==t)c(a(V),a(l));else {if(2!=t)throw new Error("invalid deflate block type");c(...p());}}return i.subarray(0,K);function z(){if(s>=f.length)throw new Error("unexpected end of deflate data");return f[s++]}function W(t){for(;q<t;)m|=z()<<q,q+=8;const e=m&(1<<t)-1;return m>>>=t,q-=t,e}function Y(){m=0,q=0;const t=z()|z()<<8;s+=2,Z(K+t);for(let e=0;e<t;e++)i[K++]=z();}function c(r,V){let l=u(r);for(;256!=l;){if(l<256)Z(K+1),i[K++]=l;else {const r=l-257,a=t[r]+W(e[r]),f=u(V),s=n[f]+W(o[f]);Z(K+a);const m=K-s;for(let t=0;t<a;t++)i[K++]=i[m+t];}l=u(r);}}function p(){const t=W(5)+257,e=W(5)+1,n=W(4)+4,o=new Uint8Array(19);for(let t=0;t<n;t++)o[r[t]]=W(3);const V=a(o),l=new Uint8Array(t+e);let f=0;for(;f<l.length;){const t=u(V);if(t<16)l[f++]=t;else if(16==t){const t=l[f-1];let e=W(2)+3;for(;e--;)l[f++]=t;}else f+=17==t?W(3)+3:W(7)+11;}return [a(l.subarray(0,t)),a(l.subarray(t))]}function u(t){const{o:e,symbols:n}=t;let o=0,r=0,V=0;for(let t=1;t<=15;t++){o|=W(1);const l=e[t];if(o-r<l)return n[V+(o-r)];V+=l,r=r+l<<1,o<<=1;}throw new Error("invalid huffman code")}function Z(t){if(i.length<t){let e=2*i.length;for(;e<t;)e*=2;const n=new Uint8Array(e);n.set(i.subarray(0,K)),i=n;}}}(function(t){const e=(t=String(t).replace(/[^A-Za-z0-9+/=]/g,"")).length,n=[];for(let o=0;o<e;o+=4){const e=f.indexOf(t[o])<<18|f.indexOf(t[o+1])<<12|(63&f.indexOf(t[o+2]))<<6|63&f.indexOf(t[o+3]);n.push(e>>16&255),"="!==t[o+2]&&n.push(e>>8&255),"="!==t[o+3]&&n.push(255&e);}return new Uint8Array(n)}("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")))),m)});}

	/*
	 Copyright (c) 2025 Gildas Lormeau. All rights reserved.

	 Redistribution and use in source and binary forms, with or without
	 modification, are permitted provided that the following conditions are met:

	 1. Redistributions of source code must retain the above copyright notice,
	 this list of conditions and the following disclaimer.

	 2. Redistributions in binary form must reproduce the above copyright 
	 notice, this list of conditions and the following disclaimer in 
	 the documentation and/or other materials provided with the distribution.

	 3. The names of the authors may not be used to endorse or promote products
	 derived from this software without specific prior written permission.

	 THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESSED OR IMPLIED WARRANTIES,
	 INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
	 FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL JCRAFT,
	 INC. OR ANY CONTRIBUTORS TO THIS SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT,
	 INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
	 LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
	 OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
	 LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
	 NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
	 EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
	 */

	/* global TransformStream */

	const FORMAT_DEFLATE = "deflate";
	const FORMAT_DEFLATE_RAW = "deflate-raw";
	const FORMAT_DEFLATE64_RAW = "deflate64-raw";
	const FORMAT_GZIP = "gzip";

	let wasm, malloc, free, memory, initError;

	function setWasmExports(wasmAPI) {
		wasm = wasmAPI;
		({ malloc, free, memory } = wasm);
		if (typeof malloc !== "function" || typeof free !== "function" || !memory) {
			wasm = malloc = free = memory = null;
			throw new Error("Invalid WASM module");
		}
	}

	function setInitError(error) {
		initError = error;
	}

	function _make(isCompress, type, options = {}) {
		if (!wasm) {
			const error = new Error("WASM module not loaded");
			error.cause = initError;
			throw error;
		}
		const level = (typeof options.level === "number") ? options.level : -1;
		const outBufferSize = (typeof options.outBuffer === "number") ? options.outBuffer : 64 * 1024;
		const inBufferSize = (typeof options.inBufferSize === "number") ? options.inBufferSize : 64 * 1024;

		return new TransformStream({
			start() {
				try {
					let result;
					this.out = malloc(outBufferSize);
					this.in = malloc(inBufferSize);
					this.inBufferSize = inBufferSize;
					if (!this.out || !this.in) {
						throw new Error("allocation failed");
					}
					this._scratch = new Uint8Array(outBufferSize);
					if (isCompress) {
						this._process = wasm.deflate_process;
						this._last_consumed = wasm.deflate_last_consumed;
						this._end = wasm.deflate_end;
						this.streamHandle = wasm.deflate_new();
						if (type === FORMAT_GZIP) {
							result = wasm.deflate_init_gzip(this.streamHandle, level);
						} else if (type === FORMAT_DEFLATE_RAW) {
							result = wasm.deflate_init_raw(this.streamHandle, level);
						} else {
							result = wasm.deflate_init(this.streamHandle, level);
						}
					} else {
						if (type === FORMAT_DEFLATE64_RAW) {
							this._process = wasm.inflate9_process;
							this._last_consumed = wasm.inflate9_last_consumed;
							this._end = wasm.inflate9_end;
							this.streamHandle = wasm.inflate9_new();
							result = wasm.inflate9_init_raw(this.streamHandle);
						} else {
							this._process = wasm.inflate_process;
							this._last_consumed = wasm.inflate_last_consumed;
							this._end = wasm.inflate_end;
							this.streamHandle = wasm.inflate_new();
							if (type === FORMAT_DEFLATE_RAW) {
								result = wasm.inflate_init_raw(this.streamHandle);
							} else if (type === FORMAT_GZIP) {
								result = wasm.inflate_init_gzip(this.streamHandle);
							} else {
								result = wasm.inflate_init(this.streamHandle);
							}
						}
					}
					if (result !== 0) {
						throw new Error("init failed:" + result);
					}
				} catch (error) {
					disposeStream(this);
					throw error;
				}
			},
			transform(chunk, controller) {
				try {
					const buffer = chunk;
					const heap = new Uint8Array(memory.buffer);
					const process = this._process;
					const last_consumed = this._last_consumed;
					const out = this.out;
					const scratch = this._scratch;
					let offset = 0;
					while (offset < buffer.length) {
						const toRead = Math.min(buffer.length - offset, 32 * 1024);
						if (!this.in || this.inBufferSize < toRead) {
							if (this.in && free) {
								free(this.in);
								this.in = 0;
							}
							this.in = malloc(toRead);
							this.inBufferSize = toRead;
							if (!this.in) {
								throw new Error("allocation failed");
							}
						}
						heap.set(buffer.subarray(offset, offset + toRead), this.in);
						const result = process(this.streamHandle, this.in, toRead, out, outBufferSize, 0);
						// checked before the byte count is used, so a status code can never be read as one
						const code = (result >> 24) & 0xff;
						const signedCode = (code & 0x80) ? code - 256 : code;
						if (signedCode < 0) {
							throw new Error("process error:" + signedCode);
						}
						const prod = result & 0x00ffffff;
						if (prod) {
							scratch.set(heap.subarray(out, out + prod), 0);
							controller.enqueue(scratch.slice(0, prod));
						}
						const consumed = last_consumed(this.streamHandle);
						if (consumed === 0 && prod === 0) {
							break;
						}
						offset += consumed;
					}
				} catch (error) {
					disposeStream(this);
					controller.error(error);
				}
			},
			flush(controller) {
				try {
					const heap = new Uint8Array(memory.buffer);
					const process = this._process;
					const out = this.out;
					const scratch = this._scratch;
					while (true) {
						const result = process(this.streamHandle, 0, 0, out, outBufferSize, 4);
						const code = (result >> 24) & 0xff;
						const signedCode = (code & 0x80) ? code - 256 : code;
						if (signedCode < 0) {
							throw new Error("process error:" + signedCode);
						}
						const produced = result & 0x00ffffff;
						if (produced) {
							scratch.set(heap.subarray(out, out + produced), 0);
							controller.enqueue(scratch.slice(0, produced));
						}
						if (code === 1 || produced === 0) {
							break;
						}
					}
				} catch (error) {
					controller.error(error);
				} finally {
					const result = disposeStream(this);
					if (result !== 0) {
						controller.error(new Error("end error:" + result));
					}
				}
			},
			cancel() {
				// release the stream handle and buffers when the pipeline is aborted,
				// they would be leaked in the process-lifetime wasm heap otherwise
				disposeStream(this);
			}
		});

		function disposeStream(state) {
			let endResult = 0;
			if (state.streamHandle && state._end) {
				endResult = state._end(state.streamHandle);
			}
			state.streamHandle = 0;
			if (state.in && free) {
				free(state.in);
			}
			state.in = 0;
			if (state.out && free) {
				free(state.out);
			}
			state.out = 0;
			return endResult;
		}
	}

	class CompressionStreamZlib {
		constructor(type = FORMAT_DEFLATE, options) {
			return _make(true, type, options);
		}
	}
	class DecompressionStreamZlib {
		constructor(type = FORMAT_DEFLATE, options) {
			return _make(false, type, options);
		}
	}
	// These codecs are backed by the WASM module; they are unusable until setWasmExports() has run.
	// The worker uses this flag to know it must fall back to the native CompressionStream when the
	// module fails to load, rather than discarding a self-contained codec supplied through config.
	CompressionStreamZlib.requiresModule = true;
	DecompressionStreamZlib.requiresModule = true;
	// Constructing these classes before the module is loaded throws, so capability probes cannot rely
	// on trying the constructor; the formats are declared instead, next to the branches implementing
	// them in _make().
	CompressionStreamZlib.supportedFormats = [FORMAT_DEFLATE, FORMAT_DEFLATE_RAW, FORMAT_GZIP];
	DecompressionStreamZlib.supportedFormats = [FORMAT_DEFLATE, FORMAT_DEFLATE_RAW, FORMAT_GZIP, FORMAT_DEFLATE64_RAW];

	/*
	 Copyright (c) 2025 Gildas Lormeau. All rights reserved.

	 Redistribution and use in source and binary forms, with or without
	 modification, are permitted provided that the following conditions are met:

	 1. Redistributions of source code must retain the above copyright notice,
	 this list of conditions and the following disclaimer.

	 2. Redistributions in binary form must reproduce the above copyright 
	 notice, this list of conditions and the following disclaimer in 
	 the documentation and/or other materials provided with the distribution.

	 3. The names of the authors may not be used to endorse or promote products
	 derived from this software without specific prior written permission.

	 THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESSED OR IMPLIED WARRANTIES,
	 INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
	 FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL JCRAFT,
	 INC. OR ANY CONTRIBUTORS TO THIS SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT,
	 INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
	 LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
	 OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
	 LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
	 NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
	 EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
	 */


	let initializedModule = false;

	async function initModule(wasmURI, { baseURI }) {
		if (!initializedModule) {
			try {
				await instantiateModule(wasmURI, baseURI);
				initializedModule = true;
			} catch (error) {
				setInitError(error);
				throw error;
			}
		}
	}

	async function instantiateModule(wasmURI, baseURI) {
		let arrayBuffer, uri;
		try {
			try {
				uri = new URL(wasmURI, baseURI);
			} catch {
				// ignored
			}
			const response = await fetch(uri);
			arrayBuffer = await response.arrayBuffer();
		} catch (error) {
			if (wasmURI.startsWith("data:application/wasm;base64,")) {
				arrayBuffer = arrayBufferFromDataURI(wasmURI);
			} else {
				throw error;
			}
		}
		const wasmInstance = await WebAssembly.instantiate(arrayBuffer);
		setWasmExports(wasmInstance.instance.exports);
	}

	function arrayBufferFromDataURI(dataURI) {
		const base64 = dataURI.split(",")[1];
		const binary = atob(base64);
		const len = binary.length;
		const bytes = new Uint8Array(len);
		for (let i = 0; i < len; ++i) {
			bytes[i] = binary.charCodeAt(i);
		}
		return bytes.buffer;
	}

	/*
	 Copyright (c) 2025 Gildas Lormeau. All rights reserved.

	 Redistribution and use in source and binary forms, with or without
	 modification, are permitted provided that the following conditions are met:

	 1. Redistributions of source code must retain the above copyright notice,
	 this list of conditions and the following disclaimer.

	 2. Redistributions in binary form must reproduce the above copyright
	 notice, this list of conditions and the following disclaimer in
	 the documentation and/or other materials provided with the distribution.

	 3. The names of the authors may not be used to endorse or promote products
	 derived from this software without specific prior written permission.

	 THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESSED OR IMPLIED WARRANTIES,
	 INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
	 FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL JCRAFT,
	 INC. OR ANY CONTRIBUTORS TO THIS SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT,
	 INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
	 LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
	 OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
	 LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
	 NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
	 EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
	 */


	let modulePromise;

	configureWorker({
		initModule: config => {
			if (!modulePromise) {
				let { wasmURI } = config;
				// deno-lint-ignore valid-typeof
				if (typeof wasmURI == FUNCTION_TYPE) {
					wasmURI = wasmURI();
				}
				modulePromise = initModule(wasmURI, config).catch(error => {
					modulePromise = null;
					throw error;
				});
			}
			return modulePromise;
		}
	});
	setDefaultConfiguration({
		CompressionStreamFallback: CompressionStreamZlib,
		DecompressionStreamFallback: DecompressionStreamZlib
	});

	/*
	 Copyright (c) 2025 Gildas Lormeau. All rights reserved.

	 Redistribution and use in source and binary forms, with or without
	 modification, are permitted provided that the following conditions are met:

	 1. Redistributions of source code must retain the above copyright notice,
	 this list of conditions and the following disclaimer.

	 2. Redistributions in binary form must reproduce the above copyright
	 notice, this list of conditions and the following disclaimer in
	 the documentation and/or other materials provided with the distribution.

	 3. The names of the authors may not be used to endorse or promote products
	 derived from this software without specific prior written permission.

	 THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESSED OR IMPLIED WARRANTIES,
	 INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
	 FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL JCRAFT,
	 INC. OR ANY CONTRIBUTORS TO THIS SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT,
	 INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
	 LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
	 OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
	 LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
	 NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
	 EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
	 */


	s(setDefaultConfiguration);

	/*
	 Copyright (c) 2025 Gildas Lormeau. All rights reserved.

	 Redistribution and use in source and binary forms, with or without
	 modification, are permitted provided that the following conditions are met:

	 1. Redistributions of source code must retain the above copyright notice,
	 this list of conditions and the following disclaimer.

	 2. Redistributions in binary form must reproduce the above copyright
	 notice, this list of conditions and the following disclaimer in
	 the documentation and/or other materials provided with the distribution.

	 3. The names of the authors may not be used to endorse or promote products
	 derived from this software without specific prior written permission.

	 THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESSED OR IMPLIED WARRANTIES,
	 INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
	 FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL JCRAFT,
	 INC. OR ANY CONTRIBUTORS TO THIS SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT,
	 INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
	 LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
	 OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
	 LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
	 NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
	 EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
	 */


	n$1(setDefaultConfiguration);

	var knockoutLatest = {exports: {}};

	/*!
	 * Knockout JavaScript library v3.5.3
	 * (c) The Knockout.js team - http://knockoutjs.com/
	 * License: MIT (http://www.opensource.org/licenses/mit-license.php)
	 */

	var hasRequiredKnockoutLatest;

	function requireKnockoutLatest () {
		if (hasRequiredKnockoutLatest) return knockoutLatest.exports;
		hasRequiredKnockoutLatest = 1;
		(function (module, exports) {
			(function() {(function(p){var z=this||(0, eval)("this"),v=z.document,R=z.navigator,w=z.jQuery,G=z.JSON;w||"undefined"===typeof jQuery||(w=jQuery);(function(p){p(module.exports||exports);})(function(S,T){function K(a,c){return null===a||typeof a in X?a===c:false}function Y(b,c){var d;return function(){d||(d=a.a.setTimeout(function(){d=p;b();},c));}}function Z(b,c){var d;return function(){clearTimeout(d);
			d=a.a.setTimeout(b,c);}}function aa(a,c){c&&"change"!==c?"beforeChange"===c?this.pc(a):this.ib(a,c):this.qc(a);}function ba(a,c){null!==c&&c.s&&c.s();}function ca(a,c){var d=this.qd,e=d[t];e.ta||(this.Rb&&this.ob[c]?(d.uc(c,a,this.ob[c]),this.ob[c]=null,--this.Rb):e.I[c]||d.uc(c,a,e.K?{da:a}:d.$c(a)),a.La&&a.gd());}var a="undefined"!==typeof S?S:{};a.b=function(b,c){for(var d=b.split("."),e=a,f=0;f<d.length-1;f++)e=e[d[f]];e[d[d.length-1]]=c;};a.L=function(a,c,d){a[c]=d;};a.version="3.5.3";a.b("version",
			a.version);a.options={deferUpdates:false,useOnlyNativeEvents:false,foreachHidesDestroyed:false};var H;if("undefined"!==typeof trustedTypes)try{H=trustedTypes.createPolicy("knockout",{createHTML:function(a){return a},createScript:function(a){return a}});}catch(fa){}a.a=function(){function b(a,b){for(var c in a)f.call(a,c)&&b(c,a[c]);}function c(a,b){if(b)for(var c in b)f.call(b,c)&&(a[c]=b[c]);return a}function d(a,b){a.__proto__=b;return a}function e(b,c,e,d){var l=b[c].match(n)||[];a.a.D(e.match(n),function(b){a.a.Pa(l,
			b,d);});b[c]=l.join(" ");}var f=Object.prototype.hasOwnProperty,g={__proto__:[]}instanceof Array,h="function"===typeof Symbol,m={},k={};m[R&&/Firefox\/2/i.test(R.userAgent)?"KeyboardEvent":"UIEvents"]=["keyup","keydown","keypress"];m.MouseEvents="click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave".split(" ");b(m,function(a,b){if(b.length)for(var c=0,e=b.length;c<e;c++)k[b[c]]=a;});var l={propertychange:true},q;H||(q=v&&function(){for(var a=3,b=v.createElement("div"),c=
			b.getElementsByTagName("i");b.innerHTML="\x3c!--[if gt IE "+ ++a+"]><i></i><![endif]--\x3e",c[0];);return 4<a?a:p}());var n=/\S+/g,r;return {Jc:["authenticity_token",/^__RequestVerificationToken(_.*)?$/],D:function(a,b,c){for(var e=0,d=a.length;e<d;e++)b.call(c,a[e],e,a);},A:"function"==typeof Array.prototype.indexOf?function(a,b){return Array.prototype.indexOf.call(a,b)}:function(a,b){for(var c=0,e=a.length;c<e;c++)if(a[c]===b)return c;return  -1},Mb:function(a,b,c){for(var e=0,d=a.length;e<d;e++)if(b.call(c,
			a[e],e,a))return a[e];return p},Ra:function(b,c){var e=a.a.A(b,c);0<e?b.splice(e,1):0===e&&b.shift();},wc:function(b){var c=[];b&&a.a.D(b,function(b){0>a.a.A(c,b)&&c.push(b);});return c},Nb:function(a,b,c){var e=[];if(a)for(var d=0,l=a.length;d<l;d++)e.push(b.call(c,a[d],d));return e},lb:function(a,b,c){var e=[];if(a)for(var d=0,l=a.length;d<l;d++)b.call(c,a[d],d)&&e.push(a[d]);return e},Ob:function(a,b){if(b instanceof Array)a.push.apply(a,b);else for(var c=0,e=b.length;c<e;c++)a.push(b[c]);return a},
			Pa:function(b,c,e){var d=a.a.A(a.a.bc(b),c);0>d?e&&b.push(c):e||b.splice(d,1);},Ca:g,extend:c,setPrototypeOf:d,Bb:g?d:c,P:b,Ia:function(a,b,c){if(!a)return a;var e={},d;for(d in a)f.call(a,d)&&(e[d]=b.call(c,a[d],d,a));return e},Ub:function(b){for(;b.firstChild;)a.removeNode(b.firstChild);},Zb:function(b){b=a.a.la(b);for(var c=(b[0]&&b[0].ownerDocument||v).createElement("div"),e=0,d=b.length;e<d;e++)c.appendChild(a.pa(b[e]));return c},Da:function(b,c){for(var e=0,d=b.length,l=[];e<d;e++){var k=b[e].cloneNode(true);
			l.push(c?a.pa(k):k);}return l},xa:function(b,c){a.a.Ub(b);if(c)for(var e=0,d=c.length;e<d;e++)b.appendChild(c[e]);},Xc:function(b,c){var e=b.nodeType?[b]:b;if(0<e.length){for(var d=e[0],l=d.parentNode,k=0,f=c.length;k<f;k++)l.insertBefore(c[k],d);k=0;for(f=e.length;k<f;k++)a.removeNode(e[k]);}},Wa:function(a,b){if(a.length){for(b=8===b.nodeType&&b.parentNode||b;a.length&&a[0].parentNode!==b;)a.splice(0,1);for(;1<a.length&&a[a.length-1].parentNode!==b;)a.length--;if(1<a.length){var c=a[0],e=a[a.length-
			1];for(a.length=0;c!==e;)a.push(c),c=c.nextSibling;a.push(e);}}return a},Zc:function(a,b){7>q?a.setAttribute("selected",b):a.selected=b;},Eb:function(a){return null===a||a===p?"":a.trim?a.trim():a.toString().replace(/^[\s\xa0]+|[\s\xa0]+$/g,"")},Ud:function(a,b){a=a||"";return b.length>a.length?false:a.substring(0,b.length)===b},vd:function(a,b){if(a===b)return  true;if(11===a.nodeType)return  false;if(b.contains)return b.contains(1!==a.nodeType?a.parentNode:a);if(b.compareDocumentPosition)return 16==(b.compareDocumentPosition(a)&
			16);for(;a&&a!=b;)a=a.parentNode;return !!a},Tb:function(b){return a.a.vd(b,b.ownerDocument.documentElement)},kd:function(b){return !!a.a.Mb(b,a.a.Tb)},R:function(a){return a&&a.tagName&&a.tagName.toLowerCase()},Ac:function(b){return a.onError?function(){try{return b.apply(this,arguments)}catch(c){throw a.onError&&a.onError(c),c;}}:b},setTimeout:function(b,c){return setTimeout(a.a.Ac(b),c)},Gc:function(b){setTimeout(function(){a.onError&&a.onError(b);throw b;},0);},B:function(b,c,e){var d=a.a.Ac(e);
			e=l[c];if(!a.options.useOnlyNativeEvents&&!e&&w)r||(r="function"==typeof w(b).on?"on":"bind"),w(b)[r](c,d);else if(!e&&"function"==typeof b.addEventListener)b.addEventListener(c,d,false),a.a.J.oa(b,function(){b.removeEventListener(c,d);});else if("undefined"!=typeof b.attachEvent){var k=function(a){d.call(b,a);},f="on"+c;b.attachEvent(f,k);a.a.J.oa(b,function(){b.detachEvent(f,k);});}},Gb:function(b,c){if(!b||!b.nodeType)throw Error("element must be a DOM node when calling triggerEvent");var e;"input"===
			a.a.R(b)&&b.type&&"click"==c.toLowerCase()?(e=b.type,e="checkbox"==e||"radio"==e):e=false;if(a.options.useOnlyNativeEvents||!w||e)if("function"==typeof v.createEvent)if("function"==typeof b.dispatchEvent)e=v.createEvent(k[c]||"HTMLEvents"),e.initEvent(c,true,true,z,0,0,0,0,0,false,false,false,false,0,b),b.dispatchEvent(e);else throw Error("The supplied element doesn't support dispatchEvent");else if(e&&b.click)b.click();else if("undefined"!=typeof b.fireEvent)b.fireEvent("on"+c);else throw Error("Browser doesn't support triggering events");
			else w(b).trigger(c);},f:function(b){return a.O(b)?b():b},bc:function(b){return a.O(b)?b.v():b},Fb:function(b,c,d){var l;c&&("object"===typeof b.classList?(l=b.classList[d?"add":"remove"],a.a.D(c.match(n),function(a){l.call(b.classList,a);})):"string"===typeof b.className.baseVal?e(b.className,"baseVal",c,d):e(b,"className",c,d));},Cb:function(b,c){var e=a.a.f(c);if(null===e||e===p)e="";var d=a.h.firstChild(b);!d||3!=d.nodeType||a.h.nextSibling(d)?a.h.xa(b,[b.ownerDocument.createTextNode(e)]):d.data=
			e;a.a.Ad(b);},Yc:function(a,b){a.name=b;if(7>=q)try{var c=a.name.replace(/[&<>'"]/g,function(a){return "&#"+a.charCodeAt(0)+";"});a.mergeAttributes(v.createElement("<input name='"+c+"'/>"),!1);}catch(e){}},Ad:function(a){9<=q&&(a=1==a.nodeType?a:a.parentNode,a.style&&(a.style.zoom=a.style.zoom));},wd:function(a){if(q){var b=a.style.width;a.style.width=0;a.style.width=b;}},Pd:function(b,c){b=a.a.f(b);c=a.a.f(c);for(var e=[],d=b;d<=c;d++)e.push(d);return e},la:function(a){for(var b=[],c=0,e=a.length;c<e;c++)b.push(a[c]);
			return b},Ea:function(a){return h?Symbol(a):a},Zd:6===q,$d:7===q,W:q,Lc:function(b,c){for(var e=a.a.la(b.getElementsByTagName("input")).concat(a.a.la(b.getElementsByTagName("textarea"))),d="string"==typeof c?function(a){return a.name===c}:function(a){return c.test(a.name)},l=[],k=e.length-1;0<=k;k--)d(e[k])&&l.push(e[k]);return l},Nd:function(b){return "string"==typeof b&&(b=a.a.Eb(b))?G&&G.parse?G.parse(b):(new Function("return "+b))():null},hc:function(b,c,e){if(!G||!G.stringify)throw Error("Cannot find JSON.stringify(). Some browsers (e.g., IE < 8) don't support it natively, but you can overcome this by adding a script reference to json2.js, downloadable from http://www.json.org/json2.js");
			return G.stringify(a.a.f(b),c,e)},Od:function(c,e,d){d=d||{};var l=d.params||{},k=d.includeFields||this.Jc,f=c;if("object"==typeof c&&"form"===a.a.R(c))for(var f=c.action,h=k.length-1;0<=h;h--)for(var g=a.a.Lc(c,k[h]),m=g.length-1;0<=m;m--)l[g[m].name]=g[m].value;e=a.a.f(e);var n=v.createElement("form");n.style.display="none";n.action=f;n.method="post";for(var q in e)c=v.createElement("input"),c.type="hidden",c.name=q,c.value=a.a.hc(a.a.f(e[q])),n.appendChild(c);b(l,function(a,b){var c=v.createElement("input");
			c.type="hidden";c.name=a;c.value=b;n.appendChild(c);});v.body.appendChild(n);d.submitter?d.submitter(n):n.submit();setTimeout(function(){n.parentNode.removeChild(n);},0);}}}();a.b("utils",a.a);a.b("utils.arrayForEach",a.a.D);a.b("utils.arrayFirst",a.a.Mb);a.b("utils.arrayFilter",a.a.lb);a.b("utils.arrayGetDistinctValues",a.a.wc);a.b("utils.arrayIndexOf",a.a.A);a.b("utils.arrayMap",a.a.Nb);a.b("utils.arrayPushAll",a.a.Ob);a.b("utils.arrayRemoveItem",a.a.Ra);a.b("utils.cloneNodes",a.a.Da);a.b("utils.createSymbolOrString",
			a.a.Ea);a.b("utils.extend",a.a.extend);a.b("utils.fieldsIncludedWithJsonPost",a.a.Jc);a.b("utils.getFormFields",a.a.Lc);a.b("utils.objectMap",a.a.Ia);a.b("utils.peekObservable",a.a.bc);a.b("utils.postJson",a.a.Od);a.b("utils.parseJson",a.a.Nd);a.b("utils.registerEventHandler",a.a.B);a.b("utils.stringifyJson",a.a.hc);a.b("utils.range",a.a.Pd);a.b("utils.toggleDomNodeCssClass",a.a.Fb);a.b("utils.triggerEvent",a.a.Gb);a.b("utils.unwrapObservable",a.a.f);a.b("utils.objectForEach",a.a.P);a.b("utils.addOrRemoveItem",
			a.a.Pa);a.b("utils.setTextContent",a.a.Cb);a.b("unwrap",a.a.f);Function.prototype.bind||(Function.prototype.bind=function(a){var c=this;if(1===arguments.length)return function(){return c.apply(a,arguments)};var d=Array.prototype.slice.call(arguments,1);return function(){var e=d.slice(0);e.push.apply(e,arguments);return c.apply(a,e)}});a.a.g=new function(){var b=0,c="__ko__"+(new Date).getTime(),d={},e,f;a.a.W?(e=function(a,e){var f=a[c];if(!f||"null"===f||!d[f]){if(!e)return p;f=a[c]="ko"+b++;d[f]=
			{};}return d[f]},f=function(a){var b=a[c];return b?(delete d[b],a[c]=null,true):false}):(e=function(a,b){var e=a[c];!e&&b&&(e=a[c]={});return e},f=function(a){return a[c]?(delete a[c],true):false});return {get:function(a,b){var c=e(a,false);return c&&c[b]},set:function(a,b,c){(a=e(a,c!==p))&&(a[b]=c);},Vb:function(a,b,c){a=e(a,true);return a[b]||(a[b]=c)},clear:f,Z:function(){return b++ +c}}};a.b("utils.domData",a.a.g);a.b("utils.domData.clear",a.a.g.clear);a.a.J=new function(){function b(b,c){var d=a.a.g.get(b,e);
			d===p&&c&&(d=[],a.a.g.set(b,e,d));return d}function c(c){var e=b(c,false);if(e)for(var e=e.slice(0),k=0;k<e.length;k++)e[k](c);a.a.g.clear(c);a.a.J.cleanExternalData(c);g[c.nodeType]&&d(c.childNodes,true);}function d(b,e){for(var d=[],l,f=0;f<b.length;f++)if(!e||8===b[f].nodeType)if(c(d[d.length]=l=b[f]),b[f]!==l)for(;f--&&-1==a.a.A(d,b[f]););}var e=a.a.g.Z(),f={1:true,8:true,9:true},g={1:true,9:true};return {oa:function(a,c){if("function"!=typeof c)throw Error("Callback must be a function");b(a,true).push(c);},zb:function(c,
			d){var f=b(c,false);f&&(a.a.Ra(f,d),0==f.length&&a.a.g.set(c,e,p));},pa:function(b){a.u.G(function(){f[b.nodeType]&&(c(b),g[b.nodeType]&&d(b.getElementsByTagName("*")));});return b},removeNode:function(b){a.pa(b);b.parentNode&&b.parentNode.removeChild(b);},cleanExternalData:function(a){w&&"function"==typeof w.cleanData&&w.cleanData([a]);}}};a.pa=a.a.J.pa;a.removeNode=a.a.J.removeNode;a.b("cleanNode",a.pa);a.b("removeNode",a.removeNode);a.b("utils.domNodeDisposal",a.a.J);a.b("utils.domNodeDisposal.addDisposeCallback",
			a.a.J.oa);a.b("utils.domNodeDisposal.removeDisposeCallback",a.a.J.zb);(function(){var b=[0,"",""],c=[1,"<table>","</table>"],d=[3,"<table><tbody><tr>","</tr></tbody></table>"],e=[1,"<select multiple='multiple'>","</select>"],f={thead:c,tbody:c,tfoot:c,tr:[2,"<table><tbody>","</tbody></table>"],td:d,th:d,option:e,optgroup:e},g=8>=a.a.W;a.a.wa=function(c,e){var d;if(w)if(w.parseHTML)d=w.parseHTML(c,e)||[];else {if((d=w.clean([c],e))&&d[0]){for(var l=d[0];l.parentNode&&11!==l.parentNode.nodeType;)l=l.parentNode;
			l.parentNode&&l.parentNode.removeChild(l);}}else {(d=e)||(d=v);var l=d.parentWindow||d.defaultView||z,q=a.a.Eb(c).toLowerCase(),n=d.createElement("div"),r;r=(q=q.match(/^(?:\x3c!--.*?--\x3e\s*?)*?<([a-z]+)[\s>]/))&&f[q[1]]||b;q=r[0];r="ignored<div>"+r[1]+c+r[2]+"</div>";"function"==typeof l.innerShiv?n.appendChild(l.innerShiv(r)):(g&&d.body.appendChild(n),n.innerHTML=H?H.createHTML(r):r,g&&n.parentNode.removeChild(n));for(;q--;)n=n.lastChild;d=a.a.la(n.lastChild.childNodes);}return d};a.a.Md=function(b,
			c){var e=a.a.wa(b,c);return e.length&&e[0].parentElement||a.a.Zb(e)};a.a.fc=function(b,c){a.a.Ub(b);c=a.a.f(c);if(null!==c&&c!==p){if("string"!=typeof c){if("undefined"!==typeof trustedTypes&&trustedTypes.isHTML(c)){b.innerHTML=c;return}c=c.toString();}if(w)w(b).html(c);else for(var e=a.a.wa(c,b.ownerDocument),d=0;d<e.length;d++)b.appendChild(e[d]);}};})();a.b("utils.parseHtmlFragment",a.a.wa);a.b("utils.setHtml",a.a.fc);a.aa=function(){function b(c,e){if(c)if(8==c.nodeType){var f=a.aa.Uc(c.nodeValue);
			null!=f&&e.push({ud:c,Kd:f});}else if(1==c.nodeType)for(var f=0,g=c.childNodes,h=g.length;f<h;f++)b(g[f],e);}var c={};return {Yb:function(a){if("function"!=typeof a)throw Error("You can only pass a function to ko.memoization.memoize()");var b=(4294967296*(1+Math.random())|0).toString(16).substring(1)+(4294967296*(1+Math.random())|0).toString(16).substring(1);c[b]=a;return "\x3c!--[ko_memo:"+b+"]--\x3e"},bd:function(a,b){var f=c[a];if(f===p)throw Error("Couldn't find any memo with ID "+a+". Perhaps it's already been unmemoized.");
			try{return f.apply(null,b||[]),!0}finally{delete c[a];}},cd:function(c,e){var f=[];b(c,f);for(var g=0,h=f.length;g<h;g++){var m=f[g].ud,k=[m];e&&a.a.Ob(k,e);a.aa.bd(f[g].Kd,k);m.nodeValue="";m.parentNode&&m.parentNode.removeChild(m);}},Uc:function(a){return (a=a.match(/^\[ko_memo\:(.*?)\]$/))?a[1]:null}}}();a.b("memoization",a.aa);a.b("memoization.memoize",a.aa.Yb);a.b("memoization.unmemoize",a.aa.bd);a.b("memoization.parseMemoText",a.aa.Uc);a.b("memoization.unmemoizeDomNodeAndDescendants",a.aa.cd);
			a.na=function(){function b(){if(f)for(var b=f,c=0,d;h<f;)if(d=e[h++]){if(h>b){if(5E3<=++c){h=f;a.a.Gc(Error("'Too much recursion' after processing "+c+" task groups."));break}b=f;}try{d();}catch(g){a.a.Gc(g);}}}function c(){b();h=f=e.length=0;}var d,e=[],f=0,g=1,h=0;z.MutationObserver?d=function(a){var b=v.createElement("div");(new MutationObserver(a)).observe(b,{attributes:true});return function(){b.classList.toggle("foo");}}(c):d=v&&"onreadystatechange"in v.createElement("script")?function(a){var b=v.createElement("script");
			b.onreadystatechange=function(){b.onreadystatechange=null;v.documentElement.removeChild(b);b=null;a();};v.documentElement.appendChild(b);}:function(a){setTimeout(a,0);};return {scheduler:d,Ab:function(b){f||a.na.scheduler(c);e[f++]=b;return g++},cancel:function(a){a=a-(g-f);a>=h&&a<f&&(e[a]=null);},resetForTesting:function(){var a=f-h;h=f=e.length=0;return a},Sd:b}}();a.b("tasks",a.na);a.b("tasks.schedule",a.na.Ab);a.b("tasks.runEarly",a.na.Sd);a.Va={throttle:function(b,c){b.throttleEvaluation=c;var d=
			null;return a.$({read:b,write:function(e){clearTimeout(d);d=a.a.setTimeout(function(){b(e);},c);}})},rateLimit:function(a,c){var d,e,f;"number"==typeof c?d=c:(d=c.timeout,e=c.method);a.Ib=false;f="function"==typeof e?e:"notifyWhenChangesStop"==e?Z:Y;a.ub(function(a){return f(a,d,c)});},deferred:function(b,c){if(true!==c)throw Error("The 'deferred' extender only accepts the value 'true', because it is not supported to turn deferral off once enabled.");b.Ib||(b.Ib=true,b.ub(function(c){var e,f=false;return function(){if(!f){a.na.cancel(e);
			e=a.na.Ab(c);try{f=!0,b.notifySubscribers(p,"dirty");}finally{f=false;}}}}));},notify:function(a,c){a.equalityComparer="always"==c?null:K;}};var X={undefined:1,"boolean":1,number:1,string:1};a.b("extenders",a.Va);a.ic=function(b,c,d){this.da=b;this.lc=c;this.mc=d;this.Jb=false;this.hb=this.Kb=null;a.L(this,"dispose",this.s);a.L(this,"disposeWhenNodeIsRemoved",this.l);};a.ic.prototype.s=function(){this.Jb||(this.hb&&a.a.J.zb(this.Kb,this.hb),this.Jb=true,this.mc(),this.da=this.lc=this.mc=this.Kb=this.hb=null);};
			a.ic.prototype.l=function(b){this.Kb=b;a.a.J.oa(b,this.hb=this.s.bind(this));};a.T=function(){a.a.Bb(this,D);D.rb(this);};var D={rb:function(a){a.U={change:[]};a.sc=1;},subscribe:function(b,c,d){var e=this;d=d||"change";var f=new a.ic(e,c?b.bind(c):b,function(){a.a.Ra(e.U[d],f);e.jb&&e.jb(d);});e.Sa&&e.Sa(d);e.U[d]||(e.U[d]=[]);e.U[d].push(f);return f},notifySubscribers:function(b,c){c=c||"change";"change"===c&&this.Hb();if(this.Ya(c)){var d="change"===c&&this.ed||this.U[c].slice(0);try{a.u.xc();for(var e=
			0,f;f=d[e];++e)f.Jb||f.lc(b);}finally{a.u.end();}}},qb:function(){return this.sc},Dd:function(a){return this.qb()!==a},Hb:function(){++this.sc;},ub:function(b){var c=this,d=a.O(c),e,f,g,h,m;c.ib||(c.ib=c.notifySubscribers,c.notifySubscribers=aa);var k=b(function(){c.La=false;d&&h===c&&(h=c.nc?c.nc():c());var a=f||m&&c.sb(g,h);m=f=e=false;a&&c.ib(g=h);});c.qc=function(a,b){b&&c.La||(m=!b);c.ed=c.U.change.slice(0);c.La=e=true;h=a;k();};c.pc=function(a){e||(g=a,c.ib(a,"beforeChange"));};c.rc=function(){m=true;};c.gd=
			function(){c.sb(g,c.v(true))&&(f=true);};},Ya:function(a){return this.U[a]&&this.U[a].length},Bd:function(b){if(b)return this.U[b]&&this.U[b].length||0;var c=0;a.a.P(this.U,function(a,b){"dirty"!==a&&(c+=b.length);});return c},sb:function(a,c){return !this.equalityComparer||!this.equalityComparer(a,c)},toString:function(){return "[object Object]"},extend:function(b){var c=this;b&&a.a.P(b,function(b,e){var f=a.Va[b];"function"==typeof f&&(c=f(c,e)||c);});return c}};a.L(D,"init",D.rb);a.L(D,"subscribe",D.subscribe);
			a.L(D,"extend",D.extend);a.L(D,"getSubscriptionsCount",D.Bd);a.a.Ca&&a.a.setPrototypeOf(D,Function.prototype);a.T.fn=D;a.Qc=function(a){return null!=a&&"function"==typeof a.subscribe&&"function"==typeof a.notifySubscribers};a.b("subscribable",a.T);a.b("isSubscribable",a.Qc);a.S=a.u=function(){function b(a){d.push(e);e=a;}function c(){e=d.pop();}var d=[],e,f=0;return {xc:b,end:c,cc:function(b){if(e){if(!a.Qc(b))throw Error("Only subscribable things can act as dependencies");e.od.call(e.pd,b,b.fd||(b.fd=
			++f));}},G:function(a,e,d){try{return b(),a.apply(e,d||[])}finally{c();}},ra:function(){if(e)return e.o.ra()},Xa:function(){if(e)return e.o.Xa()},$a:function(){if(e)return e.$a},o:function(){if(e)return e.o}}}();a.b("computedContext",a.S);a.b("computedContext.getDependenciesCount",a.S.ra);a.b("computedContext.getDependencies",a.S.Xa);a.b("computedContext.isInitial",a.S.$a);a.b("computedContext.registerDependency",a.S.cc);a.b("ignoreDependencies",a.Yd=a.u.G);var I=a.a.Ea("_latestValue");a.va=function(b){function c(){if(0<
			arguments.length)return c.sb(c[I],arguments[0])&&(c.Aa(),c[I]=arguments[0],c.za()),this;a.u.cc(c);return c[I]}c[I]=b;a.a.Ca||a.a.extend(c,a.T.fn);a.T.fn.rb(c);a.a.Bb(c,E);a.options.deferUpdates&&a.Va.deferred(c,true);return c};var E={equalityComparer:K,v:function(){return this[I]},za:function(){this.notifySubscribers(this[I],"spectate");this.notifySubscribers(this[I]);},Aa:function(){this.notifySubscribers(this[I],"beforeChange");}};a.a.Ca&&a.a.setPrototypeOf(E,a.T.fn);var J=a.va.Oa="__ko_proto__";E[J]=
			a.va;a.O=function(b){if((b="function"==typeof b&&b[J])&&b!==E[J]&&b!==a.o.fn[J])throw Error("Invalid object that looks like an observable; possibly from another Knockout instance");return !!b};a.ab=function(b){return "function"==typeof b&&(b[J]===E[J]||b[J]===a.o.fn[J]&&b.Nc)};a.b("observable",a.va);a.b("isObservable",a.O);a.b("isWriteableObservable",a.ab);a.b("isWritableObservable",a.ab);a.b("observable.fn",E);a.L(E,"peek",E.v);a.L(E,"valueHasMutated",E.za);a.L(E,"valueWillMutate",E.Aa);a.Ja=function(b){b=
			b||[];if("object"!=typeof b||!("length"in b))throw Error("The argument passed when initializing an observable array must be an array, or null, or undefined.");b=a.va(b);a.a.Bb(b,a.Ja.fn);return b.extend({trackArrayChanges:true})};a.Ja.fn={remove:function(b){for(var c=this.v(),d=[],e="function"!=typeof b||a.O(b)?function(a){return a===b}:b,f=0;f<c.length;f++){var g=c[f];if(e(g)){0===d.length&&this.Aa();if(c[f]!==g)throw Error("Array modified during remove; cannot remove item");d.push(g);c.splice(f,1);
			f--;}}d.length&&this.za();return d},removeAll:function(b){if(b===p){var c=this.v(),d=c.slice(0);this.Aa();c.splice(0,c.length);this.za();return d}return b?this.remove(function(c){return 0<=a.a.A(b,c)}):[]},destroy:function(b){var c=this.v(),d="function"!=typeof b||a.O(b)?function(a){return a===b}:b;this.Aa();for(var e=c.length-1;0<=e;e--){var f=c[e];d(f)&&(f._destroy=true);}this.za();},destroyAll:function(b){return b===p?this.destroy(function(){return  true}):b?this.destroy(function(c){return 0<=a.a.A(b,c)}):
			[]},indexOf:function(b){var c=this();return a.a.A(c,b)},replace:function(a,c){var d=this.indexOf(a);0<=d&&(this.Aa(),this.v()[d]=c,this.za());},sorted:function(a){var c=this().slice(0);return a?c.sort(a):c.sort()},reversed:function(){return this().slice(0).reverse()}};a.a.Ca&&a.a.setPrototypeOf(a.Ja.fn,a.va.fn);a.a.D("pop push reverse shift sort splice unshift".split(" "),function(b){a.Ja.fn[b]=function(){var a=this.v();this.Aa();this.zc(a,b,arguments);var d=a[b].apply(a,arguments);this.za();return d===
			a?this:d};});a.a.D(["slice"],function(b){a.Ja.fn[b]=function(){var a=this();return a[b].apply(a,arguments)};});a.Pc=function(b){return a.O(b)&&"function"==typeof b.remove&&"function"==typeof b.push};a.b("observableArray",a.Ja);a.b("isObservableArray",a.Pc);a.Va.trackArrayChanges=function(b,c){function d(){function c(){if(m){var e=[].concat(b.v()||[]),d;if(b.Ya("arrayChange")){if(!f||1<m)f=a.a.Qb(k,e,b.Pb);d=f;}k=e;f=null;m=0;d&&d.length&&b.notifySubscribers(d,"arrayChange");}}e?c():(e=true,h=b.subscribe(function(){++m;},
			null,"spectate"),k=[].concat(b.v()||[]),f=null,g=b.subscribe(c));}b.Pb={};c&&"object"==typeof c&&a.a.extend(b.Pb,c);b.Pb.sparse=true;if(!b.zc){var e=false,f=null,g,h,m=0,k,l=b.Sa,q=b.jb;b.Sa=function(a){l&&l.call(b,a);"arrayChange"===a&&d();};b.jb=function(a){q&&q.call(b,a);"arrayChange"!==a||b.Ya("arrayChange")||(g&&g.s(),h&&h.s(),h=g=null,e=false,k=p);};b.zc=function(b,c,d){function l(a,b,c){return k[k.length]={status:a,value:b,index:c}}if(e&&!m){var k=[],g=b.length,q=d.length,h=0;switch(c){case "push":h=
			g;case "unshift":for(c=0;c<q;c++)l("added",d[c],h+c);break;case "pop":h=g-1;case "shift":g&&l("deleted",b[h],h);break;case "splice":c=Math.min(Math.max(0,0>d[0]?g+d[0]:d[0]),g);for(var g=1===q?g:Math.min(c+(d[1]||0),g),q=c+q-2,h=Math.max(g,q),U=[],V=[],p=2;c<h;++c,++p)c<g&&V.push(l("deleted",b[c],c)),c<q&&U.push(l("added",d[p],c));a.a.Kc(V,U);break;default:return}f=k;}};}};var t=a.a.Ea("_state");a.o=a.$=function(b,c,d){function e(){if(0<arguments.length){if("function"===typeof f)f.apply(g.pb,arguments);
			else throw Error("Cannot write a value to a ko.computed unless you specify a 'write' option. If you wish to read the current value, don't pass any parameters.");return this}g.ta||a.u.cc(e);(g.ka||g.K&&e.Za())&&e.ha();return g.X}"object"===typeof b?d=b:(d=d||{},b&&(d.read=b));if("function"!=typeof d.read)throw Error("Pass a function that returns the value of the ko.computed");var f=d.write,g={X:p,ua:true,ka:true,sa:false,jc:false,ta:false,xb:false,K:false,Wc:d.read,pb:c||d.owner,l:d.disposeWhenNodeIsRemoved||d.l||null,
			Ua:d.disposeWhen||d.Ua,Sb:null,I:{},V:0,Ic:null};e[t]=g;e.Nc="function"===typeof f;a.a.Ca||a.a.extend(e,a.T.fn);a.T.fn.rb(e);a.a.Bb(e,B);d.pure?(g.xb=true,g.K=true,a.a.extend(e,da)):d.deferEvaluation&&a.a.extend(e,ea);a.options.deferUpdates&&a.Va.deferred(e,true);g.l&&(g.jc=true,g.l.nodeType||(g.l=null));g.K||d.deferEvaluation||e.ha();g.l&&e.ja()&&a.a.J.oa(g.l,g.Sb=function(){e.s();});return e};var B={equalityComparer:K,ra:function(){return this[t].V},Xa:function(){var b=[];a.a.P(this[t].I,function(a,d){b[d.Ma]=
			d.da;});return b},Wb:function(b){if(!this[t].V)return  false;var c=this.Xa();return  -1!==a.a.A(c,b)?true:!!a.a.Mb(c,function(a){return a.Wb&&a.Wb(b)})},uc:function(a,c,d){if(this[t].xb&&c===this)throw Error("A 'pure' computed must not be called recursively");this[t].I[a]=d;d.Ma=this[t].V++;d.Na=c.qb();},Za:function(){var a=this[t];if(a.sa)return  false;a.sa=true;try{var c,d,e=a.I;for(c in e)if(Object.prototype.hasOwnProperty.call(e,c)&&(d=e[c],this.Ka&&d.da.La||d.da.Dd(d.Na)))return !0}finally{a.sa=false;}},Jd:function(){this.Ka&&
			!this[t].sa&&this.Ka(false);},ja:function(){var a=this[t];return a.ka||0<a.V},Rd:function(){this.La?this[t].ka&&(this[t].ua=true):this.Hc();},$c:function(a){if(a.Ib){var c=a.subscribe(this.Jd,this,"dirty"),d=a.subscribe(this.Rd,this);return {da:a,s:function(){c.s();d.s();}}}return a.subscribe(this.Hc,this)},Hc:function(){var b=this,c=b.throttleEvaluation;c&&0<=c?(clearTimeout(this[t].Ic),this[t].Ic=a.a.setTimeout(function(){b.ha(true);},c)):b.Ka?b.Ka(true):b.ha(true);},ha:function(b){var c=this[t],d=c.Ua,e=false;if(!c.sa&&
			!c.ta){if(c.l&&!a.a.Tb(c.l)||d&&d()){if(!c.jc){this.s();return}}else c.jc=false;c.sa=true;try{e=this.zd(b);}finally{c.sa=false;}return e}},zd:function(b){var c=this[t],d=false,e=c.xb?p:!c.V,d={qd:this,ob:c.I,Rb:c.V};a.u.xc({pd:d,od:ca,o:this,$a:e});c.I={};c.V=0;var f=this.yd(c,d);c.V?d=this.sb(c.X,f):(this.s(),d=true);d&&(c.K?this.Hb():this.notifySubscribers(c.X,"beforeChange"),c.X=f,this.notifySubscribers(c.X,"spectate"),!c.K&&b&&this.notifySubscribers(c.X),this.rc&&this.rc());e&&this.notifySubscribers(c.X,"awake");
			return d},yd:function(b,c){try{var d=b.Wc;return b.pb?d.call(b.pb):d()}finally{a.u.end(),c.Rb&&!b.K&&a.a.P(c.ob,ba),b.ua=b.ka=false;}},v:function(a){var c=this[t];(c.ka&&(a||!c.V)||c.K&&this.Za())&&this.ha();return c.X},ub:function(b){a.T.fn.ub.call(this,b);this.nc=function(){this[t].K||(this[t].ua?this.ha():this[t].ka=false);return this[t].X};this.Ka=function(a){this.pc(this[t].X);this[t].ka=true;a&&(this[t].ua=true);this.qc(this,!a);};},s:function(){var b=this[t];!b.K&&b.I&&a.a.P(b.I,function(a,b){b.s&&b.s();});
			b.l&&b.Sb&&a.a.J.zb(b.l,b.Sb);b.I=p;b.V=0;b.ta=true;b.ua=false;b.ka=false;b.K=false;b.l=p;b.Ua=p;b.Wc=p;this.Nc||(b.pb=p);}},da={Sa:function(b){var c=this,d=c[t];if(!d.ta&&d.K&&"change"==b){d.K=false;if(d.ua||c.Za())d.I=null,d.V=0,c.ha()&&c.Hb();else {var e=[];a.a.P(d.I,function(a,b){e[b.Ma]=a;});a.a.D(e,function(a,b){var e=d.I[a],m=c.$c(e.da);m.Ma=b;m.Na=e.Na;d.I[a]=m;});c.Za()&&c.ha()&&c.Hb();}d.ta||c.notifySubscribers(d.X,"awake");}},jb:function(b){var c=this[t];c.ta||"change"!=b||this.Ya("change")||(a.a.P(c.I,function(a,
			b){b.s&&(c.I[a]={da:b.da,Ma:b.Ma,Na:b.Na},b.s());}),c.K=true,this.notifySubscribers(p,"asleep"));},qb:function(){var b=this[t];b.K&&(b.ua||this.Za())&&this.ha();return a.T.fn.qb.call(this)}},ea={Sa:function(a){"change"!=a&&"beforeChange"!=a||this.v();}};a.a.Ca&&a.a.setPrototypeOf(B,a.T.fn);var O=a.va.Oa;B[O]=a.o;a.Oc=function(a){return "function"==typeof a&&a[O]===B[O]};a.Fd=function(b){return a.Oc(b)&&b[t]&&b[t].xb};a.b("computed",a.o);a.b("dependentObservable",a.o);a.b("isComputed",a.Oc);a.b("isPureComputed",
			a.Fd);a.b("computed.fn",B);a.L(B,"peek",B.v);a.L(B,"dispose",B.s);a.L(B,"isActive",B.ja);a.L(B,"getDependenciesCount",B.ra);a.L(B,"getDependencies",B.Xa);a.yb=function(b,c){if("function"===typeof b)return a.o(b,c,{pure:true});b=a.a.extend({},b);b.pure=true;return a.o(b,c)};a.b("pureComputed",a.yb);(function(){function b(a,f,g){g=g||new d;a=f(a);if("object"!=typeof a||null===a||a===p||a instanceof RegExp||a instanceof Date||a instanceof String||a instanceof Number||a instanceof Boolean)return a;var h=
			a instanceof Array?[]:{};g.save(a,h);c(a,function(c){var d=f(a[c]);switch(typeof d){case "boolean":case "number":case "string":case "bigint":case "symbol":case "function":h[c]=d;break;case "object":case "undefined":var l=g.get(d);h[c]=l!==p?l:b(d,f,g);}});return h}function c(a,b){if(a instanceof Array){for(var c=0;c<a.length;c++)b(c);"function"==typeof a.toJSON&&b("toJSON");}else for(c in a)b(c);}function d(){this.keys=[];this.values=[];}a.ad=function(c){if(0==arguments.length)throw Error("When calling ko.toJS, pass the object you want to convert.");
			return b(c,function(b){for(var c=0;a.O(b)&&10>c;c++)b=b();return b})};a.toJSON=function(b,c,d){b=a.ad(b);return a.a.hc(b,c,d)};d.prototype={constructor:d,save:function(b,c){var d=a.a.A(this.keys,b);0<=d?this.values[d]=c:(this.keys.push(b),this.values.push(c));},get:function(b){b=a.a.A(this.keys,b);return 0<=b?this.values[b]:p}};})();a.b("toJS",a.ad);a.b("toJSON",a.toJSON);a.Wd=function(b,c,d){function e(c){var e=a.yb(b,d).extend({ma:"always"}),h=e.subscribe(function(a){a&&(h.s(),c(a));});e.notifySubscribers(e.v());
			return h}return "function"!==typeof Promise||c?e(c.bind(d)):new Promise(e)};a.b("when",a.Wd);(function(){a.w={M:function(b){switch(a.a.R(b)){case "option":return  true===b.__ko__hasDomDataOptionValue__?a.a.g.get(b,a.c.options.$b):7>=a.a.W?b.getAttributeNode("value")&&b.getAttributeNode("value").specified?b.value:b.text:b.value;case "select":return 0<=b.selectedIndex?a.w.M(b.options[b.selectedIndex]):p;default:return b.value}},fb:function(b,c,d){switch(a.a.R(b)){case "option":"string"===typeof c?(a.a.g.set(b,
			a.c.options.$b,p),"__ko__hasDomDataOptionValue__"in b&&delete b.__ko__hasDomDataOptionValue__,b.value=c):(a.a.g.set(b,a.c.options.$b,c),b.__ko__hasDomDataOptionValue__=true,b.value="number"===typeof c?c:"");break;case "select":if(""===c||null===c)c=p;for(var e=-1,f=0,g=b.options.length,h;f<g;++f)if(h=a.w.M(b.options[f]),h==c||""===h&&c===p){e=f;break}if(d||0<=e||c===p&&1<b.size)b.selectedIndex=e,6===a.a.W&&a.a.setTimeout(function(){b.selectedIndex=e;},0);break;default:if(null===c||c===p)c="";b.value=
			c;}}};})();a.b("selectExtensions",a.w);a.b("selectExtensions.readValue",a.w.M);a.b("selectExtensions.writeValue",a.w.fb);a.m=function(){function b(b){b=a.a.Eb(b);123===b.charCodeAt(0)&&(b=b.slice(1,-1));b+="\n,";var c=[],d=b.match(e),q,n=[],h=0;if(1<d.length){for(var y=0,C;C=d[y];++y){var u=C.charCodeAt(0);if(44===u){if(0>=h){c.push(q&&n.length?{key:q,value:n.join("")}:{unknown:q||n.join("")});q=h=0;n=[];continue}}else if(58===u){if(!h&&!q&&1===n.length){q=n.pop();continue}}else if(47===u&&1<C.length&&
			(47===C.charCodeAt(1)||42===C.charCodeAt(1)))continue;else 47===u&&y&&1<C.length?(u=d[y-1].match(f))&&!g[u[0]]&&(b=b.substr(b.indexOf(C)+1),d=b.match(e),y=-1,C="/"):40===u||123===u||91===u?++h:41===u||125===u||93===u?--h:q||n.length||34!==u&&39!==u||(C=C.slice(1,-1));n.push(C);}if(0<h)throw Error("Unbalanced parentheses, braces, or brackets");}return c}var c=["true","false","null","undefined"],d=/^(?:[$_a-z][$\w]*|(.+)(\.\s*[$_a-z][$\w]*|\[.+\]))$/i,e=RegExp("\"(?:\\\\.|[^\"])*\"|'(?:\\\\.|[^'])*'|`(?:\\\\.|[^`])*`|/\\*(?:[^*]|\\*+[^*/])*\\*+/|//.*\n|/(?:\\\\.|[^/])+/w*|[^\\s:,/][^,\"'`{}()/:[\\]]*[^\\s,\"'`{}()/:[\\]]|[^\\s]",
			"g"),f=/[\])"'A-Za-z0-9_$]+$/,g={"in":1,"return":1,"typeof":1},h={};return {Ta:[],ya:h,ac:b,wb:function(e,f){function l(b,e){var f;if(!y){var k=a.getBindingHandler(b);if(k&&k.preprocess&&!(e=k.preprocess(e,b,l)))return;if(k=h[b])f=e,0<=a.a.A(c,f)?f=false:(k=f.match(d),f=null===k?false:k[1]?"Object("+k[1]+")"+k[2]:f),k=f;k&&n.push("'"+("string"==typeof h[b]?h[b]:b)+"':function(_z){"+f+"=_z}");}g&&(e="function(){return "+e+" }");q.push("'"+b+"':"+e);}f=f||{};var q=[],n=[],g=f.valueAccessors,y=f.bindingParams,
			C="string"===typeof e?b(e):e;a.a.D(C,function(a){l(a.key||a.unknown,a.value);});n.length&&l("_ko_property_writers","{"+n.join(",")+" }");return q.join(",")},Id:function(a,b){for(var c=0;c<a.length;c++)if(a[c].key==b)return  true;return  false},gb:function(b,c,e,d,f){if(b&&a.O(b))!a.ab(b)||f&&b.v()===d||b(d);else if((b=c.get("_ko_property_writers"))&&b[e])b[e](d);}}}();a.b("expressionRewriting",a.m);a.b("expressionRewriting.bindingRewriteValidators",a.m.Ta);a.b("expressionRewriting.parseObjectLiteral",a.m.ac);
			a.b("expressionRewriting.preProcessBindings",a.m.wb);a.b("expressionRewriting._twoWayBindings",a.m.ya);a.b("jsonExpressionRewriting",a.m);a.b("jsonExpressionRewriting.insertPropertyAccessorsIntoJson",a.m.wb);(function(){function b(a){return 8==a.nodeType&&g.test(f?a.text:a.nodeValue)}function c(a){return 8==a.nodeType&&h.test(f?a.text:a.nodeValue)}function d(e,d){for(var f=e,h=1,g=[];f=f.nextSibling;){if(c(f)&&(a.a.g.set(f,k,true),h--,0===h))return g;g.push(f);b(f)&&h++;}if(!d)throw Error("Cannot find closing comment tag to match: "+
			e.nodeValue);return null}function e(a,b){var c=d(a,b);return c?0<c.length?c[c.length-1].nextSibling:a.nextSibling:null}var f=v&&"\x3c!--test--\x3e"===v.createComment("test").text,g=f?/^\x3c!--\s*ko(?:\s+([\s\S]+))?\s*--\x3e$/:/^\s*ko(?:\s+([\s\S]+))?\s*$/,h=f?/^\x3c!--\s*\/ko\s*--\x3e$/:/^\s*\/ko\s*$/,m={ul:true,ol:true},k="__ko_matchedEndComment__";a.h={ea:{},childNodes:function(a){return b(a)?d(a):a.childNodes},Fa:function(c){if(b(c)){c=a.h.childNodes(c);for(var e=0,d=c.length;e<d;e++)a.removeNode(c[e]);}else a.a.Ub(c);},
			xa:function(c,e){if(b(c)){a.h.Fa(c);for(var d=c.nextSibling,f=0,k=e.length;f<k;f++)d.parentNode.insertBefore(e[f],d);}else a.a.xa(c,e);},Vc:function(a,c){var e;b(a)?(e=a.nextSibling,a=a.parentNode):e=a.firstChild;e?c!==e&&a.insertBefore(c,e):a.appendChild(c);},Xb:function(c,e,d){d?(d=d.nextSibling,b(c)&&(c=c.parentNode),d?e!==d&&c.insertBefore(e,d):c.appendChild(e)):a.h.Vc(c,e);},firstChild:function(a){return b(a)?!a.nextSibling||c(a.nextSibling)?null:a.nextSibling:a.firstChild&&c(a.firstChild)?a.firstChild.nextSibling:
			a.firstChild},nextSibling:function(d){b(d)&&(d=e(d));return d.nextSibling&&c(d.nextSibling)?(d=d.nextSibling,c(d)&&a.a.g.get(d,k),null):d.nextSibling},Cd:b,Vd:function(a){return (a=(f?a.text:a.nodeValue).match(g))?a[1]:null},Sc:function(d){if(m[a.a.R(d)]){var f=d.firstChild;if(f){do if(1===f.nodeType){var k;k=f.firstChild;var h=null;if(k){do if(h)h.push(k);else if(b(k)){var g=e(k,true);g?k=g:h=[k];}else c(k)&&(h=[k]);while(k=k.nextSibling)}if(k=h)for(h=f.nextSibling,g=0;g<k.length;g++)h?d.insertBefore(k[g],
			h):d.appendChild(k[g]);}while(f=f.nextSibling)}}}};})();a.b("virtualElements",a.h);a.b("virtualElements.allowedBindings",a.h.ea);a.b("virtualElements.emptyNode",a.h.Fa);a.b("virtualElements.insertAfter",a.h.Xb);a.b("virtualElements.prepend",a.h.Vc);a.b("virtualElements.setDomNodeChildren",a.h.xa);(function(){function b(b,d){var e="with($context){with($data||{}){return{"+a.m.wb(b,d)+"}}}";return H?(0, eval)(H.createScript("(function($context,$element){"+e+"})")):new Function("$context","$element",e)}
			a.ga=function(){this.nd={};};a.a.extend(a.ga.prototype,{nodeHasBindings:function(b){switch(b.nodeType){case 1:return null!=b.getAttribute("data-bind")||a.j.getComponentNameForNode(b);case 8:return a.h.Cd(b);default:return  false}},getBindings:function(b,d){var e=this.getBindingsString(b,d),e=e?this.parseBindingsString(e,d,b):null;return a.j.tc(e,b,d,false)},getBindingAccessors:function(b,d){var e=this.getBindingsString(b,d),e=e?this.parseBindingsString(e,d,b,{valueAccessors:true}):null;return a.j.tc(e,b,d,true)},
			getBindingsString:function(b){switch(b.nodeType){case 1:return b.getAttribute("data-bind");case 8:return a.h.Vd(b);default:return null}},parseBindingsString:function(a,d,e,f){try{var g=this.nd,h=a+(f&&f.valueAccessors||"");return (g[h]||(g[h]=b(a,f)))(d,e)}catch(m){throw m.message="Unable to parse bindings.\nBindings value: "+a+"\nMessage: "+m.message,m;}}});a.ga.instance=new a.ga;})();a.b("bindingProvider",a.ga);(function(){function b(b){var c=(b=a.a.g.get(b,A))&&b.N;c&&(b.N=null,c.Tc());}function c(c,
			d,e){this.node=c;this.yc=d;this.mb=[];this.H=false;d.N||a.a.J.oa(c,b);e&&e.N&&(e.N.mb.push(c),this.Lb=e);}function d(a){return function(){return a}}function e(a){return a()}function f(b){return a.a.Ia(a.u.G(b),function(a,c){return function(){return b()[c]}})}function g(b,c,e){return "function"===typeof b?f(b.bind(null,c,e)):a.a.Ia(b,d)}function h(a,b){return f(this.getBindings.bind(this,a,b))}function m(b,c){var e=a.h.firstChild(c);if(e){var d,f=a.ga.instance,l=f.preprocessNode;if(l){for(;d=e;)e=a.h.nextSibling(d),
			l.call(f,d);e=a.h.firstChild(c);}for(;d=e;)e=a.h.nextSibling(d),k(b,d);}a.i.ma(c,a.i.H);}function k(b,c){var e=b,d=1===c.nodeType;d&&a.h.Sc(c);if(d||a.ga.instance.nodeHasBindings(c))e=q(c,null,b).bindingContextForDescendants;e&&!u[a.a.R(c)]&&m(e,c);}function l(b){var c=[],e={},d=[];a.a.P(b,function x(f){if(!e[f]){var k=a.getBindingHandler(f);k&&(k.after&&(d.push(f),a.a.D(k.after,function(c){if(b[c]){if(-1!==a.a.A(d,c))throw Error("Cannot combine the following bindings, because they have a cyclic dependency: "+
			d.join(", "));x(c);}}),d.length--),c.push({key:f,Mc:k}));e[f]=true;}});return c}function q(b,c,d){var f=a.a.g.Vb(b,A,{}),k=f.hd;if(!c){if(k)throw Error("You cannot apply bindings multiple times to the same element.");f.hd=true;}k||(f.context=d);f.vb||(f.vb={});var g;if(c&&"function"!==typeof c)g=c;else {var q=a.ga.instance,n=q.getBindingAccessors||h,m=a.$(function(){if(g=c?c(d,b):n.call(q,b,d)){if(d[r])d[r]();if(d[C])d[C]();}return g},null,{l:b});g&&m.ja()||(m=null);}var y=d,u;if(g){var L=m?function(a){return function(){return e(m()[a])}}:
			function(a){return g[a]},t=function(){return a.a.Ia(m?m():g,e)};t.get=function(a){return g[a]&&e(L(a))};t.has=function(a){return a in g};a.i.H in g&&a.i.subscribe(b,a.i.H,function(){var c=(0, g[a.i.H])();if(c){var d=a.h.childNodes(b);d.length&&c(d,a.Ec(d[0]));}});a.i.qa in g&&(y=a.i.Db(b,d),a.i.subscribe(b,a.i.qa,function(){var c=(0, g[a.i.qa])();c&&a.h.firstChild(b)&&c(b);}));f=l(g);a.a.D(f,function(c){var d=c.Mc.init,e=c.Mc.update,f=c.key;if(8===b.nodeType&&!a.h.ea[f])throw Error("The binding '"+f+
			"' cannot be used with virtual elements");try{"function"==typeof d&&a.u.G(function(){var a=d(b,L(f),t,y.$data,y);if(a&&a.controlsDescendantBindings){if(u!==p)throw Error("Multiple bindings ("+u+" and "+f+") are trying to control descendant bindings of the same element. You cannot use these bindings together on the same element.");u=f;}}),"function"==typeof e&&a.$(function(){e(b,L(f),t,y.$data,y);},null,{l:b});}catch(k){throw k.message='Unable to process binding "'+f+": "+g[f]+'"\nMessage: '+k.message,
			k;}});}f=u===p;return {shouldBindDescendants:f,bindingContextForDescendants:f&&y}}function n(b,c){return b&&b instanceof a.fa?b:new a.fa(b,p,p,c)}var r=a.a.Ea("_subscribable"),y=a.a.Ea("_ancestorBindingInfo"),C=a.a.Ea("_dataDependency");a.c={};var u={script:true,textarea:true,template:true};a.getBindingHandler=function(b){return a.c[b]};var L={};a.fa=function(b,c,d,e,f){function k(){var b=q?h():h,f=a.a.f(b);c?(a.a.extend(l,c),y in c&&(l[y]=c[y])):(l.$parents=[],l.$root=f,l.ko=a);l[r]=n;g?f=l.$data:(l.$rawData=
			b,l.$data=f);d&&(l[d]=f);e&&e(l,c,f);if(c&&c[r]&&!a.S.o().Wb(c[r]))c[r]();m&&(l[C]=m);return l.$data}var l=this,g=b===L,h=g?p:b,q="function"==typeof h&&!a.O(h),n,m=f&&f.dataDependency;f&&f.exportDependencies?k():(n=a.yb(k),n.v(),n.ja()?n.equalityComparer=null:l[r]=p);};a.fa.prototype.createChildContext=function(b,c,d,e){!e&&c&&"object"==typeof c&&(e=c,c=e.as,d=e.extend);if(c&&e&&e.noChildContext){var f="function"==typeof b&&!a.O(b);return new a.fa(L,this,null,function(a){d&&d(a);a[c]=f?b():b;},e)}return new a.fa(b,
			this,c,function(a,b){a.$parentContext=b;a.$parent=b.$data;a.$parents=(b.$parents||[]).slice(0);a.$parents.unshift(a.$parent);d&&d(a);},e)};a.fa.prototype.extend=function(b,c){return new a.fa(L,this,null,function(c){a.a.extend(c,"function"==typeof b?b(c):b);},c)};var A=a.a.g.Z();c.prototype.Tc=function(){this.Lb&&this.Lb.N&&this.Lb.N.sd(this.node);};c.prototype.sd=function(b){a.a.Ra(this.mb,b);!this.mb.length&&this.H&&this.Cc();};c.prototype.Cc=function(){this.H=true;this.yc.N&&!this.mb.length&&(this.yc.N=
			null,a.a.J.zb(this.node,b),a.i.ma(this.node,a.i.qa),this.Tc());};a.i={H:"childrenComplete",qa:"descendantsComplete",subscribe:function(b,c,d,e,f){var k=a.a.g.Vb(b,A,{});k.Ga||(k.Ga=new a.T);f&&f.notifyImmediately&&k.vb&&k.vb[c]&&a.u.G(d,e,[b]);return k.Ga.subscribe(d,e,c)},ma:function(b,c){var d=a.a.g.get(b,A);if(d&&(d.vb[c]=true,d.Ga&&d.Ga.notifySubscribers(b,c),c==a.i.H))if(d.N)d.N.Cc();else if(d.N===p&&d.Ga&&d.Ga.Ya(a.i.qa))throw Error("descendantsComplete event not supported for bindings on this node");
			},Db:function(b,d){var e=a.a.g.Vb(b,A,{});e.N||(e.N=new c(b,e,d[y]));return d[y]==e?d:d.extend(function(a){a[y]=e;})}};a.Td=function(b){return (b=a.a.g.get(b,A))&&b.context};a.kb=function(b,c,d){1===b.nodeType&&a.h.Sc(b);return q(b,c,n(d))};a.ld=function(b,c,d){d=n(d);return a.kb(b,g(c,d,b),d)};a.Qa=function(a,b){1!==b.nodeType&&8!==b.nodeType||m(n(a),b);};a.vc=function(a,b,c){!w&&z.jQuery&&(w=z.jQuery);if(2>arguments.length){if(b=v.body,!b)throw Error("ko.applyBindings: could not find document.body; has the document been loaded?");
			}else if(!b||1!==b.nodeType&&8!==b.nodeType)throw Error("ko.applyBindings: first parameter should be your view model; second parameter should be a DOM node");k(n(a,c),b);};a.Dc=function(b){return !b||1!==b.nodeType&&8!==b.nodeType?p:a.Td(b)};a.Ec=function(b){return (b=a.Dc(b))?b.$data:p};a.b("bindingHandlers",a.c);a.b("bindingEvent",a.i);a.b("bindingEvent.subscribe",a.i.subscribe);a.b("bindingEvent.startPossiblyAsyncContentBinding",a.i.Db);a.b("applyBindings",a.vc);a.b("applyBindingsToDescendants",a.Qa);
			a.b("applyBindingAccessorsToNode",a.kb);a.b("applyBindingsToNode",a.ld);a.b("contextFor",a.Dc);a.b("dataFor",a.Ec);})();(function(b){function c(c,e){var k=Object.prototype.hasOwnProperty.call(f,c)?f[c]:b,l;k?k.subscribe(e):(k=f[c]=new a.T,k.subscribe(e),d(c,function(b,d){var e=!(!d||!d.synchronous);g[c]={definition:b,Gd:e};delete f[c];l||e?k.notifySubscribers(b):a.na.Ab(function(){k.notifySubscribers(b);});}),l=true);}function d(a,b){e("getConfig",[a],function(c){c?e("loadComponent",[a,c],function(a){b(a,
			c);}):b(null,null);});}function e(c,d,f,l){l||(l=a.j.loaders.slice(0));var g=l.shift();if(g){var n=g[c];if(n){var r=false;if(n.apply(g,d.concat(function(a){r?f(null):null!==a?f(a):e(c,d,f,l);}))!==b&&(r=true,!g.suppressLoaderExceptions))throw Error("Component loaders must supply values by invoking the callback, not by returning values synchronously.");}else e(c,d,f,l);}else f(null);}var f={},g={};a.j={get:function(d,e){var f=Object.prototype.hasOwnProperty.call(g,d)?g[d]:b;f?f.Gd?a.u.G(function(){e(f.definition);}):
			a.na.Ab(function(){e(f.definition);}):c(d,e);},Bc:function(a){delete g[a];},oc:e};a.j.loaders=[];a.b("components",a.j);a.b("components.get",a.j.get);a.b("components.clearCachedDefinition",a.j.Bc);})();(function(){function b(b,c,d,e){function g(){0===--C&&e(h);}var h={},C=2,u=d.template;d=d.viewModel;u?f(c,u,function(c){a.j.oc("loadTemplate",[b,c],function(a){h.template=a;g();});}):g();d?f(c,d,function(c){a.j.oc("loadViewModel",[b,c],function(a){h[m]=a;g();});}):g();}function c(a,b,d){if("function"===typeof b)d(function(a){return new b(a)});
			else if("function"===typeof b[m])d(b[m]);else if("instance"in b){var e=b.instance;d(function(){return e});}else "viewModel"in b?c(a,b.viewModel,d):a("Unknown viewModel value: "+b);}function d(b){switch(a.a.R(b)){case "script":return a.a.wa(b.text);case "textarea":return a.a.wa(b.value);case "template":if(e(b.content))return a.a.Da(b.content.childNodes)}return a.a.Da(b.childNodes)}function e(a){return z.DocumentFragment?a instanceof DocumentFragment:a&&11===a.nodeType}function f(a,b,c){"string"===typeof b.require?
			T||z.require?(T||z.require)([b.require],function(a){a&&"object"===typeof a&&a.Xd&&a["default"]&&(a=a["default"]);c(a);}):a("Uses require, but no AMD loader is present"):c(b);}function g(a){return function(b){throw Error("Component '"+a+"': "+b);}}var h={};a.j.register=function(b,c){if(!c)throw Error("Invalid configuration for "+b);if(a.j.tb(b))throw Error("Component "+b+" is already registered");h[b]=c;};a.j.tb=function(a){return Object.prototype.hasOwnProperty.call(h,a)};a.j.unregister=function(b){delete h[b];
			a.j.Bc(b);};a.j.Fc={getConfig:function(b,c){c(a.j.tb(b)?h[b]:null);},loadComponent:function(a,c,d){var e=g(a);f(e,c,function(c){b(a,e,c,d);});},loadTemplate:function(b,c,f){b=g(b);if("string"===typeof c)f(a.a.wa(c));else if(c instanceof Array)f(c);else if(e(c))f(a.a.la(c.childNodes));else if(c.element)if(c=c.element,z.HTMLElement?c instanceof HTMLElement:c&&c.tagName&&1===c.nodeType)f(d(c));else if("string"===typeof c){var h=v.getElementById(c);h?f(d(h)):b("Cannot find element with ID "+c);}else b("Unknown element type: "+
			c);else b("Unknown template value: "+c);},loadViewModel:function(a,b,d){c(g(a),b,d);}};var m="createViewModel";a.b("components.register",a.j.register);a.b("components.isRegistered",a.j.tb);a.b("components.unregister",a.j.unregister);a.b("components.defaultLoader",a.j.Fc);a.j.loaders.push(a.j.Fc);a.j.dd=h;})();(function(){function b(b,e){var f=b.getAttribute("params");if(f){var f=c.parseBindingsString(f,e,b,{valueAccessors:true,bindingParams:true}),f=a.a.Ia(f,function(c){return a.o(c,null,{l:b})}),g=a.a.Ia(f,
			function(c){var e=c.v();return c.ja()?a.o({read:function(){return a.a.f(c())},write:a.ab(e)&&function(a){c()(a);},l:b}):e});Object.prototype.hasOwnProperty.call(g,"$raw")||(g.$raw=f);return g}return {$raw:{}}}a.j.getComponentNameForNode=function(b){var c=a.a.R(b);if(a.j.tb(c)&&(-1!=c.indexOf("-")||"[object HTMLUnknownElement]"==""+b||8>=a.a.W&&b.tagName===c))return c};a.j.tc=function(c,e,f,g){if(1===e.nodeType){var h=a.j.getComponentNameForNode(e);if(h){c=c||{};if(c.component)throw Error('Cannot use the "component" binding on a custom element matching a component');
			var m={name:h,params:b(e,f)};c.component=g?function(){return m}:m;}}return c};var c=new a.ga;9>a.a.W&&(a.j.register=function(a){return function(b){return a.apply(this,arguments)}}(a.j.register),v.createDocumentFragment=function(b){return function(){var c=b();a.j.dd;return c}}(v.createDocumentFragment));})();(function(){function b(b,c,d){c=c.template;if(!c)throw Error("Component '"+b+"' has no template");b=a.a.Da(c);a.h.xa(d,b);}function c(a,b,c){var d=a.createViewModel;return d?d.call(a,
			b,c):b}var d=0;a.c.component={init:function(e,f,g,h,m){function k(){var a=l&&l.dispose;"function"===typeof a&&a.call(l);n&&n.s();q=l=n=null;}var l,q,n,r=a.a.la(a.h.childNodes(e));a.h.Fa(e);a.a.J.oa(e,k);a.o(function(){var g=a.a.f(f()),h,u;"string"===typeof g?h=g:(h=a.a.f(g.name),u=a.a.f(g.params));if(!h)throw Error("No component name specified");var p=a.i.Db(e,m),A=q=++d;a.j.get(h,function(d){if(q===A){k();if(!d)throw Error("Unknown component '"+h+"'");b(h,d,e);var f=c(d,u,{element:e,templateNodes:r});
			d=p.createChildContext(f,{extend:function(a){a.$component=f;a.$componentTemplateNodes=r;}});f&&f.koDescendantsComplete&&(n=a.i.subscribe(e,a.i.qa,f.koDescendantsComplete,f));l=f;a.Qa(d,e);}});},null,{l:e});return {controlsDescendantBindings:true}}};a.h.ea.component=true;})();var W={"class":"className","for":"htmlFor"};a.c.attr={update:function(b,c){var d=a.a.f(c())||{};a.a.P(d,function(c,d){d=a.a.f(d);var g=c.indexOf(":"),g="lookupNamespaceURI"in b&&0<g&&b.lookupNamespaceURI(c.substr(0,g)),h=false===d||null===
			d||d===p;h?g?b.removeAttributeNS(g,c):b.removeAttribute(c):d=d.toString();8>=a.a.W&&c in W?(c=W[c],h?b.removeAttribute(c):b[c]=d):h||(g?b.setAttributeNS(g,c,d):b.setAttribute(c,d));"name"===c&&a.a.Yc(b,h?"":d);});}};(function(){a.c.checked={after:["value","attr"],init:function(b,c,d){function e(){var e=b.checked,f=g();if(!a.S.$a()&&(e||!m&&!a.S.ra())){var k=a.u.G(c);if(l){var n=q?k.v():k,A=r;r=f;A!==f?e&&(a.a.Pa(n,f,true),a.a.Pa(n,A,false)):a.a.Pa(n,f,e);q&&a.ab(k)&&k(n);}else h&&(f===p?f=e:e||(f=p)),a.m.gb(k,
			d,"checked",f,true);}}function f(){var d=a.a.f(c()),e=g();l?(b.checked=null!=d&&0<=a.a.A(d,e),r=e):b.checked=h&&e===p?!!d:g()===d;}var g=a.yb(function(){if(d.has("checkedValue"))return a.a.f(d.get("checkedValue"));if(n)return d.has("value")?a.a.f(d.get("value")):b.value}),h="checkbox"==b.type,m="radio"==b.type;if(h||m){var k=c(),l=h&&a.a.f(k)instanceof Array,q=!(l&&k.push&&k.splice),n=m||l,r=l?g():p;m&&!b.name&&a.c.uniqueName.init(b,function(){return  true});a.o(e,null,{l:b});a.a.B(b,"click",e);a.o(f,null,
			{l:b});k=p;}}};a.m.ya.checked=true;a.c.checkedValue={update:function(b,c){b.value=a.a.f(c());}};})();a.c["class"]={update:function(b,c){var d=a.a.Eb(a.a.f(c()));a.a.Fb(b,b.__ko__cssValue,false);b.__ko__cssValue=d;a.a.Fb(b,d,true);}};a.c.css={update:function(b,c){var d=a.a.f(c());null!==d&&"object"==typeof d?a.a.P(d,function(c,d){d=a.a.f(d);a.a.Fb(b,c,d);}):a.c["class"].update(b,c);}};a.c.enable={update:function(b,c){var d=a.a.f(c());d&&b.disabled?b.removeAttribute("disabled"):d||b.disabled||(b.disabled=true);}};
			a.c.disable={update:function(b,c){a.c.enable.update(b,function(){return !a.a.f(c())});}};a.c.event={init:function(b,c,d,e,f){var g=c()||{};a.a.P(g,function(g){"string"==typeof g&&a.a.B(b,g,function(b){var k,l=c()[g];if(l){try{var q=a.a.la(arguments);e=f.$data;q.unshift(e);k=l.apply(e,q);}finally{ true!==k&&(b.preventDefault?b.preventDefault():b.returnValue=false);} false===d.get(g+"Bubble")&&(b.cancelBubble=true,b.stopPropagation&&b.stopPropagation());}});});}};a.c.foreach={Rc:function(b){return function(){var c=b(),
			d=a.a.bc(c);if(!d||"number"==typeof d.length)return {foreach:c,templateEngine:a.ba.Oa};a.a.f(c);return {foreach:d.data,as:d.as,noChildContext:d.noChildContext,includeDestroyed:d.includeDestroyed,afterAdd:d.afterAdd,beforeRemove:d.beforeRemove,afterRender:d.afterRender,beforeMove:d.beforeMove,afterMove:d.afterMove,templateEngine:a.ba.Oa}}},init:function(b,c){return a.c.template.init(b,a.c.foreach.Rc(c))},update:function(b,c,d,e,f){return a.c.template.update(b,a.c.foreach.Rc(c),d,e,f)}};a.m.Ta.foreach=
			false;a.h.ea.foreach=true;a.c.hasfocus={init:function(b,c,d){function e(e){b.__ko_hasfocusUpdating=true;var f=b.ownerDocument;if("activeElement"in f){var g;try{g=f.activeElement;}catch(l){g=f.body;}e=g===b;}f=c();a.m.gb(f,d,"hasfocus",e,true);b.__ko_hasfocusLastValue=e;b.__ko_hasfocusUpdating=false;}var f=e.bind(null,true),g=e.bind(null,false);a.a.B(b,"focus",f);a.a.B(b,"focusin",f);a.a.B(b,"blur",g);a.a.B(b,"focusout",g);b.__ko_hasfocusLastValue=false;},update:function(b,c){var d=!!a.a.f(c());b.__ko_hasfocusUpdating||b.__ko_hasfocusLastValue===
			d||(d?b.focus():b.blur(),!d&&b.__ko_hasfocusLastValue&&b.ownerDocument.body.focus(),a.u.G(a.a.Gb,null,[b,d?"focusin":"focusout"]));}};a.m.ya.hasfocus=true;a.c.hasFocus=a.c.hasfocus;a.m.ya.hasFocus="hasfocus";a.c.html={init:function(){return {controlsDescendantBindings:true}},update:function(b,c){a.a.fc(b,c());}};(function(){function b(b,d,e){a.c[b]={init:function(b,c,h,m,k){var l,q,n={},r,y,p;if(d){m=h.get("as");var u=h.get("noChildContext");p=!(m&&u);n={as:m,noChildContext:u,exportDependencies:p};}y=(r=
			"render"==h.get("completeOn"))||h.has(a.i.qa);a.o(function(){var h=a.a.f(c()),m=!e!==!h,u=!q,t;if(p||m!==l){y&&(k=a.i.Db(b,k));if(m){if(!d||p)n.dataDependency=a.S.o();t=d?k.createChildContext("function"==typeof h?h:c,n):a.S.ra()?k.extend(null,n):k;}u&&a.S.ra()&&(q=a.a.Da(a.h.childNodes(b),true));m?(u||a.h.xa(b,a.a.Da(q)),a.Qa(t,b)):(a.h.Fa(b),r||a.i.ma(b,a.i.H));l=m;}},null,{l:b});return {controlsDescendantBindings:true}}};a.m.Ta[b]=false;a.h.ea[b]=true;}b("if");b("ifnot",false,true);b("with",true);})();a.c.let={init:function(b,
			c,d,e,f){c=f.extend(c);a.Qa(c,b);return {controlsDescendantBindings:true}}};a.h.ea.let=true;var Q={};a.c.options={init:function(b){if("select"!==a.a.R(b))throw Error("options binding applies only to SELECT elements");for(;0<b.length;)b.remove(0);return {controlsDescendantBindings:true}},update:function(b,c,d){function e(){return a.a.lb(b.options,function(a){return a.selected})}function f(a,b,c){var d=typeof b;return "function"==d?b(a):"string"==d?a[b]:c}function g(c,d){if(y&&l)a.i.ma(b,a.i.H);else if(r.length){var e=
			0<=a.a.A(r,a.w.M(d[0]));a.a.Zc(d[0],e);y&&!e&&a.u.G(a.a.Gb,null,[b,"change"]);}}var h=b.multiple,m=0!=b.length&&h?b.scrollTop:null,k=a.a.f(c()),l=d.get("valueAllowUnset")&&d.has("value"),q=d.get("optionsIncludeDestroyed");c={};var n,r=[];l||(h?r=a.a.Nb(e(),a.w.M):0<=b.selectedIndex&&r.push(a.w.M(b.options[b.selectedIndex])));k&&("undefined"==typeof k.length&&(k=[k]),n=a.a.lb(k,function(b){return q||b===p||null===b||!a.a.f(b._destroy)}),d.has("optionsCaption")&&(k=a.a.f(d.get("optionsCaption")),null!==
			k&&k!==p&&n.unshift(Q)));var y=false;c.beforeRemove=function(a){b.removeChild(a);};k=g;d.has("optionsAfterRender")&&"function"==typeof d.get("optionsAfterRender")&&(k=function(b,c){g(0,c);a.u.G(d.get("optionsAfterRender"),null,[c[0],b!==Q?b:p]);});a.a.ec(b,n,function(c,e,g){g.length&&(r=!l&&g[0].selected?[a.w.M(g[0])]:[],y=true);e=b.ownerDocument.createElement("option");c===Q?(a.a.Cb(e,d.get("optionsCaption")),a.w.fb(e,p)):(g=f(c,d.get("optionsValue"),c),a.w.fb(e,a.a.f(g)),c=f(c,d.get("optionsText"),g),
			a.a.Cb(e,c));return [e]},c,k);if(!l){var C;h?C=r.length&&e().length<r.length:C=r.length&&0<=b.selectedIndex?a.w.M(b.options[b.selectedIndex])!==r[0]:r.length||0<=b.selectedIndex;C&&a.u.G(a.a.Gb,null,[b,"change"]);}(l||a.S.$a())&&a.i.ma(b,a.i.H);a.a.wd(b);m&&20<Math.abs(m-b.scrollTop)&&(b.scrollTop=m);}};a.c.options.$b=a.a.g.Z();a.c.selectedOptions={init:function(b,c,d){function e(){var e=c(),f=[];a.a.D(b.getElementsByTagName("option"),function(b){b.selected&&f.push(a.w.M(b));});a.m.gb(e,d,"selectedOptions",
			f);}function f(){var d=a.a.f(c()),e=b.scrollTop;d&&"number"==typeof d.length&&a.a.D(b.getElementsByTagName("option"),function(b){var c=0<=a.a.A(d,a.w.M(b));b.selected!=c&&a.a.Zc(b,c);});b.scrollTop=e;}if("select"!=a.a.R(b))throw Error("selectedOptions binding applies only to SELECT elements");var g;a.i.subscribe(b,a.i.H,function(){g?e():(a.a.B(b,"change",e),g=a.o(f,null,{l:b}));},null,{notifyImmediately:true});},update:function(){}};a.m.ya.selectedOptions=true;a.c.style={update:function(b,c){var d=a.a.f(c()||
			{});a.a.P(d,function(c,d){d=a.a.f(d);if(null===d||d===p||false===d)d="";if(w)w(b).css(c,d);else if(/^--/.test(c))b.style.setProperty(c,d);else {c=c.replace(/-(\w)/g,function(a,b){return b.toUpperCase()});var g=b.style[c];b.style[c]=d;d===g||b.style[c]!=g||isNaN(d)||(b.style[c]=d+"px");}});}};a.c.submit={init:function(b,c,d,e,f){if("function"!=typeof c())throw Error("The value for a submit binding must be a function");a.a.B(b,"submit",function(a){var d,e=c();try{d=e.call(f.$data,b);}finally{ true!==d&&(a.preventDefault?
			a.preventDefault():a.returnValue=false);}});}};a.c.text={init:function(){return {controlsDescendantBindings:true}},update:function(b,c){a.a.Cb(b,c());}};a.h.ea.text=true;(function(){if(z&&z.navigator){var b=function(a){if(a)return parseFloat(a[1])},c=z.navigator.userAgent,d,e,f,g,h;(d=z.opera&&z.opera.version&&parseInt(z.opera.version()))||(h=b(c.match(/Edge\/([^ ]+)$/)))||b(c.match(/Chrome\/([^ ]+)/))||(e=b(c.match(/Version\/([^ ]+) Safari/)))||(f=b(c.match(/Firefox\/([^ ]+)/)))||(g=a.a.W||b(c.match(/MSIE ([^ ]+)/)))||
			(g=b(c.match(/rv:([^ )]+)/)));}if(8<=g&&10>g)var m=a.a.g.Z(),k=a.a.g.Z(),l=function(b){var c=this.activeElement;(c=c&&a.a.g.get(c,k))&&c(b);},q=function(b,c){var d=b.ownerDocument;a.a.g.get(d,m)||(a.a.g.set(d,m,true),a.a.B(d,"selectionchange",l));a.a.g.set(b,k,c);};a.c.textInput={init:function(b,c,k){function l(c,d){a.a.B(b,c,d);}function m(){var d=a.a.f(c());if(null===d||d===p)d="";z!==p&&d===z?a.a.setTimeout(m,4):b.value!==d&&(D=true,b.value=d,D=false,w=b.value);}function t(){v||(z=b.value,v=a.a.setTimeout(A,
			4));}function A(){clearTimeout(v);z=v=p;var d=b.value;w!==d&&(w=d,a.m.gb(c(),k,"textInput",d));}var w=b.value,v,z,B=9==a.a.W?t:A,D=false;g&&l("keypress",A);11>g&&l("propertychange",function(a){D||"value"!==a.propertyName||B();});8==g&&(l("keyup",A),l("keydown",A));q&&(q(b,B),l("dragend",t));(!g||9<=g)&&l("input",B);5>e&&"textarea"===a.a.R(b)?(l("keydown",t),l("paste",t),l("cut",t)):11>d?l("keydown",t):4>f?(l("DOMAutoComplete",A),l("dragdrop",A),l("drop",A)):h&&"number"===b.type&&l("keydown",t);l("change",
			A);l("blur",A);a.o(m,null,{l:b});}};a.m.ya.textInput=true;a.c.textinput={preprocess:function(a,b,c){c("textInput",a);}};})();a.c.uniqueName={init:function(b,c){if(c()){var d="ko_unique_"+ ++a.c.uniqueName.rd;a.a.Yc(b,d);}}};a.c.uniqueName.rd=0;a.c.using={init:function(b,c,d,e,f){var g;d.has("as")&&(g={as:d.get("as"),noChildContext:d.get("noChildContext")});c=f.createChildContext(c,g);a.Qa(c,b);return {controlsDescendantBindings:true}}};a.h.ea.using=true;a.c.value={init:function(b,c,d){var e=a.a.R(b),f="input"==
			e;if(!f||"checkbox"!=b.type&&"radio"!=b.type){var g=[],h=d.get("valueUpdate"),m=false,k=null;h&&("string"==typeof h?g=[h]:g=a.a.wc(h),a.a.Ra(g,"change"));var l=function(){k=null;m=false;var e=c(),f=a.w.M(b);a.m.gb(e,d,"value",f);};!a.a.W||!f||"text"!=b.type||"off"==b.autocomplete||b.form&&"off"==b.form.autocomplete||-1!=a.a.A(g,"propertychange")||(a.a.B(b,"propertychange",function(){m=true;}),a.a.B(b,"focus",function(){m=false;}),a.a.B(b,"blur",function(){m&&l();}));a.a.D(g,function(c){var d=l;a.a.Ud(c,"after")&&
			(d=function(){k=a.w.M(b);a.a.setTimeout(l,0);},c=c.substring(5));a.a.B(b,c,d);});var q;q=f&&"file"==b.type?function(){var d=a.a.f(c());null===d||d===p||""===d?b.value="":a.u.G(l);}:function(){var f=a.a.f(c()),g=a.w.M(b);if(null!==k&&f===k)a.a.setTimeout(q,0);else if(f!==g||g===p)"select"===e?(g=d.get("valueAllowUnset"),a.w.fb(b,f,g),g||f===a.w.M(b)||a.u.G(l)):a.w.fb(b,f);};if("select"===e){var n;a.a.B(b,"change",function(){n&&l();});a.i.subscribe(b,a.i.H,function(){n?d.get("valueAllowUnset")?q():l():n=
			a.o(q,null,{l:b});},null,{notifyImmediately:true});}else a.a.B(b,"change",l),a.o(q,null,{l:b});}else a.kb(b,{checkedValue:c});},update:function(){}};a.m.ya.value=true;a.c.visible={update:function(b,c){var d=a.a.f(c()),e="none"!=b.style.display;d&&!e?b.style.display="":!d&&e&&(b.style.display="none");}};a.c.hidden={update:function(b,c){a.c.visible.update(b,function(){return !a.a.f(c())});}};(function(b){a.c[b]={init:function(c,d,e,f,g){return a.c.event.init.call(this,c,function(){var a={};a[b]=d();return a},
			e,f,g)}};})("click");a.ca=function(){};a.ca.prototype.renderTemplateSource=function(){throw Error("Override renderTemplateSource");};a.ca.prototype.createJavaScriptEvaluatorBlock=function(){throw Error("Override createJavaScriptEvaluatorBlock");};a.ca.prototype.makeTemplateSource=function(b,c){if("string"==typeof b){c=c||v;var d=c.getElementById(b);if(!d)throw Error("Cannot find template with ID "+b);return new a.C.F(d)}if(1==b.nodeType||8==b.nodeType)return new a.C.ia(b);throw Error("Unknown template type: "+
			b);};a.ca.prototype.renderTemplate=function(a,c,d,e){a=this.makeTemplateSource(a,e);return this.renderTemplateSource(a,c,d,e)};a.ca.prototype.isTemplateRewritten=function(a,c){return  false===this.allowTemplateRewriting?true:this.makeTemplateSource(a,c).data("isRewritten")};a.ca.prototype.rewriteTemplate=function(a,c,d){a=this.makeTemplateSource(a,d);c=c(a.text());a.text(c);a.data("isRewritten",true);};a.b("templateEngine",a.ca);a.kc=function(){function b(b,c,d,h){b=a.m.ac(b);for(var m=a.m.Ta,k=0;k<b.length;k++){var l=
			b[k].key;if(Object.prototype.hasOwnProperty.call(m,l)){var q=m[l];if("function"===typeof q){if(l=q(b[k].value))throw Error(l);}else if(!q)throw Error("This template engine does not support the '"+l+"' binding within its templates");}}d="ko.__tr_ambtns(function($context,$element){return(function(){return{ "+a.m.wb(b,{valueAccessors:true})+" } })()},'"+d.toLowerCase()+"')";return h.createJavaScriptEvaluatorBlock(d)+c}var c=/(<([a-z]+\d*)(?:\s+(?!data-bind\s*=\s*)[a-z0-9\-]+(?:=(?:\"[^\"]*\"|\'[^\']*\'|[^>]*))?)*\s+)data-bind\s*=\s*(["'])([\s\S]*?)\3/gi,
			d=/\x3c!--\s*ko\b\s*([\s\S]*?)\s*--\x3e/g;return {xd:function(b,c,d){c.isTemplateRewritten(b,d)||c.rewriteTemplate(b,function(b){return a.kc.Ld(b,c)},d);},Ld:function(a,f){return a.replace(c,function(a,c,d,e,l){return b(l,c,d,f)}).replace(d,function(a,c){return b(c,"\x3c!-- ko --\x3e","#comment",f)})},md:function(b,c){return a.aa.Yb(function(d,h){var m=d.nextSibling;m&&m.nodeName.toLowerCase()===c&&a.kb(m,b,h);})}}}();a.b("__tr_ambtns",a.kc.md);(function(){a.C={};a.C.F=function(b){if(this.F=b){var c=
			a.a.R(b);this.cb="script"===c?1:"textarea"===c?2:"template"==c&&b.content&&11===b.content.nodeType?3:4;}};a.C.F.prototype.text=function(){var b=1===this.cb?"text":2===this.cb?"value":"innerHTML";if(0==arguments.length)return this.F[b];var c=arguments[0];"innerHTML"===b?a.a.fc(this.F,c):this.F[b]=c;};var b=a.a.g.Z()+"_";a.C.F.prototype.data=function(c){if(1===arguments.length)return a.a.g.get(this.F,b+c);a.a.g.set(this.F,b+c,arguments[1]);};var c=a.a.g.Z();a.C.F.prototype.nodes=function(){var b=this.F;
			if(0==arguments.length){var e=a.a.g.get(b,c)||{},f=e.nb||(3===this.cb?b.content:4===this.cb?b:p);if(!f||e.jd){var g=this.text();g&&g!==e.eb&&(f=a.a.Md(g,b.ownerDocument),a.a.g.set(b,c,{nb:f,eb:g,jd:true}));}return f}e=arguments[0];this.cb!==p&&this.text("");a.a.g.set(b,c,{nb:e});};a.C.ia=function(a){this.F=a;};a.C.ia.prototype=new a.C.F;a.C.ia.prototype.constructor=a.C.ia;a.C.ia.prototype.text=function(){if(0==arguments.length){var b=a.a.g.get(this.F,c)||{};b.eb===p&&b.nb&&(b.eb=b.nb.innerHTML);return b.eb}a.a.g.set(this.F,
			c,{eb:arguments[0]});};a.b("templateSources",a.C);a.b("templateSources.domElement",a.C.F);a.b("templateSources.anonymousTemplate",a.C.ia);})();(function(){function b(b,c,d){var e;for(c=a.h.nextSibling(c);b&&(e=b)!==c;)b=a.h.nextSibling(e),d(e,b);}function c(c,d){if(c.length){var e=c[0],f=c[c.length-1],g=e.parentNode,h=a.ga.instance,m=h.preprocessNode;if(m){b(e,f,function(a,b){var c=a.previousSibling,d=m.call(h,a);d&&(a===e&&(e=d[0]||b),a===f&&(f=d[d.length-1]||c));});c.length=0;if(!e)return;e===f?c.push(e):
			(c.push(e,f),a.a.Wa(c,g));}b(e,f,function(b){1!==b.nodeType&&8!==b.nodeType||a.vc(d,b);});b(e,f,function(b){1!==b.nodeType&&8!==b.nodeType||a.aa.cd(b,[d]);});a.a.Wa(c,g);}}function d(a){return a.nodeType?a:0<a.length?a[0]:null}function e(b,e,f,h,m){m=m||{};var p=(b&&d(b)||f||{}).ownerDocument,C=m.templateEngine||g;a.kc.xd(f,C,p);f=C.renderTemplate(f,h,m,p);if("number"!=typeof f.length||0<f.length&&"number"!=typeof f[0].nodeType)throw Error("Template engine must return an array of DOM nodes");p=false;switch(e){case "replaceChildren":a.h.xa(b,
			f);p=true;break;case "replaceNode":a.a.Xc(b,f);p=true;break;case "ignoreTargetNode":break;default:throw Error("Unknown renderMode: "+e);}p&&(c(f,h),m.afterRender&&a.u.G(m.afterRender,null,[f,h[m.as||"$data"]]),"replaceChildren"==e&&a.i.ma(b,a.i.H));return f}function f(b,c,d){return a.O(b)?b():"function"===typeof b?b(c,d):b}var g;a.gc=function(b){if(b!=p&&!(b instanceof a.ca))throw Error("templateEngine must inherit from ko.templateEngine");g=b;};a.dc=function(b,c,h,n,m){h=h||{};if((h.templateEngine||g)==
			p)throw Error("Set a template engine before calling renderTemplate");m=m||"replaceChildren";if(n){var y=d(n);return a.$(function(){var g=c&&c instanceof a.fa?c:new a.fa(c,null,null,null,{exportDependencies:true}),p=f(b,g.$data,g),g=e(n,m,p,g,h);"replaceNode"==m&&(n=g,y=d(n));},null,{Ua:function(){return !y||!a.a.Tb(y)},l:y&&"replaceNode"==m?y.parentNode:y})}return a.aa.Yb(function(d){a.dc(b,c,h,d,"replaceNode");})};a.Qd=function(b,d,g,h,m){function y(a){B.push(a);if(!D){D=true;try{for(;B.length;)try{t(d.v(),
			B[0]);}finally{B.shift();}}finally{D=false;}}}function t(b,c){a.u.G(a.a.ec,null,[h,b,w,g,u,c]);a.i.ma(h,a.i.H);}function u(a,b){c(b,A);g.afterRender&&g.afterRender(b,a);A=null;}function w(a,c){A=m.createChildContext(a,{as:v,noChildContext:g.noChildContext,extend:function(a){a.$index=c;v&&(a[v+"Index"]=c);}});var d=f(b,a,A);return e(h,"ignoreTargetNode",d,A,g)}var A,v=g.as,z=false===g.includeDestroyed||a.options.foreachHidesDestroyed&&!g.includeDestroyed;if(z||g.beforeRemove||!a.Pc(d))return a.$(function(){var b=
			a.a.f(d)||[];"undefined"==typeof b.length&&(b=[b]);z&&(b=a.a.lb(b,function(b){return b===p||null===b||!a.a.f(b._destroy)}));t(b);},null,{l:h});var B=[],D=false,E=d.subscribe(y,null,"arrayChange");E.l(h);y();return E};var h=a.a.g.Z(),m=a.a.g.Z();a.c.template={init:function(b,c){var d=a.a.f(c());if("string"==typeof d||"name"in d)a.h.Fa(b);else if("nodes"in d){d=d.nodes||[];if(a.O(d))throw Error('The "nodes" option must be a plain, non-observable array.');var e=d[0]&&d[0].parentNode;e&&a.a.g.get(e,m)||(e=
			a.a.Zb(d),a.a.g.set(e,m,true));(new a.C.ia(b)).nodes(e);}else if(d=a.h.childNodes(b),0<d.length)e=a.a.Zb(d),(new a.C.ia(b)).nodes(e);else throw Error("Anonymous template defined, but no template content was provided");return {controlsDescendantBindings:true}},update:function(b,c,d,e,f){var g=c();c=a.a.f(g);d=true;e=null;"string"==typeof c?c={}:(g="name"in c?c.name:b,"if"in c&&(d=a.a.f(c["if"])),d&&"ifnot"in c&&(d=!a.a.f(c.ifnot)));d&&!g&&(d=false);var m=a.a.g.get(b,h);m&&"function"==typeof m.s&&m.s();"foreach"in
			c?e=a.Qd(g,d&&c.foreach||[],c,b,f):d?(d=f,"data"in c&&(d=f.createChildContext(c.data,{as:c.as,noChildContext:c.noChildContext,exportDependencies:true})),e=a.dc(g,d,c,b)):a.h.Fa(b);a.a.g.set(b,h,!e||e.ja&&!e.ja()?p:e);}};a.m.Ta.template=function(b){b=a.m.ac(b);return 1==b.length&&b[0].unknown||a.m.Id(b,"name")?null:"This template engine does not support anonymous templates nested within its templates"};a.h.ea.template=true;})();a.b("setTemplateEngine",a.gc);a.b("renderTemplate",a.dc);a.a.Kc=function(a,c,
			d){if(a.length&&c.length){var e,f,g,h,m;for(e=f=0;(!d||e<d)&&(h=a[f]);++f){for(g=0;m=c[g];++g)if(h.value===m.value){h.moved=m.index;m.moved=h.index;c.splice(g,1);e=g=0;break}e+=g;}}};a.a.Qb=function(){function b(b,d,e,f,g){var h=Math.min,m=Math.max,k=[],l,p=b.length,n,r=d.length,t=r-p||1,C=p+r+1,u,v,w;for(l=0;l<=p;l++)for(v=u,k.push(u=[]),w=h(r,l+t),n=m(0,l-1);n<=w;n++)u[n]=n?l?b[l-1]===d[n-1]?v[n-1]:h(v[n]||C,u[n-1]||C)+1:n+1:l+1;h=[];m=[];t=[];l=p;for(n=r;l||n;)r=k[l][n]-1,n&&r===k[l][n-1]?m.push(h[h.length]=
			{status:e,value:d[--n],index:n}):l&&r===k[l-1][n]?t.push(h[h.length]={status:f,value:b[--l],index:l}):(--n,--l,g.sparse||h.push({status:"retained",value:d[n]}));a.a.Kc(t,m,!g.dontLimitMoves&&10*p);return h.reverse()}return function(a,d,e){e="boolean"===typeof e?{dontLimitMoves:e}:e||{};a=a||[];d=d||[];return a.length<d.length?b(a,d,"added","deleted",e):b(d,a,"deleted","added",e)}}();a.b("utils.compareArrays",a.a.Qb);(function(){function b(b,c,d,h,m){var k=[],l=a.$(function(){var l=c(d,m,a.a.Wa(k,
			b))||[];0<k.length&&(a.a.Xc(k,l),h&&a.u.G(h,null,[d,l,m]));k.length=0;a.a.Ob(k,l);},null,{l:b,Ua:function(){return !a.a.kd(k)}});return {Y:k,$:l.ja()?l:p}}var c=a.a.g.Z(),d=a.a.g.Z();a.a.ec=function(e,f,g,h,m,k){function l(b){x={Ba:b,Ha:a.va(w++)};v.push(x);t||(I[w-1]=x);}function q(b){x=r[b];w!==x.Ha.v()&&(D[x.Ha.v()]=x,E[w]=x);x.Ha(w++);a.a.Wa(x.Y,e);v.push(x);}function n(b,c){if(b)for(var d=0,e=c.length;d<e;d++)c[d]&&a.a.D(c[d].Y,function(a){b(a,d,c[d].Ba);});}f=f||[];"undefined"==typeof f.length&&(f=
			[f]);h=h||{};var r=a.a.g.get(e,c),t=!r,v=[],u=0,w=0,A=[],z=[],B=[],D=[],E=[],I=[],x,J=0;if(t)a.a.D(f,l);else {if(!k||r&&r._countWaitingForRemove){var F=a.a.Nb(r,function(a){return a.Ba});k=a.a.Qb(F,f,{dontLimitMoves:h.dontLimitMoves,sparse:true});}for(var F=0,G,H,K;G=k[F];F++)switch(H=G.moved,K=G.index,G.status){case "deleted":for(;u<K;)q(u++);H===p&&(x=r[u],x.$&&(x.$.s(),x.$=p),a.a.Wa(x.Y,e).length&&(h.beforeRemove&&(v.push(x),J++,x.Ba===d?x=null:B[x.Ha.v()]=x),x&&A.push.apply(A,x.Y)));u++;break;case "added":for(;w<
			K;)q(u++);H!==p?(z.push(v.length),q(H)):l(G.value);}for(;w<f.length;)q(u++);v._countWaitingForRemove=J;}a.a.g.set(e,c,v);n(h.beforeMove,D);a.a.D(A,h.beforeRemove?a.pa:a.removeNode);var M,P,N;try{N=e.ownerDocument.activeElement;}catch(O){}if(z.length)for(;(F=z.shift())!=p;){x=v[F];for(M=p;F;)if((P=v[--F].Y)&&P.length){M=P[P.length-1];break}for(f=0;u=x.Y[f];M=u,f++)a.h.Xb(e,u,M);}for(F=0;x=v[F];F++){x.Y||a.a.extend(x,b(e,g,x.Ba,m,x.Ha));for(f=0;u=x.Y[f];M=u,f++)a.h.Xb(e,u,M);!x.Ed&&m&&(m(x.Ba,x.Y,x.Ha),
			x.Ed=true,M=x.Y[x.Y.length-1]);}N&&e.ownerDocument.activeElement!=N&&"function"===typeof N.focus&&N.focus();n(h.beforeRemove,B);for(F=0;F<B.length;++F)B[F]&&(B[F].Ba=d);n(h.afterMove,E);n(h.afterAdd,I);};})();a.b("utils.setDomNodeChildrenFromArrayMapping",a.a.ec);a.ba=function(){this.allowTemplateRewriting=false;};a.ba.prototype=new a.ca;a.ba.prototype.constructor=a.ba;a.ba.prototype.renderTemplateSource=function(b,c,d,e){if(c=(9>a.a.W?0:b.nodes)?b.nodes():null)return a.a.la(c.cloneNode(true).childNodes);b=
			b.text();return a.a.wa(b,e)};a.ba.Oa=new a.ba;a.gc(a.ba.Oa);a.b("nativeTemplateEngine",a.ba);(function(){a.bb=function(){var a=this.Hd=function(){if(!w||!w.tmpl)return 0;try{if(0<=w.tmpl.tag.tmpl.open.toString().indexOf("__"))return 2}catch(a){}return 1}();this.renderTemplateSource=function(b,e,f,g){g=g||v;f=f||{};if(2>a)throw Error("Your version of jQuery.tmpl is too old. Please upgrade to jQuery.tmpl 1.0.0pre or later.");var h=b.data("precompiled");h||(h=b.text()||"",h=w.template(null,"{{ko_with $item.koBindingContext}}"+
			h+"{{/ko_with}}"),b.data("precompiled",h));b=[e.$data];e=w.extend({koBindingContext:e},f.templateOptions);e=w.tmpl(h,b,e);e.appendTo(g.createElement("div"));w.fragments={};return e};this.createJavaScriptEvaluatorBlock=function(a){return "{{ko_code ((function() { return "+a+" })()) }}"};this.addTemplate=function(a,b){v.write("<script type='text/html' id='"+a+"'>"+b+"\x3c/script>");};0<a&&(w.tmpl.tag.ko_code={open:"__.push($1 || '');"},w.tmpl.tag.ko_with={open:"with($1) {",close:"} "});};a.bb.prototype=
			new a.ca;a.bb.prototype.constructor=a.bb;var b=new a.bb;0<b.Hd&&a.gc(b);a.b("jqueryTmplTemplateEngine",a.bb);})();});})();})(); 
		} (knockoutLatest, knockoutLatest.exports));
		return knockoutLatest.exports;
	}

	var knockoutLatestExports = requireKnockoutLatest();

	function requiredElement$1(id) {
	    const element = document.getElementById(id);
	    if (!element) {
	        throw new Error(`Required element not found: ${id}`);
	    }
	    return element;
	}
	const methodsViewModel = {
	    fullName: knockoutLatestExports.observable(),
	    types: knockoutLatestExports.observableArray(),
	};
	class PopupHelper {
	    static showPopup(content) {
	        const contentContainer = requiredElement$1('contentPopup');
	        contentContainer.replaceChildren(content);
	        requiredElement$1('contentPopupContainer').classList.remove('invisible');
	        requiredElement$1('contentPopup').classList.remove('invisible');
	        requiredElement$1('content-methods').classList.add('invisible');
	    }
	    static showMethods(module) {
	        PopupHelper.updateMethodsVM(module);
	        requiredElement$1('contentPopupContainer').classList.remove('invisible');
	        requiredElement$1('contentPopup').classList.add('invisible');
	        requiredElement$1('content-methods').classList.remove('invisible');
	    }
	    static setup() {
	        const closeButton = requiredElement$1('closePopup');
	        closeButton.addEventListener('click', e => {
	            requiredElement$1('contentPopupContainer').classList.add('invisible');
	        });
	        const methodsContainer = requiredElement$1('content-methods');
	        knockoutLatestExports.applyBindings(methodsViewModel, methodsContainer);
	    }
	    static updateMethodsVM(module) {
	        methodsViewModel.fullName(module.fullName);
	        methodsViewModel.types(module.types);
	    }
	}

	var FormatBase = /** @class */ (function () {
	    function FormatBase(view) {
	        this.view = view;
	    }
	    FormatBase.prototype.copyTo = function (bin, offset) {
	        new Uint8Array(bin, offset, this.view.byteLength).set(new Uint8Array(this.view.buffer, this.view.byteOffset, this.view.byteLength));
	    };
	    Object.defineProperty(FormatBase.prototype, "byteLength", {
	        get: function () {
	            return this.view.byteLength;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    return FormatBase;
	}());

	var __extends$7 = (undefined && undefined.__extends) || (function () {
	    var extendStatics = function (d, b) {
	        extendStatics = Object.setPrototypeOf ||
	            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
	            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
	        return extendStatics(d, b);
	    };
	    return function (d, b) {
	        if (typeof b !== "function" && b !== null)
	            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
	        extendStatics(d, b);
	        function __() { this.constructor = d; }
	        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	    };
	})();
	/** abstract class that support array-like methods and 'for...of' operation */
	// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
	var ArrayFormatBase = /** @class */ (function (_super) {
	    __extends$7(ArrayFormatBase, _super);
	    function ArrayFormatBase(view) {
	        return _super.call(this, view) || this;
	    }
	    ArrayFormatBase.prototype.forEach = function (callback) {
	        var len = this.length;
	        var a = [];
	        a.length = len;
	        for (var i = 0; i < len; ++i) {
	            a[i] = this.get(i);
	        }
	        for (var i = 0; i < len; ++i) {
	            callback(a[i], i, this);
	        }
	    };
	    ArrayFormatBase.prototype._iterator = function () {
	        return new (/** @class */ (function () {
	            function class_1(base) {
	                this.base = base;
	                this.i = 0;
	            }
	            class_1.prototype.next = function () {
	                if (this.i === this.base.length) {
	                    return {
	                        value: undefined,
	                        done: true,
	                    };
	                }
	                else {
	                    return {
	                        value: this.base.get(this.i++),
	                        done: false,
	                    };
	                }
	            };
	            return class_1;
	        }()))(this);
	    };
	    return ArrayFormatBase;
	}(FormatBase));
	/* istanbul ignore else */
	if (typeof Symbol !== 'undefined') {
	    ArrayFormatBase.prototype[Symbol.iterator] =
	        // eslint-disable-next-line @typescript-eslint/unbound-method
	        ArrayFormatBase.prototype._iterator;
	}

	var __extends$6 = (undefined && undefined.__extends) || (function () {
	    var extendStatics = function (d, b) {
	        extendStatics = Object.setPrototypeOf ||
	            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
	            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
	        return extendStatics(d, b);
	    };
	    return function (d, b) {
	        if (typeof b !== "function" && b !== null)
	            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
	        extendStatics(d, b);
	        function __() { this.constructor = d; }
	        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	    };
	})();
	var ImageDataDirectoryArray = /** @class */ (function (_super) {
	    __extends$6(ImageDataDirectoryArray, _super);
	    function ImageDataDirectoryArray(view) {
	        var _this = _super.call(this, view) || this;
	        _this.length = 16;
	        return _this;
	    }
	    /** @note This does not clone binary data; the changes to the array will modify the specified buffer `bin` */
	    ImageDataDirectoryArray.from = function (bin, offset) {
	        if (offset === void 0) { offset = 0; }
	        return new ImageDataDirectoryArray(new DataView(bin, offset, 128));
	    };
	    ImageDataDirectoryArray.prototype.get = function (index) {
	        return {
	            virtualAddress: this.view.getUint32(index * 8, true),
	            size: this.view.getUint32(4 + index * 8, true),
	        };
	    };
	    ImageDataDirectoryArray.prototype.set = function (index, data) {
	        this.view.setUint32(index * 8, data.virtualAddress, true);
	        this.view.setUint32(4 + index * 8, data.size, true);
	    };
	    ImageDataDirectoryArray.prototype.findIndexByVirtualAddress = function (virtualAddress) {
	        for (var i = 0; i < 16; ++i) {
	            var va = this.view.getUint32(i * 8, true);
	            var vs = this.view.getUint32(4 + i * 8, true);
	            if (virtualAddress >= va && virtualAddress < va + vs) {
	                return i;
	            }
	        }
	        return null;
	    };
	    ImageDataDirectoryArray.size = 128; // 16 * 8
	    ImageDataDirectoryArray.itemSize = 8;
	    return ImageDataDirectoryArray;
	}(ArrayFormatBase));

	var ImageDirectoryEntry = {
	    Certificate: 4,
	    ComDescriptor: 14};

	/// <reference lib='dom' />
	function cloneObject(object) {
	    var r = {};
	    Object.keys(object).forEach(function (key) {
	        r[key] = object[key];
	    });
	    return r;
	}
	function createDataView(bin, byteOffset, byteLength) {
	    if ('buffer' in bin) {
	        var newOffset = bin.byteOffset;
	        var newLength = bin.byteLength;
	        if (typeof byteOffset !== 'undefined') {
	            newOffset += byteOffset;
	            newLength -= byteOffset;
	        }
	        if (typeof byteLength !== 'undefined') {
	            newLength = byteLength;
	        }
	        return new DataView(bin.buffer, newOffset, newLength);
	    }
	    else {
	        return new DataView(bin, byteOffset, byteLength);
	    }
	}
	function calculateCheckSumForPE(bin, storeToBinary) {
	    var dosHeader = ImageDosHeader.from(bin);
	    var view = new DataView(bin);
	    var checkSumOffset = dosHeader.newHeaderAddress + 88;
	    var result = 0;
	    var limit = 0x100000000; // 2^32
	    var update = function (dword) {
	        result += dword;
	        if (result >= limit) {
	            result = (result % limit) + ((result / limit) | 0);
	        }
	    };
	    var len = view.byteLength;
	    var lenExtra = len % 4;
	    var lenAlign = len - lenExtra;
	    for (var i = 0; i < lenAlign; i += 4) {
	        if (i !== checkSumOffset) {
	            update(view.getUint32(i, true));
	        }
	    }
	    if (lenExtra !== 0) {
	        var extra = 0;
	        for (var i = 0; i < lenExtra; i++) {
	            extra |= view.getUint8(lenAlign + i) << ((3 - i) * 8);
	        }
	        update(extra);
	    }
	    result = (result & 0xffff) + (result >>> 16);
	    result += result >>> 16;
	    result = (result & 0xffff) + len;
	    {
	        view.setUint32(checkSumOffset, result, true);
	    }
	    return result;
	}
	function roundUp(val, align) {
	    return Math.floor((val + align - 1) / align) * align;
	}
	function copyBuffer(dest, destOffset, src, srcOffset, length) {
	    var ua8Dest = 'buffer' in dest
	        ? new Uint8Array(dest.buffer, dest.byteOffset + (destOffset || 0), length)
	        : new Uint8Array(dest, destOffset, length);
	    var ua8Src = 'buffer' in src
	        ? new Uint8Array(src.buffer, src.byteOffset + (srcOffset || 0), length)
	        : new Uint8Array(src, srcOffset, length);
	    ua8Dest.set(ua8Src);
	}
	function allocatePartialBinary(binBase, offset, length) {
	    var b = new ArrayBuffer(length);
	    copyBuffer(b, 0, binBase, offset, length);
	    return b;
	}
	function cloneToArrayBuffer(binBase) {
	    if ('buffer' in binBase) {
	        var b = new ArrayBuffer(binBase.byteLength);
	        new Uint8Array(b).set(new Uint8Array(binBase.buffer, binBase.byteOffset, binBase.byteLength));
	        return b;
	    }
	    else {
	        var b = new ArrayBuffer(binBase.byteLength);
	        new Uint8Array(b).set(new Uint8Array(binBase));
	        return b;
	    }
	}
	function getFixedString(view, offset, length) {
	    var actualLen = 0;
	    for (var i = 0; i < length; ++i) {
	        if (view.getUint8(offset + i) === 0) {
	            break;
	        }
	        ++actualLen;
	    }
	    if (typeof Buffer !== 'undefined') {
	        return Buffer.from(view.buffer, view.byteOffset + offset, actualLen).toString('utf8');
	    }
	    else if (typeof decodeURIComponent !== 'undefined') {
	        var s = '';
	        for (var i = 0; i < actualLen; ++i) {
	            var c = view.getUint8(offset + i);
	            if (c < 16) {
	                s += '%0' + c.toString(16);
	            }
	            else {
	                s += '%' + c.toString(16);
	            }
	        }
	        return decodeURIComponent(s);
	    }
	    else {
	        var s = '';
	        for (var i = 0; i < actualLen; ++i) {
	            var c = view.getUint8(offset + i);
	            s += String.fromCharCode(c);
	        }
	        return s;
	    }
	}
	function setFixedString(view, offset, length, text) {
	    if (typeof Buffer !== 'undefined') {
	        var u = new Uint8Array(view.buffer, view.byteOffset + offset, length);
	        // fill by zero
	        u.set(new Uint8Array(length));
	        u.set(Buffer.from(text, 'utf8').subarray(0, length));
	    }
	    else if (typeof encodeURIComponent !== 'undefined') {
	        var s = encodeURIComponent(text);
	        for (var i = 0, j = 0; i < length; ++i) {
	            if (j >= s.length) {
	                view.setUint8(i + offset, 0);
	            }
	            else {
	                var c = s.charCodeAt(j);
	                if (c === 37) {
	                    // '%'
	                    var n = parseInt(s.substr(j + 1, 2), 16);
	                    if (typeof n === 'number' && !isNaN(n)) {
	                        view.setUint8(i + offset, n);
	                    }
	                    else {
	                        view.setUint8(i + offset, 0);
	                    }
	                    j += 3;
	                }
	                else {
	                    view.setUint8(i + offset, c);
	                }
	            }
	        }
	    }
	    else {
	        for (var i = 0, j = 0; i < length; ++i) {
	            if (j >= text.length) {
	                view.setUint8(i + offset, 0);
	            }
	            else {
	                var c = text.charCodeAt(j);
	                view.setUint8(i + offset, c & 0xff);
	            }
	        }
	    }
	}

	var __extends$5 = (undefined && undefined.__extends) || (function () {
	    var extendStatics = function (d, b) {
	        extendStatics = Object.setPrototypeOf ||
	            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
	            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
	        return extendStatics(d, b);
	    };
	    return function (d, b) {
	        if (typeof b !== "function" && b !== null)
	            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
	        extendStatics(d, b);
	        function __() { this.constructor = d; }
	        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	    };
	})();
	var ImageDosHeader = /** @class */ (function (_super) {
	    __extends$5(ImageDosHeader, _super);
	    function ImageDosHeader(view) {
	        return _super.call(this, view) || this;
	    }
	    ImageDosHeader.from = function (bin, offset) {
	        if (offset === void 0) { offset = 0; }
	        return new ImageDosHeader(createDataView(bin, offset, 64));
	    };
	    ImageDosHeader.prototype.isValid = function () {
	        return this.magic === ImageDosHeader.DEFAULT_MAGIC;
	    };
	    Object.defineProperty(ImageDosHeader.prototype, "magic", {
	        get: function () {
	            return this.view.getUint16(0, true);
	        },
	        set: function (val) {
	            this.view.setUint16(0, val, true);
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(ImageDosHeader.prototype, "lastPageSize", {
	        get: function () {
	            return this.view.getUint16(2, true);
	        },
	        set: function (val) {
	            this.view.setUint16(2, val, true);
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(ImageDosHeader.prototype, "pages", {
	        get: function () {
	            return this.view.getUint16(4, true);
	        },
	        set: function (val) {
	            this.view.setUint16(4, val, true);
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(ImageDosHeader.prototype, "relocations", {
	        get: function () {
	            return this.view.getUint16(6, true);
	        },
	        set: function (val) {
	            this.view.setUint16(6, val, true);
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(ImageDosHeader.prototype, "headerSizeInParagraph", {
	        get: function () {
	            return this.view.getUint16(8, true);
	        },
	        set: function (val) {
	            this.view.setUint16(8, val, true);
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(ImageDosHeader.prototype, "minAllocParagraphs", {
	        get: function () {
	            return this.view.getUint16(10, true);
	        },
	        set: function (val) {
	            this.view.setUint16(10, val, true);
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(ImageDosHeader.prototype, "maxAllocParagraphs", {
	        get: function () {
	            return this.view.getUint16(12, true);
	        },
	        set: function (val) {
	            this.view.setUint16(12, val, true);
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(ImageDosHeader.prototype, "initialSS", {
	        get: function () {
	            return this.view.getUint16(14, true);
	        },
	        set: function (val) {
	            this.view.setUint16(14, val, true);
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(ImageDosHeader.prototype, "initialSP", {
	        get: function () {
	            return this.view.getUint16(16, true);
	        },
	        set: function (val) {
	            this.view.setUint16(16, val, true);
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(ImageDosHeader.prototype, "checkSum", {
	        get: function () {
	            return this.view.getUint16(18, true);
	        },
	        set: function (val) {
	            this.view.setUint16(18, val, true);
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(ImageDosHeader.prototype, "initialIP", {
	        get: function () {
	            return this.view.getUint16(20, true);
	        },
	        set: function (val) {
	            this.view.setUint16(20, val, true);
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(ImageDosHeader.prototype, "initialCS", {
	        get: function () {
	            return this.view.getUint16(22, true);
	        },
	        set: function (val) {
	            this.view.setUint16(22, val, true);
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(ImageDosHeader.prototype, "relocationTableAddress", {
	        get: function () {
	            return this.view.getUint16(24, true);
	        },
	        set: function (val) {
	            this.view.setUint16(24, val, true);
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(ImageDosHeader.prototype, "overlayNum", {
	        get: function () {
	            return this.view.getUint16(26, true);
	        },
	        set: function (val) {
	            this.view.setUint16(26, val, true);
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(ImageDosHeader.prototype, "oemId", {
	        // WORD e_res[4] (28,30,32,34)
	        get: function () {
	            return this.view.getUint16(36, true);
	        },
	        set: function (val) {
	            this.view.setUint16(36, val, true);
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(ImageDosHeader.prototype, "oemInfo", {
	        get: function () {
	            return this.view.getUint16(38, true);
	        },
	        set: function (val) {
	            this.view.setUint16(38, val, true);
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(ImageDosHeader.prototype, "newHeaderAddress", {
	        // WORD e_res2[10] (40,42,44,46,48,50,52,54,56,58)
	        get: function () {
	            return this.view.getUint32(60, true);
	        },
	        set: function (val) {
	            this.view.setUint32(60, val, true);
	        },
	        enumerable: false,
	        configurable: true
	    });
	    ImageDosHeader.size = 64;
	    ImageDosHeader.DEFAULT_MAGIC = 0x5a4d; // 'MZ'
	    return ImageDosHeader;
	}(FormatBase));

	var __extends$4 = (undefined && undefined.__extends) || (function () {
	    var extendStatics = function (d, b) {
	        extendStatics = Object.setPrototypeOf ||
	            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
	            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
	        return extendStatics(d, b);
	    };
	    return function (d, b) {
	        if (typeof b !== "function" && b !== null)
	            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
	        extendStatics(d, b);
	        function __() { this.constructor = d; }
	        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	    };
	})();
	var ImageFileHeader = /** @class */ (function (_super) {
	    __extends$4(ImageFileHeader, _super);
	    function ImageFileHeader(view) {
	        return _super.call(this, view) || this;
	    }
	    ImageFileHeader.from = function (bin, offset) {
	        if (offset === void 0) { offset = 0; }
	        return new ImageFileHeader(new DataView(bin, offset, 20));
	    };
	    Object.defineProperty(ImageFileHeader.prototype, "machine", {
	        get: function () {
	            return this.view.getUint16(0, true);
	        },
	        set: function (val) {
	            this.view.setUint16(0, val, true);
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(ImageFileHeader.prototype, "numberOfSections", {
	        get: function () {
	            return this.view.getUint16(2, true);
	        },
	        set: function (val) {
	            this.view.setUint16(2, val, true);
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(ImageFileHeader.prototype, "timeDateStamp", {
	        get: function () {
	            return this.view.getUint32(4, true);
	        },
	        set: function (val) {
	            this.view.setUint32(4, val, true);
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(ImageFileHeader.prototype, "pointerToSymbolTable", {
	        get: function () {
	            return this.view.getUint32(8, true);
	        },
	        set: function (val) {
	            this.view.setUint32(8, val, true);
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(ImageFileHeader.prototype, "numberOfSymbols", {
	        get: function () {
	            return this.view.getUint32(12, true);
	        },
	        set: function (val) {
	            this.view.setUint32(12, val, true);
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(ImageFileHeader.prototype, "sizeOfOptionalHeader", {
	        get: function () {
	            return this.view.getUint16(16, true);
	        },
	        set: function (val) {
	            this.view.setUint16(16, val, true);
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(ImageFileHeader.prototype, "characteristics", {
	        get: function () {
	            return this.view.getUint16(18, true);
	        },
	        set: function (val) {
	            this.view.setUint16(18, val, true);
	        },
	        enumerable: false,
	        configurable: true
	    });
	    ImageFileHeader.size = 20;
	    return ImageFileHeader;
	}(FormatBase));

	var __extends$3 = (undefined && undefined.__extends) || (function () {
	    var extendStatics = function (d, b) {
	        extendStatics = Object.setPrototypeOf ||
	            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
	            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
	        return extendStatics(d, b);
	    };
	    return function (d, b) {
	        if (typeof b !== "function" && b !== null)
	            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
	        extendStatics(d, b);
	        function __() { this.constructor = d; }
	        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	    };
	})();
	var ImageOptionalHeader = /** @class */ (function (_super) {
	    __extends$3(ImageOptionalHeader, _super);
	    function ImageOptionalHeader(view) {
	        return _super.call(this, view) || this;
	    }
	    ImageOptionalHeader.from = function (bin, offset) {
	        if (offset === void 0) { offset = 0; }
	        return new ImageOptionalHeader(new DataView(bin, offset, 96));
	    };
	    Object.defineProperty(ImageOptionalHeader.prototype, "magic", {
	        get: function () {
	            return this.view.getUint16(0, true);
	        },
	        set: function (val) {
	            this.view.setUint16(0, val, true);
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(ImageOptionalHeader.prototype, "majorLinkerVersion", {
	        get: function () {
	            return this.view.getUint8(2);
	        },
	        set: function (val) {
	            this.view.setUint8(2, val);
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(ImageOptionalHeader.prototype, "minorLinkerVersion", {
	        get: function () {
	            return this.view.getUint8(3);
	        },
	        set: function (val) {
	            this.view.setUint8(3, val);
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(ImageOptionalHeader.prototype, "sizeOfCode", {
	        get: function () {
	            return this.view.getUint32(4, true);
	        },
	        set: function (val) {
	            this.view.setUint32(4, val, true);
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(ImageOptionalHeader.prototype, "sizeOfInitializedData", {
	        get: function () {
	            return this.view.getUint32(8, true);
	        },
	        set: function (val) {
	            this.view.setUint32(8, val, true);
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(ImageOptionalHeader.prototype, "sizeOfUninitializedData", {
	        get: function () {
	            return this.view.getUint32(12, true);
	        },
	        set: function (val) {
	            this.view.setUint32(12, val, true);
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(ImageOptionalHeader.prototype, "addressOfEntryPoint", {
	        get: function () {
	            return this.view.getUint32(16, true);
	        },
	        set: function (val) {
	            this.view.setUint32(16, val, true);
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(ImageOptionalHeader.prototype, "baseOfCode", {
	        get: function () {
	            return this.view.getUint32(20, true);
	        },
	        set: function (val) {
	            this.view.setUint32(20, val, true);
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(ImageOptionalHeader.prototype, "baseOfData", {
	        get: function () {
	            return this.view.getUint32(24, true);
	        },
	        set: function (val) {
	            this.view.setUint32(24, val, true);
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(ImageOptionalHeader.prototype, "imageBase", {
	        get: function () {
	            return this.view.getUint32(28, true);
	        },
	        set: function (val) {
	            this.view.setUint32(28, val, true);
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(ImageOptionalHeader.prototype, "sectionAlignment", {
	        get: function () {
	            return this.view.getUint32(32, true);
	        },
	        set: function (val) {
	            this.view.setUint32(32, val, true);
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(ImageOptionalHeader.prototype, "fileAlignment", {
	        get: function () {
	            return this.view.getUint32(36, true);
	        },
	        set: function (val) {
	            this.view.setUint32(36, val, true);
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(ImageOptionalHeader.prototype, "majorOperatingSystemVersion", {
	        get: function () {
	            return this.view.getUint16(40, true);
	        },
	        set: function (val) {
	            this.view.setUint16(40, val, true);
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(ImageOptionalHeader.prototype, "minorOperatingSystemVersion", {
	        get: function () {
	            return this.view.getUint16(42, true);
	        },
	        set: function (val) {
	            this.view.setUint16(42, val, true);
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(ImageOptionalHeader.prototype, "majorImageVersion", {
	        get: function () {
	            return this.view.getUint16(44, true);
	        },
	        set: function (val) {
	            this.view.setUint16(44, val, true);
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(ImageOptionalHeader.prototype, "minorImageVersion", {
	        get: function () {
	            return this.view.getUint16(46, true);
	        },
	        set: function (val) {
	            this.view.setUint16(46, val, true);
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(ImageOptionalHeader.prototype, "majorSubsystemVersion", {
	        get: function () {
	            return this.view.getUint16(48, true);
	        },
	        set: function (val) {
	            this.view.setUint16(48, val, true);
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(ImageOptionalHeader.prototype, "minorSubsystemVersion", {
	        get: function () {
	            return this.view.getUint16(50, true);
	        },
	        set: function (val) {
	            this.view.setUint16(50, val, true);
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(ImageOptionalHeader.prototype, "win32VersionValue", {
	        get: function () {
	            return this.view.getUint32(52, true);
	        },
	        set: function (val) {
	            this.view.setUint32(52, val, true);
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(ImageOptionalHeader.prototype, "sizeOfImage", {
	        get: function () {
	            return this.view.getUint32(56, true);
	        },
	        set: function (val) {
	            this.view.setUint32(56, val, true);
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(ImageOptionalHeader.prototype, "sizeOfHeaders", {
	        get: function () {
	            return this.view.getUint32(60, true);
	        },
	        set: function (val) {
	            this.view.setUint32(60, val, true);
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(ImageOptionalHeader.prototype, "checkSum", {
	        get: function () {
	            return this.view.getUint32(64, true);
	        },
	        set: function (val) {
	            this.view.setUint32(64, val, true);
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(ImageOptionalHeader.prototype, "subsystem", {
	        get: function () {
	            return this.view.getUint16(68, true);
	        },
	        set: function (val) {
	            this.view.setUint16(68, val, true);
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(ImageOptionalHeader.prototype, "dllCharacteristics", {
	        get: function () {
	            return this.view.getUint16(70, true);
	        },
	        set: function (val) {
	            this.view.setUint16(70, val, true);
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(ImageOptionalHeader.prototype, "sizeOfStackReserve", {
	        get: function () {
	            return this.view.getUint32(72, true);
	        },
	        set: function (val) {
	            this.view.setUint32(72, val, true);
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(ImageOptionalHeader.prototype, "sizeOfStackCommit", {
	        get: function () {
	            return this.view.getUint32(76, true);
	        },
	        set: function (val) {
	            this.view.setUint32(76, val, true);
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(ImageOptionalHeader.prototype, "sizeOfHeapReserve", {
	        get: function () {
	            return this.view.getUint32(80, true);
	        },
	        set: function (val) {
	            this.view.setUint32(80, val, true);
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(ImageOptionalHeader.prototype, "sizeOfHeapCommit", {
	        get: function () {
	            return this.view.getUint32(84, true);
	        },
	        set: function (val) {
	            this.view.setUint32(84, val, true);
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(ImageOptionalHeader.prototype, "loaderFlags", {
	        get: function () {
	            return this.view.getUint32(88, true);
	        },
	        set: function (val) {
	            this.view.setUint32(88, val, true);
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(ImageOptionalHeader.prototype, "numberOfRvaAndSizes", {
	        get: function () {
	            return this.view.getUint32(92, true);
	        },
	        set: function (val) {
	            this.view.setUint32(92, val, true);
	        },
	        enumerable: false,
	        configurable: true
	    });
	    ImageOptionalHeader.size = 96;
	    ImageOptionalHeader.DEFAULT_MAGIC = 0x10b;
	    return ImageOptionalHeader;
	}(FormatBase));

	var __extends$2 = (undefined && undefined.__extends) || (function () {
	    var extendStatics = function (d, b) {
	        extendStatics = Object.setPrototypeOf ||
	            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
	            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
	        return extendStatics(d, b);
	    };
	    return function (d, b) {
	        if (typeof b !== "function" && b !== null)
	            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
	        extendStatics(d, b);
	        function __() { this.constructor = d; }
	        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	    };
	})();
	function getUint64LE(view, offset) {
	    return (view.getUint32(offset + 4, true) * 0x100000000 +
	        view.getUint32(offset, true));
	}
	function setUint64LE(view, offset, val) {
	    view.setUint32(offset, val & 0xffffffff, true);
	    view.setUint32(offset + 4, Math.floor(val / 0x100000000), true);
	}
	function getUint64LEBigInt(view, offset) {
	    /* istanbul ignore if */
	    if (typeof BigInt === 'undefined') {
	        throw new Error('BigInt not supported');
	    }
	    return (BigInt(0x100000000) * BigInt(view.getUint32(offset + 4, true)) +
	        BigInt(view.getUint32(offset, true)));
	}
	function setUint64LEBigInt(view, offset, val) {
	    /* istanbul ignore if */
	    if (typeof BigInt === 'undefined') {
	        throw new Error('BigInt not supported');
	    }
	    view.setUint32(offset, Number(val & BigInt(0xffffffff)), true);
	    view.setUint32(offset + 4, Math.floor(Number((val / BigInt(0x100000000)) & BigInt(0xffffffff))), true);
	}
	var ImageOptionalHeader64 = /** @class */ (function (_super) {
	    __extends$2(ImageOptionalHeader64, _super);
	    function ImageOptionalHeader64(view) {
	        return _super.call(this, view) || this;
	    }
	    ImageOptionalHeader64.from = function (bin, offset) {
	        if (offset === void 0) { offset = 0; }
	        return new ImageOptionalHeader64(new DataView(bin, offset, 112));
	    };
	    Object.defineProperty(ImageOptionalHeader64.prototype, "magic", {
	        get: function () {
	            return this.view.getUint16(0, true);
	        },
	        set: function (val) {
	            this.view.setUint16(0, val, true);
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(ImageOptionalHeader64.prototype, "majorLinkerVersion", {
	        get: function () {
	            return this.view.getUint8(2);
	        },
	        set: function (val) {
	            this.view.setUint8(2, val);
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(ImageOptionalHeader64.prototype, "minorLinkerVersion", {
	        get: function () {
	            return this.view.getUint8(3);
	        },
	        set: function (val) {
	            this.view.setUint8(3, val);
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(ImageOptionalHeader64.prototype, "sizeOfCode", {
	        get: function () {
	            return this.view.getUint32(4, true);
	        },
	        set: function (val) {
	            this.view.setUint32(4, val, true);
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(ImageOptionalHeader64.prototype, "sizeOfInitializedData", {
	        get: function () {
	            return this.view.getUint32(8, true);
	        },
	        set: function (val) {
	            this.view.setUint32(8, val, true);
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(ImageOptionalHeader64.prototype, "sizeOfUninitializedData", {
	        get: function () {
	            return this.view.getUint32(12, true);
	        },
	        set: function (val) {
	            this.view.setUint32(12, val, true);
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(ImageOptionalHeader64.prototype, "addressOfEntryPoint", {
	        get: function () {
	            return this.view.getUint32(16, true);
	        },
	        set: function (val) {
	            this.view.setUint32(16, val, true);
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(ImageOptionalHeader64.prototype, "baseOfCode", {
	        get: function () {
	            return this.view.getUint32(20, true);
	        },
	        set: function (val) {
	            this.view.setUint32(20, val, true);
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(ImageOptionalHeader64.prototype, "imageBase", {
	        get: function () {
	            return getUint64LE(this.view, 24);
	        },
	        set: function (val) {
	            setUint64LE(this.view, 24, val);
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(ImageOptionalHeader64.prototype, "imageBaseBigInt", {
	        get: function () {
	            return getUint64LEBigInt(this.view, 24);
	        },
	        set: function (val) {
	            setUint64LEBigInt(this.view, 24, val);
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(ImageOptionalHeader64.prototype, "sectionAlignment", {
	        get: function () {
	            return this.view.getUint32(32, true);
	        },
	        set: function (val) {
	            this.view.setUint32(32, val, true);
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(ImageOptionalHeader64.prototype, "fileAlignment", {
	        get: function () {
	            return this.view.getUint32(36, true);
	        },
	        set: function (val) {
	            this.view.setUint32(36, val, true);
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(ImageOptionalHeader64.prototype, "majorOperatingSystemVersion", {
	        get: function () {
	            return this.view.getUint16(40, true);
	        },
	        set: function (val) {
	            this.view.setUint16(40, val, true);
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(ImageOptionalHeader64.prototype, "minorOperatingSystemVersion", {
	        get: function () {
	            return this.view.getUint16(42, true);
	        },
	        set: function (val) {
	            this.view.setUint16(42, val, true);
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(ImageOptionalHeader64.prototype, "majorImageVersion", {
	        get: function () {
	            return this.view.getUint16(44, true);
	        },
	        set: function (val) {
	            this.view.setUint16(44, val, true);
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(ImageOptionalHeader64.prototype, "minorImageVersion", {
	        get: function () {
	            return this.view.getUint16(46, true);
	        },
	        set: function (val) {
	            this.view.setUint16(46, val, true);
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(ImageOptionalHeader64.prototype, "majorSubsystemVersion", {
	        get: function () {
	            return this.view.getUint16(48, true);
	        },
	        set: function (val) {
	            this.view.setUint16(48, val, true);
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(ImageOptionalHeader64.prototype, "minorSubsystemVersion", {
	        get: function () {
	            return this.view.getUint16(50, true);
	        },
	        set: function (val) {
	            this.view.setUint16(50, val, true);
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(ImageOptionalHeader64.prototype, "win32VersionValue", {
	        get: function () {
	            return this.view.getUint32(52, true);
	        },
	        set: function (val) {
	            this.view.setUint32(52, val, true);
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(ImageOptionalHeader64.prototype, "sizeOfImage", {
	        get: function () {
	            return this.view.getUint32(56, true);
	        },
	        set: function (val) {
	            this.view.setUint32(56, val, true);
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(ImageOptionalHeader64.prototype, "sizeOfHeaders", {
	        get: function () {
	            return this.view.getUint32(60, true);
	        },
	        set: function (val) {
	            this.view.setUint32(60, val, true);
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(ImageOptionalHeader64.prototype, "checkSum", {
	        get: function () {
	            return this.view.getUint32(64, true);
	        },
	        set: function (val) {
	            this.view.setUint32(64, val, true);
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(ImageOptionalHeader64.prototype, "subsystem", {
	        get: function () {
	            return this.view.getUint16(68, true);
	        },
	        set: function (val) {
	            this.view.setUint16(68, val, true);
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(ImageOptionalHeader64.prototype, "dllCharacteristics", {
	        get: function () {
	            return this.view.getUint16(70, true);
	        },
	        set: function (val) {
	            this.view.setUint16(70, val, true);
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(ImageOptionalHeader64.prototype, "sizeOfStackReserve", {
	        get: function () {
	            return getUint64LE(this.view, 72);
	        },
	        set: function (val) {
	            setUint64LE(this.view, 72, val);
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(ImageOptionalHeader64.prototype, "sizeOfStackReserveBigInt", {
	        get: function () {
	            return getUint64LEBigInt(this.view, 72);
	        },
	        set: function (val) {
	            setUint64LEBigInt(this.view, 72, val);
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(ImageOptionalHeader64.prototype, "sizeOfStackCommit", {
	        get: function () {
	            return getUint64LE(this.view, 80);
	        },
	        set: function (val) {
	            setUint64LE(this.view, 80, val);
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(ImageOptionalHeader64.prototype, "sizeOfStackCommitBigInt", {
	        get: function () {
	            return getUint64LEBigInt(this.view, 80);
	        },
	        set: function (val) {
	            setUint64LEBigInt(this.view, 80, val);
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(ImageOptionalHeader64.prototype, "sizeOfHeapReserve", {
	        get: function () {
	            return getUint64LE(this.view, 88);
	        },
	        set: function (val) {
	            setUint64LE(this.view, 88, val);
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(ImageOptionalHeader64.prototype, "sizeOfHeapReserveBigInt", {
	        get: function () {
	            return getUint64LEBigInt(this.view, 88);
	        },
	        set: function (val) {
	            setUint64LEBigInt(this.view, 88, val);
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(ImageOptionalHeader64.prototype, "sizeOfHeapCommit", {
	        get: function () {
	            return getUint64LE(this.view, 96);
	        },
	        set: function (val) {
	            setUint64LE(this.view, 96, val);
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(ImageOptionalHeader64.prototype, "sizeOfHeapCommitBigInt", {
	        get: function () {
	            return getUint64LEBigInt(this.view, 96);
	        },
	        set: function (val) {
	            setUint64LEBigInt(this.view, 96, val);
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(ImageOptionalHeader64.prototype, "loaderFlags", {
	        get: function () {
	            return this.view.getUint32(104, true);
	        },
	        set: function (val) {
	            this.view.setUint32(104, val, true);
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(ImageOptionalHeader64.prototype, "numberOfRvaAndSizes", {
	        get: function () {
	            return this.view.getUint32(108, true);
	        },
	        set: function (val) {
	            this.view.setUint32(108, val, true);
	        },
	        enumerable: false,
	        configurable: true
	    });
	    ImageOptionalHeader64.size = 112;
	    ImageOptionalHeader64.DEFAULT_MAGIC = 0x20b;
	    return ImageOptionalHeader64;
	}(FormatBase));

	var __extends$1 = (undefined && undefined.__extends) || (function () {
	    var extendStatics = function (d, b) {
	        extendStatics = Object.setPrototypeOf ||
	            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
	            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
	        return extendStatics(d, b);
	    };
	    return function (d, b) {
	        if (typeof b !== "function" && b !== null)
	            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
	        extendStatics(d, b);
	        function __() { this.constructor = d; }
	        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	    };
	})();
	var ImageNtHeaders = /** @class */ (function (_super) {
	    __extends$1(ImageNtHeaders, _super);
	    function ImageNtHeaders(view) {
	        return _super.call(this, view) || this;
	    }
	    ImageNtHeaders.from = function (bin, offset) {
	        if (offset === void 0) { offset = 0; }
	        var magic = createDataView(bin, offset + ImageFileHeader.size, 6).getUint16(4, true);
	        var len = 4 + ImageFileHeader.size + ImageDataDirectoryArray.size;
	        if (magic === ImageOptionalHeader64.DEFAULT_MAGIC) {
	            len += ImageOptionalHeader64.size;
	        }
	        else {
	            len += ImageOptionalHeader.size;
	        }
	        return new ImageNtHeaders(createDataView(bin, offset, len));
	    };
	    ImageNtHeaders.prototype.isValid = function () {
	        return this.signature === ImageNtHeaders.DEFAULT_SIGNATURE;
	    };
	    ImageNtHeaders.prototype.is32bit = function () {
	        return (this.view.getUint16(ImageFileHeader.size + 4, true) ===
	            ImageOptionalHeader.DEFAULT_MAGIC);
	    };
	    Object.defineProperty(ImageNtHeaders.prototype, "signature", {
	        get: function () {
	            return this.view.getUint32(0, true);
	        },
	        set: function (val) {
	            this.view.setUint32(0, val, true);
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(ImageNtHeaders.prototype, "fileHeader", {
	        get: function () {
	            return ImageFileHeader.from(this.view.buffer, this.view.byteOffset + 4);
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(ImageNtHeaders.prototype, "optionalHeader", {
	        get: function () {
	            var off = ImageFileHeader.size + 4;
	            var magic = this.view.getUint16(off, true);
	            if (magic === ImageOptionalHeader64.DEFAULT_MAGIC) {
	                return ImageOptionalHeader64.from(this.view.buffer, this.view.byteOffset + off);
	            }
	            else {
	                return ImageOptionalHeader.from(this.view.buffer, this.view.byteOffset + off);
	            }
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(ImageNtHeaders.prototype, "optionalHeaderDataDirectory", {
	        get: function () {
	            return ImageDataDirectoryArray.from(this.view.buffer, this.view.byteOffset + this.getDataDirectoryOffset());
	        },
	        enumerable: false,
	        configurable: true
	    });
	    ImageNtHeaders.prototype.getDataDirectoryOffset = function () {
	        var off = ImageFileHeader.size + 4;
	        var magic = this.view.getUint16(off, true);
	        if (magic === ImageOptionalHeader64.DEFAULT_MAGIC) {
	            off += ImageOptionalHeader64.size;
	        }
	        else {
	            off += ImageOptionalHeader.size;
	        }
	        return off;
	    };
	    ImageNtHeaders.prototype.getSectionHeaderOffset = function () {
	        return this.getDataDirectoryOffset() + ImageDataDirectoryArray.size;
	    };
	    ImageNtHeaders.DEFAULT_SIGNATURE = 0x4550; // 'PE\x00\x00'
	    return ImageNtHeaders;
	}(FormatBase));

	var __extends = (undefined && undefined.__extends) || (function () {
	    var extendStatics = function (d, b) {
	        extendStatics = Object.setPrototypeOf ||
	            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
	            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
	        return extendStatics(d, b);
	    };
	    return function (d, b) {
	        if (typeof b !== "function" && b !== null)
	            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
	        extendStatics(d, b);
	        function __() { this.constructor = d; }
	        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	    };
	})();
	var ImageSectionHeaderArray = /** @class */ (function (_super) {
	    __extends(ImageSectionHeaderArray, _super);
	    function ImageSectionHeaderArray(view, length) {
	        var _this = _super.call(this, view) || this;
	        _this.length = length;
	        return _this;
	    }
	    ImageSectionHeaderArray.from = function (bin, length, offset) {
	        if (offset === void 0) { offset = 0; }
	        var size = length * 40;
	        return new ImageSectionHeaderArray(new DataView(bin, offset, size), length);
	    };
	    ImageSectionHeaderArray.prototype.get = function (index) {
	        return {
	            name: getFixedString(this.view, index * 40, 8),
	            virtualSize: this.view.getUint32(8 + index * 40, true),
	            virtualAddress: this.view.getUint32(12 + index * 40, true),
	            sizeOfRawData: this.view.getUint32(16 + index * 40, true),
	            pointerToRawData: this.view.getUint32(20 + index * 40, true),
	            pointerToRelocations: this.view.getUint32(24 + index * 40, true),
	            pointerToLineNumbers: this.view.getUint32(28 + index * 40, true),
	            numberOfRelocations: this.view.getUint16(32 + index * 40, true),
	            numberOfLineNumbers: this.view.getUint16(34 + index * 40, true),
	            characteristics: this.view.getUint32(36 + index * 40, true),
	        };
	    };
	    ImageSectionHeaderArray.prototype.set = function (index, data) {
	        setFixedString(this.view, index * 40, 8, data.name);
	        this.view.setUint32(8 + index * 40, data.virtualSize, true);
	        this.view.setUint32(12 + index * 40, data.virtualAddress, true);
	        this.view.setUint32(16 + index * 40, data.sizeOfRawData, true);
	        this.view.setUint32(20 + index * 40, data.pointerToRawData, true);
	        this.view.setUint32(24 + index * 40, data.pointerToRelocations, true);
	        this.view.setUint32(28 + index * 40, data.pointerToLineNumbers, true);
	        this.view.setUint16(32 + index * 40, data.numberOfRelocations, true);
	        this.view.setUint16(34 + index * 40, data.numberOfLineNumbers, true);
	        this.view.setUint32(36 + index * 40, data.characteristics, true);
	    };
	    ImageSectionHeaderArray.itemSize = 40;
	    return ImageSectionHeaderArray;
	}(ArrayFormatBase));

	// To make the binary (DOS_STUB_PROGRAM):
	// $ cd tools/dos-stub
	// $ nasm -f bin -o dos-stub.bin dos-stub.asm
	// $ node -e "console.log([].map.call(fs.readFileSync('tools/dos-stub/dos-stub.bin'), (v)=>`0x${Buffer.from([v]).toString('hex')}`).join(','))"
	//
	// NOTE: the original dos-stub.asm program and the bit code in DOS_STUB_PROGRAM are under the 0-BSD license.
	// fill with '0x00' to make 8-bytes alignment
	// prettier-ignore
	var DOS_STUB_PROGRAM = new Uint8Array([
	    0x0e, 0x1f, 0xba, 0x0e, 0x00, 0xb4, 0x09, 0xcd, 0x21, 0xb8, 0x01, 0x4c, 0xcd, 0x21, 0x44, 0x4f,
	    0x53, 0x20, 0x6d, 0x6f, 0x64, 0x65, 0x20, 0x6e, 0x6f, 0x74, 0x20, 0x73, 0x75, 0x70, 0x70, 0x6f,
	    0x72, 0x74, 0x65, 0x64, 0x2e, 0x0d, 0x0d, 0x0a, 0x24, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
	]);
	var DOS_STUB_SIZE = roundUp(ImageDosHeader.size + DOS_STUB_PROGRAM.length, 0x80);
	var DEFAULT_FILE_ALIGNMENT = 512;
	function fillDosStubData(bin) {
	    var dos = ImageDosHeader.from(bin);
	    dos.magic = ImageDosHeader.DEFAULT_MAGIC;
	    // last page size
	    dos.lastPageSize = DOS_STUB_SIZE % 512;
	    // total page count
	    dos.pages = Math.ceil(DOS_STUB_SIZE / 512);
	    // no relocations
	    dos.relocations = 0;
	    // header size as paragraph count (1 paragraph = 16 bytes)
	    dos.headerSizeInParagraph = Math.ceil(ImageDosHeader.size / 16);
	    dos.minAllocParagraphs = 0;
	    dos.maxAllocParagraphs = 0xffff;
	    dos.initialSS = 0;
	    dos.initialSP = 0x80;
	    // (no relocations, but set offset after the header)
	    dos.relocationTableAddress = ImageDosHeader.size;
	    dos.newHeaderAddress = DOS_STUB_SIZE;
	    copyBuffer(bin, ImageDosHeader.size, DOS_STUB_PROGRAM, 0, DOS_STUB_PROGRAM.length);
	}
	function estimateNewHeaderSize(is32Bit) {
	    return (
	    // magic
	    4 +
	        ImageFileHeader.size +
	        (is32Bit ? ImageOptionalHeader.size : ImageOptionalHeader64.size) +
	        ImageDataDirectoryArray.size);
	}
	function fillPeHeaderEmptyData(bin, offset, totalBinSize, is32Bit, isDLL) {
	    var _bin;
	    var _offset;
	    if ('buffer' in bin) {
	        _bin = bin.buffer;
	        _offset = bin.byteOffset + offset;
	    }
	    else {
	        _bin = bin;
	        _offset = offset;
	    }
	    new DataView(_bin, _offset).setUint32(0, ImageNtHeaders.DEFAULT_SIGNATURE, true);
	    var fh = ImageFileHeader.from(_bin, _offset + 4);
	    fh.machine = is32Bit ? 0x14c : 0x8664;
	    fh.numberOfSections = 0; // no sections
	    fh.timeDateStamp = 0;
	    fh.pointerToSymbolTable = 0;
	    fh.numberOfSymbols = 0;
	    fh.sizeOfOptionalHeader =
	        (is32Bit ? ImageOptionalHeader.size : ImageOptionalHeader64.size) +
	            ImageDataDirectoryArray.size;
	    fh.characteristics = isDLL ? 0x2102 : 0x102;
	    var oh = (is32Bit ? ImageOptionalHeader : ImageOptionalHeader64).from(_bin, _offset + 4 + ImageFileHeader.size);
	    oh.magic = is32Bit
	        ? ImageOptionalHeader.DEFAULT_MAGIC
	        : ImageOptionalHeader64.DEFAULT_MAGIC;
	    // oh.majorLinkerVersion = 0;
	    // oh.minorLinkerVersion = 0;
	    oh.sizeOfCode = 0;
	    oh.sizeOfInitializedData = 0;
	    oh.sizeOfUninitializedData = 0;
	    oh.addressOfEntryPoint = 0;
	    oh.baseOfCode = 0x1000;
	    // oh.baseOfData = 0; // for 32bit only
	    oh.imageBase = is32Bit ? 0x1000000 : 0x180000000;
	    oh.sectionAlignment = 4096;
	    oh.fileAlignment = DEFAULT_FILE_ALIGNMENT;
	    oh.majorOperatingSystemVersion = 6;
	    oh.minorOperatingSystemVersion = 0;
	    // oh.majorImageVersion = 0;
	    // oh.minorImageVersion = 0;
	    oh.majorSubsystemVersion = 6;
	    oh.minorSubsystemVersion = 0;
	    // oh.win32VersionValue = 0;
	    oh.sizeOfHeaders = roundUp(totalBinSize, oh.fileAlignment);
	    // oh.checkSum = 0;
	    oh.subsystem = 2; // IMAGE_SUBSYSTEM_WINDOWS_GUI
	    oh.dllCharacteristics =
	        (is32Bit ? 0 : 0x20) + // IMAGE_DLL_CHARACTERISTICS_HIGH_ENTROPY_VA
	            0x40 + // IMAGE_DLLCHARACTERISTICS_DYNAMIC_BASE
	            0x100; // IMAGE_DLLCHARACTERISTICS_NX_COMPAT
	    oh.sizeOfStackReserve = 0x100000;
	    oh.sizeOfStackCommit = 0x1000;
	    oh.sizeOfHeapReserve = 0x100000;
	    oh.sizeOfHeapCommit = 0x1000;
	    // oh.loaderFlags = 0;
	    oh.numberOfRvaAndSizes =
	        ImageDataDirectoryArray.size / ImageDataDirectoryArray.itemSize;
	}
	function makeEmptyNtExecutableBinary(is32Bit, isDLL) {
	    var bufferSize = roundUp(DOS_STUB_SIZE + estimateNewHeaderSize(is32Bit), DEFAULT_FILE_ALIGNMENT);
	    var bin = new ArrayBuffer(bufferSize);
	    fillDosStubData(bin);
	    fillPeHeaderEmptyData(bin, DOS_STUB_SIZE, bufferSize, is32Bit, isDLL);
	    return bin;
	}

	var NtExecutable = /** @class */ (function () {
	    function NtExecutable(_headers, _sections, _ex) {
	        this._headers = _headers;
	        this._sections = _sections;
	        this._ex = _ex;
	        var dh = ImageDosHeader.from(_headers);
	        var nh = ImageNtHeaders.from(_headers, dh.newHeaderAddress);
	        this._dh = dh;
	        this._nh = nh;
	        this._dda = nh.optionalHeaderDataDirectory;
	        _sections.sort(function (a, b) {
	            var ra = a.info.pointerToRawData;
	            var rb = a.info.pointerToRawData;
	            if (ra !== rb) {
	                return ra - rb;
	            }
	            var va = a.info.virtualAddress;
	            var vb = b.info.virtualAddress;
	            if (va === vb) {
	                return a.info.virtualSize - b.info.virtualSize;
	            }
	            return va - vb;
	        });
	    }
	    /**
	     * Creates an NtExecutable instance with an 'empty' executable binary.
	     * @param is32Bit set true if the binary is for 32-bit (default: false)
	     * @param isDLL set true if the binary is DLL (default: true)
	     * @return NtExecutable instance
	     */
	    NtExecutable.createEmpty = function (is32Bit, isDLL) {
	        if (is32Bit === void 0) { is32Bit = false; }
	        if (isDLL === void 0) { isDLL = true; }
	        return this.from(makeEmptyNtExecutableBinary(is32Bit, isDLL));
	    };
	    /**
	     * Parse the binary and create NtExecutable instance.
	     * An error will be thrown if the binary data is invalid
	     * @param bin binary data
	     * @param options additional option for parsing
	     * @return NtExecutable instance
	     */
	    NtExecutable.from = function (bin, options) {
	        var dh = ImageDosHeader.from(bin);
	        var nh = ImageNtHeaders.from(bin, dh.newHeaderAddress);
	        if (!dh.isValid() || !nh.isValid()) {
	            throw new TypeError('Invalid binary format');
	        }
	        if (nh.fileHeader.numberOfSymbols > 0) {
	            throw new Error('Binary with symbols is not supported now');
	        }
	        var fileAlignment = nh.optionalHeader.fileAlignment;
	        var securityEntry = nh.optionalHeaderDataDirectory.get(ImageDirectoryEntry.Certificate);
	        if (securityEntry.size > 0) {
	            // Signed executables should be parsed only when `ignoreCert` is true
	            if (!(options === null || options === void 0 ? void 0 : options.ignoreCert)) {
	                throw new Error('Parsing signed executable binary is not allowed by default.');
	            }
	        }
	        var secOff = dh.newHeaderAddress + nh.getSectionHeaderOffset();
	        var secCount = nh.fileHeader.numberOfSections;
	        var sections = [];
	        var tempSectionHeaderBinary = allocatePartialBinary(bin, secOff, secCount * ImageSectionHeaderArray.itemSize);
	        var secArray = ImageSectionHeaderArray.from(tempSectionHeaderBinary, secCount, 0);
	        var lastOffset = roundUp(secOff + secCount * ImageSectionHeaderArray.itemSize, fileAlignment);
	        // console.log(`from data size 0x${bin.byteLength.toString(16)}:`);
	        secArray.forEach(function (info) {
	            if (!info.pointerToRawData || !info.sizeOfRawData) {
	                info.pointerToRawData = 0;
	                info.sizeOfRawData = 0;
	                sections.push({
	                    info: info,
	                    data: null,
	                });
	            }
	            else {
	                // console.log(`  section ${info.name}: 0x${info.pointerToRawData.toString(16)}, size = 0x${info.sizeOfRawData.toString(16)}`);
	                var secBin = allocatePartialBinary(bin, info.pointerToRawData, info.sizeOfRawData);
	                sections.push({
	                    info: info,
	                    data: secBin,
	                });
	                var secEndOffset = roundUp(info.pointerToRawData + info.sizeOfRawData, fileAlignment);
	                if (secEndOffset > lastOffset) {
	                    lastOffset = secEndOffset;
	                }
	            }
	        });
	        // the size of DOS and NT headers is equal to section offset
	        var headers = allocatePartialBinary(bin, 0, secOff);
	        // extra data
	        var exData = null;
	        var lastExDataOffset = bin.byteLength;
	        // It may contain that both extra data and certificate data are available.
	        // In this case the extra data is followed by the certificate data.
	        if (securityEntry.size > 0) {
	            lastExDataOffset = securityEntry.virtualAddress;
	        }
	        if (lastOffset < lastExDataOffset) {
	            exData = allocatePartialBinary(bin, lastOffset, lastExDataOffset - lastOffset);
	        }
	        return new NtExecutable(headers, sections, exData);
	    };
	    /**
	     * Returns whether the executable is for 32-bit architecture
	     */
	    NtExecutable.prototype.is32bit = function () {
	        return this._nh.is32bit();
	    };
	    NtExecutable.prototype.getTotalHeaderSize = function () {
	        return this._headers.byteLength;
	    };
	    Object.defineProperty(NtExecutable.prototype, "dosHeader", {
	        get: function () {
	            return this._dh;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(NtExecutable.prototype, "newHeader", {
	        get: function () {
	            return this._nh;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    NtExecutable.prototype.getRawHeader = function () {
	        return this._headers;
	    };
	    NtExecutable.prototype.getImageBase = function () {
	        return this._nh.optionalHeader.imageBase;
	    };
	    NtExecutable.prototype.getFileAlignment = function () {
	        return this._nh.optionalHeader.fileAlignment;
	    };
	    NtExecutable.prototype.getSectionAlignment = function () {
	        return this._nh.optionalHeader.sectionAlignment;
	    };
	    /**
	     * Return all sections. The returned array is sorted by raw address.
	     */
	    NtExecutable.prototype.getAllSections = function () {
	        return this._sections;
	    };
	    /**
	     * Return the section data from ImageDirectoryEntry enum value.
	     * @note
	     * The returned instance is equal to the value in {@link getAllSections}'s return value.
	     */
	    NtExecutable.prototype.getSectionByEntry = function (entry) {
	        var dd = this._dda.get(entry);
	        var r = this._sections
	            .filter(function (sec) {
	            var vaEnd = sec.info.virtualAddress + sec.info.virtualSize;
	            return (dd.virtualAddress >= sec.info.virtualAddress &&
	                dd.virtualAddress < vaEnd);
	        })
	            .shift();
	        return r !== undefined ? r : null;
	    };
	    /**
	     * Set the section data from ImageDirectoryEntry enum value.
	     * If entry is found, then replaces the secion data. If not found, then adds the section data.
	     *
	     * NOTE: 'virtualAddress' and 'pointerToRawData' of section object is ignored
	     * and calculated automatically. 'virtualSize' and 'sizeOfRawData' are used, but
	     * if the 'section.data.byteLength' is larger than 'sizeOfRawData', then
	     * these members are replaced.
	     *
	     * @param entry ImageDirectoryEntry enum value for the section
	     * @param section the section data, or null to remove the section
	     */
	    NtExecutable.prototype.setSectionByEntry = function (entry, section) {
	        var sec = section
	            ? { data: section.data, info: section.info }
	            : null;
	        var dd = this._dda.get(entry);
	        var hasEntry = dd.size > 0;
	        if (!sec) {
	            if (!hasEntry) ;
	            else {
	                // clear entry
	                this._dda.set(entry, { size: 0, virtualAddress: 0 });
	                var len = this._sections.length;
	                for (var i = 0; i < len; ++i) {
	                    var sec_1 = this._sections[i];
	                    var vaStart = sec_1.info.virtualAddress;
	                    var vaLast = vaStart + sec_1.info.virtualSize;
	                    if (dd.virtualAddress >= vaStart &&
	                        dd.virtualAddress < vaLast) {
	                        this._sections.splice(i, 1);
	                        // section count changed
	                        this._nh.fileHeader.numberOfSections =
	                            this._sections.length;
	                        break;
	                    }
	                }
	            }
	        }
	        else {
	            var rawSize = !sec.data ? 0 : sec.data.byteLength;
	            var fileAlign = this._nh.optionalHeader.fileAlignment;
	            var secAlign = this._nh.optionalHeader.sectionAlignment;
	            var alignedFileSize = !sec.data ? 0 : roundUp(rawSize, fileAlign);
	            var alignedSecSize = !sec.data
	                ? 0
	                : roundUp(sec.info.virtualSize, secAlign);
	            if (sec.info.sizeOfRawData < alignedFileSize) {
	                sec.info.sizeOfRawData = alignedFileSize;
	            }
	            else {
	                alignedFileSize = sec.info.sizeOfRawData;
	            }
	            if (!hasEntry) {
	                var virtAddr_1 = 0;
	                var rawAddr_1 = roundUp(this._headers.byteLength, fileAlign);
	                // get largest addresses
	                this._sections.forEach(function (secExist) {
	                    if (secExist.info.pointerToRawData) {
	                        if (rawAddr_1 <= secExist.info.pointerToRawData) {
	                            rawAddr_1 =
	                                secExist.info.pointerToRawData +
	                                    secExist.info.sizeOfRawData;
	                        }
	                    }
	                    if (virtAddr_1 <= secExist.info.virtualAddress) {
	                        virtAddr_1 =
	                            secExist.info.virtualAddress +
	                                secExist.info.virtualSize;
	                    }
	                });
	                if (!alignedFileSize) {
	                    rawAddr_1 = 0;
	                }
	                if (!virtAddr_1) {
	                    virtAddr_1 = this.newHeader.optionalHeader.baseOfCode;
	                }
	                virtAddr_1 = roundUp(virtAddr_1, secAlign);
	                sec.info.pointerToRawData = rawAddr_1;
	                sec.info.virtualAddress = virtAddr_1;
	                // add entry
	                this._dda.set(entry, {
	                    size: rawSize,
	                    virtualAddress: virtAddr_1,
	                });
	                this._sections.push(sec);
	                // section count changed
	                this._nh.fileHeader.numberOfSections = this._sections.length;
	                // change image size
	                this._nh.optionalHeader.sizeOfImage = roundUp(virtAddr_1 + alignedSecSize, this._nh.optionalHeader.sectionAlignment);
	            }
	            else {
	                // replace entry
	                this.replaceSectionImpl(dd.virtualAddress, sec.info, sec.data);
	            }
	        }
	    };
	    /**
	     * Returns the extra data in the executable, or `null` if nothing.
	     * You can rewrite the returned buffer without using `setExtraData` if
	     * the size of the new data is equal to the old data.
	     */
	    NtExecutable.prototype.getExtraData = function () {
	        return this._ex;
	    };
	    /**
	     * Specifies the new extra data in the executable.
	     * The specified buffer will be cloned and you can release it after calling this method.
	     * @param bin buffer containing the new data
	     * @note
	     * The extra data will not be aligned by `NtExecutable`.
	     */
	    NtExecutable.prototype.setExtraData = function (bin) {
	        if (bin === null) {
	            this._ex = null;
	        }
	        else {
	            this._ex = cloneToArrayBuffer(bin);
	        }
	    };
	    /**
	     * Generates the executable binary data.
	     */
	    NtExecutable.prototype.generate = function (paddingSize) {
	        // calculate binary size
	        var dh = this._dh;
	        var nh = this._nh;
	        var secOff = dh.newHeaderAddress + nh.getSectionHeaderOffset();
	        var size = secOff;
	        size += this._sections.length * ImageSectionHeaderArray.itemSize;
	        var align = nh.optionalHeader.fileAlignment;
	        size = roundUp(size, align);
	        this._sections.forEach(function (sec) {
	            if (!sec.info.pointerToRawData) {
	                return;
	            }
	            var lastOff = sec.info.pointerToRawData + sec.info.sizeOfRawData;
	            if (size < lastOff) {
	                size = lastOff;
	                size = roundUp(size, align);
	            }
	        });
	        var lastPosition = size;
	        if (this._ex !== null) {
	            size += this._ex.byteLength;
	        }
	        if (typeof paddingSize === 'number') {
	            size += paddingSize;
	        }
	        // make buffer
	        var bin = new ArrayBuffer(size);
	        var u8bin = new Uint8Array(bin);
	        u8bin.set(new Uint8Array(this._headers, 0, secOff));
	        // reset Security section offset (eliminate it)
	        ImageDataDirectoryArray.from(bin, dh.newHeaderAddress + nh.getDataDirectoryOffset()).set(ImageDirectoryEntry.Certificate, {
	            size: 0,
	            virtualAddress: 0,
	        });
	        var secArray = ImageSectionHeaderArray.from(bin, this._sections.length, secOff);
	        this._sections.forEach(function (sec, i) {
	            if (!sec.data) {
	                sec.info.pointerToRawData = 0;
	                sec.info.sizeOfRawData = 0;
	            }
	            secArray.set(i, sec.info);
	            if (!sec.data || !sec.info.pointerToRawData) {
	                return;
	            }
	            u8bin.set(new Uint8Array(sec.data), sec.info.pointerToRawData);
	        });
	        if (this._ex !== null) {
	            u8bin.set(new Uint8Array(this._ex), lastPosition);
	        }
	        // re-calc checksum
	        if (nh.optionalHeader.checkSum !== 0) {
	            calculateCheckSumForPE(bin);
	        }
	        return bin;
	    };
	    NtExecutable.prototype.rearrangeSections = function (rawAddressStart, rawDiff, virtualAddressStart, virtualDiff) {
	        if (!rawDiff && !virtualDiff) {
	            return;
	        }
	        var nh = this._nh;
	        var secAlign = nh.optionalHeader.sectionAlignment;
	        var dirs = this._dda;
	        var len = this._sections.length;
	        var lastVirtAddress = 0;
	        for (var i = 0; i < len; ++i) {
	            var sec = this._sections[i];
	            var virtAddr = sec.info.virtualAddress;
	            if (virtualDiff && virtAddr >= virtualAddressStart) {
	                var iDir = dirs.findIndexByVirtualAddress(virtAddr);
	                virtAddr += virtualDiff;
	                if (iDir !== null) {
	                    dirs.set(iDir, {
	                        virtualAddress: virtAddr,
	                        size: sec.info.virtualSize,
	                    });
	                }
	                sec.info.virtualAddress = virtAddr;
	            }
	            var fileAddr = sec.info.pointerToRawData;
	            if (rawDiff && fileAddr >= rawAddressStart) {
	                sec.info.pointerToRawData = fileAddr + rawDiff;
	            }
	            lastVirtAddress = roundUp(sec.info.virtualAddress + sec.info.virtualSize, secAlign);
	        }
	        // fix image size from last virtual address
	        nh.optionalHeader.sizeOfImage = lastVirtAddress;
	    };
	    // NOTE: info.virtualSize must be valid
	    NtExecutable.prototype.replaceSectionImpl = function (virtualAddress, info, data) {
	        var len = this._sections.length;
	        for (var i = 0; i < len; ++i) {
	            var s = this._sections[i];
	            // console.log(`replaceSectionImpl: ${virtualAddress} <--> ${s.info.virtualAddress}`);
	            if (s.info.virtualAddress === virtualAddress) {
	                // console.log(`  found`);
	                var secAlign = this._nh.optionalHeader.sectionAlignment;
	                var fileAddr = s.info.pointerToRawData;
	                var oldFileAddr = fileAddr + s.info.sizeOfRawData;
	                var oldVirtAddr = virtualAddress + roundUp(s.info.virtualSize, secAlign);
	                s.info = cloneObject(info);
	                s.info.virtualAddress = virtualAddress;
	                s.info.pointerToRawData = fileAddr;
	                s.data = data;
	                // shift addresses
	                var newFileAddr = fileAddr + info.sizeOfRawData;
	                var newVirtAddr = virtualAddress + roundUp(info.virtualSize, secAlign);
	                this.rearrangeSections(oldFileAddr, newFileAddr - oldFileAddr, oldVirtAddr, newVirtAddr - oldVirtAddr);
	                // BLOCK: rewrite DataDirectory entry for specified virtualAddress
	                {
	                    var dirs = this._dda;
	                    var iDir = dirs.findIndexByVirtualAddress(virtualAddress);
	                    if (iDir !== null) {
	                        dirs.set(iDir, {
	                            virtualAddress: virtualAddress,
	                            size: info.virtualSize,
	                        });
	                    }
	                }
	                break;
	            }
	        }
	    };
	    return NtExecutable;
	}());

	function getNullTerminatedUtf8String(view, offset) {
	    let length = 0;
	    while (length + offset < view.byteLength && view.getUint8(offset + length) != 0) {
	        ++length;
	    }
	    if (length + offset >= view.byteLength) {
	        throw "Reached end of view without encountering NULL-terminator";
	    }
	    return {
	        string: getUtf8String(view, offset, length),
	        bytesRead: length,
	    };
	}
	function getUtf8StringFromWholeBuffer(buffer) {
	    const decoder = new TextDecoder("utf-8");
	    return decoder.decode(buffer);
	}
	function getUtf8String(buffer, offset, length) {
	    let bufferView;
	    if (buffer instanceof DataView) {
	        bufferView = new DataView(buffer.buffer, buffer.byteOffset + offset, length);
	    }
	    else {
	        bufferView = new DataView(buffer, offset, length);
	    }
	    return getUtf8StringFromWholeBuffer(bufferView);
	}
	function roundUpToNearest(value, roundFactor) {
	    return Math.ceil(value / roundFactor) * roundFactor;
	}
	function getBoolArrayFromBitmask(bitmask) {
	    const result = [];
	    for (let i = 0n; i < 64n; ++i) {
	        result.push((bitmask & (1n << i)) !== 0n);
	    }
	    return result;
	}

	var HeapSizes$1;
	(function (HeapSizes) {
	    HeapSizes[HeapSizes["StringStreamUses32BitIndexes"] = 1] = "StringStreamUses32BitIndexes";
	    HeapSizes[HeapSizes["GuidStreamUses32BitIndexes"] = 2] = "GuidStreamUses32BitIndexes";
	    HeapSizes[HeapSizes["BlobStreamUses32BitIndexes"] = 4] = "BlobStreamUses32BitIndexes";
	})(HeapSizes$1 || (HeapSizes$1 = {}));
	var MetadataTables$1;
	(function (MetadataTables) {
	    MetadataTables[MetadataTables["Module"] = 0] = "Module";
	    MetadataTables[MetadataTables["TypeRef"] = 1] = "TypeRef";
	    MetadataTables[MetadataTables["TypeDef"] = 2] = "TypeDef";
	    MetadataTables[MetadataTables["Field"] = 4] = "Field";
	    MetadataTables[MetadataTables["MethodDef"] = 6] = "MethodDef";
	    MetadataTables[MetadataTables["Param"] = 8] = "Param";
	    MetadataTables[MetadataTables["InterfaceImpl"] = 9] = "InterfaceImpl";
	    MetadataTables[MetadataTables["MemberRef"] = 10] = "MemberRef";
	    MetadataTables[MetadataTables["Constant"] = 11] = "Constant";
	    MetadataTables[MetadataTables["CustomAttribute"] = 12] = "CustomAttribute";
	    MetadataTables[MetadataTables["FieldMarshal"] = 13] = "FieldMarshal";
	    MetadataTables[MetadataTables["DeclSecurity"] = 14] = "DeclSecurity";
	    MetadataTables[MetadataTables["ClassLayout"] = 15] = "ClassLayout";
	    MetadataTables[MetadataTables["FieldLayout"] = 16] = "FieldLayout";
	    MetadataTables[MetadataTables["StandAloneSig"] = 17] = "StandAloneSig";
	    MetadataTables[MetadataTables["EventMap"] = 18] = "EventMap";
	    MetadataTables[MetadataTables["Event"] = 20] = "Event";
	    MetadataTables[MetadataTables["PropertyMap"] = 21] = "PropertyMap";
	    MetadataTables[MetadataTables["Property"] = 23] = "Property";
	    MetadataTables[MetadataTables["MethodSemantics"] = 24] = "MethodSemantics";
	    MetadataTables[MetadataTables["MethodImpl"] = 25] = "MethodImpl";
	    MetadataTables[MetadataTables["ModuleRef"] = 26] = "ModuleRef";
	    MetadataTables[MetadataTables["TypeSpec"] = 27] = "TypeSpec";
	    MetadataTables[MetadataTables["ImplMap"] = 28] = "ImplMap";
	    MetadataTables[MetadataTables["FieldRVA"] = 29] = "FieldRVA";
	    MetadataTables[MetadataTables["Assembly"] = 32] = "Assembly";
	    MetadataTables[MetadataTables["AssemblyProcessor"] = 33] = "AssemblyProcessor";
	    MetadataTables[MetadataTables["AssemblyOS"] = 34] = "AssemblyOS";
	    MetadataTables[MetadataTables["AssemblyRef"] = 35] = "AssemblyRef";
	    MetadataTables[MetadataTables["AssemblyRefProcessor"] = 36] = "AssemblyRefProcessor";
	    MetadataTables[MetadataTables["AssemblyRefOS"] = 37] = "AssemblyRefOS";
	    MetadataTables[MetadataTables["File"] = 38] = "File";
	    MetadataTables[MetadataTables["ExportedType"] = 39] = "ExportedType";
	    MetadataTables[MetadataTables["ManifestResource"] = 40] = "ManifestResource";
	    MetadataTables[MetadataTables["NestedClass"] = 41] = "NestedClass";
	    MetadataTables[MetadataTables["GenericParam"] = 42] = "GenericParam";
	    MetadataTables[MetadataTables["MethodSpec"] = 43] = "MethodSpec";
	    MetadataTables[MetadataTables["GenericParamConstraint"] = 44] = "GenericParamConstraint";
	    // the "Permission" tag of the HasCustomAttribute coded index refers to the DeclSecurity table
	    MetadataTables[MetadataTables["Permission"] = 14] = "Permission";
	    MetadataTables[MetadataTables["NotUsed"] = 193] = "NotUsed";
	})(MetadataTables$1 || (MetadataTables$1 = {}));
	// II.23.1.16
	var ElementType$1;
	(function (ElementType) {
	    ElementType[ElementType["END"] = 0] = "END";
	    ElementType[ElementType["VOID"] = 1] = "VOID";
	    ElementType[ElementType["BOOLEAN"] = 2] = "BOOLEAN";
	    ElementType[ElementType["CHAR"] = 3] = "CHAR";
	    ElementType[ElementType["I1"] = 4] = "I1";
	    ElementType[ElementType["U1"] = 5] = "U1";
	    ElementType[ElementType["I2"] = 6] = "I2";
	    ElementType[ElementType["U2"] = 7] = "U2";
	    ElementType[ElementType["I4"] = 8] = "I4";
	    ElementType[ElementType["U4"] = 9] = "U4";
	    ElementType[ElementType["I8"] = 10] = "I8";
	    ElementType[ElementType["U8"] = 11] = "U8";
	    ElementType[ElementType["R4"] = 12] = "R4";
	    ElementType[ElementType["R8"] = 13] = "R8";
	    ElementType[ElementType["STRING"] = 14] = "STRING";
	    ElementType[ElementType["PTR"] = 15] = "PTR";
	    ElementType[ElementType["BYREF"] = 16] = "BYREF";
	    ElementType[ElementType["VALUETYPE"] = 17] = "VALUETYPE";
	    ElementType[ElementType["CLASS"] = 18] = "CLASS";
	    ElementType[ElementType["VAR"] = 19] = "VAR";
	    ElementType[ElementType["ARRAY"] = 20] = "ARRAY";
	    ElementType[ElementType["GENERICINST"] = 21] = "GENERICINST";
	    ElementType[ElementType["TYPEDBYREF"] = 22] = "TYPEDBYREF";
	    ElementType[ElementType["I"] = 24] = "I";
	    ElementType[ElementType["U"] = 25] = "U";
	    ElementType[ElementType["FNPTR"] = 27] = "FNPTR";
	    ElementType[ElementType["OBJECT"] = 28] = "OBJECT";
	    ElementType[ElementType["SZARRAY"] = 29] = "SZARRAY";
	    ElementType[ElementType["MVAR"] = 30] = "MVAR";
	    ElementType[ElementType["CMOD_REQD"] = 31] = "CMOD_REQD";
	    ElementType[ElementType["CMOD_OPT"] = 32] = "CMOD_OPT";
	    ElementType[ElementType["INTERNAL"] = 33] = "INTERNAL";
	    ElementType[ElementType["MODIFIER"] = 64] = "MODIFIER";
	    ElementType[ElementType["SENTINEL"] = 65] = "SENTINEL";
	    ElementType[ElementType["PINNED"] = 69] = "PINNED";
	    ElementType[ElementType["Type"] = 80] = "Type";
	    ElementType[ElementType["Boxed"] = 81] = "Boxed";
	    ElementType[ElementType["Reserved"] = 82] = "Reserved";
	    ElementType[ElementType["Field"] = 83] = "Field";
	    ElementType[ElementType["Property"] = 84] = "Property";
	    ElementType[ElementType["Enum"] = 85] = "Enum";
	})(ElementType$1 || (ElementType$1 = {}));

	function getRowsFromBytes(tableId, original, byteOffset, createRow, columns, tableStreamHeader) {
	    if (!tableStreamHeader.presentTables[tableId] || tableStreamHeader.tableRowCounts[tableId] <= 0) {
	        return {
	            rows: [],
	            bytesRead: 0,
	        };
	    }
	    const view = new DataView(original.buffer, original.byteOffset + byteOffset);
	    let offset = 0;
	    let rows = [];
	    for (let i = 0; i < tableStreamHeader.tableRowCounts[tableId]; ++i) {
	        let row = createRow();
	        for (const column of columns) {
	            offset += column.read(view, offset, row);
	        }
	        rows.push(row);
	    }
	    return {
	        rows: rows,
	        bytesRead: offset,
	    };
	}
	class ModuleTableRow {
	    generation = 0;
	    nameIndex = 0;
	    name = "";
	    mvidIndex = 0;
	    encIdIndex = 0;
	    encBaseIdIndex = 0;
	}
	class TypeRefTableRow {
	    resolutionScopeCI = 0;
	    typeNameIndex = 0;
	    typeName = "";
	    typeNamespaceIndex = 0;
	    typeNamespace = "";
	}
	class TypeDefTableRow {
	    flags = 0;
	    typeNameIndex = 0;
	    typeName = "";
	    typeNamespaceIndex = 0;
	    typeNamespace = "";
	    extendsCI = 0;
	    fieldListIndex = 0;
	    fieldList = [];
	    methodListIndex = 0;
	    methodList = [];
	}
	const NoDataBuffer = new ArrayBuffer(0);
	const NoData = new DataView(NoDataBuffer, 0, 0);
	class FieldTableRow {
	    flags = 0;
	    nameIndex = 0;
	    name = "";
	    signatureIndex = 0;
	    signatureData = NoData;
	}
	class MethodDefRow {
	    rva = 0;
	    implFlags = 0;
	    flags = 0;
	    nameIndex = 0;
	    name = "";
	    signatureIndex = 0;
	    signatureData = NoData;
	    paramListIndex = 0;
	}
	class ParamRow {
	    flags = 0;
	    sequence = 0;
	    nameIndex = 0;
	    name = "";
	}
	class InterfaceImplRow {
	    classIndex = 0;
	    interfaceCI = 0;
	}
	class MemberRefRow {
	    classCI = 0;
	    nameIndex = 0;
	    name = "";
	    signatureIndex = 0;
	    signatureData = NoData;
	}
	class ConstantRow {
	    type = 0;
	    parentCI = 0;
	    valueIndex = 0;
	    value = NoData;
	}
	class CustomAttributeRow {
	    parentCI = 0;
	    typeCI = 0;
	    valueIndex = 0;
	    value = NoData;
	}
	class FieldMarshalRow {
	    parentCI = 0;
	    nativeTypeIndex = 0;
	    nativeType = NoData;
	}
	class DeclSecurityRow {
	    action = 0;
	    parentCI = 0;
	    permissionSetIndex = 0;
	    permissionSet = NoData;
	}
	class ClassLayoutRow {
	    packingSize = 0;
	    classSize = 0;
	    parentIndex = 0;
	}
	class FieldLayoutRow {
	    offset = 0;
	    fieldIndex = 0;
	}
	class StandAloneSigRow {
	    signatureIndex = 0;
	    signatureData = NoData;
	}
	class EventMapRow {
	    parentIndex = 0;
	    eventListIndex = 0;
	}
	class EventRow {
	    eventFlags = 0;
	    nameIndex = 0;
	    name = "";
	    eventTypeCI = 0;
	}
	class PropertyMapRow {
	    parentIndex = 0;
	    propertyListIndex = 0;
	}
	class PropertyRow {
	    flags = 0;
	    nameIndex = 0;
	    name = "";
	    typeIndex = 0;
	    typeData = NoData;
	}
	class MethodSemanticsRow {
	    semantics = 0;
	    methodIndex = 0;
	    associationCI = 0;
	}
	class MethodImplRow {
	    classIndex = 0;
	    methodBodyCI = 0;
	    methodDeclarationCI = 0;
	}
	class ModuleRefRow {
	    nameIndex = 0;
	    name = "";
	}
	class TypeSpecRow {
	    signatureIndex = 0;
	    signatureData = NoData;
	}
	class ImplMapRow {
	    mappingFlags = 0;
	    memberForwardedCI = 0;
	    importNameIndex = 0;
	    importName = "";
	    importScopeIndex = 0;
	}
	class FieldRvaRow {
	    rva = 0;
	    fieldIndex = 0;
	}
	class AssemblyRow {
	    hashAlgId = 0;
	    majorVersion = 0;
	    minorVersion = 0;
	    buildNumber = 0;
	    revisionNumber = 0;
	    flags = 0;
	    publicKeyIndex = 0;
	    publicKeyData = NoData;
	    nameIndex = 0;
	    name = "";
	    cultureIndex = 0;
	    culture = "";
	}
	class AssemblyProcessorRow {
	    processor = 0;
	}
	class AssemblyOsRow {
	    osPlarformId = 0;
	    osMajorVersion = 0;
	    osMinorVersion = 0;
	}
	class AssemblyRefRow {
	    majorVersion = 0;
	    minorVersion = 0;
	    buildNumber = 0;
	    revisionNumber = 0;
	    flags = 0;
	    publicKeyOrTokenIndex = 0;
	    publicKeyOrTokenData = NoData;
	    nameIndex = 0;
	    name = "";
	    cultureIndex = 0;
	    culture = "";
	    hashValueIndex = 0;
	    hashValueData = NoData;
	}
	class AssemblyRefProcessorRow {
	    processor = 0;
	    assemblyRefIndex = 0;
	}
	class AssemblyRefOsRow {
	    osPlarformId = 0;
	    osMajorVersion = 0;
	    osMinorVersion = 0;
	    assemblyRefIndex = 0;
	}
	class FileRow {
	    flags = 0;
	    nameIndex = 0;
	    name = "";
	    hashValueIndex = 0;
	    hashValue = NoData;
	}
	class ExportedTypeRow {
	    flags = 0;
	    typeDefIdIndex = 0;
	    typeNameIndex = 0;
	    typeName = "";
	    typeNamespaceIndex = 0;
	    typeNamespace = "";
	    implementationCI = 0;
	}
	class ManifestResourceRow {
	    offset = 0;
	    flags = 0;
	    nameIndex = 0;
	    name = "";
	    implementationCI = 0;
	}
	class NestedClassRow {
	    nestedClassIndex = 0;
	    enclosingClassIndex = 0;
	}
	class GenericParamRow {
	    number = 0;
	    flags = 0;
	    ownerCI = 0;
	    nameIndex = 0;
	    name = "";
	}
	class MethodSpecRow {
	    methodCI = 0;
	    instantiationIndex = 0;
	    instantiation = NoData;
	}
	class GenericParamConstraintRow {
	    ownerIndex = 0;
	    constraintCI = 0;
	}

	class HeapBase {
	    heapData;
	    indexSizeBytes;
	    constructor(heapData, indexSizeBytes) {
	        this.heapData = heapData;
	        this.indexSizeBytes = indexSizeBytes;
	    }
	}

	class StringHeap extends HeapBase {
	    constructor(heapData, indexSizeBytes) {
	        super(heapData, indexSizeBytes);
	    }
	    getString(offset) {
	        return getNullTerminatedUtf8String(this.heapData, offset).string;
	    }
	}

	class GuidHeap extends HeapBase {
	    constructor(heapData, indexSizeBytes) {
	        super(heapData, indexSizeBytes);
	    }
	    getGuid(offset) {
	        throw new Error("Not implemented :(");
	    }
	}

	class BlobReferenceColumn {
	    blobHeapSize;
	    readIndex;
	    setIndex;
	    setData;
	    blobHeap;
	    constructor(blobHeap, setIndex, setData) {
	        this.blobHeapSize = blobHeap.indexSizeBytes;
	        this.blobHeap = blobHeap;
	        this.setIndex = setIndex;
	        this.setData = setData;
	        this.readIndex = this.blobHeapSize == 2
	            ? (view, offset) => view.getUint16(offset, true)
	            : (view, offset) => view.getUint32(offset, true);
	    }
	    read(view, offset, row) {
	        const index = this.readIndex(view, offset);
	        this.setIndex(row, index);
	        const firstLengthByte = this.blobHeap.getBinaryData(index, 1).getUint8(0);
	        if ((firstLengthByte & 0x80) == 0) {
	            // single byte length
	            const length = firstLengthByte & 0x7F;
	            const data = this.blobHeap.getBinaryData(index + 1, length);
	            this.setData(row, data);
	        }
	        else if ((firstLengthByte & 0xC0) == 0x80) {
	            // two byte length
	            const length = this.blobHeap.getBinaryData(index, 2).getUint16(0, false) & 0x3FFF; // big endian!!!
	            const data = this.blobHeap.getBinaryData(index + 2, length);
	            this.setData(row, data);
	        }
	        else if ((firstLengthByte & 0xE0) == 0xC0) {
	            // four byte length
	            const length = this.blobHeap.getBinaryData(index, 4).getUint32(0, false) & 0x1FFFFFFF; // here, too!!!
	            const data = this.blobHeap.getBinaryData(index + 4, length);
	            this.setData(row, data);
	        }
	        return this.blobHeapSize;
	    }
	}

	var HeapSizes;
	(function (HeapSizes) {
	    HeapSizes[HeapSizes["StringStreamUses32BitIndexes"] = 1] = "StringStreamUses32BitIndexes";
	    HeapSizes[HeapSizes["GuidStreamUses32BitIndexes"] = 2] = "GuidStreamUses32BitIndexes";
	    HeapSizes[HeapSizes["BlobStreamUses32BitIndexes"] = 4] = "BlobStreamUses32BitIndexes";
	})(HeapSizes || (HeapSizes = {}));
	var MetadataTables;
	(function (MetadataTables) {
	    MetadataTables[MetadataTables["Module"] = 0] = "Module";
	    MetadataTables[MetadataTables["TypeRef"] = 1] = "TypeRef";
	    MetadataTables[MetadataTables["TypeDef"] = 2] = "TypeDef";
	    MetadataTables[MetadataTables["Field"] = 4] = "Field";
	    MetadataTables[MetadataTables["MethodDef"] = 6] = "MethodDef";
	    MetadataTables[MetadataTables["Param"] = 8] = "Param";
	    MetadataTables[MetadataTables["InterfaceImpl"] = 9] = "InterfaceImpl";
	    MetadataTables[MetadataTables["MemberRef"] = 10] = "MemberRef";
	    MetadataTables[MetadataTables["Constant"] = 11] = "Constant";
	    MetadataTables[MetadataTables["CustomAttribute"] = 12] = "CustomAttribute";
	    MetadataTables[MetadataTables["FieldMarshal"] = 13] = "FieldMarshal";
	    MetadataTables[MetadataTables["DeclSecurity"] = 14] = "DeclSecurity";
	    MetadataTables[MetadataTables["ClassLayout"] = 15] = "ClassLayout";
	    MetadataTables[MetadataTables["FieldLayout"] = 16] = "FieldLayout";
	    MetadataTables[MetadataTables["StandAloneSig"] = 17] = "StandAloneSig";
	    MetadataTables[MetadataTables["EventMap"] = 18] = "EventMap";
	    MetadataTables[MetadataTables["Event"] = 20] = "Event";
	    MetadataTables[MetadataTables["PropertyMap"] = 21] = "PropertyMap";
	    MetadataTables[MetadataTables["Property"] = 23] = "Property";
	    MetadataTables[MetadataTables["MethodSemantics"] = 24] = "MethodSemantics";
	    MetadataTables[MetadataTables["MethodImpl"] = 25] = "MethodImpl";
	    MetadataTables[MetadataTables["ModuleRef"] = 26] = "ModuleRef";
	    MetadataTables[MetadataTables["TypeSpec"] = 27] = "TypeSpec";
	    MetadataTables[MetadataTables["ImplMap"] = 28] = "ImplMap";
	    MetadataTables[MetadataTables["FieldRVA"] = 29] = "FieldRVA";
	    MetadataTables[MetadataTables["Assembly"] = 32] = "Assembly";
	    MetadataTables[MetadataTables["AssemblyProcessor"] = 33] = "AssemblyProcessor";
	    MetadataTables[MetadataTables["AssemblyOS"] = 34] = "AssemblyOS";
	    MetadataTables[MetadataTables["AssemblyRef"] = 35] = "AssemblyRef";
	    MetadataTables[MetadataTables["AssemblyRefProcessor"] = 36] = "AssemblyRefProcessor";
	    MetadataTables[MetadataTables["AssemblyRefOS"] = 37] = "AssemblyRefOS";
	    MetadataTables[MetadataTables["File"] = 38] = "File";
	    MetadataTables[MetadataTables["ExportedType"] = 39] = "ExportedType";
	    MetadataTables[MetadataTables["ManifestResource"] = 40] = "ManifestResource";
	    MetadataTables[MetadataTables["NestedClass"] = 41] = "NestedClass";
	    MetadataTables[MetadataTables["GenericParam"] = 42] = "GenericParam";
	    MetadataTables[MetadataTables["MethodSpec"] = 43] = "MethodSpec";
	    MetadataTables[MetadataTables["GenericParamConstraint"] = 44] = "GenericParamConstraint";
	    // the "Permission" tag of the HasCustomAttribute coded index refers to the DeclSecurity table
	    MetadataTables[MetadataTables["Permission"] = 14] = "Permission";
	    MetadataTables[MetadataTables["NotUsed"] = 193] = "NotUsed";
	})(MetadataTables || (MetadataTables = {}));
	// II.23.1.16
	var ElementType;
	(function (ElementType) {
	    ElementType[ElementType["END"] = 0] = "END";
	    ElementType[ElementType["VOID"] = 1] = "VOID";
	    ElementType[ElementType["BOOLEAN"] = 2] = "BOOLEAN";
	    ElementType[ElementType["CHAR"] = 3] = "CHAR";
	    ElementType[ElementType["I1"] = 4] = "I1";
	    ElementType[ElementType["U1"] = 5] = "U1";
	    ElementType[ElementType["I2"] = 6] = "I2";
	    ElementType[ElementType["U2"] = 7] = "U2";
	    ElementType[ElementType["I4"] = 8] = "I4";
	    ElementType[ElementType["U4"] = 9] = "U4";
	    ElementType[ElementType["I8"] = 10] = "I8";
	    ElementType[ElementType["U8"] = 11] = "U8";
	    ElementType[ElementType["R4"] = 12] = "R4";
	    ElementType[ElementType["R8"] = 13] = "R8";
	    ElementType[ElementType["STRING"] = 14] = "STRING";
	    ElementType[ElementType["PTR"] = 15] = "PTR";
	    ElementType[ElementType["BYREF"] = 16] = "BYREF";
	    ElementType[ElementType["VALUETYPE"] = 17] = "VALUETYPE";
	    ElementType[ElementType["CLASS"] = 18] = "CLASS";
	    ElementType[ElementType["VAR"] = 19] = "VAR";
	    ElementType[ElementType["ARRAY"] = 20] = "ARRAY";
	    ElementType[ElementType["GENERICINST"] = 21] = "GENERICINST";
	    ElementType[ElementType["TYPEDBYREF"] = 22] = "TYPEDBYREF";
	    ElementType[ElementType["I"] = 24] = "I";
	    ElementType[ElementType["U"] = 25] = "U";
	    ElementType[ElementType["FNPTR"] = 27] = "FNPTR";
	    ElementType[ElementType["OBJECT"] = 28] = "OBJECT";
	    ElementType[ElementType["SZARRAY"] = 29] = "SZARRAY";
	    ElementType[ElementType["MVAR"] = 30] = "MVAR";
	    ElementType[ElementType["CMOD_REQD"] = 31] = "CMOD_REQD";
	    ElementType[ElementType["CMOD_OPT"] = 32] = "CMOD_OPT";
	    ElementType[ElementType["INTERNAL"] = 33] = "INTERNAL";
	    ElementType[ElementType["MODIFIER"] = 64] = "MODIFIER";
	    ElementType[ElementType["SENTINEL"] = 65] = "SENTINEL";
	    ElementType[ElementType["PINNED"] = 69] = "PINNED";
	    ElementType[ElementType["Type"] = 80] = "Type";
	    ElementType[ElementType["Boxed"] = 81] = "Boxed";
	    ElementType[ElementType["Reserved"] = 82] = "Reserved";
	    ElementType[ElementType["Field"] = 83] = "Field";
	    ElementType[ElementType["Property"] = 84] = "Property";
	    ElementType[ElementType["Enum"] = 85] = "Enum";
	})(ElementType || (ElementType = {}));

	const TypeDefOrRef = [
	    MetadataTables.TypeDef,
	    MetadataTables.TypeRef,
	    MetadataTables.TypeSpec,
	];
	const HasConstant = [
	    MetadataTables.Field,
	    MetadataTables.Param,
	    MetadataTables.Property,
	];
	const HasCustomAttribute = [
	    MetadataTables.MethodDef,
	    MetadataTables.Field,
	    MetadataTables.TypeRef,
	    MetadataTables.TypeDef,
	    MetadataTables.Param,
	    MetadataTables.InterfaceImpl,
	    MetadataTables.MemberRef,
	    MetadataTables.Module,
	    MetadataTables.Permission,
	    MetadataTables.Property,
	    MetadataTables.Event,
	    MetadataTables.StandAloneSig,
	    MetadataTables.ModuleRef,
	    MetadataTables.TypeSpec,
	    MetadataTables.Assembly,
	    MetadataTables.AssemblyRef,
	    MetadataTables.File,
	    MetadataTables.ExportedType,
	    MetadataTables.ManifestResource,
	    MetadataTables.GenericParam,
	    MetadataTables.GenericParamConstraint,
	    MetadataTables.MethodSpec,
	];
	const HasFieldMarshall = [
	    MetadataTables.Field,
	    MetadataTables.Param,
	];
	const HasDeclSecurity = [
	    MetadataTables.TypeDef,
	    MetadataTables.MethodDef,
	    MetadataTables.Assembly,
	];
	const MemberRefParent = [
	    MetadataTables.TypeDef,
	    MetadataTables.TypeRef,
	    MetadataTables.ModuleRef,
	    MetadataTables.MethodDef,
	    MetadataTables.TypeSpec,
	];
	const HasSemantics = [
	    MetadataTables.Event,
	    MetadataTables.Property,
	];
	const MethodDefOrRef = [
	    MetadataTables.MethodDef,
	    MetadataTables.MemberRef,
	];
	const MemberForwarded = [
	    MetadataTables.Field,
	    MetadataTables.MethodDef,
	];
	const Implementation = [
	    MetadataTables.File,
	    MetadataTables.AssemblyRef,
	    MetadataTables.ExportedType,
	];
	const CustomAttributeType = [
	    MetadataTables.NotUsed,
	    MetadataTables.NotUsed,
	    MetadataTables.MethodDef,
	    MetadataTables.MemberRef,
	    MetadataTables.NotUsed,
	];
	const ResolutionScope = [
	    MetadataTables.Module,
	    MetadataTables.ModuleRef,
	    MetadataTables.AssemblyRef,
	    MetadataTables.TypeRef,
	];
	const TypeOrMethodDef = [
	    MetadataTables.TypeDef,
	    MetadataTables.MethodDef,
	];

	class CodedIndexColumn {
	    indexSize;
	    tables;
	    readCodedIndex;
	    setCodedIndex;
	    getTag;
	    getTableIndex;
	    constructor(tableStreamHeader, tables, setCodedIndex) {
	        this.tables = tables;
	        this.setCodedIndex = setCodedIndex;
	        const tagBits = getMinBitsRepresenting(tables.length);
	        // fake tags (NotUsed) have no row count, so they must not participate in the maximum
	        const rowCounts = tables.map(t => tableStreamHeader.tableRowCounts[t]).filter(c => c !== undefined);
	        const largestTableRows = Math.max(0, ...rowCounts);
	        const tableIndexBits = getMinBitsRepresenting(largestTableRows + 1);
	        const totalBits = tagBits + tableIndexBits;
	        this.indexSize = totalBits <= 16 ? 2 : 4;
	        this.readCodedIndex = this.indexSize == 2
	            ? (view, offset) => view.getUint16(offset, true)
	            : (view, offset) => view.getUint32(offset, true);
	        this.getTag = codedIndex => codedIndex & getLowerBitsMask(tagBits);
	        this.getTableIndex = codedIndex => codedIndex >> tagBits;
	    }
	    read(view, offset, row) {
	        const codedIndex = this.readCodedIndex(view, offset);
	        // TODO: use the 3 things below
	        const tableTag = this.getTag(codedIndex);
	        this.tables[tableTag];
	        this.getTableIndex(codedIndex);
	        this.setCodedIndex(row, codedIndex);
	        return this.indexSize;
	    }
	}
	function getMinBitsRepresenting(value) {
	    // 0 => 1   clz32(0) = 32
	    // 1 => 1   clz32(1) = 31
	    // 2 => 1   clz32(2) = 30
	    // 3 => 2   clz32(3) = 30
	    // 4 => 2   clz32(4) = 29
	    // 5 => 3   clz32(5) = 29
	    // ...
	    // 8 => 3   clz32(8) = 28
	    // 9 => 4   clz32(9) = 28
	    // ...
	    // 16 => 4  clz32(16) = 27
	    if (value <= 1) {
	        return 1;
	    }
	    return 32 - Math.clz32(value - 1);
	}
	function getLowerBitsMask(numBits) {
	    // 0 => 0
	    // 1 => 0x01
	    // 2 => 0x03
	    // 3 => 0x07
	    // 4 => 0x0F
	    // 5 => 0x1F
	    // ...
	    return (1 << numBits) - 1;
	}

	class GuidReferenceColumn {
	    guidHeapSize;
	    readIndex;
	    setIndex;
	    // TODO: read actual Guid from Guid heap
	    constructor(guidHeapSize, setIndex) {
	        this.guidHeapSize = guidHeapSize;
	        this.setIndex = setIndex;
	        this.readIndex = guidHeapSize == 2
	            ? (view, offset) => view.getUint16(offset, true)
	            : (view, offset) => view.getUint32(offset, true);
	    }
	    read(view, offset, row) {
	        const index = this.readIndex(view, offset);
	        this.setIndex(row, index);
	        return this.guidHeapSize;
	    }
	}

	class StringReferenceColumn {
	    stringHeap;
	    readIndex;
	    setIndex;
	    setString;
	    constructor(stringHeap, setIndex, setString) {
	        this.stringHeap = stringHeap;
	        this.readIndex = stringHeap.indexSizeBytes == 2
	            ? (view, offset) => view.getUint16(offset, true)
	            : (view, offset) => view.getUint32(offset, true);
	        this.setIndex = setIndex;
	        this.setString = setString;
	    }
	    read(view, offset, row) {
	        const index = this.readIndex(view, offset);
	        this.setIndex(row, index);
	        const value = this.stringHeap.getString(index);
	        this.setString(row, value);
	        return this.stringHeap.indexSizeBytes;
	    }
	}

	class TableIndexColumn {
	    indexSize;
	    table;
	    readIndex;
	    setIndex;
	    constructor(tableStreamHeader, table, setIndex) {
	        this.indexSize = tableStreamHeader.tableRowCounts[table] < 65536 ? 2 : 4;
	        this.table = table;
	        this.setIndex = setIndex;
	        this.readIndex = this.indexSize == 2
	            ? (view, offset) => view.getUint16(offset, true)
	            : (view, offset) => view.getUint32(offset, true);
	    }
	    read(view, offset, row) {
	        const index = this.readIndex(view, offset);
	        this.setIndex(row, index);
	        return this.indexSize;
	    }
	}

	class UintColumn {
	    size;
	    readValue;
	    setValue;
	    constructor(size, setValue) {
	        this.size = size;
	        this.setValue = setValue;
	        if (size == 1) {
	            this.readValue = (view, offset) => view.getUint8(offset);
	        }
	        else if (size == 2) {
	            this.readValue = (view, offset) => view.getUint16(offset, true);
	        }
	        else if (size == 4) {
	            this.readValue = (view, offset) => view.getUint32(offset, true);
	        }
	        else {
	            throw new Error(`Unsupported column size: ${size}`);
	        }
	    }
	    read(view, offset, row) {
	        const value = this.readValue(view, offset);
	        this.setValue(row, value);
	        return this.size;
	    }
	}

	function Module(tableStreamHeader, stringHeap, blobHeap, guidHeap) {
	    return [
	        new UintColumn(2, (row, value) => row.generation = value),
	        new StringReferenceColumn(stringHeap, (row, index) => row.nameIndex = index, (row, value) => row.name = value),
	        new GuidReferenceColumn(guidHeap.indexSizeBytes, (row, value) => row.mvidIndex = value),
	        new GuidReferenceColumn(guidHeap.indexSizeBytes, (row, value) => row.encIdIndex = value),
	        new GuidReferenceColumn(guidHeap.indexSizeBytes, (row, value) => row.encBaseIdIndex = value),
	    ];
	}
	function TypeRef(tableStreamHeader, stringHeap, blobHeap, guidHeap) {
	    return [
	        new CodedIndexColumn(tableStreamHeader, ResolutionScope, (row, index) => row.resolutionScopeCI = index),
	        new StringReferenceColumn(stringHeap, (row, index) => row.typeNameIndex = index, (row, value) => row.typeName = value),
	        new StringReferenceColumn(stringHeap, (row, index) => row.typeNamespaceIndex = index, (row, value) => row.typeNamespace = value),
	    ];
	}
	function TypeDef(tableStreamHeader, stringHeap, blobHeap, guidHeap) {
	    return [
	        new UintColumn(4, (row, value) => row.flags = value),
	        new StringReferenceColumn(stringHeap, (row, index) => row.typeNameIndex = index, (row, value) => row.typeName = value),
	        new StringReferenceColumn(stringHeap, (row, index) => row.typeNamespaceIndex = index, (row, value) => row.typeNamespace = value),
	        new CodedIndexColumn(tableStreamHeader, TypeDefOrRef, (row, index) => row.extendsCI = index),
	        new TableIndexColumn(tableStreamHeader, MetadataTables$1.Field, (row, index) => row.fieldListIndex = index),
	        new TableIndexColumn(tableStreamHeader, MetadataTables$1.MethodDef, (row, index) => row.methodListIndex = index),
	    ];
	}
	function Field(tableStreamHeader, stringHeap, blobHeap, guidHeap) {
	    return [
	        new UintColumn(2, (row, value) => row.flags = value),
	        new StringReferenceColumn(stringHeap, (row, index) => row.nameIndex = index, (row, value) => row.name = value),
	        new BlobReferenceColumn(blobHeap, (row, index) => row.signatureIndex = index, (row, data) => row.signatureData = data),
	    ];
	}
	function MethodDef(tableStreamHeader, stringHeap, blobHeap, guidHeap) {
	    return [
	        new UintColumn(4, (row, value) => row.rva = value),
	        new UintColumn(2, (row, value) => row.implFlags = value),
	        new UintColumn(2, (row, value) => row.flags = value),
	        new StringReferenceColumn(stringHeap, (row, index) => row.nameIndex = index, (row, value) => row.name = value),
	        new BlobReferenceColumn(blobHeap, (row, index) => row.signatureIndex = index, (row, data) => row.signatureData = data),
	        new TableIndexColumn(tableStreamHeader, MetadataTables$1.Param, (row, index) => row.paramListIndex = index),
	    ];
	}
	function Param(tableStreamHeader, stringHeap, blobHeap, guidHeap) {
	    return [
	        new UintColumn(2, (row, value) => row.flags = value),
	        new UintColumn(2, (row, value) => row.sequence = value),
	        new StringReferenceColumn(stringHeap, (row, index) => row.nameIndex = index, (row, value) => row.name = value),
	    ];
	}
	function Interface(tableStreamHeader, stringHeap, blobHeap, guidHeap) {
	    return [
	        new TableIndexColumn(tableStreamHeader, MetadataTables$1.TypeDef, (row, index) => row.classIndex = index),
	        new CodedIndexColumn(tableStreamHeader, TypeDefOrRef, (row, index) => row.interfaceCI = index),
	    ];
	}
	function MemberRef(tableStreamHeader, stringHeap, blobHeap, guidHeap) {
	    return [
	        new CodedIndexColumn(tableStreamHeader, MemberRefParent, (row, index) => row.classCI = index),
	        new StringReferenceColumn(stringHeap, (row, index) => row.nameIndex = index, (row, value) => row.name = value),
	        new BlobReferenceColumn(blobHeap, (row, index) => row.signatureIndex = index, (row, data) => row.signatureData = data),
	    ];
	}
	function Constant(tableStreamHeader, stringHeap, blobHeap, guidHeap) {
	    return [
	        new UintColumn(2, (row, value) => row.type = value),
	        new CodedIndexColumn(tableStreamHeader, HasConstant, (row, index) => row.parentCI = index),
	        new BlobReferenceColumn(blobHeap, (row, index) => row.valueIndex = index, (row, data) => row.value = data),
	    ];
	}
	function CustomAttribute(tableStreamHeader, stringHeap, blobHeap, guidHeap) {
	    return [
	        new CodedIndexColumn(tableStreamHeader, HasCustomAttribute, (row, index) => row.parentCI = index),
	        new CodedIndexColumn(tableStreamHeader, CustomAttributeType, (row, index) => row.typeCI = index),
	        new BlobReferenceColumn(blobHeap, (row, index) => row.valueIndex = index, (row, data) => row.value = data),
	    ];
	}
	function FieldMarshal(tableStreamHeader, stringHeap, blobHeap, guidHeap) {
	    return [
	        new CodedIndexColumn(tableStreamHeader, HasFieldMarshall, (row, index) => row.parentCI = index),
	        new BlobReferenceColumn(blobHeap, (row, index) => row.nativeTypeIndex = index, (row, data) => row.nativeType = data),
	    ];
	}
	function DeclSecurity(tableStreamHeader, stringHeap, blobHeap, guidHeap) {
	    return [
	        new UintColumn(2, (row, value) => row.action = value),
	        new CodedIndexColumn(tableStreamHeader, HasDeclSecurity, (row, index) => row.parentCI = index),
	        new BlobReferenceColumn(blobHeap, (row, index) => row.permissionSetIndex = index, (row, data) => row.permissionSet = data),
	    ];
	}
	function ClassLayout(tableStreamHeader, stringHeap, blobHeap, guidHeap) {
	    return [
	        new UintColumn(2, (row, value) => row.packingSize = value),
	        new UintColumn(4, (row, value) => row.classSize = value),
	        new TableIndexColumn(tableStreamHeader, MetadataTables$1.TypeDef, (row, index) => row.parentIndex = index),
	    ];
	}
	function FieldLayout(tableStreamHeader, stringHeap, blobHeap, guidHeap) {
	    return [
	        new UintColumn(4, (row, value) => row.offset = value),
	        new TableIndexColumn(tableStreamHeader, MetadataTables$1.Field, (row, index) => row.fieldIndex = index),
	    ];
	}
	function StandAloneSig(tableStreamHeader, stringHeap, blobHeap, guidHeap) {
	    return [
	        new BlobReferenceColumn(blobHeap, (row, index) => row.signatureIndex = index, (row, data) => row.signatureData = data),
	    ];
	}
	function EventMap(tableStreamHeader, stringHeap, blobHeap, guidHeap) {
	    return [
	        new TableIndexColumn(tableStreamHeader, MetadataTables$1.TypeDef, (row, index) => row.parentIndex = index),
	        new TableIndexColumn(tableStreamHeader, MetadataTables$1.Event, (row, index) => row.eventListIndex = index),
	    ];
	}
	function Event(tableStreamHeader, stringHeap, blobHeap, guidHeap) {
	    return [
	        new UintColumn(2, (row, value) => row.eventFlags = value),
	        new StringReferenceColumn(stringHeap, (row, index) => row.nameIndex = index, (row, value) => row.name = value),
	        new CodedIndexColumn(tableStreamHeader, TypeDefOrRef, (row, index) => row.eventTypeCI = index),
	    ];
	}
	function PropertyMap(tableStreamHeader, stringHeap, blobHeap, guidHeap) {
	    return [
	        new TableIndexColumn(tableStreamHeader, MetadataTables$1.TypeDef, (row, index) => row.parentIndex = index),
	        new TableIndexColumn(tableStreamHeader, MetadataTables$1.Property, (row, index) => row.propertyListIndex = index),
	    ];
	}
	function Property(tableStreamHeader, stringHeap, blobHeap, guidHeap) {
	    return [
	        new UintColumn(2, (row, value) => row.flags = value),
	        new StringReferenceColumn(stringHeap, (row, index) => row.nameIndex = index, (row, value) => row.name = value),
	        new BlobReferenceColumn(blobHeap, (row, index) => row.typeIndex = index, (row, data) => row.typeData = data),
	    ];
	}
	function MethodSemantics(tableStreamHeader, stringHeap, blobHeap, guidHeap) {
	    return [
	        new UintColumn(2, (row, value) => row.semantics = value),
	        new TableIndexColumn(tableStreamHeader, MetadataTables$1.MethodDef, (row, index) => row.methodIndex = index),
	        new CodedIndexColumn(tableStreamHeader, HasSemantics, (row, index) => row.associationCI = index),
	    ];
	}
	function MethodImpl(tableStreamHeader, stringHeap, blobHeap, guidHeap) {
	    return [
	        new TableIndexColumn(tableStreamHeader, MetadataTables$1.TypeDef, (row, index) => row.classIndex = index),
	        new CodedIndexColumn(tableStreamHeader, MethodDefOrRef, (row, index) => row.methodBodyCI = index),
	        new CodedIndexColumn(tableStreamHeader, MethodDefOrRef, (row, index) => row.methodDeclarationCI = index),
	    ];
	}
	function ModuleRef(tableStreamHeader, stringHeap, blobHeap, guidHeap) {
	    return [
	        new StringReferenceColumn(stringHeap, (row, index) => row.nameIndex = index, (row, value) => row.name = value),
	    ];
	}
	function TypeSpec(tableStreamHeader, stringHeap, blobHeap, guidHeap) {
	    return [
	        new BlobReferenceColumn(blobHeap, (row, index) => row.signatureIndex = index, (row, data) => row.signatureData = data),
	    ];
	}
	function ImplMap(tableStreamHeader, stringHeap, blobHeap, guidHeap) {
	    return [
	        new UintColumn(2, (row, value) => row.mappingFlags = value),
	        new CodedIndexColumn(tableStreamHeader, MemberForwarded, (row, index) => row.memberForwardedCI = index),
	        new StringReferenceColumn(stringHeap, (row, index) => row.importNameIndex = index, (row, value) => row.importName = value),
	        new TableIndexColumn(tableStreamHeader, MetadataTables$1.ModuleRef, (row, index) => row.importScopeIndex = index),
	    ];
	}
	function FieldRva(tableStreamHeader, stringHeap, blobHeap, guidHeap) {
	    return [
	        new UintColumn(4, (row, value) => row.rva = value),
	        new TableIndexColumn(tableStreamHeader, MetadataTables$1.Field, (row, index) => row.fieldIndex = index),
	    ];
	}
	function Assembly(tableStreamHeader, stringHeap, blobHeap, guidHeap) {
	    return [
	        new UintColumn(4, (row, value) => row.hashAlgId = value),
	        new UintColumn(2, (row, value) => row.majorVersion = value),
	        new UintColumn(2, (row, value) => row.minorVersion = value),
	        new UintColumn(2, (row, value) => row.buildNumber = value),
	        new UintColumn(2, (row, value) => row.revisionNumber = value),
	        new UintColumn(4, (row, value) => row.flags = value),
	        new BlobReferenceColumn(blobHeap, (row, index) => row.publicKeyIndex = index, (row, data) => row.publicKeyData = data),
	        new StringReferenceColumn(stringHeap, (row, index) => row.nameIndex = index, (row, value) => row.name = value),
	        new StringReferenceColumn(stringHeap, (row, index) => row.cultureIndex = index, (row, value) => row.culture = value),
	    ];
	}
	function AssemblyProcessor(tableStreamHeader, stringHeap, blobHeap, guidHeap) {
	    return [
	        new UintColumn(4, (row, value) => row.processor = value),
	    ];
	}
	function AssemblyOs(tableStreamHeader, stringHeap, blobHeap, guidHeap) {
	    return [
	        new UintColumn(4, (row, value) => row.osPlarformId = value),
	        new UintColumn(4, (row, value) => row.osMajorVersion = value),
	        new UintColumn(4, (row, value) => row.osMinorVersion = value),
	    ];
	}
	function AssemblyRef(tableStreamHeader, stringHeap, blobHeap, guidHeap) {
	    return [
	        new UintColumn(2, (row, value) => row.majorVersion = value),
	        new UintColumn(2, (row, value) => row.minorVersion = value),
	        new UintColumn(2, (row, value) => row.buildNumber = value),
	        new UintColumn(2, (row, value) => row.revisionNumber = value),
	        new UintColumn(4, (row, value) => row.flags = value),
	        new BlobReferenceColumn(blobHeap, (row, index) => row.publicKeyOrTokenIndex = index, (row, data) => row.publicKeyOrTokenData = data),
	        new StringReferenceColumn(stringHeap, (row, index) => row.nameIndex = index, (row, value) => row.name = value),
	        new StringReferenceColumn(stringHeap, (row, index) => row.cultureIndex = index, (row, value) => row.culture = value),
	        new BlobReferenceColumn(blobHeap, (row, index) => row.hashValueIndex = index, (row, data) => row.hashValueData = data),
	    ];
	}
	function AssemblyRefProcessor(tableStreamHeader, stringHeap, blobHeap, guidHeap) {
	    return [
	        new UintColumn(4, (row, value) => row.processor = value),
	        new TableIndexColumn(tableStreamHeader, MetadataTables$1.AssemblyRef, (row, index) => row.assemblyRefIndex = index),
	    ];
	}
	function AssemblyRefOs(tableStreamHeader, stringHeap, blobHeap, guidHeap) {
	    return [
	        new UintColumn(4, (row, value) => row.osPlarformId = value),
	        new UintColumn(4, (row, value) => row.osMajorVersion = value),
	        new UintColumn(4, (row, value) => row.osMinorVersion = value),
	        new TableIndexColumn(tableStreamHeader, MetadataTables$1.AssemblyRef, (row, index) => row.assemblyRefIndex = index),
	    ];
	}
	function File(tableStreamHeader, stringHeap, blobHeap, guidHeap) {
	    return [
	        new UintColumn(4, (row, value) => row.flags = value),
	        new StringReferenceColumn(stringHeap, (row, index) => row.nameIndex = index, (row, value) => row.name = value),
	        new BlobReferenceColumn(blobHeap, (row, index) => row.hashValueIndex = index, (row, data) => row.hashValue = data),
	    ];
	}
	function ExportedType(tableStreamHeader, stringHeap, blobHeap, guidHeap) {
	    return [
	        new UintColumn(4, (row, value) => row.flags = value),
	        new TableIndexColumn(tableStreamHeader, MetadataTables$1.TypeDef, (row, index) => row.typeDefIdIndex = index),
	        new StringReferenceColumn(stringHeap, (row, index) => row.typeNameIndex = index, (row, value) => row.typeName = value),
	        new StringReferenceColumn(stringHeap, (row, index) => row.typeNamespaceIndex = index, (row, value) => row.typeNamespace = value),
	        new CodedIndexColumn(tableStreamHeader, Implementation, (row, index) => row.implementationCI = index),
	    ];
	}
	function ManifestResource(tableStreamHeader, stringHeap, blobHeap, guidHeap) {
	    return [
	        new UintColumn(4, (row, value) => row.offset = value),
	        new UintColumn(4, (row, value) => row.flags = value),
	        new StringReferenceColumn(stringHeap, (row, index) => row.nameIndex = index, (row, value) => row.name = value),
	        new CodedIndexColumn(tableStreamHeader, Implementation, (row, index) => row.implementationCI = index),
	    ];
	}
	function NestedClass(tableStreamHeader, stringHeap, blobHeap, guidHeap) {
	    return [
	        new TableIndexColumn(tableStreamHeader, MetadataTables$1.TypeDef, (row, index) => row.nestedClassIndex = index),
	        new TableIndexColumn(tableStreamHeader, MetadataTables$1.TypeDef, (row, index) => row.enclosingClassIndex = index),
	    ];
	}
	function GenericParam(tableStreamHeader, stringHeap, blobHeap, guidHeap) {
	    return [
	        new UintColumn(2, (row, value) => row.number = value),
	        new UintColumn(2, (row, value) => row.flags = value),
	        new CodedIndexColumn(tableStreamHeader, TypeOrMethodDef, (row, index) => row.ownerCI = index),
	        new StringReferenceColumn(stringHeap, (row, index) => row.nameIndex = index, (row, value) => row.name = value),
	    ];
	}
	function MethodSpec(tableStreamHeader, stringHeap, blobHeap, guidHeap) {
	    return [
	        new CodedIndexColumn(tableStreamHeader, MethodDefOrRef, (row, index) => row.methodCI = index),
	        new BlobReferenceColumn(blobHeap, (row, index) => row.instantiationIndex = index, (row, data) => row.instantiation = data),
	    ];
	}
	function GenericParamConstraint(tableStreamHeader, stringHeap, blobHeap, guidHeap) {
	    return [
	        new TableIndexColumn(tableStreamHeader, MetadataTables$1.GenericParamConstraint, (row, index) => row.ownerIndex = index),
	        new CodedIndexColumn(tableStreamHeader, TypeDefOrRef, (row, index) => row.constraintCI = index),
	    ];
	}

	class BinaryHeap extends HeapBase {
	    constructor(heapData, indexSizeBytes) {
	        super(heapData, indexSizeBytes);
	    }
	    getBinaryData(offset, length) {
	        return new DataView(this.heapData.buffer, this.heapData.byteOffset + offset, length);
	    }
	}

	class CliFile {
	    exe;
	    header = null;
	    metadataRoot = null;
	    metadataTableStreamHeader = null;
	    metadata = null;
	    constructor(file) {
	        this.exe = NtExecutable.from(file, { ignoreCert: true });
	    }
	    getCliHeader() {
	        if (this.header) {
	            return this.header;
	        }
	        const cliHeaderDirectoryEntry = this.exe.newHeader.optionalHeaderDataDirectory.get(ImageDirectoryEntry.ComDescriptor);
	        const sectionContainingCliHeader = this.exe.getSectionByEntry(ImageDirectoryEntry.ComDescriptor);
	        if (!sectionContainingCliHeader || !sectionContainingCliHeader.data) {
	            throw new Error("Missing section containing CLI header");
	        }
	        const cliHeaderOffsetInSection = cliHeaderDirectoryEntry.virtualAddress - sectionContainingCliHeader.info.virtualAddress;
	        const view = new DataView(sectionContainingCliHeader.data, cliHeaderOffsetInSection, 72);
	        this.header = {
	            cbSize: view.getUint32(0, true),
	            majorRuntimeVersion: view.getUint16(4, true),
	            minorRuntimeVersion: view.getUint16(6, true),
	            metaData: CliFile.getRVA(view, 8),
	            flags: view.getUint32(16, true),
	            entryPointToken: view.getUint32(20, true),
	            resources: CliFile.getRVA(view, 24),
	            strongNameSignature: CliFile.getRVA(view, 32),
	            codeManagerTable: CliFile.getRVA(view, 40),
	            vTableFixups: CliFile.getRVA(view, 48),
	            exportAddressTableJumps: CliFile.getRVA(view, 56),
	            managedNativeHeader: CliFile.getRVA(view, 64),
	        };
	        return this.header;
	    }
	    getCliMetadataRoot() {
	        if (this.metadataRoot) {
	            return this.metadataRoot;
	        }
	        const header = this.getCliHeader();
	        const section = CliFile.getSectionByRva(this.exe, header.metaData);
	        if (!section || !section.data) {
	            throw new Error("Can't find section containing metadata root");
	        }
	        const metadataRootOffsetInSection = header.metaData.virtualAddress - section.info.virtualAddress;
	        const view = new DataView(section.data, metadataRootOffsetInSection);
	        const metadataRoot = {
	            signature: view.getUint32(0, true),
	            majorVersion: view.getUint16(4, true),
	            minorVersion: view.getUint16(6, true),
	            reserved: view.getUint32(8, true),
	            versionLength: view.getUint32(12, true),
	            version: "",
	            flags: 0,
	            streamCount: 0,
	            streamHeaders: [],
	        };
	        const flagsOffset = 16 + roundUpToNearest(metadataRoot.versionLength, 4);
	        metadataRoot.flags = view.getUint16(flagsOffset, true);
	        metadataRoot.streamCount = view.getUint16(flagsOffset + 2, true);
	        metadataRoot.version = getUtf8String(section.data, metadataRootOffsetInSection + 16, metadataRoot.versionLength);
	        let offset = flagsOffset + 4;
	        for (let i = 0; i < metadataRoot.streamCount; ++i) {
	            const result = CliFile.getCliMetadataStreamHeader(view, offset);
	            metadataRoot.streamHeaders.push(result.header);
	            offset += result.totalBytesRead;
	        }
	        this.metadataRoot = metadataRoot;
	        return this.metadataRoot;
	    }
	    getCliMetadataTableStreamHeader() {
	        if (this.metadataTableStreamHeader) {
	            return this.metadataTableStreamHeader;
	        }
	        const metadataStream = this.getMetadataStream("#~");
	        return CliFile.readCliMetadataTableHeader(metadataStream).header;
	    }
	    getCliMetadata() {
	        if (this.metadata) {
	            return this.metadata;
	        }
	        const metadataStream = this.getMetadataStream("#~");
	        const stringHeapStream = this.getMetadataStream("#Strings");
	        const guidHeapStream = this.getMetadataStream("#GUID");
	        const blobHeapStream = this.getMetadataStream("#Blob");
	        const headerReadResult = CliFile.readCliMetadataTableHeader(metadataStream);
	        const tableHeader = headerReadResult.header;
	        const stringHeap = new StringHeap(stringHeapStream, tableHeader.heapSizes & HeapSizes$1.StringStreamUses32BitIndexes ? 4 : 2);
	        const guidHeap = new GuidHeap(guidHeapStream, tableHeader.heapSizes & HeapSizes$1.GuidStreamUses32BitIndexes ? 4 : 2);
	        const blobHeap = new BinaryHeap(blobHeapStream, tableHeader.heapSizes & HeapSizes$1.BlobStreamUses32BitIndexes ? 4 : 2);
	        let offset = headerReadResult.totalBytesRead;
	        function readTable(table, createRow, getColumns) {
	            const columns = getColumns(tableHeader, stringHeap, blobHeap, guidHeap);
	            const result = getRowsFromBytes(table, metadataStream, offset, createRow, columns, tableHeader);
	            offset += result.bytesRead || 0;
	            return result.rows;
	        }
	        const module = readTable(MetadataTables$1.Module, () => new ModuleTableRow(), Module);
	        const typeRef = readTable(MetadataTables$1.TypeRef, () => new TypeRefTableRow(), TypeRef);
	        const typeDef = readTable(MetadataTables$1.TypeDef, () => new TypeDefTableRow(), TypeDef);
	        const field = readTable(MetadataTables$1.Field, () => new FieldTableRow(), Field);
	        const methodDef = readTable(MetadataTables$1.MethodDef, () => new MethodDefRow(), MethodDef);
	        const param = readTable(MetadataTables$1.Param, () => new ParamRow(), Param);
	        const interfaceImpl = readTable(MetadataTables$1.InterfaceImpl, () => new InterfaceImplRow(), Interface);
	        const memberRef = readTable(MetadataTables$1.MemberRef, () => new MemberRefRow, MemberRef);
	        const constant = readTable(MetadataTables$1.Constant, () => new ConstantRow(), Constant);
	        const customAttribute = readTable(MetadataTables$1.CustomAttribute, () => new CustomAttributeRow(), CustomAttribute);
	        const fieldMarshal = readTable(MetadataTables$1.FieldMarshal, () => new FieldMarshalRow(), FieldMarshal);
	        const declSecurity = readTable(MetadataTables$1.DeclSecurity, () => new DeclSecurityRow, DeclSecurity);
	        const classLayout = readTable(MetadataTables$1.ClassLayout, () => new ClassLayoutRow(), ClassLayout);
	        const fieldLayout = readTable(MetadataTables$1.FieldLayout, () => new FieldLayoutRow(), FieldLayout);
	        const standAloneSig = readTable(MetadataTables$1.StandAloneSig, () => new StandAloneSigRow(), StandAloneSig);
	        const eventMap = readTable(MetadataTables$1.EventMap, () => new EventMapRow(), EventMap);
	        const event = readTable(MetadataTables$1.Event, () => new EventRow(), Event);
	        const propertyMap = readTable(MetadataTables$1.PropertyMap, () => new PropertyMapRow(), PropertyMap);
	        const property = readTable(MetadataTables$1.Property, () => new PropertyRow(), Property);
	        const methodSemantics = readTable(MetadataTables$1.MethodSemantics, () => new MethodSemanticsRow(), MethodSemantics);
	        const methodImpl = readTable(MetadataTables$1.MethodImpl, () => new MethodImplRow(), MethodImpl);
	        const moduleRef = readTable(MetadataTables$1.ModuleRef, () => new ModuleRefRow(), ModuleRef);
	        const typeSpec = readTable(MetadataTables$1.TypeSpec, () => new TypeSpecRow, TypeSpec);
	        const implMap = readTable(MetadataTables$1.ImplMap, () => new ImplMapRow(), ImplMap);
	        const fieldRva = readTable(MetadataTables$1.FieldRVA, () => new FieldRvaRow(), FieldRva);
	        const assembly = readTable(MetadataTables$1.Assembly, () => new AssemblyRow(), Assembly);
	        const assemblyProcessor = readTable(MetadataTables$1.AssemblyProcessor, () => new AssemblyProcessorRow, AssemblyProcessor);
	        const assemblyOs = readTable(MetadataTables$1.AssemblyOS, () => new AssemblyOsRow(), AssemblyOs);
	        const assemblyRef = readTable(MetadataTables$1.AssemblyRef, () => new AssemblyRefRow(), AssemblyRef);
	        const assemblyRefProcessor = readTable(MetadataTables$1.AssemblyRefProcessor, () => new AssemblyRefProcessorRow(), AssemblyRefProcessor);
	        const assemblyRefOs = readTable(MetadataTables$1.AssemblyRefOS, () => new AssemblyRefOsRow(), AssemblyRefOs);
	        const file = readTable(MetadataTables$1.File, () => new FileRow(), File);
	        const exportedType = readTable(MetadataTables$1.ExportedType, () => new ExportedTypeRow(), ExportedType);
	        const manifestResource = readTable(MetadataTables$1.ManifestResource, () => new ManifestResourceRow(), ManifestResource);
	        const nestedClass = readTable(MetadataTables$1.NestedClass, () => new NestedClassRow(), NestedClass);
	        const genericParam = readTable(MetadataTables$1.GenericParam, () => new GenericParamRow(), GenericParam);
	        const methodSpec = readTable(MetadataTables$1.MethodSpec, () => new MethodSpecRow(), MethodSpec);
	        const genericParamConstraint = readTable(MetadataTables$1.GenericParamConstraint, () => new GenericParamConstraintRow(), GenericParamConstraint);
	        setupFieldsAndMethods(typeDef, field, methodDef);
	        this.metadata = {
	            module: module,
	            typeRef: typeRef,
	            typeDef: typeDef,
	            field: field,
	            methodDef: methodDef,
	            param: param,
	            interfaceImpl: interfaceImpl,
	            memberRef: memberRef,
	            constant: constant,
	            customAttribute: customAttribute,
	            fieldMarshal: fieldMarshal,
	            declSecurity: declSecurity,
	            classLayout: classLayout,
	            fieldLayout: fieldLayout,
	            standAloneSig: standAloneSig,
	            eventMap: eventMap,
	            event: event,
	            propertyMap: propertyMap,
	            property: property,
	            methodSemantics: methodSemantics,
	            methodImpl: methodImpl,
	            moduleRef: moduleRef,
	            typeSpec: typeSpec,
	            implMap: implMap,
	            fieldRva: fieldRva,
	            assembly: assembly,
	            assemblyProcessor: assemblyProcessor,
	            assemblyOs: assemblyOs,
	            assemblyRef: assemblyRef,
	            assemblyRefProcessor: assemblyRefProcessor,
	            assemblyRefOs: assemblyRefOs,
	            file: file,
	            exportedType: exportedType,
	            manifestResource: manifestResource,
	            nestedClass: nestedClass,
	            genericParam: genericParam,
	            methodSpec: methodSpec,
	            genericParamConstraint: genericParamConstraint,
	        };
	        return this.metadata;
	    }
	    getMetadataStream(streamName) {
	        const metadataRva = this.getCliHeader().metaData;
	        const metadataRoot = this.getCliMetadataRoot();
	        const metadataStreamHeader = metadataRoot.streamHeaders.find(h => h.streamName === streamName);
	        if (!metadataStreamHeader) {
	            throw new Error(`Can't find ${streamName} stream header`);
	        }
	        const section = CliFile.getSectionByRva(this.exe, metadataRva);
	        if (!section || !section.data) {
	            throw new Error(`Can't find section containing ${streamName} stream`);
	        }
	        const metadataRootOffsetInSection = metadataRva.virtualAddress - section.info.virtualAddress;
	        const metadataStreamOffset = metadataRootOffsetInSection + metadataStreamHeader.metadataRootOffset;
	        return new DataView(section.data, metadataStreamOffset, metadataStreamHeader.streamSize);
	    }
	    static readCliMetadataTableHeader(view) {
	        const header = {
	            reserved: view.getUint32(0, true),
	            majorVersion: view.getUint8(4),
	            minorVersion: view.getUint8(5),
	            heapSizes: view.getUint8(6),
	            reserved2: view.getUint8(7),
	            presentTables: getBoolArrayFromBitmask(view.getBigUint64(8, true)),
	            sortedTables: getBoolArrayFromBitmask(view.getBigUint64(16, true)),
	            tableRowCounts: [],
	        };
	        const numTables = header.presentTables.reduce((acc, val) => acc + (val ? 1 : 0), 0);
	        let tableIndex = 0;
	        for (let i = 0; i < header.presentTables.length; ++i) {
	            if (header.presentTables[i]) {
	                const rowCount = view.getUint32(24 + tableIndex * 4, true);
	                ++tableIndex;
	                header.tableRowCounts.push(rowCount);
	            }
	            else {
	                header.tableRowCounts.push(0);
	            }
	        }
	        return {
	            header: header,
	            totalBytesRead: 24 + numTables * 4,
	        };
	    }
	    static getCliMetadataStreamHeader(view, offset) {
	        const header = {
	            metadataRootOffset: view.getUint32(offset, true),
	            streamSize: view.getUint32(offset + 4, true),
	            streamName: "",
	        };
	        const stringReadResult = getNullTerminatedUtf8String(view, offset + 8);
	        header.streamName = stringReadResult.string;
	        return {
	            header: header,
	            totalBytesRead: 8 + roundUpToNearest(stringReadResult.bytesRead + 1, 4), // string must have at least one trailing \0 character
	        };
	    }
	    static getSectionByRva(exe, rva) {
	        const section = exe.getAllSections().find(s => {
	            const sectionEnd = s.info.virtualAddress + s.info.virtualSize;
	            return rva.virtualAddress >= s.info.virtualAddress && rva.virtualAddress < sectionEnd;
	        });
	        return section ? section : null;
	    }
	    static getRVA(dv, offset) {
	        return {
	            virtualAddress: dv.getUint32(offset, true),
	            size: dv.getUint32(offset + 4, true),
	        };
	    }
	}
	function setupFieldsAndMethods(typeDef, field, methodDef) {
	    if (typeDef === null) {
	        return;
	    }
	    for (let i = 0; i < typeDef.length; ++i) {
	        (function () {
	            if (typeDef[i].fieldListIndex > 0 && field != null) {
	                const start = typeDef[i].fieldListIndex - 1;
	                if (start === field.length) {
	                    return;
	                }
	                const end = i < typeDef.length - 1 ? typeDef[i + 1].fieldListIndex - 1 : field.length;
	                if (start === end) {
	                    return;
	                }
	                typeDef[i].fieldList = field.slice(start, end);
	            }
	        })();
	        (function () {
	            if (typeDef[i].methodListIndex > 0 && methodDef != null) {
	                const start = typeDef[i].methodListIndex - 1;
	                const end = i < typeDef.length - 1 ? typeDef[i + 1].methodListIndex - 1 : methodDef.length;
	                if (start === end) {
	                    return;
	                }
	                typeDef[i].methodList = methodDef.slice(start, end);
	            }
	        })();
	    }
	}

	class EntryViewModel {
	    entry;
	    constructor(entry) {
	        this.entry = knockoutLatestExports.observable(entry);
	    }
	    filename = knockoutLatestExports.pureComputed(() => {
	        return this.entry().filename;
	    });
	    viewable = knockoutLatestExports.pureComputed(() => {
	        const v = this.entry();
	        const filename = v.filename;
	        return allAllowedExtensions.some(extension => filename.endsWith(extension));
	    });
	    click = async (self) => {
	        const entry = self.entry();
	        if (!('getData' in entry) || !entry.getData) {
	            return;
	        }
	        if (isText(self.entry())) {
	            const writer = new TextWriter();
	            const data = await entry.getData(writer);
	            const pre = document.createElement('pre');
	            pre.innerText = data;
	            PopupHelper.showPopup(pre);
	        }
	        else if (isImage(self.entry())) {
	            const writer = new Data64URIWriter();
	            const data = await entry.getData(writer);
	            const img = document.createElement('img');
	            img.src = data;
	            PopupHelper.showPopup(img);
	        }
	        else if (isExecutable(self.entry())) {
	            const writer = new BlobWriter();
	            const blob = await entry.getData(writer);
	            const data = await blob.arrayBuffer();
	            const bytes = new Uint8Array(data);
	            bytes.forEach((n, i) => n);
	            const methods = getNetPeData(bytes);
	            if (methods) {
	                PopupHelper.showMethods(methods);
	            }
	        }
	    };
	}
	function getNetPeData(bytes) {
	    const cliFile = new CliFile(bytes);
	    const tables = cliFile.getCliMetadata();
	    if (!tables) {
	        return null;
	    }
	    const module = {
	        fullName: tables.module?.[0]?.name ?? '',
	        types: [],
	    };
	    for (const row of tables.typeDef ?? []) {
	        const type = {
	            name: row.typeNamespace + "." + row.typeName,
	            methods: [],
	        };
	        module.types.push(type);
	    }
	    return module;
	}
	const textExtensions = ['.md', '.txt', '.nuspec', '.xml', '.cs'];
	const imageExtensions = ['.jpg', '.jpeg', '.png'];
	const executableExtensions = ['.dll'];
	const allAllowedExtensions = [...textExtensions, ...imageExtensions, ...executableExtensions];
	function isText(entry) {
	    const filename = entry.filename;
	    return textExtensions.some(extension => filename.endsWith(extension));
	}
	function isImage(entry) {
	    const filename = entry.filename;
	    return imageExtensions.some(extension => filename.endsWith(extension));
	}
	function isExecutable(entry) {
	    const filename = entry.filename;
	    return executableExtensions.some(extension => filename.endsWith(extension));
	}

	function requiredElement(id) {
	    const element = document.getElementById(id);
	    if (!element) {
	        throw new Error(`Required element not found: ${id}`);
	    }
	    return element;
	}
	const btn = document.getElementById('processBtn');
	const urlInput = document.getElementById('packageUrl');
	let searchTimeout = null;
	const searchInput = document.getElementById('packageSearch');
	searchInput.addEventListener('keyup', e => {
	    if (searchTimeout) {
	        clearTimeout(searchTimeout);
	        searchTimeout = null;
	    }
	    const searchTerm = searchInput.value;
	    searchTimeout = setTimeout(() => doSearch(searchTerm), 1000);
	});
	btn?.addEventListener('click', () => loadPackageInfo());
	async function loadPackageInfo() {
	    const options = { forceRangeRequests: true };
	    const httpReader = new HttpRangeReader(urlInput.value, options);
	    const zipReader = new ZipReader(httpReader);
	    const entries = await zipReader.getEntries();
	    entries.sort(pathSortPredicate);
	    const viewModels = entries.map(e => new EntryViewModel(e));
	    filesViewModel.entries(viewModels);
	}
	function pathSortPredicate(left, right) {
	    const pathSeparatorRe = /\/|\\/;
	    const leftPathElements = left.filename.split(pathSeparatorRe);
	    const rightPathElements = right.filename.split(pathSeparatorRe);
	    const leftIsInSubdirectory = leftPathElements.length > 1;
	    const rightIsInSubdirectory = rightPathElements.length > 1;
	    if (leftIsInSubdirectory !== rightIsInSubdirectory) {
	        return Number(rightIsInSubdirectory) - Number(leftIsInSubdirectory);
	    }
	    return Number(left.filename.toLowerCase() > right.filename.toLowerCase()) * 2 - 1;
	}
	async function doSearch(term) {
	    searchTimeout = null;
	    const url = `https://azuresearch-usnc.nuget.org/query?q=${term}`;
	    const response = await fetch(url, { method: 'GET' });
	    const respObject = await response.json();
	    searchResultsViewModel.results(respObject.data);
	    searchResultsViewModel.versions([]);
	}
	const searchResultsViewModel = {
	    results: knockoutLatestExports.observableArray(),
	    versions: knockoutLatestExports.observableArray(),
	    onPackageClick: (pkg) => {
	        const versions = pkg.versions.map((v) => ({ id: pkg.id, version: v.version }));
	        searchResultsViewModel.versions(versions);
	    },
	    onVersionClick: (data) => {
	        const url = `https://globalcdn.nuget.org/packages/${data.id.toLowerCase()}.${data.version.toLowerCase()}.nupkg`;
	        urlInput.value = url;
	        loadPackageInfo();
	        searchResultsViewModel.results([]);
	        searchResultsViewModel.versions([]);
	    }
	};
	const filesViewModel = {
	    entries: knockoutLatestExports.observableArray(),
	};
	const infoArea = requiredElement('packageInfo');
	knockoutLatestExports.applyBindings(filesViewModel, infoArea);
	const searchResults = requiredElement('searchResults');
	knockoutLatestExports.applyBindings(searchResultsViewModel, searchResults);
	PopupHelper.setup();

})();
