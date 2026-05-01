import { randChoice, randDigits } from '../utils/random';

// Curated from commonly observed Indian banking headers in real SMS threads/datasets.
// This is deterministic (no randomness) so sender brand stays stable for a biller.
const CREDIT_CARD_SENDER_BRAND_RULES: Array<{ test: RegExp; brand: string }> = [
  { test: /sbi\s*card/i, brand: 'SBICRD' },
  { test: /hdfc/i, brand: 'HDFCBK' },
  { test: /icici/i, brand: 'ICICIB' },
  { test: /axis/i, brand: 'AXISBK' },
  { test: /kotak/i, brand: 'KOTAKB' },
  { test: /yes\s*bank/i, brand: 'YESBNK' },
  { test: /idfc\s*first/i, brand: 'IDFCFB' },
  { test: /indusind/i, brand: 'INDUSB' },
  { test: /rbl/i, brand: 'RBLBNK' },
  { test: /federal/i, brand: 'FEDBNK' },
  { test: /au\s*bank/i, brand: 'AUBANK' },
  { test: /bandhan/i, brand: 'BANDBK' },
  { test: /bob|bank\s*of\s*baroda/i, brand: 'BOBCRD' },
  { test: /bank\s*of\s*india/i, brand: 'BOIIND' },
  { test: /canara/i, brand: 'CANBNK' },
  { test: /city\s*union|\bcub\b/i, brand: 'CUBBNK' },
  { test: /dbs/i, brand: 'DBSBNK' },
  { test: /dcb/i, brand: 'DCBBNK' },
  { test: /dhanlaxmi/i, brand: 'DHANBK' },
  { test: /edge\s*csb|\bcsb\b/i, brand: 'CSBBNK' },
  { test: /esaf/i, brand: 'ESAFBK' },
  { test: /hsbc/i, brand: 'HSBCBK' },
  { test: /idbi/i, brand: 'IDBIBK' },
  { test: /one\s*-?\s*indian\s*bank|indian\s*bank/i, brand: 'INDIBK' },
  { test: /\biob\b|indian\s*overseas/i, brand: 'IOBBNK' },
  { test: /punjab\s*national|\bpnb\b/i, brand: 'PNBCRD' },
  { test: /saraswat/i, brand: 'SARBNK' },
  { test: /sbm\s*bank/i, brand: 'SBMBNK' },
  { test: /south\s*indian|\bsib\b/i, brand: 'SIBBNK' },
  { test: /suryoday/i, brand: 'SURYBK' },
  { test: /tamilnad\s*mercantile|\btmb\b/i, brand: 'TMBBNK' },
  { test: /union\s*bank/i, brand: 'UNIONB' },
];

// Curated from observed DISCOM/utility abbreviations used in India electricity billing.
// Keeps sender brand deterministic and realistic for electricity boards.
const ELECTRICITY_SENDER_BRAND_RULES: Array<{ test: RegExp; brand: string }> = [
  { test: /bescom|bangalore electricity supply/i, brand: 'BESCOM' },
  { test: /bharatpur electricity services|\bbesl\b/i, brand: 'BESLXX' },
  { test: /b\.e\.s\.t mumbai|best\b.*mumbai/i, brand: 'BESTXX' },
  { test: /bses\s*rajdhani|brpl\b/i, brand: 'BRPLXX' },
  { test: /bses\s*yamuna|bypl\b/i, brand: 'BYPLXX' },
  { test: /kseb|ksebl|kerala state electricity/i, brand: 'KSEBLX' },
  { test: /tangedco|tneb|tnpdcl|tamil nadu.*electric/i, brand: 'TANGED' },
  { test: /msedcl|mahadiscom|maharashtra state electricity distbn/i, brand: 'MSEDCL' },
  { test: /uppcl|uttar pradesh power/i, brand: 'UPPCLX' },
  { test: /pspcl|punjab state power/i, brand: 'PSPCLX' },
  { test: /cesc\b|cesc limited/i, brand: 'CESCXX' },
  { test: /wbsedcl|west bengal state electricity/i, brand: 'WBSEDC' },
  { test: /dgvcl|dakshin gujarat vij/i, brand: 'DGVCLX' },
  { test: /mgvcl|madhya gujarat vij/i, brand: 'MGVCLX' },
  { test: /pgvcl|paschim gujarat vij/i, brand: 'PGVCLX' },
  { test: /ugvcl|uttar gujarat vij/i, brand: 'UGVCLX' },
  { test: /dhbvn|dakshin haryana bijli/i, brand: 'DHBVNX' },
  { test: /uhbvn|uttar haryana bijli/i, brand: 'UHBVNX' },
  { test: /jvvnl|jaipur vidyut/i, brand: 'JVVNLX' },
  { test: /avvnl|ajmer vidyut/i, brand: 'AVVNLX' },
  { test: /jdvvnl|jodhpur vidyut/i, brand: 'JDVVNL' },
  { test: /jbvnl|jharkhand bijli/i, brand: 'JBVNLX' },
  { test: /tsspdcl|southern power distribution.*telangana/i, brand: 'TSSPDC' },
  { test: /tsnpdcl|northern power distribution.*telangana/i, brand: 'TSNPDC' },
  { test: /apcpdcl|andhra pradesh central power/i, brand: 'APCPDC' },
  { test: /apepdcl/i, brand: 'APEPDC' },
  { test: /apspdcl/i, brand: 'APSPDC' },
  { test: /hescom|hubli electricity/i, brand: 'HESCOM' },
  { test: /gescom|gulbarga electricity/i, brand: 'GESCOM' },
  { test: /cescom|chamundeshwari/i, brand: 'CESCOM' },
  { test: /mescom|mangalore electricity/i, brand: 'MESCOM' },
  { test: /nbpdcl|north bihar power/i, brand: 'NBPDCL' },
  { test: /sbpdcl|south bihar power/i, brand: 'SBPDCL' },
  { test: /mpcz|mp madhya kshetra/i, brand: 'MPCZXX' },
  { test: /mpez|mp poorv kshetra/i, brand: 'MPEZXX' },
  { test: /mppkvvcl|mp paschim kshetra/i, brand: 'MPPKVV' },
  { test: /best\b.*mumbai|brihanmumbai electric/i, brand: 'BESTXX' },
  { test: /gift power/i, brand: 'GIFTPW' },
  { test: /hukkeri rural electric/i, brand: 'HUKRUR' },
  { test: /india power prepaid meter/i, brand: 'IPCLPP' },
  { test: /kanan devan hills/i, brand: 'KDHPLT' },
  { test: /kinesco power/i, brand: 'KINESC' },
  { test: /m\.p\.\s*madhya kshetra vidyut vitaran/i, brand: 'MPCZXX' },
  { test: /m\.p\.\s*poorv kshetra vidyut vitaran/i, brand: 'MPEZXX' },
  { test: /m\.p\.\s*paschim kshetra vidyut vitaran/i, brand: 'MPPKVV' },
  { test: /adani electricity mumbai/i, brand: 'AEMLXX' },
  { test: /tata power\s*-\s*delhi/i, brand: 'TPDDLX' },
  { test: /tata power\s*-\s*mumbai/i, brand: 'TPMUMX' },
  { test: /co\s*operative electric supply society.*sircilla/i, brand: 'CESSLT' },
  { test: /thrissur corporation electricity department/i, brand: 'THRSED' },
  { test: /torrent power/i, brand: 'TORPWR' },
  { test: /tp renewables microgrid/i, brand: 'TPRENW' },
  { test: /tp southen odisha distribution|tp southern odisha distribution/i, brand: 'TPSODL' },
  { test: /ttd electricity/i, brand: 'TTDXXX' },
  { test: /vaghani energy/i, brand: 'VAGHEN' },
  { test: /west bengal electricity prepaid|west bengal electricity/i, brand: 'WBSEDC' },
  { test: /jamshedpur utilities and services company|\bjusco\b/i, brand: 'JUSCOX' },
  { test: /noida power|npcl\b/i, brand: 'NPCLXX' },
  { test: /goa electricity department/i, brand: 'GOAEDX' },
  { test: /electricity department chandigarh/i, brand: 'CHDEDX' },
  { test: /puducherry electricity department|electricity.py.gov.in/i, brand: 'PUDEDX' },
  { test: /mizoram.*power|power.*mizoram/i, brand: 'MIZPWR' },
  { test: /nagaland.*power|department.*power.*nagaland/i, brand: 'NAGPWR' },
  { test: /arunachal.*power|department.*power.*arunachal/i, brand: 'ARPWRX' },
  { test: /sikkim.*power/i, brand: 'SKMPWR' },
  { test: /lakshadweep electricity department/i, brand: 'LAKEDX' },
  { test: /apdcl|assam power/i, brand: 'APDCLX' },
  { test: /cspdcl|chhattisgarh.*power/i, brand: 'CSPDCL' },
  { test: /hpseb|hpsebl|himachal.*electricity/i, brand: 'HPSEBL' },
  { test: /upcl\b|uttarakhand power/i, brand: 'UPCLXX' },
  { test: /tpadl|tp.*ajmer/i, brand: 'TPADLX' },
  { test: /tpcodl|tp.*central.*odisha/i, brand: 'TPCODL' },
  { test: /tpnodl|tp.*northern.*odisha/i, brand: 'TPNODL' },
  { test: /tpsodl|tp.*southern.*odisha/i, brand: 'TPSODL' },
  { test: /tpwodl|tp.*western.*odisha/i, brand: 'TPWODL' },
  { test: /tsecl|tripura electricity/i, brand: 'TSECLX' },
  { test: /mspdcl|manipur.*power/i, brand: 'MSPDCL' },
  { test: /mepdcl|meghalaya.*power/i, brand: 'MEPDCL' },
  { test: /jpdcl|jammu power/i, brand: 'JPDCLX' },
  { test: /kpdcl|kashmir power/i, brand: 'KPDCLX' },
  { test: /lpdd|ladakh.*power/i, brand: 'LPDDXX' },
  { test: /dnhpdcl|dadra.*nagar.*haveli.*power/i, brand: 'DNHPDC' },
  { test: /bkesl|bikaner electricity/i, brand: 'BKESLX' },
  { test: /kedl|kota electricity/i, brand: 'KEDLXX' },
  { test: /aeml\b.*seepz|aeml seepz/i, brand: 'AEMLXX' },
  { test: /ipcl|india power.*corporation/i, brand: 'IPCLXX' },
  { test: /pvvnl|paschimanchal vidyut/i, brand: 'PVVNLX' },
  { test: /dvvnl|dakshinanchal vidyut/i, brand: 'DVVNLX' },
  { test: /mvvnl|madhyanchal vidyut/i, brand: 'MVVNLX' },
  { test: /puvvnl|purvanchal vidyut/i, brand: 'PUVVNL' },
  { test: /kesco|kanpur electricity supply/i, brand: 'KESCOX' },
  { test: /dpl|durgapur projects/i, brand: 'DPLXXX' },
  { test: /aniidco|andaman.*nicobar.*integrated/i, brand: 'ANIIDC' },
  { test: /uisl|tata steel.*uisl/i, brand: 'UISLXX' },
  { test: /ndmc|new delhi municipal council.*electricity/i, brand: 'NDMCXX' },
];

// Curated from observed DLT-registered sender brands for Mobile Postpaid carriers.
const MOBILE_POSTPAID_SENDER_BRAND_RULES: Array<{ test: RegExp; brand: string }> = [
  { test: /airtel/i, brand: 'AIRTEL' },
  { test: /jio/i, brand: 'JIOBIL' },
  { test: /vi\b|vodafone|idea/i, brand: 'VIPAYS' },
  { test: /bsnl/i, brand: 'BSNLMO' },
  { test: /mtnl.*delhi|delhi.*dolphin/i, brand: 'MTNLDL' },
  { test: /mtnl.*mumbai|mumbai.*dolphin/i, brand: 'MTNLMB' },
  { test: /tata teleservices/i, brand: 'TATMOB' },
];

// Curated from observed DLT-registered sender brands for Broadband Postpaid ISPs.
const BROADBAND_SENDER_BRAND_RULES: Array<{ test: RegExp; brand: string }> = [
  { test: /act fibernet/i, brand: 'ACTFIB' },
  { test: /airtel/i, brand: 'AIRTEL' },
  { test: /djio|jio.*fiber/i, brand: 'JIOFBR' },
  { test: /bsnl/i, brand: 'BSNLBB' },
  { test: /hathway/i, brand: 'HTHWAY' },
  { test: /den.*broadband|den.*network/i, brand: 'DENNWK' },
  { test: /tikona/i, brand: 'TIKONA' },
  { test: /excitel/i, brand: 'EXCITL' },
  { test: /you broadband/i, brand: 'YOUBRD' },
  { test: /tata.*play.*fiber|tata.*fiber|tata.*sky.*broadband/i, brand: 'TATAPL' },
];

const getCreditCardBrand = (billerName: string) => {
  const mapped = CREDIT_CARD_SENDER_BRAND_RULES.find((entry) => entry.test.test(billerName));
  if (mapped) return mapped.brand;

  // Non-random deterministic fallback: derive from issuer words, excluding generic terms.
  const issuerOnly = billerName
    .replace(/\b(credit|card|bank|limited|india|one|rupay|co\-?operative|small|finance|ltd|pvt|pixel)\b/gi, ' ')
    .replace(/[^A-Z]/gi, '')
    .toUpperCase();

  return issuerOnly.padEnd(6, 'X').substring(0, 6);
};

const getElectricityBrand = (billerName: string) => {
  const mapped = ELECTRICITY_SENDER_BRAND_RULES.find((entry) => entry.test.test(billerName));
  if (mapped) return mapped.brand;

  const acronymMatch = billerName.match(/\(([A-Za-z]{3,10})\)/);
  if (acronymMatch) {
    return acronymMatch[1].toUpperCase().replace(/[^A-Z]/g, '').padEnd(6, 'X').substring(0, 6);
  }

  const compact = billerName
    .toUpperCase()
    .replace(/\b(ELECTRICITY|POWER|DISTRIBUTION|CORPORATION|COMPANY|LIMITED|DEPARTMENT|STATE|GOVERNMENT|LTD|CO|AND|OF|FOR|THE|NIGAM|VITRAN|SUPPLY|BOARD|PREPAID|METER|RECHARGE|NON|RAPDR|FETCH|PAY)\b/g, ' ')
    .replace(/[^A-Z ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const words = compact.split(' ').filter(Boolean);
  const initials = words.map((w) => w[0]).join('');
  const merged = (initials.length >= 4 ? initials : words.join('')).replace(/[^A-Z]/g, '');
  return merged.padEnd(6, 'X').substring(0, 6);
};

export const getBrand = (category: string, name: string) => {
  if ((category || '').toLowerCase() === 'credit card') {
    return getCreditCardBrand(name);
  }

  if ((category || '').toLowerCase() === 'electricity') {
    return getElectricityBrand(name);
  }

  if ((category || '').toLowerCase() === 'mobile postpaid') {
    const mapped = MOBILE_POSTPAID_SENDER_BRAND_RULES.find((entry) => entry.test.test(name));
    if (mapped) return mapped.brand;
  }

  if ((category || '').toLowerCase() === 'broadband postpaid') {
    const mapped = BROADBAND_SENDER_BRAND_RULES.find((entry) => entry.test.test(name));
    if (mapped) return mapped.brand;
  }

  const letters = name.toUpperCase().replace(/[^A-Z]/g, '');
  return letters.padEnd(6, 'X').substring(0, 6);
};

export const getLsa = (state: string) => {
  const map: Record<string, string> = {
    'DELHI': 'D', 'MAHARASHTRA': 'M', 'KARNATAKA': 'K', 'TAMIL NADU': 'T', 'ANDHRA PRADESH': 'A', 'TELANGANA': 'A', 'KERALA': 'L', 'PUNJAB': 'P', 'GUJARAT': 'G', 'WEST BENGAL': 'K',
    'RAJASTHAN': 'R', 'MADHYA PRADESH': 'Y', 'UTTAR PRADESH': 'W', 'BIHAR': 'B', 'ODISHA': 'O', 'HARYANA': 'H', 'ASSAM': 'S'
  };
  return map[state ? state.toUpperCase() : ''] || randChoice(['A', 'D', 'G', 'K', 'M', 'P', 'T']);
};

const stateShort = (state: string) => (state || 'NA').replace(/[^A-Z]/gi, '').toUpperCase().slice(0, 2).padEnd(2, 'X');

const getElectricityIdentifier = (billerName: string, state: string) => {
  const n = billerName.toLowerCase();
  // Major state boards — primary 5 (explicit formats)
  if (/bescom|bangalore electricity supply/.test(n)) return { label: 'RR No.', value: `E${randDigits(6)}` };
  if (/kseb|ksebl|kerala state electricity/.test(n)) return { label: 'Consumer No.', value: `11${randDigits(11)}` };
  if (/tangedco|tneb|tamil nadu.*electric|tnpdcl/.test(n)) return { label: 'Service Connection No.', value: `${randDigits(3)}-${randDigits(3)}-${randDigits(3)}` };
  if (/msedcl|mahadiscom|maharashtra state electricity distbn/.test(n)) return { label: 'Consumer No.', value: randDigits(12) };
  if (/uppcl|uttar pradesh power/.test(n)) return { label: 'Account No.', value: randDigits(10) };
  // Karnataka boards — each uses RR No. with board-specific alphabetic prefix
  if (/hescom|hubli electricity/.test(n)) return { label: 'RR No.', value: `H${randDigits(7)}` };
  if (/cescom|chamundeshwari/.test(n)) return { label: 'RR No.', value: `C${randDigits(7)}` };
  if (/mescom|mangalore electricity/.test(n)) return { label: 'RR No.', value: `M${randDigits(7)}` };
  if (/gescom|gulbarga electricity/.test(n)) return { label: 'RR No.', value: `G${randDigits(7)}` };
  if (/hukkeri rural/.test(n)) return { label: 'RR No.', value: `HK${randDigits(6)}` };
  // Gujarat fetch-and-pay boards — 11-digit consumer number
  if (/dgvcl|dakshin gujarat vij/.test(n)) return { label: 'Consumer No.', value: randDigits(11) };
  if (/mgvcl|madhya gujarat vij/.test(n)) return { label: 'Consumer No.', value: randDigits(11) };
  if (/pgvcl|paschim gujarat vij/.test(n)) return { label: 'Consumer No.', value: randDigits(11) };
  if (/ugvcl|uttar gujarat vij/.test(n)) return { label: 'Consumer No.', value: randDigits(11) };
  // Punjab — 12-digit account number
  if (/pspcl|punjab state power/.test(n)) return { label: 'Account No.', value: randDigits(12) };
  // West Bengal
  if (/cesc\b|cesc limited/.test(n)) return { label: 'CA No.', value: randDigits(11) };
  if (/wbsedcl|west bengal state electricity/.test(n)) return { label: 'Consumer ID', value: `WB${randDigits(9)}` };
  // Haryana — 12-digit account number
  if (/dhbvn|dakshin haryana bijli/.test(n)) return { label: 'Account No.', value: randDigits(12) };
  if (/uhbvn|uttar haryana bijli/.test(n)) return { label: 'Account No.', value: randDigits(12) };
  // Rajasthan — K. No. format (K + 12 digits)
  if (/jvvnl|jaipur vidyut/.test(n)) return { label: 'K. No.', value: `K${randDigits(12)}` };
  if (/avvnl|ajmer vidyut/.test(n)) return { label: 'K. No.', value: `K${randDigits(12)}` };
  if (/jdvvnl|jodhpur vidyut/.test(n)) return { label: 'K. No.', value: `K${randDigits(12)}` };
  if (/bharatpur electricity services|besl\b/.test(n)) return { label: 'Consumer No.', value: randDigits(10) };
  // Jharkhand — 12-digit consumer number
  if (/jbvnl|jharkhand bijli/.test(n)) return { label: 'Consumer No.', value: randDigits(12) };
  // Telangana — 10-digit service connection number
  if (/southern power distribution.*telangana|tsspdcl/.test(n)) return { label: 'Service Connection No.', value: randDigits(10) };
  if (/northern power distribution.*telangana|tsnpdcl/.test(n)) return { label: 'Service Connection No.', value: randDigits(10) };
  // Andhra Pradesh — 10-digit IVRS number
  if (/andhra pradesh central power|apcpdcl/.test(n)) return { label: 'IVRS No.', value: randDigits(10) };
  if (/apepdcl/.test(n)) return { label: 'IVRS No.', value: randDigits(10) };
  if (/apspdcl/.test(n)) return { label: 'IVRS No.', value: randDigits(10) };
  // Bihar — 11-digit CA number
  if (/north bihar power|nbpdcl/.test(n)) return { label: 'CA No.', value: randDigits(11) };
  if (/south bihar power|sbpdcl/.test(n)) return { label: 'CA No.', value: randDigits(11) };
  // Madhya Pradesh — 11-digit consumer number
  if (/mp madhya kshetra/.test(n)) return { label: 'Consumer No.', value: randDigits(11) };
  if (/mp poorv kshetra/.test(n)) return { label: 'Consumer No.', value: randDigits(11) };
  if (/mp paschim kshetra/.test(n)) return { label: 'Consumer No.', value: randDigits(11) };
  // BSES Delhi — 13-digit CA number
  if (/bses/.test(n)) return { label: 'CA No.', value: randDigits(13) };
  // West Bengal — Consumer ID for both WBSEDCL entries
  if (/wbsedcl|west bengal.*electricity/.test(n)) return { label: 'Consumer ID', value: `WB${randDigits(9)}` };
  // BEST Mumbai — 6-digit Consumer No.
  if (/best\b.*mumbai|brihanmumbai electric/.test(n)) return { label: 'Consumer No.', value: randDigits(6) };
  // Assam — 11-digit Consumer No.
  if (/assam power|apdcl\b/.test(n)) return { label: 'Consumer No.', value: randDigits(11) };
  // Chhattisgarh — 12-digit Consumer No.
  if (/chhattisgarh.*power|cspdcl\b/.test(n)) return { label: 'Consumer No.', value: randDigits(12) };
  // Chandigarh — 10-digit Account No.
  if (/electricity.*chandigarh|chandigarh.*electricity/.test(n)) return { label: 'Account No.', value: randDigits(10) };
  // Himachal Pradesh
  if (/himachal.*electricity|hpseb|hpsebl/.test(n)) return { label: 'Consumer No.', value: randDigits(10) };
  // Uttarakhand
  if (/uttarakhand power|upcl\b/.test(n)) return { label: 'Consumer No.', value: randDigits(10) };
  // Noida Power
  if (/noida power/.test(n)) return { label: 'Consumer No.', value: randDigits(10) };
  // Goa
  if (/goa.*electricity|electricity.*goa/.test(n)) return { label: 'Consumer No.', value: randDigits(10) };
  // Puducherry
  if (/puducherry.*electricity|electricity.*puducherry/.test(n)) return { label: 'Service No.', value: randDigits(10) };
  // TP Odisha discoms — BP No. (Tata Power format, 11 digits)
  if (/tp.*odisha|tpcodl|tpnodl|tpsodl|tpwodl/.test(n)) return { label: 'BP No.', value: randDigits(11) };
  // TP Ajmer
  if (/tp.*ajmer|tpadl\b/.test(n)) return { label: 'Consumer No.', value: randDigits(10) };
  // Tripura
  if (/tripura electricity|tsecl\b/.test(n)) return { label: 'Consumer No.', value: `TR${randDigits(8)}` };
  // Manipur
  if (/manipur.*power|mspdcl\b/.test(n)) return { label: 'Consumer No.', value: randDigits(10) };
  // Meghalaya
  if (/meghalaya.*power|mepdcl\b/.test(n)) return { label: 'Consumer No.', value: randDigits(10) };
  // Mizoram
  if (/mizoram.*power|power.*mizoram/.test(n)) return { label: 'Consumer No.', value: randDigits(10) };
  // Nagaland
  if (/nagaland.*power|department.*power.*nagaland/.test(n)) return { label: 'Consumer No.', value: randDigits(9) };
  // Arunachal Pradesh
  if (/arunachal.*power|department.*power.*arunachal/.test(n)) return { label: 'Consumer No.', value: randDigits(10) };
  // Sikkim
  if (/sikkim.*power/.test(n)) return { label: 'Consumer No.', value: randDigits(9) };
  // Jammu
  if (/jammu power|jpdcl\b/.test(n)) return { label: 'Consumer No.', value: `J${randDigits(9)}` };
  // Kashmir
  if (/kashmir power|kpdcl\b/.test(n)) return { label: 'Consumer No.', value: `K${randDigits(9)}` };
  // Ladakh
  if (/ladakh.*power|lpdd\b/.test(n)) return { label: 'Consumer No.', value: randDigits(8) };
  // Lakshadweep
  if (/lakshadweep.*electricity/.test(n)) return { label: 'Consumer No.', value: randDigits(7) };
  // Dadra & Nagar Haveli
  if (/dadra.*nagar.*haveli.*power|dnhpdcl\b/.test(n)) return { label: 'Consumer No.', value: randDigits(10) };
  // Bikaner
  if (/bikaner electricity|bkesl\b/.test(n)) return { label: 'Consumer No.', value: randDigits(10) };
  // Kota Electricity Distribution
  if (/kota electricity|kedl\b/.test(n)) return { label: 'Account No.', value: randDigits(10) };
  // AEML SEEPZ (Adani)
  if (/aeml\b.*seepz|aeml seepz/.test(n)) return { label: 'Consumer No.', value: randDigits(10) };
  // India Power Corporation
  if (/india power.*corporation|ipcl\b/.test(n)) return { label: 'Consumer No.', value: `IP${randDigits(8)}` };
  // TTD Electricity
  if (/ttd.*electricity|tirumala.*tirupati/.test(n)) return { label: 'Consumer No.', value: randDigits(8) };
  // Private/small utilities
  if (/gift power/.test(n)) return { label: 'Consumer No.', value: randDigits(9) };
  if (/vaghani energy/.test(n)) return { label: 'Consumer No.', value: randDigits(9) };
  if (/kinesco power/.test(n)) return { label: 'Consumer No.', value: randDigits(10) };
  if (/tata steel.*uisl|uisl\b/.test(n)) return { label: 'Consumer No.', value: randDigits(10) };
  if (/thrissur.*electricity/.test(n)) return { label: 'Consumer No.', value: randDigits(10) };
  if (/co.?operative electric.*sircilla/.test(n)) return { label: 'Consumer No.', value: randDigits(9) };
  if (/kanan devan hills/.test(n)) return { label: 'Consumer No.', value: randDigits(8) };
  // TP Renewables
  if (/tp.*renewables.*microgrid/.test(n)) return { label: 'Account No.', value: `TPR${randDigits(7)}` };
  // Uttar Pradesh DISCOMs — 10-digit Account No.
  if (/pvvnl|paschimanchal vidyut/.test(n)) return { label: 'Account No.', value: randDigits(10) };
  if (/dvvnl|dakshinanchal vidyut/.test(n)) return { label: 'Account No.', value: randDigits(10) };
  if (/mvvnl|madhyanchal vidyut/.test(n)) return { label: 'Account No.', value: randDigits(10) };
  if (/puvvnl|purvanchal vidyut/.test(n)) return { label: 'Account No.', value: randDigits(10) };
  if (/kesco|kanpur electricity supply/.test(n)) return { label: 'Account No.', value: randDigits(10) };
  // Durgapur Projects Limited — 11-digit Consumer No.
  if (/durgapur projects/.test(n)) return { label: 'Consumer No.', value: randDigits(11) };
  // ANIIDCO — Andaman & Nicobar
  if (/aniidco|andaman.*nicobar.*integrated/.test(n)) return { label: 'Consumer No.', value: randDigits(10) };
  // Torrent Power Surat and Bhiwandi — 9-digit Consumer No.
  if (/torrent power surat/.test(n)) return { label: 'Consumer No.', value: randDigits(9) };
  if (/torrent power bhiwandi/.test(n)) return { label: 'Consumer No.', value: randDigits(9) };
  // JUSCO — 12-digit BP No.
  if (/jamshedpur utilities|jusco\b/.test(n)) return { label: 'BP No.', value: randDigits(12) };
  // Generic fallbacks
  if (/prepaid/.test(n)) return { label: 'Meter No.', value: `${stateShort(state)}${randDigits(10)}` };
  if (/north|south|east|west/.test(n)) return { label: 'CA No.', value: `${stateShort(state)}${randDigits(10)}` };
  return { label: 'Consumer No.', value: `${stateShort(state)}${randDigits(10)}` };
};

const getWaterIdentifier = (billerName: string, _state: string) => {
  const n = billerName.toLowerCase();
  if (/bangalore water supply|bwssb/.test(n)) return { label: 'Property No.', value: `BWSSB${randDigits(7)}` };
  if (/delhi jal board/.test(n)) return { label: 'K No.', value: `K${randDigits(10)}` };
  if (/cmwssb|chennai metro water/.test(n)) return { label: 'Consumer No.', value: randDigits(11) };
  if (/mcgm water/.test(n)) return { label: 'Consumer No.', value: `${randDigits(3)}-${randDigits(3)}-${randDigits(5)}` };
  if (/hmwssb|hyderabad metro water/.test(n)) return { label: 'Consumer No.', value: randDigits(12) };
  if (/kerala water authority|kwa\b/.test(n)) return { label: 'Consumer No.', value: randDigits(10) };
  if (/pune municipal.*water/.test(n)) return { label: 'Consumer No.', value: randDigits(10) };
  return { label: 'Connection No.', value: `WTR${randDigits(10)}` };
};

const getGasIdentifier = (billerName: string, _state: string) => {
  const n = billerName.toLowerCase();
  if (/indraprastha gas|igl\b/.test(n)) return { label: 'BP No.', value: `IGN${randDigits(7)}` };
  if (/mahanagar gas|mgl\b/.test(n)) return { label: 'CA No.', value: randDigits(10) };
  if (/gujarat gas/.test(n)) return { label: 'Customer No.', value: randDigits(11) };
  if (/gail gas/.test(n)) return { label: 'Consumer No.', value: `GAIL${randDigits(7)}` };
  if (/gail india|gail limited/.test(n)) return { label: 'Consumer No.', value: `GAIL${randDigits(7)}` };
  if (/adani total gas/.test(n)) return { label: 'Customer ID', value: randDigits(10) };
  if (/maharashtra natural gas|mngl/.test(n)) return { label: 'Consumer No.', value: randDigits(10) };
  if (/sabarmati gas/.test(n)) return { label: 'Customer No.', value: randDigits(11) };
  if (/torrent gas/.test(n)) return { label: 'Customer No.', value: randDigits(10) };
  if (/aavantika gas/.test(n)) return { label: 'Consumer No.', value: randDigits(10) };
  if (/assam gas/.test(n)) return { label: 'Consumer No.', value: `AG${randDigits(8)}` };
  if (/bengal gas/.test(n)) return { label: 'Consumer No.', value: randDigits(10) };
  if (/bhagyanagar gas/.test(n)) return { label: 'BP No.', value: randDigits(10) };
  if (/central u\.?p\.? gas/.test(n)) return { label: 'Consumer No.', value: randDigits(10) };
  if (/charotar gas/.test(n)) return { label: 'Customer No.', value: randDigits(10) };
  if (/goa natural gas/.test(n)) return { label: 'Consumer No.', value: randDigits(9) };
  if (/godavari gas/.test(n)) return { label: 'Consumer No.', value: randDigits(10) };
  if (/green gas/.test(n)) return { label: 'Consumer No.', value: randDigits(11) };
  if (/hp oil gas/.test(n)) return { label: 'Customer No.', value: randDigits(10) };
  if (/hpr falcon gas/.test(n)) return { label: 'Consumer No.', value: randDigits(9) };
  if (/haridwar natural gas/.test(n)) return { label: 'Consumer No.', value: randDigits(10) };
  if (/haryana city gas/.test(n)) return { label: 'BP No.', value: randDigits(10) };
  if (/hindustan petroleum.*piped|hpcl.*piped/.test(n)) return { label: 'Consumer No.', value: randDigits(10) };
  if (/irm energy/.test(n)) return { label: 'Consumer No.', value: randDigits(10) };
  if (/indian oil.*piped|iocl.*piped/.test(n)) return { label: 'Consumer No.', value: randDigits(10) };
  if (/indian oil.?adani gas/.test(n)) return { label: 'Consumer No.', value: randDigits(10) };
  if (/agp cgd|agp city gas/.test(n)) return { label: 'Consumer No.', value: randDigits(10) };
  if (/megha gas/.test(n)) return { label: 'Consumer No.', value: randDigits(9) };
  if (/naveriya gas/.test(n)) return { label: 'Consumer No.', value: randDigits(9) };
  if (/purba bharati gas/.test(n)) return { label: 'Consumer No.', value: randDigits(10) };
  if (/rajasthan state gas/.test(n)) return { label: 'Consumer No.', value: randDigits(10) };
  if (/think gas/.test(n)) return { label: 'Consumer No.', value: randDigits(10) };
  if (/tripura natural gas/.test(n)) return { label: 'Consumer No.', value: `TNG${randDigits(7)}` };
  if (/unique central piped|ucpgpl/.test(n)) return { label: 'Consumer No.', value: randDigits(10) };
  if (/vadodara gas/.test(n)) return { label: 'Customer No.', value: randDigits(10) };
  if (/bharat gas|bpcl.*png|hp.*gas|indian oil.*gas|indane/.test(n)) return { label: 'LPG ID', value: `LPG${randDigits(8)}` };
  return { label: 'Consumer No.', value: `GAS${randDigits(9)}` };
};

const getCategoryIdentifier = (category: string, billerName: string) => {
  const c = category.toLowerCase();
  if (c === 'loan repayment') return { label: 'Loan A/C', value: `LN${randDigits(8)}` };
  if (c === 'education fees') return { label: /university|college|school|academy|institute/i.test(billerName) ? 'Student ID' : 'Enrollment ID', value: `STU${randDigits(7)}` };
  if (c === 'housing society' || c === 'housing society') return { label: 'Unit/Flat No.', value: `FLT-${randChoice(['A', 'B', 'C'])}${randDigits(3)}` };
  if (c === 'insurance') return { label: 'Policy No.', value: `POL${randDigits(9)}` };
  if (c === 'credit card') return { label: 'Card Ref', value: `XXXX-XXXX-XXXX-${randDigits(4)}` };
  if (c === 'fastag') return { label: 'Tag ID', value: `TAG${randDigits(9)}` };
  if (c === 'water') return { label: 'Connection No.', value: `WTR${randDigits(10)}` };
  if (c === 'gas' || c === 'lpg gas') return { label: 'Consumer No.', value: `GAS${randDigits(9)}` };
  if (c === 'dth' || c === 'cable tv') return { label: 'Subscriber ID', value: `SUB${randDigits(8)}` };
  if (c === 'mobile postpaid' || c === 'mobile prepaid') return { label: 'Mobile No.', value: `9${randDigits(9)}` };
  if (c === 'landline postpaid') return { label: 'Landline No.', value: `0${randDigits(10)}` };
  if (c === 'ncmc recharge') return { label: 'NCMC Card ID', value: `NCMC${randDigits(8)}` };
  if (c === 'ev recharge') return { label: 'Account No.', value: `EV${randDigits(10)}` };
  if (c === 'fleet card recharge') return { label: 'Fleet Card No.', value: `FC${randDigits(10)}` };
  if (c === 'municipal taxes' || c === 'municipal services') return { label: 'Property ID', value: `PROP${randDigits(8)}` };
  if (c === 'rental') return { label: 'Tenancy Ref', value: `TEN${randDigits(9)}` };
  if (c === 'echallan') return { label: 'Challan No.', value: `CHL${randDigits(10)}` };
  if (c === 'subscription') return { label: 'Subscription ID', value: `SUB${randDigits(9)}` };
  if (c === 'national pension system') return { label: 'PRAN', value: `PRAN${randDigits(8)}` };
  if (c === 'agent collection') return { label: 'Collection Ref', value: `COL${randDigits(9)}` };
  return { label: 'Account ID', value: randDigits(10) };
};

export const getIdentifierForBiller = (category: string, billerName: string, state: string) => {
  if (category === 'Electricity' || category === 'Prepaid Meter') {
    return getElectricityIdentifier(billerName, state);
  }
  if (category === 'Water') {
    return getWaterIdentifier(billerName, state);
  }
  if (category === 'Gas' || category === 'LPG Gas') {
    return getGasIdentifier(billerName, state);
  }
  return getCategoryIdentifier(category, billerName);
};
