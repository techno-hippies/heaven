import { test, expect, describe } from "bun:test";
import {
  ATTR,
  UNKNOWN_CATEGORICAL,
  UNKNOWN_NUMERIC,
  UNKNOWN_BIT,
  WILDCARD_MASK,
  BiologicalSex,
  Kids,
  Religion,
  validateCategorical,
  validateNumeric,
  createMask,
  createPrefMask,
  encodeAttribute,
  encodeProfile,
  isNumericAttr,
} from "./encoding";

describe("Constants", () => {
  test("UNKNOWN_CATEGORICAL should be 15", () => {
    expect(UNKNOWN_CATEGORICAL).toBe(15);
  });

  test("UNKNOWN_NUMERIC should be 255", () => {
    expect(UNKNOWN_NUMERIC).toBe(255);
  });

  test("UNKNOWN_BIT should be 0x8000", () => {
    expect(UNKNOWN_BIT).toBe(0x8000);
    expect(UNKNOWN_BIT).toBe(1 << 15);
  });

  test("WILDCARD_MASK should be 0xFFFF", () => {
    expect(WILDCARD_MASK).toBe(0xFFFF);
  });
});

describe("isNumericAttr", () => {
  test("EXACT_AGE should be numeric", () => {
    expect(isNumericAttr(ATTR.EXACT_AGE)).toBe(true);
  });

  test("KINK_LEVEL should be numeric", () => {
    expect(isNumericAttr(ATTR.KINK_LEVEL)).toBe(true);
  });

  test("BIOLOGICAL_SEX should be categorical", () => {
    expect(isNumericAttr(ATTR.BIOLOGICAL_SEX)).toBe(false);
  });

  test("RELIGION should be categorical", () => {
    expect(isNumericAttr(ATTR.RELIGION)).toBe(false);
  });
});

describe("validateCategorical", () => {
  test("null should return UNKNOWN_CATEGORICAL", () => {
    expect(validateCategorical(null)).toBe(UNKNOWN_CATEGORICAL);
  });

  test("undefined should return UNKNOWN_CATEGORICAL", () => {
    expect(validateCategorical(undefined)).toBe(UNKNOWN_CATEGORICAL);
  });

  test("0 (UNSPECIFIED) should map to UNKNOWN_CATEGORICAL", () => {
    expect(validateCategorical(0)).toBe(UNKNOWN_CATEGORICAL);
  });

  test("valid values 1-14 should pass through", () => {
    expect(validateCategorical(1)).toBe(1);
    expect(validateCategorical(7)).toBe(7);
    expect(validateCategorical(14)).toBe(14);
  });

  test("values > 14 should throw", () => {
    expect(() => validateCategorical(16)).toThrow();
  });

  test("negative values should throw", () => {
    expect(() => validateCategorical(-1)).toThrow();
  });
});

describe("validateNumeric", () => {
  test("null should return UNKNOWN_NUMERIC", () => {
    expect(validateNumeric(null)).toBe(UNKNOWN_NUMERIC);
  });

  test("undefined should return UNKNOWN_NUMERIC", () => {
    expect(validateNumeric(undefined)).toBe(UNKNOWN_NUMERIC);
  });

  test("0 should map to UNKNOWN_NUMERIC", () => {
    expect(validateNumeric(0)).toBe(UNKNOWN_NUMERIC);
  });

  test("valid values 1-254 should pass through", () => {
    expect(validateNumeric(1)).toBe(1);
    expect(validateNumeric(18)).toBe(18);
    expect(validateNumeric(100)).toBe(100);
    expect(validateNumeric(254)).toBe(254);
  });

  test("values > 254 should throw", () => {
    expect(() => validateNumeric(256)).toThrow();
  });

  test("negative values should throw", () => {
    expect(() => validateNumeric(-1)).toThrow();
  });
});

describe("createMask", () => {
  test("empty array should return 0", () => {
    expect(createMask([])).toBe(0);
  });

  test("single value should set correct bit", () => {
    expect(createMask([0])).toBe(1);
    expect(createMask([1])).toBe(2);
    expect(createMask([3])).toBe(8);
    expect(createMask([15])).toBe(0x8000);
  });

  test("multiple values should OR bits", () => {
    expect(createMask([0, 1])).toBe(3);
    expect(createMask([0, 1, 2])).toBe(7);
    expect(createMask([3, 4])).toBe(0b11000);
  });
});

describe("createPrefMask", () => {
  test("NONE policy should return WILDCARD_MASK", () => {
    expect(createPrefMask([1, 2, 3], "NONE", "STRICT")).toBe(WILDCARD_MASK);
  });

  test("DEALBREAKER with STRICT should not include bit 15", () => {
    const mask = createPrefMask([1, 2], "DEALBREAKER", "STRICT");
    expect(mask & UNKNOWN_BIT).toBe(0);
    expect(mask).toBe(0b110); // bits 1 and 2
  });

  test("DEALBREAKER with LENIENT should include bit 15", () => {
    const mask = createPrefMask([1, 2], "DEALBREAKER", "LENIENT");
    expect(mask & UNKNOWN_BIT).toBe(UNKNOWN_BIT);
    expect(mask).toBe(0b110 | UNKNOWN_BIT);
  });

  test("CRITERIA behaves same as DEALBREAKER for mask", () => {
    const maskStrict = createPrefMask([3], "CRITERIA", "STRICT");
    expect(maskStrict).toBe(8);

    const maskLenient = createPrefMask([3], "CRITERIA", "LENIENT");
    expect(maskLenient).toBe(8 | UNKNOWN_BIT);
  });
});

describe("encodeAttribute - numeric", () => {
  test("NONE policy should have WILDCARD prefMask", () => {
    const result = encodeAttribute(ATTR.EXACT_AGE, {
      value: 30,
      policy: "NONE",
      unknownHandling: "LENIENT",
    });

    expect(result.value).toBe(30);
    expect(result.prefMask).toBe(WILDCARD_MASK);
    expect(result.prefMin).toBe(0);
    expect(result.prefMax).toBe(254);
    expect(result.revealFlag).toBe(false);
  });

  test("CRITERIA with range should preserve range and set UNKNOWN_BIT for LENIENT", () => {
    const result = encodeAttribute(ATTR.EXACT_AGE, {
      value: 30,
      policy: "CRITERIA",
      unknownHandling: "LENIENT",
      prefMin: 25,
      prefMax: 35,
    });

    expect(result.value).toBe(30);
    expect(result.prefMin).toBe(25);
    expect(result.prefMax).toBe(35); // NOT 255 - range is preserved
    expect(result.prefMask).toBe(UNKNOWN_BIT); // LENIENT = bit 15 set
    expect(result.revealFlag).toBe(true);
  });

  test("DEALBREAKER with range STRICT should not have UNKNOWN_BIT", () => {
    const result = encodeAttribute(ATTR.EXACT_AGE, {
      value: 30,
      policy: "DEALBREAKER",
      unknownHandling: "STRICT",
      prefMin: 25,
      prefMax: 35,
    });

    expect(result.prefMin).toBe(25);
    expect(result.prefMax).toBe(35);
    expect(result.prefMask).toBe(0); // STRICT = no UNKNOWN_BIT
    expect(result.revealFlag).toBe(false);
  });

  test("value 0 should map to UNKNOWN_NUMERIC", () => {
    const result = encodeAttribute(ATTR.EXACT_AGE, {
      value: 0,
      policy: "NONE",
      unknownHandling: "LENIENT",
    });

    expect(result.value).toBe(UNKNOWN_NUMERIC);
  });
});

describe("encodeAttribute - categorical", () => {
  test("NONE policy should have WILDCARD prefMask", () => {
    const result = encodeAttribute(ATTR.RELIGION, {
      value: Religion.CHRISTIAN,
      policy: "NONE",
      unknownHandling: "LENIENT",
    });

    expect(result.value).toBe(3); // CHRISTIAN
    expect(result.prefMask).toBe(WILDCARD_MASK);
    expect(result.revealFlag).toBe(false);
  });

  test("DEALBREAKER should create mask from accepted values", () => {
    const result = encodeAttribute(ATTR.RELIGION, {
      value: Religion.CHRISTIAN,
      policy: "DEALBREAKER",
      unknownHandling: "STRICT",
      acceptedValues: [Religion.CHRISTIAN, Religion.SPIRITUAL],
    });

    expect(result.value).toBe(3);
    expect(result.prefMask).toBe((1 << 3) | (1 << 2)); // CHRISTIAN=3, SPIRITUAL=2
    expect(result.revealFlag).toBe(false);
  });

  test("CRITERIA LENIENT should include UNKNOWN bit", () => {
    const result = encodeAttribute(ATTR.KIDS, {
      value: Kids.DONT_HAVE_WANT,
      policy: "CRITERIA",
      unknownHandling: "LENIENT",
      acceptedValues: [Kids.DONT_HAVE_WANT, Kids.DONT_HAVE_OPEN],
    });

    expect(result.prefMask & UNKNOWN_BIT).toBe(UNKNOWN_BIT);
    expect(result.revealFlag).toBe(true);
  });

  test("value 0 (UNSPECIFIED) should map to UNKNOWN_CATEGORICAL", () => {
    const result = encodeAttribute(ATTR.RELIGION, {
      value: Religion.UNSPECIFIED, // 0
      policy: "NONE",
      unknownHandling: "LENIENT",
    });

    expect(result.value).toBe(UNKNOWN_CATEGORICAL);
  });
});

describe("encodeProfile", () => {
  test("empty config should use defaults", () => {
    const result = encodeProfile({});

    expect(result.values.length).toBe(12);
    expect(result.prefMasks.length).toBe(12);
    expect(result.prefMins.length).toBe(12);
    expect(result.prefMaxs.length).toBe(12);
    expect(result.revealFlags.length).toBe(12);

    // Numeric attrs should have UNKNOWN_NUMERIC
    expect(result.values[ATTR.EXACT_AGE]).toBe(UNKNOWN_NUMERIC);
    expect(result.values[ATTR.KINK_LEVEL]).toBe(UNKNOWN_NUMERIC);

    // Categorical attrs should have UNKNOWN_CATEGORICAL
    expect(result.values[ATTR.BIOLOGICAL_SEX]).toBe(UNKNOWN_CATEGORICAL);
    expect(result.values[ATTR.RELIGION]).toBe(UNKNOWN_CATEGORICAL);

    // All should have WILDCARD pref masks
    for (let i = 0; i < 12; i++) {
      expect(result.prefMasks[i]).toBe(WILDCARD_MASK);
    }

    // Numeric maxs should be 254 (WILDCARD)
    expect(result.prefMaxs[ATTR.EXACT_AGE]).toBe(254);
    expect(result.prefMaxs[ATTR.KINK_LEVEL]).toBe(254);
  });

  test("partial config should fill missing with defaults", () => {
    const result = encodeProfile({
      [ATTR.EXACT_AGE]: {
        value: 29,
        policy: "CRITERIA",
        unknownHandling: "STRICT",
        prefMin: 25,
        prefMax: 35,
      },
    });

    expect(result.values[ATTR.EXACT_AGE]).toBe(29);
    expect(result.prefMins[ATTR.EXACT_AGE]).toBe(25);
    expect(result.prefMaxs[ATTR.EXACT_AGE]).toBe(35);
    expect(result.revealFlags[ATTR.EXACT_AGE]).toBe(true);

    // Other attrs should be defaults
    expect(result.values[ATTR.RELIGION]).toBe(UNKNOWN_CATEGORICAL);
    expect(result.prefMasks[ATTR.RELIGION]).toBe(WILDCARD_MASK);
  });
});

describe("Integration - True Secret Dealbreaker", () => {
  test("religion DEALBREAKER should have mask without UNKNOWN and revealFlag=false", () => {
    const result = encodeProfile({
      [ATTR.RELIGION]: {
        value: Religion.CHRISTIAN,
        policy: "DEALBREAKER",
        unknownHandling: "STRICT",
        acceptedValues: [Religion.CHRISTIAN],
      },
    });

    // Value is set
    expect(result.values[ATTR.RELIGION]).toBe(3);

    // Mask only accepts CHRISTIAN (bit 3), no UNKNOWN
    expect(result.prefMasks[ATTR.RELIGION]).toBe(1 << 3);
    expect(result.prefMasks[ATTR.RELIGION] & UNKNOWN_BIT).toBe(0);

    // revealFlag is false (DEALBREAKER = never reveal)
    expect(result.revealFlags[ATTR.RELIGION]).toBe(false);
  });

  test("kink CRITERIA should have range with LENIENT and revealFlag=true", () => {
    const result = encodeProfile({
      [ATTR.KINK_LEVEL]: {
        value: 4,
        policy: "CRITERIA",
        unknownHandling: "LENIENT",
        prefMin: 3,
        prefMax: 7,
      },
    });

    // Value is set
    expect(result.values[ATTR.KINK_LEVEL]).toBe(4);

    // Range is preserved (not mutated for LENIENT)
    expect(result.prefMins[ATTR.KINK_LEVEL]).toBe(3);
    expect(result.prefMaxs[ATTR.KINK_LEVEL]).toBe(7);

    // UNKNOWN_BIT set for LENIENT
    expect(result.prefMasks[ATTR.KINK_LEVEL]).toBe(UNKNOWN_BIT);

    // revealFlag is true (CRITERIA = reveal on match)
    expect(result.revealFlags[ATTR.KINK_LEVEL]).toBe(true);
  });
});
