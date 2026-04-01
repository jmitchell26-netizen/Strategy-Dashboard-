// main.jsx — Entry point for the React application.
// Mounts the root <App /> component into the DOM element with id="root" in index.html.

import { StrictMode } from 'react'          // StrictMode highlights potential problems during development
import { createRoot } from 'react-dom/client' // React 18+ API for rendering
import './index.css'                          // Global styles + Tailwind CSS import
import App from './App.jsx'                   // Root application component

// Find the #root div in index.html and render our app inside it
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
