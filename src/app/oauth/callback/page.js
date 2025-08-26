"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from '../../../lib/supabaseClient';

export default function OAuthCallback() {
  const [err, setErr] = useState("");
  const router = useRouter();

  useEffect(() => {
    const run = async () => {
      // After redirect, Supabase sets session in localStorage automatically.
      const { data, error } = await supabase.auth.getSession();
      if (error || !data?.session) {
        setErr(error?.message || "No session after OAuth.");
        return;
      }

      const user = data.session.user;

      // Ensure profile on server (service key bypasses RLS there)
      const res = await fetch("/api/ensure-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: {
            id: user.id,
            email: user.email,
            first_name: user.user_metadata?.first_name || "",
            last_name: user.user_metadata?.last_name || "",
            company: user.user_metadata?.company || "",
            position: user.user_metadata?.position || "",
          },
        }),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setErr(j.error || "Profile provisioning failed.");
        return;
      }

      router.push("/dashboard");
    };
    run();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      {err ? `OAuth error: ${err}` : "Finishing sign-in..."}
    </div>
  );
}
