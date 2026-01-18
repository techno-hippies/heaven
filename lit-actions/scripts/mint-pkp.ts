#!/usr/bin/env bun

/**
 * Mint PKP for Survey Registry Sponsor
 *
 * Prerequisites:
 * - PRIVATE_KEY set in .env (your deployer wallet)
 * - Chronicle Yellowstone testnet tokens (tstLPX)
 *   Get from: https://chronicle-yellowstone-faucet.getlit.dev/
 *
 * Usage:
 *   bun scripts/mint-pkp.ts
 */

import { createLitClient } from '@lit-protocol/lit-client';
import { createWalletClient, http, type Account, defineChain } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { Env } from '../tests/shared/env';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = join(__dirname, '../');

// Chronicle Yellowstone chain config (for PKP minting)
const chronicleYellowstone = defineChain({
  id: 175188,
  name: 'Chronicle Yellowstone',
  nativeCurrency: { name: 'tstLPX', symbol: 'tstLPX', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://yellowstone-rpc.litprotocol.com'] },
  },
  blockExplorers: {
    default: { name: 'Chronicle Explorer', url: 'https://yellowstone-explorer.litprotocol.com' },
  },
});

async function main() {
  console.log('🔐 Mint PKP for Survey Registry Sponsor');
  console.log('='.repeat(50));
  console.log(`   Network: ${Env.name}`);

  // Check for private key
  let privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.error('\n❌ PRIVATE_KEY not found in .env');
    console.error('   Create .env with: PRIVATE_KEY=0x...');
    process.exit(1);
  }
  if (!privateKey.startsWith('0x')) {
    privateKey = '0x' + privateKey;
  }

  // Create account
  const account = privateKeyToAccount(privateKey as `0x${string}`);
  console.log(`   Account: ${account.address}`);

  // Create wallet client for Chronicle Yellowstone
  const walletClient = createWalletClient({
    account,
    chain: chronicleYellowstone,
    transport: http(),
  });

  console.log('\n⚠️  You need tstLPX tokens to mint a PKP');
  console.log('   Get from: https://chronicle-yellowstone-faucet.getlit.dev/');

  // Connect to Lit
  console.log('\n🔌 Connecting to Lit Protocol...');
  const litClient = await createLitClient({ network: Env.litNetwork });
  console.log('✅ Connected');

  // Mint PKP with EOA (gives NFT ownership to the account)
  console.log('\n🪙 Minting PKP with EOA (this may take a minute)...');
  const mintedPkp = await litClient.mintWithEoa({
    account: walletClient.account as Account,
  });

  if (!mintedPkp.data) {
    console.error('❌ Failed to mint PKP');
    console.error('   Result:', mintedPkp);
    process.exit(1);
  }

  // SDK uses 'pubkey' not 'publicKey'
  const tokenId = mintedPkp.data.tokenId;
  const publicKey = mintedPkp.data.publicKey || mintedPkp.data.pubkey;
  const ethAddress = mintedPkp.data.ethAddress;

  // Debug: log full result if publicKey is missing
  if (!publicKey) {
    console.log('\n⚠️  Debug - Full mint result:');
    console.log(JSON.stringify(mintedPkp, (_, v) => typeof v === 'bigint' ? v.toString() : v, 2));
  }

  console.log('\n✅ PKP Minted!');
  console.log(`   Token ID: ${tokenId}`);
  console.log(`   Public Key: ${publicKey}`);
  console.log(`   ETH Address: ${ethAddress}`);

  // Save to file
  const outputDir = join(ROOT_DIR, 'output');
  if (!existsSync(outputDir)) {
    await mkdir(outputDir, { recursive: true });
  }

  const pkpInfo = {
    tokenId: tokenId.toString(),
    publicKey,
    ethAddress,
    owner: account.address,
    network: Env.name,
    mintedAt: new Date().toISOString(),
  };

  const outputPath = join(outputDir, `pkp-${Env.name}.json`);
  await writeFile(outputPath, JSON.stringify(pkpInfo, null, 2));
  console.log(`\n💾 Saved to: output/pkp-${Env.name}.json`);

  console.log('\n📋 Next steps:');
  console.log('   1. Update actions/survey-registry-sponsor-v1.js with PKP credentials');
  console.log('   2. Deploy Lit Action: bun scripts/setup.ts survey');
  console.log(`   3. Fund the PKP with Base Sepolia ETH: ${ethAddress}`);

  await litClient.disconnect();
}

main().catch(err => {
  console.error('\n❌ Error:', err.message);
  process.exit(1);
});
