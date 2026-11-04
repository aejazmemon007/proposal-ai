import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight, ArrowLeft, Check } from "lucide-react";
import { useApp } from "../lib/store";
import { PROFESSIONS, CURRENCIES } from "../types";

const STEPS = ["Profile", "Profession", "Pricing", "Business", "Finish"];

const PROJECT_VALUES = ["Under ₹10,000", "₹10,000 – ₹30,000", "₹30,000 – ₹75,000", "₹75,000 – ₹2,00,000", "₹2,00,000+"];
const EXPERIENCE_LEVELS = ["Just starting out", "1–3 years", "3–5 years", "5+ years"];

interface OnboardingData {
  profession: string;
  experience: string;
  currency: string;
  typicalValue: string;
  businessName: string;
  website: string;
  phone: string;
  location: string;
}

export default function Onboarding() {
  const { user, completeOnboarding, updateUser } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    profession: "", experience: "", currency: "INR",
    typicalValue: "", businessName: "", website: "", phone: "", location: "",
  });

  const update = (k: keyof OnboardingData, v: string) => setData((prev) => ({ ...prev, [k]: v }));

  const handleFinish = () => {
    completeOnboarding({ ...data, onboardingComplete: true });
    navigate("/dashboard");
  };

  const inputClass = "w-full bg-muted border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-primary transition-colors";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="px-6 py-5 border-b border-border flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <span className="font-semibold text-foreground">ProposalAI</span>
        <span className="text-muted-foreground text-sm">— Setting up your account</span>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg">
          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-10">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 transition-colors ${
                  i < step ? "bg-primary text-white" : i === step ? "bg-primary/15 text-primary border border-primary/30" : "bg-muted text-muted-foreground"
                }`}>
                  {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-px transition-colors ${i < step ? "bg-primary" : "bg-border"}`} />
                )}
              </div>
            ))}
          </div>

          {/* Step 0: Profile */}
          {step === 0 && (
            <div className="animate-slide-up">
              <h1 className="text-2xl font-semibold text-foreground mb-2">
                Hi{user?.firstName ? `, ${user.firstName}` : ""}! Let's set up your account.
              </h1>
              <p className="text-muted-foreground text-sm mb-8">Tell us a bit about yourself so we can personalize your experience.</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">What do you do?</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {PROFESSIONS.map((p) => (
                      <button
                        key={p} onClick={() => update("profession", p)}
                        className={`px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors text-left ${
                          data.profession === p ? "border-primary bg-primary/10 text-primary" : "border-border text-foreground hover:border-primary/50"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-8">
                <button
                  onClick={() => setStep(1)} disabled={!data.profession}
                  className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 1: Profession details */}
          {step === 1 && (
            <div className="animate-slide-up">
              <h1 className="text-2xl font-semibold text-foreground mb-2">How experienced are you?</h1>
              <p className="text-muted-foreground text-sm mb-8">This helps us give better pricing suggestions.</p>
              <div className="space-y-3">
                {EXPERIENCE_LEVELS.map((e) => (
                  <button
                    key={e} onClick={() => update("experience", e)}
                    className={`w-full px-4 py-3.5 rounded-xl border text-sm font-medium transition-colors text-left flex items-center justify-between ${
                      data.experience === e ? "border-primary bg-primary/10 text-primary" : "border-border text-foreground hover:border-primary/40 bg-muted"
                    }`}
                  >
                    {e}
                    {data.experience === e && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
              <div className="flex justify-between mt-8">
                <button onClick={() => setStep(0)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  onClick={() => setStep(2)} disabled={!data.experience}
                  className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Pricing prefs */}
          {step === 2 && (
            <div className="animate-slide-up">
              <h1 className="text-2xl font-semibold text-foreground mb-2">Your pricing preferences</h1>
              <p className="text-muted-foreground text-sm mb-8">We use this to give better pricing recommendations.</p>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Default currency</label>
                  <div className="grid grid-cols-3 gap-2">
                    {CURRENCIES.map((c) => (
                      <button
                        key={c} onClick={() => update("currency", c)}
                        className={`px-3 py-2.5 rounded-lg border text-sm font-semibold transition-colors ${
                          data.currency === c ? "border-primary bg-primary/10 text-primary" : "border-border text-foreground hover:border-primary/50"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Typical project value</label>
                  <div className="space-y-2">
                    {PROJECT_VALUES.map((v) => (
                      <button
                        key={v} onClick={() => update("typicalValue", v)}
                        className={`w-full px-4 py-3 rounded-xl border text-sm font-medium transition-colors text-left ${
                          data.typicalValue === v ? "border-primary bg-primary/10 text-primary" : "border-border text-foreground hover:border-primary/40 bg-muted"
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-between mt-8">
                <button onClick={() => setStep(1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  onClick={() => setStep(3)} disabled={!data.currency}
                  className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Business info */}
          {step === 3 && (
            <div className="animate-slide-up">
              <h1 className="text-2xl font-semibold text-foreground mb-2">Your business information</h1>
              <p className="text-muted-foreground text-sm mb-8">This appears on your proposals. You can update it later in settings.</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Business / studio name</label>
                  <input value={data.businessName} onChange={(e) => update("businessName", e.target.value)} placeholder="e.g. Acme Studio" className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Website</label>
                  <input value={data.website} onChange={(e) => update("website", e.target.value)} placeholder="https://yoursite.com" className={inputClass} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Phone</label>
                    <input value={data.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+91 98765 43210" className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Location</label>
                    <input value={data.location} onChange={(e) => update("location", e.target.value)} placeholder="Bangalore, India" className={inputClass} />
                  </div>
                </div>
              </div>
              <div className="flex justify-between mt-8">
                <button onClick={() => setStep(2)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  onClick={() => setStep(4)}
                  className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Finish */}
          {step === 4 && (
            <div className="animate-slide-up text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/15 flex items-center justify-center mx-auto mb-6">
                <Check className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-2xl font-semibold text-foreground mb-3">You're all set!</h1>
              <p className="text-muted-foreground text-sm mb-2 max-w-sm mx-auto">
                Your account is configured. Now let's create your first proposal—paste a client brief and see how it works.
              </p>
              <div className="bg-muted rounded-2xl p-5 text-left mt-6 mb-8 space-y-2.5">
                {[
                  ["Profession", data.profession || user?.profession],
                  ["Experience", data.experience],
                  ["Currency", data.currency],
                  ["Business", data.businessName || "—"],
                ].map(([label, value]) => value && (
                  <div key={label} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium text-foreground">{value}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={handleFinish}
                className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors mx-auto"
              >
                Go to Dashboard <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
