import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { LogOut, User } from "lucide-react";

export default function Nav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const loc = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 bg-black/60 backdrop-blur-xl border-b border-white/10 no-print">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link
          to={user ? "/dashboard" : "/"}
          data-testid="nav-logo"
          className="flex items-center gap-2"
        >
          <div className="w-8 h-8 bg-[#FFCD00] flex items-center justify-center rounded-sm">
            <span className="font-display text-black text-lg">C</span>
          </div>
          <div>
            <div className="font-display text-lg tracking-wider uppercase leading-none">
              Court Mastery
            </div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-white/50 leading-none mt-1">
              10-Week Program Builder
            </div>
          </div>
        </Link>
        <nav className="flex items-center gap-4">
          {user && user !== false ? (
            <>
              <Link
                to="/dashboard"
                data-testid="nav-dashboard-link"
                className={`text-xs uppercase tracking-[0.2em] font-semibold hover:text-[#FFCD00] transition-colors ${
                  loc.pathname === "/dashboard" ? "text-[#FFCD00]" : "text-white/70"
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/teams"
                data-testid="nav-teams-link"
                className={`text-xs uppercase tracking-[0.2em] font-semibold hover:text-[#FFCD00] transition-colors ${
                  loc.pathname.startsWith("/teams") ? "text-[#FFCD00]" : "text-white/70"
                }`}
              >
                Teams
              </Link>
              <div className="hidden sm:flex items-center gap-2 text-white/60 text-sm border-l border-white/10 pl-4">
                <User size={14} />
                <span data-testid="nav-user-name">{user.name}</span>
              </div>
              <button
                data-testid="nav-logout-btn"
                onClick={handleLogout}
                className="btn-ghost text-xs"
                style={{ padding: "0.4rem 0.85rem" }}
              >
                <LogOut size={14} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                data-testid="nav-login-link"
                className="text-xs uppercase tracking-[0.2em] font-semibold text-white/70 hover:text-[#FFCD00] transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                data-testid="nav-register-link"
                className="btn-primary text-xs"
                style={{ padding: "0.5rem 1rem" }}
              >
                Get Started
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
