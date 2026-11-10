import { ClientSubmission } from '../types';
import { getAccessToken } from '../lib/googleAuth';

/**
 * Encodes a UTF-8 string to base64url (required by Gmail API)
 */
function toBase64Url(str: string): string {
  const utf8Bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < utf8Bytes.length; i++) {
    binary += String.fromCharCode(utf8Bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Encodes email subject header with UTF-8 MIME encoding
 */
function encodeSubject(subject: string): string {
  const utf8Bytes = new TextEncoder().encode(subject);
  let binary = '';
  for (let i = 0; i < utf8Bytes.length; i++) {
    binary += String.fromCharCode(utf8Bytes[i]);
  }
  return `=?utf-8?B?${btoa(binary)}?=`;
}

/**
 * Builds the personalized text email body for the client.
 * Does not include commercial package sales pitch, but focuses on the
 * diagnostic findings, personalized thank-you note from Dragana Stanimirović,
 * and invitation to a free 30-minute strategic consultation.
 */
export function buildClientEmailContent(client: ClientSubmission) {
  const { companyInfo, scores } = client;

  const subject = `People Pro HR Dijagnoza – Rezultati i zahvalnica za ${companyInfo.companyName}`;

  const redPointsSection = scores.redPoints && scores.redPoints.length > 0
    ? `🚨 DETEKTOVANE OBLASTI ZA PAŽNJU (Ocena ispod 50%):
${scores.redPoints.map((rp, i) => `${i + 1}. ${rp.categoryTitle} – Ocena: ${rp.score}%
   • Primećeno odstupanje: ${rp.critique}`).join('\n\n')}`
    : `✅ Sve ispitivane HR oblasti su stabilne (nema kritičnih odstupanja ispod 50%).`;

  const contactGreeting = companyInfo.contactPerson ? companyInfo.contactPerson : 'saradniče';

  const body = `Poštovani/a ${contactGreeting},

Iskreno Vam hvala na ukazanom poverenju i izdvojenom vremenu za popunjavanje People Pro upitnika za HR dijagnostiku organizacionog zdravlja za kompaniju ${companyInfo.companyName}.

📊 SAŽETAK REZULTATA VAŠE KOMPANIJE:
• Ukupni HR indeks organizacione zrelosti: ${scores.overallScore}% od 100%
• Nivo organizacionog rizika: ${scores.overallRiskLevel.toUpperCase()}
• Broj oblasti kojima je potrebna pažnja: ${scores.redPoints.length}

${redPointsSection}

🤝 ZAHVALNICA & POZIV NA STRATEŠKE KONSULTACIJE:
Ljudski resursi su srce i snaga svakog uspešnog biznisa. Prepoznavanje tačaka u kojima postoje operativna trenja ili prostor za razvoj prvi je i najvažniji korak ka jačanju stabilnosti tima, smanjenju stresa i povećanju profitabilnosti.

Kako bismo ove nalaze pretvorili u praktičan plan skrojen specifično za potrebe Vaše kompanije, sa velikim zadovoljstvom Vas pozivam na besplatne 30-minutne strateške konsultacije. Na sastanku ćemo proći kroz detalje i definisati prioritete koji odmah donose rasterećenje.

Kontakt podaci za zakazivanje konsultacija:
• Telefon: +381 60 131 72 82
• Email: dragana.peoplepro@gmail.com
• Zvanični sajt: https://www.peoplepro.rs

Radujem se našem razgovoru i prilici da podržim rast Vašeg tima!

Srdačan pozdrav,

Dragana Stanimirović
Osnivač i HR konsultant | People Pro
"Vaš partner za ljudske resurse sa srcem"`;

  return { subject, body, recipient: companyInfo.email };
}

export interface SendEmailResult {
  success: boolean;
  method: 'gmail_api' | 'server_dispatch' | 'mailto_ready';
  message: string;
  recipient: string;
}

/**
 * Sends or dispatches the diagnostic result email directly to the client
 */
export async function dispatchDiagnosticReportEmail(
  client: ClientSubmission
): Promise<SendEmailResult> {
  const { subject, body, recipient } = buildClientEmailContent(client);

  if (!recipient || !recipient.includes('@')) {
    return {
      success: false,
      method: 'mailto_ready',
      message: 'Klijent nije uneo ispravnu email adresu.',
      recipient: recipient || ''
    };
  }

  // 1. Try sending via Gmail API if user has connected Google account
  const accessToken = await getAccessToken();
  if (accessToken) {
    try {
      const rawMessage = [
        `To: ${recipient}`,
        `Cc: dragana.peoplepro@gmail.com`,
        `Subject: ${encodeSubject(subject)}`,
        `MIME-Version: 1.0`,
        `Content-Type: text/plain; charset=UTF-8`,
        `Content-Transfer-Encoding: base64`,
        '',
        toBase64Url(body)
      ].join('\r\n');

      const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          raw: toBase64Url(rawMessage)
        })
      });

      if (response.ok) {
        return {
          success: true,
          method: 'gmail_api',
          message: `Izveštaj i zahvalnica su poslati putem Gmail-a na adresu ${recipient}! Kopija je prosleđena na dragana.peoplepro@gmail.com.`,
          recipient
        };
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.warn('Gmail API send response was not ok:', errorData);
      }
    } catch (err) {
      console.warn('Greška pri slanju preko Gmail API:', err);
    }
  }

  // 2. Dispatch via server endpoint (logs and queues report notification)
  try {
    const serverRes = await fetch('/api/send-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId: client.id,
        recipient,
        companyName: client.companyInfo.companyName,
        overallScore: client.scores.overallScore,
        riskLevel: client.scores.overallRiskLevel,
        subject,
        body
      })
    });

    if (serverRes.ok) {
      const resData = await serverRes.json().catch(() => ({}));
      return {
        success: true,
        method: 'server_dispatch',
        message: resData.message || `Rezultati i zahvalnica su evidentirani za isporuku na ${recipient}. Kopija je prosleđena za konsultanta Draganu Stanimirović.`,
        recipient
      };
    }
  } catch (err) {
    console.warn('Greška pri server dispatch-u:', err);
  }

  // 3. Fallback
  return {
    success: true,
    method: 'mailto_ready',
    message: `Izveštaj i zahvalnica su pripremljeni za slanje na ${recipient}.`,
    recipient
  };
}
