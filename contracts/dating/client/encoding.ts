/**
 * Client-side encoding for DatingV2 contract
 *
 * Encodes user preferences with true secret dealbreaker privacy:
 * - No plaintext policies on chain
 * - UNKNOWN sentinel: 15 for categorical, 255 for numeric
 * - WILDCARD mask (0x7FFF) = NONE policy (don't filter known values)
 * - revealOnMatch: true = CRITERIA, false = DEALBREAKER
 */

// ============ CONSTANTS ============

export const NUM_ATTRS = 12;

// Attribute IDs (must match contract)
export const ATTR = {
  EXACT_AGE: 0,           // Numeric, verified from passport
  BIOLOGICAL_SEX: 1,      // Categorical, verified from passport, private by default
  GENDER_IDENTITY: 2,     // Categorical, self-reported, can be public
  KIDS: 3,
  KIDS_TIMELINE: 4,
  RELATIONSHIP_STRUCTURE: 5,
  SMOKING: 6,
  RELATIONSHIP_STATUS: 7,
  DRINKING: 8,
  RELIGION: 9,
  KINK_LEVEL: 10,         // Numeric
  GROUP_PLAY_MODE: 11,    // Categorical: 1-6
} as const;

// UNKNOWN sentinels
export const UNKNOWN_CATEGORICAL = 15;  // Maps to bit 15 in euint16 mask
export const UNKNOWN_NUMERIC = 255;

// Bit 15 in prefMask = accept UNKNOWN values (used for numeric LENIENT)
export const UNKNOWN_BIT = 1 << 15;  // 0x8000

// Wildcard = accept all known values (NONE policy)
export const WILDCARD_MASK = 0x7FFF;

// Max valid categorical value (1-14 valid, 0 = UNSPECIFIED → UNKNOWN, 15 = UNKNOWN)
// NOTE: Enum value 0 (UNSPECIFIED) is mapped to 15 (UNKNOWN) by validateCategorical()
// before on-chain storage. This means bit 0 (1<<0) is never used in preference masks.
// On-chain domain is always 1-N valid + 15 unknown.
export const MAX_CATEGORICAL = 14;

// ============ ENUMS ============

export enum BiologicalSex {
  MALE = 1,    // Note: 0 is mapped to UNKNOWN at encoding edge
  FEMALE = 2,
  UNKNOWN = UNKNOWN_CATEGORICAL,
}

export enum GenderIdentity {
  MAN = 1,
  WOMAN = 2,
  NON_BINARY = 3,
  TRANS_MAN = 4,
  TRANS_WOMAN = 5,
  GENDERQUEER = 6,
  GENDERFLUID = 7,
  AGENDER = 8,
  TWO_SPIRIT = 9,
  OTHER = 10,
  UNKNOWN = UNKNOWN_CATEGORICAL,
}

export enum Kids {
  UNSPECIFIED = 0,
  NO_KIDS_DONT_WANT = 1,
  NO_KIDS_WANT_SOMEDAY = 2,
  NO_KIDS_OPEN = 3,
  HAVE_KIDS_WANT_MORE = 4,
  HAVE_KIDS_DONE = 5,
  UNKNOWN = UNKNOWN_CATEGORICAL,
}

export enum KidsTimeline {
  UNSPECIFIED = 0,
  NEVER = 1,
  NOT_FOR_5_YEARS = 2,
  IN_2_TO_5_YEARS = 3,
  SOON = 4,
  ALREADY_HAVE = 5,
  OPEN_TO_PARTNERS = 6,
  UNKNOWN = UNKNOWN_CATEGORICAL,
}

export enum RelationshipStructure {
  UNSPECIFIED = 0,
  MONOGAMOUS = 1,
  OPEN = 2,
  POLY = 3,
  RELATIONSHIP_ANARCHY = 4,
  UNKNOWN = UNKNOWN_CATEGORICAL,
}

export enum Smoking {
  UNSPECIFIED = 0,
  NEVER = 1,
  OCCASIONAL = 2,
  REGULAR = 3,
  UNKNOWN = UNKNOWN_CATEGORICAL,
}

export enum RelationshipStatus {
  UNSPECIFIED = 0,
  SINGLE = 1,
  RELATIONSHIP = 2,
  MARRIED = 3,
  SEPARATED = 4,
  DIVORCED = 5,
  UNKNOWN = UNKNOWN_CATEGORICAL,
}

export enum Drinking {
  UNSPECIFIED = 0,
  NEVER = 1,
  SOCIAL = 2,
  REGULAR = 3,
  UNKNOWN = UNKNOWN_CATEGORICAL,
}

export enum Religion {
  UNSPECIFIED = 0,
  NOT_RELIGIOUS = 1,
  SPIRITUAL = 2,
  CHRISTIAN = 3,
  JEWISH = 4,
  MUSLIM = 5,
  BUDDHIST_HINDU = 6,
  OTHER = 7,
  UNKNOWN = UNKNOWN_CATEGORICAL,
}

export enum GroupPlayMode {
  UNSPECIFIED = 0,
  NOT_INTERESTED = 1,
  OPEN_TO_THREESOMES = 2,
  SINGLE_SEEKING_COUPLES = 3,
  COUPLE_SEEKING_THIRD = 4,
  COUPLE_SEEKING_COUPLES = 5,
  OPEN_TO_GROUP_EVENTS = 6,
  UNKNOWN = UNKNOWN_CATEGORICAL,
}


// ============ TYPES ============

export type MatchPolicy = 'NONE' | 'DEALBREAKER' | 'CRITERIA';
export type UnknownHandling = 'STRICT' | 'LENIENT';

export interface AttributeConfig {
  value: number;                    // My value (or UNKNOWN sentinel)
  policy: MatchPolicy;              // NONE = don't filter, DEALBREAKER = filter+hide, CRITERIA = filter+reveal
  unknownHandling: UnknownHandling; // STRICT = fail on unknown, LENIENT = pass on unknown
  acceptedValues?: number[];        // For categorical: which values to accept
  prefMin?: number;                 // For numeric: minimum acceptable
  prefMax?: number;                 // For numeric: maximum acceptable
}

export interface ProfileConfig {
  [ATTR.EXACT_AGE]: AttributeConfig;
  [ATTR.BIOLOGICAL_SEX]: AttributeConfig;
  [ATTR.GENDER_IDENTITY]: AttributeConfig;
  [ATTR.KIDS]: AttributeConfig;
  [ATTR.KIDS_TIMELINE]: AttributeConfig;
  [ATTR.RELATIONSHIP_STRUCTURE]: AttributeConfig;
  [ATTR.SMOKING]: AttributeConfig;
  [ATTR.RELATIONSHIP_STATUS]: AttributeConfig;
  [ATTR.DRINKING]: AttributeConfig;
  [ATTR.RELIGION]: AttributeConfig;
  [ATTR.KINK_LEVEL]: AttributeConfig;
  [ATTR.GROUP_PLAY_MODE]: AttributeConfig;
}

export interface EncodedProfile {
  values: number[];       // 12 values (UNKNOWN sentinel if not set)
  prefMasks: number[];    // 12 masks (WILDCARD for NONE policy on categoricals)
  prefMins: number[];     // 12 mins (0 if no filter)
  prefMaxs: number[];     // 12 maxs (255 if no filter)
  revealFlags: boolean[]; // 12 flags (true = CRITERIA, false = DEALBREAKER)
}

// ============ ENCODING FUNCTIONS ============

/**
 * Check if attribute is numeric (uses min/max range)
 * EXACT_AGE (0) and KINK_LEVEL (10) are numeric
 * All others are categorical (use bitmask)
 */
export function isNumericAttr(attr: number): boolean {
  return attr === ATTR.EXACT_AGE || attr === ATTR.KINK_LEVEL;
}

/**
 * Get UNKNOWN sentinel for attribute type
 */
export function getUnknownValue(attr: number): number {
  return isNumericAttr(attr) ? UNKNOWN_NUMERIC : UNKNOWN_CATEGORICAL;
}

/**
 * Validate categorical value is in valid range
 * NOTE: UNSPECIFIED (0) is mapped to UNKNOWN (15) at encoding edge
 */
export function validateCategorical(value: number | null | undefined): number {
  if (value === null || value === undefined) {
    return UNKNOWN_CATEGORICAL;
  }
  // Map UNSPECIFIED (0) to UNKNOWN - 0 should not be stored on-chain
  if (value === 0) {
    return UNKNOWN_CATEGORICAL;
  }
  if (value < 0 || value > MAX_CATEGORICAL) {
    throw new Error(`Invalid categorical value: ${value}. Must be 1-${MAX_CATEGORICAL} or ${UNKNOWN_CATEGORICAL}`);
  }
  return value;
}

/**
 * Validate numeric value is in valid range
 * NOTE: For numeric attrs, 0 typically means "not specified" and maps to UNKNOWN
 * - EXACT_AGE: 0 is not a valid age
 * - KINK_LEVEL: 0 = "Not specified" in labels
 */
export function validateNumeric(value: number | null | undefined): number {
  if (value === null || value === undefined) {
    return UNKNOWN_NUMERIC;
  }
  // For age and kink, 0 means "not specified" → map to UNKNOWN
  // Age 0 makes no sense, kink 0 is "Not specified"
  if (value === 0) {
    return UNKNOWN_NUMERIC;
  }
  if (value < 1 || value > 254) {
    throw new Error(`Invalid numeric value: ${value}. Must be 1-254 or ${UNKNOWN_NUMERIC}`);
  }
  return value;
}

/**
 * Create bitmask from array of categorical values
 * Remember: shift is % 16, so UNKNOWN (15) maps to bit 15
 */
export function createMask(values: number[]): number {
  let mask = 0;
  for (const v of values) {
    if (v < 0 || v > 15) {
      throw new Error(`Invalid mask value: ${v}. Must be 0-15`);
    }
    mask |= (1 << v);
  }
  return mask;
}

/**
 * Create preference mask based on policy and unknown handling
 *
 * @param acceptedValues Values to accept (categorical)
 * @param policy NONE = WILDCARD (known values), DEALBREAKER/CRITERIA = specific mask
 * @param unknownHandling STRICT = don't include bit 15, LENIENT = include bit 15
 */
export function createPrefMask(
  acceptedValues: number[],
  policy: MatchPolicy,
  unknownHandling: UnknownHandling
): number {
  // NONE policy = accept all known values
  if (policy === 'NONE') {
    return unknownHandling === 'LENIENT'
      ? (WILDCARD_MASK | UNKNOWN_BIT)
      : WILDCARD_MASK;
  }

  // Create mask from accepted values
  let mask = createMask(acceptedValues);

  // Handle UNKNOWN
  if (unknownHandling === 'LENIENT') {
    // Include UNKNOWN (bit 15) in acceptable values
    mask |= (1 << UNKNOWN_CATEGORICAL);
  }
  // STRICT: don't include bit 15, so UNKNOWN will fail

  return mask;
}

/**
 * Encode a single attribute config into contract values
 */
export function encodeAttribute(
  attr: number,
  config: AttributeConfig
): {
  value: number;
  prefMask: number;
  prefMin: number;
  prefMax: number;
  revealFlag: boolean;
} {
  const isNumeric = isNumericAttr(attr);

  // Encode value
  const value = isNumeric
    ? validateNumeric(config.value)
    : validateCategorical(config.value);

  // Encode preferences
  let prefMask = WILDCARD_MASK;
  let prefMin = 0;
  let prefMax = isNumeric ? 254 : 0;  // 254 for numeric WILDCARD (not 255)

  if (config.policy === 'NONE' && config.unknownHandling === 'LENIENT') {
    prefMask = isNumeric ? UNKNOWN_BIT : (WILDCARD_MASK | UNKNOWN_BIT);
  }

  if (config.policy !== 'NONE') {
    if (isNumeric) {
      // Numeric: use min/max range
      prefMin = config.prefMin ?? 0;
      prefMax = config.prefMax ?? 254;  // Keep actual range, don't mutate for LENIENT

      // For numeric LENIENT: set bit 15 in prefMask to accept UNKNOWN
      // This preserves the actual range while allowing UNKNOWN to pass
      if (config.unknownHandling === 'LENIENT') {
        prefMask = UNKNOWN_BIT;  // Only bit 15 set (accept UNKNOWN)
      } else {
        prefMask = 0;  // STRICT: no UNKNOWN bit, reject UNKNOWN
      }
    } else {
      // Categorical: use bitmask
      prefMask = createPrefMask(
        config.acceptedValues ?? [],
        config.policy,
        config.unknownHandling
      );
    }
  }

  // Encode reveal flag
  const revealFlag = config.policy === 'CRITERIA';

  return { value, prefMask, prefMin, prefMax, revealFlag };
}

/**
 * Encode full profile config into contract-ready arrays
 */
export function encodeProfile(config: Partial<ProfileConfig>): EncodedProfile {
  const values: number[] = [];
  const prefMasks: number[] = [];
  const prefMins: number[] = [];
  const prefMaxs: number[] = [];
  const revealFlags: boolean[] = [];

  for (let attr = 0; attr < NUM_ATTRS; attr++) {
    const attrConfig = config[attr as keyof ProfileConfig];

    if (!attrConfig) {
      // Default: UNKNOWN value, NONE policy
      const isNumeric = isNumericAttr(attr);
      values.push(isNumeric ? UNKNOWN_NUMERIC : UNKNOWN_CATEGORICAL);
      prefMasks.push(WILDCARD_MASK);
      prefMins.push(0);
      prefMaxs.push(isNumeric ? 254 : 0);  // 254 for numeric NONE (matches WILDCARD detection)
      revealFlags.push(false);
    } else {
      const encoded = encodeAttribute(attr, attrConfig);
      values.push(encoded.value);
      prefMasks.push(encoded.prefMask);
      prefMins.push(encoded.prefMin);
      prefMaxs.push(encoded.prefMax);
      revealFlags.push(encoded.revealFlag);
    }
  }

  return { values, prefMasks, prefMins, prefMaxs, revealFlags };
}

// ============ UI HELPERS ============

/**
 * Maps UI state to AttributeConfig for categorical preferences.
 *
 * @param myValue - My value for this attribute (single-select from values flow)
 * @param acceptedValues - Values I'm open to (multi-select from preferences flow)
 * @param filterEnabled - Whether this is a dealbreaker (filter toggle)
 * @param visibility - 'public' | 'match' | 'private' (visibility selector)
 *
 * When filterEnabled is false:
 *   - policy = 'NONE' → prefMask = WILDCARD_MASK (sees everyone with known values)
 *   - acceptedValues are stored for potential future use but don't gate
 *
 * When filterEnabled is true:
 *   - policy = 'CRITERIA' (if visibility = 'match') or 'DEALBREAKER' (if visibility = 'private')
 *   - prefMask = bitmask of acceptedValues (only sees matching profiles)
 */
export function createCategoricalConfig(
  myValue: number,
  acceptedValues: number[],
  filterEnabled: boolean,
  visibility: 'public' | 'match' | 'private' = 'match'
): AttributeConfig {
  // Determine policy based on filter toggle and visibility
  let policy: MatchPolicy = 'NONE';
  if (filterEnabled) {
    policy = visibility === 'private' ? 'DEALBREAKER' : 'CRITERIA';
  }

  return {
    value: myValue,
    policy,
    unknownHandling: 'LENIENT', // Default to accepting unknowns
    acceptedValues: filterEnabled ? acceptedValues : undefined,
  };
}

/**
 * Maps UI state to AttributeConfig for numeric preferences (age, kink).
 *
 * @param myValue - My value for this attribute
 * @param prefMin - Minimum acceptable value (from range picker)
 * @param prefMax - Maximum acceptable value (from range picker)
 * @param filterEnabled - Whether this is a dealbreaker (filter toggle)
 * @param visibility - 'public' | 'match' | 'private' (visibility selector)
 */
export function createNumericConfig(
  myValue: number,
  prefMin: number,
  prefMax: number,
  filterEnabled: boolean,
  visibility: 'public' | 'match' | 'private' = 'match'
): AttributeConfig {
  let policy: MatchPolicy = 'NONE';
  if (filterEnabled) {
    policy = visibility === 'private' ? 'DEALBREAKER' : 'CRITERIA';
  }

  return {
    value: myValue,
    policy,
    unknownHandling: 'LENIENT',
    prefMin: filterEnabled ? prefMin : 0,
    prefMax: filterEnabled ? prefMax : 254,
  };
}

// ============ EXAMPLE USAGE ============

/**
 * Example: Create a profile that:
 * - Is 29 years old, wants partners 25-35
 * - Is female (from self.xyz verification)
 * - Wants kids someday, only matches others who want kids (dealbreaker)
 * - Is kink-friendly (level 4), wants at least open-minded (3+) (criteria - reveals on match)
 * - Is Christian, only matches Christians (dealbreaker - never reveals)
 * - Doesn't filter on smoking (NONE policy)
 */
export function exampleProfile(): EncodedProfile {
  const config: Partial<ProfileConfig> = {
    [ATTR.EXACT_AGE]: {
      value: 29,
      policy: 'CRITERIA',
      unknownHandling: 'STRICT',
      prefMin: 25,
      prefMax: 35,
    },
    [ATTR.BIOLOGICAL_SEX]: {
      value: BiologicalSex.FEMALE,
      policy: 'NONE',
      unknownHandling: 'LENIENT',
    },
    [ATTR.KIDS]: {
      value: Kids.NO_KIDS_WANT_SOMEDAY,
      policy: 'DEALBREAKER',  // Never reveals that religion was checked
      unknownHandling: 'STRICT',
      acceptedValues: [Kids.NO_KIDS_WANT_SOMEDAY, Kids.NO_KIDS_OPEN],
    },
    [ATTR.KINK_LEVEL]: {
      value: 4,  // Kink-friendly
      policy: 'CRITERIA',  // Reveals "Intimacy alignment" on match
      unknownHandling: 'LENIENT',
      prefMin: 3,  // At least open-minded
      prefMax: 7,  // Up to max kink
    },
    [ATTR.RELIGION]: {
      value: Religion.CHRISTIAN,
      policy: 'DEALBREAKER',  // Never reveals religion was checked
      unknownHandling: 'STRICT',
      acceptedValues: [Religion.CHRISTIAN],
    },
    [ATTR.SMOKING]: {
      value: Smoking.NEVER,
      policy: 'NONE',  // Don't filter on smoking
      unknownHandling: 'LENIENT',
    },
  };

  return encodeProfile(config);
}

/**
 * Example: Create a profile from UI state
 *
 * This shows how the onboarding UI maps to encodeProfile():
 * - Values flow (Steps 1-9): single-select → myValue
 * - Preferences flow (Pref 1-6): multi-select + filter toggle → acceptedValues + filterEnabled
 */
export function exampleProfileFromUI(): EncodedProfile {
  // Simulated UI state from onboarding
  const uiState = {
    // Values (what I am) - from Steps 1-9
    myAge: 29,
    myGender: GenderIdentity.WOMAN,
    myRelationshipStructure: RelationshipStructure.MONOGAMOUS,
    myKids: Kids.NO_KIDS_WANT_SOMEDAY,
    myReligion: Religion.SPIRITUAL,

    // Preferences (what I want) - from Pref 1-6
    // Each has: selectedValues (multi-select) + filterEnabled (toggle)
    genderPref: {
      values: [GenderIdentity.MAN, GenderIdentity.NON_BINARY],
      filterEnabled: true,  // ON by default for gender
    },
    agePref: {
      min: 25,
      max: 40,
      filterEnabled: true,  // ON by default for age
    },
    relationshipStructurePref: {
      values: [RelationshipStructure.MONOGAMOUS],
      filterEnabled: false,  // OFF by default - just a signal
    },
    kidsPref: {
      values: [Kids.NO_KIDS_WANT_SOMEDAY, Kids.NO_KIDS_OPEN],
      filterEnabled: false,  // OFF by default - just a signal
    },
    religionPref: {
      values: [Religion.SPIRITUAL, Religion.NOT_RELIGIOUS],
      filterEnabled: false,  // OFF by default - just a signal
    },
  };

  // Map UI state to ProfileConfig using helpers
  const config: Partial<ProfileConfig> = {
    [ATTR.EXACT_AGE]: createNumericConfig(
      uiState.myAge,
      uiState.agePref.min,
      uiState.agePref.max,
      uiState.agePref.filterEnabled,
      'match'
    ),
    [ATTR.GENDER_IDENTITY]: createCategoricalConfig(
      uiState.myGender,
      uiState.genderPref.values,
      uiState.genderPref.filterEnabled,
      'match'
    ),
    [ATTR.RELATIONSHIP_STRUCTURE]: createCategoricalConfig(
      uiState.myRelationshipStructure,
      uiState.relationshipStructurePref.values,
      uiState.relationshipStructurePref.filterEnabled,
      'match'
    ),
    [ATTR.KIDS]: createCategoricalConfig(
      uiState.myKids,
      uiState.kidsPref.values,
      uiState.kidsPref.filterEnabled,
      'match'
    ),
    [ATTR.RELIGION]: createCategoricalConfig(
      uiState.myReligion,
      uiState.religionPref.values,
      uiState.religionPref.filterEnabled,
      'match'
    ),
  };

  return encodeProfile(config);
}

// ============ LABELS (for UI) ============

export const ATTR_LABELS: Record<number, string> = {
  [ATTR.EXACT_AGE]: 'Age',
  [ATTR.BIOLOGICAL_SEX]: 'Biological Sex',
  [ATTR.GENDER_IDENTITY]: 'Gender',
  [ATTR.KIDS]: 'Kids',
  [ATTR.KIDS_TIMELINE]: 'Kids Timeline',
  [ATTR.RELATIONSHIP_STRUCTURE]: 'Relationship Structure',
  [ATTR.SMOKING]: 'Smoking',
  [ATTR.RELATIONSHIP_STATUS]: 'Relationship Status',
  [ATTR.DRINKING]: 'Drinking',
  [ATTR.RELIGION]: 'Religion',
  [ATTR.KINK_LEVEL]: 'Intimacy Style',
  [ATTR.GROUP_PLAY_MODE]: 'Group Play',
};

export const REVEAL_LABELS: Record<number, string> = {
  [ATTR.EXACT_AGE]: 'Age compatible',
  [ATTR.BIOLOGICAL_SEX]: 'Attraction aligned',
  [ATTR.GENDER_IDENTITY]: 'Gender aligned',
  [ATTR.KIDS]: 'Kids aligned',
  [ATTR.KIDS_TIMELINE]: 'Family timeline',
  [ATTR.RELATIONSHIP_STRUCTURE]: 'Relationship style',
  [ATTR.SMOKING]: 'Smoking compatible',
  [ATTR.RELATIONSHIP_STATUS]: 'Status aligned',
  [ATTR.DRINKING]: 'Drinking compatible',
  [ATTR.RELIGION]: 'Faith aligned',
  [ATTR.KINK_LEVEL]: 'Intimacy alignment',
  [ATTR.GROUP_PLAY_MODE]: 'Group play aligned',
};

export const KIDS_LABELS: Record<number, string> = {
  [Kids.UNSPECIFIED]: 'Not specified',
  [Kids.NO_KIDS_DONT_WANT]: "No kids — don't want",
  [Kids.NO_KIDS_WANT_SOMEDAY]: 'No kids — want someday',
  [Kids.NO_KIDS_OPEN]: 'No kids — open/unsure',
  [Kids.HAVE_KIDS_WANT_MORE]: 'Have kids — want more',
  [Kids.HAVE_KIDS_DONE]: 'Have kids — done',
};

export const RELIGION_LABELS: Record<number, string> = {
  [Religion.UNSPECIFIED]: 'Not specified',
  [Religion.NOT_RELIGIOUS]: 'Not religious',
  [Religion.SPIRITUAL]: 'Spiritual',
  [Religion.CHRISTIAN]: 'Christian',
  [Religion.JEWISH]: 'Jewish',
  [Religion.MUSLIM]: 'Muslim',
  [Religion.BUDDHIST_HINDU]: 'Buddhist/Hindu/Other',
  [Religion.OTHER]: 'Other',
};

export const KINK_LABELS: Record<number, string> = {
  0: 'Not specified',
  1: 'Vanilla only',
  2: 'Vanilla preferred',
  3: 'Open-minded',
  4: 'Kink-friendly',
  5: 'Kink enthusiast',
  6: 'Very kinky',
  7: 'Lifestyle kinkster',
};

export const RELATIONSHIP_LABELS: Record<number, string> = {
  [RelationshipStructure.UNSPECIFIED]: 'Not specified',
  [RelationshipStructure.MONOGAMOUS]: 'Monogamous',
  [RelationshipStructure.OPEN]: 'Open',
  [RelationshipStructure.POLY]: 'Polyamorous',
  [RelationshipStructure.RELATIONSHIP_ANARCHY]: 'Relationship anarchy',
};

export const RELATIONSHIP_STATUS_LABELS: Record<number, string> = {
  [RelationshipStatus.UNSPECIFIED]: 'Not specified',
  [RelationshipStatus.SINGLE]: 'Single',
  [RelationshipStatus.RELATIONSHIP]: 'In a relationship',
  [RelationshipStatus.MARRIED]: 'Married',
  [RelationshipStatus.SEPARATED]: 'Separated',
  [RelationshipStatus.DIVORCED]: 'Divorced',
};

export const BIOLOGICAL_SEX_LABELS: Record<number, string> = {
  [BiologicalSex.MALE]: 'Male',
  [BiologicalSex.FEMALE]: 'Female',
  [BiologicalSex.UNKNOWN]: 'Not specified',
};

export const GENDER_LABELS: Record<number, string> = {
  [GenderIdentity.MAN]: 'Man',
  [GenderIdentity.WOMAN]: 'Woman',
  [GenderIdentity.NON_BINARY]: 'Non-binary',
  [GenderIdentity.TRANS_MAN]: 'Trans man',
  [GenderIdentity.TRANS_WOMAN]: 'Trans woman',
  [GenderIdentity.GENDERQUEER]: 'Genderqueer',
  [GenderIdentity.GENDERFLUID]: 'Genderfluid',
  [GenderIdentity.AGENDER]: 'Agender',
  [GenderIdentity.TWO_SPIRIT]: 'Two-spirit',
  [GenderIdentity.OTHER]: 'Other',
  [GenderIdentity.UNKNOWN]: 'Not specified',
};

export const GROUP_PLAY_LABELS: Record<number, string> = {
  [GroupPlayMode.UNSPECIFIED]: 'Not specified',
  [GroupPlayMode.NOT_INTERESTED]: 'Not interested',
  [GroupPlayMode.OPEN_TO_THREESOMES]: 'Open to threesomes',
  [GroupPlayMode.SINGLE_SEEKING_COUPLES]: 'Single seeking couples',
  [GroupPlayMode.COUPLE_SEEKING_THIRD]: 'Couple seeking third',
  [GroupPlayMode.COUPLE_SEEKING_COUPLES]: 'Couple seeking couples',
  [GroupPlayMode.OPEN_TO_GROUP_EVENTS]: 'Open to group events',
};
