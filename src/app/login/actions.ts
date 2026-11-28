//updated for logout functinality
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies, headers } from 'next/headers'
import { createClient } from '@/utils/supabase/server'

// Builds the sites own origin (works on localhost and on Vercel)
async function getOrigin() {
  const headerList = await headers()
  const host = headerList.get('x-forwarded-host') || headerList.get('host')
  const proto = headerList.get('x-forwarded-proto') || 'http'
  return headerList.get('origin') || (host ? `${proto}://${host}` : 'http://localhost:3000')
}

// Redirects back to a page with a URL-encoded error message
function fail(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`)
}

export async function login(formData: FormData) {
  const email = ((formData.get('email') as string) ?? '').trim()
  const password = (formData.get('password') as string) ?? ''

  if (!email || !password) fail('/login', 'Missing email or password')

  const supabase = createClient(await cookies())
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) fail('/login', error.message)

  revalidatePath('/', 'layout') // makes the Navbar re-render as logged in
  redirect('/')
}

export async function signup(formData: FormData) {
  const email = ((formData.get('email') as string) ?? '').trim()
  const password = (formData.get('password') as string) ?? ''
  const fullName = ((formData.get('fullName') as string) ?? '').trim()

  if (!email || !password) fail('/signup', 'Missing email or password')

  const supabase = createClient(await cookies())
  const origin = await getOrigin()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) fail('/signup', error.message)

  // With email confirmation turned on there is no session until the user clicks the link in their email
  if (!data.session) {
    redirect(`/login?message=${encodeURIComponent('Check your email to confirm your account, then log in.')}`)
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function logout() {
  const supabase = createClient(await cookies())
  await supabase.auth.signOut()

  revalidatePath('/', 'layout') // makes the Navbar re-render as logged out
  redirect('/login')
}

export async function signInWithGoogle() {
  const supabase = createClient(await cookies())
  const origin = await getOrigin()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${origin}/auth/callback` },
  })

  if (error || !data?.url) fail('/login', 'Could not authenticate with Google')

  redirect(data.url)
}


/* 'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { cookies, headers } from 'next/headers'

export async function login(formData: FormData) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    redirect('/login?error=Missing email or password')
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    redirect('/login?error=Could not authenticate user')
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(formData: FormData) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string

  if (!email || !password) {
    redirect('/signup?error=Missing email or password')
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      }
    }
  })

  if (error) {
    redirect('/signup?error=Could not sign up user')
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signInWithGoogle() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const headerList = await headers()
  const host = headerList.get('x-forwarded-host') || headerList.get('host')
  const proto = headerList.get('x-forwarded-proto') || 'http'
  const origin = headerList.get('origin') || (host ? `${proto}://${host}` : 'http://localhost:3000')

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    redirect('/login?error=Could not authenticate with Google')
  }

  if (data?.url) {
    redirect(data.url)
  }
}
  */
