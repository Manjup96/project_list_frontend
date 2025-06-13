import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";  // ✅ Bar instead of Line
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,       // ✅ Required for bar chart
  Title,
  Tooltip,
  Legend
} from 'chart.js';

import { baseUrl } from "../APIServices/APIServices";
import "./AdminDashboard.css";

// ✅ Register required chart.js modules
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AdminDashboard = () => {
  const [projectCount, setProjectCount] = useState(0);
  const [exceedCount, setExceedCount] = useState(0);
  const [inprogressCount, setInProgressCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [projects, setProjects] = useState([]);

  const colors = ["bg-warning", "bg-success", "bg-danger", "bg-info", "bg-primary", "bg-secondary"];

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

  // ✅ Chart Data for Bar Chart
  const chartData = {
    labels: projects.map(p => p.project_name),
    datasets: [
      {
        label: 'Project Status (%)',
        data: projects.map(p => p.status_percentage),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const cardData = [
    {
      title: "Projects",
      count: projectCount,
      bgClass: "bg-secondary",
      // link: "leads.php",
    },
    {
      title: "Exceed Project Development",
      count: exceedCount,
      bgClass: "bg-primary",
      // link: "users_say_table.php",
    },
     {
      title: "Projects Completed",
      count: completedCount,
      bgClass: "bg-success",
      // link: "users_say_table.php",
    },
      {
      title: "Projects Inprogress",
      count: inprogressCount,
      bgClass: "bg-secondary",
      // link: "users_say_table.php",
    },
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
            <div key={index} className="AdminDashboard-card col-xl-3 col-lg-3 col-md-6 col-sm-12 mb-4">
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

        {/* Dynamic Project Cards */}
        <div className="AdminDashboard-cards2 row justify-content-center mt-3">
  <h2 className="text-center">Project Status</h2>

  {/* {projects.map((project, index) => {
    const colorClass = colors[index % colors.length];
    return (
      <div key={index} className="col-xl-3 col-lg-3 col-md-6 col-sm-12 mb-4">
        <div className={`card ${colorClass} text-white`} style={{ borderRadius: "0px" }}>
          <div className="card-body">
            <h5 className="card-title">{project.project_name}</h5>
            <p className="card-text">Status: {project.status_percentage} %</p>
          </div>
        </div>
      </div>
    );
  })} */}

  {projects.map((project, index) => {
  const colorClass = colors[index % colors.length];

  // Determine what to display based on status
  const displayText =
    project.status.toLowerCase() === "in progress"
      ? `${project.status_percentage}%`
      : project.status;

  return (
    <div key={index} className="col-xl-3 col-lg-3 col-md-6 col-sm-12 mb-4">
      <div className={`card ${colorClass} text-white`} style={{ borderRadius: "0px" }}>
        <div className="card-body">
          <h5 className="card-title">{project.project_name}</h5>
          <p className="card-text">
            Status: {displayText}
          </p>
        </div>
      </div>
    </div>
  );
})}

</div>


        {/* ✅ Bar Chart Section */}
        <div className="col-12 mt-4 d-flex justify-content-center">
          <div className="card bg-light" style={{ width: "60%" }}>
            <div className="card-body">
              <h5 className="card-title">Project Status Overview</h5>
              <Bar
                data={chartData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { display: true, position: 'top' },
                    title: { display: true, text: 'Project Progress' },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 100,
                      title: { display: true, text: 'Status (%)' },
                    },
                    x: {
                      title: { display: true, text: 'Projects' },
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
