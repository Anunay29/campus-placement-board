import { Link } from "react-router-dom";
import { Building2, Calendar, MapPin, Wallet } from "lucide-react";
import StatusBadge from "./StatusBadge";
import { formatDate } from "../utils";

// One job/internship card shown on the Browse page and the Home page.
function ListingCard({ listing }) {
  return (
    <Link
      to={"/jobs/" + listing._id}
      className="card group flex flex-col p-5 transition hover:-translate-y-1 hover:border-indigo-300 hover:shadow-lg"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-bold leading-snug text-slate-900 group-hover:text-indigo-700">
          {listing.title}
        </h3>
        <StatusBadge status={listing.roleType} />
      </div>

      <p className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-600">
        <Building2 size={15} className="text-slate-400" /> {listing.companyName}
      </p>

      <div className="mt-3 space-y-1.5 text-sm text-slate-500">
        <p className="flex items-center gap-2">
          <MapPin size={15} className="text-slate-400" /> {listing.location}
        </p>
        <p className="flex items-center gap-2">
          <Wallet size={15} className="text-slate-400" /> {listing.stipend}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {listing.skills.slice(0, 4).map((skill) => (
          <span key={skill} className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
            {skill}
          </span>
        ))}
      </div>

      <p className="mt-auto flex items-center gap-2 border-t border-slate-100 pt-4 text-xs text-slate-500">
        <Calendar size={14} /> Apply before {formatDate(listing.lastDate)}
      </p>
    </Link>
  );
}

export default ListingCard;
