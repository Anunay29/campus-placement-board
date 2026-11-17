import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Briefcase, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false); // for the mobile menu

  function handleLogout() {
    logout();
    setMenuOpen(false);
    navigate("/");
  }

  // Links change according to the role of the logged-in user
  let links = [{ to: "/jobs", label: "Browse Openings" }];
  if (user && user.role === "student") {
    links.push({ to: "/student/applications", label: "My Applications" });
  }
  if (user && user.role === "recruiter") {
    links.push({ to: "/recruiter", label: "Recruiter Dashboard" });
  }
  if (user && user.role === "admin") {
    links.push({ to: "/admin", label: "Admin Dashboard" });
  }

  const linkClass = ({ isActive }) =>
    "rounded-lg px-3 py-2 text-sm font-semibold transition " +
    (isActive ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-100");

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2" onClick={() => setMenuOpen(false)}>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white">
            <Briefcase size={18} />
          </span>
          <span className="text-lg font-extrabold tracking-tight text-slate-900">
            Campus<span className="text-indigo-600">Connect</span>
          </span>
        </Link>

        {/* Desktop menu */}
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className={linkClass}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <div className="text-right leading-tight">
                <p className="text-sm font-semibold text-slate-800">{user.name}</p>
                <p className="text-xs capitalize text-slate-500">{user.role}</p>
              </div>
              <button onClick={handleLogout} className="btn btn-outline btn-sm">
                <LogOut size={14} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="space-y-1 border-t border-slate-200 bg-white px-4 py-3 md:hidden">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className={linkClass} onClick={() => setMenuOpen(false)}>
              {link.label}
            </NavLink>
          ))}
          <div className="flex gap-2 pt-2">
            {user ? (
              <button onClick={handleLogout} className="btn btn-outline w-full">
                <LogOut size={14} /> Logout ({user.name})
              </button>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline flex-1" onClick={() => setMenuOpen(false)}>Login</Link>
                <Link to="/register" className="btn btn-primary flex-1" onClick={() => setMenuOpen(false)}>Register</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
