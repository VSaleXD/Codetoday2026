// src/routes/domjudge.js
//
// Route definitions only — logic lives in domjudgeController.js.

const express = require("express");
const router = express.Router();

const {
  getContests,
  getContest,
  getContestProblems,
  getSubmissions,
  getProblemDetail,
  submitSolution,
  getSubmissionStatus,
  getScoreboard,
} = require("../controllers/domjudgeController");

router.get("/contests", getContests);
router.get("/contests/:cid", getContest);
router.get("/contests/:cid/problems", getContestProblems);
router.get("/contests/:cid/submissions", getSubmissions);

// Detail soal + statement (HTML/PDF)
router.get("/contests/:cid/problems/:id", getProblemDetail);

// Kirim submission (source code) ke DOMjudge
router.post("/contests/:cid/submissions", submitSolution);

// Cek status/verdict submission
router.get("/submissions/:id", getSubmissionStatus);

// Ambil scoreboard
router.get("/contests/:cid/scoreboard", getScoreboard);

module.exports = router;
