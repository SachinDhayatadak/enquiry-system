import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ProtectedRoute from "../components/ProtectedRoute";
import AdminRoute from "../components/AdminRoute";

// Public pages
import LandingPage from "../pages/public/LandingPage";
import Login from "../pages/public/Login";
import Register from "../pages/public/Register";

// Protected pages
import Layout from "../layout/Layout";
import EnquiryList from "../pages/enquiries/EnquiryList";
import EnquiryForm from "../pages/enquiries/EnquiryForm";
import EnquiryDetails from "../pages/enquiries/EnquiryDetails";
import UserList from "../pages/users/UserList";
import UserForm from "../pages/users/UserForm";
import UserDetails from "../pages/users/UserDetails";
import Dashboard from "../pages/dashboard/Dashboard";

export default function AppRoutes() {
  const { token } = useAuth();

  return (
    <Routes>
      {/* Root: Landing if not logged in, Dashboard if logged in */}
      {token ? (
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="enquiries" element={<EnquiryList />} />
          <Route path="enquiries/new" element={<EnquiryForm />} />
          <Route path="enquiries/:id" element={<EnquiryDetails />} />
          <Route path="enquiries/:id/edit" element={<EnquiryForm />} />

          {/* ✅ Admin-only routes */}
          <Route
            path="users"
            element={
              <AdminRoute>
                <UserList />
              </AdminRoute>
            }
          />
          <Route
            path="users/new"
            element={
              <AdminRoute>
                <UserForm />
              </AdminRoute>
            }
          />
          <Route
            path="users/:id/edit"
            element={
              <AdminRoute>
                <UserForm />
              </AdminRoute>
            }
          />
          <Route
            path="users/:id"
            element={
              <AdminRoute>
                <UserDetails />
              </AdminRoute>
            }
          />
        </Route>
      ) : (
        <Route path="/" element={<LandingPage />} />
      )}

      {/* Auth routes → redirect if already logged in */}
      <Route
        path="/login"
        element={token ? <Navigate to="/" replace /> : <Login />}
      />
      <Route
        path="/register"
        element={token ? <Navigate to="/" replace /> : <Register />}
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
