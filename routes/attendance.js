const express = require("express");
const router = express.Router();
const Attendance = require("../models/Attendance");

// Single mark
router.post("/", async (req, res) => {
  const { userId, timestamp } = req.body;
  await new Attendance({ userId, timestamp: timestamp || new Date() }).save();
  res.json({ success: true });
});

// Bulk (for offline sync)
router.post("/bulk", async (req, res) => {
  const records = req.body.records; 
  await Attendance.insertMany(records);
  res.json({ success: true, inserted: records.length });
});

// Get all records
router.get("/", async (req, res) => {
  const records = await Attendance.find()
    .populate("userId", "name aadhaar")
    .sort({ timestamp: -1 })
    .lean();
  res.json(records);
});

module.exports = router;
