import React, { createContext, useState, useEffect, useContext, ReactNode, useMemo } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { useAuth } from './AuthContext';

// Re-define types here or import from a shared types file if created
interface BaseMessage { type: string; }
interface BaseDeliveryMessage extends BaseMessage { deliveryId: string; webhookId: string; eventId: string; }
interface InfoMessage extends BaseMessage { type: 'info'; message: string; }
interface DeliveryAttemptMessage extends BaseDeliveryMessage { type: 'delivery_attempt'; eventType: string; url: string; attempt: number; }
interface DeliverySuccessMessage extends BaseDeliveryMessage { type: 'delivery_success'; statusCode: number; response?: object; }
interface DeliveryFailedMessage extends BaseDeliveryMessage { type: 'delivery_failed'; statusCode?: number; response?: object; reason: string; }
interface DeliveryErrorMessage extends BaseDeliveryMessage { type: 'delivery_error'; error: string; }
export type WebhookActivityPayload = InfoMessage | DeliveryAttemptMessage | DeliverySuccessMessage | DeliveryFailedMessage | DeliveryErrorMessage;

interface WebSocketContextState {
  readyState: ReadyState;
  messageHistory: WebhookActivityPayload[];
  connectionStatus: string;
}

const WebSocketContext = createContext<WebSocketContextState | undefined>(undefined);

const MAX_HISTORY_LENGTH = 100; // Max messages to keep in history

export const WebSocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { apiKey } = useAuth();
  const [socketUrl, setSocketUrl] = useState<string | null>(null);
  const [messageHistory, setMessageHistory] = useState<WebhookActivityPayload[]>([]);

  useEffect(() => {
    if (apiKey) {
      // Use environment variable or config for URL later if needed
      const devUrl = `ws://localhost:3000?apiKey=${encodeURIComponent(apiKey)}`;
      setSocketUrl(devUrl);
      console.log(`WebSocket URL set to: ${devUrl}`);
    } else {
      console.log('WebSocket URL cleared due to missing API key.');
      setSocketUrl(null);
      setMessageHistory([]); // Clear history if API key is removed
    }
  }, [apiKey]);

  const { lastMessage, readyState } = useWebSocket(socketUrl, {
    shouldReconnect: () => true,
    reconnectAttempts: 10,
    reconnectInterval: (attemptNumber) => Math.min(Math.pow(2, attemptNumber) * 1000, 30000), // Exponential backoff
    onOpen: () => console.log('WebSocket connection opened'),
    onClose: (event) => console.log('WebSocket connection closed', event),
    onError: (event) => console.error('WebSocket error:', event),
    filter: (message: MessageEvent<any>): boolean => message.data !== null,
    retryOnError: true,
  }, !!socketUrl); // Only connect if socketUrl is not null

  useEffect(() => {
    if (lastMessage !== null) {
      try {
        const parsedMessage = JSON.parse(lastMessage.data);
        if (parsedMessage && typeof parsedMessage.type === 'string') {
          setMessageHistory((prev) => 
            [parsedMessage as WebhookActivityPayload, ...prev].slice(0, MAX_HISTORY_LENGTH)
          );
        } else {
          console.warn('Received WebSocket message with invalid format:', lastMessage.data);
        }
      } catch (e) {
        console.error('Failed to parse WebSocket message:', e, 'Raw data:', lastMessage.data);
      }
    }
  }, [lastMessage]);

  const connectionStatus = useMemo(() => ({
    [ReadyState.CONNECTING]: 'Connecting',
    [ReadyState.OPEN]: 'Open',
    [ReadyState.CLOSING]: 'Closing',
    [ReadyState.CLOSED]: 'Closed',
    [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
  }[readyState]), [readyState]);

  const value = useMemo(() => ({
    readyState,
    messageHistory,
    connectionStatus,
  }), [readyState, messageHistory, connectionStatus]);

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocketContext = (): WebSocketContextState => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
};
