// Database cleanup script - removes invalid/corrupted records
// Run this once to clean up old test data

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const cleanupVisitors = async () => {
  console.log('\n Cleaning up invalid visitor records...');
  
  try {
    const Visitor = mongoose.model('Visitor');
    
    // Find visitors with missing required fields
    const invalidVisitors = await Visitor.find({
      $or: [
        { fullName: { $exists: false } },
        { fullName: null },
        { fullName: '' },
        { email: { $exists: false } },
        { email: null },
        { phoneNumber: { $exists: false } },
        { phoneNumber: null },
        { purpose: { $exists: false } },
        { purpose: null },
        { checkedInBy: { $exists: false } }, // Old records without this field
      ]
    });

    console.log(`Found ${invalidVisitors.length} invalid visitor records`);

    if (invalidVisitors.length > 0) {
      const result = await Visitor.deleteMany({
        _id: { $in: invalidVisitors.map(v => v._id) }
      });
      console.log(`✓ Deleted ${result.deletedCount} invalid visitor records`);
    }
  } catch (error) {
    console.error('Error cleaning visitors:', error.message);
  }
};

const cleanupRequests = async () => {
  console.log('\n Cleaning up expired visit requests...');
  
  try {
    const VisitRequest = mongoose.model('VisitRequest');
    
    // Find expired requests
    const expiredRequests = await VisitRequest.find({
      status: 'pending',
      expiresAt: { $lt: new Date() }
    });

    console.log(`Found ${expiredRequests.length} expired requests`);

    if (expiredRequests.length > 0) {
      const result = await VisitRequest.updateMany(
        { _id: { $in: expiredRequests.map(r => r._id) } },
        { status: 'expired' }
      );
      console.log(`✓ Marked ${result.modifiedCount} requests as expired`);
    }
  } catch (error) {
    console.error('Error cleaning requests:', error.message);
  }
};

const main = async () => {
  console.log('=== Database Cleanup Script ===');
  await connectDB();
  
  // Import models
  await import('../lib/models/Visitor.ts');
  await import('../lib/models/VisitRequest.ts');
  
  await cleanupVisitors();
  await cleanupRequests();
  
  console.log('\n✓ Database cleanup complete!\n');
  process.exit(0);
};

main();
