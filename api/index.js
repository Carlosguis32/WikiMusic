//IMPORTING REQUIRED PACKAGES
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
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
    })
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch((error) => {
        console.error("Error connecting to MongoDB:", error);
    });

//CREATING USER SCHEMA
const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
});

//CREATING USER MODEL
const User = mongoose.model("User", userSchema);

//JSON PARSING
app.use(express.json());

//VERIFYING EMAIL AND SAVING USER TO DATABASE
app.get("/verify/:token", async (req, res) => {
    try {
        const token = req.params.token;

        if (!token) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const newUser = new User({
            username: decoded.username,
            email: decoded.email,
            password: decoded.password,
        });

        await newUser.save();
        res.status(201).sendFile(path.join(__dirname, "../public/html/email_verified.html"));
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
});

//AUTHENTICATING NEW USER AND SENDING EMAIL
app.post("/api/signup", async (req, res) => {
    try {
        const existingUser = await User.findOne({ email: req.body.email });
        const validationResult = await validate({ email: req.body.email });

        if (existingUser) {
            return res.status(400).json({ error: "User already exists" });
        } else if (!validationResult.valid) {
            return res.status(400).json({ error: "Invalid email" });
        } else if (req.body.password.length < 8) {
            return res.status(400).json({ error: "Password must be at least 8 characters long" });
        } else if (req.body.password !== req.body.confirmPassword) {
            return res.status(400).json({ error: "Passwords do not match" });
        } else if (req.body.password.length > 50) {
            return res.status(400).json({ error: "Password must be at most 50 characters long" });
        } else if (req.body.username.length < 3) {
            return res.status(400).json({ error: "Username must be at least 3 characters long" });
        } else if (req.body.username.length > 20) {
            return res.status(400).json({ error: "Username must be at most 20 characters long" });
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        const token = jwt.sign(
            {
                username: req.body.username,
                email: req.body.email,
                password: hashedPassword,
            },
            process.env.JWT_SECRET,
            { expiresIn: "5m" }
        );

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        const htmlPath = path.join(__dirname, "../public/html/verification_email.html");
        let emailHtml = fs.readFileSync(htmlPath, "utf8");
        emailHtml = emailHtml.replace(
            "${process.env.ROOT_DOMAIN}/verify/${token}",
            `${process.env.ROOT_DOMAIN}/verify/${token}`
        );

        const mailConfigurations = {
            from: process.env.EMAIL_USERNAME,

            to: req.body.email,

            subject: "Email Verification",

            html: emailHtml,
        };

        try {
            transporter.sendMail(mailConfigurations, function (error, info) {
                if (error) {
                    console.log("Error sending email:", error);
                    return res.status(500).json({ error: "Error sending email" });
                }
                console.log("Email Sent Successfully:", info.response);
                return res.status(200).json({ message: "Email sent successfully" });
            });
        } catch (error) {
            return res.status(500).json({ error: "Internal server error" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal server error" });
    }
});

//AUTHENTICATING EXISTING USER
app.post("/api/login", async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(401).json({ error: "User not found" });
        }

        const passwordMatch = await bcrypt.compare(req.body.password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ error: "Wrong password" });
        }

        const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET);
        res.status(200).json({ token });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
});

//GETTING USER DETAILS (REVIEW LATER, NOT FUNCTIONAL)
app.get("/api/user", async (req, res) => {
    try {
        const response = await fetch("/verify/${token}", {
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
    res.sendFile(path.join(__dirname, "../public/error.html"));
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
