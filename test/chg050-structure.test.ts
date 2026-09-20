import assert from "node:assert/strict";
import test from "node:test";
import { Ajv2020, type ValidateFunction } from "ajv/dist/2020.js";
import { contractSchema } from "../src/schema/contract-schema.js";
import { validateAnalysisStructure, validateDocumentContextSemantics, validateEnglishForm, validateRomanisation, type ValidationResult } from "../src/validators.js";
import { analysisFixture, assembledFixture, documentContextFixture, groupingCrossFieldFailures, groupingShapeFailures, groupingSurfaces, type GroupingSurface, type ObjectValue } from "./chg050-structure-fixtures.js";

const ajv = new Ajv2020({ strict: true, strictRequired: false, allErrors: true });
ajv.addSchema(contractSchema);
function schema(name: string): ValidateFunction {
  const validator = ajv.getSchema(`${contractSchema.$id}#/$defs/${name}`);
  assert.ok(validator, `Missing ${name} schema`);
  return validator;
}
function checkRuntime(surface: GroupingSurface, form: ObjectValue): ValidationResult {
  if (surface.startsWith("Memory")) return validateDocumentContextSemantics(documentContextFixture(surface, form));
  return surface === "Romanisation" ? validateRomanisation(form) : validateEnglishForm(form);
}
function check(surface: GroupingSurface, form: ObjectValue, schemaExpected: boolean, runtimeExpected: boolean): void {
  const before = structuredClone(form);
  const validate = schema(surface);
  assert.equal(validate(form), schemaExpected, `${surface} schema: ${JSON.stringify(validate.errors)}`);
  assert.deepEqual(form, before, "schema may not repair/default the supplied form");
  const result = checkRuntime(surface, form);
  assert.equal(result.ok, runtimeExpected, `${surface} runtime: ${JSON.stringify(result.issues)}`);
  assert.deepEqual(form, before, "runtime may not sort, deduplicate, fill, default or otherwise mutate");

  const wrapped = surface.startsWith("Memory") ? documentContextFixture(surface, form) : analysisFixture(surface, form);
  const wrappedBefore = structuredClone(wrapped);
  const rootValidator = schema(surface.startsWith("Memory") ? "DocumentContext" : "Analysis");
  assert.equal(rootValidator(wrapped), schemaExpected, `${surface} wrapped schema: ${JSON.stringify(rootValidator.errors)}`);
  const wrappedResult = surface.startsWith("Memory") ? validateDocumentContextSemantics(wrapped) : validateAnalysisStructure(wrapped);
  assert.equal(wrappedResult.ok, runtimeExpected, `${surface} wrapped runtime: ${JSON.stringify(wrappedResult.issues)}`);
  assert.deepEqual(wrapped, wrappedBefore, "owner validation may not mutate its input");
}

for (const surface of groupingSurfaces) {
  test(`T-API-055/057 G28/G30 ${surface}: all complete ordered three-unit partitions accepted`, () => {
    for (const grouping of [[[0], [1], [2]], [[0, 1, 2]], [[0, 1], [2]], [[0], [1, 2]]]) {
      check(surface, { ...assembledFixture(surface), grouping }, true, true);
    }
    check(surface, assembledFixture(surface, 1), true, true);
  });
  for (const [label, grouping] of groupingShapeFailures) {
    test(`T-API-055/057 ${surface}: schema and runtime reject ${label}`, () => {
      check(surface, { ...assembledFixture(surface), grouping }, false, false);
    });
  }
  for (const [label, grouping] of groupingCrossFieldFailures) {
    test(`T-API-055/057 ${surface}: runtime rejects cross-field ${label}`, () => {
      check(surface, { ...assembledFixture(surface), grouping }, true, false);
    });
  }
  test(`T-API-055/057 ${surface}: absent/empty units and sparse arrays fail closed`, () => {
    for (const units of [undefined, null, [], "units"]) check(surface, { ...assembledFixture(surface), units }, false, false);
    const holes: Array<[string, unknown]> = [
      ["units", new Array(3)], ["grouping", new Array(1)],
      ["grouping", [new Array(3)]], ["grouping", [[0, , 2]]],
    ];
    for (const [key, value] of holes) check(surface, { ...assembledFixture(surface), [key]: value }, false, false);
  });
  test(`G7 ${surface}: exact assembled discriminant and forbidden canonical text`, () => {
    for (const assembled of [undefined, null, 1, "true"]) check(surface, { ...assembledFixture(surface), assembled }, false, false);
    check(surface, { ...assembledFixture(surface), text: "forbidden" }, false, false);
    for (const formKind of ["official_name", "translation", "native_original"]) {
      check(surface, { ...assembledFixture(surface), formKind }, false, false);
    }
  });
  test(`G7 ${surface}: verbatim exact UTF-16 text and no units/grouping`, () => {
    const form = { formKind: "romanisation", assembled: false, text: "mIx-É\ud800e\u0301" };
    check(surface, form, true, true);
    for (const extra of [{ units: [] }, { grouping: [] }]) check(surface, { ...form, ...extra }, false, false);
    check(surface, { ...form, text: undefined }, false, false);
  });
}

for (const surface of ["EnglishForm", "MemoryEnglishForm"] as const) {
  const memory = surface.startsWith("Memory");
  const refKey = memory ? "unitIndices" : "unitIds";
  function styled(refs: unknown): ObjectValue {
    return { ...assembledFixture(surface, 5), styleApplicable: { scope: "givenName", [refKey]: refs } };
  }
  test(`G16/G30 ${surface}: style refs resolve by position; non-contiguous licences accepted`, () => {
    check(surface, styled(memory ? [1, 3, 4] : ["u1", "u3", "u4"]), true, true);
    check(surface, styled(memory ? [1, 2] : ["u1", "u2"]), true, true);
    if (!memory) {
      const form = styled(["z", "a"]);
      const units = form.units as ObjectValue[];
      units[1]!.id = "z";
      units[2]!.id = "a";
      check(surface, form, true, true);
    }
  });
  test(`G16/G30 ${surface}: empty, missing, duplicate, unordered or unresolved refs rejected without repair`, () => {
    check(surface, styled([]), false, false);
    check(surface, styled(undefined), false, false);
    check(surface, styled(memory ? [1, 1] : ["u1", "u1"]), false, false);
    check(surface, styled(memory ? [2, 1] : ["u2", "u1"]), true, false);
    check(surface, styled(memory ? [5] : ["missing"]), true, false);
    if (!memory) {
      const ambiguousId = styled(["u1"]);
      (ambiguousId.units as ObjectValue[])[2]!.id = "u1";
      check(surface, ambiguousId, true, false);
    }
    check(surface, styled(new Array(1)), false, false);
    check(surface, { ...styled(memory ? [1] : ["u1"]), person: false }, false, false);
    check(surface, { ...styled(memory ? [1] : ["u1"]), person: "true" }, false, false);
    const wrongScope = styled(memory ? [1] : ["u1"]);
    (wrongScope.styleApplicable as ObjectValue).scope = "surname";
    check(surface, wrongScope, false, false);
    const wrongKind = styled(memory ? [1] : ["u1"]);
    (wrongKind.styleApplicable as ObjectValue)[memory ? "unitIds" : "unitIndices"] = memory ? ["u1"] : [1];
    check(surface, wrongKind, false, false);
  });
  test(`G16/G30 ${surface}: only generated romanised given units are eligible`, () => {
    for (const unitPatch of [{ generated: false }, { role: "surname" }, { role: "specific" }, { role: undefined }]) {
      const form = styled(memory ? [1, 2] : ["u1", "u2"]);
      Object.assign((form.units as ObjectValue[])[1]!, unitPatch);
      // Cross-reference eligibility cannot be encoded by the structural schema.
      check(surface, form, true, false);
    }
    for (const kind of ["literal", "translated"]) {
      const form = styled(memory ? [1, 2] : ["u1", "u2"]);
      const unit = (form.units as ObjectValue[])[1]!;
      unit.kind = kind;
      delete unit.syllable;
      delete unit.generated;
      form.formKind = "hybrid";
      check(surface, form, true, false);
    }
  });
  test(`G7/G30 ${surface}: legal person/non-person mixtures and verbatim isolation`, () => {
    const unstyled = assembledFixture(surface);
    check(surface, unstyled, true, true);
    check(surface, { ...unstyled, person: false }, true, true);
    for (const kind of ["literal", "translated"]) {
      const hybrid = assembledFixture(surface);
      const unit = (hybrid.units as ObjectValue[])[2]!;
      unit.kind = kind;
      delete unit.syllable;
      delete unit.generated;
      hybrid.formKind = "hybrid";
      check(surface, hybrid, true, true);
      check(surface, { ...hybrid, person: false }, true, true);
      check(surface, { ...hybrid, formKind: "romanisation" }, false, false);
    }
    check(surface, { ...unstyled, formKind: "hybrid" }, false, false);
    const onlyLiteral = assembledFixture(surface);
    for (const unit of onlyLiteral.units as ObjectValue[]) {
      unit.kind = "literal";
      delete unit.generated;
      delete unit.syllable;
    }
    check(surface, { ...onlyLiteral, formKind: "hybrid" }, false, false);
    check(surface, { ...onlyLiteral, formKind: "romanisation" }, false, false);
    check(surface, { ...unstyled, styleVariants: [] }, false, false);
    const exact = { formKind: "hybrid", assembled: false, text: "mIx-É\ud800e\u0301" };
    for (const extra of [{ person: true }, { styleApplicable: { scope: "givenName", [refKey]: memory ? [0] : ["u0"] } }, { styleVariants: [] }]) {
      check(surface, { ...exact, ...extra }, false, false);
    }
  });
}

test("T-API-057 MemoryEnglishForm: style-reference integer domain is exact at runtime", () => {
  for (const index of [-1, 0.5, Number.NaN, Infinity, -Infinity, Number.MAX_SAFE_INTEGER + 1, 1n, "1", null, true, { __int: "1" }]) {
    const form = { ...assembledFixture("MemoryEnglishForm"), styleApplicable: { scope: "givenName", unitIndices: [index] } };
    check("MemoryEnglishForm", form, false, false);
  }
});

test("T-API-057: actual schema contains non-empty units/groupings/inner groups and exact scalar constraints", () => {
  function definition(name: string): ObjectValue {
    const value = contractSchema.$defs[name];
    assert.ok(value && typeof value === "object");
    return value as ObjectValue;
  }
  const grouping = definition("Grouping");
  const inner = grouping.items as ObjectValue;
  const scalar = inner.items as ObjectValue;
  assert.equal(grouping.type, "array");
  assert.equal(grouping.minItems, 1);
  assert.equal(inner.type, "array");
  assert.equal(inner.minItems, 1);
  assert.equal(scalar.type, "integer");
  assert.equal(scalar.minimum, 0);
  assert.equal(scalar.maximum, Number.MAX_SAFE_INTEGER);
  for (const name of ["AssembledRomanisation", "StyledPersonEnglishForm", "UnstyledPersonEnglishForm", "NonPersonEnglishForm", "MemoryAssembledRomanisation", "MemoryStyledPersonEnglishForm", "MemoryUnstyledPersonEnglishForm", "MemoryNonPersonEnglishForm"]) {
    const properties = definition(name).properties as Record<string, ObjectValue>;
    assert.equal(properties.units!.type, "array", name);
    assert.equal(properties.units!.minItems, 1, name);
    assert.equal(properties.grouping!.$ref, "#/$defs/Grouping", name);
  }
  for (const [name, field] of [["StyleApplicable", "unitIds"], ["MemoryStyleApplicable", "unitIndices"]] as const) {
    const refs = (definition(name).properties as Record<string, ObjectValue>)[field]!;
    assert.equal(refs.minItems, 1);
    assert.equal(refs.uniqueItems, true);
  }
});

test("T-API-030 CHG-050: exact presentation enums preserve narrow directive style", () => {
  for (const [name, expected] of [
    ["StyleProfile", ["hyphenated", "joined", "spaced", "hyphen_title", "surname_caps"]],
    ["CasingProfile", ["lower", "sentence", "title", "upper"]],
    ["GeneratedPersonNameStyle", ["hyphenated", "joined"]],
  ] as const) {
    assert.deepEqual((contractSchema.$defs[name] as ObjectValue).enum, expected);
    const validate = schema(name);
    for (const value of expected) assert.equal(validate(value), true);
    for (const value of [undefined, null, "", "default", "TITLE", "unknown"]) assert.equal(validate(value), false);
  }
  for (const value of ["spaced", "hyphen_title", "surname_caps"]) assert.equal(schema("GeneratedPersonNameStyle")(value), false);
});
