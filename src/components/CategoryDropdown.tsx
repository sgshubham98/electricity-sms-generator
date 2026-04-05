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
      style={{ display: 'flex', gap: '8px', marginBottom: '20px', alignItems: 'center', position: 'relative' }}
      onClick={(e) => e.stopPropagation()}
    >
      <div style={{ position: 'relative', minWidth: '250px' }}>
        <div
          onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
          style={{
            background: '#3b82f6',
            color: '#fff',
            border: '1px solid #60a5fa',
            padding: '10px 16px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            userSelect: 'none',
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
              background: '#1e293b',
              border: '1px solid #475569',
              borderRadius: '8px',
              zIndex: 1000,
              boxShadow: '0 10px 15px rgba(0,0,0,0.3)',
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
                background: '#0f172a',
                border: 'none',
                borderBottom: '1px solid #475569',
                color: '#f8fafc',
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
                    key={cat}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectCategory(cat);
                      setShowCategoryDropdown(false);
                      setCategorySearch('');
                    }}
                    style={{
                      background: tab === cat ? '#3b82f6' : idx % 2 === 0 ? '#0f172a' : '#1e293b',
                      color: '#f8fafc',
                      padding: '10px 12px',
                      cursor: 'pointer',
                      borderBottom: '1px solid #334155',
                      transition: 'all 0.1s',
                      fontSize: '14px',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#334155';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background =
                        tab === cat ? '#3b82f6' : idx % 2 === 0 ? '#0f172a' : '#1e293b';
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
