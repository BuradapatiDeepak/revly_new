import React, { useState } from 'react';
import axios from 'axios';
import './App.css';
import ThemeToggleButton from './ThemeToggleButton';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, Tooltip, Legend, Title, ArcElement } from 'chart.js';

// Registering Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, Title);

function App() {
  // State variables
  const [url, setUrl] = useState(''); // Stores the input URL
  const [metrics, setMetrics] = useState(null); // Stores the metrics data fetched from the backend
  const [loading, setLoading] = useState(false); // Manages loading state during API call
  const [error, setError] = useState(null); // Stores any error message
  const [isLightMode, setIsLightMode] = useState(true); // Manages the theme mode

  // Function to handle the form submission
  const handleSubmit = async () => {
    setLoading(true); // Set loading to true while fetching data
    setError(null); // Reset error state before making a new request

    try {
      // Posting the URL to the backend for analysis
      const response = await axios.post('http://localhost:5000/analyze', { url });
      setMetrics(response.data); // Update metrics state with the response data
    } catch (err) {
      // Set error message if the request fails
      setError('Failed to analyze the website. Please try again.');
    } finally {
      // Set loading to false regardless of success or failure
      setLoading(false);
    }
  };

  // Data for Pie chart
  const pieChartData = {
    labels: ['Layout Duration', 'Recalc Style Duration', 'Script Duration', 'Task Duration'],
    datasets: [
      {
        data: [
          metrics?.LayoutDuration || 0,
          metrics?.RecalcStyleDuration || 0,
          metrics?.ScriptDuration || 0,
          metrics?.TaskDuration || 0,
        ],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
      },
    ],
  };

  return (
    <div className={`App ${isLightMode ? 'light-mode' : 'dark-mode'}`}>
      <header className="App-header">
        <h1>
          Speed<span className="highlight">X</span> Analyzer
        </h1>
        <div className="input-container">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)} // Update URL state on input change
            placeholder="Enter website URL"
          />
          <button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Analyzing...' : 'Analyze'} {/* Button text changes based on loading state */}
          </button>
        </div>
        {error && <p className="error-message">{error}</p>} {/* Display error message if there is an error */}
        {metrics && (
          <div className="metrics-container">
            <h2>Performance Metrics</h2>
            <div className="metrics-grid">
              {/* Display each metric as a card */}
              <div className="metric-card"><strong>Page Load Time:</strong> {metrics.pageLoadTime} ms</div>
              <div className="metric-card"><strong>Total Request Size:</strong> {metrics.totalRequestSize} bytes</div>
              <div className="metric-card"><strong>Number of Requests:</strong> {metrics.requestCount}</div>
              <div className="metric-card"><strong>Time to First Byte (TTFB):</strong> {metrics.ttfb} ms</div>
              <div className="metric-card"><strong>First Contentful Paint (FCP):</strong> {metrics.fcp} ms</div>
              <div className="metric-card"><strong>Documents:</strong> {metrics.Documents}</div>
              <div className="metric-card"><strong>Frames:</strong> {metrics.Frames}</div>
              <div className="metric-card"><strong>JSEventListeners:</strong> {metrics.JSEventListeners}</div>
              <div className="metric-card"><strong>Nodes:</strong> {metrics.Nodes}</div>
              <div className="metric-card"><strong>LayoutCount:</strong> {metrics.LayoutCount}</div>
              <div className="metric-card"><strong>RecalcStyleCount:</strong> {metrics.RecalcStyleCount}</div>
              <div className="metric-card"><strong>LayoutDuration:</strong> {metrics.LayoutDuration} ms</div>
              <div className="metric-card"><strong>RecalcStyleDuration:</strong> {metrics.RecalcStyleDuration} ms</div>
              <div className="metric-card"><strong>ScriptDuration:</strong> {metrics.ScriptDuration} ms</div>
              <div className="metric-card"><strong>TaskDuration:</strong> {metrics.TaskDuration} ms</div>
              <div className="metric-card"><strong>JSHeapUsedSize:</strong> {metrics.JSHeapUsedSize} bytes</div>
              <div className="metric-card"><strong>JSHeapTotalSize:</strong> {metrics.JSHeapTotalSize} bytes</div>
            </div>
            <div className="pie-chart-container">
              {/* Render Pie chart with metrics data */}
              <Pie data={pieChartData} width={300} height={300} />
            </div>
          </div>
        )}
      </header>
      {/* Theme toggle button component */}
      <ThemeToggleButton isLightMode={isLightMode} setIsLightMode={setIsLightMode} />
    </div>
  );
}

export default App;
