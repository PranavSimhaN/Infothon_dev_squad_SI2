"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Table,
  Button,
  Modal,
  Label,
  TextInput,
  Spinner,
  Select,
} from "flowbite-react";
import { HiOutlineExclamationCircle } from "react-icons/hi";

export default function FacultyUpdateMarks() {
  const { courseCode } = useParams();
  const { currentUser } = useSelector((state) => state.user);
  const [courseDetails, setCourseDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [attendanceData, setAttendanceData] = useState([]);
  const [isEditMarksModalOpen, setIsEditMarksModalOpen] = useState(false);
  const [editMarksFormData, setEditMarksFormData] = useState({});
  const { currentTheme } = useSelector((state) => state.theme);

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleEditMarksClick = (student) => {
    setEditMarksFormData(student);
    setIsEditMarksModalOpen(true);
  };

  const handleEditMarksChange = (e) => {
    setEditMarksFormData({
      ...editMarksFormData,
      [e.target.id]: e.target.value,
    });
  };

  const handleEditMarksSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(
        `/api/faculty/updatemarks/${courseCode}/${editMarksFormData._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editMarksFormData),
        }
      );
      const data = await res.json();
      if (data.success === false) {
        setError(data.message);
      }
      if (res.ok) {
        setIsEditMarksModalOpen(false);
        window.location.reload();
      }
    } catch (error) {
      setError(error.message);
    }
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
  }, [courseCode, selectedDate, currentUser._id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <HiOutlineExclamationCircle className="text-red-500 mr-2" />
        <span className="text-red-500">{error}</span>
      </div>
    );
  }

  if (!courseDetails) {
    return null;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">
        Update Marks for {courseDetails.course_name}
      </h1>
      <Table hoverable>
        <Table.Head>
          <Table.HeadCell>Username</Table.HeadCell>
          <Table.HeadCell>Internals 1</Table.HeadCell>
          <Table.HeadCell>Internals 2</Table.HeadCell>
          <Table.HeadCell>Internals 3</Table.HeadCell>
          <Table.HeadCell>Midsem</Table.HeadCell>
          <Table.HeadCell>Endsem</Table.HeadCell>
          <Table.HeadCell>Grades</Table.HeadCell>
          <Table.HeadCell>
            <span className="sr-only">Edit</span>
          </Table.HeadCell>
        </Table.Head>
        <Table.Body>
          {courseDetails.students.map((student, index) => (
            <Table.Row
              key={index}
              className="bg-white dark:border-gray-700 dark:bg-gray-800"
            >
              <Table.Cell>{student.username}</Table.Cell>
              <Table.Cell>{student.internals1}</Table.Cell>
              <Table.Cell>{student.internals2}</Table.Cell>
              <Table.Cell>{student.internals3}</Table.Cell>
              <Table.Cell>{student.midsem}</Table.Cell>
              <Table.Cell>{student.endsem}</Table.Cell>
              <Table.Cell>{student.grade}</Table.Cell>
              <Table.Cell>
                <button
                  className="font-medium text-cyan-600 hover:underline dark:text-cyan-500"
                  onClick={() => handleEditMarksClick(student)}
                >
                  Edit
                </button>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>

      <Modal
        show={isEditMarksModalOpen}
        onClose={() => setIsEditMarksModalOpen(false)}
        className={currentTheme}
      >
        <Modal.Header>Edit Marks</Modal.Header>
        <Modal.Body>
          <form
            className="flex flex-col gap-4"
            onSubmit={handleEditMarksSubmit}
          >
            <div>
              <Label value="Username" />
              <TextInput
                type="text"
                value={editMarksFormData.username}
                onChange={handleEditMarksChange}
                id="username"
                className="w-full p-2"
                disabled
              />
            </div>
            <div>
              <Label value="Internals 1" />
              <TextInput
                type="number"
                value={editMarksFormData.internals1}
                onChange={handleEditMarksChange}
                id="internals1"
                className="w-full p-2"
              />
            </div>
            <div>
              <Label value="Internals 2" />
              <TextInput
                type="number"
                value={editMarksFormData.internals2}
                onChange={handleEditMarksChange}
                id="internals2"
                className="w-full p-2"
              />
            </div>
            <div>
              <Label value="Internals 3" />
              <TextInput
                type="number"
                value={editMarksFormData.internals3}
                onChange={handleEditMarksChange}
                id="internals3"
                className="w-full p-2"
              />
            </div>
            <div>
              <Label value="Midsem" />
              <TextInput
                type="number"
                value={editMarksFormData.midsem}
                onChange={handleEditMarksChange}
                id="midsem"
                className="w-full p-2"
              />
            </div>
            <div>
              <Label value="Endsem" />
              <TextInput
                type="number"
                value={editMarksFormData.endsem}
                onChange={handleEditMarksChange}
                id="endsem"
                className="w-full p-2"
              />
            </div>
            <div>
              <Label value="Grades" />
              <Select
                id="grade"
                value={editMarksFormData.grade}
                onChange={handleEditMarksChange}
                className="w-full p-2"
              >
                <option value="">Select Grade</option>
                {[
                  "AA",
                  "AB",
                  "BA",
                  "BB",
                  "CB",
                  "CC",
                  "CD",
                  "DD",
                  "FA",
                  "FF",
                  "I",
                  "-",
                ].map((grade) => (
                  <option key={grade} value={grade}>
                    {grade}
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
                "Update Marks"
              )}
            </Button>
          </form>
        </Modal.Body>
      </Modal>
    </div>
  );
}
