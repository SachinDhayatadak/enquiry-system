import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { JSX } from "react";

export default function AdminRoute({ children }: { children: JSX.Element }) {
  const { user } = useAuth();

  if (!user || user.role !== "admin") {
    return <Navigate to="/" replace />; // redirect to dashboard if not admin
  }

  return children;
}
