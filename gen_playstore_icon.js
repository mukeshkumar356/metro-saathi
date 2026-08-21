/**
 * Generates the 512x512 Play Store listing icon (square, opaque, 32-bit PNG)
 * Reuses the exact same drawing logic as generate_icon.js
 */
const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    t[i] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}

function pngChunk(type, data) {
  const t = Buffer.from(type, 'ascii');
  const d = Buffer.isBuffer(data) ? data : Buffer.from(data);
  const len = Buffer.alloc(4);
  len.writeUInt32BE(d.length, 0);
  const crcVal = crc32(Buffer.concat([t, d]));
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crcVal, 0);
  return Buffer.concat([len, t, d, crc]);
}

function buildPNG(w, h, pixels) {
  const rowBytes = 1 + w * 4;
  const raw = Buffer.alloc(h * rowBytes);
  for (let y = 0; y < h; y++) {
    raw[y * rowBytes] = 0;
    for (let x = 0; x < w; x++) {
      const si = (y * w + x) * 4;
      const di = y * rowBytes + 1 + x * 4;
      raw[di] = pixels[si]; raw[di + 1] = pixels[si + 1];
      raw[di + 2] = pixels[si + 2]; raw[di + 3] = pixels[si + 3];
    }
  }
  const compressed = zlib.deflateSync(raw, { level: 9 });
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk('IHDR', ihdr), pngChunk('IDAT', compressed), pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

function insideM(tx, ty) {
  if (tx < -0.52 || tx > 0.52 || ty < -0.36 || ty > 0.36) return false;
  const BAR_W = 0.155, STR_W = 0.13, LCX = 0.38, TOP = -0.36, MID = 0.00, BOT = 0.36;
  if (tx >= -(LCX + BAR_W) && tx <= -(LCX - BAR_W) && ty >= TOP && ty <= BOT) return true;
  if (tx >= (LCX - BAR_W) && tx <= (LCX + BAR_W) && ty >= TOP && ty <= BOT) return true;
  if (ty >= TOP && ty <= MID) {
    const frac = (ty - TOP) / (MID - TOP);
    const ctrX = -(LCX - BAR_W) * (1 - frac);
    if (Math.abs(tx - ctrX) <= STR_W) return true;
  }
  if (ty >= TOP && ty <= MID) {
    const frac = (ty - TOP) / (MID - TOP);
    const ctrX = (LCX - BAR_W) * (1 - frac);
    if (Math.abs(tx - ctrX) <= STR_W) return true;
  }
  return false;
}

function generateIconPixels(size, round) {
  const pixels = new Uint8Array(size * size * 4);
  const cx = (size - 1) / 2, cy = (size - 1) / 2;
  const r = size / 2;
  const RED = [198, 40, 40], WHITE = [255, 255, 255];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const dx = x - cx, dy = y - cy;
      const d = Math.sqrt(dx * dx + dy * dy);
      const tx = dx / r, ty = dy / r;
      let alpha = round ? Math.round((1 - Math.max(0, Math.min(1, (d - r * 0.92) / (r - r * 0.92))) ** 2 * (3 - 2 * Math.max(0, Math.min(1, (d - r * 0.92) / (r - r * 0.92))))) * 255) : 255;
      if (alpha === 0) { pixels[idx + 3] = 0; continue; }
      let R = RED[0], G = RED[1], B = RED[2];
      if (d < r * 0.84) {
        R = WHITE[0]; G = WHITE[1]; B = WHITE[2];
        if (insideM(tx, ty)) { R = RED[0]; G = RED[1]; B = RED[2]; }
      }
      if (d >= r * 0.84 && d <= r * 0.88) { R = RED[0]; G = RED[1]; B = RED[2]; }
      pixels[idx] = R; pixels[idx + 1] = G; pixels[idx + 2] = B; pixels[idx + 3] = alpha;
    }
  }
  return pixels;
}

const outPath = 'C:\\Users\\Greenmounts\\OneDrive\\Desktop\\Metro Saathi (Final)\\app_icon_512.png';
const pixels = generateIconPixels(512, false); // square, full-bleed, opaque — Play Store spec
fs.writeFileSync(outPath, buildPNG(512, 512, pixels));
console.log('Saved:', outPath);
