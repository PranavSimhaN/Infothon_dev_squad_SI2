import React, { useEffect, useState } from "react";
import { Button, Select, Label, Modal } from "flowbite-react";
import { useSelector } from "react-redux";
import { useNavigate,Link } from "react-router-dom";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { RiArrowGoBackFill } from "react-icons/ri";


export default function StudentCourseRegister() {
  const [courses, setCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState({
    course1: "",
    course2: "",
    course3: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch("/api/user/getallcourses");
        const data = await res.json();
        setCourses(data);
      } catch (error) {
        console.log(error.message);
      }
    };

    fetchCourses();
  }, []);

  const handleChange = (e) => {
    setSelectedCourses({ ...selectedCourses, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { course1, course2, course3 } = selectedCourses;
    if (course1 === course2 || course1 === course3 || course2 === course3) {
      setModalMessage(
        "You have selected the same course more than once. Please select different courses."
      );
      setIsError(true);
      setIsModalOpen(true);
      return;
    }
    setModalMessage("Are you sure you want to register for these courses?");
    setIsError(false);
    setIsModalOpen(true);
  };

  const handleRegister = async () => {
    try {
      const registerCourses = async (courseId) => {
        const res = await fetch("/api/student/courseregister", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            course: courseId,
            student: currentUser._id,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message);
        }
      };

      await Promise.all([
        registerCourses(selectedCourses.course1),
        registerCourses(selectedCourses.course2),
        registerCourses(selectedCourses.course3),
      ]);

      navigate("/dashboard?tab=profile");
    } catch (error) {
      setModalMessage(error.message);
      setIsError(true);
      setIsModalOpen(true);
    }
  };

  return (
    <div className="pb-20 mt-20 flex justify-center">
      <form
        onSubmit={handleSubmit}
        className="max-w-3xl mx-auto flex flex-col gap-5 items-center"
      >
        <h2 className="text-3xl font-bold mb-6 text-center">
          <Link to="/dashboard?tab=profile">
            <RiArrowGoBackFill className="inline mr-5 cursor-pointer" />
          </Link>
          Register for Courses
        </h2>

        {[1, 2, 3].map((i) => (
          <div key={i} className="w-full max-w-sm">
            <Label htmlFor={`course${i}`} value={`Select Course ${i}`} />
            <Select
              id={`course${i}`}
              name={`course${i}`}
              onChange={handleChange}
              required
            >
              <option value="" disabled selected>
                Select Course {i}
              </option>
              {courses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.courseName} ({course.courseCode})
                </option>
              ))}
            </Select>
          </div>
        ))}

        <Button type="submit" gradientDuoTone="purpleToBlue" size="xl">
          Register
        </Button>
      </form>

      <Modal
        show={isModalOpen}
        size="md"
        onClose={() => setIsModalOpen(false)}
        popup
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
            <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
              {modalMessage}
            </h3>
            <div className="flex justify-center gap-4">
              {!isError && (
                <Button color="success" onClick={handleRegister}>
                  Yes, I'm sure
                </Button>
              )}
              <Button color="gray" onClick={() => setIsModalOpen(false)}>
                {isError ? "Close" : "No, cancel"}
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
