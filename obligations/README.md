# CHG-050 Step 1 — static contract obligations

Authority: `spec/HKLanguageLabPacket-v1.7.md`, 752,484 bytes, SHA-256 `0781cd1ccc9d94e46b553f51cd8f6b66b63bb3edd11cc279dce18468558db505`; packet 1.7, §5 v0.16, public contract 5.0.16, serialised schemaVersion `"1.0"`.

`case-fixtures.json` contains 25 explicit rendering cases, four structural obligation descriptors, and the complete later cross-runtime comparison obligation. `coverage-map.json` maps the 27 requested test/gate IDs to their applicable structural, rendering, historical-regression or instrumentation sub-obligations. Authority references use the verified packet's original line numbers and section labels.

These files contain data only. No rendering function, ASCII casing function, projection, engine, linguistic resolver or canonical encoder is implemented or executed here. Materialising expected output literals does not establish that any renderer conforms.

The rendering cases include the five canonical profiles; adjacent and separated licensed runs; a forced surname/given space inside one grouping word; non-person and unstyled branches; mixed literal/romanised/translated content; all four casing profiles; exact verbatim English and Romanisation; and empty, ordered and duplicate variants. Synthetic transport cases retain punctuation, non-ASCII letters, decomposed combining marks and lone high/low surrogates. Their outputs derive only from the exact presentation rules and make no linguistic or attestation claim. Additional grouped-word cases exercise first-ASCII-letter ownership without changing literal text.

Rendering inputs are explicitly labelled semantic projections: `unitFacts` and `unitTexts` are fixture-description fields, not new public API fields. They record only the supplied text, kind, role, generation, grouping and licensing facts relevant to rendering. Missing linguistic, span and provenance fields are not invented. A later authorised renderer test must instantiate complete public fixtures from verified sources; these descriptions must not be fed directly to public API validation as though they were complete forms.

Expected result strings are literal data. Where an output is given explicitly by the packet, `expectedBasis` says so; direct presentation-rule derivations and synthetic transport inputs are labelled separately. `utf16beCodeUnitsHex` records the literal expected string's UTF-16 code units, including lone surrogates. It is not the tagged, length-prefixed canonical encoding, does not replace the accepted encoder and is not evidence of cross-runtime rendering.

Structural descriptors specify the four grouping-bearing assembled surfaces, non-empty arrays, exact ordered partitions, branch closure, eligible/resolvable/unique/increasing style references, and the exact profile domains. Non-finite scalar names are harness instructions for actual runtime numbers, not public string values or invented sentinels. Rejection must not mutate, sort, deduplicate, repair or default input.

Status boundaries:

- `STRUCTURAL_EXECUTION_REQUIRED`: a structural assertion that the producer's actual schema/validator tests must execute. Root's `STEP1_REPORT.md` and stable test output record that execution. These static files do not assert execution.
- `STRUCTURAL_EXECUTED`: reserved for actual passing structural evidence in the producer report; it never conveys rendering credit.
- `RENDERING_OBLIGATION_ONLY`: expected outputs and later conformance requirements have been materialised; no renderer was run.
- `DEFERRED_INSTRUMENTATION_OBLIGATION`: G14/G15 need later pipeline/projection instrumentation and remain unexecuted here.
- `HISTORICAL_REGRESSION_EXECUTION_REQUIRED`: unchanged reference checks remain applicable; the style-reference delta alone does not close complete G16.

G35 and T-API-064 require two independent conforming renderer runtimes, identical ordered UTF-16 results and identical result-string bytes under the existing §5.15.2 encoder. This entire runtime obligation is deferred. No full rendering-gate PASS, independent compatibility disposition, Control credit, S2-P6 authorisation or Reader work is claimed.
