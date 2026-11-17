// Recruiter page: form to create a new job / internship listing.
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import api, { getErrorMessage } from "../../api";
import { useAuth } from "../../context/AuthContext";
import Alert from "../../components/Alert";

function NewListing() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [form, setForm] = useState({
    title: "",
    companyName: user.companyName || "",
    roleType: "internship",
    location: "",
    stipend: "",
    skills: "",
    lastDate: "",
    description: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    // basic validation
    if (!form.title || !form.companyName || !form.location || !form.stipend || !form.lastDate || !form.description) {
      setError("Please fill all the fields (skills are optional).");
      return;
    }

    setLoading(true);
    try {
      await api.post("/listings", form);
      navigate("/recruiter");
    } catch (err) {
      setError(getErrorMessage(err));
    }
    setLoading(false);
  }

  // The date picker should not allow dates in the past
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link to="/recruiter" className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-indigo-600">
        <ArrowLeft size={16} /> Back to dashboard
      </Link>

      <div className="card p-6 md:p-8">
        <h1 className="text-2xl font-extrabold text-slate-900">Post a new listing</h1>
        <p className="mt-1 text-sm text-slate-500">Fill in the details students will see.</p>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="label">Title</label>
            <input name="title" className="input" placeholder="e.g. React Developer Intern" value={form.title} onChange={handleChange} />
          </div>

          <div>
            <label className="label">Company name</label>
            <input name="companyName" className="input" value={form.companyName} onChange={handleChange} />
          </div>
          <div>
            <label className="label">Role type</label>
            <select name="roleType" className="input" value={form.roleType} onChange={handleChange}>
              <option value="internship">Internship</option>
              <option value="job">Job</option>
            </select>
          </div>

          <div>
            <label className="label">Location</label>
            <input name="location" className="input" placeholder="e.g. Chandigarh or Remote" value={form.location} onChange={handleChange} />
          </div>
          <div>
            <label className="label">Stipend / Salary</label>
            <input name="stipend" className="input" placeholder="e.g. ₹10,000/month" value={form.stipend} onChange={handleChange} />
          </div>

          <div>
            <label className="label">Skills required</label>
            <input name="skills" className="input" placeholder="React, Node.js, MongoDB" value={form.skills} onChange={handleChange} />
            <p className="mt-1 text-xs text-slate-400">Separate skills with commas.</p>
          </div>
          <div>
            <label className="label">Last date to apply</label>
            <input name="lastDate" type="date" min={today} className="input" value={form.lastDate} onChange={handleChange} />
          </div>

          <div className="md:col-span-2">
            <label className="label">Description</label>
            <textarea name="description" className="input min-h-36 resize-y" placeholder="Describe the role, responsibilities and who should apply..." value={form.description} onChange={handleChange} />
          </div>

          <div className="space-y-4 md:col-span-2">
            <Alert type="error">{error}</Alert>
            <div className="flex gap-3">
              <button className="btn btn-primary px-8" disabled={loading}>
                {loading ? "Posting..." : "Post listing"}
              </button>
              <Link to="/recruiter" className="btn btn-outline">Cancel</Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NewListing;
