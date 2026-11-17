# Viva & Project Understanding Guide

## 1. The project in simple words
A website where **companies post jobs/internships**, **students apply**, and an **admin controls** who may post. There are three kinds of users (roles):
- **Student** – searches openings, applies once, tracks status.
- **Recruiter** – registers, waits for admin approval, then posts listings, sees applicants, shortlists/selects/rejects, closes listings.
- **Admin** – approves/rejects recruiters, sees all listings & applications, removes bad listings.

## 2. Technologies and why
| Tech | Purpose (one line) |
|---|---|
| **MongoDB (Atlas)** | Database; stores data as JSON-like documents; Atlas = free cloud MongoDB |
| **Mongoose** | Lets Node talk to MongoDB using schemas/models (defines fields, rules) |
| **Express.js** | Framework on Node.js to build the REST API (routes + middleware) |
| **Node.js** | Runs JavaScript on the server |
| **React (Vite)** | Builds the user interface from components; Vite is the fast dev/build tool |
| **React Router** | Page navigation without reloading the browser (single page app) |
| **Tailwind CSS** | Styling with small ready classes (`p-4`, `text-sm`) written in the HTML |
| **Axios** | Sends HTTP requests from React to the backend |
| **JWT** | A signed token the server gives at login; proves who you are on later requests |
| **bcrypt (bcryptjs)** | Hashes passwords so the real password is never stored |
| **CORS** | Browser rule; server must allow the frontend's address |
| **dotenv / .env** | Keeps secrets (DB password, JWT secret) out of the code |
| **Render / Vercel** | Free hosting for backend / frontend |

## 3. How frontend, backend and database talk
```
Browser (React on Vercel)  --Axios HTTP/JSON-->  Express API (Render)  --Mongoose-->  MongoDB Atlas
        <----------- JSON response -------------        <------------ data -----------
```
Example – student applies:
1. Student types a cover note and clicks Submit → `ListingDetail.jsx` calls `api.post("/applications", {...})`.
2. `api.js` automatically adds `Authorization: Bearer <token>`.
3. Express route `POST /api/applications` runs middleware `protect` (is the token valid?) → `allowRoles("student")` → controller `applyToListing`.
4. Controller validates, checks listing is open and not already applied, saves an Application with Mongoose.
5. Server replies `201 { message }`; React shows the success message.

## 4. Folder structure & important files
**Backend (`server/`)**
- `server.js` – starts Express, enables CORS + JSON, mounts the 4 route files, connects DB.
- `models/User.js, Listing.js, Application.js` – database structure.
- `middleware/auth.js` – **`protect`** (verify JWT), **`allowRoles(...)`** (role check), **`approvedRecruiterOnly`**. Written once, reused in routes (requirement: no repeated auth logic).
- `routes/*.js` – which URL uses which middleware + controller.
- `controllers/*.js` – the real logic (validation, DB queries).
- `seed.js` – creates the first admin.

**Frontend (`client/src/`)**
- `main.jsx` – starts React, wraps app in Router + AuthProvider.
- `App.jsx` – list of all pages (routes); role pages wrapped in `ProtectedRoute`.
- `context/AuthContext.jsx` – stores logged-in user + token (localStorage); gives `user`, `saveLogin`, `logout`.
- `api.js` – axios setup (base URL, token header, auto logout on 401).
- `components/ProtectedRoute.jsx` – blocks pages by login/role.
- `pages/` – each screen.

## 5. Important logic explained
**Registration & hashing** – `authController.register`: validates → checks duplicate email → `bcrypt.hash(password,10)` → saves. Recruiters get `status:"pending"`, others `"approved"`. Admin registration needs `ADMIN_SECRET`.

**Login & JWT** – `login`: find user by email → `bcrypt.compare` → `jwt.sign({id, role}, JWT_SECRET, {expiresIn:"7d"})` → send token. Frontend saves it in localStorage.

**Role-based middleware** – `protect` reads the header, `jwt.verify`, loads the user into `req.user`. `allowRoles("admin")` returns 403 if `req.user.role` isn't allowed. Routes use them like: `router.post("/", protect, allowRoles("recruiter"), approvedRecruiterOnly, createListing)`.

**Recruiter approval** – new recruiter = `pending`. `approvedRecruiterOnly` blocks posting unless `status==="approved"`. Admin changes it with `PATCH /admin/recruiters/:id/status`.

**Server-side search/filter/pagination** – `getListings` builds a MongoDB filter object: `status:"active"`, regex on title/company for `search`, `roleType` for `type`, regex on `location`. Then `skip = (page-1)*limit`, `.skip(skip).limit(limit)`, plus `countDocuments` for `total` and `totalPages`. Frontend only sends `?page=2&limit=6`; it never loads all records.

**Application status lifecycle** – object `allowedChanges` in `applicationController.js`: Applied→[Shortlisted, Rejected], Shortlisted→[Selected], final states → []. Any other change returns 400. The recruiter must also own the listing.

**No double application** – (1) check `findOne({listing, student})` → 409; (2) a **unique compound index** `{listing, student}` in the Application model as a database-level safety net.

**Closing a listing** – sets `status:"closed"`; `listing.isOpen()` (also checks last date) is false, so applying returns 400 and it disappears from the public list.

**Protected routes in React** – `ProtectedRoute` checks `user` and `roles`; wrong role → redirected to own dashboard.

## 6. Demo script (≈4 minutes) – matches the required video
Before: open the backend link once (wakes Render). Use 3 browser windows or log out/in.
1. **Register a new recruiter** (e.g. "Acme Labs"). Show "Waiting for admin approval" – he cannot post yet.
2. **Login as admin** → Recruiters tab → filter *Pending* → click **Approve**. Mention the Listings/Applications tabs.
3. **Login as recruiter** → *Post new listing* → fill the form → it appears on the dashboard.
4. **Register/login as student** → *Browse Openings* → search by title, filter Internship + location, click **Next** (pagination; say "done by the server").
5. Open the listing → write cover note → **Submit**. Reload: "already applied". Open *My Applications* → status *Applied*.
6. **Login as recruiter** → *Applicants* → **Shortlist**.
7. **Login as student** → *My Applications* → status now **Shortlisted**.
8. (Optional) Admin removes a listing; recruiter closes a listing; try opening `/admin` as student → redirected.

## 7. Viva questions & answers
### Basic
1. **What is MERN?** MongoDB, Express, React, Node.js – a JavaScript stack for full-stack apps.
2. **What is a REST API?** Web endpoints using HTTP methods (GET read, POST create, PATCH update, DELETE remove) that return JSON.
3. **Difference between PUT and PATCH?** PUT replaces the whole record; PATCH changes only some fields. We use PATCH for status.
4. **SQL vs MongoDB?** SQL = tables/rows with fixed schema; MongoDB = collections/documents (JSON-like), flexible.
5. **What is Mongoose?** An ODM library giving schemas, validation and easy queries for MongoDB.
6. **What is middleware in Express?** A function that runs between request and response (`req, res, next`), e.g. checking login.
7. **What is JWT?** A signed token with the user's id and role; the server verifies the signature so it doesn't need to store sessions.
8. **Why hash passwords?** If the DB leaks, attackers can't read passwords. Hashing is one-way; bcrypt adds salt and is slow on purpose.
9. **What is a React component / state / hook?** Component = reusable UI function; state = data that changes the UI (`useState`); `useEffect` runs code when the page loads or a value changes.
10. **What is Context?** A way to share data (the logged-in user) to all components without passing props down.
11. **What is CORS?** Browser security rule blocking calls to another origin unless the server allows it.
12. **Why `.env`?** Keeps secrets out of GitHub; `.env.example` shows names with fake values.
13. **What is `localStorage`?** Browser storage that survives refresh; we keep the token there.
14. **Why Vite?** Very fast development server and build tool for React.
15. **Why Tailwind?** Faster styling with utility classes, easy responsive design (`md:`, `lg:` prefixes).

### Project-specific
16. **How does recruiter approval work?** Status field `pending/approved/rejected`; `approvedRecruiterOnly` middleware blocks posting until the admin approves.
17. **How do you stop a student opening the admin page?** Backend: `allowRoles("admin")` returns 403. Frontend: `ProtectedRoute` redirects. Backend is the real protection; frontend is for UX.
18. **How is pagination done?** `skip((page-1)*limit).limit(limit)` in MongoDB with `countDocuments` for totals. Not sliced in React.
19. **How does search work?** A case-insensitive regex (`new RegExp(text,"i")`) on title OR company (`$or`). User text is escaped so symbols like `C++` don't break it.
20. **How do you prevent duplicate applications?** Check before saving (409) + unique index on `(listing, student)`.
21. **Explain the status workflow.** Applied → Shortlisted → Selected, or Applied → Rejected. `allowedChanges` object enforces it; invalid change gives 400.
22. **Can recruiter A change recruiter B's applicants?** No. The controller compares `listing.recruiter` with `req.user._id` and returns 403.
23. **What happens when a listing is closed or its last date passes?** It is hidden from public list and applying returns 400 (`isOpen()` method).
24. **What happens when admin deletes a listing?** The listing and all its applications are deleted (`deleteMany`).
25. **How do you keep the login after refresh?** Token + user saved in localStorage; `AuthContext` reads them on start and calls `/auth/me` to refresh status.
26. **What does `populate()` do?** Replaces a stored id (e.g. student id) with that document's fields (name, email).
27. **Why does `/listings/mine` come before `/listings/:id`?** Express matches in order; otherwise "mine" would be treated as an id.
28. **What does `router.param("id", checkId)` do?** Validates every `:id`; invalid ones get 400 instead of a database error.
29. **How is admin registration protected?** It needs a secret code (`ADMIN_SECRET`) known only to the institute; or admin is created via `seed.js`.
30. **Why bcryptjs and not bcrypt?** Same algorithm written in pure JavaScript, so installation never fails on hosting servers.
31. **How is the frontend deployed and how does it know the backend URL?** Vercel builds it; `VITE_API_URL` env variable is read in `api.js`.
32. **What HTTP status codes do you use?** 200/201 ok, 400 bad input, 401 not logged in, 403 not allowed, 404 not found, 409 duplicate.
33. **Why is the first request slow on the live site?** Render free tier sleeps when idle and needs ~30–50 s to wake up.
34. **What would you improve?** Email notifications, resume upload, edit listing, password reset, rate limiting (all explicitly out of scope).
35. **Why did you add `GET /admin/listings`, `GET /listings/mine`, `GET /auth/me`?** The assignment needs admin to view all listings (active+closed), recruiters to see their own listings, and the UI to refresh approval status; these small endpoints support those requirements.

## 8. Tips for the viva
- Open `authController.js`, `auth.js`, `listingController.js` (`getListings`), and `applicationController.js` once before the viva; these four files answer most questions.
- If asked "who wrote this?" say you built it with AI assistance, studied every part, and can explain it. Be honest and confident.
