'use client'
import { useState } from 'react'
import { usePortal } from '@/hooks/usePortal'
import PortalLayout from '@/components/layout/PortalLayout'

const FAQS = [
  { q: 'Oinsá hau kria kazu foun?', a: 'Ba pájina Kazu → klik "+ Kazu Foun" → preenche formuláriu → klik "Kria Kazu".' },
  { q: 'Oinsá hau karrega dokumentu?', a: 'Ba pájina Dokumentu → klik "Karrega Dokumentu" → seleksiona file (PDF, DOCX, JPG, PNG, máx 10MB).' },
  { q: 'Oinsá hau komunika ho advogadu?', a: 'Uza pájina Chat ba mensagem instante, ka Video Call ba konsultasaun virtual.' },
  { q: 'Oinsá hau paga fatura?', a: 'Ba pájina Fatura → seleksiona fatura → klik "Marka hanesan Pagu" depois transferénsia banku.' },
  { q: 'Oinsá hau ativa 2FA?', a: 'Ba Perfil → Seguransa → ativa toggle "Autentikasaun 2FA".' },
  { q: 'Oinsá hau foti relatóriu?', a: 'Ba pájina Exporta → seleksiona tipu (CSV, PDF, Excel) → klik ba narak.' },
]

export default function AjudaPage() {
  const { profile, loading } = usePortal()
  const [open, setOpen] = useState<number | null>(null)
  const [question, setQuestion] = useState('')
  const [sent, setSent] = useState(false)

  if (loading || !profile) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⚖ A karrega...</div>

  return (
    <PortalLayout title="Ajuda & FAQ" userName={profile.full_name} userRole={profile.role} isAdmin={profile.role === 'advogadu'}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: '16px', marginBottom: '28px' }}>
        {[{i:'📁',t:'Jestaun Kazu',d:'Kria no monitoriza kazu'},{i:'📄',t:'Upload Dokumentu',d:'Tipu no tamañu file'},{i:'💳',t:'Pagamentu',d:'Métodu no prosesu'},{i:'🔐',t:'Seguransa 2FA',d:'Proteje ita-nia konta'},{i:'📹',t:'Video Call',d:'Konsultasaun virtual'},{i:'✍️',t:'Tanda Tangan',d:'Asina dijitalmente'}].map(h => (
          <div key={h.t} style={{ background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '20px', cursor: 'pointer', transition: 'all var(--transition)' }}>
            <div style={{ fontSize: '1.4rem', marginBottom: '10px' }}>{h.i}</div>
            <h4 style={{ fontWeight: 600, fontSize: '.9rem', marginBottom: '4px' }}>{h.t}</h4>
            <p style={{ fontSize: '.8rem', color: 'var(--text-muted)' }}>{h.d}</p>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-title">Perguntas Frequente</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {FAQS.map((faq, i) => (
            <div key={i} style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
              <button onClick={() => setOpen(open === i ? null : i)} style={{ width: '100%', textAlign: 'left', padding: '14px 18px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'Inter, sans-serif', fontSize: '.9rem', fontWeight: 500 }}>
                {faq.q}
                <span style={{ color: 'var(--gold)', fontWeight: 700, fontSize: '1.1rem', transform: open === i ? 'rotate(45deg)' : 'none', transition: 'transform .2s' }}>+</span>
              </button>
              {open === i && <div style={{ padding: '0 18px 14px', fontSize: '.875rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>{faq.a}</div>}
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-title">Haruka Pergunta</div>
        {sent ? <div style={{ textAlign: 'center', padding: '20px', color: 'var(--success)' }}>✓ Pergunta harukadu! Ita sei simu resposta iha 24 oras.</div>
          : <>
            <div className="form-group"><label className="form-label">Pergunta Ita</label><textarea className="form-textarea" value={question} onChange={e => setQuestion(e.target.value)} placeholder="Hakerek pergunta ita iha ne'e..." /></div>
            <button className="btn btn-gold btn-sm" onClick={() => { if (question) setSent(true) }}>📧 Haruka ba Suporte</button>
          </>}
      </div>
    </PortalLayout>
  )
}
