import User from "../models/user.model.js";
import Course from "../models/course.model.js";
import News from "../models/news.model.js";
import bcryptjs from "bcryptjs";
import { errorHandler } from "../utils/error.js";
import jwt from "jsonwebtoken";
import CourseDetails from "../models/courseDetails.model.js";

export const test = (req, res) => {
  res.json({ message: "hello student!" });
};

export const courseregister = async (req, res, next) => {
  const { course, student } = req.body;

  try {
    // Check if the student is already registered for the course
    const existingRegistration = await CourseDetails.findOne({
      course,
      student,
    }).populate("course");

    if (existingRegistration) {
      return res.status(400).json({
        success: false,
        message: `You are already registered for the course "${existingRegistration.course.courseName}" (${existingRegistration.course.courseCode}).`,
      });
    }

    // Register the course if no existing registration found
    const courseDetails = new CourseDetails({ course, student });
    await courseDetails.save();

    res
      .status(200)
      .json({ success: true, message: "Course registered successfully!" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while registering the course.",
    });
  }
};

export const getallregisteredcourses = async (req, res) => {
  const { studentId } = req.params;

  try {
    // Find all course registrations for the given student
    const courseRegistrations = await CourseDetails.find({
      student: studentId,
    }).populate({
      path: "course",
      populate: {
        path: "faculty",
        select: "username", // Select only the name field of the faculty
      },
    });

    // Extract relevant course details
    const courses = courseRegistrations.map((registration) => ({
      _id: registration.course._id,
      courseName: registration.course.courseName,
      courseCode: registration.course.courseCode,
      schedule: registration.course.schedule,
      faculty: registration.course.faculty.username,
      courseDescription: registration.course.courseDescription,
    }));

    res.status(200).json(courses);
  } catch (error) {
    errorHandler(res, error);
  }
};

export const viewCourseStudent = async (req, res) => {
  const { userId, courseCode } = req.params;

  console.log(
    "Request received with userId:",
    userId,
    "and courseCode:",
    courseCode
  );

  try {
    const courseRegistration = await CourseDetails.findOne({
      student: userId,
      course: courseCode,
    })
      .populate({
        path: "course",
        populate: {
          path: "faculty",
          select: "username _id",
        },
      })
      .populate({
        path: "student",
        select: "username email department program",
      });

    console.log("Course Registration:", courseRegistration);

    if (!courseRegistration) {
      console.log(
        "Course registration not found for userId:",
        userId,
        "and courseCode:",
        courseCode
      );
      return res
        .status(404)
        .json({ message: "Course registration not foundddd" });
    }

    const courseDetails = {
      courseId: courseRegistration.course._id,
      courseName: courseRegistration.course.courseName,
      courseCode: courseRegistration.course.courseCode,
      schedule: courseRegistration.course.schedule,
      faculty: courseRegistration.course.faculty.username,
      faculty_id: courseRegistration.course.faculty._id,
      courseDescription: courseRegistration.course.courseDescription,
      Courseplanpath: courseRegistration.course.Courseplanpath,
      student: {
        username: courseRegistration.student.username,
        email: courseRegistration.student.email,
        department: courseRegistration.student.department,
        program: courseRegistration.student.program,
      },
      internals1: courseRegistration.internals1,
      internals2: courseRegistration.internals2,
      internals3: courseRegistration.internals3,
      midsem: courseRegistration.midsem,
      endsem: courseRegistration.endsem,
      grade: courseRegistration.grade,
    };

    console.log("Course Details:", courseDetails);

    res.status(200).json(courseDetails);
  } catch (error) {
    console.error("Error fetching course details:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMeetingLink = async (req, res) => {
  const { student_id } = req.query;

  try {
    // Fetch the user to check if the role is parent
    const user = await User.findById(student_id);

    let actualStudentId = student_id;

    // If the user is a parent, use the associated student ID
    if (user && user.role === "parent") {
      actualStudentId = user.parentemail;
    }

    // Find the course details that include the student and have a meeting link
    const courseDetails = await CourseDetails.findOne({
      student: actualStudentId,
      meetlink: { $ne: null },
    })
      .populate("course")
      .populate("student");

    if (courseDetails) {
      return res.status(200).json({
        meetingLink: courseDetails.meetlink,
        courseName: courseDetails.course.courseName,
      });
    } else {
      return res
        .status(404)
        .json({ message: "No meeting link found for this student." });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};
