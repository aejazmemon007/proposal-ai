import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { supabase, isSupabaseConfigured } from "./supabase";
import type {
  User, Proposal, Client, Notification, ProposalStatus, PricingModel, ProposalStyle,
  AdminTransaction, AdminUserView, SubscriptionPlan
} from "../types";

const FAKE_DOMAINS = [
  "test.com", "example.com", "dummy.com", "fake.com", "asdf.com",
  "123.com", "sample.com", "tempmail.com", "mailinator.com", "yopmail.com",
  "test.in", "example.org", "example.net", "test.org", "dummy.org"
];

export function isRealEmail(email: string): boolean {
  const clean = email.trim().toLowerCase();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(clean)) return false;
  const domain = clean.split("@")[1];
  if (!domain || FAKE_DOMAINS.includes(domain)) return false;
  if (clean.startsWith("test@") || clean.startsWith("dummy@") || clean.startsWith("fake@")) return false;
  return true;
}

const STORAGE_KEYS = {
  user: "pai_user",
  accounts: "pai_accounts",
  proposals: "pai_proposals",
  clients: "pai_clients",
  darkMode: "pai_dark",
  notifications: "pai_notifications",
};

export interface RegisteredAccount {
  email: string;
  password: string;
  user: User;
}

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
  // Admin Methods
  getAllPlatformUsers: () => Promise<AdminUserView[]>;
  updateUserPlanByAdmin: (userId: string, newPlan: SubscriptionPlan) => Promise<void>;
  resetUserUsageByAdmin: (userId: string) => Promise<void>;
  deleteUserByAdmin: (userId: string) => Promise<void>;
  getAllTransactions: () => AdminTransaction[];
  verifyTransaction: (txId: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => load<User | null>(STORAGE_KEYS.user, null));
  const [proposals, setProposals] = useState<Proposal[]>(() => load<Proposal[]>(STORAGE_KEYS.proposals, []));
  const [clients, setClients] = useState<Client[]>(() => load<Client[]>(STORAGE_KEYS.clients, []));
  const [darkMode, setDarkMode] = useState<boolean>(() => load<boolean>(STORAGE_KEYS.darkMode, false));
  const [notifications, setNotifications] = useState<Notification[]>(() => load<Notification[]>(STORAGE_KEYS.notifications, []));

  // One-time startup sanitization: purge any legacy dummy test accounts and orphan test proposals
  useEffect(() => {
    try {
      const rawAccounts = localStorage.getItem(STORAGE_KEYS.accounts);
      if (rawAccounts) {
        const parsed = JSON.parse(rawAccounts);
        if (Array.isArray(parsed)) {
          const validAccounts = parsed.filter((a: any) => isRealEmail(a.email) && a.password && a.password.length >= 6);
          if (validAccounts.length !== parsed.length) {
            localStorage.setItem(STORAGE_KEYS.accounts, JSON.stringify(validAccounts));
          }
        }
      }

      const rawProposals = localStorage.getItem(STORAGE_KEYS.proposals);
      if (rawProposals) {
        const parsed = JSON.parse(rawProposals);
        if (Array.isArray(parsed)) {
          const validProposals = parsed.filter((p: any) => 
            p.userId && p.userId !== "dummy" && p.userId !== "user" && !p.projectName?.includes("SaaS Dashboard Redesign")
          );
          if (validProposals.length !== parsed.length) {
            localStorage.setItem(STORAGE_KEYS.proposals, JSON.stringify(validProposals));
            setProposals(validProposals);
          }
        }
      }

      const rawClients = localStorage.getItem(STORAGE_KEYS.clients);
      if (rawClients) {
        const parsed = JSON.parse(rawClients);
        if (Array.isArray(parsed)) {
          const validClients = parsed.filter((c: any) => c.userId && c.userId !== "dummy" && c.userId !== "user");
          if (validClients.length !== parsed.length) {
            localStorage.setItem(STORAGE_KEYS.clients, JSON.stringify(validClients));
            setClients(validClients);
          }
        }
      }
    } catch {}
  }, []);

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

  const login = useCallback(async (email: string, password: string) => {
    await new Promise((r) => setTimeout(r, 600));

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !isRealEmail(cleanEmail)) {
      throw new Error("Please enter a valid, authentic email address (e.g. yourname@gmail.com). Test or dummy email domains are not allowed.");
    }
    if (!password) {
      throw new Error("Please enter your password.");
    }

    // 1. Cloud Database (Supabase) if configured
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        throw new Error(error.message || "Failed to sign in. Please verify your credentials.");
      }

      if (data.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .single();

        const loadedUser: User = profile ? {
          id: profile.id,
          email: profile.email,
          firstName: profile.first_name || "",
          lastName: profile.last_name || "",
          profession: profile.profession,
          experience: profile.experience,
          currency: profile.currency || "INR",
          businessName: profile.business_name,
          website: profile.website,
          phone: profile.phone,
          location: profile.location,
          logoUrl: profile.logo_url,
          primaryColor: profile.primary_color || "#7c3aed",
          colorMode: profile.color_mode || "gradient",
          gradientFrom: profile.gradient_from || "#7c3aed",
          gradientTo: profile.gradient_to || "#4f46e5",
          gradientAngle: profile.gradient_angle || 135,
          hideWatermark: profile.hide_watermark || false,
          tagline: profile.tagline,
          upiId: profile.upi_id || "proposal.ai@upi",
          upiName: profile.upi_name,
          bankName: profile.bank_name,
          accountNumber: profile.account_number,
          ifscCode: profile.ifsc_code,
          subscription: (profile.subscription as any) || "free",
          usageThisMonth: profile.usage_this_month || 0,
          onboardingComplete: true,
        } : {
          id: data.user.id,
          email: cleanEmail,
          firstName: data.user.user_metadata?.firstName || "User",
          lastName: data.user.user_metadata?.lastName || "",
          currency: "INR",
          subscription: "free",
          usageThisMonth: 0,
          onboardingComplete: true,
        };

        setUser(loadedUser);

        // Fetch user's proposals from Supabase
        const { data: cloudProposals } = await supabase
          .from("proposals")
          .select("*")
          .eq("user_id", data.user.id)
          .order("created_at", { ascending: false });

        if (cloudProposals && cloudProposals.length > 0) {
          const mapped: Proposal[] = cloudProposals.map((cp) => ({
            id: cp.id,
            userId: cp.user_id,
            clientName: cp.client_name,
            projectName: cp.project_name,
            clientEmail: cp.client_email,
            status: cp.status,
            price: Number(cp.price) || 0,
            currency: cp.currency || "INR",
            pricingModel: cp.pricing_model || "fixed",
            templateId: cp.template_id || "modern-minimal",
            publicToken: cp.public_token,
            content: cp.content,
            briefAnalysis: cp.brief_analysis,
            viewCount: cp.view_count || 0,
            viewedAt: cp.viewed_at,
            acceptedAt: cp.accepted_at,
            rejectedAt: cp.rejected_at,
            rejectionReason: cp.rejection_reason,
            createdAt: cp.created_at,
            updatedAt: cp.updated_at,
            projectType: "Design",
            brief: "",
            scopeItems: [],
            style: "professional",
            tone: 40,
            length: 60,
            salesFocus: 50,
          }));
          setProposals(mapped);
        }

        // Fetch user's clients from Supabase
        const { data: cloudClients } = await supabase
          .from("clients")
          .select("*")
          .eq("user_id", data.user.id);

        if (cloudClients && cloudClients.length > 0) {
          setClients(cloudClients.map((cc) => ({
            id: cc.id,
            name: cc.name,
            email: cc.email,
            company: cc.company,
            phone: cc.phone,
            status: cc.status,
            totalRevenue: Number(cc.total_revenue) || 0,
            currency: cc.currency || "INR",
            proposalsCount: 0,
            createdAt: cc.created_at,
          })));
        }

        return;
      }
    }

    // 2. Fallback to Local Storage accounts
    const accounts = load<RegisteredAccount[]>(STORAGE_KEYS.accounts, []);
    const account = accounts.find((a) => a.email.toLowerCase() === cleanEmail);

    if (!account) {
      throw new Error("No account found with this email. Please check your email or sign up.");
    }

    if (account.password !== password) {
      throw new Error("Incorrect password. Please verify your credentials and try again.");
    }

    setUser(account.user);
  }, []);

  const signup = useCallback(async (email: string, password: string, firstName: string, lastName: string) => {
    await new Promise((r) => setTimeout(r, 600));

    const cleanEmail = email.trim().toLowerCase();
    const cleanFirst = firstName.trim();
    const cleanLast = lastName.trim();

    if (!cleanEmail || !isRealEmail(cleanEmail)) {
      throw new Error("Please enter a valid, authentic email address (e.g. yourname@gmail.com). Test and dummy domains are not permitted.");
    }
    if (cleanFirst.length < 2 || cleanLast.length < 2) {
      throw new Error("Please enter both your real first and last name (at least 2 letters each).");
    }
    const dummyNamePattern = /^(test|dummy|asdf|fake|sample|none|user|admin)$/i;
    if (dummyNamePattern.test(cleanFirst) || dummyNamePattern.test(cleanLast)) {
      throw new Error("Dummy personal names (test, dummy, asdf) are not permitted. Please enter your real name.");
    }
    if (password.length < 8) {
      throw new Error("Password must be at least 8 characters long for account security.");
    }

    // 1. Cloud Database (Supabase) if configured
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: { firstName: cleanFirst, lastName: cleanLast },
        },
      });

      if (error) {
        throw new Error(error.message || "Failed to create cloud account. Please try again.");
      }

      if (data.user) {
        const newUser: User = {
          id: data.user.id,
          email: cleanEmail,
          firstName: cleanFirst,
          lastName: cleanLast,
          currency: "INR",
          subscription: "free",
          usageThisMonth: 0,
          onboardingComplete: false,
        };

        // Create initial profile in Supabase
        await supabase.from("profiles").upsert({
          id: data.user.id,
          email: cleanEmail,
          first_name: cleanFirst,
          last_name: cleanLast,
          subscription: "free",
          currency: "INR",
        });

        setUser(newUser);
        return;
      }
    }

    // 2. Fallback to Local Storage accounts
    const accounts = load<RegisteredAccount[]>(STORAGE_KEYS.accounts, []);
    const existing = accounts.find((a) => a.email.toLowerCase() === cleanEmail);
    if (existing) {
      throw new Error("An account with this email already exists. Please sign in instead.");
    }

    const newUser: User = {
      id: generateId(),
      email: cleanEmail,
      firstName: cleanFirst,
      lastName: cleanLast,
      currency: "INR",
      subscription: "free",
      usageThisMonth: 0,
      onboardingComplete: false,
    };

    save(STORAGE_KEYS.accounts, [...accounts, { email: cleanEmail, password, user: newUser }]);
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    if (isSupabaseConfigured && supabase) {
      supabase.auth.signOut().catch(() => {});
    }
    setUser(null);
    try {
      localStorage.removeItem(STORAGE_KEYS.user);
    } catch {}
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };

      // Local accounts update
      const accounts = load<RegisteredAccount[]>(STORAGE_KEYS.accounts, []);
      const updatedAccounts = accounts.map((acc) =>
        acc.email.toLowerCase() === updated.email.toLowerCase() ? { ...acc, user: updated } : acc
      );
      save(STORAGE_KEYS.accounts, updatedAccounts);

      // Cloud profile update if Supabase is active
      if (isSupabaseConfigured && supabase) {
        supabase.from("profiles").update({
          first_name: updated.firstName,
          last_name: updated.lastName,
          profession: updated.profession,
          experience: updated.experience,
          currency: updated.currency,
          business_name: updated.businessName,
          website: updated.website,
          phone: updated.phone,
          location: updated.location,
          logo_url: updated.logoUrl,
          primary_color: updated.primaryColor,
          color_mode: updated.colorMode,
          gradient_from: updated.gradientFrom,
          gradient_to: updated.gradientTo,
          gradient_angle: updated.gradientAngle,
          hide_watermark: updated.hideWatermark,
          tagline: updated.tagline,
          upi_id: updated.upiId,
          upi_name: updated.upiName,
          bank_name: updated.bankName,
          account_number: updated.accountNumber,
          ifsc_code: updated.ifscCode,
          subscription: updated.subscription,
          usage_this_month: updated.usageThisMonth,
        }).eq("id", updated.id).then();
      }

      return updated;
    });
  }, []);

  const completeOnboarding = useCallback((data: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...data, onboardingComplete: true };
      const accounts = load<RegisteredAccount[]>(STORAGE_KEYS.accounts, []);
      const updatedAccounts = accounts.map((acc) =>
        acc.email.toLowerCase() === updated.email.toLowerCase() ? { ...acc, user: updated } : acc
      );
      save(STORAGE_KEYS.accounts, updatedAccounts);

      if (isSupabaseConfigured && supabase) {
        supabase.from("profiles").update({
          profession: updated.profession,
          experience: updated.experience,
          currency: updated.currency,
          business_name: updated.businessName,
        }).eq("id", updated.id).then();
      }

      return updated;
    });
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

    if (isSupabaseConfigured && supabase && user) {
      supabase.from("proposals").insert({
        id: p.id,
        user_id: user.id,
        project_name: p.projectName,
        client_name: p.clientName || "Client",
        client_email: p.clientEmail,
        status: p.status,
        price: p.price,
        currency: p.currency,
        pricing_model: p.pricingModel,
        template_id: p.templateId || "modern-minimal",
        public_token: p.publicToken,
        content: p.content,
        brief_analysis: p.briefAnalysis,
      }).then();
    }

    return p;
  }, [user]);

  const updateProposal = useCallback((id: string, updates: Partial<Proposal>) => {
    setProposals((prev) =>
      prev.map((p) => p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p)
    );

    if (isSupabaseConfigured && supabase) {
      supabase.from("proposals").update({
        project_name: updates.projectName,
        client_name: updates.clientName,
        status: updates.status,
        price: updates.price,
        content: updates.content,
        view_count: updates.viewCount,
        viewed_at: updates.viewedAt,
        accepted_at: updates.acceptedAt,
        rejected_at: updates.rejectedAt,
        rejection_reason: updates.rejectionReason,
        updated_at: new Date().toISOString(),
      }).eq("id", id).then();
    }
  }, []);

  const deleteProposal = useCallback((id: string) => {
    setProposals((prev) => prev.filter((p) => p.id !== id));
    if (isSupabaseConfigured && supabase) {
      supabase.from("proposals").delete().eq("id", id).then();
    }
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

    if (isSupabaseConfigured && supabase && user) {
      supabase.from("proposals").insert({
        id: dup.id,
        user_id: user.id,
        project_name: dup.projectName,
        client_name: dup.clientName || "Client",
        client_email: dup.clientEmail,
        status: dup.status,
        price: dup.price,
        currency: dup.currency,
        pricing_model: dup.pricingModel,
        template_id: dup.templateId || "modern-minimal",
        content: dup.content,
      }).then();
    }

    return dup;
  }, [proposals, user]);

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

    if (isSupabaseConfigured && supabase && user) {
      supabase.from("clients").insert({
        id: c.id,
        user_id: user.id,
        name: c.name,
        email: c.email,
        company: c.company,
        phone: c.phone,
        status: c.status,
        total_revenue: c.totalRevenue,
        currency: c.currency,
      }).then();
    }

    return c;
  }, [user]);

  const updateClient = useCallback((id: string, updates: Partial<Client>) => {
    setClients((prev) => prev.map((c) => c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c));
    if (isSupabaseConfigured && supabase) {
      supabase.from("clients").update({
        name: updates.name,
        email: updates.email,
        company: updates.company,
        phone: updates.phone,
        status: updates.status,
        total_revenue: updates.totalRevenue,
      }).eq("id", id).then();
    }
  }, []);

  const deleteClient = useCallback((id: string) => {
    setClients((prev) => prev.filter((c) => c.id !== id));
    if (isSupabaseConfigured && supabase) {
      supabase.from("clients").delete().eq("id", id).then();
    }
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

  // Admin Methods for managing all users & subscription transactions
  const getAllPlatformUsers = useCallback(async (): Promise<AdminUserView[]> => {
    let result: AdminUserView[] = [];

    // 1. Supabase Cloud if available
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: profiles } = await supabase.from("profiles").select("*");
        if (profiles && profiles.length > 0) {
          result = profiles.map((p) => ({
            id: p.id,
            email: p.email,
            firstName: p.first_name || "User",
            lastName: p.last_name || "",
            profession: p.profession,
            businessName: p.business_name,
            currency: p.currency || "INR",
            subscription: (p.subscription as SubscriptionPlan) || "free",
            usageThisMonth: p.usage_this_month || 0,
            onboardingComplete: true,
            status: "active",
            joinedAt: p.created_at || new Date().toISOString(),
          }));
        }
      } catch (err) {
        console.warn("Could not fetch cloud profiles:", err);
      }
    }

    // 2. Merge local registered accounts
    const accounts = load<RegisteredAccount[]>(STORAGE_KEYS.accounts, []);
    accounts.forEach((acc) => {
      const existing = result.find((u) => u.email.toLowerCase() === acc.email.toLowerCase());
      if (!existing) {
        result.push({
          ...acc.user,
          status: "active",
          joinedAt: new Date().toISOString(),
        });
      } else {
        existing.subscription = acc.user.subscription;
        existing.usageThisMonth = acc.user.usageThisMonth;
      }
    });

    // 3. Count proposals and clients for each user
    const allProposals = load<Proposal[]>(STORAGE_KEYS.proposals, []);
    const allClients = load<Client[]>(STORAGE_KEYS.clients, []);
    result.forEach((u) => {
      u.proposalsCount = allProposals.filter((p) => p.userId === u.id).length;
      u.clientsCount = allClients.filter((c) => c.userId === u.id).length;
    });

    return result;
  }, []);

  const updateUserPlanByAdmin = useCallback(async (userId: string, newPlan: SubscriptionPlan) => {
    // 1. Update in local accounts
    const accounts = load<RegisteredAccount[]>(STORAGE_KEYS.accounts, []);
    const updatedAccounts = accounts.map((acc) => {
      if (acc.user.id === userId) {
        return {
          ...acc,
          user: { ...acc.user, subscription: newPlan }
        };
      }
      return acc;
    });
    save(STORAGE_KEYS.accounts, updatedAccounts);

    // If current logged-in user is this user, update active user state
    setUser((prev) => (prev && prev.id === userId ? { ...prev, subscription: newPlan } : prev));

    // 2. Update Supabase if configured
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from("profiles").update({ subscription: newPlan }).eq("id", userId);
      } catch {}
    }
  }, []);

  const resetUserUsageByAdmin = useCallback(async (userId: string) => {
    const accounts = load<RegisteredAccount[]>(STORAGE_KEYS.accounts, []);
    const updatedAccounts = accounts.map((acc) => {
      if (acc.user.id === userId) {
        return {
          ...acc,
          user: { ...acc.user, usageThisMonth: 0 }
        };
      }
      return acc;
    });
    save(STORAGE_KEYS.accounts, updatedAccounts);

    setUser((prev) => (prev && prev.id === userId ? { ...prev, usageThisMonth: 0 } : prev));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from("profiles").update({ usage_this_month: 0 }).eq("id", userId);
      } catch {}
    }
  }, []);

  const deleteUserByAdmin = useCallback(async (userId: string) => {
    const accounts = load<RegisteredAccount[]>(STORAGE_KEYS.accounts, []);
    const remaining = accounts.filter((acc) => acc.user.id !== userId);
    save(STORAGE_KEYS.accounts, remaining);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from("profiles").delete().eq("id", userId);
      } catch {}
    }
  }, []);

  const getAllTransactions = useCallback((): AdminTransaction[] => {
    return load<AdminTransaction[]>("pai_admin_transactions", []);
  }, []);

  const verifyTransaction = useCallback((txId: string) => {
    const txs = load<AdminTransaction[]>("pai_admin_transactions", []);
    const target = txs.find((t) => t.id === txId);
    if (!target) return;

    target.status = "verified";
    target.verifiedAt = new Date().toISOString();
    save("pai_admin_transactions", txs);

    if (target.userId && target.userId !== "guest") {
      updateUserPlanByAdmin(target.userId, target.planId);
    }
  }, [updateUserPlanByAdmin]);

  // Strict user isolation: users only see their own real proposals and clients
  const userProposals = useMemo(() => {
    if (!user) return [];
    return proposals.filter((p) => p.userId === user.id);
  }, [proposals, user]);

  const userClients = useMemo(() => {
    if (!user) return [];
    return clients.filter((c) => c.userId === user.id);
  }, [clients, user]);

  return (
    <AppContext.Provider value={{
      user, isAuthenticated: !!user, proposals: userProposals, clients: userClients, darkMode, notifications,
      login, signup, logout, updateUser, completeOnboarding,
      createProposal, updateProposal, deleteProposal, duplicateProposal, getProposal, saveProposalDirectly,
      createClient, updateClient, deleteClient, getClient,
      toggleDarkMode, markNotificationRead, addNotification, incrementUsage,
      getAllPlatformUsers, updateUserPlanByAdmin, resetUserUsageByAdmin, deleteUserByAdmin,
      getAllTransactions, verifyTransaction,
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

