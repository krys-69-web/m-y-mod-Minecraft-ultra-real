import React, { useState } from 'react';
import { PACK_METADATA } from '../data/packData';
import { Folder, FileText, Image, FileCode, Check, Copy, HardDrive, ShieldCheck } from 'lucide-react';

export const FileBrowser: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<string>('manifest.json');
  const [copied, setCopied] = useState(false);

  const manifestJson = JSON.stringify(
    {
      format_version: 2,
      header: {
        name: "REALISM+ 8K",
        description: "Texture Pack Ultra-Fidélité 128x/256x optimisé Android avec PBR Texture Sets & Lumière Golden Hour. Par Bedrock Specialist.",
        uuid: PACK_METADATA.headerUUID,
        version: [1, 0, 0],
        min_engine_version: [1, 20, 0]
      },
      modules: [
        {
          description: "REALISM+ 8K Resource Pack Bedrock Edition",
          type: "resources",
          uuid: PACK_METADATA.moduleUUID,
          version: [1, 0, 0]
        }
      ],
      metadata: {
        authors: ["Specialized Bedrock Developer"],
        license: "Custom Free Use",
        url: "https://minecraft.net"
      }
    },
    null,
    2
  );

  const readmeText = `===================================================================
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
- Textures spéciales / Items : 128x128 avec découpes alpha chirurgicales
- Pack Icon : 512x512 HD
- Ratio d'optimisation : Consommation VRAM maîtrisée sous les 120 Mo
  permettant d'éviter les crashs Out-Of-Memory (OOM) sur smartphones Android
  (4 Go, 6 Go et 8 Go de RAM).

[3] ARCHITECTURE DES FICHIERS INCLUS
-------------------------------------------------------------------
REALISM+ 8K/
├── manifest.json                  [Manifeste Bedrock v2 avec UUIDs distincts]
├── pack_icon.png                  [Logo officiel 512x512 haute définition]
├── README.txt                     [Documentation technique & guide d'installation]
└── textures/
    ├── blocks/
    │   ├── dirt.png + normal + mer + texture_set.json
    │   ├── grass_top.png + grass_side.png + normal + mer
    │   ├── stone.png + cobblestone.png + sand.png + deepslate.png
    │   ├── log_oak.png + planks_oak.png + leaves_oak.png
    │   └── glass.png + water_still.png + brick.png + gravel.png
    ├── items/
    │   ├── diamond_sword.png + iron_pickaxe.png + apple.png + book_normal.png
    ├── environment/
    │   ├── sun.png + moon_phases.png + clouds.png
    └── ui/
        ├── cross_hair.png + crosshair.png + heart.png

[4] SPÉCIFICATION PBR (RENDER DRAGON & DEFERRED TECHNICAL PREVIEW)
-------------------------------------------------------------------
Ce pack intègre les véritables fichiers "*.texture_set.json" officiels
compatibles avec le moteur Render Dragon de Bedrock.
- Canal Normal Map : Tangent space Sobel dérivé du micro-relief
- Canal MER (Metalness - Emissive - Roughness) :
    * Rouge (R) : Métallicité (0 pour les roches/terres, 255 pour métaux)
    * Vert (G)  : Émissivité (0 pour blocs inertes, lueur pour sources)
    * Bleu (B)  : Rugosité (20-40 pour verre poli, 200-245 pour terre/roche)

[5] REALISM+ 8K — TECHNICAL LIMITATIONS
-------------------------------------------------------------------
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
- qualité identique sur tous les appareils : Diffère selon le SoC (Snapdragon, Dimensity, Exynos)`;

  const filesList = [
    { name: 'manifest.json', type: 'code', size: '774 B', path: 'manifest.json' },
    { name: 'pack_icon.png', type: 'image', size: '103.8 KB', path: 'pack_icon.png' },
    { name: 'README.txt', type: 'text', size: '5.4 KB', path: 'README.txt' },
    { name: 'textures/flipbook_textures.json', type: 'code', size: '420 B', path: 'textures/flipbook_textures.json' },
    { name: 'textures/blocks/dirt.png', type: 'image', size: '18.8 KB', path: 'textures/blocks/dirt.png' },
    { name: 'textures/blocks/dirt.texture_set.json', type: 'code', size: '165 B', path: 'textures/blocks/dirt.texture_set.json' },
    { name: 'textures/blocks/stone.png', type: 'image', size: '28.5 KB', path: 'textures/blocks/stone.png' },
    { name: 'textures/blocks/stone_normal.png', type: 'image', size: '42.8 KB', path: 'textures/blocks/stone_normal.png' },
    { name: 'textures/blocks/stone_mer.png', type: 'image', size: '14.2 KB', path: 'textures/blocks/stone_mer.png' },
    { name: 'textures/blocks/stone.texture_set.json', type: 'code', size: '175 B', path: 'textures/blocks/stone.texture_set.json' },
    { name: 'textures/blocks/iron_ore.png', type: 'image', size: '26.4 KB', path: 'textures/blocks/iron_ore.png' },
    { name: 'textures/blocks/iron_ore_normal.png', type: 'image', size: '38.2 KB', path: 'textures/blocks/iron_ore_normal.png' },
    { name: 'textures/blocks/iron_ore_mer.png', type: 'image', size: '16.8 KB', path: 'textures/blocks/iron_ore_mer.png' },
    { name: 'textures/blocks/iron_ore.texture_set.json', type: 'code', size: '185 B', path: 'textures/blocks/iron_ore.texture_set.json' },
    { name: 'textures/blocks/water_still.png (16-Frames)', type: 'image', size: '245.5 KB', path: 'textures/blocks/water_still.png' },
    { name: 'textures/blocks/water_flow.png (16-Frames)', type: 'image', size: '248.1 KB', path: 'textures/blocks/water_flow.png' },
    { name: 'textures/blocks/water_still.texture_set.json', type: 'code', size: '190 B', path: 'textures/blocks/water_still.texture_set.json' },
    { name: 'textures/blocks/grass_block_top.png', type: 'image', size: '25.7 KB', path: 'textures/blocks/grass_block_top.png' },
    { name: 'textures/blocks/grass_block_side.png', type: 'image', size: '21.8 KB', path: 'textures/blocks/grass_block_side.png' },
    { name: 'textures/blocks/cobblestone.png', type: 'image', size: '27.6 KB', path: 'textures/blocks/cobblestone.png' },
    { name: 'textures/blocks/sand.png', type: 'image', size: '22.9 KB', path: 'textures/blocks/sand.png' },
    { name: 'textures/blocks/log_oak.png', type: 'image', size: '15.9 KB', path: 'textures/blocks/log_oak.png' },
    { name: 'textures/blocks/log_oak_top.png', type: 'image', size: '20.8 KB', path: 'textures/blocks/log_oak_top.png' },
    { name: 'textures/blocks/planks_oak.png', type: 'image', size: '13.3 KB', path: 'textures/blocks/planks_oak.png' },
    { name: 'textures/blocks/leaves_oak.png', type: 'image', size: '27.6 KB', path: 'textures/blocks/leaves_oak.png' },
    { name: 'textures/blocks/glass.png', type: 'image', size: '2.7 KB', path: 'textures/blocks/glass.png' },
    { name: 'textures/blocks/brick.png', type: 'image', size: '17.2 KB', path: 'textures/blocks/brick.png' },
    { name: 'textures/blocks/deepslate.png', type: 'image', size: '17.7 KB', path: 'textures/blocks/deepslate.png' },
    { name: 'textures/blocks/gravel.png', type: 'image', size: '23.0 KB', path: 'textures/blocks/gravel.png' },
    { name: 'textures/items/diamond_sword.png', type: 'image', size: '3.6 KB', path: 'textures/items/diamond_sword.png' },
    { name: 'textures/items/iron_pickaxe.png', type: 'image', size: '2.8 KB', path: 'textures/items/iron_pickaxe.png' },
    { name: 'textures/items/apple.png', type: 'image', size: '1.9 KB', path: 'textures/items/apple.png' },
    { name: 'textures/environment/sun.png', type: 'image', size: '11.2 KB', path: 'textures/environment/sun.png' },
    { name: 'textures/ui/cross_hair.png', type: 'image', size: '172 B', path: 'textures/ui/cross_hair.png' },
  ];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="file-browser" className="bg-slate-900/90 rounded-xl border border-slate-800 p-4 sm:p-5 flex flex-col gap-4 shadow-xl">
      {/* Overview Statistics Header */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
          <span className="text-slate-500 text-xs block">Format Pack</span>
          <span className="text-amber-400 font-mono text-sm font-semibold">Bedrock v2</span>
        </div>
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
          <span className="text-slate-500 text-xs block">Total Fichiers</span>
          <span className="text-slate-200 font-mono text-sm font-semibold">{PACK_METADATA.fileCount} fichiers</span>
        </div>
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
          <span className="text-slate-500 text-xs block">Taille de l'Archive</span>
          <span className="text-slate-200 font-mono text-sm font-semibold">{PACK_METADATA.packSizeKB} KB</span>
        </div>
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
          <span className="text-slate-500 text-xs block">Validation UUID</span>
          <span className="text-green-400 font-mono text-sm font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> 2 UUIDs v4
          </span>
        </div>
      </div>

      {/* Explorer layout: Left file tree list, Right preview */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* File Tree Column */}
        <div className="md:col-span-5 bg-slate-950 rounded-lg border border-slate-800 p-2 flex flex-col gap-1 max-h-[480px] overflow-y-auto">
          <div className="text-[11px] font-semibold text-slate-400 px-2 py-1 flex items-center gap-1.5 border-b border-slate-800">
            <Folder className="w-3.5 h-3.5 text-amber-400" />
            <span>REALISM+ 8K / (Arborescence du Pack)</span>
          </div>

          {filesList.map((file) => (
            <button
              key={file.path}
              id={`file-item-${file.path.replace(/[/.]/g, '-')}`}
              onClick={() => setSelectedFile(file.path)}
              className={`text-left px-2.5 py-1.5 rounded-md text-xs font-mono flex items-center justify-between transition-colors ${
                selectedFile === file.path
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
              type="button"
            >
              <div className="flex items-center gap-2 truncate">
                {file.type === 'code' && <FileCode className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
                {file.type === 'image' && <Image className="w-3.5 h-3.5 text-purple-400 shrink-0" />}
                {file.type === 'text' && <FileText className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                <span className="truncate">{file.name}</span>
              </div>
              <span className="text-[10px] text-slate-500 ml-2 shrink-0">{file.size}</span>
            </button>
          ))}
        </div>

        {/* Right Preview Column */}
        <div className="md:col-span-7 bg-slate-950 rounded-lg border border-slate-800 p-4 flex flex-col gap-3 min-h-[380px] max-h-[480px] overflow-y-auto">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-mono text-slate-300 font-semibold">{selectedFile}</span>

            {(selectedFile === 'manifest.json' || selectedFile === 'README.txt') && (
              <button
                onClick={() => handleCopy(selectedFile === 'manifest.json' ? manifestJson : readmeText)}
                className="text-xs flex items-center gap-1 text-slate-400 hover:text-slate-200 px-2 py-1 rounded bg-slate-900 border border-slate-800 transition-colors"
                type="button"
              >
                {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 text-amber-400" />}
                <span>{copied ? 'Copié' : 'Copier'}</span>
              </button>
            )}
          </div>

          {selectedFile === 'manifest.json' && (
            <pre className="text-xs font-mono text-amber-300/90 leading-relaxed overflow-x-auto">
              {manifestJson}
            </pre>
          )}

          {selectedFile === 'README.txt' && (
            <pre className="text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap">
              {readmeText}
            </pre>
          )}

          {selectedFile.endsWith('.png') && (
            <div className="flex flex-col items-center justify-center gap-4 py-8">
              <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 shadow-inner">
                <img
                  src={`/realism_pack/${selectedFile}`}
                  alt={selectedFile}
                  className="max-w-[240px] max-h-[240px] object-contain"
                  style={{ imageRendering: 'pixelated' }}
                />
              </div>
              <div className="text-center">
                <span className="text-xs text-slate-400 block font-mono">
                  Chemin : REALISM+ 8K/{selectedFile}
                </span>
                <a
                  href={`/realism_pack/${selectedFile}`}
                  download={selectedFile.split('/').pop()}
                  className="inline-flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 underline mt-2"
                >
                  Télécharger le PNG direct
                </a>
              </div>
            </div>
          )}

          {selectedFile.endsWith('.json') && selectedFile !== 'manifest.json' && (
            <pre className="text-xs font-mono text-blue-300/90 leading-relaxed">
              {JSON.stringify(
                {
                  format_version: "1.16.100",
                  "minecraft:texture_set": {
                    color: selectedFile.replace('textures/blocks/', '').replace('.texture_set.json', ''),
                    normal: `${selectedFile.replace('textures/blocks/', '').replace('.texture_set.json', '')}_normal`,
                    metalness_emissive_roughness: `${selectedFile.replace('textures/blocks/', '').replace('.texture_set.json', '')}_mer`
                  }
                },
                null,
                2
              )}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
};
