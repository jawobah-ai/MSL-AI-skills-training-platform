import { localStore } from "./local";
import { supabaseStore } from "./supabase";
import type { Store } from "./types";

// Supabase when it is configured; otherwise the local demo store.
export const isDemoMode = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const store: Store = isDemoMode ? localStore : supabaseStore;
