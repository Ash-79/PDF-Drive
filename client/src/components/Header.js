import React from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import { useContext } from "react";
import logo from "../assets/pdf.png";
import { useState } from "react";

export default function Header({ search, setSearch }) {
  const { user } = useContext(UserContext);
  const [input, setInput] = useState("");

  // Function to handle form submission
  const onSubmitHandler = (event) => {
    event.preventDefault();
    setInput("");
  };

  // Function to handle input change
  const onInputChange = (event) => {
    setInput(event.target.value);
  };

  // Function to handle key press
  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      onSubmitHandler(event);
    }
  };
  return (
    <header className="flex flex-row justify-between items-center pt-4 px-4 bg-[#F7F9FC] overflow-auto pl-12 pr-10">
      <Link to="/" className="flex items-center gap-1 pl-12">
        <img src={logo} alt="PDF" />
        <span className="font-bold text-xl">Home</span>
      </Link>
      <form onSubmit={onSubmitHandler} className="flex flex-row items-center">
        <div className="relative w-[400px] h-[50px]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            id="search"
            className="absolute left-4 top-4 h-5 w-5"
          >
            <path d="M3.624,15a8.03,8.03,0,0,0,10.619.659l5.318,5.318a1,1,0,0,0,1.414-1.414l-5.318-5.318A8.04,8.04,0,0,0,3.624,3.624,8.042,8.042,0,0,0,3.624,15Zm1.414-9.96a6.043,6.043,0,1,1-1.77,4.274A6,6,0,0,1,5.038,5.038Z"></path>
          </svg>
          <input
            type="search"
            className="w-full h-full pl-10 pr-4  border-4  border-grey-400 rounded-full"
            value={search}
            placeholder="Search"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </form>

      <Link
        to={user ? "/account" : "/register"}
        className="flex items-center gap-2 rounded-full pr-3"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
          />
        </svg>
        <div className="bg-gray-500 text-white rounded-full border border-gray-500 p-1 oveflow-hidden">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path
              fillRule="evenodd"
              d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        {!!user && <div className="text-xl">{user.name}</div>}
      </Link>
    </header>
  );
}
