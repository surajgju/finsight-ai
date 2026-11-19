import { PaymentRail, TransactionCategory, TransactionRecord, TransactionStatus } from '../types';
import { MOCK_CUSTOMERS, MOCK_MERCHANTS } from './mockCustomers';

const ORG_IDS = ['org-bharatpay', 'org-navaratna', 'org-sahyadri'];
const RAILS: PaymentRail[] = ['UPI Switch', 'IMPS Core', 'NEFT / RTGS', 'Corporate Card', 'Razorpay PG'];
const CATEGORIES: TransactionCategory[] = [
  'B2B Settlement',
  'Vendor Payout',
  'Retail Merchant',
  'Loan Disbursement',
  'Cross-Border Remittance',
  'Treasury Sweep',
  'Wallet Top-up',
];

const FEATURED_TRANSACTIONS: TransactionRecord[] = [
  {
    id: 'TXN-98231',
    timestamp: '2026-11-19 14:12 IST',
    daysAgo: 0,
    orgId: 'org-bharatpay',
    customerId: 'CUS-1009',
    customerName: 'Harshad Patel',
    merchantId: 'MER-203',
    merchantName: 'Zaveri Bullion & Jewellers',
    category: 'B2B Settlement',
    rail: 'IMPS Core',
    amountINR: 245000,
    riskScore: 96,
    status: 'Critical',
    city: 'Surat',
    ipAddress: '103.84.212.47',
    deviceId: 'DEV-AND-9941A',
    duplicateFlag: false,
    muleNetworkCluster: 'CLUSTER-SRT-04',
    aiReason: 'Rapid fan-in from 9 newly opened UPI handles followed by immediate ₹2.45L bullion settlement on unseen device.',
  },
  {
    id: 'TXN-98232',
    timestamp: '2026-11-19 13:58 IST',
    daysAgo: 0,
    orgId: 'org-bharatpay',
    customerId: 'CUS-1002',
    customerName: 'Priya Sharma',
    merchantId: 'MER-202',
    merchantName: 'Swadeshi Mart Retail',
    category: 'Retail Merchant',
    rail: 'UPI Switch',
    amountINR: 18500,
    riskScore: 24,
    status: 'Normal',
    city: 'Bengaluru',
    ipAddress: '49.205.114.88',
    deviceId: 'DEV-IOS-4421B',
    duplicateFlag: false,
    aiReason: 'Consistent Bengaluru geolocation, verified V-KYC device fingerprint, within 30-day spend baseline.',
  },
  {
    id: 'TXN-98233',
    timestamp: '2026-11-19 13:41 IST',
    daysAgo: 0,
    orgId: 'org-navaratna',
    customerId: 'CUS-1015',
    customerName: 'Farhan Siddiqui',
    merchantId: 'MER-211',
    merchantName: 'Indica FinTech Payouts',
    category: 'Vendor Payout',
    rail: 'Razorpay PG',
    amountINR: 120000,
    riskScore: 82,
    status: 'High',
    city: 'Mumbai',
    ipAddress: '182.73.94.19',
    deviceId: 'DEV-WEB-8120X',
    duplicateFlag: true,
    muleNetworkCluster: 'CLUSTER-MUM-11',
    aiReason: 'Duplicate payout signature detected within 90 seconds from shared VPN subnet and high-velocity merchant.',
  },
  {
    id: 'TXN-98234',
    timestamp: '2026-11-19 13:24 IST',
    daysAgo: 0,
    orgId: 'org-sahyadri',
    customerId: 'CUS-1006',
    customerName: 'Nandini Iyer',
    merchantId: 'MER-219',
    merchantName: 'Apex Wealth Advisory',
    category: 'Treasury Sweep',
    rail: 'NEFT / RTGS',
    amountINR: 45000,
    riskScore: 15,
    status: 'Normal',
    city: 'Chennai',
    ipAddress: '117.198.42.103',
    deviceId: 'DEV-IOS-1182C',
    duplicateFlag: false,
    aiReason: 'Scheduled recurring wealth mandate from long-standing Full KYC HNI profile.',
  },
  {
    id: 'TXN-98235',
    timestamp: '2026-11-19 12:55 IST',
    daysAgo: 0,
    orgId: 'org-bharatpay',
    customerId: 'CUS-1001',
    customerName: 'Aarav Mehta',
    merchantId: 'MER-222',
    merchantName: 'Lotus Digital Commerce',
    category: 'Cross-Border Remittance',
    rail: 'Corporate Card',
    amountINR: 485000,
    riskScore: 91,
    status: 'Critical',
    city: 'Mumbai',
    ipAddress: '103.21.160.192',
    deviceId: 'DEV-AND-7721Q',
    duplicateFlag: false,
    muleNetworkCluster: 'CLUSTER-MUM-11',
    aiReason: 'Device emulator flags paired with 3x jump in average ticket size and anomalous IP hop from Mumbai to Dubai proxy.',
  },
  {
    id: 'TXN-98236',
    timestamp: '2026-11-19 12:18 IST',
    daysAgo: 0,
    orgId: 'org-navaratna',
    customerId: 'CUS-1003',
    customerName: 'Vikramjit Singh',
    merchantId: 'MER-207',
    merchantName: 'Surya Textile Mills',
    category: 'Loan Disbursement',
    rail: 'NEFT / RTGS',
    amountINR: 1450000,
    riskScore: 74,
    status: 'Flagged',
    city: 'Ludhiana',
    ipAddress: '122.173.44.12',
    deviceId: 'DEV-WIN-3092M',
    duplicateFlag: false,
    aiReason: 'Working capital disbursement routed to secondary vendor account created 72 hours prior.',
  },
];

const AMOUNTS_POOL = [
  1250, 4800, 9500, 14200, 18500, 24000, 32500, 45000, 58000, 74500,
  96000, 115000, 142000, 185000, 230000, 310000, 465000, 620000, 890000, 1250000, 2150000, 3850000,
];

function generateRemainingTransactions(): TransactionRecord[] {
  const rows: TransactionRecord[] = [];
  for (let i = 0; i < 99; i++) {
    const idNum = 98237 + i;
    const customer = MOCK_CUSTOMERS[(i * 7 + 3) % MOCK_CUSTOMERS.length];
    const merchant = MOCK_MERCHANTS[(i * 5 + 2) % MOCK_MERCHANTS.length];
    const orgId = ORG_IDS[i % ORG_IDS.length];
    const rail = RAILS[(i * 3 + 1) % RAILS.length];
    const category = CATEGORIES[(i * 2 + 1) % CATEGORIES.length];
    const amountINR = AMOUNTS_POOL[(i * 11 + 5) % AMOUNTS_POOL.length];

    // Deterministic daysAgo spread across 0 to 88 days
    const daysAgo = i < 12 ? 0 : i < 34 ? (i % 6) + 1 : i < 72 ? (i % 23) + 7 : (i % 58) + 31;
    const day = Math.max(1, 19 - (daysAgo % 18));
    const month = daysAgo > 18 && daysAgo <= 48 ? '10' : daysAgo > 48 ? '09' : '11';
    const hour = String(8 + ((i * 3) % 13)).padStart(2, '0');
    const minute = String((i * 17) % 60).padStart(2, '0');

    // Deterministic risk distribution matching realistic enterprise telemetry
    let riskScore = (customer.riskScore * 0.45 + ((i * 29) % 55)) % 100;
    riskScore = Math.max(8, Math.min(97, Math.round(riskScore)));
    if (i % 19 === 0) riskScore = 92 + (i % 6);
    else if (i % 11 === 0) riskScore = 76 + (i % 11);
    else if (i % 7 === 0) riskScore = 54 + (i % 15);
    else if (riskScore > 65) riskScore = 14 + (i % 28);

    let status: TransactionStatus = 'Normal';
    if (riskScore >= 90) status = 'Critical';
    else if (riskScore >= 75) status = 'High';
    else if (riskScore >= 55) status = 'Flagged';
    else if (i % 29 === 0) status = 'Cleared';

    const duplicateFlag = i % 23 === 0;
    const muleNetworkCluster =
      riskScore >= 85 ? `CLUSTER-${customer.city.slice(0, 3).toUpperCase()}-0${(i % 5) + 1}` : undefined;

    const aiReason =
      status === 'Critical'
        ? `High-velocity burst (${(i % 6) + 4} txns/10m) from ${customer.city} linked to unverified beneficiary cluster.`
        : status === 'High'
          ? `Anomalous ${rail} ticket size vs 90-day profile median; device ASN mismatch detected.`
          : status === 'Flagged'
            ? duplicateFlag
              ? 'Potential duplicate settlement hash queued for reconciliation check.'
              : `Elevated velocity pattern on ${merchant.name}; secondary step-up verification advised.`
            : `Nominal ${rail} behaviour matching verified ${customer.kycTier} profile in ${customer.city}.`;

    rows.push({
      id: `TXN-${idNum}`,
      timestamp: `2026-${month}-${String(day).padStart(2, '0')} ${hour}:${minute} IST`,
      daysAgo,
      orgId,
      customerId: customer.id,
      customerName: customer.name,
      merchantId: merchant.id,
      merchantName: merchant.name,
      category,
      rail,
      amountINR,
      riskScore,
      status,
      city: customer.city,
      ipAddress: `103.${20 + ((i * 7) % 180)}.${14 + ((i * 13) % 220)}.${10 + ((i * 19) % 230)}`,
      deviceId: `DEV-${i % 2 === 0 ? 'AND' : 'IOS'}-${1000 + i * 37}`,
      duplicateFlag,
      muleNetworkCluster,
      aiReason,
    });
  }
  return rows;
}

export const INITIAL_TRANSACTIONS: TransactionRecord[] = [
  ...FEATURED_TRANSACTIONS,
  ...generateRemainingTransactions(),
];
