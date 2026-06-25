import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://gbvrhxjblajjxctmqkmh.supabase.co";
const supabaseAnonKey = "sb_publishable_769MfsZkYfM3F8sVypEfdw_NfOEE1FI";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});