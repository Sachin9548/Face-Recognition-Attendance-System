const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const dotenv = require("dotenv");
const userRoutes = require("./routes/users");
const attRoutes = require("./routes/attendance");
const User = require("./models/User");
const Attendance = require("./models/Attendance");

dotenv.config();

// use the dotenv package to load environment variables from a .env file
const port = process.env.PORT || 5000;
// Connect to MongoDB
const db = process.env.MONGO_URI;

const app = express();
mongoose
      .connect(db)
      .then(() => console.log("🗄️  MongoDB connected"))
      .catch((err) => console.error("MongoDB connection error:", err));

app.use(cors());
app.use(bodyParser.json());

app.use("/models", express.static(path.join(__dirname, "./public/models")));

app.use("/api/users", userRoutes);
app.use("/api/attendance", attRoutes);

app.post("/api/mark-attendance-manual", async (req, res) => {
      console.log("req come");
      const { aadhaar } = req.body;
      const user = await User.findOne({ aadhaar });
      if (!user) return res.json({ success: false, message: "User not found" });

      await Attendance.create({ userId: user._id, timestamp: new Date() });
      res.json({ success: true });
});

app.use(express.static("public"));

app.listen(port, () => console.log("🚀 on http://localhost:3000"));
