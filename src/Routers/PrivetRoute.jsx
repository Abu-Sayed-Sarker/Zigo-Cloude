import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

export function PrivateRoute({ children }) {
  // Retrieve auth data from localStorage
  const Data = useSelector();

  // Check if user is not authenticated
  if (!Data.accessToken && !Data.refreshToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user is not verified
  if (!Data.isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // User meets all requirements
  return children;
}
