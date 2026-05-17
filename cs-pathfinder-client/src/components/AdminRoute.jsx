// src/components/AdminRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useProfile } from "../hooks/useProfile";

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const { profile, loadingProfile } = useProfile(user?.id);

  // If the auth or profile is still loading, show a loading state
  if (loading || loadingProfile) {
    return <div>Verifying credentials...</div>;
  }

  // If there is no user, or their role is NOT 'admin', kick them to the dashboard
  if (!user || profile?.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  // If they are an admin, let them see the page!
  return children;
};

export default AdminRoute;
