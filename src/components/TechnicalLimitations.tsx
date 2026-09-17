import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, AlertCircle, Copy, Check, Info } from 'lucide-react';

export function TechnicalLimitations() {
  const [copied, setCopied] = useState(false);

  const fullText = `===================================================================
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
- qualité identique sur tous les appareils : Diffère selon le SoC (Snapdragon, Dimensity, Exynos)`;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="technical-limitations-section" className="flex flex-col gap-6">
      {/* Intro Box */}
      <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-5 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Info className="w-5 h-5 text-amber-400" />
            <span>Spécifications & Honnêteté Technique Bedrock</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Documentation officielle des capacités effectives de REALISM+ 8K et des limites du moteur Bedrock Render Dragon.
          </p>
        </div>

        <button
          onClick={handleCopy}
          type="button"
          className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium px-3.5 py-2 rounded-lg border border-slate-700 transition-colors shrink-0"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-amber-400" />}
          <span>{copied ? 'Copié dans le presse-papier' : 'Copier la documentation'}</span>
        </button>
      </div>

      {/* 3 Categories: SUPPORTED, ENGINE DEPENDENT, NOT GUARANTEED */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* 1. SUPPORTED */}
        <div className="bg-slate-900/90 rounded-xl border border-emerald-500/30 p-5 flex flex-col gap-3 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>[SUPPORTED]</span>
            </span>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20 font-mono">
              Inclus & Actif
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Fonctionnalités réelles générées et directement exploitées par le pack dans Minecraft Bedrock :
          </p>

          <ul className="flex flex-col gap-2.5 text-xs text-slate-300">
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold">•</span>
              <div>
                <strong className="text-slate-100">Textures HD :</strong> 128×128 calibrées évitant les crashs VRAM
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold">•</span>
              <div>
                <strong className="text-slate-100">Textures animées :</strong> Eau animée 16 frames cycliques via flipbook_textures.json
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold">•</span>
              <div>
                <strong className="text-slate-100">PBR officiel :</strong> Normal maps (Sobel) et MER maps (Metalness/Emissive/Roughness)
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold">•</span>
              <div>
                <strong className="text-slate-100">Transparence alpha :</strong> Canal 8-bit fluide sur eau, verre et feuillage
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold">•</span>
              <div>
                <strong className="text-slate-100">Optimisation mobile :</strong> Budget VRAM &lt; 100 Mo sur Adreno et Mali
              </div>
            </li>
          </ul>
        </div>

        {/* 2. ENGINE DEPENDENT */}
        <div className="bg-slate-900/90 rounded-xl border border-amber-500/30 p-5 flex flex-col gap-3 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              <span>[ENGINE DEPENDENT]</span>
            </span>
            <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/20 font-mono">
              Dépendant Render Dragon
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Effets graphiques conditionnés par les shaders internes du moteur Bedrock et les modes expérimentaux :
          </p>

          <ul className="flex flex-col gap-2.5 text-xs text-slate-300">
            <li className="flex items-start gap-2">
              <span className="text-amber-400 font-bold">•</span>
              <div>
                <strong className="text-slate-100">Éclairage avancé :</strong> Requiert le mode Deferred Technical Preview
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 font-bold">•</span>
              <div>
                <strong className="text-slate-100">HDR :</strong> Pas de pipeline HDR matériel injecté par simple Resource Pack
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 font-bold">•</span>
              <div>
                <strong className="text-slate-100">Réflexions & Réfractions :</strong> SSR et réfraction d'eau gérées par le moteur
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 font-bold">•</span>
              <div>
                <strong className="text-slate-100">Ombres dynamiques :</strong> Calculées en temps réel selon les capacités du moteur
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 font-bold">•</span>
              <div>
                <strong className="text-slate-100">Motion Blur & Optical Flow :</strong> Non supportés nativement par les packs Bedrock
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 font-bold">•</span>
              <div>
                <strong className="text-slate-100">Effets volumétriques :</strong> Brouillard atmosphérique géré par le moteur hôte
              </div>
            </li>
          </ul>
        </div>

        {/* 3. NOT GUARANTEED */}
        <div className="bg-slate-900/90 rounded-xl border border-rose-500/30 p-5 flex flex-col gap-3 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" />
              <span>[NOT GUARANTEED]</span>
            </span>
            <span className="text-[10px] bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded-full border border-rose-500/20 font-mono">
              Non Garanti
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Variables physiques externes ne pouvant être garanties par un simple fichier de texture :
          </p>

          <ul className="flex flex-col gap-2.5 text-xs text-slate-300">
            <li className="flex items-start gap-2">
              <span className="text-rose-400 font-bold">•</span>
              <div>
                <strong className="text-slate-100">220 FPS :</strong> Repère visuel de fluidité ciblée, non une garantie contractuelle
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-400 font-bold">•</span>
              <div>
                <strong className="text-slate-100">Température du smartphone :</strong> Dépend de la dissipation thermique et du throttling
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-400 font-bold">•</span>
              <div>
                <strong className="text-slate-100">Charge GPU :</strong> Varie selon la résolution (FHD/QHD) et le nombre de chunks actifs
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-400 font-bold">•</span>
              <div>
                <strong className="text-slate-100">Stabilité universelle :</strong> Dépend des pilotes graphiques Vulkan/OpenGL du constructeur
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-400 font-bold">•</span>
              <div>
                <strong className="text-slate-100">Rendu identique :</strong> Diffère selon le processeur graphique (Snapdragon, Dimensity, Exynos)
              </div>
            </li>
          </ul>
        </div>
      </div>

      {/* Raw TXT Viewer */}
      <div className="bg-slate-950 rounded-xl border border-slate-800 p-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
          <span className="text-xs font-mono text-slate-400 font-semibold">README.txt • Extrait officiel du fichier inclus dans l'archive</span>
          <span className="text-[10px] font-mono text-emerald-400">Section 5 validée</span>
        </div>
        <pre className="text-xs font-mono text-slate-300 leading-relaxed overflow-x-auto whitespace-pre-wrap max-h-72">
          {fullText}
        </pre>
      </div>
    </div>
  );
}
