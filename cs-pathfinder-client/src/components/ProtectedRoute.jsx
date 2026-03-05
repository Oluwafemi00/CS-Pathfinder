// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();

  // If there is no user logged in, send them to the login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Otherwise, render the page they requested (like the Dashboard)
  return children;
};

export default ProtectedRoute;
