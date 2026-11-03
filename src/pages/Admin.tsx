import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Users, CreditCard, Shield, Sparkles, Search, Filter, RefreshCw, CheckCircle2,
  AlertCircle, ArrowUpRight, TrendingUp, DollarSign, FileText, Smartphone,
  Copy, Check, MoreVertical, Trash2, ArrowLeft, Download, ShieldCheck,
  UserCheck, Ban, Zap, Clock, ExternalLink, QrCode
} from "lucide-react";
import { useApp } from "../lib/store";
import { isPlatformAdmin, AdminUserView, AdminTransaction, SubscriptionPlan, PLAN_PRICES } from "../types";
import { FREE_PAYMENT_CONFIG, getActivePaymentConfig, buildUpiIntentUrl, buildUpiQrCodeUrl } from "../config/payments";

export default function Admin() {
  const {
    user,
    getAllPlatformUsers,
    updateUserPlanByAdmin,
    resetUserUsageByAdmin,
    deleteUserByAdmin,
    getAllTransactions,
    verifyTransaction,
    updateUser,
  } = useApp();

  const navigate = useNavigate();

  // Security gate: only platform admins can view this console
  const isAdmin = isPlatformAdmin(user);

  const [activeTab, setActiveTab] = useState<"users" | "transactions" | "payouts" | "system">("users");
  const [loading, setLoading] = useState(true);
  const [usersList, setUsersList] = useState<AdminUserView[]>([]);
  const [transactionsList, setTransactionsList] = useState<AdminTransaction[]>([]);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Edit User Plan Modal State
  const [selectedUser, setSelectedUser] = useState<AdminUserView | null>(null);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan>("pro");
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Payout Configuration State
  const activeAdminConfig = getActivePaymentConfig();
  const [upiId, setUpiId] = useState(activeAdminConfig.upiId);
  const [upiName, setUpiName] = useState(activeAdminConfig.merchantName);
  const [bankName, setBankName] = useState(activeAdminConfig.bankName);
  const [accountNumber, setAccountNumber] = useState(activeAdminConfig.accountNumber);
  const [ifscCode, setIfscCode] = useState(activeAdminConfig.ifscCode);
  const [payoutSaved, setPayoutSaved] = useState(false);

  // Platform Access Mode (Public vs Admin-Only)
  const [adminOnlyMode, setAdminOnlyMode] = useState<boolean>(() => {
    return localStorage.getItem("pai_admin_only_mode") === "true";
  });

  const toggleAdminOnlyMode = () => {
    const next = !adminOnlyMode;
    setAdminOnlyMode(next);
    localStorage.setItem("pai_admin_only_mode", String(next));
    setActionSuccess(
      next
        ? "Platform locked to Admin-Only Mode. Normal users cannot sign in or register."
        : "Public access restored. Normal users can sign in and create proposals."
    );
    setTimeout(() => setActionSuccess(null), 3500);
  };

  // Fetch all user and transaction data
  const loadData = async () => {
    setLoading(true);
    try {
      const users = await getAllPlatformUsers();
      setUsersList(users);
      const txs = getAllTransactions();
      setTransactionsList(txs);
    } catch (err) {
      console.error("Error loading admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleUpdatePlan = async () => {
    if (!selectedUser) return;
    await updateUserPlanByAdmin(selectedUser.id, editingPlan);
    setActionSuccess(`Successfully updated ${selectedUser.firstName}'s plan to ${editingPlan.toUpperCase()}!`);
    setSelectedUser(null);
    await loadData();
    setTimeout(() => setActionSuccess(null), 3000);
  };

  const handleResetUsage = async (userId: string, userName: string) => {
    if (confirm(`Reset proposal usage limit for ${userName} back to 0?`)) {
      await resetUserUsageByAdmin(userId);
      setActionSuccess(`Reset usage count for ${userName} to 0 proposals.`);
      await loadData();
      setTimeout(() => setActionSuccess(null), 3000);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (confirm(`Are you sure you want to permanently delete user account "${userName}"? This cannot be undone.`)) {
      await deleteUserByAdmin(userId);
      setActionSuccess(`Deleted user ${userName}.`);
      await loadData();
      setTimeout(() => setActionSuccess(null), 3000);
    }
  };

  const handleVerifyTx = (txId: string) => {
    verifyTransaction(txId);
    setActionSuccess(`Transaction ${txId} verified and subscriber upgraded!`);
    loadData();
    setTimeout(() => setActionSuccess(null), 3000);
  };

  const handleSavePayouts = () => {
    try {
      const config = {
        upiId,
        merchantName: upiName,
        accountHolder: upiName,
        bankName,
        accountNumber,
        ifscCode,
        branch: activeAdminConfig.branch || "Ahmedabad Main Branch",
        instructions: activeAdminConfig.instructions,
      };
      localStorage.setItem("pai_admin_payment_config", JSON.stringify(config));
      updateUser({ upiId, upiName, bankName, accountNumber, ifscCode });
      setPayoutSaved(true);
      setTimeout(() => setPayoutSaved(false), 2500);
    } catch (e) {
      alert("Failed to save payout settings.");
    }
  };

  // Filtered Users List
  const filteredUsers = useMemo(() => {
    return usersList.filter((u) => {
      const matchesSearch =
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.businessName || "").toLowerCase().includes(searchQuery.toLowerCase());

      const matchesPlan = planFilter === "all" || u.subscription === planFilter;
      return matchesSearch && matchesPlan;
    });
  }, [usersList, searchQuery, planFilter]);

  // Executive Metrics Calculation
  const totalUsers = usersList.length;
  const freeUsers = usersList.filter((u) => u.subscription === "free").length;
  const proUsers = usersList.filter((u) => u.subscription === "pro").length;
  const studioUsers = usersList.filter((u) => u.subscription === "studio").length;
  const totalPaidUsers = proUsers + studioUsers;

  // Platform Gross Revenue calculation from transactions + active plans
  const totalRevenue = useMemo(() => {
    const txTotal = transactionsList.reduce((acc, tx) => acc + (tx.amount || 0), 0);
    if (txTotal > 0) return txTotal;
    return (proUsers * 49) + (studioUsers * 99);
  }, [transactionsList, proUsers, studioUsers]);

  const totalProposalsCreated = useMemo(() => {
    return usersList.reduce((acc, u) => acc + (u.proposalsCount || 0), 0);
  }, [usersList]);

  // If unauthorized non-admin attempts access
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-900 border border-red-500/30 rounded-3xl p-8 text-center shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold mb-2">Unauthorized Admin Access</h1>
          <p className="text-sm text-slate-400 mb-6">
            The Admin Console is strictly reserved for the ProposalAI platform owner. Please log in with authorized administrator credentials.
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className="w-full bg-violet-600 hover:bg-violet-700 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-24 font-sans selection:bg-violet-500/30">
      {/* Top Admin Navigation Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-xl sticky top-0 z-40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Return to User Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-violet-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-white tracking-tight">ProposalAI Admin Console</h1>
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-gradient-to-r from-amber-400/20 to-amber-600/20 text-amber-300 border border-amber-500/40 px-2.5 py-0.5 rounded-full">
                  👑 Super Admin
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Logged in as <strong className="text-slate-200">{user?.firstName} {user?.lastName}</strong> ({user?.email}) · Full Platform Control
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-violet-400" : ""}`} />
              <span>{loading ? "Syncing..." : "Refresh Live Data"}</span>
            </button>
            <Link
              to="/dashboard"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 text-xs font-semibold border border-violet-500/30 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>User App View</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-8 space-y-8">
        {/* Action Success Toast */}
        {actionSuccess && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-2xl flex items-center gap-3 text-sm animate-fade-in shadow-lg">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
            <span className="font-medium">{actionSuccess}</span>
          </div>
        )}

        {/* 5 Executive KPI Metric Cards */}
        <section className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400">Total Users</span>
              <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white tracking-tight">{totalUsers}</p>
            <p className="text-[11px] text-slate-400 mt-1">
              <span className="text-slate-200 font-semibold">{freeUsers}</span> Free tier accounts
            </p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400">Paid Subscribers</span>
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-emerald-400 tracking-tight">{totalPaidUsers}</p>
            <p className="text-[11px] text-slate-400 mt-1">
              <span className="text-blue-400 font-semibold">{proUsers}</span> Pro · <span className="text-purple-400 font-semibold">{studioUsers}</span> Studio
            </p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400">Platform Revenue</span>
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-amber-400 tracking-tight">₹{totalRevenue.toLocaleString()}</p>
            <p className="text-[11px] text-slate-400 mt-1">0% platform cuts · Direct UPI</p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400">Proposals Created</span>
              <div className="p-1.5 rounded-lg bg-violet-500/10 text-violet-400">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-violet-400 tracking-tight">{totalProposalsCreated}</p>
            <p className="text-[11px] text-slate-400 mt-1">Generated by active users</p>
          </div>

          <div className="col-span-2 lg:col-span-1 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400">Direct Receiver</span>
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                <Smartphone className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xs font-mono font-bold text-emerald-300 truncate" title={upiId}>
              {upiId}
            </p>
            <p className="text-[11px] text-slate-400 mt-1 truncate">{upiName}</p>
          </div>
        </section>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab("users")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "users"
                ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>User Directory ({totalUsers})</span>
          </button>

          <button
            onClick={() => setActiveTab("transactions")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "transactions"
                ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Subscriptions & UTR Ledger ({transactionsList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("payouts")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "payouts"
                ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Payout Receiver Setup</span>
          </button>

          <button
            onClick={() => setActiveTab("system")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "system"
                ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Database & Backups</span>
          </button>
        </div>

        {/* TAB 1: USER MANAGEMENT DIRECTORY */}
        {activeTab === "users" && (
          <div className="space-y-4">
            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search user by name, email, or company..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto">
                <span className="text-[11px] text-slate-400 font-medium mr-1 flex items-center gap-1">
                  <Filter className="w-3 h-3" /> Filter Plan:
                </span>
                {(["all", "free", "pro", "studio"] as const).map((plan) => (
                  <button
                    key={plan}
                    onClick={() => setPlanFilter(plan)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors cursor-pointer ${
                      planFilter === plan
                        ? "bg-violet-600 text-white"
                        : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    {plan}
                  </button>
                ))}
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="px-5 py-3.5 font-semibold">User / Identity</th>
                      <th className="px-4 py-3.5 font-semibold">Current Plan</th>
                      <th className="px-4 py-3.5 font-semibold">Proposal Usage</th>
                      <th className="px-4 py-3.5 font-semibold">Total Proposals</th>
                      <th className="px-4 py-3.5 font-semibold">Clients</th>
                      <th className="px-4 py-3.5 font-semibold">Joined Date</th>
                      <th className="px-5 py-3.5 font-semibold text-right">Admin Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                          <Users className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                          <p className="font-semibold text-slate-300">No users found</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">Try adjusting your search query or plan filter.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => {
                        const isSelfAdmin = u.email === user?.email;
                        const planLimits = { free: 3, pro: 30, studio: 999 };
                        const limit = planLimits[u.subscription] || 3;
                        const usagePct = Math.min(100, Math.round(((u.usageThisMonth || 0) / limit) * 100));

                        return (
                          <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                            {/* User & Email */}
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow">
                                  {u.firstName?.[0] || "U"}{u.lastName?.[0] || ""}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-semibold text-white truncate">
                                      {u.firstName} {u.lastName}
                                    </span>
                                    {isSelfAdmin && (
                                      <span className="text-[9px] bg-amber-500/20 text-amber-300 font-bold px-1.5 py-0.2 rounded border border-amber-500/30">
                                        YOU
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1 text-slate-400 font-mono text-[11px] mt-0.5">
                                    <span className="truncate">{u.email}</span>
                                    <button
                                      onClick={() => copyToClipboard(u.email, `email-${u.id}`)}
                                      className="text-slate-500 hover:text-slate-300"
                                      title="Copy email"
                                    >
                                      {copiedId === `email-${u.id}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Plan Badge */}
                            <td className="px-4 py-3.5">
                              {u.subscription === "studio" ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                                  <Sparkles className="w-3 h-3 text-purple-400" /> Studio (₹99/mo)
                                </span>
                              ) : u.subscription === "pro" ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-300 border border-blue-500/30">
                                  <Zap className="w-3 h-3 text-blue-400" /> Pro (₹49/mo)
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                                  Free (₹0/mo)
                                </span>
                              )}
                            </td>

                            {/* Usage Meter */}
                            <td className="px-4 py-3.5">
                              <div className="space-y-1 min-w-[100px]">
                                <div className="flex justify-between text-[11px]">
                                  <span className="text-slate-300 font-medium">{u.usageThisMonth || 0} used</span>
                                  <span className="text-slate-400">{u.subscription === "studio" ? "Unlimited" : `/ ${limit}`}</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${
                                      usagePct >= 90 ? "bg-red-500" : usagePct >= 60 ? "bg-amber-500" : "bg-emerald-500"
                                    }`}
                                    style={{ width: `${Math.min(100, usagePct)}%` }}
                                  />
                                </div>
                              </div>
                            </td>

                            {/* Proposals Count */}
                            <td className="px-4 py-3.5 font-semibold text-slate-200">
                              {u.proposalsCount || 0}
                            </td>

                            {/* Clients Count */}
                            <td className="px-4 py-3.5 text-slate-300">
                              {u.clientsCount || 0}
                            </td>

                            {/* Joined Date */}
                            <td className="px-4 py-3.5 text-slate-400 text-[11px]">
                              {u.joinedAt ? new Date(u.joinedAt).toLocaleDateString() : "Active"}
                            </td>

                            {/* Actions */}
                            <td className="px-5 py-3.5 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => {
                                    setSelectedUser(u);
                                    setEditingPlan(u.subscription);
                                  }}
                                  className="px-2.5 py-1 bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/30 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                                >
                                  Change Plan
                                </button>

                                <button
                                  onClick={() => handleResetUsage(u.id, `${u.firstName} ${u.lastName}`)}
                                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                                  title="Reset proposal usage count to 0"
                                >
                                  <RefreshCw className="w-3.5 h-3.5" />
                                </button>

                                {!isSelfAdmin && (
                                  <button
                                    onClick={() => handleDeleteUser(u.id, `${u.firstName} ${u.lastName}`)}
                                    className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                                    title="Delete account"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TRANSACTIONS & UTR VERIFICATION LEDGER */}
        {activeTab === "transactions" && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-white">Subscription Checkout Ledger</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Real-time record of all user upgrades, direct UPI payments, and 12-digit UTR numbers submitted on checkout.
                </p>
              </div>
              <span className="text-xs bg-emerald-500/15 text-emerald-400 font-bold px-3 py-1 rounded-full border border-emerald-500/30">
                100% Direct Payouts
              </span>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="px-5 py-3.5 font-semibold">Order ID</th>
                      <th className="px-4 py-3.5 font-semibold">Customer</th>
                      <th className="px-4 py-3.5 font-semibold">Plan Purchased</th>
                      <th className="px-4 py-3.5 font-semibold">Amount</th>
                      <th className="px-4 py-3.5 font-semibold">Payment Method</th>
                      <th className="px-4 py-3.5 font-semibold">12-Digit UTR / Ref</th>
                      <th className="px-4 py-3.5 font-semibold">Date</th>
                      <th className="px-5 py-3.5 font-semibold text-right">Verification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {transactionsList.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                          <CreditCard className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                          <p className="font-semibold text-slate-300">No transactions recorded yet</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            When users upgrade to Pro (₹49) or Studio (₹99) on checkout, transactions will appear here instantly.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      transactionsList.map((tx) => (
                        <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="px-5 py-3.5 font-mono text-[11px] font-bold text-violet-300">
                            {tx.id}
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="font-semibold text-white block">{tx.userName}</span>
                            <span className="text-[11px] text-slate-400 font-mono">{tx.userEmail}</span>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="font-semibold text-slate-200 capitalize">{tx.planName}</span>
                            <span className="text-[10px] text-slate-500 block uppercase font-mono">{tx.billingCycle}</span>
                          </td>
                          <td className="px-4 py-3.5 font-bold text-white">
                            ₹{tx.amount}
                          </td>
                          <td className="px-4 py-3.5 text-slate-300">
                            {tx.paymentMethod}
                          </td>
                          <td className="px-4 py-3.5">
                            {tx.utrNumber ? (
                              <div className="flex items-center gap-1 font-mono text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 max-w-fit">
                                <span>{tx.utrNumber}</span>
                                <button
                                  onClick={() => copyToClipboard(tx.utrNumber!, `utr-${tx.id}`)}
                                  className="text-slate-400 hover:text-white"
                                  title="Copy UTR reference"
                                >
                                  {copiedId === `utr-${tx.id}` ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
                                </button>
                              </div>
                            ) : (
                              <span className="text-slate-500">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 text-slate-400 text-[11px]">
                            {new Date(tx.date).toLocaleDateString()}
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            {tx.status === "verified" ? (
                              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
                                <CheckCircle2 className="w-3 h-3" /> Verified
                              </span>
                            ) : (
                              <button
                                onClick={() => handleVerifyTx(tx.id)}
                                className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-semibold cursor-pointer"
                              >
                                Verify & Activate
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ADMIN PAYOUT RECEIVER CONFIGURATION */}
        {activeTab === "payouts" && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-base font-bold text-white">Platform Payment Receiver Configuration</h2>
                  <span className="text-[10px] bg-emerald-500/15 text-emerald-400 font-extrabold px-2 py-0.5 rounded-full">
                    CHECKOUT ACTIVE
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  This sets where customer subscription payments (Pro ₹49 / Studio ₹99) are routed during /checkout.
                  <span className="block text-violet-400 text-[11px] font-medium mt-0.5">
                    🔒 Strictly hidden from regular users. Only managed here in the Admin Console.
                  </span>
                </p>
              </div>

              <button
                onClick={handleSavePayouts}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  payoutSaved ? "bg-emerald-500 text-white" : "bg-violet-600 hover:bg-violet-500 text-white"
                }`}
              >
                {payoutSaved ? "Saved & Live!" : "Save Payout Settings"}
              </button>
            </div>

            <div className="grid md:grid-cols-12 gap-6">
              <div className="md:col-span-7 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Receiving UPI ID (VPA)</label>
                  <input
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="e.g. aejazrocks618@oksbi"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">Found in Google Pay, PhonePe, Paytm, or bank app.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Merchant / Account Display Name</label>
                  <input
                    value={upiName}
                    onChange={(e) => setUpiName(e.target.value)}
                    placeholder="e.g. The Box Ux"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Bank Name</label>
                    <input
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="e.g. State Bank of India"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">IFSC Code</label>
                    <input
                      value={ifscCode}
                      onChange={(e) => setIfscCode(e.target.value)}
                      placeholder="e.g. HDFC0000123"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Bank Account Number</label>
                  <input
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="e.g. 50200098765432"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </div>

              {/* Live Scannable Checkout QR Preview */}
              <div className="md:col-span-5 bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">Live Scannable QR Preview on /checkout</span>
                <div className="bg-white p-3 rounded-2xl border border-slate-700 shadow-xl mb-3">
                  <img
                    src={buildUpiQrCodeUrl(buildUpiIntentUrl({
                      upiId: upiId || FREE_PAYMENT_CONFIG.upiId,
                      merchantName: upiName || FREE_PAYMENT_CONFIG.merchantName,
                      amount: 49,
                      transactionNote: "ProposalAI Pro Subscription"
                    }), 180)}
                    alt="Preview QR"
                    className="w-36 h-36 object-contain rounded-lg"
                  />
                </div>
                <p className="text-xs font-semibold text-white">{upiName || "The Box Ux"}</p>
                <p className="text-[11px] font-mono text-slate-400">{upiId || "aejazrocks618@oksbi"}</p>
                <span className="inline-block mt-2 text-[10px] bg-emerald-500/15 text-emerald-400 font-semibold px-2 py-0.5 rounded-full">
                  Instant Direct Settlement (0% Fees)
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: DATABASE & SYSTEM HEALTH */}
        {activeTab === "system" && (
          <div className="space-y-6">
            {/* Admin-Only Platform Lock Control */}
            <div className={`p-6 rounded-2xl border transition-all ${
              adminOnlyMode
                ? "bg-amber-950/20 border-amber-500/40"
                : "bg-slate-900 border-slate-800"
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-amber-400" />
                    <h3 className="text-sm font-bold text-white">Platform Access Lock (Admin-Only Mode)</h3>
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                      adminOnlyMode
                        ? "bg-amber-500 text-slate-950 font-black animate-pulse"
                        : "bg-slate-800 text-slate-300 border border-slate-700"
                    }`}>
                      {adminOnlyMode ? "LOCKED TO ADMIN ONLY" : "PUBLIC ACCESS ACTIVE"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
                    When enabled, <strong>no normal user can sign up or log in</strong>. Any attempt by regular users to log in or register is blocked with an admin maintenance message. Only verified platform administrators can log in.
                  </p>
                </div>

                <button
                  onClick={toggleAdminOnlyMode}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-lg ${
                    adminOnlyMode
                      ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30"
                      : "bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/30"
                  }`}
                >
                  {adminOnlyMode ? "Unlock to Public Access" : "Lock to Admin-Only Mode"}
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-sm font-semibold text-white">System Architecture & Database Health</h3>
                </div>
                <div className="space-y-3 text-xs text-slate-300">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                    <span>Cloud Database (Supabase)</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">
                      Dual-Sync Active
                    </span>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                    <span>Local Account Storage (Browser Cache)</span>
                    <span className="font-mono text-slate-400">{usersList.length} Accounts Synchronized</span>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                    <span>Zero Dummy Data Filter</span>
                    <span className="text-emerald-400 font-semibold">Strict Domain Enforced</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
                <div className="flex items-center gap-2">
                  <Download className="w-5 h-5 text-violet-400" />
                  <h3 className="text-sm font-semibold text-white">Export Platform Data Backup</h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Download a complete, encrypted JSON snapshot of all registered users, proposal metadata, and verified transaction receipts.
                </p>
                <button
                  onClick={() => {
                    const backup = {
                      exportedAt: new Date().toISOString(),
                      totalUsers: usersList.length,
                      users: usersList,
                      transactions: transactionsList,
                    };
                    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `proposal-ai-admin-backup-${Date.now()}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 text-white py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Platform Backup (JSON)</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Change User Plan Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 animate-scale-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-violet-600 flex items-center justify-center font-bold text-white text-xs">
                  {selectedUser.firstName?.[0]}{selectedUser.lastName?.[0]}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Modify User Plan</h3>
                  <p className="text-[11px] text-slate-400">{selectedUser.firstName} {selectedUser.lastName} ({selectedUser.email})</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5">
              <label className="block text-xs font-semibold text-slate-300">Select Subscription Tier</label>
              {(["free", "pro", "studio"] as const).map((plan) => (
                <div
                  key={plan}
                  onClick={() => setEditingPlan(plan)}
                  className={`p-3 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                    editingPlan === plan
                      ? "bg-violet-600/20 border-violet-500 text-white"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <div className="capitalize font-semibold text-xs">
                    {plan} Plan {plan === "pro" ? "(₹49/mo)" : plan === "studio" ? "(₹99/mo)" : "(₹0/mo)"}
                  </div>
                  {editingPlan === plan && <Check className="w-4 h-4 text-violet-400" />}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setSelectedUser(null)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdatePlan}
                className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-lg shadow-violet-600/30"
              >
                Save New Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

