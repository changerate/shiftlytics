import { NextRequest } from "next/server";
import { createServerSupabaseWithAuth } from "../../../lib/authServerSupabase";

export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  try {
    const supabase = createServerSupabaseWithAuth(token);
    const { data: userRes } = await supabase.auth.getUser();
    const user = userRes?.user;
    if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 404 });
    return Response.json(data ?? null);
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || "Server error" }), { status: 500 });
  }
}

export async function POST() {
  return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
}

export async function PUT() {
  return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
}
