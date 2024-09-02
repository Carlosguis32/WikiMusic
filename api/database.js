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
        console.log("MongoDB connected successfully");
        return cachedDb;
    } catch (error) {
        console.error("Error when connecting to MongoDB: ", error);
        throw error;
    }
};

module.exports = connectToMongoDB;
