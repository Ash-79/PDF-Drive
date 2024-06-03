import React, { useContext } from "react";
import { UserContext } from "../context/UserContext";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { PdfContext } from "./../context/PdfContext";

export default function Account() {
  const { ready, user, setuser } = useContext(UserContext);
  const { setPdfs, setpdfready } = useContext(PdfContext);
  let { subpage } = useParams();
  let navigate = useNavigate();

  // Define the logout function
  async function logout() {
    await axios.post("/logout");
    setuser(null);
    setpdfready(false);
    setPdfs([]);
    navigate("/register");
  }

  // If there is no user, navigate to the register page
  if (!user) return <Navigate to={"/register"} />;

  return (
    <div>
      <div className="mt-20 text-center max-w-lg mx-auto">
        Logges in as {user.name} ({user.email})
        <button className="primary max-w-sm mt-2" onClick={logout}>
          Logout
        </button>
      </div>
    </div>
  );
}
