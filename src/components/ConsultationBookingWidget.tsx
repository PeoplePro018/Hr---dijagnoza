import React, { useState } from 'react';
import { ClientSubmission, ConsultationBooking } from '../types';
import {
  Calendar as CalendarIcon,
  Clock,
  Video,
  Phone,
  CheckCircle2,
  CalendarPlus,
  Download,
  ExternalLink,
  Sparkles,
  AlertCircle,
  Loader2,
  User,
  Building,
  Mail,
  FileText
} from 'lucide-react';
import {
  getAvailableWorkdays,
  DEFAULT_TIME_SLOTS,
  createGoogleCalendarEvent,
  generateGoogleCalendarWebUrl,
  downloadIcsCalendarFile,
  CONSULTANT_NAME,
  CONSULTANT_EMAIL,
  CONSULTANT_PHONE,
  AvailableDay
} from '../lib/calendarService';
import { getAccessToken } from '../lib/googleAuth';

interface ConsultationBookingWidgetProps {
  client: ClientSubmission;
  onSaveBooking: (booking: ConsultationBooking) => Promise<void>;
  isAdmin?: boolean;
}

export const ConsultationBookingWidget: React.FC<ConsultationBookingWidgetProps> = ({
  client,
  onSaveBooking,
  isAdmin = false
}) => {
  const availableDays = getAvailableWorkdays(10);

  // If client already has a saved booking
  const existingBooking = client.booking;

  const [selectedDay, setSelectedDay] = useState<AvailableDay>(
    availableDays[0] || {
      dateString: new Date().toISOString().split('T')[0],
      displayDay: 'Pon',
      displayDate: '10. nov',
      fullLabel: 'Ponedeljak',
      isToday: false
    }
  );

  const [selectedSlot, setSelectedSlot] = useState<string>(DEFAULT_TIME_SLOTS[2] || '10:30 - 11:00');
  const [meetingType, setMeetingType] = useState<'google_meet' | 'phone'>('google_meet');

  // Topic suggestion based on red points
  const defaultTopic =
    client.scores.redPoints.length > 0
      ? `Rešavanje kritičnih tačaka: ${client.scores.redPoints
          .slice(0, 2)
          .map(r => r.categoryTitle)
          .join(', ')}`
      : 'Strateški HR prioriteti i optimizacija timskih procesa';

  const [topic, setTopic] = useState<string>(defaultTopic);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<ConsultationBooking | null>(
    existingBooking || null
  );

  const handleConfirmBooking = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);

    const bookingData: ConsultationBooking = {
      date: selectedDay.dateString,
      timeSlot: selectedSlot,
      meetingType,
      clientName: client.companyInfo.contactPerson || 'Predstavnik kompanije',
      clientEmail: client.companyInfo.email,
      clientPhone: client.companyInfo.phone,
      companyName: client.companyInfo.companyName,
      discussionTopic: topic.trim() || defaultTopic,
      status: 'confirmed',
      createdAt: new Date().toISOString()
    };

    try {
      // Check if we have Google Calendar access (if Dragana is signed in or token exists)
      const token = await getAccessToken();
      if (token) {
        const calResult = await createGoogleCalendarEvent(client, bookingData, token);
        if (calResult.success) {
          bookingData.calendarEventId = calResult.eventId;
          bookingData.googleMeetLink = calResult.meetLink;
          bookingData.calendarHtmlLink = calResult.htmlLink;
        }
      }

      // Save to client's record in Firestore
      await onSaveBooking(bookingData);
      setConfirmedBooking(bookingData);
    } catch (err: any) {
      console.error('Greška pri potvrdi termina:', err);
      setErrorMsg(
        'Termin je zabeležen, ali je došlo do privremene greške u sinhronizaciji. Dragana će Vas kontaktirati za potvrdu.'
      );
      // Still show the confirmed booking state locally so user has their details
      setConfirmedBooking(bookingData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeBooking = confirmedBooking || existingBooking;

  // Render confirmed state
  if (activeBooking) {
    const googleCalUrl = generateGoogleCalendarWebUrl(
      activeBooking,
      client,
      activeBooking.googleMeetLink
    );

    return (
      <div className="bg-gradient-to-br from-white via-blue-50/40 to-emerald-50/40 rounded-3xl border-2 border-emerald-300 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-emerald-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-sm">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase tracking-wide">
                Termin uspešno rezervisan
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                Vaše strateške HR konsultacije su zakazane!
              </h3>
            </div>
          </div>

          <div className="text-left sm:text-right bg-white/80 px-4 py-2 rounded-xl border border-emerald-100">
            <span className="text-xs text-slate-500 block">Konsultant</span>
            <span className="text-sm font-bold text-slate-900">{CONSULTANT_NAME}</span>
            <span className="text-xs text-emerald-700 block font-semibold">{CONSULTANT_PHONE}</span>
          </div>
        </div>

        {/* Meeting Details Summary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-[#2761ff] mb-1">
              <CalendarIcon className="w-4 h-4" />
              <span>Datum i vreme</span>
            </div>
            <p className="text-base font-black text-slate-900">{activeBooking.date}</p>
            <p className="text-xs font-bold text-slate-600 flex items-center gap-1 mt-0.5">
              <Clock className="w-3.5 h-3.5" />
              <span>{activeBooking.timeSlot} (30 minuta)</span>
            </p>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-[#2761ff] mb-1">
              {activeBooking.meetingType === 'google_meet' ? (
                <Video className="w-4 h-4" />
              ) : (
                <Phone className="w-4 h-4" />
              )}
              <span>Format sastanka</span>
            </div>
            <p className="text-sm font-black text-slate-900">
              {activeBooking.meetingType === 'google_meet'
                ? 'Google Meet Video Poziv'
                : 'Telefonski direktan poziv'}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {activeBooking.meetingType === 'google_meet'
                ? 'Link za pristup poslat je i na Vaš email.'
                : `Poziv na broj: ${activeBooking.clientPhone}`}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-[#2761ff] mb-1">
              <FileText className="w-4 h-4" />
              <span>Fokus razgovora</span>
            </div>
            <p className="text-xs font-bold text-slate-800 line-clamp-2">
              {activeBooking.discussionTopic || 'Pregled HR radara i crvenih tačaka'}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Kompanija: {activeBooking.companyName}
            </p>
          </div>
        </div>

        {/* Video Call Direct Link if available */}
        {activeBooking.googleMeetLink && (
          <div className="bg-blue-600 rounded-2xl p-4 text-white flex flex-col sm:flex-row items-center justify-between gap-3 mb-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <Video className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xs text-blue-200 uppercase font-bold tracking-wide">
                  Google Meet Link za sastanak
                </span>
                <p className="text-sm font-semibold truncate max-w-xs sm:max-w-md">
                  {activeBooking.googleMeetLink}
                </p>
              </div>
            </div>
            <a
              href={activeBooking.googleMeetLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-blue-700 font-bold text-xs hover:bg-blue-50 transition-colors shadow-xs shrink-0 cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Pridruži se sastanku</span>
            </a>
          </div>
        )}

        {/* Action Buttons: Add to Google Calendar & Download .ics & Email notification */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <a
            href={googleCalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#2761ff] hover:bg-[#1b4fd8] text-white font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
          >
            <CalendarPlus className="w-4 h-4" />
            <span>Dodaj u Google Kalendar (Pozovi Draganu)</span>
          </a>

          <a
            href={`mailto:${CONSULTANT_EMAIL}?subject=${encodeURIComponent(`Zahtev za termin konsultacija: ${activeBooking.companyName} (${activeBooking.date} u ${activeBooking.timeSlot})`)}&body=${encodeURIComponent(`Poštovana Dragana,\n\nIzabrali smo termin za besplatne HR strateške konsultacije:\nKompanija: ${activeBooking.companyName}\nKontakt osoba: ${activeBooking.clientName}\nTelefon: ${activeBooking.clientPhone}\nEmail: ${activeBooking.clientEmail}\nIzabrani termin: ${activeBooking.date} u ${activeBooking.timeSlot}\nFormat: ${activeBooking.meetingType === 'google_meet' ? 'Google Meet Video Poziv' : 'Telefonski poziv'}\nTema: ${activeBooking.discussionTopic || 'HR dijagnostika i organizacioni prioriteti'}\n\nRadujemo se razgovoru!`)}`}
            className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs sm:text-sm border border-emerald-300 shadow-xs transition-all cursor-pointer"
            title="Šalje email obaveštenje direktno Dragani Stanimirović"
          >
            <Mail className="w-4 h-4 text-emerald-600" />
            <span>Pošalji potvrdu Dragani na mejl</span>
          </a>

          <button
            type="button"
            onClick={() =>
              downloadIcsCalendarFile(activeBooking, client, activeBooking.googleMeetLink)
            }
            className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm border border-slate-300 shadow-xs transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Preuzmi kalendar (.ics)</span>
          </button>

          <button
            type="button"
            onClick={() => setConfirmedBooking(null)}
            className="text-xs text-slate-500 hover:text-slate-800 font-medium underline ml-auto cursor-pointer"
          >
            Promeni termin
          </button>
        </div>
      </div>
    );
  }

  // Booking Form Widget
  return (
    <div className="bg-white rounded-3xl border-2 border-blue-200 p-6 sm:p-8 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-[#2761ff] mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Besplatne Strateške HR Konsultacije (30 minuta)</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Izaberite termin za direktan razgovor sa Draganom Stanimirović
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            „Vaš partner za ljudske resurse sa srcem“ — analiziramo rezultate Vaše dijagnostike i
            predlažemo konkretne, primenljive korake za Vašu firmu.
          </p>
        </div>

        <div className="text-left md:text-right shrink-0 bg-slate-50 p-3 rounded-2xl border border-slate-200/70">
          <span className="text-[11px] text-slate-400 block font-bold uppercase tracking-wider">
            Direktan kontakt
          </span>
          <span className="text-sm font-bold text-slate-900 block">{CONSULTANT_NAME}</span>
          <a
            href="tel:+381601317282"
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 md:justify-end mt-0.5"
          >
            <Phone className="w-3 h-3" />
            {CONSULTANT_PHONE}
          </a>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Step 1: Pick a workday */}
      <div>
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2 mb-3">
          <CalendarIcon className="w-4 h-4 text-[#2761ff]" />
          <span>1. Izaberite radni dan</span>
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {availableDays.map(day => {
            const isSelected = selectedDay.dateString === day.dateString;
            return (
              <button
                type="button"
                key={day.dateString}
                onClick={() => setSelectedDay(day)}
                className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#2761ff] text-white border-[#2761ff] shadow-md shadow-blue-500/20 ring-2 ring-blue-300'
                    : 'bg-slate-50 hover:bg-blue-50/60 text-slate-800 border-slate-200'
                }`}
              >
                <span
                  className={`text-[11px] font-black uppercase tracking-wider block ${
                    isSelected ? 'text-blue-100' : 'text-slate-400'
                  }`}
                >
                  {day.displayDay}
                </span>
                <span className="text-sm font-black block mt-0.5">{day.displayDate}</span>
                {day.isToday && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded mt-1 inline-block ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-blue-100 text-[#2761ff]'
                    }`}
                  >
                    Danas
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 2: Pick a time slot */}
      <div>
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-[#2761ff]" />
          <span>2. Izaberite satnicu (30 min)</span>
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {DEFAULT_TIME_SLOTS.map(slot => {
            const isSelected = selectedSlot === slot;
            return (
              <button
                type="button"
                key={slot}
                onClick={() => setSelectedSlot(slot)}
                className={`py-2.5 px-3 rounded-xl text-center text-xs font-bold border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#2761ff] text-white border-[#2761ff] shadow-sm ring-2 ring-blue-200'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                {slot}
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 3: Meeting Format & Custom Topic */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <div>
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
            3. Format sastanka
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setMeetingType('google_meet')}
              className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                meetingType === 'google_meet'
                  ? 'bg-blue-50/80 border-[#2761ff] text-blue-900 ring-1 ring-[#2761ff]'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Video className="w-4 h-4 text-[#2761ff] shrink-0" />
              <div>
                <span className="text-xs font-bold block">Google Meet</span>
                <span className="text-[10px] text-slate-500">Video poziv sa linkom</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setMeetingType('phone')}
              className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                meetingType === 'phone'
                  ? 'bg-blue-50/80 border-[#2761ff] text-blue-900 ring-1 ring-[#2761ff]'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <span className="text-xs font-bold block">Telefonski poziv</span>
                <span className="text-[10px] text-slate-500">Poziv na Vaš broj</span>
              </div>
            </button>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
            4. Ključna tema / pitanje za razgovor
          </label>
          <input
            type="text"
            value={topic}
            onChange={e => setTopic(e.target.value)}
            placeholder="Npr. Fluktuacija kadrova, sistematizacija, nagrađivanje..."
            className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            Predloženo na osnovu slabijih tačaka detektovanih u Vašoj dijagnostici.
          </p>
        </div>
      </div>

      {/* Recipient info verification */}
      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/70 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <Building className="w-4 h-4 text-slate-400" />
          <span className="font-bold text-slate-800">{client.companyInfo.companyName}</span>
        </div>
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-slate-400" />
          <span>{client.companyInfo.contactPerson}</span>
        </div>
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-slate-400" />
          <span>{client.companyInfo.email}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-slate-400" />
          <span>{client.companyInfo.phone}</span>
        </div>
      </div>

      {/* Submit CTA */}
      <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="text-xs text-slate-500">
          <span>Izabrani termin: </span>
          <strong className="text-slate-900 font-bold">
            {selectedDay.fullLabel} u {selectedSlot}
          </strong>
        </div>

        <button
          type="button"
          disabled={isSubmitting}
          onClick={handleConfirmBooking}
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#2761ff] hover:bg-[#1b4fd8] disabled:bg-blue-300 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Zapisujem termin i povezujem kalendar...</span>
            </>
          ) : (
            <>
              <CalendarPlus className="w-4 h-4" />
              <span>Potvrdi i rezerviši besplatne konsultacije (30 min)</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
