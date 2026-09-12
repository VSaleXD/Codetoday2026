import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_DOMJUDGE_API_URL || 'https://cp-codetoday.web.id/api/v4',
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
  create: (contestId, formData) => api.post(`/contests/${contestId}/submissions`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  list: (contestId, userId) => api.get(`/contests/${contestId}/submissions`, {
    params: userId ? { user: userId } : undefined,
  }),
  detail: (contestId, submissionId) => api.get(`/contests/${contestId}/submissions/${submissionId}`),
}

const scoreboard = {
  detail: (contestId) => api.get(`/contests/${contestId}/scoreboard`),
}

export { api, contests, problems, submissions, scoreboard }
export default api