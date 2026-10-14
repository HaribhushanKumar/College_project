/**
 * Service 5: Rule-Based Anomaly Detection
 * Evaluates state financial transparency rules (KTPP Act, UGC Guidelines, Scheme Eligibility).
 */
export class RuleAnomalyDetector {
  /**
   * Scan statement transactions against statutory expenditure rules
   */
  static scanStatementRules({ transactions = [] }) {
    const findings = [];
    let severityPenalty = 0;

    // Rule 1: KTPP Act Split Procurement Check (Debits between ₹40,000 and ₹49,999)
    const ktppSplitCandidates = transactions.filter(
      (t) => t.type === 'Debit' && t.amount >= 40000 && t.amount < 50000
    );

    if (ktppSplitCandidates.length >= 3) {
      findings.push({
        recordId: ktppSplitCandidates[0].txn_id,
        ruleOrModelId: 'RULE_KTPP_SPLIT_PROCUREMENT',
        category: 'POTENTIAL_ANOMALY',
        severity: 'High',
        evidence: `Identified ${ktppSplitCandidates.length} debit payments totaling ₹${ktppSplitCandidates.reduce((s, c) => s + c.amount, 0).toLocaleString('en-IN')} clustered just below statutory ₹50,000 tender ceiling. Example: ₹${ktppSplitCandidates[0].amount.toLocaleString('en-IN')} on ${ktppSplitCandidates[0].txn_date}.`,
        recommendedAction: 'Verify whether multiple purchase orders were split to circumvent open e-procurement tender under Karnataka Transparency in Public Procurements (KTPP) Act.',
        confidence: 0.91,
      });
      severityPenalty += 35;
    }

    // Rule 2: Unusually Large Round-Sum Outliers (> ₹5,00,000 in exact round multiples)
    const roundOutliers = transactions.filter(
      (t) => t.type === 'Debit' && t.amount >= 500000 && t.amount % 100000 === 0
    );

    if (roundOutliers.length > 0) {
      findings.push({
        recordId: roundOutliers[0].txn_id,
        ruleOrModelId: 'RULE_LARGE_ROUND_SUM',
        category: 'POTENTIAL_ANOMALY',
        severity: 'Medium',
        evidence: `Detected ${roundOutliers.length} large round-number withdrawal(s) exceeding ₹5,00,000: ${roundOutliers.map((d) => `₹${d.amount.toLocaleString('en-IN')}`).slice(0, 2).join(', ')}.`,
        recommendedAction: 'Inspect university syndicate sanction orders and supporting vendor invoices.',
        confidence: 0.83,
      });
      severityPenalty += 20;
    }

    // Rule 3: Negative Running Balance Detection
    const negativeBalanceTxns = transactions.filter(
      (t) => t.balance !== null && t.balance < 0
    );

    if (negativeBalanceTxns.length > 0) {
      findings.push({
        recordId: negativeBalanceTxns[0].txn_id,
        ruleOrModelId: 'RULE_UNAUTHORIZED_OVERDRAFT',
        category: 'DETERMINISTIC_ERROR',
        severity: 'Critical',
        evidence: `Account balance fell negative (overdrawn) on ${negativeBalanceTxns[0].txn_date} at ₹${negativeBalanceTxns[0].balance.toLocaleString('en-IN')}. Government grant accounts must maintain non-negative credit balances.`,
        recommendedAction: 'Verify unauthorized overdraft penalty charges or immediate university fund recoupment.',
        confidence: 1.0,
      });
      severityPenalty += 40;
    }

    return {
      ruleFindings: findings,
      severityPenalty,
    };
  }

  /**
   * Scan student scholarship application against scheme rules
   */
  static scanApplicationRules({ application, student, scheme }) {
    const findings = [];
    let isEligible = true;
    let riskPenalty = 0;

    // 1. Income Ceiling Rule
    if (scheme.max_income_ceiling > 0 && student.annual_family_income > scheme.max_income_ceiling) {
      const excess = student.annual_family_income - scheme.max_income_ceiling;
      findings.push({
        recordId: application.app_id,
        ruleOrModelId: 'RULE_INCOME_CEILING_BREACH',
        category: 'DETERMINISTIC_ERROR',
        severity: 'Critical',
        evidence: `Declared family income ₹${student.annual_family_income.toLocaleString('en-IN')} exceeds scheme maximum ceiling of ₹${scheme.max_income_ceiling.toLocaleString('en-IN')} by ₹${excess.toLocaleString('en-IN')}.`,
        recommendedAction: 'Request Nadakacheri revenue certificate verification or reject under scheme eligibility norms.',
        confidence: 1.0,
      });
      isEligible = false;
      riskPenalty += 60;
    }

    // 2. Attendance Minimum Rule
    if (scheme.min_attendance > 0 && student.attendance_rate < scheme.min_attendance) {
      findings.push({
        recordId: application.app_id,
        ruleOrModelId: 'RULE_ATTENDANCE_DEFICIT',
        category: 'POTENTIAL_ANOMALY',
        severity: 'High',
        evidence: `Biometric attendance rate (${student.attendance_rate}%) is below mandatory threshold (${scheme.min_attendance}%) for academic welfare grant.`,
        recommendedAction: 'Refer to Academic Head of Department for attendance regularization certificate.',
        confidence: 0.95,
      });
      riskPenalty += 30;
    }

    // 3. Amount Requested Cap
    if (application.amount_requested > scheme.max_amount) {
      findings.push({
        recordId: application.app_id,
        ruleOrModelId: 'RULE_MAX_AMOUNT_EXCEEDED',
        category: 'DETERMINISTIC_ERROR',
        severity: 'High',
        evidence: `Requested grant ₹${application.amount_requested.toLocaleString('en-IN')} exceeds scheme maximum ceiling of ₹${scheme.max_amount.toLocaleString('en-IN')}.`,
        recommendedAction: 'Cap disbursement amount at scheme maximum limit.',
        confidence: 1.0,
      });
      isEligible = false;
      riskPenalty += 35;
    }

    // 4. Student Bank Account Seeding
    if (!student.bank_account || !student.bank_ifsc) {
      findings.push({
        recordId: application.app_id,
        ruleOrModelId: 'RULE_MISSING_DBT_MANDATE',
        category: 'DETERMINISTIC_ERROR',
        severity: 'Medium',
        evidence: 'Beneficiary bank account number or IFSC code is missing or incomplete.',
        recommendedAction: 'Request student to submit Aadhaar-seeded bank account mandate form.',
        confidence: 1.0,
      });
      riskPenalty += 25;
    }

    return {
      isEligible,
      findings,
      riskPenalty,
    };
  }
}
