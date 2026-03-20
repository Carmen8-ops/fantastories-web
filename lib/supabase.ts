import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://zzqmloxsniyhgsjfvurv.supabase.co";
const supabaseKey = "sb_publishable_h9hmds7rDx8OxPjmJtT3Nw_BMspbZqi";

export const supabase = createClient(supabaseUrl, supabaseKey);