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
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

const s = {
  greeting: { fontSize: '22px', fontWeight: '700', color: '#F1F5F9', margin: '0 0 4px' },
  greetingSub: { fontSize: '14px', color: '#64748B', margin: '0 0 24px' },

  aiBanner: {
    display: 'flex', gap: '14px', alignItems: 'flex-start',
    background: 'linear-gradient(135deg, rgba(0,212,255,0.06), rgba(124,58,237,0.06))',
    border: '1px solid rgba(0,212,255,0.2)',
    borderRadius: '12px', padding: '16px 20px', marginBottom: '28px',
  },
  aiLabel: {
    fontSize: '12px', fontWeight: '700', color: '#00D4FF',
    textTransform: 'uppercase', letterSpacing: '0.08em',
    marginBottom: '4px', display: 'block',
  },
  aiText: { fontSize: '14px', color: '#94A3B8', lineHeight: '1.65', margin: 0 },
  aiHighlight: { fontWeight: '700', color: '#00D4FF' },

  card: (borderColor) => ({
    backgroundColor: '#111827',
    border: '1px solid #1E2D45',
    borderLeft: `3px solid ${borderColor}`,
    borderRadius: '12px',
    overflow: 'hidden',
    display: 'flex', flexDirection: 'column',
    transition: 'all 0.2s ease',
  }),
  cardHeader: {
    background: 'linear-gradient(90deg, rgba(0,212,255,0.07), transparent)',
    padding: '14px 20px 12px',
    borderBottom: '1px solid #1E2D45',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: '11px', fontWeight: '700', color: '#00D4FF',
    textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0,
  },
  cardTitleWarning: {
    fontSize: '11px', fontWeight: '700', color: '#F59E0B',
    textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0,
  },
  cardTitleDanger: {
    fontSize: '11px', fontWeight: '700', color: '#EF4444',
    textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0,
  },
  cardTitlePurple: {
    fontSize: '11px', fontWeight: '700', color: '#7C3AED',
    textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0,
  },
  cardCount: (bg, color) => ({
    minWidth: '22px', height: '22px', padding: '0 7px',
    backgroundColor: bg, color, borderRadius: '999px',
    fontSize: '11px', fontWeight: '700',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  }),
  cardBody: { padding: '14px 20px', flex: 1 },
  cardFooter: {
    padding: '10px 20px', borderTop: '1px solid #1E2D45',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  footerLink: { fontSize: '13px', color: '#00D4FF', fontWeight: '600' },

  row: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', gap: '8px',
  },
  rowLeft: { display: 'flex', flexDirection: 'column', gap: '2px', flex: 1, minWidth: 0 },
  rowName: {
    fontSize: '14px', fontWeight: '600', color: '#00D4FF',
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
  },
  rowSub: { fontSize: '12px', color: '#64748B' },

  categoryPill: {
    display: 'inline-block', padding: '2px 7px', borderRadius: '4px',
    fontSize: '11px', fontWeight: '500',
    backgroundColor: 'rgba(0,212,255,0.08)', color: '#00D4FF',
    border: '1px solid rgba(0,212,255,0.2)', flexShrink: 0,
  },
  urgencyRed: { fontSize: '12px', fontWeight: '600', color: '#EF4444', whiteSpace: 'nowrap', flexShrink: 0, textShadow: '0 0 8px rgba(239,68,68,0.5)' },
  urgencyAmber: { fontSize: '12px', fontWeight: '600', color: '#F59E0B', whiteSpace: 'nowrap', flexShrink: 0, textShadow: '0 0 8px rgba(245,158,11,0.5)' },
  qtyBadge: { fontSize: '12px', fontWeight: '700', flexShrink: 0, color: '#EF4444' },

  allGood: {
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '12px 0', fontSize: '14px', color: '#10B981', fontWeight: '500',
  },

  summaryItem: {
    backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid #1E2D45',
    borderRadius: '8px', padding: '14px 16px',
    display: 'flex', flexDirection: 'column', gap: '4px',
  },
  summaryValue: { fontSize: '28px', fontWeight: '800', color: '#F1F5F9', lineHeight: 1 },
  summaryLabel: { fontSize: '12px', color: '#64748B', fontWeight: '500' },
  summaryAlert: { color: '#EF4444' },
};

export default function Dashboard() {
  const { products, isLoading } = useAppContext();

  const lowStock = useMemo(() => products.filter(p => p.quantity <= p.lowStockThreshold), [products]);
  const expiringSoon = useMemo(() =>
    products
      .map(p => ({ ...p, daysLeft: getDaysUntilExpiry(p.expiryDate) }))
      .filter(p => p.daysLeft <= 7)
      .sort((a, b) => a.daysLeft - b.daysLeft),
    [products]
  );
  const fastMoving = useMemo(() =>
    [...products].sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated)).slice(0, 5),
    [products]
  );
  const totalUnits = useMemo(() => products.reduce((sum, p) => sum + p.quantity, 0), [products]);
  const categories = useMemo(() => new Set(products.map(p => p.category)).size, [products]);
  const lowStockNames = lowStock.map(p => p.name).join(', ');

  if (isLoading) {
    return (
      <div className="ss-loading">
        <div className="ss-loading-spinner" />
        Loading your inventory…
      </div>
    );
  }

  return (
    <div className="ss-page">
      <h1 style={s.greeting}>{getGreeting()}, Manager.</h1>
      <p style={s.greetingSub}>Here's your store overview for Fresh Corner Market.</p>

      {/* AI Insight Banner */}
      <div style={s.aiBanner}>
        <span style={{ fontSize: '22px', flexShrink: 0 }}>🤖</span>
        <div style={{ flex: 1 }}>
          <span style={s.aiLabel}>AI Insight</span>
          <p style={s.aiText}>
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
      </div>

      {/* 2×2 Grid */}
      <div className="ss-grid-2">

        {/* Panel 1 — Low Stock */}
        <div style={s.card('#EF4444')}>
          <div style={s.cardHeader}>
            <h2 style={s.cardTitleDanger}>Low Stock Items</h2>
            <span style={s.cardCount('rgba(239,68,68,0.15)', '#EF4444')}>{lowStock.length}</span>
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
                  <span style={s.qtyBadge}>{p.quantity} left</span>
                </div>
              ))
            )}
          </div>
          <div style={s.cardFooter}>
            <Link to="/alerts" style={s.footerLink}>View All Alerts →</Link>
          </div>
        </div>

        {/* Panel 2 — Expiring Soon */}
        <div style={s.card('#F59E0B')}>
          <div style={{ ...s.cardHeader, background: 'linear-gradient(90deg, rgba(245,158,11,0.07), transparent)' }}>
            <h2 style={s.cardTitleWarning}>Expiring Soon</h2>
            <span style={s.cardCount('rgba(245,158,11,0.15)', '#F59E0B')}>{expiringSoon.length}</span>
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
                  <span style={p.daysLeft <= 2 ? s.urgencyRed : s.urgencyAmber}>
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
        <div style={s.card('#00D4FF')}>
          <div style={s.cardHeader}>
            <h2 style={s.cardTitle}>Fast-Moving Products</h2>
            <span style={s.cardCount('rgba(0,212,255,0.12)', '#00D4FF')}>{fastMoving.length}</span>
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
        <div style={s.card('#7C3AED')}>
          <div style={{ ...s.cardHeader, background: 'linear-gradient(90deg, rgba(124,58,237,0.1), transparent)' }}>
            <h2 style={s.cardTitlePurple}>Inventory Summary</h2>
          </div>
          <div style={{ ...s.cardBody, paddingTop: '18px' }}>
            <div className="ss-summary-grid">
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
                <span style={{ ...s.summaryValue, ...(lowStock.length > 0 ? s.summaryAlert : { color: '#10B981' }) }}>
                  {lowStock.length}
                </span>
                <span style={s.summaryLabel}>Low Stock Alerts</span>
              </div>
              <div style={{ ...s.summaryItem, gridColumn: 'span 2' }}>
                <span style={{ ...s.summaryValue, ...(expiringSoon.length > 0 ? s.summaryAlert : { color: '#10B981' }) }}>
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
