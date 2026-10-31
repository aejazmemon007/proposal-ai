import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutTemplate, Lock, ArrowRight, Search, Sparkles, Eye, Check,
  Award, Code2, HeartHandshake, Palette, ShieldCheck, X
} from "lucide-react";
import { useApp } from "../lib/store";
import { PRO_TEMPLATE_DESIGNS } from "../types";
import type { ProposalTemplateDesign } from "../types";

export default function Templates() {
  const { user } = useApp();
  const navigate = useNavigate();
  const [selectedTemplateForPreview, setSelectedTemplateForPreview] = useState<ProposalTemplateDesign | null>(null);

  const isPro = user?.subscription === "pro" || user?.subscription === "studio";

  const handleUseTemplate = (t: ProposalTemplateDesign) => {
    if (t.isPro && !isPro) {
      navigate("/checkout?plan=pro");
      return;
    }
    navigate(`/proposals/new?template=${t.id}`);
  };

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
              Pro Design System
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Proposal Template Designs</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-xl">
            Select high-converting, tailored visual templates designed for high-ticket closing, digital products, software specs, and creative agencies.
          </p>
        </div>

        {!isPro && (
          <button
            onClick={() => navigate("/checkout?plan=pro")}
            className="flex items-center gap-2 bg-gradient-to-r from-primary to-violet-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg shadow-primary/20 hover:opacity-95 transition-opacity shrink-0"
          >
            <Sparkles className="w-4 h-4" /> Unlock All 4 Pro Templates
          </button>
        )}
      </div>

      {/* 4 Core Pro Templates Showcase */}
      <div className="grid md:grid-cols-2 gap-6 mb-12">
        {PRO_TEMPLATE_DESIGNS.map((t) => {
          const locked = t.isPro && !isPro;

          return (
            <div
              key={t.id}
              className={`bg-card border-2 rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-xl group flex flex-col justify-between ${
                locked ? "border-border opacity-95" : "border-border hover:border-primary/40"
              }`}
            >
              <div>
                {/* Visual Header Banner */}
                <div className={`p-6 bg-gradient-to-r ${t.previewGradient} text-white relative overflow-hidden`}>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-bold tracking-wider uppercase bg-black/30 backdrop-blur-md px-3 py-1 rounded-full text-white/90 border border-white/10">
                      {t.category}
                    </span>
                    {t.isPro ? (
                      <span className="text-[10px] font-extrabold bg-amber-400 text-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                        <Sparkles className="w-3 h-3 fill-black" /> PRO TEMPLATE
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold bg-white/20 text-white px-2.5 py-0.5 rounded-full">
                        STANDARD
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-white mb-1.5">{t.name}</h3>
                  <p className="text-xs text-white/80 line-clamp-1">{t.tagline}</p>
                </div>

                {/* Description & Features */}
                <div className="p-6">
                  <p className="text-xs text-muted-foreground leading-relaxed mb-5">
                    {t.description}
                  </p>

                  <div className="mb-6">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-foreground mb-2.5">
                      Key Highlights
                    </p>
                    <ul className="grid grid-cols-2 gap-2">
                      {t.features.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Check className="w-3.5 h-3.5 text-success shrink-0" />
                          <span className="truncate">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Action bar */}
              <div className="p-6 pt-0 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedTemplateForPreview(t)}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-muted hover:bg-muted/80 text-foreground py-2.5 rounded-xl text-xs font-semibold border border-border transition-colors"
                >
                  <Eye className="w-3.5 h-3.5 text-muted-foreground" /> Quick Preview
                </button>

                {locked ? (
                  <button
                    type="button"
                    onClick={() => navigate("/checkout?plan=pro")}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-primary/10 hover:bg-primary/20 text-primary py-2.5 rounded-xl text-xs font-bold transition-colors"
                  >
                    <Lock className="w-3.5 h-3.5" /> Upgrade to Pro
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleUseTemplate(t)}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-primary/20 transition-all"
                  >
                    Use Template <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pro Features Banner */}
      <div className="bg-gradient-to-r from-violet-950/60 via-purple-900/40 to-slate-950 p-8 rounded-3xl border border-primary/20 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">Need Custom Client Branding?</h2>
          </div>
          <p className="text-xs text-slate-300 max-w-lg leading-relaxed">
            On the Pro and Studio plans, you can also inject your studio logo, custom primary colors, and remove all ProposalAI watermarks from shared public proposals.
          </p>
        </div>

        <button
          onClick={() => navigate(isPro ? "/proposals/new" : "/checkout?plan=pro")}
          className="bg-white text-slate-900 px-6 py-3 rounded-xl font-bold text-xs hover:bg-slate-100 transition-colors shadow-lg shadow-black/20 shrink-0"
        >
          {isPro ? "Create New Proposal" : "Upgrade to Pro — ₹49/mo"}
        </button>
      </div>

      {/* Quick Preview Modal */}
      {selectedTemplateForPreview && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-card border border-border rounded-3xl max-w-2xl w-full p-6 lg:p-8 shadow-2xl animate-slide-up relative my-8">
            <button
              onClick={() => setSelectedTemplateForPreview(null)}
              className="absolute right-5 top-5 p-2 rounded-full hover:bg-muted text-muted-foreground"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-6">
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                {selectedTemplateForPreview.category}
              </span>
              <h2 className="text-2xl font-bold text-foreground mt-2">{selectedTemplateForPreview.name}</h2>
              <p className="text-xs text-muted-foreground mt-1">{selectedTemplateForPreview.tagline}</p>
            </div>

            {/* Template Visual Mockup */}
            <div className="border border-border rounded-2xl overflow-hidden shadow-inner mb-6">
              <div className={`p-6 bg-gradient-to-r ${selectedTemplateForPreview.previewGradient} text-white`}>
                <div className="flex items-center justify-between text-xs mb-4 opacity-80">
                  <span>Rivera Design Studio</span>
                  <span>CONFIDENTIAL PROPOSAL</span>
                </div>
                <h4 className="text-xl font-bold mb-1">SaaS Dashboard Redesign</h4>
                <p className="text-xs opacity-80">Prepared for Acme Technologies</p>
                <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/20 text-[11px]">
                  <div><span className="opacity-70 block">Date</span>Sep 10, 2026</div>
                  <div><span className="opacity-70 block">Investment</span>₹45,000</div>
                  <div><span className="opacity-70 block">Timeline</span>5 Weeks</div>
                </div>
              </div>
              <div className="p-5 bg-card space-y-3 text-xs">
                <div className="h-3 w-1/3 bg-muted rounded" />
                <div className="h-2 w-full bg-muted/60 rounded" />
                <div className="h-2 w-5/6 bg-muted/60 rounded" />
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div className="p-2.5 bg-muted/40 rounded border border-border">✓ UX Audit & Architecture</div>
                  <div className="p-2.5 bg-muted/40 rounded border border-border">✓ High-Fidelity UI Screens</div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <button
                onClick={() => setSelectedTemplateForPreview(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const t = selectedTemplateForPreview;
                  setSelectedTemplateForPreview(null);
                  handleUseTemplate(t);
                }}
                className="bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-primary/20 hover:bg-primary/90 transition-colors"
              >
                {selectedTemplateForPreview.isPro && !isPro ? "Upgrade to Use (₹49/mo)" : "Select & Create Proposal"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
