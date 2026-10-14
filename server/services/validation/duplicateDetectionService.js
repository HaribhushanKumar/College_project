import db from '../../config/database.js';

/**
 * Service 4: Duplicate Detection Service
 * Identifies duplicate transactions both intra-statement and cross-statement across historical ledgers.
 */
export class DuplicateDetectionService {
  /**
   * Run multi-tier duplicate analysis
   */
  static detectDuplicates({ accountId, statementId, transactions = [] }) {
    const findings = [];
    const intraDuplicates = [];
    const seenRefs = new Map();
    const seenCombos = new Map();

    // 1. Intra-statement duplicate check
    for (let i = 0; i < transactions.length; i++) {
      const t = transactions[i];

      // Exact Reference / UTR collision
      if (t.reference_no && t.reference_no.length > 5 && !t.reference_no.startsWith('REF-')) {
        if (seenRefs.has(t.reference_no)) {
          intraDuplicates.push({
            type: 'EXACT_UTR_DUPLICATE',
            first: seenRefs.get(t.reference_no),
            duplicate: t,
          });
        } else {
          seenRefs.set(t.reference_no, t);
        }
      }

      // Fuzzy duplicate: Same Date + Exact Amount + Same Transaction Type
      const combo = `${t.txn_date}_${t.amount.toFixed(2)}_${t.type}`;
      if (seenCombos.has(combo)) {
        intraDuplicates.push({
          type: 'AMOUNT_DATE_COLLISION',
          first: seenCombos.get(combo),
          duplicate: t,
        });
      } else {
        seenCombos.set(combo, t);
      }
    }

    if (intraDuplicates.length > 0) {
      const refDups = intraDuplicates.filter((d) => d.type === 'EXACT_UTR_DUPLICATE');
      const comboDups = intraDuplicates.filter((d) => d.type === 'AMOUNT_DATE_COLLISION');

      if (refDups.length > 0) {
        findings.push({
          recordId: refDups[0].duplicate.txn_id,
          ruleOrModelId: 'DUPLICATE_UTR_COLLISION',
          category: 'POTENTIAL_ANOMALY',
          severity: 'High',
          evidence: `Found ${refDups.length} transaction(s) sharing identical bank reference / UTR within statement: ${refDups.map((d) => `${d.duplicate.reference_no} (₹${d.duplicate.amount})`).slice(0, 3).join(', ')}.`,
          recommendedAction: 'Verify whether double debit occurred or identical bank instrument was posted twice.',
          confidence: 0.96,
        });
      }

      if (comboDups.length > 0) {
        findings.push({
          recordId: comboDups[0].duplicate.txn_id,
          ruleOrModelId: 'DUPLICATE_AMOUNT_DATE',
          category: 'POTENTIAL_ANOMALY',
          severity: 'Medium',
          evidence: `Detected ${comboDups.length} candidate duplicate(s) with identical amount, date, and direction. Example: ₹${comboDups[0].duplicate.amount.toLocaleString('en-IN')} on ${comboDups[0].duplicate.txn_date}.`,
          recommendedAction: 'Review transaction narrations to confirm distinct recurring billing vs accidental duplication.',
          confidence: 0.85,
        });
      }
    }

    // 2. Historical database cross-statement duplicate check (if accountId provided)
    if (accountId) {
      try {
        const refsToCheck = transactions
          .map((t) => t.reference_no)
          .filter((r) => r && r.length > 5 && !r.startsWith('REF-'));

        if (refsToCheck.length > 0) {
          const placeholders = refsToCheck.map(() => '?').join(',');
          const query = `
            SELECT st.txn_id, st.reference_no, st.amount, st.txn_date, bs.quarter, bs.financial_year
            FROM statement_transactions st
            JOIN bank_statements bs ON st.statement_id = bs.id
            WHERE bs.account_id = ? 
              ${statementId ? 'AND bs.id != ?' : ''}
              AND st.reference_no IN (${placeholders})
            LIMIT 5
          `;
          const params = statementId ? [accountId, statementId, ...refsToCheck] : [accountId, ...refsToCheck];
          const historicalCollisions = db.prepare(query).all(...params);

          if (historicalCollisions.length > 0) {
            findings.push({
              recordId: historicalCollisions[0].txn_id,
              ruleOrModelId: 'HISTORICAL_CROSS_STATEMENT_DUPLICATE',
              category: 'POTENTIAL_ANOMALY',
              severity: 'High',
              evidence: `Transaction UTR ${historicalCollisions[0].reference_no} (₹${historicalCollisions[0].amount.toLocaleString('en-IN')}) was already processed in prior period ${historicalCollisions[0].quarter} ${historicalCollisions[0].financial_year}.`,
              recommendedAction: 'Examine statement period overlap or recycled reference numbers.',
              confidence: 0.98,
            });
          }
        }
      } catch (err) {
        // Safe database fallback
      }
    }

    return {
      duplicatesFound: intraDuplicates.length,
      intraDuplicates,
      findings,
    };
  }
}
