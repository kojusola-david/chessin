// ProtectedRoutes.js
import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function ProtectedRoutes() {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading board...</div>; // Or a cool chess spinner

  return user ? <Outlet /> : <Navigate to="/login" />;
}