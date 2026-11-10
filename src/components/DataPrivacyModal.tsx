import React, { useEffect } from 'react';
import { ShieldCheck, X, CheckCircle2, Lock, FileText, Scale, Mail, Phone } from 'lucide-react';

interface DataPrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  isAccepted: boolean;
}

export const DataPrivacyModal: React.FC<DataPrivacyModalProps> = ({
  isOpen,
  onClose,
  onAccept,
  isAccepted
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="privacy-modal-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
    >
      <div
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 sm:p-6 border-b border-slate-100 bg-slate-50/70 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#2761ff] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#2761ff] bg-blue-50 px-2 py-0.5 rounded">
                  ZZPL RS Usklađenost
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  "Sl. glasnik RS", br. 87/2018
                </span>
              </div>
              <h2
                id="privacy-modal-title"
                className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5"
              >
                Obaveštenje o obradi podataka o ličnosti
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Zatvori prozor"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs sm:text-sm text-slate-700 leading-relaxed">
          {/* Summary Callout */}
          <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/80 flex items-start gap-3">
            <Lock className="w-4 h-4 text-[#2761ff] shrink-0 mt-0.5" />
            <p className="text-xs text-slate-800 leading-normal">
              <strong>People Pro HR Konsalting</strong> garantuje stopostotnu poverljivost unetih podataka. Vaši poslovni i kontakt podaci koriste se isključivo za potrebe izrade HR analize i zakazivanja besplatnih konsultacija, i <strong>nikada se ne dele sa trećim licima</strong>.
            </p>
          </div>

          {/* Section 1: Rukovalac podataka */}
          <div className="space-y-1.5">
            <h3 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs sm:text-sm">
              <Scale className="w-4 h-4 text-[#2761ff]" />
              <span>1. Rukovalac podacima o ličnosti</span>
            </h3>
            <p className="text-slate-600 text-xs">
              Rukovalac podacima u smislu člana 4. tačka 8) Zakona o zaštiti podataka o ličnosti Republike Srbije je:
            </p>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 space-y-0.5">
              <p><strong>People Pro HR Konsalting</strong> (Dragana Stanimirović PR, Beograd)</p>
              <p className="flex items-center gap-2 pt-1 text-slate-600">
                <Mail className="w-3.5 h-3.5 text-[#2761ff]" />
                <a href="mailto:dragana.peoplepro@gmail.com" className="text-[#2761ff] hover:underline">
                  dragana.peoplepro@gmail.com
                </a>
                <span>•</span>
                <Phone className="w-3.5 h-3.5 text-[#2761ff]" />
                <span>+381 60 131 72 82</span>
              </p>
            </div>
          </div>

          {/* Section 2: Svrha i pravni osnov */}
          <div className="space-y-1.5">
            <h3 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs sm:text-sm">
              <FileText className="w-4 h-4 text-[#2761ff]" />
              <span>2. Svrha obrade i pravni osnov</span>
            </h3>
            <p className="text-slate-600 text-xs">
              Prikupljanje i obrada podataka vrši se isključivo u sledeće svrhe:
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs text-slate-700 pl-1">
              <li>
                <strong>Izrada HR dijagnostike:</strong> Evaluacija 10 dimenzija organizacionog zdravlja na osnovu odgovora na 30 ciljanih pitanja;
              </li>
              <li>
                <strong>Dostavljanje personalizovanog izveštaja:</strong> Automatsko generisanje i slanje PDF izveštaja na Vašu navedenu email adresu;
              </li>
              <li>
                <strong>Besplatne strateške konsultacije:</strong> Priprema i organizacija 30-minutnih konsultacija sa Draganom Stanimirović radi predlaganja rešenja prilagođenih Vašoj firmi.
              </li>
            </ul>
            <p className="text-[11px] text-slate-500 pt-1">
              <strong>Pravni osnov:</strong> Član 12. stav 1. tačka 1) ZZPL RS (pristanak lica na koje se podaci odnose) i tačka 2) (obrada neophodna za preduzimanje radnji pre zaključenja ugovora na zahtev lica).
            </p>
          </div>

          {/* Section 3: Kategorije podataka */}
          <div className="space-y-1.5">
            <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
              3. Kategorije podataka koji se obrađuju
            </h3>
            <p className="text-slate-600 text-xs">
              Obrađuju se osnovni identifikacioni podaci o pravnom licu (naziv, PIB, matični broj, delatnost, broj zaposlenih) i službeni kontakt podaci ovlašćenog predstavnika ili lica za kontakt (ime i prezime, funkcija/uloga u firmi, službena email adresa, službeni broj telefona i sedište).
            </p>
          </div>

          {/* Section 4: Bezbednost i deljenje */}
          <div className="space-y-1.5">
            <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
              4. Poverljivost i bezbednost podataka
            </h3>
            <p className="text-slate-600 text-xs">
              Svi podaci se tretiraju kao poslovna tajna. Pristup bazi ima isključivo autorizovani administrator Dragana Stanimirović. Podaci se ne prenose trećim licima, marketinškim agencijama niti van teritorije Republike Srbije, osim u svrhu bezbednog hostinga na zaštićenim serverima sa enkripcijom podataka.
            </p>
          </div>

          {/* Section 5: Prava lica */}
          <div className="space-y-1.5">
            <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
              5. Vaša prava u skladu sa ZZPL RS
            </h3>
            <p className="text-slate-600 text-xs">
              U svakom trenutku imate pravo na:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-800 block">Pravo na uvid i kopiju</span>
                <span className="text-[11px] text-slate-500">Da zatražite potvrdu da li se Vaši podaci obrađuju i uvid u iste.</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-800 block">Pravo na ispravku i dopunu</span>
                <span className="text-[11px] text-slate-500">Da netačne podatke bez odlaganja ispravite ili ažurirate.</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-800 block">Pravo na brisanje ("pravo na zaborav")</span>
                <span className="text-[11px] text-slate-500">Da zatražite trajno brisanje svih Vaših podataka iz baze.</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-800 block">Pravo na opoziv pristanka</span>
                <span className="text-[11px] text-slate-500">Pristanak možete povući u bilo kom trenutku bez ikakvih troškova.</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 pt-1">
              Zahtev za ostvarivanje bilo kog prava možete uputiti na: <a href="mailto:dragana.peoplepro@gmail.com" className="text-[#2761ff] underline font-medium">dragana.peoplepro@gmail.com</a>.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/80 rounded-b-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            {isAccepted ? (
              <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Saglasnost je trenutno potvrđena
              </span>
            ) : (
              <span className="text-slate-500">
                Za nastavak upitnika neophodno je potvrditi saglasnost.
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
            >
              Zatvori
            </button>
            <button
              type="button"
              onClick={() => {
                onAccept();
                onClose();
              }}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#2761ff] hover:bg-[#1b4fd8] text-white font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Razumem i prihvatam uslove</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
