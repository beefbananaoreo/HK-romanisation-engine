import assert from "node:assert/strict";
import test from "node:test";

import {
  knownStatusValues,
  matchesDocumentTagCondition,
  matchesBasicLatinStoreKey,
  materialiseProcessOptionsPreimage,
  materialiseProjectionDiagnostics,
  materialiseStoreDraftDefaults,
  normaliseDocumentTags,
  readConsumerEnum,
  stableJsonStringify,
  validateAnalysisStructure,
  validateAnnotationProjectionConsistency,
  validateAnnotationRef,
  validateCanonicalValue,
  validateDocumentContextSemantics,
  validateEngineCreationResult,
  validateEnglishForm,
  validateInheritanceRef,
  validateLattice,
  validateProjectionConsistency,
  validateProviderSnapshotShape,
  validateReadingAlignment,
  validateRomanisation,
  validateStoreEntryEvidence,
  validateStoreImportEnvelope,
  validateStoredEnglishFormMapping,
  validateTranslationDirectivesShape,
  validateUserDataVersion,
  validateUserDataVersionTransition,
  validateVersions,
  commitUserDataVersion,
  isValidUserDataVersion,
  MAX_USER_DATA_VERSION,
  validateValueEnvelope,
  type ValidationResult,
} from "../src/validators.js";

const SOURCE_HASH = "c".repeat(64);

function assertValid(result: ValidationResult): void {
  assert.equal(result.ok, true, JSON.stringify(result.issues, null, 2));
  assert.deepEqual(result.issues, []);
}

function assertIssue(result: ValidationResult, code: string): void {
  assert.equal(result.ok, false, `Expected ${code}, got ${JSON.stringify(result.issues, null, 2)}`);
  assert.ok(result.issues.some((issue) => issue.code === code), JSON.stringify(result.issues, null, 2));
}

function candidate(
  value: unknown,
  options: { rank?: number; externalAttestation?: string; provenance?: string } = {},
): Record<string, unknown> {
  const result: Record<string, unknown> = {
    value,
    provenance: options.provenance ?? "convention_table",
    evidenceClass: "E6",
    externalAttestation: options.externalAttestation ?? "not_attested",
    cautions: [],
  };
  if (options.rank !== undefined) result.rank = options.rank;
  return result;
}

function envelope(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    value: { formKind: "romanisation", assembled: false, text: "Lee" },
    status: "resolved",
    provenance: "user_glossary",
    confidence: "high",
    evidenceClass: "E1a",
    externalAttestation: "not_attested",
    alternatives: [],
    ranked: false,
    cautions: [],
    ...overrides,
  };
}

function readingValue(span: [number, number]): Record<string, unknown> {
  return {
    jyutping: "aa1",
    syllables: [{
      span,
      jyutping: "aa1",
      initial: "",
      final: "aa",
      tone: 1,
      syllabic: false,
      align: "exact",
    }],
    alignmentGroups: [],
  };
}

function readingEnvelope(span: [number, number]): Record<string, unknown> {
  return envelope({
    value: readingValue(span),
    provenance: "lexicon",
    evidenceClass: "E5",
    externalAttestation: "not_applicable",
  });
}

function romanisationEnvelope(text: string): Record<string, unknown> {
  return envelope({
    value: { formKind: "romanisation", assembled: false, text },
    provenance: "convention_table",
    confidence: "medium",
    evidenceClass: "E6",
  });
}

function englishEnvelope(text: string): Record<string, unknown> {
  return envelope({
    value: { formKind: "romanisation", assembled: false, text },
    provenance: "convention_table",
    confidence: "medium",
    evidenceClass: "E6",
  });
}

function englishRomanisedUnit(
  id: string,
  span: [number, number],
  role: "surname" | "given" | "prefix" | "specific" | "generic",
  text: string,
  generated: boolean,
): Record<string, unknown> {
  return {
    id,
    span,
    kind: "romanised",
    role,
    text,
    syllable: text.toLowerCase(),
    generated,
    provenance: "convention_table",
    evidenceClass: "E6",
    externalAttestation: "not_attested",
  };
}

function englishLiteralUnit(
  id: string,
  span: [number, number],
  role: "western_given" | "surname" | "given" | "prefix" | "specific" | "generic",
  text: string,
): Record<string, unknown> {
  return {
    id,
    span,
    kind: "literal",
    role,
    text,
    provenance: "none",
    evidenceClass: null,
    externalAttestation: "not_applicable",
  };
}

function memoryRomanisedUnit(
  role: "surname" | "given" | "prefix" | "specific" | "generic",
  text: string,
  generated: boolean,
): Record<string, unknown> {
  return {
    kind: "romanised",
    role,
    text,
    syllable: text.toLowerCase(),
    generated,
    provenance: "convention_table",
    evidenceClass: "E6",
    externalAttestation: "not_attested",
  };
}

function validStore(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: "store-1",
    store: "pronunciation",
    key: "香港",
    value: "hoeng1 gong2",
    entryScope: "lexical",
    caseSensitive: false,
    match: "exact",
    enabled: true,
    evidenceClass: "E1a",
    externalAttestation: "not_applicable",
    attestation: null,
    validation: { ok: true, errors: [] },
    revision: 1,
    ...overrides,
  };
}

function analysisFixture(source = "AB"): Record<string, unknown> {
  return {
    schemaVersion: "1.0",
    source,
    offsetUnit: "utf16",
    sourceHash: SOURCE_HASH,
    versions: {
      schemaVersion: "1.0",
      contractVersion: "5.0.16",
      providerSnapshotId: null,
      engineVersion: "1.0.0",
      lexiconVersion: "lex-1",
      rulesVersion: "rules-1",
      segmenterVersion: "segmenter-1",
      userDataVersion: 0,
    },
    optionsHash: "options-hash",
    documentContextUsed: false,
    tokens: [
      {
        id: "t0",
        span: [0, 1],
        text: source.slice(0, 1),
        type: "latin",
        reading: readingEnvelope([0, 1]),
        romanisation: romanisationEnvelope("A"),
      },
      {
        id: "t1",
        span: [1, source.length],
        text: source.slice(1),
        type: "latin",
        reading: readingEnvelope([1, source.length]),
        romanisation: romanisationEnvelope("B"),
      },
    ],
    entities: [{
      id: "e0",
      span: [0, source.length],
      text: source,
      type: "other",
      primary: true,
      englishFallbackPolicy: "romanisation_allowed",
      detectionEvidence: [],
      detectionConfidence: "medium",
      reading: readingEnvelope([0, source.length]),
      romanisation: romanisationEnvelope("AB"),
      englishForm: englishEnvelope("AB"),
    }],
    regions: [],
    termResolutions: [],
    diagnostics: [],
  };
}

test("Validator issue paths preserve the root through nested validation", () => {
  const analysis = analysisFixture();
  const versions = analysis.versions as Record<string, unknown>;
  versions.userDataVersion = -1;
  assert.equal(validateVersions(versions).issues[0]?.path, "$.userDataVersion");
  assert.equal(validateAnalysisStructure(analysis).issues[0]?.path, "$.versions.userDataVersion");
  assert.equal(validateUserDataVersionTransition(-1, 0, false, false).issues[0]?.path, "$.before");

  versions.userDataVersion = 0;
  const form = {
    formKind: "romanisation", assembled: true, person: false,
    units: [englishRomanisedUnit("u0", [0, 1], "specific", "a", true)],
    grouping: [[1]],
  };
  assert.equal(validateEnglishForm(form).issues[0]?.path, "$.grouping[0][0]");
  (analysis.entities as Array<Record<string, unknown>>)[0]!.englishForm = envelope({ value: form });
  assert.equal(validateAnalysisStructure(analysis).issues[0]?.path, "$.entities[0].englishForm.value.grouping[0][0]");
});

test("T-API-050/051/054: userDataVersion has one exact bounded public number domain", () => {
  for (const legal of [0, 1, MAX_USER_DATA_VERSION - 1, MAX_USER_DATA_VERSION]) {
    assert.equal(isValidUserDataVersion(legal), true);
    assertValid(validateUserDataVersion(legal));
  }
  for (const illegal of [-1, 0.5, MAX_USER_DATA_VERSION + 1, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, 1n, "1", { __int: "1" }]) {
    assert.equal(isValidUserDataVersion(illegal), false);
    assertIssue(validateUserDataVersion(illegal), "USER_DATA_VERSION_DOMAIN");
  }
  const validVersions = {
    schemaVersion: "1.0", contractVersion: "5.0.16", providerSnapshotId: null,
    engineVersion: "engine", lexiconVersion: "lexicon", rulesVersion: "rules", segmenterVersion: "segmenter",
    userDataVersion: MAX_USER_DATA_VERSION,
  };
  assertValid(validateVersions(validVersions));
  assertIssue(validateVersions({ ...validVersions, contractVersion: "5.0.12" }), "VERSIONS_CONTRACT");
  assertIssue(validateVersions({ ...validVersions, userDataVersion: 0.25 }), "USER_DATA_VERSION_DOMAIN");
});

test("T-API-052/053 and T-CACHE-035: transaction-counted lifecycle is global, no-op safe and atomically bounded", () => {
  type Store = "pronunciation" | "translation" | "hk_romanisation";
  type Operation = "create" | "update" | "remove" | "enable-disable" | "import-apply" | "read" | "list" | "get" | "search" | "export" | "preview" | "noop" | "failed" | "rollback";
  const state = {
    userDataVersion: 0,
    records: new Map<string, { revision: number; updatedAt: string }>(),
  };
  const transact = (store: Store, operation: Operation, changesPersistentState: boolean, committed = true, rowCount = 1): { ok: boolean; before: number; after: number } => {
    const before = state.userDataVersion;
    const beforeRecords = structuredClone([...state.records.entries()]);
    const transition = commitUserDataVersion(before, changesPersistentState);
    const canCommit = transition.ok && committed;
    if (canCommit && changesPersistentState) {
      state.userDataVersion = transition.userDataVersion;
      for (let row = 0; row < rowCount; row += 1) {
        state.records.set(`${store}:${operation}:${row}`, { revision: row + 1, updatedAt: "2026-08-29T00:00:00Z" });
      }
    }
    if (!canCommit) {
      assert.deepEqual([...state.records.entries()], beforeRecords, `${operation} must not partially mutate records`);
    }
    return { ok: canCommit, before, after: state.userDataVersion };
  };

  assert.equal(state.userDataVersion, 0, "new Store-set namespace starts at zero");
  for (const [store, operation] of [
    ["pronunciation", "create"], ["translation", "update"], ["hk_romanisation", "remove"], ["pronunciation", "enable-disable"],
  ] as const) {
    const beforeVersion: number = state.userDataVersion;
    const result = transact(store, operation, true);
    assert.equal(result.ok, true);
    assert.equal(result.after, beforeVersion + 1, `${store}/${operation} increments the one global counter exactly once`);
  }
  const beforeImport = state.userDataVersion;
  const importResult = transact("translation", "import-apply", true, true, 3);
  assert.equal(importResult.after, beforeImport + 1, "multi-row import is one transaction increment");
  const beforeNoWriteImport = state.userDataVersion;
  const noWriteImport = transact("translation", "import-apply", false, true, 0);
  assert.equal(noWriteImport.after, beforeNoWriteImport, "writesApplied:false import does not increment");

  const unchanged = state.userDataVersion;
  for (const [store, operation] of [
    ["pronunciation", "read"], ["translation", "list"], ["hk_romanisation", "get"], ["pronunciation", "search"],
    ["translation", "export"], ["hk_romanisation", "preview"], ["pronunciation", "noop"], ["translation", "failed"], ["hk_romanisation", "rollback"],
  ] as const) {
    const result = transact(store, operation, false, operation !== "failed" && operation !== "rollback");
    assert.equal(result.ok, operation !== "failed" && operation !== "rollback", `${store}/${operation} outcome is reflected without a write`);
    assert.equal(result.after, unchanged, `${store}/${operation} does not increment`);
  }
  assert.equal(validateUserDataVersionTransition(1, 2, true, true).ok, true);
  assert.equal(validateUserDataVersionTransition(2, 2, false, true).ok, true);
  assert.equal(validateUserDataVersionTransition(2, 2, true, false).ok, true);

  state.userDataVersion = MAX_USER_DATA_VERSION;
  const beforeOverflow = structuredClone({ version: state.userDataVersion, records: [...state.records.entries()] });
  const overflow = transact("pronunciation", "create", true);
  assert.equal(overflow.ok, false, "maximum mutation fails operationally");
  assert.deepEqual({ version: state.userDataVersion, records: [...state.records.entries()] }, beforeOverflow, "maximum overflow is atomic before records/revisions/timestamps/version");
  assert.deepEqual(commitUserDataVersion(MAX_USER_DATA_VERSION, true), { ok: false, userDataVersion: MAX_USER_DATA_VERSION, reason: "overflow" });
  assertIssue(validateUserDataVersionTransition(MAX_USER_DATA_VERSION, MAX_USER_DATA_VERSION, true, true), "USER_DATA_VERSION_OVERFLOW");
});

/** Branch-aware structural fixture renderer; production rendering is outside Range 0A. */
function renderRomanisationFixture(form: unknown): string {
  if (typeof form !== "object" || form === null || Array.isArray(form)) throw new TypeError("Romanisation fixture must be an object");
  const value = form as Record<string, unknown>;
  if (value.assembled === false) {
    if (typeof value.text !== "string") throw new TypeError("Verbatim fixture requires text");
    return value.text;
  }
  if (value.assembled !== true || !Array.isArray(value.units) || !Array.isArray(value.grouping)) {
    throw new TypeError("Assembled fixture requires units and grouping");
  }
  const units = value.units;
  const grouping = value.grouping;
  return grouping.map((rawGroup) => {
    if (!Array.isArray(rawGroup)) throw new TypeError("Fixture group must be an array");
    return rawGroup.map((rawIndex) => {
      if (!Number.isInteger(rawIndex)) throw new TypeError("Fixture index must be an integer");
      const unit = units[Number(rawIndex)];
      if (typeof unit !== "object" || unit === null || Array.isArray(unit)
          || typeof (unit as Record<string, unknown>).text !== "string") {
        throw new TypeError("Fixture index must resolve to a text unit");
      }
      const text = (unit as Record<string, unknown>).text as string;
      return text.length === 0 ? text : `${text[0]!.toUpperCase()}${text.slice(1)}`;
    }).join("");
  }).join(" ");
}

test("T-API-001..003: all seven status/value envelopes are executable", () => {
  const legal = [
    envelope(),
    envelope({ status: "fallback", provenance: "rule_engine", confidence: "low", evidenceClass: "E7" }),
    envelope({
      value: null,
      status: "ambiguous",
      confidence: "none",
      alternatives: [candidate("Choi", { rank: 0 }), candidate("Choy", { rank: 1 })],
      ranked: true,
    }),
    envelope({
      value: null,
      status: "conflict",
      confidence: "none",
      alternatives: [candidate("A"), candidate("B")],
      ranked: false,
    }),
    envelope({ value: null, status: "unresolved", confidence: "none", ranked: false, reason: "reading_not_found" }),
    envelope({ value: null, status: "unsupported", confidence: "none", alternatives: [], ranked: false, reason: "unsupported_code_point" }),
    envelope({ value: null, status: "out_of_scope", confidence: "none", alternatives: [], ranked: false }),
  ];

  legal.forEach((value) => assertValid(validateValueEnvelope(value)));
});

test("T-API-001: status matrix rejects null/absence, cardinality, rank, reason and confidence violations", () => {
  const illegal: Array<[Record<string, unknown>, string]> = [
    [envelope({ value: null }), "STATUS_VALUE_NON_NULL"],
    [envelope({ status: "fallback", value: null, confidence: "low" }), "STATUS_VALUE_NON_NULL"],
    [envelope({ value: {}, status: "ambiguous", confidence: "none", alternatives: [candidate("A", { rank: 0 }), candidate("B", { rank: 1 })], ranked: true }), "STATUS_VALUE_NULL"],
    [envelope({ value: null, status: "ambiguous", confidence: "none", alternatives: [candidate("A", { rank: 0 })], ranked: true }), "STATUS_ALTERNATIVES_MIN"],
    [envelope({ value: null, status: "ambiguous", confidence: "none", alternatives: [candidate("A"), candidate("B")], ranked: false }), "STATUS_RANKED_TRUE"],
    [envelope({ value: null, status: "conflict", confidence: "none", alternatives: [candidate("A", { rank: 0 }), candidate("B", { rank: 1 })], ranked: true }), "STATUS_RANKED_FALSE"],
    [envelope({ value: null, status: "unresolved", confidence: "none" }), "STATUS_REASON_REQUIRED"],
    [envelope({ value: null, status: "unsupported", confidence: "none", alternatives: [candidate("A")], reason: "malformed_input" }), "STATUS_ALTERNATIVES_EMPTY"],
    [envelope({ value: null, status: "out_of_scope", confidence: "none", reason: "reading_not_found" }), "STATUS_REASON_ABSENT"],
    [envelope({ value: null, status: "conflict", confidence: "low", alternatives: [candidate("A"), candidate("B")] }), "STATUS_CONFIDENCE_NONE"],
  ];

  for (const [value, code] of illegal) assertIssue(validateValueEnvelope(value), code);

  const absentValue = envelope();
  delete absentValue.value;
  assertIssue(validateValueEnvelope(absentValue), "VALUE_REQUIRED");
  assertIssue(validateValueEnvelope(envelope({ reason: null })), "STATUS_REASON_ABSENT");
});

test("T-API-019 and RULE-API-24: candidate ranks, evidence, support and inheritance remain candidate-local", () => {
  const ranked = envelope({
    value: null,
    status: "ambiguous",
    confidence: "none",
    alternatives: [
      candidate("A", { rank: 0 }),
      {
        ...candidate("B", { rank: 1, provenance: "inherited" }),
        inheritedFrom: { kind: "analysis", entityId: "e0" },
        support: "medium",
        attestationCount: 2,
      },
    ],
    ranked: true,
  });
  assertValid(validateValueEnvelope(ranked));

  const missingRank = structuredClone(ranked);
  delete (missingRank.alternatives as Array<Record<string, unknown>>)[0]?.rank;
  assertIssue(validateValueEnvelope(missingRank), "CANDIDATE_RANK_APPLICABILITY");

  const selectedInherited = envelope({
    provenance: "inherited",
    confidence: "medium",
    inheritedFrom: { kind: "documentContext", contextId: "ctx", ref: "m0" },
  });
  assertValid(validateValueEnvelope(selectedInherited));
  assertIssue(validateValueEnvelope(envelope({ provenance: "inherited" })), "VALUE_INHERITANCE_REQUIRED");
  assertIssue(validateValueEnvelope(envelope({ inheritedFrom: { kind: "analysis", entityId: "e0" } })), "VALUE_INHERITANCE_FORBIDDEN");
  assertIssue(validateValueEnvelope(envelope({ derivedFrom: { romanisationRef: {} } }), { layer: "L3R" }), "DERIVED_FROM_LAYER");

  const highSupport = structuredClone(ranked);
  (highSupport.alternatives as Array<Record<string, unknown>>)[0]!.support = "high";
  assertIssue(validateValueEnvelope(highSupport), "CANDIDATE_SUPPORT_CAP");
});

test("§5.5 CandidateBase variation is restricted to L2 Reading candidates", () => {
  const l2 = envelope({
    value: null,
    status: "ambiguous",
    provenance: "none",
    confidence: "none",
    evidenceClass: null,
    externalAttestation: "not_applicable",
    alternatives: [
      candidate(readingValue([0, 1]), { rank: 0, provenance: "lexicon", externalAttestation: "not_applicable" }),
      candidate(readingValue([0, 1]), { rank: 1, provenance: "convention_table", externalAttestation: "not_applicable" }),
    ],
    ranked: true,
  });
  (l2.alternatives as Array<Record<string, unknown>>).forEach((item) => { item.variation = "sandhi"; });
  assertValid(validateValueEnvelope(l2, { layer: "L2" }));

  const l3r = envelope({
    value: null,
    status: "ambiguous",
    provenance: "none",
    confidence: "none",
    evidenceClass: null,
    alternatives: [candidate("Lee", { rank: 0 }), candidate("Li", { rank: 1 })],
    ranked: true,
  });
  (l3r.alternatives as Array<Record<string, unknown>>).forEach((item) => { item.variation = "sandhi"; });
  assertIssue(validateValueEnvelope(l3r, { layer: "L3R" }), "CANDIDATE_VARIATION_LAYER");
  assertIssue(validateValueEnvelope(structuredClone(l3r), { layer: "L3E" }), "CANDIDATE_VARIATION_LAYER");
  assertIssue(validateValueEnvelope(structuredClone(l3r), { layer: "L4" }), "CANDIDATE_VARIATION_LAYER");
});

test("T-API-020/021: ambiguity and equal-authority conflict retain candidate-local evidence", () => {
  const ambiguous = envelope({
    value: null,
    status: "ambiguous",
    provenance: "convention_table",
    confidence: "none",
    evidenceClass: "E6",
    alternatives: [
      { ...candidate("Choi", { rank: 0, externalAttestation: "attested" }), attestationCount: 12 },
      { ...candidate("Choy", { rank: 1, externalAttestation: "attested" }), attestationCount: 7 },
    ],
    ranked: true,
  });
  assertValid(validateValueEnvelope(ambiguous));

  const conflict = envelope({
    value: null,
    status: "conflict",
    provenance: "user_glossary",
    confidence: "none",
    evidenceClass: "E1a",
    alternatives: [
      { ...candidate("A", { provenance: "user_glossary" }), evidenceClass: "E1a" },
      { ...candidate("B", { provenance: "user_glossary" }), evidenceClass: "E1a" },
    ],
    ranked: false,
  });
  assertValid(validateValueEnvelope(conflict));
});

test("T-API-022 and §7.3: producer vocabulary, layer applicability and confidence gates are closed", () => {
  assertValid(validateValueEnvelope(envelope({ externalAttestation: "not_applicable" }), { layer: "L2" }));
  assertIssue(validateValueEnvelope(envelope(), { layer: "L2" }), "LAYER_ATTESTATION_APPLICABILITY");
  assertIssue(validateValueEnvelope(envelope({ provenance: "entity_record" }), { producer: true }), "VALUE_PROVENANCE");
  assertIssue(validateValueEnvelope(envelope({ provenance: "external" }), { producer: true }), "VALUE_PROVENANCE");
  assertValid(validateValueEnvelope(envelope({ provenance: "external" }), { producer: false }));
  assertIssue(validateValueEnvelope(envelope({ provenance: "rule_engine", confidence: "medium" })), "RULE_ENGINE_CONFIDENCE_CAP");
  assertIssue(validateValueEnvelope(envelope({ status: "fallback", confidence: "medium" })), "FALLBACK_CONFIDENCE_CAP");
  assertValid(validateValueEnvelope(envelope({ confidence: "low", evidenceClass: "E6", scopeDowngrade: "class_applied_to_individual" })));
  assertIssue(validateValueEnvelope(envelope({ confidence: "medium", evidenceClass: "E6", scopeDowngrade: "class_applied_to_individual" })), "SCOPE_DOWNGRADE_COUPLING");
});

test("T-API-016/017: verbatim and assembled EnglishForm discriminants are mutually exclusive", () => {
  for (const formKind of ["romanisation", "official_name", "native_original", "translation", "hybrid"]) {
    assertValid(validateEnglishForm({ formKind, assembled: false, text: "Exact text" }));
  }
  assertIssue(validateEnglishForm({ formKind: "romanisation", assembled: false, text: "x", units: [] }), "VERBATIM_FORBIDDEN_FIELD");
  assertIssue(validateEnglishForm({ formKind: "romanisation", assembled: true, text: "x", person: false, units: [englishRomanisedUnit("u0", [0, 1], "specific", "x", true)], grouping: [] }), "ASSEMBLED_TEXT_FORBIDDEN");
  assertIssue(validateEnglishForm({ formKind: "official_name", assembled: true, person: false, units: [englishRomanisedUnit("u0", [0, 1], "specific", "x", true)], grouping: [] }), "ASSEMBLED_FORM_KIND");
});

test("English assembly units require string text in Analysis and memory", () => {
  for (const memory of [false, true]) {
    for (const kind of ["romanised", "literal", "translated"]) {
      const romanised = englishRomanisedUnit("u0", [0, 1], "specific", "loeng", true);
      const unit = kind === "romanised"
        ? romanised
        : { ...englishLiteralUnit("u1", [1, 2], "generic", " Road "), kind };
      const units = kind === "romanised" ? [unit] : [romanised, unit];
      if (memory) {
        units.forEach((item) => { delete item.id; delete item.span; });
      }
      const form = {
        formKind: kind === "romanised" ? "romanisation" : "hybrid",
        assembled: true, person: false, units, grouping: [units.map((_, index) => index)],
      };
      assertValid(validateEnglishForm(form, { memory }));
      unit.text = "";
      assertValid(validateEnglishForm(form, { memory }));
      for (const invalidText of [undefined, null, 123, false, {}, []]) {
        unit.text = invalidText;
        const result = validateEnglishForm(form, { memory });
        assertIssue(result, "ENGLISH_UNIT_TEXT");
        assert.equal(result.issues.find((issue) => issue.code === "ENGLISH_UNIT_TEXT")?.path, `$.units[${units.length - 1}].text`);
      }
      delete unit.text;
      assertIssue(validateEnglishForm(form, { memory }), "ENGLISH_UNIT_TEXT");
      if (memory) {
        assertIssue(validateDocumentContextSemantics({
          contextFormatVersion: "1", id: "ctx",
          entities: [{ ref: "m0", text: "AB", type: "other", englishForm: {
            value: form, status: "resolved", provenance: "convention_table", confidence: "medium",
            evidenceClass: "E6", externalAttestation: "not_attested", cautions: [],
          } }],
        }), "ENGLISH_UNIT_TEXT");
      } else {
        const analysis = analysisFixture();
        (analysis.entities as Array<Record<string, unknown>>)[0]!.englishForm = envelope({ value: form });
        assertIssue(validateAnalysisStructure(analysis), "ENGLISH_UNIT_TEXT");
      }
    }
  }
});

test("T-API-016: Romanisation branches preserve verbatim text or structured units, never both", () => {
  assertValid(validateRomanisation({ formKind: "romanisation", assembled: false, text: "Cheung" }));
  const assembled = {
    formKind: "romanisation",
    assembled: true,
    units: [{
      id: "u0",
      span: [0, 1],
      text: "zoeng",
      syllable: "zoeng1",
      role: "surname",
      provenance: "convention_table",
      evidenceClass: "E6",
      externalAttestation: "not_attested",
    }],
    grouping: [[0]],
  };
  assertValid(validateRomanisation(assembled, [0, 1]));
  assertIssue(validateRomanisation({ ...assembled, text: "forbidden" }, [0, 1]), "ROMANISATION_ASSEMBLED_FIELD");
  assertIssue(validateRomanisation({ formKind: "romanisation", assembled: false, text: "x", units: [] }), "ROMANISATION_VERBATIM_FIELD");
  assertIssue(validateRomanisation({ ...assembled, units: [{ ...assembled.units[0], span: [0, 2] }] }, [0, 1]), "SPAN_BOUNDS");
  assertIssue(validateRomanisation({ ...assembled, grouping: [[Number.NaN]] }), "GROUPING_INDEX_DOMAIN");
});

test("T-API-055/G28: all grouping surfaces share the exact safe non-negative local-index domain", () => {
  const romanUnit = {
    id: "u0", span: [0, 1], text: "lei", syllable: "lei5", provenance: "rule_engine",
    evidenceClass: "E7", externalAttestation: "not_applicable",
  };
  const romanBase = { formKind: "romanisation", assembled: true, units: [romanUnit], grouping: [[0]] };
  assertValid(validateRomanisation(romanBase, [0, 1]));
  for (const invalid of [-1, 0.5, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.MAX_SAFE_INTEGER + 1, 1]) {
    assertIssue(validateRomanisation({ ...romanBase, grouping: [[invalid]] }, [0, 1]), "GROUPING_INDEX_DOMAIN");
  }

  const englishUnit = englishRomanisedUnit("u0", [0, 1], "given", "Lei", true);
  const englishBase = {
    formKind: "romanisation", assembled: true, person: true,
    units: [englishUnit], grouping: [[0]], styleApplicable: { scope: "givenName", unitIds: ["u0"] },
  };
  assertValid(validateEnglishForm(englishBase));
  assertIssue(validateEnglishForm({ ...englishBase, grouping: [[1]] }), "GROUPING_INDEX_DOMAIN");

  const memoryRomanUnit = { text: "lei", syllable: "lei5", role: "given", provenance: "rule_engine", evidenceClass: "E7", externalAttestation: "not_applicable" };
  const memoryRomanBase = { formKind: "romanisation", assembled: true, units: [memoryRomanUnit], grouping: [[0]] };
  const memoryRomanChannel = {
    value: memoryRomanBase, status: "resolved", provenance: "rule_engine", confidence: "low",
    evidenceClass: "E7", externalAttestation: "not_applicable", cautions: [],
  };
  assertValid(validateDocumentContextSemantics({
    contextFormatVersion: "1", id: "ctx", entities: [{ ref: "m0", text: "梁", type: "person", romanisation: memoryRomanChannel }],
  }));
  assertIssue(validateDocumentContextSemantics({
    contextFormatVersion: "1", id: "ctx", entities: [{ ref: "m0", text: "梁", type: "person", romanisation: { ...memoryRomanChannel, value: { ...memoryRomanBase, grouping: [[0.5]] } } }],
  }), "GROUPING_INDEX_DOMAIN");

  const memoryEnglishUnit = memoryRomanisedUnit("given", "Lei", true);
  const memoryEnglishBase = {
    formKind: "romanisation", assembled: true, person: true,
    units: [memoryEnglishUnit], grouping: [[0]], styleApplicable: { scope: "givenName", unitIndices: [0] },
  };
  assertValid(validateEnglishForm(memoryEnglishBase, { memory: true }));
  for (const invalid of [-1, 0.5, Number.NaN, Number.POSITIVE_INFINITY, Number.MAX_SAFE_INTEGER + 1, 1]) {
    assertIssue(validateEnglishForm({ ...memoryEnglishBase, grouping: [[invalid]] }, { memory: true }), "GROUPING_INDEX_DOMAIN");
    assertIssue(validateEnglishForm({ ...memoryEnglishBase, styleApplicable: { scope: "givenName", unitIndices: [invalid] } }, { memory: true }), "STYLE_REF_DOMAIN");
  }
});

test("T-CACHE-037 structural/preimage half: nested DocumentContext integers are uniquely classified", () => {
  const context = {
    contextFormatVersion: "1",
    id: "ctx",
    entities: [{
      ref: "m0", text: "梁知", type: "person",
      reading: {
        value: {
          jyutping: "loeng4",
          syllables: [{ jyutping: "loeng4", initial: "l", final: "oeng", tone: 4, syllabic: false }],
        },
        status: "resolved", provenance: "lexicon", confidence: "high", evidenceClass: "E5",
        externalAttestation: "not_applicable", cautions: [],
      },
      romanisation: {
        value: {
          formKind: "romanisation", assembled: true,
          units: [{ text: "leung", syllable: "loeng4", role: "surname", provenance: "rule_engine", evidenceClass: "E7", externalAttestation: "not_applicable" }],
          grouping: [[0]],
        },
        status: "resolved", provenance: "rule_engine", confidence: "low", evidenceClass: "E7",
        externalAttestation: "not_applicable", cautions: [],
      },
      englishForm: {
        value: {
          formKind: "romanisation", assembled: true, person: true,
          units: [memoryRomanisedUnit("given", "Lei", true)],
          grouping: [[0]],
          styleApplicable: { scope: "givenName", unitIndices: [0] },
        },
        status: "resolved", provenance: "rule_engine", confidence: "low", evidenceClass: "E7",
        externalAttestation: "not_applicable", cautions: [],
      },
    }],
  };
  assertValid(validateDocumentContextSemantics(context));
  for (const [label, mutate] of [
    ["fractional grouping", (value: typeof context) => { value.entities[0]!.romanisation!.value.grouping = [[0.5]]; }],
    ["negative grouping", (value: typeof context) => { value.entities[0]!.romanisation!.value.grouping = [[-1]]; }],
    ["unsafe grouping", (value: typeof context) => { value.entities[0]!.romanisation!.value.grouping = [[Number.MAX_SAFE_INTEGER + 1]]; }],
    ["out-of-range grouping", (value: typeof context) => { value.entities[0]!.romanisation!.value.grouping = [[1]]; }],
    ["fractional style index", (value: typeof context) => { value.entities[0]!.englishForm!.value.styleApplicable!.unitIndices = [0.5]; }],
    ["unsafe style index", (value: typeof context) => { value.entities[0]!.englishForm!.value.styleApplicable!.unitIndices = [Number.MAX_SAFE_INTEGER + 1]; }],
    ["out-of-range style index", (value: typeof context) => { value.entities[0]!.englishForm!.value.styleApplicable!.unitIndices = [1]; }],
    ["invalid tone", (value: typeof context) => { value.entities[0]!.reading!.value.syllables[0]!.tone = 7; }],
  ] as const) {
    const copy = structuredClone(context);
    mutate(copy);
    assertIssue(validateDocumentContextSemantics(copy), label.includes("style") ? "STYLE_REF_DOMAIN" : label.includes("tone") ? "MEMORY_TONE_DOMAIN" : "GROUPING_INDEX_DOMAIN");
  }
});

test("T-API-009: branch-aware L3R rendering stays independent from selected L3E", () => {
  const assembledL3R = {
    formKind: "romanisation",
    assembled: true,
    units: [
      { id: "u0", span: [0, 1], text: "nei", syllable: "nei4", provenance: "rule_engine", evidenceClass: "E7", externalAttestation: "not_attested" },
      { id: "u1", span: [1, 2], text: "deon", syllable: "deon6", provenance: "rule_engine", evidenceClass: "E7", externalAttestation: "not_attested" },
      { id: "u2", span: [2, 3], text: "dou", syllable: "dou6", provenance: "rule_engine", evidenceClass: "E7", externalAttestation: "not_attested" },
    ],
    grouping: [[0], [1], [2]],
  };
  const verbatimL3R = { formKind: "romanisation", assembled: false, text: "Nei Deun To" };
  const selectedL3E = { formKind: "official_name", assembled: false, text: "Nathan Road" };
  assertValid(validateRomanisation(assembledL3R, [0, 3]));
  assertValid(validateRomanisation(verbatimL3R, [0, 3]));
  assertValid(validateEnglishForm(selectedL3E));

  const beforeAssembled = structuredClone(assembledL3R);
  const beforeVerbatim = structuredClone(verbatimL3R);
  const beforeEnglish = structuredClone(selectedL3E);
  assert.equal(Object.hasOwn(assembledL3R, "text"), false);
  assert.equal(renderRomanisationFixture(assembledL3R), "Nei Deon Dou");
  assert.equal(renderRomanisationFixture(verbatimL3R), "Nei Deun To");
  assert.notEqual(renderRomanisationFixture(assembledL3R), selectedL3E.text);
  assert.notEqual(renderRomanisationFixture(verbatimL3R), selectedL3E.text);
  assert.deepEqual(assembledL3R, beforeAssembled);
  assert.deepEqual(verbatimL3R, beforeVerbatim);
  assert.deepEqual(selectedL3E, beforeEnglish);
});

test("T-API-032/RC-1..RC-4: assembled romanisation/hybrid, person and style applicability states are enforceable", () => {
  const styledPerson = {
    formKind: "romanisation",
    assembled: true,
    person: true,
    units: [
      englishRomanisedUnit("u0", [0, 1], "surname", "Leung", true),
      englishRomanisedUnit("u1", [1, 2], "given", "Chi", true),
    ],
    grouping: [[0], [1]],
    styleApplicable: { scope: "givenName", unitIds: ["u1"] },
  };
  assertValid(validateEnglishForm(styledPerson));

  const unstyledPerson = structuredClone(styledPerson) as Record<string, unknown>;
  delete unstyledPerson.styleApplicable;
  assertValid(validateEnglishForm(unstyledPerson));

  const nonPerson = structuredClone(unstyledPerson);
  nonPerson.person = false;
  assertValid(validateEnglishForm(nonPerson));

  const hybrid = {
    formKind: "hybrid",
    assembled: true,
    person: true,
    units: [
      englishLiteralUnit("u0", [0, 1], "western_given", "Mary"),
      englishRomanisedUnit("u1", [1, 2], "surname", "Chan", false),
    ],
    grouping: [[0, 1]],
  };
  assertValid(validateEnglishForm(hybrid));

  assertIssue(validateEnglishForm({ ...nonPerson, styleApplicable: { scope: "givenName", unitIds: ["u1"] } }), "NON_PERSON_STYLE");
  assertIssue(validateEnglishForm({ ...hybrid, units: [hybrid.units[1]] }), "HYBRID_UNIT_MIX");
  assertIssue(validateEnglishForm({ ...styledPerson, units: [styledPerson.units[0], englishLiteralUnit("u2", [1, 2], "given", "Chi")] }), "ROMANISATION_UNIT_MIX");
  assertIssue(validateEnglishForm({ ...styledPerson, units: [{ ...englishRomanisedUnit("u0", [0, 1], "given", "Mary", true), role: "western_given" }] }), "WESTERN_GIVEN_LITERAL");
});

test("§5.7/RC-4: style references are non-empty, unique, ordered, resolved and licensed", () => {
  const base = {
    formKind: "romanisation",
    assembled: true,
    person: true,
    units: [
      englishRomanisedUnit("u0", [0, 1], "given", "Chi", true),
      englishRomanisedUnit("u1", [1, 2], "given", "Yiu", true),
    ],
    grouping: [[0], [1]],
    styleApplicable: { scope: "givenName", unitIds: ["u0", "u1"] },
  };
  assertValid(validateEnglishForm(base));
  assertIssue(validateEnglishForm({ ...base, styleApplicable: { scope: "givenName", unitIds: [] } }), "STYLE_REFS_NONEMPTY");
  assertIssue(validateEnglishForm({ ...base, styleApplicable: { scope: "givenName", unitIds: ["u0", "u0"] } }), "STYLE_REF_UNIQUE");
  assertIssue(validateEnglishForm({ ...base, styleApplicable: { scope: "givenName", unitIds: ["u1", "u0"] } }), "STYLE_REF_ORDER");
  assertIssue(validateEnglishForm({ ...base, styleApplicable: { scope: "givenName", unitIds: ["missing"] } }), "STYLE_REF_RESOLUTION");
  const unlicensed = structuredClone(base);
  unlicensed.units[0]!.generated = false;
  assertIssue(validateEnglishForm(unlicensed), "STYLE_REF_LICENSE");
});

test("RULE-API-21: memory assembled forms use indices and contain no Analysis-local ids or spans", () => {
  const valid = {
    formKind: "romanisation",
    assembled: true,
    person: true,
    units: [
      memoryRomanisedUnit("given", "Chi", true),
      memoryRomanisedUnit("given", "Yiu", true),
    ],
    grouping: [[0, 1]],
    styleApplicable: { scope: "givenName", unitIndices: [0, 1] },
  };
  assertValid(validateEnglishForm(valid, { memory: true }));
  assertIssue(validateEnglishForm({ ...valid, styleApplicable: { scope: "givenName", unitIndices: [2] } }, { memory: true }), "STYLE_REF_DOMAIN");
  assertIssue(validateEnglishForm({
    ...valid,
    styleApplicable: { scope: "givenName", unitIndices: [0], unitIds: ["u0"] },
  }, { memory: true }), "MEMORY_STYLE_ANALYSIS_ID");
  const leaked = structuredClone(valid);
  (leaked.units[0] as Record<string, unknown>).id = "u0";
  (leaked.units[0] as Record<string, unknown>).span = [0, 1];
  assertIssue(validateEnglishForm(leaked, { memory: true }), "MEMORY_CLOSURE");
});

test("T-API-036/INV-14: GroupedAlignment has ordered groups and exact one-group membership", () => {
  const valid = {
    jyutping: "gwong2 dung1 waa2",
    syllables: [
      { span: null, jyutping: "gwong2", initial: "gw", final: "ong", tone: 2, syllabic: false, align: "grouped" },
      { span: null, jyutping: "dung1", initial: "d", final: "ung", tone: 1, syllabic: false, align: "grouped" },
      { span: [2, 3], jyutping: "waa2", initial: "w", final: "aa", tone: 2, syllabic: false, align: "exact" },
    ],
    alignmentGroups: [{ span: [0, 2], syllableIndices: [0, 1] }],
  };
  assertValid(validateReadingAlignment(valid, [0, 3]));

  const missingMembership = structuredClone(valid);
  missingMembership.alignmentGroups = [];
  assertIssue(validateReadingAlignment(missingMembership, [0, 3]), "GROUP_MEMBERSHIP");

  const duplicateMembership = structuredClone(valid);
  duplicateMembership.alignmentGroups.push({ span: [2, 3], syllableIndices: [0, 1] });
  assertIssue(validateReadingAlignment(duplicateMembership, [0, 3]), "GROUP_MEMBERSHIP");

  const nonGroupedMember = structuredClone(valid);
  nonGroupedMember.alignmentGroups[0]!.syllableIndices = [1, 2];
  assertIssue(validateReadingAlignment(nonGroupedMember, [0, 3]), "GROUP_MEMBER_ALIGN");

  const badIndex = structuredClone(valid);
  badIndex.alignmentGroups[0]!.syllableIndices = [0, 3];
  assertIssue(validateReadingAlignment(badIndex, [0, 3]), "GROUP_INDEX_RANGE");

  const shortGroup = structuredClone(valid);
  shortGroup.alignmentGroups[0]!.syllableIndices = [0];
  assertIssue(validateReadingAlignment(shortGroup, [0, 3]), "GROUP_SIZE");

  const reversedIndices = structuredClone(valid);
  reversedIndices.alignmentGroups[0]!.syllableIndices = [1, 0];
  assertIssue(validateReadingAlignment(reversedIndices, [0, 3]), "GROUP_INDEX_ORDER");

  const badAlign = structuredClone(valid);
  badAlign.syllables[2]!.align = "unaligned";
  assertIssue(validateReadingAlignment(badAlign, [0, 3]), "SYLLABLE_ALIGN");

  const groupOutOfBounds = structuredClone(valid);
  groupOutOfBounds.alignmentGroups[0]!.span = [0, 4];
  assertIssue(validateReadingAlignment(groupOutOfBounds, [0, 3]), "SPAN_BOUNDS");

  const groupedSpan = structuredClone(valid);
  groupedSpan.syllables[0]!.span = [0, 1];
  assertIssue(validateReadingAlignment(groupedSpan, [0, 3]), "GROUPED_SPAN_NULL");
});

test("T-API-022/025/026: valid StoreEntry evidence/attestation matrix is executable", () => {
  const documentary = { scope: "individual", sourceRef: "gazette:1", asOf: "2026-08-28" };
  const legal = [
    validStore(),
    validStore({ store: "translation", entryScope: "phrase", value: "Hong Kong", evidenceClass: "E1b", externalAttestation: "not_applicable" }),
    validStore({ store: "translation", entryScope: "lexical", value: "port", evidenceClass: "E1c", externalAttestation: "not_applicable", attestation: null }),
    validStore({ store: "translation", entryScope: "phrase", value: "Victoria Harbour", evidenceClass: "E2", externalAttestation: "not_applicable", attestation: documentary }),
    validStore({ store: "hk_romanisation", entryScope: "entity", value: "Cheung", evidenceClass: "E1a", externalAttestation: "not_attested" }),
    validStore({ store: "hk_romanisation", entryScope: "entity", value: "Cheung", evidenceClass: "E1c", externalAttestation: "attested", attestation: documentary }),
    validStore({ store: "translation", entryScope: "entity", value: "Bank of China", formKind: "official_name", evidenceClass: "E2", externalAttestation: "attested", attestation: documentary }),
  ];
  legal.forEach((entry) => assertValid(validateStoreEntryEvidence(entry)));

  const noDocument = validStore({ store: "translation", entryScope: "entity", value: "Bank", formKind: "official_name", evidenceClass: "E2", externalAttestation: "attested" });
  delete noDocument.attestation;
  assertIssue(validateStoreEntryEvidence(noDocument), "STORE_E2_ATTESTATION");
  assertIssue(validateStoreEntryEvidence(validStore({ store: "hk_romanisation", externalAttestation: "not_applicable" })), "STORE_ATTESTATION_APPLICABILITY");
  assertIssue(validateStoreEntryEvidence(validStore({ attestation: documentary })), "STORE_ATTESTATION_NULL");
});

test("T-API-031/G19 and RULE-API-25: StoreEntry applicability, quarantine and no-assembly rules are closed", () => {
  for (const formKind of ["romanisation", "official_name", "native_original", "translation", "hybrid"]) {
    assertValid(validateStoreEntryEvidence(validStore({
      store: "translation",
      entryScope: "entity",
      value: `value:${formKind}`,
      formKind,
      externalAttestation: "not_attested",
    })));
  }
  assertIssue(validateStoreEntryEvidence(validStore({ store: "translation", entryScope: "entity", externalAttestation: "not_attested" })), "STORE_FORM_KIND_REQUIRED");
  assertIssue(validateStoreEntryEvidence(validStore({ formKind: "translation" })), "STORE_FORM_KIND_FORBIDDEN");
  assertIssue(validateStoreEntryEvidence(validStore({ entryScope: "phrase", entityTypeHint: "street" })), "STORE_ENTITY_HINT_SCOPE");
  assertIssue(validateStoreEntryEvidence(validStore({ assembled: true, units: [], grouping: [] })), "STORE_NO_ASSEMBLY");

  const quarantined = validStore({
    enabled: false,
    validation: { ok: false, errors: [{ code: "bad", message: "bad entry" }] },
  });
  assertValid(validateStoreEntryEvidence(quarantined));
  assertIssue(validateStoreEntryEvidence({ ...quarantined, enabled: true }), "INVALID_STORE_DISABLED");
  assertIssue(validateStoreEntryEvidence({ ...quarantined, validation: { ok: false, errors: [] } }), "INVALID_STORE_ERRORS");
  assertIssue(validateStoreEntryEvidence(validStore({ evidenceClass: "E3" })), "STORE_EVIDENCE_DOMAIN");
});

test("RULE-API-25: stored translation/entity values map exactly to verbatim forms", () => {
  for (const formKind of ["romanisation", "official_name", "native_original", "translation", "hybrid"]) {
    const entry = validStore({ store: "translation", entryScope: "entity", value: "Exact", formKind, externalAttestation: "not_attested" });
    assertValid(validateStoredEnglishFormMapping(entry, { formKind, assembled: false, text: "Exact" }));
    assertIssue(validateStoredEnglishFormMapping(entry, { formKind, assembled: false, text: "Changed" }), "STORE_MAPPING_VERBATIM");
    assertIssue(validateStoredEnglishFormMapping(entry, { formKind, assembled: true, units: [], grouping: [] }), "STORE_MAPPING_VERBATIM");
    assertIssue(validateStoredEnglishFormMapping(entry, { formKind, assembled: false, text: "Exact", person: true }), "VERBATIM_FORBIDDEN_FIELD");
  }
  assertIssue(validateStoredEnglishFormMapping(validStore(), { formKind: "romanisation", assembled: false, text: "Exact" }), "STORE_MAPPING_INPUT");
});

test("T-API-035: store defaults and Basic-Latin case matching are deterministic", () => {
  assert.deepEqual(materialiseStoreDraftDefaults({ key: "ABC", value: "value" }), {
    key: "ABC",
    value: "value",
    entryScope: "lexical",
    caseSensitive: false,
    match: "exact",
    enabled: true,
    evidenceClass: "E1a",
  });
  assert.equal(materialiseStoreDraftDefaults({ key: "ABC" }), null);
  assert.equal(matchesBasicLatinStoreKey("ABC", "abc", false), true);
  assert.equal(matchesBasicLatinStoreKey("ABC", "abc", true), false);
  assert.equal(matchesBasicLatinStoreKey("香港", "香港", false), true);
});

test("T-API-044..049/G26: documentTags use exact matching and a UTF-16-sorted set preimage", () => {
  const condition = { documentTag: "legal" };
  assert.equal(matchesDocumentTagCondition(condition, { documentTags: ["legal"] }), true);
  assert.equal(matchesDocumentTagCondition(condition, { documentTags: ["Legal"] }), false);
  assert.equal(matchesDocumentTagCondition(condition, { documentTags: [" legal"] }), false);
  assert.equal(matchesDocumentTagCondition(condition), false);
  assert.equal(matchesDocumentTagCondition(condition, { documentTags: [] }), false);
  assert.equal(matchesDocumentTagCondition({}, { documentTags: [] }), true);
  assert.equal(matchesDocumentTagCondition(condition, {
    documentContext: { contextFormatVersion: "1", id: "legal", entities: [] },
  }), false, "DocumentContext.id must never supply a document tag");

  assert.deepEqual(normaliseDocumentTags(), []);
  assert.deepEqual(normaliseDocumentTags([]), []);
  assert.deepEqual(normaliseDocumentTags(["legal", "court", "legal"]), ["court", "legal"]);
  assert.deepEqual(normaliseDocumentTags(["court", "legal"]), ["court", "legal"]);
  assert.deepEqual(
    normaliseDocumentTags(["\uE000", "\u{10000}", "\uD800"]),
    ["\uD800", "\u{10000}", "\uE000"],
    "ordering is by UTF-16 code units, not Unicode scalar values or locale",
  );
  assert.deepEqual(normaliseDocumentTags(["é", "e\u0301", "é"]), ["e\u0301", "é"]);
  assert.equal(normaliseDocumentTags(["legal", 1]), null);
  assert.equal(normaliseDocumentTags(new Array(1)), null);

  const supplied = { documentTags: ["legal", "court", "legal"], latinReadingPolicy: "none" };
  const equivalent = { latinReadingPolicy: "none", documentTags: ["court", "legal"] };
  const narrower = { latinReadingPolicy: "none", documentTags: ["legal"] };
  const suppliedBefore = structuredClone(supplied);
  const firstPreimage = materialiseProcessOptionsPreimage(supplied);
  const equivalentPreimage = materialiseProcessOptionsPreimage(equivalent);
  const narrowerPreimage = materialiseProcessOptionsPreimage(narrower);
  assert.deepEqual(firstPreimage, { ...supplied, documentTags: ["court", "legal"] });
  assert.equal(stableJsonStringify(firstPreimage), stableJsonStringify(equivalentPreimage));
  assert.notEqual(stableJsonStringify(firstPreimage), stableJsonStringify(narrowerPreimage));
  assert.deepEqual(materialiseProcessOptionsPreimage({}), { documentTags: [] });
  assert.equal(materialiseProcessOptionsPreimage({ documentTags: ["legal", false] }), null);
  assert.deepEqual(supplied, suppliedBefore, "preimage normalisation is pure");
});

test("T-API-034: E3-E7 imports are invalid/no-write and apply reports only legal writes", () => {
  for (const evidenceClass of ["E3", "E4", "E5", "E6", "E7"]) {
    assertValid(validateStoreImportEnvelope({
      mode: "preview",
      writesApplied: false,
      rows: [{ index: 0, input: { evidenceClass }, action: "invalid", errors: [{ code: "unsupported", message: "not persisted" }] }],
    }));
    assertIssue(validateStoreImportEnvelope({
      mode: "preview",
      writesApplied: false,
      rows: [{ index: 0, input: { evidenceClass }, action: "add", entry: validStore(), errors: [] }],
    }), "IMPORT_E3_E7_INVALID");
  }

  const legalApply = {
    mode: "apply",
    writesApplied: true,
    userDataVersion: 1,
    rows: [{ index: 0, input: { evidenceClass: "E1a" }, action: "add", entry: validStore(), errors: [] }],
  };
  assertValid(validateStoreImportEnvelope(legalApply));
  assertIssue(validateStoreImportEnvelope({ ...legalApply, writesApplied: false }), "APPLY_WRITES_APPLIED");
  assertIssue(validateStoreImportEnvelope({
    mode: "apply",
    writesApplied: true,
    rows: [{ index: 0, input: { evidenceClass: "E1a" }, action: "add", entry: null, errors: [] }],
  }), "APPLY_WRITES_APPLIED");

  const updateEntries = [
    validStore(),
    validStore({
      id: "store-2",
      store: "translation",
      key: "香港",
      value: "Hong Kong",
      entryScope: "phrase",
      evidenceClass: "E1b",
      externalAttestation: "not_applicable",
    }),
    validStore({
      id: "store-3",
      store: "hk_romanisation",
      key: "張",
      value: "Cheung",
      entryScope: "entity",
      externalAttestation: "not_attested",
    }),
  ];
  for (const entry of updateEntries) {
    const updateOnly = {
      mode: "apply",
      store: entry.store,
      writesApplied: false,
      userDataVersion: 1,
      rows: [{
        index: 0,
        input: structuredClone(entry),
        action: "update",
        entry,
        conflicts: [],
        errors: [],
      }],
    };
    const beforeValidation = structuredClone(updateOnly);
    assertValid(validateStoreImportEnvelope(updateOnly));
    assertValid(validateStoreImportEnvelope({ ...updateOnly, writesApplied: true }));
    for (const writesApplied of [undefined, null, 0, 1, "false"]) {
      assertIssue(validateStoreImportEnvelope({ ...updateOnly, writesApplied }), "APPLY_WRITES_APPLIED");
    }
    assert.deepEqual(updateOnly, beforeValidation, "envelope validation is pure");
  }

  const updateRow = {
    index: 0,
    input: validStore(),
    action: "update",
    entry: validStore(),
    conflicts: [],
    errors: [],
  };
  const conflictOnly = {
    mode: "apply",
    store: "pronunciation",
    writesApplied: false,
    userDataVersion: 1,
    rows: [{
      index: 0,
      input: validStore(),
      action: "conflict",
      entry: validStore(),
      conflicts: [validStore({ id: "store-conflict" })],
      errors: [],
    }],
  };
  assertValid(validateStoreImportEnvelope(conflictOnly));
  assertIssue(validateStoreImportEnvelope({ ...conflictOnly, writesApplied: true }), "APPLY_WRITES_APPLIED");

  const erroredUpdate = {
    mode: "apply",
    store: "pronunciation",
    writesApplied: false,
    userDataVersion: 1,
    rows: [{ ...updateRow, errors: [{ code: "bad", message: "not written", path: [] }] }],
  };
  assertValid(validateStoreImportEnvelope(erroredUpdate));
  assertIssue(validateStoreImportEnvelope({ ...erroredUpdate, writesApplied: true }), "APPLY_WRITES_APPLIED");

  const mixedApply = {
    mode: "apply",
    store: "pronunciation",
    writesApplied: true,
    userDataVersion: 2,
    rows: [
      updateRow,
      { index: 1, input: validStore({ id: "store-add" }), action: "add", entry: validStore({ id: "store-add" }), conflicts: [], errors: [] },
    ],
  };
  assertValid(validateStoreImportEnvelope(mixedApply));
  assertIssue(validateStoreImportEnvelope({ ...mixedApply, writesApplied: false }), "APPLY_WRITES_APPLIED");

  const updatePreview = {
    mode: "preview",
    store: "pronunciation",
    writesApplied: false,
    rows: [updateRow],
  };
  assertValid(validateStoreImportEnvelope(updatePreview));
  assertIssue(validateStoreImportEnvelope({ ...updatePreview, writesApplied: true }), "PREVIEW_NO_WRITES");
  assertIssue(validateStoreImportEnvelope({ ...updatePreview, userDataVersion: 1 }), "PREVIEW_VERSION_FIELD");

  assertValid(validateStoreImportEnvelope({
    mode: "apply",
    writesApplied: false,
    userDataVersion: 0,
    rows: [{ index: 0, input: { evidenceClass: "E3" }, action: "invalid", errors: [{ code: "bad", message: "bad" }] }],
  }));
  assertIssue(validateStoreImportEnvelope({ mode: "preview", writesApplied: true, rows: [] }), "PREVIEW_NO_WRITES");
});

test("T-API-028/029: DocumentContext memory is selected-only, span/id-free and alias-justified", () => {
  const valid = {
    contextFormatVersion: "1",
    id: "ctx",
    entities: [{
      ref: "m0",
      text: "梁知遙",
      aliases: ["知遙"],
      type: "person",
      name: { surnameText: "梁", givenNameText: "知遙", compoundSurname: false, order: "surname_first" },
      reading: {
        value: {
          jyutping: "loeng4 zi1 jiu4",
          syllables: [
            { jyutping: "loeng4", initial: "l", final: "oeng", tone: 4, syllabic: false },
            { jyutping: "zi1", initial: "z", final: "i", tone: 1, syllabic: false },
            { jyutping: "jiu4", initial: "j", final: "iu", tone: 4, syllabic: false },
          ],
        },
        status: "resolved",
        provenance: "lexicon",
        confidence: "high",
        evidenceClass: "E5",
        externalAttestation: "not_applicable",
        cautions: [],
      },
      romanisation: {
        value: { formKind: "romanisation", assembled: false, text: "Leung Chiyiu" },
        status: "fallback",
        provenance: "convention_table",
        confidence: "low",
        evidenceClass: "E6",
        externalAttestation: "not_attested",
        cautions: [],
      },
      englishForm: {
        value: { formKind: "romanisation", assembled: false, text: "Leung Chiyiu" },
        status: "resolved",
        provenance: "convention_table",
        confidence: "medium",
        evidenceClass: "E6",
        externalAttestation: "not_attested",
        cautions: [],
      },
    }],
  };
  assertValid(validateDocumentContextSemantics(valid));

  const duplicate = structuredClone(valid);
  duplicate.entities.push(structuredClone(duplicate.entities[0]!));
  assertIssue(validateDocumentContextSemantics(duplicate), "MEMORY_REF_UNIQUE");

  const leaked = structuredClone(valid);
  (leaked.entities[0] as Record<string, unknown>).span = [0, 3];
  assertIssue(validateDocumentContextSemantics(leaked), "MEMORY_CLOSURE");

  const badAlias = structuredClone(valid);
  badAlias.entities[0]!.aliases = ["unlicensed"];
  assertIssue(validateDocumentContextSemantics(badAlias), "MEMORY_ALIAS_JUSTIFICATION");

  const badStatus = structuredClone(valid);
  badStatus.entities[0]!.englishForm.status = "ambiguous";
  assertIssue(validateDocumentContextSemantics(badStatus), "MEMORY_STATUS");

  const readingLeak = structuredClone(valid);
  (readingLeak.entities[0]!.reading.value as Record<string, unknown>).alignmentGroups = [];
  (readingLeak.entities[0]!.reading.value.syllables[0] as Record<string, unknown>).span = [0, 1];
  assertIssue(validateDocumentContextSemantics(readingLeak), "MEMORY_READING_CLOSURE");

  const romanisationLeak = structuredClone(valid);
  romanisationLeak.entities[0]!.romanisation.value = {
    formKind: "romanisation",
    assembled: true,
    units: [{
      id: "u0",
      span: [0, 1],
      text: "loeng",
      syllable: "loeng4",
      role: "surname",
      provenance: "convention_table",
      evidenceClass: "E6",
      externalAttestation: "not_attested",
    }],
    grouping: [[0]],
  } as unknown as typeof romanisationLeak.entities[0]["romanisation"]["value"];
  assertIssue(validateDocumentContextSemantics(romanisationLeak), "MEMORY_CLOSURE");

  const missingMetadata = structuredClone(valid) as Record<string, unknown>;
  const memoryEntity = (missingMetadata.entities as Array<Record<string, unknown>>)[0]!;
  delete (memoryEntity.englishForm as Record<string, unknown>).cautions;
  assertIssue(validateDocumentContextSemantics(missingMetadata), "MEMORY_CAUTIONS");

  const nonPersonName = structuredClone(valid);
  nonPersonName.entities[0]!.type = "street";
  assertIssue(validateDocumentContextSemantics(nonPersonName), "MEMORY_NAME_PERSON_ONLY");

  const reservedChannelProvenance = structuredClone(valid);
  reservedChannelProvenance.entities[0]!.englishForm.provenance = "external";
  assertIssue(validateDocumentContextSemantics(reservedChannelProvenance), "MEMORY_PROVENANCE");

  const reservedRomanisationUnit = structuredClone(valid);
  reservedRomanisationUnit.entities[0]!.romanisation.value = {
    formKind: "romanisation",
    assembled: true,
    units: [{
      text: "loeng", syllable: "loeng4", role: "surname", provenance: "entity_record",
      evidenceClass: "E6", externalAttestation: "not_attested",
    }],
    grouping: [[0]],
  } as unknown as typeof reservedRomanisationUnit.entities[0]["romanisation"]["value"];
  assertIssue(validateDocumentContextSemantics(reservedRomanisationUnit), "MEMORY_UNIT_PROVENANCE");

  const reservedEnglishUnit = structuredClone(valid);
  reservedEnglishUnit.entities[0]!.englishForm.value = {
    formKind: "romanisation",
    assembled: true,
    person: false,
    units: [{ ...memoryRomanisedUnit("surname", "Leung", false), provenance: "external" }],
    grouping: [[0]],
  } as unknown as typeof reservedEnglishUnit.entities[0]["englishForm"]["value"];
  assertIssue(validateDocumentContextSemantics(reservedEnglishUnit), "ENGLISH_UNIT_PROVENANCE");
});

test("T-API-040/G23: CanonicalValue accepts only exact CanonicalInteger sentinels in signed int64", () => {
  const valid = [
    null,
    true,
    "text",
    [null, false, "x", { __int: "0" }],
    { nested: { minimum: { __int: "-9223372036854775808" }, maximum: { __int: "9223372036854775807" } } },
  ];
  valid.forEach((value) => assertValid(validateCanonicalValue(value)));

  const invalid: Array<[unknown, string]> = [
    [1, "CANONICAL_VALUE_DOMAIN"],
    [{ __int: "+1" }, "CANONICAL_INTEGER_GRAMMAR"],
    [{ __int: "01" }, "CANONICAL_INTEGER_GRAMMAR"],
    [{ __int: "-0" }, "CANONICAL_INTEGER_GRAMMAR"],
    [{ __int: "9223372036854775808" }, "CANONICAL_INTEGER_RANGE"],
    [{ __int: "-9223372036854775809" }, "CANONICAL_INTEGER_RANGE"],
    [{ __int: "1", extra: true }, "CANONICAL_INTEGER_KEYS"],
    [{ ordinary: 1 }, "CANONICAL_VALUE_DOMAIN"],
    [new Date("2026-08-29T00:00:00Z"), "CANONICAL_OBJECT_PLAIN"],
    [new Array(1), "CANONICAL_ARRAY_DENSE"],
    [[undefined], "CANONICAL_VALUE_DOMAIN"],
  ];
  for (const [value, code] of invalid) assertIssue(validateCanonicalValue(value), code);

  const customPrototype = Object.create({ inherited: "not JSON" }) as Record<string, unknown>;
  customPrototype.value = "x";
  assertIssue(validateCanonicalValue(customPrototype), "CANONICAL_OBJECT_PLAIN");
  const cyclic: Record<string, unknown> = {};
  cyclic.self = cyclic;
  assert.doesNotThrow(() => validateCanonicalValue(cyclic));
  assertIssue(validateCanonicalValue(cyclic), "CANONICAL_VALUE_CYCLE");
  const arrayWithHiddenExtra = ["x"] as unknown[] & { hidden?: string };
  Object.defineProperty(arrayWithHiddenExtra, "hidden", { value: "bad", enumerable: false });
  assertIssue(validateCanonicalValue(arrayWithHiddenExtra), "CANONICAL_ARRAY_KEYS");
  const arrayWithHiddenIndex = ["x"];
  Object.defineProperty(arrayWithHiddenIndex, "0", { value: "x", enumerable: false });
  assertIssue(validateCanonicalValue(arrayWithHiddenIndex), "CANONICAL_ARRAY_PROPERTY");
});

test("§5.13 RULE-API-20: ProviderSnapshot shape, CanonicalValue output and duplicate inputHash are checked", () => {
  const snapshotBase = {
    id: "0".repeat(64),
    snapshotFormatVersion: "1",
    providerId: "provider.example",
    providerConfigHash: "config-hash",
    createdAt: "2026-08-28T00:00:00Z",
  };
  assertValid(validateProviderSnapshotShape({
    ...snapshotBase,
    entries: [
      { inputHash: "a".repeat(64), output: { name: "A", count: { __int: "1" } } },
      { inputHash: "b".repeat(64), output: ["B"] },
    ],
  }));
  assertIssue(validateProviderSnapshotShape({ entries: [] }), "PROVIDER_SNAPSHOT_SHAPE");
  assertIssue(validateProviderSnapshotShape({
    ...snapshotBase,
    entries: [{ inputHash: "a".repeat(64), output: "x" }, { inputHash: "a".repeat(64), output: "y" }],
  }), "PROVIDER_DUPLICATE_INPUT");
  assertIssue(validateProviderSnapshotShape({
    ...snapshotBase,
    entries: [{ inputHash: "a".repeat(64), output: 1 }],
  }), "CANONICAL_VALUE_DOMAIN");
  assertValid(validateProviderSnapshotShape({
    ...snapshotBase,
    entries: [{ inputHash: "b".repeat(64), output: "B" }, { inputHash: "a".repeat(64), output: "A" }],
  }));
  assertIssue(validateProviderSnapshotShape({
    ...snapshotBase,
    entries: new Array(1),
  }), "PROVIDER_ENTRIES_DENSE");
  const entriesWithHiddenExtra = [{ inputHash: "a".repeat(64), output: "A" }] as unknown[] & { hidden?: string };
  Object.defineProperty(entriesWithHiddenExtra, "hidden", { value: "bad", enumerable: false });
  assertIssue(validateProviderSnapshotShape({ ...snapshotBase, entries: entriesWithHiddenExtra }), "PROVIDER_ENTRIES_ARRAY");
  const entriesWithHiddenIndex = [{ inputHash: "a".repeat(64), output: "A" }];
  Object.defineProperty(entriesWithHiddenIndex, "0", { value: entriesWithHiddenIndex[0], enumerable: false });
  assertIssue(validateProviderSnapshotShape({ ...snapshotBase, entries: entriesWithHiddenIndex }), "PROVIDER_ENTRY_PROPERTY");
});

test("T-API-011/043 and G25: EngineCreationResult validates clean, degraded and fatal snapshot branches", () => {
  let processCalls = 0;
  const liveEngine = {
    processText: () => { processCalls += 1; return analysisFixture(); },
    versions: () => ({}),
    stores: {
      list: () => [], get: () => null, create: () => null, update: () => null,
      remove: () => undefined, setEnabled: () => null, search: () => [],
      exportJson: () => null, exportCsv: () => "", importJson: () => null, version: () => 0,
    },
    validateJyutping: () => ({ ok: true, errors: [] }),
  };
  const shapeValidSnapshot = {
    id: "0".repeat(64),
    snapshotFormatVersion: "1",
    providerId: "provider.example",
    providerConfigHash: "config-hash",
    createdAt: "2026-08-29T00:00:00Z",
    entries: [{ inputHash: "a".repeat(64), output: { result: "stable" } }],
  };
  const fullCoverage = { writtenCantonese: true, hkscs: true, wordLevel: true, frequencies: true };
  const degradedCoverage = { ...fullCoverage, frequencies: false };
  const lexiconWarning = {
    code: "LEXICON_MISSING_CAPABILITY",
    severity: "warning",
    message: "Frequency data is unavailable.",
    data: { capability: "frequencies" },
  };
  const snapshotError = {
    code: "PROVIDER_SNAPSHOT_INVALID",
    severity: "error",
    message: "The supplied snapshot is semantically invalid.",
  };

  assertValid(validateEngineCreationResult(
    { ok: true, engine: liveEngine, diagnostics: [] },
    { providerSnapshot: shapeValidSnapshot, lexiconCoverage: fullCoverage },
  ));
  assertValid(validateEngineCreationResult(
    { ok: true, engine: liveEngine, diagnostics: [lexiconWarning] },
    { providerSnapshot: shapeValidSnapshot, lexiconCoverage: degradedCoverage },
  ));

  const duplicateSnapshot = {
    ...shapeValidSnapshot,
    entries: [
      { inputHash: "a".repeat(64), output: "first" },
      { inputHash: "a".repeat(64), output: "second" },
    ],
  };
  const invalidValueSnapshot = {
    ...shapeValidSnapshot,
    entries: [{ inputHash: "a".repeat(64), output: 1 }],
  };
  const cyclicOutput: Record<string, unknown> = {};
  cyclicOutput.self = cyclicOutput;
  const cyclicSnapshot = {
    ...shapeValidSnapshot,
    entries: [{ inputHash: "a".repeat(64), output: cyclicOutput }],
  };
  assert.doesNotThrow(() => validateEngineCreationResult(
    { ok: false, engine: null, diagnostics: [snapshotError] },
    { providerSnapshot: duplicateSnapshot, lexiconCoverage: fullCoverage },
  ));
  assertValid(validateEngineCreationResult(
    { ok: false, engine: null, diagnostics: [snapshotError] },
    { providerSnapshot: duplicateSnapshot, lexiconCoverage: fullCoverage },
  ));
  assertValid(validateEngineCreationResult(
    { ok: false, engine: null, diagnostics: [snapshotError] },
    { providerSnapshot: invalidValueSnapshot, lexiconCoverage: fullCoverage },
  ));
  assert.doesNotThrow(() => validateEngineCreationResult(
    { ok: false, engine: null, diagnostics: [snapshotError] },
    { providerSnapshot: cyclicSnapshot, lexiconCoverage: fullCoverage },
  ));
  assertValid(validateEngineCreationResult(
    { ok: false, engine: null, diagnostics: [snapshotError] },
    { providerSnapshot: cyclicSnapshot, lexiconCoverage: fullCoverage },
  ));
  assert.equal(processCalls, 0, "semantic creation validation must never invoke processText");

  assertIssue(validateEngineCreationResult(
    { ok: true, engine: liveEngine, diagnostics: [] },
    { providerSnapshot: duplicateSnapshot },
  ), "ENGINE_CREATION_FATAL_BRANCH");
  assertIssue(validateEngineCreationResult(
    { ok: true, engine: liveEngine, diagnostics: [] },
    { lexiconCoverage: degradedCoverage },
  ), "ENGINE_CREATION_DEGRADED_DIAGNOSTIC");
  assertIssue(validateEngineCreationResult(
    { ok: true, engine: liveEngine, diagnostics: [lexiconWarning] },
    { providerSnapshot: shapeValidSnapshot, lexiconCoverage: fullCoverage },
  ), "ENGINE_CREATION_CLEAN_DIAGNOSTICS");
  assertIssue(validateEngineCreationResult(
    { ok: false, engine: liveEngine, diagnostics: [snapshotError] },
    { providerSnapshot: duplicateSnapshot },
  ), "ENGINE_CREATION_FAILURE_ENGINE");
  assertIssue(validateEngineCreationResult(
    { ok: false, engine: null, diagnostics: [] },
    { providerSnapshot: duplicateSnapshot },
  ), "ENGINE_CREATION_FAILURE_DIAGNOSTICS");
  // Shape validity cannot prove the snapshot identity; a hash mismatch may fail.
  assertValid(validateEngineCreationResult(
    { ok: false, engine: null, diagnostics: [snapshotError] },
    { providerSnapshot: shapeValidSnapshot },
  ));
  assertIssue(validateEngineCreationResult(
    { ok: false, engine: null, diagnostics: [snapshotError] },
    { lexiconCoverage: { ...fullCoverage, hkscs: false } },
  ), "ENGINE_CREATION_UNEXPECTED_FAILURE");
  assertIssue(validateEngineCreationResult(
    { ok: true, engine: liveEngine, diagnostics: [{ ...lexiconWarning, span: [0, 1] }] },
  ), "CREATION_DIAGNOSTIC_SPAN");
  assertIssue(validateEngineCreationResult({
    ok: true,
    engine: { ...liveEngine, stores: {} },
    diagnostics: [],
  }), "ENGINE_CREATION_SUCCESS_ENGINE");

  const copiedCreationDiagnostic = analysisFixture();
  copiedCreationDiagnostic.diagnostics = [lexiconWarning];
  assertIssue(validateAnalysisStructure(copiedCreationDiagnostic), "ANALYSIS_DIAGNOSTIC_OWNER");
  const sourceDiagnostic = analysisFixture();
  sourceDiagnostic.diagnostics = [{
    code: "SOURCE_UNAVAILABLE", severity: "error", message: "A content source failed.",
  }];
  assertValid(validateAnalysisStructure(sourceDiagnostic));
  const unassignedDiagnostic = analysisFixture();
  unassignedDiagnostic.diagnostics = [{
    code: "IMPORT_VALIDATION_FAILED", severity: "error", message: "Reserved without an Analysis producer.",
  }];
  assertIssue(validateAnalysisStructure(unassignedDiagnostic), "ANALYSIS_DIAGNOSTIC_OWNER");
});

test("G24: Lattice edges and alternatives form exact, unique, complete local paths", () => {
  const valid = {
    window: [0, 4],
    edges: [
      { index: 0, span: [0, 2], text: "ab", source: "lexicon" },
      { index: 1, span: [2, 4], text: "cd", source: "user_glossary", entryId: "store-1" },
    ],
    alternatives: [{ edgeIndices: [0, 1] }],
  };
  assertValid(validateLattice(valid, "abcd"));

  const badText = structuredClone(valid);
  badText.edges[0]!.text = "zz";
  assertIssue(validateLattice(badText, "abcd"), "LATTICE_EDGE_TEXT");

  const badIndex = structuredClone(valid);
  badIndex.edges[1]!.index = 4;
  assertIssue(validateLattice(badIndex, "abcd"), "LATTICE_EDGE_INDEX");

  const missingStoreRef = structuredClone(valid);
  delete missingStoreRef.edges[1]!.entryId;
  assertIssue(validateLattice(missingStoreRef, "abcd"), "LATTICE_STORE_ENTRY");

  const referenceWithStoreRef = structuredClone(valid);
  referenceWithStoreRef.edges[0]!.entryId = "forbidden";
  assertIssue(validateLattice(referenceWithStoreRef, "abcd"), "LATTICE_REFERENCE_ENTRY");

  const gap = structuredClone(valid);
  gap.edges[1]!.span = [3, 4];
  gap.edges[1]!.text = "d";
  assertIssue(validateLattice(gap, "abcd"), "LATTICE_PATH_PARTITION");

  const duplicatePath = structuredClone(valid);
  duplicatePath.alternatives.push({ edgeIndices: [0, 1] });
  assertIssue(validateLattice(duplicatePath, "abcd"), "LATTICE_DUPLICATE_PATH");

  const outOfRange = structuredClone(valid);
  outOfRange.alternatives[0]!.edgeIndices = [0, 2];
  assertIssue(validateLattice(outOfRange, "abcd"), "LATTICE_PATH_INDEX");
});

test("T-API-024/G16: AnnotationRef requires one explicit owner and a legal owner/channel pair", () => {
  assertValid(validateAnnotationRef({ owner: "entity", entityId: "e0", channel: "romanisation" }, "romanisation"));
  assertValid(validateAnnotationRef({ owner: "token", tokenId: "t0", channel: "reading" }));
  assertIssue(validateAnnotationRef({ owner: "entity", channel: "reading" }), "ANNOTATION_REF_OWNER");
  assertIssue(validateAnnotationRef({ owner: "entity", entityId: "e0", tokenId: "t0", channel: "reading" }), "ANNOTATION_REF_OWNER");
  assertIssue(validateAnnotationRef({ owner: "token", tokenId: "t0", channel: "englishForm" }), "ANNOTATION_REF_CHANNEL");
  assertIssue(validateAnnotationRef({ owner: "token", tokenId: "t0", channel: "reading" }, "romanisation"), "ANNOTATION_REF_EXPECTED_CHANNEL");
});

test("§5.11: AnnotationProjection refs resolve and preserve owner/channel facts", () => {
  const analysis = analysisFixture();
  const valid = {
    schemaVersion: "1.0",
    sourceHash: SOURCE_HASH,
    offsetUnit: "utf16",
    annotations: [{
      ref: { owner: "token", tokenId: "t0", channel: "reading" },
      span: [0, 1],
      sourceText: "A",
      rendered: "aa1",
      status: "resolved",
      confidence: "high",
      alternatives: [],
      cautions: [],
    }],
  };
  assertValid(validateAnnotationProjectionConsistency(analysis, valid));
  assertIssue(validateAnnotationProjectionConsistency(analysis, {
    ...valid,
    annotations: [{ ...valid.annotations[0], ref: { owner: "token", tokenId: "missing", channel: "reading" } }],
  }), "PROJECTED_ANNOTATION_OWNER");
  assertIssue(validateAnnotationProjectionConsistency(analysis, {
    ...valid,
    annotations: [{ ...valid.annotations[0], span: [0, 2] }],
  }), "PROJECTED_ANNOTATION_SPAN");
  assertIssue(validateAnnotationProjectionConsistency(analysis, {
    ...valid,
    annotations: [{ ...valid.annotations[0], sourceText: "wrong" }],
  }), "PROJECTED_ANNOTATION_TEXT");
  assertIssue(validateAnnotationProjectionConsistency(analysis, {
    ...valid,
    annotations: [{ ...valid.annotations[0], confidence: "low" }],
  }), "PROJECTED_ANNOTATION_ENVELOPE");
});

test("T-ENT-053/G20: InheritanceRef branches are exclusive and resolve only in their domain", () => {
  const currentEntityIds = new Set(["e0"]);
  const documentContext = { id: "ctx", entities: [{ ref: "m0" }] };
  assertValid(validateInheritanceRef({ kind: "analysis", entityId: "e0" }, { currentEntityIds }));
  assertValid(validateInheritanceRef({ kind: "documentContext", contextId: "ctx", ref: "m0" }, { documentContext }));
  assertIssue(validateInheritanceRef({ kind: "analysis", entityId: "missing" }, { currentEntityIds }), "INHERITANCE_UNRESOLVED");
  assertIssue(validateInheritanceRef({ kind: "documentContext", contextId: "wrong", ref: "m0" }, { documentContext }), "INHERITANCE_UNRESOLVED");
  assertIssue(validateInheritanceRef({ kind: "analysis", entityId: "e0", ref: "m0" }), "INHERITANCE_BRANCH");
  assertIssue(validateInheritanceRef({ kind: "documentContext", contextId: "ctx", ref: "m0", entityId: "e0" }), "INHERITANCE_BRANCH");
});

test("T-API-038: two channels inherit from distinct antecedents while a third stays local", () => {
  const analysis = analysisFixture();
  const inheritedReading = readingEnvelope([1, 2]);
  inheritedReading.provenance = "inherited";
  inheritedReading.confidence = "medium";
  inheritedReading.inheritedFrom = { kind: "analysis", entityId: "e0" };
  const inheritedRomanisation = romanisationEnvelope("B");
  inheritedRomanisation.provenance = "inherited";
  inheritedRomanisation.inheritedFrom = { kind: "documentContext", contextId: "ctx", ref: "m0" };
  analysis.entities = [
    {
      id: "e0", span: [0, 1], text: "A", type: "other", primary: true,
      englishFallbackPolicy: "romanisation_allowed", detectionEvidence: [], detectionConfidence: "medium",
      reading: readingEnvelope([0, 1]), romanisation: romanisationEnvelope("A"), englishForm: englishEnvelope("A"),
    },
    {
      id: "e1", span: [1, 2], text: "B", type: "other", primary: true,
      englishFallbackPolicy: "romanisation_allowed", detectionEvidence: [], detectionConfidence: "medium",
      reading: inheritedReading, romanisation: inheritedRomanisation, englishForm: englishEnvelope("B"),
    },
  ];
  const context = { contextFormatVersion: "1", id: "ctx", entities: [{
    ref: "m0", text: "B", type: "other",
    romanisation: {
      value: { formKind: "romanisation", assembled: false, text: "B" },
      status: "resolved", provenance: "convention_table", confidence: "medium", evidenceClass: "E6",
      externalAttestation: "not_attested", cautions: [],
    },
  }] };
  assertValid(validateAnalysisStructure(analysis, context));

  const illegalLocal = structuredClone(analysis);
  ((illegalLocal.entities as Array<Record<string, unknown>>)[1]!.englishForm as Record<string, unknown>).inheritedFrom = {
    kind: "analysis", entityId: "e0",
  };
  assertIssue(validateAnalysisStructure(illegalLocal, context), "VALUE_INHERITANCE_FORBIDDEN");
});

test("INV-1/2/3/4/14: Analysis source spans, token partition and UTF-16 boundaries are checked", () => {
  assertValid(validateAnalysisStructure(analysisFixture()));

  const gap = analysisFixture();
  ((gap.tokens as Array<Record<string, unknown>>)[1]!).span = [0, 2];
  assertIssue(validateAnalysisStructure(gap), "TOKEN_PARTITION");

  const badText = analysisFixture();
  ((badText.tokens as Array<Record<string, unknown>>)[0]!).text = "wrong";
  assertIssue(validateAnalysisStructure(badText), "TOKEN_TEXT");

  const duplicateTokenId = analysisFixture();
  ((duplicateTokenId.tokens as Array<Record<string, unknown>>)[1]!).id = "t0";
  assertIssue(validateAnalysisStructure(duplicateTokenId), "TOKEN_ID_UNIQUE");

  const primitiveToken = analysisFixture();
  (primitiveToken.tokens as unknown[])[0] = null;
  assertIssue(validateAnalysisStructure(primitiveToken), "TOKEN_OBJECT");

  const misaligned = analysisFixture();
  ((misaligned.entities as Array<Record<string, unknown>>)[0]!).span = [0, 1.5];
  assertIssue(validateAnalysisStructure(misaligned), "SPAN");

  const splitSurrogate = analysisFixture("A😀B");
  splitSurrogate.tokens = [
    { id: "t0", span: [0, 2], text: "A😀B".slice(0, 2), type: "latin", reading: readingEnvelope([0, 2]), romanisation: romanisationEnvelope("A") },
    { id: "t1", span: [2, 4], text: "A😀B".slice(2), type: "latin", reading: readingEnvelope([2, 4]), romanisation: romanisationEnvelope("B") },
  ];
  assertIssue(validateAnalysisStructure(splitSurrogate), "TOKEN_UNSAFE_BOUNDARY");

  const badDiagnosticSpan = analysisFixture();
  badDiagnosticSpan.diagnostics = [{ code: "SOURCE_UNAVAILABLE", severity: "warning", message: "x", span: [0, 3] }];
  assertIssue(validateAnalysisStructure(badDiagnosticSpan), "SPAN_BOUNDS");
});

test("INV-16 and v1 domain closure: entity nesting, containment, structure and persistence boundaries are checked", () => {
  const nested = analysisFixture("ABCD");
  nested.tokens = [0, 1, 2, 3].map((start) => ({
    id: `t${start}`,
    span: [start, start + 1],
    text: "ABCD".slice(start, start + 1),
    type: "latin",
    reading: readingEnvelope([start, start + 1]),
    romanisation: romanisationEnvelope("x"),
  }));
  nested.entities = [
    {
      id: "e0", span: [0, 4], text: "ABCD", type: "other", primary: true,
      englishFallbackPolicy: "romanisation_allowed", detectionEvidence: [], detectionConfidence: "medium",
      reading: readingEnvelope([0, 4]), romanisation: romanisationEnvelope("x"), englishForm: englishEnvelope("x"),
    },
    {
      id: "e1", span: [1, 3], text: "BC", type: "other", primary: false, containedBy: "e0",
      englishFallbackPolicy: "romanisation_allowed", detectionEvidence: [], detectionConfidence: "medium",
      reading: readingEnvelope([1, 3]), romanisation: romanisationEnvelope("x"), englishForm: englishEnvelope("x"),
    },
  ];
  assertValid(validateAnalysisStructure(nested));

  const partial = structuredClone(nested);
  (partial.entities as Array<Record<string, unknown>>)[0]!.span = [0, 3];
  (partial.entities as Array<Record<string, unknown>>)[0]!.text = "ABC";
  (partial.entities as Array<Record<string, unknown>>)[0]!.reading = readingEnvelope([0, 3]);
  (partial.entities as Array<Record<string, unknown>>)[1]!.span = [2, 4];
  (partial.entities as Array<Record<string, unknown>>)[1]!.text = "CD";
  (partial.entities as Array<Record<string, unknown>>)[1]!.reading = readingEnvelope([2, 4]);
  assertIssue(validateAnalysisStructure(partial), "ENTITY_PARTIAL_OVERLAP");

  const unresolvedContainer = structuredClone(nested);
  (unresolvedContainer.entities as Array<Record<string, unknown>>)[1]!.containedBy = "missing";
  assertIssue(validateAnalysisStructure(unresolvedContainer), "CONTAINED_BY_UNRESOLVED");

  const invalidContainer = structuredClone(nested);
  (invalidContainer.entities as Array<Record<string, unknown>>)[1]!.containedBy = "e1";
  assertIssue(validateAnalysisStructure(invalidContainer), "CONTAINED_BY_GEOMETRY");

  const twoPrimary = structuredClone(nested);
  (twoPrimary.entities as Array<Record<string, unknown>>)[1]!.primary = true;
  assertIssue(validateAnalysisStructure(twoPrimary), "ENTITY_PRIMARY_OVERLAP");

  const duplicateId = structuredClone(nested);
  (duplicateId.entities as Array<Record<string, unknown>>)[1]!.id = "e0";
  assertIssue(validateAnalysisStructure(duplicateId), "ENTITY_ID_UNIQUE");

  const duplicateCommitted = structuredClone(nested);
  const repeated = structuredClone((duplicateCommitted.entities as Array<Record<string, unknown>>)[1]!);
  repeated.id = "e2";
  (duplicateCommitted.entities as Array<Record<string, unknown>>).push(repeated);
  assertIssue(validateAnalysisStructure(duplicateCommitted), "ENTITY_COMMITTED_DUPLICATE");

  const wrongOrder = structuredClone(nested);
  (wrongOrder.entities as Array<Record<string, unknown>>).reverse();
  assertIssue(validateAnalysisStructure(wrongOrder), "ENTITY_ORDER");

  const nonPersonStructure = structuredClone(nested);
  (nonPersonStructure.entities as Array<Record<string, unknown>>)[0]!.structure = { surnameText: "A" };
  assertIssue(validateAnalysisStructure(nonPersonStructure), "PERSON_STRUCTURE_SCOPE");

  const recordDomain = structuredClone(nested);
  (recordDomain.entities as Array<Record<string, unknown>>)[0]!.recordRef = "persistent-record";
  assertIssue(validateAnalysisStructure(recordDomain), "ENTITY_RECORD_DOMAIN");

  const wideInheritance = structuredClone(nested);
  (wideInheritance.entities as Array<Record<string, unknown>>)[0]!.inheritedFrom = { kind: "analysis", entityId: "e1" };
  assertIssue(validateAnalysisStructure(wideInheritance), "ENTITY_WIDE_INHERITANCE");
});

test("RULE-API-13/19: Analysis unit ids, channel references and per-channel inheritance resolve", () => {
  const analysis = analysisFixture();
  const entity = (analysis.entities as Array<Record<string, unknown>>)[0]!;
  entity.englishForm = envelope({
    value: {
      formKind: "romanisation",
      assembled: true,
      person: false,
      units: [englishRomanisedUnit("u0", [0, 2], "specific", "AB", true)],
      grouping: [[0]],
    },
    provenance: "inherited",
    confidence: "medium",
    evidenceClass: "E6",
    inheritedFrom: { kind: "analysis", entityId: "e0" },
    derivedFrom: {
      layer: "L3R",
      romanisationRef: { owner: "entity", entityId: "e0", channel: "romanisation" },
      fallbackReason: "no_known_english_form",
      directStoreRead: false,
    },
  });
  assertValid(validateAnalysisStructure(analysis));

  const badReference = structuredClone(analysis);
  (((badReference.entities as Array<Record<string, unknown>>)[0]!.englishForm as Record<string, unknown>).derivedFrom as Record<string, unknown>).romanisationRef = {
    owner: "token", tokenId: "missing", channel: "romanisation",
  };
  assertIssue(validateAnalysisStructure(badReference), "ANNOTATION_REF_UNRESOLVED");

  const badInheritance = structuredClone(analysis);
  (((badInheritance.entities as Array<Record<string, unknown>>)[0]!.englishForm as Record<string, unknown>).inheritedFrom as Record<string, unknown>).entityId = "missing";
  assertIssue(validateAnalysisStructure(badInheritance), "INHERITANCE_UNRESOLVED");

  const duplicateUnits = structuredClone(analysis);
  ((duplicateUnits.tokens as Array<Record<string, unknown>>)[0]!.romanisation as Record<string, unknown>).value = {
    formKind: "romanisation",
    assembled: true,
    units: [{
      id: "u0", span: [0, 1], text: "a", syllable: "aa1", role: "specific",
      provenance: "convention_table", evidenceClass: "E6", externalAttestation: "not_attested",
    }],
    grouping: [[0]],
  };
  assertIssue(validateAnalysisStructure(duplicateUnits), "UNIT_ID_UNIQUE");
});

test("RULE-API-13 and §5.8: regions and term resolutions have deterministic identity/order/text/scope", () => {
  const analysis = analysisFixture();
  analysis.regions = [{
    id: "r0",
    span: [0, 1],
    kind: "entity_boundary",
    alternatives: [
      { span: [0, 1], text: "A", type: "other", detectionEvidence: [], confidence: "medium" },
      { span: [0, 2], text: "AB", type: "other", detectionEvidence: [], confidence: "low" },
    ],
    ranked: true,
  }];
  analysis.termResolutions = [{
    span: [0, 1],
    sourceText: "A",
    entryScope: "lexical",
    result: envelope({
      value: { preferred: "alpha", entryId: "store-1", entryScope: "lexical" },
      externalAttestation: "not_applicable",
    }),
  }];
  assertValid(validateAnalysisStructure(analysis));

  const badRegionText = structuredClone(analysis);
  ((badRegionText.regions as Array<Record<string, unknown>>)[0]!.alternatives as Array<Record<string, unknown>>)[0]!.text = "wrong";
  assertIssue(validateAnalysisStructure(badRegionText), "REGION_CANDIDATE_TEXT");

  const duplicateRegion = structuredClone(analysis);
  (duplicateRegion.regions as unknown[]).push(structuredClone((duplicateRegion.regions as unknown[])[0]));
  assertIssue(validateAnalysisStructure(duplicateRegion), "REGION_DUPLICATE");

  const primitiveRegionCandidate = structuredClone(analysis);
  (((primitiveRegionCandidate.regions as Array<Record<string, unknown>>)[0]!.alternatives) as unknown[])[0] = null;
  assertIssue(validateAnalysisStructure(primitiveRegionCandidate), "REGION_CANDIDATE_OBJECT");

  const wrongTermText = structuredClone(analysis);
  (wrongTermText.termResolutions as Array<Record<string, unknown>>)[0]!.sourceText = "wrong";
  assertIssue(validateAnalysisStructure(wrongTermText), "TERM_SOURCE_TEXT");

  const wrongScope = structuredClone(analysis);
  (((wrongScope.termResolutions as Array<Record<string, unknown>>)[0]!.result as Record<string, unknown>).value as Record<string, unknown>).entryScope = "phrase";
  assertIssue(validateAnalysisStructure(wrongScope), "TERM_SCOPE_MATCH");

  const duplicateTerm = structuredClone(analysis);
  (duplicateTerm.termResolutions as unknown[]).push(structuredClone((duplicateTerm.termResolutions as unknown[])[0]));
  assertIssue(validateAnalysisStructure(duplicateTerm), "TERM_RESOLUTION_UNIQUE");

  const primitiveTerm = structuredClone(analysis);
  (primitiveTerm.termResolutions as unknown[])[0] = null;
  assertIssue(validateAnalysisStructure(primitiveTerm), "TERM_RESOLUTION_OBJECT");
});

test("§5.16: debug lattice and trace references are validated within the Analysis", () => {
  const analysis = analysisFixture();
  analysis.debug = {
    lattice: {
      window: [0, 2],
      edges: [{ index: 0, span: [0, 2], text: "AB", source: "lexicon" }],
      alternatives: [{ edgeIndices: [0] }],
    },
    trace: [
      {
        target: { kind: "annotation", ref: { owner: "token", tokenId: "t0", channel: "reading" } },
        layer: "L2", chain: "A", steps: [],
      },
      { target: { kind: "termResolution", index: 0 }, layer: "L4", chain: "D", steps: [] },
    ],
    segmentation: { inertAmbiguities: 0, consequentialAmbiguities: 0 },
  };
  assertIssue(validateAnalysisStructure(analysis), "TRACE_TERM_INDEX");

  const badAnnotation = structuredClone(analysis);
  ((badAnnotation.debug as Record<string, unknown>).trace as Array<Record<string, unknown>>)[0]!.target = {
    kind: "annotation",
    ref: { owner: "token", tokenId: "t0", channel: "englishForm" },
  };
  assertIssue(validateAnalysisStructure(badAnnotation), "ANNOTATION_REF_CHANNEL");

  const badLattice = structuredClone(analysis);
  (((badLattice.debug as Record<string, unknown>).lattice as Record<string, unknown>).edges as Array<Record<string, unknown>>)[0]!.text = "wrong";
  assertIssue(validateAnalysisStructure(badLattice), "LATTICE_EDGE_TEXT");
});

test("T-API-030 and §5.12: TranslationDirectives shape preserves style, overlap, protection and reason legality", () => {
  const valid = {
    schemaVersion: "1.0",
    sourceHash: SOURCE_HASH,
    offsetUnit: "utf16",
    styleUsed: "joined",
    protectedSpans: [{
      span: [0, 1],
      entityId: "e0",
      replacement: "Chan",
      entityType: "person",
      formKind: "romanisation",
      assembled: true,
      provenance: "convention_table",
      styleApplied: "joined",
      evidenceClass: "E1a",
      externalAttestation: "not_attested",
      protection: "strict",
      rationale: "selected person form",
    }],
    termDirectives: [{
      span: [2, 3], sourceText: "港", preferred: "harbour", entryScope: "lexical",
      entryId: "term-1", evidenceClass: "E1a",
    }],
    unresolvedSemanticSpans: [
      { span: [3, 4], status: "ambiguous" },
      { span: [4, 5], status: "unresolved", reason: "no_known_english_form" },
    ],
    diagnostics: [],
  };
  assertValid(validateTranslationDirectivesShape(valid));

  const { diagnostics: _omittedDiagnostics, ...withoutDiagnostics } = valid;
  assertIssue(validateTranslationDirectivesShape(withoutDiagnostics), "DIRECTIVES_SHAPE");
  assertIssue(validateTranslationDirectivesShape({
    ...valid,
    diagnostics: [{ code: "WINDOW_CEILING_REACHED", severity: "warning", span: [0, 1], message: "wrong owner" }],
  }), "PROJECTION_DIAGNOSTIC_OWNER");
  assertIssue(validateTranslationDirectivesShape({
    ...valid,
    diagnostics: [{ code: "TERM_DIRECTIVE_DROPPED_OVERLAP", severity: "warning", message: "missing span" }],
  }), "SPAN");

  assertIssue(validateTranslationDirectivesShape({ ...valid, styleUsed: "spaced" }), "DIRECTIVE_STYLE");
  assertIssue(validateTranslationDirectivesShape({
    ...valid,
    protectedSpans: [valid.protectedSpans[0], { ...valid.protectedSpans[0], span: [0, 2] }],
  }), "PROTECTED_SPAN_OVERLAP");
  assertIssue(validateTranslationDirectivesShape({
    ...valid,
    protectedSpans: [{ ...valid.protectedSpans[0], protection: "preferred" }],
  }), "PROTECTION_EVIDENCE");
  assertIssue(validateTranslationDirectivesShape({
    ...valid,
    protectedSpans: [{ ...valid.protectedSpans[0], assembled: false }],
  }), "PROTECTED_STYLE_APPLICABILITY");
  assertIssue(validateTranslationDirectivesShape({
    ...valid,
    termDirectives: [{
      span: [0, 1], sourceText: "陳", preferred: "Chan", entryScope: "lexical",
      entryId: "term-1", evidenceClass: "E1a",
    }],
  }), "DIRECTIVE_OVERLAP_REMAINS");
  assertIssue(validateTranslationDirectivesShape({
    ...valid,
    unresolvedSemanticSpans: [{ span: [3, 4], status: "ambiguous", reason: "reading_not_found" }],
  }), "UNRESOLVED_REASON_FORBIDDEN");
  assertIssue(validateTranslationDirectivesShape({
    ...valid,
    unresolvedSemanticSpans: [{ span: [3, 4], status: "unsupported" }],
  }), "UNRESOLVED_REASON_REQUIRED");
});

test("Verbatim protected replacements preserve exact text under either directive style", () => {
  const text = " McDONALD-Chan  e\u0301 ";
  for (const formKind of ["romanisation", "official_name", "native_original", "translation", "hybrid"]) {
    const analysis = analysisFixture();
    (analysis.entities as Array<Record<string, unknown>>)[0]!.englishForm = envelope({
      value: { formKind, assembled: false, text },
    });
    for (const styleUsed of ["hyphenated", "joined"]) {
      const protectedSpan = {
        span: [0, 2], entityId: "e0", entityType: "other", replacement: text,
        formKind, assembled: false, provenance: "user_glossary", evidenceClass: "E1a",
        externalAttestation: "not_attested", protection: "strict", styleApplied: null,
        rationale: "selected verbatim form",
      };
      const directives = {
        schemaVersion: "1.0", sourceHash: SOURCE_HASH, offsetUnit: "utf16", styleUsed,
        protectedSpans: [protectedSpan], termDirectives: [], unresolvedSemanticSpans: [], diagnostics: [],
      };
      assertValid(validateProjectionConsistency(analysis, directives));
      for (const replacement of ["unrelated", text.trim(), text.toLowerCase(), text.replace("-", " "), text.normalize("NFC")]) {
        const result = validateProjectionConsistency(analysis, {
          ...directives, protectedSpans: [{ ...protectedSpan, replacement }],
        });
        assertIssue(result, "PROTECTED_VERBATIM_REPLACEMENT");
        assert.equal(result.issues.find((issue) => issue.code === "PROTECTED_VERBATIM_REPLACEMENT")?.path, "$.protectedSpans[0].replacement");
      }
    }
  }
});

test("T-API-012/042/F7: overlap diagnostics are pure, exact, per-directive and deterministic", () => {
  const analysis = analysisFixture("ABCD");
  analysis.diagnostics = [{
    code: "WINDOW_CEILING_REACHED",
    severity: "warning",
    span: [0, 4],
    message: "Unrelated analysis diagnostic.",
  }];
  analysis.entities = [
    {
      id: "e0", span: [0, 1], text: "A", type: "other", primary: true,
      englishForm: envelope({ value: { formKind: "romanisation", assembled: false, text: "A" } }),
    },
    {
      id: "e1", span: [2, 3], text: "C", type: "other", primary: true,
      englishForm: envelope({ value: { formKind: "romanisation", assembled: false, text: "C" } }),
    },
  ];
  const selectedResolution = (
    span: [number, number],
    sourceText: string,
    preferred: string,
    entryId: string,
    entryScope: "lexical" | "phrase",
  ): Record<string, unknown> => ({
    span,
    sourceText,
    entryScope,
    result: envelope({
      value: { preferred, entryId, entryScope },
      evidenceClass: "E1a",
      externalAttestation: "not_applicable",
    }),
  });
  analysis.termResolutions = [
    selectedResolution([0, 3], "ABC", "first", "term-first", "phrase"),
    selectedResolution([1, 2], "B", "retained", "term-retained", "lexical"),
    selectedResolution([2, 4], "CD", "second", "term-second", "lexical"),
  ];
  const protectedSpans = [
    {
      span: [0, 1], entityId: "e0", replacement: "A", entityType: "other", formKind: "romanisation",
      assembled: false, provenance: "user_glossary", styleApplied: null, evidenceClass: "E1a",
      externalAttestation: "not_attested", protection: "strict", rationale: "selected form",
    },
    {
      span: [2, 3], entityId: "e1", replacement: "C", entityType: "other", formKind: "romanisation",
      assembled: false, provenance: "user_glossary", styleApplied: null, evidenceClass: "E1a",
      externalAttestation: "not_attested", protection: "strict", rationale: "selected form",
    },
  ];
  const before = structuredClone(analysis);
  const firstDiagnostics = materialiseProjectionDiagnostics(analysis, protectedSpans);
  const secondDiagnostics = materialiseProjectionDiagnostics(analysis, protectedSpans);
  assert.notEqual(firstDiagnostics, null);
  assert.deepEqual(firstDiagnostics, secondDiagnostics);
  assert.equal(stableJsonStringify(firstDiagnostics), stableJsonStringify(secondDiagnostics));
  assert.deepEqual(analysis, before, "diagnostic materialisation must not mutate Analysis or Analysis.diagnostics");
  assert.deepEqual(firstDiagnostics!.map((diagnostic) => diagnostic.span), [[0, 3], [2, 4]]);
  assert.equal(firstDiagnostics!.length, 2, "one directive overlapping two protected spans still emits one diagnostic");

  const directives = {
    schemaVersion: "1.0",
    sourceHash: SOURCE_HASH,
    offsetUnit: "utf16",
    styleUsed: "joined",
    protectedSpans,
    termDirectives: [{
      span: [1, 2], sourceText: "B", preferred: "retained", entryScope: "lexical",
      entryId: "term-retained", evidenceClass: "E1a",
    }],
    unresolvedSemanticSpans: [],
    diagnostics: firstDiagnostics,
  };
  assertValid(validateProjectionConsistency(analysis, directives));
  assert.deepEqual(analysis, before);
  assertValid(validateProjectionConsistency(analysis, { ...directives, styleUsed: "hyphenated" }));

  assertIssue(validateProjectionConsistency(analysis, {
    ...directives,
    diagnostics: [firstDiagnostics![0]],
  }), "PROJECTION_DIAGNOSTIC_CARDINALITY");
  assertIssue(validateProjectionConsistency(analysis, {
    ...directives,
    diagnostics: [...firstDiagnostics!, firstDiagnostics![1]],
  }), "PROJECTION_DIAGNOSTIC_CARDINALITY");
  assertIssue(validateProjectionConsistency(analysis, {
    ...directives,
    diagnostics: [{ ...firstDiagnostics![0], span: [0, 2] }, firstDiagnostics![1]],
  }), "PROJECTION_DIAGNOSTIC_ORDER");
  assertIssue(validateProjectionConsistency(analysis, {
    ...directives,
    diagnostics: [{
      ...firstDiagnostics![0],
      data: { ...(firstDiagnostics![0]!.data as Record<string, unknown>), protectedEntityIds: ["wrong"] },
    }, firstDiagnostics![1]],
  }), "PROJECTION_DIAGNOSTIC_ENTITIES");
  assertIssue(validateProjectionConsistency(analysis, {
    ...directives,
    diagnostics: [...firstDiagnostics!, (analysis.diagnostics as unknown[])[0]],
  }), "PROJECTION_DIAGNOSTIC_OWNER");
  assertIssue(validateProjectionConsistency(analysis, {
    ...directives,
    termDirectives: [
      {
        span: [0, 3], sourceText: "ABC", preferred: "first", entryScope: "phrase",
        entryId: "term-first", evidenceClass: "E1a",
      },
      ...directives.termDirectives,
    ],
  }), "DIRECTIVE_OVERLAP_REMAINS");

  const noOverlapAnalysis = analysisFixture();
  noOverlapAnalysis.termResolutions = [selectedResolution([0, 1], "A", "alpha", "term-alpha", "lexical")];
  assert.deepEqual(materialiseProjectionDiagnostics(noOverlapAnalysis, []), []);
});

test("T-API-037/039 and RULE-API-23: bounded projection consistency rejects conflicts and preserves unresolved state", () => {
  const conflictCandidateA = candidate({ preferred: "A", entryId: "entry-a", entryScope: "lexical" }, { externalAttestation: "not_applicable" });
  const conflictCandidateB = candidate({ preferred: "B", entryId: "entry-b", entryScope: "lexical" }, { externalAttestation: "not_applicable" });
  const analysis = analysisFixture();
  analysis.termResolutions = [{
      span: [0, 1],
      sourceText: "A",
      entryScope: "lexical",
      result: envelope({
        value: null,
        status: "conflict",
        confidence: "none",
        externalAttestation: "not_applicable",
        alternatives: [conflictCandidateA, conflictCandidateB],
      }),
    }];
  (analysis.entities as Array<Record<string, unknown>>)[0]!.englishForm = envelope({
    value: null,
    status: "unresolved",
    confidence: "none",
    reason: "no_known_english_form",
  });
  const directives: Record<string, unknown> = {
    schemaVersion: "1.0",
    sourceHash: SOURCE_HASH,
    offsetUnit: "utf16",
    styleUsed: "hyphenated",
    protectedSpans: [],
    termDirectives: [],
    unresolvedSemanticSpans: [{ span: [0, 2], status: "unresolved", reason: "no_known_english_form" }],
    diagnostics: [],
  };
  assertValid(validateProjectionConsistency(analysis, directives));

  assertIssue(validateProjectionConsistency(analysis, {
    ...directives,
    termDirectives: [{
      span: [0, 1], sourceText: "A", preferred: "A", entryScope: "lexical",
      entryId: "entry-a", evidenceClass: "E1a",
    }],
  }), "L4_CONFLICT_PROJECTED");
  assertIssue(validateProjectionConsistency(analysis, {
    ...directives,
    unresolvedSemanticSpans: [{ span: [0, 2], status: "unresolved", reason: "reading_not_found" }],
  }), "UNRESOLVED_PROJECTION_COPY");

  const selectedAnalysis = analysisFixture();
  selectedAnalysis.termResolutions = [{
    span: [0, 1],
    sourceText: "A",
    entryScope: "lexical",
    result: envelope({
      value: { preferred: "alpha", entryId: "entry-a", entryScope: "lexical" },
      evidenceClass: "E1a",
      externalAttestation: "not_applicable",
    }),
  }];
  const selectedDirectives = {
    ...directives,
    unresolvedSemanticSpans: [],
    termDirectives: [{
      span: [0, 1], sourceText: "A", preferred: "alpha", entryScope: "lexical",
      entryId: "entry-a", evidenceClass: "E1a",
    }],
  };
  assertValid(validateProjectionConsistency(selectedAnalysis, selectedDirectives));
  assertIssue(validateProjectionConsistency(selectedAnalysis, {
    ...selectedDirectives,
    termDirectives: [{ ...selectedDirectives.termDirectives[0], sourceText: "wrong" }],
  }), "TERM_DIRECTIVE_SOURCE_TEXT");
  assertIssue(validateProjectionConsistency(selectedAnalysis, {
    ...selectedDirectives,
    termDirectives: [{ ...selectedDirectives.termDirectives[0], evidenceClass: "E2" }],
  }), "TERM_DIRECTIVE_EVIDENCE");
});

test("T-API-008/023: tolerant enum readers preserve unknown raw values and known values", () => {
  assert.deepEqual(readConsumerEnum("resolved", knownStatusValues), { kind: "known", value: "resolved" });
  assert.deepEqual(readConsumerEnum("future_status", knownStatusValues), {
    kind: "unknown",
    raw: "future_status",
    conservativeBehaviour: "unresolved",
  });
});

test("T-API-013: deterministic test serialization recursively orders object keys but preserves arrays", () => {
  const first = { z: 2, a: { y: 1, x: 0 }, list: [{ b: true, a: false }, "tail"] };
  const reordered = { list: [{ a: false, b: true }, "tail"], a: { x: 0, y: 1 }, z: 2 };
  const expected = '{"a":{"x":0,"y":1},"list":[{"a":false,"b":true},"tail"],"z":2}';
  assert.equal(stableJsonStringify(first), expected);
  assert.equal(stableJsonStringify(reordered), expected);
  assert.equal(stableJsonStringify(first), stableJsonStringify(first));
});
