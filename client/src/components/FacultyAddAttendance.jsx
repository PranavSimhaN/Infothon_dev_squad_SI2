import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { Table, Button } from "flowbite-react";

export default function FacultyAddAttendance() {
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

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

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
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [courseCode, currentUser._id, selectedDate]);

  const handleAddAttendance = async () => {
    try {
      const response = await fetch(`/api/faculty/attendance/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: selectedDate,
          courseDetails_id: courseDetails.courseId,
          faculty_id: currentUser._id,
          students: courseDetails.students.map((student) => student._id),
        }),
      });
      if (!response.ok) {
        throw new Error(`Failed to add attendance: ${response.statusText}`);
      }

      // Optionally, you can update the UI or display a success message
      console.log("Attendance added successfully");

      // Update attendance data state by refetching the attendance for the selected date
      const updatedAttendanceResponse = await fetch(
        `/api/faculty/getattendance?courseDetails_id=${courseCode}&faculty_id=${currentUser._id}&date=${selectedDate}`
      );
      if (!updatedAttendanceResponse.ok) {
        throw new Error(
          `Failed to fetch updated attendance data: ${updatedAttendanceResponse.statusText}`
        );
      }
      const updatedAttendanceData = await updatedAttendanceResponse.json();
      setAttendanceData(updatedAttendanceData);
    } catch (error) {
      setError(error.message);
    }
  };

  const markAttendance = async (studentId, attended) => {
    try {
      const response = await fetch(`/api/faculty/attendance/mark`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: selectedDate,
          courseDetails_id: courseDetails.courseId,
          faculty_id: currentUser._id,
          student_id: studentId,
          attended: attended,
        }),
      });
      if (!response.ok) {
        throw new Error(`Failed to mark attendance: ${response.statusText}`);
      }

      // Update attendance data state by refetching the attendance for the selected date
      const updatedAttendanceResponse = await fetch(
        `/api/faculty/getattendance?courseDetails_id=${courseCode}&faculty_id=${currentUser._id}&date=${selectedDate}`
      );
      if (!updatedAttendanceResponse.ok) {
        throw new Error(
          `Failed to fetch updated attendance data: ${updatedAttendanceResponse.statusText}`
        );
      }
      const updatedAttendanceData = await updatedAttendanceResponse.json();
      setAttendanceData(updatedAttendanceData);
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <>
      <div className="relative max-w-sm mt-4">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg
            className="w-4 h-4 text-gray-500 dark:text-gray-400"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z" />
          </svg>
        </div>
        <input
          id="datepicker-format"
          type="date"
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 py-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          value={selectedDate}
          onChange={handleDateChange}
          required
        />
      </div>
      <div className="mt-4 pb-5">
        <Button onClick={handleAddAttendance}>
          Add Attendance for Selected Date
        </Button>
      </div>
      <Table hoverable>
        <Table.Head>
          <Table.HeadCell>Username</Table.HeadCell>
          <Table.HeadCell>Date</Table.HeadCell>
          <Table.HeadCell>Attended</Table.HeadCell>
          <Table.HeadCell>Action</Table.HeadCell>
          <Table.HeadCell>Action</Table.HeadCell>
        </Table.Head>
        <Table.Body>
          {attendanceData.map((attendance, index) => (
            <Table.Row
              key={index}
              className="bg-white dark:border-gray-700 dark:bg-gray-800"
            >
              <Table.Cell>{attendance.student_id.username}</Table.Cell>
              <Table.Cell>{new Date(attendance.date).toLocaleDateString()}</Table.Cell>
              <Table.Cell>
                {attendance.attended ? "Present" : "Absent"}
              </Table.Cell>
              <Table.Cell>
                <Button
                  color="success"
                  onClick={() =>
                    markAttendance(attendance.student_id._id, true)
                  }
                >
                  Mark Present
                </Button>
              </Table.Cell>
              <Table.Cell>
                <Button
                color="failure"
                  onClick={() =>
                    markAttendance(attendance.student_id._id, false)
                  }
                >
                  Mark Absent
                </Button>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </>
  );
}
