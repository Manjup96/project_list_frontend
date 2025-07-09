import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AddProject.css"; // Optional
import { baseUrl } from "../../Components/APIServices/APIServices";

const AddProject = () => {
  const [formData, setFormData] = useState({
    project_name: "",
    primary_team_lead: "",
    secondary_team_lead: "",
    tester_name: "",
    start_date: "",
    internal_end_date: "",
    client_end_date: "",
    technical_skill_stack: "",
    project_type: "",
    // application_type: "",
    application_type: [],
  });

  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser); // Set the user state
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };



  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Submitting project with data:", formData);

    const submissionData = {
      ...formData,
      user_id: user ? user.id : "",
      email: user ? user.email : "",
      name: user ? user.name : "",
    };

    try {
      const response = await axios.post(
        `${baseUrl}/insert_project.php`,
        JSON.stringify(submissionData),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Response data:", response.data);
      console.log("Response data Status:", response.data?.status);
      console.log("API Response status:", response.status);

      if (response.status === 200 && response.data?.status === "success") {
        alert("✅ Project added successfully!");
        window.location.href = "/project-details";
      } else {
        alert(
          "❌ Failed to add project. Reason: " +
            (response.data?.message || "Unknown error occurred.")
        );
        alert(
          "❌ Failed to add project. Reason: " +
            (response.data?.message || "Unknown error occurred.")
        );
      }
    } catch (error) {
      console.error("Error during Axios request:", error);

      if (error.response) {
        // Log full error response details
        console.error("Error Response Data:", error.response.data);
        alert(
          "❌ Server error: " +
            (error.response.data?.message || "Unexpected error occurred.")
        );
      } else if (error.request) {
        // Request made but no response received
        console.error("No Response received:", error.request);
        alert(
          "❌ No response from server. Please check your network or server status."
        );
      } else {
        // Other errors
        alert("❌ Request Error: " + error.message);
      }
    }
  };

  return (
    <div className="container mt-3">
      <div className="row justify-content-center">
        <div className="col-md-12 col-lg-8">
          <div className="card shadow-lg p-4 rounded">
            <h3 className="text-center mb-4">Add Project</h3>
            {message && <div className="alert alert-info">{message}</div>}
            {/* {user && <div className="alert alert-info">Welcome, {user.email}!</div>} */}
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-4 mb-4">
                  <label htmlFor="project_name" className="form-label">
                    Project Name
                  </label>
                  <input
                    type="text"
                    id="project_name"
                    name="project_name"
                    className="form-control"
                    value={formData.project_name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-4 mb-4">
                  <label htmlFor="project_type" className="form-label">
                    Project Type
                  </label>
                  <select
                    id="project_type"
                    name="project_type"
                    className="form-control"
                    value={formData.project_type}
                    onChange={handleChange}
                    required
                  >
                    <option value="">-- Select Project Type --</option>
                    <option value="Internal">Internal</option>
                    <option value="Client">Client</option>
                  </select>
                </div>

                {/* <div className="col-md-4 mb-4">
                  <label htmlFor="application_type" className="form-label">Application/Website</label>
                  <select id="application_type" name="application_type" className="form-control" value={formData.application_type} onChange={handleChange} required>
                    <option value="">-- Select Type --</option>
                    <option value="Website">Website</option>
                    <option value="Mobile Application">Mobile Application</option>
                    <option value="Desktop Application">Desktop Application</option>
                    <option value="Web Application">Web Application</option>
                    <option value="Other">Other</option>
                  </select>
                </div> */}

                <div className="col-md-4 mb-4">
                  <label htmlFor="application_type" className="form-label">
                    Application/Website
                  </label>
                  <select
                    id="application_type"
                    name="application_type"
                    className="form-control"
                    value={formData.application_type}
                    onChange={handleChange}
                    multiple
                    required
                  >
                    <option value="Website">Website</option>
                    <option value="Mobile Application">
                      Mobile Application
                    </option>
                    <option value="Desktop Application">
                      Desktop Application
                    </option>
                    <option value="Web Application">Web Application</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="col-md-4 mb-4">
                  <label htmlFor="primary_team_lead" className="form-label">
                    Primary Team Lead
                  </label>
                  <input
                    type="text"
                    id="primary_team_lead"
                    name="primary_team_lead"
                    className="form-control"
                    value={formData.primary_team_lead}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-4 mb-4">
                  <label htmlFor="secondary_team_lead" className="form-label">
                    Secondary Team Lead
                  </label>
                  <input
                    type="text"
                    id="secondary_team_lead"
                    name="secondary_team_lead"
                    className="form-control"
                    value={formData.secondary_team_lead}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-4 mb-4">
                  <label htmlFor="tester_name" className="form-label">
                    Tester Name
                  </label>
                  <input
                    type="text"
                    id="tester_name"
                    name="tester_name"
                    className="form-control"
                    value={formData.tester_name}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-4 mb-4">
                  <label htmlFor="technical_skill_stack" className="form-label">
                    Technical Skill Stack
                  </label>
                  <textarea
                    id="technical_skill_stack"
                    name="technical_skill_stack"
                    className="form-control"
                    value={formData.technical_skill_stack}
                    onChange={handleChange}
                    required
                    rows="3"
                  ></textarea>
                </div>

                <div className="col-md-4 mb-4">
                  <label htmlFor="start_date" className="form-label">
                    Start Date
                  </label>
                  <input
                    type="date"
                    id="start_date"
                    name="start_date"
                    className="form-control"
                    value={formData.start_date}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-4 mb-4">
                  <label htmlFor="internal_end_date" className="form-label">
                    Internal End Date
                  </label>
                  <input
                    type="date"
                    id="internal_end_date"
                    name="internal_end_date"
                    className="form-control"
                    value={formData.internal_end_date}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-4 mb-4">
                  <label htmlFor="client_end_date" className="form-label">
                    Client End Date
                  </label>
                  <input
                    type="date"
                    id="client_end_date"
                    name="client_end_date"
                    className="form-control"
                    value={formData.client_end_date}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="d-grid mt-4">
                <button type="submit" className="btn btn-primary btn-lg">
                  Submit Project
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProject;
