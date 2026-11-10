import React from 'react';
import { ClientSubmission } from '../types';
import { DIAGNOSTIC_CATEGORIES } from '../data/diagnosticData';

interface PrintReportProps {
  client: ClientSubmission;
  onClose: () => void;
}

export const PrintReport: React.FC<PrintReportProps> = ({ client, onClose }) => {
  const { companyInfo, scores, submittedAt } = client;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[96vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Top Control Bar (Hidden in Print) */}
        <div className="no-print p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm">Pregled zvaničnog izveštaja za štampu / PDF</span>
            <span className="text-xs text-slate-400">({companyInfo.companyName})</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 bg-[#2761ff] hover:bg-[#1b4fd8] text-white text-xs font-bold rounded-xl shadow cursor-pointer"
            >
              Štampaj / Snimi kao PDF
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
            >
              Zatvori
            </button>
          </div>
        </div>

        {/* Printable Paper Canvas (A4 Styled) */}
        <div className="p-8 sm:p-12 overflow-y-auto bg-white text-slate-900 text-xs leading-relaxed space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-6 border-b-2 border-[#2761ff]">
            <div className="flex items-center gap-4">
              <img
                src="/peoplepro-logo.png"
                alt="People Pro"
                className="h-14 w-auto object-contain"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = 'https://www.peoplepro.rs/wp-content/uploads/2025/11/PeopleProLogo-1.png';
                }}
              />
              <div>
                <h1 className="text-xl font-black tracking-tight text-slate-900">
                  PEOPLE PRO HR KONSALTING
                </h1>
                <p className="text-xs text-[#2761ff] font-bold">
                  HR DIJAGNOZA — IZVEŠTAJ ZA PRAVNA LICA
                </p>
                <p className="text-[11px] text-slate-500">
                  www.peoplepro.rs • dragana.peoplepro@gmail.com • +381 60 131 72 82
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Datum analize:</span>
              <span className="font-bold text-xs text-slate-800">
                {new Date(submittedAt).toLocaleDateString('sr-RS', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                })}
              </span>
              <span className="block text-[10px] text-slate-400 mt-1">ID: {client.id}</span>
            </div>
          </div>

          {/* Company Details Box */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Profil Klijenta (Pravno lice)
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Naziv kompanije:</span>
                <span className="font-bold text-slate-900">{companyInfo.companyName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">PIB / Matični broj:</span>
                <span className="font-semibold text-slate-800">{companyInfo.pib} {companyInfo.maticniBroj ? `/ ${companyInfo.maticniBroj}` : ''}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Delatnost / Industrija:</span>
                <span className="font-semibold text-slate-800">{companyInfo.industry}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Broj zaposlenih:</span>
                <span className="font-semibold text-slate-800">{companyInfo.employeeCount}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Kontakt osoba:</span>
                <span className="font-semibold text-slate-800">{companyInfo.contactPerson} ({companyInfo.contactRole})</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Kontakt podaci:</span>
                <span className="font-semibold text-slate-800">{companyInfo.email} • {companyInfo.phone}</span>
              </div>
            </div>
          </div>

          {/* Executive Overall Score */}
          <div className="p-5 rounded-xl bg-[#eef5ff] border border-blue-200 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-[#2761ff] uppercase tracking-wider block">
                Rezultat HR Dijagnoze
              </span>
              <h3 className="text-lg font-black text-slate-900 mt-0.5">
                Ukupni Indeks HR Zrelosti: {scores.overallScore}% ({scores.overallRiskLevel} rizik)
              </h3>
              <p className="text-xs text-slate-600 mt-1 max-w-xl">
                {scores.executiveSummary}
              </p>
            </div>

            <div className="text-right shrink-0 ml-4">
              <div className="text-3xl font-black text-[#2761ff]">
                {scores.overallScore}%
              </div>
              <span className="text-[10px] font-bold text-red-600 block">
                {scores.redPoints.length} crvene tačke
              </span>
            </div>
          </div>

          {/* 10 Dimensions Summary Table */}
          <div>
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Ocene po 10 ključnih organizacionih oblasti
            </h2>
            <table className="w-full text-left border border-slate-200">
              <thead className="bg-slate-100 text-[10px] font-bold uppercase text-slate-600">
                <tr>
                  <th className="p-2 border-b">#</th>
                  <th className="p-2 border-b">Oblast analize</th>
                  <th className="p-2 border-b">Ostvaren skor</th>
                  <th className="p-2 border-b">Status rizika</th>
                  <th className="p-2 border-b">Opis zatečenog stanja</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-[11px]">
                {DIAGNOSTIC_CATEGORIES.map((cat) => {
                  const s = scores.categoryScores[cat.id] || 0;
                  const isRed = s < 50;
                  const isYellow = s >= 50 && s < 75;

                  return (
                    <tr key={cat.id} className={isRed ? 'bg-red-50/40' : ''}>
                      <td className="p-2 font-bold text-slate-500">{cat.number}</td>
                      <td className="p-2 font-bold text-slate-900">{cat.title}</td>
                      <td className="p-2 font-black">
                        <span className={isRed ? 'text-red-600' : isYellow ? 'text-amber-600' : 'text-emerald-600'}>
                          {s}%
                        </span>
                      </td>
                      <td className="p-2">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          isRed ? 'bg-red-100 text-red-800' : isYellow ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {isRed ? 'CRVENA TAČKA' : isYellow ? 'Žuta zona' : 'Stabilno'}
                        </span>
                      </td>
                      <td className="p-2 text-slate-600">
                        {isRed ? cat.redFlagWarning : cat.description}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Red Points Detail if any */}
          {scores.redPoints.length > 0 && (
            <div className="page-break space-y-3 pt-4">
              <h2 className="text-xs font-bold text-red-700 uppercase tracking-wider">
                Detaljna analiza detektovanih crvenih tačaka (&lt;50%)
              </h2>
              <div className="space-y-3">
                {scores.redPoints.map((rp, idx) => (
                  <div key={idx} className="p-3.5 rounded-lg border border-red-200 bg-red-50/50 space-y-1">
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>{idx + 1}. {rp.categoryTitle}</span>
                      <span className="text-red-600">{rp.score}%</span>
                    </div>
                    <p className="text-slate-700"><strong>Problem:</strong> {rp.critique}</p>
                    <p className="text-red-800"><strong>Rizik po biznis:</strong> {rp.dangerImpact}</p>
                    <p className="text-[#2761ff]"><strong>People Pro preporučena akcija:</strong> {rp.recommendedAction}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Consulting Package Recommendation & Signature */}
          <div className="p-5 rounded-xl border border-slate-300 bg-slate-50 space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Preporučeni People Pro paket: {scores.recommendedTier}
            </h3>
            <p className="text-slate-700">
              {scores.tierReason}
            </p>
          </div>

          <div className="pt-8 flex items-end justify-between border-t border-slate-200">
            <div>
              <p className="text-xs font-bold text-slate-900">People Pro HR Konsalting</p>
              <p className="text-[11px] text-slate-500">Beograd, Srbija • PIB: 114631252</p>
              <p className="text-[11px] text-slate-500">www.peoplepro.rs</p>
            </div>

            <div className="text-right">
              <div className="h-10 border-b border-slate-400 w-48 mb-1"></div>
              <p className="font-bold text-xs text-slate-900">Dragana Stanimirović</p>
              <p className="text-[11px] text-slate-500">Osnivač i HR konsultant</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
