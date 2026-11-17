const express = require("express");
const {
  applyToListing,
  getMyApplications,
  updateApplicationStatus,
} = require("../controllers/applicationController");
const { protect, allowRoles, approvedRecruiterOnly } = require("../middleware/auth");
const checkId = require("../middleware/checkId");

const router = express.Router();

router.param("id", checkId);

router.post("/", protect, allowRoles("student"), applyToListing);
router.get("/me", protect, allowRoles("student"), getMyApplications);
router.patch("/:id/status", protect, allowRoles("recruiter"), approvedRecruiterOnly, updateApplicationStatus);

module.exports = router;
