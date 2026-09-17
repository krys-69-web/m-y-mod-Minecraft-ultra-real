const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');
const JSZip = require('jszip');
const crypto = require('crypto');

// Target directories
const ROOT_PACK_DIR = path.join(__dirname, '..', 'REALISM+ 8K');
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const PUBLIC_PACK_DIR = path.join(PUBLIC_DIR, 'realism_pack');

// Helpers for procedural noise and textures
function createNoise(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return function() {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// Pseudo-perlin / value noise 2D seamless
function createSeamlessNoise(width, height, scale, seed = 1234) {
  const gridW = Math.max(2, Math.floor(width / scale));
  const gridH = Math.max(2, Math.floor(height / scale));
  const rand = createNoise(seed);
  const grid = new Float32Array(gridW * gridH);
  for (let i = 0; i < gridW * gridH; i++) {
    grid[i] = rand();
  }

  function getVal(gx, gy) {
    const x = ((gx % gridW) + gridW) % gridW;
    const y = ((gy % gridH) + gridH) % gridH;
    return grid[y * gridW + x];
  }

  function smooth(t) {
    return t * t * (3 - 2 * t);
  }

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

// Fractal Brownian Motion (fBm) seamless
function createFractalNoise(width, height, octaves = 4, persistence = 0.5, baseScale = 16, seed = 42) {
  const result = new Float32Array(width * height);
  let amp = 1.0;
  let totalAmp = 0;
  let scale = baseScale;

  for (let o = 0; o < octaves; o++) {
    const layer = createSeamlessNoise(width, height, scale, seed + o * 1013);
    for (let i = 0; i < width * height; i++) {
      result[i] += layer[i] * amp;
    }
    totalAmp += amp;
    amp *= persistence;
    scale = Math.max(2, Math.floor(scale / 2));
  }

  for (let i = 0; i < width * height; i++) {
    result[i] /= totalAmp;
  }
  return result;
}

// Compute normal map from height map using Sobel
function generateNormalMap(heightMap, width, height, strength = 2.5) {
  const normalMap = new Uint8Array(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const getH = (nx, ny) => {
        const wrapX = ((nx % width) + width) % width;
        const wrapY = ((ny % height) + height) % height;
        return heightMap[wrapY * width + wrapX];
      };

      // Sobel kernel
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
      nx /= len;
      ny /= len;
      nz /= len;

      const idx = (y * width + x) * 4;
      normalMap[idx + 0] = Math.round((nx * 0.5 + 0.5) * 255);
      normalMap[idx + 1] = Math.round((ny * 0.5 + 0.5) * 255);
      normalMap[idx + 2] = Math.round((nz * 0.5 + 0.5) * 255);
      normalMap[idx + 3] = 255;
    }
  }
  return normalMap;
}

const extra = require('./extra_blocks.cjs');
const photo = require('./photorealistic_terrain.cjs');

function savePng(buffer, width, height, filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const png = new PNG({ width, height });
  png.data = Buffer.from(buffer);
  fs.writeFileSync(filePath, PNG.sync.write(png, { deflateLevel: 4 }));
}

// ==========================================
// TEXTURE GENERATORS (Natural, Rich, Bedrock)
// ==========================================

// 1. DIRT (128x128) - Organic humus, mineral grains, subtle humidity, tiny roots
function generateDirt(w = 128, h = 128) {
  const noise1 = createFractalNoise(w, h, 4, 0.5, 32, 101);
  const noise2 = createFractalNoise(w, h, 3, 0.6, 8, 202);
  const noiseFine = createFractalNoise(w, h, 2, 0.7, 4, 303);
  const rand = createNoise(404);

  const rgba = new Uint8Array(w * h * 4);
  const heightMap = new Float32Array(w * h);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      const baseN = noise1[idx];
      const fineN = noise2[idx];
      const grit = noiseFine[idx];

      // Nostalgic warm fertile loam palette (classic Minecraft warm brown)
      let r = 108 + baseN * 38 + fineN * 16;
      let g = 76 + baseN * 26 + fineN * 12;
      let b = 48 + baseN * 18 + fineN * 8;

      // Small mineral pebbles / sand grains
      if (grit > 0.74) {
        const boost = (grit - 0.74) * 120;
        r += boost * 0.9;
        g += boost * 0.85;
        b += boost * 0.7;
      }

      // Small organic rootlets / humus fragments
      if (rand() > 0.985) {
        r = Math.max(35, r - 35);
        g = Math.max(25, g - 25);
        b = Math.max(15, b - 15);
      }

      // Micro humidity patches
      if (baseN < 0.35) {
        const hum = (0.35 - baseN) * 40;
        r = Math.max(40, r - hum * 0.7);
        g = Math.max(30, g - hum * 0.7);
        b = Math.max(20, b - hum * 0.5);
      }

      r = Math.min(255, Math.max(0, Math.round(r)));
      g = Math.min(255, Math.max(0, Math.round(g)));
      b = Math.min(255, Math.max(0, Math.round(b)));

      rgba[idx * 4 + 0] = r;
      rgba[idx * 4 + 1] = g;
      rgba[idx * 4 + 2] = b;
      rgba[idx * 4 + 3] = 255;

      heightMap[idx] = (r * 0.299 + g * 0.587 + b * 0.114) / 255.0;
    }
  }

  return { rgba, heightMap, w, h };
}

// 2. STONE (128x128) - Natural fissures, mineral grains, slate/granite crystalline micro-relief
// PBR Physical Consistency: Dielectric (Metallic = 0), Mostly matte (Roughness ~215-238), Subtle relief
function generateStone(w = 128, h = 128) {
  const baseNoise = createFractalNoise(w, h, 5, 0.55, 32, 501);
  const grainNoise = createFractalNoise(w, h, 3, 0.6, 6, 602);
  const fissureNoise = createFractalNoise(w, h, 4, 0.65, 16, 703);

  const rgba = new Uint8Array(w * h * 4);
  const heightMap = new Float32Array(w * h);
  const roughnessMap = new Uint8Array(w * h);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      const n = baseNoise[idx];
      const grain = grainNoise[idx];
      const fiss = fissureNoise[idx];

      // Sophisticated neutral stone with warm mineral undertone
      // Gray ~ 118-158
      let gray = 115 + n * 40 + grain * 18;
      let r = gray + 3; // subtle warm undertone
      let g = gray + 2;
      let b = gray;

      // Base roughness for natural slate/granite: matte non-plastic
      let roughness = 222 + (n - 0.5) * 16;

      // Natural irregular rock fissures
      const crackVal = Math.abs(fiss - 0.5) * 2;
      if (crackVal < 0.08) {
        const crackDepth = (1.0 - (crackVal / 0.08));
        r -= crackDepth * 42;
        g -= crackDepth * 40;
        b -= crackDepth * 38;
        roughness += crackDepth * 18; // cracks are rougher / occluded
      }

      // Small quartz/feldspar mineral flecks
      if (grain > 0.78) {
        const spec = (grain - 0.78) * 90;
        r += spec * 1.1;
        g += spec * 1.05;
        b += spec * 1.0;
        roughness -= (grain - 0.78) * 60; // polished crystalline inclusions are smoother
      }

      r = Math.min(255, Math.max(0, Math.round(r)));
      g = Math.min(255, Math.max(0, Math.round(g)));
      b = Math.min(255, Math.max(0, Math.round(b)));

      rgba[idx * 4 + 0] = r;
      rgba[idx * 4 + 1] = g;
      rgba[idx * 4 + 2] = b;
      rgba[idx * 4 + 3] = 255;

      heightMap[idx] = (r * 0.299 + g * 0.587 + b * 0.114) / 255.0;
      roughnessMap[idx] = Math.min(245, Math.max(195, Math.round(roughness)));
    }
  }

  return { rgba, heightMap, roughnessMap, w, h };
}

// 3. GRASS TOP (128x128) - Lush blades, micro-vegetation, rich natural greens, golden warmth
function generateGrassTop(w = 128, h = 128) {
  const clumpNoise = createFractalNoise(w, h, 4, 0.5, 24, 801);
  const bladeNoise = createFractalNoise(w, h, 3, 0.7, 4, 902);
  const rand = createNoise(999);

  const rgba = new Uint8Array(w * h * 4);
  const heightMap = new Float32Array(w * h);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      const clump = clumpNoise[idx];
      const blade = bladeNoise[idx];

      // Nostalgic classic vibrant lush greens (vibrant emerald and sunlit lime)
      let r = 52 + clump * 32 + blade * 20;
      let g = 142 + clump * 60 + blade * 36;
      let b = 28 + clump * 18 + blade * 12;

      // Small blade highlights (sun kissed tips)
      if (blade > 0.68) {
        const tip = (blade - 0.68) * 60;
        r += tip * 0.8;
        g += tip * 1.3;
        b += tip * 0.35;
      }

      // Micro shadows between blades
      if (blade < 0.32) {
        const shade = (0.32 - blade) * 45;
        r = Math.max(25, r - shade);
        g = Math.max(55, g - shade * 1.2);
        b = Math.max(15, b - shade * 0.8);
      }

      // Micro clover / flowering detail
      if (rand() > 0.992) {
        r += 25;
        g += 35;
        b += 10;
      }

      r = Math.min(255, Math.max(0, Math.round(r)));
      g = Math.min(255, Math.max(0, Math.round(g)));
      b = Math.min(255, Math.max(0, Math.round(b)));

      rgba[idx * 4 + 0] = r;
      rgba[idx * 4 + 1] = g;
      rgba[idx * 4 + 2] = b;
      rgba[idx * 4 + 3] = 255;

      heightMap[idx] = (r * 0.2 + g * 0.7 + b * 0.1) / 255.0;
    }
  }

  return { rgba, heightMap, w, h };
}

// 4. GRASS SIDE (128x128) - Dirt body with natural hanging turf/roots overhang
function generateGrassSide(dirtData, grassTopData, w = 128, h = 128) {
  const rgba = new Uint8Array(w * h * 4);
  const heightMap = new Float32Array(w * h);
  const turfNoise = createSeamlessNoise(w, h, 12, 1122);
  const rand = createNoise(777);

  const turfDepthBase = Math.floor(h * 0.24); // ~30 pixels

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      // Irregular hanging turf edge
      const edgeVariation = Math.sin(x * 0.3) * 3 + (turfNoise[idx] - 0.5) * 10;
      const turfLimit = turfDepthBase + edgeVariation;

      if (y < turfLimit) {
        // Grass turf overhang
        const gR = grassTopData.rgba[idx * 4 + 0];
        const gG = grassTopData.rgba[idx * 4 + 1];
        const gB = grassTopData.rgba[idx * 4 + 2];

        // Slightly darker near transition to dirt
        const blendFactor = y / turfLimit;
        const shade = blendFactor * 25;

        rgba[idx * 4 + 0] = Math.max(0, gR - shade * 0.8);
        rgba[idx * 4 + 1] = Math.max(0, gG - shade);
        rgba[idx * 4 + 2] = Math.max(0, gB - shade * 0.6);
        rgba[idx * 4 + 3] = 255;
        heightMap[idx] = 0.65 - blendFactor * 0.1;
      } else if (y < turfLimit + 4 && rand() > 0.4) {
        // Micro rootlets trailing into dirt
        rgba[idx * 4 + 0] = 70;
        rgba[idx * 4 + 1] = 95;
        rgba[idx * 4 + 2] = 40;
        rgba[idx * 4 + 3] = 255;
        heightMap[idx] = 0.5;
      } else {
        // Dirt base
        rgba[idx * 4 + 0] = dirtData.rgba[idx * 4 + 0];
        rgba[idx * 4 + 1] = dirtData.rgba[idx * 4 + 1];
        rgba[idx * 4 + 2] = dirtData.rgba[idx * 4 + 2];
        rgba[idx * 4 + 3] = 255;
        heightMap[idx] = dirtData.heightMap[idx] * 0.8;
      }
    }
  }

  return { rgba, heightMap, w, h };
}

// 5. SAND (128x128) - Fine silica grains, soft micro-ripples, warm golden hour tint
function generateSand(w = 128, h = 128) {
  const duneNoise = createFractalNoise(w, h, 3, 0.6, 32, 1301);
  const grainNoise = createFractalNoise(w, h, 2, 0.7, 4, 1402);
  const fineGrit = createSeamlessNoise(w, h, 2, 1503);

  const rgba = new Uint8Array(w * h * 4);
  const heightMap = new Float32Array(w * h);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      // Subtle wind ripple direction
      const ripple = Math.sin((x * 0.25 + y * 0.15)) * 0.08;
      const dune = duneNoise[idx] + ripple;
      const grain = grainNoise[idx];
      const grit = fineGrit[idx];

      // Nostalgic radiant golden beach sand palette
      let r = 218 + dune * 24 + grain * 12 + (grit - 0.5) * 8;
      let g = 194 + dune * 22 + grain * 10 + (grit - 0.5) * 8;
      let b = 132 + dune * 18 + grain * 8 + (grit - 0.5) * 6;

      // Subtle quartz sheen
      if (grit > 0.88) {
        r += 12;
        g += 10;
        b += 8;
      }

      r = Math.min(255, Math.max(0, Math.round(r)));
      g = Math.min(255, Math.max(0, Math.round(g)));
      b = Math.min(255, Math.max(0, Math.round(b)));

      rgba[idx * 4 + 0] = r;
      rgba[idx * 4 + 1] = g;
      rgba[idx * 4 + 2] = b;
      rgba[idx * 4 + 3] = 255;

      heightMap[idx] = (r * 0.3 + g * 0.5 + b * 0.2) / 255.0;
    }
  }

  return { rgba, heightMap, w, h };
}

// 6. OAK BARK (128x128) - Vertical fibrous ridges, deep furrows, bark plates, natural knots
function generateOakBark(w = 128, h = 128) {
  const vertNoise = createSeamlessNoise(w, h, 64, 1601);
  const fineVert = createSeamlessNoise(w, h, 8, 1702);
  const detailNoise = createFractalNoise(w, h, 4, 0.5, 16, 1803);

  const rgba = new Uint8Array(w * h * 4);
  const heightMap = new Float32Array(w * h);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      // Vertical ridges stretching along Y
      const fiberX = Math.sin((x / w) * Math.PI * 8 + vertNoise[idx] * 2.5);
      const furrow = Math.abs(fiberX);
      const detail = detailNoise[idx];
      const fine = fineVert[idx];

      // Oak bark palette: deep furrow brown (55, 42, 28) to crest beige/grey (118, 96, 68)
      let r = 65 + furrow * 45 + detail * 20 + fine * 8;
      let g = 50 + furrow * 36 + detail * 16 + fine * 6;
      let b = 34 + furrow * 26 + detail * 12 + fine * 4;

      // Dark shadow in the deep furrows
      if (furrow < 0.25) {
        const shadow = (0.25 - furrow) * 60;
        r = Math.max(30, r - shadow);
        g = Math.max(22, g - shadow);
        b = Math.max(14, b - shadow);
      }

      // Lichen / moss spot occasional
      if (x > 30 && x < 55 && y > 40 && y < 75 && detail > 0.65) {
        r = Math.round(r * 0.85);
        g = Math.min(255, Math.round(g * 1.25));
        b = Math.round(b * 0.9);
      }

      r = Math.min(255, Math.max(0, Math.round(r)));
      g = Math.min(255, Math.max(0, Math.round(g)));
      b = Math.min(255, Math.max(0, Math.round(b)));

      rgba[idx * 4 + 0] = r;
      rgba[idx * 4 + 1] = g;
      rgba[idx * 4 + 2] = b;
      rgba[idx * 4 + 3] = 255;

      heightMap[idx] = furrow * 0.7 + detail * 0.3;
    }
  }

  return { rgba, heightMap, w, h };
}

// 7. OAK LOG TOP (128x128) - Concentric annual rings, cambium layer, sapwood, heartwood
function generateOakLogTop(w = 128, h = 128) {
  const barkWidth = Math.floor(w * 0.12);
  const cx = w / 2;
  const cy = h / 2;
  const noise = createFractalNoise(w, h, 3, 0.5, 16, 1901);

  const rgba = new Uint8Array(w * h * 4);
  const heightMap = new Float32Array(w * h);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxRadius = w * 0.44;

      if (dist > maxRadius) {
        // Outer bark rim
        const n = noise[idx];
        rgba[idx * 4 + 0] = Math.round(75 + n * 25);
        rgba[idx * 4 + 1] = Math.round(58 + n * 20);
        rgba[idx * 4 + 2] = Math.round(40 + n * 15);
        rgba[idx * 4 + 3] = 255;
        heightMap[idx] = 0.8;
      } else {
        // Concentric annual rings
        const ringDist = dist + (noise[idx] - 0.5) * 5;
        const ring = Math.sin(ringDist * 0.8) * 0.5 + 0.5;
        const heartFactor = 1.0 - (dist / maxRadius);

        // Heartwood warmer/darker, sapwood lighter honey oak
        let r = 160 + heartFactor * 25 + ring * 18 + noise[idx] * 12;
        let g = 128 + heartFactor * 16 + ring * 14 + noise[idx] * 10;
        let b = 88 + heartFactor * 8 + ring * 8 + noise[idx] * 6;

        // Subtle radial drying checks
        const angle = Math.atan2(dy, dx);
        if (Math.abs(Math.sin(angle * 5)) < 0.05 && dist > 10 && dist < maxRadius - 5) {
          r -= 35;
          g -= 30;
          b -= 25;
        }

        r = Math.min(255, Math.max(0, Math.round(r)));
        g = Math.min(255, Math.max(0, Math.round(g)));
        b = Math.min(255, Math.max(0, Math.round(b)));

        rgba[idx * 4 + 0] = r;
        rgba[idx * 4 + 1] = g;
        rgba[idx * 4 + 2] = b;
        rgba[idx * 4 + 3] = 255;

        heightMap[idx] = 0.5 + ring * 0.2;
      }
    }
  }

  return { rgba, heightMap, w, h };
}

// 8. OAK PLANKS (128x128) - 4 clean horizontal wood planks, wood grain, subtle beveled joints, nail accents
function generateOakPlanks(w = 128, h = 128) {
  const planksCount = 4;
  const plankH = h / planksCount;
  const grainNoise = createSeamlessNoise(w, h, 32, 2001);
  const fineGrain = createSeamlessNoise(w, h, 6, 2102);

  const rgba = new Uint8Array(w * h * 4);
  const heightMap = new Float32Array(w * h);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      const plankIdx = Math.floor(y / plankH);
      const localY = y % plankH;

      // Wood grain stretched horizontally
      const grain = Math.sin((x * 0.1) + grainNoise[idx] * 6 + fineGrain[idx] * 2) * 0.5 + 0.5;

      // Nostalgic warm honey-amber oak planks tone (classic homey Minecraft cabin vibe)
      const plankOffset = (plankIdx * 37) % 15 - 7;
      let r = 182 + plankOffset + grain * 22;
      let g = 142 + plankOffset + grain * 16;
      let b = 92 + plankOffset + grain * 12;

      // Beveled groove between planks
      let hVal = 0.65;
      if (localY === 0 || localY === plankH - 1) {
        // Deep groove joint
        r = Math.max(40, r - 70);
        g = Math.max(30, g - 60);
        b = Math.max(18, b - 45);
        hVal = 0.1;
      } else if (localY === 1 || localY === plankH - 2) {
        // Chamfer shadow
        r = Math.max(60, r - 30);
        g = Math.max(45, g - 25);
        b = Math.max(30, b - 20);
        hVal = 0.35;
      }

      // Small authentic iron nail heads near ends of planks
      const nailX1 = 12;
      const nailX2 = w - 14;
      const nailY = Math.floor(plankH * 0.5);
      const isNail = (Math.abs(x - nailX1) <= 1 || Math.abs(x - nailX2) <= 1) && Math.abs(localY - nailY) <= 1;
      if (isNail) {
        r = 65;
        g = 65;
        b = 70;
        hVal = 0.5;
      }

      r = Math.min(255, Math.max(0, Math.round(r)));
      g = Math.min(255, Math.max(0, Math.round(g)));
      b = Math.min(255, Math.max(0, Math.round(b)));

      rgba[idx * 4 + 0] = r;
      rgba[idx * 4 + 1] = g;
      rgba[idx * 4 + 2] = b;
      rgba[idx * 4 + 3] = 255;

      heightMap[idx] = hVal;
    }
  }

  return { rgba, heightMap, w, h };
}

// 9. OAK LEAVES (128x128) - Dense organic foliage, leafy cutouts with crisp alpha, volume
function generateOakLeaves(w = 128, h = 128) {
  const leafClusterNoise = createFractalNoise(w, h, 4, 0.6, 12, 2201);
  const detailNoise = createFractalNoise(w, h, 2, 0.7, 4, 2302);
  const rand = createNoise(2403);

  const rgba = new Uint8Array(w * h * 4);
  const heightMap = new Float32Array(w * h);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      const cluster = leafClusterNoise[idx];
      const detail = detailNoise[idx];

      // Controlled alpha transparency for dense foliage (not sparse, not solid)
      // Cutout gaps between leaf clusters
      const isHole = cluster < 0.31 && detail < 0.45;

      if (isHole) {
        rgba[idx * 4 + 0] = 0;
        rgba[idx * 4 + 1] = 0;
        rgba[idx * 4 + 2] = 0;
        rgba[idx * 4 + 3] = 0; // Cutout transparent
        heightMap[idx] = 0;
      } else {
        // Rich foliage palette: (42, 105, 26) to (88, 168, 52)
        let r = 45 + cluster * 40 + detail * 18;
        let g = 98 + cluster * 65 + detail * 30;
        let b = 24 + cluster * 22 + detail * 14;

        // Leaf vein highlight
        if (detail > 0.75) {
          r += 20;
          g += 30;
          b += 12;
        }

        r = Math.min(255, Math.max(0, Math.round(r)));
        g = Math.min(255, Math.max(0, Math.round(g)));
        b = Math.min(255, Math.max(0, Math.round(b)));

        rgba[idx * 4 + 0] = r;
        rgba[idx * 4 + 1] = g;
        rgba[idx * 4 + 2] = b;
        rgba[idx * 4 + 3] = 255;

        heightMap[idx] = cluster * 0.7 + detail * 0.3;
      }
    }
  }

  return { rgba, heightMap, w, h };
}

// 10. COBBLESTONE (128x128) - Natural rounded stones set in mortar, rich relief
function generateCobblestone(w = 128, h = 128) {
  const voronoiNoise = createFractalNoise(w, h, 4, 0.6, 20, 2501);
  const textureNoise = createFractalNoise(w, h, 3, 0.6, 6, 2602);

  const rgba = new Uint8Array(w * h * 4);
  const heightMap = new Float32Array(w * h);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      const v = voronoiNoise[idx];
      const grain = textureNoise[idx];

      // Simulated stone boundary mortar groove
      const isMortar = Math.abs(v - 0.45) < 0.05;

      let r, g, b, hVal;
      if (isMortar) {
        // Dark sandy mortar
        r = 68 + grain * 16;
        g = 66 + grain * 14;
        b = 62 + grain * 12;
        hVal = 0.2;
      } else {
        // Stone face: gray-slate with individual stone tone shift
        const stoneShade = Math.sin(v * 12) * 15;
        r = 118 + stoneShade + grain * 22;
        g = 115 + stoneShade + grain * 20;
        b = 112 + stoneShade + grain * 18;
        hVal = 0.5 + (0.5 - Math.abs(v - 0.5)) * 0.5;
      }

      r = Math.min(255, Math.max(0, Math.round(r)));
      g = Math.min(255, Math.max(0, Math.round(g)));
      b = Math.min(255, Math.max(0, Math.round(b)));

      rgba[idx * 4 + 0] = r;
      rgba[idx * 4 + 1] = g;
      rgba[idx * 4 + 2] = b;
      rgba[idx * 4 + 3] = 255;

      heightMap[idx] = hVal;
    }
  }

  return { rgba, heightMap, w, h };
}

// 11. WATER (128x128 per frame, 16-frame procedural seamless cyclic flipbook)
// Natural transparency, visual depth gradient, gentle wave caustics, and directional flow
function generateWaterFrame(w = 128, h = 128, frameIndex = 0, totalFrames = 16, isFlow = false) {
  const rgba = new Uint8Array(w * h * 4);
  const heightMap = new Float32Array(w * h);

  // Cyclic time phase (0 to 2*PI) ensures flawless seamless loop frame 15 -> frame 0
  const phase = (frameIndex / totalFrames) * Math.PI * 2;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      const nx = (x / w) * Math.PI * 2;
      const ny = (y / h) * Math.PI * 2;

      // Downward flow offset if isFlow
      const flowY = isFlow ? ((y + (frameIndex / totalFrames) * h) % h) / h * Math.PI * 2 : ny;

      // Multi-frequency wave harmonic interference (seamless 2PI periodic)
      const w1 = Math.sin(nx * 3 + phase) * Math.cos(flowY * 3 + phase * 0.8);
      const w2 = Math.sin((nx + flowY) * 2.5 - phase * 1.2);
      const w3 = Math.cos((nx * 4 - flowY * 3) + phase * 1.5) * 0.5;
      const w4 = Math.sin(nx * 6 + flowY * 6 + phase * 2.0) * 0.25;

      // Normalized wave height [0, 1]
      const waveVal = Math.min(1.0, Math.max(0.0, (w1 + w2 + w3 + w4 + 2.75) / 5.5));

      // Pristine crystal-clear light blue water gradient (Bleu clair & Haute transparence):
      // Allows riverbed sand, gravel, and sea floor to be clearly visible through the surface
      let r = 70 + waveVal * 42;
      let g = 175 + waveVal * 55;
      let b = 235 + waveVal * 20;

      // Calibrated high-transparency water (Alpha ~60-90 out of 255, approx 24-35% opacity)
      // Diminue l'opacité pour voir nettement le fond de l'eau
      const alpha = Math.round(58 + (1.0 - waveVal) * 26);

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

// Generate vertical animated strip for Bedrock flipbook (128 x (128 * frames))
function generateWaterFlipbook(w = 128, h = 128, totalFrames = 16, isFlow = false) {
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

// 12. GLASS (128x128) - Ultra clean modern architectural glass with sleek border and faint specular
function generateGlass(w = 128, h = 128) {
  const rgba = new Uint8Array(w * h * 4);
  const heightMap = new Float32Array(w * h);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      const isBorder = (x < 3 || x >= w - 3 || y < 3 || y >= h - 3);
      const isInnerBevel = (x === 3 || x === w - 4 || y === 3 || y === h - 4);

      if (isBorder) {
        rgba[idx * 4 + 0] = 215;
        rgba[idx * 4 + 1] = 230;
        rgba[idx * 4 + 2] = 240;
        rgba[idx * 4 + 3] = 235;
        heightMap[idx] = 1.0;
      } else if (isInnerBevel) {
        rgba[idx * 4 + 0] = 180;
        rgba[idx * 4 + 1] = 210;
        rgba[idx * 4 + 2] = 230;
        rgba[idx * 4 + 3] = 90;
        heightMap[idx] = 0.5;
      } else {
        // Ultra clean glass with faint diagonal light reflection
        const diag = Math.abs(x - y);
        const hasStreak = (diag > 18 && diag < 24) || (diag > 48 && diag < 52);
        if (hasStreak) {
          rgba[idx * 4 + 0] = 240;
          rgba[idx * 4 + 1] = 248;
          rgba[idx * 4 + 2] = 255;
          rgba[idx * 4 + 3] = 38;
        } else {
          rgba[idx * 4 + 0] = 210;
          rgba[idx * 4 + 1] = 230;
          rgba[idx * 4 + 2] = 245;
          rgba[idx * 4 + 3] = 12; // Almost invisible center for true realism
        }
        heightMap[idx] = 0.1;
      }
    }
  }

  return { rgba, heightMap, w, h };
}

// 13. GRAVEL (128x128) - Multi-tone river stones and grit
function generateGravel(w = 128, h = 128) {
  const pebbles = createFractalNoise(w, h, 4, 0.65, 12, 3101);
  const grit = createFractalNoise(w, h, 2, 0.7, 4, 3202);

  const rgba = new Uint8Array(w * h * 4);
  const heightMap = new Float32Array(w * h);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      const p = pebbles[idx];
      const g = grit[idx];

      // Varied pebbles: grey, slate, sandstone flecks
      let r = 105 + p * 40 + g * 20;
      let gr = 100 + p * 38 + g * 18;
      let b = 95 + p * 35 + g * 16;

      // Warm sandstone pebble occasional
      if (p > 0.65) {
        r += 18;
        gr += 10;
      }

      r = Math.min(255, Math.max(0, Math.round(r)));
      gr = Math.min(255, Math.max(0, Math.round(gr)));
      b = Math.min(255, Math.max(0, Math.round(b)));

      rgba[idx * 4 + 0] = r;
      rgba[idx * 4 + 1] = gr;
      rgba[idx * 4 + 2] = b;
      rgba[idx * 4 + 3] = 255;

      heightMap[idx] = p * 0.7 + g * 0.3;
    }
  }

  return { rgba, heightMap, w, h };
}

// 14. BRICKS (128x128) - Terracotta clay bricks, neat white/grey mortar
function generateBricks(w = 128, h = 128) {
  const rowH = 16;
  const colW = 32;
  const grainNoise = createFractalNoise(w, h, 3, 0.6, 6, 3301);

  const rgba = new Uint8Array(w * h * 4);
  const heightMap = new Float32Array(w * h);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      const row = Math.floor(y / rowH);
      const rowY = y % rowH;
      // Stagger rows
      const shiftedX = (row % 2 === 1) ? (x + colW / 2) % w : x;
      const col = Math.floor(shiftedX / colW);
      const colX = shiftedX % colW;

      const isMortar = rowY < 2 || colX < 2;
      const grain = grainNoise[idx];

      let r, g, b, hVal;
      if (isMortar) {
        r = 185 + grain * 20;
        g = 180 + grain * 18;
        b = 175 + grain * 16;
        hVal = 0.2;
      } else {
        // Nostalgic warm terracotta fired red brick with clean mortar
        const brickTone = (col * 17 + row * 29) % 25 - 12;
        r = 172 + brickTone + grain * 28;
        g = 72 + brickTone * 0.6 + grain * 16;
        b = 56 + brickTone * 0.4 + grain * 12;
        hVal = 0.75;
      }

      r = Math.min(255, Math.max(0, Math.round(r)));
      g = Math.min(255, Math.max(0, Math.round(g)));
      b = Math.min(255, Math.max(0, Math.round(b)));

      rgba[idx * 4 + 0] = r;
      rgba[idx * 4 + 1] = g;
      rgba[idx * 4 + 2] = b;
      rgba[idx * 4 + 3] = 255;

      heightMap[idx] = hVal;
    }
  }

  return { rgba, heightMap, w, h };
}

// 15. DEEPSLATE (128x128) - Stratified dark slate with chiseled layers
function generateDeepslate(w = 128, h = 128) {
  const layerNoise = createFractalNoise(w, h, 4, 0.6, 20, 3401);
  const grainNoise = createFractalNoise(w, h, 2, 0.7, 4, 3502);

  const rgba = new Uint8Array(w * h * 4);
  const heightMap = new Float32Array(w * h);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      const layer = Math.sin((y * 0.2) + layerNoise[idx] * 4) * 0.5 + 0.5;
      const grain = grainNoise[idx];

      // Deep charcoal/slate
      let gray = 48 + layer * 22 + grain * 14;
      let r = gray + 2;
      let g = gray + 3;
      let b = gray + 6; // subtle cool slate blue undertone

      r = Math.min(255, Math.max(0, Math.round(r)));
      g = Math.min(255, Math.max(0, Math.round(g)));
      b = Math.min(255, Math.max(0, Math.round(b)));

      rgba[idx * 4 + 0] = r;
      rgba[idx * 4 + 1] = g;
      rgba[idx * 4 + 2] = b;
      rgba[idx * 4 + 3] = 255;

      heightMap[idx] = layer * 0.6 + grain * 0.4;
    }
  }

  return { rgba, heightMap, w, h };
}

// 15b. IRON ORE (128x128) - Natural slate host rock with embedded hematite/raw iron mineral nodules
// PBR Physical Consistency: Host rock dielectric matte (M:0, R:222) vs. Ore clusters metallic specular (M:185, R:105)
function generateIronOre(stoneData, w = 128, h = 128) {
  const rgba = new Uint8Array(w * h * 4);
  const heightMap = new Float32Array(w * h);
  const merData = new Uint8Array(w * h * 4);

  // 5 organic mineral ore nodules
  const clusters = [
    { cx: 38, cy: 36, rx: 14, ry: 11, angle: 0.3 },
    { cx: 88, cy: 42, rx: 13, ry: 15, angle: -0.4 },
    { cx: 58, cy: 82, rx: 16, ry: 13, angle: 0.6 },
    { cx: 102, cy: 96, rx: 11, ry: 10, angle: 0.1 },
    { cx: 24, cy: 104, rx: 10, ry: 8, angle: -0.2 }
  ];

  const edgeNoise = createFractalNoise(w, h, 3, 0.6, 8, 4102);
  const crystalNoise = createFractalNoise(w, h, 2, 0.7, 3, 4203);

  // Initialize with host stone data for seamless environment continuity
  for (let i = 0; i < w * h; i++) {
    rgba[i * 4 + 0] = stoneData.rgba[i * 4 + 0];
    rgba[i * 4 + 1] = stoneData.rgba[i * 4 + 1];
    rgba[i * 4 + 2] = stoneData.rgba[i * 4 + 2];
    rgba[i * 4 + 3] = 255;
    heightMap[i] = stoneData.heightMap[i];
    // Host stone MER: Metalness 0, Emissive 0, Roughness from stone
    merData[i * 4 + 0] = 0;
    merData[i * 4 + 1] = 0;
    merData[i * 4 + 2] = stoneData.roughnessMap ? stoneData.roughnessMap[i] : 222;
    merData[i * 4 + 3] = 255;
  }

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      const nEdge = edgeNoise[idx];
      const nCryst = crystalNoise[idx];

      let maxInfluence = 0;
      let isFissure = false;

      for (const cl of clusters) {
        const dx = x - cl.cx;
        const dy = y - cl.cy;
        const cosA = Math.cos(cl.angle);
        const sinA = Math.sin(cl.angle);
        const rx = dx * cosA + dy * sinA;
        const ry = -dx * sinA + dy * cosA;

        // Normalized distance perturbed by jagged mineral edge noise
        const dist = Math.sqrt((rx / cl.rx) ** 2 + (ry / cl.ry) ** 2) + (nEdge - 0.5) * 0.45;

        if (dist < 1.0) {
          const inf = 1.0 - dist;
          if (inf > maxInfluence) maxInfluence = inf;
        } else if (dist < 1.15 && maxInfluence < 0.1) {
          isFissure = true;
        }
      }

      if (maxInfluence > 0.12) {
        // Natural raw iron ore (Hematite / Siderite / Limonite mix):
        // Earthy warm rust base with silvery-gunmetal specular facets
        const facet = nCryst;
        let oreR = 155 + facet * 50 + maxInfluence * 15;
        let oreG = 110 + facet * 42 + maxInfluence * 10;
        let oreB = 82 + facet * 35 + maxInfluence * 8;

        // High specular metallic micro-crystals inside the ore
        if (facet > 0.7) {
          oreR += 38;
          oreG += 36;
          oreB += 42;
        }

        // Blend smoothly with stone at boundaries
        const blend = Math.min(1.0, (maxInfluence - 0.12) / 0.32);
        rgba[idx * 4 + 0] = Math.min(255, Math.max(0, Math.round(rgba[idx * 4 + 0] * (1 - blend) + oreR * blend)));
        rgba[idx * 4 + 1] = Math.min(255, Math.max(0, Math.round(rgba[idx * 4 + 1] * (1 - blend) + oreG * blend)));
        rgba[idx * 4 + 2] = Math.min(255, Math.max(0, Math.round(rgba[idx * 4 + 2] * (1 - blend) + oreB * blend)));

        // Micro-relief: subtle elevation (+0.07) with crystalline facet relief
        heightMap[idx] = Math.min(1.0, stoneData.heightMap[idx] + 0.07 * blend + (facet - 0.5) * 0.04 * blend);

        // MER for iron ore:
        // Metalness: 185 (distinct physical metallic response for unrefined iron)
        // Emissive: 0 (non-glowing)
        // Roughness: ~105 (specular mineral sheen, significantly smoother than matte stone)
        merData[idx * 4 + 0] = Math.round(185 * blend);
        merData[idx * 4 + 1] = 0;
        merData[idx * 4 + 2] = Math.round(222 * (1 - blend) + (95 + (1.0 - facet) * 24) * blend);
      } else if (isFissure) {
        // Subtle boundary fissure around mineral deposits (AO shadowing)
        rgba[idx * 4 + 0] = Math.max(0, Math.round(rgba[idx * 4 + 0] * 0.72));
        rgba[idx * 4 + 1] = Math.max(0, Math.round(rgba[idx * 4 + 1] * 0.72));
        rgba[idx * 4 + 2] = Math.max(0, Math.round(rgba[idx * 4 + 2] * 0.72));
        heightMap[idx] = Math.max(0, heightMap[idx] - 0.06);
        merData[idx * 4 + 2] = 238; // rougher in crevices
      }
    }
  }

  return { rgba, heightMap, merData, w, h };
}

// 16. DIAMOND SWORD (128x128 Item Icon) - Polished sapphire/cyan blade, steel pommel, leather grip
function generateDiamondSword(w = 128, h = 128) {
  const rgba = new Uint8Array(w * h * 4);

  // Diagonal blade from bottom-left (20, 108) to top-right (108, 20)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;

      // Distance to diagonal line: x + y - 128 = 0
      const distToDiag = (x - y) / Math.SQRT2;
      const t = (x + y) / (2 * Math.SQRT2); // progression along diagonal

      // Handle area
      if (x < 42 && y > 86) {
        // Crossguard and pommel
        if (Math.abs(x - (128 - y)) < 12 && Math.abs(x - (128 - y)) > 2) {
          // Crossguard steel
          rgba[idx + 0] = 160;
          rgba[idx + 1] = 175;
          rgba[idx + 2] = 190;
          rgba[idx + 3] = 255;
          continue;
        }
        if (Math.abs(distToDiag) < 4) {
          // Leather grip
          rgba[idx + 0] = 110;
          rgba[idx + 1] = 72;
          rgba[idx + 2] = 42;
          rgba[idx + 3] = 255;
          continue;
        }
      }

      // Blade area: between t = 35 and t = 80
      if (x >= 28 && y <= 100 && (x + (128 - y)) > 80) {
        const bladeHalfWidth = 7;
        if (Math.abs(distToDiag) <= bladeHalfWidth) {
          const edgeDist = Math.abs(distToDiag) / bladeHalfWidth;
          const centerRidge = Math.abs(distToDiag) < 1.2;

          // Polished gem diamond palette: (40, 210, 220) to (180, 255, 255)
          let r = 60 + (1 - edgeDist) * 110;
          let g = 205 + (1 - edgeDist) * 50;
          let b = 225 + (1 - edgeDist) * 30;

          if (centerRidge) {
            // Bright highlight gleam
            r = 240;
            g = 255;
            b = 255;
          }

          rgba[idx + 0] = Math.min(255, Math.round(r));
          rgba[idx + 1] = Math.min(255, Math.round(g));
          rgba[idx + 2] = Math.min(255, Math.round(b));
          rgba[idx + 3] = 255;
          continue;
        }
      }

      // Transparent outside icon
      rgba[idx + 3] = 0;
    }
  }

  return { rgba, w, h };
}

// 17. APPLE (128x128 Item Icon) - Crisp organic Honeycrisp red apple with wood stem & leaf
function generateApple(w = 128, h = 128) {
  const rgba = new Uint8Array(w * h * 4);
  const cx = 64;
  const cy = 72;
  const rBase = 38;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const dx = x - cx;
      const dy = y - cy;

      // Apple heart-like organic shape formula
      const dist = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);
      // Indentation top and bottom
      const shapeMod = 1.0 + 0.12 * Math.cos(angle * 2) - (dy < -10 ? 0.08 : 0);
      const appleRadius = rBase * shapeMod;

      // Stem at top
      if (Math.abs(dx - 3) < 3 && y >= 20 && y <= 40) {
        rgba[idx + 0] = 95;
        rgba[idx + 1] = 65;
        rgba[idx + 2] = 35;
        rgba[idx + 3] = 255;
        continue;
      }

      // Small green leaf on stem
      if (dx > 4 && dx < 22 && y > 22 && y < 34) {
        const leafDist = Math.sqrt((dx - 12) * (dx - 12) + (y - 28) * (y - 28));
        if (leafDist < 8) {
          rgba[idx + 0] = 72;
          rgba[idx + 1] = 168;
          rgba[idx + 2] = 48;
          rgba[idx + 3] = 255;
          continue;
        }
      }

      if (dist <= appleRadius) {
        // 3D sphere shading with specular shine top-left
        const lx = -18;
        const ly = -18;
        const specDist = Math.sqrt((dx - lx) * (dx - lx) + (dy - ly) * (dy - ly));
        const spec = Math.max(0, 1 - specDist / 14);

        // Rich red to golden blush
        let r = 195 + (dx > 0 ? 25 : 0) + spec * 60;
        let g = 38 + (dx > 8 ? 60 : 0) + spec * 55;
        let b = 32 + spec * 40;

        rgba[idx + 0] = Math.min(255, Math.round(r));
        rgba[idx + 1] = Math.min(255, Math.round(g));
        rgba[idx + 2] = Math.min(255, Math.round(b));
        rgba[idx + 3] = 255;
        continue;
      }

      rgba[idx + 3] = 0;
    }
  }

  return { rgba, w, h };
}

// 18. SUN & GOLDEN HOUR ENVIRONMENT (128x128) - Warm rose-orange corona, HDR contrast
function generateSun(w = 128, h = 128) {
  const rgba = new Uint8Array(w * h * 4);
  const cx = w / 2;
  const cy = h / 2;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Core disk and HDR warm rose-orange radiant corona
      if (dist < 16) {
        // Pure radiant HDR solar core
        rgba[idx + 0] = 255;
        rgba[idx + 1] = 250;
        rgba[idx + 2] = 238;
        rgba[idx + 3] = 255;
      } else if (dist < 58) {
        // Warm rose-orange sunset golden hour corona with boosted contrast
        const falloff = Math.max(0, 1.0 - (dist - 16) / 42);
        const contrastCurve = Math.pow(falloff, 1.4);
        rgba[idx + 0] = 255;
        // Rose-orangé tint: warm golden amber with soft pinkish-orange bloom
        rgba[idx + 1] = Math.round(155 + contrastCurve * 80);
        rgba[idx + 2] = Math.round(110 + contrastCurve * 70);
        rgba[idx + 3] = Math.round(Math.pow(falloff, 1.8) * 255);
      } else {
        rgba[idx + 3] = 0;
      }
    }
  }

  return { rgba, w, h };
}

// 18b. IRON PICKAXE (128x128) - Polished steel head, reinforced wood haft
function generateIronPickaxe(w = 128, h = 128) {
  const rgba = new Uint8Array(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      // Haft runs diagonally from (24, 104) to (96, 32)
      const distToDiag = (x - (128 - y)) / Math.SQRT2;
      const isHaft = (x >= 20 && x <= 95 && y >= 33 && y <= 108) && Math.abs(distToDiag) <= 3.5;

      // Pickaxe head curved arc at top right
      const headDist = Math.sqrt((x - 88) * (x - 88) + (y - 40) * (y - 40));
      const isHead = (x >= 60 && y <= 68) && Math.abs(headDist - 34) <= 6 && (x + y > 105) && (x - y > 10);

      if (isHead) {
        // Steel head with metallic specular highlight
        const shine = Math.sin((x + y) * 0.2) * 0.5 + 0.5;
        rgba[idx + 0] = Math.min(255, Math.round(190 + shine * 55));
        rgba[idx + 1] = Math.min(255, Math.round(195 + shine * 55));
        rgba[idx + 2] = Math.min(255, Math.round(205 + shine * 50));
        rgba[idx + 3] = 255;
      } else if (isHaft) {
        // Wooden handle
        rgba[idx + 0] = 135;
        rgba[idx + 1] = 95;
        rgba[idx + 2] = 55;
        rgba[idx + 3] = 255;
      } else {
        rgba[idx + 3] = 0;
      }
    }
  }
  return { rgba, w, h };
}

// 18c. BOOK ITEM (128x128) - Leather tome with gold trim
function generateBook(w = 128, h = 128) {
  const rgba = new Uint8Array(w * h * 4);
  const cx = 64;
  const cy = 64;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const dx = Math.abs(x - cx);
      const dy = Math.abs(y - cy);
      if (dx <= 36 && dy <= 44) {
        const isSpine = (x <= cx - 30);
        const isGoldTrim = (dx >= 33 || dy >= 41);
        if (isGoldTrim) {
          rgba[idx + 0] = 220;
          rgba[idx + 1] = 180;
          rgba[idx + 2] = 60;
          rgba[idx + 3] = 255;
        } else if (isSpine) {
          rgba[idx + 0] = 80;
          rgba[idx + 1] = 30;
          rgba[idx + 2] = 20;
          rgba[idx + 3] = 255;
        } else {
          // Rich crimson leather
          rgba[idx + 0] = 145;
          rgba[idx + 1] = 42;
          rgba[idx + 2] = 35;
          rgba[idx + 3] = 255;
        }
      } else {
        rgba[idx + 3] = 0;
      }
    }
  }
  return { rgba, w, h };
}

// 18d. MOON PHASES (256x128)
function generateMoonPhases(w = 256, h = 128) {
  const rgba = new Uint8Array(w * h * 4);
  const craterNoise = createFractalNoise(w, h, 3, 0.6, 16, 5501);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      // 8 phases across width: each cell is 32x64 or 64x64
      const cellX = Math.floor(x / 64);
      const cellY = Math.floor(y / 64);
      const localX = x % 64;
      const localY = y % 64;
      const dist = Math.sqrt((localX - 32) * (localX - 32) + (localY - 32) * (localY - 32));
      if (dist <= 22) {
        const c = craterNoise[y * w + x];
        const lum = 180 + c * 60;
        rgba[idx + 0] = Math.round(lum * 0.95);
        rgba[idx + 1] = Math.round(lum * 0.95);
        rgba[idx + 2] = Math.round(lum);
        rgba[idx + 3] = 255;
      } else {
        rgba[idx + 3] = 0;
      }
    }
  }
  return { rgba, w, h };
}

// 18e. CLOUDS (256x256 seamless)
function generateClouds(w = 256, h = 256) {
  const rgba = new Uint8Array(w * h * 4);
  const cloudNoise = createFractalNoise(w, h, 4, 0.5, 32, 6601);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const density = cloudNoise[y * w + x];
      if (density > 0.48) {
        const alpha = Math.min(230, Math.round((density - 0.48) * 450));
        rgba[idx + 0] = 255;
        rgba[idx + 1] = 250;
        rgba[idx + 2] = 245;
        rgba[idx + 3] = alpha;
      } else {
        rgba[idx + 3] = 0;
      }
    }
  }
  return { rgba, w, h };
}

// 18f. UI HEART (64x64)
function generateHeart(w = 64, h = 64) {
  const rgba = new Uint8Array(w * h * 4);
  const cx = 32;
  const cy = 28;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const dx = (x - cx) / 18.0;
      const dy = (y - cy) / 18.0;
      // Heart formula: (x^2 + y^2 - 1)^3 - x^2 * y^3 <= 0
      const a = dx * dx + dy * dy - 1;
      if (a * a * a - dx * dx * dy * dy * dy <= 0) {
        const isBorder = (a * a * a - dx * dx * dy * dy * dy > -0.3);
        if (isBorder) {
          rgba[idx + 0] = 75;
          rgba[idx + 1] = 10;
          rgba[idx + 2] = 10;
          rgba[idx + 3] = 255;
        } else {
          // Specular highlight top left
          const isShine = dx < -0.2 && dy < -0.2;
          rgba[idx + 0] = isShine ? 255 : 220;
          rgba[idx + 1] = isShine ? 110 : 35;
          rgba[idx + 2] = isShine ? 110 : 35;
          rgba[idx + 3] = 255;
        }
      } else {
        rgba[idx + 3] = 0;
      }
    }
  }
  return { rgba, w, h };
}

// 19. UI CROSSHAIR (64x64) - Surgical, modern, clean Bedrock HUD
function generateCrosshair(w = 64, h = 64) {
  const rgba = new Uint8Array(w * h * 4);
  const cx = w / 2;
  const cy = h / 2;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const isCenterDot = Math.abs(x - cx) <= 1 && Math.abs(y - cy) <= 1;
      const isHorizLine = Math.abs(y - cy) <= 0 && ((x >= cx - 9 && x <= cx - 3) || (x >= cx + 3 && x <= cx + 9));
      const isVertLine  = Math.abs(x - cx) <= 0 && ((y >= cy - 9 && y <= cy - 3) || (y >= cy + 3 && y <= cy + 9));

      if (isCenterDot || isHorizLine || isVertLine) {
        rgba[idx + 0] = 255;
        rgba[idx + 1] = 255;
        rgba[idx + 2] = 255;
        rgba[idx + 3] = 240;
      } else {
        rgba[idx + 3] = 0;
      }
    }
  }

  return { rgba, w, h };
}

// 20. PACK ICON (512x512) - High-end premium modern cover with REALISM+ 8K typography & bedrock emblem
function generatePackIcon(w = 512, h = 512) {
  const rgba = new Uint8Array(w * h * 4);
  const stoneNoise = createFractalNoise(w, h, 5, 0.55, 64, 4001);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;

      // Dark slate textured background
      const n = stoneNoise[y * w + x];
      let r = 24 + n * 20;
      let g = 28 + n * 22;
      let b = 36 + n * 28;

      // Elegant inner border frame
      const borderDist = Math.min(x, y, w - 1 - x, h - 1 - y);
      if (borderDist < 8) {
        // Gold accent frame
        r = 210;
        g = 175;
        b = 95;
      } else if (borderDist === 8 || borderDist === 9) {
        r = 40;
        g = 35;
        b = 20;
      }

      // Golden ambient glow from top
      const topGlow = (1 - y / h) * 45;
      r += topGlow * 0.9;
      g += topGlow * 0.7;
      b += topGlow * 0.3;

      // Central diamond crest shield watermark
      const cx = w / 2;
      const cy = h / 2 - 30;
      const dx = Math.abs(x - cx);
      const dy = Math.abs(y - cy);
      if (dx + dy < 140 && dx + dy > 132) {
        // Gold geometric diamond contour
        r = 220;
        g = 180;
        b = 100;
      }

      // Typography pixels for "REALISM+ 8K" (Rendered cleanly)
      rgba[idx + 0] = Math.min(255, Math.max(0, Math.round(r)));
      rgba[idx + 1] = Math.min(255, Math.max(0, Math.round(g)));
      rgba[idx + 2] = Math.min(255, Math.max(0, Math.round(b)));
      rgba[idx + 3] = 255;
    }
  }

  // Draw crisp pixel lettering for "REALISM+" and "8K" and "BEDROCK EDITION"
  // Using bitmap font rasterization
  function drawPixelRect(x0, y0, rw, rh, cr, cg, cb) {
    for (let py = y0; py < y0 + rh; py++) {
      for (let px = x0; px < x0 + rw; px++) {
        if (px >= 0 && px < w && py >= 0 && py < h) {
          const pidx = (py * w + px) * 4;
          rgba[pidx + 0] = cr;
          rgba[pidx + 1] = cg;
          rgba[pidx + 2] = cb;
          rgba[pidx + 3] = 255;
        }
      }
    }
  }

  // Simple 5x7 block font for clear "REALISM+ 8K" text
  const glyphs = {
    'R': ["11110","10001","11110","10100","10010","10001"],
    'E': ["11111","10000","11110","10000","10000","11111"],
    'A': ["01110","10001","10001","11111","10001","10001"],
    'L': ["10000","10000","10000","10000","10000","11111"],
    'I': ["11111","00100","00100","00100","00100","11111"],
    'S': ["01111","10000","11110","00001","00001","11110"],
    'M': ["10001","11011","10101","10001","10001","10001"],
    '+': ["00000","00100","01110","00100","00000","00000"],
    '8': ["01110","10001","01110","10001","10001","01110"],
    'K': ["10001","10010","11100","10010","10001","10001"],
    ' ': ["00000","00000","00000","00000","00000","00000"],
  };

  const text1 = "REALISM+";
  const scale1 = 6;
  const startX1 = Math.floor((w - text1.length * 6 * scale1) / 2) + 12;
  const startY1 = 330;

  for (let i = 0; i < text1.length; i++) {
    const ch = text1[i];
    const pattern = glyphs[ch] || glyphs[' '];
    for (let r = 0; r < pattern.length; r++) {
      for (let c = 0; c < pattern[r].length; c++) {
        if (pattern[r][c] === '1') {
          // Gold metallic letter
          drawPixelRect(startX1 + (i * 6 + c) * scale1, startY1 + r * scale1, scale1, scale1, 245, 215, 125);
        }
      }
    }
  }

  const text2 = "8K";
  const scale2 = 10;
  const startX2 = Math.floor((w - text2.length * 6 * scale2) / 2) + 15;
  const startY2 = 210;

  for (let i = 0; i < text2.length; i++) {
    const ch = text2[i];
    const pattern = glyphs[ch] || glyphs[' '];
    for (let r = 0; r < pattern.length; r++) {
      for (let c = 0; c < pattern[r].length; c++) {
        if (pattern[r][c] === '1') {
          // Platinum brilliant white letter
          drawPixelRect(startX2 + (i * 6 + c) * scale2, startY2 + r * scale2, scale2, scale2, 255, 255, 255);
        }
      }
    }
  }

  return { rgba, w, h };
}

// Generate PBR MER (Metallic, Emissive, Roughness) map
// R = Metallic (0 = dielectric, 255 = metal)
// G = Emissive (0 = black, 255 = glowing)
// B = Roughness (0 = glossy mirror, 255 = matte rough)
function generateMER(w, h, metallic = 0, emissive = 0, baseRoughness = 220, roughnessVariation = null) {
  const rgba = new Uint8Array(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const rVar = roughnessVariation ? roughnessVariation[y * w + x] * 30 : 0;
      rgba[idx + 0] = metallic;
      rgba[idx + 1] = emissive;
      rgba[idx + 2] = Math.min(255, Math.max(0, Math.round(baseRoughness + rVar)));
      rgba[idx + 3] = 255;
    }
  }
  return rgba;
}

// ==========================================
// MAIN PACK BUILD & COMPILATION
// ==========================================

async function buildPack() {
  console.log('🚀 Starting REALISM+ 8K Bedrock Resource Pack generation...');

  const packFolder = ROOT_PACK_DIR;
  const texturesFolder = path.join(packFolder, 'textures');
  const blocksFolder = path.join(texturesFolder, 'blocks');
  const itemsFolder = path.join(texturesFolder, 'items');
  const envFolder = path.join(texturesFolder, 'environment');
  const uiFolder = path.join(texturesFolder, 'ui');

  // Ensure directories exist
  [packFolder, texturesFolder, blocksFolder, itemsFolder, envFolder, uiFolder, PUBLIC_PACK_DIR].forEach(dir => {
    fs.mkdirSync(dir, { recursive: true });
  });

  // 1. GENERATE BASE TEXTURES & MAPS
  console.log('📦 1/4 Generating 128x128 high-fidelity block textures...');

  // DIRT (Photorealistic clods, mineral stones, rootlets, and crumbly loam)
  const dirt = photo.generatePhotorealisticDirt(128, 128);
  const dirtNormal = photo.generateNormalMap(dirt.heightMap, 128, 128, 3.8); // High 3D relief for clods and pebbles
  savePng(dirt.rgba, 128, 128, path.join(blocksFolder, 'dirt.png'));
  savePng(dirtNormal, 128, 128, path.join(blocksFolder, 'dirt_normal.png'));
  savePng(dirt.merData, 128, 128, path.join(blocksFolder, 'dirt_mer.png'));

  // STONE
  const stone = generateStone(128, 128);
  const stoneNormal = generateNormalMap(stone.heightMap, 128, 128, 1.6); // Subtle natural micro-relief (Directive PBR)
  const stoneMER = new Uint8Array(128 * 128 * 4);
  for (let i = 0; i < 128 * 128; i++) {
    stoneMER[i * 4 + 0] = 0; // Strictly dielectric rock
    stoneMER[i * 4 + 1] = 0; // Non-emissive
    stoneMER[i * 4 + 2] = stone.roughnessMap[i]; // Matte rock (205-238)
    stoneMER[i * 4 + 3] = 255;
  }
  savePng(stone.rgba, 128, 128, path.join(blocksFolder, 'stone.png'));
  savePng(stoneNormal, 128, 128, path.join(blocksFolder, 'stone_normal.png'));
  savePng(stoneMER, 128, 128, path.join(blocksFolder, 'stone_mer.png'));

  // IRON ORE (Host rock continuous with Stone, embedded hematite/raw iron nodules)
  const ironOre = generateIronOre(stone, 128, 128);
  const ironOreNormal = generateNormalMap(ironOre.heightMap, 128, 128, 1.8);
  savePng(ironOre.rgba, 128, 128, path.join(blocksFolder, 'iron_ore.png'));
  savePng(ironOreNormal, 128, 128, path.join(blocksFolder, 'iron_ore_normal.png'));
  savePng(ironOre.merData, 128, 128, path.join(blocksFolder, 'iron_ore_mer.png'));

  // GRASS TOP (Photorealistic individual blades, dark earth peeking through, calibrated biome luminance)
  const grassTop = photo.generatePhotorealisticGrassTop(dirt, 128, 128);
  const grassTopNormal = photo.generateNormalMap(grassTop.heightMap, 128, 128, 2.8);
  savePng(grassTop.rgba, 128, 128, path.join(blocksFolder, 'grass_top.png'));
  savePng(grassTop.rgba, 128, 128, path.join(blocksFolder, 'grass_block_top.png'));
  savePng(grassTopNormal, 128, 128, path.join(blocksFolder, 'grass_top_normal.png'));
  savePng(grassTop.merData, 128, 128, path.join(blocksFolder, 'grass_top_mer.png'));

  // GRASS SIDE (Photorealistic crumbly dirt base with organic cascading grass blades and descending rootlets)
  const grassSide = photo.generatePhotorealisticGrassSide(dirt, grassTop, 128, 128);
  const grassSideNormal = photo.generateNormalMap(grassSide.heightMap, 128, 128, 3.2);
  savePng(grassSide.rgba, 128, 128, path.join(blocksFolder, 'grass_side.png'));
  savePng(grassSide.rgba, 128, 128, path.join(blocksFolder, 'grass_block_side.png'));
  savePng(grassSide.rgba, 128, 128, path.join(blocksFolder, 'grass_side_carried.png'));
  savePng(grassSideNormal, 128, 128, path.join(blocksFolder, 'grass_side_normal.png'));
  savePng(grassSide.merData, 128, 128, path.join(blocksFolder, 'grass_side_mer.png'));

  // DIRT PATH & GRASS PATH (Compacted dirt with fine gravel and pedestrian wheel tracks)
  const dirtPath = photo.generatePhotorealisticDirtPath(dirt, 128, 128);
  const dirtPathNormal = photo.generateNormalMap(dirtPath.heightMap, 128, 128, 2.4);
  ['dirt_path_top.png', 'grass_path_top.png'].forEach(f => savePng(dirtPath.rgba, 128, 128, path.join(blocksFolder, f)));
  ['dirt_path_side.png', 'grass_path_side.png'].forEach(f => savePng(dirtPath.rgba, 128, 128, path.join(blocksFolder, f)));
  savePng(dirtPathNormal, 128, 128, path.join(blocksFolder, 'dirt_path_top_normal.png'));
  savePng(dirtPath.merData, 128, 128, path.join(blocksFolder, 'dirt_path_top_mer.png'));

  // SAND
  const sand = generateSand(128, 128);
  const sandNormal = generateNormalMap(sand.heightMap, 128, 128, 1.8);
  const sandMER = generateMER(128, 128, 0, 0, 245, sand.heightMap);
  savePng(sand.rgba, 128, 128, path.join(blocksFolder, 'sand.png'));
  savePng(sandNormal, 128, 128, path.join(blocksFolder, 'sand_normal.png'));
  savePng(sandMER, 128, 128, path.join(blocksFolder, 'sand_mer.png'));

  // OAK LOG (SIDE & TOP)
  const oakBark = generateOakBark(128, 128);
  const oakBarkNormal = generateNormalMap(oakBark.heightMap, 128, 128, 3.0);
  const oakBarkMER = generateMER(128, 128, 0, 0, 225, oakBark.heightMap);
  savePng(oakBark.rgba, 128, 128, path.join(blocksFolder, 'log_oak.png'));
  savePng(oakBarkNormal, 128, 128, path.join(blocksFolder, 'log_oak_normal.png'));
  savePng(oakBarkMER, 128, 128, path.join(blocksFolder, 'log_oak_mer.png'));

  const oakTop = generateOakLogTop(128, 128);
  const oakTopNormal = generateNormalMap(oakTop.heightMap, 128, 128, 2.0);
  savePng(oakTop.rgba, 128, 128, path.join(blocksFolder, 'log_oak_top.png'));
  savePng(oakTopNormal, 128, 128, path.join(blocksFolder, 'log_oak_top_normal.png'));

  // OAK PLANKS
  const oakPlanks = generateOakPlanks(128, 128);
  const oakPlanksNormal = generateNormalMap(oakPlanks.heightMap, 128, 128, 2.4);
  const oakPlanksMER = generateMER(128, 128, 0, 0, 195, oakPlanks.heightMap);
  savePng(oakPlanks.rgba, 128, 128, path.join(blocksFolder, 'planks_oak.png'));
  savePng(oakPlanksNormal, 128, 128, path.join(blocksFolder, 'planks_oak_normal.png'));
  savePng(oakPlanksMER, 128, 128, path.join(blocksFolder, 'planks_oak_mer.png'));

  // OAK LEAVES
  const oakLeaves = generateOakLeaves(128, 128);
  const oakLeavesNormal = generateNormalMap(oakLeaves.heightMap, 128, 128, 1.8);
  savePng(oakLeaves.rgba, 128, 128, path.join(blocksFolder, 'leaves_oak.png'));
  savePng(oakLeaves.rgba, 128, 128, path.join(blocksFolder, 'leaves_oak_carried.png'));
  savePng(oakLeavesNormal, 128, 128, path.join(blocksFolder, 'leaves_oak_normal.png'));

  // COBBLESTONE
  const cobblestone = generateCobblestone(128, 128);
  const cobblestoneNormal = generateNormalMap(cobblestone.heightMap, 128, 128, 3.2);
  const cobblestoneMER = generateMER(128, 128, 0, 0, 215, cobblestone.heightMap);
  savePng(cobblestone.rgba, 128, 128, path.join(blocksFolder, 'cobblestone.png'));
  savePng(cobblestoneNormal, 128, 128, path.join(blocksFolder, 'cobblestone_normal.png'));
  savePng(cobblestoneMER, 128, 128, path.join(blocksFolder, 'cobblestone_mer.png'));

  // WATER (STILL & FLOW) - 32-Frame Ultra-Fluid Animation, Aquatic Caustics, Calibrated Transparency & PBR
  console.log('🌊 Generating 32-frame ultra-fluid animated water flipbooks & PBR maps...');
  const waterStillFlipbook = photo.generateWaterFlipbook32(128, 128, 32, false);
  const waterFlowFlipbook = photo.generateWaterFlipbook32(128, 128, 32, true);
  const waterNormal = photo.generateNormalMap(waterStillFlipbook.firstFrame.heightMap, 128, 128, 2.0);
  const waterMER = generateMER(128, 128, 0, 0, 18, null); // Mirror-specular water reflection (Roughness = 18, Dielectric = 0)

  // Save 128x4096 animated flipbooks for Bedrock engine (32 seamless frames)
  savePng(waterStillFlipbook.stripRgba, 128, 128 * 32, path.join(blocksFolder, 'water_still.png'));
  savePng(waterFlowFlipbook.stripRgba, 128, 128 * 32, path.join(blocksFolder, 'water_flow.png'));

  // Save single 128x128 frames for web inspection and fallback compatibility
  savePng(waterStillFlipbook.firstFrame.rgba, 128, 128, path.join(blocksFolder, 'water_still_single.png'));
  savePng(waterFlowFlipbook.firstFrame.rgba, 128, 128, path.join(blocksFolder, 'water_flow_single.png'));

  // Save Water PBR maps (Normal & MER)
  savePng(waterNormal, 128, 128, path.join(blocksFolder, 'water_normal.png'));
  savePng(waterNormal, 128, 128, path.join(blocksFolder, 'water_still_normal.png'));
  savePng(waterMER, 128, 128, path.join(blocksFolder, 'water_mer.png'));
  savePng(waterMER, 128, 128, path.join(blocksFolder, 'water_still_mer.png'));

  // Write Bedrock flipbook_textures.json with full 32 frames
  const waterFrames32 = Array.from({ length: 32 }, (_, i) => i);
  const flipbookConfig = [
    {
      flipbook_texture: "textures/blocks/water_still",
      atlas_tile: "water_still",
      ticks_per_frame: 2,
      frames: waterFrames32
    },
    {
      flipbook_texture: "textures/blocks/water_flow",
      atlas_tile: "water_flow",
      ticks_per_frame: 2,
      frames: waterFrames32
    }
  ];
  fs.writeFileSync(
    path.join(texturesFolder, 'flipbook_textures.json'),
    JSON.stringify(flipbookConfig, null, 2)
  );

  // CHARPENTE / TIMBER BEAM (Massive hand-hewn structural wood beam for roofs and bridges)
  const timberBeam = photo.generateCharpenteBeam(128, 128);
  const timberNormal = photo.generateNormalMap(timberBeam.heightMap, 128, 128, 2.4);
  savePng(timberBeam.rgba, 128, 128, path.join(blocksFolder, 'stripped_oak_log.png'));
  savePng(timberBeam.rgba, 128, 128, path.join(blocksFolder, 'stripped_oak_log_side.png'));
  savePng(timberBeam.rgba, 128, 128, path.join(blocksFolder, 'stripped_spruce_log.png'));
  savePng(oakTop.rgba, 128, 128, path.join(blocksFolder, 'stripped_oak_log_top.png'));
  savePng(timberNormal, 128, 128, path.join(blocksFolder, 'stripped_oak_log_normal.png'));
  savePng(timberBeam.merData, 128, 128, path.join(blocksFolder, 'stripped_oak_log_mer.png'));

  // ASPHALT ROAD (Photorealistic bituminous road with crushed mineral aggregate and white line markings)
  const asphaltRoad = photo.generatePhotorealisticAsphalt(128, 128, true);
  const asphaltRoadPlain = photo.generatePhotorealisticAsphalt(128, 128, false);
  const asphaltNormal = photo.generateNormalMap(asphaltRoad.heightMap, 128, 128, 2.2);
  savePng(asphaltRoad.rgba, 128, 128, path.join(blocksFolder, 'concrete_black.png'));
  savePng(asphaltRoadPlain.rgba, 128, 128, path.join(blocksFolder, 'concrete_gray.png'));
  savePng(asphaltNormal, 128, 128, path.join(blocksFolder, 'concrete_black_normal.png'));
  savePng(asphaltRoad.merData, 128, 128, path.join(blocksFolder, 'concrete_black_mer.png'));

  // GLASS
  const glass = generateGlass(128, 128);
  const glassNormal = generateNormalMap(glass.heightMap, 128, 128, 1.5);
  const glassMER = generateMER(128, 128, 0, 0, 20, null); // Smooth glossy glass
  savePng(glass.rgba, 128, 128, path.join(blocksFolder, 'glass.png'));
  savePng(glassNormal, 128, 128, path.join(blocksFolder, 'glass_normal.png'));
  savePng(glassMER, 128, 128, path.join(blocksFolder, 'glass_mer.png'));

  // GRAVEL, BRICKS, DEEPSLATE
  const gravel = generateGravel(128, 128);
  const gravelNormal = generateNormalMap(gravel.heightMap, 128, 128, 2.5);
  savePng(gravel.rgba, 128, 128, path.join(blocksFolder, 'gravel.png'));
  savePng(gravelNormal, 128, 128, path.join(blocksFolder, 'gravel_normal.png'));

  const bricks = generateBricks(128, 128);
  const bricksNormal = generateNormalMap(bricks.heightMap, 128, 128, 2.8);
  const bricksMER = generateMER(128, 128, 0, 0, 205, bricks.heightMap);
  savePng(bricks.rgba, 128, 128, path.join(blocksFolder, 'brick.png'));
  savePng(bricksNormal, 128, 128, path.join(blocksFolder, 'brick_normal.png'));
  savePng(bricksMER, 128, 128, path.join(blocksFolder, 'brick_mer.png'));

  const deepslate = generateDeepslate(128, 128);
  const deepslateNormal = generateNormalMap(deepslate.heightMap, 128, 128, 2.6);
  savePng(deepslate.rgba, 128, 128, path.join(blocksFolder, 'deepslate.png'));
  savePng(deepslateNormal, 128, 128, path.join(blocksFolder, 'deepslate_normal.png'));

  // --- EXTRA BLOCKS (HIGH GRAPHICS PBR + NOSTALGIC PALETTE) ---
  console.log('💎 Generating comprehensive high-graphics PBR ores, woods, crafting and nether blocks...');

  // 1. DIAMOND ORE
  const diamondOre = extra.generateDiamondOre(stone, 128, 128);
  const diamondOreNormal = extra.generateNormalMap(diamondOre.heightMap, 128, 128, 2.0);
  savePng(diamondOre.rgba, 128, 128, path.join(blocksFolder, 'diamond_ore.png'));
  savePng(diamondOreNormal, 128, 128, path.join(blocksFolder, 'diamond_ore_normal.png'));
  savePng(diamondOre.merData, 128, 128, path.join(blocksFolder, 'diamond_ore_mer.png'));

  // 2. GOLD ORE
  const goldOre = extra.generateGoldOre(stone, 128, 128);
  const goldOreNormal = extra.generateNormalMap(goldOre.heightMap, 128, 128, 1.9);
  savePng(goldOre.rgba, 128, 128, path.join(blocksFolder, 'gold_ore.png'));
  savePng(goldOreNormal, 128, 128, path.join(blocksFolder, 'gold_ore_normal.png'));
  savePng(goldOre.merData, 128, 128, path.join(blocksFolder, 'gold_ore_mer.png'));

  // 3. COAL ORE
  const coalOre = extra.generateCoalOre(stone, 128, 128);
  const coalOreNormal = extra.generateNormalMap(coalOre.heightMap, 128, 128, 2.2);
  savePng(coalOre.rgba, 128, 128, path.join(blocksFolder, 'coal_ore.png'));
  savePng(coalOreNormal, 128, 128, path.join(blocksFolder, 'coal_ore_normal.png'));
  savePng(coalOre.merData, 128, 128, path.join(blocksFolder, 'coal_ore_mer.png'));

  // 4. EMERALD ORE
  const emeraldOre = extra.generateEmeraldOre(stone, 128, 128);
  const emeraldOreNormal = extra.generateNormalMap(emeraldOre.heightMap, 128, 128, 2.1);
  savePng(emeraldOre.rgba, 128, 128, path.join(blocksFolder, 'emerald_ore.png'));
  savePng(emeraldOreNormal, 128, 128, path.join(blocksFolder, 'emerald_ore_normal.png'));
  savePng(emeraldOre.merData, 128, 128, path.join(blocksFolder, 'emerald_ore_mer.png'));

  // 5. REDSTONE ORE
  const redstoneOre = extra.generateRedstoneOre(stone, 128, 128);
  const redstoneOreNormal = extra.generateNormalMap(redstoneOre.heightMap, 128, 128, 2.0);
  savePng(redstoneOre.rgba, 128, 128, path.join(blocksFolder, 'redstone_ore.png'));
  savePng(redstoneOreNormal, 128, 128, path.join(blocksFolder, 'redstone_ore_normal.png'));
  savePng(redstoneOre.merData, 128, 128, path.join(blocksFolder, 'redstone_ore_mer.png'));

  // 6. LAPIS ORE
  const lapisOre = extra.generateLapisOre(stone, 128, 128);
  const lapisOreNormal = extra.generateNormalMap(lapisOre.heightMap, 128, 128, 2.0);
  savePng(lapisOre.rgba, 128, 128, path.join(blocksFolder, 'lapis_ore.png'));
  savePng(lapisOreNormal, 128, 128, path.join(blocksFolder, 'lapis_ore_normal.png'));
  savePng(lapisOre.merData, 128, 128, path.join(blocksFolder, 'lapis_ore_mer.png'));

  // 7. COPPER ORE
  const copperOre = extra.generateCopperOre(stone, 128, 128);
  const copperOreNormal = extra.generateNormalMap(copperOre.heightMap, 128, 128, 1.9);
  savePng(copperOre.rgba, 128, 128, path.join(blocksFolder, 'copper_ore.png'));
  savePng(copperOreNormal, 128, 128, path.join(blocksFolder, 'copper_ore_normal.png'));
  savePng(copperOre.merData, 128, 128, path.join(blocksFolder, 'copper_ore_mer.png'));

  // 8. MOSSY COBBLESTONE
  const mossyCobblestone = extra.generateMossyCobblestone(cobblestone, 128, 128);
  const mossyCobblestoneNormal = extra.generateNormalMap(mossyCobblestone.heightMap, 128, 128, 3.0);
  savePng(mossyCobblestone.rgba, 128, 128, path.join(blocksFolder, 'cobblestone_mossy.png'));
  savePng(mossyCobblestoneNormal, 128, 128, path.join(blocksFolder, 'cobblestone_mossy_normal.png'));
  savePng(mossyCobblestone.merData, 128, 128, path.join(blocksFolder, 'cobblestone_mossy_mer.png'));

  // 9. BIRCH LOG & PLANKS
  const birchBark = extra.generateBirchBark(128, 128);
  const birchBarkNormal = extra.generateNormalMap(birchBark.heightMap, 128, 128, 2.4);
  const birchBarkMER = generateMER(128, 128, 0, 0, 215, birchBark.heightMap);
  savePng(birchBark.rgba, 128, 128, path.join(blocksFolder, 'log_birch.png'));
  savePng(birchBark.rgba, 128, 128, path.join(blocksFolder, 'log_birch_side.png'));
  savePng(birchBarkNormal, 128, 128, path.join(blocksFolder, 'log_birch_normal.png'));
  savePng(birchBarkMER, 128, 128, path.join(blocksFolder, 'log_birch_mer.png'));
  savePng(oakTop.rgba, 128, 128, path.join(blocksFolder, 'log_birch_top.png'));

  const birchPlanks = extra.generateBirchPlanks(128, 128);
  const birchPlanksNormal = extra.generateNormalMap(birchPlanks.heightMap, 128, 128, 2.2);
  const birchPlanksMER = generateMER(128, 128, 0, 0, 190, birchPlanks.heightMap);
  savePng(birchPlanks.rgba, 128, 128, path.join(blocksFolder, 'planks_birch.png'));
  savePng(birchPlanksNormal, 128, 128, path.join(blocksFolder, 'planks_birch_normal.png'));
  savePng(birchPlanksMER, 128, 128, path.join(blocksFolder, 'planks_birch_mer.png'));

  // 10. SPRUCE LOG & PLANKS
  const spruceBark = extra.generateSpruceBark(128, 128);
  const spruceBarkNormal = extra.generateNormalMap(spruceBark.heightMap, 128, 128, 2.8);
  const spruceBarkMER = generateMER(128, 128, 0, 0, 230, spruceBark.heightMap);
  savePng(spruceBark.rgba, 128, 128, path.join(blocksFolder, 'log_spruce.png'));
  savePng(spruceBark.rgba, 128, 128, path.join(blocksFolder, 'log_spruce_side.png'));
  savePng(spruceBarkNormal, 128, 128, path.join(blocksFolder, 'log_spruce_normal.png'));
  savePng(spruceBarkMER, 128, 128, path.join(blocksFolder, 'log_spruce_mer.png'));
  savePng(oakTop.rgba, 128, 128, path.join(blocksFolder, 'log_spruce_top.png'));

  const sprucePlanks = extra.generateSprucePlanks(128, 128);
  const sprucePlanksNormal = extra.generateNormalMap(sprucePlanks.heightMap, 128, 128, 2.4);
  const sprucePlanksMER = generateMER(128, 128, 0, 0, 200, sprucePlanks.heightMap);
  savePng(sprucePlanks.rgba, 128, 128, path.join(blocksFolder, 'planks_spruce.png'));
  savePng(sprucePlanksNormal, 128, 128, path.join(blocksFolder, 'planks_spruce_normal.png'));
  savePng(sprucePlanksMER, 128, 128, path.join(blocksFolder, 'planks_spruce_mer.png'));

  // 11. CRAFTING TABLE
  const craftingTableTop = extra.generateCraftingTableTop(oakPlanks, 128, 128);
  const craftingTableTopNormal = extra.generateNormalMap(craftingTableTop.heightMap, 128, 128, 2.2);
  const craftingTableTopMER = generateMER(128, 128, 0, 0, 185, craftingTableTop.heightMap);
  savePng(craftingTableTop.rgba, 128, 128, path.join(blocksFolder, 'crafting_table_top.png'));
  savePng(craftingTableTopNormal, 128, 128, path.join(blocksFolder, 'crafting_table_top_normal.png'));
  savePng(craftingTableTopMER, 128, 128, path.join(blocksFolder, 'crafting_table_top_mer.png'));

  const craftingTableSide = extra.generateCraftingTableSide(oakPlanks, 128, 128);
  const craftingTableSideNormal = extra.generateNormalMap(craftingTableSide.heightMap, 128, 128, 2.4);
  const craftingTableSideMER = generateMER(128, 128, 40, 0, 190, craftingTableSide.heightMap);
  savePng(craftingTableSide.rgba, 128, 128, path.join(blocksFolder, 'crafting_table_side.png'));
  savePng(craftingTableSide.rgba, 128, 128, path.join(blocksFolder, 'crafting_table_front.png'));
  savePng(craftingTableSideNormal, 128, 128, path.join(blocksFolder, 'crafting_table_side_normal.png'));
  savePng(craftingTableSideMER, 128, 128, path.join(blocksFolder, 'crafting_table_side_mer.png'));

  // 12. BOOKSHELF
  const bookshelf = extra.generateBookshelf(oakPlanks, 128, 128);
  const bookshelfNormal = extra.generateNormalMap(bookshelf.heightMap, 128, 128, 2.5);
  savePng(bookshelf.rgba, 128, 128, path.join(blocksFolder, 'bookshelf.png'));
  savePng(bookshelfNormal, 128, 128, path.join(blocksFolder, 'bookshelf_normal.png'));
  savePng(bookshelf.merData, 128, 128, path.join(blocksFolder, 'bookshelf_mer.png'));

  // 13. TNT
  const tnt = extra.generateTNT(128, 128);
  const tntNormal = extra.generateNormalMap(tnt.heightMap, 128, 128, 2.6);
  const tntMER = generateMER(128, 128, 0, 0, 210, tnt.heightMap);
  savePng(tnt.rgba, 128, 128, path.join(blocksFolder, 'tnt_side.png'));
  savePng(tnt.rgba, 128, 128, path.join(blocksFolder, 'tnt_top.png'));
  savePng(tnt.rgba, 128, 128, path.join(blocksFolder, 'tnt_bottom.png'));
  savePng(tntNormal, 128, 128, path.join(blocksFolder, 'tnt_side_normal.png'));
  savePng(tntMER, 128, 128, path.join(blocksFolder, 'tnt_side_mer.png'));

  // 14. NETHERRACK
  const netherrack = extra.generateNetherrack(128, 128);
  const netherrackNormal = extra.generateNormalMap(netherrack.heightMap, 128, 128, 2.5);
  savePng(netherrack.rgba, 128, 128, path.join(blocksFolder, 'netherrack.png'));
  savePng(netherrackNormal, 128, 128, path.join(blocksFolder, 'netherrack_normal.png'));
  savePng(netherrack.merData, 128, 128, path.join(blocksFolder, 'netherrack_mer.png'));

  // 15. OBSIDIAN
  const obsidian = extra.generateObsidian(128, 128);
  const obsidianNormal = extra.generateNormalMap(obsidian.heightMap, 128, 128, 2.2);
  savePng(obsidian.rgba, 128, 128, path.join(blocksFolder, 'obsidian.png'));
  savePng(obsidianNormal, 128, 128, path.join(blocksFolder, 'obsidian_normal.png'));
  savePng(obsidian.merData, 128, 128, path.join(blocksFolder, 'obsidian_mer.png'));

  // 16. GLOWSTONE
  const glowstone = extra.generateGlowstone(128, 128);
  const glowstoneNormal = extra.generateNormalMap(glowstone.heightMap, 128, 128, 2.0);
  savePng(glowstone.rgba, 128, 128, path.join(blocksFolder, 'glowstone.png'));
  savePng(glowstoneNormal, 128, 128, path.join(blocksFolder, 'glowstone_normal.png'));
  savePng(glowstone.merData, 128, 128, path.join(blocksFolder, 'glowstone_mer.png'));

  // 17. SANDSTONE
  const sandstone = extra.generateSandstone(128, 128);
  const sandstoneNormal = extra.generateNormalMap(sandstone.heightMap, 128, 128, 2.2);
  const sandstoneMER = generateMER(128, 128, 0, 0, 220, sandstone.heightMap);
  savePng(sandstone.rgba, 128, 128, path.join(blocksFolder, 'sandstone_normal.png'));
  savePng(sandstone.rgba, 128, 128, path.join(blocksFolder, 'sandstone.png'));
  savePng(sandstone.rgba, 128, 128, path.join(blocksFolder, 'sandstone_top.png'));
  savePng(sandstone.rgba, 128, 128, path.join(blocksFolder, 'sandstone_bottom.png'));
  savePng(sandstoneNormal, 128, 128, path.join(blocksFolder, 'sandstone_normal_normal.png'));
  savePng(sandstoneMER, 128, 128, path.join(blocksFolder, 'sandstone_normal_mer.png'));

  // 18. CLAY
  const clay = extra.generateClay(128, 128);
  const clayNormal = extra.generateNormalMap(clay.heightMap, 128, 128, 1.6);
  const clayMER = generateMER(128, 128, 0, 0, 180, clay.heightMap);
  savePng(clay.rgba, 128, 128, path.join(blocksFolder, 'clay.png'));
  savePng(clayNormal, 128, 128, path.join(blocksFolder, 'clay_normal.png'));
  savePng(clayMER, 128, 128, path.join(blocksFolder, 'clay_mer.png'));

  // 2. ITEMS & ENVIRONMENT & UI
  console.log('⚔️ 2/4 Generating items, environment and UI textures...');

  const diamondSword = generateDiamondSword(128, 128);
  savePng(diamondSword.rgba, 128, 128, path.join(itemsFolder, 'diamond_sword.png'));

  const apple = generateApple(128, 128);
  savePng(apple.rgba, 128, 128, path.join(itemsFolder, 'apple.png'));

  const ironPickaxe = generateIronPickaxe(128, 128);
  savePng(ironPickaxe.rgba, 128, 128, path.join(itemsFolder, 'iron_pickaxe.png'));

  const book = generateBook(128, 128);
  savePng(book.rgba, 128, 128, path.join(itemsFolder, 'book_normal.png'));

  // SMARTPHONE ITEM (Modern high-tech real-world object: OLED screen, bezel, apps, camera notch)
  const smartphone = photo.generateModernSmartphone(128, 128);
  savePng(smartphone.rgba, 128, 128, path.join(itemsFolder, 'compass_item.png'));
  savePng(smartphone.rgba, 128, 128, path.join(itemsFolder, 'recovery_compass.png'));
  savePng(smartphone.rgba, 128, 128, path.join(itemsFolder, 'clock_item.png'));

  // PAINTBRUSH (Pinceau d'artiste: wooden turned handle, chrome ferrule, azure paint tips)
  const paintbrush = photo.generatePhotorealisticPaintbrush(128, 128);
  savePng(paintbrush.rgba, 128, 128, path.join(itemsFolder, 'brush.png'));
  savePng(paintbrush.rgba, 128, 128, path.join(itemsFolder, 'feather.png'));
  savePng(paintbrush.rgba, 128, 128, path.join(itemsFolder, 'painting.png'));

  const sun = generateSun(128, 128);
  savePng(sun.rgba, 128, 128, path.join(envFolder, 'sun.png'));

  const moon = generateMoonPhases(256, 128);
  savePng(moon.rgba, 256, 128, path.join(envFolder, 'moon_phases.png'));

  // CLOUDS (Organic, soft non-cubic cumulus clouds with vaporous gradients)
  const clouds = photo.generatePhotorealisticClouds(256, 256);
  savePng(clouds.rgba, 256, 256, path.join(envFolder, 'clouds.png'));

  const crosshair = generateCrosshair(64, 64);
  savePng(crosshair.rgba, 64, 64, path.join(uiFolder, 'cross_hair.png'));
  savePng(crosshair.rgba, 64, 64, path.join(uiFolder, 'crosshair.png'));

  const heart = generateHeart(64, 64);
  savePng(heart.rgba, 64, 64, path.join(uiFolder, 'heart.png'));
  savePng(heart.rgba, 64, 64, path.join(uiFolder, 'heart_full.png'));

  // 3. PACK ICON
  console.log('🎨 3/4 Generating official 512x512 pack_icon.png...');
  const packIcon = generatePackIcon(512, 512);
  savePng(packIcon.rgba, 512, 512, path.join(packFolder, 'pack_icon.png'));

  // 4. BEDROCK TEXTURE_SET.JSON (PBR Render Dragon Deferred Technical Preview)
  console.log('✨ Generating Bedrock texture_set.json specifications...');

  function writeTextureSet(name, hasMER = true) {
    const json = {
      format_version: "1.16.100",
      "minecraft:texture_set": {
        color: name,
        normal: `${name}_normal`,
        metalness_emissive_roughness: hasMER ? `${name}_mer` : undefined
      }
    };
    fs.writeFileSync(
      path.join(blocksFolder, `${name}.texture_set.json`),
      JSON.stringify(json, null, 2)
    );
  }

  [
    'dirt', 'stone', 'grass_top', 'grass_side', 'sand', 'log_oak', 'planks_oak',
    'cobblestone', 'glass', 'brick', 'iron_ore', 'water_still',
    'diamond_ore', 'gold_ore', 'coal_ore', 'emerald_ore', 'redstone_ore',
    'lapis_ore', 'copper_ore', 'cobblestone_mossy', 'log_birch', 'planks_birch',
    'log_spruce', 'planks_spruce', 'crafting_table_top', 'crafting_table_side',
    'bookshelf', 'tnt_side', 'netherrack', 'obsidian', 'glowstone',
    'sandstone_normal', 'clay', 'dirt_path_top', 'concrete_black', 'stripped_oak_log'
  ].forEach(name => {
    writeTextureSet(name, true);
  });
  writeTextureSet('gravel', false);

  // 4b. ATMOSPHERE, FOGS & COLOR GRADING (Render Dragon / Deferred / Shaders)
  const fogsFolder = path.join(packFolder, 'fogs');
  const colorGradingFolder = path.join(packFolder, 'color_grading');
  const atmospheresFolder = path.join(packFolder, 'atmospheres');
  [fogsFolder, colorGradingFolder, atmospheresFolder].forEach(d => fs.mkdirSync(d, { recursive: true }));

  // Water fog: crystal clear light blue with extended bottom visibility
  fs.writeFileSync(path.join(fogsFolder, 'water.json'), JSON.stringify({
    format_version: "1.8.0",
    "minecraft:fog_settings": {
      description: { identifier: "slm:water_fog" },
      distance: {
        air: { fog_start: 0.0, fog_end: 1.0, fog_color: "#000000", render_distance_type: "render" },
        water: { fog_start: 16.0, fog_end: 96.0, fog_color: "#5ecbf8", render_distance_type: "fixed" }
      }
    }
  }, null, 2));

  // Atmosphere fog: warm rose-orange sunset golden hour with rich contrast
  fs.writeFileSync(path.join(fogsFolder, 'atmosphere.json'), JSON.stringify({
    format_version: "1.8.0",
    "minecraft:fog_settings": {
      description: { identifier: "slm:atmosphere_fog" },
      distance: {
        air: { fog_start: 48.0, fog_end: 192.0, fog_color: "#ffa076", render_distance_type: "render" },
        weather: { fog_start: 24.0, fog_end: 80.0, fog_color: "#de755c", render_distance_type: "render" }
      }
    }
  }, null, 2));

  // Color grading: HDR tone mapping, contrast boost, warm rose-orange tint, darkened shadows
  fs.writeFileSync(path.join(colorGradingFolder, 'slm_hdr.json'), JSON.stringify({
    format_version: "1.20.0",
    "minecraft:color_grading_settings": {
      description: { identifier: "slm:hdr_rose_orange" },
      tonemapping: { operator: "reinhard", exposure: 0.98 },
      color_adjustments: {
        contrast: 1.28,
        saturation: 1.15,
        shadow_gain: [0.82, 0.72, 0.75],
        midtones: [1.10, 0.95, 0.88],
        highlights: [1.14, 1.02, 0.94],
        white_balance: { temperature: 4850, tint: 9.0 }
      }
    }
  }, null, 2));

  // Atmosphere settings (sky, horizon, sun colors)
  fs.writeFileSync(path.join(atmospheresFolder, 'weather.json'), JSON.stringify({
    format_version: "1.20.0",
    "minecraft:atmosphere_settings": {
      description: { identifier: "slm:atmosphere" },
      sky_color: "#2a3447",
      horizon_color: "#ffa278",
      sun_color: "#ffebd2",
      fog_color: "#ff9e79"
    }
  }, null, 2));

  // 5. MANIFEST.JSON
  const headerUUID = crypto.randomUUID();
  const moduleUUID = crypto.randomUUID();

  const manifest = {
    format_version: 2,
    header: {
      name: "slm_visual_pack-real",
      description: "slm_visual_pack-real : Textures HD 128x, eau bleu clair ultra-transparente pour voir le fond, PBR Render Dragon et shaders chauds rose orangé HDR avec contraste renforcé.",
      uuid: headerUUID,
      version: [1, 0, 0],
      min_engine_version: [1, 20, 0]
    },
    modules: [
      {
        description: "slm_visual_pack-real Resource Pack Bedrock Edition",
        type: "resources",
        uuid: moduleUUID,
        version: [1, 0, 0]
      }
    ],
    metadata: {
      authors: ["Specialized Bedrock Developer"],
      license: "Custom Free Use",
      url: "https://minecraft.net"
    }
  };

  fs.writeFileSync(path.join(packFolder, 'manifest.json'), JSON.stringify(manifest, null, 2));

  // 6. README.TXT (Honnêteté technique & Guide d'installation Android)
  const readmeContent = `===================================================================
                       REALISM+ 8K — RESOURCE PACK
                      Minecraft Bedrock Edition (Android)
                                Version 1.0.0
===================================================================

[1] INTRODUCTION & PHILOSOPHIE TECHNIQUE
-------------------------------------------------------------------
Bienvenue dans REALISM+ 8K pour Minecraft Bedrock Edition !
Ce Resource Pack a été spécialement conçu pour offrir un niveau de
détail visuel extrême (représenté par le label stylistique "8K"),
tout en préservant scrupuleusement l'identité cubique emblématique
de Minecraft et la fluidité des GPU mobiles sous Android (Adreno & Mali).

[2] RÉSOLUTIONS & BUDGET MÉMOIRE MOBILE
-------------------------------------------------------------------
- Textures de blocs fondamentaux : 128x128 (4096 pixels par face vs 256 vanilla)
- Textures animées : Eau 16 images verticales 128x2048 flipbook (flipbook_textures.json)
- Textures spéciales / Items : 128x128 avec découpes alpha chirurgicales
- Pack Icon : 512x512 HD
- Ratio d'optimisation : Consommation VRAM maîtrisée sous les 100 Mo
  permettant d'éviter les crashs Out-Of-Memory (OOM) sur smartphones Android
  (4 Go, 6 Go et 8 Go de RAM).

[3] ARCHITECTURE DES FICHIERS INCLUS
-------------------------------------------------------------------
REALISM+ 8K/
├── manifest.json                  [Manifeste Bedrock v2 avec UUIDs distincts]
├── pack_icon.png                  [Logo officiel 512x512 haute définition]
├── README.txt                     [Documentation technique & guide d'installation]
└── textures/
    ├── flipbook_textures.json     [Définition officielle de l'animation de l'eau]
    ├── blocks/
    │   ├── dirt.png + dirt_normal.png + dirt_mer.png + dirt.texture_set.json
    │   ├── stone.png + stone_normal.png + stone_mer.png + stone.texture_set.json
    │   ├── iron_ore.png + iron_ore_normal.png + iron_ore_mer.png + iron_ore.texture_set.json
    │   ├── grass_top.png + grass_side.png + normal + mer + texture_sets
    │   ├── cobblestone.png + cobblestone_normal.png + cobblestone_mer.png
    │   ├── sand.png + sand_normal.png + sand_mer.png
    │   ├── log_oak.png + log_oak_top.png + normal + mer
    │   ├── planks_oak.png + planks_oak_normal.png + planks_oak_mer.png
    │   ├── leaves_oak.png + leaves_oak_normal.png
    │   ├── water_still.png + water_flow.png (128x2048 animés) + water_still.texture_set.json
    │   ├── glass.png + glass_normal.png + glass_mer.png
    │   ├── gravel.png + gravel_normal.png
    │   ├── brick.png + brick_normal.png + brick_mer.png
    │   └── deepslate.png + deepslate_normal.png
    ├── items/
    │   ├── diamond_sword.png      [Épée sertie en diamant et cuir]
    │   └── apple.png              [Pomme rouge organique avec feuille]
    ├── environment/
    │   └── sun.png                [Soleil atmosphérique ambiance Golden Hour]
    └── ui/
        ├── cross_hair.png         [Viseur chirurgical épuré]
        └── crosshair.png

[4] SPÉCIFICATION PBR (RENDER DRAGON & DEFERRED TECHNICAL PREVIEW)
-------------------------------------------------------------------
Ce pack intègre les véritables fichiers "*.texture_set.json" officiels
compatibles avec le moteur Render Dragon de Bedrock.
- Canal Normal Map : Tangent space Sobel dérivé du micro-relief
- Canal MER (Metalness - Emissive - Roughness) :
    * Rouge (R) : Métallicité (0 pour roches/terres, 185 pour minerais de fer)
    * Vert (G)  : Émissivité (0 pour blocs inertes, lueur pour sources)
    * Bleu (B)  : Rugosité (25 pour eau, 105 pour minerai poli, 205-238 pour roche)

===================================================================
REALISM+ 8K — TECHNICAL LIMITATIONS
===================================================================

[SUPPORTED]
- textures HD : 128x128 et 256x256 calibrées évitant les crashs VRAM
- textures animées si supportées : Eau animée 16 frames via flipbook_textures.json
- PBR si réellement supporté : Normal maps (Sobel) et MER maps (Metalness/Emissive/Roughness)
- transparence si supportée : Canal alpha 8-bit sur eau, verre et feuillage
- optimisation des ressources : Budget VRAM mobile < 100 Mo sur Adreno et Mali

[ENGINE DEPENDENT]
- éclairage avancé : Requiert le moteur Deferred Technical Preview de Bedrock
- HDR : Pas de pipeline HDR matériel injecté par simple Resource Pack
- réflexions : Réflexions SSR dépendantes du moteur graphique actif
- réfraction : Réfraction physique de l'eau nécessitant le Deferred Preview
- ombres avancées : Ombres directionnelles dynamiques gérées par le moteur
- motion blur : Non supporté nativement par les Resource Packs Bedrock
- optical flow : Effet moteur non injectable via des fichiers de textures
- effets volumétriques : Brouillard volumétrique dépendant du moteur

[NOT GUARANTEED]
- 220 FPS : "220 FPS" est un repère visuel/marketing de fluidité, non une garantie
- température du téléphone : Dépend de la charge thermique et du throttling de l'appareil
- charge GPU : Varie selon la résolution d'écran (1080p, 1440p) et les chunks actifs
- stabilité universelle : Dépend du pilote Vulkan/OpenGL ES du constructeur
- qualité identique sur tous les appareils : Diffère selon le SoC (Snapdragon, Dimensity, Exynos)

[5] GUIDE D'INSTALLATION SUR ANDROID
-------------------------------------------------------------------
MÉTHODE 1 (AUTOMATIQUE - RECOMMANDÉE) :
1. Téléchargez le fichier "REALISM+_8K_v1.0.mcpack".
2. Ouvrez votre gestionnaire de fichiers Android (Files by Google, ZArchiver, etc.).
3. Touchez le fichier "REALISM+_8K_v1.0.mcpack" et sélectionnez "Ouvrir avec Minecraft".
4. Minecraft Bedrock démarre automatiquement et affiche "Importation réussie".
5. Allez dans Paramètres > Ressources globales > Mes packs > Activer "REALISM+ 8K".

MÉTHODE 2 (MANUELLE) :
1. Renommez le fichier .mcpack en .zip si nécessaire et extrayez le dossier "REALISM+ 8K".
2. Déplacez ce dossier dans le répertoire :
   Android/data/com.mojang.minecraftpe/files/games/com.mojang/resource_packs/
3. Redémarrez Minecraft Bedrock et activez le pack.

===================================================================
Pack généré et validé techniquement pour Minecraft Bedrock Edition.
===================================================================
`;

  fs.writeFileSync(path.join(packFolder, 'README.txt'), readmeContent);

  // 7. CREATE THE .MCPACK & .ZIP ARCHIVES (ZIP containing root files)
  console.log('📦 4/4 Creating slm_visual_pack-real.zip & .mcpack archives...');
  const zip = new JSZip();

  // Explicitly add files with UNIX path separators and standard dates to prevent archive corruption on Android
  function addFolderToZip(folderPath, zipFolder) {
    const items = fs.readdirSync(folderPath);
    for (const item of items) {
      const fullPath = path.join(folderPath, item);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        const subZip = zipFolder.folder(item);
        addFolderToZip(fullPath, subZip);
      } else {
        const fileData = fs.readFileSync(fullPath);
        zipFolder.file(item, fileData, {
          date: new Date('2026-01-01T00:00:00Z'),
          unixPermissions: '644'
        });
      }
    }
  }

  addFolderToZip(packFolder, zip);

  // Generate with Deflate level 6 and UNIX platform for 100% compatibility with Android ZArchiver, Files by Google, and Minecraft
  const mcpackBuffer = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
    platform: 'UNIX'
  });

  // Save to public dir as slm_visual_pack-real.zip and slm_visual_pack-real.mcpack
  const slmMcpackPath = path.join(PUBLIC_DIR, 'slm_visual_pack-real.mcpack');
  const slmZipPath = path.join(PUBLIC_DIR, 'slm_visual_pack-real.zip');
  fs.writeFileSync(slmMcpackPath, mcpackBuffer);
  fs.writeFileSync(slmZipPath, mcpackBuffer);

  // Maintain aliases for compatibility
  const legacyMcpackPath = path.join(PUBLIC_DIR, 'REALISM+_8K_v1.0.mcpack');
  const legacyZipPath = path.join(PUBLIC_DIR, 'REALISM+_8K_v1.0.zip');
  fs.writeFileSync(legacyMcpackPath, mcpackBuffer);
  fs.writeFileSync(legacyZipPath, mcpackBuffer);

  // Also copy all generated assets into public/pack_preview for live React interactive display
  function copyRecursive(src, dest) {
    fs.mkdirSync(dest, { recursive: true });
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      if (entry.isDirectory()) {
        copyRecursive(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }

  copyRecursive(packFolder, PUBLIC_PACK_DIR);

  // 8. PBR & RESOURCE INTEGRITY VALIDATION
  console.log('🔍 Running PBR & Resource Integrity Validation Routine...');
  const validationErrors = [];
  const textureSetFiles = fs.readdirSync(blocksFolder).filter(f => f.endsWith('.texture_set.json'));

  for (const tsFile of textureSetFiles) {
    const tsPath = path.join(blocksFolder, tsFile);
    const content = JSON.parse(fs.readFileSync(tsPath, 'utf8'));
    const setDef = content["minecraft:texture_set"];
    if (!setDef) {
      validationErrors.push(`${tsFile}: missing minecraft:texture_set root`);
      continue;
    }
    const colorFile = `${setDef.color}.png`;
    if (!fs.existsSync(path.join(blocksFolder, colorFile))) {
      validationErrors.push(`${tsFile}: referenced color ${colorFile} not found on disk`);
    }
    if (setDef.normal) {
      const normFile = `${setDef.normal}.png`;
      if (!fs.existsSync(path.join(blocksFolder, normFile))) {
        validationErrors.push(`${tsFile}: referenced normal ${normFile} not found on disk`);
      }
    }
    if (setDef.metalness_emissive_roughness) {
      const merFile = `${setDef.metalness_emissive_roughness}.png`;
      if (!fs.existsSync(path.join(blocksFolder, merFile))) {
        validationErrors.push(`${tsFile}: referenced MER ${merFile} not found on disk`);
      }
    }
  }

  // Check flipbook_textures.json
  const flipbookPath = path.join(texturesFolder, 'flipbook_textures.json');
  if (!fs.existsSync(flipbookPath)) {
    validationErrors.push('flipbook_textures.json missing in textures directory');
  } else {
    const flipConfig = JSON.parse(fs.readFileSync(flipbookPath, 'utf8'));
    if (!Array.isArray(flipConfig) || flipConfig.length < 2) {
      validationErrors.push('flipbook_textures.json must contain water_still and water_flow definitions');
    }
  }

  if (validationErrors.length === 0) {
    console.log(`✅ PBR Validation PASSED: ${textureSetFiles.length} Bedrock texture sets & animated flipbooks verified with 100% matching files!`);
  } else {
    console.error('❌ PBR Validation ERRORS:', validationErrors);
    throw new Error('PBR Validation failed');
  }

  console.log('✅ BUILD COMPLETE!');
  console.log(`- Folder: ${packFolder}`);
  console.log(`- MCPack: ${slmMcpackPath} (${(mcpackBuffer.length / 1024).toFixed(1)} KB)`);
  console.log(`- Manifest Header UUID: ${headerUUID}`);
  console.log(`- Manifest Module UUID: ${moduleUUID}`);
}

buildPack().catch(err => {
  console.error('Build failed:', err);
  process.exit(1);
});
