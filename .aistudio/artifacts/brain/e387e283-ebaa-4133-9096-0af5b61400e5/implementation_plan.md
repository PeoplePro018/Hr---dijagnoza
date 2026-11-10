# Plan unapređenja navigacije, automatskog slanja izveštaja i kalendarskih konsultacija

Usklađivanje korisničkog iskustva i administrativnih funkcija: direktno vođenje na upitnik iz zaglavlja, automatsko pozicioniranje na vrh stranice sa rezultatima, automatsko slanje personalizovanog izveštaja i zahvalnice klijentu na email (sa kopijom za Admina), kao i direktno zakazivanje termina sa 1-klik upisom u Draganin Google Kalendar.

> [!IMPORTANT]
> **Ključne odluke i potvrđeni zahtevi:**
> - **Dugme "Upitnik" u zaglavlju**: Klik uvek glatko skroluje i fokusira na formu upitnika (`#assessment-wizard`), bez ostajanja na vrhu početne stranice.
> - **Ponašanje nakon završetka upitnika**: Klijent se automatski pozicionira na sam vrh ekrana sa rezultatima (`window.scrollTo(0, 0)`), gde odmah vidi svoj skor, nalaze i opciju za konsultacije.
> - **Automatsko slanje na email**: Implementacija automatskog slanja izveštaja i zahvalnice čim klijent potvrdi upitnik, uz evidentiranje u bazi, pripremu za email klijente (mailto fallback) i 1-klik sinhronizaciju za Admina.
> - **Zakazivanje i Google Kalendar**: Istaknuto pozicioniranje kartice za zakazivanje konsultacija i uvođenje posvećene sekcije u Admin panelu sa 1-klik upisom termina u Draganin Google Kalendar i generisanjem Google Meet sastanka.

---

## 1. Pregled i tok korisnika (User Experience)

```
┌────────────────────────────────────────────────────────────────────────┐
│ 1. Posetilac klikne "Upitnik" gore desno                               │
│    └─► Glatko skrolovanje direktno na formu HR dijagnoze               │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│ 2. Klijent popunjava podatke o firmi i 10 oblasti (30 pitanja)         │
│    └─► Klik na "Završi i prikaži HR dijagnozu"                         │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│ 3. Automatsko procesiranje i pozicioniranje:                           │
│    ├─► Trenutni skrol na VRH ekrana sa rezultatima (nema skoka na dno) │
│    ├─► Automatsko generisanje PDF dokumenta sa zahvalnicom             │
│    ├─► Automatsko slanje izveštaja na email klijenta + kopija Dragani  │
│    └─► Prikaz zelene potvrde: "Izveštaj uspešno poslat na [email]"     │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│ 4. Zakazivanje 30-minutnih besplatnih konsultacija:                    │
│    ├─► Klijent bira radni dan i termin (Meet ili Telefon)              │
│    ├─► Potvrda termina: klijent dobija Google Calendar link i .ics     │
│    └─► Dragana (Admin) dobija instant notifikaciju "IMATE NOVI TERMIN" │
│        i u Admin panelu u 1 klik upisuje sastanak u svoj Google kalendar│
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Detaljan plan izmena po komponentama

### A. Navigacija u zaglavlju (`Header.tsx`)
1. Ažurirati dugme **"Upitnik"**:
   - Kada korisnik klikne na "Upitnik", postavlja se aktivni tab na `'upitnik'` i izvršava se glatko skrolovanje na element sa ID-jem `assessment-wizard` (ili `onNewAssessment`).
   - Ovo rešava problem gde je dugme delovalo neaktivno jer korisnik ostaje na vrhu početnog ekrana.
2. Dodati vizuelni indikator aktivnog stanja i hover efekat koji jasno komunicira da dugme vodi ka dijagnostici.

### B. Formular i tranzicija na rezultate (`ClientForm.tsx` & `App.tsx`)
1. U `ClientForm.tsx`:
   - U funkciji `handleSubmit`, pre poziva `onSubmit(companyInfo, answers)`, izvršiti trenutni reset skrola (`window.scrollTo({ top: 0, behavior: 'instant' })`).
2. U `App.tsx`:
   - U funkciji `handleAssessmentSubmit`, osigurati da se `setActiveTab('rezultati')` i `window.scrollTo({ top: 0, behavior: 'smooth' })` aktiviraju odmah, a ne tek nakon asinhronih mrežnih poziva.
3. U `InteractiveResults.tsx`:
   - Dodati `useEffect` kuku koja pri svakom novom klijentu ili montiranju osigurava da se pogled nalazi na samom vrhu stranice.

### C. Automatsko slanje izveštaja klijentu (`server.ts` & `emailService.ts`)
1. Unaprediti serversku rutu `/api/send-report`:
   - Obezbediti strukturirano procesiranje slanja izveštaja i zahvalnice na klijentski email i `dragana.peoplepro@gmail.com`.
   - Vratiti jasan status uspešnosti koji korisnički interfejs prikazuje u vidu zelene trake obaveštenja.
2. Na ekranu sa rezultatima (`InteractiveResults.tsx`):
   - Na samom vrhu prikazati status: *"✅ Izveštaj i zahvalnica su automatski pripremljeni i poslati na [email klijenta]. Kopija je evidentirana za konsultanta Draganu Stanimirović."*
   - Ostaviti istaknuto i pomoćno dugme "Otvori u mom email programu (Gmail/Outlook)" za klijente koji žele da odmah otvore svoj klijent sa već popunjenim tekstom.

### D. Istaknuto zakazivanje konsultacija i Google Kalendar (`InteractiveResults.tsx` & `AdminDashboard.tsx`)
1. Pozicioniranje widgeta za zakazivanje:
   - Pomeriti `ConsultationBookingWidget` na stratešku poziciju odmah nakon ključnih nalaza i crvenih tačaka, kako klijent ne bi morao da skroluje do samog dna stranice da bi video termine.
2. Unapređenje Admin kontrolne table za Draganu:
   - Na vrh `AdminDashboard` dodati posvećenu karticu **"📅 Zakazani termini za konsultacije"**.
   - Prikaz svih klijenata sa ugovorenim sastankom (datum, satnica, ime kontakta, telefon, naziv kompanije, format).
   - Svaki termin dobija veliko dugme: **"Upisi u moj Google Kalendar (1 klik)"** koje otvara Google kalendar sa svim detaljima, kao i dugme za preuzimanje `.ics` fajla i direktan poziv telefonom.

---

## 3. Verifikacija i testiranje
- [ ] Testirati klik na dugme "Upitnik" iz različitih pozicija i tabova — proveriti da li vodi pravo na formu.
- [ ] Testirati popunjavanje i slanje upitnika (korak 4) — proveriti da li ekran odmah prikazuje vrh rezultata.
- [ ] Testirati automatsko slanje izveštaja — proveriti status i prikaz na interfejsu.
- [ ] Testirati izbor termina za konsultacije — proveriti kreiranje rezervacije i prikaz u Admin panelu sa 1-klik kalendarskim upisom.
- [ ] Pokrenuti `compile_applet` i `lint_applet` za potpunu tehničku ispravnost.
