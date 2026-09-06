import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import Nav from "@/components/Nav";
import ProtectedRoute from "@/components/ProtectedRoute";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import ProgramBuilder from "@/pages/ProgramBuilder";
import ProgramView from "@/pages/ProgramView";
import SessionView from "@/pages/SessionView";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Nav />
        <main className="min-h-screen">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/build"
              element={
                <ProtectedRoute>
                  <ProgramBuilder />
                </ProtectedRoute>
              }
            />
            <Route
              path="/programs/:id"
              element={
                <ProtectedRoute>
                  <ProgramView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/programs/:id/week/:week"
              element={
                <ProtectedRoute>
                  <SessionView />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
        <footer className="border-t border-white/10 py-8 mt-16 no-print">
          <div className="max-w-7xl mx-auto px-6 flex items-center justify-between text-xs uppercase tracking-[0.25em] text-white/40">
            <div>Court Mastery · FIBA · Basketball Australia Pathway</div>
            <div>© 2026</div>
          </div>
        </footer>
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#141414",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#fff",
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
