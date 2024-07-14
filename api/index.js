import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRoutes from "./routes/user.route.js";
import authRoutes from "./routes/auth.route.js";
import studentRoutes from "./routes/student.route.js";
import facultyRoutes from "./routes/faculty.route.js";
import parentRoutes from "./routes/parent.route.js";

dotenv.config();

mongoose
  .connect("mongodb://127.0.0.1:27017/react", { useNewUrlParser: true })
  .then(() => console.log("connected successfully...."))
  .catch((err) => console.log(err));
// mongoose.set("useCreateIndex", true);mongoose.set("useCreateIndex", true);
mongoose.set("strictQuery", true);

const app = express();

app.use(express.json());

app.listen(3001, () => {
  console.log("Server is running in port 3001");
});

app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/parent", parentRoutes);

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});
