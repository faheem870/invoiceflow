import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(10),
  PINATA_JWT: z.string().optional(),
  PINATA_GATEWAY_URL: z.string().url().optional(),
  BSC_TESTNET_RPC: z.string().url(),
  CHAIN_ID: z.string().transform(Number).default('97'),
  PORT: z.string().transform(Number).default('3001'),
  INVOICE_NFT_ADDRESS: z.string().optional(),
  INVOICE_ESCROW_ADDRESS: z.string().optional(),
  INVOICE_MARKETPLACE_ADDRESS: z.string().optional(),
  RESEARCH_POOL_ADDRESS: z.string().optional(),
  MOCK_STABLECOIN_ADDRESS: z.string().optional(),
});

export const env = envSchema.parse(process.env);
