import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const RoleRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // if (loading) return null;
  // if (!user) {
  //   return <Navigate to="/login" replace />;
  // }

  // Allow guest accounts to access student routes, without forcing a redirect away from /seats or /e-library.
  if (user.role === "guest" && role === "student") {
    return children;
  }
// 
  // Enforce university verification for non-guest student/teacher accounts that are not verified.
  if (user.role !== "guest" && !user.isUniversityVerified) {
    return <Navigate to="/verify-university-id" replace />;
  }

  if (user.role !== role) {
    switch (user.role) {
      case "admin":
        return <Navigate to="/admin/dashboard" replace />;

      case "teacher":
        return <Navigate to="/teacher/dashboard" replace />;

      case "librarian":
        return <Navigate to="/librarian/dashboard" replace />;

      default:
        return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

export default RoleRoute;
