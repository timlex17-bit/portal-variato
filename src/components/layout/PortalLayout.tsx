import Sidebar from './Sidebar'
import Topbar from './Topbar'

interface PortalLayoutProps {
  children: React.ReactNode
  title: string
  userName: string
  userRole: string
  isAdmin?: boolean
}

export default function PortalLayout({ children, title, userName, userRole, isAdmin }: PortalLayoutProps) {
  return (
    <div className="app-layout">
      <Sidebar userName={userName} userRole={userRole} isAdmin={isAdmin} />
      <div className="main-area">
        <Topbar title={title} />
        <div className="content">{children}</div>
      </div>
    </div>
  )
}
