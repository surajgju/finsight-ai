import {
  DateRangeFilter,
  DateRangePreset,
  KpiMetric,
  LendingApplication,
  Organisation,
  ReconciliationRecord,
  TransactionRecord,
} from '../types';
import { formatINRCompact, formatInteger } from '../utils/formatters';

const DATE_RANGE_MULTIPLIER: Record<DateRangePreset, number> = {
  today: 0.042,
  '7d': 0.26,
  '30d': 1.0,
  '90d': 2.84,
  custom: 0.62,
};

const DATE_RANGE_DAYS: Record<DateRangePreset, number> = {
  today: 0,
  '7d': 7,
  '30d': 30,
  '90d': 90,
  custom: 45,
};

export function getDateRangeLabel(filter: DateRangeFilter): string {
  switch (filter.preset) {
    case 'today':
      return 'Today (19 Nov 2026)';
    case '7d':
      return 'Last 7 days';
    case '30d':
      return 'Last 30 days';
    case '90d':
      return 'Last 90 days';
    case 'custom':
      if (filter.customStart && filter.customEnd) {
        return `${filter.customStart} to ${filter.customEnd}`;
      }
      return 'Custom range (45d)';
  }
}

export function filterTransactionsByScope(
  transactions: TransactionRecord[],
  orgId: string,
  dateRange: DateRangeFilter,
): TransactionRecord[] {
  const maxDays = DATE_RANGE_DAYS[dateRange.preset];
  return transactions.filter((txn) => {
    const matchesOrg = orgId === 'org-apex' || txn.orgId === orgId;
    const matchesDate = txn.daysAgo <= maxDays;
    return matchesOrg && matchesDate;
  });
}

export function computeExecutiveKPIs(
  org: Organisation,
  dateRange: DateRangeFilter,
  transactions: TransactionRecord[],
): KpiMetric[] {
  const rangeFactor = DATE_RANGE_MULTIPLIER[dateRange.preset];
  const scale = org.scaleFactor * rangeFactor;

  // Reflect live user review adjustments on flagged/blocked/cleared transactions
  const clearedCount = transactions.filter((t) => t.status === 'Cleared').length;
  const blockedDeltaAmount = transactions
    .filter((t) => t.status === 'Blocked')
    .reduce((sum, t) => sum + t.amountINR, 0);

  const totalTxns = Math.max(1240, Math.round(1284590 * scale));
  const totalValueINR = 248_65_00_000 * scale;
  const additionalCleared = Math.max(0, clearedCount - 3);
  const baseSuspicious = Math.max(18, Math.round(1284 * scale) - additionalCleared);
  const fraudDetectionRate = Math.min(99.65, Number((98.72 + (org.scaleFactor < 0.5 ? 0.24 : 0)).toFixed(2)));
  const riskScore = Number(
    Math.max(11.2, Math.min(34.0, 18.4 - additionalCleared * 0.1 + (org.id === 'org-bharatpay' ? 1.8 : 0))).toFixed(1),
  );
  const automatedProcesses = Number(
    Math.min(95.4, 87.6 + (dateRange.preset === 'today' ? 1.2 : 0)).toFixed(1),
  );
  const complianceScore = Number(
    Math.min(99.2, 96.8 + (org.id === 'org-sahyadri' ? 0.9 : 0)).toFixed(1),
  );
  const fraudPreventedINR = 4_82_00_000 * scale + blockedDeltaAmount * 0.25;

  return [
    {
      id: 'total-transactions',
      label: 'Total Transactions',
      formattedValue: formatInteger(totalTxns),
      rawValue: totalTxns,
      deltaPercent: 12.8,
      trendDirection: 'up',
      positiveIsGood: true,
      sparkline: [64, 68, 72, 71, 79, 84, 91, 96].map((v) => Math.round(v * scale * 100) / 100),
      tooltip: 'Total payment, disbursement, and settlement instructions evaluated across UPI, IMPS, NEFT/RTGS, and Card rails.',
    },
    {
      id: 'total-value',
      label: 'Total Transaction Value',
      formattedValue: formatINRCompact(totalValueINR),
      rawValue: totalValueINR,
      deltaPercent: 14.2,
      trendDirection: 'up',
      positiveIsGood: true,
      sparkline: [14.2, 16.1, 15.8, 18.4, 20.2, 21.9, 23.4, 25.1],
      tooltip: 'Gross Indian Rupee (INR) throughput processed across active institutional ledgers.',
    },
    {
      id: 'fraud-detection-rate',
      label: 'Fraud Detection Rate',
      formattedValue: `${fraudDetectionRate.toFixed(2)}%`,
      rawValue: fraudDetectionRate,
      deltaPercent: 0.94,
      trendDirection: 'up',
      positiveIsGood: true,
      sparkline: [96.9, 97.4, 97.8, 98.1, 98.3, 98.5, 98.6, fraudDetectionRate],
      tooltip: 'Share of verified fraud attempts intercepted prior to final settlement by real-time AI risk models.',
    },
    {
      id: 'suspicious-transactions',
      label: 'Suspicious Transactions',
      formattedValue: formatInteger(baseSuspicious),
      rawValue: baseSuspicious,
      deltaPercent: -8.4,
      trendDirection: 'down',
      positiveIsGood: true,
      sparkline: [148, 142, 139, 134, 130, 127, 122, 118],
      tooltip: 'Transactions scoring >= 55 on FinSight composite risk engine awaiting or undergoing review.',
    },
    {
      id: 'risk-score',
      label: 'Financial Risk Score',
      formattedValue: `${riskScore.toFixed(1)} / 100`,
      rawValue: riskScore,
      deltaPercent: -4.6,
      trendDirection: 'down',
      positiveIsGood: true,
      sparkline: [22.1, 21.4, 20.8, 20.1, 19.6, 19.1, 18.7, riskScore],
      tooltip: 'Portfolio-weighted composite exposure index combining fraud velocity, credit PD, and liquidity headroom.',
    },
    {
      id: 'automated-processes',
      label: 'Automated Processes',
      formattedValue: `${automatedProcesses.toFixed(1)}%`,
      rawValue: automatedProcesses,
      deltaPercent: 5.3,
      trendDirection: 'up',
      positiveIsGood: true,
      sparkline: [81.2, 82.5, 83.4, 84.8, 85.9, 86.4, 87.1, automatedProcesses],
      tooltip: 'Percentage of KYC, reconciliation, underwriting, and alert triage handled autonomously by AI agents.',
    },
    {
      id: 'compliance-score',
      label: 'Compliance Score',
      formattedValue: `${complianceScore.toFixed(1)}%`,
      rawValue: complianceScore,
      deltaPercent: 1.7,
      trendDirection: 'up',
      positiveIsGood: true,
      sparkline: [94.8, 95.1, 95.4, 95.8, 96.1, 96.3, 96.6, complianceScore],
      tooltip: 'Adherence index across RBI KYC refresh mandates, PMLA AML screening, and nodal escrow norms.',
    },
    {
      id: 'fraud-prevented',
      label: 'Potential Fraud Prevented',
      formattedValue: formatINRCompact(fraudPreventedINR),
      rawValue: fraudPreventedINR,
      deltaPercent: 19.4,
      trendDirection: 'up',
      positiveIsGood: true,
      sparkline: [32, 38, 41, 49, 54, 62, 68, 74],
      tooltip: 'Cumulative INR value of high-risk and mule-ring payouts quarantined prior to outward clearing.',
    },
  ];
}

export function getVolumeTimeSeries(org: Organisation, dateRange: DateRangeFilter) {
  const scale = org.scaleFactor;
  if (dateRange.preset === 'today') {
    const hours = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];
    const base = [4200, 7800, 11400, 13200, 9800, 5600, 2900];
    return hours.map((label, idx) => ({
      period: label,
      transactions: Math.round(base[idx] * scale),
      valueCr: Number((base[idx] * 0.0019 * scale).toFixed(2)),
      flagged: Math.max(2, Math.round(base[idx] * 0.001 * scale)),
    }));
  }

  if (dateRange.preset === '7d') {
    const days = ['13 Nov', '14 Nov', '15 Nov', '16 Nov', '17 Nov', '18 Nov', '19 Nov'];
    const base = [41200, 44800, 38900, 49100, 52400, 54800, 52900];
    return days.map((label, idx) => ({
      period: label,
      transactions: Math.round(base[idx] * scale),
      valueCr: Number((base[idx] * 0.000195 * scale).toFixed(2)),
      flagged: Math.max(8, Math.round(base[idx] * 0.0011 * scale)),
    }));
  }

  const weeks = ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4', 'Wk 5', 'Wk 6', 'Wk 7', 'Wk 8'];
  const factor = dateRange.preset === '90d' ? 2.6 : 1.0;
  const base = [142000, 151000, 148500, 163200, 169400, 174800, 168200, 167490];
  return weeks.map((label, idx) => ({
    period: label,
    transactions: Math.round(base[idx] * scale * factor),
    valueCr: Number((base[idx] * 0.000194 * scale * factor).toFixed(2)),
    flagged: Math.round(base[idx] * 0.001 * scale * factor),
  }));
}

export function getCategoryDistribution(org: Organisation) {
  const scale = org.scaleFactor;
  return [
    { category: 'B2B Settlement', share: 34, valueCr: Number((84.5 * scale).toFixed(2)) },
    { category: 'UPI Retail', share: 26, valueCr: Number((64.6 * scale).toFixed(2)) },
    { category: 'Vendor Payouts', share: 18, valueCr: Number((44.8 * scale).toFixed(2)) },
    { category: 'Loan Disbursal', share: 13, valueCr: Number((32.3 * scale).toFixed(2)) },
    { category: 'Treasury & Fx', share: 9, valueCr: Number((22.4 * scale).toFixed(2)) },
  ];
}

export function getFraudTrendSeries(org: Organisation, dateRange: DateRangeFilter) {
  const mult = DATE_RANGE_MULTIPLIER[dateRange.preset] * org.scaleFactor;
  const labels = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'];
  const detected = [1640, 1580, 1510, 1460, 1390, 1340, 1284];
  const preventedCr = [3.15, 3.42, 3.68, 3.95, 4.28, 4.56, 4.82];
  return labels.map((month, i) => ({
    month,
    detected: Math.max(12, Math.round(detected[i] * Math.max(0.25, mult))),
    preventedCr: Number((preventedCr[i] * Math.max(0.25, mult)).toFixed(2)),
    detectionRate: Number((96.8 + i * 0.32).toFixed(2)),
  }));
}

export function getSegmentRiskDistribution() {
  return [
    { segment: 'Salaried Prime', low: 88, moderate: 10, high: 2 },
    { segment: 'Enterprise MSME', low: 62, moderate: 27, high: 11 },
    { segment: 'Digital Merchant', low: 51, moderate: 31, high: 18 },
    { segment: 'HNI Retail', low: 76, moderate: 18, high: 6 },
    { segment: 'NBFC Partner', low: 69, moderate: 23, high: 8 },
  ];
}

export function getAutomationPerformanceSeries() {
  return [
    { function: 'Transaction Triage', automated: 94.2, humanReview: 5.8 },
    { function: 'Escrow Recon', automated: 97.7, humanReview: 2.3 },
    { function: 'V-KYC Verification', automated: 91.4, humanReview: 8.6 },
    { function: 'AML Screening', automated: 86.5, humanReview: 13.5 },
    { function: 'MSME Credit Memo', automated: 79.8, humanReview: 20.2 },
  ];
}

export function getMonthlyFinancialPerformance(org: Organisation) {
  const s = org.scaleFactor;
  return [
    { month: 'Jun', volumeCr: Number((184.2 * s).toFixed(1)), feeRevenueL: Number((94.5 * s).toFixed(1)), netYieldL: Number((68.2 * s).toFixed(1)) },
    { month: 'Jul', volumeCr: Number((196.8 * s).toFixed(1)), feeRevenueL: Number((102.1 * s).toFixed(1)), netYieldL: Number((74.4 * s).toFixed(1)) },
    { month: 'Aug', volumeCr: Number((208.5 * s).toFixed(1)), feeRevenueL: Number((109.8 * s).toFixed(1)), netYieldL: Number((80.1 * s).toFixed(1)) },
    { month: 'Sep', volumeCr: Number((221.4 * s).toFixed(1)), feeRevenueL: Number((118.4 * s).toFixed(1)), netYieldL: Number((87.6 * s).toFixed(1)) },
    { month: 'Oct', volumeCr: Number((236.9 * s).toFixed(1)), feeRevenueL: Number((126.2 * s).toFixed(1)), netYieldL: Number((93.9 * s).toFixed(1)) },
    { month: 'Nov', volumeCr: Number((248.6 * s).toFixed(1)), feeRevenueL: Number((134.8 * s).toFixed(1)), netYieldL: Number((101.4 * s).toFixed(1)) },
  ];
}

export function calculateDebtToRevenueRatio(app: LendingApplication): number {
  if (app.annualRevenueINR <= 0) return 0;
  return Number((app.existingLiabilitiesINR / app.annualRevenueINR).toFixed(2));
}

export function calculateReconciliationSummary(records: ReconciliationRecord[]) {
  const matched = records.filter((r) => r.status === 'Matched' || r.status === 'Resolved').length;
  const unmatched = records.filter((r) => r.status === 'Unmatched').length;
  const duplicates = records.filter((r) => r.status === 'Potential Duplicate').length;
  const totalVarianceINR = records.reduce((sum, r) => sum + Math.abs(r.varianceINR), 0);
  const sampleMatchRate = records.length > 0 ? Number(((matched / records.length) * 100).toFixed(2)) : 0;

  return {
    matched,
    unmatched,
    duplicates,
    totalVarianceINR,
    sampleMatchRate,
  };
}

export function sortTransactions(
  rows: TransactionRecord[],
  sortKey: 'recent' | 'timestamp' | 'amountINR' | 'riskScore' | 'id',
  direction: 'asc' | 'desc',
): TransactionRecord[] {
  if (sortKey === 'recent') {
    return direction === 'desc' ? [...rows] : [...rows].reverse();
  }
  const mult = direction === 'asc' ? 1 : -1;
  return [...rows].sort((a, b) => {
    if (sortKey === 'amountINR' || sortKey === 'riskScore') {
      return (a[sortKey] - b[sortKey]) * mult;
    }
    return a[sortKey].localeCompare(b[sortKey]) * mult;
  });
}

export function scoreIncomingTransaction(input: {
  amountINR: number;
  rail: TransactionRecord['rail'];
  city: string;
  duplicateFlag?: boolean;
}): { riskScore: number; status: TransactionRecord['status']; aiReason: string } {
  let score = 18;
  const reasons: string[] = [];

  if (input.amountINR >= 500000) {
    score += 36;
    reasons.push('High-value ₹5L+ institutional instruction');
  } else if (input.amountINR >= 150000) {
    score += 24;
    reasons.push('Elevated ticket size above segment median');
  } else if (input.amountINR >= 50000) {
    score += 10;
  }

  if (input.rail === 'IMPS Core' || input.rail === 'Razorpay PG') {
    score += 14;
    reasons.push(`${input.rail} instant velocity corridor`);
  }

  if (input.city.toLowerCase() === 'surat' || input.city.toLowerCase() === 'bhopal') {
    score += 16;
    reasons.push(`Active mule-watch corridor (${input.city})`);
  }

  if (input.duplicateFlag) {
    score += 28;
    reasons.push('Duplicate settlement hash detected');
  }

  const clamped = Math.max(8, Math.min(98, score));
  let status: TransactionRecord['status'] = 'Normal';
  if (clamped >= 90) status = 'Critical';
  else if (clamped >= 75) status = 'High';
  else if (clamped >= 55) status = 'Flagged';

  return {
    riskScore: clamped,
    status,
    aiReason:
      reasons.length > 0
        ? `${reasons.join('; ')}.`
        : `Nominal ${input.rail} payment within ${input.city} baseline thresholds.`,
  };
}

function splitCsvRow(line: string): string[] {
  const cols: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      cols.push(cur.trim());
      cur = '';
    } else {
      cur += ch;
    }
  }
  cols.push(cur.trim());
  return cols;
}

const VALID_RAILS: TransactionRecord['rail'][] = [
  'UPI Switch',
  'IMPS Core',
  'NEFT / RTGS',
  'Corporate Card',
  'Razorpay PG',
];

const VALID_CATEGORIES: TransactionRecord['category'][] = [
  'B2B Settlement',
  'Vendor Payout',
  'Retail Merchant',
  'Loan Disbursement',
  'Cross-Border Remittance',
  'Treasury Sweep',
  'Wallet Top-up',
];

export function parseTransactionCsv(csvText: string, orgId = 'org-bharatpay'): TransactionRecord[] {
  const lines = csvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length < 2) return [];

  const header = splitCsvRow(lines[0]).map((h) => h.toLowerCase());
  const idx = (name: string, fallback: number) => {
    const found = header.findIndex((h) => h.includes(name));
    return found >= 0 ? found : fallback;
  };

  const results: TransactionRecord[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = splitCsvRow(lines[i]);
    if (cols.length < 3) continue;

    const id = cols[idx('id', 0)] || `TXN-IMP-${9900 + i}`;
    const customerName = cols[idx('customer', 1)] || 'Enterprise Client';
    const merchantName = cols[idx('merchant', 2)] || 'Verified Counterparty';
    const rawRail = cols[idx('rail', 3)] || 'UPI Switch';
    const rail = VALID_RAILS.find((r) => r.toLowerCase() === rawRail.toLowerCase()) ?? 'UPI Switch';
    const amountRaw = Number((cols[idx('amount', 4)] || '0').replace(/[^0-9.-]/g, ''));
    const amountINR = Number.isFinite(amountRaw) && amountRaw > 0 ? amountRaw : 25000;
    const city = cols[idx('city', 5)] || 'Mumbai';
    const rawCat = cols[idx('category', 6)] || 'B2B Settlement';
    const category =
      VALID_CATEGORIES.find((c) => c.toLowerCase() === rawCat.toLowerCase()) ?? 'B2B Settlement';

    const duplicateFlag = results.some(
      (r) => r.customerName === customerName && r.amountINR === amountINR,
    );
    const scored = scoreIncomingTransaction({ amountINR, rail, city, duplicateFlag });

    results.push({
      id,
      timestamp: '2026-11-19 14:35 IST',
      daysAgo: 0,
      orgId,
      customerId: `CUS-IMP-${100 + i}`,
      customerName,
      merchantId: `MER-IMP-${200 + i}`,
      merchantName,
      category,
      rail,
      amountINR,
      riskScore: scored.riskScore,
      status: scored.status,
      city,
      ipAddress: `103.84.${120 + i}.${40 + i}`,
      deviceId: `DEV-BATCH-${710 + i}`,
      duplicateFlag,
      aiReason: scored.aiReason,
    });
  }
  return results;
}

const VALID_LEDGERS: ReconciliationRecord['sourceLedger'][] = [
  'HDFC Escrow',
  'ICICI Nodal',
  'SBI Treasury',
  'Razorpay Settlement',
  'NPCI UPI Switch',
];

export function parseReconciliationCsv(
  csvText: string,
  existingRefs: Set<string>,
): ReconciliationRecord[] {
  const lines = csvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length < 2) return [];

  const seenRefs = new Set<string>(existingRefs);
  const results: ReconciliationRecord[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = splitCsvRow(lines[i]);
    if (cols.length < 4) continue;

    const transactionRef = cols[0] || `TXN-BATCH-${i}`;
    const rawLedger = cols[1] || 'HDFC Escrow';
    const sourceLedger =
      VALID_LEDGERS.find((l) => l.toLowerCase() === rawLedger.toLowerCase()) ?? 'HDFC Escrow';
    const merchantName = cols[2] || 'Partner Merchant';
    const expectedAmountINR = Math.max(100, Number(cols[3].replace(/[^0-9.-]/g, '')) || 0);
    const settledAmountINR = Math.max(0, Number((cols[4] ?? cols[3]).replace(/[^0-9.-]/g, '')) || 0);
    const varianceINR = expectedAmountINR - settledAmountINR;

    let status: ReconciliationRecord['status'] = 'Matched';
    let discrepancyReason = 'Exact UTR & settlement amount matched during batch ingestion';

    if (seenRefs.has(transactionRef)) {
      status = 'Potential Duplicate';
      discrepancyReason = `Duplicate reference ${transactionRef} detected against active escrow ledger`;
    } else if (varianceINR !== 0) {
      status = 'Unmatched';
      discrepancyReason =
        varianceINR > 0
          ? `Short settlement of ₹${varianceINR.toLocaleString('en-IN')} flagged for nodal recovery`
          : `Excess settlement credit of ₹${Math.abs(varianceINR).toLocaleString('en-IN')}`;
    }

    seenRefs.add(transactionRef);
    results.push({
      id: `RCN-UPL-${8100 + i}`,
      batchId: 'BATCH-UPLOAD-20261119',
      sourceLedger,
      transactionRef,
      merchantName,
      expectedAmountINR,
      settledAmountINR,
      varianceINR,
      status,
      detectedAt: '2026-11-19 14:40 IST',
      discrepancyReason,
    });
  }
  return results;
}

const STREAM_CUSTOMERS = [
  { name: 'Harshad Patel', city: 'Surat' },
  { name: 'Priya Sharma', city: 'Bengaluru' },
  { name: 'Vikramjit Singh', city: 'Ludhiana' },
  { name: 'Aarav Mehta', city: 'Mumbai' },
  { name: 'Sneha Reddy', city: 'Hyderabad' },
];

const STREAM_MERCHANTS = [
  'Zaveri Bullion & Jewellers',
  'Swadeshi Mart Retail',
  'BharatSteel Logistics Pvt. Ltd.',
  'Indica FinTech Payouts',
  'Deccan Pharma Distributors',
];

export function createSimulatedLiveTransaction(sequenceNum: number): TransactionRecord {
  const cust = STREAM_CUSTOMERS[sequenceNum % STREAM_CUSTOMERS.length];
  const merch = STREAM_MERCHANTS[(sequenceNum * 2) % STREAM_MERCHANTS.length];
  const rail = VALID_RAILS[sequenceNum % VALID_RAILS.length];
  const category = VALID_CATEGORIES[sequenceNum % VALID_CATEGORIES.length];
  const amounts = [14500, 48000, 165000, 325000, 680000];
  const amountINR = amounts[sequenceNum % amounts.length];
  const duplicateFlag = sequenceNum % 5 === 0;
  const scored = scoreIncomingTransaction({
    amountINR,
    rail,
    city: cust.city,
    duplicateFlag,
  });

  const timeStr = new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  return {
    id: `TXN-LIVE-${99100 + sequenceNum}`,
    timestamp: `2026-11-19 ${timeStr} IST`,
    daysAgo: 0,
    orgId: 'org-bharatpay',
    customerId: `CUS-100${(sequenceNum % 9) + 1}`,
    customerName: cust.name,
    merchantId: `MER-20${(sequenceNum % 9) + 1}`,
    merchantName: merch,
    category,
    rail,
    amountINR,
    riskScore: scored.riskScore,
    status: scored.status,
    city: cust.city,
    ipAddress: `103.84.${100 + (sequenceNum % 90)}.${20 + (sequenceNum % 150)}`,
    deviceId: `DEV-STREAM-${400 + sequenceNum}`,
    duplicateFlag,
    aiReason: scored.aiReason,
  };
}
