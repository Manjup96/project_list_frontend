import React, { useState } from 'react';
import axios from 'axios';
import './AddLeads.css';
import { baseUrl } from "../../Components/APIServices/APIServices"; 
import { useNavigate } from 'react-router-dom';  // Import useNavigate for redirection

function AddLeads() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'teamlead' // Default and fixed value
  });

  const [modalVisible, setModalVisible] = useState(false); // State to control modal visibility
  const navigate = useNavigate();  // Initialize useNavigate

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${baseUrl}/insert_user.php`, formData);
      alert(response.data.message);

      // After successful registration, show the modal
      setModalVisible(true); 
    } catch (error) {
      alert('Error submitting form');
      console.error(error);
    }
  };

  const closeModal = () => {
    setModalVisible(false); // Close the modal
    navigate('/leads'); // Redirect to the leads page
  };

  return (
    <div className="add-leads">
      <div className="add-leads__card">
        <h2 className="add-leads__title">Create New Lead</h2>
        <form onSubmit={handleSubmit} className="add-leads__form">
          <input
            type="text"
            name="name"
            placeholder="Name"
            required
            value={formData.name}
            onChange={handleChange}
            className="add-leads__input"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            value={formData.email}
            onChange={handleChange}
            className="add-leads__input"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            required
            value={formData.password}
            onChange={handleChange}
            className="add-leads__input"
          />
          <input
            type="text"
            name="role"
            placeholder="Role"
            value={formData.role}
            readOnly
            required
            className="add-leads__input"
          />
          <button type="submit" className="add-leads__submit-btn">
            Register
          </button>
        </form>
      </div>

      {/* Modal Popup */}
      {modalVisible && (
        <div className="add-leads__modal-overlay">
          <div className="add-leads__modal-content">
            <h2 className="add-leads__modal-title">Lead Created Successfully</h2>
            <p className="add-leads__modal-message">The lead has been created successfully. You can now view all leads.</p>
            <button onClick={closeModal} className="add-leads__modal-close-btn">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AddLeads;
