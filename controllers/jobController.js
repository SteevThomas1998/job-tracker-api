// controllers/jobController.js
const mongoose = require("mongoose");
const Job = require("../models/Jobs");

// allowlist fields a client can set/update
const ALLOWED_FIELDS = ["position", "company", "location", "status", "description"];

const pickFields = (obj, allow = ALLOWED_FIELDS) =>
  Object.fromEntries(Object.entries(obj || {}).filter(([k]) => allow.includes(k)));

exports.createJob = async (req, res) => {
  try {
    const payload = pickFields(req.body);
    const job = await Job.create({ ...payload, createdBy: req.user._id });
    res.status(201).json(job);
  } catch (error) {
    res.status(400).json({ message: "Failed to create job", error: error.message });
  }
};

exports.getJobs = async (req, res) => {
  try {
    // optional: pagination
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || "20", 10), 1), 100);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Job.find({ createdBy: req.user._id })
        .sort("-createdAt")
        .skip(skip)
        .limit(limit)
        .lean(),
      Job.countDocuments({ createdBy: req.user._id }),
    ]);

    res.status(200).json({ items, page, limit, total });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch jobs", error: error.message });
  }
};

exports.getJob = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid job id" });
    }

    const job = await Job.findOne({ _id: id, createdBy: req.user._id });
    if (!job) return res.status(404).json({ message: "Job not found" });

    res.status(200).json(job);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch job", error: error.message });
  }
};

exports.updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid job id" });
    }

    const updates = pickFields(req.body); // prevent changing createdBy, etc.
    const job = await Job.findOneAndUpdate(
      { _id: id, createdBy: req.user._id },
      updates,
      { new: true, runValidators: true }
    );

    if (!job) return res.status(404).json({ message: "Job not found" });
    res.status(200).json(job);
  } catch (error) {
    res.status(400).json({ message: "Failed to update job", error: error.message });
  }
};

exports.deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid job id" });
    }

    const job = await Job.findOneAndDelete({ _id: id, createdBy: req.user._id });
    if (!job) return res.status(404).json({ message: "Job not found" });

    res.status(200).json({ message: "Job deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete job", error: error.message });
  }
};