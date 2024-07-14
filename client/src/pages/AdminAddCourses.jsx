import {
  Alert,
  Button,
  Label,
  Spinner,
  TextInput,
  Select,
  Modal,
} from "flowbite-react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  signInStart,
  signInSuccess,
  signInFailure,
} from "../redux/user/userSlice";
import { Checkbox, Table } from "flowbite-react";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { toggleTheme } from "../redux/theme/themeSlice";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { RiArrowGoBackFill } from "react-icons/ri";

export default function AdminAddCourses() {
  const [formData, setFormData] = useState({});
  const [editFormData, setEditFormData] = useState({});
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { loading, error: errorMessage } = useSelector((state) => state.user);
  const { currentUser } = useSelector((state) => state.user);
  const { currentTheme } = useSelector((state) => state.theme);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value.trim() });
  };

  const handleEditChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.id]: e.target.value.trim() });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.courseCode || !formData.courseName) {
      return dispatch(signInFailure("Please fill all the fields"));
    }
    try {
      dispatch(signInStart());
      console.log("sign in start");
      const res = await fetch("/api/user/addcourses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(signInFailure(data.message));
      }
      if (res.ok) {
        dispatch(signInSuccess(currentUser));
        console.log("sign in success");
        navigate("/addcourses");
        window.location.reload();
      }
    } catch (error) {
      dispatch(signInFailure(error.message));
      console.log("sign in failure");
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/user/updatecourse/${editFormData._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editFormData),
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(signInFailure(data.message));
      }
      if (res.ok) {
        setIsEditModalOpen(false);
        navigate("/addcourses");
        window.location.reload();
      }
    } catch (error) {
      dispatch(signInFailure(error.message));
    }
  };

  // Add these state variables at the beginning of your component
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);

  // Function to handle delete click
  const handleDeleteClick = (course) => {
    setCourseToDelete(course);
    setIsDeleteModalOpen(true);
  };

  // Function to delete the selected course
  const handleDeleteCourse = async (course) => {
    try {
      // Perform deletion logic here
      // For example, you can send a DELETE request to your API
      await axios.delete(`/api/user/deletecourse/${course._id}`);

      // Optionally, you can update the courses state to reflect the deletion
      setCourses((prevCourses) =>
        prevCourses.filter((c) => c._id !== course._id)
      );

      // Close the delete modal
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error("Error deleting course:", error);
    }
  };

  // Function to cancel delete
  const handleDeleteCancel = () => {
    // Close the delete modal
    setIsDeleteModalOpen(false);
  };

  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get("/api/user/getallcourses");
        setCourses(response.data);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    fetchCourses();
  }, []);

  const [facultyUsers, setFacultyUsers] = useState([]);

  useEffect(() => {
    const fetchFacultyUsers = async () => {
      try {
        const response = await axios.get("/api/user/getallfaculty");
        setFacultyUsers(response.data);
      } catch (error) {
        console.error("Error fetching faculty users:", error);
      }
    };
    fetchFacultyUsers();
  }, []);

  const scheduleOptions = [
    "MWF 13:00-14:00",
    "TTh 11:00-12:30",
    "TTh 9:00-10:30",
    "MWF 08:00-09:00",
    "MWF 09:00-10:00",
    "MWF 10:00-11:00",
    "MWF 14:00-15:00",
    "TTh 08:00-09:30",
    "TTh 10:00-11:30",
    "TTh 13:00-14:30",
    "FTh 08:00-10:00",
  ];

  const handleEditClick = (course) => {
    setEditFormData(course);
    setIsEditModalOpen(true);
  };

  return (
    <div className="pb-20 mt-20">
      <div className="pb-20 mt-20">
        <div className="flex p-3 max-w-3xl mx-auto flex-col items-center gap-10">
          <div className="w-full max-w-lg">
            <h2 className="text-3xl font-bold mb-6 text-center">
              <Link to="/dashboard?tab=profile">
                <RiArrowGoBackFill className="inline mr-5 cursor-pointer" />
              </Link>
              Add a New Course
            </h2>
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              <div>
                <Label value="Course Name" />
                <TextInput
                  type="text"
                  placeholder="Ex: Data structures"
                  id="courseName"
                  onChange={handleChange}
                  className="w-full p-2"
                />
              </div>
              <div>
                <Label value="Course code" />
                <TextInput
                  type="text"
                  placeholder="Ex: CS200"
                  id="courseCode"
                  onChange={handleChange}
                  className="w-full p-2"
                />
              </div>

              <div className="mb-2 block">
                <Label value="Select the faculty" />
                <Select
                  id="faculty"
                  value={formData.faculty}
                  onChange={handleChange}
                  required
                  className="w-full p-2"
                >
                  <option value="">Select</option>
                  {facultyUsers.map((faculty) => (
                    <option key={faculty._id} value={faculty._id}>
                      {faculty.username}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <Label value="Course description" />
                <TextInput
                  type="text"
                  placeholder="Something about the course..."
                  id="courseDescription"
                  onChange={handleChange}
                  className="w-full p-2"
                />
              </div>

              <div className="mb-2 block">
                <Label value="Select the schedule" />
                <Select
                  id="schedule"
                  value={formData.schedule}
                  onChange={handleChange}
                  className="w-full p-2"
                >
                  <option value="">Select</option>
                  {scheduleOptions.map((schedule) => (
                    <option key={schedule} value={schedule}>
                      {schedule}
                    </option>
                  ))}
                </Select>
              </div>
              <Button
                gradientDuoTone="purpleToPink"
                type="submit"
                disabled={false}
                className="w-full p-2"
              >
                {loading ? "Add course" : "Add course"}
              </Button>
            </form>
            {errorMessage && (
              <Alert className="mt-5" color="failure">
                {errorMessage}
              </Alert>
            )}
          </div>
        </div>
      </div>
      <div className="overflow-x-auto p-8">
        <Table hoverable>
          <Table.Head>
            <Table.HeadCell>Course Name</Table.HeadCell>
            <Table.HeadCell>Faculty</Table.HeadCell>
            <Table.HeadCell>Course Code</Table.HeadCell>
            <Table.HeadCell>Schedule</Table.HeadCell>
            <Table.HeadCell>Course Description</Table.HeadCell>
            <Table.HeadCell>
              <span className="sr-only">Edit</span>
            </Table.HeadCell>
            <Table.HeadCell>
              <span className="sr-only">Delete</span>
            </Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y">
            {courses.map((course) => (
              <Table.Row
                key={course._id}
                className="bg-white dark:border-gray-700 dark:bg-gray-800"
              >
                <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                  {course.courseName}
                </Table.Cell>
                <Table.Cell>{course.faculty.username}</Table.Cell>
                <Table.Cell>{course.courseCode}</Table.Cell>
                <Table.Cell>{course.schedule}</Table.Cell>
                <Table.Cell>{course.courseDescription}</Table.Cell>
                <Table.Cell>
                  <button
                    className="font-medium text-cyan-600 hover:underline dark:text-cyan-500"
                    onClick={() => handleEditClick(course)}
                  >
                    Edit
                  </button>
                </Table.Cell>
                <Table.Cell>
                  <button
                    className="font-medium text-red-600 hover:underline dark:text-red-500"
                    onClick={() => handleDeleteClick(course)}
                  >
                    Delete
                  </button>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>
      <Modal
        show={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        className={currentTheme}
      >
        <Modal.Header>Edit Course</Modal.Header>
        <Modal.Body>
          <form className="flex flex-col gap-4" onSubmit={handleEditSubmit}>
            <div>
              <Label value="Course Name" />
              <TextInput
                type="text"
                placeholder="Ex: Data structures"
                id="courseName"
                value={editFormData.courseName}
                onChange={handleEditChange}
                className="w-full p-2"
                disabled
              />
            </div>
            <div>
              <Label value="Course code" />
              <TextInput
                type="text"
                placeholder="Ex: CS200"
                id="courseCode"
                value={editFormData.courseCode}
                onChange={handleEditChange}
                className="w-full p-2"
                disabled
              />
            </div>
            <div>
              <Label value="Course description" />
              <TextInput
                type="text"
                placeholder="Something about the course..."
                id="courseDescription"
                value={editFormData.courseDescription}
                onChange={handleEditChange}
                className="w-full p-2"
              />
            </div>
            <div className="mb-2 block">
              <Label value="Select the schedule" />
              <Select
                id="schedule"
                value={editFormData.schedule}
                onChange={handleEditChange}
                className="w-full p-2"
              >
                <option value="">Select</option>
                {scheduleOptions.map((schedule) => (
                  <option key={schedule} value={schedule}>
                    {schedule}
                  </option>
                ))}
              </Select>
            </div>
            <Button
              gradientDuoTone="purpleToPink"
              type="submit"
              disabled={loading}
              className="w-full p-2"
            >
              {loading ? (
                <>
                  <Spinner size="sm" />
                  <span className="pl-3">Loading...</span>
                </>
              ) : (
                "Update course"
              )}
            </Button>
          </form>
        </Modal.Body>
      </Modal>

      <Modal
        show={isDeleteModalOpen}
        size="md"
        onClose={() => setIsDeleteModalOpen(false)}
        popup
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
            <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
              Are you sure you want to delete this course?
            </h3>
            <div className="flex justify-center gap-4">
              <Button
                color="failure"
                onClick={() => handleDeleteCourse(courseToDelete)}
              >
                {"Yes, I'm sure"}
              </Button>
              <Button color="gray" onClick={() => setIsDeleteModalOpen(false)}>
                No, cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
