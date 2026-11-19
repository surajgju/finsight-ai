import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateDebtToRevenueRatio,
  calculateReconciliationSummary,
  computeExecutiveKPIs,
  createSimulatedLiveTransaction,
  filterTransactionsByScope,
  parseReconciliationCsv,
  parseTransactionCsv,
  scoreIncomingTransaction,
  sortTransactions,
} from './analyticsService';
import { ORGANISATIONS } from '../data/mockOrganisations';
import { INITIAL_TRANSACTIONS } from '../data/mockTransactions';
import { MOCK_LENDING_APPLICATIONS } from '../data/mockLending';
import { INITIAL_RECONCILIATION_RECORDS } from '../data/mockReconciliation';
import { buildCSVContent, formatINR, formatINRCompact } from '../utils/formatters';

test('formatINR and formatINRCompact apply Indian numbering conventions', () => {
  assert.equal(formatINR(245000), '₹2,45,000');
  assert.equal(formatINR(7500000), '₹75,00,000');
  assert.equal(formatINRCompact(2486500000), '₹248.65 Cr');
  assert.equal(formatINRCompact(48200000), '₹4.82 Cr');
  assert.equal(formatINRCompact(7500000), '₹75.00 L');
});

test('computeExecutiveKPIs produces benchmark figures for consolidated 30d view and scales by date range', () => {
  const apex = ORGANISATIONS[0];
  const kpis30 = computeExecutiveKPIs(apex, { preset: '30d' }, INITIAL_TRANSACTIONS);
  const kpis7 = computeExecutiveKPIs(apex, { preset: '7d' }, INITIAL_TRANSACTIONS);

  const tx30 = kpis30.find((k) => k.id === 'total-transactions');
  const val30 = kpis30.find((k) => k.id === 'total-value');
  const fraudRate30 = kpis30.find((k) => k.id === 'fraud-detection-rate');
  const riskScore30 = kpis30.find((k) => k.id === 'risk-score');
  const tx7 = kpis7.find((k) => k.id === 'total-transactions');

  assert.equal(tx30?.formattedValue, '1,284,590');
  assert.equal(val30?.formattedValue, '₹248.65 Cr');
  assert.equal(fraudRate30?.formattedValue, '98.72%');
  assert.equal(riskScore30?.formattedValue, '18.4 / 100');
  assert.ok((tx7?.rawValue ?? 0) < (tx30?.rawValue ?? 0));
});

test('filterTransactionsByScope narrows records by organisation and daysAgo', () => {
  const all30 = filterTransactionsByScope(INITIAL_TRANSACTIONS, 'org-apex', { preset: '30d' });
  const todayOnly = filterTransactionsByScope(INITIAL_TRANSACTIONS, 'org-apex', { preset: 'today' });
  const pgOnly = filterTransactionsByScope(INITIAL_TRANSACTIONS, 'org-bharatpay', { preset: '90d' });

  assert.ok(todayOnly.length > 0 && todayOnly.length < all30.length);
  assert.ok(pgOnly.every((t) => t.orgId === 'org-bharatpay'));
});

test('sortTransactions orders accurately by riskScore and amountINR', () => {
  const sortedByRiskDesc = sortTransactions(INITIAL_TRANSACTIONS.slice(0, 10), 'riskScore', 'desc');
  for (let i = 1; i < sortedByRiskDesc.length; i++) {
    assert.ok(sortedByRiskDesc[i - 1].riskScore >= sortedByRiskDesc[i].riskScore);
  }
});

test('calculateDebtToRevenueRatio computes accurate borrower leverage for ABC Manufacturing', () => {
  const abc = MOCK_LENDING_APPLICATIONS[0];
  assert.equal(abc.borrowerName, 'ABC Manufacturing Pvt. Ltd.');
  assert.equal(calculateDebtToRevenueRatio(abc), 0.25);
});

test('calculateReconciliationSummary totals matched, unmatched, and duplicates accurately', () => {
  const summary = calculateReconciliationSummary(INITIAL_RECONCILIATION_RECORDS);
  assert.equal(
    summary.matched + summary.unmatched + summary.duplicates,
    INITIAL_RECONCILIATION_RECORDS.length,
  );
  assert.ok(summary.totalVarianceINR > 0);
});

test('buildCSVContent escapes commas and quotes cleanly', () => {
  const csv = buildCSVContent([
    { id: 'TXN-1', merchant: 'Apex, Inc.', amount: 1200 },
  ]);
  assert.equal(csv, 'id,merchant,amount\nTXN-1,"Apex, Inc.",1200');
});

test('scoreIncomingTransaction and parseTransactionCsv classify uploaded CSV rows deterministically', () => {
  const highRisk = scoreIncomingTransaction({
    amountINR: 620000,
    rail: 'IMPS Core',
    city: 'Surat',
    duplicateFlag: true,
  });
  assert.equal(highRisk.status, 'Critical');
  assert.ok(highRisk.riskScore >= 90);

  const csv = [
    'id,customer,merchant,rail,amount,city,category',
    'TXN-CSV-1,Harshad Patel,Zaveri Bullion,IMPS Core,550000,Surat,B2B Settlement',
    'TXN-CSV-2,Priya Sharma,Swadeshi Mart,UPI Switch,12000,Bengaluru,Retail Merchant',
  ].join('\n');

  const parsed = parseTransactionCsv(csv);
  assert.equal(parsed.length, 2);
  assert.equal(parsed[0].status, 'High');
  assert.equal(parsed[1].status, 'Normal');
});

test('parseReconciliationCsv detects matched, unmatched variance, and duplicate refs', () => {
  const csv = [
    'transactionRef,sourceLedger,merchantName,expectedAmountINR,settledAmountINR',
    'TXN-98231,HDFC Escrow,Zaveri Bullion,245000,245000',
    'TXN-NEW-1,ICICI Nodal,BharatSteel,100000,92000',
    'TXN-NEW-2,NPCI UPI Switch,Swadeshi Mart,50000,50000',
  ].join('\n');

  const existing = new Set(['TXN-98231']);
  const parsed = parseReconciliationCsv(csv, existing);
  assert.equal(parsed.length, 3);
  assert.equal(parsed[0].status, 'Potential Duplicate');
  assert.equal(parsed[1].status, 'Unmatched');
  assert.equal(parsed[1].varianceINR, 8000);
  assert.equal(parsed[2].status, 'Matched');
});

test('createSimulatedLiveTransaction generates deterministic scored stream items', () => {
  const item = createSimulatedLiveTransaction(5);
  assert.ok(item.id.startsWith('TXN-LIVE-'));
  assert.equal(item.duplicateFlag, true);
});
