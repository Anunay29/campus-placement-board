const express = require("express");
const {
  createListing,
  getListings,
  getMyListings,
  getListingById,
  closeListing,
  getApplicants,
} = require("../controllers/listingController");
const { protect, allowRoles, approvedRecruiterOnly } = require("../middleware/auth");
const checkId = require("../middleware/checkId");

const router = express.Router();

router.param("id", checkId);

// A small bundle of checks used by all recruiter routes
const recruiterOnly = [protect, allowRoles("recruiter"), approvedRecruiterOnly];

router.get("/", getListings); // public
router.post("/", recruiterOnly, createListing);
router.get("/mine", recruiterOnly, getMyListings); // must be above "/:id"
router.get("/:id", getListingById); // public
router.patch("/:id/close", recruiterOnly, closeListing);
router.get("/:id/applicants", recruiterOnly, getApplicants);

module.exports = router;
