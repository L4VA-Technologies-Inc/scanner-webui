import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Spinner,
  Alert,
  AlertIcon,
  Tag,
  Button,
  HStack,
  Text,
  Code,
} from '@chakra-ui/react';
import apiClient from '../api/client'; // Assuming you have an API client setup
import { useAuth } from '../context/AuthContext';

// Define the structure of a Webhook Delivery based on the OpenAPI spec
interface WebhookDelivery {
  id: string;
  webhook_id: string;
  event_id: string;
  status: "PENDING" | "IN_PROGRESS" | "SUCCEEDED" | "RETRYING" | "FAILED" | "MAX_RETRIES_EXCEEDED";
  attempt_count: number;
  status_code?: number | null;
  response_body?: string | null;
  created_at: string;
  completed_at?: string | null;
  next_retry_at?: string | null;
}

const WebhookActivityLog: React.FC = () => {
  const { apiKey } = useAuth();
  const [searchParams] = useSearchParams();
  const webhookIdFilter = searchParams.get('webhookId');

  const [deliveries, setDeliveries] = useState<WebhookDelivery[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [offset, setOffset] = useState<number>(0);
  const limit = 20; // Number of items per page

  const fetchDeliveries = useCallback(async () => {
    if (!apiKey) {
      setError('API Key is not set. Please set it in the configuration.');
      setLoading(false);
      setDeliveries([]);
      setTotalCount(0);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params: Record<string, any> = {
        limit,
        offset,
        sortBy: 'created_at', // Default sort
        sortOrder: 'DESC',
      };

      if (webhookIdFilter) {
        params.webhookId = webhookIdFilter;
      }

      const response = await apiClient.get<{ data: WebhookDelivery[]; totalCount: number }>('/api/deliveries', {
        params,
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      setDeliveries(response.data.data);
      setTotalCount(response.data.totalCount);
    } catch (err: any) {
      console.error("Error fetching webhook deliveries:", err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch webhook deliveries');
      setDeliveries([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [apiKey, webhookIdFilter, offset, limit]);

  useEffect(() => {
    fetchDeliveries();
  }, [fetchDeliveries]); // Depend on the memoized fetch function

  const handleNextPage = () => {
    if (offset + limit < totalCount) {
      setOffset(offset + limit);
    }
  };

  const handlePreviousPage = () => {
    setOffset(Math.max(0, offset - limit));
  };

  const getStatusColor = (status: WebhookDelivery['status']) => {
    switch (status) {
      case 'SUCCEEDED': return 'green';
      case 'FAILED':
      case 'MAX_RETRIES_EXCEEDED': return 'red';
      case 'RETRYING': return 'orange';
      case 'IN_PROGRESS': return 'blue';
      case 'PENDING':
      default: return 'gray';
    }
  };

  return (
    <Box>
      <Heading size="lg" mb={4}>
        Webhook Delivery Activity {webhookIdFilter ? `(Webhook: ${webhookIdFilter.substring(0, 8)}...)` : ''}
      </Heading>

      {loading && <Spinner />}
      {error && !loading && <Alert status="error" mb={4}><AlertIcon />{error}</Alert>}

      {!loading && !error && (
        <>
          <TableContainer>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Status</Th>
                  <Th>Webhook ID</Th>
                  <Th>Event ID</Th>
                  <Th>Attempts</Th>
                  <Th>HTTP Code</Th>
                  <Th>Created At</Th>
                  <Th>Completed At</Th>
                  <Th>Next Retry</Th>
                  {/* Optional: Add Response Body if needed */}
                </Tr>
              </Thead>
              <Tbody>
                {deliveries.map((delivery) => (
                  <Tr key={delivery.id}>
                    <Td><Tag colorScheme={getStatusColor(delivery.status)}>{delivery.status}</Tag></Td>
                    <Td><Code>{delivery.webhook_id}</Code></Td>
                    <Td><Code>{delivery.event_id}</Code></Td>
                    <Td>{delivery.attempt_count}</Td>
                    <Td>{delivery.status_code ?? 'N/A'}</Td>
                    <Td>{new Date(delivery.created_at).toLocaleString()}</Td>
                    <Td>{delivery.completed_at ? new Date(delivery.completed_at).toLocaleString() : '-'}</Td>
                    <Td>{delivery.next_retry_at ? new Date(delivery.next_retry_at).toLocaleString() : '-'}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>

          {/* Pagination Controls */}
          <HStack mt={4} justify="space-between">
            <Text>Showing {offset + 1} - {Math.min(offset + limit, totalCount)} of {totalCount} deliveries</Text>
            <HStack>
              <Button onClick={handlePreviousPage} isDisabled={offset === 0 || loading}>
                Previous
              </Button>
              <Button onClick={handleNextPage} isDisabled={offset + limit >= totalCount || loading}>
                Next
              </Button>
            </HStack>
          </HStack>
        </>
      )}
    </Box>
  );
};

export default WebhookActivityLog;
