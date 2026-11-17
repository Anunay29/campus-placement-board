// Recruiter page: shows the approval status and all listings created by this recruiter.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, Clock, FileX, Plus, Users, XCircle } from "lucide-react";
import api, { getErrorMessage } from "../../api";
import { useAuth } from "../../context/AuthContext";
import StatusBadge from "../../components/StatusBadge";
import Loader from "../../components/Loader";
import Alert from "../../components/Alert";
import { formatDate } from "../../utils";

function RecruiterDashboard() {
  const { user, refreshUser } = useAuth();

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Get the latest approval status when this page opens
  useEffect(() => {
    refreshUser();
  }, []);

  // Load the recruiter's listings (only possible after approval)
  useEffect(() => {
    if (user.status !== "approved") {
      setLoading(false);
      return;
    }
    api
      .get("/listings/mine")
      .then((res) => setListings(res.data.listings))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [user.status]);

  async function handleClose(id) {
    if (!window.confirm("Close this listing? Students will no longer be able to apply.")) return;
    setError("");
    setMessage("");
    try {
      const { data } = await api.patch("/listings/" + id + "/close");
      setMessage(data.message);
      // update this listing in our list without reloading everything
      setListings(listings.map((l) => (l._id === id ? { ...l, status: "closed" } : l)));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  // ---------- Recruiter is not approved yet ----------
  if (user.status === "pending" || user.status === "rejected") {
    const pending = user.status === "pending";
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <div className="card flex flex-col items-center p-10 text-center">
          <span className={"flex h-16 w-16 items-center justify-center rounded-full " + (pending ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600")}>
            {pending ? <Clock size={30} /> : <XCircle size={30} />}
          </span>
          <h1 className="mt-5 text-2xl font-extrabold text-slate-900">
            {pending ? "Waiting for admin approval" : "Your account was rejected"}
          </h1>
          <p className="mt-2 text-slate-500">
            {pending
              ? "Thank you for registering, " + user.name + ". You can post listings as soon as the admin approves your recruiter account."
              : "The admin did not approve this recruiter account, so you cannot post listings."}
          </p>
          <button onClick={refreshUser} className="btn btn-outline mt-6">Check status again</button>
        </div>
      </div>
    );
  }

  // ---------- Approved recruiter ----------
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Recruiter Dashboard</h1>
          <p className="mt-1 text-slate-500">{user.companyName} · manage your openings and applicants.</p>
        </div>
        <Link to="/recruiter/new" className="btn btn-primary">
          <Plus size={16} /> Post new listing
        </Link>
      </div>

      <div className="mt-6 space-y-3">
        <Alert type="success">{message}</Alert>
        <Alert type="error">{error}</Alert>
      </div>

      <div className="mt-6">
        {loading ? (
          <Loader />
        ) : listings.length === 0 ? (
          <div className="card flex flex-col items-center py-16 text-center">
            <FileX size={40} className="text-slate-300" />
            <h3 className="mt-3 text-lg font-bold text-slate-800">You have not posted anything yet</h3>
            <p className="mt-1 text-sm text-slate-500">Create your first job or internship listing.</p>
            <Link to="/recruiter/new" className="btn btn-primary mt-5">Post new listing</Link>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {listings.map((listing) => (
              <div key={listing._id} className="card flex flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-lg font-bold text-slate-900">{listing.title}</h3>
                  <div className="flex gap-1.5">
                    <StatusBadge status={listing.roleType} />
                    <StatusBadge status={listing.status} />
                  </div>
                </div>
                <p className="mt-2 text-sm text-slate-500">{listing.location} · {listing.stipend}</p>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                  <Calendar size={13} /> Last date: {formatDate(listing.lastDate)}
                </p>

                <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
                  <Link to={"/recruiter/listings/" + listing._id + "/applicants"} className="btn btn-primary btn-sm">
                    <Users size={14} /> Applicants ({listing.applicantCount})
                  </Link>
                  {listing.status === "active" && (
                    <button onClick={() => handleClose(listing._id)} className="btn btn-outline btn-sm">
                      Close listing
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default RecruiterDashboard;
