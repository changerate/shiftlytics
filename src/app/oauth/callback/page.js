"use client";

import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {supabase} from '../../../lib/supabaseClient';

export default function OAuthCallback() {
  const [err, setErr] = useState("");
  const router = useRouter();

  useEffect(() => {
    const run = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data?.session) {
        setErr(error?.message || "No session after OAuth.");
        return;
      }

      const user = data.session.user;

      // Ensure profile on server
      const res = await fetch("/api/ensure-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${data.session.access_token}`,
        },
        body: JSON.stringify({}),
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
