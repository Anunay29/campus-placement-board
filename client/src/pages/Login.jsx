import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";
import api, { getErrorMessage } from "../api";
import { useAuth } from "../context/AuthContext";
import { dashboardPath } from "../utils";
import Alert from "../components/Alert";

function Login() {
  const navigate = useNavigate();
  const { saveLogin } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      saveLogin(data.token, data.user);
      navigate(dashboardPath(data.user.role)); // go to the dashboard of that role
    } catch (err) {
      setError(getErrorMessage(err));
    }
    setLoading(false);
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-10">
      <div className="card w-full max-w-md p-8">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white">
          <LogIn size={22} />
        </span>
        <h1 className="mt-4 text-2xl font-extrabold text-slate-900">Welcome back</h1>
        <p className="mt-1 text-sm text-slate-500">Login as a student, recruiter or admin.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="label">Email</label>
            <input type="email" className="input" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="label">Password</label>
            <input type="password" className="input" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Alert type="error">{error}</Alert>
          <button className="btn btn-primary w-full py-3" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          New here? <Link to="/register" className="font-semibold text-indigo-600 hover:underline">Create an account</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
