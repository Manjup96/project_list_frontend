import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LabelList,
  ResponsiveContainer,
} from "recharts";

import { baseUrl } from "../APIServices/APIServices";

const ProjectProgressChart = () => {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        // First fetch all projects
        const response = await fetch(`${baseUrl}/getProjectNamesAdmin.php`);
        if (!response.ok) throw new Error("Network response was not ok");
        const result = await response.json();
        console.log("Fetched project data:", result);

        if (result.projects) {
          // Process each project to get status history
          const projectsWithHistory = await Promise.all(
            result.projects.map(async (project) => {
              try {
                // Fetch status history for each project
                const historyResponse = await fetch(
                  `${baseUrl}/getProjectStatusHistory.php?projectId=${project.project_id}`
                );
                if (!historyResponse.ok) throw new Error("Failed to fetch status history");
                const history = await historyResponse.json();
                
                // Find the latest status update
                const latestStatus = history.find(item => item.is_latest === 1) || 
                                   history[history.length - 1] || 
                                   { created_at: project.start_date };
                
                return {
                  ...project,
                  statusHistory: history,
                  latestUpdate: latestStatus.created_at
                };
              } catch (error) {
                console.error(`Error fetching history for project ${project.project_id}:`, error);
                return {
                  ...project,
                  statusHistory: [],
                  latestUpdate: project.start_date
                };
              }
            })
          );

          // Process the projects data with timeline calculations
          const processedProjects = projectsWithHistory.map(project => {
            const plannedWeeks = calculateWeeks(project.start_date, project.client_end_date);
            
            // Calculate actual weeks based on latest update date
            const actualWeeks = calculateWeeks(
              project.start_date, 
              project.latestUpdate || new Date().toISOString()
            );
            
            // Ensure we don't exceed planned weeks
            const cappedActualWeeks = Math.min(actualWeeks, plannedWeeks);
            
            // Calculate percentage based on actual weeks if no percentage is provided
            const percentage = parseFloat(project.status_percentage) || 
                              (plannedWeeks > 0 ? (cappedActualWeeks / plannedWeeks) * 100 : 0);
            
            // Calculate timeline status
            const timelineStatus = calculateTimelineStatus(
              project.start_date, 
              project.client_end_date,
              percentage,
              project.latestUpdate
            );

            // Calculate planned percentage per week
            const plannedPercentagePerWeek = plannedWeeks > 0 ? (100 / plannedWeeks) : 0;

            return {
              ...project,
              plannedWeeks,
              actualWeeks: cappedActualWeeks,
              remainingWeeks: plannedWeeks - cappedActualWeeks,
              timelineStatus,
              status_percentage: percentage,
              plannedPercentagePerWeek: plannedPercentagePerWeek.toFixed(2)
            };
          });

          setProjects(processedProjects);
        }
      } catch (error) {
        console.error("Error fetching project data:", error);
      }
    };

    fetchProjects();
  }, []);

  //   const calculateWeeks = (start, end) => {
  //   if (!start || !end) return 0;
  //   const startDate = new Date(start);
  //   const endDate = new Date(end);
  //   const diffInMs = endDate - startDate;
  //   return Math.ceil(diffInMs / (1000 * 60 * 60 * 24 * 7)); // convert ms to weeks
  // };

   const calculateWeeks = (start, end) => {
    if (!start || !end) return 0;
    try {
      const startDate = new Date(start);
      const endDate = new Date(end);
      if (isNaN(startDate.getTime())) return 0;
      if (isNaN(endDate.getTime())) return 0;
      if (endDate < startDate) return 0;
      
      const diffInMs = Math.max(0, endDate - startDate);
      return Math.ceil(diffInMs / (1000 * 60 * 60 * 24 * 7));
    } catch (error) {
      console.error("Date calculation error:", error);
      return 0;
    }
  };


  const calculateTimelineStatus = (startDate, endDate, actualPercentage, latestUpdate) => {
    if (!startDate || !endDate) return "No dates provided";
    
    const today = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    const lastUpdate = latestUpdate ? new Date(latestUpdate) : today;
    
    if (lastUpdate < start) return "Not started";
    if (lastUpdate >= end) return actualPercentage >= 100 ? "Completed" : "Overdue";
    
    const totalDuration = end - start;
    const elapsedDuration = lastUpdate - start;
    const plannedPercentage = (elapsedDuration / totalDuration) * 100;
    
    if (actualPercentage >= plannedPercentage) return "On track";
    return "Behind schedule";
  };

  const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const project = projects.find(p => p.project_name === label);
    
    if (!project) return null;

    const expectedProgress = (project.actualWeeks * project.plannedPercentagePerWeek).toFixed(2);
    const actualProgress = parseFloat(project.status_percentage);
    const difference = (expectedProgress - actualProgress).toFixed(2);

    return (
      <div className="custom-tooltip" style={{ 
        backgroundColor: '#fff', 
        padding: '10px', 
        border: '1px solid #ccc',
        borderRadius: '5px',
        boxShadow: '0 0 10px rgba(0,0,0,0.1)',
        position: 'absolute',
        left: '100%',
        marginLeft: '10px',
        zIndex: 100,
        minWidth: '280px'
      }}>
        <p className="label" style={{ fontWeight: 'bold', marginBottom: '5px' }}>{label}</p>
        <p style={{ margin: '3px 0' }}>Status: <span style={{ fontWeight: 'bold', color: getStatusColor(project.timelineStatus) }}>{project.timelineStatus}</span></p>
        <p style={{ margin: '3px 0' }}>Expected Progress: <span style={{ fontWeight: 'bold' }}>{expectedProgress}%</span></p>
        <p style={{ margin: '3px 0' }}>Actual Progress: <span style={{ fontWeight: 'bold' }}>{actualProgress}%</span></p>
        <p style={{ margin: '3px 0' }}>Difference: <span style={{ fontWeight: 'bold', color: difference >= 0 ? 'green' : 'red' }}>{difference}%</span></p>
        <p style={{ margin: '3px 0' }}>Planned Duration: <span style={{ fontWeight: 'bold' }}>{project.plannedWeeks} weeks</span></p>
        <p style={{ margin: '3px 0' }}>Planned Progress/Week: <span style={{ fontWeight: 'bold' }}>{project.plannedPercentagePerWeek}%</span></p>
      </div>
    );
  }

  return null;
};


  const getStatusColor = (status) => {
    switch(status) {
      case 'On track': return '#4CAF50';
      case 'Behind schedule': return '#F44336';
      case 'Completed': return '#2196F3';
      case 'Overdue': return '#FF9800';
      case 'Not started': return '#9E9E9E';
      default: return '#000';
    }
  };

  return (
     <div className="col-12 mt-4 d-flex justify-content-center">
    <div className="card bg-light" style={{ width: "100%", position: 'relative' }}>
      <div className="card-body">
        <h5 className="card-title">Project Timeline Overview (Weeks)</h5>
        <div style={{ width: "100%", height: Math.max(400, projects.length * 30) }}>
          <ResponsiveContainer>
            <BarChart
              layout="vertical"
              data={projects.map(project => ({
                project: project.project_name,
                actual: project.actualWeeks,
                planned: project.remainingWeeks,
                timelineStatus: project.timelineStatus
              }))}
              margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
            >
              <XAxis 
                type="number" 
                label={{ value: "Weeks( W )", position: "insideBottom", offset: -5 }}
                domain={[0, 'dataMax + 5']} // Prevent negative values
              />
              <YAxis 
                type="category" 
                dataKey="project" 
                width={150} 
                tick={{ fontSize: 12 }}
                interval={0} // Show all labels
              />
              <CartesianGrid strokeDasharray="3 3" />
                <Tooltip 
                  content={<CustomTooltip />} 
                  wrapperStyle={{ 
                    zIndex: 1000,
                    pointerEvents: 'none'
                  }}
                  cursor={{ fill: 'transparent' }}
                />
                <Legend />
                <Bar 
  dataKey="actual" 
  stackId="a" 
  fill="#4bc0c0" 
  name="Actual Progress (weeks)"
>
  <LabelList 
    dataKey="actual" 
    position={({ actual, remaining }) => 
      Math.abs(actual - remaining) < 2 ? "outside" : "insideRight"
    } 
    fill="#333"
    formatter={(value, entry) => {
      // Don't show label if value is 0
      if (value === 0 || value === "0") return null;
      return `${value} W`;
    }}
  />
</Bar>
                <Bar 
                  dataKey="planned" 
                  stackId="a" 
                  fill="#ff6384" 
                  name="Remaining (weeks)"
                >
                  <LabelList 
                    dataKey="planned" 
                    position="insideRight" 
                    fill="#fff" 
                    formatter={(value) => `${value} W`}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectProgressChart;