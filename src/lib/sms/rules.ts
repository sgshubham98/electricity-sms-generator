import { getIdentifierForBiller } from './identifiers';

type SmsContext = {
  category: string;
  billerName: string;
  state: string;
  amount: number;
  dueDate: string;
  billDate?: string;
  month: string;
  identifier: string;
  portal?: string;
};


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
  // Additional Electricity Boards
  { test: /best\b.*mumbai|brihanmumbai electric/i, url: 'https://www.bestundertaking.com' },
  { test: /assam power|apdcl\b/i, url: 'https://www.apdcl.org' },
  { test: /chhattisgarh.*power|cspdcl\b/i, url: 'https://www.cspdcl.co.in' },
  { test: /electricity.*chandigarh|chandigarh.*electricity/i, url: 'https://www.chdpr.gov.in' },
  { test: /himachal.*electricity|hpseb|hpsebl/i, url: 'https://www.hpseb.in' },
  { test: /uttarakhand power|upcl\b/i, url: 'https://www.upcl.org' },
  { test: /noida power/i, url: 'https://www.noidapower.com' },
  { test: /goa.*electricity|electricity.*goa/i, url: 'https://www.goaelectricity.gov.in' },
  { test: /puducherry.*electricity|electricity.*puducherry/i, url: 'https://electricity.py.gov.in' },
  { test: /tp.*ajmer|tpadl\b/i, url: 'https://www.tatapower-ddl.com' },
  { test: /tp.*central.*odisha|tpcodl\b/i, url: 'https://www.tpcodl.in' },
  { test: /tp.*northern.*odisha|tpnodl\b/i, url: 'https://www.tpnodl.in' },
  { test: /tp.*southern.*odisha|tpsodl\b/i, url: 'https://www.tpsodl.in' },
  { test: /tp.*western.*odisha|tpwodl\b/i, url: 'https://www.tpwodl.in' },
  { test: /tp.*renewables.*microgrid/i, url: 'https://www.tatapower.com' },
  { test: /tripura electricity|tsecl\b/i, url: 'https://www.tsecl.in' },
  { test: /manipur.*power|mspdcl\b/i, url: 'https://www.mspdcl.com' },
  { test: /meghalaya.*power|mepdcl\b/i, url: 'https://www.mepdcl.com' },
  { test: /mizoram.*power|power.*mizoram/i, url: 'https://powerdept.mizoram.gov.in' },
  { test: /nagaland.*power|department.*power.*nagaland/i, url: 'https://www.dpnagaland.nic.in' },
  { test: /arunachal.*power|department.*power.*arunachal/i, url: 'https://www.apseb.in' },
  { test: /sikkim.*power/i, url: 'https://www.sikkimpower.org' },
  { test: /jammu power|jpdcl\b/i, url: 'https://www.jpdcl.co.in' },
  { test: /kashmir power|kpdcl\b/i, url: 'https://www.kpdcl.org.in' },
  { test: /ladakh.*power|lpdd\b/i, url: 'https://www.ladakhpower.gov.in' },
  { test: /lakshadweep.*electricity/i, url: 'https://lakshadweep.gov.in' },
  { test: /dadra.*nagar.*haveli.*power|dnhpdcl\b/i, url: 'https://www.dnhpdcl.gov.in' },
  { test: /bikaner electricity|bkesl\b/i, url: 'https://energy.rajasthan.gov.in' },
  { test: /kota electricity|kedl\b/i, url: 'https://www.kedl.in' },
  { test: /aeml\b.*seepz|aeml seepz/i, url: 'https://www.adanielectricity.com' },
  { test: /india power.*corporation|ipcl\b/i, url: 'https://www.indiapower.com' },
  { test: /ttd.*electricity|tirumala.*tirupati/i, url: 'https://www.tirumala.org' },
  { test: /gift power/i, url: 'https://www.giftpower.in' },
  { test: /vaghani energy/i, url: 'https://www.vaghanienergy.com' },
  { test: /kinesco power/i, url: 'https://www.kinesco.co.in' },
  { test: /tata steel.*uisl|uisl\b/i, url: 'https://www.tatasteel.com' },
  { test: /thrissur.*electricity/i, url: 'https://www.thrissur.gov.in' },
  { test: /co.?operative electric.*sircilla/i, url: 'https://sircillacoopelectric.in' },
  { test: /kanan devan hills/i, url: 'https://www.kdhp.co.in' },
  { test: /west bengal electricity/i, url: 'https://www.wbsedcl.in' },
  { test: /durgapur projects/i, url: 'https://www.dpl.org.in' },
  { test: /aniidco|andaman.*nicobar.*integrated/i, url: 'https://www.aniidco.nic.in' },
  { test: /torrent power surat/i, url: 'https://www.torrentpower.com' },
  { test: /torrent power bhiwandi/i, url: 'https://www.torrentpower.com' },
  { test: /jamshedpur utilities|jusco\b/i, url: 'https://www.juscoservices.com' },
  { test: /pvvnl|paschimanchal vidyut/i, url: 'https://www.pvvnl.org' },
  { test: /dvvnl|dakshinanchal vidyut/i, url: 'https://www.dvvnl.org' },
  { test: /mvvnl|madhyanchal vidyut/i, url: 'https://www.mvvnl.org' },
  { test: /puvvnl|purvanchal vidyut/i, url: 'https://www.puvvnl.gov.in' },
  { test: /kesco|kanpur electricity supply/i, url: 'https://www.kesco.co.in' },
  // EV Recharge
  { test: /charge mod/i, url: 'https://www.chargemod.com' },
  { test: /tata power ev charging/i, url: 'https://www.tatapower-ev.com' },
  { test: /zeon electric/i, url: 'https://www.zeon.in' },

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
  
  // Credit Cards — bank-specific portals (before generic bank/finance rules)
  { test: /sbi card/i, url: 'https://www.sbicard.com/online/portal' },
  { test: /hdfc.*credit card|hdfc.*pixel/i, url: 'https://www.hdfcbank.com/credit-cards/payment' },
  { test: /icici.*credit card/i, url: 'https://www.icicibank.com/credit-card/payment' },
  { test: /axis.*credit card/i, url: 'https://www.axisbank.com/credit-cards/payments' },
  { test: /kotak.*credit card/i, url: 'https://www.kotak.com/credit-card-bill-payments' },
  { test: /idfc first.*credit card/i, url: 'https://www.idfcfirstbank.com/credit-card-payment' },
  { test: /indusind.*credit card/i, url: 'https://www.indusind.com/credit-card-bill-payment' },
  { test: /yes bank.*credit card/i, url: 'https://www.yesbank.in/credit-card-services' },
  { test: /rbl.*credit card/i, url: 'https://www.rblbank.com/credit-cards' },
  { test: /au bank.*credit card/i, url: 'https://www.aubank.in/credit-cards' },
  { test: /bandhan.*credit card/i, url: 'https://www.bandhanbank.com/credit-card-payment' },
  { test: /federal bank.*credit card/i, url: 'https://www.federalbank.co.in/credit-cards' },
  { test: /hsbc.*credit card/i, url: 'https://www.hsbc.co.in/credit-cards' },
  { test: /dbs.*credit card/i, url: 'https://www.dbs.com/in/credit-cards' },
  { test: /canara.*credit card/i, url: 'https://www.canarabank.com/credit-card-payments' },
  { test: /bank of india.*credit card/i, url: 'https://www.bankofindia.co.in/credit-card-payment' },
  { test: /bob.*credit card|bobcard/i, url: 'https://www.bobcard.co.in/payment' },
  { test: /union bank.*credit card/i, url: 'https://www.unionbankofindia.co.in/credit-card-payment' },
  { test: /punjab national bank.*credit card/i, url: 'https://www.pnbindia.in/credit-card-payment' },
  { test: /idbi.*credit card/i, url: 'https://www.idbibank.in/credit-card-payment' },
  { test: /iob.*credit card/i, url: 'https://www.iob.in/credit-cards' },
  { test: /indian bank.*credit card/i, url: 'https://www.indianbank.in/credit-card-payment' },
  { test: /cub.*credit card|city union.*credit card/i, url: 'https://www.cityunionbank.com/credit-card-payment' },
  { test: /dcb.*credit card/i, url: 'https://www.dcbbank.com/credit-cards' },
  { test: /esaf.*credit card/i, url: 'https://www.esafbank.com/credit-cards' },
  { test: /edge csb|csb.*credit card/i, url: 'https://www.csb.co.in/credit-card-payment' },
  { test: /dhanlaxmi.*credit card/i, url: 'https://www.dhanbank.com/credit-cards' },
  { test: /south indian bank.*credit card/i, url: 'https://www.southindianbank.com/credit-card-payment' },
  { test: /saraswat.*credit card/i, url: 'https://www.saraswatbank.com/credit-card-payment' },
  { test: /tamilnad mercantile.*credit card/i, url: 'https://www.tmbank.in/credit-cards' },
  { test: /suryoday.*credit card/i, url: 'https://www.suryodaybank.com/credit-card-payment' },
  { test: /sbm.*credit card/i, url: 'https://www.sbmbank.co.in/credit-cards' },

  // Generic bank rules kept last so they do not override credit-card-specific links
  { test: /sbi|state bank|bank/i, url: 'https://www.sbi.co.in' },
  { test: /hdfc|icici|axis|hdbank/i, url: 'https://www.bharatbillpay.com' },

  // Gas & LPG
  { test: /igl|indraprastha gas/i, url: 'https://www.iglonline.net' },
  { test: /mahanagar gas|mgl\b/i, url: 'https://www.mahanagargas.com' },
  { test: /gujarat gas/i, url: 'https://www.gujaratgas.com' },
  { test: /gail gas/i, url: 'https://www.gailgasltd.com' },
  { test: /gail india|gail limited/i, url: 'https://www.gail.nic.in' },
  { test: /adani total gas/i, url: 'https://www.adanitotalgas.in' },
  { test: /maharashtra natural gas|mngl\b/i, url: 'https://www.mngl.co.in' },
  { test: /sabarmati gas/i, url: 'https://www.sabarmatigas.com' },
  { test: /torrent gas/i, url: 'https://www.torrentgas.com' },
  { test: /aavantika gas/i, url: 'https://www.aavantikagas.com' },
  { test: /assam gas/i, url: 'https://www.assamgas.org' },
  { test: /bengal gas/i, url: 'https://www.bengalgas.co.in' },
  { test: /bhagyanagar gas/i, url: 'https://www.bhagyanagargas.com' },
  { test: /bharat petroleum.*png|bpcl.*png/i, url: 'https://www.bharatgas.com' },
  { test: /central u\.?p\.? gas/i, url: 'https://www.cugasl.com' },
  { test: /charotar gas/i, url: 'https://www.charotargas.co.in' },
  { test: /goa natural gas/i, url: 'https://www.goanaturalgas.com' },
  { test: /godavari gas/i, url: 'https://www.godavarigas.com' },
  { test: /green gas/i, url: 'https://www.greengas.net.in' },
  { test: /hp oil gas/i, url: 'https://www.hpoilgas.com' },
  { test: /hpr falcon gas/i, url: 'https://www.hprfalcongas.com' },
  { test: /haridwar natural gas/i, url: 'https://www.haridwarnaturalgas.com' },
  { test: /haryana city gas/i, url: 'https://www.hcgdl.co.in' },
  { test: /hindustan petroleum.*piped|hpcl.*piped/i, url: 'https://www.hindustanpetroleum.com' },
  { test: /irm energy/i, url: 'https://www.irmenergy.com' },
  { test: /indian oil.*piped|iocl.*piped/i, url: 'https://www.iocl.com' },
  { test: /indian oil.?adani gas/i, url: 'https://www.ioagpl.com' },
  { test: /agp cgd|agp city gas/i, url: 'https://www.agpcgd.com' },
  { test: /megha gas/i, url: 'https://www.meghagas.com' },
  { test: /naveriya gas/i, url: 'https://www.naveriyagas.com' },
  { test: /purba bharati gas/i, url: 'https://www.purbabharatigas.co.in' },
  { test: /rajasthan state gas/i, url: 'https://www.rsgl.co.in' },
  { test: /think gas/i, url: 'https://www.thinkgas.in' },
  { test: /tripura natural gas/i, url: 'https://www.tngl.in' },
  { test: /unique central piped|ucpgpl\b/i, url: 'https://www.ucpgpl.com' },
  { test: /vadodara gas/i, url: 'https://www.vgl.co.in' },
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
      return `Rs. ${amount}/- is the electricity bill for Consumer No. ${identifier}. If paid by ${earlyDateStr} pay only Rs. ${earlyAmt}/- (early payment discount). Due Date: ${dueDate}. Pay online at wss.mahadiscom.in or scan UPI QR on your physical bill. -${billerName}`;
    },
  },
  {
    test: (n) => /uppcl|uttar pradesh power/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `Dear Consumer, electricity bill for Account No. ${identifier} for ${month} is Rs. ${amount}/-. Due Date: ${dueDate}. Pay online at uppclonline.com, BBPS, or nearest Jan Suvidha/Mitra centre. -${billerName}`,
  },

  // UP Distribution Companies — Account No., uppclonline.com payment portal
  {
    test: (n) => /pvvnl|paschimanchal vidyut/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `Dear Consumer, ${billerName} electricity bill for Account No. ${identifier} for ${month} is Rs. ${amount}/-. Due Date: ${dueDate}. Pay online at pvvnl.org or uppclonline.com / BBPS to avoid disconnection. -PVVNL`,
  },
  {
    test: (n) => /dvvnl|dakshinanchal vidyut/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `Dear Consumer, ${billerName} electricity bill for Account No. ${identifier} for ${month} is Rs. ${amount}/-. Due Date: ${dueDate}. Pay online at dvvnl.org or uppclonline.com / BBPS to avoid disconnection. -DVVNL`,
  },
  {
    test: (n) => /mvvnl|madhyanchal vidyut/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `Dear Consumer, ${billerName} electricity bill for Account No. ${identifier} for ${month} is Rs. ${amount}/-. Due Date: ${dueDate}. Pay online at mvvnl.org or uppclonline.com / BBPS to avoid disconnection. -MVVNL`,
  },
  {
    test: (n) => /puvvnl|purvanchal vidyut/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `Dear Consumer, ${billerName} electricity bill for Account No. ${identifier} for ${month} is Rs. ${amount}/-. Due Date: ${dueDate}. Pay online at puvvnl.gov.in or uppclonline.com / BBPS to avoid disconnection. -PuVVNL`,
  },
  {
    test: (n) => /kesco|kanpur electricity supply/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `Dear Consumer, ${billerName} electricity bill for Account No. ${identifier} for ${month} is Rs. ${amount}/-. Due Date: ${dueDate}. Pay online at kesco.co.in or BBPS to avoid disconnection. -KESCO`,
  },
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
  {
    test: (n) => /jamshedpur utilities|jusco\b/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `${billerName} bill for BP No. ${identifier} for ${month} is Rs. ${amount}/-. Due Date: ${dueDate}. Pay via juscoservices.com or BBPS. -JUSCO`,
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

  // Torrent Power — prompt pay concession phrasing (specific regions before generic)
  {
    test: (n) => /torrent power surat/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `Rs. ${amount}/- is due for ${billerName} Consumer No. ${identifier} against ${month}. Due: ${dueDate}. Pay at torrentpower.com to avail prompt payment concession. -Torrent Power Surat`,
  },
  {
    test: (n) => /torrent power bhiwandi/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `Rs. ${amount}/- is due for ${billerName} Consumer No. ${identifier} against ${month}. Due: ${dueDate}. Pay at torrentpower.com to avail prompt payment concession. -Torrent Power Bhiwandi`,
  },
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

  // West Bengal Electricity (WBSEDCL) — Consumer ID WB + 9 digits
  {
    test: (n) => /wbsedcl|west bengal.*electricity/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `Dear Consumer, your ${billerName} electricity bill for Consumer ID ${identifier} for ${month} is Rs. ${amount}/-. Due Date: ${dueDate}. Pay at wbsedcl.in, Jibika kiosks, or BBPS to avoid disconnection. -WBSEDCL`,
  },
  {
    test: (n) => /durgapur projects/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `${billerName} electricity bill for Consumer No. ${identifier} for ${month} is Rs. ${amount}/-. Due Date: ${dueDate}. Pay at dpl.org.in or BBPS. -DPL`,
  },

  // BEST Mumbai — 6-digit Consumer No.
  {
    test: (n) => /best\b.*mumbai|brihanmumbai electric/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `Your ${billerName} electricity bill for Consumer No. ${identifier} for ${month} is Rs. ${amount}/-. Pay before ${dueDate} at bestundertaking.com or nearest BEST cash office / BBPS. -BEST`,
  },

  // Andhra Pradesh remaining boards — IVRS No.
  {
    test: (n) => /apepdcl/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `Dear Consumer, ${billerName} electricity bill for IVRS No. ${identifier} for ${month} is Rs. ${amount}/-. Due Date: ${dueDate}. Pay at apepdcl.in or nearest AP Seva / BBPS. -APEPDCL`,
  },
  {
    test: (n) => /apspdcl/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `Dear Consumer, ${billerName} electricity bill for IVRS No. ${identifier} for ${month} is Rs. ${amount}/-. Due Date: ${dueDate}. Pay at apspdcl.in or nearest AP Seva / BBPS. -APSPDCL`,
  },

  // Assam Power Distribution
  {
    test: (n) => /assam power|apdcl\b/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `Dear Consumer, ${billerName} electricity bill for Consumer No. ${identifier} for ${month} is Rs. ${amount}/-. Due Date: ${dueDate}. Pay at apdcl.org or BBPS / CSC to avoid disconnection. -APDCL`,
  },

  // Chhattisgarh State Power
  {
    test: (n) => /chhattisgarh.*power|cspdcl\b/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `Dear Consumer, ${billerName} electricity bill for Consumer No. ${identifier} for ${month} is Rs. ${amount}/-. Due Date: ${dueDate}. Pay at cspdcl.co.in or nearest BBPS / CSC outlet. -CSPDCL`,
  },

  // Chandigarh Electricity
  {
    test: (n) => /electricity.*chandigarh|chandigarh.*electricity/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `Dear Consumer, ${billerName} electricity bill for Account No. ${identifier} for ${month} is Rs. ${amount}/-. Due Date: ${dueDate}. Pay at chdpr.gov.in or BBPS. -Chandigarh Electricity`,
  },

  // Himachal Pradesh State Electricity Board
  {
    test: (n) => /himachal.*electricity|hpseb|hpsebl/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `Dear Consumer, ${billerName} electricity bill for Consumer No. ${identifier} for ${month} is Rs. ${amount}/-. Due Date: ${dueDate}. Pay at hpseb.in or nearest HPSEB collection centre / BBPS. -HPSEB`,
  },

  // Uttarakhand Power Corporation
  {
    test: (n) => /uttarakhand power|upcl\b/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `Dear Consumer, ${billerName} electricity bill for Consumer No. ${identifier} for ${month} is Rs. ${amount}/-. Due Date: ${dueDate}. Pay at upcl.org or BBPS / nearest collection centre. -UPCL`,
  },

  // Noida Power
  {
    test: (n) => /noida power/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `Your ${billerName} electricity bill for Consumer No. ${identifier} for ${month} is Rs. ${amount}/-. Due Date: ${dueDate}. Pay at noidapower.com or via BBPS to avoid late payment surcharge. -NPCL`,
  },

  // Goa Electricity Department
  {
    test: (n) => /goa.*electricity|electricity.*goa/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `Dear Consumer, ${billerName} electricity bill for Consumer No. ${identifier} for ${month} is Rs. ${amount}/-. Due Date: ${dueDate}. Pay at goaelectricity.gov.in or nearest BBPS outlet. -Goa Electricity`,
  },

  // Government of Puducherry Electricity Department
  {
    test: (n) => /puducherry.*electricity|electricity.*puducherry/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `Dear Consumer, ${billerName} electricity bill for Service No. ${identifier} for ${month} is Rs. ${amount}/-. Due Date: ${dueDate}. Pay at electricity.py.gov.in or nearest BBPS centre. -Puducherry Electricity`,
  },

  // TP Ajmer Distribution Ltd
  {
    test: (n) => /tp.*ajmer|tpadl\b/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `Dear Consumer, ${billerName} electricity bill for Consumer No. ${identifier} for ${month} is Rs. ${amount}/-. Due Date: ${dueDate}. Pay at tatapower-ddl.com or BBPS. -TPADL`,
  },

  // TP Odisha Distribution companies
  {
    test: (n) => /tp.*central.*odisha|tpcodl\b/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `Dear Consumer, ${billerName} electricity bill for BP No. ${identifier} for ${month} is Rs. ${amount}/-. Due Date: ${dueDate}. Pay at tpcodl.in or BBPS / CSC to avoid disconnection. -TPCODL`,
  },
  {
    test: (n) => /tp.*northern.*odisha|tpnodl\b/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `Dear Consumer, ${billerName} electricity bill for BP No. ${identifier} for ${month} is Rs. ${amount}/-. Due Date: ${dueDate}. Pay at tpnodl.in or BBPS / CSC. -TPNODL`,
  },
  {
    test: (n) => /tp.*southern.*odisha|tpsodl\b/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `Dear Consumer, ${billerName} electricity bill for BP No. ${identifier} for ${month} is Rs. ${amount}/-. Due Date: ${dueDate}. Pay at tpsodl.in or BBPS / CSC. -TPSODL`,
  },
  {
    test: (n) => /tp.*western.*odisha|tpwodl\b/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `Dear Consumer, ${billerName} electricity bill for BP No. ${identifier} for ${month} is Rs. ${amount}/-. Due Date: ${dueDate}. Pay at tpwodl.in or BBPS. -TPWODL`,
  },
  {
    test: (n) => /tp.*renewables.*microgrid/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `${billerName}: Account No. ${identifier} energy bill for ${month} is Rs. ${amount}/-. Due Date: ${dueDate}. Pay via tatapower.com or BBPS. -Tata Power`,
  },

  // Tripura Electricity
  {
    test: (n) => /tripura electricity|tsecl\b/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `Dear Consumer, ${billerName} electricity bill for Consumer No. ${identifier} for ${month} is Rs. ${amount}/-. Due Date: ${dueDate}. Pay at tsecl.in or nearest BBPS / CSC outlet. -TSECL`,
  },

  // Manipur State Power Distribution
  {
    test: (n) => /manipur.*power|mspdcl\b/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `Dear Consumer, ${billerName} electricity bill for Consumer No. ${identifier} for ${month} is Rs. ${amount}/-. Due Date: ${dueDate}. Pay at mspdcl.com or nearest BBPS outlet. -MSPDCL`,
  },

  // Meghalaya Power Distribution
  {
    test: (n) => /meghalaya.*power|mepdcl\b/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `Dear Consumer, ${billerName} electricity bill for Consumer No. ${identifier} for ${month} is Rs. ${amount}/-. Due Date: ${dueDate}. Pay at mepdcl.com or BBPS. -MePDCL`,
  },

  // Mizoram Power
  {
    test: (n) => /mizoram.*power|power.*mizoram/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `Dear Consumer, ${billerName} electricity bill for Consumer No. ${identifier} for ${month} is Rs. ${amount}/-. Due Date: ${dueDate}. Pay at powerdept.mizoram.gov.in or BBPS. -Mizoram Power`,
  },

  // Nagaland Power
  {
    test: (n) => /nagaland.*power|department.*power.*nagaland/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `Dear Consumer, ${billerName} electricity bill for Consumer No. ${identifier} for ${month} is Rs. ${amount}/-. Due Date: ${dueDate}. Pay at dpnagaland.nic.in or nearest BBPS centre. -Nagaland Power`,
  },

  // Arunachal Pradesh Power
  {
    test: (n) => /arunachal.*power|department.*power.*arunachal/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `Dear Consumer, ${billerName} electricity bill for Consumer No. ${identifier} for ${month} is Rs. ${amount}/-. Due Date: ${dueDate}. Pay at apseb.in or nearest BBPS outlet. -APSEB`,
  },

  // Sikkim Power
  {
    test: (n) => /sikkim.*power/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `Dear Consumer, ${billerName} electricity bill for Consumer No. ${identifier} for ${month} is Rs. ${amount}/-. Due Date: ${dueDate}. Pay at sikkimpower.org or BBPS. -Sikkim Power`,
  },

  // Jammu Power Distribution Corporation
  {
    test: (n) => /jammu power|jpdcl\b/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `Dear Consumer, ${billerName} electricity bill for Consumer No. ${identifier} for ${month} is Rs. ${amount}/-. Due Date: ${dueDate}. Pay at jpdcl.co.in or nearest BBPS / J&K Bank counter. -JPDCL`,
  },

  // Kashmir Power Distribution Corporation
  {
    test: (n) => /kashmir power|kpdcl\b/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `Dear Consumer, ${billerName} electricity bill for Consumer No. ${identifier} for ${month} is Rs. ${amount}/-. Due Date: ${dueDate}. Pay at kpdcl.org.in or nearest BBPS / J&K Bank counter. -KPDCL`,
  },

  // Ladakh Power
  {
    test: (n) => /ladakh.*power|lpdd\b/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `Dear Consumer, ${billerName} electricity bill for Consumer No. ${identifier} for ${month} is Rs. ${amount}/-. Due Date: ${dueDate}. Pay at ladakhpower.gov.in or nearest BBPS outlet. -LPDD`,
  },

  // Lakshadweep Electricity
  {
    test: (n) => /lakshadweep.*electricity/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `Dear Consumer, ${billerName} electricity bill for Consumer No. ${identifier} for ${month} is Rs. ${amount}/-. Due Date: ${dueDate}. Please pay at the nearest Electricity Department office or BBPS. -Lakshadweep Electricity`,
  },

  // Andaman & Nicobar Islands (ANIIDCO)
  {
    test: (n) => /aniidco|andaman.*nicobar.*integrated/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `Dear Consumer, ${billerName} electricity bill for Consumer No. ${identifier} for ${month} is Rs. ${amount}/-. Due Date: ${dueDate}. Pay at aniidco.nic.in or nearest BBPS outlet. -ANIIDCO`,
  },

  // Dadra and Nagar Haveli Power
  {
    test: (n) => /dadra.*nagar.*haveli.*power|dnhpdcl\b/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `Dear Consumer, ${billerName} electricity bill for Consumer No. ${identifier} for ${month} is Rs. ${amount}/-. Due Date: ${dueDate}. Pay at dnhpdcl.gov.in or BBPS. -DNHPDCL`,
  },

  // Rajasthan additional boards
  {
    test: (n) => /bikaner electricity|bkesl\b/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `Your ${billerName} electricity bill for Consumer No. ${identifier} for ${month} is Rs. ${amount}/-. Due Date: ${dueDate}. Pay at energy.rajasthan.gov.in or BBPS. -BkESL`,
  },
  {
    test: (n) => /kota electricity|kedl\b/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `Your ${billerName} electricity bill for Account No. ${identifier} for ${month} is Rs. ${amount}/-. Due Date: ${dueDate}. Pay at kedl.in or energy.rajasthan.gov.in / BBPS. -KEDL`,
  },

  // AEML SEEPZ (Adani, special zone)
  {
    test: (n) => /aeml\b.*seepz|aeml seepz/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `${billerName}: Electricity bill for Consumer No. ${identifier} for ${month} is Rs. ${amount}/-. Due Date: ${dueDate}. Pay at adanielectricity.com or BBPS. -AEML`,
  },

  // India Power Corporation
  {
    test: (n) => /india power.*corporation|ipcl\b/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `Dear Consumer, ${billerName} electricity bill for Consumer No. ${identifier} for ${month} is Rs. ${amount}/-. Due Date: ${dueDate}. Pay at indiapower.com or BBPS. -India Power`,
  },

  // TTD Electricity
  {
    test: (n) => /ttd.*electricity|tirumala.*tirupati/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `${billerName}: Electricity bill for Consumer No. ${identifier} for ${month} is Rs. ${amount}/-. Due Date: ${dueDate}. Pay at tirumala.org or BBPS. -TTD`,
  },

  // Specialty / private utilities
  {
    test: (n) => /gift power/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `${billerName}: Electricity bill for Consumer No. ${identifier} for ${month} is Rs. ${amount}/-. Due Date: ${dueDate}. Pay at giftpower.in or BBPS. -Gift Power`,
  },
  {
    test: (n) => /vaghani energy/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `${billerName}: Electricity bill for Consumer No. ${identifier} for ${month} is Rs. ${amount}/-. Due Date: ${dueDate}. Pay at vaghanienergy.com or BBPS. -Vaghani Energy`,
  },
  {
    test: (n) => /kinesco power/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `${billerName}: Electricity bill for Consumer No. ${identifier} for ${month} is Rs. ${amount}/-. Due Date: ${dueDate}. Pay at kinesco.co.in or BBPS. -Kinesco`,
  },
  {
    test: (n) => /tata steel.*uisl|uisl\b/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `${billerName}: Electricity bill for Consumer No. ${identifier} for ${month} is Rs. ${amount}/-. Due Date: ${dueDate}. Contact your local collection centre for payment. -Tata Steel UISL`,
  },
  {
    test: (n) => /thrissur.*electricity/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `Dear Consumer, ${billerName} electricity bill for Consumer No. ${identifier} for ${month} is Rs. ${amount}/-. Due Date: ${dueDate}. Pay at thrissur.gov.in or KSEB-affiliated counters / BBPS. -Thrissur Corp`,
  },
  {
    test: (n) => /co.?operative electric.*sircilla/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `Dear Consumer, ${billerName} electricity bill for Consumer No. ${identifier} for ${month} is Rs. ${amount}/-. Due Date: ${dueDate}. Pay at the Society office or BBPS. -Sircilla CESS`,
  },
  {
    test: (n) => /kanan devan hills/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `${billerName}: Electricity bill for Consumer No. ${identifier} for ${month} is Rs. ${amount}/-. Due Date: ${dueDate}. Contact your estate office or nearest KSEB counter for payment. -KDHP`,
  },
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
    test: (n) => /charge mod/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, portal }) =>
      portal
        ? `${billerName}: EV charging wallet recharge of Rs. ${amount} due for Account No. ${identifier} by ${dueDate}. Recharge at ${portal} or BBPS. -Charge MOD`
        : `${billerName}: EV charging wallet recharge of Rs. ${amount} due for Account No. ${identifier} by ${dueDate}. Use the Charge MOD app or BBPS to recharge. -Charge MOD`,
  },
  {
    test: (n) => /tata power ev charging/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, portal }) =>
      portal
        ? `${billerName}: EV charging account No. ${identifier} requires recharge of Rs. ${amount} by ${dueDate}. Recharge at ${portal} or BBPS. -Tata Power EV`
        : `${billerName}: EV charging account No. ${identifier} requires recharge of Rs. ${amount} by ${dueDate}. Visit tatapower-ev.com or BBPS to recharge. -Tata Power EV`,
  },
  {
    test: (n) => /zeon electric/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, portal }) =>
      portal
        ? `${billerName}: EV charging account No. ${identifier} needs recharge of Rs. ${amount} by ${dueDate}. Recharge at ${portal} or BBPS. -Zeon Electric`
        : `${billerName}: EV charging account No. ${identifier} needs recharge of Rs. ${amount} by ${dueDate}. Visit zeon.in or BBPS to recharge. -Zeon Electric`,
  },

  // Gas boards
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
    test: (n) => /maharashtra natural gas|mngl\b/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `Dear ${billerName} Customer, gas bill for Consumer No. ${identifier} for ${month} is Rs. ${amount}/-. Due Date: ${dueDate}. Pay at mngl.co.in or BBPS / MNGL app. -MNGL`,
  },
  {
    test: (n) => /sabarmati gas/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `Your ${billerName} gas bill for Customer No. ${identifier} for ${month} is Rs. ${amount}/-. Due: ${dueDate}. Pay at sabarmatigas.com or BBPS. -Sabarmati Gas`,
  },
  {
    test: (n) => /torrent gas/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `Your ${billerName} gas bill for Customer No. ${identifier} for ${month} is Rs. ${amount}/-. Due: ${dueDate}. Pay at torrentgas.com or BBPS to avoid supply disruption. -Torrent Gas`,
  },
  {
    test: (n) => /aavantika gas/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `Dear ${billerName} Customer, gas bill for Consumer No. ${identifier} for ${month} is Rs. ${amount}/-. Due Date: ${dueDate}. Pay at aavantikagas.com or BBPS. -Aavantika Gas`,
  },
  {
    test: (n) => /assam gas/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `Dear ${billerName} Customer, gas bill for Consumer No. ${identifier} for ${month} is Rs. ${amount}/-. Due Date: ${dueDate}. Pay at assamgas.org or BBPS. -Assam Gas`,
  },
  {
    test: (n) => /bengal gas/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `Your ${billerName} gas bill for Consumer No. ${identifier} for ${month} is Rs. ${amount}/-. Due: ${dueDate}. Pay at bengalgas.co.in or BBPS. -Bengal Gas`,
  },
  {
    test: (n) => /bhagyanagar gas/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `Dear ${billerName} Customer, gas bill for BP No. ${identifier} for ${month} is Rs. ${amount}/-. Due Date: ${dueDate}. Pay at bhagyanagargas.com or BBPS / nearest outlet. -BGL`,
  },
  {
    test: (n) => /bharat petroleum.*png|bpcl.*png/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `${billerName}: Monthly gas invoice for Consumer No. ${identifier} for ${month} is Rs. ${amount}/-. Due Date: ${dueDate}. Pay at bharatgas.com or BBPS. -BPCL PNG`,
  },
  {
    test: (n) => /central u\.?p\.? gas/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `Dear ${billerName} Customer, gas bill for Consumer No. ${identifier} for ${month} is Rs. ${amount}/-. Due Date: ${dueDate}. Pay at cugasl.com or BBPS. -CUGL`,
  },
  {
    test: (n) => /charotar gas/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `Your ${billerName} gas bill for Customer No. ${identifier} for ${month} is Rs. ${amount}/-. Due: ${dueDate}. Pay at charotargas.co.in or BBPS. -Charotar Gas`,
  },
  {
    test: (n) => /gail india|gail limited/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `Dear ${billerName} Customer, gas bill for Consumer No. ${identifier} for ${month} is Rs. ${amount}/-. Due Date: ${dueDate}. Pay at gail.nic.in or BBPS. -GAIL`,
  },
  {
    test: (n) => /goa natural gas/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `${billerName}: Gas bill for Consumer No. ${identifier} for ${month} is Rs. ${amount}/-. Due: ${dueDate}. Pay at goanaturalgas.com or BBPS. -Goa Natural Gas`,
  },
  {
    test: (n) => /godavari gas/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `Dear ${billerName} Customer, gas bill for Consumer No. ${identifier} for ${month} is Rs. ${amount}/-. Due Date: ${dueDate}. Pay at godavarigas.com or BBPS. -Godavari Gas`,
  },
  {
    test: (n) => /green gas/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `Your ${billerName} gas bill for Consumer No. ${identifier} for ${month} is Rs. ${amount}/-. Due: ${dueDate}. Pay at greengas.net.in or BBPS. -Green Gas`,
  },
  {
    test: (n) => /hp oil gas/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `${billerName}: Gas bill for Customer No. ${identifier} for ${month} is Rs. ${amount}/-. Due: ${dueDate}. Pay at hpoilgas.com or BBPS. -HP Oil Gas`,
  },
  {
    test: (n) => /hpr falcon gas/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `${billerName}: Gas bill for Consumer No. ${identifier} for ${month} is Rs. ${amount}/-. Due: ${dueDate}. Pay at hprfalcongas.com or BBPS. -HPR Falcon Gas`,
  },
  {
    test: (n) => /haridwar natural gas/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `Dear ${billerName} Customer, gas bill for Consumer No. ${identifier} for ${month} is Rs. ${amount}/-. Due Date: ${dueDate}. Pay at haridwarnaturalgas.com or BBPS. -HNGPL`,
  },
  {
    test: (n) => /haryana city gas/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `Dear ${billerName} Customer, gas bill for BP No. ${identifier} for ${month} is Rs. ${amount}/-. Due Date: ${dueDate}. Pay at hcgdl.co.in or BBPS. -Haryana City Gas`,
  },
  {
    test: (n) => /hindustan petroleum.*piped|hpcl.*piped/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `${billerName}: Monthly gas invoice for Consumer No. ${identifier} for ${month} is Rs. ${amount}/-. Due Date: ${dueDate}. Pay at hindustanpetroleum.com or BBPS. -HPCL PNG`,
  },
  {
    test: (n) => /irm energy/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `${billerName}: Gas bill for Consumer No. ${identifier} for ${month} is Rs. ${amount}/-. Due: ${dueDate}. Pay at irmenergy.com or BBPS. -IRM Energy`,
  },
  {
    test: (n) => /indian oil.*piped|iocl.*piped/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `${billerName}: Monthly gas invoice for Consumer No. ${identifier} for ${month} is Rs. ${amount}/-. Due Date: ${dueDate}. Pay at iocl.com or BBPS. -IOCL PNG`,
  },
  {
    test: (n) => /indian oil.?adani gas/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `${billerName}: Gas bill for Consumer No. ${identifier} for ${month} is Rs. ${amount}/-. Due: ${dueDate}. Pay at ioagpl.com or BBPS. -IO-Adani Gas`,
  },
  {
    test: (n) => /agp cgd|agp city gas/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `${billerName}: Gas bill for Consumer No. ${identifier} for ${month} is Rs. ${amount}/-. Due: ${dueDate}. Pay at agpcgd.com or BBPS. -AGP Gas`,
  },
  {
    test: (n) => /megha gas/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `${billerName}: Gas bill for Consumer No. ${identifier} for ${month} is Rs. ${amount}/-. Due: ${dueDate}. Pay at meghagas.com or BBPS. -Megha Gas`,
  },
  {
    test: (n) => /naveriya gas/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `${billerName}: Gas bill for Consumer No. ${identifier} for ${month} is Rs. ${amount}/-. Due: ${dueDate}. Pay at naveriyagas.com or BBPS. -Naveriya Gas`,
  },
  {
    test: (n) => /purba bharati gas/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `${billerName}: Gas bill for Consumer No. ${identifier} for ${month} is Rs. ${amount}/-. Due: ${dueDate}. Pay at purbabharatigas.co.in or BBPS. -Purba Bharati Gas`,
  },
  {
    test: (n) => /rajasthan state gas/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `Dear ${billerName} Customer, gas bill for Consumer No. ${identifier} for ${month} is Rs. ${amount}/-. Due Date: ${dueDate}. Pay at rsgl.co.in or BBPS. -RSGL`,
  },
  {
    test: (n) => /think gas/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `${billerName}: Gas bill for Consumer No. ${identifier} for ${month} is Rs. ${amount}/-. Due: ${dueDate}. Pay at thinkgas.in or BBPS. -Think Gas`,
  },
  {
    test: (n) => /tripura natural gas/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `Dear ${billerName} Customer, gas bill for Consumer No. ${identifier} for ${month} is Rs. ${amount}/-. Due Date: ${dueDate}. Pay at tngl.in or nearest BBPS outlet. -TNGL`,
  },
  {
    test: (n) => /unique central piped|ucpgpl\b/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `${billerName}: Gas bill for Consumer No. ${identifier} for ${month} is Rs. ${amount}/-. Due: ${dueDate}. Pay at ucpgpl.com or BBPS. -UCPGPL`,
  },
  {
    test: (n) => /vadodara gas/i.test(n),
    buildSms: ({ billerName, identifier, amount, dueDate, month }) =>
      `Your ${billerName} gas bill for Customer No. ${identifier} for ${month} is Rs. ${amount}/-. Due: ${dueDate}. Pay at vgl.co.in or BBPS. -VGL`,
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
    test: (n) => /sbi card/i.test(n),
    buildSms: ({ identifier, amount, dueDate }) =>
      `Dear SBI Card holder, your statement is generated. Card ending ${identifier.slice(-4)} Total Amount Due: Rs. ${amount}/-. Please pay on or before ${dueDate} to avoid late payment charges. Pay at sbicard.com or YONO app. -SBI Card`,
  },
  {
    test: (n) => /hdfc.*credit card|hdfc.*pixel/i.test(n),
    buildSms: ({ identifier, amount, dueDate }) =>
      `Dear HDFC Bank Credit Card member, statement for Card ending ${identifier.slice(-4)}: Total Amount Due Rs. ${amount}/-. Pay before ${dueDate} via netbanking.hdfcbank.com or PhoneBanking to avoid late fee. -HDFC Bank`,
  },
  {
    test: (n) => /icici.*credit card/i.test(n),
    buildSms: ({ identifier, amount, dueDate }) =>
      `Your ICICI Bank Credit Card (ending ${identifier.slice(-4)}) statement: Total Amount Due Rs. ${amount}/-. Payment Due Date: ${dueDate}. Pay via iMobile Pay, Net Banking or BBPS. -ICICI Bank`,
  },
  {
    test: (n) => /axis.*credit card/i.test(n),
    buildSms: ({ identifier, amount, dueDate }) =>
      `Dear Axis Bank Credit Card holder, your Card ending ${identifier.slice(-4)} has Total Outstanding of Rs. ${amount}/-. Last date for payment: ${dueDate}. Pay via axisbank.com, Axis Mobile or BBPS. -Axis Bank`,
  },
  {
    test: (n) => /kotak.*credit card/i.test(n),
    buildSms: ({ identifier, amount, dueDate }) =>
      `Kotak Credit Card (ending ${identifier.slice(-4)}) statement: Total Due Rs. ${amount}/-. Payment Due Date ${dueDate}. Pay at kotak.com, Kotak app or BBPS. -Kotak Bank`,
  },
  {
    test: (n) => /idfc first.*credit card/i.test(n),
    buildSms: ({ identifier, amount, dueDate }) =>
      `IDFC FIRST Bank Credit Card (ending ${identifier.slice(-4)}) — Statement Amount Due: Rs. ${amount}/-. Please pay by ${dueDate} via idfcfirstbank.com or BBPS. -IDFC FIRST`,
  },
  {
    test: (n) => /indusind.*credit card/i.test(n),
    buildSms: ({ identifier, amount, dueDate }) =>
      `IndusInd Bank Credit Card (ending ${identifier.slice(-4)}): Total Amount Due Rs. ${amount}/-. Pay by ${dueDate} at indusind.com or IndusMobile / BBPS. -IndusInd Bank`,
  },
  {
    test: (n) => /yes bank.*credit card/i.test(n),
    buildSms: ({ identifier, amount, dueDate }) =>
      `YES Bank Credit Card (ending ${identifier.slice(-4)}): Amount Due Rs. ${amount}/-. Due Date ${dueDate}. Pay at yesbank.in or YES PAY / BBPS to avoid interest charges. -YES Bank`,
  },
  {
    test: (n) => /rbl.*credit card/i.test(n),
    buildSms: ({ identifier, amount, dueDate }) =>
      `RBL Bank Credit Card (ending ${identifier.slice(-4)}): Total Amount Due Rs. ${amount}/-. Last date for payment: ${dueDate}. Pay at rblbank.com or BBPS. -RBL Bank`,
  },
  {
    test: (n) => /au bank.*credit card/i.test(n),
    buildSms: ({ identifier, amount, dueDate }) =>
      `AU Bank Credit Card (ending ${identifier.slice(-4)}): Statement Amount Due Rs. ${amount}/-. Pay by ${dueDate} at aubank.in or AU 0to1 app / BBPS. -AU Bank`,
  },
  {
    test: (n) => /bandhan.*credit card/i.test(n),
    buildSms: ({ identifier, amount, dueDate }) =>
      `Bandhan Bank Credit Card (ending ${identifier.slice(-4)}): Amount Due Rs. ${amount}/-. Pay by ${dueDate} at bandhanbank.com or BBPS. -Bandhan Bank`,
  },
  {
    test: (n) => /federal bank.*credit card/i.test(n),
    buildSms: ({ identifier, amount, dueDate }) =>
      `Federal Bank Credit Card (ending ${identifier.slice(-4)}): Total Due Rs. ${amount}/-. Payment Due: ${dueDate}. Pay at federalbank.co.in, FedMobile or BBPS. -Federal Bank`,
  },
  {
    test: (n) => /hsbc.*credit card/i.test(n),
    buildSms: ({ identifier, amount, dueDate }) =>
      `HSBC Credit Card (ending ${identifier.slice(-4)}): Minimum Amount Due or Total Due Rs. ${amount}/-. Pay by ${dueDate} at hsbc.co.in or HSBC India app / BBPS. -HSBC`,
  },
  {
    test: (n) => /dbs.*credit card/i.test(n),
    buildSms: ({ identifier, amount, dueDate }) =>
      `DBS Bank Credit Card (ending ${identifier.slice(-4)}): Statement Amount Due Rs. ${amount}/-. Pay by ${dueDate} at dbs.com/in or digibank app / BBPS. -DBS Bank`,
  },
  {
    test: (n) => /canara.*credit card/i.test(n),
    buildSms: ({ identifier, amount, dueDate }) =>
      `Canara Bank Credit Card (ending ${identifier.slice(-4)}): Total Amount Due Rs. ${amount}/-. Pay by ${dueDate} at canarabank.com or BBPS. -Canara Bank`,
  },
  {
    test: (n) => /bank of india.*credit card/i.test(n),
    buildSms: ({ identifier, amount, dueDate }) =>
      `Bank of India Credit Card (ending ${identifier.slice(-4)}): Amount Due Rs. ${amount}/-. Due Date ${dueDate}. Pay at bankofindia.co.in or BOI Mobile / BBPS. -Bank of India`,
  },
  {
    test: (n) => /bob.*credit card|bobcard/i.test(n),
    buildSms: ({ identifier, amount, dueDate }) =>
      `BoB Credit Card (ending ${identifier.slice(-4)}): Total Due Rs. ${amount}/-. Pay by ${dueDate} at bobcard.co.in or BarodaPay app / BBPS. -Bank of Baroda`,
  },
  {
    test: (n) => /union bank.*credit card/i.test(n),
    buildSms: ({ identifier, amount, dueDate }) =>
      `Union Bank Credit Card (ending ${identifier.slice(-4)}): Amount Due Rs. ${amount}/-. Pay by ${dueDate} at unionbankofindia.co.in or BBPS. -Union Bank`,
  },
  {
    test: (n) => /punjab national bank.*credit card/i.test(n),
    buildSms: ({ identifier, amount, dueDate }) =>
      `PNB Credit Card (ending ${identifier.slice(-4)}): Total Amount Due Rs. ${amount}/-. Pay by ${dueDate} at pnbindia.in or PNB ONE app / BBPS. -Punjab National Bank`,
  },
  {
    test: (n) => /idbi.*credit card/i.test(n),
    buildSms: ({ identifier, amount, dueDate }) =>
      `IDBI Bank Credit Card (ending ${identifier.slice(-4)}): Amount Due Rs. ${amount}/-. Pay by ${dueDate} at idbibank.in or Go Mobile+ / BBPS. -IDBI Bank`,
  },
  {
    test: (n) => /iob.*credit card/i.test(n),
    buildSms: ({ identifier, amount, dueDate }) =>
      `IOB Credit Card (ending ${identifier.slice(-4)}): Total Due Rs. ${amount}/-. Pay by ${dueDate} at iob.in or IOB Mobile / BBPS. -Indian Overseas Bank`,
  },
  {
    test: (n) => /indian bank.*credit card/i.test(n),
    buildSms: ({ identifier, amount, dueDate }) =>
      `Indian Bank Credit Card (ending ${identifier.slice(-4)}): Amount Due Rs. ${amount}/-. Pay by ${dueDate} at indianbank.in or IndOASIS app / BBPS. -Indian Bank`,
  },
  {
    test: (n) => /cub.*credit card|city union.*credit card/i.test(n),
    buildSms: ({ identifier, amount, dueDate }) =>
      `CUB Credit Card (ending ${identifier.slice(-4)}): Statement Amount Due Rs. ${amount}/-. Pay by ${dueDate} at cityunionbank.com or BBPS. -City Union Bank`,
  },
  {
    test: (n) => /dcb.*credit card/i.test(n),
    buildSms: ({ identifier, amount, dueDate }) =>
      `DCB Bank Credit Card (ending ${identifier.slice(-4)}): Amount Due Rs. ${amount}/-. Pay by ${dueDate} at dcbbank.com or DCB Mobile / BBPS. -DCB Bank`,
  },
  {
    test: (n) => /esaf.*credit card/i.test(n),
    buildSms: ({ identifier, amount, dueDate }) =>
      `ESAF Bank Credit Card (ending ${identifier.slice(-4)}): Amount Due Rs. ${amount}/-. Pay by ${dueDate} at esafbank.com or BBPS. -ESAF Bank`,
  },
  {
    test: (n) => /edge csb|csb.*credit card/i.test(n),
    buildSms: ({ identifier, amount, dueDate }) =>
      `CSB Bank Credit Card (ending ${identifier.slice(-4)}): Statement Amount Due Rs. ${amount}/-. Pay by ${dueDate} at csb.co.in or BBPS. -CSB Bank`,
  },
  {
    test: (n) => /dhanlaxmi.*credit card/i.test(n),
    buildSms: ({ identifier, amount, dueDate }) =>
      `Dhanlaxmi Bank Credit Card (ending ${identifier.slice(-4)}): Amount Due Rs. ${amount}/-. Pay by ${dueDate} at dhanbank.com or BBPS. -Dhanlaxmi Bank`,
  },
  {
    test: (n) => /south indian bank.*credit card/i.test(n),
    buildSms: ({ identifier, amount, dueDate }) =>
      `South Indian Bank Credit Card (ending ${identifier.slice(-4)}): Amount Due Rs. ${amount}/-. Pay by ${dueDate} at southindianbank.com or SIB Mirror+ / BBPS. -South Indian Bank`,
  },
  {
    test: (n) => /saraswat.*credit card/i.test(n),
    buildSms: ({ identifier, amount, dueDate }) =>
      `Saraswat Bank Credit Card (ending ${identifier.slice(-4)}): Amount Due Rs. ${amount}/-. Pay by ${dueDate} at saraswatbank.com or BBPS. -Saraswat Bank`,
  },
  {
    test: (n) => /tamilnad mercantile.*credit card/i.test(n),
    buildSms: ({ identifier, amount, dueDate }) =>
      `Tamilnad Mercantile Bank Credit Card (ending ${identifier.slice(-4)}): Amount Due Rs. ${amount}/-. Pay by ${dueDate} at tmbank.in or BBPS. -TMB`,
  },
  {
    test: (n) => /suryoday.*credit card/i.test(n),
    buildSms: ({ identifier, amount, dueDate }) =>
      `Suryoday Bank Credit Card (ending ${identifier.slice(-4)}): Amount Due Rs. ${amount}/-. Pay by ${dueDate} at suryodaybank.com or BBPS. -Suryoday Bank`,
  },
  {
    test: (n) => /sbm.*credit card/i.test(n),
    buildSms: ({ identifier, amount, dueDate }) =>
      `SBM Bank Credit Card (ending ${identifier.slice(-4)}): Amount Due Rs. ${amount}/-. Pay by ${dueDate} at sbmbank.co.in or BBPS. -SBM Bank`,
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
          ? `${billerName}: EV charging wallet ${idSpec.label} ${identifier} requires balance of Rs. ${amount}. Recharge by ${dueDate} at ${portal}`
          : `${billerName}: EV charging wallet ${idSpec.label} ${identifier} requires balance of Rs. ${amount}. Recharge by ${dueDate}.`;
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

const formatMoney = (value: number) => new Intl.NumberFormat('en-IN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
}).format(value);

const normalizePortal = (portal?: string) => portal ? portal.replace(/^https?:\/\//i, '').replace(/\/+$/, '') : '';

const getCreditCardIssuerLabel = (billerName: string) => {
  if (/sbi\s*card/i.test(billerName)) return 'SBI Card';
  if (/hdfc/i.test(billerName)) return 'HDFC Bank';
  if (/icici/i.test(billerName)) return 'ICICI Bank';
  if (/axis/i.test(billerName)) return 'Axis Bank';
  if (/kotak/i.test(billerName)) return 'Kotak Bank';
  if (/yes\s*bank/i.test(billerName)) return 'YES Bank';
  if (/idfc\s*first/i.test(billerName)) return 'IDFC First Bank';
  if (/indusind/i.test(billerName)) return 'IndusInd Bank';
  if (/rbl/i.test(billerName)) return 'RBL Bank';
  if (/federal/i.test(billerName)) return 'Federal Bank';
  if (/au\s*bank/i.test(billerName)) return 'AU Bank';
  if (/bandhan/i.test(billerName)) return 'Bandhan Bank';
  if (/bank of baroda|bobcard|\bbob\b/i.test(billerName)) return 'BOB Card';
  if (/bank of india/i.test(billerName)) return 'Bank of India';
  if (/canara/i.test(billerName)) return 'Canara Bank';
  if (/city\s*union|\bcub\b/i.test(billerName)) return 'City Union Bank';
  if (/dbs/i.test(billerName)) return 'DBS Bank';
  if (/dcb/i.test(billerName)) return 'DCB Bank';
  if (/dhanlaxmi/i.test(billerName)) return 'Dhanlaxmi Bank';
  if (/edge\s*csb|\bcsb\b/i.test(billerName)) return 'CSB Bank';
  if (/esaf/i.test(billerName)) return 'ESAF Bank';
  if (/hsbc/i.test(billerName)) return 'HSBC Bank';
  if (/idbi/i.test(billerName)) return 'IDBI Bank';
  if (/\biob\b|indian\s*overseas/i.test(billerName)) return 'Indian Overseas Bank';
  if (/indian\s*bank/i.test(billerName)) return 'Indian Bank';
  if (/punjab\s*national|\bpnb\b/i.test(billerName)) return 'PNB Card';
  if (/saraswat/i.test(billerName)) return 'Saraswat Bank';
  if (/sbm\s*bank/i.test(billerName)) return 'SBM Bank';
  if (/south\s*indian|\bsib\b/i.test(billerName)) return 'South Indian Bank';
  if (/suryoday/i.test(billerName)) return 'Suryoday Bank';
  if (/tamilnad\s*mercantile|\btmb\b/i.test(billerName)) return 'Tamilnad Mercantile Bank';
  if (/union\s*bank/i.test(billerName)) return 'Union Bank';
  return 'Credit Card';
};

const buildCreditCardStatementSms = ({ billerName, amount, dueDate, billDate, identifier, portal }: SmsContext) => {
  const minDue = Math.max(200, Math.round(amount * 0.05));
  const cardLast4 = identifier.slice(-4);
  const stmtDate = billDate || new Date().toLocaleDateString('en-IN');
  const portalText = normalizePortal(portal);
  const payLine = portalText ? `Pay at ${portalText}.` : 'Pay via BBPS or your bank app.';
  const amountDue = `Rs. ${formatMoney(amount)}`;
  const minimumDue = `Rs. ${formatMoney(minDue)}`;
  const issuerLabel = getCreditCardIssuerLabel(billerName);

  if (/sbi\s*card/i.test(billerName)) {
    return `Statement generated on ${stmtDate}. Card ending ${cardLast4}. Total Amt Due ${amountDue}. Min Amt Due ${minimumDue}. Due by ${dueDate}. ${payLine}`;
  }

  if (/hdfc/i.test(billerName)) {
    return `HDFC Bank: Credit Card statement for card ending ${cardLast4} is ready. Amt Due ${amountDue}. Min Due ${minimumDue}. Due Date ${dueDate}. ${payLine}`;
  }

  if (/icici/i.test(billerName)) {
    return `ICICI Bank: Credit card statement generated for card ending ${cardLast4}. Amount Due ${amountDue}. Min Due ${minimumDue}. Payment due by ${dueDate}. ${payLine}`;
  }

  if (/axis/i.test(billerName)) {
    return `Axis Bank: Credit card statement for card ending ${cardLast4} has been generated. Total Due ${amountDue}. Min Due ${minimumDue}. Due Date ${dueDate}. ${payLine}`;
  }

  if (/kotak/i.test(billerName)) {
    return `Kotak Bank: Statement generated for card ending ${cardLast4}. Total Due ${amountDue}. Min Due ${minimumDue}. Due Date ${dueDate}. ${payLine}`;
  }

  if (/yes\s*bank|yes bank/i.test(billerName)) {
    return `YES Bank: Credit card bill ready for card ending ${cardLast4}. Total Due ${amountDue}. Min Due ${minimumDue}. Pay by ${dueDate}. ${payLine}`;
  }

  if (/idfc\s*first|idfc first bank/i.test(billerName)) {
    return `IDFC First Bank: Statement generated for card ending ${cardLast4} on ${stmtDate}. Amount Due ${amountDue}. Min Due ${minimumDue}. Due Date ${dueDate}. ${payLine}`;
  }

  if (/bank of baroda|bobcard|\bbob\b/i.test(billerName)) {
    return `BOB Card: Credit card statement for card ending ${cardLast4}. Amount Due ${amountDue}. Min Due ${minimumDue}. Due Date ${dueDate}. ${payLine}`;
  }

  if (/union bank/i.test(billerName)) {
    return `Union Bank: Credit card statement for card ending ${cardLast4} is ready. Total Due ${amountDue}. Min Due ${minimumDue}. Payment Due ${dueDate}. ${payLine}`;
  }

  if (/canara/i.test(billerName)) {
    return `Canara Bank: Credit card bill for card ending ${cardLast4} is ready. Amount Due ${amountDue}. Min Due ${minimumDue}. Due Date ${dueDate}. ${payLine}`;
  }

  if (/indian bank/i.test(billerName)) {
    return `Indian Bank: Credit card statement for card ending ${cardLast4}. Amount Due ${amountDue}. Min Due ${minimumDue}. Pay by ${dueDate}. ${payLine}`;
  }

  if (/punjab national/i.test(billerName)) {
    return `PNB Card: Statement generated for card ending ${cardLast4}. Amount Due ${amountDue}. Min Due ${minimumDue}. Due Date ${dueDate}. ${payLine}`;
  }

  if (/au bank/i.test(billerName)) {
    return `AU Bank: Credit card statement for card ending ${cardLast4} is ready. Total Due ${amountDue}. Min Due ${minimumDue}. Due Date ${dueDate}. ${payLine}`;
  }

  return `Credit card statement for card ending ${cardLast4} is ready. Total Due ${amountDue}. Min Due ${minimumDue}. Due Date ${dueDate}. ${payLine}`;
};

export const buildBillerSpecificSms = ({ category, billerName, state, amount, dueDate, billDate, month, identifier }: SmsContext) => {
  const portalOrNull = getBillerSpecificPortal(billerName, category);
  const portal = portalOrNull || undefined;
  const idSpec = getIdentifierForBiller(category, billerName, state);

  if ((category || '').toLowerCase() === 'credit card') {
    return buildCreditCardStatementSms({ category, billerName, state, amount, dueDate, billDate, month, identifier, portal });
  }

  const rule = billerSpecificRules.find((r) => r.test(billerName));
  if (rule) {
    return rule.buildSms({ category, billerName, state, amount, dueDate, month, identifier, portal, idSpec });
  }

  // Unreachable fallback (handles optional portal)
  return portal
    ? `${billerName}: Payment alert for ${idSpec.label} ${identifier}. Amount Rs. ${amount}, due ${dueDate}. Portal: ${portal}`
    : `${billerName}: Payment alert for ${idSpec.label} ${identifier}. Amount Rs. ${amount}, due ${dueDate}.`;
};

export const getAmtLimits = (category: string) => {
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

