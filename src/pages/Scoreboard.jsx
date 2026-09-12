import { useQuery } from '@tanstack/react-query'
import { AlertCircle, LoaderCircle } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { scoreboard as scoreboardApi } from '../services/api'

function mapScoreboard(data) {
  const rows = data?.rows || data?.scoreboard || data?.teams
  if (!Array.isArray(rows)) return []
  return rows.map((row, index) => ({ rank: row.rank || index + 1, name: row.team_name || row.name || row.username || 'Unknown', total: row.num_solved || row.solved || 0, penalty: row.total_penalty || row.penalty || 0, cells: row.problems || [] }))
}

function ScoreCell({ cell }) {
  const [status, attempts, minutes] = Array.isArray(cell) ? cell : [cell?.status || 'idle', cell?.attempts || 0, cell?.minutes || 0]
  return <td className={`score-cell ${status}`}><strong>{attempts || '-'}</strong>{attempts > 0 && <small>{minutes}</small>}</td>
}

function Scoreboard() {
  const { cid = 'demo' } = useParams()
  const query = useQuery({ queryKey: ['scoreboard', cid], queryFn: async () => (await scoreboardApi.detail(cid)).data, refetchInterval: 3000 })
  const rows = mapScoreboard(query.data)
  const problemLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G']

  return <main className="scoreboard-page">
    <div className="contest-page-heading"><div><span className="tlx-eyebrow">COMPFEST 18 PRELIMINARY MIRROR (RATED)</span><h1>Scoreboard</h1></div><span className="last-updated">{query.isFetching ? 'updating...' : 'last updated just now'}</span></div>
    {query.isError && <div className="scoreboard-note"><AlertCircle size={16} /> Gagal mengambil scoreboard dari DOMjudge.</div>}
    {query.isLoading && <div className="scoreboard-card scoreboard-empty"><LoaderCircle className="spin" size={18} /> Memuat scoreboard...</div>}
    {!query.isLoading && !query.isError && rows.length === 0 && <div className="scoreboard-card scoreboard-empty">Belum ada data scoreboard dari DOMjudge.</div>}
    {rows.length > 0 && <section className="scoreboard-card"><div className="scoreboard-card-heading"><h2>Scoreboard</h2><span>ICPC style ranking</span></div><div className="table-scroll"><table className="scoreboard-table"><thead><tr><th>#</th><th>Contestant</th><th>Total</th>{problemLabels.map((label) => <th key={label}>{label}</th>)}</tr></thead><tbody>{rows.map((row) => <tr key={`${row.rank}-${row.name}`}><td className="rank-cell">{row.rank}</td><td className="contestant-cell">{row.name}</td><td className="total-cell"><strong>{row.total}</strong><small>{row.penalty}</small></td>{problemLabels.map((_, index) => <ScoreCell key={index} cell={row.cells[index] || ['idle', 0, 0]} />)}</tr>)}</tbody></table></div></section>}
  </main>
}

export default Scoreboard