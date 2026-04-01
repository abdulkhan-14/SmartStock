import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
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

/* ── Shared card/style tokens ─────────────────────────────────── */
const card = (borderColor) => ({
  backgroundColor: '#111827',
  border: '1px solid #1E2D45',
  borderLeft: `3px solid ${borderColor}`,
  borderRadius: '12px',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.2s ease',
});

const cardHeader = (gradientColor = '#00D4FF') => ({
  background: `linear-gradient(90deg, ${gradientColor}12, transparent)`,
  padding: '14px 20px 12px',
  borderBottom: '1px solid #1E2D45',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
});

const sectionLabel = (color = '#00D4FF') => ({
  fontSize: '11px', fontWeight: '700', color,
  textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0,
});

const countChip = (bg, color) => ({
  minWidth: '22px', height: '22px', padding: '0 7px',
  backgroundColor: bg, color,
  borderRadius: '999px', fontSize: '11px', fontWeight: '700',
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
});

const row = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '9px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', gap: '8px',
};
const rowLeft = { display: 'flex', flexDirection: 'column', gap: '2px', flex: 1, minWidth: 0 };
const rowName = { fontSize: '14px', fontWeight: '600', color: '#00D4FF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' };
const rowSub  = { fontSize: '12px', color: '#64748B' };

const categoryPill = {
  display: 'inline-block', padding: '2px 7px', borderRadius: '4px',
  fontSize: '11px', fontWeight: '500', flexShrink: 0,
  backgroundColor: 'rgba(0,212,255,0.08)', color: '#00D4FF', border: '1px solid rgba(0,212,255,0.2)',
};

const urgencyRed   = { fontSize: '12px', fontWeight: '600', color: '#EF4444', whiteSpace: 'nowrap', flexShrink: 0, textShadow: '0 0 8px rgba(239,68,68,0.5)' };
const urgencyAmber = { fontSize: '12px', fontWeight: '600', color: '#F59E0B', whiteSpace: 'nowrap', flexShrink: 0, textShadow: '0 0 8px rgba(245,158,11,0.5)' };
const qtyBadge     = { fontSize: '12px', fontWeight: '700', flexShrink: 0, color: '#EF4444' };

const footerLink = { fontSize: '13px', color: '#00D4FF', fontWeight: '600' };
const cardFooter = { padding: '10px 20px', borderTop: '1px solid #1E2D45', backgroundColor: 'rgba(0,0,0,0.2)' };
const cardBody   = { padding: '14px 20px', flex: 1 };
const allGood    = { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 0', fontSize: '14px', color: '#10B981', fontWeight: '500' };

const summaryItem = {
  backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid #1E2D45',
  borderRadius: '8px', padding: '14px 16px',
  display: 'flex', flexDirection: 'column', gap: '4px',
};
const summaryValue = { fontSize: '28px', fontWeight: '800', color: '#F1F5F9', lineHeight: 1 };
const summaryLabel = { fontSize: '12px', color: '#64748B', fontWeight: '500' };

/* ── Tooltip colors for recharts ──────────────────────────────── */
const CHART_COLORS = ['#00D4FF', '#7C3AED', '#0EA5E9'];

/* ── Main component ───────────────────────────────────────────── */
export default function Dashboard() {
  const { products, isLoading } = useAppContext();

  const lowStock = useMemo(() =>
    products.filter(p => p.quantity <= p.lowStockThreshold), [products]);

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

  const totalUnits   = useMemo(() => products.reduce((s, p) => s + p.quantity, 0), [products]);
  const categorySet  = useMemo(() => [...new Set(products.map(p => p.category))], [products]);

  /* chart: group by category, sum quantities */
  const chartData = useMemo(() => {
    const map = {};
    products.forEach(p => {
      map[p.category] = (map[p.category] || 0) + p.quantity;
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [products]);

  if (isLoading) {
    return (
      <div className="ss-loading">
        <div className="ss-loading-spinner" />
        Loading your inventory…
      </div>
    );
  }

  const lowStockNames = lowStock.map(p => p.name).join(', ');

  return (
    <div className="ss-page">
      {/* Greeting */}
      <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#F1F5F9', margin: '0 0 4px' }}>
        {getGreeting()}, Manager.
      </h1>
      <p style={{ fontSize: '14px', color: '#64748B', margin: '0 0 24px' }}>
        Here's your store overview for Fresh Corner Market.
      </p>

      {/* AI Insight Banner */}
      <div style={{
        display: 'flex', gap: '14px', alignItems: 'flex-start',
        background: 'linear-gradient(135deg, rgba(0,212,255,0.06), rgba(124,58,237,0.06))',
        border: '1px solid rgba(0,212,255,0.2)',
        borderRadius: '12px', padding: '16px 20px', marginBottom: '28px',
      }}>
        <span style={{ fontSize: '22px', flexShrink: 0 }}>🤖</span>
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: '13px', fontWeight: '700', color: '#00D4FF', display: 'block', marginBottom: '4px' }}>
            SmartStock AI
          </span>
          <p style={{ fontSize: '14px', color: '#94A3B8', lineHeight: '1.65', margin: 0 }}>
            You have{' '}
            <strong style={{ color: '#00D4FF' }}>{lowStock.length} low-stock item{lowStock.length !== 1 ? 's' : ''}</strong>
            {' '}and{' '}
            <strong style={{ color: '#00D4FF' }}>{expiringSoon.length} item{expiringSoon.length !== 1 ? 's' : ''} expiring soon</strong>.
            {lowStock.length > 0
              ? <> Consider placing orders for: <strong style={{ color: '#00D4FF' }}>{lowStockNames}</strong>.</>
              : ' All stock levels are currently healthy — great work!'}
          </p>
        </div>
      </div>

      {/* ── Row 1: Low Stock (left) + Chart (right) ── */}
      <div className="ss-grid-2" style={{ marginBottom: '20px' }}>

        {/* Panel 1 — Low Stock */}
        <div style={card('#EF4444')}>
          <div style={cardHeader('#EF4444')}>
            <h2 style={sectionLabel('#EF4444')}>Low Stock Items</h2>
            <span style={countChip('rgba(239,68,68,0.15)', '#EF4444')}>{lowStock.length}</span>
          </div>
          <div style={cardBody}>
            {lowStock.length === 0 ? (
              <div style={allGood}>✓ All stock levels healthy</div>
            ) : (
              lowStock.map(p => (
                <div key={p.id} style={row}>
                  <div style={rowLeft}>
                    <Link to={`/product/${p.id}`} style={rowName}>{p.name}</Link>
                    <span style={rowSub}>Threshold: {p.lowStockThreshold}</span>
                  </div>
                  <span style={categoryPill}>{p.category}</span>
                  <span style={qtyBadge}>{p.quantity} left</span>
                </div>
              ))
            )}
          </div>
          <div style={cardFooter}>
            <Link to="/alerts" style={footerLink}>View All Alerts →</Link>
          </div>
        </div>

        {/* Panel 2 — Inventory by Category Chart */}
        <div style={card('#7C3AED')}>
          <div style={cardHeader('#7C3AED')}>
            <div>
              <h2 style={sectionLabel('#7C3AED')}>Inventory by Category</h2>
            </div>
          </div>
          <div style={{ ...cardBody, paddingBottom: '6px' }}>
            <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 14px' }}>
              Stock distribution across product categories.
            </p>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData} margin={{ top: 6, right: 12, left: -10, bottom: 24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2D45" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#64748B', fontSize: 11 }}
                  axisLine={{ stroke: '#1E2D45' }}
                  tickLine={false}
                  angle={-30}
                  textAnchor="end"
                  height={50}
                />
                <YAxis
                  tick={{ fill: '#64748B', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={v => v > 999 ? `${(v / 1000).toFixed(1)}k` : `${v}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111827',
                    border: '1px solid #1E2D45',
                    borderRadius: '8px',
                    color: '#E2E8F0',
                    fontSize: '13px',
                  }}
                  cursor={{ fill: 'rgba(0,212,255,0.06)' }}
                  formatter={(value) => [`${value} units`, 'Total Units']}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {chartData.map((_, index) => (
                    <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Row 2: Expiring Soon + Fast Moving ── */}
      <div className="ss-grid-2" style={{ marginBottom: '20px' }}>

        {/* Panel 3 — Expiring Soon */}
        <div style={card('#F59E0B')}>
          <div style={cardHeader('#F59E0B')}>
            <h2 style={sectionLabel('#F59E0B')}>Expiring Soon</h2>
            <span style={countChip('rgba(245,158,11,0.15)', '#F59E0B')}>{expiringSoon.length}</span>
          </div>
          <div style={cardBody}>
            {expiringSoon.length === 0 ? (
              <div style={allGood}>✓ No items expiring soon</div>
            ) : (
              expiringSoon.map(p => (
                <div key={p.id} style={row}>
                  <div style={rowLeft}>
                    <Link to={`/product/${p.id}`} style={rowName}>{p.name}</Link>
                    <span style={rowSub}>{formatDate(p.expiryDate)}</span>
                  </div>
                  <span style={p.daysLeft <= 2 ? urgencyRed : urgencyAmber}>
                    {p.daysLeft <= 0 ? 'Today!' : p.daysLeft === 1 ? 'In 1 day' : `In ${p.daysLeft} days`}
                  </span>
                </div>
              ))
            )}
          </div>
          <div style={cardFooter}>
            <Link to="/alerts" style={footerLink}>View All Alerts →</Link>
          </div>
        </div>

        {/* Panel 4 — Fast-Moving */}
        <div style={card('#00D4FF')}>
          <div style={cardHeader('#00D4FF')}>
            <h2 style={sectionLabel('#00D4FF')}>Fast-Moving Products</h2>
            <span style={countChip('rgba(0,212,255,0.12)', '#00D4FF')}>{fastMoving.length}</span>
          </div>
          <div style={cardBody}>
            {fastMoving.map(p => (
              <div key={p.id} style={row}>
                <div style={rowLeft}>
                  <Link to={`/product/${p.id}`} style={rowName}>{p.name}</Link>
                  <span style={rowSub}>Updated {formatDate(p.lastUpdated)}</span>
                </div>
                <span style={categoryPill}>{p.category}</span>
              </div>
            ))}
          </div>
          <div style={cardFooter}>
            <Link to="/inventory" style={footerLink}>View Full Inventory →</Link>
          </div>
        </div>
      </div>

      {/* ── Row 3: Summary (full width) ── */}
      <div style={{ ...card('#7C3AED'), borderRadius: '12px' }}>
        <div style={cardHeader('#7C3AED')}>
          <h2 style={sectionLabel('#7C3AED')}>Inventory Summary</h2>
        </div>
        <div style={{ ...cardBody, paddingTop: '18px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '14px',
          }}>
            <div style={summaryItem}>
              <span style={summaryValue}>{products.length}</span>
              <span style={summaryLabel}>Total SKUs</span>
            </div>
            <div style={summaryItem}>
              <span style={summaryValue}>{totalUnits.toLocaleString()}</span>
              <span style={summaryLabel}>Total Units</span>
            </div>
            <div style={summaryItem}>
              <span style={summaryValue}>{categorySet.length}</span>
              <span style={summaryLabel}>Categories</span>
            </div>
            <div style={summaryItem}>
              <span style={{ ...summaryValue, color: lowStock.length > 0 ? '#EF4444' : '#10B981' }}>
                {lowStock.length}
              </span>
              <span style={summaryLabel}>Low Stock Alerts</span>
            </div>
            <div style={summaryItem}>
              <span style={{ ...summaryValue, color: expiringSoon.length > 0 ? '#EF4444' : '#10B981' }}>
                {expiringSoon.length}
              </span>
              <span style={summaryLabel}>Expiry Alerts (7 days)</span>
            </div>
          </div>
        </div>
        <div style={cardFooter}>
          <Link to="/inventory" style={footerLink}>Manage Inventory →</Link>
        </div>
      </div>
    </div>
  );
}
