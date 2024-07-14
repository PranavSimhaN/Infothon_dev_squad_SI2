import User from "../models/user.model.js";
import Course from "../models/course.model.js";
import News from "../models/news.model.js";
import bcryptjs from "bcryptjs";
import { errorHandler } from "../utils/error.js";
import jwt from "jsonwebtoken";
import CourseDetails from "../models/courseDetails.model.js";
import Attendance from "../models/attendance.model.js";

export const test = (req, res) => {
  res.json({ message: "hello fac!" });
};

export const getallregisteredcoursesfaculty = async (req, res) => {
  const { facultyId } = req.params;

  try {
    // Find all course registrations for the given faculty
    const courseRegistrations = await Course.find({
      faculty: facultyId,
    }).populate({
      path: "faculty",
      select: "username", // Populate and select only the username of the faculty
    });

    // Extract relevant course details
    const courses = courseRegistrations.map((registration) => ({
      _id: registration._id,
      courseName: registration.courseName,
      courseCode: registration.courseCode,
      schedule: registration.schedule,
      faculty: registration.faculty.username,
      courseDescription: registration.courseDescription,
    }));

    res.status(200).json(courses);
  } catch (error) {
    errorHandler(res, error);
  }
};

export const viewCourseFaculty = async (req, res) => {
  const { courseCode } = req.params;

  try {
    // Find the course by courseCode
    const course = await Course.findOne({
      _id: courseCode,
    });

    if (!course) {
      return res.status(404).json({ message: 'Course not foundddddd' });
    }

    // Extract course details
    const courseDetails = {
      courseId: course._id,
      courseName: course.courseName,
      courseCode: course.courseCode,
      schedule: course.schedule,
      faculty: {
        username: course.faculty.username,
        email: course.faculty.email,
        department: course.faculty.department,
        program: course.faculty.program,
      },
      courseDescription: course.courseDescription,
      credits: course.credits,
      Courseplanpath: course.Courseplanpath,
    };

    // Find all course registrations for the found course
    const courseRegistrations = await CourseDetails.find({ course: course._id })
      .populate({
        path: 'student',
        select: 'username email department program',
      });

    // Extract student details
    const students = courseRegistrations.map((registration) => ({
      _id: registration.student._id,
      username: registration.student.username,
      email: registration.student.email,
      department: registration.student.department,
      program: registration.student.program,
      internals1: registration.internals1,
      internals2: registration.internals2,
      internals3: registration.internals3,
      midsem: registration.midsem,
      endsem: registration.endsem,
      grade: registration.grade,
    }));

    // Combine course details and student details
    const detailedCourse = {
      ...courseDetails,
      students: students,
    };

    // Log the detailed course for debugging

    // Send the detailed course as a JSON response
    res.status(200).json(detailedCourse);
  } catch (error) {
    console.error('Error fetching course details:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteStudentFromCourse = async (req, res) => {
  const { courseCode, studentId } = req.params;

  try {
    const courseDetail = await CourseDetails.findOneAndDelete({
      course: courseCode,
      student: studentId,
    });

    if (!courseDetail) {
      return res.status(404).json({ message: 'Student not found in this course' });
    }

    res.status(200).json({ message: 'Student deleted from course successfully' });
  } catch (error) {
    console.error('Error deleting student from course:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const addAttendance = async (req, res) => {
  const { date, courseDetails_id, faculty_id, students } = req.body;

  try {
    const attendancePromises = students.map(async (student_id) => {
      const existingAttendance = await Attendance.findOne({
        faculty_id,
        courseDetails_id,
        student_id,
        date,
      });

      if (existingAttendance) {
        return { existing: true, student_id };
      } else {
        const newAttendance = new Attendance({
          faculty_id,
          courseDetails_id,
          student_id,
          date,
        });

        await newAttendance.save(); // Ensure newAttendance is a valid Mongoose model instance
        return newAttendance;
      }
    });

    const results = await Promise.all(attendancePromises);

    const existingAttendances = results.filter((result) => result.existing);
    const createdAttendances = results.filter((result) => !result.existing);

    res.status(201).json({
      message: 'Attendance processed successfully',
      existing: existingAttendances.length,
      added: createdAttendances.length,
      details: {
        existing: existingAttendances,
        added: createdAttendances,
      },
    });
  } catch (error) {
    console.error('Error adding attendance:', error);
    res.status(500).json({ error: 'Failed to add attendance' });
  }
};

export const scheduleMeet = async (req, res) => {
  const { student_id, meeting_link, course_id } = req.body;

  try {
    const courseDetail = await CourseDetails.findOneAndUpdate(
      { course: course_id, student: student_id },
      { meetlink: meeting_link },
      { new: true }
    );

    if (!courseDetail) {
      return res.status(404).json({ message: 'Course details not found' });
    }

    setTimeout(async () => {
      try {
        const course = await CourseDetails.findOne({ course: course_id, student: student_id });
        if (course) {
          course.meetlink = null;
          await course.save();
          console.log(`Meetlink destroyed`);
        }
      } catch (error) {
        console.error(`Error setting courseDescription to null: ${error}`);
      }
    }, 30000);
    res.status(200).json({ message: 'Meeting link updated successfully', courseDetail });
  } catch (error) {
    res.status(500).json({ message: 'Error scheduling meeting', error });
  }
};
