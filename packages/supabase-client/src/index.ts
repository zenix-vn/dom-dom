import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types.js";

export type DomDomClient = SupabaseClient<Database>;

/** Tạo client cho trình duyệt (anon key + phiên người dùng). */
export function createBrowserClient(
  url: string,
  anonKey: string
): DomDomClient {
  return createClient<Database>(url, anonKey, {
    auth: { persistSession: true, autoRefreshToken: true },
  });
}

/** Tạo client service-role (chỉ dùng phía server / Edge Function). */
export function createServiceClient(
  url: string,
  serviceKey: string
): DomDomClient {
  return createClient<Database>(url, serviceKey, {
    auth: { persistSession: false },
  });
}

export type { Database };
