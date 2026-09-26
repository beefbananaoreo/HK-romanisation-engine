# Bounded contract validation audit

## Authority and inspected state

This audit continues the tested candidate at `eb9ab3c89061b07adb2bf46d39a9a6bd15b97cc8`
on top of main `c0074c9db17e5ed111f8ab86740c6dd20faed27c`. The starting candidate
passed 221 contract tests and six reporter regressions. The repository README,
CHG-050 no-op correction, obligation documentation and fixtures, public types,
schema, validators, test harness, recent commits, and packet v1.7 were inspected
before changes. No later project handoff or executable linguistic engine is
present in this repository.

Packet §5 governs public shapes; §7 governs decision semantics. Existing
romanisation conventions were not reinterpreted. The changes below correct
implementations of already documented rules. They do not implement pronunciation,
lexicon lookup, segmentation, romanisation generation, rendering, persistence, or
the canonical encoder.

## Reproduced defects and corrections

| Area | Previous behaviour | Correction and authority |
| --- | --- | --- |
| Candidate evidence | A downgraded class candidate could claim E1a or medium support despite schema rejection | Require E6 and optional low/none support; omitted support remains legal (§5.5, §7.3.1–3) |
| Confidence ceilings | Rule-generated candidates could carry medium support; inherited values and memory could carry high confidence; rule-generated memory could exceed low | Apply the existing provenance ceilings consistently in runtime and schema (§7.3.1–2, INV-5). Local high-confidence values remain legal |
| Inherited channels | A reference could resolve to an entry without a selected matching channel, or increase that channel's confidence | Check the available antecedent's matching selected channel and cap selected confidence/optional support at its confidence and medium (RULE-API-22/24, RULE-ENT-9). An omitted DocumentContext remains a shape-only check |
| Reading alignment | Reversed or overlapping individual spans, and overlaps between individual/group spans, passed | Enforce individual source order and non-overlap across the union of alignment spans; preserve legal gaps (INV-14, §3.2.1) |
| UTF-16 alignment | Whole tokens could contain syllable/group boundaries inside surrogate pairs, variation sequences, or combining sequences | Pass the source into alignment validation for selected and alternative readings (INV-4, T-JP-041, G3). Do not normalize or replace text |
| Lattice source bounds | A window extending beyond source length passed because `slice` silently truncates | Validate the window against the supplied source; preserve source-independent geometry validation (§5.13) |
| Sparse/malformed collections | Holes could bypass callbacks in readings, lattice paths, alternatives, memory entities, and import rows; primitive alignment groups were ignored | Visit missing slots and reject them through existing structural issue paths; no repair, compaction, or inference |
| Annotation projection | Altered verbatim annotations and invented rendered text for null selected values passed | Enforce exact known verbatim strings and null when no selected value exists (§5.11, RULE-API-6/10). Assembled rendering stays deferred |
| Snapshot boundary | An array could be coerced into a valid-looking snapshot ID; shape-valid snapshots were assumed semantically valid and could not fail creation | Require primitive lowercase hash strings without coercion; permit identity failure when identity is unverified (RULE-API-20, §5.10/5.13). Known malformed snapshots still cannot create a successful engine |
| Supporting schema roots | CandidateBase incorrectly required full-candidate provenance; creation diagnostic severities and empty protected replacements were too permissive | Materialize the declared base separately; enforce warning/error code pairing and non-empty replacement (CandidateBase in §5.5, §5.10, INV-17). Generic diagnostics and ordinary form text remain unchanged |
| Test runner | Deleted test sources could still pass via stale compiled JavaScript | Require all four original source suites, discover additions from source, remove ignored build output, and require fresh emitted tests. Skip/TODO failures apply to harness regressions too |
| Static obligations | Dangling references, duplicate/missing gate IDs, and stale authority metadata could retain an integrity PASS | Verify packet bytes/hash and both metadata sources, the exact gate set, fixture references, and complete cross-runtime case coverage |

## Compatibility and schema evidence

The public TypeScript contract, packet, package manifests, dependency lock, and
obligation fixture contents are unchanged. The same-ID update-only import no-op
behaviour remains intact. No new public fields, enum members, or linguistic rules
are introduced. Runtime validators reject previously accepted data that violates
existing structural or confidence rules; snapshot failure and CandidateBase fixes
also restore previously rejected legal cases.

Fourteen derived schema definitions are corrected: `CandidateBase`, the four
`Candidate*` value specializations, `CreationDiagnostic`, the three `MemoryChannel*`
definitions, `ProtectedSpan`, and the four `Value*` specializations. Full candidates
still require provenance and the appropriate inheritance reference; base records
do not. `scripts/check-surface-delta.mjs` lists these corrections explicitly alongside
the original CHG-050 delta. Compared with the historical 5.0.14 baseline, 158
unrelated definitions remain unchanged. Historical baseline files are not rewritten.

Legacy tests that treated unverified snapshot identity as verified, omitted a
required antecedent channel, or supplied excessive inherited confidence were
corrected to represent lawful fixtures; their original structural assertions remain.

## Verification

- 263 contract tests pass, including 42 added in this pass. Strict type checking,
  regenerated schema/types, stable results, and exact generated bytes are checked.
- Ten reporter/verification-harness regressions pass, including four added here.
- Eleven Python mutation regressions pass. They exercise stale packet metadata,
  changed packet bytes, invalid references/gates, duplicate cross-runtime coverage,
  and refusal to run with disabled assertions.
- Static obligations still report 25 cases, 27 coverage rows, and 103 verified
  literal UTF-16 values. They remain rendering obligations, not rendering results.
- Negative regressions were exercised against the pre-fix implementations before
  the fixes. Independent reassessment covered schema/runtime parity, including
  1,503 canonical-value cases, and the new alignment and inheritance checks.

Run all commands in the README to reproduce verification. Tests use synthetic
structural fixtures; their Chinese text and reading fields are not new linguistic
gold or attestation claims.

## Investigated and deliberately unchanged

- **Implementation bugs** are the structural, schema, and verification defects
  above. None was classified merely because another Cantonese convention exists.
- **Unsupported inputs:** lone surrogates and unusual code units remain exact
  content. This audit verifies preservation and safe spans, not a reading for them.
- **Unresolvable ambiguity:** simplified/traditional alternatives, polyphones,
  number readings, bearer spelling, and ambiguous name structure were not guessed.
  There is no resolver or lexicon in this checkout to measure or repair.
- **Intentional conventions:** Basic-Latin-only matching, exact document-tag set
  normalization, no source normalization, grouped unit ordering, and the five
  declared presentation profiles are preserved. Broader Unicode case folding is
  not silently substituted for the current Basic-Latin witness.
- **Legitimate alternative readings/conventions:** no reading, spelling table,
  ts/ch or s/sh convention, name joining convention, or gold fixture was replaced.
- Canonical integer endpoints/grammar, null/ordinary objects, source-independent
  snapshot shape, store evidence/quarantine and update-only no-op semantics were
  checked without changing their settled rules. Hash verification remains outside
  a shape-only validator.
- A projection's completeness cannot be inferred without its display settings or
  confidence floor. Those missing inputs were not invented to tighten cardinality.
- No measured performance defect justified a rewrite, dependency change, or
  replacement of the existing architecture.

## Open decisions and unavailable work

The relationship between mixed group/individual alignment order and syllable-array
positions needs a precise rule before further tightening: §3.2.1 describes ordered
spans, while §5.6 explicitly orders groups and their member indices but does not
state that group indices are consecutive or how interleaving maps onto source
order. This audit checks unambiguous individual order and all interval overlaps;
it does not invent a contiguity rule for group membership.

The global `givenNameJoin` default and segmenter selection (DEC-…-017) remain
documented decisions. Wider linguistic accuracy work requires the actual accepted
implementation and licensed lexical/gold resources. Historical R2/Range-0B and
accepted S2-P1–P5 artifacts referenced by the packet are outside this repository,
so their external suites were not rerun. This audit supplies no Stage-2 closure,
independent Control credit, S2-P6 authorization, or Reader-readiness claim.

After successive implementation and reassessment rounds, no further demonstrated
high-value defect remains queued in the audited boundary. This is not a claim of
exhaustive correctness. The next substantial pass should begin with newly available
implementation/source artifacts or clarification of the open alignment rule,
rather than inventing linguistic behaviour in this contract-only package.
