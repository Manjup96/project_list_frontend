import React, { useState } from "react";
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
import "./AdminSidebar.css";
//  import Header from "../Header/Header";

const AdminSidebar = ({ user }) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const toggleAdminSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <>
       {/* <Header />  */}
      <div className={`AdminSidebar ${collapsed ? "collapsed" : ""}`}>
        {!collapsed && (
          <div className="Title">
            <img
              src={logo}
              alt="Logo"
              style={{ width: "100px", height: "50px" }}
            />
            {/* <h4>Hi, {user?.username}</h4> */}
            <h4>Hi, Admin</h4>
          </div>
        )}

        <div className="position-sticky">
          <ul className="nav flex-column">
            <li className="nav-item">
              <div
                className={`AdminSidebar-toggle ${collapsed ? "collapsed" : ""}`}
                onClick={toggleAdminSidebar}
              >
                <FontAwesomeIcon icon={faBars} className="toggle-icon" />
              </div>
            </li>

            <li
              className={`nav-item ${
                location.pathname === "/admin-dashboard" ? "active" : ""
              }`}
            >
              <Link className="nav-link" to="/admin-dashboard">
                <FaHome className="nav-icon" />
                {!collapsed && <span className="link_text">Dashboard</span>}
              </Link>
            </li>

         <li
              className={`nav-item ${
                location.pathname === "/leads" ? "active" : ""
              }`}
            >
              <Link className="nav-link" to="/leads">
                <FaUtensils className="nav-icon" />
                {!collapsed && <span className="link_text">Leads</span>}
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

            {/* <li
              className={`nav-item ${
                location.pathname === "/complaints" ? "active" : ""
              }`}
            >
              <Link className="nav-link" to="/complaints">
                <FaExclamationCircle className="nav-icon" />
                {!collapsed && <span className="link_text">Complaints</span>}
              </Link>
            </li>
            <li
              className={`nav-item ${
                location.pathname === "/payments" ? "active" : ""
              }`}
            >
              <Link className="nav-link" to="/payments">
                <FaMoneyBill className="nav-icon" />
                {!collapsed && <span className="link_text">Payments</span>}
              </Link>
            </li>
            <li
              className={`nav-item ${
                location.pathname === "/profile" ? "active" : ""
              }`}
            >
              <Link className="nav-link" to="/profile">
                <FaUser className="nav-icon" />
                {!collapsed && <span className="link_text">Profile</span>}
              </Link>
            </li> */}
          </ul>
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;
