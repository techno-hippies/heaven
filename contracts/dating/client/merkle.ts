/**
 * Merkle tree utilities for candidate set authorization
 *
 * Stage 1 (Clickhouse) produces a list of candidates per user.
 * This list is Merkle-hashed so the user can authorize likes
 * only to wallets in their candidate set.
 */

import { keccak256, solidityPacked } from 'ethers';

/**
 * Compute leaf hash for a candidate address
 */
export function computeLeaf(address: string): string {
  return keccak256(solidityPacked(['address'], [address]));
}

/**
 * Build Merkle tree from list of candidate addresses
 * Returns { root, leaves, tree }
 */
export function buildMerkleTree(candidates: string[]): {
  root: string;
  leaves: string[];
  tree: string[][];
} {
  if (candidates.length === 0) {
    throw new Error('Cannot build tree with no candidates');
  }

  // Compute leaf hashes
  const leaves = candidates.map(computeLeaf);

  // Pad to power of 2
  const paddedLeaves = [...leaves];
  while (paddedLeaves.length < 2 || (paddedLeaves.length & (paddedLeaves.length - 1)) !== 0) {
    paddedLeaves.push(paddedLeaves[paddedLeaves.length - 1]); // Duplicate last leaf
  }

  // Build tree bottom-up
  const tree: string[][] = [paddedLeaves];
  let currentLevel = paddedLeaves;

  while (currentLevel.length > 1) {
    const nextLevel: string[] = [];
    for (let i = 0; i < currentLevel.length; i += 2) {
      const left = currentLevel[i];
      const right = currentLevel[i + 1];
      // Sort to ensure consistent ordering
      const [a, b] = left < right ? [left, right] : [right, left];
      nextLevel.push(keccak256(solidityPacked(['bytes32', 'bytes32'], [a, b])));
    }
    tree.push(nextLevel);
    currentLevel = nextLevel;
  }

  return {
    root: tree[tree.length - 1][0],
    leaves,
    tree,
  };
}

/**
 * Get Merkle proof for a candidate address
 */
export function getMerkleProof(
  candidate: string,
  tree: string[][],
  leaves: string[]
): string[] {
  const leaf = computeLeaf(candidate);
  let index = leaves.indexOf(leaf);

  if (index === -1) {
    throw new Error('Candidate not in tree');
  }

  // Handle padding - find in padded tree
  const paddedLeaves = tree[0];
  index = paddedLeaves.indexOf(leaf);

  const proof: string[] = [];
  let currentLevel = 0;

  while (currentLevel < tree.length - 1) {
    const levelNodes = tree[currentLevel];
    const siblingIndex = index % 2 === 0 ? index + 1 : index - 1;

    if (siblingIndex < levelNodes.length) {
      proof.push(levelNodes[siblingIndex]);
    }

    index = Math.floor(index / 2);
    currentLevel++;
  }

  return proof;
}

/**
 * Verify Merkle proof (client-side check before submission)
 */
export function verifyMerkleProof(
  candidate: string,
  proof: string[],
  root: string
): boolean {
  let hash = computeLeaf(candidate);

  for (const sibling of proof) {
    const [a, b] = hash < sibling ? [hash, sibling] : [sibling, hash];
    hash = keccak256(solidityPacked(['bytes32', 'bytes32'], [a, b]));
  }

  return hash === root;
}

// ============ AUTHORIZATION TYPES ============

export interface CandidateSet {
  userId: string;          // User this set is for
  candidates: string[];    // Candidate wallet addresses
  root: string;            // Merkle root
  tree: string[][];        // Full tree (for proof generation)
  leaves: string[];        // Leaf hashes
  createdAt: number;       // Timestamp
  expiresAt: number;       // When authorization should expire
}

export interface LikeAuthorizationParams {
  candidateSetRoot: string;
  maxLikes: number;
  expiry: number;
  nonce: bigint;
}

/**
 * Create candidate set from Stage 1 results
 */
export function createCandidateSet(
  userId: string,
  candidates: string[],
  maxLikes: number,
  validForHours: number = 24
): CandidateSet {
  const { root, tree, leaves } = buildMerkleTree(candidates);
  const now = Math.floor(Date.now() / 1000);

  return {
    userId,
    candidates,
    root,
    tree,
    leaves,
    createdAt: now,
    expiresAt: now + validForHours * 3600,
  };
}

/**
 * Get proof for submitting a like to a specific candidate
 */
export function getLikeProof(
  candidateSet: CandidateSet,
  targetAddress: string
): string[] {
  if (!candidateSet.candidates.includes(targetAddress)) {
    throw new Error('Target not in candidate set');
  }

  return getMerkleProof(targetAddress, candidateSet.tree, candidateSet.leaves);
}

// ============ EIP-712 SIGNING ============

export const EIP712_DOMAIN = {
  name: 'NoirDate',
  version: '2',
};

export const LIKE_AUTH_TYPES = {
  LikeAuthorization: [
    { name: 'candidateSetRoot', type: 'bytes32' },
    { name: 'maxLikes', type: 'uint8' },
    { name: 'expiry', type: 'uint64' },
    { name: 'nonce', type: 'uint64' },
  ],
};

/**
 * Create EIP-712 message for like authorization
 */
export function createLikeAuthMessage(
  params: LikeAuthorizationParams,
  contractAddress: string,
  chainId: number
): {
  domain: {
    name: string;
    version: string;
    chainId: number;
    verifyingContract: string;
  };
  types: typeof LIKE_AUTH_TYPES;
  value: LikeAuthorizationParams;
} {
  return {
    domain: {
      ...EIP712_DOMAIN,
      chainId,
      verifyingContract: contractAddress,
    },
    types: LIKE_AUTH_TYPES,
    value: params,
  };
}

// ============ EXAMPLE USAGE ============

/*
// Stage 1: Backend generates candidates
const candidates = [
  '0x1234...',
  '0x5678...',
  '0x9abc...',
];

// Create candidate set
const candidateSet = createCandidateSet(
  userWallet,
  candidates,
  5,  // max 5 likes
  24  // valid for 24 hours
);

// User signs authorization
const authParams: LikeAuthorizationParams = {
  candidateSetRoot: candidateSet.root,
  maxLikes: 5,
  expiry: candidateSet.expiresAt,
  nonce: 1n,
};

const message = createLikeAuthMessage(
  authParams,
  datingContractAddress,
  chainId
);

// Sign with wallet (e.g., ethers.js)
const signature = await signer.signTypedData(
  message.domain,
  message.types,
  message.value
);

// Submit authorization to contract
await dating.authorizeLikes(
  authParams.candidateSetRoot,
  authParams.maxLikes,
  authParams.expiry,
  authParams.nonce,
  signature
);

// Later: submit likes with Merkle proofs
const targetAddress = '0x1234...';
const proof = getLikeProof(candidateSet, targetAddress);

await dating.submitLike(
  userWallet,
  targetAddress,
  authParams.nonce,
  proof
);
*/
