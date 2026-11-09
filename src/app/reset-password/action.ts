'use server'
//need these to ask supabase to email a password reset link
//using form on the reset pass page
import { cookies, headers } from 'next/headers' 
import { redirect } from 'next/navigation' 
import { createClient } from '@utils/supabase/server' 

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
