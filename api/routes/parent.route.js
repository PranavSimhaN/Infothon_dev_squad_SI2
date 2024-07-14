import express from "express";
import { test } from "../controllers/parent.controller.js";
import User from "../models/user.model.js";
import CourseDetails from "../models/courseDetails.model.js";
import Attendance from "../models/attendance.model.js";
const router = express.Router();

router.get("/test", test);
router.get("/getchildcourses/:parentId", async (req, res) => {
    try {
      const parentId = req.params.parentId;
      const parent = await User.findById(parentId);
      const child = await User.findOne({ _id: parent.parentemail });
      const courses = await CourseDetails.find({ student: child._id })
        .populate({
          path: 'course',
          populate: {
            path: 'faculty',
            model: 'User',
            select: 'username email department',
          },
        });
      res.json(courses);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching child courses' });
    }
  });
  

router.get("/course/:courseId/marks/:childId", async (req, res) => {
    try {
        const { courseId, childId } = req.params;
        const marks = await CourseDetails.findOne({ course: courseId, student: childId });
        res.json(marks);
      } catch (error) {
        res.status(500).json({ error: 'Error fetching course marks' });
      }
});


router.get('/course/:courseId/attendance/:parentEmail', async (req, res) => {
    try {
      const { courseId } = req.params;
      const student = await User.findOne({ _id: req.params.parentEmail });
  
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }
  
      const attendanceRecords = await Attendance.find({ student_id: student._id, courseDetails_id: courseId });
  
      if (!attendanceRecords || attendanceRecords.length === 0) {
        return res.status(404).json({ message: 'No attendance records found' });
      }
  
      res.json(attendanceRecords);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
export default router;
