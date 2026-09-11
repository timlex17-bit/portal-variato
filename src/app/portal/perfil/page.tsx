'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { usePortal } from '@/hooks/usePortal'
import PortalLayout from '@/components/layout/PortalLayout'

export default function PerfilPage() {
  const { user, profile, loading } = usePortal()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState<any>(null)

  if (!loading && profile && !form) setForm({ full_name: profile.full_name, phone: profile.phone || '', lang: profile.lang || 'TET' })

  async function saveProfile() {
    if (!user || !form) return
    setSaving(true)
    const supabase = createClient()
    await supabase.from('profiles').update(form).eq('id', user.id)
    await supabase.from('audit_log').insert({ profile_id: user.id, action: 'profile_update', description: 'Perfil atualizada' })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (loading || !profile || !form) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⚖ A karrega...</div>

  return (
    <PortalLayout title="Perfil" userName={profile.full_name} userRole={profile.role} isAdmin={profile.role === 'advogadu'}>
      <div className="grid-2">
        <div>
          <div className="card">
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '24px' }}>
              <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--navy)', fontWeight: 700, fontSize: '1.6rem' }}>{profile.full_name[0]}</div>
              <div>
                <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.3rem', fontWeight: 700 }}>{profile.full_name}</h2>
                <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>{profile.email}</p>
                <span className={`badge ${profile.role === 'advogadu' ? 'badge-ativu' : 'badge-rezolvidu'}`} style={{ marginTop: '6px' }}>{profile.role}</span>
              </div>
            </div>
            <div className="form-group"><label className="form-label">Naran Kompletu</label><input className="form-input" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">Telefone</label><input className="form-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+670 ..." /></div>
            <div className="form-group"><label className="form-label">Lian</label>
              <select className="form-select" value={form.lang} onChange={e => setForm({ ...form, lang: e.target.value })}>
                <option value="TET">🇹🇱 Tetun</option><option value="PT">🇵🇹 Portugés</option><option value="EN">🇺🇸 English</option>
              </select></div>
            <button className="btn btn-gold" onClick={saveProfile} disabled={saving}>{saving ? 'A grava...' : saved ? '✓ Gravadu!' : '💾 Grava Mudansa'}</button>
          </div>
        </div>
        <div>
          <div className="card">
            <div className="card-title">Seguransa Konta</div>
            <div className="toggle-row">
              <div><div style={{ fontWeight: 600, fontSize: '.9rem' }}>Autentikasaun 2FA</div><div style={{ fontSize: '.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>Proteje konta ho kódigu OTP</div></div>
              <div className={`toggle-knob ${profile.two_fa_enabled ? 'on' : ''}`} onClick={async () => {
                const supabase = createClient()
                await supabase.from('profiles').update({ two_fa_enabled: !profile.two_fa_enabled }).eq('id', user.id)
                window.location.reload()
              }} />
            </div>
            <div className="toggle-row">
              <div><div style={{ fontWeight: 600, fontSize: '.9rem' }}>Notifikasaun Email</div><div style={{ fontSize: '.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>Simu update kazu liu husi email</div></div>
              <div className="toggle-knob on" />
            </div>
          </div>
          <div className="card">
            <div className="card-title">Redefine Palavra-passe</div>
            <p style={{ fontSize: '.875rem', color: 'var(--text-muted)', marginBottom: '16px' }}>Ita sei simu email atu redefine palavra-passe.</p>
            <button className="btn btn-ghost btn-sm" onClick={async () => {
              const supabase = createClient()
              await supabase.auth.resetPasswordForEmail(profile.email)
              alert('Link redefine harukadu ba ' + profile.email)
            }}>📧 Haruka Link Redefine</button>
          </div>
        </div>
      </div>
    </PortalLayout>
  )
}
