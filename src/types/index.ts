export type SubscriptionPlan = "free" | "pro" | "studio";
export type ProposalStatus = "draft" | "sent" | "viewed" | "accepted" | "rejected" | "expired";
export type PricingModel = "fixed" | "hourly" | "milestone";
export type ProposalStyle = "professional" | "friendly" | "premium" | "minimal" | "persuasive";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profession?: string;
  experience?: string;
  currency: string;
  businessName?: string;
  website?: string;
  phone?: string;
  location?: string;
  logoUrl?: string;
  primaryColor?: string;
  colorMode?: "solid" | "gradient";
  gradientFrom?: string;
  gradientTo?: string;
  gradientAngle?: number;
  hideWatermark?: boolean;
  tagline?: string;
  upiId?: string;
  upiName?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  subscription: SubscriptionPlan;
  usageThisMonth: number;
  onboardingComplete: boolean;
}

export interface ScopeItem {
  id: string;
  title: string;
  description: string;
  quantity?: number;
  price?: number;
  included: boolean;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  amount: number;
  dueWeek?: number;
}

export interface TimelinePhase {
  phase: string;
  duration: string;
  description: string;
}

export interface ProposalContent {
  title: string;
  introduction: string;
  project_understanding: string;
  goals: string[];
  proposed_solution: string;
  scope: string[];
  deliverables: string[];
  timeline: TimelinePhase[];
  investment: {
    total: number;
    currency: string;
    model: string;
    breakdown?: string;
  };
  payment_terms: string;
  revisions: string;
  exclusions: string[];
  assumptions: string[];
  terms: string;
  next_steps: string;
}

export interface BriefAnalysis {
  project_type: string;
  project_summary: string;
  client_goals: string[];
  requirements: string[];
  deliverables: string[];
  constraints: string[];
  timeline: string;
  budget: string;
  risks: string[];
  missing_information: string[];
  suggested_scope: string[];
  complexity: "Low" | "Medium" | "High";
  assumptions: string[];
}

export interface PricingSuggestion {
  low: number;
  recommended: number;
  premium: number;
  currency: string;
  reasoning: string;
  assumptions: string[];
}

export interface Proposal {
  id: string;
  userId: string;
  clientId?: string;
  clientName: string;
  company?: string;
  clientEmail?: string;
  clientWebsite?: string;
  projectName: string;
  projectType: string;
  brief: string;
  notes?: string;
  analysisResult?: BriefAnalysis;
  scopeItems: ScopeItem[];
  pricingModel: PricingModel;
  price: number;
  currency: string;
  milestones?: Milestone[];
  paymentSchedule?: string;
  timeline?: string;
  style: ProposalStyle;
  tone: number;
  length: number;
  salesFocus: number;
  content?: ProposalContent;
  status: ProposalStatus;
  publicToken?: string;
  isArchived?: boolean;
  templateId?: string;
  logoUrl?: string;
  primaryColor?: string;
  colorMode?: "solid" | "gradient";
  gradientFrom?: string;
  gradientTo?: string;
  gradientAngle?: number;
  hideWatermark?: boolean;
  createdAt: string;
  updatedAt: string;
  sentAt?: string;
  viewedAt?: string;
  acceptedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  viewCount?: number;
}

export interface GradientPreset {
  id: string;
  name: string;
  from: string;
  to: string;
  angle?: number;
  css: string;
}

export const BRAND_GRADIENT_PRESETS: GradientPreset[] = [
  { id: "royal-violet", name: "Royal Violet", from: "#7c3aed", to: "#4f46e5", angle: 135, css: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)" },
  { id: "sunset-horizon", name: "Sunset Horizon", from: "#f43f5e", to: "#fb923c", angle: 135, css: "linear-gradient(135deg, #f43f5e 0%, #fb923c 100%)" },
  { id: "cyber-emerald", name: "Cyber Emerald", from: "#059669", to: "#0d9488", angle: 135, css: "linear-gradient(135deg, #059669 0%, #0d9488 100%)" },
  { id: "onyx-gold", name: "Onyx & Gold", from: "#1c1917", to: "#b45309", angle: 135, css: "linear-gradient(135deg, #1c1917 0%, #b45309 100%)" },
  { id: "midnight-sapphire", name: "Midnight Sapphire", from: "#1e1b4b", to: "#2563eb", angle: 135, css: "linear-gradient(135deg, #1e1b4b 0%, #2563eb 100%)" },
  { id: "cosmic-neon", name: "Cosmic Neon", from: "#8b5cf6", to: "#ec4899", angle: 135, css: "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)" },
  { id: "deep-forest", name: "Deep Forest", from: "#064e3b", to: "#10b981", angle: 135, css: "linear-gradient(135deg, #064e3b 0%, #10b981 100%)" },
  { id: "electric-ember", name: "Electric Ember", from: "#ea580c", to: "#e11d48", angle: 135, css: "linear-gradient(135deg, #ea580c 0%, #e11d48 100%)" },
];

export interface Client {
  id: string;
  userId: string;
  name: string;
  company?: string;
  email?: string;
  website?: string;
  phone?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  type: "viewed" | "accepted" | "rejected" | "limit" | "upgrade";
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  proposalId?: string;
}

export type TemplateDesignId = "modern-minimal" | "executive-luxury" | "tech-emerald" | "creative-sunset";

export interface ProposalTemplateDesign {
  id: TemplateDesignId;
  name: string;
  category: string;
  tagline: string;
  description: string;
  isPro: boolean;
  accentColor: string;
  headerBg: string;
  headerText: string;
  badgeBg: string;
  badgeText: string;
  cardBg: string;
  borderStyle: string;
  fontClass: string;
  previewGradient: string;
  features: string[];
}

export const PRO_TEMPLATE_DESIGNS: ProposalTemplateDesign[] = [
  {
    id: "modern-minimal",
    name: "Modern Minimalist",
    category: "Product & UI/UX",
    tagline: "Swiss-inspired clean aesthetic with generous whitespace",
    description: "Crisp typography, understated borders, and focused structured hierarchy. Best for high-end digital products and UI/UX projects.",
    isPro: false,
    accentColor: "#7c3aed",
    headerBg: "bg-slate-900",
    headerText: "text-white",
    badgeBg: "bg-violet-500/10",
    badgeText: "text-violet-600 dark:text-violet-400",
    cardBg: "bg-white dark:bg-card",
    borderStyle: "border-slate-200 dark:border-slate-800",
    fontClass: "font-sans",
    previewGradient: "from-violet-600 to-indigo-700",
    features: ["Clean visual hierarchy", "Minimalist timeline", "Spacious deliverable list", "Modern signature block"],
  },
  {
    id: "executive-luxury",
    name: "Executive Onyx & Gold",
    category: "Consulting & Enterprise",
    tagline: "High-ticket luxury dark aesthetic with gold accents",
    description: "Deep obsidian header, gilded amber accents, and editorial serif headers. Perfect for closing high-ticket enterprise and consulting clients.",
    isPro: true,
    accentColor: "#d97706",
    headerBg: "bg-gradient-to-br from-neutral-950 via-stone-900 to-neutral-950",
    headerText: "text-amber-100",
    badgeBg: "bg-amber-500/10",
    badgeText: "text-amber-500",
    cardBg: "bg-white dark:bg-neutral-900",
    borderStyle: "border-amber-500/20",
    fontClass: "font-display",
    previewGradient: "from-amber-600 via-stone-900 to-black",
    features: ["Executive summary card", "Editorial serif typography", "Gilded investment badge", "Formal agreement terms"],
  },
  {
    id: "tech-emerald",
    name: "Cyber Emerald & Tech",
    category: "Engineering & Web3",
    tagline: "Modern high-tech aesthetic with vibrant neon emerald",
    description: "Technical precision with code-inspired pill badges, dual-tone timeline tracks, and metrics callouts. Ideal for software devs and tech agencies.",
    isPro: true,
    accentColor: "#059669",
    headerBg: "bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950",
    headerText: "text-emerald-300",
    badgeBg: "bg-emerald-500/10",
    badgeText: "text-emerald-500",
    cardBg: "bg-white dark:bg-slate-900",
    borderStyle: "border-emerald-500/20",
    fontClass: "font-sans",
    previewGradient: "from-emerald-500 to-teal-700",
    features: ["Tech stack & deliverable chips", "Milestone sprint tracks", "ROI & KPI highlights", "Developer handoff block"],
  },
  {
    id: "creative-sunset",
    name: "Creative Sunset Studio",
    category: "Branding & Motion",
    tagline: "Warm coral and terracotta storytelling layout",
    description: "Vibrant coral/orange gradients, warm sand containers, and engaging narrative flow. Built for brand designers, creative studios, and copywriters.",
    isPro: true,
    accentColor: "#f97316",
    headerBg: "bg-gradient-to-tr from-rose-950 via-orange-950 to-amber-950",
    headerText: "text-orange-200",
    badgeBg: "bg-orange-500/10",
    badgeText: "text-orange-500",
    cardBg: "bg-white dark:bg-stone-900",
    borderStyle: "border-orange-500/20",
    fontClass: "font-display",
    previewGradient: "from-orange-500 to-rose-600",
    features: ["Visual storytelling flow", "Creative mood cards", "Dynamic scope pillars", "Warm approval callout"],
  },
];

export interface Template {
  id: string;
  name: string;
  category: string;
  description: string;
  isPremium: boolean;
  previewColor: string;
}

export const USAGE_LIMITS: Record<SubscriptionPlan, number> = {
  free: 3,
  pro: 30,
  studio: Infinity,
};

export const PLAN_PRICES = {
  free: 0,
  pro: 49,
  studio: 99,
};

export const CURRENCIES = ["INR", "USD", "EUR", "GBP", "AUD", "CAD"];

export const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
  AUD: "A$",
  CAD: "C$",
};

export const PROFESSIONS = [
  "UI/UX Designer",
  "Web Designer",
  "Developer",
  "Graphic Designer",
  "Brand Designer",
  "Marketing",
  "Copywriter",
  "Video Editor",
  "Consultant",
  "Agency",
  "Other",
];
