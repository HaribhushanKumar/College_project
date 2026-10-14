import db from '../config/database.js';

export class ReconciliationService {
  /**
   * Reconcile statement transactions against recorded disbursements
   */
  static reconcileStatementWithDisbursements(statementId) {
    const txns = db.prepare('SELECT * FROM statement_transactions WHERE statement_id = ?').all(statementId);
    const disbursements = db.prepare('SELECT * FROM disbursements').all();

    let matchedCount = 0;
    const updateTxnStmt = db.prepare(`
      UPDATE statement_transactions
      SET is_reconciled = 1, reconciled_with_type = 'Disbursement', reconciled_with_id = ?
      WHERE id = ?
    `);

    const updateDisbStmt = db.prepare(`
      UPDATE disbursements
      SET reconciliation_status = 'Reconciled', statement_transaction_id = ?, status = 'Completed'
      WHERE disbursement_id = ?
    `);

    const reconcileTx = db.transaction(() => {
      for (const t of txns) {
        if (t.type === 'Debit') {
          // Check matching UTR or reference
          const matchedDisb = disbursements.find(
            (d) =>
              (t.reference_no && d.utr_number && t.reference_no.includes(d.utr_number)) ||
              (d.utr_number && t.reference_no && d.utr_number.includes(t.reference_no)) ||
              (t.amount === d.amount && d.reconciliation_status !== 'Reconciled')
          );

          if (matchedDisb) {
            updateTxnStmt.run(matchedDisb.disbursement_id, t.id);
            updateDisbStmt.run(t.txn_id || `TXN-${t.id}`, matchedDisb.disbursement_id);
            matchedCount++;
          }
        }
      }
    });

    reconcileTx();
    return {
      statementId,
      totalChecked: txns.length,
      matchedCount,
    };
  }
}
