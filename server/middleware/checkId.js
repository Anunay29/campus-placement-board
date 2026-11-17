// Used with router.param("id", checkId).
// If the :id in the URL is not a valid MongoDB id, we answer with a clear error
// instead of letting the database crash.
const mongoose = require("mongoose");

function checkId(req, res, next, id) {
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid id" });
  }
  next();
}

module.exports = checkId;
