import assert from "node:assert/strict";
import test from "node:test";
import { Ajv2020, type ValidateFunction } from "ajv/dist/2020.js";
import { contractSchema } from "../src/schema/contract-schema.js";
import {
  validateDocumentContextSemantics,
  validateEngineCreationResult,
  validateProviderSnapshotShape,
  validateValueEnvelope,
  type ValidationResult,
} from "../src/validators.js";

type ObjectValue = Record<string, unknown>;
const ajv = new Ajv2020({ strict: true, strictRequired: false, allErrors: true });
ajv.addSchema(contractSchema);

function schema(name: string): ValidateFunction {
  const validate = ajv.getSchema(`${contractSchema.$id}#/$defs/${name}`);
  assert.ok(validate, `Missing ${name} schema`);
  return validate;
}

function assertValid(result: ValidationResult): void {
  assert.deepEqual(result, { ok: true, issues: [] });
}

function assertIssue(result: ValidationResult, code: string, path: string): void {
  assert.equal(result.ok, false);
  assert.ok(result.issues.some((issue) => issue.code === code && issue.path === path), JSON.stringify(result.issues));
}

function candidateEnvelope(candidateOverrides: ObjectValue = {}): ObjectValue {
  return {
    value: null, status: "unresolved", provenance: "none", confidence: "none",
    evidenceClass: null, externalAttestation: "not_attested", ranked: false,
    reason: "reading_not_found", cautions: [],
    alternatives: [{
      value: { formKind: "romanisation", assembled: false, text: "Lee" },
      provenance: "convention_table", evidenceClass: "E6", externalAttestation: "not_attested",
      scopeDowngrade: "class_applied_to_individual", cautions: [], ...candidateOverrides,
    }],
  };
}

test("Candidate scope downgrade uses its own evidence and optional support", () => {
  for (const [layer, definition] of [["L3R", "ValueRomanisation"], ["L3E", "ValueEnglishForm"]] as const) {
    const validate = schema(definition);
    for (const candidateOverrides of [{}, { support: "low" }, { support: "none" }]) {
      const value = candidateEnvelope(candidateOverrides);
      const before = structuredClone(value);
      assert.equal(validate(value), true, JSON.stringify(validate.errors));
      assertValid(validateValueEnvelope(value, { layer }));
      assert.deepEqual(value, before);
    }
    for (const candidateOverrides of [
      { evidenceClass: "E1a" }, { evidenceClass: null },
      { support: "medium" }, { support: "high" }, { scopeDowngrade: "invalid" },
    ]) {
      const value = candidateEnvelope(candidateOverrides);
      const before = structuredClone(value);
      assert.equal(validate(value), false);
      assertIssue(validateValueEnvelope(value, { layer }), "CANDIDATE_SCOPE_DOWNGRADE", "$.alternatives[0].scopeDowngrade");
      assert.deepEqual(value, before);
    }
  }
});

function memoryContext(channel: "reading" | "romanisation" | "englishForm", confidence: string, status: string): ObjectValue {
  const value = channel === "reading"
    ? { jyutping: "lei5", syllables: [{ jyutping: "lei5", initial: "l", final: "ei", tone: 5, syllabic: false }] }
    : { formKind: "romanisation", assembled: false, text: "Lee" };
  return {
    contextFormatVersion: "1", id: "document-1",
    entities: [{
      ref: "person-1", text: "李", type: "person.surname",
      [channel]: {
        value, status, provenance: "rule_engine", confidence, evidenceClass: "E7",
        externalAttestation: channel === "reading" ? "not_applicable" : "not_attested", cautions: [],
      },
    }],
  };
}

for (const channel of ["reading", "romanisation", "englishForm"] as const) {
  test(`Memory ${channel} preserves the rule-engine confidence hard cap`, () => {
    const validate = schema("DocumentContext");
    for (const status of ["resolved", "fallback"]) {
      for (const confidence of ["low", "none"]) {
        const context = memoryContext(channel, confidence, status);
        const before = structuredClone(context);
        assert.equal(validate(context), true, JSON.stringify(validate.errors));
        assertValid(validateDocumentContextSemantics(context));
        assert.deepEqual(context, before);
      }
      for (const confidence of ["medium", "high"]) {
        const context = memoryContext(channel, confidence, status);
        const before = structuredClone(context);
        assertIssue(validateDocumentContextSemantics(context), "MEMORY_RULE_ENGINE_CONFIDENCE", `$.entities[0].${channel}.confidence`);
        assert.equal(validate(context), false);
        assert.deepEqual(context, before);
      }
    }
  });
}

const shapeValidSnapshot = {
  id: "0".repeat(64), snapshotFormatVersion: "1", providerId: "provider.example",
  providerConfigHash: "config-hash", createdAt: "2026-09-26T00:00:00Z", entries: [],
};
const snapshotFailure = {
  ok: false, engine: null,
  diagnostics: [{ code: "PROVIDER_SNAPSHOT_INVALID", severity: "error", message: "Snapshot identity does not match its content." }],
};

test("Creation failure remains legal when snapshot shape passes but identity is unverified", () => {
  const validate = schema("ProviderSnapshot");
  // Equal semantic contents have one identity: these two IDs cannot both be
  // valid. The bounded shape validator computes neither identity, so it cannot
  // rule out an identity failure for either one (RULE-API-20; §5.10).
  for (const id of ["0".repeat(64), "1".repeat(64)]) {
    const snapshot = { ...shapeValidSnapshot, id };
    const before = structuredClone(snapshot);
    assert.equal(validate(snapshot), true, JSON.stringify(validate.errors));
    assertValid(validateProviderSnapshotShape(snapshot));
    assertValid(validateEngineCreationResult(snapshotFailure, { providerSnapshot: snapshot }));
    assert.deepEqual(snapshot, before);
  }
});

test("Creation validation still rejects successful creation from a structurally invalid snapshot", () => {
  const invalidSnapshot = { ...shapeValidSnapshot, entries: [{ inputHash: "a".repeat(64), output: 1 }] };
  const unexpectedCall = (): never => { throw new Error("Creation-result validation must not invoke Engine methods"); };
  const engine = {
    processText: unexpectedCall, versions: unexpectedCall, validateJyutping: unexpectedCall,
    stores: {
      list: unexpectedCall, get: unexpectedCall, create: unexpectedCall, update: unexpectedCall,
      remove: unexpectedCall, setEnabled: unexpectedCall, search: unexpectedCall,
      exportJson: unexpectedCall, exportCsv: unexpectedCall, importJson: unexpectedCall, version: unexpectedCall,
    },
  };
  assertValid(validateEngineCreationResult(snapshotFailure, { providerSnapshot: invalidSnapshot }));
  assertIssue(validateEngineCreationResult({ ok: true, engine, diagnostics: [] }, {
    providerSnapshot: invalidSnapshot,
  }), "ENGINE_CREATION_FATAL_BRANCH", "$.ok");
  assertValid(validateEngineCreationResult({ ok: true, engine, diagnostics: [] }, { providerSnapshot: shapeValidSnapshot }));
  assertIssue(validateEngineCreationResult(snapshotFailure, {
    lexiconCoverage: { writtenCantonese: true, hkscs: true, wordLevel: true, frequencies: false },
  }), "ENGINE_CREATION_UNEXPECTED_FAILURE", "$.ok");
});
