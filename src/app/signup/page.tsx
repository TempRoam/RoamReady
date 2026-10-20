import { signup } from '../login/actions'

export default async function SignupPage(props: { searchParams: Promise<{ error?: string }> }) {
    const searchParams = await props.searchParams
    return (
        <main>
            <div>
            <h1>Sign Up</h1>
            {searchParams?.error && <p style={{ color: 'red' }}>{searchParams.error}</p>}
            <form action={signup}>
                <input type="text" name="fullName" placeholder="Full Name" required />
                <input type="email" name="email" placeholder="Email" required />
                <input type="password" name="password" placeholder="Password" required />
                <button type="submit">Sign Up</button>
            </form>
        </div>
        </main>
        
    );
}
