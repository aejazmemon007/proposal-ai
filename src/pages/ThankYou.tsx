import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  CheckCircle2, Sparkles, Download, ArrowRight, LayoutDashboard,
  ShieldCheck, FileText, Calendar, CreditCard, User, Mail, Building, Printer, X, Loader2
} from "lucide-react";
import { useApp } from "../lib/store";
import { downloadElementAsPDF } from "../lib/pdfExport";
import { LogoSymbol } from "../components/Logo";

interface OrderState {
  orderId?: string;
  orderDate?: string;
  planName?: string;
  planId?: string;
  billingCycle?: "monthly" | "annual";
  amountPaid?: number;
  subtotal?: number;
  tax?: number;
  discount?: number;
  paymentMethod?: string;
  customerName?: string;
  customerEmail?: string;
  businessName?: string;
  taxId?: string;
}

export default function ThankYou() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useApp();

  const state = (location.state as OrderState) || {};

  const orderId = state.orderId || `PAI-2026-${Math.floor(10000 + Math.random() * 90000)}`;
  const orderDate = state.orderDate || new Date().toISOString();
  const planName = state.planName || (user?.subscription === "studio" ? "Studio" : "Pro");
  const billingCycle = state.billingCycle || "monthly";
  const subtotal = state.subtotal || (planName === "Studio" ? 99 : 49);
  const tax = state.tax || Math.round(subtotal * 0.18);
  const amountPaid = state.amountPaid || (subtotal + tax);
  const discount = state.discount || 0;
  const paymentMethod = state.paymentMethod || "Credit Card (•••• 4242)";
  const customerName = state.customerName || (user ? `${user.firstName} ${user.lastName}`.trim() : "Valued Member");
  const customerEmail = state.customerEmail || user?.email || "customer@example.com";
  const businessName = state.businessName || user?.businessName || "My Design Studio";

  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  const formattedDate = new Date(orderDate).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const nextRenewalDate = new Date(
    new Date(orderDate).setMonth(
      new Date(orderDate).getMonth() + (billingCycle === "annual" ? 12 : 1)
    )
  ).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const [downloadingPDF, setDownloadingPDF] = useState(false);

  const handlePrintInvoice = async () => {
    const element = document.getElementById("invoice-receipt-container");
    if (element) {
      await downloadElementAsPDF(element, `Invoice_${orderId}`, setDownloadingPDF);
    } else {
      window.print();
    }
  };

  return (
    <div className="min-h-screen bg-[#fafaf8] dark:bg-[#0c0c11] text-foreground">
      {/* Top Header */}
      <div className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-20 px-6 py-4 no-print">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-md shadow-primary/20">
              <LogoSymbol className="w-4.5 h-4.5" />
            </div>
            <span className="font-bold text-foreground text-[16px]">ProposalAI</span>
          </Link>

          <Link
            to="/dashboard"
            className="flex items-center gap-1.5 text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground px-3.5 py-2 rounded-xl border border-border transition-colors"
          >
            <LayoutDashboard className="w-3.5 h-3.5" /> Go to Dashboard
          </Link>
        </div>
      </div>

      {/* Main Thank You Card */}
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Celebration Header */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 rounded-3xl bg-success/15 border-2 border-success/30 flex items-center justify-center mx-auto mb-5 shadow-xl shadow-success/10 animate-slide-up">
            <CheckCircle2 className="w-10 h-10 text-success" />
          </div>
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full mb-3">
            Payment Confirmed
          </span>
          <h1 className="text-3xl lg:text-4xl font-extrabold text-foreground mb-3">
            Welcome to ProposalAI {planName}! 🎉
          </h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Thank you for your subscription, <strong>{customerName}</strong>. Your workspace has been instantly upgraded.
          </p>
        </div>

        {/* Receipt & Order Summary Box */}
        <div className="bg-card border border-border rounded-3xl p-6 lg:p-8 shadow-sm mb-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
            <div>
              <p className="text-xs text-muted-foreground">Order Reference</p>
              <p className="text-base font-mono font-bold text-foreground">{orderId}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowInvoiceModal(true)}
                className="flex items-center gap-1.5 text-xs font-semibold text-foreground bg-muted hover:bg-muted/80 px-3.5 py-2 rounded-xl border border-border transition-colors"
              >
                <FileText className="w-3.5 h-3.5 text-primary" /> View Full Invoice
              </button>
              <button
                onClick={handlePrintInvoice}
                disabled={downloadingPDF}
                className="flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 px-3.5 py-2 rounded-xl transition-colors disabled:opacity-60 cursor-pointer"
              >
                {downloadingPDF ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Key Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-2">
            <div>
              <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Date
              </p>
              <p className="text-xs font-semibold text-foreground">{formattedDate}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-primary" /> Plan
              </p>
              <p className="text-xs font-semibold text-foreground capitalize">
                {planName} ({billingCycle})
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                <CreditCard className="w-3 h-3" /> Payment
              </p>
              <p className="text-xs font-semibold text-foreground truncate">{paymentMethod}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Total Paid</p>
              <p className="text-sm font-bold text-success">₹{amountPaid.toLocaleString()}</p>
            </div>
          </div>

          {/* Unlocked Superpowers */}
          <div className="p-5 bg-primary/5 border border-primary/20 rounded-2xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary mb-3">
              Your Unlocked Superpowers
            </h3>
            <div className="grid sm:grid-cols-2 gap-3 text-xs text-foreground">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-[10px]">✓</span>
                <span>{planName === "Studio" ? "Unlimited" : "30"} AI Proposals per month</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-[10px]">✓</span>
                <span>AI Brief & Scope Generator</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-[10px]">✓</span>
                <span>Custom Branding & Clean Layouts</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-[10px]">✓</span>
                <span>Client Engagement & View Tracking</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
            <span>Next billing date: <strong>{nextRenewalDate}</strong></span>
            <span className="flex items-center gap-1 text-success">
              <ShieldCheck className="w-3.5 h-3.5" /> Subscription Active
            </span>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10 no-print">
          <Link
            to="/proposals/new"
            className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-7 py-3.5 rounded-2xl font-bold text-sm shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all group"
          >
            <Sparkles className="w-4 h-4" /> Create Your Next Proposal
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link
            to="/dashboard"
            className="flex items-center justify-center gap-2 bg-card hover:bg-muted text-foreground border border-border px-6 py-3.5 rounded-2xl font-semibold text-sm transition-colors"
          >
            <LayoutDashboard className="w-4 h-4 text-muted-foreground" /> Open Dashboard
          </Link>
        </div>

        {/* Support Footer */}
        <div className="text-center text-xs text-muted-foreground border-t border-border pt-6 no-print">
          <p>
            A confirmation receipt has been sent to <strong>{customerEmail}</strong>.
          </p>
          <p className="mt-1">
            Need help or have questions? Contact us at{" "}
            <a href="mailto:support@proposalai.app" className="text-primary underline">
              support@proposalai.app
            </a>
          </p>
        </div>
      </div>

      {/* Invoice Modal */}
      {showInvoiceModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-card border border-border rounded-3xl max-w-2xl w-full p-8 shadow-2xl animate-slide-up relative my-8">
            <button
              onClick={() => setShowInvoiceModal(false)}
              className="absolute right-5 top-5 p-2 rounded-full hover:bg-muted text-muted-foreground no-print"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Printable Tax Invoice Content */}
            <div id="invoice-receipt-container" className="space-y-6">
              <div className="flex items-start justify-between border-b border-border pb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
                      <Sparkles className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="font-bold text-lg text-foreground">ProposalAI Inc.</span>
                  </div>
                  <p className="text-xs text-muted-foreground">GSTIN: 29AAACP1234M1Z8</p>
                  <p className="text-xs text-muted-foreground">Bangalore, Karnataka, India</p>
                </div>
                <div className="text-right">
                  <h2 className="text-xl font-extrabold text-foreground uppercase">TAX INVOICE</h2>
                  <p className="text-xs font-mono font-bold text-primary mt-1">#{orderId}</p>
                  <p className="text-xs text-muted-foreground">{formattedDate}</p>
                </div>
              </div>

              {/* Billed To */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="font-semibold text-muted-foreground uppercase mb-1">Billed To</p>
                  <p className="font-bold text-foreground text-sm">{customerName}</p>
                  {businessName && <p className="text-muted-foreground">{businessName}</p>}
                  <p className="text-muted-foreground">{customerEmail}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-muted-foreground uppercase mb-1">Payment Details</p>
                  <p className="text-foreground">Method: {paymentMethod}</p>
                  <p className="text-foreground">Status: <span className="font-bold text-success">PAID</span></p>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="border border-border rounded-xl overflow-hidden text-xs">
                <table className="w-full">
                  <thead className="bg-muted border-b border-border">
                    <tr>
                      <th className="text-left p-3 font-semibold text-foreground">Description</th>
                      <th className="text-center p-3 font-semibold text-foreground">Billing Cycle</th>
                      <th className="text-right p-3 font-semibold text-foreground">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border">
                      <td className="p-3">
                        <p className="font-bold text-foreground">ProposalAI {planName} Subscription</p>
                        <p className="text-muted-foreground text-[11px]">AI proposal generation suite and client workspace</p>
                      </td>
                      <td className="p-3 text-center capitalize text-muted-foreground">{billingCycle}</td>
                      <td className="p-3 text-right font-semibold text-foreground">₹{subtotal.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Calculation Summary */}
              <div className="space-y-1.5 text-xs max-w-xs ml-auto">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-success">
                    <span>Discount</span>
                    <span>-₹{discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-muted-foreground">
                  <span>GST (18%)</span>
                  <span>₹{tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-foreground pt-2 border-t border-border">
                  <span>Total Amount Paid</span>
                  <span>₹{amountPaid.toLocaleString()}</span>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border no-print">
                <button
                  onClick={handlePrintInvoice}
                  className="flex items-center gap-1.5 text-xs font-semibold bg-primary text-primary-foreground px-4 py-2.5 rounded-xl hover:bg-primary/90 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" /> Print / Save Invoice
                </button>
                <button
                  onClick={() => setShowInvoiceModal(false)}
                  className="text-xs font-semibold text-muted-foreground hover:text-foreground px-4 py-2.5 rounded-xl border border-border"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
