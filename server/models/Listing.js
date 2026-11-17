// A Listing is a job or internship posted by a recruiter.
const mongoose = require("mongoose");

const listingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    companyName: { type: String, required: true, trim: true },
    roleType: { type: String, enum: ["job", "internship"], required: true },
    location: { type: String, required: true, trim: true },
    stipend: { type: String, required: true, trim: true }, // text, e.g. "₹10,000/month"
    description: { type: String, required: true },
    skills: [{ type: String, trim: true }], // list of skills, e.g. ["React", "Node"]
    lastDate: { type: Date, required: true }, // last date to apply
    status: { type: String, enum: ["active", "closed"], default: "active" },
    recruiter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// A listing accepts applications only if it is "active" AND the last date has not passed.
listingSchema.methods.isOpen = function () {
  return this.status === "active" && this.lastDate >= new Date();
};

module.exports = mongoose.model("Listing", listingSchema);
