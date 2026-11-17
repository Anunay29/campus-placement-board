// Connects our app to MongoDB using the address stored in the .env file.
const mongoose = require("mongoose");

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
  } catch (error) {
    console.log("MongoDB connection failed:", error.message);
    process.exit(1); // stop the server if the database is not available
  }
}

module.exports = connectDB;
