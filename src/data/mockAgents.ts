import { AIAgent, AgentExecutionRecord } from '../types';

export const INITIAL_AI_AGENTS: AIAgent[] = [
  {
    id: 'AGT-01',
    name: 'Fraud Detection Agent',
    role: 'Real-time UPI/IMPS/Card velocity scoring & mule-graph isolation',
    status: 'Active',
    tasksProcessed: 412890,
    successRate: 99.4,
    avgExecutionMs: 42,
    lastExecution: '18 seconds ago',
    workloadPercent: 74,
    modelTier: 'Real-Time Risk Classifier',
  },
  {
    id: 'AGT-02',
    name: 'Financial Reconciliation Agent',
    role: 'Automated nodal escrow matching, UTR deduplication & variance triage',
    status: 'Processing',
    tasksProcessed: 48920,
    successRate: 97.7,
    avgExecutionMs: 185,
    lastExecution: '42 seconds ago',
    workloadPercent: 68,
    modelTier: 'Deterministic + Semantic Matcher',
  },
  {
    id: 'AGT-03',
    name: 'Credit Risk Assessment Agent',
    role: 'MSME GST cashflow underwriting & illustrative default probability',
    status: 'Active',
    tasksProcessed: 18420,
    successRate: 98.6,
    avgExecutionMs: 640,
    lastExecution: '3 minutes ago',
    workloadPercent: 46,
    modelTier: 'Underwriting Reasoning Model',
  },
  {
    id: 'AGT-04',
    name: 'KYC Verification Agent',
    role: 'PAN/CKYC/Aadhaar document validation & V-KYC liveness scoring',
    status: 'Active',
    tasksProcessed: 98450,
    successRate: 97.8,
    avgExecutionMs: 310,
    lastExecution: '1 minute ago',
    workloadPercent: 52,
    modelTier: 'Document OCR & Verification',
  },
  {
    id: 'AGT-05',
    name: 'AML Monitoring Agent',
    role: 'PMLA structuring detection, PEP screening & FIU-IND STR drafting',
    status: 'Processing',
    tasksProcessed: 126400,
    successRate: 99.1,
    avgExecutionMs: 215,
    lastExecution: '25 seconds ago',
    workloadPercent: 81,
    modelTier: 'Graph & Sanctions Screener',
  },
  {
    id: 'AGT-06',
    name: 'Financial Forecasting Agent',
    role: 'Intraday escrow liquidity forecasting & settlement volume projection',
    status: 'Idle',
    tasksProcessed: 6240,
    successRate: 96.9,
    avgExecutionMs: 890,
    lastExecution: '14 minutes ago',
    workloadPercent: 18,
    modelTier: 'Time-Series Treasury Forecaster',
  },
  {
    id: 'AGT-07',
    name: 'Compliance Intelligence Agent',
    role: 'RBI master-direction policy drift audit & periodic Re-KYC sweeps',
    status: 'Active',
    tasksProcessed: 34180,
    successRate: 98.9,
    avgExecutionMs: 410,
    lastExecution: '2 minutes ago',
    workloadPercent: 39,
    modelTier: 'Regulatory Policy Auditor',
  },
];

const TASK_SUMMARIES: Record<string, string[]> = {
  'AGT-01': [
    'Scored high-value IMPS bullion burst & isolated CLUSTER-SRT-04',
    'Blocked emulator-originated corporate card velocity anomaly',
    'Evaluated 1,420 real-time UPI switch events for device spoofing',
  ],
  'AGT-02': [
    'Matched 4,812 HDFC Escrow UTR rows against NPCI batch',
    'Quarantined 14 duplicate Razorpay payout signatures',
    'Reconciled ICICI Nodal T+1 merchant settlement variance',
  ],
  'AGT-03': [
    'Generated illustrative credit memo for ABC Manufacturing Pvt. Ltd.',
    'Re-scored Tier-2 Textile MSME cohort on Q3 GSTR-3B delays',
    'Evaluated DSCR & bank statement continuity for LN-8003',
  ],
  'AGT-04': [
    'Validated V-KYC biometric & PAN match for 312 retail onboardings',
    'Flagged expired OVD documents across 48 high-turnover MSMEs',
    'Completed automated CKYC registry synchronization batch',
  ],
  'AGT-05': [
    'Detected ₹49,500 split-structuring cluster across 7 Delhi NCR VPAs',
    'Screened 2,180 cross-border remittances against OFAC/UN sanctions',
    'Prepared FIU-IND STR evidentiary packet for FRD-405',
  ],
  'AGT-06': [
    'Computed 24-hour HDFC Escrow liquidity buffer forecast',
    'Projected weekly UPI settlement volume surge (+14.2%)',
    'Identified T+0 treasury sweep window for Sahyadri Vault',
  ],
  'AGT-07': [
    'Audited 342 expiring Re-KYC accounts against RBI mandate',
    'Verified merchant MDR fee disclosures on BharatPay PG',
    'Checked data-retention & audit trail integrity across 4 orgs',
  ],
};

const TARGET_ENTITIES = [
  'TXN-98231 · Zaveri Bullion',
  'BATCH-20261119-01 · HDFC Escrow',
  'LN-8001 · ABC Manufacturing',
  'CUS-1009 · Harshad Patel',
  'TXN-98233 · Indica Payouts',
  'Sahyadri Liquid Vault',
  'Apex Consolidated KYC Ledger',
];

export const INITIAL_AGENT_EXECUTIONS: AgentExecutionRecord[] = Array.from(
  { length: 28 },
  (_, i) => {
    const agent = INITIAL_AI_AGENTS[i % INITIAL_AI_AGENTS.length];
    const summaries = TASK_SUMMARIES[agent.id];
    const outcome: AgentExecutionRecord['outcome'] =
      i % 9 === 0 ? 'Escalated' : i % 13 === 0 ? 'Warning' : 'Completed';
    const hour = String(14 - Math.floor(i / 3)).padStart(2, '0');
    const min = String((55 - i * 7 + 60) % 60).padStart(2, '0');

    return {
      id: `EXE-${3001 + i}`,
      agentId: agent.id,
      agentName: agent.name,
      taskSummary: summaries[i % summaries.length],
      targetEntity: TARGET_ENTITIES[i % TARGET_ENTITIES.length],
      startedAt: `2026-11-19 ${hour}:${min} IST`,
      durationMs: agent.avgExecutionMs + ((i * 23) % 140),
      outcome,
      recordsEvaluated: 120 + ((i * 187) % 4800),
      confidence: Number((93.5 + ((i * 1.1) % 6.2)).toFixed(1)),
    };
  },
);
