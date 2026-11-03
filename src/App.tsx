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
import { isPlatformAdmin } from "./types";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useApp();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!user?.onboardingComplete) return <Navigate to="/onboarding" replace />;
  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useApp();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isPlatformAdmin(user)) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
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

      {/* Admin Executive Console (Only accessible to platform owner) */}
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
