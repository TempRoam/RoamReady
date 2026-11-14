/**
 * a) b) c)
 * @module SignupPage
 * @file   src/app/signup/page.tsx
 * @date  created on: last updated: 
 * @programmer Daniela Chavez
 *
 *d) Description:
 * This is the Server part that renders the "Create Account" page. The form submits user     
 * info to the server action for signup in ../login/action.ts and handles created accounts       
through Supabase.
 *e)
 * @function SignupPage
 * @param  props.searchParams Promise<{ error?: string }>. The URL query params. For *Next.js the promise needs to be awaited before getting its values.
 * @returns JSX for the signup form. If there is an error message in the URL query *params the error shows in the url and the page itself.
  * f)
 * Data structures: FormData fields sent to the action to get the users info given that is *fullName, email, password. The field fullName is a string that represents the user’s email *address. The field email is the string that represents the user’s email address. The field *password is the string representing the user’s password.
 * g)
 * Algorithm: The page awaits searchParams Promise so that it can get any error *message that is passed through the URL. If an error message is there, it is shown above *the page. The page then renders the signup page with fields for full name, email address *and password. When the user submits the form, the data of that form is then passed *through to the signup server action, that communicates with Supabase to handle the *account creation.
 * 
* Relies on: Next.js Sever Components, Supabase signup server action, SubmitButton component, signup.module.css.
 */


import { signup } from '../login/actions' //the account is created by the signup server action in, ../login/action.ts, whcih talks to supabase
import styles from './signup.module.css' //for this page only, this isn't connected to the global.css
import SubmitButton from './SubmitButton' //"create" button, disbales while submitting

export default async function SignupPage(props: { searchParams: Promise<{ error?: string }> }) {
    //searchParams is a Promise, has to be awaited before reading from it
    const searchParams = await props.searchParams
    const errorMessage = searchParams?.error //reading without await would throw an error

    return (
        <main className={styles.page}>
          <h1 className={styles.title}>Create Account</h1>

          {errorMessage && ( <p className={styles.error} role="alert">{errorMessage}</p> ) }

          <form action={signup} className={styles.form}>
            <label htmlFor="fullName" className={styles.label}>Full Name</label>
            <input id="fullName" type="text" name="fullName" placeholder="full name" required
            className={styles.input} />

             <label htmlFor="email" className={styles.label}>Email</label>
            <input id="email" type="email" name="email" placeholder="roamready@abc.com" required
            className={styles.input} />

             <label htmlFor="password" className={styles.label}>Password</label>
            <input id="password" type="password" name="password" placeholder=" enter password" required
            className={styles.input} />

            <SubmitButton className={styles.button} pendingText="Create Account..">Create</SubmitButton>

          </form>

     </main>
    )
}

/* "use client";

import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage(
      "Account created. Please check your email to confirm your account."
    );
  }

  async function handleGoogleSignup() {
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
    <main className="signup-page">
      <section className="signup-card">
        <h1>Create Account</h1>

        <form onSubmit={handleSignup}>
          <label htmlFor="fullName">Full Name</label>
          <input
            id="fullName"
            type="text"
            placeholder="full name"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            required
          />

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

          <button type="submit">Create</button>
        </form>

        <div className="signup-divider">or</div>

        <button
          type="button"
          className="google-button"
          onClick={handleGoogleSignup}
        >
          <span className="google-icon">G</span>
          Continue with Google
        </button>

        {message && <p className="signup-message">{message}</p>}
      </section>
    </main>
  );
}
  */
