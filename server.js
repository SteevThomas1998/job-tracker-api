// Imports
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const verifyToken = require("./middleware/authMiddleware");

// Environment Config
dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(cors({ origin: "*", methods: "GET,HEAD,PUT,PATCH,POST,DELETE" }));
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.send("✅ Job Tracker API is live");
});

const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

app.get("/api/protected", verifyToken, (req, res) => {
  res.json({ message: `Welcome, user ${req.user.name}!` });
});

const jobRoutes = require("./routes/jobRoute");
app.use("/api/jobs", jobRoutes);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


module.exports = app;

if (require.main === module) {
  const PORT = process.env.PORT || 5050;
  app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
}