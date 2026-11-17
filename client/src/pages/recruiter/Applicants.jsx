// Recruiter page: applicants of ONE listing, with buttons to change their status.
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, UserX } from "lucide-react";
import api, { getErrorMessage } from "../../api";
import StatusBadge from "../../components/StatusBadge";
import Loader from "../../components/Loader";
import Alert from "../../components/Alert";
import { formatDate } from "../../utils";

function Applicants() {
  const { id } = useParams();

  const [listing, setListing] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    api
      .get("/listings/" + id + "/applicants")
      .then((res) => {
        setListing(res.data.listing);
        setApplicants(res.data.applicants);
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id]);

  // Change the status of one applicant
  async function changeStatus(applicationId, newStatus) {
    setError("");
    setMessage("");
    try {
      const { data } = await api.patch("/applications/" + applicationId + "/status", { status: newStatus });
      setMessage(data.message);
      setApplicants(applicants.map((a) => (a._id === applicationId ? { ...a, status: newStatus } : a)));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Link to="/recruiter" className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-indigo-600">
        <ArrowLeft size={16} /> Back to dashboard
      </Link>

      {listing && (
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-slate-900">Applicants</h1>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-slate-500">
            {listing.title} <StatusBadge status={listing.status} />
          </p>
        </div>
      )}

      <div className="mb-4 space-y-3">
        <Alert type="success">{message}</Alert>
        <Alert type="error">{error}</Alert>
      </div>

      {loading ? (
        <Loader />
      ) : applicants.length === 0 && !error ? (
        <div className="card flex flex-col items-center py-16 text-center">
          <UserX size={40} className="text-slate-300" />
          <h3 className="mt-3 text-lg font-bold text-slate-800">No applicants yet</h3>
          <p className="mt-1 text-sm text-slate-500">Students who apply will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {applicants.map((app) => (
            <div key={app._id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-bold text-slate-900">{app.student.name}</p>
                  <p className="text-sm text-slate-500">{app.student.email} · Applied {formatDate(app.createdAt)}</p>
                </div>
                <StatusBadge status={app.status} />
              </div>

              <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">{app.coverNote}</p>

              {/* Buttons depend on the current status (the application lifecycle) */}
              <div className="mt-4 flex flex-wrap gap-2">
                {app.status === "Applied" && (
                  <>
                    <button className="btn btn-primary btn-sm" onClick={() => changeStatus(app._id, "Shortlisted")}>Shortlist</button>
                    <button className="btn btn-danger btn-sm" onClick={() => changeStatus(app._id, "Rejected")}>Reject</button>
                  </>
                )}
                {app.status === "Shortlisted" && (
                  <button className="btn btn-success btn-sm" onClick={() => changeStatus(app._id, "Selected")}>Select candidate</button>
                )}
                {(app.status === "Selected" || app.status === "Rejected") && (
                  <p className="text-xs text-slate-400">Final decision made. Status cannot be changed.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Applicants;
