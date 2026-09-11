'use client'
import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { usePortal } from '@/hooks/usePortal'
import PortalLayout from '@/components/layout/PortalLayout'

export default function ChatPage() {
  const { user, profile, loading } = usePortal()
  const [messages, setMessages] = useState<any[]>([])
  const [konversaId, setKonversaId] = useState<string | null>(null)
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!user) return
    const supabase = createClient()
    supabase.from('konversa_participants').select('konversa_id').eq('profile_id', user.id).limit(1).single()
      .then(({ data }) => {
        if (data) {
          setKonversaId(data.konversa_id)
          loadMessages(data.konversa_id)
          // Subscribe realtime
          supabase.channel('chat-' + data.konversa_id)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'mensagem', filter: `konversa_id=eq.${data.konversa_id}` },
              () => loadMessages(data.konversa_id))
            .subscribe()
        }
      })
  }, [user])

  async function loadMessages(kid: string) {
    const supabase = createClient()
    const { data } = await supabase.from('mensagem').select('*, sender:profiles(full_name, role)').eq('konversa_id', kid).order('created_at')
    setMessages(data || [])
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
  }

  async function sendMessage() {
    if (!input.trim() || !konversaId || !user) return
    const supabase = createClient()
    await supabase.from('mensagem').insert({ konversa_id: konversaId, sender_id: user.id, content: input.trim() })
    setInput('')
  }

  if (loading || !profile) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⚖ A karrega...</div>

  return (
    <PortalLayout title="Chat" userName={profile.full_name} userRole={profile.role} isAdmin={profile.role === 'advogadu'}>
      <div className="card" style={{ padding: 0, display: 'flex', flexDirection: 'column', height: '70vh' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--navy)', fontWeight: 700 }}>V</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '.9rem' }}>Dr. Variato da Costa</div>
            <div style={{ fontSize: '.75rem', color: 'var(--success)' }}>● Online</div>
          </div>
        </div>
        <div className="chat-messages" style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {messages.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '40px' }}>Hahú konversa ho Dr. Variato...</p>}
          {messages.map((m: any) => {
            const isMe = m.sender_id === user?.id
            return (
              <div key={m.id} className={`chat-msg ${isMe ? 'me' : 'them'}`}>
                <div className="chat-bubble">{m.content}</div>
                <div className="chat-time">{new Date(m.created_at).toLocaleTimeString('pt-TL', { hour: '2-digit', minute: '2-digit' })}</div>
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: '10px' }}>
          <input className="form-input" value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()} placeholder="Hakerek mensagem..." style={{ margin: 0 }} />
          <button className="btn btn-gold btn-sm" onClick={sendMessage}>Haruka</button>
        </div>
      </div>
    </PortalLayout>
  )
}
