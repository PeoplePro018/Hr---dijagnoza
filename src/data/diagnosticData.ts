import { Category, ClientSubmission } from '../types';

export const DIAGNOSTIC_CATEGORIES: Category[] = [
  {
    id: 'regrutacija',
    number: 1,
    title: 'Regrutacija i selekcija',
    shortTitle: 'Regrutacija',
    description: 'Efikasnost privlačenja, selekcije i zapošljavanja adekvatnih profila zaposlenih.',
    iconName: 'UserPlus',
    redFlagWarning: 'Zapošljavanje neodgovarajućih profila, visoki troškovi po zaposlenom i dugotrajno popunjavanje ključnih radnih mesta.',
    consultingSolution: 'Postavljanje standardizovanog procesa selekcije, definisanje kompetencija i profila radnih mesta kroz People Pro START/CORE metodologiju.',
    questions: [
      {
        id: 'regrutacija_q1',
        text: 'Da li imate standardizovan proces selekcije i definisane opise radnih mesta (job descriptions)?',
        contextHint: 'Standardizovan proces garantuje jednake kriterijume i smanjuje greške pri izboru kandidata.',
        options: [
          { value: 1, label: 'Ne, proces je potpuno stihijski i nemamo pisane opise radnih mesta', subtext: 'Zapošljavanje se vrši bez jasnih kriterijuma' },
          { value: 2, label: 'Delimično, imamo neke opise, ali selekcija zavisi od trenutne intuicije', subtext: 'Kriterijumi se menjaju od slučaja do slučaja' },
          { value: 3, label: 'Uglavnom da, imamo jasne faze intervjua i formalne opise većine pozicija', subtext: 'Proces je stabilan, ali zahteva fino podešavanje' },
          { value: 4, label: 'Da, imamo strukturiran proces, matrice kompetencija i bodovanje kandidata', subtext: 'Visok nivo profesionalne selekcije' }
        ]
      },
      {
        id: 'regrutacija_q2',
        text: 'Koliko prosečno traje popunjavanje otvorene pozicije i prolaznost na probnom radu?',
        contextHint: 'Dugotrajna regrutacija košta kompaniju izgubljene produktivnosti, dok neuspeh na probnom radu ukazuje na lošu selekciju.',
        options: [
          { value: 1, label: 'Pozicije stoje otvorene mesecima, a mnogi novozaposleni ne prođu probni rad', subtext: 'Visok gubitak resursa i vremena menadžera' },
          { value: 2, label: 'Proces je često spor i nepredvidiv, a procena kandidata se vrši kasno', subtext: 'Često se zapošljava iz nužde' },
          { value: 3, label: 'Većina pozicija se popuni u razumnom roku uz solidan uspeh na probnom radu', subtext: 'Povremena kašnjenja na specifičnim profilima' },
          { value: 4, label: 'Imamo definisan time-to-hire (<30 dana) i preko 90% uspešnosti probnog rada', subtext: 'Brza i precizna popuna pozicija' }
        ]
      },
      {
        id: 'regrutacija_q3',
        text: 'Da li merite trošak zapošljavanja (cost-per-hire) i kanale privlačenja najboljih kandidata?',
        contextHint: 'Analitika kanala selekcije omogućava optimizaciju budžeta i privlačenje talenata.',
        options: [
          { value: 1, label: 'Uopšte ne merimo troškove regrutacije niti analiziramo izvore kandidata', subtext: 'Budžet se troši bez uvida u povrat investicije' },
          { value: 2, label: 'Znamo samo osnovne troškove oglasa, ali bez uvida u efikasnost kanala', subtext: 'Oslanjanje na iste pasivne portale za oglase' },
          { value: 3, label: 'Pratimo kanale i okvirne troškove, ulažemo u preporuke i employer branding', subtext: 'Dobra svest o troškovima' },
          { value: 4, label: 'Imamo detaljan KPI po regruteru/kanalu i razvijenu bazu talenata (talent pool)', subtext: 'Optimizovan budžet i proaktivan sourcing' }
        ]
      }
    ]
  },
  {
    id: 'onboarding',
    number: 2,
    title: 'Onboarding (Uvođenje u posao)',
    shortTitle: 'Onboarding',
    description: 'Sistematsko uvođenje novih zaposlenih u tim, procese, kulturu i radne zadatke.',
    iconName: 'Sparkles',
    redFlagWarning: 'Prepustanje novih radnika samima sebi, spora integracija, frustracija i odlazak u prva 3 meseca.',
    consultingSolution: 'Kreiranje strukturiranog plana 30/60/90 dana, uvođenje uloge mentora i automatizacija kontrolnih tačaka onboardinga.',
    questions: [
      {
        id: 'onboarding_q1',
        text: 'Postoji li formalan plan i dodeljen mentor za uvođenje novozaposlenih u prvih 30/60/90 dana?',
        contextHint: 'Kvalitetan onboarding ubrzava osamostaljivanje i smanjuje stres u periodu adaptacije.',
        options: [
          { value: 1, label: 'Ne postoji plan – novog kolegu "bace u vatru" prvog radnog dana', subtext: 'Visok rizik od grešaka i ranog napuštanja' },
          { value: 2, label: 'Postoji samo neformalna pomoć kolega iz kancelarije bez pisanog plana', subtext: 'Uvođenje zavisi od dobre volje pojedinaca' },
          { value: 3, label: 'Imamo orjentacioni checklist i mentora za prve radne nedelje', subtext: 'Solidna struktura, ima prostora za produbljivanje' },
          { value: 4, label: 'Imamo razrađen 30/60/90 plan, Welcome paket, obučenog mentora i alate', subtext: 'Strukturirano i toplo uvođenje u rad' }
        ]
      },
      {
        id: 'onboarding_q2',
        text: 'Koliko brzo novi zaposleni dostiže punu samostalnost i produktivnost na radnom mestu?',
        contextHint: 'Vreme do produktivnosti direktno utiče na operativnu stabilnost i prihod preduzeća.',
        options: [
          { value: 1, label: 'Proces učenja traje predugo jer niko nema vremena da se posveti novom radniku', subtext: 'Gubi se dragoceno vreme postojećih timova' },
          { value: 2, label: 'Učenje je usporeno nedostatkom internih procedura i jasnih uputstava', subtext: 'Često ponavljanje istih početničkih pitanja' },
          { value: 3, label: 'Većina zaposlenih se osamostali u okviru očekivanog standarda', subtext: 'Prosečno vreme adaptacije' },
          { value: 4, label: 'Brzo i bezbedno dostizanje produktivnosti uz redovne provere znanja', subtext: 'Minimalan pad timske efikasnosti' }
        ]
      },
      {
        id: 'onboarding_q3',
        text: 'Da li sprovodite evaluaciju onboarding procesa (feedback novozaposlenog nakon 1. i 3. meseca)?',
        contextHint: 'Dvosmerni feedback sprečava neprijatna iznenađenja pre isteka probnog rada.',
        options: [
          { value: 1, label: 'Nikada ne pitamo novog zaposlenog za utiske tokom probnog rada', subtext: 'Problemi se primećuju tek kada zaposleni da otkaz' },
          { value: 2, label: 'Samo kroz usputni neobavezni razgovor na hodniku ili pauzi', subtext: 'Nema dokumentovanog uvida u iskustvo novajlije' },
          { value: 3, label: 'Obavljamo jedan formalan razgovor pred istek probnog rada', subtext: 'Pomaže, ali kasni za rane korekcije' },
          { value: 4, label: 'Redovni pulse čekinovi na 14, 30 i 90 dana sa merenjem satisfakcije uvođenja', subtext: 'Kontinuirano unapređenje procesa uvođenja' }
        ]
      }
    ]
  },
  {
    id: 'tim_struktura',
    number: 3,
    title: 'Tim i struktura',
    shortTitle: 'Tim & Struktura',
    description: 'Jasnoća organizacione šeme, hijerarhije, raspodele uloga i menadžerskih kapaciteta.',
    iconName: 'Network',
    redFlagWarning: 'Usko grlo u odlučivanju na vrhu, haos u nadležnostima, sukob ovlašćenja i preopterećenost ključnih ljudi.',
    consultingSolution: 'Dizajn jasne organizacione šeme, delegiranje ovlašćenja i osnaživanje srednjeg menadžmenta kroz People Pro CORE paket.',
    questions: [
      {
        id: 'tim_struktura_q1',
        text: 'Da li kompanija ima jasnu organizacionu šemu sa definisanim linijama odgovornosti i izveštavanja?',
        contextHint: 'Zaposleni moraju tačno znati ko donosi odluke i kome se podnose izveštaji.',
        options: [
          { value: 1, label: 'Ne postoji šema, zaposleni često imaju više "gazda" koji daju suprotne naloge', subtext: 'Konfuzija i dezorijentacija u radu' },
          { value: 2, label: 'Postoji šema na papiru, ali se u praksi sve odluke slivaju na vlasnika/jednu osobu', subtext: 'Menadžeri nemaju stvarnu autonomiju' },
          { value: 3, label: 'Organizaciona struktura je jasna i većina procesa prati definisanu hijerarhiju', subtext: 'Dobra baza uz manje potrebe za prilagođavanjem rasta' },
          { value: 4, label: 'Skalabilna struktura, transparentna raspodela ovlašćenja i osnaženi timski lideri', subtext: 'Efikasno funkcionisanje bez mikromenadžmenta' }
        ]
      },
      {
        id: 'tim_struktura_q2',
        text: 'Da li su uloge i zaduženja unutar timova transparentni, bez preklapanja ili "rupa" u zaduženjima?',
        contextHint: 'Neprecizna zaduženja vode do sindroma "to nije moj posao" ili dvostrukog rada.',
        options: [
          { value: 1, label: 'Često dolazi do nesporazuma jer niko ne zna tačno šta je čija dužnost', subtext: 'Zadaci propadaju između stolica' },
          { value: 2, label: 'Uloge su načelno poznate, ali se odgovornost često prebacuje na druge', subtext: 'Ponavljanje situacija sa nedovršenim zadacima' },
          { value: 3, label: 'Jasna podela posla, zadaci se raspodeljuju bez većih problema', subtext: 'Stabilna radna dinamika' },
          { value: 4, label: 'RACI matrica primenjena, procesi mapirani i uloge besprekorno usklađene', subtext: 'Vrhunska koordinacija i odgovornost' }
        ]
      },
      {
        id: 'tim_struktura_q3',
        text: 'Da li vaši timski lideri i menadžeri poseduju adekvatne "people management" veštine?',
        contextHint: 'Tehnički eksperti često postaju menadžeri bez prethodne pripreme za vođenje ljudi.',
        options: [
          { value: 1, label: 'Lideri vode timove isključivo kroz pritisak i autoritet, bez liderskih veština', subtext: 'Glavni uzrok nezadovoljstva i odlazaka' },
          { value: 2, label: 'Promovisani su stručnjaci u menadžere, ali se muče sa delegiranjem i ljudima', subtext: 'Preopterećeni rukovodioci' },
          { value: 3, label: 'Lideri imaju dobre komunikacijske osnove i vode timove korektno', subtext: 'Potreban dalji liderski trening' },
          { value: 4, label: 'Lideri su mentori i koučevi, redovno obučavani za vođenje i motivaciju ljudi', subtext: 'Visoka liderska zrelost' }
        ]
      }
    ]
  },
  {
    id: 'komunikacija',
    number: 4,
    title: 'Komunikacija i saradnja',
    shortTitle: 'Komunikacija',
    description: 'Protok informacija odozgo na dole, horizontalna saradnja među sektorima i kultura povratne informacije.',
    iconName: 'MessagesSquare',
    redFlagWarning: 'Informacioni silosi, tračevi, dezinformacije i tihi konflikti koji parališu operativni rad.',
    consultingSolution: 'Uvođenje ritma internih komunikacija, 1-na-1 sastanaka i protokola za rešavanje međusektorskih konflikata.',
    questions: [
      {
        id: 'komunikacija_q1',
        text: 'Koliko je otvorena i redovna komunikacija između uprave/menadžmenta i zaposlenih?',
        contextHint: 'Transparentnost gradi poverenje, dok nedostatak informacija podstiče strah i nesigurnost.',
        options: [
          { value: 1, label: 'Zaposleni za važne odluke saznaju "kroz kuloare" ili tek kada je prekasno', subtext: 'Zid tišine između menadžmenta i tima' },
          { value: 2, label: 'Komunikacija je jednosmerna i neredovna, svodi se na rešavanje kriza', subtext: 'Retke formalne poruke rukovodstva' },
          { value: 3, label: 'Postoje periodični zajednički sastanci (All-Hands) i kanali informisanja', subtext: 'Korektan protok poslovnih informacija' },
          { value: 4, label: 'Izrazito transparentna kultura, jasni ciljevi i redovni otvoreni forumi (Q&A)', subtext: 'Visoko poverenje i posvećenost viziji' }
        ]
      },
      {
        id: 'komunikacija_q2',
        text: 'Kako ocenjujete međusektorsku saradnju i rešavanje nesuglasica između odeljenja?',
        contextHint: 'Sektorski silosi (npr. prodaja vs proizvodnja / IT vs finansije) usporavaju ceo biznis.',
        options: [
          { value: 1, label: 'Postoji otvoreni animozitet i prebacivanje krivice između pojedinih sektora', subtext: 'Ozbiljna kočnica za profitabilnost' },
          { value: 2, label: 'Sektori rade izolovano u svojim "silosima" i teško dele podatke', subtext: 'Saradnja je spora i birokratizovana' },
          { value: 3, label: 'Saradnja je funkcionalna, nesuglasice se rešavaju konstruktivno', subtext: 'Dobra timska sinergija' },
          { value: 4, label: 'Besprekorna međusektorska sinergija sa agilnim zajedničkim projektima', subtext: 'Zajednički cilj je uvek na prvom mestu' }
        ]
      },
      {
        id: 'komunikacija_q3',
        text: 'Postoje li redovni 1-na-1 sastanci menadžera i zaposlenih radi razmene povratnih informacija?',
        contextHint: 'Individualni razgovori omogućavaju rano uočavanje problema pre nego što postanu fatalni.',
        options: [
          { value: 1, label: 'Nikada se ne održavaju 1-na-1 sastanci, razgovara se samo kad nastane problem', subtext: 'Zaposleni se osećaju nevidljivo' },
          { value: 2, label: 'Održavaju se povremeno, ali se često otkazuju zbog "hitnijih poslova"', subtext: 'Nema kontinuiteta ni fokusa na čoveka' },
          { value: 3, label: 'Održavaju se bar jednom mesečno ili kvartalno sa unapred zakazanim terminima', subtext: 'Dobra disciplina razmene feedbacka' },
          { value: 4, label: 'Redovni dvonedeljni strukturirani 1-on-1 razgovori posvećeni ciljevima i podršci', subtext: 'Zlatni standard menadžerske prakse' }
        ]
      }
    ]
  },
  {
    id: 'zadovoljstvo',
    number: 5,
    title: 'Zadovoljstvo zaposlenih',
    shortTitle: 'Zadovoljstvo',
    description: 'Radna atmosfera, nivo angažovanosti (engagement), poverenje i prepoznavanje doprinosa.',
    iconName: 'HeartHandshake',
    redFlagWarning: 'Nezainteresovanost, "tihi otkaz" (quiet quitting), toksična klima i narušena lojalnost firmi.',
    consultingSolution: 'Implementacija eNPS istraživanja klime, programa prepoznavanja zasluga i akcionog plana unapređenja kulture.',
    questions: [
      {
        id: 'zadovoljstvo_q1',
        text: 'Da li i koliko često sprovodite ankete o angažovanju i zadovoljstvu (eNPS / engagement survey)?',
        contextHint: 'Anonimne ankete otkrivaju skriveno nezadovoljstvo pre nego što eskalira u otkaze.',
        options: [
          { value: 1, label: 'Nikada nismo merili zadovoljstvo zaposlenih, nemamo nikakve podatke', subtext: 'Uprava pretpostavlja "da je sve u redu"' },
          { value: 2, label: 'Sproveli smo anketu nekada ranije, ali nismo ništa promenili nakon nje', subtext: 'Izgubljen kredibilitet anketiranja' },
          { value: 3, label: 'Radimo godišnju anketu o zadovoljstvu i komuniciramo osnovne rezultate', subtext: 'Korisna slika stanja' },
          { value: 4, label: 'Redovna pulse istraživanja + dubinski eNPS sa merljivim akcionim koracima', subtext: 'Podaci vode HR odluke' }
        ]
      },
      {
        id: 'zadovoljstvo_q2',
        text: 'Kakav je nivo radne atmosfere, međusobnog poverenja i prepoznavanja truda radnika?',
        contextHint: 'Priznanje za dobar rad je jedan od najvećih nematerijalnih motivatora u svakoj industriji.',
        options: [
          { value: 1, label: 'Atmosfera je napeta, a pohvale ne postoje – primećuju se isključivo greške', subtext: 'Demotivisani zaposleni' },
          { value: 2, label: 'Priznanje zavisi od raspoloženja šefa, retko se slavi zajednički uspeh', subtext: 'Nedosledan sistem motivacije' },
          { value: 3, label: 'Atmosfera je generalno kolegijalna i zdravi međuljudski odnosi dominiraju', subtext: 'Prijatno radno okruženje' },
          { value: 4, label: 'Visoka psihološka sigurnost, razvijen sistem pohvala i prepoznavanja uspeha', subtext: 'Inspirativna kultura zajedništva' }
        ]
      },
      {
        id: 'zadovoljstvo_q3',
        text: 'Da li menadžment konkretno reaguje na primedbe i sugestije zaposlenih?',
        contextHint: 'Slušanje bez akcije stvara cinizam među zaposlenima.',
        options: [
          { value: 1, label: 'Sugestije zaposlenih se ignorišu ili se kritika doživljava kao nelojalnost', subtext: 'Gušenje inicijative i apatija' },
          { value: 2, label: 'Sugestije se saslušaju, ali retko dođe do stvarne promene u praksi', subtext: 'Obećanja bez realizacije' },
          { value: 3, label: 'Menadžment rešava većinu operativnih problema na koje se radnici žale', subtext: 'Osetna briga za radne uslove' },
          { value: 4, label: 'Transparentna "zatvorena petlja" (closed loop): svaka primedba dobija odgovor i plan', subtext: 'Zaposleni su istinski su-kreatori radnog mesta' }
        ]
      }
    ]
  },
  {
    id: 'razvoj',
    number: 6,
    title: 'Razvoj zaposlenih',
    shortTitle: 'Razvoj & Obuke',
    description: 'Investicije u znanje, individualni razvojni planovi, karijerne putanje i transfer znanja.',
    iconName: 'GraduationCap',
    redFlagWarning: 'Stagnacija znanja, odlazak najtalentovanijih jer "nemaju gde da rastu", nedostatak naslednika za ključne pozicije.',
    consultingSolution: 'Definisanje matrica karijernih nivoa, planova obuka i mentorskih programa prilagođenih biznis ciljevima.',
    questions: [
      {
        id: 'razvoj_q1',
        text: 'Da li svaki zaposleni ima definisan individualni plan razvoja i budžet za edukacije?',
        contextHint: 'Strukturirano učenje održava konkurentnost kompanije i zadržava najbolje talente.',
        options: [
          { value: 1, label: 'Ne postoji budžet za obuke niti bilo kakav plan profesionalnog razvoja', subtext: 'Učenje se smatra "troškom i gubljenjem vremena"' },
          { value: 2, label: 'Obuke se odobravaju stihijski, ko zatraži – nekad dobije, nekad ne', subtext: 'Nema strategije razvoja veština' },
          { value: 3, label: 'Imamo plan obuka za ključne sektore i odobren godišnji budžet', subtext: 'Dobar nivo ulaganja u stručnost' },
          { value: 4, label: 'Definisani PDP (Personal Development Plan) planovi za sve sa praćenjem ROI znanja', subtext: 'Kultura kontinuiranog rasta i učenja' }
        ]
      },
      {
        id: 'razvoj_q2',
        text: 'Postoji li u kompaniji jasna karijerna putanja (career path) i plan sukcesije za ključne uloge?',
        contextHint: 'Ako zaposleni ne vidi gde može biti za 2 godine, počeće da traži novi posao na drugom mestu.',
        options: [
          { value: 1, label: 'Karijerni put ne postoji, unapređenja su tajna i po ličnim simpatijama', subtext: 'Demotivacija stručnog kadra' },
          { value: 2, label: 'Zna se otprilike koji su viši nivoi, ali nisu jasni kriterijumi za prelazak', subtext: 'Frustracija ambicioznih radnika' },
          { value: 3, label: 'Postoje definisani nivoi (junior / medior / senior) za većinu radnih mesta', subtext: 'Transparentnija očekivanja' },
          { value: 4, label: 'Transparentne karijerne matrice sa kriterijumima i mapom sukcesora za ključne funkcije', subtext: 'Predvidiv rast i stabilnost poslovanja' }
        ]
      },
      {
        id: 'razvoj_q3',
        text: 'Koliko kompanija podstiče interni transfer znanja i deljenje dobrih praksi?',
        contextHint: 'Zadržavanje kompanijskog "know-how"-a sprečava zavisnost od pojedinaca.',
        options: [
          { value: 1, label: 'Znanje je zarobljeno u glavama pojedinaca koji ga ljubomorno čuvaju', subtext: 'Rizik od kolapsa ako ključna osoba ode' },
          { value: 2, label: 'Znanje se deli samo kada je hitno, bez pisane baze ili organizovanih sesija', subtext: 'Gubi se iskustvo i duplira posao' },
          { value: 3, label: 'Održavamo povremene interne prezentacije i arhiviramo važne dokumente', subtext: 'Solidna praksa razmene znanja' },
          { value: 4, label: 'Razvijena interna akademija / "Knowledge Base" i redovne sesije razmene iskustava', subtext: 'Organizacija koja uči i deli snagu' }
        ]
      }
    ]
  },
  {
    id: 'ucinak_kpi',
    number: 7,
    title: 'Učinak i KPI',
    shortTitle: 'Učinak & KPI',
    description: 'Merenje postignuća, postavljanje jasnih ciljeva, evaluacije radnog učinka i nagrađivanje rezultata.',
    iconName: 'Target',
    redFlagWarning: 'Subjektivne ocene, nagrađivanje po "lojalnosti", nemerljivi ciljevi i neprepoznavanje slabih radnika.',
    consultingSolution: 'Postavljanje SMART KPI/OKR sistema, strukturiranog polugodišnjeg Performance Review-a i varijabilnog nagrađivanja.',
    questions: [
      {
        id: 'ucinak_kpi_q1',
        text: 'Da li su ciljevi zaposlenih (KPI / OKR) merljivi, kvantifikovani i poznati na početku perioda?',
        contextHint: 'Zaposleni ne mogu postići cilj ako ne znaju tačno šta se od njih očekuje.',
        options: [
          { value: 1, label: 'Ciljevi uopšte nisu definisani, radi se "kako ko stigne"', subtext: 'Nema jasnog merila uspeha' },
          { value: 2, label: 'Ciljevi su previše opšti (npr. "radi bolje") i saopštavaju se retroaktivno', subtext: 'Subjektivna ocena bez uporišta u brojkama' },
          { value: 3, label: 'Ciljevi su većinom merljivi i definisani na nivou sektora i pojedinaca', subtext: 'Dobar fokus na prioritete' },
          { value: 4, label: 'Kaskadirani SMART ciljevi i OKR-ovi sa redovnim kvartalnim praćenjem progresa', subtext: 'Perfektna usklađenost sa strategijom kompanije' }
        ]
      },
      {
        id: 'ucinak_kpi_q2',
        text: 'Da li sprovodite periodične formalne evaluacije radnog učinka (Performance Review)?',
        contextHint: 'Strukturirani razgovori o učinku daju uvid u to ko doprinosi, a kome je potrebna podrška.',
        options: [
          { value: 1, label: 'Nikada ne radimo procenu učinka, o zaposlenima se sudi na osnovu utiska', subtext: 'Nepravedno rangiranje i nevidljiv doprinos' },
          { value: 2, label: 'Ocenjivanje se radi neredovno i doživljava se kao prazna birokratija', subtext: 'Nema konstruktivnih zaključaka' },
          { value: 3, label: 'Radimo godišnju procenu učinka sa strukturiranim upitnikom i razgovorom', subtext: 'Korisna retrospektiva rezultata' },
          { value: 4, label: 'Polugodišnji 360 review sa kalibracijom i povezivanjem sa razvojnim ciljevima', subtext: 'Sveobuhvatna i objektivna ocena doprinosa' }
        ]
      },
      {
        id: 'ucinak_kpi_q3',
        text: 'Da li su bonusi, stimulacije i napredovanje direktno vezani za ostvarene rezultate?',
        contextHint: 'Ako vrhunski radnik i nezainteresovan radnik dobijaju isto, vrhunski će otići.',
        options: [
          { value: 1, label: 'Bonusi se daju po "osećaju direktora" ili svi dobijaju isto bez obzira na trud', subtext: 'Demotivacija najproduktivnijih radnika' },
          { value: 2, label: 'Sistem postoji u prodaji, ali za ostale sektore nagrađivanje je netransparentno', subtext: 'Osećaj nejednakosti među sektorima' },
          { value: 3, label: 'Imamo definisana pravila za stimulacije usklađena sa postizanjem plana', subtext: 'Transparentno nagrađivanje' },
          { value: 4, label: 'Diferencirano nagrađivanje vrhunskog učinka i jasna veza rezultata sa kompenzacijom', subtext: 'Meritokratija i visoka motivacija za rezultat' }
        ]
      }
    ]
  },
  {
    id: 'fluktuacija',
    number: 8,
    title: 'Fluktuacija i retencija',
    shortTitle: 'Fluktuacija',
    description: 'Stabilnost radne snage, stopa napuštanja, prevencija burnout-a i retention strategija.',
    iconName: 'UserMinus',
    redFlagWarning: 'Odlazak ključnih nosilaca posla, gubitak dragocenog znanja, visoki troškovi stalnih zamena i pad morala.',
    consultingSolution: 'Implementacija analiza izlaznih intervjua (Exit Interview), mapiranje rizika odlaska i kreiranje retention programa za ključne uloge.',
    questions: [
      {
        id: 'fluktuacija_q1',
        text: 'Kakva je stopa fluktuacije zaposlenih u poslednjih 12 meseci (posebno ključnih ljudi)?',
        contextHint: 'Visoka stopa odlazaka simptom je dubljih problema u menadžmentu, platama ili kulturi.',
        options: [
          { value: 1, label: 'Visoka i zabrinjavajuća (>25%), odlaze nam nosioci posla i stručnjaci', subtext: 'Alarmantna situacija za poslovanje' },
          { value: 2, label: 'Umerena, ali imamo česte neočekivane odlaske koji nas operativno paralizuju', subtext: 'Stalni stres oko pronalaženja zamena' },
          { value: 3, label: 'Stopa je u granicama proseka industrije, imamo stabilno jezgro tima', subtext: 'Kontrolisana fluktuacija' },
          { value: 4, label: 'Izuzetno niska fluktuacija (<7%) i visoka lojalnost ključnih zaposlenih', subtext: 'Izuzetna stabilnost i privlačnost firme' }
        ]
      },
      {
        id: 'fluktuacija_q2',
        text: 'Da li redovno sprovodite strukturirane izlazne intervjue (Exit Interview) i analizirate uzroke?',
        contextHint: 'Izlazni intervju je najjeftiniji način da saznate istinu o svojoj kompaniji.',
        options: [
          { value: 1, label: 'Ne radimo ih – kada neko ode, samo se potpiše rešenje o prestanku radnog odnosa', subtext: 'Gubi se dragocen uvid u stvarne razloge otkaza' },
          { value: 2, label: 'Popričamo neformalno, ali nigde ne beležimo niti analiziramo trendove', subtext: 'Razlozi ostaju na nivou "otišao za veće pare"' },
          { value: 3, label: 'Sprovodimo intervju pred odlazak i evidentiramo ključne razloge', subtext: 'Solidna svest o problemima' },
          { value: 4, label: 'Standardizovan Exit upitnik i razgovor sa dubinskom analizom uzroka i korektivnim merama', subtext: 'Sprečavanje ponavljanja istih grešaka' }
        ]
      },
      {
        id: 'fluktuacija_q3',
        text: 'Da li kompanija ima aktivnu strategiju za zadržavanje talenata (Retention plan) i prevenciju sagorevanja (burnout)?',
        contextHint: 'Čuvanje postojećeg radnika košta višestruko manje od regrutovanja novog.',
        options: [
          { value: 1, label: 'Nemamo plan zadržavanja, reagujemo tek kontra-ponudom kad radnik donese otkaz', subtext: 'Kasno i skupo gašenje požara' },
          { value: 2, label: 'Svesni smo rizika burnout-a, ali nemamo konkretne mehanizme za sprečavanje', subtext: 'Radnici tiho sagorevaju pod pritiskom' },
          { value: 3, label: 'Identifikujemo ključne ljude i radimo na prilagođavanju uslova za njih', subtext: 'Proaktivniji pristup retenciji' },
          { value: 4, label: 'Razvijen sistem ranog upozorenja (Flight risk), well-being programi i plan retencije', subtext: 'Vrhunsko očuvanje ljudskog kapitala' }
        ]
      }
    ]
  },
  {
    id: 'plate_benefiti',
    number: 9,
    title: 'Plate i benefiti',
    shortTitle: 'Plate & Benefiti',
    description: 'Konkurentnost kompenzacija na tržištu, pravednost internih raspona i atraktivnost benefita.',
    iconName: 'BadgePercent',
    redFlagWarning: 'Gubitak dobrih radnika zbog plata ispod tržišta, nezadovoljstvo zbog netransparentnosti i beskorisni benefiti.',
    consultingSolution: 'Benčmarking plata u industriji, uvođenje platnih razreda i kreiranje flex-paketa benefita koji odgovaraju zaposlenima.',
    questions: [
      {
        id: 'plate_benefiti_q1',
        text: 'Da li je vaš sistem plata usklađen sa aktuelnim tržišnim podacima (HR industrijski benchmark)?',
        contextHint: 'Zastarele plate teraju talente kod konkurencije.',
        options: [
          { value: 1, label: 'Plate su ispod tržišnog proseka i godinama nisu usklađivane sa inflacijom', subtext: 'Ogroman rizik masovnog odlaska radnika' },
          { value: 2, label: 'Plate prilagođavamo tek kad neko zapreti odlaskom na razgovor', subtext: 'Reaktivna politika koja stvara nepravdu' },
          { value: 3, label: 'Redovno pratimo tržište i održavamo plate na solidnom konkurentnom nivou', subtext: 'Stabilna kompenzaciona politika' },
          { value: 4, label: 'Godišnji benchmarking sa zvaničnim platnim izveštajima i ciljanim percentile pozicioniranjem', subtext: 'Strateška privlačnost kompenzacija' }
        ]
      },
      {
        id: 'plate_benefiti_q2',
        text: 'Da li je struktura plata, raspona i radnih razreda pravedna i transparentna unutar firme?',
        contextHint: 'Interne platežne anomalije (npr. novajlija plaćen više od seniora bez opravdanja) uništavaju radni moral.',
        options: [
          { value: 1, label: 'Potpuni haos u platama: ljudi na istim ulogama imaju ogromne nerazumne razlike', subtext: 'Izvor stalnih frustracija i tenzija' },
          { value: 2, label: 'Rasponi postoje samo okvirno, određivanje plata je netransparentno', subtext: 'Zaposleni sumnjaju u objektivnost' },
          { value: 3, label: 'Definisani su platni razredi sa minimalnim i maksimalnim opsegom za poziciju', subtext: 'Jasna pravila igre' },
          { value: 4, label: 'Formalna sistematizacija sa platnim matricama, transparentnom strukturom i kriterijumima rasta', subtext: 'Visoka interna pravičnost' }
        ]
      },
      {
        id: 'plate_benefiti_q3',
        text: 'Da li ponuđeni paket benefita (osiguranje, fleksibilnost, edukacije) odgovara stvarnim željama zaposlenih?',
        contextHint: 'Benefiti koje niko ne koristi predstavljaju bačen novac.',
        options: [
          { value: 1, label: 'Nemamo nikakve dodatne benefite, samo zakonski minimum', subtext: 'Neatraktivna ponuda za nove kandidate' },
          { value: 2, label: 'Imamo 1-2 generička benefita za koje zaposleni uglavnom nisu preterano zainteresovani', subtext: 'Niska iskorišćenost benefita' },
          { value: 3, label: 'Nudimo privatno zdravstveno osiguranje, hibridni rad i sportske pogodnosti', subtext: 'Dobar i konkurentan standard' },
          { value: 4, label: 'Personalizovan paket pogodnosti ("cafeteria model") skrojen prema demografiji tima', subtext: 'Maksimalna zahvalnost i percipirana vrednost' }
        ]
      }
    ]
  },
  {
    id: 'wellbeing',
    number: 10,
    title: 'Well-being i psihološka bezbednost',
    shortTitle: 'Well-being',
    description: 'Balans privatnog i poslovnog života, prevencija sagorevanja (burnout), psihološka sigurnost i podrška zdravlju.',
    iconName: 'HeartHandshake',
    redFlagWarning: 'Hronično preopterećenje, sagorevanje ključnih ljudi (burnout), kultura straha i visoka stopa stresa koja vodi u nagle otkaze i bolovanja.',
    consultingSolution: 'Uvođenje protokola za prevenciju sagorevanja, kreiranje programa podrške zaposlenima (EAP) i edukacija menadžera o psihološkoj bezbednosti kroz People Pro metodologiju.',
    questions: [
      {
        id: 'wellbeing_q1',
        text: 'Da li kompanija aktivno vodi računa o balansu posla i života (Work-Life Balance) i kontroliše prekovremeni rad?',
        contextHint: 'Kontinuiran prekovremeni rad direktno vodi u pad koncentracije, greške i odlazak radnika.',
        options: [
          { value: 1, label: 'Prekovremeni rad je postao svakodnevica i podrazumeva se, ljudi su iscrpljeni', subtext: 'Visok rizik od masovnog sagorevanja' },
          { value: 2, label: 'Svesni smo da su ljudi preopterećeni, ali posla je previše pa se retko šta menja', subtext: 'Hroničan stres u ključnim periodima' },
          { value: 3, label: 'Poštujemo radno vreme uz povremena dežurstva koja se kompenzuju', subtext: 'Korektna ravnoteža obaveza' },
          { value: 4, label: 'Aktivno štitimo slobodno vreme, pratimo opterećenost i nudimo fleksibilnost', subtext: 'Izuzetna kultura poštovanja privatnog života' }
        ]
      },
      {
        id: 'wellbeing_q2',
        text: 'Koliko postoji psihološka bezbednost u timu – da li zaposleni smeju slobodno da priznaju grešku ili predlože promenu bez straha?',
        contextHint: 'U okruženju straha greške se kriju dok ne postanu preskupe, a inovacije potpuno zamiru.',
        options: [
          { value: 1, label: 'Vlada kultura straha i krivice – svaka greška se oštro osuđuje ili sankcioniše', subtext: 'Zaposleni kriju probleme i ćute' },
          { value: 2, label: 'Zavisi od nadređenog, neki menadžeri reaguju burno pa ljudi izbegavaju rizik', subtext: 'Zadržavanje informacija iz predostrožnosti' },
          { value: 3, label: 'Greške se uglavnom tretiraju kao prilika za učenje, atmosfera je otvorena', subtext: 'Dobra psihološka stabilnost' },
          { value: 4, label: 'Visoka psihološka bezbednost: podstiče se eksperimentisanje, iskrenost i međusobna podrška', subtext: 'Inovativno i podržavajuće radno okruženje' }
        ]
      },
      {
        id: 'wellbeing_q3',
        text: 'Da li kompanija pruža konkretne oblike podrške mentalnom i fizičkom zdravlju radnika (savetovanje, well-being, fleksibilnost)?',
        contextHint: 'Briga o dobrobiti zaposlenih povećava lojalnost i smanjuje skupa bolovanja.',
        options: [
          { value: 1, label: 'Ne pružamo nikakvu podršku, zdravlje zaposlenih se smatra njihovom ličnom stvarju', subtext: 'Nema svesti o wellbeing-u' },
          { value: 2, label: 'Ponekad organizujemo sportske ili neformalne aktivnosti, ali bez strateškog plana', subtext: 'Izolovani ad-hoc pokušaji' },
          { value: 3, label: 'Imamo obezbeđeno privatno zdravstveno i povremene radionice o upravljanju stresom', subtext: 'Dobra osnovna briga' },
          { value: 4, label: 'Razvijen sveobuhvatan Well-being program (EAP podrška, antistres sesije, ergonomija)', subtext: 'Strateška briga o ljudima sa srcem' }
        ]
      }
    ]
  }
];

export const SAMPLE_CLIENTS: ClientSubmission[] = [
  {
    id: 'klijent-001',
    submittedAt: '2026-10-28T14:30:00.000Z',
    status: 'nova_prijava',
    notifiedConsultant: true,
    companyInfo: {
      companyName: 'TechSolutions Balkan d.o.o.',
      pib: '108459201',
      maticniBroj: '20938472',
      industry: 'IT i softverske usluge',
      employeeCount: '51-150',
      contactPerson: 'Marko Jovanović',
      contactRole: 'Direktor i suosnivač',
      email: 'marko.jovanovic@techsolutions-balkan.rs',
      phone: '+381 64 222 3344',
      city: 'Beograd',
      hrSetup: 'Interni HR generalista (1 osoba)',
      primaryChallengeNote: 'Rastemo brzo ali gubimo seniore jer nemamo jasne KPI-jeve i karijerni put. Takođe plate su postale haotične.'
    },
    answers: {
      regrutacija_q1: 2, regrutacija_q2: 2, regrutacija_q3: 1, // 42% - RED
      onboarding_q1: 2, onboarding_q2: 2, onboarding_q3: 1, // 42% - RED
      tim_struktura_q1: 2, tim_struktura_q2: 2, tim_struktura_q3: 2, // 50% - YELLOW
      komunikacija_q1: 3, komunikacija_q2: 2, komunikacija_q3: 2, // 58% - YELLOW
      zadovoljstvo_q1: 1, zadovoljstvo_q2: 2, zadovoljstvo_q3: 2, // 42% - RED
      razvoj_q1: 1, razvoj_q2: 1, razvoj_q3: 2, // 33% - RED
      ucinak_kpi_q1: 1, ucinak_kpi_q2: 1, ucinak_kpi_q3: 1, // 25% - RED
      fluktuacija_q1: 2, fluktuacija_q2: 1, fluktuacija_q3: 1, // 33% - RED
      plate_benefiti_q1: 2, plate_benefiti_q2: 1, plate_benefiti_q3: 3, // 50% - YELLOW
      wellbeing_q1: 1, wellbeing_q2: 2, wellbeing_q3: 1 // 33% - RED
    },
    notes: 'Klijent se javio nakon preporuke. Hitno zakazati preliminarni poziv.',
    scores: {
      categoryScores: {
        regrutacija: 42,
        onboarding: 42,
        tim_struktura: 50,
        komunikacija: 58,
        zadovoljstvo: 42,
        razvoj: 33,
        ucinak_kpi: 25,
        fluktuacija: 33,
        plate_benefiti: 50,
        wellbeing: 33
      },
      overallScore: 41,
      overallRiskLevel: 'Kritičan',
      redPoints: [
        {
          categoryId: 'wellbeing',
          categoryTitle: 'Well-being i psihološka bezbednost',
          score: 33,
          severity: 'critical',
          critique: 'Hronično prekovremeni rad, sagorevanje ključnih developera i odsustvo podrške mentalnom zdravlju.',
          dangerImpact: 'Zaposleni trpe burnout koji je primarni okidač za nagle otkaze i dugotrajna bolovanja.',
          recommendedAction: 'Uvođenje antistres protokola, definisanje jasnih granica radnog vremena i edukacija menadžera.',
          suggestedPackage: 'CORE'
        },
        {
          categoryId: 'ucinak_kpi',
          categoryTitle: 'Učinak i KPI',
          score: 25,
          severity: 'critical',
          critique: 'Nema merljivih ciljeva, ocene su subjektivne, bonusi se dele bez jasnog sistema.',
          dangerImpact: 'Produktivni developeri osećaju nepravdu i napuštaju firmu, dok neproduktivni prolaze neprimećeno.',
          recommendedAction: 'Postavljanje SMART KPI/OKR sistema i polugodišnje evaluacije doprinosa.',
          suggestedPackage: 'CORE'
        },
        {
          categoryId: 'razvoj',
          categoryTitle: 'Razvoj zaposlenih',
          score: 33,
          severity: 'critical',
          critique: 'Nema karijernih matrica niti budžeta za edukaciju. Seniori nemaju vidljivu perspektivu.',
          dangerImpact: 'Gubitak ključnih nosilaca softverske arhitekture u korist inostranih kompanija.',
          recommendedAction: 'Dizajn career paths matrice za IT uloge i uvođenje Personal Development Planova.',
          suggestedPackage: 'CORE'
        },
        {
          categoryId: 'fluktuacija',
          categoryTitle: 'Fluktuacija i retencija',
          score: 33,
          severity: 'critical',
          critique: 'Visok odlazak ključnih ljudi bez analize izlaznih intervjua i bez retention plana.',
          dangerImpact: 'Svaki odlazak seniora košta firmu između 15.000 i 25.000 € u izgubljenim projektima i novoj regrutaciji.',
          recommendedAction: 'Uvođenje Exit intervjua i plana retencije za top 20% najvrednijih talenata.',
          suggestedPackage: 'START'
        },
        {
          categoryId: 'regrutacija',
          categoryTitle: 'Regrutacija i selekcija',
          score: 42,
          severity: 'high',
          critique: 'Proces selekcije je neprecizan, cost-per-hire se ne prati, troše se resursi menadžera.',
          dangerImpact: 'Pogrešne procene karaktera i veština na intervjuima vode u ponovljene otkaze.',
          recommendedAction: 'Standardizacija intervjua i uvođenje matrice tehničkih i mekih kompetencija.',
          suggestedPackage: 'START'
        },
        {
          categoryId: 'onboarding',
          categoryTitle: 'Onboarding (Uvođenje u posao)',
          score: 42,
          severity: 'high',
          critique: 'Novajlije se prepuštaju improvizaciji, nema 30/60/90 plana.',
          dangerImpact: 'Predugo vreme do prvog samostalnog commit-a ili zatvorenog zadatka.',
          recommendedAction: 'Formiranje strukturiranog onboarding plana sa mentorom.',
          suggestedPackage: 'CORE'
        },
        {
          categoryId: 'zadovoljstvo',
          categoryTitle: 'Zadovoljstvo zaposlenih',
          score: 42,
          severity: 'high',
          critique: 'Nikada nije meren eNPS, atmosfera je počela da se kvari pod pritiskom rokova.',
          dangerImpact: 'Talas skrivenih nezadovoljstava preti eskalacijom.',
          recommendedAction: 'Sprovođenje anonimne People Pro eNPS ankete i akcionog foruma sa menadžmentom.',
          suggestedPackage: 'START'
        }
      ],
      yellowPoints: [
        { categoryId: 'tim_struktura', categoryTitle: 'Tim i struktura', score: 50, recommendation: 'Precizirati organizacionu šemu i osloboditi osnivača operativnog mikromenadžmenta.' },
        { categoryId: 'plate_benefiti', categoryTitle: 'Plate i benefiti', score: 50, recommendation: 'Uvesti platne razrede i eliminisati anomalije između starih i novih plata.' },
        { categoryId: 'komunikacija', categoryTitle: 'Komunikacija i saradnja', score: 58, recommendation: 'Uvesti redovne 1-na-1 sastanke tim lidera sa inženjerima.' }
      ],
      greenPoints: [],
      recommendedTier: 'CORE',
      tierReason: 'Kompanija ima više od 4 kritične crvene tačke i prešla je 50 zaposlenih, što zahteva postavljanje celovitog HR sistema, jasne strukture, KPI evaluacije i karijernih staza.',
      executiveSummary: 'Detektovano je 6 crvenih tačaka koje ugrožavaju profitabilnost i zadržavanje talenata. Ključni fokus mora biti na uvođenju sistema ocene učinka, karijernog puta i retention plana kako bi se zaustavio odliv seniora.'
    }
  },
  {
    id: 'klijent-002',
    submittedAt: '2026-10-27T09:15:00.000Z',
    status: 'poslat_izvestaj',
    notifiedConsultant: true,
    companyInfo: {
      companyName: 'MetalPro Manufacturing d.o.o.',
      pib: '103892817',
      maticniBroj: '17892301',
      industry: 'Proizvodnja i industrija',
      employeeCount: '151-500',
      contactPerson: 'Snežana Nikolić',
      contactRole: 'HR Rukovodilac',
      email: 'snezana.nikolic@metalpro-serbia.com',
      phone: '+381 63 881 9900',
      city: 'Kragujevac',
      hrSetup: 'Razvijen HR tim (više stručnjaka)',
      primaryChallengeNote: 'Veliki nedostatak operatera u proizvodnji i nesuglasice između smenovođa i radnika.'
    },
    answers: {
      regrutacija_q1: 3, regrutacija_q2: 2, regrutacija_q3: 2, // 58%
      onboarding_q1: 3, onboarding_q2: 3, onboarding_q3: 2, // 67%
      tim_struktura_q1: 3, tim_struktura_q2: 2, tim_struktura_q3: 1, // 50%
      komunikacija_q1: 2, komunikacija_q2: 1, komunikacija_q3: 1, // 33% - RED
      zadovoljstvo_q1: 2, zadovoljstvo_q2: 2, zadovoljstvo_q3: 2, // 50%
      razvoj_q1: 2, razvoj_q2: 2, razvoj_q3: 2, // 50%
      ucinak_kpi_q1: 3, ucinak_kpi_q2: 2, ucinak_kpi_q3: 3, // 67%
      fluktuacija_q1: 1, fluktuacija_q2: 2, fluktuacija_q3: 1, // 33% - RED
      plate_benefiti_q1: 3, plate_benefiti_q2: 3, plate_benefiti_q3: 3, // 75% - GREEN
      wellbeing_q1: 2, wellbeing_q2: 2, wellbeing_q3: 2 // 50% - YELLOW
    },
    notes: 'Poslat izveštaj 27. oktobra. Zakazan video poziv za petak.',
    scores: {
      categoryScores: {
        regrutacija: 58,
        onboarding: 67,
        tim_struktura: 50,
        komunikacija: 33,
        zadovoljstvo: 50,
        razvoj: 50,
        ucinak_kpi: 67,
        fluktuacija: 33,
        plate_benefiti: 75,
        wellbeing: 50
      },
      overallScore: 53,
      overallRiskLevel: 'Umeren',
      redPoints: [
        {
          categoryId: 'komunikacija',
          categoryTitle: 'Komunikacija i saradnja',
          score: 33,
          severity: 'critical',
          critique: 'Ozbiljni konflikti između smenovođa i operatera, nedostatak 1-na-1 razgovora.',
          dangerImpact: 'Tenzije na proizvodnim linijama uzrokuju zastoje i namerno usporavanje rada.',
          recommendedAction: 'Edukacija poslovođa i smenovođa u komunikacijskim i liderskim veštinama.',
          suggestedPackage: 'CORE'
        },
        {
          categoryId: 'fluktuacija',
          categoryTitle: 'Fluktuacija i retencija',
          score: 33,
          severity: 'critical',
          critique: 'Visoka stopa odlazaka radnika u proizvodnji uprkos korektnim platama.',
          dangerImpact: 'Trošak stalnog obučavanja novih radnika i škart u proizvodnji.',
          recommendedAction: 'Dubinska analiza razloga napuštanja i uvođenje mentorskog dodataka za iskusne majstore.',
          suggestedPackage: 'START'
        }
      ],
      yellowPoints: [
        { categoryId: 'tim_struktura', categoryTitle: 'Tim i struktura', score: 50, recommendation: 'Osnažiti ulogu šefova smena kao prvog nivoa rukovođenja.' },
        { categoryId: 'zadovoljstvo', categoryTitle: 'Zadovoljstvo zaposlenih', score: 50, recommendation: 'Uvesti periodično anketiranje radnika o uslovima rada i bezbednosti.' },
        { categoryId: 'razvoj', categoryTitle: 'Razvoj zaposlenih', score: 50, recommendation: 'Formirati internu školu zavarivanja i CNC obrade.' },
        { categoryId: 'regrutacija', categoryTitle: 'Regrutacija i selekcija', score: 58, recommendation: 'Aktivirati programe dualnog obrazovanja i preporuka zaposlenih.' },
        { categoryId: 'onboarding', categoryTitle: 'Onboarding (Uvođenje u posao)', score: 67, recommendation: 'Formalizovati obuku o bezbednosti i mentorstvo novih radnika.' },
        { categoryId: 'ucinak_kpi', categoryTitle: 'Učinak i KPI', score: 67, recommendation: 'Povezati individualnu produktivnost sa smenskim bonusima.' }
      ],
      greenPoints: [
        { categoryId: 'plate_benefiti', categoryTitle: 'Plate i benefiti', score: 75, highlight: 'Plate su konkurentne za region Šumadije i isplaćuju se bez kašnjenja.' }
      ],
      recommendedTier: 'START',
      tierReason: 'Klijent već ima interni HR tim i solidan kompenzacioni paket, ali ima 2 akutne crvene tačke u komunikaciji poslovođa i fluktuaciji radnika koje se rešavaju ciljanom People Pro dijagnostikom i liderskim radionicama.',
      executiveSummary: 'Stabilna plata drži osnovu, ali loša komunikacija na liniji smenovođa-radnik stvara visoku fluktuaciju. Hitno rešenje je trening poslovođa za upravljanje ljudima i smanjenje sukoba.'
    }
  },
  {
    id: 'klijent-003',
    submittedAt: '2026-10-25T11:00:00.000Z',
    status: 'ugovoren_sastanak',
    notifiedConsultant: true,
    companyInfo: {
      companyName: 'Apex Distribucija d.o.o.',
      pib: '109923841',
      maticniBroj: '21049281',
      industry: 'Trgovina na veliko i distribucija',
      employeeCount: '11-50',
      contactPerson: 'Vladimir Lukić',
      contactRole: 'Osnivač i generalni direktor',
      email: 'vladimir.lukic@apex-distribucija.rs',
      phone: '+381 62 110 5566',
      city: 'Novi Sad',
      hrSetup: 'Nema internog HR-a (osnivač/menadžeri vode)',
      primaryChallengeNote: 'Nemamo HR, sve radim sam i gušim se u operativi. Hitno mi treba neko da postavi red.'
    },
    answers: {
      regrutacija_q1: 1, regrutacija_q2: 1, regrutacija_q3: 1, // 25% - RED
      onboarding_q1: 1, onboarding_q2: 2, onboarding_q3: 1, // 33% - RED
      tim_struktura_q1: 1, tim_struktura_q2: 1, tim_struktura_q3: 1, // 25% - RED
      komunikacija_q1: 2, komunikacija_q2: 2, komunikacija_q3: 1, // 42% - RED
      zadovoljstvo_q1: 1, zadovoljstvo_q2: 2, zadovoljstvo_q3: 1, // 33% - RED
      razvoj_q1: 1, razvoj_q2: 1, razvoj_q3: 1, // 25% - RED
      ucinak_kpi_q1: 1, ucinak_kpi_q2: 1, ucinak_kpi_q3: 2, // 33% - RED
      fluktuacija_q1: 1, fluktuacija_q2: 1, fluktuacija_q3: 1, // 25% - RED
      plate_benefiti_q1: 2, plate_benefiti_q2: 1, plate_benefiti_q3: 1, // 33% - RED
      wellbeing_q1: 1, wellbeing_q2: 1, wellbeing_q3: 1 // 25% - RED
    },
    notes: 'Potpisan preliminarni ugovor za START dijagnostiku, planira se prelazak na GROW partnerstvo.',
    scores: {
      categoryScores: {
        regrutacija: 25,
        onboarding: 33,
        tim_struktura: 25,
        komunikacija: 42,
        zadovoljstvo: 33,
        razvoj: 25,
        ucinak_kpi: 33,
        fluktuacija: 25,
        plate_benefiti: 33,
        wellbeing: 25
      },
      overallScore: 29,
      overallRiskLevel: 'Kritičan',
      redPoints: [
        {
          categoryId: 'wellbeing',
          categoryTitle: 'Well-being i psihološka bezbednost',
          score: 25,
          severity: 'critical',
          critique: 'Visok nivo stresa i sagorevanja, prekomeran rad i kultura gde se problemi prećutkuju.',
          dangerImpact: 'Gubitak produktivnosti i kolaps ključnih zaposlenih usled preopterećenja.',
          recommendedAction: 'Hitno definisanje granica radnih zaduženja i uspostavljanje psihološke podrške timu.',
          suggestedPackage: 'GROW'
        },
        {
          categoryId: 'tim_struktura',
          categoryTitle: 'Tim i struktura',
          score: 25,
          severity: 'critical',
          critique: 'Osnivač je usko grlo za 100% odluka. Zaposleni nemaju samostalnost.',
          dangerImpact: 'Vlasnik je pred burnout-om, rast firme je blokiran.',
          recommendedAction: 'Postavljanje operativne strukture, delegiranje ovlašćenja i People Pro START paket.',
          suggestedPackage: 'GROW'
        },
        {
          categoryId: 'regrutacija',
          categoryTitle: 'Regrutacija i selekcija',
          score: 25,
          severity: 'critical',
          critique: 'Potpuno stihijsko zapošljavanje bez profila i provere referenci.',
          dangerImpact: 'Konstantno primanje pogrešnih vozača i komercijalista.',
          recommendedAction: 'Kreiranje jasnih opisa poslova i standardizovanog upitnika za selekciju.',
          suggestedPackage: 'START'
        },
        {
          categoryId: 'fluktuacija',
          categoryTitle: 'Fluktuacija i retencija',
          score: 25,
          severity: 'critical',
          critique: 'Visoka fluktuacija u logistici i komercijali, ljudi odlaze bez izlaznog razgovora.',
          dangerImpact: 'Gubitak klijenata zbog nestabilnih komercijalista.',
          recommendedAction: 'Hitna analiza razloga odlazaka i zaštita ključnih kupaca.',
          suggestedPackage: 'GROW'
        }
      ],
      yellowPoints: [],
      greenPoints: [],
      recommendedTier: 'GROW',
      tierReason: 'Kao rastuća firma bez internog HR-a gde osnivač nosi sav teret, neophodan je People Pro kao eksterni HR Business Partner (GROW) koji preuzima postavljanje i vođenje svih ljudskih resursa.',
      executiveSummary: 'Kritičan nivo zrelosti (30%). Hitno je rasteretiti direktora i uvesti profesionalnog eksternog HR partnera za stabilizaciju zaposlenih i operacija.'
    }
  }
];
