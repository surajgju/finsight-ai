import { INITIAL_TRANSACTIONS } from '../data/mockTransactions';
import { MOCK_LENDING_APPLICATIONS } from '../data/mockLending';
import { INITIAL_RECONCILIATION_RECORDS } from '../data/mockReconciliation';
import { INITIAL_FRAUD_CASES } from '../data/mockFraudCases';
import { AIChatContext } from './intelligenceService';

export function executeDemoTool(name: string, args: Record<string, unknown> = {}): unknown {
  if (name === 'lookupTransaction') {
    const id = String(args.transactionId || '').trim().toUpperCase();
    const match = INITIAL_TRANSACTIONS.find((t) => t.id.toUpperCase() === id);
    if (!match) {
      return { found: false, message: `Transaction ${id} not found in simulated ledger.` };
    }
    const relatedCase = INITIAL_FRAUD_CASES.find(
      (f) => f.transactionId.toUpperCase() === id,
    );
    return { found: true, transaction: match, relatedFraudCase: relatedCase ?? null };
  }

  if (name === 'lookupBorrower') {
    const q = String(args.query || '').trim().toLowerCase();
    const match = MOCK_LENDING_APPLICATIONS.find(
      (b) => b.id.toLowerCase() === q || b.borrowerName.toLowerCase().includes(q),
    );
    if (!match) {
      return { found: false, message: `No borrower matching "${args.query}" found.` };
    }
    return {
      found: true,
      note: 'Simulated illustrative credit assessment — not an actual lending decision.',
      borrower: match,
    };
  }

  if (name === 'listHighRiskTransactions') {
    const minScore = Number(args.minRiskScore ?? 75);
    const items = [...INITIAL_TRANSACTIONS]
      .filter((t) => t.riskScore >= minScore)
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 6);
    return {
      count: items.length,
      transactions: items,
      activeCriticalCases: INITIAL_FRAUD_CASES.filter((c) => c.severity === 'Critical'),
    };
  }

  if (name === 'getReconciliationExceptions') {
    const filter = String(args.statusFilter || '');
    const exceptions = INITIAL_RECONCILIATION_RECORDS.filter((r) =>
      filter
        ? r.status.toLowerCase() === filter.toLowerCase()
        : r.status === 'Unmatched' || r.status === 'Potential Duplicate',
    ).slice(0, 8);
    return {
      exceptionCount: exceptions.length,
      records: exceptions,
    };
  }

  return { error: `Unknown tool: ${name}` };
}

export function generateDemoCopilotResponse(
  query: string,
  roleMode: string,
  context: AIChatContext,
): { tools: string[]; responseText: string } {
  const lower = query.toLowerCase();
  const tools: string[] = [];
  const bullets: string[] = [];

  // Check for Transaction ID e.g. TXN-98231
  const txnMatch = query.match(/TXN-\d+/i);
  if (txnMatch) {
    const txnId = txnMatch[0].toUpperCase();
    tools.push(`lookupTransaction(${txnId})`);
    const txn = INITIAL_TRANSACTIONS.find((t) => t.id.toUpperCase() === txnId);
    if (txn) {
      bullets.push(
        `• **Transaction Telemetry:** ${txn.id} for ₹${txn.amountINR.toLocaleString('en-IN')} via ${txn.rail} under merchant "${txn.merchantName}".`,
      );
      bullets.push(
        `• **Risk Score & Status:** Evaluated at **${txn.riskScore}/100**. Decision Status: **${txn.status.toUpperCase()}**.`,
      );
      bullets.push(
        `• **Risk Indicators:** ${txn.aiReason || 'Anomalous velocity detected'}.`,
      );
      bullets.push(
        `• **Containment Action:** Immediate automated account velocity freeze triggered. Device fingerprint and IP subnet marked for review under RBI Cyber Security Framework.`,
      );
      return {
        tools,
        responseText: bullets.join('\n\n'),
      };
    }
  }

  // Check for Borrower or Loan e.g. LN-8001 or "ABC" or "credit"
  const loanMatch = query.match(/LN-\d+/i);
  if (loanMatch || lower.includes('borrower') || lower.includes('manufacturing') || lower.includes('lending') || lower.includes('credit')) {
    const queryTerm = loanMatch ? loanMatch[0].toUpperCase() : 'ABC';
    tools.push(`lookupBorrower(${queryTerm})`);
    const borrower = MOCK_LENDING_APPLICATIONS.find(
      (b) => b.id.toUpperCase() === queryTerm || b.borrowerName.toLowerCase().includes('abc'),
    ) || MOCK_LENDING_APPLICATIONS[0];

    const debtRatio = borrower.annualRevenueINR > 0
      ? (borrower.existingLiabilitiesINR / borrower.annualRevenueINR) * 100
      : 25;

    bullets.push(
      `• **Borrower Profile:** ${borrower.borrowerName} (${borrower.industry}) — Requesting loan of ₹${(borrower.requestedLoanINR / 100000).toFixed(1)} Lakhs.`,
    );
    bullets.push(
      `• **Financial Telemetry:** Annual Revenue ₹${(borrower.annualRevenueINR / 10000000).toFixed(2)} Cr, Debt-to-Revenue ${debtRatio.toFixed(1)}%, GST Compliance **${borrower.gstComplianceMonths} months verified**.`,
    );
    bullets.push(
      `• **AI Underwriting Assessment:** Credit Score **${borrower.creditScore}**, Simulated Default Probability **${(borrower.defaultProbability * 100).toFixed(1)}%**. Status: **${borrower.status}**.`,
    );
    bullets.push(
      `• **Recommendation:** Approved in principle subject to GST debt-service covenant verification and quarterly bank statement audits.`,
    );
    return {
      tools,
      responseText: bullets.join('\n\n'),
    };
  }

  // Check for High Risk or Fraud queries
  if (lower.includes('high-risk') || lower.includes('high risk') || lower.includes('fraud') || lower.includes('score 80') || lower.includes('score 75')) {
    tools.push('listHighRiskTransactions(minRiskScore=75)');
    const highRisk = INITIAL_TRANSACTIONS.filter((t) => t.riskScore >= 75).slice(0, 3);
    bullets.push(
      `• **High-Risk Monitoring Alert:** Retrieved ${highRisk.length} active transactions above risk threshold 75 in ${context.orgName || 'FinSight Banking'}.`,
    );
    highRisk.forEach((t) => {
      bullets.push(
        `• **${t.id}:** ₹${t.amountINR.toLocaleString('en-IN')} via ${t.rail} — Risk Score **${t.riskScore}** (${t.aiReason}). Status: **${t.status}**.`,
      );
    });
    bullets.push(
      `• **Containment Recommendation:** Initiate STR filing under FIU-IND and cross-reference device IDs across beneficiary accounts.`,
    );
    return {
      tools,
      responseText: bullets.join('\n\n'),
    };
  }

  // Check for Reconciliation queries
  if (lower.includes('reconciliation') || lower.includes('reconcile') || lower.includes('variance') || lower.includes('unmatched') || lower.includes('settlement')) {
    tools.push('getReconciliationExceptions(statusFilter=Unmatched)');
    const unmatched = INITIAL_RECONCILIATION_RECORDS.filter((r) => r.status === 'Unmatched').slice(0, 3);
    bullets.push(
      `• **Nodal Ledger Exceptions:** Identified ${unmatched.length} unmatched settlement records across payment gateways and partner bank settlement files.`,
    );
    unmatched.forEach((r) => {
      bullets.push(
        `• **${r.id} (${r.sourceLedger}):** Expected ₹${r.expectedAmountINR.toLocaleString('en-IN')} vs Settled ₹${r.settledAmountINR.toLocaleString('en-IN')} (Variance ₹${Math.abs(r.varianceINR).toLocaleString('en-IN')}) [${r.discrepancyReason}].`,
      );
    });
    bullets.push(
      `• **Resolution Protocol:** Automated T+1 ledger reconciliation cycle queued with gateway clearing house.`,
    );
    return {
      tools,
      responseText: bullets.join('\n\n'),
    };
  }

  // Check for Compliance / RBI / KYC queries
  if (lower.includes('rbi') || lower.includes('kyc') || lower.includes('aml') || lower.includes('compliance') || roleMode === 'compliance') {
    bullets.push(
      `• **RBI KYC Master Direction Alignment:** High-priority automated review on all re-KYC non-compliant and beneficial ownership declarations.`,
    );
    bullets.push(
      `• **FIU-IND Reporting Readiness:** 4 automated Cash Transaction Reports (CTR) and 2 Suspicious Transaction Reports (STR) queued for regulatory dispatch.`,
    );
    bullets.push(
      `• **PMLA Screening:** Real-time sanction screening active across OFAC, UN Sanctions, and domestic watchlist feeds with zero false positive escalations.`,
    );
    bullets.push(
      `• **Action Item:** Ensure periodic audit trail sign-off for nodal accounts by end of current financial week.`,
    );
    return {
      tools,
      responseText: bullets.join('\n\n'),
    };
  }

  // Default executive response
  bullets.push(
    `• **FinSight Institutional Executive Summary:** Real-time financial telemetry for **${context.orgName || 'Enterprise Bank'}** active across **${context.activePage || 'Executive Overview'}**.`,
  );
  bullets.push(
    `• **Portfolio Metrics:** ${context.kpiSummary || 'All liquidity and risk benchmarks operating within prescribed limits'}.`,
  );
  bullets.push(
    `• **Operational Risk Posture:** Automated fraud detection precision currently at 98.4%, with zero systemic nodal settlement backlogs.`,
  );
  bullets.push(
    `• **Suggested Next Steps:** You can query any Transaction ID (e.g. TXN-98231), loan applicant (e.g. ABC Manufacturing), or ask for an RBI audit brief.`,
  );

  return {
    tools,
    responseText: bullets.join('\n\n'),
  };
}

export function generateDemoAnalysis(
  taskType: 'transaction' | 'borrower' | 'insight' | 'executive' | 'reconciliation',
  payload: Record<string, unknown>,
): string {
  if (taskType === 'transaction') {
    const txnId = String(payload.id || 'TXN-FLAGGED');
    const amount = Number(payload.amountINR || payload.amount || 250000);
    const score = Number(payload.riskScore || 85);
    return [
      `1. Risk Drivers: High velocity cluster detected for ${txnId} with transaction value ₹${amount.toLocaleString('en-IN')}. Anomaly score ${score}/100 exceeds risk tolerance.`,
      `2. Mule/Velocity Assessment: Device fingerprint is associated with rapid outbound IMPS transfers across multiple geographically disparate locations within 12 minutes.`,
      `3. Recommended Immediate Control Action: HOLD transaction immediately, freeze beneficiary wallet credit, and dispatch customer SMS verification challenge.`,
    ].join('\n\n');
  }

  if (taskType === 'borrower') {
    const name = String(payload.borrowerName || 'Borrower');
    const revenue = Number(payload.annualRevenueINR || payload.annualRevenue || 12000000);
    const liabilities = Number(payload.existingLiabilitiesINR || 3000000);
    const debtRatio = revenue > 0 ? (liabilities / revenue) * 100 : 25;
    return [
      `• Debt Service Capacity: ${name} demonstrates stable operating cash flows with annual GST-declared revenue of ₹${(revenue / 10000000).toFixed(2)} Cr and manageable debt-to-revenue ratio of ${debtRatio.toFixed(1)}%.`,
      `• GST / Revenue Health: Consecutive on-time GSTR-3B filings observed over the past 12 months with healthy 14.2% YoY turnover expansion.`,
      `• Key Covenant Risks: High concentration in raw material suppliers and moderate working capital cycle delays (68 debtor days).`,
      `• Recommendation: Illustrative recommendation is CONDITIONAL APPROVAL at prime lending rate + 1.85%, subject to hypothecation of current book debts. (Simulated score is illustrative only).`,
    ].join('\n\n');
  }

  if (taskType === 'reconciliation') {
    const id = String(payload.id || 'REC-SETTLEMENT');
    const variance = Number(payload.varianceINR || payload.variance || 4500);
    return [
      `1. Discrepancy Diagnostics: Record ${id} reflects a nodal bank versus payment gateway variance of ₹${Math.abs(variance).toLocaleString('en-IN')}.`,
      `2. Root Cause: Timing lag between UPI switch confirmation response and end-of-day bank statement batch generation.`,
      `3. Resolution Protocol: Automatically adjust nodal ledger via T+1 reconciliation clearing and notify merchant ledger API.`,
    ].join('\n\n');
  }

  if (taskType === 'insight') {
    return [
      `• Root-Cause Brief: Sudden 18% spike in failed debit transactions identified in southern region payment aggregators due to latency timeouts.`,
      `• Mitigation Step 1: Dynamically reroute 40% of peak traffic to secondary backup nodal switch.`,
      `• Mitigation Step 2: Auto-retry transient gateway network failures with exponential backoff.`,
      `• Mitigation Step 3: Dispatch proactive merchant health advisory to prevent redundant checkout retries.`,
    ].join('\n\n');
  }

  // Executive default
  return [
    `• Boardroom Briefing: Operations remain resilient with strong gross volume throughput across UPI, Cards, and Net Banking channels.`,
    `• Top Opportunity 1: Scaling automated MSME lending decisioning can reduce turnaround time from 4 days to 45 minutes while maintaining low default probability.`,
    `• Top Opportunity 2: Real-time fraud prevention algorithms have saved an estimated ₹1.84 Crores in potential mule network exposure this quarter.`,
    `• Key Risk Focus: Maintain strict vigilance on cyber resilience and RBI KYC periodic audit adherence.`,
  ].join('\n\n');
}
