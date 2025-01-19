import { useState } from 'react';
import MapboxMap from './components/maps';
import EmergencyAssistance from './components/EmergencyAssistance';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('dispatches');

  return (
    <div className="app-container">
      <header className="app-header">
        <div className='app-top'>
          <img 
            src="/group1.svg" // Make sure the logo is placed in the public directory or adjust the path accordingly
            alt="Emergency Dispatch Logo"
            className="app-logo" // Optional: add a CSS class for styling
          />
        </div>
        <nav className="tab-navigation">
          <div 
            className={`tab-item ${activeTab === 'dispatches' ? 'active' : ''}`}
            onClick={() => setActiveTab('dispatches')}
          >
            Dispatcher View
          </div>
          <div 
            className={`tab-item ${activeTab === 'user' ? 'active' : ''}`}
            onClick={() => setActiveTab('user')}
          >
            Request Emergency
          </div>
        </nav>
      </header>
      <main className="map-container">
        {activeTab === 'dispatches' ? (
          <MapboxMap />
        ) : (
          <EmergencyAssistance />
        )}
      </main>
    </div>
  );
}

export default App;
