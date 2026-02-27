# 🧾 InvoiceFlow

**Turn real-world invoices into programmable on-chain receivables on BNB Chain.**

> Get paid in stablecoins via escrow • Sell invoices early (factoring) for instant cashflow • AI-powered risk scoring • DeSci research funding

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![BNB Chain](https://img.shields.io/badge/BNB_Chain-BSC_Testnet-F0B90B)](https://www.bnbchain.org)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.24-363636)](https://soliditylang.org)

---

## 🎯 Problem

Freelancers and SMEs wait 30–90 days to get paid. Meanwhile, they can't invest, grow, or even cover operating costs. Traditional factoring is expensive, opaque, and inaccessible to small businesses.

## 💡 Solution

InvoiceFlow tokenizes invoices as NFTs on BNB Chain, enabling:
- **Instant stablecoin payments** via non-custodial escrow
- **Invoice factoring marketplace** — sell receivables to investors at a discount for instant cash
- **AI risk scoring** — automated discount suggestions and fraud detection
- **DeSci research pool** — opt-in anonymized payment data for academic research

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Vue 3)                       │
│          Wallet Connect · Dashboard · Marketplace         │
└──────────────┬────────────────────────┬──────────────────┘
               │                        │
               ▼                        ▼
┌──────────────────────┐   ┌──────────────────────────────┐
│   Backend (Express)   │   │     BNB Smart Chain           │
│  • REST API           │   │                               │
│  • AI Risk Scoring    │   │  ┌─────────────────────────┐  │
│  • Invoice Metadata   │   │  │   InvoiceNFT (ERC-721)  │  │
│  • PDF Storage        │   │  │   • Mint/Approve/Dispute │  │
│                       │   │  └────────┬────────────────┘  │
│   Prisma + PostgreSQL │   │           │                    │
└───────────────────────┘   │  ┌────────▼────────────────┐  │
                            │  │   InvoiceEscrow          │  │
                            │  │   • Stablecoin payments  │  │
                            │  │   • Protocol fees        │  │
                            │  └─────────────────────────┘  │
                            │                               │
                            │  ┌─────────────────────────┐  │
                            │  │   InvoiceMarketplace     │  │
                            │  │   • List/Buy invoices    │  │
                            │  │   • DeFi factoring       │  │
                            │  └─────────────────────────┘  │
                            │                               │
                            │  ┌─────────────────────────┐  │
                            │  │   ResearchPool (DeSci)   │  │
                            │  │   • Donations/Grants     │  │
                            │  │   • Access NFTs          │  │
                            │  └─────────────────────────┘  │
                            └──────────────────────────────┘
```

## 🎨 BNB Chain Theme Mapping

| Theme | Implementation |
|-------|---------------|
| **Payments** | Stablecoin invoice settlement via escrow, payment links, cross-border friendly |
| **RWA** | Invoices tokenized as ERC-721 NFTs — real-world receivables on-chain |
| **Trading** | Invoice marketplace — buy/sell invoice NFTs with transparent pricing |
| **DeFi** | Factoring = DeFi yield — investors buy invoices at discount, earn spread on settlement |
| **AI** | AI agent for risk scoring, discount suggestions, fraud detection |
| **Wallets** | MetaMask/WalletConnect integration, one-click payments |
| **DeSci** | Research pool with opt-in anonymized data, grant allocation, access NFTs |

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Smart Contracts** | Solidity 0.8.24, Hardhat, OpenZeppelin |
| **Frontend** | Vue 3, Vite, TailwindCSS, ethers.js v6 |
| **Backend** | Express, Prisma, PostgreSQL |
| **AI** | Risk scoring API (rule-based MVP, ML-ready) |
| **Chain** | BNB Smart Chain (BSC Testnet) |

## 📜 Smart Contracts

| Contract | Description | Testnet Address |
|----------|-------------|-----------------|
| `InvoiceNFT` | ERC-721 invoice tokens with status management | [`0x5e43b9C7910e938A1f3104E1552f002f22EDbf22`](https://testnet.bscscan.com/address/0x5e43b9C7910e938A1f3104E1552f002f22EDbf22) |
| `InvoiceEscrow` | Stablecoin payment routing with protocol fees | [`0x28E9ae4cBE146e90E99E748b6bb47234CFB383Dc`](https://testnet.bscscan.com/address/0x28E9ae4cBE146e90E99E748b6bb47234CFB383Dc) |
| `InvoiceMarketplace` | Invoice factoring — list/buy/cancel | [`0x2Cfa30007942020A0730bcb514f72a9Acd3387c4`](https://testnet.bscscan.com/address/0x2Cfa30007942020A0730bcb514f72a9Acd3387c4) |
| `ResearchPool` | DeSci donations, grants, access NFTs | [`0x2dEc98F4fF7ADd31A67b73eC7ACa5bd97ee8DB98`](https://testnet.bscscan.com/address/0x2dEc98F4fF7ADd31A67b73eC7ACa5bd97ee8DB98) |
| `MockStablecoin` | Test USDT for demo | [`0x1eA608aC5AF0130Cbb3dcD705797EAb56993E8Ca`](https://testnet.bscscan.com/address/0x1eA608aC5AF0130Cbb3dcD705797EAb56993E8Ca) |

### Invoice Lifecycle

```
DRAFT → AWAITING_APPROVAL → APPROVED → LISTED → SOLD → PAID
                                │                         ▲
                                └─── (direct payment) ────┘
                           DISPUTED → APPROVED/CANCELLED
```

## 🧪 Tests

**18/18 tests passing** covering all contracts and end-to-end flows:

```
InvoiceNFT (7 tests)     — mint, approve, dispute, resolve, cancel, edge cases
InvoiceEscrow (3 tests)  — pay, reject unauthorized, reject non-payer
Marketplace (3 tests)    — list+buy, cancel, reject non-approved
ResearchPool (3 tests)   — donate, grants, access NFTs
End-to-End (2 tests)     — full payment flow, full factoring flow
```

```bash
cd packages/contracts && npx hardhat test
```

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18
- npm or yarn
- MetaMask wallet

### Installation

```bash
# Clone the repo
git clone https://github.com/faheem870/invoiceflow.git
cd invoiceflow

# Install all dependencies (monorepo)
npm install

# Compile smart contracts
cd packages/contracts
npx hardhat compile

# Run tests
npx hardhat test
```

### Local Development

```bash
# Terminal 1: Start local blockchain
cd packages/contracts
npx hardhat node

# Terminal 2: Deploy contracts locally
npx hardhat run scripts/deploy.ts --network localhost

# Terminal 3: Start backend
cd packages/backend
cp .env.example .env  # configure DATABASE_URL
npm run dev

# Terminal 4: Start frontend
cd packages/frontend
npm run dev
```

### Deploy to BSC Testnet

```bash
# Set your private key in packages/contracts/.env
PRIVATE_KEY=your_wallet_private_key

# Deploy
cd packages/contracts
npx hardhat run scripts/deploy-testnet.ts --network bscTestnet
```

## 📁 Project Structure

```
invoiceflow/
├── packages/
│   ├── contracts/          # Solidity smart contracts
│   │   ├── contracts/      # InvoiceNFT, Escrow, Marketplace, ResearchPool
│   │   ├── scripts/        # Deploy scripts (local + testnet)
│   │   └── test/           # Hardhat tests (18 tests)
│   ├── backend/            # Express API + Prisma
│   │   ├── src/            # Routes, middleware, services
│   │   └── prisma/         # Database schema
│   ├── frontend/           # Vue 3 + Vite
│   │   └── src/
│   │       ├── views/      # Seller, Payer, Investor, DeSci pages
│   │       ├── composables/# Web3, Invoice, Escrow, Marketplace hooks
│   │       ├── stores/     # Pinia state management
│   │       └── components/ # Shared UI components
│   └── shared/             # Shared types and utilities
├── PRD_invoice_flow.md     # Product Requirements Document
└── README.md
```

## 🎬 Demo

> Demo video: [Coming Soon]

### Key Flows Demonstrated:
1. **Seller** creates invoice → mints NFT → requests payer approval
2. **Payer** reviews and approves invoice → pays via stablecoin escrow
3. **Seller** lists approved invoice on marketplace at discount
4. **Investor** buys invoice NFT → earns yield when payer settles
5. **DeSci** — donations to research pool, grant allocation

## 👥 Team

**Faheem Khan** — AI Systems Architect & Full-Stack Developer
- 15+ years in digital transformation
- 1,000+ workflows deployed, 50,000+ manual hours eliminated
- Expertise: MCP, CRM/ERP Integration, AI Agents, Web3

## 📄 License

This project is open source under the [MIT License](LICENSE).

---

**Built with 💛 for BNB Smart Builders Challenge**
