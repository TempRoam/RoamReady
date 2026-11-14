'use server'

import { cookies, headers  } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function signInWithGoogle() {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const origin = (await headers()).get('origin')

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
<<<<<<< Updated upstream
        options: { redirectTo: '${origin}/auth/callback'},
=======
        options: { redirectTo: `${origin}/auth/callback` },
>>>>>>> Stashed changes
    })

    if (error || !data.url) {
        redirect('/signup?error=Could not reach Google sign in')
    }
    redirect(data.url) 
}