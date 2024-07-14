import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { HiOutlineUserGroup } from "react-icons/hi";
import { Button, Table } from "flowbite-react";
import { Link } from "react-router-dom";

export default function StudentProfile() {
  const { currentUser } = useSelector((state) => state.user);
  const [userCourses, setUserCourses] = useState([]);
  const [averageGrade, setAverageGrade] = useState(0);

  useEffect(() => {
    // Fetch user's registered courses
    const fetchUserCourses = async () => {
      try {
        const res = await fetch(`/api/student/${currentUser._id}/courses`);
        const data = await res.json();
        setUserCourses(data);
      } catch (error) {
        console.error("Error fetching user courses:", error.message);
      }
    };

    // Fetch user's average grade
    const fetchAverageGrade = async () => {
      try {
        const res = await fetch(`/api/student/${currentUser._id}/average-grade`);
        const data = await res.json();
        setAverageGrade(data.averageGrade);
      } catch (error) {
        console.error("Error fetching average grade:", error.message);
      }
    };

    fetchUserCourses();
    fetchAverageGrade();
  }, [currentUser._id]);

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
          <div className="flex  gap-2 text-sm">
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
              <h3 className="text-gray-500 text-md uppercase">CGPA</h3>
              <p className="text-4xl">{averageGrade}</p>
            </div>
            <HiOutlineUserGroup className="bg-teal-600 text-white rounded-full text-5xl p-3 shadow-lg" />
          </div>
        </div>

        <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md">
          <div className="flex justify-between">
            <div>
              <h3 className="text-gray-500 text-md uppercase">Hostel 1</h3>
              <p className="text-xl">Room Number: {currentUser.
                hostelroom}</p>
            </div>
            <HiOutlineUserGroup className="bg-teal-600 text-white rounded-full text-5xl p-3 shadow-lg" />
          </div>
        </div>
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
              <Table.HeadCell>Course Code</Table.HeadCell>
              <Table.HeadCell>Faculty Name</Table.HeadCell>
              <Table.HeadCell className="hidden md:table-cell">
                Description
              </Table.HeadCell>
              <Table.HeadCell>Details</Table.HeadCell>
            </Table.Head>
            {/* Display userCourses data */}
            {userCourses.map((course) => (
              <Table.Body key={course._id} className="divide-y">
                <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
                  <Table.Cell>{course.courseName}</Table.Cell>
                  <Table.Cell>{course.courseCode}</Table.Cell>
                  <Table.Cell>{course.faculty}</Table.Cell>
                  <Table.Cell className="hidden md:table-cell">
                    {course.courseDescription}
                  </Table.Cell>
                  <Table.Cell>
                    <Link
                      to={`/${currentUser._id}/course/${course._id}`}
                      className="text-blue-500 hover:underline"
                    >
                      Open course
                    </Link>
                  </Table.Cell>
                </Table.Row>
              </Table.Body>
            ))}
          </Table>
        </div>
        
      </div>
      
    </div>
  )
}
