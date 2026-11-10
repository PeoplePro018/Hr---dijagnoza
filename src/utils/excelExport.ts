import * as XLSX from 'xlsx';
import { ClientSubmission } from '../types';
import { DIAGNOSTIC_CATEGORIES } from '../data/diagnosticData';

export function exportClientsToExcel(clients: ClientSubmission[], filename = 'People_Pro_HR_Baza_Klijenata.xlsx') {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Pregled Klijenata
  const summaryData = clients.map((c, idx) => ({
    'R.br': idx + 1,
    'ID Klijenta': c.id,
    'Naziv pravnog lica': c.companyInfo.companyName,
    'PIB': c.companyInfo.pib,
    'Matični broj': c.companyInfo.maticniBroj,
    'Industrija': c.companyInfo.industry,
    'Broj zaposlenih': c.companyInfo.employeeCount,
    'Kontakt osoba': c.companyInfo.contactPerson,
    'Pozicija': c.companyInfo.contactRole,
    'Email': c.companyInfo.email,
    'Telefon': c.companyInfo.phone,
    'Grad': c.companyInfo.city,
    'Interni HR status': c.companyInfo.hrSetup,
    'Ukupni HR indeks (%)': c.scores.overallScore,
    'Nivo rizika': c.scores.overallRiskLevel,
    'Broj crvenih tačaka': c.scores.redPoints.length,
    'Preporučeni People Pro paket': c.scores.recommendedTier,
    'Status prijave': formatStatus(c.status),
    'Datum popunjavanja': formatDate(c.submittedAt),
    'Glavni izazov klijenta': c.companyInfo.primaryChallengeNote || '',
    'Interne beleške': c.notes || ''
  }));

  const wsSummary = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Pregled Klijenata');

  // Sheet 2: Ocene po 9 oblasti
  const categoryData = clients.map(c => {
    const row: Record<string, string | number> = {
      'Naziv kompanije': c.companyInfo.companyName,
      'PIB': c.companyInfo.pib,
      'Ukupni indeks (%)': c.scores.overallScore
    };

    for (const cat of DIAGNOSTIC_CATEGORIES) {
      row[cat.title] = `${c.scores.categoryScores[cat.id] || 0}%`;
    }

    return row;
  });

  const wsCategories = XLSX.utils.json_to_sheet(categoryData);
  XLSX.utils.book_append_sheet(wb, wsCategories, 'Ocene po 10 Oblasti');

  // Sheet 3: Detektovane crvene tačke
  const redPointsData: Array<Record<string, string | number>> = [];
  clients.forEach(c => {
    c.scores.redPoints.forEach((rp, idx) => {
      redPointsData.push({
        'Kompanija': c.companyInfo.companyName,
        'PIB': c.companyInfo.pib,
        'Crvena tačka #': idx + 1,
        'Oblast': rp.categoryTitle,
        'Ostvaren skor': `${rp.score}%`,
        'Ozbiljnost': rp.severity === 'critical' ? 'KRITIČNO' : 'VISOK RIZIK',
        'Dijagnostikovani problem': rp.critique,
        'Uticaj na biznis': rp.dangerImpact,
        'People Pro preporučena akcija': rp.recommendedAction,
        'Predloženi paket': rp.suggestedPackage
      });
    });
  });

  const wsRedPoints = XLSX.utils.json_to_sheet(
    redPointsData.length > 0
      ? redPointsData
      : [{ 'Status': 'Nema zabeleženih crvenih tačaka među odabranim klijentima' }]
  );
  XLSX.utils.book_append_sheet(wb, wsRedPoints, 'Crvene Tačke (Rizici)');

  // Sheet 4: Pitanje-po-pitanje matrica odgovora
  const answersData = clients.map(c => {
    const row: Record<string, string | number> = {
      'Kompanija': c.companyInfo.companyName,
      'PIB': c.companyInfo.pib
    };

    DIAGNOSTIC_CATEGORIES.forEach(cat => {
      cat.questions.forEach((q, qIdx) => {
        const val = c.answers[q.id] || 0;
        row[`${cat.shortTitle} Q${qIdx + 1}`] = `${val}/4`;
      });
    });

    return row;
  });

  const wsAnswers = XLSX.utils.json_to_sheet(answersData);
  XLSX.utils.book_append_sheet(wb, wsAnswers, 'Detaljni Odgovori (1-4)');

  // Write and trigger download
  XLSX.writeFile(wb, filename);
}

export function exportSingleClientToExcel(client: ClientSubmission) {
  const safeName = client.companyInfo.companyName.replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `HR_Dijagnoza_${safeName}.xlsx`;
  exportClientsToExcel([client], filename);
}

function formatStatus(status: string): string {
  switch (status) {
    case 'nova_prijava':
      return 'Nova prijava';
    case 'pregledano':
      return 'Pregledano';
    case 'poslat_izvestaj':
      return 'Poslat izveštaj';
    case 'ugovoren_sastanak':
      return 'Ugovoren sastanak';
    case 'arhivirano':
      return 'Arhivirano';
    default:
      return status;
  }
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('sr-RS', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return iso;
  }
}
