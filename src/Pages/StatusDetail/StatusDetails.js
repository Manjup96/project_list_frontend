import React, { useEffect, useState } from "react";
import axios from "axios";
import { baseUrl } from "../../Components/APIServices/APIServices"; // Ensure the baseUrl is correctly set

const StatusDetails = () => {
  const [projectStatusData, setProjectStatusData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch data from the backend when the component mounts
    const fetchData = async () => {
      try {
        // Fetch project and status data by joining project_table and status_table
        const response = await axios.get(`${baseUrl}/get_project_status.php`);
        if (response.data.status === "success") {
          setProjectStatusData(response.data.data);
        } else {
          alert("Failed to fetch data.");
        }

        setLoading(false); // Stop loading once data is fetched
      } catch (error) {
        console.error("Error fetching data:", error);
        alert("Error fetching data.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Show loading indicator while data is being fetched
  }

  return (
    <div>
      <h2>Status Details</h2>
      <table className="table table-bordered table-striped text-center">
        <thead className="table-dark">
          <tr>
            <th>Project Name</th>
            <th>Status Description</th>
            <th>Status Percentage</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {projectStatusData.length > 0 ? (
            projectStatusData.map((project, index) => (
              <tr key={index}>
                <td>{project.project_name}</td>
                <td>{project.status_description || "No status"}</td>
                <td>{project.status_percentage || "N/A"}</td>
                <td>{project.status || "No status"}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center">
                No projects found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default StatusDetails;
