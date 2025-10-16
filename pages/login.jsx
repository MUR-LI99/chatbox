import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
  
    const handleLogin = async (e) => {
      e.preventDefault();
  
      try {
        const response = await fetch("http://localhost:5000/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, password }),
        });
  
        const data = await response.json();
  
        if (data.success) {
          localStorage.setItem("userId", data.userId);
          navigate("/home"); 
        } else {
          alert("Invalid credentials");
        }
      } catch (error) {
        console.error("Error:", error);
        alert("Something went wrong!");
      }
    };
  
    return (
        <div>
        <div className="container-fluid col-12" style={{height:"100vh"}}>
        <div className="container-fluid col-12 d-flex flex-row align-content-center justify-content-center">
        <div className="card col-4 mt-3">
        </div>    
        <div className="card col-4 mt-3">
          <h2>Login</h2>
          <form onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            /><br />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            /><br />
            <button type="submit">Login</button>
          </form>
          </div>
          </div> 
          </div>
        </div>
      );
}