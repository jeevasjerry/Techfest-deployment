require("node:dns").setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://techfest2026-jeeva.netlify.app"
  ]
}));

app.use(express.json());

app.get("/", (req, res) => {
res.send("TechFest 2026 Backend is Running!");
});

app.get("/api/health", (req, res) => {
res.json({ status: "ok" });
});
// Registration Schema
const registrationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    event: { type: String, default: "TechFest 2026" }
});

const Registration = mongoose.model("Registration", registrationSchema);

// Register a participant
app.post("/api/register", async (req, res) => {
  try {
    const { name, email, phone, event } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({
        message: "Name, email and phone are required",
      });
    }

    const registration = new Registration({
      name,
      email,
      phone,
      event,
    });

    await registration.save();

    res.status(201).json({
      message: "Registration successful!",
      data: registration,
    });
  } catch (error) {
    res.status(500).json({
      message: "Registration failed",
      error: error.message,
    });
  }
});

// Get all registrations
app.get("/api/register", async (req, res) => {
    try {
        const registrations = await Registration.find();
        res.json(registrations);
    } catch (error) {
        res.status(500).json({
            message: "Could not retrieve registrations"
        });
    }
});
async function startServer() {
try {
await mongoose.connect(process.env.MONGO_URI);


    console.log("MongoDB connected successfully!");

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
} catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
}


}

startServer();
