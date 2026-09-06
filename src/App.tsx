/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { Routes, Route, useLocation, Navigate, useParams } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './components/Home';
import Dashboard from './components/Dashboard';
import ProductDetail from './components/ProductDetail';
import MyOrders from './components/MyOrders';
import CartCheckout from './components/CartCheckout';
import UpiPaymentPage from './components/UpiPaymentPage';
import AdminDashboard from './components/AdminDashboard';

// Legal & Compliance Pages
import PrivacyPolicy from './components/legal/PrivacyPolicy';
import TermsOfService from './components/legal/TermsOfService';
import RefundPolicy from './components/legal/RefundPolicy';
import CancellationPolicy from './components/legal/CancellationPolicy';
import ShippingPolicy from './components/legal/ShippingPolicy';
import ReturnsExchangePolicy from './components/legal/ReturnsExchangePolicy';
import Disclaimer from './components/legal/Disclaimer';
import AccessibilityStatement from './components/legal/AccessibilityStatement';
import CookiePolicy from './components/legal/CookiePolicy';

import { runStartupStorageMigrations } from './utils/storageMigration';

// Run storage key migrations once on app startup before any state reads
runStartupStorageMigrations();

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' as ScrollBehavior,
    });
  }, [pathname]);

  return null;
}

// Backward compatibility helper for /recipe/:recipeId
function RecipeRouteRedirect() {
  const { recipeId } = useParams<{ recipeId: string }>();
  return <Navigate to={recipeId ? `/product/${recipeId}` : '/shop'} replace />;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Main App Routes */}
          <Route index element={<Home />} />
          <Route path="shop" element={<Dashboard />} />
          <Route path="menu" element={<Navigate to="/shop" replace />} />
          <Route path="product/:id" element={<ProductDetail />} />
          <Route path="recipe/:recipeId" element={<RecipeRouteRedirect />} />
          <Route path="my-orders" element={<MyOrders />} />
          <Route path="cart" element={<CartCheckout />} />
          <Route path="checkout" element={<Navigate to="/cart" replace />} />
          <Route path="upi-payment" element={<UpiPaymentPage />} />
          <Route path="payment" element={<UpiPaymentPage />} />
          <Route path="admin" element={<AdminDashboard />} />

          {/* Legal & Compliance Routes */}
          <Route path="privacy-policy" element={<PrivacyPolicy />} />
          <Route path="terms-of-service" element={<TermsOfService />} />
          <Route path="refund-policy" element={<RefundPolicy />} />
          <Route path="cancellation-policy" element={<CancellationPolicy />} />
          <Route path="shipping-policy" element={<ShippingPolicy />} />
          <Route path="returns-exchange-policy" element={<ReturnsExchangePolicy />} />
          <Route path="disclaimer" element={<Disclaimer />} />
          <Route path="accessibility-statement" element={<AccessibilityStatement />} />
          <Route path="cookie-policy" element={<CookiePolicy />} />

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </>
  );
}
