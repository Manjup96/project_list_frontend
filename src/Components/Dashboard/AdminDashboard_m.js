import React, { useEffect, useState } from "react";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import { baseUrl } from "../APIServices/APIServices";
import "./AdminDashboard.css";
import axios from "axios";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const AdminDashboard = () => {
  const [projectCount, setProjectCount] = useState(0);
  const [exceedCount, setExceedCount] = useState(0);
  const [inprogressCount, setInProgressCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [projects, setProjects] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [statusHistory, setStatusHistory] = useState([]);

  const [showResponseModal, setShowResponseModal] = useState(false);
  const [selectedComment, setSelectedComment] = useState(null);

  const [responseText, setResponseText] = useState("");

  const colors = [
    "bg-warning",
    "bg-success",
    "bg-danger",
    "bg-info",
    "bg-primary",
    "bg-secondary",
  ];

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const response = await fetch(`${baseUrl}/getProjectCountAdmin.php`);
        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();
        if (data.project_count) setProjectCount(data.project_count);
        if (data.exceed_count) setExceedCount(data.exceed_count);
        if (data.inprogress_count) setInProgressCount(data.inprogress_count);
        if (data.completed_count) setCompletedCount(data.completed_count);
      } catch (error) {
        console.error("Error fetching project count:", error);
      }
    };

    const fetchProjects = async () => {
      try {
        const response = await fetch(`${baseUrl}/getProjectNamesAdmin.php`);
        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();
        if (data.projects) setProjects(data.projects);
      } catch (error) {
        console.error("Error fetching project names:", error);
      }
    };

    fetchCounts();
    fetchProjects();
  }, []);

  function formatDateToIndian(dateString) {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    return `${day}-${month}-${year}`;
  }

  function getWeekFromStart(date, startDate) {
    const diffInMs = date.getTime() - startDate.getTime();
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
    return Math.floor(diffInDays / 7);
  }

  // function generateWeekLabels(start, end) {
  //   const labels = [];
  //   const startDate = new Date(start);
  //   startDate.setHours(0, 0, 0, 0);
  //   const endDate = new Date(end);
  //   endDate.setHours(0, 0, 0, 0);

  //   let current = new Date(startDate);
  //   let weekCount = 0; // Start from Week 0

  //   while (current <= endDate) {
  //     labels.push(`Week ${weekCount}`);
  //     current.setDate(current.getDate() + 7);
  //     weekCount++;
  //   }
  //   return labels;
  // }

  function generateWeekLabels(start, end) {
  const labels = [];
  const startDate = new Date(start);
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(end);
  endDate.setHours(0, 0, 0, 0);

  let current = new Date(startDate);
  let weekCount = 1; // Start from Week 1

  while (current <= endDate) {
    labels.push(`Week ${weekCount}`);
    current.setDate(current.getDate() + 7);
    weekCount++;
  }

  return labels;
}


  const [user, setUser] = useState(null);

  // Fetch all projects from the backend when the component is mounted
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);
  }, []);

  const openModal = async (project) => {
    setSelectedProject(project);
    setShowModal(true);

    try {
      const response = await fetch(
        `${baseUrl}/getProjectStatusHistory.php?projectId=${project.project_id}`
      );
      if (!response.ok) throw new Error("Failed to fetch status history");
      const data = await response.json();
      setStatusHistory(data);
    } catch (error) {
      console.error("Error fetching project status history:", error);
      setStatusHistory([]);
    }

    // Fetching comments
    fetchComments(project.project_id);
  };

  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [hasUnseenComments, setHasUnseenComments] = useState(false);
  const [comment, setComment] = useState("");
  const [showCommentModal, setShowCommentModal] = useState(false);

  // const handleSubmitResponse = () => {
  //   if (!responseText) {
  //     alert("Please enter a response.");
  //     return;
  //   }

  //   // Ensure selectedComment is not null or undefined
  //   if (!selectedComment || !selectedComment.id) {
  //     console.error("Comment ID is missing.");
  //     return;
  //   }

  //   // Prepare the response data to be sent to the backend
  //   const responseData = {
  //     comment_id: selectedComment.id, // Ensure it's correctly passed from selectedComment
  //     response_text: responseText, // Get the response text from the state
  //     responded_by: "admin", // Replace this with the logged-in user (e.g., dynamic username)
  //   };

  //   console.log("Sending response data: ", responseData); // Log the data for debugging

  //   // Send the response data to the PHP backend via a POST request
  //   fetch(`${baseUrl}/add_response.php`, {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify(responseData),
  //   })
  //     .then((response) => response.json())
  //     .then((data) => {
  //       if (data.status === "success") {
  //         console.log("Response saved successfully:", data.message);

  //         // Show success alert
  //         alert("Response submitted successfully!");

  //         // Close the modal after successful submission
  //         setShowResponseModal(false); // Close the modal
  //         setSelectedComment(null); // Reset selected comment
  //       } else {
  //         console.error("Error saving response:", data.message);

  //         // Show error alert
  //         alert("Error submitting response: " + data.message);
  //       }
  //     })
  //     .catch((error) => {
  //       console.error("Error:", error);

  //       // Show error alert in case of a network or unexpected error
  //       alert("Error: Unable to submit response.");
  //     });
  // };


  const handleSubmitResponse = () => {
      if (!responseText) {
          alert("Please enter a response.");
          return;
      }
  
      if (!selectedComment || !selectedComment.id) {
          console.error("Comment ID is missing.");
          return;
      }
  
      if (!selectedProject || !selectedProject.project_id) {
          console.error("Project ID is missing.");
          return;
      }
  
      if (!user || !user.id) {
          console.error("User ID is missing.");
          return;
      }
  
      // Prepare the response data
      const responseData = {
          comment_id: selectedComment.id,
          response_text: responseText,
          responded_by: "admin",  // You can dynamically fetch the admin or logged-in user's name
          project_id: selectedProject.project_id,
          user_id: user.id,
      };
  
      console.log("Sending response data: ", responseData);
  
      fetch(`${baseUrl}/add_response.php`, {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
          },
          body: JSON.stringify(responseData),
      })
      .then((response) => response.json())
      .then((data) => {
          if (data.status === "success") {
              alert("Response submitted successfully!");
              setShowResponseModal(false);  // Close the modal
              setSelectedComment(null);  // Reset selected comment
          } else {
              console.error("Error saving response:", data.message);
              alert("Error submitting response: " + data.message);
          }
      })
      .catch((error) => {
          console.error("Error:", error);
          alert("Error: Unable to submit response.");
      });
  };
  


  const fetchComments = async (projectId) => {
    try {
      const response = await axios.post(`${baseUrl}/get_comments.php`, {
        project_id: projectId,
      });

      if (response.data.status === "success") {
        const allComments = response.data.data;

        // Check for unseen comments
        const unseen = allComments.some((comment) => !comment.seen_by_admin);

        setComments(allComments);
        setHasUnseenComments(unseen);
      } else {
        alert("Failed to fetch comments.");
      }
    } catch (error) {
      console.error("Fetch comments error:", error);
      alert("Error fetching comments.");
    }
  };

  useEffect(() => {
    const markCommentsAsSeen = async () => {
      if (showComments && hasUnseenComments && selectedProject) {
        try {
          await axios.post(`${baseUrl}/mark_comments_seen.php`, {
            project_id: selectedProject.project_id,
          });
          setHasUnseenComments(false);
        } catch (error) {
          console.error("Failed to mark comments as seen:", error);
        }
      }
    };

    markCommentsAsSeen();
  }, [showComments, hasUnseenComments, selectedProject]);

  //     const handleShowResponseModal = (comment) => {
  //     setSelectedComment(comment);
  //     setShowResponseModal(true);
  //   };

  const handleCloseResponseModal = () => {
    setShowResponseModal(false); // Close the modal
    setSelectedComment(null); // Reset selected comment
  };

  const handleAddComment = async () => {
    if (!comment.trim()) {
      alert("Please enter a comment");
      return;
    }

    try {
      const response = await axios.post(`${baseUrl}/add_comment.php`, {
        project_id: selectedProject.project_id, // Use this directly
        comment: comment,
        user_id: user?.id,
        name: user?.name,
      });

      if (response.data.status === "success") {
        alert("Comment added successfully");
        setComment("");
        setShowCommentModal(false);
        fetchComments(selectedProject.project_id); // Refresh using correct ID
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error("Add comment error:", error);
      alert("Error adding comment");
    }
  };

  const closeModal = () => {
    setSelectedProject(null);
    setShowModal(false);
    setStatusHistory([]);
    setComments([]); // Clear comments when closing the modal
  };

  const weekLabels =
    selectedProject &&
    selectedProject.start_date &&
    selectedProject.client_end_date
      ? generateWeekLabels(
          selectedProject.start_date,
          selectedProject.client_end_date
        )
      : [];

  const statusByWeek = {};
  weekLabels.forEach((week) => {
    statusByWeek[week] = 0;
  });

  if (selectedProject && statusHistory.length > 0) {
    const startDate = new Date(selectedProject.start_date);
    const weekStatusMap = {};

    statusHistory.forEach(({ updated_at, status_percentage }) => {
      const date = new Date(updated_at);
      if (date < startDate) return;

      const weekNum = getWeekFromStart(date, startDate);
      const weekLabel = `Week ${weekNum}`;

      if (weekLabel in statusByWeek) {
        if (
          !weekStatusMap[weekLabel] ||
          new Date(updated_at) > new Date(weekStatusMap[weekLabel].updated_at)
        ) {
          weekStatusMap[weekLabel] = { status_percentage, updated_at };
        }
      }
    });

    Object.keys(weekStatusMap).forEach((week) => {
      statusByWeek[week] = weekStatusMap[week].status_percentage;
    });
  }

  weekLabels.sort((a, b) => {
    const numA = parseInt(a.split(" ")[1], 10);
    const numB = parseInt(b.split(" ")[1], 10);
    return numA - numB;
  });


 

  // Add the "Planned Timeline" line (0% to 100% over the course of the project)
  const totalWeeks = weekLabels.length;
  const plannedTimeline = new Array(totalWeeks).fill(0).map((_, index) => {
    return (index / (totalWeeks - 1)) * 100; // Distribute 0% to 100% equally across weeks
  });

  // const statusTimeline = new Array(totalWeeks).fill(0).map((_, index) => {
  //   return statusByWeek[`Week ${index}`] || 0; 
  // });

let lastStatus = 0;
const statusTimeline = new Array(totalWeeks).fill(0).map((_, index) => {
  const weekKey = `Week ${index + 1}`;
  if (statusByWeek[weekKey] !== undefined) {
    lastStatus = statusByWeek[weekKey];
  }
  return lastStatus;
});


// const statusTimeline = new Array(totalWeeks).fill(0).map((_, index) => {
//   return statusByWeek[`Week ${index + 1}`] || null; // Use null if no data for the week
// });




const lineChartData = {
  labels: weekLabels,
  datasets: [
    {
      label: "Status Percentage",
      data: statusTimeline, // Status Percentage data with null for missing weeks
      fill: false,
      borderColor: "rgba(75, 192, 192, 1)",
      tension: 0.1,
      pointBackgroundColor: "rgba(75, 192, 192, 1)",
    },
    {
      label: "Planned Timeline",
      data: plannedTimeline, // Planned Timeline data
      fill: false,
      borderColor: "rgba(255, 99, 132, 1)", // Red color for the planned timeline
      tension: 0.1,
      pointBackgroundColor: "rgba(255, 99, 132, 1)", // Red points
    },
  ],
};



  const lineChartOptions = {
    responsive: true,
    scales: {
      y: {
        min: 0,
        max: 100,
        title: { display: true, text: "Status (%)" },
      },
      x: {
        title: { display: true, text: "Week" },
      },
    },
    plugins: {
      legend: { display: true, position: "top" },
      title: { display: true, text: "Status Progress Over Weeks" },
    },
  };




  // Calculate differences between status and planned timeline for each week
  const statusDifference = weekLabels.map((week, index) => {
    const statusPercent = statusTimeline[index];
    const plannedPercent = plannedTimeline[index];
    const difference = statusPercent - plannedPercent;
    return {
      week,
      statusPercent,
      plannedPercent,
      difference,
    };
  });

  const barChartData = {
    labels: projects.map((p) => p.project_name),
    datasets: [
      {
        label: "Project Status (%)",
        data: projects.map((p) => p.status_percentage),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: true, position: "top" },
      title: { display: true, text: "Project Progress" },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: { display: true, text: "Status (%)" },
      },
      x: {
        title: { display: true, text: "Projects" },
      },
    },
  };

  const cardData = [
    { title: "Projects", count: projectCount, bgClass: "bg-secondary" },
    {
      title: "Exceed Project Development",
      count: exceedCount,
      bgClass: "bg-primary",
    },
    {
      title: "Projects Completed",
      count: completedCount,
      bgClass: "bg-success",
    },
    {
      title: "Projects Inprogress",
      count: inprogressCount,
      bgClass: "bg-secondary",
    },
  ];

  return (
    <div className="AdminDashboard-container">
      <div className="container-fluid px-4">
        <h1 className="AdminDashboard-title mt-4">Admin Dashboard</h1>
        <ol className="breadcrumb mb-4">
          <li className="breadcrumb-item active">Admin Dashboard</li>
        </ol>

        {/* Card Section */}
        <div className="AdminDashboard-cards row justify-content-center">
          {cardData.map((card, index) => (
            <div
              key={index}
              className="AdminDashboard-card col-xl-3 col-lg-3 col-md-6 col-sm-12 mb-4"
            >
              <div
                className={`card ${card.bgClass} text-white`}
                style={{ borderRadius: "0px" }}
              >
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <span>{card.title}</span>
                    <span
                      className="badge badge-secondary badge-lg"
                      style={{ fontSize: "25px" }}
                    >
                      {card.count}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dynamic Project Cards */}
        <div className="AdminDashboard-cards2 row justify-content-center mt-3">
          <h2 className="text-center">Project Status</h2>
          {projects.map((project, index) => {
            const colorClass = colors[index % colors.length];
            const displayText =
              project.status.toLowerCase() === "in progress"
                ? `${project.status_percentage}%`
                : project.status;

            return (
              <div
                key={index}
                className="col-xl-3 col-lg-3 col-md-6 col-sm-12 mb-4"
                style={{ cursor: "pointer" }}
                onClick={() => openModal(project)}
              >
                <div
                  className={`card ${colorClass} text-white`}
                  style={{ borderRadius: "0px" }}
                >
                  <div className="card-body">
                    <h5 className="card-title">{project.project_name}</h5>
                    <h5 className="card-title">{project.project_id}</h5>
                    <p className="card-text">{displayText}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bar Chart Section */}
        <div className="col-12 mt-4 d-flex justify-content-center">
          <div className="card bg-light" style={{ width: "60%" }}>
            <div className="card-body">
              <h5 className="card-title">Project Status Overview</h5>
              <Bar data={barChartData} options={barChartOptions} />
            </div>
          </div>
        </div>

        {/* Line Chart Modal */}
        {showModal && selectedProject && (
          <div
            className="modal show d-block"
            tabIndex="-1"
            role="dialog"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          >
            <div className="modal-dialog modal-lg" role="document">
              <div className="modal-content" style={{ borderRadius: "0px" }}>
                <div className="modal-header">
                  <h5 className="modal-title">
                    {selectedProject.project_name} - Status vs Week Graph
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={closeModal}
                  ></button>
                </div>

                <div className="modal-body">
                  <div className="row align-items-start">
                    <div className="col-md-2">
                      <p>
                        <strong>Project Name:</strong>
                        <br />
                        {selectedProject.project_name}
                      </p>
                    </div>
                    <div className="col-md-2">
                      <p>
                        <strong>Status:</strong>
                        <br />
                        {selectedProject.status}
                      </p>
                    </div>
                    <div className="col-md-2">
                      <p>
                        <strong>Status %:</strong>
                        <br />
                        {selectedProject.status_percentage}%
                      </p>
                    </div>
                    <div className="col-md-2">
                      <p>
                        <strong>Start Date:</strong>
                        <br />
                        {formatDateToIndian(selectedProject.start_date)}
                      </p>
                    </div>
                    <div className="col-md-2">
                      <p>
                        <strong>End Date:</strong>
                        <br />
                        {formatDateToIndian(selectedProject.client_end_date)}
                      </p>
                    </div>
                    <div className="col-md-2">
                      <p
                        onClick={() => setShowComments(!showComments)}
                        style={{
                          position: "relative",
                          display: "inline-block",
                          cursor: "pointer",
                        }}
                      >
                        <strong style={{ color: "black" }}>Comments</strong>
                        <br />
                        <span style={{ color: "#0d6efd" }}>
                          {showComments ? "Hide" : "Show"}
                        </span>
                        {hasUnseenComments && !showComments && (
                          <span
                            className="badge bg-danger ms-2"
                            style={{
                              position: "absolute",
                              top: "-6px",
                              right: "-11px",
                              backgroundColor: "red",
                              color: "white",
                              borderRadius: "50%",
                              padding: "2px 6px",
                              fontSize: "12px",
                              fontWeight: "bold",
                            }}
                          >
                            {comments.filter((c) => !c.seen_by_admin).length}
                          </span>
                        )}
                      </p>
                    </div>

                    <div>
                      {showComments && (
                        <div className="mt-2">
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="mb-0">Project Comments</h5>
                          </div>

                          {comments.length === 0 ? (
                            <p>No comments available.</p>
                          ) : (
                            <table className="table table-bordered">
                              <thead>
                                <tr>
                                  <th>S No</th>
                                  {/* <th>Comment ID</th>{" "} */}
                                  {/* Added the ID column */}
                                  <th>Comment</th>
                                  <th>Commented By</th>
                                  <th>Date</th>
                                  <th>Response</th>
                                </tr>
                              </thead>
                              <tbody>
                                {comments.map((comment, index) => (
                                  <tr key={index}>
                                    <td>{index + 1}</td>
                                    {/* <td>{comment.id}</td>{" "} */}
                                    {/* Display the comment id here */}
                                    <td>{comment.comment}</td>
                                    <td>{comment.name || "N/A"}</td>
                                    <td>
                                      {comment.created_at
                                        ? new Date(
                                            comment.created_at
                                          ).toLocaleString("en-IN", {
                                            day: "2-digit",
                                            month: "2-digit",
                                            year: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            hour12: true,
                                            timeZone: "Asia/Kolkata",
                                          })
                                        : "N/A"}
                                    </td>
                                    <td>
                                      <Button
                                        variant="info"
                                        onClick={() => {
                                          setShowResponseModal(true);
                                          setSelectedComment(comment); // Store the selected comment in state
                                        }}
                                      >
                                        Respond
                                      </Button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}

                          {/* Response Modal */}
                        <Modal show={showResponseModal} onHide={handleCloseResponseModal}>
  <Modal.Header closeButton>
    <Modal.Title>Respond to Comment</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <div>
      <h6>
        Comment:{" "}
        {selectedComment ? selectedComment.comment : "N/A"}
      </h6>

      {/* Display project_id */}
      <div className="mb-3">
        <label htmlFor="projectId" className="form-label">
          Project ID
        </label>
        <input
          type="text"
          className="form-control"
          id="projectId"
          placeholder="Project ID"
          value={selectedProject ? selectedProject.project_id : ""}
          readOnly
        />
      </div>

      {/* Display comment_id */}
      <div className="mb-3">
        <label htmlFor="commentId" className="form-label">
          Comment ID
        </label>
        <input
          type="text"
          className="form-control"
          id="commentId"
          placeholder="Comment ID"
          value={selectedComment ? selectedComment.id : ""}
          readOnly
        />
      </div>

      {/* Display user_id */}
      <div className="mb-3">
        <label htmlFor="userId" className="form-label">
          User ID
        </label>
        <input
          type="text"
          className="form-control"
          id="userId"
          placeholder="User ID"
          value={user ? user.id : ""}
          readOnly
        />
      </div>

      {/* Textarea for Response */}
      <div className="mb-3">
        <textarea
          className="form-control"
          placeholder="Write your response..."
          rows="4"
          value={responseText}
          onChange={(e) => setResponseText(e.target.value)}
        />
      </div>
    </div>
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={handleCloseResponseModal}>
      Close
    </Button>
    <Button variant="primary" onClick={handleSubmitResponse}>
      Submit Response
    </Button>
  </Modal.Footer>
</Modal>
                        </div>
                      )}
                    </div>

                    <div className="col-md-12 mt-3">
                      <Line data={lineChartData} options={lineChartOptions} />
                    </div>
                  </div>

                  <div className="mt-4">
                    <h5>Difference Between Status and Planned Timeline</h5>
                    <table className="table table-bordered">
                      <thead>
                        <tr>
                          <th>Week</th>
                          <th>Status (%)</th>
                          <th>Planned (%)</th>
                          <th>Difference (%)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {statusDifference.map((item, index) => (
                          <tr key={index}>
                            <td>{item.week}</td>
                            <td>{item.statusPercent}%</td>
                            <td>{item.plannedPercent}%</td>
                            <td>{item.difference}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={closeModal}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <Modal
          show={showCommentModal}
          onHide={() => setShowCommentModal(false)}
        >
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
      </div>
    </div>
  );
};

export default AdminDashboard;
