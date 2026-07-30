import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import WebSocket from 'ws';

// Inject WebSocket globally for Node 20
globalThis.WebSocket = WebSocket;

// Load variables from .env file
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
// Note: We use the publishable key for now, but in production, 
// a service_role key would be needed to bypass RLS for complete seeding.
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env file.");
  process.exit(1);
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});
