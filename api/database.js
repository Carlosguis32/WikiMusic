const mongoose = require("mongoose");

const connectToMongoDB = async () => {
    await mongoose
        .connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
        })
        .then(() => {
            console.log("Connected to MongoDB");
        })
        .catch((error) => {
            console.error("Error connecting to MongoDB:", error);
        });
};

module.exports = connectToMongoDB;
