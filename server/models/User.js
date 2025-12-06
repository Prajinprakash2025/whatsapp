const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  profilePicture: {
    type: String,
    default: 'https://ui-avatars.com/api/?background=25D366&color=fff&name='
  },
  about: {
    type: String,
    default: 'Hey there! I am using WhatsApp Clone',
    maxlength: [140, 'About cannot exceed 140 characters']
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  socketId: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Set default profile picture with username
userSchema.pre('save', function(next) {
  if (this.isNew && this.profilePicture === 'https://ui-avatars.com/api/?background=25D366&color=fff&name=') {
    this.profilePicture = `https://ui-avatars.com/api/?background=25D366&color=fff&name=${encodeURIComponent(this.username)}`;
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
