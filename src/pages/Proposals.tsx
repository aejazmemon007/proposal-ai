import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, MoreHorizontal, Eye, Edit, Copy, Trash, Archive, FileText } from "lucide-react";
import { useApp } from "../lib/store";
import { CURRENCY_SYMBOLS } from "../types";
import type { ProposalStatus, Proposal } from "../types";

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
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLES[status]}`}>
      {labels[status]}
    </span>
  );
}

function formatDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function RowMenu({ proposal }: { proposal: Proposal }) {
  const [open, setOpen] = useState(false);
  const { deleteProposal, duplicateProposal, updateProposal } = useApp();
  const navigate = useNavigate();
  return (
    <div className="relative">
      <button onClick={(e) => { e.stopPropagation(); setOpen((p) => !p); }} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground">
        <MoreHorizontal className="w-4 h-4" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 z-20 bg-card border border-border rounded-xl shadow-xl w-44 py-1 animate-slide-up">
            <button onClick={() => { navigate(`/proposals/${proposal.id}`); setOpen(false); }} className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-foreground hover:bg-muted">
              <Edit className="w-3.5 h-3.5 text-muted-foreground" /> Edit
            </button>
            <button onClick={() => { navigate(`/proposals/${proposal.id}/preview`); setOpen(false); }} className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-foreground hover:bg-muted">
              <Eye className="w-3.5 h-3.5 text-muted-foreground" /> Preview
            </button>
            <button onClick={() => { duplicateProposal(proposal.id); setOpen(false); }} className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-foreground hover:bg-muted">
              <Copy className="w-3.5 h-3.5 text-muted-foreground" /> Duplicate
            </button>
            <button onClick={() => { updateProposal(proposal.id, { isArchived: true }); setOpen(false); }} className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-foreground hover:bg-muted">
              <Archive className="w-3.5 h-3.5 text-muted-foreground" /> Archive
            </button>
            <div className="my-1 border-t border-border" />
            <button onClick={() => { deleteProposal(proposal.id); setOpen(false); }} className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-danger hover:bg-danger/10">
              <Trash className="w-3.5 h-3.5" /> Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function Proposals() {
  const { proposals } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProposalStatus | "all" | "archived">("all");

  const filtered = useMemo(() => {
    let list = proposals;
    if (statusFilter === "archived") list = list.filter((p) => p.isArchived);
    else if (statusFilter === "all") list = list.filter((p) => !p.isArchived);
    else list = list.filter((p) => p.status === statusFilter && !p.isArchived);

    if (search) {
      const q = search.toLowerCase();
      list = list.filter((p) =>
        p.clientName.toLowerCase().includes(q) ||
        p.projectName.toLowerCase().includes(q) ||
        p.company?.toLowerCase().includes(q) ||
        p.projectType.toLowerCase().includes(q)
      );
    }
    return list;
  }, [proposals, search, statusFilter]);

  const counts = useMemo(() => {
    const active = proposals.filter((p) => !p.isArchived);
    return {
      all: active.length,
      draft: active.filter((p) => p.status === "draft").length,
      sent: active.filter((p) => p.status === "sent").length,
      viewed: active.filter((p) => p.status === "viewed").length,
      accepted: active.filter((p) => p.status === "accepted").length,
      rejected: active.filter((p) => p.status === "rejected").length,
      archived: proposals.filter((p) => p.isArchived).length,
    };
  }, [proposals]);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Proposals</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{counts.all} total proposals</p>
        </div>
        <button
          onClick={() => navigate("/proposals/new")}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" /> New Proposal
        </button>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {/* Toolbar */}
        <div className="px-6 py-4 border-b border-border flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search proposals..."
              className="w-full pl-9 pr-4 py-2 bg-muted border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
            />
          </div>
          <div className="flex gap-1 overflow-x-auto">
            {([
              ["all", "All", counts.all],
              ["draft", "Draft", counts.draft],
              ["sent", "Sent", counts.sent],
              ["viewed", "Viewed", counts.viewed],
              ["accepted", "Accepted", counts.accepted],
              ["rejected", "Rejected", counts.rejected],
              ["archived", "Archived", counts.archived],
            ] as const).map(([val, label, count]) => (
              <button
                key={val} onClick={() => setStatusFilter(val as typeof statusFilter)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  statusFilter === val ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {label}
                <span className={`text-[10px] rounded-full px-1.5 py-0.5 ${statusFilter === val ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
                  {count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-muted mx-auto mb-4 flex items-center justify-center">
              <FileText className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">No proposals found</h3>
            <p className="text-sm text-muted-foreground mb-5">
              {search ? `No results for "${search}"` : "Create your first proposal to get started."}
            </p>
            {!search && (
              <button
                onClick={() => navigate("/proposals/new")}
                className="bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors"
              >
                Create Proposal
              </button>
            )}
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
                {filtered.map((p) => (
                  <tr key={p.id} onClick={() => navigate(`/proposals/${p.id}`)}
                    className="border-b border-border last:border-0 hover:bg-muted/40 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-foreground">{p.clientName}</p>
                      {p.company && <p className="text-xs text-muted-foreground">{p.company}</p>}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-foreground">{p.projectName}</p>
                      <p className="text-xs text-muted-foreground">{p.projectType}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-foreground">
                        {CURRENCY_SYMBOLS[p.currency] || ""}{p.price.toLocaleString()}
                      </p>
                    </td>
                    <td className="px-6 py-4"><StatusBadge status={p.status} /></td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{formatDate(p.createdAt)}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {formatDate(p.acceptedAt || p.viewedAt || p.sentAt || p.updatedAt)}
                    </td>
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <RowMenu proposal={p} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
