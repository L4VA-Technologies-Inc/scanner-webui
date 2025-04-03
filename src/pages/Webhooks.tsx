import React, { useState, useEffect, useCallback } from 'react';
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
  Button,
  Input,
  FormControl,
  FormLabel,
  VStack,
  HStack,
  IconButton,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Textarea,
  Wrap,
  WrapItem,
  Tag,
} from '@chakra-ui/react';
import { DeleteIcon, EditIcon, CheckIcon, AddIcon, ViewIcon } from '@chakra-ui/icons'; 
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';
import EventTypeSelector from '../components/EventTypeSelector'; 
import { useNavigate } from 'react-router-dom';

interface Webhook {
  id: string; 
  name: string;
  url: string;
  event_types: string[];
  secret?: string; 
  headers?: Record<string, string>; 
  created_at: string; 
}

interface WebhookInput {
  name: string;
  url: string;
  event_types: string[];
  secret?: string;
  headers?: Record<string, string>; 
}

// Define all possible event types based on the API spec
const AVAILABLE_EVENT_TYPES = [
  'address_transaction',
  'contract_execution',
  'token_mint',
  'token_burn',
  'transaction_received',
  'transaction_sent',
  'ada_received',
  'ada_sent',
  'token_received',
  'token_sent',
  'metadata_added'
];

const Webhooks: React.FC = () => {
  const { apiKey } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure(); 

  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentWebhook, setCurrentWebhook] = useState<Webhook | null>(null); 
  const [webhookInput, setWebhookInput] = useState<WebhookInput>({ name: '', url: '', event_types: [] });
  const [headersJson, setHeadersJson] = useState<string>(''); 

  const fetchWebhooks = useCallback(async () => {
    if (!apiKey) return;
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<Webhook[]>('/api/webhooks');
      setWebhooks(response.data);
    } catch (err: any) {
      console.error("Error fetching webhooks:", err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch webhooks');
    } finally {
      setLoading(false);
    }
  }, [apiKey]);

  useEffect(() => {
    if (apiKey) {
      fetchWebhooks();
    } else {
      setWebhooks([]);
      setError('API Key not set.');
    }
  }, [apiKey, fetchWebhooks]);

  const handleOpenCreateModal = () => {
    setCurrentWebhook(null);
    setWebhookInput({ name: '', url: '', event_types: [] });
    setHeadersJson('');
    onOpen();
  };

  const handleOpenEditModal = (webhook: Webhook) => {
    setCurrentWebhook(webhook);
    setWebhookInput({ 
      name: webhook.name,
      url: webhook.url,
      event_types: webhook.event_types,
      secret: webhook.secret || ''
    });
    setHeadersJson(webhook.headers ? JSON.stringify(webhook.headers, null, 2) : '');
    onOpen();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setWebhookInput(prev => ({ ...prev, [name]: value }));
  };

  const handleEventTypesChange = (tags: string[]) => {
    setWebhookInput(prev => ({ ...prev, event_types: tags }));
  };

  const handleHeadersChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setHeadersJson(e.target.value);
  };

  const handleSaveWebhook = async () => {
    if (!apiKey) return;

    let parsedHeaders: Record<string, string> | undefined = undefined;
    if (headersJson.trim()) {
      try {
        parsedHeaders = JSON.parse(headersJson);
        if (typeof parsedHeaders !== 'object' || Array.isArray(parsedHeaders)) {
          throw new Error('Headers must be a valid JSON object.');
        }
      } catch (e: any) {
        toast({ title: 'Invalid Headers JSON', description: e.message, status: 'error', duration: 5000, isClosable: true });
        return;
      }
    }

    const payload: WebhookInput = {
      ...webhookInput,
      secret: webhookInput.secret?.trim() || undefined, 
      headers: parsedHeaders,
    };

    setLoading(true);
    try {
      let response: import('axios').AxiosResponse<Webhook>; 
      if (currentWebhook) {
        response = await apiClient.put<Webhook>(`/api/webhooks/${currentWebhook.id}`, payload);
        setWebhooks(prev => prev.map(wh => wh.id === currentWebhook.id ? response.data : wh));
        toast({ title: 'Webhook updated', status: 'success', duration: 3000, isClosable: true });
      } else {
        response = await apiClient.post<Webhook>('/api/webhooks', payload);
        setWebhooks(prev => [...prev, response.data]);
        toast({ title: 'Webhook created', status: 'success', duration: 3000, isClosable: true });
      }
      onClose();
    } catch (err: any) {
      console.error("Error saving webhook:", err);
      toast({ title: 'Error saving webhook', description: err.response?.data?.message || err.message, status: 'error', duration: 5000, isClosable: true });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWebhook = async (webhookId: string) => {
    if (!apiKey) return;
    setLoading(true);
    try {
      await apiClient.delete(`/api/webhooks/${webhookId}`);
      setWebhooks(prev => prev.filter(wh => wh.id !== webhookId));
      toast({ title: 'Webhook deleted', status: 'success', duration: 3000, isClosable: true });
    } catch (err: any) {
      console.error("Error deleting webhook:", err);
      toast({ title: 'Error deleting webhook', description: err.response?.data?.message || err.message, status: 'error', duration: 5000, isClosable: true });
    } finally {
      setLoading(false);
    }
  };

  const handleTestWebhook = async (webhookId: string) => {
    if (!apiKey) return;
    toast({ title: 'Sending test notification...', status: 'info', duration: 2000 });
    try {
      await apiClient.post(`/api/webhooks/${webhookId}/test`);
      toast({ title: 'Test notification sent successfully', status: 'success', duration: 3000, isClosable: true });
    } catch (err: any) {
      console.error("Error sending test notification:", err);
      toast({ title: 'Error sending test notification', description: err.response?.data?.message || err.message, status: 'error', duration: 5000, isClosable: true });
    }
  };

  if (!apiKey) {
    return (
      <Box>
        <Heading size="lg" mb={4}>Webhooks Management</Heading>
        <Alert status="warning">
          <AlertIcon />
          Please enter and save your API Key to manage webhooks.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Heading size="lg" mb={4}>Webhooks Management</Heading>

      <Button leftIcon={<AddIcon />} onClick={handleOpenCreateModal} colorScheme="blue" mb={4}>
        Create New Webhook
      </Button>

      {loading && !webhooks.length && <Spinner />}
      {error && <Alert status="error" mb={4}><AlertIcon />{error}</Alert>}
      {!loading && webhooks.length === 0 && !error && (
        <Text mb={4}>No webhooks are currently configured.</Text>
      )}

      {!loading && webhooks.length > 0 && (
        <TableContainer>
          <Table variant='simple'>
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th>URL</Th>
                <Th>Event Types</Th>
                <Th>Created At</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {webhooks.map((wh) => (
                <Tr key={wh.id}>
                  <Td>{wh.name}</Td>
                  <Td>{wh.url}</Td>
                  <Td>
                    <Wrap spacing={2}>
                      {(wh.event_types || []).map((type) => (
                        <WrapItem key={type}>
                          <Tag size="sm">{type}</Tag>
                        </WrapItem>
                      ))}
                    </Wrap>
                  </Td>
                  <Td>{new Date(wh.created_at).toLocaleString()}</Td>
                  <Td>
                    <HStack spacing={2}>
                      <IconButton
                        aria-label="View Deliveries"
                        icon={<ViewIcon />}
                        size="sm"
                        colorScheme="blue"
                        onClick={() => navigate(`/webhook-activity?webhookId=${wh.id}`)}
                        isDisabled={!apiKey}
                      />
                      <IconButton
                        aria-label='Test webhook'
                        icon={<CheckIcon />}
                        colorScheme='green'
                        size='sm'
                        onClick={() => handleTestWebhook(wh.id)}
                        title='Send Test Notification'
                      />
                       <IconButton
                        aria-label='Edit webhook'
                        icon={<EditIcon />}
                        colorScheme='yellow'
                        size='sm'
                        onClick={() => handleOpenEditModal(wh)}
                      />
                      <IconButton
                        aria-label='Delete webhook'
                        icon={<DeleteIcon />}
                        colorScheme='red'
                        size='sm'
                        onClick={() => handleDeleteWebhook(wh.id)}
                      />
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      )}

      {/* Create/Edit Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{currentWebhook ? 'Edit Webhook' : 'Create New Webhook'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Name</FormLabel>
                <Input name="name" value={webhookInput.name} onChange={handleInputChange} placeholder='Webhook Name' />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>URL</FormLabel>
                <Input name="url" value={webhookInput.url} onChange={handleInputChange} placeholder='https://your-endpoint.com/webhook' type='url' />
              </FormControl>

              <FormControl isRequired>
                <EventTypeSelector
                  availableTypes={AVAILABLE_EVENT_TYPES}
                  selectedTypes={webhookInput.event_types}
                  onChange={handleEventTypesChange} // Existing handler works
                />
              </FormControl>

               <FormControl>
                <FormLabel>Secret (Optional)</FormLabel>
                <Input name="secret" value={webhookInput.secret || ''} onChange={handleInputChange} placeholder='Optional verification secret' />
              </FormControl>

               <FormControl>
                <FormLabel>Headers (Optional JSON Object)</FormLabel>
                <Textarea
                  name="headers"
                  value={headersJson}
                  onChange={handleHeadersChange}
                  placeholder='{ "X-Custom-Header": "value" }'
                  rows={3}
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme='blue' mr={3} onClick={handleSaveWebhook} isLoading={loading}>
              Save
            </Button>
            <Button variant='ghost' onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

    </Box>
  );
};

export default Webhooks;
