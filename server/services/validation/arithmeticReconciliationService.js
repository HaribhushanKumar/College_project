/**
 * Service 3: Financial Arithmetic and Balance Reconciliation
 * Provides deterministic mathematical verification of statements and running ledgers.
 */
export class ArithmeticReconciliationService {
  static VARIANCE_TOLERANCE_INR = 1.0; // ₹1 allowance for minor bank rounding

  /**
   * Reconcile statement totals and closing balance
   */
  static reconcileStatement({ openingBalance = 0, closingBalance = 0, transactions = [] }) {
    let totalCredits = 0;
    let totalDebits = 0;
    let creditCount = 0;
    let debitCount = 0;

    const runningErrors = [];
    let prevBalance = openingBalance;

    for (let i = 0; i < transactions.length; i++) {
      const t = transactions[i];
      if (t.type === 'Credit') {
        totalCredits += t.amount;
        creditCount++;
      } else {
        totalDebits += t.amount;
        debitCount++;
      }

      // If transaction row includes running balance, verify mathematical progression
      if (t.balance !== null && t.balance !== undefined && !isNaN(t.balance)) {
        const expectedBalance = t.type === 'Credit' ? prevBalance + t.amount : prevBalance - t.amount;
        const lineDiff = Math.abs(t.balance - expectedBalance);
        if (lineDiff > this.VARIANCE_TOLERANCE_INR) {
          runningErrors.push({
            sequenceIndex: i + 1,
            txnId: t.txn_id,
            reportedBalance: t.balance,
            expectedBalance: Math.round(expectedBalance * 100) / 100,
            lineVariance: Math.round(lineDiff * 100) / 100,
          });
        }
        prevBalance = t.balance;
      }
    }

    const calculatedClosing = Math.round((openingBalance + totalCredits - totalDebits) * 100) / 100;
    const reportedClosing = Math.round((closingBalance || calculatedClosing) * 100) / 100;
    const balanceVariance = Math.round(Math.abs(reportedClosing - calculatedClosing) * 100) / 100;
    const isReconciled = balanceVariance <= this.VARIANCE_TOLERANCE_INR;

    const findings = [];
    if (!isReconciled) {
      findings.push({
        recordId: 'STATEMENT_LEDGER',
        ruleOrModelId: 'ARITHMETIC_RECONCILIATION',
        category: 'DETERMINISTIC_ERROR',
        severity: 'High',
        evidence: `Reported closing balance ₹${reportedClosing.toLocaleString('en-IN')} differs from calculated sum (₹${openingBalance.toLocaleString('en-IN')} opening + ₹${totalCredits.toLocaleString('en-IN')} credits - ₹${totalDebits.toLocaleString('en-IN')} debits = ₹${calculatedClosing.toLocaleString('en-IN')}) by ₹${balanceVariance.toLocaleString('en-IN')}.`,
        recommendedAction: 'Inspect bank statement for missing turnover entries, dishonored instruments, or reversal entries.',
        confidence: 1.0,
      });
    } else {
      findings.push({
        recordId: 'STATEMENT_LEDGER',
        ruleOrModelId: 'ARITHMETIC_RECONCILIATION',
        category: 'DETERMINISTIC_VERIFIED',
        severity: 'Informational',
        evidence: `Credits (₹${totalCredits.toLocaleString('en-IN')}) and Debits (₹${totalDebits.toLocaleString('en-IN')}) reconcile precisely with closing balance within statutory tolerance.`,
        recommendedAction: 'Proceed to rule-based transaction audits.',
        confidence: 1.0,
      });
    }

    if (runningErrors.length > 0) {
      findings.push({
        recordId: runningErrors[0].txnId,
        ruleOrModelId: 'RUNNING_BALANCE_DISCREPANCY',
        category: 'DETERMINISTIC_ERROR',
        severity: 'Medium',
        evidence: `Identified ${runningErrors.length} line-item balance jumps. Example at transaction ${runningErrors[0].txnId}: expected ₹${runningErrors[0].expectedBalance}, reported ₹${runningErrors[0].reportedBalance} (Variance: ₹${runningErrors[0].lineVariance}).`,
        recommendedAction: 'Verify whether uncleared cheques or backdated value-dated entries altered running balance sequence.',
        confidence: 0.98,
      });
    }

    return {
      isReconciled,
      openingBalance,
      reportedClosing,
      calculatedClosing,
      balanceVariance,
      totalCredits: Math.round(totalCredits * 100) / 100,
      totalDebits: Math.round(totalDebits * 100) / 100,
      creditCount,
      debitCount,
      runningErrorsCount: runningErrors.length,
      findings,
    };
  }
}
