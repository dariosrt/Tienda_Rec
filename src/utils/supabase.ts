import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true, // ESTO ES VITAL
    storageKey: 'sb-eiwikqgswhhrlkytancm-auth-token', // Asegúrate de que coincida con lo que ves en localStorage
    storage: window.localStorage,
  },
});