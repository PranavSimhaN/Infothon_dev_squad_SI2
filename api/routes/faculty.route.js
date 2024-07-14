import express from "express";
import {
  addAttendance,
  deleteStudentFromCourse,
  getallregisteredcoursesfaculty,
  scheduleMeet,
  test,
  viewCourseFaculty,
} from "../controllers/faculty.controller.js";
import Attendance from "../models/attendance.model.js";
import CourseDetails from "../models/courseDetails.model.js";
import multer from "multer";
import Course from "../models/course.model.js";
import path from "path";
import { fileURLToPath } from 'url';
import Feedback from "../models/feedback.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: function(req,file,cb){
    cb(null, path.join(__dirname, '../../client/public'));
  },
  filename:function(req,file,cb){
    return  cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

const router = express.Router();

router.get("/test", test);
router.get("/:facultyId/courses", getallregisteredcoursesfaculty);
router.get("/coursefaculty/:courseCode", viewCourseFaculty);
router.delete(
  "/course/:courseCode/student/:studentId",
  deleteStudentFromCourse
);
router.post("/attendance/add", addAttendance);
router.get("/getattendance", async (req, res) => {
  const { courseDetails_id, faculty_id, date } = req.query;

  try {
    const attendanceRecords = await Attendance.find({
      courseDetails_id,
      faculty_id,
      date,
    }).populate("student_id", "username email department program"); // Populate student details

    res.status(200).json(attendanceRecords);
  } catch (error) {
    console.error("Error fetching attendance data:", error);
    res.status(500).json({ error: "Failed to fetch attendance data" });
  }
});

router.post("/attendance/mark", async (req, res) => {
  const { date, courseDetails_id, faculty_id, student_id, attended } = req.body;

  try {
    // Find the existing attendance record
    let attendance = await Attendance.findOne({
      date: date,
      courseDetails_id: courseDetails_id,
      faculty_id: faculty_id,
      student_id: student_id,
    });

    if (!attendance) {
      return res.status(404).json({ message: "Attendance record not found" });
    }

    // Update existing attendance record
    attendance.attended = attended;
    await attendance.save();

    res.status(200).json({ message: "Attendance updated successfully" });
  } catch (error) {
    console.error("Error updating attendance:", error.message);
    res.status(500).json({ message: "Failed to update attendance" });
  }
});

router.put("/updatemarks/:courseCode/:student", async (req, res) => {
  const { courseCode,student } = req.params;
  const { internals1, internals2, internals3, midsem, endsem, grade } =
    req.body;

  try {
    const courseDetails = await CourseDetails.findOne({ student, course: courseCode });
    if (!courseDetails) {
      return res
        .status(404)
        .json({ success: false, message: "Course details not found" });
    }

    courseDetails.internals1 = internals1 ?? courseDetails.internals1;
    courseDetails.internals2 = internals2 ?? courseDetails.internals2;
    courseDetails.internals3 = internals3 ?? courseDetails.internals3;
    courseDetails.midsem = midsem ?? courseDetails.midsem;
    courseDetails.endsem = endsem ?? courseDetails.endsem;
    courseDetails.grade = grade ?? courseDetails.grade;

    await courseDetails.save();

    res
      .status(200)
      .json({
        success: true,
        message: "Marks updated successfully",
        data: courseDetails,
      });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/uploadmaterial', upload.single('link'), async (req, res) => {
  try {
    // Handle file upload logic here
    console.log(req.file); // Check if file is received correctly
    console.log(req.body);
    let courseCode = req.body.code;
    console.log(courseCode);
    
    const courseDetails = await Course.findOne({ _id: courseCode });
    if (!courseDetails) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }
    const fileName = req.file.path.substring(
      req.file.path.lastIndexOf("\\") + 1
    );
    const srcAttribute = `../../public/${fileName}`;
    courseDetails.Courseplanpath = srcAttribute;
    await courseDetails.save();
    
    res.status(200).json({
      success: true,
      message: "File uploaded and course plan updated successfully",
      data: courseDetails,
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).send({ error: 'Internal Server Error' });
  }
});

router.get('/getcourse/:courseCode', async (req, res) => {
  try {
    const courseCode = req.params.courseCode;
    const courseDetails = await Course.findOne({ courseCode });

    if (!courseDetails) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    res.status(200).json({ success: true, data: courseDetails });
  } catch (error) {
    console.error('Error fetching course details:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

router.post('/schedulemeet', scheduleMeet);

router.get('/feedback', async (req, res) => {
  const courseCode = req.query.course;
  
  try {
    const feedbacks = await Feedback.find({ courseCode });
    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching feedback', error });
  }
});

export default router;
