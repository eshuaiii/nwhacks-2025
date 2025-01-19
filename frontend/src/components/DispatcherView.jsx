import React, { useState, useEffect } from 'react';
import { socket } from '../socket'; // Make sure to create this socket connection file

function DispatcherView() {
  const [emergencies, setEmergencies] = useState([]);
  const [activeSection, setActiveSection] = useState('emergencies'); // 'emergencies' or 'users'

  useEffect(() => {
    // Listen for new emergency requests
    socket.on('message_from_client', (data) => {
      setEmergencies(prev => [...prev, {
        ...data,
        id: Date.now(), // temporary ID
        status: 'NEW',
        timestamp: new Date().toLocaleString()
      }]);
    });

    return () => {
      socket.off('message_from_client');
    };
  }, []);

  const handleStatusChange = (id, newStatus) => {
    setEmergencies(prev =>
      prev.map(emergency =>
        emergency.id === id ? { ...emergency, status: newStatus } : emergency
      )
    );
  };

  return (
    <div className="dispatcher-view">
      <div className="dispatcher-sidebar">
        <div 
          className={`sidebar-item ${activeSection === 'emergencies' ? 'active' : ''}`}
          onClick={() => setActiveSection('emergencies')}
        >
          Active Emergency Requests
        </div>
        <div 
          className={`sidebar-item ${activeSection === 'users' ? 'active' : ''}`}
          onClick={() => setActiveSection('users')}
        >
          User List
        </div>
      </div>

      <div className="dispatcher-content">
        {activeSection === 'emergencies' ? (
          <div className="emergency-list">
            {emergencies.length === 0 ? (
              <div className="no-emergencies">
                No active emergency requests
              </div>
            ) : (
              emergencies.map(emergency => (
                <div key={emergency.id} className={`emergency-card ${emergency.status.toLowerCase()}`}>
                  <div className="emergency-header">
                    <span className="emergency-type">{emergency.emergencyType}</span>
                    <span className="emergency-status">{emergency.status}</span>
                  </div>
                  <div className="emergency-details">
                    <p><strong>Contact:</strong> {emergency.name} ({emergency.contactNumber})</p>
                    <p><strong>Location:</strong> {emergency.location}</p>
                    {emergency.latitude && emergency.longitude && (
                      <p><strong>GPS:</strong> {emergency.latitude}, {emergency.longitude}</p>
                    )}
                    <p><strong>Description:</strong> {emergency.description}</p>
                    <p><strong>Time:</strong> {emergency.timestamp}</p>
                  </div>
                  <div className="emergency-actions">
                    <select 
                      value={emergency.status}
                      onChange={(e) => handleStatusChange(emergency.id, e.target.value)}
                    >
                      <option value="NEW">New</option>
                      <option value="ACKNOWLEDGED">Acknowledged</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="RESOLVED">Resolved</option>
                    </select>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="user-list">
            <h3>User List</h3>
            <p>User management functionality coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default DispatcherView; 