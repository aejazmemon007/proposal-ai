import { useState } from "react";
import { Outlet, NavLink, useNavigate, Link } from "react-router-dom";
import {
  LayoutDashboard, FileText, Users, BarChart2, Settings, Plus, Bell, Sun, Moon,
  LogOut, Search, Menu, X, ChevronDown, Sparkles, LayoutTemplate,
} from "lucide-react";
import { useApp } from "../lib/store";

const NAV_ITEMS = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/proposals", icon: FileText, label: "Proposals" },
  { to: "/clients", icon: Users, label: "Clients" },
  { to: "/analytics", icon: BarChart2, label: "Analytics" },
  { to: "/templates", icon: LayoutTemplate, label: "Templates" },
];

function Logo() {
  return (
    <Link to="/dashboard" className="flex items-center gap-2.5 group">
      <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
        <Sparkles className="w-4 h-4 text-white" />
      </div>
      <span className="font-semibold text-foreground tracking-tight text-[15px]">ProposalAI</span>
    </Link>
  );
}

export default function AppShell() {
  const { user, darkMode, toggleDarkMode, notifications, markNotificationRead, logout } = useApp();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const unread = notifications.filter((n) => !n.read).length;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="px-5 py-5 border-b border-border">
        <Logo />
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`
            }
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-3 border-t border-border space-y-0.5">
        <NavLink
          to="/settings"
          onClick={() => setMobileOpen(false)}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`
          }
        >
          <Settings className="w-4 h-4 shrink-0" />
          Settings
        </NavLink>
      </div>

      <div className="px-3 pb-4 pt-2 border-t border-border">
        <div className="flex items-center gap-3 px-3 py-2.5">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <span className="text-xs font-semibold text-primary">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-muted-foreground truncate capitalize">{user?.subscription} plan</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-full bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-[220px] flex-col border-r border-border bg-sidebar shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-sidebar border-r border-border flex flex-col">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-14 border-b border-border bg-background flex items-center gap-4 px-4 lg:px-6 shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-muted text-muted-foreground"
          >
            <Menu className="w-4 h-4" />
          </button>

          <div className="flex-1" />

          <button
            onClick={() => navigate("/proposals/new")}
            className="hidden sm:flex items-center gap-1.5 bg-primary text-primary-foreground px-3.5 py-1.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Proposal
          </button>

          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
            title={darkMode ? "Light mode" : "Dark mode"}
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => { setNotifOpen((p) => !p); setUserMenuOpen(false); }}
              className="relative p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
            >
              <Bell className="w-4 h-4" />
              {unread > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full" />
              )}
            </button>
            {notifOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden animate-slide-up">
                <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">Notifications</span>
                  {unread > 0 && <span className="text-xs text-muted-foreground">{unread} unread</span>}
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-sm text-muted-foreground px-4 py-6 text-center">No notifications</p>
                  ) : notifications.slice(0, 6).map((n) => (
                    <div
                      key={n.id}
                      onClick={() => { markNotificationRead(n.id); setNotifOpen(false); if (n.proposalId) navigate(`/proposals/${n.proposalId}`); }}
                      className={`px-4 py-3 hover:bg-muted cursor-pointer transition-colors border-b border-border last:border-0 ${!n.read ? "bg-primary/5" : ""}`}
                    >
                      <p className="text-sm font-medium text-foreground">{n.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => { setUserMenuOpen((p) => !p); setNotifOpen(false); }}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-[11px] font-semibold text-primary">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
            {userMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden animate-slide-up">
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-sm font-medium text-foreground">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
                <div className="p-1">
                  <button
                    onClick={() => { navigate("/settings"); setUserMenuOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-muted transition-colors"
                  >
                    <Settings className="w-4 h-4 text-muted-foreground" />
                    Settings
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-danger hover:bg-danger/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Log out
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
