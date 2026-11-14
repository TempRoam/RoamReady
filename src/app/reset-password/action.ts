/**
 * Module requestPasswordReset
 * Date last updated: 11/13/2026
 * Programmer Daniela Chavez
 *
*d) Description:
This is the Server action that handles the password recovery requests. It gets the users email and asks supabase auth to then send a password-reset email that has a recovery link.

 *e) Important functions in each class:
 @function requestPasswordReset
 @param formData, this contains the email field eneter by the user
 @returns this returns void, it redirects the user to the reset-password page 
 with either a success message or error message.

 * f) Data structures: 
 FormData - this is used to retrieve the entered email field
 Cookie store - get through Next.js cookies() and passed tot he server-side Supabase client
 Supabase client - used to communicate with Supabase auth
 Headers - used to retrieve the request origin for the recovery URL
 error - contains the errors returned by supabase
 redirectTo - URL for where the recovery email should redirect to
 * g) Algorithm: 
 * When the user submits their email, the function gets the email and then removes any extra spaces.
 * It then checks that the email field is not empty before it continues. 
 * Then it connects to Supabase and will ask Supabase to send a password-reset email to the user in their 
 * email used. The recovery link will redirect the user to the auth callback 
 * and that will take them to the update-password page. 
 
 * Relies on: Next.js cookies() and headers(), Next.js redirect(), Supabase server client, Supabase Auth password
 recovery functionality.
 */
'use server'
//need these to ask supabase to email a password reset link
//using form on the reset pass page
import { cookies, headers } from 'next/headers' 
import { redirect } from 'next/navigation' 
import { createClient } from '@/utils/supabase/server' 

export async function requestPasswordReset(formData: FormData) {
    const email = ((formData.get('email') as string) ?? '').trim()

    if (!email) {
        redirect(`/reset-password?error=${encodeURIComponent('Please enter your email')}`)
    }
    
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    const origin = (await headers()).get('origin')

    const { error } = await supabase.auth.requestPasswordForEmail(email, {
         //redirectTo
        redirectTo: `${origin}/auth/callback?next=/update-password`, //where the link will send the user and the callback route signs them in, then forwards them to ?next=.....
    })
    //if(error)
    //redirect
    if (error) {
        redirect(`/reset-password?error=${encodeURIComponent('Link could not send. Please try again later.')}`)
    }

    //redirect
    redirect(`/reset-password?message=${encodeURIComponent('If an account exists, a reset link has been sent.')}`)
}






//auth action.ts for reference
//export async function signInWithGoogle() {
//    const cookieStore = await cookies()
//    const supabase = createClient(cookieStore)
//
//    const origin = (await headers()).get('origin')
//
//    const { data, error } = await supabase.auth.signInWithOAuth({
//        provider: 'google',
//        options: { redirectTo: '${origin}/auth/callback' },
//    })

//    if (error || !data.url) {
//        redirect('/signup?error=Could not reach Google sign in')
//    }
//    redirect(data.url)
//}
