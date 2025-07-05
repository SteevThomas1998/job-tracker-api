const express = require("express");
const router = express.Router();
const { createJob, getJobs, getJob, updateJob, deleteJob } = require("../controllers/jobController");
const verifyToken = require("../middleware/authMiddleware");

router.use(verifyToken);

router.post("/",  createJob);
router.get("/",  getJobs);
router.get("/:id",  getJob);
router.put("/:id",  updateJob);
router.delete("/:id",  deleteJob);

module.exports = router;