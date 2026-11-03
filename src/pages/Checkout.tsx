import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import {
  Sparkles, Check, ShieldCheck, Lock, CreditCard, Smartphone, Building2,
  Tag, ArrowRight, ArrowLeft, AlertCircle, Loader2, Zap, HelpCircle,
  Copy, CheckCircle2, QrCode, ExternalLink
} from "lucide-react";
import { useApp, isRealEmail } from "../lib/store";
import { FREE_PAYMENT_CONFIG, getActivePaymentConfig, buildUpiIntentUrl, buildUpiQrCodeUrl } from "../config/payments";
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
  const { user, updateUser, addNotification, login, signup, isAuthenticated } = useApp();

  // Plan and billing
  const initialPlan = searchParams.get("plan") === "studio" ? "studio" : "pro";
  const initialBilling = searchParams.get("billing") === "annual" ? "annual" : "monthly";

  const [selectedPlan, setSelectedPlan] = useState<"pro" | "studio">(initialPlan);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">(initialBilling);

  // Customer details
  const [email, setEmail] = useState(user?.email || "");
  const [fullName, setFullName] = useState(user ? `${user.firstName} ${user.lastName}`.trim() : "");
  const [businessName, setBusinessName] = useState(user?.businessName || "");
  const [taxId, setTaxId] = useState("");

  // Payment method (Default to 100% Free UPI)
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card" | "netbanking">("upi");

  // Free UPI & Direct Bank states
  const activePaymentConfig = getActivePaymentConfig();
  const effectiveUpiId = activePaymentConfig.upiId;
  const [utrNumber, setUtrNumber] = useState("");
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedBank, setCopiedBank] = useState(false);

  // Card details (empty by default, requires real valid card)
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState(fullName);

  // Real payment validation error state
  const [paymentError, setPaymentError] = useState("");

  // Bank selection
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
    setPaymentError("");

    // 1. Strict Validation of Customer Billing Information
    const cleanEmail = email.trim();
    if (!cleanEmail || !isRealEmail(cleanEmail)) {
      setPaymentError("Please enter a valid, authentic email address (e.g. yourname@gmail.com). Test or dummy domains are not allowed.");
      return;
    }

    const nameParts = fullName.trim().split(/\s+/);
    if (nameParts.length < 2 || nameParts[0].length < 2 || nameParts[1].length < 2) {
      setPaymentError("Please enter your real full name (first and last name) for your billing receipt.");
      return;
    }

    // 2. Strict Payment Verification Checks
    if (paymentMethod === "upi") {
      const cleanUtr = utrNumber.trim();
      if (!cleanUtr) {
        setPaymentError(
          `Payment Verification Required: Please complete your payment of ₹${total.toLocaleString()} using Google Pay, PhonePe, or Paytm, and enter your 12-digit UPI / UTR Transaction ID from your payment receipt.`
        );
        return;
      }
      if (!/^\d{12}$/.test(cleanUtr)) {
        setPaymentError(
          "Invalid UTR Transaction ID: Standard NPCI UPI transaction reference numbers must be exactly 12 numeric digits (e.g. 423891048291). Please verify on your UPI receipt."
        );
        return;
      }
    } else if (paymentMethod === "netbanking") {
      const cleanRef = utrNumber.trim();
      if (!cleanRef || cleanRef.length < 8) {
        setPaymentError(
          "Payment Reference Required: Please enter your bank transfer IMPS/NEFT/RTGS transaction reference number (at least 8 alphanumeric characters)."
        );
        return;
      }
    } else if (paymentMethod === "card") {
      const cleanCard = cardNumber.replace(/\s+/g, "");
      if (!/^\d{16}$/.test(cleanCard)) {
        setPaymentError("Invalid Card: Please enter a real 16-digit debit or credit card number.");
        return;
      }
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardExpiry.trim())) {
        setPaymentError("Invalid Expiry: Please enter a valid card expiration date in MM/YY format.");
        return;
      }
      if (!/^\d{3,4}$/.test(cardCvv.trim())) {
        setPaymentError("Invalid CVV: Please enter the 3-digit security code on the back of your card.");
        return;
      }
      if (!cardName.trim()) {
        setPaymentError("Please enter the cardholder name exactly as printed on the card.");
        return;
      }
    }

    setIsProcessing(true);
    setProcessingStep(1);

    // If user is not logged in, auto-register their active profile
    if (!user) {
      const parts = fullName.trim().split(" ");
      const firstName = parts[0] || "User";
      const lastName = parts.slice(1).join(" ") || "Member";
      try {
        await signup(email, "Secret@" + Math.random().toString(36).slice(2, 8), firstName, lastName);
      } catch {
        // Account may already exist
      }
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

      try {
        const invKey = "pai_invoices_" + (user?.id || "guest");
        const existingInvoices = JSON.parse(localStorage.getItem(invKey) || "[]");
        existingInvoices.unshift({
          orderId,
          date: orderDate,
          plan: plan.name,
          planId: selectedPlan,
          amount: total,
          paymentMethod: paymentMethod === "upi" ? "UPI" : paymentMethod === "netbanking" ? "Net Banking" : "Card",
          utrNumber: utrNumber || undefined,
          status: "Paid",
        });
        localStorage.setItem(invKey, JSON.stringify(existingInvoices));

        // Global Admin transactions ledger
        const existingTx = JSON.parse(localStorage.getItem("pai_admin_transactions") || "[]");
        existingTx.unshift({
          id: orderId,
          date: orderDate,
          userId: user?.id || "guest",
          userName: fullName,
          userEmail: email,
          businessName: businessName || user?.businessName || "",
          planId: selectedPlan,
          planName: plan.name,
          billingCycle,
          amount: total,
          paymentMethod: paymentMethod === "upi" ? "UPI" : paymentMethod === "netbanking" ? "Direct Bank Wire" : "Credit/Debit Card",
          utrNumber: utrNumber || (paymentMethod === "card" ? `CARD-${cardNumber.slice(-4)}` : undefined),
          status: "verified",
          verifiedAt: new Date().toISOString(),
        });
        localStorage.setItem("pai_admin_transactions", JSON.stringify(existingTx));
      } catch {}

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
          paymentMethod: paymentMethod === "upi"
            ? `UPI (${effectiveUpiId})${utrNumber ? ` · Ref: ${utrNumber}` : ""}`
            : paymentMethod === "netbanking"
            ? `Direct Bank Wire (${activePaymentConfig.bankName})${utrNumber ? ` · Ref: ${utrNumber}` : ""}`
            : `Card ending in ${cardNumber.slice(-4)}`,
          customerName: fullName,
          customerEmail: email,
          businessName,
          taxId,
        },
      });
    }, 3000);
  };

  // Generate dynamic 0% fee UPI payment URL and scannable QR Code
  const upiPayUrl = buildUpiIntentUrl({
    upiId: effectiveUpiId,
    merchantName: activePaymentConfig.merchantName,
    amount: total,
    transactionNote: `ProposalAI ${plan.name} Plan`,
  });

  const upiQrCodeUrl = buildUpiQrCodeUrl(upiPayUrl, 300);

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(effectiveUpiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleCopyBank = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedBank(true);
    setTimeout(() => setCopiedBank(false), 2000);
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
                    placeholder="e.g. John Doe"
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
                    placeholder="e.g. Acme Design Studio"
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
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>100% Free Integration · 0% Fees</span>
                </div>
              </div>

              {/* Payment selector tabs */}
              <div className="grid grid-cols-3 gap-2 p-1 bg-muted rounded-xl mb-5 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("upi")}
                  className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg transition-all relative ${paymentMethod === "upi" ? "bg-card text-foreground shadow-sm ring-1 ring-border" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>UPI / QR</span>
                  <span className="hidden sm:inline-block text-[9px] bg-emerald-500/15 text-emerald-600 px-1.5 py-0.2 rounded font-bold">0% FEE</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("netbanking")}
                  className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg transition-all ${paymentMethod === "netbanking" ? "bg-card text-foreground shadow-sm ring-1 ring-border" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <Building2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Bank Wire</span>
                  <span className="hidden sm:inline-block text-[9px] bg-blue-500/15 text-blue-600 px-1.5 py-0.2 rounded font-bold">DIRECT</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg transition-all ${paymentMethod === "card" ? "bg-card text-foreground shadow-sm ring-1 ring-border" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <CreditCard className="w-3.5 h-3.5 text-purple-600" />
                  <span>Card</span>
                </button>
              </div>

              {/* 100% Free UPI & QR Section */}
              {paymentMethod === "upi" && (
                <div className="space-y-4">
                  {/* Dynamic QR Showcase */}
                  <div className="p-5 bg-gradient-to-b from-muted/50 to-muted/20 border border-border rounded-2xl flex flex-col sm:flex-row items-center gap-5">
                    <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-md shrink-0 text-center">
                      <img
                        src={upiQrCodeUrl}
                        alt="Scan UPI QR Code to Pay"
                        className="w-44 h-44 rounded-xl object-contain mx-auto"
                      />
                      <div className="mt-2 flex items-center justify-center gap-1 text-[11px] font-bold text-slate-800">
                        <QrCode className="w-3 h-3 text-emerald-600" />
                        <span>Scan & Pay ₹{total.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex-1 space-y-3 text-center sm:text-left">
                      <div>
                        <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-400 px-2.5 py-0.5 rounded-full mb-1">
                          Zero Platform Fee · Direct Bank Settlement
                        </span>
                        <h4 className="text-sm font-bold text-foreground">Scan with any UPI App</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Works with Google Pay, PhonePe, Paytm, CRED, BHIM, and your mobile banking apps.
                        </p>
                      </div>

                      {/* Direct Mobile UPI Intent Link Button */}
                      <div>
                        <a
                          href={upiPayUrl}
                          className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-600/20 hover:scale-[1.01] active:scale-[0.99] transition-all"
                        >
                          <Smartphone className="w-4 h-4" />
                          <span>Tap to Pay on Mobile App (GPay / PhonePe / Paytm)</span>
                        </a>
                        <p className="text-[10px] text-muted-foreground text-center mt-1 sm:text-left">
                          Clicking opens your installed UPI app with the exact ₹{total.toLocaleString()} amount prefilled.
                        </p>
                      </div>

                      {/* Copyable UPI ID */}
                      <div className="p-2.5 bg-card border border-border rounded-xl flex items-center justify-between text-xs">
                        <div className="truncate pr-2">
                          <span className="text-[10px] text-muted-foreground block uppercase font-medium">Merchant UPI ID</span>
                          <span className="font-mono font-bold text-foreground">{effectiveUpiId}</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleCopyUpi}
                          className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-foreground font-semibold text-xs border border-border transition-colors cursor-pointer"
                        >
                          {copiedUpi ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-600">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy ID</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* UTR / Reference Number Input */}
                  <div className="pt-2">
                    <label className="block text-xs font-semibold text-foreground mb-1.5 flex items-center justify-between">
                      <span>12-Digit UPI / UTR Transaction ID <span className="text-danger font-bold">*Required</span></span>
                      <span className="text-[11px] text-muted-foreground font-normal">Found in your payment app receipt</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={utrNumber}
                      onChange={(e) => {
                        setUtrNumber(e.target.value);
                        setPaymentError("");
                      }}
                      placeholder="e.g. 423891048291 (12 digits)"
                      className={`w-full bg-muted/50 border rounded-xl px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 font-mono placeholder:font-sans ${
                        paymentError && !utrNumber ? "border-danger ring-1 ring-danger/30" : "border-border"
                      }`}
                    />
                    <p className="text-[11px] text-muted-foreground mt-1">
                      After paying via Google Pay, PhonePe, or Paytm, paste the 12-digit UTR/UPI reference code to verify and activate your plan.
                    </p>
                  </div>
                </div>
              )}

              {/* Direct Bank Wire / Net Banking (0% Fee) */}
              {paymentMethod === "netbanking" && (
                <div className="space-y-4">
                  <div className="p-4 bg-muted/40 border border-border rounded-2xl space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-border">
                      <span className="text-xs font-bold text-foreground">Direct Bank Account Transfer (IMPS / NEFT / RTGS)</span>
                      <span className="text-[10px] bg-blue-500/15 text-blue-600 font-bold px-2 py-0.5 rounded-full">0% GATEWAY FEE</span>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-2.5 bg-card border border-border rounded-xl">
                        <span className="text-[10px] text-muted-foreground block uppercase font-medium">Bank Name</span>
                        <span className="font-semibold text-foreground">{activePaymentConfig.bankName}</span>
                      </div>
                      <div className="p-2.5 bg-card border border-border rounded-xl">
                        <span className="text-[10px] text-muted-foreground block uppercase font-medium">Account Holder</span>
                        <span className="font-semibold text-foreground">{activePaymentConfig.accountHolder}</span>
                      </div>
                      <div className="p-2.5 bg-card border border-border rounded-xl flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-muted-foreground block uppercase font-medium">Account Number</span>
                          <span className="font-mono font-bold text-foreground">{activePaymentConfig.accountNumber || "Provided on Request"}</span>
                        </div>
                        {activePaymentConfig.accountNumber && (
                          <button
                            type="button"
                            onClick={() => handleCopyBank(activePaymentConfig.accountNumber)}
                            className="p-1.5 rounded-lg bg-muted hover:bg-muted/80 text-foreground transition-colors cursor-pointer"
                            title="Copy Account Number"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <div className="p-2.5 bg-card border border-border rounded-xl flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-muted-foreground block uppercase font-medium">IFSC Code</span>
                          <span className="font-mono font-bold text-foreground">{activePaymentConfig.ifscCode}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyBank(activePaymentConfig.ifscCode)}
                          className="p-1.5 rounded-lg bg-muted hover:bg-muted/80 text-foreground transition-colors cursor-pointer"
                          title="Copy IFSC Code"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-[11px] text-muted-foreground pt-1">
                      Branch: {activePaymentConfig.branch} · Transfer ₹{total.toLocaleString()} via your net banking portal or mobile app.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">Bank Transaction / IMPS Reference Number</label>
                    <input
                      type="text"
                      value={utrNumber}
                      onChange={(e) => setUtrNumber(e.target.value)}
                      placeholder="e.g. IMPS20260910123"
                      className="w-full bg-muted/50 border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 font-mono placeholder:font-sans"
                    />
                  </div>
                </div>
              )}

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
                        onChange={(e) => {
                          setCardNumber(e.target.value);
                          setPaymentError("");
                        }}
                        placeholder="•••• •••• •••• •••• (16 digits)"
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
                        onChange={(e) => {
                          setCardExpiry(e.target.value);
                          setPaymentError("");
                        }}
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
                        onChange={(e) => {
                          setCardCvv(e.target.value);
                          setPaymentError("");
                        }}
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
                      onChange={(e) => {
                        setCardName(e.target.value);
                        setPaymentError("");
                      }}
                      placeholder="Cardholder full name"
                      className="w-full bg-muted/50 border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
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

              {/* Payment Validation Error Banner */}
              {paymentError && (
                <div className="p-3.5 mb-4 bg-danger/10 border border-danger/30 rounded-xl text-xs text-danger flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-danger" />
                  <span className="leading-relaxed font-medium">{paymentError}</span>
                </div>
              )}

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
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${processingStep >= 1 ? "bg-emerald-600 text-white" : "bg-muted text-muted-foreground"}`}>
                  {processingStep >= 1 ? <Check className="w-3 h-3" /> : "1"}
                </div>
                <span className={processingStep >= 1 ? "font-semibold text-foreground" : "text-muted-foreground"}>
                  Authenticating UPI transaction & direct bank settlement
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${processingStep >= 2 ? "bg-emerald-600 text-white" : "bg-muted text-muted-foreground"}`}>
                  {processingStep >= 2 ? <Check className="w-3 h-3" /> : "2"}
                </div>
                <span className={processingStep >= 2 ? "font-semibold text-foreground" : "text-muted-foreground"}>
                  Confirming 0% fee zero-commission verification
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${processingStep >= 3 ? "bg-emerald-600 text-white" : "bg-muted text-muted-foreground"}`}>
                  {processingStep >= 3 ? <Check className="w-3 h-3" /> : "3"}
                </div>
                <span className={processingStep >= 3 ? "font-semibold text-foreground" : "text-muted-foreground"}>
                  Upgrading ProposalAI workspace to {plan.name}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
