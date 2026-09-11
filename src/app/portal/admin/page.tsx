'use client'
import { usePortal } from '@/hooks/usePortal'
import PortalLayout from '@/components/layout/PortalLayout'

export default function Page() {
  const { profile, loading } = usePortal()
  if (loading || !profile) return <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}>⚖ A karrega...</div>
  return (
    <PortalLayout title="Admin" userName={profile.full_name} userRole={profile.role} isAdmin={profile.role==='advogadu'}>
      <div className="card" style={{textAlign:'center',padding:'60px',color:'var(--text-muted)'}}>
        <div style={{fontSize:'3rem',marginBottom:'16px'}}>🚧</div>
        <h3 style={{fontFamily:'Playfair Display,serif',marginBottom:'8px'}}>Admin</h3>
        <p>Pájina ida-ne'e sei harii. Tuir mai!</p>
      </div>
    </PortalLayout>
  )
}
