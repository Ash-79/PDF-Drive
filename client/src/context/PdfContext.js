import axios from "axios";
import { createContext, useState, useEffect, useContext } from "react";
import { UserContext } from "../context/UserContext";

// Create a new context for PDFs
export const PdfContext = createContext({});

// Provider component for the PDF context
export const PdfProvider = ({ children }) => {
  const [pdfs, setPdfs] = useState([]);
  const [pdfReady, setpdfready] = useState(false);
  const { user } = useContext(UserContext);

  useEffect(() => {
    if (user && pdfs.length === 0) {
      try {
        axios.get("/pdfs").then(({ data }) => {
          setPdfs(data.pdfs);
          setpdfready(true);
        });
        console.log(pdfs);
      } catch (error) {
        console.log("Error fetching PDFs");
      }
    }
  }, [user]);

  return (
    <PdfContext.Provider value={{ pdfs, setPdfs, pdfReady, setpdfready }}>
      {children}
    </PdfContext.Provider>
  );
};
