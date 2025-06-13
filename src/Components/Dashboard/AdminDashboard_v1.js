import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
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

  // Get ISO week number function
  function getWeekNumber(dateString) {
    const date = new Date(dateString);
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
    const week1 = new Date(date.getFullYear(), 0, 4);
    return (
      "Week " +
      (1 +
        Math.round(
          ((date.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7
        ))
    );
  }

  // Generate week labels from start to end date
  function generateWeekLabels(start, end) {
    const labels = [];
    let current = new Date(start);
    const endDate = new Date(end);

    while (current <= endDate) {
      const isoDate = current.toISOString().split("T")[0];
      const week = getWeekNumber(isoDate);
      if (!labels.includes(week)) labels.push(week);
      current.setDate(current.getDate() + 7);
    }
    return labels;
  }

  const openModal = (project) => {
    setSelectedProject(project);
    setShowModal(true);

    // Static status history example, you may replace with API call if needed
    const staticStatusHistory = [
      { date: "2023-01-01", status_percentage: 10 },
      { date: "2023-01-10", status_percentage: 30 },
      { date: "2023-01-20", status_percentage: 55 },
      { date: "2023-01-30", status_percentage: 80 },
      { date: "2023-02-05", status_percentage: 100 },
    ];
    setStatusHistory(staticStatusHistory);
  };

  const closeModal = () => {
    setSelectedProject(null);
    setShowModal(false);
    setStatusHistory([]);
  };

  // Prepare week labels between start and client_end date
  const weekLabels =
    selectedProject && selectedProject.start_date && selectedProject.client_end_date
      ? generateWeekLabels(selectedProject.start_date, selectedProject.client_end_date)
      : [];

  // Map status percentage to week, fill 0 for missing weeks
  const statusByWeek = {};
  weekLabels.forEach((week) => {
    statusByWeek[week] = 0;
  });
  statusHistory.forEach(({ date, status_percentage }) => {
    const week = getWeekNumber(date);
    if (week in statusByWeek) {
      statusByWeek[week] = status_percentage;
    } else {
      statusByWeek[week] = status_percentage;
      if (!weekLabels.includes(week)) weekLabels.push(week);
    }
  });

  // Sort weekLabels again if we added new weeks
  weekLabels.sort((a, b) => {
    const numA = parseInt(a.split(" ")[1], 10);
    const numB = parseInt(b.split(" ")[1], 10);
    return numA - numB;
  });

  const lineChartData = {
    labels: weekLabels,
    datasets: [
      {
        label: "Status Percentage",
        data: weekLabels.map((week) => statusByWeek[week] || 0),
        fill: false,
        borderColor: "rgba(75, 192, 192, 1)",
        tension: 0.1,
        pointBackgroundColor: "rgba(75, 192, 192, 1)",
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

  const cardData = [
    { title: "Projects", count: projectCount, bgClass: "bg-secondary" },
    { title: "Exceed Project Development", count: exceedCount, bgClass: "bg-primary" },
    { title: "Projects Completed", count: completedCount, bgClass: "bg-success" },
    { title: "Projects Inprogress", count: inprogressCount, bgClass: "bg-secondary" },
  ];

  return (
    <div className="AdminDashboard-container">
      <div className="container-fluid px-4">
        <h1 className="AdminDashboard-title mt-4">Admin Dashboard</h1>
        <ol className="breadcrumb mb-4">
          <li className="breadcrumb-item active">Admin Dashboard</li>
        </ol>

        <div className="AdminDashboard-cards row justify-content-center">
          {cardData.map((card, index) => (
            <div
              key={index}
              className="AdminDashboard-card col-xl-3 col-lg-3 col-md-6 col-sm-12 mb-4"
            >
              <div className={`card ${card.bgClass} text-white`} style={{ borderRadius: "0px" }}>
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <span>{card.title}</span>
                    <span className="badge badge-secondary badge-lg" style={{ fontSize: "25px" }}>
                      {card.count}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

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
                <div className={`card ${colorClass} text-white`} style={{ borderRadius: "0px" }}>
                  <div className="card-body">
                    <h5 className="card-title">{project.project_name}</h5>
                    <p className="card-text">{displayText}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

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
                  <button type="button" className="btn-close" onClick={closeModal}></button>
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

                    <div className="col-md-12 mt-3">
                      <Line data={lineChartData} options={lineChartOptions} />
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeModal}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
