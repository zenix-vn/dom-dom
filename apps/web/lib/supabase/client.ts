import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@domdom/supabase-client";

/** Client phía trình duyệt (dùng trong "use client" component). */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
