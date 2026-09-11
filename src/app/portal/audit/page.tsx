'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { usePortal } from '@/hooks/usePortal'
import PortalLayout from '@/components/layout/PortalLayout'
import { timeAgo } from '@/lib/utils'

const ICONS: Record<string,string> = { login:'🔑', upload:'📄', payment:'💰', sign:'✍️', kazu_create:'📁', default:'📋' }
const BG: Record<string,string> = { login:'#DCFCE7', upload:'#DBEAFE', payment:'rgba(201,168,76,0.15)', sign:'#F3E8FF', kazu_create:'#DCFCE7', default:'var(--surface)' }

export default function AuditPage() {
  const { user, profile, loading } = usePortal()
  const [logs, setLogs] = useState<any[]>([])

  useEffect(() => {
    if (!user) return
    const supabase = createClient()
    const q = profile?.role === 'advogadu'
      ? supabase.from('audit_log').select('*, profile:profiles(full_name)').order('created_at', { ascending: false }).limit(50)
      : supabase.from('audit_log').select('*').eq('profile_id', user.id).order('created_at', { ascending: false }).limit(50)
    q.then(({ data }) => setLogs(data || []))
  }, [user, profile])

  if (loading || !profile) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⚖ A karrega...</div>

  return (
    <PortalLayout title="Log Aktividade" userName={profile.full_name} userRole={profile.role} isAdmin={profile.role === 'advogadu'}>
      <div className="card">
        <div className="card-title">Istória Aktividade ({logs.length})</div>
        {logs.length === 0
          ? <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>Laiha log seidauk</p>
          : logs.map((l: any) => (
            <div key={l.id} className="audit-item">
              <div className="audit-icon" style={{ background: BG[l.action] || BG.default }}>{ICONS[l.action] || ICONS.default}</div>
              <div className="audit-text">
                <strong>{l.description}</strong>
                <p>{l.entity_type || 'Sistema'}{l.profile?.full_name ? ` — ${l.profile.full_name}` : ''}</p>
              </div>
              <div className="audit-time">{timeAgo(l.created_at)}</div>
            </div>
          ))}
      </div>
    </PortalLayout>
  )
}
