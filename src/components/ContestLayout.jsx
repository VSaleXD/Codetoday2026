import { Bell, BookOpen, ChevronRight, LayoutDashboard, ListOrdered, Presentation } from 'lucide-react'
import { NavLink, Outlet, useParams } from 'react-router-dom'

const menuItems = [
  { label: 'Overview', suffix: '', icon: LayoutDashboard },
  { label: 'Announcements', suffix: '/announcements', icon: Bell, badge: '1' },
  { label: 'Problems', suffix: '/problems', icon: BookOpen },
  { label: 'Editorial', suffix: '/editorial', icon: Presentation, badge: 'NEW', badgeClass: 'new' },
  { label: 'Scoreboard', suffix: '/scoreboard', icon: ListOrdered },
]

function ContestLayout() {
  const { cid = '1' } = useParams()

  return (
    <div className="contest-shell">
      <aside className="contest-sidebar">
        <div className="sidebar-title">Contest Menu</div>
        <nav className="contest-menu" aria-label="Contest navigation">
          {menuItems.map(({ label, suffix, icon: Icon, badge, badgeClass }) => (
            <NavLink key={label} end={suffix === ''} className={({ isActive }) => `contest-menu-item${isActive ? ' active' : ''}`} to={`/contests/${cid}${suffix}`}>
              <Icon size={18} /><span>{label}</span>
              {badge && <small className={`menu-badge ${badgeClass || ''}`}>{badge}</small>}
              <ChevronRight className="menu-arrow" size={17} />
            </NavLink>
          ))}
        </nav>
      </aside>
      <section className="contest-content"><Outlet /></section>
    </div>
  )
}

export default ContestLayout