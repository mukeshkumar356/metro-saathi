/**
 * Delhi Metro App Icon Generator
 * Creates proper PNG icon files for all Android density folders
 * Design: Red background, white circle, bold red "M" letter
 */
const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

// ─── CRC32 for PNG ───────────────────────────────────────────
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

function buildPNG(w, h, pixels /* Uint8Array RGBA */) {
  const rowBytes = 1 + w * 4;
  const raw = Buffer.alloc(h * rowBytes);
  for (let y = 0; y < h; y++) {
    raw[y * rowBytes] = 0; // filter: None
    for (let x = 0; x < w; x++) {
      const si = (y * w + x) * 4;
      const di = y * rowBytes + 1 + x * 4;
      raw[di]     = pixels[si];
      raw[di + 1] = pixels[si + 1];
      raw[di + 2] = pixels[si + 2];
      raw[di + 3] = pixels[si + 3];
    }
  }
  const compressed = zlib.deflateSync(raw, { level: 9 });
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', compressed),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

// ─── Icon pixel drawing ──────────────────────────────────────
// Returns true if (tx, ty) falls inside the "M" letter shape
// tx, ty are in normalized coords, center = (0,0), range -1..1
function insideM(tx, ty) {
  // M bounding box: tx in [-0.52, 0.52], ty in [-0.36, 0.36]
  if (tx < -0.52 || tx > 0.52 || ty < -0.36 || ty > 0.36) return false;

  const BAR_W = 0.155; // half-width of vertical bars
  const STR_W = 0.13;  // half-width of diagonal strokes
  const LCX   = 0.38;  // center-x of vertical bars (±)
  const TOP   = -0.36;
  const MID   =  0.00; // where the V meets
  const BOT   =  0.36;

  // Left vertical bar
  if (tx >= -(LCX + BAR_W) && tx <= -(LCX - BAR_W) && ty >= TOP && ty <= BOT) return true;
  // Right vertical bar
  if (tx >= (LCX - BAR_W)  && tx <= (LCX + BAR_W)  && ty >= TOP && ty <= BOT) return true;

  // Left diagonal stroke: from top-inside of left bar → center
  if (ty >= TOP && ty <= MID) {
    const frac = (ty - TOP) / (MID - TOP);     // 0 at top, 1 at mid
    const ctrX = -(LCX - BAR_W) * (1 - frac); // from -(LCX-BAR_W) to 0
    if (Math.abs(tx - ctrX) <= STR_W) return true;
  }

  // Right diagonal stroke: from top-inside of right bar → center
  if (ty >= TOP && ty <= MID) {
    const frac = (ty - TOP) / (MID - TOP);
    const ctrX = (LCX - BAR_W) * (1 - frac);  // from (LCX-BAR_W) to 0
    if (Math.abs(tx - ctrX) <= STR_W) return true;
  }

  return false;
}

function smoothstep(edge0, edge1, x) {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function generateIconPixels(size, round) {
  const pixels = new Uint8Array(size * size * 4);
  const cx = (size - 1) / 2, cy = (size - 1) / 2;
  const r = size / 2;

  // Colors
  const RED   = [198, 40,  40];
  const WHITE = [255, 255, 255];

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const dx = x - cx, dy = y - cy;
      const d  = Math.sqrt(dx * dx + dy * dy);

      // Normalized coords relative to center (-1..1)
      const tx = dx / r, ty = dy / r;

      // Alpha: for round icons use anti-aliased circle, otherwise full square
      let alpha;
      if (round) {
        alpha = Math.round((1 - smoothstep(r * 0.92, r, d)) * 255);
      } else {
        alpha = 255;
      }

      if (alpha === 0) {
        pixels[idx + 3] = 0;
        continue;
      }

      // Layer 1: red outer fill
      let R = RED[0], G = RED[1], B = RED[2];

      // Layer 2: white inner circle (r * 0.84)
      if (d < r * 0.84) {
        R = WHITE[0]; G = WHITE[1]; B = WHITE[2];

        // Layer 3: red "M" on white circle
        if (insideM(tx, ty)) {
          R = RED[0]; G = RED[1]; B = RED[2];
        }
      }

      // Thin red ring between 0.84 and 0.88 — adds a nice framing border
      if (d >= r * 0.84 && d <= r * 0.88) {
        R = RED[0]; G = RED[1]; B = RED[2];
      }

      pixels[idx]     = R;
      pixels[idx + 1] = G;
      pixels[idx + 2] = B;
      pixels[idx + 3] = alpha;
    }
  }
  return pixels;
}

// ─── Generate all sizes ──────────────────────────────────────
const SIZES = {
  'mipmap-mdpi':    48,
  'mipmap-hdpi':    72,
  'mipmap-xhdpi':   96,
  'mipmap-xxhdpi':  144,
  'mipmap-xxxhdpi': 192,
};

const RES = path.join(__dirname, 'android', 'app', 'src', 'main', 'res');

for (const [folder, size] of Object.entries(SIZES)) {
  const outDir = path.join(RES, folder);
  if (!fs.existsSync(outDir)) { console.warn(`Skip (missing): ${folder}`); continue; }

  const squarePx = generateIconPixels(size, false);
  const roundPx  = generateIconPixels(size, true);

  fs.writeFileSync(path.join(outDir, 'ic_launcher.png'),       buildPNG(size, size, squarePx));
  fs.writeFileSync(path.join(outDir, 'ic_launcher_round.png'), buildPNG(size, size, roundPx));
  console.log(`✓  ${folder}  (${size}×${size}px)`);
}

console.log('\n✅  All icons generated successfully!');
