import { CircleUserRound, Menu, Moon, Sun, X } from 'lucide-react'
import { useState } from 'react'
import { NavLink } from 'react-router-dom'

function Navbar({ isOnline = true, theme, onToggleTheme }) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="topbar">
      <NavLink className="brand" to="/contests/1">
        <img src="/LogoCodeToday.png" alt="CodeToday" className="brand-logo" />
        <span className="brand-copy"><strong>CodeToday</strong></span>
      </NavLink>
      <button className="icon-button mobile-menu" type="button" aria-label="Buka menu" onClick={() => setMenuOpen(!menuOpen)}>
        {menuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
      <nav className={menuOpen ? 'nav-links open' : 'nav-links'}>
        <NavLink to="/contests/1">Home</NavLink>
        <NavLink to="/contests">Contests</NavLink>
        <NavLink to="/courses">Courses</NavLink>
        <NavLink to="/contests/1/problems">Problems</NavLink>
        <NavLink to="/submissions">Submissions</NavLink>
        <NavLink to="/ranking">Ranking</NavLink>
      </nav>
      <div className="nav-actions">
        <button className="icon-button" type="button" aria-label="Ganti tema" onClick={onToggleTheme}>
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>
        <button className="profile-button" type="button"><CircleUserRound size={29} /><span>VSaleXS</span></button>
      </div>
    </header>
  )
}

export default Navbar