/**
 * Module 
 * Date   created on: last updated: 
 * Programmer Daniela Chavez
 *
*d) Description: This works as the password recovery page. It uses the users 
email to request a password-rest link through Supabase. The link redirects the user to /auth/callback and handles the authentication
callback and forwards the user to update password.

 *e) Important functions in each class:
 @function ResetPasswordPage
 @param props.searchParams, containing optional success or error messages
 that are passed through the URL
 @returns JSX containing the email input form
 * f) Data structures: 
 * - FormData, this contains the email field that is submitted by the user
 * - searchParams, this contains the optional error and message strings that are used to show feedback 
 * after the recovery request.
 * g) Algorithm: The page checks the URL for any errors or success messages and shows them to the user.
 * The user can then enter their email and submit the form to request a password-reset link. The request is sent to the requestPasswordReset
 * server action and that then communicates with Supabase to handle the recovery process. There is also a link back to the login page. The 
 * overall password recovery is handled by Supabase.
 
 * Relies on: Next.js Sever Components, Next.js Link component, requestPasswordReset server action, shared signup.module.css, reset-password.module.css, SubmitButton component
 */

//works by entering email andit sends a reset link
//link then goes to /auth/callback, that signs them in and sends them to a update password page
//Jira task Nov 9: create update password page/ discuss with team on design
//
//resuses the signup page styles so it matches throughout the pages
//for this page made ./reset-password.module.css for its styles
import Link from 'next/link'
import { requestPasswordReset } from './action'
import styles from '../signup/signup.module.css'
import local from './reset-password.module.css'
import SubmitButton from '../signup/SubmitButton'

//so it can be async, searchParams is a promise in Next.js and has tot be awaited...
//role=status & alert
export default async function ResetPasswordPage(props: {
    searchParams: Promise<{ error?: string; message?: string }> 
}) {
    const { error, message } = await props.searchParams
    return (
        <main className={styles.page}>
            <h1 className={styles.title}>Reset your password</h1>
            {message && <p className={local.success} role="status">{message}</p>}
            {error && <p className={styles.error} role="alert">{error}</p>}

            <form action={requestPasswordReset} className={styles.form}>
                <label htmlFor="email" className={styles.label}>Email</label>
                <input id="email" 
                name="email"
                type="email"
                required
                className={styles.input}
                 />

                <SubmitButton className={local.sendButton} pendingText="Sending...">Send Link</SubmitButton>
                </form>
                <p className={local.back}>
                    <Link href="/login">Back to login page</Link>
                    </p>
                    </main>
    )
    }

    //commenting out because there is a conflict, needs to be fixed or deleted
//"use client";

//import { FormEvent, useState } from "react";
//import { supabase } from "@/lib/supabase";

//export default function ResetPasswordPage() {
  //const [email, setEmail] = useState("");
  //const [message, setMessage] = useState("");

  //async function handleReset(event: FormEvent<HTMLFormElement>) {
    //event.preventDefault();

   // const { error } = await supabase.auth.resetPasswordForEmail(email, {
     // redirectTo: `${window.location.origin}/reset-password/update`,
    //});

    //if (error) {
    //  setMessage(error.message);
    //  return;
   // }

   // setMessage("Check your email for a password reset link.");
  //}

  //return (
    //<main>
      //<h1>Reset your password</h1>

      //<form onSubmit={handleReset}>
        //<input
          //type="email"
          //placeholder="Enter your email"
          //value={email}
          //onChange={(event) => setEmail(event.target.value)}
          //required
        ///>

        //<button type="submit">Send Reset Link</button>
      //</form>

      //{message && <p>{message}</p>}
    //</main>
  //);
//}
