import React, { useEffect, useMemo, useState } from 'react';
import { CategoryDropdown } from './components/CategoryDropdown';
import { FilterPanel } from './components/FilterPanel';
import { ResultsPanel } from './components/ResultsPanel';
import { useSmsGeneratorPage } from './hooks/useSmsGeneratorPage';

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'dark';
    const savedTheme = window.localStorage.getItem('sms-generator-theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  });

  useEffect(() => {
    document.body.style.background = theme === 'light' ? '#f3f5f8' : '#0f1216';
    window.localStorage.setItem('sms-generator-theme', theme);
  }, [theme]);

  const themeVars = useMemo(() => {
    if (theme === 'light') {
      return {
        '--bg': '#f3f5f8',
        '--bg-elev': '#ffffff',
        '--bg-muted': '#f8fafc',
        '--bg-soft': '#eef2f7',
        '--text': '#1f2937',
        '--text-muted': '#5b6573',
        '--border': '#d7dde6',
        '--border-strong': '#c5ceda',
        '--primary': '#2563eb',
        '--primary-weak': 'rgba(37,99,235,0.12)',
        '--success': '#059669',
        '--danger': '#dc2626',
        '--shadow': '0 12px 24px rgba(15, 23, 42, 0.08)',
      };
    }

    return {
      '--bg': '#0f1216',
      '--bg-elev': '#171b22',
      '--bg-muted': '#1d2430',
      '--bg-soft': '#202938',
      '--text': '#e5eaf1',
      '--text-muted': '#9aa6b2',
      '--border': '#2a3341',
      '--border-strong': '#3a4658',
      '--primary': '#6ea8fe',
      '--primary-weak': 'rgba(110,168,254,0.18)',
      '--success': '#34d399',
      '--danger': '#fb7185',
      '--shadow': '0 16px 28px rgba(2, 8, 20, 0.35)',
    };
  }, [theme]);

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
    <div
      className="app-shell"
      style={{
        ...(themeVars as React.CSSProperties),
        minHeight: '100vh',
        background: 'var(--bg)',
        color: 'var(--text)',
        fontFamily: 'Avenir Next, Segoe UI, Helvetica Neue, sans-serif',
        padding: '24px',
      }}
    >
      <style>{`
        .hide-scroll::-webkit-scrollbar { display: none; }
        .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }

        .app-shell button,
        .app-shell input,
        .app-shell .ui-chip,
        .app-shell .ui-surface {
          transition: background-color 180ms ease, border-color 180ms ease, color 180ms ease, box-shadow 180ms ease, transform 180ms ease;
        }

        .app-shell button:hover,
        .app-shell .ui-chip:hover {
          transform: translateY(-1px);
        }

        .app-shell button:active,
        .app-shell .ui-chip:active {
          transform: translateY(0);
        }

        .app-shell button:focus-visible,
        .app-shell input:focus-visible {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px var(--primary-weak);
        }

        @media (prefers-reduced-motion: reduce) {
          .app-shell button,
          .app-shell input,
          .app-shell .ui-chip,
          .app-shell .ui-surface {
            transition: none;
          }

          .app-shell button:hover,
          .app-shell .ui-chip:hover {
            transform: none;
          }
        }
      `}</style>
      
      <div style={{ position: 'sticky', top: 16, zIndex: 20, marginBottom: '24px' }}>
        <div style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)', borderRadius: '14px', boxShadow: 'var(--shadow)', padding: '14px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ margin: 0, fontSize: '22px', letterSpacing: '0.2px', fontWeight: 600, color: 'var(--text)' }}>
                India Omni-Biller SMS Generator
              </h1>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
                Generate realistic SMS data by category and biller.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', background: 'var(--bg-soft)', border: '1px solid var(--border)', padding: '6px 10px', borderRadius: '20px' }}>
                {visibleCategories.length} Categories
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', background: 'var(--bg-soft)', border: '1px solid var(--border)', padding: '6px 10px', borderRadius: '20px' }}>
                {visibleBillersCount} Billers
              </div>
              <button
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                style={{
                  background: 'var(--bg-soft)',
                  border: '1px solid var(--border-strong)',
                  color: 'var(--text)',
                  padding: '7px 12px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
              >
                {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
              </button>
            </div>
          </div>

          <div style={{ marginTop: '12px' }}>
            <CategoryDropdown
              tab={tab}
              visibleCategories={visibleCategories}
              showCategoryDropdown={showCategoryDropdown}
              setShowCategoryDropdown={setShowCategoryDropdown}
              categorySearch={categorySearch}
              setCategorySearch={setCategorySearch}
              onSelectCategory={setTab}
            />
          </div>
        </div>
      </div>

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
