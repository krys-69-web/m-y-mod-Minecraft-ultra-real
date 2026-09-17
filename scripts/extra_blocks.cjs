const { PNG } = require('pngjs');

// Helper import functions from build_pack or recreate concisely
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

// Sobel Normal Map generator
function generateNormalMap(heightMap, width, height, strength = 2.5) {
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

// Generic Ore Generator for Stone Host Rock
function generateGenericOre(stoneData, config, w = 128, h = 128) {
  const rgba = new Uint8Array(w * h * 4);
  const heightMap = new Float32Array(w * h);
  const merData = new Uint8Array(w * h * 4);

  const clusters = config.clusters || [
    { cx: 34, cy: 38, rx: 13, ry: 10, angle: 0.4 },
    { cx: 90, cy: 36, rx: 12, ry: 14, angle: -0.3 },
    { cx: 62, cy: 78, rx: 15, ry: 12, angle: 0.5 },
    { cx: 100, cy: 98, rx: 11, ry: 9, angle: 0.2 },
    { cx: 28, cy: 102, rx: 10, ry: 8, angle: -0.4 }
  ];

  const edgeNoise = createFractalNoise(w, h, 3, 0.6, 8, config.seed || 7701);
  const facetNoise = createFractalNoise(w, h, 2, 0.7, 3, (config.seed || 7701) + 101);

  for (let i = 0; i < w * h; i++) {
    rgba[i * 4 + 0] = stoneData.rgba[i * 4 + 0];
    rgba[i * 4 + 1] = stoneData.rgba[i * 4 + 1];
    rgba[i * 4 + 2] = stoneData.rgba[i * 4 + 2];
    rgba[i * 4 + 3] = 255;
    heightMap[i] = stoneData.heightMap[i];
    merData[i * 4 + 0] = 0;
    merData[i * 4 + 1] = 0;
    merData[i * 4 + 2] = stoneData.roughnessMap ? stoneData.roughnessMap[i] : 222;
    merData[i * 4 + 3] = 255;
  }

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      const nEdge = edgeNoise[idx];
      const nFacet = facetNoise[idx];

      let maxInfluence = 0;
      let isFissure = false;

      for (const cl of clusters) {
        const dx = x - cl.cx;
        const dy = y - cl.cy;
        const cosA = Math.cos(cl.angle);
        const sinA = Math.sin(cl.angle);
        const rx = dx * cosA + dy * sinA;
        const ry = -dx * sinA + dy * cosA;
        const dist = Math.sqrt((rx / cl.rx) ** 2 + (ry / cl.ry) ** 2) + (nEdge - 0.5) * 0.45;

        if (dist < 1.0) {
          const inf = 1.0 - dist;
          if (inf > maxInfluence) maxInfluence = inf;
        } else if (dist < 1.15 && maxInfluence < 0.1) {
          isFissure = true;
        }
      }

      if (maxInfluence > 0.12) {
        const blend = Math.min(1.0, (maxInfluence - 0.12) / 0.32);
        const oreColor = config.getColor(nFacet, maxInfluence);
        
        rgba[idx * 4 + 0] = Math.min(255, Math.max(0, Math.round(rgba[idx * 4 + 0] * (1 - blend) + oreColor.r * blend)));
        rgba[idx * 4 + 1] = Math.min(255, Math.max(0, Math.round(rgba[idx * 4 + 1] * (1 - blend) + oreColor.g * blend)));
        rgba[idx * 4 + 2] = Math.min(255, Math.max(0, Math.round(rgba[idx * 4 + 2] * (1 - blend) + oreColor.b * blend)));

        heightMap[idx] = Math.min(1.0, stoneData.heightMap[idx] + config.heightBoost * blend + (nFacet - 0.5) * 0.05 * blend);

        merData[idx * 4 + 0] = Math.round(config.metallic * blend);
        merData[idx * 4 + 1] = Math.round(config.emissive * blend);
        merData[idx * 4 + 2] = Math.round(222 * (1 - blend) + (config.baseRoughness + (1.0 - nFacet) * config.roughnessRange) * blend);
      } else if (isFissure) {
        rgba[idx * 4 + 0] = Math.max(0, Math.round(rgba[idx * 4 + 0] * 0.72));
        rgba[idx * 4 + 1] = Math.max(0, Math.round(rgba[idx * 4 + 1] * 0.72));
        rgba[idx * 4 + 2] = Math.max(0, Math.round(rgba[idx * 4 + 2] * 0.72));
        heightMap[idx] = Math.max(0, heightMap[idx] - 0.05);
        merData[idx * 4 + 2] = 238;
      }
    }
  }

  return { rgba, heightMap, merData, w, h };
}

// 1. DIAMOND ORE - Pure nostalgic electric cyan brilliance with crystal glow
function generateDiamondOre(stoneData, w = 128, h = 128) {
  return generateGenericOre(stoneData, {
    seed: 8810,
    heightBoost: 0.10,
    metallic: 0,
    emissive: 50, // subtle gem glow
    baseRoughness: 28,
    roughnessRange: 20,
    getColor: (facet, inf) => {
      // Iconic electric cyan gem: (42, 230, 245) to highlights (210, 255, 255)
      const isShine = facet > 0.65;
      return {
        r: isShine ? 190 + (facet - 0.65) * 180 : 38 + facet * 65 + inf * 20,
        g: isShine ? 245 + (facet - 0.65) * 28 : 205 + facet * 45 + inf * 10,
        b: isShine ? 255 : 230 + facet * 25
      };
    }
  }, w, h);
}

// 2. GOLD ORE - Nostalgic buttercup rich gold with genuine metallic response
function generateGoldOre(stoneData, w = 128, h = 128) {
  return generateGenericOre(stoneData, {
    seed: 8820,
    heightBoost: 0.08,
    metallic: 255, // 100% metallic
    emissive: 0,
    baseRoughness: 55,
    roughnessRange: 35,
    getColor: (facet, inf) => {
      // Warm glowing gold: (255, 205, 45) with highlights (255, 245, 140)
      const isShine = facet > 0.68;
      return {
        r: isShine ? 255 : 240 + facet * 15,
        g: isShine ? 240 : 190 + facet * 45 + inf * 12,
        b: isShine ? 130 : 35 + facet * 40
      };
    }
  }, w, h);
}

// 3. COAL ORE - Deep black anthracite carbon veins with sharp vitreous fractures
function generateCoalOre(stoneData, w = 128, h = 128) {
  return generateGenericOre(stoneData, {
    seed: 8830,
    heightBoost: -0.04,
    metallic: 0,
    emissive: 0,
    baseRoughness: 170,
    roughnessRange: 40,
    getColor: (facet) => {
      const lum = 18 + facet * 28;
      return { r: lum + 3, g: lum + 3, b: lum + 6 };
    }
  }, w, h);
}

// 4. EMERALD ORE - Vivid deep beryl emerald green crystals
function generateEmeraldOre(stoneData, w = 128, h = 128) {
  return generateGenericOre(stoneData, {
    seed: 8840,
    heightBoost: 0.12,
    metallic: 0,
    emissive: 40,
    baseRoughness: 35,
    roughnessRange: 25,
    getColor: (facet) => {
      const isShine = facet > 0.7;
      return {
        r: isShine ? 150 : 16 + facet * 45,
        g: isShine ? 255 : 205 + facet * 48,
        b: isShine ? 170 : 65 + facet * 45
      };
    }
  }, w, h);
}

// 5. REDSTONE ORE - Glowing ruby-red crystalline nodules glowing with energy
function generateRedstoneOre(stoneData, w = 128, h = 128) {
  return generateGenericOre(stoneData, {
    seed: 8850,
    heightBoost: 0.08,
    metallic: 0,
    emissive: 195, // vivid red glow in Render Dragon Deferred Preview!
    baseRoughness: 60,
    roughnessRange: 30,
    getColor: (facet) => {
      const isShine = facet > 0.65;
      return {
        r: isShine ? 255 : 225 + facet * 30,
        g: isShine ? 110 : 25 + facet * 35,
        b: isShine ? 110 : 25 + facet * 35
      };
    }
  }, w, h);
}

// 6. LAPIS LAZULI ORE - Celestial ultramarine with golden pyrite flecks
function generateLapisOre(stoneData, w = 128, h = 128) {
  return generateGenericOre(stoneData, {
    seed: 8860,
    heightBoost: 0.06,
    metallic: 35,
    emissive: 0,
    baseRoughness: 75,
    roughnessRange: 30,
    getColor: (facet, inf) => {
      // Occasional golden pyrite inclusion
      const isPyrite = facet > 0.82;
      if (isPyrite) {
        return { r: 230, g: 190, b: 60 };
      }
      return {
        r: 22 + facet * 28,
        g: 68 + facet * 42,
        b: 195 + facet * 55
      };
    }
  }, w, h);
}

// 7. COPPER ORE - Turquoise verdigris patina and raw metallic bronze copper
function generateCopperOre(stoneData, w = 128, h = 128) {
  return generateGenericOre(stoneData, {
    seed: 8870,
    heightBoost: 0.07,
    metallic: 190,
    emissive: 0,
    baseRoughness: 85,
    roughnessRange: 35,
    getColor: (facet) => {
      const isOxidized = facet < 0.42;
      if (isOxidized) {
        // Turquoise verdigris patina
        return { r: 52 + facet * 40, g: 175 + facet * 45, b: 150 + facet * 30 };
      }
      // Raw metallic copper
      return { r: 215 + facet * 38, g: 118 + facet * 30, b: 72 + facet * 25 };
    }
  }, w, h);
}

// 8. MOSSY COBBLESTONE - Cobblestone overgrown with lush nostalgic emerald moss
function generateMossyCobblestone(cobblestoneData, w = 128, h = 128) {
  const mossNoise = createFractalNoise(w, h, 4, 0.6, 16, 9101);
  const leafNoise = createFractalNoise(w, h, 2, 0.7, 4, 9202);

  const rgba = new Uint8Array(w * h * 4);
  const heightMap = new Float32Array(w * h);
  const merData = new Uint8Array(w * h * 4);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      const m = mossNoise[idx];
      const leaf = leafNoise[idx];

      const isMoss = m > 0.42;
      if (isMoss) {
        const mossFactor = Math.min(1.0, (m - 0.42) / 0.35);
        // Nostalgic rich emerald moss
        const rM = 48 + leaf * 35;
        const gM = 142 + leaf * 60;
        const bM = 32 + leaf * 24;

        rgba[idx * 4 + 0] = Math.round(cobblestoneData.rgba[idx * 4 + 0] * (1 - mossFactor) + rM * mossFactor);
        rgba[idx * 4 + 1] = Math.round(cobblestoneData.rgba[idx * 4 + 1] * (1 - mossFactor) + gM * mossFactor);
        rgba[idx * 4 + 2] = Math.round(cobblestoneData.rgba[idx * 4 + 2] * (1 - mossFactor) + bM * mossFactor);
        rgba[idx * 4 + 3] = 255;

        heightMap[idx] = Math.min(1.0, cobblestoneData.heightMap[idx] + 0.08 * mossFactor);
        merData[idx * 4 + 0] = 0;
        merData[idx * 4 + 1] = 0;
        merData[idx * 4 + 2] = 228;
      } else {
        rgba[idx * 4 + 0] = cobblestoneData.rgba[idx * 4 + 0];
        rgba[idx * 4 + 1] = cobblestoneData.rgba[idx * 4 + 1];
        rgba[idx * 4 + 2] = cobblestoneData.rgba[idx * 4 + 2];
        rgba[idx * 4 + 3] = 255;
        heightMap[idx] = cobblestoneData.heightMap[idx];
        merData[idx * 4 + 0] = 0;
        merData[idx * 4 + 1] = 0;
        merData[idx * 4 + 2] = 215;
      }
      merData[idx * 4 + 3] = 255;
    }
  }

  return { rgba, heightMap, merData, w, h };
}

// 9. BIRCH BARK (log_birch) - Bright white paper bark with dark horizontal lenticels
function generateBirchBark(w = 128, h = 128) {
  const baseNoise = createFractalNoise(w, h, 4, 0.5, 32, 9301);
  const lenticelNoise = createSeamlessNoise(w, h, 8, 9402);

  const rgba = new Uint8Array(w * h * 4);
  const heightMap = new Float32Array(w * h);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      const bN = baseNoise[idx];
      const lN = lenticelNoise[idx];

      // Paper white with subtle warm grey tone
      let r = 215 + bN * 28;
      let g = 215 + bN * 26;
      let b = 210 + bN * 24;

      // Dark horizontal lenticels / notches
      const isLenticel = (y % 14 < 2 || (y + 5) % 22 < 3) && lN > 0.45;
      if (isLenticel) {
        r = 38 + lN * 20;
        g = 35 + lN * 18;
        b = 32 + lN * 16;
      }

      r = Math.min(255, Math.max(0, Math.round(r)));
      g = Math.min(255, Math.max(0, Math.round(g)));
      b = Math.min(255, Math.max(0, Math.round(b)));

      rgba[idx * 4 + 0] = r;
      rgba[idx * 4 + 1] = g;
      rgba[idx * 4 + 2] = b;
      rgba[idx * 4 + 3] = 255;
      heightMap[idx] = isLenticel ? 0.2 : 0.6 + bN * 0.3;
    }
  }

  return { rgba, heightMap, w, h };
}

// 10. BIRCH PLANKS (planks_birch) - Warm pale cream wood planks
function generateBirchPlanks(w = 128, h = 128) {
  const planksCount = 4;
  const plankH = h / planksCount;
  const grainNoise = createSeamlessNoise(w, h, 32, 9501);
  const fineGrain = createSeamlessNoise(w, h, 6, 9602);

  const rgba = new Uint8Array(w * h * 4);
  const heightMap = new Float32Array(w * h);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      const plankIdx = Math.floor(y / plankH);
      const localY = y % plankH;

      const grain = Math.sin((x * 0.1) + grainNoise[idx] * 5 + fineGrain[idx] * 2) * 0.5 + 0.5;
      const plankOffset = (plankIdx * 31) % 12 - 6;

      // Pale warm birch cream: (218, 204, 160) to (234, 222, 178)
      let r = 216 + plankOffset + grain * 16;
      let g = 202 + plankOffset + grain * 14;
      let b = 158 + plankOffset + grain * 12;

      let hVal = 0.65;
      if (localY === 0 || localY === plankH - 1) {
        r -= 60; g -= 55; b -= 45; hVal = 0.1;
      } else if (localY === 1 || localY === plankH - 2) {
        r -= 25; g -= 22; b -= 18; hVal = 0.35;
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

// 11. SPRUCE WOOD (log_spruce) - Dark rugged alpine pine bark
function generateSpruceBark(w = 128, h = 128) {
  const vertNoise = createSeamlessNoise(w, h, 64, 9701);
  const detailNoise = createFractalNoise(w, h, 4, 0.5, 16, 9802);

  const rgba = new Uint8Array(w * h * 4);
  const heightMap = new Float32Array(w * h);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      const fiberX = Math.sin((x / w) * Math.PI * 10 + vertNoise[idx] * 2.8);
      const furrow = Math.abs(fiberX);
      const detail = detailNoise[idx];

      // Deep dark pine bark: (46, 32, 20) to (78, 56, 36)
      let r = 48 + furrow * 30 + detail * 16;
      let g = 34 + furrow * 22 + detail * 12;
      let b = 22 + furrow * 14 + detail * 8;

      if (furrow < 0.25) {
        r = Math.max(24, r - 25);
        g = Math.max(16, g - 20);
        b = Math.max(10, b - 14);
      }

      r = Math.min(255, Math.max(0, Math.round(r)));
      g = Math.min(255, Math.max(0, Math.round(g)));
      b = Math.min(255, Math.max(0, Math.round(b)));

      rgba[idx * 4 + 0] = r;
      rgba[idx * 4 + 1] = g;
      rgba[idx * 4 + 2] = b;
      rgba[idx * 4 + 3] = 255;
      heightMap[idx] = furrow * 0.75 + detail * 0.25;
    }
  }

  return { rgba, heightMap, w, h };
}

// 12. SPRUCE PLANKS (planks_spruce) - Rich dark cedar/spruce planks
function generateSprucePlanks(w = 128, h = 128) {
  const planksCount = 4;
  const plankH = h / planksCount;
  const grainNoise = createSeamlessNoise(w, h, 32, 9901);

  const rgba = new Uint8Array(w * h * 4);
  const heightMap = new Float32Array(w * h);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      const plankIdx = Math.floor(y / plankH);
      const localY = y % plankH;
      const grain = Math.sin((x * 0.1) + grainNoise[idx] * 6) * 0.5 + 0.5;
      const plankOffset = (plankIdx * 23) % 10 - 5;

      // Dark rustic cedar/spruce: (105, 75, 46) to (128, 92, 58)
      let r = 106 + plankOffset + grain * 18;
      let g = 74 + plankOffset + grain * 14;
      let b = 45 + plankOffset + grain * 10;

      let hVal = 0.65;
      if (localY === 0 || localY === plankH - 1) {
        r -= 45; g -= 35; b -= 25; hVal = 0.1;
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

// 13. CRAFTING TABLE (Top, Side, Front)
function generateCraftingTableTop(oakPlanksData, w = 128, h = 128) {
  const rgba = new Uint8Array(w * h * 4);
  const heightMap = new Float32Array(w * h);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      const isOuterBorder = (x < 12 || x >= w - 12 || y < 12 || y >= h - 12);
      const isGridLine = (x % 34 < 3 || y % 34 < 3) && (x >= 12 && x < w - 12 && y >= 12 && y < h - 12);

      if (isOuterBorder) {
        // Dark leather rim / iron bracket corner
        const isCorner = (x < 16 || x >= w - 16) && (y < 16 || y >= h - 16);
        if (isCorner) {
          rgba[idx * 4 + 0] = 75;
          rgba[idx * 4 + 1] = 75;
          rgba[idx * 4 + 2] = 80;
        } else {
          rgba[idx * 4 + 0] = 135;
          rgba[idx * 4 + 1] = 95;
          rgba[idx * 4 + 2] = 55;
        }
        heightMap[idx] = 0.8;
      } else if (isGridLine) {
        // Inlaid carpenter grid line
        rgba[idx * 4 + 0] = 65;
        rgba[idx * 4 + 1] = 45;
        rgba[idx * 4 + 2] = 25;
        heightMap[idx] = 0.25;
      } else {
        // Smooth oak surface
        rgba[idx * 4 + 0] = Math.min(255, oakPlanksData.rgba[idx * 4 + 0] + 15);
        rgba[idx * 4 + 1] = Math.min(255, oakPlanksData.rgba[idx * 4 + 1] + 12);
        rgba[idx * 4 + 2] = Math.min(255, oakPlanksData.rgba[idx * 4 + 2] + 8);
        heightMap[idx] = 0.6;
      }
      rgba[idx * 4 + 3] = 255;
    }
  }
  return { rgba, heightMap, w, h };
}

function generateCraftingTableSide(oakPlanksData, w = 128, h = 128) {
  const rgba = new Uint8Array(w * h * 4);
  const heightMap = new Float32Array(w * h);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      // Start with oak planks base
      rgba[idx * 4 + 0] = oakPlanksData.rgba[idx * 4 + 0];
      rgba[idx * 4 + 1] = oakPlanksData.rgba[idx * 4 + 1];
      rgba[idx * 4 + 2] = oakPlanksData.rgba[idx * 4 + 2];
      rgba[idx * 4 + 3] = 255;
      heightMap[idx] = 0.5;

      // Hanging carpenter saw / hammer silhouette on side
      const isSawBlade = (x >= 28 && x <= 98 && y >= 45 && y <= 55);
      const isSawTeeth = (x >= 28 && x <= 98 && y === 56 && x % 4 < 2);
      const isSawHandle = (x >= 92 && x <= 104 && y >= 38 && y <= 62);

      if (isSawBlade || isSawTeeth) {
        rgba[idx * 4 + 0] = 195;
        rgba[idx * 4 + 1] = 200;
        rgba[idx * 4 + 2] = 210;
        heightMap[idx] = 0.75;
      } else if (isSawHandle) {
        rgba[idx * 4 + 0] = 120;
        rgba[idx * 4 + 1] = 65;
        rgba[idx * 4 + 2] = 30;
        heightMap[idx] = 0.8;
      }
    }
  }
  return { rgba, heightMap, w, h };
}

// 14. BOOKSHELF - 3 shelves packed with colorful nostalgic leather-bound books
function generateBookshelf(oakPlanksData, w = 128, h = 128) {
  const rgba = new Uint8Array(w * h * 4);
  const heightMap = new Float32Array(w * h);
  const merData = new Uint8Array(w * h * 4);

  const shelfH = 42;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      const shelfIdx = Math.floor(y / shelfH);
      const localY = y % shelfH;

      const isFrame = (x < 6 || x >= w - 6 || localY < 4 || localY >= shelfH - 4);

      if (isFrame) {
        // Oak shelf frame
        rgba[idx * 4 + 0] = oakPlanksData.rgba[idx * 4 + 0];
        rgba[idx * 4 + 1] = oakPlanksData.rgba[idx * 4 + 1];
        rgba[idx * 4 + 2] = oakPlanksData.rgba[idx * 4 + 2];
        heightMap[idx] = 0.8;
        merData[idx * 4 + 0] = 0;
        merData[idx * 4 + 1] = 0;
        merData[idx * 4 + 2] = 210;
      } else {
        // Books on shelf: book width ~ 8-12 pixels
        const bookIdx = Math.floor(x / 11);
        const bookX = x % 11;
        const bookPalette = [
          { r: 175, g: 35, b: 35 },   // Crimson leather
          { r: 28, g: 85, b: 185 },   // Azure blue
          { r: 35, g: 135, b: 50 },   // Emerald green
          { r: 145, g: 95, b: 30 },   // Warm brown
          { r: 95, g: 40, b: 130 },   // Royal purple
          { r: 215, g: 175, b: 55 }   // Gold leaf
        ];
        const color = bookPalette[(bookIdx * 7 + shelfIdx * 11) % bookPalette.length];

        const isSpineRib = (localY === 12 || localY === 24) && bookX > 1 && bookX < 9;
        const isGoldFoil = (localY === 18) && bookX > 2 && bookX < 8;

        if (isGoldFoil) {
          rgba[idx * 4 + 0] = 235;
          rgba[idx * 4 + 1] = 200;
          rgba[idx * 4 + 2] = 65;
          merData[idx * 4 + 0] = 220; // Metallic gold spine
          merData[idx * 4 + 2] = 60;
        } else if (isSpineRib) {
          rgba[idx * 4 + 0] = Math.min(255, color.r + 30);
          rgba[idx * 4 + 1] = Math.min(255, color.g + 30);
          rgba[idx * 4 + 2] = Math.min(255, color.b + 30);
          merData[idx * 4 + 0] = 0;
          merData[idx * 4 + 2] = 160;
        } else {
          rgba[idx * 4 + 0] = color.r;
          rgba[idx * 4 + 1] = color.g;
          rgba[idx * 4 + 2] = color.b;
          merData[idx * 4 + 0] = 0;
          merData[idx * 4 + 2] = 175; // Matte leather
        }
        heightMap[idx] = 0.55;
      }
      rgba[idx * 4 + 3] = 255;
      merData[idx * 4 + 3] = 255;
    }
  }

  return { rgba, heightMap, merData, w, h };
}

// 15. TNT - Dynamite sticks with white warning band and black TNT stencil
function generateTNT(w = 128, h = 128) {
  const rgba = new Uint8Array(w * h * 4);
  const heightMap = new Float32Array(w * h);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      const isBand = (y >= 48 && y <= 80);

      if (isBand) {
        // White paper warning band with dark TNT letters
        rgba[idx * 4 + 0] = 238;
        rgba[idx * 4 + 1] = 236;
        rgba[idx * 4 + 2] = 230;
        heightMap[idx] = 0.7;
      } else {
        // Cylindrical red dynamite sticks (16 columns across width)
        const stickX = x % 8;
        const stickCrest = Math.sin((stickX / 8) * Math.PI);

        // Rich explosive red
        let r = 185 + stickCrest * 55;
        let g = 28 + stickCrest * 15;
        let b = 24 + stickCrest * 12;

        if (stickX === 0 || stickX === 7) {
          r = 75; g = 15; b = 12; // deep groove between sticks
        }

        rgba[idx * 4 + 0] = Math.min(255, Math.round(r));
        rgba[idx * 4 + 1] = Math.min(255, Math.round(g));
        rgba[idx * 4 + 2] = Math.min(255, Math.round(b));
        heightMap[idx] = 0.4 + stickCrest * 0.4;
      }
      rgba[idx * 4 + 3] = 255;
    }
  }

  // Draw bold "TNT" on white band
  function drawPixelRect(x0, y0, rw, rh) {
    for (let py = y0; py < y0 + rh; py++) {
      for (let px = x0; px < x0 + rw; px++) {
        if (px >= 0 && px < w && py >= 0 && py < h) {
          const pidx = (py * w + px) * 4;
          rgba[pidx + 0] = 22;
          rgba[pidx + 1] = 22;
          rgba[pidx + 2] = 25;
        }
      }
    }
  }

  // 'T' 'N' 'T'
  // Letter 1: T at x = 32
  drawPixelRect(28, 54, 20, 4);
  drawPixelRect(36, 58, 4, 18);
  // Letter 2: N at x = 54
  drawPixelRect(54, 54, 4, 22);
  drawPixelRect(70, 54, 4, 22);
  for (let i = 0; i < 14; i++) drawPixelRect(56 + i, 58 + i, 3, 3);
  // Letter 3: T at x = 80
  drawPixelRect(78, 54, 20, 4);
  drawPixelRect(86, 58, 4, 18);

  return { rgba, heightMap, w, h };
}

// 16. NETHERRACK - Fiery dark crimson underworld rock with smoldering embers
function generateNetherrack(w = 128, h = 128) {
  const rockNoise = createFractalNoise(w, h, 5, 0.6, 20, 9951);
  const emberNoise = createFractalNoise(w, h, 3, 0.7, 6, 9962);

  const rgba = new Uint8Array(w * h * 4);
  const heightMap = new Float32Array(w * h);
  const merData = new Uint8Array(w * h * 4);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      const rN = rockNoise[idx];
      const eN = emberNoise[idx];

      // Fiery dark crimson stone: (115, 32, 32) to (165, 52, 45)
      let r = 112 + rN * 50 + eN * 20;
      let g = 28 + rN * 24 + eN * 12;
      let b = 28 + rN * 20 + eN * 8;

      let emissive = 0;
      // Glowing embers in fissures
      if (eN > 0.78) {
        const boost = (eN - 0.78) * 220;
        r += boost * 1.2;
        g += boost * 0.75;
        b += boost * 0.1;
        emissive = Math.round(boost);
      }

      r = Math.min(255, Math.max(0, Math.round(r)));
      g = Math.min(255, Math.max(0, Math.round(g)));
      b = Math.min(255, Math.max(0, Math.round(b)));

      rgba[idx * 4 + 0] = r;
      rgba[idx * 4 + 1] = g;
      rgba[idx * 4 + 2] = b;
      rgba[idx * 4 + 3] = 255;

      heightMap[idx] = rN * 0.7 + eN * 0.3;
      merData[idx * 4 + 0] = 0;
      merData[idx * 4 + 1] = emissive;
      merData[idx * 4 + 2] = 230;
      merData[idx * 4 + 3] = 255;
    }
  }

  return { rgba, heightMap, merData, w, h };
}

// 17. OBSIDIAN - Deep dark volcanic glass with reflective indigo/violet crystalline sheen
function generateObsidian(w = 128, h = 128) {
  const crystalNoise = createFractalNoise(w, h, 4, 0.65, 16, 9971);
  const facetNoise = createFractalNoise(w, h, 2, 0.7, 4, 9982);

  const rgba = new Uint8Array(w * h * 4);
  const heightMap = new Float32Array(w * h);
  const merData = new Uint8Array(w * h * 4);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      const cN = crystalNoise[idx];
      const fN = facetNoise[idx];

      // Deep dark obsidian purple/black: (22, 14, 38) to (54, 32, 85)
      let r = 24 + cN * 28 + fN * 12;
      let g = 16 + cN * 18 + fN * 8;
      let b = 42 + cN * 46 + fN * 22;

      // Crystalline razor facet
      if (fN > 0.75) {
        r += 35; g += 25; b += 60;
      }

      r = Math.min(255, Math.max(0, Math.round(r)));
      g = Math.min(255, Math.max(0, Math.round(g)));
      b = Math.min(255, Math.max(0, Math.round(b)));

      rgba[idx * 4 + 0] = r;
      rgba[idx * 4 + 1] = g;
      rgba[idx * 4 + 2] = b;
      rgba[idx * 4 + 3] = 255;

      heightMap[idx] = cN * 0.7 + fN * 0.3;
      merData[idx * 4 + 0] = 20;
      merData[idx * 4 + 1] = 0;
      merData[idx * 4 + 2] = 28; // Smooth glossy volcanic glass specular reflection!
      merData[idx * 4 + 3] = 255;
    }
  }

  return { rgba, heightMap, merData, w, h };
}

// 18. GLOWSTONE - Radiant golden amber luminous crystal cluster
function generateGlowstone(w = 128, h = 128) {
  const clusterNoise = createFractalNoise(w, h, 4, 0.6, 12, 9991);
  const facetNoise = createFractalNoise(w, h, 2, 0.7, 4, 9992);

  const rgba = new Uint8Array(w * h * 4);
  const heightMap = new Float32Array(w * h);
  const merData = new Uint8Array(w * h * 4);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      const cN = clusterNoise[idx];
      const fN = facetNoise[idx];

      // Radiant golden honey amber
      let r = 235 + cN * 20;
      let g = 175 + cN * 45 + fN * 20;
      let b = 45 + cN * 60;

      // Dark golden crystal boundaries
      if (cN < 0.28) {
        r = 145; g = 90; b = 25;
      }

      r = Math.min(255, Math.max(0, Math.round(r)));
      g = Math.min(255, Math.max(0, Math.round(g)));
      b = Math.min(255, Math.max(0, Math.round(b)));

      rgba[idx * 4 + 0] = r;
      rgba[idx * 4 + 1] = g;
      rgba[idx * 4 + 2] = b;
      rgba[idx * 4 + 3] = 255;

      heightMap[idx] = cN * 0.6 + fN * 0.4;
      merData[idx * 4 + 0] = 0;
      merData[idx * 4 + 1] = 255; // Max glow emission in Render Dragon!
      merData[idx * 4 + 2] = 75;
      merData[idx * 4 + 3] = 255;
    }
  }

  return { rgba, heightMap, merData, w, h };
}

// 19. SANDSTONE - Warm stratified desert stone
function generateSandstone(w = 128, h = 128) {
  const layerNoise = createFractalNoise(w, h, 4, 0.6, 24, 8881);
  const grainNoise = createFractalNoise(w, h, 2, 0.7, 4, 8882);

  const rgba = new Uint8Array(w * h * 4);
  const heightMap = new Float32Array(w * h);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      const layer = Math.sin(y * 0.15 + layerNoise[idx] * 3) * 0.5 + 0.5;
      const grain = grainNoise[idx];

      // Warm golden sandstone: (218, 196, 142) to (236, 218, 168)
      let r = 216 + layer * 18 + grain * 12;
      let g = 194 + layer * 16 + grain * 10;
      let b = 138 + layer * 14 + grain * 8;

      r = Math.min(255, Math.max(0, Math.round(r)));
      g = Math.min(255, Math.max(0, Math.round(g)));
      b = Math.min(255, Math.max(0, Math.round(b)));

      rgba[idx * 4 + 0] = r;
      rgba[idx * 4 + 1] = g;
      rgba[idx * 4 + 2] = b;
      rgba[idx * 4 + 3] = 255;
      heightMap[idx] = layer * 0.7 + grain * 0.3;
    }
  }

  return { rgba, heightMap, w, h };
}

// 20. CLAY - Smooth riverbed blue-grey clay
function generateClay(w = 128, h = 128) {
  const waveNoise = createFractalNoise(w, h, 4, 0.55, 20, 7771);
  const microNoise = createFractalNoise(w, h, 2, 0.7, 4, 7772);

  const rgba = new Uint8Array(w * h * 4);
  const heightMap = new Float32Array(w * h);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      const wN = waveNoise[idx];
      const mN = microNoise[idx];

      // Smooth cool riverbed blue-grey clay: (156, 168, 185)
      let r = 152 + wN * 16 + mN * 8;
      let g = 162 + wN * 18 + mN * 8;
      let b = 178 + wN * 20 + mN * 10;

      r = Math.min(255, Math.max(0, Math.round(r)));
      g = Math.min(255, Math.max(0, Math.round(g)));
      b = Math.min(255, Math.max(0, Math.round(b)));

      rgba[idx * 4 + 0] = r;
      rgba[idx * 4 + 1] = g;
      rgba[idx * 4 + 2] = b;
      rgba[idx * 4 + 3] = 255;
      heightMap[idx] = wN * 0.6 + mN * 0.4;
    }
  }

  return { rgba, heightMap, w, h };
}

module.exports = {
  generateDiamondOre,
  generateGoldOre,
  generateCoalOre,
  generateEmeraldOre,
  generateRedstoneOre,
  generateLapisOre,
  generateCopperOre,
  generateMossyCobblestone,
  generateBirchBark,
  generateBirchPlanks,
  generateSpruceBark,
  generateSprucePlanks,
  generateCraftingTableTop,
  generateCraftingTableSide,
  generateBookshelf,
  generateTNT,
  generateNetherrack,
  generateObsidian,
  generateGlowstone,
  generateSandstone,
  generateClay,
  generateNormalMap
};
