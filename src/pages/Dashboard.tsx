import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, TrendingUp, TrendingDown, ArrowRight, MoreHorizontal, Eye, Edit, Copy, Trash, Send } from "lucide-react";
import { useApp } from "../lib/store";
import { CURRENCY_SYMBOLS } from "../types";
import type { Proposal, ProposalStatus } from "../types";

const STATUS_STYLES: Record<ProposalStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  sent: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  viewed: "bg-warning/10 text-warning",
  accepted: "bg-success/10 text-success",
  rejected: "bg-danger/10 text-danger",
  expired: "bg-muted text-muted-foreground",
};

function StatusBadge({ status }: { status: ProposalStatus }) {
  const labels: Record<ProposalStatus, string> = {
    draft: "Draft", sent: "Sent", viewed: "Viewed",
    accepted: "Accepted", rejected: "Rejected", expired: "Expired",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLES[status]}`}>
      {labels[status]}
    </span>
  );
}

function MetricCard({ label, value, sub, trend, trendUp }: {
  label: string; value: string; sub?: string; trend?: string; trendUp?: boolean;
}) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">{label}</p>
      <p className="text-2xl font-bold text-foreground mb-1">{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      {trend && (
        <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${trendUp ? "text-success" : "text-danger"}`}>
          {trendUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
          {trend}
        </div>
      )}
    </div>
  );
}

function ProposalActions({ proposal, onDelete, onDuplicate }: {
  proposal: Proposal;
  onDelete: () => void;
  onDuplicate: () => void;
}) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  return (
    <div className="relative">
      <button onClick={(e) => { e.stopPropagation(); setOpen((p) => !p); }} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
        <MoreHorizontal className="w-4 h-4" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-7 z-20 bg-card border border-border rounded-xl shadow-xl w-44 py-1 overflow-hidden animate-slide-up">
            <button onClick={() => { navigate(`/proposals/${proposal.id}`); setOpen(false); }} className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-foreground hover:bg-muted">
              <Edit className="w-3.5 h-3.5 text-muted-foreground" /> Edit
            </button>
            <button onClick={() => { navigate(`/proposals/${proposal.id}/preview`); setOpen(false); }} className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-foreground hover:bg-muted">
              <Eye className="w-3.5 h-3.5 text-muted-foreground" /> Preview
            </button>
            <button onClick={() => { onDuplicate(); setOpen(false); }} className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-foreground hover:bg-muted">
              <Copy className="w-3.5 h-3.5 text-muted-foreground" /> Duplicate
            </button>
            <div className="my-1 border-t border-border" />
            <button onClick={() => { onDelete(); setOpen(false); }} className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-danger hover:bg-danger/10">
              <Trash className="w-3.5 h-3.5" /> Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function formatCurrency(amount: number, currency: string) {
  const sym = CURRENCY_SYMBOLS[currency] || currency;
  if (amount >= 100000) return `${sym}${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `${sym}${(amount / 1000).toFixed(0)}k`;
  return `${sym}${amount.toLocaleString()}`;
}

export default function Dashboard() {
  const { user, proposals, deleteProposal, duplicateProposal } = useApp();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<ProposalStatus | "all">("all");

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const metrics = useMemo(() => {
    const active = proposals.filter((p) => !p.isArchived);
    const total = active.length;
    const sent = active.filter((p) => p.status !== "draft").length;
    const viewed = active.filter((p) => ["viewed", "accepted", "rejected"].includes(p.status)).length;
    const accepted = active.filter((p) => p.status === "accepted").length;
    const winRate = sent > 0 ? Math.round((accepted / sent) * 100) : 0;
    const totalValue = active.filter((p) => p.status === "accepted").reduce((s, p) => s + p.price, 0);
    return { total, sent, viewed, accepted, winRate, totalValue };
  }, [proposals]);

  const filtered = useMemo(() => {
    const active = proposals.filter((p) => !p.isArchived);
    if (filter === "all") return active.slice(0, 8);
    return active.filter((p) => p.status === filter).slice(0, 8);
  }, [proposals, filter]);

  const currency = user?.currency || "INR";
  const sym = CURRENCY_SYMBOLS[currency];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{greeting}, {user?.firstName}.</h1>
          <p className="text-muted-foreground text-sm mt-1">Ready to win your next project?</p>
        </div>
        <button
          onClick={() => navigate("/proposals/new")}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Proposal
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 mb-8">
        <MetricCard label="Total Proposals" value={String(metrics.total)} sub="Created so far" />
        <MetricCard label="Sent" value={String(metrics.sent)} sub="Delivered to clients" />
        <MetricCard label="Viewed" value={String(metrics.viewed)} sub="Opened by clients" />
        <MetricCard label="Accepted" value={String(metrics.accepted)} sub="Agreements signed" />
        <MetricCard label="Win Rate" value={`${metrics.winRate}%`} sub={metrics.sent > 0 ? "Conversion rate" : "0 sent proposals"} />
        <MetricCard label="Won Value" value={formatCurrency(metrics.totalValue, currency)} sub="Total closed revenue" />
      </div>

      {/* Proposals */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-foreground">Recent Proposals</h2>
          <Link to="/proposals" className="text-xs text-primary font-medium flex items-center gap-1 hover:underline">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Filter tabs */}
        <div className="px-6 py-3 border-b border-border flex gap-1 overflow-x-auto">
          {(["all", "draft", "sent", "viewed", "accepted", "rejected"] as const).map((s) => (
            <button
              key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors capitalize ${
                filter === s ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {s === "all" ? "All" : s}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-muted mx-auto mb-4 flex items-center justify-center">
              <Send className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Your first proposal is waiting.</h3>
            <p className="text-sm text-muted-foreground mb-5">Paste a client brief and let ProposalAI do the heavy lifting.</p>
            <button
              onClick={() => navigate("/proposals/new")}
              className="bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors"
            >
              Create Proposal
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {["Client", "Project", "Value", "Status", "Created", "Last Activity", ""].map((h) => (
                    <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((proposal) => (
                  <tr
                    key={proposal.id}
                    onClick={() => navigate(`/proposals/${proposal.id}`)}
                    className="border-b border-border last:border-0 hover:bg-muted/40 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-foreground">{proposal.clientName}</p>
                        {proposal.company && <p className="text-xs text-muted-foreground">{proposal.company}</p>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-foreground">{proposal.projectName}</p>
                      <p className="text-xs text-muted-foreground">{proposal.projectType}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-foreground">
                        {formatCurrency(proposal.price, proposal.currency)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={proposal.status} />
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-muted-foreground">{formatDate(proposal.createdAt)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-muted-foreground">
                        {formatDate(proposal.acceptedAt || proposal.viewedAt || proposal.sentAt || proposal.updatedAt)}
                      </p>
                    </td>
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <ProposalActions
                        proposal={proposal}
                        onDelete={() => deleteProposal(proposal.id)}
                        onDuplicate={() => { duplicateProposal(proposal.id); }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Usage meter */}
      {user?.subscription === "free" && (
        <div className="mt-6 bg-primary/5 border border-primary/20 rounded-2xl p-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-foreground mb-1">
              {user.usageThisMonth} / 3 AI proposals used this month
            </p>
            <div className="h-1.5 w-48 bg-border rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${Math.min((user.usageThisMonth / 3) * 100, 100)}%` }}
              />
            </div>
          </div>
          <Link
            to="/checkout?plan=pro"
            className="shrink-0 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20"
          >
            Upgrade to Pro
          </Link>
        </div>
      )}
    </div>
  );
}
