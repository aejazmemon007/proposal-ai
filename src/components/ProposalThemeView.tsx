import React from "react";
import { Check, Sparkles, Clock, Calendar, ShieldCheck, Download, Code2, Award, HeartHandshake } from "lucide-react";
import { PRO_TEMPLATE_DESIGNS, CURRENCY_SYMBOLS } from "../types";
import type { Proposal, User, ProposalContent, TemplateDesignId } from "../types";

const SECTIONS = [
  { key: "introduction", label: "Executive Summary" },
  { key: "project_understanding", label: "Project Understanding & Context" },
  { key: "goals", label: "Key Objectives & Success Metrics" },
  { key: "proposed_solution", label: "Proposed Solution & Methodology" },
  { key: "scope", label: "Scope of Work" },
  { key: "deliverables", label: "Deliverables & Artifacts" },
  { key: "timeline", label: "Project Timeline & Milestones" },
  { key: "investment", label: "Investment & Pricing" },
  { key: "payment_terms", label: "Payment Terms" },
  { key: "revisions", label: "Revisions Policy" },
  { key: "exclusions", label: "Scope Exclusions" },
  { key: "assumptions", label: "Assumptions & Dependencies" },
  { key: "terms", label: "Agreement Terms" },
  { key: "next_steps", label: "Next Steps & Onboarding" },
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

interface ProposalThemeViewProps {
  proposal: Proposal;
  user?: User | null;
  templateId?: TemplateDesignId;
  hideCTA?: boolean;
  onAccept?: () => void;
  onReject?: () => void;
}

export default function ProposalThemeView({
  proposal,
  user,
  templateId = (proposal.templateId as TemplateDesignId) || "modern-minimal",
  hideCTA = false,
  onAccept,
  onReject,
}: ProposalThemeViewProps) {
  const currentTheme = PRO_TEMPLATE_DESIGNS.find((t) => t.id === templateId) || PRO_TEMPLATE_DESIGNS[0];
  const sym = CURRENCY_SYMBOLS[proposal.currency] || "₹";

  const formattedDate = new Date(proposal.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const businessTitle = user?.businessName || proposal.company || (user ? `${user.firstName} ${user.lastName}` : "Design Studio");
  const authorName = user ? `${user.firstName} ${user.lastName}` : "Project Lead";

  // Brand Logo
  const logoUrl = proposal.logoUrl || user?.logoUrl;

  // Custom Color / Gradient Overrides
  const colorMode = proposal.colorMode || user?.colorMode;
  const gradientFrom = proposal.gradientFrom || user?.gradientFrom;
  const gradientTo = proposal.gradientTo || user?.gradientTo;
  const gradientAngle = proposal.gradientAngle || user?.gradientAngle || 135;
  const primaryColor = proposal.primaryColor || user?.primaryColor;

  let customHeaderStyle: React.CSSProperties | undefined = undefined;
  if (colorMode === "gradient" && gradientFrom && gradientTo) {
    customHeaderStyle = {
      background: `linear-gradient(${gradientAngle}deg, ${gradientFrom} 0%, ${gradientTo} 100%)`,
    };
  } else if (colorMode === "solid" && primaryColor) {
    customHeaderStyle = {
      backgroundColor: primaryColor,
    };
  }

  // Template 1: Modern Minimalist
  if (templateId === "modern-minimal") {
    return (
      <div className="bg-card rounded-2xl shadow-xl overflow-hidden border border-border proposal-preview font-sans">
        {/* Cover Header */}
        <div
          style={customHeaderStyle}
          className={`${!customHeaderStyle ? "bg-slate-950" : ""} text-white px-8 lg:px-12 py-14 relative overflow-hidden transition-all`}
        >
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={businessTitle}
                  className="h-10 max-w-[180px] object-contain rounded-lg bg-white/15 backdrop-blur-md p-1.5 shadow-sm"
                />
              ) : (
                <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center font-bold text-white shadow-md">
                  {businessTitle.charAt(0)}
                </div>
              )}
              <span className="font-semibold text-sm tracking-wide text-white">{businessTitle}</span>
            </div>
            <span className="text-xs bg-white/10 text-white/90 px-3 py-1 rounded-full font-mono uppercase tracking-wider backdrop-blur-md border border-white/10">
              Proposal
            </span>
          </div>

          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-white mb-3">
            {proposal.projectName}
          </h1>
          <p className="text-slate-300 text-sm mb-8">
            Prepared specifically for <strong>{proposal.clientName}</strong> {proposal.company ? `(${proposal.company})` : ""}
          </p>

          <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/10 text-xs">
            <div>
              <p className="text-slate-300/80 uppercase tracking-wider mb-1">Date</p>
              <p className="font-semibold text-white text-sm">{formattedDate}</p>
            </div>
            <div>
              <p className="text-slate-300/80 uppercase tracking-wider mb-1">Total Investment</p>
              <p className="font-bold text-white text-sm">{sym}{proposal.price.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-slate-300/80 uppercase tracking-wider mb-1">Timeline</p>
              <p className="font-semibold text-white text-sm">{proposal.timeline || (proposal.content?.timeline?.length ? `${proposal.content.timeline.length} phases` : "4-6 weeks")}</p>
            </div>
          </div>
        </div>

        {/* Proposal Body */}
        <div className="p-8 lg:p-12 space-y-10">
          {proposal.content && SECTIONS.map(({ key, label }) => {
            if (key === "investment") return null;
            const val = (proposal.content as unknown as Record<string, unknown>)[key];
            if (!val || (Array.isArray(val) && val.length === 0)) return null;

            return (
              <section key={key} className="space-y-3">
                <h2 className="text-base font-bold text-foreground tracking-tight pb-2 border-b border-border">
                  {label}
                </h2>

                {key === "timeline" && Array.isArray(proposal.content?.timeline) ? (
                  <div className="space-y-3 pt-2">
                    {proposal.content.timeline.map((t, i) => (
                      <div key={i} className="flex gap-4 items-start p-3.5 rounded-xl bg-muted/40 border border-border">
                        <div className="w-24 shrink-0 text-xs font-bold text-primary bg-primary/10 px-2.5 py-1.5 rounded-lg text-center font-mono">
                          {t.duration}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">{t.phase}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : Array.isArray(val) ? (
                  <ul className="grid sm:grid-cols-2 gap-2.5 pt-1">
                    {(val as string[]).map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs text-muted-foreground p-2.5 rounded-lg bg-muted/30 border border-border/60">
                        <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs lg:text-sm text-muted-foreground leading-relaxed whitespace-pre-line pt-1">
                    {String(val)}
                  </p>
                )}
              </section>
            );
          })}

          {/* Investment Summary */}
          <section className="bg-muted/60 border border-border rounded-2xl p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Total Project Investment</p>
                <p className="text-3xl font-extrabold text-foreground">{sym}{proposal.price.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1 capitalize">{proposal.pricingModel} pricing model · {proposal.paymentSchedule || "50% upfront, 50% on delivery"}</p>
              </div>
              <div className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-xl text-xs font-bold border border-primary/20">
                <ShieldCheck className="w-4 h-4" /> Fixed Scope Guarantee
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  }

  // Template 2: Executive Onyx & Gold (Luxury)
  if (templateId === "executive-luxury") {
    return (
      <div className="bg-[#101014] text-[#f5f5f0] rounded-3xl shadow-2xl overflow-hidden border border-amber-500/25 proposal-preview font-serif">
        {/* Cover Header */}
        <div
          style={customHeaderStyle}
          className={`${!customHeaderStyle ? "bg-gradient-to-br from-neutral-950 via-[#181611] to-black" : ""} px-8 lg:px-14 py-16 relative border-b border-amber-500/30 transition-all`}
        >
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={businessTitle}
                  className="h-11 max-w-[190px] object-contain rounded-xl bg-black/40 backdrop-blur-md p-1.5 border border-amber-500/30 shadow-lg"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-700 flex items-center justify-center font-serif text-black font-bold shadow-lg shadow-amber-500/20">
                  <Award className="w-5 h-5 text-black" />
                </div>
              )}
              <div>
                <span className="font-serif font-bold text-base text-amber-200 uppercase tracking-widest block">{businessTitle}</span>
                <span className="text-[10px] text-amber-400/80 font-sans tracking-wider uppercase">Executive Engagement</span>
              </div>
            </div>
            <span className="text-xs border border-amber-400/40 text-amber-300 px-3.5 py-1 rounded-full font-sans tracking-widest uppercase backdrop-blur-md">
              Confidential
            </span>
          </div>

          <h1 className="text-3xl lg:text-5xl font-display text-amber-100 mb-4 leading-tight font-serif">
            {proposal.projectName}
          </h1>
          <p className="text-amber-200/80 text-sm font-sans mb-10 max-w-xl">
            A bespoke proposal prepared exclusively for <strong className="text-amber-100">{proposal.clientName}</strong> {proposal.company ? `at ${proposal.company}` : ""}.
          </p>

          <div className="grid grid-cols-3 gap-6 pt-6 border-t border-amber-500/20 text-xs font-sans">
            <div>
              <p className="text-amber-400/80 uppercase tracking-wider mb-1">Issue Date</p>
              <p className="font-semibold text-amber-100 text-sm">{formattedDate}</p>
            </div>
            <div>
              <p className="text-amber-400/80 uppercase tracking-wider mb-1">Investment Value</p>
              <p className="font-bold text-amber-300 text-sm">{sym}{proposal.price.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-amber-400/80 uppercase tracking-wider mb-1">Engagement Duration</p>
              <p className="font-semibold text-amber-100 text-sm">{proposal.timeline || "4-6 Weeks"}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 lg:p-14 space-y-12 bg-neutral-950">
          {proposal.content && SECTIONS.map(({ key, label }) => {
            if (key === "investment") return null;
            const val = (proposal.content as unknown as Record<string, unknown>)[key];
            if (!val || (Array.isArray(val) && val.length === 0)) return null;

            return (
              <section key={key} className="space-y-4">
                <div className="flex items-center gap-3 border-b border-amber-500/20 pb-3">
                  <div className="w-2 h-2 rounded-full bg-amber-400" />
                  <h2 className="text-lg font-serif font-bold text-amber-200 tracking-wide">
                    {label}
                  </h2>
                </div>

                {key === "timeline" && Array.isArray(proposal.content?.timeline) ? (
                  <div className="space-y-3 pt-1">
                    {proposal.content.timeline.map((t, i) => (
                      <div key={i} className="flex gap-4 items-start p-4 rounded-2xl bg-neutral-900 border border-amber-500/15">
                        <div className="w-28 shrink-0 text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-lg text-center font-sans border border-amber-500/20">
                          {t.duration}
                        </div>
                        <div className="font-sans">
                          <p className="text-sm font-semibold text-amber-100">{t.phase}</p>
                          <p className="text-xs text-stone-400 mt-0.5 leading-relaxed">{t.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : Array.isArray(val) ? (
                  <ul className="grid sm:grid-cols-2 gap-3 pt-1 font-sans">
                    {(val as string[]).map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs text-stone-300 p-3 rounded-xl bg-neutral-900 border border-amber-500/15">
                        <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs lg:text-sm text-stone-300 leading-relaxed font-sans whitespace-pre-line pt-1">
                    {String(val)}
                  </p>
                )}
              </section>
            );
          })}

          {/* Investment Summary */}
          <section className="bg-gradient-to-br from-neutral-900 via-neutral-900 to-[#221c10] border-2 border-amber-500/30 rounded-3xl p-8 font-sans">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <span className="text-xs font-bold text-amber-400 tracking-widest uppercase mb-1 block">Contract Valuation</span>
                <p className="text-4xl font-extrabold text-amber-200">{sym}{proposal.price.toLocaleString()}</p>
                <p className="text-xs text-stone-400 mt-2">{proposal.paymentSchedule || "50% deposit upon signature, 50% on deliverable sign-off."}</p>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl text-xs text-amber-300 max-w-xs">
                <p className="font-bold mb-1">Executive Assurance</p>
                <p className="text-stone-400 text-[11px]">All strategic deliverables are backed by dedicated sprint milestones and priority turnaround.</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  }

  // Template 3: Cyber Emerald & Tech
  if (templateId === "tech-emerald") {
    return (
      <div className="bg-slate-900 text-slate-100 rounded-2xl shadow-xl overflow-hidden border border-emerald-500/30 proposal-preview font-sans">
        {/* Cover Header */}
        <div
          style={customHeaderStyle}
          className={`${!customHeaderStyle ? "bg-gradient-to-r from-emerald-950 via-slate-950 to-teal-950" : ""} px-8 lg:px-12 py-14 relative border-b border-emerald-500/30 transition-all`}
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={businessTitle}
                  className="h-10 max-w-[180px] object-contain rounded-lg bg-slate-950/80 backdrop-blur-md p-1.5 border border-emerald-500/40"
                />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500 flex items-center justify-center font-mono font-bold text-emerald-400">
                  <Code2 className="w-4 h-4" />
                </div>
              )}
              <div>
                <span className="font-bold text-sm text-emerald-300 font-mono tracking-wide block">{businessTitle}</span>
                <span className="text-[10px] text-emerald-400/80 font-mono">SPEC_VERSION: 2.0.0</span>
              </div>
            </div>
            <span className="text-xs bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-lg font-mono font-bold">
              TECH SPEC & PROPOSAL
            </span>
          </div>

          <h1 className="text-3xl lg:text-4xl font-extrabold text-white mb-2 font-mono">
            {proposal.projectName}
          </h1>
          <p className="text-slate-300 text-sm mb-8 font-mono">
            // Client target: <span className="text-emerald-400">{proposal.clientName}</span> {proposal.company ? `(${proposal.company})` : ""}
          </p>

          <div className="grid grid-cols-3 gap-4 p-4 rounded-xl bg-slate-950/80 border border-emerald-500/20 text-xs font-mono">
            <div>
              <p className="text-slate-400 uppercase">TIMESTAMP</p>
              <p className="font-bold text-emerald-300">{formattedDate}</p>
            </div>
            <div>
              <p className="text-slate-400 uppercase">BUDGET_ESTIMATE</p>
              <p className="font-bold text-emerald-400">{sym}{proposal.price.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-slate-400 uppercase">SPRINT_TIMELINE</p>
              <p className="font-bold text-teal-300">{proposal.timeline || "4 Sprints"}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 lg:p-12 space-y-10 bg-slate-900/90">
          {proposal.content && SECTIONS.map(({ key, label }) => {
            if (key === "investment") return null;
            const val = (proposal.content as unknown as Record<string, unknown>)[key];
            if (!val || (Array.isArray(val) && val.length === 0)) return null;

            return (
              <section key={key} className="space-y-3">
                <div className="flex items-center gap-2 font-mono text-sm font-bold text-emerald-400 pb-2 border-b border-slate-800">
                  <span className="text-slate-500">//</span> {label.toUpperCase()}
                </div>

                {key === "timeline" && Array.isArray(proposal.content?.timeline) ? (
                  <div className="space-y-2.5 pt-1">
                    {proposal.content.timeline.map((t, i) => (
                      <div key={i} className="flex gap-4 items-start p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                        <div className="w-24 shrink-0 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded text-center font-mono border border-emerald-500/20">
                          {t.duration}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-200">{t.phase}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{t.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : Array.isArray(val) ? (
                  <div className="grid sm:grid-cols-2 gap-2 pt-1 font-mono text-xs">
                    {(val as string[]).map((item, i) => (
                      <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                        <span className="text-emerald-400 font-bold">›</span>
                        <span className="truncate">{item}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs lg:text-sm text-slate-300 leading-relaxed whitespace-pre-line pt-1">
                    {String(val)}
                  </p>
                )}
              </section>
            );
          })}

          {/* Investment Summary */}
          <section className="bg-slate-950 border border-emerald-500/30 rounded-2xl p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-1">TOTAL_INVESTMENT_DUE</p>
                <p className="text-3xl font-extrabold text-emerald-400 font-mono">{sym}{proposal.price.toLocaleString()}</p>
                <p className="text-xs text-slate-400 mt-1 capitalize font-mono">{proposal.pricingModel} pricing · {proposal.paymentSchedule || "Standard milestone terms"}</p>
              </div>
              <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-300 px-4 py-2.5 rounded-xl text-xs font-mono font-bold border border-emerald-500/30">
                <Check className="w-4 h-4" /> Production Ready SLA
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  }

  // Template 4: Creative Sunset Studio
  return (
    <div className="bg-[#fffdf9] text-stone-900 rounded-3xl shadow-xl overflow-hidden border border-orange-200 proposal-preview font-sans">
      {/* Cover Header */}
      <div
        style={customHeaderStyle}
        className={`${!customHeaderStyle ? "bg-gradient-to-tr from-rose-900 via-orange-800 to-amber-700" : ""} text-white px-8 lg:px-12 py-16 relative overflow-hidden transition-all`}
      >
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/20">
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={businessTitle}
                className="h-10 max-w-[180px] object-contain rounded-xl bg-white/20 backdrop-blur-md p-1.5 shadow-sm"
              />
            ) : (
              <div className="w-8 h-8 rounded-xl bg-white text-orange-700 flex items-center justify-center font-bold text-sm shadow-md">
                <Sparkles className="w-4 h-4" />
              </div>
            )}
            <span className="font-bold text-sm tracking-wide text-orange-100">{businessTitle}</span>
          </div>
          <span className="text-xs bg-white/20 text-white px-3.5 py-1 rounded-full font-bold backdrop-blur-md">
            Creative Proposal
          </span>
        </div>

        <h1 className="text-3xl lg:text-4xl font-extrabold text-white mb-3">
          {proposal.projectName}
        </h1>
        <p className="text-orange-100/90 text-sm mb-8">
          Crafted with care for <strong className="text-white">{proposal.clientName}</strong> {proposal.company ? `(${proposal.company})` : ""}
        </p>

        <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/20 text-xs">
          <div>
            <p className="text-orange-200/90 uppercase tracking-wider mb-1">Date</p>
            <p className="font-bold text-white text-sm">{formattedDate}</p>
          </div>
          <div>
            <p className="text-orange-200/90 uppercase tracking-wider mb-1">Project Budget</p>
            <p className="font-extrabold text-white text-sm">{sym}{proposal.price.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-orange-200/90 uppercase tracking-wider mb-1">Estimated Time</p>
            <p className="font-bold text-white text-sm">{proposal.timeline || "4-6 Weeks"}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-8 lg:p-12 space-y-10 bg-white">
        {proposal.content && SECTIONS.map(({ key, label }) => {
          if (key === "investment") return null;
          const val = (proposal.content as unknown as Record<string, unknown>)[key];
          if (!val || (Array.isArray(val) && val.length === 0)) return null;

          return (
            <section key={key} className="space-y-3">
              <h2 className="text-base font-bold text-stone-900 tracking-tight pb-2 border-b-2 border-orange-100 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                {label}
              </h2>

              {key === "timeline" && Array.isArray(proposal.content?.timeline) ? (
                <div className="space-y-3 pt-1">
                  {proposal.content.timeline.map((t, i) => (
                    <div key={i} className="flex gap-4 items-start p-4 rounded-2xl bg-orange-50/50 border border-orange-200/60">
                      <div className="w-24 shrink-0 text-xs font-bold text-orange-700 bg-orange-100 px-2.5 py-1.5 rounded-xl text-center">
                        {t.duration}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-stone-900">{t.phase}</p>
                        <p className="text-xs text-stone-600 mt-0.5">{t.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : Array.isArray(val) ? (
                <ul className="grid sm:grid-cols-2 gap-2.5 pt-1">
                  {(val as string[]).map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs text-stone-700 p-3 rounded-xl bg-orange-50/40 border border-orange-200/50">
                      <Check className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs lg:text-sm text-stone-700 leading-relaxed whitespace-pre-line pt-1">
                  {String(val)}
                </p>
              )}
            </section>
          );
        })}

        {/* Investment Summary */}
        <section className="bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-rose-500/10 border-2 border-orange-300 rounded-3xl p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-orange-700 uppercase tracking-wider mb-1">Total Project Investment</p>
              <p className="text-3xl font-extrabold text-stone-900">{sym}{proposal.price.toLocaleString()}</p>
              <p className="text-xs text-stone-600 mt-1 capitalize">{proposal.pricingModel} pricing · {proposal.paymentSchedule || "50% upfront deposit"}</p>
            </div>
            <div className="flex items-center gap-2 bg-orange-600 text-white px-5 py-2.5 rounded-2xl text-xs font-bold shadow-md shadow-orange-600/20">
              <HeartHandshake className="w-4 h-4" /> Collaborative Partner Guarantee
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
