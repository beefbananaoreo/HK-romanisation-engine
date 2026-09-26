import assert from "node:assert/strict";
import test from "node:test";
import { Ajv2020 } from "ajv/dist/2020.js";
import { contractSchema } from "../src/schema/contract-schema.js";
import { validateAnalysisStructure, validateDocumentContextSemantics, type ValidationResult } from "../src/validators.js";

type ObjectValue = Record<string, unknown>;
type Channel = "reading" | "romanisation" | "englishForm";
const ajv = new Ajv2020({ strict: true, strictRequired: false, allErrors: true });
ajv.addSchema(contractSchema);

function assertSchema(name: string, value: unknown): void {
  const validate = ajv.getSchema(`${contractSchema.$id}#/$defs/${name}`);
  assert.ok(validate);
  assert.equal(validate(value), true, JSON.stringify(validate.errors));
}
function assertValid(result: ValidationResult): void {
  assert.deepEqual(result, { ok: true, issues: [] });
}
function assertIssue(result: ValidationResult, code: string, path: string): void {
  assert.equal(result.ok, false);
  assert.ok(result.issues.some((issue) => issue.code === code && issue.path === path), JSON.stringify(result.issues));
}
function form(channel: Channel, start: number, memory = false): ObjectValue {
  return channel === "reading"
    ? {
      jyutping: "lei5",
      syllables: [{ jyutping: "lei5", initial: "l", final: "ei", tone: 5, syllabic: false,
        ...(!memory ? { span: [start, start + 1], align: "exact" } : {}) }],
      ...(!memory ? { alignmentGroups: [] } : {}),
    }
    : { formKind: "romanisation", assembled: false, text: "Lee" };
}
function emptyChannel(channel: Channel): ObjectValue {
  return { value: null, status: "out_of_scope", provenance: "none", confidence: "none", evidenceClass: null,
    externalAttestation: channel === "reading" ? "not_applicable" : "not_attested", alternatives: [], ranked: false, cautions: [] };
}
function fixture(channel: Channel, origin: "analysis" | "documentContext", candidate: boolean, sourceConfidence = "low") {
  const sourceChannel: ObjectValue = {
    value: form(channel, 0, origin === "documentContext"), status: "resolved",
    provenance: sourceConfidence === "high" ? "user_glossary" : "convention_table",
    confidence: sourceConfidence, evidenceClass: sourceConfidence === "high" ? "E1a" : "E6",
    externalAttestation: channel === "reading" ? "not_applicable" : "not_attested", cautions: [],
    ...(sourceConfidence === "low" ? { scopeDowngrade: "class_applied_to_individual" } : {}),
    ...(origin === "analysis" ? { alternatives: [], ranked: false } : {}),
  };
  const inherited: ObjectValue = {
    value: form(channel, 1), provenance: "inherited", evidenceClass: "E6",
    externalAttestation: channel === "reading" ? "not_applicable" : "not_attested", cautions: [],
    inheritedFrom: origin === "analysis"
      ? { kind: "analysis", entityId: "e0" }
      : { kind: "documentContext", contextId: "ctx", ref: "m0" },
    ...(candidate ? { support: "low" } : { status: "resolved", confidence: "low", alternatives: [], ranked: false }),
  };
  const entities: ObjectValue[] = [0, 1].map((index) => ({
    id: `e${index}`, span: [index, index + 1], text: "李", type: "person.surname", primary: true,
    englishFallbackPolicy: "romanisation_allowed", detectionEvidence: [], detectionConfidence: "medium",
    reading: emptyChannel("reading"), romanisation: emptyChannel("romanisation"), englishForm: emptyChannel("englishForm"),
  }));
  const contextEntry: ObjectValue = { ref: "m0", text: "李", type: "person.surname", [channel]: sourceChannel };
  if (origin === "analysis") entities[0]![channel] = sourceChannel;
  entities[1]![channel] = candidate
    ? { ...emptyChannel(channel), status: "unresolved", reason: channel === "englishForm" ? "no_known_english_form" : "reading_not_found", alternatives: [inherited] }
    : inherited;
  const analysis = {
    schemaVersion: "1.0", offsetUnit: "utf16", source: "李李", sourceHash: "a".repeat(64), optionsHash: "b".repeat(64),
    versions: { schemaVersion: "1.0", contractVersion: "5.0.16", providerSnapshotId: null,
      engineVersion: "engine", lexiconVersion: "lexicon", rulesVersion: "rules", segmenterVersion: "segmenter", userDataVersion: 0 },
    documentContextUsed: origin === "documentContext",
    tokens: [0, 1].map((index) => ({ id: `t${index}`, span: [index, index + 1], text: "李", type: "han",
      reading: emptyChannel("reading"), romanisation: emptyChannel("romanisation") })),
    entities, regions: [], termResolutions: [], diagnostics: [],
  };
  const context = { contextFormatVersion: "1", id: "ctx", entities: [contextEntry] };
  return { analysis, context, contextEntry, sourceChannel, inherited };
}

for (const origin of ["analysis", "documentContext"] as const) {
  for (const channel of ["reading", "romanisation", "englishForm"] as const) {
    test(`Inherited ${channel} resolves a selected ${origin} channel and cannot raise confidence`, () => {
      for (const candidate of [false, true]) {
        const data = fixture(channel, origin, candidate);
        const context = origin === "documentContext" ? data.context : undefined;
        const path = `$.entities[1].${channel}${candidate ? ".alternatives[0]" : ""}`;
        const confidenceField = candidate ? "support" : "confidence";
        assertSchema("Analysis", data.analysis);
        if (context !== undefined) { assertSchema("DocumentContext", context); assertValid(validateDocumentContextSemantics(context)); }
        assertValid(validateAnalysisStructure(data.analysis, context));
        const before = structuredClone(data);
        assertValid(validateAnalysisStructure(data.analysis, context));
        assert.deepEqual(data, before);
        data.sourceChannel.status = "fallback";
        assertValid(validateAnalysisStructure(data.analysis, context));
        data.sourceChannel.status = "resolved";

        data.inherited[confidenceField] = "medium";
        assertSchema("Analysis", data.analysis);
        assertIssue(validateAnalysisStructure(data.analysis, context), "INHERITANCE_CONFIDENCE_CAP", `${path}.${confidenceField}`);
        data.inherited[confidenceField] = "low";
        if (candidate) {
          delete data.inherited.support;
          assertValid(validateAnalysisStructure(data.analysis, context));
        }

        if (origin === "documentContext") {
          delete data.contextEntry[channel];
          assertSchema("DocumentContext", data.context);
        } else {
          data.analysis.entities[0]![channel] = emptyChannel(channel);
          assertSchema("Analysis", data.analysis);
        }
        assertIssue(validateAnalysisStructure(data.analysis, context), "INHERITANCE_CHANNEL_SELECTED", `${path}.inheritedFrom`);
      }
    });
  }
}

test("Available high-confidence antecedents still cap inherited confidence at medium", () => {
  for (const origin of ["analysis", "documentContext"] as const) {
    const data = fixture("romanisation", origin, false, "high");
    const context = origin === "documentContext" ? data.context : undefined;
    data.inherited.confidence = "medium";
    assertValid(validateAnalysisStructure(data.analysis, context));
    data.inherited.confidence = "high";
    assertIssue(validateAnalysisStructure(data.analysis, context), "INHERITANCE_CONFIDENCE_CAP", "$.entities[1].romanisation.confidence");
  }
});

test("Non-selected Analysis channel statuses cannot serve as inheritance sources", () => {
  for (const status of ["ambiguous", "conflict", "unresolved", "unsupported", "out_of_scope"]) {
    const data = fixture("romanisation", "analysis", false);
    const alternative = {
      value: form("romanisation", 0), provenance: "convention_table", evidenceClass: "E6",
      externalAttestation: "not_attested", cautions: [],
    };
    data.analysis.entities[0]!.romanisation = {
      ...emptyChannel("romanisation"), status,
      ...(status === "unresolved" || status === "unsupported" ? { reason: "reading_not_found" } : {}),
      ...(status === "ambiguous" ? { ranked: true, alternatives: [{ ...alternative, rank: 0 }, { ...alternative, rank: 1 }] } : {}),
      ...(status === "conflict" ? { alternatives: [alternative, structuredClone(alternative)] } : {}),
    };
    assertSchema("Analysis", data.analysis);
    assertIssue(validateAnalysisStructure(data.analysis), "INHERITANCE_CHANNEL_SELECTED", "$.entities[1].romanisation.inheritedFrom");
  }
});

test("Inheritance keeps unavailable context content outside the structural check", () => {
  const data = fixture("englishForm", "documentContext", false);
  data.inherited.confidence = "medium";
  assertValid(validateAnalysisStructure(data.analysis));
  assertIssue(validateAnalysisStructure(data.analysis, data.context), "INHERITANCE_CONFIDENCE_CAP", "$.entities[1].englishForm.confidence");
  data.context.id = "other-context";
  assertIssue(validateAnalysisStructure(data.analysis, data.context), "INHERITANCE_UNRESOLVED", "$.entities[1].englishForm.inheritedFrom");
});
