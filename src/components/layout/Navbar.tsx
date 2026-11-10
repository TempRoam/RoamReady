"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(Boolean(session));
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function checkUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    setIsLoggedIn(Boolean(user));
  }

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      alert(error.message);
      return;
    }

    window.location.href = "/login";
  }

  return (
    <nav className="navbar">
      <Link href="/" className="nav-logo">
        <span>Roam</span>Ready
      </Link>

      <div className="nav-links">
        <Link href="/features">Features</Link>
        <Link href="/about">About</Link>
        <Link href="/notifications">Notifications</Link>

        {isLoggedIn ? (
          <button 
            type="button"
            onClick={handleLogout}
            className="signup-button"
          >
            Log Out
          </button>  
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