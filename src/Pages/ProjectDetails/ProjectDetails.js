import React, { useEffect, useState } from "react";
import axios from "axios";
import { baseUrl } from "../../Components/APIServices/APIServices"; // Ensure the baseUrl is correctly set
import "./ProjectDetails.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrashAlt,
  faComment,
  faComments,
} from "@fortawesome/free-solid-svg-icons";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Pagination from "./Pagination";
import { useLocation } from "react-router-dom";

const ProjectDetails = () => {
  const [projects, setProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [role, setRole] = useState(""); // State to manage the user role (admin/teamlead)
  const [statusDescription, setStatusDescription] = useState("");
  const [status, setStatus] = useState("All Statuses"); // Default to "All Statuses"
  const [selectedProjectForStatus, setSelectedProjectForStatus] =
    useState(null); // Holds the project selected for status update
  const [showStatusModal, setShowStatusModal] = useState(false); // Controls the visibility of the status update modal
  const [statusPercentage, setStatusPercentage] = useState(""); // State for the percentage input
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [responseData, setResponseData] = useState({ status: "", data: [] });
  const [showResponseModal, setShowResponseModal] = useState(false); // Modal visibility state
  const itemsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);
  const location = useLocation();

  // Initialize state from navigation or default to 'all'
  const [statusFilter, setStatusFilter] = useState(
    location.state?.initialStatus || "all"
  );

  // Helper to check if two dates are within the same 7-day period from project start
  const isSameUpdateWeek = (date1, date2, projectStartDate) => {
    const start = new Date(projectStartDate);
    const d1 = new Date(date1);
    const d2 = new Date(date2);

    // Calculate difference in weeks from project start
    const msPerWeek = 1000 * 60 * 60 * 24 * 7;
    const week1 = Math.floor((d1 - start) / msPerWeek);
    const week2 = Math.floor((d2 - start) / msPerWeek);

    return week1 === week2;
  };

  // Calculate next available update date (7 days after last update)
  const getNextUpdateDate = (lastUpdateDate) => {
    const nextDate = new Date(lastUpdateDate);
    nextDate.setDate(nextDate.getDate() + 7);
    return nextDate;
  };

  // Fetch all projects from the backend when the component is mounted
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);
    setRole(storedUser?.role || "");
    fetchProjects(); // Initially fetch all projects
  }, []);

  // Fetch projects from the backend based on status filter
  const fetchProjects = async () => {
    const user = JSON.parse(localStorage.getItem("user")); // Get user data from localStorage

    try {
      const response = await axios.post(`${baseUrl}/get_projects.php`, {
        user_id: user?.role === "admin" ? null : user?.id, // Only pass user_id if it's not admin
        name: user?.name,
      });

      if (response.data.status === "success") {
        setProjects(response.data.data); // Set the filtered project data
      } else {
        alert("Failed to fetch project details.");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      alert("Error fetching project data.");
    }
  };

  // Handle search query change
  // const handleSearchChange = (e) => {
  //   setSearchQuery(e.target.value);
  // };

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

      if (response.data.status === "success") {
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

      const requestData = {
        id: updatedProject.id,
        project_name: updatedProject.project_name,
        primary_team_lead: updatedProject.primary_team_lead,
        secondary_team_lead: updatedProject.secondary_team_lead,
        tester_name: updatedProject.tester_name,
        technical_skill_stack: updatedProject.technical_skill_stack,
        project_type: updatedProject.project_type,
        application_type: updatedProject.application_type,
        technology_partner: updatedProject.technology_partner, // ✅ Added line
        start_date: updatedProject.start_date,
        internal_end_date: updatedProject.internal_end_date,
        client_end_date: updatedProject.client_end_date,
        user_id: user?.id,
        name: user?.name,
      };

      // Send the data to the PHP backend for updating the project
      const response = await axios.post(
        `${baseUrl}/update_project.php`,
        requestData
      );

      if (response.data.status === "success") {
        alert("Project updated successfully");
        setShowUpdateModal(false);
        fetchProjects(); // Refetch the projects to show the updated data
      } else {
        alert(response.data.message); // Show error message
      }
    } catch (error) {
      console.error("Error during update:", error);
      alert("Error updating project");
    }
  };

  // Modified handleStatusClick function
  const handleStatusClick = (project) => {
    const now = new Date();
    const startDate = new Date(project.start_date);
    const endDate = new Date(project.client_end_date);

    // Check if project is active
    if (now < startDate) {
      alert(`Project starts on ${formatDate(startDate)}`);
      return;
    }

    if (now > endDate) {
      alert(`Project ended on ${formatDate(endDate)}`);
      return;
    }

    // Get last updates from localStorage
    const lastUpdates =
      JSON.parse(localStorage.getItem("projectUpdates")) || {};
    const lastUpdate = lastUpdates[project.id];

    if (lastUpdate) {
      const lastUpdateDate = new Date(lastUpdate.timestamp);

      // Check if updated in the same 7-day window
      if (isSameUpdateWeek(now, lastUpdateDate, startDate)) {
        const nextUpdateDate = getNextUpdateDate(lastUpdateDate);

        alert(
          `Weekly Update Restriction\n\n` +
            `Last updated on: ${formatDate(lastUpdateDate)}\n` +
            `Next update available: ${formatDate(nextUpdateDate)}\n` +
            `(7 days after last update)\n\n` +
            `Project period: ${formatDate(startDate)} → ${formatDate(endDate)}`
        );
        return;
      }
    }

    // If allowed, proceed with status update
    setSelectedProjectForStatus(project);
    setStatus(project.status || "");
    setStatusDescription(project.status_description || "");
    setStatusPercentage(project.status_percentage || "");
    setShowStatusModal(true);
  };

  // Modified handleStatusUpdate function
  const handleStatusUpdate = async (
    projectId,
    status,
    statusDescription,
    statusPercentage
  ) => {
    try {
      const response = await axios.post(`${baseUrl}/update_status.php`, {
        project_id: projectId,
        status,
        status_description: statusDescription,
        status_percentage: status === "In Progress" ? statusPercentage : null,
        user_id: user?.id,
        name: user?.name,
      });

      if (response.data.status === "success") {
        // Record this update with timestamp
        const lastUpdates =
          JSON.parse(localStorage.getItem("projectUpdates")) || {};
        lastUpdates[projectId] = {
          timestamp: new Date().toISOString(),
          by: user?.name,
        };
        localStorage.setItem("projectUpdates", JSON.stringify(lastUpdates));

        alert("Status updated successfully");
        setShowStatusModal(false);
        fetchProjects();
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    }
  };

  // Filter projects based on the search query
const filteredProjects = projects.filter((project) => {
  const matchesSearch =
    project.project_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.primary_team_lead.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.secondary_team_lead.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.tester_name.toLowerCase().includes(searchQuery.toLowerCase());

   const matchesStatus =
    statusFilter === "all"
      ? true
      : statusFilter === "exceed"
      ? new Date(project.client_end_date) < new Date()
      : statusFilter === "short-term"
      ? project.technology_partner === "Short-Term Project"
      : statusFilter === "long-term"
      ? project.technology_partner === "Long-Term Collaboration"
      : project.status &&
        project.status.toLowerCase() === statusFilter.toLowerCase();

  return matchesSearch && matchesStatus;
});


  const [showCommentModal, setShowCommentModal] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [selectedProjectForComment, setSelectedProjectForComment] =
    useState(null);
  const [showViewCommentsModal, setShowViewCommentsModal] = useState(false);

  const fetchComments = async (projectId) => {
    try {
      const response = await axios.post(`${baseUrl}/get_comments.php`, {
        project_id: projectId,
      });

      if (response.data.status === "success") {
        setComments(response.data.data);
      } else {
        alert("Failed to fetch comments.");
      }
    } catch (error) {
      console.error("Fetch comments error:", error);
      alert("Error fetching comments.");
    }
  };

  // Handle adding a new comment
  const handleAddComment = async () => {
    try {
      const response = await axios.post(`${baseUrl}/add_comment.php`, {
        project_id: selectedProjectForComment.id,
        comment: comment,
        user_id: user?.id,
        name: user?.name,
      });

      if (response.data.status === "success") {
        alert("Comment added successfully");
        setComment("");
        setShowCommentModal(false);
        fetchComments(selectedProjectForComment.id); // Refresh comments
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error("Add comment error:", error);
      alert("Error adding comment");
    }
  };

  // Open comment modal for a specific project
  const handleCommentClick = (project) => {
    setSelectedProjectForComment(project);
    setShowCommentModal(true);
  };

  // Open view comments modal for a specific project
  const handleViewComments = async (project) => {
    setSelectedProjectForComment(project);
    await fetchComments(project.id);
    setShowViewCommentsModal(true);
  };

  // const handleResponseClick = async (comment_id, project_id) => {
  //   if (!comment_id) {
  //     alert("Comment ID is missing.");
  //     return;
  //   }

  //   if (!project_id) {
  //     alert("Project ID is missing.");
  //     return;
  //   }

  //   // Log the projectId to the console to see its value
  //   console.log("Project ID: ", project_id);

  //   setShowResponseModal(true); // Show the response modal

  //   try {
  //     // Make the POST request with comment_id and project_id
  //     const response = await axios.post(`${baseUrl}/get_responses.php`, {
  //       comment_id: comment_id,  // Ensure comment_id is passed correctly
  //       project_id: project_id,  // Pass the project_id as well
  //     });

  //     if (response.data.status === "success") {
  //       setResponseData(response.data.data); // Set the response data in state
  //     } else {
  //       alert("Failed to fetch response data.");
  //     }
  //   } catch (error) {
  //     console.error("Error fetching response data:", error);
  //     alert("Error fetching response data.");
  //   }
  // };

  // Close the response modal

  // const closeResponseModal = () => {
  //   setShowResponseModal(false);
  // };

  const handleResponseClick = async (project_id) => {
    console.log("projectid", project_id);
    try {
      setIsLoading(true);
      const response = await fetch(
        `${baseUrl}/get_responsesview.php?project_id=${project_id}`
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      setResponseData(data); // This now contains {status, data}
      console.log("API Response:", data);
      setShowResponseModal(true);
    } catch (error) {
      console.error("Error fetching response data:", error);
      alert("Error fetching response data.");
    } finally {
      setIsLoading(false);
    }
  };

  const closeResponseModal = () => {
    setShowResponseModal(false);
    setResponseData([]);
  };

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentProjects = filteredProjects.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="project-details-container">
      <div className="project-details-header row justify-content-center">
        <h2 className="project-details-title text-center mb-4">
          Project Details
        </h2>
        <div className="col-lg-10">
          {/* Search Input */}
          <div className="row mb-3">
            <div className="col-md-6">
              <div className="search-input">
                <input
                  type="text"
                  className="search-bar form-control"
                  placeholder="Search Projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Status Filter Buttons - Centered */}
         <div className="row mb-4">
  <div className="col-md-12 text-center">
    <div className="filter-status-group" role="group">
      <button
        className={`filter-status-btn ${statusFilter === "all" ? "filter-status-active" : ""}`}
        onClick={() => setStatusFilter("all")}
      >
        All
      </button>
      <button
        className={`filter-status-btn ${statusFilter === "in progress" ? "filter-status-active" : ""}`}
        onClick={() => setStatusFilter("in progress")}
      >
        In Progress
      </button>
      <button
        className={`filter-status-btn ${statusFilter === "completed" ? "filter-status-active" : ""}`}
        onClick={() => setStatusFilter("completed")}
      >
        Completed
      </button>
      <button
        className={`filter-status-btn ${statusFilter === "on hold" ? "filter-status-active" : ""}`}
        onClick={() => setStatusFilter("on hold")}
      >
        On Hold
      </button>
      <button
        className={`filter-status-btn ${statusFilter === "exceed" ? "filter-status-active" : ""}`}
        onClick={() => setStatusFilter("exceed")}
      >
        Exceed Projects
      </button>
      {/* New Tabs */}
      <button
        className={`filter-status-btn ${statusFilter === "short-term" ? "filter-status-active" : ""}`}
        onClick={() => setStatusFilter("short-term")}
      >
        Short-term
      </button>
      <button
        className={`filter-status-btn ${statusFilter === "long-term" ? "filter-status-active" : ""}`}
        onClick={() => setStatusFilter("long-term")}
      >
        Long-term
      </button>
    </div>
  </div>
</div>


          {/* Your table goes here */}
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
                <th>Partner's</th>
                <th>Status</th>
                {(role === "teamlead" || role === "admin") && (
                  <th>Change Status</th>
                )}
                <th>Comments</th>
                <th>Response</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentProjects.map((project, index) => (
                <tr key={project.id}>
                  <td>{indexOfFirst + index + 1}</td>
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
                     <td>{project.technology_partner}</td>
                  <td>{project.status || "Not Set"}</td>
                  {(role === "teamlead" || role === "admin") && (
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
                  <td>
                    <button
                      className="btn btn-info btn-sm me-2"
                      onClick={() => handleCommentClick(project)}
                    >
                      Add
                    </button>
                  </td>
                  <td>
                    <button
                      className="btn btn-info btn-sm me-2"
                      onClick={() => handleResponseClick(project.id)}
                      disabled={isLoading}
                    >
                      {isLoading ? "Loading..." : "Response"}
                    </button>
                  </td>
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

      {/* <Modal show={showResponseModal} onHide={closeResponseModal}>
  <Modal.Header closeButton>
    <Modal.Title>Responses</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    {responseData.length > 0 ? (
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Response ID</th>
            <th>Response Text</th>
            <th>Responded By</th>
            <th>Response Date</th>
          </tr>
        </thead>
        <tbody>
          {responseData.map((response) => (
            <tr key={response.id}>
              <td>{response.id}</td>
              <td>{response.response_text}</td>
              <td>{response.responded_by}</td>
              <td>{new Date(response.response_date).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    ) : (
      <p>No responses available.</p>
    )}
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={closeResponseModal}>Close</Button>
  </Modal.Footer>
</Modal> */}
      <Modal show={showResponseModal} onHide={closeResponseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Responses</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {responseData.status === "success" && responseData.data.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-bordered table-hover">
                <thead className="table-dark">
                  <tr>
                    <th>Response ID</th>
                    <th>User ID</th>
                    <th>Comment ID</th>
                    <th>Response Text</th>
                    <th>Responded By</th>
                    <th>Response Date</th>
                  </tr>
                </thead>
                <tbody>
                  {responseData.data.map((response) => (
                    <tr key={response.id}>
                      <td>{response.id}</td>
                      <td>{response.user_id}</td>
                      <td>{response.comment_id}</td>
                      <td>{response.response_text || "N/A"}</td>
                      <td>{response.responded_by || "N/A"}</td>
                      <td>
                        {response.response_date
                          ? new Date(response.response_date).toLocaleString()
                          : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="alert alert-info">
              {responseData.status === "error"
                ? responseData.message
                : "No responses available for this project."}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeResponseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

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
                      status === "In Progress" ? statusPercentage : null // Pass statusPercentage only if In Progress
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
                    <div className="col-md-6 mb-3">
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

                    <div className="col-md-6 mb-3">
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
                    {status === "In Progress" && (
                      <div className="col-md-6 mb-3">
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

      {/* Update Project Modal */}

      {showUpdateModal && selectedProject && (
        <div
          className="modal fade show"
          style={{ display: "block" }}
          tabIndex="-1"
        >
          <div className="modal-dialog">
            <div className="modal-content custom-width-141">
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
                    handleUpdate(selectedProject); // Submit update
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

                    {/* ✅ Multi-select Application Type Dropdown */}
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Application/Website</label>
                      <div className="dropdown">
                        <button
                          className="form-control text-start dropdown-toggle"
                          type="button"
                          data-bs-toggle="dropdown"
                          aria-expanded="false"
                        >
                          {selectedProject.application_type &&
                          selectedProject.application_type.length > 0
                            ? Array.isArray(selectedProject.application_type)
                              ? selectedProject.application_type.join(", ")
                              : selectedProject.application_type
                                  .split(",")
                                  .map((s) => s.trim())
                                  .join(", ")
                            : "-- Select Type --"}
                        </button>
                        <ul
                          className="dropdown-menu w-100 p-2"
                          style={{ maxHeight: "200px", overflowY: "auto" }}
                        >
                          {[
                            "Website",
                            "Mobile Application",
                            "Desktop Application",
                            "Web Application",
                            "Other",
                          ].map((type) => {
                            const appTypes = selectedProject.application_type
                              ? Array.isArray(selectedProject.application_type)
                                ? selectedProject.application_type
                                : selectedProject.application_type
                                    .split(",")
                                    .map((s) => s.trim())
                              : [];

                            const checked = appTypes.includes(type);

                            const handleCheckboxChange = () => {
                              let newSelection;
                              if (checked) {
                                newSelection = appTypes.filter(
                                  (item) => item !== type
                                );
                              } else {
                                newSelection = [...appTypes, type];
                              }
                              setSelectedProject({
                                ...selectedProject,
                                application_type: newSelection,
                              });
                            };

                            return (
                              <li className="form-check" key={type}>
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id={`appType-${type}`}
                                  checked={checked}
                                  onChange={handleCheckboxChange}
                                />
                                <label
                                  className="form-check-label"
                                  htmlFor={`appType-${type}`}
                                >
                                  {type}
                                </label>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    </div>

                    {/* ✅ Technology Partner Dropdown */}
                    <div className="col-md-4 mb-3">
                      <label
                        htmlFor="technology_partner"
                        className="form-label"
                      >
                        Technology Partner
                      </label>
                      <select
                        id="technology_partner"
                        name="technology_partner"
                        className="form-control"
                        value={selectedProject.technology_partner || ""}
                        onChange={(e) =>
                          setSelectedProject({
                            ...selectedProject,
                            technology_partner: e.target.value,
                          })
                        }
                        required
                      >
                        <option value="">
                          -- Select Technology Partner --
                        </option>
                        <option value="Short-Term Project">
                          Short-Term Project
                        </option>
                        <option value="Long-Term Collaboration">
                          Long-Term Collaboration
                        </option>
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

      <Modal show={showCommentModal} onHide={() => setShowCommentModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Comment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="form-group">
            <label>Comment:</label>
            <textarea
              className="form-control"
              rows="4"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowCommentModal(false)}
          >
            Close
          </Button>
          <Button variant="primary" onClick={handleAddComment}>
            Save Comment
          </Button>
        </Modal.Footer>
      </Modal>

      {/* View Comments Modal */}
      <Modal
        show={showViewCommentsModal}
        onHide={() => setShowViewCommentsModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Comments for {selectedProjectForComment?.project_name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {comments.length > 0 ? (
            <div className="comment-list">
              {comments.map((comment, index) => (
                <div
                  key={index}
                  className="comment-item mb-3 p-3 border rounded"
                >
                  <div className="d-flex justify-content-between">
                    <strong>{comment.name}</strong>
                    <small className="text-muted">
                      {new Date(comment.created_at).toLocaleString()}
                    </small>
                  </div>
                  <p className="mt-2 mb-0">{comment.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>No comments available for this project.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowViewCommentsModal(false)}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default ProjectDetails;
