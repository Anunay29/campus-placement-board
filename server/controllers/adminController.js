const User = require("../models/User");
const Listing = require("../models/Listing");
const Application = require("../models/Application");

// GET /api/admin/recruiters        (optional filter: ?status=pending|approved|rejected)
async function getRecruiters(req, res) {
  try {
    const filter = { role: "recruiter" };
    if (["pending", "approved", "rejected"].includes(req.query.status)) {
      filter.status = req.query.status;
    }

    const recruiters = await User.find(filter).select("-password").sort({ createdAt: -1 });
    res.json({ recruiters });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
}

// PATCH /api/admin/recruiters/:id/status     body: { status: "approved" | "rejected" }
async function updateRecruiterStatus(req, res) {
  try {
    const { status } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Status must be approved or rejected" });
    }

    const recruiter = await User.findOne({ _id: req.params.id, role: "recruiter" }).select("-password");
    if (!recruiter) {
      return res.status(404).json({ message: "Recruiter not found" });
    }

    recruiter.status = status;
    await recruiter.save();
    res.json({ message: "Recruiter " + status, recruiter });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
}

// GET /api/admin/listings -> ALL listings (active + closed)
async function getAllListings(req, res) {
  try {
    const listings = await Listing.find().populate("recruiter", "name email").sort({ createdAt: -1 });
    res.json({ listings });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
}

// DELETE /api/admin/listings/:id  -> remove a listing that breaks the guidelines
async function deleteListing(req, res) {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    await Application.deleteMany({ listing: listing._id }); // remove its applications too
    await listing.deleteOne();
    res.json({ message: "Listing removed" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
}

// GET /api/admin/applications -> every application across all listings
async function getAllApplications(req, res) {
  try {
    const applications = await Application.find()
      .populate("listing", "title companyName")
      .populate("student", "name email")
      .sort({ createdAt: -1 });

    res.json({ applications });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  getRecruiters,
  updateRecruiterStatus,
  getAllListings,
  deleteListing,
  getAllApplications,
};
