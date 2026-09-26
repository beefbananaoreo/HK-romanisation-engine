import assert from "node:assert/strict";
import test from "node:test";

import { Ajv2020, type ValidateFunction } from "ajv/dist/2020.js";

import type { CandidateBase, EnglishForm, Reading, Romanisation, TermRendering } from "../src/public-contract.js";
import { contractSchema } from "../src/schema/contract-schema.js";
import {
  validateEngineCreationResult, validateProviderSnapshotShape, validateTranslationDirectivesShape,
} from "../src/validators.js";

const ajv = new Ajv2020({ strict: true, strictRequired: false, allErrors: true });
ajv.addSchema(contractSchema);

function validator(name: string): ValidateFunction {
  const validate = ajv.getSchema(`${contractSchema.$id}#/$defs/${name}`);
  assert.ok(validate, `missing schema ${name}`);
  return validate;
}

test("Creation diagnostic schema preserves the normative warning/error pairing", () => {
  const creation = validator("CreationDiagnostic");
  const diagnostic = validator("Diagnostic");
  const failure = validator("EngineCreationFailure");
  const fatal = { code: "PROVIDER_SNAPSHOT_INVALID", severity: "error", message: "Invalid snapshot." };
  for (const code of ["LEXICON_MISSING_CAPABILITY", "PROVIDER_SNAPSHOT_INVALID"]) {
    for (const severity of ["info", "warning", "error"]) {
      const item = { code, severity, message: "Creation diagnostic." };
      const valid = severity === (code === "LEXICON_MISSING_CAPABILITY" ? "warning" : "error");
      const result = {
        ok: false, engine: null,
        diagnostics: code === "PROVIDER_SNAPSHOT_INVALID" ? [item] : [item, fatal],
      };
      assert.equal(diagnostic(item), true, "generic Diagnostic retains its declared severity vocabulary");
      assert.equal(creation(item), valid, `${code}/${severity} creation schema`);
      assert.equal(failure(result), valid, `${code}/${severity} failure schema`);
      assert.equal(validateEngineCreationResult(result).ok, valid, `${code}/${severity} runtime`);
    }
  }
});

function snapshot(id: unknown): Record<string, unknown> {
  return {
    id, snapshotFormatVersion: "1", providerId: "provider", providerConfigHash: "config",
    createdAt: "2026-09-26T00:00:00Z",
    entries: [{ inputHash: "b".repeat(64), output: { __int: "1" } }],
  };
}

test("Provider snapshot ids require primitive lower-case SHA-256 strings", () => {
  const validate = validator("ProviderSnapshot");
  for (const id of ["0".repeat(64), "a".repeat(64)]) {
    assert.equal(validate(snapshot(id)), true);
    assert.equal(validateProviderSnapshotShape(snapshot(id)).ok, true);
  }
  for (const id of [["a".repeat(64)], 123, null, undefined, {}, "", "A".repeat(64), "a".repeat(63)]) {
    assert.equal(validate(snapshot(id)), false);
    assert.equal(validateProviderSnapshotShape(snapshot(id)).ok, false, `invalid id ${JSON.stringify(id)}`);
  }
});

test("Provider snapshot validation rejects object ids without invoking coercion", () => {
  let coercions = 0;
  const id = {
    [Symbol.toPrimitive](): string {
      coercions += 1;
      return "a".repeat(64);
    },
  };
  const result = validateProviderSnapshotShape(snapshot(id));
  assert.equal(coercions, 0, "validation must not coerce an out-of-domain id");
  assert.equal(result.ok, false);
  assert.equal(validateProviderSnapshotShape(snapshot(Object.create(null))).ok, false);
});

test("Protected replacements are non-empty exact strings in schema and runtime", () => {
  const protectedSpan = validator("ProtectedSpan");
  const directives = validator("TranslationDirectives");
  for (const replacement of ["", " ", "\uD800", "e\u0301"]) {
    const span = {
      span: [0, 1], entityId: "e0", entityType: "person", replacement,
      formKind: "official_name", assembled: false, provenance: "user_glossary", evidenceClass: "E1a",
      externalAttestation: "not_attested", protection: "strict", styleApplied: null, rationale: "test",
    };
    const value = {
      schemaVersion: "1.0", sourceHash: "0".repeat(64), offsetUnit: "utf16", styleUsed: "hyphenated",
      protectedSpans: [span], termDirectives: [], unresolvedSemanticSpans: [], diagnostics: [],
    };
    const expected = replacement.length > 0;
    assert.equal(protectedSpan(span), expected, `ProtectedSpan ${JSON.stringify(replacement)}`);
    assert.equal(directives(value), expected, `TranslationDirectives ${JSON.stringify(replacement)}`);
    assert.equal(validateTranslationDirectivesShape(value).ok, expected, `runtime ${JSON.stringify(replacement)}`);
    assert.equal(value.protectedSpans[0]?.replacement, replacement, "validation preserves the exact string");
  }
});

test("CandidateBase materialises declared base fields without requiring candidate provenance", () => {
  const base = validator("CandidateBase");
  const full = validator("Candidate");
  const cases: Array<{
    root: string;
    value: CandidateBase<Reading | Romanisation | EnglishForm | TermRendering>;
  }> = [
    {
      root: "CandidateReading",
      value: {
        value: { jyutping: "loeng4", syllables: [], alignmentGroups: [] },
        evidenceClass: null, externalAttestation: "not_applicable", cautions: [],
        rank: 0, attestation: null, support: "medium", attestationCount: 0, variation: "lexical", note: "",
      },
    },
    {
      root: "CandidateRomanisation",
      value: {
        value: { formKind: "romanisation", assembled: false, text: "Leung" },
        evidenceClass: "E6", externalAttestation: "attested", cautions: [],
        scopeDowngrade: "class_applied_to_individual", support: "low",
      },
    },
    {
      root: "CandidateEnglishForm",
      value: {
        value: { formKind: "official_name", assembled: false, text: "Hong Kong" },
        evidenceClass: "E3", externalAttestation: "attested", cautions: [],
      },
    },
    {
      root: "CandidateTermRendering",
      value: {
        value: { preferred: "Road", entryId: "s0", entryScope: "lexical" },
        evidenceClass: "E1a", externalAttestation: "not_applicable", cautions: [],
      },
    },
  ];
  for (const { root, value } of cases) {
    const concrete = validator(root);
    assert.equal(base(value), true, `${root} base is complete without provenance`);
    assert.equal(full(value), false, "full candidates still require provenance");
    assert.equal(concrete(value), false, `${root} still requires provenance`);
    assert.equal(concrete({ ...value, provenance: "convention_table" }), true);
    assert.equal(concrete({ ...value, provenance: "inherited" }), false, "inherited reference remains required");
    assert.equal(concrete({ ...value, provenance: "inherited", inheritedFrom: { kind: "analysis", entityId: "e0" } }), true);
    for (const field of ["value", "evidenceClass", "externalAttestation", "cautions"]) {
      const incomplete: Record<string, unknown> = { ...value };
      delete incomplete[field];
      assert.equal(base(incomplete), false, `base still requires ${field}`);
    }
    assert.equal(base({ ...value, provenance: "convention_table" }), false, "provenance belongs to derived candidate types");
    assert.equal(base({ ...value, inheritedFrom: { kind: "analysis", entityId: "e0" } }), false);
  }
});
