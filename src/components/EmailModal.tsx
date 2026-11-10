import React, { useState } from 'react';
import { ClientSubmission } from '../types';
import {
  Mail,
  Copy,
  Check,
  Send,
  ExternalLink,
  Building2,
  Phone,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { GoogleSignInButton } from './GoogleSignInButton';
import { dispatchDiagnosticReportEmail, buildClientEmailContent } from '../utils/emailService';
import { isGmailConnected } from '../lib/googleAuth';

interface EmailModalProps {
  client: ClientSubmission;
  onClose: () => void;
  onMarkAsSent: (clientId: string) => void;
}

export const EmailModal: React.FC<EmailModalProps> = ({ client, onClose, onMarkAsSent }) => {
  const [activeTab, setActiveTab] = useState<'klijent' | 'dragana_notifikacija'>('klijent');
  const [copied, setCopied] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [isSendingViaGmail, setIsSendingViaGmail] = useState(false);
  const [gmailStatusText, setGmailStatusText] = useState<string | null>(null);

  const { companyInfo, scores } = client;
  const clientEmailData = buildClientEmailContent(client);
  const clientSubject = clientEmailData.subject;
  const clientBody = clientEmailData.body;

  // Notification for Dragana Stanimirović
  const draganaSubject = `[NOVA HR PRIJAVA] ${companyInfo.companyName} (${scores.overallScore}% - ${scores.redPoints.length} crvene tačke)`;
  const draganaBody = `Zdravo Dragana,

Upravo je stigla nova popunjena HR dijagnostika na portalu People Pro!

🏢 PODACI O PRAVNOM LICU:
• Naziv firme: ${companyInfo.companyName}
• PIB: ${companyInfo.pib} | Matični broj: ${companyInfo.maticniBroj || 'Nije unet'}
• Industrija: ${companyInfo.industry}
• Broj zaposlenih: ${companyInfo.employeeCount}
• Grad: ${companyInfo.city}
• Trenutni HR: ${companyInfo.hrSetup}

👤 KONTAKT OSOBA:
• Ime i prezime: ${companyInfo.contactPerson} (${companyInfo.contactRole})
• Poslovni email: ${companyInfo.email}
• Telefon: ${companyInfo.phone}
${companyInfo.primaryChallengeNote ? `• Navedeni problem: "${companyInfo.primaryChallengeNote}"` : ''}

📈 REZULTAT ANALIZE:
• Indeks: ${scores.overallScore}% (${scores.overallRiskLevel})
• Crvene tačke (${scores.redPoints.length}): ${scores.redPoints.map(r => `${r.categoryTitle} (${r.score}%)`).join(', ') || 'Nema'}
• Preporučeni paket za prodaju: ${scores.recommendedTier}

Akcija: Klijent očekuje povratni kontakt i ponudu.`;

  const currentSubject = activeTab === 'klijent' ? clientSubject : draganaSubject;
  const currentRecipient = activeTab === 'klijent' ? companyInfo.email : 'dragana.peoplepro@gmail.com';
  const currentBody = activeTab === 'klijent' ? clientBody : draganaBody;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentBody);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const mailtoUrl = `mailto:${encodeURIComponent(currentRecipient)}?subject=${encodeURIComponent(currentSubject)}&body=${encodeURIComponent(currentBody)}`;

  const handleSendViaGmail = async () => {
    setIsSendingViaGmail(true);
    setGmailStatusText(null);
    try {
      const res = await dispatchDiagnosticReportEmail(client);
      setGmailStatusText(res.message);
      if (res.success) {
        onMarkAsSent(client.id);
        setSentSuccess(true);
        setTimeout(() => {
          setSentSuccess(false);
          onClose();
        }, 2200);
      }
    } catch (err: any) {
      setGmailStatusText('Greška pri slanju preko Gmail-a: ' + (err.message || 'Proverite vezu'));
    } finally {
      setIsSendingViaGmail(false);
    }
  };

  const handleSimulateSend = () => {
    onMarkAsSent(client.id);
    setSentSuccess(true);
    setTimeout(() => {
      setSentSuccess(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#2761ff] flex items-center justify-center font-bold">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Slanje Izveštaja & Obaveštenja
              </h3>
              <p className="text-xs text-slate-500">
                Pravno lice: <strong className="text-slate-800">{companyInfo.companyName}</strong> (PIB: {companyInfo.pib})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <GoogleSignInButton compact={true} />
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 flex items-center justify-center font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50/50 px-6 pt-3 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('klijent')}
            className={`pb-3 px-4 border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'klijent'
                ? 'border-[#2761ff] text-[#2761ff]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>✉️ Izveštaj za Klijenta</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 text-slate-700">
              {companyInfo.email}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('dragana_notifikacija')}
            className={`pb-3 px-4 border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'dragana_notifikacija'
                ? 'border-[#2761ff] text-[#2761ff]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>🔔 Obaveštenje za People Pro</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-100 text-[#2761ff]">
              dragana.peoplepro@gmail.com
            </span>
          </button>
        </div>

        {/* Modal Body: Editable Preview */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {sentSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Izveštaj uspešno evidentiran kao poslat klijentu! Status ažuriran.</span>
            </div>
          )}

          {/* Email meta summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700">
            <div>
              <span className="font-bold text-slate-400 block text-[10px] uppercase">Primalac:</span>
              <span className="font-semibold text-slate-900">{currentRecipient}</span>
            </div>
            <div>
              <span className="font-bold text-slate-400 block text-[10px] uppercase">Predmet mejla:</span>
              <span className="font-semibold text-slate-900 truncate block">{currentSubject}</span>
            </div>
          </div>

          {/* Preview textarea */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Generisani personalizovani tekst mejla:
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="text-xs font-semibold text-[#2761ff] hover:text-[#1b4fd8] flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Kopirano u memoriju!' : 'Kopiraj sadržaj'}</span>
              </button>
            </div>

            <textarea
              readOnly
              value={currentBody}
              rows={14}
              className="w-full p-4 rounded-xl border border-slate-300 bg-slate-900 text-slate-100 font-mono text-[11px] leading-relaxed focus:outline-none select-all"
            />
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col gap-3">
          {gmailStatusText && (
            <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#2761ff] shrink-0" />
              <span>{gmailStatusText}</span>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-[11px] text-slate-500 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#2761ff]" />
              <span>Možete poslati direktno preko integrisanog Gmail-a ili otvoriti u Vašem email programu.</span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={handleSendViaGmail}
                disabled={isSendingViaGmail}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-60"
                title="Pošalji direktno putem Gmail API servisa"
              >
                {isSendingViaGmail ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
                ) : (
                  <Send className="w-3.5 h-3.5 text-blue-300" />
                )}
                <span>{isSendingViaGmail ? 'Slanje...' : 'Pošalji preko Gmail-a'}</span>
              </button>

              <a
                href={mailtoUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => onMarkAsSent(client.id)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#2761ff] hover:bg-[#1b4fd8] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Otvori u Email klijentu (mailto:)</span>
              </a>

              <button
                type="button"
                onClick={handleSimulateSend}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Zabeleži kao poslato</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
