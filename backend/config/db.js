// ============================================================
// config/db.js — MongoDB Connection Logic
// ============================================================
// This file has ONE job: connect our Node.js app to MongoDB.
// We keep database connection code separate from index.js so
// the main server file stays clean and easy to read.
// ============================================================

// Import mongoose — the library that helps Node.js talk to MongoDB
const mongoose = require("mongoose");

/**
 * connectDB — Async function that connects to MongoDB
 *
 * "Async" means it may take a few seconds to connect, so we use
 * async/await instead of blocking the whole program.
 */
const connectDB = async () => {
  try {
    // mongoose.connect() opens a connection using the URL from .env
    // process.env.MONGO_URI reads MONGO_URI from the .env file (never hardcode secrets here)
    await mongoose.connect(process.env.MONGO_URI);

    // If we reach this line, the connection succeeded
    console.log("MongoDB Connected Successfully");
  } catch (error) {
    // If connection fails (wrong URL, MongoDB not running, etc.), log the error
    console.log("MongoDB Connection Error:", error.message);

    // Exit the process with code 1 = "something went wrong"
    // This stops the server so we don't run without a database
    process.exit(1);
  }
};

// Export connectDB so index.js can import and call it
module.exports = connectDB;
