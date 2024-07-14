import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Studentprofile from "./Studentprofile";
import FacultyProfile from "./FacultyProfile";
import AdminProfile from "./AdminProfile";
import ParentProfile from "./ParentProfile";

export default function DashProfile() {
  const { currentUser } = useSelector((state) => state.user);
  return (
   <>
  {currentUser.role == "user" && <Studentprofile />}
  {currentUser.role == "faculty" && <FacultyProfile />}
  {currentUser.role == "admin" && <AdminProfile />}
  {currentUser.role == "parent" && <ParentProfile />}
   </>
  );
}
