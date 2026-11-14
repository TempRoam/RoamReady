/**
 * a) Module Name: Authenticated Navbar
 * b) Date of Code: October 26, 2026
 * c) Programmer's Name: Peter Kimberley
 * d) Brief Description: Asynchronous server component rendering the persistent top-level navigation.
 *    Validates user session on the server to dynamically display active user email and Logout action.
 * e) Important Functions:
 *    - Navbar(): Server-rendered JSX element providing site navigation and session-aware auth controls.
 * f) Important Data Structures:
 *    - User: Supabase Auth object holding user email and session identity.
 * g) Algorithm & Justification:
 *    - Server-Side Rendering (SSR) Session Check: Validates session state on the server before HTML
 *      is streamed to the browser, eliminating client-side flash of unauthenticated content (FOUC).
 */

import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { signout } from "@/app/login/actions";

export default async function Navbar() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <nav className="navbar">
      <Link href="/" className="nav-logo">
        <span>Roam</span>Ready
      </Link>

      <div className="nav-links">
        <Link href="/features">Features</Link>
        <Link href="/about">About</Link>
        <Link href="/notifications">Notifications</Link>

        {user ? (
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "14px", color: "#2F4538", fontWeight: 600 }}>{user.email}</span>
            <form action={signout}>
              <button type="submit" className="signup-button" style={{ border: "none", cursor: "pointer" }}>
                Log Out
              </button>
            </form>
          </div>
        ) : (
          <>
            <Link href="/login">Log In</Link>
            <Link href="/signup" className="signup-button">
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
