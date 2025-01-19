import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

function EmergencyAssistance() {
  const [socket, setSocket] = useState(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const [showModal, setShowModal] = useState(false);
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
    const newSocket = io("http://127.0.0.1:4287");
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to server');
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsRequesting(true);

    // Add location if sharing is enabled
    if (formData.shareLocation) {
      try {
        const position = await getCurrentLocation();
        formData.coordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };

        // Start emitting location to the WebSocket server
        console.log('start logging');
        emitLocation(position.coords);
      } catch (error) {
        console.error('Error getting location:', error);
      }
    }

    console.log('Emergency Request Data:', formData);
    await handleEmergencySubmit();
  };

  const handleEmergencySubmit = async () => {
    const emergencyData = {
      emergencyType: formData.emergencyType,
      description: formData.description,
      location: formData.location,
      contactName: formData.name,
      contactNumber: formData.contactNumber,
      latitude: formData.coordinates?.latitude || null,
      longitude: formData.coordinates?.longitude || null
    };

    fetch('http://127.0.0.1:3001/api/emergency', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emergencyData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to create emergency.');
        }
        return response.json();
      })
      .then(() => {
        alert('Emergency services have been notified. Stay calm, help is on the way.');
        setShowModal(false);
        resetForm();
      })
      .catch((error) => {
        console.error('Error creating emergency:', error);
        alert('Failed to notify emergency services. Please try again.');
      })
      .finally(() => {
        setIsRequesting(false);
      });
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

  const emitLocation = (coords) => {
      if (socket) {
        console.log(socket);
        socket.emit('message_to_dispatcher', {
          sender: formData.name || 'Anonymous',
          latitude: coords.latitude,
          longitude: coords.longitude
        });

        // Start sending location updates every 5 seconds
        const interval = setInterval(() => {
          navigator.geolocation.getCurrentPosition((position) => {
            const { latitude, longitude } = position.coords;
            socket.emit('message_to_dispatcher', {
              sender: formData.name || 'Anonymous',
              latitude,
              longitude
            });
            console.log({
              sender: formData.name || 'Anonymous',
              latitude,
              longitude
            });
          });
        }, 5000);

        // Stop sending when the modal is closed
        setShowModal(false);
        return () => clearInterval(interval);
      }
    };

  const resetForm = () => {
    setFormData({
      emergencyType: '',
      description: '',
      location: '',
      shareLocation: false,
      contactNumber: '',
      name: ''
    });
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
            onClick={() => setShowModal(true)}
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