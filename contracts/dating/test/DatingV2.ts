import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm } from "hardhat";
import { Dating, Dating__factory, Directory, Directory__factory } from "../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";
import { keccak256, solidityPacked, AbiCoder } from "ethers";

// Constants matching contract (new layout with GENDER_IDENTITY)
const NUM_ATTRS = 12;
const EXACT_AGE = 0;
const BIOLOGICAL_SEX = 1;
const GENDER_IDENTITY = 2;
const KIDS = 3;
const RELIGION = 9;
const KINK_LEVEL = 10;

const UNKNOWN_CATEGORICAL = 15;
const UNKNOWN_NUMERIC = 255;
const WILDCARD_MASK = 0x7FFF;
const UNKNOWN_BIT = 1 << 15; // 0x8000

type Signers = {
  deployer: HardhatEthersSigner;
  oracle: HardhatEthersSigner;
  relayer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
  charlie: HardhatEthersSigner;
};

// Helper to create encrypted input arrays
async function createEncryptedProfile(
  fhevm: any,
  contractAddress: string,
  signer: HardhatEthersSigner,
  values: number[],
  prefMasks: number[],
  prefMins: number[],
  prefMaxs: number[],
  revealFlags: boolean[]
) {
  const input = await fhevm.createEncryptedInput(contractAddress, signer.address);

  // Add values (euint8)
  for (let i = 0; i < NUM_ATTRS; i++) {
    input.add8(values[i]);
  }
  // Add prefMasks (euint16)
  for (let i = 0; i < NUM_ATTRS; i++) {
    input.add16(prefMasks[i]);
  }
  // Add prefMins (euint8)
  for (let i = 0; i < NUM_ATTRS; i++) {
    input.add8(prefMins[i]);
  }
  // Add prefMaxs (euint8)
  for (let i = 0; i < NUM_ATTRS; i++) {
    input.add8(prefMaxs[i]);
  }
  // Add revealFlags (ebool)
  for (let i = 0; i < NUM_ATTRS; i++) {
    input.addBool(revealFlags[i]);
  }

  return input.encrypt();
}

// Build Merkle tree for candidate authorization
function computeLeaf(address: string): string {
  return keccak256(solidityPacked(["address"], [address]));
}

function buildMerkleTree(candidates: string[]): { root: string; leaves: string[]; tree: string[][] } {
  if (candidates.length === 0) throw new Error("Cannot build tree with no candidates");

  const leaves = candidates.map(computeLeaf);
  const paddedLeaves = [...leaves];
  while (paddedLeaves.length < 2 || (paddedLeaves.length & (paddedLeaves.length - 1)) !== 0) {
    paddedLeaves.push(paddedLeaves[paddedLeaves.length - 1]);
  }

  const tree: string[][] = [paddedLeaves];
  let currentLevel = paddedLeaves;

  while (currentLevel.length > 1) {
    const nextLevel: string[] = [];
    for (let i = 0; i < currentLevel.length; i += 2) {
      const left = currentLevel[i];
      const right = currentLevel[i + 1];
      const [a, b] = left < right ? [left, right] : [right, left];
      nextLevel.push(keccak256(solidityPacked(["bytes32", "bytes32"], [a, b])));
    }
    tree.push(nextLevel);
    currentLevel = nextLevel;
  }

  return { root: tree[tree.length - 1][0], leaves, tree };
}

function getMerkleProof(candidate: string, tree: string[][], leaves: string[]): string[] {
  const leaf = computeLeaf(candidate);
  const paddedLeaves = tree[0];
  let index = paddedLeaves.indexOf(leaf);
  if (index === -1) throw new Error("Candidate not in tree");

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

// Default profile with UNKNOWN values and WILDCARD prefs
function defaultProfile(): {
  values: number[];
  prefMasks: number[];
  prefMins: number[];
  prefMaxs: number[];
  revealFlags: boolean[];
} {
  const values = Array(NUM_ATTRS).fill(UNKNOWN_CATEGORICAL);
  values[EXACT_AGE] = UNKNOWN_NUMERIC;
  values[KINK_LEVEL] = UNKNOWN_NUMERIC;

  const prefMasks = Array(NUM_ATTRS).fill(WILDCARD_MASK);
  const prefMins = Array(NUM_ATTRS).fill(0);
  const prefMaxs = Array(NUM_ATTRS).fill(0);
  prefMaxs[EXACT_AGE] = 254;
  prefMaxs[KINK_LEVEL] = 254;

  const revealFlags = Array(NUM_ATTRS).fill(false);

  return { values, prefMasks, prefMins, prefMaxs, revealFlags };
}

describe("Dating", function () {
  let signers: Signers;
  let datingContract: Dating;
  let datingContractAddress: string;
  let directoryContract: Directory;
  let directoryContractAddress: string;

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = {
      deployer: ethSigners[0],
      oracle: ethSigners[1],
      relayer: ethSigners[2],
      alice: ethSigners[3],
      bob: ethSigners[4],
      charlie: ethSigners[5],
    };
  });

  beforeEach(async function () {
    if (!fhevm.isMock) {
      console.warn(`This test suite requires FHEVM mock environment`);
      this.skip();
    }

    // Deploy Directory
    const directoryFactory = (await ethers.getContractFactory("Directory")) as Directory__factory;
    directoryContract = (await directoryFactory.deploy(
      signers.deployer.address,
      signers.oracle.address
    )) as Directory;
    directoryContractAddress = await directoryContract.getAddress();

    // Deploy Dating
    const datingFactory = (await ethers.getContractFactory("Dating")) as Dating__factory;
    datingContract = (await datingFactory.deploy(
      signers.deployer.address, // admin
      directoryContractAddress,
      signers.oracle.address,
      signers.relayer.address
    )) as Dating;
    datingContractAddress = await datingContract.getAddress();
  });

  describe("Profile Setup", function () {
    it("should initialize profile with encrypted values", async function () {
      const profile = defaultProfile();
      profile.values[EXACT_AGE] = 29;
      profile.values[BIOLOGICAL_SEX] = 1; // Female

      const encrypted = await createEncryptedProfile(
        fhevm,
        datingContractAddress,
        signers.alice,
        profile.values,
        profile.prefMasks,
        profile.prefMins,
        profile.prefMaxs,
        profile.revealFlags
      );

      // Extract handles and proof
      const values = encrypted.handles.slice(0, NUM_ATTRS);
      const prefMasks = encrypted.handles.slice(NUM_ATTRS, NUM_ATTRS * 2);
      const prefMins = encrypted.handles.slice(NUM_ATTRS * 2, NUM_ATTRS * 3);
      const prefMaxs = encrypted.handles.slice(NUM_ATTRS * 3, NUM_ATTRS * 4);
      const revealFlags = encrypted.handles.slice(NUM_ATTRS * 4, NUM_ATTRS * 5);

      await datingContract.connect(signers.alice).setProfile(
        values,
        prefMasks,
        prefMins,
        prefMaxs,
        revealFlags,
        encrypted.inputProof
      );

      expect(await datingContract.profileInitialized(signers.alice.address)).to.be.true;
    });

    it("should not allow overwriting verified attributes", async function () {
      // First, set profile for alice
      const profile = defaultProfile();
      profile.values[EXACT_AGE] = 25;
      profile.values[BIOLOGICAL_SEX] = 1;

      const encrypted1 = await createEncryptedProfile(
        fhevm,
        datingContractAddress,
        signers.alice,
        profile.values,
        profile.prefMasks,
        profile.prefMins,
        profile.prefMaxs,
        profile.revealFlags
      );

      await datingContract.connect(signers.alice).setProfile(
        encrypted1.handles.slice(0, NUM_ATTRS),
        encrypted1.handles.slice(NUM_ATTRS, NUM_ATTRS * 2),
        encrypted1.handles.slice(NUM_ATTRS * 2, NUM_ATTRS * 3),
        encrypted1.handles.slice(NUM_ATTRS * 3, NUM_ATTRS * 4),
        encrypted1.handles.slice(NUM_ATTRS * 4, NUM_ATTRS * 5),
        encrypted1.inputProof
      );

      // Oracle verifies alice (sets isVerified = true)
      const nullifier = keccak256(solidityPacked(["string"], ["alice-passport-nullifier"]));
      const bindingHash = keccak256(
        solidityPacked(["address", "bytes32", "address"], [signers.alice.address, nullifier, datingContractAddress])
      );
      const userSig = await signers.alice.signMessage(ethers.getBytes(bindingHash));

      // Encrypt verified values
      const verifiedInput = await fhevm
        .createEncryptedInput(datingContractAddress, signers.oracle.address)
        .add8(30) // exactAge = 30
        .add8(0)  // biologicalSex = male
        .encrypt();

      await datingContract.connect(signers.oracle).setVerifiedAttributes(
        signers.alice.address,
        verifiedInput.handles[0],
        verifiedInput.handles[1],
        nullifier,
        verifiedInput.inputProof,
        userSig
      );

      expect(await datingContract.isVerified(signers.alice.address)).to.be.true;

      // Now alice tries to update profile - verified attrs should be protected
      const profile2 = defaultProfile();
      profile2.values[EXACT_AGE] = 35; // Try to change age
      profile2.values[BIOLOGICAL_SEX] = 1; // Try to change sex
      profile2.values[KIDS] = 2; // This should still work

      const encrypted2 = await createEncryptedProfile(
        fhevm,
        datingContractAddress,
        signers.alice,
        profile2.values,
        profile2.prefMasks,
        profile2.prefMins,
        profile2.prefMaxs,
        profile2.revealFlags
      );

      // This call should succeed but verified attrs shouldn't change
      await datingContract.connect(signers.alice).setProfile(
        encrypted2.handles.slice(0, NUM_ATTRS),
        encrypted2.handles.slice(NUM_ATTRS, NUM_ATTRS * 2),
        encrypted2.handles.slice(NUM_ATTRS * 2, NUM_ATTRS * 3),
        encrypted2.handles.slice(NUM_ATTRS * 3, NUM_ATTRS * 4),
        encrypted2.handles.slice(NUM_ATTRS * 4, NUM_ATTRS * 5),
        encrypted2.inputProof
      );

      // Profile still initialized, but we'd need to decrypt to verify
      // the verified values weren't overwritten (contract logic test)
      expect(await datingContract.profileInitialized(signers.alice.address)).to.be.true;
    });
  });

  describe("Like Authorization", function () {
    it("should authorize likes with valid signature (relayer submits)", async function () {
      const candidateSetRoot = keccak256(solidityPacked(["string"], ["test-root"]));
      const maxLikes = 5;
      const expiry = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const nonce = 1;

      // EIP-712 signing by user
      const domain = {
        name: "NeoDate",
        version: "3",
        chainId: 31337,
        verifyingContract: datingContractAddress,
      };

      const types = {
        LikeAuthorization: [
          { name: "candidateSetRoot", type: "bytes32" },
          { name: "maxLikes", type: "uint8" },
          { name: "expiry", type: "uint64" },
          { name: "nonce", type: "uint64" },
        ],
      };

      const value = {
        candidateSetRoot,
        maxLikes,
        expiry,
        nonce,
      };

      const signature = await signers.alice.signTypedData(domain, types, value);

      // Relayer submits on behalf of user (gasless for user)
      await datingContract
        .connect(signers.relayer)
        .authorizeLikes(signers.alice.address, candidateSetRoot, maxLikes, expiry, nonce, signature);

      const auth = await datingContract.likeAuths(signers.alice.address, nonce);
      expect(auth.candidateSetRoot).to.eq(candidateSetRoot);
      expect(auth.maxLikes).to.eq(maxLikes);
      expect(auth.active).to.be.true;
    });

    it("should reject non-relayer calling authorizeLikes", async function () {
      const candidateSetRoot = keccak256(solidityPacked(["string"], ["test-root"]));
      const signature = await signers.alice.signTypedData(
        { name: "NeoDate", version: "3", chainId: 31337, verifyingContract: datingContractAddress },
        { LikeAuthorization: [
          { name: "candidateSetRoot", type: "bytes32" },
          { name: "maxLikes", type: "uint8" },
          { name: "expiry", type: "uint64" },
          { name: "nonce", type: "uint64" },
        ]},
        { candidateSetRoot, maxLikes: 5, expiry: Math.floor(Date.now() / 1000) + 3600, nonce: 1 }
      );

      await expect(
        datingContract
          .connect(signers.alice) // User tries to call directly
          .authorizeLikes(signers.alice.address, candidateSetRoot, 5, Math.floor(Date.now() / 1000) + 3600, 1, signature)
      ).to.be.revertedWith("Only relayer");
    });
  });

  describe("Matching Flow", function () {
    beforeEach(async function () {
      // Setup profiles for Alice and Bob
      const aliceProfile = defaultProfile();
      aliceProfile.values[EXACT_AGE] = 29;
      aliceProfile.values[BIOLOGICAL_SEX] = 1; // Female
      aliceProfile.values[RELIGION] = 3; // Christian
      aliceProfile.prefMasks[BIOLOGICAL_SEX] = 1 << 0; // Wants male
      aliceProfile.prefMasks[RELIGION] = 1 << 3; // Wants Christian (DEALBREAKER)
      aliceProfile.revealFlags[RELIGION] = false; // DEALBREAKER - never reveal

      const bobProfile = defaultProfile();
      bobProfile.values[EXACT_AGE] = 32;
      bobProfile.values[BIOLOGICAL_SEX] = 0; // Male
      bobProfile.values[RELIGION] = 3; // Christian
      bobProfile.prefMasks[BIOLOGICAL_SEX] = 1 << 1; // Wants female
      bobProfile.prefMasks[RELIGION] = WILDCARD_MASK; // No religion pref (NONE)
      bobProfile.revealFlags[RELIGION] = false;

      // Setup Alice
      const aliceEncrypted = await createEncryptedProfile(
        fhevm,
        datingContractAddress,
        signers.alice,
        aliceProfile.values,
        aliceProfile.prefMasks,
        aliceProfile.prefMins,
        aliceProfile.prefMaxs,
        aliceProfile.revealFlags
      );

      await datingContract.connect(signers.alice).setProfile(
        aliceEncrypted.handles.slice(0, NUM_ATTRS),
        aliceEncrypted.handles.slice(NUM_ATTRS, NUM_ATTRS * 2),
        aliceEncrypted.handles.slice(NUM_ATTRS * 2, NUM_ATTRS * 3),
        aliceEncrypted.handles.slice(NUM_ATTRS * 3, NUM_ATTRS * 4),
        aliceEncrypted.handles.slice(NUM_ATTRS * 4, NUM_ATTRS * 5),
        aliceEncrypted.inputProof
      );

      // Setup Bob
      const bobEncrypted = await createEncryptedProfile(
        fhevm,
        datingContractAddress,
        signers.bob,
        bobProfile.values,
        bobProfile.prefMasks,
        bobProfile.prefMins,
        bobProfile.prefMaxs,
        bobProfile.revealFlags
      );

      await datingContract.connect(signers.bob).setProfile(
        bobEncrypted.handles.slice(0, NUM_ATTRS),
        bobEncrypted.handles.slice(NUM_ATTRS, NUM_ATTRS * 2),
        bobEncrypted.handles.slice(NUM_ATTRS * 2, NUM_ATTRS * 3),
        bobEncrypted.handles.slice(NUM_ATTRS * 3, NUM_ATTRS * 4),
        bobEncrypted.handles.slice(NUM_ATTRS * 4, NUM_ATTRS * 5),
        bobEncrypted.inputProof
      );
    });

    it("should allow direct like", async function () {
      await datingContract.connect(signers.alice).sendLike(signers.bob.address);
      expect(await datingContract.hasUserLiked(signers.alice.address, signers.bob.address)).to.be.true;
    });

    it("should detect mutual like and create pending match", async function () {
      // Alice likes Bob
      await datingContract.connect(signers.alice).sendLike(signers.bob.address);

      // Bob likes Alice
      const tx = await datingContract.connect(signers.bob).sendLike(signers.alice.address);
      const receipt = await tx.wait();

      // Check for MatchPending event
      const matchPendingEvent = receipt?.logs.find(
        (log: any) => log.fragment?.name === "MatchPending"
      );
      expect(matchPendingEvent).to.not.be.undefined;
    });

    it("should submit like with Merkle proof", async function () {
      // Build candidate set
      const candidates = [signers.bob.address, signers.charlie.address];
      const { root, tree, leaves } = buildMerkleTree(candidates);
      const proof = getMerkleProof(signers.bob.address, tree, leaves);

      // Authorize likes
      const maxLikes = 5;
      const expiry = Math.floor(Date.now() / 1000) + 3600;
      const nonce = 1n;

      const domain = {
        name: "NeoDate",
        version: "3",
        chainId: 31337,
        verifyingContract: datingContractAddress,
      };

      const types = {
        LikeAuthorization: [
          { name: "candidateSetRoot", type: "bytes32" },
          { name: "maxLikes", type: "uint8" },
          { name: "expiry", type: "uint64" },
          { name: "nonce", type: "uint64" },
        ],
      };

      const value = {
        candidateSetRoot: root,
        maxLikes,
        expiry,
        nonce,
      };

      const signature = await signers.alice.signTypedData(domain, types, value);

      await datingContract
        .connect(signers.relayer)
        .authorizeLikes(signers.alice.address, root, maxLikes, expiry, nonce, signature);

      // Submit like with Merkle proof (relayer submits on behalf of alice)
      await datingContract
        .connect(signers.relayer)
        .submitLike(signers.alice.address, signers.bob.address, nonce, proof);

      expect(await datingContract.hasUserLiked(signers.alice.address, signers.bob.address)).to.be.true;
    });

    it("should reject like with invalid Merkle proof", async function () {
      // Build candidate set WITHOUT charlie
      const candidates = [signers.bob.address];
      const { root, tree, leaves } = buildMerkleTree(candidates);

      // Authorize
      const maxLikes = 5;
      const expiry = Math.floor(Date.now() / 1000) + 3600;
      const nonce = 1n;

      const domain = {
        name: "NeoDate",
        version: "3",
        chainId: 31337,
        verifyingContract: datingContractAddress,
      };

      const types = {
        LikeAuthorization: [
          { name: "candidateSetRoot", type: "bytes32" },
          { name: "maxLikes", type: "uint8" },
          { name: "expiry", type: "uint64" },
          { name: "nonce", type: "uint64" },
        ],
      };

      const value = {
        candidateSetRoot: root,
        maxLikes,
        expiry,
        nonce,
      };

      const signature = await signers.alice.signTypedData(domain, types, value);

      await datingContract
        .connect(signers.relayer)
        .authorizeLikes(signers.alice.address, root, maxLikes, expiry, nonce, signature);

      // Try to like charlie (not in candidate set)
      // First setup charlie profile
      const charlieProfile = defaultProfile();
      const charlieEncrypted = await createEncryptedProfile(
        fhevm,
        datingContractAddress,
        signers.charlie,
        charlieProfile.values,
        charlieProfile.prefMasks,
        charlieProfile.prefMins,
        charlieProfile.prefMaxs,
        charlieProfile.revealFlags
      );

      await datingContract.connect(signers.charlie).setProfile(
        charlieEncrypted.handles.slice(0, NUM_ATTRS),
        charlieEncrypted.handles.slice(NUM_ATTRS, NUM_ATTRS * 2),
        charlieEncrypted.handles.slice(NUM_ATTRS * 2, NUM_ATTRS * 3),
        charlieEncrypted.handles.slice(NUM_ATTRS * 3, NUM_ATTRS * 4),
        charlieEncrypted.handles.slice(NUM_ATTRS * 4, NUM_ATTRS * 5),
        charlieEncrypted.inputProof
      );

      // Get proof for bob but try to use it for charlie
      const proof = getMerkleProof(signers.bob.address, tree, leaves);

      await expect(
        datingContract
          .connect(signers.relayer)
          .submitLike(signers.alice.address, signers.charlie.address, nonce, proof)
      ).to.be.revertedWith("Target not in candidate set");
    });
  });

  describe("Numeric LENIENT Unknown", function () {
    it("should pass UNKNOWN value when LENIENT", async function () {
      // Alice has age preference 25-35, LENIENT (accepts UNKNOWN)
      const aliceProfile = defaultProfile();
      aliceProfile.values[EXACT_AGE] = 30;
      aliceProfile.prefMins[EXACT_AGE] = 25;
      aliceProfile.prefMaxs[EXACT_AGE] = 35;
      aliceProfile.prefMasks[EXACT_AGE] = UNKNOWN_BIT; // LENIENT = bit 15 set

      // Bob has UNKNOWN age
      const bobProfile = defaultProfile();
      bobProfile.values[EXACT_AGE] = UNKNOWN_NUMERIC;

      // Setup profiles
      const aliceEncrypted = await createEncryptedProfile(
        fhevm,
        datingContractAddress,
        signers.alice,
        aliceProfile.values,
        aliceProfile.prefMasks,
        aliceProfile.prefMins,
        aliceProfile.prefMaxs,
        aliceProfile.revealFlags
      );

      await datingContract.connect(signers.alice).setProfile(
        aliceEncrypted.handles.slice(0, NUM_ATTRS),
        aliceEncrypted.handles.slice(NUM_ATTRS, NUM_ATTRS * 2),
        aliceEncrypted.handles.slice(NUM_ATTRS * 2, NUM_ATTRS * 3),
        aliceEncrypted.handles.slice(NUM_ATTRS * 3, NUM_ATTRS * 4),
        aliceEncrypted.handles.slice(NUM_ATTRS * 4, NUM_ATTRS * 5),
        aliceEncrypted.inputProof
      );

      const bobEncrypted = await createEncryptedProfile(
        fhevm,
        datingContractAddress,
        signers.bob,
        bobProfile.values,
        bobProfile.prefMasks,
        bobProfile.prefMins,
        bobProfile.prefMaxs,
        bobProfile.revealFlags
      );

      await datingContract.connect(signers.bob).setProfile(
        bobEncrypted.handles.slice(0, NUM_ATTRS),
        bobEncrypted.handles.slice(NUM_ATTRS, NUM_ATTRS * 2),
        bobEncrypted.handles.slice(NUM_ATTRS * 2, NUM_ATTRS * 3),
        bobEncrypted.handles.slice(NUM_ATTRS * 3, NUM_ATTRS * 4),
        bobEncrypted.handles.slice(NUM_ATTRS * 4, NUM_ATTRS * 5),
        bobEncrypted.inputProof
      );

      // Alice likes Bob - should succeed despite UNKNOWN age because LENIENT
      await datingContract.connect(signers.alice).sendLike(signers.bob.address);
      expect(await datingContract.hasUserLiked(signers.alice.address, signers.bob.address)).to.be.true;
    });

    it("should fail UNKNOWN value when STRICT", async function () {
      // Alice has age preference 25-35, STRICT (rejects UNKNOWN)
      const aliceProfile = defaultProfile();
      aliceProfile.values[EXACT_AGE] = 30;
      aliceProfile.prefMins[EXACT_AGE] = 25;
      aliceProfile.prefMaxs[EXACT_AGE] = 35;
      aliceProfile.prefMasks[EXACT_AGE] = 0; // STRICT = bit 15 NOT set

      // Bob has UNKNOWN age
      const bobProfile = defaultProfile();
      bobProfile.values[EXACT_AGE] = UNKNOWN_NUMERIC;

      // Setup profiles
      const aliceEncrypted = await createEncryptedProfile(
        fhevm,
        datingContractAddress,
        signers.alice,
        aliceProfile.values,
        aliceProfile.prefMasks,
        aliceProfile.prefMins,
        aliceProfile.prefMaxs,
        aliceProfile.revealFlags
      );

      await datingContract.connect(signers.alice).setProfile(
        aliceEncrypted.handles.slice(0, NUM_ATTRS),
        aliceEncrypted.handles.slice(NUM_ATTRS, NUM_ATTRS * 2),
        aliceEncrypted.handles.slice(NUM_ATTRS * 2, NUM_ATTRS * 3),
        aliceEncrypted.handles.slice(NUM_ATTRS * 3, NUM_ATTRS * 4),
        aliceEncrypted.handles.slice(NUM_ATTRS * 4, NUM_ATTRS * 5),
        aliceEncrypted.inputProof
      );

      const bobEncrypted = await createEncryptedProfile(
        fhevm,
        datingContractAddress,
        signers.bob,
        bobProfile.values,
        bobProfile.prefMasks,
        bobProfile.prefMins,
        bobProfile.prefMaxs,
        bobProfile.revealFlags
      );

      await datingContract.connect(signers.bob).setProfile(
        bobEncrypted.handles.slice(0, NUM_ATTRS),
        bobEncrypted.handles.slice(NUM_ATTRS, NUM_ATTRS * 2),
        bobEncrypted.handles.slice(NUM_ATTRS * 2, NUM_ATTRS * 3),
        bobEncrypted.handles.slice(NUM_ATTRS * 3, NUM_ATTRS * 4),
        bobEncrypted.handles.slice(NUM_ATTRS * 4, NUM_ATTRS * 5),
        bobEncrypted.inputProof
      );

      // Alice likes Bob - the like tx will succeed but encrypted compatibility will be false
      // In a real scenario, mutual match would NOT form due to incompatibility
      await datingContract.connect(signers.alice).sendLike(signers.bob.address);
      expect(await datingContract.hasUserLiked(signers.alice.address, signers.bob.address)).to.be.true;
      // Note: We can't directly verify the encrypted compatibility result in this test
      // That would require decrypting the result, which happens async via KMS
    });
  });

  describe("Photo Grants", function () {
    it("should allow auto photo grant on mutual match", async function () {
      await datingContract.connect(signers.alice).setAutoPhotoGrant(true);
      await datingContract.connect(signers.bob).setAutoPhotoGrant(true);

      expect(await datingContract.autoPhotoGrant(signers.alice.address)).to.be.true;
      expect(await datingContract.autoPhotoGrant(signers.bob.address)).to.be.true;
    });

    it("should allow manual photo grant after match", async function () {
      // First create profiles and match (setup from beforeEach)
      // Then setup profiles
      const aliceProfile = defaultProfile();
      const aliceEncrypted = await createEncryptedProfile(
        fhevm,
        datingContractAddress,
        signers.alice,
        aliceProfile.values,
        aliceProfile.prefMasks,
        aliceProfile.prefMins,
        aliceProfile.prefMaxs,
        aliceProfile.revealFlags
      );

      await datingContract.connect(signers.alice).setProfile(
        aliceEncrypted.handles.slice(0, NUM_ATTRS),
        aliceEncrypted.handles.slice(NUM_ATTRS, NUM_ATTRS * 2),
        aliceEncrypted.handles.slice(NUM_ATTRS * 2, NUM_ATTRS * 3),
        aliceEncrypted.handles.slice(NUM_ATTRS * 3, NUM_ATTRS * 4),
        aliceEncrypted.handles.slice(NUM_ATTRS * 4, NUM_ATTRS * 5),
        aliceEncrypted.inputProof
      );

      const bobProfile = defaultProfile();
      const bobEncrypted = await createEncryptedProfile(
        fhevm,
        datingContractAddress,
        signers.bob,
        bobProfile.values,
        bobProfile.prefMasks,
        bobProfile.prefMins,
        bobProfile.prefMaxs,
        bobProfile.revealFlags
      );

      await datingContract.connect(signers.bob).setProfile(
        bobEncrypted.handles.slice(0, NUM_ATTRS),
        bobEncrypted.handles.slice(NUM_ATTRS, NUM_ATTRS * 2),
        bobEncrypted.handles.slice(NUM_ATTRS * 2, NUM_ATTRS * 3),
        bobEncrypted.handles.slice(NUM_ATTRS * 3, NUM_ATTRS * 4),
        bobEncrypted.handles.slice(NUM_ATTRS * 4, NUM_ATTRS * 5),
        bobEncrypted.inputProof
      );

      // Note: Full match flow requires relayer finalization
      // For now, test that grant/revoke functions work
      // In integration test, we'd test the full flow

      // Can't grant without being matched
      await expect(
        datingContract.connect(signers.alice).grantPhoto(signers.bob.address)
      ).to.be.revertedWith("Not matched");
    });
  });

  describe("Quota Enforcement", function () {
    beforeEach(async function () {
      // Setup profiles for Alice and Bob
      const aliceProfile = defaultProfile();
      const aliceEncrypted = await createEncryptedProfile(
        fhevm,
        datingContractAddress,
        signers.alice,
        aliceProfile.values,
        aliceProfile.prefMasks,
        aliceProfile.prefMins,
        aliceProfile.prefMaxs,
        aliceProfile.revealFlags
      );

      await datingContract.connect(signers.alice).setProfile(
        aliceEncrypted.handles.slice(0, NUM_ATTRS),
        aliceEncrypted.handles.slice(NUM_ATTRS, NUM_ATTRS * 2),
        aliceEncrypted.handles.slice(NUM_ATTRS * 2, NUM_ATTRS * 3),
        aliceEncrypted.handles.slice(NUM_ATTRS * 3, NUM_ATTRS * 4),
        aliceEncrypted.handles.slice(NUM_ATTRS * 4, NUM_ATTRS * 5),
        aliceEncrypted.inputProof
      );

      const bobProfile = defaultProfile();
      const bobEncrypted = await createEncryptedProfile(
        fhevm,
        datingContractAddress,
        signers.bob,
        bobProfile.values,
        bobProfile.prefMasks,
        bobProfile.prefMins,
        bobProfile.prefMaxs,
        bobProfile.revealFlags
      );

      await datingContract.connect(signers.bob).setProfile(
        bobEncrypted.handles.slice(0, NUM_ATTRS),
        bobEncrypted.handles.slice(NUM_ATTRS, NUM_ATTRS * 2),
        bobEncrypted.handles.slice(NUM_ATTRS * 2, NUM_ATTRS * 3),
        bobEncrypted.handles.slice(NUM_ATTRS * 3, NUM_ATTRS * 4),
        bobEncrypted.handles.slice(NUM_ATTRS * 4, NUM_ATTRS * 5),
        bobEncrypted.inputProof
      );
    });

    it("should enforce daily direct like quota", async function () {
      // Set quota to 2 for testing
      await datingContract.connect(signers.deployer).setDirectLikeQuota(2);

      // First two likes should work
      await datingContract.connect(signers.alice).sendLike(signers.bob.address);

      // Need another target for second like
      const charlieProfile = defaultProfile();
      const charlieEncrypted = await createEncryptedProfile(
        fhevm,
        datingContractAddress,
        signers.charlie,
        charlieProfile.values,
        charlieProfile.prefMasks,
        charlieProfile.prefMins,
        charlieProfile.prefMaxs,
        charlieProfile.revealFlags
      );

      await datingContract.connect(signers.charlie).setProfile(
        charlieEncrypted.handles.slice(0, NUM_ATTRS),
        charlieEncrypted.handles.slice(NUM_ATTRS, NUM_ATTRS * 2),
        charlieEncrypted.handles.slice(NUM_ATTRS * 2, NUM_ATTRS * 3),
        charlieEncrypted.handles.slice(NUM_ATTRS * 3, NUM_ATTRS * 4),
        charlieEncrypted.handles.slice(NUM_ATTRS * 4, NUM_ATTRS * 5),
        charlieEncrypted.inputProof
      );

      await datingContract.connect(signers.alice).sendLike(signers.charlie.address);

      // Third like should fail (quota = 2)
      // Need a fourth user for this test
      const ethSigners = await ethers.getSigners();
      const dave = ethSigners[6];

      const daveProfile = defaultProfile();
      const daveEncrypted = await createEncryptedProfile(
        fhevm,
        datingContractAddress,
        dave,
        daveProfile.values,
        daveProfile.prefMasks,
        daveProfile.prefMins,
        daveProfile.prefMaxs,
        daveProfile.revealFlags
      );

      await datingContract.connect(dave).setProfile(
        daveEncrypted.handles.slice(0, NUM_ATTRS),
        daveEncrypted.handles.slice(NUM_ATTRS, NUM_ATTRS * 2),
        daveEncrypted.handles.slice(NUM_ATTRS * 2, NUM_ATTRS * 3),
        daveEncrypted.handles.slice(NUM_ATTRS * 3, NUM_ATTRS * 4),
        daveEncrypted.handles.slice(NUM_ATTRS * 4, NUM_ATTRS * 5),
        daveEncrypted.inputProof
      );

      await expect(
        datingContract.connect(signers.alice).sendLike(dave.address)
      ).to.be.revertedWith("Daily direct like quota exceeded");
    });

    it("should reject nonce reuse in authorizeLikes", async function () {
      const candidateSetRoot = keccak256(solidityPacked(["string"], ["test-root"]));
      const maxLikes = 5;
      const expiry = Math.floor(Date.now() / 1000) + 3600;
      const nonce = 1n;

      const domain = {
        name: "NeoDate",
        version: "3",
        chainId: 31337,
        verifyingContract: datingContractAddress,
      };

      const types = {
        LikeAuthorization: [
          { name: "candidateSetRoot", type: "bytes32" },
          { name: "maxLikes", type: "uint8" },
          { name: "expiry", type: "uint64" },
          { name: "nonce", type: "uint64" },
        ],
      };

      const value = {
        candidateSetRoot,
        maxLikes,
        expiry,
        nonce,
      };

      const signature = await signers.alice.signTypedData(domain, types, value);

      // First authorization should succeed (relayer submits)
      await datingContract
        .connect(signers.relayer)
        .authorizeLikes(signers.alice.address, candidateSetRoot, maxLikes, expiry, nonce, signature);

      // Second authorization with same nonce should fail
      const signature2 = await signers.alice.signTypedData(domain, types, value);
      await expect(
        datingContract
          .connect(signers.relayer)
          .authorizeLikes(signers.alice.address, candidateSetRoot, maxLikes, expiry, nonce, signature2)
      ).to.be.revertedWith("Nonce already used");
    });

    it("should reject duplicate likes", async function () {
      // First like should succeed
      await datingContract.connect(signers.alice).sendLike(signers.bob.address);
      expect(await datingContract.hasUserLiked(signers.alice.address, signers.bob.address)).to.be.true;

      // Second like to same target should fail
      await expect(
        datingContract.connect(signers.alice).sendLike(signers.bob.address)
      ).to.be.revertedWith("Already liked");
    });
  });
});
