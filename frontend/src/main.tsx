import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@asgardeo/auth-react'
import './index.css'
import App from './App.tsx'

const config = {
  clientID: import.meta.env.VITE_ASGARDEO_CLIENT_ID,
  baseUrl: `https://api.asgardeo.io/t/${import.meta.env.VITE_ASGARDEO_ORG}`,
  signInRedirectURL: import.meta.env.VITE_ASGARDEO_REDIRECT_URI,
  signOutRedirectURL: import.meta.env.VITE_ASGARDEO_REDIRECT_URI,
  scope: ['openid', 'profile', 'email'],
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider config={config}>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
)
