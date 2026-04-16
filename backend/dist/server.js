import express from 'express';
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
import authRouter from './routes/auth.js';
// Load environment variables
dotenv.config();
const ASGARDEO_ORG = process.env.ASGARDEO_ORG || 'utexas';
const JWKS_URI = `https://api.asgardeo.io/t/${ASGARDEO_ORG}/oauth2/jwks`;
const PORT = process.env.PORT || 5001;
// Initialize Express app
const app = express();
app.use(cors({ origin: true }));
app.use(express.json());
// JWT Auth Middleware
async function authMiddleware(req, res, next) {
    const authHeader = (req.headers.authorization || '').trim();
    if (!authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            error: 'Missing auth',
            detail: 'Send Authorization: Bearer <access_token>',
        });
    }
    const token = authHeader.slice(7).trim();
    // Development: Allow test tokens for testing without Asgardeo integration
    if (token.startsWith('test_jwt_')) {
        // Extract userId from test token (format: test_jwt_<code>)
        const parts = token.split('_');
        req.userId = 'test_user_' + (parts[2] || 'dev');
        return next();
    }
    const looksLikeJwt = token && token.split('.').length === 3;
    if (!looksLikeJwt) {
        return res.status(401).json({
            error: 'Access token is not a JWT. In Asgardeo, set your app to use JWT access tokens (Protocol tab).',
        });
    }
    try {
        const JWKS = jose.createRemoteJWKSet(new URL(JWKS_URI));
        const { payload } = await jose.jwtVerify(token, JWKS);
        req.userId = payload.sub;
        return next();
    }
    catch (err) {
        return res.status(401).json({
            error: 'Invalid or expired token',
            detail: err instanceof Error ? err.message : 'Unknown error',
        });
    }
}
// Register public auth routes (NO auth required)
app.use('/api/auth', authRouter);
// Apply auth middleware to other /api routes
app.use('/api/', authMiddleware);
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
    }
    catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
}
startServer();
export default app;
//# sourceMappingURL=server.js.map