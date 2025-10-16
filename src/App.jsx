import { useState } from "react";
import "./App.css";
import Login from "../pages/login.jsx";
import Register from "../pages/user_register";
import HomePage from "../pages/chat_home";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/home" element={<HomePage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;

