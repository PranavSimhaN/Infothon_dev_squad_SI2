import express from "express";
import {
  deleteCourse,
  getallfaculty,
  getalluser,
  test,
  updateCourse,
  addnews,
  getallnews,
  deleteNews,
  getCourseStudents,
} from "../controllers/user.controller.js";
import {
  signout,
  addcourses,
  getallcourses,
} from "../controllers/user.controller.js";
import User from "../models/user.model.js";
const router = express.Router();

router.get("/test", test);
router.post("/signout", signout);
router.post("/addcourses", addcourses);
router.put("/updatecourse/:id", updateCourse);
router.delete("/deletecourse/:id", deleteCourse);
router.get("/getallcourses", getallcourses);
router.get("/getallfaculty", getallfaculty);
router.get("/getalluser", getalluser);
router.post("/addnews", addnews);
router.get("/getallnews", getallnews);
router.delete("/deletenews/:id", deleteNews);
router.get('/courses/:courseId/students', getCourseStudents);
router.get("/:studentemail/get-student", async (req, res) => {
  const { studentemail } = req.params;

  try {
    // Find all course registrations for the given student
    const Student = await User.find({
      email: studentemail,
    });

    // Extract relevant course details
    const student_details = Student.map((registration) => ({
      _id: registration._id,
      name: registration.username,
    }));

    res.status(200).json(student_details);
  } catch (error) {
    errorHandler(res, error);
  }
});

export default router;
