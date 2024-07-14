import express from "express";
import { getMeetingLink, test } from "../controllers/student.controller.js";
import {
  courseregister,
  getallregisteredcourses,
  viewCourseStudent,
} from "../controllers/student.controller.js";
import Attendance from "../models/attendance.model.js";
import Feedback from "../models/feedback.model.js";
import User from "../models/user.model.js";
import CourseDetails from "../models/courseDetails.model.js";
import HostelRoom from "../models/hostelrooms.model.js";
import mongoose from "mongoose";
import RoomBooking from "../models/hostelrooms.model.js";
const router = express.Router();

router.get("/test", test);
router.post("/courseregister", courseregister);
router.get("/:studentId/courses", getallregisteredcourses);
router.get("/:userId/course/:courseCode", viewCourseStudent);
router.get("/:studentId/course/:courseId/attendance", async (req, res) => {
  const { studentId, courseId } = req.params;

  try {
    const attendanceRecords = await Attendance.find({
      student_id: studentId,
      courseDetails_id: courseId,
    });

    if (!attendanceRecords) {
      return res.status(404).json({ message: "No attendance records found" });
    }

    res.status(200).json(attendanceRecords);
  } catch (error) {
    console.error("Error fetching attendance records:", error.message);
    res.status(500).json({ message: "Failed to fetch attendance records" });
  }
});

router.get("/getmeetinglink", getMeetingLink);
router.post("/feedback", async (req, res) => {
  try {
    const {
      student,
      faculty,
      course,
      was_course_helpful,
      faculty_rating,
      feedback,
    } = req.body;

    if (
      !student ||
      !faculty ||
      !course ||
      was_course_helpful === undefined ||
      !faculty_rating
    ) {
      return res
        .status(400)
        .json({ message: "All required fields must be provided." });
    }

    // Validate student and faculty roles
    const studentUser = await User.findById(student);
    const facultyUser = await User.findById(faculty);

    if (!studentUser || studentUser.role !== "user") {
      return res
        .status(400)
        .json({ message: "Student must be a user with the role of user." });
    }

    if (!facultyUser || facultyUser.role !== "faculty") {
      return res
        .status(400)
        .json({ message: "Faculty must be a user with the role of faculty." });
    }

    // Check if feedback already exists for the given student, faculty, and course
    let existingFeedback = await Feedback.findOne({ student, faculty, course });

    if (existingFeedback) {
      // Update existing feedback
      existingFeedback.was_course_helpful = was_course_helpful;
      existingFeedback.faculty_rating = faculty_rating;
      existingFeedback.feedback = feedback;
      await existingFeedback.save();
      res
        .status(200)
        .json({
          message: "Feedback updated successfully",
          feedback: existingFeedback,
        });
    } else {
      // Create new feedback
      const newFeedback = new Feedback({
        student,
        faculty,
        course,
        was_course_helpful,
        faculty_rating,
        feedback,
      });
      await newFeedback.save();
      res
        .status(201)
        .json({
          message: "Feedback created successfully",
          feedback: newFeedback,
        });
    }
  } catch (error) {
    console.error("Error submitting feedback:", error);
    res.status(400).json({ message: error.message });
  }
});

// Endpoint to get student grades and calculate average
const gradeToPoints = {
  AA: 10,
  AB: 9,
  BA: 8,
  BB: 7,
  CB: 6,
  CC: 5,
  CD: 4,
  DD: 3,
  FA: 0,
  FF: 0,
  I: 0,
};

router.get("/:id/average-grade", async (req, res) => {
  try {
    const { id } = req.params;
    const courseDetails = await CourseDetails.find({ student: id });

    let totalPoints = 0;
    let totalCourses = 0;

    courseDetails.forEach((detail) => {
      const grade = detail.grade;
      if (grade in gradeToPoints) {
        totalPoints += gradeToPoints[grade];
        totalCourses += 1;
      }
    });

    const averageGrade =
      totalCourses > 0 ? (totalPoints / totalCourses).toFixed(2) : 0;

    res.json({ averageGrade });
  } catch (error) {
    console.error("Error fetching average grade:", error);
    res.status(500).send("Server Error");
  }
});
router.post("/registerRoom", async (req, res) => {
  const { room, studentId } = req.body;

  try {
    // Check if the room is already booked
    const existingBooking = await RoomBooking.findOne({ roomNumber: room });
    if (existingBooking) {
      return res
        .status(400)
        .json({ message: "Room already booked by another student" });
    }

    // Check if the student already has a room booking
    const studentBooking = await RoomBooking.findOne({ studentId });
    if (studentBooking) {
      return res
        .status(400)
        .json({ message: "Student already registered for a room" });
    }

    // Create a new room booking
    const newBooking = new RoomBooking({ roomNumber: room, studentId });
    await newBooking.save();

    // Update the user's hostelroom field
    const updatedUser = await User.findOneAndUpdate(
      { _id: studentId },
      { hostelroom: room },
      { new: true } // To return the updated document
    );

    res.status(201).json({ newBooking, updatedUser });
  } catch (error) {
    console.error("Error registering room:", error);
    res.status(500).json({ message: "Failed to register room" });
  }
});
export default router;
