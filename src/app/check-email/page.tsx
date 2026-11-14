/*
a) Module Check Email page
b) Date of Code created: October 26th 2026 Last Updated: Today
c) Luis Larios
d) The check-email page will allow the user to put their email in. Once they put their email in the page, 
   it will check if the email exists and if it does it will send them a link to reset their password for their account. 
   If their email does not exist, it will tell the user that their email does not exist. 


e) The CheckEmailPage() function has a link button to go back to the login page.

f) The div class name email has the title, text and the div class name receive has the text and a resend link is a placeholder.
   The resend link will allow the user to request the link again if they didn't receive it in their email.

g) This module doesn't have any algorithm.

*/

import Link from "next/link";
export default function CheckEmailPage() {
    return (
        <main>
            <section className="check-email">
                <div className="check-email-content">
                    <div className = "email">
                        <h1>Check Your Email</h1>
                        <p>If an account exists for this email, you'll receive a link to reset your password.</p>
                        <Link href="/login" className="back-to-login-button">Back to Login</Link>
                    </div>
                    <hr className= "email-divider" />
                    <div className = "receive">
                        <p>Didn't receive an email? Check your spam folder.</p>
                        <p>Resend reset link</p>
                    </div>
                </div>
            </section>
        </main>
    );
}