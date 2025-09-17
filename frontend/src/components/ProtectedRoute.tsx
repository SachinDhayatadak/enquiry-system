import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { JSX } from "react";

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { token, user, loading } = useAuth();

  // ⏳ Wait until /me finishes
  if (loading) {
    return <p className="text-center mt-10">Checking authentication...</p>;
  }

  // 🔒 If no token or no user → redirect
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Authenticated
  return children;
}
