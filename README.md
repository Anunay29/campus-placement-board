# CampusConnect – Campus Placement & Internship Board

A web app that brings campus hiring into one place. Companies post jobs and internships, students search and apply online, and an admin controls who is allowed to post.

Built by **Anunay Dubey** (UID 24BCS12191), B.Tech CSE, Chandigarh University.

## Overview

Campus openings are often shared through scattered notices and chats, so students miss them and recruiters struggle to manage applicants. CampusConnect solves this with one website where:

- students find openings and track their applications
- recruiters post openings and review applicants
- the admin keeps the platform trustworthy

## Features

**Student**
- Register and log in
- Search by title or company, and filter by type (job or internship) and location
- Apply once to a listing with a cover note
- Track status in "My Applications": Applied, Shortlisted, Selected or Rejected

**Recruiter**
- Register with a company name (the admin must approve the account before posting)
- Create and close listings
- See applicants for each listing and mark them Shortlisted, Selected or Rejected

**Admin**
- Approve or reject recruiters
- View all listings and applications
- Remove inappropriate listings

Anyone can browse openings without logging in. Login is needed only to apply or manage listings.

## How It Works

1. A recruiter registers, and the admin approves the account.
2. The recruiter posts a job or internship.
3. A student searches, opens a listing and applies.
4. The recruiter reviews applicants and updates their status.
5. The student sees the result under "My Applications".

## Tech Stack

| Part | Technology |
|---|---|
| Frontend | React (Vite), React Router, Tailwind CSS, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas, Mongoose |
| Login and security | JWT, bcrypt, role-based access |

## Folder Structure

```
placement-board/
├── client/    React frontend (pages, components)
└── server/    Express backend (routes, controllers, models, middleware)
```

## Getting Started

**Requirements:** Node.js 18 or higher, and a free [MongoDB Atlas](https://www.mongodb.com/atlas) database.

**1. Clone the project**
```bash
git clone https://github.com/Anunay29/campus-placement-board.git
cd campus-placement-board
```

**2. Start the backend**
```bash
cd server
npm install
copy .env.example .env      # Windows (on Mac/Linux use: cp .env.example .env)
```
Open `server/.env` and fill in your own values (see below), then run:
```bash
npm run seed                # creates the admin account
npm run dev                 # runs on http://localhost:5000
```

**3. Start the frontend** (in a second terminal)
```bash
cd client
npm install
copy .env.example .env
npm run dev                 # runs on http://localhost:5173
```

**4. Open** http://localhost:5173 in your browser.

## Environment Variables

Never upload your real `.env` file to GitHub.

| File | Variables |
|---|---|
| `server/.env` | `PORT`, `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`, `ADMIN_SECRET`, `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` |
| `client/.env` | `VITE_API_URL` |

## Login Details

- **Admin:** the `ADMIN_EMAIL` and `ADMIN_PASSWORD` you set in `server/.env`
- **Demo accounts (optional):** run `npm run seed:demo` in the `server` folder

| Role | Email | Password |
|---|---|---|
| Recruiter | recruiter@demo.com | Recruiter@123 |
| Student | student@demo.com | Student@123 |

## Future Scope

- Deploy the app online
- Resume upload with applications
- Email notifications on status changes
- Analytics dashboard for the admin

## Author

**Anunay Dubey**
B.Tech CSE, Chandigarh University
GitHub: [@Anunay29](https://github.com/Anunay29)