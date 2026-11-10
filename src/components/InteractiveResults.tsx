import React, { useState } from 'react';
import { ClientSubmission, ConsultationBooking } from '../types';
import { DIAGNOSTIC_CATEGORIES } from '../data/diagnosticData';
import { RadarChart } from './RadarChart';
import { exportSingleClientToExcel } from '../utils/excelExport';
import {
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Mail,
  Printer,
  ChevronDown,
  ChevronUp,
  Building2,
  Calendar,
  Sparkles,
  Phone,
  ArrowRight,
  Database,
  Share2,
  ShieldAlert,
  HelpCircle,
  Download,
  FileCheck,
  Send,
  Loader2
} from 'lucide-react';
import { generateClientResultPDF, downloadClientPDF } from '../utils/pdfGenerator';
import { dispatchDiagnosticReportEmail, buildClientEmailContent } from '../utils/emailService';
import { ConsultationBookingWidget } from './ConsultationBookingWidget';

interface InteractiveResultsProps {
  client: ClientSubmission;
  onOpenEmailModal: (client: ClientSubmission) => void;
  onGoToDatabase: () => void;
  onTriggerNotification: (client: ClientSubmission) => void;
  onPrintReport: () => void;
  isAdmin?: boolean;
  onSaveBooking?: (booking: ConsultationBooking) => Promise<void>;
}

export const InteractiveResults: React.FC<InteractiveResultsProps> = ({
  client,
  onOpenEmailModal,
  onGoToDatabase,
  onTriggerNotification,
  onPrintReport,
  isAdmin = false,
  onSaveBooking
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const [pdfDownloaded, setPdfDownloaded] = useState<boolean>(false);
  const [emailSending, setEmailSending] = useState<boolean>(false);
  const [emailNotification, setEmailNotification] = useState<string | null>(null);
  const [currentBooking, setCurrentBooking] = useState<ConsultationBooking | undefined>(
    client.booking
  );

  const handleBookingSaved = async (booking: ConsultationBooking) => {
    setCurrentBooking(booking);
    if (onSaveBooking) {
      await onSaveBooking(booking);
    }
  };

  // Always ensure client results start cleanly at the top of the viewport
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [client.id]);


  const { scores, companyInfo, submittedAt } = client;
  const redCount = scores.redPoints.length;
  const yellowCount = scores.yellowPoints.length;
  const greenCount = scores.greenPoints.length;

  const toggleExpand = (catId: string) => {
    setExpandedCards(prev => ({ ...prev, [catId]: !prev[catId] }));
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Kritičan':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'Umeren':
        return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'Stabilan':
        return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      default:
        return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const handleDownloadExcel = () => {
    exportSingleClientToExcel(client);
  };

  const handleDownloadPdf = (forAdmin: boolean = false) => {
    try {
      downloadClientPDF(client, { forAdmin });
      setPdfDownloaded(true);
      setTimeout(() => setPdfDownloaded(false), 3000);
    } catch (err) {
      console.error('Greška pri preuzimanju PDF-a:', err);
    }
  };

  const handleSendEmailDirect = async () => {
    setEmailSending(true);
    setEmailNotification(null);
    try {
      const res = await dispatchDiagnosticReportEmail(client);
      setEmailNotification(res.message);
    } catch (err) {
      setEmailNotification('Izveštaj je pripremljen za slanje.');
    } finally {
      setEmailSending(false);
    }
  };

  const emailContent = buildClientEmailContent(client);
  const clientMailtoUrl = `mailto:${companyInfo.email}?cc=dragana.peoplepro@gmail.com&subject=${encodeURIComponent(emailContent.subject)}&body=${encodeURIComponent(emailContent.body)}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Client Feedback Banner: Email sent confirmation & instant PDF download */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-emerald-50 rounded-2xl border border-blue-200 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shrink-0 mt-0.5 shadow-xs">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Rezultati dijagnostike i zahvalnica
              </h3>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-100 text-[#2761ff] border border-blue-200">
                {companyInfo.email}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Personalizovani HR sažetak sa preporukama i zahvalnicom Dragane Stanimirović.
            </p>
            {emailNotification && (
              <p className="text-xs font-semibold text-emerald-700 mt-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{emailNotification}</span>
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById('consultation-booking-section');
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            title="Skoči na izbor termina za besplatne konsultacije sa Draganom Stanimirović"
          >
            <Calendar className="w-4 h-4" />
            <span>Zakaži termin (30 min)</span>
          </button>

          <button
            type="button"
            onClick={() => handleDownloadPdf(false)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2761ff] hover:bg-[#1b4fd8] text-white font-bold text-xs shadow transition-all cursor-pointer"
            title="Preuzmite PDF dokument sa osnovnim HR rezultatima i zahvalnicom (jsPDF)"
          >
            {pdfDownloaded ? (
              <>
                <FileCheck className="w-4 h-4 text-emerald-300" />
                <span>PDF preuzet!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Preuzmi PDF</span>
              </>
            )}
          </button>

          <a
            href={clientMailtoUrl}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold text-xs transition-colors cursor-pointer"
            title="Otvori u svom email programu (Gmail, Outlook ili telefon) sa popunjenim izveštajem"
          >
            <Mail className="w-3.5 h-3.5 text-blue-600" />
            <span>Otvori u email programu</span>
          </a>

          <button
            type="button"
            onClick={handleSendEmailDirect}
            disabled={emailSending}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold text-xs transition-colors cursor-pointer disabled:opacity-60"
            title="Ponovo pošalji email klijentu"
          >
            {emailSending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
            ) : (
              <Send className="w-3.5 h-3.5 text-slate-500" />
            )}
            <span>{emailSending ? 'Slanje...' : 'Pošalji ponovo'}</span>
          </button>
        </div>
      </div>

      {/* Top Breadcrumb & Quick Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2761ff] flex items-center justify-center font-bold">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                {companyInfo.companyName}
              </h2>
              <span className="text-xs text-slate-400">PIB: {companyInfo.pib}</span>
            </div>
            <p className="text-xs text-slate-500">
              Kontakt: {companyInfo.contactPerson} ({companyInfo.contactRole}) • {companyInfo.email}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Dedicated jsPDF Download Button */}
          <button
            type="button"
            onClick={() => handleDownloadPdf(false)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2761ff] hover:bg-[#1b4fd8] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            title="Preuzmite PDF izveštaj sa zahvalnicom (jsPDF)"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Preuzmi PDF sa zahvalnicom</span>
          </button>

          {/* Admin-only controls */}
          {isAdmin && (
            <>
              <button
                type="button"
                onClick={() => handleDownloadPdf(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
                title="Preuzmite interni izveštaj za pripremu sastanka (sa preporučenim paketom)"
              >
                <Download className="w-3.5 h-3.5 text-blue-300" />
                <span>Interni PDF (Admin)</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenEmailModal(client)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
                title="Pregledaj i prilagodi tekst imejla za klijenta"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Uredi mejl</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadExcel}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
                title="Preuzmi detaljne podatke u Excel formatu"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Izvoz u Excel</span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={onPrintReport}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
            title="Štampaj ili pregledaj celokupan dokument"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Štampa</span>
          </button>
        </div>
      </div>

      {/* Main KPI Dashboard: 3 Columns */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Overall Score Card */}
        <div className="md:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Indeks HR Zrelosti
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getRiskColor(scores.overallRiskLevel)}`}>
                Rizik: {scores.overallRiskLevel}
              </span>
            </div>

            <div className="flex items-baseline gap-2 mt-4">
              <span className="text-5xl font-black tracking-tight text-slate-900">
                {scores.overallScore}%
              </span>
              <span className="text-xs font-semibold text-slate-400">od 100%</span>
            </div>

            {/* Score progress bar */}
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mt-3">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  scores.overallScore < 50
                    ? 'bg-red-500'
                    : scores.overallScore < 75
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${scores.overallScore}%` }}
              />
            </div>

            <p className="text-xs text-slate-600 mt-4 leading-relaxed">
              {scores.executiveSummary}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-5 mt-5 border-t border-slate-100 text-center">
            <div className="p-2 rounded-xl bg-red-50/70 border border-red-100">
              <span className="text-lg font-black text-red-600">{redCount}</span>
              <span className="block text-[10px] font-bold text-red-800 uppercase">Crvene tačke</span>
            </div>
            <div className="p-2 rounded-xl bg-amber-50/70 border border-amber-100">
              <span className="text-lg font-black text-amber-600">{yellowCount}</span>
              <span className="block text-[10px] font-bold text-amber-800 uppercase">Žute zone</span>
            </div>
            <div className="p-2 rounded-xl bg-emerald-50/70 border border-emerald-100">
              <span className="text-lg font-black text-emerald-600">{greenCount}</span>
              <span className="block text-[10px] font-bold text-emerald-800 uppercase">Stabilno</span>
            </div>
          </div>
        </div>

        {/* Visual Interactive Radar */}
        <div className="md:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col items-center justify-center">
          <div className="w-full flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#2761ff]" />
                <span>Interaktivni radar organizacionog zdravlja</span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Prikaz svih 10 oblasti. Kliknite na bilo koju tačku za detaljnu dijagnostiku.
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-400 hidden sm:inline">
              10 Dimenzija
            </span>
          </div>

          <RadarChart
            categoryScores={scores.categoryScores}
            onSelectCategory={(catId) => {
              setSelectedCategory(catId);
              const element = document.getElementById(`category-${catId}`);
              if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }}
            selectedCategoryId={selectedCategory || undefined}
          />
        </div>
      </div>

      {/* CRVENE TAČKE (RED FLAGS) SECTION */}
      {redCount > 0 ? (
        <div className="bg-red-50/80 rounded-2xl border-2 border-red-300 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold shadow-sm animate-pulse">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-red-900 flex items-center gap-2">
                  <span>IDENTIFIKOVANE CRVENE TAČKE ({redCount})</span>
                  <span className="px-2 py-0.5 rounded text-xs bg-red-200 text-red-800 font-bold uppercase tracking-wider">
                    Hitna intervencija
                  </span>
                </h3>
                <p className="text-xs sm:text-sm text-red-700">
                  Ove oblasti ostvaruju ocenu ispod 50% i predstavljaju direktan rizik po zadržavanje talenata, stabilnost timova i profitabilnost poslovanja.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onOpenEmailModal(client)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow transition-colors self-start sm:self-auto cursor-pointer"
            >
              <Mail className="w-4 h-4" />
              <span>Pošalji plan gašenja požara</span>
            </button>
          </div>

          {/* List of Red Points */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scores.redPoints.map((rp, idx) => (
              <div
                key={rp.categoryId}
                className="bg-white rounded-xl border border-red-200 p-5 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-red-100 text-red-700 font-bold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <h4 className="font-bold text-sm text-slate-900">
                      {rp.categoryTitle}
                    </h4>
                  </div>
                  <span className="px-2 py-0.5 rounded font-black text-xs bg-red-100 text-red-700">
                    {rp.score}%
                  </span>
                </div>

                <div className="text-xs space-y-2">
                  <div>
                    <span className="font-bold text-slate-700 block">Problem:</span>
                    <p className="text-slate-600">{rp.critique}</p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-red-50/70 border border-red-100">
                    <span className="font-bold text-red-800 block">Posledice po biznis:</span>
                    <p className="text-red-700">{rp.dangerImpact}</p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-100">
                    <span className="font-bold text-[#2761ff] block">People Pro savet & rešenje:</span>
                    <p className="text-slate-700 font-medium">{rp.recommendedAction}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-6 flex items-center gap-4 text-emerald-900">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
          <div>
            <h4 className="font-bold text-base">Nema detektovanih crvenih tačaka!</h4>
            <p className="text-xs text-emerald-700">
              Sve ispitivane oblasti su ostvarile ocenu od najmanje 50%. Kompanija ima solidnu stabilnost procesa, a fokus se preporučuje na finu optimizaciju u žutim zonama.
            </p>
          </div>
        </div>
      )}

      {/* CONSULTATION BANNER / ADMIN PACKAGE BANNER */}
      {isAdmin ? (
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/30 text-amber-300 border border-amber-400/30 uppercase tracking-wider">
                [ADMIN UVID] Preporučeni People Pro HR Model
              </span>
              <h3 className="text-2xl font-black mt-2 tracking-tight">
                Paket: <span className="text-blue-300">{scores.recommendedTier}</span>
                {scores.recommendedTier === 'START' && ' — HR Dijagnostika (Hitna intervencija)'}
                {scores.recommendedTier === 'CORE' && ' — HR Sistem & Timska Struktura'}
                {scores.recommendedTier === 'GROW' && ' — Eksterni HR Business Partner'}
              </h3>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-300 block">Konsultant</span>
              <span className="text-sm font-bold text-white">Dragana Stanimirović</span>
              <a
                href="tel:+381601317282"
                className="text-xs text-emerald-300 hover:text-white flex items-center gap-1 justify-end mt-0.5"
              >
                <Phone className="w-3 h-3" />
                +381 60 131 72 82
              </a>
            </div>
          </div>

          <p className="text-sm text-slate-200 leading-relaxed font-normal">
            {scores.tierReason}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => handleDownloadPdf(true)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm border border-slate-600 shadow transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-blue-300" />
              <span>Preuzmi Interni PDF (Admin)</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenEmailModal(client)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#2761ff] hover:bg-[#1b4fd8] text-white font-bold text-xs sm:text-sm shadow transition-all cursor-pointer"
            >
              <Mail className="w-4 h-4" />
              <span>Pošalji mejl klijentu</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/30 text-blue-300 border border-blue-400/30 uppercase tracking-wider">
                People Pro HR Konsalting
              </span>
              <h3 className="text-xl sm:text-2xl font-black mt-2 tracking-tight text-white">
                Zahvalnica & Poziv na Besplatne Strateške Konsultacije
              </h3>
              <p className="text-xs text-blue-200 mt-1 italic">
                „Vaš partner za ljudske resurse sa srcem“
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xs text-slate-300 block">Vaš HR Konsultant</span>
              <span className="text-sm font-bold text-white">Dragana Stanimirović</span>
              <a
                href="tel:+381601317282"
                className="text-xs text-emerald-300 hover:text-white flex items-center gap-1 justify-start sm:justify-end mt-0.5"
              >
                <Phone className="w-3 h-3" />
                +381 60 131 72 82
              </a>
            </div>
          </div>

          <p className="text-sm text-slate-200 leading-relaxed font-normal">
            Hvala Vam na ukazanom poverenju! Prepoznavanje izazova u upravljanju ljudima prvi je i najvažniji korak ka stabilnoj, motivisanoj i profitabilnoj organizaciji. Pozivamo Vas na <strong>besplatne 30-minutne konsultacije</strong> na kojima ćemo zajedno detaljno proći kroz Vaš radar izveštaj i predložiti prioritete skrojene po meri Vašeg tima.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => handleDownloadPdf(false)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#2761ff] hover:bg-[#1b4fd8] text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Preuzmi PDF sa zahvalnicom</span>
            </button>

            <a
              href="tel:+381601317282"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow transition-all"
            >
              <Phone className="w-4 h-4" />
              <span>Pozovi za termin: +381 60 131 72 82</span>
            </a>

            <a
              href="mailto:dragana.peoplepro@gmail.com"
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm border border-white/20 transition-all"
            >
              <Mail className="w-4 h-4 text-blue-300" />
              <span>dragana.peoplepro@gmail.com</span>
            </a>
          </div>
        </div>
      )}

      {/* DIRECT CONSULTATION BOOKING WIDGET (Google Calendar & Meet Integration) */}
      <div id="consultation-booking-section" className="scroll-mt-6">
        <ConsultationBookingWidget
          client={{ ...client, booking: currentBooking || client.booking }}
          onSaveBooking={handleBookingSaved}
          isAdmin={isAdmin}
        />
      </div>

      {/* ALL 10 CATEGORIES DEEP DIVE CARDS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">
            Sveobuhvatna analiza po oblastima (10 Dimenzija)
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            Kliknite za prikaz pitanja i pojedinačnih odgovora
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {DIAGNOSTIC_CATEGORIES.map((cat) => {
            const catScore = scores.categoryScores[cat.id] || 0;
            const isRed = catScore < 50;
            const isYellow = catScore >= 50 && catScore < 75;
            const isGreen = catScore >= 75;
            const isExpanded = !!expandedCards[cat.id];

            return (
              <div
                id={`category-${cat.id}`}
                key={cat.id}
                className={`bg-white rounded-2xl border transition-all ${
                  isRed
                    ? 'border-red-300 ring-1 ring-red-100'
                    : isYellow
                    ? 'border-amber-200'
                    : 'border-slate-200'
                } p-5 flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-400">
                      Oblast {cat.number}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-extrabold ${
                        isRed
                          ? 'bg-red-100 text-red-700'
                          : isYellow
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {catScore}%
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 mb-1">
                    {cat.title}
                  </h4>
                  <p className="text-xs text-slate-500 leading-snug mb-3">
                    {cat.description}
                  </p>

                  {/* Score bar */}
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-3">
                    <div
                      className={`h-full ${
                        isRed ? 'bg-red-500' : isYellow ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${catScore}%` }}
                    />
                  </div>

                  {/* Highlight pill */}
                  <div
                    className={`p-2.5 rounded-xl text-xs ${
                      isRed
                        ? 'bg-red-50 text-red-800 border border-red-100'
                        : isYellow
                        ? 'bg-amber-50 text-amber-800 border border-amber-100'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                    }`}
                  >
                    <span className="font-bold block mb-0.5">
                      {isRed ? 'Kritična tačka' : isYellow ? 'Prostor za razvoj' : 'Jaka tačka'}
                    </span>
                    <p className="text-[11px] leading-tight">
                      {isRed
                        ? cat.redFlagWarning
                        : isYellow
                        ? 'Potrebna standardizacija procesa i uvođenje jasnih merila.'
                        : 'Proces je stabilan i predstavlja dobar temelj za rast.'}
                    </p>
                  </div>
                </div>

                {/* Question breakdown toggle */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => toggleExpand(cat.id)}
                    className="w-full flex items-center justify-between text-xs font-semibold text-slate-600 hover:text-[#2761ff] py-1 cursor-pointer"
                  >
                    <span>Pregled 3 pitanja i odgovora</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {isExpanded && (
                    <div className="mt-2 space-y-2 pt-2 text-xs">
                      {cat.questions.map((q, idx) => {
                        const ansVal = client.answers[q.id];
                        const selectedOpt = q.options.find(o => o.value === ansVal);

                        return (
                          <div key={q.id} className="p-2 rounded-lg bg-slate-50 border border-slate-200/60">
                            <p className="font-semibold text-slate-800 text-[11px]">
                              {idx + 1}. {q.text}
                            </p>
                            <p className="text-[#2761ff] font-medium text-[11px] mt-1">
                              Odgovor: {selectedOpt ? selectedOpt.label : `Ocena ${ansVal}/4`}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
