'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { usePortal } from '@/hooks/usePortal'
import PortalLayout from '@/components/layout/PortalLayout'

const COLORS = ['gold','blue','green','red']
const COLOR_BG: Record<string,string> = { gold:'rgba(201,168,76,0.15)', blue:'#DBEAFE', green:'#DCFCE7', red:'#FEE2E2' }

export default function NotaPage() {
  const { user, profile, loading } = usePortal()
  const [notas, setNotas] = useState<any[]>([])
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState({ titulo: '', content: '', color: 'gold', kazu_id: '' })
  const [kazu, setKazu] = useState<any[]>([])

  useEffect(() => {
    if (!user) return
    const supabase = createClient()
    supabase.from('nota').select('*, kazu(kazu_number)').eq('author_id', user.id).order('created_at', { ascending: false }).then(({ data }) => setNotas(data || []))
    supabase.from('kazu').select('id, kazu_number, titulo').then(({ data }) => setKazu(data || []))
  }, [user])

  async function saveNota() {
    if (!form.titulo) return
    const supabase = createClient()
    await supabase.from('nota').insert({ ...form, author_id: user.id, kazu_id: form.kazu_id || null })
    const { data } = await supabase.from('nota').select('*, kazu(kazu_number)').eq('author_id', user.id).order('created_at', { ascending: false })
    setNotas(data || [])
    setShowNew(false)
    setForm({ titulo: '', content: '', color: 'gold', kazu_id: '' })
  }

  async function deleteNota(id: string) {
    const supabase = createClient()
    await supabase.from('nota').delete().eq('id', id)
    setNotas(notas.filter(n => n.id !== id))
  }

  if (loading || !profile) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⚖ A karrega...</div>

  return (
    <PortalLayout title="Nota" userName={profile.full_name} userRole={profile.role} isAdmin={profile.role === 'advogadu'}>
      <div style={{ marginBottom: '20px' }}>
        <button className="btn btn-gold" onClick={() => setShowNew(true)}>+ Nota Foun</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: '16px' }}>
        {notas.map((n: any) => (
          <div key={n.id} style={{ background: COLOR_BG[n.color] || COLOR_BG.gold, borderRadius: 'var(--radius)', padding: '20px', position: 'relative' }}>
            <div style={{ fontWeight: 600, fontSize: '.9rem', marginBottom: '6px' }}>{n.titulo}</div>
            {n.kazu && <div style={{ fontSize: '.78rem', color: 'var(--gold)', marginBottom: '8px' }}>{n.kazu.kazu_number}</div>}
            <div style={{ fontSize: '.85rem', lineHeight: 1.6 }}>{n.content}</div>
            <button onClick={() => deleteNota(n.id)} style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1rem' }}>×</button>
          </div>
        ))}
        {notas.length === 0 && <div style={{ color: 'var(--text-muted)', gridColumn: '1/-1', textAlign: 'center', padding: '40px' }}>Laiha nota seidauk. Kria nota foun!</div>}
      </div>

      {showNew && (
        <div className="modal-overlay" onClick={() => setShowNew(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>Nota Foun</h3><button className="modal-close" onClick={() => setShowNew(false)}>×</button></div>
            <div className="modal-body">
              <div className="form-group"><label className="form-label">Titulo</label><input className="form-input" value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} placeholder="Titulo nota..." /></div>
              <div className="form-group"><label className="form-label">Kazu (Opsionál)</label>
                <select className="form-select" value={form.kazu_id} onChange={e => setForm({ ...form, kazu_id: e.target.value })}>
                  <option value="">— Nota Jerál —</option>
                  {kazu.map((k: any) => <option key={k.id} value={k.id}>{k.kazu_number} — {k.titulo}</option>)}
                </select></div>
              <div className="form-group"><label className="form-label">Kontéudu</label><textarea className="form-textarea" value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} placeholder="Hakerek nota iha ne'e..." /></div>
              <div className="form-group"><label className="form-label">Kór</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {COLORS.map(c => <div key={c} onClick={() => setForm({ ...form, color: c })} style={{ width: '28px', height: '28px', borderRadius: '50%', background: COLOR_BG[c], cursor: 'pointer', border: form.color === c ? '3px solid var(--navy)' : '3px solid transparent' }} />)}
                </div></div>
            </div>
            <div className="modal-footer"><button className="btn btn-ghost" onClick={() => setShowNew(false)}>Kansela</button><button className="btn btn-gold" onClick={saveNota}>+ Grava</button></div>
          </div>
        </div>
      )}
    </PortalLayout>
  )
}
