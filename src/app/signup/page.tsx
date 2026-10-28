import { signup } from '../login/actions'
import styles from './signup.module.css'
import SubmitButton from './SubmitButton'
import { signInWithGoogle } from '../auth/actions'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function SignupPage(props: { searchParams: Promise<{ error?: string }> }) {
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

<p className={styles.divider}>or</p>
<form action={signInWithGoogle}>
  <SubmitButton className={styles.googleButton} pendingText="Loading Google...">
    Continue with Google
    </SubmitButton>
    </form>


     </main>
    )
}
