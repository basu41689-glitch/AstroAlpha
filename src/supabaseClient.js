import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://erditsnrxhpfbpegeddk.supabase.co"
const supabaseKey = "sb_publishable_TmMmKmCivy11kQ1PkcGutA_uCBJkazN"

export const supabase = createClient(supabaseUrl, supabaseKey)