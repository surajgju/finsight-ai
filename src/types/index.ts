export type NavPageId =
  | 'executive-dashboard'
  | 'ai-intelligence'
  | 'financial-analytics'
  | 'transaction-monitoring'
  | 'fraud-detection'
  | 'credit-lending'
  | 'financial-reconciliation'
  | 'risk-management'
  | 'kyc-aml'
  | 'compliance-monitoring'
  | 'ai-agent-centre'
  | 'agent-history'
  | 'ai-recommendations'
  | 'reports'
  | 'integrations'
  | 'org-settings'
  | 'user-management';

export type DateRangePreset = 'today' | '7d' | '30d' | '90d' | 'custom';

export interface DateRangeFilter {
  preset: DateRangePreset;
  customStart?: string;
  customEnd?: string;
}

export interface Organisation {
  id: string;
  name: string;
  shortName: string;
  type: 'Group Consolidated' | 'Payment Gateway' | 'NBFC Lending' | 'NeoBank Treasury';
  regNumber: string;
  headquarters: string;
  scaleFactor: number;
}

export interface KpiMetric {
  id: string;
  label: string;
  formattedValue: string;
  rawValue: number;
  deltaPercent: number;
  trendDirection: 'up' | 'down';
  positiveIsGood: boolean;
  sparkline: number[];
  tooltip: string;
}

export type TransactionStatus = 'Normal' | 'Flagged' | 'High' | 'Critical' | 'Cleared' | 'Blocked';
export type PaymentRail = 'UPI Switch' | 'IMPS Core' | 'NEFT / RTGS' | 'Corporate Card' | 'Razorpay PG';
export type TransactionCategory =
  | 'B2B Settlement'
  | 'Vendor Payout'
  | 'Retail Merchant'
  | 'Loan Disbursement'
  | 'Cross-Border Remittance'
  | 'Treasury Sweep'
  | 'Wallet Top-up';

export interface CustomerProfile {
  id: string;
  name: string;
  segment: 'Enterprise MSME' | 'HNI Retail' | 'Salaried Prime' | 'Digital Merchant' | 'NBFC Partner';
  city: string;
  kycTier: 'Full KYC' | 'V-KYC Verified' | 'Pending Review';
  riskScore: number;
  monthlyVolumeINR: number;
  accountAgeMonths: number;
  linkedAccounts: number;
}

export interface MerchantProfile {
  id: string;
  name: string;
  category: string;
  city: string;
  gateway: PaymentRail;
  monthlyTurnoverINR: number;
  successRate: number;
  chargebackRate: number;
  settlementStatus: 'Settled' | 'T+1 Pending' | 'Under Review';
}

export interface TransactionRecord {
  id: string;
  timestamp: string;
  daysAgo: number;
  orgId: string;
  customerId: string;
  customerName: string;
  merchantId: string;
  merchantName: string;
  category: TransactionCategory;
  rail: PaymentRail;
  amountINR: number;
  riskScore: number;
  status: TransactionStatus;
  city: string;
  ipAddress: string;
  deviceId: string;
  duplicateFlag: boolean;
  muleNetworkCluster?: string;
  aiReason: string;
  reviewerNote?: string;
}

export interface FraudCase {
  id: string;
  title: string;
  transactionId: string;
  customerName: string;
  patternType:
    | 'Mule Network Ring'
    | 'Device Spoofing & Velocity'
    | 'Duplicate Settlement'
    | 'SIM Swap Anomaly'
    | 'Cross-Border Layering';
  severity: 'Critical' | 'High' | 'Medium';
  amountAtRiskINR: number;
  detectedAt: string;
  status: 'Open' | 'Investigating' | 'Contained' | 'Escalated to FIU';
  confidence: number;
  linkedDevices: number;
  linkedAccounts: number;
  summary: string;
}

export interface AIInsight {
  id: string;
  title: string;
  category: 'Fraud' | 'Mule Network' | 'Credit Risk' | 'Gateway Health' | 'Liquidity' | 'Compliance';
  severity: 'Critical' | 'High' | 'Medium' | 'Advisory';
  detectedAt: string;
  metricLabel: string;
  metricValue: string;
  explanation: string;
  recommendedAction: string;
  relatedPage: NavPageId;
  acknowledged: boolean;
}

export interface AIRecommendation {
  id: string;
  title: string;
  module: string;
  impactMetric: string;
  confidence: number;
  effort: 'Low' | 'Medium' | 'High';
  status: 'Pending Review' | 'Approved' | 'Deployed';
  description: string;
}

export interface LendingApplication {
  id: string;
  borrowerName: string;
  industry: string;
  city: string;
  requestedLoanINR: number;
  annualRevenueINR: number;
  existingLiabilitiesINR: number;
  creditScore: number;
  defaultProbability: number;
  riskClassification: 'Low' | 'Moderate' | 'Elevated' | 'High';
  aiAssessment: 'Positive' | 'Conditional' | 'Review Required';
  gstComplianceMonths: number;
  repaymentScore: number;
  altDataSignal: string;
  aiExplanation: string;
  status: 'Approved (Simulated)' | 'Underwriting' | 'Committee Review' | 'Declined (Simulated)';
  submittedDate: string;
}

export interface KycRecord {
  id: string;
  customerId: string;
  customerName: string;
  entityType: 'Individual' | 'Private Limited' | 'Partnership' | 'Proprietorship';
  city: string;
  verificationStatus: 'Verified' | 'Pending KYC' | 'AML Flagged' | 'Document Expired';
  riskClassification: 'Low' | 'Medium' | 'High';
  lastVerifiedDate: string;
  documentScore: number;
  amlHits: number;
  assignedOfficer: string;
}

export interface ReconciliationRecord {
  id: string;
  batchId: string;
  sourceLedger: 'HDFC Escrow' | 'ICICI Nodal' | 'SBI Treasury' | 'Razorpay Settlement' | 'NPCI UPI Switch';
  transactionRef: string;
  merchantName: string;
  expectedAmountINR: number;
  settledAmountINR: number;
  varianceINR: number;
  status: 'Matched' | 'Unmatched' | 'Potential Duplicate' | 'Resolved';
  detectedAt: string;
  discrepancyReason: string;
}

export interface AIAgent {
  id: string;
  name: string;
  role: string;
  status: 'Active' | 'Processing' | 'Idle';
  tasksProcessed: number;
  successRate: number;
  avgExecutionMs: number;
  lastExecution: string;
  workloadPercent: number;
  modelTier: string;
}

export interface AgentExecutionRecord {
  id: string;
  agentId: string;
  agentName: string;
  taskSummary: string;
  targetEntity: string;
  startedAt: string;
  durationMs: number;
  outcome: 'Completed' | 'Escalated' | 'Warning';
  recordsEvaluated: number;
  confidence: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  severity: 'Critical' | 'High' | 'Info';
  timestamp: string;
  read: boolean;
  targetPage: NavPageId;
}

export interface ReportTemplate {
  id: string;
  name: string;
  category: 'Regulatory' | 'Fraud & Risk' | 'Finance & Recon' | 'Credit Portfolio';
  cadence: 'Daily' | 'Weekly' | 'Monthly' | 'On-Demand';
  lastGenerated: string;
  format: 'CSV' | 'JSON Brief';
  description: string;
}

export interface IntegrationItem {
  id: string;
  name: string;
  category: 'Payment Rail' | 'Core Banking' | 'Credit Bureau' | 'KYC / Identity';
  status: 'Connected' | 'Sandbox' | 'Syncing';
  lastSync: string;
  throughput: string;
  enabled: boolean;
}

export interface TeamUser {
  id: string;
  name: string;
  email: string;
  role: 'Chief Risk Officer' | 'Fraud Ops Lead' | 'Credit Underwriter' | 'Compliance Officer' | 'Finance Controller';
  department: string;
  status: 'Active' | 'Invited';
  lastActive: string;
  mfaEnabled: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  toolCalls?: string[];
  error?: boolean;
}

export type GovernanceRole = 'Checker' | 'Maker';

export interface DemoActor {
  id: string;
  name: string;
  title: string;
  governanceRole: GovernanceRole;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorName: string;
  actorTitle: string;
  action: string;
  entityType: 'Transaction' | 'Fraud Case' | 'KYC Record' | 'Reconciliation' | 'AI Policy' | 'Batch Import';
  entityId: string;
  previousValue: string;
  newValue: string;
  note: string;
}

export interface MakerCheckerApproval {
  id: string;
  createdAt: string;
  makerName: string;
  makerTitle: string;
  actionTitle: string;
  entityType: 'Transaction' | 'AI Policy';
  entityId: string;
  amountINR?: number;
  targetStatus: string;
  summary: string;
  status: 'Pending Checker' | 'Approved' | 'Rejected';
  checkerName?: string;
  resolvedAt?: string;
}

