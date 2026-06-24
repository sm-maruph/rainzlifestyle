// src/components/admin/RequireAdmin.jsx
// Wrap the /admin route element so only logged-in admins get through.
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function RequireAdmin({ children }) {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">Checking access…</div>;
  }
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-2xl font-bold text-gray-900">Access denied</h1>
        <p className="mt-2 text-gray-500">This area is for administrators only.</p>
        <a href="/" className="mt-5 rounded-full px-6 py-2.5 text-sm font-semibold text-white" style={{ backgroundColor: "#E11D48" }}>Back to store</a>
      </div>
    );
  }
  return children;
}
