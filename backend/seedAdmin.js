const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const connectDB = require('./config/db');

dotenv.config();

const seedAdmin = async () => {
    try {
        await connectDB();

        const adminEmail = 'admin@futuredesk.com';
        const adminPassword = '123';

        // Check if admin exists
        const userExists = await User.findOne({ email: adminEmail });

        if (userExists) {
            console.log('Admin user found. Updating password...');
            userExists.password = adminPassword; // Pre-save middleware will hash this
            await userExists.save();
            console.log('Admin password updated to: 123');
        } else {
            console.log('Admin user not found. Creating new admin...');
            await User.create({
                name: 'Admin User',
                email: adminEmail,
                password: adminPassword, // Pre-save middleware will hash this
                role: 'admin',
                department: 'Management',
                designation: 'System Admin',
                joiningDate: new Date().toISOString().split('T')[0],
                isActive: true,
                mustChangePassword: false
            });
            console.log('Admin user created successfully.');
            console.log('Email: admin@futuredesk.com');
            console.log('Password: 123');
        }

        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

seedAdmin();
