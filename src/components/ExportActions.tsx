import React from 'react';

type ExportActionsProps = {
  dataCount: number;
  onExportCSV: () => void;
  onExportJSON: () => void;
  onCopySMS: () => void;
};

export function ExportActions({ dataCount, onExportCSV, onExportJSON, onCopySMS }: ExportActionsProps) {
  return (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      <span style={{ color: 'var(--text-muted)', alignSelf: 'center', marginRight: '10px' }}>{dataCount} records generated</span>
      <button onClick={onExportCSV} style={{ background: 'var(--success)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}>
        Export CSV
      </button>
      <button onClick={onExportJSON} style={{ background: 'var(--primary)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}>
        Export JSON
      </button>
      <button onClick={onCopySMS} style={{ background: 'var(--bg-soft)', color: 'var(--text)', border: '1px solid var(--border-strong)', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}>
        Copy SMS
      </button>
    </div>
  );
}
