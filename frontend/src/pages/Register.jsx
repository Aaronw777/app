import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { formatApiError } from "@/lib/api";
import { toast } from "sonner";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success("Welcome to Court Mastery!");
      navigate("/dashboard");
    } catch (err) {
      setError(formatApiError(err.response?.data?.detail) || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-20" data-testid="register-page">
      <div className="tag tag-gold mb-4">Join</div>
      <h1 className="font-display text-4xl md:text-5xl uppercase tracking-tight leading-none mb-8">
        Suit Up. <span className="text-[#FFCD00]">Level Up.</span>
      </h1>
      <form onSubmit={submit} className="space-y-5">
        <div>
          <label className="text-xs uppercase tracking-[0.2em] text-white/60 mb-2 block">Coach / Player Name</label>
          <input
            data-testid="register-name-input"
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full bg-[#141414] border border-white/10 focus:border-[#FFCD00] focus:outline-none px-4 py-3 rounded-sm text-white"
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.2em] text-white/60 mb-2 block">Email</label>
          <input
            data-testid="register-email-input"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full bg-[#141414] border border-white/10 focus:border-[#FFCD00] focus:outline-none px-4 py-3 rounded-sm text-white"
            autoComplete="email"
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.2em] text-white/60 mb-2 block">Password (min 6)</label>
          <input
            data-testid="register-password-input"
            type="password"
            required
            minLength={6}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full bg-[#141414] border border-white/10 focus:border-[#FFCD00] focus:outline-none px-4 py-3 rounded-sm text-white"
            autoComplete="new-password"
          />
        </div>
        {error && (
          <div data-testid="register-error" className="text-sm text-red-400 border border-red-500/30 bg-red-500/10 p-3 rounded-sm">
            {error}
          </div>
        )}
        <button
          data-testid="register-submit-btn"
          type="submit"
          disabled={loading}
          className="btn-primary w-full justify-center disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Account"}
        </button>
      </form>
      <div className="mt-8 text-sm text-white/60">
        Already have an account?{" "}
        <Link to="/login" className="text-[#FFCD00] hover:underline" data-testid="register-to-login-link">
          Sign in
        </Link>
      </div>
    </div>
  );
}
