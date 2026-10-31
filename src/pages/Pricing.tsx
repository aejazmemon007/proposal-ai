import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, Sparkles, ArrowLeft } from "lucide-react";

const PLANS = [
  {
    id: "free",
    name: "Free",
    monthlyPrice: 0,
    desc: "For freelancers just getting started.",
    features: [
      "3 AI proposals per month",
      "Basic templates",
      "PDF export",
      "Shareable proposal links",
      "Basic editor",
      "Proposal tracking",
    ],
    notIncluded: ["AI pricing assistant", "Custom branding", "Remove ProposalAI branding", "Analytics", "Team members"],
    cta: "Start Free",
    highlight: false,
    badge: null,
  },
  {
    id: "pro",
    name: "Pro",
    monthlyPrice: 49,
    desc: "For active freelancers & designers winning high-ticket projects.",
    features: [
      "30 AI proposals per month",
      "Upload custom business logo (SVG/PNG/JPG)",
      "Custom gradient color builder & preset themes",
      "4 Pro template designs (Luxury, Tech, Creative, Minimal)",
      "100% White-label (Hide 'Created with ProposalAI')",
      "AI pricing assistant & scope analyzer",
      "AI text rewrite & tone adjuster",
      "Proposal view tracking & client analytics",
      "Priority email & chat support",
    ],
    notIncluded: ["Unlimited proposals", "Team members", "Multiple workspaces"],
    cta: "Start Pro",
    highlight: true,
    badge: "Most Popular",
  },
  {
    id: "studio",
    name: "Studio",
    monthlyPrice: 99,
    desc: "For agencies and design studios with multiple team members.",
    features: [
      "Unlimited AI proposals",
      "All Pro branding & visual studio features",
      "Multiple client brands & workspaces",
      "Team members (up to 5 seats)",
      "Custom bespoke proposal templates",
      "Advanced AI tone & styling controls",
      "Dedicated account manager & SLA",
      "Priority 24/7 VIP support",
    ],
    notIncluded: [],
    cta: "Start Studio",
    highlight: false,
    badge: null,
  },
];

export default function Pricing() {
  const [annual, setAnnual] = useState(false);

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      {/* Header */}
      <div className="px-6 py-5 border-b border-[#e5e5eb] flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#7c3aed] flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-[#0f0f12] text-[15px]">ProposalAI</span>
        </Link>
        <span className="text-[#e5e5eb]">·</span>
        <Link to="/" className="flex items-center gap-1.5 text-sm text-[#6b6b7a] hover:text-[#0f0f12] transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </Link>
        <div className="ml-auto flex gap-3">
          <Link to="/login" className="text-sm font-medium text-[#0f0f12] hover:text-[#7c3aed] px-3 py-2">Log in</Link>
          <Link to="/signup" className="bg-[#7c3aed] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#6d28d9] transition-colors">Get Started</Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-semibold text-[#0f0f12] mb-3">Simple, honest pricing</h1>
          <p className="text-[#6b6b7a] text-lg mb-7">Start free. Upgrade when you're winning more projects.</p>
          <div className="inline-flex items-center bg-[#f4f4f2] p-1 rounded-xl border border-[#e5e5eb]">
            <button onClick={() => setAnnual(false)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${!annual ? "bg-white text-[#0f0f12] shadow-sm" : "text-[#6b6b7a]"}`}>
              Monthly
            </button>
            <button onClick={() => setAnnual(true)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${annual ? "bg-white text-[#0f0f12] shadow-sm" : "text-[#6b6b7a]"}`}>
              Annual <span className="text-xs text-[#059669] font-semibold ml-1">-20%</span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {PLANS.map((plan) => {
            const price = annual ? Math.round(plan.monthlyPrice * 0.8) : plan.monthlyPrice;
            return (
              <div key={plan.id} className={`rounded-2xl border p-7 relative ${plan.highlight ? "border-[#7c3aed] bg-[#7c3aed]/4 shadow-lg shadow-[#7c3aed]/10" : "border-[#e5e5eb] bg-white"}`}>
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#7c3aed] text-white text-xs font-bold px-3 py-1 rounded-full">
                    {plan.badge}
                  </div>
                )}
                <div className="mb-6">
                  <h2 className="text-base font-semibold text-[#0f0f12] mb-1">{plan.name}</h2>
                  <p className="text-xs text-[#6b6b7a] mb-4">{plan.desc}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-[#0f0f12]">₹{price.toLocaleString()}</span>
                    {price > 0 && <span className="text-sm text-[#6b6b7a]">/month</span>}
                  </div>
                  {annual && price > 0 && <p className="text-xs text-[#059669] mt-1">₹{(plan.monthlyPrice - price).toLocaleString()} saved per month</p>}
                </div>

                <Link
                  to={plan.id === "free" ? "/signup" : `/checkout?plan=${plan.id}&billing=${annual ? "annual" : "monthly"}`}
                  className={`block text-center py-3 rounded-xl font-semibold text-sm transition-colors mb-6 ${
                    plan.highlight
                      ? "bg-[#7c3aed] text-white hover:bg-[#6d28d9] shadow-md shadow-[#7c3aed]/20"
                      : "border border-[#e5e5eb] text-[#0f0f12] hover:bg-[#f4f4f2]"
                  }`}
                >
                  {plan.cta}
                </Link>

                <ul className="space-y-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-[#0f0f12]">
                      <Check className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                  {plan.notIncluded.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-[#b0b0be] line-through">
                      <div className="w-4 h-4 shrink-0 mt-0.5 flex items-center justify-center">
                        <div className="w-3 h-px bg-[#d0d0da]" />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Comparison note */}
        <div className="mt-12 text-center">
          <p className="text-sm text-[#6b6b7a] mb-6">All plans include: Proposal preview, shareable links, client acceptance, basic analytics, PDF export.</p>
          <div className="grid sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
            {[
              ["Free to start", "No credit card required. 3 AI proposals immediately."],
              ["Cancel anytime", "No lock-in. Downgrade or cancel at any time."],
              ["Secure & private", "Your proposals and client data are never shared."],
            ].map(([title, desc]) => (
              <div key={title} className="text-left">
                <p className="text-sm font-semibold text-[#0f0f12] mb-1">{title}</p>
                <p className="text-xs text-[#6b6b7a]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
