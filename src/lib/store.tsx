import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type {
  User, Proposal, Client, Notification, ProposalStatus, PricingModel, ProposalStyle
} from "../types";

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
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => load<User | null>(STORAGE_KEYS.user, null));
  const [proposals, setProposals] = useState<Proposal[]>(() => load<Proposal[]>(STORAGE_KEYS.proposals, []));
  const [clients, setClients] = useState<Client[]>(() => load<Client[]>(STORAGE_KEYS.clients, []));
  const [darkMode, setDarkMode] = useState<boolean>(() => load<boolean>(STORAGE_KEYS.darkMode, false));
  const [notifications, setNotifications] = useState<Notification[]>(() => load<Notification[]>(STORAGE_KEYS.notifications, []));

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
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      throw new Error("Please enter a valid email address.");
    }
    if (!password) {
      throw new Error("Please enter your password.");
    }

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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      throw new Error("Please enter a valid email address.");
    }
    if (!cleanFirst || !cleanLast) {
      throw new Error("Please enter both your first and last name.");
    }
    if (password.length < 6) {
      throw new Error("Password must be at least 6 characters.");
    }

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
    setUser(null);
    try {
      localStorage.removeItem(STORAGE_KEYS.user);
    } catch {}
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      const accounts = load<RegisteredAccount[]>(STORAGE_KEYS.accounts, []);
      const updatedAccounts = accounts.map((acc) =>
        acc.email.toLowerCase() === updated.email.toLowerCase() ? { ...acc, user: updated } : acc
      );
      save(STORAGE_KEYS.accounts, updatedAccounts);
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

