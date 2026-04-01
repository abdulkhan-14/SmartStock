import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext.jsx';
import Navbar from './components/Navbar.jsx';
import Dashboard from './pages/Dashboard.jsx';
import InventoryList from './pages/InventoryList.jsx';
import AddEditProduct from './pages/AddEditProduct.jsx';
import Alerts from './pages/Alerts.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import './smartstock.css';

function App() {
  return (
    <AppProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '') || '/'}>
        <Navbar />
        <main className="ss-main">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/inventory" element={<InventoryList />} />
            <Route path="/add" element={<AddEditProduct />} />
            <Route path="/edit/:id" element={<AddEditProduct />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/product/:id" element={<ProductDetail />} />
          </Routes>
        </main>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
