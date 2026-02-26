<script setup lang="ts">
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
      <div class="container text-center max-w-4xl mx-auto px-4">
        <div class="inline-flex items-center rounded-full border border-border px-4 py-1.5 text-sm text-muted-foreground mb-6">
          Built for the BNB Smart Builders Challenge
        </div>
        <h1 class="text-4xl md:text-6xl font-bold tracking-tight mb-6">
          Turn Invoices Into
          <span class="text-primary"> On-Chain Assets</span>
        </h1>
        <p class="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Get paid in stablecoins via escrow. Sell invoices early for instant cashflow.
          AI-powered risk scoring. Non-custodial and open source.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
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
        <h2 class="text-3xl font-bold text-center mb-4">Covers Every Theme</h2>
        <p class="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          InvoiceFlow maps to all BNB Smart Builders Challenge categories
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

    <!-- CTA -->
    <section id="themes" class="py-16 bg-muted/50">
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
