import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      enum: ['ECE', 'CS', 'IT', 'MECH', 'EEE', 'AI', 'CHEM', 'CIVIL'],
      required: true,
    },
    program: {
      type: String,
      enum: ['B-TECH', 'M-TECH', 'MBA', 'PHD'],
    },
    role: {
      type: String,
      enum: ['user', 'faculty', 'admin','parent'],
      default: 'user',
    },
    parentemail: {
      type: String,
    },
    hostelroom:{
      type: String,
    }
  }, { timestamps: true });

const User = mongoose.model('User', userSchema);

export default User;