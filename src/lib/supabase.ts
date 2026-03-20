import { createClient } from '@supabase/supabase-js'


export const SUPABASE_URL = 'https://gohtatuaziupqdazmjqi.supabase.co'
export const SUPABASE_ANON_KEY = 'sb_publishable_sPZ_6eQCRm2REjyaNXa9EQ_GwWzGD7T'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
