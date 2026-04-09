import express from 'express';
import cors from 'cors';
import { Sequelize, DataTypes } from 'sequelize';
import dotenv from 'dotenv';
import * as jose from 'jose';

// Load environment variables from .env file
dotenv.config();
const DB_SCHEMA = process.env.DB_SCHEMA || 'app';
const useSsl = process.env.PGSSLMODE === 'require';
const PORT = process.env.PORT || 5001

//Instantiate Asgardeo JWK
const ASGARDEO_ORG = process.env.ASGARDEO_ORG || "utexas";
const JWKS_URI = `https://api.asgardeo.io/t/${ASGARDEO_ORG}/oauth2/jwks`;

// Initialize Express app
const app = express();
app.use(cors());
app.use(express.json());

// JWT Auth Middleware
// JWT auth: verify Bearer token with Asgardeo JWKS, set req.userId from payload.sub
async function authMiddleware(req, res, next) {
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
    const JWKS = jose.createRemoteJWKSet(new URL(JWKS_URI));
    const { payload } = await jose.jwtVerify(token, JWKS);
    req.userId = payload.sub; // Asgardeo's unique user id → used for row-level auth
    return next();
    } catch (err) {
    console.error('JWT verification failed:', err.message);
    return res.status(401).json({
        error: 'Invalid or expired token',
        detail: err.message,
    });
    }
}
//Apply middleware to all routes
app.use('/api/', authMiddleware);

// Create database connection with ORM
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER,
    process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 5432,
    dialect: 'postgres',
    dialectOptions: useSsl
    ? {
    ssl: {
    require: true,
    rejectUnauthorized: false,
    },
    }
    : undefined,
    define: {
    schema: DB_SCHEMA,
    },
});

// Define database model
const puppies = sequelize.define('puppies', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(100), allowNull: false },
    breed: { type: DataTypes.STRING(100), allowNull: false },
    age: { type: DataTypes.INTEGER, allowNull: false },
    user_id: { type: DataTypes.STRING(100), allowNull: true }
}, {
    timestamps: false,
});

// API routes
//GET all
app.get('/api/', async (req, res) => {
    try {
        const puppiesList = await puppies.findAll({ where: { user_id: req.userId } });
        res.json(puppiesList);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch puppies' });
    }
});

//GET by id
app.get('/api/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const puppy = await puppies.findByPk(id, { where: { user_id: req.userId } });
        if (puppy) {
            res.json(puppy);
        } else {
            res.status(404).json({ error: 'Puppy not found' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch puppy' });
    }
});

//POST
app.post('/api/', async (req, res) => {
    try {
        const { name, breed, age, user_id } = req.body; 
        const newPuppy = await puppies.create({ name, breed, age, user_id: req.userId });
        res.status(201).json(newPuppy);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create puppy' });
    }
});

//PUT by id
app.put('/api/:id', async (req, res) => {
    try {
        const id = req.params.id;  
        const { name, breed, age, user_id } = req.body;
        const puppy = await puppies.findByPk(id, { where: { user_id: req.userId } });
        if (puppy) {
            puppy.update({ name, breed, age, user_id: req.userId });
            res.json(puppy);
        } else {
            res.status(404).json({ error: 'Puppy not found' });
        }  
    } catch (err) {
        res.status(500).json({ error: 'Failed to update puppy' });
    }
});

//DELETE by id
app.delete('/api/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const puppy = await puppies.findByPk(id, { where: { user_id: req.userId } });
        if (puppy) {
            await puppy.destroy();
            res.json({ message: 'Puppy deleted' });
        } else {
            res.status(404).json({ error: 'Puppy not found' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete puppy' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  });

// Start server
const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected...');
        await puppies.sync({ alter: true });
        console.log(`Puppies model synced in schema "${DB_SCHEMA}".`);
        app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
    } catch (err) {
        console.error('Error: ', err);
        process.exit(1); // Exit with failure code
    }
};
startServer();