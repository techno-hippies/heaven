/**
 * Step Registry
 *
 * Import all steps here and export them as a registry.
 * Individual steps don't know their order - that's defined in config.
 */

// Profile steps (About Me) - have Visibility toggle
import { NameStep, nameStepMeta } from './profile/NameStep'
import { PhotoStep, photoStepMeta } from './profile/PhotoStep'
import { PrivatePhotosStep, privatePhotosStepMeta } from './profile/PrivatePhotosStep'
import { GenderStep, genderStepMeta } from './profile/GenderStep'
import { AgeStep, ageStepMeta } from './profile/AgeStep'
import { LookingForStep, lookingForStepMeta } from './profile/LookingForStep'
import { RegionStep, regionStepMeta } from './profile/RegionStep'
import { AlsoDatingInStep, alsoDatingInStepMeta } from './profile/AlsoDatingInStep'
import { FamilyPlansStep, familyPlansStepMeta } from './profile/FamilyPlansStep'
import { ReligionStep, religionStepMeta } from './profile/ReligionStep'
import { GroupPlayStep, groupPlayStepMeta } from './profile/GroupPlayStep'
import { RelationshipStatusAboutMeStep, relationshipStatusAboutMeStepMeta } from './profile/RelationshipStatusAboutMeStep'
import { RelationshipStructureAboutMeStep, relationshipStructureAboutMeStepMeta } from './profile/RelationshipStructureAboutMeStep'
import { KidsAboutMeStep, kidsAboutMeStepMeta } from './profile/KidsAboutMeStep'

// Preference steps (What I Want) - have Dealbreaker toggle
import { InterestedInStep, interestedInStepMeta, toDesiredMask } from './preferences/InterestedInStep'
import { SeekingAgeStep, seekingAgeStepMeta } from './preferences/SeekingAgeStep'
import { RelationshipStructurePrefStep, relationshipStructurePrefStepMeta } from './preferences/RelationshipStructurePrefStep'
import { KidsPrefStep, kidsPrefStepMeta } from './preferences/KidsPrefStep'


import type { StepRegistry } from '../types'

export const stepRegistry: StepRegistry = {
  // ============ PROFILE STEPS (About Me) ============
  // These have Visibility toggles (public/match/private)
  name: {
    meta: nameStepMeta,
    component: NameStep as any,
  },
  photo: {
    meta: photoStepMeta,
    component: PhotoStep as any,
  },
  'private-photos': {
    meta: privatePhotosStepMeta,
    component: PrivatePhotosStep as any,
  },
  gender: {
    meta: genderStepMeta,
    component: GenderStep as any,
  },
  age: {
    meta: ageStepMeta,
    component: AgeStep as any,
  },
  'looking-for': {
    meta: lookingForStepMeta,
    component: LookingForStep as any,
  },
  region: {
    meta: regionStepMeta,
    component: RegionStep as any,
  },
  'also-dating-in': {
    meta: alsoDatingInStepMeta,
    component: AlsoDatingInStep as any,
  },
  'relationship-status-about-me': {
    meta: relationshipStatusAboutMeStepMeta,
    component: RelationshipStatusAboutMeStep as any,
  },
  'relationship-structure-about-me': {
    meta: relationshipStructureAboutMeStepMeta,
    component: RelationshipStructureAboutMeStep as any,
  },
  'kids-about-me': {
    meta: kidsAboutMeStepMeta,
    component: KidsAboutMeStep as any,
  },
  'family-plans': {
    meta: familyPlansStepMeta,
    component: FamilyPlansStep as any,
  },
  religion: {
    meta: religionStepMeta,
    component: ReligionStep as any,
  },
  'group-play': {
    meta: groupPlayStepMeta,
    component: GroupPlayStep as any,
  },

  // ============ PREFERENCE STEPS (What I Want) ============
  // These have Dealbreaker toggles
  'interested-in': {
    meta: interestedInStepMeta,
    component: InterestedInStep as any,
  },
  'seeking-age': {
    meta: seekingAgeStepMeta,
    component: SeekingAgeStep as any,
  },
  'relationship-structure-pref': {
    meta: relationshipStructurePrefStepMeta,
    component: RelationshipStructurePrefStep as any,
  },
  'kids-pref': {
    meta: kidsPrefStepMeta,
    component: KidsPrefStep as any,
  },

}

// Export individual steps for direct use if needed
export { NameStep, PhotoStep, PrivatePhotosStep, GenderStep, AgeStep, LookingForStep, RegionStep, AlsoDatingInStep, FamilyPlansStep, ReligionStep, GroupPlayStep }
export { RelationshipStatusAboutMeStep, RelationshipStructureAboutMeStep, KidsAboutMeStep }
export { InterestedInStep, SeekingAgeStep, RelationshipStructurePrefStep, KidsPrefStep }

// Export metadata
export { nameStepMeta, photoStepMeta, privatePhotosStepMeta, genderStepMeta, ageStepMeta, lookingForStepMeta, regionStepMeta, alsoDatingInStepMeta, familyPlansStepMeta, religionStepMeta, groupPlayStepMeta }
export { relationshipStatusAboutMeStepMeta, relationshipStructureAboutMeStepMeta, kidsAboutMeStepMeta }
export { interestedInStepMeta, seekingAgeStepMeta, relationshipStructurePrefStepMeta, kidsPrefStepMeta }
export { toDesiredMask }
