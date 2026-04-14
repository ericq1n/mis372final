import express from 'express';
import User from '../models/User.js';
import { validateState } from '../utils/validators.js';
const router = express.Router();
// GET /api/users/:userId - Get user details
router.get('/:userId', async (req, res) => {
    try {
        // Row-level security: user can only access their own data
        if (req.userId !== req.params.userId) {
            return res.status(403).json({ error: 'Forbidden: Cannot access other user data' });
        }
        const user = await User.findByPk(req.params.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});
// PUT /api/users/:userId - Update user details
router.put('/:userId', async (req, res) => {
    try {
        // Row-level security
        if (req.userId !== req.params.userId) {
            return res.status(403).json({ error: 'Forbidden: Cannot update other user data' });
        }
        const user = await User.findByPk(req.params.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const { firstName, lastName, phone, address, zipCode, city, state } = req.body;
        // Validate updatable fields
        if (firstName !== undefined && typeof firstName !== 'string') {
            return res.status(400).json({ error: 'firstName must be a string' });
        }
        if (lastName !== undefined && typeof lastName !== 'string') {
            return res.status(400).json({ error: 'lastName must be a string' });
        }
        if (phone !== undefined && typeof phone !== 'string') {
            return res.status(400).json({ error: 'phone must be a string' });
        }
        if (address !== undefined && typeof address !== 'string') {
            return res.status(400).json({ error: 'address must be a string' });
        }
        if (zipCode !== undefined && typeof zipCode !== 'string') {
            return res.status(400).json({ error: 'zipCode must be a string' });
        }
        if (city !== undefined && typeof city !== 'string') {
            return res.status(400).json({ error: 'city must be a string' });
        }
        if (state !== undefined && !validateState(state)) {
            return res.status(400).json({ error: 'Invalid state code' });
        }
        // Update user
        if (firstName !== undefined)
            user.firstName = firstName;
        if (lastName !== undefined)
            user.lastName = lastName;
        if (phone !== undefined)
            user.phone = phone;
        if (address !== undefined)
            user.address = address;
        if (zipCode !== undefined)
            user.zipCode = zipCode;
        if (city !== undefined)
            user.city = city;
        if (state !== undefined)
            user.state = state;
        await user.save();
        res.json(user);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to update user' });
    }
});
export default router;
//# sourceMappingURL=users.js.map