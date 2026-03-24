import React, { useState, useMemo } from 'react';

const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randChoice = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randDigits = (n: number) => Array.from({length: n}, () => randInt(0, 9)).join('');

type Discom = {
  name: string; fullName: string; state: string; lsa: string; brand: string; isGovt: boolean;
  minAmt: number; maxAmt: number; genCno: () => string;
  sms: (c: string, m: string, a: number, d: string, b: string) => string;
};

const DISCOMS: Discom[] = [
  // Andhra Pradesh
  { name: 'APCPDCL', fullName: 'Central Power Distribution Company of AP', state: 'Andhra Pradesh', lsa: 'A', brand: 'APCPDL', isGovt: true, minAmt: 400, maxAmt: 4000, genCno: () => randDigits(10), sms: (c, m, a, d, b) => `${b} Bill for USC No. ${c} is Rs. ${a}/-. Due: ${d}. Pay via apcpdcl.in` },
  { name: 'APEPDCL', fullName: 'Eastern Power Distribution Company of AP', state: 'Andhra Pradesh', lsa: 'A', brand: 'APEPDL', isGovt: true, minAmt: 400, maxAmt: 3800, genCno: () => randDigits(10), sms: (c, m, a, d, b) => `Rs. ${a}/- is your electricity bill for SC No. ${c} for the month ${m}. Please pay by ${d} to avoid a 2% surcharge. URL: https://apepdcl.in/ - ${b}` },
  { name: 'APSPDCL', fullName: 'Southern Power Distribution Company of AP', state: 'Andhra Pradesh', lsa: 'A', brand: 'APSPDL', isGovt: true, minAmt: 450, maxAmt: 4200, genCno: () => randDigits(10), sms: (c, m, a, d, b) => `Dear Customer, your ${b} bill for Svc No. ${c} for the month of ${m} is Rs. ${a}. Please pay by due date ${d} via https://apspdcl.in/ to avoid disconnection.` },
  // Arunachal Pradesh
  { name: 'APECL', fullName: 'Arunachal Pradesh Energy', state: 'Arunachal Pradesh', lsa: 'N', brand: 'APECLX', isGovt: true, minAmt: 100, maxAmt: 1000, genCno: () => randDigits(10), sms: (c, m, a, d, b) => `${b} Energy Bill for Consumer No. ${c} is Rs.${a}. Due: ${d}. Month: ${m}. Pay at https://arpdop.gov.in/` },
  // Assam
  { name: 'APDCL', fullName: 'Assam Power Distribution', state: 'Assam', lsa: 'S', brand: 'APDCLA', isGovt: true, minAmt: 300, maxAmt: 2800, genCno: () => randDigits(11), sms: (c, m, a, d, b) => `Dear Consumer, ${b} bill for CA No. ${c} is Rs. ${a} for ${m}. Due Date: ${d}. Pay via https://www.apdcl.org/ or Mpower App.` },
  // Bihar
  { name: 'NBPDCL', fullName: 'North Bihar Power', state: 'Bihar', lsa: 'B', brand: 'NBPDCL', isGovt: true, minAmt: 250, maxAmt: 2500, genCno: () => randDigits(11), sms: (c, m, a, d, b) => `Dear Consumer, your ${b} electricity bill for CA No. ${c} for the month of ${m} is Rs. ${a}/-. Due date is ${d}. Please pay on time (https://nbpdcl.co.in/).` },
  { name: 'SBPDCL', fullName: 'South Bihar Power', state: 'Bihar', lsa: 'B', brand: 'SBPDCL', isGovt: true, minAmt: 250, maxAmt: 2500, genCno: () => randDigits(11), sms: (c, m, a, d, b) => `Dear Consumer, your ${b} electricity bill for CA No. ${c} for the month of ${m} is Rs. ${a}/-. Due date is ${d}. Please pay on time (https://sbpdcl.co.in/).` },
  // Chandigarh
  { name: 'CSPDL', fullName: 'Chandigarh Electricity', state: 'Chandigarh', lsa: 'P', brand: 'CSPDLX', isGovt: true, minAmt: 350, maxAmt: 3500, genCno: () => randDigits(10), sms: (c, m, a, d, b) => `${b}: Bill for CA No. ${c} for ${m} is Rs. ${a}/-. Due Date: ${d}. Pay at https://sampark.chd.nic.in/` },
  // Chhattisgarh
  { name: 'CSPDCL', fullName: 'Chhattisgarh Power', state: 'Chhattisgarh', lsa: 'Y', brand: 'CSPDCL', isGovt: true, minAmt: 300, maxAmt: 2800, genCno: () => randDigits(10), sms: (c, m, a, d, b) => `Dear Consumer, your ${b} bill for BP No. ${c} for the month of ${m} is Rs. ${a}/-. Due Date: ${d}. Pay via https://cspdcl.co.in/` },
  // Delhi
  { name: 'BSES Rajdhani', fullName: 'BSES Rajdhani Power Limited', state: 'Delhi', lsa: 'D', brand: 'BSESRX', isGovt: false, minAmt: 700, maxAmt: 6500, genCno: () => randDigits(9), sms: (c, m, a, d, b) => `Rs. ${a} is due on ${d} against CA No. ${c} for ${m} billing cycle. Pay promptly via www.bsesdelhi.com to evade late payment surcharge. - ${b}` },
  { name: 'BSES Yamuna', fullName: 'BSES Yamuna Power Limited', state: 'Delhi', lsa: 'D', brand: 'BSESYX', isGovt: false, minAmt: 600, maxAmt: 5800, genCno: () => randDigits(9), sms: (c, m, a, d, b) => `Rs. ${a} is due on ${d} against CA No. ${c} for ${m} billing cycle. Pay promptly via www.bsesdelhi.com to evade late payment surcharge. - ${b}` },
  { name: 'TPDDL', fullName: 'Tata Power DDL', state: 'Delhi', lsa: 'D', brand: 'TPDDLX', isGovt: false, minAmt: 650, maxAmt: 6000, genCno: () => 'K' + randDigits(8), sms: (c, m, a, d, b) => `Your ${b} bill for CA No ${c} for month ${m} is Rs ${a}. Pls pay by Due Dt ${d} via https://tatapower-ddl.com/ to avoid DP Surcharge.` },
  { name: 'NDMC', fullName: 'New Delhi Municipal Council', state: 'Delhi', lsa: 'D', brand: 'NDMCEL', isGovt: true, minAmt: 400, maxAmt: 4500, genCno: () => 'ND' + randDigits(6), sms: (c, m, a, d, b) => `${b} bill for Consumer No. ${c} for ${m} is Rs. ${a}/-. Due Date: ${d}. Pay online via https://www.ndmc.gov.in/ or NDMC 311 App.` },
  // DNH & DD
  { name: 'DNH & DD', fullName: 'DNH & DD Power Dept', state: 'DNH & DD', lsa: 'G', brand: 'DNHPWR', isGovt: true, minAmt: 200, maxAmt: 1800, genCno: () => randDigits(9), sms: (c, m, a, d, b) => `${b} for Consumer No. ${c}. Month: ${m}, Amt: Rs. ${a}/-, Due Date: ${d}. Pay at https://dded.gov.in/` },
  // Goa
  { name: 'GEDCL', fullName: 'Goa Electricity Dept', state: 'Goa', lsa: 'Z', brand: 'GEDCLX', isGovt: true, minAmt: 300, maxAmt: 2500, genCno: () => randDigits(10), sms: (c, m, a, d, b) => `${b} Bill for CA: ${c}. Amount: Rs. ${a}, Due: ${d}. Pay via https://goaonline.gov.in/` },
  // Gujarat
  { name: 'DGVCL', fullName: 'Dakshin Gujarat Vij', state: 'Gujarat', lsa: 'G', brand: 'DGVCLX', isGovt: true, minAmt: 450, maxAmt: 3800, genCno: () => randDigits(11), sms: (c, m, a, d, b) => `${b} Bill for Consumer No. ${c} (${m}) is Rs. ${a}. Last Date: ${d}. Pay at https://www.dgvcl.com/` },
  { name: 'MGVCL', fullName: 'Madhya Gujarat Vij', state: 'Gujarat', lsa: 'G', brand: 'MGVCLX', isGovt: true, minAmt: 450, maxAmt: 3900, genCno: () => randDigits(11), sms: (c, m, a, d, b) => `${b} Bill for Consumer No. ${c} (${m}) is Rs. ${a}. Last Date: ${d}. Pay at https://www.mgvcl.com/` },
  { name: 'PGVCL', fullName: 'Paschim Gujarat Vij', state: 'Gujarat', lsa: 'G', brand: 'PGVCLX', isGovt: true, minAmt: 500, maxAmt: 4200, genCno: () => randDigits(11), sms: (c, m, a, d, b) => `${b} Bill for Consumer No. ${c} (${m}) is Rs. ${a}. Last Date: ${d}. Pay at https://www.pgvcl.com/` },
  { name: 'UGVCL', fullName: 'Uttar Gujarat Vij', state: 'Gujarat', lsa: 'G', brand: 'UGVCLX', isGovt: true, minAmt: 500, maxAmt: 4000, genCno: () => randDigits(11), sms: (c, m, a, d, b) => `${b} Bill for Consumer No. ${c} (${m}) is Rs. ${a}. Last Date: ${d}. Pay at https://www.ugvcl.com/` },
  { name: 'Torrent Power', fullName: 'Torrent Power Ahmedabad', state: 'Gujarat', lsa: 'G', brand: 'TORPWR', isGovt: false, minAmt: 600, maxAmt: 5500, genCno: () => randDigits(9), sms: (c, m, a, d, b) => `Rs. ${a}/- is due for ${b} Consumer No. ${c} against ${m}. Due: ${d}. Pay at connect.torrentpower.com to ensure prompt pay concession.` },
  { name: 'Torrent Surat', fullName: 'Torrent Power Surat', state: 'Gujarat', lsa: 'G', brand: 'TPSWTX', isGovt: false, minAmt: 600, maxAmt: 5500, genCno: () => randDigits(9), sms: (c, m, a, d, b) => `Rs. ${a}/- is due for ${b} Consumer No. ${c} against ${m}. Due: ${d}. Pay at connect.torrentpower.com to ensure prompt pay concession.` },
  // Haryana
  { name: 'DHBVN', fullName: 'Dakshin Haryana Bijli', state: 'Haryana', lsa: 'H', brand: 'DHBVNX', isGovt: true, minAmt: 500, maxAmt: 4200, genCno: () => randDigits(10), sms: (c, m, a, d, b) => `${b}: Account No. ${c} has an outstanding of Rs. ${a}/- for ${m}. Pay by ${d} at https://epayment.dhbvn.org.in/ to prevent penalties.` },
  { name: 'UHBVN', fullName: 'Uttar Haryana Bijli', state: 'Haryana', lsa: 'H', brand: 'UHBVNX', isGovt: true, minAmt: 450, maxAmt: 4000, genCno: () => randDigits(10), sms: (c, m, a, d, b) => `${b}: Account No. ${c} has an outstanding of Rs. ${a}/- for ${m}. Pay by ${d} at https://epayment.uhbvn.org.in/ to prevent penalties.` },
  // Himachal Pradesh
  { name: 'HPSEBL', fullName: 'Himachal Pradesh State Electricity', state: 'Himachal Pradesh', lsa: 'I', brand: 'HPSEBL', isGovt: true, minAmt: 200, maxAmt: 2000, genCno: () => randDigits(10), sms: (c, m, a, d, b) => `${b} Cons No. ${c} has a bill of Rs.${a} for Month: ${m}. Due: ${d}. Pay at https://www.hpseb.in/` },
  // J&K
  { name: 'JPDCL', fullName: 'Jammu Power Distribution', state: 'Jammu & Kashmir', lsa: 'J', brand: 'JPDCLX', isGovt: true, minAmt: 200, maxAmt: 1800, genCno: () => randDigits(10), sms: (c, m, a, d, b) => `${b} Bill for Cons No. ${c} is Rs. ${a}/-, Due: ${d}. Pay via https://bills.jpdcl.co.in/` },
  { name: 'KPDCL', fullName: 'Kashmir Power Distribution', state: 'Jammu & Kashmir', lsa: 'J', brand: 'KPDCLX', isGovt: true, minAmt: 200, maxAmt: 1800, genCno: () => randDigits(10), sms: (c, m, a, d, b) => `${b} Bill for Cons No. ${c} is Rs. ${a}/-, Due: ${d}. Pay via https://bills.kpdcl.co.in/` },
  // Jharkhand
  { name: 'JBVNL', fullName: 'Jharkhand Bijli Vitran', state: 'Jharkhand', lsa: 'B', brand: 'JBVNLX', isGovt: true, minAmt: 250, maxAmt: 2500, genCno: () => randDigits(10), sms: (c, m, a, d, b) => `Dear Consumer, your ${b} bill for Consumer No. ${c} for the month of ${m} is Rs. ${a}/-. Due date is ${d}. Pay via JBVNL Suvidha App.` },
  { name: 'Jusco', fullName: 'Tata Steel Utilities', state: 'Jharkhand', lsa: 'B', brand: 'JUSCOX', isGovt: false, minAmt: 500, maxAmt: 4500, genCno: () => randDigits(12), sms: (c, m, a, d, b) => `${b} Bill for BP No. ${c} is Rs. ${a}/-. Due: ${d}. Pay via TSUISL App.` },
  // Karnataka (BESCOM - RR No)
  { name: 'BESCOM', fullName: 'Bangalore Electricity', state: 'Karnataka', lsa: 'X', brand: 'BESCOM', isGovt: true, minAmt: 700, maxAmt: 5000, genCno: () => randChoice(['E','W','S','N']) + randDigits(6), sms: (c, m, a, d, b) => `Dear Customer, Your ${b} electricity bill for the period ${m} has been generated. The payable amount for RR No. ${c} is Rs. ${a}. Kindly pay before the due date ${d} to avoid service interruption. You can pay via www.bescom.co.in. Thank you.` },
  { name: 'CESCOM', fullName: 'Chamundeshwari Electricity', state: 'Karnataka', lsa: 'X', brand: 'CESCOM', isGovt: true, minAmt: 350, maxAmt: 3000, genCno: () => randDigits(10), sms: (c, m, a, d, b) => `Dear Customer, ${b} bill for Account ID ${c} is Rs. ${a} for ${m}. Due: ${d}. Pay at https://cescmysore.karnataka.gov.in/` },
  { name: 'GESCOM', fullName: 'Gulbarga Electricity', state: 'Karnataka', lsa: 'X', brand: 'GESCOM', isGovt: true, minAmt: 300, maxAmt: 2500, genCno: () => randDigits(10), sms: (c, m, a, d, b) => `Dear Customer, ${b} bill for Account ID ${c} is Rs. ${a} for ${m}. Due: ${d}. Pay at https://gescom.karnataka.gov.in/` },
  { name: 'HESCOM', fullName: 'Hubli Electricity', state: 'Karnataka', lsa: 'X', brand: 'HESCOM', isGovt: true, minAmt: 300, maxAmt: 2800, genCno: () => randDigits(10), sms: (c, m, a, d, b) => `Dear Customer, ${b} bill for Account ID ${c} is Rs. ${a} for ${m}. Due: ${d}. Pay at https://hescom.karnataka.gov.in/` },
  { name: 'MESCOM', fullName: 'Mangalore Electricity', state: 'Karnataka', lsa: 'X', brand: 'MESCOM', isGovt: true, minAmt: 350, maxAmt: 3000, genCno: () => randDigits(10), sms: (c, m, a, d, b) => `Dear Customer, ${b} bill for Account ID ${c} is Rs. ${a} for ${m}. Due: ${d}. Pay at https://mescom.karnataka.gov.in/` },
  // Kerala (KSEB - 13 digit starting with 11)
  { name: 'KSEB', fullName: 'Kerala State Electricity Board', state: 'Kerala', lsa: 'L', brand: 'KSEBIL', isGovt: true, minAmt: 300, maxAmt: 3200, genCno: () => '11' + randDigits(11), sms: (c, m, a, d, b) => `Dear ${b} Customer, your bill for Cons No ${c} in month ${m} is Rs ${a}. Pay before due date ${d} at wss.kseb.in or BBPS.` },
  { name: 'TCED Thrissur', fullName: 'Thrissur Corp Electricity', state: 'Kerala', lsa: 'L', brand: 'TCEDXX', isGovt: true, minAmt: 250, maxAmt: 2500, genCno: () => randDigits(9), sms: (c, m, a, d, b) => `${b} Bill for Cons No ${c} is Rs. ${a}. Due ${d} (${m}).` },
  // Madhya Pradesh
  { name: 'MPPKVVCL', fullName: 'MP Paschim Kshetra', state: 'Madhya Pradesh', lsa: 'Y', brand: 'MPWKVL', isGovt: true, minAmt: 350, maxAmt: 3200, genCno: () => randDigits(12), sms: (c, m, a, d, b) => `${b}: Bill for IVRS No. ${c} is Rs. ${a}/-. Please pay by due date ${d} via URJA app.` },
  { name: 'MPMKVVCL', fullName: 'MP Madhya Kshetra', state: 'Madhya Pradesh', lsa: 'Y', brand: 'MPMKVL', isGovt: true, minAmt: 350, maxAmt: 3200, genCno: () => randDigits(12), sms: (c, m, a, d, b) => `${b}: Bill for IVRS No. ${c} is Rs. ${a}/-. Please pay by due date ${d} via URJA app.` },
  { name: 'MPEPKVVCL', fullName: 'MP Poorv Kshetra', state: 'Madhya Pradesh', lsa: 'Y', brand: 'MPEPKL', isGovt: true, minAmt: 350, maxAmt: 3000, genCno: () => randDigits(12), sms: (c, m, a, d, b) => `${b}: Bill for IVRS No. ${c} is Rs. ${a}/-. Please pay by due date ${d} via URJA app.` },
  // Maharashtra (MSEDCL dual dates and UPI QR)
  { name: 'BEST', fullName: 'BEST Undertaking', state: 'Maharashtra', lsa: 'M', brand: 'BESTXX', isGovt: true, minAmt: 400, maxAmt: 4500, genCno: () => randDigits(9), sms: (c, m, a, d, b) => `${b} bill for Consumer No. ${c} is Rs. ${a}/-. Due: ${d}. Pay at bestundertaking.net` },
  { name: 'Tata Power Mumbai', fullName: 'Tata Power Mumbai', state: 'Maharashtra', lsa: 'M', brand: 'TPCMUM', isGovt: false, minAmt: 500, maxAmt: 6000, genCno: () => randDigits(10), sms: (c, m, a, d, b) => `Your ${b} bill for CA No. ${c} for ${m} is Rs. ${a}. Due Date: ${d}. Pay at powerindia.tatapower.com` },
  { name: 'Torrent Power Bhiwandi', fullName: 'Torrent Power Bhiwandi', state: 'Maharashtra', lsa: 'Z', brand: 'TPBHIW', isGovt: false, minAmt: 500, maxAmt: 5000, genCno: () => randDigits(9), sms: (c, m, a, d, b) => `Rs. ${a}/- is due for ${b} Consumer No. ${c} against ${m}. Due: ${d}. Pay at connect.torrentpower.com` },
  { name: 'MSEDCL', fullName: 'Maharashtra State Electricity', state: 'Maharashtra', lsa: 'Z', brand: 'MSEDCL', isGovt: true, minAmt: 600, maxAmt: 5500, genCno: () => randDigits(12), sms: (c, m, a, d, b) => {
      const dParts = d.split('-');
      const dDate = new Date(`${dParts[2]}-${dParts[1]}-${dParts[0]}T00:00:00`);
      const earlyDateObj = new Date(dDate.getTime() - 5 * 24 * 3600 * 1000);
      const earlyDateStr = `${earlyDateObj.getDate().toString().padStart(2, '0')}-${(earlyDateObj.getMonth() + 1).toString().padStart(2, '0')}-${earlyDateObj.getFullYear()}`;
      return `Rs. ${a} is the electricity bill for Consumer No. ${c} for ${m}. If paid by ${earlyDateStr} Rs. ${a - 10}. Due Date: ${d}. Pay online at wss.mahadiscom.in/wss/ or scan UPI QR on your physical bill. - ${b}`;
  }},
  { name: 'Adani Electricity', fullName: 'Adani Electricity Mumbai', state: 'Maharashtra', lsa: 'M', brand: 'AEMLXX', isGovt: false, minAmt: 800, maxAmt: 7000, genCno: () => randDigits(9), sms: (c, m, a, d, b) => `${b} bill for Acct No. ${c} is Rs. ${a}. Due: ${d}. Avoid disconnection, pay via Adani One App.` },
  // Manipur
  { name: 'MSPDCL', fullName: 'Manipur State Power', state: 'Manipur', lsa: 'N', brand: 'MSPDCL', isGovt: true, minAmt: 150, maxAmt: 1500, genCno: () => randDigits(10), sms: (c, m, a, d, b) => `${b} Bill for Cons No: ${c} is Rs. ${a}/-. Due: ${d}. Pay via https://mspdcl.info/` },
  // Meghalaya
  { name: 'MeECL', fullName: 'Meghalaya Energy Corp', state: 'Meghalaya', lsa: 'N', brand: 'MEECLX', isGovt: true, minAmt: 150, maxAmt: 1500, genCno: () => randDigits(10), sms: (c, m, a, d, b) => `${b} Bill for Cons No: ${c} is Rs. ${a}/-. Due: ${d}. Pay via http://meecl.nic.in/` },
  // Mizoram
  { name: 'Mizoram P&E', fullName: 'Mizoram Power & Electricity', state: 'Mizoram', lsa: 'N', brand: 'MIZPWR', isGovt: true, minAmt: 100, maxAmt: 1000, genCno: () => randDigits(10), sms: (c, m, a, d, b) => `${b} Bill for Cons No: ${c} is Rs. ${a}/-. Due: ${d}. Pay via https://power.mizoram.gov.in/` },
  // Nagaland
  { name: 'DPUNL', fullName: 'DoP Nagaland', state: 'Nagaland', lsa: 'N', brand: 'DPUNLX', isGovt: true, minAmt: 100, maxAmt: 1200, genCno: () => randDigits(10), sms: (c, m, a, d, b) => `${b} Bill for Cons No: ${c} is Rs. ${a}/-. Due: ${d}. Pay via https://dopn.gov.in/` },
  // Odisha
  { name: 'TPNODL', fullName: 'TP Northern Odisha', state: 'Odisha', lsa: 'O', brand: 'TPNODL', isGovt: false, minAmt: 300, maxAmt: 2800, genCno: () => 'CA' + randDigits(9), sms: (c, m, a, d, b) => `${b} Bill for CA No. ${c} is Rs. ${a}. Due: ${d}. Pay via TP App.` },
  { name: 'TPSODL', fullName: 'TP Southern Odisha', state: 'Odisha', lsa: 'O', brand: 'TPSODL', isGovt: false, minAmt: 300, maxAmt: 2800, genCno: () => 'CA' + randDigits(9), sms: (c, m, a, d, b) => `${b} Bill for CA No. ${c} is Rs. ${a}. Due: ${d}. Pay via TP App.` },
  { name: 'TPWODL', fullName: 'TP Western Odisha', state: 'Odisha', lsa: 'O', brand: 'TPWODL', isGovt: false, minAmt: 300, maxAmt: 2800, genCno: () => 'CA' + randDigits(9), sms: (c, m, a, d, b) => `${b} Bill for CA No. ${c} is Rs. ${a}. Due: ${d}. Pay via TP App.` },
  { name: 'TPCODL', fullName: 'TP Central Odisha', state: 'Odisha', lsa: 'O', brand: 'TPCODL', isGovt: false, minAmt: 300, maxAmt: 2800, genCno: () => 'CA' + randDigits(9), sms: (c, m, a, d, b) => `${b} Bill for CA No. ${c} is Rs. ${a}. Due: ${d}. Pay via TP App.` },
  // Puducherry
  { name: 'PPCL', fullName: 'Puducherry Electricity', state: 'Puducherry', lsa: 'T', brand: 'PPCLXX', isGovt: true, minAmt: 200, maxAmt: 2000, genCno: () => randDigits(10), sms: (c, m, a, d, b) => `${b}: Cons No. ${c} has outstanding Rs. ${a}/-. Due: ${d}.` },
  // Punjab
  { name: 'PSPCL', fullName: 'Punjab State Power', state: 'Punjab', lsa: 'P', brand: 'PSPCLX', isGovt: true, minAmt: 350, maxAmt: 3800, genCno: () => randChoice(['AP','NP','SP']) + randDigits(9), sms: (c, m, a, d, b) => `${b} bill for A/c No. ${c} is Rs. ${a}/-. Last Date: ${d}. Pay at https://pspcl.in/ to prevent 2% surcharge.` },
  // Rajasthan
  { name: 'JVVNL', fullName: 'Jaipur Vidyut Vitran Nigam', state: 'Rajasthan', lsa: 'R', brand: 'JVVNLX', isGovt: true, minAmt: 400, maxAmt: 3500, genCno: () => randDigits(12), sms: (c, m, a, d, b) => `${b} Electricity Bill for K.No. ${c} is Rs. ${a}/-. Due Date: ${d}. Pay via E-Mitra.` },
  { name: 'AVVNL', fullName: 'Ajmer Vidyut Vitran Nigam', state: 'Rajasthan', lsa: 'R', brand: 'AVVNLX', isGovt: true, minAmt: 350, maxAmt: 3200, genCno: () => randDigits(12), sms: (c, m, a, d, b) => `${b} Electricity Bill for K.No. ${c} is Rs. ${a}/-. Due Date: ${d}. Pay via E-Mitra.` },
  { name: 'JDVVNL', fullName: 'Jodhpur Vidyut Vitran', state: 'Rajasthan', lsa: 'R', brand: 'JDVVNL', isGovt: true, minAmt: 350, maxAmt: 3200, genCno: () => randDigits(12), sms: (c, m, a, d, b) => `${b} Electricity Bill for K.No. ${c} is Rs. ${a}/-. Due Date: ${d}. Pay via E-Mitra.` },
  // Sikkim
  { name: 'SPDCL', fullName: 'Sikkim Power', state: 'Sikkim', lsa: 'N', brand: 'SPDCLX', isGovt: true, minAmt: 150, maxAmt: 1200, genCno: () => randDigits(9), sms: (c, m, a, d, b) => `${b}: Cons No. ${c} has a balance of Rs. ${a}/-. Due: ${d}.` },
  // Tamil Nadu (TANGEDCO - XXX-XXX-XXX SC No)
  { name: 'TANGEDCO', fullName: 'Tamil Nadu Electricity', state: 'Tamil Nadu', lsa: 'T', brand: 'TNEBXX', isGovt: true, minAmt: 350, maxAmt: 3500, genCno: () => `${randDigits(3)}-${randDigits(3)}-${randDigits(3)}`, sms: (c, m, a, d, b) => `Your ${b} EB Bill amount for SC No ${c} is Rs. ${a} for ${m}. Due date is ${d}. Pay online at www.tnebltd.gov.in/qpay to avoid disconnection.` },
  // Telangana
  { name: 'TSSPDCL', fullName: 'Telangana Southern Power', state: 'Telangana', lsa: 'A', brand: 'TSSPDC', isGovt: true, minAmt: 450, maxAmt: 3800, genCno: () => randDigits(10), sms: (c, m, a, d, b) => `${b} Bill for USC No. ${c} is Rs. ${a}/-. Due: ${d}. Pay via TS-Online.` },
  { name: 'TSNPDCL', fullName: 'Telangana Northern Power', state: 'Telangana', lsa: 'A', brand: 'TSNPDC', isGovt: true, minAmt: 400, maxAmt: 3200, genCno: () => randDigits(10), sms: (c, m, a, d, b) => `${b} Bill for SC No. ${c} is Rs. ${a}/-. Due: ${d}. Pay via TS-Online.` },
  // Tripura
  { name: 'TSECL', fullName: 'Tripura State Electricity', state: 'Tripura', lsa: 'N', brand: 'TSECLX', isGovt: true, minAmt: 150, maxAmt: 1500, genCno: () => randDigits(10), sms: (c, m, a, d, b) => `${b}: Cons No. ${c} balance is Rs. ${a}/-. Due: ${d}. www.tsecl.in` },
  // Uttar Pradesh (UPPCL standard 10 div Account No)
  { name: 'NPCL', fullName: 'Noida Power Company Ltd', state: 'Uttar Pradesh', lsa: 'W', brand: 'NPCLXX', isGovt: false, minAmt: 800, maxAmt: 7000, genCno: () => randDigits(10), sms: (c, m, a, d, b) => `Dear Consumer, ${b} bill for Account No. ${c} is Rs. ${a}. Due: ${d}. Pay via noidapower.com` },
  { name: 'PVVNL', fullName: 'Paschimanchal Vidyut Vitran', state: 'Uttar Pradesh', lsa: 'W', brand: 'PVVNLX', isGovt: true, minAmt: 450, maxAmt: 4500, genCno: () => randDigits(10), sms: (c, m, a, d, b) => `Dear Consumer, electricity bill for Account No. ${c} for ${m} is Rs. ${a}. Due date is ${d}. Please pay on time via uppclonline.com. -${b}` },
  { name: 'DVVNL', fullName: 'Dakshinanchal Vidyut Vitran', state: 'Uttar Pradesh', lsa: 'W', brand: 'DVVNLX', isGovt: true, minAmt: 400, maxAmt: 4000, genCno: () => randDigits(10), sms: (c, m, a, d, b) => `Dear Consumer, electricity bill for Account No. ${c} for ${m} is Rs. ${a}. Due date is ${d}. Please pay on time via uppclonline.com. -${b}` },
  { name: 'MVVNL', fullName: 'Madhyanchal Vidyut Vitran', state: 'Uttar Pradesh', lsa: 'E', brand: 'MVVNLX', isGovt: true, minAmt: 400, maxAmt: 4000, genCno: () => randDigits(10), sms: (c, m, a, d, b) => `Dear Consumer, electricity bill for Account No. ${c} for ${m} is Rs. ${a}. Due date is ${d}. Please pay on time via uppclonline.com. -${b}` },
  { name: 'PuVVNL', fullName: 'Purvanchal Vidyut Vitran', state: 'Uttar Pradesh', lsa: 'E', brand: 'PUVVNL', isGovt: true, minAmt: 350, maxAmt: 3500, genCno: () => randDigits(10), sms: (c, m, a, d, b) => `Dear Consumer, electricity bill for Account No. ${c} for ${m} is Rs. ${a}. Due date is ${d}. Please pay on time via uppclonline.com. -${b}` },
  { name: 'KESCO', fullName: 'Kanpur Electricity Supply', state: 'Uttar Pradesh', lsa: 'E', brand: 'KESCOX', isGovt: true, minAmt: 400, maxAmt: 4000, genCno: () => randDigits(10), sms: (c, m, a, d, b) => `Dear Consumer, electricity bill for Account No. ${c} for ${m} is Rs. ${a}. Due date is ${d}. Please pay on time via uppclonline.com. -${b}` },
  // Uttarakhand
  { name: 'UPCL', fullName: 'Uttarakhand Power', state: 'Uttarakhand', lsa: 'W', brand: 'UPCLXX', isGovt: true, minAmt: 300, maxAmt: 3000, genCno: () => randDigits(13), sms: (c, m, a, d, b) => `${b} Bill for Cons No. ${c} is Rs. ${a}/-. Due: ${d}. Pay at www.upcl.org` },
  // West Bengal
  { name: 'CESC', fullName: 'CESC Limited', state: 'West Bengal', lsa: 'K', brand: 'CESCLT', isGovt: false, minAmt: 600, maxAmt: 5200, genCno: () => randDigits(11), sms: (c, m, a, d, b) => `${b} Bill for Cons No. ${c}. Net Amt: Rs. ${a}/-, Due: ${d}. Pay via CESC App.` },
  { name: 'WBSEDCL', fullName: 'West Bengal State Electricity', state: 'West Bengal', lsa: 'V', brand: 'WBSEDL', isGovt: true, minAmt: 300, maxAmt: 2800, genCno: () => randDigits(9), sms: (c, m, a, d, b) => `${b} Bill for Id-${c} in ${m} is Rs.${a}. Due: ${d}. Pay at wbsedcl.in` },
  { name: 'DPL', fullName: 'Durgapur Projects Limited', state: 'West Bengal', lsa: 'V', brand: 'DPLXXX', isGovt: true, minAmt: 400, maxAmt: 3500, genCno: () => randDigits(11), sms: (c, m, a, d, b) => `${b} Bill for Cons No. ${c} is Rs. ${a}/-. Due: ${d}.` },
  { name: 'IPCL', fullName: 'India Power Corporation Limited', state: 'West Bengal', lsa: 'V', brand: 'IPCLXX', isGovt: false, minAmt: 300, maxAmt: 3000, genCno: () => randDigits(11), sms: (c, m, a, d, b) => `${b} bill for CA No. ${c} is Rs. ${a}. Due Date: ${d}. Pay via indiapower.com` },
  // Islands
  { name: 'ANIIDCO A&N', fullName: 'A&N Electricity', state: 'Andaman & Nicobar', lsa: 'N', brand: 'ANIELO', isGovt: true, minAmt: 150, maxAmt: 1500, genCno: () => randDigits(10), sms: (c, m, a, d, b) => `${b} Bill for Cons No. ${c} is Rs. ${a}/-. Due: ${d}.` },
  { name: 'Lakshadweep', fullName: 'Lakshadweep Electricity', state: 'Lakshadweep', lsa: 'N', brand: 'LKSELC', isGovt: true, minAmt: 100, maxAmt: 800, genCno: () => randDigits(10), sms: (c, m, a, d, b) => `${b} Bill for Cons No. ${c} is Rs. ${a}/-. Due: ${d}.` }
];







export default function App() {
  const [tab, setTab] = useState('generator');
  const [filterType, setFilterType] = useState('state');
  const [activeState, setActiveState] = useState<string | null>(null);
  const [activeBoards, setActiveBoards] = useState<string[]>([]);
  const [useFullName, setUseFullName] = useState(false);
  const [count, setCount] = useState(1);
  const [view, setView] = useState('table');
  const [data, setData] = useState<any[]>([]);
  const [showInfo, setShowInfo] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const states = useMemo(() => {
    const sMap = new Map<string, number>();
    DISCOMS.forEach(d => {
      sMap.set(d.state, (sMap.get(d.state) || 0) + 1);
    });
    return Array.from(sMap.entries()).map(([state, num]) => ({state, num})).sort((a,b)=>a.state.localeCompare(b.state));
  }, []);

  
  const handleGenerateAll = () => {
    let valid = DISCOMS;
    if (filterType === 'state' && activeState) {
      valid = valid.filter(d => d.state === activeState);
    } else if (filterType === 'board' && activeBoards.length > 0) {
      valid = valid.filter(d => activeBoards.includes(d.name));
    }
    const result = [];
    const TSPs = ['A', 'J', 'V', 'B', 'T'];
    const currentDate = new Date('2026-03-21T10:01:58+05:30');
    
    for (let i = 0; i < valid.length; i++) {
        const discom = valid[i];
        const tsp = randChoice(TSPs);
        const daysPast = randInt(1, 180);
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
        const cno = discom.genCno();
        const numAmt = randInt(discom.minAmt, discom.maxAmt);
        const suffix = discom.isGovt ? 'G' : 'S';
        
        // MSEDCL specific brand IDs
        let brandStr = discom.brand;
        if(discom.name === 'MSEDCL') {
             brandStr = randChoice(['VMMSED', 'VKMSED', 'AMMSED', 'JMMSED']);
        }
        
        result.push({
          id: i + 1,
          senderId: `${tsp}${discom.lsa}-${brandStr}-${suffix}`,
          board: discom.name,
          fullName: discom.fullName,
          state: discom.state,
          category: discom.isGovt ? 'Govt' : 'Private',
          consumerNo: cno,
          amount: numAmt,
          billDate: billDateStr,
          dueDate: dueDateStr,
          sms: discom.sms(cno, monthStr, numAmt, dueDateStr, useFullName ? discom.fullName : discom.name)
        });
    }
    setData(result);
  };

const handleGenerate = () => {
    let valid = DISCOMS;
    if (filterType === 'state' && activeState) {
      valid = valid.filter(d => d.state === activeState);
    } else if (filterType === 'board' && activeBoards.length > 0) {
      valid = valid.filter(d => activeBoards.includes(d.name));
    }
    const result = [];
    const TSPs = ['A', 'J', 'V', 'B', 'T'];
    const currentDate = new Date('2026-03-21T10:01:58+05:30');
    
    for (let i = 0; i < Math.max(1, Math.min(200, count)); i++) {
      const discom = randChoice(valid);
      const tsp = randChoice(TSPs);
      const daysPast = randInt(1, 180);
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
      const cno = discom.genCno();
      const numAmt = randInt(discom.minAmt, discom.maxAmt);
      const suffix = discom.isGovt ? 'G' : 'S';
      
      result.push({
        id: i + 1,
        senderId: `${tsp}${discom.lsa}-${discom.name === 'MSEDCL' ? randChoice(['VMMSED', 'VKMSED', 'AMMSED', 'JMMSED']) : discom.brand}-${suffix}`,
        board: discom.name,
        fullName: discom.fullName,
        state: discom.state,
        category: discom.isGovt ? 'Govt' : 'Private',
        consumerNo: cno,
        amount: numAmt,
        billDate: billDateStr,
        dueDate: dueDateStr,
        sms: discom.sms(cno, monthStr, numAmt, dueDateStr, useFullName ? discom.fullName : discom.name)
      });
    }
    setData(result);
  };

  const exportCSV = () => {
    if(!data.length) return;
    const header = ['id','senderId','board','fullName','state','category','consumerNo','amount','billDate','dueDate','sms'];
    const rows = data.map(r => header.map(h => `"${r[h].toString().replace(/"/g, '""')}"`).join(','));
    const csv = [header.join(','), ...rows].join('\n');
    download(csv, 'electricity_sms_data.csv', 'text/csv');
  };
  const exportJSON = () => {
    if(!data.length) return;
    download(JSON.stringify(data, null, 2), 'electricity_sms_data.json', 'application/json');
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

  const toggleBoard = (name: string) => {
    setActiveBoards(prev => prev.includes(name) ? prev.filter(x => x !== name) : [...prev, name]);
  };

  const filteredBoards = DISCOMS.filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()) || d.fullName.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div style={{minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a, #1e293b)', color: '#f8fafc', fontFamily: 'Inter, system-ui, sans-serif', padding: '24px'}}>
      
      {/* Header */}
      <div style={{background: 'linear-gradient(90deg, #ec4899, #8b5cf6, #3b82f6)', padding: '2px', borderRadius: '12px', marginBottom: '24px'}}>
        <div style={{background: '#1e293b', padding: '20px', borderRadius: '10px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <h1 style={{margin:0, fontSize: '24px', fontWeight: 'bold', background: '-webkit-linear-gradient(0deg, #ec4899, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
            India Electricity Bill SMS Generator
          </h1>
          <div style={{fontSize: '14px', color: '#cbd5e1', background: '#334155', padding: '6px 12px', borderRadius: '20px'}}>
            {DISCOMS.length} Supported Boards
          </div>
        </div>
      </div>

      <div style={{display:'flex', gap: '8px', marginBottom: '20px'}}>
        <button onClick={()=>setTab('generator')} style={{background: tab==='generator' ? '#3b82f6' : '#334155', color: '#fff', border:'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight:'bold'}}>Generator</button>
        <button onClick={()=>setTab('download')} style={{background: tab==='download' ? '#3b82f6' : '#334155', color: '#fff', border:'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight:'bold'}}>Download Code</button>
      </div>

      {tab === 'generator' && (
        <div style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
          <div style={{background: '#1e293b', border: '1px solid #334155', padding: '20px', borderRadius: '12px'}}>
            <div style={{display:'flex', gap: '20px', marginBottom: '16px', alignItems: 'center'}}>
              <div style={{display:'flex', gap:'8px', background:'#0f172a', padding:'4px', borderRadius:'8px'}}>
                <button onClick={()=>setFilterType('state')} style={{background: filterType==='state' ? '#475569':'transparent', color: '#f8fafc', border:'none', padding: '8px 16px', borderRadius: '4px', cursor:'pointer'}}>Filter by State/UT</button>
                <button onClick={()=>setFilterType('board')} style={{background: filterType==='board' ? '#475569':'transparent', color: '#f8fafc', border:'none', padding: '8px 16px', borderRadius: '4px', cursor:'pointer'}}>Filter by Board</button>
              </div>
              <button onClick={()=>setShowInfo(!showInfo)} style={{marginLeft:'auto', background:'transparent', border:'1px solid #8b5cf6', color:'#8b5cf6', padding:'6px 12px', borderRadius:'6px', cursor:'pointer'}}>TRAI Info</button>
            </div>

            {showInfo && (
              <div style={{background: '#312e81', color: '#e0e7ff', padding: '16px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', lineHeight:'1.5'}}>
                <strong>TRAI DLT Sender ID Rules (May 2025):</strong> XY-ZZZZZZ-G/S<br/>
                X: TSP Code (A=Airtel, J=Jio, V=Vi, B=BSNL, T=Tata)<br/>
                Y: LSA Code (Circle)<br/>
                ZZZZZZ: 6-char registered brand code<br/>
                Suffix: -G (Govt), -S (Private)<br/>
              </div>
            )}

            {filterType === 'state' ? (
              <div>
                <div style={{display:'flex', gap:'8px', marginBottom:'12px'}}>
                  <button onClick={()=>setActiveState(null)} style={{background:'#334155', border:'none', color:'#fff', padding:'6px 12px', borderRadius:'4px', cursor:'pointer', fontSize:'13px'}}>All States</button>
                </div>
                <div style={{display:'flex', flexWrap:'wrap', gap:'8px'}}>
                  {states.map(s => (
                    <div key={s.state} onClick={()=>setActiveState(activeState === s.state ? null : s.state)} style={{background: activeState === s.state ? '#3b82f6' : '#1e293b', border: `1px solid ${activeState === s.state ? '#60a5fa' : '#475569'}`, padding: '8px 16px', borderRadius: '20px', cursor:'pointer', fontSize: '14px', display:'flex', alignItems:'center', gap:'8px', transition:'all 0.2s'}}>
                      {s.state} <span style={{background:'#0f172a', color:'#cbd5e1', padding:'2px 8px', borderRadius:'10px', fontSize:'12px'}}>{s.num}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <div style={{display:'flex', gap:'12px', marginBottom:'12px', alignItems:'center'}}>
                  <input type="text" placeholder="Search boards..." value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} style={{background: '#0f172a', border: '1px solid #475569', color: '#f8fafc', padding: '8px 12px', borderRadius: '6px', outline: 'none', minWidth: '250px'}} />
                  <button onClick={()=>setActiveBoards([])} style={{background:'#334155', border:'none', color:'#fff', padding:'6px 12px', borderRadius:'4px', cursor:'pointer', fontSize:'13px'}}>Clear Selection</button>
                </div>
                <div style={{display:'flex', flexWrap:'wrap', gap:'8px', maxHeight:'200px', overflowY:'auto'}}>
                  {filteredBoards.map(d => {
                    const active = activeBoards.includes(d.name);
                    const color = d.isGovt ? '#a855f7' : '#3b82f6';
                    return (
                      <div key={d.name} onClick={()=>toggleBoard(d.name)} style={{background: active ? color : '#1e293b', border: `1px solid ${color}`, color: '#fff', padding: '6px 12px', borderRadius: '6px', cursor:'pointer', fontSize: '13px', transition:'all 0.2s'}}>
                        {d.fullName}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
            
            <div style={{marginTop: '24px', display: 'flex', gap: '16px', alignItems: 'center'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                <span>Generate</span>
                <input type="number" min="1" max="200" value={count} onChange={(e)=>setCount(Number(e.target.value))} style={{width:'80px', background:'#0f172a', border:'1px solid #475569', color:'#fff', padding:'8px', borderRadius:'6px', textAlign:'center'}} />
                <span>records</span>
              </div>
              
              <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginRight: '16px'}}>
                <input type="checkbox" id="useFullName" checked={useFullName} onChange={(e) => setUseFullName(e.target.checked)} style={{width: '18px', height: '18px', cursor: 'pointer', accentColor: '#ec4899'}} />
                <label htmlFor="useFullName" style={{cursor: 'pointer', fontSize: '14px', color: '#cbd5e1'}}>Use Full Name</label>
              </div>
              <button onClick={handleGenerateAll} style={{background: 'linear-gradient(90deg, #10b981, #3b82f6)', border:'none', color:'#fff', padding:'10px 24px', borderRadius:'8px', fontWeight:'bold', cursor:'pointer', minWidth: '150px'}}>Generate All Discoms</button>
              <button onClick={handleGenerate} style={{background: 'linear-gradient(90deg, #ec4899, #8b5cf6)', border:'none', color:'#fff', padding:'10px 24px', borderRadius:'8px', fontWeight:'bold', cursor:'pointer', minWidth: '150px'}}>Generate Data</button>
            </div>
          </div>

          {data.length > 0 && (
            <div style={{background: '#1e293b', border: '1px solid #334155', padding: '20px', borderRadius: '12px'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                <div style={{display: 'flex', gap: '8px', background: '#0f172a', padding: '4px', borderRadius: '8px'}}>
                  <button onClick={()=>setView('table')} style={{background: view==='table'?'#475569':'transparent', color:'#f8fafc', border:'none', padding:'6px 16px', borderRadius:'4px', cursor:'pointer'}}>Table View</button>
                  <button onClick={()=>setView('card')} style={{background: view==='card'?'#475569':'transparent', color:'#f8fafc', border:'none', padding:'6px 16px', borderRadius:'4px', cursor:'pointer'}}>SMS View</button>
                </div>
                <div style={{display: 'flex', gap: '8px'}}>
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
                        <th style={{padding: '12px 16px'}}>Board</th>
                        <th style={{padding: '12px 16px'}}>State</th>
                        <th style={{padding: '12px 16px'}}>Consumer No</th>
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
                            <span style={{background: r.category==='Govt'?'rgba(168,85,247,0.2)':'rgba(59,130,246,0.2)', color: r.category==='Govt'?'#d8b4fe':'#93c5fd', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', border: `1px solid ${r.category==='Govt'?'#a855f7':'#3b82f6'}`}}>
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
                  {data.map(r => (
                    <div key={r.id} style={{background: '#0f172a', border: '1px solid #475569', borderRadius: '12px', overflow: 'hidden'}}>
                      <div style={{padding: '12px 16px', background: '#334155', borderBottom: '1px solid #475569', display: 'flex', justifyContent: 'space-between'}}>
                        <span style={{fontFamily: 'monospace', fontWeight: 'bold', color: '#38bdf8'}}>{r.senderId}</span>
                        <span style={{fontSize: '12px', color: '#cbd5e1'}}>{r.billDate}</span>
                      </div>
                      <div style={{padding: '16px'}}>
                        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '12px'}}>
                          <span style={{color: '#94a3b8', fontSize: '13px'}}>{r.board} ({r.state})</span>
                          <span style={{color: r.category==='Govt'?'#d8b4fe':'#93c5fd', fontSize: '12px', background: r.category==='Govt'?'rgba(168,85,247,0.2)':'rgba(59,130,246,0.2)', padding:'2px 6px', borderRadius:'10px'}}>{r.category}</span>
                        </div>
                        <div style={{background: '#1e293b', padding: '12px', borderRadius: '8px', fontSize: '14px', lineHeight: '1.5', color: '#e2e8f0', fontFamily: 'system-ui'}}>
                          {r.sms}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {tab === 'download' && (
        <div style={{background: '#1e293b', padding: '30px', borderRadius: '12px', textAlign: 'center'}}>
          <p style={{fontSize: '18px', color: '#cbd5e1'}}>The React component is completely self-contained in this single file!</p>
          <p style={{color: '#94a3b8'}}>This app dynamically implements all requested TRAI logic and DISCOM specs.</p>
        </div>
      )}
    </div>
  );
}
