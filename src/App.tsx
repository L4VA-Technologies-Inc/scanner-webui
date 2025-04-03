import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Monitoring from './pages/Monitoring';
import Webhooks from './pages/Webhooks';
import WebhookActivity from './pages/WebhookActivity';
import WebhookActivityLog from './pages/WebhookActivityLog';
import BlockchainQuery from './pages/BlockchainQuery';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/monitoring" element={<Monitoring />} />
          <Route path="/webhooks" element={<Webhooks />} />
          <Route path="/webhook-activity" element={<WebhookActivity />} />
          <Route path="/webhook-activity-log" element={<WebhookActivityLog />} />
          <Route path="/blockchain-query" element={<BlockchainQuery />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
