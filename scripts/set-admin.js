/**
 * Script to set a user as admin
 * Usage: node scripts/set-admin.js <email>
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');

async function setAdmin() {
    const email = process.argv[2];

    if (!email) {
        console.log('Usage: node scripts/set-admin.js <email>');
        console.log('Example: node scripts/set-admin.js user@example.com');
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            console.log(`\n❌ User with email "${email}" not found!`);

            // Show available users
            const users = await User.find({}).select('email role');
            console.log('\nAvailable users:');
            users.forEach(u => console.log(`  - ${u.email} (${u.role})`));
        } else {
            const oldRole = user.role;
            user.role = 'admin';
            await user.save();

            console.log(`\n✅ Successfully updated user role!`);
            console.log(`   Email: ${user.email}`);
            console.log(`   Old Role: ${oldRole}`);
            console.log(`   New Role: ${user.role}`);
            console.log('\nYou can now login with this account to access admin panel at /admin');
        }

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
    }
}

setAdmin();
