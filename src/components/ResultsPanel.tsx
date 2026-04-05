import React from 'react';
import { ExportActions } from './ExportActions';
import type { GeneratedRow, ViewMode } from './types';

type ResultsPanelProps = {
  data: GeneratedRow[];
  view: ViewMode;
  setView: (value: ViewMode) => void;
  onExportCSV: () => void;
  onExportJSON: () => void;
  onCopySMS: () => void;
};

export function ResultsPanel({ data, view, setView, onExportCSV, onExportJSON, onCopySMS }: ResultsPanelProps) {
  if (!data.length) {
    return null;
  }

  return (
    <div style={{ background: '#1e293b', border: '1px solid #334155', padding: '20px', borderRadius: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', gap: '8px', background: '#0f172a', padding: '4px', borderRadius: '8px' }}>
          <button
            onClick={() => setView('table')}
            style={{ background: view === 'table' ? '#475569' : 'transparent', color: '#f8fafc', border: 'none', padding: '6px 16px', borderRadius: '4px', cursor: 'pointer' }}
          >
            Table View
          </button>
          <button
            onClick={() => setView('card')}
            style={{ background: view === 'card' ? '#475569' : 'transparent', color: '#f8fafc', border: 'none', padding: '6px 16px', borderRadius: '4px', cursor: 'pointer' }}
          >
            SMS View
          </button>
        </div>

        <ExportActions dataCount={data.length} onExportCSV={onExportCSV} onExportJSON={onExportJSON} onCopySMS={onCopySMS} />
      </div>

      {view === 'table' ? (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', minWidth: '1200px' }}>
            <thead>
              <tr style={{ textAlign: 'left', background: '#0f172a', color: '#94a3b8' }}>
                <th style={{ padding: '12px 16px' }}>#</th>
                <th style={{ padding: '12px 16px' }}>Sender ID</th>
                <th style={{ padding: '12px 16px' }}>Biller Name</th>
                <th style={{ padding: '12px 16px' }}>State</th>
                <th style={{ padding: '12px 16px' }}>Account / ID No</th>
                <th style={{ padding: '12px 16px' }}>Amount</th>
                <th style={{ padding: '12px 16px' }}>Bill Date</th>
                <th style={{ padding: '12px 16px' }}>Due Date</th>
              </tr>
            </thead>
            <tbody>
              {data.map((r) => (
                <tr key={r.id} style={{ borderBottom: '1px solid #334155' }}>
                  <td style={{ padding: '12px 16px', color: '#cbd5e1' }}>{r.id}</td>
                  <td style={{ padding: '12px 16px', fontFamily: 'monospace', color: '#38bdf8', fontWeight: 'bold' }}>{r.senderId}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ background: 'rgba(59,130,246,0.2)', color: '#93c5fd', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', border: '1px solid #3b82f6' }}>
                      {r.board}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#cbd5e1' }}>{r.state}</td>
                  <td style={{ padding: '12px 16px', fontFamily: 'monospace' }}>{r.consumerNo}</td>
                  <td style={{ padding: '12px 16px', color: '#10b981' }}>₹{r.amount}</td>
                  <td style={{ padding: '12px 16px' }}>{r.billDate}</td>
                  <td style={{ padding: '12px 16px', color: '#f43f5e' }}>{r.dueDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {data.slice(0, 500).map((r) => (
            <div key={r.id} style={{ background: '#0f172a', border: '1px solid #475569', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', background: '#334155', borderBottom: '1px solid #475569', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#38bdf8' }}>{r.senderId}</span>
                <span style={{ fontSize: '12px', color: '#cbd5e1' }}>{r.billDate}</span>
              </div>
              <div style={{ padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ color: '#94a3b8', fontSize: '13px' }}>{r.board} ({r.state})</span>
                  <span style={{ color: '#93c5fd', fontSize: '12px', background: 'rgba(59,130,246,0.2)', padding: '2px 6px', borderRadius: '10px' }}>{r.category}</span>
                </div>
                <div style={{ background: '#1e293b', padding: '12px', borderRadius: '8px', fontSize: '14px', lineHeight: '1.5', color: '#e2e8f0', fontFamily: 'system-ui' }}>{r.sms}</div>
              </div>
            </div>
          ))}
          {data.length > 500 && <div style={{ color: '#94a3b8', padding: '20px' }}>... and {data.length - 500} more rendered as CSV. (SMS View capped to 500 for performance)</div>}
        </div>
      )}
    </div>
  );
}
