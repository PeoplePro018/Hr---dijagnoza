/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CompanyInfo, ClientSubmission, ClientStatus, ConsultationBooking } from './types';
import { SAMPLE_CLIENTS } from './data/diagnosticData';
import { calculateDiagnosisScore } from './utils/scoring';
import { exportClientsToExcel } from './utils/excelExport';
import { dispatchDiagnosticReportEmail } from './utils/emailService';

import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { ClientForm } from './components/ClientForm';
import { InteractiveResults } from './components/InteractiveResults';
import { AdminDashboard } from './components/AdminDashboard';
import { EmailModal } from './components/EmailModal';
import { PrintReport } from './components/PrintReport';
import { NotificationToast } from './components/NotificationToast';
import { QuestionsCatalogModal } from './components/QuestionsCatalogModal';
import { ChatWidget } from './components/ChatWidget';
import { AdminAuthModal } from './components/AdminAuthModal';
import {
  generateClientResultPDFDataUrl,
  getClientPDFFileName
} from './utils/pdfGenerator';
import {
  saveClientSubmissionToFirestore,
  subscribeToSubmissions,
  updateSubmissionStatusInFirestore,
  updateSubmissionNotesInFirestore,
  updateSubmissionBookingInFirestore
} from './lib/firebase';
import { getAccessToken } from './lib/googleAuth';
import { createGoogleCalendarEvent } from './lib/calendarService';
import { Lock } from 'lucide-react';

const STORAGE_KEY = 'peoplepro_hr_dijagnoza_clients_v2';

export default function App() {
  // Check admin authorization - strictly session-based so public links ALWAYS open clean as visitor
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      // Clear any legacy persistent tokens to prevent accidental admin leak on shared browser
      localStorage.removeItem('peoplepro_admin_auth');
      localStorage.removeItem('peoplepro_admin_auth_time');
      localStorage.removeItem('peoplepro_hr_dijagnoza_clients_v2');
      return sessionStorage.getItem('peoplepro_admin_session') === 'true';
    } catch (e) {
      return false;
    }
  });

  const [showAdminAuthModal, setShowAdminAuthModal] = useState<boolean>(false);

  // Load saved clients ONLY if admin is actively authorized in this session, otherwise empty array
  const [clients, setClients] = useState<ClientSubmission[]>(() => {
    try {
      const isAuth = sessionStorage.getItem('peoplepro_admin_session') === 'true';
      if (isAuth) {
        return SAMPLE_CLIENTS;
      }
    } catch (e) {
      console.error('Error loading stored clients', e);
    }
    return [];
  });

  const [activeTab, setActiveTab] = useState<'upitnik' | 'admin' | 'rezultati'>('upitnik');
  const [currentResult, setCurrentResult] = useState<ClientSubmission | null>(null);
  const [emailModalClient, setEmailModalClient] = useState<ClientSubmission | null>(null);
  const [printClient, setPrintClient] = useState<ClientSubmission | null>(null);
  const [showCatalogModal, setShowCatalogModal] = useState<boolean>(false);
  const [notification, setNotification] = useState<{
    client: ClientSubmission;
    timestamp: number;
  } | null>(null);

  // Subscribe to real-time updates from Firebase Firestore ONLY IF admin is authenticated
  useEffect(() => {
    if (!isAdmin) return;
    const unsubscribe = subscribeToSubmissions(
      (firestoreSubmissions) => {
        if (firestoreSubmissions && firestoreSubmissions.length > 0) {
          setClients(firestoreSubmissions);
        }
      },
      (error) => {
        console.warn('Firestore subscription fallback to local cache:', error);
      }
    );
    return () => unsubscribe();
  }, [isAdmin]);

  // Sync clients to localStorage as persistent local cache ONLY IF admin
  useEffect(() => {
    if (!isAdmin) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }, [clients, isAdmin]);

  // Protect admin tab from non-admin visitors
  useEffect(() => {
    if (!isAdmin && activeTab === 'admin') {
      setActiveTab('upitnik');
    }
  }, [isAdmin, activeTab]);

  // Automated Background Calendar & Email Synchronizer for Dragana
  useEffect(() => {
    if (!isAdmin) return;

    let isSyncing = false;
    const runAutoSync = async () => {
      if (isSyncing) return;
      isSyncing = true;
      try {
        const token = await getAccessToken();
        if (!token) return;

        for (const c of clients) {
          // 1. Auto sync bookings to Google Calendar if not yet synced
          if (c.booking && c.booking.status === 'confirmed' && !c.booking.calendarEventId) {
            console.log('Automatski upisujem termin u Google kalendar:', c.companyInfo.companyName);
            const calRes = await createGoogleCalendarEvent(c, c.booking, token);
            if (calRes.success && calRes.eventId) {
              const updatedBooking: ConsultationBooking = {
                ...c.booking,
                calendarEventId: calRes.eventId,
                googleMeetLink: calRes.meetLink,
                calendarHtmlLink: calRes.htmlLink
              };
              await updateSubmissionBookingInFirestore(c.id, updatedBooking);
              setClients(prev =>
                prev.map(item => (item.id === c.id ? { ...item, booking: updatedBooking } : item))
              );
              setNotification({
                client: { ...c, booking: updatedBooking },
                timestamp: Date.now()
              });
            }
          }
        }
      } catch (err) {
        console.warn('Auto sync check error:', err);
      } finally {
        isSyncing = false;
      }
    };

    runAutoSync();
  }, [isAdmin, clients]);

  // Handle client assessment completion
  const handleAssessmentSubmit = async (companyInfo: CompanyInfo, answers: Record<string, number>) => {
    const scores = calculateDiagnosisScore(answers, companyInfo);

    const newSubmission: ClientSubmission = {
      id: `pp-${Date.now().toString(36)}`,
      submittedAt: new Date().toISOString(),
      companyInfo,
      answers,
      status: 'nova_prijava',
      scores,
      notifiedConsultant: true,
      dataPrivacyConsent: companyInfo.dataPrivacyConsent,
      consentTimestamp: companyInfo.consentTimestamp || new Date().toISOString()
    };

    // Automatically generate client PDF report (with thank-you note & consultation invitation, without commercial packages)
    try {
      const fileName = getClientPDFFileName(newSubmission, { forAdmin: false });
      const pdfDataUrl = generateClientResultPDFDataUrl(newSubmission, { forAdmin: false });

      // Save directly in Firestore document (100% Free Spark Plan, no Cloud Storage billing)
      newSubmission.reportPdfDataUrl = pdfDataUrl;
      newSubmission.reportPdfName = fileName;
      newSubmission.pdfSavedAt = new Date().toISOString();
    } catch (pdfErr) {
      console.warn('PDF automatic generation notice:', pdfErr);
    }

    // Save locally immediately
    setClients(prev => [newSubmission, ...prev.filter(c => c.id !== newSubmission.id)]);
    setCurrentResult(newSubmission);
    setActiveTab('rezultati');
    window.scrollTo({ top: 0, behavior: 'instant' });

    // Automatically send / dispatch results to the client's email
    try {
      const emailResult = await dispatchDiagnosticReportEmail(newSubmission);
      if (emailResult.success) {
        newSubmission.status = 'poslat_izvestaj';
        setClients(prev => prev.map(c => c.id === newSubmission.id ? { ...c, status: 'poslat_izvestaj' } : c));
        setCurrentResult(prev => prev && prev.id === newSubmission.id ? { ...prev, status: 'poslat_izvestaj' } : prev);
      }
    } catch (e) {
      console.warn('Auto email dispatch note:', e);
    }

    // Persist to Firebase Firestore (includes stored PDF document & Storage URL)
    try {
      await saveClientSubmissionToFirestore(newSubmission);
    } catch (err) {
      console.warn('Could not save to Firestore, local state preserved:', err);
    }

    // Trigger instant notification for Dragana
    setNotification({
      client: newSubmission,
      timestamp: Date.now()
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateStatus = async (clientId: string, status: ClientStatus) => {
    setClients(prev =>
      prev.map(c => (c.id === clientId ? { ...c, status } : c))
    );
    if (currentResult && currentResult.id === clientId) {
      setCurrentResult(prev => (prev ? { ...prev, status } : null));
    }

    try {
      await updateSubmissionStatusInFirestore(clientId, status);
    } catch (err) {
      console.warn('Failed to update status in Firestore:', err);
    }
  };

  const handleUpdateNotes = async (clientId: string, notes: string) => {
    setClients(prev =>
      prev.map(c => (c.id === clientId ? { ...c, notes } : c))
    );
    if (currentResult && currentResult.id === clientId) {
      setCurrentResult(prev => (prev ? { ...prev, notes } : null));
    }

    try {
      await updateSubmissionNotesInFirestore(clientId, notes);
    } catch (err) {
      console.warn('Failed to update notes in Firestore:', err);
    }
  };

  const handleSaveBooking = async (booking: ConsultationBooking) => {
    if (!currentResult) return;
    const clientId = currentResult.id;

    const updatedClient: ClientSubmission = {
      ...currentResult,
      booking,
      status: 'ugovoren_sastanak'
    };

    setClients(prev =>
      prev.map(c => (c.id === clientId ? updatedClient : c))
    );
    setCurrentResult(updatedClient);

    try {
      await updateSubmissionBookingInFirestore(clientId, booking);
    } catch (err) {
      console.warn('Failed to update booking in Firestore:', err);
    }

    setNotification({
      client: updatedClient,
      timestamp: Date.now()
    });
  };

  const handleDeleteClient = (clientId: string) => {
    setClients(prev => prev.filter(c => c.id !== clientId));
    if (currentResult && currentResult.id === clientId) {
      setCurrentResult(null);
      setActiveTab(isAdmin ? 'admin' : 'upitnik');
    }
  };

  const handleResetToSampleData = () => {
    if (confirm('Da li želite da vratite bazu na ogledne klijente?')) {
      setClients(SAMPLE_CLIENTS);
      setCurrentResult(SAMPLE_CLIENTS[0]);
    }
  };

  const handleExportAllExcel = () => {
    exportClientsToExcel(clients, 'People_Pro_HR_Baza_Klijenata.xlsx');
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('peoplepro_admin_auth');
    localStorage.removeItem('peoplepro_admin_auth_time');
    localStorage.removeItem('peoplepro_hr_dijagnoza_clients_v2');
    sessionStorage.removeItem('peoplepro_admin_auth');
    sessionStorage.removeItem('peoplepro_admin_session');
    setIsAdmin(false);
    setClients([]);
    setCurrentResult(null);
    setActiveTab('upitnik');
  };

  // Quick fill demo and jump to results
  const handleFillDemo = () => {
    const demoCompany: CompanyInfo = {
      companyName: 'Balkan Logistic & Freight d.o.o.',
      pib: '109283741',
      maticniBroj: '20918273',
      industry: 'Transport i logistika',
      employeeCount: '51-150',
      contactPerson: 'Nikola Mandić',
      contactRole: 'Direktor logistike i vlasnik',
      email: 'nikola.mandic@balkanlogistic.rs',
      phone: '+381 65 330 2211',
      city: 'Beograd',
      hrSetup: 'Nema internog HR-a (osnivač/menadžeri vode)',
      primaryChallengeNote: 'Veliki odlazak dispečera i vozača, nedostatak uvođenja novih ljudi u posao i netransparentne plate.',
      dataPrivacyConsent: true,
      consentTimestamp: new Date().toISOString()
    };

    const demoAnswers: Record<string, number> = {
      regrutacija_q1: 2, regrutacija_q2: 1, regrutacija_q3: 1,
      onboarding_q1: 1, onboarding_q2: 2, onboarding_q3: 1,
      tim_struktura_q1: 2, tim_struktura_q2: 2, tim_struktura_q3: 1,
      komunikacija_q1: 2, komunikacija_q2: 2, komunikacija_q3: 2,
      zadovoljstvo_q1: 1, zadovoljstvo_q2: 2, zadovoljstvo_q3: 2,
      razvoj_q1: 1, razvoj_q2: 1, razvoj_q3: 2,
      ucinak_kpi_q1: 2, ucinak_kpi_q2: 1, ucinak_kpi_q3: 1,
      fluktuacija_q1: 1, fluktuacija_q2: 1, fluktuacija_q3: 1,
      plate_benefiti_q1: 2, plate_benefiti_q2: 1, plate_benefiti_q3: 2,
      wellbeing_q1: 1, wellbeing_q2: 1, wellbeing_q3: 2
    };

    handleAssessmentSubmit(demoCompany, demoAnswers);
  };

  const criticalClientsCount = clients.filter(c => c.scores.redPoints.length > 0).length;

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans text-slate-800 antialiased selection:bg-blue-100 selection:text-[#2761ff]">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        clientCount={clients.length}
        criticalClientsCount={criticalClientsCount}
        onNewAssessment={() => {
          setActiveTab('upitnik');
          window.scrollTo({ top: 380, behavior: 'smooth' });
        }}
        onExportExcelAll={handleExportAllExcel}
        hasActiveResult={!!currentResult}
        onOpenQuestionsCatalog={() => setShowCatalogModal(true)}
        isAdmin={isAdmin}
        onOpenAdminLogin={() => setShowAdminAuthModal(true)}
        onAdminLogout={handleAdminLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'upitnik' && (
          <div>
            <HeroSection
              onStartClick={() => {
                const el = document.getElementById('assessment-wizard');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              onFillDemo={handleFillDemo}
              onOpenQuestionsCatalog={() => setShowCatalogModal(true)}
              isAdmin={isAdmin}
            />

            <div id="assessment-wizard">
              <ClientForm
                onSubmit={handleAssessmentSubmit}
                onCancel={() => {
                  if (currentResult) setActiveTab('rezultati');
                }}
                isAdmin={isAdmin}
              />
            </div>
          </div>
        )}

        {activeTab === 'rezultati' && currentResult && (
          <InteractiveResults
            client={currentResult}
            onOpenEmailModal={(c) => setEmailModalClient(c)}
            onGoToDatabase={() => {
              if (isAdmin) {
                setActiveTab('admin');
              } else {
                setShowAdminAuthModal(true);
              }
            }}
            onTriggerNotification={(c) => setNotification({ client: c, timestamp: Date.now() })}
            onPrintReport={() => setPrintClient(currentResult)}
            isAdmin={isAdmin}
            onSaveBooking={handleSaveBooking}
          />
        )}

        {/* Admin Dashboard - Strictly protected for Dragana */}
        {activeTab === 'admin' && isAdmin && (
          <AdminDashboard
            clients={clients}
            onSelectClient={(c) => {
              setCurrentResult(c);
              setActiveTab('rezultati');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenEmailModal={(c) => setEmailModalClient(c)}
            onUpdateClientStatus={handleUpdateStatus}
            onUpdateClientNotes={handleUpdateNotes}
            onDeleteClient={handleDeleteClient}
            onNewAssessment={() => setActiveTab('upitnik')}
            onResetToSampleData={handleResetToSampleData}
          />
        )}
      </main>

      {/* Email Report Generator Modal */}
      {emailModalClient && (
        <EmailModal
          client={emailModalClient}
          onClose={() => setEmailModalClient(null)}
          onMarkAsSent={(id) => handleUpdateStatus(id, 'poslat_izvestaj')}
        />
      )}

      {/* Print / PDF Document Viewer Modal */}
      {printClient && (
        <PrintReport
          client={printClient}
          onClose={() => setPrintClient(null)}
        />
      )}

      {/* Questions Catalog Modal */}
      {showCatalogModal && (
        <QuestionsCatalogModal
          onClose={() => setShowCatalogModal(false)}
        />
      )}

      {/* Admin Authentication Modal */}
      <AdminAuthModal
        isOpen={showAdminAuthModal}
        onClose={() => setShowAdminAuthModal(false)}
        onSuccess={() => {
          sessionStorage.setItem('peoplepro_admin_session', 'true');
          setIsAdmin(true);
          try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
              const parsed = JSON.parse(stored);
              if (Array.isArray(parsed) && parsed.length > 0) {
                setClients(parsed);
                setActiveTab('admin');
                return;
              }
            }
          } catch (e) {
            // fallback
          }
          setClients(SAMPLE_CLIENTS);
          setActiveTab('admin');
        }}
      />

      {/* Live Notification Toast for Dragana */}
      <NotificationToast
        notification={notification}
        onClose={() => setNotification(null)}
        onOpenReport={(c) => {
          setCurrentResult(c);
          setActiveTab('rezultati');
          setNotification(null);
        }}
        onOpenEmail={(c) => {
          setEmailModalClient(c);
          setNotification(null);
        }}
      />

      {/* Floating AI HR Consultant Chat Widget (clean, without bouncing teaser) */}
      <ChatWidget currentResult={currentResult} />

      {/* Footer */}
      <footer className="no-print bg-white border-t border-slate-200 mt-16 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src="/peoplepro-logo.png"
              alt="People Pro"
              className="h-8 w-auto object-contain"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = 'https://www.peoplepro.rs/wp-content/uploads/2025/11/PeopleProLogo-1.png';
              }}
            />
            <div>
              <p className="font-bold text-slate-800">People Pro HR Konsalting</p>
              <p className="text-[11px] text-slate-400">
                Vaš partner za ljudske resurse sa srcem • Beograd, Srbija
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-[11px] font-medium text-slate-600">
            <a
              href="https://www.peoplepro.rs"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#2761ff] transition-colors"
            >
              Zvanični sajt: peoplepro.rs
            </a>
            <a
              href="tel:+381601317282"
              className="hover:text-[#2761ff] transition-colors"
            >
              Tel: +381 60 131 72 82
            </a>
            <a
              href="mailto:dragana.peoplepro@gmail.com"
              className="hover:text-[#2761ff] transition-colors"
            >
              Email: dragana.peoplepro@gmail.com
            </a>

            {/* Admin entry point in footer */}
            {!isAdmin ? (
              <button
                onClick={() => setShowAdminAuthModal(true)}
                className="hover:text-[#2761ff] transition-colors flex items-center gap-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                title="Prijavite se kao administrator"
              >
                <Lock className="w-3 h-3" />
                <span>Admin zona</span>
              </button>
            ) : (
              <button
                onClick={handleAdminLogout}
                className="text-red-500 hover:text-red-700 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>Odjavi admina</span>
              </button>
            )}
          </div>

          <p className="text-[11px] text-slate-400">
            © {new Date().getFullYear()} People Pro. Sva prava zadržana.
          </p>
        </div>
      </footer>
    </div>
  );
}
