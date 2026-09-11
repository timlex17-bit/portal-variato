'use client'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

const navItems = [
  { section: 'Prinsipál' },
  { label: '📊 Dashboard',    href: '/portal/dashboard' },
  { label: '📁 Kazu',         href: '/portal/kazu',      badge: true },
  { label: '📄 Dokumentu',    href: '/portal/dokumentu' },
  { label: '📅 Kalender',     href: '/portal/kalender' },
  { section: 'Komunikasaun' },
  { label: '💬 Chat',         href: '/portal/chat',      badge: true },
  { label: '📹 Video Call',   href: '/portal/video-call' },
  { section: 'Finansa' },
  { label: '🧾 Fatura',       href: '/portal/invoice' },
  { label: '📤 Exporta',      href: '/portal/export' },
  { section: 'Ferramentu' },
  { label: '✍️ Surat Jurídiku', href: '/portal/surat' },
  { label: '🖊️ Tanda Tangan', href: '/portal/assinatura' },
  { label: '📝 Nota',         href: '/portal/nota' },
  { section: 'Sistema' },
  { label: '🔍 Log Aktividade', href: '/portal/audit' },
  { label: '❓ Ajuda & FAQ',  href: '/portal/ajuda' },
  { label: '👤 Perfil',       href: '/portal/perfil' },
]

interface SidebarProps {
  userName: string
  userRole: string
  isAdmin?: boolean
}

export default function Sidebar({ userName, userRole, isAdmin }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const items = isAdmin
    ? [...navItems, { label: '⚙️ Admin Panel', href: '/portal/admin' }]
    : navItems

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-title">⚖ Dr. Variato da Costa</div>
        <div className="sidebar-logo-sub">Portal Jurídiku v4</div>
      </div>
      <nav className="sidebar-nav">
        {items.map((item, i) => {
          if ('section' in item) {
            return <div key={i} className="nav-section">{item.section}</div>
          }
          const isActive = pathname === item.href
          return (
            <a key={item.href} href={item.href} className={`nav-item ${isActive ? 'active' : ''}`}>
              {item.label}
            </a>
          )
        })}
      </nav>
      <div className="sidebar-footer">
        <div className="sidebar-user-name">{userName}</div>
        <div className="sidebar-user-role">{userRole}</div>
        <button className="sidebar-logout" onClick={handleLogout}>Sai →</button>
      </div>
    </aside>
  )
}
