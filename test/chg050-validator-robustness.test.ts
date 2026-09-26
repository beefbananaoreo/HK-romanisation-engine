import assert from "node:assert/strict";
import test from "node:test";
import { Ajv2020, type ValidateFunction } from "ajv/dist/2020.js";
import { contractSchema } from "../src/schema/contract-schema.js";
import {
  validateDocumentContextSemantics,
  validateStoreImportEnvelope,
  validateValueEnvelope,
  type ContractLayer,
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
  assert.ok(result.issues.some(issue => issue.code === code && issue.path === path), JSON.stringify(result.issues));
}

function channelValue(layer: ContractLayer): ObjectValue {
  if (layer === "L2") return { jyutping: "", syllables: [], alignmentGroups: [] };
  if (layer === "L4") return { preferred: "Lee", entryId: "entry-1", entryScope: "lexical" };
  return { formKind: "romanisation", assembled: false, text: "Lee" };
}

function envelope(layer: ContractLayer, overrides: ObjectValue = {}): ObjectValue {
  return {
    value: channelValue(layer), status: "resolved", provenance: "user_glossary",
    confidence: "high", evidenceClass: "E1a", cautions: [], alternatives: [], ranked: false,
    externalAttestation: layer === "L2" || layer === "L4" ? "not_applicable" : "not_attested",
    ...overrides,
  };
}

const layers = [
  ["L2", "ValueReading"], ["L3R", "ValueRomanisation"],
  ["L3E", "ValueEnglishForm"], ["L4", "ValueTermRendering"],
] as const;

for (const [layer, definition] of layers) {
  test(`${layer} candidate support preserves optionality and the rule-engine cap`, () => {
    const validate = schema(definition);
    for (const support of [undefined, "none", "low", "medium", "high"]) {
      const candidate = {
        value: channelValue(layer), provenance: "rule_engine", evidenceClass: "E7", cautions: [],
        externalAttestation: layer === "L2" || layer === "L4" ? "not_applicable" : "not_attested",
        ...(support === undefined ? {} : { support }),
      };
      const value = envelope(layer, { alternatives: [candidate] });
      const before = structuredClone(value);
      const expected = support === undefined || support === "low" || support === "none";
      assert.equal(validate(value), expected, JSON.stringify(validate.errors));
      if (expected) assertValid(validateValueEnvelope(value, { layer }));
      else assertIssue(validateValueEnvelope(value, { layer }), "CANDIDATE_RULE_ENGINE_SUPPORT_CAP", "$.alternatives[0].support");
      assert.deepEqual(value, before);
    }
    const nonRuleCandidate = {
      value: channelValue(layer), provenance: "user_glossary", evidenceClass: "E1a", cautions: [], support: "medium",
      externalAttestation: layer === "L2" || layer === "L4" ? "not_applicable" : "not_attested",
    };
    const value = envelope(layer, { alternatives: [nonRuleCandidate] });
    assert.equal(validate(value), true, JSON.stringify(validate.errors));
    assertValid(validateValueEnvelope(value, { layer }));
  });

  test(`${layer} inherited confidence cannot exceed medium`, () => {
    const validate = schema(definition);
    for (const status of ["resolved", "fallback"]) {
      for (const confidence of ["none", "low", "medium", "high"]) {
        const value = envelope(layer, {
          status, confidence, provenance: "inherited", inheritedFrom: { kind: "analysis", entityId: "e0" },
        });
        const before = structuredClone(value);
        const expected = confidence !== "high" && (status !== "fallback" || confidence !== "medium");
        assert.equal(validate(value), expected, JSON.stringify(validate.errors));
        const result = validateValueEnvelope(value, { layer });
        if (expected) assertValid(result);
        else assertIssue(result, confidence === "high" ? "INHERITED_CONFIDENCE_CAP" : "FALLBACK_CONFIDENCE_CAP", "$.confidence");
        assert.deepEqual(value, before);
      }
    }
    assert.equal(validate(envelope(layer)), true, JSON.stringify(validate.errors));
    assertValid(validateValueEnvelope(envelope(layer), { layer }));
  });
}

function memoryContext(channel: "reading" | "romanisation" | "englishForm", overrides: ObjectValue): ObjectValue {
  return {
    contextFormatVersion: "1", id: "context",
    entities: [{
      ref: "m0", text: "李", type: "person.surname",
      [channel]: {
        value: channel === "reading" ? { jyutping: "", syllables: [] } : channelValue("L3R"),
        status: "resolved", provenance: "inherited", confidence: "medium", evidenceClass: "E1a", cautions: [],
        externalAttestation: channel === "reading" ? "not_applicable" : "not_attested", ...overrides,
      },
    }],
  };
}

for (const channel of ["reading", "romanisation", "englishForm"] as const) {
  test(`Memory ${channel} inherited confidence cannot exceed medium`, () => {
    const validate = schema("DocumentContext");
    for (const status of ["resolved", "fallback"]) {
      for (const confidence of ["none", "low", "medium", "high"]) {
        const context = memoryContext(channel, { status, confidence });
        const before = structuredClone(context);
        const expected = confidence !== "high" && (status !== "fallback" || confidence !== "medium");
        assert.equal(validate(context), expected, JSON.stringify(validate.errors));
        const result = validateDocumentContextSemantics(context);
        if (expected) assertValid(result);
        else assertIssue(result, confidence === "high" ? "MEMORY_INHERITED_CONFIDENCE" : "MEMORY_FALLBACK_CONFIDENCE", `$.entities[0].${channel}.confidence`);
        assert.deepEqual(context, before);
      }
    }
    const local = memoryContext(channel, { provenance: "user_glossary", confidence: "high" });
    assert.equal(validate(local), true, JSON.stringify(validate.errors));
    assertValid(validateDocumentContextSemantics(local));
  });
}

test("Value alternatives reject array holes without filling or mutating them", () => {
  const validate = schema("ValueRomanisation");
  const candidate = {
    value: channelValue("L3R"), provenance: "user_glossary", evidenceClass: "E1a",
    externalAttestation: "not_attested", cautions: [],
  };
  for (const status of ["resolved", "conflict"]) {
    const overrides = status === "conflict" ? { status, value: null, confidence: "none", provenance: "none" } : {};
    const dense = envelope("L3R", { ...overrides, alternatives: [candidate, candidate] });
    assert.equal(validate(dense), true, JSON.stringify(validate.errors));
    assertValid(validateValueEnvelope(dense, { layer: "L3R" }));
    for (const filled of [false, true]) {
      const alternatives = new Array<unknown>(2);
      if (filled) alternatives[0] = candidate;
      const value = envelope("L3R", { ...overrides, alternatives });
      const before = structuredClone(value);
      assert.equal(validate(value), false);
      assertIssue(validateValueEnvelope(value, { layer: "L3R" }), "CANDIDATE_OBJECT", `$.alternatives[${filled ? 1 : 0}]`);
      assert.deepEqual(value, before);
    }
  }
});

test("DocumentContext entities reject sparse entries while dense and empty lists remain valid", () => {
  const validate = schema("DocumentContext");
  const entry = { ref: "m0", text: "李", type: "person" };
  for (const entities of [[], [entry]]) {
    const context = { contextFormatVersion: "1", id: "context", entities };
    assert.equal(validate(context), true, JSON.stringify(validate.errors));
    assertValid(validateDocumentContextSemantics(context));
  }
  for (const filled of [false, true]) {
    const entities = new Array<unknown>(2);
    if (filled) entities[0] = entry;
    const context = { contextFormatVersion: "1", id: "context", entities };
    const before = structuredClone(context);
    assert.equal(validate(context), false);
    assertIssue(validateDocumentContextSemantics(context), "MEMORY_ENTRY_OBJECT", `$.entities[${filled ? 1 : 0}]`);
    assert.deepEqual(context, before);
  }
});

test("Import preview and apply reject sparse rows while dense and empty lists remain valid", () => {
  const row = { index: 0, action: "conflict", input: {}, conflicts: [], errors: [] };
  for (const mode of ["preview", "apply"]) {
    const validate = schema(mode === "preview" ? "ImportPreview" : "ImportResult");
    const base = { mode, store: "translation", writesApplied: false, ...(mode === "apply" ? { userDataVersion: 0 } : {}) };
    for (const rows of [[], [row]]) {
      const value = { ...base, rows };
      assert.equal(validate(value), true, JSON.stringify(validate.errors));
      assertValid(validateStoreImportEnvelope(value));
    }
    for (const filled of [false, true]) {
      const rows = new Array<unknown>(2);
      if (filled) rows[0] = row;
      const value = { ...base, rows };
      const before = structuredClone(value);
      assert.equal(validate(value), false);
      assertIssue(validateStoreImportEnvelope(value), "IMPORT_ROW", `$.rows[${filled ? 1 : 0}]`);
      assert.deepEqual(value, before);
    }
  }
});
