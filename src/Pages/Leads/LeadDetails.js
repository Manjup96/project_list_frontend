import React, { useEffect, useState } from 'react';
import './LeadDetails.css';
import { baseUrl } from "../../Components/APIServices/APIServices"; 
import AddLeads from '../../Pages/Leads/AddLeads';  // Import the AddLeads component

const LeadDetails = () => {
  const [teamleadData, setTeamleadData] = useState([]);
  const [showModal, setShowModal] = useState(false);  // State to control modal visibility

  useEffect(() => {
    // Fetch teamlead users from the backend PHP API
    fetch(`${baseUrl}/getLeads.php`)  // Update with your actual PHP endpoint URL
      .then(response => response.json())
      .then(data => setTeamleadData(data))
      .catch(error => console.error('Error fetching teamlead data:', error));
  }, []);

  const openModal = () => setShowModal(true);  // Open the modal
  const closeModal = () => setShowModal(false);  // Close the modal

  return (
    <div className="lead-details">
      <h2 className="lead-details__title">Team Lead Details</h2>
      <button className="lead-details__add-lead-btn" onClick={openModal}>Add Lead</button>  {/* Add Lead button */}

      {/* Modal Popup */}
      {showModal && (
        <div className="lead-details__modal-overlay">
          <div className="lead-details__modal-content">
            <button className="lead-details__close-btn" onClick={closeModal}>X</button>  {/* Close Button */}
            <AddLeads />
          </div>
        </div>
      )}

      <table className="lead-details__table">
        <thead>
          <tr>
            <th>Sl. No</th>  {/* Serial Number Column */}
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Created At</th>
            {/* <th>Password</th>  Password Column */}
          </tr>
        </thead>
        <tbody>
          {teamleadData.map((lead, index) => (
            <tr key={lead.id}>
              <td>{index + 1}</td> {/* Display serial number starting from 1 */}
              <td>{lead.name}</td>
              <td>{lead.email}</td>
              <td>{lead.role}</td>
              <td>{lead.created_at}</td>
              {/* <td>{lead.password}</td>  */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LeadDetails;
