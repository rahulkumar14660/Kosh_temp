import mongoose from 'mongoose';
import { User } from '../models/user.model.js';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/library_management';

const enhanceUserModel = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB. Starting migration...');

    const users = await User.find({});
    console.log(`Found ${users.length} users to update.`);

    let updatedCount = 0;
    for (const user of users) {
      if (user.employeeId) {
        console.log(`User ${user._id} already has employeeId ${user.employeeId}. Skipping...`);
        continue;
      }

      user.employeeId = `EMP-${uuidv4().substring(0, 8).toUpperCase()}`;
      user.status = user.accountVerified ? 'Active' : 'Onboarding';
      user.employmentType = 'Full-time';
      user.role = user.role === 'Admin' ? 'Admin' : 'Employee';
      
      if (!user.department) user.department = 'General';
      if (!user.designation) user.designation = 'Employee';
      if (!user.createdBy) {
        const admin = await User.findOne({ role: 'Admin' });
        if (admin) user.createdBy = admin._id;
      }

      await user.save();
      await user.save();
      updatedCount++;
      console.log(`Updated user ${user._id} with employeeId ${user.employeeId}`);
    }

    console.log(`\nMigration completed successfully!`);
    console.log(`Total users processed: ${users.length}`);
    console.log(`Users updated: ${updatedCount}`);
    console.log(`Users already up to date: ${users.length - updatedCount}`);

    console.log('\nCreating indexes...');
    await User.collection.createIndex({ employeeId: 1 }, { unique: true });
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await User.collection.createIndex({ status: 1 });
    await User.collection.createIndex({ department: 1 });
    await User.collection.createIndex({ role: 1 });
    
    console.log('Indexes created successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

enhanceUserModel();
