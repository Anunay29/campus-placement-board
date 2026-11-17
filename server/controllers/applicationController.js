const Application = require("../models/Application");
const Listing = require("../models/Listing");

// Allowed status changes (the application lifecycle):
//   Applied     -> Shortlisted or Rejected
//   Shortlisted -> Selected
//   Selected / Rejected -> final, cannot change
const allowedChanges = {
  Applied: ["Shortlisted", "Rejected"],
  Shortlisted: ["Selected"],
  Selected: [],
  Rejected: [],
};

// POST /api/applications   (student)   body: { listingId, coverNote }
async function applyToListing(req, res) {
  try {
    const { listingId, coverNote } = req.body;

    if (!listingId || !coverNote || coverNote.trim().length < 10) {
      return res.status(400).json({ message: "Cover note is required (at least 10 characters)" });
    }
    if (coverNote.length > 1000) {
      return res.status(400).json({ message: "Cover note must be under 1000 characters" });
    }

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }
    if (!listing.isOpen()) {
      return res.status(400).json({ message: "This listing is closed or its last date has passed" });
    }

    // A student cannot apply to the same listing twice
    const already = await Application.findOne({ listing: listingId, student: req.user._id });
    if (already) {
      return res.status(409).json({ message: "You have already applied to this listing" });
    }

    const application = await Application.create({
      listing: listingId,
      student: req.user._id,
      coverNote: coverNote.trim(),
    });

    res.status(201).json({ message: "Application submitted", application });
  } catch (error) {
    // 11000 = duplicate key error from the unique index (safety net for double clicks)
    if (error.code === 11000) {
      return res.status(409).json({ message: "You have already applied to this listing" });
    }
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
}

// GET /api/applications/me   (student) -> the student's own applications
async function getMyApplications(req, res) {
  try {
    const applications = await Application.find({ student: req.user._id })
      .populate("listing", "title companyName location roleType stipend status lastDate")
      .sort({ createdAt: -1 });

    res.json({ applications });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
}

// PATCH /api/applications/:id/status   (recruiter)   body: { status }
async function updateApplicationStatus(req, res) {
  try {
    const { status } = req.body;

    const application = await Application.findById(req.params.id).populate("listing");
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // The recruiter must own the listing this application belongs to
    if (application.listing.recruiter.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "This application is not for your listing" });
    }

    if (!allowedChanges[application.status].includes(status)) {
      return res.status(400).json({
        message: "Cannot change status from " + application.status + " to " + status,
      });
    }

    application.status = status;
    await application.save();
    res.json({ message: "Status updated to " + status, application });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = { applyToListing, getMyApplications, updateApplicationStatus };
