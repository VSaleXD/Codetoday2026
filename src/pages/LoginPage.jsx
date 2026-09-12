import { ExternalLink, LogOut, ShieldAlert } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { auth } from '../services/api'

function LoginPage() {
  const navigate = useNavigate()
  const [confirmed, setConfirmed] = useState(false)
  const confirmLogin = () => {
    localStorage.setItem('codetoday-team-login', 'true')
    setConfirmed(true)
    navigate('/contests/demo')
  }

  return <main className="auth-page"><section className="auth-card"><ShieldAlert size={32} className="auth-icon" /><span className="tlx-eyebrow">DOMJUDGE AUTHENTICATION</span><h1>Login peserta</h1><p>Login dibuka di tab baru. Setelah berhasil, kembali ke tab CodeToday ini untuk melanjutkan.</p><div className="auth-steps"><strong>Pastikan akun memiliki role ROLE_TEAM:</strong><span>1. Logout dari session DOMjudge saat ini.</span><span>2. Login memakai akun team/peserta.</span><span>3. Kembali ke tab CodeToday.</span></div><div className="auth-actions"><a className="primary-link" href={auth.logoutUrl} target="_blank" rel="noreferrer"><LogOut size={16} /> Logout DOMjudge</a><a className="secondary-link" href={auth.teamLoginUrl} target="_blank" rel="noreferrer">Buka halaman team <ExternalLink size={16} /></a><button className="return-link" type="button" onClick={confirmLogin}>{confirmed ? 'Login dikonfirmasi' : 'Saya sudah login, kembali ke CodeToday'}</button></div></section></main>
}

export default LoginPage