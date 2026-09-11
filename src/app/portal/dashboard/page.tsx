'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { usePortal } from '@/hooks/usePortal'
import PortalLayout from '@/components/layout/PortalLayout'
import { formatCurrency, statusBadgeClass, timeAgo } from '@/lib/utils'

export default function DashboardPage() {
  const { user, profile, loading } = usePortal()
  const [stats, setStats] = useState({ kazuAtivu: 0, eventu: 0, dokumentu: 0, invoicePendente: 0 })
  const [kazu, setKazu] = useState<any[]>([])
  const [audit, setAudit] = useState<any[]>([])

  useEffect(() => {
    if (!user) return
    const supabase = createClient()
    Promise.all([
      supabase.from('kazu').select('*').order('created_at', { ascending: false }).limit(5),
      supabase.from('eventu').select('id').gte('start_time', new Date().toISOString()),
      supabase.from('dokumentu').select('id'),
      supabase.from('invoice').select('status, total'),
      supabase.from('audit_log').select('*').eq('profile_id', user.id).order('created_at', { ascending: false }).limit(5),
    ]).then(([k, e, d, i, a]) => {
      setKazu(k.data || [])
      setAudit(a.data || [])
      const inv = i.data || []
      setStats({
        kazuAtivu: k.data?.filter((x: any) => x.status === 'ativu').length || 0,
        eventu: e.data?.length || 0,
        dokumentu: d.data?.length || 0,
        invoicePendente: inv.filter((x: any) => x.status === 'pendente').reduce((s: number, x: any) => s + Number(x.total), 0),
      })
    })
  }, [user])

  if (loading || !profile) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface)' }}>
      <div style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>⚖ A karrega...</div>
    </div>
  )

  const auditIcons: Record<string, string> = { login: '🔑', upload: '📄', payment: '💰', sign: '✍️', kazu_create: '📁', default: '📋' }

  return (
    <PortalLayout title="Dashboard" userName={profile.full_name} userRole={profile.role} isAdmin={profile.role === 'advogadu'}>
      <div className="kpi-grid">
        <div className="kpi"><div className="kpi-label">Kazu Ativu</div><div className="kpi-value">{stats.kazuAtivu}</div><div className="kpi-delta">↑ Ativu agora</div></div>
        <div className="kpi"><div className="kpi-label">Audiénsia Tuir Mai</div><div className="kpi-value">{stats.eventu}</div><div className="kpi-delta">Eventu agendado</div></div>
        <div className="kpi"><div className="kpi-label">Dokumentu</div><div className="kpi-value">{stats.dokumentu}</div><div className="kpi-delta">Total iha sistema</div></div>
        <div className="kpi"><div className="kpi-label">Fatura Pendente</div><div className="kpi-value">{formatCurrency(stats.invoicePendente)}</div><div className="kpi-delta" style={{ color: 'var(--warning)' }}>Aguarda pagamentu</div></div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-title">Kazu Resente <a href="/portal/kazu" className="btn btn-ghost btn-xs">Haree Hotu</a></div>
          <table className="tbl">
            <thead><tr><th>ID</th><th>Titulo</th><th>Estatutu</th><th>%</th></tr></thead>
            <tbody>
              {kazu.length === 0
                ? <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>Laiha kazu seidauk</td></tr>
                : kazu.map((k: any) => (
                  <tr key={k.id} style={{ cursor: 'pointer' }} onClick={() => window.location.href = '/portal/kazu'}>
                    <td style={{ color: 'var(--gold)', fontWeight: 600 }}>{k.kazu_number}</td>
                    <td>{k.titulo}</td>
                    <td><span className={statusBadgeClass(k.status)}>{k.status}</span></td>
                    <td style={{ color: 'var(--text-muted)' }}>{k.progress}%</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="card-title">Aktividade Resente</div>
          {audit.length === 0
            ? <p style={{ color: 'var(--text-muted)', fontSize: '.875rem', textAlign: 'center', padding: '20px' }}>Laiha aktividade seidauk</p>
            : audit.map((a: any) => (
              <div key={a.id} className="audit-item">
                <div className="audit-icon" style={{ background: 'rgba(201,168,76,0.15)' }}>{auditIcons[a.action] || auditIcons.default}</div>
                <div className="audit-text"><strong>{a.description}</strong><p>{a.entity_type || 'Sistema'}</p></div>
                <div className="audit-time">{timeAgo(a.created_at)}</div>
              </div>
            ))}
        </div>
      </div>

      {kazu.length > 0 && (
        <div className="card">
          <div className="card-title">Progresu Kazu</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {kazu.map((k: any) => (
              <div key={k.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.85rem', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 500 }}>{k.kazu_number} — {k.titulo}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{k.progress}%</span>
                </div>
                <div className="progress-bar"><div className="progress-fill" style={{ width: `${k.progress}%` }} /></div>
              </div>
            ))}
          </div>
        </div>
      )}
    </PortalLayout>
  )
}
