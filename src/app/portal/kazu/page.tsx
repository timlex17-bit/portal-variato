'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { usePortal } from '@/hooks/usePortal'
import PortalLayout from '@/components/layout/PortalLayout'
import { statusBadgeClass, formatDate } from '@/lib/utils'

export default function KazuPage() {
  const { user, profile, loading } = usePortal()
  const [kazu, setKazu] = useState<any[]>([])
  const [filter, setFilter] = useState('hotu')
  const [selected, setSelected] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState({ titulo: '', tipo: 'Litigasaun', description: '', urgency: 'normal' })
  const [saving, setSaving] = useState(false)

  useEffect(() => { if (user) loadKazu() }, [user, filter])

  async function loadKazu() {
    const supabase = createClient()
    let q = supabase.from('kazu').select('*, kazu_timeline(*)').order('created_at', { ascending: false })
    if (filter !== 'hotu') q = q.eq('status', filter)
    const { data } = await q
    setKazu(data || [])
  }

  async function createKazu() {
    if (!form.titulo) return
    setSaving(true)
    const supabase = createClient()
    await supabase.from('kazu').insert({ ...form, kazu_number: '', advogadu_id: user.id, kliente_id: user.id })
    await supabase.from('audit_log').insert({ profile_id: user.id, action: 'kazu_create', description: `Kazu foun: ${form.titulo}` })
    setShowNew(false)
    setForm({ titulo: '', tipo: 'Litigasaun', description: '', urgency: 'normal' })
    setSaving(false)
    loadKazu()
  }

  if (loading || !profile) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⚖ A karrega...</div>

  const steps = ['Konsultasaun', 'Prepara Kazu', 'Dosie Kompletu', 'Audiensia', 'Desizaun']

  return (
    <PortalLayout title="Kazu" userName={profile.full_name} userRole={profile.role} isAdmin={profile.role === 'advogadu'}>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button className="btn btn-gold" onClick={() => setShowNew(true)}>+ Kazu Foun</button>
        {['hotu', 'ativu', 'pendente', 'rezolvidu'].map(f => (
          <button key={f} className={`btn btn-ghost btn-sm ${filter === f ? 'btn-navy' : ''}`}
            onClick={() => setFilter(f)} style={filter === f ? { background: 'var(--navy)', color: '#fff', borderColor: 'var(--navy)' } : {}}>
            {f === 'hotu' ? 'Hotu-hotu' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {kazu.length === 0
        ? <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>Laiha kazu ho filtru ida-ne'e</div>
        : kazu.map((k: any) => {
          const timeline = (k.kazu_timeline || []).sort((a: any, b: any) => a.step_order - b.step_order)
          return (
            <div key={k.id} className="card" style={{ cursor: 'pointer' }} onClick={() => { setSelected(k); setShowModal(true) }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <div style={{ fontSize: '.75rem', color: 'var(--gold)', fontWeight: 600, marginBottom: '4px' }}>{k.kazu_number}</div>
                  <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1rem', fontWeight: 600, color: 'var(--text)' }}>{k.titulo}</div>
                  <div style={{ fontSize: '.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>{k.tipo} · {formatDate(k.start_date)}</div>
                </div>
                <span className={statusBadgeClass(k.status)}>{k.status}</span>
              </div>
              {k.description && <p style={{ fontSize: '.85rem', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: 1.6 }}>{k.description.substring(0, 120)}...</p>}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  <span>Progresu</span><span>{k.progress}%</span>
                </div>
                <div className="progress-bar"><div className="progress-fill" style={{ width: `${k.progress}%` }} /></div>
              </div>
              {timeline.length > 0 && (
                <div style={{ marginTop: '16px' }}>
                  <div className="step-tracker">
                    {timeline.map((s: any, i: number) => (
                      <div key={s.id} className="step">
                        <div className={`step-dot ${s.status === 'done' ? 'done' : s.status === 'active' ? 'active' : ''}`}>
                          {s.status === 'done' ? '✓' : s.step_order}
                        </div>
                        {i < timeline.length - 1 && <div className={`step-line ${s.status === 'done' ? 'done' : ''}`} />}
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                    {timeline.map((s: any) => (
                      <div key={s.id} style={{ fontSize: '.65rem', color: s.status !== 'pending' ? 'var(--gold)' : 'var(--text-muted)', textAlign: 'center', flex: 1 }}>
                        {s.step_name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}

      {/* Detail Modal */}
      {showModal && selected && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selected.kazu_number} — {selected.titulo}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-row" style={{ marginBottom: '16px' }}>
                <div><div className="form-label">Tipu</div><div style={{ fontSize: '.9rem' }}>{selected.tipo}</div></div>
                <div><div className="form-label">Estatutu</div><span className={statusBadgeClass(selected.status)}>{selected.status}</span></div>
              </div>
              <div style={{ marginBottom: '16px' }}><div className="form-label">Deskrisaun</div><p style={{ fontSize: '.9rem', lineHeight: 1.6, marginTop: '6px' }}>{selected.description || 'La iha deskrisaun'}</p></div>
              <div><div className="form-label">Progresu</div>
                <div className="progress-bar" style={{ marginTop: '8px' }}><div className="progress-fill" style={{ width: `${selected.progress}%` }} /></div>
                <div style={{ fontSize: '.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>{selected.progress}% kompletu</div>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <a href="/portal/chat" className="btn btn-gold btn-sm">💬 Chat</a>
                <a href="/portal/dokumentu" className="btn btn-ghost btn-sm">📄 Dokumentu</a>
                <a href="/portal/nota" className="btn btn-ghost btn-sm">📝 Nota</a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Kazu Modal */}
      {showNew && (
        <div className="modal-overlay" onClick={() => setShowNew(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Kazu Foun</h3>
              <button className="modal-close" onClick={() => setShowNew(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group"><label className="form-label">Titulo Kazu</label>
                <input className="form-input" value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} placeholder="Deskreve asuntu kazu..." /></div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Tipu</label>
                  <select className="form-select" value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })}>
                    {['Litigasaun','Propriedade/Rai','Hukum Traballu','Hukum Família','Hukum Negósiu','Mediasaun','Arbitrájin','Outro'].map(t => <option key={t}>{t}</option>)}
                  </select></div>
                <div className="form-group"><label className="form-label">Urgénsia</label>
                  <select className="form-select" value={form.urgency} onChange={e => setForm({ ...form, urgency: e.target.value })}>
                    <option value="normal">Normal</option><option value="urjente">Urjente</option><option value="kritiku">Kítiku</option>
                  </select></div>
              </div>
              <div className="form-group"><label className="form-label">Deskrisaun</label>
                <textarea className="form-textarea" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Deskreve situasaun jurídiku ita-nian..." /></div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowNew(false)}>Kansela</button>
              <button className="btn btn-gold" onClick={createKazu} disabled={saving}>{saving ? 'A grava...' : '+ Kria Kazu'}</button>
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  )
}
