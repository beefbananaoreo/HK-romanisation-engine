/** CHG-050 structural vectors. No style or rendering algorithm is implemented here. */
export type ObjectValue = Record<string, unknown>;
export const groupingSurfaces = ["Romanisation", "EnglishForm", "MemoryRomanisation", "MemoryEnglishForm"] as const;
export type GroupingSurface = typeof groupingSurfaces[number];

export function assembledFixture(surface: GroupingSurface, count = 3): ObjectValue {
  const memory = surface.startsWith("Memory");
  const english = surface.endsWith("EnglishForm");
  return {
    formKind: "romanisation", assembled: true,
    ...(english ? { person: true } : {}),
    units: Array.from({ length: count }, (_, index) => ({
      ...(!memory ? { id: `u${index}`, span: [index, index + 1] } : {}),
      ...(english ? { kind: "romanised", generated: true } : {}),
      text: ["leung", "chi", "yiu", "tai", "man"][index] ?? "a",
      syllable: "aa1", role: index === 0 ? "surname" : "given",
      provenance: "rule_engine", evidenceClass: "E7", externalAttestation: "not_attested",
    })),
    grouping: Array.from({ length: count }, (_, index) => [index]),
  };
}

function selected(value: unknown, memory: boolean): ObjectValue {
  return {
    value, status: "resolved", provenance: "rule_engine", confidence: "low",
    evidenceClass: "E7", externalAttestation: "not_attested", cautions: [],
    ...(!memory ? { alternatives: [], ranked: false } : {}),
  };
}

export function documentContextFixture(surface: GroupingSurface, form: ObjectValue): ObjectValue {
  const channel = surface.endsWith("EnglishForm") ? "englishForm" : "romanisation";
  return {
    contextFormatVersion: "1", id: "chg050-context",
    entities: [{ ref: "m0", text: "梁知遙", type: "person", [channel]: selected(form, true) }],
  };
}

export function analysisFixture(surface: GroupingSurface, form: ObjectValue): ObjectValue {
  const count = Array.isArray(form.units) && form.units.length > 0 ? form.units.length : 3;
  const source = "甲".repeat(count);
  const absent = {
    value: null, status: "unresolved", reason: "reading_not_found", provenance: "none",
    confidence: "none", evidenceClass: null, externalAttestation: "not_applicable",
    alternatives: [], ranked: false, cautions: [],
  };
  const verbatim = { formKind: "romanisation", assembled: false, text: "verbatim" };
  return {
    schemaVersion: "1.0", offsetUnit: "utf16", source, sourceHash: "a".repeat(64),
    versions: {
      schemaVersion: "1.0", contractVersion: "5.0.16", providerSnapshotId: null,
      engineVersion: "engine", lexiconVersion: "lexicon", rulesVersion: "rules",
      segmenterVersion: "segmenter", userDataVersion: 0,
    },
    optionsHash: "b".repeat(64), documentContextUsed: false,
    tokens: [{ id: "t0", span: [0, count], text: source, type: "han", reading: absent, romanisation: selected(verbatim, false) }],
    entities: [{
      id: "e0", span: [0, count], text: source, type: "person", primary: true,
      englishFallbackPolicy: "romanisation_allowed", detectionEvidence: [], detectionConfidence: "low",
      reading: absent,
      romanisation: selected(surface === "Romanisation" ? form : verbatim, false),
      englishForm: selected(surface === "EnglishForm" ? form : verbatim, false),
    }],
    regions: [], termResolutions: [], diagnostics: [],
  };
}

export const groupingShapeFailures: ReadonlyArray<readonly [string, unknown]> = [
  ["empty grouping", []], ["empty only group", [[]]], ["empty middle group", [[0], [], [1, 2]]],
  ["missing array", undefined], ["null grouping", null], ["string grouping", "0,1,2"],
  ["non-array group", [0, 1, 2]], ["null group", [null]],
  ["negative", [[0, -1, 2]]], ["fractional", [[0, 0.5, 2]]], ["numeric string", [[0, "1", 2]]],
  ["null index", [[0, null, 2]]], ["boolean index", [[0, true, 2]]],
  ["object index", [[0, { __int: "1" }, 2]]], ["unsafe integer", [[0, Number.MAX_SAFE_INTEGER + 1, 2]]],
  ["bigint index", [[0, 1n, 2]]],
  ["NaN", [[0, Number.NaN, 2]]], ["positive infinity", [[0, Number.POSITIVE_INFINITY, 2]]],
  ["negative infinity", [[0, Number.NEGATIVE_INFINITY, 2]]],
];

export const groupingCrossFieldFailures: ReadonlyArray<readonly [string, unknown]> = [
  ["omitted tail", [[0], [1]]], ["omitted head", [[1, 2]]], ["omitted middle", [[0, 2]]],
  ["duplicate inside", [[0, 1, 1, 2]]], ["overlap across groups", [[0, 1], [1, 2]]],
  ["all repeated", [[0, 1, 2], [0, 1, 2]]], ["reordered groups", [[1], [0], [2]]],
  ["reordered inside", [[0, 2, 1]]], ["reversed", [[2, 1, 0]]],
  ["out of range", [[0, 1, 3]]], ["safe maximum outside owner", [[0, 1, Number.MAX_SAFE_INTEGER]]],
];
