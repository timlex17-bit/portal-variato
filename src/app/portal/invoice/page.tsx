'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { usePortal } from '@/hooks/usePortal'
import PortalLayout from '@/components/layout/PortalLayout'
import { formatCurrency, formatDate, statusBadgeClass } from '@/lib/utils'

export default function InvoicePage() {
  const { user, profile, loading } = usePortal()
  const [invoices, setInvoices] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)

  useEffect(() => { if (user) loadInvoices() }, [user])

  async function loadInvoices() {
    const supabase = createClient()
    const { data } = await supabase.from('invoice').select('*, kazu(kazu_number, titulo)').order('created_at', { ascending: false })
    setInvoices(data || [])
  }

  async function markPaid(id: string) {
    const supabase = createClient()
    await supabase.from('invoice').update({ status: 'pagu', paid_at: new Date().toISOString() }).eq('id', id)
    await supabase.from('audit_log').insert({ profile_id: user.id, action: 'payment', entity_type: 'invoice', description: `Fatura pagu` })
    loadInvoices()
    setSelected(null)
  }

  if (loading || !profile) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⚖ A karrega...</div>

  return (
    <PortalLayout title="Fatura & Pagamentu" userName={profile.full_name} userRole={profile.role} isAdmin={profile.role === 'advogadu'}>
      <div className="grid-2">
        <div className="card">
          <div className="card-title">Fatura Hotu-hotu</div>
          <table className="tbl">
            <thead><tr><th>No.</th><th>Kazu</th><th>Total</th><th>Estatutu</th><th>Vensimentu</th></tr></thead>
            <tbody>
              {invoices.length === 0
                ? <tr><td colSpan={5} style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>Laiha fatura</td></tr>
                : invoices.map((inv: any) => (
                  <tr key={inv.id} style={{ cursor: 'pointer' }} onClick={() => setSelected(inv)}>
                    <td style={{ color: 'var(--gold)', fontWeight: 600 }}>{inv.invoice_number}</td>
                    <td style={{ fontSize: '.8rem' }}>{inv.kazu?.kazu_number || '—'}</td>
                    <td style={{ fontWeight: 600 }}>{formatCurrency(inv.total)}</td>
                    <td><span className={statusBadgeClass(inv.status)}>{inv.status}</span></td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '.8rem' }}>{inv.due_date ? formatDate(inv.due_date) : '—'}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {selected ? (
          <div className="card">
            <div className="card-title">
              {selected.invoice_number}
              <button className="btn btn-xs btn-ghost" onClick={() => setSelected(null)}>×</button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div><div style={{ fontSize: '.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>KAZU</div><div style={{ fontWeight: 600 }}>{selected.kazu?.titulo || '—'}</div></div>
              <div style={{ textAlign: 'right' }}><div style={{ fontSize: '.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>TOTAL</div>
                <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', color: 'var(--gold)', fontWeight: 700 }}>{formatCurrency(selected.total)}</div>
              </div>
            </div>
            <div style={{ padding: '12px', background: 'var(--surface)', borderRadius: '8px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.875rem', padding: '6px 0' }}><span>Subtotal</span><span>{formatCurrency(selected.subtotal)}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.875rem', padding: '6px 0', color: 'var(--text-muted)' }}><span>Impostu (0%)</span><span>$0.00</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, padding: '10px 0 0', borderTop: '2px solid var(--navy)', marginTop: '6px' }}><span>Total</span><span>{formatCurrency(selected.total)}</span></div>
            </div>
            <span className={statusBadgeClass(selected.status)} style={{ marginBottom: '16px', display: 'inline-flex' }}>{selected.status}</span>
            {selected.status === 'pendente' && (
              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button className="btn btn-gold" onClick={() => markPaid(selected.id)}>✓ Marka hanesan Pagu</button>
                <button className="btn btn-ghost" onClick={() => window.print()}>🖨 Sena</button>
              </div>
            )}
          </div>
        ) : (
          <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', minHeight: '200px' }}>
            Klik fatura atu haree detalhe
          </div>
        )}
      </div>
    </PortalLayout>
  )
}
