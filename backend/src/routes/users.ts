import express, { Request, Response } from 'express';
import User from '../models/User.js';
import {
  validateState,
  validatePhone,
  validateZipCode,
  validateDateOfBirth,
} from '../utils/validators.js';

const router = express.Router();

// Fields required for a profile to be considered complete.
// email/firstName/lastName come from Asgardeo at signup.
const REQUIRED_PROFILE_FIELDS = [
  'phone',
  'address',
  'city',
  'state',
  'zipCode',
  'dateOfBirth',
] as const;

function isProfileComplete(user: User): boolean {
  return REQUIRED_PROFILE_FIELDS.every((f) => {
    const v = (user as unknown as Record<string, unknown>)[f];
    return v !== null && v !== undefined && v !== '';
  });
}

function serializeUser(user: User) {
  return { ...user.toJSON(), profileComplete: isProfileComplete(user) };
}

// Apply body validation + mutation for user-editable fields.
// Returns a string error message on failure, or null on success.
function applyUserUpdates(user: User, body: Record<string, unknown>): string | null {
  const { firstName, lastName, phone, address, zipCode, city, state, dateOfBirth } = body;

  if (firstName !== undefined) {
    if (typeof firstName !== 'string' || firstName.trim() === '') {
      return 'firstName must be a non-empty string';
    }
    user.firstName = firstName.trim();
  }
  if (lastName !== undefined) {
    if (typeof lastName !== 'string' || lastName.trim() === '') {
      return 'lastName must be a non-empty string';
    }
    user.lastName = lastName.trim();
  }
  if (phone !== undefined) {
    if (!validatePhone(phone)) return 'phone must be a valid 10-digit US phone number';
    user.phone = (phone as string).replace(/\D/g, '');
  }
  if (address !== undefined) {
    if (typeof address !== 'string') return 'address must be a string';
    user.address = address;
  }
  if (zipCode !== undefined) {
    if (!validateZipCode(zipCode)) return 'zipCode must be 5 digits or ZIP+4';
    user.zipCode = (zipCode as string).trim();
  }
  if (city !== undefined) {
    if (typeof city !== 'string') return 'city must be a string';
    user.city = city;
  }
  if (state !== undefined) {
    if (!validateState(state)) return 'Invalid state code';
    user.state = state as string;
  }
  if (dateOfBirth !== undefined) {
    if (!validateDateOfBirth(dateOfBirth)) return 'dateOfBirth must be a valid date in the past';
    user.dateOfBirth = new Date(dateOfBirth as string);
  }

  // email is intentionally NOT editable here — it is owned by Asgardeo.
  return null;
}

// GET /api/users/me - Get currently authenticated user
router.get('/me', async (req: Request, res: Response) => {
  try {
    const user = await User.findByPk(req.userId!);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(serializeUser(user));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// PUT /api/users/me - Update the authenticated user's profile.
// Use this instead of PUT /:userId in the client so we never leak the sub.
router.put('/me', async (req: Request, res: Response) => {
  try {
    const user = await User.findByPk(req.userId!);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const err = applyUserUpdates(user, req.body || {});
    if (err) return res.status(400).json({ error: err });

    await user.save();
    res.json(serializeUser(user));
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// GET /api/users/:userId - Get user details
router.get('/:userId', async (req: Request, res: Response) => {
  try {
    if (req.userId !== req.params.userId) {
      console.warn(`Forbidden user lookup: target=${req.params.userId} requester=${req.userId}`);
      return res.status(403).json({ error: 'Forbidden: Cannot access other user data' });
    }

    const user = await User.findByPk(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(serializeUser(user));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// PUT /api/users/:userId - Update user details
router.put('/:userId', async (req: Request, res: Response) => {
  try {
    if (req.userId !== req.params.userId) {
      console.warn(`Forbidden user update: target=${req.params.userId} requester=${req.userId}`);
      return res.status(403).json({ error: 'Forbidden: Cannot update other user data' });
    }

    const user = await User.findByPk(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const err = applyUserUpdates(user, req.body || {});
    if (err) return res.status(400).json({ error: err });

    await user.save();
    res.json(serializeUser(user));
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

export default router;
