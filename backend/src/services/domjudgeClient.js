// src/services/domjudgeClient.js
//
// Central axios instance for talking to the DOMjudge REST API (/api/v4).
// All credentials live only here (and in .env) — never sent to the frontend.

const axios = require("axios");

const {
  DOMJUDGE_URL,
  DOMJUDGE_USER,
  DOMJUDGE_PASS,
} = process.env;

if (!DOMJUDGE_URL || !DOMJUDGE_USER || !DOMJUDGE_PASS) {
  // Fail fast on boot instead of failing mysteriously on the first request.
  console.error(
    "[domjudgeClient] Missing DOMJUDGE_URL / DOMJUDGE_USER / DOMJUDGE_PASS in .env"
  );
}

const domjudge = axios.create({
  baseURL: `${DOMJUDGE_URL}/api/v4`,
  auth: {
    username: DOMJUDGE_USER,
    password: DOMJUDGE_PASS,
  },
  // DOMjudge can return either JSON or raw files (PDF/HTML statements),
  // so we don't force a single responseType here — each call site decides.
  timeout: 15000,
  validateStatus: () => true, // we handle status codes ourselves below
});

/**
 * Normalizes a DOMjudge error response into something safe & useful
 * to send back to our own frontend (never leak raw axios/DOMjudge internals).
 */
function toApiError(response, fallbackMessage) {
  const status = response?.status ?? 502;
  const domjudgeMessage =
    response?.data?.message ||
    (typeof response?.data === "string" ? response.data : null);

  return {
    status,
    body: {
      error: true,
      message: domjudgeMessage || fallbackMessage || "DOMjudge request failed",
    },
  };
}

module.exports = { domjudge, toApiError };
