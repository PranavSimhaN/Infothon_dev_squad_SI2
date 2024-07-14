import { Sidebar } from "flowbite-react";
import { HiUser, HiArrowSmRight } from "react-icons/hi";
import { FaNewspaper } from "react-icons/fa";
import { MdLibraryBooks } from "react-icons/md";
import { FcVideoCall } from "react-icons/fc";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { GrAchievement } from "react-icons/gr";
import { signoutSuccess } from "../redux/user/userSlice";

export default function DashSidebar() {
  const location = useLocation();
  const [tab, setTab] = useState("");
  const [meetingLink, setMeetingLink] = useState(null);
  const [meetingLink_parent, setMeetingLink_parent] = useState(null);
  const [courseName, setCourseName] = useState("");
  const [courseName_parent, setCourseName_parent] = useState("");

  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabFromUrl = urlParams.get("tab");
    if (tabFromUrl) {
      setTab(tabFromUrl);
    }

    // Fetch meeting link
    const fetchMeetingLink = async () => {
      try {
        if (currentUser.role === "parent") {
          console.log(currentUser.parentemail);
          const response1 = await fetch(
            `/api/student/getmeetinglink?student_id=${currentUser.parentemail}`
          );
          if (!response1.ok) {
            throw new Error("Failed to fetch meeting link for parent");
          }
          const data1 = await response1.json();
          setMeetingLink_parent(data1.meetingLink);
          setCourseName_parent(data1.courseName);
        } else {
          const response = await fetch(
            `/api/student/getmeetinglink?student_id=${currentUser._id}`
          );
          if (!response.ok) {
            throw new Error("Failed to fetch meeting link");
          }
          const data = await response.json();
          setMeetingLink(data.meetingLink);
          setCourseName(data.courseName);
        }
      } catch (error) {
        console.log(error.message);
      }
    };

    fetchMeetingLink();
  }, [
    location.search,
    currentUser._id,
    currentUser.role,
    currentUser.parentemail,
  ]);

  const handleSignout = async () => {
    try {
      const res = await fetch("/api/user/signout", {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        console.log(data.message);
      } else {
        dispatch(signoutSuccess());
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <Sidebar className="w-full md:w-56">
      <Sidebar.Items className="p-3">
        <Sidebar.ItemGroup className="py-10">
          <Link to="/dashboard?tab=profile">
            <Sidebar.Item
              active={tab === "profile"}
              icon={HiUser}
              label={currentUser.role}
              labelColor="dark"
              className="py-4"
            >
              Profile
            </Sidebar.Item>
          </Link>
          <Link to="/addcourses" hidden={currentUser.role !== "admin"}>
            <Sidebar.Item
              active={tab === "addcourses"}
              icon={MdLibraryBooks}
              labelColor="dark"
              className="py-4"
            >
              Add Courses
            </Sidebar.Item>
          </Link>
          <Link to="/addnews" hidden={currentUser.role !== "admin"}>
            <Sidebar.Item
              active={tab === "addnews"}
              icon={FaNewspaper}
              labelColor="dark"
              className="py-4"
            >
              Add News
            </Sidebar.Item>
          </Link>
          <Link to="/addachieve" hidden={currentUser.role !== "admin"}>
            <Sidebar.Item
              active={tab === "addachieve"}
              icon={GrAchievement}
              labelColor="dark"
              className="py-4"
            >
              Add Achievements
            </Sidebar.Item>
          </Link>
          {/* -------------------------------student-------------------------------- */}
          <Link to="/courseregister" hidden={currentUser.role !== "user"}>
            <Sidebar.Item
              active={tab === "courseregister"}
              icon={MdLibraryBooks}
              labelColor="dark"
              className="py-4"
            >
              Course Registration
            </Sidebar.Item>
          </Link>

          <Link to="/roomregister" hidden={currentUser.role !== "user"}>
            <Sidebar.Item
              active={tab === "roomregister"}
              icon={MdLibraryBooks}
              labelColor="dark"
              className="py-4"
            >
              Hostel Registration
            </Sidebar.Item>
          </Link>

          {currentUser.role === "user" && meetingLink && (
            <a href={meetingLink} target="_blank" rel="noopener noreferrer">
              <Sidebar.Item
                active={tab === "meeting"}
                icon={FcVideoCall}
                labelColor="dark"
                className="py-4"
              >
                You have a Meeting <br />({courseName})
              </Sidebar.Item>
            </a>
          )}

          {currentUser.role === "parent" && meetingLink_parent && (
            <a
              href={meetingLink_parent}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Sidebar.Item
                active={tab === "meeting"}
                icon={FcVideoCall}
                labelColor="dark"
                className="py-4"
              >
                You have a Meeting <br />({courseName_parent})
              </Sidebar.Item>
            </a>
          )}

          <Sidebar.Item
            icon={HiArrowSmRight}
            onClick={handleSignout}
            className="cursor-pointer py-4"
          >
            Sign out
          </Sidebar.Item>
        </Sidebar.ItemGroup>
      </Sidebar.Items>
    </Sidebar>
  );
}
