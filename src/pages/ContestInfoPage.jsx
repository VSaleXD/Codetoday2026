import { Bell, FileText } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { contests } from '../services/api'

function ContestInfoPage({ type }) {
  const { cid = 'demo' } = useParams()
  const query = useQuery({ queryKey: ['contest', cid], queryFn: async () => (await contests.detail(cid)).data })
  const isAnnouncements = type === 'announcements'
  return <main className="listing-page"><div className="listing-heading"><span className="tlx-eyebrow">CONTEST / {cid}</span><h1>{isAnnouncements ? 'Announcements' : 'Editorial'}</h1><p>{isAnnouncements ? 'Pengumuman dan informasi resmi dari penyelenggara.' : 'Pembahasan dan solusi resmi soal kontes.'}</p></div><section className="feature-empty">{isAnnouncements ? <Bell size={30} /> : <FileText size={30} />}<h2>{query.data?.warning_message || (isAnnouncements ? 'Belum ada pengumuman' : 'Editorial belum dipublikasikan')}</h2><p>{query.isError ? 'Informasi kontes tidak dapat dimuat dari DOMjudge.' : isAnnouncements ? 'Belum ada pengumuman yang dikirim untuk kontes ini.' : 'Editorial tidak termasuk resource REST DOMjudge dan akan ditambahkan oleh CodeToday.'}</p></section></main>
}

export default ContestInfoPage