// ============================================================
// index.js — Main Server Entry Point
// ============================================================
// This is the file you run to start the backend server.
// It only sets up Express, middleware, DB connection, and
// one test route. Business logic goes in other folders later.
// ============================================================

// Import Express — the framework that handles HTTP requests/responses
const express = require("express");

// Import mongoose — required by the assignment; actual connect() runs inside config/db.js
const mongoose = require("mongoose");

// Import cors — allows our React frontend (different port) to call this API later
const cors = require("cors");

// Import dotenv — loads variables from the .env file into process.env
const dotenv = require("dotenv");

// Import our custom function that connects to MongoDB (see config/db.js)
const connectDB = require("./config/db");

// Load environment variables from .env into process.env (must run before we use PORT, MONGO_URI, etc.)
dotenv.config();

// Create an Express application instance — "app" is our web server
const app = express();

// ----- Middleware (code that runs on EVERY request before your route handler) -----

// Enable CORS so browsers can request this API from another origin (e.g. React on port 3000)
app.use(cors());

// Parse incoming JSON request bodies and put the data on req.body
app.use(express.json());

// ----- Database Connection -----

// Call connectDB to connect to MongoDB using MONGO_URI from .env
connectDB();

// ----- Routes -----

// Simple test route: when someone visits GET http://localhost:5000/ they get a JSON message
app.get("/", (req, res) => {
  // res.json() sends a JSON response back to the client (browser or Postman)
  res.json({ message: "Server is running!" });
});

// ----- Start Server -----

// Read PORT from .env; if missing, use 5000 as the default port number
const PORT = process.env.PORT || 5000;

// Tell Express to listen for incoming HTTP requests on this port
app.listen(PORT, () => {
  // This runs once when the server has started successfully
  console.log(`Server is running on port ${PORT}`);
});
