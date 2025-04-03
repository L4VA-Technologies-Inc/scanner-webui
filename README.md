# L4VA Webapp Frontend

This project is the frontend web application for the L4VA platform, providing monitoring and management capabilities for blockchain-related events and webhooks.

## Features

*   **Dashboard:** Overview of key metrics and recent activity.
*   **API Key Management:** Securely input and store the API key required to interact with the backend.
*   **Webhook Management:**
    *   View, create, edit, and delete webhooks.
    *   Configure webhook URL, event types, secret, and custom headers.
    *   Uses a dual-list drag-and-drop interface (`EventTypeSelector`) for intuitive selection of event types.
    *   Test webhook endpoints.
*   **Webhook Activity Log:**
    *   View historical delivery records for webhooks.
    *   Filter logs by specific webhook ID.
    *   Pagination for navigating through logs.
*   **Real-time Monitoring (via WebSocket):** Display real-time events as they occur (specifics TBD based on WebSocket implementation).

## Tech Stack

*   **Framework:** React (v18+)
*   **Build Tool:** Vite
*   **Language:** TypeScript
*   **UI Library:** Chakra UI
*   **Routing:** React Router DOM
*   **API Client:** Axios
*   **Drag & Drop:** react-beautiful-dnd
*   **Charting:** Recharts
*   **State Management:** React Context API (`AuthContext`, `WebSocketContext`)

## Project Structure

```
webapp/
├── public/         # Static assets
├── src/
│   ├── api/        # API client setup (axios instance)
│   ├── assets/     # Images, fonts, etc.
│   ├── components/ # Reusable UI components (Layout, Nav, EventTypeSelector, etc.)
│   ├── context/    # React Context providers (AuthContext, WebSocketContext)
│   ├── hooks/      # Custom React hooks (if any)
│   ├── pages/      # Page-level components (Dashboard, Webhooks, etc.)
│   ├── App.tsx     # Main application component with routing
│   ├── main.tsx    # Application entry point
│   └── index.css   # Global styles
├── .eslintrc.cjs   # ESLint configuration
├── index.html      # HTML entry point
├── package.json    # Project dependencies and scripts
├── README.md       # This file
├── spec.md         # Project specification document
├── tsconfig.json   # TypeScript configuration
└── vite.config.ts  # Vite configuration
```

## Getting Started

### Prerequisites

*   Node.js (v18 or later recommended)
*   npm (usually comes with Node.js)
*   A running instance of the L4VA backend API.

### Installation

1.  Clone the repository (if you haven't already).
2.  Navigate to the `webapp` directory:
    ```bash
    cd path/to/l4va/webapp
    ```
3.  Install dependencies:
    ```bash
    npm install
    ```

### Running the Development Server

1.  Start the Vite development server:
    ```bash
    npm run dev
    ```
2.  Open your browser and navigate to the URL provided (usually `http://localhost:5173` or similar).

### API Integration

The web application requires a connection to the L4VA backend API. Upon first launch, you will likely be prompted to enter an API Key. This key is stored in the browser's local storage via the `AuthContext` and used for subsequent API requests managed by the Axios client in `src/api/client.ts`.

## Available Scripts

In the project directory, you can run:

*   `npm run dev`: Runs the app in development mode with hot reloading.
*   `npm run build`: Builds the app for production to the `dist` folder.
*   `npm run lint`: Lints the codebase using ESLint.
*   `npm run preview`: Serves the production build locally for previewing.

## Project Specification

For detailed requirements, API endpoint definitions, and feature specifications, please refer to the [spec.md](./spec.md) file in the project root.
