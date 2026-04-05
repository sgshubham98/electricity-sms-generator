import { useEffect, useMemo, useState } from 'react';
import { billersByCategory, missingCategoryFiles } from '../lib/data/billersData';
import { buildBillerSpecificSms, getAmtLimits } from '../lib/sms/rules';
import { getBrand, getDisplayBillerName, getIdentifierForBiller, getLsa } from '../lib/sms/identifiers';
import { randChoice, randFloat, randInt } from '../lib/utils/random';
import type { BillerItem, FilterType, GeneratedRow, NameFormat, StateCount, ViewMode } from '../components/types';

const TSP_CODES = ['A', 'J', 'V', 'B', 'T'] as const;
const BOARD_ONLY_FILTER_CATEGORIES = new Set([
  'Credit Card',
  'Broadband Postpaid',
  'Mobile Postpaid',
]);

type DownloadFn = (content: string, name: string, type: string) => void;

function downloadFile(content: string, name: string, type: string) {
  const anchor = document.createElement('a');
  anchor.href = URL.createObjectURL(new Blob([content], { type }));
  anchor.download = name;
  anchor.click();
}

function buildGeneratedRows(
  valid: BillerItem[],
  tab: string,
  count: number,
  all: boolean,
  nameFormat: NameFormat,
): GeneratedRow[] {
  const result: GeneratedRow[] = [];
  const currentDate = new Date();
  const qty = all ? valid.length : Math.max(1, Math.min(200, count));

  for (let i = 0; i < qty; i++) {
    const discom = all ? valid[i] : randChoice(valid);
    const tsp = randChoice([...TSP_CODES]);
    const state = discom.State || 'Unknown';
    const billerName = discom['Biller Name'] || 'Unknown';

    const lsa = getLsa(state);
    const brand = getBrand(tab, billerName);
    const isGovt = billerName.toLowerCase().includes('municipal') || state.toLowerCase() === 'pan india govt';
    const suffix = isGovt ? 'G' : 'S';

    const daysPast = randInt(0, 35);
    const billDateObj = new Date(currentDate.getTime() - daysPast * 24 * 3600 * 1000);
    const dueDaysFromToday = randInt(0, 3);
    const dueDateObj = new Date(currentDate.getTime() + dueDaysFromToday * 24 * 3600 * 1000);

    const mths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthStr = `${mths[billDateObj.getMonth()]}-${billDateObj.getFullYear()}`;
    const fmt = (d: Date) => `${d.getDate().toString().padStart(2, '0')}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getFullYear()}`;

    const billDateStr = fmt(billDateObj);
    const dueDateStr = fmt(dueDateObj);
    const limits = getAmtLimits(tab);
    const numAmt = randFloat(limits.min, limits.max);

    const outName = getDisplayBillerName(billerName, nameFormat);
    const identifier = getIdentifierForBiller(tab, billerName, state).value;
    const smsBillerName = tab === 'Credit Card' ? billerName : outName;
    const sms = buildBillerSpecificSms({
      category: tab,
      billerName: smsBillerName,
      state,
      amount: numAmt,
      dueDate: dueDateStr,
      billDate: billDateStr,
      month: monthStr,
      identifier,
    });

    result.push({
      id: i + 1,
      senderId: `${tsp}${lsa}-${brand}-${suffix}`,
      board: outName,
      state,
      category: tab,
      consumerNo: identifier,
      amount: numAmt,
      billDate: billDateStr,
      dueDate: dueDateStr,
      sms,
    });
  }

  return result;
}

function getFilteredValidBillers(
  activeDataList: BillerItem[],
  filterType: FilterType,
  activeState: string | null,
  activeBoards: string[],
): BillerItem[] {
  if (filterType === 'state' && activeState) {
    return activeDataList.filter((d) => (d.State || 'Unknown') === activeState);
  }
  if (filterType === 'board' && activeBoards.length > 0) {
    return activeDataList.filter((d) => activeBoards.includes(d['Biller Name'] || ''));
  }
  return activeDataList;
}

function exportCsv(data: GeneratedRow[], download: DownloadFn) {
  if (!data.length) return;
  const header: Array<keyof GeneratedRow> = ['id', 'senderId', 'board', 'state', 'category', 'consumerNo', 'amount', 'billDate', 'dueDate', 'sms'];
  const rows = data.map((r) => header.map((h) => `"${(r[h] || '').toString().replace(/"/g, '""')}"`).join(','));
  const csv = [header.join(','), ...rows].join('\n');
  download(csv, 'biller_sms_data.csv', 'text/csv');
}

export function useSmsGeneratorPage() {
  const uniqueCategories = useMemo(() => Object.keys(billersByCategory).sort(), []);

  const visibleCategories = useMemo(
    () => uniqueCategories.filter((cat) => !missingCategoryFiles.has(cat)),
    [uniqueCategories],
  );

  const visibleBillersCount = useMemo(
    () => visibleCategories.reduce((sum, cat) => sum + (billersByCategory[cat]?.length || 0), 0),
    [visibleCategories],
  );

  const [tab, setTab] = useState(
    visibleCategories.includes('Electricity') ? 'Electricity' : visibleCategories[0] || 'generator',
  );
  const [filterType, setFilterType] = useState<FilterType>('state');
  const [activeState, setActiveState] = useState<string | null>(null);
  const [activeBoards, setActiveBoards] = useState<string[]>([]);
  const [nameFormat, setNameFormat] = useState<NameFormat>('none');
  const [count, setCount] = useState(1);
  const [view, setView] = useState<ViewMode>('card');
  const [data, setData] = useState<GeneratedRow[]>([]);
  const [showInfo, setShowInfo] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');

  const canFilterByState = useMemo(
    () => !BOARD_ONLY_FILTER_CATEGORIES.has(tab),
    [tab],
  );

  const activeDataList = useMemo<BillerItem[]>(
    () => (billersByCategory[tab] || []) as BillerItem[],
    [tab],
  );

  const states = useMemo<StateCount[]>(() => {
    const map = new Map<string, number>();
    activeDataList.forEach((d) => {
      const state = d.State || 'Unknown';
      map.set(state, (map.get(state) || 0) + 1);
    });

    return Array.from(map.entries())
      .map(([state, num]) => ({ state, num }))
      .sort((a, b) => a.state.localeCompare(b.state));
  }, [activeDataList]);

  const filteredBoards = useMemo(
    () => activeDataList.filter((d) => (d['Biller Name'] || '').toLowerCase().includes(searchTerm.toLowerCase())),
    [activeDataList, searchTerm],
  );

  useEffect(() => {
    setActiveState(null);
    setActiveBoards([]);
    setData([]);
    setSearchTerm('');
    setShowCategoryDropdown(false);
  }, [tab]);

  useEffect(() => {
    if (!visibleCategories.includes(tab)) {
      setTab(visibleCategories.includes('Electricity') ? 'Electricity' : visibleCategories[0] || 'generator');
    }
  }, [tab, visibleCategories]);

  useEffect(() => {
    if (!canFilterByState && filterType === 'state') {
      setFilterType('board');
    }
  }, [canFilterByState, filterType]);

  useEffect(() => {
    const closeCategoryDropdown = () => setShowCategoryDropdown(false);
    document.addEventListener('click', closeCategoryDropdown);
    return () => document.removeEventListener('click', closeCategoryDropdown);
  }, []);

  const toggleBoard = (name: string) => {
    setActiveBoards((prev) => (prev.includes(name) ? prev.filter((x) => x !== name) : [...prev, name]));
  };

  const handleGenerateData = (all: boolean) => {
    const effectiveFilterType: FilterType = canFilterByState ? filterType : 'board';
    const valid = getFilteredValidBillers(activeDataList, effectiveFilterType, activeState, activeBoards);
    if (!valid.length) return;

    const result = buildGeneratedRows(valid, tab, count, all, nameFormat);
    setData(result);
  };

  const exportCSV = () => exportCsv(data, downloadFile);

  const exportJSON = () => {
    if (!data.length) return;
    downloadFile(JSON.stringify(data, null, 2), 'biller_sms_data.json', 'application/json');
  };

  const copySMS = () => {
    if (!data.length) return;
    navigator.clipboard.writeText(data.map((d) => d.sms).join('\n\n'));
    alert('Copied SMS texts to clipboard!');
  };

  return {
    tab,
    setTab,
    visibleCategories,
    visibleBillersCount,
    filterType,
    setFilterType,
    activeState,
    setActiveState,
    activeBoards,
    setActiveBoards,
    nameFormat,
    setNameFormat,
    count,
    setCount,
    view,
    setView,
    data,
    showInfo,
    setShowInfo,
    searchTerm,
    setSearchTerm,
    showCategoryDropdown,
    setShowCategoryDropdown,
    categorySearch,
    setCategorySearch,
    canFilterByState,
    activeDataList,
    states,
    filteredBoards,
    toggleBoard,
    handleGenerateData,
    exportCSV,
    exportJSON,
    copySMS,
  };
}
