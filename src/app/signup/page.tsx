import { signup } from '../login/actions' //the account is created by the signup server action in, ../login/action.ts, whcih talks to supabase
import styles from './signup.module.css' //for this page only, this isn't connected to the global.css
import SubmitButton from './SubmitButton' //"create" button, disbales while submitting
import { signInWithGoogle } from '../auth/actions'

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

<p className={styles.divider}>or</p>
<form action={signInWithGoogle}>
  <SubmitButton className={styles.googleButton} pendingText="Loading Google...">
    Continue with Google
    </SubmitButton>
    </form>


     </main>
    )
}
