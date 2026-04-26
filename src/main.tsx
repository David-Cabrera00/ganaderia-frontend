import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import { router } from './router';
import { ToastProvider } from './shared/components/feedback/ToastProvider';
import { AppErrorBoundary } from './shared/components/feedback/AppErrorBoundary';
import { ThemeProvider } from './shared/providers/ThemeProvider';
import './styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <AppErrorBoundary>
        <ToastProvider>
          <RouterProvider router={router} />
        </ToastProvider>
      </AppErrorBoundary>
    </ThemeProvider>
  </React.StrictMode>,
);
