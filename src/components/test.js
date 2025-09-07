"use client";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Test() {
  const [user, setUser] = useState(null);
  const [shifts, setShifts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const { data: authData, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;
        const currentUser = authData?.user;
        if (!currentUser) {
          setError("No authenticated user. Please log in.");
          return;
        }
        setUser(currentUser);

        const res = await fetch(`/api/data?userId=${encodeURIComponent(currentUser.id)}`, {
          cache: "no-store",
        });
        if (!res.ok) {
          throw new Error(`API error: ${res.status}`);
        }
        const json = await res.json();
        if (!cancelled) {
          setShifts(Array.isArray(json) ? json : []);
          console.log("Shifts for user", currentUser.id, json);
        }
      } catch (e) {
        if (!cancelled) setError(e?.message || String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <div>Loading shifts…</div>;
  if (error) return <div style={{ color: "red" }}>Error: {error}</div>;

  return (
    <div style={{ padding: 16 }}>
      <h3>Shifts for {user?.email}</h3>
      {shifts.length === 0 ? (
        <div>No shifts found for this user.</div>
      ) : (
        <pre>{JSON.stringify(shifts, null, 2)}</pre>
      )}
    </div>
  );
}

