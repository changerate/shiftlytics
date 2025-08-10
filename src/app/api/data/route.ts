// app/api/data/route.ts (Next.js 13+ example)
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);

export async function GET() {
    const { data, error } = await supabase.from('energy_usage').select('*');
    if (error) return new Response(error.message, { status: 500 });
    return Response.json(data);
}
