import { useState } from 'react';
import MapboxMap from './components/maps';
import UserProfile from './components/UserProfile';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('dispatches');

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Mapbox Example</h1>
        <nav className="tab-navigation">
          <div 
            className={`tab-item ${activeTab === 'dispatches' ? 'active' : ''}`}
            onClick={() => setActiveTab('dispatches')}
          >
            Dispatches
          </div>
          <div 
            className={`tab-item ${activeTab === 'user' ? 'active' : ''}`}
            onClick={() => setActiveTab('user')}
          >
            User
          </div>
        </nav>
      </header>
      <main className="map-container">
        {activeTab === 'dispatches' ? (
          <MapboxMap />
        ) : (
          <UserProfile />
        )}
      </main>
    </div>
  );
}

export default App;
