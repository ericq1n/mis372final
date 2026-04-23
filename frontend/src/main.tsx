import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@asgardeo/auth-react'
import './index.css'
import App from './App.tsx'
import ApiAuthBridge from './components/ApiAuthBridge'
import { CurrentUserProvider } from './context/CurrentUserContext'

const config = {
  clientID: import.meta.env.VITE_ASGARDEO_CLIENT_ID,
  baseUrl: `https://api.asgardeo.io/t/${import.meta.env.VITE_ASGARDEO_ORG}`,
  signInRedirectURL: import.meta.env.VITE_ASGARDEO_REDIRECT_URI,
  signOutRedirectURL: import.meta.env.VITE_ASGARDEO_REDIRECT_URI,
  scope: ['openid', 'profile', 'email', 'phone'],
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider config={config}>
        <ApiAuthBridge />
        <CurrentUserProvider>
          <App />
        </CurrentUserProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
)
