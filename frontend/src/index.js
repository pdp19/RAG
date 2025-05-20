
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './styles/theme';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <BrowserRouter>
  <React.StrictMode>
  <ThemeProvider theme={theme}>
  <CssBaseline />
    <App />
    </ThemeProvider>
  </React.StrictMode>
  </BrowserRouter>
);

reportWebVitals();
