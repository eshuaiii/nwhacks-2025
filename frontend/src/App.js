import { useState } from 'react';
import MapboxMap from './components/maps';
import EmergencyAssistance from './components/EmergencyAssistance';
import DispatcherView from './components/DispatcherView';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('dispatches');

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Emergency Dispatch System</h1>
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
      <main className="main-container">
        {activeTab === 'dispatches' ? (
          <div className="dispatcher-container">
            <MapboxMap />
            <DispatcherView />
          </div>
        ) : (
          <EmergencyAssistance />
        )}
      </main>
    </div>
  );
}

export default App;
