import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import { createEffect, createSignal, onCleanup, onMount } from 'solid-js'
import type { Visibility } from '@/components/ui/visibility-select'
import {
  DEALBREAKER_STEP_IDS,
  PROFILE_STEP_IDS,
  getDealbreakerStepIndex,
  getNextDealbreakerStepId,
  getNextProfileStepId,
  getPrevDealbreakerStepId,
  getPrevProfileStepId,
  getProfileStepIndex,
  type DealbreakerStepId,
  type ProfileStepId,
} from '@/lib/onboarding/steps'

export type OnboardingPhase = 'profile' | 'commit' | 'dealbreakers'
export type CommitStatus = 'idle' | 'pending' | 'success' | 'error'

export interface OnboardingData {
  // State machine
  phase: OnboardingPhase
  profileStepId: ProfileStepId
  dealbreakersStepId: DealbreakerStepId
  commitStatus: CommitStatus
  commitError: string | null

  // Legacy numeric steps (kept for migration only)
  currentStep?: number
  dealbreakersStep?: number

  // Step 1: Relationship Status
  relationshipStatus?: string
  relationshipStatusVisibility: Visibility

  // Step 2: Photo
  photoBlob?: Blob

  // Step 3: Name
  name?: string
  starName?: string

  // Step 4: Region
  region?: string

  // Step 5: Gender
  gender?: string
  genderVisibility: Visibility

  // Step 6: Looking For
  lookingFor?: string
  lookingForVisibility: Visibility

  // Step 7: Relationship Structure
  relationshipStructure?: string
  relationshipStructureVisibility: Visibility

  // Step 8: Kids
  kids?: string
  kidsVisibility: Visibility

  // Step 9: Religion
  religion?: string
  religionVisibility: Visibility

  // Step 10: Group Play
  groupPlay?: string
  groupPlayVisibility: Visibility

  // Dealbreakers (after profile commit)
  // Empty = no dealbreaker (show everyone)
  // Has values = dealbreaker active
  seekingGendersGate?: 'open' | 'pick' // Gate: open = all genders, pick = show picker
  seekingGenders?: string[] // Multi-select, empty = show everyone
  seekingAgeMin?: string    // Both empty = show all ages
  seekingAgeMax?: string    // Both filled = age dealbreaker
  seekingRegions?: string[] // Multi-select, empty = anywhere
}

interface OnboardingDB extends DBSchema {
  onboarding: {
    key: 'draft'
    value: OnboardingData
  }
}

const DB_NAME = 'neodate-onboarding'
const DB_VERSION = 1

let dbPromise: Promise<IDBPDatabase<OnboardingDB>> | null = null

function getDB(): Promise<IDBPDatabase<OnboardingDB>> {
  if (!dbPromise) {
    console.log('[OnboardingStore] Opening IDB...')
    dbPromise = openDB<OnboardingDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        console.log('[OnboardingStore] Upgrading DB, creating store')
        db.createObjectStore('onboarding')
      },
    })
  }
  return dbPromise
}

export const defaultOnboardingData: OnboardingData = {
  phase: 'profile',
  profileStepId: PROFILE_STEP_IDS[0],
  dealbreakersStepId: DEALBREAKER_STEP_IDS[0],
  commitStatus: 'idle',
  commitError: null,
  relationshipStatusVisibility: 'public',
  genderVisibility: 'public',
  lookingForVisibility: 'public',
  relationshipStructureVisibility: 'match',
  kidsVisibility: 'match',
  religionVisibility: 'match',
  groupPlayVisibility: 'private',
  // Dealbreakers default to empty (no filter)
}

type StoredOnboardingData = Partial<OnboardingData> & {
  currentStep?: number
  dealbreakersStep?: number
}

const getProfileStepIdFromLegacy = (step?: number): ProfileStepId => {
  if (!step) return PROFILE_STEP_IDS[0]
  return PROFILE_STEP_IDS[Math.min(Math.max(step - 1, 0), PROFILE_STEP_IDS.length - 1)]
}

const getDealbreakerStepIdFromLegacy = (step?: number): DealbreakerStepId => {
  if (!step) return DEALBREAKER_STEP_IDS[0]
  return DEALBREAKER_STEP_IDS[Math.min(Math.max(step - 1, 0), DEALBREAKER_STEP_IDS.length - 1)]
}

export const normalizeOnboardingData = (stored?: StoredOnboardingData | null): OnboardingData => {
  const profileStepId = stored?.profileStepId ?? getProfileStepIdFromLegacy(stored?.currentStep)
  const dealbreakersStepId = stored?.dealbreakersStepId ?? getDealbreakerStepIdFromLegacy(stored?.dealbreakersStep)

  const inferredPhase = (() => {
    if (stored?.phase) return stored.phase
    if (stored?.currentStep && stored.currentStep >= PROFILE_STEP_IDS.length && stored.name) {
      return 'dealbreakers'
    }
    return defaultOnboardingData.phase
  })()

  const merged: OnboardingData = {
    ...defaultOnboardingData,
    ...stored,
    phase: inferredPhase,
    profileStepId,
    dealbreakersStepId,
    commitStatus: stored?.commitStatus ?? defaultOnboardingData.commitStatus,
    commitError: stored?.commitError ?? null,
  }

  if (getProfileStepIndex(merged.profileStepId) < 0) {
    merged.profileStepId = PROFILE_STEP_IDS[0]
  }

  if (getDealbreakerStepIndex(merged.dealbreakersStepId) < 0) {
    merged.dealbreakersStepId = DEALBREAKER_STEP_IDS[0]
  }

  // Prevent skipping ahead if profile steps are incomplete.
  if (merged.phase !== 'profile' && getProfileStepIndex(merged.profileStepId) < PROFILE_STEP_IDS.length - 1) {
    merged.phase = 'profile'
  }

  // If they reached dealbreakers before commitStatus existed, treat as success.
  if (merged.phase === 'dealbreakers' && merged.commitStatus !== 'success') {
    merged.commitStatus = 'success'
  }

  if (merged.commitStatus !== 'error') {
    merged.commitError = null
  }

  return merged
}

export async function loadOnboardingData(): Promise<OnboardingData> {
  try {
    console.log('[OnboardingStore] loadOnboardingData called')
    const db = await getDB()
    console.log('[OnboardingStore] Got DB, fetching data...')
    const data = await db.get('onboarding', 'draft')
    console.log('[OnboardingStore] Got data:', data ? 'exists' : 'null')
    return normalizeOnboardingData(data)
  } catch (error) {
    console.error('[OnboardingStore] Failed to load from IDB:', error)
    return { ...defaultOnboardingData }
  }
}

export async function saveOnboardingData(data: OnboardingData): Promise<void> {
  try {
    const db = await getDB()
    await db.put('onboarding', data, 'draft')
  } catch (error) {
    console.error('[Onboarding] Failed to save to IDB:', error)
  }
}

export async function clearOnboardingData(): Promise<void> {
  try {
    const db = await getDB()
    await db.delete('onboarding', 'draft')
  } catch (error) {
    console.error('[Onboarding] Failed to clear IDB:', error)
  }
}

// Helper to create object URL from stored blob
export function createPhotoUrl(blob: Blob | undefined): string | undefined {
  if (!blob) return undefined
  return URL.createObjectURL(blob)
}

export function createOnboardingStore() {
  const [isLoading, setIsLoading] = createSignal(true)
  const [data, setData] = createSignal<OnboardingData>({ ...defaultOnboardingData })

  onMount(() => {
    loadOnboardingData()
      .then((stored) => {
        setData(stored)
        setIsLoading(false)
      })
      .catch((error) => {
        console.error('[Onboarding] Failed to load:', error)
        setIsLoading(false)
      })
  })

  let saveTimeout: ReturnType<typeof setTimeout> | null = null

  createEffect(() => {
    const current = data()
    if (isLoading()) return

    if (saveTimeout) clearTimeout(saveTimeout)
    saveTimeout = setTimeout(() => {
      void saveOnboardingData(current)
    }, 250)

    onCleanup(() => {
      if (saveTimeout) clearTimeout(saveTimeout)
    })
  })

  const updateData = <K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }))
  }

  const patchData = (patch: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...patch }))
  }

  const setPhase = (phase: OnboardingPhase) => updateData('phase', phase)
  const setCommitStatus = (status: CommitStatus) => updateData('commitStatus', status)
  const setCommitError = (error: string | null) => updateData('commitError', error)

  const setProfileStepId = (id: ProfileStepId) => updateData('profileStepId', id)
  const setDealbreakersStepId = (id: DealbreakerStepId) => updateData('dealbreakersStepId', id)

  const nextProfileStep = () => setProfileStepId(getNextProfileStepId(data().profileStepId))
  const prevProfileStep = () => setProfileStepId(getPrevProfileStepId(data().profileStepId))

  const nextDealbreakerStep = () => setDealbreakersStepId(getNextDealbreakerStepId(data().dealbreakersStepId))
  const prevDealbreakerStep = () => setDealbreakersStepId(getPrevDealbreakerStepId(data().dealbreakersStepId))

  return {
    data,
    isLoading,
    patchData,
    updateData,
    setPhase,
    setCommitStatus,
    setCommitError,
    setProfileStepId,
    setDealbreakersStepId,
    nextProfileStep,
    prevProfileStep,
    nextDealbreakerStep,
    prevDealbreakerStep,
  }
}
