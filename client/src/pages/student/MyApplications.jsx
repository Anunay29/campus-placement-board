// Student page: all applications of the logged-in student with their current status.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Building2, Calendar, ClipboardList, MapPin } from "lucide-react";
import api, { getErrorMessage } from "../../api";
import StatusBadge from "../../components/StatusBadge";
import Loader from "../../components/Loader";
import Alert from "../../components/Alert";
import { formatDate } from "../../utils";

function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/applications/me")
      .then((res) => setApplications(res.data.applications))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  // Count applications of each status for the small summary cards
  function countStatus(status) {
    return applications.filter((app) => app.status === status).length;
  }

  const summary = [
    { label: "Applied", value: countStatus("Applied"), color: "text-blue-600" },
    { label: "Shortlisted", value: countStatus("Shortlisted"), color: "text-amber-600" },
    { label: "Selected", value: countStatus("Selected"), color: "text-emerald-600" },
    { label: "Rejected", value: countStatus("Rejected"), color: "text-rose-600" },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-extrabold text-slate-900">My Applications</h1>
      <p className="mt-1 text-slate-500">Track the status of every opening you applied to.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {summary.map((item) => (
          <div key={item.label} className="card p-4">
            <p className="text-sm font-medium text-slate-500">{item.label}</p>
            <p className={"mt-1 text-3xl font-extrabold " + item.color}>{item.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <Alert type="error">{error}</Alert>

        {loading ? (
          <Loader />
        ) : applications.length === 0 && !error ? (
          <div className="card flex flex-col items-center py-16 text-center">
            <ClipboardList size={40} className="text-slate-300" />
            <h3 className="mt-3 text-lg font-bold text-slate-800">No applications yet</h3>
            <p className="mt-1 text-sm text-slate-500">Browse the openings and apply to get started.</p>
            <Link to="/jobs" className="btn btn-primary mt-5">Browse openings</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div key={app._id} className="card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    {app.listing ? (
                      <Link to={"/jobs/" + app.listing._id} className="text-lg font-bold text-slate-900 hover:text-indigo-700">
                        {app.listing.title}
                      </Link>
                    ) : (
                      <p className="text-lg font-bold text-slate-400">Listing removed by admin</p>
                    )}
                    {app.listing && (
                      <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-500">
                        <span className="flex items-center gap-1.5"><Building2 size={14} /> {app.listing.companyName}</span>
                        <span className="flex items-center gap-1.5"><MapPin size={14} /> {app.listing.location}</span>
                      </div>
                    )}
                  </div>
                  <StatusBadge status={app.status} />
                </div>

                <p className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
                  <span className="font-semibold text-slate-700">Your cover note: </span>
                  {app.coverNote}
                </p>
                <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
                  <Calendar size={13} /> Applied on {formatDate(app.createdAt)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyApplications;
