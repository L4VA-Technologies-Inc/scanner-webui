# Project Specification

## Overview

This document outlines the specifications for the web application.

## Configuration

- The application is built using React and Vite.
- It was originally part of a larger project but has been moved to run independently.

## Features

1.  **API Key Management:**
    *   Input and save API key to local storage.
    *   Clear API key from local storage.
    *   Use the API key in subsequent API requests (`Authorization: Bearer <key>`).
    *   Component: `src/components/ApiKeyInput.tsx`

2.  **Dashboard:**
    *   Display API health status fetched from `GET /health`.
    *   Shows API status and timestamp.
    *   Displays counts of Monitored Addresses, Monitored Contracts, and Registered Webhooks fetched from their respective `GET` endpoints.
    *   Connects to the shared `WebSocketContext`.
    *   Displays a Pie chart summarizing recent webhook delivery statuses (success, failed/error) based on messages from the WebSocket context.
    *   Uses Chakra UI `Stat` components for counts and `Recharts` for the Pie chart.
    *   Page: `src/pages/Dashboard.tsx`

3.  **Monitoring Management:**
    *   View monitored Cardano addresses (`GET /api/monitoring/addresses`).
    *   Add addresses to monitor (`POST /api/monitoring/addresses`).
    *   Remove addresses from monitoring (`DELETE /api/monitoring/addresses/{addressId}`).
    *   View monitored Cardano contracts (`GET /api/monitoring/contracts`).
    *   Add contracts to monitor (`POST /api/monitoring/contracts`).
    *   Remove contracts from monitoring (`DELETE /api/monitoring/contracts/{contractId}`).
    *   Includes loading states and error handling.
    *   Page: `src/pages/Monitoring.tsx`

4.  **Webhook Management:**
    *   View registered webhooks (`GET /api/webhooks`).
    *   Register a new webhook (`POST /api/webhooks`).
    *   Update an existing webhook (`PUT /api/webhooks/{webhookId}`).
    *   Delete a webhook (`DELETE /api/webhooks/{webhookId}`).
    *   Trigger a test notification for a webhook (`POST /api/webhooks/{webhookId}/test`).
    *   Modal for creating/editing webhooks (Name, URL, Event Types, Secret, Headers).
    *   Uses a custom `EventTypeSelector` component (`src/components/EventTypeSelector.tsx`) for managing Event Types, allowing users to drag and drop types between "Available" and "Selected" lists.
    *   Includes loading states and error handling.
    *   Page: `src/pages/Webhooks.tsx`

5.  **Webhook Activity Log:**
    *   Fetches and displays historical webhook delivery records from the `/api/deliveries` endpoint.
    *   Displays data in a sortable, paginated table.
    *   Supports filtering deliveries by `webhookId` via URL parameters (e.g., `/webhook-activity?webhookId=...`).
    *   Shows connection status.
    *   Requires API Key.
    *   Page: `src/pages/WebhookActivityLog.tsx`

## API Interaction

*   **REST API:**
    *   Client: Axios instance configured in `src/api/client.ts`.
    *   Authentication: `Authorization: Bearer <apiKey>` header.
    *   Specification: `openapi.yaml` (Not provided in context, assumed existing).
    *   Endpoints Used:
        *   `GET /health`
        *   `GET /api/monitoring/addresses`
        *   `POST /api/monitoring/addresses`
        *   `DELETE /api/monitoring/addresses/{addressId}`
        *   `GET /api/monitoring/contracts`
        *   `POST /api/monitoring/contracts`
        *   `DELETE /api/monitoring/contracts/{contractId}`
        *   `GET /api/webhooks`
        *   `POST /api/webhooks`
        *   `PUT /api/webhooks/{webhookId}`
        *   `DELETE /api/webhooks/{webhookId}`
        *   `POST /api/webhooks/{webhookId}/test`
        *   `GET /api/deliveries`

## Shared State Management

*   **`AuthContext` (`src/context/AuthContext.tsx`):** Manages API key state and persistence in local storage.
*   **`WebSocketContext` (`src/context/WebSocketContext.tsx`):** 
    *   Manages the WebSocket connection using the API key from `AuthContext`.
    *   Stores a history of the last N received webhook activity messages (currently N=100).
    *   Provides `readyState`, `connectionStatus`, and `messageHistory` to consumers (`Dashboard`).

## Dependencies

*   `react`, `react-dom`
*   `react-router-dom` (for routing)
*   `axios` (for REST API calls)
*   `react-beautiful-dnd`, `@types/react-beautiful-dnd` (for drag-and-drop UI)
*   `recharts` (for displaying charts on the dashboard)

## Project Structure

*   `public/`: Static assets.
*   `src/`: Source code.
    *   `api/`: API client setup (`client.ts`).
    *   `assets/`: Image or font assets.
    *   `components/`: Reusable UI components (`ApiKeyInput.tsx`, `Layout.tsx`, `Nav.tsx`, `EventTypeSelector.tsx`).
    *   `context/`: React context providers (`AuthContext.tsx`, `WebSocketContext.tsx`).
    *   `hooks/`: Custom React hooks.
    *   `pages/`: Page-level components (`Dashboard.tsx`, `Monitoring.tsx`, `Webhooks.tsx`, `WebhookActivityLog.tsx`).
