import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { Ajv2020, type ValidateFunction } from "ajv/dist/2020.js";

import {
  contractSchema,
  NON_SERIALISABLE_PUBLIC_TYPES,
  PUBLIC_SCHEMA_ROOTS,
} from "../src/schema/contract-schema.js";

type ObjectValue = Record<string, unknown>;

test("Schema generator CLI emits the complete schema from a separate working directory", () => {
  const directory = mkdtempSync(join(tmpdir(), "hklang schema "));
  try {
    const generator = fileURLToPath(new URL("../src/schema/generate-schema.js", import.meta.url));
    // The executable's path must contain spaces too: URL.pathname leaves %20 encoded.
    const moduleDirectory = join(directory, "schema module");
    cpSync(dirname(generator), moduleDirectory, { recursive: true });
    writeFileSync(join(directory, "package.json"), '{"type":"module"}\n');
    const result = spawnSync(process.execPath, [join(moduleDirectory, "generate-schema.js")], { cwd: directory, encoding: "utf8" });
    assert.equal(result.error, undefined);
    assert.equal(result.status, 0, result.stderr);
    const outputPath = join(directory, "generated", "hklang-contract-5.0.16.schema.json");
    assert.equal(result.stdout.trim(), outputPath);
    assert.equal(readFileSync(outputPath, "utf8"), `${JSON.stringify(contractSchema, null, 2)}\n`);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

function createAjv(): Ajv2020 {
  // Cross-allOf requirements are intentional. Ajv's strictRequired lint
  // cannot see those requirements, so only that lint is disabled.
  return new Ajv2020({
    strict: true,
    strictRequired: false,
    allErrors: true,
    allowUnionTypes: false,
  });
}

const ajv = createAjv();
ajv.addSchema(contractSchema);

function definitionValidator(name: string): ValidateFunction {
  const validate = ajv.getSchema(`${contractSchema.$id}#/$defs/${name}`);
  assert.ok(validate, `missing validator for ${name}`);
  return validate;
}

function schemaRecord(name: string): Readonly<Record<string, unknown>> {
  const definition = contractSchema.$defs[name];
  assert.ok(definition !== undefined && typeof definition !== "boolean", `missing object schema definition for ${name}`);
  return definition as Readonly<Record<string, unknown>>;
}

function expectValid(validate: ValidateFunction, value: unknown, label: string): void {
  assert.equal(validate(value), true, `${label}: ${JSON.stringify(validate.errors)}`);
}

function expectInvalid(validate: ValidateFunction, value: unknown, label: string): void {
  assert.equal(validate(value), false, `${label}: unexpectedly valid ${JSON.stringify(value)}`);
}

function verbatimEnglish(formKind = "official_name", text = "Nathan Road"): ObjectValue {
  return { formKind, assembled: false, text };
}

function candidate(value: unknown, rank?: number): ObjectValue {
  const result: ObjectValue = {
    value,
    provenance: "convention_table",
    evidenceClass: "E6",
    externalAttestation: "attested",
    cautions: [],
  };
  if (rank !== undefined) result.rank = rank;
  return result;
}

function englishValue(overrides: ObjectValue = {}): ObjectValue {
  return {
    value: verbatimEnglish(),
    status: "resolved",
    provenance: "convention_table",
    confidence: "medium",
    evidenceClass: "E3",
    externalAttestation: "attested",
    alternatives: [],
    ranked: false,
    cautions: [],
    ...overrides,
  };
}

function romanisationUnit(id = "u0", role = "given"): ObjectValue {
  return {
    id,
    span: [0, 1],
    text: "Leung",
    syllable: "loeng4",
    role,
    provenance: "convention_table",
    evidenceClass: "E6",
    externalAttestation: "attested",
  };
}

function romanisedEnglishUnit(id = "u0", role = "given"): ObjectValue {
  return {
    id,
    span: [0, 1],
    kind: "romanised",
    text: "Leung",
    role,
    provenance: "convention_table",
    evidenceClass: "E6",
    externalAttestation: "attested",
    syllable: "loeng4",
    generated: true,
  };
}

function literalEnglishUnit(id = "u1", role = "western_given"): ObjectValue {
  return {
    id,
    span: [1, 2],
    kind: "literal",
    text: "Alex",
    role,
    provenance: "user_glossary",
    evidenceClass: "E1a",
    externalAttestation: "not_attested",
  };
}

function translatedEnglishUnit(id = "u2", role = "generic"): ObjectValue {
  return {
    id,
    span: [2, 3],
    kind: "translated",
    text: "Road",
    role,
    provenance: "convention_table",
    evidenceClass: "E4",
    externalAttestation: "attested",
  };
}

function memoryRomanisedUnit(role = "given"): ObjectValue {
  return {
    kind: "romanised",
    text: "Leung",
    role,
    provenance: "convention_table",
    evidenceClass: "E6",
    externalAttestation: "attested",
    syllable: "loeng4",
    generated: true,
  };
}

function memoryLiteralUnit(role = "western_given"): ObjectValue {
  return {
    kind: "literal",
    text: "Alex",
    role,
    provenance: "user_glossary",
    evidenceClass: "E1a",
    externalAttestation: "not_attested",
  };
}

function memoryTranslatedUnit(role = "generic"): ObjectValue {
  return {
    kind: "translated",
    text: "Road",
    role,
    provenance: "convention_table",
    evidenceClass: "E4",
    externalAttestation: "attested",
  };
}

function attestation(): ObjectValue {
  return { scope: "individual", sourceRef: "doc:1", asOf: "2026-08-29" };
}

function validStoreEntry(overrides: ObjectValue = {}): ObjectValue {
  return {
    id: "s0",
    store: "hk_romanisation",
    key: "梁",
    value: "Leung",
    caseSensitive: false,
    match: "exact",
    createdAt: "2026-08-29T00:00:00Z",
    updatedAt: "2026-08-29T00:00:00Z",
    revision: 1,
    entryScope: "lexical",
    enabled: true,
    evidenceClass: "E1a",
    externalAttestation: "not_attested",
    attestation: null,
    validation: { ok: true, errors: [] },
    ...overrides,
  };
}

function minimalAnalysis(): ObjectValue {
  const hash = "0".repeat(64);
  return {
    schemaVersion: "1.0",
    offsetUnit: "utf16",
    source: "",
    sourceHash: hash,
    versions: {
      schemaVersion: "1.0",
      contractVersion: "5.0.16",
      providerSnapshotId: null,
      engineVersion: "engine",
      lexiconVersion: "lexicon",
      rulesVersion: "rules",
      segmenterVersion: "segmenter",
      userDataVersion: 0,
    },
    optionsHash: hash,
    documentContextUsed: false,
    tokens: [],
    entities: [],
    regions: [],
    termResolutions: [],
    diagnostics: [],
  };
}

function minimalDirectives(overrides: ObjectValue = {}): ObjectValue {
  return {
    schemaVersion: "1.0",
    sourceHash: "0".repeat(64),
    offsetUnit: "utf16",
    styleUsed: "hyphenated",
    protectedSpans: [],
    termDirectives: [],
    unresolvedSemanticSpans: [],
    diagnostics: [],
    ...overrides,
  };
}

function normaliseDocumentTagsForPreimage(tags: readonly string[] | undefined): readonly string[] {
  return [...new Set(tags ?? [])].sort();
}

function collectPropertyNames(value: unknown, output = new Set<string>()): Set<string> {
  if (Array.isArray(value)) {
    for (const item of value) collectPropertyNames(item, output);
    return output;
  }
  if (value === null || typeof value !== "object") return output;
  for (const [key, child] of Object.entries(value as ObjectValue)) {
    if (key === "properties" && child !== null && typeof child === "object" && !Array.isArray(child)) {
      for (const property of Object.keys(child as ObjectValue)) output.add(property);
    }
    collectPropertyNames(child, output);
  }
  return output;
}

test("schema is valid strict JSON Schema 2020-12 with a closed 5.0.16 root graph", () => {
  const checker = createAjv();
  assert.equal(checker.validateSchema(contractSchema), true, JSON.stringify(checker.errors));
  assert.doesNotThrow(() => checker.compile(contractSchema));

  assert.equal(contractSchema.$schema, "https://json-schema.org/draft/2020-12/schema");
  assert.equal(contractSchema.$id, "https://hklang.invalid/schema/contract/5.0.16");
  assert.equal(contractSchema.$ref, "#/$defs/Analysis");
  assert.equal(new Set(PUBLIC_SCHEMA_ROOTS).size, PUBLIC_SCHEMA_ROOTS.length, "duplicate public schema root");

  for (const root of PUBLIC_SCHEMA_ROOTS) {
    assert.ok(root in contractSchema.$defs, `missing public schema root ${root}`);
    assert.ok(definitionValidator(root), `root ${root} does not compile`);
  }

  const serialised = JSON.stringify(contractSchema);
  const references = [...serialised.matchAll(/#\/\$defs\/([A-Za-z0-9_]+)/g)].map((match) => match[1]);
  for (const reference of references) {
    assert.ok(reference !== undefined && reference in contractSchema.$defs, `dangling $ref ${reference}`);
  }
});

test("Versions and Analysis identify corrected public contract 5.0.16", () => {
  const versions = definitionValidator("Versions");
  const analysis = definitionValidator("Analysis");
  const value = minimalAnalysis();

  expectValid(analysis, value, "minimal Analysis");
  expectInvalid(
    analysis,
    { ...value, versions: { ...(value.versions as ObjectValue), contractVersion: "5.0.10" } },
    "superseded contract version",
  );
  expectInvalid(analysis, { ...value, termDirectives: [] }, "obsolete Analysis field");
  expectValid(versions, value.versions, "5.0.16 Versions");
});

test("CHG-047: every serialisable userDataVersion occurrence is an exact bounded integer", () => {
  const versions = definitionValidator("Versions");
  const imports = definitionValidator("ImportResult");
  const base = minimalAnalysis().versions as ObjectValue;
  for (const legal of [0, 1, 9007199254740990, 9007199254740991]) {
    expectValid(versions, { ...base, userDataVersion: legal }, `legal userDataVersion ${legal}`);
    expectValid(imports, {
      mode: "apply", store: "pronunciation", writesApplied: false, rows: [], userDataVersion: legal,
    }, `legal import userDataVersion ${legal}`);
  }
  for (const illegal of [-1, 0.5, 9007199254740992, Number.NaN, Number.POSITIVE_INFINITY, "1", { __int: "1" }]) {
    expectInvalid(versions, { ...base, userDataVersion: illegal }, `illegal userDataVersion ${String(illegal)}`);
    expectInvalid(imports, {
      mode: "apply", store: "pronunciation", writesApplied: false, rows: [], userDataVersion: illegal,
    }, `illegal import userDataVersion ${String(illegal)}`);
  }
  const versionSchema = contractSchema.$defs.Versions as Readonly<Record<string, unknown>>;
  const versionProperty = (versionSchema.properties as Readonly<Record<string, Readonly<Record<string, unknown>>>>).userDataVersion;
  assert.equal(versionProperty?.type, "integer");
  assert.equal(versionProperty?.minimum, 0);
  assert.equal(versionProperty?.maximum, 9007199254740991);
});

test("ProcessOptions exposes document tags while the options preimage uses exact UTF-16 set normalisation", () => {
  const validate = definitionValidator("ProcessOptions");
  expectValid(validate, {}, "omitted tags");
  expectValid(validate, { documentTags: [] }, "empty tags");
  expectValid(validate, { documentTags: ["legal", "court", "legal"] }, "duplicates and input order remain legal");
  expectValid(validate, { documentTags: ["Legal", "legal", "e\u0301", "é"] }, "case and normalisation distinctions remain semantic");
  expectInvalid(validate, { documentTags: "legal" }, "tag scalar");
  expectInvalid(validate, { documentTags: ["legal", 1] }, "non-string tag");
  expectInvalid(validate, { documentTag: "legal" }, "obsolete singular option");

  assert.deepEqual(normaliseDocumentTagsForPreimage(undefined), [], "omission normalises to the empty set");
  assert.deepEqual(normaliseDocumentTagsForPreimage([]), [], "explicit empty set has the same preimage");
  assert.deepEqual(
    normaliseDocumentTagsForPreimage(["legal", "court", "legal"]),
    ["court", "legal"],
    "exact duplicates and source order add no semantics",
  );
  assert.deepEqual(
    normaliseDocumentTagsForPreimage(["Legal", "legal", "é", "e\u0301"]),
    ["Legal", "e\u0301", "legal", "é"],
    "normalisation does not trim, case-fold, or Unicode-normalise",
  );
  assert.deepEqual(
    normaliseDocumentTagsForPreimage(["\uE000", "\u{10000}"]),
    ["\u{10000}", "\uE000"],
    "ordering is by UTF-16 code units rather than Unicode scalar value",
  );
  assert.notDeepEqual(
    normaliseDocumentTagsForPreimage(["court", "legal"]),
    normaliseDocumentTagsForPreimage(["legal"]),
    "changing the unique tag set changes the normalised preimage",
  );
});

test("diagnostic producers are closed and observable only through their owning serialisable channels", () => {
  const code = definitionValidator("DiagnosticCode");
  const diagnostic = definitionValidator("Diagnostic");
  const creation = definitionValidator("CreationDiagnostic");
  const analysisDiagnostic = definitionValidator("AnalysisDiagnostic");
  const projection = definitionValidator("ProjectionDiagnostic");
  const analysis = definitionValidator("Analysis");
  const directives = definitionValidator("TranslationDirectives");
  const knownCodes = [
    "LEXICON_MISSING_CAPABILITY",
    "WINDOW_CEILING_REACHED",
    "SOURCE_UNAVAILABLE",
    "IMPORT_VALIDATION_FAILED",
    "TERM_DIRECTIVE_DROPPED_OVERLAP",
    "PROVIDER_SNAPSHOT_INVALID",
  ] as const;
  for (const item of knownCodes) expectValid(code, item, `known diagnostic code ${item}`);
  expectInvalid(code, "EXTERNAL_PROVIDER_FAILED", "withdrawn live-provider code");
  expectInvalid(code, "FUTURE_DIAGNOSTIC", "unknown producer code");

  const lexiconWarning = {
    code: "LEXICON_MISSING_CAPABILITY",
    severity: "warning",
    message: "Frequency data is unavailable.",
  };
  const snapshotFailure = {
    code: "PROVIDER_SNAPSHOT_INVALID",
    severity: "error",
    message: "The supplied snapshot is invalid.",
  };
  const windowWarning = {
    code: "WINDOW_CEILING_REACHED",
    severity: "warning",
    span: [0, 1],
    message: "The analysis window ceiling was reached.",
  };
  const sourceWarning = {
    code: "SOURCE_UNAVAILABLE",
    severity: "warning",
    message: "A content source was unavailable.",
  };
  const overlapWarning = {
    code: "TERM_DIRECTIVE_DROPPED_OVERLAP",
    severity: "warning",
    span: [1, 2],
    message: "The selected term directive overlaps a protected span.",
    data: { entryId: "s0", entityIds: ["e0"] },
  };

  expectValid(creation, lexiconWarning, "degraded creation diagnostic");
  expectValid(creation, snapshotFailure, "fatal creation diagnostic");
  expectInvalid(creation, { ...lexiconWarning, span: [0, 1] }, "creation diagnostic source span");
  expectInvalid(creation, windowWarning, "analysis diagnostic in creation channel");

  expectValid(analysisDiagnostic, windowWarning, "analysis-owned diagnostic");
  expectValid(analysisDiagnostic, sourceWarning, "content-source analysis diagnostic");
  expectInvalid(analysisDiagnostic, lexiconWarning, "creation diagnostic in Analysis");
  expectInvalid(analysisDiagnostic, overlapWarning, "projection diagnostic in Analysis");
  expectInvalid(
    analysisDiagnostic,
    { code: "IMPORT_VALIDATION_FAILED", severity: "error", message: "Reserved." },
    "reserved diagnostic without a current Analysis producer",
  );
  expectValid(analysis, { ...minimalAnalysis(), diagnostics: [windowWarning] }, "Analysis content diagnostic");
  expectValid(analysis, { ...minimalAnalysis(), diagnostics: [sourceWarning] }, "Analysis source diagnostic");
  expectInvalid(analysis, { ...minimalAnalysis(), diagnostics: [lexiconWarning] }, "Analysis copies creation diagnostic");
  expectInvalid(analysis, { ...minimalAnalysis(), diagnostics: [overlapWarning] }, "Analysis copies projection diagnostic");

  expectValid(projection, overlapWarning, "projection overlap diagnostic");
  expectInvalid(projection, { ...overlapWarning, span: undefined }, "projection diagnostic span absent");
  expectInvalid(projection, windowWarning, "analysis diagnostic in projection channel");
  expectValid(directives, minimalDirectives(), "projection with no diagnostics");
  expectValid(directives, minimalDirectives({ diagnostics: [overlapWarning] }), "projection with owned diagnostic");
  expectInvalid(directives, minimalDirectives({ diagnostics: [lexiconWarning] }), "projection copies creation diagnostic");
  const withoutDiagnostics = minimalDirectives();
  delete withoutDiagnostics.diagnostics;
  expectInvalid(directives, withoutDiagnostics, "required projection diagnostics absent");

  expectValid(
    diagnostic,
    { code: "IMPORT_VALIDATION_FAILED", severity: "error", message: "Reserved public diagnostic shape." },
    "reserved code remains part of the public Diagnostic union",
  );
});

test("EngineCreationResult remains executable-only while its serialisable failure branch is strict", () => {
  assert.equal(PUBLIC_SCHEMA_ROOTS.includes("EngineCreationFailure"), true);
  assert.equal(PUBLIC_SCHEMA_ROOTS.includes("EngineCreationResult" as never), false);
  assert.equal(PUBLIC_SCHEMA_ROOTS.includes("EngineCreationSuccess" as never), false);
  assert.equal(NON_SERIALISABLE_PUBLIC_TYPES.includes("EngineCreationResult"), true);
  assert.equal(NON_SERIALISABLE_PUBLIC_TYPES.includes("EngineCreationSuccess"), true);
  assert.equal(NON_SERIALISABLE_PUBLIC_TYPES.includes("Engine"), true);
  assert.equal("EngineCreationResult" in contractSchema.$defs, false, "no false or permissive wire placeholder");
  assert.equal("EngineCreationSuccess" in contractSchema.$defs, false, "live Engine branch is not schema-shaped");

  const validate = definitionValidator("EngineCreationFailure");
  const providerFailure = {
    code: "PROVIDER_SNAPSHOT_INVALID",
    severity: "error",
    message: "Duplicate inputHash values.",
  };
  const lexiconWarning = {
    code: "LEXICON_MISSING_CAPABILITY",
    severity: "warning",
    message: "Frequency data is unavailable.",
  };
  const creationDiagnostic = definitionValidator("CreationDiagnostic");
  const liveEngine = {
    processText: (): never => { throw new Error("not invoked by a schema test"); },
    versions: (): ObjectValue => ({}),
    stores: {},
    validateJyutping: (): ObjectValue => ({ ok: true, errors: [] }),
  };
  const isValidSuccessData = (value: ObjectValue): boolean => (
    value.ok === true
    && value.engine !== null
    && typeof value.engine === "object"
    && Array.isArray(value.diagnostics)
    && value.diagnostics.every((item) => (
      creationDiagnostic(item)
      && (item as ObjectValue).code === "LEXICON_MISSING_CAPABILITY"
    ))
  );
  assert.equal(isValidSuccessData({ ok: true, engine: liveEngine, diagnostics: [] }), true, "clean success data");
  assert.equal(
    isValidSuccessData({ ok: true, engine: liveEngine, diagnostics: [lexiconWarning] }),
    true,
    "degraded success data",
  );
  assert.equal(isValidSuccessData({ ok: true, engine: null, diagnostics: [] }), false, "success requires a live Engine");
  assert.equal(
    isValidSuccessData({ ok: true, engine: liveEngine, diagnostics: [providerFailure] }),
    false,
    "fatal snapshot diagnostic cannot inhabit success",
  );
  expectValid(
    validate,
    { ok: false, engine: null, diagnostics: [providerFailure] },
    "fatal serialisable result branch",
  );
  expectValid(
    validate,
    { ok: false, engine: null, diagnostics: [lexiconWarning, providerFailure] },
    "fatal branch retains another creation diagnostic",
  );
  expectInvalid(validate, { ok: false, engine: null, diagnostics: [] }, "failure diagnostics empty");
  expectInvalid(validate, { ok: false, engine: null, diagnostics: [lexiconWarning] }, "fatal diagnostic absent");
  expectInvalid(validate, { ok: true, engine: null, diagnostics: [providerFailure] }, "success discriminant with null Engine");
  expectInvalid(validate, { ok: false, engine: {}, diagnostics: [providerFailure] }, "failure carries an Engine");
  expectInvalid(
    validate,
    { ok: false, engine: null, diagnostics: [{ ...providerFailure, span: [0, 1] }] },
    "creation failure diagnostic carries a source span",
  );
});

test("T-API-001..003: all seven status envelopes and null-versus-absence rules execute", () => {
  const validate = definitionValidator("ValueEnglishForm");
  const first = candidate(verbatimEnglish("romanisation", "Choi"), -7.5);
  first.attestationCount = -12.25;
  const second = candidate(verbatimEnglish("romanisation", "Choy"), 99.5);

  const legal: ReadonlyArray<readonly [string, ObjectValue]> = [
    ["resolved", englishValue()],
    ["fallback", englishValue({ status: "fallback", provenance: "rule_engine", confidence: "low", evidenceClass: "E7" })],
    ["ambiguous", englishValue({ value: null, status: "ambiguous", provenance: "none", confidence: "none", evidenceClass: null, alternatives: [first, second], ranked: true })],
    ["conflict", englishValue({ value: null, status: "conflict", provenance: "none", confidence: "none", evidenceClass: null, alternatives: [candidate(verbatimEnglish("translation", "A")), candidate(verbatimEnglish("translation", "B"))], ranked: false })],
    ["unresolved", englishValue({ value: null, status: "unresolved", provenance: "none", confidence: "none", evidenceClass: null, alternatives: [], ranked: false, reason: "no_known_english_form" })],
    ["unsupported", englishValue({ value: null, status: "unsupported", provenance: "none", confidence: "none", evidenceClass: null, alternatives: [], ranked: false, reason: "unsupported_code_point" })],
    ["out_of_scope", englishValue({ value: null, status: "out_of_scope", provenance: "none", confidence: "none", evidenceClass: null, alternatives: [], ranked: false })],
  ];
  for (const [label, value] of legal) expectValid(validate, value, label);

  const illegal: ReadonlyArray<readonly [string, ObjectValue]> = [
    ["value is absent", (() => { const value = englishValue(); delete value.value; return value; })()],
    ["resolved null", englishValue({ value: null })],
    ["fallback null", englishValue({ value: null, status: "fallback", confidence: "low" })],
    ["fallback medium", englishValue({ status: "fallback", confidence: "medium" })],
    ["ambiguous one alternative", englishValue({ value: null, status: "ambiguous", confidence: "none", alternatives: [first], ranked: true })],
    ["ambiguous unranked", englishValue({ value: null, status: "ambiguous", confidence: "none", alternatives: [candidate(verbatimEnglish()), candidate(verbatimEnglish())], ranked: false })],
    ["conflict ranked", englishValue({ value: null, status: "conflict", confidence: "none", alternatives: [first, second], ranked: true })],
    ["unresolved reason absent", englishValue({ value: null, status: "unresolved", confidence: "none", alternatives: [], ranked: false })],
    ["unsupported non-empty alternatives", englishValue({ value: null, status: "unsupported", confidence: "none", alternatives: [candidate(verbatimEnglish())], ranked: false, reason: "unsupported_code_point" })],
    ["out-of-scope reason present", englishValue({ value: null, status: "out_of_scope", confidence: "none", alternatives: [], ranked: false, reason: "no_known_english_form" })],
    ["rank absent when ranked", englishValue({ value: null, status: "ambiguous", confidence: "none", alternatives: [candidate(verbatimEnglish()), candidate(verbatimEnglish())], ranked: true })],
    ["rank present when unranked", englishValue({ value: null, status: "conflict", confidence: "none", alternatives: [candidate(verbatimEnglish(), 0), candidate(verbatimEnglish(), 1)], ranked: false })],
  ];
  for (const [label, value] of illegal) expectInvalid(validate, value, label);
});

test("selected and candidate inheritance is branch-exact", () => {
  const value = definitionValidator("ValueEnglishForm");
  const inheritedFrom = { kind: "documentContext", contextId: "ctx", ref: "m0" };
  expectValid(value, englishValue({ provenance: "inherited", inheritedFrom }), "selected inherited value");
  expectInvalid(value, englishValue({ provenance: "inherited" }), "selected inheritance source absent");
  expectInvalid(value, englishValue({ inheritedFrom }), "non-inherited selected value has inheritance source");

  const inheritedCandidate = candidate(verbatimEnglish("romanisation", "Leung"), 0);
  inheritedCandidate.provenance = "inherited";
  inheritedCandidate.inheritedFrom = { kind: "analysis", entityId: "e0" };
  const other = candidate(verbatimEnglish("romanisation", "Leong"), 1);
  expectValid(value, englishValue({ value: null, status: "ambiguous", confidence: "none", alternatives: [inheritedCandidate, other], ranked: true }), "per-candidate inheritance");
  delete inheritedCandidate.inheritedFrom;
  expectInvalid(value, englishValue({ value: null, status: "ambiguous", confidence: "none", alternatives: [inheritedCandidate, other], ranked: true }), "inherited candidate source absent");
});

test("Candidate.variation is legal only on the L2 Reading branch", () => {
  const readingCandidate = definitionValidator("CandidateReading");
  const romanisationCandidate = definitionValidator("CandidateRomanisation");
  const englishCandidate = definitionValidator("CandidateEnglishForm");
  const termCandidate = definitionValidator("CandidateTermRendering");
  const reading = {
    jyutping: "jat1",
    syllables: [{ jyutping: "jat1", initial: "j", final: "at", tone: 1, syllabic: false, span: [0, 1], align: "exact" }],
    alignmentGroups: [],
  };
  expectValid(readingCandidate, { ...candidate(reading), variation: "sandhi", externalAttestation: "not_applicable" }, "L2 variation");
  expectInvalid(romanisationCandidate, { ...candidate({ formKind: "romanisation", assembled: false, text: "Yat" }), variation: "sandhi" }, "L3R variation forbidden");
  expectInvalid(englishCandidate, { ...candidate(verbatimEnglish()), variation: "sandhi" }, "L3E variation forbidden");
  expectInvalid(termCandidate, { ...candidate({ preferred: "Road", entryId: "t0", entryScope: "lexical" }), variation: "sandhi" }, "L4 variation forbidden");
});

test("Romanisation discriminants preserve verbatim and assembled states exactly", () => {
  const validate = definitionValidator("Romanisation");
  expectValid(validate, { formKind: "romanisation", assembled: false, text: "Leung" }, "verbatim");
  expectInvalid(validate, { formKind: "romanisation", assembled: false, text: "Leung", units: [] }, "verbatim units forbidden");
  expectInvalid(validate, { formKind: "translation", assembled: false, text: "Leung" }, "wrong romanisation form kind");

  expectValid(validate, { formKind: "romanisation", assembled: true, units: [romanisationUnit()], grouping: [[0]] }, "assembled");
  expectInvalid(validate, { formKind: "romanisation", assembled: true, units: [], grouping: [[-1.5, 99, 99]] }, "fractional/negative/out-of-range grouping rejected");
  expectInvalid(validate, { formKind: "romanisation", assembled: true, text: "Leung", units: [romanisationUnit()], grouping: [[0]] }, "assembled canonical text forbidden");
  expectInvalid(validate, { formKind: "romanisation", assembled: true, units: [romanisationUnit()] }, "assembled grouping required");
});

test("CHG-048: every public grouping scalar is an integer local-index domain", () => {
  const grouping = definitionValidator("Grouping");
  expectInvalid(grouping, [], "CHG-050 forbids empty grouping");
  expectInvalid(grouping, [[]], "CHG-050 forbids empty inner group");
  expectValid(grouping, [[0], [1, 2]], "non-negative integer indices");
  for (const illegal of [[[-1]], [[0.5]], [[9007199254740992]], [[Number.NaN]], [[Number.POSITIVE_INFINITY]]]) {
    expectInvalid(grouping, illegal, `illegal grouping scalar ${String(illegal[0]?.[0])}`);
  }
  const definition = contractSchema.$defs.Grouping as Readonly<Record<string, unknown>>;
  const groupItems = definition.items as Readonly<Record<string, unknown>>;
  const scalar = groupItems.items as Readonly<Record<string, unknown>>;
  assert.equal(definition.minItems, 1);
  assert.equal(groupItems.minItems, 1);
  assert.equal(scalar.type, "integer");
  assert.equal(scalar.minimum, 0);
  assert.equal(scalar.maximum, 9007199254740991);
  const memoryStyle = schemaRecord("MemoryStyleApplicable");
  const unitIndices = (memoryStyle.properties as Readonly<Record<string, Readonly<Record<string, unknown>>>>).unitIndices;
  const indexScalar = unitIndices?.items as Readonly<Record<string, unknown>>;
  assert.equal(indexScalar.type, "integer");
  assert.equal(indexScalar.minimum, 0);
  assert.equal(indexScalar.maximum, 9007199254740991);
});

test("EnglishForm admits every verbatim kind and only legal assembled mixtures", () => {
  const validate = definitionValidator("EnglishForm");
  const romanisedUnit = definitionValidator("RomanisedEnglishUnit");
  const literalUnit = definitionValidator("LiteralEnglishUnit");
  const translatedUnit = definitionValidator("TranslatedEnglishUnit");
  for (const formKind of ["romanisation", "official_name", "native_original", "translation", "hybrid"]) {
    expectValid(validate, verbatimEnglish(formKind, `${formKind} text`), `verbatim ${formKind}`);
  }
  expectInvalid(validate, { ...verbatimEnglish(), person: false }, "verbatim person marker forbidden");

  const romanisedSurname = romanisedEnglishUnit("u0", "surname");
  const romanisedGiven = romanisedEnglishUnit("u1", "given");
  const literalWestern = literalEnglishUnit("u2", "western_given");
  const translated = translatedEnglishUnit("u3", "generic");
  expectValid(validate, { formKind: "romanisation", assembled: true, units: [romanisedSurname], grouping: [[0]], person: false }, "non-person romanisation");
  expectValid(validate, { formKind: "romanisation", assembled: true, units: [romanisedSurname], grouping: [[0]], person: true }, "unstyled person romanisation");
  expectValid(validate, { formKind: "romanisation", assembled: true, units: [romanisedGiven], grouping: [[0]], person: true, styleApplicable: { scope: "givenName", unitIds: ["u1"] } }, "styled person generated given-name unit");
  expectValid(validate, { formKind: "hybrid", assembled: true, units: [romanisedSurname, romanisedGiven, literalWestern], grouping: [[0, 1, 2]], person: true, styleApplicable: { scope: "givenName", unitIds: ["u1"] } }, "mixed personal name with styled given unit and western literal");
  expectValid(validate, { formKind: "hybrid", assembled: true, units: [romanisedSurname, translated], grouping: [[0], [1]], person: false }, "romanised plus translated hybrid");

  for (const formKind of ["official_name", "native_original", "translation"]) {
    expectInvalid(validate, { formKind, assembled: true, units: [romanisedSurname], grouping: [[0]], person: false }, `assembled ${formKind}`);
  }
  expectInvalid(validate, { formKind: "romanisation", assembled: true, units: [literalWestern], grouping: [[0]], person: true }, "romanisation contains literal unit");
  expectInvalid(validate, { formKind: "hybrid", assembled: true, units: [romanisedSurname], grouping: [[0]], person: false }, "hybrid lacks non-romanised unit");
  expectInvalid(validate, { formKind: "hybrid", assembled: true, units: [literalWestern], grouping: [[0]], person: false }, "hybrid lacks romanised unit");
  expectInvalid(validate, { formKind: "hybrid", assembled: true, units: [], grouping: [], person: false }, "assembled English units non-empty");
  expectInvalid(validate, { formKind: "romanisation", assembled: true, units: [romanisedGiven], grouping: [[0]], person: false, styleApplicable: { scope: "givenName", unitIds: ["u1"] } }, "non-person styling forbidden");
  expectInvalid(validate, { formKind: "romanisation", assembled: true, units: [romanisedGiven], grouping: [[0]], person: true, styleApplicable: { scope: "givenName", unitIds: [] } }, "style target non-empty");
  expectValid(literalUnit, literalWestern, "literal western-given unit");
  expectInvalid(romanisedUnit, { ...romanisedSurname, role: "western_given" }, "romanised western-given unit forbidden");
  expectInvalid(translatedUnit, { ...translated, role: "western_given" }, "translated western-given unit forbidden");
});

test("memory forms mirror all legal discriminants while excluding spans and Analysis-local ids", () => {
  const romanisation = definitionValidator("MemoryRomanisation");
  const english = definitionValidator("MemoryEnglishForm");
  const context = definitionValidator("DocumentContext");
  const romanisedUnit = definitionValidator("MemoryRomanisedEnglishUnit");
  const literalUnit = definitionValidator("MemoryLiteralEnglishUnit");
  const translatedUnit = definitionValidator("MemoryTranslatedEnglishUnit");

  expectValid(romanisation, { formKind: "romanisation", assembled: false, text: "Leung" }, "memory verbatim romanisation");
  expectValid(romanisation, {
    formKind: "romanisation",
    assembled: true,
    units: [{ text: "Leung", syllable: "loeng4", role: "surname", provenance: "rule_engine", evidenceClass: "E7", externalAttestation: "not_attested" }],
    grouping: [[0]],
  }, "memory assembled romanisation");
  expectInvalid(romanisation, { formKind: "romanisation", assembled: false, text: "Leung", grouping: [] }, "memory verbatim grouping forbidden");

  for (const formKind of ["romanisation", "official_name", "native_original", "translation", "hybrid"]) {
    expectValid(english, verbatimEnglish(formKind, `memory ${formKind}`), `memory verbatim ${formKind}`);
  }
  const romanised = memoryRomanisedUnit("surname");
  const romanisedGiven = memoryRomanisedUnit("given");
  const literal = memoryLiteralUnit("western_given");
  const translated = memoryTranslatedUnit("generic");
  expectValid(english, { formKind: "romanisation", assembled: true, units: [romanisedGiven], grouping: [[0]], person: true, styleApplicable: { scope: "givenName", unitIndices: [0] } }, "memory styled generated given-name unit");
  expectValid(english, { formKind: "romanisation", assembled: true, units: [romanised], grouping: [[0]], person: false }, "memory non-person");
  expectValid(english, { formKind: "hybrid", assembled: true, units: [romanised, literal], grouping: [[0, 1]], person: true }, "memory mixed personal name");
  expectValid(english, { formKind: "hybrid", assembled: true, units: [romanised, translated], grouping: [[0], [1]], person: false }, "memory translated hybrid");
  expectInvalid(english, { formKind: "hybrid", assembled: true, units: [romanised], grouping: [[0]], person: false }, "memory hybrid lacks non-romanised unit");
  expectInvalid(english, { formKind: "romanisation", assembled: true, units: [literal], grouping: [[0]], person: true }, "memory romanisation contains literal unit");
  expectValid(literalUnit, literal, "memory literal western-given unit");
  expectInvalid(romanisedUnit, { ...romanised, role: "western_given" }, "memory romanised western-given unit forbidden");
  expectInvalid(translatedUnit, { ...translated, role: "western_given" }, "memory translated western-given unit forbidden");

  const memoryChannel = {
    value: { formKind: "hybrid", assembled: true, units: [romanised, literal], grouping: [[0, 1]], person: true },
    status: "resolved",
    provenance: "inherited",
    confidence: "medium",
    evidenceClass: "E6",
    externalAttestation: "attested",
    cautions: [],
  };
  const documentContext = {
    contextFormatVersion: "1",
    id: "ctx",
    entities: [{
      ref: "m0",
      text: "梁 Alex",
      aliases: ["Alex Leung"],
      type: "person",
      name: { surnameText: "梁", westernGivenText: "Alex", compoundSurname: false, order: "surname_first" },
      englishForm: memoryChannel,
    }],
  };
  expectValid(context, documentContext, "recursive memory context");
  const withSpan = structuredClone(documentContext);
  const spanUnit = withSpan.entities[0]?.englishForm.value.units[0];
  assert.ok(spanUnit);
  Object.assign(spanUnit, { span: [0, 1] });
  expectInvalid(context, withSpan, "memory unit source span forbidden");
  const withId = structuredClone(documentContext);
  const idUnit = withId.entities[0]?.englishForm.value.units[0];
  assert.ok(idUnit);
  Object.assign(idUnit, { id: "u0" });
  expectInvalid(context, withId, "memory unit Analysis id forbidden");
  const withReservedChannelProvenance = structuredClone(documentContext);
  withReservedChannelProvenance.entities[0]!.englishForm.provenance = "entity_record";
  expectInvalid(context, withReservedChannelProvenance, "reserved Entity Record provenance has no v1 memory producer");
  const withReservedUnitProvenance = structuredClone(documentContext);
  withReservedUnitProvenance.entities[0]!.englishForm.value.units[0]!.provenance = "external";
  expectInvalid(context, withReservedUnitProvenance, "reserved external provenance has no v1 memory-unit producer");
  expectInvalid(context, { ...documentContext, entities: [{ ref: "m0", text: "中環", type: "place.area", name: { compoundSurname: false, order: "surname_first" } }] }, "non-person memory name forbidden");

  const channel = definitionValidator("MemoryChannelEnglishForm");
  expectValid(channel, { ...memoryChannel, status: "fallback", confidence: "low" }, "memory fallback channel");
  expectInvalid(channel, { ...memoryChannel, status: "fallback", confidence: "high" }, "memory fallback confidence");
  expectInvalid(channel, { ...memoryChannel, status: "ambiguous", confidence: "none" }, "memory ambiguous channel");
  expectInvalid(channel, { ...memoryChannel, value: null }, "memory null selected value");
});

test("T-CACHE-037 structural half: full nested DocumentContext integer fixture closes", () => {
  const validate = definitionValidator("DocumentContext");
  const context = {
    contextFormatVersion: "1",
    id: "ctx",
    entities: [{
      ref: "m0",
      text: "梁知",
      type: "person",
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
          units: [memoryRomanisedUnit("given")],
          grouping: [[0]],
          styleApplicable: { scope: "givenName", unitIndices: [0] },
        },
        status: "resolved", provenance: "rule_engine", confidence: "low", evidenceClass: "E7",
        externalAttestation: "not_applicable", cautions: [],
      },
    }],
  };
  expectValid(validate, context, "full nested integer fixture");
  const badFraction = structuredClone(context);
  badFraction.entities[0]!.romanisation.value.grouping = [[0.5]];
  expectInvalid(validate, badFraction, "fractional nested grouping");
  const badUnsafe = structuredClone(context);
  badUnsafe.entities[0]!.englishForm.value.styleApplicable.unitIndices = [9007199254740992];
  expectInvalid(validate, badUnsafe, "unsafe nested style index");
  const badTone = structuredClone(context);
  badTone.entities[0]!.reading.value.syllables[0]!.tone = 1.5;
  expectInvalid(validate, badTone, "fractional nested tone");
});

test("GeneratedPersonNameStyle is narrowed independently from display-only styles", () => {
  const generated = definitionValidator("GeneratedPersonNameStyle");
  expectValid(generated, "hyphenated", "generated hyphenated style");
  expectValid(generated, "joined", "generated joined style");
  for (const displayOnly of ["spaced", "hyphen_title", "surname_caps"]) {
    expectInvalid(generated, displayOnly, `display-only style ${displayOnly}`);
  }
});

test("AnnotationRef, RomanisationRef, DerivedFrom and InheritanceRef unions are owner-exact", () => {
  const annotation = definitionValidator("AnnotationRef");
  const romanisation = definitionValidator("RomanisationRef");
  const derived = definitionValidator("DerivedFrom");
  const inheritance = definitionValidator("InheritanceRef");

  for (const channel of ["reading", "romanisation", "englishForm"]) {
    expectValid(annotation, { owner: "entity", entityId: "e0", channel }, `entity ${channel} ref`);
  }
  for (const channel of ["reading", "romanisation"]) {
    expectValid(annotation, { owner: "token", tokenId: "t0", channel }, `token ${channel} ref`);
  }
  expectInvalid(annotation, { owner: "token", tokenId: "t0", channel: "englishForm" }, "token English-form ref");
  expectInvalid(annotation, { owner: "entity", entityId: "e0", tokenId: "t0", channel: "romanisation" }, "mixed owner ids");
  expectValid(romanisation, { owner: "entity", entityId: "e0", channel: "romanisation" }, "entity romanisation ref");
  expectValid(romanisation, { owner: "token", tokenId: "t0", channel: "romanisation" }, "token romanisation ref");
  expectInvalid(romanisation, { owner: "entity", entityId: "e0", channel: "reading" }, "non-romanisation channel");

  const baseDerived = {
    layer: "L3R",
    romanisationRef: { owner: "entity", entityId: "e0", channel: "romanisation" },
    fallbackReason: "no_known_english_form",
    directStoreRead: false,
  };
  expectValid(derived, baseDerived, "L3E derived-from L3R");
  expectInvalid(derived, { ...baseDerived, directStoreRead: true }, "direct Chain-C store read");
  expectInvalid(derived, { ...baseDerived, layer: "L3E" }, "wrong source layer");

  expectValid(inheritance, { kind: "analysis", entityId: "e0" }, "analysis inheritance");
  expectValid(inheritance, { kind: "documentContext", contextId: "ctx", ref: "m0" }, "memory inheritance");
  expectInvalid(inheritance, { kind: "analysis", entityId: "e0", ref: "m0" }, "mixed inheritance branch");
  expectInvalid(inheritance, { kind: "documentContext", contextId: "ctx", entityId: "e0", ref: "m0" }, "Analysis id in memory inheritance");
});

test("StoreEntry schema enforces the complete valid-store evidence and applicability matrix", () => {
  const validate = definitionValidator("StoreEntry");
  const evidenceStates: ReadonlyArray<readonly [string, ObjectValue, ObjectValue]> = [
    ["E1a", { evidenceClass: "E1a", externalAttestation: "not_attested", attestation: null }, { evidenceClass: "E1a", externalAttestation: "not_applicable", attestation: null }],
    ["E1b", { evidenceClass: "E1b", externalAttestation: "not_attested", attestation: null }, { evidenceClass: "E1b", externalAttestation: "not_applicable", attestation: null }],
    ["E1c", { evidenceClass: "E1c", externalAttestation: "attested" }, { evidenceClass: "E1c", externalAttestation: "not_applicable" }],
    ["E2", { evidenceClass: "E2", externalAttestation: "attested", attestation: attestation() }, { evidenceClass: "E2", externalAttestation: "not_applicable", attestation: attestation() }],
  ];

  for (const [label, applicable, inapplicable] of evidenceStates) {
    expectValid(validate, validStoreEntry({ store: "hk_romanisation", ...applicable }), `HK romanisation ${label}`);
    expectValid(validate, validStoreEntry({ store: "translation", entryScope: "entity", formKind: "hybrid", ...applicable }), `entity translation ${label}`);
    expectValid(validate, validStoreEntry({ store: "pronunciation", ...inapplicable }), `pronunciation ${label}`);
    expectValid(validate, validStoreEntry({ store: "translation", entryScope: "lexical", ...inapplicable }), `lexical translation ${label}`);
    expectValid(validate, validStoreEntry({ store: "translation", entryScope: "phrase", ...inapplicable }), `phrase translation ${label}`);
  }

  for (const formKind of ["romanisation", "official_name", "native_original", "translation", "hybrid"]) {
    expectValid(validate, validStoreEntry({ store: "translation", entryScope: "entity", formKind }), `entity formKind ${formKind}`);
  }
  expectInvalid(validate, validStoreEntry({ store: "translation", entryScope: "entity" }), "entity translation formKind absent");
  expectInvalid(validate, validStoreEntry({ store: "translation", entryScope: "lexical", formKind: "translation", externalAttestation: "not_applicable" }), "lexical translation formKind present");
  expectInvalid(validate, validStoreEntry({ store: "pronunciation", formKind: "romanisation", externalAttestation: "not_applicable" }), "pronunciation formKind present");
  expectInvalid(validate, validStoreEntry({ store: "pronunciation", externalAttestation: "attested" }), "L2 external attestation applicable");
  expectInvalid(validate, validStoreEntry({ store: "hk_romanisation", externalAttestation: "not_applicable" }), "L3R external attestation inapplicable");
  expectInvalid(validate, validStoreEntry({ evidenceClass: "E2", externalAttestation: "attested", attestation: null }), "E2 documentary attestation absent");
  expectInvalid(validate, validStoreEntry({ entryScope: "lexical", entityTypeHint: "person" }), "non-entity type hint");

  const e1cAbsent = validStoreEntry({ evidenceClass: "E1c", externalAttestation: "attested" });
  delete e1cAbsent.attestation;
  expectValid(validate, e1cAbsent, "E1c attestation absent");
  expectValid(validate, validStoreEntry({ evidenceClass: "E1c", externalAttestation: "attested", attestation: attestation() }), "E1c documentary detail present");

  // Context applicability to exact/contextual matching is deliberately not
  // invented because §5 leaves that relationship unspecified.
  expectValid(validate, validStoreEntry({ match: "exact", context: { documentTag: "court" } }), "exact entry with context residue");
  expectValid(validate, validStoreEntry({ match: "contextual" }), "contextual entry without context residue");
});

test("invalid StoreEntry quarantine retains bad rows, while E3..E7 remain outside the StoreEntry domain", () => {
  const entry = definitionValidator("StoreEntry");
  const row = definitionValidator("StoreImportRow");
  const preview = definitionValidator("ImportPreview");
  const error = { code: "STORE_EVIDENCE", path: ["evidenceClass"], message: "E3 is outside StoreEvidenceClass" };

  const quarantined = validStoreEntry({
    store: "pronunciation",
    formKind: "hybrid",
    externalAttestation: "attested",
    enabled: false,
    validation: { ok: false, errors: [error] },
  });
  expectValid(entry, quarantined, "disabled invalid entry preserves contradictory source row");
  expectInvalid(entry, { ...quarantined, enabled: true }, "invalid entry enabled");
  expectInvalid(entry, { ...quarantined, validation: { ok: false, errors: [] } }, "invalid entry without errors");

  for (const evidenceClass of ["E3", "E4", "E5", "E6", "E7"]) {
    const raw = { ...validStoreEntry(), evidenceClass };
    expectInvalid(entry, raw, `StoreEntry excludes ${evidenceClass}`);
    const importRow = { index: 0, action: "invalid", input: raw, conflicts: [], errors: [error] };
    expectValid(row, importRow, `import row quarantines raw ${evidenceClass}`);
    expectInvalid(row, { ...importRow, entry: raw }, `import row cannot materialise ${evidenceClass} StoreEntry`);
  }

  const rows = [{ index: 0, action: "invalid", input: { evidenceClass: "E7" }, conflicts: [], errors: [error] }];
  expectValid(preview, { mode: "preview", store: "translation", writesApplied: false, rows }, "preview invalid row without write");
  expectInvalid(preview, { mode: "preview", store: "translation", writesApplied: true, rows }, "preview write forbidden");
});

test("grouped alignment shapes execute without inventing assembly grouping semantics", () => {
  const syllable = definitionValidator("Syllable");
  const grouped = definitionValidator("GroupedAlignment");
  const reading = definitionValidator("Reading");
  const base = { jyutping: "jat1", initial: "j", final: "at", tone: 1, syllabic: false };

  expectValid(syllable, { ...base, span: [0, 1], align: "exact" }, "exact aligned syllable");
  expectValid(syllable, { ...base, span: [0, 2], align: "spread" }, "spread aligned syllable");
  expectValid(syllable, { ...base, span: null, align: "grouped" }, "grouped syllable");
  expectInvalid(syllable, { ...base, span: null, align: "exact" }, "exact syllable null span");
  expectInvalid(syllable, { ...base, span: [0, 1], align: "grouped" }, "grouped syllable own span");

  expectValid(grouped, { span: [0, 2], syllableIndices: [0, 1] }, "group of two syllables");
  expectInvalid(grouped, { span: [0, 2], syllableIndices: [0] }, "group too small");
  expectInvalid(grouped, { span: [0, 2], syllableIndices: [0, 0] }, "duplicate group index");
  expectInvalid(grouped, { span: [0, 2], syllableIndices: [-1, 0] }, "negative group index");

  expectValid(reading, {
    jyutping: "jat1 ji6",
    syllables: [
      { ...base, span: null, align: "grouped" },
      { ...base, jyutping: "ji6", final: "i", tone: 6, span: null, align: "grouped" },
    ],
    alignmentGroups: [{ span: [0, 2], syllableIndices: [0, 1] }],
  }, "reading with explicit grouped alignment");
  expectInvalid(reading, { jyutping: "jat1", syllables: [{ ...base, span: [0, 1], align: "exact" }] }, "alignmentGroups field required");
});

test("UnresolvedSemanticSpan is a strict four-status discriminated union", () => {
  const validate = definitionValidator("UnresolvedSemanticSpan");
  expectValid(validate, { span: [0, 1], status: "ambiguous" }, "ambiguous span");
  expectValid(validate, { span: [0, 1], status: "conflict" }, "conflict span");
  expectValid(validate, { span: [0, 1], status: "unresolved", reason: "no_known_english_form" }, "unresolved span");
  expectValid(validate, { span: [0, 1], status: "unsupported", reason: "unsupported_code_point" }, "unsupported span");
  expectInvalid(validate, { span: [0, 1], status: "ambiguous", reason: "no_known_english_form" }, "ambiguous reason forbidden");
  expectInvalid(validate, { span: [0, 1], status: "unresolved" }, "unresolved reason absent");
  expectInvalid(validate, { span: [0, 1], status: "out_of_scope" }, "out-of-scope omitted by public directive union");
  expectInvalid(validate, { span: [0, 1], status: "unsupported", reason: "made_up" }, "open reason code forbidden to producer");
});

test("CanonicalValue is recursive, disjoint, integer-only and int64-bounded", () => {
  const validate = definitionValidator("CanonicalValue");
  const legal: ReadonlyArray<unknown> = [
    null,
    true,
    "text",
    { __int: "0" },
    { __int: "9223372036854775807" },
    { __int: "-9223372036854775808" },
    [],
    [null, false, { __int: "-1" }, { nested: ["x"] }],
    {},
    { alpha: "a", nested: { count: { __int: "4" } } },
  ];
  for (const value of legal) expectValid(validate, value, `canonical ${JSON.stringify(value)}`);

  const illegal: ReadonlyArray<unknown> = [
    0,
    1.5,
    { __int: "+1" },
    { __int: "01" },
    { __int: "-0" },
    { __int: "9223372036854775808" },
    { __int: "-9223372036854775809" },
    { __int: "1", extra: null },
    { ordinary: true, __int: "1" },
  ];
  for (const value of illegal) expectInvalid(validate, value, `non-canonical ${JSON.stringify(value)}`);
});

test("ProviderSnapshot has the corrected strict public shape and canonical outputs", () => {
  const validate = definitionValidator("ProviderSnapshot");
  const hashA = "0".repeat(64);
  const hashB = "a".repeat(64);
  const snapshot = {
    id: hashA,
    snapshotFormatVersion: "1",
    providerId: "provider",
    providerConfigHash: "config-v1",
    createdAt: "2026-08-29T00:00:00Z",
    entries: [
      { inputHash: hashA, output: { __int: "1" } },
      { inputHash: hashB, output: { text: "result" } },
    ],
  };
  expectValid(validate, snapshot, "provider snapshot");
  expectInvalid(validate, { ...snapshot, snapshotFormatVersion: "2" }, "snapshot format version");
  expectInvalid(validate, { ...snapshot, id: "not-a-hash" }, "snapshot id grammar");
  expectInvalid(validate, { ...snapshot, providerConfigHash: "" }, "empty provider configuration hash");
  expectInvalid(validate, { ...snapshot, entries: [{ inputHash: hashA, output: 1 }] }, "non-canonical numeric output");
  expectInvalid(validate, { ...snapshot, provider: "legacy" }, "unknown provider field");

  // Uniqueness by inputHash and id recomputation are cross-object/hash
  // invariants, deliberately handled by executable validation outside schema.
  expectValid(validate, { ...snapshot, entries: [{ inputHash: hashA, output: null }, { inputHash: hashA, output: true }] }, "structural snapshot before duplicate-hash validation");
});

test("Lattice closes edge discriminants and local index domains", () => {
  const edge = definitionValidator("LatticeEdge");
  const lattice = definitionValidator("Lattice");
  const reference = { index: 0, span: [0, 1], text: "香", matchedKey: "香", source: "lexicon" };
  const store = { index: 1, span: [1, 2], text: "港", source: "forced", entryId: "s0" };

  expectValid(edge, reference, "reference edge");
  expectValid(edge, store, "store edge");
  expectInvalid(edge, { ...reference, entryId: "s0" }, "reference edge entry id forbidden");
  expectInvalid(edge, { index: 1, span: [1, 2], text: "港", source: "user_glossary" }, "store edge entry id required");
  expectInvalid(edge, { ...store, source: "external" }, "unknown edge producer");
  expectValid(lattice, { window: [0, 2], edges: [reference, store], alternatives: [{ edgeIndices: [0, 1] }] }, "structural lattice");
  expectInvalid(lattice, { window: [0, 2], edges: [reference], alternatives: [{ edgeIndices: [] }] }, "empty path");

  expectInvalid(lattice, {
    window: [0, 1],
    edges: [{ ...reference, index: -0.5 }],
    alternatives: [{ edgeIndices: [99.25] }],
  }, "fractional or negative local indices");

  // Consecutive edge ordering, in-range alternative references and complete
  // path coverage remain cross-array invariants for executable validation.
  expectValid(lattice, {
    window: [0, 1],
    edges: [{ ...reference, index: 7 }],
    alternatives: [{ edgeIndices: [99] }],
  }, "integer-domain lattice awaiting cross-array validation");
});

test("current producers are enum-closed while reserved provenance remains consumer-readable", () => {
  const provenance = definitionValidator("Provenance");
  const produced = definitionValidator("ProducedProvenance");
  const value = definitionValidator("ValueEnglishForm");
  const unit = definitionValidator("RomanisationUnit");

  for (const item of ["user_glossary", "entity_record", "convention_table", "lexicon", "rule_engine", "external", "inherited", "none"]) {
    expectValid(provenance, item, `public provenance ${item}`);
  }
  for (const item of ["user_glossary", "convention_table", "lexicon", "rule_engine", "inherited", "none"]) {
    expectValid(produced, item, `producer provenance ${item}`);
  }
  for (const item of ["entity_record", "external", "future_producer"]) {
    expectInvalid(produced, item, `reserved/unknown producer ${item}`);
    expectInvalid(value, englishValue({ provenance: item }), `Value producer ${item}`);
    expectInvalid(unit, { ...romanisationUnit(), provenance: item }, `unit producer ${item}`);
  }
  expectInvalid(provenance, "future_provenance", "unknown public provenance");
});

test("no v1 durable Entity Record persistence domain is materialised", () => {
  const definitionNames = Object.keys(contractSchema.$defs);
  assert.equal(definitionNames.some((name) => /^EntityRecords?(?:Api|Store|Entry)?$/u.test(name)), false);
  assert.equal(PUBLIC_SCHEMA_ROOTS.some((name) => /^EntityRecords?/u.test(name)), false);
  assert.equal(NON_SERIALISABLE_PUBLIC_TYPES.some((name) => /^EntityRecords?/u.test(name)), false);

  const properties = collectPropertyNames(contractSchema);
  for (const forbidden of ["entityRecord", "entityRecords", "entityRecordId", "entityRecordStore"]) {
    assert.equal(properties.has(forbidden), false, `durable Entity Record property ${forbidden}`);
  }

  const analysis = definitionValidator("Analysis");
  expectInvalid(analysis, { ...minimalAnalysis(), entityRecords: [] }, "Analysis Entity Record persistence field");

  // The reserved provenance literal is intentionally still readable; its
  // presence is not a persistence subsystem and producers cannot emit it.
  expectValid(definitionValidator("Provenance"), "entity_record", "reserved provenance literal");
  expectInvalid(definitionValidator("ProducedProvenance"), "entity_record", "reserved producer literal");
});
