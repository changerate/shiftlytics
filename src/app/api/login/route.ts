import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

// (Optional) ensure Node runtime, not Edge
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !anonKey || !serviceKey) {
      const missing = [
        !url && "NEXT_PUBLIC_SUPABASE_URL",
        !anonKey && "NEXT_PUBLIC_SUPABASE_ANON_KEY",
        !serviceKey && "SUPABASE_SERVICE_ROLE_KEY",
      ].filter(Boolean);
      return new Response(
        JSON.stringify({ error: `Missing environment variables: ${missing.join(", ")}` }),
        { status: 500 }
      );
    }

    // 1) Login with anon client
    const supabaseAnon = createClient(url, anonKey);
    const { data, error } = await supabaseAnon.auth.signInWithPassword({ email, password });
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 401 });

    const { user, session } = data;

    // 2) Service client (bypasses RLS)
    const supabaseService = createClient(url, serviceKey);

    // 3) Upsert profile (include NOT NULL fields)
    const payload = {
      user_id: user.id,
      email: user.email,
      first_name: user.user_metadata?.first_name ?? "",
      last_name: user.user_metadata?.last_name ?? "",
      company: user.user_metadata?.company ?? "",
      position: user.user_metadata?.position ?? "",
    };

    const { error: upsertErr } = await supabaseService
      .from("profiles")
      .upsert(payload, { onConflict: "user_id" }); // requires unique index on user_id

    if (upsertErr) {
      return new Response(
        JSON.stringify({ error: "Profile creation failed: " + upsertErr.message }),
        { status: 400 }
      );
    }

    return new Response(JSON.stringify({ user, session }), { status: 200 });
  } catch (e: any) {
    console.error("/api/login unexpected error:", e);
    return new Response(
      JSON.stringify({ error: e?.message || "Unexpected server error" }),
      { status: 500 }
    );
  }
}
