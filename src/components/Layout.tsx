import React, { ReactNode } from 'react';
import { Box, Flex, Heading, Link as ChakraLink, VStack, Divider, useColorModeValue } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import ApiKeyInput from './ApiKeyInput';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const bgColor = useColorModeValue('gray.100', 'gray.900');
  const sidebarBgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Flex h="100vh" bg={bgColor}>
      {/* Sidebar */}
      <Box
        w="250px"
        bg={sidebarBgColor}
        p={5}
        borderRight="1px"
        borderColor={borderColor}
        display="flex"
        flexDirection="column"
      >
        <Heading size="md" mb={6}>Cardano Scanner</Heading>
        <VStack align="stretch" mb={6}>
          {/* Use 'as' prop to integrate ChakraLink with RouterLink */}
          <ChakraLink as={RouterLink} to="/" _hover={{ textDecoration: 'none', color: 'blue.500' }}>Dashboard</ChakraLink>
          <ChakraLink as={RouterLink} to="/monitoring" _hover={{ textDecoration: 'none', color: 'blue.500' }}>Monitoring</ChakraLink>
          <ChakraLink as={RouterLink} to="/webhooks" _hover={{ textDecoration: 'none', color: 'blue.500' }}>Webhooks</ChakraLink>
          <ChakraLink as={RouterLink} to="/webhook-activity" _hover={{ textDecoration: 'none', color: 'blue.500' }}>Webhook Activity</ChakraLink>
          <ChakraLink as={RouterLink} to="/blockchain-query" _hover={{ textDecoration: 'none', color: 'blue.500' }}>Blockchain Query</ChakraLink>
        </VStack>
        <Divider my={4} />
        <ApiKeyInput />
        {/* Footer or additional links can go here */}
      </Box>

      {/* Main Content Area */}
      <Box flex="1" p={10} overflowY="auto">
        {children}
      </Box>
    </Flex>
  );
};

export default Layout;
