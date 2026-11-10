import React, { useState } from 'react';
import { ShieldCheck, Database, Phone, Mail, Globe, PlusCircle, FileSpreadsheet, Lock, LogOut, CheckCircle2, Share2, Check } from 'lucide-react';

interface HeaderProps {
  activeTab: 'upitnik' | 'admin' | 'rezultati';
  setActiveTab: (tab: 'upitnik' | 'admin' | 'rezultati') => void;
  clientCount: number;
  criticalClientsCount: number;
  onNewAssessment: () => void;
  onExportExcelAll: () => void;
  hasActiveResult: boolean;
  onOpenQuestionsCatalog: () => void;
  isAdmin: boolean;
  onOpenAdminLogin: () => void;
  onAdminLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  clientCount,
  criticalClientsCount,
  onNewAssessment,
  onExportExcelAll,
  hasActiveResult,
  onOpenQuestionsCatalog,
  isAdmin,
  onOpenAdminLogin,
  onAdminLogout,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyLink = () => {
    const publicUrl = window.location.origin;
    navigator.clipboard.writeText(publicUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Top micro announcement bar */}
      <div className="bg-[#0e1f42] text-slate-300 text-[11px] py-1.5 px-4 hidden md:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-blue-300 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              People Pro HR Konsalting • START | CORE | GROW paketi
            </span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-300">Vaš partner za ljudske resurse sa srcem</span>
          </div>
          <div className="flex items-center gap-5 text-slate-300">
            <a
              href="tel:+381601317282"
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
              <Phone className="w-3 h-3 text-emerald-400" />
              +381 60 131 72 82
            </a>
            <a
              href="mailto:dragana.peoplepro@gmail.com"
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
              <Mail className="w-3 h-3 text-blue-300" />
              dragana.peoplepro@gmail.com
            </a>
            <a
              href="https://www.peoplepro.rs"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
              <Globe className="w-3 h-3 text-blue-400" />
              peoplepro.rs
            </a>
          </div>
        </div>
      </div>

      {/* Admin active banner (visible when logged in) */}
      {isAdmin && (
        <div className="bg-gradient-to-r from-amber-500/10 via-blue-500/10 to-indigo-500/10 border-b border-blue-200/50 py-1.5 px-4 text-xs">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-800 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Administratorska sesija: <strong>Dragana Stanimirović</strong></span>
              <span className="text-slate-400 font-normal">|</span>
              <span className="text-slate-600 font-normal">Povezano sa Firestore bazom ({clientCount} prijava)</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                title="Kopirajte javni link za klijente u clipboard"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Link kopiran!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Kopiraj link za klijente</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={onAdminLogout}
                className="text-red-600 hover:text-red-700 font-semibold text-xs flex items-center gap-1 hover:underline cursor-pointer"
              >
                <LogOut className="w-3 h-3" />
                Odjavi se
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main navigation header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo & Title */}
          <div
            className="flex items-center gap-3.5 cursor-pointer group"
            onClick={() => setActiveTab('upitnik')}
          >
            <div className="relative flex items-center justify-center p-1 bg-white rounded-xl shadow-xs border border-slate-100 group-hover:border-blue-200 transition-colors">
              <img
                src="/peoplepro-logo.png"
                alt="People Pro Logo"
                className="h-10 sm:h-12 w-auto object-contain"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = 'https://www.peoplepro.rs/wp-content/uploads/2025/11/PeopleProLogo-1.png';
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 group-hover:text-[#2761ff] transition-colors">
                  HR <span className="text-[#2761ff]">DIJAGNOZA</span>
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-[#2761ff] border border-blue-200/60 uppercase tracking-wide">
                  B2B Alat
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">
                Detekcija crvenih tačaka & procena organizacionog zdravlja za pravna lica
              </p>
            </div>
          </div>

          {/* Navigation tabs */}
          <div className="flex items-center gap-2 sm:gap-3">
            {(hasActiveResult || isAdmin) && (
              <div className="inline-flex p-1 bg-slate-100/90 rounded-xl border border-slate-200/70 text-xs sm:text-sm font-semibold">
                {hasActiveResult && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('rezultati')}
                    className={`px-3 sm:px-4 py-2 rounded-lg transition-all duration-150 flex items-center gap-1.5 cursor-pointer ${
                      activeTab === 'rezultati'
                        ? 'bg-white text-[#2761ff] shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                    <span>Rezultati</span>
                  </button>
                )}

              {/* CRM Database Tab - ONLY VISIBLE TO LOGGED IN ADMIN */}
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => setActiveTab('admin')}
                  className={`px-3 sm:px-4 py-2 rounded-lg transition-all duration-150 flex items-center gap-2 cursor-pointer ${
                    activeTab === 'admin'
                      ? 'bg-white text-[#2761ff] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Database className="w-4 h-4 text-slate-500" />
                  <span>Baza klijenata</span>
                  <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[11px] font-bold rounded-full bg-blue-100 text-blue-700">
                    {clientCount}
                  </span>
                  {criticalClientsCount > 0 && (
                    <span
                      title={`${criticalClientsCount} kompanija sa kritičnim crvenim tačkama`}
                      className="w-2 h-2 rounded-full bg-red-500 animate-ping hidden sm:inline-block"
                    />
                  )}
                </button>
              )}
            </div>
          )}

            {/* Quick Actions & Admin controls */}
            {isAdmin && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onOpenQuestionsCatalog}
                  className="hidden xl:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                  title="Prikaži katalog svih 30 pitanja sa ponuđenim odgovorima (Admin)"
                >
                  <span>Sva pitanja (30)</span>
                </button>

                {activeTab === 'admin' && (
                  <button
                    type="button"
                    onClick={onExportExcelAll}
                    className="hidden lg:inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors cursor-pointer"
                    title="Izvoz svih podataka o klijentima u Excel format (.xlsx)"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Izvezi bazu u Excel</span>
                  </button>
                )}
              </div>
            )}

            {/* Public view: No admin buttons in header */}
          </div>
        </div>
      </div>
    </header>
  );
};
