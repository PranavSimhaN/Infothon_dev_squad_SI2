import React, { useEffect, useState } from "react";
// import * as React from "react";
import { useSelector } from "react-redux";
import { HiOutlineUserGroup } from "react-icons/hi";
import { Button, Table, Modal } from "flowbite-react";
import axios from "axios";
import { BarChart } from "@mui/x-charts/BarChart";
import { PieChart, pieArcLabelClasses } from "@mui/x-charts/PieChart";

export default function ParentProfile() {
  const { currentUser } = useSelector((state) => state.user);
  const [childCourses, setChildCourses] = useState([]);
  const [selectedCourseDetails, setSelectedCourseDetails] = useState([]);
  const [isMarksModalOpen, setIsMarksModalOpen] = useState(false);
  const [attendanceDetails, setAttendanceDetails] = useState([]);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [news, setNews] = useState([]);

  const data = [
    { label: "Internals", value: 30, color: "#0088FE" }, // Midsem
    { label: "Midsem", value: 25, color: "#00C49F" }, // Endsem
    { label: "Ensdem", value: 45, color: "#FFBB28" }, // Grade
  ];

  const sizing = {
    margin: { right: 5 },
    width: 250,
    height: 250,
    legend: { hidden: true },
  };

  const TOTAL = data.map((item) => item.value).reduce((a, b) => a + b, 0);

  const getArcLabel = (params) => {
    const percent = params.value / TOTAL;
    return `${(percent * 100).toFixed(0)}%`;
  };

  useEffect(() => {
    const fetchChildCourses = async () => {
      try {
        const res = await axios.get(
          `/api/parent/getchildcourses/${currentUser._id}`
        );
        setChildCourses(res.data);
      } catch (error) {
        console.error("Error fetching child courses:", error.message);
      }
    };
    fetchChildCourses();

    const fetchNews = async () => {
      try {
        const response = await axios.get("/api/user/getallnews");
        setNews(response.data);
      } catch (error) {
        console.error("Error fetching news:", error);
      }
    };
    fetchNews();
  }, [currentUser]);

  const handleViewMarks = async (courseId) => {
    try {
      const res = await axios.get(
        `/api/parent/course/${courseId}/marks/${currentUser.parentemail}`
      );
      setSelectedCourseDetails(res.data);
      setIsMarksModalOpen(true);
    } catch (error) {
      console.error("Error fetching course marks:", error.message);
    }
  };

  const handleViewAttendance = async (courseId) => {
    try {
      const res = await axios.get(
        `/api/parent/course/${courseId}/attendance/${currentUser.parentemail}`
      );
      setAttendanceDetails(res.data);
      setIsAttendanceModalOpen(true);
    } catch (error) {
      console.error("Error fetching attendance details:", error.message);
    }
  };

  return (
    <div className="p-3 md:mx-auto">
      <div className="flex-wrap flex gap-4 justify-center">
        {/* Parent Info Card */}
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

        <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md">
          <div className="flex justify-between">
            <div>
              <h3 className="text-gray-500 text-md uppercase">Email</h3>
              <p className="text-sm">{currentUser.email}</p>
            </div>
            <HiOutlineUserGroup className="bg-teal-600 text-white rounded-full text-5xl p-3 shadow-lg" />
          </div>
        </div>
      </div>

      {/* Child's Courses Registered Table */}
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
              <Table.HeadCell>View Marks</Table.HeadCell>
              <Table.HeadCell>View Attendance</Table.HeadCell>
            </Table.Head>
            {childCourses.map((course) => (
              <Table.Body key={course._id} className="divide-y">
                <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
                  <Table.Cell>{course.course?.courseName || "N/A"}</Table.Cell>
                  <Table.Cell className="hidden md:table-cell">{course.course?.courseCode || "N/A"}</Table.Cell>
                  <Table.Cell className="hidden md:table-cell">
                    {course.course?.faculty?.username || "N/A"}
                  </Table.Cell>
                  <Table.Cell className="hidden xl:table-cell">
                    {course.course?.courseDescription || "N/A"}
                  </Table.Cell>
                  <Table.Cell>
                    <Button onClick={() => handleViewMarks(course.course._id)}>
                      View Marks
                    </Button>
                  </Table.Cell>
                  <Table.Cell>
                    <Button
                      onClick={() => handleViewAttendance(course.course._id)}
                    >
                      View Attendance
                    </Button>
                  </Table.Cell>
                </Table.Row>
              </Table.Body>
            ))}
          </Table>
        </div>
      </div>

      <div className="overflow-x-auto p-8">
        <h1 className="text-center p-2 text-xl font-semibold">
          News and Achievements
        </h1>
        <Table hoverable>
          <Table.Head>
            <Table.HeadCell>Sentence</Table.HeadCell>
            <Table.HeadCell>Link</Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y">
            {news.map((newsItem) => (
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
            ))}
          </Table.Body>
        </Table>
      </div>

      {/* Marks Modal */}
      <Modal
        show={isMarksModalOpen}
        size="2lg"
        onClose={() => setIsMarksModalOpen(false)}
        popup
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center ">
            <h1 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
              Marks
            </h1>
            <Table hoverable>
              <Table.Head>
                <Table.HeadCell>Internals 1</Table.HeadCell>
                <Table.HeadCell>Internals 2</Table.HeadCell>
                <Table.HeadCell>Internals 3</Table.HeadCell>
                <Table.HeadCell>Midsem</Table.HeadCell>
                <Table.HeadCell>Endsem</Table.HeadCell>
                <Table.HeadCell>Grade</Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y">
                <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
                  <Table.Cell>
                    {selectedCourseDetails.internals1 === -1
                      ? "N/A"
                      : selectedCourseDetails.internals1}
                  </Table.Cell>
                  <Table.Cell>
                    {selectedCourseDetails.internals2 === -1
                      ? "N/A"
                      : selectedCourseDetails.internals2}
                  </Table.Cell>
                  <Table.Cell>
                    {selectedCourseDetails.internals3 === -1
                      ? "N/A"
                      : selectedCourseDetails.internals3}
                  </Table.Cell>
                  <Table.Cell>
                    {selectedCourseDetails.midsem === -1
                      ? "N/A"
                      : selectedCourseDetails.midsem}
                  </Table.Cell>
                  <Table.Cell>
                    {selectedCourseDetails.endsem === -1
                      ? "N/A"
                      : selectedCourseDetails.endsem}
                  </Table.Cell>
                  <Table.Cell>
                    {selectedCourseDetails.grade === "-"
                      ? "N/A"
                      : selectedCourseDetails.grade}
                  </Table.Cell>
                </Table.Row>
              </Table.Body>
            </Table>
          </div>
          <div className="flex justify-center items-center ">
                <PieChart
                  series={[
                    {
                      outerRadius: 120,
                      data,
                      arcLabel: getArcLabel,
                    },
                  ]}
                  sx={{
                    [`& .${pieArcLabelClasses.root}`]: {
                      fill: "white",
                      fontSize: 14,
                    },
                  }}
                  {...sizing}
                />
              </div>
          <BarChart
            xAxis={[
              { scaleType: "band", data: ["Internals(30)", "Midsem(25)", "Endsem(45)"] },
            ]}
            series={[
              { data: [selectedCourseDetails.internals1 === -1
                      ? 0
                      : selectedCourseDetails.internals1] },
              { data: [selectedCourseDetails.internals2 === -1
                      ? 0
                      : selectedCourseDetails.internals2, selectedCourseDetails.midsem === -1
                      ? 0
                      : selectedCourseDetails.midsem/2,selectedCourseDetails.endsem === -1
                      ? 0
                      : (9*selectedCourseDetails.endsem)/20] },
              { data: [selectedCourseDetails.internals3 === -1
                      ? 0
                      : selectedCourseDetails.internals3] },
            ]}
            width={500}
            height={300}
          />
          
        </Modal.Body>
      </Modal>

      {/* Attendance Modal */}
      <Modal
        show={isAttendanceModalOpen}
        size="lg"
        onClose={() => setIsAttendanceModalOpen(false)}
        popup
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <h1 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
              Attendance
            </h1>
            <Table hoverable>
              <Table.Head>
                <Table.HeadCell>Date</Table.HeadCell>
                <Table.HeadCell>Attendance</Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y">
                {attendanceDetails.map((attendance) => (
                  <Table.Row
                    className={`bg-white dark:border-gray-700 dark:bg-gray-800 ${
                      attendance.attended ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    <Table.Cell>
                      {new Date(attendance.date).toLocaleDateString()}
                    </Table.Cell>
                    <Table.Cell
                      className={
                        attendance.attended ? "text-green-500" : "text-red-500"
                      }
                    >
                      {attendance.attended ? "Present" : "Absent"}
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
