import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SUPABASE_URL = "https://mztorwrulwexzvmcityj.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16dG9yd3J1bHdleHp2bWNpdHlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1MTkyMjAsImV4cCI6MjA4NDA5NTIyMH0.nuXz03-1fK6qRhfpGiMVOw9nRtp6_eQ-C0UKeaXm2h8";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
