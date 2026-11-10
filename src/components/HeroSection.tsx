import React from 'react';
import { AlertCircle, BarChart3, CheckCircle2, ChevronRight, Zap, Target, FileText } from 'lucide-react';

interface HeroSectionProps {
  onStartClick: () => void;
  onFillDemo: () => void;
  onOpenQuestionsCatalog?: () => void;
  isAdmin?: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onStartClick,
  onFillDemo,
  onOpenQuestionsCatalog,
  isAdmin = false
}) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-[#eef5ff] via-white to-slate-50 border-b border-slate-200/80 py-10 lg:py-16">
      {/* Background soft ambient glows */}
      <div className="absolute top-0 right-10 -mt-10 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-10 -mb-10 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Headline and Call-to-actions */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 text-[#2761ff] text-xs font-bold uppercase tracking-wider border border-blue-200/70">
              <span className="flex h-2 w-2 rounded-full bg-[#2761ff] animate-pulse"></span>
              People Pro • Profesionalni HR Konsalting za Pravna Lica
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Otkrijte <span className="text-[#2761ff]">crvene tačke</span> u vašoj firmi pre nego što vas koštaju talenata i profita.
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
              Sveobuhvatna HR dijagnostika u <strong>10 ključnih oblasti</strong> – od regrutacije i onboardinga do KPI-jeva, plata i well-being-a. Dobijte trenutni <strong>interaktivni radar izveštaj</strong> i personalizovane preporuke za savetovanje skrojene po meri vašeg biznisa.
            </p>

            {/* Value checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs sm:text-sm font-medium text-slate-700">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Identifikacija gorućih problema i rizika</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Interaktivni vizuelni radar rezultata (10 osa)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Preuzimanje PDF izveštaja sa zahvalnicom</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Poziv na besplatne 30-minutne strateške konsultacije</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onStartClick}
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#2761ff] hover:bg-[#1b4fd8] text-white font-bold text-sm sm:text-base rounded-xl shadow-md hover:shadow-lg transition-all transform active:scale-98 cursor-pointer"
              >
                <span>Započni HR dijagnostiku</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              {isAdmin && (
                <button
                  type="button"
                  onClick={onFillDemo}
                  className="inline-flex items-center gap-2 px-5 py-3.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm rounded-xl border border-slate-300 shadow-xs hover:border-slate-400 transition-all cursor-pointer"
                  title="Popuni upitnik testnim primerom kompanije (Vidljivo samo adminu)"
                >
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>Admin Demo test</span>
                </button>
              )}

              {isAdmin && onOpenQuestionsCatalog && (
                <button
                  type="button"
                  onClick={onOpenQuestionsCatalog}
                  className="inline-flex items-center gap-1.5 px-4 py-3.5 bg-white hover:bg-slate-50 text-slate-600 font-medium text-xs sm:text-sm rounded-xl border border-slate-200 transition-all cursor-pointer"
                  title="Pregledaj sva pitanja i opcije odgovora (Vidljivo samo adminu)"
                >
                  <FileText className="w-4 h-4 text-[#2761ff]" />
                  <span>Katalog svih pitanja</span>
                </button>
              )}
            </div>

            {/* People Pro packages bar */}
            <div className="pt-4 border-t border-slate-200">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Rešenja za svaki nivo organizacionog rasta:
              </p>
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
                  <div className="text-[11px] font-bold text-[#2761ff]">START</div>
                  <div className="text-[10px] text-slate-500 font-medium">HR dijagnostika i hitna mapa</div>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
                  <div className="text-[11px] font-bold text-indigo-600">CORE</div>
                  <div className="text-[10px] text-slate-500 font-medium">HR sistem i struktura tima</div>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
                  <div className="text-[11px] font-bold text-emerald-600">GROW</div>
                  <div className="text-[10px] text-slate-500 font-medium">Eksterni HR Business Partner</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Teaser / Diagnostic Dimensions Badge */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#2761ff] flex items-center justify-center font-bold">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">10 Dimenzija HR Zdravlja</h2>
                    <p className="text-[11px] text-slate-500">Po 3 ciljana pitanja za svaku oblast (ukupno 30)</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  Semaforska analiza
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 font-medium text-slate-700 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2761ff]"></span>
                  1. Regrutacija
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 font-medium text-slate-700 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2761ff]"></span>
                  2. Onboarding
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 font-medium text-slate-700 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2761ff]"></span>
                  3. Tim i struktura
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 font-medium text-slate-700 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2761ff]"></span>
                  4. Komunikacija
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 font-medium text-slate-700 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2761ff]"></span>
                  5. Zadovoljstvo
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 font-medium text-slate-700 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2761ff]"></span>
                  6. Razvoj
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 font-medium text-slate-700 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2761ff]"></span>
                  7. Učinak i KPI
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 font-medium text-slate-700 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2761ff]"></span>
                  8. Fluktuacija
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 font-medium text-slate-700 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2761ff]"></span>
                  9. Plate & Benefiti
                </div>
                <div className="p-2 rounded-lg bg-blue-50 border border-blue-200 font-bold text-[#2761ff] flex items-center gap-1.5 col-span-2 sm:col-span-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2761ff]"></span>
                  10. Well-being i psihološka bezbednost
                </div>
              </div>

              {/* Red flag notice box */}
              <div className="p-3.5 rounded-xl bg-red-50/80 border border-red-200 text-xs text-red-900 space-y-1">
                <div className="flex items-center gap-2 font-bold text-red-800">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>Svrha: Detekcija "Crvenih tačaka" (&lt;50%)</span>
                </div>
                <p className="text-[11px] text-red-700 leading-relaxed">
                  Svaka oblast sa ocenom ispod 50% automatski se markira kao kritična tačka, dajući vam jasan putokaz koje požare treba hitno ugasiti.
                </p>
              </div>

              {/* People Pro signature quote */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600 italic">
                „Kada postavite sistem prema ljudima sa srcem i jasnim procesima, biznis raste prirodno i bez stresa.“
                <span className="block not-italic font-bold text-slate-800 mt-1">
                  — Dragana Stanimirović, Osnivač People Pro
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
