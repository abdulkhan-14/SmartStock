import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext.jsx';

function getDaysUntilExpiry(expiryDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  return Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
}

function getStatus(product) {
  const daysLeft = getDaysUntilExpiry(product.expiryDate);
  const isLow = product.quantity <= product.lowStockThreshold;
  const isExpiring = daysLeft <= 7;
  if (isLow) return 'low';
  if (isExpiring) return 'expiring';
  return 'normal';
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: '2-digit', year: 'numeric',
  });
}

function formatDateTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
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
      display: 'inline-block', padding: '4px 12px', borderRadius: '999px',
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
      const drop = Math.floor(Math.random() * 10) + 2;
      runningQty = Math.max(product.quantity, runningQty - drop);
    }
    const notes = ['Restocked', 'Sold units', 'Inventory count', 'Sold units', 'Current stock'];
    entries.push({
      date: date.toISOString().split('T')[0],
      quantity: runningQty,
      note: notes[4 - i],
    });
  }
  return entries;
}

const s = {
  page: { padding: '28px 32px', maxWidth: '780px', margin: '0 auto' },
  backLink: {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    color: '#1F4E79', fontSize: '14px', fontWeight: '500',
    textDecoration: 'none', marginBottom: '20px',
  },
  header: {
    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
    gap: '16px', marginBottom: '24px', flexWrap: 'wrap',
  },
  headerLeft: { display: 'flex', flexDirection: 'column', gap: '10px' },
  productName: { fontSize: '26px', fontWeight: '700', color: '#111827', margin: 0 },
  headerMeta: { display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' },
  categoryChip: {
    display: 'inline-block', padding: '3px 10px', borderRadius: '4px',
    fontSize: '13px', fontWeight: '500',
    backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe',
  },
  editBtn: {
    padding: '9px 18px', backgroundColor: '#1F4E79', color: '#fff',
    border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '600',
    cursor: 'pointer', textDecoration: 'none', display: 'inline-block',
    flexShrink: 0,
  },
  card: {
    backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px',
    padding: '24px', marginBottom: '20px',
    boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
  },
  cardTitle: {
    fontSize: '14px', fontWeight: '700', color: '#374151',
    textTransform: 'uppercase', letterSpacing: '0.05em',
    marginBottom: '16px', paddingBottom: '10px',
    borderBottom: '1px solid #f1f5f9',
  },
  detailsGrid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px',
  },
  detailItem: { display: 'flex', flexDirection: 'column', gap: '3px' },
  detailLabel: { fontSize: '12px', fontWeight: '600', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.04em' },
  detailValue: { fontSize: '16px', fontWeight: '600', color: '#111827' },
  detailValueSub: { fontSize: '14px', color: '#6b7280' },
  qtyForm: { display: 'flex', gap: '10px', alignItems: 'center' },
  qtyInput: {
    width: '120px', padding: '9px 12px', fontSize: '15px',
    border: '1px solid #d1d5db', borderRadius: '6px',
    outline: 'none', color: '#111827', backgroundColor: '#f9fafb',
    boxSizing: 'border-box',
  },
  saveBtn: {
    padding: '9px 20px', backgroundColor: '#1F4E79', color: '#fff',
    border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '600',
    cursor: 'pointer',
  },
  successMsg: {
    padding: '8px 14px', backgroundColor: '#f0fdf4', color: '#16a34a',
    border: '1px solid #86efac', borderRadius: '6px',
    fontSize: '13px', fontWeight: '500',
  },
  historyTable: { width: '100%', borderCollapse: 'collapse', fontSize: '14px' },
  historyTh: {
    textAlign: 'left', padding: '8px 12px',
    backgroundColor: '#f8fafc', color: '#374151',
    fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em',
    borderBottom: '1px solid #e5e7eb',
  },
  historyTd: {
    padding: '10px 12px', color: '#374151',
    borderBottom: '1px solid #f1f5f9', verticalAlign: 'middle',
  },
  historyNote: { fontSize: '12px', color: '#9ca3af', fontStyle: 'italic' },
  qtyDot: {
    display: 'inline-block', width: '8px', height: '8px',
    borderRadius: '50%', marginRight: '6px',
  },
  aiNote: {
    backgroundColor: '#fefce8', border: '1px solid #fde68a', borderRadius: '8px',
    padding: '16px 18px', marginBottom: '20px',
    display: 'flex', gap: '12px', alignItems: 'flex-start',
  },
  aiNoteText: { fontSize: '14px', color: '#92400e', lineHeight: '1.6', margin: 0 },
  notFound: { padding: '32px', color: '#6b7280', fontSize: '15px' },
};

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, updateProduct } = useAppContext();

  const product = products.find(p => p.id === id);
  const status = product ? getStatus(product) : null;

  const [newQty, setNewQty] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

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

  if (!product) {
    return (
      <div style={s.page}>
        <Link to="/inventory" style={s.backLink}>← Back to Inventory</Link>
        <div style={s.notFound}>Product not found.</div>
      </div>
    );
  }

  const maxHistoryQty = Math.max(...history.map(h => h.quantity));

  return (
    <div style={s.page}>
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
        <Link
          to={`/edit/${product.id}`}
          style={s.editBtn}
          onMouseOver={e => e.currentTarget.style.backgroundColor = '#163d63'}
          onMouseOut={e => e.currentTarget.style.backgroundColor = '#1F4E79'}
        >
          Edit Product
        </Link>
      </div>

      {/* AI warning if low stock */}
      {status === 'low' && (
        <div style={s.aiNote}>
          <span style={{ fontSize: '20px', flexShrink: 0 }}>🤖</span>
          <p style={s.aiNoteText}>
            <strong>AI Suggestion:</strong> Consider reordering this item soon. Based on current
            stock ({product.quantity} units remaining), you may run out before your next delivery.
          </p>
        </div>
      )}

      {/* Details card */}
      <div style={s.card}>
        <div style={s.cardTitle}>Product Details</div>
        <div style={s.detailsGrid}>
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
            <span style={s.detailValueSub}>
              {getDaysUntilExpiry(product.expiryDate)} days remaining
            </span>
          </div>
          <div style={s.detailItem}>
            <span style={s.detailLabel}>Supplier</span>
            <span style={product.supplier ? s.detailValue : { ...s.detailValue, color: '#9ca3af', fontStyle: 'italic' }}>
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
            type="number"
            min="0"
            value={newQty}
            onChange={e => setNewQty(e.target.value)}
            style={s.qtyInput}
          />
          <button
            type="submit"
            style={s.saveBtn}
            onMouseOver={e => e.currentTarget.style.backgroundColor = '#163d63'}
            onMouseOut={e => e.currentTarget.style.backgroundColor = '#1F4E79'}
          >
            Save
          </button>
          {showSuccess && (
            <span style={s.successMsg}>Quantity updated successfully!</span>
          )}
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
              const barColor = entry.quantity <= product.lowStockThreshold
                ? '#dc2626' : entry.quantity <= product.lowStockThreshold * 1.5
                ? '#f97316' : '#16a34a';
              return (
                <tr key={i}>
                  <td style={s.historyTd}>{formatDate(entry.date)}</td>
                  <td style={{ ...s.historyTd, fontWeight: '600' }}>
                    <span style={{ ...s.qtyDot, backgroundColor: barColor }} />
                    {entry.quantity}
                  </td>
                  <td style={s.historyTd}>
                    <span style={s.historyNote}>{entry.note}</span>
                  </td>
                  <td style={{ ...s.historyTd, minWidth: '120px' }}>
                    <div style={{ backgroundColor: '#f1f5f9', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${pct}%`, height: '100%',
                        backgroundColor: barColor, borderRadius: '4px',
                        transition: 'width 0.3s',
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
