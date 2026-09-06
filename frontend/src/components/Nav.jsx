import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { LogOut, User, Menu, X } from "lucide-react";

export default function Nav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const loc = useLocation();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    navigate("/");
  };

  const closeAnd = (fn) => () => {
    setOpen(false);
    if (fn) fn();
  };

  const active = (path) => loc.pathname === path || loc.pathname.startsWith(path + "/");

  return (
    <header
      className="sticky top-0 z-40 bg-black/60 backdrop-blur-xl border-b border-white/10 no-print"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between gap-3">
        <Link
          to={user ? "/dashboard" : "/"}
          data-testid="nav-logo"
          onClick={closeAnd()}
          className="flex items-center gap-2 min-w-0"
        >
          <div className="w-8 h-8 bg-[#FFCD00] flex items-center justify-center rounded-sm shrink-0">
            <span className="font-display text-black text-lg">C</span>
          </div>
          <div className="min-w-0">
            <div className="font-display text-base md:text-lg tracking-wider uppercase leading-none truncate">
              Court Mastery
            </div>
            <div className="hidden md:block text-[10px] uppercase tracking-[0.25em] text-white/50 leading-none mt-1">
              10-Week Program Builder
            </div>
          </div>
        </Link>

        {/* Desktop links */}
        <nav className="hidden md:flex items-center gap-4">
          {user && user !== false ? (
            <>
              <Link
                to="/dashboard"
                data-testid="nav-dashboard-link"
                className={`text-xs uppercase tracking-[0.2em] font-semibold hover:text-[#FFCD00] transition-colors ${
                  active("/dashboard") ? "text-[#FFCD00]" : "text-white/70"
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/teams"
                data-testid="nav-teams-link"
                className={`text-xs uppercase tracking-[0.2em] font-semibold hover:text-[#FFCD00] transition-colors ${
                  active("/teams") ? "text-[#FFCD00]" : "text-white/70"
                }`}
              >
                Teams
              </Link>
              <div className="flex items-center gap-2 text-white/60 text-sm border-l border-white/10 pl-4">
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

        {/* Mobile trigger */}
        <button
          onClick={() => setOpen((o) => !o)}
          data-testid="nav-mobile-toggle"
          className="md:hidden p-2 border border-white/10 rounded-sm text-white/80 hover:text-[#FFCD00]"
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden border-t border-white/10 bg-black/95 backdrop-blur-xl" data-testid="nav-mobile-drawer">
          <div className="px-4 py-3 flex flex-col gap-1">
            {user && user !== false ? (
              <>
                <MobLink to="/dashboard" active={active("/dashboard")} onClick={closeAnd()} testid="mob-dashboard">
                  Dashboard
                </MobLink>
                <MobLink to="/teams" active={active("/teams")} onClick={closeAnd()} testid="mob-teams">
                  Teams
                </MobLink>
                <div className="flex items-center gap-2 text-white/60 text-sm py-2 border-t border-white/10 mt-2 pt-3">
                  <User size={14} /> {user.name}
                </div>
                <button
                  onClick={handleLogout}
                  data-testid="mob-logout"
                  className="btn-ghost w-full justify-center mt-1"
                  style={{ padding: "0.6rem 1rem" }}
                >
                  <LogOut size={14} /> Logout
                </button>
              </>
            ) : (
              <>
                <MobLink to="/login" active={active("/login")} onClick={closeAnd()} testid="mob-login">
                  Login
                </MobLink>
                <Link
                  to="/register"
                  data-testid="mob-register"
                  onClick={closeAnd()}
                  className="btn-primary w-full justify-center mt-2"
                  style={{ padding: "0.65rem 1rem" }}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function MobLink({ to, active, onClick, children, testid }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      data-testid={testid}
      className={`block px-1 py-2.5 uppercase tracking-[0.2em] text-xs font-bold border-b border-white/5 ${
        active ? "text-[#FFCD00]" : "text-white/80"
      }`}
    >
      {children}
    </Link>
  );
}
