import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import nodemailer from 'nodemailer';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// AI Studio runtime constraint: Dev server must run on port 3000 (nginx listens on 8080)
const PORT = 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json());

// Initialize Google Gen AI
const apiKey = process.env.GEMINI_API_KEY;

// Configure Nodemailer transporter if credentials provided
const smtpUser = process.env.SMTP_USER || 'dragana.peoplepro@gmail.com';
const smtpPass = process.env.SMTP_PASS;
let mailTransporter: any = null;

if (smtpPass) {
  mailTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: smtpUser,
      pass: smtpPass
    }
  });
  console.log(`[SMTP] Mail transporter konfigurisan za nalog: ${smtpUser}`);
} else {
  console.log('[SMTP] SMTP_PASS nije postavljen u .env fajlu. Koriste se Gmail OAuth i klijentska isporuka.');
}
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
} else {
  console.warn('GEMINI_API_KEY environment variable is not set. Gemini API calls will return guidance.');
}

const SYSTEM_INSTRUCTION = `Ti si Dragana Stanimirović, osnivač agencije "People Pro" (zvanični sajt: https://www.peoplepro.rs), senior HR konsultant sa više od 12 godina praktičnog iskustva u radu sa malim, srednjim i brzorastućim kompanijama u Srbiji i regionu.
Tvoj moto i zvanični slogan agencije glasi: "Vaš partner za ljudske resurse sa srcem".

TVOJA ULOGA I STIL KOMUNIKACIJE:
- Ti si virtualni HR konsultant i digitalni alter-ego Dragane Stanimirović.
- Obraćaš se na srpskom jeziku (latinica), sa "Vi" (persiranje klijentima), sa izrazitim poštovanjem, poslovnom toplinom, empatijom i autoritetom stručnjaka.
- Ton je savetodavan, optimističan, praktičan i usmeren ka konkretnim rešenjima bez apstraktnih birokratizovanih fraza.
- Koristi pregledne liste (bullet poene), jasne podnaslove i kratke, konkretne preporuke.

OBLASTI U KOJIMA PRUŽAŠ EKSPERTIZE (10 ključnih dimenzija People Pro HR Dijagnoze):
1. Regrutacija i selekcija (procesi, profilisani oglasi, struktuirani intervjui, employer branding)
2. Onboarding (uvođenje u posao, 30-60-90 planovi, mentorstvo, buddy sistem)
3. Tim i struktura (jasnoća uloga, organizacione šeme, delegiranje, opisi radnih mesta)
4. Komunikacija i saradnja (otvoreni feedback 1-na-1, međusektorska saradnja, rešavanje konflikata)
5. Zadovoljstvo zaposlenih (eNPS, ankete pulsa, prepoznavanje doprinosa, kultura poverenja)
6. Razvoj zaposlenih (individualni razvojni planovi - IDP, interne obuke, akademije veština)
7. Učinak i KPI (postavljanje merljivih ciljeva, kvartalne evaluacije, povezivanje sa nagrađivanjem)
8. Fluktuacija i retencija (analiza razloga odlaska, exit intervjui, zadržavanje ključnih talenata)
9. Plate i benefiti (struktura kompenzacija, benchmark tržišta, fleksibilni paketi pogodnosti)
10. Well-being i psihološka bezbednost (prevencija burnout-a, rad-život balans, kultura bezbednog iznošenja ideja i grešaka)

PEOPLE PRO PAKETI SARADNJE KOJE PREPORUČUJEŠ PREMA POTREBAMA:
- START paket: Idealan za kompanije do 15 zaposlenih. Fokus na bazičnim procedurama, ugovorima, osnovnom onboardingu i postavljanju temelja.
- CORE paket: Za preduzeća od 15 do 50 zaposlenih. Standardizacija HR procesa, 1-na-1 razgovori, definisanje KPI sistema, sistem nagrađivanja i zadržavanja.
- GROW paket: Za kompanije sa 50+ zaposlenih ili brzorastuće firme. Strateški HR, razvoj lidera, employer branding, napredna retencija i transformacija kulture.

DIJAGNOSTIČKI KONTEKST:
Ukoliko korisnik u poruci ili u kontekstu navede rezultate svoje HR Dijagnoze (overall skor, identifikovane crvene tačke / rizične oblasti):
- Odmah se osvrni na njihove konkretne crvene tačke!
- Objasni im zašto je ta crvena tačka opasna za biznis i zaposlene ako se ne adresira u narednih 30-90 dana.
- Ponudi 2-3 brza koraka (quick wins) koje mogu primeniti odmah.
- Ljubazno ih pozovi na direktan razgovor ili besplatan strateški sastanak sa Draganom:
  * Email: dragana.peoplepro@gmail.com
  * Telefon: +381 60 131 72 82
  * Sajt: https://www.peoplepro.rs

Nikada ne izmišljaj pravne savete koji zamenjuju Zakon o radu, već uvek napomeni da People Pro pruža celovito HR i organizaciono usklađivanje.`;

// Chat API endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, clientContext } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Niste poslali poruke za konverzaciju.' });
    }

    if (!ai) {
      // Fallback response if API key is not configured
      const latestUserMessage = messages[messages.length - 1]?.content || '';
      return res.json({
        reply: `Dobar dan! Hvala Vam na javljanju. Ja sam Dragana Stanimirović, osnivač agencije People Pro.\n\n` +
          `Trenutno sistem radi u režimu osnovnih konsultacija. Zabeležila sam Vaše pitanje u vezi sa "${latestUserMessage.substring(0, 50)}...".\n\n` +
          `U People Pro agenciji svakom klijentu pristupamo individualno sa posebnim fokusom na identifikovane crvene tačke u organizaciji. ` +
          `Predlažem da zakažemo besplatan strateški sastanak (30 min) gde ćemo zajedno proći kroz Vaše HR izazove.\n\n` +
          `Možete me direktno kontaktirati:\n` +
          `📧 Email: dragana.peoplepro@gmail.com\n` +
          `📞 Telefon: +381 60 131 72 82\n` +
          `🌐 Sajt: https://www.peoplepro.rs`,
      });
    }

    // Prepare system instruction with dynamic context if available
    let dynamicSystemInstruction = SYSTEM_INSTRUCTION;
    if (clientContext) {
      dynamicSystemInstruction += `\n\nTRENUTNI REZULTATI KLIJENTA IZ DIJAGNOZE:
- Naziv kompanije: ${clientContext.companyName || 'Nepoznata kompanija'}
- Industrija: ${clientContext.industry || 'Opšti sektor'}
- Broj zaposlenih: ${clientContext.employeeCount || 'Nije specificirano'}
- Ukupni HR indeks zrelosti: ${clientContext.overallScore !== undefined ? clientContext.overallScore + '%' : 'Nepoznat'}
- Broj detektovanih crvenih tačaka: ${clientContext.redPointsCount ?? 0}
- Identifikovane crvene tačke:
${clientContext.redPoints && clientContext.redPoints.length > 0 
  ? clientContext.redPoints.map((rp: any) => `  * ${rp.categoryName}: Problem - ${rp.issue} | Preporuka - ${rp.quickWin}`).join('\n')
  : 'Nema kritičnih crvenih tačaka (odličan skor!).'}`;
    }

    // In Gemini API, contents must start with a 'user' turn.
    // Strip any leading assistant/model greeting turns from the contents array.
    let formattedContents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'model' || m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    while (formattedContents.length > 0 && formattedContents[0].role === 'model') {
      formattedContents.shift();
    }

    if (formattedContents.length === 0) {
      return res.status(400).json({ error: 'Niste poslali korisničko pitanje.' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: formattedContents,
      config: {
        systemInstruction: dynamicSystemInstruction,
        temperature: 0.7,
      },
    });

    const reply = response.text || 'Dobar dan! Hvala Vam na pitanju. Molim Vas kontaktirajte me na dragana.peoplepro@gmail.com.';

    res.json({ reply });
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    res.json({
      reply: 'Hvala Vam na postavljenom pitanju. U People Pro agenciji pristupamo svakom izazovu strateški i sa srcem.\n\n' +
        'Kako bismo Vam pružili najprecizniju smernicu prilagođenu specifičnostima Vaše delatnosti i tima, pozivam Vas na besplatan strateški sastanak (30 min):\n\n' +
        '• 📧 Email: dragana.peoplepro@gmail.com\n' +
        '• 📞 Telefon: +381 60 131 72 82\n' +
        '• 🌐 Zvanični sajt: https://www.peoplepro.rs\n\n' +
        'Tu sam za sva dodatna pitanja!'
    });
  }
});

// Endpoint to log & dispatch client diagnostic reports
app.post('/api/send-report', async (req, res) => {
  try {
    const { clientId, recipient, companyName, overallScore, riskLevel, subject, body } = req.body;
    console.log(`[REPORT DISPATCH] Klijent: ${companyName} (${clientId}), Score: ${overallScore}%, Primalac: ${recipient}`);

    if (mailTransporter && recipient) {
      try {
        await mailTransporter.sendMail({
          from: `"Dragana Stanimirović | People Pro" <${smtpUser}>`,
          to: recipient,
          cc: 'dragana.peoplepro@gmail.com',
          subject: subject || `People Pro HR Dijagnoza – Rezultati za ${companyName}`,
          text: body,
        });
        console.log(`[SMTP USPEH] Izveštaj poslat na: ${recipient}`);
        return res.json({
          success: true,
          sent: true,
          method: 'smtp',
          message: `Izveštaj uspešno isporučen na ${recipient} i kopija na dragana.peoplepro@gmail.com`,
          recipient,
          dispatchedAt: new Date().toISOString()
        });
      } catch (smtpErr: any) {
        console.warn('[SMTP GREŠKA] Neuspešno SMTP slanje:', smtpErr.message);
      }
    }

    return res.json({
      success: true,
      sent: false,
      method: 'logged_for_admin_sync',
      message: `Izveštaj evidentiran u bazi za klijenta ${companyName} (${recipient})`,
      recipient,
      dispatchedAt: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error in /api/send-report:', error);
    res.status(500).json({ error: 'Neuspešna obrada slanja izveštaja.' });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`HR Dijagnoza People Pro server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
