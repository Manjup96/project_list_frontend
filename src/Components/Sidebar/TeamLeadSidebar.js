import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaHome,
  FaUtensils,
  FaNewspaper,
  FaExclamationCircle,
  FaMoneyBill,
  FaUser,
  FaSignOutAlt,
} from "react-icons/fa";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import logo from "../../Asset/images/company logo.png"; // Ensure the file exists
import "./TeamLeadSidebar.css";

const TeamLeadSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState(null); // Store user data from localStorage
  const location = useLocation();

  // Fetch user data from localStorage when component mounts
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    setUser(storedUser);  // Set the user state
  }, []);

  const toggleTeamLeadSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div className={`TeamLeadSidebar ${collapsed ? "collapsed" : ""}`}>
      {!collapsed && (
        <div className="Title">
          <img
            src={logo}
            alt="Logo"
            style={{ width: "100px", height: "50px" }}
          />
          {/* Displaying logged-in user */}
          <h4>Hi, {user?.name || "Team Lead"}!</h4>  {/* Show user email or fallback to "Team Lead" */}
        </div>
      )}

      <div className="position-sticky">
        <ul className="nav flex-column">
          <li className="nav-item">
            <div
              className={`TeamLeadSidebar-toggle ${collapsed ? "collapsed" : ""}`}
              onClick={toggleTeamLeadSidebar}
            >
              <FontAwesomeIcon icon={faBars} className="toggle-icon" />
            </div>
          </li>

          <li
            className={`nav-item ${
              location.pathname === "/teamlead-dashboard" ? "active" : ""
            }`}
          >
            <Link className="nav-link" to="/teamlead-dashboard">
              <FaHome className="nav-icon" />
              {!collapsed && <span className="link_text">Dashboard</span>}
            </Link>
          </li>
          <li
            className={`nav-item ${
              location.pathname === "/add-project" ? "active" : ""
            }`}
          >
            <Link className="nav-link" to="/add-project">
              <FaUtensils className="nav-icon" />
              {!collapsed && <span className="link_text">Add Project</span>}
            </Link>
          </li>
          <li
            className={`nav-item ${
              location.pathname === "/project-details" ? "active" : ""
            }`}
          >
            <Link className="nav-link" to="/project-details">
              <FaNewspaper className="nav-icon" />
              {!collapsed && <span className="link_text">Project Details</span>}
            </Link>
          </li>

          <li
            className={`nav-item ${
              location.pathname === "/" ? "active" : ""
            }`}
          >
            <Link className="nav-link" to="/">
              <FaSignOutAlt className="nav-icon" />
              {!collapsed && <span className="link_text">Logout</span>}
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default TeamLeadSidebar;
