import React, { useState, useMemo } from 'react';
import { ClientSubmission, ClientStatus } from '../types';
import { exportClientsToExcel, exportSingleClientToExcel } from '../utils/excelExport';
import {
  Database,
  FileSpreadsheet,
  Search,
  Filter,
  Eye,
  Mail,
  Trash2,
  Building2,
  Users,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Phone,
  FileText,
  PlusCircle,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  Sparkles,
  ArrowUpDown,
  Download,
  ShieldCheck,
  Video,
  Clock,
  Share2,
  Check,
  CalendarPlus,
  Loader2
} from 'lucide-react';
import { generateClientResultPDF, downloadClientPDF } from '../utils/pdfGenerator';
import { GoogleSignInButton } from './GoogleSignInButton';
import { getAccessToken } from '../lib/googleAuth';
import { createGoogleCalendarEvent, generateGoogleCalendarWebUrl, downloadIcsCalendarFile } from '../lib/calendarService';
import { updateSubmissionBookingInFirestore } from '../lib/firebase';
import { SmtpSettingsModal } from './SmtpSettingsModal';
import { buildClientEmailContent } from '../utils/emailService';

interface AdminDashboardProps {
  clients: ClientSubmission[];
  onSelectClient: (client: ClientSubmission) => void;
  onOpenEmailModal: (client: ClientSubmission) => void;
  onUpdateClientStatus: (clientId: string, status: ClientStatus) => void;
  onUpdateClientNotes: (clientId: string, notes: string) => void;
  onDeleteClient: (clientId: string) => void;
  onNewAssessment: () => void;
  onResetToSampleData: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  clients,
  onSelectClient,
  onOpenEmailModal,
  onUpdateClientStatus,
  onUpdateClientNotes,
  onDeleteClient,
  onNewAssessment,
  onResetToSampleData
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<'all' | 'critical' | 'moderate' | 'stable'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [industryFilter, setIndustryFilter] = useState<string>('all');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState<string>('');
  const [inspectClient, setInspectClient] = useState<ClientSubmission | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [showSmtpModal, setShowSmtpModal] = useState(false);

  const handleSyncBookingToGoogle = async (client: ClientSubmission) => {
    if (!client.booking) return;
    setSyncingId(client.id);
    try {
      const token = await getAccessToken();
      if (!token) {
        alert('Molimo Vas da prvo povežete Google nalog klikom na dugme "Poveži Google (Kalendar & Gmail)" u vrhu ekrana.');
        return;
      }
      const res = await createGoogleCalendarEvent(client, client.booking, token);
      if (res.success && res.eventId) {
        const updatedBooking = {
          ...client.booking,
          calendarEventId: res.eventId,
          googleMeetLink: res.meetLink,
          calendarHtmlLink: res.htmlLink
        };
        await updateSubmissionBookingInFirestore(client.id, updatedBooking);
        alert(`Uspeh! Termin je upisan u Vaš Google kalendar (${client.booking.date} u ${client.booking.timeSlot}) i generisan je Google Meet link!`);
      } else {
        alert('Greška pri upisu u kalendar: ' + (res.error || 'Pokušajte ponovo.'));
      }
    } catch (e: any) {
      alert('Greška: ' + e.message);
    } finally {
      setSyncingId(null);
    }
  };

  const handleCopyPublicLink = () => {
    const publicUrl = window.location.origin;
    navigator.clipboard.writeText(publicUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  // Stats calculation
  const totalClients = clients.length;
  const avgScore = totalClients > 0
    ? Math.round(clients.reduce((acc, c) => acc + c.scores.overallScore, 0) / totalClients)
    : 0;
  const totalRedPoints = clients.reduce((acc, c) => acc + c.scores.redPoints.length, 0);
  const criticalClientsCount = clients.filter(c => c.scores.redPoints.length > 0).length;
  const newSubmissionsCount = clients.filter(c => c.status === 'nova_prijava').length;
  const bookedConsultationsCount = clients.filter(c => !!c.booking || c.status === 'ugovoren_sastanak').length;
  const bookedClients = useMemo(() => {
    return clients.filter(c => !!c.booking);
  }, [clients]);

  // Filtered clients
  const filteredClients = useMemo(() => {
    return clients.filter(c => {
      // Search filter
      const term = searchTerm.toLowerCase().trim();
      const matchSearch =
        !term ||
        c.companyInfo.companyName.toLowerCase().includes(term) ||
        c.companyInfo.pib.toLowerCase().includes(term) ||
        c.companyInfo.contactPerson.toLowerCase().includes(term) ||
        c.companyInfo.email.toLowerCase().includes(term) ||
        c.companyInfo.city.toLowerCase().includes(term);

      // Risk filter
      let matchRisk = true;
      if (riskFilter === 'critical') matchRisk = c.scores.overallScore < 50 || c.scores.redPoints.length >= 2;
      else if (riskFilter === 'moderate') matchRisk = c.scores.overallScore >= 50 && c.scores.overallScore < 75;
      else if (riskFilter === 'stable') matchRisk = c.scores.overallScore >= 75;

      // Status filter
      const matchStatus = statusFilter === 'all' || c.status === statusFilter;

      // Industry filter
      const matchIndustry = industryFilter === 'all' || c.companyInfo.industry === industryFilter;

      return matchSearch && matchRisk && matchStatus && matchIndustry;
    });
  }, [clients, searchTerm, riskFilter, statusFilter, industryFilter]);

  const handleExportAll = () => {
    exportClientsToExcel(filteredClients, 'People_Pro_HR_Baza_Klijenata.xlsx');
  };

  const handleSaveNote = (clientId: string) => {
    onUpdateClientNotes(clientId, noteDraft);
    setEditingNoteId(null);
  };

  const statusLabels: Record<ClientStatus, { label: string; color: string }> = {
    nova_prijava: { label: 'Nova prijava', color: 'bg-blue-100 text-[#2761ff] border-blue-200' },
    pregledano: { label: 'Pregledano', color: 'bg-purple-100 text-purple-700 border-purple-200' },
    poslat_izvestaj: { label: 'Poslat izveštaj', color: 'bg-amber-100 text-amber-800 border-amber-200' },
    ugovoren_sastanak: { label: 'Ugovoren sastanak', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    arhivirano: { label: 'Arhivirano', color: 'bg-slate-100 text-slate-600 border-slate-200' }
  };

  // Unique industries
  const industries = useMemo(() => {
    const set = new Set<string>();
    clients.forEach(c => set.add(c.companyInfo.industry));
    return Array.from(set);
  }, [clients]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#2761ff] flex items-center justify-center font-bold">
              <Database className="w-4 h-4" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Baza Klijenata & CRM Dijagnostika
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-[#2761ff]">
              People Pro Panel
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Upravljanje prijavama pravnih lica, filtriranje crvenih tačaka, izvoz u Excel i priprema personalizovanih ponuda.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <GoogleSignInButton />

          <button
            type="button"
            onClick={() => setShowSmtpModal(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm border border-slate-300 shadow-2xs transition-colors cursor-pointer"
            title="Podešavanje automatskog slanja izveštaja i obaveštenja (Gmail / SMTP)"
          >
            <Mail className="w-4 h-4 text-[#2761ff]" />
            <span>Podešavanje Email-a</span>
          </button>

          <button
            type="button"
            onClick={handleCopyPublicLink}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#2761ff] border border-blue-200 font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
            title="Kopiraj link za deljenje klijentima"
          >
            {copiedLink ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Link kopiran!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                <span>Kopiraj link za klijente</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleExportAll}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
            title="Preuzmite kompletnu bazu klijenata i detaljne analize u Excel formatu"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Izvezi u Excel ({filteredClients.length})</span>
          </button>

          <button
            type="button"
            onClick={onNewAssessment}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#2761ff] hover:bg-[#1b4fd8] text-white font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Nova prijava</span>
          </button>

          <button
            type="button"
            onClick={onResetToSampleData}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-600 font-semibold text-xs transition-colors cursor-pointer"
            title="Resetuj na ogledne klijente sa realističnim podacima"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Učitaj primere</span>
          </button>
        </div>
      </div>

      {/* KPI Counters Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-400 block">Ukupno klijenata</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-slate-900">{totalClients}</span>
            <span className="text-[11px] font-semibold text-slate-500">kompanija</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-400 block">Prosečan HR indeks</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-[#2761ff]">{avgScore}%</span>
            <span className="text-[11px] font-semibold text-slate-500">zrelost</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-red-200 bg-red-50/30 shadow-2xs">
          <span className="text-xs font-semibold text-red-600 block">Crvene tačke ukupno</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-red-600">{totalRedPoints}</span>
            <span className="text-[11px] font-semibold text-red-700">rizika</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/30 shadow-2xs">
          <span className="text-xs font-semibold text-amber-700 block">Kritične firme</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-amber-700">{criticalClientsCount}</span>
            <span className="text-[11px] font-semibold text-amber-800">zahteva START</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-blue-200 bg-blue-50/30 shadow-2xs">
          <span className="text-xs font-semibold text-blue-700 block">Nove prijave</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-blue-700">{newSubmissionsCount}</span>
            <span className="text-[11px] font-semibold text-blue-800">čeka izveštaj</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 shadow-2xs">
          <span className="text-xs font-semibold text-emerald-700 block">Zakazane konsultacije</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-emerald-700">{bookedConsultationsCount}</span>
            <span className="text-[11px] font-semibold text-emerald-800">Google Meet/Cal</span>
          </div>
        </div>
      </div>

      {/* DEDICATED SCHEDULED CONSULTATIONS SECTION FOR DRAGANA */}
      {bookedClients.length > 0 && (
        <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-900 rounded-2xl border-2 border-emerald-500/50 p-5 sm:p-6 text-white shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-emerald-500/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md ring-2 ring-emerald-400/40">
                <Calendar className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-black tracking-tight text-white">
                    Zakazani termini za konsultacije
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/30 text-emerald-300 border border-emerald-500/50">
                    {bookedClients.length} {bookedClients.length === 1 ? 'termin' : 'termina'}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Kliknite na "Upisi u Google kalendar" za automatski 1-klik unos sastanka u Vaš Google kalendar sa klijentom.
                </p>
              </div>
            </div>

            <div className="text-xs text-emerald-400 font-semibold bg-emerald-900/40 px-3 py-1.5 rounded-xl border border-emerald-500/30">
              Konsultant: Dragana Stanimirović (+381 60 131 72 82)
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {bookedClients.map((client) => {
              if (!client.booking) return null;
              const b = client.booking;
              const googleCalWebUrl = generateGoogleCalendarWebUrl(b, client, b.googleMeetLink);
              const isEventSynced = !!b.calendarEventId;

              return (
                <div
                  key={client.id}
                  className="bg-slate-800/80 hover:bg-slate-800 border border-emerald-500/40 rounded-xl p-4 transition-all shadow-md flex flex-col justify-between"
                >
                  <div>
                    {/* Date, Time & Meeting Type */}
                    <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-700/60">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-black text-xs shadow-xs flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{b.date} u {b.timeSlot}</span>
                        </span>
                        <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1 bg-slate-700/60 px-2 py-0.5 rounded">
                          {b.meetingType === 'google_meet' ? (
                            <>
                              <Video className="w-3.5 h-3.5 text-blue-400" />
                              <span>Google Meet</span>
                            </>
                          ) : (
                            <>
                              <Phone className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Telefon</span>
                            </>
                          )}
                        </span>
                      </div>

                      {isEventSynced ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>U kalendaru</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
                          Čeka upis u kalendar
                        </span>
                      )}
                    </div>

                    {/* Company & Client Info */}
                    <div className="mt-3">
                      <h4 className="text-sm font-black text-white hover:text-emerald-300 transition-colors cursor-pointer" onClick={() => onSelectClient(client)}>
                        {client.companyInfo.companyName}
                      </h4>
                      <div className="text-xs text-slate-300 mt-1 space-y-0.5">
                        <p>
                          <strong className="text-slate-200">Kontakt:</strong> {b.clientName}
                        </p>
                        <p className="flex items-center gap-3">
                          <a href={`tel:${b.clientPhone}`} className="hover:text-emerald-400 transition-colors flex items-center gap-1">
                            <Phone className="w-3 h-3 text-emerald-400" />
                            <span>{b.clientPhone}</span>
                          </a>
                          <span>•</span>
                          <a href={`mailto:${b.clientEmail}`} className="hover:text-blue-400 transition-colors flex items-center gap-1">
                            <Mail className="w-3 h-3 text-blue-400" />
                            <span>{b.clientEmail}</span>
                          </a>
                        </p>
                      </div>

                      {b.discussionTopic && (
                        <div className="mt-2 text-[11px] bg-slate-900/60 p-2 rounded-lg border border-slate-700/50 text-slate-300">
                          <span className="text-slate-400 font-semibold block text-[10px] uppercase">Tema razgovora:</span>
                          <span className="italic">"{b.discussionTopic}"</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 1-Click Action Buttons */}
                  <div className="mt-4 pt-3 border-t border-slate-700/60 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {/* Direct 1-Click Google Calendar Web URL (Always works 100%) */}
                      <a
                        href={googleCalWebUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer"
                        title="Otvori Google Kalendar sa popunjenim podacima termina i Google Meet linkom"
                      >
                        <CalendarPlus className="w-3.5 h-3.5" />
                        <span>Upisi u Google kalendar (1 klik)</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>

                      {/* API Direct Sync Button */}
                      <button
                        type="button"
                        onClick={() => handleSyncBookingToGoogle(client)}
                        disabled={syncingId === client.id}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold text-xs transition-colors cursor-pointer disabled:opacity-60"
                        title="Upiši direktno preko povezanog Google naloga (API)"
                      >
                        {syncingId === client.id ? (
                          <Loader2 className="w-3 h-3 animate-spin text-emerald-400" />
                        ) : (
                          <RefreshCw className="w-3 h-3 text-blue-400" />
                        )}
                        <span>API sinhronizacija</span>
                      </button>

                      {/* Download ICS file */}
                      <button
                        type="button"
                        onClick={() => downloadIcsCalendarFile(b, client, b.googleMeetLink)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
                        title="Preuzmi .ics fajl za Outlook ili kalendar na telefonu"
                      >
                        <Download className="w-3 h-3" />
                        <span>.ics</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => onSelectClient(client)}
                      className="text-xs text-blue-400 hover:text-blue-300 font-semibold underline cursor-pointer"
                    >
                      Detalji dijagnoze →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search bar */}
          <div className="md:col-span-5 relative">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Pretraži po nazivu firme, PIB-u, kontakt osobi ili gradu..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2761ff]"
            />
          </div>

          {/* Risk Level Filter */}
          <div className="md:col-span-3">
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2761ff]"
            >
              <option value="all">Svi nivoi rizika</option>
              <option value="critical">🔴 Kritičan rizik / Crvene tačke</option>
              <option value="moderate">🟡 Umeren rizik (50-74%)</option>
              <option value="stable">🟢 Stabilne kompanije (75%+)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="md:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2761ff]"
            >
              <option value="all">Svi statusi</option>
              <option value="nova_prijava">Nova prijava</option>
              <option value="pregledano">Pregledano</option>
              <option value="poslat_izvestaj">Poslat izveštaj</option>
              <option value="ugovoren_sastanak">Ugovoren sastanak</option>
              <option value="arhivirano">Arhivirano</option>
            </select>
          </div>

          {/* Industry Filter */}
          <div className="md:col-span-2">
            <select
              value={industryFilter}
              onChange={(e) => setIndustryFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2761ff]"
            >
              <option value="all">Sve industrije</option>
              {industries.map(ind => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter summary line */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span>
            Prikazano <strong>{filteredClients.length}</strong> od ukupno {totalClients} pravnih lica
          </span>
          {(searchTerm || riskFilter !== 'all' || statusFilter !== 'all' || industryFilter !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setRiskFilter('all');
                setStatusFilter('all');
                setIndustryFilter('all');
              }}
              className="text-[#2761ff] font-semibold hover:underline"
            >
              Poništi filtere
            </button>
          )}
        </div>
      </div>

      {/* Main Clients Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Pravno lice / Firma</th>
                <th className="py-3 px-4">Kontakt & Lokacija</th>
                <th className="py-3 px-4">HR Zrelost & Rizik</th>
                <th className="py-3 px-4">Crvene tačke</th>
                <th className="py-3 px-4">Paket</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Datum</th>
                <th className="py-3 px-4 text-right">Akcije</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredClients.length > 0 ? (
                filteredClients.map((client) => {
                  const redPts = client.scores.redPoints.length;
                  const isRed = client.scores.overallScore < 50 || redPts > 0;
                  const currentStatus = statusLabels[client.status] || statusLabels.nova_prijava;

                  return (
                    <tr
                      key={client.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Company Info */}
                      <td className="py-3.5 px-4">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className="font-bold text-sm text-slate-900 group-hover:text-[#2761ff] transition-colors cursor-pointer"
                              onClick={() => onSelectClient(client)}
                            >
                              {client.companyInfo.companyName}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                downloadClientPDF(client, { forAdmin: false });
                              }}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 hover:bg-blue-100 text-[#2761ff] border border-blue-200 text-[10px] font-bold shadow-2xs transition-all cursor-pointer"
                              title={
                                client.reportPdfDataUrl
                                  ? 'Preuzmi sačuvani PDF izveštaj iz baze'
                                  : 'Preuzmi PDF sa zahvalnicom (verzija za klijenta)'
                              }
                            >
                              <Download className="w-3 h-3 text-[#2761ff]" />
                              <span>PDF</span>
                              {client.reportPdfDataUrl && (
                                <span
                                  className="w-1.5 h-1.5 rounded-full bg-emerald-500"
                                  title="PDF je bezbedno sačuvan u bazi"
                                />
                              )}
                            </button>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                            <span>PIB: {client.companyInfo.pib}</span>
                            <span>•</span>
                            <span>{client.companyInfo.industry}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                              {client.companyInfo.employeeCount} zaposlenih
                            </span>
                            {client.reportPdfDataUrl && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                                PDF u bazi
                              </span>
                            )}
                          </div>
                          {client.booking && (
                            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                                <Calendar className="w-3 h-3 text-emerald-700" />
                                <span>{client.booking.date} u {client.booking.timeSlot}</span>
                              </span>
                              {client.booking.googleMeetLink ? (
                                <a
                                  href={client.booking.googleMeetLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-[#2761ff] hover:underline"
                                  title="Otvori Google Meet link"
                                >
                                  <Video className="w-2.5 h-2.5" />
                                  <span>Meet</span>
                                </a>
                              ) : (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSyncBookingToGoogle(client);
                                  }}
                                  disabled={syncingId === client.id}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 transition-colors cursor-pointer"
                                  title="Upisuje ovaj termin u Vaš Google kalendar i generiše Google Meet link"
                                >
                                  {syncingId === client.id ? (
                                    <Loader2 className="w-2.5 h-2.5 animate-spin" />
                                  ) : (
                                    <CalendarPlus className="w-2.5 h-2.5" />
                                  )}
                                  <span>Upiši u Kalendar</span>
                                </button>
                              )}
                              {client.booking.calendarEventId && (
                                <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                                  ✓ U kalendaru
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Contact & City */}
                      <td className="py-3.5 px-4 text-xs">
                        <div className="font-semibold text-slate-800">
                          {client.companyInfo.contactPerson}
                        </div>
                        <div className="text-slate-500 text-[11px]">
                          {client.companyInfo.contactRole}
                        </div>
                        <div className="text-slate-400 text-[11px] mt-0.5 flex items-center gap-1">
                          <a
                            href={`mailto:${client.companyInfo.email}`}
                            className="hover:text-[#2761ff] underline"
                          >
                            {client.companyInfo.email}
                          </a>
                        </div>
                        <div className="text-slate-400 text-[11px]">
                          {client.companyInfo.phone} • {client.companyInfo.city}
                        </div>
                      </td>

                      {/* HR Score */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-black text-slate-900">
                            {client.scores.overallScore}%
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isRed
                                ? 'bg-red-100 text-red-700'
                                : client.scores.overallScore < 75
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {client.scores.overallRiskLevel}
                          </span>
                        </div>
                        <div className="w-20 bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1.5">
                          <div
                            className={`h-full ${
                              isRed
                                ? 'bg-red-500'
                                : client.scores.overallScore < 75
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${client.scores.overallScore}%` }}
                          />
                        </div>
                      </td>

                      {/* Red Points */}
                      <td className="py-3.5 px-4">
                        {redPts > 0 ? (
                          <div
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-50 border border-red-200 text-red-700 font-bold text-xs cursor-pointer hover:bg-red-100 transition-colors"
                            onClick={() => setInspectClient(client)}
                            title="Klikni za prikaz crvenih tačaka"
                          >
                            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                            <span>{redPts} crvene tačke</span>
                          </div>
                        ) : (
                          <span className="text-emerald-600 text-xs font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Nema rizika
                          </span>
                        )}
                      </td>

                      {/* Recommended Tier */}
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-blue-50 text-[#2761ff] border border-blue-200/80">
                          {client.scores.recommendedTier}
                        </span>
                      </td>

                      {/* Status Selector */}
                      <td className="py-3.5 px-4">
                        <select
                          value={client.status}
                          onChange={(e) => onUpdateClientStatus(client.id, e.target.value as ClientStatus)}
                          className={`px-2 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${currentStatus.color}`}
                        >
                          <option value="nova_prijava">Nova prijava</option>
                          <option value="pregledano">Pregledano</option>
                          <option value="poslat_izvestaj">Poslat izveštaj</option>
                          <option value="ugovoren_sastanak">Ugovoren sastanak</option>
                          <option value="arhivirano">Arhivirano</option>
                        </select>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-[11px] text-slate-400 whitespace-nowrap">
                        {new Date(client.submittedAt).toLocaleDateString('sr-RS', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onSelectClient(client)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-[#2761ff] hover:bg-blue-50 transition-colors"
                            title="Otvori detaljan radar i dijagnozu"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* 1-Click Direct Gmail Compose Link (Always works 100%, zero blocks) */}
                          {(() => {
                            const mailContent = buildClientEmailContent(client);
                            const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(client.companyInfo.email)}&su=${encodeURIComponent(mailContent.subject)}&body=${encodeURIComponent(mailContent.body)}`;
                            return (
                              <a
                                href={gmailUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors inline-flex items-center"
                                title="Otvori u mom Gmail-u sa popunjenim izveštajem (1 klik)"
                              >
                                <Mail className="w-4 h-4 text-red-500" />
                              </a>
                            );
                          })()}

                          <button
                            type="button"
                            onClick={() => onOpenEmailModal(client)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                            title="Pregledaj i izmeni tekst mejla pre slanja"
                          >
                            <FileText className="w-4 h-4 text-[#2761ff]" />
                          </button>

                          <button
                            type="button"
                            onClick={() => exportSingleClientToExcel(client)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                            title="Izvezi klijenta u Excel (.xlsx)"
                          >
                            <FileSpreadsheet className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => downloadClientPDF(client, { forAdmin: false })}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-[#2761ff] hover:bg-blue-50 transition-colors relative cursor-pointer"
                            title={
                              client.reportPdfDataUrl
                                ? 'Preuzmi sačuvani PDF izveštaj iz baze'
                                : 'Preuzmi PDF sa zahvalnicom (verzija za klijenta, bez preporuka paketa)'
                            }
                          >
                            <Download className="w-4 h-4" />
                            {client.reportPdfDataUrl && (
                              <span
                                className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border border-white"
                                title="PDF je automatski sačuvan u bazi"
                              />
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Da li ste sigurni da želite da obrišete klijenta ${client.companyInfo.companyName}?`)) {
                                onDeleteClient(client.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Obriši klijenta"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Database className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="font-semibold text-sm">Nema pronađenih klijenata po zadatim kriterijumima.</p>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchTerm('');
                        setRiskFilter('all');
                      }}
                      className="mt-2 text-xs font-bold text-[#2761ff] hover:underline"
                    >
                      Resetuj pretragu
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Inspection Modal for Red Points Drilldown */}
      {inspectClient && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-red-600 uppercase">
                  Brzi uvid u crvene tačke
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  {inspectClient.companyInfo.companyName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectClient(null)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Scheduled Consultation Details if booked */}
            {inspectClient.booking && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-extrabold text-slate-900 block">
                        Zakazane Strateške Konsultacije (30 min)
                      </span>
                      <span className="text-emerald-800 font-bold">
                        {inspectClient.booking.date} u {inspectClient.booking.timeSlot}
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[11px] font-extrabold bg-emerald-200 text-emerald-900 uppercase">
                    {inspectClient.booking.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px] text-slate-700">
                  <div>
                    <span className="font-semibold text-slate-500">Format: </span>
                    <span className="font-bold">
                      {inspectClient.booking.meetingType === 'google_meet'
                        ? 'Google Meet Video Poziv'
                        : 'Telefonski poziv'}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-500">Kontakt: </span>
                    <span>{inspectClient.booking.clientName} ({inspectClient.booking.clientPhone})</span>
                  </div>
                </div>

                {inspectClient.booking.discussionTopic && (
                  <div className="text-[11px] text-slate-600 bg-white/70 p-2 rounded-lg border border-slate-200">
                    <span className="font-bold text-slate-700">Fokus razgovora: </span>
                    <span>{inspectClient.booking.discussionTopic}</span>
                  </div>
                )}

                {inspectClient.booking.googleMeetLink && (
                  <div className="pt-1 flex items-center gap-2">
                    <a
                      href={inspectClient.booking.googleMeetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] transition-colors"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Otvori Google Meet</span>
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Legal / ZZPL Status */}
            {(inspectClient.dataPrivacyConsent || inspectClient.companyInfo.dataPrivacyConsent) && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  ZZPL Saglasnost potvrđena: Klijent je prihvatio obradu podataka o ličnosti (
                  {inspectClient.consentTimestamp
                    ? new Date(inspectClient.consentTimestamp).toLocaleDateString('sr-RS', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : 'Evidentirano'}
                  )
                </span>
              </div>
            )}

            <div className="space-y-3">
              {inspectClient.scores.redPoints.map((rp, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-red-50/80 border border-red-200 text-xs space-y-1.5">
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span>{rp.categoryTitle}</span>
                    <span className="text-red-600">{rp.score}%</span>
                  </div>
                  <p className="text-slate-700">{rp.critique}</p>
                  <p className="text-red-700 font-semibold">{rp.dangerImpact}</p>
                  <p className="text-[#2761ff] font-medium pt-1">
                    Preporuka: {rp.recommendedAction}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100 flex-wrap">
              <button
                type="button"
                onClick={() => downloadClientPDF(inspectClient, { forAdmin: false })}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#2761ff] border border-blue-200 text-xs font-bold transition-colors cursor-pointer"
                title="Preuzmi sačuvani PDF izveštaj"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Preuzmi PDF izveštaj</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const target = inspectClient;
                    setInspectClient(null);
                    onSelectClient(target);
                  }}
                  className="px-4 py-2 bg-[#2761ff] hover:bg-[#1b4fd8] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Otvori kompletan radar
                </button>
                <button
                  type="button"
                  onClick={() => setInspectClient(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Zatvori
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SMTP Email Settings Modal */}
      <SmtpSettingsModal
        isOpen={showSmtpModal}
        onClose={() => setShowSmtpModal(false)}
      />
    </div>
  );
};
