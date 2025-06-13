import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import "./TeamLeadDashboard.css";
import { baseUrl } from "../APIServices/APIServices";

const TeamLeadDashboard = () => {
  const [projectCount, setProjectCount] = useState(0);
  const [exceedCount, setExceedCount] = useState(0);
  const [projects, setProjects] = useState([]);
  const [user, setUser] = useState(null);  // State to store user data from localStorage

  // Fetch user details from localStorage
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);  // Set the user state if user exists
    } else {
      // Redirect or handle case when user is not found
      console.log('No user found in localStorage');
    }
  }, []); // This effect runs only once when the component is mounted

  // Fetch the project count and project data from the backend when the component mounts
  useEffect(() => {
    if (!user) return; // Don't fetch data until user is loaded

    const fetchCounts = async () => {
      if (!user || !user.id) {
        console.error("User data is missing or incomplete in localStorage");
        return; // Exit if no user data is available
      }

      try {
        const response = await fetch(`${baseUrl}/getProjectCount.php`, {
          method: "POST", // Use POST request
          headers: {
            "Content-Type": "application/json", // Ensure the correct content type is set
          },
          body: JSON.stringify({
            user_id: user.id,  
            name: user.name,   
          }),
        });

        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();

        // Set project and exceed counts
        if (data.project_count) {
          setProjectCount(data.project_count);  // Set the project count in state
        } else {
          console.error("Error fetching project count");
        }

        if (data.exceed_count) {
          setExceedCount(data.exceed_count);  // Set the exceed count in state
        } else {
          console.error("Error fetching exceed project count");
        }
      } catch (error) {
        console.error("Error fetching project count:", error);
      }
    };

    const fetchProjects = async () => {
      if (!user || !user.id) {
        console.error("User data is missing or incomplete in localStorage");
        return; // Exit if no user data is available
      }

      try {
        const response = await fetch(`${baseUrl}/getProjectNames.php`, {
          method: "POST", // Use POST instead of GET
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: user.id,  // Pass user_id from localStorage
            name: user.name,    // Pass name from localStorage
          }),
        });

        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();

        if (data.projects) {
          setProjects(data.projects); // Update state with fetched projects
        } else {
          console.error("Error fetching project names");
        }
      } catch (error) {
        console.error("Error fetching project names:", error);
      }
    };

    fetchCounts();
    fetchProjects();
  }, [user]); // Fetch only when user data is available

  if (!user) {
    return <div>Loading...</div>; // Show a loading message until user data is available
  }

  // Chart data for the bar chart
  const chartData = {
    labels: projects.map(p => p.project_name),
    datasets: [
      {
        label: 'Project Status (%)',
        data: projects.map(p => p.status_percentage),
        backgroundColor: 'rgba(40, 43, 43, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Card data with dynamic project count
  const cardData = [
    {
      title: "Projects",
      count: projectCount,
      bgClass: "bg-warning",
    },
    {
      title: "Exceed Project Development",
      count: exceedCount,
      bgClass: "bg-success",
    },
  ];

  return (
    <div className="TeamLeadDashboard-container">
      <div className="container-fluid px-4">
        <h1 className="TeamLeadDashboard-title mt-4">Teamlead Dashboard</h1>
        <p className="welcome-message">
          {/* Welcome, {user.name} (ID: {user.id}, Email: {user.email})! */}
          Welcome, {user.name}!
        </p>

        <ol className="breadcrumb mb-4"></ol>
        
        <div className="TeamLeadDashboard-cards row justify-content-center">
          {cardData.map((card, index) => (
            <div key={index} className="TeamLeadDashboard-card col-xl-3 col-md-6 mb-4">
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

export default TeamLeadDashboard;
