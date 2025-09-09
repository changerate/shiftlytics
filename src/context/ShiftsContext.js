"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { getUserWages } from "../utils/wageUtils";

const ShiftsContext = createContext(null);

export function ShiftsProvider({ children }) {
  const [user, setUser] = useState(null);
  const [shifts, setShifts] = useState([]);
  const [wages, setWages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const abortRef = useRef({ cancelled: false });

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      const currentUser = authData?.user;
      if (!currentUser) {
        throw new Error("Not authenticated");
      }
      setUser(currentUser);

      // Fetch shifts for this user
      const res = await fetch(`/api/data?userId=${encodeURIComponent(currentUser.id)}`, {
        cache: "no-store",
      });
      if (!res.ok) {
        throw new Error(`API /api/data error: ${res.status}`);
      }
      const json = await res.json();
      if (!abortRef.current.cancelled) setShifts(Array.isArray(json) ? json : []);

      // Fetch wages for this user
      const wagesRes = await getUserWages(currentUser.id);
      if (!wagesRes.success) {
        // Do not throw; keep shifts usable even if wages fail
        console.warn("getUserWages error:", wagesRes.error);
        if (!abortRef.current.cancelled) setWages([]);
      } else if (!abortRef.current.cancelled) {
        setWages(wagesRes.wages || []);
      }
    } catch (e) {
      if (!abortRef.current.cancelled) setError(e?.message || String(e));
    } finally {
      if (!abortRef.current.cancelled) setLoading(false);
    }
  }, []);

  useEffect(() => {
    abortRef.current.cancelled = false;
    fetchAll();
    return () => {
      abortRef.current.cancelled = true;
    };
  }, [fetchAll]);

  const refresh = useCallback(() => fetchAll(), [fetchAll]);

  const wagesMap = useMemo(() => {
    const map = new Map();
    for (const w of wages || []) {
      if (w?.position_title) {
        map.set(w.position_title, { amount: w.amount, occurrence: w.occurrence });
      }
    }
    return map;
  }, [wages]);

  const value = useMemo(
    () => ({ user, shifts, wages, wagesMap, loading, error, refresh }),
    [user, shifts, wages, wagesMap, loading, error, refresh]
  );

  return <ShiftsContext.Provider value={value}>{children}</ShiftsContext.Provider>;
}

export function useShifts() {
  const ctx = useContext(ShiftsContext);
  if (!ctx) throw new Error("useShifts must be used within a ShiftsProvider");
  return ctx;
}

