/**
 * REALISM+ 8K - BEDROCK ADDON BUILDER (.MCADDON)
 * Bundles the Resource Pack (RP) and the Behavior Pack (BP) together into a single .mcaddon file.
 * Automatically handles dependencies, custom items, custom blocks, geometry, and recipes.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const JSZip = require('jszip');
const { savePng, generateRoadBuilderIcon, generateBridgeSpawnerIcon } = require('./addon_generators.cjs');

const ROOT_DIR = process.cwd();
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');
const RP_SOURCE_DIR = path.join(PUBLIC_DIR, 'realism_pack');
const BUILD_TEMP_DIR = path.join(ROOT_DIR, 'build_addon');

async function buildAddon() {
  console.log('🚀 Starting REALISM+ 8K .MCADDON compilation (Behavior + Resource Pack)...');

  // Clean build temp folder
  if (fs.existsSync(BUILD_TEMP_DIR)) {
    fs.rmSync(BUILD_TEMP_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(BUILD_TEMP_DIR, { recursive: true });

  const rpDestDir = path.join(BUILD_TEMP_DIR, 'REALISM+_RP');
  const bpDestDir = path.join(BUILD_TEMP_DIR, 'REALISM+_BP');

  fs.mkdirSync(rpDestDir, { recursive: true });
  fs.mkdirSync(bpDestDir, { recursive: true });

  // 1. COPY RESOURCE PACK (RP) TO BUILD FOLDER
  console.log('📦 1/5 Copying and enriching Resource Pack (RP)...');
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

  copyRecursive(RP_SOURCE_DIR, rpDestDir);

  // Read RP Manifest to obtain its UUIDs
  const rpManifestPath = path.join(rpDestDir, 'manifest.json');
  let rpManifest;
  if (fs.existsSync(rpManifestPath)) {
    rpManifest = JSON.parse(fs.readFileSync(rpManifestPath, 'utf8'));
  } else {
    rpManifest = {
      format_version: 2,
      header: {
        name: "REALISM+ 8K (Ressources)",
        description: "Textures photoréalistes 128x/256x, PBR Render Dragon & eau animée 32-frames.",
        uuid: crypto.randomUUID(),
        version: [1, 0, 0],
        min_engine_version: [1, 20, 0]
      },
      modules: [
        {
          description: "REALISM+ 8K Resource Module",
          type: "resources",
          uuid: crypto.randomUUID(),
          version: [1, 0, 0]
        }
      ]
    };
    fs.writeFileSync(rpManifestPath, JSON.stringify(rpManifest, null, 2));
  }

  const rpHeaderUUID = rpManifest.header.uuid;

  // Add custom item textures to RP
  const itemsFolder = path.join(rpDestDir, 'textures', 'items');
  fs.mkdirSync(itemsFolder, { recursive: true });

  const roadBuilder = generateRoadBuilderIcon(128, 128);
  savePng(roadBuilder.rgba, 128, 128, path.join(itemsFolder, 'road_builder.png'));
  // Also copy to public realism_pack for web preview
  savePng(roadBuilder.rgba, 128, 128, path.join(RP_SOURCE_DIR, 'textures', 'items', 'road_builder.png'));

  const bridgeSpawner = generateBridgeSpawnerIcon(128, 128);
  savePng(bridgeSpawner.rgba, 128, 128, path.join(itemsFolder, 'bridge_spawner.png'));
  savePng(bridgeSpawner.rgba, 128, 128, path.join(RP_SOURCE_DIR, 'textures', 'items', 'bridge_spawner.png'));

  // Write item_texture.json in RP
  const itemTextureJson = {
    resource_pack_name: "realism_rp",
    texture_name: "atlas.items",
    texture_data: {
      "realism_smartphone": {
        textures: "textures/items/compass_item"
      },
      "realism_paintbrush": {
        textures: "textures/items/brush"
      },
      "realism_road_builder": {
        textures: "textures/items/road_builder"
      },
      "realism_bridge_spawner": {
        textures: "textures/items/bridge_spawner"
      }
    }
  };
  fs.writeFileSync(
    path.join(rpDestDir, 'textures', 'item_texture.json'),
    JSON.stringify(itemTextureJson, null, 2)
  );
  fs.writeFileSync(
    path.join(RP_SOURCE_DIR, 'textures', 'item_texture.json'),
    JSON.stringify(itemTextureJson, null, 2)
  );

  // Write terrain_texture.json in RP
  const terrainTextureJson = {
    resource_pack_name: "realism_rp",
    texture_name: "atlas.terrain",
    texture_data: {
      "realism_charpente": {
        textures: "textures/blocks/stripped_oak_log"
      },
      "realism_asphalt": {
        textures: "textures/blocks/concrete_black"
      },
      "realism_dirt_path": {
        textures: "textures/blocks/dirt_path_top"
      }
    }
  };
  fs.writeFileSync(
    path.join(rpDestDir, 'textures', 'terrain_texture.json'),
    JSON.stringify(terrainTextureJson, null, 2)
  );
  fs.writeFileSync(
    path.join(RP_SOURCE_DIR, 'textures', 'terrain_texture.json'),
    JSON.stringify(terrainTextureJson, null, 2)
  );

  // Write models/entity/slope.geo.json in RP (Real 45 degree continuous roof slope geometry)
  const modelsFolder = path.join(rpDestDir, 'models', 'entity');
  fs.mkdirSync(modelsFolder, { recursive: true });
  const slopeGeo = {
    format_version: "1.12.0",
    "minecraft:geometry": [
      {
        description: {
          identifier: "geometry.realism_slope",
          texture_width: 64,
          texture_height: 64,
          visible_bounds_width: 2,
          visible_bounds_height: 2,
          visible_bounds_offset: [0, 0.5, 0]
        },
        bones: [
          {
            name: "root",
            pivot: [0, 0, 0]
          },
          {
            name: "slope_wedge",
            parent: "root",
            pivot: [0, 0, 0],
            cubes: [
              { origin: [-8, 0, -8], size: [16, 4, 16], uv: [0, 0] },
              { origin: [-8, 4, -4], size: [16, 4, 12], uv: [0, 0] },
              { origin: [-8, 8, 0], size: [16, 4, 8], uv: [0, 0] },
              { origin: [-8, 12, 4], size: [16, 4, 4], uv: [0, 0] }
            ]
          }
        ]
      }
    ]
  };
  fs.writeFileSync(path.join(modelsFolder, 'slope.geo.json'), JSON.stringify(slopeGeo, null, 2));

  // Write RP texts (en_US and fr_FR)
  const rpTextsFolder = path.join(rpDestDir, 'texts');
  fs.mkdirSync(rpTextsFolder, { recursive: true });
  const rpLangFR = `pack.name=REALISM+ 8K (Ressources)
pack.description=Textures HD 128x photoréalistes, PBR Render Dragon & eau animée 32 frames.
item.realism:smartphone.name=Smartphone OLED Haute Fidélité
item.realism:paintbrush.name=Pinceau d'Artiste Peintre
item.realism:road_builder.name=Déployeur de Route Asphaltée Préfabriquée
item.realism:bridge_spawner.name=Générateur de Pont Préfabriqué
tile.realism:slope_roof.name=Pente de Toiture Lisse (Charpente)
tile.realism:asphalt_road.name=Route Bitumée Haute Vitesse
tile.realism:charpente_beam.name=Poutre de Charpente Rivetée
`;
  fs.writeFileSync(path.join(rpTextsFolder, 'fr_FR.lang'), rpLangFR);
  fs.writeFileSync(path.join(rpTextsFolder, 'en_US.lang'), rpLangFR);

  // 2. GENERATE BEHAVIOR PACK (BP)
  console.log('⚙️ 2/5 Generating Behavior Pack (BP) components...');

  const bpHeaderUUID = crypto.randomUUID();
  const bpModuleUUID = crypto.randomUUID();

  // BP manifest.json with strict dependency on RP Header UUID
  const bpManifest = {
    format_version: 2,
    header: {
      name: "REALISM+ 8K (Comportement & Mods)",
      description: "Objets réels (Smartphone, Pinceau, Déployeurs de route & pont) et Blocs modernes (Pentes de toit, Routes bitumées).",
      uuid: bpHeaderUUID,
      version: [1, 0, 0],
      min_engine_version: [1, 20, 0]
    },
    modules: [
      {
        description: "REALISM+ 8K Behavior Data Module",
        type: "data",
        uuid: bpModuleUUID,
        version: [1, 0, 0]
      }
    ],
    dependencies: [
      {
        uuid: rpHeaderUUID,
        version: [1, 0, 0]
      }
    ]
  };
  fs.writeFileSync(path.join(bpDestDir, 'manifest.json'), JSON.stringify(bpManifest, null, 2));

  // Copy pack icon to BP
  if (fs.existsSync(path.join(rpDestDir, 'pack_icon.png'))) {
    fs.copyFileSync(path.join(rpDestDir, 'pack_icon.png'), path.join(bpDestDir, 'pack_icon.png'));
  }

  // BP ITEMS
  const bpItemsDir = path.join(bpDestDir, 'items');
  fs.mkdirSync(bpItemsDir, { recursive: true });

  // 1. Smartphone Item
  const smartphoneItem = {
    format_version: "1.20.10",
    "minecraft:item": {
      description: {
        identifier: "realism:smartphone",
        menu_category: {
          category: "equipment",
          group: "itemGroup.name.misc"
        }
      },
      components: {
        "minecraft:icon": {
          texture: "realism_smartphone"
        },
        "minecraft:display_name": {
          value: "Smartphone OLED Haute Fidélité"
        },
        "minecraft:max_stack_size": 1,
        "minecraft:hand_equipped": true,
        "minecraft:use_duration": 32,
        "minecraft:use_animation": "camera",
        "minecraft:cooldown": {
          category: "smartphone_screen",
          duration: 1.0
        }
      }
    }
  };
  fs.writeFileSync(path.join(bpItemsDir, 'realism_smartphone.json'), JSON.stringify(smartphoneItem, null, 2));

  // 2. Paintbrush Item
  const paintbrushItem = {
    format_version: "1.20.10",
    "minecraft:item": {
      description: {
        identifier: "realism:paintbrush",
        menu_category: {
          category: "items"
        }
      },
      components: {
        "minecraft:icon": {
          texture: "realism_paintbrush"
        },
        "minecraft:display_name": {
          value: "Pinceau d'Artiste & Peinture"
        },
        "minecraft:max_stack_size": 16,
        "minecraft:hand_equipped": true,
        "minecraft:can_destroy_in_creative": false
      }
    }
  };
  fs.writeFileSync(path.join(bpItemsDir, 'realism_paintbrush.json'), JSON.stringify(paintbrushItem, null, 2));

  // 3. Road Builder Item (Prefab long road deployer)
  const roadBuilderItem = {
    format_version: "1.20.10",
    "minecraft:item": {
      description: {
        identifier: "realism:road_builder",
        menu_category: {
          category: "construction"
        }
      },
      components: {
        "minecraft:icon": {
          texture: "realism_road_builder"
        },
        "minecraft:display_name": {
          value: "Déployeur de Route Asphaltée Préfabriquée"
        },
        "minecraft:max_stack_size": 64,
        "minecraft:glint": true
      }
    }
  };
  fs.writeFileSync(path.join(bpItemsDir, 'realism_road_builder.json'), JSON.stringify(roadBuilderItem, null, 2));

  // 4. Bridge Spawner Item (Prefab suspension bridge)
  const bridgeSpawnerItem = {
    format_version: "1.20.10",
    "minecraft:item": {
      description: {
        identifier: "realism:bridge_spawner",
        menu_category: {
          category: "construction"
        }
      },
      components: {
        "minecraft:icon": {
          texture: "realism_bridge_spawner"
        },
        "minecraft:display_name": {
          value: "Générateur de Pont Préfabriqué"
        },
        "minecraft:max_stack_size": 16,
        "minecraft:glint": true
      }
    }
  };
  fs.writeFileSync(path.join(bpItemsDir, 'realism_bridge_spawner.json'), JSON.stringify(bridgeSpawnerItem, null, 2));

  // BP BLOCKS
  const bpBlocksDir = path.join(bpDestDir, 'blocks');
  fs.mkdirSync(bpBlocksDir, { recursive: true });

  // 1. Slope Roof Block (Pente 45° pour casser le côté trop carré de Minecraft)
  const slopeBlock = {
    format_version: "1.20.10",
    "minecraft:block": {
      description: {
        identifier: "realism:slope_roof",
        menu_category: {
          category: "construction"
        }
      },
      components: {
        "minecraft:destructible_by_mining": {
          seconds_to_destroy: 1.5
        },
        "minecraft:friction": 0.4,
        "minecraft:geometry": "geometry.realism_slope",
        "minecraft:material_instances": {
          "*": {
            texture: "realism_charpente",
            render_method: "opaque"
          }
        },
        "minecraft:collision_box": {
          origin: [-8, 0, -8],
          size: [16, 16, 16]
        },
        "minecraft:selection_box": {
          origin: [-8, 0, -8],
          size: [16, 16, 16]
        }
      }
    }
  };
  fs.writeFileSync(path.join(bpBlocksDir, 'realism_slope_roof.json'), JSON.stringify(slopeBlock, null, 2));

  // 2. Asphalt Road Block (Route bitumée avec friction réduite pour vitesse accélérée)
  const asphaltBlock = {
    format_version: "1.20.10",
    "minecraft:block": {
      description: {
        identifier: "realism:asphalt_road",
        menu_category: {
          category: "construction"
        }
      },
      components: {
        "minecraft:destructible_by_mining": {
          seconds_to_destroy: 2.0
        },
        "minecraft:friction": 0.15, // Vitesse de déplacement accrue sur route
        "minecraft:material_instances": {
          "*": {
            texture: "realism_asphalt",
            render_method: "opaque"
          }
        }
      }
    }
  };
  fs.writeFileSync(path.join(bpBlocksDir, 'realism_asphalt_road.json'), JSON.stringify(asphaltBlock, null, 2));

  // 3. Charpente Beam Block (Poutre massive en bois équarri pour toitures et charpentes)
  const beamBlock = {
    format_version: "1.20.10",
    "minecraft:block": {
      description: {
        identifier: "realism:charpente_beam",
        menu_category: {
          category: "construction"
        }
      },
      components: {
        "minecraft:destructible_by_mining": {
          seconds_to_destroy: 1.5
        },
        "minecraft:material_instances": {
          "*": {
            texture: "realism_charpente",
            render_method: "opaque"
          }
        }
      }
    }
  };
  fs.writeFileSync(path.join(bpBlocksDir, 'realism_charpente_beam.json'), JSON.stringify(beamBlock, null, 2));

  // BP RECIPES
  const bpRecipesDir = path.join(bpDestDir, 'recipes');
  fs.mkdirSync(bpRecipesDir, { recursive: true });

  // Recipe 1: Smartphone
  const smartphoneRecipe = {
    format_version: "1.20.10",
    "minecraft:recipe_shaped": {
      description: { identifier: "realism:smartphone_recipe" },
      tags: ["crafting_table"],
      pattern: [
        " I ",
        "RGR",
        " I "
      ],
      key: {
        "I": { item: "minecraft:iron_ingot" },
        "G": { item: "minecraft:glass_pane" },
        "R": { item: "minecraft:redstone" }
      },
      result: { item: "realism:smartphone", count: 1 }
    }
  };
  fs.writeFileSync(path.join(bpRecipesDir, 'smartphone.recipe.json'), JSON.stringify(smartphoneRecipe, null, 2));

  // Recipe 2: Paintbrush
  const paintbrushRecipe = {
    format_version: "1.20.10",
    "minecraft:recipe_shaped": {
      description: { identifier: "realism:paintbrush_recipe" },
      tags: ["crafting_table"],
      pattern: [
        " F ",
        " I ",
        " S "
      ],
      key: {
        "F": { item: "minecraft:feather" },
        "I": { item: "minecraft:iron_nugget" },
        "S": { item: "minecraft:stick" }
      },
      result: { item: "realism:paintbrush", count: 1 }
    }
  };
  fs.writeFileSync(path.join(bpRecipesDir, 'paintbrush.recipe.json'), JSON.stringify(paintbrushRecipe, null, 2));

  // Recipe 3: Asphalt Road Block
  const asphaltRecipe = {
    format_version: "1.20.10",
    "minecraft:recipe_shaped": {
      description: { identifier: "realism:asphalt_recipe" },
      tags: ["crafting_table"],
      pattern: [
        "GCG",
        "CDC",
        "GCG"
      ],
      key: {
        "G": { item: "minecraft:gravel" },
        "C": { item: "minecraft:cobblestone" },
        "D": { item: "minecraft:coal" }
      },
      result: { item: "realism:asphalt_road", count: 8 }
    }
  };
  fs.writeFileSync(path.join(bpRecipesDir, 'asphalt_road.recipe.json'), JSON.stringify(asphaltRecipe, null, 2));

  // Recipe 4: Road Builder Item
  const roadBuilderRecipe = {
    format_version: "1.20.10",
    "minecraft:recipe_shaped": {
      description: { identifier: "realism:road_builder_recipe" },
      tags: ["crafting_table"],
      pattern: [
        "RRR",
        "RAR",
        "RRR"
      ],
      key: {
        "R": { item: "minecraft:redstone" },
        "A": { item: "realism:asphalt_road" }
      },
      result: { item: "realism:road_builder", count: 4 }
    }
  };
  fs.writeFileSync(path.join(bpRecipesDir, 'road_builder.recipe.json'), JSON.stringify(roadBuilderRecipe, null, 2));

  // Recipe 5: Bridge Spawner Item
  const bridgeSpawnerRecipe = {
    format_version: "1.20.10",
    "minecraft:recipe_shaped": {
      description: { identifier: "realism:bridge_spawner_recipe" },
      tags: ["crafting_table"],
      pattern: [
        "SIS",
        "PPP",
        "SIS"
      ],
      key: {
        "S": { item: "minecraft:string" },
        "I": { item: "minecraft:iron_ingot" },
        "P": { item: "minecraft:oak_planks" }
      },
      result: { item: "realism:bridge_spawner", count: 2 }
    }
  };
  fs.writeFileSync(path.join(bpRecipesDir, 'bridge_spawner.recipe.json'), JSON.stringify(bridgeSpawnerRecipe, null, 2));

  // Recipe 6: Slope Roof Block
  const slopeRecipe = {
    format_version: "1.20.10",
    "minecraft:recipe_shaped": {
      description: { identifier: "realism:slope_recipe" },
      tags: ["crafting_table"],
      pattern: [
        "  P",
        " PP",
        "PPP"
      ],
      key: {
        "P": { item: "minecraft:oak_planks" }
      },
      result: { item: "realism:slope_roof", count: 6 }
    }
  };
  fs.writeFileSync(path.join(bpRecipesDir, 'slope_roof.recipe.json'), JSON.stringify(slopeRecipe, null, 2));

  // BP texts
  const bpTextsFolder = path.join(bpDestDir, 'texts');
  fs.mkdirSync(bpTextsFolder, { recursive: true });
  fs.writeFileSync(path.join(bpTextsFolder, 'fr_FR.lang'), rpLangFR);
  fs.writeFileSync(path.join(bpTextsFolder, 'en_US.lang'), rpLangFR);

  // README for BP
  const bpReadme = `===================================================================
REALISM+ 8K — PACK DE COMPORTEMENT & MODS (BEHAVIOR PACK)
===================================================================
Ce pack ajoute les fonctionnalités avancées et objets réels :
- realism:smartphone : Smartphone tactile OLED
- realism:paintbrush : Pinceau d'artiste
- realism:road_builder : Kit de route asphaltée préfabriquée
- realism:bridge_spawner : Kit de pont suspendu préfabriqué
- realism:slope_roof : Pente de toit non cubique 45°
- realism:asphalt_road : Bloc de route bitumée haute vitesse
- realism:charpente_beam : Poutre de charpente en bois massif
`;
  fs.writeFileSync(path.join(bpDestDir, 'README.txt'), bpReadme);

  // 3. CREATE THE UNIFIED .MCADDON ARCHIVE (Contains REALISM+_RP and REALISM+_BP)
  console.log('📦 3/5 Packaging .MCADDON archive (combining Resource & Behavior packs in one file)...');
  const addonZip = new JSZip();

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
        zipFolder.file(item, fileData);
      }
    }
  }

  // Bedrock standard: embed REALISM+_RP and REALISM+_BP as subfolders inside the .mcaddon archive
  const rpZipFolder = addonZip.folder('REALISM+_RP');
  addFolderToZip(rpDestDir, rpZipFolder);

  const bpZipFolder = addonZip.folder('REALISM+_BP');
  addFolderToZip(bpDestDir, bpZipFolder);

  // Also include a root README.txt for users opening as ZIP
  const rootReadme = `===================================================================
REALISM+ 8K — PACK COMPLET (.MCADDON) : RESSOURCES + COMPORTEMENT
===================================================================
Ce fichier unifié installe simultanément en un seul clic :
1. REALISM+_RP : Le pack de textures 128x photoréalistes, PBR Render Dragon & eau animée
2. REALISM+_BP : Le pack de comportement ajoutant les objets réels (Smartphone, Pinceau,
   Routes bitumées, Ponts préfabriqués, Pentes lisses de toiture).

INSTALLATION AUTOMATIQUE SUR ANDROID :
1. Touchez ce fichier "REALISM+_8K_v1.0.mcaddon".
2. Ouvrez avec Minecraft.
3. Minecraft importe automatiquement les 2 packs d'un coup !
4. Dans les paramètres de votre monde : activez le pack de comportement (le pack de ressources
   s'active automatiquement en dépendance).
===================================================================
`;
  addonZip.file('README_ADDON.txt', rootReadme);

  console.log('⏳ Compressing Addon archive with Deflate Level 6...');
  const addonBuffer = await addonZip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
    platform: 'UNIX'
  });

  const slmAddonPath = path.join(PUBLIC_DIR, 'slm_visual_pack-real.mcaddon');
  fs.writeFileSync(slmAddonPath, addonBuffer);

  const mcaddonPath = path.join(PUBLIC_DIR, 'REALISM+_8K_v1.0.mcaddon');
  fs.writeFileSync(mcaddonPath, addonBuffer);

  // Save the full combined BP+RP addon as a distinct zip so it never corrupts or collides with the visual resource pack zip
  const slmAddonZipPath = path.join(PUBLIC_DIR, 'slm_addon_complet.zip');
  fs.writeFileSync(slmAddonZipPath, addonBuffer);

  const legacyZipPath = path.join(PUBLIC_DIR, 'REALISM+_8K_v1.0.zip');
  fs.writeFileSync(legacyZipPath, addonBuffer);

  const addonSizeMB = (addonBuffer.length / (1024 * 1024)).toFixed(2);
  console.log(`✅ UNIFIED .MCADDON CREATED SUCCESSFULLY!`);
  console.log(`- Path: ${slmAddonPath}`);
  console.log(`- Legacy: ${mcaddonPath}`);
  console.log(`- Size: ${addonSizeMB} MB`);
  console.log(`- Size: ${addonSizeMB} MB`);
  console.log(`- Contains: REALISM+_RP (${rpHeaderUUID}) & REALISM+_BP (${bpHeaderUUID})`);
}

buildAddon().catch(err => {
  console.error('Addon build failed:', err);
  process.exit(1);
});
