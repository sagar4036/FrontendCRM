import React from 'react';
import { FaBuilding, FaCheckCircle, FaBan, FaClock, FaSignOutAlt } from 'react-icons/fa';
import '../../styles/masterdash.css';
import { useMaster } from '../../context/MasterContext';

const DashboardCards = () => {
  const { logout } = useMaster();

  const cards = [
    {
      title: 'Total Companies',
      value: 5,
      icon: <FaBuilding />,
      className: 'purple',
    },
    {
      title: 'Active Companies',
      value: 3,
      icon: <FaCheckCircle />,
      className: 'green',
    },
    {
      title: 'Inactive Companies',
      value: 2,
      icon: <FaBan />,
      className: 'red',
    },
    {
      title: 'Recently Added',
      value: 1,
      icon: <FaClock />,
      className: 'blue',
    },
  ];

  return (
    <div className="dashboard-top-container">
      <div className="dashboard-logout-bar">
        <button className="master-logout-btn" onClick={logout}>
          <FaSignOutAlt style={{ marginRight: '6px' }} />
          Logout
        </button>
      </div>

      <div className="dashboard-cards">
        {cards.map((card, index) => (
          <div className={`card ${card.className}`} key={index}>
            <div className="m-card-icon">{card.icon}</div>
            <div className="card-content">
              <p className="card-title">{card.title}</p>
              <h2 className="card-value">{card.value}</h2>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardCards;
