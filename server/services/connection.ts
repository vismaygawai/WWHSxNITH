import mongoose from "mongoose";

export const connectToMongo = async (url?: string) => {
    if (mongoose.connection.readyState >= 1) {
        return;
    }

    const mongoUrl = url || process.env.MONGO_URI;
    if (!mongoUrl) {
        console.warn("Mongo URI is missing");
        return;
    }

    try {
        await mongoose.connect(mongoUrl, {
            serverSelectionTimeoutMS: 5000,
        });
        console.log("MongoDB Connected successfully");
    } catch (err) {
        console.error("Failed to connect to MongoDB:", err);
    }
};