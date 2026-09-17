/**
 * ADDON GENERATORS - REALISM+ 8K (BEDROCK BEHAVIOR + RESOURCE ADDON)
 * Generates custom items, custom blocks, recipes, and models for the Behavior Pack (BP)
 * and links them with the Resource Pack (RP) into a unified .mcaddon archive.
 */

const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

function savePng(buffer, width, height, filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const png = new PNG({ width, height });
  png.data = Buffer.from(buffer);
  fs.writeFileSync(filePath, PNG.sync.write(png, { deflateLevel: 4 }));
}

// -------------------------------------------------------------------
// 1. TEXTURE: DÉPLOYEUR DE ROUTE PRÉFABRIQUÉE (128x128)
// -------------------------------------------------------------------
function generateRoadBuilderIcon(w = 128, h = 128) {
  const rgba = new Uint8Array(w * h * 4);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      // Centered tablet / deployment module with road cross-section
      const dx = x - 64;
      const dy = y - 64;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Outer safety hexagonal frame
      if (Math.abs(dx) > 52 || Math.abs(dy) > 52 || (Math.abs(dx) + Math.abs(dy) > 78)) {
        rgba[idx * 4 + 3] = 0;
        continue;
      }

      const isBorder = (Math.abs(dx) > 46 || Math.abs(dy) > 46 || (Math.abs(dx) + Math.abs(dy) > 72));
      if (isBorder) {
        // Yellow & Black Industrial Hazard Stripes
        const stripe = Math.floor((x + y) / 10) % 2 === 0;
        if (stripe) {
          rgba[idx * 4 + 0] = 245; // bright hazard yellow
          rgba[idx * 4 + 1] = 185;
          rgba[idx * 4 + 2] = 20;
        } else {
          rgba[idx * 4 + 0] = 28;  // matte black
          rgba[idx * 4 + 1] = 28;
          rgba[idx * 4 + 2] = 32;
        }
        rgba[idx * 4 + 3] = 255;
      } else {
        // High-tech holographic road blueprint
        // Dark metallic chassis
        let r = 24, g = 30, b = 42;

        // Central perspective highway strip receding into distance
        const normY = (y - 24) / 80;
        if (normY >= 0 && normY <= 1) {
          const roadHalfWidth = 8 + normY * 34;
          if (Math.abs(dx) <= roadHalfWidth) {
            // Asphalt surface
            const grain = ((x * 17 + y * 23) % 11) * 2;
            r = 38 + grain;
            g = 40 + grain;
            b = 44 + grain;

            // Center lane markings (dashed white stripes)
            if (Math.abs(dx) <= 2) {
              const dash = Math.floor(y / 10) % 2 === 0;
              if (dash) {
                r = 240; g = 242; b = 245;
              }
            }

            // Road borders (concrete curbs)
            if (Math.abs(dx) >= roadHalfWidth - 3) {
              r = 160; g = 165; b = 175;
            }
          }
        }

        // Blueprint grid glow
        if ((x % 8 === 0 || y % 8 === 0) && (r < 60)) {
          r = Math.min(255, r + 15);
          g = Math.min(255, g + 35);
          b = Math.min(255, b + 65);
        }

        // Holographic arrow
        if (Math.abs(dx) < 14 && y > 28 && y < 54) {
          const arrowW = (54 - y) * 0.5;
          if (Math.abs(dx) < arrowW) {
            r = 0; g = 220; b = 255; // glowing cyan arrow
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

// -------------------------------------------------------------------
// 2. TEXTURE: GÉNÉRATEUR DE PONT PRÉFABRIQUÉ (128x128)
// -------------------------------------------------------------------
function generateBridgeSpawnerIcon(w = 128, h = 128) {
  const rgba = new Uint8Array(w * h * 4);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      const dx = x - 64;
      const dy = y - 64;

      if (Math.abs(dx) > 52 || Math.abs(dy) > 52 || (Math.abs(dx) + Math.abs(dy) > 78)) {
        rgba[idx * 4 + 3] = 0;
        continue;
      }

      const isBorder = (Math.abs(dx) > 46 || Math.abs(dy) > 46 || (Math.abs(dx) + Math.abs(dy) > 72));
      if (isBorder) {
        // Forged Steel & Rivet Border
        const isRivet = ((x % 14 === 0) || (y % 14 === 0)) && (Math.abs(dx) > 48 || Math.abs(dy) > 48);
        if (isRivet) {
          rgba[idx * 4 + 0] = 210;
          rgba[idx * 4 + 1] = 215;
          rgba[idx * 4 + 2] = 225;
        } else {
          rgba[idx * 4 + 0] = 68;
          rgba[idx * 4 + 1] = 72;
          rgba[idx * 4 + 2] = 82;
        }
        rgba[idx * 4 + 3] = 255;
      } else {
        // Architectural bridge blueprint
        let r = 22, g = 28, b = 38;

        // River water at the bottom
        if (y > 90) {
          r = 20; g = 75; b = 130;
          if ((x + y) % 6 === 0) { r += 25; g += 45; b += 55; }
        }

        // Bridge pillars (2 vertical supports)
        if ((x >= 32 && x <= 42 && y >= 45 && y <= 95) || (x >= 86 && x <= 96 && y >= 45 && y <= 95)) {
          r = 135; g = 138; b = 145; // stone concrete pillars
          if (x === 32 || x === 42 || x === 86 || x === 96) { r = 80; g = 82; b = 90; }
        }

        // Suspension cable arch (catenary curve)
        const archY = 24 + Math.pow(dx / 46, 2) * 44;
        if (Math.abs(y - archY) <= 2) {
          r = 230; g = 170; b = 40; // golden steel suspension cable
        }

        // Vertical suspension hangers
        if (y > archY && y < 68 && x % 10 === 0) {
          r = 200; g = 195; b = 180;
        }

        // Bridge deck (timber deck + side truss)
        if (y >= 68 && y <= 76) {
          r = 145; g = 95; b = 50; // oak wood timber deck
          if (y === 68 || y === 76) { r = 45; g = 48; b = 55; } // steel safety railings
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
  savePng,
  generateRoadBuilderIcon,
  generateBridgeSpawnerIcon
};
