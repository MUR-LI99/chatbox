import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function EmployeeForm() {
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    dob: "",
    address: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Employee Data Submitted:", formData);

    try {
      const response = await fetch("http://localhost:5000/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("Employee added successfully!");
        setFormData({firstname: "",
        lastname: "",
        email: "",
        dob: "",
        address: ""});
      } else {
        alert("Failed to add employee");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong!");
    }
  };

  return (
<div>
  <div className="d-flex flex-column align-items-center p-5">
    <h5>Hi! Register here</h5>
  </div>

  <div className="col-12 d-flex align-items-center flex-column">
      <div className="shadow card col-10 p-4">
        <form onSubmit={handleSubmit}>
          <div className="form-group p-3">
            <input
              type="text"
              name="firstname"
              placeholder="First Name"
              value={formData.name}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div>

          <div className="form-group p-3">
            <input
              type="text"
              name="lastname"
              placeholder="Last Name"
              value={formData.lastname}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div>

          <div className="form-group p-3">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div>

          <div className="form-group p-3">
            <input
              type="date"
              name="dob"
              placeholder="DOB"
              value={formData.dob}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div>
          
          <div className="form-group p-3 col-12">
            <button type="submit" className="btn btn-primary col-10">
             Register
            </button>
          </div>
        </form>
      </div>
  </div>
</div>

  );
}
