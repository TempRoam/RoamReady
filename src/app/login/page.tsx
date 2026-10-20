import { login, signInWithGoogle } from './actions'

export default async function LoginPage(props: { searchParams: Promise<{ error?: string }> }) {
    const searchParams = await props.searchParams
    return (
        <main>
            <section className="login">
                <div className="log-in">
                    <h1>Log in</h1>
                    {searchParams?.error && <p style={{ color: 'red' }}>{searchParams.error}</p>}
                    <form action={login}>
                        <input type="email" name="email" placeholder="Email" required />
                        <input type="password" name="password" placeholder="Password" required />
                        <button type="submit">Log In</button>
                    </form>

                    <hr style={{ margin: '16px 0' }} />

                    <form action={signInWithGoogle}>
                        <button type="submit">Sign in with Google</button>
                    </form>
                </div>
            </section>
        </main>
    );
}
