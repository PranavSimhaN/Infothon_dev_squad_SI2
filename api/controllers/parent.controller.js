import User from "../models/user.model.js";
import Course from "../models/course.model.js";
import News from "../models/news.model.js";
import bcryptjs from "bcryptjs";
import { errorHandler } from "../utils/error.js";
import jwt from "jsonwebtoken";
import CourseDetails from "../models/courseDetails.model.js";

export const test = (req, res) => {
    res.json({ message: "hello parent!" });
  };
