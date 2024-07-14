import mongoose from 'mongoose';
import User from './user.model.js';
import Course from './course.model.js';

const coursedetailsSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    validate: {
      validator: async function(studentId) {
        const student = await User.findById(studentId);
        return student && student.role === 'user';
      },
      message: 'Student must be a user with the role of user.',
    },
  },
  midsem: {
    type: Number,
    default: -1,
  },
  endsem: {
    type: Number,
    default: -1,
  },
  internals1: {
    type: Number,
    default: -1,
  },
  internals2: {
    type: Number,
    default: -1,
  },
  internals3: {
    type: Number,
    default: -1,
  },
  grade: {
    type: String,
    enum: ['AA', 'AB', 'BA', 'BB', 'CB', 'CC', 'CD', 'DD', 'FA', 'FF', 'I', '-'],
    default: '-',
  },
  meetlink: {
    type: String,
    maxlength: 300,
    default: null,
  },
}, { timestamps: true });

const CourseDetails = mongoose.model('CourseDetails', coursedetailsSchema);

export default CourseDetails;
