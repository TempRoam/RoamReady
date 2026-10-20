import Link from "next/link"; // Next.js link

export default function Navbar() {
  return (
    <main>
      <nav className="navbar">
        <Link href="/" className="nav-logo"><span>Roam</span>Ready</Link>
        <div className="nav-links">
          <Link href="/features">Dashboard</Link>
          <Link href="/about">About</Link>
          <Link href="/login">Log In</Link>
          <Link href="/signup" className="signup-button">Sign Up</Link>
        </div>
      </nav>
    </main>
  );
}
