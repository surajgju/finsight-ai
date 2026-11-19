import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Bell,
  Building2,
  Calendar,
  CheckCheck,
  Menu,
  Moon,
  Search,
  ShieldCheck,
  Sparkles,
  Sun,
} from 'lucide-react';
import { DEMO_ACTORS, useFinSight } from '../../context/FinSightContext';
import { ORGANISATIONS } from '../../data/mockOrganisations';
import { MOCK_CUSTOMERS } from '../../data/mockCustomers';
import { MOCK_LENDING_APPLICATIONS } from '../../data/mockLending';
import { DateRangePreset } from '../../types';
import { formatINR } from '../../utils/formatters';

const DATE_PRESETS: { value: DateRangePreset; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: 'custom', label: 'Custom range' },
];

export function TopBar() {
  const {
    selectedOrg,
    setSelectedOrgId,
    dateRange,
    setDateRange,
    theme,
    toggleTheme,
    setMobileNavOpen,
    transactions,
    setSelectedTransactionId,
    setActivePage,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    setCopilotOpen,
    activeActor,
    setActiveActorId,
    pendingApprovalCount,
    showToast,
  } = useFinSight();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [customDateOpen, setCustomDateOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'Escape') {
        setProfileOpen(false);
        setNotifOpen(false);
        setCustomDateOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return { txns: [], customers: [], loans: [] };
    return {
      txns: transactions
        .filter(
          (t) =>
            t.id.toLowerCase().includes(q) ||
            t.customerName.toLowerCase().includes(q) ||
            t.merchantName.toLowerCase().includes(q),
        )
        .slice(0, 4),
      customers: MOCK_CUSTOMERS.filter(
        (c) => c.name.toLowerCase().includes(q) || c.city.toLowerCase().includes(q),
      ).slice(0, 3),
      loans: MOCK_LENDING_APPLICATIONS.filter((l) =>
        l.borrowerName.toLowerCase().includes(q),
      ).slice(0, 3),
    };
  }, [searchQuery, transactions]);

  const hasSearchResults =
    searchResults.txns.length > 0 ||
    searchResults.customers.length > 0 ||
    searchResults.loans.length > 0;

  const initials = activeActor.name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2);

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur-sm lg:px-6 dark:border-slate-800 dark:bg-slate-900/95">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <button
          type="button"
          onClick={() => setMobileNavOpen(true)}
          aria-label="Open sidebar navigation"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 lg:hidden dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <Menu className="h-4 w-4" aria-hidden="true" />
        </button>

        {/* Global Search with Cmd+K shortcut */}
        <div className="relative w-full max-w-sm">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            ref={searchInputRef}
            type="search"
            value={searchQuery}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setTimeout(() => setSearchFocused(false), 180)}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search TXN ID, customer, borrower..."
            aria-label="Global dashboard search"
            className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pr-12 pl-9 text-xs text-slate-900 placeholder:text-slate-400 focus:border-sky-600 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:bg-slate-900"
          />
          <kbd className="pointer-events-none absolute top-1/2 right-2.5 hidden -translate-y-1/2 rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[10px] text-slate-400 sm:inline-block dark:border-slate-700 dark:bg-slate-900">
            ⌘K
          </kbd>

          {searchFocused && searchQuery.trim().length > 0 && (
            <div className="absolute top-11 left-0 z-40 w-full min-w-[300px] rounded-xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-900">
              {!hasSearchResults ? (
                <div className="px-3 py-4 text-center text-xs text-slate-500 dark:text-slate-400">
                  No matching transactions, customers, or borrowers.
                </div>
              ) : (
                <div className="space-y-2 text-xs">
                  {searchResults.txns.length > 0 && (
                    <div>
                      <div className="px-2 py-1 text-[10px] font-semibold text-slate-400">
                        Transactions
                      </div>
                      {searchResults.txns.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onMouseDown={() => {
                            setSelectedTransactionId(t.id);
                            setSearchQuery('');
                          }}
                          className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <span className="truncate font-medium text-slate-800 dark:text-slate-200">
                            <span className="font-mono">{t.id}</span> · {t.customerName}
                          </span>
                          <span className="ml-2 shrink-0 font-mono text-slate-500 tabular-nums">
                            {formatINR(t.amountINR)}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {searchResults.customers.length > 0 && (
                    <div>
                      <div className="px-2 py-1 text-[10px] font-semibold text-slate-400">
                        Customers & KYC
                      </div>
                      {searchResults.customers.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onMouseDown={() => {
                            setActivePage('kyc-aml');
                            setSearchQuery('');
                          }}
                          className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <span className="truncate font-medium text-slate-800 dark:text-slate-200">
                            {c.name}
                          </span>
                          <span className="text-[11px] text-slate-500">{c.city}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {searchResults.loans.length > 0 && (
                    <div>
                      <div className="px-2 py-1 text-[10px] font-semibold text-slate-400">
                        Credit & Lending
                      </div>
                      {searchResults.loans.map((l) => (
                        <button
                          key={l.id}
                          type="button"
                          onMouseDown={() => {
                            setActivePage('credit-lending');
                            setSearchQuery('');
                          }}
                          className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <span className="truncate font-medium text-slate-800 dark:text-slate-200">
                            {l.borrowerName}
                          </span>
                          <span className="font-mono text-[11px] text-slate-500">
                            Score {l.creditScore}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {/* Organisation Selector */}
        <div className="hidden items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 md:flex dark:border-slate-700 dark:bg-slate-900">
          <Building2 className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
          <select
            aria-label="Select Organisation"
            value={selectedOrg.id}
            onChange={(e) => setSelectedOrgId(e.target.value)}
            className="max-w-[175px] bg-transparent text-xs font-medium text-slate-700 focus:outline-none dark:text-slate-200"
          >
            {ORGANISATIONS.map((org) => (
              <option key={org.id} value={org.id} className="bg-white dark:bg-slate-900">
                {org.shortName}
              </option>
            ))}
          </select>
        </div>

        {/* Date-Range Selector */}
        <div className="relative hidden items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 sm:flex dark:border-slate-700 dark:bg-slate-900">
          <Calendar className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
          <select
            aria-label="Select Date Range"
            value={dateRange.preset}
            onChange={(e) => {
              const preset = e.target.value as DateRangePreset;
              setDateRange({ ...dateRange, preset });
              setCustomDateOpen(preset === 'custom');
            }}
            className="bg-transparent text-xs font-medium text-slate-700 focus:outline-none dark:text-slate-200"
          >
            {DATE_PRESETS.map((p) => (
              <option key={p.value} value={p.value} className="bg-white dark:bg-slate-900">
                {p.label}
              </option>
            ))}
          </select>

          {customDateOpen && dateRange.preset === 'custom' && (
            <div className="absolute top-11 right-0 z-40 w-64 rounded-xl border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-700 dark:bg-slate-900">
              <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                Custom Date Window
              </div>
              <div className="mt-2 space-y-2 text-xs">
                <div>
                  <label className="block text-[11px] text-slate-500">Start Date</label>
                  <input
                    type="date"
                    value={dateRange.customStart ?? '2026-10-05'}
                    onChange={(e) =>
                      setDateRange({ ...dateRange, preset: 'custom', customStart: e.target.value })
                    }
                    className="mt-0.5 w-full rounded border border-slate-200 px-2 py-1 dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500">End Date</label>
                  <input
                    type="date"
                    value={dateRange.customEnd ?? '2026-11-19'}
                    onChange={(e) =>
                      setDateRange({ ...dateRange, preset: 'custom', customEnd: e.target.value })
                    }
                    className="mt-0.5 w-full rounded border border-slate-200 px-2 py-1 dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setCustomDateOpen(false)}
                  className="w-full rounded-lg bg-sky-600 py-1.5 font-medium text-white hover:bg-sky-700"
                >
                  Apply Window
                </button>
              </div>
            </div>
          )}
        </div>

        {/* FinSight AI Copilot trigger */}
        <button
          type="button"
          onClick={() => setCopilotOpen(true)}
          aria-label="Open FinSight AI Copilot"
          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-slate-900 px-3 text-xs font-medium text-white transition-colors hover:bg-slate-800 whitespace-nowrap shrink-0 dark:bg-sky-600 dark:hover:bg-sky-700"
        >
          <Sparkles className="h-3.5 w-3.5 text-sky-300 dark:text-white" aria-hidden="true" />
          <span className="hidden sm:inline">FinSight Copilot</span>
        </button>

        {/* Theme Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          {theme === 'light' ? (
            <Moon className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Sun className="h-4 w-4" aria-hidden="true" />
          )}
        </button>

        {/* Notification Centre */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setNotifOpen((p) => !p);
              setProfileOpen(false);
            }}
            aria-label={`Notifications (${unreadCount} unread)`}
            className="relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Bell className="h-4 w-4" aria-hidden="true" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 font-mono text-[10px] font-semibold text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute top-11 right-0 z-40 w-80 rounded-xl border border-slate-200 bg-white shadow-xl sm:w-96 dark:border-slate-700 dark:bg-slate-900">
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  Intelligence Alerts ({unreadCount} unread)
                </span>
                <button
                  type="button"
                  onClick={markAllNotificationsRead}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-sky-600 hover:underline dark:text-sky-400"
                >
                  <CheckCheck className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Mark all read</span>
                </button>
              </div>
              <div className="max-h-80 divide-y divide-slate-100 overflow-y-auto dark:divide-slate-800">
                {notifications.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => {
                      markNotificationRead(n.id);
                      setActivePage(n.targetPage);
                      setNotifOpen(false);
                    }}
                    className={`block w-full px-4 py-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60 ${
                      !n.read ? 'bg-sky-50/40 dark:bg-sky-950/20' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {n.title}
                      </span>
                      <span className="shrink-0 text-[10px] text-slate-400">{n.timestamp}</span>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                      {n.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile & Dual-Control Role Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setProfileOpen((p) => !p);
              setNotifOpen(false);
            }}
            aria-label="Open user profile menu"
            className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-2 text-left transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
          >
            {activeActor.id === 'actor-checker' && !avatarError ? (
              <img
                src="/src/assets/images/avatar_executive_user_1795081239727.jpg"
                alt={activeActor.name}
                referrerPolicy="no-referrer"
                onError={() => setAvatarError(true)}
                className="h-6 w-6 rounded-md object-cover"
              />
            ) : (
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-800 text-[11px] font-semibold text-white">
                {initials}
              </span>
            )}
            <div className="hidden text-left xl:block">
              <div className="text-xs font-medium leading-tight text-slate-700 dark:text-slate-200">
                {activeActor.name.split(' ')[0]} · {activeActor.governanceRole}
              </div>
            </div>
            {pendingApprovalCount > 0 && (
              <span className="rounded bg-amber-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                {pendingApprovalCount}
              </span>
            )}
          </button>

          {profileOpen && (
            <div className="absolute top-11 right-0 z-40 w-72 rounded-xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-900">
              <div className="border-b border-slate-100 px-3 py-2 dark:border-slate-800">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    {activeActor.name}
                  </span>
                  <span className="rounded-md bg-sky-50 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-sky-700 dark:bg-sky-950/60 dark:text-sky-300">
                    {activeActor.governanceRole}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {activeActor.title}
                </div>
              </div>

              <div className="border-b border-slate-100 px-2 py-2 dark:border-slate-800">
                <div className="px-1 pb-1.5 text-[10px] font-semibold text-slate-400">
                  Demo Dual-Control Actor Switcher
                </div>
                <div className="space-y-1">
                  {DEMO_ACTORS.map((actor) => {
                    const selected = actor.id === activeActor.id;
                    return (
                      <button
                        key={actor.id}
                        type="button"
                        onClick={() => {
                          setActiveActorId(actor.id);
                          setProfileOpen(false);
                          showToast(`Switched active actor to ${actor.name} (${actor.governanceRole})`);
                        }}
                        className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors ${
                          selected
                            ? 'bg-sky-50 font-semibold text-sky-800 dark:bg-sky-950/50 dark:text-sky-200'
                            : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span className="truncate">{actor.name}</span>
                        <span className="font-mono text-[10px]">{actor.governanceRole}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-1 space-y-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setActivePage('compliance-monitoring');
                    setProfileOpen(false);
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <span className="inline-flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-sky-600" aria-hidden="true" />
                    <span>Maker-Checker Queue</span>
                  </span>
                  <span className="font-mono text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                    {pendingApprovalCount} pending
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActivePage('org-settings');
                    setProfileOpen(false);
                  }}
                  className="w-full rounded-lg px-3 py-2 text-left text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Organisation Settings
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActivePage('user-management');
                    setProfileOpen(false);
                  }}
                  className="w-full rounded-lg px-3 py-2 text-left text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  User Management & RBAC
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActivePage('reports');
                    setProfileOpen(false);
                  }}
                  className="w-full rounded-lg px-3 py-2 text-left text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Downloadable Reports
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
