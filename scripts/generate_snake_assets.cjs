const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Output directories
const outDirs = [
  path.join(__dirname, '../public/assets/snakes'),
  path.join(__dirname, '../public/assets/Snake.io assets for snakes'),
];

for (const dir of outDirs) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Low-level pure Node.js PNG encoder
function createPngBuffer(width, height, pixelFunc) {
  const rowSize = width * 4 + 1;
  const rawData = Buffer.alloc(height * rowSize);

  for (let y = 0; y < height; y++) {
    rawData[y * rowSize] = 0; // Filter: None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = pixelFunc(x, y, width, height);
      const offset = y * rowSize + 1 + x * 4;
      rawData[offset] = Math.max(0, Math.min(255, Math.round(r)));
      rawData[offset + 1] = Math.max(0, Math.min(255, Math.round(g)));
      rawData[offset + 2] = Math.max(0, Math.min(255, Math.round(b)));
      rawData[offset + 3] = Math.max(0, Math.min(255, Math.round(a)));
    }
  }

  const deflated = zlib.deflateSync(rawData);

  function makeChunk(type, data) {
    const lenBuf = Buffer.alloc(4);
    lenBuf.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type);
    const crcBuf = Buffer.alloc(4);
    const crcVal = zlib.crc32(Buffer.concat([typeBuf, data]));
    crcBuf.writeUInt32BE(crcVal, 0);
    return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
  }

  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8 bits per channel
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return Buffer.concat([
    signature,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', deflated),
    makeChunk('IEND', Buffer.alloc(0)),
  ]);
}

function dist(x1, y1, x2, y2) {
  return Math.hypot(x1 - x2, y1 - y2);
}

// 1. ROBOT / MECHA TITAN SNAKE HEAD (256x256)
function robotPixel(x, y, w, h) {
  const cx = w / 2;
  const cy = h / 2;
  const dx = (x - cx) / (w / 2);
  const dy = (y - cy) / (h / 2);

  // Antenna 1 & 2 beacon tips
  if (dist(x, y, cx - 52, cy - 90) < 14) return [239, 68, 68, 255];
  if (dist(x, y, cx + 52, cy - 90) < 14) return [239, 68, 68, 255];

  // Antenna poles
  if (Math.abs(x - (cx - 52) - (cy - 90 - y) * 0.2) < 4 && y > cy - 90 && y < cy - 20) return [148, 163, 184, 255];
  if (Math.abs(x - (cx + 52) + (cy - 90 - y) * 0.2) < 4 && y > cy - 90 && y < cy - 20) return [148, 163, 184, 255];

  // Main chassis polygon boundary (wedge skull)
  const headDist = Math.hypot(dx * 1.05, (dy + 0.05) * 1.15);
  if (headDist > 0.85) return [0, 0, 0, 0];

  // Neon cyan glow border
  if (headDist > 0.76) return [56, 189, 248, 245];

  // Optic visor
  if (dy > -0.08 && dy < 0.16 && Math.abs(dx) < 0.6) {
    if (dy > 0.0 && dy < 0.08 && Math.abs(dx) < 0.38) return [255, 255, 255, 255];
    return [6, 182, 212, 255];
  }

  // Titanium armor seam lines
  if (Math.abs(dy - 0.35) < 0.03 && Math.abs(dx) < 0.6) return [14, 165, 233, 220];
  if (Math.abs(dy + 0.35) < 0.03 && Math.abs(dx) < 0.55) return [14, 165, 233, 220];
  if (Math.abs(dx) < 0.025 && dy > -0.6 && dy < 0.6) return [14, 165, 233, 190];

  // Screws/rivets
  if (dist(x, y, cx - 55, cy - 45) < 5 || dist(x, y, cx + 55, cy - 45) < 5) return [248, 250, 252, 255];
  if (dist(x, y, cx - 50, cy + 55) < 5 || dist(x, y, cx + 50, cy + 55) < 5) return [248, 250, 252, 255];

  const grad = Math.max(0, 1 - headDist);
  return [24 + grad * 35, 38 + grad * 50, 64 + grad * 80, 255];
}

// 2. DRAGON SNAKE HEAD (256x256)
function dragonPixel(x, y, w, h) {
  const cx = w / 2;
  const cy = h / 2;
  const dx = (x - cx) / (w / 2);
  const dy = (y - cy) / (h / 2);

  // Curved horns
  const leftHorn = Math.hypot(dx + 0.45 + dy * 0.3, dy + 0.55);
  const rightHorn = Math.hypot(dx - 0.45 - dy * 0.3, dy + 0.55);
  if (leftHorn < 0.22 && dy < -0.2) return [245, 158, 11, 255];
  if (rightHorn < 0.22 && dy < -0.2) return [245, 158, 11, 255];

  // Whiskers
  if (dy > 0.4 && dy < 0.85) {
    if (Math.abs(dx - (dy - 0.4) * 0.8) < 0.04) return [250, 204, 21, 255];
    if (Math.abs(dx + (dy - 0.4) * 0.8) < 0.04) return [250, 204, 21, 255];
  }

  const headDist = Math.hypot(dx * 1.1, (dy + 0.05) * 1.2);
  if (headDist > 0.82) return [0, 0, 0, 0];
  if (headDist > 0.74) return [249, 115, 22, 240];

  // Eyes
  if (Math.hypot(dx + 0.26, dy - 0.05) < 0.1) {
    if (Math.hypot(dx + 0.26, dy - 0.05) < 0.04) return [255, 255, 255, 255];
    return [250, 204, 21, 255];
  }
  if (Math.hypot(dx - 0.26, dy - 0.05) < 0.1) {
    if (Math.hypot(dx - 0.26, dy - 0.05) < 0.04) return [255, 255, 255, 255];
    return [250, 204, 21, 255];
  }

  // Flame crest
  if (Math.abs(dx) < 0.12 && dy < 0.1 && dy > -0.6) return [251, 191, 36, 240];

  const grad = Math.max(0, 1 - headDist);
  return [160 + grad * 80, 25 + grad * 40, 15, 255];
}

// 3. CYBER GLITCH VIPER HEAD (256x256)
function cyberPixel(x, y, w, h) {
  const cx = w / 2;
  const cy = h / 2;
  const dx = (x - cx) / (w / 2);
  const dy = (y - cy) / (h / 2);

  // Digital glitch floating pixels
  if (dx < -0.65 && dx > -0.85 && Math.abs(dy - 0.3) < 0.05) return [6, 182, 212, 255];
  if (dx > 0.65 && dx < 0.85 && Math.abs(dy + 0.2) < 0.05) return [236, 72, 153, 255];

  const headDist = Math.hypot(dx * 1.05, (dy + 0.05) * 1.15);
  if (headDist > 0.82) return [0, 0, 0, 0];
  if (headDist > 0.74) return dx < 0 ? [6, 182, 212, 255] : [236, 72, 153, 255];

  // Neon dual visor
  if (dy > 0.02 && dy < 0.22 && Math.abs(dx) < 0.52) {
    if (dy > 0.08 && dy < 0.16) return [255, 255, 255, 255];
    return dx < 0 ? [34, 211, 238, 255] : [244, 114, 182, 255];
  }

  // Circuits
  if (Math.abs(Math.abs(dx) - 0.28) < 0.03 && dy > -0.5 && dy < 0.5) {
    return dx < 0 ? [6, 182, 212, 200] : [236, 72, 153, 200];
  }

  const grad = Math.max(0, 1 - headDist);
  return [40 + grad * 40, 10 + grad * 20, 75 + grad * 70, 255];
}

// 4. DEVIL SNAKE HEAD (256x256)
function devilPixel(x, y, w, h) {
  const cx = w / 2;
  const cy = h / 2;
  const dx = (x - cx) / (w / 2);
  const dy = (y - cy) / (h / 2);

  const leftHorn = Math.hypot(dx + 0.45 + dy * 0.4, dy + 0.55);
  const rightHorn = Math.hypot(dx - 0.45 - dy * 0.4, dy + 0.55);
  if (leftHorn < 0.24 && dy < -0.15) return [249, 115, 22, 255];
  if (rightHorn < 0.24 && dy < -0.15) return [249, 115, 22, 255];

  const headDist = Math.hypot(dx * 1.1, (dy + 0.05) * 1.2);
  if (headDist > 0.82) return [0, 0, 0, 0];
  if (headDist > 0.74) return [239, 68, 68, 255];

  if (Math.abs(dx) * 1.5 + Math.abs(dy + 0.2) < 0.16) return [249, 115, 22, 255];

  // Eyes
  if (Math.hypot(dx + 0.28, dy - 0.08) < 0.09) {
    if (Math.hypot(dx + 0.28, dy - 0.08) < 0.035) return [255, 255, 255, 255];
    return [250, 204, 21, 255];
  }
  if (Math.hypot(dx - 0.28, dy - 0.08) < 0.09) {
    if (Math.hypot(dx - 0.28, dy - 0.08) < 0.035) return [255, 255, 255, 255];
    return [250, 204, 21, 255];
  }

  // Fangs
  if (dy > 0.6 && dy < 0.78 && (Math.abs(dx - 0.16) < 0.04 || Math.abs(dx + 0.16) < 0.04)) {
    return [255, 255, 255, 255];
  }

  const grad = Math.max(0, 1 - headDist);
  return [24 + grad * 40, 10 + grad * 15, 15 + grad * 15, 255];
}

// 5. ANGEL SERAPH SNAKE HEAD (256x256)
function angelPixel(x, y, w, h) {
  const cx = w / 2;
  const cy = h / 2;
  const dx = (x - cx) / (w / 2);
  const dy = (y - cy) / (h / 2);

  // Levitating golden halo
  const haloDist = Math.hypot(dx * 1.0, (dy + 0.65) * 2.8);
  if (haloDist > 0.42 && haloDist < 0.58) {
    if (haloDist > 0.46 && haloDist < 0.54) return [255, 255, 255, 255];
    return [250, 204, 21, 255];
  }

  // Wing frills
  const leftWing = Math.hypot(dx + 0.65, dy + 0.2);
  const rightWing = Math.hypot(dx - 0.65, dy + 0.2);
  if (leftWing < 0.3 && dx < -0.4) return [248, 250, 252, 250];
  if (rightWing < 0.3 && dx > 0.4) return [248, 250, 252, 250];

  const headDist = Math.hypot(dx * 1.08, (dy + 0.05) * 1.18);
  if (headDist > 0.82) return [0, 0, 0, 0];
  if (headDist > 0.74) return [56, 189, 248, 240];

  // Gold spine
  if (Math.abs(dx) < 0.035 && dy > -0.4 && dy < 0.4) return [250, 204, 21, 255];
  if (Math.abs(dy + 0.1) < 0.035 && Math.abs(dx) < 0.22) return [250, 204, 21, 255];

  // Eyes
  if (Math.hypot(dx + 0.26, dy - 0.05) < 0.09) {
    if (Math.hypot(dx + 0.26, dy - 0.05) < 0.035) return [255, 255, 255, 255];
    return [56, 189, 248, 255];
  }
  if (Math.hypot(dx - 0.26, dy - 0.05) < 0.09) {
    if (Math.hypot(dx - 0.26, dy - 0.05) < 0.035) return [255, 255, 255, 255];
    return [56, 189, 248, 255];
  }

  const grad = Math.max(0, 1 - headDist);
  return [230 + grad * 25, 238 + grad * 17, 248 + grad * 7, 255];
}

// 6. VOID SINGULARITY SNAKE HEAD (256x256)
function voidPixel(x, y, w, h) {
  const cx = w / 2;
  const cy = h / 2;
  const dx = (x - cx) / (w / 2);
  const dy = (y - cy) / (h / 2);

  // Accretion disk rings
  const ringDist = Math.hypot(dx, dy);
  if (ringDist > 0.78 && ringDist < 0.92) {
    if (ringDist > 0.82 && ringDist < 0.88) return [192, 132, 252, 220];
    return [168, 85, 247, 140];
  }
  if (ringDist > 0.58 && ringDist < 0.68) return [56, 189, 248, 160];

  const headDist = Math.hypot(dx * 1.05, (dy + 0.05) * 1.15);
  if (headDist > 0.82) return [0, 0, 0, 0];
  if (headDist > 0.72) return [168, 85, 247, 240];

  // Black hole core
  const coreDist = Math.hypot(dx, dy + 0.05);
  if (coreDist < 0.28) {
    if (coreDist < 0.1) return [0, 0, 0, 255];
    if (coreDist > 0.22 && coreDist < 0.26) return [240, 171, 252, 255];
    return [46, 16, 101, 255];
  }

  if (Math.hypot(dx + 0.32, dy - 0.12) < 0.08) {
    if (Math.hypot(dx + 0.32, dy - 0.12) < 0.03) return [255, 255, 255, 255];
    return [232, 121, 249, 255];
  }
  if (Math.hypot(dx - 0.32, dy - 0.12) < 0.08) {
    if (Math.hypot(dx - 0.32, dy - 0.12) < 0.03) return [255, 255, 255, 255];
    return [232, 121, 249, 255];
  }

  const grad = Math.max(0, 1 - headDist);
  return [20 + grad * 25, 8 + grad * 15, 50 + grad * 50, 255];
}

// 7. PHOENIX (Solar Phoenix²)
function phoenixPixel(x, y, w, h) {
  const cx = w / 2;
  const cy = h / 2;
  const dx = (x - cx) / (w / 2);
  const dy = (y - cy) / (h / 2);

  // Solar flare crown feathers
  if (dy < -0.3 && Math.abs(dx) < 0.6) {
    if (Math.hypot(dx, dy + 0.6) < 0.25) return [253, 224, 71, 255]; // Golden solar crest
    if (Math.hypot(dx + 0.35, dy + 0.45) < 0.2) return [249, 115, 22, 255]; // Left flare
    if (Math.hypot(dx - 0.35, dy + 0.45) < 0.2) return [249, 115, 22, 255]; // Right flare
  }

  const headDist = Math.hypot(dx * 1.08, (dy + 0.05) * 1.18);
  if (headDist > 0.82) return [0, 0, 0, 0];
  if (headDist > 0.73) return [234, 88, 12, 255]; // Solar orange rim

  // Fiery golden eyes
  if (Math.hypot(dx + 0.26, dy - 0.06) < 0.09) {
    if (Math.hypot(dx + 0.26, dy - 0.06) < 0.035) return [255, 255, 255, 255];
    return [250, 204, 21, 255];
  }
  if (Math.hypot(dx - 0.26, dy - 0.06) < 0.09) {
    if (Math.hypot(dx - 0.26, dy - 0.06) < 0.035) return [255, 255, 255, 255];
    return [250, 204, 21, 255];
  }

  // Radiant flame body
  const grad = Math.max(0, 1 - headDist);
  return [217 + grad * 38, 70 + grad * 80, 10 + grad * 20, 255];
}

// 8. FROST (Glacial Frost²)
function frostPixel(x, y, w, h) {
  const cx = w / 2;
  const cy = h / 2;
  const dx = (x - cx) / (w / 2);
  const dy = (y - cy) / (h / 2);

  // Sharp glacial horn spikes
  const leftIce = Math.hypot(dx + 0.45, dy + 0.6);
  const rightIce = Math.hypot(dx - 0.45, dy + 0.6);
  if (leftIce < 0.22 && dy < -0.2) return [186, 230, 253, 255];
  if (rightIce < 0.22 && dy < -0.2) return [186, 230, 253, 255];

  const headDist = Math.hypot(dx * 1.08, (dy + 0.05) * 1.18);
  if (headDist > 0.82) return [0, 0, 0, 0];
  if (headDist > 0.74) return [56, 189, 248, 255]; // Ice cyan border

  // Chilling glacial eyes
  if (Math.hypot(dx + 0.27, dy - 0.06) < 0.09) {
    if (Math.hypot(dx + 0.27, dy - 0.06) < 0.035) return [255, 255, 255, 255];
    return [34, 211, 238, 255];
  }
  if (Math.hypot(dx - 0.27, dy - 0.06) < 0.09) {
    if (Math.hypot(dx - 0.27, dy - 0.06) < 0.035) return [255, 255, 255, 255];
    return [34, 211, 238, 255];
  }

  // Ice crystal dorsal line
  if (Math.abs(dx) < 0.04 && dy > -0.5 && dy < 0.5) return [224, 242, 254, 255];

  const grad = Math.max(0, 1 - headDist);
  return [12 + grad * 40, 74 + grad * 90, 110 + grad * 120, 255];
}

// 9. VENOM (Biohazard Venom²)
function venomPixel(x, y, w, h) {
  const cx = w / 2;
  const cy = h / 2;
  const dx = (x - cx) / (w / 2);
  const dy = (y - cy) / (h / 2);

  // Dripping toxic fangs
  if (dy > 0.55 && dy < 0.82 && (Math.abs(dx - 0.2) < 0.05 || Math.abs(dx + 0.2) < 0.05)) {
    return [74, 222, 128, 255];
  }

  const headDist = Math.hypot(dx * 1.1, (dy + 0.05) * 1.2);
  if (headDist > 0.82) return [0, 0, 0, 0];
  if (headDist > 0.73) return [34, 197, 94, 255]; // Bio hazard green

  // Acid slit eyes
  if (Math.hypot(dx + 0.28, dy - 0.08) < 0.09) {
    if (Math.hypot(dx + 0.28, dy - 0.08) < 0.035) return [240, 253, 244, 255];
    return [163, 230, 53, 255];
  }
  if (Math.hypot(dx - 0.28, dy - 0.08) < 0.09) {
    if (Math.hypot(dx - 0.28, dy - 0.08) < 0.035) return [240, 253, 244, 255];
    return [163, 230, 53, 255];
  }

  // Biohazard crown chevron
  if (Math.abs(Math.abs(dx) - (dy + 0.2) * 0.6) < 0.05 && dy > -0.5 && dy < -0.1) {
    return [250, 204, 21, 240];
  }

  const grad = Math.max(0, 1 - headDist);
  return [10 + grad * 25, 60 + grad * 80, 25 + grad * 40, 255];
}

// 10. STORM (Mjolnir Storm²)
function stormPixel(x, y, w, h) {
  const cx = w / 2;
  const cy = h / 2;
  const dx = (x - cx) / (w / 2);
  const dy = (y - cy) / (h / 2);

  // Lightning bolt horns
  if (dy < -0.2) {
    if (Math.abs(dx + 0.45 - (dy + 0.2) * 0.4) < 0.06 && dy > -0.7) return [96, 165, 250, 255];
    if (Math.abs(dx - 0.45 + (dy + 0.2) * 0.4) < 0.06 && dy > -0.7) return [96, 165, 250, 255];
  }

  const headDist = Math.hypot(dx * 1.06, (dy + 0.05) * 1.16);
  if (headDist > 0.82) return [0, 0, 0, 0];
  if (headDist > 0.74) return [59, 130, 246, 255]; // Storm blue

  // Electric yellow eyes
  if (Math.hypot(dx + 0.26, dy - 0.06) < 0.09) {
    if (Math.hypot(dx + 0.26, dy - 0.06) < 0.035) return [255, 255, 255, 255];
    return [250, 204, 21, 255];
  }
  if (Math.hypot(dx - 0.26, dy - 0.06) < 0.09) {
    if (Math.hypot(dx - 0.26, dy - 0.06) < 0.035) return [255, 255, 255, 255];
    return [250, 204, 21, 255];
  }

  // Voltage core
  if (Math.hypot(dx, dy + 0.1) < 0.15) return [191, 219, 254, 255];

  const grad = Math.max(0, 1 - headDist);
  return [15 + grad * 35, 35 + grad * 60, 120 + grad * 120, 255];
}

// 11. VAMPIRE (Crimson Vampire²)
function vampirePixel(x, y, w, h) {
  const cx = w / 2;
  const cy = h / 2;
  const dx = (x - cx) / (w / 2);
  const dy = (y - cy) / (h / 2);

  // Bat ear crests
  if (dy < -0.2 && Math.abs(dx) > 0.35 && Math.abs(dx) < 0.65) {
    return [159, 18, 57, 255];
  }

  const headDist = Math.hypot(dx * 1.1, (dy + 0.05) * 1.2);
  if (headDist > 0.82) return [0, 0, 0, 0];
  if (headDist > 0.74) return [225, 29, 72, 255]; // Blood red

  // Vampire fangs
  if (dy > 0.58 && dy < 0.8 && (Math.abs(dx - 0.15) < 0.04 || Math.abs(dx + 0.15) < 0.04)) {
    return [255, 255, 255, 255];
  }

  // Crimson eyes
  if (Math.hypot(dx + 0.26, dy - 0.06) < 0.09) {
    if (Math.hypot(dx + 0.26, dy - 0.06) < 0.035) return [255, 255, 255, 255];
    return [244, 63, 94, 255];
  }
  if (Math.hypot(dx - 0.26, dy - 0.06) < 0.09) {
    if (Math.hypot(dx - 0.26, dy - 0.06) < 0.035) return [255, 255, 255, 255];
    return [244, 63, 94, 255];
  }

  const grad = Math.max(0, 1 - headDist);
  return [25 + grad * 40, 5 + grad * 15, 15 + grad * 20, 255];
}

// 12. CHRONO (Chrono Weaver²)
function chronoPixel(x, y, w, h) {
  const cx = w / 2;
  const cy = h / 2;
  const dx = (x - cx) / (w / 2);
  const dy = (y - cy) / (h / 2);

  // Temporal clock dial ring
  const ringDist = Math.hypot(dx, dy + 0.05);
  if (ringDist > 0.65 && ringDist < 0.78) {
    return [245, 158, 11, 230];
  }

  const headDist = Math.hypot(dx * 1.08, (dy + 0.05) * 1.18);
  if (headDist > 0.82) return [0, 0, 0, 0];
  if (headDist > 0.74) return [217, 119, 6, 255];

  // Amber gear teeth on sides
  if (Math.abs(dx) > 0.55 && Math.abs(dy) < 0.4 && (Math.round(dy * 15) % 2 === 0)) {
    return [251, 191, 36, 255];
  }

  // Golden clock hands / temporal iris
  if (Math.hypot(dx + 0.26, dy - 0.06) < 0.09) {
    if (Math.hypot(dx + 0.26, dy - 0.06) < 0.035) return [255, 255, 255, 255];
    return [251, 191, 36, 255];
  }
  if (Math.hypot(dx - 0.26, dy - 0.06) < 0.09) {
    if (Math.hypot(dx - 0.26, dy - 0.06) < 0.035) return [255, 255, 255, 255];
    return [251, 191, 36, 255];
  }

  const grad = Math.max(0, 1 - headDist);
  return [50 + grad * 50, 35 + grad * 40, 10 + grad * 15, 255];
}

// 13. NINJA (Shinobi Phantom²)
function ninjaPixel(x, y, w, h) {
  const cx = w / 2;
  const cy = h / 2;
  const dx = (x - cx) / (w / 2);
  const dy = (y - cy) / (h / 2);

  // Kunai head crest
  if (dy < -0.3 && Math.abs(dx) < 0.12 && dy > -0.7) {
    return [148, 163, 184, 255];
  }

  const headDist = Math.hypot(dx * 1.1, (dy + 0.05) * 1.2);
  if (headDist > 0.82) return [0, 0, 0, 0];
  if (headDist > 0.74) return [45, 212, 191, 240]; // Stealth turquoise

  // Shinobi cowl forehead plate
  if (dy > -0.35 && dy < -0.15 && Math.abs(dx) < 0.5) {
    return [100, 116, 139, 255];
  }

  // Glowing assassin turquoise eyes
  if (Math.hypot(dx + 0.26, dy - 0.02) < 0.08) {
    if (Math.hypot(dx + 0.26, dy - 0.02) < 0.03) return [255, 255, 255, 255];
    return [45, 212, 191, 255];
  }
  if (Math.hypot(dx - 0.26, dy - 0.02) < 0.08) {
    if (Math.hypot(dx - 0.26, dy - 0.02) < 0.03) return [255, 255, 255, 255];
    return [45, 212, 191, 255];
  }

  const grad = Math.max(0, 1 - headDist);
  return [15 + grad * 20, 23 + grad * 25, 42 + grad * 35, 255];
}

// 14. CRYSTAL (Prismatic Crystal²)
function crystalPixel(x, y, w, h) {
  const cx = w / 2;
  const cy = h / 2;
  const dx = (x - cx) / (w / 2);
  const dy = (y - cy) / (h / 2);

  // Faceted crystal crown horns
  if (dy < -0.2 && (Math.abs(dx + 0.4) < 0.16 || Math.abs(dx - 0.4) < 0.16)) {
    return [232, 121, 249, 255];
  }

  const headDist = Math.hypot(dx * 1.08, (dy + 0.05) * 1.18);
  if (headDist > 0.82) return [0, 0, 0, 0];
  if (headDist > 0.74) return [192, 132, 252, 255];

  // Geometric crystal facet diagonal lines
  if (Math.abs(dx * 1.2 - dy) < 0.04 || Math.abs(-dx * 1.2 - dy) < 0.04) {
    return [245, 208, 254, 255];
  }

  // Sparkling prism eyes
  if (Math.hypot(dx + 0.26, dy - 0.06) < 0.09) {
    if (Math.hypot(dx + 0.26, dy - 0.06) < 0.035) return [255, 255, 255, 255];
    return [216, 180, 254, 255];
  }
  if (Math.hypot(dx - 0.26, dy - 0.06) < 0.09) {
    if (Math.hypot(dx - 0.26, dy - 0.06) < 0.035) return [255, 255, 255, 255];
    return [216, 180, 254, 255];
  }

  const grad = Math.max(0, 1 - headDist);
  return [45 + grad * 45, 20 + grad * 30, 80 + grad * 80, 255];
}

// 15. ALIEN (Xenomorph Bio-Viper²)
function alienPixel(x, y, w, h) {
  const cx = w / 2;
  const cy = h / 2;
  const dx = (x - cx) / (w / 2);
  const dy = (y - cy) / (h / 2);

  // Elongated biomech skull crown
  if (dy < -0.2 && Math.abs(dx) < 0.5) {
    if (Math.round(dy * 12) % 2 === 0) return [34, 197, 94, 230]; // Ribbed bio-carapace
  }

  const headDist = Math.hypot(dx * 1.15, (dy + 0.1) * 1.3);
  if (headDist > 0.82) return [0, 0, 0, 0];
  if (headDist > 0.74) return [22, 163, 74, 255];

  // Inner acid maw / glow
  if (dy > 0.4 && dy < 0.7 && Math.abs(dx) < 0.25) {
    return [74, 222, 128, 255];
  }

  // Extraterrestrial pupil-less eyes
  if (Math.hypot(dx + 0.28, dy - 0.08) < 0.09) {
    return [187, 247, 208, 255];
  }
  if (Math.hypot(dx - 0.28, dy - 0.08) < 0.09) {
    return [187, 247, 208, 255];
  }

  const grad = Math.max(0, 1 - headDist);
  return [10 + grad * 15, 25 + grad * 35, 18 + grad * 25, 255];
}

const snakes = [
  { name: 'Angel', id: 'angel', fn: angelPixel },
  { name: 'Devil', id: 'devil', fn: devilPixel },
  { name: 'Void', id: 'void', fn: voidPixel },
  { name: 'Robot', id: 'robot', fn: robotPixel },
  { name: 'Dragon', id: 'dragon', fn: dragonPixel },
  { name: 'Cyber', id: 'cyber', fn: cyberPixel },
  { name: 'Phoenix', id: 'phoenix', fn: phoenixPixel },
  { name: 'Frost', id: 'frost', fn: frostPixel },
  { name: 'Venom', id: 'venom', fn: venomPixel },
  { name: 'Storm', id: 'storm', fn: stormPixel },
  { name: 'Vampire', id: 'vampire', fn: vampirePixel },
  { name: 'Chrono', id: 'chrono', fn: chronoPixel },
  { name: 'Ninja', id: 'ninja', fn: ninjaPixel },
  { name: 'Crystal', id: 'crystal', fn: crystalPixel },
  { name: 'Alien', id: 'alien', fn: alienPixel },
];

console.log('Generating 256x256 Snake Sprite Assets for ALL 15 Cyber Snakes...');
for (const s of snakes) {
  const buf = createPngBuffer(256, 256, s.fn);

  for (const outDir of outDirs) {
    const p1 = path.join(outDir, `${s.name}.png`);
    const p2 = path.join(outDir, `${s.id}.png`);
    const p3 = path.join(outDir, `${s.id}_head.png`);

    fs.writeFileSync(p1, buf);
    fs.writeFileSync(p2, buf);
    fs.writeFileSync(p3, buf);
  }
  console.log(`Saved: ${s.name} in both asset folders (${buf.length} bytes)`);
}

console.log('All 15 Snake Assets generated and synced successfully to both asset folders!');
