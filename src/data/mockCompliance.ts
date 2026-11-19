import { KycRecord } from '../types';
import { MOCK_CUSTOMERS } from './mockCustomers';

const OFFICERS = ['Meera Iyer', 'Ananya Chatterjee', 'Rohan Kulkarni', 'Kavya Nair'];
const ENTITY_TYPES: KycRecord['entityType'][] = [
  'Individual',
  'Private Limited',
  'Partnership',
  'Proprietorship',
];

export const COMPLIANCE_SUMMARY_STATS = {
  totalCustomersVerified: 98450,
  pendingKyc: 1248,
  amlAlerts: 84,
  verificationSuccessRate: 97.8,
  complianceScore: 96.8,
};

export const INITIAL_KYC_RECORDS: KycRecord[] = MOCK_CUSTOMERS.map((cust, index) => {
  let verificationStatus: KycRecord['verificationStatus'] = 'Verified';
  if (cust.riskScore >= 80) verificationStatus = 'AML Flagged';
  else if (cust.kycTier === 'Pending Review') verificationStatus = 'Pending KYC';
  else if (index % 13 === 0) verificationStatus = 'Document Expired';

  const riskClassification: KycRecord['riskClassification'] =
    cust.riskScore >= 70 ? 'High' : cust.riskScore >= 35 ? 'Medium' : 'Low';

  const day = String(Math.max(1, 19 - (index % 17))).padStart(2, '0');
  const month = index > 20 ? '10' : '11';

  return {
    id: `KYC-${5101 + index}`,
    customerId: cust.id,
    customerName: cust.name,
    entityType:
      cust.segment === 'Enterprise MSME' || cust.segment === 'NBFC Partner'
        ? ENTITY_TYPES[(index % 3) + 1]
        : 'Individual',
    city: cust.city,
    verificationStatus,
    riskClassification,
    lastVerifiedDate: `2026-${month}-${day}`,
    documentScore:
      verificationStatus === 'Verified'
        ? 94 + (index % 6)
        : verificationStatus === 'Pending KYC'
          ? 76 + (index % 10)
          : 58 + (index % 14),
    amlHits: verificationStatus === 'AML Flagged' ? (index % 3) + 1 : 0,
    assignedOfficer: OFFICERS[index % OFFICERS.length],
  };
});
