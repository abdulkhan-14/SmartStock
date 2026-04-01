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

const styles = {
  header: { display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '28px' },
  pageTitle: { fontSize: '22px', fontWeight: '700', color: '#F1F5F9', margin: 0 },
  totalBadge: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    minWidth: '28px', height: '28px', padding: '0 8px',
    backgroundColor: 'rgba(239,68,68,0.15)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.35)',
    borderRadius: '999px', fontSize: '13px', fontWeight: '700',
  },
  zeroBadge: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    minWidth: '28px', height: '28px', padding: '0 8px',
    backgroundColor: 'rgba(16,185,129,0.15)', color: '#10B981', border: '1px solid rgba(16,185,129,0.35)',
    borderRadius: '999px', fontSize: '13px', fontWeight: '700',
  },
  section: { marginBottom: '32px' },
  sectionHeader: {
    display: 'flex', alignItems: 'center', gap: '10px',
    marginBottom: '14px', paddingBottom: '10px', borderBottom: '1px solid #1E2D45',
  },
  sectionTitle: { fontSize: '16px', fontWeight: '600', color: '#CBD5E1', margin: 0 },
  sectionCount: {
    padding: '2px 8px', borderRadius: '999px', fontSize: '12px', fontWeight: '600',
    backgroundColor: 'rgba(239,68,68,0.12)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.25)',
  },
  sectionCountOk: {
    padding: '2px 8px', borderRadius: '999px', fontSize: '12px', fontWeight: '600',
    backgroundColor: 'rgba(16,185,129,0.12)', color: '#10B981', border: '1px solid rgba(16,185,129,0.25)',
  },
  cardLeft: { display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 },
  productName: { fontSize: '15px', fontWeight: '600', color: '#E2E8F0' },
  cardMeta: { display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', marginTop: '4px' },
  metaItem: { fontSize: '13px', color: '#64748B' },
  metaValue: { fontWeight: '600', color: '#94A3B8' },
  urgencyRed: {
    display: 'inline-block', padding: '3px 10px', borderRadius: '20px',
    fontSize: '12px', fontWeight: '600',
    backgroundColor: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)',
    whiteSpace: 'nowrap', textShadow: '0 0 8px rgba(239,68,68,0.5)',
  },
  urgencyAmber: {
    display: 'inline-block', padding: '3px 10px', borderRadius: '20px',
    fontSize: '12px', fontWeight: '600',
    backgroundColor: 'rgba(245,158,11,0.1)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.3)',
    whiteSpace: 'nowrap', textShadow: '0 0 8px rgba(245,158,11,0.5)',
  },
  categoryPill: {
    display: 'inline-block', padding: '2px 8px', borderRadius: '4px',
    fontSize: '12px', fontWeight: '500',
    backgroundColor: 'rgba(0,212,255,0.08)', color: '#00D4FF', border: '1px solid rgba(0,212,255,0.2)',
  },
  aiCard: {
    backgroundColor: '#0F172A',
    border: '1px solid rgba(124,58,237,0.3)',
    borderLeft: '3px solid #7C3AED',
    borderRadius: '12px', padding: '16px 18px', marginBottom: '10px',
    transition: 'all 0.2s ease',
  },
  aiCardText: { fontSize: '14px', color: '#94A3B8', lineHeight: '1.65', margin: 0 },
  aiCardHighlight: { color: '#A78BFA', fontWeight: '600' },
  allGood: {
    padding: '16px 20px', borderRadius: '12px',
    backgroundColor: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)',
    color: '#10B981', fontSize: '14px', fontWeight: '500',
  },
};

function SectionHeader({ title, count }) {
  return (
    <div style={styles.sectionHeader}>
      <h2 style={styles.sectionTitle}>{title}</h2>
      <span style={count > 0 ? styles.sectionCount : styles.sectionCountOk}>{count}</span>
    </div>
  );
}

export default function Alerts() {
  const { products, isLoading } = useAppContext();

  const lowStockItems = useMemo(() => products.filter(p => p.quantity <= p.lowStockThreshold), [products]);
  const expiringSoonItems = useMemo(() =>
    products
      .map(p => ({ ...p, daysLeft: getDaysUntilExpiry(p.expiryDate) }))
      .filter(p => p.daysLeft <= 7)
      .sort((a, b) => a.daysLeft - b.daysLeft),
    [products]
  );
  const totalAlerts = lowStockItems.length + expiringSoonItems.length;

  if (isLoading) {
    return (
      <div className="ss-loading">
        <div className="ss-loading-spinner" />
        Loading alerts…
      </div>
    );
  }

  return (
    <div className="ss-page" style={{ maxWidth: '860px', margin: '0 auto' }}>
      <div style={styles.header}>
        <h1 style={styles.pageTitle}>Alerts</h1>
        <span style={totalAlerts > 0 ? styles.totalBadge : styles.zeroBadge}>{totalAlerts}</span>
        <span style={{ fontSize: '13px', color: '#64748B' }}>
          {totalAlerts === 1 ? 'active alert' : 'active alerts'}
        </span>
      </div>

      {/* ── Section 1: Low Stock ── */}
      <div style={styles.section}>
        <SectionHeader title="Low Stock Alerts" count={lowStockItems.length} />
        {lowStockItems.length === 0 ? (
          <div style={styles.allGood}>✓ No alerts — all stock levels healthy!</div>
        ) : (
          lowStockItems.map(product => (
            <div key={product.id} className="ss-alert-card">
              <div style={styles.cardLeft}>
                <span style={styles.productName}>{product.name}</span>
                <div style={styles.cardMeta}>
                  <span style={styles.categoryPill}>{product.category}</span>
                  <span style={styles.metaItem}>Qty: <span style={styles.metaValue}>{product.quantity}</span></span>
                  <span style={styles.metaItem}>Threshold: <span style={styles.metaValue}>{product.lowStockThreshold}</span></span>
                  <span style={styles.urgencyRed}>Only {product.quantity} unit{product.quantity !== 1 ? 's' : ''} left</span>
                </div>
              </div>
              <Link to={`/edit/${product.id}`} className="ss-btn ss-btn-primary">Update Quantity</Link>
            </div>
          ))
        )}
      </div>

      {/* ── Section 2: Expiring Soon ── */}
      <div style={styles.section}>
        <SectionHeader title="Expiring Soon" count={expiringSoonItems.length} />
        {expiringSoonItems.length === 0 ? (
          <div style={styles.allGood}>✓ No items expiring soon!</div>
        ) : (
          expiringSoonItems.map(product => {
            const urgencyStyle = product.daysLeft <= 2 ? styles.urgencyRed : styles.urgencyAmber;
            const urgencyText = product.daysLeft <= 0
              ? 'Expires today!'
              : product.daysLeft === 1 ? 'Expires in 1 day'
              : `Expires in ${product.daysLeft} days`;
            return (
              <div key={product.id} className="ss-alert-card">
                <div style={styles.cardLeft}>
                  <span style={styles.productName}>{product.name}</span>
                  <div style={styles.cardMeta}>
                    <span style={styles.categoryPill}>{product.category}</span>
                    <span style={styles.metaItem}>Expiry: <span style={styles.metaValue}>{formatDate(product.expiryDate)}</span></span>
                    <span style={urgencyStyle}>{urgencyText}</span>
                  </div>
                </div>
                <Link to={`/edit/${product.id}`} className="ss-btn ss-btn-primary">Update Stock</Link>
              </div>
            );
          })
        )}
      </div>

      {/* ── Section 3: AI Reorder Suggestions ── */}
      <div style={styles.section}>
        <SectionHeader title="AI Reorder Suggestions" count={lowStockItems.length} />
        {lowStockItems.length === 0 ? (
          <div style={styles.allGood}>✓ No reorder suggestions needed right now!</div>
        ) : (
          lowStockItems.map(product => (
            <div key={product.id} style={styles.aiCard}>
              <p style={styles.aiCardText}>
                🤖{' '}
                <span style={styles.aiCardHighlight}>
                  Consider reordering {product.name}.
                </span>
                <br />
                Current stock:{' '}
                <span style={styles.aiCardHighlight}>{product.quantity} units</span>{' '}
                (threshold: {product.lowStockThreshold}). Suggested reorder:{' '}
                <span style={styles.aiCardHighlight}>{product.lowStockThreshold * 3} units</span>.
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
