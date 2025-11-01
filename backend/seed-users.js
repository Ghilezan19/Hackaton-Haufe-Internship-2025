// Script pentru a crea utilizatori de test în MongoDB Atlas
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  name: String,
  role: String,
  subscription: {
    plan: String,
    status: String,
    reviewsLeft: Number,
    reviewsUsed: Number,
    totalReviewsAllowed: Number,
    startDate: Date,
  },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function seedUsers() {
  try {
    // Conectează la MongoDB Atlas
    console.log('🔌 Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas!');

    // Șterge utilizatorii existenți (opțional)
    await User.deleteMany({});
    console.log('🗑️  Cleared existing users');

    // Creează utilizatori de test
    const users = [
      {
        email: 'user@test.com',
        password: await bcrypt.hash('test123', 10),
        name: 'Test User',
        role: 'user',
        subscription: {
          plan: 'free',
          status: 'active',
          reviewsLeft: 10,
          reviewsUsed: 0,
          totalReviewsAllowed: 10,
          startDate: new Date(),
        }
      },
      {
        email: 'john@example.com',
        password: await bcrypt.hash('password123', 10),
        name: 'John Doe',
        role: 'user',
        subscription: {
          plan: 'pro',
          status: 'active',
          reviewsLeft: 1000,
          reviewsUsed: 0,
          totalReviewsAllowed: 1000,
          startDate: new Date(),
        }
      },
      {
        email: 'admin@lintora.com',
        password: await bcrypt.hash('admin123', 10),
        name: 'Admin User',
        role: 'admin',
        subscription: {
          plan: 'enterprise',
          status: 'active',
          reviewsLeft: -1, // unlimited
          reviewsUsed: 0,
          totalReviewsAllowed: -1,
          startDate: new Date(),
        }
      },
      {
        email: 'maria@test.com',
        password: await bcrypt.hash('maria123', 10),
        name: 'Maria Popescu',
        role: 'user',
        subscription: {
          plan: 'free',
          status: 'active',
          reviewsLeft: 5,
          reviewsUsed: 5,
          totalReviewsAllowed: 10,
          startDate: new Date(),
        }
      }
    ];

    // Inserează utilizatorii
    await User.insertMany(users);
    console.log('✅ Created test users:');
    console.log('\n📋 USER ACCOUNTS:');
    console.log('==========================================');
    console.log('1. 👤 FREE USER');
    console.log('   Email: user@test.com');
    console.log('   Password: test123');
    console.log('   Plan: Free (10 reviews)');
    console.log('');
    console.log('2. 👤 PRO USER');
    console.log('   Email: john@example.com');
    console.log('   Password: password123');
    console.log('   Plan: Pro (1000 reviews)');
    console.log('');
    console.log('3. 👑 ADMIN USER (UNLIMITED!)');
    console.log('   Email: admin@lintora.com');
    console.log('   Password: admin123');
    console.log('   Plan: Enterprise (Unlimited)');
    console.log('');
    console.log('4. 👤 PARTIAL USER');
    console.log('   Email: maria@test.com');
    console.log('   Password: maria123');
    console.log('   Plan: Free (5/10 reviews used)');
    console.log('==========================================\n');

    console.log('🎉 Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedUsers();

