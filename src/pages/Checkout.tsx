import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import {
  Sparkles, Check, ShieldCheck, Lock, CreditCard, Smartphone, Building2,
  Tag, ArrowRight, ArrowLeft, AlertCircle, Loader2, Zap, HelpCircle
} from "lucide-react";
import { useApp } from "../lib/store";
import { CURRENCY_SYMBOLS } from "../types";
import type { SubscriptionPlan } from "../types";

interface PlanConfig {
  id: SubscriptionPlan;
  name: string;
  monthlyPrice: number;
  annualMonthlyPrice: number;
  description: string;
  features: string[];
  popular?: boolean;
}

const PLAN_CONFIGS: Record<"pro" | "studio", PlanConfig> = {
  pro: {
    id: "pro",
    name: "Pro",
    monthlyPrice: 49,
    annualMonthlyPrice: 39,
    description: "For active freelancers & designers winning projects regularly.",
    popular: true,
    features: [
      "30 AI proposals per month",
      "Upload custom business logo (SVG/PNG/JPG)",
      "Custom gradient color builder & presets",
      "4 Pro template designs (Luxury, Tech, Creative, Minimal)",
      "100% White-label (Hide 'Created with ProposalAI')",
      "AI pricing assistant & scope analyzer",
      "AI text rewriter & tone adjuster",
      "Client view tracking & real-time analytics",
      "Priority email & chat support",
    ],
  },
  studio: {
    id: "studio",
    name: "Studio",
    monthlyPrice: 99,
    annualMonthlyPrice: 79,
    description: "For design agencies and studios with high volume.",
    features: [
      "Unlimited AI proposals per month",
      "All Pro branding & visual customizer features",
      "Team members (up to 5 seats)",
      "Multiple client brands & workspaces",
      "Advanced custom proposal templates",
      "Dedicated account manager & SLA",
      "Priority 24/7 VIP support",
    ],
  },
};

const POPULAR_BANKS = [
  { id: "hdfc", name: "HDFC Bank" },
  { id: "icici", name: "ICICI Bank" },
  { id: "sbi", name: "State Bank of India" },
  { id: "axis", name: "Axis Bank" },
  { id: "kotak", name: "Kotak Mahindra" },
];

export default function Checkout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, updateUser, addNotification, login, isAuthenticated } = useApp();

  // Plan and billing
  const initialPlan = searchParams.get("plan") === "studio" ? "studio" : "pro";
  const initialBilling = searchParams.get("billing") === "annual" ? "annual" : "monthly";

  const [selectedPlan, setSelectedPlan] = useState<"pro" | "studio">(initialPlan);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">(initialBilling);

  // Customer details
  const [email, setEmail] = useState(user?.email || "alex@designstudio.in");
  const [fullName, setFullName] = useState(user ? `${user.firstName} ${user.lastName}` : "Alex Rivera");
  const [businessName, setBusinessName] = useState(user?.businessName || "Rivera Design Studio");
  const [taxId, setTaxId] = useState("");

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState<"card" | "upi" | "netbanking">("card");

  // Card details
  const [cardNumber, setCardNumber] = useState("4242 •••• •••• 4242");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvv, setCardCvv] = useState("888");
  const [cardName, setCardName] = useState(fullName);

  // UPI details
  const [upiId, setUpiId] = useState("alex@okaxis");
  const [selectedBank, setSelectedBank] = useState("hdfc");

  // Coupon
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountPercent?: number; discountAmount?: number } | null>(null);
  const [couponError, setCouponError] = useState("");

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);

  const plan = PLAN_CONFIGS[selectedPlan];
  const unitPrice = billingCycle === "annual" ? plan.annualMonthlyPrice : plan.monthlyPrice;
  const rawSubtotal = billingCycle === "annual" ? unitPrice * 12 : unitPrice;

  // Calculate discount
  let discount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountPercent) {
      discount = Math.round((rawSubtotal * appliedCoupon.discountPercent) / 100);
    } else if (appliedCoupon.discountAmount) {
      discount = appliedCoupon.discountAmount;
    }
  }

  const subtotalAfterDiscount = Math.max(0, rawSubtotal - discount);
  const tax = Math.round(subtotalAfterDiscount * 0.18); // 18% GST
  const total = subtotalAfterDiscount + tax;

  const handleApplyCoupon = () => {
    setCouponError("");
    const cleaned = couponCode.trim().toUpperCase();
    if (!cleaned) return;

    if (cleaned === "LAUNCH50" || cleaned === "WELCOME50") {
      setAppliedCoupon({ code: cleaned, discountPercent: 50 });
    } else if (cleaned === "PROPOSAL20") {
      setAppliedCoupon({ code: cleaned, discountPercent: 20 });
    } else if (cleaned === "FREELANCE100") {
      setAppliedCoupon({ code: cleaned, discountAmount: 100 });
    } else {
      setCouponError("Invalid coupon code. Try 'LAUNCH50' or 'PROPOSAL20'");
    }
  };

  const handleCompletePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setProcessingStep(1);

    // If user is not logged in, auto-create demo session
    if (!user) {
      const parts = fullName.split(" ");
      const firstName = parts[0] || "User";
      const lastName = parts.slice(1).join(" ") || "";
      await login(email, "password123");
      updateUser({ firstName, lastName, email, businessName });
    }

    setTimeout(() => {
      setProcessingStep(2);
    }, 1000);

    setTimeout(() => {
      setProcessingStep(3);
    }, 2000);

    setTimeout(() => {
      // Update subscription in store
      updateUser({
        subscription: selectedPlan,
        businessName: businessName || user?.businessName,
      });

      // Add success notification
      addNotification({
        type: "upgrade",
        title: `Welcome to ${plan.name} Plan! 🎉`,
        message: `Your account has been upgraded to ${plan.name}. Enjoy unlocked AI superpowers!`,
      });

      const orderId = `PAI-2026-${Math.floor(10000 + Math.random() * 90000)}`;
      const orderDate = new Date().toISOString();

      navigate("/thank-you", {
        state: {
          orderId,
          orderDate,
          planName: plan.name,
          planId: selectedPlan,
          billingCycle,
          amountPaid: total,
          subtotal: subtotalAfterDiscount,
          tax,
          discount,
          paymentMethod: paymentMethod === "card" ? `Card ending in ${cardNumber.slice(-4)}` : paymentMethod === "upi" ? `UPI (${upiId})` : "Net Banking",
          customerName: fullName,
          customerEmail: email,
          businessName,
          taxId,
        },
      });
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-[#fafaf8] dark:bg-[#0c0c11] text-foreground">
      {/* Top bar */}
      <div className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-20 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-md shadow-primary/20">
                <Sparkles className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-foreground text-[16px]">ProposalAI</span>
            </Link>
            <span className="text-border">·</span>
            <Link to="/pricing" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Pricing
            </Link>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/60 px-3 py-1.5 rounded-full border border-border">
            <Lock className="w-3.5 h-3.5 text-success" />
            <span>256-Bit SSL Encrypted Checkout</span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Complete your upgrade</h1>
          <p className="text-sm text-muted-foreground mt-1">Unlock high-converting AI proposal generation, custom branding, and client analytics.</p>
        </div>

        <form onSubmit={handleCompletePurchase} className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Plan selection & Payment info */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1: Select Plan */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center">1</span>
                  <h2 className="font-semibold text-foreground text-base">Select Your Plan & Billing</h2>
                </div>

                {/* Billing cycle switch */}
                <div className="inline-flex items-center bg-muted p-1 rounded-xl border border-border text-xs">
                  <button
                    type="button"
                    onClick={() => setBillingCycle("monthly")}
                    className={`px-3 py-1 rounded-lg font-medium transition-all ${billingCycle === "monthly" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
                  >
                    Monthly
                  </button>
                  <button
                    type="button"
                    onClick={() => setBillingCycle("annual")}
                    className={`px-3 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${billingCycle === "annual" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
                  >
                    Annual <span className="text-[10px] bg-success/15 text-success font-bold px-1.5 py-0.5 rounded-full">-20%</span>
                  </button>
                </div>
              </div>

              {/* Plan cards */}
              <div className="grid sm:grid-cols-2 gap-3.5">
                {(["pro", "studio"] as const).map((key) => {
                  const p = PLAN_CONFIGS[key];
                  const price = billingCycle === "annual" ? p.annualMonthlyPrice : p.monthlyPrice;
                  const isSelected = selectedPlan === key;

                  return (
                    <div
                      key={key}
                      onClick={() => setSelectedPlan(key)}
                      className={`cursor-pointer rounded-xl border-2 p-4 transition-all relative ${
                        isSelected
                          ? "border-primary bg-primary/5 shadow-sm shadow-primary/10"
                          : "border-border hover:border-border/80 bg-muted/20"
                      }`}
                    >
                      {p.popular && (
                        <span className="absolute -top-2.5 right-3 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
                          POPULAR
                        </span>
                      )}
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-bold text-foreground">{p.name}</p>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? "border-primary bg-primary text-white" : "border-muted-foreground"}`}>
                          {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-1">{p.description}</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-extrabold text-foreground">₹{price.toLocaleString()}</span>
                        <span className="text-xs text-muted-foreground">/month</span>
                      </div>
                      {billingCycle === "annual" && (
                        <p className="text-[11px] text-success font-medium mt-0.5">Billed ₹{(price * 12).toLocaleString()} yearly</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Customer details */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-6 h-6 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center">2</span>
                <h2 className="font-semibold text-foreground text-base">Billing Information</h2>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-muted/50 border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="e.g. Alex Rivera"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-muted/50 border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="you@company.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">Business / Studio Name (Optional)</label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full bg-muted/50 border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="e.g. Rivera Design Studio"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">GSTIN / Tax ID (Optional)</label>
                  <input
                    type="text"
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    className="w-full bg-muted/50 border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="e.g. 29AAAAA0000A1Z5"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Payment details */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center">3</span>
                  <h2 className="font-semibold text-foreground text-base">Payment Method</h2>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <ShieldCheck className="w-4 h-4 text-success" />
                  <span>Encrypted & Safe</span>
                </div>
              </div>

              {/* Payment selector tabs */}
              <div className="grid grid-cols-3 gap-2 p-1 bg-muted rounded-xl mb-5 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-lg transition-all ${paymentMethod === "card" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
                >
                  <CreditCard className="w-3.5 h-3.5" /> Card
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("upi")}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-lg transition-all ${paymentMethod === "upi" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
                >
                  <Smartphone className="w-3.5 h-3.5" /> UPI / QR
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("netbanking")}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-lg transition-all ${paymentMethod === "netbanking" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
                >
                  <Building2 className="w-3.5 h-3.5" /> Net Banking
                </button>
              </div>

              {/* Card Form */}
              {paymentMethod === "card" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">Card Number</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="4242 4242 4242 4242"
                        className="w-full bg-muted/50 border border-border rounded-xl pl-3.5 pr-12 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 font-mono"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-bold text-muted-foreground">VISA</span>
                        <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-bold text-muted-foreground">MC</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1.5">Expiry Date</label>
                      <input
                        type="text"
                        required
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                        className="w-full bg-muted/50 border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1.5 flex items-center justify-between">
                        <span>CVV / CVC</span>
                        <span className="text-[10px] text-muted-foreground">3 digits</span>
                      </label>
                      <input
                        type="password"
                        required
                        maxLength={4}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        placeholder="•••"
                        className="w-full bg-muted/50 border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">Name on Card</label>
                    <input
                      type="text"
                      required
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="Alex Rivera"
                      className="w-full bg-muted/50 border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                </div>
              )}

              {/* UPI Form */}
              {paymentMethod === "upi" && (
                <div className="space-y-4">
                  <div className="p-4 bg-muted/50 border border-border rounded-xl flex flex-col sm:flex-row items-center gap-4">
                    {/* Simulated dynamic QR */}
                    <div className="w-28 h-28 bg-white p-2 rounded-xl border border-border shrink-0 flex items-center justify-center">
                      <div className="grid grid-cols-4 gap-1 w-full h-full p-1 bg-slate-900 rounded">
                        <div className="bg-white col-span-2 row-span-2 rounded-sm" />
                        <div className="bg-white rounded-sm" />
                        <div className="bg-white rounded-sm" />
                        <div className="bg-white rounded-sm" />
                        <div className="bg-white rounded-sm" />
                        <div className="bg-white col-span-2 row-span-2 rounded-sm" />
                      </div>
                    </div>
                    <div className="text-center sm:text-left">
                      <p className="text-xs font-semibold text-foreground">Scan with any UPI App</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">Google Pay, PhonePe, Paytm, CRED or BHIM</p>
                      <span className="inline-block mt-2 text-[10px] bg-success/15 text-success font-semibold px-2 py-0.5 rounded-full">
                        Instant Activation
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">Or enter your UPI ID (VPA)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="yourname@okaxis"
                        className="flex-1 bg-muted/50 border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                      <button
                        type="button"
                        className="px-4 py-2.5 bg-muted text-foreground border border-border rounded-xl text-xs font-semibold hover:bg-muted/80"
                      >
                        Verify
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Netbanking Form */}
              {paymentMethod === "netbanking" && (
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-foreground mb-1.5">Select Popular Bank</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {POPULAR_BANKS.map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setSelectedBank(b.id)}
                        className={`p-2.5 rounded-xl border text-xs font-medium text-left transition-all ${
                          selectedBank === b.id ? "border-primary bg-primary/10 text-primary font-semibold" : "border-border hover:bg-muted text-muted-foreground"
                        }`}
                      >
                        {b.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Order Summary & Action */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm sticky top-24">
              <h2 className="font-semibold text-foreground text-base mb-4">Order Summary</h2>

              {/* Selected Plan Details */}
              <div className="p-4 bg-muted/40 border border-border rounded-xl mb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-foreground">ProposalAI {plan.name}</span>
                  <span className="font-bold text-foreground">₹{unitPrice.toLocaleString()}<span className="text-xs font-normal text-muted-foreground">/mo</span></span>
                </div>
                <p className="text-xs text-muted-foreground capitalize">{billingCycle} subscription · {billingCycle === "annual" ? "Billed annually" : "Renews monthly"}</p>
              </div>

              {/* Unlocked Benefits */}
              <div className="mb-5">
                <p className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2.5">Included in {plan.name}</p>
                <ul className="space-y-2">
                  {plan.features.slice(0, 4).map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <Check className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Promo Code Input */}
              <div className="mb-5 pb-5 border-b border-border">
                <label className="block text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-primary" /> Have a promo code?
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Try LAUNCH50"
                    className="flex-1 bg-muted/50 border border-border rounded-xl px-3 py-2 text-xs uppercase text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="bg-muted border border-border px-3.5 py-2 rounded-xl text-xs font-semibold hover:bg-muted/80 text-foreground transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {appliedCoupon && (
                  <p className="text-xs text-success font-medium mt-1.5 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Code <strong>{appliedCoupon.code}</strong> applied!
                  </p>
                )}
                {couponError && (
                  <p className="text-xs text-danger mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {couponError}
                  </p>
                )}
              </div>

              {/* Financial Calculation Breakdown */}
              <div className="space-y-2.5 text-sm mb-6">
                <div className="flex justify-between text-muted-foreground text-xs">
                  <span>Subtotal ({billingCycle === "annual" ? "12 months" : "1 month"})</span>
                  <span className="text-foreground">₹{rawSubtotal.toLocaleString()}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-success text-xs font-medium">
                    <span>Coupon Discount</span>
                    <span>-₹{discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-muted-foreground text-xs">
                  <span>GST / Tax (18%)</span>
                  <span className="text-foreground">₹{tax.toLocaleString()}</span>
                </div>
                <div className="pt-3 border-t border-border flex justify-between items-baseline">
                  <span className="font-bold text-foreground">Total Due Today</span>
                  <div className="text-right">
                    <span className="text-2xl font-extrabold text-foreground">₹{total.toLocaleString()}</span>
                    <p className="text-[10px] text-muted-foreground">Includes all taxes</p>
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-primary text-primary-foreground py-3.5 px-6 rounded-xl font-bold text-sm shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all flex items-center justify-center gap-2 group disabled:opacity-75"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Processing Payment...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Pay ₹{total.toLocaleString()} & Activate {plan.name}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>

              {/* Guarantees */}
              <div className="mt-4 pt-4 border-t border-border/80 flex items-center justify-center gap-4 text-[11px] text-muted-foreground text-center">
                <span className="flex items-center gap-1">
                  <Check className="w-3 h-3 text-success" /> 7-day refund guarantee
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Check className="w-3 h-3 text-success" /> Cancel anytime
                </span>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Payment Processing Modal */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center animate-slide-up">
            <div className="w-16 h-16 rounded-2xl bg-primary/15 mx-auto mb-5 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-1">Securing Your Subscription</h3>
            <p className="text-xs text-muted-foreground mb-6">Please do not close or refresh this window.</p>

            <div className="space-y-3 text-left">
              <div className="flex items-center gap-3 text-xs">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${processingStep >= 1 ? "bg-success text-white" : "bg-muted text-muted-foreground"}`}>
                  {processingStep >= 1 ? <Check className="w-3 h-3" /> : "1"}
                </div>
                <span className={processingStep >= 1 ? "font-semibold text-foreground" : "text-muted-foreground"}>
                  Authenticating with payment gateway
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${processingStep >= 2 ? "bg-success text-white" : "bg-muted text-muted-foreground"}`}>
                  {processingStep >= 2 ? <Check className="w-3 h-3" /> : "2"}
                </div>
                <span className={processingStep >= 2 ? "font-semibold text-foreground" : "text-muted-foreground"}>
                  Verifying transaction token
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${processingStep >= 3 ? "bg-success text-white" : "bg-muted text-muted-foreground"}`}>
                  {processingStep >= 3 ? <Check className="w-3 h-3" /> : "3"}
                </div>
                <span className={processingStep >= 3 ? "font-semibold text-foreground" : "text-muted-foreground"}>
                  Upgrading ProposalAI workspace
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
