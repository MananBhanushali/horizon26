"use client";

import { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { personaById, personas } from "@/data/personas";
import { demoUsers } from "@/data/users";
import { deriveLivePlan, type LivePlan } from "@/lib/livePlan";
import type { Persona } from "@/lib/types";

const SESSION_KEY = "v1.horizon26.session";
const SETTINGS_KEY = "v1.horizon26.settings";
const FINANCES_KEY = "v1.horizon26.finances"; // suffix: .{username}.{personaId}
const INVESTMENTS_KEY = "v1.horizon26.investments"; // suffix: .{username}.{personaId}
const ONBOARDED_KEY = "v1.horizon26.onboarded"; // suffix: .{username}

type Session = { username: string; personaId: Persona["id"]; remember: boolean } | null;

type Settings = {
  notifications: { macro: boolean; tax: boolean; shortfall: boolean };
};

const defaultSettings: Settings = {
  notifications: { macro: true, tax: true, shortfall: true },
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

type AppCtx = {
  session: Session;
  login: (u: string, p: string, remember: boolean) => { ok: true } | { ok: false; error: string };
  switchUser: (username: string) => { ok: true } | { ok: false; error: string };
  logout: () => void;
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
};

const Ctx = createContext<AppCtx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<Session>(null);
  const [personaId, setPersonaIdState] = useState<Persona["id"]>("aditya");
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [hydrated, setHydrated] = useState(false);
  const [financesByKey, setFinancesByKey] = useState<Record<string, UserFinances>>({});
  const [investmentsByKey, setInvestmentsByKey] = useState<Record<string, UserInvestment[]>>({});
  const [onboardedUsers, setOnboardedUsers] = useState<Record<string, boolean>>({});

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

      // Hydrate all finance entries + onboarded flags
      const finMap: Record<string, UserFinances> = {};
      const invMap: Record<string, UserInvestment[]> = {};
      const onboardedMap: Record<string, boolean> = {};
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
        }
      }
      setFinancesByKey(finMap);
      setInvestmentsByKey(invMap);
      setOnboardedUsers(onboardedMap);
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

  // Resolve current finances: persisted-for-this-(user,persona) ?? defaults
  const finKey = financesKeyFor(session?.username, persona.id);
  const invKey = investmentsKeyFor(session?.username, persona.id);
  const finances = useMemo<UserFinances>(() => {
    return financesByKey[finKey] ?? defaultFinancesFor(persona);
  }, [financesByKey, finKey, persona]);
  const investments = useMemo<UserInvestment[]>(() => {
    return investmentsByKey[invKey] ?? defaultInvestmentsFor(persona);
  }, [investmentsByKey, invKey, persona]);

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
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useApp must be used within AppProvider");
  return c;
}
