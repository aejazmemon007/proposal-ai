import { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { Check, X, Sparkles, Download, AlertCircle, ChevronDown } from "lucide-react";
import { useApp, decodeProposalPayload } from "../lib/store";
import { CURRENCY_SYMBOLS } from "../types";
import type { ProposalContent, TemplateDesignId } from "../types";
import ProposalThemeView from "../components/ProposalThemeView";

const SECTIONS = [
  { key: "introduction", label: "Introduction" },
  { key: "project_understanding", label: "Project Understanding" },
  { key: "goals", label: "Goals" },
  { key: "proposed_solution", label: "Proposed Solution" },
  { key: "scope", label: "Scope of Work" },
  { key: "deliverables", label: "Deliverables" },
  { key: "timeline", label: "Timeline" },
  { key: "investment", label: "Investment" },
  { key: "payment_terms", label: "Payment Terms" },
  { key: "revisions", label: "Revisions" },
  { key: "exclusions", label: "Exclusions" },
  { key: "assumptions", label: "Assumptions" },
  { key: "terms", label: "Terms" },
  { key: "next_steps", label: "Next Steps" },
];

function getSectionText(content: ProposalContent, key: string): string {
  const val = (content as unknown as Record<string, unknown>)[key];
  if (typeof val === "string") return val;
  if (Array.isArray(val)) return val.map((v) => typeof v === "string" ? v : typeof v === "object" && v ? `${(v as {phase?: string}).phase || ""}: ${(v as {duration?: string}).duration || ""} — ${(v as {description?: string}).description || ""}` : "").join("\n");
  if (key === "investment" && typeof val === "object" && val) {
    const inv = val as {total?: number; currency?: string};
    return `${CURRENCY_SYMBOLS[inv.currency || "INR"] || ""}${(inv.total || 0).toLocaleString()}`;
  }
  return "";
}

const REJECTION_REASONS = ["Budget", "Timeline", "Scope", "Not moving forward", "Other"];

export default function PublicProposal() {
  const { token } = useParams<{ token: string }>();
  const location = useLocation();
  const { proposals, updateProposal, saveProposalDirectly } = useApp();
  const [acceptOpen, setAcceptOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionNote, setRejectionNote] = useState("");
  const [actionDone, setActionDone] = useState<"accepted" | "rejected" | null>(null);

  useEffect(() => {
    try {
      let encoded = "";
      if (location.hash && location.hash.includes("d=")) {
        const match = location.hash.match(/[#&]d=([^&]+)/);
        if (match) encoded = match[1];
      } else if (location.search && location.search.includes("d=")) {
        const params = new URLSearchParams(location.search);
        encoded = params.get("d") || "";
      }

      if (encoded) {
        const decoded = decodeProposalPayload(encoded);
        if (decoded) {
          saveProposalDirectly(decoded);
        }
      }
    } catch (e) {
      console.warn("Could not parse proposal from hash payload", e);
    }
  }, [location.hash, location.search, saveProposalDirectly]);

  const proposal = proposals.find((p) => p.publicToken === token);

  useEffect(() => {
    if (proposal && proposal.status === "sent") {
      updateProposal(proposal.id, {
        status: "viewed",
        viewedAt: new Date().toISOString(),
        viewCount: (proposal.viewCount || 0) + 1,
      });
    }
  }, [proposal?.id]);

  if (!proposal) {
    return (
      <div className="min-h-screen bg-[#fafaf8] flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-[#f4f4f2] flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-[#6b6b7a]" />
          </div>
          <h1 className="text-xl font-semibold text-[#0f0f12] mb-2">Proposal not found</h1>
          <p className="text-sm text-[#6b6b7a]">This proposal may have been revoked or the link is incorrect.</p>
        </div>
      </div>
    );
  }

  if (proposal.status === "expired") {
    return (
      <div className="min-h-screen bg-[#fafaf8] flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-[#0f0f12] mb-2">This proposal has expired</h1>
          <p className="text-sm text-[#6b6b7a]">Please contact the sender for an updated proposal.</p>
        </div>
      </div>
    );
  }

  const handleAccept = () => {
    if (!agreed) return;
    updateProposal(proposal.id, { status: "accepted", acceptedAt: new Date().toISOString() });
    setActionDone("accepted");
    setAcceptOpen(false);
  };

  const handleReject = () => {
    updateProposal(proposal.id, { status: "rejected", rejectedAt: new Date().toISOString(), rejectionReason });
    setActionDone("rejected");
    setRejectOpen(false);
  };

  const sym = CURRENCY_SYMBOLS[proposal.currency] || "₹";

  if (actionDone === "accepted") {
    return (
      <div className="min-h-screen bg-[#fafaf8] flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-[#059669]/10 flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-[#059669]" />
          </div>
          <h1 className="text-2xl font-semibold text-[#0f0f12] mb-2">Proposal accepted!</h1>
          <p className="text-[#6b6b7a] mb-2">You've accepted the proposal for <strong>{proposal.projectName}</strong>.</p>
          <p className="text-sm text-[#6b6b7a]">The sender has been notified and will be in touch shortly.</p>
        </div>
      </div>
    );
  }

  if (actionDone === "rejected") {
    return (
      <div className="min-h-screen bg-[#fafaf8] flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <h1 className="text-xl font-semibold text-[#0f0f12] mb-2">Response sent</h1>
          <p className="text-[#6b6b7a]">The sender has been notified. Thank you for your time.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f0ee]">
      {/* Header bar */}
      <div className="bg-white border-b border-[#e5e5eb] px-6 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#7c3aed] flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-semibold text-[#0f0f12]">ProposalAI</span>
          <span className="text-[#e5e5eb]">·</span>
          <span className="text-sm text-[#6b6b7a]">{proposal.projectName}</span>
        </div>
        <button onClick={() => window.print()} className="hidden sm:flex items-center gap-1.5 text-sm text-[#6b6b7a] hover:text-[#0f0f12] border border-[#e5e5eb] px-3 py-1.5 rounded-lg">
          <Download className="w-4 h-4" /> Download PDF
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Render Proposal with Custom Template Theme */}
        <ProposalThemeView
          proposal={proposal}
          templateId={(proposal.templateId as TemplateDesignId) || "modern-minimal"}
        />

        {/* Accept / Reject Decision Box */}
        {!["accepted", "rejected"].includes(proposal.status) && (
          <div className="bg-card border border-border rounded-3xl p-8 text-center shadow-lg">
            <h2 className="text-xl font-bold text-foreground mb-2">Ready to move forward?</h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
              Please review the scope and pricing above. Click below to accept or submit feedback.
            </p>
            <div className="flex flex-col sm:flex-row gap-3.5 justify-center max-w-md mx-auto">
              <button
                onClick={() => setAcceptOpen(true)}
                className="flex-1 flex items-center justify-center gap-2 bg-success text-white py-3.5 px-6 rounded-2xl font-bold text-sm hover:bg-success/90 shadow-lg shadow-success/20 transition-all"
              >
                <Check className="w-4 h-4 stroke-[3]" /> Accept Proposal
              </button>
              <button
                onClick={() => setRejectOpen(true)}
                className="flex-1 flex items-center justify-center gap-2 border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted py-3.5 px-6 rounded-2xl font-semibold text-sm transition-colors"
              >
                <X className="w-4 h-4" /> Request Changes / Reject
              </button>
            </div>
          </div>
        )}

        {proposal.status === "accepted" && (
          <div className="bg-success/10 border-2 border-success/30 rounded-3xl p-6 text-center shadow-sm">
            <div className="flex items-center justify-center gap-2 text-success font-bold text-base mb-1">
              <Check className="w-5 h-5 stroke-[3]" /> Proposal Formally Accepted
            </div>
            <p className="text-xs text-muted-foreground">The project agreement has been confirmed.</p>
          </div>
        )}

        {proposal.status === "rejected" && (
          <div className="bg-muted border border-border rounded-3xl p-6 text-center">
            <p className="text-sm text-muted-foreground">This proposal was not accepted ({proposal.rejectionReason || "Declined"}).</p>
          </div>
        )}

        {/* Footer */}
        {!proposal.hideWatermark && (
          <div className="py-4 text-center text-xs text-muted-foreground">
            <span>Created & sent via <strong>ProposalAI</strong> · © 2026</span>
          </div>
        )}
      </div>

      {/* Accept modal */}
      {acceptOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-slide-up">
            <h3 className="text-lg font-semibold text-[#0f0f12] mb-1">Accept Proposal</h3>
            <p className="text-sm text-[#6b6b7a] mb-5">You're about to accept the proposal for <strong>{proposal.projectName}</strong>.</p>
            <div className="bg-[#f4f4f2] rounded-xl p-4 mb-5 space-y-2">
              <div className="flex justify-between text-sm"><span className="text-[#6b6b7a]">Project</span><span className="font-medium text-[#0f0f12]">{proposal.projectName}</span></div>
              <div className="flex justify-between text-sm"><span className="text-[#6b6b7a]">Investment</span><span className="font-semibold text-[#0f0f12]">{sym}{proposal.price.toLocaleString()}</span></div>
              <div className="flex justify-between text-sm"><span className="text-[#6b6b7a]">Payment</span><span className="text-[#0f0f12]">{proposal.paymentSchedule || "As agreed"}</span></div>
            </div>
            <label className="flex items-start gap-3 mb-6 cursor-pointer">
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5" />
              <span className="text-sm text-[#0f0f12]">I agree to the proposal terms and conditions.</span>
            </label>
            <div className="flex gap-3">
              <button onClick={handleAccept} disabled={!agreed}
                className="flex-1 bg-[#059669] text-white py-2.5 rounded-xl font-semibold hover:bg-[#047857] transition-colors disabled:opacity-50">
                Accept Proposal
              </button>
              <button onClick={() => setAcceptOpen(false)} className="flex-1 border border-[#e5e5eb] text-[#0f0f12] py-2.5 rounded-xl font-semibold hover:bg-[#f4f4f2] transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject modal */}
      {rejectOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-slide-up">
            <h3 className="text-lg font-semibold text-[#0f0f12] mb-1">Not moving forward?</h3>
            <p className="text-sm text-[#6b6b7a] mb-5">Would you like to share why? This helps the sender improve.</p>
            <div className="space-y-2 mb-4">
              {REJECTION_REASONS.map((r) => (
                <button key={r} onClick={() => setRejectionReason(r)}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm font-medium text-left transition-colors ${rejectionReason === r ? "border-[#7c3aed] bg-[#7c3aed]/8 text-[#7c3aed]" : "border-[#e5e5eb] text-[#0f0f12] hover:border-[#7c3aed]/40"}`}>
                  {r}
                </button>
              ))}
            </div>
            <textarea value={rejectionNote} onChange={(e) => setRejectionNote(e.target.value)} rows={3} placeholder="Optional note..." className="w-full bg-[#f4f4f2] border border-[#e5e5eb] rounded-xl px-3.5 py-2.5 text-sm text-[#0f0f12] resize-none focus:outline-none mb-4" />
            <div className="flex gap-3">
              <button onClick={handleReject} className="flex-1 bg-[#0f0f12] text-white py-2.5 rounded-xl font-semibold hover:opacity-90 transition-opacity">
                Send Response
              </button>
              <button onClick={() => setRejectOpen(false)} className="flex-1 border border-[#e5e5eb] text-[#0f0f12] py-2.5 rounded-xl font-semibold hover:bg-[#f4f4f2] transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
