const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/futuredesk';

        // Note: useNewUrlParser and useUnifiedTopology are deprecated in Mongoose v7+
        const conn = await mongoose.connect(mongoURI, {
            serverSelectionTimeoutMS: 10000, // Fail fast if Atlas is unreachable (10s)
        });

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        console.log(`📦 Database: ${conn.connection.name}`);
    } catch (error) {
        console.error(`❌ MongoDB Connection Failed: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
