import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Building2, Calendar, MapPin, Wallet } from "lucide-react";
import api, { getErrorMessage } from "../api";
import { useAuth } from "../context/AuthContext";
import StatusBadge from "../components/StatusBadge";
import Loader from "../components/Loader";
import Alert from "../components/Alert";
import { formatDate } from "../utils";

function ListingDetail() {
  const { id } = useParams(); // the id from the address  /jobs/:id
  const { user } = useAuth();

  const [listing, setListing] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [coverNote, setCoverNote] = useState("");
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState("");
  const [success, setSuccess] = useState("");

  // Load the listing (and, for students, check if they already applied)
  useEffect(() => {
    async function load() {
      try {
        const { data } = await api.get("/listings/" + id);
        setListing(data.listing);
        setIsOpen(data.isOpen);

        if (user && user.role === "student") {
          const mine = await api.get("/applications/me");
          const found = mine.data.applications.some((app) => app.listing && app.listing._id === id);
          setAlreadyApplied(found);
        }
      } catch (err) {
        setError(getErrorMessage(err));
      }
      setLoading(false);
    }
    load();
  }, [id, user]);

  async function handleApply(e) {
    e.preventDefault();
    setApplyError("");

    if (coverNote.trim().length < 10) {
      setApplyError("Please write a cover note of at least 10 characters.");
      return;
    }

    setApplying(true);
    try {
      const { data } = await api.post("/applications", { listingId: id, coverNote });
      setSuccess(data.message + ". You can track it in 'My Applications'.");
      setAlreadyApplied(true);
    } catch (err) {
      setApplyError(getErrorMessage(err));
    }
    setApplying(false);
  }

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Alert type="error">{error}</Alert>
        <Link to="/jobs" className="btn btn-outline mt-4">Back to openings</Link>
      </div>
    );
  }

  // The box on the right side changes depending on who is looking
  function renderApplyBox() {
    if (!user) {
      return (
        <>
          <p className="text-sm text-slate-600">Login as a student to apply for this opening.</p>
          <Link to="/login" className="btn btn-primary mt-4 w-full">Login to apply</Link>
          <Link to="/register" className="btn btn-outline mt-2 w-full">Create student account</Link>
        </>
      );
    }
    if (user.role !== "student") {
      return <Alert type="info">Only students can apply. You are logged in as {user.role}.</Alert>;
    }
    if (success) {
      return (
        <>
          <Alert type="success">{success}</Alert>
          <Link to="/student/applications" className="btn btn-primary mt-4 w-full">View my applications</Link>
        </>
      );
    }
    if (alreadyApplied) {
      return <Alert type="info">You have already applied to this listing.</Alert>;
    }
    if (!isOpen) {
      return <Alert type="error">This listing is closed or the last date has passed.</Alert>;
    }
    return (
      <form onSubmit={handleApply} className="space-y-4">
        <div>
          <label className="label">Cover note</label>
          <textarea
            className="input min-h-32 resize-y"
            placeholder="Tell the recruiter why you are a good fit..."
            maxLength={1000}
            value={coverNote}
            onChange={(e) => setCoverNote(e.target.value)}
          />
          <p className="mt-1 text-right text-xs text-slate-400">{coverNote.length}/1000</p>
        </div>
        <Alert type="error">{applyError}</Alert>
        <button className="btn btn-primary w-full" disabled={applying}>
          {applying ? "Submitting..." : "Submit application"}
        </button>
      </form>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link to="/jobs" className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-indigo-600">
        <ArrowLeft size={16} /> Back to openings
      </Link>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* Left: details */}
        <div className="card p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={listing.roleType} />
            {!isOpen && <StatusBadge status="closed" />}
          </div>
          <h1 className="mt-3 text-3xl font-extrabold text-slate-900">{listing.title}</h1>
          <p className="mt-2 flex items-center gap-2 text-lg font-medium text-slate-600">
            <Building2 size={18} className="text-slate-400" /> {listing.companyName}
          </p>

          <div className="mt-6 grid gap-4 rounded-2xl bg-slate-50 p-5 sm:grid-cols-3">
            <div>
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase text-slate-400"><MapPin size={13} /> Location</p>
              <p className="mt-1 font-semibold text-slate-800">{listing.location}</p>
            </div>
            <div>
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase text-slate-400"><Wallet size={13} /> Stipend / Salary</p>
              <p className="mt-1 font-semibold text-slate-800">{listing.stipend}</p>
            </div>
            <div>
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase text-slate-400"><Calendar size={13} /> Last date</p>
              <p className="mt-1 font-semibold text-slate-800">{formatDate(listing.lastDate)}</p>
            </div>
          </div>

          <h2 className="mt-8 text-lg font-bold text-slate-900">About the role</h2>
          <p className="mt-2 whitespace-pre-line leading-relaxed text-slate-600">{listing.description}</p>

          <h2 className="mt-8 text-lg font-bold text-slate-900">Skills required</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {listing.skills.length === 0 && <p className="text-sm text-slate-500">No specific skills mentioned.</p>}
            {listing.skills.map((skill) => (
              <span key={skill} className="rounded-lg bg-indigo-50 px-3 py-1.5 text-sm font-semibold text-indigo-700">{skill}</span>
            ))}
          </div>
        </div>

        {/* Right: apply box */}
        <div className="h-fit lg:sticky lg:top-24">
          <div className="card p-6">
            <h2 className="mb-4 text-lg font-bold text-slate-900">Apply for this role</h2>
            {renderApplyBox()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ListingDetail;
