import React from 'react';
import './Header.css';
import Logout from '../Logout/Logout';
// import companyLogo from "../Asset/images/company logo.png"; 

const Header = () => {
  return (
    <div className="header">
      {/* <img src={companyLogo} alt="Company Logo" className="company-logo" /> */}
      <h2>Project List</h2>
      <div className="logout-button" data-tooltip="Log out">
        <Logout />
      </div>
    </div>
  );
};

export default Header;
