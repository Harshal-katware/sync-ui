import { Navigate } from "react-router-dom";
import type { JSX } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps): JSX.Element {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  const subscriptionStatus =
    localStorage.getItem("subscriptionStatus") ||
    sessionStorage.getItem("subscriptionStatus");

  // ✅ No token → go to login
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // ✅ Expired → go to expired page
  if (subscriptionStatus === "EXPIRED") {
    return <Navigate to="/expired" replace />;
  }

  return <>{children}</>;
}