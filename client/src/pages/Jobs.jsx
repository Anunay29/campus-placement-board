// Public page: browse, search, filter and paginate listings.
// IMPORTANT: searching, filtering and pagination are done by the SERVER (MongoDB),
// we only send the query parameters like ?search=react&type=job&page=2&limit=6
import { useEffect, useState } from "react";
import { Search, MapPin, SearchX } from "lucide-react";
import api, { getErrorMessage } from "../api";
import ListingCard from "../components/ListingCard";
import Pagination from "../components/Pagination";
import Loader from "../components/Loader";
import Alert from "../components/Alert";

const LIMIT = 6; // listings per page

function Jobs() {
  // what the user is typing in the boxes
  const [searchText, setSearchText] = useState("");
  const [locationText, setLocationText] = useState("");

  // the filters that are actually applied (changed when the user presses "Search")
  const [filters, setFilters] = useState({ search: "", location: "", type: "" });
  const [page, setPage] = useState(1);

  const [listings, setListings] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Whenever the filters or the page change, ask the server for fresh data
  useEffect(() => {
    async function loadListings() {
      setLoading(true);
      setError("");
      try {
        const { data } = await api.get("/listings", {
          params: {
            search: filters.search,
            location: filters.location,
            type: filters.type,
            page: page,
            limit: LIMIT,
          },
        });
        setListings(data.listings);
        setTotalPages(data.totalPages);
        setTotal(data.total);
      } catch (err) {
        setError(getErrorMessage(err));
      }
      setLoading(false);
    }
    loadListings();
  }, [filters, page]);

  function handleSearch(e) {
    e.preventDefault(); // stop the browser from reloading the page
    setFilters({ ...filters, search: searchText.trim(), location: locationText.trim() });
    setPage(1); // a new search always starts from page 1
  }

  function changeType(type) {
    setFilters({ ...filters, type: type });
    setPage(1);
  }

  function clearAll() {
    setSearchText("");
    setLocationText("");
    setFilters({ search: "", location: "", type: "" });
    setPage(1);
  }

  const typeButtons = [
    { value: "", label: "All" },
    { value: "job", label: "Jobs" },
    { value: "internship", label: "Internships" },
  ];

  const hasFilters = filters.search || filters.location || filters.type;

  return (
    <div>
      {/* Header with search */}
      <section className="bg-slate-900 py-12 text-white">
        <div className="mx-auto max-w-6xl px-4">
          <h1 className="text-3xl font-extrabold md:text-4xl">Find your next opportunity</h1>
          <p className="mt-2 text-slate-300">Search by job title or company, then filter by type and location.</p>

          <form onSubmit={handleSearch} className="mt-6 grid gap-3 rounded-2xl bg-white p-3 shadow-xl md:grid-cols-[1fr_1fr_auto]">
            <div className="relative">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                className="input pl-10"
                placeholder="Job title or company name"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
            <div className="relative">
              <MapPin size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                className="input pl-10"
                placeholder="Location (e.g. Pune)"
                value={locationText}
                onChange={(e) => setLocationText(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary px-8">Search</button>
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        {/* Type filter + result count */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1">
            {typeButtons.map((btn) => (
              <button
                key={btn.value}
                onClick={() => changeType(btn.value)}
                className={
                  "cursor-pointer rounded-lg px-4 py-1.5 text-sm font-semibold transition " +
                  (filters.type === btn.value ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100")
                }
              >
                {btn.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 text-sm text-slate-500">
            {!loading && <span>{total} opening{total === 1 ? "" : "s"} found</span>}
            {hasFilters && (
              <button onClick={clearAll} className="cursor-pointer font-semibold text-indigo-600 hover:underline">
                Clear filters
              </button>
            )}
          </div>
        </div>

        <Alert type="error">{error}</Alert>

        {loading ? (
          <Loader text="Loading openings..." />
        ) : listings.length === 0 && !error ? (
          <div className="card flex flex-col items-center py-16 text-center">
            <SearchX size={40} className="text-slate-300" />
            <h3 className="mt-3 text-lg font-bold text-slate-800">No openings found</h3>
            <p className="mt-1 text-sm text-slate-500">Try a different keyword, location or filter.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <ListingCard key={listing._id} listing={listing} />
            ))}
          </div>
        )}

        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </section>
    </div>
  );
}

export default Jobs;
