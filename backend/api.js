import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});


async function request(promise) {
  try {
    const response = await promise;
    return response.data;
  } catch (err) {
    if (err.response) {
      // Backend responded with an error status
      const message =
        err.response.data?.message ||
        `Request gagal dengan status ${err.response.status}`;
      throw new Error(message);
    }
    if (err.request) {
      // Request was made but no response received
      throw new Error("Tidak ada respons dari server. Periksa koneksi Anda.");
    }
    throw new Error(err.message || "Terjadi kesalahan tak terduga.");
  }
}

/** Ambil detail soal + statement (HTML/PDF, base64) */
export function fetchProblemDetail(contestId, problemId) {
  return request(api.get(`/contests/${contestId}/problems/${problemId}`));
}

/** Kirim submission (source code) untuk sebuah soal */
export function submitCode(contestId, { code, language_id, problem_id }) {
  return request(
    api.post(`/contests/${contestId}/submissions`, {
      code,
      language_id,
      problem_id,
    })
  );
}

/** Cek status/verdict sebuah submission */
export function fetchSubmissionStatus(submissionId) {
  return request(api.get(`/submissions/${submissionId}`));
}

/** Ambil scoreboard sebuah contest */
export function fetchScoreboard(contestId) {
  return request(api.get(`/contests/${contestId}/scoreboard`));
}

export default api;
