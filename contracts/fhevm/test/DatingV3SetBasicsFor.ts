import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm, deployments } from "hardhat";
import { DatingV3 } from "../types";
import { expect } from "chai";

/**
 * Test DatingV3.setBasicsFor() with real FHE encryption
 *
 * This test:
 * 1. Encrypts values using the Zama fhevm plugin
 * 2. Signs EIP-712 authorization as the user
 * 3. Calls setBasicsFor() as the sponsor
 * 4. Verifies profile was initialized
 */

// Gender constants
const G_WOMAN = 2;

// Desired mask bits
const MASK_CIS_WOMEN = 0x0004;
const MASK_TRANS_WOMEN = 0x0008;
const MASK_ALL_WOMEN = MASK_CIS_WOMEN | MASK_TRANS_WOMEN;

// EIP-712 types (must match contract)
const EIP712_DOMAIN = {
  name: "Heaven",
  version: "3",
};

const SET_BASICS_TYPES = {
  SetBasics: [
    { name: "user", type: "address" },
    { name: "dataHash", type: "bytes32" },
    { name: "deadline", type: "uint64" },
    { name: "nonce", type: "uint64" },
  ],
};

describe("DatingV3 setBasicsFor", function () {
  let deployer: HardhatEthersSigner;
  let user: HardhatEthersSigner;
  let sponsor: HardhatEthersSigner;
  let datingContract: DatingV3;
  let contractAddress: string;

  before(async function () {
    if (fhevm.isMock) {
      console.warn("This test requires Sepolia testnet (real FHE), skipping in mock mode");
      this.skip();
    }

    const signers = await ethers.getSigners();
    deployer = signers[0];
    user = signers[1] || deployer; // Use second signer as user, or deployer if only one
    sponsor = deployer; // Sponsor is deployer for this test

    // Deploy fresh contract for testing
    console.log("Deploying DatingV3...");
    const DatingV3Factory = await ethers.getContractFactory("DatingV3");
    datingContract = await DatingV3Factory.deploy(
      deployer.address, // admin
      deployer.address, // directory (not used in this test)
      deployer.address, // oracle
      sponsor.address   // relayer (also setBasicsSponsor by default)
    );
    await datingContract.waitForDeployment();
    contractAddress = await datingContract.getAddress();

    console.log(`DatingV3 deployed to: ${contractAddress}`);
    console.log(`  admin/sponsor: ${deployer.address}`);
    console.log(`  user: ${user.address}`);
  });

  it("should set profile via setBasicsFor with real FHE values", async function () {
    this.timeout(120000); // 2 minutes for FHE operations

    const age = 25;
    const genderId = G_WOMAN;
    const desiredMask = MASK_ALL_WOMEN;
    const shareAge = true;
    const shareGender = true;

    console.log("\n1. Encrypting values with Zama FHE...");

    // Create encrypted input for user
    const encryptedInput = await fhevm
      .createEncryptedInput(contractAddress, user.address)
      .add8(age)           // euint8 for age
      .add8(genderId)      // euint8 for genderId
      .add16(desiredMask)  // euint16 for desiredMask
      .addBool(shareAge)   // ebool for shareAge
      .addBool(shareGender) // ebool for shareGender
      .encrypt();

    const handles = encryptedInput.handles;
    const inputProof = encryptedInput.inputProof;

    console.log(`   encAge handle: ${ethers.hexlify(handles[0])}`);
    console.log(`   encGenderId handle: ${ethers.hexlify(handles[1])}`);
    console.log(`   encDesiredMask handle: ${ethers.hexlify(handles[2])}`);
    console.log(`   encShareAge handle: ${ethers.hexlify(handles[3])}`);
    console.log(`   encShareGender handle: ${ethers.hexlify(handles[4])}`);
    console.log(`   inputProof length: ${inputProof.length} bytes`);

    console.log("\n2. Building EIP-712 signature...");

    // Get user's current nonce
    const nonce = await datingContract.setBasicsNonce(user.address);
    console.log(`   User nonce: ${nonce}`);

    // Deadline: 5 minutes from now
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 300);
    console.log(`   Deadline: ${deadline}`);

    // Build data hash (must match contract)
    // keccak256(abi.encode(claimedAge, genderId, desiredMask, shareAge, shareGender, keccak256(proof)))
    const proofHash = ethers.keccak256(inputProof);
    const dataHash = ethers.keccak256(
      ethers.AbiCoder.defaultAbiCoder().encode(
        ["bytes32", "bytes32", "bytes32", "bytes32", "bytes32", "bytes32"],
        [handles[0], handles[1], handles[2], handles[3], handles[4], proofHash]
      )
    );
    console.log(`   Data hash: ${dataHash}`);

    // Build EIP-712 domain
    const domain = {
      name: EIP712_DOMAIN.name,
      version: EIP712_DOMAIN.version,
      chainId: (await ethers.provider.getNetwork()).chainId,
      verifyingContract: contractAddress,
    };

    // Build message
    const message = {
      user: user.address,
      dataHash: dataHash,
      deadline: deadline,
      nonce: nonce,
    };

    // Sign with user's key
    const userSignature = await user.signTypedData(domain, SET_BASICS_TYPES, message);
    console.log(`   User signature: ${userSignature.slice(0, 66)}...`);

    console.log("\n3. Calling setBasicsFor as sponsor...");

    // Verify sponsor is setBasicsSponsor
    const currentSponsor = await datingContract.setBasicsSponsor();
    expect(currentSponsor).to.equal(sponsor.address, "Sponsor mismatch");

    // Check profile not initialized yet
    const initializedBefore = await datingContract.profileInitialized(user.address);
    expect(initializedBefore).to.be.false;

    // Call setBasicsFor
    const tx = await datingContract.connect(sponsor).setBasicsFor(
      user.address,
      handles[0],  // claimedAge
      handles[1],  // genderId
      handles[2],  // desiredMask
      handles[3],  // shareAge
      handles[4],  // shareGender
      inputProof,
      deadline,
      userSignature
    );

    console.log(`   TX hash: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`   Gas used: ${receipt?.gasUsed}`);

    console.log("\n4. Verifying results...");

    // Check profile is now initialized
    const initializedAfter = await datingContract.profileInitialized(user.address);
    expect(initializedAfter).to.be.true;
    console.log(`   profileInitialized[user]: ${initializedAfter} ✅`);

    // Check nonce incremented
    const newNonce = await datingContract.setBasicsNonce(user.address);
    expect(newNonce).to.equal(nonce + 1n);
    console.log(`   nonce incremented: ${nonce} -> ${newNonce} ✅`);

    // Check ProfileSet event
    const events = receipt?.logs.filter(
      (log) => log.topics[0] === datingContract.interface.getEvent("ProfileSet")?.topicHash
    );
    expect(events?.length).to.be.greaterThan(0);
    console.log(`   ProfileSet event emitted ✅`);

    console.log("\n✅ setBasicsFor with real FHE values succeeded!");
  });

  it("should reject expired signatures", async function () {
    this.timeout(60000);

    // Encrypt minimal values
    const encryptedInput = await fhevm
      .createEncryptedInput(contractAddress, user.address)
      .add8(30)
      .add8(1)
      .add16(0x001F)
      .addBool(true)
      .addBool(true)
      .encrypt();

    const handles = encryptedInput.handles;
    const inputProof = encryptedInput.inputProof;

    // Expired deadline (in the past)
    const expiredDeadline = BigInt(Math.floor(Date.now() / 1000) - 100);
    const nonce = await datingContract.setBasicsNonce(user.address);

    const proofHash = ethers.keccak256(inputProof);
    const dataHash = ethers.keccak256(
      ethers.AbiCoder.defaultAbiCoder().encode(
        ["bytes32", "bytes32", "bytes32", "bytes32", "bytes32", "bytes32"],
        [handles[0], handles[1], handles[2], handles[3], handles[4], proofHash]
      )
    );

    const domain = {
      name: EIP712_DOMAIN.name,
      version: EIP712_DOMAIN.version,
      chainId: (await ethers.provider.getNetwork()).chainId,
      verifyingContract: contractAddress,
    };

    const message = {
      user: user.address,
      dataHash: dataHash,
      deadline: expiredDeadline,
      nonce: nonce,
    };

    const userSignature = await user.signTypedData(domain, SET_BASICS_TYPES, message);

    await expect(
      datingContract.connect(sponsor).setBasicsFor(
        user.address,
        handles[0],
        handles[1],
        handles[2],
        handles[3],
        handles[4],
        inputProof,
        expiredDeadline,
        userSignature
      )
    ).to.be.revertedWith("Signature expired");

    console.log("✅ Expired signature correctly rejected");
  });

  it("should reject wrong signer", async function () {
    this.timeout(60000);

    const encryptedInput = await fhevm
      .createEncryptedInput(contractAddress, user.address)
      .add8(30)
      .add8(1)
      .add16(0x001F)
      .addBool(true)
      .addBool(true)
      .encrypt();

    const handles = encryptedInput.handles;
    const inputProof = encryptedInput.inputProof;

    const deadline = BigInt(Math.floor(Date.now() / 1000) + 300);
    const nonce = await datingContract.setBasicsNonce(user.address);

    const proofHash = ethers.keccak256(inputProof);
    const dataHash = ethers.keccak256(
      ethers.AbiCoder.defaultAbiCoder().encode(
        ["bytes32", "bytes32", "bytes32", "bytes32", "bytes32", "bytes32"],
        [handles[0], handles[1], handles[2], handles[3], handles[4], proofHash]
      )
    );

    const domain = {
      name: EIP712_DOMAIN.name,
      version: EIP712_DOMAIN.version,
      chainId: (await ethers.provider.getNetwork()).chainId,
      verifyingContract: contractAddress,
    };

    const message = {
      user: user.address,
      dataHash: dataHash,
      deadline: deadline,
      nonce: nonce,
    };

    // Sign with WRONG signer (sponsor instead of user)
    const wrongSignature = await sponsor.signTypedData(domain, SET_BASICS_TYPES, message);

    await expect(
      datingContract.connect(sponsor).setBasicsFor(
        user.address,
        handles[0],
        handles[1],
        handles[2],
        handles[3],
        handles[4],
        inputProof,
        deadline,
        wrongSignature
      )
    ).to.be.revertedWith("Invalid signature");

    console.log("✅ Wrong signer correctly rejected");
  });

  it("should reject non-sponsor caller", async function () {
    this.timeout(60000);

    // Skip if we only have one signer
    const signers = await ethers.getSigners();
    if (signers.length < 2) {
      console.log("Skipping: need multiple signers");
      this.skip();
    }

    const nonSponsor = signers[1];

    const encryptedInput = await fhevm
      .createEncryptedInput(contractAddress, user.address)
      .add8(30)
      .add8(1)
      .add16(0x001F)
      .addBool(true)
      .addBool(true)
      .encrypt();

    const handles = encryptedInput.handles;
    const inputProof = encryptedInput.inputProof;

    const deadline = BigInt(Math.floor(Date.now() / 1000) + 300);
    const nonce = await datingContract.setBasicsNonce(user.address);

    const proofHash = ethers.keccak256(inputProof);
    const dataHash = ethers.keccak256(
      ethers.AbiCoder.defaultAbiCoder().encode(
        ["bytes32", "bytes32", "bytes32", "bytes32", "bytes32", "bytes32"],
        [handles[0], handles[1], handles[2], handles[3], handles[4], proofHash]
      )
    );

    const domain = {
      name: EIP712_DOMAIN.name,
      version: EIP712_DOMAIN.version,
      chainId: (await ethers.provider.getNetwork()).chainId,
      verifyingContract: contractAddress,
    };

    const message = {
      user: user.address,
      dataHash: dataHash,
      deadline: deadline,
      nonce: nonce,
    };

    const userSignature = await user.signTypedData(domain, SET_BASICS_TYPES, message);

    // Call from non-sponsor
    await expect(
      datingContract.connect(nonSponsor).setBasicsFor(
        user.address,
        handles[0],
        handles[1],
        handles[2],
        handles[3],
        handles[4],
        inputProof,
        deadline,
        userSignature
      )
    ).to.be.revertedWith("Only setBasics sponsor");

    console.log("✅ Non-sponsor caller correctly rejected");
  });
});
