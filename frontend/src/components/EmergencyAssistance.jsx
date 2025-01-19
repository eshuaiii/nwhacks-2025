import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { socket } from '../socket';

function EmergencyAssistance() {
  const [isRequesting, setIsRequesting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [incidents, setIncidents] = useState([]);
  const [formData, setFormData] = useState({
    emergencyType: '',
    description: '',
    location: '',
    shareLocation: false,
    contactNumber: '',
    name: ''
  });

  const emergencyTypes = [
    'Medical Emergency',
    'Fire',
    'Police Emergency',
    'Traffic Accident',
    'Natural Disaster',
    'Other'
  ];

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/incidents');
      setIncidents(response.data);
    } catch (error) {
      console.error('Error fetching incidents:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleEmergencyRequest = () => {
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsRequesting(true);

    let locationData = formData.location;
    // If user agreed to share location, get their coordinates
    if (formData.shareLocation) {
      try {
        const position = await getCurrentLocation();
        locationData = `${position.coords.latitude}, ${position.coords.longitude}`;
      } catch (error) {
        console.error('Error getting location:', error);
      }
    }

    // Prepare the data to send
    const emergencyData = {
      sender: formData.name,
      message: `${formData.emergencyType}: ${formData.description}`,
      location: locationData,
      contact: formData.contactNumber,
      timestamp: new Date().toISOString()
    };

    // Send to backend via WebSocket
    socket.emit('message_to_dispatcher', emergencyData);

    // Show confirmation and reset form
    setTimeout(() => {
      alert('Emergency services have been notified. Stay calm, help is on the way.');
      setIsRequesting(false);
      setShowModal(false);
      setFormData({
        emergencyType: '',
        description: '',
        location: '',
        shareLocation: false,
        contactNumber: '',
        name: ''
      });
      fetchIncidents(); // Refresh the incidents list
    }, 1000);
  };

  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
      } else {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      }
    });
  };

  const toggleIncidentStatus = async (incidentId) => {
    try {
      await axios.put(`http://localhost:3000/api/incidents/${incidentId}/toggle`);
      fetchIncidents(); // Refresh the incidents list
    } catch (error) {
      console.error('Error toggling incident status:', error);
    }
  };

  return (
    <div className="emergency-section">
      <h2>Emergency Assistance</h2>
      
      <div className="emergency-info">
        <p className="emergency-notice">
          If this is a life-threatening emergency, immediately call 911 directly.
        </p>
        
        <div className="emergency-actions">
          <button 
            className="emergency-button"
            onClick={handleEmergencyRequest}
          >
            Request Emergency Services
          </button>
        </div>

        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Emergency Request Details</h3>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Type of Emergency:</label>
                  <select 
                    name="emergencyType"
                    value={formData.emergencyType}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Emergency Type</option>
                    {emergencyTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Your Name:</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Contact Number:</label>
                  <input
                    type="tel"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Description of Emergency:</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    placeholder="Please provide details about the emergency..."
                  />
                </div>

                <div className="form-group">
                  <label>Location/Address:</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter street address"
                  />
                </div>

                <div className="form-group checkbox">
                  <label>
                    <input
                      type="checkbox"
                      name="shareLocation"
                      checked={formData.shareLocation}
                      onChange={handleInputChange}
                    />
                    Share my current location
                  </label>
                </div>

                <div className="modal-actions">
                  <button 
                    type="button" 
                    onClick={() => setShowModal(false)}
                    className="cancel-button"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="submit-button"
                    disabled={isRequesting}
                  >
                    {isRequesting ? 'Sending Request...' : 'Send Emergency Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Active Incidents List */}
        <div className="incidents-list">
          <h3>Active Incidents</h3>
          {incidents
            .filter(incident => incident.is_active)
            .map(incident => (
              <div key={incident.id} className="incident-card">
                <p><strong>Message:</strong> {incident.message}</p>
                <p><strong>Location:</strong> {incident.location}</p>
                <p><strong>Time:</strong> {new Date(incident.timestamp).toLocaleString()}</p>
                <button 
                  onClick={() => toggleIncidentStatus(incident.id)}
                  className="resolve-button"
                >
                  Resolve Incident
                </button>
              </div>
            ))}
        </div>

        {/* Resolved Incidents List */}
        <div className="incidents-list">
          <h3>Resolved Incidents</h3>
          {incidents
            .filter(incident => !incident.is_active)
            .map(incident => (
              <div key={incident.id} className="incident-card resolved">
                <p><strong>Message:</strong> {incident.message}</p>
                <p><strong>Location:</strong> {incident.location}</p>
                <p><strong>Time:</strong> {new Date(incident.timestamp).toLocaleString()}</p>
                <button 
                  onClick={() => toggleIncidentStatus(incident.id)}
                  className="reopen-button"
                >
                  Reopen Incident
                </button>
              </div>
            ))}
        </div>

        <div className="emergency-instructions">
          <h3>After Requesting Emergency Services:</h3>
          <ol>
            <li>Stay calm and remain in a safe location</li>
            <li>Keep your phone nearby</li>
            <li>Follow any instructions provided by emergency dispatchers</li>
            <li>If possible, send someone to meet emergency responders</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

export default EmergencyAssistance; 