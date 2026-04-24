MIS 372 Final: 
Full-Stack Employee & Task Management SystemThis repository contains the final project for MIS 372. It is a full-stack web application featuring a React frontend, an Express/Node.js backend, and a PostgreSQL database managed via Sequelize ORM. The application includes secure authentication via Asgardeo.

An existing deployment can be found at: https://mis372final.onrender.com/ 

Features:
1.Full CRUD Functionality - Manage employees and puppies/tasks with Create, Read, Update, and Delete capabilities.
2.cSecure Authenticationc-cIntegrated with Asgardeo (WSO2) for OIDC-compliant user login and identity management.
3. Relational Database - Persistent storage using a PostgreSQL database hosted on AWS RDS.
4. Responsive UI - Built with React and Vite for a fast, modern user experience.
5. Cloud Deployment - Architected for deployment on Render.
6. Tech StackFrontend - React, Vite, Axios, React Router, @asgardeo/react.
7. Backend - Node.js, Express, Sequelize ORM.
8. Database - PostgreSQL.
9. Authentication - Asgardeo.

Environment Variables:
To run this project locally or on Render, you must configure the following environment variables.Backend (/backend/.env)

DATABASE_URL = The full connection string for your PostgreSQL/RDS instance.DB_SCHEMA = The specific database schema (e.g., app).
ASGARDEO_ORG = Your Asgardeo Organization name.
PORT = The server port (Default: 5001).
PGSSLMODE = Set to require for secure RDS connections.
AZURE_FOUNDRY_ENDPOINT = Custom Microsoft Azure AI endpoint
AZURE_FOUNDRY_KEY = AI endpoint key
AZURE_FOUNDRY_DEPLOYMENT = gpt-4o, or other model
AZURE_FOUNDRY_API_VERSION = 2024-12-01-preview, model details

Frontend (/frontend/.env)
VITE_API_BASE_URL = The URL of your deployed backend (or http://localhost:5001).VITE_ASGARDEO_CLIENT_ID = The Client ID from your Asgardeo Application.VITE_ASGARDEO_ORG = Your Asgardeo Organization name.
VITE_ASGARDEO_REDIRECT_URI = The callback URI (e.g., https://[frontend-url]/auth/callback).

Installation & Setup:
1. Clone the repository
Bashgit clone https://github.com/ericq1n/mis372final.git
cd mis372final
2. Backend SetupBash
cd backend
npm install
# Create your .env file and add the variables listed above
npm start
3. Frontend Setup
Bashcd ../frontend
npm install
# Create your .env file and add the variables listed above
npm run dev

Deployment:
(Render)Backend Service Root Directory: backend
 Build Command: npm install && npm run build
 Start Command: node server.js
 Environment Variables: Add all variables from the Backend section above.
 
 Frontend (Static Site)
 Root Directory: frontend
 Build Command: npm run build
 Publish Directory: dist
 Rewrites/Redirects: Add a rewrite rule for /* to /index.html to support React Router.
 
 Authentication Note:
 Ensure that your Redirect URIs and Allowed Origins in the Asgardeo Console match your deployment URLs exactly. A mismatch will result in a "Callback URL mismatch" error during login.