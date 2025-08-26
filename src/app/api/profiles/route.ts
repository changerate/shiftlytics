import { NextRequest } from "next/server";
import { ensureUserProfile, updateUserProfile, getUserProfile } from "../../../utils/profileUtils";

// GET /api/profiles?userId=123
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    if (!userId) {
        return new Response(JSON.stringify({ error: "Missing userId" }), { status: 400 });
    }
    const result = await getUserProfile(userId);
    if (!result.success) {
        return new Response(JSON.stringify({ error: result.error }), { status: 404 });
    }
    return Response.json(result.profile);
}

export async function POST(request: NextRequest) {
    const body = await request.json();
    const result = await ensureUserProfile(body.user);
    if (!result.success) {
        return new Response(JSON.stringify({ error: result.error }), { status: 400 });
    }
    return Response.json(result.profile);
}

export async function PUT(request: NextRequest) {
    const body = await request.json();
    const { userId, updates } = body;
    if (!userId || !updates) {
        return new Response(JSON.stringify({ error: "Missing userId or updates" }), { status: 400 });
    }
    const result = await updateUserProfile(userId, updates);
    if (!result.success) {
        return new Response(JSON.stringify({ error: result.error }), { status: 400 });
    }
    return Response.json(result.profile);
}