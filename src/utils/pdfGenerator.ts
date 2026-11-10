import { jsPDF } from 'jspdf';
import { ClientSubmission } from '../types';

/**
 * Normalizes text for standard PDF fonts (Helvetica) to prevent encoding artifacts
 * while maintaining complete readability and professional typography.
 */
function normalizePdfText(text: string): string {
  if (!text) return '';
  return text
    .replace(/[čČ]/g, 'c')
    .replace(/[ćĆ]/g, 'c')
    .replace(/[šŠ]/g, 's')
    .replace(/[žŽ]/g, 'z')
    .replace(/[đĐ]/g, 'dj');
}

export interface PDFGeneratorOptions {
  /**
   * If true, generates the internal administrative brief including package tiers.
   * If false (default for client), generates the personalized diagnostic report
   * without commercial package recommendations, leaving the opportunity for Dragana to consult.
   */
  forAdmin?: boolean;
}

/**
 * Returns formatted file name for client PDF
 */
export function getClientPDFFileName(
  client: ClientSubmission,
  options: PDFGeneratorOptions = {}
): string {
  const { forAdmin = false } = options;
  const safeCompanyName = (client.companyInfo?.companyName || 'Klijent')
    .replace(/[^a-zA-Z0-9]/g, '_')
    .substring(0, 30);
  const filePrefix = forAdmin ? 'PeoplePro_Interni_Izvestaj' : 'PeoplePro_HR_Izvestaj';
  return `${filePrefix}_${safeCompanyName}.pdf`;
}

/**
 * Builds jsPDF Document instance with complete visual styling and sections
 */
export function buildClientResultPDFDoc(
  client: ClientSubmission,
  options: PDFGeneratorOptions = {}
): jsPDF {
  const { forAdmin = false } = options;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  let y = 16;

  const { companyInfo, scores, submittedAt } = client;
  const dateFormatted = new Date(submittedAt).toLocaleDateString('sr-RS', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  // --- 1. HEADER BANNER ---
  doc.setFillColor(39, 97, 255); // #2761ff
  doc.roundedRect(margin, y, contentWidth, 24, 3, 3, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14.5);
  doc.text('PEOPLE PRO HR KONSALTING', margin + 6, y + 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(
    normalizePdfText(
      forAdmin
        ? 'Interni Izvestaj HR Dijagnostike (Sa preporucenim modelom saradnje)'
        : 'Izvestaj HR Dijagnostike Organizacionog Zdravlja'
    ),
    margin + 6,
    y + 16
  );
  doc.text(normalizePdfText(`Datum: ${dateFormatted}`), pageWidth - margin - 35, y + 16);

  y += 30;

  // --- 2. PODACI O KOMPANIJI I KONTAKT OSOBI ---
  doc.setFillColor(248, 250, 252); // #f8fafc
  doc.setDrawColor(226, 232, 240); // #e2e8f0
  doc.roundedRect(margin, y, contentWidth, 22, 2, 2, 'FD');

  doc.setTextColor(15, 23, 42); // slate-900
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(normalizePdfText(`Pravno lice: ${companyInfo.companyName}`), margin + 4, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105); // slate-600
  doc.text(
    normalizePdfText(
      `PIB: ${companyInfo.pib}  |  Delatnost: ${companyInfo.industry}  |  Broj zaposlenih: ${companyInfo.employeeCount}`
    ),
    margin + 4,
    y + 13
  );
  doc.text(
    normalizePdfText(
      `Kontakt: ${companyInfo.contactPerson} (${companyInfo.contactRole})  |  Email: ${companyInfo.email}  |  Tel: ${companyInfo.phone}`
    ),
    margin + 4,
    y + 18.5
  );

  y += 28;

  // --- 3. OSNOVNI HR REZULTATI (SCORE BOX) ---
  const isRed = scores.overallScore < 50;
  const isYellow = scores.overallScore >= 50 && scores.overallScore < 75;
  const scoreBoxColor = isRed ? [254, 242, 242] : isYellow ? [254, 252, 232] : [240, 253, 244];
  const scoreBorderColor = isRed ? [252, 165, 165] : isYellow ? [253, 224, 71] : [134, 239, 172];
  const scoreTextColor = isRed ? [185, 28, 28] : isYellow ? [161, 98, 7] : [21, 128, 61];

  doc.setFillColor(scoreBoxColor[0], scoreBoxColor[1], scoreBoxColor[2]);
  doc.setDrawColor(scoreBorderColor[0], scoreBorderColor[1], scoreBorderColor[2]);
  doc.roundedRect(margin, y, contentWidth, 24, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(scoreTextColor[0], scoreTextColor[1], scoreTextColor[2]);
  doc.text(normalizePdfText(`UKUPNI INDEKS HR ZRELOSTI: ${scores.overallScore}%`), margin + 6, y + 8);
  doc.text(
    normalizePdfText(`NIVO ORGANIZACIONOG RIZIKA: ${scores.overallRiskLevel.toUpperCase()}`),
    margin + 105,
    y + 8
  );

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);

  const summaryLines = doc.splitTextToSize(
    normalizePdfText(
      scores.executiveSummary ||
        'Procena obuhvata analizu 10 kljucnih organizacionih dimenzija od regrutacije do well-being-a.'
    ),
    contentWidth - 12
  );
  doc.text(summaryLines, margin + 6, y + 15);

  y += 30;

  // --- 4. PREGLED 10 KLJUČNIH OBLASTI (DVE KOLONE) ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(normalizePdfText('Rezultati po oblastima (10 Dimenzija HR Zdravlja):'), margin, y);
  y += 5.5;

  const categoryNames: Record<string, string> = {
    regrutacija: '1. Regrutacija i selekcija',
    onboarding: '2. Onboarding (uvodjenje u posao)',
    tim_struktura: '3. Tim i organizaciona struktura',
    komunikacija: '4. Komunikacija i saradnja',
    zadovoljstvo: '5. Zadovoljstvo zaposlenih i kultura',
    razvoj: '6. Razvoj i edukacija zaposlenih',
    ucinak_kpi: '7. Ucinak i KPI merila',
    fluktuacija: '8. Fluktuacija i retencija',
    plate_benefiti: '9. Plate, kompenzacije i benefiti',
    wellbeing: '10. Well-being i balans'
  };

  const catEntries = Object.entries(categoryNames);
  const colWidth = (contentWidth - 6) / 2;

  catEntries.forEach(([catKey, title], index) => {
    const scoreVal = scores.categoryScores[catKey] ?? 0;
    const isCol2 = index >= 5;
    const colX = isCol2 ? margin + colWidth + 6 : margin;
    const rowY = y + (index % 5) * 8.5;

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(colX, rowY, colWidth, 7.5, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    doc.text(normalizePdfText(title), colX + 3, rowY + 5);

    // Score indicator
    doc.setFont('helvetica', 'bold');
    if (scoreVal < 50) {
      doc.setTextColor(220, 38, 38);
    } else if (scoreVal < 75) {
      doc.setTextColor(217, 119, 6);
    } else {
      doc.setTextColor(22, 163, 74);
    }
    doc.text(`${scoreVal}%`, colX + colWidth - 12, rowY + 5);
  });

  y += 5 * 8.5 + 8;

  // --- 5. IDENTIFIKOVANE CRVENE TAČKE (BEZ PREPORUKA ZA KLIJENTA) ---
  if (scores.redPoints && scores.redPoints.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(185, 28, 28);
    doc.text(
      normalizePdfText(`Identifikovane kriticne tacke (${scores.redPoints.length} oblasti sa ocenom ispod 50%):`),
      margin,
      y
    );
    y += 5;

    scores.redPoints.slice(0, 3).forEach((rp) => {
      doc.setFillColor(254, 242, 242);
      doc.setDrawColor(254, 202, 202);
      doc.roundedRect(margin, y, contentWidth, 10, 1.5, 1.5, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(153, 27, 27);
      doc.text(normalizePdfText(`! ${rp.categoryTitle} - ocena ${rp.score}%`), margin + 3, y + 4.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105);

      if (forAdmin) {
        const critText = doc.splitTextToSize(
          normalizePdfText(`Interna napomena: ${rp.critique}`),
          contentWidth - 8
        );
        doc.text(critText[0] || '', margin + 3, y + 8);
      } else {
        doc.text(
          normalizePdfText('Uoceno odstupanje od organizacionih standarda - preporucuje se detaljna analiza.'),
          margin + 3,
          y + 8
        );
      }

      y += 12;
    });
  } else {
    doc.setFillColor(240, 253, 244);
    doc.setDrawColor(187, 247, 208);
    doc.roundedRect(margin, y, contentWidth, 9, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(22, 101, 52);
    doc.text(
      normalizePdfText('Odlican rezultat: Sve ispitivane oblasti su stabilne (ocene iznad 50%).'),
      margin + 4,
      y + 6
    );
    y += 13;
  }

  // --- 6. PREPORUČENI PAKET SAMO ZA ADMINA (UKLONJENO IZ KLIJENTSKOG PDF-a) ---
  if (forAdmin) {
    doc.setFillColor(238, 242, 255); // indigo-50
    doc.setDrawColor(199, 210, 254);
    doc.roundedRect(margin, y, contentWidth, 13, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(49, 46, 129);
    doc.text(
      normalizePdfText(`[INTERNO ZA ADMINA] Preporuceni People Pro paket: ${scores.recommendedTier}`),
      margin + 4,
      y + 5
    );

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    const tierReasonText = doc.splitTextToSize(
      normalizePdfText(scores.tierReason || 'Prilagodjeno velicini i trenutnim potrebama kompanije.'),
      contentWidth - 8
    );
    doc.text(tierReasonText[0] || '', margin + 4, y + 9.5);

    y += 17;
  }

  // --- 7. ZAHVALNICA DRAGANE STANIMIROVIĆ SA POZIVOM NA BESPLATNE KONSULTACIJE ---
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(39, 97, 255);
  doc.setLineWidth(0.4);
  const thankYouBoxHeight = forAdmin ? 42 : 54;
  doc.roundedRect(margin, y, contentWidth, thankYouBoxHeight, 2.5, 2.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(39, 97, 255);
  doc.text(normalizePdfText('ZAHVALNICA & POZIV NA STRATESKE KONSULTACIJE'), margin + 5, y + 6.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);

  const contactGreeting = companyInfo.contactPerson ? companyInfo.contactPerson : 'saradnice';
  const thankYouText = normalizePdfText(
    `Postovani/a ${contactGreeting},\n` +
    `Iskreno Vam hvala na ukazanom poverenju i vremenu koje ste posvetili popunjavanju People Pro upitnika za kompaniju ${companyInfo.companyName}.\n\n` +
    `Ljudski resursi su zila kucavica svakog biznisa, a prepoznavanje oblasti za unapredjenje prvi je korak ka rasterecenju osnivaca, stabilnijem timu i vecem profitu.\n` +
    `Kako bismo ove nalaze pretvorili u konkretne rezultate, srdacno Vas pozivam na besplatne 30-minutne strateske konsultacije na kojima cemo zajedno analizirati izazove i pronaci resenja skrojena po meri Vase firme.`
  );

  const splitThankYou = doc.splitTextToSize(thankYouText, contentWidth - 10);
  doc.text(splitThankYou, margin + 5, y + 12);

  // Consultant signature and contact block
  const sigY = y + (forAdmin ? 28 : 39);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Dragana Stanimirovic', margin + 5, sigY);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(
    normalizePdfText('Osnivac i HR konsultant, People Pro  |  "Vas partner za ljudske resurse sa srcem"'),
    margin + 5,
    sigY + 4
  );

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(39, 97, 255);
  doc.text(
    'Telefon: +381 60 131 72 82  |  Email: dragana.peoplepro@gmail.com  |  Web: www.peoplepro.rs',
    margin + 5,
    sigY + 8
  );

  // --- 8. FOOTER ---
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(
    normalizePdfText(
      `People Pro HR Konsalting  *  Za poverljivu upotrebu  *  Dokument pripremila Dragana Stanimirovic za ${companyInfo.companyName}`
    ),
    margin,
    pageHeight - 8
  );

  return doc;
}

/**
 * Generates and triggers instant browser download of the PDF report
 */
export function generateClientResultPDF(
  client: ClientSubmission,
  options: PDFGeneratorOptions = {}
): void {
  const doc = buildClientResultPDFDoc(client, options);
  const fileName = getClientPDFFileName(client, options);
  doc.save(fileName);
}

/**
 * Returns the generated PDF as a Blob (useful for Firebase Storage upload)
 */
export function generateClientResultPDFBlob(
  client: ClientSubmission,
  options: PDFGeneratorOptions = {}
): Blob {
  const doc = buildClientResultPDFDoc(client, options);
  return doc.output('blob');
}

/**
 * Returns the generated PDF as a Base64 Data URL (useful for resilient cloud persistence)
 */
export function generateClientResultPDFDataUrl(
  client: ClientSubmission,
  options: PDFGeneratorOptions = {}
): string {
  const doc = buildClientResultPDFDoc(client, options);
  return doc.output('datauristring');
}

/**
 * Downloads the client's PDF.
 * If the PDF is already stored in Firebase Storage or as a base64 Data URL in the database,
 * it downloads that saved copy directly. Otherwise, it generates it dynamically.
 */
export function downloadClientPDF(
  client: ClientSubmission,
  options: PDFGeneratorOptions = {}
): void {
  const fileName = client.reportPdfName || getClientPDFFileName(client, options);

  // If we have an existing Data URL stored in Firebase Firestore
  if (!options.forAdmin && client.reportPdfDataUrl) {
    try {
      const link = document.createElement('a');
      link.href = client.reportPdfDataUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    } catch (err) {
      console.warn('Failed direct download of stored PDF Data URL, falling back:', err);
    }
  }

  // If we have a Firebase Storage URL
  if (!options.forAdmin && client.pdfStorageUrl) {
    try {
      const link = document.createElement('a');
      link.href = client.pdfStorageUrl;
      link.download = fileName;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    } catch (err) {
      console.warn('Failed storage URL download, falling back:', err);
    }
  }

  // Fallback / Admin generation
  generateClientResultPDF(client, options);
}
