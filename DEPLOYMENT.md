# Deployment Guide (step by step, free tier)

Order matters: **1) Database → 2) GitHub → 3) Backend (Render) → 4) Frontend (Vercel) → 5) Connect them**.

## 1. MongoDB Atlas (database)
1. Go to mongodb.com/atlas → sign up → create a **free M0 cluster**.
2. *Database Access* → Add user (username + password, remember them).
3. *Network Access* → Add IP address → **Allow access from anywhere** (`0.0.0.0/0`) (Render has changing IPs).
4. *Connect → Drivers* → copy the connection string:
   `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/placement_board?retryWrites=true&w=majority`
   (put your password in; add `/placement_board` before the `?`).

## 2. Push the code to GitHub (public repo)
```bash
cd placement-board
git init
git add .
git commit -m "Campus Placement & Internship Board"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```
Check on GitHub that **no `.env` file** was uploaded (only `.env.example`).

## 3. Backend on Render
1. render.com → sign up with GitHub → **New → Web Service** → select your repo.
2. Settings: **Root Directory** `server` · **Build Command** `npm install` · **Start Command** `npm start` · Instance type **Free**.
3. *Environment variables* (Add each):
   - `MONGO_URI` = your Atlas string
   - `JWT_SECRET` = any long random text
   - `ADMIN_SECRET` = a private code
   - `CLIENT_URL` = `http://localhost:5173` for now (we change it in step 5)
   - `ADMIN_EMAIL` = `admin@campus.com`, `ADMIN_PASSWORD` = `Admin@123`, `ADMIN_NAME` = `Placement Admin`  (these match the demo logins written in the internship report)
4. Deploy. When it says *Live*, open `https://<name>.onrender.com/` – you should see `{"message":"Campus Placement & Internship Board API is running"}`.
5. Create the admin: easiest is to run the seed **from your own computer** with `MONGO_URI` of Atlas in your local `server/.env`: `npm run seed` (use `npm run seed:demo` so the demo recruiter/student and 8 sample listings used in the report exist).

> Free Render services sleep after ~15 min idle; the first request can take 30–50 s. **Open the backend link 1 minute before your demo.**

## 4. Frontend on Vercel
1. vercel.com → sign up with GitHub → **Add New → Project** → import the repo.
2. **Root Directory**: `client` · Framework: **Vite** (auto-detected).
3. *Environment Variables*: `VITE_API_URL` = `https://<name>.onrender.com/api`
4. Deploy → you get `https://<project>.vercel.app`.
(`client/vercel.json` makes page refreshes like `/jobs` work.)

## 5. Connect them (CORS)
Back on Render → Environment → set `CLIENT_URL` = `https://<project>.vercel.app` (no trailing `/`) → Save (it redeploys).
Open the Vercel link, login as admin, and test the full flow.

## Troubleshooting
| Problem | Fix |
|---|---|
| "Cannot reach the server" | Render is waking up – wait 30–50 s and retry |
| CORS error in browser console | `CLIENT_URL` on Render doesn't exactly match the Vercel URL |
| Backend crashes "MongoDB connection failed" | Wrong password in `MONGO_URI` or Atlas IP access not `0.0.0.0/0` |
| Page refresh gives 404 on Vercel | `client/vercel.json` missing |
| Changed an env variable but nothing changed | Vercel: redeploy; Render: it redeploys automatically |
