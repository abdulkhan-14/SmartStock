import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext.jsx';

const CATEGORIES = ['Produce', 'Dairy', 'Bakery', 'Beverages', 'Snacks', 'Frozen', 'Household'];

const styles = {
  pageTitle: {
    fontSize: '24px', fontWeight: '700', color: '#F1F5F9',
    marginBottom: '24px', paddingBottom: '12px', borderBottom: '1px solid #1E2D45',
  },
  card: {
    backgroundColor: '#111827', border: '1px solid #1E2D45',
    borderRadius: '12px', padding: '28px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
  },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '20px' },
  label: { fontSize: '13px', fontWeight: '500', color: '#94A3B8' },
  required: { color: '#EF4444', marginLeft: '3px' },
  errorText: { fontSize: '12px', color: '#EF4444', marginTop: '2px' },
  divider: { borderTop: '1px solid #1E2D45', margin: '24px 0' },
  overlay: {
    position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    backdropFilter: 'blur(4px)',
  },
  dialog: {
    backgroundColor: '#111827', border: '1px solid #1E2D45',
    borderRadius: '12px', padding: '28px',
    maxWidth: '420px', width: '90%', boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
  },
  dialogTitle: { fontSize: '18px', fontWeight: '700', color: '#F1F5F9', marginBottom: '10px' },
  dialogBody: { fontSize: '14px', color: '#94A3B8', marginBottom: '24px', lineHeight: '1.6' },
  dialogActions: { display: 'flex', justifyContent: 'flex-end', gap: '10px' },
};

function inputStyle(isFocused, hasError) {
  return {
    width: '100%', boxSizing: 'border-box',
    padding: '10px 12px', fontSize: '15px', fontFamily: 'inherit',
    backgroundColor: '#1E293B', color: '#E2E8F0',
    border: `1px solid ${hasError ? '#EF4444' : isFocused ? '#00D4FF' : '#334155'}`,
    borderRadius: '8px', outline: 'none',
    boxShadow: isFocused ? (hasError ? '0 0 0 3px rgba(239,68,68,0.15)' : '0 0 0 3px rgba(0,212,255,0.15)') : 'none',
    transition: 'all 0.2s ease',
  };
}

function selectStyle(hasError) {
  return {
    width: '100%', boxSizing: 'border-box',
    padding: '10px 12px', fontSize: '15px', fontFamily: 'inherit',
    backgroundColor: '#1E293B', color: '#E2E8F0',
    border: `1px solid ${hasError ? '#EF4444' : '#334155'}`,
    borderRadius: '8px', outline: 'none', cursor: 'pointer',
  };
}

function FormField({ label, required, error, children }) {
  return (
    <div style={styles.fieldGroup}>
      <label style={styles.label}>
        {label}
        {required && <span style={styles.required}>*</span>}
      </label>
      {children}
      {error && <span style={styles.errorText}>{error}</span>}
    </div>
  );
}

export default function AddEditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, addProduct, updateProduct, deleteProduct } = useAppContext();

  const isEditMode = Boolean(id);
  const existingProduct = isEditMode ? products.find(p => p.id === id) : null;

  const [form, setForm] = useState({
    name: '', category: '', quantity: '', expiryDate: '', supplier: '', lowStockThreshold: '10',
  });
  const [errors, setErrors] = useState({});
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  useEffect(() => {
    if (isEditMode && existingProduct) {
      setForm({
        name: existingProduct.name || '',
        category: existingProduct.category || '',
        quantity: existingProduct.quantity !== undefined ? String(existingProduct.quantity) : '',
        expiryDate: existingProduct.expiryDate || '',
        supplier: existingProduct.supplier || '',
        lowStockThreshold: existingProduct.lowStockThreshold !== undefined
          ? String(existingProduct.lowStockThreshold) : '10',
      });
    }
  }, [isEditMode, existingProduct]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  }

  function validate() {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Product name is required.';
    if (!form.category) newErrors.category = 'Please select a category.';
    if (form.quantity === '' || isNaN(Number(form.quantity)) || Number(form.quantity) < 0) {
      newErrors.quantity = 'Enter a valid quantity (0 or more).';
    }
    if (!form.expiryDate) newErrors.expiryDate = 'Expiry date is required.';
    return newErrors;
  }

  function handleSave(e) {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    const productData = {
      name: form.name.trim(), category: form.category,
      quantity: Number(form.quantity), expiryDate: form.expiryDate,
      supplier: form.supplier.trim(),
      lowStockThreshold: form.lowStockThreshold !== '' ? Number(form.lowStockThreshold) : 10,
      lastUpdated: new Date().toISOString(),
    };
    if (isEditMode) { updateProduct(id, productData); } else { addProduct(productData); }
    navigate('/inventory');
  }

  function handleDeleteConfirm() {
    deleteProduct(id);
    setShowDeleteDialog(false);
    navigate('/inventory');
  }

  if (isEditMode && !existingProduct) {
    return (
      <div className="ss-page" style={{ maxWidth: '640px', margin: '0 auto' }}>
        <p style={{ color: '#64748B' }}>Product not found.</p>
      </div>
    );
  }

  return (
    <div className="ss-page" style={{ maxWidth: '640px', margin: '0 auto' }}>
      <h1 style={styles.pageTitle}>{isEditMode ? 'Edit Product' : 'Add Product'}</h1>

      <div style={styles.card}>
        <form onSubmit={handleSave} noValidate>

          <FormField label="Product Name" required error={errors.name}>
            <input
              type="text" name="name" value={form.name} onChange={handleChange}
              onFocus={() => setFocusedField('name')} onBlur={() => setFocusedField(null)}
              placeholder="e.g. Whole Milk 2L"
              style={inputStyle(focusedField === 'name', !!errors.name)}
            />
          </FormField>

          <FormField label="Category" required error={errors.category}>
            <select
              name="category" value={form.category} onChange={handleChange}
              style={selectStyle(!!errors.category)}
            >
              <option value="">Select a category…</option>
              {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </FormField>

          <div className="ss-form-row">
            <FormField label="Current Quantity" required error={errors.quantity}>
              <input
                type="number" name="quantity" value={form.quantity} onChange={handleChange}
                onFocus={() => setFocusedField('quantity')} onBlur={() => setFocusedField(null)}
                min="0" placeholder="0"
                style={inputStyle(focusedField === 'quantity', !!errors.quantity)}
              />
            </FormField>
            <FormField label="Low Stock Threshold" error={errors.lowStockThreshold}>
              <input
                type="number" name="lowStockThreshold" value={form.lowStockThreshold} onChange={handleChange}
                onFocus={() => setFocusedField('lowStockThreshold')} onBlur={() => setFocusedField(null)}
                min="0" placeholder="10"
                style={inputStyle(focusedField === 'lowStockThreshold', false)}
              />
            </FormField>
          </div>

          <FormField label="Expiry Date" required error={errors.expiryDate}>
            <input
              type="date" name="expiryDate" value={form.expiryDate} onChange={handleChange}
              onFocus={() => setFocusedField('expiryDate')} onBlur={() => setFocusedField(null)}
              style={{ ...inputStyle(focusedField === 'expiryDate', !!errors.expiryDate), colorScheme: 'dark' }}
            />
          </FormField>

          <FormField label="Supplier" error={errors.supplier}>
            <input
              type="text" name="supplier" value={form.supplier} onChange={handleChange}
              onFocus={() => setFocusedField('supplier')} onBlur={() => setFocusedField(null)}
              placeholder="e.g. Green Valley Dairy"
              style={inputStyle(focusedField === 'supplier', false)}
            />
          </FormField>

          <div style={styles.divider} />

          <div className="ss-form-actions">
            <div className="ss-form-actions-left">
              <button type="submit" className="ss-btn ss-btn-primary">Save Product</button>
              <button type="button" onClick={() => navigate(-1)} className="ss-btn ss-btn-secondary">Cancel</button>
            </div>
            {isEditMode && (
              <button type="button" onClick={() => setShowDeleteDialog(true)} className="ss-btn ss-btn-danger">
                Delete Product
              </button>
            )}
          </div>
        </form>
      </div>

      {showDeleteDialog && (
        <div style={styles.overlay}>
          <div style={styles.dialog}>
            <div style={styles.dialogTitle}>Delete Product?</div>
            <div style={styles.dialogBody}>
              Are you sure you want to delete <strong style={{ color: '#E2E8F0' }}>{existingProduct?.name}</strong>?
              This action cannot be undone.
            </div>
            <div style={styles.dialogActions}>
              <button onClick={() => setShowDeleteDialog(false)} className="ss-btn ss-btn-secondary">Cancel</button>
              <button
                onClick={handleDeleteConfirm}
                className="ss-btn"
                style={{ background: '#EF4444', color: '#fff', border: 'none' }}
                onMouseOver={e => e.currentTarget.style.background = '#DC2626'}
                onMouseOut={e => e.currentTarget.style.background = '#EF4444'}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
