import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  User, Building, Palette, FileText, Sparkles, CreditCard, Shield, Check, Zap,
  Upload, Image, Trash2, Lock, Sliders, RefreshCw, Eye, Smartphone, QrCode, Copy, CheckCircle2
} from "lucide-react";
import { useApp } from "../lib/store";
import { FREE_PAYMENT_CONFIG, getActivePaymentConfig, buildUpiIntentUrl, buildUpiQrCodeUrl } from "../config/payments";
import { CURRENCIES, PROFESSIONS, PLAN_PRICES, BRAND_GRADIENT_PRESETS, isPlatformAdmin } from "../types";

const TABS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "business", label: "Business", icon: Building },
  { id: "branding", label: "Branding & Colors", icon: Palette },
  { id: "proposals", label: "Proposal Defaults", icon: FileText },
  { id: "ai", label: "AI Preferences", icon: Sparkles },
  { id: "billing", label: "Billing", icon: CreditCard },
];

const inputClass = "w-full bg-muted border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 transition-colors";
const labelClass = "block text-sm font-medium text-foreground mb-1.5";

const SAMPLE_LOGOS = [
  { name: "Monogram Hex", url: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><polygon points='50 3,90 25,90 75,50 97,10 75,10 25' fill='%237c3aed'/><text x='50%' y='58%' dominant-baseline='middle' text-anchor='middle' fill='white' font-weight='bold' font-size='38' font-family='sans-serif'>R</text></svg>" },
  { name: "Digital Wave", url: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='24' fill='%23059669'/><path d='M25 65 Q50 20 75 65' stroke='white' stroke-width='10' fill='none' stroke-linecap='round'/></svg>" },
  { name: "Golden Crest", url: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='24' fill='%231c1917'/><polygon points='50 20,80 75,20 75' fill='%23f59e0b'/><circle cx='50' cy='52' r='8' fill='%231c1917'/></svg>" },
  { name: "Creative Pulse", url: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='24' fill='%23ea580c'/><circle cx='50' cy='50' r='25' fill='white'/><circle cx='50' cy='50' r='14' fill='%23ea580c'/></svg>" },
];

const SOLID_PALETTE = ["#7c3aed", "#4f46e5", "#059669", "#d97706", "#dc2626", "#ec4899", "#0f0f12", "#0284c7"];

function SaveButton({ onClick, saved }: { onClick: () => void; saved: boolean }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${saved ? "bg-success/10 text-success" : "bg-primary text-primary-foreground hover:bg-primary/90"}`}>
      {saved ? <><Check className="w-4 h-4" /> Saved</> : "Save changes"}
    </button>
  );
}

export default function Settings() {
  const { tab: tabParam } = useParams<{ tab?: string }>();
  const { user, updateUser } = useApp();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isPro = user?.subscription === "pro" || user?.subscription === "studio";

  const [activeTab, setActiveTab] = useState(tabParam || "profile");
  const [saved, setSaved] = useState(false);

  // Profile fields
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [profession, setProfession] = useState(user?.profession || "");
  const [experience, setExperience] = useState(user?.experience || "");
  const [currency, setCurrency] = useState(user?.currency || "INR");

  // Business fields
  const [businessName, setBusinessName] = useState(user?.businessName || "");
  const [website, setWebsite] = useState(user?.website || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [location, setLocation] = useState(user?.location || "");
  const [tagline, setTagline] = useState(user?.tagline || "");

  // Branding & Color fields
  const [logoUrl, setLogoUrl] = useState(user?.logoUrl || "");
  const [colorMode, setColorMode] = useState<"solid" | "gradient">(user?.colorMode || "gradient");
  const [primaryColor, setPrimaryColor] = useState(user?.primaryColor || "#7c3aed");
  const [gradientFrom, setGradientFrom] = useState(user?.gradientFrom || "#7c3aed");
  const [gradientTo, setGradientTo] = useState(user?.gradientTo || "#4f46e5");
  const [gradientAngle, setGradientAngle] = useState(user?.gradientAngle || 135);
  const [hideWatermark, setHideWatermark] = useState(user?.hideWatermark || false);

  // Proposal defaults
  const [defaultCurrency, setDefaultCurrency] = useState(user?.currency || "INR");
  const [defaultPayment, setDefaultPayment] = useState("50% upfront, 50% on delivery");
  const [defaultRevisions, setDefaultRevisions] = useState("2 rounds included");
  const [defaultStyle, setDefaultStyle] = useState("professional");

  // Admin access check & Platform Payment details
  const isAdmin = isPlatformAdmin(user);
  const activeAdminConfig = getActivePaymentConfig();

  const [upiId, setUpiId] = useState(user?.upiId || activeAdminConfig.upiId);
  const [upiName, setUpiName] = useState(user?.upiName || user?.businessName || activeAdminConfig.merchantName);
  const [bankName, setBankName] = useState(user?.bankName || activeAdminConfig.bankName);
  const [accountNumber, setAccountNumber] = useState(user?.accountNumber || activeAdminConfig.accountNumber);
  const [ifscCode, setIfscCode] = useState(user?.ifscCode || activeAdminConfig.ifscCode);

  const handleSave = (updates: object) => {
    updateUser(updates);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isPro) {
      navigate("/checkout?plan=pro");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("Please upload a logo file smaller than 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        setLogoUrl(ev.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const currentPreviewGradient = `linear-gradient(${gradientAngle}deg, ${gradientFrom} 0%, ${gradientTo} 100%)`;

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-7">
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account, custom branding, colors, and preferences.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Navigation */}
        <nav className="lg:w-52 flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible shrink-0">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${activeTab === id ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}>
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Profile */}
          {activeTab === "profile" && (
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-base font-semibold text-foreground">Profile</h2>
                <SaveButton onClick={() => handleSave({ firstName, lastName, email, profession, experience, currency })} saved={saved} />
              </div>
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
                <div className="w-16 h-16 rounded-2xl bg-primary/15 flex items-center justify-center text-xl font-bold text-primary">
                  {firstName?.[0]}{lastName?.[0]}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{firstName} {lastName}</p>
                  <p className="text-sm text-muted-foreground">{email}</p>
                  <span className="inline-block mt-1 text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full capitalize">
                    {user?.subscription} Plan
                  </span>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div><label className={labelClass}>First name</label><input value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputClass} /></div>
                <div><label className={labelClass}>Last name</label><input value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputClass} /></div>
                <div><label className={labelClass}>Email</label><input value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} /></div>
                <div>
                  <label className={labelClass}>Profession</label>
                  <select value={profession} onChange={(e) => setProfession(e.target.value)} className={`${inputClass} appearance-none`}>
                    {PROFESSIONS.map((p) => <option key={p}>{p}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Business */}
          {activeTab === "business" && (
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-base font-semibold text-foreground">Business information</h2>
                <SaveButton onClick={() => handleSave({ businessName, website, phone, location, tagline })} saved={saved} />
              </div>
              <p className="text-sm text-muted-foreground mb-5">This information appears on your proposals, client links, and tax receipts.</p>
              <div className="space-y-4">
                <div><label className={labelClass}>Business / studio name</label><input value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="e.g. Acme Design Studio" className={inputClass} /></div>
                <div><label className={labelClass}>Tagline</label><input value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="Premium UI/UX design for modern products" className={inputClass} /></div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div><label className={labelClass}>Website</label><input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://yoursite.com" className={inputClass} /></div>
                  <div><label className={labelClass}>Phone</label><input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" className={inputClass} /></div>
                </div>
                <div><label className={labelClass}>Location</label><input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Bangalore, India" className={inputClass} /></div>
              </div>
            </div>
          )}

          {/* Branding & Custom Colors */}
          {activeTab === "branding" && (
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-foreground">Custom Branding & Visual Studio</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Upload your custom logo and build solid or gradient brand palettes.</p>
                </div>
                <SaveButton
                  onClick={() =>
                    handleSave({
                      logoUrl,
                      colorMode,
                      primaryColor,
                      gradientFrom,
                      gradientTo,
                      gradientAngle,
                      hideWatermark,
                    })
                  }
                  saved={saved}
                />
              </div>

              {!isPro && (
                <div className="p-4 bg-amber-400/10 border border-amber-400/30 rounded-2xl flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-5 h-5 text-amber-500 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-foreground">Pro Customization Studio</p>
                      <p className="text-[11px] text-muted-foreground">Custom logo upload, multi-stop gradients, and watermark removal require a Pro plan.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate("/checkout?plan=pro")}
                    className="bg-amber-400 text-black px-3.5 py-1.5 rounded-xl font-bold text-xs hover:bg-amber-300 transition-colors shrink-0"
                  >
                    Upgrade to Pro
                  </button>
                </div>
              )}

              {/* Section 1: Logo Upload */}
              <div>
                <label className={labelClass}>Business Logo</label>
                <div className="grid sm:grid-cols-12 gap-4 items-start">
                  <div className="sm:col-span-8 border-2 border-dashed border-border rounded-2xl p-6 text-center hover:border-primary/40 transition-colors bg-muted/20">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png, image/jpeg, image/svg+xml, image/webp"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />

                    {logoUrl ? (
                      <div className="space-y-3">
                        <div className="h-16 max-w-[200px] mx-auto p-2 rounded-xl bg-card border border-border flex items-center justify-center shadow-sm">
                          <img src={logoUrl} alt="Logo" className="max-h-full max-w-full object-contain" />
                        </div>
                        <p className="text-xs text-success font-medium flex items-center justify-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Logo uploaded & active
                        </p>
                        <div className="flex justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-xs bg-muted hover:bg-muted/80 text-foreground px-3 py-1.5 rounded-lg border border-border transition-colors font-medium"
                          >
                            Replace Logo
                          </button>
                          <button
                            type="button"
                            onClick={() => setLogoUrl("")}
                            className="text-xs text-danger hover:bg-danger/10 px-3 py-1.5 rounded-lg border border-danger/20 transition-colors font-medium flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" /> Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2">
                          <Upload className="w-5 h-5" />
                        </div>
                        <p className="text-xs font-semibold text-foreground">Click to upload or drag and drop your logo</p>
                        <p className="text-[11px] text-muted-foreground">Supports SVG, Transparent PNG, JPG, WebP (Max 2MB)</p>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm"
                        >
                          Choose Logo File
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Sample Presets */}
                  <div className="sm:col-span-4 p-4 bg-muted/40 rounded-2xl border border-border space-y-2">
                    <p className="text-xs font-semibold text-foreground">Try Sample Logos</p>
                    <div className="grid grid-cols-2 gap-2">
                      {SAMPLE_LOGOS.map((s) => (
                        <button
                          key={s.name}
                          type="button"
                          onClick={() => setLogoUrl(s.url)}
                          className="p-2 rounded-xl bg-card border border-border hover:border-primary/50 text-center transition-all group"
                        >
                          <img src={s.url} alt={s.name} className="w-6 h-6 mx-auto mb-1 object-contain" />
                          <span className="text-[10px] text-muted-foreground group-hover:text-foreground block truncate">{s.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Color Mode & Gradient Customizer */}
              <div className="pt-6 border-t border-border space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <label className={labelClass}>Brand Color Style</label>
                    <p className="text-xs text-muted-foreground">Select whether your proposals use a solid accent or dynamic gradient.</p>
                  </div>

                  <div className="flex bg-muted p-1 rounded-xl border border-border text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setColorMode("solid")}
                      className={`px-3 py-1.5 rounded-lg transition-all ${colorMode === "solid" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
                    >
                      Solid Color
                    </button>
                    <button
                      type="button"
                      onClick={() => setColorMode("gradient")}
                      className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${colorMode === "gradient" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
                    >
                      <Sparkles className="w-3 h-3 text-primary" /> Gradient Theme
                    </button>
                  </div>
                </div>

                {/* Solid Color Options */}
                {colorMode === "solid" ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-12 h-12 rounded-xl border border-border cursor-pointer bg-transparent"
                      />
                      <input
                        type="text"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        placeholder="#7c3aed"
                        className={`${inputClass} max-w-xs font-mono`}
                      />
                    </div>
                    <div className="flex gap-2 flex-wrap items-center">
                      <span className="text-xs text-muted-foreground mr-1">Presets:</span>
                      {SOLID_PALETTE.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setPrimaryColor(c)}
                          className="w-7 h-7 rounded-full border-2 border-border transition-transform hover:scale-110"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  /* Gradient Options */
                  <div className="space-y-5">
                    {/* Gradient Presets */}
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-2">Preset Brand Gradients</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {BRAND_GRADIENT_PRESETS.map((g) => {
                          const isActive = gradientFrom === g.from && gradientTo === g.to;
                          return (
                            <button
                              key={g.id}
                              type="button"
                              onClick={() => {
                                setGradientFrom(g.from);
                                setGradientTo(g.to);
                                if (g.angle) setGradientAngle(g.angle);
                              }}
                              className={`p-3 rounded-2xl text-left text-white border-2 transition-all shadow-sm ${isActive ? "border-foreground ring-2 ring-primary/40 scale-[1.02]" : "border-transparent hover:opacity-90"
                                }`}
                              style={{ background: g.css }}
                            >
                              <p className="text-xs font-bold drop-shadow-sm">{g.name}</p>
                              <p className="text-[10px] opacity-80 mt-0.5 font-mono">{g.from} → {g.to}</p>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Custom Dual-Stop Gradient Builder */}
                    <div className="p-4 bg-muted/40 border border-border rounded-2xl space-y-4">
                      <p className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <Sliders className="w-3.5 h-3.5 text-primary" /> Custom Gradient Builder
                      </p>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-foreground mb-1.5">Gradient Start (From)</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={gradientFrom}
                              onChange={(e) => setGradientFrom(e.target.value)}
                              className="w-10 h-10 rounded-xl border border-border cursor-pointer bg-transparent"
                            />
                            <input
                              type="text"
                              value={gradientFrom}
                              onChange={(e) => setGradientFrom(e.target.value)}
                              className={`${inputClass} font-mono text-xs`}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-foreground mb-1.5">Gradient End (To)</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={gradientTo}
                              onChange={(e) => setGradientTo(e.target.value)}
                              className="w-10 h-10 rounded-xl border border-border cursor-pointer bg-transparent"
                            />
                            <input
                              type="text"
                              value={gradientTo}
                              onChange={(e) => setGradientTo(e.target.value)}
                              className={`${inputClass} font-mono text-xs`}
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="font-semibold text-foreground">Gradient Angle / Direction</span>
                          <span className="font-mono text-muted-foreground">{gradientAngle}°</span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={360}
                          step={15}
                          value={gradientAngle}
                          onChange={(e) => setGradientAngle(Number(e.target.value))}
                          className="w-full h-1.5 bg-border rounded-full accent-primary cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Section 3: Watermark Toggle (Pro) */}
              <div className="pt-6 border-t border-border flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                    White-Label Proposals
                    <span className="text-[10px] bg-primary/15 text-primary font-bold px-2 py-0.2 rounded-full">PRO</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">Hide the "Created with ProposalAI" footer on all shared client links.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!isPro) {
                      navigate("/checkout?plan=pro");
                    } else {
                      setHideWatermark(!hideWatermark);
                    }
                  }}
                  className={`w-12 h-6 rounded-full relative transition-colors ${hideWatermark && isPro ? "bg-primary" : "bg-muted border border-border"}`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${hideWatermark && isPro ? "right-0.5" : "left-0.5"}`} />
                </button>
              </div>

              {/* Section 4: Live Proposal Cover Preview */}
              <div className="pt-6 border-t border-border">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5" /> Live Proposal Header Preview
                  </label>
                  <span className="text-[11px] text-muted-foreground">How clients will see your proposal</span>
                </div>

                <div className="rounded-3xl overflow-hidden border border-border shadow-md">
                  <div
                    className="p-8 text-white relative transition-all"
                    style={{
                      background: colorMode === "gradient" ? currentPreviewGradient : primaryColor,
                    }}
                  >
                    <div className="flex items-center justify-between mb-6 pb-3 border-b border-white/20">
                      <div className="flex items-center gap-3">
                        {logoUrl ? (
                          <img
                            src={logoUrl}
                            alt="Logo"
                            className="h-10 max-w-[160px] object-contain rounded-lg bg-white/20 backdrop-blur-md p-1.5"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-white text-slate-900 flex items-center justify-center font-bold text-sm shadow">
                            {businessName ? businessName.charAt(0).toUpperCase() : (user?.businessName ? user.businessName.charAt(0).toUpperCase() : "P")}
                          </div>
                        )}
                        <span className="font-bold text-sm text-white drop-shadow-sm">
                          {businessName || user?.businessName || "Your Studio Name"}
                        </span>
                      </div>
                      <span className="text-[11px] font-bold bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full">
                        PROPOSAL
                      </span>
                    </div>

                    <h3 className="text-2xl lg:text-3xl font-bold text-white mb-2 drop-shadow-sm">
                      SaaS Dashboard Redesign
                    </h3>
                    <p className="text-xs text-white/90 mb-6 drop-shadow-sm">
                      {tagline || user?.tagline || "Prepared for Client · Executive Project Proposal"}
                    </p>

                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/20 text-xs text-white/90">
                      <div><span className="block opacity-75 text-[10px]">DATE</span>Sep 10, 2026</div>
                      <div><span className="block opacity-75 text-[10px]">TOTAL VALUE</span>₹45,000</div>
                      <div><span className="block opacity-75 text-[10px]">TIMELINE</span>5 Weeks</div>
                    </div>
                  </div>

                  <div className="p-4 bg-card text-xs text-muted-foreground flex items-center justify-between border-t border-border">
                    <span>Proposal Body Preview · Section 1: Executive Summary</span>
                    {!hideWatermark && <span className="text-[10px] text-muted-foreground/70">Created with ProposalAI</span>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Proposal defaults */}
          {activeTab === "proposals" && (
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-base font-semibold text-foreground">Proposal defaults</h2>
                <SaveButton onClick={() => handleSave({ defaultCurrency, defaultPayment, defaultRevisions, defaultStyle })} saved={saved} />
              </div>
              <p className="text-sm text-muted-foreground mb-5">These defaults are pre-filled in every new proposal. You can override them per proposal.</p>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Default currency</label>
                  <select value={defaultCurrency} onChange={(e) => setDefaultCurrency(e.target.value)} className={`${inputClass} appearance-none`}>
                    {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Default payment terms</label>
                  <input value={defaultPayment} onChange={(e) => setDefaultPayment(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Default revision policy</label>
                  <input value={defaultRevisions} onChange={(e) => setDefaultRevisions(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Default proposal style</label>
                  <select value={defaultStyle} onChange={(e) => setDefaultStyle(e.target.value)} className={`${inputClass} appearance-none`}>
                    {["professional", "friendly", "premium", "minimal", "persuasive"].map((s) => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* AI preferences */}
          {activeTab === "ai" && (
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-base font-semibold text-foreground">AI preferences</h2>
                <SaveButton onClick={() => handleSave({})} saved={saved} />
              </div>
              <div className="space-y-5">
                {[
                  { label: "Default tone", desc: "How formal or casual should AI-generated proposals sound?", options: ["Very formal", "Professional", "Balanced", "Friendly", "Casual"] },
                  { label: "Proposal length", desc: "How detailed should generated proposals be by default?", options: ["Very concise", "Concise", "Standard", "Detailed", "Very detailed"] },
                ].map(({ label, desc, options }) => (
                  <div key={label} className="pb-5 border-b border-border last:border-0 last:pb-0">
                    <label className={labelClass}>{label}</label>
                    <p className="text-xs text-muted-foreground mb-3">{desc}</p>
                    <div className="flex gap-2 flex-wrap">
                      {options.map((o, i) => (
                        <button key={o} className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${i === 1 ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/50"}`}>
                          {o}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Billing */}
          {activeTab === "billing" && (
            <div className="space-y-4">
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                <h2 className="text-base font-semibold text-foreground mb-4">Current plan</h2>
                <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground capitalize">{user?.subscription} plan</p>
                      <p className="text-xs text-muted-foreground">
                        {user?.subscription === "free" ? "3 AI proposals/month" : user?.subscription === "pro" ? "30 AI proposals/month" : "Unlimited proposals"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-foreground">₹{PLAN_PRICES[user?.subscription || "free"].toLocaleString()}/mo</p>
                    {user?.subscription !== "free" && <button className="text-xs text-danger hover:underline mt-1">Cancel</button>}
                  </div>
                </div>
                {user?.subscription === "free" && (
                  <div className="mt-4 text-center">
                    <p className="text-sm text-muted-foreground mb-3">Upgrade to get more proposals and custom branding studio.</p>
                    <button
                      onClick={() => navigate("/checkout?plan=pro")}
                      className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors shadow-md shadow-primary/20"
                    >
                      Upgrade to Pro — ₹49/mo
                    </button>
                  </div>
                )}
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                {([
                  { plan: "Free", id: "free", price: 0, features: ["3 proposals/mo", "Basic templates", "PDF export"] },
                  { plan: "Pro", id: "pro", price: 49, features: ["30 proposals/mo", "AI pricing", "Custom logo & gradients", "Analytics"] },
                  { plan: "Studio", id: "studio", price: 99, features: ["Unlimited", "Team members", "Multiple brands", "Advanced AI"] },
                ] as const).map(({ plan, id, price, features }) => (
                  <div key={plan} className={`rounded-2xl p-4 border ${user?.subscription === id ? "border-primary bg-primary/5" : "border-border"}`}>
                    <p className="font-semibold text-foreground mb-0.5">{plan}</p>
                    <p className="text-lg font-bold text-foreground mb-3">₹{price}<span className="text-xs font-normal text-muted-foreground">/mo</span></p>
                    <ul className="space-y-1.5 mb-4">
                      {features.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Check className="w-3 h-3 text-success" /> {f}
                        </li>
                      ))}
                    </ul>
                    {user?.subscription !== id ? (
                      <button
                        onClick={() => {
                          if (id === "free") {
                            updateUser({ subscription: "free" });
                          } else {
                            navigate(`/checkout?plan=${id}`);
                          }
                        }}
                        className="w-full bg-primary text-primary-foreground py-2 rounded-lg text-xs font-semibold hover:bg-primary/90 transition-colors"
                      >
                        {price === 0 ? "Downgrade" : "Upgrade"}
                      </button>
                    ) : (
                      <div className="w-full bg-primary/10 text-primary py-2 rounded-lg text-xs font-semibold text-center">Current plan</div>
                    )}
                  </div>
                ))}
              </div>

              {/* Invoices & Billing History for All Users */}
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    <h2 className="text-base font-semibold text-foreground">Invoices & Billing History</h2>
                  </div>
                  <span className="text-[11px] text-muted-foreground font-medium">Automatic tax invoices</span>
                </div>

                {(() => {
                  let invoices: any[] = [];
                  try {
                    const raw = localStorage.getItem("pai_invoices_" + (user?.id || "guest"));
                    if (raw) invoices = JSON.parse(raw);
                  } catch {}

                  if (invoices.length === 0) {
                    return (
                      <div className="text-center py-6 px-4 bg-muted/20 border border-dashed border-border rounded-xl">
                        <CheckCircle2 className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                        <p className="text-xs font-semibold text-foreground">No Billing Receipts Yet</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          When you upgrade to Pro or Studio on checkout, your verified receipt and invoice will appear here.
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div className="divide-y divide-border border border-border rounded-xl overflow-hidden">
                      {invoices.map((inv: any, idx: number) => (
                        <div key={inv.orderId || idx} className="p-3.5 bg-card flex items-center justify-between text-xs">
                          <div>
                            <span className="font-semibold text-foreground block">{inv.plan} Subscription</span>
                            <span className="text-[11px] text-muted-foreground font-mono">{inv.orderId} · {new Date(inv.date).toLocaleDateString()}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-foreground block">₹{inv.amount}</span>
                            <span className="text-[10px] bg-emerald-500/15 text-emerald-600 font-bold px-2 py-0.5 rounded-full inline-block mt-0.5">
                              {inv.status || "Paid"} via {inv.paymentMethod}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              {/* Billing FAQ & Payment Security */}
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-sm font-semibold text-foreground">Payment & Billing Security</h3>
                </div>
                <div className="grid sm:grid-cols-3 gap-3 text-xs text-muted-foreground">
                  <div className="p-3 bg-muted/30 border border-border rounded-xl">
                    <p className="font-semibold text-foreground mb-1">Instant Activation</p>
                    <p className="text-[11px] leading-relaxed">Subscriptions unlock immediately upon submitting your payment reference.</p>
                  </div>
                  <div className="p-3 bg-muted/30 border border-border rounded-xl">
                    <p className="font-semibold text-foreground mb-1">0% Extra Fees</p>
                    <p className="text-[11px] leading-relaxed">Direct UPI and bank transfers carry zero surcharge or gateway processing deductions.</p>
                  </div>
                  <div className="p-3 bg-muted/30 border border-border rounded-xl">
                    <p className="font-semibold text-foreground mb-1">Cancel Anytime</p>
                    <p className="text-[11px] leading-relaxed">No lock-ins. Switch to Free or change plans whenever your client volume changes.</p>
                  </div>
                </div>
              </div>

              {/* Platform Admin Only: Subscription Payment Receiving Configuration */}
              {isAdmin && (
                <div className="bg-card border-2 border-primary/30 rounded-2xl p-6 shadow-sm relative overflow-hidden space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-5 h-5 text-primary" />
                        <h2 className="text-base font-semibold text-foreground">Platform Payment Receiving Settings</h2>
                        <span className="text-[10px] bg-primary/15 text-primary font-extrabold px-2 py-0.5 rounded-full border border-primary/30">
                          👑 ADMIN ONLY
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Configure the UPI ID and Bank Account where users' subscription payments (Pro ₹49 / Studio ₹99) are received.
                        <span className="block text-primary text-[11px] font-medium mt-0.5">
                          🔒 This card is strictly visible to you (Admin). Regular users cannot see this configuration.
                        </span>
                      </p>
                    </div>
                    <SaveButton onClick={() => {
                      handleSave({ upiId, upiName, bankName, accountNumber, ifscCode });
                      try {
                        localStorage.setItem("pai_admin_payment_config", JSON.stringify({
                          upiId,
                          merchantName: upiName,
                          accountHolder: upiName,
                          bankName,
                          accountNumber,
                          ifscCode,
                        }));
                      } catch {}
                    }} saved={saved} />
                  </div>

                  <div className="grid md:grid-cols-12 gap-6">
                    <div className="md:col-span-7 space-y-4">
                      <div>
                        <label className={labelClass}>Receiving UPI ID (VPA)</label>
                        <input
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          placeholder="e.g. aejazrocks618@oksbi"
                          className={inputClass}
                        />
                        <p className="text-[11px] text-muted-foreground mt-1">Found in Google Pay, PhonePe, Paytm, or your bank app. Used on /checkout.</p>
                      </div>

                      <div>
                        <label className={labelClass}>Merchant / Account Display Name</label>
                        <input
                          value={upiName}
                          onChange={(e) => setUpiName(e.target.value)}
                          placeholder="e.g. The Box Ux"
                          className={inputClass}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className={labelClass}>Bank Name</label>
                          <input
                            value={bankName}
                            onChange={(e) => setBankName(e.target.value)}
                            placeholder="e.g. State Bank of India"
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>IFSC Code</label>
                          <input
                            value={ifscCode}
                            onChange={(e) => setIfscCode(e.target.value)}
                            placeholder="e.g. HDFC0000123"
                            className={inputClass}
                          />
                        </div>
                      </div>

                      <div>
                        <label className={labelClass}>Bank Account Number</label>
                        <input
                          value={accountNumber}
                          onChange={(e) => setAccountNumber(e.target.value)}
                          placeholder="e.g. 50200098765432"
                          className={inputClass}
                        />
                      </div>
                    </div>

                    {/* Live Scannable QR Preview for Checkout */}
                    <div className="md:col-span-5 bg-muted/30 border border-border rounded-2xl p-5 flex flex-col items-center justify-center text-center">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">Live Scannable Checkout QR Preview</span>
                      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-md mb-3">
                        <img
                          src={buildUpiQrCodeUrl(buildUpiIntentUrl({
                            upiId: upiId || FREE_PAYMENT_CONFIG.upiId,
                            merchantName: upiName || FREE_PAYMENT_CONFIG.merchantName,
                            amount: 49,
                            transactionNote: "ProposalAI Pro Subscription"
                          }), 180)}
                          alt="Preview QR"
                          className="w-36 h-36 object-contain rounded-lg"
                        />
                      </div>
                      <p className="text-xs font-semibold text-foreground">{upiName || "The Box Ux"}</p>
                      <p className="text-[11px] font-mono text-muted-foreground">{upiId || "aejazrocks618@oksbi"}</p>
                      <span className="inline-block mt-2 text-[10px] bg-emerald-500/15 text-emerald-600 font-semibold px-2 py-0.5 rounded-full">
                        Active Receiver on /checkout
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
