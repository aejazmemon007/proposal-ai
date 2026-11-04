import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { LogoSymbol } from "../components/Logo";
import {
  ArrowRight, Sparkles, Check, ChevronDown, Menu, X, FileText, Zap, Clock,
  TrendingUp, Shield, Globe, Star, Palette, Sliders, Layers, Eye, Award,
  CheckCircle2, Send, ExternalLink, Lock, CheckCircle, Flame, Share2,
  ArrowUpRight, DollarSign, Users, RefreshCw, Copy, Smartphone, Laptop,
  MousePointerClick, BadgeCheck
} from "lucide-react";

const PRO_TEMPLATE_PREVIEWS = [
  {
    id: "modern-minimal",
    name: "Modern Minimalist",
    badge: "Clean & Architectural",
    category: "High-Ticket Freelance",
    gradient: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
    headerBg: "bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600",
    accent: "#6366f1",
    tagline: "Content-first layout with high-contrast typography, monospace metric pills, and clean grid hierarchy.",
  },
  {
    id: "executive-luxury",
    name: "Executive Gold & Amber",
    badge: "Bespoke Consulting",
    category: "Luxury Advisory",
    gradient: "linear-gradient(135deg, #92400e 0%, #b45309 50%, #d97706 100%)",
    headerBg: "bg-gradient-to-r from-amber-700 via-amber-600 to-orange-600",
    accent: "#d97706",
    tagline: "Executive warm gold aesthetic with refined borders, serif headers, and executive assurance guarantees.",
  },
  {
    id: "tech-emerald",
    name: "Cyber Emerald & Tech",
    badge: "Engineering & SaaS",
    category: "Product Studio",
    gradient: "linear-gradient(135deg, #065f46 0%, #059669 50%, #0d9488 100%)",
    headerBg: "bg-gradient-to-r from-emerald-700 via-teal-600 to-cyan-600",
    accent: "#10b981",
    tagline: "Terminal monospace spec layout engineered for technical architects, development studios, and SaaS agencies.",
  },
  {
    id: "creative-sunset",
    name: "Creative Sunset Studio",
    badge: "Design & Brand",
    category: "Creative Agencies",
    gradient: "linear-gradient(135deg, #e11d48 0%, #db2777 50%, #ea580c 100%)",
    headerBg: "bg-gradient-to-r from-rose-600 via-pink-600 to-orange-500",
    accent: "#f43f5e",
    tagline: "Warm luminous multi-stop gradients, spacious cards, and partner badges built for creative directors.",
  },
];

const FAQS = [
  {
    q: "How does ProposalAI generate proposals so quickly?",
    a: "You paste any raw client message, email thread, WhatsApp brief, or Upwork job description. Our specialized AI extracts the project goals, scopes out core deliverables, structures milestones, calculates realistic pricing ranges, and drafts a complete persuasive proposal in under 60 seconds."
  },
  {
    q: "Can I upload my own company logo and brand colors?",
    a: "Yes! On the Pro plan (only ₹49/month) and Studio plan, you get full access to the Visual Studio to upload your custom SVG, transparent PNG, or JPG logo, pick custom solid colors, or craft multi-stop gradients with 360° angle sliders."
  },
  {
    q: "Can I remove all ProposalAI watermarks?",
    a: "Absolutely. With 1-click White-Label mode on Pro and Studio, you completely eliminate 'Created with ProposalAI' from client preview links and PDF exports. Your clients only see your brand."
  },
  {
    q: "How do clients view and accept proposals?",
    a: "Each proposal generates a private, secure shareable link. Clients can open it on their phone, tablet, or desktop, review your interactive scope and payment milestones, and accept directly online without needing an account."
  },
  {
    q: "Can I edit everything the AI writes?",
    a: "Yes, 100%. The visual editor lets you edit, add, or delete any milestone, scope item, exclusion, or term. You can also use inline AI tools to rewrite, shorten, or change the tone with one click."
  },
  {
    q: "What payment methods are supported for Pro upgrade?",
    a: "We support all major payment methods including UPI (Google Pay, PhonePe, Paytm, CRED), Credit/Debit Cards (Visa, Mastercard, RuPay, Amex), and Net Banking across all major Indian and international banks."
  },
];

const TESTIMONIALS = [
  {
    quote: "I used to spend 3 to 4 hours per proposal on Notion or Google Docs. With ProposalAI, I sent an executive proposal 10 minutes after a discovery call. The client signed and paid the deposit the same afternoon.",
    name: "Aakash Varma",
    role: "Senior Product Designer",
    metric: "₹4.8L Closed",
    avatar: "AV",
    rating: 5,
  },
  {
    quote: "The scope analyzer is brilliant. It automatically flags exclusions like 'out of scope revisions' and 'hosting costs' that used to bite me later. My proposals look 10x more polished than any other freelancer.",
    name: "Pooja Hegde",
    role: "Full-Stack Dev Studio",
    metric: "88% Win Rate",
    avatar: "PH",
    rating: 5,
  },
  {
    quote: "Clients constantly comment on how beautiful and clear my proposals are. The custom gradient header with my logo makes my studio look like an established 10-person agency.",
    name: "Devendra Patel",
    role: "Brand Identity Strategist",
    metric: "3x Rates Billed",
    avatar: "DP",
    rating: 5,
  },
];

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 pt-3 sm:pt-4 transition-all duration-300">
      <div className={`max-w-6xl mx-auto rounded-full transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-md shadow-slate-900/5 px-5 py-2.5"
          : "bg-white/80 backdrop-blur-md border border-slate-200/60 shadow-xs px-5 py-3"
      } flex items-center justify-between`}>
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-md shadow-violet-500/25 group-hover:scale-105 transition-transform">
            <LogoSymbol className="w-4.5 h-4.5" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 text-base tracking-tight">ProposalAI</span>
            <span className="text-[10px] font-extrabold uppercase tracking-wider bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full border border-violet-200">
              2.0
            </span>
          </div>
        </Link>

        {/* Center Nav items */}
        <div className="hidden md:flex items-center gap-1 text-xs font-semibold text-slate-600">
          <a href="#demo" className="px-3.5 py-1.5 rounded-full hover:text-slate-950 hover:bg-slate-100 transition-all">
            Live Studio
          </a>
          <a href="#superpowers" className="px-3.5 py-1.5 rounded-full hover:text-slate-950 hover:bg-slate-100 transition-all">
            Superpowers
          </a>
          <a href="#themes" className="px-3.5 py-1.5 rounded-full hover:text-slate-950 hover:bg-slate-100 transition-all">
            Themes
          </a>
          <a href="#comparison" className="px-3.5 py-1.5 rounded-full hover:text-slate-950 hover:bg-slate-100 transition-all">
            Why Web Wins
          </a>
          <a href="#pricing" className="px-3.5 py-1.5 rounded-full hover:text-slate-950 hover:bg-slate-100 transition-all">
            Pricing
          </a>
          <a href="#faq" className="px-3.5 py-1.5 rounded-full hover:text-slate-950 hover:bg-slate-100 transition-all">
            FAQ
          </a>
        </div>

        {/* Right Action CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/login"
            className="text-xs font-semibold text-slate-700 hover:text-slate-950 px-3 py-1.5 rounded-full transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/signup"
            className="group relative inline-flex items-center gap-1.5 bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 text-white text-xs font-bold px-4.5 py-2 rounded-full shadow-md shadow-violet-600/25 hover:shadow-lg hover:shadow-violet-600/35 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <span>Start Free</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-1.5 rounded-xl text-slate-800 hover:bg-slate-100"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden max-w-6xl mx-auto mt-2 bg-white/95 backdrop-blur-2xl border border-slate-200 rounded-2xl px-6 py-5 space-y-3 shadow-xl">
          {["#demo", "#superpowers", "#themes", "#comparison", "#pricing", "#faq"].map((href, idx) => (
            <a
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className="block text-sm font-semibold text-slate-700 hover:text-slate-950 py-1.5"
            >
              {["Live Studio", "Superpowers", "Themes", "Why Web Wins", "Pricing", "FAQ"][idx]}
            </a>
          ))}
          <div className="pt-3 border-t border-slate-200 flex flex-col gap-2">
            <Link to="/login" className="text-center py-2.5 text-xs font-bold border border-slate-200 rounded-xl text-slate-800 hover:bg-slate-50">
              Sign In
            </Link>
            <Link to="/signup" className="text-center py-2.5 text-xs font-bold bg-violet-600 text-white rounded-xl shadow-md">
              Create Proposal Free
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

function InteractiveStudioPreview() {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [activeTemplate, setActiveTemplate] = useState<string>("modern-minimal");
  const [accepted, setAccepted] = useState<boolean>(false);

  const currentTheme = PRO_TEMPLATE_PREVIEWS.find((t) => t.id === activeTemplate) || PRO_TEMPLATE_PREVIEWS[0];

  return (
    <div id="demo" className="relative w-full max-w-4xl mx-auto mt-10">
      {/* Ambient diffuse back-glow (soft light tones) */}
      <div className="absolute -inset-2 bg-gradient-to-r from-violet-400/25 via-indigo-300/20 to-pink-300/25 rounded-[36px] blur-2xl opacity-70 pointer-events-none" />

      {/* Container Card */}
      <div className="relative rounded-[28px] border border-slate-200/90 bg-white shadow-2xl shadow-slate-900/10 overflow-hidden">
        {/* App Titlebar Chrome */}
        <div className="px-5 py-3.5 bg-slate-50/90 border-b border-slate-200/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#ff5f56] inline-block shadow-2xs" />
              <span className="w-3 h-3 rounded-full bg-[#ffbd2e] inline-block shadow-2xs" />
              <span className="w-3 h-3 rounded-full bg-[#27c93f] inline-block shadow-2xs" />
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500 ml-2 bg-white border border-slate-200 px-2.5 py-0.5 rounded-full shadow-2xs">
              <Lock className="w-3 h-3 text-emerald-600" />
              <span>proposal-ai.studio/cloudflow-redesign</span>
            </div>
          </div>

          {/* Stepper Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            {[
              { id: 0, label: "1. Brief" },
              { id: 1, label: "2. Scope" },
              { id: 2, label: "3. Document" },
              { id: 3, label: "4. Themes" },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`px-3 py-1 rounded-lg transition-all ${
                  activeTab === t.id
                    ? "bg-violet-600 text-white shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Interactive Studio
          </div>
        </div>

        {/* Tab Content Display Area */}
        <div className="p-6 sm:p-8 min-h-[380px] flex flex-col justify-between bg-white">
          {/* TAB 0: Raw Client Brief */}
          {activeTab === 0 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-violet-700 bg-violet-100 px-2.5 py-0.5 rounded-full">
                    Step 1 · Ingestion
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">Paste Any Raw Client Message</h3>
                </div>
                <span className="text-xs text-slate-500 hidden sm:inline">
                  WhatsApp, Upwork, Gmail, or voice note transcript
                </span>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 font-mono text-xs leading-relaxed text-slate-800 relative">
                <div className="absolute top-3 right-3 text-[10px] font-semibold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded shadow-2xs">
                  Incoming Message
                </div>
                <p className="text-slate-500 text-[11px] mb-2 font-sans font-medium">
                  Client: <strong className="text-slate-900">Sarah Jenkins (Founder, CloudFlow AI)</strong>
                </p>
                "Hey! We urgently need a complete redesign of our AI analytics SaaS web application. Our current 18 screens are confusing users and hurting retention. We need intuitive navigation, responsive mobile screens, and a tight component design system for our devs. Budget is approx ₹50k–₹70k and we want to wrap in 5–6 weeks. Can you send over a proposal with deliverables and pricing?"
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>AI extracts deliverables, timeline constraints & flags out-of-scope risks.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab(1)}
                  className="w-full sm:w-auto bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Extract Scope & Milestones ➔
                </button>
              </div>
            </div>
          )}

          {/* TAB 1: AI Scope & Milestones */}
          {activeTab === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                    Step 2 · AI Analysis
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">Extracted Scope, Milestones & Smart Pricing</h3>
                </div>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-md">
                  Confidence: 98%
                </span>
              </div>

              <div className="grid sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50">
                  <span className="text-[10px] text-slate-500 font-semibold block uppercase">Project Scope</span>
                  <p className="font-bold text-sm text-slate-900 mt-0.5">SaaS Redesign</p>
                  <p className="text-[11px] text-slate-600 mt-1">18 High-Fidelity Screens + Mobile Variants</p>
                </div>
                <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50">
                  <span className="text-[10px] text-slate-500 font-semibold block uppercase">Timeline Sprints</span>
                  <p className="font-bold text-sm text-slate-900 mt-0.5">5 Weeks Total</p>
                  <p className="text-[11px] text-slate-600 mt-1">Audit ➔ Wireframes ➔ UI ➔ Prototype</p>
                </div>
                <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50">
                  <span className="text-[10px] text-slate-500 font-semibold block uppercase">Recommended Fee</span>
                  <p className="font-bold text-sm text-violet-700 mt-0.5">₹45,000 – ₹55,000</p>
                  <p className="text-[11px] text-slate-600 mt-1">50% Advance · 50% on Hand-off</p>
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <span className="text-xs font-bold text-slate-900 block">Extracted Deliverables Checklist:</span>
                <div className="grid sm:grid-cols-2 gap-2 text-xs">
                  {[
                    "UX Friction Audit & User Flow Journey Maps",
                    "18 Desktop & Mobile Figma UI Screens",
                    "Modular Component Design System (50+ components)",
                    "Interactive Clickable Prototype for Stakeholders",
                    "Developer Hand-off with tokens and CSS specs",
                    "2 Comprehensive revision cycles included"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="text-[11px] text-slate-800 font-medium truncate">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setActiveTab(2)}
                  className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  Generate Executive Proposal ➔
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: Live Proposal Document Preview */}
          {activeTab === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-md">
                <div className={`${currentTheme.headerBg} p-5 text-white relative shadow-sm`}>
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/20">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-white/25 backdrop-blur-md flex items-center justify-center font-bold text-xs text-white shadow-2xs">
                        AI
                      </div>
                      <span className="text-xs font-bold tracking-tight">Apex Design Studio</span>
                      <span className="text-[10px] bg-white/25 px-2 py-0.5 rounded-full font-mono">Verified Studio</span>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white border border-white/30 px-2.5 py-0.5 rounded-full">
                      Client View Active
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-1">
                    SaaS Dashboard Redesign & Design System
                  </h2>
                  <p className="text-xs text-white/90">Prepared for Sarah Jenkins · CloudFlow AI</p>

                  <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/20 text-[11px]">
                    <div>
                      <span className="text-white/75 block text-[10px] uppercase font-semibold">Total Fee</span>
                      <strong className="text-white text-xs">₹45,000 Fixed</strong>
                    </div>
                    <div>
                      <span className="text-white/75 block text-[10px] uppercase font-semibold">Delivery</span>
                      <strong className="text-white text-xs">5 Weeks</strong>
                    </div>
                    <div>
                      <span className="text-white/75 block text-[10px] uppercase font-semibold">Deposit</span>
                      <strong className="text-white text-xs">₹22,500 (50%)</strong>
                    </div>
                  </div>
                </div>

                {/* Proposal mini body */}
                <div className="p-4 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-900">Interactive Client Sign-off Ready</p>
                    <p className="text-slate-500 text-[11px]">Clients can accept online or export clean print-ready PDF.</p>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => setAccepted(true)}
                      className={`${
                        accepted ? "bg-emerald-700" : "bg-emerald-600 hover:bg-emerald-700"
                      } text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5 flex-1 sm:flex-initial`}
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> {accepted ? "Accepted & Deposit Logged!" : "Accept & Pay"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab(3)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200"
                    >
                      Customize Theme ➔
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Pro Visual Studio & Dynamic Themes */}
          {activeTab === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-violet-700 bg-violet-100 px-2.5 py-0.5 rounded-full">
                    Pro Branding Studio (₹49/mo)
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">Select a Designer Theme to Morph Header</h3>
                </div>
                <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> 100% White-Label
                </span>
              </div>

              {/* Theme selector pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {PRO_TEMPLATE_PREVIEWS.map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => setActiveTemplate(tpl.id)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      activeTemplate === tpl.id
                        ? "border-violet-600 ring-2 ring-violet-500/20 bg-violet-50/40 shadow-xs"
                        : "border-slate-200 hover:border-slate-300 bg-slate-50"
                    }`}
                  >
                    <div className="h-6 rounded-lg mb-2 shadow-2xs" style={{ background: tpl.gradient }} />
                    <p className="font-bold text-xs text-slate-900 truncate">{tpl.name}</p>
                    <span className="text-[10px] text-slate-500 block mt-0.5">{tpl.badge}</span>
                  </button>
                ))}
              </div>

              {/* Live Preview with chosen theme */}
              <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-md">
                <div className={`${currentTheme.headerBg} p-4 text-white transition-all duration-300 shadow-sm`}>
                  <div className="flex items-center justify-between text-xs mb-2 pb-2 border-b border-white/20">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-200" /> Apex Design Studio
                    </span>
                    <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-mono">{currentTheme.category}</span>
                  </div>
                  <h4 className="text-base font-bold text-white">SaaS Dashboard Redesign</h4>
                  <p className="text-[11px] text-white/90">{currentTheme.tagline}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                <span className="text-xs text-slate-500">Upload your custom SVG/PNG logo & build multi-stop gradients.</span>
                <Link
                  to="/checkout?plan=pro"
                  className="w-full sm:w-auto bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  Unlock Pro for ₹49/mo ➔
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating frosted metric tags around the canvas */}
      <div className="hidden lg:flex items-center gap-2.5 absolute -bottom-5 -left-6 bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-2xl p-3.5 shadow-xl shadow-slate-900/8 z-20 text-xs animate-float-slow">
        <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
          <Clock className="w-4.5 h-4.5" />
        </div>
        <div>
          <p className="font-bold text-slate-900">4.2 min avg</p>
          <p className="text-[10px] text-slate-500">Brief to client sign-off</p>
        </div>
      </div>

      <div className="hidden lg:flex items-center gap-2.5 absolute -top-5 -right-6 bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-2xl p-3.5 shadow-xl shadow-slate-900/8 z-20 text-xs animate-float-reverse">
        <div className="w-9 h-9 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center font-bold">
          <TrendingUp className="w-4.5 h-4.5" />
        </div>
        <div>
          <p className="font-bold text-slate-900">68% Win Rate</p>
          <p className="text-[10px] text-slate-500">vs 22% for plain PDFs</p>
        </div>
      </div>
    </div>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-slate-200 py-4 transition-colors">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 text-left group cursor-pointer"
      >
        <span className="font-bold text-slate-900 text-sm group-hover:text-violet-600 transition-colors">
          {q}
        </span>
        <div className={`w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center shrink-0 transition-transform ${open ? "rotate-180 bg-violet-100 text-violet-700" : "text-slate-500"}`}>
          <ChevronDown className="w-3.5 h-3.5" />
        </div>
      </button>
      {open && (
        <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed animate-fade-in pl-1">
          {a}
        </p>
      )}
    </div>
  );
}

export default function Landing() {
  const [annualBilling, setAnnualBilling] = useState(false);

  // Guarantee clean light mode on the landing page
  useEffect(() => {
    document.documentElement.classList.remove("dark");
  }, []);

  return (
    <div className="bg-[#ffffff] text-slate-900 min-h-screen selection:bg-violet-500/20 selection:text-violet-700 relative overflow-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 sm:pt-40 pb-20 px-4 sm:px-6 max-w-6xl mx-auto">
        {/* Ambient Top Light Beam (Crisp pastel glow) */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[720px] h-[360px] bg-gradient-to-tr from-violet-200/50 via-indigo-100/40 to-pink-200/40 blur-[130px] rounded-full pointer-events-none" />

        <div className="text-center max-w-3xl mx-auto relative z-10">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 bg-violet-50 text-violet-700 text-xs font-bold px-4 py-1.5 rounded-full mb-6 border border-violet-200 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-violet-600 animate-pulse" />
            <span>Built for Designers, Developers & Creative Studios</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-950 leading-[1.08] mb-6">
            Turn client briefs into{" "}
            <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              high-ticket winning proposals.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto mb-9 font-normal">
            Paste any messy client email, WhatsApp chat, or job brief. In 60 seconds, AI generates a tailored proposal with clear deliverables, intelligent pricing milestones, designer branding, and live online acceptance.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-10">
            <Link
              to="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 text-white font-bold text-sm px-7 py-4 rounded-2xl shadow-xl shadow-violet-600/30 hover:shadow-violet-600/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <span>Create Your First Proposal Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="#demo"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-slate-800 font-semibold text-sm px-6 py-4 rounded-2xl border border-slate-200 shadow-xs hover:bg-slate-50 hover:border-slate-300 transition-all"
            >
              <Eye className="w-4 h-4 text-violet-600" />
              <span>Explore Live Studio</span>
            </a>
          </div>

          {/* Social Proof Row */}
          <div className="flex items-center justify-center gap-4 text-xs text-slate-500 pt-2">
            <div className="flex -space-x-2">
              {["KR", "SM", "AV", "PH"].map((initial, i) => (
                <div key={i} className="w-7 h-7 rounded-full bg-gradient-to-tr from-violet-500 to-indigo-600 text-white font-bold text-[10px] flex items-center justify-center border-2 border-white shadow-2xs">
                  {initial}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />)}
              </div>
              <span className="text-xs">4.9/5 from 3,200+ top freelancers & studios</span>
            </div>
          </div>
        </div>

        {/* Centerpiece: Interactive Product Studio */}
        <InteractiveStudioPreview />
      </section>

      {/* Metrics Ribbon */}
      <section className="py-12 border-y border-slate-200 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <p className="text-3xl lg:text-4xl font-extrabold text-slate-950">₹28M+</p>
            <p className="text-xs text-slate-500 mt-1 font-medium">Proposals Accepted</p>
          </div>
          <div>
            <p className="text-3xl lg:text-4xl font-extrabold text-slate-950">4.2 min</p>
            <p className="text-xs text-slate-500 mt-1 font-medium">Avg. Creation Speed</p>
          </div>
          <div>
            <p className="text-3xl lg:text-4xl font-extrabold text-slate-950">68%</p>
            <p className="text-xs text-slate-500 mt-1 font-medium">Average Close Rate</p>
          </div>
          <div>
            <p className="text-3xl lg:text-4xl font-extrabold text-emerald-600">100%</p>
            <p className="text-xs text-slate-500 mt-1 font-medium">White-Label Freedom</p>
          </div>
        </div>
      </section>

      {/* Bento Grid: Superpowers */}
      <section id="superpowers" className="py-24 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-extrabold uppercase tracking-wider text-violet-700 bg-violet-100 px-3.5 py-1 rounded-full border border-violet-200">
            Engineered For Winning
          </span>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-950 mt-3 tracking-tight">
            Everything you need to close high-ticket clients.
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            No more messy PDFs or blank-page anxiety. A unified proposal workflow built specifically for modern service businesses.
          </p>
        </div>

        {/* Bento Grid Container */}
        <div className="grid md:grid-cols-3 gap-5">
          {/* Bento 1: Large Brief Analyzer */}
          <div className="md:col-span-2 rounded-3xl border border-slate-200 bg-white p-7 shadow-xs hover:border-violet-400 hover:shadow-md transition-all group flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-violet-100 text-violet-700 flex items-center justify-center font-bold mb-4 group-hover:scale-105 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-slate-950 mb-2">Smart Scope & Brief Analyzer</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-lg mb-5">
                Paste any unstructured client brief. Our specialized AI model extracts explicit goals, breaks them down into tangible milestones, writes an executive summary, and generates protective legal terms.
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600 pb-2 border-b border-slate-200">
                <span>Extracted Deliverables:</span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Ready for proposal
                </span>
              </div>
              <div className="grid sm:grid-cols-2 gap-2 text-slate-800 font-medium">
                <div className="p-2 bg-white rounded-xl border border-slate-200 shadow-2xs">✓ UX Audit & IA Map</div>
                <div className="p-2 bg-white rounded-xl border border-slate-200 shadow-2xs">✓ 20 Figma High-Fi Screens</div>
                <div className="p-2 bg-white rounded-xl border border-slate-200 shadow-2xs">✓ Reusable Design Tokens</div>
                <div className="p-2 bg-white rounded-xl border border-slate-200 shadow-2xs">✓ Interactive Clickable Flow</div>
              </div>
            </div>
          </div>

          {/* Bento 2: Intelligent Pricing Guidance */}
          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-xs hover:border-violet-400 hover:shadow-md transition-all group flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold mb-4 group-hover:scale-105 transition-transform">
                <DollarSign className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-slate-950 mb-2">Smart Pricing Engine</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-5">
                Never undercharge again. AI suggests realistic project estimates based on your years of experience, deliverable count, and market standards.
              </p>
            </div>

            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl text-xs space-y-2">
              <div className="flex justify-between font-bold text-slate-900">
                <span>Recommended Fee</span>
                <span className="text-amber-700">₹45,000 – ₹55,000</span>
              </div>
              <p className="text-[11px] text-slate-500">Based on 20 screens + design system scope.</p>
              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div className="bg-amber-500 h-full w-3/4 rounded-full" />
              </div>
            </div>
          </div>

          {/* Bento 3: Real-Time View Tracking */}
          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-xs hover:border-violet-400 hover:shadow-md transition-all group flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold mb-4 group-hover:scale-105 transition-transform">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-slate-950 mb-2">Live Client Analytics</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-5">
                Know the exact second a prospective client opens your proposal link, how many times they re-read it, and when they accept.
              </p>
            </div>

            <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-xs space-y-2">
              <div className="flex items-center gap-2 text-emerald-700 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>Client Viewed 2m ago</span>
              </div>
              <p className="text-[11px] text-slate-500">Opened via mobile device · 3rd repeat view</p>
            </div>
          </div>

          {/* Bento 4: 4 Designer Pro Themes */}
          <div className="md:col-span-2 rounded-3xl border border-slate-200 bg-white p-7 shadow-xs hover:border-violet-400 hover:shadow-md transition-all group flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold mb-4 group-hover:scale-105 transition-transform">
                <Palette className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-slate-950 mb-2">Custom Logo, Gradients & 4 Pro Themes</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-lg mb-5">
                Ditch default templates. Upload your custom studio logo, adjust multi-stop color gradients with direction sliders, and switch between Modern Minimal, Executive Gold, Cyber Tech, and Sunset Studio.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {PRO_TEMPLATE_PREVIEWS.map((tpl) => (
                <div key={tpl.id} className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-center">
                  <div className="h-4 rounded-md mb-1.5 shadow-2xs" style={{ background: tpl.gradient }} />
                  <p className="font-bold text-[11px] text-slate-800 truncate">{tpl.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pro Themes Showcase Gallery */}
      <section id="themes" className="py-20 px-4 sm:px-6 border-y border-slate-200 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-12">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-violet-700 bg-violet-100 px-3.5 py-1 rounded-full border border-violet-200">
                Visual Customization Studio
              </span>
              <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-950 mt-3 tracking-tight">
                Designed for high-ticket aesthetics.
              </h2>
              <p className="text-sm text-slate-600 mt-2 max-w-xl">
                Every theme includes responsive typography, custom visual hero banners, and 100% white-label capability.
              </p>
            </div>

            <Link
              to="/checkout?plan=pro"
              className="bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold px-5 py-3 rounded-xl shadow-md shadow-violet-600/20 transition-all shrink-0"
            >
              Unlock All 4 Themes (₹49/mo)
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PRO_TEMPLATE_PREVIEWS.map((tpl) => (
              <div key={tpl.id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group">
                <div className={`${tpl.headerBg} p-5 text-white relative transition-transform group-hover:scale-[1.02] shadow-sm`}>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] uppercase font-bold bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-md">
                      {tpl.badge}
                    </span>
                    <Sparkles className="w-3.5 h-3.5 text-white/90" />
                  </div>
                  <h4 className="text-base font-bold text-white tracking-tight">{tpl.name}</h4>
                  <p className="text-[10px] text-white/80 mt-1">{tpl.category}</p>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">{tpl.tagline}</p>
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Pro Feature
                    </span>
                    <Link to="/checkout?plan=pro" className="font-bold text-violet-700 hover:underline">
                      Preview ↗
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison: PDF vs ProposalAI */}
      <section id="comparison" className="py-24 px-4 sm:px-6 max-w-4xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-extrabold text-slate-950 tracking-tight">
            Why clients sign web proposals 3x faster than PDFs
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Traditional static attachments get lost in downloads folders. Interactive web proposals convert.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {/* Old Way */}
          <div className="p-6 rounded-3xl border border-rose-200 bg-rose-50/60 space-y-4">
            <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
              <X className="w-4 h-4" /> The Outdated Way (Manual PDFs)
            </div>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <span className="text-rose-600 font-bold shrink-0">✕</span>
                <span>Takes 2–4 hours formatting tables and re-writing scopes</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-600 font-bold shrink-0">✕</span>
                <span>Sent as an attachment; zero tracking on who opened it</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-600 font-bold shrink-0">✕</span>
                <span>Awkward to read on phones and small mobile screens</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-600 font-bold shrink-0">✕</span>
                <span>Requires printing, signing, scanning, and emailing back</span>
              </li>
            </ul>
          </div>

          {/* ProposalAI Way */}
          <div className="p-6 rounded-3xl border border-emerald-200 bg-emerald-50/60 space-y-4 shadow-xs">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
              <Check className="w-4 h-4 text-emerald-600" /> The ProposalAI Way
            </div>
            <ul className="space-y-2.5 text-xs text-slate-800 font-medium">
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Generated from brief to ready in under 60 seconds</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Real-time view alerts when client opens and reads it</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Flawless responsive view on mobile, tablet & desktop</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>1-Click digital acceptance & deposit confirmation</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 border-t border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-violet-700 bg-violet-100 px-3.5 py-1 rounded-full border border-violet-200">
              Trusted Proof
            </span>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-950 mt-3 tracking-tight">
              Used by independent creators who bill for results
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({ quote, name, role, metric, avatar }) => (
              <div key={name} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex text-amber-500">
                      {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />)}
                    </div>
                    <span className="text-[10px] font-bold text-violet-700 bg-violet-100 px-2 py-0.5 rounded-full">
                      {metric}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mb-6 font-medium">
                    "{quote}"
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                  <div className="w-9 h-9 rounded-full bg-violet-100 text-violet-700 font-bold text-xs flex items-center justify-center">
                    {avatar}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{name}</p>
                    <p className="text-[11px] text-slate-500">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-extrabold uppercase tracking-wider text-violet-700 bg-violet-100 px-3.5 py-1 rounded-full border border-violet-200">
            Transparent Pricing
          </span>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-950 mt-3 tracking-tight">
            Start free. Upgrade as you win more work.
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            No lock-in. Cancel or change plans anytime with one click.
          </p>

          {/* Monthly / Annual Toggle */}
          <div className="inline-flex items-center bg-slate-100 p-1.5 rounded-2xl border border-slate-200 mt-7 text-xs font-bold">
            <button
              type="button"
              onClick={() => setAnnualBilling(false)}
              className={`px-4 py-1.5 rounded-xl transition-all ${
                !annualBilling ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setAnnualBilling(true)}
              className={`px-4 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                annualBilling ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>Annual</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-700 font-extrabold px-1.5 py-0.5 rounded-full">
                -20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto items-stretch">
          {/* Free Tier */}
          <div className="rounded-3xl p-7 border border-slate-200 bg-white flex flex-col justify-between shadow-xs">
            <div>
              <p className="font-bold text-slate-900 text-lg mb-1">Free</p>
              <p className="text-xs text-slate-500 mb-4 min-h-[32px]">For freelancers testing AI proposal generation.</p>
              <div className="flex items-baseline gap-1 mb-6 pb-4 border-b border-slate-100">
                <span className="text-4xl font-extrabold text-slate-950">₹0</span>
                <span className="text-xs text-slate-500">/month</span>
              </div>
              <ul className="space-y-3 mb-8 text-xs text-slate-700 font-medium">
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>3 AI proposals per month</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Standard Minimalist template</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Clean PDF export</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Shareable client web links</span>
                </li>
              </ul>
            </div>
            <Link
              to="/signup"
              className="w-full block text-center py-3 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-200 transition-all"
            >
              Get Started Free
            </Link>
          </div>

          {/* Pro Tier (Highlighted) */}
          <div className="rounded-3xl p-7 border-2 border-violet-600 bg-gradient-to-b from-violet-50/50 via-white to-white flex flex-col justify-between shadow-xl shadow-violet-600/10 relative">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-[11px] font-extrabold px-3.5 py-1 rounded-full shadow-md">
              MOST POPULAR · BEST VALUE
            </div>
            <div>
              <p className="font-bold text-slate-950 text-lg mb-1">Pro</p>
              <p className="text-xs text-slate-600 mb-4 min-h-[32px]">For active designers & freelancers winning high-ticket projects.</p>
              <div className="flex items-baseline gap-1 mb-6 pb-4 border-b border-slate-200">
                <span className="text-4xl font-extrabold text-slate-950">
                  ₹{annualBilling ? "39" : "49"}
                </span>
                <span className="text-xs text-slate-500">/month</span>
                {annualBilling && (
                  <span className="text-[10px] text-emerald-700 font-bold ml-1.5">(billed ₹468/yr)</span>
                )}
              </div>
              <ul className="space-y-3 mb-8 text-xs text-slate-800 font-medium">
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>30 AI proposals</strong> per month</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Custom Business Logo Upload</strong> (SVG/PNG)</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>4 Pro Template Themes</strong> (Luxury, Tech, Creative)</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>100% White-Label</strong> (Hide ProposalAI branding)</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>AI Pricing Assistant & Scope Analyzer</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Proposal view tracking & client notifications</span>
                </li>
              </ul>
            </div>
            <Link
              to={`/checkout?plan=pro&billing=${annualBilling ? "annual" : "monthly"}`}
              className="w-full block text-center py-3.5 rounded-xl font-bold text-xs bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-lg shadow-violet-600/25 transition-all"
            >
              Upgrade to Pro — ₹{annualBilling ? "39" : "49"}/mo
            </Link>
          </div>

          {/* Studio Tier */}
          <div className="rounded-3xl p-7 border border-slate-200 bg-white flex flex-col justify-between shadow-xs">
            <div>
              <p className="font-bold text-slate-900 text-lg mb-1">Studio</p>
              <p className="text-xs text-slate-500 mb-4 min-h-[32px]">For agencies and design studios with teams.</p>
              <div className="flex items-baseline gap-1 mb-6 pb-4 border-b border-slate-100">
                <span className="text-4xl font-extrabold text-slate-950">
                  ₹{annualBilling ? "79" : "99"}
                </span>
                <span className="text-xs text-slate-500">/month</span>
                {annualBilling && (
                  <span className="text-[10px] text-emerald-700 font-bold ml-1.5">(billed ₹948/yr)</span>
                )}
              </div>
              <ul className="space-y-3 mb-8 text-xs text-slate-700 font-medium">
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Unlimited AI proposals</strong></span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>All Pro branding & visual studio features</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Team members (up to 5 seats)</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Multiple client brands & workspaces</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Priority 24/7 VIP support</span>
                </li>
              </ul>
            </div>
            <Link
              to={`/checkout?plan=studio&billing=${annualBilling ? "annual" : "monthly"}`}
              className="w-full block text-center py-3 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-200 transition-all"
            >
              Start Studio Plan
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-4 sm:px-6 max-w-3xl mx-auto border-t border-slate-200">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-violet-700 bg-violet-100 px-3.5 py-1 rounded-full border border-violet-200">
            Got Questions?
          </span>
          <h2 className="text-3xl font-extrabold text-slate-950 mt-3 tracking-tight">
            Frequently asked questions
          </h2>
        </div>
        <div className="space-y-1">
          {FAQS.map(({ q, a }) => <FAQItem key={q} q={q} a={a} />)}
        </div>
      </section>

      {/* Vibrant High-Converting Closing CTA Banner (Luminous Gradient, NOT Black) */}
      <section className="py-20 px-4 sm:px-6 max-w-5xl mx-auto mb-16">
        <div className="rounded-[32px] bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 text-white p-10 sm:p-16 relative overflow-hidden shadow-2xl shadow-violet-600/25 text-center">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto">
            <span className="text-xs font-extrabold uppercase tracking-wider text-white bg-white/20 px-3.5 py-1.5 rounded-full border border-white/30 backdrop-blur-md">
              Start Winning More Projects
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mt-6 mb-4">
              Your next proposal shouldn't take all evening.
            </h2>
            <p className="text-white/90 text-base max-w-xl mx-auto mb-8 font-normal">
              Join thousands of modern creative professionals creating high-converting, trackable proposals in seconds.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Link
                to="/signup"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-violet-700 hover:bg-slate-50 font-bold text-sm px-8 py-4 rounded-2xl shadow-xl shadow-black/15 hover:scale-[1.02] transition-all"
              >
                <span>Create Your First Proposal Free</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <p className="text-white/75 text-xs mt-4">Free forever tier · No credit card required to start</p>
          </div>
        </div>
      </section>

      {/* Footer (Clean Crisp Light) */}
      <footer className="bg-slate-50 border-t border-slate-200 px-4 sm:px-6 py-12 text-slate-600">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-violet-600 flex items-center justify-center text-white shadow-md">
              <LogoSymbol className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-sm">ProposalAI</span>
              <p className="text-[10px] text-slate-500">Next-Gen Proposal Platform</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 font-medium">
            <a href="#demo" className="hover:text-slate-900 transition-colors">Live Studio</a>
            <a href="#superpowers" className="hover:text-slate-900 transition-colors">Superpowers</a>
            <a href="#themes" className="hover:text-slate-900 transition-colors">Themes</a>
            <a href="#comparison" className="hover:text-slate-900 transition-colors">Why Web Wins</a>
            <a href="#pricing" className="hover:text-slate-900 transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-slate-900 transition-colors">FAQ</a>
            <Link to="/login" className="hover:text-slate-900 transition-colors">Sign In</Link>
          </div>

          <p className="text-slate-500 text-[11px] text-center md:text-right">
            © 2026 ProposalAI. Built with precision for top creative professionals.
          </p>
        </div>
      </footer>
    </div>
  );
}
