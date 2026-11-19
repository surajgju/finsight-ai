import { LendingApplication } from '../types';

export const INITIAL_LENDING_APPLICATIONS: LendingApplication[] = [
  {
    id: 'LN-8001',
    borrowerName: 'ABC Manufacturing Pvt. Ltd.',
    industry: 'Precision Engineering',
    city: 'Pune',
    requestedLoanINR: 7500000,
    annualRevenueINR: 48000000,
    existingLiabilitiesINR: 12000000,
    creditScore: 782,
    defaultProbability: 3.2,
    riskClassification: 'Low',
    aiAssessment: 'Positive',
    gstComplianceMonths: 36,
    repaymentScore: 96,
    altDataSignal: '36/36 on-time GST filings · 1.94x DSCR · Zero cheque bounces',
    aiExplanation:
      'ABC Manufacturing exhibits strong working-capital velocity with ₹4.80 Cr annualised GST turnover and conservative leverage (0.25x debt-to-revenue). Simulated cashflow telemetry indicates healthy receivables turnover (41 days) and reliable utility/payroll continuity.',
    status: 'Approved (Simulated)',
    submittedDate: '2026-11-18',
  },
  {
    id: 'LN-8002',
    borrowerName: 'Surya Textile Mills LLP',
    industry: 'Textiles & Apparel',
    city: 'Ahmedabad',
    requestedLoanINR: 12500000,
    annualRevenueINR: 64000000,
    existingLiabilitiesINR: 28500000,
    creditScore: 694,
    defaultProbability: 7.4,
    riskClassification: 'Elevated',
    aiAssessment: 'Conditional',
    gstComplianceMonths: 29,
    repaymentScore: 78,
    altDataSignal: '2 delayed GSTR-3B filings in Q3 · Receivable cycle stretched to 74 days',
    aiExplanation:
      'Top-line order book remains steady, but elevated existing liabilities (₹2.85 Cr) and recent textile sector receivable delays push illustrative PD to 7.4%. Recommend collateral top-up or ₹90 L staged disbursement.',
    status: 'Committee Review',
    submittedDate: '2026-11-17',
  },
  {
    id: 'LN-8003',
    borrowerName: 'Deccan Pharma Distributors',
    industry: 'Healthcare & Pharma',
    city: 'Hyderabad',
    requestedLoanINR: 5000000,
    annualRevenueINR: 44600000,
    existingLiabilitiesINR: 8200000,
    creditScore: 804,
    defaultProbability: 2.1,
    riskClassification: 'Low',
    aiAssessment: 'Positive',
    gstComplianceMonths: 48,
    repaymentScore: 98,
    altDataSignal: '48/48 on-time GST filings · 2.4x interest coverage · AAA hospital buyers',
    aiExplanation:
      'Consistent institutional hospital cashflows and minimal existing debt yield an illustrative 2.1% default probability. Strong candidate for automated straight-through underwriting.',
    status: 'Approved (Simulated)',
    submittedDate: '2026-11-17',
  },
  {
    id: 'LN-8004',
    borrowerName: 'Nirman Infra Materials Pvt. Ltd.',
    industry: 'Construction Supply',
    city: 'Jaipur',
    requestedLoanINR: 15000000,
    annualRevenueINR: 71000000,
    existingLiabilitiesINR: 39000000,
    creditScore: 658,
    defaultProbability: 11.8,
    riskClassification: 'High',
    aiAssessment: 'Review Required',
    gstComplianceMonths: 22,
    repaymentScore: 69,
    altDataSignal: '89% OD line utilization · 2 ECS bounces in last 6 months',
    aiExplanation:
      'High existing debt burden (₹3.90 Cr) combined with frequent overdraft peak utilization indicates tight liquidity headroom. Manual credit committee scrutiny advised.',
    status: 'Underwriting',
    submittedDate: '2026-11-16',
  },
  {
    id: 'LN-8005',
    borrowerName: 'VayuCloud SaaS Systems',
    industry: 'Enterprise Software',
    city: 'Bengaluru',
    requestedLoanINR: 6000000,
    annualRevenueINR: 34500000,
    existingLiabilitiesINR: 4500000,
    creditScore: 791,
    defaultProbability: 2.6,
    riskClassification: 'Low',
    aiAssessment: 'Positive',
    gstComplianceMonths: 32,
    repaymentScore: 95,
    altDataSignal: '94% recurring ARR retention · 18 months cash runway',
    aiExplanation:
      'Predictable B2B subscription receivables and low leverage support clean revenue-based financing eligibility.',
    status: 'Approved (Simulated)',
    submittedDate: '2026-11-15',
  },
  {
    id: 'LN-8006',
    borrowerName: 'Kaveri Agro Exports',
    industry: 'Agri Commodities',
    city: 'Chennai',
    requestedLoanINR: 9500000,
    annualRevenueINR: 52000000,
    existingLiabilitiesINR: 19000000,
    creditScore: 734,
    defaultProbability: 4.9,
    riskClassification: 'Moderate',
    aiAssessment: 'Positive',
    gstComplianceMonths: 34,
    repaymentScore: 87,
    altDataSignal: 'ECGC export cover active · Seasonal Q2–Q3 cashflow peak',
    aiExplanation:
      'Moderate seasonal working-capital cyclicality offset by verified export letters of credit and timely GST filings.',
    status: 'Underwriting',
    submittedDate: '2026-11-15',
  },
];

const EXTRA_BORROWERS = [
  { name: 'Vindhya Auto Ancillaries', industry: 'Automotive Parts', city: 'Chennai', rev: 58000000, debt: 14500000, req: 8500000, score: 774, pd: 3.4 },
  { name: 'Shakti Solar Energy Systems', industry: 'CleanTech EPC', city: 'Gandhinagar', rev: 41000000, debt: 11200000, req: 6500000, score: 761, pd: 3.9 },
  { name: 'Pragati Electronics Hub', industry: 'Retail Distribution', city: 'Kolkata', rev: 29500000, debt: 13800000, req: 4200000, score: 702, pd: 6.5 },
  { name: 'KisanDirect Agri Supply', industry: 'AgriTech B2B', city: 'Indore', rev: 24000000, debt: 6400000, req: 3500000, score: 748, pd: 4.3 },
  { name: 'Sahara Express Courier', industry: 'Logistics', city: 'Gurugram', rev: 36000000, debt: 17500000, req: 7000000, score: 685, pd: 8.1 },
  { name: 'Amrit Dairy Co-operative', industry: 'FMCG Processing', city: 'Vadodara', rev: 62000000, debt: 12000000, req: 9000000, score: 812, pd: 1.9 },
  { name: 'NavaTech Precision Tools', industry: 'Industrial Hardware', city: 'Pune', rev: 31500000, debt: 9200000, req: 4800000, score: 756, pd: 4.0 },
  { name: 'Malabar Spice Traders', industry: 'Food Exports', city: 'Kochi', rev: 27000000, debt: 8900000, req: 4000000, score: 729, pd: 5.1 },
  { name: 'VidyaSpark EdTech Pvt. Ltd.', industry: 'EdTech', city: 'Noida', rev: 21500000, debt: 9800000, req: 3200000, score: 676, pd: 8.9 },
  { name: 'BharatSteel Logistics', industry: 'Heavy Freight', city: 'Mumbai', rev: 84000000, debt: 24000000, req: 14000000, score: 768, pd: 3.7 },
  { name: 'ArogyaCare Diagnostics', industry: 'Healthcare', city: 'Hyderabad', rev: 33000000, debt: 7100000, req: 5200000, score: 795, pd: 2.4 },
  { name: 'Lotus Digital Commerce', industry: 'Digital Retail', city: 'Delhi NCR', rev: 26000000, debt: 15200000, req: 5500000, score: 632, pd: 13.6 },
  { name: 'Swadeshi Mart Retail', industry: 'Omnichannel Retail', city: 'Bengaluru', rev: 49000000, debt: 13000000, req: 6800000, score: 759, pd: 4.1 },
  { name: 'Zaveri Crafts & Metals', industry: 'Jewellery Wholesale', city: 'Surat', rev: 55000000, debt: 29500000, req: 11000000, score: 648, pd: 12.2 },
  { name: 'Indus Cold Chain Storage', industry: 'Agri Logistics', city: 'Nashik', rev: 38000000, debt: 11800000, req: 6200000, score: 742, pd: 4.6 },
  { name: 'Ganga Paper & Packaging', industry: 'Packaging', city: 'Kanpur', rev: 42500000, debt: 14200000, req: 5800000, score: 721, pd: 5.4 },
];

export const MOCK_LENDING_APPLICATIONS: LendingApplication[] = [
  ...INITIAL_LENDING_APPLICATIONS,
  ...EXTRA_BORROWERS.map((b, idx) => {
    const riskClassification: LendingApplication['riskClassification'] =
      b.pd <= 4 ? 'Low' : b.pd <= 6 ? 'Moderate' : b.pd <= 10 ? 'Elevated' : 'High';
    const aiAssessment: LendingApplication['aiAssessment'] =
      b.pd <= 5 ? 'Positive' : b.pd <= 9 ? 'Conditional' : 'Review Required';
    const status: LendingApplication['status'] =
      b.pd <= 4.1
        ? 'Approved (Simulated)'
        : b.pd >= 12
          ? 'Declined (Simulated)'
          : idx % 2 === 0
            ? 'Underwriting'
            : 'Committee Review';

    return {
      id: `LN-${8007 + idx}`,
      borrowerName: b.name,
      industry: b.industry,
      city: b.city,
      requestedLoanINR: b.req,
      annualRevenueINR: b.rev,
      existingLiabilitiesINR: b.debt,
      creditScore: b.score,
      defaultProbability: b.pd,
      riskClassification,
      aiAssessment,
      gstComplianceMonths: b.pd <= 5 ? 34 : 21,
      repaymentScore: Math.max(62, Math.min(98, Math.round(100 - b.pd * 2.4))),
      altDataSignal:
        b.pd <= 5
          ? 'Consistent GSTR-1 invoice match · Healthy banking float'
          : 'Elevated working capital utilization · Monitor receivable ageing',
      aiExplanation: `Simulated cashflow model evaluates ${b.name} at ${(b.debt / b.rev).toFixed(2)}x debt-to-revenue with an illustrative ${b.pd}% 12-month default probability.`,
      status,
      submittedDate: `2026-11-${String(Math.max(2, 14 - (idx % 12))).padStart(2, '0')}`,
    };
  }),
];
