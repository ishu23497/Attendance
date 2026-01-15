const dotenv = require('dotenv');
const User = require('./models/User');
const connectDB = require('./config/db');

dotenv.config();

const seedAdmin = async () => {
  try {
    await connectDB();

    const admin = {
      email: 'admin@futuredesk.com',
      password: 'Admin@123',
      role: 'admin',
    };

    let user = await User.findOne({ email: admin.email });

    if (user) {
      console.log('✅ Admin found. Updating password...');

      user.password = admin.password; // 🔐 bcrypt pre-save middleware will hash
      user.role = 'admin';
      user.isActive = true;

      await user.save();
    } else {
      console.log('⚠️ Admin not found. Creating admin...');

      await User.create({
        name: 'System Admin',
        email: admin.email,
        password: admin.password, // 🔐 hashed automatically
        role: 'admin',
        department: 'Management',
        designation: 'Administrator',
        joiningDate: new Date(),
        isActive: true,
        mustChangePassword: false,
      });
    }

    console.log('--------------------------------');
    console.log('🔐 ADMIN LOGIN DETAILS');
    console.log('Email    : admin@futuredesk.com');
    console.log('Password : Admin@123');
    console.log('--------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeder error:', error.message);
    process.exit(1);
  }
};

seedAdmin();
