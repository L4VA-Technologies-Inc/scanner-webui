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
  VStack,
  HStack,
  IconButton,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  Divider,
  Text
} from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';

// Interfaces based on OpenAPI spec
interface MonitoredItem { 
  id: string; // uuid
  address: string;
  name?: string;
  description?: string;
  created_at: string; // date-time
  last_checked_at?: string; // date-time
  is_active?: boolean;
}

interface MonitoredContract extends MonitoredItem {
  contract_type?: string;
}

const Monitoring: React.FC = () => {
  const { apiKey } = useAuth();
  const toast = useToast();

  const [addresses, setAddresses] = useState<MonitoredItem[]>([]);
  const [contracts, setContracts] = useState<MonitoredContract[]>([]);

  const [newAddress, setNewAddress] = useState('');
  const [newContractAddress, setNewContractAddress] = useState('');

  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [loadingContracts, setLoadingContracts] = useState(false);
  const [errorAddresses, setErrorAddresses] = useState<string | null>(null);
  const [errorContracts, setErrorContracts] = useState<string | null>(null);

  // --- Fetching Data ---
  const fetchAddresses = useCallback(async () => {
    if (!apiKey) return;
    setLoadingAddresses(true);
    setErrorAddresses(null);
    try {
      const response = await apiClient.get<MonitoredItem[]>('/api/monitoring/addresses');
      setAddresses(response.data);
    } catch (err: any) {
      console.error("Error fetching monitored addresses:", err);
      setErrorAddresses(err.response?.data?.message || err.message || 'Failed to fetch monitored addresses');
    } finally {
      setLoadingAddresses(false);
    }
  }, [apiKey]);

  const fetchContracts = useCallback(async () => {
    if (!apiKey) return;
    setLoadingContracts(true);
    setErrorContracts(null);
    try {
      const response = await apiClient.get<MonitoredContract[]>('/api/monitoring/contracts');
      setContracts(response.data);
    } catch (err: any) {
      console.error("Error fetching monitored contracts:", err);
      setErrorContracts(err.response?.data?.message || err.message || 'Failed to fetch monitored contracts');
    } finally {
      setLoadingContracts(false);
    }
  }, [apiKey]);

  useEffect(() => {
    if (apiKey) {
      fetchAddresses();
      fetchContracts();
    } else {
      setAddresses([]);
      setContracts([]);
      setErrorAddresses('API Key not set.');
      setErrorContracts('API Key not set.');
    }
  }, [apiKey, fetchAddresses, fetchContracts]);

  // --- Adding Data ---
  const handleAddAddress = async () => {
    if (!newAddress.trim() || !apiKey) return;
    try {
      const response = await apiClient.post<MonitoredItem>('/api/monitoring/addresses', {
        address: newAddress.trim(),
        // Add name/description fields here if needed
      });
      setAddresses(prev => [...prev, response.data]); // Add the new item from response
      setNewAddress('');
      toast({ title: 'Address added', status: 'success', duration: 3000, isClosable: true });
    } catch (err: any) {
      console.error("Error adding address:", err);
      toast({ title: 'Error adding address', description: err.response?.data?.message || err.message, status: 'error', duration: 5000, isClosable: true });
    }
  };

  const handleAddContract = async () => {
    if (!newContractAddress.trim() || !apiKey) return;
    try {
      const response = await apiClient.post<MonitoredContract>('/api/monitoring/contracts', {
        address: newContractAddress.trim(),
         // Add name/description/type fields here if needed
      });
      setContracts(prev => [...prev, response.data]);
      setNewContractAddress('');
      toast({ title: 'Contract added', status: 'success', duration: 3000, isClosable: true });
    } catch (err: any) {
      console.error("Error adding contract:", err);
      toast({ title: 'Error adding contract', description: err.response?.data?.message || err.message, status: 'error', duration: 5000, isClosable: true });
    }
  };

  // --- Deleting Data ---
  const handleDeleteAddress = async (addressId: string) => {
    if (!apiKey) return;
    try {
      await apiClient.delete(`/api/monitoring/addresses/${addressId}`);
      setAddresses(prev => prev.filter(addr => addr.id !== addressId));
      toast({ title: 'Address removed', status: 'success', duration: 3000, isClosable: true });
    } catch (err: any) {
      console.error("Error removing address:", err);
      toast({ title: 'Error removing address', description: err.response?.data?.message || err.message, status: 'error', duration: 5000, isClosable: true });
    }
  };

  const handleDeleteContract = async (contractId: string) => {
     if (!apiKey) return;
    try {
      await apiClient.delete(`/api/monitoring/contracts/${contractId}`);
      setContracts(prev => prev.filter(cont => cont.id !== contractId));
      toast({ title: 'Contract removed', status: 'success', duration: 3000, isClosable: true });
    } catch (err: any) {
      console.error("Error removing contract:", err);
      toast({ title: 'Error removing contract', description: err.response?.data?.message || err.message, status: 'error', duration: 5000, isClosable: true });
    }
  };

  if (!apiKey) {
    return (
      <Box>
        <Heading size="lg" mb={4}>Address & Contract Monitoring</Heading>
        <Alert status="warning">
          <AlertIcon />
          Please enter and save your API Key to use the monitoring features.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Heading size="lg" mb={6}>Address & Contract Monitoring</Heading>

      {/* Addresses Section */}
      <VStack align="stretch" spacing={4} mb={8}>
        <Heading size="md">Monitored Addresses</Heading>
        <FormControl>
          <HStack>
            <Input
              placeholder="Enter Cardano Wallet Address" 
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
            />
            <Button onClick={handleAddAddress} isLoading={loadingAddresses}>Add Address</Button>
          </HStack>
        </FormControl>
        {loadingAddresses && <Spinner />}
        {errorAddresses && <Alert status="error"><AlertIcon />{errorAddresses}</Alert>}
        {!loadingAddresses && addresses.length === 0 && !errorAddresses && <Text>No addresses are currently monitored.</Text>}
        {!loadingAddresses && addresses.length > 0 && (
          <TableContainer>
            <Table variant='simple'>
              <Thead>
                <Tr>
                  <Th>Address</Th>
                  <Th>Created At</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {addresses.map((addr) => (
                  <Tr key={addr.id}>
                    <Td>{addr.address}</Td>
                    <Td>{new Date(addr.created_at).toLocaleString()}</Td>
                    <Td>
                      <IconButton
                        aria-label='Delete address'
                        icon={<DeleteIcon />}
                        colorScheme='red'
                        size='sm'
                        onClick={() => handleDeleteAddress(addr.id)}
                      />
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        )}
      </VStack>

      <Divider mb={8} />

      {/* Contracts Section */}
      <VStack align="stretch" spacing={4}>
        <Heading size="md">Monitored Contracts</Heading>
         <FormControl>
          <HStack>
            <Input
              placeholder="Enter Cardano Contract Address"
              value={newContractAddress}
              onChange={(e) => setNewContractAddress(e.target.value)}
            />
            <Button onClick={handleAddContract} isLoading={loadingContracts}>Add Contract</Button>
          </HStack>
        </FormControl>
        {loadingContracts && <Spinner />}
        {errorContracts && <Alert status="error"><AlertIcon />{errorContracts}</Alert>}
        {!loadingContracts && contracts.length === 0 && !errorContracts && <Text>No contracts are currently monitored.</Text>}
        {!loadingContracts && contracts.length > 0 && (
          <TableContainer>
            <Table variant='simple'>
              <Thead>
                <Tr>
                  <Th>Contract Address</Th>
                  <Th>Created At</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {contracts.map((cont) => (
                  <Tr key={cont.id}>
                    <Td>{cont.address}</Td>
                    <Td>{new Date(cont.created_at).toLocaleString()}</Td>
                    <Td>
                      <IconButton
                        aria-label='Delete contract'
                        icon={<DeleteIcon />}
                        colorScheme='red'
                        size='sm'
                        onClick={() => handleDeleteContract(cont.id)}
                      />
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        )}
      </VStack>

    </Box>
  );
};

export default Monitoring;
