'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin() {
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Email ka palavra-passe sala!')
      setLoading(false)
      return
    }
    router.push('/portal/dashboard')
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg,#0B1D3A 0%,#1a3a6b 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px'
    }}>
      <div style={{
        background: '#fff', borderRadius: '16px', padding: '40px',
        maxWidth: '420px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontSize: '2.5rem' }}>⚖</div>
          <h1 style={{ fontFamily: 'Georgia,serif', fontSize: '1.5rem', color: '#0B1D3A', marginTop: '8px' }}>
            Dr. Variato <span style={{ color: '#C9A84C' }}>da Costa</span>
          </h1>
          <p style={{ color: '#6B7280', fontSize: '.9rem', marginTop: '8px' }}>Tama ba ita-nia portal jurídiku</p>
        </div>

        {error && (
          <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '10px 14px', borderRadius: '8px', fontSize: '.875rem', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '.8rem', fontWeight: 600, color: '#6B7280', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '.04em' }}>E-mail</label>
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="ita@email.com"
            style={{ width: '100%', padding: '10px 14px', border: '1px solid #E2DDD4', borderRadius: '8px', fontSize: '.9rem', outline: 'none', fontFamily: 'inherit' }}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '.8rem', fontWeight: 600, color: '#6B7280', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '.04em' }}>Palavra-passe</label>
          <input
            type="password" value={password} onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{ width: '100%', padding: '10px 14px', border: '1px solid #E2DDD4', borderRadius: '8px', fontSize: '.9rem', outline: 'none', fontFamily: 'inherit' }}
          />
        </div>

        <button
          onClick={handleLogin} disabled={loading}
          style={{ width: '100%', padding: '12px', background: '#C9A84C', color: '#0B1D3A', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '.95rem', cursor: 'pointer' }}
        >
          {loading ? 'Atu tama...' : '🔑 Tama Sai'}
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '12px' }}>
          <button onClick={() => { setEmail('kliente@demo.tl'); setPassword('Demo123!') }}
            style={{ padding: '8px', background: '#F8F6F1', border: '1px solid #E2DDD4', borderRadius: '8px', fontSize: '.8rem', cursor: 'pointer', fontFamily: 'inherit' }}>
            👤 Demo Kliente
          </button>
          <button onClick={() => { setEmail('variato@dacosta.tl'); setPassword('Admin123!') }}
            style={{ padding: '8px', background: '#F8F6F1', border: '1px solid #E2DDD4', borderRadius: '8px', fontSize: '.8rem', cursor: 'pointer', fontFamily: 'inherit' }}>
            ⚖ Demo Admin
          </button>
        </div>

        <p style={{ textAlign: 'center', fontSize: '.85rem', color: '#6B7280', marginTop: '20px' }}>
          La iha konta? <a href="/auth/register" style={{ color: '#C9A84C', fontWeight: 600 }}>Rejista agora</a>
        </p>
      </div>
    </div>
  )
}
