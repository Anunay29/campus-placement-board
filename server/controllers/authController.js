const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Creates a login token that is valid for 7 days.
function makeToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

// Only send safe fields to the frontend (never the password).
function userData(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    companyName: user.companyName,
    status: user.status,
  };
}

// POST /api/auth/register   (role is passed in the body)
async function register(req, res) {
  try {
    const { name, email, password, role, companyName, adminCode } = req.body;

    // ---- basic validation ----
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "Name, email, password and role are required" });
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ message: "Please enter a valid email" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }
    if (!["admin", "recruiter", "student"].includes(role)) {
      return res.status(400).json({ message: "Role must be admin, recruiter or student" });
    }
    if (role === "recruiter" && !companyName) {
      return res.status(400).json({ message: "Company name is required for recruiters" });
    }
    // Admin registration is protected by a secret code, so that not everyone can become admin.
    if (role === "admin" && adminCode !== process.env.ADMIN_SECRET) {
      return res.status(403).json({ message: "Wrong admin secret code" });
    }

    // ---- email must be new ----
    const alreadyExists = await User.findOne({ email: email.toLowerCase() });
    if (alreadyExists) {
      return res.status(409).json({ message: "This email is already registered" });
    }

    // ---- hash the password and save ----
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      companyName: role === "recruiter" ? companyName : undefined,
      status: role === "recruiter" ? "pending" : "approved", // recruiters wait for admin
    });

    const message =
      role === "recruiter"
        ? "Registered! Your account will be active after admin approval."
        : "Registered successfully";

    res.status(201).json({ message, token: makeToken(user), user: userData(user) });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
}

// POST /api/auth/login
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    const passwordMatches = user && (await bcrypt.compare(password, user.password));

    if (!passwordMatches) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({ message: "Login successful", token: makeToken(user), user: userData(user) });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
}

// GET /api/auth/me  -> returns the latest details of the logged-in user.
// The frontend uses it to refresh the recruiter's approval status.
async function getMe(req, res) {
  res.json({ user: userData(req.user) });
}

module.exports = { register, login, getMe };
