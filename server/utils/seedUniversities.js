const mongoose = require('mongoose');
const dotenv = require('dotenv');
const University = require('../models/University');

// Load environment variables
dotenv.config();

// Sample university data
const universities = [
  {
    name: "Islamic University of Technology",
    shortName: "IUT",
    domains: [
      "student.iut-dhaka.edu",
      "iut-dhaka.edu"
    ],
    location: {
      city: "Dhaka",
      state: "Dhaka",
      country: "Bangladesh"
    },
    verified: true,
    active: true
  },
  {
    name: "University of Dhaka",
    shortName: "DU",
    domains: [
      "student.du.ac.bd",
      "du.ac.bd"
    ],
    location: {
      city: "Dhaka",
      state: "Dhaka",
      country: "Bangladesh"
    },
    verified: true,
    active: true
  },
  {
    name: "Bangladesh University of Engineering and Technology",
    shortName: "BUET",
    domains: [
      "student.buet.ac.bd",
      "buet.ac.bd"
    ],
    location: {
      city: "Dhaka",
      state: "Dhaka",
      country: "Bangladesh"
    },
    verified: true,
    active: true
  },
  {
    name: "North South University",
    shortName: "NSU",
    domains: [
      "student.northsouth.edu",
      "northsouth.edu"
    ],
    location: {
      city: "Dhaka",
      state: "Dhaka",
      country: "Bangladesh"
    },
    verified: true,
    active: true
  }
];

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB successfully');
    seedUniversities();
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

// Seed universities
const seedUniversities = async () => {
  try {
    // Delete existing data (optional)
    await University.deleteMany({});
    console.log('Deleted existing universities');

    // Insert new data
    const createdUniversities = await University.insertMany(universities);
    console.log(`Added ${createdUniversities.length} universities to the database`);

    // Disconnect from MongoDB
    mongoose.disconnect();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error seeding universities:', error.message);
    mongoose.disconnect();
    process.exit(1);
  }
};
