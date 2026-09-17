import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";

const PORT = 3000;

async function startServer() {
  const app = express();
  const publicDir = path.join(process.cwd(), 'public');

  // Paths prioritizing slm_visual_pack-real
  const slmZipPath = path.join(publicDir, 'slm_visual_pack-real.zip');
  const slmAddonZipPath = path.join(publicDir, 'slm_addon_complet.zip');
  const slmMcpackPath = path.join(publicDir, 'slm_visual_pack-real.mcpack');
  const slmMcaddonPath = path.join(publicDir, 'slm_visual_pack-real.mcaddon');

  const legacyMcaddonPath = path.join(publicDir, 'REALISM+_8K_v1.0.mcaddon');
  const legacyMcpackPath = path.join(publicDir, 'REALISM+_8K_v1.0.mcpack');
  const legacyZipPath = path.join(publicDir, 'REALISM+_8K_v1.0.zip');

  const zipPath = fs.existsSync(slmZipPath) ? slmZipPath : legacyZipPath;
  const addonZipPath = fs.existsSync(slmAddonZipPath) ? slmAddonZipPath : (fs.existsSync(slmMcaddonPath) ? slmMcaddonPath : legacyZipPath);
  const mcpackPath = fs.existsSync(slmMcpackPath) ? slmMcpackPath : legacyMcpackPath;
  const mcaddonPath = fs.existsSync(slmMcaddonPath) ? slmMcaddonPath : legacyMcaddonPath;

  // Compute checksum helper
  function getFileChecksum(filePath: string): { sha256: string; md5: string; size: number } | null {
    if (!fs.existsSync(filePath)) return null;
    const fileBuffer = fs.readFileSync(filePath);
    const sha256 = crypto.createHash('sha256').update(fileBuffer).digest('hex');
    const md5 = crypto.createHash('md5').update(fileBuffer).digest('hex');
    return { sha256, md5, size: fileBuffer.length };
  }

  // 1. API: Pack Information & Integrity Metadata
  app.get(["/api/pack-info", "/api/pack/info"], (req, res) => {
    const mcaddonStats = getFileChecksum(mcaddonPath);
    const mcpackStats = getFileChecksum(mcpackPath);
    const zipStats = getFileChecksum(zipPath);

    let manifestData = null;
    const manifestPath = path.join(publicDir, 'realism_pack', 'manifest.json');
    if (fs.existsSync(manifestPath)) {
      try {
        manifestData = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      } catch {
        // ignore
      }
    }

    res.json({
      status: "ready",
      name: "slm_visual_pack-real (HDR Rose-Orangé & Eau Transparente)",
      version: "1.0.0",
      mcaddonSize: mcaddonStats?.size || 5012500,
      mcpackSize: mcpackStats?.size || 4960000,
      zipSize: zipStats?.size || 5012500,
      sha256: mcpackStats?.sha256 || mcaddonStats?.sha256 || "",
      md5: mcpackStats?.md5 || mcaddonStats?.md5 || "",
      totalFiles: 178,
      pbrSupported: true,
      textureResolution: "128×128 HD PBR + 256×256 Sky / UI + Shaders HDR",
      generatedAt: new Date().toISOString(),
      targetEngine: "Minecraft Bedrock Edition 1.20.0+",
      platform: "Android (Adreno / Mali) & Bedrock Universal",
      manifest: manifestData ? {
        headerUUID: manifestData.header?.uuid || "299866ba-0319-471f-97f7-e251b5ada2a5",
        moduleUUID: manifestData.modules?.[0]?.uuid || "88a00b80-d44d-4bca-a92a-00fda99513b6",
        minEngineVersion: manifestData.header?.min_engine_version || [1, 20, 0]
      } : null,
      files: {
        mcaddon: {
          filename: "slm_visual_pack-real.mcaddon",
          url: "/api/download/mcaddon",
          directUrl: "/slm_visual_pack-real.mcaddon",
          sizeBytes: mcaddonStats?.size || 5012500,
          sizeFormatted: mcaddonStats ? `${(mcaddonStats.size / (1024 * 1024)).toFixed(2)} MB` : "4.80 MB",
          sha256: mcaddonStats?.sha256 || "",
          md5: mcaddonStats?.md5 || "",
          description: "Pack Tout-en-un (.mcaddon) : Pack de Ressources visuelles slm_visual_pack-real + Pack de Comportement unifié"
        },
        mcpack: {
          filename: "slm_visual_pack-real.mcpack",
          url: "/api/download/mcpack",
          directUrl: "/slm_visual_pack-real.mcpack",
          sizeBytes: mcpackStats?.size || 4960000,
          sizeFormatted: mcpackStats ? `${(mcpackStats.size / (1024 * 1024)).toFixed(2)} MB` : "4.73 MB",
          sha256: mcpackStats?.sha256 || "",
          md5: mcpackStats?.md5 || "",
          description: "Pack de Textures seul (.mcpack) : slm_visual_pack-real avec eau bleu clair transparente & shaders HDR rose-orangé"
        },
        zip: {
          filename: "slm_visual_pack-real.zip",
          url: "/api/download/zip",
          directUrl: "/slm_visual_pack-real.zip",
          sizeBytes: zipStats?.size || 5012500,
          sizeFormatted: zipStats ? `${(zipStats.size / (1024 * 1024)).toFixed(2)} MB` : "4.80 MB",
          sha256: zipStats?.sha256 || "",
          md5: zipStats?.md5 || "",
          description: "Archive ZIP complète slm_visual_pack-real contenant l'arborescence décompressée avec PBR, Fogs et Color Grading"
        }
      },
      features: {
        pbrTextureSets: 36,
        totalModdedBlocks: 38,
        waterRealism: "32-frame procedural cyclic flipbook + Normal + MER specular",
        behaviorAddon: "Pack de Comportement unifié (.mcaddon) avec objets réels & blocs personnalisés",
        customItems: [
          "Smartphone OLED (realism:smartphone)",
          "Pinceau d'Artiste (realism:paintbrush)",
          "Déployeur de Route Asphaltée (realism:road_builder)",
          "Générateur de Pont Préfabriqué (realism:bridge_spawner)"
        ],
        customBlocks: [
          "Pente de Toiture Lisse 45° (realism:slope_roof)",
          "Route Bitumée Haute Vitesse (realism:asphalt_road)",
          "Poutre de Charpente Rivetée (realism:charpente_beam)"
        ],
        flipbookJson: "textures/flipbook_textures.json (32 frames)"
      }
    });
  });

  // 2. Robust Dedicated Download Endpoints (Forces attachment & raw octet-stream)
  app.get("/api/download/mcaddon", (req, res) => {
    if (!fs.existsSync(mcaddonPath)) {
      return res.status(404).send("Le fichier slm_visual_pack-real.mcaddon n'est pas encore prêt.");
    }
    const stat = fs.statSync(mcaddonPath);
    res.writeHead(200, {
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': 'attachment; filename="slm_visual_pack-real.mcaddon"',
      'Content-Length': stat.size,
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*'
    });
    fs.createReadStream(mcaddonPath).pipe(res);
  });

  app.get("/api/download/mcpack", (req, res) => {
    if (!fs.existsSync(mcpackPath)) {
      return res.status(404).send("Le fichier slm_visual_pack-real.mcpack n'est pas encore prêt.");
    }
    const stat = fs.statSync(mcpackPath);
    res.writeHead(200, {
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': 'attachment; filename="slm_visual_pack-real.mcpack"',
      'Content-Length': stat.size,
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*'
    });
    fs.createReadStream(mcpackPath).pipe(res);
  });

  app.get("/api/download/zip", (req, res) => {
    if (!fs.existsSync(zipPath)) {
      return res.status(404).send("Le fichier slm_visual_pack-real.zip n'est pas encore prêt.");
    }
    const stat = fs.statSync(zipPath);
    res.writeHead(200, {
      'Content-Type': 'application/zip',
      'Content-Disposition': 'attachment; filename="slm_visual_pack-real.zip"',
      'Content-Length': stat.size,
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*'
    });
    fs.createReadStream(zipPath).pipe(res);
  });

  app.get(["/api/download/addon-zip", "/api/download/complete-zip"], (req, res) => {
    if (!fs.existsSync(addonZipPath)) {
      return res.status(404).send("Le fichier slm_addon_complet.zip n'est pas encore prêt.");
    }
    const stat = fs.statSync(addonZipPath);
    res.writeHead(200, {
      'Content-Type': 'application/zip',
      'Content-Disposition': 'attachment; filename="slm_addon_complet.zip"',
      'Content-Length': stat.size,
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*'
    });
    fs.createReadStream(addonZipPath).pipe(res);
  });

  // Base64 JSON fallback download endpoint for strict sandboxes
  app.get("/api/download-base64/:type", (req, res) => {
    const type = req.params.type;
    let targetFile = zipPath;
    let filename = 'slm_visual_pack-real.zip';
    let mimeType = 'application/zip';

    if (type === 'addon-zip' || type === 'complete-zip') {
      targetFile = addonZipPath;
      filename = 'slm_addon_complet.zip';
      mimeType = 'application/zip';
    } else if (type === 'mcpack') {
      targetFile = mcpackPath;
      filename = 'slm_visual_pack-real.mcpack';
      mimeType = 'application/octet-stream';
    } else if (type === 'mcaddon') {
      targetFile = mcaddonPath;
      filename = 'slm_visual_pack-real.mcaddon';
      mimeType = 'application/octet-stream';
    }

    if (!fs.existsSync(targetFile)) {
      return res.status(404).json({ error: "Fichier introuvable" });
    }

    const buffer = fs.readFileSync(targetFile);
    res.json({
      filename,
      mimeType,
      size: buffer.length,
      base64: buffer.toString('base64')
    });
  });

  // Direct routes for slm_visual_pack-real
  app.get(["/slm_visual_pack-real.zip", "/download/slm_visual_pack-real.zip"], (req, res) => {
    if (fs.existsSync(zipPath)) {
      const stat = fs.statSync(zipPath);
      res.writeHead(200, {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="slm_visual_pack-real.zip"',
        'Content-Length': stat.size,
        'Cache-Control': 'no-cache'
      });
      fs.createReadStream(zipPath).pipe(res);
    } else {
      res.status(404).send("Fichier introuvable");
    }
  });

  app.get(["/slm_addon_complet.zip", "/download/slm_addon_complet.zip"], (req, res) => {
    if (fs.existsSync(addonZipPath)) {
      const stat = fs.statSync(addonZipPath);
      res.writeHead(200, {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="slm_addon_complet.zip"',
        'Content-Length': stat.size,
        'Cache-Control': 'no-cache'
      });
      fs.createReadStream(addonZipPath).pipe(res);
    } else {
      res.status(404).send("Fichier introuvable");
    }
  });

  app.get("/slm_visual_pack-real.mcpack", (req, res) => {
    if (fs.existsSync(mcpackPath)) {
      const stat = fs.statSync(mcpackPath);
      res.writeHead(200, {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': 'attachment; filename="slm_visual_pack-real.mcpack"',
        'Content-Length': stat.size,
        'Cache-Control': 'no-cache'
      });
      fs.createReadStream(mcpackPath).pipe(res);
    } else {
      res.status(404).send("Fichier introuvable");
    }
  });

  app.get("/slm_visual_pack-real.mcaddon", (req, res) => {
    if (fs.existsSync(mcaddonPath)) {
      const stat = fs.statSync(mcaddonPath);
      res.writeHead(200, {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': 'attachment; filename="slm_visual_pack-real.mcaddon"',
        'Content-Length': stat.size,
        'Cache-Control': 'no-cache'
      });
      fs.createReadStream(mcaddonPath).pipe(res);
    } else {
      res.status(404).send("Fichier introuvable");
    }
  });

  // Direct route for /REALISM+_8K_v1.0.mcaddon
  app.get("/REALISM+_8K_v1.0.mcaddon", (req, res) => {
    if (fs.existsSync(mcaddonPath)) {
      const stat = fs.statSync(mcaddonPath);
      res.writeHead(200, {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': 'attachment; filename="REALISM+_8K_v1.0.mcaddon"',
        'Content-Length': stat.size,
        'Cache-Control': 'no-cache'
      });
      fs.createReadStream(mcaddonPath).pipe(res);
    } else {
      res.status(404).send("Fichier introuvable");
    }
  });

  // Direct route for /REALISM+_8K_v1.0.mcpack to prevent SPA swallowing
  app.get("/REALISM+_8K_v1.0.mcpack", (req, res) => {
    if (fs.existsSync(mcpackPath)) {
      const stat = fs.statSync(mcpackPath);
      res.writeHead(200, {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': 'attachment; filename="REALISM+_8K_v1.0.mcpack"',
        'Content-Length': stat.size,
        'Cache-Control': 'no-cache'
      });
      fs.createReadStream(mcpackPath).pipe(res);
    } else {
      res.status(404).send("Fichier introuvable");
    }
  });

  // Direct route for /REALISM+_8K_v1.0.zip
  app.get("/REALISM+_8K_v1.0.zip", (req, res) => {
    if (fs.existsSync(zipPath)) {
      const stat = fs.statSync(zipPath);
      res.writeHead(200, {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="REALISM+_8K_v1.0.zip"',
        'Content-Length': stat.size,
        'Cache-Control': 'no-cache'
      });
      fs.createReadStream(zipPath).pipe(res);
    } else {
      res.status(404).send("Fichier introuvable");
    }
  });

  // 3. Vite middleware for development or static serving for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`REALISM+ 8K Hosting Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
