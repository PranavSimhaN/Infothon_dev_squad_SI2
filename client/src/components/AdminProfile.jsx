import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { HiOutlineUserGroup } from "react-icons/hi";
import { Button, Table, Modal } from "flowbite-react";
import { Link } from "react-router-dom";
import axios from "axios";

export default function AdminProfile() {
  const { currentUser } = useSelector((state) => state.user);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseStudents, setCourseStudents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [news, setNews] = useState([]);


  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch("/api/user/getallcourses");
        const data = await res.json();
        setCourses(data);
      } catch (error) {
        console.error("Error fetching courses:", error.message);
      }
    };
    const fetchNews = async () => {
      try {
        const response = await axios.get("/api/user/getallnews");
        setNews(response.data);
      } catch (error) {
        console.error("Error fetching news:", error);
      }
    };
    fetchNews();
    fetchCourses();
  }, []);

  const handleViewStudents = async (courseId) => {
    try {
      const res = await fetch(`/api/user/courses/${courseId}/students`);
      const data = await res.json();
      setCourseStudents(data);
      setSelectedCourse(courseId);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error fetching course students:", error.message);
    }
  };

  return (
    <div className="p-3 md:mx-auto">
      <div className="flex-wrap flex gap-4 justify-center">
        {/* Total Users Card */}
        <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md">
          <div className="flex justify-between">
            <div className="">
              <h3 className="text-gray-500 text-md uppercase">Name</h3>
              <p className="text-2xl">{currentUser.username}</p>
            </div>
            <HiOutlineUserGroup className="bg-teal-600  text-white rounded-full text-5xl p-3 shadow-lg" />
          </div>
          <div className="flex gap-2 text-sm">
            <span className="text-green-500 flex items-center">
              {currentUser.program}
            </span>
            <div className="text-gray-500">{currentUser.department}</div>
          </div>
        </div>

        {/* Total Comments Card */}
        <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md">
          <div className="flex justify-between">
            <div>
              <h3 className="text-gray-500 text-md uppercase">email</h3>
              <p className="text-xl">{currentUser.email}</p>
            </div>
            <HiOutlineUserGroup className="bg-teal-600 text-white rounded-full text-5xl p-3 shadow-lg" />
          </div>
        </div>

        {/* Total Posts Card */}
     
      </div>

      {/* Courses Registered Table */}
      <div className="flex flex-wrap gap-4 py-3 mx-auto justify-center">
        <div className="flex flex-col w-full md:w-auto shadow-md p-2 rounded-md dark:bg-gray-800">
          <div className="flex justify-between p-3 text-xl font-semibold">
            <h1 className="text-center p-2">Courses Registered</h1>
          </div>
          <Table hoverable>
            <Table.Head>
              <Table.HeadCell>Course Name</Table.HeadCell>
              <Table.HeadCell className="hidden md:table-cell">Course Code</Table.HeadCell>
              <Table.HeadCell className="hidden md:table-cell">Faculty Name</Table.HeadCell>
              <Table.HeadCell className="hidden xl:table-cell">
                Description
              </Table.HeadCell>
              <Table.HeadCell>View Students</Table.HeadCell>
            </Table.Head>
            {courses.map((course) => (
              <Table.Body key={course._id} className="divide-y">
                <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
                  <Table.Cell>{course.courseName}</Table.Cell>
                  <Table.Cell className="hidden md:table-cell">{course.courseCode}</Table.Cell>
                  <Table.Cell className="hidden md:table-cell">{course.faculty.username}</Table.Cell>
                  <Table.Cell className="hidden xl:table-cell">
                    {course.courseDescription}
                  </Table.Cell>
                  <Table.Cell>
                    <Button onClick={() => handleViewStudents(course._id)}>
                      View Students
                    </Button>
                  </Table.Cell>
                </Table.Row>
              </Table.Body>
            ))}
          </Table>
        </div>
      </div>

      <div className="overflow-x-auto p-8">
      <h1 className="text-center p-2 text-xl font-semibold">News and Achievements</h1>
        <Table hoverable>
          <Table.Head>
            <Table.HeadCell>Sentence</Table.HeadCell>
            <Table.HeadCell>Link</Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y">
            {news.map((newsItem) =>
                <Table.Row
                  key={newsItem._id}
                  className="bg-white dark:border-gray-700 dark:bg-gray-800"
                >
                  <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                    {newsItem.sentence}
                  </Table.Cell>
                  <Table.Cell>
                    <a
                      href={newsItem.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-600 hover:underline dark:text-cyan-500"
                    >
                      {newsItem.link}
                    </a>
                  </Table.Cell>
                </Table.Row>
            )}
          </Table.Body>
        </Table>
      </div>

      <Modal
        show={isModalOpen}
        size="md"
        onClose={() => setIsModalOpen(false)}
        popup
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
              Students Registered
            </h3>
            <Table hoverable>
              <Table.Head>
                <Table.HeadCell>Student Name</Table.HeadCell>
                <Table.HeadCell>Student Email</Table.HeadCell>
              </Table.Head>
              {courseStudents.map((student) => (
                <Table.Body key={student._id} className="divide-y">
                  <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
                    <Table.Cell>{student.student.username}</Table.Cell>
                    <Table.Cell>{student.student.email}</Table.Cell>
                  </Table.Row>
                </Table.Body>
              ))}
            </Table>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
