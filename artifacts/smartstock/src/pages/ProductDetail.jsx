import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext.jsx';

function getDaysUntilExpiry(expiryDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((new Date(expiryDate) - today) / (1000 * 60 * 60 * 24));
}

function getStatus(product) {
  const daysLeft = getDaysUntilExpiry(product.expiryDate);
  if (product.quantity <= product.lowStockThreshold) return 'low';
  if (daysLeft <= 7) return 'expiring';
  return 'normal';
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
}

function formatDateTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

const statusConfig = {
  low:      { label: 'Low Stock',     bg: 'rgba(239,68,68,0.1)',  color: '#EF4444', border: 'rgba(239,68,68,0.3)' },
  expiring: { label: 'Expiring Soon', bg: 'rgba(245,158,11,0.1)', color: '#F59E0B', border: 'rgba(245,158,11,0.3)' },
  normal:   { label: 'Normal',        bg: 'rgba(16,185,129,0.1)', color: '#10B981', border: 'rgba(16,185,129,0.3)' },
};

function StatusBadge({ status }) {
  const cfg = statusConfig[status];
  return (
    <span style={{
      display: 'inline-block', padding: '4px 12px', borderRadius: '20px',
      fontSize: '13px', fontWeight: '600',
      backgroundColor: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
    }}>
      {cfg.label}
    </span>
  );
}

function generateHistory(product) {
  const entries = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let runningQty = product.quantity + Math.floor(Math.random() * 30) + 20;
  for (let i = 4; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i * 6);
    if (i === 0) {
      runningQty = product.quantity;
    } else {
      runningQty = Math.max(product.quantity, runningQty - (Math.floor(Math.random() * 10) + 2));
    }
    const notes = ['Restocked', 'Sold units', 'Inventory count', 'Sold units', 'Current stock'];
    entries.push({ date: date.toISOString().split('T')[0], quantity: runningQty, note: notes[4 - i] });
  }
  return entries;
}

const s = {
  backLink: {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    color: '#00D4FF', fontSize: '14px', fontWeight: '500', marginBottom: '20px',
    transition: 'opacity 0.2s',
  },
  header: {
    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
    gap: '16px', marginBottom: '24px', flexWrap: 'wrap',
  },
  headerLeft: { display: 'flex', flexDirection: 'column', gap: '10px' },
  productName: { fontSize: '26px', fontWeight: '700', color: '#F1F5F9', margin: 0 },
  headerMeta: { display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' },
  categoryChip: {
    display: 'inline-block', padding: '3px 10px', borderRadius: '6px',
    fontSize: '13px', fontWeight: '500',
    backgroundColor: 'rgba(0,212,255,0.08)', color: '#00D4FF', border: '1px solid rgba(0,212,255,0.2)',
  },
  card: {
    backgroundColor: '#111827', border: '1px solid #1E2D45',
    borderRadius: '12px', padding: '24px', marginBottom: '20px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
    transition: 'box-shadow 0.2s ease',
  },
  cardTitle: {
    fontSize: '11px', fontWeight: '700', color: '#00D4FF',
    textTransform: 'uppercase', letterSpacing: '0.1em',
    marginBottom: '16px', paddingBottom: '10px', borderBottom: '1px solid #1E2D45',
  },
  detailItem: { display: 'flex', flexDirection: 'column', gap: '4px' },
  detailLabel: { fontSize: '11px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em' },
  detailValue: { fontSize: '16px', fontWeight: '600', color: '#E2E8F0' },
  detailValueSub: { fontSize: '13px', color: '#64748B' },
  qtyForm: { display: 'flex', gap: '10px', alignItems: 'center' },
  qtyInput: {
    width: '130px', padding: '9px 12px', fontSize: '15px', fontFamily: 'inherit',
    backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px',
    outline: 'none', color: '#E2E8F0', boxSizing: 'border-box',
    transition: 'all 0.2s ease',
  },
  successMsg: {
    padding: '8px 14px',
    backgroundColor: 'rgba(16,185,129,0.1)', color: '#10B981',
    border: '1px solid rgba(16,185,129,0.3)', borderRadius: '8px',
    fontSize: '13px', fontWeight: '500',
  },
  historyTable: { width: '100%', borderCollapse: 'collapse', fontSize: '14px' },
  historyTh: {
    textAlign: 'left', padding: '8px 12px',
    backgroundColor: 'rgba(0,0,0,0.2)', color: '#64748B',
    fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em',
    borderBottom: '1px solid #1E2D45',
  },
  historyTd: {
    padding: '10px 12px', color: '#94A3B8',
    borderBottom: '1px solid rgba(255,255,255,0.04)', verticalAlign: 'middle',
  },
  historyNote: { fontSize: '12px', color: '#475569', fontStyle: 'italic' },
  qtyDot: { display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', marginRight: '6px' },
  aiNote: {
    background: 'linear-gradient(135deg, rgba(245,158,11,0.06), rgba(239,68,68,0.06))',
    border: '1px solid rgba(245,158,11,0.25)',
    borderLeft: '3px solid #F59E0B',
    borderRadius: '12px', padding: '16px 18px', marginBottom: '20px',
    display: 'flex', gap: '12px', alignItems: 'flex-start',
  },
  aiNoteText: { fontSize: '14px', color: '#94A3B8', lineHeight: '1.65', margin: 0 },
};

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, isLoading, updateProduct } = useAppContext();

  const product = products.find(p => p.id === id);
  const status = product ? getStatus(product) : null;

  const [newQty, setNewQty] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [qtyFocused, setQtyFocused] = useState(false);

  useEffect(() => {
    if (product) setNewQty(String(product.quantity));
  }, [product?.id]);

  const history = useMemo(() => product ? generateHistory(product) : [], [product?.id]);

  function handleQtySave(e) {
    e.preventDefault();
    const qty = Number(newQty);
    if (isNaN(qty) || qty < 0) return;
    updateProduct(id, { quantity: qty });
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  }

  if (isLoading) {
    return (
      <div className="ss-loading">
        <div className="ss-loading-spinner" />
        Loading product…
      </div>
    );
  }

  if (!product) {
    return (
      <div className="ss-page" style={{ maxWidth: '780px', margin: '0 auto' }}>
        <Link to="/inventory" style={s.backLink}>← Back to Inventory</Link>
        <div style={{ color: '#64748B', fontSize: '15px' }}>Product not found.</div>
      </div>
    );
  }

  const maxHistoryQty = Math.max(...history.map(h => h.quantity));

  const barColor = (qty) =>
    qty <= product.lowStockThreshold ? '#EF4444'
    : qty <= product.lowStockThreshold * 1.5 ? '#F59E0B'
    : '#10B981';

  return (
    <div className="ss-page" style={{ maxWidth: '780px', margin: '0 auto' }}>
      <Link to="/inventory" style={s.backLink}>← Back to Inventory</Link>

      {/* Header */}
      <div style={s.header}>
        <div style={s.headerLeft}>
          <h1 style={s.productName}>{product.name}</h1>
          <div style={s.headerMeta}>
            <StatusBadge status={status} />
            <span style={s.categoryChip}>{product.category}</span>
          </div>
        </div>
        <Link to={`/edit/${product.id}`} className="ss-btn ss-btn-primary">Edit Product</Link>
      </div>

      {/* AI warning */}
      {status === 'low' && (
        <div style={s.aiNote}>
          <span style={{ fontSize: '20px', flexShrink: 0 }}>🤖</span>
          <p style={s.aiNoteText}>
            <strong style={{ color: '#F59E0B' }}>AI Suggestion:</strong>{' '}
            Consider reordering this item soon. Based on current stock (
            <strong style={{ color: '#E2E8F0' }}>{product.quantity} units remaining</strong>),
            you may run out before your next delivery.
          </p>
        </div>
      )}

      {/* Details card */}
      <div style={s.card}>
        <div style={s.cardTitle}>Product Details</div>
        <div className="ss-details-grid">
          <div style={s.detailItem}>
            <span style={s.detailLabel}>Current Quantity</span>
            <span style={s.detailValue}>{product.quantity} units</span>
          </div>
          <div style={s.detailItem}>
            <span style={s.detailLabel}>Low Stock Threshold</span>
            <span style={s.detailValue}>{product.lowStockThreshold} units</span>
          </div>
          <div style={s.detailItem}>
            <span style={s.detailLabel}>Expiry Date</span>
            <span style={s.detailValue}>{formatDate(product.expiryDate)}</span>
            <span style={s.detailValueSub}>{getDaysUntilExpiry(product.expiryDate)} days remaining</span>
          </div>
          <div style={s.detailItem}>
            <span style={s.detailLabel}>Supplier</span>
            <span style={product.supplier ? s.detailValue : { ...s.detailValue, color: '#475569', fontStyle: 'italic' }}>
              {product.supplier || 'Not specified'}
            </span>
          </div>
          <div style={s.detailItem}>
            <span style={s.detailLabel}>Last Updated</span>
            <span style={s.detailValue}>{formatDateTime(product.lastUpdated)}</span>
          </div>
        </div>
      </div>

      {/* Quick Update Quantity */}
      <div style={s.card}>
        <div style={s.cardTitle}>Quick Update Quantity</div>
        <form onSubmit={handleQtySave} style={s.qtyForm}>
          <input
            type="number" min="0" value={newQty}
            onChange={e => setNewQty(e.target.value)}
            onFocus={() => setQtyFocused(true)}
            onBlur={() => setQtyFocused(false)}
            style={{
              ...s.qtyInput,
              borderColor: qtyFocused ? '#00D4FF' : '#334155',
              boxShadow: qtyFocused ? '0 0 0 3px rgba(0,212,255,0.15)' : 'none',
            }}
          />
          <button type="submit" className="ss-btn ss-btn-primary">Save</button>
          {showSuccess && <span style={s.successMsg}>✓ Quantity updated!</span>}
        </form>
      </div>

      {/* Quantity History */}
      <div style={s.card}>
        <div style={s.cardTitle}>Quantity History</div>
        <table style={s.historyTable}>
          <thead>
            <tr>
              <th style={s.historyTh}>Date</th>
              <th style={s.historyTh}>Quantity</th>
              <th style={s.historyTh}>Note</th>
              <th style={s.historyTh}>Level</th>
            </tr>
          </thead>
          <tbody>
            {history.map((entry, i) => {
              const pct = Math.round((entry.quantity / maxHistoryQty) * 100);
              const color = barColor(entry.quantity);
              return (
                <tr key={i}>
                  <td style={s.historyTd}>{formatDate(entry.date)}</td>
                  <td style={{ ...s.historyTd, fontWeight: '600', color: '#E2E8F0' }}>
                    <span style={{ ...s.qtyDot, backgroundColor: color }} />
                    {entry.quantity}
                  </td>
                  <td style={s.historyTd}><span style={s.historyNote}>{entry.note}</span></td>
                  <td style={{ ...s.historyTd, minWidth: '120px' }}>
                    <div style={{ backgroundColor: '#1E293B', borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${pct}%`, height: '100%', backgroundColor: color,
                        borderRadius: '4px', transition: 'width 0.3s',
                        boxShadow: `0 0 6px ${color}60`,
                      }} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
