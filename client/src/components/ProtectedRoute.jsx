// Wraps a page and allows only the given roles to see it.
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { dashboardPath } from "../utils";

function ProtectedRoute({ roles, children }) {
  const { user } = useAuth();

  // Not logged in -> go to login page
  if (!user) {
    return <Navigate to="/login" />;
  }

  // Logged in but wrong role -> send the user to their own dashboard
  if (!roles.includes(user.role)) {
    return <Navigate to={dashboardPath(user.role)} />;
  }

  return children;
}

export default ProtectedRoute;
