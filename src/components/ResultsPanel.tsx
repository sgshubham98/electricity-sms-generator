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
    <div style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)', padding: '20px', borderRadius: '12px', boxShadow: 'var(--shadow)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-muted)', border: '1px solid var(--border)', padding: '4px', borderRadius: '8px' }}>
          <button
            onClick={() => setView('table')}
            style={{ background: view === 'table' ? 'var(--bg-soft)' : 'transparent', color: 'var(--text)', border: 'none', padding: '6px 16px', borderRadius: '4px', cursor: 'pointer' }}
          >
            Table View
          </button>
          <button
            onClick={() => setView('card')}
            style={{ background: view === 'card' ? 'var(--bg-soft)' : 'transparent', color: 'var(--text)', border: 'none', padding: '6px 16px', borderRadius: '4px', cursor: 'pointer' }}
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
              <tr style={{ textAlign: 'left', background: 'var(--bg-muted)', color: 'var(--text-muted)' }}>
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
                <tr key={r.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>{r.id}</td>
                  <td style={{ padding: '12px 16px', fontFamily: 'monospace', color: 'var(--primary)', fontWeight: 600 }}>{r.senderId}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ background: 'var(--primary-weak)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', border: '1px solid var(--primary)' }}>
                      {r.board}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>{r.state}</td>
                  <td style={{ padding: '12px 16px', fontFamily: 'monospace' }}>{r.consumerNo}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--success)' }}>₹{r.amount}</td>
                  <td style={{ padding: '12px 16px' }}>{r.billDate}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--danger)' }}>{r.dueDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {data.slice(0, 500).map((r) => (
            <div key={r.id} style={{ background: 'var(--bg-muted)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', background: 'var(--bg-soft)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--primary)' }}>{r.senderId}</span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{r.billDate}</span>
              </div>
              <div style={{ padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{r.board} ({r.state})</span>
                  <span style={{ color: 'var(--primary)', fontSize: '12px', background: 'var(--primary-weak)', padding: '2px 6px', borderRadius: '10px' }}>{r.category}</span>
                </div>
                <div style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)', padding: '12px', borderRadius: '8px', fontSize: '14px', lineHeight: '1.5', color: 'var(--text)', fontFamily: 'system-ui' }}>{r.sms}</div>
                {r.paidSms && (
                  <div style={{ marginTop: '8px', background: 'var(--bg-elev)', border: '1px solid var(--border)', borderLeft: '3px solid var(--success)', padding: '12px', borderRadius: '8px', fontSize: '14px', lineHeight: '1.5', color: 'var(--text)', fontFamily: 'system-ui' }}>
                    <div style={{ fontSize: '11px', color: 'var(--success)', marginBottom: '4px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Payment Confirmation</div>
                    {r.paidSms}
                  </div>
                )}
              </div>
            </div>
          ))}
          {data.length > 500 && <div style={{ color: 'var(--text-muted)', padding: '20px' }}>... and {data.length - 500} more rendered as CSV. (SMS View capped to 500 for performance)</div>}
        </div>
      )}
    </div>
  );
}
