/**
 * Script to create a new admin user
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');

async function createAdmin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: 'testadmin@admin.com' });
        if (existingAdmin) {
            console.log('\n⚠️  Admin testadmin@admin.com already exists!');
            console.log(`   Current role: ${existingAdmin.role}`);

            // Update to admin if not already
            if (existingAdmin.role !== 'admin') {
                existingAdmin.role = 'admin';
                await existingAdmin.save();
                console.log('   Updated role to: admin');
            }
        } else {
            // Create new admin user - password will be hashed by pre-save hook
            const newAdmin = new User({
                name: 'Test Admin',
                email: 'testadmin@admin.com',
                password: 'admin123456',
                role: 'admin',
                isActive: true
            });

            await newAdmin.save();
            console.log('\n✅ New admin user created!');
        }

        console.log('\n=====================================');
        console.log('Admin Login Credentials:');
        console.log('Email: testadmin@admin.com');
        console.log('Password: admin123456');
        console.log('=====================================');
        console.log('\nAccess admin panel at: http://localhost:3000/admin');

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
    }
}

createAdmin();
