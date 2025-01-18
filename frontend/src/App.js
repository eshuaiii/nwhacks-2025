import MapboxMap from './components/maps';
import './App.css';

function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Mapbox Example</h1>
      </header>
      <main className="map-container">
        <MapboxMap />
      </main>
    </div>
  );
}

export default App;
