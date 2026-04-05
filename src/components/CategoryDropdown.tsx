import React from 'react';

type CategoryDropdownProps = {
  tab: string;
  visibleCategories: string[];
  showCategoryDropdown: boolean;
  setShowCategoryDropdown: (value: boolean) => void;
  categorySearch: string;
  setCategorySearch: (value: string) => void;
  onSelectCategory: (category: string) => void;
};

export function CategoryDropdown({
  tab,
  visibleCategories,
  showCategoryDropdown,
  setShowCategoryDropdown,
  categorySearch,
  setCategorySearch,
  onSelectCategory,
}: CategoryDropdownProps) {
  return (
    <div
      style={{ display: 'flex', gap: '8px', marginBottom: '0', alignItems: 'center', position: 'relative' }}
      onClick={(e) => e.stopPropagation()}
    >
      <div style={{ position: 'relative', minWidth: '250px' }}>
        <div
          className="ui-chip"
          onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
          style={{
            background: 'var(--bg-elev)',
            color: 'var(--text)',
            border: '1px solid var(--border-strong)',
            padding: '10px 16px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 600,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            userSelect: 'none',
            boxShadow: 'var(--shadow)',
          }}
        >
          <span>{tab}</span>
          <span style={{ marginLeft: '8px', fontSize: '12px' }}>▾</span>
        </div>

        {showCategoryDropdown && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 4px)',
              left: 0,
              right: 0,
              background: 'var(--bg-elev)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              zIndex: 1000,
              boxShadow: 'var(--shadow)',
            }}
          >
            <input
              type="text"
              placeholder="Search categories..."
              value={categorySearch}
              onChange={(e) => setCategorySearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                background: 'var(--bg-muted)',
                border: 'none',
                borderBottom: '1px solid var(--border)',
                color: 'var(--text)',
                padding: '10px 12px',
                borderRadius: '7px 7px 0 0',
                outline: 'none',
                boxSizing: 'border-box',
                fontSize: '14px',
              }}
            />
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {visibleCategories
                .filter((cat) => cat.toLowerCase().includes(categorySearch.toLowerCase()))
                .map((cat, idx) => (
                  <div
                    className="ui-chip"
                    key={cat}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectCategory(cat);
                      setShowCategoryDropdown(false);
                      setCategorySearch('');
                    }}
                    style={{
                      background: tab === cat ? 'var(--primary-weak)' : idx % 2 === 0 ? 'var(--bg-muted)' : 'var(--bg-elev)',
                      color: 'var(--text)',
                      padding: '10px 12px',
                      cursor: 'pointer',
                      borderBottom: '1px solid var(--border)',
                      transition: 'all 0.1s',
                      fontSize: '14px',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--bg-soft)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background =
                        tab === cat ? 'var(--primary-weak)' : idx % 2 === 0 ? 'var(--bg-muted)' : 'var(--bg-elev)';
                    }}
                  >
                    {cat}
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
