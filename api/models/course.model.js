import mongoose from 'mongoose';
import User from './user.model.js';

const courseSchema = new mongoose.Schema({
  courseName: {
    type: String,
    required: true,
    unique: true,
  },
  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    validate: {
      validator: async function(facultyId) {
        const faculty = await User.findById(facultyId);
        return faculty && faculty.role === 'faculty';
      },
      message: 'Faculty must be a user with the role of faculty.',
    },
  },
  courseCode: {
    type: String,
    required: true,
    unique: true,
  },
  schedule: {
    type: String,
    default: "Not scheduled",
  },
  courseDescription: {
    type: String,
    maxlength: 300,
    default: null,
  },
  credits: {
    type: Number,
    default: 4,
  },
  Courseplanpath: {
    type: String,
  },
}, { timestamps: true });

const Course = mongoose.model('Course', courseSchema);

export default Course;

