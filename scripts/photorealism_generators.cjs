// ===================================================================
// PHOTOREALISM GENERATORS FOR REALISM+ 8K (MINECRAFT BEDROCK EDITION)
// Specialized in granular crumbly soil, distinct grass blades,
// fluid animated water, asphalt roads, timber beams, and modern items.
// ===================================================================

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

// Sobel Normal Map generator with adjustable strength
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

// -------------------------------------------------------------------
// 1. PHOTOREALISTIC DIRT (Terre meuble friable, mottes, cailloux, racines)
// -------------------------------------------------------------------
function generatePhotorealisticDirt(w = 128, h = 128) {
  const rgba = new Uint8Array(w * h * 4);
  const heightMap = new Float32Array(w * h);
  const roughnessMap = new Uint8Array(w * h);

  // Clod cellular centers (Voronoi) - seamless on 128x128
  const rand = createNoise(9876);
  const numClods = 48;
  const clods = [];
  for (let i = 0; i < numClods; i++) {
    clods.push({
      x: rand() * w,
      y: rand() * h,
      size: 6 + rand() * 14,
      tone: (rand() - 0.5) * 24
    });
  }

  // Scattered pebbles & small gravel stones (38 stones)
  const numPebbles = 38;
  const pebbles = [];
  for (let i = 0; i < numPebbles; i++) {
    const pType = rand();
    let pr = 135, pg = 130, pb = 125; // default river stone gray
    if (pType < 0.25) { // quartz / limestone cream
      pr = 175; pg = 165; pb = 145;
    } else if (pType < 0.5) { // sandstone tan
      pr = 155; pg = 125; pb = 85;
    } else if (pType < 0.75) { // dark flint / slate
      pr = 80; pg = 80; pb = 85;
    }
    pebbles.push({
      x: rand() * w,
      y: rand() * h,
      radius: 1.8 + rand() * 2.8,
      r: pr + (rand() - 0.5) * 15,
      g: pg + (rand() - 0.5) * 15,
      b: pb + (rand() - 0.5) * 15
    });
  }

  const macroNoise = createFractalNoise(w, h, 4, 0.5, 24, 1101);
  const crumbNoise = createFractalNoise(w, h, 3, 0.7, 4, 2202);
  const fineGrit = createSeamlessNoise(w, h, 2, 3303);

  // Pre-calculate root spline paths
  const rootMask = new Float32Array(w * h);
  const numRoots = 7;
  for (let r = 0; r < numRoots; r++) {
    let rx = rand() * w;
    let ry = rand() * h;
    let angle = rand() * Math.PI * 2;
    const len = 35 + rand() * 55;
    for (let s = 0; s < len; s++) {
      const ix = Math.floor(((rx % w) + w) % w);
      const iy = Math.floor(((ry % h) + h) % h);
      rootMask[iy * w + ix] = Math.max(rootMask[iy * w + ix], 1.0 - s / len);
      angle += (rand() - 0.5) * 0.5;
      rx += Math.cos(angle) * 0.9;
      ry += Math.sin(angle) * 0.9;
    }
  }

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;

      // Find distance to closest clod center (toroidal distance)
      let minDist1 = 999;
      let minDist2 = 999;
      let closestClod = clods[0];

      for (let i = 0; i < numClods; i++) {
        const c = clods[i];
        let dx = Math.abs(x - c.x);
        if (dx > w / 2) dx = w - dx;
        let dy = Math.abs(y - c.y);
        if (dy > h / 2) dy = h - dy;
        const d = Math.sqrt(dx * dx + dy * dy);

        if (d < minDist1) {
          minDist2 = minDist1;
          minDist1 = d;
          closestClod = c;
        } else if (d < minDist2) {
          minDist2 = d;
        }
      }

      // Clod crevice factor: (minDist2 - minDist1) is 0 at cell borders
      const crevice = Math.min(1.0, (minDist2 - minDist1) / 3.2);
      const clodCenterFactor = Math.max(0, 1.0 - (minDist1 / closestClod.size));

      const macro = macroNoise[idx];
      const crumb = crumbNoise[idx];
      const grit = fineGrit[idx];

      // Base rich organic soil color: warm brown loam with crumbly contrast
      let r = 102 + macro * 32 + crumb * 22 + (grit - 0.5) * 16 + closestClod.tone;
      let g = 72 + macro * 24 + crumb * 16 + (grit - 0.5) * 12 + closestClod.tone * 0.7;
      let b = 44 + macro * 16 + crumb * 10 + (grit - 0.5) * 8 + closestClod.tone * 0.4;

      // Crevices between clods are deep and shadowed
      if (crevice < 0.9) {
        const dark = (1.0 - crevice) * 48;
        r = Math.max(28, r - dark * 1.1);
        g = Math.max(20, g - dark);
        b = Math.max(12, b - dark * 0.9);
      }

      // Clod crest highlights (sunlit dry crumbly earth)
      if (clodCenterFactor > 0.4) {
        const crest = (clodCenterFactor - 0.4) * 22;
        r += crest * 1.1;
        g += crest * 0.9;
        b += crest * 0.6;
      }

      // Damp micro-pocket
      if (macro < 0.28 && crevice < 0.6) {
        r *= 0.82;
        g *= 0.82;
        b *= 0.85;
      }

      // Roughness for earth is matte non-metallic
      let roughness = 238 + (grit - 0.5) * 14;
      let hVal = 0.35 + crevice * 0.35 + clodCenterFactor * 0.2 + crumb * 0.1;

      // Check rootlets
      const rootVal = rootMask[idx];
      if (rootVal > 0.3) {
        r = 145 + rootVal * 25;
        g = 115 + rootVal * 20;
        b = 75 + rootVal * 15;
        hVal = Math.min(1.0, hVal + 0.15);
        roughness = 210;
      }

      // Check pebbles & small stones
      for (let i = 0; i < numPebbles; i++) {
        const p = pebbles[i];
        let dx = Math.abs(x - p.x);
        if (dx > w / 2) dx = w - dx;
        let dy = Math.abs(y - p.y);
        if (dy > h / 2) dy = h - dy;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist <= p.radius) {
          const normDist = dist / p.radius;
          // 3D dome normal approximation: light from top-left (-dx -dy)
          const lightShade = (- (x - p.x) - (y - p.y)) / (p.radius * 1.4);
          let pr = p.r + lightShade * 38 + (grit - 0.5) * 12;
          let pg = p.g + lightShade * 36 + (grit - 0.5) * 12;
          let pb = p.b + lightShade * 34 + (grit - 0.5) * 12;

          // Shadow rim at bottom-right edge
          if (normDist > 0.75 && lightShade < -0.2) {
            pr *= 0.65; pg *= 0.65; pb *= 0.65;
          }

          r = pr;
          g = pg;
          b = pb;
          hVal = 0.7 + (1.0 - normDist) * 0.28;
          roughness = 125 + normDist * 35; // smooth reflective stone
          break;
        } else if (dist <= p.radius + 1.2) {
          // Contact occlusion shadow under pebble
          r = Math.max(22, r - 28);
          g = Math.max(16, g - 25);
          b = Math.max(10, b - 20);
          hVal = Math.max(0.1, hVal - 0.1);
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
      roughnessMap[idx] = Math.min(255, Math.max(100, Math.round(roughness)));
    }
  }

  return { rgba, heightMap, roughnessMap, w, h };
}

// -------------------------------------------------------------------
// 2. PHOTOREALISTIC GRASS TOP (Brins d'herbe individuels, terreau en dessous)
// -------------------------------------------------------------------
function generatePhotorealisticGrassTop(w = 128, h = 128) {
  const rgba = new Uint8Array(w * h * 4);
  const heightMap = new Float32Array(w * h);
  const roughnessMap = new Uint8Array(w * h);

  // 1. Base: Rich, dark organic soil and humus peeking between blades
  const soilNoise = createFractalNoise(w, h, 3, 0.6, 16, 5511);
  const gritNoise = createSeamlessNoise(w, h, 3, 6622);

  for (let i = 0; i < w * h; i++) {
    const s = soilNoise[i];
    const g = gritNoise[i];
    // Dark fertile humus base
    rgba[i * 4 + 0] = Math.round(48 + s * 22 + (g - 0.5) * 12);
    rgba[i * 4 + 1] = Math.round(34 + s * 16 + (g - 0.5) * 10);
    rgba[i * 4 + 2] = Math.round(20 + s * 10 + (g - 0.5) * 8);
    rgba[i * 4 + 3] = 255;
    heightMap[i] = 0.2 + s * 0.1;
    roughnessMap[i] = 245;
  }

  // 2. Procedural grass blade strands (450 distinct sharp blades)
  const rand = createNoise(4433);
  const numBlades = 520;

  for (let b = 0; b < numBlades; b++) {
    const rootX = rand() * w;
    const rootY = rand() * h;
    const bladeLen = 6 + rand() * 9;
    // Dominant wind/sway angle with natural spread
    const angle = (rand() - 0.5) * 1.6 - 0.4;
    const curvature = (rand() - 0.5) * 0.25;
    const bladeWidth = 1.6 + rand() * 0.8;

    // Grass blade color: base is deep rich green, tip is bright sunlit lime
    const bladeHue = rand();
    const baseR = 48 + bladeHue * 18;
    const baseG = 110 + bladeHue * 35;
    const baseB = 22 + bladeHue * 12;

    const tipR = 85 + bladeHue * 35;
    const tipG = 175 + bladeHue * 45;
    const tipB = 38 + bladeHue * 20;

    let curX = rootX;
    let curY = rootY;
    let curAngle = angle;

    for (let step = 0; step < bladeLen; step++) {
      const progress = step / bladeLen;
      const r = Math.round(baseR + (tipR - baseR) * progress);
      const g = Math.round(baseG + (tipG - baseG) * progress);
      const bl = Math.round(baseB + (tipB - baseB) * progress);
      const wRad = bladeWidth * (1.0 - progress * 0.65);

      // Render blade segment with lateral highlight and shadow
      for (let off = -Math.ceil(wRad); off <= Math.ceil(wRad); off++) {
        const perpAngle = curAngle + Math.PI / 2;
        const px = Math.floor((((curX + Math.cos(perpAngle) * off) % w) + w) % w);
        const py = Math.floor((((curY + Math.sin(perpAngle) * off) % h) + h) % h);
        const pIdx = py * w + px;

        let segR = r;
        let segG = g;
        let segB = bl;

        if (off < 0) {
          // Highlight edge catches skylight
          segR = Math.min(255, segR + 25);
          segG = Math.min(255, segG + 35);
          segB = Math.min(255, segB + 15);
        } else if (off > 0) {
          // Shadow edge underneath
          segR = Math.max(15, segR - 35);
          segG = Math.max(35, segG - 45);
          segB = Math.max(10, segB - 20);
        }

        rgba[pIdx * 4 + 0] = segR;
        rgba[pIdx * 4 + 1] = segG;
        rgba[pIdx * 4 + 2] = segB;
        heightMap[pIdx] = Math.max(heightMap[pIdx], 0.45 + progress * 0.45);
        roughnessMap[pIdx] = 215;
      }

      // Cast shadow under blade on ground
      const shadowX = Math.floor((((curX + 1.5) % w) + w) % w);
      const shadowY = Math.floor((((curY + 1.5) % h) + h) % h);
      const sIdx = shadowY * w + shadowX;
      if (heightMap[sIdx] < 0.4) {
        rgba[sIdx * 4 + 0] = Math.max(20, rgba[sIdx * 4 + 0] - 25);
        rgba[sIdx * 4 + 1] = Math.max(25, rgba[sIdx * 4 + 1] - 35);
        rgba[sIdx * 4 + 2] = Math.max(15, rgba[sIdx * 4 + 2] - 15);
      }

      curAngle += curvature;
      curX += Math.cos(curAngle);
      curY += Math.sin(curAngle);
    }
  }

  // 3. Add 8 micro-clover clusters (trèfles à 3 lobes)
  const numClovers = 10;
  for (let c = 0; c < numClovers; c++) {
    const cx = rand() * w;
    const cy = rand() * h;
    for (let lobe = 0; lobe < 3; lobe++) {
      const lAngle = (lobe / 3) * Math.PI * 2 + rand() * 0.2;
      const lx = cx + Math.cos(lAngle) * 2.2;
      const ly = cy + Math.sin(lAngle) * 2.2;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const px = Math.floor((((lx + dx) % w) + w) % w);
          const py = Math.floor((((ly + dy) % h) + h) % h);
          const idx = py * w + px;
          rgba[idx * 4 + 0] = 52;
          rgba[idx * 4 + 1] = 158;
          rgba[idx * 4 + 2] = 36;
          heightMap[idx] = 0.85;
        }
      }
    }
  }

  return { rgba, heightMap, roughnessMap, w, h };
}

// -------------------------------------------------------------------
// 3. PHOTOREALISTIC GRASS SIDE (Touffes retombantes & racines sur terre)
// -------------------------------------------------------------------
function generatePhotorealisticGrassSide(dirtData, grassTopData, w = 128, h = 128) {
  const rgba = new Uint8Array(w * h * 4);
  const heightMap = new Float32Array(w * h);
  const roughnessMap = new Uint8Array(w * h);

  // Initialize fully with crumbly photorealistic dirt base
  for (let i = 0; i < w * h * 4; i++) {
    rgba[i] = dirtData.rgba[i];
  }
  for (let i = 0; i < w * h; i++) {
    heightMap[i] = dirtData.heightMap[i];
    roughnessMap[i] = dirtData.roughnessMap ? dirtData.roughnessMap[i] : 235;
  }

  // Generate organic hanging turf overhang with sharp hanging blades and trailing roots
  const rand = createNoise(8831);
  const turfBaseDepth = Math.floor(h * 0.22); // ~28px
  const hangingSpikes = [];

  for (let x = 0; x < w; x++) {
    // Wave profile + micro-variation
    const macroWave = Math.sin((x / w) * Math.PI * 4) * 5 + Math.cos((x / w) * Math.PI * 7) * 4;
    const spike = (rand() > 0.72) ? (rand() * 18 + 6) : 0;
    hangingSpikes.push(turfBaseDepth + macroWave + spike);
  }

  for (let x = 0; x < w; x++) {
    const limitY = hangingSpikes[x];
    for (let y = 0; y < Math.min(h, limitY); y++) {
      const idx = y * w + x;
      const topIdx = (y % 16) * w + x; // sample grass blade colors

      const gR = grassTopData.rgba[topIdx * 4 + 0];
      const gG = grassTopData.rgba[topIdx * 4 + 1];
      const gB = grassTopData.rgba[topIdx * 4 + 2];

      const depthRatio = y / limitY;
      const shade = depthRatio * 32;

      rgba[idx * 4 + 0] = Math.max(25, Math.round(gR - shade * 0.9));
      rgba[idx * 4 + 1] = Math.max(45, Math.round(gG - shade));
      rgba[idx * 4 + 2] = Math.max(15, Math.round(gB - shade * 0.7));
      rgba[idx * 4 + 3] = 255;

      heightMap[idx] = 0.75 - depthRatio * 0.2;
      roughnessMap[idx] = 220;
    }

    // Trailing organic rootlets descending deep into soil
    if (rand() > 0.6) {
      const rootLen = Math.floor(rand() * 25 + 8);
      let rx = x;
      for (let ry = Math.floor(limitY); ry < Math.min(h - 1, limitY + rootLen); ry++) {
        const rIdx = ry * w + rx;
        rgba[rIdx * 4 + 0] = 148;
        rgba[rIdx * 4 + 1] = 118;
        rgba[rIdx * 4 + 2] = 78;
        heightMap[rIdx] = Math.max(heightMap[rIdx], 0.65);
        if (rand() > 0.5) rx = Math.max(0, Math.min(w - 1, rx + ((rand() > 0.5) ? 1 : -1)));
      }
    }
  }

  return { rgba, heightMap, roughnessMap, w, h };
}

// -------------------------------------------------------------------
// 4. DIRT PATH / CHEMIN DE TERRE COMPACTÉ (Grave, ornières, poussière)
// -------------------------------------------------------------------
function generateDirtPath(w = 128, h = 128, isSide = false) {
  const rgba = new Uint8Array(w * h * 4);
  const heightMap = new Float32Array(w * h);
  const roughnessMap = new Uint8Array(w * h);

  const baseNoise = createFractalNoise(w, h, 4, 0.55, 20, 7711);
  const gravelNoise = createFractalNoise(w, h, 3, 0.7, 4, 8822);
  const fineDust = createSeamlessNoise(w, h, 2, 9933);
  const rand = createNoise(3311);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      const base = baseNoise[idx];
      const grav = gravelNoise[idx];
      const dust = fineDust[idx];

      // Subtle track impressions running along axis
      const track = Math.sin(x * 0.15) * 0.08;

      // Compacted tan-beige dirt path palette
      let r = 142 + base * 34 + grav * 18 + (dust - 0.5) * 12 + track * 15;
      let g = 112 + base * 26 + grav * 14 + (dust - 0.5) * 10 + track * 12;
      let b = 72 + base * 18 + grav * 10 + (dust - 0.5) * 8 + track * 8;

      let hVal = 0.5 + base * 0.25 + grav * 0.15;
      let roughness = 230;

      // Embedded flat gravel pebble
      if (grav > 0.8) {
        r += 30;
        g += 28;
        b += 25;
        hVal += 0.2;
        roughness = 140;
      }

      // Micro cracks / dry fissures
      if (Math.abs(base - 0.48) < 0.03 && rand() > 0.6) {
        r -= 40; g -= 35; b -= 25;
        hVal -= 0.2;
      }

      if (isSide) {
        // Step down profile for path edge
        if (y < 6) {
          r *= 0.75; g *= 0.75; b *= 0.75;
          hVal *= 0.5;
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
      roughnessMap[idx] = roughness;
    }
  }

  return { rgba, heightMap, roughnessMap, w, h };
}

// -------------------------------------------------------------------
// 5. PHOTOREALISTIC WATER (Animation fluide 16 frames, reflets, transparence)
// -------------------------------------------------------------------
function generatePhotorealisticWaterFrame(w = 128, h = 128, frameIndex = 0, totalFrames = 16, isFlow = false) {
  const rgba = new Uint8Array(w * h * 4);
  const heightMap = new Float32Array(w * h);

  const phase = (frameIndex / totalFrames) * Math.PI * 2;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      const nx = (x / w) * Math.PI * 2;
      const ny = (y / h) * Math.PI * 2;

      const flowY = isFlow ? ((y + (frameIndex / totalFrames) * h) % h) / h * Math.PI * 2 : ny;

      // Harmonic multi-frequency waves
      const w1 = Math.sin(nx * 3 + phase) * Math.cos(flowY * 2.5 + phase * 0.9);
      const w2 = Math.sin((nx + flowY) * 3 - phase * 1.2) * 0.6;
      const w3 = Math.cos((nx * 5 - flowY * 4) + phase * 1.7) * 0.35;
      const w4 = Math.sin(nx * 8 + flowY * 7 + phase * 2.2) * 0.15;

      const waveH = (w1 + w2 + w3 + w4 + 2.1) / 4.2; // normalized [0, 1]

      // Caustic web pattern (sharp peak ridges)
      const caustic = Math.pow(Math.sin(nx * 4 + phase) * Math.sin(flowY * 4 - phase * 0.7) * 0.5 + 0.5, 3.5);

      // Deep, crystalline tropical azure water
      let r = Math.round(14 + waveH * 28 + caustic * 55);
      let g = Math.round(82 + waveH * 85 + caustic * 85);
      let b = Math.round(195 + waveH * 48 + caustic * 45);

      // Calibrated transparency (allows seeing underwater ground clearly without milkiness)
      const alpha = Math.round(168 + (1.0 - waveH) * 26);

      r = Math.min(255, Math.max(0, r));
      g = Math.min(255, Math.max(0, g));
      b = Math.min(255, Math.max(0, b));

      rgba[idx * 4 + 0] = r;
      rgba[idx * 4 + 1] = g;
      rgba[idx * 4 + 2] = b;
      rgba[idx * 4 + 3] = alpha;

      heightMap[idx] = waveH;
    }
  }

  return { rgba, heightMap, w, h };
}

function generatePhotorealisticWaterFlipbook(w = 128, h = 128, totalFrames = 16, isFlow = false) {
  const totalH = h * totalFrames;
  const stripRgba = new Uint8Array(w * totalH * 4);
  const firstFrame = generatePhotorealisticWaterFrame(w, h, 0, totalFrames, isFlow);

  for (let f = 0; f < totalFrames; f++) {
    const frame = (f === 0) ? firstFrame : generatePhotorealisticWaterFrame(w, h, f, totalFrames, isFlow);
    for (let y = 0; y < h; y++) {
      const srcOff = y * w * 4;
      const dstOff = (f * h + y) * w * 4;
      stripRgba.set(frame.rgba.subarray(srcOff, srcOff + w * 4), dstOff);
    }
  }

  return { stripRgba, firstFrame, w, totalH };
}

// -------------------------------------------------------------------
// 6. ASPHALT ROAD / ROUTE BITUMÉE (Pour concrete_black & concrete_gray)
// -------------------------------------------------------------------
function generateAsphaltRoad(w = 128, h = 128, withLine = true) {
  const rgba = new Uint8Array(w * h * 4);
  const heightMap = new Float32Array(w * h);
  const aggregateNoise = createFractalNoise(w, h, 3, 0.7, 4, 1234);
  const fineTar = createSeamlessNoise(w, h, 2, 5678);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      const agg = aggregateNoise[idx];
      const tar = fineTar[idx];

      // Charcoal dark bitumen with stone aggregate
      let gray = 46 + agg * 24 + (tar - 0.5) * 10;
      let r = gray;
      let g = gray;
      let b = gray + 2;

      // Quartz pebble fleck in asphalt
      if (agg > 0.82) {
        r += 32; g += 32; b += 32;
      }

      // Painted road marking line (central white stripe)
      if (withLine) {
        const isCenterLine = Math.abs(x - w / 2) < 4;
        const isStripe = isCenterLine && (y % 32 < 20); // dashed highway stripe
        if (isStripe) {
          r = 230 + (tar - 0.5) * 20;
          g = 230 + (tar - 0.5) * 20;
          b = 235 + (tar - 0.5) * 20;
        }
      }

      r = Math.min(255, Math.max(0, Math.round(r)));
      g = Math.min(255, Math.max(0, Math.round(g)));
      b = Math.min(255, Math.max(0, Math.round(b)));

      rgba[idx * 4 + 0] = r;
      rgba[idx * 4 + 1] = g;
      rgba[idx * 4 + 2] = b;
      rgba[idx * 4 + 3] = 255;

      heightMap[idx] = 0.5 + agg * 0.3;
    }
  }

  return { rgba, heightMap, w, h };
}

// -------------------------------------------------------------------
// 7. CHARPENTE & POUTRES DE STRUCTURE (Pour stripped_oak_log & stripped_spruce_log)
// -------------------------------------------------------------------
function generateTimberBeam(w = 128, h = 128, isTop = false) {
  const rgba = new Uint8Array(w * h * 4);
  const heightMap = new Float32Array(w * h);
  const grainNoise = createSeamlessNoise(w, h, 32, 4411);
  const fineGrain = createSeamlessNoise(w, h, 4, 5522);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;

      if (isTop) {
        // Squared end of timber beam with circular annual rings and edge bevel
        const cx = w / 2;
        const cy = h / 2;
        const dist = Math.sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy));
        const ring = Math.sin(dist * 0.7) * 0.5 + 0.5;
        const isEdge = (x < 3 || x >= w - 3 || y < 3 || y >= h - 3);

        let r = 168 + ring * 22;
        let g = 132 + ring * 16;
        let b = 88 + ring * 10;
        if (isEdge) { r *= 0.7; g *= 0.7; b *= 0.7; }

        rgba[idx * 4 + 0] = Math.round(r);
        rgba[idx * 4 + 1] = Math.round(g);
        rgba[idx * 4 + 2] = Math.round(b);
        rgba[idx * 4 + 3] = 255;
        heightMap[idx] = 0.5 + ring * 0.2;
      } else {
        // Longitudinal hand-hewn oak timber with drying checks and iron brace
        const grain = Math.sin((x * 0.12) + grainNoise[idx] * 4 + fineGrain[idx] * 2) * 0.5 + 0.5;
        let r = 175 + grain * 25;
        let g = 138 + grain * 18;
        let b = 92 + grain * 12;

        // Bevel at sides
        if (x < 3 || x >= w - 3) {
          r *= 0.65; g *= 0.65; b *= 0.65;
        }

        // Forged iron bracket strap near ends with rivets
        const isStrap = (y >= 14 && y <= 22) || (y >= h - 22 && y <= h - 14);
        if (isStrap) {
          r = 65; g = 65; b = 70;
          // Rivets
          if ((Math.abs(x - 24) <= 2 || Math.abs(x - (w - 24)) <= 2) && (y === 18 || y === h - 18)) {
            r = 110; g = 110; b = 115;
          }
        }

        rgba[idx * 4 + 0] = Math.min(255, Math.round(r));
        rgba[idx * 4 + 1] = Math.min(255, Math.round(g));
        rgba[idx * 4 + 2] = Math.min(255, Math.round(b));
        rgba[idx * 4 + 3] = 255;
        heightMap[idx] = isStrap ? 0.8 : (0.5 + grain * 0.2);
      }
    }
  }

  return { rgba, heightMap, w, h };
}

// -------------------------------------------------------------------
// 8. SMARTPHONE ITEM ("de la vraie vie" pour compass / recovery_compass)
// -------------------------------------------------------------------
function generateSmartphoneItem(w = 128, h = 128) {
  const rgba = new Uint8Array(w * h * 4);

  const phoneW = 54;
  const phoneH = 96;
  const x0 = Math.floor((w - phoneW) / 2);
  const y0 = Math.floor((h - phoneH) / 2);
  const x1 = x0 + phoneW;
  const y1 = y0 + phoneH;
  const cornerR = 8;

  function inRoundedRect(x, y, rx0, ry0, rx1, ry1, cr) {
    if (x < rx0 || x >= rx1 || y < ry0 || y >= ry1) return false;
    const dx = (x < rx0 + cr) ? (rx0 + cr - x) : (x >= rx1 - cr ? x - (rx1 - cr - 1) : 0);
    const dy = (y < ry0 + cr) ? (ry0 + cr - y) : (y >= ry1 - cr ? y - (ry1 - cr - 1) : 0);
    return (dx * dx + dy * dy) <= (cr * cr);
  }

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;

      if (!inRoundedRect(x, y, x0, y0, x1, y1, cornerR)) {
        rgba[idx * 4 + 3] = 0; // transparent cutout
        continue;
      }

      const isChassisBorder = !inRoundedRect(x, y, x0 + 2, y0 + 2, x1 - 2, y1 - 2, cornerR - 2);
      const isScreen = inRoundedRect(x, y, x0 + 4, y0 + 6, x1 - 4, y1 - 6, 4);

      if (isChassisBorder) {
        // Matte titanium metal edge with bevel highlight
        const light = (x - x0 < 2 || y - y0 < 2) ? 60 : -20;
        rgba[idx * 4 + 0] = 160 + light;
        rgba[idx * 4 + 1] = 165 + light;
        rgba[idx * 4 + 2] = 175 + light;
        rgba[idx * 4 + 3] = 255;
      } else if (isScreen) {
        // Active OLED display with dark futuristic gradient and lockscreen UI
        const sy = (y - (y0 + 6)) / (phoneH - 12);
        const sx = (x - (x0 + 4)) / (phoneW - 8);

        let r = 16 + sy * 32;
        let g = 20 + sy * 48;
        let b = 45 + sy * 85;

        // Punch-hole camera at top center
        const camX = x0 + Math.floor(phoneW / 2);
        const camY = y0 + 10;
        if ((x - camX) * (x - camX) + (y - camY) * (y - camY) <= 3) {
          r = 5; g = 5; b = 10;
        }

        // Digital clock text area
        if (y >= y0 + 24 && y <= y0 + 34 && Math.abs(x - camX) < 14) {
          r = 245; g = 250; b = 255;
        }

        // Colorful app icons grid
        if (y >= y0 + 48 && y <= y0 + 76) {
          const gridX = Math.floor(sx * 4);
          const gridY = Math.floor((sy - 0.45) * 8);
          const inIcon = (Math.abs(sx * 4 - gridX - 0.5) < 0.35) && (Math.abs((sy - 0.45) * 8 - gridY - 0.5) < 0.35);
          if (inIcon) {
            if ((gridX + gridY) % 3 === 0) { r = 240; g = 80; b = 70; }
            else if ((gridX + gridY) % 3 === 1) { r = 60; g = 170; b = 245; }
            else { r = 70; g = 215; b = 120; }
          }
        }

        // Glossy diagonal glass specular reflection
        const diag = Math.abs((x - x0) - (y - y0) * 0.7);
        if (diag > 10 && diag < 18) {
          r = Math.min(255, r + 75);
          g = Math.min(255, g + 85);
          b = Math.min(255, b + 110);
        }

        rgba[idx * 4 + 0] = r;
        rgba[idx * 4 + 1] = g;
        rgba[idx * 4 + 2] = b;
        rgba[idx * 4 + 3] = 255;
      } else {
        // Black glass bezel
        rgba[idx * 4 + 0] = 12;
        rgba[idx * 4 + 1] = 12;
        rgba[idx * 4 + 2] = 15;
        rgba[idx * 4 + 3] = 255;
      }
    }
  }

  return { rgba, w, h };
}

// -------------------------------------------------------------------
// 9. PINCEAU D'ARTISTE (Pour brush.png - Archéologie / Peinture)
// -------------------------------------------------------------------
function generatePaintbrushItem(w = 128, h = 128) {
  const rgba = new Uint8Array(w * h * 4);

  // Paintbrush diagonal from bottom-left (20, 108) to top-right (108, 20)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;

      // Project onto diagonal axis (t from 0 to 1) and perpendicular distance
      const diagT = ((x - 20) + (108 - y)) / 124.0;
      const perpDist = Math.abs((x - 20) - (108 - y)) / Math.sqrt(2);

      if (diagT < 0.05 || diagT > 0.98 || perpDist > 5.5) {
        rgba[idx * 4 + 3] = 0;
        continue;
      }

      if (diagT < 0.58) {
        // Varnished mahogany wooden handle
        const taperWidth = 2.5 + diagT * 2.5;
        if (perpDist > taperWidth) { rgba[idx * 4 + 3] = 0; continue; }
        const highlight = (perpDist < 1.0) ? 40 : -20;
        rgba[idx * 4 + 0] = Math.min(255, 140 + highlight);
        rgba[idx * 4 + 1] = Math.max(0, 72 + highlight);
        rgba[idx * 4 + 2] = Math.max(0, 35 + highlight * 0.5);
        rgba[idx * 4 + 3] = 255;
      } else if (diagT < 0.74) {
        // Polished nickel / brass metal ferrule
        if (perpDist > 4.8) { rgba[idx * 4 + 3] = 0; continue; }
        const spec = Math.abs(perpDist - 1.2) < 1.0 ? 80 : 0;
        rgba[idx * 4 + 0] = 210 + spec;
        rgba[idx * 4 + 1] = 205 + spec;
        rgba[idx * 4 + 2] = 195 + spec;
        rgba[idx * 4 + 3] = 255;
      } else {
        // Fine badger-hair bristles tipped with royal blue oil paint
        if (perpDist > (4.8 - (diagT - 0.74) * 12)) { rgba[idx * 4 + 3] = 0; continue; }
        if (diagT > 0.88) {
          // Cobalt blue paint tip
          rgba[idx * 4 + 0] = 25;
          rgba[idx * 4 + 1] = 105;
          rgba[idx * 4 + 2] = 225;
        } else {
          // Natural hair
          const hairGrit = Math.sin(perpDist * 8) * 20;
          rgba[idx * 4 + 0] = 190 + hairGrit;
          rgba[idx * 4 + 1] = 175 + hairGrit;
          rgba[idx * 4 + 2] = 150 + hairGrit;
        }
        rgba[idx * 4 + 3] = 255;
      }
    }
  }

  return { rgba, w, h };
}

// -------------------------------------------------------------------
// 10. NUAGES VAPOREUX NON CARRÉS (Pour textures/environment/clouds.png)
// -------------------------------------------------------------------
function generateSoftClouds(w = 256, h = 256) {
  const rgba = new Uint8Array(w * h * 4);
  const cloudNoise1 = createFractalNoise(w, h, 4, 0.55, 48, 1010);
  const cloudNoise2 = createFractalNoise(w, h, 3, 0.65, 16, 2020);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      const n1 = cloudNoise1[idx];
      const n2 = cloudNoise2[idx];
      const combined = n1 * 0.7 + n2 * 0.3;

      // Soft threshold with progressive alpha gradient (no harsh square edges)
      if (combined > 0.44) {
        const alphaFactor = Math.min(1.0, (combined - 0.44) / 0.28);
        const alpha = Math.round(alphaFactor * 220);

        // Soft cloud shading: white crests with subtle blue-gray ambient base
        const shade = combined * 35;
        rgba[idx * 4 + 0] = Math.min(255, Math.round(220 + shade));
        rgba[idx * 4 + 1] = Math.min(255, Math.round(225 + shade));
        rgba[idx * 4 + 2] = Math.min(255, Math.round(235 + shade * 0.7));
        rgba[idx * 4 + 3] = alpha;
      } else {
        rgba[idx * 4 + 0] = 0;
        rgba[idx * 4 + 1] = 0;
        rgba[idx * 4 + 2] = 0;
        rgba[idx * 4 + 3] = 0;
      }
    }
  }

  return { rgba, w, h };
}

// -------------------------------------------------------------------
// 11. TOILE DE PEINTURE / TABLEAU D'ARTISTE (Pour painting.png)
// -------------------------------------------------------------------
function generatePaintingItem(w = 128, h = 128) {
  const rgba = new Uint8Array(w * h * 4);
  const cx0 = 16, cy0 = 24, cx1 = 112, cy1 = 104;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      if (x < cx0 || x >= cx1 || y < cy0 || y >= cy1) {
        rgba[idx * 4 + 3] = 0;
        continue;
      }

      const isFrame = (x < cx0 + 5 || x >= cx1 - 5 || y < cy0 + 5 || y >= cy1 - 5);
      if (isFrame) {
        // Gilded dark walnut wooden frame
        const shade = (x - cx0 < 3 || y - cy0 < 3) ? 35 : -25;
        rgba[idx * 4 + 0] = Math.min(255, Math.max(0, 105 + shade));
        rgba[idx * 4 + 1] = Math.min(255, Math.max(0, 72 + shade));
        rgba[idx * 4 + 2] = Math.min(255, Math.max(0, 42 + shade * 0.5));
        rgba[idx * 4 + 3] = 255;
      } else {
        // Landscape painting: sunset sky, mountain peaks, pine valley
        const py = (y - cy0 - 5) / (cy1 - cy0 - 10);
        const px = (x - cx0 - 5) / (cx1 - cx0 - 10);

        let r = 240, g = 140, b = 60; // warm sunset sky
        if (py < 0.35) {
          r = Math.round(230 - py * 120);
          g = Math.round(110 + py * 70);
          b = Math.round(70 + py * 140);
        } else if (py < 0.65) {
          // Purple silhouette mountains
          const mountainH = 0.55 + Math.sin(px * Math.PI * 3.5) * 0.12;
          if (py > mountainH) {
            r = 65; g = 50; b = 85;
          }
        } else {
          // Deep evergreen forest valley with lake
          const inLake = (py > 0.82 && Math.abs(px - 0.5) < 0.32);
          if (inLake) {
            r = 35; g = 95; b = 140; // reflective water
          } else {
            r = 30 + Math.round(px * 25);
            g = 70 + Math.round(py * 25);
            b = 32;
          }
        }

        rgba[idx * 4 + 0] = r;
        rgba[idx * 4 + 1] = g;
        rgba[idx * 4 + 2] = b;
        rgba[idx * 4 + 3] = 255;
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
  generateDirtPath,
  generatePhotorealisticWaterFrame,
  generatePhotorealisticWaterFlipbook,
  generateAsphaltRoad,
  generateTimberBeam,
  generateSmartphoneItem,
  generatePaintbrushItem,
  generatePaintingItem,
  generateSoftClouds
};

