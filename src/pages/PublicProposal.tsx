import { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { Check, X, Sparkles, Download, AlertCircle, ChevronDown, ShieldCheck, Lock, ExternalLink, Calendar, CheckCircle2, Loader2, Smartphone, QrCode } from "lucide-react";
import { useApp, decodeProposalPayload } from "../lib/store";
import { CURRENCY_SYMBOLS } from "../types";
import type { ProposalContent, TemplateDesignId } from "../types";
import ProposalThemeView from "../components/ProposalThemeView";
import { downloadElementAsPDF } from "../lib/pdfExport";

const REJECTION_REASONS = [
  "Budget constraints or pricing adjustment needed",
  "Timeline or sprint delivery schedule mismatch",
  "Scope revision required for specific deliverables",
  "Postponing project kick-off to later date",
  "Other considerations"
];

export default function PublicProposal() {
  const { token } = useParams<{ token: string }>();
  const location = useLocation();
  const { proposals, updateProposal, saveProposalDirectly } = useApp();
  const [acceptOpen, setAcceptOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [signerName, setSignerName] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionNote, setRejectionNote] = useState("");
  const [actionDone, setActionDone] = useState<"accepted" | "rejected" | null>(null);
  const [downloadingPDF, setDownloadingPDF] = useState(false);

  const handleDownloadPDF = async () => {
    if (!proposal) return;
    const element = document.getElementById("proposal-document-container");
    await downloadElementAsPDF(
      element,
      proposal.projectName || "Proposal",
      setDownloadingPDF
    );
  };

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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
        <div className="text-center max-w-sm bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-slate-500" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">Proposal not found</h1>
          <p className="text-sm text-slate-500">This proposal link may have been revoked or is no longer valid.</p>
        </div>
      </div>
    );
  }

  if (proposal.status === "expired") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
        <div className="text-center max-w-sm bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
          <h1 className="text-xl font-bold text-slate-900 mb-2">This proposal has expired</h1>
          <p className="text-sm text-slate-500">Please reach out to the sender for an updated schedule and fee estimate.</p>
        </div>
      </div>
    );
  }

  const handleAccept = () => {
    if (!agreed) return;
    updateProposal(proposal.id, {
      status: "accepted",
      acceptedAt: new Date().toISOString(),
      clientName: signerName.trim() || proposal.clientName,
    });
    setActionDone("accepted");
    setAcceptOpen(false);
  };

  const handleReject = () => {
    updateProposal(proposal.id, {
      status: "rejected",
      rejectedAt: new Date().toISOString(),
      rejectionReason: `${rejectionReason}${rejectionNote ? ` - ${rejectionNote}` : ""}`,
    });
    setActionDone("rejected");
    setRejectOpen(false);
  };

  const sym = CURRENCY_SYMBOLS[proposal.currency] || "₹";

  if (actionDone === "accepted") {
    const depositAmount = Math.round(proposal.price * 0.5);

    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
        <div className="text-center max-w-md w-full bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-2xl space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto text-emerald-600 shadow-md">
            <Check className="w-8 h-8 stroke-[3]" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Agreement Executed
          </span>
          <h1 className="text-2xl font-bold text-slate-950">Proposal Formally Accepted!</h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Thank you, <strong>{signerName || proposal.clientName}</strong>. You've accepted the project agreement for <strong>{proposal.projectName}</strong>.
          </p>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-left space-y-1.5">
            <div className="flex justify-between"><span className="text-slate-500">Total Investment:</span><strong className="text-slate-900">{sym}{proposal.price.toLocaleString()}</strong></div>
            <div className="flex justify-between"><span className="text-slate-500">Initial Deposit (50%):</span><strong className="text-emerald-700">{sym}{depositAmount.toLocaleString()}</strong></div>
            <div className="flex justify-between"><span className="text-slate-500">Confirmation Hash:</span><span className="font-mono text-slate-400">#SIG-{(Date.now()).toString(36).toUpperCase()}</span></div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left space-y-1.5">
            <p className="text-xs font-semibold text-slate-800">Next Steps</p>
            <p className="text-xs text-slate-600 leading-relaxed">
              The project lead has received your formal acceptance. They will contact you shortly to coordinate kick-off and delivery.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={handleDownloadPDF}
              disabled={downloadingPDF}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-violet-600" />
              <span>{downloadingPDF ? "Generating PDF..." : "Download Signed Proposal PDF"}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (actionDone === "rejected") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
        <div className="text-center max-w-sm bg-white p-8 rounded-3xl border border-slate-200 shadow-xl space-y-3">
          <h1 className="text-xl font-bold text-slate-900">Feedback Submitted</h1>
          <p className="text-sm text-slate-500">The lead partner has been notified of your comments. Thank you for your review.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 pb-24">
      {/* Client Portal Header Bar */}
      <header className="bg-white/95 backdrop-blur-xl border-b border-slate-200/90 px-6 py-3.5 sticky top-0 z-30 shadow-xs">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-violet-600 flex items-center justify-center shadow-md shadow-violet-600/20">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block leading-tight">{proposal.projectName}</span>
              <span className="text-[11px] text-slate-500 font-medium">Bespoke Client Review Portal</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadPDF}
              disabled={downloadingPDF}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-950 bg-white hover:bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl transition-all shadow-2xs disabled:opacity-60 cursor-pointer"
            >
              {downloadingPDF ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 text-violet-600 animate-spin" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-violet-600" />
                  <span>Download PDF</span>
                </>
              )}
            </button>

            {!["accepted", "rejected"].includes(proposal.status) && (
              <button
                onClick={() => setAcceptOpen(true)}
                className="inline-flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold px-4.5 py-2 rounded-xl shadow-md shadow-emerald-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" /> Accept Proposal
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Document Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        {/* Render Proposal with the Theme */}
        <ProposalThemeView
          proposal={proposal}
          templateId={(proposal.templateId as TemplateDesignId) || "modern-minimal"}
        />

        {/* Action Decision Dock */}
        {!["accepted", "rejected"].includes(proposal.status) && (
          <div className="bg-white border border-slate-200/90 rounded-[28px] p-8 text-center shadow-xl space-y-4">
            <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3.5 py-1 rounded-full text-xs font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Ready for Formal Sign-off</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-950">Ready to kick off this engagement?</h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
              Accepting this proposal locks in the timeline, deliverable milestones, and secures capacity for your target start date.
            </p>

            <div className="flex flex-col sm:flex-row gap-3.5 justify-center max-w-md mx-auto pt-2">
              <button
                onClick={() => setAcceptOpen(true)}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3.5 px-6 rounded-2xl font-bold text-sm hover:from-emerald-700 hover:to-teal-700 shadow-xl shadow-emerald-600/20 hover:scale-[1.02] transition-all cursor-pointer"
              >
                <Check className="w-4 h-4 stroke-[3]" /> Accept & Sign Online
              </button>
              <button
                onClick={() => setRejectOpen(true)}
                className="flex-1 flex items-center justify-center gap-2 border border-slate-200 bg-white text-slate-600 hover:text-slate-950 hover:bg-slate-50 py-3.5 px-6 rounded-2xl font-semibold text-sm transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" /> Request Adjustments
              </button>
            </div>

            <div className="pt-2">
              <button
                onClick={handleDownloadPDF}
                disabled={downloadingPDF}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-violet-700 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{downloadingPDF ? "Generating PDF..." : "Download Official Proposal PDF"}</span>
              </button>
            </div>
          </div>
        )}

        {proposal.status === "accepted" && (
          <div className="bg-emerald-50 border-2 border-emerald-300 rounded-[28px] p-6 text-center shadow-sm">
            <div className="flex items-center justify-center gap-2 text-emerald-800 font-bold text-base mb-1">
              <Check className="w-5 h-5 stroke-[3]" /> Proposal Formally Executed
            </div>
            <p className="text-xs text-slate-600">The agreement has been officially accepted online.</p>
          </div>
        )}

        {proposal.status === "rejected" && (
          <div className="bg-slate-50 border border-slate-200 rounded-[28px] p-6 text-center">
            <p className="text-sm text-slate-600">This proposal was declined ({proposal.rejectionReason || "Feedback provided"}).</p>
          </div>
        )}

        {/* Footer */}
        {!proposal.hideWatermark && (
          <div className="py-4 text-center text-xs text-slate-400">
            <span>Powered by <strong>ProposalAI</strong> · High-Ticket Proposal Platform · © 2026</span>
          </div>
        )}
      </main>

      {/* Accept Modal with E-Signature */}
      {acceptOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] p-7 w-full max-w-lg shadow-2xl border border-slate-200 animate-slide-up space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-950">Execute Project Agreement</h3>
                <p className="text-xs text-slate-500">Sign to confirm the scope, deliverables, and fees.</p>
              </div>
              <button onClick={() => setAcceptOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 space-y-2 text-xs border border-slate-200/80">
              <div className="flex justify-between"><span className="text-slate-500">Project:</span><span className="font-bold text-slate-900">{proposal.projectName}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Total Fixed Fee:</span><span className="font-extrabold text-slate-950">{sym}{proposal.price.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Kick-off Deposit (50%):</span><span className="font-bold text-emerald-700">{sym}{(proposal.price * 0.5).toLocaleString()}</span></div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1.5">
                Type Your Full Legal Name to E-Sign:
              </label>
              <input
                type="text"
                placeholder={proposal.clientName || "e.g. Sarah Jenkins"}
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 transition-all font-display italic"
              />
            </div>

            <label className="flex items-start gap-3 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
              />
              <span className="text-xs text-slate-600 leading-relaxed">
                I am authorized to accept this proposal on behalf of <strong>{proposal.company || proposal.clientName}</strong> and agree to the payment schedule and terms outlined.
              </span>
            </label>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleAccept}
                disabled={!agreed}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-xl font-bold text-xs hover:from-emerald-700 hover:to-teal-700 shadow-md shadow-emerald-600/20 transition-all disabled:opacity-40"
              >
                Confirm & Sign Proposal
              </button>
              <button
                onClick={() => setAcceptOpen(false)}
                className="px-5 py-3 border border-slate-200 text-slate-700 rounded-xl font-semibold text-xs hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] p-7 w-full max-w-lg shadow-2xl border border-slate-200 animate-slide-up space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-950">Request Changes / Adjustments</h3>
                <p className="text-xs text-slate-500">Let the lead partner know what needs adjusting.</p>
              </div>
              <button onClick={() => setRejectOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              {REJECTION_REASONS.map((r) => (
                <button
                  key={r}
                  onClick={() => setRejectionReason(r)}
                  className={`w-full px-4 py-2.5 rounded-xl border text-xs font-semibold text-left transition-all ${
                    rejectionReason === r
                      ? "border-violet-600 bg-violet-50 text-violet-700 shadow-2xs"
                      : "border-slate-200 text-slate-700 hover:border-slate-300"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            <textarea
              value={rejectionNote}
              onChange={(e) => setRejectionNote(e.target.value)}
              rows={3}
              placeholder="Provide specific details or feedback..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 transition-all resize-none"
            />

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleReject}
                className="flex-1 bg-slate-950 text-white py-3 rounded-xl font-bold text-xs hover:bg-slate-800 transition-colors"
              >
                Send Feedback to Partner
              </button>
              <button
                onClick={() => setRejectOpen(false)}
                className="px-5 py-3 border border-slate-200 text-slate-700 rounded-xl font-semibold text-xs hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
