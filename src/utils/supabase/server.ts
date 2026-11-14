/**
 * a) Module Name: Supabase Server Client Factory
 * b) Date of Code: September 23, 2026 - November 2, 2026
 * c) Programmer's Name: Peter Kimberley
 * d) Brief Description: Server-side Supabase client factory configured for Next.js 16 App Router.
 *    Binds the cookie store to createServerClient from @supabase/ssr to persist JWT sessions.
 * e) Important Functions:
 *    - createClient(cookieStore): Initializes and returns a SupabaseClient with custom getAll
 *      and setAll cookie adapters tied to Next.js server headers.
 * f) Important Data Structures:
 *    - ReadonlyRequestCookies: Awaited Next.js cookie store.
 * g) Algorithm & Justification:
 *    - Chunked Cookie Encoding: Adapts multi-chunk JWT tokens across HTTP cookie boundaries,
 *      ensuring large session payloads are not truncated by browser cookie size limits.
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const createClient = (cookieStore: Awaited<ReturnType<typeof cookies>>) => {
  return createServerClient(
    supabaseUrl!,
    supabaseKey!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    },
  );
};
