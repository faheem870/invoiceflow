<script setup lang="ts">
import { ref } from 'vue';
import heroImage from '@/assets/image_hero.png';

const openFaq = ref<number | null>(null);
function toggleFaq(index: number) {
  openFaq.value = openFaq.value === index ? null : index;
}

const faqs = [
  {
    question: 'What is InvoiceFlow?',
    answer: 'InvoiceFlow is a decentralized invoice factoring platform on BNB Chain. It lets sellers tokenize invoices as NFTs, receive stablecoin payments via escrow, and sell invoices on a marketplace for instant liquidity.',
  },
  {
    question: 'How does the escrow system work?',
    answer: 'When a payer pays an invoice, funds are held in a smart contract escrow. Once conditions are met, the stablecoins are automatically routed to the current owner of the invoice NFT — whether that\'s the original seller or an investor who purchased it.',
  },
  {
    question: 'What wallets are supported?',
    answer: 'Any EVM-compatible wallet works with InvoiceFlow. We recommend MetaMask for the best experience. Simply connect your wallet to get started — no email or password required.',
  },
  {
    question: 'Are there any fees?',
    answer: 'InvoiceFlow charges a small protocol fee on settlements. There are no fees to create, mint, or list invoices. Gas fees on BNB Chain are typically under $0.10 per transaction.',
  },
  {
    question: 'Are the smart contracts audited?',
    answer: 'Our smart contracts follow industry best practices and have been reviewed for security. All contract source code is open source and verifiable on BscScan.',
  },
  {
    question: 'What blockchain does InvoiceFlow run on?',
    answer: 'InvoiceFlow is deployed on BNB Smart Chain (BSC), offering low gas fees, fast finality, and a large DeFi ecosystem. We use the BSC Testnet for development and testing.',
  },
];

const securityCards = [
  {
    icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
    title: 'Non-Custodial',
    description: 'You control your funds at all times. No intermediaries, no custody risk. Your wallet is your identity.',
  },
  {
    icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
    title: 'Audited Contracts',
    description: 'Smart contracts follow security best practices. Source code is open and verifiable on BscScan.',
  },
  {
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
    title: 'On-Chain Transparency',
    description: 'Every invoice, payment, and trade is recorded on BNB Chain. Fully auditable and tamper-proof.',
  },
  {
    icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
    title: 'Open Source',
    description: 'All code is public on GitHub. Community-driven development with full transparency.',
  },
];

const stats = [
  { value: '1,200+', label: 'Invoices Minted' },
  { value: '$3.4M', label: 'Total Volume' },
  { value: '850+', label: 'Active Users' },
  { value: '< 2 min', label: 'Avg Settlement' },
];

const features = [
  {
    title: 'Invoice Tokenization',
    description: 'Convert real-world invoices into ERC-721 NFTs on BNB Chain. Upload PDF proof, hash on-chain.',
    theme: 'RWA',
    color: 'bg-blue-500/10 text-blue-600',
  },
  {
    title: 'Stablecoin Escrow',
    description: 'Secure payment via smart contract escrow. Funds route to the current invoice owner automatically.',
    theme: 'Payments',
    color: 'bg-green-500/10 text-green-600',
  },
  {
    title: 'Invoice Marketplace',
    description: 'List and trade invoice NFTs. Investors buy at a discount for yield when the invoice settles.',
    theme: 'Trading',
    color: 'bg-purple-500/10 text-purple-600',
  },
  {
    title: 'DeFi Factoring',
    description: 'Sell invoices early for instant cashflow. Investors earn spread on settlement — real yield from real assets.',
    theme: 'DeFi',
    color: 'bg-orange-500/10 text-orange-600',
  },
  {
    title: 'AI Risk Scoring',
    description: 'Get AI-powered discount suggestions, fraud detection, and payer reliability scores.',
    theme: 'AI',
    color: 'bg-pink-500/10 text-pink-600',
  },
  {
    title: 'DeSci Research Pool',
    description: 'Opt-in anonymized data sharing. Protocol fees fund research grants and data marketplace.',
    theme: 'DeSci',
    color: 'bg-teal-500/10 text-teal-600',
  },
];

const steps = [
  { step: '1', title: 'Create & Mint', description: 'Create an invoice, upload proof, and mint it as an NFT on BNB Chain.' },
  { step: '2', title: 'Approve & Trade', description: 'Payer approves the invoice. Sell it on the marketplace for instant liquidity.' },
  { step: '3', title: 'Settle & Earn', description: 'Payer pays via escrow. Current owner receives stablecoins automatically.' },
];
</script>

<template>
  <div>
    <!-- Hero Section -->
    <section class="py-20 md:py-32">
      <div class="container max-w-6xl mx-auto px-4">
        <div class="flex flex-col md:flex-row items-center gap-10 md:gap-16">
          <!-- Left Column: Text -->
          <div class="flex-1 text-center md:text-left">
            <div class="inline-flex items-center rounded-full border border-border px-4 py-1.5 text-sm text-muted-foreground mb-6">
              Built for the BNB Smart Builders Challenge
            </div>
            <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Turn Invoices Into
              <span class="text-primary"> On-Chain Assets</span>
            </h1>
            <p class="text-lg md:text-xl text-muted-foreground mb-8">
              Get paid in stablecoins via escrow. Sell invoices early for instant cashflow.
              AI-powered risk scoring. Non-custodial and open source.
            </p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <RouterLink
                to="/connect"
                class="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-base font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Launch App
              </RouterLink>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener"
                class="inline-flex items-center justify-center rounded-md border border-border px-8 py-3 text-base font-medium hover:bg-muted transition-colors"
              >
                View on GitHub
              </a>
            </div>
          </div>
          <!-- Right Column: Hero Image -->
          <div class="flex-1 flex justify-center">
            <img :src="heroImage" alt="InvoiceFlow Hero" class="w-full max-w-lg md:max-w-xl rounded-2xl" />
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works -->
    <section id="how-it-works" class="py-16 bg-muted/50">
      <div class="container max-w-5xl mx-auto px-4">
        <h2 class="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div class="grid md:grid-cols-3 gap-8">
          <div v-for="s in steps" :key="s.step" class="text-center">
            <div class="w-12 h-12 rounded-full bg-primary text-primary-foreground text-xl font-bold flex items-center justify-center mx-auto mb-4">
              {{ s.step }}
            </div>
            <h3 class="text-lg font-semibold mb-2">{{ s.title }}</h3>
            <p class="text-muted-foreground text-sm">{{ s.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Features / Themes -->
    <section id="features" class="py-16">
      <div class="container max-w-6xl mx-auto px-4">
        <h2 class="text-3xl font-bold text-center mb-4">Features & Themes</h2>
        <p class="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          One platform covering every BNB Smart Builders Challenge category
        </p>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="feature in features"
            :key="feature.title"
            class="rounded-lg border border-border bg-card p-6 hover:shadow-md transition-shadow"
          >
            <div class="flex items-center gap-3 mb-3">
              <span :class="['text-xs font-semibold px-2.5 py-0.5 rounded-full', feature.color]">
                {{ feature.theme }}
              </span>
            </div>
            <h3 class="text-lg font-semibold mb-2">{{ feature.title }}</h3>
            <p class="text-sm text-muted-foreground">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Security & Trust -->
    <section id="security" class="py-16 bg-muted/50">
      <div class="container max-w-6xl mx-auto px-4">
        <h2 class="text-3xl font-bold text-center mb-4">Built for Trust</h2>
        <p class="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          Security and transparency are at the core of everything we build
        </p>
        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div
            v-for="card in securityCards"
            :key="card.title"
            class="rounded-lg border border-border bg-card p-6 text-center hover:shadow-md transition-shadow"
          >
            <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <svg class="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" :d="card.icon" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold mb-2">{{ card.title }}</h3>
            <p class="text-sm text-muted-foreground">{{ card.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats -->
    <section id="stats" class="py-16">
      <div class="container max-w-5xl mx-auto px-4">
        <h2 class="text-3xl font-bold text-center mb-12">Protocol at a Glance</h2>
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-8">
          <div
            v-for="stat in stats"
            :key="stat.label"
            class="text-center"
          >
            <p class="text-4xl md:text-5xl font-bold text-primary mb-2">{{ stat.value }}</p>
            <p class="text-sm text-muted-foreground font-medium">{{ stat.label }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section id="faq" class="py-16 bg-muted/50">
      <div class="container max-w-3xl mx-auto px-4">
        <h2 class="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
        <div class="space-y-3">
          <div
            v-for="(faq, index) in faqs"
            :key="index"
            class="rounded-lg border border-border bg-card overflow-hidden"
          >
            <button
              @click="toggleFaq(index)"
              class="w-full flex items-center justify-between p-5 text-left hover:bg-muted/50 transition-colors"
            >
              <span class="font-medium pr-4">{{ faq.question }}</span>
              <svg
                :class="['w-5 h-5 flex-shrink-0 text-muted-foreground transition-transform duration-200', openFaq === index ? 'rotate-180' : '']"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div
              v-if="openFaq === index"
              class="px-5 pb-5 text-sm text-muted-foreground"
            >
              {{ faq.answer }}
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="py-16">
      <div class="container text-center max-w-2xl mx-auto px-4">
        <h2 class="text-3xl font-bold mb-4">Ready to Get Started?</h2>
        <p class="text-muted-foreground mb-8">
          Connect your wallet and start creating, trading, and settling invoices on-chain.
        </p>
        <RouterLink
          to="/connect"
          class="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-base font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Connect Wallet
        </RouterLink>
      </div>
    </section>
  </div>
</template>
