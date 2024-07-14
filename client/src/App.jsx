import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import SignIn from "./pages/SignIn";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import SignUp from "./pages/SignUp";
import Header from "./components/Header";
import Footer from "./components/Footer";
import PrivateRoute from "./components/PrivateRoute";
import AdminPrivateRoute from "./components/AdminPrivateRoute";
import StudentPrivateRoute from "./components/StudentPrivateRoute";
import FacultyPrivateRoute from "./components/FacultyPrivateRoute";
import ParentPrivateRoute from "./components/ParentPrivateRoute";
import AdminAddCourses from "./pages/AdminAddCourses";
import AdminAddNews from "./pages/AdminAddNews";
import StudentCourseRegister from "./pages/StudentCourseRegister";
import ViewCourseStudent from "./pages/ViewCourseStudent";
import ViewCourseFaculty from "./pages/ViewCourseFaculty";
import AdminAddAchievements from "./pages/AdminAddAchievements";
import StudentAddRoom from "./pages/StudentAddRoom";

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
        <Route element={<AdminPrivateRoute />}>
          <Route path="/addcourses" element={<AdminAddCourses />} />
          <Route path="/addnews" element={<AdminAddNews />} />
          <Route path="/addachieve" element={<AdminAddAchievements />} />
        </Route>
        <Route element={<StudentPrivateRoute />}>
          <Route path="/courseregister" element={<StudentCourseRegister />} />
          <Route path="/roomregister" element={<StudentAddRoom />} />
          <Route
            path="/:userId/course/:courseCode"
            element={<ViewCourseStudent />}
          />
        </Route>
        <Route element={<FacultyPrivateRoute />}>
        <Route
            path="/coursefaculty/:courseCode"
            element={<ViewCourseFaculty />}
          />
        </Route>
        <Route element={<ParentPrivateRoute />}></Route>
        <Route path="/projects" element={<Projects />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}
