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
    const headerList = await headers()
    const host = headerList.get('x-forwarded-host') || headerList.get('host')
    const proto = headerList.get('x-forwarded-proto') || 'http'
    const origin = headerList.get('origin') || (host ? `${proto}://${host}` : 'http://localhost:3000')

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/auth/callback?next=/update-password`,
    })

    if (error) {
        redirect(`/reset-password?error=${encodeURIComponent('Link could not send. Please try again later.')}`)
    }

    redirect(`/reset-password?message=${encodeURIComponent('If an account exists, a reset link has been sent.')}`)
}
