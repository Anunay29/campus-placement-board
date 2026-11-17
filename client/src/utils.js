// Small helper functions used in many pages.

// 5 Dec 2026
export function formatDate(date) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// Where should each role land after login?
export function dashboardPath(role) {
  if (role === "admin") return "/admin";
  if (role === "recruiter") return "/recruiter";
  return "/jobs"; // student
}
