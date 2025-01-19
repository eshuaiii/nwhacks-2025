import React, { useState, useEffect, useCallback, useRef } from 'react';
// import { io } from 'socket.io-client';
import StartStream from './StartStream';
import { createStream } from './StreamCreator';

function EmergencyAssistance() {
  const [isRequesting, setIsRequesting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [uuid, setUuid] = useState(null);
  const [locationInterval, setLocationInterval] = useState(null);
  const [formData, setFormData] = useState({
    emergencyType: '',
    description: '',
    location: '',
    shareLocation: false,
    contactNumber: '',
    name: ''
  });
  const [showStartStream, setShowStartStream] = useState(false);
  const [streamKey, setStreamKey] = useState(''); // Use React state for the streamKey

  // Use a ref to always have access to the latest uuid
  const uuidRef = useRef(null);

  // Keep the ref in sync with the state
  useEffect(() => {
    uuidRef.current = uuid;
    console.log('UUID updated in ref:', uuid);
  }, [uuid]);

  const emergencyTypes = [
    'Medical Emergency',
    'Fire',
    'Police Emergency',
    'Traffic Accident',
    'Natural Disaster',
    'Other'
  ];

  const emitLocation = useCallback(async (coords) => {
    const locationData = {
      latitude: coords.latitude,
      longitude: coords.longitude,
    };

    // Use the ref instead of the state
    const currentUuid = uuidRef.current;

    if (currentUuid) {
      try {
        console.log('Updating location for emergency:', currentUuid);
        console.log('Location data:', locationData);

        const response = await fetch(`http://127.0.0.1:3001/api/emergency/${currentUuid}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(locationData),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Server response:', errorText);
          throw new Error('Failed to update location');
        }

        console.log('Location updated in the database:', locationData);
      } catch (error) {
        console.error('Error updating location in database:', error);
        stopLocationUpdates();
      }
    } else {
      console.log('No UUID available for location update');
    }
  }, []); // No need for uuid in dependencies anymore

  const stopLocationUpdates = useCallback(() => {
    console.log('Stopping location updates');
    if (locationInterval) {
      clearInterval(locationInterval);
      setLocationInterval(null);
    }
  }, [locationInterval]);

  const startLocationUpdates = useCallback(async () => {
    console.log('Starting location updates');
    try {
      // Clear any existing interval first
      if (locationInterval) {
        clearInterval(locationInterval);
      }

      // Initial location update
      const position = await getCurrentLocation();
      await emitLocation(position.coords);

      // Set up interval for periodic updates
      const intervalId = setInterval(async () => {
        try {
          console.log('Interval update triggered');
          const newPosition = await getCurrentLocation();
          await emitLocation(newPosition.coords);
        } catch (error) {
          console.error('Error getting updated location:', error);
        }
      }, 5000);

      setLocationInterval(intervalId);
      console.log('Location interval set:', intervalId);
    } catch (error) {
      console.error('Error starting location updates:', error);
    }
  }, [emitLocation, locationInterval]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (locationInterval) {
        console.log('Cleaning up interval on unmount');
        clearInterval(locationInterval);
      }
    };
  }, [locationInterval]);

  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
      } else {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      }
    });
  };

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
        emitLocation(position.coords);
      } catch (error) {
        console.error('Error getting location:', error);
      }
    }

    // Now actually send request to backend
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

    try {
      const response = await fetch('http://127.0.0.1:3001/api/emergency', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emergencyData),
      });

      if (!response.ok) {
        throw new Error('Failed to create emergency.');
      }
      alert('Emergency services have been notified. Stay calm, help is on the way.');
      setShowModal(false);
      resetForm();

      const data = await response.json();
      console.log(data);

      // Safely capture the new UUID in a local variable
      const newUuid = data.id;
      setUuid(newUuid);

      if (formData.shareLocation) {
        // Slight delay to ensure the ref is updated
        setTimeout(async () => {
          console.log('Starting location updates after emergency creation');
          await startLocationUpdates();
        }, 100);
      }

      // Use the local `newUuid` (guaranteed not null) to create the stream
      const key = await createStream(newUuid);
      console.log('EmergencyAssistance then:', key);
      setStreamKey(key);

      // Finally, show the StartStream component
      setShowStartStream(true);
    } catch (error) {
      console.error('Error creating emergency:', error);
      alert('Failed to notify emergency services. Please try again.');
    } finally {
      setIsRequesting(false);
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

        <div className="emergency-instructions">
          <h3>Important Instructions:</h3>
          <ol>
            <li>Stay calm and remain in a safe location</li>
            <li>Keep your phone nearby</li>
            <li>Follow any instructions provided by emergency dispatchers</li>
            <li>If possible, send someone to meet emergency responders</li>
          </ol>
        </div>

        <div className="emergency-actions">
          <button
            className="emergency-button"
            onClick={() => setShowModal(true)}
          >
            Request Emergency Services
          </button>
        </div>
      </div>

      {/* Modal for entering emergency details */}
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
                  {['Medical Emergency', 'Fire', 'Police Emergency', 'Traffic Accident', 'Natural Disaster', 'Other'].map(type => (
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

      {/* Display the streamKey for debugging if you want */}
      <p>{streamKey}</p>

      {/* Conditionally render StartStream once we have a streamKey */}
      {showStartStream && <StartStream streamKey={streamKey} />}
    </div>
  );
}

export default EmergencyAssistance;