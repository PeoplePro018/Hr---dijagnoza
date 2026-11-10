import { DIAGNOSTIC_CATEGORIES } from '../data/diagnosticData';
import { CompanyInfo, DiagnosisScoreResult, RedPoint, YellowPoint, GreenPoint } from '../types';

export function calculateDiagnosisScore(
  answers: Record<string, number>,
  companyInfo?: CompanyInfo
): DiagnosisScoreResult {
  const categoryScores: Record<string, number> = {};
  const redPoints: RedPoint[] = [];
  const yellowPoints: YellowPoint[] = [];
  const greenPoints: GreenPoint[] = [];

  let totalScoreSum = 0;

  for (const cat of DIAGNOSTIC_CATEGORIES) {
    let catSum = 0;
    let questionsAnswered = 0;

    for (const q of cat.questions) {
      const val = answers[q.id] || 2; // default to 2 if somehow missing
      catSum += val;
      questionsAnswered += 1;
    }

    // Each question has value 1..4 (min 3, max 12)
    // Percentage = Math.round((catSum / (questionsAnswered * 4)) * 100)
    const maxScore = questionsAnswered * 4;
    const catPercentage = Math.round((catSum / maxScore) * 100);
    categoryScores[cat.id] = catPercentage;
    totalScoreSum += catPercentage;

    if (catPercentage < 50) {
      // 🔴 RED POINT
      const severity: 'critical' | 'high' = catPercentage <= 35 ? 'critical' : 'high';
      redPoints.push({
        categoryId: cat.id,
        categoryTitle: cat.title,
        score: catPercentage,
        severity,
        critique: cat.redFlagWarning,
        dangerImpact: getDangerImpact(cat.id, companyInfo),
        recommendedAction: cat.consultingSolution,
        suggestedPackage: catPercentage < 35 ? 'START' : 'CORE'
      });
    } else if (catPercentage < 75) {
      // 🟡 YELLOW POINT
      yellowPoints.push({
        categoryId: cat.id,
        categoryTitle: cat.title,
        score: catPercentage,
        recommendation: getYellowRecommendation(cat.id)
      });
    } else {
      // 🟢 GREEN POINT
      greenPoints.push({
        categoryId: cat.id,
        categoryTitle: cat.title,
        score: catPercentage,
        highlight: getGreenHighlight(cat.id)
      });
    }
  }

  const overallScore = Math.round(totalScoreSum / DIAGNOSTIC_CATEGORIES.length);
  const overallRiskLevel: 'Kritičan' | 'Umeren' | 'Stabilan' =
    overallScore < 50 ? 'Kritičan' : overallScore < 75 ? 'Umeren' : 'Stabilan';

  // Determine recommended People Pro service tier (START, CORE, GROW)
  const { tier, reason } = determineRecommendedPackage(overallScore, redPoints.length, companyInfo);

  const executiveSummary = generateExecutiveSummary(
    companyInfo?.companyName || 'Vaša kompanija',
    overallScore,
    overallRiskLevel,
    redPoints.length,
    greenPoints.length
  );

  return {
    categoryScores,
    overallScore,
    overallRiskLevel,
    redPoints,
    yellowPoints,
    greenPoints,
    recommendedTier: tier,
    tierReason: reason,
    executiveSummary
  };
}

function getDangerImpact(categoryId: string, company?: CompanyInfo): string {
  const compName = company?.companyName ? `za ${company.companyName}` : 'za organizaciju';
  switch (categoryId) {
    case 'regrutacija':
      return `Zapošljavanje neadekvatnih kadrova stvara direktan finansijski gubitak od procenjenih 3-6 mesečnih plata po neuspelom radniku ${compName}.`;
    case 'onboarding':
      return `Bez strukturiranog uvođenja, novozaposleni gube do 50% produktivnosti u prvih 90 dana i imaju trostruko veću verovatnoću ranog odlaska.`;
    case 'tim_struktura':
      return `Nejasna hijerarhija i uloge dovode do zastoja u odlučivanju, opterećuju osnivača/rukovodstvo i generišu unutrašnje frustracije.`;
    case 'komunikacija':
      return `Prekid komunikacije i rad u "silosima" izaziva skrivene konflikte, dupliranje poslova i pad poverenja u menadžment.`;
    case 'zadovoljstvo':
      return `Nezadovoljstvo vodi u sindrom "tihog otkaza" (quiet quitting), pad radnog elana i negativno utiče na klijente i brend poslodavca.`;
    case 'razvoj':
      return `Nedostatak karijerne perspektive je statistički razlog broj 1 zašto najproduktivniji i najtalentovaniji zaposleni daju otkaz.`;
    case 'ucinak_kpi':
      return `Netransparentno vrednovanje rada nagrađuje pasivnost, a demotiviše stvarne nosioce posla koji ne vide smisao daljeg zalaganja.`;
    case 'fluktuacija':
      return `Svaki odlazak ključnog stručnjaka nosi sa sobom neprocenjivo kompanijsko znanje i poremećaj kontinuiteta u isporuci klijentima.`;
    case 'plate_benefiti':
      return `Plate ispod tržišnog nivoa ili unutrašnje anomalije čine firmu lakom metom za preuzimanje talenata od strane konkurencije.`;
    case 'wellbeing':
      return `Hroničan stres i sagorevanje (burnout) vode u pad kognitivnih performansi za 30%, česta bolovanja i tihe otkaze ključnih stručnjaka ${compName}.`;
    default:
      return `Ova tačka predstavlja operativni i finansijski rizik po stabilnost preduzeća.`;
  }
}

function getYellowRecommendation(categoryId: string): string {
  switch (categoryId) {
    case 'regrutacija':
      return 'Definisati jasnije profile kompetencija i unaprediti kanale privlačenja kroz ciljane oglase i preporuke.';
    case 'onboarding':
      return 'Standardizovati checklistu za prve radne nedelje i formalizovati ulogu mentora sa jasnim zaduženjima.';
    case 'tim_struktura':
      return 'Ažurirati organizacionu šemu i rasporediti ovlašćenja kako bi se smanjila zavisnost od jedne osobe.';
    case 'komunikacija':
      return 'Uvesti redovnije 1-na-1 sastanke i poboljšati dvosmerni protok informacija odozgo na dole.';
    case 'zadovoljstvo':
      return 'Sprovesti periodično anonimno eNPS merenje zadovoljstva i definisati 2-3 brze pobede za tim.';
    case 'razvoj':
      return 'Definisati opcije internih obuka i barem okvirne karijerne nivoe (junior / medior / senior).';
    case 'ucinak_kpi':
      return 'Pretvoriti opšte zahteve u merljive kvartalne ciljeve i formalizovati polugodišnji razgovor o učinku.';
    case 'fluktuacija':
      return 'Standardizovati proceduru izlaznog intervjua radi boljeg uvida u razloge odlazaka zaposlenih.';
    case 'plate_benefiti':
      return 'Uskladiti platne opsege sa tržištem i razmotriti uvođenje fleksibilnih nematerijalnih benefita.';
    case 'wellbeing':
      return 'Definisati jasnije smernice o prekovremenom radu, promovisati kulturu bez straha od grešaka i uvesti antistres pogodnosti.';
    default:
      return 'Potrebno je uspostaviti stabilne procedure i merljive kontrolne tačke.';
  }
}

function getGreenHighlight(categoryId: string): string {
  switch (categoryId) {
    case 'regrutacija':
      return 'Strukturiran proces selekcije privlači kvalitetne profile i štiti vas od pogrešnih zapošljavanja.';
    case 'onboarding':
      return 'Odličan onboarding ubrzava vreme do produktivnosti i stvara snažan osećaj pripadnosti novajlija.';
    case 'tim_struktura':
      return 'Jasna podela uloga i osnaženi lideri omogućavaju stabilno i skalabilno funkcionisanje bez stresa.';
    case 'komunikacija':
      return 'Otvorena kultura i transparentna saradnja među sektorima čine vaš tim agilnim i povezanim.';
    case 'zadovoljstvo':
      return 'Visok nivo poverenja i prepoznavanja truda radnika stvara motivisanu i lojalnu radnu snagu.';
    case 'razvoj':
      return 'Sistematsko ulaganje u veštine zaposlenih osigurava visoku konkurentnost i zadržavanje talenata.';
    case 'ucinak_kpi':
      return 'Jasni ciljevi i pravedan sistem ocenjivanja stvaraju kulturu meritokratije i visokih performansi.';
    case 'fluktuacija':
      return 'Niska fluktuacija i stabilno jezgro tima pružaju kontinuitet i smanjuju skupe troškove zamena.';
    case 'plate_benefiti':
      return 'Konkurentan paket plata i benefita predstavlja vašu snažnu komparativnu prednost na tržištu rada.';
    case 'wellbeing':
      return 'Visoka psihološka bezbednost i poštovanje balansa radnog vremena čine vaš tim otpornim, kreativnim i posvećenim.';
    default:
      return 'Oblast je stabilna i predstavlja konkurentsku prednost kompanije.';
  }
}

function determineRecommendedPackage(
  overallScore: number,
  redPointsCount: number,
  companyInfo?: CompanyInfo
): { tier: 'START' | 'CORE' | 'GROW'; reason: string } {
  const employeeCount = companyInfo?.employeeCount || '11-50';
  const hrSetup = companyInfo?.hrSetup || '';

  // If no internal HR and growing company, GROW is the ideal partner
  if (hrSetup.includes('Nema internog HR-a') && (employeeCount === '51-150' || employeeCount === '151-500' || employeeCount === '500+')) {
    return {
      tier: 'GROW',
      reason: 'Za kompaniju vaše veličine bez internog HR tima, People Pro kao eksterni HR Business Partner (GROW) preuzima kompletno strateško i operativno vođenje ljudi, rasterećujući vlasnike i menadžment.'
    };
  }

  // If many red points or critical score, CORE provides deep system building
  if (redPointsCount >= 4 || overallScore < 45) {
    return {
      tier: 'CORE',
      reason: 'Identifikovano je više od 3 kritične crvene tačke koje zahtevaju postavljanje temeljnog HR sistema (CORE): opisa poslova, organizacione šeme, sistema evaluacije radnog učinka i procedura uvođenja u posao.'
    };
  }

  // If moderate points or small firm, START (HR dijagnostika) is the perfect targeted entry
  if (redPointsCount >= 1 || overallScore < 70) {
    return {
      tier: 'START',
      reason: 'START paket (HR dijagnostika) pruža ciljanu dubinsku analizu vaših detektovanih crvenih tačaka kroz intervjue sa ključnim ljudima i konkretan akcioni plan za gašenje gorućih problema.'
    };
  }

  return {
    tier: 'GROW',
    reason: 'Vaša kompanija već ima dobre HR temelje. Preporučujemo GROW partnerstvo radi skaliranja liderstva, optimizacije retencije i podrške u daljoj ekspanziji biznisa.'
  };
}

function generateExecutiveSummary(
  companyName: string,
  overallScore: number,
  riskLevel: 'Kritičan' | 'Umeren' | 'Stabilan',
  redCount: number,
  greenCount: number
): string {
  if (riskLevel === 'Kritičan') {
    return `Kompanija ${companyName} ostvaruje indeks HR zrelosti od ${overallScore}%, što ukazuje na kritičan nivo organizacionog rizika. Detektovano je čak ${redCount} crvenih tačaka koje direktno uzrokuju finansijske gubitke, odliv znanja ili usporavanje rasta. Neophodna je hitna intervencija u definisanju osnovnih procesa.`;
  } else if (riskLevel === 'Umeren') {
    return `Kompanija ${companyName} ima solidan prosek HR zrelosti od ${overallScore}%, sa ${greenCount} prepoznatih stabilnih stubova. Međutim, identifikovano je ${redCount} crvenih tačaka i nekoliko žutih zona koje predstavljaju usko grlo za dalji razvoj i stvaraju nepotrebne troškove.`;
  } else {
    return `Kompanija ${companyName} pokazuje visok nivo organizacionog zdravlja (${overallScore}%), sa razvijenim praksama upravljanja ljudima u ${greenCount} oblasti. Fokus treba usmeriti na finu kalibraciju i dugoročnu retenciju najvrednijih talenata.`;
  }
}
