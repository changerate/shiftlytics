import { NextResponse } from "next/server";
import { createServerSupabaseWithAuth } from "../../../lib/authServerSupabase";

export async function GET(req: Request) {
  try {
    const auth = req.headers.get("authorization") || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const supabase = createServerSupabaseWithAuth(token);
    const { data: userRes } = await supabase.auth.getUser();
    const user = userRes?.user;
    if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { data, error } = await supabase
      .from("wages")
      .select("id, user_id, position_title, amount, occurrence")
      .eq("user_id", user.id);

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, wages: data ?? [] });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
