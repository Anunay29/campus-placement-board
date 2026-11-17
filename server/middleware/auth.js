// Reusable middleware for login and role checks.
// We write the checks ONCE here and plug them into any route that needs them.
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// 1) protect: makes sure the request has a valid login token.
//    The frontend sends it in the header:  Authorization: Bearer <token>
async function protect(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Please login first" });
  }

  try {
    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // throws error if token is fake/expired
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User no longer exists" });
    }

    req.user = user; // now every route after this can use req.user
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token. Please login again" });
  }
}

// 2) allowRoles("admin") or allowRoles("recruiter", "student") ...
//    Lets only the given roles continue. Everyone else gets 403 (Forbidden).
function allowRoles(...roles) {
  return function (req, res, next) {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied for your role" });
    }
    next();
  };
}

// 3) approvedRecruiterOnly: a recruiter must be approved by the admin before posting anything.
function approvedRecruiterOnly(req, res, next) {
  if (req.user.status !== "approved") {
    return res.status(403).json({
      message: "Your recruiter account is " + req.user.status + ". Admin approval is required.",
    });
  }
  next();
}

module.exports = { protect, allowRoles, approvedRecruiterOnly };
