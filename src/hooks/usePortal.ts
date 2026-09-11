'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export function usePortal() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) { router.push('/auth/login'); return }
      setUser(session.user)
      const { data, error } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
      if (error || !data) {
        const { data: np } = await supabase.from('profiles').insert({
          id: session.user.id,
          full_name: session.user.email?.split('@')[0] || 'User',
          email: session.user.email || '',
          role: 'kliente',
        }).select().single()
        setProfile(np)
      } else {
        setProfile(data)
      }
      setLoading(false)
    })
  }, [])

  return { user, profile, loading }
}
