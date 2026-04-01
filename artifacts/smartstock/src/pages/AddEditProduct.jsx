import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext.jsx';

const CATEGORIES = ['Produce', 'Dairy', 'Bakery', 'Beverages', 'Snacks', 'Frozen', 'Household'];

const styles = {
  page: {
    padding: '32px',
    maxWidth: '640px',
    margin: '0 auto',
  },
  pageTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1F4E79',
    marginBottom: '24px',
    paddingBottom: '12px',
    borderBottom: '2px solid #e5e7eb',
  },
  card: {
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '10px',
    padding: '28px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginBottom: '20px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  required: {
    color: '#ef4444',
    marginLeft: '3px',
  },
  input: {
    padding: '10px 12px',
    fontSize: '15px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    outline: 'none',
    transition: 'border-color 0.15s',
    width: '100%',
    boxSizing: 'border-box',
    color: '#111827',
    backgroundColor: '#f9fafb',
  },
  inputFocus: {
    borderColor: '#1F4E79',
    backgroundColor: '#ffffff',
  },
  select: {
    padding: '10px 12px',
    fontSize: '15px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    color: '#111827',
    backgroundColor: '#f9fafb',
    cursor: 'pointer',
  },
  errorText: {
    fontSize: '12px',
    color: '#ef4444',
    marginTop: '2px',
  },
  divider: {
    borderTop: '1px solid #e5e7eb',
    margin: '24px 0',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    marginTop: '8px',
  },
  actionsLeft: {
    display: 'flex',
    gap: '10px',
  },
  btnSave: {
    padding: '10px 24px',
    backgroundColor: '#1F4E79',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.15s',
  },
  btnCancel: {
    padding: '10px 20px',
    backgroundColor: '#f3f4f6',
    color: '#374151',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '15px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.15s',
  },
  btnDelete: {
    padding: '10px 20px',
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    border: '1px solid #fca5a5',
    borderRadius: '6px',
    fontSize: '15px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.15s',
  },
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  dialog: {
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    padding: '28px',
    maxWidth: '420px',
    width: '90%',
    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
  },
  dialogTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#111827',
    marginBottom: '10px',
  },
  dialogBody: {
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '24px',
    lineHeight: '1.5',
  },
  dialogActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
  },
  btnConfirmDelete: {
    padding: '9px 20px',
    backgroundColor: '#dc2626',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  btnDialogCancel: {
    padding: '9px 20px',
    backgroundColor: '#f3f4f6',
    color: '#374151',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  },
};

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
    name: '',
    category: '',
    quantity: '',
    expiryDate: '',
    supplier: '',
    lowStockThreshold: '10',
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
          ? String(existingProduct.lowStockThreshold)
          : '10',
      });
    }
  }, [isEditMode, existingProduct]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
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
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const productData = {
      name: form.name.trim(),
      category: form.category,
      quantity: Number(form.quantity),
      expiryDate: form.expiryDate,
      supplier: form.supplier.trim(),
      lowStockThreshold: form.lowStockThreshold !== '' ? Number(form.lowStockThreshold) : 10,
      lastUpdated: new Date().toISOString(),
    };

    if (isEditMode) {
      updateProduct(id, productData);
    } else {
      addProduct(productData);
    }

    navigate('/inventory');
  }

  function handleCancel() {
    navigate(-1);
  }

  function handleDeleteConfirm() {
    deleteProduct(id);
    setShowDeleteDialog(false);
    navigate('/inventory');
  }

  function inputStyle(fieldName) {
    return {
      ...styles.input,
      ...(focusedField === fieldName ? styles.inputFocus : {}),
      ...(errors[fieldName] ? { borderColor: '#ef4444' } : {}),
    };
  }

  if (isEditMode && !existingProduct) {
    return (
      <div style={styles.page}>
        <p style={{ color: '#6b7280' }}>Product not found.</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <h1 style={styles.pageTitle}>
        {isEditMode ? 'Edit Product' : 'Add Product'}
      </h1>

      <div style={styles.card}>
        <form onSubmit={handleSave} noValidate>

          <FormField label="Product Name" required error={errors.name}>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              onFocus={() => setFocusedField('name')}
              onBlur={() => setFocusedField(null)}
              placeholder="e.g. Whole Milk 2L"
              style={inputStyle('name')}
            />
          </FormField>

          <FormField label="Category" required error={errors.category}>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              style={{
                ...styles.select,
                ...(errors.category ? { borderColor: '#ef4444' } : {}),
              }}
            >
              <option value="">Select a category…</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </FormField>

          <div style={styles.row}>
            <FormField label="Current Quantity" required error={errors.quantity}>
              <input
                type="number"
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
                onFocus={() => setFocusedField('quantity')}
                onBlur={() => setFocusedField(null)}
                min="0"
                placeholder="0"
                style={inputStyle('quantity')}
              />
            </FormField>

            <FormField label="Low Stock Threshold" error={errors.lowStockThreshold}>
              <input
                type="number"
                name="lowStockThreshold"
                value={form.lowStockThreshold}
                onChange={handleChange}
                onFocus={() => setFocusedField('lowStockThreshold')}
                onBlur={() => setFocusedField(null)}
                min="0"
                placeholder="10"
                style={inputStyle('lowStockThreshold')}
              />
            </FormField>
          </div>

          <FormField label="Expiry Date" required error={errors.expiryDate}>
            <input
              type="date"
              name="expiryDate"
              value={form.expiryDate}
              onChange={handleChange}
              onFocus={() => setFocusedField('expiryDate')}
              onBlur={() => setFocusedField(null)}
              style={inputStyle('expiryDate')}
            />
          </FormField>

          <FormField label="Supplier" error={errors.supplier}>
            <input
              type="text"
              name="supplier"
              value={form.supplier}
              onChange={handleChange}
              onFocus={() => setFocusedField('supplier')}
              onBlur={() => setFocusedField(null)}
              placeholder="e.g. Green Valley Dairy"
              style={inputStyle('supplier')}
            />
          </FormField>

          <div style={styles.divider} />

          <div style={styles.actions}>
            <div style={styles.actionsLeft}>
              <button
                type="submit"
                style={styles.btnSave}
                onMouseOver={e => e.currentTarget.style.backgroundColor = '#163d63'}
                onMouseOut={e => e.currentTarget.style.backgroundColor = '#1F4E79'}
              >
                Save Product
              </button>
              <button
                type="button"
                onClick={handleCancel}
                style={styles.btnCancel}
                onMouseOver={e => e.currentTarget.style.backgroundColor = '#e5e7eb'}
                onMouseOut={e => e.currentTarget.style.backgroundColor = '#f3f4f6'}
              >
                Cancel
              </button>
            </div>

            {isEditMode && (
              <button
                type="button"
                onClick={() => setShowDeleteDialog(true)}
                style={styles.btnDelete}
                onMouseOver={e => e.currentTarget.style.backgroundColor = '#fee2e2'}
                onMouseOut={e => e.currentTarget.style.backgroundColor = '#fef2f2'}
              >
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
              Are you sure you want to delete <strong>{existingProduct?.name}</strong>?
              This action cannot be undone.
            </div>
            <div style={styles.dialogActions}>
              <button
                onClick={() => setShowDeleteDialog(false)}
                style={styles.btnDialogCancel}
                onMouseOver={e => e.currentTarget.style.backgroundColor = '#e5e7eb'}
                onMouseOut={e => e.currentTarget.style.backgroundColor = '#f3f4f6'}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                style={styles.btnConfirmDelete}
                onMouseOver={e => e.currentTarget.style.backgroundColor = '#b91c1c'}
                onMouseOut={e => e.currentTarget.style.backgroundColor = '#dc2626'}
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
