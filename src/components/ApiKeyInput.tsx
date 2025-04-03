import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Input,
  Button,
  Box,
  FormControl,
  FormLabel,
  useToast
} from '@chakra-ui/react';

const ApiKeyInput: React.FC = () => {
  const { apiKey, setApiKey } = useAuth();
  const [inputKey, setInputKey] = useState(apiKey || '');
  const toast = useToast();

  const handleSave = () => {
    let keyToSave = inputKey.trim(); // Trim initial input
    const prefix = "Bearer ";
    if (keyToSave.toLowerCase().startsWith(prefix.toLowerCase())) {
      keyToSave = keyToSave.slice(prefix.length).trim(); // Remove prefix and trim again
    }

    setApiKey(keyToSave); // Save the processed key

    toast({
      title: 'API Key Saved',
      description: "Your API Key has been saved to local storage.",
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleClear = () => {
    setInputKey('');
    setApiKey(null);
    toast({
      title: 'API Key Cleared',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };

  return (
    <Box mb={6} p={4} borderWidth="1px" borderRadius="md">
      <FormControl>
        <FormLabel>API Key</FormLabel>
        <Input
          type="password"
          placeholder="Enter your API Key"
          value={inputKey}
          onChange={(e) => setInputKey(e.target.value)}
          mb={2}
        />
        <Button colorScheme="blue" onClick={handleSave} mr={2}>Save Key</Button>
        <Button onClick={handleClear}>Clear Key</Button>
      </FormControl>
    </Box>
  );
};

export default ApiKeyInput;
