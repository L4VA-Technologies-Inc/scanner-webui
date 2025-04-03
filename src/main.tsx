import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ChakraProvider } from '@chakra-ui/react'
import { AuthProvider } from './context/AuthContext'
import { WebSocketProvider } from './context/WebSocketContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <ChakraProvider> {/* Removed empty theme prop */}
      <AuthProvider>
        <WebSocketProvider> {/* Wrap with WebSocketProvider */}
          <App />
        </WebSocketProvider>
      </AuthProvider>
    </ChakraProvider>
)
