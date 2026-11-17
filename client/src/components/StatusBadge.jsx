// A small coloured label used for statuses everywhere in the app.
const colors = {
  // application status
  Applied: "bg-blue-50 text-blue-700 ring-blue-200",
  Shortlisted: "bg-amber-50 text-amber-700 ring-amber-200",
  Selected: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Rejected: "bg-rose-50 text-rose-700 ring-rose-200",
  // recruiter status
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
  approved: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  rejected: "bg-rose-50 text-rose-700 ring-rose-200",
  // listing status
  active: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  closed: "bg-slate-100 text-slate-600 ring-slate-200",
  // role type
  job: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  internship: "bg-violet-50 text-violet-700 ring-violet-200",
};

function StatusBadge({ status }) {
  const style = colors[status] || "bg-slate-100 text-slate-600 ring-slate-200";
  return (
    <span className={"inline-block rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset " + style}>
      {status}
    </span>
  );
}

export default StatusBadge;
