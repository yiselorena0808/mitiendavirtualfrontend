import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import SellerDashboard from './pages/SellerDashboard';
import BuyerDashboard from './pages/BuyerDashboard';
import Storefront from './pages/Storefront';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Seller Routes */}
        <Route path="/seller/dashboard" element={<SellerDashboard />} />
        <Route path="/seller/stores" element={<SellerDashboard />} />
        <Route path="/seller/orders" element={<SellerDashboard />} />
        <Route path="/seller/products" element={<SellerDashboard />} />
        <Route path="/seller/categories" element={<SellerDashboard />} />
        <Route path="/seller/settings" element={<SellerDashboard />} />
        <Route path="/seller/customization" element={<SellerDashboard />} />
        <Route path="/seller/chats" element={<SellerDashboard />} />
        
        {/* Buyer Routes */}
        <Route path="/buyer/dashboard" element={<BuyerDashboard />} />
        <Route path="/buyer/explore" element={<BuyerDashboard />} />
        <Route path="/buyer/orders" element={<BuyerDashboard />} />
        <Route path="/buyer/chats" element={<BuyerDashboard />} />

        {/* Public Storefront */}
        <Route path="/s/:slug" element={<Storefront />} />
        
        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
