import { Component, Show } from 'solid-js'
import { cn } from '@/lib/utils'
import { Icon } from '@/components/icons'

export interface ProfileBadgeProps {
  /** Category label (e.g., "Seeking", "Religion") */
  category: string
  /** Value (e.g., "Casual", "Socially") */
  value: string
  /** Whether this field is attested (passport-verified via Self.xyz) */
  attested?: boolean
  /** Stack label above value (for mobile / compact layouts) */
  stacked?: boolean
  /** Additional class names */
  class?: string
}

/**
 * Profile field row: Category: Value [verified icon]
 *
 * - Body size (16px), category is medium weight, value is regular
 * - Attested fields show seal-check icon after the value
 * - Use stacked={true} for 2-line layout (label above, value below)
 */
export const ProfileBadge: Component<ProfileBadgeProps> = (props) => {
  // Stacked layout: label on top, value below
  if (props.stacked) {
    return (
      <div class={cn('flex flex-col', props.class)}>
        <span class="text-sm text-muted-foreground">{props.category}</span>
        <div class="flex items-center gap-1">
          <span class="text-base font-medium text-foreground">{props.value}</span>
          <Show when={props.attested}>
            <Icon name="seal-check" weight="fill" class="text-sm text-blue-400 flex-shrink-0" />
          </Show>
        </div>
      </div>
    )
  }

  // Inline layout: Category: Value
  return (
    <div class={cn('flex items-center gap-1.5', props.class)}>
      <span class="text-base font-medium text-foreground whitespace-nowrap">{props.category}:</span>
      <span class="text-base text-foreground">{props.value}</span>
      <Show when={props.attested}>
        <Icon name="seal-check" weight="fill" class="text-base text-blue-400 flex-shrink-0" />
      </Show>
    </div>
  )
}

// =============================================================================
// ATTESTED FIELDS (from Self.xyz passport)
// =============================================================================

/** Age buckets from Directory.sol */
export type AgeBucket = 1 | 2 | 3 | 4 | 5 | 6

export const AGE_BUCKET_LABELS: Record<AgeBucket, string> = {
  1: '18-24',
  2: '25-29',
  3: '30-34',
  4: '35-39',
  5: '40-49',
  6: '50+',
}

/** Biological sex from Dating.sol (encrypted, revealed on match) */
export type BiologicalSex = 0 | 1

export const BIOLOGICAL_SEX_LABELS: Record<BiologicalSex, string> = {
  0: 'Male',
  1: 'Female',
}

/** Nationality from Self.xyz passport (ISO 3166-1 alpha-3 codes) */
export const NATIONALITY_LABELS: Record<string, string> = {
  USA: 'US',
  GBR: 'UK',
  CAN: 'Canada',
  AUS: 'Australia',
  DEU: 'Germany',
  FRA: 'France',
  JPN: 'Japan',
  KOR: 'Korea',
  BRA: 'Brazil',
  MEX: 'Mexico',
  IND: 'India',
  CHN: 'China',
  ESP: 'Spain',
  ITA: 'Italy',
  NLD: 'Netherlands',
  SWE: 'Sweden',
  NOR: 'Norway',
  DNK: 'Denmark',
  FIN: 'Finland',
  CHE: 'Switzerland',
  AUT: 'Austria',
  BEL: 'Belgium',
  PRT: 'Portugal',
  IRL: 'Ireland',
  NZL: 'New Zealand',
  SGP: 'Singapore',
  HKG: 'Hong Kong',
  TWN: 'Taiwan',
  THA: 'Thailand',
  PHL: 'Philippines',
  IDN: 'Indonesia',
  MYS: 'Malaysia',
  VNM: 'Vietnam',
  ARG: 'Argentina',
  CHL: 'Chile',
  COL: 'Colombia',
  PER: 'Peru',
  ZAF: 'S. Africa',
  EGY: 'Egypt',
  ISR: 'Israel',
  ARE: 'UAE',
  SAU: 'Saudi',
  TUR: 'Turkey',
  RUS: 'Russia',
  UKR: 'Ukraine',
  POL: 'Poland',
  CZE: 'Czechia',
  HUN: 'Hungary',
  ROU: 'Romania',
  GRC: 'Greece',
}

// =============================================================================
// USER-SET PUBLIC FIELDS (Directory.sol)
// =============================================================================

/** Region bucket (on-chain, public) */
export type RegionBucket = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

export const REGION_BUCKET_LABELS: Record<RegionBucket, string> = {
  1: 'North America',
  2: 'Latin America & Caribbean',
  3: 'Europe',
  4: 'Middle East & North Africa',
  5: 'Sub-Saharan Africa',
  6: 'South Asia',
  7: 'East & Southeast Asia',
  8: 'Oceania',
  9: 'Prefer not to say',
}

/** Metro bucket (opt-in, public) */
export type MetroBucket = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20

export const METRO_BUCKET_LABELS: Record<MetroBucket, string> = {
  1: 'NYC',
  2: 'LA',
  3: 'SF Bay',
  4: 'Chicago',
  5: 'Miami',
  6: 'Austin',
  7: 'Seattle',
  8: 'Denver',
  9: 'Boston',
  10: 'DC',
  11: 'London',
  12: 'Berlin',
  13: 'Paris',
  14: 'Amsterdam',
  15: 'Toronto',
  16: 'Sydney',
  17: 'Melbourne',
  18: 'Tokyo',
  19: 'Singapore',
  20: 'Other',
}

/** Gender identity */
export type GenderIdentity = 1 | 2 | 3 | 4 | 5

export const GENDER_IDENTITY_LABELS: Record<GenderIdentity, string> = {
  1: 'Man',
  2: 'Woman',
  3: 'Non-binary',
  4: 'Trans man',
  5: 'Trans woman',
}

/** Seeking */
export type LookingFor = 1 | 2 | 3

export const LOOKING_FOR_LABELS: Record<LookingFor, string> = {
  1: 'Low commitment',
  2: 'Friends first',
  3: 'Relationship',
}

/** Smoking */
export type Smoking = 1 | 2 | 3

export const SMOKING_LABELS: Record<Smoking, string> = {
  1: 'Never',
  2: 'Sometimes',
  3: 'Regularly',
}

/** Drinking */
export type Drinking = 1 | 2 | 3

export const DRINKING_LABELS: Record<Drinking, string> = {
  1: 'Never',
  2: 'Socially',
  3: 'Regularly',
}

/** Body type */
export type BodyBucket = 1 | 2 | 3 | 4 | 5

export const BODY_BUCKET_LABELS: Record<BodyBucket, string> = {
  1: 'Slim',
  2: 'Athletic',
  3: 'Average',
  4: 'Curvy',
  5: 'Large',
}

/** Fitness level */
export type FitnessBucket = 1 | 2 | 3 | 4 | 5

export const FITNESS_BUCKET_LABELS: Record<FitnessBucket, string> = {
  1: 'Not active',
  2: 'Light',
  3: 'Moderate',
  4: 'Very active',
  5: 'Athlete',
}

// =============================================================================
// PRIVATE ENCRYPTED FIELDS (Dating.sol - revealed on match)
// =============================================================================

/** Kids status */
export type Kids = 1 | 2 | 3 | 4

export const KIDS_LABELS: Record<Kids, string> = {
  1: "Don't want kids",
  2: 'Want kids',
  3: 'Have kids, want more',
  4: 'Have kids, all set',
}

/** Kids timeline */
export type KidsTimeline = 1 | 2 | 3 | 4 | 5 | 6

export const KIDS_TIMELINE_LABELS: Record<KidsTimeline, string> = {
  1: 'Never',
  2: 'Not for 5+ years',
  3: 'In 2-5 years',
  4: 'Soon',
  5: 'Already have',
  6: "Open to partner's kids",
}

/** Relationship structure */
export type RelationshipStructure = 1 | 2 | 3 | 4

export const RELATIONSHIP_STRUCTURE_LABELS: Record<RelationshipStructure, string> = {
  1: 'Monogamous',
  2: 'Open',
  3: 'Polyamorous',
  4: 'Relationship anarchy',
}

/** Relationship status */
export type RelationshipStatus = 1 | 2 | 3 | 4 | 5

export const RELATIONSHIP_STATUS_LABELS: Record<RelationshipStatus, string> = {
  1: 'Single',
  2: 'In a relationship',
  3: 'Married',
  4: 'Separated',
  5: 'Divorced',
}

/** Group play mode */
export type GroupPlayMode = 1 | 2 | 3

export const GROUP_PLAY_MODE_LABELS: Record<GroupPlayMode, string> = {
  1: 'Not interested',
  2: 'Open to it',
  3: 'Into it',
}

/** Religion */
export type Religion = 1 | 2 | 3 | 4 | 5 | 6

export const RELIGION_LABELS: Record<Religion, string> = {
  1: 'Not religious',
  2: 'Christian',
  3: 'Jewish',
  4: 'Muslim',
  5: 'Buddhist/Hindu',
  6: 'Other',
}

/** Kink level */
export type KinkLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7

export const KINK_LEVEL_LABELS: Record<KinkLevel, string> = {
  1: 'Vanilla only',
  2: 'Mostly vanilla',
  3: 'Open-minded',
  4: 'Friendly',
  5: 'Enthusiast',
  6: 'Very kinky',
  7: 'Lifestyle',
}

/** Income range */
export type IncomeRange = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8

export const INCOME_RANGE_LABELS: Record<IncomeRange, string> = {
  1: 'Student',
  2: 'Under $30K',
  3: '$30-50K',
  4: '$50-75K',
  5: '$75-100K',
  6: '$100-150K',
  7: '$150-250K',
  8: '$250K+',
}

export default ProfileBadge
