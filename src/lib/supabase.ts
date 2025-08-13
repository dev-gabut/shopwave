import { createClient, SupabaseClient } from '@supabase/supabase-js';

declare global {
	var supabase: SupabaseClient | undefined;
}

export const supabase = global.supabase || createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

if (process.env.NODE_ENV !== 'production') global.supabase = supabase;
