import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GraduationCap, Building2, ShieldCheck } from "lucide-react";
import api, { getErrorMessage } from "../api";
import { useAuth } from "../context/AuthContext";
import { dashboardPath } from "../utils";
import Alert from "../components/Alert";

function Register() {
  const navigate = useNavigate();
  const { saveLogin } = useAuth();

  // One state object holds all the form fields
  const [form, setForm] = useState({
    role: "student",
    name: "",
    email: "",
    password: "",
    companyName: "",
    adminCode: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Updates one field of the form while typing
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    // Basic validation (the server checks again)
    if (!form.name || !form.email || !form.password) {
      setError("Please fill name, email and password.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (form.role === "recruiter" && !form.companyName) {
      setError("Please enter your company name.");
      return;
    }
    if (form.role === "admin" && !form.adminCode) {
      setError("Please enter the admin secret code.");
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post("/auth/register", form);
      saveLogin(data.token, data.user);
      navigate(dashboardPath(data.user.role));
    } catch (err) {
      setError(getErrorMessage(err));
    }
    setLoading(false);
  }

  const roles = [
    { value: "student", label: "Student", icon: GraduationCap },
    { value: "recruiter", label: "Recruiter", icon: Building2 },
    { value: "admin", label: "Admin", icon: ShieldCheck },
  ];

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-10">
      <div className="card w-full max-w-lg p-8">
        <h1 className="text-2xl font-extrabold text-slate-900">Create your account</h1>
        <p className="mt-1 text-sm text-slate-500">Choose your role to get started.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Role selector */}
          <div className="grid grid-cols-3 gap-3">
            {roles.map((r) => (
              <button
                type="button"
                key={r.value}
                onClick={() => setForm({ ...form, role: r.value })}
                className={
                  "flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border-2 py-3 text-sm font-semibold transition " +
                  (form.role === r.value
                    ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                    : "border-slate-200 text-slate-600 hover:border-slate-300")
                }
              >
                <r.icon size={20} />
                {r.label}
              </button>
            ))}
          </div>

          <div>
            <label className="label">Full name</label>
            <input name="name" className="input" placeholder="Your name" value={form.name} onChange={handleChange} />
          </div>
          <div>
            <label className="label">Email</label>
            <input name="email" type="email" className="input" placeholder="you@example.com" value={form.email} onChange={handleChange} />
          </div>
          <div>
            <label className="label">Password</label>
            <input name="password" type="password" className="input" placeholder="At least 6 characters" value={form.password} onChange={handleChange} />
          </div>

          {/* Extra field only for recruiters */}
          {form.role === "recruiter" && (
            <>
              <div>
                <label className="label">Company name</label>
                <input name="companyName" className="input" placeholder="e.g. TechNova Solutions" value={form.companyName} onChange={handleChange} />
              </div>
              <Alert type="info">Recruiter accounts must be approved by the admin before you can post listings.</Alert>
            </>
          )}

          {/* Extra field only for admins */}
          {form.role === "admin" && (
            <div>
              <label className="label">Admin secret code</label>
              <input name="adminCode" type="password" className="input" placeholder="Code provided by the institute" value={form.adminCode} onChange={handleChange} />
            </div>
          )}

          <Alert type="error">{error}</Alert>
          <button className="btn btn-primary w-full py-3" disabled={loading}>
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account? <Link to="/login" className="font-semibold text-indigo-600 hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
