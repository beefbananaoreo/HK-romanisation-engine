import assert from "node:assert/strict";
import test from "node:test";

import type {
  AnnotationRef, AssembledEnglishForm, AssembledRomanisation, CanonicalObject, Candidate, CasingProfile, Diagnostic, DocumentContext,
  Engine, EngineConfig, EngineCreationFailure, EngineCreationResult, EngineCreationSuccess,
  EnglishForm, GeneratedPersonNameStyle, InheritanceRef, MemoryEnglishForm, MemoryRomanisation, ProcessOptions,
  ProviderSnapshot, Romanisation, RomanisationRef, StoreApi, StoreEntry, TranslationDirectives,
  StyleProfile, Value, createEngine,
} from "../src/public-contract.js";

type Equal<Left, Right> =
  (<Value>() => Value extends Left ? 1 : 2) extends
  (<Value>() => Value extends Right ? 1 : 2)
    ? (<Value>() => Value extends Right ? 1 : 2) extends
      (<Value>() => Value extends Left ? 1 : 2)
      ? true
      : false
    : false;
type Expect<Condition extends true> = Condition;

type ExpectedEngineCreationResult =
  | { ok: true; engine: Engine; diagnostics: Diagnostic[] }
  | { ok: false; engine: null; diagnostics: [Diagnostic, ...Diagnostic[]] };

const creationResultUnionIsExact: Expect<
  Equal<EngineCreationResult, ExpectedEngineCreationResult>
> = true;
const createEngineSignatureIsExact: Expect<
  Equal<typeof createEngine, (config: EngineConfig) => EngineCreationResult>
> = true;
const documentTagsFieldIsExact: Expect<
  Equal<ProcessOptions["documentTags"], string[] | undefined>
> = true;
const projectionDiagnosticsFieldIsExact: Expect<
  Equal<TranslationDirectives["diagnostics"], Diagnostic[]>
> = true;

const inheritance: InheritanceRef = { kind: "analysis", entityId: "e0" };
const inheritedCandidate: Candidate<string> = {
  value: "x", provenance: "inherited", inheritedFrom: inheritance, evidenceClass: null,
  externalAttestation: "not_applicable", cautions: [],
};

const mixedPerson: AssembledEnglishForm = {
  formKind: "hybrid", assembled: true, person: true,
  units: [
    {
      id: "u0", span: [0, 5], kind: "literal", text: "Peter", role: "western_given",
      provenance: "none", evidenceClass: null, externalAttestation: "not_applicable",
    },
    {
      id: "u1", span: [5, 6], kind: "romanised", text: "Chan", role: "surname",
      provenance: "convention_table", evidenceClass: "E6", externalAttestation: "attested",
      syllable: "can4", generated: false,
    },
    {
      id: "u2", span: [6, 7], kind: "romanised", text: "Tai", role: "given",
      provenance: "rule_engine", evidenceClass: "E7", externalAttestation: "not_attested",
      syllable: "daai6", generated: true,
    },
  ],
  grouping: [[0], [1, 2]],
  styleApplicable: { scope: "givenName", unitIds: ["u2"] },
};

const memoryMixed: MemoryEnglishForm = {
  formKind: "hybrid", assembled: true, person: true,
  units: [
    {
      kind: "literal", text: "Peter", role: "western_given", provenance: "none",
      evidenceClass: null, externalAttestation: "not_applicable",
    },
    {
      kind: "romanised", text: "Tai", role: "given", provenance: "rule_engine",
      evidenceClass: "E7", externalAttestation: "not_attested", syllable: "daai6", generated: true,
    },
  ],
  grouping: [[0], [1]],
  styleApplicable: { scope: "givenName", unitIndices: [1] },
};

const context: DocumentContext = {
  contextFormatVersion: "1", id: "ctx",
  entities: [{
    ref: "m0", text: "Peter陳大文", type: "person",
    name: {
      westernGivenText: "Peter", surnameText: "陳", givenNameText: "大文",
      compoundSurname: false, order: "surname_first",
    },
    englishForm: {
      value: memoryMixed, status: "resolved", provenance: "rule_engine", confidence: "low",
      evidenceClass: "E7", externalAttestation: "not_attested", cautions: [],
    },
  }],
};

const provider: ProviderSnapshot = {
  id: "a".repeat(64), snapshotFormatVersion: "1", providerId: "provider",
  providerConfigHash: "config", createdAt: "2026-08-29",
  entries: [{ inputHash: "b".repeat(64), output: { __int: "1" } }],
};

const processOptions: ProcessOptions = {
  documentContext: context,
  documentTags: ["legal", "court", "legal"],
};

function compileOnlyCreationStates(engine: Engine): [
  EngineCreationSuccess,
  EngineCreationSuccess,
  EngineCreationFailure,
] {
  const clean: EngineCreationSuccess = { ok: true, engine, diagnostics: [] };
  const degraded: EngineCreationSuccess = {
    ok: true,
    engine,
    diagnostics: [{
      code: "LEXICON_MISSING_CAPABILITY",
      severity: "warning",
      message: "frequency data unavailable",
    }],
  };
  const failure: EngineCreationFailure = {
    ok: false,
    engine: null,
    diagnostics: [{
      code: "PROVIDER_SNAPSHOT_INVALID",
      severity: "error",
      message: "duplicate inputHash",
    }],
  };
  return [clean, degraded, failure];
}

function compileOnlyStoreApi(api: StoreApi): StoreEntry[] {
  const listed = api.list("translation", { entryScope: "entity", evidenceClass: "E2" });
  api.importJson("translation", [], "preview");
  api.importJson("translation", [], "apply");
  return listed;
}

test("strict public surface represents corrected positive states", () => {
  const form: EnglishForm = mixedPerson;
  const value: Value<EnglishForm> = {
    value: form, status: "resolved", provenance: "inherited", confidence: "medium",
    evidenceClass: "E6", externalAttestation: "attested", alternatives: [], ranked: false,
    cautions: [], inheritedFrom: { kind: "documentContext", contextId: "ctx", ref: "m0" },
  };
  const ref: AnnotationRef = { owner: "token", tokenId: "t0", channel: "romanisation" };
  const romanisationRef: RomanisationRef = { owner: "entity", entityId: "e0", channel: "romanisation" };
  const style: GeneratedPersonNameStyle = "joined";
  const directives: TranslationDirectives = {
    schemaVersion: "1.0", sourceHash: "a".repeat(64), offsetUnit: "utf16", styleUsed: style,
    protectedSpans: [], termDirectives: [], unresolvedSemanticSpans: [], diagnostics: [],
  };
  assert.equal(value.inheritedFrom?.kind, "documentContext");
  assert.equal(ref.owner, "token");
  assert.equal(romanisationRef.channel, "romanisation");
  assert.equal(context.entities[0]?.englishForm?.value.assembled, true);
  assert.equal(provider.entries[0]?.output !== null, true);
  assert.deepEqual(directives.termDirectives, []);
  assert.equal(typeof compileOnlyStoreApi, "function");
  assert.deepEqual(inheritedCandidate.value, "x");
});

test("CHG-045 public types close creation, projection diagnostics, and document tags", () => {
  const directives: TranslationDirectives = {
    schemaVersion: "1.0", sourceHash: "hash", offsetUnit: "utf16", styleUsed: "joined",
    protectedSpans: [], termDirectives: [], unresolvedSemanticSpans: [], diagnostics: [],
  };
  assert.deepEqual(processOptions.documentTags, ["legal", "court", "legal"]);
  assert.deepEqual(directives.diagnostics, []);
  assert.equal(typeof compileOnlyCreationStates, "function");
  assert.equal(creationResultUnionIsExact, true);
  assert.equal(createEngineSignatureIsExact, true);
  assert.equal(documentTagsFieldIsExact, true);
  assert.equal(projectionDiagnosticsFieldIsExact, true);
});

// Negative compile witnesses. Every @ts-expect-error must suppress a real error.
// @ts-expect-error GeneratedPersonNameStyle is intentionally narrower than StyleProfile.
const badStyle: GeneratedPersonNameStyle = "spaced";

// @ts-expect-error Verbatim Romanisation cannot carry units.
const badVerbatimRomanisation: Romanisation = { formKind: "romanisation", assembled: false, text: "Chan", units: [] };

// @ts-expect-error Assembled Romanisation has no canonical text.
const badAssembledRomanisation: Romanisation = { formKind: "romanisation", assembled: true, text: "Chan", units: [], grouping: [] };

// @ts-expect-error official_name is verbatim-only.
const badOfficialAssembly: EnglishForm = { formKind: "official_name", assembled: true, person: false, units: [], grouping: [] };

const badWesternRomanised: EnglishForm = {
  formKind: "romanisation", assembled: true, person: false,
  // @ts-expect-error western_given cannot be a romanised unit.
  units: [{
    id: "u0", span: [0, 1], kind: "romanised", text: "P", role: "western_given",
    provenance: "none", evidenceClass: null, externalAttestation: "not_applicable", syllable: "", generated: false,
  }],
  grouping: [[0]],
};

// @ts-expect-error token owners cannot target englishForm.
const badTokenEnglishRef: AnnotationRef = { owner: "token", tokenId: "t0", channel: "englishForm" };

// @ts-expect-error exact-one-owner branch forbids both ids.
const badTwoOwnerRef: AnnotationRef = { owner: "entity", entityId: "e0", tokenId: "t0", channel: "reading" };

// @ts-expect-error RomanisationRef is fixed to romanisation.
const badRomanisationRef: RomanisationRef = { owner: "entity", entityId: "e0", channel: "reading" };

// @ts-expect-error inherited Candidate requires inheritedFrom.
const badInheritedCandidate: Candidate<string> = {
  value: "x", provenance: "inherited", evidenceClass: null, externalAttestation: "not_applicable", cautions: [],
};

// @ts-expect-error non-inherited Candidate forbids inheritedFrom.
const badLocalCandidate: Candidate<string> = {
  value: "x", provenance: "none", inheritedFrom: inheritance, evidenceClass: null,
  externalAttestation: "not_applicable", cautions: [],
};

const badMemoryId: MemoryEnglishForm = {
  formKind: "romanisation", assembled: true, person: false,
  units: [{
    // @ts-expect-error memory units contain no Analysis-local id.
    id: "u0", kind: "romanised", text: "Chan", provenance: "rule_engine",
    evidenceClass: "E7", externalAttestation: "not_attested", syllable: "can4", generated: true,
  }],
  grouping: [[0]],
};

const badMemorySpan: MemoryEnglishForm = {
  formKind: "romanisation", assembled: true, person: false,
  units: [{
    // @ts-expect-error memory units contain no source-relative span.
    span: [0, 1], kind: "romanised", text: "Chan", provenance: "rule_engine",
    evidenceClass: "E7", externalAttestation: "not_attested", syllable: "can4", generated: true,
  }],
  grouping: [[0]],
};

// @ts-expect-error E3 is outside StoreEvidenceClass and cannot inhabit StoreEntry evidence.
const badStoreEvidence: StoreEntry["evidenceClass"] = "E3";

// @ts-expect-error ordinary canonical objects reserve __int.
const badCanonicalObject: CanonicalObject = { __int: "1" };

const badDocumentTags: ProcessOptions = {
  // @ts-expect-error documentTags is an array of exact opaque strings, not one string.
  documentTags: "legal",
};

const badCreationSuccess: EngineCreationSuccess = {
  ok: true,
  // @ts-expect-error successful creation carries a live Engine.
  engine: null,
  diagnostics: [],
};

const badCreationFailure: EngineCreationFailure = {
  ok: false,
  engine: null,
  // @ts-expect-error failed creation requires a non-empty diagnostic tuple.
  diagnostics: [],
};

// @ts-expect-error every directive projection carries its invocation-local diagnostics array.
const badDirectivesWithoutDiagnostics: TranslationDirectives = {
  schemaVersion: "1.0", sourceHash: "hash", offsetUnit: "utf16", styleUsed: "joined",
  protectedSpans: [], termDirectives: [], unresolvedSemanticSpans: [],
};

// @ts-expect-error no live provider field exists on EngineConfig.
const badExternalProviderKey: keyof EngineConfig = "externalProvider";
// @ts-expect-error no durable Entity Record subsystem exists on EngineConfig.
const badEntityRecordKey: keyof EngineConfig = "entityRecords";

void badStyle;
void badVerbatimRomanisation;
void badAssembledRomanisation;
void badOfficialAssembly;
void badWesternRomanised;
void badTokenEnglishRef;
void badTwoOwnerRef;
void badRomanisationRef;
void badInheritedCandidate;
void badLocalCandidate;
void badMemoryId;
void badMemorySpan;
void badStoreEvidence;
void badCanonicalObject;
void badDocumentTags;
void badCreationSuccess;
void badCreationFailure;
void badDirectivesWithoutDiagnostics;
void badExternalProviderKey;
void badEntityRecordKey;

type MemoryAssembledRomanisation = Extract<MemoryRomanisation, { assembled: true }>;
type MemoryAssembledEnglish = Extract<MemoryEnglishForm, { assembled: true }>;
type StyledEnglish = Extract<AssembledEnglishForm, { styleApplicable: unknown }>;
type MemoryStyledEnglish = Extract<MemoryEnglishForm, { styleApplicable: unknown }>;

const styleProfileIsExact: Expect<Equal<StyleProfile, "hyphenated" | "joined" | "spaced" | "hyphen_title" | "surname_caps">> = true;
const casingProfileIsExact: Expect<Equal<CasingProfile, "lower" | "sentence" | "title" | "upper">> = true;
const generatedStyleIsExact: Expect<Equal<GeneratedPersonNameStyle, "hyphenated" | "joined">> = true;

// @ts-expect-error CHG-050: Analysis Romanisation units cannot be empty.
const emptyRomanUnits: AssembledRomanisation["units"] = [];
// @ts-expect-error CHG-050: Analysis English units cannot be empty.
const emptyEnglishUnits: AssembledEnglishForm["units"] = [];
// @ts-expect-error CHG-050: MemoryRomanisation units cannot be empty.
const emptyMemoryRomanUnits: MemoryAssembledRomanisation["units"] = [];
// @ts-expect-error CHG-050: MemoryEnglishForm units cannot be empty.
const emptyMemoryEnglishUnits: MemoryAssembledEnglish["units"] = [];
// @ts-expect-error CHG-050: Analysis Romanisation outer grouping cannot be empty.
const emptyRomanGrouping: AssembledRomanisation["grouping"] = [];
// @ts-expect-error CHG-050: Analysis English outer grouping cannot be empty.
const emptyEnglishGrouping: AssembledEnglishForm["grouping"] = [];
// @ts-expect-error CHG-050: MemoryRomanisation outer grouping cannot be empty.
const emptyMemoryRomanGrouping: MemoryAssembledRomanisation["grouping"] = [];
// @ts-expect-error CHG-050: MemoryEnglishForm outer grouping cannot be empty.
const emptyMemoryEnglishGrouping: MemoryAssembledEnglish["grouping"] = [];
// @ts-expect-error CHG-050: Analysis Romanisation inner group cannot be empty.
const emptyRomanInner: AssembledRomanisation["grouping"] = [[0], []];
// @ts-expect-error CHG-050: Analysis English inner group cannot be empty.
const emptyEnglishInner: AssembledEnglishForm["grouping"] = [[0], []];
// @ts-expect-error CHG-050: MemoryRomanisation inner group cannot be empty.
const emptyMemoryRomanInner: MemoryAssembledRomanisation["grouping"] = [[0], []];
// @ts-expect-error CHG-050: MemoryEnglishForm inner group cannot be empty.
const emptyMemoryEnglishInner: MemoryAssembledEnglish["grouping"] = [[0], []];
// @ts-expect-error CHG-050: Analysis style references cannot be empty.
const emptyStyleIds: StyledEnglish["styleApplicable"]["unitIds"] = [];
// @ts-expect-error CHG-050: Memory style references cannot be empty.
const emptyStyleIndices: MemoryStyledEnglish["styleApplicable"]["unitIndices"] = [];
// @ts-expect-error Lab-only profile must not enter GeneratedPersonNameStyle.
const badHyphenTitleDirective: GeneratedPersonNameStyle = "hyphen_title";
// @ts-expect-error Lab-only surname exception must not enter GeneratedPersonNameStyle.
const badSurnameCapsDirective: GeneratedPersonNameStyle = "surname_caps";

test("CHG-050 strict non-empty arrays and exact Style/Casing/GeneratedPersonNameStyle unions", () => {
  assert.equal(styleProfileIsExact, true);
  assert.equal(casingProfileIsExact, true);
  assert.equal(generatedStyleIsExact, true);
});

void emptyRomanUnits;
void emptyEnglishUnits;
void emptyMemoryRomanUnits;
void emptyMemoryEnglishUnits;
void emptyRomanGrouping;
void emptyEnglishGrouping;
void emptyMemoryRomanGrouping;
void emptyMemoryEnglishGrouping;
void emptyRomanInner;
void emptyEnglishInner;
void emptyMemoryRomanInner;
void emptyMemoryEnglishInner;
void emptyStyleIds;
void emptyStyleIndices;
void badHyphenTitleDirective;
void badSurnameCapsDirective;
