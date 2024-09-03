const mongoose = require("mongoose");

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

const User = mongoose.model("User", userSchema);

let cachedDb = null;

const connectToMongoDB = async () => {
    if (cachedDb) {
        return cachedDb;
    }

    try {
        const client = await mongoose.connect(process.env.MONGODB_URI);
        cachedDb = client.connection;
        console.log("MongoDB connected successfully");
        return cachedDb;
    } catch (error) {
        console.error("Error when connecting to MongoDB:", error);
        throw error;
    }
};

module.exports = { connectToMongoDB, User };
