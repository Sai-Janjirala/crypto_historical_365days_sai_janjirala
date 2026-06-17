const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

const coinRoutes = require("./routes/coinRoutes");
const searchRoutes = require("./routes/searchRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const statsRoutes = require("./routes/statsRoutes");
const authRoutes = require("./routes/authRoutes");
const jwtRoutes = require("./routes/jwtRoutes");
const adminRoutes = require("./routes/adminRoutes");
const protectedRoutes = require("./routes/protectedRoutes");
const middlewareRoutes = require("./routes/middlewareRoutes");

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.get("/", (req, res) => {
  res.json({ message: "Server is running!" });
});

app.use("/coins", coinRoutes);
app.use("/search", searchRoutes);
app.use("/analytics", analyticsRoutes);
app.use("/stats", statsRoutes);
app.use("/auth", authRoutes);
app.use("/jwt", jwtRoutes);
app.use("/admin", adminRoutes);
app.use("/protected", protectedRoutes);
app.use("/middleware", middlewareRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

app.use((err, req, res, next) => {
  res.status(500).json({
    success: false,
    message: err.message || "Internal server error"
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
