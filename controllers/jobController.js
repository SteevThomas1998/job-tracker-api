const Job = require("../models/Jobs");

exports.createJob = async (req, res) => {
    try {
        const job = await Job.create({
            ...req.body,
            createdBy: req.user._id
        });

        res.status(201).json(job);
    } catch (error) {
        res.status(400).json({ message: "Failed to create job", error: err.message });
    }
};

exports.getJobs = async (req, res) => {
    const jobs = await Job.find({ createdBy: req.user._id }). sort("-createdAt");
    res.status(200).json(jobs);
};

exports.getJob = async (req, res) => {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.status(200).json(job);
};

exports.updateJob = async (req, res) => {
    const { id } = req.params;
    const job = await Job.findOneAndUpdate(
        { _id: id, createdBy: req.user._id },
        req.body,
        { new: true, runValidators: true }
    );
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.status(200).json(job);
};

exports.deleteJob = async (req, res) => {
    const { id } = req.params;
    const job = await Job.findOneAndDelete({ _id: id, createdBy: req.user._id });
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.status(200).json({ message: "Job deleted successfully" });
};