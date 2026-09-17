import React, { useState } from 'react';
import { 
  Download, 
  Archive, 
  FileText, 
  Smartphone, 
  ShieldCheck, 
  HardDrive,
  Info,
  ExternalLink,
  CheckCircle2,
  Boxes,
  Layers
} from 'lucide-react';
import { HostingHub } from './components/HostingHub';
import { AddonHub } from './components/AddonHub';
import { FileBrowser } from './components/FileBrowser';
import { AndroidGuide } from './components/AndroidGuide';
import { TechnicalLimitations } from './components/TechnicalLimitations';
import { triggerDirectDownload, DownloadType, getFilenameForType } from './utils/downloader';

export default function App() {
  const [activeTab, setActiveTab] = useState<'hosting' | 'addon' | 'files' | 'guide' | 'limitations'>('hosting');
  const [quickNotice, setQuickNotice] = useState<string | null>(null);

  const handleQuickDownload = (type: DownloadType) => {
    const filename = getFilenameForType(type);
    triggerDirectDownload(type);
    setQuickNotice(`Téléchargement de ${filename} en cours...`);
    setTimeout(() => setQuickNotice(null), 4000);
  };

  return (
    <div className="min-h-screen bg-[#0a0f18] text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950 font-sans">
      {/* Top Banner Notice */}
      {quickNotice && (
        <div className="bg-amber-500 text-slate-950 font-medium px-4 py-2 text-center text-xs flex items-center justify-center gap-2 transition-all shadow-md z-50">
          <CheckCircle2 className="w-4 h-4" />
          <span>{quickNotice}</span>
        </div>
      )}

      {/* Main Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
          {/* Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-amber-500/40 shadow-md shrink-0 bg-slate-950">
              <img
                src="/realism_pack/pack_icon.png"
                alt="REALISM+ 8K Icon"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                  <span>REALISM+</span>
                  <span className="text-amber-400 font-extrabold">8K</span>
                </h1>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Hébergement Officiel
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Plateforme de distribution du Pack Réaliste & Mod Minecraft Bedrock Edition
              </p>
            </div>
          </div>

          {/* Quick Header Download Actions */}
          <div className="flex items-center gap-2">
            <button
              id="header-download-mcaddon"
              onClick={() => handleQuickDownload('mcaddon')}
              className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:brightness-110 text-slate-950 font-black px-3.5 py-2 rounded-lg text-xs sm:text-sm shadow-lg shadow-amber-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              type="button"
            >
              <Boxes className="w-4 h-4 text-slate-950" />
              <span>.MCADDON (Complet)</span>
            </button>

            <button
              id="header-download-mcpack"
              onClick={() => handleQuickDownload('mcpack')}
              className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium px-3 py-2 rounded-lg text-xs sm:text-sm border border-slate-700 transition-colors cursor-pointer"
              type="button"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>.MCPACK</span>
            </button>

            <button
              id="header-download-zip"
              onClick={() => handleQuickDownload('zip')}
              className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium px-3 py-2 rounded-lg text-xs sm:text-sm border border-slate-700 transition-colors cursor-pointer"
              type="button"
            >
              <Archive className="w-3.5 h-3.5 text-amber-400" />
              <span>.ZIP</span>
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs Bar */}
      <div className="border-b border-slate-800/80 bg-slate-950/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <nav className="flex space-x-1 sm:space-x-2.5 overflow-x-auto py-2.5 scrollbar-none text-xs sm:text-sm">
            <button
              id="tab-nav-hosting"
              onClick={() => setActiveTab('hosting')}
              className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'hosting'
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
              type="button"
            >
              <HardDrive className="w-4 h-4 text-amber-400" />
              <span>Téléchargements & Hébergement</span>
            </button>

            <button
              id="tab-nav-addon"
              onClick={() => setActiveTab('addon')}
              className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'addon'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
              type="button"
            >
              <Boxes className="w-4 h-4 text-amber-400" />
              <span>Pack Mod (.mcaddon)</span>
              <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded border border-amber-500/30">
                RP + BP
              </span>
            </button>

            <button
              id="tab-nav-files"
              onClick={() => setActiveTab('files')}
              className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'files'
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
              type="button"
            >
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>Arborescence & Fichiers Réels (81)</span>
            </button>

            <button
              id="tab-nav-guide"
              onClick={() => setActiveTab('guide')}
              className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'guide'
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
              type="button"
            >
              <Smartphone className="w-4 h-4 text-blue-400" />
              <span>Guide d'Installation Android</span>
            </button>

            <button
              id="tab-nav-limitations"
              onClick={() => setActiveTab('limitations')}
              className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'limitations'
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
              type="button"
            >
              <Info className="w-4 h-4 text-purple-400" />
              <span>Limitations Techniques Bedrock</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
        {activeTab === 'hosting' && <HostingHub />}
        {activeTab === 'addon' && <AddonHub />}
        {activeTab === 'files' && <FileBrowser />}
        {activeTab === 'guide' && <AndroidGuide />}
        {activeTab === 'limitations' && <TechnicalLimitations />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>REALISM+ 8K • Validé pour Minecraft Bedrock Edition (Android & Windows)</span>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <a
              href="/REALISM+_8K_v1.0.mcaddon"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-amber-400 flex items-center gap-1 transition-colors"
            >
              <span>Lien direct .MCADDON</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <a
              href="/api/download/mcpack"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-amber-400 flex items-center gap-1 transition-colors"
            >
              <span>Lien direct .MCPACK</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <a
              href="/api/download/zip"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-amber-400 flex items-center gap-1 transition-colors"
            >
              <span>Lien direct .ZIP</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
