import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://whvkrjpixcbzpcsldcdi.supabase.co'
const supabaseAnonKey = 'sb_publishable_MpiSgDtf4CbtZZlNzBw1zg_TkSmN72w'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)