// App.jsx lists all the pages (routes) of the website.
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Jobs from "./pages/Jobs";
import ListingDetail from "./pages/ListingDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MyApplications from "./pages/student/MyApplications";
import RecruiterDashboard from "./pages/recruiter/RecruiterDashboard";
import NewListing from "./pages/recruiter/NewListing";
import Applicants from "./pages/recruiter/Applicants";
import AdminDashboard from "./pages/admin/AdminDashboard";

function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        <Routes>
          {/* Public pages */}
          <Route path="/" element={<Home />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:id" element={<ListingDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Student only */}
          <Route
            path="/student/applications"
            element={
              <ProtectedRoute roles={["student"]}>
                <MyApplications />
              </ProtectedRoute>
            }
          />

          {/* Recruiter only */}
          <Route
            path="/recruiter"
            element={
              <ProtectedRoute roles={["recruiter"]}>
                <RecruiterDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recruiter/new"
            element={
              <ProtectedRoute roles={["recruiter"]}>
                <NewListing />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recruiter/listings/:id/applicants"
            element={
              <ProtectedRoute roles={["recruiter"]}>
                <Applicants />
              </ProtectedRoute>
            }
          />

          {/* Admin only */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Any unknown address goes to the home page */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;
