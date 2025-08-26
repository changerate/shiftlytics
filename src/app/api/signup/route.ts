import { NextRequest } from "next/server";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export async function POST(request: NextRequest) {
    const body = await request.json();
    const { email, password, first_name, last_name, company, position } = body;

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                first_name,
                last_name,
                company,
                position,
            },
        },
    });

    if (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 400 });
    }

    return new Response(JSON.stringify({ message: "Sign-up successful! Please check your email to confirm your account." }), { status: 200 });
}