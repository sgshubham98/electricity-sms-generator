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
      <span style={{ color: '#94a3b8', alignSelf: 'center', marginRight: '10px' }}>{dataCount} records generated</span>
      <button onClick={onExportCSV} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>
        Export CSV
      </button>
      <button onClick={onExportJSON} style={{ background: '#f59e0b', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>
        Export JSON
      </button>
      <button onClick={onCopySMS} style={{ background: '#6b7280', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>
        Copy SMS
      </button>
    </div>
  );
}
