import { ReconciliationRecord } from '../types';
import { MOCK_MERCHANTS } from './mockCustomers';

export const RECONCILIATION_SUMMARY_STATS = {
  totalRecords: 48920,
  matchedTransactions: 47812,
  unmatchedTransactions: 824,
  potentialDuplicates: 184,
  reconciliationAccuracy: 97.73,
};

const LEDGERS: ReconciliationRecord['sourceLedger'][] = [
  'HDFC Escrow',
  'ICICI Nodal',
  'SBI Treasury',
  'Razorpay Settlement',
  'NPCI UPI Switch',
];

const VARIANCES = [0, 0, 0, 0, 12500, 48000, -18500, 120000, 4200, 84500];

export const INITIAL_RECONCILIATION_RECORDS: ReconciliationRecord[] = Array.from(
  { length: 52 },
  (_, i) => {
    const merchant = MOCK_MERCHANTS[(i * 3) % MOCK_MERCHANTS.length];
    const ledger = LEDGERS[i % LEDGERS.length];
    const expectedAmountINR = 35000 + ((i * 19450) % 1450000);

    let status: ReconciliationRecord['status'] = 'Matched';
    if (i % 6 === 0) status = 'Unmatched';
    else if (i % 9 === 0) status = 'Potential Duplicate';
    else if (i % 17 === 0) status = 'Resolved';

    const varianceINR =
      status === 'Matched' || status === 'Resolved'
        ? 0
        : status === 'Potential Duplicate'
          ? expectedAmountINR
          : VARIANCES[(i % (VARIANCES.length - 4)) + 4];

    const settledAmountINR = expectedAmountINR - varianceINR;

    const discrepancyReason =
      status === 'Matched'
        ? 'Exact UTR, amount, and T+1 settlement window match'
        : status === 'Resolved'
          ? 'Auto-reconciled via fee-adjustment journal entry'
          : status === 'Potential Duplicate'
            ? 'Duplicate UTR settlement hash detected within 90-second retry window'
            : varianceINR > 0
              ? 'Bank settlement short-credit — pending gateway MDR adjustment'
              : 'Delayed T+2 clearing batch from issuer bank';

    const day = String(Math.max(10, 19 - (i % 9))).padStart(2, '0');
    const hour = String(9 + (i % 10)).padStart(2, '0');
    const min = String((i * 11) % 60).padStart(2, '0');

    return {
      id: `RCN-${7101 + i}`,
      batchId: `BATCH-202611${day}-${String((i % 4) + 1).padStart(2, '0')}`,
      sourceLedger: ledger,
      transactionRef: `TXN-${98231 + ((i * 2) % 100)}`,
      merchantName: merchant.name,
      expectedAmountINR,
      settledAmountINR,
      varianceINR,
      status,
      detectedAt: `2026-11-${day} ${hour}:${min} IST`,
      discrepancyReason,
    };
  },
);
