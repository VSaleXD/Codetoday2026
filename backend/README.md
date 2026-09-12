# CodeToday ↔ DOMjudge Integration

Proxy layer antara frontend React (Vite) dan instance DOMjudge (`/api/v4`),
supaya kredensial admin DOMjudge tidak pernah dikirim ke browser dan
masalah CORS teratasi.

## Struktur

```
backend/
  src/
    services/domjudgeClient.js   # axios instance + basic auth ke DOMjudge
    controllers/domjudgeController.js
    routes/domjudge.js
    index.js                     # entry point Express
  .env.example
  package.json

frontend/
  src/
    services/api.js              # helper axios ke backend Express
    components/ProblemDetail.jsx # contoh integrasi useEffect + submit
```

## Menjalankan backend

```bash
cd backend
cp .env.example .env   # isi DOMJUDGE_USER / DOMJUDGE_PASS yang sebenarnya
npm install
npm run dev             # atau: npm start
```

Backend akan berjalan di `http://localhost:5000`, expose endpoint:

- `GET  /api/contests/:cid/problems/:id`
- `POST /api/contests/:cid/submissions`
- `GET  /api/submissions/:id`
- `GET  /api/contests/:cid/scoreboard`

## Menjalankan frontend

Pastikan project Vite kamu punya `.env.local`:

```
VITE_API_BASE_URL=http://localhost:5000/api
```

Lalu install axios kalau belum ada:

```bash
npm install axios
```

Import `ProblemDetail` dan render dengan `contestId` & `problemId` sebagai props,
misalnya dari React Router:

```jsx
<ProblemDetail contestId={contestId} problemId={problemId} />
```

## Catatan penting

1. **Verdict via `/judgements`** — endpoint DOMjudge `/submissions/:id` tidak
   langsung memberi verdict; verdict didapat dari `/judgements?submission_id=...`.
   Controller `getSubmissionStatus` sudah menggabungkan keduanya.
2. **Statement bisa HTML atau PDF** — `getProblemDetail` mengembalikan
   `statement.mimeType` supaya frontend tahu cara merender (HTML inline vs PDF
   di `<iframe>`).
3. **CORS** — `app.use(cors())` di `index.js` masih permisif (semua origin).
   Untuk production, batasi ke domain frontend kamu, misalnya:
   `cors({ origin: "https://codetoday2026.web.id" })`.
4. **Keamanan submission** — saat ini siapa pun yang bisa memanggil backend
   bisa submit atas nama akun admin DOMjudge. Sebelum dipakai serius, tambahkan
   middleware auth (JWT — `JWT_SECRET` sudah disiapkan di `.env`) supaya hanya
   peserta yang sudah login yang bisa hit endpoint `/submissions`, dan idealnya
   mapping user CodeToday → `team_id` DOMjudge, bukan submit sebagai admin.
5. Sesuaikan `LANGUAGES` di `ProblemDetail.jsx` dan `language_id` yang dikirim
   dengan daftar bahasa yang benar-benar dikonfigurasi di instance DOMjudge kamu
   (bisa dicek lewat `GET /api/v4/languages`).
