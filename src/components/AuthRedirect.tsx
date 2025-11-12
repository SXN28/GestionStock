import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { JSX } from "react";

export default function AuthRedirect({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="flex items-center justify-center min-h-screen">Chargement...</div>;
  if (user) return <Navigate to="/" replace />;

  return children;
}
