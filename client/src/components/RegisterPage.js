import React, { useContext, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import axios from "axios";
import { UserContext } from "../context/UserContext";
import "../css/Register_css.css";

export default function RegisterPage() {
  let navigate = useNavigate();
  const { setuser, user } = useContext(UserContext);

  const [activeTab, setActiveTab] = useState("#signin");
  const [signinData, setSigninData] = useState({
    email: "",
    password: "",
    rememberPassword: false,
  });
  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    password: "",
    terms: false,
  });

  // If the user is already logged in, navigate to the home page
  if (user) return <Navigate to={"/"} />;

  // Function to handle tab click
  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  // Function to handle sign in data change
  const handleSigninChange = (e) => {
    const { id, value, type, checked } = e.target;
    setSigninData({
      ...signinData,
      [id]: type === "checkbox" ? checked : value,
    });
  };

  // Function to handle sign up data change
  const handleSignupChange = (e) => {
    const { id, value, type, checked } = e.target;
    setSignupData({
      ...signupData,
      [id]: type === "checkbox" ? checked : value,
    });
  };

  // Function to handle sign in form submission
  const handleSigninSubmit = async (e) => {
    e.preventDefault();
    try {
      const { email, password } = signinData;
      const user = await axios.post("/login", {
        email,
        password,
      });
      setuser(user.data);
      alert("Login successful");
      navigate("/");
    } catch (error) {
      alert("Invalid user details");
    }
  };

  // Function to handle sign up form submission
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    try {
      const { name, email, password } = signupData;
      const user = await axios.post("/register", {
        name,
        email,
        password,
      });
      setuser(user.data);
      alert("Registration successful, you can login now.");
      navigate("/");
    } catch (error) {
      alert("Registration failed, try again later.");
    }
  };

  return (
    <div className="registration-form">
      <div className="header">
        <button
          className={`btn btn-tab btn-ripple ${
            activeTab === "#signin" ? "active" : ""
          }`}
          onClick={() => handleTabClick("#signin")}
        >
          SIGN IN
        </button>
        <button
          className={`btn btn-tab btn-ripple ${
            activeTab === "#signup" ? "active" : ""
          }`}
          onClick={() => handleTabClick("#signup")}
        >
          SIGN UP
        </button>
      </div>
      <div className="body">
        <div
          className={`content ${activeTab === "#signin" ? "active" : ""}`}
          id="signin"
        >
          <h1>Sign in to your account</h1>
          <p className="gray">Sign in to access all free resources</p>
          <form onSubmit={handleSigninSubmit}>
            <div className="input-group">
              <input
                type="text"
                id="email"
                className="input-elem"
                placeholder=" "
                value={signinData.email}
                onChange={handleSigninChange}
                autoComplete="off"
              />
              <label htmlFor="email">Email</label>
            </div>
            <div className="input-group">
              <input
                type="password"
                id="password"
                className="input-elem"
                placeholder=" "
                value={signinData.password}
                onChange={handleSigninChange}
                autoComplete="off"
              />
              <label htmlFor="password">Password</label>
              <i className="fas fa-eye-slash eye"></i>
            </div>
            <div className="agreements">
              <input
                type="checkbox"
                id="rememberPassword"
                checked={signinData.rememberPassword}
                onChange={handleSigninChange}
              />
              <label htmlFor="rememberPassword" className="gray">
                Remember Password
              </label>
            </div>
            <button className="btn btn-register" type="submit">
              Sign In
            </button>
            <a className="reg_link">
              Forgot your password?
            </a>
          </form>
        </div>
        <div
          className={`content ${activeTab === "#signup" ? "active" : ""}`}
          id="signup"
        >
          <h1>REGISTER</h1>
          <p className="gray">
            You can use this account to log in to any of our products
          </p>
          <form onSubmit={handleSignupSubmit}>
            <div className="input-group">
              <input
                type="text"
                id="name"
                className="input-elem"
                placeholder=" "
                value={signupData.name}
                onChange={handleSignupChange}
                autoComplete="off"
              />
              <label htmlFor="name">Name</label>
            </div>
            <div className="input-group">
              <input
                type="email"
                id="email"
                className="input-elem"
                placeholder=" "
                value={signupData.email}
                onChange={handleSignupChange}
                autoComplete="off"
              />
              <label htmlFor="email">Email</label>
            </div>
            <div className="input-group">
              <input
                type="password"
                id="password"
                className="input-elem"
                placeholder=" "
                value={signupData.password}
                onChange={handleSignupChange}
                autoComplete="off"
              />
              <label htmlFor="password">Password</label>
              <i className="fas fa-eye-slash eye"></i>
            </div>
            <div className="agreements">
              <input
                type="checkbox"
                id="terms"
                checked={signupData.terms}
                onChange={handleSignupChange}
              />
              <label htmlFor="terms" className="gray">
                Agree to our conditions
              </label>
            </div>
            <button className="btn btn-register" type="submit">
              Sign Up
            </button>
          </form>
        </div>
      </div>
      <div className="Loading-Modal">
        <div>
          <img
            src="https://raw.githubusercontent.com/FaiezWaseem/Video-Point/master/assets/images/71814-loading-dots.gif"
            alt="Loading"
          />
          <h1>Authenticating Please Wait ...</h1>
          <span>Please Do not Close The Window While Authenticating... </span>
        </div>
      </div>
    </div>
  );
}
