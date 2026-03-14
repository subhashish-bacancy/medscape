import "server-only";

import { createClient } from "@supabase/supabase-js";

function getSupabaseUrl() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!url) {
    throw new Error("SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL must be configured.");
  }

  return url.replace(/\/$/, "");
}

function getServiceRoleKey() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY must be configured.");
  }

  return key;
}

function getPublicAuthKey() {
  const key =
    process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!key) {
    throw new Error("SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY must be configured.");
  }

  return key;
}

const baseAuthConfig = {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
} as const;

export function createSupabaseAuthClient() {
  return createClient(getSupabaseUrl(), getPublicAuthKey(), baseAuthConfig);
}

export function createSupabaseAdminClient() {
  return createClient(getSupabaseUrl(), getServiceRoleKey(), baseAuthConfig);
}
