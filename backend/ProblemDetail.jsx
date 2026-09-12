import { useEffect, useRef, useState } from "react";
import {
  fetchProblemDetail,
  submitCode,
  fetchSubmissionStatus,
} from "../services/api";

const LANGUAGES = [
  { id: "cpp", label: "C++" },
  { id: "python3", label: "Python 3" },
  { id: "java", label: "Java" },
];

const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 60000;

export default function ProblemDetail({ contestId, problemId }) {
  const [problem, setProblem] = useState(null);
  const [statement, setStatement] = useState(null); // { mimeType, base64 }
  const [loadError, setLoadError] = useState(null);
  const [loading, setLoading] = useState(true);

  const [code, setCode] = useState("");
  const [languageId, setLanguageId] = useState(LANGUAGES[0].id);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [verdict, setVerdict] = useState(null); // "PENDING" | "AC" | "WA" | ...

  const pollTimerRef = useRef(null);
  const pollDeadlineRef = useRef(null);

  // --- Load problem statement on mount / when problemId changes ---
  useEffect(() => {
    let cancelled = false;

    async function loadProblem() {
      setLoading(true);
      setLoadError(null);
      try {
        const data = await fetchProblemDetail(contestId, problemId);
        if (cancelled) return;
        setProblem(data.problem);
        setStatement(data.statement);
      } catch (err) {
        if (!cancelled) setLoadError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProblem();
    return () => {
      cancelled = true;
    };
  }, [contestId, problemId]);

  // Clean up any pending poll timer on unmount
  useEffect(() => {
    return () => clearTimeout(pollTimerRef.current);
  }, []);

  function pollVerdict(submissionId) {
    pollDeadlineRef.current = Date.now() + POLL_TIMEOUT_MS;

    const tick = async () => {
      try {
        const data = await fetchSubmissionStatus(submissionId);
        setVerdict(data.judged ? data.verdict : "PENDING");

        if (data.judged) return; // stop polling, we have a final verdict

        if (Date.now() >= pollDeadlineRef.current) {
          setSubmitError(
            "Verdict belum keluar setelah menunggu cukup lama. Cek lagi nanti."
          );
          return;
        }
        pollTimerRef.current = setTimeout(tick, POLL_INTERVAL_MS);
      } catch (err) {
        setSubmitError(err.message);
      }
    };

    tick();
  }

  async function handleSubmit() {
    if (!code.trim()) {
      setSubmitError("Kode tidak boleh kosong.");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    setVerdict(null);
    clearTimeout(pollTimerRef.current);

    try {
      const data = await submitCode(contestId, {
        code,
        language_id: languageId,
        problem_id: problemId,
      });

      const submissionId = data.submission?.id;
      if (!submissionId) {
        throw new Error("DOMjudge tidak mengembalikan id submission.");
      }

      setVerdict("PENDING");
      pollVerdict(submissionId);
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p>Memuat soal...</p>;

  if (loadError) {
    return (
      <div role="alert" style={{ color: "#b3261e" }}>
        Gagal memuat soal: {loadError}
      </div>
    );
  }

  return (
    <div className="problem-detail">
      <h1>{problem?.name || `Soal ${problemId}`}</h1>

      {/* --- Statement rendering: HTML inline, PDF in an iframe, else fallback --- */}
      <section className="statement">
        {statement?.mimeType?.includes("html") && (
          <div
            dangerouslySetInnerHTML={{
              __html: atob(statement.base64),
            }}
          />
        )}

        {statement?.mimeType?.includes("pdf") && (
          <iframe
            title="Problem statement"
            src={`data:application/pdf;base64,${statement.base64}`}
            style={{ width: "100%", height: "600px", border: "1px solid #ddd" }}
          />
        )}

        {!statement && <p>Statement belum tersedia untuk soal ini.</p>}
      </section>

      {/* --- Submit form --- */}
      <section className="submit-form">
        <h2>Submit Code</h2>

        <label htmlFor="language-select">Bahasa</label>
        <select
          id="language-select"
          value={languageId}
          onChange={(e) => setLanguageId(e.target.value)}
          disabled={submitting}
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.id} value={lang.id}>
              {lang.label}
            </option>
          ))}
        </select>

        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Tulis atau tempel kode Anda di sini..."
          rows={16}
          disabled={submitting}
          style={{ width: "100%", fontFamily: "monospace" }}
        />

        <button onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Mengirim..." : "Submit"}
        </button>

        {submitError && (
          <p role="alert" style={{ color: "#b3261e" }}>
            {submitError}
          </p>
        )}

        {verdict && (
          <p className={`verdict verdict-${verdict.toLowerCase()}`}>
            Status: <strong>{verdict}</strong>
            {verdict === "PENDING" && " (menunggu hasil juri...)"}
          </p>
        )}
      </section>
    </div>
  );
}
