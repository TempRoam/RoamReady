/**
 * a) Module Name: OAuth & PKCE Callback Handler
 * b) Date of Code: October 14, 2026 - November 2, 2026
 * c) Programmer's Name: Peter Kimberley
 * d) Brief Description: Next.js App Router GET Route Handler that intercepts OAuth 2.0
 *    authorization codes and email token hashes from Google and Supabase Auth, securely
 *    exchanging them for persistent JWT session cookies.
 * e) Important Functions:
 *    - GET(request: NextRequest): Parses query parameters (code, token_hash, type) from the
 *      incoming redirect URL, performs server-side code exchange via Supabase, writes session
 *      cookies onto the redirect response, and forwards the user to the destination page.
 * f) Important Data Structures:
 *    - URLSearchParams: Standard structure for reading query string parameters from request URLs.
 *    - NextResponse: Next.js server HTTP response object modified to transport Set-Cookie headers.
 * g) Algorithm & Justification:
 *    - PKCE (Proof Key for Code Exchange / RFC 7636): Uses SHA-256 code challenge to prevent
 *      authorization code interception attacks on public web applications.
 *    - Dual-Path Exchange (token_hash vs PKCE code): Supports email OTP verification via
 *      verifyOtp({ token_hash, type }) so cross-device email links authenticate without
 *      requiring an existing browser PKCE verifier cookie.
 */

import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/'
  const errorDescription = searchParams.get('error_description') || searchParams.get('error')

  const forwardedHost = request.headers.get('x-forwarded-host')
  const isLocalEnv = process.env.NODE_ENV === 'development'
  const redirectBase = isLocalEnv || !forwardedHost ? origin : `https://${forwardedHost}`

  if (errorDescription) {
    return NextResponse.redirect(`${redirectBase}/login?error=${encodeURIComponent(errorDescription)}`)
  }

  const cookieStore = await cookies()
  const redirectResponse = NextResponse.redirect(`${redirectBase}${next}`)

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          try {
            cookieStore.set(name, value, options)
          } catch {}
          redirectResponse.cookies.set(name, value, options)
        })
      },
    },
  })

  // 1. Handle email OTP / confirmation / magic link / recovery
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as any,
    })
    if (!error) {
      return redirectResponse
    }
    return NextResponse.redirect(`${redirectBase}/login?error=${encodeURIComponent(error.message)}`)
  }

  // 2. Handle OAuth / PKCE code exchange
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return redirectResponse
    }
    return NextResponse.redirect(`${redirectBase}/login?error=${encodeURIComponent(error.message)}`)
  }

  return NextResponse.redirect(`${redirectBase}/login?error=Could not authenticate with Google`)
}
