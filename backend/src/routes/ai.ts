import express, { Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { Op } from 'sequelize';
import BankAccount from '../models/BankAccount.js';
import Transaction from '../models/Transaction.js';
import AiReport from '../models/AiReport.js';
import { callFoundry } from '../utils/foundry.js';

const router = express.Router();

// Rate limit: 5 generation requests per user per 15 minutes
const generateRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  keyGenerator: (req: Request) => req.userId ?? req.ip ?? 'unknown',
  message: { error: 'Too many report requests. Please wait a few minutes before trying again.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const SYSTEM_PROMPT = `You are a friendly, encouraging personal finance advisor for a banking app.
Given a monthly financial summary, write a financial health report using EXACTLY this markdown structure:

## This Month's Overview
2-3 sentences summarizing the month.

## What's Working
- bullet point one
- bullet point two
- bullet point three

## One Thing to Try
One sentence. Two sentences maximum. A single, specific, actionable tip. No elaboration.

Rules: use only the numbers provided, no invented data, warm supportive tone.`;

function buildUserMessage(summary: {
  reportMonth: string;
  totalDeposited: number;
  totalWithdrawn: number;
  totalTransferred: number;
  netCashFlow: number;
  transactionCount: number;
  checkingBalance: number;
  savingsBalance: number;
  grandTotal: number;
  topApy: number | null;
  accountCount: number;
}): string {
  const fmt = (n: number) =>
    n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const lines = [
    `Here is my financial summary for ${summary.reportMonth}:`,
    `- Total deposited: $${fmt(summary.totalDeposited)}`,
    `- Total withdrawn: $${fmt(summary.totalWithdrawn)}`,
    `- Internal transfers: $${fmt(summary.totalTransferred)}`,
    `- Net cash flow: ${summary.netCashFlow >= 0 ? '+' : ''}$${fmt(summary.netCashFlow)}`,
    `- Current checking balance: $${fmt(summary.checkingBalance)}`,
    `- Current savings balance: $${fmt(summary.savingsBalance)}${summary.topApy ? ` (${summary.topApy.toFixed(2)}% APY)` : ''}`,
    `- Total balance across all accounts: $${fmt(summary.grandTotal)}`,
    `- Number of active accounts: ${summary.accountCount}`,
    `- Transactions this month: ${summary.transactionCount}`,
    '',
    'Please generate my monthly financial health report.',
  ];

  return lines.join('\n');
}

// GET /api/ai/reports — list all cached reports for the current user
router.get('/reports', async (req: Request, res: Response) => {
  try {
    const reports = await AiReport.findAll({
      where: { userId: req.userId },
      order: [['createdAt', 'DESC']],
    });

    const result = reports.map((r) => ({
      reportId: r.reportId,
      month: r.month,
      reportText: r.reportText,
      stats: JSON.parse(r.statsJson),
      createdAt: r.createdAt,
    }));

    res.json(result);
  } catch (err) {
    console.error('AI reports list error:', err);
    res.status(500).json({ error: 'Failed to fetch reports.' });
  }
});

// POST /api/ai/report — generate (or return cached) monthly financial health report
router.post('/report', generateRateLimit, async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const reportMonth = now.toLocaleString('en-US', { month: 'long', year: 'numeric' });

    // Return cached report if one already exists for this month
    const cached = await AiReport.findOne({
      where: { userId: req.userId, month: reportMonth },
    });

    if (cached) {
      return res.json({
        report: cached.reportText,
        month: cached.month,
        generatedAt: cached.createdAt,
        stats: JSON.parse(cached.statsJson),
        cached: true,
      });
    }

    // Fetch all of the user's accounts
    const accounts = await BankAccount.findAll({
      where: { userId: req.userId },
    });

    if (accounts.length === 0) {
      return res.status(400).json({
        error: 'No accounts found. Open an account first before generating a report.',
      });
    }

    const accountIds = accounts.map((a) => a.accountId);
    const activeAccounts = accounts.filter((a) => a.active);

    // Fetch this month's completed transactions
    const transactions = await Transaction.findAll({
      where: {
        [Op.or]: [{ accountFromId: accountIds }, { accountToId: accountIds }],
        status: 'completed',
        createdAt: { [Op.gte]: monthStart },
      },
    });

    // Aggregate totals
    let totalDeposited = 0;
    let totalWithdrawn = 0;
    let totalTransferred = 0;

    for (const tx of transactions) {
      const amount = parseFloat(tx.amount.toString());
      if (tx.type === 'deposit') totalDeposited += amount;
      else if (tx.type === 'withdrawal') totalWithdrawn += amount;
      else if (tx.type === 'transfer') totalTransferred += amount;
    }

    const netCashFlow = totalDeposited - totalWithdrawn;

    let checkingBalance = 0;
    let savingsBalance = 0;
    let topApy: number | null = null;

    for (const acct of activeAccounts) {
      const bal = parseFloat(acct.balance.toString());
      if (acct.accountType === 'checking') checkingBalance += bal;
      else if (acct.accountType === 'savings') {
        savingsBalance += bal;
        const apy = acct.apy ? parseFloat(acct.apy.toString()) : 0;
        if (apy > 0 && (topApy === null || apy > topApy)) topApy = apy;
      }
    }

    const stats = {
      totalDeposited,
      totalWithdrawn,
      totalTransferred,
      netCashFlow,
      transactionCount: transactions.length,
    };

    const summary = {
      reportMonth,
      totalDeposited,
      totalWithdrawn,
      totalTransferred,
      netCashFlow,
      transactionCount: transactions.length,
      checkingBalance,
      savingsBalance,
      grandTotal: checkingBalance + savingsBalance,
      topApy,
      accountCount: activeAccounts.length,
    };

    const reportText = await callFoundry(
      [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildUserMessage(summary) },
      ],
      600
    );

    // Persist the new report
    const saved = await AiReport.create({
      userId: req.userId!,
      month: reportMonth,
      reportText,
      statsJson: JSON.stringify(stats),
    });

    res.json({
      report: reportText,
      month: reportMonth,
      generatedAt: saved.createdAt,
      stats,
      cached: false,
    });
  } catch (err) {
    console.error('AI report error:', err);
    res.status(503).json({
      error: 'Unable to generate report right now. Please try again in a moment.',
    });
  }
});

export default router;
