# CampusConnect – Campus Placement & Internship Board

A three-role (Admin, Recruiter, Student) placement portal built with the **MERN stack** by **Anunay Dubey (24BCS12191)** during the internship at **Data Tech Alpha**.
Companies post jobs/internships, students search and apply, and an admin approves recruiters and oversees everything.

- **Live frontend (Vercel):** `<add your Vercel link>`
- **Live backend (Render):** `<add your Render link>`

## Features
- JWT login/register for 3 roles, passwords hashed with bcrypt, reusable role-check middleware
- Recruiters must be **approved by Admin** before posting
- Admin: approve/reject recruiters, view all listings (active + closed), view all applications, remove listings
- Recruiter: create listings, view applicants, update status (Applied → Shortlisted → Selected, or Applied → Rejected), close listings
- Student: browse, **server-side** search (title/company), filter (type/location), **server-side pagination**, apply once with a cover note, track in "My Applications"
- Responsive UI (mobile, tablet, laptop)

## Tech stack
| Part | Technology |
|---|---|
| Frontend | React 18 (Vite), React Router v6, Tailwind CSS, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas + Mongoose |
| Auth | JWT + bcrypt (`bcryptjs`) |
| Deploy | Render (backend), Vercel (frontend) |

## Folder structure
```
placement-board/
├── client/                 React frontend
│   └── src/
│       ├── api.js          axios setup (adds token to every request)
│       ├── context/        AuthContext (who is logged in)
│       ├── components/     Navbar, ProtectedRoute, ListingCard, Pagination ...
│       └── pages/          Home, Jobs, Login, Register, admin/, recruiter/, student/
└── server/                 Express backend
    ├── server.js           starting point
    ├── seed.js             creates the first admin (+ demo data)
    ├── config/db.js        MongoDB connection
    ├── models/             User, Listing, Application
    ├── middleware/         auth.js (protect, allowRoles, approvedRecruiterOnly), checkId.js
    ├── controllers/        the logic of each endpoint
    └── routes/             URL -> controller mapping
```

## Run locally
Requirements: Node.js 18+, a free MongoDB Atlas cluster.

**Backend**
```bash
cd server
npm install
cp .env.example .env        # then fill in your own values
npm run seed                # creates the first admin from ADMIN_EMAIL / ADMIN_PASSWORD
npm run dev                 # http://localhost:5000
```
Optional: `npm run seed:demo` also adds a demo recruiter (`recruiter@demo.com` / `Recruiter@123`), a demo student (`student@demo.com` / `Student@123`) and 8 sample listings.

**Frontend**
```bash
cd client
npm install
cp .env.example .env        # VITE_API_URL=http://localhost:5000/api
npm run dev                 # http://localhost:5173
```

## Environment variables
`server/.env.example`: `PORT`, `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`, `ADMIN_SECRET`, `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`
`client/.env.example`: `VITE_API_URL`

## API reference
Base URL: `/api`. Protected routes need header `Authorization: Bearer <token>`. Errors always look like `{ "message": "..." }`.

### Auth
| Method & URL | Access | Request body | Success response |
|---|---|---|---|
| `POST /auth/register` | public | `{ name, email, password, role, companyName?, adminCode? }` (`role`: student/recruiter/admin; `companyName` required for recruiter; `adminCode` required for admin) | `201 { message, token, user }` – recruiters get `status: "pending"` |
| `POST /auth/login` | public | `{ email, password }` | `200 { message, token, user }` |
| `GET /auth/me` | logged in | – | `200 { user }` (latest status) |

`user` = `{ id, name, email, role, companyName, status }`

### Admin (role: admin)
| Method & URL | Description | Response |
|---|---|---|
| `GET /admin/recruiters?status=` | pending + approved + rejected recruiters (optional filter) | `{ recruiters: [...] }` |
| `PATCH /admin/recruiters/:id/status` | body `{ status: "approved" \| "rejected" }` | `{ message, recruiter }` |
| `GET /admin/listings` | all listings, active + closed *(extra endpoint, needed by the admin "view all listings" requirement)* | `{ listings: [...] }` |
| `DELETE /admin/listings/:id` | remove listing and its applications | `{ message }` |
| `GET /admin/applications` | all applications with student + listing | `{ applications: [...] }` |

### Listings
| Method & URL | Access | Description |
|---|---|---|
| `POST /listings` | approved recruiter | body `{ title, companyName, roleType: "job"\|"internship", location, stipend, description, skills ("React, Node" or array), lastDate (YYYY-MM-DD) }` → `201 { message, listing }` |
| `GET /listings?search=&type=&location=&page=&limit=` | public | active listings only → `{ listings, page, limit, total, totalPages }` (`limit` default 6, max 50) |
| `GET /listings/mine` | approved recruiter | own listings with `applicantCount` *(extra)* |
| `GET /listings/:id` | public | `{ listing, isOpen }` |
| `PATCH /listings/:id/close` | owner recruiter | `{ message, listing }` – stops new applications |
| `GET /listings/:id/applicants` | owner recruiter | `{ listing, applicants: [{ _id, student:{name,email}, coverNote, status, createdAt }] }` |

### Applications
| Method & URL | Access | Description |
|---|---|---|
| `POST /applications` | student | body `{ listingId, coverNote }` → `201 { message, application }`; `409` if already applied; `400` if listing closed/expired |
| `GET /applications/me` | student | `{ applications: [{ listing:{...}, coverNote, status }] }` |
| `PATCH /applications/:id/status` | owner recruiter | body `{ status }`. Allowed: Applied→Shortlisted, Applied→Rejected, Shortlisted→Selected. Others → `400` |

### Status codes used
`200/201` success · `400` validation error · `401` not logged in / bad token · `403` wrong role or not approved · `404` not found · `409` duplicate

## Admin account
Admins can register from the Register page by entering the `ADMIN_SECRET` code, or be created with `npm run seed`.

## Screenshots
Add screenshots here (home, browse, admin, recruiter, applicants, my applications).
