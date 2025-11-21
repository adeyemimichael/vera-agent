import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Agents from './pages/Agents';
import RegisterAgent from './pages/RegisterAgent';
import Negotiations from './pages/Negotiations';
import HCSLogs from './pages/HCSLogs';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/agents" element={<Agents />} />
            <Route path="/agents/register" element={<RegisterAgent />} />
            <Route path="/negotiations" element={<Negotiations />} />
            <Route path="/hcs-logs" element={<HCSLogs />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
