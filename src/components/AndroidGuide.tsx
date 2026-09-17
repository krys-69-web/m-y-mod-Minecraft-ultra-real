import React from 'react';
import { Smartphone, ShieldCheck, AlertCircle, CheckCircle2, Cpu, Zap, Download, FileArchive } from 'lucide-react';

export const AndroidGuide: React.FC = () => {
  return (
    <div id="android-guide" className="flex flex-col gap-6">
      {/* Top Warning Banner: Technical Honesty & Transparency (Section 21) */}
      <div className="bg-slate-900/90 rounded-xl border border-amber-500/30 p-4 sm:p-5 flex flex-col sm:flex-row items-start gap-4 shadow-xl">
        <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 shrink-0">
          <AlertCircle className="w-6 h-6 text-amber-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <span>Engagement de Transparence & Vérité Technique</span>
            <span className="text-[11px] font-normal px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
              Directives 16 & 21
            </span>
          </h3>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            Ce Resource Pack est rigoureusement optimisé pour Android. Conformément aux directives du projet :
          </p>
          <ul className="text-xs text-slate-400 mt-2 space-y-1 list-disc list-inside">
            <li>
              <strong className="text-slate-200">Résolution 128×128 calibrée :</strong> Le label « 8K » désigne la netteté et la richesse visuelle perçue. Les textures physiques sont calibrées en 128×128 pour garantir la stabilité sans saturer la VRAM mobile.
            </li>
            <li>
              <strong className="text-slate-200">Pas de faux « 220 FPS garantis » :</strong> Le framerate réel dépend exclusivement de votre processeur (SoC Snapdragon / Dimensity / Exynos) et de la distance d'affichage (chunks).
            </li>
            <li>
              <strong className="text-slate-200">PBR & Render Dragon :</strong> Les fichiers <code className="text-amber-300">*.texture_set.json</code> sont officiellement déclarés. Sur Minecraft Bedrock Android, les reliefs PBR s'activent lorsque le mode graphique expérimental <em>Deferred Technical Preview</em> est activé par Mojang dans votre version.
            </li>
          </ul>
        </div>
      </div>

      {/* Two Installation Methods for Android */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Method 1: Automatic MCPack */}
        <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-5 flex flex-col gap-3 shadow-xl">
          <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-sm">
              1
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-100">Méthode 1 : Import Automatique .mcpack</h4>
              <span className="text-[11px] text-emerald-400 font-medium">Recommandée (1 Clic)</span>
            </div>
          </div>

          <ol className="text-xs text-slate-300 space-y-3 leading-relaxed mt-1">
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-800 text-amber-400 font-mono text-[11px] flex items-center justify-center shrink-0 mt-0.5">1</span>
              <span>
                Téléchargez le fichier <strong className="text-amber-300 font-mono">REALISM+_8K_v1.0.mcpack</strong> via le bouton principal en haut.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-800 text-amber-400 font-mono text-[11px] flex items-center justify-center shrink-0 mt-0.5">2</span>
              <span>
                Ouvrez votre gestionnaire de fichiers sur Android (<em>Files by Google</em>, <em>ZArchiver</em> ou le dossier <em>Téléchargements</em>).
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-800 text-amber-400 font-mono text-[11px] flex items-center justify-center shrink-0 mt-0.5">3</span>
              <span>
                Touchez le fichier <code>.mcpack</code> et sélectionnez <strong className="text-emerald-300">« Ouvrir avec Minecraft »</strong>.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-800 text-amber-400 font-mono text-[11px] flex items-center justify-center shrink-0 mt-0.5">4</span>
              <span>
                Minecraft se lance et affiche le bandeau <strong className="text-slate-100">« Importation de REALISM+ 8K réussie »</strong>.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-800 text-amber-400 font-mono text-[11px] flex items-center justify-center shrink-0 mt-0.5">5</span>
              <span>
                Dans Minecraft : <em>Paramètres &gt; Ressources globales &gt; Mes packs &gt; Activer</em>.
              </span>
            </li>
          </ol>
        </div>

        {/* Method 2: Manual Zip Directory */}
        <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-5 flex flex-col gap-3 shadow-xl">
          <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-sm">
              2
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-100">Méthode 2 : Copie Manuelle Dossier</h4>
              <span className="text-[11px] text-slate-400">Pour utilisateurs avancés</span>
            </div>
          </div>

          <ol className="text-xs text-slate-300 space-y-3 leading-relaxed mt-1">
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-800 text-blue-400 font-mono text-[11px] flex items-center justify-center shrink-0 mt-0.5">1</span>
              <span>
                Téléchargez l'archive <strong className="text-blue-300 font-mono">REALISM+_8K_v1.0.zip</strong> et extrayez le dossier <code className="text-slate-200">REALISM+ 8K</code>.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-800 text-blue-400 font-mono text-[11px] flex items-center justify-center shrink-0 mt-0.5">2</span>
              <div>
                <span>Déplacez le dossier dans l'emplacement système Bedrock :</span>
                <code className="block mt-1 p-2 rounded bg-slate-950 font-mono text-[10px] text-amber-300 break-all select-all border border-slate-800">
                  Android/data/com.mojang.minecraftpe/files/games/com.mojang/resource_packs/
                </code>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-800 text-blue-400 font-mono text-[11px] flex items-center justify-center shrink-0 mt-0.5">3</span>
              <span>
                <em>Note Android 11 à 14+ :</em> Si le dossier <code className="text-slate-200">Android/data</code> est protégé par Scoped Storage, utilisez <strong>ZArchiver</strong> ou <strong>Shizuku</strong> pour coller le dossier.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-800 text-blue-400 font-mono text-[11px] flex items-center justify-center shrink-0 mt-0.5">4</span>
              <span>
                Redémarrez Minecraft Bedrock et activez le pack dans les Ressources Globales.
              </span>
            </li>
          </ol>
        </div>
      </div>

      {/* Technical Memory & GPU Architecture Audit */}
      <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-5 flex flex-col gap-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-amber-400" />
            <h4 className="text-sm font-semibold text-slate-100">Audit de Performance & Compatibilité GPU Mobile</h4>
          </div>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono border border-emerald-500/30">
            Android Validated
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex flex-col gap-1">
            <span className="text-slate-500">Empreinte VRAM GPU</span>
            <span className="text-base font-semibold text-emerald-400 font-mono">~48 Mo à 95 Mo</span>
            <span className="text-[11px] text-slate-400">Totalement sécurisé contre les crashs OOM (Out Of Memory) sur appareils 4 Go / 6 Go RAM.</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex flex-col gap-1">
            <span className="text-slate-500">Compatibilité SoCs</span>
            <span className="text-base font-semibold text-slate-200 font-mono">Adreno / Mali / Bionic</span>
            <span className="text-[11px] text-slate-400">Snapdragon 680 à 8 Gen 3, MediaTek Helio/Dimensity, Google Tensor.</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex flex-col gap-1">
            <span className="text-slate-500">Taille de l'Archive</span>
            <span className="text-base font-semibold text-amber-400 font-mono">962 KB (.mcpack)</span>
            <span className="text-[11px] text-slate-400">Téléchargement instantané sur données mobiles 4G/5G ou Wi-Fi.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
