/**
 * Client-side encoding for DatingV3 contract
 *
 * V3 is minimal: only age, gender identity, and desired gender mask.
 * All other filtering happens off-chain via candidate sets.
 */

// ============ CONSTANTS ============

// Gender identity values (must match contract)
export const G_MAN = 1;
export const G_WOMAN = 2;
export const G_TRANS_MAN = 3;
export const G_TRANS_WOMAN = 4;
export const G_NON_BINARY = 5;

// Desired mask bits (must match contract)
export const MASK_MEN = 1 << 0;      // bit 0: men (man, trans man)
export const MASK_WOMEN = 1 << 1;    // bit 1: women (woman, trans woman)
export const MASK_NB = 1 << 2;       // bit 2: non-binary
export const MASK_EVERYONE = 0x0007; // all three bits

// Unknown sentinel
export const UNKNOWN_U8 = 255;

// ============ ENUMS ============

export enum GenderIdentity {
  MAN = G_MAN,
  WOMAN = G_WOMAN,
  TRANS_MAN = G_TRANS_MAN,
  TRANS_WOMAN = G_TRANS_WOMAN,
  NON_BINARY = G_NON_BINARY,
  UNKNOWN = UNKNOWN_U8,
}

// Gender bucket (for desired mask)
export enum GenderBucket {
  MEN = 0,      // man, trans man
  WOMEN = 1,    // woman, trans woman
  NB = 2,       // non-binary
}

// ============ TYPES ============

export interface BasicsConfig {
  age: number;                    // 18-254, or UNKNOWN_U8
  genderId: GenderIdentity;       // 1-5
  desiredGenders: GenderBucket[]; // which genders to match with
  shareAge: boolean;              // reveal age bucket on match
  shareGender: boolean;           // reveal genderId on match
}

export interface EncodedBasics {
  claimedAge: number;
  genderId: number;
  desiredMask: number;
  shareAge: boolean;
  shareGender: boolean;
}

// ============ ENCODING FUNCTIONS ============

/**
 * Map gender identity to bucket for desired mask
 */
export function genderToBucket(genderId: GenderIdentity): GenderBucket | null {
  switch (genderId) {
    case GenderIdentity.MAN:
    case GenderIdentity.TRANS_MAN:
      return GenderBucket.MEN;
    case GenderIdentity.WOMAN:
    case GenderIdentity.TRANS_WOMAN:
      return GenderBucket.WOMEN;
    case GenderIdentity.NON_BINARY:
      return GenderBucket.NB;
    default:
      return null; // unknown
  }
}

/**
 * Create desired mask from array of gender buckets
 */
export function createDesiredMask(genders: GenderBucket[]): number {
  let mask = 0;
  for (const g of genders) {
    mask |= (1 << g);
  }
  return mask;
}

/**
 * Validate age is in valid range
 */
export function validateAge(age: number | null | undefined): number {
  if (age === null || age === undefined) {
    return UNKNOWN_U8;
  }
  if (age < 18 || age > 254) {
    return UNKNOWN_U8;
  }
  return age;
}

/**
 * Validate gender identity is in valid range
 */
export function validateGenderId(genderId: number | null | undefined): number {
  if (genderId === null || genderId === undefined) {
    return UNKNOWN_U8;
  }
  if (genderId < 1 || genderId > 5) {
    return UNKNOWN_U8;
  }
  return genderId;
}

/**
 * Encode basics config into contract-ready values
 */
export function encodeBasics(config: BasicsConfig): EncodedBasics {
  return {
    claimedAge: validateAge(config.age),
    genderId: validateGenderId(config.genderId),
    desiredMask: createDesiredMask(config.desiredGenders),
    shareAge: config.shareAge,
    shareGender: config.shareGender,
  };
}

// ============ UI HELPERS ============

/**
 * Create basics config from UI state
 *
 * @param age - User's age
 * @param genderId - User's gender identity
 * @param wantsMen - Wants to match with men
 * @param wantsWomen - Wants to match with women
 * @param wantsNb - Wants to match with non-binary
 * @param shareAge - Share age bucket on match
 * @param shareGender - Share gender on match
 */
export function createBasicsFromUI(
  age: number,
  genderId: GenderIdentity,
  wantsMen: boolean,
  wantsWomen: boolean,
  wantsNb: boolean,
  shareAge: boolean = true,
  shareGender: boolean = true
): BasicsConfig {
  const desiredGenders: GenderBucket[] = [];
  if (wantsMen) desiredGenders.push(GenderBucket.MEN);
  if (wantsWomen) desiredGenders.push(GenderBucket.WOMEN);
  if (wantsNb) desiredGenders.push(GenderBucket.NB);

  // Default to everyone if nothing selected
  if (desiredGenders.length === 0) {
    desiredGenders.push(GenderBucket.MEN, GenderBucket.WOMEN, GenderBucket.NB);
  }

  return {
    age,
    genderId,
    desiredGenders,
    shareAge,
    shareGender,
  };
}

// ============ DECODING (for shared values) ============

/**
 * Decode age bucket start to human-readable range
 * Age is shared as 5-year bucket start: 18, 23, 28, 33, ...
 */
export function decodeAgeBucket(bucketStart: number): string {
  if (bucketStart === UNKNOWN_U8) return 'Hidden';
  const bucketEnd = bucketStart + 4;
  return `${bucketStart}-${bucketEnd}`;
}

/**
 * Decode gender ID to human-readable label
 */
export function decodeGenderId(genderId: number): string {
  switch (genderId) {
    case G_MAN: return 'Man';
    case G_WOMAN: return 'Woman';
    case G_TRANS_MAN: return 'Trans man';
    case G_TRANS_WOMAN: return 'Trans woman';
    case G_NON_BINARY: return 'Non-binary';
    default: return 'Hidden';
  }
}

// ============ LABELS (for UI) ============

export const GENDER_LABELS: Record<number, string> = {
  [GenderIdentity.MAN]: 'Man',
  [GenderIdentity.WOMAN]: 'Woman',
  [GenderIdentity.TRANS_MAN]: 'Trans man',
  [GenderIdentity.TRANS_WOMAN]: 'Trans woman',
  [GenderIdentity.NON_BINARY]: 'Non-binary',
  [GenderIdentity.UNKNOWN]: 'Not specified',
};

export const DESIRED_GENDER_LABELS: Record<number, string> = {
  [GenderBucket.MEN]: 'Men',
  [GenderBucket.WOMEN]: 'Women',
  [GenderBucket.NB]: 'Non-binary people',
};

// ============ DIRECTORY V2 HELPERS ============

/**
 * Age bucket encoding for DirectoryV2 (public)
 * 0=unset, 1=18-24, 2=25-29, 3=30-34, 4=35-39, 5=40-49, 6=50+
 */
export function ageToPublicBucket(age: number): number {
  if (age < 18) return 0;
  if (age <= 24) return 1;
  if (age <= 29) return 2;
  if (age <= 34) return 3;
  if (age <= 39) return 4;
  if (age <= 49) return 5;
  return 6; // 50+
}

export const AGE_BUCKET_LABELS: Record<number, string> = {
  0: 'Not specified',
  1: '18-24',
  2: '25-29',
  3: '30-34',
  4: '35-39',
  5: '40-49',
  6: '50+',
};

export const VERIFIED_LEVEL_LABELS: Record<number, string> = {
  0: 'Not verified',
  1: 'Email verified',
  2: 'Phone verified',
  3: 'Passport verified',
};
