import { useMemo } from "react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, FileText, Eye, Check, X } from "lucide-react";
import { useApp } from "../lib/store";
import { CURRENCY_SYMBOLS } from "../types";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function MetricCard({ label, value, sub, icon: Icon, trend, trendUp }: {
  label: string; value: string; sub?: string; icon: React.ElementType; trend?: string; trendUp?: boolean;
}) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        {trend && (
          <span className={`flex items-center gap-1 text-xs font-semibold ${trendUp ? "text-success" : "text-danger"}`}>
            {trendUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            {trend}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-foreground mb-0.5">{value}</p>
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{value: number; name: string}>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-xl px-3 py-2 shadow-lg text-xs">
        <p className="font-semibold text-foreground mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-muted-foreground">{p.name}: <span className="font-medium text-foreground">{p.value}</span></p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Analytics() {
  const { proposals, user } = useApp();
  const currency = user?.currency || "INR";
  const sym = CURRENCY_SYMBOLS[currency] || "₹";

  const metrics = useMemo(() => {
    const total = proposals.length;
    const sent = proposals.filter((p) => p.status !== "draft").length;
    const viewed = proposals.filter((p) => ["viewed", "accepted", "rejected"].includes(p.status)).length;
    const accepted = proposals.filter((p) => p.status === "accepted").length;
    const rejected = proposals.filter((p) => p.status === "rejected").length;
    const winRate = sent > 0 ? Math.round((accepted / sent) * 100) : 0;
    const viewRate = sent > 0 ? Math.round((viewed / sent) * 100) : 0;
    const totalValue = proposals.filter((p) => p.status === "accepted").reduce((s, p) => s + p.price, 0);
    const avgValue = total > 0 ? Math.round(proposals.reduce((s, p) => s + p.price, 0) / total) : 0;
    return { total, sent, viewed, accepted, rejected, winRate, viewRate, totalValue, avgValue };
  }, [proposals]);

  // Monthly data for chart
  const monthlyData = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      const m = d.getMonth();
      const y = d.getFullYear();
      const monthProposals = proposals.filter((p) => {
        const pd = new Date(p.createdAt);
        return pd.getMonth() === m && pd.getFullYear() === y;
      });
      return {
        month: MONTH_NAMES[m],
        proposals: monthProposals.length,
        accepted: monthProposals.filter((p) => p.status === "accepted").length,
        value: Math.round(monthProposals.filter((p) => p.status === "accepted").reduce((s, p) => s + p.price, 0) / 1000),
      };
    });
  }, [proposals]);

  // Status breakdown
  const statusData = useMemo(() => [
    { name: "Accepted", value: metrics.accepted, color: "#059669" },
    { name: "Viewed", value: proposals.filter((p) => p.status === "viewed").length, color: "#d97706" },
    { name: "Sent", value: proposals.filter((p) => p.status === "sent").length, color: "#3b82f6" },
    { name: "Draft", value: proposals.filter((p) => p.status === "draft").length, color: "#6b6b7a" },
    { name: "Rejected", value: metrics.rejected, color: "#dc2626" },
  ].filter((d) => d.value > 0), [metrics, proposals]);

  // Top proposals
  const topProposals = useMemo(() =>
    [...proposals].filter((p) => p.status === "accepted").sort((a, b) => b.price - a.price).slice(0, 5),
    [proposals]
  );

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-7">
        <h1 className="text-2xl font-semibold text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">Track your proposal performance and win rate.</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <MetricCard label="Total Proposals" value={String(metrics.total)} icon={FileText} trend="+3 this month" trendUp />
        <MetricCard label="View Rate" value={`${metrics.viewRate}%`} icon={Eye} sub={`${metrics.viewed} of ${metrics.sent} sent`} trend="+8%" trendUp />
        <MetricCard label="Win Rate" value={`${metrics.winRate}%`} icon={Check} sub={`${metrics.accepted} accepted`} trend="+5%" trendUp />
        <MetricCard label="Won Value" value={`${sym}${(metrics.totalValue / 1000).toFixed(0)}k`} icon={TrendingUp} sub={`avg ${sym}${metrics.avgValue.toLocaleString()}`} trend="+22%" trendUp />
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-5 mb-8">
        {/* Area chart: proposals over time */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-5">
          <h2 className="font-semibold text-foreground mb-4">Proposals over time</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="proposalGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="acceptedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--success)" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="var(--success)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="proposals" name="Proposals" stroke="var(--primary)" fill="url(#proposalGrad)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="accepted" name="Accepted" stroke="var(--success)" fill="url(#acceptedGrad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Status breakdown */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h2 className="font-semibold text-foreground mb-4">Status breakdown</h2>
          <div className="space-y-3">
            {statusData.map(({ name, value, color }) => (
              <div key={name}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-muted-foreground">{name}</span>
                  <span className="font-semibold text-foreground">{value}</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${metrics.total > 0 ? (value / metrics.total) * 100 : 0}%`, backgroundColor: color }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 pt-4 border-t border-border space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">View rate</span>
              <span className="font-semibold text-foreground">{metrics.viewRate}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Win rate</span>
              <span className="font-semibold text-success">{metrics.winRate}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Value chart */}
      <div className="bg-card border border-border rounded-2xl p-5 mb-8">
        <h2 className="font-semibold text-foreground mb-4">Won value by month ({sym}k)</h2>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" name={`Value (${sym}k)`} fill="var(--primary)" radius={[4, 4, 0, 0]} opacity={0.85} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top accepted proposals */}
      {topProposals.length > 0 && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="font-semibold text-foreground">Top accepted proposals</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {["Project", "Client", "Value", "Accepted"].map((h) => (
                    <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {topProposals.map((p) => (
                  <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-foreground">{p.projectName}</p>
                      <p className="text-xs text-muted-foreground">{p.projectType}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">{p.clientName}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-foreground">{sym}{p.price.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {p.acceptedAt ? new Date(p.acceptedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
