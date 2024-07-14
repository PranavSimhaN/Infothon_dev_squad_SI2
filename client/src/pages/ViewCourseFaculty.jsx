"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import FacultyAddAttendance from "../components/FacultyAddAttendance";
import FacultyUpdateMarks from "../components/FacultyUpdateMarks";
import {
  Table,
  Tabs,
  Button,
  Modal,
  Label,
  TextInput,
  Alert,
} from "flowbite-react";
import { HiAdjustments, HiClipboardList, HiOutlineUserGroup, HiUserCircle } from "react-icons/hi";
import { MdDashboard } from "react-icons/md";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function ViewCourseFaculty() {
  const { courseCode } = useParams();
  const { currentUser } = useSelector((state) => state.user);
  const [courseDetails, setCourseDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [attendanceData, setAttendanceData] = useState([]);
  const [feedbackData, setFeedbackData] = useState([]);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const response = await fetch(
          `/api/faculty/coursefaculty/${courseCode}`
        );
        if (!response.ok) {
          throw new Error(
            `Failed to fetch course details: ${response.statusText}`
          );
        }
        const data = await response.json();
        setCourseDetails(data);

        // Fetch attendance data for the selected date
        const attendanceResponse = await fetch(
          `/api/faculty/getattendance?courseDetails_id=${courseCode}&faculty_id=${currentUser._id}&date=${selectedDate}`
        );
        if (!attendanceResponse.ok) {
          throw new Error(
            `Failed to fetch attendance data: ${attendanceResponse.statusText}`
          );
        }
        const attendanceData = await attendanceResponse.json();
        setAttendanceData(attendanceData);

        // Fetch feedback data for the course
        const feedbackResponse = await fetch(
          `/api/faculty/feedback?course=${courseCode}`
        );
        if (!feedbackResponse.ok) {
          throw new Error(
            `Failed to fetch feedback data: ${feedbackResponse.statusText}`
          );
        }
        const feedbackData = await feedbackResponse.json();
        setFeedbackData(feedbackData);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [courseCode, currentUser._id, selectedDate]);

  const handleDeleteStudent = async () => {
    try {
      const response = await fetch(
        `/api/faculty/course/${courseCode}/student/${studentToDelete}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        throw new Error(`Failed to delete student: ${response.statusText}`);
      }
      // Update the course details after deletion
      setCourseDetails((prevDetails) => ({
        ...prevDetails,
        students: prevDetails.students.filter(
          (student) => student._id !== studentToDelete
        ),
      }));
      setIsDeleteModalOpen(false);
      setStudentToDelete(null);
    } catch (error) {
      setError(error.message);
    }
  };

  const openDeleteModal = (studentId) => {
    setStudentToDelete(studentId);
    setIsDeleteModalOpen(true);
  };

  const [file, setFile] = useState();
  const [code, setCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [coursePlanPath, setCoursePlanPath] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append("link", file); // Ensure the name 'link' matches the server-side
    formData.append("code", courseCode);
    try {
      const response = await axios.post(
        "/api/faculty/uploadmaterial",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log(response.data);
      window.location.reload();
    } catch (error) {
      console.error("Error:", error);
      if (error.response) {
        setErrorMessage(`Error: ${error.response.data.message}`);
      } else {
        setErrorMessage(`Error: ${error.message}`);
      }
    }
  };

  const [selectedStudent, setSelectedStudent] = useState("");
  const [meetingLink, setMeetingLink] = useState("");

  const handleScheduleMeet = async () => {
    // Handle scheduling meet logic here
    // For example, send the selectedStudent and meetingLink to the backend
    if (!selectedStudent) {
      setErrorMessage('Please select a student');
      return; // Exit function if no student is selected
    } 
    try {
      const response = await axios.post('/api/faculty/schedulemeet', {
        student_id: selectedStudent,
        meeting_link: meetingLink,
        course_id: courseCode
      });

      if (response.status === 200) {
        // Successfully scheduled the meet
        console.log('Meet scheduled successfully');
        window.location.reload();
      }
    } catch (error) {
      console.error('Error scheduling meet:', error);
    }
  };

  const handleInputChange = (e) => {
    const inputValue = e.target.value.trim(); // Trim any leading or trailing spaces
    // Regular expression to extract the meeting link part keeping http/https
    const regex = /(?:https?:\/\/)?(?:www\.)?(meet\.google\.com\/[\w-]+)/;
    const match = inputValue.match(regex);
    
    if (match) {
      // Construct the full URL including protocol if missing
      const fullUrl = match[1].startsWith('http') ? match[1] : `https://${match[1]}`;
      setMeetingLink(fullUrl);
    } else {
      // Invalid or unsupported input format
      console.log("Invalid meeting link format");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="p-3 md:mx-auto">
      {courseDetails && (
        <div className="flex-wrap flex gap-4 justify-center">
        {/* Total Users Card */}
        <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md">
          <div className="flex justify-between">
            <div>
              <h3 className="text-gray-500 text-md uppercase">Course 
              </h3>
              <p className="text-2xl">{courseDetails.courseName}</p>
            </div>
            <HiOutlineUserGroup className="bg-teal-600  text-white rounded-full text-5xl p-3 shadow-lg" />
          </div>
          <div className="flex gap-2 text-sm">
            <span className="text-green-500 flex items-center">{courseDetails.courseCode}</span>
            <div className="text-gray-500"></div>
          </div>
        </div>

        <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md">
          <div className="flex justify-between">
            <div>
              <h3 className="text-gray-500 text-md uppercase">Professor</h3>
              <p className="text-md">{courseDetails.courseDescription}</p>
            </div>
            <HiOutlineUserGroup className="bg-teal-600  text-white rounded-full text-5xl p-3 shadow-lg" />
          </div>
          <div className="flex gap-2 text-sm">
            <span className="text-green-500 flex items-center"></span>
            <div className="text-gray-500"></div>
          </div>
        </div>

        {/* Total Comments Card */}


        {/* Total Posts Card */}
        <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md">
          <div className="flex justify-between">
            <div>
              <h3 className="text-gray-500 text-md uppercase">Schedule</h3>
              <p className="text-md">{courseDetails.schedule}</p>
            </div>
            <HiOutlineUserGroup className="bg-teal-600 text-white rounded-full text-5xl p-3 shadow-lg" />
          </div>
        </div>
      </div>
      )}
     
      <div className="overflow-x-auto px-10 md:px-20">
        <h2 className="text-2xl font-semibold m-6">Registered Students</h2>
        <Table hoverable>
          <Table.Head>
            <Table.HeadCell>Name</Table.HeadCell>
            <Table.HeadCell className="hidden md:table-cell">
              Email
            </Table.HeadCell>
            <Table.HeadCell className="hidden md:table-cell">
              Department
            </Table.HeadCell>
            <Table.HeadCell className="hidden md:table-cell">
              Program
            </Table.HeadCell>
            <Table.HeadCell>Action</Table.HeadCell>
          </Table.Head>
          <Table.Body>
            {courseDetails.students.map((student, index) => (
              <Table.Row
                key={index}
                className="bg-white dark:border-gray-700 dark:bg-gray-800"
              >
                <Table.Cell>{student.username}</Table.Cell>
                <Table.Cell className="hidden md:table-cell">
                  {student.email}
                </Table.Cell>
                <Table.Cell className="hidden md:table-cell">
                  {student.department}
                </Table.Cell>
                <Table.Cell className="hidden md:table-cell">
                  {student.program}
                </Table.Cell>
                <Table.Cell>
                  <Button
                    color="failure"
                    onClick={() => openDeleteModal(student._id)}
                  >
                    Remove
                  </Button>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>
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
              Are you sure you want to remove this student from the course?
            </h3>
            <div className="flex justify-center gap-4">
              <Button color="failure" onClick={handleDeleteStudent}>
                {"Yes, I'm sure"}
              </Button>
              <Button color="gray" onClick={() => setIsDeleteModalOpen(false)}>
                No, cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
      <div className="overflow-x-auto p-10">
        <Tabs aria-label="Full width tabs" variant="fullWidth">
          <Tabs.Item active title="Update Marks" icon={HiUserCircle}>
            <FacultyUpdateMarks />
          </Tabs.Item>
          <Tabs.Item title="Take Attendance " icon={MdDashboard}>
            <FacultyAddAttendance />
          </Tabs.Item>
          <Tabs.Item title="Upload Course Material" icon={HiAdjustments}>
            <div className="pb-10 mt-10">
              <div className="flex p-3 max-w-3xl mx-auto flex-col md:flex-row md:items-center gap-5">
                {/* left */}

                {/* right */}
                <div className="flex-1">
                  <div>
                    <input
                      type="file"
                      onChange={(e) => setFile(e.target.files[0])}
                    />
                    <div className="p-6">
                      <Button color="success" onClick={handleSubmit}>
                        Upload
                      </Button>
                    </div>
                    {errorMessage && <p>{errorMessage}</p>}
                  </div>
                </div>
              </div>
              <div>
                {courseDetails.Courseplanpath && (
                  <embed
                    src={
                      courseDetails && courseDetails.Courseplanpath
                        ? courseDetails.Courseplanpath
                        : ""
                    }
                    type="application/pdf"
                    width="100%"
                    height="600px"
                  />
                )}
              </div>
            </div>
          </Tabs.Item>
          <Tabs.Item title="Schedule a Meet" icon={MdDashboard}>
          
          <div className="pb-10 mt-10">
          
    <div className="flex p-3 max-w-3xl mx-auto flex-col md:flex-row md:items-center gap-5">
      {/* Dropdown for selecting students */}
      <div className="qj qr">
  <div className="aio UKr6le">
    <span className="nU false">
      <a
        href="https://meet.google.com/new?hs=180&amp;authuser=0"
        target="_blank"
        rel="noopener noreferrer"
        className="J-Ke n0"
        title="Start a meeting"
        aria-label="Start a meeting"
        draggable="false"
        style={{ textDecoration: 'none' }} // Ensure link text decoration is removed
      >
        <button
          style={{
            backgroundColor: '#06B6D4',
            color: '#fff',
            border: 'none',
            padding: '10px 20px',
            cursor: 'pointer',
            display: 'inline-block',
            textAlign: 'center',
            fontSize: '16px',
            borderRadius: '5px',
          }}
        >
          Start a Meeting
        </button>
      </a>
    </span>
  </div>
  <div className="nL aif"></div>
</div>

      <div className="flex-1">
        <Label htmlFor="studentSelect" className="mb-2 block">
          Select Student
        </Label>
        <select
          id="studentSelect"
          className="block w-full p-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          value={selectedStudent}
          onChange={(e) => setSelectedStudent(e.target.value)}
        >
          <option value="" disabled>Select a student</option>
          {courseDetails.students.map((student) => (
            <option key={student._id} value={student._id}>
              {student.username}
            </option>
          ))}
        </select>
      </div>

      {/* Input for meeting link */}
      <div className="flex-1">
        <Label htmlFor="meetingLink" className="mb-2 block">
          Meeting Link (Paste here)
        </Label>
        <TextInput
          id="meetingLink"
          type="text"
          placeholder="Ex: meet.google.com/cgv-uqox-kny"
          value={meetingLink}
          onChange={handleInputChange}
        />
      </div>

      {/* Submit button */}
      <div className="flex-1">
        <Button color="success" onClick={handleScheduleMeet}>
          Schedule Meet
        </Button>
      </div>
      {errorMessage && (
              <Alert color="failure" className="mt-4 w-40">
                {errorMessage}
              </Alert>
            )}
    </div>
    
  </div>
          </Tabs.Item>
          <Tabs.Item title="Course Feedback" icon={HiUserCircle}>
            <div className="overflow-x-auto px-10 md:px-20">
              <h2 className="text-2xl font-semibold m-6">Course Feedback</h2>
              <Table hoverable>
                <Table.Head>
                  <Table.HeadCell>Feedback</Table.HeadCell>
                  <Table.HeadCell>Rating</Table.HeadCell>
                  <Table.HeadCell>Was this course helpful?</Table.HeadCell>
                </Table.Head>
                <Table.Body>
                  {feedbackData.map((feedback, index) => (
                    <Table.Row
                      key={index}
                      className="bg-white dark:border-gray-700 dark:bg-gray-800"
                    >
                      <Table.Cell>{feedback.feedback}</Table.Cell>
                      <Table.Cell>{feedback.faculty_rating}</Table.Cell>
                      <Table.Cell>{feedback.was_course_helpful?'Yes':'No'}</Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </div>
          </Tabs.Item>
        </Tabs>
      </div>
    </div>
  );
}
