import mongoose from 'mongoose';
import Course from './course.model.js';
import User from './user.model.js';
import CourseDetails from './courseDetails.model.js';

const attendanceSchema = new mongoose.Schema({
  faculty_id: {
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
  student_id: {
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
  courseDetails_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  attended: {
    type: Boolean,
    default: true,
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const Attendance = mongoose.model('Attendance', attendanceSchema);

export default Attendance;