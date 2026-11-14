'use server'

import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function signInWithGoogle() {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const headerList = await headers()
    const host = headerList.get('x-forwarded-host') || headerList.get('host')
    const proto = headerList.get('x-forwarded-proto') || 'http'
    const origin = headerList.get('origin') || (host ? `${proto}://${host}` : 'http://localhost:3000')

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
<<<<<<< HEAD
<<<<<<< Updated upstream
        options: { redirectTo: '${origin}/auth/callback'},
=======
        options: { redirectTo: `${origin}/auth/callback` },
>>>>>>> Stashed changes
=======
        options: { redirectTo: `${origin}/auth/callback` },
>>>>>>> 5ee978af8502e924d73efa4f0c44440f07cc9945
    })

    if (error || !data?.url) {
        redirect(`/login?error=${encodeURIComponent(error?.message || 'Could not reach Google sign in')}`)
    }
    redirect(data.url) 
}
