import assert from "node:assert/strict";
import test from "node:test";
import { validateAnalysisStructure, validateAnnotationProjectionConsistency, validateLattice, validateReadingAlignment } from "../src/validators.js";
import { analysisFixture, type ObjectValue } from "./chg050-structure-fixtures.js";

function syllable(span: [number, number] | null): ObjectValue {
  return { span, jyutping: "aa1", initial: "", final: "aa", tone: 1,
    syllabic: false, align: span === null ? "grouped" : "exact" };
}

function reading(spans: Array<[number, number] | null>, groups: unknown[] = []): ObjectValue {
  return { jyutping: spans.map(() => "aa1").join(" "), syllables: spans.map(syllable), alignmentGroups: groups };
}

function analysisWithReading(source: string, value: ObjectValue): ObjectValue {
  const analysis = analysisFixture("Romanisation", { formKind: "romanisation", assembled: false, text: "verbatim" });
  analysis.source = source;
  analysis.entities = [];
  const token = (analysis.tokens as ObjectValue[])[0]!;
  Object.assign(token, { text: source, span: [0, source.length] });
  token.reading = { value, status: "resolved", provenance: "lexicon", confidence: "medium",
    evidenceClass: "E5", externalAttestation: "not_applicable", alternatives: [], ranked: false, cautions: [] };
  return analysis;
}

test("INV-14 rejects reversed, overlapping, and group-crossing individual reading spans", () => {
  for (const value of [
    reading([[1, 2], [0, 1]]),
    reading([[0, 2], [1, 3]]),
    reading([null, null, [1, 3]], [{ span: [0, 2], syllableIndices: [0, 1] }]),
    reading([[0, 2], null, null], [{ span: [1, 3], syllableIndices: [1, 2] }]),
  ]) {
    const before = structuredClone(value);
    assert.equal(validateReadingAlignment(value, [0, 3]).ok, false);
    assert.deepEqual(value, before, "Validation must not repair or reorder readings");
  }
  const legal = reading([[0, 1], null, null, [4, 5]], [{ span: [2, 4], syllableIndices: [1, 2] }]);
  assert.equal(validateReadingAlignment(legal, [0, 5]).ok, true, "Unannotated gaps and touching spans remain legal");
});

test("Reading alignment rejects malformed group records and sparse arrays", () => {
  for (const groups of [[null], [false], ["group"], new Array(1)]) {
    assert.equal(validateReadingAlignment(reading([[0, 1]], groups), [0, 1]).ok, false);
  }
  assert.equal(validateReadingAlignment({ jyutping: "aa1", syllables: new Array(1), alignmentGroups: [] }, [0, 1]).ok, false);
  const indices = [0, 1];
  delete indices[1];
  assert.equal(validateReadingAlignment(reading([null, null], [{ span: [0, 1], syllableIndices: indices }]), [0, 1]).ok, false);
});

test("Empty half-open reading spans do not occupy or overlap source text", () => {
  for (const spans of [
    [[0, 2], [1, 1]], [[0, 0], [0, 2]], [[0, 2], [2, 2]],
  ] as Array<Array<[number, number]>>) {
    const value = reading(spans);
    assert.equal(validateReadingAlignment(value, [0, 2]).ok, true);
  }
});

test("T-JP-041/G3 checks syllable and group boundaries inside UTF-16 text sequences", () => {
  for (const source of ["𨋢", "甲\uFE00", "甲\u{E0100}", "e\u0301", "𡃁\u0301"]) {
    assert.equal(validateAnalysisStructure(analysisWithReading(source, reading([[0, source.length]]))).ok, true);
    for (let split = 1; split < source.length; split += 1) {
      for (const value of [
        reading([[0, split], [split, source.length]]),
        reading([null, null, [split, source.length]], [{ span: [0, split], syllableIndices: [0, 1] }]),
      ]) {
        const analysis = analysisWithReading(source, value);
        assert.equal(validateAnalysisStructure(analysis).ok, false, `${JSON.stringify(source)} boundary ${split}`);
        const token = (analysis.tokens as ObjectValue[])[0]!;
        const envelope = token.reading as ObjectValue;
        token.reading = { ...envelope, value: null, status: "ambiguous", confidence: "none", ranked: true,
          alternatives: [0, 1].map(rank => ({ value, rank, provenance: "lexicon", evidenceClass: "E5", externalAttestation: "not_applicable", cautions: [] })) };
        assert.equal(validateAnalysisStructure(analysis).ok, false, "Candidate readings receive the same boundary checks");
      }
    }
  }
});

test("Structural reading validation preserves mixed text, lone surrogates, and normalization distinctions", () => {
  for (const source of ["裏裡", "Ａ，B 中\r\n", "\uD800", "\uDC00", "é", "e\u0301", "甲\u{E0100}"]) {
    const analysis = analysisWithReading(source, reading([[0, source.length]]));
    const before = structuredClone(analysis);
    assert.equal(validateAnalysisStructure(analysis).ok, true);
    assert.deepEqual(analysis, before);
  }
});

test("Lattice windows stay inside the supplied source instead of relying on truncating slices", () => {
  for (const source of ["", "甲", "A𨋢B"]) {
    const lattice = { window: [0, source.length + 1],
      edges: [{ index: 0, span: [0, source.length + 1], text: source, source: "character" }],
      alternatives: [{ edgeIndices: [0] }] };
    assert.equal(validateLattice(lattice, source).ok, false);
  }
  const legal = { window: [1, 3], edges: [{ index: 0, span: [1, 3], text: "𨋢", source: "character" }], alternatives: [{ edgeIndices: [0] }] };
  assert.equal(validateLattice(legal, "A𨋢B").ok, true);
  assert.equal(validateLattice(legal).ok, true, "Source-independent geometry checks remain supported");
});

test("Lattice paths cannot skip sparse edges, alternatives, or index slots", () => {
  const base = { window: [0, 1], edges: [{ index: 0, span: [0, 1], text: "甲", source: "character" }], alternatives: [{ edgeIndices: [0] }] };
  const missingEdge = structuredClone(base);
  missingEdge.edges.unshift({ ...missingEdge.edges[0]!, index: 1 });
  missingEdge.edges[1]!.index = 1;
  delete missingEdge.edges[0];
  missingEdge.alternatives[0]!.edgeIndices = [0, 1];
  const missingAlternative = structuredClone(base);
  delete missingAlternative.alternatives[0];
  const missingIndex = structuredClone(base);
  missingIndex.alternatives[0]!.edgeIndices = [0, 0];
  delete missingIndex.alternatives[0]!.edgeIndices[0];
  for (const lattice of [missingEdge, missingAlternative, missingIndex]) {
    assert.equal(validateLattice(lattice, "甲").ok, false);
  }
});

test("Annotation projection preserves selected verbatim forms and does not invent unresolved text", () => {
  const text = " McDONALD e\u0301\uD800 ";
  for (const channel of ["romanisation", "englishForm"]) {
    const analysis = analysisFixture("EnglishForm", { formKind: "romanisation", assembled: false, text });
    const entity = (analysis.entities as ObjectValue[])[0]!;
    const envelope = entity[channel] as ObjectValue;
    envelope.value = { formKind: "romanisation", assembled: false, text };
    const annotation = { ref: { owner: "entity", entityId: "e0", channel }, span: entity.span, sourceText: entity.text,
      rendered: text, status: envelope.status, confidence: envelope.confidence, cautions: envelope.cautions, alternatives: [] };
    const projection = { schemaVersion: "1.0", sourceHash: analysis.sourceHash, offsetUnit: "utf16", annotations: [annotation] };
    assert.equal(validateAnnotationProjectionConsistency(analysis, projection).ok, true);
    for (const rendered of ["wrong", text.trim(), text.normalize("NFC"), null]) {
      assert.equal(validateAnnotationProjectionConsistency(analysis, { ...projection, annotations: [{ ...annotation, rendered }] }).ok, false);
    }
    Object.assign(envelope, { value: null, status: "unresolved", confidence: "none", reason: "no_known_english_form" });
    Object.assign(annotation, { rendered: null, status: "unresolved", confidence: "none" });
    assert.equal(validateAnnotationProjectionConsistency(analysis, projection).ok, true);
    assert.equal(validateAnnotationProjectionConsistency(analysis, { ...projection, annotations: [{ ...annotation, rendered: "invented" }] }).ok, false);
  }
});
