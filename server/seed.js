// Creates the first ADMIN account (and optionally demo data).
//   npm run seed        -> only the admin
//   npm run seed:demo   -> admin + a demo recruiter, a demo student and sample listings
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Listing = require("./models/Listing");

async function createUser(data) {
  const existing = await User.findOne({ email: data.email });
  if (existing) {
    console.log("Already exists:", data.email);
    return existing;
  }
  const password = await bcrypt.hash(data.password, 10);
  const user = await User.create({ ...data, password });
  console.log("Created", data.role + ":", data.email);
  return user;
}

async function run() {
  await mongoose.connect(process.env.MONGO_URI);

  await createUser({
    name: process.env.ADMIN_NAME || "Placement Admin",
    email: (process.env.ADMIN_EMAIL || "admin@example.com").toLowerCase(),
    password: process.env.ADMIN_PASSWORD || "ChangeMe123",
    role: "admin",
    status: "approved",
  });

  if (process.argv.includes("--demo")) {
    const recruiter = await createUser({
      name: "Riya Sharma",
      email: "recruiter@demo.com",
      password: "Recruiter@123",
      role: "recruiter",
      companyName: "TechNova Solutions",
      status: "approved",
    });
    await createUser({
      name: "Aman Verma",
      email: "student@demo.com",
      password: "Student@123",
      role: "student",
      status: "approved",
    });

    if ((await Listing.countDocuments({ recruiter: recruiter._id })) === 0) {
      const inThirtyDays = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const sample = [
        ["React Developer Intern", "internship", "Bengaluru", "₹15,000/month", ["React", "JavaScript", "CSS"]],
        ["Node.js Backend Developer", "job", "Pune", "₹6 LPA", ["Node.js", "Express", "MongoDB"]],
        ["UI/UX Design Intern", "internship", "Remote", "₹10,000/month", ["Figma", "Design"]],
        ["Data Analyst", "job", "Hyderabad", "₹5 LPA", ["SQL", "Excel", "Python"]],
        ["Full Stack Intern (MERN)", "internship", "Chandigarh", "₹12,000/month", ["MongoDB", "React", "Node.js"]],
        ["Java Software Engineer", "job", "Noida", "₹7 LPA", ["Java", "Spring", "SQL"]],
        ["Digital Marketing Intern", "internship", "Delhi", "₹8,000/month", ["SEO", "Content"]],
        ["QA Test Engineer", "job", "Mohali", "₹4.5 LPA", ["Testing", "Selenium"]],
      ];
      for (const [title, roleType, location, stipend, skills] of sample) {
        await Listing.create({
          title,
          companyName: "TechNova Solutions",
          roleType,
          location,
          stipend,
          skills,
          description:
            "We are looking for a motivated candidate to join our team as " + title +
            ". You will work on real projects, learn from experienced mentors and grow your skills.",
          lastDate: inThirtyDays,
          recruiter: recruiter._id,
        });
      }
      console.log("Created " + sample.length + " sample listings");
    }
  }

  await mongoose.disconnect();
  console.log("Seeding finished");
}

run().catch((err) => {
  console.log(err);
  process.exit(1);
});
