const mongoose = require("mongoose");

async function connectDatabase(uri) {
  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB successfully.");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

module.exports = connectDatabase;
