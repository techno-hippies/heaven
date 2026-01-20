import { BigInt, Bytes, log } from "@graphprotocol/graph-ts";
import { BatchCommitted } from "../generated/ScrobbleLogV2/ScrobbleLogV2";
import { User, ScrobbleBatch, GlobalStats } from "./entities";

// Helper to load or create global stats
function loadOrCreateGlobalStats(): GlobalStats {
  let stats = GlobalStats.load("global");
  if (stats == null) {
    stats = new GlobalStats("global");
    stats.totalBatches = 0;
    stats.totalTracks = 0;
    stats.totalUsers = 0;
    stats.lastBatchAt = null;
  }
  return stats;
}

// Helper to load or create user
function loadOrCreateUser(address: Bytes): User {
  let user = User.load(address);
  if (user == null) {
    user = new User(address);
    user.totalBatches = 0;
    user.totalTracks = 0;
    user.firstBatchAt = null;
    user.lastBatchAt = null;

    // Increment global user count
    let stats = loadOrCreateGlobalStats();
    stats.totalUsers = stats.totalUsers + 1;
    stats.save();
  }
  return user;
}

export function handleBatchCommitted(event: BatchCommitted): void {
  let batchId = event.transaction.hash.toHexString() + "-" + event.logIndex.toString();
  let batch = new ScrobbleBatch(batchId);

  // Load or create user
  let userAddress = event.params.user;
  let user = loadOrCreateUser(userAddress);

  // Parse CID from bytes (UTF-8 encoded string of the IPFS CID)
  let cidString = event.params.cid.toString();

  // Convert count to i32 (safe for reasonable batch sizes < 2^31)
  let countI32 = event.params.count.toI32();

  // Set batch fields from event params
  batch.user = userAddress;
  batch.cid = cidString;
  batch.cidHash = event.params.cidHash;
  batch.startTs = event.params.startTs;
  batch.endTs = event.params.endTs;
  batch.count = countI32;
  batch.nonce = event.params.nonce;
  batch.ipfsLoaded = false;
  batch.blockNumber = event.block.number;
  batch.blockTimestamp = event.block.timestamp;
  batch.transactionHash = event.transaction.hash;

  // Update user stats
  user.totalBatches = user.totalBatches + 1;
  user.totalTracks = user.totalTracks + countI32;
  // Check if firstBatchAt needs to be set
  let firstBatch = user.firstBatchAt;
  if (firstBatch === null) {
    user.firstBatchAt = event.block.timestamp;
  }
  user.lastBatchAt = event.block.timestamp;
  user.save();

  // Update global stats
  let stats = loadOrCreateGlobalStats();
  stats.totalBatches = stats.totalBatches + 1;
  stats.totalTracks = stats.totalTracks + countI32;
  stats.lastBatchAt = event.block.timestamp;
  stats.save();

  // Log the CID for now - IPFS fetching can be added later
  log.info("BatchCommitted: user={} cid={} count={}", [
    userAddress.toHexString(),
    cidString,
    countI32.toString()
  ]);

  batch.save();
}
