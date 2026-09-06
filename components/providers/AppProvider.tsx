"use client";

import { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { personaById, personas } from "@/data/personas";
import { demoUsers } from "@/data/users";
import { deriveLivePlan, type LivePlan } from "@/lib/livePlan";
import type { Persona } from "@/lib/types";

const SESSION_KEY = "v1.lakshaya.session";
const SETTINGS_KEY = "v1.lakshaya.settings";
const FINANCES_KEY = "v1.lakshaya.finances"; // suffix: .{username}.{personaId}
const INVESTMENTS_KEY = "v1.lakshaya.investments"; // suffix: .{username}.{personaId}
const ONBOARDED_KEY = "v1.lakshaya.onboarded"; // suffix: .{username}
const SAVINGS_GAME_KEY = "v1.lakshaya.savingsGame"; // suffix: .{username}
const SAVINGS_METRICS_KEY = "v1.lakshaya.savingsMetrics"; // suffix: .{username}
const FAMILY_MEMBERS_KEY = "v1.lakshaya.familyMembers"; // suffix: .{username}

type Session = { username: string; personaId: Persona["id"]; remember: boolean } | null;

type Settings = {
  theme: "light" | "dark";
  notifications: { macro: boolean; tax: boolean; shortfall: boolean };
  savingsCoach: {
    nudgesEnabled: boolean;
    gamificationEnabled: boolean;
    autoEscalateEnabled: boolean;
    autoEscalatePct: number;
  };
};

const defaultSettings: Settings = {
  theme: "light",
  notifications: { macro: true, tax: true, shortfall: true },
  savingsCoach: {
    nudgesEnabled: true,
    gamificationEnabled: true,
    autoEscalateEnabled: false,
    autoEscalatePct: 5,
  },
};

export type SavingsGame = {
  currentStreak: number;
  bestStreak: number;
  weeklyTarget: number;
  weeklySaved: number;
  badgesUnlocked: string[];
  lastCompletedWeek: string | null;
  appliedOpportunityIds: string[];
};

export type SavingsCoachMetrics = {
  nudgeAccepted: number;
  nudgeDismissed: number;
  nudgeSnoozed: number;
  estimatedMonthlyUplift: number;
  lastActionAt: number | null;
};

export type UserFinances = {
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlySavings: number;
  emergencyFund: number;
  customized: boolean;
};

export type UserInvestment = {
  id: string;
  name: string;
  category: "Equity" | "Debt" | "Gold" | "Liquid";
  monthly: number;
  currentValue: number;
  annualReturn: number;
};

export type FamilyMember = {
  id: string;
  name: string;
  relation: "Self" | "Spouse" | "Parent" | "Child" | "Other";
  monthlyIncome: number;
  monthlyContribution: number;
};

export type Client = {
  id: string;
  name: string;
  personaId: Persona["id"];
  email: string;
};

function defaultFamilyMembers(): FamilyMember[] {
  return [
    {
      id: "fm-self",
      name: "Aarav",
      relation: "Self",
      monthlyIncome: 220000,
      monthlyContribution: 55000,
    },
    {
      id: "fm-spouse",
      name: "Nisha",
      relation: "Spouse",
      monthlyIncome: 180000,
      monthlyContribution: 50000,
    },
  ];
}

function defaultFinancesFor(persona: Persona): UserFinances {
  const monthlyIncome = Math.round(persona.annualIncome / 12);
  const savings = persona.monthlyContribution;
  const monthlyExpenses = Math.max(0, monthlyIncome - Math.max(0, savings));
  return {
    monthlyIncome,
    monthlyExpenses,
    monthlySavings: savings,
    emergencyFund: Math.round(persona.netWorth * (persona.allocation.liquid / 100)),
    customized: false,
  };
}

function defaultInvestmentsFor(persona: Persona): UserInvestment[] {
  const totalsByCategory = persona.instruments.reduce<Record<UserInvestment["category"], number>>(
    (acc, inst) => {
      acc[inst.category] += inst.monthly;
      return acc;
    },
    { Equity: 0, Debt: 0, Gold: 0, Liquid: 0 }
  );
  const categoryCorpus = {
    Equity: persona.netWorth * (persona.allocation.equity / 100),
    Debt: persona.netWorth * (persona.allocation.debt / 100),
    Gold: persona.netWorth * (persona.allocation.gold / 100),
    Liquid: persona.netWorth * (persona.allocation.liquid / 100),
  } as const;

  return persona.instruments.map((inst) => {
    const catTotal = totalsByCategory[inst.category];
    const weight = catTotal > 0 ? inst.monthly / catTotal : 0;
    return {
      id: inst.id,
      name: inst.name,
      category: inst.category,
      monthly: inst.monthly,
      currentValue: Math.round(categoryCorpus[inst.category] * weight),
      annualReturn: persona.preTaxReturn,
    };
  });
}

function financesKeyFor(username: string | undefined, personaId: string): string {
  return `${FINANCES_KEY}.${username ?? "anon"}.${personaId}`;
}

function investmentsKeyFor(username: string | undefined, personaId: string): string {
  return `${INVESTMENTS_KEY}.${username ?? "anon"}.${personaId}`;
}

function savingsGameKeyFor(username: string | undefined): string {
  return `${SAVINGS_GAME_KEY}.${username ?? "anon"}`;
}

function savingsMetricsKeyFor(username: string | undefined): string {
  return `${SAVINGS_METRICS_KEY}.${username ?? "anon"}`;
}

function familyMembersKeyFor(username: string | undefined): string {
  return `${FAMILY_MEMBERS_KEY}.${username ?? "anon"}`;
}

function weekKey(d = new Date()): string {
  const jan1 = new Date(d.getFullYear(), 0, 1);
  const days = Math.floor((d.getTime() - jan1.getTime()) / 86_400_000);
  const week = Math.floor((days + jan1.getDay()) / 7) + 1;
  return `${d.getFullYear()}-W${week}`;
}

type AppCtx = {
  session: Session;
  login: (u: string, p: string, remember: boolean) => { ok: true } | { ok: false; error: string };
  switchUser: (username: string) => { ok: true } | { ok: false; error: string };
  logout: () => void;
  clients: Client[];
  activeClientId: string | null;
  setActiveClientId: (id: string | null) => void;
  addClient: (client: Omit<Client, "id">) => void;
  deleteClient: (id: string) => void;
  clientAUMs: Record<string, number>;
  clientAllocations: Record<string, Record<string, number>>;
  personaId: Persona["id"];
  setPersonaId: (id: Persona["id"]) => void;
  persona: Persona;
  hydrated: boolean;
  settings: Settings;
  updateSettings: (patch: Partial<Settings>) => void;
  finances: UserFinances;
  updateFinances: (patch: Partial<UserFinances>) => void;
  resetFinances: () => void;
  investments: UserInvestment[];
  updateInvestments: (next: UserInvestment[]) => void;
  resetInvestments: () => void;
  /** Derived plan: projection + per-goal funding + scaled instruments, all from `finances`. */
  livePlan: LivePlan;
  /** True until the user has acknowledged the one-time finances prompt (saved or skipped). */
  needsFinancesOnboarding: boolean;
  markFinancesOnboarded: () => void;
  savingsGame: SavingsGame;
  logSavingsWin: (amount: number) => void;
  setWeeklyChallengeTarget: (amount: number) => void;
  applyGoalProtectionNudge: (opportunityId: string) => boolean;
  savingsMetrics: SavingsCoachMetrics;
  trackSavingsCoachInteraction: (
    kind: "accepted" | "dismissed" | "snoozed",
    monthlyAmount?: number
  ) => void;
  familyMembers: FamilyMember[];
  addFamilyMember: (input: Omit<FamilyMember, "id">) => void;
  updateFamilyMember: (id: string, patch: Partial<Omit<FamilyMember, "id">>) => void;
  removeFamilyMember: (id: string) => void;
};

const Ctx = createContext<AppCtx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<Session>(null);
  const [personaId, setPersonaIdState] = useState<Persona["id"]>("aditya");
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [hydrated, setHydrated] = useState(false);
  const [clients, setClientsState] = useState<Client[]>([]);
  const [activeClientId, setActiveClientIdState] = useState<string | null>(null);
  const [financesByKey, setFinancesByKey] = useState<Record<string, UserFinances>>({});
  const [investmentsByKey, setInvestmentsByKey] = useState<Record<string, UserInvestment[]>>({});
  const [onboardedUsers, setOnboardedUsers] = useState<Record<string, boolean>>({});
  const [savingsGameByKey, setSavingsGameByKey] = useState<Record<string, SavingsGame>>({});
  const [savingsMetricsByKey, setSavingsMetricsByKey] = useState<Record<string, SavingsCoachMetrics>>({});
  const [familyMembersByKey, setFamilyMembersByKey] = useState<Record<string, FamilyMember[]>>({});

  const persistSession = useCallback((next: NonNullable<Session>) => {
    const raw = JSON.stringify(next);
    if (next.remember) {
      localStorage.setItem(SESSION_KEY, raw);
      sessionStorage.removeItem(SESSION_KEY);
    } else {
      sessionStorage.setItem(SESSION_KEY, raw);
      localStorage.removeItem(SESSION_KEY);
    }
    setSession(next);
    setPersonaIdState(next.personaId);
  }, []);

  // Keep a single DOM source-of-truth for theming.
  useEffect(() => {
    if (!hydrated) return;
    document.documentElement.dataset.theme = settings.theme;
    document.documentElement.style.colorScheme = settings.theme;
  }, [hydrated, settings.theme]);

  // Hydrate from storage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY) ?? sessionStorage.getItem(SESSION_KEY);
      if (raw) {
        const s = JSON.parse(raw) as NonNullable<Session>;
        setSession(s);
        setPersonaIdState(s.personaId);
      }
      const sraw = localStorage.getItem(SETTINGS_KEY);
      if (sraw) setSettings({ ...defaultSettings, ...JSON.parse(sraw) });

      localStorage.removeItem("v1.lakshaya.clients");
      
      // Hydrate all finance entries + onboarded flags
      const finMap: Record<string, UserFinances> = {};
      const invMap: Record<string, UserInvestment[]> = {};
      const onboardedMap: Record<string, boolean> = {};
      const gameMap: Record<string, SavingsGame> = {};
      const metricsMap: Record<string, SavingsCoachMetrics> = {};
      const familyMembersMap: Record<string, FamilyMember[]> = {};

      const clientsRaw = localStorage.getItem("v1.lakshaya.clients");
      if (clientsRaw) {
        try { setClientsState(JSON.parse(clientsRaw)); } catch {}
      } else {
        const seededClients: Client[] = [
          { id: "c1", name: "Aarav", personaId: "aditya", email: "aarav@example.com" },
          { id: "c2", name: "Neha", personaId: "priya", email: "neha@example.com" },
          { id: "c3", name: "Vikram", personaId: "riya", email: "vikram@example.com" },
        ];
        setClientsState(seededClients);
        localStorage.setItem("v1.lakshaya.clients", JSON.stringify(seededClients));
        
        // Seed 2CR for c1
        const c1FinKey = financesKeyFor("c1", "aditya");
        const c1InvKey = investmentsKeyFor("c1", "aditya");
        finMap[c1FinKey] = { monthlyIncome: 300000, monthlyExpenses: 100000, monthlySavings: 200000, emergencyFund: 500000, customized: true };
        invMap[c1InvKey] = [
          { id: "c1-eq", name: "Equity Portfolio", category: "Equity", monthly: 150000, currentValue: 16000000, annualReturn: 14 },
          { id: "c1-db", name: "Debt Portfolio", category: "Debt", monthly: 50000, currentValue: 4000000, annualReturn: 7 }
        ];

        // Seed 2CR for c2
        const c2FinKey = financesKeyFor("c2", "priya");
        const c2InvKey = investmentsKeyFor("c2", "priya");
        finMap[c2FinKey] = { monthlyIncome: 400000, monthlyExpenses: 200000, monthlySavings: 200000, emergencyFund: 1000000, customized: true };
        invMap[c2InvKey] = [
          { id: "c2-eq", name: "Equity Portfolio", category: "Equity", monthly: 100000, currentValue: 12000000, annualReturn: 12 },
          { id: "c2-db", name: "Debt Portfolio", category: "Debt", monthly: 100000, currentValue: 8000000, annualReturn: 7 }
        ];

        // Seed 1CR for c3
        const c3FinKey = financesKeyFor("c3", "riya");
        const c3InvKey = investmentsKeyFor("c3", "riya");
        finMap[c3FinKey] = { monthlyIncome: 100000, monthlyExpenses: 50000, monthlySavings: 50000, emergencyFund: 300000, customized: true };
        invMap[c3InvKey] = [
          { id: "c3-eq", name: "Equity Portfolio", category: "Equity", monthly: 10000, currentValue: 3000000, annualReturn: 10 },
          { id: "c3-db", name: "Debt Portfolio", category: "Debt", monthly: 40000, currentValue: 7000000, annualReturn: 6 }
        ];
        
        localStorage.setItem(c1FinKey, JSON.stringify(finMap[c1FinKey]));
        localStorage.setItem(c1InvKey, JSON.stringify(invMap[c1InvKey]));
        localStorage.setItem(c2FinKey, JSON.stringify(finMap[c2FinKey]));
        localStorage.setItem(c2InvKey, JSON.stringify(invMap[c2InvKey]));
        localStorage.setItem(c3FinKey, JSON.stringify(finMap[c3FinKey]));
        localStorage.setItem(c3InvKey, JSON.stringify(invMap[c3InvKey]));
      }

      const activeClientRaw = localStorage.getItem("v1.lakshaya.activeClientId");
      if (activeClientRaw) {
        setActiveClientIdState(activeClientRaw);
      }

      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (!k) continue;
        if (k.startsWith(FINANCES_KEY + ".")) {
          try {
            finMap[k] = JSON.parse(localStorage.getItem(k) ?? "");
          } catch {}
        } else if (k.startsWith(INVESTMENTS_KEY + ".")) {
          try {
            invMap[k] = JSON.parse(localStorage.getItem(k) ?? "");
          } catch {}
        } else if (k.startsWith(ONBOARDED_KEY + ".")) {
          onboardedMap[k] = localStorage.getItem(k) === "1";
        } else if (k.startsWith(SAVINGS_GAME_KEY + ".")) {
          try {
            gameMap[k] = JSON.parse(localStorage.getItem(k) ?? "");
          } catch {}
        } else if (k.startsWith(SAVINGS_METRICS_KEY + ".")) {
          try {
            metricsMap[k] = JSON.parse(localStorage.getItem(k) ?? "");
          } catch {}
        } else if (k.startsWith(FAMILY_MEMBERS_KEY + ".")) {
          try {
            familyMembersMap[k] = JSON.parse(localStorage.getItem(k) ?? "");
          } catch {}
        }
      }
      setFinancesByKey(finMap);
      setInvestmentsByKey(invMap);
      setOnboardedUsers(onboardedMap);
      setSavingsGameByKey(gameMap);
      setSavingsMetricsByKey(metricsMap);
      setFamilyMembersByKey(familyMembersMap);
    } catch {
      // ignore
    } finally {
      setHydrated(true);
    }
  }, []);

  // Route guard
  useEffect(() => {
    if (!hydrated) return;
    const onLogin = pathname === "/login";
    const onHome = pathname === "/";
    if (!session && !onLogin && !onHome) {
      router.replace("/login");
    } else if (session && onLogin) {
      router.replace("/dashboard");
    }
  }, [hydrated, session, pathname, router]);

  const login = useCallback<AppCtx["login"]>((u, p, remember) => {
    const user = demoUsers.find((x) => x.username.toLowerCase() === u.trim().toLowerCase());
    if (!user || user.password !== p) return { ok: false, error: "Invalid credentials" };
    const s: NonNullable<Session> = { username: user.username, personaId: user.personaId, remember };
    persistSession(s);
    return { ok: true };
  }, [persistSession]);

  const switchUser = useCallback<AppCtx["switchUser"]>((username) => {
    const user = demoUsers.find((x) => x.username.toLowerCase() === username.trim().toLowerCase());
    if (!user) return { ok: false, error: "User not found" };
    const remember = session?.remember ?? true;
    const s: NonNullable<Session> = { username: user.username, personaId: user.personaId, remember };
    persistSession(s);
    return { ok: true };
  }, [persistSession, session?.remember]);

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    setSession(null);
  }, []);

  const setPersonaId = useCallback((id: Persona["id"]) => {
    setPersonaIdState(id);
  }, []);

  const setClients = useCallback((action: Client[] | ((prev: Client[]) => Client[])) => {
    setClientsState((prev) => {
      const next = typeof action === "function" ? action(prev) : action;
      try {
        localStorage.setItem("v1.lakshaya.clients", JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const setActiveClientId = useCallback((id: string | null) => {
    setActiveClientIdState(id);
    try {
      if (id) localStorage.setItem("v1.lakshaya.activeClientId", id);
      else localStorage.removeItem("v1.lakshaya.activeClientId");
    } catch {}
  }, []);

  const clientAUMs = useMemo(() => {
    const aums: Record<string, number> = {};
    clients.forEach(c => {
      const pId = c.personaId;
      const targetPersona = personas.find(p => p.id === pId) || personas[0];
      const invs = investmentsByKey[investmentsKeyFor(c.id, pId)] || defaultInvestmentsFor(targetPersona);
      aums[c.id] = invs.reduce((acc, i) => acc + i.currentValue, 0);
    });
    return aums;
  }, [clients, investmentsByKey]);

  const clientAllocations = useMemo(() => {
    const allocs: Record<string, Record<string, number>> = {};
    clients.forEach(c => {
      const pId = c.personaId;
      const targetPersona = personas.find(p => p.id === pId) || personas[0];
      const invs = investmentsByKey[investmentsKeyFor(c.id, pId)] || defaultInvestmentsFor(targetPersona);
      const buckets: Record<string, number> = {};
      invs.forEach(i => {
         buckets[i.category] = (buckets[i.category] || 0) + i.currentValue;
      });
      allocs[c.id] = buckets;
    });
    return allocs;
  }, [clients, investmentsByKey]);

  const addClient = useCallback((c: Omit<Client, "id">) => {
    const newClient: Client = { ...c, id: `client-${Date.now()}` };
    setClients((prev) => [...prev, newClient]);
    return newClient;
  }, [setClients]);

  const deleteClient = useCallback((id: string) => {
    setClients((prev) => prev.filter(c => c.id !== id));
    if (activeClientId === id) setActiveClientId(null);
  }, [activeClientId, setActiveClientId, setClients]);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSettings((s) => {
      const next = { ...s, ...patch };
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const persona = useMemo(() => {
    try {
      return personaById(personaId);
    } catch {
      return personas[1];
    }
  }, [personaId]);

  const currentKeyUser = activeClientId ?? session?.username;

  // Resolve current finances: persisted-for-this-(user,persona) ?? defaults
  const finKey = financesKeyFor(currentKeyUser, persona.id);
  const invKey = investmentsKeyFor(currentKeyUser, persona.id);
  const finances = useMemo<UserFinances>(() => {
    return financesByKey[finKey] ?? defaultFinancesFor(persona);
  }, [financesByKey, finKey, persona]);
  const investments = useMemo<UserInvestment[]>(() => {
    return investmentsByKey[invKey] ?? defaultInvestmentsFor(persona);
  }, [investmentsByKey, invKey, persona]);
  const gameKey = savingsGameKeyFor(currentKeyUser);
  const metricsKey = savingsMetricsKeyFor(currentKeyUser);
  const familyMembersKey = familyMembersKeyFor(currentKeyUser);
  const savingsGame = useMemo<SavingsGame>(() => {
    const fromStore = savingsGameByKey[gameKey];
    return {
      currentStreak: fromStore?.currentStreak ?? 0,
      bestStreak: fromStore?.bestStreak ?? 0,
      weeklyTarget:
        fromStore?.weeklyTarget ??
        Math.max(1000, Math.round(Math.max(finances.monthlySavings, 0) * 0.2)),
      weeklySaved: fromStore?.weeklySaved ?? 0,
      badgesUnlocked: fromStore?.badgesUnlocked ?? [],
      lastCompletedWeek: fromStore?.lastCompletedWeek ?? null,
      appliedOpportunityIds: fromStore?.appliedOpportunityIds ?? [],
    };
  }, [savingsGameByKey, gameKey, finances.monthlySavings]);
  const savingsMetrics = useMemo<SavingsCoachMetrics>(() => {
    return (
      savingsMetricsByKey[metricsKey] ?? {
        nudgeAccepted: 0,
        nudgeDismissed: 0,
        nudgeSnoozed: 0,
        estimatedMonthlyUplift: 0,
        lastActionAt: null,
      }
    );
  }, [savingsMetricsByKey, metricsKey]);
  const familyMembers = useMemo<FamilyMember[]>(() => {
    if (persona.id !== "family") return [];
    return familyMembersByKey[familyMembersKey] ?? defaultFamilyMembers();
  }, [persona.id, familyMembersByKey, familyMembersKey]);

  const updateFinances = useCallback(
    (patch: Partial<UserFinances>) => {
      setFinancesByKey((map) => {
        const current = map[finKey] ?? defaultFinancesFor(persona);
        const next: UserFinances = { ...current, ...patch, customized: true };
        // Auto-derive savings if user changes income/expenses but not savings
        if (
          (patch.monthlyIncome !== undefined || patch.monthlyExpenses !== undefined) &&
          patch.monthlySavings === undefined
        ) {
          next.monthlySavings = next.monthlyIncome - next.monthlyExpenses;
        }
        try {
          localStorage.setItem(finKey, JSON.stringify(next));
        } catch {}
        return { ...map, [finKey]: next };
      });
    },
    [finKey, persona]
  );

  const resetFinances = useCallback(() => {
    setFinancesByKey((map) => {
      const next = { ...map };
      delete next[finKey];
      try {
        localStorage.removeItem(finKey);
      } catch {}
      return next;
    });
  }, [finKey]);

  const updateInvestments = useCallback(
    (next: UserInvestment[]) => {
      setInvestmentsByKey((map) => {
        try {
          localStorage.setItem(invKey, JSON.stringify(next));
        } catch {}
        return { ...map, [invKey]: next };
      });
    },
    [invKey]
  );

  const resetInvestments = useCallback(() => {
    setInvestmentsByKey((map) => {
      const next = { ...map };
      delete next[invKey];
      try {
        localStorage.removeItem(invKey);
      } catch {}
      return next;
    });
  }, [invKey]);

  // One-time onboarding: keyed by username so each demo profile only asks once.
  const onboardKey = `${ONBOARDED_KEY}.${session?.username ?? "anon"}`;
  const needsFinancesOnboarding =
    !!session && !onboardedUsers[onboardKey] && !finances.customized;

  const markFinancesOnboarded = useCallback(() => {
    setOnboardedUsers((m) => ({ ...m, [onboardKey]: true }));
    try {
      localStorage.setItem(onboardKey, "1");
    } catch {}
  }, [onboardKey]);

  const setWeeklyChallengeTarget = useCallback(
    (amount: number) => {
      setSavingsGameByKey((map) => {
        const current =
          map[gameKey] ??
          ({
            currentStreak: 0,
            bestStreak: 0,
            weeklyTarget: 0,
            weeklySaved: 0,
            badgesUnlocked: [],
            lastCompletedWeek: null,
            appliedOpportunityIds: [],
          } as SavingsGame);
        const next: SavingsGame = {
          ...current,
          weeklyTarget: Math.max(500, Math.round(amount)),
        };
        try {
          localStorage.setItem(gameKey, JSON.stringify(next));
        } catch {}
        return { ...map, [gameKey]: next };
      });
    },
    [gameKey]
  );

  const logSavingsWin = useCallback(
    (amount: number) => {
      setSavingsGameByKey((map) => {
        const current =
          map[gameKey] ??
          ({
            currentStreak: 0,
            bestStreak: 0,
            weeklyTarget: Math.max(1000, Math.round(Math.max(finances.monthlySavings, 0) * 0.2)),
            weeklySaved: 0,
            badgesUnlocked: [],
            lastCompletedWeek: null,
            appliedOpportunityIds: [],
          } as SavingsGame);
        const currentWeek = weekKey();
        const sameWeek = current.lastCompletedWeek === currentWeek;
        const weeklySaved = Math.max(0, current.weeklySaved + Math.max(0, amount));
        const hitTarget = weeklySaved >= current.weeklyTarget && !sameWeek;
        const currentStreak = hitTarget ? current.currentStreak + 1 : current.currentStreak;
        const bestStreak = Math.max(current.bestStreak, currentStreak);
        const badges = new Set(current.badgesUnlocked);
        if (weeklySaved >= 10_000) badges.add("First ₹10K saved");
        if (currentStreak >= 4) badges.add("4-week streak");
        if (hitTarget) badges.add("Goal Protector");
        const next: SavingsGame = {
          ...current,
          weeklySaved,
          currentStreak,
          bestStreak,
          badgesUnlocked: Array.from(badges),
          lastCompletedWeek: hitTarget ? currentWeek : current.lastCompletedWeek,
        };
        try {
          localStorage.setItem(gameKey, JSON.stringify(next));
        } catch {}
        return { ...map, [gameKey]: next };
      });
    },
    [gameKey, finances.monthlySavings]
  );

  const applyGoalProtectionNudge = useCallback(
    (opportunityId: string) => {
      let applied = false;
      setSavingsGameByKey((map) => {
        const current =
          map[gameKey] ??
          ({
            currentStreak: 0,
            bestStreak: 0,
            weeklyTarget: Math.max(1000, Math.round(Math.max(finances.monthlySavings, 0) * 0.2)),
            weeklySaved: 0,
            badgesUnlocked: [],
            lastCompletedWeek: null,
            appliedOpportunityIds: [],
          } as SavingsGame);
        if (current.appliedOpportunityIds.includes(opportunityId)) {
          return map;
        }
        applied = true;
        const next: SavingsGame = {
          ...current,
          appliedOpportunityIds: [...current.appliedOpportunityIds, opportunityId],
        };
        try {
          localStorage.setItem(gameKey, JSON.stringify(next));
        } catch {}
        return { ...map, [gameKey]: next };
      });
      return applied;
    },
    [gameKey, finances.monthlySavings]
  );

  const trackSavingsCoachInteraction = useCallback(
    (kind: "accepted" | "dismissed" | "snoozed", monthlyAmount = 0) => {
      setSavingsMetricsByKey((map) => {
        const current =
          map[metricsKey] ??
          ({
            nudgeAccepted: 0,
            nudgeDismissed: 0,
            nudgeSnoozed: 0,
            estimatedMonthlyUplift: 0,
            lastActionAt: null,
          } as SavingsCoachMetrics);
        const next: SavingsCoachMetrics = {
          ...current,
          nudgeAccepted: current.nudgeAccepted + (kind === "accepted" ? 1 : 0),
          nudgeDismissed: current.nudgeDismissed + (kind === "dismissed" ? 1 : 0),
          nudgeSnoozed: current.nudgeSnoozed + (kind === "snoozed" ? 1 : 0),
          estimatedMonthlyUplift:
            current.estimatedMonthlyUplift +
            (kind === "accepted" ? Math.max(0, monthlyAmount) : 0),
          lastActionAt: Date.now(),
        };
        try {
          localStorage.setItem(metricsKey, JSON.stringify(next));
        } catch {}
        return { ...map, [metricsKey]: next };
      });
    },
    [metricsKey]
  );

  const syncFamilyFinances = useCallback(
    (members: FamilyMember[]) => {
      if (persona.id !== "family") return;
      const monthlyIncome = members.reduce((acc, m) => acc + Math.max(0, m.monthlyIncome), 0);
      const monthlySavings = members.reduce(
        (acc, m) => acc + Math.max(0, m.monthlyContribution),
        0
      );
      const monthlyExpenses = Math.max(0, monthlyIncome - monthlySavings);
      setFinancesByKey((map) => {
        const current = map[finKey] ?? defaultFinancesFor(persona);
        const next: UserFinances = {
          ...current,
          monthlyIncome,
          monthlySavings,
          monthlyExpenses,
          customized: true,
        };
        try {
          localStorage.setItem(finKey, JSON.stringify(next));
        } catch {}
        return { ...map, [finKey]: next };
      });
    },
    [persona, finKey]
  );

  const addFamilyMember = useCallback(
    (input: Omit<FamilyMember, "id">) => {
      if (persona.id !== "family") return;
      setFamilyMembersByKey((map) => {
        const current = map[familyMembersKey] ?? defaultFamilyMembers();
        const nextMember: FamilyMember = {
          id: `fm-${Date.now()}-${current.length + 1}`,
          ...input,
        };
        const next = [...current, nextMember];
        try {
          localStorage.setItem(familyMembersKey, JSON.stringify(next));
        } catch {}
        syncFamilyFinances(next);
        return { ...map, [familyMembersKey]: next };
      });
    },
    [persona.id, familyMembersKey, syncFamilyFinances]
  );

  const updateFamilyMember = useCallback(
    (id: string, patch: Partial<Omit<FamilyMember, "id">>) => {
      if (persona.id !== "family") return;
      setFamilyMembersByKey((map) => {
        const current = map[familyMembersKey] ?? defaultFamilyMembers();
        const next = current.map((member) =>
          member.id === id ? { ...member, ...patch } : member
        );
        try {
          localStorage.setItem(familyMembersKey, JSON.stringify(next));
        } catch {}
        syncFamilyFinances(next);
        return { ...map, [familyMembersKey]: next };
      });
    },
    [persona.id, familyMembersKey, syncFamilyFinances]
  );

  const removeFamilyMember = useCallback(
    (id: string) => {
      if (persona.id !== "family") return;
      setFamilyMembersByKey((map) => {
        const current = map[familyMembersKey] ?? defaultFamilyMembers();
        const next = current.filter((member) => member.id !== id);
        try {
          localStorage.setItem(familyMembersKey, JSON.stringify(next));
        } catch {}
        syncFamilyFinances(next);
        return { ...map, [familyMembersKey]: next };
      });
    },
    [persona.id, familyMembersKey, syncFamilyFinances]
  );

  // Derived live plan from the user's actual numbers
  const livePlan = useMemo(
    () => deriveLivePlan(persona, finances, investments),
    [persona, finances, investments]
  );

  const value: AppCtx = {
    session,
    login,
    switchUser,
    logout,
    clients,
    activeClientId,
    setActiveClientId,
    addClient,
    deleteClient,
    clientAUMs,
    clientAllocations,
    personaId,
    setPersonaId,
    persona,
    hydrated,
    settings,
    updateSettings,
    finances,
    updateFinances,
    resetFinances,
    investments,
    updateInvestments,
    resetInvestments,
    livePlan,
    needsFinancesOnboarding,
    markFinancesOnboarded,
    savingsGame,
    logSavingsWin,
    setWeeklyChallengeTarget,
    applyGoalProtectionNudge,
    savingsMetrics,
    trackSavingsCoachInteraction,
    familyMembers,
    addFamilyMember,
    updateFamilyMember,
    removeFamilyMember,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useApp must be used within AppProvider");
  return c;
}
