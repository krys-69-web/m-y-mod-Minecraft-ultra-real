import React, { useState } from 'react';
import { 
  Boxes, 
  Download, 
  Sparkles, 
  Layers, 
  Smartphone, 
  Paintbrush, 
  Milestone, 
  Footprints, 
  CheckCircle2, 
  Check, 
  Copy, 
  ExternalLink,
  Hammer,
  HelpCircle,
  Zap,
  ShieldCheck,
  Compass,
  Archive
} from 'lucide-react';
import { ADDON_FEATURES } from '../data/packData';
import { AddonFeature } from '../types';
import { triggerDirectDownload, downloadViaBlob, downloadViaBase64 } from '../utils/downloader';

export function AddonHub() {
  const [selectedFeature, setSelectedFeature] = useState<AddonFeature>(ADDON_FEATURES[0]);
  const [downloading, setDownloading] = useState(false);
  const [copiedUUID, setCopiedUUID] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const handleDownloadAddon = async (method: 'direct' | 'blob' | 'base64' = 'direct') => {
    setDownloading(true);
    try {
      if (method === 'direct') {
        triggerDirectDownload('mcaddon');
      } else if (method === 'blob') {
        await downloadViaBlob('mcaddon');
      } else {
        await downloadViaBase64('mcaddon');
      }
      setSuccessToast('Téléchargement du pack unifié slm_visual_pack-real.mcaddon lancé !');
      setTimeout(() => setSuccessToast(null), 5000);
    } catch (err: any) {
      console.error(err);
    } finally {
      setTimeout(() => setDownloading(false), 1200);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUUID(true);
    setTimeout(() => setCopiedUUID(false), 2000);
  };

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Toast */}
      {successToast && (
        <div className="bg-emerald-500 text-slate-950 font-semibold px-4 py-2.5 rounded-xl shadow-xl flex items-center justify-between gap-3 text-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{successToast}</span>
          </div>
          <button 
            onClick={() => setSuccessToast(null)} 
            className="text-slate-950/70 hover:text-slate-950 font-bold px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Hero Header: Unified .MCADDON Banner */}
      <section className="relative overflow-hidden rounded-2xl border border-amber-500/40 bg-gradient-to-br from-slate-900 via-slate-900/90 to-amber-950/30 p-6 sm:p-8 shadow-2xl">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold mb-3">
              <Boxes className="w-4 h-4 text-amber-400" />
              <span>Format Bedrock Officiel : Pack Tout-en-un (.mcaddon)</span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
              Mod Réaliste & Pack de Comportement
            </h2>
            
            <p className="text-slate-300 text-sm sm:text-base mt-2 leading-relaxed">
              Le fichier <strong className="text-amber-400 font-mono">slm_visual_pack-real.mcaddon</strong> réunit 
              dans <span className="underline decoration-amber-400/60 underline-offset-4 font-semibold text-white">une seule archive</span> le 
              <strong> Pack de Ressources (RP)</strong> (eau bleu clair limpide, shaders HDR rose-orangé) et le <strong>Pack de Comportement (BP)</strong>. 
              Il débloque les vrais objets du quotidien, les pentes de toiture lisses, les routes bitumées et les ponts préfabriqués impossibles à intégrer dans un simple resource pack.
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-4 text-xs text-slate-400">
              <span className="flex items-center gap-1 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Double Importation Instantanée (RP + BP)
              </span>
              <span className="flex items-center gap-1 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700">
                <Layers className="w-3.5 h-3.5 text-blue-400" />
                Liaison UUID Automatique
              </span>
              <span className="flex items-center gap-1 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                1-Clic sur Android & Windows
              </span>
            </div>
          </div>

          {/* Action Download Box */}
          <div className="w-full lg:w-auto shrink-0 flex flex-col gap-3 bg-slate-950/70 p-5 rounded-xl border border-slate-800 backdrop-blur-sm">
            <div className="text-center sm:text-left">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
                Fichier recommandé pour jouer
              </span>
              <div className="text-base font-bold text-white font-mono mt-0.5">
                slm_visual_pack-real.mcaddon
              </div>
              <div className="text-xs text-amber-400 font-medium">
                Poids : 4.80 Mo • Version 1.0.0
              </div>
            </div>

            <a
              id="download-addon-zip-btn"
              href="/slm_addon_complet.zip"
              download="slm_addon_complet.zip"
              className="w-full inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:brightness-110 text-slate-950 font-extrabold px-6 py-3.5 rounded-xl text-sm shadow-xl shadow-amber-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer text-center"
            >
              <Archive className="w-5 h-5 text-slate-950" />
              <span>Télécharger au Format .ZIP (Sans Corruption)</span>
            </a>

            <button
              id="download-addon-primary-btn"
              onClick={() => handleDownloadAddon('direct')}
              disabled={downloading}
              className="w-full inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs border border-slate-700 transition-all cursor-pointer"
              type="button"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>{downloading ? 'Téléchargement...' : 'Option .MCADDON (1-Clic)'}</span>
            </button>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
              <a 
                href="/slm_addon_complet.zip"
                download="slm_addon_complet.zip"
                className="hover:text-amber-300 flex items-center gap-1 transition-colors"
              >
                <span>Lien Direct .ZIP</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <button
                onClick={() => handleDownloadAddon('blob')}
                className="hover:text-amber-300 underline cursor-pointer"
              >
                Secours Blob
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Grid: What makes the Behavior Pack unique? */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Smartphone className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white">Vrais Objets Fonctionnels</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Pas une simple texture d'un autre bloc. Le pack de comportement déclare de vrais items autonomes avec leurs propres identifiants (<code className="text-amber-300">realism:smartphone</code>, <code className="text-amber-300">realism:paintbrush</code>).
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white">Pentes Non-Carrées & Géométrie 3D</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Intégration du modèle géométrique personnalisé <code className="text-blue-300">geometry.realism_slope</code> pour créer des toitures douces à 45° qui cassent la rigidité des cubes Minecraft.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Milestone className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white">Infrastructures Préfabriquées</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Déployeurs de routes bitumées et ponts suspendus complets dans l'inventaire pour bâtir instantanément des voies de communication photoréalistes.
          </p>
        </div>
      </section>

      {/* Interactive Showcase & Crafting Recipes */}
      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Hammer className="w-5 h-5 text-amber-400" />
              <span>Catalogue des Objets & Blocs du Mod</span>
            </h3>
            <p className="text-xs text-slate-400">
              Sélectionnez un élément pour consulter ses spécifications, propriétés physiques et sa recette dans l'établi.
            </p>
          </div>
          <span className="text-xs font-mono text-amber-400/90 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
            {ADDON_FEATURES.length} Éléments Dédiés Inclus
          </span>
        </div>

        {/* Feature Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {ADDON_FEATURES.map((item) => {
            const isSelected = selectedFeature.id === item.id;
            return (
              <button
                key={item.id}
                id={`addon-item-${item.id}`}
                onClick={() => setSelectedFeature(item)}
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all text-center cursor-pointer ${
                  isSelected 
                    ? 'bg-amber-500/20 border-amber-500/60 text-white shadow-lg shadow-amber-500/10 scale-[1.03]' 
                    : 'bg-slate-900/70 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                }`}
                type="button"
              >
                <div className="w-12 h-12 rounded-lg bg-slate-950 p-1.5 border border-slate-800 shadow-inner flex items-center justify-center overflow-hidden">
                  <img
                    src={item.icon}
                    alt={item.name}
                    className="w-full h-full object-contain pixelated"
                    loading="lazy"
                  />
                </div>
                <div className="text-xs font-bold leading-tight line-clamp-2">
                  {item.name}
                </div>
                <span className={`text-[9px] uppercase font-mono px-1.5 py-0.5 rounded ${
                  item.type === 'item' ? 'bg-blue-500/20 text-blue-300' : 'bg-emerald-500/20 text-emerald-300'
                }`}>
                  {item.type}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Item Detail Panel */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row gap-6 items-start">
          {/* Left: Icon & Badge */}
          <div className="shrink-0 flex flex-col items-center gap-3 w-full md:w-48 bg-slate-950/80 p-4 rounded-xl border border-slate-800/90">
            <div className="w-24 h-24 rounded-xl bg-slate-900 border border-amber-500/40 p-2 shadow-xl flex items-center justify-center">
              <img
                src={selectedFeature.icon}
                alt={selectedFeature.name}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="text-center">
              <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                {selectedFeature.identifier}
              </span>
              <div className="text-xs text-slate-400 mt-1 capitalize font-medium">
                Type : {selectedFeature.type === 'item' ? 'Objet Fonctionnel' : 'Bloc de Construction'}
              </div>
            </div>
          </div>

          {/* Right: Technical Specs & Crafting */}
          <div className="flex-1 flex flex-col gap-4">
            <div>
              <h4 className="text-xl font-bold text-white">
                {selectedFeature.name}
              </h4>
              <p className="text-sm text-slate-300 mt-1 leading-relaxed">
                {selectedFeature.description}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 flex flex-col gap-1">
                <span className="text-[11px] uppercase tracking-wider text-amber-400/90 font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Effet & Comportement Spécial
                </span>
                <p className="text-xs text-slate-200">
                  {selectedFeature.specialEffect}
                </p>
              </div>

              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 flex flex-col gap-1">
                <span className="text-[11px] uppercase tracking-wider text-emerald-400/90 font-semibold flex items-center gap-1.5">
                  <Hammer className="w-3.5 h-3.5" />
                  Fabrication dans l'établi
                </span>
                <p className="text-xs text-slate-200 font-mono">
                  {selectedFeature.recipe}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Déclaré dans le manifest Behavior Pack v1.20+
              </span>
              <span className="font-mono text-slate-500">
                ID : {selectedFeature.identifier}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Guide d'installation .MCADDON en 3 étapes */}
      <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col gap-5">
        <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-blue-400" />
          <span>Comment fonctionne l'installation automatique du fichier .MCADDON ?</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 flex flex-col gap-2">
            <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-xs">
              1
            </div>
            <h4 className="text-sm font-semibold text-white">Téléchargez le fichier</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Téléchargez <code className="text-amber-300">slm_visual_pack-real.mcaddon</code> depuis cette page sur votre smartphone Android, tablette ou PC.
            </p>
          </div>

          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 flex flex-col gap-2">
            <div className="w-7 h-7 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center text-xs">
              2
            </div>
            <h4 className="text-sm font-semibold text-white">Touchez "Ouvrir avec Minecraft"</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Touchez le fichier dans vos téléchargements. Le moteur Bedrock démarre et importe automatiquement les <strong>deux packs en même temps</strong>.
            </p>
          </div>

          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 flex flex-col gap-2">
            <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs">
              3
            </div>
            <h4 className="text-sm font-semibold text-white">Activez sur votre monde</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Dans les paramètres du monde, activez le pack de comportement <strong className="text-white">REALISM+ 8K</strong>. Le pack de ressources s'associe automatiquement.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
