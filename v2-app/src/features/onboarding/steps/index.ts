/**
 * Step Registry
 *
 * Import all steps here and export them as a registry.
 * Individual steps don't know their order - that's defined in config.
 */

import { NameStep, nameStepMeta } from './NameStep'
import { PhotoStep, photoStepMeta } from './PhotoStep'
import { GenderStep, genderStepMeta } from './GenderStep'
import { AgeStep, ageStepMeta } from './AgeStep'
import { InterestedInStep, interestedInStepMeta } from './InterestedInStep'
import { ConfirmationStep, confirmationStepMeta } from './ConfirmationStep'
// Split steps: About Me + Preferences
import { RelationshipStatusAboutMeStep, relationshipStatusAboutMeStepMeta } from './RelationshipStatusAboutMeStep'
import { RelationshipStatusPrefStep, relationshipStatusPrefStepMeta } from './RelationshipStatusPrefStep'
import { LookingForStep, lookingForStepMeta } from './LookingForStep'
import { RelationshipStructureAboutMeStep, relationshipStructureAboutMeStepMeta } from './RelationshipStructureAboutMeStep'
import { RelationshipStructurePrefStep, relationshipStructurePrefStepMeta } from './RelationshipStructurePrefStep'
import { KidsAboutMeStep, kidsAboutMeStepMeta } from './KidsAboutMeStep'
import { KidsPrefStep, kidsPrefStepMeta } from './KidsPrefStep'
import type { StepRegistry } from '../types'

export const stepRegistry: StepRegistry = {
  // Core profile steps (saved to contracts)
  name: {
    meta: nameStepMeta,
    component: NameStep as any,
  },
  photo: {
    meta: photoStepMeta,
    component: PhotoStep as any,
  },
  gender: {
    meta: genderStepMeta,
    component: GenderStep as any,
  },
  age: {
    meta: ageStepMeta,
    component: AgeStep as any,
  },
  'interested-in': {
    meta: interestedInStepMeta,
    component: InterestedInStep as any,
  },
  confirmation: {
    meta: confirmationStepMeta,
    component: ConfirmationStep as any,
  },
  // Split preference steps (saved to IPFS)
  'relationship-status-about-me': {
    meta: relationshipStatusAboutMeStepMeta,
    component: RelationshipStatusAboutMeStep as any,
  },
  'relationship-status-pref': {
    meta: relationshipStatusPrefStepMeta,
    component: RelationshipStatusPrefStep as any,
  },
  'looking-for': {
    meta: lookingForStepMeta,
    component: LookingForStep as any,
  },
  'relationship-structure-about-me': {
    meta: relationshipStructureAboutMeStepMeta,
    component: RelationshipStructureAboutMeStep as any,
  },
  'relationship-structure-pref': {
    meta: relationshipStructurePrefStepMeta,
    component: RelationshipStructurePrefStep as any,
  },
  'kids-about-me': {
    meta: kidsAboutMeStepMeta,
    component: KidsAboutMeStep as any,
  },
  'kids-pref': {
    meta: kidsPrefStepMeta,
    component: KidsPrefStep as any,
  },
}

// Export individual steps for direct use if needed
export { NameStep, PhotoStep, GenderStep, AgeStep, InterestedInStep, ConfirmationStep }
export { RelationshipStatusAboutMeStep, RelationshipStatusPrefStep }
export { LookingForStep }
export { RelationshipStructureAboutMeStep, RelationshipStructurePrefStep }
export { KidsAboutMeStep, KidsPrefStep }
export { nameStepMeta, photoStepMeta, genderStepMeta, ageStepMeta, interestedInStepMeta, confirmationStepMeta }
export { relationshipStatusAboutMeStepMeta, relationshipStatusPrefStepMeta }
export { lookingForStepMeta }
export { relationshipStructureAboutMeStepMeta, relationshipStructurePrefStepMeta }
export { kidsAboutMeStepMeta, kidsPrefStepMeta }
export { toDesiredMask } from './InterestedInStep'
