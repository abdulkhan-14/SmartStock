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
  low:      { label: 'Low Stock',     bg: '#FEE2E2', color: '#EF4444', border: '#FECACA' },
  expiring: { label: 'Expiring Soon', bg: '#FEF3C7', color: '#D97706', border: '#FDE68A' },
  normal:   { label: 'Normal',        bg: '#D1FAE5', color: '#059669', border: '#A7F3D0' },
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
    color: '#10B981', fontSize: '14px', fontWeight: '500', marginBottom: '20px',
    transition: 'opacity 0.2s',
  },
  header: {
    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
    gap: '16px', marginBottom: '24px', flexWrap: 'wrap',
  },
  headerLeft: { display: 'flex', flexDirection: 'column', gap: '10px' },
  productName: { fontSize: '26px', fontWeight: '700', color: '#111827', margin: 0 },
  headerMeta: { display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' },
  categoryChip: {
    display: 'inline-block', padding: '3px 10px', borderRadius: '6px',
    fontSize: '13px', fontWeight: '500',
    backgroundColor: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0',
  },
  card: {
    backgroundColor: '#FFFFFF', border: '1px solid #D1FAE5',
    borderRadius: '12px', padding: '24px', marginBottom: '20px',
    boxShadow: '0 2px 8px rgba(16,185,129,0.06)',
  },
  cardTitle: {
    fontSize: '11px', fontWeight: '700', color: '#059669',
    textTransform: 'uppercase', letterSpacing: '0.08em',
    marginBottom: '16px', paddingBottom: '10px', borderBottom: '1px solid #D1FAE5',
  },
  detailItem: { display: 'flex', flexDirection: 'column', gap: '4px' },
  detailLabel: { fontSize: '11px', fontWeight: '600', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em' },
  detailValue: { fontSize: '16px', fontWeight: '600', color: '#111827' },
  detailValueSub: { fontSize: '13px', color: '#6B7280' },
  qtyForm: { display: 'flex', gap: '10px', alignItems: 'center' },
  qtyInput: {
    width: '130px', padding: '9px 12px', fontSize: '15px', fontFamily: 'inherit',
    backgroundColor: '#FFFFFF', border: '1px solid #D1FAE5', borderRadius: '8px',
    outline: 'none', color: '#111827', boxSizing: 'border-box',
    transition: 'all 0.2s ease',
  },
  successMsg: {
    padding: '8px 14px',
    backgroundColor: '#D1FAE5', color: '#059669',
    border: '1px solid #A7F3D0', borderRadius: '8px',
    fontSize: '13px', fontWeight: '500',
  },
  historyTable: { width: '100%', borderCollapse: 'collapse', fontSize: '14px' },
  historyTh: {
    textAlign: 'left', padding: '8px 12px',
    backgroundColor: '#F9FAFB', color: '#6B7280',
    fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em',
    borderBottom: '1px solid #E5E7EB',
  },
  historyTd: {
    padding: '10px 12px', color: '#374151',
    borderBottom: '1px solid #F3F4F6', verticalAlign: 'middle',
  },
  historyNote: { fontSize: '12px', color: '#9CA3AF', fontStyle: 'italic' },
  qtyDot: { display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', marginRight: '6px' },
  aiNote: {
    backgroundColor: '#FFFBEB',
    border: '1px solid #FDE68A',
    borderLeft: '3px solid #F59E0B',
    borderRadius: '12px', padding: '16px 18px', marginBottom: '20px',
    display: 'flex', gap: '12px', alignItems: 'flex-start',
    boxShadow: '0 2px 8px rgba(245,158,11,0.06)',
  },
  aiNoteText: { fontSize: '14px', color: '#92400E', lineHeight: '1.65', margin: 0 },
};

export default function ProductDetail() {
  const { id }        = useParams();
  const navigate      = useNavigate();
  const { products, isLoading, updateProduct } = useAppContext();

  const product = products.find(p => p.id === id);
  const status  = product ? getStatus(product) : null;

  const [newQty, setNewQty]         = useState('');
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
        <div style={{ color: '#6B7280', fontSize: '15px' }}>Product not found.</div>
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
            <strong style={{ color: '#D97706' }}>AI Suggestion:</strong>{' '}
            Consider reordering this item soon. Based on current stock (
            <strong>{product.quantity} units remaining</strong>),
            you may run out before your next delivery.
          </p>
        </div>
      )}

      {/* Details */}
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
            <span style={product.supplier ? s.detailValue : { ...s.detailValue, color: '#9CA3AF', fontStyle: 'italic' }}>
              {product.supplier || 'Not specified'}
            </span>
          </div>
          <div style={s.detailItem}>
            <span style={s.detailLabel}>Last Updated</span>
            <span style={s.detailValue}>{formatDateTime(product.lastUpdated)}</span>
          </div>
        </div>
      </div>

      {/* Quick Update */}
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
              borderColor: qtyFocused ? '#10B981' : '#D1FAE5',
              boxShadow: qtyFocused ? '0 0 0 3px rgba(16,185,129,0.15)' : 'none',
            }}
          />
          <button type="submit" className="ss-btn ss-btn-primary">Save</button>
          {showSuccess && <span style={s.successMsg}>✓ Quantity updated!</span>}
        </form>
      </div>

      {/* History */}
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
              const pct   = Math.round((entry.quantity / maxHistoryQty) * 100);
              const color = barColor(entry.quantity);
              return (
                <tr key={i}>
                  <td style={s.historyTd}>{formatDate(entry.date)}</td>
                  <td style={{ ...s.historyTd, fontWeight: '600', color: '#111827' }}>
                    <span style={{ ...s.qtyDot, backgroundColor: color }} />
                    {entry.quantity}
                  </td>
                  <td style={s.historyTd}><span style={s.historyNote}>{entry.note}</span></td>
                  <td style={{ ...s.historyTd, minWidth: '120px' }}>
                    <div style={{ backgroundColor: '#F0FAF4', borderRadius: '4px', height: '6px', overflow: 'hidden', border: '1px solid #D1FAE5' }}>
                      <div style={{
                        width: `${pct}%`, height: '100%', backgroundColor: color,
                        borderRadius: '4px', transition: 'width 0.3s',
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
