const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic Information
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false
  },
  
  // Private Information (Admin access only)
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^(\+88)?01[3-9]\d{8}$/, 'Please provide a valid Bangladesh phone number']
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required']
  },
  
  // Academic Information
  university: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'University',
    required: [true, 'University is required']
  },
  studentId: {
    type: String,
    required: [true, 'Student ID is required'],
    trim: true
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true
  },
  program: {
    type: String,
    required: [true, 'Program is required'],
    enum: ['Undergraduate', 'Graduate', 'Postgraduate', 'PhD'],
    default: 'Undergraduate'
  },
  yearOfStudy: {
    type: Number,
    required: [true, 'Year of study is required'],
    min: [1, 'Year of study must be at least 1'],
    max: [8, 'Year of study cannot exceed 8']
  },
  graduationYear: {
    type: Number,
    required: [true, 'Expected graduation year is required']
  },
  
  // Verification Status
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isProfileComplete: {
    type: Boolean,
    default: false
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  
  // Profile Information
  profilePicture: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters'],
    trim: true
  },
  
  // Platform Settings
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  
  // Email Verification
  emailVerificationToken: String,
  emailVerificationExpire: Date,
  
  // Password Reset
  resetPasswordToken: String,
  resetPasswordExpire: Date
}, {
  timestamps: true
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ university: 1, verificationStatus: 1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to check if profile is complete
userSchema.methods.checkProfileCompletion = function() {
  const requiredFields = [
    'firstName', 'lastName', 'email', 'phoneNumber', 
    'dateOfBirth', 'university', 'studentId', 'department', 
    'program', 'yearOfStudy', 'graduationYear'
  ];
  
  const isComplete = requiredFields.every(field => this[field] != null);
  this.isProfileComplete = isComplete;
  return isComplete;
};

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Transform output to hide sensitive data
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.emailVerificationToken;
  delete user.emailVerificationExpire;
  delete user.resetPasswordToken;
  delete user.resetPasswordExpire;
  
  // Hide private information for non-admin users
  if (!this.isAdmin) {
    delete user.phoneNumber;
    delete user.dateOfBirth;
  }
  
  return user;
};

module.exports = mongoose.model('User', userSchema);