import React from "react";
import {
  Check, Sparkles, Clock, Calendar, ShieldCheck, Download, Code2, Award,
  HeartHandshake, Layers, Compass, Target, Zap, CheckCircle2, FileText,
  DollarSign, CreditCard, ArrowRight, Shield, AlertCircle, Briefcase,
  UserCheck, Building2, ExternalLink, Lock, CheckCircle, TrendingUp,
  Users, CheckSquare, Boxes, FileCheck
} from "lucide-react";
import { PRO_TEMPLATE_DESIGNS, CURRENCY_SYMBOLS } from "../types";
import type { Proposal, User, ProposalContent, TemplateDesignId, TimelinePhase } from "../types";

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
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const validUntilDate = new Date(new Date(proposal.createdAt).getTime() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
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

  const content = proposal.content;
  const timelinePhases: TimelinePhase[] = Array.isArray(content?.timeline) ? content.timeline : [
    { phase: "Phase 1: Discovery & Research", duration: "Week 1", description: "Audit current ecosystem, user journey flows, and stakeholder requirements." },
    { phase: "Phase 2: Architecture & Wireframing", duration: "Week 2-3", description: "Information architecture, structural wireframes, and clickable flow validation." },
    { phase: "Phase 3: High-Fidelity UI & Systems", duration: "Week 4-5", description: "Full design system tokens, responsive mobile/desktop screens, and interactive prototype." },
    { phase: "Phase 4: Review & Dev Hand-off", duration: "Week 6", description: "Final revision polish, developer hand-off specs, and asset export delivery." },
  ];

  const goalsList: string[] = Array.isArray(content?.goals) && content.goals.length > 0 ? content.goals : [
    "Modernize visual brand identity to reflect a high-ticket, tier-1 digital product.",
    "Streamline primary user workflows to reduce onboarding friction and churn.",
    "Establish a modular, scalable design token system for fast engineering implementation."
  ];

  const deliverablesList: string[] = Array.isArray(content?.deliverables) && content.deliverables.length > 0 ? content.deliverables : (
    Array.isArray(content?.scope) && content.scope.length > 0 ? content.scope : [
      "Comprehensive UX Friction Audit & Heuristic Analysis",
      "Interactive High-Fidelity Figma UI Prototypes (Desktop & Mobile)",
      "Production-Ready Component Design System with Design Tokens",
      "User Journey Maps & Information Architecture Specifications",
      "Developer Hand-off Documentation & CSS Variable Tokens",
      "2 Iterative Revision Sprints with Stakeholder Reviews"
    ]
  );

  const exclusionsList: string[] = Array.isArray(content?.exclusions) && content.exclusions.length > 0 ? content.exclusions : [
    "Production backend database architecture or API development",
    "Third-party paid font licenses or custom photography stock fees",
    "Ongoing server hosting, domain setup, or cloud maintenance fees",
    "Major scope pivots outside the agreed deliverables post-approval"
  ];

  // -------------------------------------------------------------
  // TEMPLATE 1: MODERN MINIMALIST (Swiss Architectural Elegance)
  // -------------------------------------------------------------
  if (templateId === "modern-minimal") {
    return (
      <div id="proposal-document-container" className="bg-white rounded-[32px] shadow-2xl shadow-slate-900/10 overflow-hidden border border-slate-200/90 proposal-preview font-sans text-slate-900">
        {/* Cover Masthead Header */}
        <div
          style={customHeaderStyle}
          className={`${!customHeaderStyle ? "bg-gradient-to-r from-indigo-700 via-violet-600 to-purple-600" : ""} text-white px-8 lg:px-14 py-16 relative overflow-hidden transition-all`}
        >
          {/* Subtle architectural grid lines */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

          {/* Top Brand & Metadata Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-10 pb-5 border-b border-white/20 relative z-10">
            <div className="flex items-center gap-3.5">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={businessTitle}
                  className="h-11 max-w-[190px] object-contain rounded-xl bg-white/20 backdrop-blur-md p-1.5 shadow-sm border border-white/25"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-white text-violet-700 flex items-center justify-center font-bold text-base shadow-md">
                  {businessTitle.charAt(0)}
                </div>
              )}
              <div>
                <span className="font-bold text-base tracking-tight text-white block">{businessTitle}</span>
                <span className="text-[11px] text-white/80 font-medium">Bespoke Design & Development Engagement</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs bg-white/20 text-white font-mono px-3.5 py-1 rounded-full backdrop-blur-md border border-white/25">
                REF: #PAI-{(proposal.id || "001").slice(-6).toUpperCase()}
              </span>
              <span className="text-xs font-bold uppercase tracking-wider bg-emerald-400 text-slate-950 px-3 py-1 rounded-full shadow-xs">
                CONFIDENTIAL
              </span>
            </div>
          </div>

          {/* Project Title & Client Dedication */}
          <div className="max-w-3xl relative z-10 mb-10">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md text-white text-[11px] font-bold px-3.5 py-1 rounded-full mb-4 border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Project Scope & Strategic Agreement</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-3 leading-tight">
              {proposal.projectName}
            </h1>
            <p className="text-white/90 text-sm sm:text-base leading-relaxed">
              Prepared exclusively for <strong className="text-white font-bold">{proposal.clientName}</strong> {proposal.company ? `(${proposal.company})` : ""} by {authorName}.
            </p>
          </div>

          {/* 4 Architectural Quick Metric Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-white/20 relative z-10 text-xs">
            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15">
              <span className="text-white/70 block text-[10px] uppercase font-bold tracking-wider mb-0.5">Total Valuation</span>
              <span className="text-lg font-black text-white">{sym}{proposal.price.toLocaleString()}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15">
              <span className="text-white/70 block text-[10px] uppercase font-bold tracking-wider mb-0.5">Timeline</span>
              <span className="text-lg font-black text-white">{proposal.timeline || `${timelinePhases.length} Sprints`}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15">
              <span className="text-white/70 block text-[10px] uppercase font-bold tracking-wider mb-0.5">Payment Terms</span>
              <span className="text-sm font-bold text-white truncate block">{proposal.paymentSchedule || "50% Advance"}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15">
              <span className="text-white/70 block text-[10px] uppercase font-bold tracking-wider mb-0.5">Valid Until</span>
              <span className="text-sm font-bold text-white">{validUntilDate}</span>
            </div>
          </div>
        </div>

        {/* Proposal Document Body */}
        <div className="p-8 lg:p-14 space-y-14 bg-white">
          {/* 1. Executive Summary & Project Context */}
          <section className="space-y-4">
            <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-violet-700 bg-violet-50 w-fit px-3 py-1 rounded-full border border-violet-200">
              <FileText className="w-3.5 h-3.5" />
              <span>Section 01 · Executive Summary</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-950 tracking-tight">Project Understanding & Strategic Context</h2>
            
            <div className="rounded-2xl border-l-4 border-violet-600 bg-slate-50 p-6 shadow-2xs">
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-normal">
                {content?.project_understanding || content?.introduction || proposal.brief || "This engagement is structured to deliver an exceptional, end-to-end user experience that aligns directly with your business goals, modernizes product UI/UX, and provides an actionable design system for high-velocity development."}
              </p>
            </div>
          </section>

          {/* 2. Key Objectives & Success Metrics */}
          <section className="space-y-4">
            <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-violet-700 bg-violet-50 w-fit px-3 py-1 rounded-full border border-violet-200">
              <Target className="w-3.5 h-3.5" />
              <span>Section 02 · Core Objectives</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-950 tracking-tight">Target Goals & Success Benchmarks</h2>

            <div className="grid sm:grid-cols-3 gap-4 pt-1">
              {goalsList.map((goal, idx) => (
                <div key={idx} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 shadow-2xs flex flex-col justify-between">
                  <div className="w-8 h-8 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center font-bold text-xs mb-3">
                    0{idx + 1}
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-relaxed">{goal}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 3. Deliverables & Scope Bento */}
          <section className="space-y-4">
            <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 w-fit px-3 py-1 rounded-full border border-emerald-200">
              <Boxes className="w-3.5 h-3.5" />
              <span>Section 03 · Tangible Deliverables</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-950 tracking-tight">Scope of Work & Hand-off Artifacts</h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
              All deliverables are built directly in high-fidelity Figma components, tested against responsive breakpoints, and fully documented for developer implementation.
            </p>

            <div className="grid sm:grid-cols-2 gap-3.5 pt-2">
              {deliverablesList.map((deliv, idx) => (
                <div key={idx} className="p-4 rounded-2xl border border-slate-200/90 bg-white hover:border-violet-300 hover:shadow-xs transition-all flex items-start gap-3.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Deliverable {idx + 1}</span>
                    <p className="text-xs sm:text-sm font-semibold text-slate-900 leading-snug">{deliv}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 4. Strategic Timeline & Sprint Milestones */}
          <section className="space-y-4">
            <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-violet-700 bg-violet-50 w-fit px-3 py-1 rounded-full border border-violet-200">
              <Clock className="w-3.5 h-3.5" />
              <span>Section 04 · Execution Roadmap</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-950 tracking-tight">Project Timeline & Phased Sprints</h2>

            <div className="space-y-3 pt-2">
              {timelinePhases.map((phase, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl border border-slate-200 bg-slate-50/80">
                  <div className="flex items-start gap-4">
                    <span className="w-9 h-9 rounded-xl bg-violet-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-xs">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <h4 className="font-bold text-slate-950 text-sm">{phase.phase}</h4>
                        <span className="text-[10px] font-mono font-bold text-violet-700 bg-violet-100 px-2 py-0.5 rounded-md">
                          {phase.duration}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed max-w-xl">{phase.description}</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full shrink-0 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Sign-off Gate
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* 5. Inclusions vs Exclusions Matrix */}
          <section className="space-y-4">
            <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 w-fit px-3 py-1 rounded-full border border-amber-200">
              <Shield className="w-3.5 h-3.5" />
              <span>Section 05 · Boundaries & Guarantees</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-950 tracking-tight">Inclusions & Explicit Scope Exclusions</h2>

            <div className="grid sm:grid-cols-2 gap-4 pt-1">
              <div className="p-6 rounded-2xl border border-emerald-200 bg-emerald-50/40 space-y-3">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Guaranteed Included
                </span>
                <ul className="space-y-2 text-xs text-slate-700 font-medium">
                  <li className="flex items-center gap-2">✓ 100% Full IP transfer upon final payment</li>
                  <li className="flex items-center gap-2">✓ Modular Figma design token architecture</li>
                  <li className="flex items-center gap-2">✓ 2 comprehensive review and polish sprints</li>
                  <li className="flex items-center gap-2">✓ Direct async Slack/WhatsApp communication</li>
                </ul>
              </div>

              <div className="p-6 rounded-2xl border border-amber-200 bg-amber-50/40 space-y-3">
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-600" /> Explicitly Out of Scope
                </span>
                <ul className="space-y-2 text-xs text-slate-700">
                  {exclusionsList.slice(0, 4).map((ex, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-amber-600 font-bold">✕</span>
                      <span>{ex}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* 6. Financial Investment & Payment Tranches */}
          <section className="rounded-3xl border-2 border-violet-600/30 bg-gradient-to-br from-violet-50/60 via-slate-50 to-white p-8 lg:p-10 shadow-lg space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-200">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-violet-700 bg-violet-100 px-3 py-1 rounded-full">
                  Section 06 · Financial Terms
                </span>
                <h3 className="text-xl font-bold text-slate-950 mt-2">Total Project Valuation</h3>
                <p className="text-xs text-slate-500 mt-0.5">Fixed-price milestone contract. No surprise billable hours.</p>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-xs text-slate-500 uppercase font-semibold block">Total Fixed Fee</span>
                <span className="text-4xl lg:text-5xl font-black text-slate-950 tracking-tight">
                  {sym}{proposal.price.toLocaleString()}
                </span>
              </div>
            </div>

            {/* 3 Milestone Tranches */}
            <div className="grid sm:grid-cols-3 gap-3.5">
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                <span className="text-[10px] font-bold text-violet-700 uppercase block mb-1">Tranche 01 · 50%</span>
                <p className="text-base font-bold text-slate-900">{sym}{(proposal.price * 0.5).toLocaleString()}</p>
                <p className="text-[11px] text-slate-500 mt-1">Due upon signing to reserve sprint capacity.</p>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                <span className="text-[10px] font-bold text-violet-700 uppercase block mb-1">Tranche 02 · 25%</span>
                <p className="text-base font-bold text-slate-900">{sym}{(proposal.price * 0.25).toLocaleString()}</p>
                <p className="text-[11px] text-slate-500 mt-1">Due upon mid-project UI approval.</p>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                <span className="text-[10px] font-bold text-violet-700 uppercase block mb-1">Tranche 03 · 25%</span>
                <p className="text-base font-bold text-slate-900">{sym}{(proposal.price * 0.25).toLocaleString()}</p>
                <p className="text-[11px] text-slate-500 mt-1">Due upon final source file delivery.</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 text-xs text-slate-600">
              <span className="flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Payments accepted via UPI, Bank Wire (NEFT/RTGS), or International Stripe Card.
              </span>
              <span className="font-semibold text-slate-900">
                Payment Schedule: {proposal.paymentSchedule || "50% Upfront, 50% on Hand-off"}
              </span>
            </div>
          </section>

          {/* 7. Next Steps & Formal Sign-off Handshake */}
          <section className="space-y-6 pt-4 border-t border-slate-200">
            <div>
              <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-violet-700 bg-violet-50 w-fit px-3 py-1 rounded-full border border-violet-200 mb-2">
                <CheckSquare className="w-3.5 h-3.5" />
                <span>Section 07 · Acceptance Handshake</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-950 tracking-tight">Agreement Execution & Signatures</h2>
              <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
                By accepting this proposal, both parties agree to the deliverables, milestone schedules, and financial terms outlined above.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              {/* Creator Signature Block */}
              <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Lead Creative Partner</span>
                <div className="font-display text-2xl text-violet-800 italic border-b border-slate-200 pb-2">
                  {authorName}
                </div>
                <div className="text-xs text-slate-600 space-y-0.5">
                  <p className="font-bold text-slate-900">{businessTitle}</p>
                  <p>Date: {formattedDate}</p>
                  <p className="text-[10px] text-emerald-600 font-mono">STATUS: DIGITALLY VERIFIED</p>
                </div>
              </div>

              {/* Client Acceptance Block */}
              <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Authorized Client Signatory</span>
                <div className="font-display text-2xl text-slate-700 italic border-b border-slate-200 pb-2">
                  {proposal.clientName}
                </div>
                <div className="text-xs text-slate-600 space-y-0.5">
                  <p className="font-bold text-slate-900">{proposal.company || proposal.clientName}</p>
                  <p>Target Kick-off: Within 3 business days of deposit</p>
                  <p className="text-[10px] text-violet-600 font-mono">E-SIGN READY</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // TEMPLATE 2: EXECUTIVE ONYX & GOLD (Luxury Bespoke Advisory)
  // -------------------------------------------------------------
  if (templateId === "executive-luxury") {
    return (
      <div id="proposal-document-container" className="bg-[#0b0c10] text-[#f4f4f0] rounded-[32px] shadow-2xl overflow-hidden border border-amber-500/30 proposal-preview font-serif">
        {/* Cover Header */}
        <div
          style={customHeaderStyle}
          className={`${!customHeaderStyle ? "bg-gradient-to-br from-neutral-950 via-[#1a1712] to-[#0c0d11]" : ""} px-8 lg:px-14 py-16 relative border-b border-amber-500/30 transition-all`}
        >
          <div className="flex flex-wrap items-center justify-between gap-4 mb-10 pb-5 border-b border-amber-500/20">
            <div className="flex items-center gap-3.5">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={businessTitle}
                  className="h-11 max-w-[190px] object-contain rounded-xl bg-black/50 backdrop-blur-md p-1.5 border border-amber-500/40 shadow-lg"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 via-amber-600 to-amber-700 flex items-center justify-center font-serif text-black font-bold shadow-lg shadow-amber-500/20">
                  <Award className="w-5 h-5 text-black" />
                </div>
              )}
              <div>
                <span className="font-serif font-bold text-base text-amber-200 uppercase tracking-widest block">{businessTitle}</span>
                <span className="text-[10px] text-amber-400/80 font-sans tracking-wider uppercase">Executive Engagement</span>
              </div>
            </div>

            <div className="flex items-center gap-2 font-sans">
              <span className="text-xs border border-amber-500/40 text-amber-300 px-3.5 py-1 rounded-full tracking-widest uppercase backdrop-blur-md">
                CONFIDENTIAL
              </span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-5xl font-display text-amber-100 mb-4 leading-tight font-serif max-w-3xl">
            {proposal.projectName}
          </h1>
          <p className="text-amber-200/80 text-sm font-sans mb-10 max-w-xl">
            A bespoke proposal prepared exclusively for <strong className="text-amber-100 font-bold">{proposal.clientName}</strong> {proposal.company ? `at ${proposal.company}` : ""}.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-amber-500/25 text-xs font-sans">
            <div className="p-3.5 rounded-2xl bg-neutral-900/80 border border-amber-500/20">
              <p className="text-amber-400/80 uppercase tracking-wider mb-0.5 text-[10px]">Contract Valuation</p>
              <p className="font-bold text-amber-300 text-base">{sym}{proposal.price.toLocaleString()}</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-neutral-900/80 border border-amber-500/20">
              <p className="text-amber-400/80 uppercase tracking-wider mb-0.5 text-[10px]">Timeline</p>
              <p className="font-bold text-amber-100 text-base">{proposal.timeline || "4-6 Weeks"}</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-neutral-900/80 border border-amber-500/20">
              <p className="text-amber-400/80 uppercase tracking-wider mb-0.5 text-[10px]">Payment Schedule</p>
              <p className="font-bold text-amber-100 text-sm truncate">{proposal.paymentSchedule || "50% Advance"}</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-neutral-900/80 border border-amber-500/20">
              <p className="text-amber-400/80 uppercase tracking-wider mb-0.5 text-[10px]">Validity Period</p>
              <p className="font-bold text-amber-100 text-sm">{validUntilDate}</p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-8 lg:p-14 space-y-12 bg-[#0c0d12]">
          {/* Executive Brief */}
          <section className="space-y-3 font-sans">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400 border-b border-amber-500/40 pb-1">
              01 · Executive Brief & Strategic Focus
            </span>
            <div className="p-6 rounded-2xl bg-neutral-900/90 border border-amber-500/20">
              <p className="text-sm sm:text-base text-stone-300 leading-relaxed font-normal">
                {content?.project_understanding || content?.introduction || proposal.brief}
              </p>
            </div>
          </section>

          {/* Deliverables Bento */}
          <section className="space-y-4 font-sans">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400 border-b border-amber-500/40 pb-1">
              02 · Contracted Scope & Deliverables
            </span>
            <div className="grid sm:grid-cols-2 gap-3.5 pt-1">
              {deliverablesList.map((deliv, i) => (
                <div key={i} className="p-4 rounded-2xl bg-neutral-900/80 border border-amber-500/20 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div>
                    <span className="text-[10px] text-amber-400/60 font-mono block">ITEM 0{i + 1}</span>
                    <p className="text-xs sm:text-sm font-semibold text-amber-100 leading-snug">{deliv}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Timeline */}
          <section className="space-y-4 font-sans">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400 border-b border-amber-500/40 pb-1">
              03 · Phased Sprint Execution
            </span>
            <div className="space-y-3 pt-1">
              {timelinePhases.map((phase, i) => (
                <div key={i} className="p-4 rounded-2xl bg-neutral-900/90 border border-amber-500/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-300 font-bold text-xs flex items-center justify-center">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-amber-100">{phase.phase}</p>
                      <p className="text-xs text-stone-400">{phase.description}</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-md border border-amber-500/20">
                    {phase.duration}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Investment & Guarantee */}
          <section className="bg-gradient-to-br from-neutral-900 via-neutral-900 to-[#221c10] border-2 border-amber-500/40 rounded-3xl p-8 font-sans">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-amber-500/20">
              <div>
                <span className="text-xs font-bold text-amber-400 tracking-widest uppercase mb-1 block">Contract Valuation</span>
                <p className="text-4xl font-extrabold text-amber-200">{sym}{proposal.price.toLocaleString()}</p>
                <p className="text-xs text-stone-400 mt-1">{proposal.paymentSchedule || "50% deposit upon signature, 50% on deliverable sign-off."}</p>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl text-xs text-amber-300 max-w-xs">
                <p className="font-bold mb-1">Executive Assurance Guarantee</p>
                <p className="text-stone-400 text-[11px]">All strategic deliverables are backed by dedicated sprint milestones, 100% IP transfer, and priority turnaround.</p>
              </div>
            </div>

            <div className="pt-4 grid sm:grid-cols-2 gap-4 text-xs text-stone-300">
              <div>
                <span className="text-[10px] text-amber-400 uppercase tracking-widest block mb-1">Prepared By</span>
                <p className="font-bold text-amber-100">{authorName} · {businessTitle}</p>
              </div>
              <div>
                <span className="text-[10px] text-amber-400 uppercase tracking-widest block mb-1">Accepted By</span>
                <p className="font-bold text-amber-100">{proposal.clientName} ({proposal.company || "Client"})</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // TEMPLATE 3: CYBER EMERALD & TECH (Dev Studio & Engineering)
  // -------------------------------------------------------------
  if (templateId === "tech-emerald") {
    return (
      <div id="proposal-document-container" className="bg-[#070b14] text-slate-100 rounded-[28px] shadow-2xl overflow-hidden border border-emerald-500/30 proposal-preview font-mono">
        {/* Cover Header */}
        <div
          style={customHeaderStyle}
          className={`${!customHeaderStyle ? "bg-gradient-to-r from-emerald-950 via-[#0a1220] to-teal-950" : ""} px-8 lg:px-12 py-14 relative border-b border-emerald-500/30 transition-all`}
        >
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={businessTitle}
                  className="h-10 max-w-[180px] object-contain rounded-lg bg-slate-950/80 backdrop-blur-md p-1.5 border border-emerald-500/40"
                />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500 flex items-center justify-center font-bold text-emerald-400">
                  <Code2 className="w-4 h-4" />
                </div>
              )}
              <div>
                <span className="font-bold text-sm text-emerald-300 tracking-wide block">{businessTitle}</span>
                <span className="text-[10px] text-emerald-400/80">SPEC_VERSION: 2.4.0 · PROPOSAL</span>
              </div>
            </div>
            <span className="text-xs bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-lg font-bold">
              STATUS: READY_FOR_DEPLOYMENT
            </span>
          </div>

          <h1 className="text-3xl lg:text-4xl font-extrabold text-white mb-2">
            {proposal.projectName}
          </h1>
          <p className="text-slate-300 text-xs mb-8">
            // Client Target: <span className="text-emerald-400">{proposal.clientName}</span> {proposal.company ? `(${proposal.company})` : ""}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-950/90 border border-emerald-500/20 text-xs">
            <div>
              <p className="text-slate-400 text-[10px]">VALUATION_DUE</p>
              <p className="font-bold text-emerald-300 text-sm">{sym}{proposal.price.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-slate-400 text-[10px]">SPRINT_TIMELINE</p>
              <p className="font-bold text-teal-300 text-sm">{proposal.timeline || "4 Sprints"}</p>
            </div>
            <div>
              <p className="text-slate-400 text-[10px]">PAYMENT_MODEL</p>
              <p className="font-bold text-slate-200 text-sm truncate">{proposal.pricingModel.toUpperCase()}</p>
            </div>
            <div>
              <p className="text-slate-400 text-[10px]">EXPIRES_AT</p>
              <p className="font-bold text-slate-200 text-sm">{validUntilDate}</p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-8 lg:p-12 space-y-10 bg-[#080d19]">
          <section className="space-y-3">
            <div className="text-xs text-emerald-400 font-bold border-b border-slate-800 pb-2">
              // 01. SCOPE_SPECIFICATION & DELIVERABLES
            </div>
            <div className="grid sm:grid-cols-2 gap-3 pt-1">
              {deliverablesList.map((deliv, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs flex items-start gap-2.5">
                  <span className="text-emerald-400 font-bold">›</span>
                  <span className="text-slate-200 leading-relaxed">{deliv}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <div className="text-xs text-emerald-400 font-bold border-b border-slate-800 pb-2">
              // 02. SPRINT_ROADMAP
            </div>
            <div className="space-y-2.5 pt-1">
              {timelinePhases.map((phase, i) => (
                <div key={i} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <span className="text-emerald-400 text-xs font-bold">{phase.phase}</span>
                    <p className="text-slate-400 text-[11px] mt-0.5">{phase.description}</p>
                  </div>
                  <span className="text-xs bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2.5 py-1 rounded">
                    {phase.duration}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Investment */}
          <section className="bg-slate-950 border border-emerald-500/30 rounded-2xl p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">TOTAL_INVESTMENT_DUE</p>
                <p className="text-3xl font-extrabold text-emerald-400">{sym}{proposal.price.toLocaleString()}</p>
                <p className="text-xs text-slate-400 mt-1 capitalize">{proposal.pricingModel} pricing · {proposal.paymentSchedule || "Standard milestone terms"}</p>
              </div>
              <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-300 px-4 py-2.5 rounded-xl text-xs font-bold border border-emerald-500/30">
                <Check className="w-4 h-4" /> Production Ready SLA Included
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // TEMPLATE 4: CREATIVE SUNSET STUDIO (Brand & Agency Modern)
  // -------------------------------------------------------------
  return (
    <div id="proposal-document-container" className="bg-[#fffdf9] text-stone-900 rounded-[32px] shadow-2xl overflow-hidden border border-orange-200 proposal-preview font-sans">
      {/* Cover Header */}
      <div
        style={customHeaderStyle}
        className={`${!customHeaderStyle ? "bg-gradient-to-tr from-rose-600 via-pink-600 to-amber-500" : ""} text-white px-8 lg:px-14 py-16 relative overflow-hidden transition-all`}
      >
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-5 border-b border-white/20">
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={businessTitle}
                className="h-10 max-w-[180px] object-contain rounded-xl bg-white/20 backdrop-blur-md p-1.5 shadow-sm"
              />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-white text-orange-700 flex items-center justify-center font-bold text-sm shadow-md">
                <Sparkles className="w-4 h-4" />
              </div>
            )}
            <span className="font-bold text-base tracking-wide text-white">{businessTitle}</span>
          </div>
          <span className="text-xs bg-white/25 text-white font-bold px-3.5 py-1 rounded-full backdrop-blur-md">
            Creative Engagement Proposal
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-white mb-3 tracking-tight">
          {proposal.projectName}
        </h1>
        <p className="text-white/90 text-sm mb-8 max-w-xl">
          Crafted with care for <strong className="text-white font-bold">{proposal.clientName}</strong> {proposal.company ? `(${proposal.company})` : ""}.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-white/20 text-xs">
          <div className="bg-white/15 backdrop-blur-md p-3.5 rounded-2xl border border-white/20">
            <p className="text-white/80 uppercase tracking-wider mb-0.5 text-[10px]">Project Budget</p>
            <p className="font-extrabold text-white text-base">{sym}{proposal.price.toLocaleString()}</p>
          </div>
          <div className="bg-white/15 backdrop-blur-md p-3.5 rounded-2xl border border-white/20">
            <p className="text-white/80 uppercase tracking-wider mb-0.5 text-[10px]">Duration</p>
            <p className="font-bold text-white text-base">{proposal.timeline || "4-6 Weeks"}</p>
          </div>
          <div className="bg-white/15 backdrop-blur-md p-3.5 rounded-2xl border border-white/20">
            <p className="text-white/80 uppercase tracking-wider mb-0.5 text-[10px]">Payment Schedule</p>
            <p className="font-bold text-white text-sm truncate">{proposal.paymentSchedule || "50% Advance"}</p>
          </div>
          <div className="bg-white/15 backdrop-blur-md p-3.5 rounded-2xl border border-white/20">
            <p className="text-white/80 uppercase tracking-wider mb-0.5 text-[10px]">Valid Until</p>
            <p className="font-bold text-white text-sm">{validUntilDate}</p>
          </div>
        </div>
      </div>

      {/* Content Body */}
      <div className="p-8 lg:p-14 space-y-12 bg-white">
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-stone-900 tracking-tight pb-2 border-b-2 border-orange-100 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
            Project Objectives & Vision
          </h2>
          <p className="text-sm text-stone-700 leading-relaxed">
            {content?.project_understanding || content?.introduction || proposal.brief}
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-stone-900 tracking-tight pb-2 border-b-2 border-orange-100 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
            Creative Deliverables & Hand-off
          </h2>
          <div className="grid sm:grid-cols-2 gap-3 pt-1">
            {deliverablesList.map((deliv, i) => (
              <div key={i} className="p-4 rounded-2xl bg-orange-50/50 border border-orange-200/60 flex items-start gap-3">
                <Check className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm font-semibold text-stone-800">{deliv}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-stone-900 tracking-tight pb-2 border-b-2 border-orange-100 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
            Timeline & Creative Milestones
          </h2>
          <div className="space-y-3 pt-1">
            {timelinePhases.map((phase, i) => (
              <div key={i} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-orange-50/40 border border-orange-200/60">
                <div>
                  <p className="text-sm font-bold text-stone-900">{phase.phase}</p>
                  <p className="text-xs text-stone-600 mt-0.5">{phase.description}</p>
                </div>
                <span className="text-xs font-bold text-orange-700 bg-orange-100 px-3 py-1 rounded-xl">
                  {phase.duration}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Investment Summary */}
        <section className="bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-rose-500/10 border-2 border-orange-300 rounded-3xl p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-orange-700 uppercase tracking-wider mb-1">Total Project Investment</p>
              <p className="text-4xl font-extrabold text-stone-900">{sym}{proposal.price.toLocaleString()}</p>
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
