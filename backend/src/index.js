// src/index.js
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const domjudgeRoutes = require("./routes/domjudge");

const app = express();

app.use(cors()); // restrict origin in production, e.g. { origin: "https://your-frontend.com" }
app.use(express.json({ limit: "2mb" })); // submissions can be sizeable source files

app.use("/api", domjudgeRoutes);

// Fallback error handler — catches anything a controller didn't handle itself
app.use((err, req, res, next) => {
  console.error("[unhandled error]", err);
  res.status(500).json({ error: true, message: "Internal server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`CodeToday backend listening on port ${PORT}`);
  console.log(`Proxying DOMjudge at ${process.env.DOMJUDGE_URL}`);
});
