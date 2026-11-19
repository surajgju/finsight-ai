import { useState } from 'react';
import { Download, FileSpreadsheet, PlugZap, RotateCcw, Save, UserPlus } from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useFinSight } from '../../context/FinSightContext';
import { INITIAL_AGENT_EXECUTIONS } from '../../data/mockAgents';
import { MOCK_LENDING_APPLICATIONS } from '../../data/mockLending';
import { REPORT_TEMPLATES } from '../../data/mockOrganisations';
import { TeamUser } from '../../types';
import { downloadCSV, downloadJSON } from '../../utils/formatters';

export function ReportsPage() {
  const { transactions, kycRecords, reconciliationRecords, showToast } = useFinSight();

  const handleDownloadReport = (id: string, name: string) => {
    if (id === 'rep-1') {
      downloadCSV('finsight-executive-transactions-report.csv', transactions);
    } else if (id === 'rep-2') {
      downloadCSV('finsight-fiu-kyc-compliance-digest.csv', kycRecords);
    } else if (id === 'rep-3') {
      downloadCSV('finsight-nodal-reconciliation-variance.csv', reconciliationRecords);
    } else if (id === 'rep-4') {
      downloadCSV('finsight-msme-lending-portfolio.csv', MOCK_LENDING_APPLICATIONS);
    } else {
      downloadJSON('finsight-ai-agent-audit-trace.json', INITIAL_AGENT_EXECUTIONS);
    }
    showToast(`Downloaded "${name}"`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          Downloadable Analytics & Regulatory Reports
        </h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Export structured CSV ledgers and JSON audit briefs generated from simulated telemetry
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {REPORT_TEMPLATES.map((rep) => (
          <div
            key={rep.id}
            className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
          >
            <div>
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="font-medium text-sky-700 dark:text-sky-400">{rep.category}</span>
                <span>{rep.cadence} · {rep.format}</span>
              </div>
              <div className="mt-2 flex items-start gap-2.5">
                <FileSpreadsheet className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                <div>
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {rep.name}
                  </h2>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                    {rep.description}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs dark:border-slate-800">
              <span className="text-[11px] text-slate-500">Last generated: {rep.lastGenerated}</span>
              <button
                type="button"
                onClick={() => handleDownloadReport(rep.id, rep.name)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-700"
              >
                <Download className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Download {rep.format}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function IntegrationsPage() {
  const { integrations, toggleIntegration } = useFinSight();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          Banking, Gateway & Bureau Integrations
        </h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Manage simulated connections to NPCI UPI Switch, nodal banks, credit bureaus, and CKYC registries
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {integrations.map((intItem) => (
          <div
            key={intItem.id}
            className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    <PlugZap className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {intItem.name}
                    </h2>
                    <div className="text-[11px] text-slate-500">{intItem.category}</div>
                  </div>
                </div>
                <StatusBadge label={intItem.status} />
              </div>

              <div className="mt-4 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-xs dark:bg-slate-950/60">
                <span className="text-slate-500">Throughput</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                  {intItem.throughput}
                </span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs dark:border-slate-800">
              <span className="text-[11px] text-slate-500">Sync: {intItem.lastSync}</span>
              <button
                type="button"
                onClick={() => toggleIntegration(intItem.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  intItem.enabled
                    ? 'border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'border border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {intItem.enabled ? 'Stream Enabled' : 'Paused'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function OrgSettingsPage() {
  const { selectedOrg, resetDemoState, showToast } = useFinSight();
  const [escalationScore, setEscalationScore] = useState(75);
  const [autoBlockScore, setAutoBlockScore] = useState(92);
  const [strThresholdINR, setStrThresholdINR] = useState(1000000);
  const [webhookEmail, setWebhookEmail] = useState('risk-desk@finsight.in');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast(`Saved governance settings for ${selectedOrg.shortName}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          Organisation Settings
        </h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Institutional entity profile, automated AI risk thresholds, and alert routing for {selectedOrg.name}
        </p>
      </div>

      <form
        onSubmit={handleSave}
        className="max-w-3xl space-y-5 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              Registered Legal Entity
            </label>
            <input
              type="text"
              readOnly
              value={selectedOrg.name}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              RBI / Regulatory Registration ID
            </label>
            <input
              type="text"
              readOnly
              value={selectedOrg.regNumber}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
            />
          </div>
          <div>
            <label
              htmlFor="esc-score"
              className="block text-xs font-medium text-slate-700 dark:text-slate-300"
            >
              L2 Analyst Escalation Score Threshold
            </label>
            <input
              id="esc-score"
              type="number"
              min={40}
              max={90}
              value={escalationScore}
              onChange={(e) => setEscalationScore(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
          </div>
          <div>
            <label
              htmlFor="autoblock-score"
              className="block text-xs font-medium text-slate-700 dark:text-slate-300"
            >
              Automated Rail Quarantine Threshold
            </label>
            <input
              id="autoblock-score"
              type="number"
              min={80}
              max={99}
              value={autoBlockScore}
              onChange={(e) => setAutoBlockScore(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
          </div>
          <div>
            <label
              htmlFor="str-threshold"
              className="block text-xs font-medium text-slate-700 dark:text-slate-300"
            >
              FIU-IND High-Value Alert Threshold (INR)
            </label>
            <input
              id="str-threshold"
              type="number"
              value={strThresholdINR}
              onChange={(e) => setStrThresholdINR(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
          </div>
          <div>
            <label
              htmlFor="alert-email"
              className="block text-xs font-medium text-slate-700 dark:text-slate-300"
            >
              Critical Alert Distribution Email
            </label>
            <input
              id="alert-email"
              type="email"
              value={webhookEmail}
              onChange={(e) => setWebhookEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
          </div>
        </div>

        <div className="flex justify-end border-t border-slate-200 pt-4 dark:border-slate-800">
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-medium text-white hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-700"
          >
            <Save className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Save Governance Settings</span>
          </button>
        </div>
      </form>

      <div className="max-w-3xl rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Demo Environment Controls
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              All triage actions, CSV imports, and Maker-Checker approvals persist across refreshes in your browser. Reset back to the clean executive baseline anytime before a presentation.
            </p>
          </div>
          <button
            type="button"
            onClick={resetDemoState}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Reset Demo State to Baseline</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export function UserManagementPage() {
  const { teamUsers, addTeamUser } = useFinSight();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<TeamUser['role']>('Compliance Officer');
  const [department, setDepartment] = useState('Risk & Compliance');
  const [formError, setFormError] = useState<string | null>(null);

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !email.includes('@')) {
      setFormError('Please enter a valid full name and institutional email address.');
      return;
    }
    setFormError(null);
    addTeamUser({
      name: name.trim(),
      email: email.trim(),
      role,
      department,
      mfaEnabled: true,
    });
    setName('');
    setEmail('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          User Management & RBAC
        </h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Manage enterprise analyst roles, MFA enforcement, and operational access permissions
        </p>
      </div>

      {/* Invite Form */}
      <form
        onSubmit={handleInvite}
        className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
      >
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Invite Team Member
        </h2>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full Name"
            aria-label="New user full name"
            className="h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Work Email"
            aria-label="New user work email"
            className="h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          />
          <select
            aria-label="New user role"
            value={role}
            onChange={(e) => setRole(e.target.value as TeamUser['role'])}
            className="h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          >
            <option value="Chief Risk Officer">Chief Risk Officer</option>
            <option value="Fraud Ops Lead">Fraud Ops Lead</option>
            <option value="Credit Underwriter">Credit Underwriter</option>
            <option value="Compliance Officer">Compliance Officer</option>
            <option value="Finance Controller">Finance Controller</option>
          </select>
          <input
            type="text"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            placeholder="Department"
            aria-label="New user department"
            className="h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          />
          <button
            type="submit"
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-3 text-xs font-medium text-white hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-700"
          >
            <UserPlus className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Send Invite</span>
          </button>
        </div>
        {formError && (
          <p className="mt-2 text-xs text-red-600 dark:text-red-400">{formError}</p>
        )}
      </form>

      {/* Team Table */}
      <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400">
                <th className="px-5 py-3 font-medium">Team Member</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Department</th>
                <th className="px-4 py-3 font-medium">MFA</th>
                <th className="px-4 py-3 font-medium">Last Active</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {teamUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-5 py-3">
                    <div className="font-medium text-slate-900 dark:text-slate-100">{u.name}</div>
                    <div className="text-[11px] text-slate-500">{u.email}</div>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">
                    {u.role}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{u.department}</td>
                  <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-300">
                    {u.mfaEnabled ? 'Enforced' : 'Pending'}
                  </td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{u.lastActive}</td>
                  <td className="px-5 py-3">
                    <StatusBadge
                      label={u.status}
                      tone={u.status === 'Active' ? 'success' : 'info'}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
