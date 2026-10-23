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
            
            <Link href="/reset-password" className={styles.forgotLink}>Forgot password?<Link>

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
