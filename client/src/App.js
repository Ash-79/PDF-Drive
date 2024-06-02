import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import './App.css';
import Layout from './components/Layout';
import RegisterPage from "./components/RegisterPage";
import Account from "./components/Account";
import axios from 'axios'
import {UserContextProvider} from "./context/UserContext";
import { PdfProvider } from "./context/PdfContext";

axios.defaults.baseURL = `${window.location.origin}`;
axios.defaults.withCredentials = true;

function App() {
  return (
    <UserContextProvider>
      <PdfProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Layout/>} />
            <Route path="/register" element={<RegisterPage/>} />
            <Route path="/account" element={<Account/>}/>
          </Routes>
        </Router>
      </PdfProvider>
    </UserContextProvider>
  );
}

export default App;