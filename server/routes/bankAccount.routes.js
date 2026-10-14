import express from 'express';
import db from '../config/database.js';
import { optionalAuth, requireRole } from '../middleware/auth.js';
import { logAudit } from '../middleware/audit.js';

const router = express.Router();

// GET /api/bank-accounts
router.get('/', (req, res) => {
  const universityId = req.query.university_id || 'UNIV-01';
  const accounts = db.prepare('SELECT * FROM bank_accounts WHERE university_id = ? AND is_active = 1 ORDER BY id ASC').all(universityId);
  return res.json({ success: true, data: accounts });
});

// GET /api/bank-accounts/:id
router.get('/:id', (req, res) => {
  const account = db.prepare('SELECT * FROM bank_accounts WHERE id = ?').get(req.params.id);
  if (!account) return res.status(404).json({ success: false, message: 'Bank account not found.' });

  const statements = db.prepare('SELECT * FROM bank_statements WHERE account_id = ? ORDER BY id DESC').all(account.id);
  return res.json({ success: true, data: { ...account, statements } });
});

// POST /api/bank-accounts
router.post('/', optionalAuth, (req, res) => {
  const { bank_name, bank_code, account_number, account_type, branch, ifsc, current_balance, university_id } = req.body;

  if (!bank_name || !account_number || !ifsc) {
    return res.status(400).json({ success: false, message: 'bank_name, account_number, and ifsc are required.' });
  }

  const maskedNumber = account_number.length > 4 ? `•••• •••• ${account_number.slice(-4)}` : account_number;

  const stmt = db.prepare(`
    INSERT INTO bank_accounts (
      university_id, bank_name, bank_code, account_number, account_type, branch, ifsc, current_balance
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const info = stmt.run(
    university_id || 'UNIV-01',
    bank_name,
    bank_code || bank_name.substring(0, 3).toUpperCase(),
    maskedNumber,
    account_type || 'General',
    branch || 'Main Branch',
    ifsc,
    current_balance || 0
  );

  logAudit({
    action: 'CREATE_BANK_ACCOUNT',
    entityType: 'BankAccount',
    entityId: String(info.lastInsertRowid),
    details: { bank_name, account_number: maskedNumber },
    ipAddress: req.ip,
  });

  return res.status(201).json({
    success: true,
    message: 'Bank account registered successfully.',
    data: { id: info.lastInsertRowid },
  });
});

// PUT /api/bank-accounts/:id
router.put('/:id', optionalAuth, (req, res) => {
  const account = db.prepare('SELECT * FROM bank_accounts WHERE id = ?').get(req.params.id);
  if (!account) return res.status(404).json({ success: false, message: 'Account not found.' });

  const { bank_name, account_type, branch, ifsc, current_balance } = req.body;

  db.prepare(`
    UPDATE bank_accounts
    SET bank_name = COALESCE(?, bank_name),
        account_type = COALESCE(?, account_type),
        branch = COALESCE(?, branch),
        ifsc = COALESCE(?, ifsc),
        current_balance = COALESCE(?, current_balance),
        updated_at = datetime('now')
    WHERE id = ?
  `).run(bank_name, account_type, branch, ifsc, current_balance, req.params.id);

  return res.json({ success: true, message: 'Bank account updated successfully.' });
});

// DELETE /api/bank-accounts/:id
router.delete('/:id', optionalAuth, (req, res) => {
  db.prepare('UPDATE bank_accounts SET is_active = 0 WHERE id = ?').run(req.params.id);
  return res.json({ success: true, message: 'Bank account archived successfully.' });
});

export default router;
