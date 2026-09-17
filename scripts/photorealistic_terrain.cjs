const { PNG } = require('pngjs');

// ==========================================================
// PHOTOREALISTIC TERRAIN & MODERN LIFE GENERATOR FOR BEDROCK
// ==========================================================

function createNoise(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return function() {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function createSeamlessNoise(width, height, scale, seed = 1234) {
  const gridW = Math.max(2, Math.floor(width / scale));
  const gridH = Math.max(2, Math.floor(height / scale));
  const rand = createNoise(seed);
  const grid = new Float32Array(gridW * gridH);
  for (let i = 0; i < gridW * gridH; i++) grid[i] = rand();

  function getVal(gx, gy) {
    const x = ((gx % gridW) + gridW) % gridW;
    const y = ((gy % gridH) + gridH) % gridH;
    return grid[y * gridW + x];
  }
  function smooth(t) { return t * t * (3 - 2 * t); }

  const result = new Float32Array(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const gx = (x / width) * gridW;
      const gy = (y / height) * gridH;
      const x0 = Math.floor(gx);
      const y0 = Math.floor(gy);
      const fx = smooth(gx - x0);
      const fy = smooth(gy - y0);
      const v00 = getVal(x0, y0);
      const v10 = getVal(x0 + 1, y0);
      const v01 = getVal(x0, y0 + 1);
      const v11 = getVal(x0 + 1, y0 + 1);
      const top = v00 * (1 - fx) + v10 * fx;
      const bot = v01 * (1 - fx) + v11 * fx;
      result[y * width + x] = top * (1 - fy) + bot * fy;
    }
  }
  return result;
}

function createFractalNoise(width, height, octaves = 4, persistence = 0.5, baseScale = 16, seed = 42) {
  const result = new Float32Array(width * height);
  let amp = 1.0;
  let totalAmp = 0;
  let scale = baseScale;
  for (let o = 0; o < octaves; o++) {
    const layer = createSeamlessNoise(width, height, scale, seed + o * 1013);
    for (let i = 0; i < width * height; i++) result[i] += layer[i] * amp;
    totalAmp += amp;
    amp *= persistence;
    scale = Math.max(2, Math.floor(scale / 2));
  }
  for (let i = 0; i < width * height; i++) result[i] /= totalAmp;
  return result;
}

// 2D Cellular / Worley distance for natural clods & pebble structures
function createWorleyPoints(width, height, numPoints, seed = 555) {
  const rand = createNoise(seed);
  const points = [];
  for (let i = 0; i < numPoints; i++) {
    points.push({
      x: rand() * width,
      y: rand() * height,
      size: 0.6 + rand() * 0.8,
      height: rand(),
      colorShift: (rand() - 0.5) * 40
    });
  }
  return points;
}

function calculateWorley(x, y, points, width, height) {
  let d1 = 9999;
  let d2 = 9999;
  let closestPoint = null;

  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    // Seamless periodic torus distance
    let dx = Math.abs(x - p.x);
    if (dx > width * 0.5) dx = width - dx;
    let dy = Math.abs(y - p.y);
    if (dy > height * 0.5) dy = height - dy;
    const dist = Math.sqrt(dx * dx + dy * dy) / p.size;

    if (dist < d1) {
      d2 = d1;
      d1 = dist;
      closestPoint = p;
    } else if (dist < d2) {
      d2 = dist;
    }
  }

  return { d1, d2, edge: d2 - d1, point: closestPoint };
}

// Sobel Normal Map generator
function generateNormalMap(heightMap, width, height, strength = 3.5) {
  const normalMap = new Uint8Array(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const getH = (nx, ny) => {
        const wrapX = ((nx % width) + width) % width;
        const wrapY = ((ny % height) + height) % height;
        return heightMap[wrapY * width + wrapX];
      };
      const tl = getH(x - 1, y - 1);
      const t  = getH(x,     y - 1);
      const tr = getH(x + 1, y - 1);
      const l  = getH(x - 1, y);
      const r  = getH(x + 1, y);
      const bl = getH(x - 1, y + 1);
      const b  = getH(x,     y + 1);
      const br = getH(x + 1, y + 1);

      const dX = (tr + 2 * r + br) - (tl + 2 * l + bl);
      const dY = (bl + 2 * b + br) - (tl + 2 * t + tr);

      let nx = -dX * strength;
      let ny = -dY * strength;
      let nz = 1.0;
      const len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1.0;
      nx /= len; ny /= len; nz /= len;

      const idx = (y * width + x) * 4;
      normalMap[idx + 0] = Math.round((nx * 0.5 + 0.5) * 255);
      normalMap[idx + 1] = Math.round((ny * 0.5 + 0.5) * 255);
      normalMap[idx + 2] = Math.round((nz * 0.5 + 0.5) * 255);
      normalMap[idx + 3] = 255;
    }
  }
  return normalMap;
}

// -------------------------------------------------------------
// 1. PHOTOREALISTIC DIRT (Terre meuble, mottes, cailloux, racines)
// -------------------------------------------------------------
function generatePhotorealisticDirt(w = 128, h = 128) {
  const clodPoints = createWorleyPoints(w, h, 28, 8881);
  const microClodPoints = createWorleyPoints(w, h, 70, 8882);
  const humusNoise = createFractalNoise(w, h, 5, 0.55, 32, 8883);
  const gritNoise = createFractalNoise(w, h, 3, 0.7, 4, 8884);
  const microGrit = createSeamlessNoise(w, h, 2, 8885);
  const rand = createNoise(9991);

  // Scatter 18 individual realistic embedded pebbles
  const pebbles = [];
  for (let i = 0; i < 18; i++) {
    pebbles.push({
      x: rand() * w,
      y: rand() * h,
      rx: 2.2 + rand() * 3.6,
      ry: 1.8 + rand() * 2.8,
      angle: rand() * Math.PI,
      tone: rand() > 0.4 ? 'granite' : (rand() > 0.5 ? 'slate' : 'quartz'),
      height: 0.85 + rand() * 0.15
    });
  }

  // Organic fine root curves
  const roots = [];
  for (let r = 0; r < 6; r++) {
    const startX = rand() * w;
    const startY = rand() * h;
    const length = 20 + rand() * 30;
    const angle = rand() * Math.PI * 2;
    roots.push({ startX, startY, length, angle, curl: (rand() - 0.5) * 0.2 });
  }

  const rgba = new Uint8Array(w * h * 4);
  const heightMap = new Float32Array(w * h);
  const merData = new Uint8Array(w * h * 4);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;

      // Worley cellular clods
      const w1 = calculateWorley(x, y, clodPoints, w, h);
      const w2 = calculateWorley(x, y, microClodPoints, w, h);
      const humus = humusNoise[idx];
      const grit = gritNoise[idx];
      const mg = microGrit[idx];

      // Deep crevice between clods
      const crevice1 = Math.min(1.0, w1.edge / 3.8);
      const crevice2 = Math.min(1.0, w2.edge / 2.2);
      const creviceFactor = crevice1 * 0.7 + crevice2 * 0.3;

      // Base soil color: rich fertile agricultural loam
      // Crevice: dark rich humus (48, 32, 20)
      // Raised clod: warm earthy brown (108, 76, 48)
      // Sunlit / dry crest: (132, 94, 60)
      const clodCenterBoost = Math.max(0, 1.0 - w1.d1 / 14);
      let r = 52 + creviceFactor * 52 + clodCenterBoost * 22 + (humus - 0.5) * 28 + (grit - 0.5) * 20;
      let g = 36 + creviceFactor * 36 + clodCenterBoost * 16 + (humus - 0.5) * 20 + (grit - 0.5) * 14;
      let b = 22 + creviceFactor * 24 + clodCenterBoost * 10 + (humus - 0.5) * 12 + (grit - 0.5) * 8;

      // Crumbly soil granular texture (each pixel has tactile crumb grit)
      const crumb = (mg - 0.5) * 24;
      r += crumb * 0.9;
      g += crumb * 0.75;
      b += crumb * 0.5;

      // Deep crevices get occluded dark shadow
      if (creviceFactor < 0.28) {
        const shadow = (0.28 - creviceFactor) * 110;
        r = Math.max(26, r - shadow);
        g = Math.max(18, g - shadow * 0.85);
        b = Math.max(12, b - shadow * 0.7);
      }

      // Base height from clods and grit
      let hVal = 0.25 + creviceFactor * 0.55 + clodCenterBoost * 0.15 + (grit - 0.5) * 0.1;
      let roughness = 242; // Extremely matte dielectric soil
      let metalness = 0;

      // Embedded Pebbles & Stones
      for (const p of pebbles) {
        let dx = Math.abs(x - p.x);
        if (dx > w * 0.5) dx = w - dx;
        let dy = Math.abs(y - p.y);
        if (dy > h * 0.5) dy = h - dy;
        const cosA = Math.cos(p.angle);
        const sinA = Math.sin(p.angle);
        const rx = dx * cosA + dy * sinA;
        const ry = -dx * sinA + dy * cosA;
        const dist = Math.sqrt((rx / p.rx) ** 2 + (ry / p.ry) ** 2);

        if (dist < 1.0) {
          // Inside stone
          const distRim = 1.0 - dist;
          // Sunlit upper-left facet highlight
          const isSunlit = (x - p.x - (y - p.y)) < 0;
          let pebbleR, pebbleG, pebbleB;

          if (p.tone === 'quartz') {
            pebbleR = 195 + distRim * 35;
            pebbleG = 188 + distRim * 30;
            pebbleB = 172 + distRim * 25;
            roughness = 120; // Smooth crystalline glint
          } else if (p.tone === 'slate') {
            pebbleR = 85 + distRim * 30;
            pebbleG = 92 + distRim * 32;
            pebbleB = 102 + distRim * 35; // Slate bluish tint
            roughness = 145;
          } else {
            // Granite / sandstone
            pebbleR = 145 + distRim * 30;
            pebbleG = 135 + distRim * 25;
            pebbleB = 120 + distRim * 20;
            roughness = 155;
          }

          if (isSunlit) {
            pebbleR += 25; pebbleG += 22; pebbleB += 18;
          }

          r = pebbleR;
          g = pebbleG;
          b = pebbleB;
          hVal = Math.max(hVal, 0.75 + distRim * 0.2);
        } else if (dist < 1.35) {
          // Pebble contact occlusion shadow in the dirt
          const shadowFactor = (1.35 - dist) / 0.35;
          r = Math.max(22, r - shadowFactor * 45);
          g = Math.max(16, g - shadowFactor * 35);
          b = Math.max(10, b - shadowFactor * 25);
          hVal = Math.min(hVal, 0.3);
        }
      }

      // Rootlets weaving through the soil
      for (const root of roots) {
        // Point distance to root segment
        const rx = x - root.startX;
        const ry = y - root.startY;
        const proj = rx * Math.cos(root.angle) + ry * Math.sin(root.angle);
        if (proj > 0 && proj < root.length) {
          const perp = Math.abs(-rx * Math.sin(root.angle) + ry * Math.cos(root.angle) + Math.sin(proj * 0.3) * 1.5);
          if (perp < 1.1) {
            // Root fiber: pale tan/ochre organic woody strand
            r = 155 + (humus - 0.5) * 20;
            g = 122 + (humus - 0.5) * 15;
            b = 82 + (humus - 0.5) * 10;
            hVal = Math.max(hVal, 0.7);
            roughness = 210;
          } else if (perp < 2.0) {
            // Root shadow
            r = Math.max(25, r - 25);
            g = Math.max(18, g - 20);
            b = Math.max(12, b - 15);
          }
        }
      }

      r = Math.min(255, Math.max(0, Math.round(r)));
      g = Math.min(255, Math.max(0, Math.round(g)));
      b = Math.min(255, Math.max(0, Math.round(b)));

      rgba[idx * 4 + 0] = r;
      rgba[idx * 4 + 1] = g;
      rgba[idx * 4 + 2] = b;
      rgba[idx * 4 + 3] = 255;

      heightMap[idx] = Math.min(1.0, Math.max(0.0, hVal));

      merData[idx * 4 + 0] = metalness;
      merData[idx * 4 + 1] = 0;
      merData[idx * 4 + 2] = roughness;
      merData[idx * 4 + 3] = 255;
    }
  }

  return { rgba, heightMap, merData, w, h };
}

// -----------------------------------------------------------------
// 2. PHOTOREALISTIC GRASS TOP (Hundreds of crisp individual blades)
// Calibrated luminance so Bedrock biome multiplier doesn't turn neon
// -----------------------------------------------------------------
function generatePhotorealisticGrassTop(dirtData, w = 128, h = 128) {
  const rgba = new Uint8Array(w * h * 4);
  const heightMap = new Float32Array(w * h);
  const merData = new Uint8Array(w * h * 4);

  // Start with rich dark soil base
  for (let i = 0; i < w * h; i++) {
    // Deep dark ground beneath the grass
    rgba[i * 4 + 0] = Math.round(dirtData.rgba[i * 4 + 0] * 0.65);
    rgba[i * 4 + 1] = Math.round(dirtData.rgba[i * 4 + 1] * 0.65);
    rgba[i * 4 + 2] = Math.round(dirtData.rgba[i * 4 + 2] * 0.65);
    rgba[i * 4 + 3] = 255;
    heightMap[i] = 0.2;
    merData[i * 4 + 0] = 0;
    merData[i * 4 + 1] = 0;
    merData[i * 4 + 2] = 245;
    merData[i * 4 + 3] = 255;
  }

  const rand = createNoise(4441);
  const numBlades = 1600; // Dense carpet of true individual grass blades

  for (let b = 0; b < numBlades; b++) {
    const rootX = rand() * w;
    const rootY = rand() * h;
    const length = 6.0 + rand() * 8.0;
    // Natural wind angle with variance
    const angle = -Math.PI * 0.5 + (rand() - 0.5) * 1.1;
    const curve = (rand() - 0.5) * 0.4;
    const bladeWidth = 1.0 + rand() * 0.9;
    const baseBrightness = 0.85 + rand() * 0.35;

    // Draw blade from root to tip
    const steps = Math.ceil(length * 1.5);
    for (let s = 0; s < steps; s++) {
      const t = s / steps;
      const curAngle = angle + curve * t;
      const curDist = t * length;
      const px = Math.floor(((rootX + Math.cos(curAngle) * curDist) % w + w) % w);
      const py = Math.floor(((rootY + Math.sin(curAngle) * curDist) % h + h) % h);

      // Width of blade tapers to sharp point at tip
      const wSpan = Math.max(1, Math.round(bladeWidth * (1.0 - t * 0.75)));

      for (let dw = -Math.floor(wSpan / 2); dw <= Math.floor(wSpan / 2); dw++) {
        const targetX = (px + dw + w) % w;
        const targetY = py;
        const idx = targetY * w + targetX;

        // Calibrated natural meadow tone:
        // Root: deep forest green (38, 75, 20)
        // Mid: rich meadow green (62, 128, 34)
        // Tip: sunlit golden tip (88, 162, 45)
        let bladeR = (38 + t * 48) * baseBrightness;
        let bladeG = (78 + t * 80) * baseBrightness;
        let bladeB = (20 + t * 24) * baseBrightness;

        // Sunlit edge on top side
        if (dw === -Math.floor(wSpan / 2)) {
          bladeR += 14; bladeG += 22; bladeB += 8;
        }

        // Contact shadow underneath
        if (t < 0.25) {
          bladeR *= 0.7; bladeG *= 0.7; bladeB *= 0.7;
        }

        rgba[idx * 4 + 0] = Math.min(255, Math.round(bladeR));
        rgba[idx * 4 + 1] = Math.min(255, Math.round(bladeG));
        rgba[idx * 4 + 2] = Math.min(255, Math.round(bladeB));
        rgba[idx * 4 + 3] = 255;

        // Distinct height for 3D normal map
        heightMap[idx] = Math.min(1.0, 0.4 + t * 0.55);
        merData[idx * 4 + 2] = 205; // Matte organic grass
      }
    }
  }

  // Add 12 three-leaf clovers for organic botanical realism
  for (let c = 0; c < 12; c++) {
    const cx = rand() * w;
    const cy = rand() * h;
    const cloverRadius = 3.5;
    for (let dy = -5; dy <= 5; dy++) {
      for (let dx = -5; dx <= 5; dx++) {
        const d = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        // 3-leaf clover shape modulation
        const leafDist = cloverRadius * (0.8 + 0.35 * Math.sin(angle * 3));
        if (d < leafDist) {
          const px = Math.floor(((cx + dx) % w + w) % w);
          const py = Math.floor(((cy + dy) % h + h) % h);
          const idx = py * w + px;

          rgba[idx * 4 + 0] = 52;
          rgba[idx * 4 + 1] = 135;
          rgba[idx * 4 + 2] = 30;
          rgba[idx * 4 + 3] = 255;
          heightMap[idx] = 0.85;
        }
      }
    }
  }

  return { rgba, heightMap, merData, w, h };
}

// -------------------------------------------------------------
// 3. PHOTOREALISTIC GRASS SIDE (Natural hanging cascades & roots)
// -------------------------------------------------------------
function generatePhotorealisticGrassSide(dirtData, grassTopData, w = 128, h = 128) {
  const rgba = new Uint8Array(w * h * 4);
  const heightMap = new Float32Array(w * h);
  const merData = new Uint8Array(w * h * 4);

  // Copy photorealistic crumbly dirt as base
  for (let i = 0; i < w * h; i++) {
    rgba[i * 4 + 0] = dirtData.rgba[i * 4 + 0];
    rgba[i * 4 + 1] = dirtData.rgba[i * 4 + 1];
    rgba[i * 4 + 2] = dirtData.rgba[i * 4 + 2];
    rgba[i * 4 + 3] = 255;
    heightMap[i] = dirtData.heightMap[i] * 0.75;
    merData[i * 4 + 0] = dirtData.merData[i * 4 + 0];
    merData[i * 4 + 1] = dirtData.merData[i * 4 + 1];
    merData[i * 4 + 2] = dirtData.merData[i * 4 + 2];
    merData[i * 4 + 3] = 255;
  }

  const rand = createNoise(7712);
  const turfNoise = createSeamlessNoise(w, h, 14, 7713);

  // Natural hanging turf profile (variable overhang from 14px to 38px)
  const turfHeights = new Float32Array(w);
  for (let x = 0; x < w; x++) {
    const baseTurf = 16.0;
    const undulation = Math.sin((x / w) * Math.PI * 4) * 6.0 + (turfNoise[x] - 0.5) * 12.0;
    turfHeights[x] = Math.max(10, baseTurf + undulation);
  }

  // Render lush grass turf top band
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      const turfH = turfHeights[x];

      if (y < turfH) {
        // Upper turf body: blend with grass top colors
        const t = y / turfH;
        const gR = grassTopData.rgba[idx * 4 + 0];
        const gG = grassTopData.rgba[idx * 4 + 1];
        const gB = grassTopData.rgba[idx * 4 + 2];

        // Slight occlusion near the transition to dirt
        const shade = t * 28;
        rgba[idx * 4 + 0] = Math.max(25, gR - shade * 0.8);
        rgba[idx * 4 + 1] = Math.max(45, gG - shade);
        rgba[idx * 4 + 2] = Math.max(15, gB - shade * 0.6);
        rgba[idx * 4 + 3] = 255;

        heightMap[idx] = 0.65 + (1.0 - t) * 0.25;
        merData[idx * 4 + 2] = 210;
      } else if (y >= turfH && y < turfH + 5) {
        // Contact shadow under hanging turf onto dirt
        const shadow = (1.0 - (y - turfH) / 5) * 55;
        rgba[idx * 4 + 0] = Math.max(25, rgba[idx * 4 + 0] - shadow);
        rgba[idx * 4 + 1] = Math.max(18, rgba[idx * 4 + 1] - shadow * 0.85);
        rgba[idx * 4 + 2] = Math.max(12, rgba[idx * 4 + 2] - shadow * 0.7);
      }
    }
  }

  // Draw distinct pointed hanging grass blades cascading down
  for (let b = 0; b < 180; b++) {
    const x = Math.floor(rand() * w);
    const startY = turfHeights[x] - 4;
    const bladeLen = 6 + rand() * 18; // cascade length
    const slant = (rand() - 0.5) * 4;

    for (let s = 0; s < bladeLen; s++) {
      const cy = Math.floor(startY + s);
      if (cy >= h) break;
      const cx = Math.floor((x + (s / bladeLen) * slant + w) % w);
      const cIdx = cy * w + cx;

      const t = s / bladeLen;
      // Sunny tip
      const r = Math.round(55 + (1.0 - t) * 25);
      const g = Math.round(115 + (1.0 - t) * 35);
      const bVal = Math.round(28 + (1.0 - t) * 15);

      rgba[cIdx * 4 + 0] = r;
      rgba[cIdx * 4 + 1] = g;
      rgba[cIdx * 4 + 2] = bVal;
      rgba[cIdx * 4 + 3] = 255;

      heightMap[cIdx] = Math.max(heightMap[cIdx], 0.7);
    }
  }

  // Trailing root fibers descending from grass into dirt
  for (let r = 0; r < 40; r++) {
    const x = Math.floor(rand() * w);
    const startY = turfHeights[x] + rand() * 4;
    const rootLen = 8 + rand() * 22;
    let curX = x;

    for (let s = 0; s < rootLen; s++) {
      const cy = Math.floor(startY + s);
      if (cy >= h) break;
      curX += (rand() - 0.5) * 1.2;
      const cx = Math.floor((curX + w) % w);
      const cIdx = cy * w + cx;

      // Pale tan root fiber
      rgba[cIdx * 4 + 0] = 145;
      rgba[cIdx * 4 + 1] = 118;
      rgba[cIdx * 4 + 2] = 80;
      rgba[cIdx * 4 + 3] = 255;
      heightMap[cIdx] = Math.max(heightMap[cIdx], 0.6);
    }
  }

  return { rgba, heightMap, merData, w, h };
}

// -------------------------------------------------------------
// 4. PHOTOREALISTIC DIRT PATH (Sentier battu avec graviers & traces)
// -------------------------------------------------------------
function generatePhotorealisticDirtPath(dirtData, w = 128, h = 128) {
  const pathNoise = createFractalNoise(w, h, 4, 0.6, 24, 6601);
  const treadNoise = createSeamlessNoise(w, h, 8, 6602);
  const gritNoise = createSeamlessNoise(w, h, 2, 6603);

  const rgba = new Uint8Array(w * h * 4);
  const heightMap = new Float32Array(w * h);
  const merData = new Uint8Array(w * h * 4);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      const n = pathNoise[idx];
      const tread = treadNoise[idx];
      const grit = gritNoise[idx];

      // Compacted, sun-baked sandy-clay path palette:
      // Warm ochre-tan (152, 118, 78) to dusty beige (178, 142, 98)
      let r = 152 + n * 32 + (tread - 0.5) * 16 + (grit - 0.5) * 14;
      let g = 116 + n * 26 + (tread - 0.5) * 14 + (grit - 0.5) * 12;
      let b = 74 + n * 18 + (tread - 0.5) * 10 + (grit - 0.5) * 8;

      // Fine flat embedded river pebbles in path
      if (grit > 0.82) {
        r += 25; g += 22; b += 18;
      }

      // Compacted foot/cart track longitudinal depression
      const track1 = Math.abs(x - 36);
      const track2 = Math.abs(x - 92);
      if (track1 < 10 || track2 < 10) {
        const depth = track1 < 10 ? (10 - track1) / 10 : (10 - track2) / 10;
        r -= depth * 18;
        g -= depth * 14;
        b -= depth * 10;
      }

      r = Math.min(255, Math.max(0, Math.round(r)));
      g = Math.min(255, Math.max(0, Math.round(g)));
      b = Math.min(255, Math.max(0, Math.round(b)));

      rgba[idx * 4 + 0] = r;
      rgba[idx * 4 + 1] = g;
      rgba[idx * 4 + 2] = b;
      rgba[idx * 4 + 3] = 255;

      heightMap[idx] = 0.45 + n * 0.25;
      merData[idx * 4 + 0] = 0;
      merData[idx * 4 + 1] = 0;
      merData[idx * 4 + 2] = 230; // Matte dry path
      merData[idx * 4 + 3] = 255;
    }
  }

  return { rgba, heightMap, merData, w, h };
}

// ----------------------------------------------------------------------
// 5. PHOTOREALISTIC WATER (32-Frame Ultra-Fluid Animation, Caustics, PBR)
// ----------------------------------------------------------------------
function generateWaterFrame(w = 128, h = 128, frameIndex = 0, totalFrames = 32, isFlow = false) {
  const rgba = new Uint8Array(w * h * 4);
  const heightMap = new Float32Array(w * h);

  // Exact 2*PI cyclic phase for seamless loop 31 -> 0
  const phase = (frameIndex / totalFrames) * Math.PI * 2;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      const nx = (x / w) * Math.PI * 2;
      const ny = (y / h) * Math.PI * 2;

      // Downward flow offset if isFlow
      const flowY = isFlow ? ((y + (frameIndex / totalFrames) * h) % h) / h * Math.PI * 2 : ny;

      // 5-harmonic wave interference for natural fluid surface undulation
      const w1 = Math.sin(nx * 3 + phase) * Math.cos(flowY * 3 + phase * 0.9);
      const w2 = Math.sin((nx * 1.5 + flowY * 2.5) - phase * 1.3) * 0.8;
      const w3 = Math.cos((nx * 4 - flowY * 3) + phase * 1.7) * 0.5;
      const w4 = Math.sin(nx * 6 + flowY * 5 - phase * 2.1) * 0.3;
      const w5 = Math.cos((nx * 8 + flowY * 8) + phase * 2.5) * 0.2;

      // Dynamic aquatic caustics network
      const caustic1 = Math.abs(Math.sin(nx * 4 + phase * 0.8) + Math.cos(flowY * 4 - phase * 0.7));
      const caustic2 = Math.abs(Math.cos(nx * 5 - flowY * 5 + phase * 1.2));
      const causticIntensity = Math.max(0, 1.0 - (caustic1 * 0.5 + caustic2 * 0.5) * 1.4);

      // Normalized wave crest [0, 1]
      const waveVal = Math.min(1.0, Math.max(0.0, (w1 + w2 + w3 + w4 + w5 + 2.8) / 5.6));

      // Pristine crystal-clear light blue water gradient (Bleu clair & Haute transparence):
      // Allows riverbed sand, gravel, and sea floor to be clearly visible through the surface
      let r = 70 + waveVal * 42 + causticIntensity * 85;
      let g = 175 + waveVal * 55 + causticIntensity * 30;
      let b = 235 + waveVal * 20 + causticIntensity * 10;

      // Calibrated high-transparency water (Alpha ~60-95 out of 255, approx 25-37% opacity)
      // Diminue l'opacité pour voir nettement le fond de l'eau
      const alpha = Math.round(58 + (1.0 - waveVal) * 24 + causticIntensity * 28);

      r = Math.min(255, Math.max(0, Math.round(r)));
      g = Math.min(255, Math.max(0, Math.round(g)));
      b = Math.min(255, Math.max(0, Math.round(b)));

      rgba[idx * 4 + 0] = r;
      rgba[idx * 4 + 1] = g;
      rgba[idx * 4 + 2] = b;
      rgba[idx * 4 + 3] = alpha;

      heightMap[idx] = waveVal;
    }
  }

  return { rgba, heightMap, w, h };
}

function generateWaterFlipbook32(w = 128, h = 128, totalFrames = 32, isFlow = false) {
  const totalH = h * totalFrames;
  const stripRgba = new Uint8Array(w * totalH * 4);
  const firstFrame = generateWaterFrame(w, h, 0, totalFrames, isFlow);

  for (let f = 0; f < totalFrames; f++) {
    const frame = f === 0 ? firstFrame : generateWaterFrame(w, h, f, totalFrames, isFlow);
    for (let y = 0; y < h; y++) {
      const srcOffset = y * w * 4;
      const dstOffset = (f * h + y) * w * 4;
      stripRgba.set(frame.rgba.subarray(srcOffset, srcOffset + w * 4), dstOffset);
    }
  }

  return { stripRgba, firstFrame, w, totalH };
}

// -------------------------------------------------------------
// 6. MODERN SMARTPHONE ITEM (Objet de la vraie vie)
// -------------------------------------------------------------
function generateModernSmartphone(w = 128, h = 128) {
  const rgba = new Uint8Array(w * h * 4);
  // Phone dimensions centered in 128x128
  const phoneW = 56;
  const phoneH = 104;
  const cornerR = 10;
  const px0 = Math.floor((w - phoneW) / 2);
  const py0 = Math.floor((h - phoneH) / 2);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      const dx = x - (px0 + phoneW / 2);
      const dy = y - (py0 + phoneH / 2);

      // Rounded rectangle test
      const qx = Math.abs(dx) - (phoneW / 2 - cornerR);
      const qy = Math.abs(dy) - (phoneH / 2 - cornerR);
      const distCorner = Math.sqrt(Math.max(0, qx) ** 2 + Math.max(0, qy) ** 2);
      const isInsidePhone = (qx <= 0 || qy <= 0 || distCorner <= cornerR);

      if (!isInsidePhone) {
        // Drop shadow behind phone
        if (qx < 4 && qy < 4 && (qx <= 0 || qy <= 0 || distCorner <= cornerR + 3)) {
          rgba[idx * 4 + 0] = 0;
          rgba[idx * 4 + 1] = 0;
          rgba[idx * 4 + 2] = 0;
          rgba[idx * 4 + 3] = 70;
        } else {
          rgba[idx * 4 + 3] = 0;
        }
        continue;
      }

      // Inside phone
      const isBezel = (distCorner > cornerR - 2.5) || (Math.abs(dx) > phoneW / 2 - 2.5) || (Math.abs(dy) > phoneH / 2 - 2.5);

      if (isBezel) {
        // Titanium / dark aluminum frame
        rgba[idx * 4 + 0] = 45;
        rgba[idx * 4 + 1] = 48;
        rgba[idx * 4 + 2] = 52;
        rgba[idx * 4 + 3] = 255;
      } else {
        // Screen area
        const screenX = x - (px0 + 3);
        const screenY = y - (py0 + 4);
        const screenW = phoneW - 6;
        const screenH = phoneH - 8;

        // Top speaker / Dynamic Island camera notch
        const isDynamicIsland = (Math.abs(dx) < 8 && screenY >= 2 && screenY <= 6);
        if (isDynamicIsland) {
          rgba[idx * 4 + 0] = 12;
          rgba[idx * 4 + 1] = 12;
          rgba[idx * 4 + 2] = 14;
          rgba[idx * 4 + 3] = 255;
          continue;
        }

        // Status bar (battery, wifi, clock)
        if (screenY < 8) {
          rgba[idx * 4 + 0] = 22;
          rgba[idx * 4 + 1] = 24;
          rgba[idx * 4 + 2] = 30;
          rgba[idx * 4 + 3] = 255;
          // Tiny white status dots
          if ((screenX > screenW - 12 && screenX < screenW - 4 && screenY >= 3 && screenY <= 5) || (screenX >= 6 && screenX <= 14 && screenY === 4)) {
            rgba[idx * 4 + 0] = 240;
            rgba[idx * 4 + 1] = 240;
            rgba[idx * 4 + 2] = 245;
          }
          continue;
        }

        // OLED Modern Wallpaper (vibrant dusk gradient: violet to cyan)
        const wallT = screenY / screenH;
        let r = Math.round(30 + wallT * 25 + Math.sin(screenX * 0.15) * 15);
        let g = Math.round(55 + wallT * 95);
        let b = Math.round(180 - wallT * 60 + Math.cos(screenX * 0.1) * 20);

        // App Icons Grid (4 rows of 3 icons + bottom dock)
        const inIconZone = screenY >= 14 && screenY <= 72;
        if (inIconZone) {
          const col = Math.floor((screenX - 5) / 14);
          const row = Math.floor((screenY - 14) / 14);
          const iconLocalX = (screenX - 5) % 14;
          const iconLocalY = (screenY - 14) % 14;

          if (col >= 0 && col < 3 && iconLocalX >= 2 && iconLocalX <= 10 && iconLocalY >= 2 && iconLocalY <= 10) {
            // App icon colored tile
            const iconHue = (row * 3 + col) % 6;
            if (iconHue === 0) { r = 40; g = 140; b = 250; } // Browser
            else if (iconHue === 1) { r = 245; g = 80; b = 70; } // Music
            else if (iconHue === 2) { r = 50; g = 200; b = 90; } // Phone
            else if (iconHue === 3) { r = 250; g = 175; b = 40; } // Notes
            else if (iconHue === 4) { r = 160; g = 70; b = 240; } // Camera
            else { r = 240; g = 60; b = 140; } // Photos
          }
        }

        // Bottom Dock background
        if (screenY >= 78 && screenY <= 92) {
          r = Math.min(255, r + 40);
          g = Math.min(255, g + 40);
          b = Math.min(255, b + 50);

          // 3 Dock icons
          const dockCol = Math.floor((screenX - 6) / 14);
          const dockLocalX = (screenX - 6) % 14;
          const dockLocalY = (screenY - 80);
          if (dockCol >= 0 && dockCol < 3 && dockLocalX >= 2 && dockLocalX <= 10 && dockLocalY >= 0 && dockLocalY <= 8) {
            if (dockCol === 0) { r = 48; g = 210; b = 100; }
            else if (dockCol === 1) { r = 55; g = 125; b = 245; }
            else { r = 245; g = 245; b = 250; }
          }
        }

        // Specular glass reflection streak (diagonal across screen)
        const diagDist = Math.abs(x - y + 10);
        if (diagDist < 8) {
          const streak = (1.0 - diagDist / 8) * 65;
          r = Math.min(255, r + streak);
          g = Math.min(255, g + streak);
          b = Math.min(255, b + streak);
        }

        rgba[idx * 4 + 0] = Math.min(255, Math.max(0, r));
        rgba[idx * 4 + 1] = Math.min(255, Math.max(0, g));
        rgba[idx * 4 + 2] = Math.min(255, Math.max(0, b));
        rgba[idx * 4 + 3] = 255;
      }
    }
  }

  return { rgba, w, h };
}

// -------------------------------------------------------------
// 7. PHOTOREALISTIC PAINTBRUSH (Pinceau d'artiste)
// -------------------------------------------------------------
function generatePhotorealisticPaintbrush(w = 128, h = 128) {
  const rgba = new Uint8Array(w * h * 4);

  // Brush oriented diagonally (bottom-left to top-right)
  const cx = w / 2;
  const cy = h / 2;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      // Project along 45 degree diagonal
      const u = (x - y) / Math.SQRT2; // perpendicular
      const v = (x + y - (cx + cy)) / Math.SQRT2; // along brush length [-50, +50]

      // Brush segments along v:
      // Handle: v from -45 to +10 (wooden)
      // Ferrule: v from +10 to +22 (metal chrome)
      // Bristles: v from +22 to +46 (hair + blue paint tip)

      if (v >= -45 && v < 10) {
        // Wooden handle
        const handleRadius = 2.5 + Math.sin((v + 45) / 55 * Math.PI) * 2.2;
        if (Math.abs(u) <= handleRadius) {
          const lightFactor = (handleRadius - u) / (handleRadius * 2);
          rgba[idx * 4 + 0] = Math.round(168 * lightFactor + 35);
          rgba[idx * 4 + 1] = Math.round(112 * lightFactor + 25);
          rgba[idx * 4 + 2] = Math.round(62 * lightFactor + 15);
          rgba[idx * 4 + 3] = 255;
        }
      } else if (v >= 10 && v < 22) {
        // Silver ferrule with crimps
        const ferruleRadius = 4.8;
        if (Math.abs(u) <= ferruleRadius) {
          const chrome = Math.sin(u * 1.2) * 50 + 190;
          rgba[idx * 4 + 0] = Math.round(chrome);
          rgba[idx * 4 + 1] = Math.round(chrome * 0.98);
          rgba[idx * 4 + 2] = Math.round(chrome * 1.02);
          rgba[idx * 4 + 3] = 255;
        }
      } else if (v >= 22 && v <= 46) {
        // Bristles with fine hairs and paint on tip
        const bristleProgress = (v - 22) / 24;
        const bristleRadius = 4.8 * (1.0 - bristleProgress * 0.65);
        if (Math.abs(u) <= bristleRadius) {
          if (bristleProgress > 0.45) {
            // Wet azure paint on tip!
            rgba[idx * 4 + 0] = 35;
            rgba[idx * 4 + 1] = 145;
            rgba[idx * 4 + 2] = 245;
          } else {
            // Natural camel/badger bristle hairs
            const hairShade = Math.sin(u * 5.0) * 25;
            rgba[idx * 4 + 0] = Math.round(195 + hairShade);
            rgba[idx * 4 + 1] = Math.round(175 + hairShade);
            rgba[idx * 4 + 2] = Math.round(135 + hairShade);
          }
          rgba[idx * 4 + 3] = 255;
        }
      }
    }
  }

  return { rgba, w, h };
}

// -------------------------------------------------------------
// 8. PHOTOREALISTIC ASPHALT ROAD (Route préfabriquée)
// -------------------------------------------------------------
function generatePhotorealisticAsphalt(w = 128, h = 128, withLine = true) {
  const bitumenNoise = createFractalNoise(w, h, 4, 0.65, 12, 5501);
  const aggregateNoise = createSeamlessNoise(w, h, 2, 5502);

  const rgba = new Uint8Array(w * h * 4);
  const heightMap = new Float32Array(w * h);
  const merData = new Uint8Array(w * h * 4);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      const b = bitumenNoise[idx];
      const agg = aggregateNoise[idx];

      // Dark asphalt bitumen with fine aggregate chips:
      let gray = 42 + b * 22 + (agg - 0.5) * 16;
      let r = gray;
      let g = gray + 1;
      let bl = gray + 2;

      // Small mineral aggregate flecks (grey/sand stone bits in asphalt)
      if (agg > 0.78) {
        r += 32; g += 30; bl += 28;
      }

      // Painted white road center marking line (8px wide, vertical)
      const isRoadLine = withLine && (Math.abs(x - w / 2) < 5);
      if (isRoadLine) {
        // Crisp slightly worn road paint
        const wear = (b - 0.5) * 35;
        r = Math.min(255, 235 + wear);
        g = Math.min(255, 235 + wear);
        bl = Math.min(255, 238 + wear);
      }

      r = Math.min(255, Math.max(0, Math.round(r)));
      g = Math.min(255, Math.max(0, Math.round(g)));
      bl = Math.min(255, Math.max(0, Math.round(bl)));

      rgba[idx * 4 + 0] = r;
      rgba[idx * 4 + 1] = g;
      rgba[idx * 4 + 2] = bl;
      rgba[idx * 4 + 3] = 255;

      heightMap[idx] = 0.5 + b * 0.3 + (isRoadLine ? 0.1 : 0);
      merData[idx * 4 + 0] = 0;
      merData[idx * 4 + 1] = 0;
      merData[idx * 4 + 2] = 225; // Matte asphalt
      merData[idx * 4 + 3] = 255;
    }
  }

  return { rgba, heightMap, merData, w, h };
}

// -------------------------------------------------------------
// 9. TIMBER FRAME BEAM / CHARPENTE (Poutres massives équarries)
// -------------------------------------------------------------
function generateCharpenteBeam(w = 128, h = 128) {
  const woodNoise = createSeamlessNoise(w, h, 32, 9901);
  const grainNoise = createSeamlessNoise(w, h, 6, 9902);
  const adzeNoise = createFractalNoise(w, h, 3, 0.6, 16, 9903);

  const rgba = new Uint8Array(w * h * 4);
  const heightMap = new Float32Array(w * h);
  const merData = new Uint8Array(w * h * 4);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      // Longitudinal grain
      const grain = Math.sin((x * 0.12) + woodNoise[idx] * 4 + grainNoise[idx] * 2) * 0.5 + 0.5;
      const adze = adzeNoise[idx];

      // Hand-hewn timber beam (honey oak / raw lumber)
      let r = 175 + grain * 28 + (adze - 0.5) * 18;
      let g = 136 + grain * 22 + (adze - 0.5) * 14;
      let b = 88 + grain * 16 + (adze - 0.5) * 10;

      // Longitudinal drying check (natural crack in timber beam)
      const isCheck = Math.abs(x - 48 + Math.sin(y * 0.1) * 3) < 1.5;
      if (isCheck) {
        r = 60; g = 45; b = 28;
      }

      // Edge chamfer on borders
      if (x < 3 || x >= w - 3) {
        r *= 0.75; g *= 0.75; b *= 0.75;
      }

      r = Math.min(255, Math.max(0, Math.round(r)));
      g = Math.min(255, Math.max(0, Math.round(g)));
      b = Math.min(255, Math.max(0, Math.round(b)));

      rgba[idx * 4 + 0] = r;
      rgba[idx * 4 + 1] = g;
      rgba[idx * 4 + 2] = b;
      rgba[idx * 4 + 3] = 255;

      heightMap[idx] = 0.65 + grain * 0.25 - (isCheck ? 0.4 : 0);
      merData[idx * 4 + 0] = 0;
      merData[idx * 4 + 1] = 0;
      merData[idx * 4 + 2] = 215;
      merData[idx * 4 + 3] = 255;
    }
  }

  return { rgba, heightMap, merData, w, h };
}

// -------------------------------------------------------------
// 10. ORGANIC CUMULUS CLOUDS (Nuages réalistes non carrés)
// -------------------------------------------------------------
function generatePhotorealisticClouds(w = 256, h = 256) {
  const noise1 = createFractalNoise(w, h, 5, 0.55, 64, 4401);
  const noise2 = createFractalNoise(w, h, 4, 0.6, 24, 4402);
  const rgba = new Uint8Array(w * h * 4);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      const cloudShape = noise1[idx] * 0.7 + noise2[idx] * 0.3;

      // Soft vaporous cutoff
      if (cloudShape > 0.48) {
        const density = Math.min(1.0, (cloudShape - 0.48) / 0.32);
        // Sun-illuminated silver lining at crest, soft blue-gray shaded base
        const yShade = y / h;
        const r = Math.round(245 - yShade * 30);
        const g = Math.round(248 - yShade * 25);
        const b = Math.round(255 - yShade * 15);
        const alpha = Math.round(density * 220);

        rgba[idx * 4 + 0] = r;
        rgba[idx * 4 + 1] = g;
        rgba[idx * 4 + 2] = b;
        rgba[idx * 4 + 3] = alpha;
      } else {
        rgba[idx * 4 + 3] = 0;
      }
    }
  }

  return { rgba, w, h };
}

module.exports = {
  generateNormalMap,
  generatePhotorealisticDirt,
  generatePhotorealisticGrassTop,
  generatePhotorealisticGrassSide,
  generatePhotorealisticDirtPath,
  generateWaterFrame,
  generateWaterFlipbook32,
  generateModernSmartphone,
  generatePhotorealisticPaintbrush,
  generatePhotorealisticAsphalt,
  generateCharpenteBeam,
  generatePhotorealisticClouds
};
