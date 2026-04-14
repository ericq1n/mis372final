import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AsgardeoProvider } from "@asgardeo/react"

createRoot(document.getElementById('root')!).render(
    <StrictMode>
    <AsgardeoProvider
      clientId="KP3GCdmrb66v3vtIiiJkkigz1nMa"
      baseUrl="https://api.asgardeo.io/t/mis372tsecurity"
      signInRedirectURL="https://mis372final.onrender.com"
      signOutRedirectURL="https://mis372final.onrender.com"
      scopes="openid profile"
    >
      <App />
    </AsgardeoProvider>
  </StrictMode>
)
