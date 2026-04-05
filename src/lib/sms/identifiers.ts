import { randChoice, randDigits } from '../utils/random';

export type NameFormat = 'full_name' | 'full_name_with_abbrv';

export const getBrand = (name: string) => {
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

const expandBillerAbbreviations = (name: string) => {
  return name
    .replace(/\bPvt\.?\b/gi, 'Private')
    .replace(/\bLtd\.?\b/gi, 'Limited')
    .replace(/\bCo\.?\b/gi, 'Company')
    .replace(/\bSr\.?\b/gi, 'Senior')
    .replace(/\bInst\.?\b/gi, 'Institute')
    .replace(/\bIntl\.?\b/gi, 'International')
    .replace(/\s{2,}/g, ' ')
    .trim();
};

export const getDisplayBillerName = (billerNameFromJson: string, format: NameFormat) => {
  if (format === 'full_name_with_abbrv') {
    // As requested: this option uses the exact JSON biller name.
    return billerNameFromJson;
  }
  return expandBillerAbbreviations(billerNameFromJson);
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
