// src/controllers/domjudgeController.js
//
// Business logic for proxying requests between the React frontend and the
// DOMjudge REST API. Keeping this separate from routes.js keeps the route
// file a pure "which URL maps to which handler" map.

const FormData = require("form-data");
const { domjudge, toApiError } = require("../services/domjudgeClient");

async function getContests(req, res) {
  try {
    const response = await domjudge.get("/contests");
    if (response.status >= 400) {
      const { status, body } = toApiError(response, "Gagal mengambil daftar kontes");
      return res.status(status).json(body);
    }
    return res.json(response.data);
  } catch (err) {
    console.error("[getContests]", err.message);
    return res.status(502).json({ error: true, message: "Tidak dapat terhubung ke server DOMjudge" });
  }
}

async function getContest(req, res) {
  try {
    const response = await domjudge.get(`/contests/${req.params.cid}`);
    if (response.status >= 400) {
      const { status, body } = toApiError(response, "Kontes tidak ditemukan");
      return res.status(status).json(body);
    }
    return res.json(response.data);
  } catch (err) {
    console.error("[getContest]", err.message);
    return res.status(502).json({ error: true, message: "Tidak dapat mengambil detail kontes" });
  }
}

async function getContestProblems(req, res) {
  try {
    const response = await domjudge.get(`/contests/${req.params.cid}/problems`);
    if (response.status >= 400) {
      const { status, body } = toApiError(response, "Gagal mengambil daftar soal");
      return res.status(status).json(body);
    }
    return res.json(response.data);
  } catch (err) {
    console.error("[getContestProblems]", err.message);
    return res.status(502).json({ error: true, message: "Tidak dapat mengambil daftar soal dari DOMjudge" });
  }
}

async function getSubmissions(req, res) {
  try {
    const response = await domjudge.get(`/contests/${req.params.cid}/submissions`, {
      params: req.query.user ? { user: req.query.user } : undefined,
    });
    if (response.status >= 400) {
      const { status, body } = toApiError(response, "Gagal mengambil riwayat submission");
      return res.status(status).json(body);
    }
    return res.json(response.data);
  } catch (err) {
    console.error("[getSubmissions]", err.message);
    return res.status(502).json({ error: true, message: "Tidak dapat mengambil riwayat submission dari DOMjudge" });
  }
}

async function resolveProblemId(contestId, requestedId) {
  const response = await domjudge.get(`/contests/${contestId}/problems`);
  const problems = Array.isArray(response.data) ? response.data : [];
  const problem = problems.find((item) => item.id === requestedId || item.label === requestedId || item.short_name === requestedId);
  return problem?.id || requestedId;
}

/**
 * GET /api/contests/:cid/problems/:id
 * Returns problem metadata PLUS the problem statement (HTML/PDF/plain text),
 * base64-encoded so it can travel safely inside a JSON payload.
 */
async function getProblemDetail(req, res) {
  const { cid, id } = req.params;

  try {
    const problemId = await resolveProblemId(cid, id);
    // 1. Problem metadata (name, time limit, etc.)
    const metaResponse = await domjudge.get(
      `/contests/${cid}/problems/${problemId}`
    );

    if (metaResponse.status >= 400) {
      const { status, body } = toApiError(
        metaResponse,
        "Gagal mengambil detail soal dari DOMjudge"
      );
      return res.status(status).json(body);
    }

    // 2. Problem statement — binary (pdf/html/txt), so request as a buffer.
    let statement = null;
    try {
      const statementResponse = await domjudge.get(
        `/contests/${cid}/problems/${problemId}/statement`,
        { responseType: "arraybuffer" }
      );

      if (statementResponse.status < 400) {
        const contentType =
          statementResponse.headers["content-type"] || "application/octet-stream";
        statement = {
          mimeType: contentType,
          base64: Buffer.from(statementResponse.data).toString("base64"),
        };
      }
      // If DOMjudge has no statement configured for this problem, it may
      // 404 — that's fine, we just return metadata without a statement.
    } catch (statementErr) {
      console.warn(
        `[getProblemDetail] No statement available for problem ${id}:`,
        statementErr.message
      );
    }

    return res.json({
      error: false,
      problem: metaResponse.data,
      problemId,
      statement, // { mimeType, base64 } or null
    });
  } catch (err) {
    console.error("[getProblemDetail]", err.message);
    return res.status(502).json({
      error: true,
      message: "Tidak dapat terhubung ke server DOMjudge",
    });
  }
}

/**
 * POST /api/contests/:cid/submissions
 * Body (JSON, from React): { code: string, language_id: string, problem_id: string }
 *
 * DOMjudge's own submission endpoint expects multipart/form-data with the
 * source as an actual file, so we convert the incoming code string into an
 * in-memory file and forward it.
 */
async function submitSolution(req, res) {
  const { cid } = req.params;
  const { code, language_id, problem_id } = req.body;

  if (!code || !language_id || !problem_id) {
    return res.status(400).json({
      error: true,
      message: "Field 'code', 'language_id', dan 'problem_id' wajib diisi",
    });
  }

  try {
    const problemId = await resolveProblemId(cid, problem_id);
    const form = new FormData();
    form.append("problem", problemId);
    form.append("language", language_id);

    // DOMjudge infers the filename's extension to help validate the
    // language in some configurations; a generic name is fine otherwise.
    const filename = `submission_${Date.now()}.txt`;
    form.append("code[]", Buffer.from(code, "utf-8"), {
      filename,
      contentType: "text/plain",
    });

    const response = await domjudge.post(
      `/contests/${cid}/submissions`,
      form,
      { headers: form.getHeaders() }
    );

    if (response.status >= 400) {
      const { status, body } = toApiError(
        response,
        "Gagal mengirim submission ke DOMjudge"
      );
      return res.status(status).json(body);
    }

    // DOMjudge normally responds with the new submission's id.
    return res.status(201).json({
      error: false,
      submission: response.data,
    });
  } catch (err) {
    console.error("[submitSolution]", err.message);
    return res.status(502).json({
      error: true,
      message: "Tidak dapat mengirim submission ke DOMjudge",
    });
  }
}

/**
 * GET /api/submissions/:id
 * Returns verdict/status for a single submission (AC, WA, TLE, pending, ...).
 *
 * Note: DOMjudge's public "submissions/{id}" endpoint doesn't directly
 * expose a verdict — verdicts live on the "judgements" endpoint, filtered
 * by submission id. We fetch both and merge them into one convenient shape.
 */
async function getSubmissionStatus(req, res) {
  const { id } = req.params;

  try {
    const submissionResponse = await domjudge.get(`/submissions/${id}`);

    if (submissionResponse.status >= 400) {
      const { status, body } = toApiError(
        submissionResponse,
        "Submission tidak ditemukan"
      );
      return res.status(status).json(body);
    }

    const judgementsResponse = await domjudge.get("/judgements", {
      params: { submission_id: id },
    });

    const judgements = Array.isArray(judgementsResponse.data)
      ? judgementsResponse.data
      : [];

    // The most recent judgement (if any) reflects current verdict.
    const latest = judgements[judgements.length - 1] || null;

    return res.json({
      error: false,
      submission: submissionResponse.data,
      verdict: latest ? latest.judgement_type_id : "PENDING",
      judged: Boolean(latest && latest.judgement_type_id),
      judgement: latest,
    });
  } catch (err) {
    console.error("[getSubmissionStatus]", err.message);
    return res.status(502).json({
      error: true,
      message: "Tidak dapat mengambil status submission dari DOMjudge",
    });
  }
}

/**
 * GET /api/contests/:cid/scoreboard
 */
async function getScoreboard(req, res) {
  const { cid } = req.params;

  try {
    const response = await domjudge.get(`/contests/${cid}/scoreboard`);

    if (response.status >= 400) {
      const { status, body } = toApiError(
        response,
        "Gagal mengambil scoreboard dari DOMjudge"
      );
      return res.status(status).json(body);
    }

    return res.json({
      error: false,
      scoreboard: response.data,
    });
  } catch (err) {
    console.error("[getScoreboard]", err.message);
    return res.status(502).json({
      error: true,
      message: "Tidak dapat mengambil scoreboard dari DOMjudge",
    });
  }
}

module.exports = {
  getContests,
  getContest,
  getContestProblems,
  getSubmissions,
  getProblemDetail,
  submitSolution,
  getSubmissionStatus,
  getScoreboard,
};
