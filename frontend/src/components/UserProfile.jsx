import React from 'react';

function UserProfile() {
  return (
    <div className="user-section">
      <h2>User Profile</h2>
      <div className="user-info">
        <div className="profile-field">
          <label>Name:</label>
          <span>John Doe</span>
        </div>
        <div className="profile-field">
          <label>Email:</label>
          <span>john.doe@example.com</span>
        </div>
        <div className="profile-field">
          <label>Role:</label>
          <span>Dispatcher</span>
        </div>
      </div>
    </div>
  );
}

export default UserProfile; 