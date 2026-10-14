import path from 'path';
import fs from 'fs';

/**
 * Service 1: File and Schema Validator
 * Validates file extension, MIME type, file size bounds, and header schema consistency.
 */
export class FileSchemaValidator {
  static ALLOWED_EXTENSIONS = ['.pdf', '.xlsx', '.xls', '.csv'];
  static ALLOWED_MIME_TYPES = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'text/csv',
    'text/plain',
    'application/csv',
    'application/octet-stream', // Fallback for raw streams
  ];
  static MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

  /**
   * Validate uploaded file metadata and existence
   */
  static validateFileMetadata({ filePath, originalName, mimeType, size }) {
    const errors = [];

    const ext = path.extname(originalName || filePath || '').toLowerCase();
    if (ext && !this.ALLOWED_EXTENSIONS.includes(ext)) {
      errors.push({
        code: 'INVALID_FILE_EXTENSION',
        field: 'extension',
        message: `File extension '${ext}' is not supported. Supported: ${this.ALLOWED_EXTENSIONS.join(', ')}`,
        severity: 'Critical',
      });
    }

    if (!filePath || !fs.existsSync(filePath)) {
      errors.push({
        code: 'FILE_NOT_FOUND',
        field: 'filePath',
        message: 'Uploaded file could not be found on storage disk.',
        severity: 'Critical',
      });
      return { isValid: false, errors };
    }

    if (mimeType && !this.ALLOWED_MIME_TYPES.includes(mimeType)) {
      errors.push({
        code: 'INVALID_MIME_TYPE',
        field: 'mimeType',
        message: `MIME type '${mimeType}' does not match allowed bank statement formats.`,
        severity: 'High',
      });
    }

    const actualSize = size || fs.statSync(filePath).size;
    if (actualSize <= 0) {
      errors.push({
        code: 'EMPTY_FILE',
        field: 'size',
        message: 'The uploaded file is empty (0 bytes).',
        severity: 'Critical',
      });
    } else if (actualSize > this.MAX_FILE_SIZE_BYTES) {
      errors.push({
        code: 'FILE_TOO_LARGE',
        field: 'size',
        message: `File size (${(actualSize / (1024 * 1024)).toFixed(2)} MB) exceeds statutory ceiling of 25 MB.`,
        severity: 'Critical',
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      extension: ext,
      fileSize: actualSize,
    };
  }

  /**
   * Validate extracted header columns against required financial statement schema
   */
  static validateHeaderSchema(headers = []) {
    const normalized = headers.map((h) => String(h).trim().toLowerCase());
    const requiredPatterns = [
      { name: 'date', pattern: /date|dt|trans.*date|value.*date/i },
      { name: 'description', pattern: /desc|particular|narration|details|remark/i },
      { name: 'amount', pattern: /amount|debit|credit|dr|cr|withdrawal|deposit/i },
    ];

    const missing = [];
    for (const req of requiredPatterns) {
      const found = normalized.some((h) => req.pattern.test(h));
      if (!found) {
        missing.push(req.name);
      }
    }

    return {
      isValid: missing.length === 0,
      missingFields: missing,
      detectedHeaders: headers,
    };
  }
}
