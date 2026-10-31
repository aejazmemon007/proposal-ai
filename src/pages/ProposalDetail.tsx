import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Edit, Eye, Share2, Download, Copy, Archive, Trash, ArrowLeft, Sparkles, Check,
  ChevronRight, Send, X, ExternalLink, Globe, Clock, Palette, Lock,
} from "lucide-react";
import { useApp, generatePublicToken, encodeProposalPayload } from "../lib/store";
import { rewriteSection } from "../lib/mockAI";
import { CURRENCY_SYMBOLS, PRO_TEMPLATE_DESIGNS } from "../types";
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

const AI_ACTIONS = ["Rewrite", "Shorten", "Expand", "Make more professional", "Make more persuasive", "Simplify", "Make client-focused"];

function getSectionText(content: ProposalContent, key: string): string {
  const val = (content as unknown as Record<string, unknown>)[key];
  if (typeof val === "string") return val;
  if (Array.isArray(val)) return val.map((v) => typeof v === "string" ? `• ${v}` : typeof v === "object" && v ? `• ${(v as {phase?: string; duration?: string; description?: string}).phase || ""}: ${(v as {phase?: string; duration?: string; description?: string}).duration || ""} — ${(v as {phase?: string; duration?: string; description?: string}).description || ""}` : "").join("\n");
  if (key === "investment" && typeof val === "object" && val) {
    const inv = val as {total?: number; currency?: string; breakdown?: string};
    return `Total: ${CURRENCY_SYMBOLS[inv.currency || "INR"] || ""}${(inv.total || 0).toLocaleString()}\n${inv.breakdown || ""}`;
  }
  return "";
}

function setSectionText(content: ProposalContent, key: string, text: string): ProposalContent {
  if (key === "goals" || key === "scope" || key === "deliverables" || key === "exclusions" || key === "assumptions") {
    const lines = text.split("\n").map((l) => l.replace(/^•\s*/, "").trim()).filter(Boolean);
    return { ...content, [key]: lines };
  }
  return { ...content, [key]: text } as ProposalContent;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

interface ProposalDetailProps {
  defaultTab: "edit" | "preview";
}

export default function ProposalDetail({ defaultTab }: ProposalDetailProps) {
  const { id } = useParams<{ id: string }>();
  const { getProposal, updateProposal, deleteProposal, user } = useApp();
  const navigate = useNavigate();
  const proposal = getProposal(id || "");

  const [tab, setTab] = useState<"edit" | "preview">(defaultTab);
  const [activeSection, setActiveSection] = useState("introduction");
  const [editContent, setEditContent] = useState<ProposalContent | null>(null);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "error">("saved");
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // AI panel
  const [aiInstruction, setAiInstruction] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState("");
  const [aiPanelOpen, setAiPanelOpen] = useState(true);

  const saveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (proposal?.content) {
      setEditContent({ ...proposal.content });
    }
  }, [proposal?.id]);

  if (!proposal) {
    return (
      <div className="flex items-center justify-center min-h-full">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Proposal not found.</p>
          <button onClick={() => navigate("/proposals")} className="text-primary hover:underline text-sm">Back to proposals</button>
        </div>
      </div>
    );
  }

  const autoSave = (content: ProposalContent) => {
    setSaveStatus("saving");
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      updateProposal(proposal.id, { content });
      setSaveStatus("saved");
    }, 1200);
  };

  const handleContentChange = (key: string, text: string) => {
    if (!editContent) return;
    const updated = setSectionText(editContent, key, text);
    setEditContent(updated);
    autoSave(updated);
  };

  const handleAIAction = async (action: string) => {
    if (!editContent) return;
    const instruction = action === "Custom" ? aiInstruction : action;
    setAiLoading(true);
    setAiSuggestion("");
    try {
      const currentText = getSectionText(editContent, activeSection);
      const result = await rewriteSection(activeSection, currentText, instruction);
      setAiSuggestion(result);
    } finally {
      setAiLoading(false);
    }
  };

  const applyAISuggestion = () => {
    if (!aiSuggestion) return;
    handleContentChange(activeSection, aiSuggestion);
    setAiSuggestion("");
  };

  const handleShare = () => {
    if (!proposal.publicToken) {
      updateProposal(proposal.id, { publicToken: generatePublicToken(), status: proposal.status === "draft" ? "sent" : proposal.status, sentAt: new Date().toISOString() });
    }
    setShareOpen(true);
  };

  const encodedPayload = proposal ? encodeProposalPayload(proposal) : "";
  const shareUrl = `${window.location.origin}/p/${proposal.publicToken || "generating"}${encodedPayload ? `#d=${encodedPayload}` : ""}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportPDF = () => {
    const win = window.open(shareUrl, "_blank");
    if (win) {
      setTimeout(() => {
        try { win.print(); } catch {}
      }, 1000);
    }
  };

  const statusStyles: Record<string, string> = {
    draft: "bg-muted text-muted-foreground",
    sent: "bg-blue-500/10 text-blue-500",
    viewed: "bg-warning/10 text-warning",
    accepted: "bg-success/10 text-success",
    rejected: "bg-danger/10 text-danger",
  };

  const sym = CURRENCY_SYMBOLS[proposal.currency] || "₹";
  const hasContent = !!proposal.content;

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="border-b border-border bg-background px-4 lg:px-6 py-3 flex items-center gap-3 flex-wrap shrink-0 no-print">
        <button onClick={() => navigate("/proposals")} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-semibold text-foreground truncate">{proposal.projectName}</h1>
          <p className="text-xs text-muted-foreground">{proposal.clientName}{proposal.company ? ` · ${proposal.company}` : ""}</p>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${statusStyles[proposal.status] || ""}`}>{proposal.status}</span>

        {/* Tabs */}
        <div className="flex bg-muted rounded-lg p-0.5">
          <button onClick={() => setTab("edit")} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${tab === "edit" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>
            <Edit className="w-3.5 h-3.5" /> Edit
          </button>
          <button onClick={() => setTab("preview")} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${tab === "preview" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>
            <Eye className="w-3.5 h-3.5" /> Preview
          </button>
        </div>

        <button onClick={handleShare} className="flex items-center gap-1.5 bg-primary text-primary-foreground px-3.5 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors">
          <Share2 className="w-3.5 h-3.5" /> Share
        </button>
        <button onClick={handleExportPDF} className="flex items-center gap-1.5 border border-border px-3.5 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors">
          <Download className="w-3.5 h-3.5" /> PDF
        </button>
      </div>

      {/* Main content */}
      {!hasContent ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-sm">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-2">Proposal not yet generated</h2>
            <p className="text-sm text-muted-foreground mb-5">Complete the proposal builder to generate content with AI.</p>
            <button onClick={() => navigate("/proposals/new")} className="bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors">
              Create New Proposal
            </button>
          </div>
        </div>
      ) : tab === "edit" ? (
        <div className="flex-1 flex min-h-0">
          {/* Left: section nav */}
          <aside className="hidden lg:flex flex-col w-52 border-r border-border bg-sidebar shrink-0 overflow-y-auto">
            <div className="p-3">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide px-2 mb-2">Sections</p>
              {SECTIONS.map(({ key, label }) => (
                <button key={key} onClick={() => setActiveSection(key)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors text-left ${activeSection === key ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}>
                  <ChevronRight className={`w-3 h-3 shrink-0 transition-transform ${activeSection === key ? "text-primary rotate-90" : ""}`} />
                  {label}
                </button>
              ))}
            </div>
          </aside>

          {/* Center: editor */}
          <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
            <div className="p-6 max-w-2xl mx-auto w-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-foreground">
                  {SECTIONS.find((s) => s.key === activeSection)?.label}
                </h2>
                <span className={`text-xs font-medium ${saveStatus === "saved" ? "text-success" : saveStatus === "saving" ? "text-muted-foreground" : "text-danger"}`}>
                  {saveStatus === "saved" ? "Saved" : saveStatus === "saving" ? "Saving..." : "Couldn't save"}
                </span>
              </div>

              {editContent && (
                <textarea
                  key={activeSection}
                  value={getSectionText(editContent, activeSection)}
                  onChange={(e) => handleContentChange(activeSection, e.target.value)}
                  rows={12}
                  className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm text-foreground leading-relaxed focus:outline-none focus:ring-2 focus:ring-ring/40 resize-none transition-colors"
                  placeholder="This section is empty..."
                />
              )}

              {/* Section navigation */}
              <div className="flex items-center justify-between mt-4">
                <button
                  onClick={() => {
                    const i = SECTIONS.findIndex((s) => s.key === activeSection);
                    if (i > 0) setActiveSection(SECTIONS[i - 1].key);
                  }}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {SECTIONS[SECTIONS.findIndex((s) => s.key === activeSection) - 1]?.label || ""}
                </button>
                <button
                  onClick={() => {
                    const i = SECTIONS.findIndex((s) => s.key === activeSection);
                    if (i < SECTIONS.length - 1) setActiveSection(SECTIONS[i + 1].key);
                  }}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                >
                  {SECTIONS[SECTIONS.findIndex((s) => s.key === activeSection) + 1]?.label || ""}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Right: AI assistant */}
          {aiPanelOpen && (
            <aside className="hidden xl:flex flex-col w-64 border-l border-border bg-sidebar shrink-0">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">AI Assistant</span>
                </div>
                <button onClick={() => setAiPanelOpen(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <p className="text-xs text-muted-foreground mb-3">Editing: <span className="font-medium text-foreground">{SECTIONS.find((s) => s.key === activeSection)?.label}</span></p>
                <div className="space-y-1.5 mb-4">
                  {AI_ACTIONS.map((action) => (
                    <button key={action} onClick={() => handleAIAction(action)} disabled={aiLoading}
                      className="w-full text-left px-3 py-2 rounded-lg text-sm text-foreground hover:bg-muted transition-colors border border-transparent hover:border-border">
                      {action}
                    </button>
                  ))}
                </div>
                <div className="border-t border-border pt-4">
                  <label className="block text-xs font-medium text-muted-foreground mb-2">Custom instruction</label>
                  <textarea value={aiInstruction} onChange={(e) => setAiInstruction(e.target.value)} rows={3} placeholder="e.g. Make it more specific about deliverables..." className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-xs text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring/40" />
                  <button onClick={() => handleAIAction(aiInstruction)} disabled={!aiInstruction || aiLoading}
                    className="w-full mt-2 bg-primary text-primary-foreground py-2 rounded-lg text-xs font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50">
                    {aiLoading ? "Generating..." : "Apply"}
                  </button>
                </div>

                {aiSuggestion && (
                  <div className="mt-4 bg-primary/5 border border-primary/20 rounded-xl p-3 animate-slide-up">
                    <p className="text-xs font-semibold text-muted-foreground mb-2">AI suggestion</p>
                    <p className="text-xs text-foreground leading-relaxed mb-3">{aiSuggestion.slice(0, 300)}{aiSuggestion.length > 300 ? "..." : ""}</p>
                    <div className="flex gap-2">
                      <button onClick={applyAISuggestion} className="flex-1 bg-primary text-primary-foreground py-1.5 rounded-lg text-xs font-semibold">Apply</button>
                      <button onClick={() => setAiSuggestion("")} className="flex-1 border border-border py-1.5 rounded-lg text-xs font-medium text-muted-foreground">Dismiss</button>
                    </div>
                  </div>
                )}
              </div>
            </aside>
          )}
        </div>
      ) : (
        /* Preview mode */
        <div className="flex-1 overflow-y-auto bg-muted/40 p-4 lg:p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Template Selector Ribbon */}
            <div className="bg-card border border-border rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm no-print">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold text-foreground">Template Design:</span>
                <span className="text-xs text-muted-foreground">Select a visual theme</span>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                {PRO_TEMPLATE_DESIGNS.map((t) => {
                  const isSelected = (proposal.templateId || "modern-minimal") === t.id;
                  const isProUser = user?.subscription === "pro" || user?.subscription === "studio";
                  const isLocked = t.isPro && !isProUser;

                  return (
                    <button
                      key={t.id}
                      onClick={() => {
                        if (isLocked) {
                          navigate("/checkout?plan=pro");
                        } else {
                          updateProposal(proposal.id, { templateId: t.id });
                        }
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                        isSelected
                          ? "border-primary bg-primary/10 text-primary shadow-sm"
                          : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.accentColor }} />
                      {t.name}
                      {t.isPro && (
                        <span className="text-[9px] bg-amber-400 text-black px-1.5 py-0.2 rounded-full font-bold ml-1">
                          {isLocked ? <Lock className="w-2 h-2 inline mr-0.5" /> : null}PRO
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dynamic Template View */}
            <ProposalThemeView
              proposal={proposal}
              user={user}
              templateId={(proposal.templateId as TemplateDesignId) || "modern-minimal"}
            />
          </div>
        </div>
      )}

      {/* Share modal */}
      {shareOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md animate-slide-up">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-foreground">Share Proposal</h3>
              <button onClick={() => setShareOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex gap-2 mb-4">
              <input readOnly value={shareUrl} className="flex-1 bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground truncate" />
              <button onClick={handleCopyLink} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${copied ? "bg-success/10 text-success border border-success/20" : "bg-primary text-primary-foreground hover:bg-primary/90"}`}>
                {copied ? <><Check className="w-4 h-4" /> Copied</> : <><Copy className="w-4 h-4" /> Copy</>}
              </button>
            </div>
            <a href={shareUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
              <ExternalLink className="w-4 h-4" /> Open public link
            </a>
            <div className="mt-5 pt-4 border-t border-border">
              <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
                <Globe className="w-4 h-4" />
                Clients can view and accept without signing up
              </div>
              {proposal.viewCount && proposal.viewCount > 0 ? (
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  Viewed {proposal.viewCount} time{proposal.viewCount !== 1 ? "s" : ""}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
