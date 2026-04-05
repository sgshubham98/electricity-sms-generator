import React from 'react';
import type { FilterType, NameFormat, StateCount, BillerItem } from './types';

type FilterPanelProps = {
  tab: string;
  canFilterByState: boolean;
  filterType: FilterType;
  setFilterType: (value: FilterType) => void;
  showInfo: boolean;
  setShowInfo: (value: boolean) => void;
  activeDataList: BillerItem[];
  states: StateCount[];
  activeState: string | null;
  setActiveState: (value: string | null) => void;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  activeBoards: string[];
  setActiveBoards: (value: string[]) => void;
  filteredBoards: BillerItem[];
  toggleBoard: (name: string) => void;
  count: number;
  setCount: (value: number) => void;
  nameFormat: NameFormat;
  setNameFormat: (value: NameFormat) => void;
  onGenerateRandom: () => void;
  onGenerateAllSelected: () => void;
};

export function FilterPanel({
  tab,
  canFilterByState,
  filterType,
  setFilterType,
  showInfo,
  setShowInfo,
  activeDataList,
  states,
  activeState,
  setActiveState,
  searchTerm,
  setSearchTerm,
  activeBoards,
  setActiveBoards,
  filteredBoards,
  toggleBoard,
  count,
  setCount,
  nameFormat,
  setNameFormat,
  onGenerateRandom,
  onGenerateAllSelected,
}: FilterPanelProps) {
  return (
    <div style={{ background: '#1e293b', border: '1px solid #334155', padding: '20px', borderRadius: '12px' }}>
      <h2 style={{ color: '#fff', marginTop: 0, marginBottom: '20px', fontSize: '20px' }}>Configure {tab} Set</h2>
      <div style={{ display: 'flex', gap: '20px', marginBottom: '16px', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '8px', background: '#0f172a', padding: '4px', borderRadius: '8px' }}>
          {canFilterByState && (
            <button
              onClick={() => setFilterType('state')}
              style={{
                background: filterType === 'state' ? '#475569' : 'transparent',
                color: '#f8fafc',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Filter by State/UT
            </button>
          )}
          <button
            onClick={() => setFilterType('board')}
            style={{
              background: filterType === 'board' ? '#475569' : 'transparent',
              color: '#f8fafc',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Filter by Biller
          </button>
        </div>
        <button
          onClick={() => setShowInfo(!showInfo)}
          style={{ marginLeft: 'auto', background: 'transparent', border: '1px solid #8b5cf6', color: '#8b5cf6', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}
        >
          TRAI Info
        </button>
      </div>

      {showInfo && (
        <div style={{ background: '#312e81', color: '#e0e7ff', padding: '16px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', lineHeight: '1.5' }}>
          <strong>TRAI DLT Sender ID Rules:</strong> XY-ZZZZZZ-G/S
          <br />
          X: TSP Code | Y: LSA Code
          <br />
          ZZZZZZ: 6-char registered brand code
          <br />
          Suffix: -G (Govt), -S (Private)
        </div>
      )}

      {canFilterByState && filterType === 'state' ? (
        <div>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <button
              onClick={() => setActiveState(null)}
              style={{ background: '#334155', border: 'none', color: '#fff', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}
            >
              All States ({activeDataList.length} Billers)
            </button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {states.map((s) => (
              <div
                key={s.state}
                onClick={() => setActiveState(activeState === s.state ? null : s.state)}
                style={{
                  background: activeState === s.state ? '#3b82f6' : '#1e293b',
                  border: `1px solid ${activeState === s.state ? '#60a5fa' : '#475569'}`,
                  padding: '8px 16px',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s',
                }}
              >
                {s.state}
                <span style={{ background: '#0f172a', color: '#cbd5e1', padding: '2px 8px', borderRadius: '10px', fontSize: '12px' }}>{s.num}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', alignItems: 'center' }}>
            <input
              type="text"
              placeholder={`Search among ${activeDataList.length} billers...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ background: '#0f172a', border: '1px solid #475569', color: '#f8fafc', padding: '8px 12px', borderRadius: '6px', outline: 'none', minWidth: '250px' }}
            />
            <button
              onClick={() => setActiveBoards([])}
              style={{ background: '#334155', border: 'none', color: '#fff', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}
            >
              Clear Selection
            </button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
            {filteredBoards.slice(0, 100).map((d) => {
              const nameStr = d['Biller Name'] || 'Unknown';
              const active = activeBoards.includes(nameStr);
              const color = '#3b82f6';
              return (
                <div
                  key={nameStr}
                  onClick={() => toggleBoard(nameStr)}
                  style={{
                    background: active ? color : '#1e293b',
                    border: `1px solid ${color}`,
                    color: '#fff',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    transition: 'all 0.2s',
                  }}
                >
                  {nameStr}
                </div>
              );
            })}
            {filteredBoards.length > 100 && <div style={{ padding: '6px 12px', color: '#94a3b8', fontSize: '13px' }}>+ {filteredBoards.length - 100} more</div>}
          </div>
        </div>
      )}

      <div style={{ marginTop: '24px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>Generate</span>
          <input
            type="number"
            min="1"
            max="1000"
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            style={{ width: '80px', background: '#0f172a', border: '1px solid #475569', color: '#fff', padding: '8px', borderRadius: '6px', textAlign: 'center' }}
          />
          <span>records</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '16px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '14px', color: '#cbd5e1' }}>Biller Name Format:</span>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '14px', color: '#cbd5e1' }}>
            <input
              type="radio"
              name="nameFormat"
              checked={nameFormat === 'full_name'}
              onChange={() => setNameFormat('full_name')}
              style={{ cursor: 'pointer', accentColor: '#ec4899' }}
            />
            Full Name
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '14px', color: '#cbd5e1' }}>
            <input
              type="radio"
              name="nameFormat"
              checked={nameFormat === 'full_name_with_abbrv'}
              onChange={() => setNameFormat('full_name_with_abbrv')}
              style={{ cursor: 'pointer', accentColor: '#ec4899' }}
            />
            Full Name with Abbrv (from JSON)
          </label>
        </div>

        <button
          onClick={onGenerateRandom}
          style={{ background: 'linear-gradient(90deg, #ec4899, #8b5cf6)', border: 'none', color: '#fff', padding: '10px 24px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', minWidth: '150px' }}
        >
          Generate Random
        </button>
        <button
          onClick={onGenerateAllSelected}
          style={{ background: 'linear-gradient(90deg, #10b981, #3b82f6)', border: 'none', color: '#fff', padding: '10px 24px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', minWidth: '150px' }}
        >
          Generate All Selected
        </button>
      </div>
    </div>
  );
}
