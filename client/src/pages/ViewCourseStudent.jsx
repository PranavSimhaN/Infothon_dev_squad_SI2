import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Alert,
  Button,
  Label,
  Spinner,
  TextInput,
  Modal,
  Table,
  Checkbox,
} from "flowbite-react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { Card, Tabs } from "flowbite-react";
import {
  MdLibraryBooks,
  MdOutlineSchedule,
  MdStarPurple500,
} from "react-icons/md";
import { FaChalkboardTeacher } from "react-icons/fa";
import { RiArrowGoBackFill } from "react-icons/ri";
import { HiAdjustments, HiClipboardList, HiUserCircle } from "react-icons/hi";
import { MdDashboard } from "react-icons/md";
import { PieChart, pieArcLabelClasses } from "@mui/x-charts/PieChart";
import Stack from "@mui/material/Stack";
import { BarChart } from "@mui/x-charts/BarChart";
import { Gauge, gaugeClasses } from "@mui/x-charts/Gauge";

export default function ViewCourseStudent() {
  const data = [
    { label: "Internals", value: 30, color: "#0088FE" }, // Midsem
    { label: "Midsem", value: 25, color: "#00C49F" }, // Endsem
    { label: "Ensdem", value: 45, color: "#FFBB28" }, // Grade
  ];

  const sizing = {
    margin: { right: 5 },
    width: 300,
    height: 300,
    legend: { hidden: true },
  };

  const TOTAL = data.map((item) => item.value).reduce((a, b) => a + b, 0);

  const getArcLabel = (params) => {
    const percent = params.value / TOTAL;
    return `${(percent * 100).toFixed(0)}%`;
  };

  const { courseCode } = useParams();
  const { currentUser } = useSelector((state) => state.user);
  const [courseDetails, setCourseDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [presentCount, setPresentCount] = useState(0);
  const [absentCount, setAbsentCount] = useState(0);
  const [leavesLeft, setLeavesLeft] = useState(0);
  const [classesToAttend, setClassesToAttend] = useState(0);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const response = await fetch(
          `/api/student/${currentUser._id}/course/${courseCode}`
        );
        if (!response.ok) {
          console.log(courseCode);
          throw new Error(
            `Failed to fetch course details: ${response.statusText}`
          );
        }
        const data = await response.json();
        setCourseDetails(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [courseCode, currentUser._id]);

  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        const response = await fetch(
          `/api/student/${currentUser._id}/course/${courseCode}/attendance`
        );
        if (!response.ok) {
          throw new Error(
            `Failed to fetch attendance data: ${response.statusText}`
          );
        }
        const data = await response.json();
        setAttendanceData(data);

        let present = 0;
        let absent = 0;
        let total = data.length;

        for (let i = 0; i < data.length; i++) {
          if (data[i].attended === true) {
            present++;
          } else if (data[i].attended === false) {
            absent++;
          }
        }

        setPresentCount(present);
        setAbsentCount(absent);

        // Calculate attendance percentage
        let attendance = (present / total) * 100;

        let present1 = present;
        let atten = attendance;
        let leaves = 0;
        let attend = 0;

        // Calculate leaves left or classes to attend to reach 75%
        if (attendance >= 75) {
          while (atten >= 75 && atten <= 100) {
            total = total + 1;
            atten = (present1 / total) * 100;
            if (atten >= 75) {
              leaves++;
            }
          }
          setLeavesLeft(leaves);
          setClassesToAttend(0);
        } else {
          while (atten >= 0 && atten <= 75) {
            total = total + 1;
            present1 = present1 + 1;
            atten = (present1 / total) * 100;
            if (atten <= 75) {
              attend++;
            }
          }
          setLeavesLeft(0);
          setClassesToAttend(attend);
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, [courseCode, currentUser._id]);

  const [formData, setFormData] = useState({
    was_course_helpful: false,
    faculty_rating: 1,
    feedback: "",
  });

  const settings = {
    width: 200,
    height: 200,
    value: ((presentCount / (presentCount + absentCount)) * 100).toFixed(2),
  };

  const [errorMessage, setErrorMessage] = useState("");
  const dispatch = useDispatch();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`/api/student/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          student: currentUser._id,
          faculty: courseDetails.faculty_id,
          course: courseCode,
        }),
      });
      if (!response.ok) {
        throw new Error(`Failed to submit feedback: ${response.statusText}`);
      }
      // Handle success (e.g., show success message, reset form)
      setFormData({
        was_course_helpful: false,
        faculty_rating: 1,
        feedback: "",
      });
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

  const handleButtonClick = (roomNumber) => {
    setSelectedRoom(roomNumber);
    setIsModalOpen(true);
  };

  const handleConfirm = async () => {
    try {
      const response = await fetch("/api/student/registerRoom", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          room: selectedRoom,
          studentId: currentUser._id,
        }), // Replace 'student-id' with the actual student ID
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`Student registered for room ${selectedRoom}:`, result);
        // Optionally, show a success message to the user
      } else {
        console.error(
          "Failed to register student for room:",
          response.statusText
        );
        // Optionally, show an error message to the user
      }
    } catch (error) {
      console.error("Error registering student for room:", error);
      // Optionally, show an error message to the user
    } finally {
      setIsModalOpen(false);
      setSelectedRoom(null);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setSelectedRoom(null);
  };
  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <div className="px-10 md:mx-auto">
        <div className="flex flex-wrap justify-center pt-16 pb-10 ">
          <div className="w-full sm:w-1/2 lg:w-1/3 px-5">
            <Card className="max-w-sm mx-auto">
              <div className="flex items-center justify-between">
                <h5 className="text-2xl font-bold leading-none text-gray-900 dark:text-white">
                  {courseDetails ? courseDetails.courseName : "Loading..."}
                </h5>
              </div>
              <div className="flow-root">
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  <li className="py-3 sm:py-4">
                    <div className="flex items-center space-x-4">
                      <div className="shrink-0"></div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xl font-medium text-gray-900 dark:text-white">
                          {courseDetails
                            ? courseDetails.courseCode
                            : "Loading..."}
                        </p>
                        <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                          {courseDetails
                            ? courseDetails.courseDescription
                            : "Loading..."}
                        </p>
                      </div>
                      <div className="inline-flex items-center">
                        <MdLibraryBooks className="w-13 h-13 bg-teal-600 text-white rounded-full p-2 text-5xl shadow-lg" />
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </Card>
          </div>
          <div className="w-full sm:w-1/2 lg:w-1/3 px-5">
            <Card className="max-w-sm mx-auto">
              <div className="flex items-center justify-between">
                <h5 className="text-2xl font-bold leading-none text-gray-900 dark:text-white">
                  Faculty
                </h5>
              </div>
              <div className="flow-root">
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  <li className="py-3 sm:py-4">
                    <div className="flex items-center space-x-4">
                      <div className="shrink-0"></div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xl font-medium text-gray-900 dark:text-white">
                          {courseDetails ? courseDetails.faculty : "Loading..."}
                        </p>

                        <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                          Associate Professor
                        </p>
                      </div>
                      <div className="inline-flex items-center">
                        <FaChalkboardTeacher className="w-13 h-13 bg-teal-600 text-white rounded-full p-2 text-5xl shadow-lg" />
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </Card>
          </div>
          <div className="w-full sm:w-1/2 lg:w-1/3 px-5">
            <Card className="max-w-sm mx-auto">
              <div className="flex items-center justify-between">
                <h5 className="text-2xl font-bold leading-none text-gray-900 dark:text-white">
                  Schedule
                </h5>
              </div>
              <div className="flow-root">
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  <li className="py-3 sm:py-4">
                    <div className="flex items-center space-x-4">
                      <div className="shrink-0"></div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xl font-medium text-gray-900 dark:text-white">
                          {courseDetails
                            ? courseDetails.schedule
                            : "Loading..."}
                        </p>

                        <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                          Attendance mandatory
                        </p>
                      </div>
                      <div className="inline-flex items-center">
                        <MdOutlineSchedule className="w-13 h-13 bg-teal-600 text-white rounded-full p-2 text-5xl shadow-lg" />
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto px-10 pt-5">
        {/* <div className="w-full flex justify-start p-5">
        <Link to="/dashboard?tab=profile">
          <RiArrowGoBackFill className="cursor-pointer w-8 h-8" />
        </Link>
      </div>   */}
        <Tabs aria-label="Full width tabs" variant="fullWidth">
          <Tabs.Item active title="Marks" icon={HiUserCircle}>
            <div className="flex items-center flex-wrap gap-4 py-3 mx-auto">
              {/* Table Section */}
              <div className="flex flex-col w-full md:w-1/2 shadow-md p-2 rounded-md dark:bg-gray-800">
                <div className="flex justify-between p-3 text-xl font-semibold">
                  <h1 className="text-center p-2">Marks obtained</h1>
                </div>
                <Table hoverable>
                  <Table.Head>
                    <Table.HeadCell>Exam Type</Table.HeadCell>
                    <Table.HeadCell>Marks/Grade</Table.HeadCell>
                    {/* Add more headers as needed */}
                  </Table.Head>
                  <Table.Body className="divide-y">
                    {courseDetails && (
                      <>
                        <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
                          <Table.Cell>Internals 1 (Out of 30)</Table.Cell>
                          <Table.Cell>
                            {courseDetails.internals1 !== -1
                              ? courseDetails.internals1
                              : "Marks not entered"}
                          </Table.Cell>
                        </Table.Row>
                        <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
                          <Table.Cell>Internals 2 (Out of 30)</Table.Cell>
                          <Table.Cell>
                            {courseDetails.internals2 !== -1
                              ? courseDetails.internals2
                              : "Marks not entered"}
                          </Table.Cell>
                        </Table.Row>
                        <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
                          <Table.Cell>Internals 3 (Out of 30)</Table.Cell>
                          <Table.Cell>
                            {courseDetails.internals3 !== -1
                              ? courseDetails.internals3
                              : "Marks not entered"}
                          </Table.Cell>
                        </Table.Row>
                        <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
                          <Table.Cell>Midsem (Out of 50)</Table.Cell>
                          <Table.Cell>
                            {courseDetails.midsem !== -1
                              ? courseDetails.midsem
                              : "Marks not entered"}
                          </Table.Cell>
                        </Table.Row>
                        <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
                          <Table.Cell>Endsem (Out of 100)</Table.Cell>
                          <Table.Cell>
                            {courseDetails.endsem !== -1
                              ? courseDetails.endsem
                              : "Marks not entered"}
                          </Table.Cell>
                        </Table.Row>
                        <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
                          <Table.Cell>Grade</Table.Cell>
                          <Table.Cell>{courseDetails.grade}</Table.Cell>
                        </Table.Row>
                      </>
                    )}
                  </Table.Body>
                </Table>
              </div>

              {/* PieChart Section */}
              <div className="flex justify-center items-center md:w-1/3">
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
            </div>
          </Tabs.Item>

          <Tabs.Item title="Attendance" icon={MdDashboard}>
            <div className="flex items-center flex-wrap gap-4 py-3 mx-auto">
              {/* Table Section */}
              <div className="flex flex-col w-full md:w-1/2 shadow-md p-2 rounded-md dark:bg-gray-800">
                <div className="flex justify-between p-3 text-xl font-semibold">
                  <>Attendance</>
                  <div className="flex gap-4">
                    {leavesLeft >= 0 && (
                      <span className="text-green-500">
                        Leaves left:{" "}
                        <span className="text-3xl font-bold">{leavesLeft}</span>
                      </span>
                    )}
                  </div>
                </div>
                <Table hoverable>
                  <Table.Head>
                    <Table.HeadCell>Date</Table.HeadCell>
                    <Table.HeadCell>Attendance</Table.HeadCell>
                    {/* Add more headers as needed */}
                  </Table.Head>
                  <Table.Body className="divide-y">
                    {attendanceData.map((attendance) => (
                      <Table.Row
                        key={attendance.date}
                        className="bg-white dark:bg-gray-800"
                      >
                        <Table.Cell>
                          {new Date(attendance.date).toLocaleDateString()}
                        </Table.Cell>
                        <Table.Cell
                          className={
                            attendance.attended
                              ? "text-green-500"
                              : "text-red-500"
                          }
                        >
                          {attendance.attended ? "Present" : "Absent"}
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
              </div>

              {/* Gauge and Stats Section */}
              <div className="flex flex-col items-center gap-4 w-full md:w-1/3">
                <Gauge
                  {...settings}
                  cornerRadius="50%"
                  sx={(theme) => ({
                    [`& .${gaugeClasses.valueText}`]: {
                      fontSize: 5,
                    },
                    [`& .${gaugeClasses.valueArc}`]: {
                      fill: "#047481",
                    },
                    [`& .${gaugeClasses.referenceArc}`]: {
                      fill: theme.palette.text.disabled,
                    },
                  })}
                />
                <div className="text-center">
                  <h1 className="text-xl font-semibold">
                    Percentage:{" "}
                    <span className="text-3xl font-bold">
                      {(
                        (presentCount / (presentCount + absentCount)) *
                        100
                      ).toFixed(2)}
                      %
                    </span>
                  </h1>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <span className="text-lg">
                    Present:{" "}
                    <span className="text-xl font-bold">{presentCount}</span>
                  </span>
                  <span className="text-lg">
                    Absent:{" "}
                    <span className="text-xl font-bold">{absentCount}</span>
                  </span>
                  {classesToAttend > 0 && (
                    <span className="text-red-500 text-2xl">
                      Classes to attend for 75%:{" "}
                      <span className="text-3xl font-bold">
                        {classesToAttend}
                      </span>
                    </span>
                  )}
                </div>
              </div>

              {/* BarChart Section */}
            </div>
          </Tabs.Item>

          <Tabs.Item title="Course Plan" icon={HiAdjustments}>
            {courseDetails && courseDetails.Courseplanpath ? (
              <div></div>
            ) : (
              <div>
                <p>No Course plan added.</p>
              </div>
            )}
            <div>
              <embed
                src={
                  courseDetails && courseDetails.Courseplanpath
                    ? courseDetails.Courseplanpath
                    : ""
                }
                type="application/pdf"
                width="100%"
                height={
                  courseDetails && courseDetails.Courseplanpath
                    ? "600px"
                    : "0px"
                }
              />
            </div>
          </Tabs.Item>
          <Tabs.Item title="FeedBack form" icon={HiAdjustments}>
            <div className="pb-10 mt-10">
              <div className="flex p-3 max-w-3xl mx-auto flex-col items-center gap-10">
                <div className="w-full max-w-lg">
                  <form
                    className="flex flex-col gap-4"
                    onSubmit={handleSubmitFeedback}
                  >
                    <div className="p-2">
                      <div className="mb-2">
                        <Label value="Was the course helpful?" />
                      </div>
                      <div>
                        <Checkbox
                          id="was_course_helpful"
                          name="was_course_helpful"
                          checked={formData.was_course_helpful}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <div>
                      <Label value="Faculty Rating" />
                      <TextInput
                        type="number"
                        min="1"
                        max="5"
                        placeholder="Rate the faculty (1-5)"
                        id="faculty_rating"
                        name="faculty_rating"
                        value={formData.faculty_rating}
                        onChange={handleInputChange}
                        className="w-full p-2"
                      />
                    </div>
                    <div>
                      <Label value="Feedback" />
                      <TextInput
                        type="text"
                        placeholder="Enter your feedback"
                        id="feedback"
                        name="feedback"
                        value={formData.feedback}
                        onChange={handleInputChange}
                        className="w-full p-2"
                      />
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
                        "Add Feedback"
                      )}
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
          </Tabs.Item>
        </Tabs>
      </div>
    </div>
  );
}
