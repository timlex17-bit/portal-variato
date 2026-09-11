'use client'
import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { usePortal } from '@/hooks/usePortal'
import PortalLayout from '@/components/layout/PortalLayout'
import { formatDate, formatFileSize } from '@/lib/utils'

export default function DokumentuPage() {
  const { user, profile, loading } = usePortal()
  const [docs, setDocs] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => { if (user) loadDocs() }, [user])

  async function loadDocs() {
    const supabase = createClient()
    const { data } = await supabase.from('dokumentu').select('*, kazu(kazu_number, titulo)').order('created_at', { ascending: false })
    setDocs(data || [])
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setUploading(true)
    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const path = `${user.id}/general/${Date.now()}.${ext}`
    const { error: upErr } = await supabase.storage.from('dokumentu').upload(path, file)
    if (!upErr) {
      await supabase.from('dokumentu').insert({ uploaded_by: user.id, file_name: file.name, file_type: ext?.toUpperCase() || 'FILE', file_size: file.size, storage_path: path })
      await supabase.from('audit_log').insert({ profile_id: user.id, action: 'upload', entity_type: 'dokumentu', description: `Karregadu: ${file.name}` })
      loadDocs()
    }
    setUploading(false)
  }

  async function downloadDoc(doc: any) {
    const supabase = createClient()
    const { data } = await supabase.storage.from('dokumentu').createSignedUrl(doc.storage_path, 60)
    if (data?.signedUrl) window.open(data.signedUrl, '_blank')
  }

  if (loading || !profile) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⚖ A karrega...</div>

  const typeIcon: Record<string, string> = { PDF: '📄', DOCX: '📝', DOC: '📝', JPG: '🖼', JPEG: '🖼', PNG: '🖼', default: '📎' }

  return (
    <PortalLayout title="Dokumentu" userName={profile.full_name} userRole={profile.role} isAdmin={profile.role === 'advogadu'}>
      <div style={{ marginBottom: '20px' }}>
        <button className="btn btn-gold" onClick={() => fileRef.current?.click()} disabled={uploading}>
          {uploading ? '⏳ A karrega...' : '📎 Karrega Dokumentu'}
        </button>
        <input ref={fileRef} type="file" style={{ display: 'none' }} onChange={handleUpload} accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" />
      </div>
      <div className="card">
        <div className="card-title">Dokumentu Hotu-hotu ({docs.length})</div>
        {docs.length === 0
          ? <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>Laiha dokumentu seidauk. Karrega dokumentu dahuluk.</p>
          : <table className="tbl">
            <thead><tr><th>Naran</th><th>Tipu</th><th>Tamañu</th><th>Kazu</th><th>Data</th><th>Aksaun</th></tr></thead>
            <tbody>
              {docs.map((d: any) => (
                <tr key={d.id}>
                  <td>{typeIcon[d.file_type] || typeIcon.default} {d.file_name}</td>
                  <td><span className="badge badge-pendente">{d.file_type}</span></td>
                  <td style={{ color: 'var(--text-muted)' }}>{d.file_size ? formatFileSize(d.file_size) : '—'}</td>
                  <td style={{ color: 'var(--gold)', fontSize: '.8rem' }}>{d.kazu?.kazu_number || '—'}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{formatDate(d.created_at)}</td>
                  <td>
                    <button className="btn btn-xs btn-ghost" onClick={() => downloadDoc(d)}>⬇ Foti</button>
                    {d.is_signed && <span className="badge badge-pagu" style={{ marginLeft: '6px' }}>✓ Asinadu</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>}
      </div>
    </PortalLayout>
  )
}
