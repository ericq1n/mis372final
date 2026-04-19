import express, { Request, Response } from 'express';
import { Op } from 'sequelize';
import BankAccount from '../models/BankAccount.js';
import Transaction from '../models/Transaction.js';
import { validateAmount } from '../utils/validators.js';

const router = express.Router();

// POST /api/transactions - Create a new transaction
router.post('/', async (req: Request, res: Response) => {
  try {
    const { accountFromId, accountToId, type, amount } = req.body;

    // Validate required fields
    if (!accountToId) {
      return res.status(400).json({ error: 'accountToId is required' });
    }
    if (!type || !['deposit', 'withdrawal', 'transfer'].includes(type)) {
      return res.status(400).json({ error: 'type must be deposit, withdrawal, or transfer' });
    }
    if (!validateAmount(amount)) {
      return res.status(400).json({ error: 'amount must be a positive number with max 2 decimals' });
    }

    // Validate business logic
    if (type === 'deposit' && accountFromId) {
      return res.status(400).json({ error: 'Deposit cannot have accountFromId' });
    }
    if (type === 'withdrawal' && !accountFromId) {
      return res.status(400).json({ error: 'Withdrawal requires accountFromId' });
    }
    if (type === 'transfer' && !accountFromId) {
      return res.status(400).json({ error: 'Transfer requires accountFromId' });
    }

    // Fetch destination account
    const toAccount = await BankAccount.findByPk(accountToId);
    if (!toAccount) {
      return res.status(404).json({ error: 'Destination account not found' });
    }

    // Row-level security: destination account must belong to user or be accessible
    if (toAccount.userId !== req.userId && type !== 'transfer') {
      return res.status(403).json({ error: 'Forbidden: Cannot access destination account' });
    }

    // Check if destination account is active
    if (!toAccount.active) {
      return res.status(400).json({ error: 'Destination account is frozen' });
    }

    let fromAccount: BankAccount | null = null;
    let transactionStatus: 'completed' | 'failed' = 'completed';

    if (accountFromId) {
      fromAccount = await BankAccount.findByPk(accountFromId);
      if (!fromAccount) {
        return res.status(404).json({ error: 'Source account not found' });
      }

      // Row-level security
      if (fromAccount.userId !== req.userId) {
        return res.status(403).json({ error: 'Forbidden: Cannot access source account' });
      }

      // Check if source account is active
      if (!fromAccount.active) {
        return res.status(400).json({ error: 'Source account is frozen' });
      }

      // Check for sufficient balance
      const currentBalance = parseFloat(fromAccount.balance.toString());
      if (currentBalance < amount) {
        return res.status(400).json({ error: 'Insufficient balance for transaction' });
      }
    }

    // Create transaction
    const transaction = await Transaction.create({
      accountFromId: accountFromId || null,
      accountToId,
      type,
      amount,
      status: transactionStatus,
    });

    // Update balances if transaction is completed
    if (transactionStatus === 'completed') {
      if (fromAccount) {
        const fromBalance = parseFloat(fromAccount.balance.toString());
        fromAccount.balance = parseFloat((fromBalance - amount).toFixed(2));
        await fromAccount.save();
      }

      if (transaction.type === 'deposit' || transaction.type === 'transfer') {
        const toBalance = parseFloat(toAccount.balance.toString());
        toAccount.balance = parseFloat((toBalance + amount).toFixed(2));
        await toAccount.save();
      }
    }

    res.status(201).json({ transactionId: transaction.transactionId, timestamp: transaction.createdAt });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

// GET /api/transactions - List all user's transactions across all accounts
router.get('/', async (req: Request, res: Response) => {
  try {
    // Get all user's accounts
    const userAccounts = await BankAccount.findAll({
      where: { userId: req.userId },
      attributes: ['accountId'],
    });

    const accountIds = userAccounts.map((acc) => acc.accountId);

    if (accountIds.length === 0) {
      return res.json([]);
    }

    // Get all transactions for these accounts
    const transactions = await Transaction.findAll({
      where: {
        [Op.or]: [{ accountFromId: accountIds }, { accountToId: accountIds }],
      },
      order: [['createdAt', 'DESC']],
    });

    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

export default router;
