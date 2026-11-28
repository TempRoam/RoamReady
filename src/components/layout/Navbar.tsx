//edited navbar for the log out to show wihtout having to run cmd r
import Link from "next/link"
import { cookies } from "next/headers"
import { createClient } from "@/utils/supabase/server"
import { logout } from "@/app/login/actions"
// the server component reads the session from the cookies on every request.
// The login and logout actions call revalidatePath('/', 'layout'), which makes this re-render, 
// so the bar switches between Log In / Sign Up and Log Out without a manual refresh.
export default async function Navbar() {
  const supabase = createClient(await cookies())
  const {
    data: { user },
  } = await supabase.auth.getUser()

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
          <form action={logout}>
            <button type="submit" className="signup-button">
              Log Out
            </button>
          </form>
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
  )
}