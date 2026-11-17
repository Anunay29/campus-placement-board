import { ChevronLeft, ChevronRight } from "lucide-react";

// Previous / Next buttons. The page number is controlled by the parent page.
function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-8 flex items-center justify-center gap-3">
      <button className="btn btn-outline btn-sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        <ChevronLeft size={16} /> Previous
      </button>
      <span className="text-sm font-medium text-slate-600">
        Page {page} of {totalPages}
      </span>
      <button className="btn btn-outline btn-sm" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
        Next <ChevronRight size={16} />
      </button>
    </div>
  );
}

export default Pagination;
