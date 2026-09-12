import { BookOpen, ChevronRight, LoaderCircle } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { problems } from '../services/api'

function ProblemList() {
  const { cid = 'demo' } = useParams()
  const query = useQuery({ queryKey: ['problems', cid], queryFn: async () => (await problems.list(cid)).data })
  const items = Array.isArray(query.data) ? query.data : query.data?.value || []
  return <main className="listing-page"><div className="listing-heading"><span className="tlx-eyebrow">CONTEST / {cid}</span><h1>Problems</h1><p>Daftar soal yang tersedia untuk kontes ini.</p></div>{query.isLoading && <div className="page-state"><LoaderCircle className="spin" /> Memuat soal...</div>}{query.isError && <div className="page-state error-state">Gagal mengambil daftar soal.</div>}<div className="problem-list">{items.map((problem) => <Link className="problem-list-item" key={problem.id} to={`/contests/${cid}/problems/${problem.label || problem.short_name}`}><span className="problem-label">{problem.label || problem.short_name}</span><span><strong>{problem.name}</strong><small>{problem.time_limit}s time limit</small></span><ChevronRight size={18} /></Link>)}</div></main>
}

export default ProblemList