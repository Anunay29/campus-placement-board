const Listing = require("../models/Listing");
const Application = require("../models/Application");

// Makes user text safe to use inside a regular expression (so "C++" does not break the search).
function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// POST /api/listings   (approved recruiter only)
async function createListing(req, res) {
  try {
    const { title, companyName, roleType, location, stipend, description, skills, lastDate } = req.body;

    if (!title || !roleType || !location || !stipend || !description || !lastDate) {
      return res.status(400).json({ message: "Please fill all the required fields" });
    }
    if (!["job", "internship"].includes(roleType)) {
      return res.status(400).json({ message: "Role type must be job or internship" });
    }

    // The last date must be a real date and not in the past.
    const deadline = new Date(lastDate);
    if (isNaN(deadline.getTime())) {
      return res.status(400).json({ message: "Last date is not a valid date" });
    }
    deadline.setUTCHours(23, 59, 59, 999); // the listing stays open for the whole last day
    if (deadline < new Date()) {
      return res.status(400).json({ message: "Last date cannot be in the past" });
    }

    // skills can arrive as an array or as a comma separated text like "React, Node"
    let skillList = [];
    if (Array.isArray(skills)) {
      skillList = skills;
    } else if (typeof skills === "string") {
      skillList = skills.split(",");
    }
    skillList = skillList.map((s) => s.trim()).filter((s) => s !== "");

    const listing = await Listing.create({
      title,
      companyName: companyName || req.user.companyName, // default: recruiter's own company
      roleType,
      location,
      stipend,
      description,
      skills: skillList,
      lastDate: deadline,
      recruiter: req.user._id,
    });

    res.status(201).json({ message: "Listing created", listing });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
}

// GET /api/listings   (public)
// Supports:  ?search=  ?type=  ?location=  ?page=  ?limit=
// The search, filter and pagination are all done by MongoDB, not in the frontend.
async function getListings(req, res) {
  try {
    const { search, type, location } = req.query;

    // Only active listings whose last date has not passed
    const filter = { status: "active", lastDate: { $gte: new Date() } };

    if (search && search.trim() !== "") {
      const pattern = new RegExp(escapeRegex(search.trim()), "i"); // "i" = ignore upper/lower case
      filter.$or = [{ title: pattern }, { companyName: pattern }];
    }
    if (type === "job" || type === "internship") {
      filter.roleType = type;
    }
    if (location && location.trim() !== "") {
      filter.location = new RegExp(escapeRegex(location.trim()), "i");
    }

    // Pagination: page 1 = first `limit` records, page 2 = next `limit` records ...
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 6, 1), 50);
    const skip = (page - 1) * limit;

    const total = await Listing.countDocuments(filter);
    const listings = await Listing.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit);

    res.json({
      listings,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
}

// GET /api/listings/mine   (recruiter) -> all listings created by the logged-in recruiter
async function getMyListings(req, res) {
  try {
    const listings = await Listing.find({ recruiter: req.user._id }).sort({ createdAt: -1 });

    // add the number of applicants to every listing
    const result = [];
    for (const listing of listings) {
      const applicantCount = await Application.countDocuments({ listing: listing._id });
      result.push({ ...listing.toObject(), applicantCount });
    }

    res.json({ listings: result });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
}

// GET /api/listings/:id   (public)
async function getListingById(req, res) {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }
    res.json({ listing, isOpen: listing.isOpen() });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
}

// PATCH /api/listings/:id/close   (recruiter who owns the listing)
async function closeListing(req, res) {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }
    if (listing.recruiter.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can close only your own listings" });
    }
    if (listing.status === "closed") {
      return res.status(400).json({ message: "Listing is already closed" });
    }

    listing.status = "closed";
    await listing.save();
    res.json({ message: "Listing closed. No new applications are allowed.", listing });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
}

// GET /api/listings/:id/applicants   (recruiter who owns the listing)
async function getApplicants(req, res) {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }
    if (listing.recruiter.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can view applicants only for your own listings" });
    }

    // populate() replaces the student id with the student's name and email
    const applicants = await Application.find({ listing: listing._id })
      .populate("student", "name email")
      .sort({ createdAt: -1 });

    res.json({ listing, applicants });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  createListing,
  getListings,
  getMyListings,
  getListingById,
  closeListing,
  getApplicants,
};
