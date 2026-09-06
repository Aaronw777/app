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
          <div className="max-w-7xl mx-auto px-6 space-y-4 text-white/40">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs uppercase tracking-[0.25em]">
              <div>Court Mastery · Inspired by the Basketball Australia pathway</div>
              <div>© 2026</div>
            </div>
            <p
              data-testid="footer-disclaimer"
              className="text-[11px] leading-relaxed max-w-4xl text-white/35 normal-case tracking-normal"
            >
              Court Mastery is an independent training tool. It is not affiliated with,
              endorsed by, or sponsored by Basketball Australia, the NBL, WNBL, NBL1,
              Aussie Hoops, the Australian Boomers, the Australian Opals, or FIBA. All
              names and marks referenced belong to their respective owners and are used
              here descriptively to help coaches contextualise the drills. Linked video
              tutorials are hosted on YouTube by their original creators; Court Mastery
              claims no ownership over that content.
            </p>
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
