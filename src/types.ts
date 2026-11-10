export interface CompanyInfo {
  companyName: string;
  pib: string;
  maticniBroj: string;
  industry: string;
  employeeCount: string;
  contactPerson: string;
  contactRole: string;
  email: string;
  phone: string;
  city: string;
  hrSetup: string;
  primaryChallengeNote?: string;
  // ZZPL RS consent
  dataPrivacyConsent?: boolean;
  consentTimestamp?: string;
}

export interface QuestionOption {
  value: number; // 1 to 4
  label: string;
  subtext?: string;
}

export interface Question {
  id: string;
  text: string;
  contextHint: string;
  options: QuestionOption[];
}

export interface Category {
  id: string;
  number: number;
  title: string;
  shortTitle: string;
  description: string;
  iconName: string;
  questions: Question[];
  redFlagWarning: string;
  consultingSolution: string;
}

export interface RedPoint {
  categoryId: string;
  categoryTitle: string;
  score: number; // in %
  severity: 'critical' | 'high';
  critique: string;
  dangerImpact: string;
  recommendedAction: string;
  suggestedPackage: 'START' | 'CORE' | 'GROW';
}

export interface YellowPoint {
  categoryId: string;
  categoryTitle: string;
  score: number;
  recommendation: string;
}

export interface GreenPoint {
  categoryId: string;
  categoryTitle: string;
  score: number;
  highlight: string;
}

export interface DiagnosisScoreResult {
  categoryScores: Record<string, number>; // categoryId -> percentage (0-100)
  overallScore: number; // 0-100%
  overallRiskLevel: 'Kritičan' | 'Umeren' | 'Stabilan';
  redPoints: RedPoint[];
  yellowPoints: YellowPoint[];
  greenPoints: GreenPoint[];
  recommendedTier: 'START' | 'CORE' | 'GROW';
  tierReason: string;
  executiveSummary: string;
}

export type ClientStatus =
  | 'nova_prijava'
  | 'pregledano'
  | 'poslat_izvestaj'
  | 'ugovoren_sastanak'
  | 'arhivirano';

export interface ConsultationBooking {
  id?: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "10:00 - 10:30"
  meetingType: 'google_meet' | 'phone';
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  companyName: string;
  discussionTopic?: string;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  googleMeetLink?: string;
  calendarEventId?: string;
  calendarHtmlLink?: string;
  createdAt: string;
}

export interface ClientSubmission {
  id: string;
  submittedAt: string;
  companyInfo: CompanyInfo;
  answers: Record<string, number>; // questionId -> value (1-4)
  notes?: string;
  status: ClientStatus;
  scores: DiagnosisScoreResult;
  notifiedConsultant?: boolean;
  // Firebase Storage & Cloud PDF fields
  reportPdfDataUrl?: string; // base64 Data URL for instant resilient download
  reportPdfName?: string; // e.g. PeoplePro_HR_Izvestaj_NazivFirme.pdf
  pdfStorageUrl?: string; // Firebase Storage download URL
  pdfStoragePath?: string; // Firebase Storage ref path e.g. reports/pp-xxx/report.pdf
  pdfSavedAt?: string;
  // ZZPL RS consent confirmation
  dataPrivacyConsent?: boolean;
  consentTimestamp?: string;
  // Consultation booking with Dragana Stanimirović
  booking?: ConsultationBooking;
}

