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
                <input id="email" className={styles.input} />

                <SubmitButton className={local.sendButton} pendingText="Sending...">Send Link</SubmitButton>
                </form>
                <p className={local.back}>
                    <Link href="/login">Back to login page</Link>
                    </p>
                    </main>
    )
    }
