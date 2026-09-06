import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading || user === null)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-white/40 font-display tracking-[0.3em] uppercase text-sm">
          Loading...
        </div>
      </div>
    );
  if (!user) return <Navigate to="/login" replace />;
  return children;
}
