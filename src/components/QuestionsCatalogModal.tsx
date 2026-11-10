import React, { useState } from 'react';
import { DIAGNOSTIC_CATEGORIES } from '../data/diagnosticData';
import { HelpCircle, Search, Printer, X, CheckCircle2, AlertCircle } from 'lucide-react';

interface QuestionsCatalogModalProps {
  onClose: () => void;
}

export const QuestionsCatalogModal: React.FC<QuestionsCatalogModalProps> = ({ onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCatId, setSelectedCatId] = useState<string>('all');

  const filteredCategories = DIAGNOSTIC_CATEGORIES.filter(cat => {
    if (selectedCatId !== 'all' && cat.id !== selectedCatId) return false;
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const matchCat = cat.title.toLowerCase().includes(term) || cat.description.toLowerCase().includes(term);
    const matchQ = cat.questions.some(q =>
      q.text.toLowerCase().includes(term) ||
      q.options.some(o => o.label.toLowerCase().includes(term))
    );
    return matchCat || matchQ;
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-[#2761ff]">
                Katalog pitanja
              </span>
              <span className="text-xs text-slate-400">10 oblasti • 30 pitanja</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
              Kompletan Upitnik People Pro HR Dijagnoze
            </h3>
            <p className="text-xs text-slate-500">
              Strukturirani upitnik za procenu organizacionog zdravlja i detekciju crvenih tačaka pravnih lica.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Štampaj</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 flex items-center justify-center font-bold"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="p-4 border-b border-slate-200 bg-white grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-7 relative">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Pretraži pitanja i pojmove (npr. ugovor, mentor, stres, KPI)..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2761ff]"
            />
          </div>

          <div className="sm:col-span-5">
            <select
              value={selectedCatId}
              onChange={(e) => setSelectedCatId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2761ff] cursor-pointer"
            >
              <option value="all">Sve oblasti (10 dimenzija)</option>
              {DIAGNOSTIC_CATEGORIES.map(c => (
                <option key={c.id} value={c.id}>
                  {c.number}. {c.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Questions list */}
        <div className="p-6 overflow-y-auto space-y-8 flex-1 bg-[#f8fafc]">
          {filteredCategories.map((category) => (
            <div
              key={category.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 sm:p-6 space-y-5"
            >
              {/* Category banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2761ff] font-bold text-sm flex items-center justify-center shrink-0">
                    {category.number}
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900">
                      {category.title}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium">
                      {category.description}
                    </p>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 sm:text-right">
                  <span className="font-semibold text-slate-700">3 pitanja</span> (skala 1–4)
                </div>
              </div>

              {/* Red flag trigger note */}
              <div className="p-3 rounded-xl bg-red-50/70 border border-red-200 text-xs text-red-900 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-red-800">Crvena tačka okidač (&lt;50%): </span>
                  <span className="text-red-700">{category.redFlagWarning}</span>
                </div>
              </div>

              {/* Questions */}
              <div className="space-y-4">
                {category.questions.map((question, qIdx) => (
                  <div
                    key={question.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#2761ff]">
                          Pitanje {qIdx + 1} / 3:
                        </span>
                        <h5 className="font-bold text-sm text-slate-900">
                          {question.text}
                        </h5>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Svrha pitanja: {question.contextHint}</span>
                      </p>
                    </div>

                    {/* Options list */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {question.options.map((opt) => (
                        <div
                          key={opt.value}
                          className="p-2.5 rounded-lg border border-slate-200 bg-white text-xs space-y-0.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800">
                              Ocena {opt.value}/4
                            </span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                              opt.value === 1 ? 'bg-red-100 text-red-700' :
                              opt.value === 2 ? 'bg-amber-100 text-amber-700' :
                              opt.value === 3 ? 'bg-blue-100 text-[#2761ff]' :
                              'bg-emerald-100 text-emerald-700'
                            }`}>
                              {opt.value === 1 ? 'Kritično (25%)' :
                               opt.value === 2 ? 'Delimično (50%)' :
                               opt.value === 3 ? 'Solidno (75%)' :
                               'Optimizovano (100%)'}
                            </span>
                          </div>
                          <p className="text-slate-700 font-medium leading-snug">
                            {opt.label}
                          </p>
                          {opt.subtext && (
                            <p className="text-[11px] text-slate-400">
                              {opt.subtext}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            People Pro HR Dijagnoza • Metodologija Dragane Stanimirović
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-[#2761ff] hover:bg-[#1b4fd8] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Zatvori katalog
          </button>
        </div>
      </div>
    </div>
  );
};
