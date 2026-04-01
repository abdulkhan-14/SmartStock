import { createContext, useContext, useState, useEffect } from 'react';
import sampleData from '../sampleData.js';

const AppContext = createContext(null);

const STORAGE_KEY = 'smartstock_products';

export function AppProvider({ children }) {
  const [products, setProducts] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load from localStorage:', e);
    }
    return sampleData;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }, [products]);

  function addProduct(product) {
    const newProduct = {
      ...product,
      id: 'prod_' + Date.now(),
      lastUpdated: new Date().toISOString(),
    };
    setProducts(prev => [...prev, newProduct]);
  }

  function updateProduct(id, updatedProduct) {
    setProducts(prev =>
      prev.map(p =>
        p.id === id
          ? { ...p, ...updatedProduct, lastUpdated: new Date().toISOString() }
          : p
      )
    );
  }

  function deleteProduct(id) {
    setProducts(prev => prev.filter(p => p.id !== id));
  }

  return (
    <AppContext.Provider value={{ products, addProduct, updateProduct, deleteProduct }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used inside AppProvider');
  return ctx;
}
