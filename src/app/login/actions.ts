'use server'

/**
 * a) Module Name: Auth Actions
 * b) Date of Code: October 9, 2026 - October 28, 2026
 * c) Programmer's Name: Peter Kimberley
 * d) Brief Description: Server-side remote procedure calls ('use server') executing in Node.js
 *    to handle user authentication (login, signup, signout) with Supabase Auth and manage
 *    encrypted HTTP-only session cookies.
 * e) Important Functions:
 *    - login(formData: FormData): Validates email/password credentials and establishes an active session.
 *    - signup(formData: FormData): Registers a new user account in Supabase Auth and sets session cookies.
 *    - signout(): Revokes the active session token and clears auth cookies.
 * f) Important Data Structures:
 *    - FormData: W3C standard key-value representation of HTML form submissions.
 *    - ReadonlyRequestCookies: Next.js asynchronous cookie store representing HTTP request headers.
 * g) Algorithm & Justification:
 *    - Server Action RPC over REST Endpoints: Using Next.js Server Actions executes code directly on
 *      the server behind form submissions. This keeps API keys, database credentials, and session
 *      management completely off the client-side JavaScript bundle, mitigating XSS token theft.
 */

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
    redirect(`/login?error=${encodeURIComponent(error.message)}`)
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
    redirect(`/signup?error=${encodeURIComponent(error.message)}`)
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

export async function signout() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
