// An Application is one student applying to one listing.
const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    listing: { type: mongoose.Schema.Types.ObjectId, ref: "Listing", required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    coverNote: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["Applied", "Shortlisted", "Selected", "Rejected"],
      default: "Applied",
    },
  },
  { timestamps: true }
);

// This rule makes it impossible for the same student to apply to the same listing twice.
applicationSchema.index({ listing: 1, student: 1 }, { unique: true });

module.exports = mongoose.model("Application", applicationSchema);
