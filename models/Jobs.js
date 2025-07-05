const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
    position: { type: String, required: true },
    company: { type: String, required: true },
    status: { type: String, required: true, enum: ["applied", "interviewing", "offer", "rejected"], default: "applied" },
    location: { type: String, required: true },
    description: { type: String, required: false },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
      }
    }, { timestamps: true });


module.exports = mongoose.model("Job", jobSchema);