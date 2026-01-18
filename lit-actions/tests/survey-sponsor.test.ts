#!/usr/bin/env bun

/**
 * Test Survey Registry Sponsor Lit Action
 *
 * Tests the sponsored survey registration flow in dry-run mode.
 * The action signs a transaction but doesn't broadcast unless --broadcast is passed.
 *
 * Usage:
 *   bun tests/survey-sponsor.test.ts
 *   bun tests/survey-sponsor.test.ts --broadcast  # Actually send tx (needs funded PKP)
 */

import { createLitClient } from '@lit-protocol/lit-client';
import { createAuthManager, storagePlugins, ViemAccountAuthenticator } from '@lit-protocol/auth';
import { createWalletClient, http, type Account, defineChain } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { keccak256, toBytes, type Hex } from 'viem';
import { baseSepolia } from 'viem/chains';
import { Env } from './shared/env';

const SURVEY_REGISTRY_ADDRESS = '0xdf9ed085cf7f676ccce760c219ce118ab38ce8ca';
const dryRun = !process.argv.includes('--broadcast');

// Chronicle Yellowstone chain (for PKP operations)
const chronicleYellowstone = defineChain({
  id: 175188,
  name: 'Chronicle Yellowstone',
  nativeCurrency: { name: 'tstLPX', symbol: 'tstLPX', decimals: 18 },
  rpcUrls: { default: { http: ['https://yellowstone-rpc.litprotocol.com'] } },
});

async function main() {
  console.log('🧪 Test Survey Registry Sponsor');
  console.log('='.repeat(50));
  console.log(`   Env: ${Env.name}`);
  console.log(`   Mode: ${dryRun ? 'DRY RUN (no tx broadcast)' : 'BROADCAST (real tx)'}`);

  // Load PKP credentials
  const pkpCreds = Env.loadPkpCreds();
  console.log(`   Sponsor PKP: ${pkpCreds.ethAddress}`);
  console.log(`   Action CID: ${Env.cids.survey}`);

  if (!Env.cids.survey) {
    console.error('\n❌ No survey CID found. Run: bun scripts/setup.ts survey');
    process.exit(1);
  }

  // Get private key for test user
  let privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.error('\n❌ PRIVATE_KEY not found');
    process.exit(1);
  }
  if (!privateKey.startsWith('0x')) privateKey = '0x' + privateKey;

  const userAccount = privateKeyToAccount(privateKey as `0x${string}`);
  console.log(`   Test User (EOA): ${userAccount.address}`);

  // Create wallet client for PKP operations
  const walletClient = createWalletClient({
    account: userAccount,
    chain: chronicleYellowstone,
    transport: http(),
  });

  // Connect to Lit
  console.log('\n🔌 Connecting to Lit Protocol...');
  const litClient = await createLitClient({ network: Env.litNetwork });
  console.log('✅ Connected');

  // Create Auth Manager with node storage
  const authManager = createAuthManager({
    storage: storagePlugins.localStorageNode({
      appName: 'survey-sponsor-test',
      networkName: Env.name,
      storagePath: './output/lit-auth',
    }),
  });

  // Authenticate with EOA
  console.log('\n🔑 Authenticating EOA...');
  const authData = await ViemAccountAuthenticator.authenticate(userAccount);
  console.log('✅ Auth data created');

  // Create PKP auth context
  console.log('\n📝 Creating PKP auth context...');
  const authContext = await authManager.createPkpAuthContext({
    authData,
    pkpPublicKey: pkpCreds.publicKey,
    authConfig: {
      resources: [
        ['pkp-signing', '*'],
        ['lit-action-execution', '*'],
      ],
      expiration: new Date(Date.now() + 1000 * 60 * 15).toISOString(), // 15 min
      statement: '',
    },
    litClient,
  });
  console.log('✅ Auth context ready');

  // Test data - simulating a user's survey registration
  const testSurveyId = keccak256(toBytes('test-schema-v1')) as Hex;
  const testCid = 'QmTestCID123456789abcdef';
  const testEncryptionMode = 1;
  const deadline = BigInt(Math.floor(Date.now() / 1000) + 900); // 15 min from now

  // Note: The deployed contract uses an older OZ version without public nonces() getter
  // For a fresh user, nonce is always 0. For users who have registered before, you'd need
  // to track nonces off-chain or redeploy with newer OZ version.
  const nonce = 0n;
  console.log(`   User nonce: ${nonce} (hardcoded - deployed contract lacks public getter)`);

  // Create EIP-712 signature (simulating user signing the permit)
  const cidHash = keccak256(toBytes(testCid));

  const typedDataDomain = {
    name: 'SurveyRegistry',
    version: '1',
    chainId: baseSepolia.id,
    verifyingContract: SURVEY_REGISTRY_ADDRESS,
  } as const;

  const typedDataTypes = {
    Register: [
      { name: 'user', type: 'address' },
      { name: 'surveyId', type: 'bytes32' },
      { name: 'cidHash', type: 'bytes32' },
      { name: 'encryptionMode', type: 'uint8' },
      { name: 'nonce', type: 'uint256' },
      { name: 'deadline', type: 'uint256' },
    ],
  } as const;

  const typedDataMessage = {
    user: userAccount.address,
    surveyId: testSurveyId,
    cidHash,
    encryptionMode: testEncryptionMode,
    nonce,
    deadline,
  };

  // Sign with user's EOA (simulating user permit signature)
  console.log('\n📝 Signing EIP-712 permit...');
  const userSig = await userAccount.signTypedData({
    domain: typedDataDomain,
    types: typedDataTypes,
    primaryType: 'Register',
    message: typedDataMessage,
  });
  console.log('✅ Permit signed');

  console.log('\n📋 Test Parameters:');
  console.log(`   user: ${userAccount.address}`);
  console.log(`   surveyId: ${testSurveyId.slice(0, 20)}...`);
  console.log(`   cid: ${testCid}`);
  console.log(`   encryptionMode: ${testEncryptionMode}`);
  console.log(`   deadline: ${deadline}`);
  console.log(`   userSig: ${userSig.slice(0, 20)}...`);
  console.log(`   dryRun: ${dryRun}`);

  // Execute the Lit Action
  console.log('\n🚀 Executing Lit Action...');

  try {
    // For Lit Action execution, we use executeJs with the IPFS CID and authContext
    // The action will sign and optionally broadcast the registerFor tx
    const result = await litClient.executeJs({
      ipfsId: Env.cids.survey,
      authContext,
      jsParams: {
        user: userAccount.address,
        surveyId: testSurveyId,
        cid: testCid,
        encryptionMode: testEncryptionMode,
        deadline: deadline.toString(),
        userSig,
        dryRun,
      },
    });

    console.log('\n✅ Lit Action executed');
    if (result.logs) {
      console.log('   Logs:', result.logs);
    }

    let response: any;
    if (typeof result.response === 'string') {
      try {
        response = JSON.parse(result.response);
      } catch {
        response = { raw: result.response };
      }
    } else {
      response = result.response;
    }

    console.log('\n📦 Response:');
    console.log(JSON.stringify(response, null, 2));

    if (response?.ok) {
      console.log('\n✅ SUCCESS!');
      if (response.dryRun) {
        console.log('   (Dry run - no tx was broadcast)');
        console.log(`   Signer: ${response.signer}`);
        console.log(`   Registry: ${response.registry}`);
        console.log(`   Chain ID: ${response.chainId}`);
        if (response.signedTx) {
          console.log(`   Signed TX (first 80 chars): ${response.signedTx.slice(0, 80)}...`);
        }
      }
      if (response.txHash) {
        console.log(`   TX Hash: ${response.txHash}`);
        console.log(`   View: https://sepolia.basescan.org/tx/${response.txHash}`);
      }
    } else {
      console.log('\n❌ FAILED:', response?.error || 'Unknown error');
    }

  } catch (error: any) {
    console.error('\n❌ Execution failed:', error.message);
    if (error.cause) console.error('   Cause:', error.cause);
  }

  await litClient.disconnect();
}

main().catch(err => {
  console.error('\n❌ Error:', err);
  process.exit(1);
});
