/**
 * Service 2: Transaction Extraction & Normalization
 * Standardizes raw parsed rows into uniform financial ledger entities.
 */
export class TransactionExtractor {
  /**
   * Normalize an array of raw extracted transaction records
   */
  static normalizeTransactions(rawList = []) {
    return rawList.map((raw, index) => this.normalizeSingleTransaction(raw, index + 1));
  }

  /**
   * Normalize single transaction record
   */
  static normalizeSingleTransaction(raw, sequenceNo = 1) {
    const rawDate = raw.date || raw.txn_date || raw.value_date || raw.trans_date || '';
    const normalizedDate = this.parseDate(rawDate);

    const description = String(raw.description || raw.particulars || raw.narration || 'General Transaction').trim();
    const referenceNo = this.normalizeReference(raw.reference_no || raw.ref_no || raw.chq_no || raw.utr || '');

    // Determine type and clean amount
    let type = 'Debit';
    let amount = 0;

    if (raw.type && /credit|\bcr\b/i.test(String(raw.type))) {
      type = 'Credit';
    } else if (raw.type && /debit|\bdr\b/i.test(String(raw.type))) {
      type = 'Debit';
    } else if (raw.credit && Number(this.cleanAmount(raw.credit)) > 0) {
      type = 'Credit';
      amount = this.cleanAmount(raw.credit);
    } else if (raw.debit && Number(this.cleanAmount(raw.debit)) > 0) {
      type = 'Debit';
      amount = this.cleanAmount(raw.debit);
    }

    if (amount === 0 && raw.amount !== undefined) {
      amount = this.cleanAmount(raw.amount);
      if (amount < 0) {
        type = 'Debit';
        amount = Math.abs(amount);
      }
    }

    const balance = raw.balance !== undefined ? this.cleanAmount(raw.balance) : null;

    const txnId = raw.txn_id || `TXN-${String(sequenceNo).padStart(4, '0')}`;

    return {
      txn_id: txnId,
      txn_date: normalizedDate,
      description,
      reference_no: referenceNo || `REF-${Math.floor(10000000 + Math.random() * 90000000)}`,
      type,
      amount: Math.round(amount * 100) / 100,
      balance: balance !== null ? Math.round(balance * 100) / 100 : null,
      raw_source: raw,
    };
  }

  /**
   * Clean numeric currency string (handles ₹, commas, DR/CR markers)
   */
  static cleanAmount(val) {
    if (typeof val === 'number') return isNaN(val) ? 0 : val;
    if (!val) return 0;
    const str = String(val)
      .replace(/[₹$,]/g, '')
      .replace(/\s+/g, '')
      .replace(/cr$/i, '')
      .replace(/dr$/i, '-')
      .trim();
    const parsed = parseFloat(str);
    return isNaN(parsed) ? 0 : parsed;
  }

  /**
   * Parse various date formats to ISO YYYY-MM-DD
   */
  static parseDate(dateStr) {
    if (!dateStr) return new Date().toISOString().split('T')[0];
    const s = String(dateStr).trim();

    // Already YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

    // DD-MM-YYYY or DD/MM/YYYY
    const ddmmyyyy = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
    if (ddmmyyyy) {
      const d = ddmmyyyy[1].padStart(2, '0');
      const m = ddmmyyyy[2].padStart(2, '0');
      const y = ddmmyyyy[3];
      return `${y}-${m}-${d}`;
    }

    // DD-MMM-YYYY (e.g. 15-Jul-2024 or 15/Aug/2024)
    const ddmmmyyyy = s.match(/^(\d{1,2})[-/\s]([A-Za-z]{3})[-/\s](\d{4})$/);
    if (ddmmmyyyy) {
      const d = ddmmmyyyy[1].padStart(2, '0');
      const months = {
        jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
        jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12'
      };
      const m = months[ddmmmyyyy[2].toLowerCase()] || '01';
      const y = ddmmmyyyy[3];
      return `${y}-${m}-${d}`;
    }

    // Native Date parse fallback
    const parsed = new Date(s);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString().split('T')[0];
    }

    return s;
  }

  /**
   * Normalize reference string
   */
  static normalizeReference(ref) {
    if (!ref) return '';
    return String(ref)
      .toUpperCase()
      .replace(/[^A-Z0-9-]/g, '')
      .trim();
  }
}
