import React from 'react';
import styled from 'styled-components';
import { FaTachometerAlt, FaFileAlt, FaCogs, FaShoppingCart, FaUserShield, FaRocket, FaTools, FaClipboardList, FaUsers, FaCheckCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const SidebarContainer = styled.div`
  width: 250px;
  background-color: #344767;
  padding: 16px;
  color: white;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const MenuItem = styled.div`
  margin: 16px 0;
  padding: 8px;
  width: 100%;
  display: flex;
  align-items: center;
  cursor: pointer;
  &:hover {
    background-color: #5e72e4;
    border-radius: 4px;
  }
`;

const IconContainer = styled.div`
  margin-right: 8px;
`;

const Sidebar = () => {
  return (
    <SidebarContainer>
      <h2>Menu</h2>
      <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
        <MenuItem>
          <IconContainer><FaTachometerAlt /></IconContainer>
          <span>Dashboard</span>
        </MenuItem>
      </Link>
      <Link to="/users" style={{ textDecoration: 'none', color: 'inherit' }}>
        <MenuItem>
          <IconContainer><FaUsers /></IconContainer>
          <span>Gebruikerslijst</span>
        </MenuItem>
      </Link>
      <Link to="/completed" style={{ textDecoration: 'none', color: 'inherit' }}>
        <MenuItem>
          <IconContainer><FaCheckCircle /></IconContainer>
          <span>Voltooide Gebruikers</span>
        </MenuItem>
      </Link>
     
    </SidebarContainer>
  );
};

export default Sidebar;
