import User from '../models/user.model.js';
import bcryptjs from 'bcryptjs';
import { errorHandler } from '../utils/error.js';
import jwt from 'jsonwebtoken';
import nodemailer from "nodemailer";

export const signup = async (req, res,next) => {
  const { username, email, password, department, program, role, parentemail} = req.body;

  if (
    !username ||
    !email ||
    !password ||
    username === '' ||
    email === '' ||
    password === ''
  ) {
    next(errorHandler(400, 'All fields are required'));
  }

  const hashedPassword = bcryptjs.hashSync(password, 10);

  const newUser = new User({
    username,
    email,
    password: hashedPassword,
    department,
    program,
    role,
    parentemail
  });

  try {
    await newUser.save();
    const msg = {
      from: "simhapranav.3@gmail.com",
      to: email,
      subject: "IRIS VVCE",
      text:
        "Hello " +
        username +
        ", " + "Your account has been registered, " +
        "From IRIS VVCE",
    };

    nodemailer
      .createTransport({
        service: "gmail",
        auth: {
          user: "simhapranav.3@gmail.com",
          pass: process.env.NODE_MAIL_PASSCODE,
        },
        port: 587,
        secure: false,
        host: "smtp.gmail.com",
      })

      .sendMail(msg, (err) => {
        if (err) {
          return console.log("Error occurs", err);
        } else {
          return console.log("Email Sent");
        }
      });
    res.json('Signup successful');
  } catch (error) {
    next(error);
  }
};

export const signin = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password || email === '' || password === '') {
    next(errorHandler(400, 'All fields are required'));
  }

  try {
    const validUser = await User.findOne({ email });
    if (!validUser) {
      return next(errorHandler(404, 'User not found'));
    }
    // if you add return it will not read next line 
    const validPassword = bcryptjs.compareSync(password, validUser.password);
    if (!validPassword) {
      return next(errorHandler(400, 'Invalid password'));
    }

    const token = jwt.sign({ id: validUser._id, role: validUser.role }, process.env.JWT_SECRET);

    const { password: pass, ...rest } = validUser._doc;
    // we are avoiding password not to get in the token
    // this is separating password from the rest

    res
      .status(200)
      .cookie('access_token', token, {
        httpOnly: true,
      })
      .json(rest); // instead of sending .json(validUser); we are sending rest
  } catch (error) {
    next(error);
  }
};