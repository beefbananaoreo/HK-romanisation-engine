/** Executable non-linguistic validators for public contract 5.0.16. */

export interface ValidationIssue {
  code: string;
  path: string;
  message: string;
  packetRef: string;
}

export interface ValidationResult {
  ok: boolean;
  issues: ValidationIssue[];
}

export type ContractLayer = "L2" | "L3R" | "L3E" | "L4";

const STATUS_VALUES = new Set([
  "resolved", "fallback", "ambiguous", "conflict", "unresolved", "unsupported", "out_of_scope",
]);
const PRODUCED_PROVENANCES = new Set([
  "user_glossary", "convention_table", "lexicon", "rule_engine", "inherited", "none",
]);
const ALL_PROVENANCES = new Set([...PRODUCED_PROVENANCES, "entity_record", "external"]);
const CONFIDENCES = new Set(["high", "medium", "low", "none"]);
const EVIDENCE_CLASSES = new Set(["E1a", "E1b", "E1c", "E2", "E3", "E4", "E5", "E6", "E7"]);
const STORE_EVIDENCE_CLASSES = new Set(["E1a", "E1b", "E1c", "E2"]);
const ATTESTATION_VALUES = new Set(["attested", "not_attested", "not_applicable"]);
const FORM_KINDS = new Set(["romanisation", "official_name", "native_original", "translation", "hybrid"]);
const REASON_CODES = new Set([
  "reading_not_found", "number_reading_requires_context", "lexicon_unavailable", "unsupported_code_point",
  "malformed_input", "no_known_english_form",
]);
const CAUTION_CODES = new Set([
  "stale_source", "overrides_official", "decomposed_not_attested", "source_unavailable",
  "non_hk_convention_suspected", "cjk_non_chinese_suspected", "foreign_origin_suspected",
  "sibilant_class_unknown", "multiple_conventions", "spelling_collision", "bearer_spelling_unknown",
  "non_chinese_script", "window_ceiling_reached", "official_name_expected",
]);
const PERSON_TYPES = new Set(["person", "person.surname", "person.foreign"]);
const DIAGNOSTIC_CODES = new Set([
  "LEXICON_MISSING_CAPABILITY", "WINDOW_CEILING_REACHED", "SOURCE_UNAVAILABLE",
  "IMPORT_VALIDATION_FAILED", "TERM_DIRECTIVE_DROPPED_OVERLAP", "PROVIDER_SNAPSHOT_INVALID",
]);
const DIAGNOSTIC_SEVERITIES = new Set(["info", "warning", "error"]);

/** CHG-047: the public number is an exact mathematical integer, not a generic number. */
export const MAX_USER_DATA_VERSION = 9007199254740991;

export function isValidUserDataVersion(input: unknown): input is number {
  return typeof input === "number"
    && Number.isSafeInteger(input)
    && input >= 0
    && input <= MAX_USER_DATA_VERSION;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasOwn(value: Record<string, unknown>, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(value, key);
}

function addIssue(
  issues: ValidationIssue[],
  code: string,
  path: string,
  message: string,
  packetRef: string,
): void {
  issues.push({ code, path, message, packetRef });
}

function finish(issues: ValidationIssue[]): ValidationResult {
  return { ok: issues.length === 0, issues };
}

/** Validate one untyped public `userDataVersion` boundary value. */
export function validateUserDataVersion(input: unknown, path = "$" ): ValidationResult {
  const issues: ValidationIssue[] = [];
  if (!isValidUserDataVersion(input)) {
    addIssue(
      issues,
      "USER_DATA_VERSION_DOMAIN",
      path,
      "userDataVersion must be an exact safe integer in the inclusive range 0..9007199254740991.",
      "§5.3; §5.9; CHG-047",
    );
  }
  return finish(issues);
}

/** Validate the complete public Versions record, including CHG-047's numeric domain. */
export function validateVersions(input: unknown): ValidationResult {
  const issues: ValidationIssue[] = [];
  if (!isRecord(input)) {
    addIssue(issues, "VERSIONS_OBJECT", "$", "Versions must be an object.", "§5.3");
    return finish(issues);
  }
  const required = [
    "schemaVersion", "contractVersion", "providerSnapshotId", "engineVersion",
    "lexiconVersion", "rulesVersion", "segmenterVersion", "userDataVersion",
  ] as const;
  for (const field of required) {
    if (!hasOwn(input, field)) addIssue(issues, "VERSIONS_REQUIRED", `$.${field}`, `${field} is required.`, "§5.3");
  }
  if (input.schemaVersion !== "1.0") addIssue(issues, "VERSIONS_SCHEMA", "$.schemaVersion", "schemaVersion must be \"1.0\".", "§5.3");
  if (input.contractVersion !== "5.0.16") addIssue(issues, "VERSIONS_CONTRACT", "$.contractVersion", "contractVersion must be \"5.0.16\".", "§5.3; CHG-050");
  if (input.providerSnapshotId !== null && (typeof input.providerSnapshotId !== "string" || !/^[0-9a-f]{64}$/u.test(input.providerSnapshotId))) {
    addIssue(issues, "VERSIONS_SNAPSHOT_ID", "$.providerSnapshotId", "providerSnapshotId must be null or a lower-case SHA-256 hex string.", "§5.3; §5.13");
  }
  for (const field of ["engineVersion", "lexiconVersion", "rulesVersion", "segmenterVersion"] as const) {
    if (typeof input[field] !== "string" || input[field].length === 0) {
      addIssue(issues, "VERSIONS_STRING", `$.${field}`, `${field} must be a non-empty string.`, "§5.3");
    }
  }
  mergeInto(issues, validateUserDataVersion(input.userDataVersion, "$.userDataVersion"));
  return finish(issues);
}

export type UserDataVersionTransition =
  | { ok: true; userDataVersion: number }
  | { ok: false; userDataVersion: number; reason: "overflow" };

/** Pure transaction transition used by the lifecycle witnesses; no Store state is mutated. */
export function commitUserDataVersion(
  current: unknown,
  changesPersistentState: boolean,
): UserDataVersionTransition {
  if (!isValidUserDataVersion(current)) {
    throw new TypeError("current userDataVersion is outside the public exact-integer domain");
  }
  if (!changesPersistentState) return { ok: true, userDataVersion: current };
  if (current === MAX_USER_DATA_VERSION) return { ok: false, userDataVersion: current, reason: "overflow" };
  return { ok: true, userDataVersion: current + 1 };
}

/** Check a before/after transaction witness without implementing Store persistence. */
export function validateUserDataVersionTransition(
  before: unknown,
  after: unknown,
  changesPersistentState: boolean,
  committed: boolean,
): ValidationResult {
  const issues: ValidationIssue[] = [];
  mergeInto(issues, validateUserDataVersion(before, "$.before"));
  mergeInto(issues, validateUserDataVersion(after, "$.after"));
  if (!isValidUserDataVersion(before) || !isValidUserDataVersion(after)) return finish(issues);
  const expected = committed && changesPersistentState
    ? (before === MAX_USER_DATA_VERSION ? null : before + 1)
    : before;
  if (expected === null) {
    addIssue(issues, "USER_DATA_VERSION_OVERFLOW", "$.after", "A committed mutation at the maximum must fail atomically and retain the maximum version.", "§5.9; CHG-047");
  } else if (after !== expected) {
    addIssue(issues, "USER_DATA_VERSION_TRANSITION", "$.after", `Expected userDataVersion ${expected} for this transaction.`, "§5.9; CHG-047");
  }
  if (!committed && after !== before) {
    addIssue(issues, "USER_DATA_VERSION_UNCOMMITTED", "$.after", "Failed or rolled-back operations do not advance userDataVersion.", "§5.9; CHG-047");
  }
  return finish(issues);
}

function mergeInto(target: ValidationIssue[], result: ValidationResult, prefix = ""): void {
  for (const item of result.issues) {
    target.push({ ...item, path: `${prefix || "$"}${item.path === "$" ? "" : item.path.slice(1)}` });
  }
}

function validateKnownStrings(
  input: unknown,
  allowed: ReadonlySet<string>,
  path: string,
  code: string,
  packetRef: string,
  issues: ValidationIssue[],
): void {
  if (typeof input !== "string" || !allowed.has(input)) {
    addIssue(issues, code, path, "Value is outside the current producer vocabulary.", packetRef);
  }
}

function validateJsonValue(
  input: unknown,
  path: string,
  issues: ValidationIssue[],
  active = new Set<object>(),
): void {
  if (input === null || typeof input === "boolean" || typeof input === "string") return;
  if (typeof input === "number") {
    if (!Number.isFinite(input)) {
      addIssue(issues, "JSON_VALUE_NUMBER", path, "JsonValue numbers must be finite.", "§5.2; §5.14");
    }
    return;
  }
  if (typeof input !== "object" || input === null) {
    addIssue(issues, "JSON_VALUE_DOMAIN", path, "Value is outside the serialisable JsonValue domain.", "§5.2; §5.14");
    return;
  }
  if (active.has(input)) {
    addIssue(issues, "JSON_VALUE_CYCLE", path, "JsonValue must be acyclic.", "§5.2 JsonValue");
    return;
  }
  active.add(input);
  if (Array.isArray(input)) {
    if (Object.getOwnPropertyNames(input).some((key) => key !== "length"
        && (!/^(?:0|[1-9][0-9]*)$/u.test(key) || Number(key) >= input.length))
        || Object.getOwnPropertySymbols(input).length !== 0) {
      addIssue(issues, "JSON_VALUE_ARRAY", path, "JsonValue arrays contain only indexed string-domain members.", "§5.2 JsonValue");
    }
    for (let index = 0; index < input.length; index += 1) {
      const descriptor = Object.getOwnPropertyDescriptor(input, String(index));
      if (descriptor === undefined) {
        addIssue(issues, "JSON_VALUE_ARRAY_DENSE", `${path}[${index}]`, "JsonValue arrays cannot contain holes.", "§5.2 JsonValue");
      } else if (descriptor.enumerable !== true
          || hasOwn(descriptor as unknown as Record<string, unknown>, "get")
          || hasOwn(descriptor as unknown as Record<string, unknown>, "set")) {
        addIssue(issues, "JSON_VALUE_PROPERTY", `${path}[${index}]`, "JsonValue members are data properties.", "§5.2 JsonValue");
      } else {
        validateJsonValue(descriptor.value, `${path}[${index}]`, issues, active);
      }
    }
  } else {
    const prototype = Object.getPrototypeOf(input);
    if (prototype !== Object.prototype && prototype !== null) {
      addIssue(issues, "JSON_VALUE_OBJECT", path, "JsonValue objects must be ordinary JSON objects.", "§5.2 JsonValue");
      active.delete(input);
      return;
    }
    if (Object.getOwnPropertySymbols(input).length !== 0) {
      addIssue(issues, "JSON_VALUE_SYMBOL", path, "JsonValue has no symbol-keyed properties.", "§5.2 JsonValue");
    }
    Object.entries(Object.getOwnPropertyDescriptors(input)).forEach(([key, descriptor]) => {
      if (!descriptor.enumerable || hasOwn(descriptor as unknown as Record<string, unknown>, "get")
          || hasOwn(descriptor as unknown as Record<string, unknown>, "set")) {
        addIssue(issues, "JSON_VALUE_PROPERTY", `${path}.${key}`, "JsonValue members are enumerable data properties.", "§5.2 JsonValue");
      } else {
        validateJsonValue(descriptor.value, `${path}.${key}`, issues, active);
      }
    });
  }
  active.delete(input);
}

function validateDiagnostic(
  input: unknown,
  path: string,
  issues: ValidationIssue[],
  owner: "creation" | "analysis" | "projection",
): void {
  if (!isRecord(input)) {
    addIssue(issues, "DIAGNOSTIC_OBJECT", path, "Diagnostic must be an object.", "§5.14");
    return;
  }
  validateKnownStrings(input.code, DIAGNOSTIC_CODES, `${path}.code`, "DIAGNOSTIC_CODE", "§5.14", issues);
  validateKnownStrings(input.severity, DIAGNOSTIC_SEVERITIES, `${path}.severity`, "DIAGNOSTIC_SEVERITY", "§5.14", issues);
  if (typeof input.message !== "string") {
    addIssue(issues, "DIAGNOSTIC_MESSAGE", `${path}.message`, "Diagnostic.message must be a string.", "§5.14");
  }
  if (hasOwn(input, "data")) {
    if (!isRecord(input.data)) {
      addIssue(issues, "DIAGNOSTIC_DATA", `${path}.data`, "Diagnostic.data must be a JsonValue object.", "§5.14");
    } else {
      validateJsonValue(input.data, `${path}.data`, issues);
    }
  }
  if (owner === "creation") {
    if (hasOwn(input, "span")) {
      addIssue(issues, "CREATION_DIAGNOSTIC_SPAN", `${path}.span`, "Creation diagnostics omit span.", "§5.10; §5.14");
    }
    if (input.code !== "LEXICON_MISSING_CAPABILITY" && input.code !== "PROVIDER_SNAPSHOT_INVALID") {
      addIssue(issues, "CREATION_DIAGNOSTIC_OWNER", `${path}.code`, "Code is not produced by engine creation.", "§5.14 diagnostic ownership");
    }
    if (input.code === "LEXICON_MISSING_CAPABILITY" && input.severity !== "warning") {
      addIssue(issues, "CREATION_DIAGNOSTIC_SEVERITY", `${path}.severity`, "A usable missing capability is a creation warning.", "§5.10; T-API-011");
    }
    if (input.code === "PROVIDER_SNAPSHOT_INVALID" && input.severity !== "error") {
      addIssue(issues, "CREATION_DIAGNOSTIC_SEVERITY", `${path}.severity`, "A fatal invalid snapshot is a creation error.", "§5.10; T-API-043");
    }
    return;
  }
  if (owner === "projection") {
    if (input.code !== "TERM_DIRECTIVE_DROPPED_OVERLAP") {
      addIssue(issues, "PROJECTION_DIAGNOSTIC_OWNER", `${path}.code`, "Only overlap-drop diagnostics are currently projection-produced.", "§5.12; §5.14");
    }
    validateSpan(input.span, `${path}.span`, issues);
    return;
  }
  if (input.code !== "WINDOW_CEILING_REACHED" && input.code !== "SOURCE_UNAVAILABLE") {
    addIssue(issues, "ANALYSIS_DIAGNOSTIC_OWNER", `${path}.code`, "Code has no current Analysis producer assignment.", "§5.14 diagnostic ownership");
  }
  if (hasOwn(input, "span")) validateSpan(input.span, `${path}.span`, issues);
}

function validateAttestation(input: unknown, path: string, issues: ValidationIssue[]): void {
  if (!isRecord(input)) {
    addIssue(issues, "ATTESTATION_OBJECT", path, "Attestation must be an object.", "§5.5 Attestation");
    return;
  }
  const scopes = new Set(["individual", "institution", "place_instance", "class"]);
  if (typeof input.scope !== "string" || !scopes.has(input.scope)) {
    addIssue(issues, "ATTESTATION_SCOPE", `${path}.scope`, "Invalid Attestation.scope.", "§5.5 Attestation");
  }
  for (const field of ["sourceRef", "asOf"] as const) {
    if (typeof input[field] !== "string" || input[field].length === 0) {
      addIssue(issues, "ATTESTATION_REQUIRED", `${path}.${field}`, `${field} must be a non-empty string.`, "§5.5 Attestation");
    }
  }
}

function validateInheritanceShape(input: unknown, path: string, issues: ValidationIssue[]): void {
  if (!isRecord(input)) {
    addIssue(issues, "INHERITANCE_OBJECT", path, "InheritanceRef must be an object.", "§5.7.4");
    return;
  }
  if (input.kind === "analysis") {
    if (typeof input.entityId !== "string" || input.entityId.length === 0) {
      addIssue(issues, "INHERITANCE_ANALYSIS_ID", `${path}.entityId`, "analysis reference requires entityId.", "§5.7.4");
    }
    for (const forbidden of ["contextId", "ref"] as const) {
      if (hasOwn(input, forbidden)) {
        addIssue(issues, "INHERITANCE_BRANCH", `${path}.${forbidden}`, `${forbidden} is forbidden on analysis references.`, "§5.7.4");
      }
    }
    return;
  }
  if (input.kind === "documentContext") {
    for (const required of ["contextId", "ref"] as const) {
      if (typeof input[required] !== "string" || input[required].length === 0) {
        addIssue(issues, "INHERITANCE_CONTEXT_REF", `${path}.${required}`, `${required} is required.`, "§5.7.4");
      }
    }
    if (hasOwn(input, "entityId")) {
      addIssue(issues, "INHERITANCE_BRANCH", `${path}.entityId`, "entityId is forbidden on documentContext references.", "§5.7.4");
    }
    return;
  }
  addIssue(issues, "INHERITANCE_KIND", `${path}.kind`, "Unknown InheritanceRef.kind.", "§5.7.4");
}

function validateCandidate(
  candidate: unknown,
  parentRanked: boolean,
  layer: ContractLayer | undefined,
  path: string,
  issues: ValidationIssue[],
  producer: boolean,
): void {
  if (!isRecord(candidate)) {
    addIssue(issues, "CANDIDATE_OBJECT", path, "Candidate must be an object.", "§5.5 Candidate<T>");
    return;
  }
  for (const field of ["value", "provenance", "evidenceClass", "externalAttestation", "cautions"] as const) {
    if (!hasOwn(candidate, field)) {
      addIssue(issues, "CANDIDATE_REQUIRED", `${path}.${field}`, `${field} is required.`, "§5.5 Candidate<T>");
    }
  }
  if (hasOwn(candidate, "rank") !== parentRanked) {
    addIssue(
      issues, "CANDIDATE_RANK_APPLICABILITY", `${path}.rank`,
      parentRanked ? "rank is required when parent ranked is true." : "rank is forbidden when parent ranked is false.",
      "§5.5 CandidateBase<T>",
    );
  } else if (hasOwn(candidate, "rank") && (typeof candidate.rank !== "number" || !Number.isFinite(candidate.rank))) {
    addIssue(issues, "CANDIDATE_RANK_TYPE", `${path}.rank`, "rank must be a finite number.", "§5.5 CandidateBase<T>");
  }
  const provenanceSet = producer ? PRODUCED_PROVENANCES : ALL_PROVENANCES;
  validateKnownStrings(candidate.provenance, provenanceSet, `${path}.provenance`, "CANDIDATE_PROVENANCE", "§5.5.2; RULE-API-9", issues);
  const inherited = candidate.provenance === "inherited";
  if (inherited && !hasOwn(candidate, "inheritedFrom")) {
    addIssue(issues, "CANDIDATE_INHERITANCE_REQUIRED", `${path}.inheritedFrom`, "Inherited candidate requires its own reference.", "RULE-API-24");
  }
  if (!inherited && hasOwn(candidate, "inheritedFrom")) {
    addIssue(issues, "CANDIDATE_INHERITANCE_FORBIDDEN", `${path}.inheritedFrom`, "Non-inherited candidate forbids inheritedFrom.", "RULE-API-24");
  }
  if (hasOwn(candidate, "inheritedFrom")) validateInheritanceShape(candidate.inheritedFrom, `${path}.inheritedFrom`, issues);
  if (candidate.evidenceClass !== null) {
    validateKnownStrings(candidate.evidenceClass, EVIDENCE_CLASSES, `${path}.evidenceClass`, "CANDIDATE_EVIDENCE", "§5.5.2", issues);
  }
  validateKnownStrings(candidate.externalAttestation, ATTESTATION_VALUES, `${path}.externalAttestation`, "CANDIDATE_ATTESTATION", "§5.5", issues);
  if ((layer === "L2" || layer === "L4") && candidate.externalAttestation !== "not_applicable") {
    addIssue(issues, "LAYER_ATTESTATION_APPLICABILITY", `${path}.externalAttestation`, `${layer} requires not_applicable.`, "§5.5.2 applicability table");
  }
  if (hasOwn(candidate, "attestation") && candidate.attestation !== null) {
    validateAttestation(candidate.attestation, `${path}.attestation`, issues);
  }
  if (hasOwn(candidate, "variation")) {
    if (layer !== "L2") {
      addIssue(
        issues,
        "CANDIDATE_VARIATION_LAYER",
        `${path}.variation`,
        "variation is legal only on an L2 Reading candidate.",
        "§5.5 CandidateBase<T>",
      );
    } else {
      validateKnownStrings(candidate.variation, new Set(["lexical", "register", "sociophonetic", "sandhi", "uncertain"]), `${path}.variation`, "CANDIDATE_VARIATION", "§5.5.2", issues);
    }
  }
  if (!Array.isArray(candidate.cautions)) {
    addIssue(issues, "CANDIDATE_CAUTIONS", `${path}.cautions`, "cautions must be an array.", "§5.5 CandidateBase<T>");
  } else {
    candidate.cautions.forEach((value, index) => {
      validateKnownStrings(value, CAUTION_CODES, `${path}.cautions[${index}]`, "CAUTION_CODE", "§5.5.2", issues);
    });
  }
  if (candidate.support === "high") {
    addIssue(issues, "CANDIDATE_SUPPORT_CAP", `${path}.support`, "Candidate support is capped at medium.", "§7.3.1");
  } else if (hasOwn(candidate, "support")) {
    validateKnownStrings(candidate.support, CONFIDENCES, `${path}.support`, "CANDIDATE_SUPPORT", "§7.3.1", issues);
  }
  if (candidate.provenance === "rule_engine" && hasOwn(candidate, "support")
      && !["low", "none"].includes(String(candidate.support))) {
    addIssue(issues, "CANDIDATE_RULE_ENGINE_SUPPORT_CAP", `${path}.support`, "Rule-engine candidate support is capped at low when supplied.", "§7.3.1–2; INV-5");
  }
  if (hasOwn(candidate, "scopeDowngrade")
      && (candidate.scopeDowngrade !== "class_applied_to_individual"
        || candidate.evidenceClass !== "E6"
        || (hasOwn(candidate, "support") && !["low", "none"].includes(String(candidate.support))))) {
    addIssue(issues, "CANDIDATE_SCOPE_DOWNGRADE", `${path}.scopeDowngrade`, "Candidate scopeDowngrade requires E6 and, when supplied, low/none support.", "§5.5; §7.3.1–3");
  }
  if (hasOwn(candidate, "attestationCount") && (typeof candidate.attestationCount !== "number" || !Number.isFinite(candidate.attestationCount))) {
    addIssue(issues, "ATTESTATION_COUNT_TYPE", `${path}.attestationCount`, "attestationCount must be a finite number.", "§5.5 CandidateBase<T>");
  }
}

/** §5.5.1 truth table plus context-free §5/§7 invariants. */
export function validateValueEnvelope(
  input: unknown,
  options: { layer?: ContractLayer; producer?: boolean } = {},
): ValidationResult {
  const issues: ValidationIssue[] = [];
  if (!isRecord(input)) {
    addIssue(issues, "VALUE_OBJECT", "$", "Value envelope must be an object.", "§5.5");
    return finish(issues);
  }
  const producer = options.producer ?? true;
  for (const field of [
    "value", "status", "provenance", "confidence", "evidenceClass",
    "externalAttestation", "alternatives", "ranked", "cautions",
  ] as const) {
    if (!hasOwn(input, field)) addIssue(issues, "VALUE_REQUIRED", `$.${field}`, `${field} is required.`, "§5.5 Value<T>");
  }
  if (typeof input.status !== "string" || !STATUS_VALUES.has(input.status)) {
    addIssue(issues, "STATUS_ENUM", "$.status", "Unknown producer Status.", "§5.5.2; RULE-API-9");
    return finish(issues);
  }
  const alternatives = Array.isArray(input.alternatives) ? input.alternatives : [];
  if (!Array.isArray(input.alternatives)) addIssue(issues, "VALUE_ALTERNATIVES", "$.alternatives", "alternatives must be an array.", "§5.5");
  const reasonPresent = hasOwn(input, "reason");
  const validReason = reasonPresent && typeof input.reason === "string" && REASON_CODES.has(input.reason);
  const nonNull = input.value !== null && input.value !== undefined;
  switch (input.status) {
    case "resolved":
    case "fallback":
      if (!nonNull) addIssue(issues, "STATUS_VALUE_NON_NULL", "$.value", `${input.status} requires non-null value.`, "§5.5.1");
      if (reasonPresent) addIssue(issues, "STATUS_REASON_ABSENT", "$.reason", `${input.status} forbids reason, including null.`, "§5.5.1");
      break;
    case "ambiguous":
      if (input.value !== null) addIssue(issues, "STATUS_VALUE_NULL", "$.value", "ambiguous requires explicit null.", "§5.5.1");
      if (alternatives.length < 2) addIssue(issues, "STATUS_ALTERNATIVES_MIN", "$.alternatives", "ambiguous requires at least two alternatives.", "§5.5.1");
      if (input.ranked !== true) addIssue(issues, "STATUS_RANKED_TRUE", "$.ranked", "ambiguous requires ranked:true.", "§5.5.1");
      if (reasonPresent) addIssue(issues, "STATUS_REASON_ABSENT", "$.reason", "ambiguous forbids reason.", "§5.5.1");
      break;
    case "conflict":
      if (input.value !== null) addIssue(issues, "STATUS_VALUE_NULL", "$.value", "conflict requires explicit null.", "§5.5.1");
      if (alternatives.length < 2) addIssue(issues, "STATUS_ALTERNATIVES_MIN", "$.alternatives", "conflict requires at least two alternatives.", "§5.5.1");
      if (input.ranked !== false) addIssue(issues, "STATUS_RANKED_FALSE", "$.ranked", "conflict requires ranked:false.", "§5.5.1");
      if (reasonPresent) addIssue(issues, "STATUS_REASON_ABSENT", "$.reason", "conflict forbids reason.", "§5.5.1");
      break;
    case "unresolved":
      if (input.value !== null) addIssue(issues, "STATUS_VALUE_NULL", "$.value", "unresolved requires explicit null.", "§5.5.1");
      if (input.ranked !== false) addIssue(issues, "STATUS_RANKED_FALSE", "$.ranked", "unresolved requires ranked:false.", "§5.5.1");
      if (!validReason) addIssue(issues, "STATUS_REASON_REQUIRED", "$.reason", "unresolved requires a current ReasonCode.", "§5.5.1; §5.5.2");
      break;
    case "unsupported":
      if (input.value !== null) addIssue(issues, "STATUS_VALUE_NULL", "$.value", "unsupported requires explicit null.", "§5.5.1");
      if (alternatives.length !== 0) addIssue(issues, "STATUS_ALTERNATIVES_EMPTY", "$.alternatives", "unsupported requires empty alternatives.", "§5.5.1");
      if (input.ranked !== false) addIssue(issues, "STATUS_RANKED_FALSE", "$.ranked", "unsupported requires ranked:false.", "§5.5.1");
      if (!validReason) addIssue(issues, "STATUS_REASON_REQUIRED", "$.reason", "unsupported requires a current ReasonCode.", "§5.5.1; §5.5.2");
      break;
    case "out_of_scope":
      if (input.value !== null) addIssue(issues, "STATUS_VALUE_NULL", "$.value", "out_of_scope requires explicit null.", "§5.5.1");
      if (alternatives.length !== 0) addIssue(issues, "STATUS_ALTERNATIVES_EMPTY", "$.alternatives", "out_of_scope requires empty alternatives.", "§5.5.1");
      if (input.ranked !== false) addIssue(issues, "STATUS_RANKED_FALSE", "$.ranked", "out_of_scope requires ranked:false.", "§5.5.1");
      if (reasonPresent) addIssue(issues, "STATUS_REASON_ABSENT", "$.reason", "out_of_scope forbids reason.", "§5.5.1");
      break;
  }
  if (typeof input.ranked !== "boolean") addIssue(issues, "VALUE_RANKED", "$.ranked", "ranked must be boolean.", "§5.5");
  Array.from(alternatives).forEach((candidate, index) => {
    validateCandidate(candidate, input.ranked === true, options.layer, `$.alternatives[${index}]`, issues, producer);
  });
  const provenanceSet = producer ? PRODUCED_PROVENANCES : ALL_PROVENANCES;
  validateKnownStrings(input.provenance, provenanceSet, "$.provenance", "VALUE_PROVENANCE", "§5.5.2; §5.10.3", issues);
  validateKnownStrings(input.confidence, CONFIDENCES, "$.confidence", "VALUE_CONFIDENCE", "§5.5.2", issues);
  if (input.evidenceClass !== null) validateKnownStrings(input.evidenceClass, EVIDENCE_CLASSES, "$.evidenceClass", "VALUE_EVIDENCE", "§5.5.2", issues);
  validateKnownStrings(input.externalAttestation, ATTESTATION_VALUES, "$.externalAttestation", "VALUE_ATTESTATION", "§5.5", issues);
  if ((options.layer === "L2" || options.layer === "L4") && input.externalAttestation !== "not_applicable") {
    addIssue(issues, "LAYER_ATTESTATION_APPLICABILITY", "$.externalAttestation", `${options.layer} requires not_applicable.`, "§5.5.2 applicability table");
  }
  if (["ambiguous", "conflict", "unresolved", "unsupported", "out_of_scope"].includes(input.status) && input.confidence !== "none") {
    addIssue(issues, "STATUS_CONFIDENCE_NONE", "$.confidence", `${input.status} requires confidence:none.`, "§7.3.1");
  }
  if (input.status === "fallback" && !["low", "none"].includes(String(input.confidence))) {
    addIssue(issues, "FALLBACK_CONFIDENCE_CAP", "$.confidence", "fallback confidence is capped at low.", "§7.3.1");
  }
  if (input.provenance === "rule_engine" && !["low", "none"].includes(String(input.confidence))) {
    addIssue(issues, "RULE_ENGINE_CONFIDENCE_CAP", "$.confidence", "rule_engine confidence is capped at low.", "§7.3.2");
  }
  if (input.provenance === "inherited" && input.confidence === "high") {
    addIssue(issues, "INHERITED_CONFIDENCE_CAP", "$.confidence", "Inherited confidence is capped at medium.", "§7.3.2; RULE-ENT-9");
  }
  if (hasOwn(input, "scopeDowngrade")) {
    if (input.scopeDowngrade !== "class_applied_to_individual" || input.evidenceClass !== "E6" || !["low", "none"].includes(String(input.confidence))) {
      addIssue(issues, "SCOPE_DOWNGRADE_COUPLING", "$.scopeDowngrade", "scopeDowngrade requires E6 and low/none confidence.", "§7.3.2–3");
    }
  }
  if (!Array.isArray(input.cautions)) {
    addIssue(issues, "VALUE_CAUTIONS", "$.cautions", "cautions must be an array.", "§5.5");
  } else {
    input.cautions.forEach((value, index) => validateKnownStrings(value, CAUTION_CODES, `$.cautions[${index}]`, "CAUTION_CODE", "§5.5.2", issues));
  }
  if (hasOwn(input, "attestation") && input.attestation !== null) validateAttestation(input.attestation, "$.attestation", issues);
  const selectedInherited = nonNull && input.provenance === "inherited";
  if (selectedInherited && !hasOwn(input, "inheritedFrom")) {
    addIssue(issues, "VALUE_INHERITANCE_REQUIRED", "$.inheritedFrom", "Selected inherited value requires inheritedFrom.", "RULE-API-24");
  }
  if (!selectedInherited && hasOwn(input, "inheritedFrom")) {
    addIssue(issues, "VALUE_INHERITANCE_FORBIDDEN", "$.inheritedFrom", "Only a selected inherited value may carry inheritedFrom.", "RULE-API-24");
  }
  if (hasOwn(input, "inheritedFrom")) validateInheritanceShape(input.inheritedFrom, "$.inheritedFrom", issues);
  if (hasOwn(input, "derivedFrom") && options.layer !== "L3E") {
    addIssue(issues, "DERIVED_FROM_LAYER", "$.derivedFrom", "derivedFrom is the L3R-to-L3E route only.", "§5.7.3");
  } else if (hasOwn(input, "derivedFrom")) {
    mergeInto(issues, validateDerivedFromShape(input.derivedFrom), "$.derivedFrom");
  }
  return finish(issues);
}

function isSpan(value: unknown): value is [number, number] {
  return Array.isArray(value)
    && value.length === 2
    && Number.isInteger(value[0])
    && Number.isInteger(value[1])
    && value[0] >= 0
    && value[1] >= value[0];
}

function validateSpan(
  value: unknown,
  path: string,
  issues: ValidationIssue[],
  bounds?: [number, number],
): value is [number, number] {
  if (!isSpan(value)) {
    addIssue(issues, "SPAN", path, "Span must be a non-negative half-open integer pair with start <= end.", "§5.2");
    return false;
  }
  if (bounds !== undefined && (value[0] < bounds[0] || value[1] > bounds[1])) {
    addIssue(issues, "SPAN_BOUNDS", path, "Span is outside its owner/source bounds.", "§5.2; INV-14");
    return false;
  }
  return true;
}

/**
 * CHG-048/050 grouping closure. Each non-empty group is one orthographic word;
 * flatten(grouping) must be exactly the complete ascending local index sequence.
 * Validation rejects malformed input without repair, sorting or defaulting.
 */
export function validateGrouping(
  input: unknown,
  unitsLength: number,
  path = "$.grouping",
): ValidationResult {
  const issues: ValidationIssue[] = [];
  if (!Array.isArray(input)) {
    addIssue(issues, "GROUPING_SHAPE", path, "Grouping must be a non-empty array of non-empty index arrays.", "§5.6; CHG-050");
    return finish(issues);
  }
  if (!Number.isSafeInteger(unitsLength) || unitsLength <= 0) {
    addIssue(issues, "GROUPING_OWNER_LENGTH", path, "Grouping owner must expose a positive safe units length.", "§5.3; §5.6; CHG-050");
    return finish(issues);
  }
  if (input.length === 0) {
    addIssue(issues, "GROUPING_NONEMPTY", path, "Grouping must contain at least one group.", "§5.3; §5.6; CHG-050");
  }
  let flattenedLength = 0;
  for (let groupIndex = 0; groupIndex < input.length; groupIndex += 1) {
    const group: unknown = input[groupIndex];
    const groupPath = `${path}[${groupIndex}]`;
    if (!Array.isArray(group)) {
      addIssue(issues, "GROUPING_GROUP_SHAPE", groupPath, "Each grouping member must be a non-empty index array.", "§5.6; CHG-050");
      continue;
    }
    if (group.length === 0) {
      addIssue(issues, "GROUPING_GROUP_NONEMPTY", groupPath, "Each group must contain at least one local unit index.", "§5.3; §5.6; CHG-050");
    }
    for (let valueIndex = 0; valueIndex < group.length; valueIndex += 1) {
      const value: unknown = group[valueIndex];
      const valuePath = `${groupPath}[${valueIndex}]`;
      if (typeof value !== "number"
          || !Number.isFinite(value)
          || !Number.isSafeInteger(value)
          || value < 0
          || value >= unitsLength) {
        addIssue(
          issues,
          "GROUPING_INDEX_DOMAIN",
          valuePath,
          `Grouping index must be an exact non-negative safe integer less than units.length (${unitsLength}).`,
          "§5.3; §5.6; CHG-048/050",
        );
      }
      if (value !== flattenedLength) {
        addIssue(issues, "GROUPING_PARTITION", valuePath, `Expected local unit index ${flattenedLength} in the complete ascending grouping partition.`, "§5.3; §5.6; CHG-050");
      }
      flattenedLength += 1;
    }
  }
  if (flattenedLength !== unitsLength) {
    addIssue(issues, "GROUPING_PARTITION", path, `Grouping must contain exactly ${unitsLength} local indices in ascending order.`, "§5.3; §5.6; CHG-050");
  }
  return finish(issues);
}

function validateEnglishUnit(
  input: unknown,
  memory: boolean,
  path: string,
  issues: ValidationIssue[],
): "romanised" | "literal" | "translated" | null {
  if (!isRecord(input)) {
    addIssue(issues, "ENGLISH_UNIT_OBJECT", path, "English assembly unit must be an object.", "§5.7");
    return null;
  }
  if (!memory) {
    if (typeof input.id !== "string" || input.id.length === 0) addIssue(issues, "ENGLISH_UNIT_ID", `${path}.id`, "Analysis unit requires an id.", "§5.7");
    validateSpan(input.span, `${path}.span`, issues);
  } else {
    for (const forbidden of ["id", "span"] as const) {
      if (hasOwn(input, forbidden)) addIssue(issues, "MEMORY_CLOSURE", `${path}.${forbidden}`, `${forbidden} is forbidden in memory units.`, "RULE-API-21");
    }
  }
  if (typeof input.kind !== "string" || !["romanised", "literal", "translated"].includes(input.kind)) {
    addIssue(issues, "ENGLISH_UNIT_KIND", `${path}.kind`, "Unknown EnglishAssemblyUnit kind.", "§5.7");
    return null;
  }
  if (typeof input.text !== "string") {
    addIssue(issues, "ENGLISH_UNIT_TEXT", `${path}.text`, "English assembly unit requires string text.", "§5.7; §5.10.2");
  }
  validateKnownStrings(input.provenance, PRODUCED_PROVENANCES, `${path}.provenance`, "ENGLISH_UNIT_PROVENANCE", "§5.7; §5.10.3", issues);
  if (input.evidenceClass !== null) {
    validateKnownStrings(input.evidenceClass, EVIDENCE_CLASSES, `${path}.evidenceClass`, "ENGLISH_UNIT_EVIDENCE", "§5.7", issues);
  }
  validateKnownStrings(input.externalAttestation, ATTESTATION_VALUES, `${path}.externalAttestation`, "ENGLISH_UNIT_ATTESTATION", "§5.7", issues);
  if (input.kind === "romanised") {
    if (typeof input.syllable !== "string") addIssue(issues, "ROMANISED_UNIT_SYLLABLE", `${path}.syllable`, "Romanised unit requires syllable.", "§5.7");
    if (typeof input.generated !== "boolean") addIssue(issues, "ROMANISED_UNIT_GENERATED", `${path}.generated`, "Romanised unit requires generated boolean.", "§5.7");
    if (input.role === "western_given") addIssue(issues, "WESTERN_GIVEN_LITERAL", `${path}.role`, "western_given is necessarily literal.", "§5.7 assembled legality");
    return "romanised";
  }
  for (const forbidden of ["syllable", "generated", "sibilantClass"] as const) {
    if (hasOwn(input, forbidden)) {
      addIssue(issues, "NON_ROMANISED_CANTONESE_METADATA", `${path}.${forbidden}`, `${forbidden} is forbidden on ${input.kind} units.`, "§5.7");
    }
  }
  if (input.kind === "translated" && input.role === "western_given") {
    addIssue(issues, "WESTERN_GIVEN_LITERAL", `${path}.role`, "western_given is necessarily literal.", "§5.7 assembled legality");
  }
  return input.kind as "literal" | "translated";
}

/** EnglishForm or MemoryEnglishForm cross-array legality. */
export function validateEnglishForm(input: unknown, options: { memory?: boolean } = {}): ValidationResult {
  const issues: ValidationIssue[] = [];
  const memory = options.memory ?? false;
  if (!isRecord(input)) {
    addIssue(issues, "ENGLISH_FORM_OBJECT", "$", "English form must be an object.", "§5.7; §5.10.2");
    return finish(issues);
  }
  if (input.assembled === false) {
    if (typeof input.text !== "string") addIssue(issues, "VERBATIM_TEXT", "$.text", "Verbatim form requires exact text.", "RULE-API-10");
    validateKnownStrings(input.formKind, FORM_KINDS, "$.formKind", "FORM_KIND", "§5.5.2", issues);
    for (const forbidden of ["person", "units", "grouping", "styleApplicable", "styleVariants"] as const) {
      if (hasOwn(input, forbidden)) addIssue(issues, "VERBATIM_FORBIDDEN_FIELD", `$.${forbidden}`, `${forbidden} is forbidden on verbatim forms.`, "RULE-API-10");
    }
    return finish(issues);
  }
  if (input.assembled !== true) {
    addIssue(issues, "ASSEMBLED_DISCRIMINANT", "$.assembled", "assembled must be a boolean discriminant.", "§5.7");
    return finish(issues);
  }
  if (hasOwn(input, "text")) addIssue(issues, "ASSEMBLED_TEXT_FORBIDDEN", "$.text", "Assembled form has no canonical text.", "RULE-API-10");
  if (hasOwn(input, "styleVariants")) addIssue(issues, "STYLE_VARIANTS_FORBIDDEN", "$.styleVariants", "Core assembled forms have no styleVariants.", "§5.6; §5.11");
  if (input.formKind !== "romanisation" && input.formKind !== "hybrid") {
    addIssue(issues, "ASSEMBLED_FORM_KIND", "$.formKind", "Only romanisation or hybrid may be assembled.", "§5.7 assembled legality");
  }
  if (!Array.isArray(input.units) || input.units.length === 0) {
    addIssue(issues, "ASSEMBLED_UNITS", "$.units", "Assembled English form requires at least one unit.", "§5.7 assembled legality");
    return finish(issues);
  }
  const units: unknown[] = input.units;
  if (!Array.isArray(input.grouping)) {
    addIssue(issues, "ASSEMBLED_GROUPING", "$.grouping", "Assembled form requires grouping.", "§5.7");
  } else {
    mergeInto(issues, validateGrouping(input.grouping, units.length), "");
  }
  const kinds = Array.from(units, (unit, index) => validateEnglishUnit(unit, memory, `$.units[${index}]`, issues));
  const romanisedCount = kinds.filter((kind) => kind === "romanised").length;
  const nonRomanisedCount = kinds.filter((kind) => kind === "literal" || kind === "translated").length;
  if (input.formKind === "romanisation" && romanisedCount !== units.length) {
    addIssue(issues, "ROMANISATION_UNIT_MIX", "$.units", "romanisation assembly contains only romanised units.", "§5.7 assembled legality");
  }
  if (input.formKind === "hybrid" && (romanisedCount === 0 || nonRomanisedCount === 0)) {
    addIssue(issues, "HYBRID_UNIT_MIX", "$.units", "hybrid requires romanised and literal/translated components.", "§5.7 assembled legality");
  }
  if (input.person !== true && input.person !== false) addIssue(issues, "PERSON_DISCRIMINANT", "$.person", "Assembled English form requires person boolean.", "§5.7");
  const stylePresent = hasOwn(input, "styleApplicable");
  if (input.person === false && stylePresent) {
    addIssue(issues, "NON_PERSON_STYLE", "$.styleApplicable", "Non-person form forbids styleApplicable.", "§5.7");
  }
  if (stylePresent) {
    if (!isRecord(input.styleApplicable) || input.styleApplicable.scope !== "givenName") {
      addIssue(issues, "STYLE_SCOPE", "$.styleApplicable", "styleApplicable scope must be givenName.", "§5.7");
    } else {
      const key = memory ? "unitIndices" : "unitIds";
      const forbiddenKey = memory ? "unitIds" : "unitIndices";
      if (hasOwn(input.styleApplicable, forbiddenKey)) {
        addIssue(
          issues,
          memory ? "MEMORY_STYLE_ANALYSIS_ID" : "ANALYSIS_STYLE_MEMORY_INDEX",
          `$.styleApplicable.${forbiddenKey}`,
          memory
            ? "Memory style references use local unit indices, never Analysis unit ids."
            : "Analysis style references use unit ids, never memory-local indices.",
          "§5.7; §5.10.2; RULE-API-21",
        );
      }
      const refs = input.styleApplicable[key];
      if (!Array.isArray(refs) || refs.length === 0) {
        addIssue(issues, "STYLE_REFS_NONEMPTY", `$.styleApplicable.${key}`, "At least one style reference is required.", "§5.7");
      } else {
        const seen = new Set<unknown>();
        let previousIndex = -1;
        for (let refIndex = 0; refIndex < refs.length; refIndex += 1) {
          const reference: unknown = refs[refIndex];
          if (seen.has(reference)) addIssue(issues, "STYLE_REF_UNIQUE", `$.styleApplicable.${key}[${refIndex}]`, "Style references must be unique.", "§5.7");
          seen.add(reference);
          let unitIndex = -1;
          if (memory) {
            if (typeof reference !== "number"
                || !Number.isFinite(reference)
                || !Number.isSafeInteger(reference)
                || reference < 0
                || reference >= units.length) {
              addIssue(issues, "STYLE_REF_DOMAIN", `$.styleApplicable.${key}[${refIndex}]`, "Memory style index must be an exact non-negative safe local integer less than units.length.", "§5.10.2; CHG-048/050");
              continue;
            }
            unitIndex = reference;
          } else {
            if (typeof reference !== "string") {
              addIssue(issues, "STYLE_REF_TYPE", `$.styleApplicable.${key}[${refIndex}]`, "Style unit id must be a string.", "§5.7");
              continue;
            }
            const matches = units
              .map((unit, index) => ({ unit, index }))
              .filter(({ unit }) => isRecord(unit) && unit.id === reference);
            if (matches.length !== 1) {
              addIssue(issues, "STYLE_REF_RESOLUTION", `$.styleApplicable.${key}[${refIndex}]`, "Style id must resolve exactly once within units.", "§5.7");
              continue;
            }
            unitIndex = matches[0]?.index ?? -1;
          }
          if (unitIndex <= previousIndex) addIssue(issues, "STYLE_REF_ORDER", `$.styleApplicable.${key}[${refIndex}]`, "Style refs must be strictly increasing by resolved unit position.", "§5.7; §5.10.2; CHG-050");
          previousIndex = unitIndex;
          const unit = units[unitIndex];
          if (!isRecord(unit) || unit.kind !== "romanised" || unit.role !== "given" || unit.generated !== true) {
            addIssue(issues, "STYLE_REF_LICENSE", `$.styleApplicable.${key}[${refIndex}]`, "Style refs may target only generated romanised given-name units.", "§5.7; RULE-API-6");
          }
        }
      }
    }
  }
  return finish(issues);
}

/** Romanisation discriminant, unit structure and exact ordered grouping partition. */
export function validateRomanisation(
  input: unknown,
  ownerSpan?: [number, number],
): ValidationResult {
  const issues: ValidationIssue[] = [];
  if (!isRecord(input) || input.formKind !== "romanisation") {
    addIssue(issues, "ROMANISATION_SHAPE", "$", "Romanisation requires formKind romanisation.", "§5.6");
    return finish(issues);
  }
  if (input.assembled === false) {
    if (typeof input.text !== "string") {
      addIssue(issues, "ROMANISATION_VERBATIM_TEXT", "$.text", "Verbatim Romanisation requires exact text.", "RULE-API-10");
    }
    for (const forbidden of ["units", "grouping", "styleVariants"] as const) {
      if (hasOwn(input, forbidden)) {
        addIssue(issues, "ROMANISATION_VERBATIM_FIELD", `$.${forbidden}`, `${forbidden} is forbidden on verbatim Romanisation.`, "RULE-API-10");
      }
    }
    return finish(issues);
  }
  if (input.assembled !== true) {
    addIssue(issues, "ROMANISATION_DISCRIMINANT", "$.assembled", "assembled must be a boolean discriminant.", "§5.6");
    return finish(issues);
  }
  if (!Array.isArray(input.units) || !Array.isArray(input.grouping)) {
    addIssue(issues, "ROMANISATION_ASSEMBLED_FIELDS", "$", "Assembled Romanisation requires units and grouping arrays.", "§5.6");
    return finish(issues);
  }
  if (input.units.length === 0) {
    addIssue(issues, "ROMANISATION_UNITS_NONEMPTY", "$.units", "Assembled Romanisation requires at least one unit.", "§5.3; §5.6; CHG-050");
  }
  for (const forbidden of ["text", "styleVariants"] as const) {
    if (hasOwn(input, forbidden)) {
      addIssue(issues, "ROMANISATION_ASSEMBLED_FIELD", `$.${forbidden}`, `${forbidden} is forbidden on assembled Romanisation.`, "RULE-API-10");
    }
  }
  for (let index = 0; index < input.units.length; index += 1) {
    const unit: unknown = input.units[index];
    const path = `$.units[${index}]`;
    if (!isRecord(unit)) {
      addIssue(issues, "ROMANISATION_UNIT_OBJECT", path, "RomanisationUnit must be an object.", "§5.6");
      continue;
    }
    if (typeof unit.id !== "string" || unit.id.length === 0) {
      addIssue(issues, "ROMANISATION_UNIT_ID", `${path}.id`, "RomanisationUnit requires a non-empty Analysis-local id.", "§5.6; RULE-API-13");
    }
    validateSpan(unit.span, `${path}.span`, issues, ownerSpan);
    for (const field of ["text", "syllable"] as const) {
      if (typeof unit[field] !== "string") {
        addIssue(issues, "ROMANISATION_UNIT_FIELD", `${path}.${field}`, `${field} must be a string.`, "§5.6");
      }
    }
    validateKnownStrings(unit.provenance, PRODUCED_PROVENANCES, `${path}.provenance`, "ROMANISATION_UNIT_PROVENANCE", "§5.6; §5.10.3", issues);
    validateKnownStrings(unit.evidenceClass, EVIDENCE_CLASSES, `${path}.evidenceClass`, "ROMANISATION_UNIT_EVIDENCE", "§5.6", issues);
    validateKnownStrings(unit.externalAttestation, ATTESTATION_VALUES, `${path}.externalAttestation`, "ROMANISATION_UNIT_ATTESTATION", "§5.6", issues);
  }
  mergeInto(issues, validateGrouping(input.grouping, input.units.length), "");
  return finish(issues);
}

/** GroupedAlignment closure for one Reading and optional owner span. */
export function validateReadingAlignment(input: unknown, ownerSpan?: [number, number], source?: string): ValidationResult {
  const issues: ValidationIssue[] = [];
  if (!isRecord(input) || !Array.isArray(input.syllables) || !Array.isArray(input.alignmentGroups)) {
    addIssue(issues, "READING_SHAPE", "$", "Reading requires syllables and alignmentGroups arrays.", "§5.6");
    return finish(issues);
  }
  const syllables: unknown[] = input.syllables;
  const alignmentGroups: unknown[] = input.alignmentGroups;
  const membership = new Map<number, number>();
  const alignedSpans: Array<{ span: [number, number]; path: string }> = [];
  const recordSpan = (span: [number, number], path: string): void => {
    alignedSpans.push({ span, path });
    if (source !== undefined && (isUnsafeTextBoundary(source, span[0]) || isUnsafeTextBoundary(source, span[1]))) {
      addIssue(issues, "READING_UNSAFE_BOUNDARY", path, "Reading alignment must not split a protected UTF-16/text sequence.", "INV-4; T-JP-041; G3");
    }
  };
  let previousGroupEnd = -1;
  Array.from(alignmentGroups).forEach((group, groupIndex) => {
    const path = `$.alignmentGroups[${groupIndex}]`;
    if (!isRecord(group)) {
      addIssue(issues, "GROUP_OBJECT", path, "GroupedAlignment must be an object.", "§5.6");
      return;
    }
    if (!validateSpan(group.span, `${path}.span`, issues, ownerSpan)) return;
    recordSpan(group.span, `${path}.span`);
    if (group.span[0] < previousGroupEnd) addIssue(issues, "GROUP_ORDER", `${path}.span`, "Alignment groups must be ordered and non-overlapping.", "§5.6 closure rule");
    previousGroupEnd = group.span[1];
    if (!Array.isArray(group.syllableIndices) || group.syllableIndices.length < 2) {
      addIssue(issues, "GROUP_SIZE", `${path}.syllableIndices`, "GroupedAlignment requires at least two indices.", "§5.6");
      return;
    }
    let previous = -1;
    Array.from(group.syllableIndices).forEach((raw, index) => {
      const indexPath = `${path}.syllableIndices[${index}]`;
      if (!Number.isInteger(raw) || Number(raw) < 0 || Number(raw) >= syllables.length) {
        addIssue(issues, "GROUP_INDEX_RANGE", indexPath, "Grouped syllable index must be an in-range integer.", "§5.6 closure rule");
        return;
      }
      const syllableIndex = Number(raw);
      if (syllableIndex <= previous) addIssue(issues, "GROUP_INDEX_ORDER", indexPath, "Group indices must be strictly increasing and unique.", "§5.6 closure rule");
      previous = syllableIndex;
      membership.set(syllableIndex, (membership.get(syllableIndex) ?? 0) + 1);
      const syllable = syllables[syllableIndex];
      if (!isRecord(syllable) || syllable.align !== "grouped") addIssue(issues, "GROUP_MEMBER_ALIGN", indexPath, "Only grouped syllables may be group members.", "§5.6 closure rule");
    });
  });
  let previousSyllableStart = -1;
  Array.from(syllables).forEach((syllable, index) => {
    const path = `$.syllables[${index}]`;
    if (!isRecord(syllable)) {
      addIssue(issues, "SYLLABLE_OBJECT", path, "Syllable must be an object.", "§5.6");
      return;
    }
    const count = membership.get(index) ?? 0;
    if (syllable.align !== "exact" && syllable.align !== "spread" && syllable.align !== "grouped") {
      addIssue(issues, "SYLLABLE_ALIGN", `${path}.align`, "Syllable align must be exact, spread or grouped.", "§5.6");
      return;
    }
    if (syllable.align === "grouped") {
      if (syllable.span !== null) addIssue(issues, "GROUPED_SPAN_NULL", `${path}.span`, "Grouped syllable has null individual span.", "§5.6");
      if (count !== 1) addIssue(issues, "GROUP_MEMBERSHIP", path, "Every grouped syllable belongs to exactly one group.", "§5.6 closure rule");
    } else {
      if (validateSpan(syllable.span, `${path}.span`, issues, ownerSpan)) {
        if (syllable.span[0] < previousSyllableStart) {
          addIssue(issues, "SYLLABLE_SPAN_ORDER", `${path}.span`, "Individual syllable spans must follow source order.", "§3.2.1; INV-14");
        }
        previousSyllableStart = syllable.span[0];
        recordSpan(syllable.span, `${path}.span`);
      }
      if (count !== 0) addIssue(issues, "NON_GROUP_MEMBER", path, "Non-grouped syllable must not appear in a group.", "§5.6 closure rule");
    }
  });
  // Check the union: separate ordered lists can still overlap each other.
  alignedSpans.sort((left, right) => left.span[0] - right.span[0] || left.span[1] - right.span[1]);
  let furthestEnd = -1;
  for (const { span, path } of alignedSpans) {
    // The shared Span domain allows empty half-open intervals; they occupy no text.
    if (span[0] === span[1]) continue;
    if (span[0] < furthestEnd) {
      addIssue(issues, "READING_SPAN_OVERLAP", path, "Individual and grouped alignment spans must not overlap.", "§3.2.1; INV-14");
    }
    furthestEnd = Math.max(furthestEnd, span[1]);
  }
  return finish(issues);
}

function storeAttestationApplicable(entry: Record<string, unknown>): boolean {
  return entry.store === "hk_romanisation"
    || (entry.store === "translation" && entry.entryScope === "entity");
}

/** §5.9/.1 persisted StoreEntry legality, preserving quarantined invalid entries. */
export function validateStoreEntryEvidence(input: unknown): ValidationResult {
  const issues: ValidationIssue[] = [];
  if (!isRecord(input)) {
    addIssue(issues, "STORE_ENTRY_OBJECT", "$", "StoreEntry must be an object.", "§5.9");
    return finish(issues);
  }
  if (typeof input.caseSensitive !== "boolean") {
    addIssue(issues, "STORE_CASE_REQUIRED", "$.caseSensitive", "Persisted StoreEntry requires caseSensitive.", "RULE-API-25");
  }
  validateKnownStrings(input.evidenceClass, STORE_EVIDENCE_CLASSES, "$.evidenceClass", "STORE_EVIDENCE_DOMAIN", "§5.5.2; §5.9.1", issues);
  if (hasOwn(input, "units") || hasOwn(input, "grouping") || hasOwn(input, "assembled")) {
    addIssue(issues, "STORE_NO_ASSEMBLY", "$", "StoreEntry never stores assembly structure.", "RULE-API-25");
  }
  if (!isRecord(input.validation) || typeof input.validation.ok !== "boolean" || !Array.isArray(input.validation.errors)) {
    addIssue(issues, "STORE_VALIDATION_SHAPE", "$.validation", "StoreEntry requires validation state.", "§5.9");
    return finish(issues);
  }
  if (input.validation.ok === false) {
    if (input.enabled !== false) addIssue(issues, "INVALID_STORE_DISABLED", "$.enabled", "Invalid StoreEntry must be disabled.", "§5.9.1");
    if (input.validation.errors.length === 0) addIssue(issues, "INVALID_STORE_ERRORS", "$.validation.errors", "Invalid StoreEntry requires errors.", "§5.9.1");
    return finish(issues);
  }
  if (input.validation.errors.length !== 0) addIssue(issues, "VALID_STORE_ERRORS_EMPTY", "$.validation.errors", "Valid StoreEntry errors must be empty.", "§5.9");
  const translationEntity = input.store === "translation" && input.entryScope === "entity";
  if (translationEntity) {
    validateKnownStrings(input.formKind, FORM_KINDS, "$.formKind", "STORE_FORM_KIND_REQUIRED", "RULE-API-25", issues);
  } else if (hasOwn(input, "formKind")) {
    addIssue(issues, "STORE_FORM_KIND_FORBIDDEN", "$.formKind", "formKind is valid only for translation/entity.", "RULE-API-25");
  }
  if ((input.entryScope === "lexical" || input.entryScope === "phrase") && hasOwn(input, "entityTypeHint")) {
    addIssue(issues, "STORE_ENTITY_HINT_SCOPE", "$.entityTypeHint", "entityTypeHint is entity-scope only.", "§5.9 StoreScopeFields");
  }
  const expectedExternal = storeAttestationApplicable(input)
    ? (["E1a", "E1b"].includes(String(input.evidenceClass)) ? "not_attested" : "attested")
    : "not_applicable";
  if (input.externalAttestation !== expectedExternal) {
    addIssue(issues, "STORE_ATTESTATION_APPLICABILITY", "$.externalAttestation", `Expected ${expectedExternal} for this store/scope/evidence state.`, "RULE-API-12");
  }
  if (input.evidenceClass === "E1a" || input.evidenceClass === "E1b") {
    if (!hasOwn(input, "attestation") || input.attestation !== null) {
      addIssue(issues, "STORE_ATTESTATION_NULL", "$.attestation", "E1a/E1b require explicit null attestation.", "RULE-API-12");
    }
  } else if (input.evidenceClass === "E1c") {
    if (hasOwn(input, "attestation") && input.attestation !== null) validateAttestation(input.attestation, "$.attestation", issues);
  } else if (input.evidenceClass === "E2") {
    if (!hasOwn(input, "attestation") || input.attestation === null) {
      addIssue(issues, "STORE_E2_ATTESTATION", "$.attestation", "E2 requires documentary Attestation independently of layer applicability.", "RULE-API-12");
    } else {
      validateAttestation(input.attestation, "$.attestation", issues);
    }
  }
  return finish(issues);
}

/** Contract fixture for RULE-API-25's exact stored-value mapping. */
export function validateStoredEnglishFormMapping(entry: unknown, form: unknown): ValidationResult {
  const issues: ValidationIssue[] = [];
  if (!isRecord(entry) || entry.store !== "translation" || entry.entryScope !== "entity") {
    addIssue(issues, "STORE_MAPPING_INPUT", "$", "Mapping applies only to translation/entity StoreEntry.", "RULE-API-25");
    return finish(issues);
  }
  if (!isRecord(form)
      || form.assembled !== false
      || form.text !== entry.value
      || form.formKind !== entry.formKind
      || hasOwn(form, "units")
      || hasOwn(form, "grouping")) {
    addIssue(issues, "STORE_MAPPING_VERBATIM", "$.form", "Stored value must resolve to exact VerbatimEnglishForm with the stored FormKind.", "RULE-API-25");
  }
  mergeInto(issues, validateEnglishForm(form), "$.form");
  return finish(issues);
}

/** Default-only normalisation required by §5.9; no matching or persistence is implemented. */
export function materialiseStoreDraftDefaults(input: unknown): Record<string, unknown> | null {
  if (!isRecord(input) || typeof input.key !== "string" || typeof input.value !== "string") return null;
  return {
    ...input,
    entryScope: input.entryScope ?? "lexical",
    caseSensitive: input.caseSensitive ?? false,
    match: input.match ?? "exact",
    enabled: input.enabled ?? true,
    evidenceClass: input.evidenceClass ?? "E1a",
  };
}

/** Unambiguous Basic-Latin witness for RULE-API-25; wider Unicode folding is residue. */
export function matchesBasicLatinStoreKey(key: string, candidate: string, caseSensitive: boolean): boolean {
  const asciiFold = (value: string): string => value.replace(/[A-Z]/gu, (letter) => letter.toLowerCase());
  return caseSensitive ? key === candidate : asciiFold(key) === asciiFold(candidate);
}

function compareUtf16CodeUnits(left: string, right: string): number {
  const sharedLength = Math.min(left.length, right.length);
  for (let index = 0; index < sharedLength; index += 1) {
    const difference = left.charCodeAt(index) - right.charCodeAt(index);
    if (difference !== 0) return difference;
  }
  return left.length - right.length;
}

/** §5.15 exact-set normalisation only; this does not encode or hash the result. */
export function normaliseDocumentTags(input: unknown = undefined): string[] | null {
  if (input === undefined) return [];
  if (!Array.isArray(input)
      || Object.getOwnPropertyNames(input).some((key) => key !== "length"
        && (!/^(?:0|[1-9][0-9]*)$/u.test(key) || Number(key) >= input.length))
      || Object.getOwnPropertySymbols(input).length !== 0) return null;
  const tags: string[] = [];
  for (let index = 0; index < input.length; index += 1) {
    const descriptor = Object.getOwnPropertyDescriptor(input, String(index));
    if (descriptor === undefined
        || descriptor.enumerable !== true
        || hasOwn(descriptor as unknown as Record<string, unknown>, "get")
        || hasOwn(descriptor as unknown as Record<string, unknown>, "set")
        || typeof descriptor.value !== "string") return null;
    tags.push(descriptor.value);
  }
  return [...new Set(tags)].sort(compareUtf16CodeUnits);
}

/** Materialise the ProcessOptions value that would later enter the canonical preimage. */
export function materialiseProcessOptionsPreimage(input: unknown = undefined): Record<string, unknown> | null {
  const options = input === undefined ? {} : input;
  if (!isRecord(options)) return null;
  const documentTags = normaliseDocumentTags(hasOwn(options, "documentTags") ? options.documentTags : undefined);
  if (documentTags === null) return null;
  return { ...options, documentTags };
}

/** Evaluate only the document-tag part of Store contextual matching. */
export function matchesDocumentTagCondition(context: unknown, processOptions: unknown = undefined): boolean {
  if (!isRecord(context)) return false;
  if (!hasOwn(context, "documentTag")) return true;
  if (typeof context.documentTag !== "string") return false;
  const options = processOptions === undefined ? {} : processOptions;
  if (!isRecord(options)) return false;
  const documentTags = normaliseDocumentTags(hasOwn(options, "documentTags") ? options.documentTags : undefined);
  return documentTags !== null && documentTags.includes(context.documentTag);
}

/** Preview/apply row legality for E3–E7 and writesApplied semantics. */
export function validateStoreImportEnvelope(input: unknown): ValidationResult {
  const issues: ValidationIssue[] = [];
  if (!isRecord(input) || !Array.isArray(input.rows)) {
    addIssue(issues, "IMPORT_OBJECT", "$", "ImportPreview/ImportResult requires rows.", "§5.9");
    return finish(issues);
  }
  if (input.mode === "apply") {
    mergeInto(issues, validateUserDataVersion(input.userDataVersion, "$.userDataVersion"));
  } else if (hasOwn(input, "userDataVersion")) {
    addIssue(issues, "PREVIEW_VERSION_FIELD", "$.userDataVersion", "ImportPreview has no userDataVersion field.", "§5.9; CHG-047");
  }
  if (input.mode === "preview" && input.writesApplied !== false) {
    addIssue(issues, "PREVIEW_NO_WRITES", "$.writesApplied", "Preview never writes.", "§5.9.1");
  }
  let legalRows = 0;
  let legalAdds = 0;
  Array.from(input.rows).forEach((row, index) => {
    const path = `$.rows[${index}]`;
    if (!isRecord(row)) {
      addIssue(issues, "IMPORT_ROW", path, "Import row must be an object.", "§5.9");
      return;
    }
    const evidence = isRecord(row.input) ? row.input.evidenceClass : undefined;
    if (typeof evidence === "string" && EVIDENCE_CLASSES.has(evidence) && !STORE_EVIDENCE_CLASSES.has(evidence)) {
      if (row.action !== "invalid" || hasOwn(row, "entry") || !Array.isArray(row.errors) || row.errors.length === 0) {
        addIssue(issues, "IMPORT_E3_E7_INVALID", path, "E3–E7 row must be invalid, entry-absent and error-bearing.", "RULE-API-12; T-API-034");
      }
    }
    if ((row.action === "add" || row.action === "update")
        && isRecord(row.entry)
        && validateStoreEntryEvidence(row.entry).ok
        && Array.isArray(row.errors)
        && row.errors.length === 0) {
      legalRows += 1;
      if (row.action === "add") legalAdds += 1;
    }
  });
  if (input.mode === "apply"
      && (typeof input.writesApplied !== "boolean"
        || (input.writesApplied && legalRows === 0)
        || (!input.writesApplied && legalAdds > 0))) {
    // A legal update row is not proof of a write: a same-ID semantic no-op
    // legitimately reports `action: "update"`. Adds necessarily write, while
    // update-only envelopes need prior state or a write-plan witness to tell
    // a real update from a no-op.
    addIssue(issues, "APPLY_WRITES_APPLIED", "$.writesApplied", "writesApplied must be true for a legal add; true requires at least one legal add/update row; update-only may be a no-op.", "§5.9.1");
  }
  return finish(issues);
}

function validateMemoryRomanisation(input: unknown, path: string, issues: ValidationIssue[]): void {
  if (!isRecord(input) || input.formKind !== "romanisation") {
    addIssue(issues, "MEMORY_ROMANISATION_SHAPE", path, "MemoryRomanisation requires formKind romanisation.", "§5.10.2");
    return;
  }
  if (input.assembled === false) {
    if (typeof input.text !== "string") {
      addIssue(issues, "MEMORY_VERBATIM_TEXT", `${path}.text`, "Verbatim memory romanisation requires text.", "§5.10.2");
    }
    for (const forbidden of ["units", "grouping"] as const) {
      if (hasOwn(input, forbidden)) {
        addIssue(issues, "MEMORY_VERBATIM_FIELD", `${path}.${forbidden}`, `${forbidden} is forbidden on verbatim memory romanisation.`, "§5.10.2");
      }
    }
    return;
  }
  if (input.assembled !== true || !Array.isArray(input.units) || !Array.isArray(input.grouping)) {
    addIssue(issues, "MEMORY_ASSEMBLED_ROMANISATION", path, "Assembled memory romanisation requires units and grouping.", "§5.10.2");
    return;
  }
  if (input.units.length === 0) {
    addIssue(issues, "MEMORY_UNITS_NONEMPTY", `${path}.units`, "Assembled memory romanisation requires at least one unit.", "§5.3; §5.10.2; CHG-050");
  }
  if (hasOwn(input, "text")) {
    addIssue(issues, "MEMORY_ASSEMBLED_TEXT", `${path}.text`, "Assembled memory romanisation has no canonical text.", "§5.10.2");
  }
  for (let index = 0; index < input.units.length; index += 1) {
    const unit: unknown = input.units[index];
    const unitPath = `${path}.units[${index}]`;
    if (!isRecord(unit)) {
      addIssue(issues, "MEMORY_UNIT_OBJECT", unitPath, "MemoryUnit must be an object.", "§5.10.2");
      continue;
    }
    for (const forbidden of ["id", "span", "align"] as const) {
      if (hasOwn(unit, forbidden)) {
        addIssue(issues, "MEMORY_CLOSURE", `${unitPath}.${forbidden}`, `${forbidden} is forbidden in MemoryUnit.`, "RULE-API-21");
      }
    }
    validateKnownStrings(unit.provenance, PRODUCED_PROVENANCES, `${unitPath}.provenance`, "MEMORY_UNIT_PROVENANCE", "§5.10.2–3", issues);
    validateKnownStrings(unit.evidenceClass, EVIDENCE_CLASSES, `${unitPath}.evidenceClass`, "MEMORY_UNIT_EVIDENCE", "§5.10.2", issues);
    validateKnownStrings(unit.externalAttestation, ATTESTATION_VALUES, `${unitPath}.externalAttestation`, "MEMORY_UNIT_ATTESTATION", "§5.10.2", issues);
  }
  mergeInto(issues, validateGrouping(input.grouping, input.units.length, `${path}.grouping`), "");
}

/** MemoryReading is span-free but its tone remains a hash-reachable semantic integer. */
function validateMemoryReading(input: unknown, path: string, issues: ValidationIssue[]): void {
  if (!isRecord(input)) {
    addIssue(issues, "MEMORY_READING_OBJECT", path, "MemoryReading must be an object.", "§5.10.2; CHG-048");
    return;
  }
  if (typeof input.jyutping !== "string") {
    addIssue(issues, "MEMORY_READING_FIELD", `${path}.jyutping`, "MemoryReading.jyutping must be a string.", "§5.10.2");
  }
  if (!Array.isArray(input.syllables)) {
    addIssue(issues, "MEMORY_READING_SYLLABLES", `${path}.syllables`, "MemoryReading requires a syllables array.", "§5.10.2");
    return;
  }
  input.syllables.forEach((syllable, index) => {
    const syllablePath = `${path}.syllables[${index}]`;
    if (!isRecord(syllable)) {
      addIssue(issues, "MEMORY_SYLLABLE_OBJECT", syllablePath, "Memory syllable must be an object.", "§5.10.2");
      return;
    }
    for (const field of ["jyutping", "initial", "final"] as const) {
      if (typeof syllable[field] !== "string") {
        addIssue(issues, "MEMORY_SYLLABLE_FIELD", `${syllablePath}.${field}`, `${field} must be a string.`, "§5.10.2");
      }
    }
    if (typeof syllable.tone !== "number"
        || !Number.isSafeInteger(syllable.tone)
        || syllable.tone < 1
        || syllable.tone > 6) {
      addIssue(issues, "MEMORY_TONE_DOMAIN", `${syllablePath}.tone`, "MemoryReading tone must be semantic integer 1..6.", "§5.10.2; §5.15.2; CHG-048");
    }
    if (typeof syllable.syllabic !== "boolean") {
      addIssue(issues, "MEMORY_SYLLABLE_FIELD", `${syllablePath}.syllabic`, "syllabic must be boolean.", "§5.10.2");
    }
    for (const forbidden of ["span", "align"] as const) {
      if (hasOwn(syllable, forbidden)) {
        addIssue(issues, "MEMORY_READING_CLOSURE", `${syllablePath}.${forbidden}`, `${forbidden} is forbidden in MemoryReading.`, "RULE-API-21");
      }
    }
  });
  for (const forbidden of ["id", "span", "align", "alignmentGroups"] as const) {
    if (hasOwn(input, forbidden)) {
      addIssue(issues, "MEMORY_READING_CLOSURE", `${path}.${forbidden}`, `${forbidden} is forbidden in MemoryReading.`, "RULE-API-21");
    }
  }
}

function validateMemoryChannel(input: unknown, channel: "reading" | "romanisation" | "englishForm", path: string, issues: ValidationIssue[]): void {
  if (!isRecord(input)) {
    addIssue(issues, "MEMORY_CHANNEL", path, "Memory channel must be an object.", "§5.10.2");
    return;
  }
  if (input.value === null || input.value === undefined) addIssue(issues, "MEMORY_VALUE_NON_NULL", `${path}.value`, "Present memory channel requires a selected non-null value.", "RULE-API-22");
  if (input.status !== "resolved" && input.status !== "fallback") addIssue(issues, "MEMORY_STATUS", `${path}.status`, "Memory status is resolved or fallback only.", "RULE-API-22");
  validateKnownStrings(input.provenance, PRODUCED_PROVENANCES, `${path}.provenance`, "MEMORY_PROVENANCE", "§5.10.2–3", issues);
  validateKnownStrings(input.confidence, CONFIDENCES, `${path}.confidence`, "MEMORY_CONFIDENCE", "§5.10.2", issues);
  if (input.evidenceClass !== null) {
    validateKnownStrings(input.evidenceClass, EVIDENCE_CLASSES, `${path}.evidenceClass`, "MEMORY_EVIDENCE", "§5.10.2", issues);
  }
  validateKnownStrings(input.externalAttestation, ATTESTATION_VALUES, `${path}.externalAttestation`, "MEMORY_ATTESTATION", "§5.10.2", issues);
  if (input.status === "fallback" && !["low", "none"].includes(String(input.confidence))) {
    addIssue(issues, "MEMORY_FALLBACK_CONFIDENCE", `${path}.confidence`, "Fallback memory confidence is capped at low.", "§7.3.1");
  }
  if (input.provenance === "rule_engine" && !["low", "none"].includes(String(input.confidence))) {
    addIssue(issues, "MEMORY_RULE_ENGINE_CONFIDENCE", `${path}.confidence`, "Memory rule_engine confidence remains capped at low.", "§5.10.2; §7.3.2; INV-5");
  }
  if (input.provenance === "inherited" && input.confidence === "high") {
    addIssue(issues, "MEMORY_INHERITED_CONFIDENCE", `${path}.confidence`, "Memory inherited confidence remains capped at medium.", "§5.10.2; §7.3.2; RULE-ENT-9");
  }
  if (!Array.isArray(input.cautions)) {
    addIssue(issues, "MEMORY_CAUTIONS", `${path}.cautions`, "Memory channel cautions must be an array.", "§5.10.2");
  } else {
    input.cautions.forEach((value, index) => {
      validateKnownStrings(value, CAUTION_CODES, `${path}.cautions[${index}]`, "CAUTION_CODE", "§5.5.2", issues);
    });
  }
  if (hasOwn(input, "attestation") && input.attestation !== null) validateAttestation(input.attestation, `${path}.attestation`, issues);
  if (hasOwn(input, "scopeDowngrade")
      && (input.scopeDowngrade !== "class_applied_to_individual"
        || input.evidenceClass !== "E6"
        || !["low", "none"].includes(String(input.confidence)))) {
    addIssue(issues, "MEMORY_SCOPE_DOWNGRADE", `${path}.scopeDowngrade`, "Memory scopeDowngrade requires E6 and low/none confidence.", "§7.3.2–3");
  }
  if (channel === "reading" && input.externalAttestation !== "not_applicable") addIssue(issues, "MEMORY_L2_ATTESTATION", `${path}.externalAttestation`, "Memory L2 remains not_applicable.", "§5.5.2");
  if (channel === "englishForm") mergeInto(issues, validateEnglishForm(input.value, { memory: true }), `${path}.value`);
  if (channel === "romanisation") validateMemoryRomanisation(input.value, `${path}.value`, issues);
  if (channel === "reading") validateMemoryReading(input.value, `${path}.value`, issues);
}

/** RULE-API-21/22/18 and alias-justification closure. */
export function validateDocumentContextSemantics(input: unknown): ValidationResult {
  const issues: ValidationIssue[] = [];
  if (!isRecord(input) || input.contextFormatVersion !== "1" || typeof input.id !== "string" || !Array.isArray(input.entities)) {
    addIssue(issues, "DOCUMENT_CONTEXT_SHAPE", "$", "DocumentContext requires version 1, id and entities.", "§5.10");
    return finish(issues);
  }
  const refs = new Set<string>();
  Array.from(input.entities).forEach((entry, index) => {
    const path = `$.entities[${index}]`;
    if (!isRecord(entry)) {
      addIssue(issues, "MEMORY_ENTRY_OBJECT", path, "EntityMemoryEntry must be an object.", "§5.10.2");
      return;
    }
    for (const forbidden of ["span", "id", "entityId", "tokenId", "recordRef", "inheritedFrom", "derivedFrom"] as const) {
      if (hasOwn(entry, forbidden)) addIssue(issues, "MEMORY_CLOSURE", `${path}.${forbidden}`, `${forbidden} is forbidden in EntityMemoryEntry.`, "RULE-API-21; §5.10.3");
    }
    if (typeof entry.ref !== "string" || entry.ref.length === 0) {
      addIssue(issues, "MEMORY_REF", `${path}.ref`, "Memory ref must be non-empty.", "RULE-API-18");
    } else if (refs.has(entry.ref)) {
      addIssue(issues, "MEMORY_REF_UNIQUE", `${path}.ref`, "Memory refs are unique within the context.", "RULE-API-18");
    } else refs.add(entry.ref);
    if (!PERSON_TYPES.has(String(entry.type)) && hasOwn(entry, "name")) addIssue(issues, "MEMORY_NAME_PERSON_ONLY", `${path}.name`, "name is person-only.", "§5.10.2");
    if (Array.isArray(entry.aliases)) {
      const licensed = new Set<string>();
      if (isRecord(entry.name) && typeof entry.name.givenNameText === "string") licensed.add(entry.name.givenNameText);
      if (isRecord(entry.name)
          && typeof entry.name.prefixText === "string"
          && typeof entry.text === "string"
          && entry.text.startsWith(entry.name.prefixText)) {
        licensed.add(entry.text.slice(entry.name.prefixText.length));
      }
      entry.aliases.forEach((alias, aliasIndex) => {
        if (typeof alias !== "string" || !licensed.has(alias)) addIssue(issues, "MEMORY_ALIAS_JUSTIFICATION", `${path}.aliases[${aliasIndex}]`, "Alias is not licensed by MemoryPersonName structure.", "RULE-ENT-15");
      });
    }
    for (const channel of ["reading", "romanisation", "englishForm"] as const) {
      if (hasOwn(entry, channel)) validateMemoryChannel(entry[channel], channel, `${path}.${channel}`, issues);
    }
  });
  return finish(issues);
}

/** Exact CanonicalValue/CanonicalInteger domain; encoder and hashing are intentionally absent. */
export function validateCanonicalValue(input: unknown): ValidationResult {
  const issues: ValidationIssue[] = [];
  const minimum = -9223372036854775808n;
  const maximum = 9223372036854775807n;
  const active = new Set<object>();
  const visit = (value: unknown, path: string): void => {
    if (value === null || typeof value === "boolean" || typeof value === "string") return;
    if (Array.isArray(value)) {
      if (active.has(value)) {
        addIssue(issues, "CANONICAL_VALUE_CYCLE", path, "CanonicalValue must be acyclic.", "§5.13; §5.15.2");
        return;
      }
      active.add(value);
      const ownPropertyNames = Object.getOwnPropertyNames(value);
      if (ownPropertyNames.some((key) => key !== "length"
          && (!/^(?:0|[1-9][0-9]*)$/u.test(key) || Number(key) >= value.length))) {
        addIssue(issues, "CANONICAL_ARRAY_KEYS", path, "Canonical arrays have only in-range indexed members.", "§5.13 CanonicalValue");
      }
      if (Object.getOwnPropertySymbols(value).length !== 0) {
        addIssue(issues, "CANONICAL_VALUE_SYMBOL", path, "CanonicalValue has no symbol-keyed properties.", "§5.13 CanonicalValue");
      }
      for (let index = 0; index < value.length; index += 1) {
        const descriptor = Object.getOwnPropertyDescriptor(value, String(index));
        if (descriptor === undefined) {
          addIssue(issues, "CANONICAL_ARRAY_DENSE", `${path}[${index}]`, "Canonical arrays are dense; holes are outside the value domain.", "§5.13 CanonicalValue");
        } else if (descriptor.enumerable !== true
            || hasOwn(descriptor as unknown as Record<string, unknown>, "get")
            || hasOwn(descriptor as unknown as Record<string, unknown>, "set")) {
          addIssue(issues, "CANONICAL_ARRAY_PROPERTY", `${path}[${index}]`, "Canonical array members are data properties.", "§5.13 CanonicalValue");
        } else {
          visit(descriptor.value, `${path}[${index}]`);
        }
      }
      active.delete(value);
      return;
    }
    if (!isRecord(value)) {
      addIssue(issues, "CANONICAL_VALUE_DOMAIN", path, "CanonicalValue excludes bare numbers and non-JSON values.", "§5.13; §5.15.2");
      return;
    }
    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) {
      addIssue(issues, "CANONICAL_OBJECT_PLAIN", path, "Canonical objects must be ordinary JSON objects.", "§5.13 CanonicalObject");
      return;
    }
    if (active.has(value)) {
      addIssue(issues, "CANONICAL_VALUE_CYCLE", path, "CanonicalValue must be acyclic.", "§5.13; §5.15.2");
      return;
    }
    active.add(value);
    if (Object.getOwnPropertySymbols(value).length !== 0) {
      addIssue(issues, "CANONICAL_VALUE_SYMBOL", path, "CanonicalValue has no symbol-keyed properties.", "§5.13 CanonicalValue");
    }
    const descriptors = Object.getOwnPropertyDescriptors(value);
    Object.entries(descriptors).forEach(([key, descriptor]) => {
      if (!descriptor.enumerable || hasOwn(descriptor as unknown as Record<string, unknown>, "get")
          || hasOwn(descriptor as unknown as Record<string, unknown>, "set")) {
        addIssue(issues, "CANONICAL_OBJECT_PROPERTY", `${path}.${key}`, "Canonical object properties are enumerable data properties.", "§5.13 CanonicalObject");
      }
    });
    if (hasOwn(value, "__int")) {
      const keys = Object.keys(value);
      if (keys.length !== 1) addIssue(issues, "CANONICAL_INTEGER_KEYS", path, "CanonicalInteger has exactly one __int property.", "§5.13");
      const integerValue = descriptors.__int?.value;
      if (typeof integerValue !== "string" || !/^(?:0|-[1-9][0-9]*|[1-9][0-9]*)$/u.test(integerValue)) {
        addIssue(issues, "CANONICAL_INTEGER_GRAMMAR", `${path}.__int`, "Integer decimal forbids +, leading zeroes and -0.", "§5.13");
        active.delete(value);
        return;
      }
      const parsed = BigInt(integerValue);
      if (parsed < minimum || parsed > maximum) addIssue(issues, "CANONICAL_INTEGER_RANGE", `${path}.__int`, "Integer is outside signed int64.", "§5.13");
      active.delete(value);
      return;
    }
    for (const [key, descriptor] of Object.entries(descriptors)) {
      if (descriptor.enumerable && hasOwn(descriptor as unknown as Record<string, unknown>, "value")) {
        visit(descriptor.value, `${path}.${key}`);
      }
    }
    active.delete(value);
  };
  visit(input, "$");
  return finish(issues);
}

/** ProviderSnapshot shape and duplicate-entry validation; id hashing remains Range 0B. */
export function validateProviderSnapshotShape(input: unknown): ValidationResult {
  const issues: ValidationIssue[] = [];
  if (!isRecord(input)
      || typeof input.id !== "string"
      || !/^[0-9a-f]{64}$/u.test(input.id)
      || input.snapshotFormatVersion !== "1"
      || typeof input.providerId !== "string"
      || typeof input.providerConfigHash !== "string"
      || typeof input.createdAt !== "string"
      || !Array.isArray(input.entries)) {
    addIssue(issues, "PROVIDER_SNAPSHOT_SHAPE", "$", "ProviderSnapshot requires format 1 and entries.", "§5.13");
    return finish(issues);
  }
  const seen = new Set<string>();
  const entries = input.entries;
  if (Object.getOwnPropertyNames(entries).some((key) => key !== "length"
      && (!/^(?:0|[1-9][0-9]*)$/u.test(key) || Number(key) >= entries.length))
      || Object.getOwnPropertySymbols(entries).length !== 0) {
    addIssue(issues, "PROVIDER_ENTRIES_ARRAY", "$.entries", "ProviderSnapshot entries is an ordinary dense array with only indexed members.", "§5.13 ProviderSnapshot");
  }
  for (let index = 0; index < entries.length; index += 1) {
    const path = `$.entries[${index}]`;
    const descriptor = Object.getOwnPropertyDescriptor(entries, String(index));
    if (descriptor === undefined) {
      addIssue(issues, "PROVIDER_ENTRIES_DENSE", path, "ProviderSnapshot entries cannot contain holes.", "§5.13 ProviderSnapshot");
      continue;
    }
    if (descriptor.enumerable !== true
        || hasOwn(descriptor as unknown as Record<string, unknown>, "get")
        || hasOwn(descriptor as unknown as Record<string, unknown>, "set")) {
      addIssue(issues, "PROVIDER_ENTRY_PROPERTY", path, "ProviderSnapshot entries are data properties.", "§5.13 ProviderSnapshot");
      continue;
    }
    const entry = descriptor.value;
    if (!isRecord(entry) || typeof entry.inputHash !== "string" || !/^[0-9a-f]{64}$/u.test(entry.inputHash)) {
      addIssue(issues, "PROVIDER_ENTRY", path, "ProviderSnapshotEntry requires inputHash and output.", "§5.13");
      continue;
    }
    if (seen.has(entry.inputHash)) addIssue(issues, "PROVIDER_DUPLICATE_INPUT", `${path}.inputHash`, "Duplicate inputHash is rejected.", "RULE-API-20");
    seen.add(entry.inputHash);
    mergeInto(issues, validateCanonicalValue(entry.output), `${path}.output`);
  }
  return finish(issues);
}

function isEngineShape(input: unknown): input is Record<string, unknown> {
  const storeMethods = [
    "list", "get", "create", "update", "remove", "setEnabled",
    "search", "exportJson", "exportCsv", "importJson", "version",
  ];
  if (!isRecord(input) || !isRecord(input.stores)) return false;
  const stores = input.stores;
  return typeof input.processText === "function"
    && typeof input.versions === "function"
    && storeMethods.every((method) => typeof stores[method] === "function")
    && typeof input.validateJyutping === "function";
}

/**
 * §5.10 creation-result discriminant and the semantic snapshot/capability routes.
 * Snapshot identity hashing is deliberately not performed here (Range 0B).
 */
export function validateEngineCreationResult(
  input: unknown,
  context: { providerSnapshot?: unknown; lexiconCoverage?: unknown } = {},
): ValidationResult {
  const issues: ValidationIssue[] = [];
  if (!isRecord(input) || (input.ok !== true && input.ok !== false)) {
    addIssue(issues, "ENGINE_CREATION_RESULT", "$", "EngineCreationResult requires a boolean-literal ok discriminant.", "§5.10; T-API-043");
    return finish(issues);
  }

  const diagnostics = Array.isArray(input.diagnostics) ? input.diagnostics : [];
  if (!Array.isArray(input.diagnostics)) {
    addIssue(issues, "ENGINE_CREATION_DIAGNOSTICS", "$.diagnostics", "Creation diagnostics must be an array.", "§5.10");
  }
  diagnostics.forEach((diagnostic, index) => validateDiagnostic(diagnostic, `$.diagnostics[${index}]`, issues, "creation"));
  const hasLexiconDiagnostic = diagnostics.some((diagnostic) => isRecord(diagnostic)
    && diagnostic.code === "LEXICON_MISSING_CAPABILITY");
  const hasSnapshotDiagnostic = diagnostics.some((diagnostic) => isRecord(diagnostic)
    && diagnostic.code === "PROVIDER_SNAPSHOT_INVALID");

  const snapshotSupplied = context.providerSnapshot !== undefined;
  const snapshotInvalid = snapshotSupplied && !validateProviderSnapshotShape(context.providerSnapshot).ok;
  let coverageState: "unknown" | "clean" | "degraded" = "unknown";
  if (context.lexiconCoverage !== undefined) {
    const coverage = context.lexiconCoverage;
    const fields = ["writtenCantonese", "hkscs", "wordLevel", "frequencies"] as const;
    if (!isRecord(coverage) || fields.some((field) => typeof coverage[field] !== "boolean")) {
      addIssue(issues, "LEXICON_COVERAGE_CONTEXT", "$.context.lexiconCoverage", "LexiconCoverage requires four boolean capabilities.", "§5.13");
    } else {
      if (coverage.frequencies === false) coverageState = "degraded";
      else if (fields.every((field) => coverage[field] === true)) coverageState = "clean";
    }
  }

  if (input.ok === true) {
    if (!isEngineShape(input.engine)) {
      addIssue(issues, "ENGINE_CREATION_SUCCESS_ENGINE", "$.engine", "Successful creation exposes a live Engine-shaped value.", "§5.10");
    }
    if (hasSnapshotDiagnostic) {
      addIssue(issues, "ENGINE_CREATION_FATAL_DIAGNOSTIC", "$.diagnostics", "PROVIDER_SNAPSHOT_INVALID belongs to fatal failure.", "§5.10; §5.14");
    }
    if (snapshotInvalid) {
      addIssue(issues, "ENGINE_CREATION_FATAL_BRANCH", "$.ok", "A semantically invalid supplied snapshot must fail creation.", "§5.10; §5.13.2");
    }
    if (coverageState === "degraded" && !hasLexiconDiagnostic) {
      addIssue(issues, "ENGINE_CREATION_DEGRADED_DIAGNOSTIC", "$.diagnostics", "A missing lexicon capability requires an immediate creation warning.", "§5.10; T-API-011");
    }
    if (coverageState === "clean" && diagnostics.length !== 0) {
      addIssue(issues, "ENGINE_CREATION_CLEAN_DIAGNOSTICS", "$.diagnostics", "Clean creation has an empty diagnostic array.", "§5.10; T-API-043");
    }
    return finish(issues);
  }

  if (input.engine !== null) {
    addIssue(issues, "ENGINE_CREATION_FAILURE_ENGINE", "$.engine", "Failed creation exposes engine:null.", "§5.10");
  }
  if (diagnostics.length === 0) {
    addIssue(issues, "ENGINE_CREATION_FAILURE_DIAGNOSTICS", "$.diagnostics", "Failed creation requires a non-empty diagnostic tuple.", "§5.10");
  }
  if (!hasSnapshotDiagnostic) {
    addIssue(issues, "ENGINE_CREATION_FAILURE_CODE", "$.diagnostics", "Fatal snapshot failure includes PROVIDER_SNAPSHOT_INVALID.", "§5.10; §5.13.2");
  }
  // Shape validity cannot establish RULE-API-20 identity validity. Hashing is
  // outside this validator, so a shape-valid snapshot may still fail creation.
  if (!snapshotSupplied && context.lexiconCoverage !== undefined) {
    addIssue(issues, "ENGINE_CREATION_UNEXPECTED_FAILURE", "$.ok", "No fatal non-snapshot creation condition is defined; lexicon capability loss remains non-fatal where specified.", "§5.10; §5.21; T-API-011");
  }
  return finish(issues);
}

/** Minimal algorithm-neutral Lattice cross-object rules. */
export function validateLattice(input: unknown, source?: string): ValidationResult {
  const issues: ValidationIssue[] = [];
  if (!isRecord(input) || !isSpan(input.window) || !Array.isArray(input.edges) || !Array.isArray(input.alternatives)) {
    addIssue(issues, "LATTICE_SHAPE", "$", "Lattice requires window, edges and alternatives.", "§5.13");
    return finish(issues);
  }
  const window: [number, number] = input.window;
  if (source !== undefined) validateSpan(window, "$.window", issues, [0, source.length]);
  const edges: unknown[] = input.edges;
  const alternatives: unknown[] = input.alternatives;
  Array.from(edges).forEach((edge, index) => {
    const path = `$.edges[${index}]`;
    if (!isRecord(edge)) {
      addIssue(issues, "LATTICE_EDGE", path, "Lattice edge must be an object.", "§5.13");
      return;
    }
    if (edge.index !== index) addIssue(issues, "LATTICE_EDGE_INDEX", `${path}.index`, "Edge indices are consecutive local integers.", "§5.13 minimal lattice");
    if (validateSpan(edge.span, `${path}.span`, issues, window) && source !== undefined && edge.text !== source.slice(edge.span[0], edge.span[1])) {
      addIssue(issues, "LATTICE_EDGE_TEXT", `${path}.text`, "Edge text must be exact source slice.", "§5.13 minimal lattice");
    }
    if ((edge.source === "user_glossary" || edge.source === "forced") && (typeof edge.entryId !== "string" || edge.entryId.length === 0)) {
      addIssue(issues, "LATTICE_STORE_ENTRY", `${path}.entryId`, "Store/forced edge requires entryId.", "§5.13");
    }
    if ((edge.source === "lexicon" || edge.source === "character") && hasOwn(edge, "entryId")) {
      addIssue(issues, "LATTICE_REFERENCE_ENTRY", `${path}.entryId`, "Reference edge forbids entryId.", "§5.13");
    }
  });
  const paths = new Set<string>();
  Array.from(alternatives).forEach((alternative, index) => {
    const path = `$.alternatives[${index}].edgeIndices`;
    if (!isRecord(alternative) || !Array.isArray(alternative.edgeIndices) || alternative.edgeIndices.length === 0) {
      addIssue(issues, "LATTICE_PATH", path, "Alternative requires non-empty edgeIndices.", "§5.13");
      return;
    }
    const signature = JSON.stringify(alternative.edgeIndices);
    if (paths.has(signature)) addIssue(issues, "LATTICE_DUPLICATE_PATH", path, "Duplicate paths are forbidden.", "§5.13 minimal lattice");
    paths.add(signature);
    let cursor = window[0];
    Array.from(alternative.edgeIndices).forEach((raw, edgePosition) => {
      if (!Number.isInteger(raw) || Number(raw) < 0 || Number(raw) >= edges.length) {
        addIssue(issues, "LATTICE_PATH_INDEX", `${path}[${edgePosition}]`, "Path index must resolve to an edge.", "§5.13");
        return;
      }
      const edge = edges[Number(raw)];
      if (!isRecord(edge) || !isSpan(edge.span)) return;
      if (edge.span[0] !== cursor) addIssue(issues, "LATTICE_PATH_PARTITION", `${path}[${edgePosition}]`, "Path edges form a contiguous non-overlapping partition.", "§5.13 minimal lattice");
      cursor = edge.span[1];
    });
    if (cursor !== window[1]) addIssue(issues, "LATTICE_PATH_COVERAGE", path, "Path must cover the complete window.", "§5.13 minimal lattice");
  });
  return finish(issues);
}

/** Exact-one owner/channel reference validation. */
export function validateAnnotationRef(
  input: unknown,
  expectedChannel?: "reading" | "romanisation" | "englishForm",
): ValidationResult {
  const issues: ValidationIssue[] = [];
  if (!isRecord(input)) {
    addIssue(issues, "ANNOTATION_REF_OBJECT", "$", "AnnotationRef must be an object.", "§5.7.3");
    return finish(issues);
  }
  if (input.owner === "entity") {
    if (typeof input.entityId !== "string" || hasOwn(input, "tokenId")) addIssue(issues, "ANNOTATION_REF_OWNER", "$", "Entity reference requires only entityId.", "§5.7.3");
    if (!["reading", "romanisation", "englishForm"].includes(String(input.channel))) addIssue(issues, "ANNOTATION_REF_CHANNEL", "$.channel", "Illegal entity channel.", "§5.7.3");
  } else if (input.owner === "token") {
    if (typeof input.tokenId !== "string" || hasOwn(input, "entityId")) addIssue(issues, "ANNOTATION_REF_OWNER", "$", "Token reference requires only tokenId.", "§5.7.3");
    if (!["reading", "romanisation"].includes(String(input.channel))) addIssue(issues, "ANNOTATION_REF_CHANNEL", "$.channel", "Token cannot target englishForm.", "§5.7.3");
  } else {
    addIssue(issues, "ANNOTATION_REF_OWNER", "$.owner", "owner must be entity or token.", "§5.7.3");
  }
  if (expectedChannel !== undefined && input.channel !== expectedChannel) addIssue(issues, "ANNOTATION_REF_EXPECTED_CHANNEL", "$.channel", `Expected ${expectedChannel}.`, "§5.7.3");
  return finish(issues);
}

function validateDerivedFromShape(input: unknown): ValidationResult {
  const issues: ValidationIssue[] = [];
  if (!isRecord(input)) {
    addIssue(issues, "DERIVED_FROM_OBJECT", "$", "DerivedFrom must be an object.", "§5.7.3");
    return finish(issues);
  }
  if (input.layer !== "L3R") addIssue(issues, "DERIVED_FROM_SOURCE", "$.layer", "DerivedFrom.layer is exactly L3R.", "§5.7.3");
  if (input.fallbackReason !== "no_known_english_form") {
    addIssue(issues, "DERIVED_FROM_REASON", "$.fallbackReason", "DerivedFrom has the exact cross-layer fallback reason.", "§5.7.3");
  }
  if (input.directStoreRead !== false) {
    addIssue(issues, "DERIVED_FROM_STORE_READ", "$.directStoreRead", "Chain B derivation is not a direct Store read.", "§5.7.3");
  }
  mergeInto(issues, validateAnnotationRef(input.romanisationRef, "romanisation"), "$.romanisationRef");
  return finish(issues);
}

export function validateInheritanceRef(
  input: unknown,
  scope: {
    currentEntityIds?: ReadonlySet<string>;
    documentContext?: unknown;
  } = {},
): ValidationResult {
  const issues: ValidationIssue[] = [];
  validateInheritanceShape(input, "$", issues);
  if (!isRecord(input)) return finish(issues);
  if (input.kind === "analysis" && scope.currentEntityIds !== undefined && !scope.currentEntityIds.has(String(input.entityId))) {
    addIssue(issues, "INHERITANCE_UNRESOLVED", "$.entityId", "analysis reference does not resolve in the current Analysis.", "RULE-API-19");
  }
  if (input.kind === "documentContext" && scope.documentContext !== undefined) {
    const context = scope.documentContext;
    const resolves = isRecord(context)
      && context.id === input.contextId
      && Array.isArray(context.entities)
      && context.entities.some((entry) => isRecord(entry) && entry.ref === input.ref);
    if (!resolves) addIssue(issues, "INHERITANCE_UNRESOLVED", "$", "documentContext reference must match exact context id and ref.", "RULE-API-19");
  }
  return finish(issues);
}

function isUnsafeTextBoundary(source: string, offset: number): boolean {
  if (offset <= 0 || offset >= source.length) return false;
  const previous = source.charCodeAt(offset - 1);
  const next = source.charCodeAt(offset);
  if (previous >= 0xd800 && previous <= 0xdbff && next >= 0xdc00 && next <= 0xdfff) return true;
  const nextCodePoint = source.codePointAt(offset) ?? 0;
  const nextCharacter = String.fromCodePoint(nextCodePoint);
  return /^\p{M}$/u.test(nextCharacter)
    || /^[\uFE00-\uFE0F]$/u.test(nextCharacter)
    || (nextCodePoint >= 0xe0100 && nextCodePoint <= 0xe01ef);
}

function rangesPartiallyOverlap(left: [number, number], right: [number, number]): boolean {
  const overlap = left[0] < right[1] && right[0] < left[1];
  const contains = (left[0] <= right[0] && left[1] >= right[1])
    || (right[0] <= left[0] && right[1] >= left[1]);
  return overlap && !contains;
}

function validateInheritedChannel(
  inherited: Record<string, unknown>,
  layer: ContractLayer,
  path: string,
  candidate: boolean,
  entities: ReadonlyMap<string, Record<string, unknown>>,
  documentContext: unknown,
  issues: ValidationIssue[],
): void {
  const reference = inherited.inheritedFrom;
  if (inherited.provenance !== "inherited" || !isRecord(reference)) return;
  const channel = layer === "L2" ? "reading" : layer === "L3R" ? "romanisation" : layer === "L3E" ? "englishForm" : undefined;
  if (channel === undefined) return;
  let antecedent: unknown;
  if (reference.kind === "analysis" && typeof reference.entityId === "string") {
    antecedent = entities.get(reference.entityId);
  } else if (reference.kind === "documentContext" && isRecord(documentContext)
      && documentContext.id === reference.contextId && Array.isArray(documentContext.entities)) {
    antecedent = documentContext.entities.find((entry) => isRecord(entry) && entry.ref === reference.ref);
  }
  // Reference validation reports missing supplied owners. An omitted context
  // leaves antecedent content unavailable and permits only shape-level checks.
  if (!isRecord(antecedent)) return;
  const sourceChannel = antecedent[channel];
  if (!isRecord(sourceChannel)
      || (sourceChannel.status !== "resolved" && sourceChannel.status !== "fallback")
      || sourceChannel.value === null || sourceChannel.value === undefined) {
    addIssue(issues, "INHERITANCE_CHANNEL_SELECTED", `${path}.inheritedFrom`, "Inheritance requires a selected value in the antecedent's matching channel.", "RULE-API-22; RULE-API-24; §5.10.1");
    return;
  }
  const confidenceField = candidate ? "support" : "confidence";
  if (candidate && !hasOwn(inherited, confidenceField)) return;
  const bands = ["none", "low", "medium", "high"];
  const sourceBand = bands.indexOf(String(sourceChannel.confidence));
  const inheritedBand = bands.indexOf(String(inherited[confidenceField]));
  if (sourceBand >= 0 && inheritedBand > Math.min(sourceBand, bands.indexOf("medium"))) {
    addIssue(issues, "INHERITANCE_CONFIDENCE_CAP", `${path}.${confidenceField}`, "Inherited confidence/support cannot exceed the matching antecedent's confidence or medium.", "RULE-ENT-9; §5.10.1; §7.3.1–2");
  }
}

function visitEnvelope(
  envelope: unknown,
  layer: ContractLayer,
  ownerSpan: [number, number],
  path: string,
  issues: ValidationIssue[],
  entityIds: ReadonlySet<string>,
  tokenIds: ReadonlySet<string>,
  documentContext: unknown,
  unitIds: Set<string>,
  source: string,
  entities: ReadonlyMap<string, Record<string, unknown>>,
): void {
  mergeInto(issues, validateValueEnvelope(envelope, { layer }), path);
  if (!isRecord(envelope)) return;
  const values: Array<{ value: unknown; path: string }> = [{ value: envelope.value, path: `${path}.value` }];
  if (Array.isArray(envelope.alternatives)) {
    envelope.alternatives.forEach((candidate, index) => {
      if (isRecord(candidate)) values.push({ value: candidate.value, path: `${path}.alternatives[${index}].value` });
      if (isRecord(candidate) && hasOwn(candidate, "inheritedFrom")) {
        mergeInto(
          issues,
          validateInheritanceRef(candidate.inheritedFrom, { currentEntityIds: entityIds, documentContext }),
          `${path}.alternatives[${index}].inheritedFrom`,
        );
        validateInheritedChannel(candidate, layer, `${path}.alternatives[${index}]`, true, entities, documentContext, issues);
      }
    });
  }
  if (hasOwn(envelope, "inheritedFrom")) {
    mergeInto(issues, validateInheritanceRef(envelope.inheritedFrom, { currentEntityIds: entityIds, documentContext }), `${path}.inheritedFrom`);
    if ((envelope.status === "resolved" || envelope.status === "fallback")
        && envelope.value !== null && envelope.value !== undefined) {
      validateInheritedChannel(envelope, layer, path, false, entities, documentContext, issues);
    }
  }
  if (hasOwn(envelope, "derivedFrom") && isRecord(envelope.derivedFrom)) {
    const reference = envelope.derivedFrom.romanisationRef;
    mergeInto(issues, validateAnnotationRef(reference, "romanisation"), `${path}.derivedFrom.romanisationRef`);
    if (isRecord(reference)) {
      const resolved = reference.owner === "entity"
        ? entityIds.has(String(reference.entityId))
        : reference.owner === "token" && tokenIds.has(String(reference.tokenId));
      if (!resolved) addIssue(issues, "ANNOTATION_REF_UNRESOLVED", `${path}.derivedFrom.romanisationRef`, "RomanisationRef must resolve in the current Analysis.", "RULE-API-19");
    }
  }
  values.forEach((item) => {
    if (item.value === null || item.value === undefined) return;
    if (layer === "L2") mergeInto(issues, validateReadingAlignment(item.value, ownerSpan, source), item.path);
    if (layer === "L3R") mergeInto(issues, validateRomanisation(item.value, ownerSpan), item.path);
    if (layer === "L3E") mergeInto(issues, validateEnglishForm(item.value), item.path);
    if ((layer === "L3R" || layer === "L3E") && isRecord(item.value) && item.value.assembled === true && Array.isArray(item.value.units)) {
      let previousStart = -1;
      item.value.units.forEach((unit, index) => {
        if (!isRecord(unit)) return;
        if (typeof unit.id === "string") {
          if (unitIds.has(unit.id)) addIssue(issues, "UNIT_ID_UNIQUE", `${item.path}.units[${index}].id`, "Analysis unit ids share one unique namespace.", "RULE-API-13");
          unitIds.add(unit.id);
        }
        if (isSpan(unit.span)) {
          if (unit.span[0] < previousStart) addIssue(issues, "UNIT_SPAN_ORDER", `${item.path}.units[${index}].span`, "Unit arrays are in non-decreasing span order.", "RULE-API-13");
          previousStart = unit.span[0];
          validateSpan(unit.span, `${item.path}.units[${index}].span`, issues, ownerSpan);
        }
      });
    }
  });
}

/** Source/span/reference/order invariants over a supplied Analysis. */
export function validateAnalysisStructure(input: unknown, documentContext?: unknown): ValidationResult {
  const issues: ValidationIssue[] = [];
  if (!isRecord(input) || typeof input.source !== "string" || !Array.isArray(input.tokens)
      || !Array.isArray(input.entities) || !Array.isArray(input.regions) || !Array.isArray(input.termResolutions)) {
    addIssue(issues, "ANALYSIS_SHAPE", "$", "Analysis requires source, tokens, entities, regions and termResolutions.", "§5.4");
    return finish(issues);
  }
  const source: string = input.source;
  const tokens: unknown[] = input.tokens;
  const entities: unknown[] = input.entities;
  const regions: unknown[] = input.regions;
  const termResolutions: unknown[] = input.termResolutions;
  if (input.offsetUnit !== "utf16") addIssue(issues, "OFFSET_UNIT", "$.offsetUnit", "Analysis offsetUnit must be utf16.", "§5.2; INV-8");
  mergeInto(issues, validateVersions(input.versions), "$.versions");
  const tokenIds = new Set<string>();
  const entityIds = new Set<string>();
  tokens.forEach((token, index) => {
    if (!isRecord(token) || typeof token.id !== "string" || token.id.length === 0) {
      addIssue(issues, "TOKEN_ID", `$.tokens[${index}].id`, "Token requires a non-empty Analysis-local id.", "§5.6; RULE-API-13");
      return;
    }
    if (tokenIds.has(token.id)) addIssue(issues, "TOKEN_ID_UNIQUE", `$.tokens[${index}].id`, "Token ids are unique in one Analysis.", "RULE-API-13");
    tokenIds.add(token.id);
  });
  entities.forEach((entity, index) => {
    if (!isRecord(entity) || typeof entity.id !== "string" || entity.id.length === 0) {
      addIssue(issues, "ENTITY_ID", `$.entities[${index}].id`, "Entity requires a non-empty Analysis-local id.", "§5.7; RULE-API-13");
      return;
    }
    if (entityIds.has(entity.id)) addIssue(issues, "ENTITY_ID_UNIQUE", `$.entities[${index}].id`, "Entity ids are unique in one Analysis.", "RULE-API-13");
    entityIds.add(entity.id);
  });
  const entitySpanById = new Map<string, [number, number]>();
  const entityById = new Map<string, Record<string, unknown>>();
  entities.forEach((entity) => {
    if (isRecord(entity) && typeof entity.id === "string") entityById.set(entity.id, entity);
    if (isRecord(entity) && typeof entity.id === "string" && isSpan(entity.span)) entitySpanById.set(entity.id, entity.span);
  });
  const unitIds = new Set<string>();
  let cursor = 0;
  tokens.forEach((token, index) => {
    const path = `$.tokens[${index}]`;
    if (!isRecord(token)) {
      addIssue(issues, "TOKEN_OBJECT", path, "Token must be an object.", "§5.6");
      return;
    }
    if (!validateSpan(token.span, `${path}.span`, issues, [0, source.length])) return;
    if (token.span[0] !== cursor) addIssue(issues, "TOKEN_PARTITION", `${path}.span`, "Tokens are a contiguous source partition.", "INV-2");
    cursor = token.span[1];
    if (token.text !== source.slice(token.span[0], token.span[1])) addIssue(issues, "TOKEN_TEXT", `${path}.text`, "Token text is exact source slice.", "INV-1");
    if (isUnsafeTextBoundary(source, token.span[0]) || isUnsafeTextBoundary(source, token.span[1])) addIssue(issues, "TOKEN_UNSAFE_BOUNDARY", `${path}.span`, "Token boundary splits a protected UTF-16/text sequence.", "INV-4");
    visitEnvelope(token.reading, "L2", token.span, `${path}.reading`, issues, entityIds, tokenIds, documentContext, unitIds, source, entityById);
    visitEnvelope(token.romanisation, "L3R", token.span, `${path}.romanisation`, issues, entityIds, tokenIds, documentContext, unitIds, source, entityById);
  });
  if (cursor !== source.length) addIssue(issues, "TOKEN_PARTITION", "$.tokens", "Tokens must cover the complete source.", "INV-2");
  const tokenBoundaries = new Set<number>([0, source.length]);
  tokens.forEach((token) => { if (isRecord(token) && isSpan(token.span)) { tokenBoundaries.add(token.span[0]); tokenBoundaries.add(token.span[1]); } });
  const entitySpans: Array<{ span: [number, number]; path: string; primary: boolean }> = [];
  const entityKeys = new Set<string>();
  let previousEntityOrder: [number, number, string] | undefined;
  entities.forEach((entity, index) => {
    const path = `$.entities[${index}]`;
    if (!isRecord(entity)) {
      addIssue(issues, "ENTITY_OBJECT", path, "Entity must be an object.", "§5.7");
      return;
    }
    if (!validateSpan(entity.span, `${path}.span`, issues, [0, source.length])) return;
    entitySpans.push({ span: entity.span, path, primary: entity.primary === true });
    const entityKey = `${entity.span[0]}:${entity.span[1]}:${String(entity.type)}`;
    if (entityKeys.has(entityKey)) addIssue(issues, "ENTITY_COMMITTED_DUPLICATE", path, "Only one committed Entity exists per span/type.", "RULE-API-13");
    entityKeys.add(entityKey);
    const entityOrder: [number, number, string] = [entity.span[0], -entity.span[1], String(entity.type)];
    if (previousEntityOrder !== undefined
        && (entityOrder[0] < previousEntityOrder[0]
          || (entityOrder[0] === previousEntityOrder[0]
            && (entityOrder[1] < previousEntityOrder[1]
              || (entityOrder[1] === previousEntityOrder[1] && entityOrder[2] < previousEntityOrder[2]))))) {
      addIssue(issues, "ENTITY_ORDER", path, "Entities follow start-ascending/end-descending/type-ascending order.", "RULE-API-13");
    }
    previousEntityOrder = entityOrder;
    if (!tokenBoundaries.has(entity.span[0]) || !tokenBoundaries.has(entity.span[1])) addIssue(issues, "ENTITY_TOKEN_ALIGNMENT", `${path}.span`, "Entity boundaries align to token boundaries.", "INV-3");
    if (entity.text !== source.slice(entity.span[0], entity.span[1])) addIssue(issues, "ENTITY_TEXT", `${path}.text`, "Entity text is exact source slice.", "INV-1");
    if (hasOwn(entity, "inheritedFrom")) addIssue(issues, "ENTITY_WIDE_INHERITANCE", `${path}.inheritedFrom`, "Entity-wide inheritance slot does not exist in v1.", "RULE-API-24");
    if (hasOwn(entity, "recordRef")) addIssue(issues, "ENTITY_RECORD_DOMAIN", `${path}.recordRef`, "No durable Entity Record domain exists in v1.", "§5.10.3");
    if (hasOwn(entity, "containedBy")) {
      const containerSpan = entitySpanById.get(String(entity.containedBy));
      if (containerSpan === undefined) {
        addIssue(issues, "CONTAINED_BY_UNRESOLVED", `${path}.containedBy`, "containedBy must resolve in this Analysis.", "§5.7");
      } else if (!(containerSpan[0] <= entity.span[0]
        && containerSpan[1] >= entity.span[1]
        && (containerSpan[0] < entity.span[0] || containerSpan[1] > entity.span[1]))) {
        addIssue(issues, "CONTAINED_BY_GEOMETRY", `${path}.containedBy`, "containedBy must identify a strict containing Entity.", "INV-16");
      }
    }
    if (!PERSON_TYPES.has(String(entity.type)) && hasOwn(entity, "structure")) addIssue(issues, "PERSON_STRUCTURE_SCOPE", `${path}.structure`, "PersonNameStructure is person-only.", "§5.7");
    visitEnvelope(entity.reading, "L2", entity.span, `${path}.reading`, issues, entityIds, tokenIds, documentContext, unitIds, source, entityById);
    visitEnvelope(entity.romanisation, "L3R", entity.span, `${path}.romanisation`, issues, entityIds, tokenIds, documentContext, unitIds, source, entityById);
    visitEnvelope(entity.englishForm, "L3E", entity.span, `${path}.englishForm`, issues, entityIds, tokenIds, documentContext, unitIds, source, entityById);
  });
  for (let left = 0; left < entitySpans.length; left += 1) {
    for (let right = left + 1; right < entitySpans.length; right += 1) {
      const a = entitySpans[left];
      const b = entitySpans[right];
      if (a !== undefined && b !== undefined && rangesPartiallyOverlap(a.span, b.span)) addIssue(issues, "ENTITY_PARTIAL_OVERLAP", b.path, "Entities may nest but never partially overlap.", "INV-16");
      if (a !== undefined && b !== undefined && a.primary && b.primary && overlaps(a.span, b.span)) {
        addIssue(issues, "ENTITY_PRIMARY_OVERLAP", b.path, "At most one overlapping Entity is primary at a position.", "INV-16");
      }
    }
  }
  let previousRegion: [number, number] | undefined;
  const regionSpans = new Set<string>();
  const regionIds = new Set<string>();
  regions.forEach((region, index) => {
    const path = `$.regions[${index}]`;
    if (!isRecord(region)) {
      addIssue(issues, "REGION_OBJECT", path, "AmbiguousRegion must be an object.", "§5.4");
      return;
    }
    if (!validateSpan(region.span, `${path}.span`, issues, [0, source.length])) return;
    if (typeof region.id !== "string" || region.id.length === 0) {
      addIssue(issues, "REGION_ID", `${path}.id`, "AmbiguousRegion requires a non-empty Analysis-local id.", "§5.4; RULE-API-13");
    } else if (regionIds.has(region.id)) {
      addIssue(issues, "REGION_ID_UNIQUE", `${path}.id`, "AmbiguousRegion ids are unique in one Analysis.", "RULE-API-13");
    } else regionIds.add(region.id);
    if (!Array.isArray(region.alternatives) || region.alternatives.length < 2) addIssue(issues, "REGION_ALTERNATIVES", `${path}.alternatives`, "AmbiguousRegion requires at least two alternatives.", "§5.4");
    const signature = JSON.stringify(region.span);
    if (regionSpans.has(signature)) addIssue(issues, "REGION_DUPLICATE", `${path}.span`, "Exact duplicate region spans are forbidden.", "RULE-API-13");
    regionSpans.add(signature);
    if (previousRegion !== undefined && (region.span[0] < previousRegion[0] || (region.span[0] === previousRegion[0] && region.span[1] > previousRegion[1]))) addIssue(issues, "REGION_ORDER", `${path}.span`, "Regions are start-ascending/end-descending.", "RULE-API-13");
    previousRegion = region.span;
    if (Array.isArray(region.alternatives)) region.alternatives.forEach((candidate, candidateIndex) => {
      const candidatePath = `${path}.alternatives[${candidateIndex}]`;
      if (!isRecord(candidate)) {
        addIssue(issues, "REGION_CANDIDATE_OBJECT", candidatePath, "EntityBoundaryCandidate must be an object.", "§5.4");
      } else if (validateSpan(candidate.span, `${candidatePath}.span`, issues, [0, source.length])
          && candidate.text !== source.slice(candidate.span[0], candidate.span[1])) {
        addIssue(issues, "REGION_CANDIDATE_TEXT", `${path}.alternatives[${candidateIndex}].text`, "Boundary candidate text is exact source slice.", "§5.4");
      }
    });
  });
  let previousTerm: [number, number, string] | undefined;
  const termKeys = new Set<string>();
  termResolutions.forEach((term, index) => {
    const path = `$.termResolutions[${index}]`;
    if (!isRecord(term)) {
      addIssue(issues, "TERM_RESOLUTION_OBJECT", path, "TermResolution must be an object.", "§5.8");
      return;
    }
    if (!validateSpan(term.span, `${path}.span`, issues, [0, source.length])) return;
    if (term.sourceText !== source.slice(term.span[0], term.span[1])) addIssue(issues, "TERM_SOURCE_TEXT", `${path}.sourceText`, "Term sourceText is exact source slice.", "§5.8");
    const key = `${term.span[0]}:${term.span[1]}:${String(term.entryScope)}`;
    if (termKeys.has(key)) addIssue(issues, "TERM_RESOLUTION_UNIQUE", path, "One resolution per span/scope.", "§5.8");
    termKeys.add(key);
    const order: [number, number, string] = [term.span[0], -term.span[1], String(term.entryScope)];
    if (previousTerm !== undefined && (order[0] < previousTerm[0] || (order[0] === previousTerm[0] && (order[1] < previousTerm[1] || (order[1] === previousTerm[1] && order[2] < previousTerm[2]))))) addIssue(issues, "TERM_RESOLUTION_ORDER", path, "Term resolutions follow deterministic order.", "§5.8");
    previousTerm = order;
    visitEnvelope(term.result, "L4", term.span, `${path}.result`, issues, entityIds, tokenIds, documentContext, unitIds, source, entityById);
    if (isRecord(term.result)) {
      const renderings: unknown[] = [term.result.value];
      if (Array.isArray(term.result.alternatives)) term.result.alternatives.forEach((candidate) => { if (isRecord(candidate)) renderings.push(candidate.value); });
      renderings.forEach((rendering, renderingIndex) => {
        if (isRecord(rendering) && rendering.entryScope !== term.entryScope) addIssue(issues, "TERM_SCOPE_MATCH", `${path}.result[${renderingIndex}]`, "TermRendering scope must match TermResolution.", "§5.8");
      });
    }
  });
  if (isRecord(input.debug) && isRecord(input.debug.lattice)) mergeInto(issues, validateLattice(input.debug.lattice, source), "$.debug.lattice");
  if (isRecord(input.debug) && Array.isArray(input.debug.trace)) input.debug.trace.forEach((trace, index) => {
    if (!isRecord(trace) || !isRecord(trace.target)) return;
    if (trace.target.kind === "annotation") {
      mergeInto(issues, validateAnnotationRef(trace.target.ref), `$.debug.trace[${index}].target.ref`);
      if (isRecord(trace.target.ref)) {
        const resolved = trace.target.ref.owner === "entity"
          ? entityIds.has(String(trace.target.ref.entityId))
          : trace.target.ref.owner === "token" && tokenIds.has(String(trace.target.ref.tokenId));
        if (!resolved) addIssue(issues, "TRACE_ANNOTATION_UNRESOLVED", `$.debug.trace[${index}].target.ref`, "Debug annotation target must resolve in this Analysis.", "§5.16");
      }
    } else if (trace.target.kind === "termResolution"
        && (!Number.isInteger(trace.target.index) || Number(trace.target.index) < 0 || Number(trace.target.index) >= termResolutions.length)) {
      addIssue(issues, "TRACE_TERM_INDEX", `$.debug.trace[${index}].target.index`, "Trace index must resolve to termResolutions.", "§5.16");
    }
  });
  if (!Array.isArray(input.diagnostics)) {
    addIssue(issues, "ANALYSIS_DIAGNOSTICS", "$.diagnostics", "Analysis diagnostics must be an array.", "§5.4; §5.14");
  } else input.diagnostics.forEach((diagnostic, index) => {
    const path = `$.diagnostics[${index}]`;
    validateDiagnostic(diagnostic, path, issues, "analysis");
    if (isRecord(diagnostic) && isSpan(diagnostic.span)) {
      validateSpan(diagnostic.span, `${path}.span`, issues, [0, source.length]);
    }
  });
  return finish(issues);
}

function overlaps(left: [number, number], right: [number, number]): boolean {
  return left[0] < right[1] && right[0] < left[1];
}

/**
 * Pure fixture materialisation of only projection-local overlap diagnostics.
 * It performs no rendering, hashing, store read or linguistic work.
 */
export function materialiseProjectionDiagnostics(
  analysis: unknown,
  protectedSpans: unknown,
): Record<string, unknown>[] | null {
  if (!isRecord(analysis) || !Array.isArray(analysis.termResolutions) || !Array.isArray(protectedSpans)) return null;
  const protection: Array<{ span: [number, number]; entityId: string }> = [];
  for (let index = 0; index < protectedSpans.length; index += 1) {
    const descriptor = Object.getOwnPropertyDescriptor(protectedSpans, String(index));
    if (descriptor === undefined
        || descriptor.enumerable !== true
        || hasOwn(descriptor as unknown as Record<string, unknown>, "get")
        || hasOwn(descriptor as unknown as Record<string, unknown>, "set")) return null;
    const protectedSpan = descriptor.value;
    if (!isRecord(protectedSpan) || !isSpan(protectedSpan.span) || typeof protectedSpan.entityId !== "string") return null;
    protection.push({ span: protectedSpan.span, entityId: protectedSpan.entityId });
  }
  const diagnostics: Record<string, unknown>[] = [];
  for (let index = 0; index < analysis.termResolutions.length; index += 1) {
    const descriptor = Object.getOwnPropertyDescriptor(analysis.termResolutions, String(index));
    if (descriptor === undefined
        || descriptor.enumerable !== true
        || hasOwn(descriptor as unknown as Record<string, unknown>, "get")
        || hasOwn(descriptor as unknown as Record<string, unknown>, "set")) return null;
    const resolution = descriptor.value;
    if (!isRecord(resolution) || !isSpan(resolution.span) || !isRecord(resolution.result)
        || (resolution.result.status !== "resolved" && resolution.result.status !== "fallback")
        || !isRecord(resolution.result.value) || typeof resolution.result.value.entryId !== "string") continue;
    const affectedEntityIds = protection
      .filter((protectedSpan) => overlaps(resolution.span as [number, number], protectedSpan.span))
      .map((protectedSpan) => protectedSpan.entityId);
    if (affectedEntityIds.length === 0) continue;
    diagnostics.push({
      code: "TERM_DIRECTIVE_DROPPED_OVERLAP",
      severity: "warning",
      span: [resolution.span[0], resolution.span[1]],
      message: "Selected term directive dropped because protected-span precedence applies.",
      data: {
        entryId: resolution.result.value.entryId,
        protectedEntityIds: affectedEntityIds,
      },
    });
  }
  return diagnostics;
}

/** Shape/order/status preservation for the 5.0.16 projection output. */
export function validateTranslationDirectivesShape(input: unknown): ValidationResult {
  const issues: ValidationIssue[] = [];
  if (!isRecord(input) || !Array.isArray(input.protectedSpans)
      || !Array.isArray(input.termDirectives) || !Array.isArray(input.unresolvedSemanticSpans)
      || !Array.isArray(input.diagnostics)) {
    addIssue(issues, "DIRECTIVES_SHAPE", "$", "TranslationDirectives requires all four result arrays.", "§5.12; CHG-045 A");
    return finish(issues);
  }
  const protectedSpans: unknown[] = input.protectedSpans;
  const termDirectives: unknown[] = input.termDirectives;
  const unresolvedSemanticSpans: unknown[] = input.unresolvedSemanticSpans;
  const diagnostics: unknown[] = input.diagnostics;
  if (typeof input.schemaVersion !== "string") addIssue(issues, "DIRECTIVE_SCHEMA_VERSION", "$.schemaVersion", "TranslationDirectives requires schemaVersion.", "§5.12");
  if (typeof input.sourceHash !== "string" || !/^[0-9a-f]{64}$/u.test(input.sourceHash)) addIssue(issues, "DIRECTIVE_SOURCE_HASH", "$.sourceHash", "TranslationDirectives requires a SHA-256 sourceHash.", "§5.12");
  if (input.offsetUnit !== "utf16") addIssue(issues, "DIRECTIVE_OFFSET_UNIT", "$.offsetUnit", "TranslationDirectives offsetUnit is utf16.", "§5.12");
  if (input.styleUsed !== "hyphenated" && input.styleUsed !== "joined") addIssue(issues, "DIRECTIVE_STYLE", "$.styleUsed", "styleUsed is hyphenated or joined only.", "§5.12");
  let previousEnd = -1;
  protectedSpans.forEach((span, index) => {
    const path = `$.protectedSpans[${index}]`;
    if (!isRecord(span)) {
      addIssue(issues, "PROTECTED_SPAN_OBJECT", path, "ProtectedSpan must be an object.", "§5.12");
      return;
    }
    if (!validateSpan(span.span, `${path}.span`, issues)) return;
    if (span.span[0] < previousEnd) addIssue(issues, "PROTECTED_SPAN_OVERLAP", `${path}.span`, "Protected spans are sorted and non-overlapping.", "INV-17");
    previousEnd = span.span[1];
    if (typeof span.replacement !== "string" || span.replacement.length === 0) addIssue(issues, "PROTECTED_REPLACEMENT", `${path}.replacement`, "Protected replacement is concrete and non-empty.", "§5.12");
    if (span.styleApplied !== null) {
      if ((span.styleApplied !== "hyphenated" && span.styleApplied !== "joined")
          || span.assembled !== true
          || !PERSON_TYPES.has(String(span.entityType))
          || (span.formKind !== "romanisation" && span.formKind !== "hybrid")) {
        addIssue(issues, "PROTECTED_STYLE_APPLICABILITY", `${path}.styleApplied`, "Non-null style applies only to licensed assembled person forms.", "§5.12 rule 7");
      }
      if (span.styleApplied !== input.styleUsed) {
        addIssue(issues, "PROTECTED_STYLE_SETTING", `${path}.styleApplied`, "Applied style must equal the projection styleUsed setting.", "§5.12 rule 7");
      }
    }
    const expectedProtection = ["E1a", "E1b", "E1c", "E2", "E3", "E4"].includes(String(span.evidenceClass))
      ? "strict"
      : span.evidenceClass === "E5" ? "preferred" : "fallback";
    if (span.protection !== expectedProtection) addIssue(issues, "PROTECTION_EVIDENCE", `${path}.protection`, "Protection is derived from evidenceClass.", "§5.12 rule 6; §4.11");
  });
  termDirectives.forEach((term, index) => {
    const path = `$.termDirectives[${index}]`;
    if (!isRecord(term)) {
      addIssue(issues, "TERM_DIRECTIVE_OBJECT", path, "TermDirective must be an object.", "§5.8; §5.12");
      return;
    }
    if (!validateSpan(term.span, `${path}.span`, issues)) return;
    const termSpan: [number, number] = term.span;
    if (protectedSpans.some((protectedSpan) => isRecord(protectedSpan) && isSpan(protectedSpan.span) && overlaps(termSpan, protectedSpan.span))) {
      addIssue(issues, "DIRECTIVE_OVERLAP_REMAINS", `$.termDirectives[${index}].span`, "Projected term directives never overlap protected spans.", "§5.12 rule 5");
    }
  });
  unresolvedSemanticSpans.forEach((span, index) => {
    const path = `$.unresolvedSemanticSpans[${index}]`;
    if (!isRecord(span) || !isSpan(span.span)) {
      addIssue(issues, "UNRESOLVED_SPAN", path, "Unresolved semantic span requires span.", "§5.12");
      return;
    }
    if (span.status === "ambiguous" || span.status === "conflict") {
      if (hasOwn(span, "reason")) addIssue(issues, "UNRESOLVED_REASON_FORBIDDEN", `${path}.reason`, `${span.status} forbids reason.`, "§5.12; CHG-044 L");
    } else if (span.status === "unresolved" || span.status === "unsupported") {
      validateKnownStrings(span.reason, REASON_CODES, `${path}.reason`, "UNRESOLVED_REASON_REQUIRED", "§5.12; CHG-044 L", issues);
    } else {
      addIssue(issues, "UNRESOLVED_STATUS", `${path}.status`, "Only ambiguous/conflict/unresolved/unsupported project here.", "§5.12");
    }
  });
  diagnostics.forEach((diagnostic, index) => {
    validateDiagnostic(diagnostic, `$.diagnostics[${index}]`, issues, "projection");
  });
  return finish(issues);
}

/** Analysis-bound checks for the pure annotation projection; rendering itself is out of Range 0A. */
export function validateAnnotationProjectionConsistency(
  analysis: unknown,
  projection: unknown,
): ValidationResult {
  const issues: ValidationIssue[] = [];
  if (!isRecord(analysis) || !Array.isArray(analysis.tokens) || !Array.isArray(analysis.entities)
      || !isRecord(projection) || !Array.isArray(projection.annotations)) {
    addIssue(issues, "ANNOTATION_PROJECTION_SHAPE", "$", "Projection consistency requires Analysis owners and projected annotations.", "§5.11");
    return finish(issues);
  }
  if (projection.offsetUnit !== "utf16") {
    addIssue(issues, "ANNOTATION_PROJECTION_OFFSET", "$.offsetUnit", "AnnotationProjection offsetUnit is utf16.", "§5.11");
  }
  if (typeof analysis.sourceHash === "string" && projection.sourceHash !== analysis.sourceHash) {
    addIssue(issues, "ANNOTATION_PROJECTION_SOURCE_HASH", "$.sourceHash", "AnnotationProjection sourceHash binds to its Analysis.", "§5.11");
  }
  const tokenById = new Map<string, Record<string, unknown>>();
  const entityById = new Map<string, Record<string, unknown>>();
  analysis.tokens.forEach((token) => {
    if (isRecord(token) && typeof token.id === "string") tokenById.set(token.id, token);
  });
  analysis.entities.forEach((entity) => {
    if (isRecord(entity) && typeof entity.id === "string") entityById.set(entity.id, entity);
  });
  projection.annotations.forEach((annotation, index) => {
    const path = `$.annotations[${index}]`;
    if (!isRecord(annotation)) {
      addIssue(issues, "PROJECTED_ANNOTATION_OBJECT", path, "ProjectedAnnotation must be an object.", "§5.11");
      return;
    }
    mergeInto(issues, validateAnnotationRef(annotation.ref), `${path}.ref`);
    if (!isRecord(annotation.ref)) return;
    const owner = annotation.ref.owner === "entity"
      ? entityById.get(String(annotation.ref.entityId))
      : annotation.ref.owner === "token"
        ? tokenById.get(String(annotation.ref.tokenId))
        : undefined;
    if (owner === undefined) {
      addIssue(issues, "PROJECTED_ANNOTATION_OWNER", `${path}.ref`, "Projected annotation owner must resolve in this Analysis.", "§5.11; RULE-API-13");
      return;
    }
    const channel = annotation.ref.channel;
    const envelope = typeof channel === "string" && isRecord(owner[channel]) ? owner[channel] : undefined;
    if (envelope === undefined) {
      addIssue(issues, "PROJECTED_ANNOTATION_CHANNEL", `${path}.ref.channel`, "Projected channel must resolve on its owner.", "§5.11");
      return;
    }
    if (!isSpan(owner.span) || !isSpan(annotation.span)
        || owner.span[0] !== annotation.span[0] || owner.span[1] !== annotation.span[1]) {
      addIssue(issues, "PROJECTED_ANNOTATION_SPAN", `${path}.span`, "Projected span must equal its owner span.", "§5.11");
    }
    if (annotation.sourceText !== owner.text) {
      addIssue(issues, "PROJECTED_ANNOTATION_TEXT", `${path}.sourceText`, "Projected sourceText must equal its owner text.", "§5.11");
    }
    if (annotation.status !== envelope.status
        || annotation.confidence !== envelope.confidence
        || JSON.stringify(annotation.cautions) !== JSON.stringify(envelope.cautions)) {
      addIssue(issues, "PROJECTED_ANNOTATION_ENVELOPE", path, "Projected status, confidence and cautions must copy the source channel.", "§5.11");
    }
    if (envelope.value === null && annotation.rendered !== null) {
      addIssue(issues, "PROJECTED_ANNOTATION_NO_VALUE", `${path}.rendered`, "An unselected channel has no rendered value.", "§5.11 ProjectedAnnotation");
    } else if ((channel === "romanisation" || channel === "englishForm")
        && isRecord(envelope.value) && envelope.value.assembled === false
        && typeof envelope.value.text === "string" && annotation.rendered !== envelope.value.text) {
      addIssue(issues, "PROJECTED_ANNOTATION_VERBATIM", `${path}.rendered`, "Verbatim annotations preserve the exact selected text.", "§5.11; RULE-API-6; RULE-API-10");
    }
  });
  return finish(issues);
}

/** Analysis-to-projection checks, including CHG-045 diagnostic ownership/cardinality/order. */
export function validateProjectionConsistency(analysis: unknown, directives: unknown): ValidationResult {
  const issues: ValidationIssue[] = [];
  mergeInto(issues, validateTranslationDirectivesShape(directives));
  if (!isRecord(analysis) || !Array.isArray(analysis.termResolutions) || !Array.isArray(analysis.entities)
      || !isRecord(directives) || !Array.isArray(directives.termDirectives)
      || !Array.isArray(directives.protectedSpans)
      || !Array.isArray(directives.unresolvedSemanticSpans)
      || !Array.isArray(directives.diagnostics)) {
    addIssue(issues, "PROJECTION_INPUT_SHAPE", "$", "Projection consistency requires Analysis and TranslationDirectives arrays.", "§5.11–§5.12");
    return finish(issues);
  }
  const termResolutions: unknown[] = analysis.termResolutions;
  const entities: unknown[] = analysis.entities;
  const termDirectives: unknown[] = directives.termDirectives;
  const protectedSpans: unknown[] = directives.protectedSpans;
  const unresolvedSemanticSpans: unknown[] = directives.unresolvedSemanticSpans;
  const diagnostics: unknown[] = directives.diagnostics;
  if (typeof analysis.sourceHash === "string" && directives.sourceHash !== analysis.sourceHash) {
    addIssue(issues, "PROJECTION_SOURCE_BINDING", "$.sourceHash", "Projection sourceHash must equal Analysis.sourceHash.", "§5.12");
  }
  const sameSpan = (left: unknown, right: unknown): boolean => isSpan(left) && isSpan(right)
    && left[0] === right[0] && left[1] === right[1];
  termResolutions.forEach((resolution, index) => {
    if (!isRecord(resolution) || !isRecord(resolution.result)) return;
    if (resolution.result.status === "conflict" && Array.isArray(resolution.result.alternatives)) {
      resolution.result.alternatives.forEach((candidate) => {
        if (!isRecord(candidate) || !isRecord(candidate.value)) return;
        const candidateValue = candidate.value;
        if (termDirectives.some((term) => isRecord(term)
              && sameSpan(term.span, resolution.span)
              && term.entryId === candidateValue.entryId)) {
          addIssue(issues, "L4_CONFLICT_PROJECTED", `$.termResolutions[${index}]`, "Conflict produces no TermDirective.", "RULE-API-23; §5.12 rule 8");
        }
      });
    }
  });

  const selectedTerms: Array<{
    index: number;
    resolution: Record<string, unknown>;
    result: Record<string, unknown>;
    value: Record<string, unknown>;
    span: [number, number];
    dropped: boolean;
  }> = [];
  termResolutions.forEach((resolution, index) => {
    if (!isRecord(resolution) || !isSpan(resolution.span) || !isRecord(resolution.result)
        || (resolution.result.status !== "resolved" && resolution.result.status !== "fallback")
        || !isRecord(resolution.result.value)) return;
    selectedTerms.push({
      index,
      resolution,
      result: resolution.result,
      value: resolution.result.value,
      span: resolution.span,
      dropped: protectedSpans.some((protectedSpan) => isRecord(protectedSpan)
        && isSpan(protectedSpan.span) && overlaps(resolution.span as [number, number], protectedSpan.span)),
    });
  });
  const retainedTerms = selectedTerms.filter((term) => !term.dropped);
  if (termDirectives.length !== retainedTerms.length) {
    addIssue(issues, "TERM_DIRECTIVE_CARDINALITY", "$.termDirectives", "Every selected non-overlapping resolution projects exactly once and every overlapping one is absent.", "§5.12 rules 5/8");
  }
  retainedTerms.forEach((expected, index) => {
    const actual = termDirectives[index];
    if (!isRecord(actual)
        || !sameSpan(actual.span, expected.span)
        || actual.entryScope !== expected.resolution.entryScope
        || actual.entryId !== expected.value.entryId) {
      addIssue(issues, "TERM_DIRECTIVE_ORDER", `$.termDirectives[${index}]`, "Selected directives preserve deterministic Analysis.termResolutions order after drops.", "§5.8; §5.12 rule 5");
    }
  });
  selectedTerms.filter((term) => term.dropped).forEach((expected) => {
    if (termDirectives.some((term) => isRecord(term)
        && sameSpan(term.span, expected.span)
        && term.entryScope === expected.resolution.entryScope
        && term.entryId === expected.value.entryId)) {
      addIssue(issues, "OVERLAPPING_TERM_NOT_DROPPED", `$.termResolutions[${expected.index}]`, "Protected-span precedence drops the selected directive.", "§5.12 rule 5; F7");
    }
  });

  const expectedDiagnostics = materialiseProjectionDiagnostics(analysis, protectedSpans) ?? [];
  if (diagnostics.length !== expectedDiagnostics.length) {
    addIssue(issues, "PROJECTION_DIAGNOSTIC_CARDINALITY", "$.diagnostics", "Projection emits exactly one diagnostic per dropped directive and [] when none are dropped.", "§5.12 rule 5; T-API-012");
  }
  expectedDiagnostics.forEach((expected, index) => {
    const actual = diagnostics[index];
    if (!isRecord(actual)
        || actual.code !== "TERM_DIRECTIVE_DROPPED_OVERLAP"
        || !sameSpan(actual.span, expected.span)) {
      addIssue(issues, "PROJECTION_DIAGNOSTIC_ORDER", `$.diagnostics[${index}]`, "Overlap diagnostics follow attempted directive order and carry the exact dropped span.", "§5.12 rule 5");
      return;
    }
    if (isRecord(actual.data) && hasOwn(actual.data, "entryId")
        && isRecord(expected.data) && actual.data.entryId !== expected.data.entryId) {
      addIssue(issues, "PROJECTION_DIAGNOSTIC_ENTRY", `$.diagnostics[${index}].data.entryId`, "Optional entryId data must identify the dropped directive.", "§5.12 rule 5");
    }
    if (isRecord(actual.data) && hasOwn(actual.data, "protectedEntityIds")
        && isRecord(expected.data)
        && JSON.stringify(actual.data.protectedEntityIds) !== JSON.stringify(expected.data.protectedEntityIds)) {
      addIssue(issues, "PROJECTION_DIAGNOSTIC_ENTITIES", `$.diagnostics[${index}].data.protectedEntityIds`, "Optional protectedEntityIds data must identify exactly the affected protected spans in order.", "§5.12 rule 5");
    }
  });
  termDirectives.forEach((term, index) => {
    if (!isRecord(term)) return;
    const source = termResolutions.find((resolution) => isRecord(resolution)
      && sameSpan(resolution.span, term.span)
      && resolution.entryScope === term.entryScope
      && isRecord(resolution.result)
      && (resolution.result.status === "resolved" || resolution.result.status === "fallback")
      && isRecord(resolution.result.value)
      && resolution.result.value.entryId === term.entryId
      && resolution.result.value.preferred === term.preferred);
    if (source === undefined) {
      addIssue(issues, "TERM_DIRECTIVE_SOURCE", `$.termDirectives[${index}]`, "Every TermDirective must come from a selected core TermResolution over the same span.", "§5.12 rule 8");
    } else if (isRecord(source) && isRecord(source.result)) {
      if (term.sourceText !== source.sourceText) {
        addIssue(issues, "TERM_DIRECTIVE_SOURCE_TEXT", `$.termDirectives[${index}].sourceText`, "TermDirective sourceText copies TermResolution sourceText.", "§5.8; §5.12 rule 8");
      }
      if (term.evidenceClass !== source.result.evidenceClass) {
        addIssue(issues, "TERM_DIRECTIVE_EVIDENCE", `$.termDirectives[${index}].evidenceClass`, "TermDirective evidenceClass copies the selected Value envelope.", "§5.8; §5.12 rule 8");
      }
    }
  });
  const entityById = new Map<string, Record<string, unknown>>();
  entities.forEach((entity) => {
    if (isRecord(entity) && typeof entity.id === "string") entityById.set(entity.id, entity);
  });
  protectedSpans.forEach((protectedSpan, index) => {
    if (!isRecord(protectedSpan)) return;
    const entity = entityById.get(String(protectedSpan.entityId));
    const english = entity !== undefined && isRecord(entity.englishForm) ? entity.englishForm : undefined;
    const form = english !== undefined && isRecord(english.value) ? english.value : undefined;
    if (entity === undefined
        || !sameSpan(entity.span, protectedSpan.span)
        || entity.type !== protectedSpan.entityType
        || entity.primary !== true
        || english === undefined
        || (english.status !== "resolved" && english.status !== "fallback")
        || form === undefined) {
      addIssue(issues, "PROTECTED_SPAN_SOURCE", `$.protectedSpans[${index}]`, "ProtectedSpan must resolve to a primary Entity with a selected English form over the same span.", "§5.12 rules 1–4");
      return;
    }
    if (form.formKind !== protectedSpan.formKind
        || form.assembled !== protectedSpan.assembled
        || english.provenance !== protectedSpan.provenance
        || english.evidenceClass !== protectedSpan.evidenceClass
        || english.externalAttestation !== protectedSpan.externalAttestation) {
      addIssue(issues, "PROTECTED_SPAN_COPY", `$.protectedSpans[${index}]`, "ProtectedSpan must preserve source form and evidence fields.", "§5.12 rules 6–7");
    }
    if (form.assembled === false && protectedSpan.replacement !== form.text) {
      addIssue(issues, "PROTECTED_VERBATIM_REPLACEMENT", `$.protectedSpans[${index}].replacement`, "Verbatim protected replacement must preserve the source form text exactly.", "RULE-API-6; RULE-API-10; §5.12");
    }
    const expectsStyle = form.assembled === true && form.person === true && hasOwn(form, "styleApplicable");
    if (expectsStyle ? protectedSpan.styleApplied !== directives.styleUsed : protectedSpan.styleApplied !== null) {
      addIssue(issues, "PROTECTED_STYLE_SOURCE", `$.protectedSpans[${index}].styleApplied`, "styleApplied reflects exactly the source form's style applicability.", "§5.12 rule 7");
    }
    if (Array.isArray(analysis.regions)
        && analysis.regions.some((region) => isRecord(region) && sameSpan(region.span, protectedSpan.span))) {
      addIssue(issues, "BOUNDARY_AMBIGUITY_PROTECTED", `$.protectedSpans[${index}]`, "Boundary-ambiguous regions produce no protected span.", "§5.12 rule 2");
    }
  });
  entities.forEach((entity, index) => {
    if (!isRecord(entity) || !isSpan(entity.span) || !isRecord(entity.englishForm)) return;
    const status = entity.englishForm.status;
    if (!["ambiguous", "conflict", "unresolved", "unsupported"].includes(String(status))) return;
    const expectedReason = status === "unresolved" || status === "unsupported" ? entity.englishForm.reason : undefined;
    const entitySpan: [number, number] = entity.span;
    const match = unresolvedSemanticSpans.some((span) => isRecord(span)
      && isSpan(span.span)
      && span.span[0] === entitySpan[0]
      && span.span[1] === entitySpan[1]
      && span.status === status
      && (expectedReason === undefined ? !hasOwn(span, "reason") : span.reason === expectedReason));
    if (!match) addIssue(issues, "UNRESOLVED_PROJECTION_COPY", `$.entities[${index}].englishForm`, "Projection must preserve status and applicable source reason.", "§5.12 rule 3");
    if (protectedSpans.some((span) => isRecord(span) && (span.entityId === entity.id || sameSpan(span.span, entity.span)))) {
      addIssue(issues, "UNRESOLVED_ENTITY_PROTECTED", `$.entities[${index}]`, "An unresolved semantic entity produces no protected span.", "§5.12 rule 3");
    }
  });
  unresolvedSemanticSpans.forEach((span, index) => {
    if (!isRecord(span)) return;
    const hasSource = entities.some((entity) => isRecord(entity)
      && sameSpan(entity.span, span.span)
      && isRecord(entity.englishForm)
      && entity.englishForm.status === span.status
      && ((span.status === "ambiguous" || span.status === "conflict")
        ? !hasOwn(span, "reason")
        : entity.englishForm.reason === span.reason));
    if (!hasSource) {
      addIssue(issues, "UNRESOLVED_PROJECTION_SOURCE", `$.unresolvedSemanticSpans[${index}]`, "Every unresolved semantic span must copy a source Entity channel.", "§5.12 rule 3");
    }
  });
  return finish(issues);
}

export type ConsumerEnumResult<Known extends string> =
  | { kind: "known"; value: Known }
  | { kind: "unknown"; raw: string; conservativeBehaviour: "unresolved" };

/** RULE-API-9 tolerant-consumer behaviour: preserve, never coerce, unknown raw values. */
export function readConsumerEnum<const Known extends string>(
  raw: string,
  known: ReadonlySet<Known>,
): ConsumerEnumResult<Known> {
  if (known.has(raw as Known)) return { kind: "known", value: raw as Known };
  return { kind: "unknown", raw, conservativeBehaviour: "unresolved" };
}

/** Stable recursive key ordering used only for deterministic test serialisation, not contract hashing. */
export function stableJsonStringify(value: unknown): string {
  const canonicalise = (input: unknown): unknown => {
    if (Array.isArray(input)) return input.map(canonicalise);
    if (!isRecord(input)) return input;
    return Object.fromEntries(
      Object.keys(input)
        .sort()
        .map((key) => [key, canonicalise(input[key])]),
    );
  };
  return JSON.stringify(canonicalise(value));
}

export const knownStatusValues = new Set([
  "resolved", "fallback", "ambiguous", "conflict", "unresolved", "unsupported", "out_of_scope",
] as const);
