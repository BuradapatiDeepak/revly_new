import React from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './ThemeToggleButton.css';

const ThemeToggleButton = ({ isLightMode, setIsLightMode }) => {
  const handleToggle = () => {
    setIsLightMode((prevMode) => !prevMode);
  };

  return (
    <div className="theme-toggle-button" onClick={handleToggle}>
      <i className={`fas fa-${isLightMode ? 'moon' : 'sun'}`}></i>
    </div>
  );
};

export default ThemeToggleButton;
