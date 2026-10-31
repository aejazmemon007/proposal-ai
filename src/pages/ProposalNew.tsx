import { useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowRight, ArrowLeft, Check, Sparkles, Plus, Trash, GripVertical, X,
  AlertCircle, ChevronDown, Zap, Lock,
} from "lucide-react";
import { useApp } from "../lib/store";
import { analyzeBrief, suggestPricing, generateProposal } from "../lib/mockAI";
import type { ScopeItem, Milestone, BriefAnalysis, PricingSuggestion, ProposalStyle, TemplateDesignId } from "../types";
import { CURRENCY_SYMBOLS, CURRENCIES, USAGE_LIMITS, PRO_TEMPLATE_DESIGNS } from "../types";

const STEPS = ["Client", "Brief", "Scope", "Pricing", "Style", "Generate"];

const PROJECT_TYPES = ["UI/UX Design", "Web Design", "Web Development", "Mobile App", "Brand Identity", "Graphic Design", "Marketing", "Copywriting", "Consulting", "Other"];
const STYLES: { id: ProposalStyle; label: string; desc: string }[] = [
  { id: "professional", label: "Professional", desc: "Clear, structured, business-focused" },
  { id: "friendly", label: "Friendly", desc: "Warm, approachable, conversational" },
  { id: "premium", label: "Premium", desc: "Elevated, confident, executive tone" },
  { id: "minimal", label: "Minimal", desc: "Concise, stripped back, no fluff" },
  { id: "persuasive", label: "Persuasive", desc: "Sales-oriented, benefit-focused" },
];

function StepIndicator({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {STEPS.map((label, i) => (
        <div key={label} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
              i < step ? "bg-primary text-white" : i === step ? "bg-primary/15 text-primary border-2 border-primary" : "bg-muted text-muted-foreground border border-border"
            }`}>
              {i < step ? <Check className="w-4 h-4" /> : i + 1}
            </div>
            <span className={`text-[10px] mt-1 font-medium hidden sm:block ${i === step ? "text-primary" : "text-muted-foreground"}`}>{label}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`flex-1 h-px mx-2 transition-colors ${i < step ? "bg-primary" : "bg-border"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

function SliderControl({ label, value, onChange, leftLabel, rightLabel }: {
  label: string; value: number; onChange: (v: number) => void;
  leftLabel: string; rightLabel: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-2">{label}</label>
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground w-16 text-right">{leftLabel}</span>
        <input
          type="range" min={0} max={100} value={value} onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 h-1.5 rounded-full bg-border accent-primary cursor-pointer"
        />
        <span className="text-xs text-muted-foreground w-16">{rightLabel}</span>
      </div>
    </div>
  );
}

export default function ProposalNew() {
  const { user, createProposal, updateProposal, incrementUsage, clients, createClient } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const isPro = user?.subscription === "pro" || user?.subscription === "studio";
  const initialTemplateParam = (searchParams.get("template") as TemplateDesignId) || "modern-minimal";
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateDesignId>(initialTemplateParam);

  const [step, setStep] = useState(0);
  const [proposalId, setProposalId] = useState<string | null>(null);

  // Step 1: Client
  const [clientMode, setClientMode] = useState<"new" | "existing">("new");
  const [selectedClientId, setSelectedClientId] = useState("");
  const [clientName, setClientName] = useState("");
  const [company, setCompany] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientWebsite, setClientWebsite] = useState("");
  const [projectName, setProjectName] = useState("");
  const [projectType, setProjectType] = useState("UI/UX Design");
  const [notes, setNotes] = useState("");

  // Step 2: Brief
  const [brief, setBrief] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<BriefAnalysis | null>(null);

  // Step 3: Scope
  const [scopeItems, setScopeItems] = useState<ScopeItem[]>([]);
  const [showAddScope, setShowAddScope] = useState(false);
  const [newScopeTitle, setNewScopeTitle] = useState("");
  const [newScopeDesc, setNewScopeDesc] = useState("");

  // Step 4: Pricing
  const [pricingModel, setPricingModel] = useState<"fixed" | "hourly" | "milestone">("fixed");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState(user?.currency || "INR");
  const [hourlyRate, setHourlyRate] = useState("");
  const [estimatedHours, setEstimatedHours] = useState("");
  const [paymentSchedule, setPaymentSchedule] = useState("50% upfront, 50% on delivery");
  const [milestones, setMilestones] = useState<Milestone[]>([
    { id: "m1", title: "Discovery", description: "", amount: 0, dueWeek: 1 },
    { id: "m2", title: "Design", description: "", amount: 0, dueWeek: 3 },
    { id: "m3", title: "Delivery", description: "", amount: 0, dueWeek: 5 },
  ]);
  const [pricingSuggestion, setPricingSuggestion] = useState<PricingSuggestion | null>(null);
  const [suggestingPrice, setSuggestingPrice] = useState(false);

  // Step 5: Style
  const [style, setStyle] = useState<ProposalStyle>("professional");
  const [tone, setTone] = useState(40);
  const [length, setLength] = useState(60);
  const [salesFocus, setSalesFocus] = useState(50);

  // Step 6: Generate
  const [generating, setGenerating] = useState(false);
  const [genStep, setGenStep] = useState(0);
  const [genLabel, setGenLabel] = useState("");
  const [genComplete, setGenComplete] = useState(false);

  const sym = CURRENCY_SYMBOLS[currency] || "₹";
  const totalPrice = pricingModel === "fixed" ? Number(price) || 0
    : pricingModel === "hourly" ? (Number(hourlyRate) * Number(estimatedHours)) || 0
    : milestones.reduce((s, m) => s + m.amount, 0);

  const canProceedStep1 = clientMode === "new" ? (clientName.trim() && projectName.trim()) : (selectedClientId && projectName.trim());
  const canProceedStep2 = brief.trim().length > 20;
  const canProceedStep3 = scopeItems.some((s) => s.included);
  const canProceedStep4 = totalPrice > 0;

  const handleAnalyzeBrief = async () => {
    if (!brief.trim()) return;
    setAnalyzing(true);
    try {
      const result = await analyzeBrief(brief);
      setAnalysis(result);
      const items: ScopeItem[] = result.suggested_scope.map((title, i) => ({
        id: `scope-${i}`, title,
        description: `Comprehensive ${title.toLowerCase()} aligned with project requirements`,
        included: true,
      }));
      setScopeItems(items);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSuggestPricing = async () => {
    setSuggestingPrice(true);
    try {
      const result = await suggestPricing({
        scopeItems, complexity: analysis?.complexity || "Medium",
        timeline: analysis?.timeline || "4-6 weeks",
        profession: user?.profession || "Designer",
        experience: user?.experience || "3-5 years",
        currency,
      });
      setPricingSuggestion(result);
    } finally {
      setSuggestingPrice(false);
    }
  };

  const handleGenerate = async () => {
    const usageLimit = USAGE_LIMITS[user?.subscription || "free"];
    if (user && user.usageThisMonth >= usageLimit) {
      navigate("/settings/billing");
      return;
    }

    setGenerating(true);
    const clientData = clientMode === "existing" && selectedClientId
      ? clients.find((c) => c.id === selectedClientId)
      : null;

    const finalClientName = clientData?.name || clientName;
    const finalCompany = clientData?.company || company;

    let pid = proposalId;
    if (!pid) {
      const p = createProposal({
        clientName: finalClientName, company: finalCompany, clientEmail,
        projectName, projectType, brief, scopeItems, pricingModel,
        price: totalPrice, currency, paymentSchedule, style, tone, length, salesFocus, status: "draft",
        templateId: selectedTemplate,
        logoUrl: user?.logoUrl,
        colorMode: user?.colorMode,
        primaryColor: user?.primaryColor,
        gradientFrom: user?.gradientFrom,
        gradientTo: user?.gradientTo,
        gradientAngle: user?.gradientAngle,
        hideWatermark: user?.hideWatermark,
      });
      pid = p.id;
      setProposalId(pid);
    }

    try {
      const content = await generateProposal(
        { clientName: finalClientName, company: finalCompany, projectName, projectType, brief, scopeItems, price: totalPrice, currency, pricingModel, style, analysis: analysis || undefined },
        (s, label) => { setGenStep(s); setGenLabel(label); }
      );
      updateProposal(pid, { content, status: "draft" });
      incrementUsage();
      setGenComplete(true);
      setTimeout(() => navigate(`/proposals/${pid}`), 1500);
    } catch {
      setGenerating(false);
    }
  };

  const addScopeItem = () => {
    if (!newScopeTitle.trim()) return;
    setScopeItems((prev) => [...prev, {
      id: `custom-${Date.now()}`, title: newScopeTitle, description: newScopeDesc, included: true,
    }]);
    setNewScopeTitle(""); setNewScopeDesc(""); setShowAddScope(false);
  };

  const inputClass = "w-full bg-muted border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-primary transition-colors";

  return (
    <div className="min-h-full bg-background">
      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-foreground">New Proposal</h1>
          <p className="text-sm text-muted-foreground mt-1">Follow the steps to create a professional, AI-powered proposal.</p>
        </div>

        <StepIndicator step={step} total={STEPS.length} />

        {/* Step 0: Client */}
        {step === 0 && (
          <div className="animate-slide-up">
            <h2 className="text-lg font-semibold text-foreground mb-5">Client & project information</h2>

            {clients.length > 0 && (
              <div className="flex gap-2 mb-5">
                {(["new", "existing"] as const).map((m) => (
                  <button key={m} onClick={() => setClientMode(m)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${clientMode === m ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground hover:text-foreground"}`}
                  >
                    {m === "new" ? "New client" : "Existing client"}
                  </button>
                ))}
              </div>
            )}

            {clientMode === "existing" ? (
              <div className="mb-5">
                <label className="block text-sm font-medium text-foreground mb-1.5">Select client</label>
                <div className="relative">
                  <select value={selectedClientId} onChange={(e) => {
                    setSelectedClientId(e.target.value);
                    const c = clients.find((x) => x.id === e.target.value);
                    if (c) { setClientName(c.name); setCompany(c.company || ""); setClientEmail(c.email || ""); }
                  }} className={`${inputClass} appearance-none pr-9`}>
                    <option value="">Choose a client...</option>
                    {clients.map((c) => <option key={c.id} value={c.id}>{c.name}{c.company ? ` — ${c.company}` : ""}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Client name <span className="text-danger">*</span></label>
                  <input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="e.g. Rahul Sharma" className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Company</label>
                  <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="e.g. Acme Corp" className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
                  <input value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} type="email" placeholder="client@example.com" className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Website</label>
                  <input value={clientWebsite} onChange={(e) => setClientWebsite(e.target.value)} placeholder="https://clientsite.com" className={inputClass} />
                </div>
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4 mb-4 pt-4 border-t border-border">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Project name <span className="text-danger">*</span></label>
                <input value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="SaaS Dashboard Redesign" className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Project type</label>
                <div className="relative">
                  <select value={projectType} onChange={(e) => setProjectType(e.target.value)} className={`${inputClass} appearance-none pr-9`}>
                    {PROJECT_TYPES.map((t) => <option key={t}>{t}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Notes</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Any context about this client or project..." className={inputClass} />
            </div>

            <div className="flex justify-end mt-6">
              <button onClick={() => setStep(1)} disabled={!canProceedStep1}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50">
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 1: Brief */}
        {step === 1 && (
          <div className="animate-slide-up">
            <h2 className="text-lg font-semibold text-foreground mb-1">What did the client ask for?</h2>
            <p className="text-sm text-muted-foreground mb-5">Paste the client's message, email, Upwork description, meeting notes, or project brief.</p>
            <textarea
              value={brief} onChange={(e) => setBrief(e.target.value)} rows={8}
              placeholder={"Paste the client's message, email, Upwork description, meeting notes or project brief here...\n\nExample:\n\"We need a complete redesign of our SaaS dashboard. The current one is outdated and our users find it confusing. We have around 20 screens that need to be redesigned with better navigation and a modern look. Timeline is flexible but ideally 6 weeks.\""}
              className={`${inputClass} resize-none font-mono text-sm leading-relaxed`}
            />
            <div className="flex items-center justify-between mt-4">
              <p className="text-xs text-muted-foreground">{brief.length} characters</p>
              <button
                onClick={handleAnalyzeBrief} disabled={!canProceedStep2 || analyzing}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {analyzing ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analyzing...</>
                ) : (
                  <><Sparkles className="w-4 h-4" /> Analyze Brief</>
                )}
              </button>
            </div>

            {analysis && (
              <div className="mt-6 bg-primary/5 border border-primary/20 rounded-2xl p-5 animate-slide-up">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span className="text-sm font-semibold text-foreground">AI Analysis</span>
                  <span className={`ml-auto text-xs font-semibold px-2 py-0.5 rounded-full ${
                    analysis.complexity === "High" ? "bg-danger/10 text-danger"
                    : analysis.complexity === "Medium" ? "bg-warning/10 text-warning"
                    : "bg-success/10 text-success"
                  }`}>{analysis.complexity} Complexity</span>
                </div>
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Project type</p>
                    <p className="text-foreground font-medium">{analysis.project_type}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Timeline</p>
                    <p className="text-foreground font-medium">{analysis.timeline}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Client goals</p>
                    <ul className="space-y-1">
                      {analysis.client_goals.slice(0, 3).map((g) => (
                        <li key={g} className="flex items-start gap-1.5 text-foreground">
                          <Check className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" /> {g}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Missing info</p>
                    <ul className="space-y-1">
                      {analysis.missing_information.slice(0, 3).map((m) => (
                        <li key={m} className="flex items-start gap-1.5 text-muted-foreground">
                          <AlertCircle className="w-3.5 h-3.5 text-warning shrink-0 mt-0.5" /> {m}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between mt-6">
              <button onClick={() => setStep(0)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button onClick={() => setStep(2)} disabled={!canProceedStep2}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50">
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Scope */}
        {step === 2 && (
          <div className="animate-slide-up">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Scope of work</h2>
                <p className="text-sm text-muted-foreground mt-0.5">Check the deliverables to include in your proposal.</p>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              {scopeItems.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm border border-dashed border-border rounded-xl">
                  No scope items yet. Analyze the brief first or add items manually.
                </div>
              ) : scopeItems.map((item, i) => (
                <div key={item.id} className={`flex items-start gap-3 p-4 rounded-xl border transition-colors ${item.included ? "border-border bg-card" : "border-border/50 bg-muted opacity-60"}`}>
                  <button onClick={() => setScopeItems((p) => p.map((s, j) => j === i ? { ...s, included: !s.included } : s))}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${item.included ? "bg-primary border-primary" : "border-border"}`}>
                    {item.included && <Check className="w-3 h-3 text-white" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{item.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                  </div>
                  <button onClick={() => setScopeItems((p) => p.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-danger transition-colors shrink-0">
                    <Trash className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {showAddScope ? (
              <div className="border border-primary/30 bg-primary/5 rounded-xl p-4 mb-4">
                <p className="text-sm font-semibold text-foreground mb-3">Add deliverable</p>
                <input value={newScopeTitle} onChange={(e) => setNewScopeTitle(e.target.value)} placeholder="Deliverable name" className={`${inputClass} mb-2`} />
                <input value={newScopeDesc} onChange={(e) => setNewScopeDesc(e.target.value)} placeholder="Short description" className={`${inputClass} mb-3`} />
                <div className="flex gap-2">
                  <button onClick={addScopeItem} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium">Add</button>
                  <button onClick={() => setShowAddScope(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted">Cancel</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowAddScope(true)} className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground border border-dashed border-border rounded-xl px-4 py-3 w-full justify-center transition-colors hover:border-primary/50">
                <Plus className="w-4 h-4" /> Add Deliverable
              </button>
            )}

            <div className="flex justify-between mt-6">
              <button onClick={() => setStep(1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button onClick={() => setStep(3)} disabled={scopeItems.length === 0}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50">
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Pricing */}
        {step === 3 && (
          <div className="animate-slide-up">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Pricing</h2>
                <p className="text-sm text-muted-foreground mt-0.5">Set your price for this project.</p>
              </div>
              <button onClick={handleSuggestPricing} disabled={suggestingPrice}
                className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors disabled:opacity-50">
                {suggestingPrice ? <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Suggest Pricing
              </button>
            </div>

            {pricingSuggestion && (
              <div className="mb-5 bg-primary/5 border border-primary/20 rounded-2xl p-4 animate-slide-up">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">AI Pricing Suggestion</span>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  {[
                    { label: "Budget", value: pricingSuggestion.low, desc: "Low-end range" },
                    { label: "Recommended", value: pricingSuggestion.recommended, desc: "Mid-market" },
                    { label: "Premium", value: pricingSuggestion.premium, desc: "Top positioning" },
                  ].map(({ label, value, desc }) => (
                    <button key={label} onClick={() => { setPrice(String(value)); setPricingModel("fixed"); }}
                      className={`p-3 rounded-xl border text-left transition-colors ${Number(price) === value ? "border-primary bg-primary/10" : "border-border hover:border-primary/40"}`}>
                      <p className="text-xs text-muted-foreground">{label}</p>
                      <p className="text-base font-bold text-foreground">{sym}{value.toLocaleString()}</p>
                      <p className="text-[10px] text-muted-foreground">{desc}</p>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">{pricingSuggestion.reasoning}</p>
              </div>
            )}

            <div className="mb-5">
              <label className="block text-sm font-medium text-foreground mb-2">Currency</label>
              <div className="flex gap-2 flex-wrap">
                {CURRENCIES.map((c) => (
                  <button key={c} onClick={() => setCurrency(c)}
                    className={`px-3 py-1.5 rounded-lg border text-sm font-semibold transition-colors ${currency === c ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/50"}`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-sm font-medium text-foreground mb-2">Pricing model</label>
              <div className="flex gap-2">
                {(["fixed", "hourly", "milestone"] as const).map((m) => (
                  <button key={m} onClick={() => setPricingModel(m)}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium capitalize transition-colors ${pricingModel === m ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/50"}`}>
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {pricingModel === "fixed" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Project price ({sym})</label>
                  <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" placeholder="45000" className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Payment schedule</label>
                  <div className="space-y-2">
                    {["50% upfront, 50% on delivery", "100% upfront", "33% upfront, 33% midway, 33% delivery", "Custom"].map((s) => (
                      <button key={s} onClick={() => setPaymentSchedule(s)}
                        className={`w-full px-4 py-2.5 rounded-lg border text-sm text-left transition-colors ${paymentSchedule === s ? "border-primary bg-primary/10 text-primary" : "border-border text-foreground hover:border-primary/40"}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {pricingModel === "hourly" && (
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Hourly rate ({sym})</label>
                  <input value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} type="number" placeholder="1500" className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Estimated hours</label>
                  <input value={estimatedHours} onChange={(e) => setEstimatedHours(e.target.value)} type="number" placeholder="40" className={inputClass} />
                </div>
                {totalPrice > 0 && (
                  <div className="sm:col-span-2 bg-muted rounded-xl p-4">
                    <p className="text-sm text-muted-foreground">Estimated total</p>
                    <p className="text-xl font-bold text-foreground">{sym}{totalPrice.toLocaleString()}</p>
                  </div>
                )}
              </div>
            )}

            {pricingModel === "milestone" && (
              <div className="space-y-3">
                {milestones.map((m, i) => (
                  <div key={m.id} className="grid grid-cols-3 gap-3 items-start p-4 bg-muted rounded-xl border border-border">
                    <input value={m.title} onChange={(e) => setMilestones((p) => p.map((x, j) => j === i ? { ...x, title: e.target.value } : x))} placeholder="Milestone" className={`${inputClass} col-span-2`} />
                    <input value={m.amount || ""} onChange={(e) => setMilestones((p) => p.map((x, j) => j === i ? { ...x, amount: Number(e.target.value) } : x))} type="number" placeholder={`${sym}0`} className={inputClass} />
                  </div>
                ))}
                <button onClick={() => setMilestones((p) => [...p, { id: `m${Date.now()}`, title: "", description: "", amount: 0 }])}
                  className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground border border-dashed border-border rounded-xl px-4 py-3 w-full justify-center">
                  <Plus className="w-4 h-4" /> Add Milestone
                </button>
                {totalPrice > 0 && (
                  <div className="bg-muted rounded-xl p-4">
                    <p className="text-sm text-muted-foreground">Total project value</p>
                    <p className="text-xl font-bold text-foreground">{sym}{totalPrice.toLocaleString()}</p>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-between mt-6">
              <button onClick={() => setStep(2)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button onClick={() => setStep(4)} disabled={!canProceedStep4}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50">
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Style & Template */}
        {step === 4 && (
          <div className="animate-slide-up space-y-8">
            {/* Visual Template Designs */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <h2 className="text-lg font-semibold text-foreground">Select Visual Template Design</h2>
                {!isPro && (
                  <span className="text-xs bg-amber-400/15 text-amber-500 font-bold px-2 py-0.5 rounded-full border border-amber-400/30">
                    3 PRO TEMPLATES AVAILABLE
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-4">Choose the visual layout and cover style for this proposal.</p>

              <div className="grid sm:grid-cols-2 gap-3.5">
                {PRO_TEMPLATE_DESIGNS.map((t) => {
                  const isSelected = selectedTemplate === t.id;
                  const locked = t.isPro && !isPro;

                  return (
                    <div
                      key={t.id}
                      onClick={() => {
                        if (locked) {
                          navigate("/checkout?plan=pro");
                        } else {
                          setSelectedTemplate(t.id);
                        }
                      }}
                      className={`cursor-pointer rounded-2xl border-2 p-4 transition-all relative overflow-hidden flex flex-col justify-between ${
                        isSelected
                          ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                          : "border-border hover:border-border/80 bg-muted/30"
                      }`}
                    >
                      <div>
                        {/* Mini Gradient Preview Header */}
                        <div className={`h-10 rounded-xl bg-gradient-to-r ${t.previewGradient} mb-3 p-2 flex items-center justify-between text-white text-[10px] font-bold`}>
                          <span className="uppercase tracking-wider opacity-90">{t.category}</span>
                          {t.isPro && (
                            <span className="bg-amber-400 text-black px-1.5 py-0.5 rounded-full text-[9px] font-extrabold flex items-center gap-0.5">
                              {locked ? <Lock className="w-2.5 h-2.5" /> : <Sparkles className="w-2.5 h-2.5" />} PRO
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between mb-1">
                          <p className="font-bold text-foreground text-sm">{t.name}</p>
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? "border-primary bg-primary text-white" : "border-muted-foreground"}`}>
                            {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed mb-2 line-clamp-2">{t.description}</p>
                      </div>

                      <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>{t.tagline}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Proposal Tone & Writing Style */}
            <div className="pt-6 border-t border-border">
              <h2 className="text-base font-semibold text-foreground mb-1">Writing tone & voice</h2>
              <p className="text-xs text-muted-foreground mb-4">How should the AI write the text and narrative?</p>

              <div className="grid sm:grid-cols-3 gap-2.5 mb-6">
                {STYLES.map(({ id, label, desc }) => (
                  <button key={id} onClick={() => setStyle(id)}
                    className={`p-3 rounded-xl border text-left transition-colors ${style === id ? "border-primary bg-primary/10" : "border-border hover:border-primary/40 bg-muted/40"}`}>
                    <p className={`text-xs font-semibold ${style === id ? "text-primary" : "text-foreground"}`}>{label}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{desc}</p>
                  </button>
                ))}
              </div>

              <div className="space-y-4 pt-4 border-t border-border">
                <SliderControl label="Tone" value={tone} onChange={setTone} leftLabel="Formal" rightLabel="Casual" />
                <SliderControl label="Length" value={length} onChange={setLength} leftLabel="Concise" rightLabel="Detailed" />
                <SliderControl label="Sales focus" value={salesFocus} onChange={setSalesFocus} leftLabel="Informational" rightLabel="Persuasive" />
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button onClick={() => setStep(3)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button onClick={() => setStep(5)}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors shadow-md shadow-primary/20">
                Continue to Review <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Generate */}
        {step === 5 && (
          <div className="animate-slide-up text-center">
            <h2 className="text-lg font-semibold text-foreground mb-1">Ready to generate</h2>
            <p className="text-sm text-muted-foreground mb-8">
              AI will write a complete, personalized proposal based on your inputs.
            </p>

            {/* Summary */}
            {!generating && !genComplete && (
              <div className="bg-muted rounded-2xl p-5 mb-6 text-left space-y-2.5">
                {[
                  ["Client", `${clientName}${company ? ` — ${company}` : ""}`],
                  ["Project", projectName],
                  ["Scope", `${scopeItems.filter((s) => s.included).length} deliverables`],
                  ["Price", `${sym}${totalPrice.toLocaleString()} (${pricingModel})`],
                  ["Style", STYLES.find((s) => s.id === style)?.label],
                ].map(([label, value]) => value && (
                  <div key={String(label)} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium text-foreground">{value}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Generation progress */}
            {generating && (
              <div className="mb-8">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  {genComplete ? (
                    <Check className="w-8 h-8 text-primary" />
                  ) : (
                    <Sparkles className="w-8 h-8 text-primary animate-pulse-ring" />
                  )}
                </div>
                {genComplete ? (
                  <>
                    <h3 className="text-xl font-semibold text-foreground mb-2">Proposal ready!</h3>
                    <p className="text-sm text-muted-foreground">Opening the editor...</p>
                  </>
                ) : (
                  <>
                    <h3 className="text-base font-semibold text-foreground mb-2">{genLabel || "Generating..."}</h3>
                    <div className="flex justify-center gap-1.5 mt-4">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i < genStep ? "w-5 bg-primary" : i === genStep ? "w-5 bg-primary/40 animate-pulse" : "w-1.5 bg-border"}`} />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            <div className="flex justify-between">
              {!generating && (
                <button onClick={() => setStep(4)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
              )}
              {!generating && (
                <button onClick={handleGenerate}
                  className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors ml-auto">
                  <Sparkles className="w-4 h-4" />
                  Generate Proposal
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
