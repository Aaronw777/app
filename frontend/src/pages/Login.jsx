import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { formatApiError } from "@/lib/api";
import { toast } from "sonner";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (err) {
      setError(formatApiError(err.response?.data?.detail) || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-20" data-testid="login-page">
      <div className="tag tag-gold mb-4">Sign In</div>
      <h1 className="font-display text-4xl md:text-5xl uppercase tracking-tight leading-none mb-8">
        Back on <span className="text-[#FFCD00]">Court.</span>
      </h1>
      <form onSubmit={submit} className="space-y-5">
        <div>
          <label className="text-xs uppercase tracking-[0.2em] text-white/60 mb-2 block">Email</label>
          <input
            data-testid="login-email-input"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full bg-[#141414] border border-white/10 focus:border-[#FFCD00] focus:outline-none px-4 py-3 rounded-sm text-white"
            autoComplete="email"
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.2em] text-white/60 mb-2 block">Password</label>
          <input
            data-testid="login-password-input"
            type="password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full bg-[#141414] border border-white/10 focus:border-[#FFCD00] focus:outline-none px-4 py-3 rounded-sm text-white"
            autoComplete="current-password"
          />
        </div>
        {error && (
          <div data-testid="login-error" className="text-sm text-red-400 border border-red-500/30 bg-red-500/10 p-3 rounded-sm">
            {error}
          </div>
        )}
        <button
          data-testid="login-submit-btn"
          type="submit"
          disabled={loading}
          className="btn-primary w-full justify-center disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
      <div className="mt-8 text-sm text-white/60">
        New here?{" "}
        <Link to="/register" className="text-[#FFCD00] hover:underline" data-testid="login-to-register-link">
          Create an account
        </Link>
      </div>
    </div>
  );
}
