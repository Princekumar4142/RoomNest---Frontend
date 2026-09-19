import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { CompareProvider } from "./context/CompareContext";
import { NotificationProvider } from "./context/NotificationContext";
import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import ListPropertyRoute from "./components/ListPropertyRoute";

import HomePage from "./pages/HomePage";
import SearchPage from "./pages/SearchPage";
import RoomDetailsPage from "./pages/RoomDetailsPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import FavoritesPage from "./pages/FavoritesPage";
import ProfilePage from "./pages/ProfilePage";
import OwnerDashboardPage from "./pages/OwnerDashboardPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import RoommateFinderPage from "./pages/RoommateFinderPage";
import ComparePage from "./pages/ComparePage";
import ChatPage from "./pages/ChatPage";
import SimplePage from "./pages/SimplePage";

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
      <CompareProvider>
        <Toaster position="top-center" toastOptions={{ style: { fontSize: "14px" } }} />
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/rooms/:id" element={<RoomDetailsPage />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/roommates" element={<RoommateFinderPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            <Route
              path="/favorites"
              element={
                <ProtectedRoute>
                  <FavoritesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/owner/dashboard"
              element={
                <ProtectedRoute roles={["owner", "admin"]}>
                  <OwnerDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

            <Route path="/list-your-property" element={<ListPropertyRoute />} />
            <Route path="/owner" element={<ListPropertyRoute />} />
            <Route path="/list-property" element={<ListPropertyRoute />} />
            <Route path="/rooms" element={<Navigate to="/search" replace />} />
            <Route
              path="/how-it-works"
              element={
                <SimplePage title="How RoomNest works">
                  <p>Search by city, area, college or company. Every room is manually checked before it goes live — ownership documents, photos, and details all verified.</p>
                  <p>Chat or call the owner directly, schedule a visit, and book with confidence. No brokers, no fake listings.</p>
                </SimplePage>
              }
            />
            <Route
              path="/about"
              element={
                <SimplePage title="About RoomNest">
                  <p>RoomNest exists to make moving to a new city less stressful — by making sure the room you see online is the room you actually get.</p>
                </SimplePage>
              }
            />
            <Route
              path="/help"
              element={
                <SimplePage title="Help Center">
                  <p>Reach us anytime at support@roomnest.in for questions about bookings, verification, or your account.</p>
                </SimplePage>
              }
            />
            <Route
              path="/contact"
              element={
                <SimplePage title="Contact us">
                  <p>Email: support@roomnest.in<br />Phone: +91 90000 00000</p>
                </SimplePage>
              }
            />
            <Route
              path="/privacy"
              element={<SimplePage title="Privacy Policy"><p>Placeholder privacy policy — replace with your legal team's content before launch.</p></SimplePage>}
            />
            <Route
              path="/terms"
              element={<SimplePage title="Terms & Conditions"><p>Placeholder terms — replace with your legal team's content before launch.</p></SimplePage>}
            />

            <Route path="*" element={<SimplePage title="Page not found"><p>The page you're looking for doesn't exist.</p></SimplePage>} />
          </Route>
        </Routes>
      </CompareProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}
