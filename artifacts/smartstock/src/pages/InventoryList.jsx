import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext.jsx';

const CATEGORIES = ['Produce', 'Dairy', 'Bakery', 'Beverages', 'Snacks', 'Frozen', 'Household'];
const SORT_OPTIONS = [
  { value: 'name-asc',    label: 'Name A–Z' },
  { value: 'qty-asc',     label: 'Quantity (Low to High)' },
  { value: 'qty-desc',    label: 'Quantity (High to Low)' },
  { value: 'expiry-asc',  label: 'Expiry Date (Nearest First)' },
];

function getStatus(product) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysUntilExpiry = Math.ceil((new Date(product.expiryDate) - today) / (1000 * 60 * 60 * 24));
  if (product.quantity <= product.lowStockThreshold) return 'low';
  if (daysUntilExpiry <= 7) return 'expiring';
  return 'normal';
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
}

const statusConfig = {
  low:      { label: 'Low Stock',     bg: '#FEE2E2', color: '#EF4444', border: '#FECACA' },
  expiring: { label: 'Expiring Soon', bg: '#FEF3C7', color: '#D97706', border: '#FDE68A' },
  normal:   { label: 'Normal',        bg: '#D1FAE5', color: '#059669', border: '#A7F3D0' },
};

function StatusBadge({ status }) {
  const cfg = statusConfig[status];
  return (
    <span style={{
      display: 'inline-block', padding: '3px 10px', borderRadius: '20px',
      fontSize: '12px', fontWeight: '600',
      backgroundColor: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
      whiteSpace: 'nowrap',
    }}>
      {cfg.label}
    </span>
  );
}

const styles = {
  pageTitle: { fontSize: '22px', fontWeight: '700', color: '#111827', margin: 0 },
  resultCount: { fontSize: '13px', color: '#6B7280', marginBottom: '12px' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '14px', backgroundColor: '#FFFFFF' },
  th: {
    backgroundColor: '#F9FAFB', color: '#6B7280', fontWeight: '600',
    fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em',
    padding: '12px 16px', textAlign: 'left',
    borderBottom: '1px solid #E5E7EB', whiteSpace: 'nowrap',
  },
  td: {
    padding: '13px 16px', color: '#374151',
    borderBottom: '1px solid #F3F4F6', verticalAlign: 'middle',
  },
  productLink: { color: '#059669', fontWeight: '600' },
  categoryTag: {
    display: 'inline-block', padding: '2px 8px', borderRadius: '4px',
    fontSize: '12px', fontWeight: '500',
    backgroundColor: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0',
  },
  empty: { textAlign: 'center', padding: '48px', color: '#6B7280', fontSize: '15px', backgroundColor: '#FFFFFF' },
};

export default function InventoryList() {
  const { products, isLoading } = useAppContext();
  const navigate = useNavigate();

  const [search, setSearch]             = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sort, setSort]                 = useState('name-asc');
  const [hoveredRow, setHoveredRow]     = useState(null);

  const filtered = useMemo(() => {
    let result = [...products];
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
    }
    if (categoryFilter !== 'All') result = result.filter(p => p.category === categoryFilter);
    result.sort((a, b) => {
      if (sort === 'name-asc')    return a.name.localeCompare(b.name);
      if (sort === 'qty-asc')     return a.quantity - b.quantity;
      if (sort === 'qty-desc')    return b.quantity - a.quantity;
      if (sort === 'expiry-asc')  return new Date(a.expiryDate) - new Date(b.expiryDate);
      return 0;
    });
    return result;
  }, [products, search, categoryFilter, sort]);

  if (isLoading) {
    return (
      <div className="ss-loading">
        <div className="ss-loading-spinner" />
        Loading inventory…
      </div>
    );
  }

  return (
    <div className="ss-page">
      <div className="ss-list-header">
        <h1 style={styles.pageTitle}>Inventory</h1>
        <Link to="/add" className="ss-btn ss-btn-primary">+ Add Product</Link>
      </div>

      <div className="ss-controls">
        <input
          type="search"
          placeholder="Search by name or category…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="ss-input"
          style={{ flex: '1', minWidth: '180px' }}
        />
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="ss-select">
          <option value="All">All Categories</option>
          {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
        <select value={sort} onChange={e => setSort(e.target.value)} className="ss-select">
          {SORT_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      </div>

      <div style={styles.resultCount}>
        Showing <strong style={{ color: '#111827' }}>{filtered.length}</strong> of{' '}
        <strong style={{ color: '#111827' }}>{products.length}</strong> products
      </div>

      <div className="ss-table-wrapper">
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Product Name</th>
              <th style={styles.th}>Category</th>
              <th style={{ ...styles.th, textAlign: 'right' }}>Quantity</th>
              <th style={styles.th}>Expiry Date</th>
              <th style={styles.th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} style={styles.empty}>No products match your filters.</td>
              </tr>
            ) : (
              filtered.map(product => {
                const status = getStatus(product);
                const isHovered = hoveredRow === product.id;
                return (
                  <tr
                    key={product.id}
                    style={{
                      backgroundColor: isHovered ? '#F0FAF4' : 'transparent',
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease',
                    }}
                    onMouseEnter={() => setHoveredRow(product.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                    onClick={() => navigate(`/product/${product.id}`)}
                  >
                    <td style={styles.td}>
                      <Link
                        to={`/product/${product.id}`}
                        style={styles.productLink}
                        onClick={e => e.stopPropagation()}
                      >
                        {product.name}
                      </Link>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.categoryTag}>{product.category}</span>
                    </td>
                    <td style={{ ...styles.td, textAlign: 'right', fontWeight: '600', fontVariantNumeric: 'tabular-nums', color: '#111827' }}>
                      {product.quantity}
                    </td>
                    <td style={styles.td}>{formatDate(product.expiryDate)}</td>
                    <td style={styles.td}><StatusBadge status={status} /></td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
