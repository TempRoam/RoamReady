import Link from "next/link";

export default function Navbar() {
  return (
    <main>
      <nav className="trip-navbar">
        <Link href="/" className="nav-logo"><span>Roam</span>Ready</Link>
        <div className="nav-links">
          <Link href="/features">My trips</Link>
          <Link href="/about">Budget</Link>
          <Link href="/login">Itinerary</Link>
          <Link href="/signup" className="signup-button">Sign Up</Link>
        </div>
      </nav>
    </main>
  );
}