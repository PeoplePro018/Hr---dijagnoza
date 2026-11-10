import React, { useState, useEffect } from 'react';
import { Bell, ArrowRight, X, Mail, Calendar, Video, Phone, CheckCircle2, CalendarPlus, ExternalLink, Loader2, Sparkles } from 'lucide-react';
import { ClientSubmission } from '../types';
import { createGoogleCalendarEvent, generateGoogleCalendarWebUrl, downloadIcsCalendarFile } from '../lib/calendarService';
import { getAccessToken } from '../lib/googleAuth';
import { updateSubmissionBookingInFirestore } from '../lib/firebase';

interface NotificationToastProps {
  notification: {
    client: ClientSubmission;
    timestamp: number;
  } | null;
  onClose: () => void;
  onOpenReport: (client: ClientSubmission) => void;
  onOpenEmail: (client: ClientSubmission) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  notification,
  onClose,
  onOpenReport,
  onOpenEmail
}) => {
  const [calendarSyncState, setCalendarSyncState] = useState<'idle' | 'syncing' | 'synced' | 'ready'>('idle');
  const [syncedLink, setSyncedLink] = useState<string | null>(null);

  if (!notification) return null;

  const { client } = notification;
  const isBooking = !!client.booking;
  const redCount = client.scores.redPoints.length;

  // Automatically attempt to schedule the event into Google Calendar when booking notification fires
  useEffect(() => {
    if (!isBooking || !client.booking) return;

    let isMounted = true;
    const autoSchedule = async () => {
      // Check if already synced
      if (client.booking?.calendarEventId) {
        if (isMounted) {
          setCalendarSyncState('synced');
          setSyncedLink(client.booking.calendarHtmlLink || null);
        }
        return;
      }

      setCalendarSyncState('syncing');
      try {
        const token = await getAccessToken();
        if (token && client.booking) {
          const res = await createGoogleCalendarEvent(client, client.booking, token);
          if (res.success && res.eventId) {
            const updatedBooking = {
              ...client.booking,
              calendarEventId: res.eventId,
              googleMeetLink: res.meetLink,
              calendarHtmlLink: res.htmlLink
            };
            await updateSubmissionBookingInFirestore(client.id, updatedBooking);
            if (isMounted) {
              setCalendarSyncState('synced');
              setSyncedLink(res.htmlLink || null);
            }
            return;
          }
        }
        if (isMounted) {
          setCalendarSyncState('ready');
        }
      } catch (err) {
        console.warn('Auto schedule notification attempt:', err);
        if (isMounted) setCalendarSyncState('ready');
      }
    };

    autoSchedule();
    return () => { isMounted = false; };
  }, [client.id, isBooking, notification.timestamp]);

  const googleCalWebUrl = isBooking && client.booking
    ? generateGoogleCalendarWebUrl(client.booking, client, client.booking.googleMeetLink)
    : '#';

  return (
    <div className={`fixed bottom-5 right-5 z-50 max-w-md w-full rounded-2xl shadow-2xl border p-4 transition-all animate-bounce-short ${
      isBooking ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 border-emerald-500/50 text-white' : 'bg-slate-900 border-slate-700 text-white'
    }`}>
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
          isBooking ? 'bg-emerald-600 text-white shadow-lg ring-2 ring-emerald-400/50' : 'bg-blue-600 text-white'
        }`}>
          {isBooking ? <Calendar className="w-5 h-5 animate-pulse" /> : <Bell className="w-5 h-5 animate-pulse" />}
        </div>

        <div className="flex-1 text-xs">
          <div className="flex items-center justify-between">
            <span className={`font-black uppercase text-[10px] tracking-wider px-2 py-0.5 rounded ${
              isBooking ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/40' : 'bg-blue-500/30 text-blue-300'
            }`}>
              {isBooking ? '🔔 IMATE NOVI TERMIN ZAKAZAN!' : 'Obaveštenje za People Pro'}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-0.5 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <h4 className="font-extrabold text-sm text-white mt-1">
            {client.companyInfo.companyName}
          </h4>

          {isBooking && client.booking && (
            <div className="my-2 p-2.5 rounded-xl bg-emerald-950/70 border border-emerald-500/50 text-[11px] space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-emerald-200">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{client.booking.date} u {client.booking.timeSlot}</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-800 text-emerald-200 font-bold">
                  30 min
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-slate-300">
                {client.booking.meetingType === 'google_meet' ? (
                  <Video className="w-3.5 h-3.5 text-blue-400" />
                ) : (
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                )}
                <span>Format: {client.booking.meetingType === 'google_meet' ? 'Google Meet video sastanak' : 'Telefonski poziv'}</span>
              </div>

              {/* Automatic Google Calendar status banner inside toast */}
              <div className="pt-1 border-t border-emerald-800/60 mt-1">
                {calendarSyncState === 'syncing' && (
                  <div className="flex items-center gap-1.5 text-emerald-300 font-semibold text-[11px]">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Automatski upisujem termin u Vaš Google Kalendar...</span>
                  </div>
                )}

                {calendarSyncState === 'synced' && (
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1 text-emerald-300 font-bold text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Zakazano u Vašem kalendaru!</span>
                    </span>
                    <a
                      href={syncedLink || 'https://calendar.google.com'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] shadow-xs cursor-pointer"
                    >
                      <span>Otvori</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                )}

                {(calendarSyncState === 'ready' || calendarSyncState === 'idle') && (
                  <div className="flex items-center justify-between gap-2 pt-0.5">
                    <span className="text-slate-300 text-[10px]">
                      Upis u Vaš kalendar:
                    </span>
                    <a
                      href={googleCalWebUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[11px] shadow-md transition-all cursor-pointer"
                      title="Automatski otvori Google Kalendar sa popunjenim podacima termina"
                    >
                      <CalendarPlus className="w-3.5 h-3.5" />
                      <span>Upisi u Google kalendar</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          <p className="text-slate-300 text-[11px]">
            Kontakt: <strong>{client.companyInfo.contactPerson}</strong> ({client.companyInfo.phone})
          </p>

          <div className="flex items-center gap-2 mt-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/30 text-blue-200">
              Skor: {client.scores.overallScore}%
            </span>
            {redCount > 0 && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/40 text-red-300">
                🚨 {redCount} crvene tačke!
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-800">
            {isBooking && client.booking?.googleMeetLink ? (
              <a
                href={client.booking.googleMeetLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-bold text-emerald-300 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <Video className="w-3.5 h-3.5" />
                <span>Otvori Meet link</span>
              </a>
            ) : (
              <button
                type="button"
                onClick={() => onOpenEmail(client)}
                className="text-[11px] font-bold text-[#77acfd] hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Pošalji mejl klijentu</span>
              </button>
            )}
            <span className="text-slate-600">•</span>
            <button
              type="button"
              onClick={() => onOpenReport(client)}
              className="text-[11px] font-bold text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <span>Pogledaj radar</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
