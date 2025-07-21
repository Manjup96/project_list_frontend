import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AddProject.css";
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
    application_type: [],
    technology_partner: "",  // Added field
  });

  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (value) => {
    setFormData((prev) => {
      const updated = prev.application_type.includes(value)
        ? prev.application_type.filter((item) => item !== value)
        : [...prev.application_type, value];
      return { ...prev, application_type: updated };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const submissionData = {
      ...formData,
      user_id: user?.id || "",
      email: user?.email || "",
      name: user?.name || "",
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

      if (response.status === 200 && response.data?.status === "success") {
        alert("✅ Project added successfully!");
        window.location.href = "/project-details";
      } else {
        alert(
          "❌ Failed to add project: " +
            (response.data?.message || "Unknown error")
        );
      }
    } catch (error) {
      alert("❌ Error: " + (error.response?.data?.message || error.message));
    }
  };

  const applicationOptions = [
    "Website",
    "Mobile Application",
    "Desktop Application",
    "Web Application",
    "Other",
  ];

  return (
    <div className="container mt-3">
      <div className="row justify-content-center">
        <div className="col-md-12 col-lg-8">
          <div className="card shadow-lg p-4 rounded">
            <h3 className="text-center mb-4">Add Project</h3>
            {message && <div className="alert alert-info">{message}</div>}

            <form onSubmit={handleSubmit}>
              <div className="row">
                {/* Existing fields */}
                <div className="col-md-4 mb-4">
                  <label htmlFor="project_name" className="form-label">
                    Project Name
                  </label>
                  <input
                    type="text"
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

                {/* Multi-select Application/Website */}
                <div className="col-md-4 mb-4">
                  <label htmlFor="application_type" className="form-label">
                    Application/Website
                  </label>
                  <div className="dropdown">
                   <button
  className="form-control text-start dropdown-toggle"
  type="button"
  data-bs-toggle="dropdown"
  aria-expanded="false"
  style={{
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis"
  }}
>
  {formData.application_type.length > 0
    ? formData.application_type.join(", ")
    : "-- Select Type --"}
</button>
                    <ul
                      className="dropdown-menu w-100 p-2"
                      style={{ maxHeight: "200px", overflowY: "auto" }}
                    >
                      {applicationOptions.map((type) => (
                        <li key={type} className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={type}
                            checked={formData.application_type.includes(type)}
                            onChange={() => handleCheckboxChange(type)}
                          />
                          <label className="form-check-label" htmlFor={type}>
                            {type}
                          </label>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* --- New Technology Partner dropdown --- */}
                <div className="col-md-4 mb-4">
                  <label htmlFor="technology_partner" className="form-label">
                    Technology Partner
                  </label>
                  <select
                    id="technology_partner"
                    name="technology_partner"
                    className="form-control"
                    value={formData.technology_partner}
                    onChange={handleChange}
                    required
                  >
                    <option value="">-- Select Technology Partner --</option>
                    <option value="Short-Term Project">
                      Short-Term Project
                    </option>
                    <option value="Long-Term Collaboration">
                      Long-Term Collaboration
                    </option>
                  </select>
                </div>

                {/* Remaining existing fields */}
                <div className="col-md-4 mb-4">
                  <label htmlFor="primary_team_lead" className="form-label">
                    Primary Team Lead
                  </label>
                  <input
                    type="text"
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
                    name="tester_name"
                    className="form-control"
                    value={formData.tester_name}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-4 mb-4">
                  <label
                    htmlFor="technical_skill_stack"
                    className="form-label"
                  >
                    Technical Skill Stack
                  </label>
                  <textarea
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
