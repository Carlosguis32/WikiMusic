//IMPORTING REQUIRED PACKAGES
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { body, validationResult } = require("express-validator");
const { validate } = require("deep-email-validator");
const path = require("path");
const app = express();
require("dotenv").config();

//SERVING STATIC FILES
app.use(express.static(path.join(__dirname, "../public")));

//ENDPOINT TO GET ENVIRONMENT VARIABLES NEEDED IN CLIENT SIDE
app.get("/env", (req, res) => {
    res.json({
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        rootDomain: process.env.ROOT_DOMAIN,
        port: process.env.PORT,
    });
});

//ROUTES TO SERVE HTML FILES
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../index.html"));
});

app.get("/html/login", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/html/login.html"));
});

app.get("/html/signup", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/html/signup.html"));
});

app.get("/html/home", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/html/home.html"));
});

app.get("/html/profile", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/html/profile.html"));
});

app.get("/html/recently_played", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/html/recently_played.html"));
});

app.get("/html/search", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/html/search.html"));
});

app.get("/html/top_items", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/html/top_items.html"));
});

app.get("/html/email_verified", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/html/email_verified.html"));
});

app.get("/html/error/:status/:statusText", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/html/error.html"));
});

//CONNECTING TO MONGODB
mongoose
    .connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
    })
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch((error) => {
        console.error("Error connecting to MongoDB:", error);
    });

//CREATING USER SCHEMA
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 20,
    },

    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },

    password: {
        type: String,
        required: true,
        select: false,
    },

    verified: {
        type: Boolean,
        required: true,
    },

    verificationToken: {
        type: String,
    },
});

//CREATING USER MODEL
const User = mongoose.model("User", userSchema);

//JSON PARSING
app.use(express.json());

//VERIFYING EMAIL AND SAVING USER TO DATABASE
app.get("/api/verify/:token", async (req, res) => {
    try {
        const token = req.params.token;

        if (!token) {
            return res.status(400).json({
                status: "error",
                error: "Verification token is missing",
            });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(401).json({
                status: "error",
                error: "Invalid or expired verification token",
            });
        }

        const user = await User.findOne({
            email: decoded.email,
            verificationToken: token,
            verified: false,
        });

        if (!user) {
            return res.status(404).json({
                status: "error",
                error: "User not found or already verified",
            });
        }

        user.verified = true;
        user.verificationToken = undefined;
        await user.save();

        res.sendFile(path.join(__dirname, "../public/html/email_verified.html"));
    } catch (error) {
        console.error("Verification error:", error);
        res.status(500).json({
            status: "error",
            error: "An error occurred during email verification",
        });
    }
});

//AUTHENTICATING NEW USER AND SENDING EMAIL
app.post(
    "/api/signup",
    [
        body("username").isLength({ min: 3, max: 20 }).trim().escape(),
        body("email").isEmail().normalizeEmail(),
        body("password").isLength({ min: 8, max: 50 }),
        body("confirmPassword").custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error("Passwords do not match");
            }
            return true;
        }),
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { username, email, password } = req.body;

            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ error: "User already exists" });
            }

            const emailValidation = await validate({
                email,
                validateRegex: true,
                validateMx: true,
                validateTypo: true,
            });
            if (!emailValidation.valid) {
                return res.status(400).json({ error: "Invalid email" });
            }

            const hashedPassword = await bcrypt.hash(password, 12);

            const verificationToken = jwt.sign({ username, email }, process.env.JWT_SECRET, { expiresIn: "10m" });

            const newUser = new User({
                username,
                email,
                password: hashedPassword,
                verified: false,
                verificationToken,
            });

            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.EMAIL_USERNAME,
                    pass: process.env.EMAIL_PASSWORD,
                },
            });

            const htmlPath = path.join(__dirname, "../public/html/verification_email.html");
            let emailHtml = fs.readFileSync(htmlPath, "utf8");
            const verificationUrl = `${process.env.ROOT_DOMAIN}/api/verify/${verificationToken}`;
            emailHtml = emailHtml.replace("${verificationUrl}", verificationUrl);

            const mailOptions = {
                from: process.env.EMAIL_USERNAME,
                to: email,
                subject: "Email Verification",
                html: emailHtml,
            };

            await transporter.sendMail(mailOptions);
            await newUser.save();

            setTimeout(async () => {
                const user = await User.findOne({ email });
                if (user && !user.verified) {
                    await User.deleteOne({ email });
                }
            }, 10 * 60 * 1000);

            res.status(201).json({
                status: "success",
                message: "User registered successfully. Please check your email to verify your account.",
            });
        } catch (error) {
            console.error("Signup error:", error);
            res.status(500).json({
                status: "error",
                error: "An error occurred during registration. Please try again later.",
            });
        }
    }
);

//AUTHENTICATING EXISTING USER
app.post("/api/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                status: "error",
                error: "Email and password are required",
            });
        }

        const user = await User.findOne({ email }).select("+password");

        if (!user) {
            return res.status(401).json({
                status: "error",
                error: "Invalid credentials",
            });
        }

        if (!user.verified) {
            return res.status(403).json({
                status: "error",
                error: "Email not verified",
            });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({
                status: "error",
                error: "Invalid credentials",
            });
        }

        const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.status(200).json({
            status: "success",
            message: "Login successful",
            data: { token },
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({
            status: "error",
            error: "An internal server error occurred",
        });
    }
});

//GETTING USER DETAILS (REVIEW LATER, NOT FUNCTIONAL)
app.get("/api/user", async (req, res) => {
    try {
        const response = await fetch("/api/verify/${token}", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: token,
            },
        });

        if (response.status === 200) {
            const user = await User.findOne({ email: req.user.email });
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }
            res.status(200).json({ username: user.username, email: user.email });
        }
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
});

app.use("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/html/error.html"));
});

//SERVER LISTENING ON PORT
const server = app
    .listen(process.env.PORT, () => {
        console.log(`Server running on port ${process.env.PORT}`);
    })
    .on("error", (e) => {
        if (e.code === "EADDRINUSE") {
            console.log("Address in use, retrying...");
            setTimeout(() => {
                server.close();
                server.listen(process.env.PORT);
            }, 1000);
        }
    });

module.exports = app;
