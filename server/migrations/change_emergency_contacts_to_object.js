import mongoose from 'mongoose';
import { User } from '../models/user.model.js';

const MONGO_URI = process.env.MONGO_URI;

const runMigration = async () => {
  try {
    await mongoose.connect(MONGO_URI, { 
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const users = await User.find({
      $or: [
        { emergencyContacts: { $exists: false } },
        { emergencyContacts: null },
        { emergencyContacts: {} },
      ],
    });

    for (const user of users) {
      user.emergencyContacts = {
        name: 'N/A',
        relation: 'N/A',
        phone: '0000000000',
      };
      await user.save();
    }

    console.log(`Migration completed for ${users.length} users.`);
    mongoose.disconnect();
  } catch (err) {
    console.error('Migration failed:', err);
    mongoose.disconnect();
  }
};

runMigration();
