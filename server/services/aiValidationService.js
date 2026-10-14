import { ValidationPipeline } from './validation/validationPipeline.js';
export { ValidationPipeline } from './validation/validationPipeline.js';
export { FileSchemaValidator } from './validation/fileSchemaValidator.js';
export { TransactionExtractor } from './validation/transactionExtractor.js';
export { ArithmeticReconciliationService } from './validation/arithmeticReconciliationService.js';
export { DuplicateDetectionService } from './validation/duplicateDetectionService.js';
export { RuleAnomalyDetector } from './validation/ruleAnomalyDetector.js';
export { MlAnomalyScorer } from './validation/mlAnomalyScorer.js';

/**
 * High-level facade for AI & Deterministic Validation
 */
export class AiValidationEngine {
  /**
   * Run comprehensive modular validation pipeline on an uploaded bank statement
   */
  static validateStatement({ statementId, accountId, transactions = [], openingBalance = 0, closingBalance = 0 }) {
    const pipelineResult = ValidationPipeline.processStatement({
      statementId,
      accountId,
      rawTransactions: transactions,
      openingBalance,
      closingBalance,
    });

    return {
      aiStatus: pipelineResult.aiStatus,
      riskScore: pipelineResult.riskScore,
      riskScoreFormula: pipelineResult.riskScoreFormula,
      anomaliesDetected: pipelineResult.anomaliesDetected,
      findings: pipelineResult.allFindings,
      findingsBySeverity: pipelineResult.findingsBySeverity,
      reconciliation: pipelineResult.reconciliation,
      categorizedTransactions: pipelineResult.categorizedTransactions,
      summary: pipelineResult.recommendation,
      currentStage: pipelineResult.currentStage,
    };
  }

  /**
   * Run validation on a student beneficiary application
   */
  static validateApplication({ application, student, scheme }) {
    return ValidationPipeline.processApplication({ application, student, scheme });
  }
}
