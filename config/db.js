// config/db.js
const mongoose = require("mongoose");

// optional, keeps mongoose quiet about filtering
mongoose.set("strictQuery", true);

/**
 * Connect to MongoDB.
 * - Uses MONGO_URL (preferred) or MONGO_URI (fallback).
 * - In test/CI, it will THROW instead of process.exit(1) so Jest can report errors.
 */
async function connectDB(uri = process.env.MONGO_URL || process.env.MONGO_URI) {
  if (!uri) {
    const msg = "No MongoDB URI provided (MONGO_URL or MONGO_URI).";
    if (process.env.NODE_ENV === "test" || process.env.CI) {
      // Don't kill the runner; let tests fail with a clear message
      throw new Error(msg);
    } else {
      console.error(msg);
      process.exit(1);
    }
  }

  try {
    await mongoose.connect(uri, {
      dbName: process.env.DB_NAME || "jobtracker_test",
    });
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    if (process.env.NODE_ENV === "test" || process.env.CI) {
      throw err; // surface to Jest
    } else {
      process.exit(1);
    }
  }
}

/** Graceful close for tests or shutdown hooks */
async function disconnectDB() {
  try {
    await mongoose.connection.close();
  } catch (err) {
    console.error("MongoDB disconnect error:", err);
  }
}

module.exports = { connectDB, disconnectDB };