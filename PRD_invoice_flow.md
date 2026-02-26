PRD v1 — InvoiceFlow (BNB Smart Builders Challenge)
One-liner

InvoiceFlow turns real-world invoices into programmable on-chain receivables:

Get paid in stablecoins via escrow + payment links

Sell invoices early (factoring) to investors for instant cashflow

Add AI automation for risk/discount, reminders, and fraud checks

Make it open-source, non-custodial, deployed on BSC/opBNB

1) Vision and Goals
1.1 Vision

Build the “Stripe + Escrow + Mini-DeFi market” for invoices on BNB Chain — but non-custodial and open-source, so anyone can use or integrate it.

1.2 Hackathon Goals (must ship)

Deployed smart contracts on BSC testnet or opBNB testnet

End-to-end demo that creates 2+ successful transactions:

mint invoice NFT + list/buy invoice OR mint + pay invoice

Open-source repo: contracts + frontend + README + demo steps

Clear mapping to themes: Payments, RWA, DeFi, Trading, AI, Wallets, DeSci

1.3 Non-Goals (MVP)

Full legal/regulated lending product

KYC/AML integrations

Complex dispute court/arbitration networks

Full accounting ERP integrations (later)

2) Users and Roles
Roles

Seller: freelancer/SME issuing invoice

Payer: hiring manager/client paying invoice

Investor (Buyer): purchases invoices at a discount

Arbitrator (optional): resolves disputes in MVP (can be admin multisig)

Research DAO member (DeSci module): accesses opt-in anonymized dataset + funding pool

3) Core Concepts (simple)

An Invoice NFT represents the invoice receivable (who owns the right to receive payment).

An Escrow contract receives stablecoin payments and routes them to:

the seller (if not sold), or

the investor (if sold)

A Marketplace lets investors buy invoices single or bundled.

Milestones + approval prevent “unfinished work” invoices from being cashed out.

4) How It Solves Every Theme (Required Mapping)
Trading

Invoice Marketplace = trading of invoice NFTs (transparent order book / listings)

Features:

single invoice trades

bulk/bundle trades (invoice baskets)

on-chain price history + yield analytics

RWA

Invoices are real-world claims (receivables) tokenized as NFTs:

hash of invoice PDF + key terms

ownership transfer = transfer of claim rights

AI

AI agent helps with:

discount suggestion (risk-based)

fraud/duplicate invoice detection

automated reminders + follow-ups

risk flags (late payer history)

DeSci

Opt-in research funding + data marketplace:

protocol allocates optional fee % to a Research Pool

sellers/payers can opt-in to share anonymized payment performance data

researchers buy access with a token-gated license (NFT pass) or grants funded by pool

DeFi

Factoring = DeFi yield:

investors buy invoices at discount → earn spread on settlement

optional: pooled liquidity vault (v2)

Payments

Stablecoin invoice settlement:

payment link/QR

escrow receipt on-chain

cross-border-friendly stablecoin payments

Wallets

Mainstream UX improvements:

account abstraction (optional) / gas sponsorship (optional)

social recovery (optional)

“Pay without thinking” UI: one-click stablecoin approvals + safety checks

5) Product Modules
Module A — Invoice Creation + Proof (RWA)

Features

Create invoice (amount, due date, payer address, stablecoin, milestone)

Upload PDF (off-chain), store hash on-chain

Mint Invoice NFT

Key rule

Invoice can be minted as DRAFT (not sellable) until payer approval or milestone completion.

Module B — Milestone + Approval (Solves “unfinished work”)

Goal: If freelancer is delayed/not completed, invoice should not be cashed.

Mechanisms

Milestone invoices

Work split into milestones

Each milestone = separate invoice NFT

Payer Approval Gate

Invoice starts as AWAITING_APPROVAL

Payer must approve it → becomes APPROVED and sellable

Dispute Flag

Payer can mark DISPUTED

Disputed invoices cannot be sold/paid until resolved

Auto-expiry

If not approved within X days → invoice auto-cancels or stays pending (config)

Module C — Payments (Stablecoin Escrow)

Features

Payer pays stablecoin via escrow

Escrow routes funds to current owner

On-chain receipt + status PAID

MVP constraints

Support 1–2 test stablecoins per chain (allowlist)

Module D — Trading Marketplace (Invoices)

Features

List invoice with sale price (discount)

Buy invoice

Bundle/bulk listing (optional v1.1):

Seller creates a “basket” of invoice IDs

Investor buys basket in one txn (or few)

Module E — DeFi Factoring (Yield)

MVP (simple)

Investor buys invoice directly (P2P) at discount
v2

Liquidity Pool:

LPs deposit stablecoin

pool buys approved invoices based on rules

LP shares represent yield

Module F — AI Agent (Explainable)

AI Outputs

Recommended discount % (e.g., 1%–8%)

Risk label: Low/Medium/High

Explanation (human readable)

Signals

Days to due date

payer on-chain activity (basic)

payer history in app: on-time ratio, disputes ratio

invoice amount vs payer history

AI Safety

AI suggests; user can override

clear “This is not financial advice” disclaimer

Module G — DeSci: Research Pool + Data Access (Opt-in)

Two parts

Research Pool

Protocol fee split option:

e.g., 0.2% settlement fee → 0.05% goes to research pool (optional toggle)

Funds are distributed by a simple DAO vote (hackathon demo can be admin multisig)

Anonymized Dataset Marketplace

Sellers/payers opt-in:

share anonymized events (paid on time/late, amount bucket, industry tag)

no names, no invoice PDFs, no addresses exposed publicly (use hashing/bucketing)

Researchers purchase an “Access NFT” (license) or get grant funded

6) Smart Contract Spec (MVP)
Contract 1: InvoiceNFT.sol (ERC-721)

Stores

invoiceHash (bytes32)

amount (uint256)

token (address stablecoin)

payer (address)

seller (address)

dueDate (uint64)

status enum

Status

DRAFT

AWAITING_APPROVAL

APPROVED

LISTED

SOLD

DISPUTED

PAID

CANCELLED

Key functions

mintDraft(...)

requestApproval(invoiceId)

approve(invoiceId) (payer)

dispute(invoiceId) (payer)

resolveDispute(invoiceId, resolution) (arbitrator/admin multisig)

setStatus(...) (authorized modules)

Contract 2: InvoiceEscrow.sol

Purpose: stablecoin settlement + receipts

Functions

pay(invoiceId)

checks status == APPROVED || SOLD

transfers stablecoin from payer

routes payment to current owner (seller or investor)

marks PAID

emits InvoicePaid

Contract 3: InvoiceMarket.sol (Trading)

Functions

list(invoiceId, salePrice, expiry)

only if APPROVED

buy(invoiceId)

transfers stablecoin to seller

transfers NFT to buyer

marks SOLD

(Optional v1.1) bundleList(invoiceIds[], bundlePrice) + bundleBuy(bundleId)

Contract 4: ResearchPool.sol (DeSci)

Functions

donate(amount) (stablecoin or BNB)

allocateGrant(to, amount) (DAO/admin for MVP)

optional accessNFT for dataset license

7) Backend + Storage
Off-chain components (MVP minimal)

Frontend: Next.js/React (or any)

DB (Postgres): store invoice metadata mirrors + events for fast UI

File storage: AWS S3 (simple) or Greenfield/IPFS (bonus)

AI service: small API endpoint for discount suggestion (can start rule-based)

What is on-chain vs off-chain

On-chain

invoice ownership + status

escrow payments + receipts

marketplace trades

research pool transfers

Off-chain

invoice PDF storage

AI scoring

analytics dashboards

8) UI Screens (MVP)
Seller

Dashboard

invoices list (status, amount, due date)

“Create invoice” CTA

Create Invoice

amount, due date, payer address, token

milestone checkbox (optional)

upload PDF

“Mint Draft” → “Request Approval”

Invoice Detail

Status timeline

Buttons:

Share payment link / QR

List for instant liquidity (only after APPROVED)

Cancel (if not sold/paid)

Payer

Invoice Approval Page

Review summary + PDF link

Approve / Dispute

Pay Page

“Pay Now”

Receipt after payment

Investor

Marketplace

list of invoices (discount %, due, implied ROI)

Buy

DeSci

Research Pool

funds raised

donate toggle

“request grant / allocate grant” (demo)

9) Business Model (Monetization)

Protocol fee: 0.1%–0.3% on successful settlement

Optional subscription later for dashboards, exports, team roles

Optional investor marketplace fee

10) MVP Acceptance Criteria (Judge-proof)

✅ Deployed contracts (BSC/opBNB testnet)
✅ At least 2 successful tx:

Mint invoice NFT

Approve invoice

List + Buy invoice

Pay invoice (escrow)
✅ Explorer links included in README
✅ Demo video shows end-to-end flow
✅ Repo is open-source with setup steps

11) Roadmap (After MVP)

v1.1

Bulk/bundle invoice trading

Partial payments

Auto reminders

v2

Liquidity pool + LP shares

Account abstraction / gas sponsorship

Stronger dispute resolution

v3

On/off ramp partners

Compliance & enterprise integrations

12) Hackathon Build Plan (Fast)

Day 1: InvoiceNFT + mint + approval
Day 2: Escrow pay + receipts
Day 3: Marketplace list/buy
Day 4: AI discount endpoint + UI polish
Day 5: DeSci pool demo + pitch deck + demo video


Selection Criteria
Relevance to BNB Chain ecosystem priorities
Technical feasibility and scalability
User experience and accessibility
Originality and creativity of solution
Real-world problem fit and market potential