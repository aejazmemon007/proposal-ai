import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider, useApp } from "./lib/store";
import AppShell from "./components/AppShell";
import Landing from "./pages/Landing";
import Pricing from "./pages/Pricing";
import Checkout from "./pages/Checkout";
import ThankYou from "./pages/ThankYou";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Proposals from "./pages/Proposals";
import ProposalNew from "./pages/ProposalNew";
import ProposalDetail from "./pages/ProposalDetail";
import Clients from "./pages/Clients";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Templates from "./pages/Templates";
import PublicProposal from "./pages/PublicProposal";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";
import { isPlatformAdmin } from "./types";
import { Shield } from "lucide-react";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useApp();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!user?.onboardingComplete) return <Navigate to="/onboarding" replace />;
  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useApp();
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  if (!isPlatformAdmin(user)) return <Navigate to="/admin/unauthorized" replace />;
  return <>{children}</>;
}

function AdminUnauthorized() {
  const { user, logout } = useApp();

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-slate-900 border border-red-500/30 rounded-3xl p-8 text-center shadow-2xl space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto">
          <Shield className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold">Access Denied: Admin Only</h1>
        <p className="text-xs text-slate-400 leading-relaxed">
          You are currently signed in as <strong className="text-white">{user?.email}</strong>. This is a standard user account. Only the platform owner can access this console.
        </p>
        <div className="flex flex-col gap-2 pt-2">
          <a
            href="#/admin/login"
            onClick={() => logout()}
            className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-colors cursor-pointer text-center"
          >
            Switch to Administrator Account
          </a>
          <a
            href="#/dashboard"
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer text-center"
          >
            Return to User Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}

function AuthRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useApp();
  if (isAuthenticated && user?.onboardingComplete) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public marketing & billing */}
      <Route path="/" element={<Landing />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/thank-you" element={<ThankYou />} />
      <Route path="/p/:token" element={<PublicProposal />} />

      {/* Auth */}
      <Route path="/login" element={<AuthRoute><Auth mode="login" /></AuthRoute>} />
      <Route path="/signup" element={<AuthRoute><Auth mode="signup" /></AuthRoute>} />

      {/* Onboarding */}
      <Route path="/onboarding" element={<Onboarding />} />

      {/* Admin Executive Console (Strictly for Platform Owner) */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/unauthorized" element={<AdminUnauthorized />} />
      <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />

      {/* App shell */}
      <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/proposals" element={<Proposals />} />
        <Route path="/proposals/new" element={<ProposalNew />} />
        <Route path="/proposals/:id" element={<ProposalDetail defaultTab="edit" />} />
        <Route path="/proposals/:id/edit" element={<ProposalDetail defaultTab="edit" />} />
        <Route path="/proposals/:id/preview" element={<ProposalDetail defaultTab="preview" />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/templates" element={<Templates />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/settings/:tab" element={<Settings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </AppProvider>
  );
}
