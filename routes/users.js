const express = require("express");
const router = express.Router();
const User = require("../models/User");

// List all users
router.get("/", async (req, res) => {
  const users = await User.find({}, "name aadhaar descriptor").lean();
  res.json(users);
});

// Register new user
router.post("/register", async (req, res) => {
  const { name, aadhaar, descriptor } = req.body;
  if (!/^\d{12}$/.test(aadhaar)) return res.status(400).send("Invalid Aadhaar");
  const user = new User({ name, aadhaar, descriptor });
  await user.save();
  res.json({ success: true, userId: user._id });
});

module.exports = router;
