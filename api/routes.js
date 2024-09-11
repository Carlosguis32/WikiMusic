const express = require("express");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { body, validationResult } = require("express-validator");
const path = require("path");
const app = express();
const { sql } = require("@vercel/postgres");
require("dotenv").config();

// Endpoint to get environment variables
app.get("/env", (req, res) => {
    res.json({
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        rootDomain: process.env.ROOT_DOMAIN,
        port: process.env.PORT,
    });
});

// Routes for serving static HTML files
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

// Verify email address and update user status
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

        const user = await sql`
            SELECT * FROM "users" WHERE "email" = ${decoded.email} AND "verificationToken" = ${token} AND "verified" = false;
        `;

        if (user.length === 0) {
            return res.status(404).json({
                status: "error",
                error: "User not found or already verified",
            });
        }

        await sql`
            UPDATE "users" SET "verified" = true, "verificationToken" = NULL WHERE "email" = ${decoded.email};
        `;

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
        body("username")
            .isLength({ min: process.env.MIN_CHARS_USERNAME, max: process.env.MAX_CHARS_USERNAME })
            .trim()
            .escape(),
        body("email").isEmail().normalizeEmail(),
        body("password").isLength({ min: process.env.MIN_CHARS_PASSWORD, max: process.env.MAX_CHARS_PASSWORD }),
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

            const existingUser = await sql`
                SELECT "id" FROM "users" WHERE "email" = ${email};
            `;

            if (existingUser.length > 0) {
                return res.status(400).json({
                    status: "error",
                    message: "Email already exists. Please use a different email.",
                });
            }

            const verificationToken = jwt.sign({ username, email }, process.env.JWT_SECRET, { expiresIn: "10m" });

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

            const hashedPassword = await bcrypt.hash(password, 12);

            const result = await sql`
                INSERT INTO "users" ("username", "email", "password" ,"verificationToken")
                VALUES (${username}, ${email}, ${hashedPassword}, ${verificationToken})
                RETURNING "id", "username", "email" ,"verificationToken";
            `;

            console.log("New unverified registered user: " + result);

            res.status(201).json({
                status: "success",
                message: "User registered successfully. Please check your email to verify your account.",
            });
        } catch (error) {
            console.error("Signup error: ", error);
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

        const userEmail = await sql`
            SELECT * FROM users WHERE email = ${email}
        `;

        if (userEmail.length === 0) {
            return res.status(401).json({
                status: "error",
                error: "User does not exist",
            });
        }

        const userVerification = await sql`
            SELECT verified FROM users WHERE email = ${email}
        `;

        if (userVerification === false) {
            return res.status(403).json({
                status: "error",
                error: "Email not verified",
            });
        }

        const userPassword = await sql`
            SELECT password FROM users WHERE email = ${email}
        `;

        const passwordMatch = await bcrypt.compare(password, userPassword.rows[0].password);

        if (!passwordMatch) {
            return res.status(401).json({
                status: "error",
                error: "Wrong password, please try again",
            });
        }

        const username = await sql`
            SELECT username FROM users WHERE email = ${email}
        `;

        const token = jwt.sign({ username: username, email: email }, process.env.JWT_SECRET, { expiresIn: "1h" });

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

        if (response.ok) {
            const email = await sql`
                SELECT email FROM users WHERE email = ${email}
            `;

            if (email.length === 0) {
                return res.status(404).json({ error: "User not found" });
            }

            const username = await sql`
                SELECT username FROM users WHERE email = ${email}
            `;

            res.status(200).json({ username: username, email: email });
        }
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
});

app.use("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/html/error.html"));
});

module.exports = app;
