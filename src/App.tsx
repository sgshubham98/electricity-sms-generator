import React, { useState, useMemo, useEffect } from 'react';
import rawBillers from './biller.json';

const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randFloat = (min: number, max: number) => Math.round((Math.random() * (max - min) + min) * 100) / 100;
const randChoice = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randDigits = (n: number) => Array.from({length: n}, () => randInt(0, 9)).join('');

type NameFormat = 'full_name' | 'full_name_with_abbrv';

const getBrand = (name: string) => {
  const letters = name.toUpperCase().replace(/[^A-Z]/g, '');
  return letters.padEnd(6, 'X').substring(0, 6);
};

const getLsa = (state: string) => {
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

const getDisplayBillerName = (billerNameFromJson: string, format: NameFormat) => {
  if (format === 'full_name_with_abbrv') {
    // As requested: this option uses the exact JSON biller name.
    return billerNameFromJson;
  }
  return expandBillerAbbreviations(billerNameFromJson);
};

type SmsContext = {
  category: string;
  billerName: string;
  state: string;
  amount: number;
  dueDate: string;
  month: string;
  identifier: string;
  portal?: string;
};

const stateShort = (state: string) => (state || 'NA').replace(/[^A-Z]/gi, '').toUpperCase().slice(0, 2).padEnd(2, 'X');

const paymentPortalRules: Array<{ test: RegExp; url: string }> = [
  // Electricity - Major Boards
  { test: /bescom|bangalore electricity supply/i, url: 'https://www.bescom.co.in' },
  { test: /kseb|ksebl|kerala state electricity/i, url: 'https://wss.kseb.in/wss/wss?uiActionName=getViewPayBill' },
  { test: /tangedco|tneb|tamil nadu.*electric/i, url: 'https://www.tangedco.org' },
  { test: /msedcl|mahadiscom|maharashtra state electricity distbn/i, url: 'https://wss.mahadiscom.in/wss/wss?uiActionName=getViewPayBill' },
  { test: /uppcl|uttar pradesh power/i, url: 'https://www.uppclonline.com' },
  { test: /torrent power/i, url: 'https://www.torrentpower.com' },
  { test: /adani electricity/i, url: 'https://www.adanielectricity.com' },
  { test: /tata power/i, url: 'https://www.tatapower.com' },
  { test: /deb|delhi electricity|deldisco/i, url: 'https://www.delsumo.gov.in' },
  { test: /power supply/i, url: 'https://www.cyberhubportal.com' },
  { test: /pspcl|punjab state power/i, url: 'https://www.pspcl.in' },
  { test: /cesc\b|cesc limited/i, url: 'https://www.cesc.co.in' },
  { test: /wbsedcl|west bengal state electricity distbn/i, url: 'https://www.wbsedcl.in' },
  { test: /dgvcl|dakshin gujarat vij/i, url: 'https://www.dgvcl.com' },
  { test: /mgvcl|madhya gujarat vij/i, url: 'https://bil.mgvcl.com' },
  { test: /pgvcl|paschim gujarat vij/i, url: 'https://www.pgvcl.com' },
  { test: /ugvcl|uttar gujarat vij/i, url: 'https://www.ugvcl.com' },
  { test: /dhbvn|dakshin haryana bijli/i, url: 'https://dhbvn.org.in' },
  { test: /uhbvn|uttar haryana bijli/i, url: 'https://uhbvn.org.in' },
  { test: /jvvnl|jaipur vidyut/i, url: 'https://www.jaipurdiscom.com' },
  { test: /avvnl|ajmer vidyut/i, url: 'https://www.avvnl.com' },
  { test: /jdvvnl|jodhpur vidyut/i, url: 'https://www.jdvvnl.com' },
  { test: /jbvnl|jharkhand bijli/i, url: 'https://www.jbvnl.co.in' },
  { test: /southern power distribution.*telangana|tsspdcl/i, url: 'https://www.tssouthernpower.com' },
  { test: /northern power distribution.*telangana|tsnpdcl/i, url: 'https://www.tsnpdcl.in' },
  { test: /andhra pradesh central power|apcpdcl/i, url: 'https://www.apcpdcl.in' },
  { test: /apepdcl/i, url: 'https://www.apepdcl.in' },
  { test: /apspdcl/i, url: 'https://www.apspdcl.in' },
  { test: /hescom|hubli electricity/i, url: 'https://www.hescom.co.in' },
  { test: /gescom|gulbarga electricity/i, url: 'https://www.gescom.in' },
  { test: /cescom|chamundeshwari/i, url: 'https://www.cescom.co.in' },
  { test: /mescom|mangalore electricity/i, url: 'https://www.mescom.co.in' },
  { test: /nbpdcl|north bihar power/i, url: 'https://www.nbpdcl.co.in' },
  { test: /sbpdcl|south bihar power/i, url: 'https://www.sbpdcl.co.in' },
  { test: /mp madhya kshetra/i, url: 'https://www.mpcz.co.in' },
  { test: /mp poorv kshetra/i, url: 'https://www.mpez.co.in' },
  { test: /mp paschim kshetra/i, url: 'https://www.mppkvvcl.co.in' },
  { test: /bharatpur electricity services|besl\b/i, url: 'https://www.bescl.co.in' },

  // Telecom
  { test: /airtel/i, url: 'https://www.airtel.in' },
  { test: /jio/i, url: 'https://www.jio.com' },
  { test: /vi\b|vodafone|idea/i, url: 'https://www.myvi.in' },
  { test: /bsnl/i, url: 'https://portal.bsnl.in' },
  
  // Broadcasting & DTH
  { test: /dish tv/i, url: 'https://www.dishtv.in' },
  { test: /tata play|tata sky/i, url: 'https://www.tataplay.com' },
  { test: /sun direct/i, url: 'https://www.sundirect.in' },
  { test: /d2h|videocon d2h/i, url: 'https://www.d2h.com' },
  
  // Transportation & Mobility
  { test: /fastag|nha|toll|highway/i, url: 'https://fastag.ihmcl.com' },
  
  // Government Services
  { test: /ncmc|recharge/i, url: 'https://www.npci.org.in/what-we-do/ncmc/product-overview' },
  { test: /e.?challan|traffic|fine/i, url: 'https://echallan.parivahan.gov.in' },
  { test: /national pension|nps|pran/i, url: 'https://enps.nsdl.com' },
  
  // Finance & Insurance
  { test: /insurance|life insurance|policy/i, url: 'https://www.irdai.gov.in' },
  { test: /sbi|state bank|bank/i, url: 'https://www.onlinesbh.com' },
  { test: /hdfc|icici|axis|hdbank/i, url: 'https://www.bharatbillpay.com' },
  
  // Gas & LPG
  { test: /igl|indraprastha gas/i, url: 'https://www.iglonline.net' },
  { test: /mahanagar gas|mgl\b/i, url: 'https://www.mahanagargas.com' },
  { test: /gujarat gas/i, url: 'https://www.gujaratgas.com' },
  { test: /gail gas/i, url: 'https://www.gailgasltd.com' },
  { test: /adani total gas/i, url: 'https://www.adanitotalgas.in' },
  { test: /maharashtra natural gas|mngl\b/i, url: 'https://www.mahanatutalgas.com' },
  { test: /sabarmati gas/i, url: 'https://www.sabarmatigas.com' },
  { test: /torrent gas/i, url: 'https://www.torrentgas.com' },
  { test: /gas|lpg/i, url: 'https://www.mylpg.in' },

  // Water & Utilities
  { test: /bangalore water supply|bwssb/i, url: 'https://bwssb.gov.in' },
  { test: /delhi jal board/i, url: 'https://delhijalboard.nic.in' },
  { test: /cmwssb|chennai metro water/i, url: 'https://www.chennaimetrowater.tn.gov.in' },
  { test: /hmwssb|hyderabad metro water/i, url: 'https://hmwssb.gov.in' },
  { test: /kerala water authority|kwa\b/i, url: 'https://www.kwa.kerala.gov.in' },
  { test: /mcgm water/i, url: 'https://www.mcgm.gov.in' },
  { test: /pune municipal.*water/i, url: 'https://pmc.gov.in' },
  { test: /water|jal|water board|water supply/i, url: 'https://www.bharatbillpay.com' },
];

const getBillerSpecificPortal = (billerName: string, category: string): string | null => {
  const combined = `${billerName} ${category}`;
  const mapped = paymentPortalRules.find((r) => r.test.test(combined));
  return mapped ? mapped.url : null;
};

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
  if (/adani total gas/.test(n)) return { label: 'Customer ID', value: randDigits(10) };
  if (/maharashtra natural gas|mngl/.test(n)) return { label: 'Consumer No.', value: randDigits(10) };
  if (/sabarmati gas/.test(n)) return { label: 'Customer No.', value: randDigits(11) };
  if (/torrent gas/.test(n)) return { label: 'Customer No.', value: randDigits(10) };
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
  if (c === 'ev recharge') return { label: 'Charger Account', value: `EV${randDigits(10)}` };
  if (c === 'fleet card recharge') return { label: 'Fleet Card No.', value: `FC${randDigits(10)}` };
  if (c === 'municipal taxes' || c === 'municipal services') return { label: 'Property ID', value: `PROP${randDigits(8)}` };
  if (c === 'rental') return { label: 'Tenancy Ref', value: `TEN${randDigits(9)}` };
  if (c === 'echallan') return { label: 'Challan No.', value: `CHL${randDigits(10)}` };
  if (c === 'subscription') return { label: 'Subscription ID', value: `SUB${randDigits(9)}` };
  if (c === 'national pension system') return { label: 'PRAN', value: `PRAN${randDigits(8)}` };
  if (c === 'agent collection') return { label: 'Collection Ref', value: `COL${randDigits(9)}` };
  return { label: 'Account ID', value: randDigits(10) };
};

const getIdentifierForBiller = (category: string, billerName: string, state: string) => {
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

type BillerRule = {
  test: (name: string) => boolean;
  buildSms: (ctx: SmsContext & { idSpec: { label: string; value: string } }) => string;
};

const billerSpecificRules: BillerRule[] = [
  // Electricity - State Boards (Primary 5 — explicit per-board logic)
  {
    test: (n) => /bescom|bangalore electricity/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `Dear Valued Consumer, Your ${billerName} electricity bill for the billing period ${month} has been generated. Your RR No. is ${identifier} and the total payable amount is Rs. ${amount}/-. We kindly request you to clear the outstanding dues on or before ${dueDate} to ensure uninterrupted power supply to your premises. You may pay online at bescom.co.in, via BBPS, or at any Bangalore One / GRAMA ONE service centre. Thank You for being our esteemed customer. -BESCOM`,
  },
  {
    test: (n) => /kseb|ksebl|kerala state electricity/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `Dear KSEBL Consumer, your electricity bill for Consumer No. ${identifier} for the month of ${month} is Rs. ${amount}/-. Please pay on or before ${dueDate} at wss.kseb.in or nearest KSEB office, BBPS, or K-SMART kiosk to avoid disconnection. For assistance call Helpline 1912. Thank You. -${billerName}`,
  },
  {
    test: (n) => /tangedco|tneb|tamil nadu.*electric|tnpdcl/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `Dear Consumer, Your ${billerName} electricity bill for Service Connection No. ${identifier} for the period ${month} is Rs. ${amount}/-. Last date for payment: ${dueDate}. Pay online at www.tangedco.org or through BBPS / NeSL / Common Service Centre to avoid disconnection. Helpline: 04428520131. -TNEB`,
  },
  {
    test: (n) => /msedcl|mahadiscom|maharashtra state electricity distbn/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate }) => {
      const dParts = dueDate.split('-');
      const dDate = new Date(`${dParts[2]}-${dParts[1]}-${dParts[0]}T00:00:00`);
      const earlyDateObj = new Date(dDate.getTime() - 5 * 24 * 3600 * 1000);
      const earlyDateStr = `${earlyDateObj.getDate().toString().padStart(2, '0')}-${(earlyDateObj.getMonth() + 1).toString().padStart(2, '0')}-${earlyDateObj.getFullYear()}`;
      const earlyAmt = Math.round((amount - 10) * 100) / 100;
      return `Rs. ${amount}/- is the electricity bill for Consumer No. ${identifier}. If paid by ${earlyDateStr} avail early payment discount of Rs. ${earlyAmt}. Due Date: ${dueDate}. Pay online at wss.mahadiscom.in or scan UPI QR on your physical bill. -${billerName}`;
    },
  },
  {
    test: (n) => /uppcl|uttar pradesh power/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `Dear Consumer, electricity bill for Account No. ${identifier} for ${month} is Rs. ${amount}/-. Due Date: ${dueDate}. Pay online at uppclonline.com, BBPS, or nearest Jan Suvidha/Mitra centre. -${billerName}`,
  },

  // Karnataka boards — each uses RR No. with distinct board-specific portal
  {
    test: (n) => /hescom|hubli electricity/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `Dear Consumer, ${billerName} electricity bill for RR No. ${identifier} for ${month} is Rs. ${amount}/-. Kindly pay on or before ${dueDate} at hescom.co.in or BBPS / nearest HESCOM payment counter. Thank you. -HESCOM`,
  },
  {
    test: (n) => /cescom|chamundeshwari/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `Dear Consumer, ${billerName} electricity bill for RR No. ${identifier} for ${month} is Rs. ${amount}/-. Pay before ${dueDate} at cescom.co.in or nearest BBPS outlet. Disconnection will follow non-payment. -CESCOM`,
  },
  {
    test: (n) => /mescom|mangalore electricity/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `Dear Consumer, ${billerName} electricity bill for RR No. ${identifier} for ${month} is Rs. ${amount}/-. Due Date: ${dueDate}. Pay at mescom.co.in or via BBPS. Avoid service interruption by paying on time. -MESCOM`,
  },
  {
    test: (n) => /gescom|gulbarga electricity/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `Dear Consumer, ${billerName} electricity bill for RR No. ${identifier} for ${month} is Rs. ${amount}/-. Last date: ${dueDate}. Pay at gescom.in or BBPS to avoid disconnection. -GESCOM`,
  },

  // Gujarat boards — 11-digit consumer no, fetch-and-pay phrasing
  {
    test: (n) => /dgvcl|dakshin gujarat vij/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `Your ${billerName} electricity bill for Consumer No. ${identifier} for ${month} is Rs. ${amount}/-. Due Date: ${dueDate}. Pay at dgvcl.com or nearest PGVCL Common Service Centre / BBPS. -DGVCL`,
  },
  {
    test: (n) => /mgvcl|madhya gujarat vij/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `Your ${billerName} electricity bill for Consumer No. ${identifier} for ${month} is Rs. ${amount}/-. Due Date: ${dueDate}. Pay at bil.mgvcl.com or nearest CSC / BBPS. -MGVCL`,
  },
  {
    test: (n) => /pgvcl|paschim gujarat vij/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `Your ${billerName} electricity bill for Consumer No. ${identifier} for ${month} is Rs. ${amount}/-. Due Date: ${dueDate}. Pay at pgvcl.com or nearest Common Service Centre / BBPS. -PGVCL`,
  },
  {
    test: (n) => /ugvcl|uttar gujarat vij/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `Your ${billerName} electricity bill for Consumer No. ${identifier} for ${month} is Rs. ${amount}/-. Due Date: ${dueDate}. Pay at ugvcl.com or BBPS / nearest CSC. -UGVCL`,
  },

  // Punjab — 12-digit account no
  {
    test: (n) => /pspcl|punjab state power/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `Dear Consumer, Your ${billerName} electricity bill for A/C No. ${identifier} for ${month} is Rs. ${amount}/-. Last date of payment is ${dueDate}. Pay at pspcl.in or nearest PSPCL SDO office / BBPS to avoid disconnection. -PSPCL`,
  },

  // West Bengal — CESC 11-digit CA no
  {
    test: (n) => /cesc\b|cesc limited/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `${billerName} bill for CA No. ${identifier} for ${month} is Rs. ${amount}/-. Please pay by ${dueDate} at cesc.co.in, CESC app, or any designated Kolkata bank branch. -CESC`,
  },

  // Haryana — DHBVN / UHBVN, 12-digit account no
  {
    test: (n) => /dhbvn|dakshin haryana bijli/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `Dear Consumer, ${billerName} electricity bill for A/C No. ${identifier} for ${month} is Rs. ${amount}/-. Pay before ${dueDate} at dhbvn.org.in or BBPS to avoid load reduction / disconnection. -DHBVN`,
  },
  {
    test: (n) => /uhbvn|uttar haryana bijli/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `Dear Consumer, ${billerName} electricity bill for A/C No. ${identifier} for ${month} is Rs. ${amount}/-. Pay before ${dueDate} at uhbvn.org.in or BBPS to avoid disconnection. -UHBVN`,
  },

  // Rajasthan — K. No. (K + 12 digits)
  {
    test: (n) => /jvvnl|jaipur vidyut/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `Your ${billerName} electricity bill for K.No. ${identifier} for ${month} is Rs. ${amount}/-. Due Date: ${dueDate}. Pay at jaipurdiscom.com or energy.rajasthan.gov.in / BBPS. -JVVNL`,
  },
  {
    test: (n) => /avvnl|ajmer vidyut/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `Your ${billerName} electricity bill for K.No. ${identifier} for ${month} is Rs. ${amount}/-. Due Date: ${dueDate}. Pay at avvnl.com or energy.rajasthan.gov.in / BBPS. -AVVNL`,
  },
  {
    test: (n) => /jdvvnl|jodhpur vidyut/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `Your ${billerName} electricity bill for K.No. ${identifier} for ${month} is Rs. ${amount}/-. Due Date: ${dueDate}. Pay at jdvvnl.com or energy.rajasthan.gov.in / BBPS. -JDVVNL`,
  },

  // Jharkhand — 12-digit consumer no
  {
    test: (n) => /jbvnl|jharkhand bijli/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `Dear Consumer, ${billerName} electricity bill for Consumer No. ${identifier} for ${month} is Rs. ${amount}/-. Last payment date: ${dueDate}. Pay at jbvnl.co.in or BBPS / CSC. -JBVNL`,
  },

  // Telangana — 10-digit SC no
  {
    test: (n) => /southern power distribution.*telangana|tsspdcl/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `Dear Consumer, Your ${billerName} bill for SC No. ${identifier} for ${month} is Rs. ${amount}/-. Due Date: ${dueDate}. Pay at tssouthernpower.com or call 1912 / BBPS. -TSSPDCL`,
  },
  {
    test: (n) => /northern power distribution.*telangana|tsnpdcl/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `Dear Consumer, Your ${billerName} bill for SC No. ${identifier} for ${month} is Rs. ${amount}/-. Due Date: ${dueDate}. Pay at tsnpdcl.in or call 1912 / BBPS. -TSNPDCL`,
  },

  // Andhra Pradesh — 10-digit IVRS no
  {
    test: (n) => /andhra pradesh central power|apcpdcl/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `Dear Consumer, ${billerName} electricity bill for IVRS No. ${identifier} for ${month} is Rs. ${amount}/-. Due Date: ${dueDate}. Pay at apcpdcl.in or nearest MeeSeva / BBPS. -APCPDCL`,
  },

  // Bihar — 11-digit CA no
  {
    test: (n) => /north bihar power|nbpdcl/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `Your ${billerName} electricity bill for CA No. ${identifier} for ${month} is Rs. ${amount}/-. Due Date: ${dueDate}. Pay at nbpdcl.co.in or BBPS / CSC. -NBPDCL`,
  },
  {
    test: (n) => /south bihar power|sbpdcl/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `Your ${billerName} electricity bill for CA No. ${identifier} for ${month} is Rs. ${amount}/-. Due Date: ${dueDate}. Pay at sbpdcl.co.in or BBPS / CSC. -SBPDCL`,
  },

  // Madhya Pradesh — 11-digit consumer no
  {
    test: (n) => /mp madhya kshetra/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `Your ${billerName} electricity bill for Consumer No. ${identifier} for ${month} is Rs. ${amount}/-. Due Date: ${dueDate}. Pay at mpcz.co.in or BBPS / nearest collection centre. -MPCZ`,
  },
  {
    test: (n) => /mp poorv kshetra/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `Your ${billerName} electricity bill for Consumer No. ${identifier} for ${month} is Rs. ${amount}/-. Due Date: ${dueDate}. Pay at mpez.co.in or BBPS / nearest collection centre. -MPEZ`,
  },
  {
    test: (n) => /mp paschim kshetra/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `Your ${billerName} electricity bill for Consumer No. ${identifier} for ${month} is Rs. ${amount}/-. Due Date: ${dueDate}. Pay at mppkvvcl.co.in or BBPS. -MPPKVVCL`,
  },

  // Torrent Power — prompt pay concession phrasing
  {
    test: (n) => /torrent power/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month, portal }) =>
      `Rs. ${amount}/- is due for ${billerName} Consumer No. ${identifier} against ${month}. Due: ${dueDate}.${portal ? ` Pay at ${portal}` : ' Pay at torrentpower.com'} to avail prompt payment concession. -Torrent Power`,
  },
  {
    test: (n) => /adani electricity/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, portal }) =>
      `${billerName} bill for Acct No. ${identifier} is Rs. ${amount}/-. Due: ${dueDate}.${portal ? ` Pay via ${portal}` : ' Pay via adanielectricity.com'} to avoid disconnection. -Adani Electricity`,
  },
  {
    test: (n) => /tata power|tpddl/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month, portal }) =>
      `Your ${billerName} bill for CA No ${identifier} for ${month} is Rs. ${amount}/-. Pls pay by Due Dt ${dueDate}${portal ? ` via ${portal}` : ' via tatapower.com'} to avoid DP Surcharge. -Tata Power`,
  },
  {
    test: (n) => /bses/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `Rs. ${amount}/- is due against ${billerName} CA No. ${identifier} for ${month}. Due Date: ${dueDate}. Pay via bsesdelhi.com or BBPS. Late Payment Surcharge applicable post due date. -BSES`,
  },
  {
    test: (n) => /ndmc|new delhi municipal council.*electricity/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `${billerName} bill for Consumer No. ${identifier} for ${month} is Rs. ${amount}/-. Due Date: ${dueDate}. Pay online at ndmc.gov.in or via NDMC 311 App / BBPS. -NDMC`,
  },

  // Water boards — board-specific identifiers and portals
  {
    test: (n) => /bangalore water supply|bwssb/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `Dear Consumer, ${billerName} water & sewerage charges for Property No. ${identifier} for ${month} is Rs. ${amount}/-. Pay before ${dueDate} at bwssb.gov.in or nearest BBPS outlet. -BWSSB`,
  },
  {
    test: (n) => /delhi jal board/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `Dear Consumer, ${billerName} water bill for K No. ${identifier} for ${month} is Rs. ${amount}/-. Last date: ${dueDate}. Pay at delhijalboard.nic.in, Jal Sahulat app, or nearest BBPS centre. -DJB`,
  },
  {
    test: (n) => /cmwssb|chennai metro water/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `Dear Consumer, ${billerName} water charges for Consumer No. ${identifier} for ${month} is Rs. ${amount}/-. Pay before ${dueDate} at chennaimetrowater.tn.gov.in or BBPS. -CMWSSB`,
  },
  {
    test: (n) => /hmwssb|hyderabad metro water/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `Dear Consumer, ${billerName} water charges for Consumer No. ${identifier} for ${month} is Rs. ${amount}/-. Pay before ${dueDate} at hmwssb.gov.in or BBPS. -HMWSSB`,
  },
  {
    test: (n) => /kerala water authority|kwa\b/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `Dear Consumer, ${billerName} water bill for Consumer No. ${identifier} for ${month} is Rs. ${amount}/-. Due Date: ${dueDate}. Pay at kwa.kerala.gov.in or BBPS / K-SMART kiosks. -KWA`,
  },
  {
    test: (n) => /mcgm water/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `Dear Consumer, ${billerName} water charges for Consumer No. ${identifier} for ${month} is Rs. ${amount}/-. Pay before ${dueDate} at mcgm.gov.in or portal.mcgm.gov.in / BBPS. -MCGM`,
  },
  {
    test: (n) => /water|water supply|water board|jal/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, portal, idSpec }) =>
      portal
        ? `${billerName}: ${idSpec.label} ${identifier} water charges: Rs. ${amount}/-. Due date ${dueDate}. Pay at ${portal}`
        : `${billerName}: ${idSpec.label} ${identifier} water charges: Rs. ${amount}/-. Due date ${dueDate}.`,
  },

  // Gas boards — board-specific identifiers and portals
  {
    test: (n) => /indraprastha gas|igl\b/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `Dear IGL Customer, gas bill for BP No. ${identifier} for ${month} is Rs. ${amount}/-. Pay by ${dueDate} at iglonline.net or IGL mobile app / BBPS. Auto-deduction scheduled if registered. -IGL`,
  },
  {
    test: (n) => /mahanagar gas|mgl\b/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `Your ${billerName} gas bill for CA No. ${identifier} for ${month} is Rs. ${amount}/-. Due Date: ${dueDate}. Pay at mahanagargas.com or BBPS / MGL app. -MGL`,
  },
  {
    test: (n) => /gujarat gas/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `Your ${billerName} gas bill for Customer No. ${identifier} for ${month} is Rs. ${amount}/-. Due: ${dueDate}. Pay at gujaratgas.com or BBPS. -Gujarat Gas`,
  },
  {
    test: (n) => /gail gas/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `Dear GAIL Gas Customer, gas bill for Consumer No. ${identifier} for ${month} is Rs. ${amount}/-. Due Date: ${dueDate}. Pay at gailgasltd.com or BBPS. -GAIL Gas`,
  },
  {
    test: (n) => /adani total gas/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `Your ${billerName} gas bill for Customer ID ${identifier} for ${month} is Rs. ${amount}/-. Due: ${dueDate}. Pay at adanitotalgas.in or BBPS / ATG app. -Adani Total Gas`,
  },
  {
    test: (n) => /gas|lpg|fuel/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, portal, idSpec }) =>
      portal
        ? `${billerName}: Invoice for ${idSpec.label} ${identifier} is ready. Amount Rs. ${amount}/-, due by ${dueDate}. Pay using ${portal}`
        : `${billerName}: Invoice for ${idSpec.label} ${identifier} is ready. Amount Rs. ${amount}/-, due by ${dueDate}.`,
  },

  // Telecom
  {
    test: (n) => /airtel/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, portal, idSpec }) =>
      portal
        ? `${billerName} Billing: ${idSpec.label} ${identifier} has a due amount of Rs. ${amount}. Please pay by ${dueDate} at ${portal}`
        : `${billerName} Billing: ${idSpec.label} ${identifier} has a due amount of Rs. ${amount}. Please pay by ${dueDate}.`,
  },
  {
    test: (n) => /jio/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, portal, idSpec }) =>
      portal
        ? `${billerName}: Your bill for ${idSpec.label} ${identifier} is Rs. ${amount}. Pay before ${dueDate} at ${portal}`
        : `${billerName}: Your bill for ${idSpec.label} ${identifier} is Rs. ${amount}. Pay before ${dueDate}.`,
  },
  {
    test: (n) => /vi\b|vodafone|idea/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, portal, idSpec }) =>
      portal
        ? `${billerName}: Bill payment reminder. ${idSpec.label} ${identifier} amount due Rs. ${amount} by ${dueDate}. Portal: ${portal}`
        : `${billerName}: Bill payment reminder. ${idSpec.label} ${identifier} amount due Rs. ${amount} by ${dueDate}.`,
  },
  {
    test: (n) => /bsnl/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, portal, idSpec }) =>
      portal
        ? `${billerName}: Account ${idSpec.label} ${identifier}, amount payable Rs. ${amount}, due on ${dueDate}. Pay at ${portal}`
        : `${billerName}: Account ${idSpec.label} ${identifier}, amount payable Rs. ${amount}, due on ${dueDate}.`,
  },

  // Broadcasting & Streaming
  {
    test: (n) => /dish tv/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, portal, idSpec }) =>
      portal
        ? `${billerName}: Your subscription (${idSpec.label} ${identifier}) renewal amount Rs. ${amount}. Due date ${dueDate}. Recharge at ${portal}`
        : `${billerName}: Your subscription (${idSpec.label} ${identifier}) renewal amount Rs. ${amount}. Due date ${dueDate}.`,
  },
  {
    test: (n) => /tata play|tata sky/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, portal, idSpec }) =>
      portal
        ? `${billerName}: Recharge reminder for ${idSpec.label} ${identifier}. Amount Rs. ${amount}, valid till ${dueDate}. Renew at ${portal}`
        : `${billerName}: Recharge reminder for ${idSpec.label} ${identifier}. Amount Rs. ${amount}, valid till ${dueDate}.`,
  },
  {
    test: (n) => /sun direct/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, portal, idSpec }) =>
      portal
        ? `${billerName}: Subscription ${idSpec.label} ${identifier} renewal Rs. ${amount} due by ${dueDate}. Portal: ${portal}`
        : `${billerName}: Subscription ${idSpec.label} ${identifier} renewal Rs. ${amount} due by ${dueDate}.`,
  },
  {
    test: (n) => /d2h|videocon d2h/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, portal, idSpec }) =>
      portal
        ? `${billerName}: Your account ${idSpec.label} ${identifier} needs recharge of Rs. ${amount}. Pay by ${dueDate} at ${portal}`
        : `${billerName}: Your account ${idSpec.label} ${identifier} needs recharge of Rs. ${amount}. Pay by ${dueDate}.`,
  },

  // Financial Services
  {
    test: (n) => /insurance|life insurance/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, portal, idSpec }) =>
      portal
        ? `${billerName}: Premium due for ${idSpec.label} ${identifier}. Amount Rs. ${amount}. Payment deadline ${dueDate}. Visit ${portal}`
        : `${billerName}: Premium due for ${idSpec.label} ${identifier}. Amount Rs. ${amount}. Payment deadline ${dueDate}.`,
  },
  {
    test: (n) => /loan|finance|bank/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, portal, idSpec }) =>
      portal
        ? `${billerName}: EMI/Loan payment reminder for ${idSpec.label} ${identifier}. Amount Rs. ${amount} due on ${dueDate}. Pay at ${portal}`
        : `${billerName}: EMI/Loan payment reminder for ${idSpec.label} ${identifier}. Amount Rs. ${amount} due on ${dueDate}.`,
  },
  {
    test: (n) => /credit card/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, portal, idSpec }) =>
      portal
        ? `${billerName}: Credit Card ${idSpec.label} ${identifier} statement generated. Amount due Rs. ${amount}. Pay by ${dueDate} at ${portal}`
        : `${billerName}: Credit Card ${idSpec.label} ${identifier} statement generated. Amount due Rs. ${amount}. Pay by ${dueDate}.`,
  },

  // Transportation & Mobility
  {
    test: (n) => /fastag|nha|highway|toll/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, portal, idSpec }) =>
      portal
        ? `${billerName}: FASTag wallet ${idSpec.label} ${identifier} needs immediate recharge of Rs. ${amount}. Complete by ${dueDate} at ${portal}`
        : `${billerName}: FASTag wallet ${idSpec.label} ${identifier} needs immediate recharge of Rs. ${amount}. Complete by ${dueDate}.`,
  },

  // Government Services
  {
    test: (n) => /municipal|nagar|palika|corporation|tax|property/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, portal, idSpec }) =>
      portal
        ? `${billerName}: Tax/Service demand notice for ${idSpec.label} ${identifier}. Amount Rs. ${amount} due by ${dueDate}. Pay using ${portal}`
        : `${billerName}: Tax/Service demand notice for ${idSpec.label} ${identifier}. Amount Rs. ${amount} due by ${dueDate}.`,
  },
  {
    test: (n) => /e.?challan|traffic|fine|penalty/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, portal, idSpec }) =>
      portal
        ? `${billerName}: Challan/Ticket reference ${idSpec.label} ${identifier}. Amount Rs. ${amount}. Settle by ${dueDate} at ${portal}`
        : `${billerName}: Challan/Ticket reference ${idSpec.label} ${identifier}. Amount Rs. ${amount}. Settle by ${dueDate}.`,
  },
  {
    test: (n) => /pension|nps|pran|national pension/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, portal, idSpec }) =>
      portal
        ? `${billerName}: Contribution due for ${idSpec.label} ${identifier}. Amount Rs. ${amount}, pay by ${dueDate} at ${portal}`
        : `${billerName}: Contribution due for ${idSpec.label} ${identifier}. Amount Rs. ${amount}, pay by ${dueDate}.`,
  },

  // Education
  {
    test: (n) => /school|college|academy|university|institute|education/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, portal, idSpec }) =>
      portal
        ? `${billerName}: Fee invoice for ${idSpec.label} ${identifier}. Amount Rs. ${amount}. Payment due ${dueDate}. Portal: ${portal}`
        : `${billerName}: Fee invoice for ${idSpec.label} ${identifier}. Amount Rs. ${amount}. Payment due ${dueDate}.`,
  },

  // Housing & Property
  {
    test: (n) => /housing|society|apartment|resident|association|maintenance/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, portal, idSpec }) =>
      portal
        ? `${billerName}: Maintenance charges for ${idSpec.label} ${identifier} are Rs. ${amount}. Due date ${dueDate}. Pay at ${portal}`
        : `${billerName}: Maintenance charges for ${idSpec.label} ${identifier} are Rs. ${amount}. Due date ${dueDate}.`,
  },

  // Subscription & Membership
  {
    test: (n) => /subscription|subscription|membership|club|gym|wellness/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, portal, idSpec }) =>
      portal
        ? `${billerName}: Membership/Subscription renewal for ${idSpec.label} ${identifier}. Amount Rs. ${amount}, renew by ${dueDate} at ${portal}`
        : `${billerName}: Membership/Subscription renewal for ${idSpec.label} ${identifier}. Amount Rs. ${amount}, renew by ${dueDate}.`,
  },

  // Miscellaneous/Unknown Biller - Intelligent inference
  {
    test: () => true,
    buildSms: ({ billerName, identifier, amount, dueDate, portal, idSpec, category, month }) => {
      const catLower = category.toLowerCase();
      if (/rental|rent/.test(catLower)) {
        return portal
          ? `${billerName}: Rent payment due for ${idSpec.label} ${identifier}. Amount Rs. ${amount} payable by ${dueDate}. Portal: ${portal}`
          : `${billerName}: Rent payment due for ${idSpec.label} ${identifier}. Amount Rs. ${amount} payable by ${dueDate}.`;
      }
      if (/donation|charity|contribution/.test(catLower)) {
        return portal
          ? `${billerName}: Donation pledge reference ${idSpec.label} ${identifier}. Amount Rs. ${amount}. Complete by ${dueDate} at ${portal}`
          : `${billerName}: Donation pledge reference ${idSpec.label} ${identifier}. Amount Rs. ${amount}. Complete by ${dueDate}.`;
      }
      if (/ev|electric|charging/i.test(catLower)) {
        return portal
          ? `${billerName}: EV charging account ${idSpec.label} ${identifier} requires balance of Rs. ${amount}. Top-up by ${dueDate} at ${portal}`
          : `${billerName}: EV charging account ${idSpec.label} ${identifier} requires balance of Rs. ${amount}. Top-up by ${dueDate}.`;
      }
      if (/fleet|vehicle/i.test(catLower)) {
        return portal
          ? `${billerName}: Fleet card ${idSpec.label} ${identifier} needs recharge of Rs. ${amount} by ${dueDate}. Portal: ${portal}`
          : `${billerName}: Fleet card ${idSpec.label} ${identifier} needs recharge of Rs. ${amount} by ${dueDate}.`;
      }
      if (/ncmc|recharge/i.test(catLower)) {
        return portal
          ? `${billerName}: NCMC card ${idSpec.label} ${identifier} recharge amount Rs. ${amount}. Top-up by ${dueDate} at ${portal}`
          : `${billerName}: NCMC card ${idSpec.label} ${identifier} recharge amount Rs. ${amount}. Top-up by ${dueDate}.`;
      }
      // Ultimate fallback with graceful portal handling
      return portal
        ? `${billerName}: Payment reminder for ${idSpec.label} ${identifier}. Amount Rs. ${amount} due on ${dueDate}. Visit ${portal}`
        : `${billerName}: Payment reminder for ${idSpec.label} ${identifier}. Amount Rs. ${amount} due on ${dueDate}.`;
    },
  },
];

const buildBillerSpecificSms = ({ category, billerName, state, amount, dueDate, month, identifier }: SmsContext) => {
  const portalOrNull = getBillerSpecificPortal(billerName, category);
  const portal = portalOrNull || undefined;
  const idSpec = getIdentifierForBiller(category, billerName, state);

  const rule = billerSpecificRules.find((r) => r.test(billerName));
  if (rule) {
    return rule.buildSms({ category, billerName, state, amount, dueDate, month, identifier, portal, idSpec });
  }

  // Unreachable fallback (handles optional portal)
  return portal
    ? `${billerName}: Payment alert for ${idSpec.label} ${identifier}. Amount Rs. ${amount}, due ${dueDate}. Portal: ${portal}`
    : `${billerName}: Payment alert for ${idSpec.label} ${identifier}. Amount Rs. ${amount}, due ${dueDate}.`;
};

const getAmtLimits = (category: string) => {
  switch(category) {
    case 'Loan Repayment': return {min: 1000, max: 20000};
    case 'Credit Card': return {min: 2000, max: 80000};
    case 'Education Fees': return {min: 1500, max: 50000};
    case 'Housing Society': return {min: 500, max: 15000};
    case 'Insurance': return {min: 1000, max: 15000};
    case 'Fastag': return {min: 100, max: 2000};
    case 'DTH': return {min: 200, max: 1500};
    case 'Gas': return {min: 300, max: 2500};
    default: return {min: 300, max: 5000};
  }
};

export default function App() {
  const uniqueCategories = useMemo(() => {
    const cats = new Set<string>();
    rawBillers.forEach((b: any) => cats.add(b.Billers));
    return Array.from(cats).sort();
  }, []);

  const [tab, setTab] = useState(uniqueCategories.includes('Electricity') ? 'Electricity' : uniqueCategories[0] || 'generator');
  const [filterType, setFilterType] = useState('state');
  const [activeState, setActiveState] = useState<string | null>(null);
  const [activeBoards, setActiveBoards] = useState<string[]>([]);
  const [nameFormat, setNameFormat] = useState<NameFormat>('full_name_with_abbrv');
  const [count, setCount] = useState(1);
  const [view, setView] = useState('card');
  const [data, setData] = useState<any[]>([]);
  const [showInfo, setShowInfo] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');

  const activeDataList = useMemo(() => {
    return rawBillers.filter((b: any) => b.Billers === tab);
  }, [tab]);

  useEffect(() => {
    setActiveState(null);
    setActiveBoards([]);
    setData([]);
    setSearchTerm('');
    setShowCategoryDropdown(false);
  }, [tab]);

  useEffect(() => {
    const handleClickOutside = () => setShowCategoryDropdown(false);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const states = useMemo(() => {
    const sMap = new Map<string, number>();
    activeDataList.forEach((d: any) => {
      sMap.set(d.State || 'Unknown', (sMap.get(d.State || 'Unknown') || 0) + 1);
    });
    return Array.from(sMap.entries()).map(([state, num]) => ({state, num})).sort((a,b)=>a.state.localeCompare(b.state));
  }, [activeDataList]);

  const filteredBoards = activeDataList.filter((d: any) => (d["Biller Name"]||'').toLowerCase().includes(searchTerm.toLowerCase()));

  const toggleBoard = (name: string) => {
    setActiveBoards(prev => prev.includes(name) ? prev.filter(x => x !== name) : [...prev, name]);
  };

  const handleGenerateData = (all: boolean) => {
    let valid = activeDataList;
    if (filterType === 'state' && activeState) {
      valid = valid.filter((d: any) => (d.State || 'Unknown') === activeState);
    } else if (filterType === 'board' && activeBoards.length > 0) {
      valid = valid.filter((d: any) => activeBoards.includes(d["Biller Name"]));
    }
    
    if (valid.length === 0) return;

    const result = [];
    const TSPs = ['A', 'J', 'V', 'B', 'T'];
    const currentDate = new Date();
    
    const qty = all ? valid.length : Math.max(1, Math.min(200, count));

    for (let i = 0; i < qty; i++) {
        const discom = all ? valid[i] : randChoice(valid);
        const tsp = randChoice(TSPs);
        const lsa = getLsa(discom.State);
        const billerName = discom["Biller Name"] || 'Unknown';
        const brand = getBrand(billerName);
        const isGovt = billerName.toLowerCase().includes('municipal') || (discom.State || '').toLowerCase() === 'pan india govt';
        const suffix = isGovt ? 'G' : 'S';
        
        const daysPast = randInt(0, 35);
        const billDateObj = new Date(currentDate.getTime() - daysPast * 24 * 3600 * 1000);
        const dueDays = randInt(15, 21);
        const rawDue = new Date(billDateObj.getTime() + dueDays * 24 * 3600 * 1000);
        const minDue = new Date(currentDate.getTime() + 3 * 24 * 3600 * 1000);
        const dueDateObj = rawDue > minDue ? rawDue : minDue;
        
        const mths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthStr = `${mths[billDateObj.getMonth()]}-${billDateObj.getFullYear()}`;
        const fmt = (d: Date) => `${d.getDate().toString().padStart(2, '0')}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getFullYear()}`;
        
        const billDateStr = fmt(billDateObj);
        const dueDateStr = fmt(dueDateObj);
        const limits = getAmtLimits(tab);
        const numAmt = randFloat(limits.min, limits.max);
        
        const outName = getDisplayBillerName(billerName, nameFormat);
        const idSpec = getIdentifierForBiller(tab, billerName, discom.State || 'Unknown');
        const cno = idSpec.value;
        const sms = buildBillerSpecificSms({
          category: tab,
          billerName: outName,
          state: discom.State || 'Unknown',
          amount: numAmt,
          dueDate: dueDateStr,
          month: monthStr,
          identifier: cno,
        });
        
        result.push({
          id: i + 1,
          senderId: `${tsp}${lsa}-${brand}-${suffix}`,
          board: billerName,
          state: discom.State || 'Unknown',
          category: tab,
          consumerNo: cno,
          amount: numAmt,
          billDate: billDateStr,
          dueDate: dueDateStr,
          sms
        });
    }
    setData(result);
  };

  const exportCSV = () => {
    if(!data.length) return;
    const header = ['id','senderId','board','state','category','consumerNo','amount','billDate','dueDate','sms'];
    const rows = data.map(r => header.map(h => `"${(r[h]||'').toString().replace(/"/g, '""')}"`).join(','));
    const csv = [header.join(','), ...rows].join('\n');
    download(csv, 'biller_sms_data.csv', 'text/csv');
  };
  const exportJSON = () => {
    if(!data.length) return;
    download(JSON.stringify(data, null, 2), 'biller_sms_data.json', 'application/json');
  };
  const copySMS = () => {
    if(!data.length) return;
    navigator.clipboard.writeText(data.map(d => d.sms).join('\n\n'));
    alert('Copied SMS texts to clipboard!');
  };
  const download = (content: string, name: string, type: string) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([content], {type}));
    a.download = name;
    a.click();
  };

  return (
    <div style={{minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a, #1e293b)', color: '#f8fafc', fontFamily: 'Inter, system-ui, sans-serif', padding: '24px'}}>
      <style>{`
        .hide-scroll::-webkit-scrollbar { display: none; }
        .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      
      {/* Header */}
      <div style={{background: 'linear-gradient(90deg, #ec4899, #8b5cf6, #3b82f6)', padding: '2px', borderRadius: '12px', marginBottom: '24px'}}>
        <div style={{background: '#1e293b', padding: '20px', borderRadius: '10px', display:'flex', flexWrap:'wrap', gap:'10px', justifyContent:'space-between', alignItems:'center'}}>
          <h1 style={{margin:0, fontSize: '24px', fontWeight: 'bold', background: '-webkit-linear-gradient(0deg, #ec4899, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
            India Omni-Biller SMS Generator
          </h1>
          <div style={{display:'flex', gap:'8px'}}>
            <div style={{fontSize: '14px', color: '#cbd5e1', background: '#334155', padding: '6px 12px', borderRadius: '20px'}}>
              {uniqueCategories.length} Categories
            </div>
            <div style={{fontSize: '14px', color: '#cbd5e1', background: '#334155', padding: '6px 12px', borderRadius: '20px'}}>
              {rawBillers.length} Billers
            </div>
          </div>
        </div>
      </div>

      <div style={{display:'flex', gap: '8px', marginBottom: '20px', alignItems: 'center', position: 'relative'}} onClick={(e)=>e.stopPropagation()}>
        <div style={{position: 'relative', minWidth: '250px'}}>
          <div onClick={()=>setShowCategoryDropdown(!showCategoryDropdown)} style={{background: tab==='download' ? '#ec4899' : '#3b82f6', color: '#fff', border:'1px solid #60a5fa', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight:'bold', display:'flex', justifyContent:'space-between', alignItems:'center', userSelect:'none'}}>
            <span>{tab}</span>
            <span style={{marginLeft: '8px', fontSize: '12px'}}>▾</span>
          </div>
          {showCategoryDropdown && (
            <div style={{position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, background: '#1e293b', border: '1px solid #475569', borderRadius: '8px', zIndex: 1000, boxShadow: '0 10px 15px rgba(0,0,0,0.3)'}}>
              <input
                type="text"
                placeholder="Search categories..."
                value={categorySearch}
                onChange={(e)=>setCategorySearch(e.target.value)}
                onClick={(e)=>e.stopPropagation()}
                style={{width: '100%', background: '#0f172a', border: 'none', borderBottom: '1px solid #475569', color: '#f8fafc', padding: '10px 12px', borderRadius: '7px 7px 0 0', outline: 'none', boxSizing: 'border-box', fontSize: '14px'}}
              />
              <div style={{maxHeight: '300px', overflowY: 'auto'}}>
                {uniqueCategories.filter(cat => cat.toLowerCase().includes(categorySearch.toLowerCase())).map((cat, idx) => (
                  <div key={cat} onClick={(e)=>{e.stopPropagation(); setTab(cat); setShowCategoryDropdown(false); setCategorySearch('');}} style={{background: tab===cat ? '#3b82f6' : (idx % 2 === 0 ? '#0f172a' : '#1e293b'), color: '#f8fafc', padding: '10px 12px', cursor: 'pointer', borderBottom: '1px solid #334155', transition:'all 0.1s', fontSize:'14px'}} onMouseEnter={(e)=>e.currentTarget.style.background='#334155'} onMouseLeave={(e)=>e.currentTarget.style.background=(tab===cat ? '#3b82f6' : (idx % 2 === 0 ? '#0f172a' : '#1e293b'))}>
                    {cat}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <button onClick={(e)=>{e.stopPropagation(); setTab('download'); setShowCategoryDropdown(false);}} style={{background: tab==='download' ? '#10b981' : '#334155', color: '#fff', border:'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight:'bold', whiteSpace:'nowrap'}}>Download Code</button>
      </div>

      {tab !== 'download' && (
        <div style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
          <div style={{background: '#1e293b', border: '1px solid #334155', padding: '20px', borderRadius: '12px'}}>
            <h2 style={{color: '#fff', marginTop:0, marginBottom:'20px', fontSize:'20px'}}>Configure {tab} Set</h2>
            <div style={{display:'flex', gap: '20px', marginBottom: '16px', alignItems: 'center'}}>
              <div style={{display:'flex', gap:'8px', background:'#0f172a', padding:'4px', borderRadius:'8px'}}>
                <button onClick={()=>setFilterType('state')} style={{background: filterType==='state' ? '#475569':'transparent', color: '#f8fafc', border:'none', padding: '8px 16px', borderRadius: '4px', cursor:'pointer'}}>Filter by State/UT</button>
                <button onClick={()=>setFilterType('board')} style={{background: filterType==='board' ? '#475569':'transparent', color: '#f8fafc', border:'none', padding: '8px 16px', borderRadius: '4px', cursor:'pointer'}}>Filter by Biller</button>
              </div>
              <button onClick={()=>setShowInfo(!showInfo)} style={{marginLeft:'auto', background:'transparent', border:'1px solid #8b5cf6', color:'#8b5cf6', padding:'6px 12px', borderRadius:'6px', cursor:'pointer'}}>TRAI Info</button>
            </div>

            {showInfo && (
              <div style={{background: '#312e81', color: '#e0e7ff', padding: '16px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', lineHeight:'1.5'}}>
                <strong>TRAI DLT Sender ID Rules:</strong> XY-ZZZZZZ-G/S<br/>
                X: TSP Code | Y: LSA Code<br/>
                ZZZZZZ: 6-char registered brand code<br/>
                Suffix: -G (Govt), -S (Private)
              </div>
            )}

            {filterType === 'state' ? (
              <div>
                <div style={{display:'flex', gap:'8px', marginBottom:'12px'}}>
                  <button onClick={()=>setActiveState(null)} style={{background:'#334155', border:'none', color:'#fff', padding:'6px 12px', borderRadius:'4px', cursor:'pointer', fontSize:'13px'}}>All States ({activeDataList.length} Billers)</button>
                </div>
                <div style={{display:'flex', flexWrap:'wrap', gap:'8px'}}>
                  {states.map((s: any) => (
                    <div key={s.state} onClick={()=>setActiveState(activeState === s.state ? null : s.state)} style={{background: activeState === s.state ? '#3b82f6' : '#1e293b', border: `1px solid ${activeState === s.state ? '#60a5fa' : '#475569'}`, padding: '8px 16px', borderRadius: '20px', cursor:'pointer', fontSize: '14px', display:'flex', alignItems:'center', gap:'8px', transition:'all 0.2s'}}>
                      {s.state} <span style={{background:'#0f172a', color:'#cbd5e1', padding:'2px 8px', borderRadius:'10px', fontSize:'12px'}}>{s.num}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <div style={{display:'flex', gap:'12px', marginBottom:'12px', alignItems:'center'}}>
                  <input type="text" placeholder={`Search among ${activeDataList.length} billers...`} value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} style={{background: '#0f172a', border: '1px solid #475569', color: '#f8fafc', padding: '8px 12px', borderRadius: '6px', outline: 'none', minWidth: '250px'}} />
                  <button onClick={()=>setActiveBoards([])} style={{background:'#334155', border:'none', color:'#fff', padding:'6px 12px', borderRadius:'4px', cursor:'pointer', fontSize:'13px'}}>Clear Selection</button>
                </div>
                <div style={{display:'flex', flexWrap:'wrap', gap:'8px', maxHeight:'200px', overflowY:'auto'}}>
                  {filteredBoards.slice(0, 100).map((d: any) => {
                    const nameStr = d["Biller Name"] || 'Unknown';
                    const active = activeBoards.includes(nameStr);
                    const color = '#3b82f6';
                    return (
                      <div key={nameStr} onClick={()=>toggleBoard(nameStr)} style={{background: active ? color : '#1e293b', border: `1px solid ${color}`, color: '#fff', padding: '6px 12px', borderRadius: '6px', cursor:'pointer', fontSize: '13px', transition:'all 0.2s'}}>
                        {nameStr}
                      </div>
                    )
                  })}
                  {filteredBoards.length > 100 && <div style={{padding:'6px 12px', color:'#94a3b8', fontSize:'13px'}}>+ {filteredBoards.length - 100} more</div>}
                </div>
              </div>
            )}
            
            <div style={{marginTop: '24px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                <span>Generate</span>
                <input type="number" min="1" max="1000" value={count} onChange={(e)=>setCount(Number(e.target.value))} style={{width:'80px', background:'#0f172a', border:'1px solid #475569', color:'#fff', padding:'8px', borderRadius:'6px', textAlign:'center'}} />
                <span>records</span>
              </div>
              
              <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginRight: '16px', flexWrap: 'wrap'}}>
                <span style={{fontSize: '14px', color: '#cbd5e1'}}>Biller Name Format:</span>
                <label style={{display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '14px', color: '#cbd5e1'}}>
                  <input
                    type="radio"
                    name="nameFormat"
                    checked={nameFormat === 'full_name'}
                    onChange={() => setNameFormat('full_name')}
                    style={{cursor: 'pointer', accentColor: '#ec4899'}}
                  />
                  Full Name
                </label>
                <label style={{display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '14px', color: '#cbd5e1'}}>
                  <input
                    type="radio"
                    name="nameFormat"
                    checked={nameFormat === 'full_name_with_abbrv'}
                    onChange={() => setNameFormat('full_name_with_abbrv')}
                    style={{cursor: 'pointer', accentColor: '#ec4899'}}
                  />
                  Full Name with Abbrv (from JSON)
                </label>
              </div>
              
              <button onClick={()=>handleGenerateData(false)} style={{background: 'linear-gradient(90deg, #ec4899, #8b5cf6)', border:'none', color:'#fff', padding:'10px 24px', borderRadius:'8px', fontWeight:'bold', cursor:'pointer', minWidth: '150px'}}>Generate Random</button>
              <button onClick={()=>handleGenerateData(true)} style={{background: 'linear-gradient(90deg, #10b981, #3b82f6)', border:'none', color:'#fff', padding:'10px 24px', borderRadius:'8px', fontWeight:'bold', cursor:'pointer', minWidth: '150px'}}>Generate All Selected</button>
            </div>
          </div>

          {data.length > 0 && (
            <div style={{background: '#1e293b', border: '1px solid #334155', padding: '20px', borderRadius: '12px'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap:'wrap', gap:'10px'}}>
                <div style={{display: 'flex', gap: '8px', background: '#0f172a', padding: '4px', borderRadius: '8px'}}>
                  <button onClick={()=>setView('table')} style={{background: view==='table'?'#475569':'transparent', color:'#f8fafc', border:'none', padding:'6px 16px', borderRadius:'4px', cursor:'pointer'}}>Table View</button>
                  <button onClick={()=>setView('card')} style={{background: view==='card'?'#475569':'transparent', color:'#f8fafc', border:'none', padding:'6px 16px', borderRadius:'4px', cursor:'pointer'}}>SMS View</button>
                </div>
                <div style={{display: 'flex', gap: '8px', flexWrap:'wrap'}}>
                  <span style={{color: '#94a3b8', alignSelf:'center', marginRight:'10px'}}>{data.length} records generated</span>
                  <button onClick={exportCSV} style={{background:'#10b981', color:'#fff', border:'none', padding:'8px 16px', borderRadius:'6px', cursor:'pointer'}}>Export CSV</button>
                  <button onClick={exportJSON} style={{background:'#f59e0b', color:'#fff', border:'none', padding:'8px 16px', borderRadius:'6px', cursor:'pointer'}}>Export JSON</button>
                  <button onClick={copySMS} style={{background:'#6b7280', color:'#fff', border:'none', padding:'8px 16px', borderRadius:'6px', cursor:'pointer'}}>Copy SMS</button>
                </div>
              </div>

              {view === 'table' ? (
                <div style={{overflowX: 'auto'}}>
                  <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '14px', minWidth: '1200px'}}>
                    <thead>
                      <tr style={{textAlign: 'left', background: '#0f172a', color: '#94a3b8'}}>
                        <th style={{padding: '12px 16px'}}>#</th>
                        <th style={{padding: '12px 16px'}}>Sender ID</th>
                        <th style={{padding: '12px 16px'}}>Biller Name</th>
                        <th style={{padding: '12px 16px'}}>State</th>
                        <th style={{padding: '12px 16px'}}>Account / ID No</th>
                        <th style={{padding: '12px 16px'}}>Amount</th>
                        <th style={{padding: '12px 16px'}}>Bill Date</th>
                        <th style={{padding: '12px 16px'}}>Due Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.map(r => (
                        <tr key={r.id} style={{borderBottom: '1px solid #334155'}}>
                          <td style={{padding: '12px 16px', color:'#cbd5e1'}}>{r.id}</td>
                          <td style={{padding: '12px 16px', fontFamily: 'monospace', color:'#38bdf8', fontWeight:'bold'}}>{r.senderId}</td>
                          <td style={{padding: '12px 16px'}}>
                            <span style={{background: 'rgba(59,130,246,0.2)', color: '#93c5fd', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', border: `1px solid #3b82f6`}}>
                              {r.board}
                            </span>
                          </td>
                          <td style={{padding: '12px 16px', color:'#cbd5e1'}}>{r.state}</td>
                          <td style={{padding: '12px 16px', fontFamily: 'monospace'}}>{r.consumerNo}</td>
                          <td style={{padding: '12px 16px', color:'#10b981'}}>₹{r.amount}</td>
                          <td style={{padding: '12px 16px'}}>{r.billDate}</td>
                          <td style={{padding: '12px 16px', color:'#f43f5e'}}>{r.dueDate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px'}}>
                  {data.slice(0, 500).map(r => (
                    <div key={r.id} style={{background: '#0f172a', border: '1px solid #475569', borderRadius: '12px', overflow: 'hidden'}}>
                      <div style={{padding: '12px 16px', background: '#334155', borderBottom: '1px solid #475569', display: 'flex', justifyContent: 'space-between'}}>
                        <span style={{fontFamily: 'monospace', fontWeight: 'bold', color: '#38bdf8'}}>{r.senderId}</span>
                        <span style={{fontSize: '12px', color: '#cbd5e1'}}>{r.billDate}</span>
                      </div>
                      <div style={{padding: '16px'}}>
                        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '12px'}}>
                          <span style={{color: '#94a3b8', fontSize: '13px'}}>{r.board} ({r.state})</span>
                          <span style={{color: '#93c5fd', fontSize: '12px', background: 'rgba(59,130,246,0.2)', padding:'2px 6px', borderRadius:'10px'}}>{r.category}</span>
                        </div>
                        <div style={{background: '#1e293b', padding: '12px', borderRadius: '8px', fontSize: '14px', lineHeight: '1.5', color: '#e2e8f0', fontFamily: 'system-ui'}}>
                          {r.sms}
                        </div>
                      </div>
                    </div>
                  ))}
                  {data.length > 500 && <div style={{color:'#94a3b8', padding:'20px'}}>... and {data.length - 500} more rendered as CSV. (SMS View capped to 500 for performance)</div>}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {tab === 'download' && (
        <div style={{background: '#1e293b', padding: '30px', borderRadius: '12px', textAlign: 'center'}}>
          <p style={{fontSize: '18px', color: '#cbd5e1'}}>The React component is completely dynamically built around the massive JSON payload!</p>
          <p style={{color: '#94a3b8'}}>This app parses biller.json natively and dynamically registers all categorizations, layouts, and mappings instantly.</p>
        </div>
      )}
    </div>
  );
}
