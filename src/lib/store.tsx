import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type {
  User, Proposal, Client, Notification, ProposalStatus, PricingModel, ProposalStyle
} from "../types";

const STORAGE_KEYS = {
  user: "pai_user",
  proposals: "pai_proposals",
  clients: "pai_clients",
  darkMode: "pai_dark",
  notifications: "pai_notifications",
};

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function generateToken() {
  return Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10);
}

function load<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage quota exceeded
  }
}

const SEED_USER: User = {
  id: "user-demo",
  email: "alex@designstudio.in",
  firstName: "Alex",
  lastName: "Rivera",
  profession: "UI/UX Designer",
  experience: "3-5 years",
  currency: "INR",
  businessName: "Rivera Design Studio",
  website: "https://riveradesign.in",
  phone: "+91 98765 43210",
  location: "Bangalore, India",
  primaryColor: "#7c3aed",
  tagline: "Premium UI/UX Design for modern products",
  subscription: "pro",
  usageThisMonth: 4,
  onboardingComplete: true,
};

const SEED_CLIENTS: Client[] = [
  { id: "c1", userId: "user-demo", name: "Rahul Sharma", company: "Acme Technologies", email: "rahul@acmetech.in", website: "https://acmetech.in", notes: "Series A startup. Decision maker. Responsive via WhatsApp.", createdAt: "2026-07-10T09:00:00Z", updatedAt: "2026-09-01T12:00:00Z" },
  { id: "c2", userId: "user-demo", name: "Priya Mehta", company: "Startup XYZ", email: "priya@startupxyz.com", website: "https://startupxyz.com", notes: "Fast-growing D2C brand. Multiple projects possible.", createdAt: "2026-07-20T10:00:00Z", updatedAt: "2026-08-15T14:00:00Z" },
  { id: "c3", userId: "user-demo", name: "Arjun Kumar", company: "RetailCo India", email: "arjun@retailco.in", notes: "E-commerce. Prefers detailed proposals.", createdAt: "2026-08-01T11:00:00Z", updatedAt: "2026-09-05T09:00:00Z" },
  { id: "c4", userId: "user-demo", name: "Neha Joshi", company: "TechVentures", email: "neha@techventures.io", website: "https://techventures.io", notes: "Mobile-first product. Design-aware team.", createdAt: "2026-08-10T08:00:00Z", updatedAt: "2026-09-08T16:00:00Z" },
  { id: "c5", userId: "user-demo", name: "Rohit Gupta", company: "GrowthCo", email: "rohit@growthco.in", notes: "Marketing agency. Tight budget but consistent work.", createdAt: "2026-08-20T13:00:00Z", updatedAt: "2026-09-02T11:00:00Z" },
];

const SEED_PROPOSALS: Proposal[] = [
  {
    id: "p1", userId: "user-demo", clientId: "c1", clientName: "Rahul Sharma", company: "Acme Technologies",
    clientEmail: "rahul@acmetech.in", projectName: "SaaS Dashboard Redesign", projectType: "UI/UX Design",
    brief: "We need a complete redesign of our SaaS dashboard. The current one is outdated and our users find it confusing. We have around 20 screens that need to be redesigned with better navigation and a modern look.",
    scopeItems: [
      { id: "s1", title: "UX Audit", description: "Review current interface and identify friction points", included: true },
      { id: "s2", title: "Information Architecture", description: "Restructure navigation and content hierarchy", included: true },
      { id: "s3", title: "User Flows", description: "Map key user journeys and task flows", included: true },
      { id: "s4", title: "High-Fidelity UI Design", description: "20 screens in Figma with full visual design", included: true },
      { id: "s5", title: "Design System", description: "Component library with documentation", included: true },
      { id: "s6", title: "Interactive Prototype", description: "Clickable prototype for stakeholder review", included: true },
      { id: "s7", title: "Developer Handoff", description: "Annotated files with assets and specs", included: true },
    ],
    pricingModel: "fixed", price: 45000, currency: "INR",
    paymentSchedule: "50% upfront, 50% on delivery", timeline: "5 weeks",
    style: "professional", tone: 40, length: 60, salesFocus: 50,
    status: "viewed", publicToken: "abc123def456",
    viewCount: 3, viewedAt: "2026-09-08T14:32:00Z",
    content: {
      title: "SaaS Dashboard Redesign",
      introduction: "Thank you for the opportunity to work on the SaaS Dashboard Redesign project. After reviewing your brief carefully, I have a clear picture of what you're looking for and I'm confident I can deliver results that genuinely improve usability for your users.\n\nThis proposal outlines the full scope, timeline, and investment. Everything here is open to discussion—my goal is to make sure we're aligned before we begin.",
      project_understanding: "Acme Technologies has a SaaS product with a dashboard that has grown organically over time, resulting in a fragmented experience. Your users—primarily account managers and operations staff—find it confusing and frequently miss important features.\n\nThe redesign needs to serve both new and experienced users without requiring a steep learning curve. With approximately 20 screens in scope, the project is substantial but well-defined.",
      goals: ["Modernize the visual design language to align with current product standards", "Restructure navigation so core workflows are accessible within 2 clicks", "Improve information hierarchy so users see what matters first", "Create a consistent component library for future development"],
      proposed_solution: "I'll approach this as a structured design process—starting with a focused audit before touching any design. From there, I'll redesign the navigation architecture, establish a component system, and progressively build out all 20 screens with responsive variants.\n\nYou'll see early work within the first 10 days, giving you time to redirect before I go deep on any section.",
      scope: ["UX Audit", "Information Architecture", "User Flows", "High-Fidelity UI Design", "Design System", "Interactive Prototype", "Developer Handoff"],
      deliverables: ["Audit report with prioritized recommendations", "Revised site map and navigation structure", "User flow diagrams for 5 key journeys", "20 high-fidelity Figma screens", "Component library (50+ components)", "Interactive Figma prototype", "Developer handoff with specs and exported assets"],
      timeline: [
        { phase: "Discovery & Audit", duration: "Week 1", description: "Review existing product, interview 2–3 users if available, define success criteria" },
        { phase: "Architecture & Flows", duration: "Week 1–2", description: "New information architecture, navigation structure, user flow maps" },
        { phase: "UI Design", duration: "Week 2–4", description: "All 20 screens designed in Figma, component library, responsive variants" },
        { phase: "Review & Polish", duration: "Week 4–5", description: "Client review rounds, refinements, prototype built" },
        { phase: "Handoff", duration: "Week 5", description: "Final files, documentation, asset export, developer walkthrough" },
      ],
      investment: { total: 45000, currency: "INR", model: "fixed", breakdown: "Fixed price: ₹45,000" },
      payment_terms: "50% deposit (₹22,500) before work begins. Remaining 50% (₹22,500) due on final delivery. Payment via bank transfer or UPI.",
      revisions: "2 rounds of revisions included at each milestone. Additional rounds at ₹2,500/round. Revisions apply to agreed scope only—new requirements are handled as scope additions.",
      exclusions: ["Web development or coding", "Stock photography or illustration", "Copywriting or content strategy", "Animation or motion design (available as add-on)", "User research sessions beyond initial audit"],
      assumptions: ["Existing brand guidelines and assets available within 3 days of project start", "One primary point of contact for approvals", "Feedback within 3 business days of each submission", "Scope limited to the 20 screens discussed"],
      terms: "All deliverables become property of Acme Technologies upon receipt of final payment. Rivera Design Studio retains the right to display work in portfolio unless otherwise agreed. Project paused >30 days due to client delays may incur restart fee. Either party may terminate with 7 days notice; work completed to date is billable.\n\n[Template terms — review with legal counsel before use.]",
      next_steps: "To move forward:\n1. Confirm you'd like to proceed\n2. Sign the project agreement\n3. Submit the ₹22,500 deposit\n4. I'll send a kick-off doc with all the info I need to get started\n\nLooking forward to working on this with you.",
    },
    createdAt: "2026-09-01T10:00:00Z", updatedAt: "2026-09-08T14:32:00Z",
    sentAt: "2026-09-05T11:00:00Z",
  },
  {
    id: "p2", userId: "user-demo", clientId: "c2", clientName: "Priya Mehta", company: "Startup XYZ",
    clientEmail: "priya@startupxyz.com", projectName: "Brand Identity Package", projectType: "Brand Identity",
    brief: "We are a new D2C skincare brand launching in 3 months. We need a complete brand identity including logo, color system, typography, and brand guidelines.",
    scopeItems: [
      { id: "s1", title: "Logo Design", description: "Primary logo with 3 concept directions", included: true },
      { id: "s2", title: "Color System", description: "Primary and secondary palette with usage rules", included: true },
      { id: "s3", title: "Typography System", description: "Font selection and hierarchy guidelines", included: true },
      { id: "s4", title: "Brand Guidelines", description: "40-page brand book with usage rules", included: true },
      { id: "s5", title: "Social Media Templates", description: "10 editable Canva templates", included: true },
    ],
    pricingModel: "fixed", price: 28000, currency: "INR",
    timeline: "4 weeks", style: "premium", tone: 30, length: 50, salesFocus: 40,
    status: "accepted", publicToken: "xyz789ghi012",
    viewCount: 5, viewedAt: "2026-08-28T10:15:00Z", acceptedAt: "2026-08-30T16:45:00Z",
    content: undefined,
    createdAt: "2026-08-20T09:00:00Z", updatedAt: "2026-08-30T16:45:00Z",
    sentAt: "2026-08-24T11:30:00Z",
  },
  {
    id: "p3", userId: "user-demo", clientId: "c3", clientName: "Arjun Kumar", company: "RetailCo India",
    clientEmail: "arjun@retailco.in", projectName: "E-commerce Website Redesign", projectType: "Web Design",
    brief: "Our e-commerce website is 5 years old and badly needs a redesign. We sell home décor products and want a premium feel. We get around 50,000 visits/month but conversion rate is only 0.8%.",
    scopeItems: [
      { id: "s1", title: "UX Audit", description: "Conversion funnel analysis and friction points", included: true },
      { id: "s2", title: "Homepage Redesign", description: "Full homepage with hero and sections", included: true },
      { id: "s3", title: "Product Listing Page", description: "Category and search results page", included: true },
      { id: "s4", title: "Product Detail Page", description: "PDP with all required components", included: true },
      { id: "s5", title: "Cart & Checkout Flow", description: "3-step checkout redesign", included: true },
      { id: "s6", title: "Mobile Design", description: "Full mobile responsive variants", included: true },
    ],
    pricingModel: "milestone", price: 65000, currency: "INR",
    milestones: [
      { id: "m1", title: "Discovery & Audit", description: "UX audit + recommendations", amount: 12000, dueWeek: 1 },
      { id: "m2", title: "Design: Homepage + Category", description: "2 key pages designed", amount: 22000, dueWeek: 3 },
      { id: "m3", title: "Design: PDP + Checkout", description: "Conversion-critical pages", amount: 18000, dueWeek: 5 },
      { id: "m4", title: "Mobile + Final Delivery", description: "Mobile variants and handoff", amount: 13000, dueWeek: 7 },
    ],
    timeline: "7 weeks", style: "professional", tone: 40, length: 70, salesFocus: 60,
    status: "draft",
    content: undefined,
    createdAt: "2026-09-05T14:00:00Z", updatedAt: "2026-09-09T10:00:00Z",
  },
  {
    id: "p4", userId: "user-demo", clientId: "c4", clientName: "Neha Joshi", company: "TechVentures",
    clientEmail: "neha@techventures.io", projectName: "Mobile App UI/UX Design", projectType: "UI/UX Design",
    brief: "We're building a fintech app for expense tracking and need a designer to design the full app UI. We have a rough wireframe but need proper design. iOS and Android.",
    scopeItems: [
      { id: "s1", title: "UI Design", description: "All app screens (est. 30 screens)", included: true },
      { id: "s2", title: "Design System", description: "Reusable component library", included: true },
      { id: "s3", title: "Interactive Prototype", description: "Figma clickable prototype", included: true },
      { id: "s4", title: "Developer Handoff", description: "Figma with specs and assets", included: true },
    ],
    pricingModel: "fixed", price: 52000, currency: "INR",
    timeline: "6 weeks", style: "professional", tone: 35, length: 55, salesFocus: 45,
    status: "sent", publicToken: "mno345pqr678",
    content: undefined,
    createdAt: "2026-09-07T11:00:00Z", updatedAt: "2026-09-09T08:00:00Z",
    sentAt: "2026-09-09T08:00:00Z",
  },
  {
    id: "p5", userId: "user-demo", clientId: "c5", clientName: "Rohit Gupta", company: "GrowthCo",
    clientEmail: "rohit@growthco.in", projectName: "Marketing Landing Page", projectType: "Web Design",
    brief: "Need a high-converting landing page for our new lead generation product. Should be fast, clean, and optimized for conversions.",
    scopeItems: [
      { id: "s1", title: "Landing Page Design", description: "Full landing page in Figma", included: true },
      { id: "s2", title: "Mobile Design", description: "Mobile responsive variant", included: true },
    ],
    pricingModel: "fixed", price: 18000, currency: "INR",
    timeline: "2 weeks", style: "persuasive", tone: 50, length: 40, salesFocus: 70,
    status: "rejected",
    content: undefined,
    createdAt: "2026-08-25T09:00:00Z", updatedAt: "2026-09-01T15:00:00Z",
    sentAt: "2026-08-27T10:00:00Z",
    rejectedAt: "2026-09-01T15:00:00Z",
    rejectionReason: "Budget",
  },
];

interface AppContextType {
  user: User | null;
  isAuthenticated: boolean;
  proposals: Proposal[];
  clients: Client[];
  darkMode: boolean;
  notifications: Notification[];
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  completeOnboarding: (data: Partial<User>) => void;
  createProposal: (data: Partial<Proposal>) => Proposal;
  updateProposal: (id: string, updates: Partial<Proposal>) => void;
  deleteProposal: (id: string) => void;
  duplicateProposal: (id: string) => Proposal;
  getProposal: (id: string) => Proposal | undefined;
  saveProposalDirectly: (proposal: Proposal) => void;
  createClient: (data: Partial<Client>) => Client;
  updateClient: (id: string, updates: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  getClient: (id: string) => Client | undefined;
  toggleDarkMode: () => void;
  markNotificationRead: (id: string) => void;
  addNotification: (n: Omit<Notification, "id" | "read" | "createdAt">) => void;
  incrementUsage: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => load<User | null>(STORAGE_KEYS.user, null));
  const [proposals, setProposals] = useState<Proposal[]>(() => {
    const stored = load<Proposal[]>(STORAGE_KEYS.proposals, []);
    if (stored.length > 0) return stored;
    return SEED_PROPOSALS;
  });
  const [clients, setClients] = useState<Client[]>(() => {
    const stored = load<Client[]>(STORAGE_KEYS.clients, []);
    if (stored.length > 0) return stored;
    return SEED_CLIENTS;
  });
  const [darkMode, setDarkMode] = useState<boolean>(() => load<boolean>(STORAGE_KEYS.darkMode, false));
  const [notifications, setNotifications] = useState<Notification[]>(() =>
    load<Notification[]>(STORAGE_KEYS.notifications, [
      { id: "n1", type: "viewed", title: "Proposal viewed", message: "Rahul Sharma viewed your SaaS Dashboard proposal", read: false, createdAt: "2026-09-08T14:32:00Z", proposalId: "p1" },
      { id: "n2", type: "accepted", title: "Proposal accepted!", message: "Priya Mehta accepted the Brand Identity proposal", read: false, createdAt: "2026-08-30T16:45:00Z", proposalId: "p2" },
    ])
  );

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  useEffect(() => { save(STORAGE_KEYS.user, user); }, [user]);
  useEffect(() => { save(STORAGE_KEYS.proposals, proposals); }, [proposals]);
  useEffect(() => { save(STORAGE_KEYS.clients, clients); }, [clients]);
  useEffect(() => { save(STORAGE_KEYS.darkMode, darkMode); }, [darkMode]);
  useEffect(() => { save(STORAGE_KEYS.notifications, notifications); }, [notifications]);

  const login = useCallback(async (email: string, _password: string) => {
    await new Promise((r) => setTimeout(r, 1000));
    const u = { ...SEED_USER, email, id: "user-demo" };
    setUser(u);
    if (proposals.length === 0) setProposals(SEED_PROPOSALS);
    if (clients.length === 0) setClients(SEED_CLIENTS);
  }, [proposals.length, clients.length]);

  const signup = useCallback(async (email: string, _password: string, firstName: string, lastName: string) => {
    await new Promise((r) => setTimeout(r, 1000));
    const u: User = { id: generateId(), email, firstName, lastName, currency: "INR", subscription: "free", usageThisMonth: 0, onboardingComplete: false };
    setUser(u);
    setProposals([]);
    setClients([]);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser((prev) => prev ? { ...prev, ...updates } : prev);
  }, []);

  const completeOnboarding = useCallback((data: Partial<User>) => {
    setUser((prev) => prev ? { ...prev, ...data, onboardingComplete: true } : prev);
  }, []);

  const createProposal = useCallback((data: Partial<Proposal>): Proposal => {
    const now = new Date().toISOString();
    const p: Proposal = {
      id: generateId(), userId: user?.id || "user", clientName: "", company: "",
      projectName: "Untitled Proposal", projectType: "Design", brief: "",
      scopeItems: [], pricingModel: "fixed", price: 0, currency: user?.currency || "INR",
      style: "professional", tone: 40, length: 60, salesFocus: 50, status: "draft",
      createdAt: now, updatedAt: now, ...data,
    };
    setProposals((prev) => [p, ...prev]);
    return p;
  }, [user]);

  const updateProposal = useCallback((id: string, updates: Partial<Proposal>) => {
    setProposals((prev) =>
      prev.map((p) => p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p)
    );
  }, []);

  const deleteProposal = useCallback((id: string) => {
    setProposals((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const duplicateProposal = useCallback((id: string): Proposal => {
    const orig = proposals.find((p) => p.id === id);
    const now = new Date().toISOString();
    const dup: Proposal = {
      ...(orig || {} as Proposal),
      id: generateId(),
      projectName: `${orig?.projectName || "Proposal"} (Copy)`,
      status: "draft",
      publicToken: undefined,
      sentAt: undefined, viewedAt: undefined, acceptedAt: undefined, rejectedAt: undefined,
      viewCount: 0, createdAt: now, updatedAt: now,
    };
    setProposals((prev) => [dup, ...prev]);
    return dup;
  }, [proposals]);

  const getProposal = useCallback((id: string) => proposals.find((p) => p.id === id), [proposals]);

  const saveProposalDirectly = useCallback((prop: Proposal) => {
    setProposals((prev) => {
      const exists = prev.some((p) => p.id === prop.id || (p.publicToken && prop.publicToken && p.publicToken === prop.publicToken));
      if (exists) {
        return prev.map((p) => (p.id === prop.id || (p.publicToken && prop.publicToken && p.publicToken === prop.publicToken) ? { ...p, ...prop } : p));
      }
      return [prop, ...prev];
    });
  }, []);

  const createClient = useCallback((data: Partial<Client>): Client => {
    const now = new Date().toISOString();
    const c: Client = { id: generateId(), userId: user?.id || "user", name: "", createdAt: now, updatedAt: now, ...data };
    setClients((prev) => [c, ...prev]);
    return c;
  }, [user]);

  const updateClient = useCallback((id: string, updates: Partial<Client>) => {
    setClients((prev) => prev.map((c) => c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c));
  }, []);

  const deleteClient = useCallback((id: string) => {
    setClients((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const getClient = useCallback((id: string) => clients.find((c) => c.id === id), [clients]);

  const toggleDarkMode = useCallback(() => setDarkMode((prev) => !prev), []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  }, []);

  const addNotification = useCallback((n: Omit<Notification, "id" | "read" | "createdAt">) => {
    const notif: Notification = { ...n, id: generateId(), read: false, createdAt: new Date().toISOString() };
    setNotifications((prev) => [notif, ...prev]);
  }, []);

  const incrementUsage = useCallback(() => {
    setUser((prev) => prev ? { ...prev, usageThisMonth: prev.usageThisMonth + 1 } : prev);
  }, []);

  return (
    <AppContext.Provider value={{
      user, isAuthenticated: !!user, proposals, clients, darkMode, notifications,
      login, signup, logout, updateUser, completeOnboarding,
      createProposal, updateProposal, deleteProposal, duplicateProposal, getProposal, saveProposalDirectly,
      createClient, updateClient, deleteClient, getClient,
      toggleDarkMode, markNotificationRead, addNotification, incrementUsage,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

export function generatePublicToken() {
  return generateToken();
}

/**
 * Encodes proposal data into a URL-safe Base64 string for direct link sharing
 */
export function encodeProposalPayload(proposal: Proposal): string {
  try {
    const jsonStr = JSON.stringify(proposal);
    // URL-safe base64
    const utf8Bytes = encodeURIComponent(jsonStr).replace(/%([0-9A-F]{2})/g, (_, p1) =>
      String.fromCharCode(parseInt(p1, 16))
    );
    return btoa(utf8Bytes).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  } catch (err) {
    console.error("Failed to encode proposal payload:", err);
    return "";
  }
}

/**
 * Decodes a URL-safe Base64 string back into a Proposal object
 */
export function decodeProposalPayload(encoded: string): Proposal | null {
  try {
    let base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) {
      base64 += "=";
    }
    const binary = atob(base64);
    const jsonStr = decodeURIComponent(
      Array.prototype.map.call(binary, (ch: string) => "%" + ("00" + ch.charCodeAt(0).toString(16)).slice(-2)).join("")
    );
    const parsed = JSON.parse(jsonStr);
    if (parsed && typeof parsed === "object" && parsed.projectName) {
      return parsed as Proposal;
    }
    return null;
  } catch (err) {
    console.warn("Failed to decode proposal payload:", err);
    return null;
  }
}

