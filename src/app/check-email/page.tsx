import Link from "next/link";

export default function CheckEmailPage() {
    return (
        <main>
            <section className="check-email">
                <div className="check-email-content">
                    <h1>Check Your Email</h1>
                    <p>If an account exists for this email, you’ll receive a link to reset your password.</p>
                    <Link href="/login" className="back-to-login-button">Back to Login</Link>
                </div>
            </section>
        </main>
    );
}