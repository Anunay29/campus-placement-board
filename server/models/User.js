// A User can be an admin, a recruiter or a student (the "role" field tells which one).
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true }, // stored as a bcrypt hash, never as plain text
    role: { type: String, enum: ["admin", "recruiter", "student"], required: true },
    companyName: { type: String, trim: true }, // only used for recruiters

    // Recruiters start as "pending" and must be approved by an admin.
    // Admins and students are "approved" automatically.
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "approved" },
  },
  { timestamps: true } // adds createdAt and updatedAt automatically
);

module.exports = mongoose.model("User", userSchema);
