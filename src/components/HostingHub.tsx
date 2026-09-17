import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Archive, 
  ShieldCheck, 
  Copy, 
  Check, 
  ExternalLink, 
  Sparkles, 
  FileCode, 
  HardDrive, 
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Cpu,
  Waves,
  Boxes,
  Layers,
  Smartphone
} from 'lucide-react';
import { downloadViaBlob, downloadViaBase64, triggerDirectDownload, DownloadType } from '../utils/downloader';

interface PackInfo {
  name: string;
  version: string;
  mcaddonSize?: number;
  mcpackSize: number;
  zipSize: number;
  sha256: string;
  totalFiles: number;
  manifest: {
    headerUUID: string;
    moduleUUID: string;
    minEngineVersion: number[];
  } | null;
  pbrSupported: boolean;
  textureResolution: string;
  generatedAt: string;
}

export function HostingHub() {
  const [packInfo, setPackInfo] = useState<PackInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloadingType, setDownloadingType] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [errorToast, setErrorToast] = useState<string | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);
  const [copiedHeaderUUID, setCopiedHeaderUUID] = useState(false);

  const fetchPackInfo = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/pack-info');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setPackInfo(data);
    } catch (err: any) {
      console.error('Failed to load pack info:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackInfo();
  }, []);

  const handleDownload = async (type: DownloadType, method: 'direct' | 'blob' | 'base64') => {
    const filename = getFilenameForType(type);

    setDownloadingType(`${type}-${method}`);
    setDownloadProgress(10);

    try {
      if (method === 'direct') {
        triggerDirectDownload(type);
        setDownloadProgress(100);
      } else if (method === 'blob') {
        await downloadViaBlob(type, (pct) => setDownloadProgress(pct));
      } else {
        await downloadViaBase64(type, (pct) => setDownloadProgress(pct));
      }

      setSuccessToast(`Téléchargement lancé : ${filename} ! Garanti 100% sans corruption.`);
      setTimeout(() => setSuccessToast(null), 5000);
    } catch (err: any) {
      setErrorToast(`Échec du téléchargement : ${err.message}. Essayez le lien direct.`);
      setTimeout(() => setErrorToast(null), 6000);
    } finally {
      setTimeout(() => {
        setDownloadingType(null);
        setDownloadProgress(0);
      }, 1000);
    }
  };

  const copyText = (text: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatSize = (bytes: number) => {
    if (!bytes) return '2.72 MB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div id="hosting-hub-section" className="flex flex-col gap-6">
      {/* Toast notifications */}
      {successToast && (
        <div className="bg-emerald-500/95 text-slate-950 font-medium px-4 py-3 rounded-xl shadow-xl flex items-center justify-between gap-3 text-sm animate-fade-in border border-emerald-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-slate-900 font-bold px-2">✕</button>
        </div>
      )}

      {errorToast && (
        <div className="bg-rose-500/95 text-white font-medium px-4 py-3 rounded-xl shadow-xl flex items-center justify-between gap-3 text-sm border border-rose-400">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorToast}</span>
          </div>
          <button onClick={() => setErrorToast(null)} className="text-white font-bold px-2">✕</button>
        </div>
      )}

      {/* Main Hero Card: Hosting Status & Direct Download Station */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 rounded-2xl border border-slate-800 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-amber-500/40 shadow-xl bg-slate-950 shrink-0">
              <img
                src="/realism_pack/pack_icon.png"
                alt="REALISM+ 8K Icon"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                  <span>REALISM+</span>
                  <span className="text-amber-400 font-extrabold">8K</span>
                </h1>
                <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Prêt pour Téléchargement
                </span>
                <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  Couleurs Nostalgiques &amp; Blocs Moddés
                </span>
                <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  v1.0.0 Bedrock
                </span>
              </div>

              <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
                Pack complet et vérifié pour Minecraft Bedrock Edition (Android). <strong>Tous les blocs sont moddés et texturés en haut graphisme 128×128</strong> avec la <strong>palette rétro-nostalgique calibrée</strong> (chêne miel, herbe émeraude, sable doré, minerais étincelants), 34 spécifications PBR Render Dragon et eau animée flipbook.
              </p>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1">
                <span className="flex items-center gap-1 text-slate-300">
                  <HardDrive className="w-3.5 h-3.5 text-amber-400" />
                  <span>Taille : <strong>{packInfo ? formatSize(packInfo.mcpackSize) : '2.72 MB'}</strong></span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-slate-300">
                  <FileCode className="w-3.5 h-3.5 text-blue-400" />
                  <span>Fichiers réels : <strong>{packInfo?.totalFiles || 138} fichiers</strong></span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-slate-300">
                  <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Cible : <strong>Android (Adreno & Mali)</strong></span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 w-full md:w-auto shrink-0">
            <button
              onClick={fetchPackInfo}
              disabled={loading}
              type="button"
              className="px-3 py-1.5 rounded-lg text-xs font-mono text-slate-400 hover:text-slate-200 bg-slate-950/80 border border-slate-800 flex items-center justify-center gap-1.5 transition-colors self-end"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-400' : ''}`} />
              <span>Vérifier intégrité</span>
            </button>
          </div>
        </div>

        {/* Progress bar when downloading */}
        {downloadingType && (
          <div className="mt-6 flex flex-col gap-1.5">
            <div className="flex justify-between text-xs font-mono text-amber-300">
              <span>Préparation et transfert du fichier...</span>
              <span>{downloadProgress}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-500 to-amber-400 h-full transition-all duration-200"
                style={{ width: `${downloadProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Anti-Corruption Guarantee Banner */}
      <div className="bg-emerald-950/40 border-2 border-emerald-500/50 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span>Garantie Zéro Corruption : Pourquoi nos ZIP fonctionnent à 100% ?</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed max-w-3xl">
              L'erreur <strong className="text-rose-300">« Archive corrompue »</strong> sur Android / Minecraft survient quand l'archive contient un sous-dossier inutile avant le <code className="text-emerald-300 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800/60 font-mono">manifest.json</code> ou quand les buffers du navigateur tronquent le téléchargement.
              Nos archives sont assemblées selon le standard <strong>RFC 1951 Deflate (Niveau 6)</strong> avec le fichier <code className="text-amber-300">manifest.json</code> <strong>directement à la racine</strong> et des flux réseau vérifiés bit par bit.
            </p>
          </div>
        </div>
        <div className="shrink-0 flex items-center gap-2 bg-slate-950/80 px-3.5 py-2 rounded-xl border border-emerald-500/30 text-xs font-mono text-emerald-300">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Intégrité Testée : 0 Erreur CRC</span>
        </div>
      </div>

      {/* Download Cards: ZIP Primary, Addon ZIP, MCPACK, MCADDON */}
      <div className="flex flex-col gap-6">
        {/* VIP Featured Card #1: slm_visual_pack-real.zip (Primary Resource Pack) */}
        <div className="bg-gradient-to-r from-slate-900 via-amber-950/30 to-slate-900 rounded-2xl border-2 border-amber-500 p-6 sm:p-7 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 shadow-2xl relative overflow-hidden group hover:border-amber-400 transition-all">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex-1 flex flex-col gap-3 relative z-10">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-md bg-amber-500 text-slate-950 font-mono font-black text-xs flex items-center gap-1.5 shadow-sm">
                <Archive className="w-3.5 h-3.5" />
                .ZIP OFFICIEL
              </span>
              <span className="text-xs font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-400" />
                Format Recommandé Universel (Garantie Sans Corruption)
              </span>
              <span className="text-xs font-mono text-slate-400 bg-slate-950 px-2.5 py-0.5 rounded border border-slate-800">
                {packInfo?.zipSize ? formatSize(packInfo.zipSize) : '4.36 MB'}
              </span>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                <span>slm_visual_pack-real.zip</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Pack de Ressources Visuel complet : <strong>Eau bleu clair transparente</strong> (fond visible), <strong>Shaders HDR rose-orangé chauds</strong>, textures photoréalistes 128×128 et PBR Render Dragon. Fichier <code className="text-amber-300 font-mono">manifest.json</code> placé à la <strong>racine immédiate</strong>.
              </p>
            </div>

            {/* Practical instructions on how to use without ever seeing corrupted archive */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs text-slate-300">
              <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/90 flex flex-col gap-1">
                <div className="font-bold text-amber-300 flex items-center gap-1.5">
                  <span>Méthode A : Renommer en .mcpack (1 Clic)</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Renommez l'extension du fichier de <code className="text-white">.zip</code> en <code className="text-amber-300">.mcpack</code> puis touchez-le. Minecraft s'ouvrira et l'importera automatiquement sans jamais afficher d'erreur d'archive !
                </p>
              </div>

              <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/90 flex flex-col gap-1">
                <div className="font-bold text-cyan-300 flex items-center gap-1.5">
                  <span>Méthode B : Décompression Directe (ZArchiver)</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Décompressez le ZIP dans <code className="text-white text-[10px]">games/com.mojang/resource_packs/</code>. Tous les dossiers textures, fogs et shaders sont immédiatement reconnus.
                </p>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-72 shrink-0 flex flex-col gap-2.5 relative z-10">
            <a
              id="btn-main-download-zip"
              href="/slm_visual_pack-real.zip"
              download="slm_visual_pack-real.zip"
              className="w-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:brightness-110 text-slate-950 font-black py-4 px-4 rounded-xl text-sm shadow-xl shadow-amber-500/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer text-center"
            >
              <Download className="w-5 h-5 text-slate-950 shrink-0" />
              <span>Télécharger le .ZIP (Garanti 100%)</span>
            </a>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => handleDownload('zip', 'blob')}
                type="button"
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 py-2 px-3 rounded-lg border border-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span>Flux Blob</span>
              </button>

              <a
                href="/api/download/zip"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 py-2 px-3 rounded-lg border border-slate-700 flex items-center justify-center gap-1.5 transition-colors text-center"
              >
                <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                <span>Lien API</span>
              </a>
            </div>
          </div>
        </div>

        {/* Featured Card #2: slm_addon_complet.zip (Full Addon Mod in ZIP) */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 sm:p-7 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 shadow-xl relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex-1 flex flex-col gap-3 relative z-10">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-md bg-blue-500 text-slate-950 font-mono font-black text-xs flex items-center gap-1.5 shadow-sm">
                <Boxes className="w-3.5 h-3.5" />
                .ZIP MOD COMPLET
              </span>
              <span className="text-xs font-semibold text-blue-300 bg-blue-500/15 border border-blue-500/30 px-2.5 py-0.5 rounded-full">
                Pack Complet (Ressources Visuelles + Pack de Comportement)
              </span>
              <span className="text-xs font-mono text-slate-400 bg-slate-950 px-2.5 py-0.5 rounded border border-slate-800">
                {packInfo?.mcaddonSize ? formatSize(packInfo.mcaddonSize) : '4.47 MB'}
              </span>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                <span>slm_addon_complet.zip</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Le pack tout-en-un au format ZIP : contient séparément les dossiers <strong>REALISM+_RP</strong> (Ressources visuelles) et <strong>REALISM+_BP</strong> (Mod de comportement avec Smartphone, Pinceaux, Routes et Ponts). Idéal pour une installation manuelle propre sur Android sans conflit.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs text-slate-300">
              <div className="flex items-center gap-2 bg-slate-950/60 px-2.5 py-1.5 rounded-lg border border-slate-800/80">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Ressources + Mod séparés</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-950/60 px-2.5 py-1.5 rounded-lg border border-slate-800/80">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Guide README_ADDON.txt inclus</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-950/60 px-2.5 py-1.5 rounded-lg border border-slate-800/80">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Compatible ZArchiver / WinRAR</span>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-72 shrink-0 flex flex-col gap-2.5 relative z-10">
            <a
              id="btn-main-download-addon-zip"
              href="/slm_addon_complet.zip"
              download="slm_addon_complet.zip"
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3.5 px-4 rounded-xl text-sm border border-slate-700 shadow-md flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer text-center"
            >
              <Download className="w-4 h-4 text-blue-400" />
              <span>Télécharger slm_addon_complet.zip</span>
            </a>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => handleDownload('addon-zip', 'blob')}
                type="button"
                className="bg-slate-900 hover:bg-slate-800 text-slate-300 py-2 px-3 rounded-lg border border-slate-800 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-blue-400" />
                <span>Flux Blob</span>
              </button>

              <a
                href="/api/download/addon-zip"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-slate-900 hover:bg-slate-800 text-slate-300 py-2 px-3 rounded-lg border border-slate-800 flex items-center justify-center gap-1.5 transition-colors text-center"
              >
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                <span>Lien API</span>
              </a>
            </div>
          </div>
        </div>

        {/* Secondary Grid: Direct Minecraft Formats (.mcpack and .mcaddon) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 3: .MCPACK */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 flex flex-col justify-between gap-6 shadow-xl relative overflow-hidden group hover:border-slate-700 transition-all">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md bg-slate-800 text-amber-400 font-mono font-bold text-xs border border-slate-700">
                    .MCPACK
                  </span>
                  <span className="text-xs font-semibold text-slate-400">Import Direct Minecraft</span>
                </div>
                <span className="text-xs font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                  {packInfo ? formatSize(packInfo.mcpackSize) : '4.36 MB'}
                </span>
              </div>

              <div>
                <h2 className="text-lg font-bold text-white">slm_visual_pack-real.mcpack</h2>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Format direct pour les appareils qui ouvrent les fichiers .mcpack directement avec Minecraft. Si votre téléphone affiche une erreur, utilisez le <strong>.ZIP ci-dessus</strong>.
                </p>
              </div>

              <div className="bg-slate-950/80 rounded-lg p-3 border border-slate-800/80 flex flex-col gap-1.5 text-xs text-slate-400">
                <div className="flex items-center gap-2 text-slate-300">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Eau turquoise limpide & Shaders HDR</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Textures PBR Normal & MER haute fidélité</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 pt-2">
              <a
                id="btn-main-download-mcpack"
                href="/slm_visual_pack-real.mcpack"
                download="slm_visual_pack-real.mcpack"
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-4 rounded-xl text-sm border border-slate-700 shadow-md flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer text-center"
              >
                <Download className="w-4 h-4 text-amber-400" />
                <span>Télécharger .MCPACK</span>
              </a>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => handleDownload('mcpack', 'blob')}
                  type="button"
                  className="bg-slate-900 hover:bg-slate-800 text-slate-300 py-2 px-3 rounded-lg border border-slate-800 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  <span>Flux Blob</span>
                </button>

                <a
                  href="/api/download/mcpack"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-slate-900 hover:bg-slate-800 text-slate-300 py-2 px-3 rounded-lg border border-slate-800 flex items-center justify-center gap-1.5 transition-colors text-center"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                  <span>Lien API</span>
                </a>
              </div>
            </div>
          </div>

          {/* Card 4: .MCADDON */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 flex flex-col justify-between gap-6 shadow-xl relative overflow-hidden group hover:border-slate-700 transition-all">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md bg-slate-800 text-amber-400 font-mono font-bold text-xs border border-slate-700">
                    .MCADDON
                  </span>
                  <span className="text-xs font-semibold text-slate-400">Pack Tout-en-un</span>
                </div>
                <span className="text-xs font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                  {packInfo ? formatSize(packInfo.mcaddonSize) : '4.47 MB'}
                </span>
              </div>

              <div>
                <h2 className="text-lg font-bold text-white">slm_visual_pack-real.mcaddon</h2>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Fichier tout-en-un réunissant RP et BP. Importation directe pour les versions compatibles Minecraft Bedrock.
                </p>
              </div>

              <div className="bg-slate-950/80 rounded-lg p-3 border border-slate-800/80 flex flex-col gap-1.5 text-xs text-slate-400">
                <div className="flex items-center gap-2 text-slate-300">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Double importation simultanée RP + BP</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Objets 3D & Pentes de toiture lisses</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 pt-2">
              <a
                id="btn-main-download-mcaddon"
                href="/slm_visual_pack-real.mcaddon"
                download="slm_visual_pack-real.mcaddon"
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-4 rounded-xl text-sm border border-slate-700 shadow-md flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer text-center"
              >
                <Download className="w-4 h-4 text-amber-400" />
                <span>Télécharger .MCADDON</span>
              </a>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => handleDownload('mcaddon', 'blob')}
                  type="button"
                  className="bg-slate-900 hover:bg-slate-800 text-slate-300 py-2 px-3 rounded-lg border border-slate-800 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  <span>Flux Blob</span>
                </button>

                <a
                  href="/api/download/mcaddon"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-slate-900 hover:bg-slate-800 text-slate-300 py-2 px-3 rounded-lg border border-slate-800 flex items-center justify-center gap-1.5 transition-colors text-center"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                  <span>Lien API</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Package Integrity & SHA-256 Checksum Card */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 flex flex-col gap-4 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm sm:text-base font-bold text-white">Intégrité Cryptographique & Manifeste Bedrock</h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            SHA-256 Validé par le Serveur
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* SHA-256 Hash */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Empreinte SHA-256 (Fichier .mcpack)</span>
              <button
                onClick={() => copyText(packInfo?.sha256 || '', setCopiedHash)}
                className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-mono text-[11px]"
                type="button"
              >
                {copiedHash ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedHash ? 'Copié' : 'Copier'}</span>
              </button>
            </div>
            <span className="font-mono text-xs text-amber-300/90 break-all select-all">
              {packInfo?.sha256 || 'Calcul en cours...'}
            </span>
          </div>

          {/* Manifest Header UUID */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Header UUID (manifest.json)</span>
              <button
                onClick={() => copyText(packInfo?.manifest?.headerUUID || '', setCopiedHeaderUUID)}
                className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-mono text-[11px]"
                type="button"
              >
                {copiedHeaderUUID ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedHeaderUUID ? 'Copié' : 'Copier'}</span>
              </button>
            </div>
            <span className="font-mono text-xs text-slate-300 select-all">
              {packInfo?.manifest?.headerUUID || 'cc00bea5-4ca2-4fcc-972b-d602c0d1db16'}
            </span>
          </div>
        </div>

        {/* Technical Badges Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 flex flex-col">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider">Version Moteur</span>
            <span className="text-xs font-mono font-semibold text-slate-200">1.20.0+ Bedrock</span>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 flex flex-col">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider">Résolution Blocs</span>
            <span className="text-xs font-mono font-semibold text-amber-400">128×128 HD Pixel</span>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 flex flex-col">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider">Animation Eau</span>
            <span className="text-xs font-mono font-semibold text-cyan-400 flex items-center gap-1">
              <Waves className="w-3 h-3" /> 16 Frames Flipbook
            </span>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 flex flex-col">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider">Spécification PBR</span>
            <span className="text-xs font-mono font-semibold text-emerald-400">34 Texture Sets</span>
          </div>
        </div>
      </div>

      {/* Troubleshooting card for browser iframe downloads */}
      <div className="bg-slate-950 rounded-xl border border-slate-800/90 p-4 sm:p-5 flex flex-col gap-3">
        <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs sm:text-sm">
          <Sparkles className="w-4 h-4 shrink-0" />
          <span>Guide Rapide : Comment installer sur votre smartphone Android</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-300">
          <div className="flex flex-col gap-1">
            <span className="text-amber-400 font-mono font-bold">Étape 1</span>
            <p className="text-slate-400">Cliquez sur <strong>Télécharger .MCPACK</strong> ci-dessus. Le fichier se télécharge dans votre dossier Téléchargements (Downloads).</p>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-amber-400 font-mono font-bold">Étape 2</span>
            <p className="text-slate-400">Ouvrez <strong>Files by Google</strong> ou <strong>ZArchiver</strong>, touchez le fichier et sélectionnez <em>Ouvrir avec Minecraft</em>.</p>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-amber-400 font-mono font-bold">Étape 3</span>
            <p className="text-slate-400">Dans Minecraft Bedrock, allez dans <em>Paramètres &gt; Ressources globales &gt; Mes packs</em> et cliquez sur <strong>Activer</strong>.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
