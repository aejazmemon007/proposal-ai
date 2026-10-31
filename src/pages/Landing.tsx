import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight, Sparkles, Check, ChevronDown, Menu, X, FileText, Zap, Clock,
  TrendingUp, Shield, Globe, Star, Image, Palette, Sliders, Layers, Eye, Award, CheckCircle2
} from "lucide-react";

const FEATURES = [
  { icon: Sparkles, title: "AI Proposal Writer", desc: "From client brief to complete, persuasive proposal in minutes—not hours." },
  { icon: Image, title: "Custom Logo Upload", desc: "Upload your business logo (SVG, PNG, JPG) with high-res rendering on all proposals." },
  { icon: Palette, title: "Gradient & Color Studio", desc: "Craft custom multi-stop gradients with angle sliders or pick from curated palettes." },
  { icon: Layers, title: "4 Pro Template Themes", desc: "Executive Luxury, Cyber Tech, Creative Sunset, and Modern Minimal designs." },
  { icon: Shield, title: "100% White-Label", desc: "Remove all ProposalAI watermarks from client links and PDF exports on Pro." },
  { icon: FileText, title: "Brief Analyzer", desc: "Paste any client email or Upwork message. AI extracts goals, scope, and timeline." },
  { icon: TrendingUp, title: "Smart Pricing Assistant", desc: "Get realistic pricing recommendations based on your experience and project scope." },
  { icon: Globe, title: "Live Tracked Proposals", desc: "Send an interactive link. Know when clients open, read, and accept online." },
];

const PRO_TEMPLATE_PREVIEWS = [
  {
    id: "modern-minimal",
    name: "Modern Minimalist",
    badge: "Clean & Modern",
    gradient: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
    accent: "#6366f1",
    desc: "Content-first layout with high-contrast typography and crisp section hierarchy.",
  },
  {
    id: "executive-luxury",
    name: "Executive Onyx & Gold",
    badge: "Luxury & High-Ticket",
    gradient: "linear-gradient(135deg, #18181b 0%, #d97706 100%)",
    accent: "#f59e0b",
    desc: "Dark luxury theme with serif headers, gold borders, and executive assurance guarantees.",
  },
  {
    id: "tech-emerald",
    name: "Cyber Emerald & Tech",
    badge: "SaaS & Engineering",
    gradient: "linear-gradient(135deg, #059669 0%, #0d9488 100%)",
    accent: "#10b981",
    desc: "Terminal monospace spec layout engineered for tech consultants, dev agencies, and SaaS.",
  },
  {
    id: "creative-sunset",
    name: "Creative Sunset Studio",
    badge: "Agencies & Design",
    gradient: "linear-gradient(135deg, #f43f5e 0%, #f97316 100%)",
    accent: "#f97316",
    desc: "Vibrant warm gradients, spacious cards, and partner badges built for creative studios.",
  },
];

const TESTIMONIALS = [
  { quote: "Instead of spending an hour crafting every proposal, I now get a solid first draft in under 5 minutes. I close more projects because I respond faster.", name: "Kavya R.", role: "UI/UX Designer", avatar: "KR" },
  { quote: "The brief analyzer is surprisingly good. It catches things I'd normally miss—like unclear timelines or missing info that would cause problems later.", name: "Siddharth M.", role: "Web Developer", avatar: "SM" },
  { quote: "My proposals look way more professional now. Clients actually read them and comment on specific sections. That never happened before.", name: "Ananya P.", role: "Brand Designer", avatar: "AP" },
];

const FAQS = [
  { q: "What is ProposalAI?", a: "ProposalAI is an AI-powered tool for freelancers and agencies that turns client messages, emails, and briefs into professional, personalized proposals in minutes." },
  { q: "Can I upload my own company logo and brand colors?", a: "Yes! In the Pro and Studio plans, you get full access to the Branding Visual Studio to upload your custom logo (SVG, PNG, JPG, WebP), pick solid brand colors, or build custom multi-stop gradients with angle direction sliders." },
  { q: "What template designs are included in the Pro plan?", a: "The Pro plan includes 4 designer-grade templates: Modern Minimalist, Executive Onyx & Gold, Cyber Emerald & Tech, and Creative Sunset Studio. You can switch templates anytime with one click." },
  { q: "Can I remove the 'Created with ProposalAI' watermark?", a: "Yes. Pro and Studio subscribers can toggle on White-Label mode to completely remove any ProposalAI branding from shared client links and PDF exports." },
  { q: "Can clients view proposals without an account?", a: "Yes. Each proposal gets a secure shareable link. Clients can view, accept, or reject without creating an account." },
  { q: "Does AI set my prices automatically?", a: "No. The AI suggests a realistic pricing range based on scope and your experience level. You decide what to charge—the tool helps you sanity-check your pricing." },
  { q: "Can I edit AI-generated proposals?", a: "Absolutely. The editor is built for full customization. Nothing the AI generates is locked—you own every word and can rewrite with AI on demand." },
];

const STEPS = [
  { num: "01", title: "Paste the brief", desc: "Paste anything: a client email, Upwork job post, WhatsApp message, or meeting notes." },
  { num: "02", title: "Customize", desc: "Review the AI's extracted scope, adjust pricing, and set your proposal style." },
  { num: "03", title: "Send and track", desc: "Generate a polished proposal, share the link, and see when it's opened." },
];

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${scrolled ? "bg-[#fafaf8]/95 border-b border-[#e5e5eb] backdrop-blur-md shadow-sm" : ""}`}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center">
        <Link to="/" className="flex items-center gap-2.5 mr-auto">
          <div className="w-8 h-8 rounded-lg bg-[#7c3aed] flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-[#0f0f12] text-[15px] tracking-tight">ProposalAI</span>
        </Link>

        <div className="hidden md:flex items-center gap-7 text-sm font-medium text-[#6b6b7a] absolute left-1/2 -translate-x-1/2">
          <a href="#features" className="hover:text-[#0f0f12] transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-[#0f0f12] transition-colors">How it works</a>
          <a href="#pricing" className="hover:text-[#0f0f12] transition-colors">Pricing</a>
          <a href="#faq" className="hover:text-[#0f0f12] transition-colors">FAQ</a>
        </div>

        <div className="hidden md:flex items-center gap-3 ml-auto">
          <Link to="/login" className="text-sm font-medium text-[#0f0f12] hover:text-[#7c3aed] transition-colors px-3 py-2">Log in</Link>
          <Link to="/signup" className="bg-[#7c3aed] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#6d28d9] transition-colors">
            Get Started
          </Link>
        </div>

        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-lg hover:bg-[#f0f0ee]">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-[#fafaf8] border-t border-[#e5e5eb] px-6 py-4 space-y-1">
          {["#features", "#how-it-works", "#pricing", "#faq"].map((href, i) => (
            <a key={href} href={href} onClick={() => setMobileOpen(false)} className="block py-2.5 text-sm font-medium text-[#0f0f12]">
              {["Features", "How it works", "Pricing", "FAQ"][i]}
            </a>
          ))}
          <div className="pt-3 space-y-2 border-t border-[#e5e5eb] mt-3">
            <Link to="/login" className="block text-center py-2.5 text-sm font-medium text-[#0f0f12] border border-[#e5e5eb] rounded-lg">Log in</Link>
            <Link to="/signup" className="block text-center bg-[#7c3aed] text-white py-2.5 text-sm font-semibold rounded-lg">Get Started</Link>
          </div>
        </div>
      )}
    </nav>
  );
}

function ProductMockup() {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const loop = setInterval(() => {
      setStage((s) => (s >= 3 ? 0 : s + 1));
    }, 3200);
    return () => clearInterval(loop);
  }, []);

  const TABS = ["01. Client Brief", "02. AI Scope", "03. Proposal", "04. Pro Branding & Themes"];

  return (
    <div className="relative w-full max-w-3xl mx-auto">
      <div className="rounded-2xl border border-[#e5e5eb] bg-white shadow-2xl overflow-hidden">
        {/* App chrome */}
        <div className="bg-[#f4f4f2] border-b border-[#e5e5eb] px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#ef4444]/70" />
            <div className="w-3 h-3 rounded-full bg-[#f59e0b]/70" />
            <div className="w-3 h-3 rounded-full bg-[#10b981]/70" />
          </div>
          <div className="flex items-center gap-1 sm:gap-4 overflow-x-auto text-xs font-medium">
            {TABS.map((tab, i) => (
              <button
                key={tab}
                type="button"
                onClick={() => setStage(i)}
                className={`px-2.5 py-1 rounded-md transition-all whitespace-nowrap cursor-pointer ${
                  stage === i
                    ? "text-[#7c3aed] bg-white shadow-xs font-semibold"
                    : "text-[#6b6b7a] hover:text-[#0f0f12]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-[#059669] font-semibold bg-[#059669]/10 px-2 py-0.5 rounded-full">
            <Check className="w-3 h-3" /> Live Demo
          </div>
        </div>

        <div className="p-6 min-h-[300px] relative overflow-hidden">
          {/* Stage 0: Brief */}
          <div className={`absolute inset-6 transition-all duration-500 ${stage === 0 ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"}`}>
            <p className="text-xs font-semibold text-[#6b6b7a] uppercase tracking-wide mb-3">Client Brief</p>
            <div className="bg-[#f4f4f2] rounded-xl p-4 text-sm text-[#0f0f12] leading-relaxed border border-[#e5e5eb]">
              "I need a complete redesign of our SaaS dashboard. The current one is outdated and our users find it confusing. We have around 20 screens that need to be redesigned with better navigation and a modern look. Timeline is around 6 weeks, budget is flexible for the right designer."
            </div>
            <div className="mt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStage(1)}
                className="flex items-center gap-2 bg-[#7c3aed] text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-[#6d28d9] transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                Analyze Brief
              </button>
              <span className="text-xs text-[#6b6b7a]">Paste from WhatsApp, Upwork, Email</span>
            </div>
          </div>

          {/* Stage 1: Analysis */}
          <div className={`absolute inset-6 transition-all duration-500 ${stage === 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <p className="text-xs font-semibold text-[#6b6b7a] uppercase tracking-wide mb-2">AI Analysis & Project Context</p>
                <div className="bg-[#7c3aed]/5 border border-[#7c3aed]/20 rounded-xl p-3.5 space-y-2 text-xs">
                  <div className="flex justify-between"><span className="font-semibold text-[#6b6b7a]">Project:</span><span className="font-medium text-[#0f0f12]">SaaS Dashboard Redesign</span></div>
                  <div className="flex justify-between"><span className="font-semibold text-[#6b6b7a]">Complexity:</span><span className="font-semibold text-[#d97706]">Medium–High (20 Screens)</span></div>
                  <div className="flex justify-between"><span className="font-semibold text-[#6b6b7a]">Estimated Timeline:</span><span className="font-medium text-[#0f0f12]">5–6 weeks</span></div>
                  <div className="pt-1.5 border-t border-[#7c3aed]/20">
                    <span className="font-semibold text-[#6b6b7a] block mb-1">Core Deliverables:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {["UI Architecture", "Design System", "Prototype"].map((g) => (
                        <span key={g} className="bg-white border border-[#7c3aed]/30 text-[#7c3aed] text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Check className="w-3 h-3 text-[#059669]" /> {g}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="sm:w-44 shrink-0">
                <p className="text-xs font-semibold text-[#6b6b7a] uppercase tracking-wide mb-2">Suggested Scope</p>
                <div className="space-y-1.5">
                  {["UX Audit & IA", "User Journey Flows", "20 UI Screens", "Figma Design Tokens", "Interactive Prototype"].map((s) => (
                    <div key={s} className="flex items-center gap-2 p-1.5 rounded-lg bg-[#f4f4f2] border border-[#e5e5eb]">
                      <div className="w-3.5 h-3.5 rounded border border-[#7c3aed] flex items-center justify-center bg-[#7c3aed]/10 shrink-0">
                        <Check className="w-2.5 h-2.5 text-[#7c3aed]" />
                      </div>
                      <span className="text-[11px] text-[#0f0f12] font-medium truncate">{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Stage 2: Proposal */}
          <div className={`absolute inset-6 transition-all duration-500 ${stage === 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs font-semibold text-[#6b6b7a] uppercase tracking-wide mb-0.5">Generated Proposal</p>
                <h3 className="font-semibold text-[#0f0f12] text-sm sm:text-base">SaaS Dashboard Redesign</h3>
                <p className="text-xs text-[#6b6b7a]">Prepared for Rahul Sharma • Acme Technologies</p>
              </div>
              <div className="bg-[#059669]/10 text-[#059669] text-xs font-semibold px-2.5 py-1 rounded-full border border-[#059669]/20">
                Ready to Send
              </div>
            </div>
            <div className="space-y-2 mb-4">
              {[
                { label: "Total Investment", value: "₹45,000 (Fixed Price)" },
                { label: "Engagement Timeline", value: "5 Weeks (4 Sprints)" },
                { label: "Payment Schedule", value: "50% upfront, 50% on final delivery" },
                { label: "Included Revisions", value: "2 comprehensive rounds" },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between py-1.5 px-2.5 rounded-lg bg-[#f4f4f2] border border-[#e5e5eb] text-xs">
                  <span className="text-[#6b6b7a]">{label}</span>
                  <span className="font-semibold text-[#0f0f12]">{value}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setStage(3)} className="flex-1 bg-[#7c3aed] text-white text-xs font-semibold py-2 rounded-lg hover:bg-[#6d28d9] transition-colors flex items-center justify-center gap-1.5">
                <Palette className="w-3.5 h-3.5" /> Customize Branding & Colors
              </button>
              <button onClick={() => setStage(3)} className="px-3 bg-white text-[#0f0f12] text-xs font-medium py-2 rounded-lg border border-[#e5e5eb] hover:bg-[#f4f4f2]">
                Next: Studio Themes →
              </button>
            </div>
          </div>

          {/* Stage 3: Pro Branding & Custom Colors */}
          <div className={`absolute inset-6 transition-all duration-500 ${stage === 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs font-bold text-[#7c3aed] uppercase tracking-wider mb-0.5 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5" /> Pro Branding & Visual Studio
                </p>
                <h3 className="font-semibold text-[#0f0f12] text-sm sm:text-base">Custom Logo, Gradients & 4 Themes</h3>
              </div>
              <div className="bg-[#7c3aed]/10 text-[#7c3aed] text-xs font-bold px-2.5 py-1 rounded-full border border-[#7c3aed]/20">
                White-Label Pro
              </div>
            </div>

            {/* Branded Header Preview Box */}
            <div className="rounded-xl overflow-hidden border border-[#e5e5eb] shadow-sm mb-3">
              <div className="bg-gradient-to-r from-violet-700 via-purple-700 to-indigo-800 text-white p-3.5 relative">
                <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-white/20">
                  <div className="flex items-center gap-2">
                    <div className="h-5 px-2 bg-white/20 backdrop-blur-md rounded-md flex items-center gap-1 text-[10px] font-bold">
                      <Sparkles className="w-2.5 h-2.5 text-amber-300" /> Rivera Design Studio
                    </div>
                    <span className="text-[9px] text-white/80 font-mono">Custom Logo Uploaded</span>
                  </div>
                  <span className="text-[9px] bg-white/20 px-2 py-0.5 rounded-full font-bold">
                    Executive Proposal
                  </span>
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-white mb-0.5 drop-shadow-sm">
                  SaaS Dashboard Redesign & Design System
                </h4>
                <div className="flex items-center justify-between text-[10px] text-white/90 pt-1">
                  <span>Prepared for <strong>Rahul Sharma · Acme Tech</strong></span>
                  <span className="font-bold">₹45,000 · 5 Weeks</span>
                </div>
              </div>
            </div>

            {/* Mini Controls Preview */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="bg-[#f4f4f2] p-2 rounded-xl border border-[#e5e5eb]">
                <span className="text-[10px] text-[#6b6b7a] block font-semibold mb-1">Brand Gradient</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 shadow-xs shrink-0" />
                  <span className="text-[11px] font-medium text-[#0f0f12] truncate">Royal Violet (135°)</span>
                </div>
              </div>

              <div className="bg-[#f4f4f2] p-2 rounded-xl border border-[#e5e5eb]">
                <span className="text-[10px] text-[#6b6b7a] block font-semibold mb-1">Active Template</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#f59e0b] shrink-0" />
                  <span className="text-[11px] font-medium text-[#0f0f12] truncate">Executive Onyx</span>
                </div>
              </div>

              <div className="bg-[#f4f4f2] p-2 rounded-xl border border-[#e5e5eb]">
                <span className="text-[10px] text-[#6b6b7a] block font-semibold mb-1">Watermark</span>
                <div className="flex items-center gap-1 text-[11px] font-semibold text-[#059669]">
                  <Check className="w-3 h-3 shrink-0" /> 100% White-Label
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 pb-4">
          {[0, 1, 2, 3].map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => setStage(i)}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                stage === i ? "w-5 bg-[#7c3aed]" : "w-1.5 bg-[#e5e5eb] hover:bg-[#d0d0d8]"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[#e5e5eb] py-4">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between gap-4 text-left">
        <span className="font-medium text-[#0f0f12]">{q}</span>
        <ChevronDown className={`w-4 h-4 text-[#6b6b7a] shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <p className="mt-3 text-sm text-[#6b6b7a] leading-relaxed">{a}</p>}
    </div>
  );
}

export default function Landing() {
  return (
    <div className="bg-[#fafaf8] text-[#0f0f12] min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 bg-[#7c3aed]/8 text-[#7c3aed] text-xs font-semibold px-3 py-1.5 rounded-full mb-6 border border-[#7c3aed]/20">
            <Sparkles className="w-3.5 h-3.5" />
            Built for freelancers, designers, developers and creative professionals
          </div>
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl text-[#0f0f12] leading-[1.05] mb-6">
            Turn client briefs<br />
            <em className="text-[#7c3aed] not-italic">into winning proposals.</em>
          </h1>
          <p className="text-lg text-[#6b6b7a] leading-relaxed max-w-2xl mx-auto mb-10">
            Paste a client message, job description, or project brief and let AI create a personalized proposal with scope, pricing, timeline and next steps.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/signup" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#7c3aed] text-white font-semibold px-6 py-3.5 rounded-xl hover:bg-[#6d28d9] transition-colors">
              Create Your First Proposal
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="#how-it-works" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-[#0f0f12] font-semibold px-6 py-3.5 rounded-xl border border-[#e5e5eb] hover:border-[#d0d0d8] transition-colors">
              See How It Works
            </a>
          </div>
        </div>
        <ProductMockup />
      </section>

      {/* Problem */}
      <section className="py-20 px-6 bg-white border-y border-[#e5e5eb]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold text-[#0f0f12] mb-4">Freelance proposals take too much time.</h2>
            <p className="text-[#6b6b7a] max-w-xl mx-auto">The problem isn't that you can't write a great proposal. It's that you have to write it from scratch every single time.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: "Starting from zero", desc: "Every proposal begins with a blank page. Even for similar projects you've done dozens of times." },
              { title: "Rewriting the same thing", desc: "You keep rewriting scope, timelines and payment terms that are largely the same across clients." },
              { title: "Selling your value", desc: "Knowing what to say—and how to say it convincingly—is harder than doing the actual work." },
            ].map(({ title, desc }) => (
              <div key={title} className="bg-[#f4f4f2] rounded-2xl p-6 border border-[#e5e5eb]">
                <div className="w-8 h-8 rounded-lg bg-[#e5e5eb] mb-4 flex items-center justify-center">
                  <X className="w-4 h-4 text-[#6b6b7a]" />
                </div>
                <h3 className="font-semibold text-[#0f0f12] mb-2">{title}</h3>
                <p className="text-sm text-[#6b6b7a] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-[#0f0f12] font-medium mt-10">
            ProposalAI handles the repetitive work so you can focus on winning the project.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold text-[#0f0f12] mb-3">From brief to proposal in minutes</h2>
            <p className="text-[#6b6b7a]">Three steps. No prompt engineering required.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 relative">
            {STEPS.map(({ num, title, desc }) => (
              <div key={num} className="relative">
                <div className="text-5xl font-display text-[#e5e5eb] mb-4">{num}</div>
                <h3 className="font-semibold text-[#0f0f12] text-lg mb-2">{title}</h3>
                <p className="text-sm text-[#6b6b7a] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6 bg-white border-y border-[#e5e5eb]">
        <div className="max-w-5xl mx-auto space-y-16">
          <div>
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-1.5 bg-[#7c3aed]/10 text-[#7c3aed] text-xs font-bold px-3 py-1 rounded-full mb-3">
                <Sparkles className="w-3.5 h-3.5" /> Complete Proposal Platform
              </div>
              <h2 className="text-3xl font-semibold text-[#0f0f12] mb-3">Everything you need to close the project</h2>
              <p className="text-[#6b6b7a] max-w-lg mx-auto">A complete system for the full proposal lifecycle—from brief to acceptance and custom visual branding.</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {FEATURES.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="bg-[#f4f4f2] rounded-2xl p-5 border border-[#e5e5eb] hover:border-[#7c3aed]/30 transition-all hover:shadow-md group">
                  <div className="w-10 h-10 rounded-xl bg-[#7c3aed]/10 flex items-center justify-center mb-3 group-hover:bg-[#7c3aed]/20 group-hover:scale-105 transition-all">
                    <Icon className="w-5 h-5 text-[#7c3aed]" />
                  </div>
                  <h3 className="font-semibold text-[#0f0f12] text-sm mb-1.5">{title}</h3>
                  <p className="text-xs text-[#6b6b7a] leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Pro Visual Studio & Template Showcase */}
          <div className="bg-[#fafaf8] border border-[#e5e5eb] rounded-3xl p-8 lg:p-12">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-10">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#7c3aed] bg-[#7c3aed]/10 px-3 py-1 rounded-full">
                  PRO VISUAL CUSTOMIZER
                </span>
                <h3 className="text-2xl lg:text-3xl font-bold text-[#0f0f12] mt-3">
                  Upload your logo. Custom gradients. 4 designer themes.
                </h3>
                <p className="text-sm text-[#6b6b7a] mt-2 max-w-xl">
                  Impress high-ticket clients with tailored proposals that match your studio identity. Seamlessly upload logos, tweak angle directions on dynamic gradients, and remove all watermarks.
                </p>
              </div>
              <Link
                to="/checkout?plan=pro"
                className="bg-[#7c3aed] text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-[#6d28d9] transition-colors shrink-0 shadow-md shadow-[#7c3aed]/20"
              >
                Try Pro Branding
              </Link>
            </div>

            {/* 4 Template Design Showcase Cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {PRO_TEMPLATE_PREVIEWS.map((tpl) => (
                <div key={tpl.id} className="bg-white rounded-2xl border border-[#e5e5eb] overflow-hidden shadow-sm hover:shadow-lg transition-all group flex flex-col justify-between">
                  <div
                    className="p-4 text-white relative transition-transform group-hover:scale-[1.02]"
                    style={{ background: tpl.gradient }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-6 h-6 rounded bg-white/20 backdrop-blur-md flex items-center justify-center text-[10px] font-bold">
                        AI
                      </div>
                      <span className="text-[9px] uppercase font-bold bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full">
                        {tpl.badge}
                      </span>
                    </div>
                    <p className="font-bold text-xs tracking-tight">{tpl.name}</p>
                    <p className="text-[10px] opacity-80 mt-0.5">Custom Header & Gradient</p>
                  </div>
                  <div className="p-4 bg-white flex-1 flex flex-col justify-between">
                    <p className="text-xs text-[#6b6b7a] leading-relaxed mb-3">{tpl.desc}</p>
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#059669] pt-2 border-t border-[#f0f0ee]">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Pro Unlocked
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Feature Highlights Ribbon */}
            <div className="grid sm:grid-cols-3 gap-4 mt-8 pt-8 border-t border-[#e5e5eb] text-xs text-[#0f0f12]">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-[#7c3aed] flex items-center justify-center shrink-0 font-bold">
                  <Image className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold">Your Custom Logo</p>
                  <p className="text-[#6b6b7a] text-[11px] mt-0.5">Upload SVG, transparent PNG or JPG with instant preview.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 font-bold">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold">Multi-Stop Gradients & Angles</p>
                  <p className="text-[#6b6b7a] text-[11px] mt-0.5">Custom 0°-360° gradient sliders and 8 curated brand presets.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 font-bold">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold">100% White-Label</p>
                  <p className="text-[#6b6b7a] text-[11px] mt-0.5">Toggle off the watermark on client links and PDF downloads.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold text-[#0f0f12] mb-2">Used by freelancers who bill for results</h2>
            <p className="text-xs text-[#6b6b7a]">Demo testimonials—illustrative only</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({ quote, name, role, avatar }) => (
              <div key={name} className="bg-white rounded-2xl p-6 border border-[#e5e5eb] shadow-sm">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-[#f59e0b] text-[#f59e0b]" />)}
                </div>
                <p className="text-sm text-[#0f0f12] leading-relaxed mb-5">"{quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#7c3aed]/15 flex items-center justify-center">
                    <span className="text-xs font-semibold text-[#7c3aed]">{avatar}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#0f0f12]">{name}</p>
                    <p className="text-xs text-[#6b6b7a]">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6 bg-white border-y border-[#e5e5eb]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold text-[#0f0f12] mb-3">Simple, honest pricing</h2>
            <p className="text-[#6b6b7a]">Start free. Upgrade to Pro for custom branding, logo uploads, and 4 designer themes.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                plan: "Free",
                price: "₹0",
                period: "/month",
                desc: "For freelancers just exploring AI proposals.",
                features: [
                  "3 AI proposals/month",
                  "Standard Minimal template",
                  "PDF export",
                  "Shareable proposal links",
                  "Standard editor & tracking",
                ],
                cta: "Start Free",
                href: "/signup",
                highlight: false,
              },
              {
                plan: "Pro",
                price: "₹49",
                period: "/month",
                desc: "For active freelancers & designers winning clients.",
                features: [
                  "30 AI proposals/month",
                  "Upload custom business logo",
                  "Custom gradient color builder & presets",
                  "4 Pro template designs (Luxury, Tech, Creative, Minimal)",
                  "100% White-label (Hide 'Created with ProposalAI')",
                  "AI pricing assistant & scope analyzer",
                  "Proposal analytics & client view tracking",
                  "Priority customer support",
                ],
                cta: "Start Pro",
                href: "/checkout?plan=pro",
                highlight: true,
                badge: "Most Popular",
              },
              {
                plan: "Studio",
                price: "₹99",
                period: "/month",
                desc: "For design studios & agencies scaling client work.",
                features: [
                  "Unlimited AI proposals",
                  "All Pro branding & templates included",
                  "Multiple client brands & workspaces",
                  "Team members (up to 5 seats)",
                  "Custom bespoke proposal templates",
                  "Advanced AI tone & styling controls",
                  "Dedicated account manager & SLA",
                ],
                cta: "Start Studio",
                href: "/checkout?plan=studio",
                highlight: false,
              },
            ].map(({ plan, price, period, desc, features, cta, href, highlight, badge }) => (
              <div key={plan} className={`rounded-3xl p-7 border flex flex-col justify-between ${highlight ? "border-[#7c3aed] bg-[#7c3aed]/5 shadow-xl shadow-[#7c3aed]/10 relative ring-2 ring-[#7c3aed]/20" : "border-[#e5e5eb] bg-[#f4f4f2]"}`}>
                {badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#7c3aed] text-white text-xs font-bold px-3.5 py-1 rounded-full shadow-md">
                    {badge}
                  </div>
                )}
                <div>
                  <p className="font-bold text-[#0f0f12] text-lg mb-1">{plan}</p>
                  <p className="text-xs text-[#6b6b7a] mb-4 min-h-[32px]">{desc}</p>
                  <div className="flex items-baseline gap-0.5 mb-6 pb-4 border-b border-[#e5e5eb]">
                    <span className="text-4xl font-extrabold text-[#0f0f12]">{price}</span>
                    <span className="text-sm text-[#6b6b7a]">{period}</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-xs text-[#0f0f12] font-medium leading-tight">
                        <Check className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Link
                  to={href}
                  className={`block text-center py-3 rounded-xl font-bold text-sm transition-all shadow-sm ${
                    highlight
                      ? "bg-[#7c3aed] text-white hover:bg-[#6d28d9] shadow-[#7c3aed]/20"
                      : "bg-white text-[#0f0f12] border border-[#e5e5eb] hover:border-[#d0d0d8] hover:bg-muted"
                  }`}
                >
                  {cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-semibold text-[#0f0f12] mb-10 text-center">Frequently asked questions</h2>
          {FAQS.map(({ q, a }) => <FAQItem key={q} q={q} a={a} />)}
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 bg-[#0f0f12]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-4xl sm:text-5xl text-white mb-4">
            Your next proposal<br />shouldn't take an hour.
          </h2>
          <p className="text-[#a0a0b0] text-lg mb-10">
            Turn the brief into a proposal and get back to the work that actually matters.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 bg-[#7c3aed] text-white font-semibold px-8 py-4 rounded-xl hover:bg-[#6d28d9] transition-colors text-lg"
          >
            Create Your First Proposal
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-[#6b6b7a] text-sm mt-4">Free to start. No credit card required.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0f0f12] border-t border-white/10 px-6 py-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#7c3aed] flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-white text-sm">ProposalAI</span>
          </div>
          <div className="flex gap-6 text-xs text-[#6b6b7a]">
            <Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <Link to="/login" className="hover:text-white transition-colors">Log in</Link>
            <span>© 2026 ProposalAI</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
