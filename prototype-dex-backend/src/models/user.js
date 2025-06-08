// src/models/User.js

import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: 3
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  favorites: [String], // e.g. ["pikachu", "charizard"]
  caught: [String]     // e.g. ["bulbasaur"]
}, {
  timestamps: true
});

export default mongoose.model('User', userSchema);
