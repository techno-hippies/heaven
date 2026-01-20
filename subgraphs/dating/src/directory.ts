import { Address, BigInt, Bytes } from '@graphprotocol/graph-ts'
import {
  ProfileUpdated as ProfileUpdatedEvent,
  ProfileAttested as ProfileAttestedEvent,
  DirectoryV2,
} from '../generated/DirectoryV2/DirectoryV2'
import { Profile, GlobalStats } from '../generated/schema'

export function handleProfileUpdated(event: ProfileUpdatedEvent): void {
  let id = event.params.user
  let profile = Profile.load(id)

  let isNew = profile === null
  if (profile === null) {
    profile = new Profile(id)
    profile.totalLikesSent = 0
    profile.totalLikesReceived = 0
    profile.totalMatches = 0
    profile.profileInitialized = false
    profile.isVerified = false
    profile.createdAt = event.block.timestamp
    profile.createdTxHash = event.transaction.hash
  }

  // Fetch profile data from contract
  let contract = DirectoryV2.bind(event.address)
  let profileData = contract.try_getProfile(event.params.user)

  if (!profileData.reverted) {
    let data = profileData.value
    profile.animeCid = data.animeCid
    profile.encPhotoCid = data.encPhotoCid
    profile.ageBucket = data.ageBucket
    profile.verifiedLevel = data.verifiedLevel
    profile.claimedAgeBucket = data.claimedAgeBucket
    profile.genderIdentity = data.genderIdentity
    profile.modelVersion = data.modelVersion
  } else {
    // Defaults if call fails
    profile.ageBucket = 0
    profile.verifiedLevel = 0
    profile.claimedAgeBucket = 0
    profile.genderIdentity = 0
    profile.modelVersion = 1
  }

  profile.updatedAt = event.params.timestamp
  profile.save()

  // Update global stats
  if (isNew) {
    let stats = getOrCreateGlobalStats()
    stats.totalProfiles = stats.totalProfiles + 1
    stats.lastActivityAt = event.block.timestamp
    stats.save()
  }
}

export function handleProfileAttested(event: ProfileAttestedEvent): void {
  let id = event.params.user
  let profile = Profile.load(id)

  if (profile === null) {
    // Profile should exist from ProfileUpdated, but create if not
    profile = new Profile(id)
    profile.totalLikesSent = 0
    profile.totalLikesReceived = 0
    profile.totalMatches = 0
    profile.profileInitialized = false
    profile.isVerified = false
    profile.claimedAgeBucket = 0
    profile.genderIdentity = 0
    profile.modelVersion = 1
    profile.updatedAt = event.block.timestamp
    profile.createdAt = event.block.timestamp
    profile.createdTxHash = event.transaction.hash
  }

  profile.ageBucket = event.params.ageBucket
  profile.verifiedLevel = event.params.verifiedLevel
  profile.save()
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
