import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Heading,
  Text,
  Spinner,
  Alert,
  AlertIcon,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useColorModeValue,
} from '@chakra-ui/react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'; // Import Recharts components
import { useAuth } from '../context/AuthContext';
import { useWebSocketContext } from '../context/WebSocketContext'; // Import WebSocket context
import apiClient from '../api/client';

// Simple interfaces for count endpoints (assuming they return arrays)
interface MonitoredItem { id: string; }
interface WebhookItem { id: string; }

// --- Dashboard Component --- //

const Dashboard: React.FC = () => {
  const { apiKey } = useAuth();
  const { messageHistory, readyState: wsReadyState, connectionStatus: wsConnectionStatus } = useWebSocketContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [healthStatus, setHealthStatus] = useState<{ status: string; timestamp: string } | null>(null);
  const [counts, setCounts] = useState<{ addresses: number; contracts: number; webhooks: number } | null>(null);

  const cardBg = useColorModeValue('white', 'gray.700');

  // --- Fetching Data --- //
  const fetchData = useCallback(async () => {
    if (!apiKey) {
      setError('API Key not set.');
      setHealthStatus(null);
      setCounts(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Fetch all data in parallel
      const [healthRes, addressRes, contractRes, webhookRes] = await Promise.all([
        apiClient.get<{ status: string; timestamp: string }>('/health'),
        apiClient.get<MonitoredItem[]>('/api/monitoring/addresses'),
        apiClient.get<MonitoredItem[]>('/api/monitoring/contracts'),
        apiClient.get<WebhookItem[]>('/api/webhooks'),
      ]);

      setHealthStatus(healthRes.data);
      setCounts({
        addresses: addressRes.data.length,
        contracts: contractRes.data.length,
        webhooks: webhookRes.data.length,
      });

    } catch (err: any) {
      console.error("Error fetching dashboard data:", err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch dashboard data');
      setHealthStatus(null); // Clear stale data on error
      setCounts(null);
    } finally {
      setLoading(false);
    }
  }, [apiKey]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Process WebSocket Data for Chart --- //
  const webhookActivitySummary = useMemo(() => {
    const summary = {
      success: 0,
      failed: 0, // Includes failed and error types
      attempt: 0, 
      // Add other types if needed
    };
    // Only process if connected and have messages
    if (wsReadyState === ReadyState.OPEN && messageHistory.length > 0) {
       messageHistory.forEach(msg => {
        switch (msg.type) {
          case 'delivery_success':
            summary.success++;
            break;
          case 'delivery_failed':
          case 'delivery_error':
            summary.failed++;
            break;
          case 'delivery_attempt':
             summary.attempt++; // Count attempts if desired
             break;
          // Ignore 'info' type for this summary
        }
      });
    }
    // Format for Recharts Pie chart
    return [
      { name: 'Success', value: summary.success },
      { name: 'Failed/Error', value: summary.failed },
      // { name: 'Attempts', value: summary.attempt }, // Optional
    ].filter(item => item.value > 0); // Only show categories with data
  }, [messageHistory, wsReadyState]);

  const PIE_COLORS = ['#48BB78', '#F56565', '#ECC94B']; // Green, Red, Yellow

  // --- Render --- //

  if (!apiKey) {
    return (
      <Box>
        <Heading size="lg" mb={4}>Dashboard</Heading>
        <Alert status="warning">
          <AlertIcon />
          Please enter and save your API Key view the dashboard.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Heading size="lg" mb={6}>Dashboard</Heading>

      {loading && <Spinner />}
      {error && !loading && <Alert status="error" mb={4}><AlertIcon />{error}</Alert>}

      {/* --- API Health & Counts --- */} 
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        <Stat p={5} shadow="md" border="1px" borderColor="gray.200" borderRadius="md" bg={cardBg}>
          <StatLabel>API Status</StatLabel>
          {healthStatus ? (
            <>
              <StatNumber color={healthStatus.status === 'OK' ? 'green.500' : 'red.500'}>
                {healthStatus.status}
              </StatNumber>
              <StatHelpText>Timestamp: {new Date(healthStatus.timestamp).toLocaleString()}</StatHelpText>
            </>
          ) : (
             <StatNumber>Unknown</StatNumber>
          )}
        </Stat>

        <Stat p={5} shadow="md" border="1px" borderColor="gray.200" borderRadius="md" bg={cardBg}>
          <StatLabel>Monitored Addresses</StatLabel>
          <StatNumber>{counts?.addresses ?? '-'}</StatNumber>
        </Stat>

        <Stat p={5} shadow="md" border="1px" borderColor="gray.200" borderRadius="md" bg={cardBg}>
          <StatLabel>Monitored Contracts</StatLabel>
          <StatNumber>{counts?.contracts ?? '-'}</StatNumber>
        </Stat>

        <Stat p={5} shadow="md" border="1px" borderColor="gray.200" borderRadius="md" bg={cardBg}>
          <StatLabel>Registered Webhooks</StatLabel>
          <StatNumber>{counts?.webhooks ?? '-'}</StatNumber>
        </Stat>
      </SimpleGrid>

      {/* --- Recent Webhook Activity Chart --- */} 
      <Box p={5} shadow="md" border="1px" borderColor="gray.200" borderRadius="md" bg={cardBg}>
         <Heading size="md" mb={4}>Recent Webhook Delivery Status</Heading>
         <Text fontSize="sm" mb={2}>WebSocket Status: {wsConnectionStatus}</Text>
         {wsReadyState !== ReadyState.OPEN ? (
           <Alert status="info" variant="subtle">
             <AlertIcon />
             WebSocket not connected. Activity chart requires an active connection.
           </Alert>
         ) : webhookActivitySummary.length > 0 ? (
            <Box height="300px"> { /* Give chart container a fixed height */}
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={webhookActivitySummary}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            // label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                        >
                        {webhookActivitySummary.map((_entry, index) => ( // Prefix unused 'entry' with underscore
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </Box>
         ) : (
             <Text>No recent webhook activity messages received via WebSocket.</Text>
         )}
      </Box>

    </Box>
  );
};

export default Dashboard;

// Helper for ReadyState comparison (assuming ReadyState enum exists)
// You might need to import ReadyState explicitly if not globally available
import { ReadyState } from 'react-use-websocket';
