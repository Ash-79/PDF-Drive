import React, { useState, useContext } from "react";
import axios from "axios";
import { UserContext } from "../context/UserContext";
import { PdfContext } from "../context/PdfContext";

const UploadPdf = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  const { user } = useContext(UserContext);
  const { pdfs, setPdfs } = useContext(PdfContext);

  // Function to handle file change
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setMessage("");
    } else {
      setFile(null);
      setMessage("Please select a PDF file.");
    }
  };

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage("No file selected or the selected file is not a PDF.");
      return;
    }
    const formData = new FormData();
    formData.append("userId", user._id);
    formData.append("pdf", file);

    try {
      const response = await axios.post("/upload", formData);
      setMessage("File uploaded successfully");
      setPdfs([...pdfs, response.data.pdf]);
    } catch (error) {
      setMessage("Error uploading file");
    }
  };

  return (
    <div className="flex flex-col items-center  pb-20 min-h-screen bg-[#F7F9FC] p-5">
      <div className="w-full p-8 mt-[300px] space-y-6 bg-white rounded shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-900">
          Upload PDF
        </h2>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="flex flex-col items-center justify-center space-y-4">
            <label
              htmlFor="file"
              className="block w-full text-sm font-medium text-gray-700"
            >
              Choose PDF File
            </label>
            <input
              type="file"
              id="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="block w-full px-3 py-2 text-sm text-gray-700 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="block w-full px-3 py-2 text-sm font-medium text-white bg-primary rounded-md shadow-sm hover:bg-[#da264a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Upload PDF
          </button>
        </form>
        {message && (
          <div className="mt-4 text-center text-sm font-medium text-red-500">
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadPdf;
