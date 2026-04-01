import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext.jsx';

const CATEGORIES = ['Produce', 'Dairy', 'Bakery', 'Beverages', 'Snacks', 'Frozen', 'Household'];

const SORT_OPTIONS = [
  { value: 'name-asc', label: 'Name A–Z' },
  { value: 'qty-asc', label: 'Quantity (Low to High)' },
  { value: 'qty-desc', label: 'Quantity (High to Low)' },
  { value: 'expiry-asc', label: 'Expiry Date (Nearest First)' },
];

function getStatus(product) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(product.expiryDate);
  const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
  const isLow = product.quantity <= product.lowStockThreshold;
  const isExpiringSoon = daysUntilExpiry <= 7;
  if (isLow) return 'low';
  if (isExpiringSoon) return 'expiring';
  return 'normal';
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
}

const statusConfig = {
  low:      { label: 'Low Stock',     bg: '#fef2f2', color: '#dc2626', border: '#fca5a5' },
  expiring: { label: 'Expiring Soon', bg: '#fff7ed', color: '#c2410c', border: '#fdba74' },
  normal:   { label: 'Normal',        bg: '#f0fdf4', color: '#16a34a', border: '#86efac' },
};

function StatusBadge({ status }) {
  const cfg = statusConfig[status];
  return (
    <span style={{
      display: 'inline-block', padding: '3px 10px', borderRadius: '999px',
      fontSize: '12px', fontWeight: '600',
      backgroundColor: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
      whiteSpace: 'nowrap',
    }}>
      {cfg.label}
    </span>
  );
}

const styles = {
  pageTitle: { fontSize: '22px', fontWeight: '700', color: '#1F4E79', margin: 0 },
  resultCount: { fontSize: '13px', color: '#6b7280', marginBottom: '12px' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '14px' },
  th: {
    backgroundColor: '#f8fafc', color: '#374151', fontWeight: '600',
    fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.04em',
    padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', whiteSpace: 'nowrap',
  },
  td: {
    padding: '13px 16px', color: '#111827',
    borderBottom: '1px solid #f1f5f9', verticalAlign: 'middle',
  },
  productLink: { color: '#1F4E79', fontWeight: '600' },
  categoryTag: {
    display: 'inline-block', padding: '2px 8px', borderRadius: '4px',
    fontSize: '12px', fontWeight: '500',
    backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe',
  },
  empty: { textAlign: 'center', padding: '48px', color: '#6b7280', fontSize: '15px' },
};

export default function InventoryList() {
  const { products, isLoading } = useAppContext();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sort, setSort] = useState('name-asc');
  const [hoveredRow, setHoveredRow] = useState(null);

  const filtered = useMemo(() => {
    let result = [...products];
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
      );
    }
    if (categoryFilter !== 'All') {
      result = result.filter(p => p.category === categoryFilter);
    }
    result.sort((a, b) => {
      if (sort === 'name-asc') return a.name.localeCompare(b.name);
      if (sort === 'qty-asc') return a.quantity - b.quantity;
      if (sort === 'qty-desc') return b.quantity - a.quantity;
      if (sort === 'expiry-asc') return new Date(a.expiryDate) - new Date(b.expiryDate);
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
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="ss-select"
        >
          <option value="All">All Categories</option>
          {CATEGORIES.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          className="ss-select"
        >
          {SORT_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <div style={styles.resultCount}>
        Showing <strong>{filtered.length}</strong> of <strong>{products.length}</strong> products
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
                    style={{ backgroundColor: isHovered ? '#f0f6ff' : '#ffffff', cursor: 'pointer' }}
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
                    <td style={{ ...styles.td, textAlign: 'right', fontWeight: '600', fontVariantNumeric: 'tabular-nums' }}>
                      {product.quantity}
                    </td>
                    <td style={styles.td}>{formatDate(product.expiryDate)}</td>
                    <td style={styles.td}>
                      <StatusBadge status={status} />
                    </td>
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
