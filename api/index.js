const express = require("express");
const path = require("path");
const app = express();
require("dotenv").config();

app.use(express.static(path.join(__dirname, "../public")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../index.html"));
});

app.get("/env", (req, res) => {
    res.json({
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        rootDomain: process.env.ROOT_DOMAIN,
        port: process.env.PORT,
    });
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
    res.sendFile(path.join(__dirname, "../public/html/menu_bar.html"));
});

app.get("/html/top_items", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/html/top_items.html"));
});

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
