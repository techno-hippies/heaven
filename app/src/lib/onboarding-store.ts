import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { Visibility } from '@/components/ui/visibility-select'

export interface OnboardingData {
  // Step tracking
  currentStep: number

  // Step 1: Relationship Status
  relationshipStatus?: string
  relationshipStatusVisibility: Visibility

  // Step 2: Photo
  photoBlob?: Blob

  // Step 3: Region
  region?: string

  // Step 4: Gender
  gender?: string
  genderVisibility: Visibility

  // Step 5: Looking For
  lookingFor?: string
  lookingForVisibility: Visibility

  // Step 6: Relationship Structure
  relationshipStructure?: string
  relationshipStructureVisibility: Visibility

  // Step 7: Kids
  kids?: string
  kidsVisibility: Visibility

  // Step 8: Religion
  religion?: string
  religionVisibility: Visibility

  // Step 9: Group Play
  groupPlay?: string
  groupPlayVisibility: Visibility
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
  currentStep: 1,
  relationshipStatusVisibility: 'public',
  genderVisibility: 'public',
  lookingForVisibility: 'public',
  relationshipStructureVisibility: 'match',
  kidsVisibility: 'match',
  religionVisibility: 'match',
  groupPlayVisibility: 'private',
}

export async function loadOnboardingData(): Promise<OnboardingData> {
  try {
    console.log('[OnboardingStore] loadOnboardingData called')
    const db = await getDB()
    console.log('[OnboardingStore] Got DB, fetching data...')
    const data = await db.get('onboarding', 'draft')
    console.log('[OnboardingStore] Got data:', data ? 'exists' : 'null')
    return data ?? { ...defaultOnboardingData }
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
