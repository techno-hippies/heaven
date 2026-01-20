import { Address, BigInt, Bytes, crypto } from '@graphprotocol/graph-ts'
import {
  ProfileSet as ProfileSetEvent,
  VerifiedAttributesSet as VerifiedAttributesSetEvent,
  LikesAuthorized as LikesAuthorizedEvent,
  LikeSent as LikeSentEvent,
  MatchPending as MatchPendingEvent,
  MatchCreated as MatchCreatedEvent,
  SharedValuesComputed as SharedValuesComputedEvent,
} from '../generated/DatingV3/DatingV3'
import {
  Profile,
  Like,
  Match,
  PendingMatch,
  LikeAuthorization,
  GlobalStats,
} from '../generated/schema'

export function handleProfileSet(event: ProfileSetEvent): void {
  let id = event.params.user
  let profile = Profile.load(id)

  if (profile === null) {
    profile = new Profile(id)
    profile.ageBucket = 0
    profile.verifiedLevel = 0
    profile.claimedAgeBucket = 0
    profile.genderIdentity = 0
    profile.modelVersion = 1
    profile.totalLikesSent = 0
    profile.totalLikesReceived = 0
    profile.totalMatches = 0
    profile.isVerified = false
    profile.updatedAt = event.block.timestamp
    profile.createdAt = event.block.timestamp
    profile.createdTxHash = event.transaction.hash
  }

  profile.profileInitialized = true
  profile.save()

  updateGlobalStats(event.block.timestamp)
}

export function handleVerifiedAttributesSet(event: VerifiedAttributesSetEvent): void {
  let id = event.params.user
  let profile = Profile.load(id)

  if (profile === null) {
    profile = new Profile(id)
    profile.ageBucket = 0
    profile.verifiedLevel = 0
    profile.claimedAgeBucket = 0
    profile.genderIdentity = 0
    profile.modelVersion = 1
    profile.totalLikesSent = 0
    profile.totalLikesReceived = 0
    profile.totalMatches = 0
    profile.profileInitialized = false
    profile.updatedAt = event.block.timestamp
    profile.createdAt = event.block.timestamp
    profile.createdTxHash = event.transaction.hash
  }

  profile.isVerified = true
  profile.save()
}

export function handleLikesAuthorized(event: LikesAuthorizedEvent): void {
  let user = event.params.user
  let nonce = event.params.nonce

  let id = user.toHexString() + '-' + nonce.toString()
  let auth = new LikeAuthorization(id)

  // Ensure profile exists
  ensureProfile(user, event.block.timestamp, event.transaction.hash)

  auth.user = user
  auth.candidateSetRoot = Bytes.empty() // Not in event, would need to read from contract
  auth.maxLikes = event.params.maxLikes
  auth.likesUsed = 0
  auth.expiry = event.params.expiry
  auth.nonce = nonce
  auth.active = true
  auth.timestamp = event.block.timestamp
  auth.transactionHash = event.transaction.hash
  auth.save()
}

export function handleLikeSent(event: LikeSentEvent): void {
  let id = event.transaction.hash.toHexString() + '-' + event.logIndex.toString()

  let like = new Like(id)
  like.from = event.params.from
  like.to = event.params.to
  like.timestamp = event.block.timestamp
  like.blockNumber = event.block.number
  like.transactionHash = event.transaction.hash
  like.save()

  // Ensure profiles exist
  let fromProfile = ensureProfile(event.params.from, event.block.timestamp, event.transaction.hash)
  let toProfile = ensureProfile(event.params.to, event.block.timestamp, event.transaction.hash)

  // Update stats
  fromProfile.totalLikesSent = fromProfile.totalLikesSent + 1
  fromProfile.save()

  toProfile.totalLikesReceived = toProfile.totalLikesReceived + 1
  toProfile.save()

  // Update global stats
  let stats = getOrCreateGlobalStats()
  stats.totalLikes = stats.totalLikes + 1
  stats.lastActivityAt = event.block.timestamp
  stats.save()
}

export function handleMatchPending(event: MatchPendingEvent): void {
  let id = event.params.pairKey

  let pending = new PendingMatch(id)
  pending.user1 = event.params.user1
  pending.user2 = event.params.user2
  pending.mutualOkHandle = event.params.handle
  pending.timestamp = event.block.timestamp
  pending.finalized = false
  pending.transactionHash = event.transaction.hash
  pending.save()

  // Ensure profiles exist
  ensureProfile(event.params.user1, event.block.timestamp, event.transaction.hash)
  ensureProfile(event.params.user2, event.block.timestamp, event.transaction.hash)

  // Update global stats
  let stats = getOrCreateGlobalStats()
  stats.totalPendingMatches = stats.totalPendingMatches + 1
  stats.lastActivityAt = event.block.timestamp
  stats.save()
}

export function handleMatchCreated(event: MatchCreatedEvent): void {
  let user1 = event.params.user1
  let user2 = event.params.user2

  // Sort addresses for consistent ID
  let sortedUser1: Bytes
  let sortedUser2: Bytes
  if (user1.toHexString() < user2.toHexString()) {
    sortedUser1 = user1
    sortedUser2 = user2
  } else {
    sortedUser1 = user2
    sortedUser2 = user1
  }

  let id = sortedUser1.toHexString() + '-' + sortedUser2.toHexString()

  let match = new Match(id)
  match.user1 = sortedUser1
  match.user2 = sortedUser2
  match.timestamp = event.block.timestamp
  match.blockNumber = event.block.number
  match.transactionHash = event.transaction.hash
  match.save()

  // Update profiles
  let profile1 = ensureProfile(user1, event.block.timestamp, event.transaction.hash)
  let profile2 = ensureProfile(user2, event.block.timestamp, event.transaction.hash)

  profile1.totalMatches = profile1.totalMatches + 1
  profile1.save()

  profile2.totalMatches = profile2.totalMatches + 1
  profile2.save()

  // Mark pending match as finalized (compute pairKey)
  let pairKeyData = new Uint8Array(40)
  let u1Bytes = sortedUser1
  let u2Bytes = sortedUser2
  for (let i = 0; i < 20; i++) {
    pairKeyData[i] = u1Bytes[i]
    pairKeyData[i + 20] = u2Bytes[i]
  }
  let pairKey = Bytes.fromUint8Array(crypto.keccak256(Bytes.fromUint8Array(pairKeyData)))

  let pending = PendingMatch.load(pairKey)
  if (pending !== null) {
    pending.finalized = true
    pending.finalizedAt = event.block.timestamp
    pending.save()
  }

  // Update global stats
  let stats = getOrCreateGlobalStats()
  stats.totalMatches = stats.totalMatches + 1
  if (pending !== null) {
    stats.totalPendingMatches = stats.totalPendingMatches - 1
  }
  stats.lastActivityAt = event.block.timestamp
  stats.save()
}

export function handleSharedValuesComputed(event: SharedValuesComputedEvent): void {
  // This event is emitted alongside MatchCreated
  // Could store additional match metadata if needed
}

function ensureProfile(address: Bytes, timestamp: BigInt, txHash: Bytes): Profile {
  let profile = Profile.load(address)
  if (profile === null) {
    profile = new Profile(address)
    profile.ageBucket = 0
    profile.verifiedLevel = 0
    profile.claimedAgeBucket = 0
    profile.genderIdentity = 0
    profile.modelVersion = 1
    profile.totalLikesSent = 0
    profile.totalLikesReceived = 0
    profile.totalMatches = 0
    profile.profileInitialized = false
    profile.isVerified = false
    profile.updatedAt = timestamp
    profile.createdAt = timestamp
    profile.createdTxHash = txHash
    profile.save()
  }
  return profile
}

function getOrCreateGlobalStats(): GlobalStats {
  let stats = GlobalStats.load('global')
  if (stats === null) {
    stats = new GlobalStats('global')
    stats.totalProfiles = 0
    stats.totalLikes = 0
    stats.totalMatches = 0
    stats.totalPendingMatches = 0
  }
  return stats
}

function updateGlobalStats(timestamp: BigInt): void {
  let stats = getOrCreateGlobalStats()
  stats.lastActivityAt = timestamp
  stats.save()
}
