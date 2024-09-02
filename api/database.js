const mongoose = require("mongoose");

let cachedDb = null;

const connectToMongoDB = async () => {
    if (cachedDb) {
        return cachedDb;
    }

    try {
        const client = await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
        });

        cachedDb = client.connection;
        cachedDb.on("error", console.log("MongoDB connection error: " + error));
        cachedDb.once("open", () => {
            console.log("Connected to MongoDB");
        });
        return cachedDb;
    } catch (error) {
        console.error("Error when connecting to MongoDB:", error);
        throw error;
    }
};

module.exports = connectToMongoDB;
