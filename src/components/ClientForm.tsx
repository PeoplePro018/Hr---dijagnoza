import React, { useState } from 'react';
import { CompanyInfo } from '../types';
import { DIAGNOSTIC_CATEGORIES } from '../data/diagnosticData';
import {
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Users,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  AlertTriangle,
  Zap,
  HelpCircle,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { DataPrivacyModal } from './DataPrivacyModal';

interface ClientFormProps {
  initialCompanyInfo?: Partial<CompanyInfo>;
  initialAnswers?: Record<string, number>;
  onSubmit: (companyInfo: CompanyInfo, answers: Record<string, number>) => void;
  onCancel?: () => void;
}

export const ClientForm: React.FC<ClientFormProps> = ({
  initialCompanyInfo,
  initialAnswers,
  onSubmit,
  onCancel
}) => {
  // Wizard steps:
  // 0: Company Info (Pravno lice)
  // 1: Oblasti 1-3 (Regrutacija, Onboarding, Tim)
  // 2: Oblasti 4-6 (Komunikacija, Zadovoljstvo, Razvoj)
  // 3: Oblasti 7-9 (Učinak, Fluktuacija, Plate)
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState<boolean>(false);

  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    companyName: initialCompanyInfo?.companyName || '',
    pib: initialCompanyInfo?.pib || '',
    maticniBroj: initialCompanyInfo?.maticniBroj || '',
    industry: initialCompanyInfo?.industry || 'IT i softverske usluge',
    employeeCount: initialCompanyInfo?.employeeCount || '11-50',
    contactPerson: initialCompanyInfo?.contactPerson || '',
    contactRole: initialCompanyInfo?.contactRole || 'Vlasnik / Direktor',
    email: initialCompanyInfo?.email || '',
    phone: initialCompanyInfo?.phone || '',
    city: initialCompanyInfo?.city || 'Beograd',
    hrSetup: initialCompanyInfo?.hrSetup || 'Nema internog HR-a (osnivač/menadžeri vode)',
    primaryChallengeNote: initialCompanyInfo?.primaryChallengeNote || '',
    dataPrivacyConsent: initialCompanyInfo?.dataPrivacyConsent || false,
    consentTimestamp: initialCompanyInfo?.consentTimestamp || undefined
  });

  const [answers, setAnswers] = useState<Record<string, number>>(initialAnswers || {});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Question sections mapping
  const stepCategories = [
    [], // Step 0: company info
    DIAGNOSTIC_CATEGORIES.slice(0, 3), // Step 1: 1, 2, 3
    DIAGNOSTIC_CATEGORIES.slice(3, 6), // Step 2: 4, 5, 6
    DIAGNOSTIC_CATEGORIES.slice(6, 10) // Step 3: 7, 8, 9, 10 (Well-being)
  ];

  // Total questions count = 30 (10 categories x 3 questions)
  const totalQuestions = 30;
  const answeredCount = Object.keys(answers).length;
  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);

  const handleCompanyChange = (field: keyof CompanyInfo, val: any) => {
    setCompanyInfo(prev => ({ ...prev, [field]: val }));
    if (errors[field]) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const handleConsentToggle = (accepted: boolean) => {
    setCompanyInfo(prev => ({
      ...prev,
      dataPrivacyConsent: accepted,
      consentTimestamp: accepted ? new Date().toISOString() : undefined
    }));
    if (accepted && errors.dataPrivacyConsent) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy.dataPrivacyConsent;
        return copy;
      });
    }
  };

  const handleAnswerSelect = (questionId: string, val: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: val }));
    if (errors[questionId]) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy[questionId];
        return copy;
      });
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 0) {
      if (!companyInfo.companyName.trim()) newErrors.companyName = 'Naziv kompanije je obavezan';
      if (!companyInfo.pib.trim()) newErrors.pib = 'PIB je obavezan';
      if (!companyInfo.contactPerson.trim()) newErrors.contactPerson = 'Ime kontakt osobe je obavezno';
      if (!companyInfo.email.trim() || !companyInfo.email.includes('@')) newErrors.email = 'Unesite ispravnu email adresu';
      if (!companyInfo.phone.trim()) newErrors.phone = 'Broj telefona je obavezan';
      if (!companyInfo.dataPrivacyConsent) {
        newErrors.dataPrivacyConsent = 'Molimo potvrdite saglasnost za obradu podataka o ličnosti u skladu sa ZZPL pre nastavka.';
      }
    } else {
      const cats = stepCategories[step];
      for (const cat of cats) {
        for (const q of cat.questions) {
          if (!answers[q.id]) {
            newErrors[q.id] = 'Molimo izaberite odgovor';
          }
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 3) {
        setCurrentStep(prev => prev + 1);
        window.scrollTo({ top: 120, behavior: 'smooth' });
      } else {
        handleSubmit();
      }
    } else {
      // Find first error and scroll
      window.scrollTo({ top: 180, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

  const handleSubmit = () => {
    if (!validateStep(3)) return;
    // Immediately reset scroll to the top so results are not shown scrolled at the bottom
    window.scrollTo({ top: 0, behavior: 'instant' });
    onSubmit(companyInfo, answers);
  };

  const fillSampleCompany = () => {
    setCompanyInfo({
      companyName: 'OmniTrade Logistics d.o.o.',
      pib: '109841294',
      maticniBroj: '20819482',
      industry: 'Trgovina na veliko i distribucija',
      employeeCount: '51-150',
      contactPerson: 'Aleksandar Petrović',
      contactRole: 'Operativni direktor',
      email: 'aleksandar.petrovic@omnitrade.rs',
      phone: '+381 60 445 5667',
      city: 'Beograd',
      hrSetup: 'Interni HR generalista (1 osoba)',
      primaryChallengeNote: 'Imamo problem sa fluktuacijom u skladištu i nesuglasicama između komercijale i operative.'
    });

    // Populate realistic mix of answers (some red, some yellow, some green)
    const sampleAns: Record<string, number> = {
      regrutacija_q1: 2, regrutacija_q2: 2, regrutacija_q3: 1, // Red
      onboarding_q1: 2, onboarding_q2: 2, onboarding_q3: 2, // Yellow
      tim_struktura_q1: 2, tim_struktura_q2: 1, tim_struktura_q3: 2, // Red
      komunikacija_q1: 2, komunikacija_q2: 1, komunikacija_q3: 2, // Red
      zadovoljstvo_q1: 1, zadovoljstvo_q2: 2, zadovoljstvo_q3: 2, // Red
      razvoj_q1: 2, razvoj_q2: 2, razvoj_q3: 2, // Yellow
      ucinak_kpi_q1: 2, ucinak_kpi_q2: 2, ucinak_kpi_q3: 2, // Yellow
      fluktuacija_q1: 1, fluktuacija_q2: 1, fluktuacija_q3: 2, // Red
      plate_benefiti_q1: 3, plate_benefiti_q2: 3, plate_benefiti_q3: 3, // Green
      wellbeing_q1: 2, wellbeing_q2: 1, wellbeing_q3: 2 // Red
    };

    setAnswers(sampleAns);
    setErrors({});
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Wizard Header & Progress */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-[#2761ff]">
                Korak {currentStep + 1} od 4
              </span>
              <span className="text-xs font-medium text-slate-500">
                {currentStep === 0 && 'Podaci o pravnom licu'}
                {currentStep === 1 && 'Oblasti 1 - 3 (Regrutacija, Onboarding, Tim)'}
                {currentStep === 2 && 'Oblasti 4 - 6 (Komunikacija, Zadovoljstvo, Razvoj)'}
                {currentStep === 3 && 'Oblasti 7 - 10 (Učinak, Fluktuacija, Plate, Well-being)'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              {currentStep === 0 ? 'Identifikacioni podaci kompanije' : 'HR Dijagnostički upitnik'}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={fillSampleCompany}
              className="text-xs font-semibold text-slate-600 hover:text-[#2761ff] bg-slate-100 hover:bg-blue-50 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors flex items-center gap-1.5"
              title="Automatski popuni formular za brzi test"
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Demo popuna</span>
            </button>
            <div className="text-right">
              <span className="text-xs font-bold text-slate-800">
                {answeredCount} / {totalQuestions}
              </span>
              <span className="text-[11px] text-slate-400 block">pitanja</span>
            </div>
          </div>
        </div>

        {/* Step progress pills */}
        <div className="grid grid-cols-4 gap-2 pt-4">
          {[
            { label: 'Pravno lice', desc: 'Podaci o firmi' },
            { label: 'Oblasti 1 - 3', desc: 'Regrutacija & Tim' },
            { label: 'Oblasti 4 - 6', desc: 'Kultura & Razvoj' },
            { label: 'Oblasti 7 - 10', desc: 'KPI, Plate & Well-being' }
          ].map((st, i) => (
            <div
              key={i}
              onClick={() => {
                if (i <= currentStep || validateStep(currentStep)) {
                  setCurrentStep(i);
                }
              }}
              className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                i === currentStep
                  ? 'bg-blue-50/80 border-[#2761ff] ring-2 ring-blue-100'
                  : i < currentStep
                  ? 'bg-slate-50 border-emerald-300'
                  : 'bg-slate-50/60 border-slate-200 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className={i === currentStep ? 'text-[#2761ff]' : i < currentStep ? 'text-emerald-700' : 'text-slate-500'}>
                  {st.label}
                </span>
                {i < currentStep && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
              </div>
              <div className="text-[10px] text-slate-500 truncate hidden sm:block">
                {st.desc}
              </div>
            </div>
          ))}
        </div>

        {/* Global Progress bar */}
        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-4">
          <div
            className="bg-[#2761ff] h-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* STEP 0: Podaci o pravnom licu */}
      {currentStep === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-start gap-3 p-4 bg-blue-50/70 border border-blue-200/80 rounded-xl text-xs text-blue-900">
            <Building2 className="w-5 h-5 text-[#2761ff] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm text-[#2761ff]">Informacije o pravnom licu</p>
              <p className="text-slate-600 mt-0.5">
                Ovi podaci se koriste za generisanje zvaničnog izveštaja i personalizaciju preporuka prema vašoj industriji i veličini tima. Svi podaci su poverljivi.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Naziv kompanije */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Puni naziv pravnog lica / firme <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={companyInfo.companyName}
                  onChange={(e) => handleCompanyChange('companyName', e.target.value)}
                  placeholder="npr. Apex Logistics d.o.o. Beograd"
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2761ff] transition-all ${
                    errors.companyName ? 'border-red-400 ring-1 ring-red-300' : 'border-slate-300'
                  }`}
                />
              </div>
              {errors.companyName && <p className="text-xs text-red-600 mt-1">{errors.companyName}</p>}
            </div>

            {/* PIB */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                PIB (Poreski identifikacioni broj) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={companyInfo.pib}
                onChange={(e) => handleCompanyChange('pib', e.target.value)}
                placeholder="npr. 108492019"
                className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2761ff] transition-all ${
                  errors.pib ? 'border-red-400 ring-1 ring-red-300' : 'border-slate-300'
                }`}
              />
              {errors.pib && <p className="text-xs text-red-600 mt-1">{errors.pib}</p>}
            </div>

            {/* Matični broj */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Matični broj preduzeća
              </label>
              <input
                type="text"
                value={companyInfo.maticniBroj}
                onChange={(e) => handleCompanyChange('maticniBroj', e.target.value)}
                placeholder="npr. 20948210"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2761ff] transition-all"
              />
            </div>

            {/* Industrija */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Delatnost / Industrija
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <select
                  value={companyInfo.industry}
                  onChange={(e) => handleCompanyChange('industry', e.target.value)}
                  className="w-full pl-10 pr-8 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2761ff] transition-all appearance-none cursor-pointer"
                >
                  <option value="IT i softverske usluge">IT i softverske usluge</option>
                  <option value="Proizvodnja i industrija">Proizvodnja i industrija</option>
                  <option value="Trgovina na veliko i distribucija">Trgovina na veliko i distribucija</option>
                  <option value="Maloprodaja i eCommerce">Maloprodaja i eCommerce</option>
                  <option value="Finansije, bankarstvo i osiguranje">Finansije, bankarstvo i osiguranje</option>
                  <option value="Građevinarstvo i nekretnine">Građevinarstvo i nekretnine</option>
                  <option value="Zdravstvo, farmacija i medicina">Zdravstvo, farmacija i medicina</option>
                  <option value="Ugostiteljstvo i turizam">Ugostiteljstvo i turizam</option>
                  <option value="Transport i logistika">Transport i logistika</option>
                  <option value="Konsalting i profesionalne usluge">Konsalting i profesionalne usluge</option>
                  <option value="Drugo">Drugo</option>
                </select>
              </div>
            </div>

            {/* Broj zaposlenih */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Broj zaposlenih
              </label>
              <div className="relative">
                <Users className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <select
                  value={companyInfo.employeeCount}
                  onChange={(e) => handleCompanyChange('employeeCount', e.target.value)}
                  className="w-full pl-10 pr-8 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2761ff] transition-all appearance-none cursor-pointer"
                >
                  <option value="1-10">1 - 10 zaposlenih (Mikro tim)</option>
                  <option value="11-50">11 - 50 zaposlenih (Rastuća firma)</option>
                  <option value="51-150">51 - 150 zaposlenih (Srednje preduzeće)</option>
                  <option value="151-500">151 - 500 zaposlenih (Veliko preduzeće)</option>
                  <option value="500+">500+ zaposlenih (Korporacija)</option>
                </select>
              </div>
            </div>

            {/* Kontakt osoba */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Ime i prezime kontakt osobe <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={companyInfo.contactPerson}
                  onChange={(e) => handleCompanyChange('contactPerson', e.target.value)}
                  placeholder="npr. Dragana Petrović"
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2761ff] transition-all ${
                    errors.contactPerson ? 'border-red-400 ring-1 ring-red-300' : 'border-slate-300'
                  }`}
                />
              </div>
              {errors.contactPerson && <p className="text-xs text-red-600 mt-1">{errors.contactPerson}</p>}
            </div>

            {/* Pozicija / Funkcija */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Pozicija u kompaniji
              </label>
              <input
                type="text"
                value={companyInfo.contactRole}
                onChange={(e) => handleCompanyChange('contactRole', e.target.value)}
                placeholder="npr. Vlasnik / CEO / HR Menadžer"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2761ff] transition-all"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Poslovna email adresa <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={companyInfo.email}
                  onChange={(e) => handleCompanyChange('email', e.target.value)}
                  placeholder="npr. direktor@vasafirma.rs"
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2761ff] transition-all ${
                    errors.email ? 'border-red-400 ring-1 ring-red-300' : 'border-slate-300'
                  }`}
                />
              </div>
              {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
            </div>

            {/* Telefon */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Broj telefona <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="tel"
                  value={companyInfo.phone}
                  onChange={(e) => handleCompanyChange('phone', e.target.value)}
                  placeholder="npr. +381 64 123 4567"
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2761ff] transition-all ${
                    errors.phone ? 'border-red-400 ring-1 ring-red-300' : 'border-slate-300'
                  }`}
                />
              </div>
              {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
            </div>

            {/* Grad */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Grad / Sedište
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={companyInfo.city}
                  onChange={(e) => handleCompanyChange('city', e.target.value)}
                  placeholder="npr. Beograd, Novi Sad, Niš..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2761ff] transition-all"
                />
              </div>
            </div>

            {/* Trenutna HR postavka */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Trenutno organizovanje HR funkcije
              </label>
              <select
                value={companyInfo.hrSetup}
                onChange={(e) => handleCompanyChange('hrSetup', e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2761ff] transition-all cursor-pointer"
              >
                <option value="Nema internog HR-a (osnivač/menadžeri vode)">Nema internog HR-a (osnivač/menadžeri vode)</option>
                <option value="Interni HR generalista (1 osoba)">Interni HR generalista (1 osoba)</option>
                <option value="Razvijen HR tim (više stručnjaka)">Razvijen HR tim (više stručnjaka)</option>
                <option value="Eksterni HR konsultant / agencija">Eksterni HR konsultant / agencija</option>
              </select>
            </div>

            {/* Najveći trenutni problem */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Koji je vaš najveći trenutni izazov sa ljudima ili timom? (Opciono)
              </label>
              <textarea
                value={companyInfo.primaryChallengeNote}
                onChange={(e) => handleCompanyChange('primaryChallengeNote', e.target.value)}
                rows={2}
                placeholder="npr. Odliv seniora, loša međusobna komunikacija, nedostatak jasnih KPI ciljeva..."
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2761ff] transition-all"
              />
            </div>
          </div>

          {/* ZZPL RS Obaveštenje o obradi podataka i saglasnost */}
          <div
            className={`mt-6 p-4 sm:p-5 rounded-2xl border transition-all ${
              errors.dataPrivacyConsent
                ? 'bg-red-50/70 border-red-300 ring-2 ring-red-200'
                : companyInfo.dataPrivacyConsent
                ? 'bg-emerald-50/50 border-emerald-200'
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${
                    companyInfo.dataPrivacyConsent
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-blue-100 text-[#2761ff]'
                  }`}
                >
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                      Zaštita podataka o ličnosti (ZZPL RS)
                    </h4>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-100 text-[#2761ff]">
                      Čl. 12 i 23 ZZPL
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Usklađeno sa Zakonom o zaštiti podataka o ličnosti ("Sl. glasnik RS", br. 87/2018)
                  </p>
                </div>
              </div>

              {/* Taster za otvaranje modalnog obaveštenja */}
              <button
                type="button"
                onClick={() => setIsPrivacyModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-[#2761ff] border border-blue-200 font-bold text-xs shadow-2xs transition-colors self-start sm:self-auto cursor-pointer"
                title="Kliknite za prikaz celokupnog pravnog teksta obaveštenja"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Pročitaj obaveštenje o obradi podataka</span>
              </button>
            </div>

            {/* Checkbox i tekst saglasnosti */}
            <div className="pt-3">
              <label className="flex items-start gap-3 cursor-pointer group select-none">
                <input
                  type="checkbox"
                  id="zzpl-consent-checkbox"
                  checked={!!companyInfo.dataPrivacyConsent}
                  onChange={(e) => handleConsentToggle(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded text-[#2761ff] focus:ring-[#2761ff] border-slate-300 cursor-pointer accent-[#2761ff]"
                />
                <div className="text-xs text-slate-700 leading-normal">
                  <span className="font-semibold text-slate-900 group-hover:text-[#2761ff] transition-colors">
                    Potvrđujem da sam upoznat/a sa Obaveštenjem o obradi podataka o ličnosti i dajem izričitu saglasnost
                  </span>{' '}
                  da People Pro HR Konsalting (Dragana Stanimirović) obrađuje navedene podatke pravnog lica i kontakt osobe{' '}
                  <strong>isključivo u svrhu izrade HR dijagnostike, dostavljanja izveštaja i zakazivanja besplatnih 30-minutnih strateških konsultacija</strong>,
                  u skladu sa Zakonom o zaštiti podataka o ličnosti Republike Srbije.{' '}
                  <span className="text-red-500 font-bold">*</span>
                </div>
              </label>

              {errors.dataPrivacyConsent && (
                <div className="mt-2.5 p-2 rounded-lg bg-red-100/70 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errors.dataPrivacyConsent}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* STEPS 1, 2, 3: Questions per 3 categories */}
      {currentStep > 0 && (
        <div className="space-y-8">
          {stepCategories[currentStep].map((category) => (
            <div
              key={category.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6"
            >
              {/* Category Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2761ff] flex items-center justify-center font-bold text-base shrink-0">
                    {category.number}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {category.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      {category.description}
                    </p>
                  </div>
                </div>

                {/* Sub-score badge if questions answered */}
                {category.questions.every(q => !!answers[q.id]) && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold self-start sm:self-auto">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Oblast kompletirana</span>
                  </div>
                )}
              </div>

              {/* Questions List */}
              <div className="space-y-7">
                {category.questions.map((question, qIdx) => (
                  <div
                    key={question.id}
                    className={`p-4 sm:p-5 rounded-xl border transition-all ${
                      errors[question.id]
                        ? 'bg-red-50/50 border-red-300'
                        : answers[question.id]
                        ? 'bg-slate-50/60 border-slate-200'
                        : 'bg-white border-slate-200 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h4 className="text-sm font-bold text-slate-900 leading-snug">
                        <span className="text-[#2761ff] mr-1.5">{qIdx + 1}.</span>
                        {question.text}
                      </h4>
                      {answers[question.id] && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-[#2761ff] shrink-0">
                          Ocena {answers[question.id]}/4
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 mb-4 flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{question.contextHint}</span>
                    </p>

                    {/* Radio Options Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {question.options.map((opt) => {
                        const isSelected = answers[question.id] === opt.value;
                        const isLowScore = opt.value === 1 || opt.value === 2;

                        return (
                          <div
                            key={opt.value}
                            onClick={() => handleAnswerSelect(question.id, opt.value)}
                            className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                              isSelected
                                ? isLowScore
                                  ? 'bg-red-50/90 border-red-400 ring-2 ring-red-100'
                                  : 'bg-blue-50/90 border-[#2761ff] ring-2 ring-blue-100'
                                : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <div className="pt-0.5">
                              <div
                                className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                                  isSelected
                                    ? isLowScore
                                      ? 'border-red-600 bg-red-600 text-white'
                                      : 'border-[#2761ff] bg-[#2761ff] text-white'
                                    : 'border-slate-300 bg-white'
                                }`}
                              >
                                {isSelected && (
                                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                )}
                              </div>
                            </div>
                            <div className="flex-1">
                              <p className={`text-xs font-semibold leading-tight ${isSelected ? 'text-slate-900' : 'text-slate-700'}`}>
                                {opt.label}
                              </p>
                              {opt.subtext && (
                                <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                                  {opt.subtext}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {errors[question.id] && (
                      <p className="text-xs text-red-600 font-semibold mt-2 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        {errors[question.id]}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Navigation Buttons Footer */}
      <div className="flex items-center justify-between gap-4 mt-8 pt-4">
        {currentStep > 0 ? (
          <button
            type="button"
            onClick={handlePrev}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 font-semibold text-sm transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Prethodni korak</span>
          </button>
        ) : (
          <div>
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="text-xs font-semibold text-slate-500 hover:text-slate-700"
              >
                Odustani
              </button>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={handleNext}
          className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-[#2761ff] hover:bg-[#1b4fd8] text-white font-bold text-sm sm:text-base shadow-md hover:shadow-lg transition-all transform active:scale-98 cursor-pointer"
        >
          <span>
            {currentStep < 3 ? 'Nastavi na sledeći korak' : 'Završi i prikaži HR dijagnozu'}
          </span>
          {currentStep < 3 ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <Sparkles className="w-4 h-4 text-yellow-300" />
          )}
        </button>
      </div>

      {/* ZZPL Pravno Obaveštenje Modal */}
      <DataPrivacyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
        onAccept={() => handleConsentToggle(true)}
        isAccepted={!!companyInfo.dataPrivacyConsent}
      />
    </div>
  );
};
