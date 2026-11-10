import React, { useState, useEffect } from 'react';
import { Mail, Check, AlertCircle, ExternalLink, Key, Loader2, Sparkles, X, ShieldCheck } from 'lucide-react';

interface SmtpSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SmtpSettingsModal: React.FC<SmtpSettingsModalProps> = ({ isOpen, onClose }) => {
  const [smtpUser, setSmtpUser] = useState('dragana.peoplepro@gmail.com');
  const [smtpPass, setSmtpPass] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setStatusMsg(null);
    fetch('/api/settings/smtp')
      .then(res => res.json())
      .then(data => {
        setIsConfigured(!!data.configured);
        if (data.user) setSmtpUser(data.user);
      })
      .catch(() => {});
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveAndTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg(null);

    try {
      const res = await fetch('/api/settings/smtp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: smtpUser, pass: smtpPass })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setIsConfigured(true);
        setStatusMsg({
          type: 'success',
          text: data.message || 'Uspešno povezano! Test email je poslat na Vašu adresu.'
        });
      } else {
        setStatusMsg({
          type: 'error',
          text: data.error || 'Provera nije uspela. Proverite unete podatke.'
        });
      }
    } catch (err: any) {
      setStatusMsg({
        type: 'error',
        text: 'Greška u komunikaciji sa serverom: ' + err.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#2761ff] flex items-center justify-center font-bold">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Podešavanja Email Slanja (Gmail / SMTP)
              </h3>
              <p className="text-xs text-slate-500">
                Rešenje za automatsko slanje izveštaja klijentima i notifikacija za Dragana Stanimirović
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 flex items-center justify-center font-bold cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-xs text-slate-700">
          {/* Explanation why Google blocks the OAuth popup */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-900 text-sm">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Zašto Google blokira prozor za povezivanje Gmail-a?</span>
            </div>
            <p className="text-amber-800 leading-relaxed text-xs">
              Google ima bezbednosnu politiku koja <strong>automatski blokira</strong> eksterne web aplikacije kada traže dozvolu za slanje mejlova sa Vašeg naloga (tzv. <em>Restricted Scope</em>), osim ako aplikacija ne prođe višemesečnu bezbednosnu Google proveru.
            </p>
            <p className="text-amber-900 font-semibold text-xs">
              Zato u aplikaciji imate 2 rešenja koja rade bez ikakvih blokada:
            </p>
          </div>

          {/* Option 1: 1-Click Gmail (Always active) */}
          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-black text-slate-900 text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>Rešenje 1: Dugme „Otvori u mom Gmail-u (1 klik)”</span>
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                Aktivno & 100% Pouzdano
              </span>
            </div>
            <p className="text-slate-600 text-xs leading-relaxed">
              U bazi klijenata i u modalu za slanje imate dugme <strong>„✉️ Otvori u mom Gmail-u (1 klik)”</strong>.
              Kada kliknete, u novom tabu Vam se odmah otvara Vaš pravi Gmail nalog sa unetim primaocem, naslovom i celim tekstom izveštaja i zahvalnicom — samo kliknete „Pošalji”. <em>(Nije potrebna lozinka, niti ikakvo podešavanje!)</em>
            </p>
          </div>

          {/* Option 2: Server SMTP with Google App Password */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-black text-slate-900 text-sm flex items-center gap-2">
                <Key className="w-4 h-4 text-[#2761ff]" />
                <span>Rešenje 2: Potpuno automatsko slanje u pozadini</span>
              </span>
              {isConfigured ? (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center gap-1 border border-emerald-300">
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span>Automatsko slanje aktivno</span>
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-600 font-semibold text-[10px]">
                  Nije konfigurisano
                </span>
              )}
            </div>

            <p className="text-slate-600 text-xs leading-relaxed">
              Ukoliko želite da server u sekundi <strong>automatski pošalje mejl klijentu i Vama</strong> čim klijent klikne na „Završi upitnik” (bez potrebe da Vi bilo šta otvarate), unesite Google <strong>„Lozinku za aplikacije” (App Password)</strong>.
            </p>

            <form onSubmit={handleSaveAndTest} className="space-y-3 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Vaša Gmail adresa:
                </label>
                <input
                  type="email"
                  value={smtpUser}
                  onChange={(e) => setSmtpUser(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2761ff]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase">
                    Google lozinka za aplikaciju (16 karaktera):
                  </label>
                  <a
                    href="https://myaccount.google.com/apppasswords"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#2761ff] hover:underline flex items-center gap-1 text-[11px] font-semibold"
                  >
                    <span>Generišite lozinku ovde</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <input
                  type="password"
                  placeholder="npr. abcd efgh ijkl mnop"
                  value={smtpPass}
                  onChange={(e) => setSmtpPass(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2761ff]"
                />
                <span className="text-[10px] text-slate-400 block mt-1">
                  * Važno: Ovo nije Vaša standardna šifra za Gmail, već poseban 16-slovni kod koji Google generiše za eksterne programe na <strong>myaccount.google.com/apppasswords</strong>.
                </span>
              </div>

              {statusMsg && (
                <div className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                  statusMsg.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}>
                  {statusMsg.type === 'success' ? (
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  )}
                  <span>{statusMsg.text}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-200/60 font-semibold text-xs cursor-pointer"
                >
                  Zatvori
                </button>
                <button
                  type="submit"
                  disabled={loading || !smtpPass.trim()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2761ff] hover:bg-[#1b4fd8] text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Testiram vezu...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Sačuvaj i testiraj slanje</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
