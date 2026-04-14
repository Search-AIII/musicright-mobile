import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SUPABASE_URL = "https://ysryrmvxuweqjtovqxeq.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzcnlybXZ4dXdlcWp0b3ZxeGVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxNDA4MTUsImV4cCI6MjA5MTcxNjgxNX0.vSWdtWxh_UxW8dDF3eSySe1QL-rqRc8FcwDplT7Mybg";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
