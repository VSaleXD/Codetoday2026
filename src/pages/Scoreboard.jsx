import { useQuery } from '@tanstack/react-query'
import { AlertCircle, LoaderCircle } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { scoreboard as scoreboardApi } from '../services/api'

const fallbackRows = [
  { rank: 1, name: 'Rubikun', total: 7, penalty: 574, cells: [['ac', 1, 3], ['ac', 3, 33], ['ac', 2, 113], ['ac', 1, 37], ['ac', 1, 44], ['ac', 3, 136], ['ac', 2, 148]] },
  { rank: 2, name: 'hos.lyric', total: 6, penalty: 251, cells: [['ac', 1, 12], ['ac', 3, 39], ['wa', 3, 0], ['ac', 1, 23], ['ac', 2, 16], ['ac', 1, 56], ['ac', 1, 75]] },
  { rank: 3, name: 'sunflowers', total: 6, penalty: 334, cells: [['ac', 1, 3], ['ac', 1, 14], ['idle', 0, 0], ['ac', 1, 32], ['ac', 2, 67], ['ac', 1, 83], ['ac', 1, 125]] },
  { rank: 4, name: 'NickqW', total: 5, penalty: 249, cells: [['ac', 1, 5], ['ac', 1, 24], ['idle', 0, 0], ['ac', 1, 49], ['ac', 2, 71], ['ac', 1, 90], ['idle', 0, 0]] },
  { rank: 5, name: 'FaustaAD', total: 5, penalty: 268, cells: [['ac', 1, 8], ['ac', 1, 48], ['idle', 0, 0], ['ac', 1, 22], ['ac', 1, 71], ['idle', 0, 0], ['ac', 1, 123]] },
]

function mapScoreboard(data) {
  const rows = data?.rows || data?.scoreboard || data?.teams
  if (!Array.isArray(rows)) return fallbackRows
  return rows.map((row, index) => ({ rank: row.rank || index + 1, name: row.team_name || row.name || row.username || 'Unknown', total: row.num_solved || row.solved || 0, penalty: row.total_penalty || row.penalty || 0, cells: row.problems || [] }))
}

function ScoreCell({ cell }) {
  const [status, attempts, minutes] = Array.isArray(cell) ? cell : [cell?.status || 'idle', cell?.attempts || 0, cell?.minutes || 0]
  return <td className={`score-cell ${status}`}><strong>{attempts || '-'}</strong>{attempts > 0 && <small>{minutes}</small>}</td>
}

function Scoreboard() {
  const { cid = '1' } = useParams()
  const query = useQuery({ queryKey: ['scoreboard', cid], queryFn: async () => (await scoreboardApi.detail(cid)).data, refetchInterval: 3000 })
  const rows = mapScoreboard(query.data)
  const problemLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G']

  return <main className="scoreboard-page">
    <div className="contest-page-heading"><div><span className="tlx-eyebrow">COMPFEST 18 PRELIMINARY MIRROR (RATED)</span><h1>Scoreboard</h1></div><span className="last-updated">{query.isFetching ? 'updating...' : 'last updated just now'}</span></div>
    {query.isError && <div className="scoreboard-note"><AlertCircle size={16} /> API scoreboard tidak tersedia, menampilkan data preview.</div>}
    <section className="scoreboard-card"><div className="scoreboard-card-heading"><h2>Scoreboard</h2><span>ICPC style ranking</span></div><div className="table-scroll"><table className="scoreboard-table"><thead><tr><th>#</th><th>Contestant</th><th>Total</th>{problemLabels.map((label) => <th key={label}>{label}</th>)}</tr></thead><tbody>{rows.map((row) => <tr key={`${row.rank}-${row.name}`}><td className="rank-cell">{row.rank}</td><td className="contestant-cell">{row.name}</td><td className="total-cell"><strong>{row.total}</strong><small>{row.penalty}</small></td>{problemLabels.map((_, index) => <ScoreCell key={index} cell={row.cells[index] || ['idle', 0, 0]} />)}</tr>)}</tbody></table></div></section>
  </main>
}

export default Scoreboard