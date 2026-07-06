import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ynrjvwazanmsuzutnryd.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_bI2K8cW3wApFPcroYtqIxw_QLF_r6yf";

export const supabase = createClient(supabaseUrl, supabaseKey);
