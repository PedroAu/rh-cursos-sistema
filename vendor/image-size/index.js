"use strict";

const MAX_INPUT_BYTES = 16 * 1024 * 1024;
const MAX_JPEG_SEGMENTS = 1024;

function toBytes(input) {
  if (input instanceof Uint8Array) return input;
  if (input instanceof ArrayBuffer) return new Uint8Array(input);
  throw new TypeError("imageSize expects a Uint8Array or ArrayBuffer");
}

function dimensions(width, height, type) {
  if (!Number.isSafeInteger(width) || !Number.isSafeInteger(height) || width <= 0 || height <= 0) {
    throw new Error("Invalid image dimensions");
  }
  return { width, height, type };
}

function readUInt32BE(bytes, offset) {
  return (bytes[offset] * 0x1000000) + ((bytes[offset + 1] << 16) | (bytes[offset + 2] << 8) | bytes[offset + 3]);
}

function readUInt32LE(bytes, offset) {
  return bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16) | (bytes[offset + 3] * 0x1000000);
}

function readInt32LE(bytes, offset) {
  const value = readUInt32LE(bytes, offset);
  return value > 0x7fffffff ? value - 0x100000000 : value;
}

function jpegDimensions(bytes) {
  let offset = 2;
  let segments = 0;

  while (offset + 3 < bytes.length && segments++ < MAX_JPEG_SEGMENTS) {
    while (offset < bytes.length && bytes[offset] === 0xff) offset += 1;
    if (offset >= bytes.length) break;

    const marker = bytes[offset++];
    if (marker === 0xd8 || marker === 0xd9) continue;
    if (marker === 0xda) break;
    if (marker >= 0xd0 && marker <= 0xd7) continue;
    if (offset + 1 >= bytes.length) break;

    const segmentLength = (bytes[offset] << 8) | bytes[offset + 1];
    if (segmentLength < 2 || offset + segmentLength > bytes.length) break;

    const isStartOfFrame = (marker >= 0xc0 && marker <= 0xc3) ||
      (marker >= 0xc5 && marker <= 0xc7) ||
      (marker >= 0xc9 && marker <= 0xcb) ||
      (marker >= 0xcd && marker <= 0xcf);
    if (isStartOfFrame && segmentLength >= 7) {
      return dimensions(
        (bytes[offset + 3] << 8) | bytes[offset + 4],
        (bytes[offset + 5] << 8) | bytes[offset + 6],
        "jpg"
      );
    }
    offset += segmentLength;
  }

  throw new Error("Could not determine JPEG dimensions");
}

function webpDimensions(bytes) {
  if (bytes.length < 25) throw new Error("Invalid WebP image");
  const chunk = String.fromCharCode(bytes[12], bytes[13], bytes[14], bytes[15]);

  if (chunk === "VP8X") {
    if (bytes.length < 30) throw new Error("Invalid WebP extended image");
    return dimensions(
      1 + bytes[24] + (bytes[25] << 8) + (bytes[26] << 16),
      1 + bytes[27] + (bytes[28] << 8) + (bytes[29] << 16),
      "webp"
    );
  }

  if (chunk === "VP8 ") {
    for (let offset = 20; offset + 9 < bytes.length; offset += 1) {
      if (bytes[offset] === 0x9d && bytes[offset + 1] === 0x01 && bytes[offset + 2] === 0x2a) {
        return dimensions((bytes[offset + 3] | (bytes[offset + 4] << 8)) & 0x3fff, (bytes[offset + 5] | (bytes[offset + 6] << 8)) & 0x3fff, "webp");
      }
    }
  }

  if (chunk === "VP8L" && bytes[20] === 0x2f) {
    const header = readUInt32LE(bytes, 21);
    return dimensions(1 + (header & 0x3fff), 1 + ((header >>> 14) & 0x3fff), "webp");
  }

  throw new Error("Unsupported or invalid WebP image");
}

function svgDimensions(bytes) {
  const text = new TextDecoder().decode(bytes.subarray(0, Math.min(bytes.length, 1024 * 1024)));
  const viewBox = text.match(/\bviewBox\s*=\s*["']\s*[-+]?\d+(?:\.\d+)?\s+[-+]?\d+(?:\.\d+)?\s+([\d.]+)\s+([\d.]+)\s*["']/i);
  const width = text.match(/\bwidth\s*=\s*["']\s*([\d.]+)(?:px)?\s*["']/i);
  const height = text.match(/\bheight\s*=\s*["']\s*([\d.]+)(?:px)?\s*["']/i);
  if (width && height) return dimensions(Number(width[1]), Number(height[1]), "svg");
  if (viewBox) return dimensions(Number(viewBox[1]), Number(viewBox[2]), "svg");
  throw new Error("Could not determine SVG dimensions");
}

function imageSize(input) {
  const bytes = toBytes(input);
  if (bytes.byteLength > MAX_INPUT_BYTES) throw new Error("Image exceeds the safe size limit");

  if (bytes.length >= 24 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    return dimensions(readUInt32BE(bytes, 16), readUInt32BE(bytes, 20), "png");
  }
  if (bytes.length >= 10 && bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) {
    return dimensions(bytes[6] | (bytes[7] << 8), bytes[8] | (bytes[9] << 8), "gif");
  }
  if (bytes.length >= 26 && bytes[0] === 0x42 && bytes[1] === 0x4d) {
    return dimensions(Math.abs(readInt32LE(bytes, 18)), Math.abs(readInt32LE(bytes, 22)), "bmp");
  }
  if (bytes.length >= 25 && bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) {
    return webpDimensions(bytes);
  }
  if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xd8) return jpegDimensions(bytes);
  if (bytes.length >= 8 && bytes[0] === 0 && bytes[1] === 0 && bytes[2] === 1 && bytes[3] === 0) {
    const width = bytes[6] || 256;
    const height = bytes[7] || 256;
    return dimensions(width, height, "ico");
  }
  if (bytes.length >= 5 && String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3], bytes[4]).toLowerCase() === "<?xml" || String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3]).toLowerCase() === "<svg") {
    return svgDimensions(bytes);
  }
  throw new Error("Unsupported image format");
}

module.exports = { imageSize };
