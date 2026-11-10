'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function GoogleSignInButton({ className }: { className?: string }) {
  const [loading, setLoading] = useState(false)

  const handleSignIn = async () => {
    try {
      setLoading(true)
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) {
        setLoading(false)
        window.location.href = `/login?error=${encodeURIComponent(error.message)}`
      }
    } catch {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleSignIn}
      disabled={loading}
      className={className}
    >
      {loading ? 'Connecting to Google...' : 'Continue with Google'}
    </button>
  )
}
