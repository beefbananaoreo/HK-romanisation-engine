/**
 * Strict JSON Schema 2020-12 materialisation of the serialisable public
 * surface in Hong Kong Cantonese Language Lab contract 5.0.16.
 *
 * This is a current-producer schema. RULE-API-9's open-consumer behaviour is
 * implemented by a tolerant decoder, not by widening producer definitions.
 */

export type JsonSchema = boolean | Readonly<Record<string, unknown>>;

export interface ContractSchemaDocument extends Readonly<Record<string, unknown>> {
  readonly $schema: string;
  readonly $id: string;
  readonly $ref: string;
  readonly $defs: Readonly<Record<string, JsonSchema>>;
}

const ref = (name: string): Readonly<Record<string, string>> => ({
  $ref: `#/$defs/${name}`,
});

const strictObject = (
  properties: Readonly<Record<string, unknown>>,
  required: readonly string[] = [],
  extra: Readonly<Record<string, unknown>> = {},
): Readonly<Record<string, unknown>> => ({
  type: "object",
  properties,
  required,
  additionalProperties: false,
  ...extra,
});

const enumSchema = (values: readonly (string | number)[]): Readonly<Record<string, unknown>> => ({ enum: values });

const nullable = (schema: Readonly<Record<string, unknown>>): Readonly<Record<string, unknown>> => ({
  anyOf: [schema, { type: "null" }],
});

const absent = (property: string): Readonly<Record<string, unknown>> => ({
  not: { type: "object", properties: { [property]: {} }, required: [property] },
});

const requires = (property: string): Readonly<Record<string, unknown>> => ({
  type: "object", properties: { [property]: {} }, required: [property],
});

const candidateDefinition = (
  valueDefinition: string,
  externalAttestation?: "not_applicable",
  variationAllowed = false,
  baseOnly = false,
): Readonly<Record<string, unknown>> => strictObject(
  {
    value: ref(valueDefinition),
    rank: { type: "number" },
    ...(baseOnly ? {} : { provenance: ref("ProducedProvenance") }),
    evidenceClass: nullable(ref("EvidenceClass")),
    externalAttestation: externalAttestation === undefined
      ? ref("ExternalAttestation")
      : { const: externalAttestation },
    attestation: nullable(ref("Attestation")),
    scopeDowngrade: { const: "class_applied_to_individual" },
    support: ref("Confidence"),
    attestationCount: { type: "number" },
    cautions: { type: "array", items: ref("CautionCode") },
    ...(variationAllowed ? { variation: ref("VariationKind") } : {}),
    note: { type: "string" },
    ...(baseOnly ? {} : { inheritedFrom: ref("InheritanceRef") }),
  },
  ["value", ...(baseOnly ? [] : ["provenance"]), "evidenceClass", "externalAttestation", "cautions"],
  {
    allOf: [
      ...(baseOnly ? [] : [{
        if: { properties: { provenance: { const: "inherited" } }, required: ["provenance"] },
        then: requires("inheritedFrom"),
        else: absent("inheritedFrom"),
      }, {
        if: { properties: { provenance: { const: "rule_engine" } }, required: ["provenance"] },
        then: { properties: { support: { enum: ["low", "none"] } } },
      }]),
      {
        if: { required: ["support"] },
        then: { properties: { support: { enum: ["medium", "low", "none"] } } },
      },
      {
        if: {
          properties: { scopeDowngrade: { const: "class_applied_to_individual" } },
          required: ["scopeDowngrade"],
        },
        then: {
          properties: { evidenceClass: { const: "E6" }, support: { enum: ["low", "none"] } },
        },
      },
    ],
  },
);

const valueDefinition = (
  valueType: string,
  candidateType: string,
  options: { externalAttestation?: "not_applicable"; derivedFrom?: boolean } = {},
): Readonly<Record<string, unknown>> => strictObject(
  {
    value: { anyOf: [ref(valueType), { type: "null" }] },
    status: ref("Status"),
    provenance: ref("ProducedProvenance"),
    confidence: ref("Confidence"),
    evidenceClass: nullable(ref("EvidenceClass")),
    externalAttestation: options.externalAttestation === undefined
      ? ref("ExternalAttestation")
      : { const: options.externalAttestation },
    attestation: nullable(ref("Attestation")),
    scopeDowngrade: { const: "class_applied_to_individual" },
    alternatives: { type: "array", items: ref(candidateType) },
    ranked: { type: "boolean" },
    cautions: { type: "array", items: ref("CautionCode") },
    reason: ref("ReasonCode"),
    derivedFrom: ref("DerivedFrom"),
    inheritedFrom: ref("InheritanceRef"),
  },
  [
    "value", "status", "provenance", "confidence", "evidenceClass",
    "externalAttestation", "alternatives", "ranked", "cautions",
  ],
  {
    allOf: [
      {
        oneOf: [
          {
            properties: { status: { const: "resolved" }, value: ref(valueType) },
            allOf: [absent("reason")],
          },
          {
            properties: {
              status: { const: "fallback" }, value: ref(valueType), confidence: { enum: ["low", "none"] },
            },
            allOf: [absent("reason")],
          },
          {
            properties: {
              status: { const: "ambiguous" }, value: { type: "null" },
              alternatives: { type: "array", minItems: 2 }, ranked: { const: true }, confidence: { const: "none" },
            },
            allOf: [absent("reason")],
          },
          {
            properties: {
              status: { const: "conflict" }, value: { type: "null" },
              alternatives: { type: "array", minItems: 2 }, ranked: { const: false }, confidence: { const: "none" },
            },
            allOf: [absent("reason")],
          },
          {
            properties: {
              status: { const: "unresolved" }, value: { type: "null" }, ranked: { const: false },
              confidence: { const: "none" }, reason: ref("ReasonCode"),
            },
            required: ["reason"],
          },
          {
            properties: {
              status: { const: "unsupported" }, value: { type: "null" },
              alternatives: { type: "array", maxItems: 0 }, ranked: { const: false },
              confidence: { const: "none" }, reason: ref("ReasonCode"),
            },
            required: ["reason"],
          },
          {
            properties: {
              status: { const: "out_of_scope" }, value: { type: "null" },
              alternatives: { type: "array", maxItems: 0 }, ranked: { const: false }, confidence: { const: "none" },
            },
            allOf: [absent("reason")],
          },
        ],
      },
      {
        if: { properties: { ranked: { const: true } }, required: ["ranked"] },
        then: {
          properties: {
            alternatives: {
              type: "array", items: { allOf: [ref(candidateType), requires("rank")] },
            },
          },
        },
        else: {
          properties: {
            alternatives: { type: "array", items: { allOf: [ref(candidateType), absent("rank")] } },
          },
        },
      },
      {
        if: {
          properties: { value: { not: { type: "null" } }, provenance: { const: "inherited" } },
          required: ["value", "provenance"],
        },
        then: requires("inheritedFrom"),
        else: absent("inheritedFrom"),
      },
      ...(options.derivedFrom === true ? [] : [absent("derivedFrom")]),
      {
        if: { properties: { provenance: { const: "rule_engine" } }, required: ["provenance"] },
        then: { properties: { confidence: { enum: ["low", "none"] } } },
      },
      {
        if: { properties: { provenance: { const: "inherited" } }, required: ["provenance"] },
        then: { properties: { confidence: { enum: ["medium", "low", "none"] } } },
      },
      {
        if: {
          properties: { scopeDowngrade: { const: "class_applied_to_individual" } },
          required: ["scopeDowngrade"],
        },
        then: { properties: { evidenceClass: { const: "E6" }, confidence: { enum: ["low", "none"] } } },
      },
    ],
  },
);

const memoryChannelDefinition = (
  valueType: string,
  externalAttestation?: "not_applicable",
): Readonly<Record<string, unknown>> => strictObject(
  {
    value: ref(valueType), status: { enum: ["resolved", "fallback"] }, provenance: ref("ProducedProvenance"),
    confidence: ref("Confidence"), evidenceClass: nullable(ref("EvidenceClass")),
    externalAttestation: externalAttestation === undefined
      ? ref("ExternalAttestation")
      : { const: externalAttestation },
    attestation: nullable(ref("Attestation")), scopeDowngrade: { const: "class_applied_to_individual" },
    cautions: { type: "array", items: ref("CautionCode") },
  },
  ["value", "status", "provenance", "confidence", "evidenceClass", "externalAttestation", "cautions"],
  {
    allOf: [
      {
        if: { properties: { status: { const: "fallback" } }, required: ["status"] },
        then: { properties: { confidence: { enum: ["low", "none"] } } },
      },
      {
        if: { properties: { provenance: { const: "inherited" } }, required: ["provenance"] },
        then: { properties: { confidence: { enum: ["medium", "low", "none"] } } },
      },
      {
        if: { properties: { provenance: { const: "rule_engine" } }, required: ["provenance"] },
        then: { properties: { confidence: { enum: ["low", "none"] } } },
      },
      {
        if: {
          properties: { scopeDowngrade: { const: "class_applied_to_individual" } },
          required: ["scopeDowngrade"],
        },
        then: { properties: { evidenceClass: { const: "E6" }, confidence: { enum: ["low", "none"] } } },
      },
    ],
  },
);

const tokenTypes = [
  "han", "latin", "digit", "punct_cjk", "punct_latin", "space", "symbol", "emoji", "script_other", "unknown",
] as const;
const entityTypes = [
  "person", "person.surname", "person.foreign", "place.region", "place.district", "place.area", "place.village",
  "place.topographic", "street", "building", "facility", "org.company", "org.institution", "org.government",
  "work", "event", "other",
] as const;
const personEntityTypes = ["person", "person.surname", "person.foreign"] as const;
const statusValues = [
  "resolved", "fallback", "ambiguous", "conflict", "unresolved", "unsupported", "out_of_scope",
] as const;
const provenanceValues = [
  "user_glossary", "entity_record", "convention_table", "lexicon", "rule_engine", "external", "inherited", "none",
] as const;
const producedProvenanceValues = [
  "user_glossary", "convention_table", "lexicon", "rule_engine", "inherited", "none",
] as const;
const evidenceClassValues = ["E1a", "E1b", "E1c", "E2", "E3", "E4", "E5", "E6", "E7"] as const;
const storeEvidenceClassValues = ["E1a", "E1b", "E1c", "E2"] as const;
const formKindValues = ["romanisation", "official_name", "native_original", "translation", "hybrid"] as const;
const reasonCodeValues = [
  "reading_not_found", "number_reading_requires_context", "lexicon_unavailable", "unsupported_code_point",
  "malformed_input", "no_known_english_form",
] as const;
const cautionCodeValues = [
  "stale_source", "overrides_official", "decomposed_not_attested", "source_unavailable",
  "non_hk_convention_suspected", "cjk_non_chinese_suspected", "foreign_origin_suspected",
  "sibilant_class_unknown", "multiple_conventions", "spelling_collision", "bearer_spelling_unknown",
  "non_chinese_script", "window_ceiling_reached", "official_name_expected",
] as const;

function unsignedUpToPattern(maximum: string, includeZero: boolean): string {
  const alternatives: string[] = [];
  if (includeZero) alternatives.push("0");
  if (maximum.length > 1) alternatives.push(`[1-9][0-9]{0,${maximum.length - 2}}`);
  for (let index = 0; index < maximum.length; index += 1) {
    const prefix = maximum.slice(0, index);
    const digit = Number(maximum[index]);
    const minimum = index === 0 ? 1 : 0;
    if (digit > minimum) {
      const choice = digit - 1 === minimum ? String(minimum) : `[${minimum}-${digit - 1}]`;
      const remaining = maximum.length - index - 1;
      alternatives.push(`${prefix}${choice}${remaining === 0 ? "" : `[0-9]{${remaining}}`}`);
    }
  }
  alternatives.push(maximum);
  return `(?:${alternatives.join("|")})`;
}

const positiveInt64 = unsignedUpToPattern("9223372036854775807", true);
const negativeInt64Magnitude = unsignedUpToPattern("9223372036854775808", false);
const canonicalInt64Pattern = `^(?:${positiveInt64}|-${negativeInt64Magnitude})$`;

const englishAssemblyBase = {
  formKind: { enum: ["romanisation", "hybrid"] }, assembled: { const: true },
  units: { type: "array", minItems: 1, items: ref("EnglishAssemblyUnit") }, grouping: ref("Grouping"),
  person: { type: "boolean" }, styleApplicable: ref("StyleApplicable"),
} as const;
const englishAssemblyLegality = {
  allOf: [
    {
      if: { properties: { formKind: { const: "romanisation" } }, required: ["formKind"] },
      then: { properties: { units: { type: "array", items: ref("RomanisedEnglishUnit") } } },
    },
    {
      if: { properties: { formKind: { const: "hybrid" } }, required: ["formKind"] },
      then: {
        properties: {
          units: {
            type: "array", contains: ref("RomanisedEnglishUnit"), minContains: 1,
            allOf: [{
              contains: { oneOf: [ref("LiteralEnglishUnit"), ref("TranslatedEnglishUnit")] }, minContains: 1,
            }],
          },
        },
      },
    },
  ],
} as const;
const licensedGeneratedGivenUnit = {
  type: "object",
  properties: { kind: { const: "romanised" }, role: { const: "given" }, generated: { const: true } },
  required: ["kind", "role", "generated"],
} as const;
const memoryEnglishAssemblyBase = {
  formKind: { enum: ["romanisation", "hybrid"] }, assembled: { const: true },
  units: { type: "array", minItems: 1, items: ref("MemoryEnglishAssemblyUnit") }, grouping: ref("Grouping"),
  person: { type: "boolean" }, styleApplicable: ref("MemoryStyleApplicable"),
} as const;
const memoryEnglishAssemblyLegality = {
  allOf: [
    {
      if: { properties: { formKind: { const: "romanisation" } }, required: ["formKind"] },
      then: { properties: { units: { type: "array", items: ref("MemoryRomanisedEnglishUnit") } } },
    },
    {
      if: { properties: { formKind: { const: "hybrid" } }, required: ["formKind"] },
      then: {
        properties: {
          units: {
            type: "array", contains: ref("MemoryRomanisedEnglishUnit"), minContains: 1,
            allOf: [{
              contains: { oneOf: [ref("MemoryLiteralEnglishUnit"), ref("MemoryTranslatedEnglishUnit")] }, minContains: 1,
            }],
          },
        },
      },
    },
  ],
} as const;

const storeEvidenceBranch = (applicable: boolean): Readonly<Record<string, unknown>> => ({
  oneOf: [
    {
      properties: {
        evidenceClass: { enum: ["E1a", "E1b"] },
        externalAttestation: { const: applicable ? "not_attested" : "not_applicable" },
        attestation: { type: "null" },
      },
      required: ["evidenceClass", "externalAttestation", "attestation"],
    },
    {
      properties: {
        evidenceClass: { const: "E1c" },
        externalAttestation: { const: applicable ? "attested" : "not_applicable" },
        attestation: nullable(ref("Attestation")),
      },
      required: ["evidenceClass", "externalAttestation"],
    },
    {
      properties: {
        evidenceClass: { const: "E2" },
        externalAttestation: { const: applicable ? "attested" : "not_applicable" },
        attestation: ref("Attestation"),
      },
      required: ["evidenceClass", "externalAttestation", "attestation"],
    },
  ],
});

const rawDefinitions: Readonly<Record<string, JsonSchema>> = {
  JsonValue: {
    anyOf: [
      { type: "null" }, { type: "boolean" }, { type: "number" }, { type: "string" },
      { type: "array", items: ref("JsonValue") },
      { type: "object", additionalProperties: ref("JsonValue") },
    ],
  },
  JsonObject: { type: "object", additionalProperties: ref("JsonValue") },
  NonEmptyArray: {
    type: "array", minItems: 1, items: ref("JsonValue"),
    $comment: "Serialisable generic domain; each live instantiation further constrains its item type.",
  },
  NonEmptyReadonlyArray: {
    type: "array", minItems: 1, items: ref("JsonValue"),
    $comment: "Serialisable generic domain; readonly affects TypeScript assignability, not the JSON shape. Each live instantiation further constrains its item type.",
  },
  NonEmptyString: { type: "string", minLength: 1 },
  Sha256Hex: { type: "string", pattern: "^[0-9a-f]{64}$" },
  Span: {
    type: "array",
    prefixItems: [{ type: "integer", minimum: 0 }, { type: "integer", minimum: 0 }],
    minItems: 2,
    maxItems: 2,
    $comment: "start <= end and source bounds are executable cross-object invariants.",
  },
  Grouping: {
    type: "array",
    minItems: 1,
    items: { type: "array", minItems: 1, items: { type: "integer", minimum: 0, maximum: 9007199254740991 } },
    $comment: "CHG-048/050: non-empty exact ordered partition of all owning units. Executable validation enforces index < owning units.length and flatten(grouping) === [0, 1, ..., units.length - 1]; malformed input is never repaired.",
  },
  Status: enumSchema(statusValues),
  Provenance: enumSchema(provenanceValues),
  ProducedProvenance: {
    ...enumSchema(producedProvenanceValues),
    $comment: "entity_record and external are public reserved values with no conformant v1 producer.",
  },
  Confidence: enumSchema(["high", "medium", "low", "none"]),
  EvidenceClass: enumSchema(evidenceClassValues),
  StoreEvidenceClass: enumSchema(storeEvidenceClassValues),
  FormKind: enumSchema(formKindValues),
  ExternalAttestation: enumSchema(["attested", "not_attested", "not_applicable"]),
  VariationKind: enumSchema(["lexical", "register", "sociophonetic", "sandhi", "uncertain"]),
  ReasonCode: enumSchema(reasonCodeValues),
  CautionCode: enumSchema(cautionCodeValues),
  DiagnosticCode: enumSchema([
    "LEXICON_MISSING_CAPABILITY", "WINDOW_CEILING_REACHED", "SOURCE_UNAVAILABLE",
    "IMPORT_VALIDATION_FAILED", "TERM_DIRECTIVE_DROPPED_OVERLAP", "PROVIDER_SNAPSHOT_INVALID",
  ]),
  TokenType: enumSchema(tokenTypes),
  EntityType: enumSchema(entityTypes),
  Attestation: strictObject(
    {
      scope: enumSchema(["individual", "institution", "place_instance", "class"]),
      sourceRef: ref("NonEmptyString"), asOf: ref("NonEmptyString"),
    },
    ["scope", "sourceRef", "asOf"],
  ),
  Versions: strictObject(
    {
      schemaVersion: { const: "1.0" }, contractVersion: { const: "5.0.16" },
      providerSnapshotId: { anyOf: [ref("Sha256Hex"), { type: "null" }] },
      engineVersion: ref("NonEmptyString"), lexiconVersion: ref("NonEmptyString"),
      rulesVersion: ref("NonEmptyString"), segmenterVersion: ref("NonEmptyString"),
      userDataVersion: { type: "integer", minimum: 0, maximum: 9007199254740991 },
    },
    [
      "schemaVersion", "contractVersion", "providerSnapshotId", "engineVersion",
      "lexiconVersion", "rulesVersion", "segmenterVersion", "userDataVersion",
    ],
  ),

  GroupedAlignment: strictObject(
    {
      span: ref("Span"),
      syllableIndices: {
        type: "array", minItems: 2, items: { type: "integer", minimum: 0 }, uniqueItems: true,
      },
    },
    ["span", "syllableIndices"],
  ),
  Syllable: strictObject(
    {
      span: { anyOf: [ref("Span"), { type: "null" }] }, jyutping: { type: "string" },
      initial: { type: "string" }, final: { type: "string" }, tone: enumSchema([1, 2, 3, 4, 5, 6]),
      syllabic: { type: "boolean" }, align: enumSchema(["exact", "spread", "grouped"]),
    },
    ["span", "jyutping", "initial", "final", "tone", "syllabic", "align"],
    {
      allOf: [{
        if: { properties: { align: { const: "grouped" } }, required: ["align"] },
        then: { properties: { span: { type: "null" } } },
        else: { properties: { span: ref("Span") } },
      }],
    },
  ),
  Reading: strictObject(
    {
      jyutping: { type: "string" }, syllables: { type: "array", items: ref("Syllable") },
      alignmentGroups: { type: "array", items: ref("GroupedAlignment") },
    },
    ["jyutping", "syllables", "alignmentGroups"],
  ),
  RomanisationUnit: strictObject(
    {
      id: ref("NonEmptyString"), span: ref("Span"), text: { type: "string" }, syllable: { type: "string" },
      role: enumSchema(["surname", "given", "prefix", "specific", "generic"]),
      provenance: ref("ProducedProvenance"), evidenceClass: ref("EvidenceClass"),
      externalAttestation: ref("ExternalAttestation"), scopeDowngrade: { const: "class_applied_to_individual" },
      sibilantClass: { type: "string" },
    },
    ["id", "span", "text", "syllable", "provenance", "evidenceClass", "externalAttestation"],
  ),
  VerbatimRomanisation: strictObject(
    { formKind: { const: "romanisation" }, assembled: { const: false }, text: { type: "string" } },
    ["formKind", "assembled", "text"],
  ),
  AssembledRomanisation: strictObject(
    {
      formKind: { const: "romanisation" }, assembled: { const: true },
      units: { type: "array", minItems: 1, items: ref("RomanisationUnit") }, grouping: ref("Grouping"),
    },
    ["formKind", "assembled", "units", "grouping"],
  ),
  Romanisation: { oneOf: [ref("VerbatimRomanisation"), ref("AssembledRomanisation")] },

  EnglishAssemblyRole: enumSchema(["surname", "given", "western_given", "prefix", "specific", "generic"]),
  CantoneseEnglishAssemblyRole: enumSchema(["surname", "given", "prefix", "specific", "generic"]),
  EnglishAssemblyUnitBase: strictObject(
    {
      id: ref("NonEmptyString"), span: ref("Span"), text: { type: "string" }, role: ref("EnglishAssemblyRole"),
      provenance: ref("ProducedProvenance"), evidenceClass: nullable(ref("EvidenceClass")),
      externalAttestation: ref("ExternalAttestation"), scopeDowngrade: { const: "class_applied_to_individual" },
    },
    ["id", "span", "text", "provenance", "evidenceClass", "externalAttestation"],
  ),
  RomanisedEnglishUnit: strictObject(
    {
      id: ref("NonEmptyString"), span: ref("Span"), kind: { const: "romanised" }, text: { type: "string" },
      role: ref("CantoneseEnglishAssemblyRole"), provenance: ref("ProducedProvenance"),
      evidenceClass: nullable(ref("EvidenceClass")), externalAttestation: ref("ExternalAttestation"),
      scopeDowngrade: { const: "class_applied_to_individual" }, syllable: { type: "string" },
      generated: { type: "boolean" }, sibilantClass: { type: "string" },
    },
    ["id", "span", "kind", "text", "provenance", "evidenceClass", "externalAttestation", "syllable", "generated"],
  ),
  LiteralEnglishUnit: strictObject(
    {
      id: ref("NonEmptyString"), span: ref("Span"), kind: { const: "literal" }, text: { type: "string" },
      role: ref("EnglishAssemblyRole"), provenance: ref("ProducedProvenance"),
      evidenceClass: nullable(ref("EvidenceClass")), externalAttestation: ref("ExternalAttestation"),
      scopeDowngrade: { const: "class_applied_to_individual" },
    },
    ["id", "span", "kind", "text", "provenance", "evidenceClass", "externalAttestation"],
  ),
  TranslatedEnglishUnit: strictObject(
    {
      id: ref("NonEmptyString"), span: ref("Span"), kind: { const: "translated" }, text: { type: "string" },
      role: ref("CantoneseEnglishAssemblyRole"), provenance: ref("ProducedProvenance"),
      evidenceClass: nullable(ref("EvidenceClass")), externalAttestation: ref("ExternalAttestation"),
      scopeDowngrade: { const: "class_applied_to_individual" },
    },
    ["id", "span", "kind", "text", "provenance", "evidenceClass", "externalAttestation"],
  ),
  EnglishAssemblyUnit: {
    oneOf: [ref("RomanisedEnglishUnit"), ref("LiteralEnglishUnit"), ref("TranslatedEnglishUnit")],
  },
  StyleApplicable: strictObject(
    {
      scope: { const: "givenName" },
      unitIds: { type: "array", minItems: 1, uniqueItems: true, items: ref("NonEmptyString") },
    },
    ["scope", "unitIds"],
  ),
  VerbatimEnglishForm: strictObject(
    { formKind: ref("FormKind"), assembled: { const: false }, text: { type: "string" } },
    ["formKind", "assembled", "text"],
  ),
  StyledPersonEnglishForm: strictObject(
    englishAssemblyBase,
    ["formKind", "assembled", "units", "grouping", "person", "styleApplicable"],
    {
      properties: { ...englishAssemblyBase, person: { const: true } },
      allOf: [
        ...englishAssemblyLegality.allOf,
        { properties: { units: { type: "array", contains: licensedGeneratedGivenUnit, minContains: 1 } } },
      ],
    },
  ),
  UnstyledPersonEnglishForm: strictObject(
    englishAssemblyBase,
    ["formKind", "assembled", "units", "grouping", "person"],
    {
      properties: { ...englishAssemblyBase, person: { const: true } },
      allOf: [absent("styleApplicable"), ...englishAssemblyLegality.allOf],
    },
  ),
  NonPersonEnglishForm: strictObject(
    englishAssemblyBase,
    ["formKind", "assembled", "units", "grouping", "person"],
    {
      properties: { ...englishAssemblyBase, person: { const: false } },
      allOf: [absent("styleApplicable"), ...englishAssemblyLegality.allOf],
    },
  ),
  AssembledEnglishFormBase: strictObject(
    englishAssemblyBase,
    ["formKind", "assembled", "units", "grouping"],
    englishAssemblyLegality,
  ),
  AssembledEnglishForm: {
    oneOf: [ref("StyledPersonEnglishForm"), ref("UnstyledPersonEnglishForm"), ref("NonPersonEnglishForm")],
  },
  EnglishForm: { oneOf: [ref("VerbatimEnglishForm"), ref("AssembledEnglishForm")] },

  InheritanceRef: {
    oneOf: [
      strictObject({ kind: { const: "analysis" }, entityId: ref("NonEmptyString") }, ["kind", "entityId"]),
      strictObject(
        { kind: { const: "documentContext" }, contextId: ref("NonEmptyString"), ref: ref("NonEmptyString") },
        ["kind", "contextId", "ref"],
      ),
    ],
  },
  EntityAnnotationRef: strictObject(
    {
      owner: { const: "entity" }, entityId: ref("NonEmptyString"),
      channel: enumSchema(["reading", "romanisation", "englishForm"]),
    },
    ["owner", "entityId", "channel"],
  ),
  TokenAnnotationRef: strictObject(
    {
      owner: { const: "token" }, tokenId: ref("NonEmptyString"),
      channel: enumSchema(["reading", "romanisation"]),
    },
    ["owner", "tokenId", "channel"],
  ),
  AnnotationRef: { oneOf: [ref("EntityAnnotationRef"), ref("TokenAnnotationRef")] },
  EntityRomanisationRef: strictObject(
    { owner: { const: "entity" }, entityId: ref("NonEmptyString"), channel: { const: "romanisation" } },
    ["owner", "entityId", "channel"],
  ),
  TokenRomanisationRef: strictObject(
    { owner: { const: "token" }, tokenId: ref("NonEmptyString"), channel: { const: "romanisation" } },
    ["owner", "tokenId", "channel"],
  ),
  RomanisationRef: { oneOf: [ref("EntityRomanisationRef"), ref("TokenRomanisationRef")] },
  DerivedFrom: strictObject(
    {
      layer: { const: "L3R" }, romanisationRef: ref("RomanisationRef"),
      fallbackReason: { const: "no_known_english_form" }, directStoreRead: { const: false },
    },
    ["layer", "romanisationRef", "fallbackReason", "directStoreRead"],
  ),

  CandidateReading: candidateDefinition("Reading", "not_applicable", true),
  CandidateRomanisation: candidateDefinition("Romanisation"),
  CandidateEnglishForm: candidateDefinition("EnglishForm"),
  CandidateTermRendering: candidateDefinition("TermRendering", "not_applicable"),
  CandidateBase: {
    anyOf: [
      candidateDefinition("Reading", "not_applicable", true, true),
      candidateDefinition("Romanisation", undefined, false, true),
      candidateDefinition("EnglishForm", undefined, false, true),
      candidateDefinition("TermRendering", "not_applicable", false, true),
    ],
  },
  InheritedCandidate: {
    allOf: [
      { anyOf: [ref("CandidateReading"), ref("CandidateRomanisation"), ref("CandidateEnglishForm"), ref("CandidateTermRendering")] },
      { properties: { provenance: { const: "inherited" } }, required: ["provenance", "inheritedFrom"] },
    ],
  },
  NonInheritedCandidate: {
    allOf: [
      { anyOf: [ref("CandidateReading"), ref("CandidateRomanisation"), ref("CandidateEnglishForm"), ref("CandidateTermRendering")] },
      { properties: { provenance: { enum: ["user_glossary", "convention_table", "lexicon", "rule_engine", "none"] } }, required: ["provenance"] },
    ],
  },
  Candidate: {
    anyOf: [ref("CandidateReading"), ref("CandidateRomanisation"), ref("CandidateEnglishForm"), ref("CandidateTermRendering")],
  },
  ValueReading: valueDefinition("Reading", "CandidateReading", { externalAttestation: "not_applicable" }),
  ValueRomanisation: valueDefinition("Romanisation", "CandidateRomanisation"),
  ValueEnglishForm: valueDefinition("EnglishForm", "CandidateEnglishForm", { derivedFrom: true }),
  ValueTermRendering: valueDefinition("TermRendering", "CandidateTermRendering", { externalAttestation: "not_applicable" }),
  Value: {
    anyOf: [ref("ValueReading"), ref("ValueRomanisation"), ref("ValueEnglishForm"), ref("ValueTermRendering")],
  },

  TokenSegment: strictObject(
    { matched: { type: "string" }, source: enumSchema(["lexicon", "user_glossary", "character", "forced"]) },
    ["matched", "source"],
  ),
  KeyTransform: strictObject(
    { from: { type: "string" }, to: { type: "string" }, kind: enumSchema(["variant_fold", "simplified_fold", "nfc"]) },
    ["from", "to", "kind"],
  ),
  Token: strictObject(
    {
      id: ref("NonEmptyString"), span: ref("Span"), text: { type: "string" }, type: ref("TokenType"),
      segment: ref("TokenSegment"), reading: ref("ValueReading"), romanisation: ref("ValueRomanisation"),
      keyTransform: ref("KeyTransform"),
    },
    ["id", "span", "text", "type", "reading", "romanisation"],
  ),
  DetectionEvidence: strictObject(
    {
      mechanism: enumSchema(["D1", "D2", "D3", "D4", "D5", "D6", "D7"]),
      span: ref("Span"), detail: { type: "string" },
    },
    ["mechanism"],
  ),
  PersonNameSurname: strictObject({ span: ref("Span"), compound: { type: "boolean" } }, ["span", "compound"]),
  PersonNamePart: strictObject({ span: ref("Span") }, ["span"]),
  PersonNameStructure: strictObject(
    {
      surname: ref("PersonNameSurname"), givenName: ref("PersonNamePart"), prefix: ref("PersonNamePart"),
      westernGiven: ref("PersonNamePart"), maidenSurname: ref("PersonNamePart"),
      order: enumSchema(["surname_first", "given_first"]),
      parseAlternatives: { type: "array", items: ref("PersonNameStructure") },
    },
    ["order"],
  ),
  Entity: strictObject(
    {
      id: ref("NonEmptyString"), span: ref("Span"), text: { type: "string" }, type: ref("EntityType"),
      primary: { type: "boolean" }, containedBy: ref("NonEmptyString"),
      englishFallbackPolicy: enumSchema(["romanisation_allowed", "prefer_original_recovery", "no_automatic_romanisation"]),
      structure: ref("PersonNameStructure"), detectionEvidence: { type: "array", items: ref("DetectionEvidence") },
      detectionConfidence: ref("Confidence"), reading: ref("ValueReading"),
      romanisation: ref("ValueRomanisation"), englishForm: ref("ValueEnglishForm"),
    },
    [
      "id", "span", "text", "type", "primary", "englishFallbackPolicy", "detectionEvidence",
      "detectionConfidence", "reading", "romanisation", "englishForm",
    ],
    {
      allOf: [{
        if: { properties: { type: { enum: personEntityTypes } }, required: ["type"] },
        else: absent("structure"),
      }],
    },
  ),
  EntityBoundaryCandidate: strictObject(
    {
      span: ref("Span"), text: { type: "string" }, type: ref("EntityType"),
      detectionEvidence: { type: "array", items: ref("DetectionEvidence") }, confidence: ref("Confidence"),
    },
    ["span", "text", "type", "detectionEvidence", "confidence"],
  ),
  AmbiguousRegion: strictObject(
    {
      id: ref("NonEmptyString"), span: ref("Span"), kind: { const: "entity_boundary" },
      alternatives: { type: "array", minItems: 2, items: ref("EntityBoundaryCandidate") }, ranked: { type: "boolean" },
    },
    ["id", "span", "kind", "alternatives", "ranked"],
  ),
  TermRendering: strictObject(
    {
      preferred: { type: "string" }, entryId: ref("NonEmptyString"),
      entryScope: enumSchema(["lexical", "phrase"]), note: { type: "string" },
    },
    ["preferred", "entryId", "entryScope"],
  ),
  TermResolution: strictObject(
    {
      span: ref("Span"), sourceText: { type: "string" }, entryScope: enumSchema(["lexical", "phrase"]),
      result: ref("ValueTermRendering"),
    },
    ["span", "sourceText", "entryScope", "result"],
  ),
  TermDirective: strictObject(
    {
      span: ref("Span"), sourceText: { type: "string" }, preferred: { type: "string" },
      entryScope: enumSchema(["lexical", "phrase"]), entryId: ref("NonEmptyString"),
      evidenceClass: ref("StoreEvidenceClass"), note: { type: "string" },
    },
    ["span", "sourceText", "preferred", "entryScope", "entryId", "evidenceClass"],
  ),
  Diagnostic: strictObject(
    {
      code: ref("DiagnosticCode"), severity: enumSchema(["info", "warning", "error"]),
      span: ref("Span"), message: { type: "string" }, data: ref("JsonObject"),
    },
    ["code", "severity", "message"],
  ),
  CreationDiagnostic: {
    allOf: [
      ref("Diagnostic"),
      {
        oneOf: [
          {
            properties: { code: { const: "LEXICON_MISSING_CAPABILITY" }, severity: { const: "warning" } },
            required: ["code", "severity"],
          },
          {
            properties: { code: { const: "PROVIDER_SNAPSHOT_INVALID" }, severity: { const: "error" } },
            required: ["code", "severity"],
          },
        ],
      },
      absent("span"),
    ],
    $comment: "Creation diagnostics have no source document and therefore omit span (§5.10/§5.14).",
  },
  AnalysisDiagnostic: {
    allOf: [
      ref("Diagnostic"),
      {
        type: "object",
        properties: {
          code: { enum: ["WINDOW_CEILING_REACHED", "SOURCE_UNAVAILABLE"] },
        },
        required: ["code"],
      },
    ],
    $comment: "Only current processText/content producer codes inhabit Analysis.diagnostics; reserved unassigned and other-channel codes remain outside it (§5.14).",
  },
  ProjectionDiagnostic: {
    allOf: [
      ref("Diagnostic"),
      {
        type: "object",
        properties: {
          code: { const: "TERM_DIRECTIVE_DROPPED_OVERLAP" },
          span: ref("Span"),
        },
        required: ["code", "span"],
      },
    ],
    $comment: "Exactly the projection-owned code; its span is the dropped TermDirective span (§5.12/§5.14).",
  },

  StoreName: enumSchema(["pronunciation", "translation", "hk_romanisation"]),
  StoreEntryScope: enumSchema(["lexical", "phrase", "entity"]),
  StoreMatch: enumSchema(["exact", "contextual"]),
  StoreMatchContext: strictObject({
    precededBy: { type: "array", items: { type: "string" } },
    followedBy: { type: "array", items: { type: "string" } },
    entityType: ref("EntityType"), documentTag: { type: "string" },
  }),
  StoreEntryBase: strictObject(
    {
      id: ref("NonEmptyString"), key: { type: "string" }, value: { type: "string" },
      caseSensitive: { type: "boolean" }, match: ref("StoreMatch"), context: ref("StoreMatchContext"),
      note: { type: "string" }, verifiedAt: { anyOf: [{ type: "string" }, { type: "null" }] },
      createdAt: { type: "string" }, updatedAt: { type: "string" }, revision: { type: "number" },
    },
    ["id", "key", "value", "caseSensitive", "match", "createdAt", "updatedAt", "revision"],
  ),
  ValidationError: strictObject(
    {
      code: ref("NonEmptyString"),
      path: { type: "array", items: { anyOf: [{ type: "string" }, { type: "number" }] } },
      message: { type: "string" },
    },
    ["code", "path", "message"],
  ),
  ValidStoreValidation: strictObject(
    { ok: { const: true }, errors: { type: "array", maxItems: 0 } },
    ["ok", "errors"],
  ),
  InvalidStoreValidation: strictObject(
    { ok: { const: false }, errors: { type: "array", minItems: 1, items: ref("ValidationError") } },
    ["ok", "errors"],
  ),
  StoreEntryShape: strictObject(
    {
      id: ref("NonEmptyString"), store: ref("StoreName"), key: { type: "string" }, value: { type: "string" },
      caseSensitive: { type: "boolean" }, match: ref("StoreMatch"), context: ref("StoreMatchContext"),
      note: { type: "string" }, verifiedAt: { anyOf: [{ type: "string" }, { type: "null" }] },
      createdAt: { type: "string" }, updatedAt: { type: "string" }, revision: { type: "number" },
      entryScope: ref("StoreEntryScope"), entityTypeHint: ref("EntityType"), formKind: ref("FormKind"),
      enabled: { type: "boolean" }, evidenceClass: ref("StoreEvidenceClass"),
      externalAttestation: ref("ExternalAttestation"), attestation: nullable(ref("Attestation")),
      validation: { oneOf: [ref("ValidStoreValidation"), ref("InvalidStoreValidation")] },
    },
    [
      "id", "store", "key", "value", "caseSensitive", "match", "createdAt", "updatedAt", "revision",
      "entryScope", "enabled", "evidenceClass", "externalAttestation", "validation",
    ],
  ),
  ApplicableStoreEvidence: storeEvidenceBranch(true),
  InapplicableStoreEvidence: storeEvidenceBranch(false),
  ValidStoreState: strictObject(
    { enabled: { type: "boolean" }, validation: ref("ValidStoreValidation") },
    ["enabled", "validation"],
  ),
  StoreScopeFields: {
    oneOf: [
      strictObject({ entryScope: { const: "entity" }, entityTypeHint: ref("EntityType") }, ["entryScope"]),
      strictObject({ entryScope: enumSchema(["lexical", "phrase"]) }, ["entryScope"]),
    ],
  },
  ValidStoreEntry: {
    allOf: [
      ref("StoreEntryShape"),
      { properties: { validation: ref("ValidStoreValidation") } },
      {
        oneOf: [
          {
            properties: { store: { const: "pronunciation" } }, required: ["store"],
            allOf: [absent("formKind"), ref("InapplicableStoreEvidence")],
          },
          {
            properties: { store: { const: "hk_romanisation" } }, required: ["store"],
            allOf: [absent("formKind"), ref("ApplicableStoreEvidence")],
          },
          {
            properties: { store: { const: "translation" }, entryScope: { const: "entity" } },
            required: ["store", "entryScope", "formKind"], allOf: [ref("ApplicableStoreEvidence")],
          },
          {
            properties: { store: { const: "translation" }, entryScope: { enum: ["lexical", "phrase"] } },
            required: ["store", "entryScope"],
            allOf: [absent("formKind"), ref("InapplicableStoreEvidence")],
          },
        ],
      },
      {
        if: { properties: { entryScope: { const: "entity" } }, required: ["entryScope"] },
        else: absent("entityTypeHint"),
      },
    ],
  },
  InvalidStoreEntry: {
    allOf: [
      ref("StoreEntryShape"),
      {
        properties: { enabled: { const: false }, validation: ref("InvalidStoreValidation") },
        required: ["enabled", "validation"],
      },
    ],
  },
  StoreEntry: { oneOf: [ref("ValidStoreEntry"), ref("InvalidStoreEntry")] },
  StoreListQuery: strictObject(
    { enabled: { type: "boolean" }, entryScope: ref("StoreEntryScope"), evidenceClass: ref("StoreEvidenceClass") },
  ),
  StoreSearchOptions: strictObject(
    {
      enabled: { type: "boolean" }, entryScope: ref("StoreEntryScope"),
      evidenceClass: ref("StoreEvidenceClass"), context: ref("StoreMatchContext"),
    },
  ),
  StoreEntryDraft: strictObject(
    {
      key: { type: "string" }, value: { type: "string" }, entryScope: ref("StoreEntryScope"),
      entityTypeHint: ref("EntityType"), formKind: ref("FormKind"), caseSensitive: { type: "boolean" },
      match: ref("StoreMatch"), context: ref("StoreMatchContext"), enabled: { type: "boolean" },
      evidenceClass: ref("StoreEvidenceClass"), externalAttestation: ref("ExternalAttestation"),
      attestation: nullable(ref("Attestation")), note: { type: "string" },
      verifiedAt: { anyOf: [{ type: "string" }, { type: "null" }] },
    },
    ["key", "value"],
  ),
  StoreEntryPatch: strictObject({
    key: { type: "string" }, value: { type: "string" }, entryScope: ref("StoreEntryScope"),
    entityTypeHint: ref("EntityType"), formKind: ref("FormKind"), caseSensitive: { type: "boolean" },
    match: ref("StoreMatch"), context: ref("StoreMatchContext"), enabled: { type: "boolean" },
    evidenceClass: ref("StoreEvidenceClass"), externalAttestation: ref("ExternalAttestation"),
    attestation: nullable(ref("Attestation")), note: { type: "string" },
    verifiedAt: { anyOf: [{ type: "string" }, { type: "null" }] },
  }),
  StoreCreateResult: strictObject(
    { entry: ref("StoreEntry"), conflicts: { type: "array", items: ref("StoreEntry") } },
    ["entry", "conflicts"],
  ),
  StoreExport: strictObject(
    {
      schemaVersion: { const: "1.0" }, store: ref("StoreName"), exportedAt: { type: "string" },
      engineVersion: { type: "string" }, entries: { type: "array", items: ref("StoreEntry") },
    },
    ["schemaVersion", "store", "exportedAt", "engineVersion", "entries"],
  ),
  StoreImportData: ref("JsonValue"),
  StoreImportMode: enumSchema(["preview", "apply"]),
  StoreImportAction: enumSchema(["add", "update", "conflict", "invalid"]),
  StoreImportRow: strictObject(
    {
      index: { type: "number" }, action: ref("StoreImportAction"), input: ref("JsonValue"),
      entry: ref("StoreEntry"), conflicts: { type: "array", items: ref("StoreEntry") },
      errors: { type: "array", items: ref("ValidationError") },
    },
    ["index", "action", "input", "conflicts", "errors"],
  ),
  ImportPreview: strictObject(
    {
      mode: { const: "preview" }, store: ref("StoreName"), writesApplied: { const: false },
      rows: { type: "array", items: ref("StoreImportRow") },
    },
    ["mode", "store", "writesApplied", "rows"],
  ),
  ImportResult: strictObject(
    {
      mode: { const: "apply" }, store: ref("StoreName"), writesApplied: { type: "boolean" },
      rows: { type: "array", items: ref("StoreImportRow") },
      userDataVersion: { type: "integer", minimum: 0, maximum: 9007199254740991 },
    },
    ["mode", "store", "writesApplied", "rows", "userDataVersion"],
  ),

  DebugOptions: strictObject({ lattice: { type: "boolean" }, trace: { type: "boolean" } }),
  ProcessOptions: strictObject({
    documentContext: ref("DocumentContext"),
    documentTags: {
      type: "array",
      items: { type: "string" },
      $comment: "Raw current-call labels. The optionsHash preimage uses [] for omission, exact deduplication, and ascending UTF-16 code-unit order; input duplicates/order remain legal (§5.10/§5.15).",
    },
    latinReadingPolicy: enumSchema(["none", "letter_names", "loanword_lexicon"]),
    numberReadingPolicy: enumSchema(["none", "digits", "cardinal"]),
    phoneticComponentHeuristic: { type: "boolean" }, debug: ref("DebugOptions"),
  }),
  EngineCreationFailure: strictObject(
    {
      ok: { const: false },
      engine: { type: "null" },
      diagnostics: {
        type: "array",
        minItems: 1,
        items: ref("CreationDiagnostic"),
        contains: {
          allOf: [
            ref("CreationDiagnostic"),
            {
              type: "object",
              properties: { code: { const: "PROVIDER_SNAPSHOT_INVALID" } },
              required: ["code"],
            },
          ],
        },
        minContains: 1,
      },
    },
    ["ok", "engine", "diagnostics"],
    {
      $comment: "The independently serialisable failure branch. EngineCreationResult/Success are executable API types because success carries a live Engine.",
    },
  ),
  JyutpingValidationResult: strictObject(
    { ok: { type: "boolean" }, errors: { type: "array", items: { type: "string" } } },
    ["ok", "errors"],
  ),

  MemorySyllable: strictObject(
    {
      jyutping: { type: "string" }, initial: { type: "string" }, final: { type: "string" },
      tone: enumSchema([1, 2, 3, 4, 5, 6]), syllabic: { type: "boolean" },
    },
    ["jyutping", "initial", "final", "tone", "syllabic"],
  ),
  MemoryReading: strictObject(
    { jyutping: { type: "string" }, syllables: { type: "array", items: ref("MemorySyllable") } },
    ["jyutping", "syllables"],
  ),
  MemoryUnit: strictObject(
    {
      text: { type: "string" }, syllable: { type: "string" },
      role: enumSchema(["surname", "given", "prefix", "specific", "generic"]),
      provenance: ref("ProducedProvenance"), evidenceClass: ref("EvidenceClass"),
      externalAttestation: ref("ExternalAttestation"), scopeDowngrade: { const: "class_applied_to_individual" },
    },
    ["text", "syllable", "provenance", "evidenceClass", "externalAttestation"],
  ),
  MemoryVerbatimRomanisation: strictObject(
    { formKind: { const: "romanisation" }, assembled: { const: false }, text: { type: "string" } },
    ["formKind", "assembled", "text"],
  ),
  MemoryAssembledRomanisation: strictObject(
    {
      formKind: { const: "romanisation" }, assembled: { const: true },
      units: { type: "array", minItems: 1, items: ref("MemoryUnit") }, grouping: ref("Grouping"),
    },
    ["formKind", "assembled", "units", "grouping"],
  ),
  MemoryRomanisation: { oneOf: [ref("MemoryVerbatimRomanisation"), ref("MemoryAssembledRomanisation")] },
  MemoryEnglishAssemblyUnitBase: strictObject(
    {
      text: { type: "string" }, role: ref("EnglishAssemblyRole"), provenance: ref("ProducedProvenance"),
      evidenceClass: nullable(ref("EvidenceClass")), externalAttestation: ref("ExternalAttestation"),
      scopeDowngrade: { const: "class_applied_to_individual" },
    },
    ["text", "provenance", "evidenceClass", "externalAttestation"],
  ),
  MemoryRomanisedEnglishUnit: strictObject(
    {
      kind: { const: "romanised" }, text: { type: "string" }, role: ref("CantoneseEnglishAssemblyRole"),
      provenance: ref("ProducedProvenance"), evidenceClass: nullable(ref("EvidenceClass")),
      externalAttestation: ref("ExternalAttestation"), scopeDowngrade: { const: "class_applied_to_individual" },
      syllable: { type: "string" }, generated: { type: "boolean" }, sibilantClass: { type: "string" },
    },
    ["kind", "text", "provenance", "evidenceClass", "externalAttestation", "syllable", "generated"],
  ),
  MemoryLiteralEnglishUnit: strictObject(
    {
      kind: { const: "literal" }, text: { type: "string" }, role: ref("EnglishAssemblyRole"),
      provenance: ref("ProducedProvenance"), evidenceClass: nullable(ref("EvidenceClass")),
      externalAttestation: ref("ExternalAttestation"), scopeDowngrade: { const: "class_applied_to_individual" },
    },
    ["kind", "text", "provenance", "evidenceClass", "externalAttestation"],
  ),
  MemoryTranslatedEnglishUnit: strictObject(
    {
      kind: { const: "translated" }, text: { type: "string" }, role: ref("CantoneseEnglishAssemblyRole"),
      provenance: ref("ProducedProvenance"), evidenceClass: nullable(ref("EvidenceClass")),
      externalAttestation: ref("ExternalAttestation"), scopeDowngrade: { const: "class_applied_to_individual" },
    },
    ["kind", "text", "provenance", "evidenceClass", "externalAttestation"],
  ),
  MemoryEnglishAssemblyUnit: {
    oneOf: [ref("MemoryRomanisedEnglishUnit"), ref("MemoryLiteralEnglishUnit"), ref("MemoryTranslatedEnglishUnit")],
  },
  MemoryStyleApplicable: strictObject(
    {
      scope: { const: "givenName" },
      unitIndices: { type: "array", minItems: 1, uniqueItems: true, items: { type: "integer", minimum: 0, maximum: 9007199254740991 } },
    },
    ["scope", "unitIndices"],
  ),
  MemoryVerbatimEnglishForm: strictObject(
    { formKind: ref("FormKind"), assembled: { const: false }, text: { type: "string" } },
    ["formKind", "assembled", "text"],
  ),
  MemoryStyledPersonEnglishForm: strictObject(
    memoryEnglishAssemblyBase,
    ["formKind", "assembled", "units", "grouping", "person", "styleApplicable"],
    {
      properties: { ...memoryEnglishAssemblyBase, person: { const: true } },
      allOf: [
        ...memoryEnglishAssemblyLegality.allOf,
        { properties: { units: { type: "array", contains: licensedGeneratedGivenUnit, minContains: 1 } } },
      ],
    },
  ),
  MemoryUnstyledPersonEnglishForm: strictObject(
    memoryEnglishAssemblyBase,
    ["formKind", "assembled", "units", "grouping", "person"],
    {
      properties: { ...memoryEnglishAssemblyBase, person: { const: true } },
      allOf: [absent("styleApplicable"), ...memoryEnglishAssemblyLegality.allOf],
    },
  ),
  MemoryNonPersonEnglishForm: strictObject(
    memoryEnglishAssemblyBase,
    ["formKind", "assembled", "units", "grouping", "person"],
    {
      properties: { ...memoryEnglishAssemblyBase, person: { const: false } },
      allOf: [absent("styleApplicable"), ...memoryEnglishAssemblyLegality.allOf],
    },
  ),
  MemoryAssembledEnglishFormBase: strictObject(
    memoryEnglishAssemblyBase,
    ["formKind", "assembled", "units", "grouping"],
    memoryEnglishAssemblyLegality,
  ),
  MemoryEnglishForm: {
    oneOf: [
      ref("MemoryVerbatimEnglishForm"), ref("MemoryStyledPersonEnglishForm"),
      ref("MemoryUnstyledPersonEnglishForm"), ref("MemoryNonPersonEnglishForm"),
    ],
  },
  MemoryChannelReading: memoryChannelDefinition("MemoryReading", "not_applicable"),
  MemoryChannelRomanisation: memoryChannelDefinition("MemoryRomanisation"),
  MemoryChannelEnglishForm: memoryChannelDefinition("MemoryEnglishForm"),
  MemoryChannel: {
    anyOf: [ref("MemoryChannelReading"), ref("MemoryChannelRomanisation"), ref("MemoryChannelEnglishForm")],
  },
  MemoryPersonName: strictObject(
    {
      surnameText: { type: "string" }, givenNameText: { type: "string" }, prefixText: { type: "string" },
      westernGivenText: { type: "string" }, maidenSurnameText: { type: "string" },
      compoundSurname: { type: "boolean" }, order: enumSchema(["surname_first", "given_first"]),
    },
    ["compoundSurname", "order"],
  ),
  EntityMemoryEntry: strictObject(
    {
      ref: ref("NonEmptyString"), text: { type: "string" }, aliases: { type: "array", items: { type: "string" } },
      type: ref("EntityType"), name: ref("MemoryPersonName"), reading: ref("MemoryChannelReading"),
      romanisation: ref("MemoryChannelRomanisation"), englishForm: ref("MemoryChannelEnglishForm"),
    },
    ["ref", "text", "type"],
    {
      allOf: [{
        if: { properties: { type: { enum: personEntityTypes } }, required: ["type"] },
        else: absent("name"),
      }],
    },
  ),
  DocumentContext: strictObject(
    {
      contextFormatVersion: { const: "1" }, id: ref("NonEmptyString"),
      entities: { type: "array", items: ref("EntityMemoryEntry") },
    },
    ["contextFormatVersion", "id", "entities"],
  ),

  StyleProfile: enumSchema(["hyphenated", "joined", "spaced", "hyphen_title", "surname_caps"]),
  GeneratedPersonNameStyle: enumSchema(["hyphenated", "joined"]),
  CasingProfile: enumSchema(["lower", "sentence", "title", "upper"]),
  AnnotationChannel: enumSchema(["reading", "romanisation", "englishForm"]),
  DisplayOptions: strictObject(
    {
      channels: { type: "array", items: ref("AnnotationChannel") }, romanisationCasing: ref("CasingProfile"),
      personNameStyle: ref("StyleProfile"), includeAlternatives: { type: "boolean" },
    },
    ["channels"],
  ),
  ProjectedAnnotation: strictObject(
    {
      ref: ref("AnnotationRef"), span: ref("Span"), sourceText: { type: "string" },
      rendered: { anyOf: [{ type: "string" }, { type: "null" }] }, status: ref("Status"),
      confidence: ref("Confidence"), alternatives: { type: "array", items: { type: "string" } },
      cautions: { type: "array", items: ref("CautionCode") },
    },
    ["ref", "span", "sourceText", "rendered", "status", "confidence", "alternatives", "cautions"],
  ),
  AnnotationProjection: strictObject(
    {
      schemaVersion: { type: "string" }, sourceHash: ref("Sha256Hex"), offsetUnit: { const: "utf16" },
      annotations: { type: "array", items: ref("ProjectedAnnotation") },
    },
    ["schemaVersion", "sourceHash", "offsetUnit", "annotations"],
  ),
  RenderedVariant: strictObject({ profile: ref("StyleProfile"), text: { type: "string" } }, ["profile", "text"]),
  DirectiveSettings: strictObject(
    { generatedPersonNameStyle: ref("GeneratedPersonNameStyle"), protectionConfidenceFloor: ref("Confidence") },
    ["generatedPersonNameStyle"],
  ),
  UnresolvedSemanticSpan: {
    oneOf: [
      strictObject({ span: ref("Span"), status: enumSchema(["ambiguous", "conflict"]) }, ["span", "status"]),
      strictObject(
        { span: ref("Span"), status: enumSchema(["unresolved", "unsupported"]), reason: ref("ReasonCode") },
        ["span", "status", "reason"],
      ),
    ],
  },
  ProtectedSpan: strictObject(
    {
      span: ref("Span"), entityId: ref("NonEmptyString"), entityType: ref("EntityType"),
      replacement: ref("NonEmptyString"), formKind: ref("FormKind"), assembled: { type: "boolean" },
      provenance: ref("ProducedProvenance"), evidenceClass: ref("EvidenceClass"),
      externalAttestation: ref("ExternalAttestation"), protection: enumSchema(["strict", "preferred", "fallback"]),
      styleApplied: nullable(ref("GeneratedPersonNameStyle")), rationale: { type: "string" },
    },
    [
      "span", "entityId", "entityType", "replacement", "formKind", "assembled", "provenance",
      "evidenceClass", "externalAttestation", "protection", "styleApplied", "rationale",
    ],
    {
      allOf: [
        {
          if: { properties: { styleApplied: { not: { type: "null" } } }, required: ["styleApplied"] },
          then: {
            properties: {
              assembled: { const: true }, entityType: { enum: personEntityTypes },
              formKind: { enum: ["romanisation", "hybrid"] },
            },
          },
        },
        {
          if: { properties: { assembled: { const: false } }, required: ["assembled"] },
          then: { properties: { styleApplied: { type: "null" } } },
        },
        {
          if: {
            properties: { evidenceClass: { enum: ["E1a", "E1b", "E1c", "E2", "E3", "E4"] } },
            required: ["evidenceClass"],
          },
          then: { properties: { protection: { const: "strict" } } },
        },
        {
          if: { properties: { evidenceClass: { const: "E5" } }, required: ["evidenceClass"] },
          then: { properties: { protection: { const: "preferred" } } },
        },
        {
          if: { properties: { evidenceClass: { enum: ["E6", "E7"] } }, required: ["evidenceClass"] },
          then: { properties: { protection: { const: "fallback" } } },
        },
      ],
    },
  ),
  TranslationDirectives: strictObject(
    {
      schemaVersion: { type: "string" }, sourceHash: ref("Sha256Hex"), offsetUnit: { const: "utf16" },
      styleUsed: ref("GeneratedPersonNameStyle"), protectedSpans: { type: "array", items: ref("ProtectedSpan") },
      termDirectives: { type: "array", items: ref("TermDirective") },
      unresolvedSemanticSpans: { type: "array", items: ref("UnresolvedSemanticSpan") },
      diagnostics: { type: "array", items: ref("ProjectionDiagnostic") },
    },
    [
      "schemaVersion", "sourceHash", "offsetUnit", "styleUsed", "protectedSpans", "termDirectives",
      "unresolvedSemanticSpans", "diagnostics",
    ],
  ),

  ForcedTerm: strictObject(
    { span: ref("Span"), text: { type: "string" }, entryId: ref("NonEmptyString") },
    ["span", "text", "entryId"],
  ),
  LatticeEdgeBase: strictObject(
    { index: { type: "integer", minimum: 0 }, span: ref("Span"), text: { type: "string" }, matchedKey: { type: "string" } },
    ["index", "span", "text"],
  ),
  ReferenceLatticeEdge: strictObject(
    {
      index: { type: "integer", minimum: 0 }, span: ref("Span"), text: { type: "string" }, matchedKey: { type: "string" },
      source: enumSchema(["lexicon", "character"]),
    },
    ["index", "span", "text", "source"],
  ),
  StoreLatticeEdge: strictObject(
    {
      index: { type: "integer", minimum: 0 }, span: ref("Span"), text: { type: "string" }, matchedKey: { type: "string" },
      source: enumSchema(["user_glossary", "forced"]), entryId: ref("NonEmptyString"),
    },
    ["index", "span", "text", "source", "entryId"],
  ),
  LatticeEdge: { oneOf: [ref("ReferenceLatticeEdge"), ref("StoreLatticeEdge")] },
  LatticeAlternative: strictObject(
    { edgeIndices: { type: "array", minItems: 1, items: { type: "integer", minimum: 0 } } },
    ["edgeIndices"],
  ),
  Lattice: strictObject(
    {
      window: ref("Span"), edges: { type: "array", items: ref("LatticeEdge") },
      alternatives: { type: "array", items: ref("LatticeAlternative") },
    },
    ["window", "edges", "alternatives"],
  ),
  LexiconReading: strictObject(
    {
      jyutping: { type: "string" }, variation: ref("VariationKind"),
      frequency: { anyOf: [{ type: "number" }, { type: "null" }] }, sourceRef: { type: "string" },
    },
    ["jyutping", "frequency", "sourceRef"],
  ),
  LexEntry: strictObject(
    { key: { type: "string" }, readings: { type: "array", items: ref("LexiconReading") } },
    ["key", "readings"],
  ),
  CharEntry: strictObject(
    { character: { type: "string" }, readings: { type: "array", items: ref("LexiconReading") } },
    ["character", "readings"],
  ),
  LexiconCoverage: strictObject(
    {
      writtenCantonese: { type: "boolean" }, hkscs: { type: "boolean" },
      wordLevel: { type: "boolean" }, frequencies: { type: "boolean" },
    },
    ["writtenCantonese", "hkscs", "wordLevel", "frequencies"],
  ),

  CanonicalInt64Decimal: { type: "string", pattern: canonicalInt64Pattern },
  CanonicalInteger: strictObject({ __int: ref("CanonicalInt64Decimal") }, ["__int"]),
  CanonicalArray: { type: "array", items: ref("CanonicalValue") },
  CanonicalObject: {
    type: "object", propertyNames: { not: { const: "__int" } }, additionalProperties: ref("CanonicalValue"),
  },
  CanonicalValue: {
    oneOf: [
      { type: "null" }, { type: "boolean" }, { type: "string" }, ref("CanonicalInteger"),
      ref("CanonicalArray"), ref("CanonicalObject"),
    ],
  },
  ProviderSnapshotEntry: strictObject(
    { inputHash: ref("Sha256Hex"), output: ref("CanonicalValue") },
    ["inputHash", "output"],
  ),
  ProviderSnapshot: strictObject(
    {
      id: ref("Sha256Hex"), snapshotFormatVersion: { const: "1" }, providerId: ref("NonEmptyString"),
      providerConfigHash: ref("NonEmptyString"), createdAt: ref("NonEmptyString"),
      entries: { type: "array", items: ref("ProviderSnapshotEntry") },
    },
    ["id", "snapshotFormatVersion", "providerId", "providerConfigHash", "createdAt", "entries"],
    { $comment: "Duplicate inputHash values and id recomputation are executable invariants; hashing is outside Range 0A." },
  ),
  ResolutionTraceTarget: {
    oneOf: [
      strictObject({ kind: { const: "annotation" }, ref: ref("AnnotationRef") }, ["kind", "ref"]),
      strictObject({ kind: { const: "termResolution" }, index: { type: "integer", minimum: 0 } }, ["kind", "index"]),
    ],
  },
  ResolutionTraceStep: strictObject(
    {
      ordinal: { type: "number" }, source: { type: "string" },
      outcome: enumSchema(["hit", "miss", "not_applicable", "conflict"]),
      entryIds: { type: "array", items: { type: "string" } },
      evidenceClass: ref("EvidenceClass"), detail: { type: "string" },
    },
    ["ordinal", "source", "outcome"],
  ),
  ResolutionTrace: strictObject(
    {
      target: ref("ResolutionTraceTarget"), layer: enumSchema(["L2", "L3R", "L3E", "L4"]),
      chain: { type: "string" }, steps: { type: "array", items: ref("ResolutionTraceStep") },
    },
    ["target", "layer", "chain", "steps"],
  ),
  DebugSegmentation: strictObject(
    { inertAmbiguities: { type: "number" }, consequentialAmbiguities: { type: "number" } },
    ["inertAmbiguities", "consequentialAmbiguities"],
  ),
  RulePackAccuracy: strictObject(
    {
      syllableExactMatch: { type: "number" }, wholeNameExactMatch: { type: "number" },
      sibilantSubAccuracy: { type: "number" }, measuredAgainst: { type: "string" },
    },
    ["syllableExactMatch", "wholeNameExactMatch", "sibilantSubAccuracy", "measuredAgainst"],
  ),
  DebugPayload: strictObject(
    {
      lattice: ref("Lattice"), trace: { type: "array", items: ref("ResolutionTrace") },
      segmentation: ref("DebugSegmentation"), rulePackAccuracy: ref("RulePackAccuracy"),
    },
    ["segmentation"],
  ),
  Analysis: strictObject(
    {
      schemaVersion: { const: "1.0" }, offsetUnit: { const: "utf16" }, source: { type: "string" },
      sourceHash: ref("Sha256Hex"), versions: ref("Versions"), optionsHash: ref("Sha256Hex"),
      documentContextUsed: { type: "boolean" }, tokens: { type: "array", items: ref("Token") },
      entities: { type: "array", items: ref("Entity") }, regions: { type: "array", items: ref("AmbiguousRegion") },
      termResolutions: { type: "array", items: ref("TermResolution") },
      diagnostics: { type: "array", items: ref("AnalysisDiagnostic") }, debug: ref("DebugPayload"), ext: ref("JsonObject"),
    },
    [
      "schemaVersion", "offsetUnit", "source", "sourceHash", "versions", "optionsHash", "documentContextUsed",
      "tokens", "entities", "regions", "termResolutions", "diagnostics",
    ],
  ),
};

/**
 * JSON Schema applies keyword families only to matching instance types. Add
 * those explicit types to conditional/allOf fragments as well, so the emitted
 * document compiles under Ajv's strictTypes mode instead of relying on the
 * type of a sibling $ref to be inferred across applicators.
 */
function materialiseKeywordTypes(input: unknown): unknown {
  if (Array.isArray(input)) return input.map(materialiseKeywordTypes);
  if (input === null || typeof input !== "object") return input;

  const mapped = Object.fromEntries(
    Object.entries(input).map(([key, value]) => [key, materialiseKeywordTypes(value)]),
  );
  if (mapped.type !== undefined) return mapped;

  const keys = new Set(Object.keys(mapped));
  const objectKeywords = [
    "properties", "required", "additionalProperties", "propertyNames",
    "minProperties", "maxProperties", "dependentRequired", "dependentSchemas",
  ];
  const arrayKeywords = [
    "items", "prefixItems", "contains", "minItems", "maxItems", "uniqueItems",
    "minContains", "maxContains",
  ];
  const stringKeywords = ["pattern", "minLength", "maxLength"];
  const numberKeywords = ["minimum", "maximum", "exclusiveMinimum", "exclusiveMaximum", "multipleOf"];

  if (objectKeywords.some((keyword) => keys.has(keyword))) return { type: "object", ...mapped };
  if (arrayKeywords.some((keyword) => keys.has(keyword))) return { type: "array", ...mapped };
  if (stringKeywords.some((keyword) => keys.has(keyword))) return { type: "string", ...mapped };
  if (numberKeywords.some((keyword) => keys.has(keyword))) return { type: "number", ...mapped };
  return mapped;
}

const definitions = materialiseKeywordTypes(rawDefinitions) as Readonly<Record<string, JsonSchema>>;

/** Every serialisable public declaration, with generics materialised over live roots. */
export const PUBLIC_SCHEMA_ROOTS = [
  "JsonValue", "NonEmptyArray", "NonEmptyReadonlyArray", "TokenType", "EntityType", "Versions", "Analysis", "AmbiguousRegion", "EntityBoundaryCandidate",
  "Value", "ValueReading", "ValueRomanisation", "ValueEnglishForm", "ValueTermRendering",
  "ExternalAttestation", "Attestation", "CandidateBase", "InheritedCandidate", "NonInheritedCandidate", "Candidate",
  "CandidateReading", "CandidateRomanisation", "CandidateEnglishForm", "CandidateTermRendering",
  "Status", "Provenance", "Confidence", "EvidenceClass", "StoreEvidenceClass", "FormKind", "VariationKind",
  "ReasonCode", "CautionCode", "Token", "Reading", "Syllable", "GroupedAlignment", "Romanisation",
  "VerbatimRomanisation", "AssembledRomanisation", "RomanisationUnit", "Entity", "EnglishForm",
  "VerbatimEnglishForm", "AssembledEnglishForm", "AssembledEnglishFormBase", "StyledPersonEnglishForm",
  "UnstyledPersonEnglishForm", "NonPersonEnglishForm", "EnglishAssemblyUnit", "EnglishAssemblyRole",
  "CantoneseEnglishAssemblyRole", "EnglishAssemblyUnitBase", "RomanisedEnglishUnit", "LiteralEnglishUnit",
  "TranslatedEnglishUnit", "DetectionEvidence", "PersonNameStructure", "AnnotationRef", "EntityAnnotationRef",
  "TokenAnnotationRef", "RomanisationRef", "EntityRomanisationRef", "TokenRomanisationRef", "DerivedFrom",
  "InheritanceRef", "TermResolution", "TermRendering", "TermDirective", "StoreName", "StoreEntryScope", "StoreMatch",
  "StoreMatchContext", "StoreEntryBase", "StoreScopeFields", "ApplicableStoreEvidence", "InapplicableStoreEvidence",
  "ValidStoreState", "ValidStoreEntry", "InvalidStoreEntry", "StoreEntry", "ValidationError", "StoreListQuery",
  "StoreSearchOptions", "StoreEntryDraft", "StoreEntryPatch", "StoreCreateResult", "StoreExport", "StoreImportData",
  "StoreImportMode", "StoreImportAction", "StoreImportRow", "ImportPreview", "ImportResult", "JyutpingValidationResult",
  "EngineCreationFailure",
  "DebugOptions", "ProcessOptions", "DocumentContext", "EntityMemoryEntry", "MemoryChannel", "MemoryPersonName",
  "MemoryReading", "MemoryRomanisation", "MemoryEnglishForm", "MemoryUnit", "MemoryEnglishAssemblyUnit",
  "MemoryEnglishAssemblyUnitBase", "MemoryRomanisedEnglishUnit", "MemoryLiteralEnglishUnit", "MemoryTranslatedEnglishUnit",
  "MemoryAssembledEnglishFormBase", "MemoryStyledPersonEnglishForm", "MemoryUnstyledPersonEnglishForm",
  "MemoryNonPersonEnglishForm", "StyleProfile", "GeneratedPersonNameStyle", "CasingProfile", "AnnotationChannel",
  "DisplayOptions", "AnnotationProjection", "ProjectedAnnotation", "RenderedVariant", "DirectiveSettings",
  "TranslationDirectives", "UnresolvedSemanticSpan", "ProtectedSpan", "ForcedTerm", "Lattice", "LatticeEdgeBase",
  "LatticeEdge", "ReferenceLatticeEdge", "StoreLatticeEdge", "LatticeAlternative", "LexiconReading", "LexEntry",
  "CharEntry", "LexiconCoverage", "ProviderSnapshot", "ProviderSnapshotEntry", "CanonicalValue",
  "CanonicalInt64Decimal", "CanonicalInteger", "CanonicalObject", "DiagnosticCode", "Diagnostic", "ResolutionTrace",
  "ResolutionTraceTarget", "ResolutionTraceStep", "DebugPayload",
] as const;

/** Function/method-bearing interfaces intentionally outside the serialisable schema. */
export const NON_SERIALISABLE_PUBLIC_TYPES = [
  "StoreApi", "EngineCreationResult", "EngineCreationSuccess", "Engine", "Segmenter", "Lexicon", "EngineConfig",
  "ExternalProvider",
] as const;

export const DEFERRED_NON_V1_DECLARATIONS = [
  "getJyutping", "detectEntities", "getHKRomanisation", "resolvePronunciation", "resolveTranslation", "TermContext",
] as const;

export const contractSchema: ContractSchemaDocument = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://hklang.invalid/schema/contract/5.0.16",
  title: "Hong Kong Cantonese Language Lab public contract 5.0.16",
  description: "Strict current-producer schema for every serialisable live v1 public root, with the CHG-050 affected Stage-0 surface rematerialised.",
  $comment: "§5 v0.16 is authoritative. Cross-object, lifecycle and preimage rules that JSON Schema cannot express are enforced by executable validators/tests.",
  $ref: "#/$defs/Analysis",
  $defs: definitions,
};
