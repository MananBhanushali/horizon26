"use client";

import { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { personaById, personas } from "@/data/personas";
import { demoUsers } from "@/data/users";
import type { Persona } from "@/lib/types";

const SESSION_KEY = "v1.horizon26.session";
const SETTINGS_KEY = "v1.horizon26.settings";
const FINANCES_KEY = "v1.horizon26.finances"; // suffix: .{username}.{personaId}

type Session = { username: string; personaId: Persona["id"]; remember: boolean } | null;

type Settings = {
  numberFormat: "indian" | "international";
  defaultPersona: Persona["id"] | null;
  notifications: { macro: boolean; tax: boolean; shortfall: boolean };
};

const defaultSettings: Settings = {
  numberFormat: "indian",
  defaultPersona: null,
  notifications: { macro: true, tax: true, shortfall: true },
};

export type UserFinances = {
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlySavings: number;
  emergencyFund: number;
  customized: boolean;
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

function financesKeyFor(username: string | undefined, personaId: string): string {
  return `${FINANCES_KEY}.${username ?? "anon"}.${personaId}`;
}

type AppCtx = {
  session: Session;
  login: (u: string, p: string, remember: boolean) => { ok: true } | { ok: false; error: string };
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

      // Hydrate all finance entries
      const map: Record<string, UserFinances> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(FINANCES_KEY + ".")) {
          try {
            map[k] = JSON.parse(localStorage.getItem(k) ?? "");
          } catch {}
        }
      }
      setFinancesByKey(map);
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
    const raw = JSON.stringify(s);
    if (remember) {
      localStorage.setItem(SESSION_KEY, raw);
      sessionStorage.removeItem(SESSION_KEY);
    } else {
      sessionStorage.setItem(SESSION_KEY, raw);
      localStorage.removeItem(SESSION_KEY);
    }
    setSession(s);
    setPersonaIdState(user.personaId);
    return { ok: true };
  }, []);

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
  const finances = useMemo<UserFinances>(() => {
    return financesByKey[finKey] ?? defaultFinancesFor(persona);
  }, [financesByKey, finKey, persona]);

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

  const value: AppCtx = {
    session,
    login,
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
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useApp must be used within AppProvider");
  return c;
}
