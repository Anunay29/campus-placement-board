# CampusConnect – Campus Placement & Internship Board

A web app where companies post jobs and internships, students search and apply, and an admin controls who can post. Built with the MERN stack by **Anunay Dubey (24BCS12191)**.

## Features

**Student**
- Register and log in
- Search and filter jobs and internships (by title, company, type, location)
- Apply once to a listing with a cover note
- Track application status in "My Applications"

**Recruiter**
- Register with a company name (needs admin approval before posting)
- Create and close listings
- See applicants and mark them Shortlisted, Selected or Rejected

**Admin**
- Approve or reject recruiters
- View all listings and applications
- Remove listings

## Tech Stack

| Part | Technology |
|---|---|
| Frontend | React (Vite), React Router, Tailwind CSS, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas, Mongoose |
| Login/Security | JWT, bcrypt |

## Folder Structure

```
placement-board/
├── client/    React frontend
└── server/    Express backend (routes, controllers, models, middleware)
```

## How to Run on Your Computer

**Requirements:** Node.js 18+ and a free MongoDB Atlas database.

**1. Backend**
```bash
cd server
npm install
cp .env.example .env     # then fill in your own values
npm run seed             # creates the first admin account
npm run dev              # runs on http://localhost:5000
```

**2. Frontend** (open a second terminal)
```bash
cd client
npm install
cp .env.example .env
npm run dev              # runs on http://localhost:5173
```

Open http://localhost:5173 in your browser.

## Environment Variables

Copy `.env.example` to `.env` in each folder and fill in your own values. Never upload the real `.env` file to GitHub.

- `server/.env`: `PORT`, `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`, `ADMIN_SECRET`, `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`
- `client/.env`: `VITE_API_URL`

## Demo Accounts (optional)

Run `npm run seed:demo` in the `server` folder to add sample data:
- Recruiter: `recruiter@demo.com` / `Recruiter@123`
- Student: `student@demo.com` / `Student@123`

## Author

Anunay Dubey – B.Tech CSE, Chandigarh University
