import { createServerSupabaseWithAuth } from "../../../lib/authServerSupabase";
export const runtime = "nodejs";


export async function GET(request: Request) {
  try {
    const auth = request.headers.get("authorization") || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const supabase = createServerSupabaseWithAuth(token);
    const { data: userRes } = await supabase.auth.getUser();
    const user = userRes?.user;
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await supabase
      .from("shifts")
      .select("*")
      .eq("user_id", user.id);

    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json(data ?? [], { headers: { "Cache-Control": "no-store" } });
  } catch (error: any) {
    console.error("/api/data error:", error?.message || error);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = request.headers.get("authorization") || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const supabase = createServerSupabaseWithAuth(token);
    const { data: userRes } = await supabase.auth.getUser();
    const user = userRes?.user;
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { id, updates } = await request.json();
    if (!id || typeof updates !== 'object' || updates == null) {
      return Response.json({ error: "Missing id or updates" }, { status: 400 });
    }

    const allowed = ["clock_in", "clock_out", "lunch_in", "lunch_out", "notes"] as const;
    const safe: Record<string, any> = {};
    for (const k of allowed) if (k in updates) safe[k] = updates[k];

    const { error } = await supabase
      .from("shifts")
      .update(safe)
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) return Response.json({ error: error.message }, { status: 400 });
    return Response.json({ ok: true });
  } catch (e: any) {
    return Response.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = request.headers.get("authorization") || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const supabase = createServerSupabaseWithAuth(token);
    const { data: userRes } = await supabase.auth.getUser();
    const user = userRes?.user;
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await request.json();
    if (!id) return Response.json({ error: "Missing id" }, { status: 400 });

    const { error } = await supabase
      .from("shifts")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) return Response.json({ error: error.message }, { status: 400 });
    return Response.json({ ok: true });
  } catch (e: any) {
    return Response.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = request.headers.get("authorization") || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const supabase = createServerSupabaseWithAuth(token);
    const { data: userRes } = await supabase.auth.getUser();
    const user = userRes?.user;
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const action = body?.action;

    if (action === "update") {
      const { id, updates } = body || {};
      if (!id || typeof updates !== 'object' || updates == null) {
        return Response.json({ error: "Missing id or updates" }, { status: 400 });
      }
      const allowed = ["clock_in", "clock_out", "lunch_in", "lunch_out", "notes"] as const;
      const safe: Record<string, any> = {};
      for (const k of allowed) if (k in updates) safe[k] = updates[k];
      const { error } = await supabase
        .from("shifts")
        .update(safe)
        .eq("id", id)
        .eq("user_id", user.id);
      if (error) return Response.json({ error: error.message }, { status: 400 });
      return Response.json({ ok: true });
    }

    if (action === "delete") {
      const { id } = body || {};
      if (!id) return Response.json({ error: "Missing id" }, { status: 400 });
      const { error } = await supabase
        .from("shifts")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);
      if (error) return Response.json({ error: error.message }, { status: 400 });
      return Response.json({ ok: true });
    }

    return Response.json({ error: "Unsupported action" }, { status: 400 });
  } catch (e: any) {
    return Response.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
