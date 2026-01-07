/**
 * Script to check users in database
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');

async function checkUsers() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Get all users
        const users = await User.find({}).select('name email role isActive createdAt');

        console.log('\n=== ALL USERS IN DATABASE ===');
        if (users.length === 0) {
            console.log('No users found in database!');
        } else {
            users.forEach((user, index) => {
                console.log(`\n${index + 1}. User:`);
                console.log(`   - ID: ${user._id}`);
                console.log(`   - Name: ${user.name}`);
                console.log(`   - Email: ${user.email}`);
                console.log(`   - Role: ${user.role}`);
                console.log(`   - Active: ${user.isActive}`);
            });
        }

        // Count by role
        console.log('\n=== USER COUNT BY ROLE ===');
        const adminCount = await User.countDocuments({ role: 'admin' });
        const staffCount = await User.countDocuments({ role: 'staff' });
        const customerCount = await User.countDocuments({ role: 'customer' });

        console.log(`Admins: ${adminCount}`);
        console.log(`Staff: ${staffCount}`);
        console.log(`Customers: ${customerCount}`);

        if (adminCount === 0) {
            console.log('\n⚠️  WARNING: No admin users found!');
            console.log('You need to create an admin user or update an existing user to admin role.');
        }

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
    }
}

checkUsers();
