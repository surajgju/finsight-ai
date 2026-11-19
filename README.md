# FinSight AI — Enterprise Financial Intelligence Platform

[![Firebase Hosting](https://img.shields.io/badge/Demo-Live%20on%20Firebase-0284c7?style=for-the-badge&logo=firebase)](https://raxonlab-fintech.web.app)
[![React](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8-646cff?style=for-the-badge&logo=vite)](https://vite.dev)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald?style=for-the-badge)](LICENSE)

> **Live Interactive Demo:** [https://raxonlab-fintech.web.app](https://raxonlab-fintech.web.app)

**FinSight AI** is a financial intelligence and decisioning platform designed for modern Indian banks, NBFCs, and payment gateways. It provides real-time fraud monitoring, MSME credit underwriting, automated nodal reconciliation, regulatory compliance reporting, and executive financial telemetry.

---

## 🌟 Key Capabilities

### 1. Executive Boardroom Telemetry
- Consolidated multi-entity monitoring across banking institutions (Apex Bank, BharatPay Gateway, Vistaar NBFC).
- Real-time KPI benchmarking: Gross transaction volume, fraud loss prevention, liquidity buffers, and default rates.
- Dynamic date-range filtering (`Today`, `7D`, `30D`, `90D`, `YTD`) with INR compact currency formatting (Lakhs & Crores).

### 2. Real-Time Transaction Anomaly & Mule Detection
- Continuous monitoring across UPI, IMPS, NEFT, and Card rails.
- AI-driven risk scoring (0–100) with explainable reasoning tags (velocity bursts, abnormal device IDs, geographical impossibilities).
- Real-time mule network graph analysis and single-click automated account freeze.

### 3. MSME Credit Underwriting & Risk Decisioning
- Indian MSME borrower assessment combining GST cash flows, bank statements, existing liabilities, and repayment history.
- Simulated credit ratings and default probabilities with explainable covenants.
- Single-click AI Credit Underwriting Notes generation.

### 4. Nodal & Gateway Settlement Reconciliation
- Automated settlement matching between merchant ledgers, bank nodal accounts, and payment gateways (Razorpay, NPCI UPI switch, HDFC Escrow).
- Variance detection, duplicate reference flagging, and automated T+1 adjustment workflows.

### 5. Regulatory Compliance & AML (RBI / FIU-IND)
- Continuous tracking against RBI KYC Master Directions and PMLA guidelines.
- Automated preparation of Cash Transaction Reports (CTR) and Suspicious Transaction Reports (STR).
- Sanctions and domestic watchlist screening.

### 6. FinSight AI Copilot
- Conversational financial copilot with role-based personas:
  - **Executive CFO Advisor**
  - **Fraud & Risk Investigator**
  - **Credit Underwriting Officer**
  - **Compliance & AML Specialist**
- Interactive tool execution: `lookupTransaction(id)`, `lookupBorrower(query)`, `listHighRiskTransactions()`, and `getReconciliationExceptions()`.
- Built-in resilient dual-mode: runs seamlessly against a live backend with Gemini or directly in static demo mode on Firebase Hosting.

---

## 🏗️ Architecture & Tech Stack

- **Frontend:** React 19, TypeScript, Vite 8, Tailwind CSS v4, Motion, Recharts, Lucide Icons.
- **Backend (Optional Full-Stack Mode):** Node.js, Express, `@google/genai` (Gemini API with Function Calling).
- **Static Hosting:** Firebase Hosting with global CDN edge distribution and SPA URL rewrites.
- **Resilience:** Client-side telemetry and tool execution fallback for zero-backend static demo deployments.

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- [Node.js](https://nodejs.org) (v18 or higher recommended)
- `npm`

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/surajgju/finsight-ai.git
   cd finsight-ai
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment (Optional for live Gemini API):**
   ```bash
   cp .env.example .env.local
   ```
   Add your Google Gemini API key to `.env.local`:
   ```bash
   GEMINI_API_KEY="your-gemini-api-key"
   ```
   *(Note: The app will run in full static demo mode even without an API key).*

4. **Run the local development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Run Type Checking & Tests:**
   ```bash
   npm run lint
   npm test
   ```

---

## ☁️ Deployment

### Firebase Hosting (Static Demo UI)

1. Build the production bundle:
   ```bash
   npm run build
   ```

2. Deploy using Firebase CLI:
   ```bash
   npx -y firebase-tools@latest deploy --only hosting
   ```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
