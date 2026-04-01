import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext.jsx';

function getDaysUntilExpiry(expiryDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  return Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: '2-digit', year: 'numeric',
  });
}

const styles = {
  header: { display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '28px' },
  pageTitle: { fontSize: '22px', fontWeight: '700', color: '#1F4E79', margin: 0 },
  totalBadge: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    minWidth: '28px', height: '28px', padding: '0 8px',
    backgroundColor: '#dc2626', color: '#fff',
    borderRadius: '999px', fontSize: '13px', fontWeight: '700',
  },
  zeroBadge: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    minWidth: '28px', height: '28px', padding: '0 8px',
    backgroundColor: '#16a34a', color: '#fff',
    borderRadius: '999px', fontSize: '13px', fontWeight: '700',
  },
  section: { marginBottom: '32px' },
  sectionHeader: {
    display: 'flex', alignItems: 'center', gap: '10px',
    marginBottom: '14px', paddingBottom: '10px', borderBottom: '2px solid #e5e7eb',
  },
  sectionTitle: { fontSize: '16px', fontWeight: '700', color: '#111827', margin: 0 },
  sectionCount: {
    padding: '2px 8px', borderRadius: '999px', fontSize: '12px', fontWeight: '600',
    backgroundColor: '#fee2e2', color: '#dc2626',
  },
  sectionCountOk: {
    padding: '2px 8px', borderRadius: '999px', fontSize: '12px', fontWeight: '600',
    backgroundColor: '#dcfce7', color: '#16a34a',
  },
  cardLeft: { display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 },
  productName: { fontSize: '15px', fontWeight: '600', color: '#111827' },
  cardMeta: { display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', marginTop: '2px' },
  metaItem: { fontSize: '13px', color: '#6b7280' },
  metaValue: { fontWeight: '600', color: '#374151' },
  urgencyRed: {
    display: 'inline-block', padding: '3px 10px', borderRadius: '999px',
    fontSize: '12px', fontWeight: '600',
    backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5', whiteSpace: 'nowrap',
  },
  urgencyOrange: {
    display: 'inline-block', padding: '3px 10px', borderRadius: '999px',
    fontSize: '12px', fontWeight: '600',
    backgroundColor: '#fff7ed', color: '#c2410c', border: '1px solid #fdba74', whiteSpace: 'nowrap',
  },
  categoryPill: {
    display: 'inline-block', padding: '2px 8px', borderRadius: '4px',
    fontSize: '12px', fontWeight: '500',
    backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe',
  },
  aiCard: {
    backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px',
    padding: '14px 18px', marginBottom: '10px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  },
  aiCardText: { fontSize: '14px', color: '#1e3a5f', lineHeight: '1.6', margin: 0 },
  allGood: {
    padding: '16px 20px', borderRadius: '8px',
    backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0',
    color: '#15803d', fontSize: '14px', fontWeight: '500',
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

  const lowStockItems = useMemo(
    () => products.filter(p => p.quantity <= p.lowStockThreshold),
    [products]
  );

  const expiringSoonItems = useMemo(
    () =>
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
        <span style={{ fontSize: '13px', color: '#6b7280' }}>
          {totalAlerts === 1 ? 'active alert' : 'active alerts'}
        </span>
      </div>

      {/* ── Section 1: Low Stock ── */}
      <div style={styles.section}>
        <SectionHeader title="Low Stock Alerts" count={lowStockItems.length} />
        {lowStockItems.length === 0 ? (
          <div style={styles.allGood}>No alerts in this category — you're all good!</div>
        ) : (
          lowStockItems.map(product => (
            <div key={product.id} className="ss-alert-card">
              <div style={styles.cardLeft}>
                <span style={styles.productName}>{product.name}</span>
                <div style={styles.cardMeta}>
                  <span style={styles.categoryPill}>{product.category}</span>
                  <span style={styles.metaItem}>
                    Qty: <span style={styles.metaValue}>{product.quantity}</span>
                  </span>
                  <span style={styles.metaItem}>
                    Threshold: <span style={styles.metaValue}>{product.lowStockThreshold}</span>
                  </span>
                  <span style={styles.urgencyRed}>
                    Only {product.quantity} unit{product.quantity !== 1 ? 's' : ''} left
                  </span>
                </div>
              </div>
              <Link to={`/edit/${product.id}`} className="ss-btn ss-btn-primary">
                Update Quantity
              </Link>
            </div>
          ))
        )}
      </div>

      {/* ── Section 2: Expiring Soon ── */}
      <div style={styles.section}>
        <SectionHeader title="Expiring Soon" count={expiringSoonItems.length} />
        {expiringSoonItems.length === 0 ? (
          <div style={styles.allGood}>No alerts in this category — you're all good!</div>
        ) : (
          expiringSoonItems.map(product => {
            const urgencyStyle = product.daysLeft <= 2 ? styles.urgencyRed : styles.urgencyOrange;
            const urgencyText = product.daysLeft <= 0
              ? 'Expires today!'
              : product.daysLeft === 1
              ? 'Expires in 1 day'
              : `Expires in ${product.daysLeft} days`;

            return (
              <div key={product.id} className="ss-alert-card">
                <div style={styles.cardLeft}>
                  <span style={styles.productName}>{product.name}</span>
                  <div style={styles.cardMeta}>
                    <span style={styles.categoryPill}>{product.category}</span>
                    <span style={styles.metaItem}>
                      Expiry: <span style={styles.metaValue}>{formatDate(product.expiryDate)}</span>
                    </span>
                    <span style={urgencyStyle}>{urgencyText}</span>
                  </div>
                </div>
                <Link to={`/edit/${product.id}`} className="ss-btn ss-btn-primary">
                  Update Stock
                </Link>
              </div>
            );
          })
        )}
      </div>

      {/* ── Section 3: AI Reorder Suggestions ── */}
      <div style={styles.section}>
        <SectionHeader title="AI Reorder Suggestions" count={lowStockItems.length} />
        {lowStockItems.length === 0 ? (
          <div style={styles.allGood}>No alerts in this category — you're all good!</div>
        ) : (
          lowStockItems.map(product => {
            const suggested = product.lowStockThreshold * 3;
            return (
              <div key={product.id} style={styles.aiCard}>
                <p style={styles.aiCardText}>
                  🤖 <strong>Based on low stock levels, consider reordering {product.name}.</strong>
                  <br />
                  Current stock: <strong>{product.quantity} units</strong> (threshold:{' '}
                  {product.lowStockThreshold}). Suggested reorder:{' '}
                  <strong>{suggested} units</strong>.
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
