// Starting point of the backend. Run with:  npm run dev
require("dotenv").config(); // loads values from the .env file
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

// CORS: allows our React frontend (running on another address) to call this API.
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173").split(",");
app.use(cors({ origin: allowedOrigins }));

app.use(express.json()); // lets us read JSON sent in request bodies (req.body)

// Test route to check that the server is alive
app.get("/", (req, res) => {
  res.json({ message: "Campus Placement & Internship Board API is running" });
});

// All API routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/listings", require("./routes/listingRoutes"));
app.use("/api/applications", require("./routes/applicationRoutes"));

// If no route matched
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Last safety net for unexpected errors
app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).json({ message: "Something went wrong on the server" });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log("Server running on port " + PORT));
});
