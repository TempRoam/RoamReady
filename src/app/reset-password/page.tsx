export default function ResetPasswordPage() {
    return (
         <main>
            <section className="rest">
                <div className="rest-password">
                    <h1>Reset Password</h1>
                    <form>
                        <input type="email" placeholder="Email" />
                        <button type="submit">Send Reset Link</button>
                    </form>
                </div>
            </section>
        </main>
    );
}
