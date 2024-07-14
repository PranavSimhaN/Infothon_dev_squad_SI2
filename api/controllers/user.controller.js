import User from "../models/user.model.js";
import Course from "../models/course.model.js";
import News from "../models/news.model.js";
import bcryptjs from "bcryptjs";
import { errorHandler } from "../utils/error.js";
import jwt from "jsonwebtoken";
import CourseDetails from "../models/courseDetails.model.js";
import { setTimeout } from "timers";

export const test = (req, res) => {
  res.json({ message: "hello World!" });
};

export const signout = (req, res, next) => {
  try {
    res
      .clearCookie("access_token")
      .status(200)
      .json("User has been signed out");
  } catch (error) {
    next(error);
  }
};

export const addcourses = async (req, res, next) => {
  const {
    courseName,
    faculty,
    courseCode,
    schedule,
    courseDescription,
    credits,
  } = req.body;
  if (
    !courseName ||
    !faculty ||
    !courseCode ||
    courseName === "" ||
    faculty === "" ||
    courseCode === ""
  ) {
    next(errorHandler(400, "Fill all details"));
  }
  const newCourse = new Course({
    courseName,
    faculty,
    courseCode,
    schedule,
    courseDescription,
    credits, 
  });
  try {
    await newCourse.save();
    res.json("Course added successfully");
  } catch (error) {
    next(error);
  };
};

export const updateCourse = async (req, res, next) => {
  const { courseName, faculty, courseCode, schedule, courseDescription } =
    req.body;
  const courseId = req.params.id;

  try {
    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      { courseName, faculty, courseCode, schedule, courseDescription },
      { new: true }
    );
    if (!updatedCourse) {
      return next(errorHandler(404, "Course not found"));
    }
    res.json({ message: "Course updated successfully", course: updatedCourse });
  } catch (error) {
    next(error);
  }
};

export const deleteCourse = async (req, res, next) => {
  const courseId = req.params.id;

  try {
    const deletedCourse = await Course.findByIdAndDelete(courseId);
    if (!deletedCourse) {
      return next(errorHandler(404, "Course not found"));
    }
    res.json({ message: "Course deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const getallcourses = async (req, res, next) => {
  try {
    const courses = await Course.find().populate("faculty", "username email");
    res.json(courses);
  } catch (error) {
    next(error);
  }
};

export const getCourseStudents = async (req, res) => {
  const { courseId } = req.params;

  try {
    const courseDetails = await CourseDetails.find({
      course: courseId,
    }).populate("student", "username email");
    res.status(200).json(courseDetails);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getallfaculty = async (req, res) => {
  try {
    const facultyUsers = await User.find({ role: "faculty" });
    res.json(facultyUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getalluser = async (req, res) => {
  try {
    const Users = await User.find({ role: "user" });
    res.json(Users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addnews = async (req, res, next) => {
  const { sentence, link, type } = req.body;
  if (!sentence || !link || sentence === "" || link === "") {
    next(errorHandler(400, "Fill all details"));
  }
  const newNews = new News({
    sentence,
    link,
    type,
  });

  try {
    await newNews.save();
    res.json("News added successfully");
  } catch (error) {
    next(error);
  }
};

export const getallnews = async (req, res, next) => {
  try {
    const news = await News.find();
    res.json(news);
  } catch (error) {
    next(error);
  }
};

export const deleteNews = async (req, res, next) => {
  const newsId = req.params.id;

  try {
    const deletedNews = await News.findByIdAndDelete(newsId);
    if (!deletedNews) {
      return next(errorHandler(404, "News item not found"));
    }
    res.json({ message: "News item deleted successfully" });
  } catch (error) {
    next(error);
  }
};
