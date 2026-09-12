import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api'),
  timeout: 15000,
  headers: { Accept: 'application/json' },
})

const apiToken = import.meta.env.VITE_DOMJUDGE_API_TOKEN
const apiUsername = import.meta.env.VITE_DOMJUDGE_USERNAME
const apiPassword = import.meta.env.VITE_DOMJUDGE_PASSWORD

if (apiToken) {
  api.defaults.headers.common.Authorization = `Bearer ${apiToken}`
} else if (apiUsername && apiPassword) {
  api.defaults.auth = { username: apiUsername, password: apiPassword }
}

const contests = {
  list: () => api.get('/contests'),
  detail: (contestId) => api.get(`/contests/${contestId}`),
}

const problems = {
  list: (contestId) => api.get(`/contests/${contestId}/problems`),
  detail: (contestId, problemId) => api.get(`/contests/${contestId}/problems/${problemId}`),
}

const submissions = {
  create: (contestId, submission) => api.post(`/contests/${contestId}/submissions`, submission),
  list: (contestId, userId) => api.get(`/contests/${contestId}/submissions`, {
    params: userId ? { user: userId } : undefined,
  }),
  detail: (_contestId, submissionId) => api.get(`/submissions/${submissionId}`),
}

const scoreboard = {
  detail: (contestId) => api.get(`/contests/${contestId}/scoreboard`),
}

const auth = {
  teamLoginUrl: import.meta.env.VITE_DOMJUDGE_TEAM_URL || (import.meta.env.DEV ? 'https://cp-codetoday.web.id/team' : '/team'),
  logoutUrl: import.meta.env.VITE_DOMJUDGE_LOGOUT_URL || (import.meta.env.DEV ? 'https://cp-codetoday.web.id/logout' : '/logout'),
}

export { api, auth, contests, problems, submissions, scoreboard }
export default api