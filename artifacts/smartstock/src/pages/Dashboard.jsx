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

const CHART_COLORS = ['#10B981', '#059669', '#34D399'];

/* ── Shared style tokens ──────────────────────────────────────── */
const card = (borderColor) => ({
  backgroundColor: '#FFFFFF',
  border: '1px solid #D1FAE5',
  borderLeft: `3px solid ${borderColor}`,
  borderRadius: '12px',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: '0 2px 8px rgba(16,185,129,0.06)',
  transition: 'box-shadow 0.2s ease',
});

const cardHeader = (accentColor = '#059669') => ({
  background: `linear-gradient(90deg, ${accentColor}0A, transparent)`,
  padding: '14px 20px 12px',
  borderBottom: '1px solid #D1FAE5',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
});

const sectionLabel = (color = '#059669') => ({
  fontSize: '11px', fontWeight: '700', color,
  textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0,
});

const countChip = (bg, color) => ({
  minWidth: '22px', height: '22px', padding: '0 7px',
  backgroundColor: bg, color,
  borderRadius: '999px', fontSize: '11px', fontWeight: '700',
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
});

const rowStyle = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '9px 0', borderBottom: '1px solid #F3F4F6', gap: '8px',
};
const rowLeft = { display: 'flex', flexDirection: 'column', gap: '2px', flex: 1, minWidth: 0 };
const rowName = { fontSize: '14px', fontWeight: '600', color: '#059669', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' };
const rowSub  = { fontSize: '12px', color: '#6B7280' };

const categoryPill = {
  display: 'inline-block', padding: '2px 7px', borderRadius: '4px',
  fontSize: '11px', fontWeight: '500', flexShrink: 0,
  backgroundColor: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0',
};

const urgencyRed   = { fontSize: '12px', fontWeight: '600', color: '#EF4444', whiteSpace: 'nowrap', flexShrink: 0 };
const urgencyAmber = { fontSize: '12px', fontWeight: '600', color: '#D97706', whiteSpace: 'nowrap', flexShrink: 0 };
const qtyBadge     = { fontSize: '12px', fontWeight: '700', flexShrink: 0, color: '#EF4444' };

const footerLinkStyle = { fontSize: '13px', color: '#10B981', fontWeight: '600' };
const cardFooterStyle = { padding: '10px 20px', borderTop: '1px solid #D1FAE5', backgroundColor: '#FAFAFA' };
const cardBodyStyle   = { padding: '14px 20px', flex: 1 };
const allGoodStyle    = { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 0', fontSize: '14px', color: '#059669', fontWeight: '500' };

const summaryItem = {
  backgroundColor: '#F0FAF4', border: '1px solid #D1FAE5',
  borderRadius: '8px', padding: '14px 16px',
  display: 'flex', flexDirection: 'column', gap: '4px',
};
const summaryValue = { fontSize: '28px', fontWeight: '800', color: '#111827', lineHeight: 1 };
const summaryLabel = { fontSize: '12px', color: '#6B7280', fontWeight: '500' };

/* ── Component ────────────────────────────────────────────────── */
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

  const totalUnits  = useMemo(() => products.reduce((s, p) => s + p.quantity, 0), [products]);
  const categorySet = useMemo(() => [...new Set(products.map(p => p.category))], [products]);

  const chartData = useMemo(() => {
    const map = {};
    products.forEach(p => { map[p.category] = (map[p.category] || 0) + p.quantity; });
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
      <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', margin: '0 0 4px' }}>
        {getGreeting()}, Manager.
      </h1>
      <p style={{ fontSize: '14px', color: '#6B7280', margin: '0 0 24px' }}>
        Here's your store overview for Fresh Corner Market.
      </p>

      {/* AI Insight Banner */}
      <div style={{
        display: 'flex', gap: '14px', alignItems: 'flex-start',
        background: '#ECFDF5',
        border: '1px solid #A7F3D0',
        borderRadius: '12px', padding: '16px 20px', marginBottom: '28px',
      }}>
        <span style={{ fontSize: '22px', flexShrink: 0 }}>🤖</span>
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: '13px', fontWeight: '700', color: '#059669', display: 'block', marginBottom: '4px' }}>
            SmartStock AI
          </span>
          <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.65', margin: 0 }}>
            You have{' '}
            <strong style={{ color: '#EF4444' }}>{lowStock.length} low-stock item{lowStock.length !== 1 ? 's' : ''}</strong>
            {' '}and{' '}
            <strong style={{ color: '#D97706' }}>{expiringSoon.length} item{expiringSoon.length !== 1 ? 's' : ''} expiring soon</strong>.
            {lowStock.length > 0
              ? <> Consider placing orders for: <strong style={{ color: '#059669' }}>{lowStockNames}</strong>.</>
              : ' All stock levels are currently healthy — great work!'}
          </p>
        </div>
      </div>

      {/* ── Row 1: Low Stock + Chart ── */}
      <div className="ss-grid-2" style={{ marginBottom: '20px' }}>

        {/* Low Stock */}
        <div style={card('#EF4444')}>
          <div style={cardHeader('#EF4444')}>
            <h2 style={sectionLabel('#EF4444')}>Low Stock Items</h2>
            <span style={countChip('#FEE2E2', '#EF4444')}>{lowStock.length}</span>
          </div>
          <div style={cardBodyStyle}>
            {lowStock.length === 0 ? (
              <div style={allGoodStyle}>✓ All stock levels healthy</div>
            ) : (
              lowStock.map(p => (
                <div key={p.id} style={rowStyle}>
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
          <div style={cardFooterStyle}>
            <Link to="/alerts" style={footerLinkStyle}>View All Alerts →</Link>
          </div>
        </div>

        {/* Inventory by Category Chart */}
        <div style={card('#059669')}>
          <div style={cardHeader('#059669')}>
            <h2 style={sectionLabel('#059669')}>Inventory by Category</h2>
          </div>
          <div style={{ ...cardBodyStyle, paddingBottom: '6px' }}>
            <p style={{ fontSize: '13px', color: '#6B7280', margin: '0 0 14px' }}>
              Stock distribution across product categories.
            </p>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData} margin={{ top: 6, right: 12, left: -10, bottom: 24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#9CA3AF', fontSize: 11 }}
                  axisLine={{ stroke: '#E5E7EB' }}
                  tickLine={false}
                  angle={-30}
                  textAnchor="end"
                  height={50}
                />
                <YAxis
                  tick={{ fill: '#9CA3AF', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={v => v > 999 ? `${(v / 1000).toFixed(1)}k` : `${v}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #D1FAE5',
                    borderRadius: '8px',
                    color: '#111827',
                    fontSize: '13px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  }}
                  cursor={{ fill: 'rgba(16,185,129,0.06)' }}
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

        {/* Expiring Soon */}
        <div style={card('#F59E0B')}>
          <div style={cardHeader('#F59E0B')}>
            <h2 style={sectionLabel('#F59E0B')}>Expiring Soon</h2>
            <span style={countChip('#FEF3C7', '#D97706')}>{expiringSoon.length}</span>
          </div>
          <div style={cardBodyStyle}>
            {expiringSoon.length === 0 ? (
              <div style={allGoodStyle}>✓ No items expiring soon</div>
            ) : (
              expiringSoon.map(p => (
                <div key={p.id} style={rowStyle}>
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
          <div style={cardFooterStyle}>
            <Link to="/alerts" style={footerLinkStyle}>View All Alerts →</Link>
          </div>
        </div>

        {/* Fast-Moving */}
        <div style={card('#10B981')}>
          <div style={cardHeader('#10B981')}>
            <h2 style={sectionLabel('#10B981')}>Fast-Moving Products</h2>
            <span style={countChip('#D1FAE5', '#059669')}>{fastMoving.length}</span>
          </div>
          <div style={cardBodyStyle}>
            {fastMoving.map(p => (
              <div key={p.id} style={rowStyle}>
                <div style={rowLeft}>
                  <Link to={`/product/${p.id}`} style={rowName}>{p.name}</Link>
                  <span style={rowSub}>Updated {formatDate(p.lastUpdated)}</span>
                </div>
                <span style={categoryPill}>{p.category}</span>
              </div>
            ))}
          </div>
          <div style={cardFooterStyle}>
            <Link to="/inventory" style={footerLinkStyle}>View Full Inventory →</Link>
          </div>
        </div>
      </div>

      {/* ── Row 3: Summary (full width) ── */}
      <div style={{ ...card('#059669'), borderRadius: '12px' }}>
        <div style={cardHeader('#059669')}>
          <h2 style={sectionLabel('#059669')}>Inventory Summary</h2>
        </div>
        <div style={{ ...cardBodyStyle, paddingTop: '18px' }}>
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
              <span style={{ ...summaryValue, color: expiringSoon.length > 0 ? '#D97706' : '#10B981' }}>
                {expiringSoon.length}
              </span>
              <span style={summaryLabel}>Expiry Alerts (7 days)</span>
            </div>
          </div>
        </div>
        <div style={cardFooterStyle}>
          <Link to="/inventory" style={footerLinkStyle}>Manage Inventory →</Link>
        </div>
      </div>
    </div>
  );
}
