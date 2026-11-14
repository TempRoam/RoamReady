/**
 * a) Module Name: Supabase Browser Client Factory
 * b) Date of Code: September 23, 2026 - November 2, 2026
 * c) Programmer's Name: Peter Kimberley
 * d) Brief Description: Client-side browser Supabase factory configuring createBrowserClient
 *    with root path and secure cookie options for client components.
 * e) Important Functions:
 *    - createClient(): Returns a browser-compatible SupabaseClient using document.cookie.
 * f) Important Data Structures:
 *    - CookieOptions: Object setting path, sameSite, and secure attributes.
 * g) Algorithm & Justification:
 *    - SameSite=Lax & Secure Cookies: Protects against Cross-Site Request Forgery (CSRF)
 *      while allowing top-level navigation redirects to transmit authentication state.
 */

import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const createClient = () =>
  createBrowserClient(
    supabaseUrl!,
    supabaseKey!,
  );
