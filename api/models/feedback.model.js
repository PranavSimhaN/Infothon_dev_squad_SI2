import mongoose from 'mongoose';
import User from './user.model.js';
import Course from './course.model.js';

const feedbackSchema = new mongoose.Schema({
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
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  was_course_helpful: {
    type: Boolean,
    required: true,
  },
  faculty_rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  feedback: {
    type: String,
    required: false,
  },
}, { timestamps: true });

const Feedback = mongoose.model('Feedback', feedbackSchema);

export default Feedback;
