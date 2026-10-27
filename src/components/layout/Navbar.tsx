import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { signout } from "@/app/login/actions";

export default async function Navbar() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <main>
      <nav className="navbar">
        <Link href="/" className="nav-logo"><span>Roam</span>Ready</Link>
        <div className="nav-links">
          <Link href="/features">Dashboard</Link>
          <Link href="/about">About</Link>
          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "14px", color: "#2F4538", fontWeight: 600 }}>{user.email}</span>
              <form action={signout}>
                <button type="submit" className="signup-button" style={{ border: "none", cursor: "pointer" }}>Log Out</button>
              </form>
            </div>
          ) : (
            <>
              <Link href="/login">Log In</Link>
              <Link href="/signup" className="signup-button">Sign Up</Link>
            </>
          )}
        </div>
      </nav>
    </main>
  );
}
