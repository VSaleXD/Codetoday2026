import Editor from '@monaco-editor/react'
import { AlertCircle, CheckCircle2, ChevronLeft, Clock3, Code2, LoaderCircle, MemoryStick, Send, XCircle } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { problems, submissions } from '../services/api'

const languageConfig = {
  cpp: { label: 'C++17', monaco: 'cpp', fileName: 'main.cpp', defaultCode: '#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    return 0;\n}' },
  python: { label: 'Python 3', monaco: 'python', fileName: 'main.py', defaultCode: 'def solve():\n    pass\n\nif __name__ == "__main__":\n    solve()' },
  java: { label: 'Java 17', monaco: 'java', fileName: 'Main.java', defaultCode: 'public class Main {\n    public static void main(String[] args) {\n    }\n}' },
}

const verdictStyles = {
  accepted: { label: 'Accepted', className: 'accepted', icon: CheckCircle2 },
  wrong_answer: { label: 'Wrong Answer', className: 'wrong', icon: XCircle },
  time_limit: { label: 'Time Limit Exceeded', className: 'wrong', icon: Clock3 },
  runtime_error: { label: 'Runtime Error', className: 'wrong', icon: AlertCircle },
}

function normalizeStatement(statement = '') {
  return statement.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/ on\w+="[^"]*"/gi, '')
}

function ProblemDetail() {
  const { cid = '1', problemId = 'A' } = useParams()
  const queryClient = useQueryClient()
  const [language, setLanguage] = useState('cpp')
  const [code, setCode] = useState(languageConfig.cpp.defaultCode)
  const [submissionId, setSubmissionId] = useState(null)
  const [submitError, setSubmitError] = useState('')

  const problemQuery = useQuery({
    queryKey: ['problem', cid, problemId],
    queryFn: async () => (await problems.detail(cid, problemId)).data,
  })

  const submissionQuery = useQuery({
    queryKey: ['submission', cid, submissionId],
    queryFn: async () => (await submissions.detail(cid, submissionId)).data,
    enabled: Boolean(submissionId),
    refetchInterval: (query) => {
      const status = String(query.state.data?.judgement?.verdict || query.state.data?.verdict || '').toLowerCase()
      return submissionId && !['accepted', 'wrong_answer', 'time_limit', 'runtime_error', 'compile_error', 'memory_limit'].includes(status) ? 3000 : false
    },
  })

  const submitMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData()
      formData.append('problem', problemId)
      formData.append('language', language)
      formData.append('code', new File([code], languageConfig[language].fileName, { type: 'text/plain' }))
      return (await submissions.create(cid, formData)).data
    },
    onSuccess: (data) => {
      setSubmitError('')
      setSubmissionId(data.id || data.submission_id)
      queryClient.invalidateQueries({ queryKey: ['submissions', cid] })
    },
    onError: (error) => setSubmitError(error.response?.data?.message || 'Tidak dapat mengirim solusi. Periksa koneksi API dan kredensial DOMjudge.'),
  })

  useEffect(() => {
    setCode(languageConfig[language].defaultCode)
  }, [language])

  const currentStatus = submissionQuery.data?.judgement?.verdict || submissionQuery.data?.verdict || (submitMutation.isPending ? 'pending' : '')
  const verdict = verdictStyles[String(currentStatus).toLowerCase()]
  const statement = problemQuery.data?.statement || problemQuery.data?.body || '<p>Deskripsi soal belum tersedia.</p>'
  const samples = problemQuery.data?.samples || []
  const title = problemQuery.data?.name || problemQuery.data?.label || `Problem ${problemId}`
  const limits = useMemo(() => ({ time: problemQuery.data?.time_limit || '1 s', memory: problemQuery.data?.memory_limit || '512 MB' }), [problemQuery.data])

  return (
    <main className="workspace-page">
      <div className="page-heading">
        <Link className="back-link" to="/contests"><ChevronLeft size={16} /> Semua kontes</Link>
        <div><span className="eyebrow">Contest #{cid} / Problem {problemId}</span><h1>{title}</h1></div>
      </div>
      <div className="workspace-grid">
        <article className="problem-panel">
          {problemQuery.isLoading && <div className="empty-state"><LoaderCircle className="spin" /> Memuat deskripsi soal...</div>}
          {problemQuery.isError && <div className="error-state"><AlertCircle /> Gagal memuat soal. Pastikan endpoint DOMjudge dapat diakses.</div>}
          {!problemQuery.isLoading && !problemQuery.isError && <>
            <div className="limit-row"><span><Clock3 size={16} /> {limits.time}</span><span><MemoryStick size={16} /> {limits.memory}</span></div>
            <section className="statement" dangerouslySetInnerHTML={{ __html: normalizeStatement(statement) }} />
            {samples.length > 0 && <section className="samples"><h2>Sample Case</h2>{samples.map((sample, index) => <div className="sample" key={index}><strong>Sample {index + 1}</strong><pre>{sample.input || sample.in}</pre><pre>{sample.output || sample.out}</pre></div>)}</section>}
          </>}
        </article>
        <section className="editor-panel">
          <div className="editor-toolbar"><div className="editor-title"><Code2 size={17} /> Solution</div><select value={language} onChange={(event) => setLanguage(event.target.value)} aria-label="Bahasa pemrograman">{Object.entries(languageConfig).map(([key, item]) => <option key={key} value={key}>{item.label}</option>)}</select></div>
          <div className="editor-wrap"><Editor height="100%" theme="vs-dark" language={languageConfig[language].monaco} value={code} onChange={(value) => setCode(value || '')} options={{ minimap: { enabled: false }, fontSize: 14, padding: { top: 16 }, automaticLayout: true, tabSize: 4 }} /></div>
          <div className="submit-row"><span className="file-label">{languageConfig[language].fileName}</span><button className="submit-button" type="button" disabled={submitMutation.isPending || problemQuery.isLoading} onClick={() => submitMutation.mutate()}><Send size={16} /> {submitMutation.isPending ? 'Mengirim...' : 'Submit Solution'}</button></div>
          {submitError && <div className="inline-error"><AlertCircle size={16} /> {submitError}</div>}
          {submissionId && <div className="result-panel"><div><span className="eyebrow">Submission #{submissionId}</span><strong>{submissionQuery.isFetching && !verdict ? 'Menunggu juri...' : 'Judge result'}</strong></div>{verdict ? <span className={`verdict ${verdict.className}`}>{<verdict.icon size={16} />} {verdict.label}</span> : <LoaderCircle className="spin" size={18} />}</div>}
        </section>
      </div>
    </main>
  )
}

export default ProblemDetail