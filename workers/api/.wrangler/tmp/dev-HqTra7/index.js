var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// .wrangler/tmp/bundle-o2ZIT0/checked-fetch.js
function checkURL(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls.has(url.toString())) {
      urls.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
var urls;
var init_checked_fetch = __esm({
  ".wrangler/tmp/bundle-o2ZIT0/checked-fetch.js"() {
    "use strict";
    urls = /* @__PURE__ */ new Set();
    __name(checkURL, "checkURL");
    globalThis.fetch = new Proxy(globalThis.fetch, {
      apply(target, thisArg, argArray) {
        const [request, init] = argArray;
        checkURL(request, init);
        return Reflect.apply(target, thisArg, argArray);
      }
    });
  }
});

// .wrangler/tmp/bundle-o2ZIT0/strip-cf-connecting-ip-header.js
function stripCfConnectingIPHeader(input, init) {
  const request = new Request(input, init);
  request.headers.delete("CF-Connecting-IP");
  return request;
}
var init_strip_cf_connecting_ip_header = __esm({
  ".wrangler/tmp/bundle-o2ZIT0/strip-cf-connecting-ip-header.js"() {
    "use strict";
    __name(stripCfConnectingIPHeader, "stripCfConnectingIPHeader");
    globalThis.fetch = new Proxy(globalThis.fetch, {
      apply(target, thisArg, argArray) {
        return Reflect.apply(target, thisArg, [
          stripCfConnectingIPHeader.apply(null, argArray)
        ]);
      }
    });
  }
});

// wrangler-modules-watch:wrangler:modules-watch
var init_wrangler_modules_watch = __esm({
  "wrangler-modules-watch:wrangler:modules-watch"() {
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
  }
});

// node_modules/wrangler/templates/modules-watch-stub.js
var init_modules_watch_stub = __esm({
  "node_modules/wrangler/templates/modules-watch-stub.js"() {
    init_wrangler_modules_watch();
  }
});

// node_modules/viem/_esm/utils/data/isHex.js
function isHex(value, { strict = true } = {}) {
  if (!value)
    return false;
  if (typeof value !== "string")
    return false;
  return strict ? /^0x[0-9a-fA-F]*$/.test(value) : value.startsWith("0x");
}
var init_isHex = __esm({
  "node_modules/viem/_esm/utils/data/isHex.js"() {
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    __name(isHex, "isHex");
  }
});

// node_modules/viem/_esm/utils/data/size.js
function size(value) {
  if (isHex(value, { strict: false }))
    return Math.ceil((value.length - 2) / 2);
  return value.length;
}
var init_size = __esm({
  "node_modules/viem/_esm/utils/data/size.js"() {
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    init_isHex();
    __name(size, "size");
  }
});

// node_modules/viem/_esm/errors/version.js
var version;
var init_version = __esm({
  "node_modules/viem/_esm/errors/version.js"() {
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    version = "2.44.4";
  }
});

// node_modules/viem/_esm/errors/base.js
function walk(err, fn) {
  if (fn?.(err))
    return err;
  if (err && typeof err === "object" && "cause" in err && err.cause !== void 0)
    return walk(err.cause, fn);
  return fn ? null : err;
}
var errorConfig, BaseError;
var init_base = __esm({
  "node_modules/viem/_esm/errors/base.js"() {
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    init_version();
    errorConfig = {
      getDocsUrl: ({ docsBaseUrl, docsPath = "", docsSlug }) => docsPath ? `${docsBaseUrl ?? "https://viem.sh"}${docsPath}${docsSlug ? `#${docsSlug}` : ""}` : void 0,
      version: `viem@${version}`
    };
    BaseError = class extends Error {
      constructor(shortMessage, args = {}) {
        const details = (() => {
          if (args.cause instanceof BaseError)
            return args.cause.details;
          if (args.cause?.message)
            return args.cause.message;
          return args.details;
        })();
        const docsPath = (() => {
          if (args.cause instanceof BaseError)
            return args.cause.docsPath || args.docsPath;
          return args.docsPath;
        })();
        const docsUrl = errorConfig.getDocsUrl?.({ ...args, docsPath });
        const message = [
          shortMessage || "An error occurred.",
          "",
          ...args.metaMessages ? [...args.metaMessages, ""] : [],
          ...docsUrl ? [`Docs: ${docsUrl}`] : [],
          ...details ? [`Details: ${details}`] : [],
          ...errorConfig.version ? [`Version: ${errorConfig.version}`] : []
        ].join("\n");
        super(message, args.cause ? { cause: args.cause } : void 0);
        Object.defineProperty(this, "details", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "docsPath", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "metaMessages", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "shortMessage", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "version", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "BaseError"
        });
        this.details = details;
        this.docsPath = docsPath;
        this.metaMessages = args.metaMessages;
        this.name = args.name ?? this.name;
        this.shortMessage = shortMessage;
        this.version = version;
      }
      walk(fn) {
        return walk(this, fn);
      }
    };
    __name(BaseError, "BaseError");
    __name(walk, "walk");
  }
});

// node_modules/viem/_esm/errors/data.js
var SizeExceedsPaddingSizeError;
var init_data = __esm({
  "node_modules/viem/_esm/errors/data.js"() {
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    init_base();
    SizeExceedsPaddingSizeError = class extends BaseError {
      constructor({ size: size2, targetSize, type }) {
        super(`${type.charAt(0).toUpperCase()}${type.slice(1).toLowerCase()} size (${size2}) exceeds padding size (${targetSize}).`, { name: "SizeExceedsPaddingSizeError" });
      }
    };
    __name(SizeExceedsPaddingSizeError, "SizeExceedsPaddingSizeError");
  }
});

// node_modules/viem/_esm/utils/data/pad.js
function pad(hexOrBytes, { dir, size: size2 = 32 } = {}) {
  if (typeof hexOrBytes === "string")
    return padHex(hexOrBytes, { dir, size: size2 });
  return padBytes(hexOrBytes, { dir, size: size2 });
}
function padHex(hex_, { dir, size: size2 = 32 } = {}) {
  if (size2 === null)
    return hex_;
  const hex = hex_.replace("0x", "");
  if (hex.length > size2 * 2)
    throw new SizeExceedsPaddingSizeError({
      size: Math.ceil(hex.length / 2),
      targetSize: size2,
      type: "hex"
    });
  return `0x${hex[dir === "right" ? "padEnd" : "padStart"](size2 * 2, "0")}`;
}
function padBytes(bytes, { dir, size: size2 = 32 } = {}) {
  if (size2 === null)
    return bytes;
  if (bytes.length > size2)
    throw new SizeExceedsPaddingSizeError({
      size: bytes.length,
      targetSize: size2,
      type: "bytes"
    });
  const paddedBytes = new Uint8Array(size2);
  for (let i = 0; i < size2; i++) {
    const padEnd = dir === "right";
    paddedBytes[padEnd ? i : size2 - i - 1] = bytes[padEnd ? i : bytes.length - i - 1];
  }
  return paddedBytes;
}
var init_pad = __esm({
  "node_modules/viem/_esm/utils/data/pad.js"() {
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    init_data();
    __name(pad, "pad");
    __name(padHex, "padHex");
    __name(padBytes, "padBytes");
  }
});

// node_modules/viem/_esm/errors/encoding.js
var IntegerOutOfRangeError, SizeOverflowError;
var init_encoding = __esm({
  "node_modules/viem/_esm/errors/encoding.js"() {
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    init_base();
    IntegerOutOfRangeError = class extends BaseError {
      constructor({ max, min, signed, size: size2, value }) {
        super(`Number "${value}" is not in safe ${size2 ? `${size2 * 8}-bit ${signed ? "signed" : "unsigned"} ` : ""}integer range ${max ? `(${min} to ${max})` : `(above ${min})`}`, { name: "IntegerOutOfRangeError" });
      }
    };
    __name(IntegerOutOfRangeError, "IntegerOutOfRangeError");
    SizeOverflowError = class extends BaseError {
      constructor({ givenSize, maxSize }) {
        super(`Size cannot exceed ${maxSize} bytes. Given size: ${givenSize} bytes.`, { name: "SizeOverflowError" });
      }
    };
    __name(SizeOverflowError, "SizeOverflowError");
  }
});

// node_modules/viem/_esm/utils/encoding/fromHex.js
function assertSize(hexOrBytes, { size: size2 }) {
  if (size(hexOrBytes) > size2)
    throw new SizeOverflowError({
      givenSize: size(hexOrBytes),
      maxSize: size2
    });
}
function hexToBigInt(hex, opts = {}) {
  const { signed } = opts;
  if (opts.size)
    assertSize(hex, { size: opts.size });
  const value = BigInt(hex);
  if (!signed)
    return value;
  const size2 = (hex.length - 2) / 2;
  const max = (1n << BigInt(size2) * 8n - 1n) - 1n;
  if (value <= max)
    return value;
  return value - BigInt(`0x${"f".padStart(size2 * 2, "f")}`) - 1n;
}
function hexToNumber(hex, opts = {}) {
  const value = hexToBigInt(hex, opts);
  const number = Number(value);
  if (!Number.isSafeInteger(number))
    throw new IntegerOutOfRangeError({
      max: `${Number.MAX_SAFE_INTEGER}`,
      min: `${Number.MIN_SAFE_INTEGER}`,
      signed: opts.signed,
      size: opts.size,
      value: `${value}n`
    });
  return number;
}
var init_fromHex = __esm({
  "node_modules/viem/_esm/utils/encoding/fromHex.js"() {
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    init_encoding();
    init_size();
    __name(assertSize, "assertSize");
    __name(hexToBigInt, "hexToBigInt");
    __name(hexToNumber, "hexToNumber");
  }
});

// node_modules/viem/_esm/utils/encoding/toHex.js
function toHex(value, opts = {}) {
  if (typeof value === "number" || typeof value === "bigint")
    return numberToHex(value, opts);
  if (typeof value === "string") {
    return stringToHex(value, opts);
  }
  if (typeof value === "boolean")
    return boolToHex(value, opts);
  return bytesToHex(value, opts);
}
function boolToHex(value, opts = {}) {
  const hex = `0x${Number(value)}`;
  if (typeof opts.size === "number") {
    assertSize(hex, { size: opts.size });
    return pad(hex, { size: opts.size });
  }
  return hex;
}
function bytesToHex(value, opts = {}) {
  let string = "";
  for (let i = 0; i < value.length; i++) {
    string += hexes[value[i]];
  }
  const hex = `0x${string}`;
  if (typeof opts.size === "number") {
    assertSize(hex, { size: opts.size });
    return pad(hex, { dir: "right", size: opts.size });
  }
  return hex;
}
function numberToHex(value_, opts = {}) {
  const { signed, size: size2 } = opts;
  const value = BigInt(value_);
  let maxValue;
  if (size2) {
    if (signed)
      maxValue = (1n << BigInt(size2) * 8n - 1n) - 1n;
    else
      maxValue = 2n ** (BigInt(size2) * 8n) - 1n;
  } else if (typeof value_ === "number") {
    maxValue = BigInt(Number.MAX_SAFE_INTEGER);
  }
  const minValue = typeof maxValue === "bigint" && signed ? -maxValue - 1n : 0;
  if (maxValue && value > maxValue || value < minValue) {
    const suffix = typeof value_ === "bigint" ? "n" : "";
    throw new IntegerOutOfRangeError({
      max: maxValue ? `${maxValue}${suffix}` : void 0,
      min: `${minValue}${suffix}`,
      signed,
      size: size2,
      value: `${value_}${suffix}`
    });
  }
  const hex = `0x${(signed && value < 0 ? (1n << BigInt(size2 * 8)) + BigInt(value) : value).toString(16)}`;
  if (size2)
    return pad(hex, { size: size2 });
  return hex;
}
function stringToHex(value_, opts = {}) {
  const value = encoder.encode(value_);
  return bytesToHex(value, opts);
}
var hexes, encoder;
var init_toHex = __esm({
  "node_modules/viem/_esm/utils/encoding/toHex.js"() {
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    init_encoding();
    init_pad();
    init_fromHex();
    hexes = /* @__PURE__ */ Array.from({ length: 256 }, (_v, i) => i.toString(16).padStart(2, "0"));
    __name(toHex, "toHex");
    __name(boolToHex, "boolToHex");
    __name(bytesToHex, "bytesToHex");
    __name(numberToHex, "numberToHex");
    encoder = /* @__PURE__ */ new TextEncoder();
    __name(stringToHex, "stringToHex");
  }
});

// node_modules/viem/_esm/utils/encoding/toBytes.js
function toBytes(value, opts = {}) {
  if (typeof value === "number" || typeof value === "bigint")
    return numberToBytes(value, opts);
  if (typeof value === "boolean")
    return boolToBytes(value, opts);
  if (isHex(value))
    return hexToBytes(value, opts);
  return stringToBytes(value, opts);
}
function boolToBytes(value, opts = {}) {
  const bytes = new Uint8Array(1);
  bytes[0] = Number(value);
  if (typeof opts.size === "number") {
    assertSize(bytes, { size: opts.size });
    return pad(bytes, { size: opts.size });
  }
  return bytes;
}
function charCodeToBase16(char) {
  if (char >= charCodeMap.zero && char <= charCodeMap.nine)
    return char - charCodeMap.zero;
  if (char >= charCodeMap.A && char <= charCodeMap.F)
    return char - (charCodeMap.A - 10);
  if (char >= charCodeMap.a && char <= charCodeMap.f)
    return char - (charCodeMap.a - 10);
  return void 0;
}
function hexToBytes(hex_, opts = {}) {
  let hex = hex_;
  if (opts.size) {
    assertSize(hex, { size: opts.size });
    hex = pad(hex, { dir: "right", size: opts.size });
  }
  let hexString = hex.slice(2);
  if (hexString.length % 2)
    hexString = `0${hexString}`;
  const length = hexString.length / 2;
  const bytes = new Uint8Array(length);
  for (let index = 0, j = 0; index < length; index++) {
    const nibbleLeft = charCodeToBase16(hexString.charCodeAt(j++));
    const nibbleRight = charCodeToBase16(hexString.charCodeAt(j++));
    if (nibbleLeft === void 0 || nibbleRight === void 0) {
      throw new BaseError(`Invalid byte sequence ("${hexString[j - 2]}${hexString[j - 1]}" in "${hexString}").`);
    }
    bytes[index] = nibbleLeft * 16 + nibbleRight;
  }
  return bytes;
}
function numberToBytes(value, opts) {
  const hex = numberToHex(value, opts);
  return hexToBytes(hex);
}
function stringToBytes(value, opts = {}) {
  const bytes = encoder2.encode(value);
  if (typeof opts.size === "number") {
    assertSize(bytes, { size: opts.size });
    return pad(bytes, { dir: "right", size: opts.size });
  }
  return bytes;
}
var encoder2, charCodeMap;
var init_toBytes = __esm({
  "node_modules/viem/_esm/utils/encoding/toBytes.js"() {
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    init_base();
    init_isHex();
    init_pad();
    init_fromHex();
    init_toHex();
    encoder2 = /* @__PURE__ */ new TextEncoder();
    __name(toBytes, "toBytes");
    __name(boolToBytes, "boolToBytes");
    charCodeMap = {
      zero: 48,
      nine: 57,
      A: 65,
      F: 70,
      a: 97,
      f: 102
    };
    __name(charCodeToBase16, "charCodeToBase16");
    __name(hexToBytes, "hexToBytes");
    __name(numberToBytes, "numberToBytes");
    __name(stringToBytes, "stringToBytes");
  }
});

// node_modules/@noble/hashes/esm/_u64.js
function fromBig(n, le = false) {
  if (le)
    return { h: Number(n & U32_MASK64), l: Number(n >> _32n & U32_MASK64) };
  return { h: Number(n >> _32n & U32_MASK64) | 0, l: Number(n & U32_MASK64) | 0 };
}
function split(lst, le = false) {
  const len = lst.length;
  let Ah = new Uint32Array(len);
  let Al = new Uint32Array(len);
  for (let i = 0; i < len; i++) {
    const { h, l } = fromBig(lst[i], le);
    [Ah[i], Al[i]] = [h, l];
  }
  return [Ah, Al];
}
var U32_MASK64, _32n, rotlSH, rotlSL, rotlBH, rotlBL;
var init_u64 = __esm({
  "node_modules/@noble/hashes/esm/_u64.js"() {
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    U32_MASK64 = /* @__PURE__ */ BigInt(2 ** 32 - 1);
    _32n = /* @__PURE__ */ BigInt(32);
    __name(fromBig, "fromBig");
    __name(split, "split");
    rotlSH = /* @__PURE__ */ __name((h, l, s) => h << s | l >>> 32 - s, "rotlSH");
    rotlSL = /* @__PURE__ */ __name((h, l, s) => l << s | h >>> 32 - s, "rotlSL");
    rotlBH = /* @__PURE__ */ __name((h, l, s) => l << s - 32 | h >>> 64 - s, "rotlBH");
    rotlBL = /* @__PURE__ */ __name((h, l, s) => h << s - 32 | l >>> 64 - s, "rotlBL");
  }
});

// node_modules/@noble/hashes/esm/crypto.js
var crypto2;
var init_crypto = __esm({
  "node_modules/@noble/hashes/esm/crypto.js"() {
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    crypto2 = typeof globalThis === "object" && "crypto" in globalThis ? globalThis.crypto : void 0;
  }
});

// node_modules/@noble/hashes/esm/utils.js
function isBytes(a) {
  return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array";
}
function anumber(n) {
  if (!Number.isSafeInteger(n) || n < 0)
    throw new Error("positive integer expected, got " + n);
}
function abytes(b, ...lengths) {
  if (!isBytes(b))
    throw new Error("Uint8Array expected");
  if (lengths.length > 0 && !lengths.includes(b.length))
    throw new Error("Uint8Array expected of length " + lengths + ", got length=" + b.length);
}
function ahash(h) {
  if (typeof h !== "function" || typeof h.create !== "function")
    throw new Error("Hash should be wrapped by utils.createHasher");
  anumber(h.outputLen);
  anumber(h.blockLen);
}
function aexists(instance, checkFinished = true) {
  if (instance.destroyed)
    throw new Error("Hash instance has been destroyed");
  if (checkFinished && instance.finished)
    throw new Error("Hash#digest() has already been called");
}
function aoutput(out, instance) {
  abytes(out);
  const min = instance.outputLen;
  if (out.length < min) {
    throw new Error("digestInto() expects output buffer of length at least " + min);
  }
}
function u32(arr) {
  return new Uint32Array(arr.buffer, arr.byteOffset, Math.floor(arr.byteLength / 4));
}
function clean(...arrays) {
  for (let i = 0; i < arrays.length; i++) {
    arrays[i].fill(0);
  }
}
function createView(arr) {
  return new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
}
function rotr(word, shift) {
  return word << 32 - shift | word >>> shift;
}
function byteSwap(word) {
  return word << 24 & 4278190080 | word << 8 & 16711680 | word >>> 8 & 65280 | word >>> 24 & 255;
}
function byteSwap32(arr) {
  for (let i = 0; i < arr.length; i++) {
    arr[i] = byteSwap(arr[i]);
  }
  return arr;
}
function utf8ToBytes(str) {
  if (typeof str !== "string")
    throw new Error("string expected");
  return new Uint8Array(new TextEncoder().encode(str));
}
function toBytes2(data) {
  if (typeof data === "string")
    data = utf8ToBytes(data);
  abytes(data);
  return data;
}
function concatBytes(...arrays) {
  let sum = 0;
  for (let i = 0; i < arrays.length; i++) {
    const a = arrays[i];
    abytes(a);
    sum += a.length;
  }
  const res = new Uint8Array(sum);
  for (let i = 0, pad2 = 0; i < arrays.length; i++) {
    const a = arrays[i];
    res.set(a, pad2);
    pad2 += a.length;
  }
  return res;
}
function createHasher(hashCons) {
  const hashC = /* @__PURE__ */ __name((msg) => hashCons().update(toBytes2(msg)).digest(), "hashC");
  const tmp = hashCons();
  hashC.outputLen = tmp.outputLen;
  hashC.blockLen = tmp.blockLen;
  hashC.create = () => hashCons();
  return hashC;
}
function randomBytes(bytesLength = 32) {
  if (crypto2 && typeof crypto2.getRandomValues === "function") {
    return crypto2.getRandomValues(new Uint8Array(bytesLength));
  }
  if (crypto2 && typeof crypto2.randomBytes === "function") {
    return Uint8Array.from(crypto2.randomBytes(bytesLength));
  }
  throw new Error("crypto.getRandomValues must be defined");
}
var isLE, swap32IfBE, Hash;
var init_utils = __esm({
  "node_modules/@noble/hashes/esm/utils.js"() {
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    init_crypto();
    __name(isBytes, "isBytes");
    __name(anumber, "anumber");
    __name(abytes, "abytes");
    __name(ahash, "ahash");
    __name(aexists, "aexists");
    __name(aoutput, "aoutput");
    __name(u32, "u32");
    __name(clean, "clean");
    __name(createView, "createView");
    __name(rotr, "rotr");
    isLE = /* @__PURE__ */ (() => new Uint8Array(new Uint32Array([287454020]).buffer)[0] === 68)();
    __name(byteSwap, "byteSwap");
    __name(byteSwap32, "byteSwap32");
    swap32IfBE = isLE ? (u) => u : byteSwap32;
    __name(utf8ToBytes, "utf8ToBytes");
    __name(toBytes2, "toBytes");
    __name(concatBytes, "concatBytes");
    Hash = class {
    };
    __name(Hash, "Hash");
    __name(createHasher, "createHasher");
    __name(randomBytes, "randomBytes");
  }
});

// node_modules/@noble/hashes/esm/sha3.js
function keccakP(s, rounds = 24) {
  const B = new Uint32Array(5 * 2);
  for (let round = 24 - rounds; round < 24; round++) {
    for (let x = 0; x < 10; x++)
      B[x] = s[x] ^ s[x + 10] ^ s[x + 20] ^ s[x + 30] ^ s[x + 40];
    for (let x = 0; x < 10; x += 2) {
      const idx1 = (x + 8) % 10;
      const idx0 = (x + 2) % 10;
      const B0 = B[idx0];
      const B1 = B[idx0 + 1];
      const Th = rotlH(B0, B1, 1) ^ B[idx1];
      const Tl = rotlL(B0, B1, 1) ^ B[idx1 + 1];
      for (let y = 0; y < 50; y += 10) {
        s[x + y] ^= Th;
        s[x + y + 1] ^= Tl;
      }
    }
    let curH = s[2];
    let curL = s[3];
    for (let t = 0; t < 24; t++) {
      const shift = SHA3_ROTL[t];
      const Th = rotlH(curH, curL, shift);
      const Tl = rotlL(curH, curL, shift);
      const PI = SHA3_PI[t];
      curH = s[PI];
      curL = s[PI + 1];
      s[PI] = Th;
      s[PI + 1] = Tl;
    }
    for (let y = 0; y < 50; y += 10) {
      for (let x = 0; x < 10; x++)
        B[x] = s[y + x];
      for (let x = 0; x < 10; x++)
        s[y + x] ^= ~B[(x + 2) % 10] & B[(x + 4) % 10];
    }
    s[0] ^= SHA3_IOTA_H[round];
    s[1] ^= SHA3_IOTA_L[round];
  }
  clean(B);
}
var _0n, _1n, _2n, _7n, _256n, _0x71n, SHA3_PI, SHA3_ROTL, _SHA3_IOTA, IOTAS, SHA3_IOTA_H, SHA3_IOTA_L, rotlH, rotlL, Keccak, gen, keccak_256;
var init_sha3 = __esm({
  "node_modules/@noble/hashes/esm/sha3.js"() {
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    init_u64();
    init_utils();
    _0n = BigInt(0);
    _1n = BigInt(1);
    _2n = BigInt(2);
    _7n = BigInt(7);
    _256n = BigInt(256);
    _0x71n = BigInt(113);
    SHA3_PI = [];
    SHA3_ROTL = [];
    _SHA3_IOTA = [];
    for (let round = 0, R = _1n, x = 1, y = 0; round < 24; round++) {
      [x, y] = [y, (2 * x + 3 * y) % 5];
      SHA3_PI.push(2 * (5 * y + x));
      SHA3_ROTL.push((round + 1) * (round + 2) / 2 % 64);
      let t = _0n;
      for (let j = 0; j < 7; j++) {
        R = (R << _1n ^ (R >> _7n) * _0x71n) % _256n;
        if (R & _2n)
          t ^= _1n << (_1n << /* @__PURE__ */ BigInt(j)) - _1n;
      }
      _SHA3_IOTA.push(t);
    }
    IOTAS = split(_SHA3_IOTA, true);
    SHA3_IOTA_H = IOTAS[0];
    SHA3_IOTA_L = IOTAS[1];
    rotlH = /* @__PURE__ */ __name((h, l, s) => s > 32 ? rotlBH(h, l, s) : rotlSH(h, l, s), "rotlH");
    rotlL = /* @__PURE__ */ __name((h, l, s) => s > 32 ? rotlBL(h, l, s) : rotlSL(h, l, s), "rotlL");
    __name(keccakP, "keccakP");
    Keccak = class extends Hash {
      // NOTE: we accept arguments in bytes instead of bits here.
      constructor(blockLen, suffix, outputLen, enableXOF = false, rounds = 24) {
        super();
        this.pos = 0;
        this.posOut = 0;
        this.finished = false;
        this.destroyed = false;
        this.enableXOF = false;
        this.blockLen = blockLen;
        this.suffix = suffix;
        this.outputLen = outputLen;
        this.enableXOF = enableXOF;
        this.rounds = rounds;
        anumber(outputLen);
        if (!(0 < blockLen && blockLen < 200))
          throw new Error("only keccak-f1600 function is supported");
        this.state = new Uint8Array(200);
        this.state32 = u32(this.state);
      }
      clone() {
        return this._cloneInto();
      }
      keccak() {
        swap32IfBE(this.state32);
        keccakP(this.state32, this.rounds);
        swap32IfBE(this.state32);
        this.posOut = 0;
        this.pos = 0;
      }
      update(data) {
        aexists(this);
        data = toBytes2(data);
        abytes(data);
        const { blockLen, state } = this;
        const len = data.length;
        for (let pos = 0; pos < len; ) {
          const take = Math.min(blockLen - this.pos, len - pos);
          for (let i = 0; i < take; i++)
            state[this.pos++] ^= data[pos++];
          if (this.pos === blockLen)
            this.keccak();
        }
        return this;
      }
      finish() {
        if (this.finished)
          return;
        this.finished = true;
        const { state, suffix, pos, blockLen } = this;
        state[pos] ^= suffix;
        if ((suffix & 128) !== 0 && pos === blockLen - 1)
          this.keccak();
        state[blockLen - 1] ^= 128;
        this.keccak();
      }
      writeInto(out) {
        aexists(this, false);
        abytes(out);
        this.finish();
        const bufferOut = this.state;
        const { blockLen } = this;
        for (let pos = 0, len = out.length; pos < len; ) {
          if (this.posOut >= blockLen)
            this.keccak();
          const take = Math.min(blockLen - this.posOut, len - pos);
          out.set(bufferOut.subarray(this.posOut, this.posOut + take), pos);
          this.posOut += take;
          pos += take;
        }
        return out;
      }
      xofInto(out) {
        if (!this.enableXOF)
          throw new Error("XOF is not possible for this instance");
        return this.writeInto(out);
      }
      xof(bytes) {
        anumber(bytes);
        return this.xofInto(new Uint8Array(bytes));
      }
      digestInto(out) {
        aoutput(out, this);
        if (this.finished)
          throw new Error("digest() was already called");
        this.writeInto(out);
        this.destroy();
        return out;
      }
      digest() {
        return this.digestInto(new Uint8Array(this.outputLen));
      }
      destroy() {
        this.destroyed = true;
        clean(this.state);
      }
      _cloneInto(to) {
        const { blockLen, suffix, outputLen, rounds, enableXOF } = this;
        to || (to = new Keccak(blockLen, suffix, outputLen, enableXOF, rounds));
        to.state32.set(this.state32);
        to.pos = this.pos;
        to.posOut = this.posOut;
        to.finished = this.finished;
        to.rounds = rounds;
        to.suffix = suffix;
        to.outputLen = outputLen;
        to.enableXOF = enableXOF;
        to.destroyed = this.destroyed;
        return to;
      }
    };
    __name(Keccak, "Keccak");
    gen = /* @__PURE__ */ __name((suffix, blockLen, outputLen) => createHasher(() => new Keccak(blockLen, suffix, outputLen)), "gen");
    keccak_256 = /* @__PURE__ */ (() => gen(1, 136, 256 / 8))();
  }
});

// node_modules/viem/_esm/utils/hash/keccak256.js
function keccak256(value, to_) {
  const to = to_ || "hex";
  const bytes = keccak_256(isHex(value, { strict: false }) ? toBytes(value) : value);
  if (to === "bytes")
    return bytes;
  return toHex(bytes);
}
var init_keccak256 = __esm({
  "node_modules/viem/_esm/utils/hash/keccak256.js"() {
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    init_sha3();
    init_isHex();
    init_toBytes();
    init_toHex();
    __name(keccak256, "keccak256");
  }
});

// node_modules/viem/_esm/utils/lru.js
var LruMap;
var init_lru = __esm({
  "node_modules/viem/_esm/utils/lru.js"() {
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    LruMap = class extends Map {
      constructor(size2) {
        super();
        Object.defineProperty(this, "maxSize", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        this.maxSize = size2;
      }
      get(key) {
        const value = super.get(key);
        if (super.has(key) && value !== void 0) {
          this.delete(key);
          super.set(key, value);
        }
        return value;
      }
      set(key, value) {
        super.set(key, value);
        if (this.maxSize && this.size > this.maxSize) {
          const firstKey = this.keys().next().value;
          if (firstKey)
            this.delete(firstKey);
        }
        return this;
      }
    };
    __name(LruMap, "LruMap");
  }
});

// node_modules/viem/_esm/utils/address/getAddress.js
function checksumAddress(address_, chainId) {
  if (checksumAddressCache.has(`${address_}.${chainId}`))
    return checksumAddressCache.get(`${address_}.${chainId}`);
  const hexAddress = chainId ? `${chainId}${address_.toLowerCase()}` : address_.substring(2).toLowerCase();
  const hash = keccak256(stringToBytes(hexAddress), "bytes");
  const address = (chainId ? hexAddress.substring(`${chainId}0x`.length) : hexAddress).split("");
  for (let i = 0; i < 40; i += 2) {
    if (hash[i >> 1] >> 4 >= 8 && address[i]) {
      address[i] = address[i].toUpperCase();
    }
    if ((hash[i >> 1] & 15) >= 8 && address[i + 1]) {
      address[i + 1] = address[i + 1].toUpperCase();
    }
  }
  const result = `0x${address.join("")}`;
  checksumAddressCache.set(`${address_}.${chainId}`, result);
  return result;
}
var checksumAddressCache;
var init_getAddress = __esm({
  "node_modules/viem/_esm/utils/address/getAddress.js"() {
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    init_toBytes();
    init_keccak256();
    init_lru();
    checksumAddressCache = /* @__PURE__ */ new LruMap(8192);
    __name(checksumAddress, "checksumAddress");
  }
});

// node_modules/viem/_esm/utils/data/concat.js
function concat(values) {
  if (typeof values[0] === "string")
    return concatHex(values);
  return concatBytes2(values);
}
function concatBytes2(values) {
  let length = 0;
  for (const arr of values) {
    length += arr.length;
  }
  const result = new Uint8Array(length);
  let offset = 0;
  for (const arr of values) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}
function concatHex(values) {
  return `0x${values.reduce((acc, x) => acc + x.replace("0x", ""), "")}`;
}
var init_concat = __esm({
  "node_modules/viem/_esm/utils/data/concat.js"() {
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    __name(concat, "concat");
    __name(concatBytes2, "concatBytes");
    __name(concatHex, "concatHex");
  }
});

// node_modules/@noble/hashes/esm/_md.js
function setBigUint64(view, byteOffset, value, isLE2) {
  if (typeof view.setBigUint64 === "function")
    return view.setBigUint64(byteOffset, value, isLE2);
  const _32n2 = BigInt(32);
  const _u32_max = BigInt(4294967295);
  const wh = Number(value >> _32n2 & _u32_max);
  const wl = Number(value & _u32_max);
  const h = isLE2 ? 4 : 0;
  const l = isLE2 ? 0 : 4;
  view.setUint32(byteOffset + h, wh, isLE2);
  view.setUint32(byteOffset + l, wl, isLE2);
}
function Chi(a, b, c) {
  return a & b ^ ~a & c;
}
function Maj(a, b, c) {
  return a & b ^ a & c ^ b & c;
}
var HashMD, SHA256_IV;
var init_md = __esm({
  "node_modules/@noble/hashes/esm/_md.js"() {
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    init_utils();
    __name(setBigUint64, "setBigUint64");
    __name(Chi, "Chi");
    __name(Maj, "Maj");
    HashMD = class extends Hash {
      constructor(blockLen, outputLen, padOffset, isLE2) {
        super();
        this.finished = false;
        this.length = 0;
        this.pos = 0;
        this.destroyed = false;
        this.blockLen = blockLen;
        this.outputLen = outputLen;
        this.padOffset = padOffset;
        this.isLE = isLE2;
        this.buffer = new Uint8Array(blockLen);
        this.view = createView(this.buffer);
      }
      update(data) {
        aexists(this);
        data = toBytes2(data);
        abytes(data);
        const { view, buffer, blockLen } = this;
        const len = data.length;
        for (let pos = 0; pos < len; ) {
          const take = Math.min(blockLen - this.pos, len - pos);
          if (take === blockLen) {
            const dataView = createView(data);
            for (; blockLen <= len - pos; pos += blockLen)
              this.process(dataView, pos);
            continue;
          }
          buffer.set(data.subarray(pos, pos + take), this.pos);
          this.pos += take;
          pos += take;
          if (this.pos === blockLen) {
            this.process(view, 0);
            this.pos = 0;
          }
        }
        this.length += data.length;
        this.roundClean();
        return this;
      }
      digestInto(out) {
        aexists(this);
        aoutput(out, this);
        this.finished = true;
        const { buffer, view, blockLen, isLE: isLE2 } = this;
        let { pos } = this;
        buffer[pos++] = 128;
        clean(this.buffer.subarray(pos));
        if (this.padOffset > blockLen - pos) {
          this.process(view, 0);
          pos = 0;
        }
        for (let i = pos; i < blockLen; i++)
          buffer[i] = 0;
        setBigUint64(view, blockLen - 8, BigInt(this.length * 8), isLE2);
        this.process(view, 0);
        const oview = createView(out);
        const len = this.outputLen;
        if (len % 4)
          throw new Error("_sha2: outputLen should be aligned to 32bit");
        const outLen = len / 4;
        const state = this.get();
        if (outLen > state.length)
          throw new Error("_sha2: outputLen bigger than state");
        for (let i = 0; i < outLen; i++)
          oview.setUint32(4 * i, state[i], isLE2);
      }
      digest() {
        const { buffer, outputLen } = this;
        this.digestInto(buffer);
        const res = buffer.slice(0, outputLen);
        this.destroy();
        return res;
      }
      _cloneInto(to) {
        to || (to = new this.constructor());
        to.set(...this.get());
        const { blockLen, buffer, length, finished, destroyed, pos } = this;
        to.destroyed = destroyed;
        to.finished = finished;
        to.length = length;
        to.pos = pos;
        if (length % blockLen)
          to.buffer.set(buffer);
        return to;
      }
      clone() {
        return this._cloneInto();
      }
    };
    __name(HashMD, "HashMD");
    SHA256_IV = /* @__PURE__ */ Uint32Array.from([
      1779033703,
      3144134277,
      1013904242,
      2773480762,
      1359893119,
      2600822924,
      528734635,
      1541459225
    ]);
  }
});

// node_modules/@noble/hashes/esm/sha2.js
var SHA256_K, SHA256_W, SHA256, sha2562;
var init_sha2 = __esm({
  "node_modules/@noble/hashes/esm/sha2.js"() {
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    init_md();
    init_utils();
    SHA256_K = /* @__PURE__ */ Uint32Array.from([
      1116352408,
      1899447441,
      3049323471,
      3921009573,
      961987163,
      1508970993,
      2453635748,
      2870763221,
      3624381080,
      310598401,
      607225278,
      1426881987,
      1925078388,
      2162078206,
      2614888103,
      3248222580,
      3835390401,
      4022224774,
      264347078,
      604807628,
      770255983,
      1249150122,
      1555081692,
      1996064986,
      2554220882,
      2821834349,
      2952996808,
      3210313671,
      3336571891,
      3584528711,
      113926993,
      338241895,
      666307205,
      773529912,
      1294757372,
      1396182291,
      1695183700,
      1986661051,
      2177026350,
      2456956037,
      2730485921,
      2820302411,
      3259730800,
      3345764771,
      3516065817,
      3600352804,
      4094571909,
      275423344,
      430227734,
      506948616,
      659060556,
      883997877,
      958139571,
      1322822218,
      1537002063,
      1747873779,
      1955562222,
      2024104815,
      2227730452,
      2361852424,
      2428436474,
      2756734187,
      3204031479,
      3329325298
    ]);
    SHA256_W = /* @__PURE__ */ new Uint32Array(64);
    SHA256 = class extends HashMD {
      constructor(outputLen = 32) {
        super(64, outputLen, 8, false);
        this.A = SHA256_IV[0] | 0;
        this.B = SHA256_IV[1] | 0;
        this.C = SHA256_IV[2] | 0;
        this.D = SHA256_IV[3] | 0;
        this.E = SHA256_IV[4] | 0;
        this.F = SHA256_IV[5] | 0;
        this.G = SHA256_IV[6] | 0;
        this.H = SHA256_IV[7] | 0;
      }
      get() {
        const { A, B, C, D, E, F, G, H } = this;
        return [A, B, C, D, E, F, G, H];
      }
      // prettier-ignore
      set(A, B, C, D, E, F, G, H) {
        this.A = A | 0;
        this.B = B | 0;
        this.C = C | 0;
        this.D = D | 0;
        this.E = E | 0;
        this.F = F | 0;
        this.G = G | 0;
        this.H = H | 0;
      }
      process(view, offset) {
        for (let i = 0; i < 16; i++, offset += 4)
          SHA256_W[i] = view.getUint32(offset, false);
        for (let i = 16; i < 64; i++) {
          const W15 = SHA256_W[i - 15];
          const W2 = SHA256_W[i - 2];
          const s0 = rotr(W15, 7) ^ rotr(W15, 18) ^ W15 >>> 3;
          const s1 = rotr(W2, 17) ^ rotr(W2, 19) ^ W2 >>> 10;
          SHA256_W[i] = s1 + SHA256_W[i - 7] + s0 + SHA256_W[i - 16] | 0;
        }
        let { A, B, C, D, E, F, G, H } = this;
        for (let i = 0; i < 64; i++) {
          const sigma1 = rotr(E, 6) ^ rotr(E, 11) ^ rotr(E, 25);
          const T1 = H + sigma1 + Chi(E, F, G) + SHA256_K[i] + SHA256_W[i] | 0;
          const sigma0 = rotr(A, 2) ^ rotr(A, 13) ^ rotr(A, 22);
          const T2 = sigma0 + Maj(A, B, C) | 0;
          H = G;
          G = F;
          F = E;
          E = D + T1 | 0;
          D = C;
          C = B;
          B = A;
          A = T1 + T2 | 0;
        }
        A = A + this.A | 0;
        B = B + this.B | 0;
        C = C + this.C | 0;
        D = D + this.D | 0;
        E = E + this.E | 0;
        F = F + this.F | 0;
        G = G + this.G | 0;
        H = H + this.H | 0;
        this.set(A, B, C, D, E, F, G, H);
      }
      roundClean() {
        clean(SHA256_W);
      }
      destroy() {
        this.set(0, 0, 0, 0, 0, 0, 0, 0);
        clean(this.buffer);
      }
    };
    __name(SHA256, "SHA256");
    sha2562 = /* @__PURE__ */ createHasher(() => new SHA256());
  }
});

// node_modules/@noble/hashes/esm/hmac.js
var HMAC, hmac;
var init_hmac = __esm({
  "node_modules/@noble/hashes/esm/hmac.js"() {
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    init_utils();
    HMAC = class extends Hash {
      constructor(hash, _key) {
        super();
        this.finished = false;
        this.destroyed = false;
        ahash(hash);
        const key = toBytes2(_key);
        this.iHash = hash.create();
        if (typeof this.iHash.update !== "function")
          throw new Error("Expected instance of class which extends utils.Hash");
        this.blockLen = this.iHash.blockLen;
        this.outputLen = this.iHash.outputLen;
        const blockLen = this.blockLen;
        const pad2 = new Uint8Array(blockLen);
        pad2.set(key.length > blockLen ? hash.create().update(key).digest() : key);
        for (let i = 0; i < pad2.length; i++)
          pad2[i] ^= 54;
        this.iHash.update(pad2);
        this.oHash = hash.create();
        for (let i = 0; i < pad2.length; i++)
          pad2[i] ^= 54 ^ 92;
        this.oHash.update(pad2);
        clean(pad2);
      }
      update(buf) {
        aexists(this);
        this.iHash.update(buf);
        return this;
      }
      digestInto(out) {
        aexists(this);
        abytes(out, this.outputLen);
        this.finished = true;
        this.iHash.digestInto(out);
        this.oHash.update(out);
        this.oHash.digestInto(out);
        this.destroy();
      }
      digest() {
        const out = new Uint8Array(this.oHash.outputLen);
        this.digestInto(out);
        return out;
      }
      _cloneInto(to) {
        to || (to = Object.create(Object.getPrototypeOf(this), {}));
        const { oHash, iHash, finished, destroyed, blockLen, outputLen } = this;
        to = to;
        to.finished = finished;
        to.destroyed = destroyed;
        to.blockLen = blockLen;
        to.outputLen = outputLen;
        to.oHash = oHash._cloneInto(to.oHash);
        to.iHash = iHash._cloneInto(to.iHash);
        return to;
      }
      clone() {
        return this._cloneInto();
      }
      destroy() {
        this.destroyed = true;
        this.oHash.destroy();
        this.iHash.destroy();
      }
    };
    __name(HMAC, "HMAC");
    hmac = /* @__PURE__ */ __name((hash, key, message) => new HMAC(hash, key).update(message).digest(), "hmac");
    hmac.create = (hash, key) => new HMAC(hash, key);
  }
});

// node_modules/@noble/curves/esm/abstract/utils.js
function isBytes2(a) {
  return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array";
}
function abytes2(item) {
  if (!isBytes2(item))
    throw new Error("Uint8Array expected");
}
function abool(title, value) {
  if (typeof value !== "boolean")
    throw new Error(title + " boolean expected, got " + value);
}
function numberToHexUnpadded(num2) {
  const hex = num2.toString(16);
  return hex.length & 1 ? "0" + hex : hex;
}
function hexToNumber2(hex) {
  if (typeof hex !== "string")
    throw new Error("hex string expected, got " + typeof hex);
  return hex === "" ? _0n2 : BigInt("0x" + hex);
}
function bytesToHex2(bytes) {
  abytes2(bytes);
  if (hasHexBuiltin)
    return bytes.toHex();
  let hex = "";
  for (let i = 0; i < bytes.length; i++) {
    hex += hexes2[bytes[i]];
  }
  return hex;
}
function asciiToBase16(ch) {
  if (ch >= asciis._0 && ch <= asciis._9)
    return ch - asciis._0;
  if (ch >= asciis.A && ch <= asciis.F)
    return ch - (asciis.A - 10);
  if (ch >= asciis.a && ch <= asciis.f)
    return ch - (asciis.a - 10);
  return;
}
function hexToBytes2(hex) {
  if (typeof hex !== "string")
    throw new Error("hex string expected, got " + typeof hex);
  if (hasHexBuiltin)
    return Uint8Array.fromHex(hex);
  const hl = hex.length;
  const al = hl / 2;
  if (hl % 2)
    throw new Error("hex string expected, got unpadded hex of length " + hl);
  const array = new Uint8Array(al);
  for (let ai = 0, hi = 0; ai < al; ai++, hi += 2) {
    const n1 = asciiToBase16(hex.charCodeAt(hi));
    const n2 = asciiToBase16(hex.charCodeAt(hi + 1));
    if (n1 === void 0 || n2 === void 0) {
      const char = hex[hi] + hex[hi + 1];
      throw new Error('hex string expected, got non-hex character "' + char + '" at index ' + hi);
    }
    array[ai] = n1 * 16 + n2;
  }
  return array;
}
function bytesToNumberBE(bytes) {
  return hexToNumber2(bytesToHex2(bytes));
}
function bytesToNumberLE(bytes) {
  abytes2(bytes);
  return hexToNumber2(bytesToHex2(Uint8Array.from(bytes).reverse()));
}
function numberToBytesBE(n, len) {
  return hexToBytes2(n.toString(16).padStart(len * 2, "0"));
}
function numberToBytesLE(n, len) {
  return numberToBytesBE(n, len).reverse();
}
function ensureBytes(title, hex, expectedLength) {
  let res;
  if (typeof hex === "string") {
    try {
      res = hexToBytes2(hex);
    } catch (e) {
      throw new Error(title + " must be hex string or Uint8Array, cause: " + e);
    }
  } else if (isBytes2(hex)) {
    res = Uint8Array.from(hex);
  } else {
    throw new Error(title + " must be hex string or Uint8Array");
  }
  const len = res.length;
  if (typeof expectedLength === "number" && len !== expectedLength)
    throw new Error(title + " of length " + expectedLength + " expected, got " + len);
  return res;
}
function concatBytes3(...arrays) {
  let sum = 0;
  for (let i = 0; i < arrays.length; i++) {
    const a = arrays[i];
    abytes2(a);
    sum += a.length;
  }
  const res = new Uint8Array(sum);
  for (let i = 0, pad2 = 0; i < arrays.length; i++) {
    const a = arrays[i];
    res.set(a, pad2);
    pad2 += a.length;
  }
  return res;
}
function utf8ToBytes2(str) {
  if (typeof str !== "string")
    throw new Error("string expected");
  return new Uint8Array(new TextEncoder().encode(str));
}
function inRange(n, min, max) {
  return isPosBig(n) && isPosBig(min) && isPosBig(max) && min <= n && n < max;
}
function aInRange(title, n, min, max) {
  if (!inRange(n, min, max))
    throw new Error("expected valid " + title + ": " + min + " <= n < " + max + ", got " + n);
}
function bitLen(n) {
  let len;
  for (len = 0; n > _0n2; n >>= _1n2, len += 1)
    ;
  return len;
}
function createHmacDrbg(hashLen, qByteLen, hmacFn) {
  if (typeof hashLen !== "number" || hashLen < 2)
    throw new Error("hashLen must be a number");
  if (typeof qByteLen !== "number" || qByteLen < 2)
    throw new Error("qByteLen must be a number");
  if (typeof hmacFn !== "function")
    throw new Error("hmacFn must be a function");
  let v = u8n(hashLen);
  let k = u8n(hashLen);
  let i = 0;
  const reset = /* @__PURE__ */ __name(() => {
    v.fill(1);
    k.fill(0);
    i = 0;
  }, "reset");
  const h = /* @__PURE__ */ __name((...b) => hmacFn(k, v, ...b), "h");
  const reseed = /* @__PURE__ */ __name((seed = u8n(0)) => {
    k = h(u8fr([0]), seed);
    v = h();
    if (seed.length === 0)
      return;
    k = h(u8fr([1]), seed);
    v = h();
  }, "reseed");
  const gen2 = /* @__PURE__ */ __name(() => {
    if (i++ >= 1e3)
      throw new Error("drbg: tried 1000 values");
    let len = 0;
    const out = [];
    while (len < qByteLen) {
      v = h();
      const sl = v.slice();
      out.push(sl);
      len += v.length;
    }
    return concatBytes3(...out);
  }, "gen");
  const genUntil = /* @__PURE__ */ __name((seed, pred) => {
    reset();
    reseed(seed);
    let res = void 0;
    while (!(res = pred(gen2())))
      reseed();
    reset();
    return res;
  }, "genUntil");
  return genUntil;
}
function validateObject(object, validators, optValidators = {}) {
  const checkField = /* @__PURE__ */ __name((fieldName, type, isOptional) => {
    const checkVal = validatorFns[type];
    if (typeof checkVal !== "function")
      throw new Error("invalid validator function");
    const val = object[fieldName];
    if (isOptional && val === void 0)
      return;
    if (!checkVal(val, object)) {
      throw new Error("param " + String(fieldName) + " is invalid. Expected " + type + ", got " + val);
    }
  }, "checkField");
  for (const [fieldName, type] of Object.entries(validators))
    checkField(fieldName, type, false);
  for (const [fieldName, type] of Object.entries(optValidators))
    checkField(fieldName, type, true);
  return object;
}
function memoized(fn) {
  const map = /* @__PURE__ */ new WeakMap();
  return (arg, ...args) => {
    const val = map.get(arg);
    if (val !== void 0)
      return val;
    const computed = fn(arg, ...args);
    map.set(arg, computed);
    return computed;
  };
}
var _0n2, _1n2, hasHexBuiltin, hexes2, asciis, isPosBig, bitMask, u8n, u8fr, validatorFns;
var init_utils2 = __esm({
  "node_modules/@noble/curves/esm/abstract/utils.js"() {
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    _0n2 = /* @__PURE__ */ BigInt(0);
    _1n2 = /* @__PURE__ */ BigInt(1);
    __name(isBytes2, "isBytes");
    __name(abytes2, "abytes");
    __name(abool, "abool");
    __name(numberToHexUnpadded, "numberToHexUnpadded");
    __name(hexToNumber2, "hexToNumber");
    hasHexBuiltin = // @ts-ignore
    typeof Uint8Array.from([]).toHex === "function" && typeof Uint8Array.fromHex === "function";
    hexes2 = /* @__PURE__ */ Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, "0"));
    __name(bytesToHex2, "bytesToHex");
    asciis = { _0: 48, _9: 57, A: 65, F: 70, a: 97, f: 102 };
    __name(asciiToBase16, "asciiToBase16");
    __name(hexToBytes2, "hexToBytes");
    __name(bytesToNumberBE, "bytesToNumberBE");
    __name(bytesToNumberLE, "bytesToNumberLE");
    __name(numberToBytesBE, "numberToBytesBE");
    __name(numberToBytesLE, "numberToBytesLE");
    __name(ensureBytes, "ensureBytes");
    __name(concatBytes3, "concatBytes");
    __name(utf8ToBytes2, "utf8ToBytes");
    isPosBig = /* @__PURE__ */ __name((n) => typeof n === "bigint" && _0n2 <= n, "isPosBig");
    __name(inRange, "inRange");
    __name(aInRange, "aInRange");
    __name(bitLen, "bitLen");
    bitMask = /* @__PURE__ */ __name((n) => (_1n2 << BigInt(n)) - _1n2, "bitMask");
    u8n = /* @__PURE__ */ __name((len) => new Uint8Array(len), "u8n");
    u8fr = /* @__PURE__ */ __name((arr) => Uint8Array.from(arr), "u8fr");
    __name(createHmacDrbg, "createHmacDrbg");
    validatorFns = {
      bigint: (val) => typeof val === "bigint",
      function: (val) => typeof val === "function",
      boolean: (val) => typeof val === "boolean",
      string: (val) => typeof val === "string",
      stringOrUint8Array: (val) => typeof val === "string" || isBytes2(val),
      isSafeInteger: (val) => Number.isSafeInteger(val),
      array: (val) => Array.isArray(val),
      field: (val, object) => object.Fp.isValid(val),
      hash: (val) => typeof val === "function" && Number.isSafeInteger(val.outputLen)
    };
    __name(validateObject, "validateObject");
    __name(memoized, "memoized");
  }
});

// node_modules/@noble/curves/esm/abstract/modular.js
function mod(a, b) {
  const result = a % b;
  return result >= _0n3 ? result : b + result;
}
function pow2(x, power, modulo) {
  let res = x;
  while (power-- > _0n3) {
    res *= res;
    res %= modulo;
  }
  return res;
}
function invert(number, modulo) {
  if (number === _0n3)
    throw new Error("invert: expected non-zero number");
  if (modulo <= _0n3)
    throw new Error("invert: expected positive modulus, got " + modulo);
  let a = mod(number, modulo);
  let b = modulo;
  let x = _0n3, y = _1n3, u = _1n3, v = _0n3;
  while (a !== _0n3) {
    const q = b / a;
    const r = b % a;
    const m = x - u * q;
    const n = y - v * q;
    b = a, a = r, x = u, y = v, u = m, v = n;
  }
  const gcd = b;
  if (gcd !== _1n3)
    throw new Error("invert: does not exist");
  return mod(x, modulo);
}
function sqrt3mod4(Fp, n) {
  const p1div4 = (Fp.ORDER + _1n3) / _4n;
  const root = Fp.pow(n, p1div4);
  if (!Fp.eql(Fp.sqr(root), n))
    throw new Error("Cannot find square root");
  return root;
}
function sqrt5mod8(Fp, n) {
  const p5div8 = (Fp.ORDER - _5n) / _8n;
  const n2 = Fp.mul(n, _2n2);
  const v = Fp.pow(n2, p5div8);
  const nv = Fp.mul(n, v);
  const i = Fp.mul(Fp.mul(nv, _2n2), v);
  const root = Fp.mul(nv, Fp.sub(i, Fp.ONE));
  if (!Fp.eql(Fp.sqr(root), n))
    throw new Error("Cannot find square root");
  return root;
}
function tonelliShanks(P) {
  if (P < BigInt(3))
    throw new Error("sqrt is not defined for small field");
  let Q = P - _1n3;
  let S = 0;
  while (Q % _2n2 === _0n3) {
    Q /= _2n2;
    S++;
  }
  let Z = _2n2;
  const _Fp = Field(P);
  while (FpLegendre(_Fp, Z) === 1) {
    if (Z++ > 1e3)
      throw new Error("Cannot find square root: probably non-prime P");
  }
  if (S === 1)
    return sqrt3mod4;
  let cc = _Fp.pow(Z, Q);
  const Q1div2 = (Q + _1n3) / _2n2;
  return /* @__PURE__ */ __name(function tonelliSlow(Fp, n) {
    if (Fp.is0(n))
      return n;
    if (FpLegendre(Fp, n) !== 1)
      throw new Error("Cannot find square root");
    let M = S;
    let c = Fp.mul(Fp.ONE, cc);
    let t = Fp.pow(n, Q);
    let R = Fp.pow(n, Q1div2);
    while (!Fp.eql(t, Fp.ONE)) {
      if (Fp.is0(t))
        return Fp.ZERO;
      let i = 1;
      let t_tmp = Fp.sqr(t);
      while (!Fp.eql(t_tmp, Fp.ONE)) {
        i++;
        t_tmp = Fp.sqr(t_tmp);
        if (i === M)
          throw new Error("Cannot find square root");
      }
      const exponent = _1n3 << BigInt(M - i - 1);
      const b = Fp.pow(c, exponent);
      M = i;
      c = Fp.sqr(b);
      t = Fp.mul(t, c);
      R = Fp.mul(R, b);
    }
    return R;
  }, "tonelliSlow");
}
function FpSqrt(P) {
  if (P % _4n === _3n)
    return sqrt3mod4;
  if (P % _8n === _5n)
    return sqrt5mod8;
  return tonelliShanks(P);
}
function validateField(field) {
  const initial = {
    ORDER: "bigint",
    MASK: "bigint",
    BYTES: "isSafeInteger",
    BITS: "isSafeInteger"
  };
  const opts = FIELD_FIELDS.reduce((map, val) => {
    map[val] = "function";
    return map;
  }, initial);
  return validateObject(field, opts);
}
function FpPow(Fp, num2, power) {
  if (power < _0n3)
    throw new Error("invalid exponent, negatives unsupported");
  if (power === _0n3)
    return Fp.ONE;
  if (power === _1n3)
    return num2;
  let p = Fp.ONE;
  let d = num2;
  while (power > _0n3) {
    if (power & _1n3)
      p = Fp.mul(p, d);
    d = Fp.sqr(d);
    power >>= _1n3;
  }
  return p;
}
function FpInvertBatch(Fp, nums, passZero = false) {
  const inverted = new Array(nums.length).fill(passZero ? Fp.ZERO : void 0);
  const multipliedAcc = nums.reduce((acc, num2, i) => {
    if (Fp.is0(num2))
      return acc;
    inverted[i] = acc;
    return Fp.mul(acc, num2);
  }, Fp.ONE);
  const invertedAcc = Fp.inv(multipliedAcc);
  nums.reduceRight((acc, num2, i) => {
    if (Fp.is0(num2))
      return acc;
    inverted[i] = Fp.mul(acc, inverted[i]);
    return Fp.mul(acc, num2);
  }, invertedAcc);
  return inverted;
}
function FpLegendre(Fp, n) {
  const p1mod2 = (Fp.ORDER - _1n3) / _2n2;
  const powered = Fp.pow(n, p1mod2);
  const yes = Fp.eql(powered, Fp.ONE);
  const zero = Fp.eql(powered, Fp.ZERO);
  const no = Fp.eql(powered, Fp.neg(Fp.ONE));
  if (!yes && !zero && !no)
    throw new Error("invalid Legendre symbol result");
  return yes ? 1 : zero ? 0 : -1;
}
function nLength(n, nBitLength) {
  if (nBitLength !== void 0)
    anumber(nBitLength);
  const _nBitLength = nBitLength !== void 0 ? nBitLength : n.toString(2).length;
  const nByteLength = Math.ceil(_nBitLength / 8);
  return { nBitLength: _nBitLength, nByteLength };
}
function Field(ORDER, bitLen2, isLE2 = false, redef = {}) {
  if (ORDER <= _0n3)
    throw new Error("invalid field: expected ORDER > 0, got " + ORDER);
  const { nBitLength: BITS, nByteLength: BYTES } = nLength(ORDER, bitLen2);
  if (BYTES > 2048)
    throw new Error("invalid field: expected ORDER of <= 2048 bytes");
  let sqrtP;
  const f = Object.freeze({
    ORDER,
    isLE: isLE2,
    BITS,
    BYTES,
    MASK: bitMask(BITS),
    ZERO: _0n3,
    ONE: _1n3,
    create: (num2) => mod(num2, ORDER),
    isValid: (num2) => {
      if (typeof num2 !== "bigint")
        throw new Error("invalid field element: expected bigint, got " + typeof num2);
      return _0n3 <= num2 && num2 < ORDER;
    },
    is0: (num2) => num2 === _0n3,
    isOdd: (num2) => (num2 & _1n3) === _1n3,
    neg: (num2) => mod(-num2, ORDER),
    eql: (lhs, rhs) => lhs === rhs,
    sqr: (num2) => mod(num2 * num2, ORDER),
    add: (lhs, rhs) => mod(lhs + rhs, ORDER),
    sub: (lhs, rhs) => mod(lhs - rhs, ORDER),
    mul: (lhs, rhs) => mod(lhs * rhs, ORDER),
    pow: (num2, power) => FpPow(f, num2, power),
    div: (lhs, rhs) => mod(lhs * invert(rhs, ORDER), ORDER),
    // Same as above, but doesn't normalize
    sqrN: (num2) => num2 * num2,
    addN: (lhs, rhs) => lhs + rhs,
    subN: (lhs, rhs) => lhs - rhs,
    mulN: (lhs, rhs) => lhs * rhs,
    inv: (num2) => invert(num2, ORDER),
    sqrt: redef.sqrt || ((n) => {
      if (!sqrtP)
        sqrtP = FpSqrt(ORDER);
      return sqrtP(f, n);
    }),
    toBytes: (num2) => isLE2 ? numberToBytesLE(num2, BYTES) : numberToBytesBE(num2, BYTES),
    fromBytes: (bytes) => {
      if (bytes.length !== BYTES)
        throw new Error("Field.fromBytes: expected " + BYTES + " bytes, got " + bytes.length);
      return isLE2 ? bytesToNumberLE(bytes) : bytesToNumberBE(bytes);
    },
    // TODO: we don't need it here, move out to separate fn
    invertBatch: (lst) => FpInvertBatch(f, lst),
    // We can't move this out because Fp6, Fp12 implement it
    // and it's unclear what to return in there.
    cmov: (a, b, c) => c ? b : a
  });
  return Object.freeze(f);
}
function getFieldBytesLength(fieldOrder) {
  if (typeof fieldOrder !== "bigint")
    throw new Error("field order must be bigint");
  const bitLength = fieldOrder.toString(2).length;
  return Math.ceil(bitLength / 8);
}
function getMinHashLength(fieldOrder) {
  const length = getFieldBytesLength(fieldOrder);
  return length + Math.ceil(length / 2);
}
function mapHashToField(key, fieldOrder, isLE2 = false) {
  const len = key.length;
  const fieldLen = getFieldBytesLength(fieldOrder);
  const minLen = getMinHashLength(fieldOrder);
  if (len < 16 || len < minLen || len > 1024)
    throw new Error("expected " + minLen + "-1024 bytes of input, got " + len);
  const num2 = isLE2 ? bytesToNumberLE(key) : bytesToNumberBE(key);
  const reduced = mod(num2, fieldOrder - _1n3) + _1n3;
  return isLE2 ? numberToBytesLE(reduced, fieldLen) : numberToBytesBE(reduced, fieldLen);
}
var _0n3, _1n3, _2n2, _3n, _4n, _5n, _8n, FIELD_FIELDS;
var init_modular = __esm({
  "node_modules/@noble/curves/esm/abstract/modular.js"() {
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    init_utils();
    init_utils2();
    _0n3 = BigInt(0);
    _1n3 = BigInt(1);
    _2n2 = /* @__PURE__ */ BigInt(2);
    _3n = /* @__PURE__ */ BigInt(3);
    _4n = /* @__PURE__ */ BigInt(4);
    _5n = /* @__PURE__ */ BigInt(5);
    _8n = /* @__PURE__ */ BigInt(8);
    __name(mod, "mod");
    __name(pow2, "pow2");
    __name(invert, "invert");
    __name(sqrt3mod4, "sqrt3mod4");
    __name(sqrt5mod8, "sqrt5mod8");
    __name(tonelliShanks, "tonelliShanks");
    __name(FpSqrt, "FpSqrt");
    FIELD_FIELDS = [
      "create",
      "isValid",
      "is0",
      "neg",
      "inv",
      "sqrt",
      "sqr",
      "eql",
      "add",
      "sub",
      "mul",
      "pow",
      "div",
      "addN",
      "subN",
      "mulN",
      "sqrN"
    ];
    __name(validateField, "validateField");
    __name(FpPow, "FpPow");
    __name(FpInvertBatch, "FpInvertBatch");
    __name(FpLegendre, "FpLegendre");
    __name(nLength, "nLength");
    __name(Field, "Field");
    __name(getFieldBytesLength, "getFieldBytesLength");
    __name(getMinHashLength, "getMinHashLength");
    __name(mapHashToField, "mapHashToField");
  }
});

// node_modules/@noble/curves/esm/abstract/curve.js
function constTimeNegate(condition, item) {
  const neg = item.negate();
  return condition ? neg : item;
}
function validateW(W, bits) {
  if (!Number.isSafeInteger(W) || W <= 0 || W > bits)
    throw new Error("invalid window size, expected [1.." + bits + "], got W=" + W);
}
function calcWOpts(W, scalarBits) {
  validateW(W, scalarBits);
  const windows = Math.ceil(scalarBits / W) + 1;
  const windowSize = 2 ** (W - 1);
  const maxNumber = 2 ** W;
  const mask = bitMask(W);
  const shiftBy = BigInt(W);
  return { windows, windowSize, mask, maxNumber, shiftBy };
}
function calcOffsets(n, window, wOpts) {
  const { windowSize, mask, maxNumber, shiftBy } = wOpts;
  let wbits = Number(n & mask);
  let nextN = n >> shiftBy;
  if (wbits > windowSize) {
    wbits -= maxNumber;
    nextN += _1n4;
  }
  const offsetStart = window * windowSize;
  const offset = offsetStart + Math.abs(wbits) - 1;
  const isZero = wbits === 0;
  const isNeg = wbits < 0;
  const isNegF = window % 2 !== 0;
  const offsetF = offsetStart;
  return { nextN, offset, isZero, isNeg, isNegF, offsetF };
}
function validateMSMPoints(points, c) {
  if (!Array.isArray(points))
    throw new Error("array expected");
  points.forEach((p, i) => {
    if (!(p instanceof c))
      throw new Error("invalid point at index " + i);
  });
}
function validateMSMScalars(scalars, field) {
  if (!Array.isArray(scalars))
    throw new Error("array of scalars expected");
  scalars.forEach((s, i) => {
    if (!field.isValid(s))
      throw new Error("invalid scalar at index " + i);
  });
}
function getW(P) {
  return pointWindowSizes.get(P) || 1;
}
function wNAF(c, bits) {
  return {
    constTimeNegate,
    hasPrecomputes(elm) {
      return getW(elm) !== 1;
    },
    // non-const time multiplication ladder
    unsafeLadder(elm, n, p = c.ZERO) {
      let d = elm;
      while (n > _0n4) {
        if (n & _1n4)
          p = p.add(d);
        d = d.double();
        n >>= _1n4;
      }
      return p;
    },
    /**
     * Creates a wNAF precomputation window. Used for caching.
     * Default window size is set by `utils.precompute()` and is equal to 8.
     * Number of precomputed points depends on the curve size:
     * 2^(𝑊−1) * (Math.ceil(𝑛 / 𝑊) + 1), where:
     * - 𝑊 is the window size
     * - 𝑛 is the bitlength of the curve order.
     * For a 256-bit curve and window size 8, the number of precomputed points is 128 * 33 = 4224.
     * @param elm Point instance
     * @param W window size
     * @returns precomputed point tables flattened to a single array
     */
    precomputeWindow(elm, W) {
      const { windows, windowSize } = calcWOpts(W, bits);
      const points = [];
      let p = elm;
      let base = p;
      for (let window = 0; window < windows; window++) {
        base = p;
        points.push(base);
        for (let i = 1; i < windowSize; i++) {
          base = base.add(p);
          points.push(base);
        }
        p = base.double();
      }
      return points;
    },
    /**
     * Implements ec multiplication using precomputed tables and w-ary non-adjacent form.
     * @param W window size
     * @param precomputes precomputed tables
     * @param n scalar (we don't check here, but should be less than curve order)
     * @returns real and fake (for const-time) points
     */
    wNAF(W, precomputes, n) {
      let p = c.ZERO;
      let f = c.BASE;
      const wo = calcWOpts(W, bits);
      for (let window = 0; window < wo.windows; window++) {
        const { nextN, offset, isZero, isNeg, isNegF, offsetF } = calcOffsets(n, window, wo);
        n = nextN;
        if (isZero) {
          f = f.add(constTimeNegate(isNegF, precomputes[offsetF]));
        } else {
          p = p.add(constTimeNegate(isNeg, precomputes[offset]));
        }
      }
      return { p, f };
    },
    /**
     * Implements ec unsafe (non const-time) multiplication using precomputed tables and w-ary non-adjacent form.
     * @param W window size
     * @param precomputes precomputed tables
     * @param n scalar (we don't check here, but should be less than curve order)
     * @param acc accumulator point to add result of multiplication
     * @returns point
     */
    wNAFUnsafe(W, precomputes, n, acc = c.ZERO) {
      const wo = calcWOpts(W, bits);
      for (let window = 0; window < wo.windows; window++) {
        if (n === _0n4)
          break;
        const { nextN, offset, isZero, isNeg } = calcOffsets(n, window, wo);
        n = nextN;
        if (isZero) {
          continue;
        } else {
          const item = precomputes[offset];
          acc = acc.add(isNeg ? item.negate() : item);
        }
      }
      return acc;
    },
    getPrecomputes(W, P, transform) {
      let comp = pointPrecomputes.get(P);
      if (!comp) {
        comp = this.precomputeWindow(P, W);
        if (W !== 1)
          pointPrecomputes.set(P, transform(comp));
      }
      return comp;
    },
    wNAFCached(P, n, transform) {
      const W = getW(P);
      return this.wNAF(W, this.getPrecomputes(W, P, transform), n);
    },
    wNAFCachedUnsafe(P, n, transform, prev) {
      const W = getW(P);
      if (W === 1)
        return this.unsafeLadder(P, n, prev);
      return this.wNAFUnsafe(W, this.getPrecomputes(W, P, transform), n, prev);
    },
    // We calculate precomputes for elliptic curve point multiplication
    // using windowed method. This specifies window size and
    // stores precomputed values. Usually only base point would be precomputed.
    setWindowSize(P, W) {
      validateW(W, bits);
      pointWindowSizes.set(P, W);
      pointPrecomputes.delete(P);
    }
  };
}
function pippenger(c, fieldN, points, scalars) {
  validateMSMPoints(points, c);
  validateMSMScalars(scalars, fieldN);
  const plength = points.length;
  const slength = scalars.length;
  if (plength !== slength)
    throw new Error("arrays of points and scalars must have equal length");
  const zero = c.ZERO;
  const wbits = bitLen(BigInt(plength));
  let windowSize = 1;
  if (wbits > 12)
    windowSize = wbits - 3;
  else if (wbits > 4)
    windowSize = wbits - 2;
  else if (wbits > 0)
    windowSize = 2;
  const MASK = bitMask(windowSize);
  const buckets = new Array(Number(MASK) + 1).fill(zero);
  const lastBits = Math.floor((fieldN.BITS - 1) / windowSize) * windowSize;
  let sum = zero;
  for (let i = lastBits; i >= 0; i -= windowSize) {
    buckets.fill(zero);
    for (let j = 0; j < slength; j++) {
      const scalar = scalars[j];
      const wbits2 = Number(scalar >> BigInt(i) & MASK);
      buckets[wbits2] = buckets[wbits2].add(points[j]);
    }
    let resI = zero;
    for (let j = buckets.length - 1, sumI = zero; j > 0; j--) {
      sumI = sumI.add(buckets[j]);
      resI = resI.add(sumI);
    }
    sum = sum.add(resI);
    if (i !== 0)
      for (let j = 0; j < windowSize; j++)
        sum = sum.double();
  }
  return sum;
}
function validateBasic(curve) {
  validateField(curve.Fp);
  validateObject(curve, {
    n: "bigint",
    h: "bigint",
    Gx: "field",
    Gy: "field"
  }, {
    nBitLength: "isSafeInteger",
    nByteLength: "isSafeInteger"
  });
  return Object.freeze({
    ...nLength(curve.n, curve.nBitLength),
    ...curve,
    ...{ p: curve.Fp.ORDER }
  });
}
var _0n4, _1n4, pointPrecomputes, pointWindowSizes;
var init_curve = __esm({
  "node_modules/@noble/curves/esm/abstract/curve.js"() {
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    init_modular();
    init_utils2();
    _0n4 = BigInt(0);
    _1n4 = BigInt(1);
    __name(constTimeNegate, "constTimeNegate");
    __name(validateW, "validateW");
    __name(calcWOpts, "calcWOpts");
    __name(calcOffsets, "calcOffsets");
    __name(validateMSMPoints, "validateMSMPoints");
    __name(validateMSMScalars, "validateMSMScalars");
    pointPrecomputes = /* @__PURE__ */ new WeakMap();
    pointWindowSizes = /* @__PURE__ */ new WeakMap();
    __name(getW, "getW");
    __name(wNAF, "wNAF");
    __name(pippenger, "pippenger");
    __name(validateBasic, "validateBasic");
  }
});

// node_modules/@noble/curves/esm/abstract/weierstrass.js
function validateSigVerOpts(opts) {
  if (opts.lowS !== void 0)
    abool("lowS", opts.lowS);
  if (opts.prehash !== void 0)
    abool("prehash", opts.prehash);
}
function validatePointOpts(curve) {
  const opts = validateBasic(curve);
  validateObject(opts, {
    a: "field",
    b: "field"
  }, {
    allowInfinityPoint: "boolean",
    allowedPrivateKeyLengths: "array",
    clearCofactor: "function",
    fromBytes: "function",
    isTorsionFree: "function",
    toBytes: "function",
    wrapPrivateKey: "boolean"
  });
  const { endo, Fp, a } = opts;
  if (endo) {
    if (!Fp.eql(a, Fp.ZERO)) {
      throw new Error("invalid endo: CURVE.a must be 0");
    }
    if (typeof endo !== "object" || typeof endo.beta !== "bigint" || typeof endo.splitScalar !== "function") {
      throw new Error('invalid endo: expected "beta": bigint and "splitScalar": function');
    }
  }
  return Object.freeze({ ...opts });
}
function numToSizedHex(num2, size2) {
  return bytesToHex2(numberToBytesBE(num2, size2));
}
function weierstrassPoints(opts) {
  const CURVE = validatePointOpts(opts);
  const { Fp } = CURVE;
  const Fn = Field(CURVE.n, CURVE.nBitLength);
  const toBytes3 = CURVE.toBytes || ((_c, point, _isCompressed) => {
    const a = point.toAffine();
    return concatBytes3(Uint8Array.from([4]), Fp.toBytes(a.x), Fp.toBytes(a.y));
  });
  const fromBytes = CURVE.fromBytes || ((bytes) => {
    const tail = bytes.subarray(1);
    const x = Fp.fromBytes(tail.subarray(0, Fp.BYTES));
    const y = Fp.fromBytes(tail.subarray(Fp.BYTES, 2 * Fp.BYTES));
    return { x, y };
  });
  function weierstrassEquation(x) {
    const { a, b } = CURVE;
    const x2 = Fp.sqr(x);
    const x3 = Fp.mul(x2, x);
    return Fp.add(Fp.add(x3, Fp.mul(x, a)), b);
  }
  __name(weierstrassEquation, "weierstrassEquation");
  function isValidXY(x, y) {
    const left = Fp.sqr(y);
    const right = weierstrassEquation(x);
    return Fp.eql(left, right);
  }
  __name(isValidXY, "isValidXY");
  if (!isValidXY(CURVE.Gx, CURVE.Gy))
    throw new Error("bad curve params: generator point");
  const _4a3 = Fp.mul(Fp.pow(CURVE.a, _3n2), _4n2);
  const _27b2 = Fp.mul(Fp.sqr(CURVE.b), BigInt(27));
  if (Fp.is0(Fp.add(_4a3, _27b2)))
    throw new Error("bad curve params: a or b");
  function isWithinCurveOrder(num2) {
    return inRange(num2, _1n5, CURVE.n);
  }
  __name(isWithinCurveOrder, "isWithinCurveOrder");
  function normPrivateKeyToScalar(key) {
    const { allowedPrivateKeyLengths: lengths, nByteLength, wrapPrivateKey, n: N } = CURVE;
    if (lengths && typeof key !== "bigint") {
      if (isBytes2(key))
        key = bytesToHex2(key);
      if (typeof key !== "string" || !lengths.includes(key.length))
        throw new Error("invalid private key");
      key = key.padStart(nByteLength * 2, "0");
    }
    let num2;
    try {
      num2 = typeof key === "bigint" ? key : bytesToNumberBE(ensureBytes("private key", key, nByteLength));
    } catch (error) {
      throw new Error("invalid private key, expected hex or " + nByteLength + " bytes, got " + typeof key);
    }
    if (wrapPrivateKey)
      num2 = mod(num2, N);
    aInRange("private key", num2, _1n5, N);
    return num2;
  }
  __name(normPrivateKeyToScalar, "normPrivateKeyToScalar");
  function aprjpoint(other) {
    if (!(other instanceof Point2))
      throw new Error("ProjectivePoint expected");
  }
  __name(aprjpoint, "aprjpoint");
  const toAffineMemo = memoized((p, iz) => {
    const { px: x, py: y, pz: z } = p;
    if (Fp.eql(z, Fp.ONE))
      return { x, y };
    const is0 = p.is0();
    if (iz == null)
      iz = is0 ? Fp.ONE : Fp.inv(z);
    const ax = Fp.mul(x, iz);
    const ay = Fp.mul(y, iz);
    const zz = Fp.mul(z, iz);
    if (is0)
      return { x: Fp.ZERO, y: Fp.ZERO };
    if (!Fp.eql(zz, Fp.ONE))
      throw new Error("invZ was invalid");
    return { x: ax, y: ay };
  });
  const assertValidMemo = memoized((p) => {
    if (p.is0()) {
      if (CURVE.allowInfinityPoint && !Fp.is0(p.py))
        return;
      throw new Error("bad point: ZERO");
    }
    const { x, y } = p.toAffine();
    if (!Fp.isValid(x) || !Fp.isValid(y))
      throw new Error("bad point: x or y not FE");
    if (!isValidXY(x, y))
      throw new Error("bad point: equation left != right");
    if (!p.isTorsionFree())
      throw new Error("bad point: not in prime-order subgroup");
    return true;
  });
  class Point2 {
    constructor(px, py, pz) {
      if (px == null || !Fp.isValid(px))
        throw new Error("x required");
      if (py == null || !Fp.isValid(py) || Fp.is0(py))
        throw new Error("y required");
      if (pz == null || !Fp.isValid(pz))
        throw new Error("z required");
      this.px = px;
      this.py = py;
      this.pz = pz;
      Object.freeze(this);
    }
    // Does not validate if the point is on-curve.
    // Use fromHex instead, or call assertValidity() later.
    static fromAffine(p) {
      const { x, y } = p || {};
      if (!p || !Fp.isValid(x) || !Fp.isValid(y))
        throw new Error("invalid affine point");
      if (p instanceof Point2)
        throw new Error("projective point not allowed");
      const is0 = /* @__PURE__ */ __name((i) => Fp.eql(i, Fp.ZERO), "is0");
      if (is0(x) && is0(y))
        return Point2.ZERO;
      return new Point2(x, y, Fp.ONE);
    }
    get x() {
      return this.toAffine().x;
    }
    get y() {
      return this.toAffine().y;
    }
    /**
     * Takes a bunch of Projective Points but executes only one
     * inversion on all of them. Inversion is very slow operation,
     * so this improves performance massively.
     * Optimization: converts a list of projective points to a list of identical points with Z=1.
     */
    static normalizeZ(points) {
      const toInv = FpInvertBatch(Fp, points.map((p) => p.pz));
      return points.map((p, i) => p.toAffine(toInv[i])).map(Point2.fromAffine);
    }
    /**
     * Converts hash string or Uint8Array to Point.
     * @param hex short/long ECDSA hex
     */
    static fromHex(hex) {
      const P = Point2.fromAffine(fromBytes(ensureBytes("pointHex", hex)));
      P.assertValidity();
      return P;
    }
    // Multiplies generator point by privateKey.
    static fromPrivateKey(privateKey) {
      return Point2.BASE.multiply(normPrivateKeyToScalar(privateKey));
    }
    // Multiscalar Multiplication
    static msm(points, scalars) {
      return pippenger(Point2, Fn, points, scalars);
    }
    // "Private method", don't use it directly
    _setWindowSize(windowSize) {
      wnaf.setWindowSize(this, windowSize);
    }
    // A point on curve is valid if it conforms to equation.
    assertValidity() {
      assertValidMemo(this);
    }
    hasEvenY() {
      const { y } = this.toAffine();
      if (Fp.isOdd)
        return !Fp.isOdd(y);
      throw new Error("Field doesn't support isOdd");
    }
    /**
     * Compare one point to another.
     */
    equals(other) {
      aprjpoint(other);
      const { px: X1, py: Y1, pz: Z1 } = this;
      const { px: X2, py: Y2, pz: Z2 } = other;
      const U1 = Fp.eql(Fp.mul(X1, Z2), Fp.mul(X2, Z1));
      const U2 = Fp.eql(Fp.mul(Y1, Z2), Fp.mul(Y2, Z1));
      return U1 && U2;
    }
    /**
     * Flips point to one corresponding to (x, -y) in Affine coordinates.
     */
    negate() {
      return new Point2(this.px, Fp.neg(this.py), this.pz);
    }
    // Renes-Costello-Batina exception-free doubling formula.
    // There is 30% faster Jacobian formula, but it is not complete.
    // https://eprint.iacr.org/2015/1060, algorithm 3
    // Cost: 8M + 3S + 3*a + 2*b3 + 15add.
    double() {
      const { a, b } = CURVE;
      const b3 = Fp.mul(b, _3n2);
      const { px: X1, py: Y1, pz: Z1 } = this;
      let X3 = Fp.ZERO, Y3 = Fp.ZERO, Z3 = Fp.ZERO;
      let t0 = Fp.mul(X1, X1);
      let t1 = Fp.mul(Y1, Y1);
      let t2 = Fp.mul(Z1, Z1);
      let t3 = Fp.mul(X1, Y1);
      t3 = Fp.add(t3, t3);
      Z3 = Fp.mul(X1, Z1);
      Z3 = Fp.add(Z3, Z3);
      X3 = Fp.mul(a, Z3);
      Y3 = Fp.mul(b3, t2);
      Y3 = Fp.add(X3, Y3);
      X3 = Fp.sub(t1, Y3);
      Y3 = Fp.add(t1, Y3);
      Y3 = Fp.mul(X3, Y3);
      X3 = Fp.mul(t3, X3);
      Z3 = Fp.mul(b3, Z3);
      t2 = Fp.mul(a, t2);
      t3 = Fp.sub(t0, t2);
      t3 = Fp.mul(a, t3);
      t3 = Fp.add(t3, Z3);
      Z3 = Fp.add(t0, t0);
      t0 = Fp.add(Z3, t0);
      t0 = Fp.add(t0, t2);
      t0 = Fp.mul(t0, t3);
      Y3 = Fp.add(Y3, t0);
      t2 = Fp.mul(Y1, Z1);
      t2 = Fp.add(t2, t2);
      t0 = Fp.mul(t2, t3);
      X3 = Fp.sub(X3, t0);
      Z3 = Fp.mul(t2, t1);
      Z3 = Fp.add(Z3, Z3);
      Z3 = Fp.add(Z3, Z3);
      return new Point2(X3, Y3, Z3);
    }
    // Renes-Costello-Batina exception-free addition formula.
    // There is 30% faster Jacobian formula, but it is not complete.
    // https://eprint.iacr.org/2015/1060, algorithm 1
    // Cost: 12M + 0S + 3*a + 3*b3 + 23add.
    add(other) {
      aprjpoint(other);
      const { px: X1, py: Y1, pz: Z1 } = this;
      const { px: X2, py: Y2, pz: Z2 } = other;
      let X3 = Fp.ZERO, Y3 = Fp.ZERO, Z3 = Fp.ZERO;
      const a = CURVE.a;
      const b3 = Fp.mul(CURVE.b, _3n2);
      let t0 = Fp.mul(X1, X2);
      let t1 = Fp.mul(Y1, Y2);
      let t2 = Fp.mul(Z1, Z2);
      let t3 = Fp.add(X1, Y1);
      let t4 = Fp.add(X2, Y2);
      t3 = Fp.mul(t3, t4);
      t4 = Fp.add(t0, t1);
      t3 = Fp.sub(t3, t4);
      t4 = Fp.add(X1, Z1);
      let t5 = Fp.add(X2, Z2);
      t4 = Fp.mul(t4, t5);
      t5 = Fp.add(t0, t2);
      t4 = Fp.sub(t4, t5);
      t5 = Fp.add(Y1, Z1);
      X3 = Fp.add(Y2, Z2);
      t5 = Fp.mul(t5, X3);
      X3 = Fp.add(t1, t2);
      t5 = Fp.sub(t5, X3);
      Z3 = Fp.mul(a, t4);
      X3 = Fp.mul(b3, t2);
      Z3 = Fp.add(X3, Z3);
      X3 = Fp.sub(t1, Z3);
      Z3 = Fp.add(t1, Z3);
      Y3 = Fp.mul(X3, Z3);
      t1 = Fp.add(t0, t0);
      t1 = Fp.add(t1, t0);
      t2 = Fp.mul(a, t2);
      t4 = Fp.mul(b3, t4);
      t1 = Fp.add(t1, t2);
      t2 = Fp.sub(t0, t2);
      t2 = Fp.mul(a, t2);
      t4 = Fp.add(t4, t2);
      t0 = Fp.mul(t1, t4);
      Y3 = Fp.add(Y3, t0);
      t0 = Fp.mul(t5, t4);
      X3 = Fp.mul(t3, X3);
      X3 = Fp.sub(X3, t0);
      t0 = Fp.mul(t3, t1);
      Z3 = Fp.mul(t5, Z3);
      Z3 = Fp.add(Z3, t0);
      return new Point2(X3, Y3, Z3);
    }
    subtract(other) {
      return this.add(other.negate());
    }
    is0() {
      return this.equals(Point2.ZERO);
    }
    wNAF(n) {
      return wnaf.wNAFCached(this, n, Point2.normalizeZ);
    }
    /**
     * Non-constant-time multiplication. Uses double-and-add algorithm.
     * It's faster, but should only be used when you don't care about
     * an exposed private key e.g. sig verification, which works over *public* keys.
     */
    multiplyUnsafe(sc) {
      const { endo: endo2, n: N } = CURVE;
      aInRange("scalar", sc, _0n5, N);
      const I = Point2.ZERO;
      if (sc === _0n5)
        return I;
      if (this.is0() || sc === _1n5)
        return this;
      if (!endo2 || wnaf.hasPrecomputes(this))
        return wnaf.wNAFCachedUnsafe(this, sc, Point2.normalizeZ);
      let { k1neg, k1, k2neg, k2 } = endo2.splitScalar(sc);
      let k1p = I;
      let k2p = I;
      let d = this;
      while (k1 > _0n5 || k2 > _0n5) {
        if (k1 & _1n5)
          k1p = k1p.add(d);
        if (k2 & _1n5)
          k2p = k2p.add(d);
        d = d.double();
        k1 >>= _1n5;
        k2 >>= _1n5;
      }
      if (k1neg)
        k1p = k1p.negate();
      if (k2neg)
        k2p = k2p.negate();
      k2p = new Point2(Fp.mul(k2p.px, endo2.beta), k2p.py, k2p.pz);
      return k1p.add(k2p);
    }
    /**
     * Constant time multiplication.
     * Uses wNAF method. Windowed method may be 10% faster,
     * but takes 2x longer to generate and consumes 2x memory.
     * Uses precomputes when available.
     * Uses endomorphism for Koblitz curves.
     * @param scalar by which the point would be multiplied
     * @returns New point
     */
    multiply(scalar) {
      const { endo: endo2, n: N } = CURVE;
      aInRange("scalar", scalar, _1n5, N);
      let point, fake;
      if (endo2) {
        const { k1neg, k1, k2neg, k2 } = endo2.splitScalar(scalar);
        let { p: k1p, f: f1p } = this.wNAF(k1);
        let { p: k2p, f: f2p } = this.wNAF(k2);
        k1p = wnaf.constTimeNegate(k1neg, k1p);
        k2p = wnaf.constTimeNegate(k2neg, k2p);
        k2p = new Point2(Fp.mul(k2p.px, endo2.beta), k2p.py, k2p.pz);
        point = k1p.add(k2p);
        fake = f1p.add(f2p);
      } else {
        const { p, f } = this.wNAF(scalar);
        point = p;
        fake = f;
      }
      return Point2.normalizeZ([point, fake])[0];
    }
    /**
     * Efficiently calculate `aP + bQ`. Unsafe, can expose private key, if used incorrectly.
     * Not using Strauss-Shamir trick: precomputation tables are faster.
     * The trick could be useful if both P and Q are not G (not in our case).
     * @returns non-zero affine point
     */
    multiplyAndAddUnsafe(Q, a, b) {
      const G = Point2.BASE;
      const mul = /* @__PURE__ */ __name((P, a2) => a2 === _0n5 || a2 === _1n5 || !P.equals(G) ? P.multiplyUnsafe(a2) : P.multiply(a2), "mul");
      const sum = mul(this, a).add(mul(Q, b));
      return sum.is0() ? void 0 : sum;
    }
    // Converts Projective point to affine (x, y) coordinates.
    // Can accept precomputed Z^-1 - for example, from invertBatch.
    // (x, y, z) ∋ (x=x/z, y=y/z)
    toAffine(iz) {
      return toAffineMemo(this, iz);
    }
    isTorsionFree() {
      const { h: cofactor, isTorsionFree } = CURVE;
      if (cofactor === _1n5)
        return true;
      if (isTorsionFree)
        return isTorsionFree(Point2, this);
      throw new Error("isTorsionFree() has not been declared for the elliptic curve");
    }
    clearCofactor() {
      const { h: cofactor, clearCofactor } = CURVE;
      if (cofactor === _1n5)
        return this;
      if (clearCofactor)
        return clearCofactor(Point2, this);
      return this.multiplyUnsafe(CURVE.h);
    }
    toRawBytes(isCompressed = true) {
      abool("isCompressed", isCompressed);
      this.assertValidity();
      return toBytes3(Point2, this, isCompressed);
    }
    toHex(isCompressed = true) {
      abool("isCompressed", isCompressed);
      return bytesToHex2(this.toRawBytes(isCompressed));
    }
  }
  __name(Point2, "Point");
  Point2.BASE = new Point2(CURVE.Gx, CURVE.Gy, Fp.ONE);
  Point2.ZERO = new Point2(Fp.ZERO, Fp.ONE, Fp.ZERO);
  const { endo, nBitLength } = CURVE;
  const wnaf = wNAF(Point2, endo ? Math.ceil(nBitLength / 2) : nBitLength);
  return {
    CURVE,
    ProjectivePoint: Point2,
    normPrivateKeyToScalar,
    weierstrassEquation,
    isWithinCurveOrder
  };
}
function validateOpts(curve) {
  const opts = validateBasic(curve);
  validateObject(opts, {
    hash: "hash",
    hmac: "function",
    randomBytes: "function"
  }, {
    bits2int: "function",
    bits2int_modN: "function",
    lowS: "boolean"
  });
  return Object.freeze({ lowS: true, ...opts });
}
function weierstrass(curveDef) {
  const CURVE = validateOpts(curveDef);
  const { Fp, n: CURVE_ORDER, nByteLength, nBitLength } = CURVE;
  const compressedLen = Fp.BYTES + 1;
  const uncompressedLen = 2 * Fp.BYTES + 1;
  function modN2(a) {
    return mod(a, CURVE_ORDER);
  }
  __name(modN2, "modN");
  function invN(a) {
    return invert(a, CURVE_ORDER);
  }
  __name(invN, "invN");
  const { ProjectivePoint: Point2, normPrivateKeyToScalar, weierstrassEquation, isWithinCurveOrder } = weierstrassPoints({
    ...CURVE,
    toBytes(_c, point, isCompressed) {
      const a = point.toAffine();
      const x = Fp.toBytes(a.x);
      const cat = concatBytes3;
      abool("isCompressed", isCompressed);
      if (isCompressed) {
        return cat(Uint8Array.from([point.hasEvenY() ? 2 : 3]), x);
      } else {
        return cat(Uint8Array.from([4]), x, Fp.toBytes(a.y));
      }
    },
    fromBytes(bytes) {
      const len = bytes.length;
      const head = bytes[0];
      const tail = bytes.subarray(1);
      if (len === compressedLen && (head === 2 || head === 3)) {
        const x = bytesToNumberBE(tail);
        if (!inRange(x, _1n5, Fp.ORDER))
          throw new Error("Point is not on curve");
        const y2 = weierstrassEquation(x);
        let y;
        try {
          y = Fp.sqrt(y2);
        } catch (sqrtError) {
          const suffix = sqrtError instanceof Error ? ": " + sqrtError.message : "";
          throw new Error("Point is not on curve" + suffix);
        }
        const isYOdd = (y & _1n5) === _1n5;
        const isHeadOdd = (head & 1) === 1;
        if (isHeadOdd !== isYOdd)
          y = Fp.neg(y);
        return { x, y };
      } else if (len === uncompressedLen && head === 4) {
        const x = Fp.fromBytes(tail.subarray(0, Fp.BYTES));
        const y = Fp.fromBytes(tail.subarray(Fp.BYTES, 2 * Fp.BYTES));
        return { x, y };
      } else {
        const cl = compressedLen;
        const ul = uncompressedLen;
        throw new Error("invalid Point, expected length of " + cl + ", or uncompressed " + ul + ", got " + len);
      }
    }
  });
  function isBiggerThanHalfOrder(number) {
    const HALF = CURVE_ORDER >> _1n5;
    return number > HALF;
  }
  __name(isBiggerThanHalfOrder, "isBiggerThanHalfOrder");
  function normalizeS(s) {
    return isBiggerThanHalfOrder(s) ? modN2(-s) : s;
  }
  __name(normalizeS, "normalizeS");
  const slcNum = /* @__PURE__ */ __name((b, from, to) => bytesToNumberBE(b.slice(from, to)), "slcNum");
  class Signature {
    constructor(r, s, recovery) {
      aInRange("r", r, _1n5, CURVE_ORDER);
      aInRange("s", s, _1n5, CURVE_ORDER);
      this.r = r;
      this.s = s;
      if (recovery != null)
        this.recovery = recovery;
      Object.freeze(this);
    }
    // pair (bytes of r, bytes of s)
    static fromCompact(hex) {
      const l = nByteLength;
      hex = ensureBytes("compactSignature", hex, l * 2);
      return new Signature(slcNum(hex, 0, l), slcNum(hex, l, 2 * l));
    }
    // DER encoded ECDSA signature
    // https://bitcoin.stackexchange.com/questions/57644/what-are-the-parts-of-a-bitcoin-transaction-input-script
    static fromDER(hex) {
      const { r, s } = DER.toSig(ensureBytes("DER", hex));
      return new Signature(r, s);
    }
    /**
     * @todo remove
     * @deprecated
     */
    assertValidity() {
    }
    addRecoveryBit(recovery) {
      return new Signature(this.r, this.s, recovery);
    }
    recoverPublicKey(msgHash) {
      const { r, s, recovery: rec } = this;
      const h = bits2int_modN(ensureBytes("msgHash", msgHash));
      if (rec == null || ![0, 1, 2, 3].includes(rec))
        throw new Error("recovery id invalid");
      const radj = rec === 2 || rec === 3 ? r + CURVE.n : r;
      if (radj >= Fp.ORDER)
        throw new Error("recovery id 2 or 3 invalid");
      const prefix = (rec & 1) === 0 ? "02" : "03";
      const R = Point2.fromHex(prefix + numToSizedHex(radj, Fp.BYTES));
      const ir = invN(radj);
      const u1 = modN2(-h * ir);
      const u2 = modN2(s * ir);
      const Q = Point2.BASE.multiplyAndAddUnsafe(R, u1, u2);
      if (!Q)
        throw new Error("point at infinify");
      Q.assertValidity();
      return Q;
    }
    // Signatures should be low-s, to prevent malleability.
    hasHighS() {
      return isBiggerThanHalfOrder(this.s);
    }
    normalizeS() {
      return this.hasHighS() ? new Signature(this.r, modN2(-this.s), this.recovery) : this;
    }
    // DER-encoded
    toDERRawBytes() {
      return hexToBytes2(this.toDERHex());
    }
    toDERHex() {
      return DER.hexFromSig(this);
    }
    // padded bytes of r, then padded bytes of s
    toCompactRawBytes() {
      return hexToBytes2(this.toCompactHex());
    }
    toCompactHex() {
      const l = nByteLength;
      return numToSizedHex(this.r, l) + numToSizedHex(this.s, l);
    }
  }
  __name(Signature, "Signature");
  const utils = {
    isValidPrivateKey(privateKey) {
      try {
        normPrivateKeyToScalar(privateKey);
        return true;
      } catch (error) {
        return false;
      }
    },
    normPrivateKeyToScalar,
    /**
     * Produces cryptographically secure private key from random of size
     * (groupLen + ceil(groupLen / 2)) with modulo bias being negligible.
     */
    randomPrivateKey: () => {
      const length = getMinHashLength(CURVE.n);
      return mapHashToField(CURVE.randomBytes(length), CURVE.n);
    },
    /**
     * Creates precompute table for an arbitrary EC point. Makes point "cached".
     * Allows to massively speed-up `point.multiply(scalar)`.
     * @returns cached point
     * @example
     * const fast = utils.precompute(8, ProjectivePoint.fromHex(someonesPubKey));
     * fast.multiply(privKey); // much faster ECDH now
     */
    precompute(windowSize = 8, point = Point2.BASE) {
      point._setWindowSize(windowSize);
      point.multiply(BigInt(3));
      return point;
    }
  };
  function getPublicKey(privateKey, isCompressed = true) {
    return Point2.fromPrivateKey(privateKey).toRawBytes(isCompressed);
  }
  __name(getPublicKey, "getPublicKey");
  function isProbPub(item) {
    if (typeof item === "bigint")
      return false;
    if (item instanceof Point2)
      return true;
    const arr = ensureBytes("key", item);
    const len = arr.length;
    const fpl = Fp.BYTES;
    const compLen = fpl + 1;
    const uncompLen = 2 * fpl + 1;
    if (CURVE.allowedPrivateKeyLengths || nByteLength === compLen) {
      return void 0;
    } else {
      return len === compLen || len === uncompLen;
    }
  }
  __name(isProbPub, "isProbPub");
  function getSharedSecret(privateA, publicB, isCompressed = true) {
    if (isProbPub(privateA) === true)
      throw new Error("first arg must be private key");
    if (isProbPub(publicB) === false)
      throw new Error("second arg must be public key");
    const b = Point2.fromHex(publicB);
    return b.multiply(normPrivateKeyToScalar(privateA)).toRawBytes(isCompressed);
  }
  __name(getSharedSecret, "getSharedSecret");
  const bits2int = CURVE.bits2int || function(bytes) {
    if (bytes.length > 8192)
      throw new Error("input is too large");
    const num2 = bytesToNumberBE(bytes);
    const delta = bytes.length * 8 - nBitLength;
    return delta > 0 ? num2 >> BigInt(delta) : num2;
  };
  const bits2int_modN = CURVE.bits2int_modN || function(bytes) {
    return modN2(bits2int(bytes));
  };
  const ORDER_MASK = bitMask(nBitLength);
  function int2octets(num2) {
    aInRange("num < 2^" + nBitLength, num2, _0n5, ORDER_MASK);
    return numberToBytesBE(num2, nByteLength);
  }
  __name(int2octets, "int2octets");
  function prepSig(msgHash, privateKey, opts = defaultSigOpts) {
    if (["recovered", "canonical"].some((k) => k in opts))
      throw new Error("sign() legacy options not supported");
    const { hash, randomBytes: randomBytes2 } = CURVE;
    let { lowS, prehash, extraEntropy: ent } = opts;
    if (lowS == null)
      lowS = true;
    msgHash = ensureBytes("msgHash", msgHash);
    validateSigVerOpts(opts);
    if (prehash)
      msgHash = ensureBytes("prehashed msgHash", hash(msgHash));
    const h1int = bits2int_modN(msgHash);
    const d = normPrivateKeyToScalar(privateKey);
    const seedArgs = [int2octets(d), int2octets(h1int)];
    if (ent != null && ent !== false) {
      const e = ent === true ? randomBytes2(Fp.BYTES) : ent;
      seedArgs.push(ensureBytes("extraEntropy", e));
    }
    const seed = concatBytes3(...seedArgs);
    const m = h1int;
    function k2sig(kBytes) {
      const k = bits2int(kBytes);
      if (!isWithinCurveOrder(k))
        return;
      const ik = invN(k);
      const q = Point2.BASE.multiply(k).toAffine();
      const r = modN2(q.x);
      if (r === _0n5)
        return;
      const s = modN2(ik * modN2(m + r * d));
      if (s === _0n5)
        return;
      let recovery = (q.x === r ? 0 : 2) | Number(q.y & _1n5);
      let normS = s;
      if (lowS && isBiggerThanHalfOrder(s)) {
        normS = normalizeS(s);
        recovery ^= 1;
      }
      return new Signature(r, normS, recovery);
    }
    __name(k2sig, "k2sig");
    return { seed, k2sig };
  }
  __name(prepSig, "prepSig");
  const defaultSigOpts = { lowS: CURVE.lowS, prehash: false };
  const defaultVerOpts = { lowS: CURVE.lowS, prehash: false };
  function sign(msgHash, privKey, opts = defaultSigOpts) {
    const { seed, k2sig } = prepSig(msgHash, privKey, opts);
    const C = CURVE;
    const drbg = createHmacDrbg(C.hash.outputLen, C.nByteLength, C.hmac);
    return drbg(seed, k2sig);
  }
  __name(sign, "sign");
  Point2.BASE._setWindowSize(8);
  function verify(signature, msgHash, publicKey, opts = defaultVerOpts) {
    const sg = signature;
    msgHash = ensureBytes("msgHash", msgHash);
    publicKey = ensureBytes("publicKey", publicKey);
    const { lowS, prehash, format } = opts;
    validateSigVerOpts(opts);
    if ("strict" in opts)
      throw new Error("options.strict was renamed to lowS");
    if (format !== void 0 && format !== "compact" && format !== "der")
      throw new Error("format must be compact or der");
    const isHex2 = typeof sg === "string" || isBytes2(sg);
    const isObj = !isHex2 && !format && typeof sg === "object" && sg !== null && typeof sg.r === "bigint" && typeof sg.s === "bigint";
    if (!isHex2 && !isObj)
      throw new Error("invalid signature, expected Uint8Array, hex string or Signature instance");
    let _sig = void 0;
    let P;
    try {
      if (isObj)
        _sig = new Signature(sg.r, sg.s);
      if (isHex2) {
        try {
          if (format !== "compact")
            _sig = Signature.fromDER(sg);
        } catch (derError) {
          if (!(derError instanceof DER.Err))
            throw derError;
        }
        if (!_sig && format !== "der")
          _sig = Signature.fromCompact(sg);
      }
      P = Point2.fromHex(publicKey);
    } catch (error) {
      return false;
    }
    if (!_sig)
      return false;
    if (lowS && _sig.hasHighS())
      return false;
    if (prehash)
      msgHash = CURVE.hash(msgHash);
    const { r, s } = _sig;
    const h = bits2int_modN(msgHash);
    const is = invN(s);
    const u1 = modN2(h * is);
    const u2 = modN2(r * is);
    const R = Point2.BASE.multiplyAndAddUnsafe(P, u1, u2)?.toAffine();
    if (!R)
      return false;
    const v = modN2(R.x);
    return v === r;
  }
  __name(verify, "verify");
  return {
    CURVE,
    getPublicKey,
    getSharedSecret,
    sign,
    verify,
    ProjectivePoint: Point2,
    Signature,
    utils
  };
}
function SWUFpSqrtRatio(Fp, Z) {
  const q = Fp.ORDER;
  let l = _0n5;
  for (let o = q - _1n5; o % _2n3 === _0n5; o /= _2n3)
    l += _1n5;
  const c1 = l;
  const _2n_pow_c1_1 = _2n3 << c1 - _1n5 - _1n5;
  const _2n_pow_c1 = _2n_pow_c1_1 * _2n3;
  const c2 = (q - _1n5) / _2n_pow_c1;
  const c3 = (c2 - _1n5) / _2n3;
  const c4 = _2n_pow_c1 - _1n5;
  const c5 = _2n_pow_c1_1;
  const c6 = Fp.pow(Z, c2);
  const c7 = Fp.pow(Z, (c2 + _1n5) / _2n3);
  let sqrtRatio = /* @__PURE__ */ __name((u, v) => {
    let tv1 = c6;
    let tv2 = Fp.pow(v, c4);
    let tv3 = Fp.sqr(tv2);
    tv3 = Fp.mul(tv3, v);
    let tv5 = Fp.mul(u, tv3);
    tv5 = Fp.pow(tv5, c3);
    tv5 = Fp.mul(tv5, tv2);
    tv2 = Fp.mul(tv5, v);
    tv3 = Fp.mul(tv5, u);
    let tv4 = Fp.mul(tv3, tv2);
    tv5 = Fp.pow(tv4, c5);
    let isQR = Fp.eql(tv5, Fp.ONE);
    tv2 = Fp.mul(tv3, c7);
    tv5 = Fp.mul(tv4, tv1);
    tv3 = Fp.cmov(tv2, tv3, isQR);
    tv4 = Fp.cmov(tv5, tv4, isQR);
    for (let i = c1; i > _1n5; i--) {
      let tv52 = i - _2n3;
      tv52 = _2n3 << tv52 - _1n5;
      let tvv5 = Fp.pow(tv4, tv52);
      const e1 = Fp.eql(tvv5, Fp.ONE);
      tv2 = Fp.mul(tv3, tv1);
      tv1 = Fp.mul(tv1, tv1);
      tvv5 = Fp.mul(tv4, tv1);
      tv3 = Fp.cmov(tv2, tv3, e1);
      tv4 = Fp.cmov(tvv5, tv4, e1);
    }
    return { isValid: isQR, value: tv3 };
  }, "sqrtRatio");
  if (Fp.ORDER % _4n2 === _3n2) {
    const c12 = (Fp.ORDER - _3n2) / _4n2;
    const c22 = Fp.sqrt(Fp.neg(Z));
    sqrtRatio = /* @__PURE__ */ __name((u, v) => {
      let tv1 = Fp.sqr(v);
      const tv2 = Fp.mul(u, v);
      tv1 = Fp.mul(tv1, tv2);
      let y1 = Fp.pow(tv1, c12);
      y1 = Fp.mul(y1, tv2);
      const y2 = Fp.mul(y1, c22);
      const tv3 = Fp.mul(Fp.sqr(y1), v);
      const isQR = Fp.eql(tv3, u);
      let y = Fp.cmov(y2, y1, isQR);
      return { isValid: isQR, value: y };
    }, "sqrtRatio");
  }
  return sqrtRatio;
}
function mapToCurveSimpleSWU(Fp, opts) {
  validateField(Fp);
  if (!Fp.isValid(opts.A) || !Fp.isValid(opts.B) || !Fp.isValid(opts.Z))
    throw new Error("mapToCurveSimpleSWU: invalid opts");
  const sqrtRatio = SWUFpSqrtRatio(Fp, opts.Z);
  if (!Fp.isOdd)
    throw new Error("Fp.isOdd is not implemented!");
  return (u) => {
    let tv1, tv2, tv3, tv4, tv5, tv6, x, y;
    tv1 = Fp.sqr(u);
    tv1 = Fp.mul(tv1, opts.Z);
    tv2 = Fp.sqr(tv1);
    tv2 = Fp.add(tv2, tv1);
    tv3 = Fp.add(tv2, Fp.ONE);
    tv3 = Fp.mul(tv3, opts.B);
    tv4 = Fp.cmov(opts.Z, Fp.neg(tv2), !Fp.eql(tv2, Fp.ZERO));
    tv4 = Fp.mul(tv4, opts.A);
    tv2 = Fp.sqr(tv3);
    tv6 = Fp.sqr(tv4);
    tv5 = Fp.mul(tv6, opts.A);
    tv2 = Fp.add(tv2, tv5);
    tv2 = Fp.mul(tv2, tv3);
    tv6 = Fp.mul(tv6, tv4);
    tv5 = Fp.mul(tv6, opts.B);
    tv2 = Fp.add(tv2, tv5);
    x = Fp.mul(tv1, tv3);
    const { isValid, value } = sqrtRatio(tv2, tv6);
    y = Fp.mul(tv1, u);
    y = Fp.mul(y, value);
    x = Fp.cmov(x, tv3, isValid);
    y = Fp.cmov(y, value, isValid);
    const e1 = Fp.isOdd(u) === Fp.isOdd(y);
    y = Fp.cmov(Fp.neg(y), y, e1);
    const tv4_inv = FpInvertBatch(Fp, [tv4], true)[0];
    x = Fp.mul(x, tv4_inv);
    return { x, y };
  };
}
var DERErr, DER, _0n5, _1n5, _2n3, _3n2, _4n2;
var init_weierstrass = __esm({
  "node_modules/@noble/curves/esm/abstract/weierstrass.js"() {
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    init_curve();
    init_modular();
    init_utils2();
    __name(validateSigVerOpts, "validateSigVerOpts");
    __name(validatePointOpts, "validatePointOpts");
    DERErr = class extends Error {
      constructor(m = "") {
        super(m);
      }
    };
    __name(DERErr, "DERErr");
    DER = {
      // asn.1 DER encoding utils
      Err: DERErr,
      // Basic building block is TLV (Tag-Length-Value)
      _tlv: {
        encode: (tag, data) => {
          const { Err: E } = DER;
          if (tag < 0 || tag > 256)
            throw new E("tlv.encode: wrong tag");
          if (data.length & 1)
            throw new E("tlv.encode: unpadded data");
          const dataLen = data.length / 2;
          const len = numberToHexUnpadded(dataLen);
          if (len.length / 2 & 128)
            throw new E("tlv.encode: long form length too big");
          const lenLen = dataLen > 127 ? numberToHexUnpadded(len.length / 2 | 128) : "";
          const t = numberToHexUnpadded(tag);
          return t + lenLen + len + data;
        },
        // v - value, l - left bytes (unparsed)
        decode(tag, data) {
          const { Err: E } = DER;
          let pos = 0;
          if (tag < 0 || tag > 256)
            throw new E("tlv.encode: wrong tag");
          if (data.length < 2 || data[pos++] !== tag)
            throw new E("tlv.decode: wrong tlv");
          const first = data[pos++];
          const isLong = !!(first & 128);
          let length = 0;
          if (!isLong)
            length = first;
          else {
            const lenLen = first & 127;
            if (!lenLen)
              throw new E("tlv.decode(long): indefinite length not supported");
            if (lenLen > 4)
              throw new E("tlv.decode(long): byte length is too big");
            const lengthBytes = data.subarray(pos, pos + lenLen);
            if (lengthBytes.length !== lenLen)
              throw new E("tlv.decode: length bytes not complete");
            if (lengthBytes[0] === 0)
              throw new E("tlv.decode(long): zero leftmost byte");
            for (const b of lengthBytes)
              length = length << 8 | b;
            pos += lenLen;
            if (length < 128)
              throw new E("tlv.decode(long): not minimal encoding");
          }
          const v = data.subarray(pos, pos + length);
          if (v.length !== length)
            throw new E("tlv.decode: wrong value length");
          return { v, l: data.subarray(pos + length) };
        }
      },
      // https://crypto.stackexchange.com/a/57734 Leftmost bit of first byte is 'negative' flag,
      // since we always use positive integers here. It must always be empty:
      // - add zero byte if exists
      // - if next byte doesn't have a flag, leading zero is not allowed (minimal encoding)
      _int: {
        encode(num2) {
          const { Err: E } = DER;
          if (num2 < _0n5)
            throw new E("integer: negative integers are not allowed");
          let hex = numberToHexUnpadded(num2);
          if (Number.parseInt(hex[0], 16) & 8)
            hex = "00" + hex;
          if (hex.length & 1)
            throw new E("unexpected DER parsing assertion: unpadded hex");
          return hex;
        },
        decode(data) {
          const { Err: E } = DER;
          if (data[0] & 128)
            throw new E("invalid signature integer: negative");
          if (data[0] === 0 && !(data[1] & 128))
            throw new E("invalid signature integer: unnecessary leading zero");
          return bytesToNumberBE(data);
        }
      },
      toSig(hex) {
        const { Err: E, _int: int, _tlv: tlv } = DER;
        const data = ensureBytes("signature", hex);
        const { v: seqBytes, l: seqLeftBytes } = tlv.decode(48, data);
        if (seqLeftBytes.length)
          throw new E("invalid signature: left bytes after parsing");
        const { v: rBytes, l: rLeftBytes } = tlv.decode(2, seqBytes);
        const { v: sBytes, l: sLeftBytes } = tlv.decode(2, rLeftBytes);
        if (sLeftBytes.length)
          throw new E("invalid signature: left bytes after parsing");
        return { r: int.decode(rBytes), s: int.decode(sBytes) };
      },
      hexFromSig(sig) {
        const { _tlv: tlv, _int: int } = DER;
        const rs = tlv.encode(2, int.encode(sig.r));
        const ss = tlv.encode(2, int.encode(sig.s));
        const seq = rs + ss;
        return tlv.encode(48, seq);
      }
    };
    __name(numToSizedHex, "numToSizedHex");
    _0n5 = BigInt(0);
    _1n5 = BigInt(1);
    _2n3 = BigInt(2);
    _3n2 = BigInt(3);
    _4n2 = BigInt(4);
    __name(weierstrassPoints, "weierstrassPoints");
    __name(validateOpts, "validateOpts");
    __name(weierstrass, "weierstrass");
    __name(SWUFpSqrtRatio, "SWUFpSqrtRatio");
    __name(mapToCurveSimpleSWU, "mapToCurveSimpleSWU");
  }
});

// node_modules/@noble/curves/esm/_shortw_utils.js
function getHash(hash) {
  return {
    hash,
    hmac: (key, ...msgs) => hmac(hash, key, concatBytes(...msgs)),
    randomBytes
  };
}
function createCurve(curveDef, defHash) {
  const create = /* @__PURE__ */ __name((hash) => weierstrass({ ...curveDef, ...getHash(hash) }), "create");
  return { ...create(defHash), create };
}
var init_shortw_utils = __esm({
  "node_modules/@noble/curves/esm/_shortw_utils.js"() {
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    init_hmac();
    init_utils();
    init_weierstrass();
    __name(getHash, "getHash");
    __name(createCurve, "createCurve");
  }
});

// node_modules/@noble/curves/esm/abstract/hash-to-curve.js
function i2osp(value, length) {
  anum(value);
  anum(length);
  if (value < 0 || value >= 1 << 8 * length)
    throw new Error("invalid I2OSP input: " + value);
  const res = Array.from({ length }).fill(0);
  for (let i = length - 1; i >= 0; i--) {
    res[i] = value & 255;
    value >>>= 8;
  }
  return new Uint8Array(res);
}
function strxor(a, b) {
  const arr = new Uint8Array(a.length);
  for (let i = 0; i < a.length; i++) {
    arr[i] = a[i] ^ b[i];
  }
  return arr;
}
function anum(item) {
  if (!Number.isSafeInteger(item))
    throw new Error("number expected");
}
function expand_message_xmd(msg, DST, lenInBytes, H) {
  abytes2(msg);
  abytes2(DST);
  anum(lenInBytes);
  if (DST.length > 255)
    DST = H(concatBytes3(utf8ToBytes2("H2C-OVERSIZE-DST-"), DST));
  const { outputLen: b_in_bytes, blockLen: r_in_bytes } = H;
  const ell = Math.ceil(lenInBytes / b_in_bytes);
  if (lenInBytes > 65535 || ell > 255)
    throw new Error("expand_message_xmd: invalid lenInBytes");
  const DST_prime = concatBytes3(DST, i2osp(DST.length, 1));
  const Z_pad = i2osp(0, r_in_bytes);
  const l_i_b_str = i2osp(lenInBytes, 2);
  const b = new Array(ell);
  const b_0 = H(concatBytes3(Z_pad, msg, l_i_b_str, i2osp(0, 1), DST_prime));
  b[0] = H(concatBytes3(b_0, i2osp(1, 1), DST_prime));
  for (let i = 1; i <= ell; i++) {
    const args = [strxor(b_0, b[i - 1]), i2osp(i + 1, 1), DST_prime];
    b[i] = H(concatBytes3(...args));
  }
  const pseudo_random_bytes = concatBytes3(...b);
  return pseudo_random_bytes.slice(0, lenInBytes);
}
function expand_message_xof(msg, DST, lenInBytes, k, H) {
  abytes2(msg);
  abytes2(DST);
  anum(lenInBytes);
  if (DST.length > 255) {
    const dkLen = Math.ceil(2 * k / 8);
    DST = H.create({ dkLen }).update(utf8ToBytes2("H2C-OVERSIZE-DST-")).update(DST).digest();
  }
  if (lenInBytes > 65535 || DST.length > 255)
    throw new Error("expand_message_xof: invalid lenInBytes");
  return H.create({ dkLen: lenInBytes }).update(msg).update(i2osp(lenInBytes, 2)).update(DST).update(i2osp(DST.length, 1)).digest();
}
function hash_to_field(msg, count, options) {
  validateObject(options, {
    DST: "stringOrUint8Array",
    p: "bigint",
    m: "isSafeInteger",
    k: "isSafeInteger",
    hash: "hash"
  });
  const { p, k, m, hash, expand, DST: _DST } = options;
  abytes2(msg);
  anum(count);
  const DST = typeof _DST === "string" ? utf8ToBytes2(_DST) : _DST;
  const log2p = p.toString(2).length;
  const L = Math.ceil((log2p + k) / 8);
  const len_in_bytes = count * m * L;
  let prb;
  if (expand === "xmd") {
    prb = expand_message_xmd(msg, DST, len_in_bytes, hash);
  } else if (expand === "xof") {
    prb = expand_message_xof(msg, DST, len_in_bytes, k, hash);
  } else if (expand === "_internal_pass") {
    prb = msg;
  } else {
    throw new Error('expand must be "xmd" or "xof"');
  }
  const u = new Array(count);
  for (let i = 0; i < count; i++) {
    const e = new Array(m);
    for (let j = 0; j < m; j++) {
      const elm_offset = L * (j + i * m);
      const tv = prb.subarray(elm_offset, elm_offset + L);
      e[j] = mod(os2ip(tv), p);
    }
    u[i] = e;
  }
  return u;
}
function isogenyMap(field, map) {
  const coeff = map.map((i) => Array.from(i).reverse());
  return (x, y) => {
    const [xn, xd, yn, yd] = coeff.map((val) => val.reduce((acc, i) => field.add(field.mul(acc, x), i)));
    const [xd_inv, yd_inv] = FpInvertBatch(field, [xd, yd], true);
    x = field.mul(xn, xd_inv);
    y = field.mul(y, field.mul(yn, yd_inv));
    return { x, y };
  };
}
function createHasher2(Point2, mapToCurve, defaults) {
  if (typeof mapToCurve !== "function")
    throw new Error("mapToCurve() must be defined");
  function map(num2) {
    return Point2.fromAffine(mapToCurve(num2));
  }
  __name(map, "map");
  function clear(initial) {
    const P = initial.clearCofactor();
    if (P.equals(Point2.ZERO))
      return Point2.ZERO;
    P.assertValidity();
    return P;
  }
  __name(clear, "clear");
  return {
    defaults,
    // Encodes byte string to elliptic curve.
    // hash_to_curve from https://www.rfc-editor.org/rfc/rfc9380#section-3
    hashToCurve(msg, options) {
      const u = hash_to_field(msg, 2, { ...defaults, DST: defaults.DST, ...options });
      const u0 = map(u[0]);
      const u1 = map(u[1]);
      return clear(u0.add(u1));
    },
    // Encodes byte string to elliptic curve.
    // encode_to_curve from https://www.rfc-editor.org/rfc/rfc9380#section-3
    encodeToCurve(msg, options) {
      const u = hash_to_field(msg, 1, { ...defaults, DST: defaults.encodeDST, ...options });
      return clear(map(u[0]));
    },
    // Same as encodeToCurve, but without hash
    mapToCurve(scalars) {
      if (!Array.isArray(scalars))
        throw new Error("expected array of bigints");
      for (const i of scalars)
        if (typeof i !== "bigint")
          throw new Error("expected array of bigints");
      return clear(map(scalars));
    }
  };
}
var os2ip;
var init_hash_to_curve = __esm({
  "node_modules/@noble/curves/esm/abstract/hash-to-curve.js"() {
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    init_modular();
    init_utils2();
    os2ip = bytesToNumberBE;
    __name(i2osp, "i2osp");
    __name(strxor, "strxor");
    __name(anum, "anum");
    __name(expand_message_xmd, "expand_message_xmd");
    __name(expand_message_xof, "expand_message_xof");
    __name(hash_to_field, "hash_to_field");
    __name(isogenyMap, "isogenyMap");
    __name(createHasher2, "createHasher");
  }
});

// node_modules/@noble/curves/esm/secp256k1.js
var secp256k1_exports = {};
__export(secp256k1_exports, {
  encodeToCurve: () => encodeToCurve,
  hashToCurve: () => hashToCurve,
  schnorr: () => schnorr,
  secp256k1: () => secp256k1,
  secp256k1_hasher: () => secp256k1_hasher
});
function sqrtMod(y) {
  const P = secp256k1P;
  const _3n3 = BigInt(3), _6n = BigInt(6), _11n = BigInt(11), _22n = BigInt(22);
  const _23n = BigInt(23), _44n = BigInt(44), _88n = BigInt(88);
  const b2 = y * y * y % P;
  const b3 = b2 * b2 * y % P;
  const b6 = pow2(b3, _3n3, P) * b3 % P;
  const b9 = pow2(b6, _3n3, P) * b3 % P;
  const b11 = pow2(b9, _2n4, P) * b2 % P;
  const b22 = pow2(b11, _11n, P) * b11 % P;
  const b44 = pow2(b22, _22n, P) * b22 % P;
  const b88 = pow2(b44, _44n, P) * b44 % P;
  const b176 = pow2(b88, _88n, P) * b88 % P;
  const b220 = pow2(b176, _44n, P) * b44 % P;
  const b223 = pow2(b220, _3n3, P) * b3 % P;
  const t1 = pow2(b223, _23n, P) * b22 % P;
  const t2 = pow2(t1, _6n, P) * b2 % P;
  const root = pow2(t2, _2n4, P);
  if (!Fpk1.eql(Fpk1.sqr(root), y))
    throw new Error("Cannot find square root");
  return root;
}
function taggedHash(tag, ...messages) {
  let tagP = TAGGED_HASH_PREFIXES[tag];
  if (tagP === void 0) {
    const tagH = sha2562(Uint8Array.from(tag, (c) => c.charCodeAt(0)));
    tagP = concatBytes3(tagH, tagH);
    TAGGED_HASH_PREFIXES[tag] = tagP;
  }
  return sha2562(concatBytes3(tagP, ...messages));
}
function schnorrGetExtPubKey(priv) {
  let d_ = secp256k1.utils.normPrivateKeyToScalar(priv);
  let p = Point.fromPrivateKey(d_);
  const scalar = p.hasEvenY() ? d_ : modN(-d_);
  return { scalar, bytes: pointToBytes(p) };
}
function lift_x(x) {
  aInRange("x", x, _1n6, secp256k1P);
  const xx = modP(x * x);
  const c = modP(xx * x + BigInt(7));
  let y = sqrtMod(c);
  if (y % _2n4 !== _0n6)
    y = modP(-y);
  const p = new Point(x, y, _1n6);
  p.assertValidity();
  return p;
}
function challenge(...args) {
  return modN(num(taggedHash("BIP0340/challenge", ...args)));
}
function schnorrGetPublicKey(privateKey) {
  return schnorrGetExtPubKey(privateKey).bytes;
}
function schnorrSign(message, privateKey, auxRand = randomBytes(32)) {
  const m = ensureBytes("message", message);
  const { bytes: px, scalar: d } = schnorrGetExtPubKey(privateKey);
  const a = ensureBytes("auxRand", auxRand, 32);
  const t = numTo32b(d ^ num(taggedHash("BIP0340/aux", a)));
  const rand = taggedHash("BIP0340/nonce", t, px, m);
  const k_ = modN(num(rand));
  if (k_ === _0n6)
    throw new Error("sign failed: k is zero");
  const { bytes: rx, scalar: k } = schnorrGetExtPubKey(k_);
  const e = challenge(rx, px, m);
  const sig = new Uint8Array(64);
  sig.set(rx, 0);
  sig.set(numTo32b(modN(k + e * d)), 32);
  if (!schnorrVerify(sig, m, px))
    throw new Error("sign: Invalid signature produced");
  return sig;
}
function schnorrVerify(signature, message, publicKey) {
  const sig = ensureBytes("signature", signature, 64);
  const m = ensureBytes("message", message);
  const pub = ensureBytes("publicKey", publicKey, 32);
  try {
    const P = lift_x(num(pub));
    const r = num(sig.subarray(0, 32));
    if (!inRange(r, _1n6, secp256k1P))
      return false;
    const s = num(sig.subarray(32, 64));
    if (!inRange(s, _1n6, secp256k1N))
      return false;
    const e = challenge(numTo32b(r), pointToBytes(P), m);
    const R = GmulAdd(P, s, modN(-e));
    if (!R || !R.hasEvenY() || R.toAffine().x !== r)
      return false;
    return true;
  } catch (error) {
    return false;
  }
}
var secp256k1P, secp256k1N, _0n6, _1n6, _2n4, divNearest, Fpk1, secp256k1, TAGGED_HASH_PREFIXES, pointToBytes, numTo32b, modP, modN, Point, GmulAdd, num, schnorr, isoMap, mapSWU, secp256k1_hasher, hashToCurve, encodeToCurve;
var init_secp256k1 = __esm({
  "node_modules/@noble/curves/esm/secp256k1.js"() {
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    init_sha2();
    init_utils();
    init_shortw_utils();
    init_hash_to_curve();
    init_modular();
    init_utils2();
    init_weierstrass();
    secp256k1P = BigInt("0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f");
    secp256k1N = BigInt("0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141");
    _0n6 = BigInt(0);
    _1n6 = BigInt(1);
    _2n4 = BigInt(2);
    divNearest = /* @__PURE__ */ __name((a, b) => (a + b / _2n4) / b, "divNearest");
    __name(sqrtMod, "sqrtMod");
    Fpk1 = Field(secp256k1P, void 0, void 0, { sqrt: sqrtMod });
    secp256k1 = createCurve({
      a: _0n6,
      b: BigInt(7),
      Fp: Fpk1,
      n: secp256k1N,
      Gx: BigInt("55066263022277343669578718895168534326250603453777594175500187360389116729240"),
      Gy: BigInt("32670510020758816978083085130507043184471273380659243275938904335757337482424"),
      h: BigInt(1),
      lowS: true,
      // Allow only low-S signatures by default in sign() and verify()
      endo: {
        // Endomorphism, see above
        beta: BigInt("0x7ae96a2b657c07106e64479eac3434e99cf0497512f58995c1396c28719501ee"),
        splitScalar: (k) => {
          const n = secp256k1N;
          const a1 = BigInt("0x3086d221a7d46bcde86c90e49284eb15");
          const b1 = -_1n6 * BigInt("0xe4437ed6010e88286f547fa90abfe4c3");
          const a2 = BigInt("0x114ca50f7a8e2f3f657c1108d9d44cfd8");
          const b2 = a1;
          const POW_2_128 = BigInt("0x100000000000000000000000000000000");
          const c1 = divNearest(b2 * k, n);
          const c2 = divNearest(-b1 * k, n);
          let k1 = mod(k - c1 * a1 - c2 * a2, n);
          let k2 = mod(-c1 * b1 - c2 * b2, n);
          const k1neg = k1 > POW_2_128;
          const k2neg = k2 > POW_2_128;
          if (k1neg)
            k1 = n - k1;
          if (k2neg)
            k2 = n - k2;
          if (k1 > POW_2_128 || k2 > POW_2_128) {
            throw new Error("splitScalar: Endomorphism failed, k=" + k);
          }
          return { k1neg, k1, k2neg, k2 };
        }
      }
    }, sha2562);
    TAGGED_HASH_PREFIXES = {};
    __name(taggedHash, "taggedHash");
    pointToBytes = /* @__PURE__ */ __name((point) => point.toRawBytes(true).slice(1), "pointToBytes");
    numTo32b = /* @__PURE__ */ __name((n) => numberToBytesBE(n, 32), "numTo32b");
    modP = /* @__PURE__ */ __name((x) => mod(x, secp256k1P), "modP");
    modN = /* @__PURE__ */ __name((x) => mod(x, secp256k1N), "modN");
    Point = /* @__PURE__ */ (() => secp256k1.ProjectivePoint)();
    GmulAdd = /* @__PURE__ */ __name((Q, a, b) => Point.BASE.multiplyAndAddUnsafe(Q, a, b), "GmulAdd");
    __name(schnorrGetExtPubKey, "schnorrGetExtPubKey");
    __name(lift_x, "lift_x");
    num = bytesToNumberBE;
    __name(challenge, "challenge");
    __name(schnorrGetPublicKey, "schnorrGetPublicKey");
    __name(schnorrSign, "schnorrSign");
    __name(schnorrVerify, "schnorrVerify");
    schnorr = /* @__PURE__ */ (() => ({
      getPublicKey: schnorrGetPublicKey,
      sign: schnorrSign,
      verify: schnorrVerify,
      utils: {
        randomPrivateKey: secp256k1.utils.randomPrivateKey,
        lift_x,
        pointToBytes,
        numberToBytesBE,
        bytesToNumberBE,
        taggedHash,
        mod
      }
    }))();
    isoMap = /* @__PURE__ */ (() => isogenyMap(Fpk1, [
      // xNum
      [
        "0x8e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38daaaaa8c7",
        "0x7d3d4c80bc321d5b9f315cea7fd44c5d595d2fc0bf63b92dfff1044f17c6581",
        "0x534c328d23f234e6e2a413deca25caece4506144037c40314ecbd0b53d9dd262",
        "0x8e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38daaaaa88c"
      ],
      // xDen
      [
        "0xd35771193d94918a9ca34ccbb7b640dd86cd409542f8487d9fe6b745781eb49b",
        "0xedadc6f64383dc1df7c4b2d51b54225406d36b641f5e41bbc52a56612a8c6d14",
        "0x0000000000000000000000000000000000000000000000000000000000000001"
        // LAST 1
      ],
      // yNum
      [
        "0x4bda12f684bda12f684bda12f684bda12f684bda12f684bda12f684b8e38e23c",
        "0xc75e0c32d5cb7c0fa9d0a54b12a0a6d5647ab046d686da6fdffc90fc201d71a3",
        "0x29a6194691f91a73715209ef6512e576722830a201be2018a765e85a9ecee931",
        "0x2f684bda12f684bda12f684bda12f684bda12f684bda12f684bda12f38e38d84"
      ],
      // yDen
      [
        "0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffff93b",
        "0x7a06534bb8bdb49fd5e9e6632722c2989467c1bfc8e8d978dfb425d2685c2573",
        "0x6484aa716545ca2cf3a70c3fa8fe337e0a3d21162f0d6299a7bf8192bfd2a76f",
        "0x0000000000000000000000000000000000000000000000000000000000000001"
        // LAST 1
      ]
    ].map((i) => i.map((j) => BigInt(j)))))();
    mapSWU = /* @__PURE__ */ (() => mapToCurveSimpleSWU(Fpk1, {
      A: BigInt("0x3f8731abdd661adca08a5558f0f5d272e953d363cb6f0e5d405447c01a444533"),
      B: BigInt("1771"),
      Z: Fpk1.create(BigInt("-11"))
    }))();
    secp256k1_hasher = /* @__PURE__ */ (() => createHasher2(secp256k1.ProjectivePoint, (scalars) => {
      const { x, y } = mapSWU(Fpk1.create(scalars[0]));
      return isoMap(x, y);
    }, {
      DST: "secp256k1_XMD:SHA-256_SSWU_RO_",
      encodeDST: "secp256k1_XMD:SHA-256_SSWU_NU_",
      p: Fpk1.ORDER,
      m: 1,
      k: 128,
      expand: "xmd",
      hash: sha2562
    }))();
    hashToCurve = /* @__PURE__ */ (() => secp256k1_hasher.hashToCurve)();
    encodeToCurve = /* @__PURE__ */ (() => secp256k1_hasher.encodeToCurve)();
  }
});

// .wrangler/tmp/bundle-o2ZIT0/middleware-loader.entry.ts
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();

// .wrangler/tmp/bundle-o2ZIT0/middleware-insertion-facade.js
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();

// src/index.ts
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();

// node_modules/hono/dist/index.js
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();

// node_modules/hono/dist/hono.js
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();

// node_modules/hono/dist/hono-base.js
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();

// node_modules/hono/dist/compose.js
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
var compose = /* @__PURE__ */ __name((middleware, onError, onNotFound) => {
  return (context, next) => {
    let index = -1;
    return dispatch(0);
    async function dispatch(i) {
      if (i <= index) {
        throw new Error("next() called multiple times");
      }
      index = i;
      let res;
      let isError = false;
      let handler;
      if (middleware[i]) {
        handler = middleware[i][0][0];
        context.req.routeIndex = i;
      } else {
        handler = i === middleware.length && next || void 0;
      }
      if (handler) {
        try {
          res = await handler(context, () => dispatch(i + 1));
        } catch (err) {
          if (err instanceof Error && onError) {
            context.error = err;
            res = await onError(err, context);
            isError = true;
          } else {
            throw err;
          }
        }
      } else {
        if (context.finalized === false && onNotFound) {
          res = await onNotFound(context);
        }
      }
      if (res && (context.finalized === false || isError)) {
        context.res = res;
      }
      return context;
    }
    __name(dispatch, "dispatch");
  };
}, "compose");

// node_modules/hono/dist/context.js
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();

// node_modules/hono/dist/request.js
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();

// node_modules/hono/dist/http-exception.js
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();

// node_modules/hono/dist/request/constants.js
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
var GET_MATCH_RESULT = /* @__PURE__ */ Symbol();

// node_modules/hono/dist/utils/body.js
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
var parseBody = /* @__PURE__ */ __name(async (request, options = /* @__PURE__ */ Object.create(null)) => {
  const { all = false, dot = false } = options;
  const headers = request instanceof HonoRequest ? request.raw.headers : request.headers;
  const contentType = headers.get("Content-Type");
  if (contentType?.startsWith("multipart/form-data") || contentType?.startsWith("application/x-www-form-urlencoded")) {
    return parseFormData(request, { all, dot });
  }
  return {};
}, "parseBody");
async function parseFormData(request, options) {
  const formData = await request.formData();
  if (formData) {
    return convertFormDataToBodyData(formData, options);
  }
  return {};
}
__name(parseFormData, "parseFormData");
function convertFormDataToBodyData(formData, options) {
  const form = /* @__PURE__ */ Object.create(null);
  formData.forEach((value, key) => {
    const shouldParseAllValues = options.all || key.endsWith("[]");
    if (!shouldParseAllValues) {
      form[key] = value;
    } else {
      handleParsingAllValues(form, key, value);
    }
  });
  if (options.dot) {
    Object.entries(form).forEach(([key, value]) => {
      const shouldParseDotValues = key.includes(".");
      if (shouldParseDotValues) {
        handleParsingNestedValues(form, key, value);
        delete form[key];
      }
    });
  }
  return form;
}
__name(convertFormDataToBodyData, "convertFormDataToBodyData");
var handleParsingAllValues = /* @__PURE__ */ __name((form, key, value) => {
  if (form[key] !== void 0) {
    if (Array.isArray(form[key])) {
      ;
      form[key].push(value);
    } else {
      form[key] = [form[key], value];
    }
  } else {
    if (!key.endsWith("[]")) {
      form[key] = value;
    } else {
      form[key] = [value];
    }
  }
}, "handleParsingAllValues");
var handleParsingNestedValues = /* @__PURE__ */ __name((form, key, value) => {
  let nestedForm = form;
  const keys = key.split(".");
  keys.forEach((key2, index) => {
    if (index === keys.length - 1) {
      nestedForm[key2] = value;
    } else {
      if (!nestedForm[key2] || typeof nestedForm[key2] !== "object" || Array.isArray(nestedForm[key2]) || nestedForm[key2] instanceof File) {
        nestedForm[key2] = /* @__PURE__ */ Object.create(null);
      }
      nestedForm = nestedForm[key2];
    }
  });
}, "handleParsingNestedValues");

// node_modules/hono/dist/utils/url.js
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
var splitPath = /* @__PURE__ */ __name((path) => {
  const paths = path.split("/");
  if (paths[0] === "") {
    paths.shift();
  }
  return paths;
}, "splitPath");
var splitRoutingPath = /* @__PURE__ */ __name((routePath) => {
  const { groups, path } = extractGroupsFromPath(routePath);
  const paths = splitPath(path);
  return replaceGroupMarks(paths, groups);
}, "splitRoutingPath");
var extractGroupsFromPath = /* @__PURE__ */ __name((path) => {
  const groups = [];
  path = path.replace(/\{[^}]+\}/g, (match2, index) => {
    const mark = `@${index}`;
    groups.push([mark, match2]);
    return mark;
  });
  return { groups, path };
}, "extractGroupsFromPath");
var replaceGroupMarks = /* @__PURE__ */ __name((paths, groups) => {
  for (let i = groups.length - 1; i >= 0; i--) {
    const [mark] = groups[i];
    for (let j = paths.length - 1; j >= 0; j--) {
      if (paths[j].includes(mark)) {
        paths[j] = paths[j].replace(mark, groups[i][1]);
        break;
      }
    }
  }
  return paths;
}, "replaceGroupMarks");
var patternCache = {};
var getPattern = /* @__PURE__ */ __name((label, next) => {
  if (label === "*") {
    return "*";
  }
  const match2 = label.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
  if (match2) {
    const cacheKey = `${label}#${next}`;
    if (!patternCache[cacheKey]) {
      if (match2[2]) {
        patternCache[cacheKey] = next && next[0] !== ":" && next[0] !== "*" ? [cacheKey, match2[1], new RegExp(`^${match2[2]}(?=/${next})`)] : [label, match2[1], new RegExp(`^${match2[2]}$`)];
      } else {
        patternCache[cacheKey] = [label, match2[1], true];
      }
    }
    return patternCache[cacheKey];
  }
  return null;
}, "getPattern");
var tryDecode = /* @__PURE__ */ __name((str, decoder) => {
  try {
    return decoder(str);
  } catch {
    return str.replace(/(?:%[0-9A-Fa-f]{2})+/g, (match2) => {
      try {
        return decoder(match2);
      } catch {
        return match2;
      }
    });
  }
}, "tryDecode");
var tryDecodeURI = /* @__PURE__ */ __name((str) => tryDecode(str, decodeURI), "tryDecodeURI");
var getPath = /* @__PURE__ */ __name((request) => {
  const url = request.url;
  const start = url.indexOf("/", url.indexOf(":") + 4);
  let i = start;
  for (; i < url.length; i++) {
    const charCode = url.charCodeAt(i);
    if (charCode === 37) {
      const queryIndex = url.indexOf("?", i);
      const path = url.slice(start, queryIndex === -1 ? void 0 : queryIndex);
      return tryDecodeURI(path.includes("%25") ? path.replace(/%25/g, "%2525") : path);
    } else if (charCode === 63) {
      break;
    }
  }
  return url.slice(start, i);
}, "getPath");
var getPathNoStrict = /* @__PURE__ */ __name((request) => {
  const result = getPath(request);
  return result.length > 1 && result.at(-1) === "/" ? result.slice(0, -1) : result;
}, "getPathNoStrict");
var mergePath = /* @__PURE__ */ __name((base, sub, ...rest) => {
  if (rest.length) {
    sub = mergePath(sub, ...rest);
  }
  return `${base?.[0] === "/" ? "" : "/"}${base}${sub === "/" ? "" : `${base?.at(-1) === "/" ? "" : "/"}${sub?.[0] === "/" ? sub.slice(1) : sub}`}`;
}, "mergePath");
var checkOptionalParameter = /* @__PURE__ */ __name((path) => {
  if (path.charCodeAt(path.length - 1) !== 63 || !path.includes(":")) {
    return null;
  }
  const segments = path.split("/");
  const results = [];
  let basePath = "";
  segments.forEach((segment) => {
    if (segment !== "" && !/\:/.test(segment)) {
      basePath += "/" + segment;
    } else if (/\:/.test(segment)) {
      if (/\?/.test(segment)) {
        if (results.length === 0 && basePath === "") {
          results.push("/");
        } else {
          results.push(basePath);
        }
        const optionalSegment = segment.replace("?", "");
        basePath += "/" + optionalSegment;
        results.push(basePath);
      } else {
        basePath += "/" + segment;
      }
    }
  });
  return results.filter((v, i, a) => a.indexOf(v) === i);
}, "checkOptionalParameter");
var _decodeURI = /* @__PURE__ */ __name((value) => {
  if (!/[%+]/.test(value)) {
    return value;
  }
  if (value.indexOf("+") !== -1) {
    value = value.replace(/\+/g, " ");
  }
  return value.indexOf("%") !== -1 ? tryDecode(value, decodeURIComponent_) : value;
}, "_decodeURI");
var _getQueryParam = /* @__PURE__ */ __name((url, key, multiple) => {
  let encoded;
  if (!multiple && key && !/[%+]/.test(key)) {
    let keyIndex2 = url.indexOf("?", 8);
    if (keyIndex2 === -1) {
      return void 0;
    }
    if (!url.startsWith(key, keyIndex2 + 1)) {
      keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
    }
    while (keyIndex2 !== -1) {
      const trailingKeyCode = url.charCodeAt(keyIndex2 + key.length + 1);
      if (trailingKeyCode === 61) {
        const valueIndex = keyIndex2 + key.length + 2;
        const endIndex = url.indexOf("&", valueIndex);
        return _decodeURI(url.slice(valueIndex, endIndex === -1 ? void 0 : endIndex));
      } else if (trailingKeyCode == 38 || isNaN(trailingKeyCode)) {
        return "";
      }
      keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
    }
    encoded = /[%+]/.test(url);
    if (!encoded) {
      return void 0;
    }
  }
  const results = {};
  encoded ??= /[%+]/.test(url);
  let keyIndex = url.indexOf("?", 8);
  while (keyIndex !== -1) {
    const nextKeyIndex = url.indexOf("&", keyIndex + 1);
    let valueIndex = url.indexOf("=", keyIndex);
    if (valueIndex > nextKeyIndex && nextKeyIndex !== -1) {
      valueIndex = -1;
    }
    let name = url.slice(
      keyIndex + 1,
      valueIndex === -1 ? nextKeyIndex === -1 ? void 0 : nextKeyIndex : valueIndex
    );
    if (encoded) {
      name = _decodeURI(name);
    }
    keyIndex = nextKeyIndex;
    if (name === "") {
      continue;
    }
    let value;
    if (valueIndex === -1) {
      value = "";
    } else {
      value = url.slice(valueIndex + 1, nextKeyIndex === -1 ? void 0 : nextKeyIndex);
      if (encoded) {
        value = _decodeURI(value);
      }
    }
    if (multiple) {
      if (!(results[name] && Array.isArray(results[name]))) {
        results[name] = [];
      }
      ;
      results[name].push(value);
    } else {
      results[name] ??= value;
    }
  }
  return key ? results[key] : results;
}, "_getQueryParam");
var getQueryParam = _getQueryParam;
var getQueryParams = /* @__PURE__ */ __name((url, key) => {
  return _getQueryParam(url, key, true);
}, "getQueryParams");
var decodeURIComponent_ = decodeURIComponent;

// node_modules/hono/dist/request.js
var tryDecodeURIComponent = /* @__PURE__ */ __name((str) => tryDecode(str, decodeURIComponent_), "tryDecodeURIComponent");
var HonoRequest = /* @__PURE__ */ __name(class {
  /**
   * `.raw` can get the raw Request object.
   *
   * @see {@link https://hono.dev/docs/api/request#raw}
   *
   * @example
   * ```ts
   * // For Cloudflare Workers
   * app.post('/', async (c) => {
   *   const metadata = c.req.raw.cf?.hostMetadata?
   *   ...
   * })
   * ```
   */
  raw;
  #validatedData;
  // Short name of validatedData
  #matchResult;
  routeIndex = 0;
  /**
   * `.path` can get the pathname of the request.
   *
   * @see {@link https://hono.dev/docs/api/request#path}
   *
   * @example
   * ```ts
   * app.get('/about/me', (c) => {
   *   const pathname = c.req.path // `/about/me`
   * })
   * ```
   */
  path;
  bodyCache = {};
  constructor(request, path = "/", matchResult = [[]]) {
    this.raw = request;
    this.path = path;
    this.#matchResult = matchResult;
    this.#validatedData = {};
  }
  param(key) {
    return key ? this.#getDecodedParam(key) : this.#getAllDecodedParams();
  }
  #getDecodedParam(key) {
    const paramKey = this.#matchResult[0][this.routeIndex][1][key];
    const param = this.#getParamValue(paramKey);
    return param && /\%/.test(param) ? tryDecodeURIComponent(param) : param;
  }
  #getAllDecodedParams() {
    const decoded = {};
    const keys = Object.keys(this.#matchResult[0][this.routeIndex][1]);
    for (const key of keys) {
      const value = this.#getParamValue(this.#matchResult[0][this.routeIndex][1][key]);
      if (value !== void 0) {
        decoded[key] = /\%/.test(value) ? tryDecodeURIComponent(value) : value;
      }
    }
    return decoded;
  }
  #getParamValue(paramKey) {
    return this.#matchResult[1] ? this.#matchResult[1][paramKey] : paramKey;
  }
  query(key) {
    return getQueryParam(this.url, key);
  }
  queries(key) {
    return getQueryParams(this.url, key);
  }
  header(name) {
    if (name) {
      return this.raw.headers.get(name) ?? void 0;
    }
    const headerData = {};
    this.raw.headers.forEach((value, key) => {
      headerData[key] = value;
    });
    return headerData;
  }
  async parseBody(options) {
    return this.bodyCache.parsedBody ??= await parseBody(this, options);
  }
  #cachedBody = (key) => {
    const { bodyCache, raw: raw2 } = this;
    const cachedBody = bodyCache[key];
    if (cachedBody) {
      return cachedBody;
    }
    const anyCachedKey = Object.keys(bodyCache)[0];
    if (anyCachedKey) {
      return bodyCache[anyCachedKey].then((body) => {
        if (anyCachedKey === "json") {
          body = JSON.stringify(body);
        }
        return new Response(body)[key]();
      });
    }
    return bodyCache[key] = raw2[key]();
  };
  /**
   * `.json()` can parse Request body of type `application/json`
   *
   * @see {@link https://hono.dev/docs/api/request#json}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.json()
   * })
   * ```
   */
  json() {
    return this.#cachedBody("text").then((text) => JSON.parse(text));
  }
  /**
   * `.text()` can parse Request body of type `text/plain`
   *
   * @see {@link https://hono.dev/docs/api/request#text}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.text()
   * })
   * ```
   */
  text() {
    return this.#cachedBody("text");
  }
  /**
   * `.arrayBuffer()` parse Request body as an `ArrayBuffer`
   *
   * @see {@link https://hono.dev/docs/api/request#arraybuffer}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.arrayBuffer()
   * })
   * ```
   */
  arrayBuffer() {
    return this.#cachedBody("arrayBuffer");
  }
  /**
   * Parses the request body as a `Blob`.
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.blob();
   * });
   * ```
   * @see https://hono.dev/docs/api/request#blob
   */
  blob() {
    return this.#cachedBody("blob");
  }
  /**
   * Parses the request body as `FormData`.
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.formData();
   * });
   * ```
   * @see https://hono.dev/docs/api/request#formdata
   */
  formData() {
    return this.#cachedBody("formData");
  }
  /**
   * Adds validated data to the request.
   *
   * @param target - The target of the validation.
   * @param data - The validated data to add.
   */
  addValidatedData(target, data) {
    this.#validatedData[target] = data;
  }
  valid(target) {
    return this.#validatedData[target];
  }
  /**
   * `.url()` can get the request url strings.
   *
   * @see {@link https://hono.dev/docs/api/request#url}
   *
   * @example
   * ```ts
   * app.get('/about/me', (c) => {
   *   const url = c.req.url // `http://localhost:8787/about/me`
   *   ...
   * })
   * ```
   */
  get url() {
    return this.raw.url;
  }
  /**
   * `.method()` can get the method name of the request.
   *
   * @see {@link https://hono.dev/docs/api/request#method}
   *
   * @example
   * ```ts
   * app.get('/about/me', (c) => {
   *   const method = c.req.method // `GET`
   * })
   * ```
   */
  get method() {
    return this.raw.method;
  }
  get [GET_MATCH_RESULT]() {
    return this.#matchResult;
  }
  /**
   * `.matchedRoutes()` can return a matched route in the handler
   *
   * @deprecated
   *
   * Use matchedRoutes helper defined in "hono/route" instead.
   *
   * @see {@link https://hono.dev/docs/api/request#matchedroutes}
   *
   * @example
   * ```ts
   * app.use('*', async function logger(c, next) {
   *   await next()
   *   c.req.matchedRoutes.forEach(({ handler, method, path }, i) => {
   *     const name = handler.name || (handler.length < 2 ? '[handler]' : '[middleware]')
   *     console.log(
   *       method,
   *       ' ',
   *       path,
   *       ' '.repeat(Math.max(10 - path.length, 0)),
   *       name,
   *       i === c.req.routeIndex ? '<- respond from here' : ''
   *     )
   *   })
   * })
   * ```
   */
  get matchedRoutes() {
    return this.#matchResult[0].map(([[, route]]) => route);
  }
  /**
   * `routePath()` can retrieve the path registered within the handler
   *
   * @deprecated
   *
   * Use routePath helper defined in "hono/route" instead.
   *
   * @see {@link https://hono.dev/docs/api/request#routepath}
   *
   * @example
   * ```ts
   * app.get('/posts/:id', (c) => {
   *   return c.json({ path: c.req.routePath })
   * })
   * ```
   */
  get routePath() {
    return this.#matchResult[0].map(([[, route]]) => route)[this.routeIndex].path;
  }
}, "HonoRequest");

// node_modules/hono/dist/utils/html.js
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
var HtmlEscapedCallbackPhase = {
  Stringify: 1,
  BeforeStream: 2,
  Stream: 3
};
var raw = /* @__PURE__ */ __name((value, callbacks) => {
  const escapedString = new String(value);
  escapedString.isEscaped = true;
  escapedString.callbacks = callbacks;
  return escapedString;
}, "raw");
var resolveCallback = /* @__PURE__ */ __name(async (str, phase, preserveCallbacks, context, buffer) => {
  if (typeof str === "object" && !(str instanceof String)) {
    if (!(str instanceof Promise)) {
      str = str.toString();
    }
    if (str instanceof Promise) {
      str = await str;
    }
  }
  const callbacks = str.callbacks;
  if (!callbacks?.length) {
    return Promise.resolve(str);
  }
  if (buffer) {
    buffer[0] += str;
  } else {
    buffer = [str];
  }
  const resStr = Promise.all(callbacks.map((c) => c({ phase, buffer, context }))).then(
    (res) => Promise.all(
      res.filter(Boolean).map((str2) => resolveCallback(str2, phase, false, context, buffer))
    ).then(() => buffer[0])
  );
  if (preserveCallbacks) {
    return raw(await resStr, callbacks);
  } else {
    return resStr;
  }
}, "resolveCallback");

// node_modules/hono/dist/context.js
var TEXT_PLAIN = "text/plain; charset=UTF-8";
var setDefaultContentType = /* @__PURE__ */ __name((contentType, headers) => {
  return {
    "Content-Type": contentType,
    ...headers
  };
}, "setDefaultContentType");
var Context = /* @__PURE__ */ __name(class {
  #rawRequest;
  #req;
  /**
   * `.env` can get bindings (environment variables, secrets, KV namespaces, D1 database, R2 bucket etc.) in Cloudflare Workers.
   *
   * @see {@link https://hono.dev/docs/api/context#env}
   *
   * @example
   * ```ts
   * // Environment object for Cloudflare Workers
   * app.get('*', async c => {
   *   const counter = c.env.COUNTER
   * })
   * ```
   */
  env = {};
  #var;
  finalized = false;
  /**
   * `.error` can get the error object from the middleware if the Handler throws an error.
   *
   * @see {@link https://hono.dev/docs/api/context#error}
   *
   * @example
   * ```ts
   * app.use('*', async (c, next) => {
   *   await next()
   *   if (c.error) {
   *     // do something...
   *   }
   * })
   * ```
   */
  error;
  #status;
  #executionCtx;
  #res;
  #layout;
  #renderer;
  #notFoundHandler;
  #preparedHeaders;
  #matchResult;
  #path;
  /**
   * Creates an instance of the Context class.
   *
   * @param req - The Request object.
   * @param options - Optional configuration options for the context.
   */
  constructor(req, options) {
    this.#rawRequest = req;
    if (options) {
      this.#executionCtx = options.executionCtx;
      this.env = options.env;
      this.#notFoundHandler = options.notFoundHandler;
      this.#path = options.path;
      this.#matchResult = options.matchResult;
    }
  }
  /**
   * `.req` is the instance of {@link HonoRequest}.
   */
  get req() {
    this.#req ??= new HonoRequest(this.#rawRequest, this.#path, this.#matchResult);
    return this.#req;
  }
  /**
   * @see {@link https://hono.dev/docs/api/context#event}
   * The FetchEvent associated with the current request.
   *
   * @throws Will throw an error if the context does not have a FetchEvent.
   */
  get event() {
    if (this.#executionCtx && "respondWith" in this.#executionCtx) {
      return this.#executionCtx;
    } else {
      throw Error("This context has no FetchEvent");
    }
  }
  /**
   * @see {@link https://hono.dev/docs/api/context#executionctx}
   * The ExecutionContext associated with the current request.
   *
   * @throws Will throw an error if the context does not have an ExecutionContext.
   */
  get executionCtx() {
    if (this.#executionCtx) {
      return this.#executionCtx;
    } else {
      throw Error("This context has no ExecutionContext");
    }
  }
  /**
   * @see {@link https://hono.dev/docs/api/context#res}
   * The Response object for the current request.
   */
  get res() {
    return this.#res ||= new Response(null, {
      headers: this.#preparedHeaders ??= new Headers()
    });
  }
  /**
   * Sets the Response object for the current request.
   *
   * @param _res - The Response object to set.
   */
  set res(_res) {
    if (this.#res && _res) {
      _res = new Response(_res.body, _res);
      for (const [k, v] of this.#res.headers.entries()) {
        if (k === "content-type") {
          continue;
        }
        if (k === "set-cookie") {
          const cookies = this.#res.headers.getSetCookie();
          _res.headers.delete("set-cookie");
          for (const cookie of cookies) {
            _res.headers.append("set-cookie", cookie);
          }
        } else {
          _res.headers.set(k, v);
        }
      }
    }
    this.#res = _res;
    this.finalized = true;
  }
  /**
   * `.render()` can create a response within a layout.
   *
   * @see {@link https://hono.dev/docs/api/context#render-setrenderer}
   *
   * @example
   * ```ts
   * app.get('/', (c) => {
   *   return c.render('Hello!')
   * })
   * ```
   */
  render = (...args) => {
    this.#renderer ??= (content) => this.html(content);
    return this.#renderer(...args);
  };
  /**
   * Sets the layout for the response.
   *
   * @param layout - The layout to set.
   * @returns The layout function.
   */
  setLayout = (layout) => this.#layout = layout;
  /**
   * Gets the current layout for the response.
   *
   * @returns The current layout function.
   */
  getLayout = () => this.#layout;
  /**
   * `.setRenderer()` can set the layout in the custom middleware.
   *
   * @see {@link https://hono.dev/docs/api/context#render-setrenderer}
   *
   * @example
   * ```tsx
   * app.use('*', async (c, next) => {
   *   c.setRenderer((content) => {
   *     return c.html(
   *       <html>
   *         <body>
   *           <p>{content}</p>
   *         </body>
   *       </html>
   *     )
   *   })
   *   await next()
   * })
   * ```
   */
  setRenderer = (renderer) => {
    this.#renderer = renderer;
  };
  /**
   * `.header()` can set headers.
   *
   * @see {@link https://hono.dev/docs/api/context#header}
   *
   * @example
   * ```ts
   * app.get('/welcome', (c) => {
   *   // Set headers
   *   c.header('X-Message', 'Hello!')
   *   c.header('Content-Type', 'text/plain')
   *
   *   return c.body('Thank you for coming')
   * })
   * ```
   */
  header = (name, value, options) => {
    if (this.finalized) {
      this.#res = new Response(this.#res.body, this.#res);
    }
    const headers = this.#res ? this.#res.headers : this.#preparedHeaders ??= new Headers();
    if (value === void 0) {
      headers.delete(name);
    } else if (options?.append) {
      headers.append(name, value);
    } else {
      headers.set(name, value);
    }
  };
  status = (status) => {
    this.#status = status;
  };
  /**
   * `.set()` can set the value specified by the key.
   *
   * @see {@link https://hono.dev/docs/api/context#set-get}
   *
   * @example
   * ```ts
   * app.use('*', async (c, next) => {
   *   c.set('message', 'Hono is hot!!')
   *   await next()
   * })
   * ```
   */
  set = (key, value) => {
    this.#var ??= /* @__PURE__ */ new Map();
    this.#var.set(key, value);
  };
  /**
   * `.get()` can use the value specified by the key.
   *
   * @see {@link https://hono.dev/docs/api/context#set-get}
   *
   * @example
   * ```ts
   * app.get('/', (c) => {
   *   const message = c.get('message')
   *   return c.text(`The message is "${message}"`)
   * })
   * ```
   */
  get = (key) => {
    return this.#var ? this.#var.get(key) : void 0;
  };
  /**
   * `.var` can access the value of a variable.
   *
   * @see {@link https://hono.dev/docs/api/context#var}
   *
   * @example
   * ```ts
   * const result = c.var.client.oneMethod()
   * ```
   */
  // c.var.propName is a read-only
  get var() {
    if (!this.#var) {
      return {};
    }
    return Object.fromEntries(this.#var);
  }
  #newResponse(data, arg, headers) {
    const responseHeaders = this.#res ? new Headers(this.#res.headers) : this.#preparedHeaders ?? new Headers();
    if (typeof arg === "object" && "headers" in arg) {
      const argHeaders = arg.headers instanceof Headers ? arg.headers : new Headers(arg.headers);
      for (const [key, value] of argHeaders) {
        if (key.toLowerCase() === "set-cookie") {
          responseHeaders.append(key, value);
        } else {
          responseHeaders.set(key, value);
        }
      }
    }
    if (headers) {
      for (const [k, v] of Object.entries(headers)) {
        if (typeof v === "string") {
          responseHeaders.set(k, v);
        } else {
          responseHeaders.delete(k);
          for (const v2 of v) {
            responseHeaders.append(k, v2);
          }
        }
      }
    }
    const status = typeof arg === "number" ? arg : arg?.status ?? this.#status;
    return new Response(data, { status, headers: responseHeaders });
  }
  newResponse = (...args) => this.#newResponse(...args);
  /**
   * `.body()` can return the HTTP response.
   * You can set headers with `.header()` and set HTTP status code with `.status`.
   * This can also be set in `.text()`, `.json()` and so on.
   *
   * @see {@link https://hono.dev/docs/api/context#body}
   *
   * @example
   * ```ts
   * app.get('/welcome', (c) => {
   *   // Set headers
   *   c.header('X-Message', 'Hello!')
   *   c.header('Content-Type', 'text/plain')
   *   // Set HTTP status code
   *   c.status(201)
   *
   *   // Return the response body
   *   return c.body('Thank you for coming')
   * })
   * ```
   */
  body = (data, arg, headers) => this.#newResponse(data, arg, headers);
  /**
   * `.text()` can render text as `Content-Type:text/plain`.
   *
   * @see {@link https://hono.dev/docs/api/context#text}
   *
   * @example
   * ```ts
   * app.get('/say', (c) => {
   *   return c.text('Hello!')
   * })
   * ```
   */
  text = (text, arg, headers) => {
    return !this.#preparedHeaders && !this.#status && !arg && !headers && !this.finalized ? new Response(text) : this.#newResponse(
      text,
      arg,
      setDefaultContentType(TEXT_PLAIN, headers)
    );
  };
  /**
   * `.json()` can render JSON as `Content-Type:application/json`.
   *
   * @see {@link https://hono.dev/docs/api/context#json}
   *
   * @example
   * ```ts
   * app.get('/api', (c) => {
   *   return c.json({ message: 'Hello!' })
   * })
   * ```
   */
  json = (object, arg, headers) => {
    return this.#newResponse(
      JSON.stringify(object),
      arg,
      setDefaultContentType("application/json", headers)
    );
  };
  html = (html, arg, headers) => {
    const res = /* @__PURE__ */ __name((html2) => this.#newResponse(html2, arg, setDefaultContentType("text/html; charset=UTF-8", headers)), "res");
    return typeof html === "object" ? resolveCallback(html, HtmlEscapedCallbackPhase.Stringify, false, {}).then(res) : res(html);
  };
  /**
   * `.redirect()` can Redirect, default status code is 302.
   *
   * @see {@link https://hono.dev/docs/api/context#redirect}
   *
   * @example
   * ```ts
   * app.get('/redirect', (c) => {
   *   return c.redirect('/')
   * })
   * app.get('/redirect-permanently', (c) => {
   *   return c.redirect('/', 301)
   * })
   * ```
   */
  redirect = (location, status) => {
    const locationString = String(location);
    this.header(
      "Location",
      // Multibyes should be encoded
      // eslint-disable-next-line no-control-regex
      !/[^\x00-\xFF]/.test(locationString) ? locationString : encodeURI(locationString)
    );
    return this.newResponse(null, status ?? 302);
  };
  /**
   * `.notFound()` can return the Not Found Response.
   *
   * @see {@link https://hono.dev/docs/api/context#notfound}
   *
   * @example
   * ```ts
   * app.get('/notfound', (c) => {
   *   return c.notFound()
   * })
   * ```
   */
  notFound = () => {
    this.#notFoundHandler ??= () => new Response();
    return this.#notFoundHandler(this);
  };
}, "Context");

// node_modules/hono/dist/router.js
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
var METHOD_NAME_ALL = "ALL";
var METHOD_NAME_ALL_LOWERCASE = "all";
var METHODS = ["get", "post", "put", "delete", "options", "patch"];
var MESSAGE_MATCHER_IS_ALREADY_BUILT = "Can not add a route since the matcher is already built.";
var UnsupportedPathError = /* @__PURE__ */ __name(class extends Error {
}, "UnsupportedPathError");

// node_modules/hono/dist/utils/constants.js
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
var COMPOSED_HANDLER = "__COMPOSED_HANDLER";

// node_modules/hono/dist/hono-base.js
var notFoundHandler = /* @__PURE__ */ __name((c) => {
  return c.text("404 Not Found", 404);
}, "notFoundHandler");
var errorHandler = /* @__PURE__ */ __name((err, c) => {
  if ("getResponse" in err) {
    const res = err.getResponse();
    return c.newResponse(res.body, res);
  }
  console.error(err);
  return c.text("Internal Server Error", 500);
}, "errorHandler");
var Hono = /* @__PURE__ */ __name(class _Hono {
  get;
  post;
  put;
  delete;
  options;
  patch;
  all;
  on;
  use;
  /*
    This class is like an abstract class and does not have a router.
    To use it, inherit the class and implement router in the constructor.
  */
  router;
  getPath;
  // Cannot use `#` because it requires visibility at JavaScript runtime.
  _basePath = "/";
  #path = "/";
  routes = [];
  constructor(options = {}) {
    const allMethods = [...METHODS, METHOD_NAME_ALL_LOWERCASE];
    allMethods.forEach((method) => {
      this[method] = (args1, ...args) => {
        if (typeof args1 === "string") {
          this.#path = args1;
        } else {
          this.#addRoute(method, this.#path, args1);
        }
        args.forEach((handler) => {
          this.#addRoute(method, this.#path, handler);
        });
        return this;
      };
    });
    this.on = (method, path, ...handlers) => {
      for (const p of [path].flat()) {
        this.#path = p;
        for (const m of [method].flat()) {
          handlers.map((handler) => {
            this.#addRoute(m.toUpperCase(), this.#path, handler);
          });
        }
      }
      return this;
    };
    this.use = (arg1, ...handlers) => {
      if (typeof arg1 === "string") {
        this.#path = arg1;
      } else {
        this.#path = "*";
        handlers.unshift(arg1);
      }
      handlers.forEach((handler) => {
        this.#addRoute(METHOD_NAME_ALL, this.#path, handler);
      });
      return this;
    };
    const { strict, ...optionsWithoutStrict } = options;
    Object.assign(this, optionsWithoutStrict);
    this.getPath = strict ?? true ? options.getPath ?? getPath : getPathNoStrict;
  }
  #clone() {
    const clone = new _Hono({
      router: this.router,
      getPath: this.getPath
    });
    clone.errorHandler = this.errorHandler;
    clone.#notFoundHandler = this.#notFoundHandler;
    clone.routes = this.routes;
    return clone;
  }
  #notFoundHandler = notFoundHandler;
  // Cannot use `#` because it requires visibility at JavaScript runtime.
  errorHandler = errorHandler;
  /**
   * `.route()` allows grouping other Hono instance in routes.
   *
   * @see {@link https://hono.dev/docs/api/routing#grouping}
   *
   * @param {string} path - base Path
   * @param {Hono} app - other Hono instance
   * @returns {Hono} routed Hono instance
   *
   * @example
   * ```ts
   * const app = new Hono()
   * const app2 = new Hono()
   *
   * app2.get("/user", (c) => c.text("user"))
   * app.route("/api", app2) // GET /api/user
   * ```
   */
  route(path, app6) {
    const subApp = this.basePath(path);
    app6.routes.map((r) => {
      let handler;
      if (app6.errorHandler === errorHandler) {
        handler = r.handler;
      } else {
        handler = /* @__PURE__ */ __name(async (c, next) => (await compose([], app6.errorHandler)(c, () => r.handler(c, next))).res, "handler");
        handler[COMPOSED_HANDLER] = r.handler;
      }
      subApp.#addRoute(r.method, r.path, handler);
    });
    return this;
  }
  /**
   * `.basePath()` allows base paths to be specified.
   *
   * @see {@link https://hono.dev/docs/api/routing#base-path}
   *
   * @param {string} path - base Path
   * @returns {Hono} changed Hono instance
   *
   * @example
   * ```ts
   * const api = new Hono().basePath('/api')
   * ```
   */
  basePath(path) {
    const subApp = this.#clone();
    subApp._basePath = mergePath(this._basePath, path);
    return subApp;
  }
  /**
   * `.onError()` handles an error and returns a customized Response.
   *
   * @see {@link https://hono.dev/docs/api/hono#error-handling}
   *
   * @param {ErrorHandler} handler - request Handler for error
   * @returns {Hono} changed Hono instance
   *
   * @example
   * ```ts
   * app.onError((err, c) => {
   *   console.error(`${err}`)
   *   return c.text('Custom Error Message', 500)
   * })
   * ```
   */
  onError = (handler) => {
    this.errorHandler = handler;
    return this;
  };
  /**
   * `.notFound()` allows you to customize a Not Found Response.
   *
   * @see {@link https://hono.dev/docs/api/hono#not-found}
   *
   * @param {NotFoundHandler} handler - request handler for not-found
   * @returns {Hono} changed Hono instance
   *
   * @example
   * ```ts
   * app.notFound((c) => {
   *   return c.text('Custom 404 Message', 404)
   * })
   * ```
   */
  notFound = (handler) => {
    this.#notFoundHandler = handler;
    return this;
  };
  /**
   * `.mount()` allows you to mount applications built with other frameworks into your Hono application.
   *
   * @see {@link https://hono.dev/docs/api/hono#mount}
   *
   * @param {string} path - base Path
   * @param {Function} applicationHandler - other Request Handler
   * @param {MountOptions} [options] - options of `.mount()`
   * @returns {Hono} mounted Hono instance
   *
   * @example
   * ```ts
   * import { Router as IttyRouter } from 'itty-router'
   * import { Hono } from 'hono'
   * // Create itty-router application
   * const ittyRouter = IttyRouter()
   * // GET /itty-router/hello
   * ittyRouter.get('/hello', () => new Response('Hello from itty-router'))
   *
   * const app = new Hono()
   * app.mount('/itty-router', ittyRouter.handle)
   * ```
   *
   * @example
   * ```ts
   * const app = new Hono()
   * // Send the request to another application without modification.
   * app.mount('/app', anotherApp, {
   *   replaceRequest: (req) => req,
   * })
   * ```
   */
  mount(path, applicationHandler, options) {
    let replaceRequest;
    let optionHandler;
    if (options) {
      if (typeof options === "function") {
        optionHandler = options;
      } else {
        optionHandler = options.optionHandler;
        if (options.replaceRequest === false) {
          replaceRequest = /* @__PURE__ */ __name((request) => request, "replaceRequest");
        } else {
          replaceRequest = options.replaceRequest;
        }
      }
    }
    const getOptions = optionHandler ? (c) => {
      const options2 = optionHandler(c);
      return Array.isArray(options2) ? options2 : [options2];
    } : (c) => {
      let executionContext = void 0;
      try {
        executionContext = c.executionCtx;
      } catch {
      }
      return [c.env, executionContext];
    };
    replaceRequest ||= (() => {
      const mergedPath = mergePath(this._basePath, path);
      const pathPrefixLength = mergedPath === "/" ? 0 : mergedPath.length;
      return (request) => {
        const url = new URL(request.url);
        url.pathname = url.pathname.slice(pathPrefixLength) || "/";
        return new Request(url, request);
      };
    })();
    const handler = /* @__PURE__ */ __name(async (c, next) => {
      const res = await applicationHandler(replaceRequest(c.req.raw), ...getOptions(c));
      if (res) {
        return res;
      }
      await next();
    }, "handler");
    this.#addRoute(METHOD_NAME_ALL, mergePath(path, "*"), handler);
    return this;
  }
  #addRoute(method, path, handler) {
    method = method.toUpperCase();
    path = mergePath(this._basePath, path);
    const r = { basePath: this._basePath, path, method, handler };
    this.router.add(method, path, [handler, r]);
    this.routes.push(r);
  }
  #handleError(err, c) {
    if (err instanceof Error) {
      return this.errorHandler(err, c);
    }
    throw err;
  }
  #dispatch(request, executionCtx, env, method) {
    if (method === "HEAD") {
      return (async () => new Response(null, await this.#dispatch(request, executionCtx, env, "GET")))();
    }
    const path = this.getPath(request, { env });
    const matchResult = this.router.match(method, path);
    const c = new Context(request, {
      path,
      matchResult,
      env,
      executionCtx,
      notFoundHandler: this.#notFoundHandler
    });
    if (matchResult[0].length === 1) {
      let res;
      try {
        res = matchResult[0][0][0][0](c, async () => {
          c.res = await this.#notFoundHandler(c);
        });
      } catch (err) {
        return this.#handleError(err, c);
      }
      return res instanceof Promise ? res.then(
        (resolved) => resolved || (c.finalized ? c.res : this.#notFoundHandler(c))
      ).catch((err) => this.#handleError(err, c)) : res ?? this.#notFoundHandler(c);
    }
    const composed = compose(matchResult[0], this.errorHandler, this.#notFoundHandler);
    return (async () => {
      try {
        const context = await composed(c);
        if (!context.finalized) {
          throw new Error(
            "Context is not finalized. Did you forget to return a Response object or `await next()`?"
          );
        }
        return context.res;
      } catch (err) {
        return this.#handleError(err, c);
      }
    })();
  }
  /**
   * `.fetch()` will be entry point of your app.
   *
   * @see {@link https://hono.dev/docs/api/hono#fetch}
   *
   * @param {Request} request - request Object of request
   * @param {Env} Env - env Object
   * @param {ExecutionContext} - context of execution
   * @returns {Response | Promise<Response>} response of request
   *
   */
  fetch = (request, ...rest) => {
    return this.#dispatch(request, rest[1], rest[0], request.method);
  };
  /**
   * `.request()` is a useful method for testing.
   * You can pass a URL or pathname to send a GET request.
   * app will return a Response object.
   * ```ts
   * test('GET /hello is ok', async () => {
   *   const res = await app.request('/hello')
   *   expect(res.status).toBe(200)
   * })
   * ```
   * @see https://hono.dev/docs/api/hono#request
   */
  request = (input, requestInit, Env, executionCtx) => {
    if (input instanceof Request) {
      return this.fetch(requestInit ? new Request(input, requestInit) : input, Env, executionCtx);
    }
    input = input.toString();
    return this.fetch(
      new Request(
        /^https?:\/\//.test(input) ? input : `http://localhost${mergePath("/", input)}`,
        requestInit
      ),
      Env,
      executionCtx
    );
  };
  /**
   * `.fire()` automatically adds a global fetch event listener.
   * This can be useful for environments that adhere to the Service Worker API, such as non-ES module Cloudflare Workers.
   * @deprecated
   * Use `fire` from `hono/service-worker` instead.
   * ```ts
   * import { Hono } from 'hono'
   * import { fire } from 'hono/service-worker'
   *
   * const app = new Hono()
   * // ...
   * fire(app)
   * ```
   * @see https://hono.dev/docs/api/hono#fire
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
   * @see https://developers.cloudflare.com/workers/reference/migrate-to-module-workers/
   */
  fire = () => {
    addEventListener("fetch", (event) => {
      event.respondWith(this.#dispatch(event.request, event, void 0, event.request.method));
    });
  };
}, "_Hono");

// node_modules/hono/dist/router/reg-exp-router/index.js
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();

// node_modules/hono/dist/router/reg-exp-router/router.js
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();

// node_modules/hono/dist/router/reg-exp-router/matcher.js
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
var emptyParam = [];
function match(method, path) {
  const matchers = this.buildAllMatchers();
  const match2 = /* @__PURE__ */ __name((method2, path2) => {
    const matcher = matchers[method2] || matchers[METHOD_NAME_ALL];
    const staticMatch = matcher[2][path2];
    if (staticMatch) {
      return staticMatch;
    }
    const match3 = path2.match(matcher[0]);
    if (!match3) {
      return [[], emptyParam];
    }
    const index = match3.indexOf("", 1);
    return [matcher[1][index], match3];
  }, "match2");
  this.match = match2;
  return match2(method, path);
}
__name(match, "match");

// node_modules/hono/dist/router/reg-exp-router/node.js
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
var LABEL_REG_EXP_STR = "[^/]+";
var ONLY_WILDCARD_REG_EXP_STR = ".*";
var TAIL_WILDCARD_REG_EXP_STR = "(?:|/.*)";
var PATH_ERROR = /* @__PURE__ */ Symbol();
var regExpMetaChars = new Set(".\\+*[^]$()");
function compareKey(a, b) {
  if (a.length === 1) {
    return b.length === 1 ? a < b ? -1 : 1 : -1;
  }
  if (b.length === 1) {
    return 1;
  }
  if (a === ONLY_WILDCARD_REG_EXP_STR || a === TAIL_WILDCARD_REG_EXP_STR) {
    return 1;
  } else if (b === ONLY_WILDCARD_REG_EXP_STR || b === TAIL_WILDCARD_REG_EXP_STR) {
    return -1;
  }
  if (a === LABEL_REG_EXP_STR) {
    return 1;
  } else if (b === LABEL_REG_EXP_STR) {
    return -1;
  }
  return a.length === b.length ? a < b ? -1 : 1 : b.length - a.length;
}
__name(compareKey, "compareKey");
var Node = /* @__PURE__ */ __name(class _Node {
  #index;
  #varIndex;
  #children = /* @__PURE__ */ Object.create(null);
  insert(tokens, index, paramMap, context, pathErrorCheckOnly) {
    if (tokens.length === 0) {
      if (this.#index !== void 0) {
        throw PATH_ERROR;
      }
      if (pathErrorCheckOnly) {
        return;
      }
      this.#index = index;
      return;
    }
    const [token, ...restTokens] = tokens;
    const pattern = token === "*" ? restTokens.length === 0 ? ["", "", ONLY_WILDCARD_REG_EXP_STR] : ["", "", LABEL_REG_EXP_STR] : token === "/*" ? ["", "", TAIL_WILDCARD_REG_EXP_STR] : token.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
    let node;
    if (pattern) {
      const name = pattern[1];
      let regexpStr = pattern[2] || LABEL_REG_EXP_STR;
      if (name && pattern[2]) {
        if (regexpStr === ".*") {
          throw PATH_ERROR;
        }
        regexpStr = regexpStr.replace(/^\((?!\?:)(?=[^)]+\)$)/, "(?:");
        if (/\((?!\?:)/.test(regexpStr)) {
          throw PATH_ERROR;
        }
      }
      node = this.#children[regexpStr];
      if (!node) {
        if (Object.keys(this.#children).some(
          (k) => k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR
        )) {
          throw PATH_ERROR;
        }
        if (pathErrorCheckOnly) {
          return;
        }
        node = this.#children[regexpStr] = new _Node();
        if (name !== "") {
          node.#varIndex = context.varIndex++;
        }
      }
      if (!pathErrorCheckOnly && name !== "") {
        paramMap.push([name, node.#varIndex]);
      }
    } else {
      node = this.#children[token];
      if (!node) {
        if (Object.keys(this.#children).some(
          (k) => k.length > 1 && k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR
        )) {
          throw PATH_ERROR;
        }
        if (pathErrorCheckOnly) {
          return;
        }
        node = this.#children[token] = new _Node();
      }
    }
    node.insert(restTokens, index, paramMap, context, pathErrorCheckOnly);
  }
  buildRegExpStr() {
    const childKeys = Object.keys(this.#children).sort(compareKey);
    const strList = childKeys.map((k) => {
      const c = this.#children[k];
      return (typeof c.#varIndex === "number" ? `(${k})@${c.#varIndex}` : regExpMetaChars.has(k) ? `\\${k}` : k) + c.buildRegExpStr();
    });
    if (typeof this.#index === "number") {
      strList.unshift(`#${this.#index}`);
    }
    if (strList.length === 0) {
      return "";
    }
    if (strList.length === 1) {
      return strList[0];
    }
    return "(?:" + strList.join("|") + ")";
  }
}, "_Node");

// node_modules/hono/dist/router/reg-exp-router/trie.js
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
var Trie = /* @__PURE__ */ __name(class {
  #context = { varIndex: 0 };
  #root = new Node();
  insert(path, index, pathErrorCheckOnly) {
    const paramAssoc = [];
    const groups = [];
    for (let i = 0; ; ) {
      let replaced = false;
      path = path.replace(/\{[^}]+\}/g, (m) => {
        const mark = `@\\${i}`;
        groups[i] = [mark, m];
        i++;
        replaced = true;
        return mark;
      });
      if (!replaced) {
        break;
      }
    }
    const tokens = path.match(/(?::[^\/]+)|(?:\/\*$)|./g) || [];
    for (let i = groups.length - 1; i >= 0; i--) {
      const [mark] = groups[i];
      for (let j = tokens.length - 1; j >= 0; j--) {
        if (tokens[j].indexOf(mark) !== -1) {
          tokens[j] = tokens[j].replace(mark, groups[i][1]);
          break;
        }
      }
    }
    this.#root.insert(tokens, index, paramAssoc, this.#context, pathErrorCheckOnly);
    return paramAssoc;
  }
  buildRegExp() {
    let regexp = this.#root.buildRegExpStr();
    if (regexp === "") {
      return [/^$/, [], []];
    }
    let captureIndex = 0;
    const indexReplacementMap = [];
    const paramReplacementMap = [];
    regexp = regexp.replace(/#(\d+)|@(\d+)|\.\*\$/g, (_, handlerIndex, paramIndex) => {
      if (handlerIndex !== void 0) {
        indexReplacementMap[++captureIndex] = Number(handlerIndex);
        return "$()";
      }
      if (paramIndex !== void 0) {
        paramReplacementMap[Number(paramIndex)] = ++captureIndex;
        return "";
      }
      return "";
    });
    return [new RegExp(`^${regexp}`), indexReplacementMap, paramReplacementMap];
  }
}, "Trie");

// node_modules/hono/dist/router/reg-exp-router/router.js
var nullMatcher = [/^$/, [], /* @__PURE__ */ Object.create(null)];
var wildcardRegExpCache = /* @__PURE__ */ Object.create(null);
function buildWildcardRegExp(path) {
  return wildcardRegExpCache[path] ??= new RegExp(
    path === "*" ? "" : `^${path.replace(
      /\/\*$|([.\\+*[^\]$()])/g,
      (_, metaChar) => metaChar ? `\\${metaChar}` : "(?:|/.*)"
    )}$`
  );
}
__name(buildWildcardRegExp, "buildWildcardRegExp");
function clearWildcardRegExpCache() {
  wildcardRegExpCache = /* @__PURE__ */ Object.create(null);
}
__name(clearWildcardRegExpCache, "clearWildcardRegExpCache");
function buildMatcherFromPreprocessedRoutes(routes) {
  const trie = new Trie();
  const handlerData = [];
  if (routes.length === 0) {
    return nullMatcher;
  }
  const routesWithStaticPathFlag = routes.map(
    (route) => [!/\*|\/:/.test(route[0]), ...route]
  ).sort(
    ([isStaticA, pathA], [isStaticB, pathB]) => isStaticA ? 1 : isStaticB ? -1 : pathA.length - pathB.length
  );
  const staticMap = /* @__PURE__ */ Object.create(null);
  for (let i = 0, j = -1, len = routesWithStaticPathFlag.length; i < len; i++) {
    const [pathErrorCheckOnly, path, handlers] = routesWithStaticPathFlag[i];
    if (pathErrorCheckOnly) {
      staticMap[path] = [handlers.map(([h]) => [h, /* @__PURE__ */ Object.create(null)]), emptyParam];
    } else {
      j++;
    }
    let paramAssoc;
    try {
      paramAssoc = trie.insert(path, j, pathErrorCheckOnly);
    } catch (e) {
      throw e === PATH_ERROR ? new UnsupportedPathError(path) : e;
    }
    if (pathErrorCheckOnly) {
      continue;
    }
    handlerData[j] = handlers.map(([h, paramCount]) => {
      const paramIndexMap = /* @__PURE__ */ Object.create(null);
      paramCount -= 1;
      for (; paramCount >= 0; paramCount--) {
        const [key, value] = paramAssoc[paramCount];
        paramIndexMap[key] = value;
      }
      return [h, paramIndexMap];
    });
  }
  const [regexp, indexReplacementMap, paramReplacementMap] = trie.buildRegExp();
  for (let i = 0, len = handlerData.length; i < len; i++) {
    for (let j = 0, len2 = handlerData[i].length; j < len2; j++) {
      const map = handlerData[i][j]?.[1];
      if (!map) {
        continue;
      }
      const keys = Object.keys(map);
      for (let k = 0, len3 = keys.length; k < len3; k++) {
        map[keys[k]] = paramReplacementMap[map[keys[k]]];
      }
    }
  }
  const handlerMap = [];
  for (const i in indexReplacementMap) {
    handlerMap[i] = handlerData[indexReplacementMap[i]];
  }
  return [regexp, handlerMap, staticMap];
}
__name(buildMatcherFromPreprocessedRoutes, "buildMatcherFromPreprocessedRoutes");
function findMiddleware(middleware, path) {
  if (!middleware) {
    return void 0;
  }
  for (const k of Object.keys(middleware).sort((a, b) => b.length - a.length)) {
    if (buildWildcardRegExp(k).test(path)) {
      return [...middleware[k]];
    }
  }
  return void 0;
}
__name(findMiddleware, "findMiddleware");
var RegExpRouter = /* @__PURE__ */ __name(class {
  name = "RegExpRouter";
  #middleware;
  #routes;
  constructor() {
    this.#middleware = { [METHOD_NAME_ALL]: /* @__PURE__ */ Object.create(null) };
    this.#routes = { [METHOD_NAME_ALL]: /* @__PURE__ */ Object.create(null) };
  }
  add(method, path, handler) {
    const middleware = this.#middleware;
    const routes = this.#routes;
    if (!middleware || !routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    if (!middleware[method]) {
      ;
      [middleware, routes].forEach((handlerMap) => {
        handlerMap[method] = /* @__PURE__ */ Object.create(null);
        Object.keys(handlerMap[METHOD_NAME_ALL]).forEach((p) => {
          handlerMap[method][p] = [...handlerMap[METHOD_NAME_ALL][p]];
        });
      });
    }
    if (path === "/*") {
      path = "*";
    }
    const paramCount = (path.match(/\/:/g) || []).length;
    if (/\*$/.test(path)) {
      const re = buildWildcardRegExp(path);
      if (method === METHOD_NAME_ALL) {
        Object.keys(middleware).forEach((m) => {
          middleware[m][path] ||= findMiddleware(middleware[m], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
        });
      } else {
        middleware[method][path] ||= findMiddleware(middleware[method], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
      }
      Object.keys(middleware).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          Object.keys(middleware[m]).forEach((p) => {
            re.test(p) && middleware[m][p].push([handler, paramCount]);
          });
        }
      });
      Object.keys(routes).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          Object.keys(routes[m]).forEach(
            (p) => re.test(p) && routes[m][p].push([handler, paramCount])
          );
        }
      });
      return;
    }
    const paths = checkOptionalParameter(path) || [path];
    for (let i = 0, len = paths.length; i < len; i++) {
      const path2 = paths[i];
      Object.keys(routes).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          routes[m][path2] ||= [
            ...findMiddleware(middleware[m], path2) || findMiddleware(middleware[METHOD_NAME_ALL], path2) || []
          ];
          routes[m][path2].push([handler, paramCount - len + i + 1]);
        }
      });
    }
  }
  match = match;
  buildAllMatchers() {
    const matchers = /* @__PURE__ */ Object.create(null);
    Object.keys(this.#routes).concat(Object.keys(this.#middleware)).forEach((method) => {
      matchers[method] ||= this.#buildMatcher(method);
    });
    this.#middleware = this.#routes = void 0;
    clearWildcardRegExpCache();
    return matchers;
  }
  #buildMatcher(method) {
    const routes = [];
    let hasOwnRoute = method === METHOD_NAME_ALL;
    [this.#middleware, this.#routes].forEach((r) => {
      const ownRoute = r[method] ? Object.keys(r[method]).map((path) => [path, r[method][path]]) : [];
      if (ownRoute.length !== 0) {
        hasOwnRoute ||= true;
        routes.push(...ownRoute);
      } else if (method !== METHOD_NAME_ALL) {
        routes.push(
          ...Object.keys(r[METHOD_NAME_ALL]).map((path) => [path, r[METHOD_NAME_ALL][path]])
        );
      }
    });
    if (!hasOwnRoute) {
      return null;
    } else {
      return buildMatcherFromPreprocessedRoutes(routes);
    }
  }
}, "RegExpRouter");

// node_modules/hono/dist/router/reg-exp-router/prepared-router.js
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();

// node_modules/hono/dist/router/smart-router/index.js
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();

// node_modules/hono/dist/router/smart-router/router.js
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
var SmartRouter = /* @__PURE__ */ __name(class {
  name = "SmartRouter";
  #routers = [];
  #routes = [];
  constructor(init) {
    this.#routers = init.routers;
  }
  add(method, path, handler) {
    if (!this.#routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    this.#routes.push([method, path, handler]);
  }
  match(method, path) {
    if (!this.#routes) {
      throw new Error("Fatal error");
    }
    const routers = this.#routers;
    const routes = this.#routes;
    const len = routers.length;
    let i = 0;
    let res;
    for (; i < len; i++) {
      const router = routers[i];
      try {
        for (let i2 = 0, len2 = routes.length; i2 < len2; i2++) {
          router.add(...routes[i2]);
        }
        res = router.match(method, path);
      } catch (e) {
        if (e instanceof UnsupportedPathError) {
          continue;
        }
        throw e;
      }
      this.match = router.match.bind(router);
      this.#routers = [router];
      this.#routes = void 0;
      break;
    }
    if (i === len) {
      throw new Error("Fatal error");
    }
    this.name = `SmartRouter + ${this.activeRouter.name}`;
    return res;
  }
  get activeRouter() {
    if (this.#routes || this.#routers.length !== 1) {
      throw new Error("No active router has been determined yet.");
    }
    return this.#routers[0];
  }
}, "SmartRouter");

// node_modules/hono/dist/router/trie-router/index.js
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();

// node_modules/hono/dist/router/trie-router/router.js
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();

// node_modules/hono/dist/router/trie-router/node.js
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
var emptyParams = /* @__PURE__ */ Object.create(null);
var Node2 = /* @__PURE__ */ __name(class _Node2 {
  #methods;
  #children;
  #patterns;
  #order = 0;
  #params = emptyParams;
  constructor(method, handler, children) {
    this.#children = children || /* @__PURE__ */ Object.create(null);
    this.#methods = [];
    if (method && handler) {
      const m = /* @__PURE__ */ Object.create(null);
      m[method] = { handler, possibleKeys: [], score: 0 };
      this.#methods = [m];
    }
    this.#patterns = [];
  }
  insert(method, path, handler) {
    this.#order = ++this.#order;
    let curNode = this;
    const parts = splitRoutingPath(path);
    const possibleKeys = [];
    for (let i = 0, len = parts.length; i < len; i++) {
      const p = parts[i];
      const nextP = parts[i + 1];
      const pattern = getPattern(p, nextP);
      const key = Array.isArray(pattern) ? pattern[0] : p;
      if (key in curNode.#children) {
        curNode = curNode.#children[key];
        if (pattern) {
          possibleKeys.push(pattern[1]);
        }
        continue;
      }
      curNode.#children[key] = new _Node2();
      if (pattern) {
        curNode.#patterns.push(pattern);
        possibleKeys.push(pattern[1]);
      }
      curNode = curNode.#children[key];
    }
    curNode.#methods.push({
      [method]: {
        handler,
        possibleKeys: possibleKeys.filter((v, i, a) => a.indexOf(v) === i),
        score: this.#order
      }
    });
    return curNode;
  }
  #getHandlerSets(node, method, nodeParams, params) {
    const handlerSets = [];
    for (let i = 0, len = node.#methods.length; i < len; i++) {
      const m = node.#methods[i];
      const handlerSet = m[method] || m[METHOD_NAME_ALL];
      const processedSet = {};
      if (handlerSet !== void 0) {
        handlerSet.params = /* @__PURE__ */ Object.create(null);
        handlerSets.push(handlerSet);
        if (nodeParams !== emptyParams || params && params !== emptyParams) {
          for (let i2 = 0, len2 = handlerSet.possibleKeys.length; i2 < len2; i2++) {
            const key = handlerSet.possibleKeys[i2];
            const processed = processedSet[handlerSet.score];
            handlerSet.params[key] = params?.[key] && !processed ? params[key] : nodeParams[key] ?? params?.[key];
            processedSet[handlerSet.score] = true;
          }
        }
      }
    }
    return handlerSets;
  }
  search(method, path) {
    const handlerSets = [];
    this.#params = emptyParams;
    const curNode = this;
    let curNodes = [curNode];
    const parts = splitPath(path);
    const curNodesQueue = [];
    for (let i = 0, len = parts.length; i < len; i++) {
      const part = parts[i];
      const isLast = i === len - 1;
      const tempNodes = [];
      for (let j = 0, len2 = curNodes.length; j < len2; j++) {
        const node = curNodes[j];
        const nextNode = node.#children[part];
        if (nextNode) {
          nextNode.#params = node.#params;
          if (isLast) {
            if (nextNode.#children["*"]) {
              handlerSets.push(
                ...this.#getHandlerSets(nextNode.#children["*"], method, node.#params)
              );
            }
            handlerSets.push(...this.#getHandlerSets(nextNode, method, node.#params));
          } else {
            tempNodes.push(nextNode);
          }
        }
        for (let k = 0, len3 = node.#patterns.length; k < len3; k++) {
          const pattern = node.#patterns[k];
          const params = node.#params === emptyParams ? {} : { ...node.#params };
          if (pattern === "*") {
            const astNode = node.#children["*"];
            if (astNode) {
              handlerSets.push(...this.#getHandlerSets(astNode, method, node.#params));
              astNode.#params = params;
              tempNodes.push(astNode);
            }
            continue;
          }
          const [key, name, matcher] = pattern;
          if (!part && !(matcher instanceof RegExp)) {
            continue;
          }
          const child = node.#children[key];
          const restPathString = parts.slice(i).join("/");
          if (matcher instanceof RegExp) {
            const m = matcher.exec(restPathString);
            if (m) {
              params[name] = m[0];
              handlerSets.push(...this.#getHandlerSets(child, method, node.#params, params));
              if (Object.keys(child.#children).length) {
                child.#params = params;
                const componentCount = m[0].match(/\//)?.length ?? 0;
                const targetCurNodes = curNodesQueue[componentCount] ||= [];
                targetCurNodes.push(child);
              }
              continue;
            }
          }
          if (matcher === true || matcher.test(part)) {
            params[name] = part;
            if (isLast) {
              handlerSets.push(...this.#getHandlerSets(child, method, params, node.#params));
              if (child.#children["*"]) {
                handlerSets.push(
                  ...this.#getHandlerSets(child.#children["*"], method, params, node.#params)
                );
              }
            } else {
              child.#params = params;
              tempNodes.push(child);
            }
          }
        }
      }
      curNodes = tempNodes.concat(curNodesQueue.shift() ?? []);
    }
    if (handlerSets.length > 1) {
      handlerSets.sort((a, b) => {
        return a.score - b.score;
      });
    }
    return [handlerSets.map(({ handler, params }) => [handler, params])];
  }
}, "_Node");

// node_modules/hono/dist/router/trie-router/router.js
var TrieRouter = /* @__PURE__ */ __name(class {
  name = "TrieRouter";
  #node;
  constructor() {
    this.#node = new Node2();
  }
  add(method, path, handler) {
    const results = checkOptionalParameter(path);
    if (results) {
      for (let i = 0, len = results.length; i < len; i++) {
        this.#node.insert(method, results[i], handler);
      }
      return;
    }
    this.#node.insert(method, path, handler);
  }
  match(method, path) {
    return this.#node.search(method, path);
  }
}, "TrieRouter");

// node_modules/hono/dist/hono.js
var Hono2 = /* @__PURE__ */ __name(class extends Hono {
  /**
   * Creates an instance of the Hono class.
   *
   * @param options - Optional configuration options for the Hono instance.
   */
  constructor(options = {}) {
    super(options);
    this.router = options.router ?? new SmartRouter({
      routers: [new RegExpRouter(), new TrieRouter()]
    });
  }
}, "Hono");

// node_modules/hono/dist/middleware/cors/index.js
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
var cors = /* @__PURE__ */ __name((options) => {
  const defaults = {
    origin: "*",
    allowMethods: ["GET", "HEAD", "PUT", "POST", "DELETE", "PATCH"],
    allowHeaders: [],
    exposeHeaders: []
  };
  const opts = {
    ...defaults,
    ...options
  };
  const findAllowOrigin = ((optsOrigin) => {
    if (typeof optsOrigin === "string") {
      if (optsOrigin === "*") {
        return () => optsOrigin;
      } else {
        return (origin) => optsOrigin === origin ? origin : null;
      }
    } else if (typeof optsOrigin === "function") {
      return optsOrigin;
    } else {
      return (origin) => optsOrigin.includes(origin) ? origin : null;
    }
  })(opts.origin);
  const findAllowMethods = ((optsAllowMethods) => {
    if (typeof optsAllowMethods === "function") {
      return optsAllowMethods;
    } else if (Array.isArray(optsAllowMethods)) {
      return () => optsAllowMethods;
    } else {
      return () => [];
    }
  })(opts.allowMethods);
  return /* @__PURE__ */ __name(async function cors2(c, next) {
    function set(key, value) {
      c.res.headers.set(key, value);
    }
    __name(set, "set");
    const allowOrigin = await findAllowOrigin(c.req.header("origin") || "", c);
    if (allowOrigin) {
      set("Access-Control-Allow-Origin", allowOrigin);
    }
    if (opts.credentials) {
      set("Access-Control-Allow-Credentials", "true");
    }
    if (opts.exposeHeaders?.length) {
      set("Access-Control-Expose-Headers", opts.exposeHeaders.join(","));
    }
    if (c.req.method === "OPTIONS") {
      if (opts.origin !== "*") {
        set("Vary", "Origin");
      }
      if (opts.maxAge != null) {
        set("Access-Control-Max-Age", opts.maxAge.toString());
      }
      const allowMethods = await findAllowMethods(c.req.header("origin") || "", c);
      if (allowMethods.length) {
        set("Access-Control-Allow-Methods", allowMethods.join(","));
      }
      let headers = opts.allowHeaders;
      if (!headers?.length) {
        const requestHeaders = c.req.header("Access-Control-Request-Headers");
        if (requestHeaders) {
          headers = requestHeaders.split(/\s*,\s*/);
        }
      }
      if (headers?.length) {
        set("Access-Control-Allow-Headers", headers.join(","));
        c.res.headers.append("Vary", "Access-Control-Request-Headers");
      }
      c.res.headers.delete("Content-Length");
      c.res.headers.delete("Content-Type");
      return new Response(null, {
        headers: c.res.headers,
        status: 204,
        statusText: "No Content"
      });
    }
    await next();
    if (opts.origin !== "*") {
      c.header("Vary", "Origin", { append: true });
    }
  }, "cors2");
}, "cors");

// src/routes/candidates.ts
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
var app = new Hono2();
app.get("/", async (c) => {
  const viewer = c.req.query("viewer")?.toLowerCase();
  if (!viewer || !/^0x[a-f0-9]{40}$/i.test(viewer)) {
    return c.json({ error: "Invalid viewer address" }, 400);
  }
  const db = c.env.DB;
  const likedResult = await db.prepare(`
      SELECT target_type, target_id FROM likes WHERE liker_address = ?
    `).bind(viewer).all();
  const likedShadowIds = /* @__PURE__ */ new Set();
  const likedUserAddresses = /* @__PURE__ */ new Set();
  for (const like of likedResult.results || []) {
    if (like.target_type === "shadow") {
      likedShadowIds.add(like.target_id);
    } else {
      likedUserAddresses.add(like.target_id.toLowerCase());
    }
  }
  const viewerShadowResult = await db.prepare(`SELECT id FROM shadow_profiles WHERE claimed_address = ?`).bind(viewer).first();
  const viewerShadowId = viewerShadowResult?.id;
  const profilesResult = await db.prepare(`
      SELECT
        id, source, display_name, bio, age_bucket, gender_identity,
        location, photos_json, anime_cid, claimed_address
      FROM shadow_profiles
      WHERE featured_rank > 0
      ORDER BY featured_rank ASC
      LIMIT 20
    `).all();
  const candidates = [];
  for (const row of profilesResult.results || []) {
    if (likedShadowIds.has(row.id))
      continue;
    if (row.id === viewerShadowId)
      continue;
    if (row.claimed_address && likedUserAddresses.has(row.claimed_address.toLowerCase()))
      continue;
    const avatarUrl = row.anime_cid ? `https://ipfs.io/ipfs/${row.anime_cid}` : `https://api.dicebear.com/9.x/adventurer/svg?seed=${row.id}`;
    candidates.push({
      targetType: "shadow",
      targetId: row.id,
      displayName: row.display_name || "Anonymous",
      bio: row.bio,
      ageBucket: row.age_bucket,
      genderIdentity: row.gender_identity,
      location: row.location,
      avatarUrl,
      claimedAddress: row.claimed_address
    });
    if (candidates.length >= 5)
      break;
  }
  const candidateAddresses = candidates.map((c2) => c2.claimedAddress || c2.targetId).sort();
  const response = {
    candidates,
    meta: {
      // Placeholder: In V0.5, compute real Merkle root
      candidateSetRoot: "0x" + "0".repeat(64),
      nonce: Date.now(),
      expiry: Date.now() + 24 * 60 * 60 * 1e3,
      // 24 hours
      maxLikes: 5
    }
  };
  return c.json(response);
});
var candidates_default = app;

// src/routes/likes.ts
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
var app2 = new Hono2();
app2.post("/", async (c) => {
  let body;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ success: false, error: "Invalid JSON body" }, 400);
  }
  const { viewerAddress, targetType, targetId } = body;
  if (!viewerAddress || !/^0x[a-f0-9]{40}$/i.test(viewerAddress)) {
    return c.json({ success: false, error: "Invalid viewer address" }, 400);
  }
  if (!["shadow", "user"].includes(targetType)) {
    return c.json({ success: false, error: "Invalid target type" }, 400);
  }
  if (!targetId) {
    return c.json({ success: false, error: "Missing target ID" }, 400);
  }
  if (targetType === "user" && !/^0x[a-f0-9]{40}$/i.test(targetId)) {
    return c.json({ success: false, error: "Invalid target address" }, 400);
  }
  const db = c.env.DB;
  const viewerLower = viewerAddress.toLowerCase();
  const now = Date.now();
  await db.prepare(`
      INSERT INTO users (address, created_at, last_active_at)
      VALUES (?, ?, ?)
      ON CONFLICT(address) DO UPDATE SET last_active_at = ?
    `).bind(viewerLower, now, now, now).run();
  try {
    await db.prepare(`
        INSERT INTO likes (liker_address, target_type, target_id, created_at)
        VALUES (?, ?, ?, ?)
      `).bind(viewerLower, targetType, targetId, now).run();
  } catch (e) {
    if (e instanceof Error && e.message.includes("UNIQUE constraint failed")) {
      return c.json({
        success: true,
        mutual: false,
        error: "Already liked"
      });
    }
    throw e;
  }
  let targetAddress = null;
  if (targetType === "user") {
    targetAddress = targetId.toLowerCase();
  } else {
    const shadowResult = await db.prepare(`SELECT claimed_address FROM shadow_profiles WHERE id = ?`).bind(targetId).first();
    targetAddress = shadowResult?.claimed_address?.toLowerCase() || null;
  }
  if (!targetAddress) {
    return c.json({
      success: true,
      mutual: false
    });
  }
  const reciprocalResult = await db.prepare(`
      SELECT 1 FROM likes
      WHERE liker_address = ?
        AND (
          (target_type = 'user' AND LOWER(target_id) = ?)
          OR (target_type = 'shadow' AND target_id IN (
            SELECT id FROM shadow_profiles WHERE LOWER(claimed_address) = ?
          ))
        )
      LIMIT 1
    `).bind(targetAddress, viewerLower, viewerLower).first();
  if (!reciprocalResult) {
    return c.json({
      success: true,
      mutual: false
    });
  }
  const [user1, user2] = viewerLower < targetAddress ? [viewerLower, targetAddress] : [targetAddress, viewerLower];
  let matchId;
  try {
    const matchResult = await db.prepare(`
        INSERT INTO matches (user1, user2, created_at)
        VALUES (?, ?, ?)
        RETURNING id
      `).bind(user1, user2, now).first();
    matchId = matchResult?.id;
  } catch (e) {
    if (e instanceof Error && e.message.includes("UNIQUE constraint failed")) {
      const existingMatch = await db.prepare(`SELECT id FROM matches WHERE user1 = ? AND user2 = ?`).bind(user1, user2).first();
      matchId = existingMatch?.id;
    } else {
      throw e;
    }
  }
  return c.json({
    success: true,
    mutual: true,
    peerAddress: targetAddress,
    matchId
  });
});
app2.get("/received", async (c) => {
  const viewer = c.req.query("viewer")?.toLowerCase();
  if (!viewer || !/^0x[a-f0-9]{40}$/i.test(viewer)) {
    return c.json({ error: "Invalid viewer address" }, 400);
  }
  const db = c.env.DB;
  const viewerShadowResult = await db.prepare(`SELECT id FROM shadow_profiles WHERE LOWER(claimed_address) = ?`).bind(viewer).first();
  const viewerShadowId = viewerShadowResult?.id;
  const likesResult = await db.prepare(`
      SELECT l.liker_address, l.created_at,
             sp.display_name, sp.anime_cid
      FROM likes l
      LEFT JOIN shadow_profiles sp ON LOWER(sp.claimed_address) = l.liker_address
      WHERE (l.target_type = 'user' AND LOWER(l.target_id) = ?)
         OR (l.target_type = 'shadow' AND l.target_id = ?)
      ORDER BY l.created_at DESC
      LIMIT 50
    `).bind(viewer, viewerShadowId || "").all();
  const likes = (likesResult.results || []).map((row) => ({
    likerAddress: row.liker_address,
    displayName: row.display_name || "Anonymous",
    avatarUrl: row.anime_cid ? `https://ipfs.io/ipfs/${row.anime_cid}` : `https://api.dicebear.com/9.x/adventurer/svg?seed=${row.liker_address}`,
    likedAt: row.created_at
  }));
  return c.json({ likes });
});
var likes_default = app2;

// src/routes/claim.ts
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
var app3 = new Hono2();
async function sha256(data) {
  const encoder3 = new TextEncoder();
  const buffer = await crypto.subtle.digest("SHA-256", encoder3.encode(data));
  return Array.from(new Uint8Array(buffer)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
__name(sha256, "sha256");
function generateToken() {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}
__name(generateToken, "generateToken");
function generateHumanCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "HVN-";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}
__name(generateHumanCode, "generateHumanCode");
function generateId() {
  return crypto.randomUUID();
}
__name(generateId, "generateId");
app3.get("/:token", async (c) => {
  const token = c.req.param("token");
  const db = c.env.DB;
  const tokenHash = await sha256(token);
  const claimToken = await db.prepare(`
      SELECT ct.*, sp.display_name, sp.source, sp.source_url, sp.age_bucket,
             sp.gender_identity, sp.location, sp.anime_cid, sp.bio
      FROM claim_tokens ct
      JOIN shadow_profiles sp ON ct.shadow_profile_id = sp.id
      WHERE ct.token_hash = ? AND ct.used = 0 AND ct.expires_at > ?
    `).bind(tokenHash, Date.now()).first();
  if (!claimToken) {
    return c.json({ error: "Invalid or expired link" }, 404);
  }
  const likesResult = await db.prepare(`SELECT COUNT(*) as count FROM likes WHERE target_type = 'shadow' AND target_id = ?`).bind(claimToken.shadow_profile_id).first();
  const avatarUrl = claimToken.anime_cid ? `https://ipfs.io/ipfs/${claimToken.anime_cid}` : `https://api.dicebear.com/9.x/adventurer/svg?seed=${claimToken.shadow_profile_id}`;
  return c.json({
    id: claimToken.shadow_profile_id,
    displayName: claimToken.display_name || "Anonymous",
    avatarUrl,
    source: claimToken.source,
    sourceUrl: claimToken.source_url,
    age: claimToken.age_bucket?.toString(),
    gender: claimToken.gender_identity?.toString(),
    location: claimToken.location,
    bio: claimToken.bio,
    likesReceived: likesResult?.count || 0,
    // Don't expose actual code - frontend will call /start to get it
    hasVerificationCode: !!claimToken.human_code_hash
  });
});
app3.post("/start", async (c) => {
  const body = await c.req.json();
  const { shadowProfileId, method } = body;
  if (!shadowProfileId || !method) {
    return c.json({ error: "Missing shadowProfileId or method" }, 400);
  }
  const db = c.env.DB;
  const profile = await db.prepare(`SELECT id, source, source_url FROM shadow_profiles WHERE id = ? AND claimed_address IS NULL`).bind(shadowProfileId).first();
  if (!profile) {
    return c.json({ error: "Profile not found or already claimed" }, 404);
  }
  const token = generateToken();
  const tokenHash = await sha256(token);
  const humanCode = generateHumanCode();
  const humanCodeHash = await sha256(humanCode);
  const id = generateId();
  const now = Date.now();
  const expiresAt = now + 7 * 24 * 60 * 60 * 1e3;
  await db.prepare(`
      INSERT INTO claim_tokens (id, shadow_profile_id, token_hash, human_code_hash, method, issued_at, expires_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(id, shadowProfileId, tokenHash, humanCodeHash, method, now, expiresAt).run();
  return c.json({
    claimId: id,
    token,
    // For building claim URL
    verificationCode: humanCode,
    // For bio edit
    expiresAt,
    source: profile.source,
    sourceUrl: profile.source_url
  });
});
app3.post("/verify-bio", async (c) => {
  const body = await c.req.json();
  const { claimId } = body;
  if (!claimId) {
    return c.json({ error: "Missing claimId" }, 400);
  }
  const db = c.env.DB;
  const claimToken = await db.prepare(`SELECT * FROM claim_tokens WHERE id = ? AND used = 0 AND expires_at > ?`).bind(claimId, Date.now()).first();
  if (!claimToken) {
    return c.json({ error: "Invalid or expired claim" }, 404);
  }
  if (claimToken.method !== "bio_edit") {
    return c.json({ error: "Wrong verification method" }, 400);
  }
  return c.json({
    verified: true,
    message: "Bio verification successful"
  });
});
app3.post("/verify-dm", async (c) => {
  const body = await c.req.json();
  const { shadowProfileId, code } = body;
  if (!shadowProfileId || !code) {
    return c.json({ error: "Missing shadowProfileId or code" }, 400);
  }
  const db = c.env.DB;
  const codeHash = await sha256(code.toUpperCase().trim());
  const claimToken = await db.prepare(`
      SELECT * FROM claim_tokens
      WHERE shadow_profile_id = ? AND human_code_hash = ? AND used = 0 AND expires_at > ?
    `).bind(shadowProfileId, codeHash, Date.now()).first();
  if (!claimToken) {
    return c.json({ error: "Invalid code" }, 400);
  }
  return c.json({
    verified: true,
    claimId: claimToken.id
  });
});
app3.post("/complete", async (c) => {
  const body = await c.req.json();
  const { claimId, address } = body;
  if (!claimId || !address) {
    return c.json({ error: "Missing claimId or address" }, 400);
  }
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return c.json({ error: "Invalid address format" }, 400);
  }
  const db = c.env.DB;
  const now = Date.now();
  const claimToken = await db.prepare(`SELECT * FROM claim_tokens WHERE id = ? AND used = 0 AND expires_at > ?`).bind(claimId, now).first();
  if (!claimToken) {
    return c.json({ error: "Invalid or expired claim" }, 404);
  }
  try {
    await db.prepare(`
        INSERT OR IGNORE INTO users (address, created_at, directory_tier)
        VALUES (?, ?, 'claimed')
      `).bind(address.toLowerCase(), now).run();
    await db.prepare(`
        UPDATE shadow_profiles
        SET claimed_address = ?, claimed_at = ?, updated_at = ?
        WHERE id = ? AND claimed_address IS NULL
      `).bind(address.toLowerCase(), now, now, claimToken.shadow_profile_id).run();
    await db.prepare(`
        UPDATE claim_tokens
        SET used = 1, used_at = ?, used_by_address = ?
        WHERE id = ?
      `).bind(now, address.toLowerCase(), claimId).run();
    return c.json({
      success: true,
      message: "Profile claimed successfully",
      address: address.toLowerCase()
    });
  } catch (err) {
    console.error("[Claim] Complete failed:", err);
    return c.json({ error: "Failed to complete claim" }, 500);
  }
});
var claim_default = app3;

// src/routes/names.ts
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();

// node_modules/viem/_esm/index.js
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();

// node_modules/viem/_esm/utils/signature/recoverAddress.js
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();

// node_modules/viem/_esm/accounts/utils/publicKeyToAddress.js
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
init_getAddress();
init_keccak256();
function publicKeyToAddress(publicKey) {
  const address = keccak256(`0x${publicKey.substring(4)}`).substring(26);
  return checksumAddress(`0x${address}`);
}
__name(publicKeyToAddress, "publicKeyToAddress");

// node_modules/viem/_esm/utils/signature/recoverPublicKey.js
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
init_isHex();
init_size();
init_fromHex();
init_toHex();
async function recoverPublicKey({ hash, signature }) {
  const hashHex = isHex(hash) ? hash : toHex(hash);
  const { secp256k1: secp256k12 } = await Promise.resolve().then(() => (init_secp256k1(), secp256k1_exports));
  const signature_ = (() => {
    if (typeof signature === "object" && "r" in signature && "s" in signature) {
      const { r, s, v, yParity } = signature;
      const yParityOrV2 = Number(yParity ?? v);
      const recoveryBit2 = toRecoveryBit(yParityOrV2);
      return new secp256k12.Signature(hexToBigInt(r), hexToBigInt(s)).addRecoveryBit(recoveryBit2);
    }
    const signatureHex = isHex(signature) ? signature : toHex(signature);
    if (size(signatureHex) !== 65)
      throw new Error("invalid signature length");
    const yParityOrV = hexToNumber(`0x${signatureHex.slice(130)}`);
    const recoveryBit = toRecoveryBit(yParityOrV);
    return secp256k12.Signature.fromCompact(signatureHex.substring(2, 130)).addRecoveryBit(recoveryBit);
  })();
  const publicKey = signature_.recoverPublicKey(hashHex.substring(2)).toHex(false);
  return `0x${publicKey}`;
}
__name(recoverPublicKey, "recoverPublicKey");
function toRecoveryBit(yParityOrV) {
  if (yParityOrV === 0 || yParityOrV === 1)
    return yParityOrV;
  if (yParityOrV === 27)
    return 0;
  if (yParityOrV === 28)
    return 1;
  throw new Error("Invalid yParityOrV value");
}
__name(toRecoveryBit, "toRecoveryBit");

// node_modules/viem/_esm/utils/signature/recoverAddress.js
async function recoverAddress({ hash, signature }) {
  return publicKeyToAddress(await recoverPublicKey({ hash, signature }));
}
__name(recoverAddress, "recoverAddress");

// node_modules/viem/_esm/utils/signature/hashMessage.js
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
init_keccak256();

// node_modules/viem/_esm/utils/signature/toPrefixedMessage.js
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();

// node_modules/viem/_esm/constants/strings.js
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
var presignMessagePrefix = "Ethereum Signed Message:\n";

// node_modules/viem/_esm/utils/signature/toPrefixedMessage.js
init_concat();
init_size();
init_toHex();
function toPrefixedMessage(message_) {
  const message = (() => {
    if (typeof message_ === "string")
      return stringToHex(message_);
    if (typeof message_.raw === "string")
      return message_.raw;
    return bytesToHex(message_.raw);
  })();
  const prefix = stringToHex(`${presignMessagePrefix}${size(message)}`);
  return concat([prefix, message]);
}
__name(toPrefixedMessage, "toPrefixedMessage");

// node_modules/viem/_esm/utils/signature/hashMessage.js
function hashMessage(message, to_) {
  return keccak256(toPrefixedMessage(message), to_);
}
__name(hashMessage, "hashMessage");

// node_modules/viem/_esm/utils/signature/recoverMessageAddress.js
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
async function recoverMessageAddress({ message, signature }) {
  return recoverAddress({ hash: hashMessage(message), signature });
}
__name(recoverMessageAddress, "recoverMessageAddress");

// src/routes/names.ts
var app4 = new Hono2();
var ONE_YEAR_SECONDS = 365 * 24 * 60 * 60;
var GRACE_PERIOD_SECONDS = 30 * 24 * 60 * 60;
var GATEWAY_IP = "144.126.205.242";
var TTL_POSITIVE = 300;
var TTL_NEGATIVE = 60;
var SYSTEM_RESERVED = /* @__PURE__ */ new Set([
  // Infrastructure
  "www",
  "api",
  "ns1",
  "ns2",
  "ns3",
  "mail",
  "smtp",
  "pop",
  "imap",
  "ftp",
  "cdn",
  "static",
  "assets",
  "img",
  "images",
  "media",
  // Auth/Admin
  "admin",
  "root",
  "auth",
  "oauth",
  "login",
  "logout",
  "signin",
  "signout",
  "signup",
  "register",
  "account",
  "accounts",
  "user",
  "users",
  "profile",
  "settings",
  "config",
  "configuration",
  // Support
  "support",
  "help",
  "contact",
  "feedback",
  "report",
  "abuse",
  "billing",
  "payments",
  "subscription",
  // Status
  "status",
  "health",
  "ping",
  "dashboard",
  "metrics",
  "analytics",
  // Brand protection
  "heaven",
  "heavens",
  "official",
  "team",
  "staff",
  "moderator",
  "mod",
  "founder",
  "founders",
  "employee",
  "employees",
  // Security
  "security",
  "secure",
  "ssl",
  "tls",
  "cert",
  "certs",
  "certificate",
  "postmaster",
  "webmaster",
  "hostmaster",
  // Common
  "test",
  "testing",
  "demo",
  "example",
  "sample",
  "null",
  "undefined",
  "true",
  "false",
  "localhost",
  "local"
]);
var VALID_LABEL_REGEX = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/;
function validateLabel(input) {
  if (!input) {
    return { valid: false, reason: "empty" };
  }
  const label = input.toLowerCase().trim();
  if (label.length < 4) {
    return { valid: false, reason: "too_short" };
  }
  if (label.length > 63) {
    return { valid: false, reason: "too_long" };
  }
  if (!VALID_LABEL_REGEX.test(label)) {
    return { valid: false, reason: "invalid_chars" };
  }
  if (SYSTEM_RESERVED.has(label)) {
    return { valid: false, reason: "reserved" };
  }
  return { valid: true, normalized: label };
}
__name(validateLabel, "validateLabel");
function normalizePkpAddress(address) {
  if (!address)
    return null;
  const addr = address.toLowerCase().trim();
  if (!/^0x[a-f0-9]{40}$/.test(addr))
    return null;
  return addr;
}
__name(normalizePkpAddress, "normalizePkpAddress");
app4.get("/dns/resolve", async (c) => {
  const authHeader = c.req.header("Authorization") ?? "";
  const secret = c.env.DNS_SHARED_SECRET;
  if (!secret) {
    if (c.env.ENVIRONMENT !== "development") {
      console.error("[DNS Resolve] DNS_SHARED_SECRET not set in non-dev environment!");
      return c.json({ error: "Server misconfiguration" }, 500);
    }
    console.warn("[DNS Resolve] DNS_SHARED_SECRET not set - allowing unauthenticated access in dev");
  } else if (authHeader !== `Bearer ${secret}`) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const label = c.req.query("label");
  const tld = c.req.query("tld") || "heaven";
  if (tld !== "heaven") {
    return c.json({ error: "Unsupported TLD" }, 400);
  }
  if (!label) {
    return c.json({ error: "Missing label parameter" }, 400);
  }
  const validation = validateLabel(label);
  if (!validation.valid) {
    const response2 = {
      tld,
      label,
      status: validation.reason === "reserved" ? "reserved" : "unregistered",
      ttl_positive: TTL_POSITIVE,
      ttl_negative: TTL_NEGATIVE
    };
    return c.json(response2);
  }
  const normalizedLabel = validation.normalized;
  const reserved = await c.env.DB.prepare(
    "SELECT label FROM heaven_reserved WHERE label = ?"
  ).bind(normalizedLabel).first();
  if (reserved) {
    const response2 = {
      tld,
      label: normalizedLabel,
      status: "reserved",
      ttl_positive: TTL_POSITIVE,
      ttl_negative: TTL_NEGATIVE
    };
    return c.json(response2);
  }
  const row = await c.env.DB.prepare(
    "SELECT * FROM heaven_names WHERE label = ?"
  ).bind(normalizedLabel).first();
  const now = Math.floor(Date.now() / 1e3);
  if (!row) {
    const response2 = {
      tld,
      label: normalizedLabel,
      status: "unregistered",
      ttl_positive: TTL_POSITIVE,
      ttl_negative: TTL_NEGATIVE
    };
    return c.json(response2);
  }
  if (now > row.grace_ends_at) {
    const response2 = {
      tld,
      label: normalizedLabel,
      status: "unregistered",
      ttl_positive: TTL_POSITIVE,
      ttl_negative: TTL_NEGATIVE
    };
    return c.json(response2);
  }
  if (now > row.expires_at) {
    const response2 = {
      tld,
      label: normalizedLabel,
      status: "expired",
      expires_at: row.expires_at,
      ttl_positive: TTL_POSITIVE,
      ttl_negative: TTL_NEGATIVE
    };
    return c.json(response2);
  }
  const txtRecord = `pkp=${row.pkp_address}${row.profile_cid ? `;cid=${row.profile_cid}` : ""};v=1`;
  const response = {
    tld,
    label: normalizedLabel,
    status: "active",
    records: {
      A: [GATEWAY_IP],
      AAAA: [],
      // No IPv6 for now
      TXT: [txtRecord]
    },
    ttl_positive: TTL_POSITIVE,
    ttl_negative: TTL_NEGATIVE,
    expires_at: row.expires_at
  };
  return c.json(response);
});
app4.get("/available/:label", async (c) => {
  const label = c.req.param("label");
  const validation = validateLabel(label);
  if (!validation.valid) {
    const response = {
      available: false,
      reason: validation.reason
    };
    return c.json(response);
  }
  const normalizedLabel = validation.normalized;
  const reserved = await c.env.DB.prepare(
    "SELECT label FROM heaven_reserved WHERE label = ?"
  ).bind(normalizedLabel).first();
  if (reserved) {
    return c.json({ available: false, reason: "reserved" });
  }
  const row = await c.env.DB.prepare(
    "SELECT expires_at, grace_ends_at FROM heaven_names WHERE label = ?"
  ).bind(normalizedLabel).first();
  if (!row) {
    return c.json({ available: true });
  }
  const now = Math.floor(Date.now() / 1e3);
  if (now > row.grace_ends_at) {
    return c.json({ available: true });
  }
  if (now > row.expires_at) {
    return c.json({ available: false, reason: "expired_grace" });
  }
  return c.json({ available: false, reason: "taken" });
});
app4.get("/reverse/:pkp", async (c) => {
  const pkpParam = c.req.param("pkp");
  const pkp = normalizePkpAddress(pkpParam);
  if (!pkp) {
    return c.json({ error: "Invalid PKP address" }, 400);
  }
  const row = await c.env.DB.prepare(
    "SELECT label, label_display, expires_at, grace_ends_at FROM heaven_names WHERE pkp_address = ? ORDER BY registered_at DESC LIMIT 1"
  ).bind(pkp).first();
  if (!row) {
    return c.json({ error: "No name found for this PKP" }, 404);
  }
  const now = Math.floor(Date.now() / 1e3);
  if (now > row.grace_ends_at) {
    return c.json({ error: "No active name found for this PKP" }, 404);
  }
  const response = {
    label: row.label,
    label_display: row.label_display,
    expires_at: row.expires_at,
    status: now > row.expires_at ? "expired" : "active"
  };
  return c.json(response);
});
app4.get("/:label", async (c) => {
  const label = c.req.param("label");
  const validation = validateLabel(label);
  if (!validation.valid) {
    return c.json({ error: `Invalid label: ${validation.reason}` }, 400);
  }
  const normalizedLabel = validation.normalized;
  const row = await c.env.DB.prepare(
    "SELECT * FROM heaven_names WHERE label = ?"
  ).bind(normalizedLabel).first();
  if (!row) {
    return c.json({ error: "Name not found" }, 404);
  }
  const now = Math.floor(Date.now() / 1e3);
  if (now > row.grace_ends_at) {
    return c.json({ error: "Name not found" }, 404);
  }
  const response = {
    label: row.label,
    label_display: row.label_display,
    pkp_address: row.pkp_address,
    status: now > row.expires_at ? "expired" : "active",
    registered_at: row.registered_at,
    expires_at: row.expires_at,
    profile_cid: row.profile_cid
  };
  return c.json(response);
});
function buildHeavenMessage(params) {
  const lines = [
    "heaven-registry:v1",
    `action=${params.action}`,
    "tld=heaven",
    `label=${params.label}`,
    `pkp=${params.pkp}`,
    `nonce=${params.nonce}`,
    `issued_at=${params.issuedAt}`,
    `expires_at=${params.expiresAt}`
  ];
  if (params.action === "register" || params.action === "update") {
    lines.push(`profile_cid=${params.profileCid ?? ""}`);
  }
  return lines.join("\n");
}
__name(buildHeavenMessage, "buildHeavenMessage");
async function verifySignature(message, signature, expectedAddress) {
  try {
    const sig = signature.startsWith("0x") ? signature : `0x${signature}`;
    const recovered = await recoverMessageAddress({
      message,
      signature: sig
    });
    return recovered.toLowerCase() === expectedAddress.toLowerCase();
  } catch (err) {
    console.error("[Signature Verification Error]", err);
    return false;
  }
}
__name(verifySignature, "verifySignature");
function validateTimestamp(timestamp, now) {
  if (Math.abs(now - timestamp) > 120) {
    return "Signature timestamp expired or too far in future";
  }
  return null;
}
__name(validateTimestamp, "validateTimestamp");
app4.post("/register", async (c) => {
  const body = await c.req.json();
  const { label, pkpAddress, profileCid, signature, nonce, timestamp } = body;
  if (!nonce || typeof nonce !== "string" || nonce.length < 16 || nonce.length > 128) {
    return c.json({
      success: false,
      error: "Invalid nonce"
    }, 400);
  }
  if (profileCid && (typeof profileCid !== "string" || profileCid.length > 256)) {
    return c.json({
      success: false,
      error: "profileCid too long"
    }, 400);
  }
  const validation = validateLabel(label);
  if (!validation.valid) {
    return c.json({
      success: false,
      error: `Invalid label: ${validation.reason}`
    }, 400);
  }
  const normalizedLabel = validation.normalized;
  const pkp = normalizePkpAddress(pkpAddress);
  if (!pkp) {
    return c.json({
      success: false,
      error: "Invalid PKP address"
    }, 400);
  }
  const now = Math.floor(Date.now() / 1e3);
  const sigExpiresAt = timestamp + 120;
  const timestampError = validateTimestamp(timestamp, now);
  if (timestampError) {
    return c.json({
      success: false,
      error: timestampError
    }, 400);
  }
  const message = buildHeavenMessage({
    action: "register",
    label: normalizedLabel,
    pkp,
    nonce,
    issuedAt: timestamp,
    expiresAt: sigExpiresAt,
    profileCid: profileCid ?? ""
  });
  const validSig = await verifySignature(message, signature, pkp);
  if (!validSig) {
    return c.json({
      success: false,
      error: "Invalid signature"
    }, 401);
  }
  const reserved = await c.env.DB.prepare(
    "SELECT label FROM heaven_reserved WHERE label = ?"
  ).bind(normalizedLabel).first();
  if (reserved) {
    return c.json({
      success: false,
      error: "Name is reserved"
    }, 400);
  }
  const existing = await c.env.DB.prepare(
    "SELECT expires_at, grace_ends_at FROM heaven_names WHERE label = ?"
  ).bind(normalizedLabel).first();
  if (existing && now <= existing.grace_ends_at) {
    return c.json({
      success: false,
      error: now <= existing.expires_at ? "Name is already taken" : "Name is in grace period"
    }, 400);
  }
  const registeredAt = now;
  const expiresAt = now + ONE_YEAR_SECONDS;
  const graceEndsAt = expiresAt + GRACE_PERIOD_SECONDS;
  try {
    const results = await c.env.DB.batch([
      // 1. Insert nonce - will fail with UNIQUE constraint if already exists
      c.env.DB.prepare(
        "INSERT INTO heaven_nonces (nonce, pkp_address, used_at, expires_at, created_at) VALUES (?, ?, ?, ?, ?)"
      ).bind(nonce, pkp, now, now + 300, now),
      // 2. Conditional delete: only if expired past grace (avoids stale read race)
      c.env.DB.prepare(
        "DELETE FROM heaven_names WHERE label = ? AND grace_ends_at < ?"
      ).bind(normalizedLabel, now),
      // 3. Insert new registration
      c.env.DB.prepare(`
        INSERT INTO heaven_names (label, label_display, pkp_address, status, registered_at, expires_at, grace_ends_at, profile_cid, created_at, updated_at)
        VALUES (?, ?, ?, 'active', ?, ?, ?, ?, ?, ?)
      `).bind(
        normalizedLabel,
        label,
        // Keep original case for display
        pkp,
        registeredAt,
        expiresAt,
        graceEndsAt,
        profileCid || null,
        now,
        now
      )
    ]);
    if ((results[2]?.meta?.changes ?? 0) !== 1) {
      return c.json({
        success: false,
        error: "Registration failed unexpectedly"
      }, 500);
    }
    return c.json({
      success: true,
      label: normalizedLabel,
      expires_at: expiresAt
    });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    if (errorMsg.includes("UNIQUE") && errorMsg.includes("heaven_nonces")) {
      return c.json({
        success: false,
        error: "Nonce already used (replay detected)"
      }, 409);
    }
    if (errorMsg.includes("UNIQUE") && errorMsg.includes("heaven_names")) {
      return c.json({
        success: false,
        error: "Name was just taken"
      }, 409);
    }
    console.error("[Register Error]", err);
    return c.json({
      success: false,
      error: "Registration failed"
    }, 500);
  }
});
app4.post("/renew", async (c) => {
  const body = await c.req.json();
  const { label, signature, nonce, timestamp } = body;
  if (!nonce || typeof nonce !== "string" || nonce.length < 16 || nonce.length > 128) {
    return c.json({ success: false, error: "Invalid nonce" }, 400);
  }
  const validation = validateLabel(label);
  if (!validation.valid) {
    return c.json({ success: false, error: `Invalid label: ${validation.reason}` }, 400);
  }
  const normalizedLabel = validation.normalized;
  const row = await c.env.DB.prepare(
    "SELECT * FROM heaven_names WHERE label = ?"
  ).bind(normalizedLabel).first();
  if (!row) {
    return c.json({ success: false, error: "Name not found" }, 404);
  }
  const now = Math.floor(Date.now() / 1e3);
  if (now > row.grace_ends_at) {
    return c.json({ success: false, error: "Name has expired and passed grace period" }, 400);
  }
  const sigExpiresAt = timestamp + 120;
  const timestampError = validateTimestamp(timestamp, now);
  if (timestampError) {
    return c.json({ success: false, error: timestampError }, 400);
  }
  const message = buildHeavenMessage({
    action: "renew",
    label: normalizedLabel,
    pkp: row.pkp_address,
    nonce,
    issuedAt: timestamp,
    expiresAt: sigExpiresAt
  });
  const validSig = await verifySignature(message, signature, row.pkp_address);
  if (!validSig) {
    return c.json({ success: false, error: "Invalid signature" }, 401);
  }
  const baseTime = now > row.expires_at ? now : row.expires_at;
  const newExpiresAt = baseTime + ONE_YEAR_SECONDS;
  const newGraceEndsAt = newExpiresAt + GRACE_PERIOD_SECONDS;
  try {
    const results = await c.env.DB.batch([
      // 1. Insert nonce - will fail with UNIQUE constraint if already exists
      c.env.DB.prepare(
        "INSERT INTO heaven_nonces (nonce, pkp_address, used_at, expires_at, created_at) VALUES (?, ?, ?, ?, ?)"
      ).bind(nonce, row.pkp_address, now, now + 300, now),
      // 2. Update registration
      c.env.DB.prepare(`
        UPDATE heaven_names
        SET expires_at = ?, grace_ends_at = ?, status = 'active', updated_at = ?
        WHERE label = ?
      `).bind(newExpiresAt, newGraceEndsAt, now, normalizedLabel)
    ]);
    if ((results[1]?.meta?.changes ?? 0) !== 1) {
      return c.json({ success: false, error: "Name not found or not updated" }, 409);
    }
    return c.json({ success: true, expires_at: newExpiresAt });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    if (errorMsg.includes("UNIQUE") && errorMsg.includes("heaven_nonces")) {
      return c.json({ success: false, error: "Nonce already used (replay detected)" }, 409);
    }
    console.error("[Renew Error]", err);
    return c.json({ success: false, error: "Renewal failed" }, 500);
  }
});
app4.post("/update", async (c) => {
  const body = await c.req.json();
  const { label, profileCid, signature, nonce, timestamp } = body;
  if (!nonce || typeof nonce !== "string" || nonce.length < 16 || nonce.length > 128) {
    return c.json({ success: false, error: "Invalid nonce" }, 400);
  }
  if (profileCid && (typeof profileCid !== "string" || profileCid.length > 256)) {
    return c.json({ success: false, error: "profileCid too long" }, 400);
  }
  const validation = validateLabel(label);
  if (!validation.valid) {
    return c.json({ success: false, error: `Invalid label: ${validation.reason}` }, 400);
  }
  const normalizedLabel = validation.normalized;
  const row = await c.env.DB.prepare(
    "SELECT * FROM heaven_names WHERE label = ?"
  ).bind(normalizedLabel).first();
  if (!row) {
    return c.json({ success: false, error: "Name not found" }, 404);
  }
  const now = Math.floor(Date.now() / 1e3);
  if (now > row.expires_at) {
    return c.json({ success: false, error: "Name has expired" }, 400);
  }
  const sigExpiresAt = timestamp + 120;
  const timestampError = validateTimestamp(timestamp, now);
  if (timestampError) {
    return c.json({ success: false, error: timestampError }, 400);
  }
  const message = buildHeavenMessage({
    action: "update",
    label: normalizedLabel,
    pkp: row.pkp_address,
    nonce,
    issuedAt: timestamp,
    expiresAt: sigExpiresAt,
    profileCid
  });
  const validSig = await verifySignature(message, signature, row.pkp_address);
  if (!validSig) {
    return c.json({ success: false, error: "Invalid signature" }, 401);
  }
  try {
    const results = await c.env.DB.batch([
      // 1. Insert nonce - will fail with UNIQUE constraint if already exists
      c.env.DB.prepare(
        "INSERT INTO heaven_nonces (nonce, pkp_address, used_at, expires_at, created_at) VALUES (?, ?, ?, ?, ?)"
      ).bind(nonce, row.pkp_address, now, now + 300, now),
      // 2. Update profile CID
      c.env.DB.prepare(`
        UPDATE heaven_names SET profile_cid = ?, updated_at = ? WHERE label = ?
      `).bind(profileCid, now, normalizedLabel)
    ]);
    if ((results[1]?.meta?.changes ?? 0) !== 1) {
      return c.json({ success: false, error: "Name not found or not updated" }, 409);
    }
    return c.json({ success: true });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    if (errorMsg.includes("UNIQUE") && errorMsg.includes("heaven_nonces")) {
      return c.json({ success: false, error: "Nonce already used (replay detected)" }, 409);
    }
    console.error("[Update Error]", err);
    return c.json({ success: false, error: "Update failed" }, 500);
  }
});
var names_default = app4;

// src/index.ts
var app5 = new Hono2();
app5.use("/*", cors({
  origin: ["http://localhost:3000", "http://localhost:5173", "http://localhost:4173", "https://heaven.computer"],
  allowMethods: ["GET", "POST", "OPTIONS"],
  allowHeaders: ["Content-Type"]
}));
app5.get("/health", (c) => c.json({ ok: true }));
app5.route("/api/candidates", candidates_default);
app5.route("/api/likes", likes_default);
app5.route("/api/claim", claim_default);
app5.route("/api/names", names_default);
app5.notFound((c) => c.json({ error: "Not found" }, 404));
app5.onError((err, c) => {
  console.error("[API Error]", err);
  return c.json({ error: "Internal server error" }, 500);
});
var src_default = app5;

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-o2ZIT0/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// node_modules/wrangler/templates/middleware/common.ts
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-o2ZIT0/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof __Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
__name(__Facade_ScheduledController__, "__Facade_ScheduledController__");
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = (request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    };
    #dispatcher = (type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    };
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
/*! Bundled license information:

@noble/hashes/esm/utils.js:
  (*! noble-hashes - MIT License (c) 2022 Paul Miller (paulmillr.com) *)

@noble/curves/esm/abstract/utils.js:
  (*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) *)

@noble/curves/esm/abstract/modular.js:
  (*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) *)

@noble/curves/esm/abstract/curve.js:
  (*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) *)

@noble/curves/esm/abstract/weierstrass.js:
  (*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) *)

@noble/curves/esm/_shortw_utils.js:
  (*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) *)

@noble/curves/esm/secp256k1.js:
  (*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) *)
*/
//# sourceMappingURL=index.js.map
