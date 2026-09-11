'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { usePortal } from '@/hooks/usePortal'
import PortalLayout from '@/components/layout/PortalLayout'

const MONTHS = ['Janeiro','Fevereiro','Marsu','Abril','Maiu','Juñu','Jullu','Agostu','Setembru','Outubru','Novembru','Dezembru']
const DAYS = ['Dom','Seg','Ter','Kua','Kin','Sex','Sab']
const TIPO_ICON: Record<string,string> = { audiensia:'⚖', konsultasaun:'💬', video_call:'📹', mediasaun:'🤝', deadline:'⏰', outro:'📅' }

export default function KalenderPage() {
  const { user, profile, loading } = usePortal()
  const [events, setEvents] = useState<any[]>([])
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth())

  useEffect(() => { if (user) { const supabase = createClient(); supabase.from('eventu').select('*, kazu(kazu_number)').order('start_time').then(({ data }) => setEvents(data || [])) } }, [user])

  function nav(d: number) { let m = month + d, y = year; if (m > 11) { m = 0; y++ } if (m < 0) { m = 11; y-- } setMonth(m); setYear(y) }

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date()
  const monthEvents = events.filter(e => { const d = new Date(e.start_time); return d.getFullYear() === year && d.getMonth() === month })

  if (loading || !profile) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⚖ A karrega...</div>

  return (
    <PortalLayout title="Kalender" userName={profile.full_name} userRole={profile.role} isAdmin={profile.role === 'advogadu'}>
      <div className="grid-2">
        <div className="card">
          <div className="card-title">
            <button className="btn btn-ghost btn-xs" onClick={() => nav(-1)}>‹</button>
            {MONTHS[month]} {year}
            <button className="btn btn-ghost btn-xs" onClick={() => nav(1)}>›</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '4px' }}>
            {DAYS.map(d => <div key={d} style={{ textAlign: 'center', fontSize: '.72rem', fontWeight: 600, color: 'var(--text-muted)', padding: '8px 0' }}>{d}</div>)}
            {Array(firstDay).fill(null).map((_, i) => <div key={`e${i}`} />)}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1
              const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
              const hasEv = monthEvents.some(e => new Date(e.start_time).getDate() === day)
              return (
                <div key={day} style={{ textAlign: 'center', padding: '8px 4px', borderRadius: '6px', fontSize: '.82rem', cursor: 'pointer', background: isToday ? 'var(--gold)' : hasEv ? 'rgba(201,168,76,0.12)' : 'transparent', color: isToday ? 'var(--navy)' : 'var(--text)', fontWeight: isToday ? 700 : 400 }}>
                  {day}{hasEv && !isToday && <div style={{ fontSize: '.5rem', color: 'var(--gold)' }}>●</div>}
                </div>
              )
            })}
          </div>
        </div>
        <div className="card">
          <div className="card-title">Eventu {MONTHS[month]}</div>
          {monthEvents.length === 0
            ? <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>Laiha eventu fulan ida-ne'e</p>
            : monthEvents.map(e => (
              <div key={e.id} className="audit-item">
                <div className="audit-icon" style={{ background: 'rgba(201,168,76,0.12)', fontSize: '1rem' }}>{TIPO_ICON[e.tipo] || TIPO_ICON.outro}</div>
                <div className="audit-text">
                  <strong>{e.titulo}</strong>
                  <p>{e.kazu?.kazu_number || ''}{e.location ? ` — ${e.location}` : e.is_online ? ' — Online' : ''}</p>
                </div>
                <div className="audit-time">{new Date(e.start_time).getDate()} {MONTHS[new Date(e.start_time).getMonth()].substring(0,3)}</div>
              </div>
            ))}
        </div>
      </div>
    </PortalLayout>
  )
}
