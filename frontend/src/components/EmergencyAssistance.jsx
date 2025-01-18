import React, { useState } from 'react';

function EmergencyAssistance() {
  const [isRequesting, setIsRequesting] = useState(false);

  const handleEmergencyRequest = () => {
    setIsRequesting(true);
    // Here you would typically make an API call to your backend
    // to handle the emergency request
    
    // For now, we'll just simulate a request
    setTimeout(() => {
      alert('Emergency services have been notified. Stay calm, help is on the way.');
      setIsRequesting(false);
    }, 1000);
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
            className={`emergency-button ${isRequesting ? 'requesting' : ''}`}
            onClick={handleEmergencyRequest}
            disabled={isRequesting}
          >
            {isRequesting ? 'Requesting Emergency Services...' : 'Request Emergency Services'}
          </button>
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