import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import DashboardLayout from '../components/layout/DashboardLayout';

// Public Pages
import LandingPage from '../pages/public/LandingPage';
import LoginPage from '../pages/public/LoginPage';
import RegisterPage from '../pages/public/RegisterPage';
import ForgotPasswordPage from '../pages/public/ForgotPasswordPage';
import PrivacyPolicyPage from '../pages/public/PrivacyPolicyPage';
import TermsAndConditionsPage from '../pages/public/TermsAndConditionsPage';
import RefundPolicyPage from '../pages/public/RefundPolicyPage';
import EmdPolicyPage from '../pages/public/EmdPolicyPage';
import DeliveryServicePolicyPage from '../pages/public/DeliveryServicePolicyPage';
import FaqsPage from '../pages/public/FaqsPage';
import BiddingPlansPage from '../pages/public/BiddingPlansPage';
import BuyerGuidePage from '../pages/public/BuyerGuidePage';
import SellerGuidePage from '../pages/public/SellerGuidePage';
import PublicAuctionWatchPage from '../pages/public/PublicAuctionWatchPage';

// Buyer Pages
import BuyerDashboard from '../pages/buyer/BuyerDashboard';
import MarketplacePage from '../pages/buyer/MarketplacePage';
import ListingDetailsPage from '../pages/buyer/ListingDetailsPage';
import LiveAuctionPage from '../pages/buyer/LiveAuctionPage';
import MyBidsPage from '../pages/buyer/MyBidsPage';
import NotificationsPage from '../pages/buyer/NotificationsPage';
import CommunityRequestsPage from '../pages/buyer/CommunityRequestsPage';

// Seller Pages
import SellerDashboard from '../pages/seller/SellerDashboard';
import CreateListingPage from '../pages/seller/CreateListingPage';
import MyListingsPage from '../pages/seller/MyListingsPage';
import SellerAuctionPage from '../pages/seller/SellerAuctionPage';
import RelistListing from '../pages/seller/RelistListing';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import PendingListingsPage from '../pages/admin/PendingListingsPage';
import UsersPage from '../pages/admin/UsersPage';
import AnalyticsPage from '../pages/admin/AnalyticsPage';
import ReportsPage from '../pages/admin/ReportsPage';
import AdminCommunityRequestsPage from '../pages/admin/AdminCommunityRequestsPage';
import AdminProductsPage from '../pages/admin/AdminProductsPage';
import AdminPaymentsPage from '../pages/admin/AdminPaymentsPage';
import DeleteAccountPage from '../pages/public/DeleteAccountPage';

// Common
import MyReportsPage from '../pages/buyer/MyReportsPage';
import PaymentsPage from '../pages/payments/PaymentsPage';
import PaymentResultPage from '../pages/payments/PaymentResultPage';
import NotFoundPage from '../pages/NotFoundPage';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* 1. Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
      <Route path="/terms-and-conditions" element={<TermsAndConditionsPage />} />
      <Route path="/refund-policy" element={<RefundPolicyPage />} />
      <Route path="/emd-policy" element={<EmdPolicyPage />} />
      <Route path="/delivery-service-policy" element={<DeliveryServicePolicyPage />} />
      <Route path="/faqs" element={<FaqsPage />} />
      <Route path="/bidding-plans" element={<BiddingPlansPage />} />
      <Route path="/buyer-guide" element={<BuyerGuidePage />} />
      <Route path="/seller-guide" element={<SellerGuidePage />} />
      <Route path="/auction/watch/:productId" element={<PublicAuctionWatchPage />} />
      <Route path="/delete-account" element={<DeleteAccountPage />} />
      <Route path="/payment-result" element={<PaymentResultPage />} />

      {/* 2. Buyer Protected Routes */}
      <Route
        path="/buyer"
        element={
          <ProtectedRoute allowedRoles={['Buyer']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<BuyerDashboard />} />
        <Route path="marketplace" element={<MarketplacePage />} />
        <Route path="listings/:id" element={<ListingDetailsPage />} />
        <Route path="auction/:auctionId" element={<LiveAuctionPage />} />
        <Route path="my-bids" element={<MyBidsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="reports" element={<MyReportsPage />} />
        <Route path="community-requests" element={<CommunityRequestsPage />} />
      </Route>

      {/* 3. Seller Protected Routes */}
      <Route
        path="/seller"
        element={
          <ProtectedRoute allowedRoles={['Seller']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<SellerDashboard />} />
        <Route path="create-listing" element={<CreateListingPage />} />
        <Route path="my-listings" element={<MyListingsPage />} />
        <Route path="auction/:id" element={<SellerAuctionPage />} />
        <Route path="payments" element={<PaymentsPage />} />
        <Route path="reports" element={<MyReportsPage />} />
        <Route path="relist/:listingId" element={<RelistListing />} />
      </Route>

      {/* 4. Dealer Protected Routes */}
      <Route
        path="/dealer"
        element={
          <ProtectedRoute allowedRoles={['Dealer']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<SellerDashboard />} />
        <Route path="create-listing" element={<CreateListingPage />} />
        <Route path="my-listings" element={<MyListingsPage />} />
        <Route path="auction/:id" element={<SellerAuctionPage />} />
        <Route path="payments" element={<PaymentsPage />} />
        <Route path="reports" element={<MyReportsPage />} />
        <Route path="relist/:listingId" element={<RelistListing />} />
      </Route>

      {/* 5. Admin Protected Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="listings/pending" element={<PendingListingsPage />} />
        <Route path="products" element={<AdminProductsPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="community-requests" element={<AdminCommunityRequestsPage />} />
        <Route path="payments" element={<AdminPaymentsPage />} />
      </Route>

      {/* 6. Fallback 404 Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
