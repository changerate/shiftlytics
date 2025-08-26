import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req) {
  try {
    const { user } = await req.json();
    if (!user?.id || !user?.email) {
      return NextResponse.json({ error: "Missing user" }, { status: 400 });
    }

    const supabaseService = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const payload = {
      user_id: user.id,
      email: user.email,
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      company: user.company || "",
      position: user.position || "",
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
