const express = require("express");
const {
  getRecruiters,
  updateRecruiterStatus,
  getAllListings,
  deleteListing,
  getAllApplications,
} = require("../controllers/adminController");
const { protect, allowRoles } = require("../middleware/auth");
const checkId = require("../middleware/checkId");

const router = express.Router();

router.param("id", checkId); // validates every :id in this file

// Every admin route needs: logged in + role "admin"
router.use(protect, allowRoles("admin"));

router.get("/recruiters", getRecruiters);
router.patch("/recruiters/:id/status", updateRecruiterStatus);
router.get("/listings", getAllListings);
router.delete("/listings/:id", deleteListing);
router.get("/applications", getAllApplications);

module.exports = router;
