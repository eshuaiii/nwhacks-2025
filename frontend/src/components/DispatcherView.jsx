import React, { useState, useEffect } from 'react';
import { socket } from '../socket';

function DispatcherView() {
  const [emergencies, setEmergencies] = useState([]);
  const [activeSection, setActiveSection] = useState('emergencies');

  // Fetch emergencies on component mount
  useEffect(() => {
    fetchEmergencies();
  }, []);

  // Listen for real-time updates
  useEffect(() => {
    socket.on('new_emergency', (data) => {
      setEmergencies(prev => [data, ...prev]);
    });

    socket.on('emergency_updated', (updatedEmergency) => {
      setEmergencies(prev => 
        prev.map(emergency => 
          emergency.id === updatedEmergency.id ? updatedEmergency : emergency
        )
      );
    });

    return () => {
      socket.off('new_emergency');
      socket.off('emergency_updated');
    };
  }, []);

  const fetchEmergencies = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/emergencies');
      if (!response.ok) {
        throw new Error('Failed to fetch emergencies');
      }
      const data = await response.json();
      setEmergencies(data);
    } catch (error) {
      console.error('Error fetching emergencies:', error);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await fetch(`http://localhost:3001/api/emergency/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update emergency status');
      }

      const updatedEmergency = await response.json();
      setEmergencies(prev =>
        prev.map(emergency =>
          emergency.id === id ? updatedEmergency : emergency
        )
      );
    } catch (error) {
      console.error('Error updating emergency status:', error);
    }
  };

  return (
    <div className="dispatcher-view">
      {/* <div className="dispatcher-sidebar">
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
                    <p><strong>Contact:</strong> {emergency.contactName} ({emergency.contactNumber})</p>
                    {emergency.location && <p><strong>Location:</strong> {emergency.location}</p>}
                    {emergency.latitude && emergency.longitude && (
                      <p><strong>GPS:</strong> {emergency.latitude}, {emergency.longitude}</p>
                    )}
                    <p><strong>Description:</strong> {emergency.description}</p>
                    <p><strong>Time:</strong> {new Date(emergency.timestamp).toLocaleString()}</p>
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
      </div> */}
    </div>
  );
}

export default DispatcherView; 