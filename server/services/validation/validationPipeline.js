import { FileSchemaValidator } from './fileSchemaValidator.js';
import { TransactionExtractor } from './transactionExtractor.js';
import { ArithmeticReconciliationService } from './arithmeticReconciliationService.js';
import { DuplicateDetectionService } from './duplicateDetectionService.js';
import { RuleAnomalyDetector } from './ruleAnomalyDetector.js';
import { MlAnomalyScorer } from './mlAnomalyScorer.js';

/**
 * Service 7: Modular Validation Pipeline Orchestrator
 * Integrates all validation services and compiles explainable audit findings.
 */
export class ValidationPipeline {
  /**
   * Run full bank statement validation pipeline
   */
  static processStatement({
    statementId = null,
    accountId = null,
    rawTransactions = [],
    openingBalance = 0,
    closingBalance = 0,
    modelConfig = null,
  }) {
    const allFindings = [];
    let calculatedRiskScore = 0;

    // Stage 1: Transaction Extraction & Normalization
    const normalizedTransactions = TransactionExtractor.normalizeTransactions(rawTransactions);

    // Stage 2: Deterministic Arithmetic & Balance Reconciliation
    const reconciliationResult = ArithmeticReconciliationService.reconcileStatement({
      openingBalance,
      closingBalance,
      transactions: normalizedTransactions,
    });
    allFindings.push(...reconciliationResult.findings);
    if (!reconciliationResult.isReconciled) {
      calculatedRiskScore += 35;
    }

    // Stage 3: Duplicate Transaction Detection
    const duplicateResult = DuplicateDetectionService.detectDuplicates({
      accountId,
      statementId,
      transactions: normalizedTransactions,
    });
    allFindings.push(...duplicateResult.findings);
    if (duplicateResult.duplicatesFound > 0) {
      calculatedRiskScore += Math.min(duplicateResult.duplicatesFound * 15, 30);
    }

    // Stage 4: Rule-Based Anomaly Detection (KTPP Act, Overdrafts, Round Sums)
    const ruleResult = RuleAnomalyDetector.scanStatementRules({
      transactions: normalizedTransactions,
    });
    allFindings.push(...ruleResult.ruleFindings);
    calculatedRiskScore += ruleResult.severityPenalty;

    // Stage 5: Statistical & ML Outlier Scoring
    const mlResult = MlAnomalyScorer.scoreTransactions({
      transactions: normalizedTransactions,
      modelConfig,
    });
    allFindings.push(...mlResult.findings);
    calculatedRiskScore += mlResult.mlRiskScore;

    // Cap total risk score between 0 and 100
    const finalRiskScore = Math.min(Math.round(calculatedRiskScore), 100);

    // Group findings by severity
    const findingsBySeverity = {
      Critical: allFindings.filter((f) => f.severity === 'Critical'),
      High: allFindings.filter((f) => f.severity === 'High'),
      Medium: allFindings.filter((f) => f.severity === 'Medium'),
      Low: allFindings.filter((f) => f.severity === 'Low'),
      Informational: allFindings.filter((f) => f.severity === 'Informational'),
    };

    // Determine audit status and stage
    let aiStatus = 'Completed';
    let currentStage = 'Auditor Review Ready';
    let recommendation = 'Standard Approval Recommended';

    if (findingsBySeverity.Critical.length > 0 || finalRiskScore >= 60) {
      aiStatus = 'Flagged';
      currentStage = 'High Risk - Manual Auditor Action Required';
      recommendation = 'Hold Disbursement & Request DDO Justification';
    } else if (findingsBySeverity.High.length > 0 || finalRiskScore >= 30) {
      aiStatus = 'In Progress';
      currentStage = 'Under Review';
      recommendation = 'Reviewer Verification Advised';
    }

    const anomalyCount =
      findingsBySeverity.Critical.length +
      findingsBySeverity.High.length +
      findingsBySeverity.Medium.length;

    return {
      success: true,
      aiStatus,
      currentStage,
      recommendation,
      riskScore: finalRiskScore,
      riskScoreFormula: 'Risk Score = Sum(Arithmetic Variance Penalty [35] + Duplicate Penalties [15-30] + Rule Breaches [20-40] + Statistical Z-Score Outliers [15-30]) capped at 100',
      anomaliesDetected: anomalyCount,
      allFindings,
      findingsBySeverity,
      reconciliation: reconciliationResult,
      duplicateMetrics: { duplicatesFound: duplicateResult.duplicatesFound },
      statisticalMetrics: {
        meanAmount: mlResult.meanAmount,
        stdDevAmount: mlResult.stdDevAmount,
        outlierCount: mlResult.statisticalOutliers?.length || 0,
      },
      categorizedTransactions: normalizedTransactions,
    };
  }

  /**
   * Run beneficiary application validation pipeline
   */
  static processApplication({ application, student, scheme }) {
    const ruleScan = RuleAnomalyDetector.scanApplicationRules({ application, student, scheme });
    const finalRiskScore = Math.min(ruleScan.riskPenalty, 100);

    let status = 'Verified';
    let recommendation = 'Recommended for Approval';

    if (!ruleScan.isEligible || finalRiskScore >= 60) {
      status = 'Rejected by AI';
      recommendation = 'Ineligible under scheme criteria - Manual Review Required';
    } else if (finalRiskScore > 0) {
      status = 'Flagged';
      recommendation = 'Requires Verification of Student Attendance / Documents';
    }

    return {
      validationStatus: status,
      riskScore: finalRiskScore,
      isEligible: ruleScan.isEligible,
      findings: ruleScan.findings,
      recommendation,
    };
  }
}
