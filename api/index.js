const express = require("express");
const path = require("path");
const app = express();
const createUsersTable = require("../api/database.js");
const routes = require("../api/routes.js");
require("dotenv").config();

// JSON parsing
app.use(express.json());

// Connecting to the database
createUsersTable();

// Serving static files and managing routes
app.use(express.static(path.join(__dirname, "../src")));
app.use("/", routes);

module.exports = app;
