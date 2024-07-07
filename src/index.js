import React from 'react';
import ReactDOM from 'react-dom';
import { PublicClientApplication } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';
import { msalConfig } from './authConfig';
import App from './App';
import FirestoreTest from './FirestoreTest';

const msalInstance = new PublicClientApplication(msalConfig);

const rootElement = document.getElementById('root');

const renderApp = () => {
  ReactDOM.render(
    <MsalProvider instance={msalInstance}>
      <App />
    </MsalProvider>,
    rootElement
  );
};

msalInstance.initialize().then(renderApp).catch(error => {
  console.error("Error initializing MSAL:", error);
});
