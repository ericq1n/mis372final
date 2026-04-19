import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import * as jose from 'jose';
import sequelize from './config/database.js';
import User from './models/User.js';
import BankAccount from './models/BankAccount.js';
import Transaction from './models/Transaction.js';
import usersRouter from './routes/users.js';
import accountsRouter from './routes/accounts.js';
import transactionsRouter from './routes/transactions.js';

// Load environment variables
dotenv.config();

const ASGARDEO_ORG = process.env.ASGARDEO_ORG || 'utexas';
const ASGARDEO_BASE = `https://api.asgardeo.io/t/${ASGARDEO_ORG}`;
const JWKS_URI = `${ASGARDEO_BASE}/oauth2/jwks`;
const USERINFO_URI = `${ASGARDEO_BASE}/oauth2/userinfo`;
const PORT = process.env.PORT || 5001;

// Reuse a single JWKS instance so keys are cached across requests
const JWKS = jose.createRemoteJWKSet(new URL(JWKS_URI));

// Initialize Express app
const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// Extend Express Request to include userId
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      accessToken?: string;
    }
  }
}

// JWT Auth Middleware
async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = (req.headers.authorization || '').trim();

  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Missing auth',
      detail: 'Send Authorization: Bearer <access_token>',
    });
  }

  const token = authHeader.slice(7).trim();

  const looksLikeJwt = token && token.split('.').length === 3;

  if (!looksLikeJwt) {
    return res.status(401).json({
      error: 'Access token is not a JWT. In Asgardeo, set your app to use JWT access tokens (Protocol tab).',
    });
  }

  try {
    const { payload } = await jose.jwtVerify(token, JWKS);
    req.userId = payload.sub as string;
    req.accessToken = token;
    return next();
  } catch (err) {
    return res.status(401).json({
      error: 'Invalid or expired token',
      detail: err instanceof Error ? err.message : 'Unknown error',
    });
  }
}

// Just-in-time user provisioning. Runs after authMiddleware.
// If the authenticated Asgardeo user has no row in our DB yet, fetch their
// profile from Asgardeo's /userinfo endpoint and create one.
async function ensureUserMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const existing = await User.findByPk(req.userId!);
    if (existing) return next();

    const resp = await fetch(USERINFO_URI, {
      headers: { Authorization: `Bearer ${req.accessToken}` },
    });

    if (!resp.ok) {
      return res.status(502).json({
        error: 'Could not provision user: failed to fetch userinfo from Asgardeo',
        status: resp.status,
      });
    }

    const info = (await resp.json()) as Record<string, unknown>;

    const email =
      (typeof info.email === 'string' && info.email) ||
      (typeof info.username === 'string' && info.username) ||
      `${req.userId}@placeholder.local`;

    const firstName =
      (typeof info.given_name === 'string' && info.given_name) ||
      (typeof info.name === 'string' && (info.name as string).split(' ')[0]) ||
      'User';

    const lastName =
      (typeof info.family_name === 'string' && info.family_name) ||
      (typeof info.name === 'string' && (info.name as string).split(' ').slice(1).join(' ')) ||
      '';

    await User.create({
      userId: req.userId!,
      email,
      firstName,
      lastName: lastName || 'Unknown',
      active: true,
    });

    return next();
  } catch (err) {
    console.error('ensureUserMiddleware failed:', err);
    return res.status(500).json({
      error: 'Failed to provision user',
      detail: err instanceof Error ? err.message : 'Unknown error',
    });
  }
}

// Apply auth + user-provisioning middleware to /api routes
app.use('/api/', authMiddleware);
app.use('/api/', ensureUserMiddleware);

// Register protected routes
app.use('/api/users', usersRouter);
app.use('/api/accounts', accountsRouter);
app.use('/api/transactions', transactionsRouter);

// Initialize database and start server
async function startServer() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('Database connection established');

    // Set up model associations
    BankAccount.belongsTo(User, { foreignKey: 'userId' });
    Transaction.belongsTo(BankAccount, { foreignKey: 'accountFromId', as: 'fromAccount' });
    Transaction.belongsTo(BankAccount, { foreignKey: 'accountToId', as: 'toAccount' });

    // Sync models with database
    await sequelize.sync({ alter: true });
    console.log('Database schema synced');

    // Start server
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();

export default app;
