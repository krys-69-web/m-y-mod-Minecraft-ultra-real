import React, { useState } from 'react';
import { BlockData } from '../types';
import { Download, Eye, Layers, FileCode, ZoomIn, ZoomOut, Check, Info } from 'lucide-react';

interface TextureInspectorProps {
  block: BlockData;
}

export const TextureInspector: React.FC<TextureInspectorProps> = ({ block }) => {
  const [activeMap, setActiveMap] = useState<'diffuse' | 'normal' | 'mer' | 'textureset'>('diffuse');
  const [zoomLevel, setZoomLevel] = useState<number>(2);
  const [showGrid, setShowGrid] = useState<boolean>(false);
  const [copiedJson, setCopiedJson] = useState(false);

  const getActiveImageUrl = () => {
    switch (activeMap) {
      case 'normal':
        return block.textures.normal || block.textures.diffuse;
      case 'mer':
        return block.textures.mer || block.textures.diffuse;
      default:
        return block.textures.diffuse;
    }
  };

  const getTextureSetJson = () => {
    return JSON.stringify(
      {
        format_version: "1.16.100",
        "minecraft:texture_set": {
          color: block.id,
          normal: block.hasNormal ? `${block.id}_normal` : undefined,
          metalness_emissive_roughness: block.hasMER ? `${block.id}_mer` : undefined
        }
      },
      null,
      2
    );
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(getTextureSetJson());
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  return (
    <div id="texture-inspector" className="bg-slate-900/90 rounded-xl border border-slate-800 p-4 sm:p-5 flex flex-col gap-4 shadow-xl">
      {/* Header with Title and Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <span>{block.name}</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700">
              {block.resolution}
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">{block.description}</p>
        </div>

        {/* Map Type Switcher */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            id="tab-map-diffuse"
            onClick={() => setActiveMap('diffuse')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeMap === 'diffuse'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            type="button"
          >
            Albedo (Couleur)
          </button>

          {block.hasNormal && (
            <button
              id="tab-map-normal"
              onClick={() => setActiveMap('normal')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1 ${
                activeMap === 'normal'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              type="button"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Normal Map</span>
            </button>
          )}

          {block.hasMER && (
            <button
              id="tab-map-mer"
              onClick={() => setActiveMap('mer')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeMap === 'mer'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              type="button"
            >
              MER (Rugosité/PBR)
            </button>
          )}

          {block.hasTextureSet && (
            <button
              id="tab-map-json"
              onClick={() => setActiveMap('textureset')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1 ${
                activeMap === 'textureset'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              type="button"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Texture Set JSON</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Canvas / Preview Stage */}
      {activeMap !== 'textureset' ? (
        <div className="flex flex-col lg:flex-row gap-5 items-center">
          {/* Zoomable Image Stage */}
          <div className="relative w-full sm:w-[320px] h-[320px] bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-center overflow-hidden checkerboard-bg">
            <div
              className="relative transition-transform duration-150 ease-out"
              style={{
                transform: `scale(${zoomLevel})`,
                imageRendering: 'pixelated'
              }}
            >
              <img
                src={getActiveImageUrl()}
                alt={`${block.name} - ${activeMap}`}
                className="w-32 h-32 object-contain select-none pointer-events-none"
                style={{ imageRendering: 'pixelated' }}
                loading="eager"
              />
              {showGrid && (
                <div
                  className="absolute inset-0 pointer-events-none border border-amber-500/20"
                  style={{
                    backgroundImage: 'linear-gradient(to right, rgba(251, 191, 36, 0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(251, 191, 36, 0.15) 1px, transparent 1px)',
                    backgroundSize: '8px 8px'
                  }}
                />
              )}
            </div>

            {/* Floating Zoom & Grid Overlay Controls */}
            <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-slate-900/90 backdrop-blur-sm p-1 rounded-md border border-slate-700/60 shadow">
              <button
                id="btn-zoom-out"
                onClick={() => setZoomLevel(Math.max(1, zoomLevel - 1))}
                className="p-1 text-slate-400 hover:text-slate-100 transition-colors"
                title="Dézoomer"
                type="button"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono text-amber-400 px-1">{zoomLevel}x</span>
              <button
                id="btn-zoom-in"
                onClick={() => setZoomLevel(Math.min(4, zoomLevel + 1))}
                className="p-1 text-slate-400 hover:text-slate-100 transition-colors"
                title="Zoomer"
                type="button"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <div className="w-[1px] h-3 bg-slate-700 mx-0.5"></div>
              <button
                id="btn-toggle-grid"
                onClick={() => setShowGrid(!showGrid)}
                className={`px-1.5 py-0.5 text-[10px] rounded font-mono ${
                  showGrid ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Grille de pixels"
                type="button"
              >
                Grille
              </button>
            </div>
          </div>

          {/* Technical Layer Information */}
          <div className="flex-1 w-full flex flex-col gap-3">
            {activeMap === 'diffuse' && (
              <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800 text-xs text-slate-300 flex flex-col gap-2">
                <div className="font-semibold text-amber-400 flex items-center gap-1.5">
                  <Info className="w-4 h-4" />
                  <span>Couche Albedo (Couleur & Matière Organique)</span>
                </div>
                <p className="leading-relaxed">
                  Texture générée en 128×128 pixels (16 384 pixels par face) avec palette chromatique chaude
                  adaptée au style Minecraft Bedrock. Les variations de grain évitent le phénomène de damier
                  lorsque le bloc est répété sur des dizaines de mètres.
                </p>
                <div className="grid grid-cols-2 gap-2 mt-1 text-[11px] text-slate-400">
                  <div className="bg-slate-900 p-2 rounded border border-slate-800">
                    <span className="text-slate-500 block">Format</span>
                    <span className="text-slate-200 font-mono">PNG 24-bit sRGB</span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded border border-slate-800">
                    <span className="text-slate-500 block">Résolution</span>
                    <span className="text-slate-200 font-mono">{block.resolution}</span>
                  </div>
                </div>
              </div>
            )}

            {activeMap === 'normal' && (
              <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800 text-xs text-slate-300 flex flex-col gap-2">
                <div className="font-semibold text-indigo-400 flex items-center gap-1.5">
                  <Layers className="w-4 h-4" />
                  <span>Carte de Normales (Tangent-Space Sobel Normal Map)</span>
                </div>
                <p className="leading-relaxed">
                  Cette carte encode les micro-déviations de surface en espace tangentiel.
                  Elle est interprétée directement par le moteur Render Dragon sous Bedrock
                  pour simuler un relief saisissant sous la lumière du soleil sans surcoût géométrique.
                </p>
                <div className="grid grid-cols-3 gap-2 mt-1 text-[11px] text-slate-400 font-mono">
                  <div className="bg-slate-900 p-1.5 rounded border border-slate-800 text-center">
                    <span className="text-red-400 block font-bold">R : Axe X</span>
                    <span className="text-[10px]">Relief horizontal</span>
                  </div>
                  <div className="bg-slate-900 p-1.5 rounded border border-slate-800 text-center">
                    <span className="text-green-400 block font-bold">G : Axe Y</span>
                    <span className="text-[10px]">DirectX / Bedrock</span>
                  </div>
                  <div className="bg-slate-900 p-1.5 rounded border border-slate-800 text-center">
                    <span className="text-blue-400 block font-bold">B : Axe Z</span>
                    <span className="text-[10px]">Normale sortante</span>
                  </div>
                </div>
              </div>
            )}

            {activeMap === 'mer' && (
              <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800 text-xs text-slate-300 flex flex-col gap-2">
                <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
                  <Layers className="w-4 h-4" />
                  <span>Carte MER (Metalness / Emissive / Roughness)</span>
                </div>
                <p className="leading-relaxed">
                  Standard officiel Mojang Bedrock pour le rendu physique (PBR).
                  Chaque canal RGB pilote un paramètre de réponse lumineuse :
                </p>
                <div className="grid grid-cols-3 gap-2 mt-1 text-[11px] text-slate-400 font-mono">
                  <div className="bg-slate-900 p-1.5 rounded border border-slate-800 text-center">
                    <span className="text-red-400 block font-bold">R : Métallique</span>
                    <span className="text-[10px]">0 = Diélectrique</span>
                  </div>
                  <div className="bg-slate-900 p-1.5 rounded border border-slate-800 text-center">
                    <span className="text-green-400 block font-bold">G : Émissivité</span>
                    <span className="text-[10px]">0 = Inerte</span>
                  </div>
                  <div className="bg-slate-900 p-1.5 rounded border border-slate-800 text-center">
                    <span className="text-blue-400 block font-bold">B : Rugosité</span>
                    <span className="text-[10px]">200-245 = Mat</span>
                  </div>
                </div>
              </div>
            )}

            {/* Direct Download of Currently Inspected Texture */}
            <div className="flex items-center gap-2 mt-1">
              <a
                href={getActiveImageUrl()}
                download={`${block.id}_${activeMap}.png`}
                className="inline-flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-lg border border-slate-700 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span>Télécharger cette texture PNG ({block.id}_{activeMap}.png)</span>
              </a>
            </div>
          </div>
        </div>
      ) : (
        /* Bedrock Texture Set JSON Viewer */
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono">
              textures/blocks/{block.id}.texture_set.json
            </span>
            <button
              onClick={handleCopyJson}
              className="text-xs flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              type="button"
            >
              {copiedJson ? <Check className="w-3.5 h-3.5 text-green-400" /> : <FileCode className="w-3.5 h-3.5 text-amber-400" />}
              <span>{copiedJson ? 'Copié !' : 'Copier JSON'}</span>
            </button>
          </div>
          <pre className="bg-slate-950 p-4 rounded-lg border border-slate-800 font-mono text-xs text-amber-300/90 overflow-x-auto">
            {getTextureSetJson()}
          </pre>
          <p className="text-[11px] text-slate-500">
            Ce fichier est lu automatiquement par le moteur Render Dragon pour lier la texture diffuse, la carte de relief normal et la rugosité PBR.
          </p>
        </div>
      )}
    </div>
  );
};
