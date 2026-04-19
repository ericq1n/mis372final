import express, { Request, Response } from 'express';
import { Op } from 'sequelize';
import BankAccount from '../models/BankAccount.js';
import Transaction from '../models/Transaction.js';
import { validateAccountType } from '../utils/validators.js';
import { generateAccountNumber } from '../utils/sequenceGenerator.js';

const router = express.Router();

// POST /api/accounts - Create a new account
router.post('/', async (req: Request, res: Response) => {
  try {
    const { accountType, accountName } = req.body;

    // Validate account type
    if (!validateAccountType(accountType)) {
      return res.status(400).json({ error: 'accountType must be "checking" or "savings"' });
    }

    // Generate account number (User row is guaranteed to exist by ensureUserMiddleware)
    const accountNumber = await generateAccountNumber(accountType);

    // Create account
    const account = await BankAccount.create({
      userId: req.userId!,
      accountNumber,
      accountName: accountName || undefined,
      accountType,
      balance: 0,
      apy: accountType === 'savings' ? 3 : 0,
      active: true,
    });

    res.status(201).json({ accountId: account.accountId, accountNumber: account.accountNumber });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create account' });
  }
});

// GET /api/accounts - List all user's accounts
router.get('/', async (req: Request, res: Response) => {
  try {
    const accounts = await BankAccount.findAll({
      where: { userId: req.userId! },
      order: [['createdAt', 'DESC']],
    });

    res.json(accounts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch accounts' });
  }
});

// GET /api/accounts/:accountId - Get account details
router.get('/:accountId', async (req: Request, res: Response) => {
  try {
    const account = await BankAccount.findByPk(req.params.accountId);
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    // Row-level security
    if (account.userId !== req.userId) {
      console.warn(`Forbidden access attempt: account=${account.accountId} owner=${account.userId} requester=${req.userId}`);
      return res.status(403).json({ error: 'Forbidden: Cannot access other user account' });
    }

    res.json(account);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch account' });
  }
});

// PUT /api/accounts/:accountId - Update account details
router.put('/:accountId', async (req: Request, res: Response) => {
  try {
    const account = await BankAccount.findByPk(req.params.accountId);
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    // Row-level security
    if (account.userId !== req.userId!) {
      console.warn(`Forbidden update attempt: account=${account.accountId} owner=${account.userId} requester=${req.userId}`);
      return res.status(403).json({ error: 'Forbidden: Cannot update other user account' });
    }

    const { accountName, active } = req.body;

    if (accountName !== undefined && typeof accountName !== 'string') {
      return res.status(400).json({ error: 'accountName must be a string' });
    }
    if (active !== undefined && typeof active !== 'boolean') {
      return res.status(400).json({ error: 'active must be a boolean' });
    }

    if (accountName !== undefined) account.accountName = accountName;
    if (active !== undefined) account.active = active;

    await account.save();
    res.json(account);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update account' });
  }
});

// GET /api/accounts/:accountId/transactions - List transactions for account
router.get('/:accountId/transactions', async (req: Request, res: Response) => {
  try {
    const account = await BankAccount.findByPk(req.params.accountId);
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    // Row-level security
    if (account.userId !== req.userId!) {
      console.warn(`Forbidden transactions access: account=${account.accountId} owner=${account.userId} requester=${req.userId}`);
      return res.status(403).json({ error: 'Forbidden: Cannot access other user account' });
    }

    const transactions = await Transaction.findAll({
      where: {
        [Op.or]: [
          { accountFromId: req.params.accountId },
          { accountToId: req.params.accountId },
        ],
      },
      order: [['createdAt', 'DESC']],
    });

    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

export default router;
