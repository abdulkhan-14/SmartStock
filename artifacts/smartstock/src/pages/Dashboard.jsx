import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext.jsx';

function getDaysUntilExpiry(expiryDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((new Date(expiryDate) - today) / (1000 * 60 * 60 * 24));
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: '2-digit', year: 'numeric',
  });
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

const s = {
  page: { padding: '28px 32px' },
  greetingRow: { marginBottom: '20px' },
  greeting: { fontSize: '22px', fontWeight: '700', color: '#111827', margin: '0 0 4px' },
  greetingSub: { fontSize: '14px', color: '#6b7280', margin: 0 },

  aiBanner: {
    display: 'flex', gap: '14px', alignItems: 'flex-start',
    backgroundColor: '#eff6ff', border: '1px solid #bfdbfe',
    borderRadius: '10px', padding: '16px 20px', marginBottom: '28px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  },
  aiIcon: { fontSize: '22px', flexShrink: 0, marginTop: '1px' },
  aiText: { fontSize: '14px', color: '#1e3a5f', lineHeight: '1.6', margin: 0 },
  aiHighlight: { fontWeight: '700', color: '#1d4ed8' },

  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '20px',
  },
  card: {
    backgroundColor: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '10px',
    overflow: 'hidden',
    boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
    display: 'flex',
    flexDirection: 'column',
  },
  cardHeader: (color) => ({
    borderTop: `4px solid ${color}`,
    padding: '16px 20px 12px',
    borderBottom: '1px solid #f1f5f9',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  }),
  cardTitle: (color) => ({
    fontSize: '14px', fontWeight: '700', color,
    textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0,
  }),
  cardCount: (bg, color) => ({
    minWidth: '24px', height: '24px', padding: '0 7px',
    backgroundColor: bg, color,
    borderRadius: '999px', fontSize: '12px', fontWeight: '700',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  }),
  cardBody: { padding: '14px 20px', flex: 1 },
  cardFooter: {
    padding: '10px 20px', borderTop: '1px solid #f1f5f9',
    backgroundColor: '#fafafa',
  },
  footerLink: {
    fontSize: '13px', color: '#1F4E79', fontWeight: '600', textDecoration: 'none',
  },

  row: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '8px 0', borderBottom: '1px solid #f8fafc',
    gap: '8px',
  },
  rowLeft: { display: 'flex', flexDirection: 'column', gap: '2px', flex: 1, minWidth: 0 },
  rowName: {
    fontSize: '14px', fontWeight: '600', color: '#111827',
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
    textDecoration: 'none',
  },
  rowSub: { fontSize: '12px', color: '#9ca3af' },
  categoryPill: {
    display: 'inline-block', padding: '2px 7px', borderRadius: '4px',
    fontSize: '11px', fontWeight: '500',
    backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe',
    flexShrink: 0,
  },
  urgencyRed: {
    fontSize: '12px', fontWeight: '600', color: '#dc2626',
    whiteSpace: 'nowrap', flexShrink: 0,
  },
  urgencyOrange: {
    fontSize: '12px', fontWeight: '600', color: '#c2410c',
    whiteSpace: 'nowrap', flexShrink: 0,
  },
  qtyBadge: (isLow) => ({
    fontSize: '12px', fontWeight: '700', flexShrink: 0,
    color: isLow ? '#dc2626' : '#374151',
  }),

  allGood: {
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '12px 0', fontSize: '14px', color: '#16a34a', fontWeight: '500',
  },

  summaryGrid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px',
  },
  summaryItem: {
    backgroundColor: '#f8fafc', borderRadius: '8px',
    padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '4px',
  },
  summaryValue: { fontSize: '26px', fontWeight: '800', color: '#111827', lineHeight: 1 },
  summaryLabel: { fontSize: '12px', color: '#6b7280', fontWeight: '500' },
  summaryAlert: { color: '#dc2626' },
  summaryOk: { color: '#111827' },

  fastLabel: {
    fontSize: '11px', fontWeight: '600', color: '#2563eb',
    backgroundColor: '#eff6ff', padding: '2px 7px', borderRadius: '4px',
    border: '1px solid #bfdbfe', flexShrink: 0,
  },
};

export default function Dashboard() {
  const { products } = useAppContext();

  const lowStock = useMemo(
    () => products.filter(p => p.quantity <= p.lowStockThreshold),
    [products]
  );

  const expiringSoon = useMemo(
    () =>
      products
        .map(p => ({ ...p, daysLeft: getDaysUntilExpiry(p.expiryDate) }))
        .filter(p => p.daysLeft <= 7)
        .sort((a, b) => a.daysLeft - b.daysLeft),
    [products]
  );

  const fastMoving = useMemo(
    () =>
      [...products]
        .sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated))
        .slice(0, 5),
    [products]
  );

  const totalUnits = useMemo(
    () => products.reduce((sum, p) => sum + p.quantity, 0),
    [products]
  );

  const categories = useMemo(
    () => new Set(products.map(p => p.category)).size,
    [products]
  );

  const lowStockNames = lowStock.map(p => p.name).join(', ');

  return (
    <div style={s.page}>
      {/* Greeting */}
      <div style={s.greetingRow}>
        <h1 style={s.greeting}>{getGreeting()}, Manager.</h1>
        <p style={s.greetingSub}>Here's your store overview for Fresh Corner Market.</p>
      </div>

      {/* AI Insight Banner */}
      <div style={s.aiBanner}>
        <span style={s.aiIcon}>🤖</span>
        <p style={s.aiText}>
          <span style={s.aiHighlight}>SmartStock AI: </span>
          You have{' '}
          <span style={s.aiHighlight}>{lowStock.length} low stock item{lowStock.length !== 1 ? 's' : ''}</span>
          {' '}and{' '}
          <span style={s.aiHighlight}>{expiringSoon.length} item{expiringSoon.length !== 1 ? 's' : ''} expiring soon</span>.
          {lowStock.length > 0 && (
            <> Consider placing orders for: <span style={s.aiHighlight}>{lowStockNames}</span>.</>
          )}
          {lowStock.length === 0 && ' All stock levels are currently healthy — great work!'}
        </p>
      </div>

      {/* 2×2 Grid */}
      <div style={s.grid}>

        {/* Panel 1 — Low Stock */}
        <div style={s.card}>
          <div style={s.cardHeader('#dc2626')}>
            <h2 style={s.cardTitle('#dc2626')}>Low Stock Items</h2>
            <span style={s.cardCount(lowStock.length > 0 ? '#fef2f2' : '#f0fdf4', lowStock.length > 0 ? '#dc2626' : '#16a34a')}>
              {lowStock.length}
            </span>
          </div>
          <div style={s.cardBody}>
            {lowStock.length === 0 ? (
              <div style={s.allGood}>✓ All stock levels healthy</div>
            ) : (
              lowStock.map(p => (
                <div key={p.id} style={s.row}>
                  <div style={s.rowLeft}>
                    <Link to={`/product/${p.id}`} style={s.rowName}>{p.name}</Link>
                    <span style={s.rowSub}>Threshold: {p.lowStockThreshold}</span>
                  </div>
                  <span style={s.categoryPill}>{p.category}</span>
                  <span style={s.qtyBadge(true)}>{p.quantity} left</span>
                </div>
              ))
            )}
          </div>
          <div style={s.cardFooter}>
            <Link to="/alerts" style={s.footerLink}>View All Alerts →</Link>
          </div>
        </div>

        {/* Panel 2 — Expiring Soon */}
        <div style={s.card}>
          <div style={s.cardHeader('#f97316')}>
            <h2 style={s.cardTitle('#f97316')}>Expiring Soon</h2>
            <span style={s.cardCount(expiringSoon.length > 0 ? '#fff7ed' : '#f0fdf4', expiringSoon.length > 0 ? '#c2410c' : '#16a34a')}>
              {expiringSoon.length}
            </span>
          </div>
          <div style={s.cardBody}>
            {expiringSoon.length === 0 ? (
              <div style={s.allGood}>✓ No items expiring soon</div>
            ) : (
              expiringSoon.map(p => (
                <div key={p.id} style={s.row}>
                  <div style={s.rowLeft}>
                    <Link to={`/product/${p.id}`} style={s.rowName}>{p.name}</Link>
                    <span style={s.rowSub}>{formatDate(p.expiryDate)}</span>
                  </div>
                  <span style={p.daysLeft <= 2 ? s.urgencyRed : s.urgencyOrange}>
                    {p.daysLeft <= 0 ? 'Today!' : p.daysLeft === 1 ? 'In 1 day' : `In ${p.daysLeft} days`}
                  </span>
                </div>
              ))
            )}
          </div>
          <div style={s.cardFooter}>
            <Link to="/alerts" style={s.footerLink}>View All Alerts →</Link>
          </div>
        </div>

        {/* Panel 3 — Fast-Moving */}
        <div style={s.card}>
          <div style={s.cardHeader('#2563eb')}>
            <h2 style={s.cardTitle('#2563eb')}>Fast-Moving Products</h2>
            <span style={s.cardCount('#eff6ff', '#2563eb')}>{fastMoving.length}</span>
          </div>
          <div style={s.cardBody}>
            {fastMoving.map(p => (
              <div key={p.id} style={s.row}>
                <div style={s.rowLeft}>
                  <Link to={`/product/${p.id}`} style={s.rowName}>{p.name}</Link>
                  <span style={s.rowSub}>Updated {formatDate(p.lastUpdated)}</span>
                </div>
                <span style={s.categoryPill}>{p.category}</span>
              </div>
            ))}
          </div>
          <div style={s.cardFooter}>
            <Link to="/inventory" style={s.footerLink}>View Full Inventory →</Link>
          </div>
        </div>

        {/* Panel 4 — Summary */}
        <div style={s.card}>
          <div style={s.cardHeader('#1F4E79')}>
            <h2 style={s.cardTitle('#1F4E79')}>Inventory Summary</h2>
          </div>
          <div style={{ ...s.cardBody, paddingTop: '18px' }}>
            <div style={s.summaryGrid}>
              <div style={s.summaryItem}>
                <span style={s.summaryValue}>{products.length}</span>
                <span style={s.summaryLabel}>Total SKUs</span>
              </div>
              <div style={s.summaryItem}>
                <span style={s.summaryValue}>{totalUnits.toLocaleString()}</span>
                <span style={s.summaryLabel}>Total Units</span>
              </div>
              <div style={s.summaryItem}>
                <span style={s.summaryValue}>{categories}</span>
                <span style={s.summaryLabel}>Categories</span>
              </div>
              <div style={s.summaryItem}>
                <span style={{ ...s.summaryValue, ...(lowStock.length > 0 ? s.summaryAlert : {}) }}>
                  {lowStock.length}
                </span>
                <span style={s.summaryLabel}>Low Stock Alerts</span>
              </div>
              <div style={{ ...s.summaryItem, gridColumn: 'span 2' }}>
                <span style={{ ...s.summaryValue, ...(expiringSoon.length > 0 ? s.summaryAlert : {}) }}>
                  {expiringSoon.length}
                </span>
                <span style={s.summaryLabel}>Expiry Alerts (next 7 days)</span>
              </div>
            </div>
          </div>
          <div style={s.cardFooter}>
            <Link to="/inventory" style={s.footerLink}>Manage Inventory →</Link>
          </div>
        </div>

      </div>
    </div>
  );
}
