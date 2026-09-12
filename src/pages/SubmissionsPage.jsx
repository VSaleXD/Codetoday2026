import { CheckCircle2, Clock3, LoaderCircle, XCircle } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { submissions } from '../services/api'

function SubmissionsPage() {
  const { cid = 'demo' } = useParams()
  const query = useQuery({ queryKey: ['submissions', cid], queryFn: async () => (await submissions.list(cid)).data, refetchInterval: 5000 })
  const items = Array.isArray(query.data) ? query.data : query.data?.value || []
  return <main className="listing-page"><div className="listing-heading"><span className="tlx-eyebrow">CONTEST / {cid}</span><h1>Submissions</h1><p>Riwayat submission dan status penjurian Anda.</p></div>{query.isLoading && <div className="page-state"><LoaderCircle className="spin" /> Memuat submission...</div>}{query.isError && <div className="page-state error-state">Riwayat submission tidak dapat diakses. Login sebagai akun team diperlukan.</div>}{!query.isLoading && !query.isError && items.length === 0 && <div className="page-state">Belum ada submission.</div>}{items.length > 0 && <div className="submission-table"><div className="submission-row submission-head"><span>ID</span><span>Problem</span><span>Language</span><span>Verdict</span></div>{items.map((item) => { const verdict = item.judgement?.judgement_type_id || item.verdict || 'PENDING'; const accepted = verdict === 'CORRECT' || verdict === 'ACCEPTED'; return <div className="submission-row" key={item.id}><span>#{item.id}</span><span>{item.problem_id || item.problem || '-'}</span><span>{item.language_id || item.language || '-'}</span><span className={accepted ? 'submission-accepted' : 'submission-pending'}>{accepted ? <CheckCircle2 size={15} /> : verdict === 'PENDING' ? <Clock3 size={15} /> : <XCircle size={15} />}{verdict}</span></div>})}</div>}</main>
}

export default SubmissionsPage