// Admin page: three tabs -> Recruiters, Listings, Applications.
import { useEffect, useState } from "react";
import { Building2, ClipboardList, Clock, Trash2, Users } from "lucide-react";
import api, { getErrorMessage } from "../../api";
import StatusBadge from "../../components/StatusBadge";
import Loader from "../../components/Loader";
import Alert from "../../components/Alert";
import { formatDate } from "../../utils";

function AdminDashboard() {
  const [tab, setTab] = useState("recruiters");
  const [recruiterFilter, setRecruiterFilter] = useState("all");

  const [recruiters, setRecruiters] = useState([]);
  const [listings, setListings] = useState([]);
  const [applications, setApplications] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Load everything once when the page opens
  useEffect(() => {
    async function loadAll() {
      try {
        const [r, l, a] = await Promise.all([
          api.get("/admin/recruiters"),
          api.get("/admin/listings"),
          api.get("/admin/applications"),
        ]);
        setRecruiters(r.data.recruiters);
        setListings(l.data.listings);
        setApplications(a.data.applications);
      } catch (err) {
        setError(getErrorMessage(err));
      }
      setLoading(false);
    }
    loadAll();
  }, []);

  // Approve or reject a recruiter
  async function changeRecruiterStatus(id, status) {
    setError("");
    setMessage("");
    try {
      const { data } = await api.patch("/admin/recruiters/" + id + "/status", { status });
      setMessage(data.message);
      setRecruiters(recruiters.map((r) => (r._id === id ? { ...r, status } : r)));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  // Remove a listing that breaks the guidelines
  async function removeListing(id) {
    if (!window.confirm("Remove this listing and all its applications? This cannot be undone.")) return;
    setError("");
    setMessage("");
    try {
      const { data } = await api.delete("/admin/listings/" + id);
      setMessage(data.message);
      setListings(listings.filter((l) => l._id !== id));
      setApplications(applications.filter((a) => a.listing && a.listing._id !== id));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  const pendingCount = recruiters.filter((r) => r.status === "pending").length;
  const visibleRecruiters =
    recruiterFilter === "all" ? recruiters : recruiters.filter((r) => r.status === recruiterFilter);

  const stats = [
    { label: "Pending recruiters", value: pendingCount, icon: Clock, color: "bg-amber-50 text-amber-600" },
    { label: "Total recruiters", value: recruiters.length, icon: Users, color: "bg-indigo-50 text-indigo-600" },
    { label: "Total listings", value: listings.length, icon: Building2, color: "bg-emerald-50 text-emerald-600" },
    { label: "Total applications", value: applications.length, icon: ClipboardList, color: "bg-violet-50 text-violet-600" },
  ];

  const tabs = [
    { key: "recruiters", label: "Recruiters" },
    { key: "listings", label: "Listings" },
    { key: "applications", label: "Applications" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-extrabold text-slate-900">Admin Dashboard</h1>
      <p className="mt-1 text-slate-500">Approve recruiters and keep an eye on everything happening on the board.</p>

      {/* Stat cards */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card flex items-center gap-4 p-4">
            <span className={"flex h-11 w-11 shrink-0 items-center justify-center rounded-xl " + s.color}>
              <s.icon size={22} />
            </span>
            <div>
              <p className="text-2xl font-extrabold text-slate-900">{s.value}</p>
              <p className="text-xs font-medium text-slate-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="mt-8 flex gap-1 overflow-x-auto border-b border-slate-200">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={
              "cursor-pointer whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold transition " +
              (tab === t.key ? "border-indigo-600 text-indigo-700" : "border-transparent text-slate-500 hover:text-slate-800")
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        <Alert type="success">{message}</Alert>
        <Alert type="error">{error}</Alert>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="mt-4">
          {/* ---------- Recruiters tab ---------- */}
          {tab === "recruiters" && (
            <>
              <div className="mb-4 flex flex-wrap gap-2">
                {["all", "pending", "approved", "rejected"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setRecruiterFilter(f)}
                    className={
                      "cursor-pointer rounded-full px-4 py-1.5 text-sm font-semibold capitalize transition " +
                      (recruiterFilter === f ? "bg-indigo-600 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100")
                    }
                  >
                    {f}
                  </button>
                ))}
              </div>

              <div className="card overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Recruiter</th>
                      <th className="px-4 py-3">Company</th>
                      <th className="px-4 py-3">Registered</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {visibleRecruiters.map((r) => (
                      <tr key={r._id}>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-slate-800">{r.name}</p>
                          <p className="text-xs text-slate-500">{r.email}</p>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{r.companyName}</td>
                        <td className="px-4 py-3 text-slate-500">{formatDate(r.createdAt)}</td>
                        <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            {r.status !== "approved" && (
                              <button className="btn btn-success btn-sm" onClick={() => changeRecruiterStatus(r._id, "approved")}>Approve</button>
                            )}
                            {r.status !== "rejected" && (
                              <button className="btn btn-danger btn-sm" onClick={() => changeRecruiterStatus(r._id, "rejected")}>Reject</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {visibleRecruiters.length === 0 && (
                      <tr><td colSpan="5" className="px-4 py-10 text-center text-slate-400">No recruiters in this list.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ---------- Listings tab ---------- */}
          {tab === "listings" && (
            <div className="card overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Listing</th>
                    <th className="px-4 py-3">Posted by</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Last date</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {listings.map((l) => (
                    <tr key={l._id}>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-800">{l.title}</p>
                        <p className="text-xs text-slate-500">{l.companyName} · {l.location}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{l.recruiter ? l.recruiter.name : "-"}</td>
                      <td className="px-4 py-3"><StatusBadge status={l.roleType} /></td>
                      <td className="px-4 py-3 text-slate-500">{formatDate(l.lastDate)}</td>
                      <td className="px-4 py-3"><StatusBadge status={l.status} /></td>
                      <td className="px-4 py-3">
                        <button className="btn btn-danger btn-sm" onClick={() => removeListing(l._id)}>
                          <Trash2 size={13} /> Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                  {listings.length === 0 && (
                    <tr><td colSpan="6" className="px-4 py-10 text-center text-slate-400">No listings yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* ---------- Applications tab ---------- */}
          {tab === "applications" && (
            <div className="card overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Student</th>
                    <th className="px-4 py-3">Listing</th>
                    <th className="px-4 py-3">Applied on</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {applications.map((a) => (
                    <tr key={a._id}>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-800">{a.student ? a.student.name : "-"}</p>
                        <p className="text-xs text-slate-500">{a.student ? a.student.email : ""}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-700">{a.listing ? a.listing.title : "-"}</p>
                        <p className="text-xs text-slate-500">{a.listing ? a.listing.companyName : ""}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-500">{formatDate(a.createdAt)}</td>
                      <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                    </tr>
                  ))}
                  {applications.length === 0 && (
                    <tr><td colSpan="4" className="px-4 py-10 text-center text-slate-400">No applications yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
