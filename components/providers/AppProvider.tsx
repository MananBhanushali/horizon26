"use client";

import { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { personaById, personas } from "@/data/personas";
import { demoUsers } from "@/data/users";
import type { Persona } from "@/lib/types";

const SESSION_KEY = "v1.horizon26.session";
const SETTINGS_KEY = "v1.horizon26.settings";

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
};

const Ctx = createContext<AppCtx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<Session>(null);
  const [personaId, setPersonaIdState] = useState<Persona["id"]>("aditya");
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [hydrated, setHydrated] = useState(false);

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
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useApp must be used within AppProvider");
  return c;
}
