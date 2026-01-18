# Neodate V3 - Client Encoding

## Package Manager

Always use Bun, never npm/yarn/pnpm:
- `bun install` not `npm install`
- `bun add <pkg>` not `npm install <pkg>`
- `bun run <script>` not `npm run <script>`

## V3 Changes

V3 is minimal - only age, gender identity, and desired gender mask are encoded.
All other filtering happens off-chain via candidate sets.

## Usage

```typescript
import {
  GenderIdentity,
  GenderBucket,
  createBasicsFromUI,
  encodeBasics,
  decodeAgeBucket,
  decodeGenderId,
} from './encoding';

// Create config from UI state
const config = createBasicsFromUI(
  29,                      // age
  GenderIdentity.WOMAN,    // my gender
  true,                    // wants men
  false,                   // wants women
  false,                   // wants non-binary
  true,                    // share age on match
  true                     // share gender on match
);

// Encode for contract
const encoded = encodeBasics(config);
// {
//   claimedAge: 29,
//   genderId: 2,
//   desiredMask: 1,  // bit 0 only (men)
//   shareAge: true,
//   shareGender: true,
// }

// Decode shared values from match
const ageRange = decodeAgeBucket(28);  // "28-32"
const gender = decodeGenderId(1);      // "Man"
```

## Constants

```typescript
// Gender identity (1-5)
G_MAN = 1
G_WOMAN = 2
G_TRANS_MAN = 3
G_TRANS_WOMAN = 4
G_NON_BINARY = 5

// Desired mask bits
MASK_MEN = 0x01     // bit 0
MASK_WOMEN = 0x02   // bit 1
MASK_NB = 0x04      // bit 2
MASK_EVERYONE = 0x07

// Unknown sentinel
UNKNOWN_U8 = 255
```

## Directory V2 Helpers

```typescript
import { ageToPublicBucket, AGE_BUCKET_LABELS } from './encoding';

// Convert age to public bucket
const bucket = ageToPublicBucket(29);  // 2 (25-29)
const label = AGE_BUCKET_LABELS[bucket]; // "25-29"
```

## Contracts

See `../contracts/Dating.sol` (DatingV3) and `../contracts/Directory.sol` (DirectoryV2):
- 3 encrypted values: age, genderId, desiredMask
- 2 share flags: shareAge, shareGender
- Match-time symmetric enforcement
