import { createClient } from '@supabase/supabase-js';






// Generate sample data for demonstration
function generateSampleData() {
    const data = [];
    const now = new Date();
    
    // Generate 30 days of sample data
    for (let i = 29; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const baseUsage = 15 + Math.random() * 10; // Base usage between 15-25 kWh
        const seasonalMultiplier = 1 + 0.3 * Math.sin((date.getMonth() + 1) * Math.PI / 6); // Seasonal variation
        const usage = Math.round((baseUsage * seasonalMultiplier + Math.random() * 5) * 100) / 100;
        const cost = Math.round(usage * (0.12 + Math.random() * 0.06) * 100) / 100; // $0.12-0.18 per kWh
        
        data.push({
            id: i + 1,
            created_at: date.toISOString(),
            date: date.toISOString().split('T')[0],
            usage,
            cost,
            shifts: usage,
            energy_cost: cost,
            timestamp: date.toISOString()
        });
    }
    
    return data;
}




export async function GET(request: Request) {
    try {
        // Initialize Supabase inside handler so any errors are caught
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL as string,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
        );
        // Optional filter by userId (query param)
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        // Try to fetch real data from Supabase
        let query = supabase.from('shifts').select('*');
        if (userId) {
            // Assuming the column is 'user_id' in the 'shifts' table
            query = query.eq('user_id', userId);
        }
        const { data, error } = await query;
        
        if (error) {
            console.warn('Supabase error, falling back to sample data:', error.message);
            return Response.json(generateSampleData(), { headers: { 'Cache-Control': 'no-store' } });
        }
        
        // If no data exists, return sample data
        if (!data || data.length === 0) {
            console.log('No data found in database, returning sample data');
            return Response.json(generateSampleData(), { headers: { 'Cache-Control': 'no-store' } });
        }
        
        return Response.json(data, { headers: { 'Cache-Control': 'no-store' } });
    } catch (error) {
        console.error('API error:', error);
        // Fallback to sample data on any error
        return Response.json(generateSampleData(), { headers: { 'Cache-Control': 'no-store' } });
    }
}
