import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import LandingPage from './pages/LandingPage';
import MedicineSearchPage from './pages/MedicineSearchPage';
import PrescriptionScannerPage from './pages/PrescriptionScannerPage';
import ShopListPage from './pages/ShopListPage';
import ShopDetailPage from './pages/ShopDetailPage';
import NearbyShopsPage from './pages/NearbyShopsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CustomerProfilePage from './pages/CustomerProfilePage';

import ShopOwnerDashboard from './pages/ShopOwnerDashboard';
import OwnerInventoryPage from './pages/OwnerInventoryPage';
import AddEditInventoryPage from './pages/AddEditInventoryPage';
import LowStockPage from './pages/LowStockPage';
import ExpiryManagementPage from './pages/ExpiryManagementPage';
import ShopProfilePage from './pages/ShopProfilePage';

import AdminDashboard from './pages/AdminDashboard';
import AdminShopsPage from './pages/AdminShopsPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminMedicinesPage from './pages/AdminMedicinesPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="d-flex flex-column min-vh-100">
          <Navbar />
          <main className="flex-grow-1">
            <Routes>
              {/* Public & Customer Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/medicines" element={<MedicineSearchPage />} />
              <Route path="/prescription-scanner" element={<PrescriptionScannerPage />} />
              <Route path="/shops" element={<ShopListPage />} />
              <Route path="/shops/:id" element={<ShopDetailPage />} />
              <Route path="/nearby" element={<NearbyShopsPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <CustomerProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* Shop Owner Protected Routes */}
              <Route
                path="/owner/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['SHOP_OWNER', 'ADMIN']}>
                    <ShopOwnerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/owner/inventory"
                element={
                  <ProtectedRoute allowedRoles={['SHOP_OWNER', 'ADMIN']}>
                    <OwnerInventoryPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/owner/inventory/add"
                element={
                  <ProtectedRoute allowedRoles={['SHOP_OWNER', 'ADMIN']}>
                    <AddEditInventoryPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/owner/inventory/edit/:id"
                element={
                  <ProtectedRoute allowedRoles={['SHOP_OWNER', 'ADMIN']}>
                    <AddEditInventoryPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/owner/low-stock"
                element={
                  <ProtectedRoute allowedRoles={['SHOP_OWNER', 'ADMIN']}>
                    <LowStockPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/owner/expiry"
                element={
                  <ProtectedRoute allowedRoles={['SHOP_OWNER', 'ADMIN']}>
                    <ExpiryManagementPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/owner/shop-profile"
                element={
                  <ProtectedRoute allowedRoles={['SHOP_OWNER', 'ADMIN']}>
                    <ShopProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* Admin Protected Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/shops"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminShopsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminUsersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/medicines"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminMedicinesPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
