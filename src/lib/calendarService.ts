import { ClientSubmission, ConsultationBooking } from '../types';
import { getAccessToken } from './googleAuth';

export const CONSULTANT_EMAIL = 'dragana.peoplepro@gmail.com';
export const CONSULTANT_NAME = 'Dragana Stanimirović';
export const CONSULTANT_PHONE = '+381 60 131 72 82';

export const DEFAULT_TIME_SLOTS = [
  '09:00 - 09:30',
  '09:45 - 10:15',
  '10:30 - 11:00',
  '11:30 - 12:00',
  '13:00 - 13:30',
  '14:00 - 14:30',
  '15:00 - 15:30',
  '16:00 - 16:30'
];

export interface AvailableDay {
  dateString: string; // YYYY-MM-DD
  displayDay: string; // npr. "Sre"
  displayDate: string; // npr. "12. nov"
  fullLabel: string; // npr. "Sreda, 12. novembar 2026."
  isToday: boolean;
}

/**
 * Returns the next available business days (Monday - Friday) excluding weekends
 */
export const getAvailableWorkdays = (count: number = 10): AvailableDay[] => {
  const days: AvailableDay[] = [];
  const serbianDayNamesShort = ['Ned', 'Pon', 'Uto', 'Sre', 'Čet', 'Pet', 'Sub'];
  const serbianDayNamesFull = [
    'Nedelja',
    'Ponedeljak',
    'Utorak',
    'Sreda',
    'Četvrtak',
    'Petak',
    'Subota'
  ];
  const serbianMonthNamesShort = [
    'jan',
    'feb',
    'mar',
    'apr',
    'maj',
    'jun',
    'jul',
    'avg',
    'sep',
    'okt',
    'nov',
    'dec'
  ];
  const serbianMonthNamesFull = [
    'januar',
    'februar',
    'mart',
    'april',
    'maj',
    'jun',
    'jul',
    'avgust',
    'septembar',
    'oktobar',
    'novembar',
    'decembar'
  ];

  const now = new Date();
  const current = new Date(now);
  // Start offering from tomorrow if late in the day (after 15h) or today if morning
  if (now.getHours() >= 15) {
    current.setDate(current.getDate() + 1);
  }

  while (days.length < count) {
    const dayOfWeek = current.getDay();
    // 0 = Sunday, 6 = Saturday
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      const year = current.getFullYear();
      const month = String(current.getMonth() + 1).padStart(2, '0');
      const day = String(current.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;

      const isToday =
        now.getFullYear() === current.getFullYear() &&
        now.getMonth() === current.getMonth() &&
        now.getDate() === current.getDate();

      days.push({
        dateString,
        displayDay: serbianDayNamesShort[dayOfWeek],
        displayDate: `${current.getDate()}. ${serbianMonthNamesShort[current.getMonth()]}`,
        fullLabel: `${serbianDayNamesFull[dayOfWeek]}, ${current.getDate()}. ${serbianMonthNamesFull[current.getMonth()]} ${year}.`,
        isToday
      });
    }
    current.setDate(current.getDate() + 1);
  }

  return days;
};

/**
 * Converts date string (YYYY-MM-DD) and slot ("10:00 - 10:30") to ISO 8601 strings
 */
export const parseSlotToDateTime = (
  dateStr: string,
  timeSlot: string
): { startIso: string; endIso: string; startFormatted: string; endFormatted: string } => {
  const [startTime, endTime] = timeSlot.split(' - ').map(s => s.trim());
  const [startHour, startMin] = (startTime || '10:00').split(':').map(Number);
  const [endHour, endMin] = (endTime || '10:30').split(':').map(Number);

  const [year, month, day] = dateStr.split('-').map(Number);

  // Belgrade timezone is UTC+1 (standard) or UTC+2 (daylight saving)
  const pad = (n: number) => String(n).padStart(2, '0');

  const startIso = `${year}-${pad(month)}-${pad(day)}T${pad(startHour)}:${pad(startMin)}:00+01:00`;
  const endIso = `${year}-${pad(month)}-${pad(day)}T${pad(endHour)}:${pad(endMin)}:00+01:00`;

  return {
    startIso,
    endIso,
    startFormatted: `${pad(day)}.${pad(month)}.${year} u ${startTime}`,
    endFormatted: `${pad(day)}.${pad(month)}.${year} u ${endTime}`
  };
};

/**
 * Creates an event in Google Calendar with Google Meet video call via Google Calendar API v3
 */
export const createGoogleCalendarEvent = async (
  client: ClientSubmission,
  booking: ConsultationBooking,
  customToken?: string
): Promise<{
  success: boolean;
  eventId?: string;
  meetLink?: string;
  htmlLink?: string;
  error?: string;
}> => {
  const token = customToken || (await getAccessToken());

  if (!token) {
    return {
      success: false,
      error: 'Google nalog nije autorizovan za kalendar.'
    };
  }

  const { startIso, endIso } = parseSlotToDateTime(booking.date, booking.timeSlot);

  const redPointsSummary =
    client.scores.redPoints.length > 0
      ? client.scores.redPoints.map(r => `• ${r.categoryTitle} (${r.score}%)`).join('\n')
      : 'Nema kritičnih crvenih tačaka (sve oblasti ≥ 50%)';

  const description = [
    `HR STRETEŠKE KONSULTACIJE — PEOPLE PRO`,
    `--------------------------------------`,
    `Kompanija: ${booking.companyName}`,
    `Kontakt osoba: ${booking.clientName}`,
    `Email: ${booking.clientEmail}`,
    `Telefon: ${booking.clientPhone}`,
    `Format: ${booking.meetingType === 'google_meet' ? 'Google Meet Video Poziv' : 'Telefonski poziv'}`,
    ``,
    `TEMA I FOKUS:`,
    `${booking.discussionTopic || 'Diskusija o rezultatima organizacione HR dijagnostike i definisanje akcionog plana.'}`,
    ``,
    `REZULTATI DIJAGNOSTIKE:`,
    `Ukupan skor: ${client.scores.overallScore}% (${client.scores.overallRiskLevel} nivo rizika)`,
    `Preporučeni model: ${client.scores.recommendedTier}`,
    ``,
    `Kritične oblasti (Crvene zone):`,
    redPointsSummary,
    ``,
    `Konsultant: Dragana Stanimirović | People Pro`,
    `Telefon: ${CONSULTANT_PHONE}`,
    `Email: ${CONSULTANT_EMAIL}`,
    `Web: www.peoplepro.rs`
  ].join('\n');

  const eventPayload: any = {
    summary: `People Pro HR Konsultacije — ${booking.companyName} (${booking.clientName})`,
    description,
    start: {
      dateTime: startIso,
      timeZone: 'Europe/Belgrade'
    },
    end: {
      dateTime: endIso,
      timeZone: 'Europe/Belgrade'
    },
    attendees: [
      {
        email: CONSULTANT_EMAIL,
        displayName: `${CONSULTANT_NAME} (People Pro)`,
        organizer: true,
        responseStatus: 'accepted'
      },
      {
        email: booking.clientEmail,
        displayName: booking.clientName
      }
    ],
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 1440 }, // 24h pre
        { method: 'popup', minutes: 30 } // 30 min pre
      ]
    }
  };

  // Enable Google Meet conferencing if requested
  if (booking.meetingType === 'google_meet') {
    eventPayload.conferenceData = {
      createRequest: {
        requestId: `peoplepro-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        conferenceSolutionKey: {
          type: 'hangoutsMeet'
        }
      }
    };
  }

  try {
    const url =
      'https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1&sendUpdates=all';
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(eventPayload)
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn('Google Calendar API response error:', response.status, errText);
      return {
        success: false,
        error: `Google Calendar greška (${response.status}): ${errText}`
      };
    }

    const data = await response.json();
    const meetLink =
      data.hangoutLink ||
      data.conferenceData?.entryPoints?.find((e: any) => e.entryPointType === 'video')?.uri;

    return {
      success: true,
      eventId: data.id,
      meetLink: meetLink || undefined,
      htmlLink: data.htmlLink
    };
  } catch (err: any) {
    console.error('Greška pri kreiranju Google Calendar događaja:', err);
    return {
      success: false,
      error: err.message || 'Neuspešno povezivanje sa Google Calendar servisom.'
    };
  }
};

/**
 * Generates direct Google Calendar URL so any client can add the session to their personal Google Calendar with 1-click
 */
export const generateGoogleCalendarWebUrl = (
  booking: ConsultationBooking,
  client: ClientSubmission,
  meetLink?: string
): string => {
  const { startIso, endIso } = parseSlotToDateTime(booking.date, booking.timeSlot);

  // Format UTC dates for Google Calendar render link: YYYYMMDDTHHmmssZ
  const toUtcString = (isoStr: string) => {
    const d = new Date(isoStr);
    return d.toISOString().replace(/-|:|\.\d\d\d/g, '');
  };

  const datesParam = `${toUtcString(startIso)}/${toUtcString(endIso)}`;
  const title = encodeURIComponent(
    `People Pro HR Konsultacije — ${booking.companyName} & Dragana Stanimirović`
  );

  const locationText =
    booking.meetingType === 'google_meet'
      ? meetLink || 'Google Meet video poziv'
      : `Telefonski poziv: ${CONSULTANT_PHONE}`;

  const detailsText = encodeURIComponent(
    [
      `Strateške 30-minutne HR konsultacije sa Draganom Stanimirović (People Pro).`,
      ``,
      `Kompanija: ${booking.companyName}`,
      `Fokus: ${booking.discussionTopic || 'Pregled HR radara i crvenih tačaka'}`,
      `Lokacija / Pristup: ${locationText}`,
      `Kontakt konsultanta: ${CONSULTANT_PHONE} | ${CONSULTANT_EMAIL}`,
      ``,
      `Vaš HR partner sa srcem — www.peoplepro.rs`
    ].join('\n')
  );

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${datesParam}&details=${detailsText}&location=${encodeURIComponent(
    locationText
  )}&add=${encodeURIComponent(CONSULTANT_EMAIL)}`;
};

/**
 * Generates and triggers download of a universal .ics calendar file
 * Compatible with Apple Calendar, Microsoft Outlook, Android, etc.
 */
export const downloadIcsCalendarFile = (
  booking: ConsultationBooking,
  client: ClientSubmission,
  meetLink?: string
) => {
  const { startIso, endIso } = parseSlotToDateTime(booking.date, booking.timeSlot);
  const toUtcString = (isoStr: string) => {
    const d = new Date(isoStr);
    return d.toISOString().replace(/-|:|\.\d\d\d/g, '');
  };

  const location =
    booking.meetingType === 'google_meet'
      ? meetLink || 'Google Meet Video Poziv'
      : `Telefonski poziv: ${CONSULTANT_PHONE}`;

  const summary = `People Pro HR Konsultacije — ${booking.companyName}`;
  const description = `Strateške konsultacije sa Draganom Stanimirović (People Pro).\\nFokus: ${booking.discussionTopic || 'HR dijagnostika'}\\nTelefon: ${CONSULTANT_PHONE}\\nEmail: ${CONSULTANT_EMAIL}`;

  const icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//People Pro HR//HR Dijagnoza//SR',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:peoplepro-${Date.now()}@peoplepro.rs`,
    `DTSTAMP:${toUtcString(new Date().toISOString())}`,
    `DTSTART:${toUtcString(startIso)}`,
    `DTEND:${toUtcString(endIso)}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    `ORGANIZER;CN="Dragana Stanimirović":MAILTO:${CONSULTANT_EMAIL}`,
    `ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=ACCEPTED;CN="${booking.clientName}":MAILTO:${booking.clientEmail}`,
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-PT30M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Podsetnik za HR konsultacije sa People Pro',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ];

  const icsData = icsLines.join('\r\n');
  const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `PeoplePro_HR_Konsultacije_${booking.date}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
