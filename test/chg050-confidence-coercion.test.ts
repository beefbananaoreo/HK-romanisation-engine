import assert from "node:assert/strict";
import test from "node:test";
import {
  validateAnalysisStructure,
  validateDocumentContextSemantics,
  validateValueEnvelope,
  type ValidationResult,
} from "../src/validators.js";
import { analysisFixture, type ObjectValue } from "./chg050-structure-fixtures.js";

const form = { formKind: "romanisation", assembled: false, text: "Lee" };

function selected(overrides: ObjectValue = {}): ObjectValue {
  return {
    value: form, status: "resolved", provenance: "user_glossary", confidence: "high",
    evidenceClass: "E1a", externalAttestation: "not_attested", cautions: [],
    alternatives: [], ranked: false, ...overrides,
  };
}

function assertIssue(result: ValidationResult, code: string, path: string): void {
  assert.equal(result.ok, false);
  assert.ok(result.issues.some(issue => issue.code === code && issue.path === path), JSON.stringify(result.issues));
}

function malformedBands(check: (value: unknown) => void): void {
  let coercions = 0;
  const hook = {
    [Symbol.toPrimitive](): string {
      coercions += 1;
      throw new Error("Confidence validation must not invoke coercion hooks");
    },
  };
  // The first case is ordinary JSON, so this regression is not limited to
  // exotic JavaScript objects or hostile accessors.
  for (const value of [JSON.parse('{"toString":null}'), Object.create(null), hook]) {
    check(value);
  }
  assert.equal(coercions, 0);
}

test("Candidate confidence caps reject malformed support without coercion", () => {
  for (const evidence of [
    { provenance: "rule_engine", evidenceClass: "E7" },
    { provenance: "convention_table", evidenceClass: "E6", scopeDowngrade: "class_applied_to_individual" },
  ]) {
    malformedBands(support => {
      const candidate = { value: form, externalAttestation: "not_attested", cautions: [], ...evidence, support };
      assertIssue(validateValueEnvelope(selected({ alternatives: [candidate] }), { layer: "L3R" }),
        "CANDIDATE_SUPPORT", "$.alternatives[0].support");
      assert.equal(candidate.support, support);
    });
  }
});

test("Selected confidence caps reject malformed confidence without coercion", () => {
  for (const branch of [
    { status: "fallback" },
    { provenance: "rule_engine", evidenceClass: "E7" },
    { provenance: "convention_table", evidenceClass: "E6", scopeDowngrade: "class_applied_to_individual" },
    { status: "fallback", provenance: "inherited", inheritedFrom: { kind: "analysis", entityId: "e0" } },
  ]) {
    malformedBands(confidence => {
      const value = selected({ ...branch, confidence });
      assertIssue(validateValueEnvelope(value, { layer: "L3R" }), "VALUE_CONFIDENCE", "$.confidence");
      assert.equal(value.confidence, confidence);
    });
  }
});

test("Memory confidence caps reject malformed confidence without coercion", () => {
  for (const branch of [
    { status: "resolved", provenance: "rule_engine", evidenceClass: "E7" },
    { status: "fallback", provenance: "inherited", evidenceClass: "E1a" },
    { status: "resolved", provenance: "convention_table", evidenceClass: "E6", scopeDowngrade: "class_applied_to_individual" },
  ]) {
    malformedBands(confidence => {
      const channel = {
        value: form, externalAttestation: "not_attested", cautions: [], ...branch, confidence,
      };
      const context = {
        contextFormatVersion: "1", id: "ctx",
        entities: [{ ref: "m0", text: "李", type: "person.surname", romanisation: channel }],
      };
      assertIssue(validateDocumentContextSemantics(context), "MEMORY_CONFIDENCE", "$.entities[0].romanisation.confidence");
      assert.equal(channel.confidence, confidence);
    });
  }
});

function inheritedFixture(origin: "analysis" | "documentContext", candidate: boolean) {
  const analysis = analysisFixture("Romanisation", form);
  const sourceChannel = selected();
  const sourceEntity = (analysis.entities as ObjectValue[])[0]!;
  sourceEntity.romanisation = sourceChannel;
  const context = {
    contextFormatVersion: "1", id: "ctx",
    entities: [{ ref: "m0", text: analysis.source, type: "person", romanisation: {
      value: form, status: "resolved", provenance: "user_glossary", confidence: "high",
      evidenceClass: "E1a", externalAttestation: "not_attested", cautions: [],
    } }],
  };
  const reference = origin === "analysis"
    ? { kind: "analysis", entityId: "e0" }
    : { kind: "documentContext", contextId: "ctx", ref: "m0" };
  const inherited = candidate
    ? { value: form, provenance: "inherited", inheritedFrom: reference, support: "medium",
      evidenceClass: "E1a", externalAttestation: "not_attested", cautions: [] } as ObjectValue
    : selected({ provenance: "inherited", inheritedFrom: reference, confidence: "medium" });
  const token = (analysis.tokens as ObjectValue[])[0]!;
  token.romanisation = candidate
    ? selected({ value: null, status: "unresolved", reason: "reading_not_found", confidence: "none", alternatives: [inherited] })
    : inherited;
  analysis.documentContextUsed = origin === "documentContext";
  return { analysis, context: origin === "documentContext" ? context : undefined, sourceChannel, inherited };
}

test("Inheritance band comparisons reject malformed selected confidence and support without coercion", () => {
  for (const origin of ["analysis", "documentContext"] as const) {
    for (const candidate of [false, true]) {
      const data = inheritedFixture(origin, candidate);
      assert.deepEqual(validateAnalysisStructure(data.analysis, data.context), { ok: true, issues: [] });
      const field = candidate ? "support" : "confidence";
      malformedBands(value => {
        data.inherited[field] = value;
        assertIssue(validateAnalysisStructure(data.analysis, data.context),
          candidate ? "CANDIDATE_SUPPORT" : "VALUE_CONFIDENCE",
          `$.tokens[0].romanisation${candidate ? ".alternatives[0].support" : ".confidence"}`);
        assert.equal(data.inherited[field], value);
      });
    }
  }
});

test("Inheritance rejects invalid antecedent bands without coercing them", () => {
  for (const candidate of [false, true]) {
    const data = inheritedFixture("analysis", candidate);
    assert.deepEqual(validateAnalysisStructure(data.analysis), { ok: true, issues: [] });
    malformedBands(confidence => {
      data.sourceChannel.confidence = confidence;
      const result = validateAnalysisStructure(data.analysis);
      assertIssue(result, "VALUE_CONFIDENCE", "$.entities[0].romanisation.confidence");
      assertIssue(result, "INHERITANCE_SOURCE_CONFIDENCE", `$.tokens[0].romanisation${candidate ? ".alternatives[0]" : ""}.inheritedFrom`);
      assert.equal(data.sourceChannel.confidence, confidence);
    });
  }
});

test("Referenced context antecedents require valid confidence even when candidate support is omitted", () => {
  for (const branch of ["selected", "candidate", "candidate_without_support"]) {
    const candidate = branch !== "selected";
    const data = inheritedFixture("documentContext", candidate);
    if (branch === "candidate_without_support") delete data.inherited.support;
    const sourceChannel = data.context!.entities[0]!.romanisation as ObjectValue;
    const path = `$.tokens[0].romanisation${candidate ? ".alternatives[0]" : ""}.inheritedFrom`;
    assert.deepEqual(validateAnalysisStructure(data.analysis, data.context), { ok: true, issues: [] });
    const check = (confidence: unknown): void => {
      sourceChannel.confidence = confidence;
      assertIssue(validateAnalysisStructure(data.analysis, data.context), "INHERITANCE_SOURCE_CONFIDENCE", path);
      assert.equal(sourceChannel.confidence, confidence);
    };
    malformedBands(check);
    for (const confidence of [undefined, null, 0, "", "certain"]) check(confidence);
    delete sourceChannel.confidence;
    assertIssue(validateAnalysisStructure(data.analysis, data.context), "INHERITANCE_SOURCE_CONFIDENCE", path);
    sourceChannel.confidence = "high";
    assert.deepEqual(validateAnalysisStructure(data.analysis, data.context), { ok: true, issues: [] });
  }
});
