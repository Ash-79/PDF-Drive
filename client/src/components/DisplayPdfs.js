import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { PdfContext } from "../context/PdfContext";
import axios from "axios";
import pdfImg from "../assets/pdfImg.png";
import "../css/DisplayPdfs.css";
import {
  AiOutlineEye,
  AiOutlineDownload,
  AiOutlineUserAdd,
  AiOutlineShareAlt,
  AiOutlineComment,
} from "react-icons/ai";

export default function DisplayPdfs({ search }) {
  // Initialize state variables
  const [openIndex, setOpenIndex] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(null);
  const [addEmail, setAddEmail] = useState("");
  const [comments, setComments] = useState(null);
  const [newcomment, setNewComment] = useState(null);

  // Get pdf data from context
  const { pdfs, pdfReady, setPdfs } = useContext(PdfContext);

  // Function to handle adding a comment
  const handleAddComment = async (currPdf) => {
    // Send the new comment to the backend and get the updated PDF
    const response = await axios.post(`/addComment`, {
      comment: newcomment,
      _id: currPdf._id,
    });
    const updatedPdf = response.data.pdf;

    // Replace the old PDF with the updated PDF in the local state
    setPdfs(pdfs.map((pdf) => (pdf._id === currPdf._id ? updatedPdf : pdf)));
    setPdfs(pdfs.map((pdf) => ({ ...pdf })));

    alert("Comment Added...");
    setTimeout(() => {
      window.location.reload();
    }, 1000);

    // setComments(currPdf);
  };

  // Function to filter pdfs based on search
  let filterP = () => {
    return pdfs && pdfs.filter((pdf) =>
      pdf && pdf.filename.toLowerCase().includes(search.toLowerCase())
    );
  };
  let filteredPdfs = filterP();

  // Function to handle viewing a pdf
  const handleViewClick = async (pdfname) => {
    try {
      const encodedPdfName = encodeURIComponent(pdfname);
      fetch(`${window.location.origin}/pdf/${encodedPdfName}`, {
        cache: "no-store",
        credentials: "include",
      })
      .then((response) => response.blob())
      .then((blob) => {
        var url = URL.createObjectURL(blob);
        window.open(url, "_blank");
      })
      .catch((error) => console.error("Failed to fetch signed URL:", error));
    } catch (error) {
      console.error("Failed to fetch PDF:", error);
    }
  };

  // Function to handle downloading a pdf
  const handleDownloadClick = async (pdfname) => {
    try {
      const encodedPdfName = encodeURIComponent(pdfname);
      fetch(`${window.location.origin}/pdf/${encodedPdfName}`, {
        cache: "no-store",
        credentials: "include",
      })
      .then((response) => response.blob())
      .then((blob) => {
        var url = URL.createObjectURL(blob);
        var link = document.createElement('a');
        link.href = url;
        link.download = pdfname;
        link.click();
      })
      .catch((error) => console.error("Failed to fetch PDF:", error));
    } catch (error) {
      console.error("Failed to download PDF:", error);
    }
  };

  // Function to handle sharing a pdf
  const handleShareClick = (uniqueLink) => {
    const link = `https://storage.googleapis.com/pdf-cloud/${uniqueLink}.pdf`;
    copyToClipboard(link);
  };

  // Function to handle opening a modal
  const handleOpenModal = (index) => {
    setIsModalOpen(index);
  };

  // Function to handle adding a user
  const handleAddUser = async (pdfId) => {
    try {
      let response = await axios.post(`/addUser/${pdfId}`, { email: addEmail });
      alert(response.data.message);
      setIsModalOpen(false);
      setAddEmail("");
    } catch (err) {
      alert("Failed to add user: ", err);
    }
  };

  // Function to copy text to clipboard
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("Link copied to clipboard");
    } catch (err) {
      console.error("Failed to copy link: ", err);
    }
  };

  return (
    <div className="w-full flex flex-row overflow-y-auto p-5 bg-white rounded-3xl mr-10 mt-5">
      <div
        className={`mb-5 ml-5 flex flex-col space-y-4 ${
          comments ? "w-3/4" : ""
        }`}
      >
        <h1 className="pl-3 text-3xl font-bold font-serif">Files</h1>
        <div className="flex flex-wrap justify-start gap-x-5 gap-y-5 text-textC">
          {pdfReady &&
            filteredPdfs.length > 0 &&
            filteredPdfs.map((pdf, index) => (
              <div key={index} className="hover:cursor-alias">
                <div className="flex bg-grey-200 w-full flex-col items-center justify-center rounded-xl bg-gray-100 px-2.5 hover:bg-gray-200">
                  <div className="relative flex w-full items-center justify-between px-1 py-3 m-0">
                    <div className="flex items-center space-x-4">
                      <div className="h-6 w-6">
                        <svg
                          stroke="currentColor"
                          fill="currentColor"
                          strokeWidth="0"
                          viewBox="0 0 24 24"
                          className="w-full h-full text-[#CA2E24]"
                          height="1em"
                          width="1em"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path fill="none" d="M0 0h24v24H0z"></path>
                          <path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8.5 7.5c0 .83-.67 1.5-1.5 1.5H9v2H7.5V7H10c.83 0 1.5.67 1.5 1.5v1zm5 2c0 .83-.67 1.5-1.5 1.5h-2.5V7H15c.83 0 1.5.67 1.5 1.5v3zm4-3H19v1h1.5V11H19v2h-1.5V7h3v1.5zM9 9.5h1v-1H9v1zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm10 5.5h1v-3h-1v3z"></path>
                        </svg>
                      </div>
                      <span className="w-32 truncate text-sm font-bold">
                        {pdf.filename.split("#")[1]}
                      </span>
                    </div>
                    <svg
                      onClick={() => {
                        setOpenIndex(openIndex === index ? null : index);
                        handleOpenModal(null);
                      }}
                      stroke="currentColor"
                      fill="currentColor"
                      strokeWidth="0"
                      viewBox="0 0 16 16"
                      className="h-6 w-6 cursor-pointer rounded-full p-1 hover:bg-[#ccc]"
                      height="1em"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"></path>
                    </svg>
                    {openIndex === index && (
                      <div
                        className={`dropdown ${
                          openIndex === index ? "show" : ""
                        } absolute top-8 left-20 right-0 mt-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-1 overflow-visible`}
                      >
                        <div
                          className="py-1"
                          role="menu"
                          aria-orientation="vertical"
                          aria-labelledby="options-menu"
                        >
                          <Link
                            onClick={() => handleViewClick(pdf.filename)}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 no-underline"
                            role="menuitem"
                          >
                            <AiOutlineEye />
                            View
                          </Link>
                          <Link
                            onClick={() => handleDownloadClick(pdf.filename)}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 no-underline"
                            role="menuitem"
                          >
                            <AiOutlineDownload />
                            Download
                          </Link>
                          <Link
                            onClick={() => handleOpenModal(index)}
                            className="relative overflow-visible flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 no-underline"
                            role="menuitem"
                          >
                            <AiOutlineUserAdd />
                            Add User
                            {isModalOpen >= 0 && isModalOpen === index && (
                              <div className="flex absolute items-center gap-2">
                                <input
                                  type="text"
                                  className="border p-2 rounded"
                                  value={addEmail}
                                  onChange={(event) =>
                                    setAddEmail(event.target.value)
                                  }
                                  placeholder="Enter email"
                                />
                                <button
                                  className="flex items-center justify-center w-8 h-6 mr-1 bg-[#f5385d] text-white rounded-full"
                                  onClick={() => handleAddUser(pdf._id)}
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    className="h-6 w-6"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                    />
                                  </svg>
                                </button>
                              </div>
                            )}
                          </Link>
                          <Link
                            onClick={() => handleShareClick(pdf.uniqueLink)}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 "
                            role="menuitem"
                          >
                            <AiOutlineShareAlt />
                            Share
                          </Link>
                          <Link
                            onClick={() => setComments(pdf)}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 no-underline"
                            role="menuitem"
                          >
                            <AiOutlineComment />
                            Comments
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex h-44 w-48 items-center justify-center pb-2.5 m-0">
                    <div className="h-36 w-36">
                      <img src={pdfImg} alt="pdfImage"></img>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
      {comments && (
        <div className="relative flex flex-col bg-white shadow-2xl rounded-lg p-6 m-4 w-1/4">
          {/* Close Button */}
          <div className="absolute top-[-7px] right-[-7px] m-2 h-8 w-8 border border-black rounded-full bg-white flex items-center justify-center shadow-md">
            <svg
              className="h-6 w-6 cursor-pointer"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              onClick={() => {
                setComments(null);
                setOpenIndex(null);
              }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>

          {/* Pdf Data */}
          <div className="flex bg-grey-200 w-full flex-col items-center justify-center rounded-xl bg-gray-100 px-2.5 hover:bg-gray-200">
            <div className="relative flex w-full items-center justify-between px-1 py-3 m-0">
              <div className="flex items-center space-x-4 overflow-hidden">
                <div className="h-6 w-6">
                  <svg
                    stroke="currentColor"
                    fill="currentColor"
                    strokeWidth="0"
                    viewBox="0 0 24 24"
                    className="w-full h-full text-[#CA2E24]"
                    height="1em"
                    width="1em"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path fill="none" d="M0 0h24v24H0z"></path>
                    <path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8.5 7.5c0 .83-.67 1.5-1.5 1.5H9v2H7.5V7H10c.83 0 1.5.67 1.5 1.5v1zm5 2c0 .83-.67 1.5-1.5 1.5h-2.5V7H15c.83 0 1.5.67 1.5 1.5v3zm4-3H19v1h1.5V11H19v2h-1.5V7h3v1.5zM9 9.5h1v-1H9v1zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm10 5.5h1v-3h-1v3z"></path>
                  </svg>
                </div>
                <span className="truncate text-md font-bold">
                  {comments.filename.split("#")[1]}
                </span>
              </div>
            </div>
          </div>

          {/* Comments */}
          <div className="flex flex-col mt-4 mb-4 bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-bold mb-2">Comments</h3>
            {comments.comments.length > 0 &&
              comments.comments.map((comment, index) => (
                <div
                  key={index}
                  className="flex items-start text-sm text-gray-700 mb-2 border-b border-gray-200 py-4"
                >
                  <div className="bg-gray-200 rounded-full h-8 w-8 flex items-center justify-center mr-2 text-gray-500 font-bold">
                    {comment.email[0].toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <p className="font-semibold text-gray-900">
                      {comment.email}
                    </p>
                    <p>{comment.comment}</p>
                  </div>
                </div>
              ))}
          </div>

          {/* Add Comment */}
          <div className="flex items-center">
            <input
              className="border border-gray-300 ring-opacity-1 rounded-lg p-2 flex-grow mr-2"
              type="text"
              placeholder="Add a comment..."
              value={newcomment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <button
              className="block px-3 py-2 text-sm font-medium text-white bg-primary rounded-lg shadow-sm hover:bg-[#da264a] focus:outline-none focus:ring-2"
              onClick={() => handleAddComment(comments)}
            >
              Comment
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
