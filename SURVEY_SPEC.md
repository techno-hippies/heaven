# Neodate Survey System Specification

## Overview

Portable, encrypted dating surveys stored on IPFS with on-chain discovery. Users own their data; Neodate never has custody of encrypted content or keys.

```
┌─────────────────────────────────────────────────────────────────────┐
│  Client (browser/extension)                                         │
│    ├── Creates survey responses                                     │
│    ├── Encrypts sensitive tiers with Lit Protocol                  │
│    ├── Uploads to Filebase (user's API key)                        │
│    └── Registers CID on-chain                                       │
├─────────────────────────────────────────────────────────────────────┤
│  Filebase (IPFS pinning)                                            │
│    └── Stores encrypted blobs, returns CIDs                         │
├─────────────────────────────────────────────────────────────────────┤
│  SurveyRegistry.sol (on-chain)                                      │
│    └── Maps wallet + schemaId → responseCid                         │
├─────────────────────────────────────────────────────────────────────┤
│  Matchmaking (offchain)                                             │
│    ├── Reads public survey tier for candidate ranking               │
│    ├── Combines with DNS behavioral signals (Tinybird)              │
│    └── Generates candidate sets for FHE matching                    │
├─────────────────────────────────────────────────────────────────────┤
│  Post-Match Reveal (client-side)                                    │
│    └── Decrypts match-only tier via Lit (condition: areMatched)     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Data Tiers

| Tier | Visibility | Encryption | Use Case |
|------|------------|------------|----------|
| **Public** | Anyone | None | Hobbies, music taste, languages |
| **Match-Only** | Matched pairs | Lit (areMatched condition) | Relationship goals, dealbreakers |
| **Private** | Owner only | Lit (owner condition) | Personal notes, never shared |

---

## Schema ID Convention

Schema IDs are deterministic `bytes32` values derived from human-readable names:

```typescript
import { keccak256, toUtf8Bytes } from 'ethers';

function deriveSchemaId(name: string, version: number): string {
  return keccak256(toUtf8Bytes(`${name}:${version}`));
}

// Example
const schemaId = deriveSchemaId("neodate-personality", 1);
// → 0x7a3f8b2c...
```

**Important:** Both human-readable (`id`, `version`) and derived (`schemaIdBytes32`) must be present in all formats for verification and to prevent mismatches.

---

## File Formats

### survey-response.json (Top-Level)

Pinned to IPFS. Contains public tier inline, references encrypted tier envelopes by CID.

```typescript
interface SurveyResponse {
  // Schema reference (both forms required)
  schemaId: string;           // Human-readable: "neodate-personality"
  schemaVersion: number;      // 1
  schemaIdBytes32: string;    // "0x7a3f..." - must match keccak256(utf8("schemaId:schemaVersion"))

  // Public tier (inline, readable by anyone)
  public: {
    [questionId: string]: unknown;
  };

  // Encrypted tier references (CIDs of LitEncryptedEnvelope)
  matchOnly?: {
    cid: string;              // IPFS CID of LitEncryptedEnvelope
  };

  private?: {
    cid: string;              // IPFS CID of LitEncryptedEnvelope
  };

  // Metadata
  createdAt: number;          // Unix timestamp (seconds)
  updatedAt: number;
}
```

**Note:** No embedded signature. On-chain registration is the authorship proof.

### LitEncryptedEnvelope (Encrypted Tier Blob)

**Critical:** Raw ciphertext alone is not enough to decrypt. Lit requires `dataToEncryptHash` and access control conditions. Pin this envelope, not raw ciphertext.

```typescript
interface LitEncryptedEnvelope {
  v: 1;                                    // Envelope version
  ciphertext: string;                      // Base64-encoded encrypted data
  dataToEncryptHash: string;               // Hash from Lit encrypt response

  // Exactly ONE of these condition arrays will be set (others undefined)
  evmContractConditions?: object[];        // For contract calls (areMatched, etc.)
  accessControlConditions?: object[];      // For basic wallet checks
  unifiedAccessControlConditions?: object[]; // For mixed conditions

  chain: string;                           // "sepolia", "ethereum", etc.
}
```

### Encrypted Tier Content (Pre-Encryption Plaintext)

```typescript
interface EncryptedTierContent {
  schemaId: string;
  schemaIdBytes32: string;
  tier: "matchOnly" | "private";
  responses: {
    [questionId: string]: unknown;
  };
}
```

### Schema Definition

```typescript
interface SurveySchema {
  id: string;                    // "neodate-personality"
  version: number;               // 1
  schemaIdBytes32: string;       // "0x7a3f..." (derived, for verification)
  name: string;                  // "Neodate Personality Survey"
  description: string;

  questions: Array<{
    id: string;                  // "hobbies"
    text: string;                // "What are your hobbies?"
    type: "text" | "number" | "select" | "multiselect" | "scale";
    options?: string[];          // For select/multiselect
    range?: [number, number];    // For scale
    defaultTier: "public" | "matchOnly" | "private";
    required: boolean;
  }>;

  author: string;                // Wallet address
  publishedAt: number;           // Unix timestamp
}
```

---

## Filebase Upload API

### Option 1: IPFS RPC API (Recommended)

Single HTTP call to upload and pin.

**Endpoint:** `POST https://rpc.filebase.io/api/v0/add`

**Headers:**
```
Authorization: Bearer <bucket-api-key>
```

**Important:** Do NOT set `Content-Type` manually when using `FormData`. The browser sets the multipart boundary automatically. Setting it manually breaks the request.

**Request:**
```typescript
async function uploadToFilebase(content: Uint8Array | string, apiKey: string): Promise<string> {
  const formData = new FormData();
  const blob = typeof content === 'string'
    ? new Blob([content], { type: 'application/json' })
    : new Blob([content], { type: 'application/octet-stream' });
  formData.append('file', blob);

  const response = await fetch('https://rpc.filebase.io/api/v0/add', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`
      // NO Content-Type header - let browser set it
    },
    body: formData
  });

  if (!response.ok) {
    throw new Error(`Filebase upload failed: ${response.status}`);
  }

  const { Hash } = await response.json();
  return Hash; // This is the CID
}
```

**Response:**
```json
{
  "Name": "file",
  "Hash": "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
  "Size": "1234"
}
```

### Option 2: S3-Compatible API

For larger files or when you need S3 tooling.

**Endpoint:** `PUT https://s3.filebase.com/<bucket>/<key>`

**Headers:**
```
Authorization: AWS4-HMAC-SHA256 ...
x-amz-meta-import: car  (optional, for CAR files)
```

**Response Headers:**
```
x-amz-meta-cid: bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi
```

### CORS Considerations

**Filebase may block direct browser uploads due to CORS.** Test this first. Options if blocked:

1. **Browser extension** - Extensions have relaxed CORS policies (recommended)
2. **Native app** - No CORS restrictions
3. **S3 presigned URL** - Generate presigned URL server-side, but this introduces server involvement

For Neodate, recommend **browser extension flow** to maintain no-custody model.

---

## Lit Protocol Encryption

### Prerequisites

Dating.sol exposes a public view function for match verification:

```solidity
// contracts/dating/contracts/Dating.sol:665-667
function areMatched(address a, address b) external view returns (bool) {
    return isMatch[a][b];
}
```

Lit Protocol can call this on-chain to verify match status before decryption.

### Access Control Conditions

**Match-Only Tier (evmContractConditions):**

Contract-based conditions use `evmContractConditions`, not `accessControlConditions`.

```typescript
const matchOnlyConditions = [
  {
    contractAddress: DATING_CONTRACT_ADDRESS,
    chain: 'sepolia',
    functionName: 'areMatched',
    functionParams: [':userAddress', OWNER_ADDRESS],
    functionAbi: {
      name: 'areMatched',
      inputs: [
        { name: 'a', type: 'address' },
        { name: 'b', type: 'address' }
      ],
      outputs: [{ name: '', type: 'bool' }]
    },
    returnValueTest: {
      comparator: '=',
      value: 'true'
    }
  }
];

// Use evmContractConditions for contract calls
const encryptParams = {
  dataToEncrypt: new TextEncoder().encode(data),
  evmContractConditions: matchOnlyConditions,
  chain: 'sepolia',
};
```

**Private Tier (Owner Only - accessControlConditions):**

Basic wallet ownership uses `accessControlConditions`.

```typescript
const privateConditions = [
  {
    conditionType: 'evmBasic',
    contractAddress: '',
    standardContractType: '',
    chain: 'sepolia',
    method: '',
    parameters: [':userAddress'],
    returnValueTest: {
      comparator: '=',
      value: OWNER_ADDRESS
    }
  }
];

// Use accessControlConditions for basic wallet checks
const encryptParams = {
  dataToEncrypt: new TextEncoder().encode(data),
  accessControlConditions: privateConditions,
  chain: 'sepolia',
};
```

### Encryption Flow

```typescript
import { LitNodeClient } from '@lit-protocol/lit-node-client';

const litClient = new LitNodeClient({ litNetwork: 'cayenne' });
await litClient.connect();

// Encrypt match-only tier (using evmContractConditions for contract calls)
const { ciphertext, dataToEncryptHash } = await litClient.encrypt({
  dataToEncrypt: new TextEncoder().encode(JSON.stringify(matchOnlyContent)),
  evmContractConditions: matchOnlyConditions,
  chain: 'sepolia',
});

// Build the envelope (CRITICAL: includes all metadata needed for decryption)
// Use the same condition type key as encryption
const envelope: LitEncryptedEnvelope = {
  v: 1,
  ciphertext: uint8ArrayToBase64(ciphertext),
  dataToEncryptHash,
  evmContractConditions: matchOnlyConditions,  // matches encrypt call
  chain: 'sepolia'
};

// Upload envelope to Filebase (not raw ciphertext!)
const matchOnlyCid = await uploadToFilebase(
  JSON.stringify(envelope),
  FILEBASE_API_KEY
);
```

### Decryption Flow (Post-Match)

```typescript
// Gateway URL - use your own Filebase gateway for reliability
const IPFS_GATEWAY = 'https://ipfs.neodate.xyz/ipfs';

// 1. Fetch the envelope
const envelopeResponse = await fetch(`${IPFS_GATEWAY}/${survey.matchOnly.cid}`);
const envelope: LitEncryptedEnvelope = await envelopeResponse.json();

// 2. Reconstruct ciphertext as Uint8Array
const ciphertext = base64ToUint8Array(envelope.ciphertext);

// 3. Build decrypt params matching the envelope's condition type
const authSig = await litClient.getAuthSig();

const decryptParams: any = {
  ciphertext,
  dataToEncryptHash: envelope.dataToEncryptHash,
  authSig,
  chain: envelope.chain,
};

// Use whichever condition type was stored in the envelope
if (envelope.evmContractConditions) {
  decryptParams.evmContractConditions = envelope.evmContractConditions;
} else if (envelope.accessControlConditions) {
  decryptParams.accessControlConditions = envelope.accessControlConditions;
} else if (envelope.unifiedAccessControlConditions) {
  decryptParams.unifiedAccessControlConditions = envelope.unifiedAccessControlConditions;
}

const decryptedContent = await litClient.decrypt(decryptParams);

// 4. Parse and use
const matchOnlyResponses = JSON.parse(
  new TextDecoder().decode(decryptedContent)
);
```

---

## On-Chain Registry Interface

### Design Rules

1. **Schema publication required:** `register()` reverts if `schemaId` is not published. This keeps the registry meaningful and prevents garbage data.

2. **Encryption mode validation:** Indexers should validate that `encryptionMode` matches the presence/absence of `matchOnly`/`private` CIDs in the survey response.

3. **Permissionless schemas with curation:** Anyone can publish a schema, admin can bless for UI promotion.

### SurveyRegistry.sol

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface ISurveyRegistry {
    // =========================================================================
    // Events
    // =========================================================================

    event SurveyRegistered(
        address indexed wallet,
        bytes32 indexed schemaId,
        string responseCid,
        uint8 encryptionMode
    );
    event SurveyDeleted(address indexed wallet, bytes32 indexed schemaId);
    event SchemaPublished(bytes32 indexed schemaId, address indexed author, string cid);
    event SchemaBlessed(bytes32 indexed schemaId);
    event AdminTransferred(address indexed oldAdmin, address indexed newAdmin);

    // =========================================================================
    // Constants
    // =========================================================================

    // Encryption modes
    // 0 = ENC_NONE: All public (no matchOnly or private CIDs expected)
    // 1 = ENC_MATCH_ONLY: Public + match-only tier (matchOnly CID required)
    // 2 = ENC_TIERED: Public + match-only + private tiers (both CIDs required)

    // =========================================================================
    // Survey Registration
    // =========================================================================

    /// @notice Register a survey response CID
    /// @dev Reverts if schemaId is not published (prevents garbage data)
    /// @param schemaId Schema identifier (keccak256 of "name:version")
    /// @param responseCid IPFS CID of survey-response.json
    /// @param encryptionMode 0=none, 1=match-only, 2=tiered
    function register(
        bytes32 schemaId,
        string calldata responseCid,
        uint8 encryptionMode
    ) external;

    /// @notice Register via meta-transaction (gasless)
    function registerWithSignature(
        address wallet,
        bytes32 schemaId,
        string calldata responseCid,
        uint8 encryptionMode,
        uint256 deadline,
        bytes calldata signature
    ) external;

    /// @notice Delete a survey registration
    function deleteSurvey(bytes32 schemaId) external;

    /// @notice Delete via meta-transaction (gasless)
    function deleteSurveyWithSignature(
        address wallet,
        bytes32 schemaId,
        uint256 deadline,
        bytes calldata signature
    ) external;

    // =========================================================================
    // Schema Registry
    // =========================================================================

    /// @notice Publish a new survey schema (permissionless)
    /// @param schemaId Unique identifier (keccak256 of "name:version")
    /// @param cid IPFS CID of schema definition JSON
    function publishSchema(bytes32 schemaId, string calldata cid) external;

    /// @notice Bless a schema (admin curation)
    function blessSchema(bytes32 schemaId) external;

    // =========================================================================
    // Views
    // =========================================================================

    /// @notice Get a user's survey entry
    function getSurvey(address wallet, bytes32 schemaId)
        external view
        returns (string memory responseCid, uint8 encryptionMode, uint32 updatedAt);

    /// @notice Check if user has registered for a schema
    function hasSurvey(address wallet, bytes32 schemaId) external view returns (bool);

    /// @notice Get schema metadata
    function schemas(bytes32 schemaId)
        external view
        returns (string memory cid, address author, bool blessed, uint32 publishedAt);

    /// @notice Get EIP-712 domain separator
    function DOMAIN_SEPARATOR() external view returns (bytes32);

    /// @notice Get user's current nonce (for meta-tx)
    function nonces(address wallet) external view returns (uint256);
}
```

### EIP-712 Type Hashes

```solidity
bytes32 constant REGISTER_TYPEHASH = keccak256(
    "RegisterSurvey(address wallet,bytes32 schemaId,string responseCid,uint8 encryptionMode,uint256 nonce,uint256 deadline)"
);

bytes32 constant DELETE_TYPEHASH = keccak256(
    "DeleteSurvey(address wallet,bytes32 schemaId,uint256 nonce,uint256 deadline)"
);
```

### Deployment

- **Chain:** Same as Dating.sol (Sepolia initially, mainnet later)
- **Constructor:** `constructor(address _admin)`
- **Admin:** Can bless schemas, transfer admin role

---

## Client Upload Flow

### Complete Example

```typescript
import { keccak256, toUtf8Bytes } from 'ethers';
import { LitNodeClient } from '@lit-protocol/lit-node-client';

// Helper functions
function uint8ArrayToBase64(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes));
}

function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// 1. Derive schema ID (both forms)
const schemaName = 'neodate-personality';
const schemaVersion = 1;
const schemaIdBytes32 = keccak256(toUtf8Bytes(`${schemaName}:${schemaVersion}`));

// 2. Build response tiers
const publicTier = {
  hobbies: ['beatles', 'dance', 'cooking'],
  languages: ['en', 'es'],
  outdoorsy: 4
};

const matchOnlyContent: EncryptedTierContent = {
  schemaId: schemaName,
  schemaIdBytes32,
  tier: 'matchOnly',
  responses: {
    relationshipGoals: 'long_term',
    dealbreakers: ['smoking', 'dishonesty']
  }
};

// 3. Build access control conditions
const matchOnlyConditions = [
  {
    contractAddress: DATING_CONTRACT,
    chain: 'sepolia',
    functionName: 'areMatched',
    functionParams: [':userAddress', userAddress],
    functionAbi: {
      name: 'areMatched',
      inputs: [
        { name: 'a', type: 'address' },
        { name: 'b', type: 'address' }
      ],
      outputs: [{ name: '', type: 'bool' }]
    },
    returnValueTest: { comparator: '=', value: 'true' }
  }
];

// 4. Encrypt match-only tier with Lit (using evmContractConditions)
const litClient = new LitNodeClient({ litNetwork: 'cayenne' });
await litClient.connect();

const { ciphertext, dataToEncryptHash } = await litClient.encrypt({
  dataToEncrypt: new TextEncoder().encode(JSON.stringify(matchOnlyContent)),
  evmContractConditions: matchOnlyConditions,
  chain: 'sepolia',
});

// 5. Build encrypted envelope (use evmContractConditions for contract-based ACCs)
const envelope: LitEncryptedEnvelope = {
  v: 1,
  ciphertext: uint8ArrayToBase64(ciphertext),
  dataToEncryptHash,
  evmContractConditions: matchOnlyConditions,
  chain: 'sepolia'
};

// 6. Upload envelope to Filebase
const matchOnlyCid = await uploadToFilebase(
  JSON.stringify(envelope),
  FILEBASE_API_KEY
);

// 7. Build and upload survey-response.json
const surveyResponse: SurveyResponse = {
  schemaId: schemaName,
  schemaVersion,
  schemaIdBytes32,
  public: publicTier,
  matchOnly: { cid: matchOnlyCid },
  createdAt: Math.floor(Date.now() / 1000),
  updatedAt: Math.floor(Date.now() / 1000)
};

const responseCid = await uploadToFilebase(
  JSON.stringify(surveyResponse),
  FILEBASE_API_KEY
);

// 8. Register on-chain
const registry = new ethers.Contract(SURVEY_REGISTRY, SurveyRegistryABI, signer);
await registry.register(schemaIdBytes32, responseCid, 1); // 1 = ENC_MATCH_ONLY
```

---

## Indexer Validation Rules

When indexing `SurveyRegistered` events, validate:

```typescript
// Gateway URL - use your own Filebase gateway for reliability
const IPFS_GATEWAY = 'https://ipfs.neodate.xyz/ipfs';

async function indexSurvey(wallet: string, schemaId: string, responseCid: string, encryptionMode: number) {
  // 1. Fetch and parse survey response
  const response = await fetch(`${IPFS_GATEWAY}/${responseCid}`);
  const survey: SurveyResponse = await response.json();

  // 2. Validate schemaIdBytes32 matches event schemaId
  const expectedSchemaId = keccak256(toUtf8Bytes(`${survey.schemaId}:${survey.schemaVersion}`));
  if (expectedSchemaId.toLowerCase() !== schemaId.toLowerCase()) {
    console.warn(`Schema ID mismatch for ${wallet}: expected ${expectedSchemaId}, got ${schemaId}`);
    return; // Skip this entry
  }

  // 3. Validate encryptionMode matches CID presence
  const hasMatchOnly = !!survey.matchOnly?.cid;
  const hasPrivate = !!survey.private?.cid;

  const modeValid = (
    (encryptionMode === 0 && !hasMatchOnly && !hasPrivate) ||
    (encryptionMode === 1 && hasMatchOnly && !hasPrivate) ||
    (encryptionMode === 2 && hasMatchOnly && hasPrivate)
  );

  if (!modeValid) {
    console.warn(`Encryption mode mismatch for ${wallet}: mode=${encryptionMode}, hasMatchOnly=${hasMatchOnly}, hasPrivate=${hasPrivate}`);
    return; // Skip this entry
  }

  // 4. Validate public tier against schema (optional but recommended)
  const schema = await fetchSchema(schemaId);
  if (schema) {
    const publicQuestions = schema.questions.filter(q => q.defaultTier === 'public');
    for (const q of publicQuestions) {
      if (q.required && !(q.id in survey.public)) {
        console.warn(`Missing required public field ${q.id} for ${wallet}`);
        // Decide: skip or index partial
      }
    }
  }

  // 5. Index only public tier
  await db.surveys.upsert({
    wallet,
    schemaId,
    responseCid,
    encryptionMode,
    publicTier: survey.public,
    updatedAt: survey.updatedAt
  });
}
```

---

## Matchmaking Integration

### Indexing Public Tier

Offchain matchmaking service reads public tier from IPFS:

```typescript
// Listen to SurveyRegistered events
registry.on('SurveyRegistered', async (wallet, schemaId, responseCid, encryptionMode) => {
  await indexSurvey(wallet, schemaId, responseCid, encryptionMode);
});
```

### Candidate Selection

```
Inputs:
  - DNS behavioral signals (Tinybird)
  - Public survey tier (indexed, validated)
  - Directory on-chain fields

Output:
  - Ranked candidate set per user
  - Merkle root for like authorization
```

Encrypted tiers (matchOnly, private) are **never** accessed during candidate selection.

---

## Post-Match Reveal

After FHE match confirmation via Dating.sol:

```typescript
// Gateway URL - use your own Filebase gateway for reliability
const IPFS_GATEWAY = 'https://ipfs.neodate.xyz/ipfs';

// 1. Fetch matched user's survey
const [responseCid] = await registry.getSurvey(matchedUser, schemaId);
const response = await fetch(`${IPFS_GATEWAY}/${responseCid}`);
const survey: SurveyResponse = await response.json();

// 2. Fetch encrypted envelope
const envelopeResponse = await fetch(`${IPFS_GATEWAY}/${survey.matchOnly.cid}`);
const envelope: LitEncryptedEnvelope = await envelopeResponse.json();

// 3. Decrypt via Lit (proves caller is matched)
const authSig = await litClient.getAuthSig();

const decryptParams: any = {
  ciphertext: base64ToUint8Array(envelope.ciphertext),
  dataToEncryptHash: envelope.dataToEncryptHash,
  authSig,
  chain: envelope.chain,
};

// Use whichever condition type was stored in the envelope
  if (envelope.evmContractConditions) {
    decryptParams.evmContractConditions = envelope.evmContractConditions;
  } else if (envelope.accessControlConditions) {
    decryptParams.accessControlConditions = envelope.accessControlConditions;
  } else if (envelope.unifiedAccessControlConditions) {
    decryptParams.unifiedAccessControlConditions = envelope.unifiedAccessControlConditions;
  }

const decrypted = await litClient.decrypt(decryptParams);

// 4. Display shared values in UI
const matchOnlyResponses: EncryptedTierContent = JSON.parse(
  new TextDecoder().decode(decrypted)
);
showSharedValues(matchOnlyResponses.responses);
```

---

## Security Considerations

1. **No custody**: Neodate never stores raw survey data or encryption keys
2. **User-controlled pinning**: User's Filebase API key, user's storage
3. **On-chain authorship**: Registration transaction proves ownership
4. **Lit access control**: `areMatched(a, b)` check is on-chain, verifiable
5. **Tier separation**: Public data is explicitly chosen by user; sensitive data encrypted
6. **Envelope completeness**: All decryption metadata stored with ciphertext
7. **Schema enforcement**: Registry requires published schemas to prevent garbage

---

## Open Questions / Future Work

1. **Multi-schema support**: User may complete multiple surveys (personality, interests, lifestyle)
2. **Schema versioning**: Migration path when schema evolves
3. **Pinning incentives**: Community pinning pool for users without Filebase accounts
4. **Cross-app portability**: Standard schema IDs recognized by other dating apps
5. **Revocation**: Key rotation for encrypted tiers if user wants to "un-share"
6. **CORS testing**: Verify Filebase IPFS RPC CORS behavior in browser context
