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
    <div style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)', padding: '20px', borderRadius: '12px', boxShadow: 'var(--shadow)' }}>
      <h2 style={{ color: 'var(--text)', marginTop: 0, marginBottom: '20px', fontSize: '20px', fontWeight: 600 }}>Configure {tab} Set</h2>
      <div style={{ display: 'flex', gap: '20px', marginBottom: '16px', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-muted)', border: '1px solid var(--border)', padding: '4px', borderRadius: '8px' }}>
          {canFilterByState && (
            <button
              onClick={() => setFilterType('state')}
              style={{
                background: filterType === 'state' ? 'var(--bg-soft)' : 'transparent',
                color: 'var(--text)',
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
              background: filterType === 'board' ? 'var(--bg-soft)' : 'transparent',
              color: 'var(--text)',
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
          style={{ marginLeft: 'auto', background: 'transparent', border: '1px solid var(--border-strong)', color: 'var(--text)', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}
        >
          TRAI Info
        </button>
      </div>

      {showInfo && (
        <div style={{ background: 'var(--bg-muted)', color: 'var(--text-muted)', border: '1px solid var(--border)', padding: '16px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', lineHeight: '1.5' }}>
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
              style={{ background: 'var(--bg-soft)', border: '1px solid var(--border)', color: 'var(--text)', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}
            >
              All States ({activeDataList.length} Billers)
            </button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {states.map((s) => (
              <div
                className="ui-chip"
                key={s.state}
                onClick={() => setActiveState(activeState === s.state ? null : s.state)}
                style={{
                  background: activeState === s.state ? 'var(--primary-weak)' : 'var(--bg-elev)',
                  border: `1px solid ${activeState === s.state ? 'var(--primary)' : 'var(--border)'}`,
                  padding: '8px 16px',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  color: 'var(--text)',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s',
                }}
              >
                {s.state}
                <span style={{ background: 'var(--bg-soft)', color: 'var(--text-muted)', padding: '2px 8px', borderRadius: '10px', fontSize: '12px' }}>{s.num}</span>
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
              style={{ background: 'var(--bg-muted)', border: '1px solid var(--border)', color: 'var(--text)', padding: '8px 12px', borderRadius: '6px', outline: 'none', minWidth: '250px' }}
            />
            <button
              onClick={() => setActiveBoards([])}
              style={{ background: 'var(--bg-soft)', border: '1px solid var(--border)', color: 'var(--text)', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}
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
                  className="ui-chip"
                  key={nameStr}
                  onClick={() => toggleBoard(nameStr)}
                  style={{
                    background: active ? 'var(--primary-weak)' : 'var(--bg-elev)',
                    border: `1px solid ${active ? 'var(--primary)' : 'var(--border)'}`,
                    color: 'var(--text)',
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
                  {nameStr}
                </div>
              );
            })}
            {filteredBoards.length > 100 && <div style={{ padding: '6px 12px', color: 'var(--text-muted)', fontSize: '13px' }}>+ {filteredBoards.length - 100} more</div>}
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
            style={{ width: '80px', background: 'var(--bg-muted)', border: '1px solid var(--border)', color: 'var(--text)', padding: '8px', borderRadius: '6px', textAlign: 'center' }}
          />
          <span>records</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '16px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Display Name Format:</span>
          {([
            { value: 'full_name', label: 'Full Name' },
            { value: 'full_name_with_abbrv', label: 'Full Name with Abbrv' },
            { value: 'none', label: 'None / Deselect' },
          ] as const).map((option) => {
            const isActive = nameFormat === option.value;
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={isActive}
                onClick={() => setNameFormat(isActive ? 'none' : option.value)}
                style={{
                  background: isActive ? 'var(--primary-weak)' : 'var(--bg-muted)',
                  color: 'var(--text)',
                  border: `1px solid ${isActive ? 'var(--primary)' : 'var(--border)'}`,
                  padding: '8px 14px',
                  borderRadius: '999px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  transition: 'all 0.2s ease',
                }}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        <button
          onClick={onGenerateRandom}
          style={{ background: 'var(--primary)', border: 'none', color: '#fff', padding: '10px 24px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', minWidth: '150px' }}
        >
          Generate Random
        </button>
        <button
          onClick={onGenerateAllSelected}
          style={{ background: 'var(--success)', border: 'none', color: '#fff', padding: '10px 24px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', minWidth: '150px' }}
        >
          Generate All Selected
        </button>
      </div>
    </div>
  );
}
