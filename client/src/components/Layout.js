import React, { useContext, useState, useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import axios from "axios";
import Header from "./Header";
import UploadPdf from "./UploadPdf";
import DisplayPdfs from "./DisplayPdfs";
import { UserContext } from "../context/UserContext";

export default function Layout() {
  const { user } = useContext(UserContext);

  // State for the search input
  const [search, setSearch] = useState("");

  // If there's no user, navigate to the register page
  if (!user) return <Navigate to={"/register"} />;

  return (
    <div className="w-screen overflow-auto bg-[#F7F9FC]">
      <Header search={search} setSearch={setSearch} />
      <div className="flex">
        <UploadPdf className="w-1/3" />
        <DisplayPdfs className="w-2/3" search={search} />
      </div>
    </div>
  );
}
