import { signup, signInWithGoogle } from '../login/actions'

export default async function SignupPage(props: { searchParams: Promise<{ error?: string }> }) {
    const searchParams = await props.searchParams
    return (
        <main>
            <section className="sign">
                <div className="sign-up">
                    <div>
                        <h1>Sign Up</h1>
                        {searchParams?.error && <p style={{ color: 'red' }}>{searchParams.error}</p>}
                        <form action={signup}>
                            <input type="text" name="fullName" placeholder="Full Name" required />
                            <input type="email" name="email" placeholder="Email" required />
                            <input type="password" name="password" placeholder="Password" required />
                            <button type="submit">Sign Up</button>
                        </form>

                        <hr style={{ margin: '16px 0' }} />

                        <form action={signInWithGoogle}>
                            <button type="submit">Sign up with Google</button>
                        </form>
                    </div>
                </div>
            </section>
        </main>
    );
}
