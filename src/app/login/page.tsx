import { login } from './actions'
import Link from 'next/link';
import styles from '../signup/signup.module.css' 
import SubmitButton from '../signup/SubmitButton' 
import GoogleSignInButton from '@/components/auth/GoogleSignInButton'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function LoginPage(props: { searchParams: Promise<{ error?: string }> }) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
        redirect('/')
    }

    const searchParams = await props.searchParams
    const errorMessage = searchParams?.error

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
          <GoogleSignInButton className={styles.googleButton} />
     </main>
    )
}
