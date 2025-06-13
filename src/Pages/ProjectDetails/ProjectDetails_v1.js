import React, { useEffect, useState } from "react";
import axios from "axios";
import { baseUrl } from "../../Components/APIServices/APIServices"; // Ensure the baseUrl is correctly set
import "./ProjectDetails.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrashAlt } from "@fortawesome/free-solid-svg-icons";

const ProjectDetails = () => {
  const [projects, setProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [role, setRole] = useState(""); // State to manage the user role (admin/teamlead)
  const [statusDescription, setStatusDescription] = useState("");
  const [status, setStatus] = useState(""); // Holds the status description
  const [selectedProjectForStatus, setSelectedProjectForStatus] =
    useState(null); // Holds the project selected for status update
  const [showStatusModal, setShowStatusModal] = useState(false); // Controls the visibility of the status update modal
  const [statusPercentage, setStatusPercentage] = useState(""); // State for the percentage input
  const [updatedProjects, setUpdatedProjects] = useState([]);
  const [user, setUser] = useState(null);

  // Fetch all projects from the backend when the component is mounted
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);
    setRole(storedUser?.role || "");
    fetchProjects();
  }, []);


  // Fetch projects from the backend
  const fetchProjects = async () => {
    const user = JSON.parse(localStorage.getItem("user")); // Get user data from localStorage
  
    try {
      const response = await axios.post(`${baseUrl}/get_projects.php`, {
        user_id: user?.role == "admin" ? null : user?.id, // Only pass user_id if it's not admin
        name: user?.name
      });

      console.log("Reponse", response );
        console.log("Reponse", user?.name );
  
      if (response.data.status == "success") {
        setProjects(response.data.data);
      } else {
        alert("Failed to fetch project details.");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      alert("Error fetching project data.");
    }
  };
  
  

  // Handle search query change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Format date for display (dd/mm/yyyy format)
  const formatDate = (date) => {
    const formattedDate = new Date(date);
    return formattedDate.toLocaleDateString("en-GB");
  };

  // Handle project deletion
  const handleDelete = async (id) => {
    try {
      const response = await axios.post(`${baseUrl}/delete_project.php`, {
        id: id,
      user_id: user?.id,
      name: user?.name,
      });
  
      if (response.data.status == "success") {
        // Remove the deleted project from the state
        setProjects(projects.filter((project) => project.id !== id));
        alert("Project deleted successfully");
      } else {
        alert(response.data.message); // If error from backend
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Error deleting project");
    }
  };
  

  // Open modal with selected project data for editing
  const handleEdit = (project) => {
    setSelectedProject(project);
    setShowUpdateModal(true);
  };

  // Handle the project update request
  const handleUpdate = async (updatedProject) => {
    try {
      if (!updatedProject.id) {
        alert("Project ID is missing!");
        return;
      }
  
      // Prepare the data for the POST request
      const requestData = {
        id: updatedProject.id, // Ensure the ID is included
        project_name: updatedProject.project_name,
        primary_team_lead: updatedProject.primary_team_lead,
        secondary_team_lead: updatedProject.secondary_team_lead,
        tester_name: updatedProject.tester_name,
        technical_skill_stack: updatedProject.technical_skill_stack,
        project_type: updatedProject.project_type,
        application_type: updatedProject.application_type,
        start_date: updatedProject.start_date,
        internal_end_date: updatedProject.internal_end_date,
        client_end_date: updatedProject.client_end_date,
        user_id: user?.id,
        name: user?.name,
      };
  
      console.log("Request Data:", requestData); // Ensure this is logged for debugging
  
      // Send the data to the PHP backend for updating the project
      const response = await axios.post(
        `${baseUrl}/update_project.php`,
        requestData
      );
  
      if (response.data.status == "success") {
        alert("Project updated successfully");
        setShowUpdateModal(false);
        fetchProjects(); // Refetch the projects to show the updated data
      } else {
        alert(response.data.message);  // Show error message
      }
    } catch (error) {
      console.error("Error during update:", error);
      alert("Error updating project");
    }
  };
  

  // Filter projects based on the search query
  // const filteredProjects = projects.filter(
  //   (project) =>
  //     project.project_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //     project.primary_team_lead
  //       .toLowerCase()
  //       .includes(searchQuery.toLowerCase()) ||
  //     project.secondary_team_lead
  //       .toLowerCase()
  //       .includes(searchQuery.toLowerCase()) ||
  //     project.tester_name.toLowerCase().includes(searchQuery.toLowerCase())
  // );

  const handleStatusClick = (project) => {
    console.log("Project selected for status update:", project);
    setSelectedProjectForStatus(project);
    setStatus(project.status || ""); // Initialize status correctly
    setStatusDescription(project.status_description || "");
    setStatusPercentage(project.status_percentage || ""); // Set the status percentage from the project if any
    console.log("Status after setting:", project.status); // Ensure status is set before showing modal
    setShowStatusModal(true); // Show the modal
  };

  const handleStatusUpdate = async (
    projectId,
    status,
    statusDescription,
    statusPercentage
  ) => {
    // Check if projectId and status are not empty
    //  alert(projectId);
    //  alert(status);
    // alert("from handle status upade function");
    // Log the data being sent
    console.log("Data being sent:", {
      project_id: projectId,
      status: status,
      status_description: statusDescription,
      status_percentage: statusPercentage,
    });

    try {
      // Send POST request to the server
      const response = await axios.post(`${baseUrl}/update_status.php`, {
        project_id: projectId,
        status,
        status_description: statusDescription,
        status_percentage: status == "In Progress" ? statusPercentage : null,
        user_id: user?.id,
        name: user?.name,
      });
      // alert(response.data);
      // Log the response from the server
      console.log("Response Data:", response.data);

      // Handle the server response
      if (response.data.status == "success") {
        alert("Status updated successfully");
        setShowStatusModal(false); // Close the modal
        fetchProjects(); // Fetch the updated project list
        setUpdatedProjects((prev) => [...new Set([...prev, projectId])]);
      } else {
        alert(response.data.message); // Show error message from server
      }
    } catch (error) {
      // Handle errors
      console.error("Error updating status:", error);
      alert(error);
      alert("Failed to update status");
    }
  };

  return (
    <div className="project-details-container">
      <div className="project-details-header row justify-content-center">
        <h2 className="project-details-title text-center mb-4">
          Project Details
        </h2>
        <div className="project-search col-lg-10">
          <div className="search-input mb-3">
            <input
              type="text"
              className="search-bar form-control"
              placeholder="Search Projects..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
        </div>
      </div>

      <div className="project-details-table col-lg-10">
        <div className="table-responsive">
          <table className="project-table table table-bordered table-striped text-center">
            

            <thead className="table-dark">
  <tr>
    <th>Id</th>
    <th>Project Name</th>
    <th>Primary TL</th>
    <th>Secondary TL</th>
    <th>Tester</th>
    <th>Start Date</th>
    <th>Internal End Date</th>
    <th>Client End Date</th>
    <th>Skill Stack</th>
    <th>Project Type</th>
    <th>App Type</th>
    {role == "teamlead" && <th>Status</th>}
    <th>Action</th>
  </tr>
</thead>

  

            <tbody>
  {projects.map((project, index) => (
    <tr key={project.id}>
      <td>{index + 1}</td>
      <td>{project.project_name}</td>
      <td>{project.primary_team_lead}</td>
      <td>{project.secondary_team_lead}</td>
      <td>{project.tester_name}</td>
      <td>{formatDate(project.start_date)}</td>
      <td>{formatDate(project.internal_end_date)}</td>
      <td>{formatDate(project.client_end_date)}</td>
      <td>{project.technical_skill_stack}</td>
      <td>{project.project_type}</td>
      <td>{project.application_type}</td>

      {role === "teamlead" && (
        <td>
          <button
            className="btn btn-info"
            style={{ fontSize: "12px" }}
            onClick={() => handleStatusClick(project)}
          >
            {project.status ? "Update Status" : "Change Status"}
          </button>
        </td>
      )}

      <td className="d-flex justify-content-start mt-3">
        <button
          className="btn btn-warning btn-sm me-2"
          onClick={() => handleEdit(project)}
        >
          <FontAwesomeIcon icon={faEdit} />
        </button>

        <button
          className="btn btn-danger btn-sm"
          onClick={() => handleDelete(project.id)}
        >
          <FontAwesomeIcon icon={faTrashAlt} />
        </button>
      </td>
    </tr>
  ))}
</tbody>

          </table>
        </div>
      </div>

      {/* Status Update Modal */}
      {showStatusModal && selectedProjectForStatus && (
        <div
          className="modal fade show"
          style={{ display: "block" }}
          tabIndex="-1"
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Update Project Status</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowStatusModal(false)}
                />
              </div>
              <div className="modal-body">
                <form
                  onSubmit={(e) => {
                    e.preventDefault(); // Prevent form submission
                    handleStatusUpdate(
                      selectedProjectForStatus.id, // Pass the selected project ID
                      status,
                      statusDescription,
                      status == "In Progress" ? statusPercentage : null // Pass statusPercentage only if In Progress
                    );
                  }}
                >
                  {/* Hidden input field for project id */}
                  <input
                    type="hidden"
                    name="id"
                    value={selectedProjectForStatus.id}
                  />

                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <label htmlFor="status" className="form-label">
                        Status
                      </label>
                      <select
                        id="status"
                        name="status"
                        className="form-control"
                        onChange={(e) => setStatus(e.target.value)}
                        value={status}
                        required
                      >
                        <option value="">-- Select Status --</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                        <option value="On Hold">On Hold</option>
                      </select>
                    </div>

                    <div className="col-md-4 mb-3">
                      <label
                        htmlFor="status_description"
                        className="form-label"
                      >
                        Status Description
                      </label>
                      <textarea
                        id="status_description"
                        name="status_description"
                        className="form-control"
                        rows="4"
                        onChange={(e) => setStatusDescription(e.target.value)}
                        value={statusDescription}
                        required
                      />
                    </div>

                    {/* Conditionally render the status percentage field */}
                    {status == "In Progress" && (
                      <div className="col-md-4 mb-3">
                        <label
                          htmlFor="status_percentage"
                          className="form-label"
                        >
                          Status Percentage
                        </label>
                        <input
                          type="number"
                          id="status_percentage"
                          name="status_percentage"
                          className="form-control"
                          placeholder="Enter percentage"
                          min="0"
                          max="100"
                          value={statusPercentage}
                          onChange={(e) => setStatusPercentage(e.target.value)} // Update statusPercentage
                          required
                        />
                      </div>
                    )}
                  </div>

                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowStatusModal(false)}
                    >
                      Close
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Save Status
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {showUpdateModal && selectedProject && (
        <div
          className="modal fade show"
          style={{ display: "block" }}
          tabIndex="-1"
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Update Project</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowUpdateModal(false)}
                />
              </div>
              <div className="modal-body">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    console.log("Form submitted");
                    handleUpdate(selectedProject); // Call the handleUpdate function when the form is submitted
                  }}
                >
                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <label htmlFor="project_name" className="form-label">
                        Project Name
                      </label>
                      <input
                        type="text"
                        id="project_name"
                        name="project_name"
                        className="form-control"
                        value={selectedProject.project_name}
                        onChange={(e) =>
                          setSelectedProject({
                            ...selectedProject,
                            project_name: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div className="col-md-4 mb-3">
                      <label htmlFor="project_type" className="form-label">
                        Project Type
                      </label>
                      <select
                        id="project_type"
                        name="project_type"
                        className="form-control"
                        value={selectedProject.project_type}
                        onChange={(e) =>
                          setSelectedProject({
                            ...selectedProject,
                            project_type: e.target.value,
                          })
                        }
                        required
                      >
                        <option value="">-- Select Project Type --</option>
                        <option value="Internal">Internal</option>
                        <option value="Client">Client</option>
                      </select>
                    </div>

                    <div className="col-md-4 mb-3">
                      <label htmlFor="application_type" className="form-label">
                        Application/Website
                      </label>
                      <select
                        id="application_type"
                        name="application_type"
                        className="form-control"
                        value={selectedProject.application_type}
                        onChange={(e) =>
                          setSelectedProject({
                            ...selectedProject,
                            application_type: e.target.value,
                          })
                        }
                        required
                      >
                        <option value="">-- Select Type --</option>
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

                    <div className="col-md-4 mb-3">
                      <label htmlFor="primary_team_lead" className="form-label">
                        Primary Team Lead
                      </label>
                      <input
                        type="text"
                        id="primary_team_lead"
                        name="primary_team_lead"
                        className="form-control"
                        value={selectedProject.primary_team_lead}
                        onChange={(e) =>
                          setSelectedProject({
                            ...selectedProject,
                            primary_team_lead: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div className="col-md-4 mb-3">
                      <label
                        htmlFor="secondary_team_lead"
                        className="form-label"
                      >
                        Secondary Team Lead
                      </label>
                      <input
                        type="text"
                        id="secondary_team_lead"
                        name="secondary_team_lead"
                        className="form-control"
                        value={selectedProject.secondary_team_lead}
                        onChange={(e) =>
                          setSelectedProject({
                            ...selectedProject,
                            secondary_team_lead: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="col-md-4 mb-3">
                      <label htmlFor="tester_name" className="form-label">
                        Tester Name
                      </label>
                      <input
                        type="text"
                        id="tester_name"
                        name="tester_name"
                        className="form-control"
                        value={selectedProject.tester_name}
                        onChange={(e) =>
                          setSelectedProject({
                            ...selectedProject,
                            tester_name: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="col-md-4 mb-3">
                      <label
                        htmlFor="technical_skill_stack"
                        className="form-label"
                      >
                        Technical Skill Stack
                      </label>
                      <textarea
                        id="technical_skill_stack"
                        name="technical_skill_stack"
                        className="form-control"
                        value={selectedProject.technical_skill_stack}
                        onChange={(e) =>
                          setSelectedProject({
                            ...selectedProject,
                            technical_skill_stack: e.target.value,
                          })
                        }
                        required
                        rows="3"
                      ></textarea>
                    </div>

                    <div className="col-md-4 mb-3">
                      <label htmlFor="start_date" className="form-label">
                        Start Date
                      </label>
                      <input
                        type="date"
                        id="start_date"
                        name="start_date"
                        className="form-control"
                        value={selectedProject.start_date}
                        onChange={(e) =>
                          setSelectedProject({
                            ...selectedProject,
                            start_date: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div className="col-md-4 mb-3">
                      <label htmlFor="internal_end_date" className="form-label">
                        Internal End Date
                      </label>
                      <input
                        type="date"
                        id="internal_end_date"
                        name="internal_end_date"
                        className="form-control"
                        value={selectedProject.internal_end_date}
                        onChange={(e) =>
                          setSelectedProject({
                            ...selectedProject,
                            internal_end_date: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div className="col-md-4 mb-3">
                      <label htmlFor="client_end_date" className="form-label">
                        Client End Date
                      </label>
                      <input
                        type="date"
                        id="client_end_date"
                        name="client_end_date"
                        className="form-control"
                        value={selectedProject.client_end_date}
                        onChange={(e) =>
                          setSelectedProject({
                            ...selectedProject,
                            client_end_date: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowUpdateModal(false)}
                    >
                      Close
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Save changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;
