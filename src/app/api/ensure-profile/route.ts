import { NextResponse } from "next/server";
export const runtime = "nodejs";
import { createClient } from "@supabase/supabase-js";
import { createServerSupabaseWithAuth } from "../../../lib/authServerSupabase";

export async function POST(req: Request) {
  try {
    const auth = req.headers.get("authorization") || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabaseUserScoped = createServerSupabaseWithAuth(token);
    const { data: userRes } = await supabaseUserScoped.auth.getUser();
    const user = userRes?.user;
    if (!user?.id || !user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabaseService = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const payload = {
      user_id: user.id,
      email: user.email,
      first_name: user.user_metadata?.first_name || "",
      last_name: user.user_metadata?.last_name || "",
      company: user.user_metadata?.company || "",
      position: user.user_metadata?.position || "",
    };

    const { error } = await supabaseService
      .from("profiles")
      .upsert(payload, { onConflict: "user_id" });

    if (error) {
      return NextResponse.json(
        { error: "Profile creation failed: " + error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: e.message || "Server error" }, { status: 500 });
  }
}
