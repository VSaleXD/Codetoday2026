import { CalendarClock, ChevronRight, LoaderCircle } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { contests } from '../services/api'

function contestStatus(contest) {
  const now = Date.now()
  if (now < new Date(contest.start_time).getTime()) return 'Upcoming'
  if (now < new Date(contest.end_time).getTime()) return 'Running'
  return 'Ended'
}

function ContestList() {
  const query = useQuery({ queryKey: ['contests'], queryFn: async () => (await contests.list()).data })
  const items = query.data?.value || (Array.isArray(query.data) ? query.data : [])

  return <main className="listing-page"><div className="listing-heading"><div><span className="tlx-eyebrow">CODETODAY CONTESTS</span><h1>Contests</h1><p>Pilih kontes untuk mulai berlatih dan berkompetisi.</p></div></div>{query.isLoading && <div className="page-state"><LoaderCircle className="spin" /> Memuat kontes...</div>}{query.isError && <div className="page-state error-state">Gagal mengambil kontes dari DOMjudge.</div>} {!query.isLoading && !query.isError && items.length === 0 && <div className="page-state">Belum ada kontes tersedia.</div>}<div className="contest-grid">{items.map((contest) => { const status = contestStatus(contest); return <Link className="contest-card" key={contest.id} to={`/contests/${contest.id}`}><div className="contest-card-top"><span className={`status-tag ${status.toLowerCase()}`}>{status}</span><ChevronRight size={18} /></div><h2>{contest.name || contest.formal_name}</h2><p>{contest.formal_name || 'DOMjudge contest'}</p><div className="contest-card-meta"><span><CalendarClock size={15} /> {new Date(contest.start_time).toLocaleString('id-ID')}</span><strong>{contest.id}</strong></div></Link>})}</div></main>
}

export default ContestList