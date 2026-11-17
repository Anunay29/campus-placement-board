import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, GraduationCap, Building2, ShieldCheck, Search, FileText, BadgeCheck } from "lucide-react";
import api from "../api";
import ListingCard from "../components/ListingCard";
import { useAuth } from "../context/AuthContext";
import { dashboardPath } from "../utils";

function Home() {
  const { user } = useAuth();
  const [latest, setLatest] = useState([]);

  // Load the 3 newest openings to show on the home page
  useEffect(() => {
    api
      .get("/listings", { params: { limit: 3 } })
      .then((res) => setLatest(res.data.listings))
      .catch(() => setLatest([]));
  }, []);

  const roles = [
    {
      icon: GraduationCap,
      title: "Students",
      text: "Search jobs and internships, apply with a short cover note and track every application in one place.",
    },
    {
      icon: Building2,
      title: "Recruiters",
      text: "Post openings after admin approval, review applicants and move them from Applied to Selected.",
    },
    {
      icon: ShieldCheck,
      title: "Admin",
      text: "Approve recruiters, watch all listings and applications, and remove anything that breaks the rules.",
    },
  ];

  const steps = [
    { icon: BadgeCheck, title: "1. Get approved", text: "Recruiters register and wait for the admin to approve the account." },
    { icon: FileText, title: "2. Post an opening", text: "Approved recruiters publish a job or internship with all the details." },
    { icon: Search, title: "3. Search & apply", text: "Students search, filter and apply once to any active listing." },
    { icon: ShieldCheck, title: "4. Track the status", text: "Recruiters shortlist or reject, and students see the update instantly." },
  ];

  return (
    <div>
      {/* ---------- Hero ---------- */}
      <section className="relative overflow-hidden bg-slate-900 text-white">
        <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-indigo-600/40 blur-3xl"></div>
        <div className="absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-violet-600/30 blur-3xl"></div>

        <div className="relative mx-auto max-w-6xl px-4 py-20 md:py-28">
          <span className="inline-block rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-indigo-100">
            CAMPUS PLACEMENT &amp; INTERNSHIP BOARD
          </span>
          <h1 className="mt-6 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight md:text-6xl">
            Where campus talent meets <span className="text-indigo-400">real opportunities</span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-slate-300">
            Companies post openings, students apply in one click, and an admin keeps the whole process fair and
            organised.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/jobs" className="btn btn-primary px-6 py-3">
              Browse Openings <ArrowRight size={16} />
            </Link>
            {user ? (
              <Link to={dashboardPath(user.role)} className="btn border border-white/30 bg-white/10 px-6 py-3 text-white hover:bg-white/20">
                Go to my dashboard
              </Link>
            ) : (
              <Link to="/register" className="btn border border-white/30 bg-white/10 px-6 py-3 text-white hover:bg-white/20">
                Create an account
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ---------- Three roles ---------- */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center text-3xl font-extrabold text-slate-900">One portal, three roles</h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-slate-500">Every role sees only its own dashboard and tools.</p>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {roles.map((role) => (
            <div key={role.title} className="card p-6">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <role.icon size={24} />
              </span>
              <h3 className="mt-4 text-lg font-bold text-slate-900">{role.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{role.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Latest openings ---------- */}
      {latest.length > 0 && (
        <section className="bg-white py-16">
          <div className="mx-auto max-w-6xl px-4">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-3xl font-extrabold text-slate-900">Latest openings</h2>
                <p className="mt-1 text-slate-500">Freshly posted by approved recruiters.</p>
              </div>
              <Link to="/jobs" className="hidden items-center gap-1 text-sm font-semibold text-indigo-600 hover:underline sm:flex">
                View all <ArrowRight size={14} />
              </Link>
            </div>
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {latest.map((listing) => (
                <ListingCard key={listing._id} listing={listing} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------- How it works ---------- */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center text-3xl font-extrabold text-slate-900">How it works</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div key={step.title} className="rounded-2xl border border-dashed border-slate-300 p-6">
              <step.icon className="text-indigo-600" size={26} />
              <h3 className="mt-3 font-bold text-slate-900">{step.title}</h3>
              <p className="mt-1.5 text-sm text-slate-500">{step.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;
