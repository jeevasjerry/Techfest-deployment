
require("node:dns").setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();

// ==============================
// 1. Middleware
// ==============================
app.use(
    cors({
        origin: [
            "http://localhost:5173",
            "http://localhost:5714",
            "https://techfest2026-jeeva.netlify.app"
        ],
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"]
    })
);

app.use(express.json());

// ==============================
// 2. Health Check
// ==============================
app.get("/", (req, res) => {
    res.send("TechFest 2026 Backend is Running!");
});

app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
});

// ==============================
// 3. MongoDB Schema
// ==============================
const registrationSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            unique: true
        },

        phone: {
            type: String,
            required: true,
            trim: true
        },

        password: {
            type: String,
            required: true,
            select: false
        },

        event: {
            type: String,
            default: "TechFest 2026"
        }
    },
    {
        timestamps: true
    }
);

const Registration = mongoose.model(
    "Registration",
    registrationSchema
);

// ==============================
// 4. Register a Participant
// ==============================
app.post("/api/register", async (req, res) => {
    try {
        const { name, email, phone, password, event } = req.body;

        // Validate required fields
        if (
            typeof name !== "string" ||
            typeof email !== "string" ||
            typeof phone !== "string" ||
            typeof password !== "string" ||
            !name.trim() ||
            !email.trim() ||
            !phone.trim() ||
            !password
        ) {
            return res.status(400).json({
                message: "Name, email, phone and password are required."
            });
        }

        // Validate password length
        if (password.length < 8) {
            return res.status(400).json({
                message: "Password must contain at least 8 characters."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Check whether email is already registered
        const existingUser = await Registration.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(409).json({
                message: "This email is already registered. Please log in."
            });
        }

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 12);

        const registration = new Registration({
            name: name.trim(),
            email: normalizedEmail,
            phone: phone.trim(),
            password: hashedPassword,
            event: event || "TechFest 2026"
        });

        await registration.save();

        return res.status(201).json({
            message: "Registration successful! Please log in."
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                message: "This email is already registered."
            });
        }

        console.error("Registration error:", error.message);

        return res.status(500).json({
            message: "Registration failed. Please try again."
        });
    }
});

// ==============================
// 5. Login a Participant
// ==============================
app.post("/api/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (
            typeof email !== "string" ||
            typeof password !== "string" ||
            !email.trim() ||
            !password
        ) {
            return res.status(400).json({
                message: "Email and password are required."
            });
        }

        // Find the registered user
        const user = await Registration.findOne({
            email: email.trim().toLowerCase()
        }).select("+password");

        // Reject unregistered users
        if (!user) {
            return res.status(401).json({
                message: "Account not found. Please register first."
            });
        }

        // Check password
        const passwordMatches = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatches) {
            return res.status(401).json({
                message: "Incorrect password. Please try again."
            });
        }

        // Ensure JWT secret is configured
        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET is missing from environment variables.");

            return res.status(500).json({
                message: "Server configuration error. Please try again later."
            });
        }

        // Generate authentication token
        const token = jwt.sign(
            { userId: user._id.toString() },
            process.env.JWT_SECRET,
            { expiresIn: "2h" }
        );

        return res.status(200).json({
            message: "Login successful!",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error("Login error:", error.message);

        return res.status(500).json({
            message: "Login failed. Please try again."
        });
    }
});

// ==============================
// 6. Get All Registrations
// ==============================
app.get("/api/register", async (req, res) => {
    try {
        // Password is excluded because select:false is set in the schema
        const registrations = await Registration.find()
            .select("-password");

        return res.status(200).json(registrations);

    } catch (error) {
        console.error("Fetch registrations error:", error.message);

        return res.status(500).json({
            message: "Could not retrieve registrations."
        });
    }
});

// ==============================
// 7. Start Server
// ==============================
async function startServer() {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI is missing from environment variables.");
        }

        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB connected successfully!");

        const PORT = process.env.PORT || 5000;

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

    } catch (error) {
        console.error("Server startup failed:", error.message);
        process.exit(1);
    }
}

startServer();
