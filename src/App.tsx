import React from 'react';
import { CategoryDropdown } from './components/CategoryDropdown';
import { FilterPanel } from './components/FilterPanel';
import { ResultsPanel } from './components/ResultsPanel';
import { useSmsGeneratorPage } from './hooks/useSmsGeneratorPage';

export default function App() {
  const {
    tab,
    setTab,
    visibleCategories,
    visibleBillersCount,
    filterType,
    setFilterType,
    canFilterByState,
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
    activeDataList,
    states,
    filteredBoards,
    toggleBoard,
    handleGenerateData,
    exportCSV,
    exportJSON,
    copySMS,
  } = useSmsGeneratorPage();

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
              {visibleCategories.length} Categories
            </div>
            <div style={{fontSize: '14px', color: '#cbd5e1', background: '#334155', padding: '6px 12px', borderRadius: '20px'}}>
              {visibleBillersCount} Billers
            </div>
          </div>
        </div>
      </div>

      <CategoryDropdown
        tab={tab}
        visibleCategories={visibleCategories}
        showCategoryDropdown={showCategoryDropdown}
        setShowCategoryDropdown={setShowCategoryDropdown}
        categorySearch={categorySearch}
        setCategorySearch={setCategorySearch}
        onSelectCategory={setTab}
      />

      <div style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
        <FilterPanel
          tab={tab}
          canFilterByState={canFilterByState}
          filterType={filterType}
          setFilterType={setFilterType}
          showInfo={showInfo}
          setShowInfo={setShowInfo}
          activeDataList={activeDataList}
          states={states}
          activeState={activeState}
          setActiveState={setActiveState}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          activeBoards={activeBoards}
          setActiveBoards={setActiveBoards}
          filteredBoards={filteredBoards}
          toggleBoard={toggleBoard}
          count={count}
          setCount={setCount}
          nameFormat={nameFormat}
          setNameFormat={setNameFormat}
          onGenerateRandom={() => handleGenerateData(false)}
          onGenerateAllSelected={() => handleGenerateData(true)}
        />

        {data.length > 0 && (
          <ResultsPanel
            data={data}
            view={view}
            setView={setView}
            onExportCSV={exportCSV}
            onExportJSON={exportJSON}
            onCopySMS={copySMS}
          />
        )}
      </div>
    </div>
  );
}
