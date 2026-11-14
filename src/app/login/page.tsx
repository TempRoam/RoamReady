/**
 * Module LoginPage
 * File   src/app/login/page.tsx
 * Date   created on: last updated: 
 * Programmer Daniela Chavez
 *
*d) Description: The Server component that renders the "Log in" page.
* It gives two authentication options, one is in ./action.ts, the other is
* Google authentication through signInWithGoogle in ../auth/actions.ts
* The page also resuses the signup CSS module, SubmitButton component, and gives a link to the reset-password page.
 *e) Important functions in each class:
 @function LoginPage
 @param props.searchParams this contains URL query params, the Promise must be awaited
 before getting its values.
 @returns JSX , this contains the login form and an optional error message, as well as a forgot-password link
 and a separate Google sign-in form
 * f) Data structures: 
 FormData - used to collect the users email and password fields and have it submitted through the login form.
 searchParams - this is a Promise containing an optional error string
 two seperate forms are used for the Google authentication and the email address/password authentication.
 * g) Algorithm: The page first checks the URL for any error messages and then displays them
 if they are there, the user can log in using their email and password, this is then sent to the login server action or Continue with Google if they prefer.
 The SubmitButton component tracks when either form is being submitted and temporarily will disable the button to try to stop multiple submissions. This 
 approach gives the user two login options.
 
 * Relies on: Next.js Server Components, Next.js Link components, login server action
 * google authentication server action, shared signup.module.css, shared submitbutton
 */

import { login } from './actions'
import Link from 'next/link'; //forgot pass added + line 30
//resuing styles and button from sign up
//the login process happens in the login server action in ./action.ts
import { signInWithGoogle } from '../auth/actions' 
import styles from '../signup/signup.module.css' 
import SubmitButton from '../signup/SubmitButton' 

export default async function LoginPage(props: { searchParams: Promise<{ error?: string }> }) {
    const searchParams = await props.searchParams
    const errorMessage = searchParams?.error //reading without await would throw an error
    //code changed to similar to signup but use autoComplete so the browser can offer to fill it in(or hopefully suggest something for the user)
    //no fullName since its not signing up, its logging in 
    return (

        <main className={styles.page}>
          <h1 className={styles.title}>Log in</h1>

          {errorMessage && ( <p className={styles.error} role="alert">{errorMessage}</p> ) }

          <form action={login} className={styles.form}>
            <label htmlFor="email" className={styles.label}>Email</label>
            <input id="email" type="email" name="email" placeholder="roamready@abc.com" required
            autoComplete="email" className={styles.input} />

             <label htmlFor="password" className={styles.label}>Password</label>
            <input id="password" type="password" name="password" placeholder=" enter password" required
            autoComplete="current password" className={styles.input} />
            
            <Link href="/reset-password" className={styles.forgotLink}>Forgot password?</Link>

            <SubmitButton className={styles.button} pendingText="Get Roam Ready!..">Log In</SubmitButton>
          </form>

<p className={styles.divider}>or</p>
<form action={signInWithGoogle}>
  <SubmitButton className={styles.googleButton} pendingText="Loading Google...">
    Continue with Google
    </SubmitButton>
    </form>


     </main>
    )
}

/* "use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    window.location.href = "/";
  }

  async function handleGoogleLogin() {
    setMessage("");

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });

    if (error) {
      setMessage(error.message);
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <h1>Log In</h1>

        <form onSubmit={handleLogin}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="roamready@abc.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="enter password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          <button type="submit">Log In</button>
        </form>

        <Link href="/reset-password" className="forgot-link">
          Forgot your password?
        </Link>

        <div className="login-divider">or</div>

        <button
          type="button"
          className="google-button"
          onClick={handleGoogleLogin}
        >
          <span className="google-icon">G</span>
          Continue with Google
        </button>

        {message && <p className="login-message">{message}</p>}
      </section>
    </main>
  );
}
  */