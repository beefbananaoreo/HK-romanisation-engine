# Hong Kong Cantonese Language Lab — Implementation Packet

**Packet ID:** HKLANG-PACKET
**Packet version:** 1.7
**Status:** **CHG-050 style-rendering executable semantic closure applied to public contract `5.0.16`.** The accepted S2-P6 bounded contract-defect finding is closed at the specification level only. CHG-050 performs no implementation, modifies no accepted S2-P1–P5 artefact, and leaves formal Stage 2 **OPEN**. No S2-P6 implementation began; the stopped S2-P6 authority-audit attempt is not resumed here and may restart only after the ordered affected Stage-0 schema/validator regression, bounded S2-P1 cache-identity regression, S2-P2–P5 compatibility rebase, and independent control pass. The canonical encoder and `analysisCacheKey` field membership remain unchanged. All sections **§1–§12 are written**. **§5 is authoritative for public schema shape**; **§7 is authoritative for decision state**. Historical status is in the change log (§0.3).

**Version wording.** Three independent numbers: **packet revision** (currently **1.7**), **§5 section revision** (currently **v0.16**, the packet's editorial revision of that section), and the **public contract version** (currently **`5.0.16`**, the identifier an implementation declares in `Versions.contractVersion`). They are not the same object and do not advance together. The serialised public `schemaVersion` remains **`"1.0"`**. Earlier versions named in the change log are history, not current state.
**Date started:** 2026-08-28
**Author context:** Produced by an agent with *no access* to the author's private Google Docs Reader web app. Nothing in this packet is derived from inspecting that Reader. Every statement about the Reader is explicitly hypothetical and confined to sections labelled as such.

---

## 0. How to read this packet

### 0.1 Status labels (normative for the whole packet)

Every non-obvious claim, rule or design element carries one of these labels. If a statement is unlabelled, inherit the label of its enclosing block; if the enclosing block is unlabelled, treat it as RECOMMENDED.

| Label | Meaning | How a later agent should treat it |
|---|---|---|
| **CONFIRMED** | Standards-based, externally verifiable, or a definitional fact about a published scheme (e.g. Jyutping tone numbering). Not a design choice. | Do not change without external evidence. Changing it means the packet was wrong about the world. |
| **RECOMMENDED** | A design decision made by this packet. Defensible, internally consistent, but a judgement call. | May be overridden after inspecting the real Reader or on better linguistic grounds. Record the override in the change log. |
| **HEURISTIC** | Behaviour that is probabilistic, approximate, or convention-guessing. Correctness is not guaranteed even when the implementation is correct. | Must be surfaced to the user as uncertain. Never presented as fact in UI or API. |
| **UNRESOLVED** | A genuine open question. No default is being silently applied; a provisional default may be named but is flagged. | Must be answered (or explicitly deferred as configurable) before the affected code is considered final. |
| **OPTIONAL** | Enhancement outside the minimum viable engine. | Safe to omit in v1. |

### 0.2 Identifier conventions

| Prefix | Meaning | Example |
|---|---|---|
| `INV-n` | Core invariant. Testable. Violating one is a bug, not a preference. | INV-1 |
| `DEC-LANG-YYYYMMDD-NNN` | Decision register entry. Mirrors the author's existing `DEC-CANON-…` convention so the two registers can coexist without ID collision. | DEC-LANG-20260828-001 |
| `RULE-n` | Named linguistic or resolution rule. | RULE-HKR-4 |
| `T-n` | Test corpus / test plan item. | T-JP-012 |
| `ST-x` | Status/state vocabulary member. | ST-generated |

### 0.3 Change log

Earlier sections are stable. If later work contradicts an earlier rule, the contradiction is stated here explicitly, the earlier rule is revised in place, and the revision is logged. Silent rewriting is prohibited.

| Date | Change | Sections affected | Reason |
|---|---|---|---|
| 2026-08-28 | Packet created; §1 written. | §1 | Initial. |
| 2026-08-28 | **CHG-001.** DEC-LANG-20260828-002 (three-axis provenance / status / confidence; `verified` as a property of stored records) marked ACCEPTED. | §1.7, §1.10 | Author decision. |
| 2026-08-28 | **CHG-002.** DEC-LANG-20260828-001 accepted *in principle but amended*. The finding that an entity's English surface form is broader than HK Romanisation stands. The proposed remedy is withdrawn: `englishForm` must **not** absorb or replace HK Romanisation. Cantonese reading/Jyutping, HK-style romanisation, and attested/preferred English surface form remain three separately addressable model elements even when their text coincides. Final schema shape (`englishForm` + `hkRomanisation`, a general `forms[]`, or another clean model) is deferred to §5. | §1.2.3, §1.10, §2.8 | Author decision. |
| 2026-08-28 | **CHG-003.** RULE-SCOPE-1 demoted from RECOMMENDED to **UNRESOLVED**. The engine must not assume HK Romanisation applies only to recognised entities; a general "show HK romanisation" mode over arbitrary Cantonese-readable text is a live product possibility and is investigated in §2.2. | §1.2.4, §2.1, §2.2 | Author decision. |
| 2026-08-28 | **CHG-004.** The L2/L3 asymmetry claim softened. The distinction retained is that Cantonese pronunciation is phonological while conventional English/name spelling is socially attested and not mechanically derivable from pronunciation. The stronger claim — that L2 ambiguity is *inherently* epistemic and L3 ambiguity *inherently* ontic — is withdrawn as overstated: Cantonese readings exhibit genuine variation, and an entity's actual English spelling is often simply unknown to the engine. | §1.2.1, §1.2.2 | Author correction. |
| 2026-08-28 | **CHG-005.** Factual correction. The earlier text implied as CONFIRMED that HK identity-document English names are assigned by mechanical application of Hong Kong Government Cantonese Romanisation. No authoritative current primary source establishes this; the Immigration Department's own published FAQ does not address romanisation methodology. Bearer/registered/documented personal-name spelling is now treated as an **attested identity fact**, categorically distinct from generated HK-style romanisation. | §1.2.2, §2.3, §2.4 | Author correction; verified against primary source. |
| 2026-08-28 | **CHG-006.** Packet-wide evidence standard added (§0.5), prioritising authoritative primary sources for conventional-name attestation. | §0.5, §2.3 | Author directive. |
| 2026-08-28 | §2 written. | §2 | Scheduled work. |
| 2026-08-28 | **CHG-007.** DEC-LANG-20260828-009 **ACCEPTED, amended presentation semantics.** General non-entity HK-style romanisation is a v1 user-visible capability. The engine preserves generated/attested/ambiguous provenance; the Lab and debug views must expose it clearly; ordinary presentation (including a future Reader) is **not** required to label every annotation "generated" and may remain visually quiet. | §1.2.4, §2.1, §2.2.5, §2.12 | Author decision. |
| 2026-08-28 | **CHG-008.** DEC-LANG-20260828-010 **ACCEPTED at the engine-data level.** Where the historical ts/ch or s/sh distinction cannot be justified, all materially plausible candidates are retained and the result is `ambiguous`. A historical prior may *rank* candidates but may not convert ambiguity into factual resolution. This is a statement about engine data, **not** a requirement that every consumer display all candidates inline; presentation policy is separate. | §2.2.2, §2.12 | Author decision. |
| 2026-08-28 | **CHG-009.** DEC-LANG-20260828-012 **REJECTED as a global-default inference.** 梁知遙 → *Leung Chiyiu* specifies the desired form for that particular entity; it does not establish `concat_title` as the global joining convention. It is reclassified as an explicit entity/glossary override (or creator-canonical form). The global `givenNameJoin` default returns to **UNRESOLVED** pending corpus evidence or an explicit product decision. | §2.4.4, §2.8.1, §2.11, §2.12 | Author decision. |
| 2026-08-28 | **CHG-010.** Removed the residual §1 claim that an "HK Romanisation" display mode must show *Nathan Road* for 彌敦道. Jyutping, generated HK-style romanisation and attested English surface form are three channels; the English surface form does not silently replace the romanisation. | §1.2.3 | Consistency fix. |
| 2026-08-28 | **CHG-011.** Layer model updated: **L3** is now a family — **L3R** (HK-style romanisation, applicable to any Cantonese-readable span) and **L3E** (attested/preferred entity English surface form). Numbering preserved; channels not collapsed. | §1.2.1, §1.4 | Consistency fix. |
| 2026-08-28 | **CHG-012.** Chain B step 1 corrected: it consults the **translation / English-form glossary** only. The HK Romanisation glossary feeds Chains A and C only. Cross-store application requires an explicit user action or an explicitly typed entry (INV-12). | §2.6 | Consistency fix. |
| 2026-08-28 | **CHG-013.** User-glossary evidence semantics refined. A user override has highest **output precedence** but does not by itself constitute **external attestation**. Evidence class E1 is split into E1a user preference, E1b creator-canonical form, E1c bearer assertion; documentary/registered evidence remains E2. | §2.3.1, §2.8.1 | Consistency fix. |
| 2026-08-28 | **CHG-014.** Claim about the government "never publishing its method" refined against primary evidence. The **policy** is published (2019 LegCo reply: transliteration in Cantonese Romanisation, or literal translation where a common Chinese/English term exists); what is absent is a **complete public modern algorithm** from which all government spellings could be reproduced from Jyutping. M1 is accordingly redescribed as an *engine-defined HK-style generated romanisation*, not a claim to reproduce an official algorithm. | §1.2.2, §2.2.1, §2.2.5 | Factual refinement. |
| 2026-08-28 | **CHG-015.** Presentation decisions removed from the M1 linguistic mapping. The engine returns **structured romanised units with spans**; capitalisation, word grouping, sentence casing, hyphenation and inline/ruby layout are presentation-layer concerns, except where intrinsic to an attested entity form. General prose is no longer required to capitalise every syllable. | §2.2.4, §2.8.1 | Consistency fix. |
| 2026-08-28 | **CHG-016.** RULE-HKR-13 and DEC-…-015 amended: structured/debug exports must preserve provenance and the Lab must make generated status visible, but plain-text copy is **not** forced to append `[generated]` by default; provenance markers become an explicit copy/export option. | §2.9, §2.12 | Author decision. |
| 2026-08-28 | **CHG-017.** Removed *Leung Tsz-yiu* as an asserted alternative for 梁知遙, and removed the `sibilant_class_unknown` caution from that example. 知 is classifiable (知-series → *ch-*), and the illustration must not manufacture ambiguity that the evidence does not support. | §2.8.1, §2.11 | Correctness fix. |
| 2026-08-28 | **CHG-018.** §1 scope and terminology entries that defined HK Romanisation as proper-noun-only updated for consistency with accepted DEC-…-009. | §1.3.1, §1.4 | Consistency fix. |
| 2026-08-28 | §3 written. | §3 | Scheduled work. |
| 2026-08-28 | **CHG-019.** DEC-LANG-20260828-017 **REOPENED → UNRESOLVED**, pending §8 dependency evaluation and §6 benchmark. The earlier rationale — that Cantonese-specific statistical resources are too scarce and that statistical segmenters are necessarily Standard-Written-Chinese-biased — is withdrawn as too broad. A fixed statistical model satisfies INV-7; determinism alone does not select maximum matching. The §3 lattice and data contract are unaffected: the segmentation *implementation* must be replaceable behind a stable interface. | §3.4.2, §3.12 | Author correction. |
| 2026-08-28 | **CHG-020.** The 任 surname example corrected. 任 is not presented as having one uniquely determined surname reading. The broader finding stands — entity classification can condition pronunciation — with the added qualification that **entity classification does not necessarily collapse all pronunciation ambiguity**. This strengthens DEC-…-019. | §3.4.5 | Author correction. |
| 2026-08-28 | **CHG-021.** Hong Kong Digital Policy Office / CCLI pronunciation resources added to the §8 candidate list (not selected): HKSCS Cantonese Pronunciation Reference Table; *Cantonese Pronunciation List of the Characters for Computers*; HKSCS character information. | §3.11 | Author directive. |
| 2026-08-28 | **CHG-022.** New §0.6 records **author-supplied constraints from the existing Reader** — an existing GPT-based translation workflow (the engine must have **no** LLM/Anthropic dependency), an existing unknown-proper-name → HK-romanisation fallback policy, and an existing user-selectable Hyphenated/Joined style toggle for *generated* personal-name fallbacks. These are given requirements the engine must be able to serve, not proposals, and not a licence to redesign the Reader. | §0.6, §4 | Author-supplied product constraint. |
| 2026-08-28 | §4 written. | §4 | Scheduled work. |
| 2026-08-28 | **CHG-023.** *(Patch A)* D1 / RULE-ENT-4 amended. A key existing in a user store **does not** by itself imply the span is an entity. Store entries gain `entryScope: lexical \| phrase \| entity` and, where entity-scoped, an optional `entityTypeHint`. Only entity-scoped entries contribute D1 detection evidence. INV-12 preserved. | §4.3, §4.7 | Author correction. |
| 2026-08-28 | **CHG-024.** *(Patch B)* The translation glossary is **not** redefined as an entity-name-only store. Entity-scoped entries enter Chain B; lexical/phrase entries are **L4 translation guidance** for an external consumer and never trigger entity detection. The engine still performs no machine translation and has no LLM dependency. | §4.7, §4.9, §5 | Author correction. |
| 2026-08-28 | **CHG-025.** *(Patch C)* Chain A → Chain B fallback provenance corrected. A Chain A result consumed as an English fallback is **not necessarily rule-generated** — it may be a user glossary form, creator-canonical, bearer-attested, a conventional whole-entity romanisation, or class-level convention. The fallback now **preserves the L3R source's material properties** (provenance, evidence class, status, `externallyAttested`, verbatim-vs-assembled, style applicability, source reference). `storeRead` renamed **`directStoreRead`** — it asserts that Chain B did not itself read the HK Romanisation store, not that the value has no upstream store influence. Regression test T-ENT-048 added. | §4.9, §4.13 | Author correction. |
| 2026-08-28 | **CHG-026.** *(Patch D)* Structural contradiction between style-variant output and single-`replacement` protected spans resolved. `processText()` returns a **style-neutral** analysis; a **pure projection helper** turns it plus consumer settings into concrete protected/replacement spans. Switching Hyphenated ↔ Joined re-projects only — no re-segmentation, no re-detection, no re-reading, no re-romanisation, no refetch. Consistent with INV-10 and settles DEC-…-016. | §4.10, §4.11, §5 | Author correction. |
| 2026-08-28 | **CHG-027.** *(Patch E)* **Form mechanism separated from evidence/authority.** The old `kind` enum conflated the two, producing contradictions such as `kind: conventional_romanisation` + `evidenceClass: E1b` + `externallyAttested: false` for a creator-canonical form. Replaced by `formKind ∈ { romanisation, official_name, native_original, translation, hybrid }` (linguistic mechanism) plus `assembled: boolean` (verbatim vs engine-assembled), with authority carried entirely by `provenance` / `evidenceClass` / `externallyAttested` / `status`. `bearer_registered`, `conventional_romanisation` and `generated_romanisation` are **withdrawn as mechanism values**. Mapping table in §4.16. **§5 is authoritative** wherever an earlier example still shows the old vocabulary. | §1.2.3, §2.6, §2.8, §4, §5 | Author correction. |
| 2026-08-28 | **CHG-028.** *(Patch F)* Entity-type `romanisable: boolean` **withdrawn** — it wrongly implied general L3R was unavailable. Replaced by `englishFallbackPolicy ∈ { romanisation_allowed, prefer_original_recovery, no_automatic_romanisation }`, which governs **Chain B's automatic fallback only** and never disables general L3R annotation. | §4.2, §4.5.3, §4.9, §4.12, §4.13 | Author correction. |
| 2026-08-28 | **CHG-029.** *(Patch G)* DEC-…-025 amended. An optional explicit `documentContext` is part of the **v1** API contract, not a deferred extension. Ambient cross-call memory remains hard-excluded. Omitted ⇒ intra-call memory only; supplied ⇒ explicit input, participates in the cache key, inherited values stay provenance-marked and confidence-capped. Supports chunked document processing while preserving INV-7. | §4.6, §4.14, §5 | Author decision. |
| 2026-08-28 | **CHG-030.** *(Patch H)* Residual Chain B step "Literal translation (translation subsystem, §4)" removed. The engine performs no full-sentence or free semantic translation. It resolves stored lexical/phrase translations, resolves attested English entity forms, exposes structured translation directives, and exposes unresolved semantic spans for an external consumer. | §2.6, §4.9 | Author correction. |
| 2026-08-28 | **CHG-031.** *(Patch I)* Stale superseded text corrected: the §1 illustrative payload realigned with CHG-017 and CHG-027; statements that common nouns cannot receive HK-style romanisation removed; the `out_of_scope` example replaced; §3.13's max-matching recommendation aligned with the reopened DEC-…-017; §2.9's mandatory-inline-display wording aligned with CHG-008; §2.3.2's "conventional match" definition corrected so user preference and creator-canonical evidence are not mislabelled as external convention; stale forward-looking pointers in §1.11 updated. | §1.5.1, §1.7, §1.11, §2.3.2, §2.9, §3.13 | Consistency fix. |
| 2026-08-28 | §5 written — **schema freeze v0.1**. DEC-…-001 and DEC-…-016 settled. | §5 | Scheduled work. |
| 2026-08-28 | **CHG-032 — §5 v0.2, SCHEMA FREEZE CORRECTED.** Nine internal contradictions in the v0.1 contract fixed before any test suite is built against it. v0.1 was not implementable as written; this is recorded as a correction, not as a revision of a working contract. (1) `Romanisation` and `EnglishForm` become **discriminated unions** on `assembled` — verbatim forms carry exact `text`, assembled forms carry `units`/`grouping` and **no canonical text**. (2) `styleVariants` **removed** from core Analysis; `@hklang/style` is the sole source of rendering. (3) `protectionConfidenceFloor` **moved** out of `ProcessOptions` into `DirectiveSettings` — it no longer touches `Analysis`, `optionsHash` or the cache key. (4) `Candidate<T>` **carries its own evidence** so ambiguity and conflict are explainable without recomputation. (5) `status: fallback` **narrowed** to mean the value was produced by a lower-certainty mechanism *within its own layer*; cross-layer routing is recorded only by `derivedFrom.fallbackReason`. (6) `externallyAttested: boolean` **replaced** by tri-state `externalAttestation: attested \| not_attested \| not_applicable`, so an L2 reading is not forced to claim `false`. (7) RULE-API-9 amended: consumers tolerate unknown enum values but **must not coerce them into known semantics**. (8) Opaque `RomanisationUnit.id` added and `romanisationRef` replaced by a typed `{ entityId, channel }` reference — no string-path parsing. (9) The contract is versioned `contractVersion: "5.0.2"`. | §5, §5.18 | Author correction. |
| 2026-08-28 | §6 written. | §6 | Scheduled work. |
| 2026-08-28 | **CHG-033 — §6 v0.2, measurement semantics corrected.** Seven fixes so §8 compares dependencies against a logically valid benchmark. (1) **`testRole: conformance \| benchmark \| observation` added**, separate from `goldStatus`: truth-availability and CI-gating are different questions, and a fixture may be `determinate` + `benchmark` without contradiction. The blanket claim that every determinate mismatch is an engine bug is withdrawn. (2) **`unknown_to_us` redefined** as "insufficient evidence to specify the complete scorable answer *or legitimate answer set*" — it may later be promoted to `determinate` **or** `ambiguous_by_nature`, by evidence, never by decision. (3) **Romanisation evaluation split into two**: attested-lookup evaluation (may use the full official snapshot) and generator-holdout evaluation (eval whole-name and irregular rows withheld from lookup; only the fit partition induces the rule pack; character/syllable overlap expected and is the generalisation being measured). The runner fails the generator benchmark as contaminated if an eval whole-name lookup is reachable. Lookup success is never reported as generator accuracy. (4) **Oracle-segmentation baseline added to Family H**, with segmentation-induced reading loss as an explicit metric, so §8 cannot attribute lexicon/resolver errors to the segmenter. (5) **Protected-span gating refined**: zero-false-positive hard gate on the adversarial C1/F13 set; representative-corpus precision reported with numerator, denominator and confidence interval; the provisional 0.99 is explicitly an aspiration, **not** a validated CI threshold, until the labelled sample supports one. (6) **M7's HKSCS denominator** must name the exact reference inventory, its revision basis, snapshot date and character count. (7) Version wording clarified: **§5 section revision v0.2** vs **public contract version `5.0.2`**. | §6.1, §6.9, §6.13–6.17, §6.19 | Author correction. |
| 2026-08-28 | §8 written (out of order; §7 deferred). | §8 | Author directive — §8 carries time-sensitive external findings; §7 is consolidation and reconstructible. |
| 2026-08-28 | **CHG-034 — §8 source corrections.** Seven fixes, all narrowing claims the evidence did not support. (A) The suggested **PyCantonese ~2-year release gap is withdrawn** — the releases view rendered day/month without a year and reading "26 May" as 2024 was unsupported; official documentation places the v4.0.0 Rustling transition in **March 2026**. No maintenance-gap risk is inferred. **DEC-…-044 amended: JavaScript/WASM availability is SETTLED YES** (official Quickstart documents browser and Node use via Pyodide/WebAssembly with Rustling and PyCantonese emscripten wheels); what remains open is runtime *suitability* — payload, init latency, memory, p95 segmentation latency. (B) **DEC-…-038 REOPENED.** "Family H must be newly annotated" was stronger than the evidence: only HKCanCor was shown to be unusable. **UD_Cantonese-HK** added as a live candidate. **"Bundled in a package" is distinguished from "used to train the model"** — a corpus is not excluded merely because PyCantonese can read or bundle it. (C) **RULE-DEP-1's legal rationale softened** — the categorical claims that a BY-SA layer makes a combined dataset share-alike, or an NC layer makes every component non-commercial, are withdrawn; CC and ODbL distinguish collections from adaptations, and propagation depends on how data is combined and redistributed. The architecture recommendation is unchanged. (D) **CCLI corrected**: the HKSCS Cangjie + Cantonese Pronunciation Reference Table **does have a Terms of Use page** materially restricting modification and redistribution; reclassified **REFERENCE / CROSS-CHECK ONLY**. The claim that it is superseded by the LSHK table is **withdrawn** — the government archive holds an **HKSCS-2008**-basis table while the LSHK table is specified against HKSCS-2001, so they are not the same inventory. (E) The categorical statement that **rime weights are IME priorities, not corpus frequencies, is withdrawn** as unestablished; the conservative policy stands and DEC-…-042 stays UNRESOLVED/BLOCKING. (F) rime-cantonese's classification wording separates **adoption as a source** (settled) from **precedence in the resolver** and **frequency authority** (both benchmark-dependent). (G) §6 completion state corrected to **v0.2 (CHG-033)**. | §8.1–§8.11, §0.4 | Author correction; primary sources re-checked. |
| 2026-08-28 | §9 written. | §9 | Scheduled work. |
| 2026-08-28 | **CHG-036 — cache-correctness gate; contract `5.0.4` (additive); §5 v0.4.** Editorial: live prose still presenting `5.0.2` as current updated (change-log history untouched). Three genuine contradictions found by the §10 gate and patched. **(A) Id semantics vs INV-7.** §5.2's "ids are not stable across calls" could not coexist with INV-7's byte-identical output, because ids are serialised. Resolved: ids are **deterministic functions of the input tuple** — identical inputs give identical ids — while remaining **non-persistent** and meaningless across any change of source, options, versions, context or composition. Ids are assigned **once, at final composition**, by a documented deterministic traversal; cached fragments carry only fragment-local indices and never global ids or offsets. **(B) `analysisCacheKey` was incomplete.** `contractVersion` is serialised into every Analysis but was not a key input, and no invariant coupled it to `engineVersion` — so a cache entry produced under one contract could be returned under another. `contractVersion` **added to the key**. Further, `lexiconVersion` / `rulesVersion` / `segmenterVersion` are redefined as **composite fingerprints of the active dependency stack**, including layer order and enabled/disabled state, so no mutable semantic dependency is unversioned. `providerSnapshotId` added for external results. **(C) `sourceHash` could collapse distinct sources.** The engine preserves lone surrogates as content (§3.8), but UTF-8 cannot encode them — a `TextEncoder`-style route replaces them with U+FFFD, so two distinct sources could hash equal and a cache could return the wrong Analysis. All key hashing is now specified over a **canonical length-prefixed binary encoding with UTF-16BE strings**, not canonical JSON and not UTF-8. **INV-7 is explicitly scoped** to the deterministic core, with external-provider use requiring a pinned snapshot or being marked outside strict conformance. | §0, §1.5.1, §1.6, §5.2, §5.3, §5.15, §6 framing, §10 | Cache-correctness gate. |
| 2026-08-28 | §10 written. | §10 | Scheduled work. |
| 2026-08-28 | §11 written — Reader integration interface contract (adapter boundary only; Reader not inspected). | §11 | Scheduled work. |
| 2026-08-28 | **CHG-043 — final decision-state / completion-hygiene alignment. No public-contract change; `5.0.9` stands.** §7.8 said the corpus-overlap audit blocks "DEC-038 → DEC-017 → **all performance work**", while §12 correctly treats the unresolved segmenter as blocking *selection* and allows cache/performance infrastructure, instrumentation and provisional-baseline measurement to proceed behind the replaceable `Segmenter` interface. **Two dependency graphs cannot both be authoritative**, so §7.8 — the decision-state authority — is corrected to the bounded meaning §12 already implements: the audit and Family H block **DEC-017 and the final segmenter-dependent performance adjudication**, not the infrastructure or measurements that can validly run against the baseline; only budgets and claims materially dependent on the selected segmenter stay provisional. §12.3.1 tightened to state the same distinction explicitly. Also editorial: §7.8's blockers renumbered into order (5 and 6 were transposed); the live header stripped of embedded prior-status text; §0.4's "will be added in §12" pointer completed to §12.8; §12's baseline wording clarified as *pre-§12* v0.16 against a completed packet of v1.0; §12.4's parallelism cross-reference corrected from §12.6 to §12.5; the terminal completion line restored. | §0, §7.8, §12 | Completion hygiene. |
| 2026-08-28 | §12 written — synthesis, implementation sequence, release transition and original-deliverable mapping. **No architectural change; public contract remains `5.0.9`.** Packet status advanced to SPECIFICATION COMPLETE. | §12, §0.4 | Scheduled work. |
| 2026-08-28 | **CHG-037 — consolidation correction; contract `5.0.5`; §5 v0.5.** *(Decisions taken before §7; materialised into the cumulative packet by CHG-038 after a scripted edit pass was found to have aborted before writing.)* **(A) External-provider semantics made representable.** `providerSnapshotId: null` carried two meanings and `Analysis` had no conformance field. Resolved by **narrowing the conformant core**: `processText` supports only (i) no provider and (ii) an **explicit already-materialised pinned snapshot** supplied through `EngineConfig.providerSnapshot`. A **live provider lives outside `processText`**, in an optional async orchestration layer that materialises a snapshot and then calls the core. `providerSnapshotId: null` therefore means exactly one thing — no pinned snapshot was used — and every Analysis the core produces is strictly INV-7 conformant. **(B) `verifiedAt` cache semantics corrected** — a stored-record property (DEC-…-008), not an Analysis input; a `verifiedAt`-only edit may cause a conservative miss via the entry revision but carries no requirement that the Analysis differ, and never changes confidence. **(C) L-EXT persistence split** — a pinned snapshot persists because its creation is an explicit host act; live memoisation outside the core is **memory-only by default**. "External" is not a synonym for "non-sensitive". **(D)** CHG-036 live residues cleaned. **(E) Contract governance resolved** — `5.0.x` is a **pre-implementation corrective series**; §5.17's compatibility policy becomes a release guarantee at **`5.1.0`**. The "additive only" claim is withdrawn as inaccurate for CHG-036. **(F)** Residual licence-propagation overclaims removed per CHG-034 C. **(G)** The confidence-derivation table moved from §11 to **§7.3**. **(H) Cache-hit validation rule** (RULE-CACHE-16): the digest is an index, not a proof; a candidate hit verifies stored canonical key material before returning. | §1.5, §1.7, §1.8, §1.11, §5, §8.2.2, §9, §10 | Consolidation gate. |
| 2026-08-28 | §7 written — authoritative consolidated decision register. | §7 | Scheduled work. |
| 2026-08-28 | **CHG-042 — semantic-boundary closure; public contract `5.0.9`; §5 v0.9.** A distinct, older failure class: **a layer boundary corrected in one authoritative section but left alive in an older resolution chain.** **(A)** §4.7.2 and §5.8 correctly make lexical/phrase translation entries **L4 term directives only**, but Chain B still carried a step 8 resolving them into `englishForm` — repeated in §4.9's diagram and §9.8's trace. **Step removed everywhere**; after the L3R fallback an unresolved L3E stays unresolved; lexical/phrase entries are *located and projected*, never *resolved into a name*. **(B)** The "entry explicitly typed as applying to both stores at creation time" route had no v1 schema representation and contradicted INV-12 and `StoreEntry.store`. **Removed**; one entry belongs to exactly one store, and a second store needs a second typed entry. No `appliesToBoth` field added. **(C)** §5.10.4 presented convenience views as retained declarations inside the Public API while DEC-…-034 says v1 exports `processText` only — subsection marked **DEFERRED / NON-v1**, signatures illustrative, RULE-API-5 rescoped to govern them if introduced. **(D)** RC-3's toggle is `hyphenated | joined` over given-name joining, but the directive settings took the whole `StyleProfile` union, making `surname_caps` a legal Reader setting. Narrower **`GeneratedPersonNameStyle`** introduced for the directive path; generic `StyleProfile` retained for the Lab's own presentation profiles. **(E)** Presentation wording corrected in §1.2.3, §4.10 and §4.11 — including the protection table, which defined `fallback` by the L3R route and then said the route does not determine it. **(F)** §1.4's Status list completed with `conflict` and the contract spelling `out_of_scope`. | §1, §2, §4, §5, §7, §9, §11 | Semantic-boundary closure. |
| 2026-08-28 | **CHG-041 — final materialisation / normative-preimage closure; public contract `5.0.8`; §5 v0.8.** Surgical only: no subsystem redesigned, no feature added. **(1)** Both hash specifications made literally single-source — §5.10.2.1's ordered tagged array is now the *only* `DocumentContext` preimage (the later "object keys in UTF-16 order" paragraph is replaced, and how the ordered form enters `optionsHash` is stated so a generic object encoder cannot be substituted); the `ProviderSnapshot` interface comment no longer shows a competing object preimage and points at RULE-API-20. **(2)** T-API-028 corrected — it asserted "no key named `id`", which `DocumentContext.id` makes impossible. It now tests the real invariant over `entities[]`, with `DocumentContext.id` and `EntityMemoryEntry.ref` explicitly permitted as context-contract identities. **(3)** DEC-…-058 propagated to every live occurrence: §1.4 terminology, §1.7's provenance introduction, §2.4.4's creator-canonical path, §4.6.2's value-drift rule, RULE-CONF-3's legal promotion route, and DEC-…-027 marked SUPERSEDED / NOT APPLICABLE IN V1 in both §4 and the §7 register. **(4)** DEC-…-032 propagated — §5.13.1 and §5.20 now say SETTLED for v1 rather than "narrowed". **(5)** Foundational residues repaired: "a generated L3 form is a guess about a social fact" replaced with the L3R-notation/L3E-fallback distinction; §1.4's store definitions corrected for scope-dependent layer effects; §2.9's generated-output row aligned with CHG-007. **(6)** RULE-ARCH-1 / RULE-API-2 narrowed to consumer-specific *document structure*, reconciling them with the deliberate `DocumentContext` exception. **(7)** §5 section ordering repaired — `5.7.4` placed with §5.7, `5.10.1` before `5.10.2`/`5.10.3`, convenience views `5.10.4`, DEC-…-034's reference updated. **(8)** §7's bounded evidence wording restored for DEC-…-029 and surname sources. | §1, §2, §4, §5, §7 | Materialisation closure. |
| 2026-08-28 | **CHG-040 — recursive contract-type closure; public contract `5.0.7`; §5 v0.7.** The CHG-039 gate passed a grep but not a *type* audit. **(A) `DocumentContext` made genuinely location-free.** `EntityMemoryEntry` said "spans OMITTED" in a comment while its transitive closure — `PersonNameStructure`, `Reading`, assembled `Romanisation`, `styleApplicable.unitIds` — still carried source spans and Analysis-local ids. Comments are not types. Replaced with dedicated span-free memory types (`MemoryPersonName`, `MemoryReading`, `MemoryRomanisation`, `MemoryEnglishForm`, `MemoryUnit`) whose closure contains **no span and no Analysis id**. Memory channels are legal only where a value was actually selected, so their status is restricted to `resolved | fallback` — the previous unrestricted `Status` permitted `ambiguous` with a non-null value, contradicting §5.5.1. Evidence metadata (`attestation`, `scopeDowngrade`, cautions) is carried explicitly rather than recovered from a prior Analysis. **D6 alias semantics settled**: v1 supports exact-string recurrence **plus explicitly enumerated, structurally justified aliases** (a person's given-name substring, licensed by `MemoryPersonName`) — never inferred aliases. Recursive property test T-ENT-054. **(B) The ghost `EntityRecord` subsystem resolved by deferral.** `recordRef` promised a durable store the contract never defined — no type, no API, no config input, no versioning, no cache fingerprint, no namespace semantics — while `provenance: "entity_record"` was already produced by four subsystems. **Durable Entity Records are removed from v1**: `recordRef` withdrawn, `entity_record` retired as a v1 provenance producer, and every entity-record precedence step re-expressed through the three existing stores using entity-scoped entries with E1a/E1b/E1c/E2. Recorded as DEC-…-058. **(C) `ProviderSnapshot.id` given exactly one byte preimage** — an ordered tagged array, not an object whose encoder sorts keys; `entries` canonicalised by ascending `inputHash` with duplicates rejected, so construction order cannot become silently semantic. Same discipline applied to `DocumentContext`. Tests T-CACHE-024…027. **(D)** D7 and DEC-…-030 reconciled with RULE-CONF-3 and the pinned-snapshot model; §1.7's `external` gloss corrected. **(E)** §5.2.1's tuple, the `RomanisationUnit.id` comment, DEC-…-032 (settled for v1), duplicate `5.10.2` headings, and §7.8's blocker count all corrected. **(F)** Ten further withdrawn-vocabulary residues repaired. **(G)** §8's unbounded source claims restored to their CHG-038 bounded form at every live duplicate. | §1, §2, §4, §5, §7, §8, §10, §11 | Recursive type-closure gate. |
| 2026-08-28 | **CHG-039 — pre-§12 contract-closure gate; public contract `5.0.6`; §5 v0.6.** One real public-contract correction plus completion of the CHG-037/038 materialisation. **(A) `DocumentContext` wire contract defined.** `EntityMemoryEntry` was referenced by public v1 API and never defined — blocking, because §11 correctly requires cross-call continuity to carry entity *content*, not a prior Analysis's non-persistent id. Defined minimally (§5.10.2), with a **context-local `ref`** whose meaning is bounded to its own `DocumentContext`. `inheritedFrom?: string` **replaced** by a typed `InheritanceRef` discriminating an antecedent **inside the current Analysis** from a **`DocumentContext` entry supplied as input**; every emitted reference must resolve against one or the other. Regression test T-ENT-053. **(B) `ProviderSnapshot` identity made unambiguous.** `id` was the content hash of `entries` alone while §5.13.1 claimed provider identity and configuration entered the cache key through it — mutually inconsistent. `id` is now the hash of the canonical **snapshot identity**: format discriminator, `providerId`, `providerConfigHash`, and the canonical ordered entries. **`createdAt` is explicitly non-semantic** and excluded. The entry value domain is constrained to `CanonicalValue` so §5.15.2's encoder applies. Tests T-CACHE-019…023. **(C)** Remaining CHG-037/038 residue finished: Chain B's `kind` column and `bearer_registered`; the "labelled `generated_romanisation`" sentence; T-CACHE-011c split; §3.4.2's max-matching verdict neutralised (DEC-…-017 stays unresolved) and its network-segmenter row corrected; `kind` prior → `formKind` prior. **(D)** Pre-CHG-037 provider semantics removed from the core: §5.15's cached-`ExternalProvider`-results row, the dependency-table wording, and `EXTERNAL_PROVIDER_FAILED` — the core receives a pinned snapshot as input and cannot fail a live call. The optional orchestration-layer `ExternalProvider` interface is retained. **(E)** Live semantic residues corrected: §1.7's `fallback` gloss aligned with §5.5.1; §1.2.4's DEC-…-009 no longer described as open; §2.3.2's `externallyAttested` → `externalAttestation`; §2.9's forced copy/export marker removed per RULE-HKR-13. | §1, §2, §3, §4, §5, §7, §10, §11 | Contract-closure gate. |
| 2026-08-28 | **CHG-038 — cumulative materialisation and integrity gate.** A scripted edit pass for CHG-037 aborted on an unmatched pattern **before writing the file**, so roughly half of CHG-037's edits were never materialised while §7 was written as though they had been. §7's own claims about them were therefore inaccurate. This entry materialises CHG-037 in full and records the genuinely new corrections found by re-running the gate. **(1)** All CHG-037 A/B/C/E edits applied to live prose: provider model, `verifiedAt`, L-EXT split, governance, metadata, stale `5.0.3`/`5.0.4` references. **(2)** §7.3.4 corrected — the table does **not** have three blank runtime mappings; `resolved` lexicon → `medium` and `fallback` → `low` **are** normative now, and what is open is whether measurement later justifies raising them. Only `external` provenance is genuinely unmapped, and because `Value<T>.confidence` is required, that is stated as a **shipping constraint**, not a curiosity. **(3)** §7.5 corrected — whole `RULE-*` ranges were listed as "settled design decisions", which mechanically included rules whose state is explicitly UNRESOLVED (RULE-JP-5). Replaced with a tier that distinguishes SETTLED decisions from current RECOMMENDED defaults. **(4)** Unsupported absolutes narrowed: "no existing corpus supplies the reading gold" → "no currently identified admissible corpus"; "no primary source exists" for surnames → "none known to this packet", since §8 records the search was not exhaustive. **(5)** §7.6 wording corrected — §8 inspected publisher-facing pages only, so licences and formats are "identified", not "checked"; artefact-level inspection is still pending, and gold-dependent A-family fixtures still need their source snapshots. **(6)** Live superseded schema vocabulary repaired where it was **normative**: RULE-HKR-4, Chain B/C `kind` columns, T-HKR-004/005/044, §4.9.2, T-ENT-052. Historical illustrative payloads left as-is with their superseded status unambiguous. **(7)** §7.7's adversarial-scan results rewritten to report what is actually true. Public contract remains **`5.0.5`** — this gate found no new public-contract contradiction. | §0, §2, §4, §5, §7, §9, §10 | Integrity gate. |
| 2026-08-28 | **CHG-035 — §9 v0.2 and contract `5.0.3` (additive).** §9 exposed a representational gap: the Lab lets a user classify an entry as **E2 "documented spelling"**, but `5.0.2` had no machine-readable field on `StoreEntry` for the documentary attestation itself. (A) **Additive contract patch**: `StoreEntry.attestation?: Attestation \| null`, with normative per-evidence-class validation owned by the **StoreApi/storage layer**, not the Lab; `contractVersion` bumped to **`5.0.3`**; regression test T-API-025 added. No other §5 change. (B) **§9.14 helper text corrected** — "authoritative for your documents" was false for generated E7 output; `externalAttestation` answers only whether external attestation exists, never precedence, authority, confidence or whether the value was generated. (C) **"Pin one to glossary" must not silently switch `entryScope` to `entity`**; DEC-…-031's `lexical` default stands, and a separate explicit "Save as entity override…" action carries that intent. (D) **`documentContext` is input-driven, never a mode** — no wording may imply ambient carry-forward; any carry-forward creates an explicit `DocumentContext` whose id and summary are shown and which changes `optionsHash`. (E) **Source inspection bounded to what the contract provides** — metadata display required, "show source row" optional and adapter-injected; About-panel layer/licence data comes from an explicit build/runtime manifest, not inferred from analysis values. (F) **Unknown-enum export behaviour split** — raw/round-trip exports preserve unknown values unchanged; filtered or authority-asserting exports may omit them but must say so and why. (G) **RULE-LAB-5's status grouping corrected** — "resolved vs not-resolved" left `fallback` undefined; the ambient distinction is now *selected value present* (`resolved`, `fallback`) vs *no selected value* (`ambiguous`, `conflict`, `unresolved`, `unsupported`), with `out_of_scope` carrying no ordinary annotation. (H) The `none` protection floor is labelled **"No minimum"**, not "None" — it is the lowest threshold, not a disable switch. (I) **Keyboard navigation corrected** to a single composite region with roving tabindex / active-descendant, not one Tab stop per token. (J) Non-blocking analysis clarified as a **Lab/host** concern (worker or optional async wrapper); **DEC-…-032 is not thereby settled** and the core API remains synchronous as specified. | §5.3, §5.9, §5.19, §9 | Author correction. |
| 2026-08-29 | **CHG-044 — Stage-0 materialisation / representability correction; public contract `5.0.10`; §5 v0.10; packet v1.1.** A fresh recovery Range 0A materialisation of `5.0.9` compiled the representable subset and then correctly stopped at thirteen blocking contract defects plus one duplicate declaration. This bounded correction applies those adjudications without changing or regenerating the Range 0A artefacts. **(A)** Entity-scoped translation entries now preserve required `formKind` and remain exact verbatim strings. **(B)** Assembled L3E gains discriminated romanised, literal and translated units; person/non-person and hybrid states are representable, and style targets only licensed generated romanised given-name units. **(C)** `StoreEvidenceClass` is narrowed to E1a–E2 and layer/scope takes precedence for `externalAttestation`, independently of documentary `Attestation`. **(D)** Every live v1 §5 public node is defined, including the minimal algorithm-neutral lattice, StoreApi support, projection/debug support, EngineConfig, lexicon support and closed producer reason/caution vocabularies; deferred convenience views remain non-v1. **(E)** annotation references have exactly one owner and `DerivedFrom` uses a romanisation-only subtype. **(F)** `CanonicalValue`'s signed-int64 sentinel is exact, bounded and disjoint from ordinary objects. **(G)** exact Chain C glossary output is verbatim; composed/generated output is assembled. **(H)** core L4 resolution uses `Value<T>` and can retain an equal-authority conflict without selecting text; only selected values project to term directives. **(I)** `caseSensitive` is persisted per store entry. **(J)** grouped readings carry source-bound alignment groups using local syllable indices. **(K)** inheritance moves from Entity-wide state to each selected value/candidate. **(L)** unresolved semantic projection preserves source status and requires reasons only for `unresolved`/`unsupported`. **(M)** the duplicate `ExternalAttestation` alias is removed. The correction preserves the `5.0.x` pre-implementation series, keeps `5.1.0` as the first implementation compatibility boundary, leaves DEC-…-017 unresolved, and begins no hashing, Range 0B, linguistic, UI or Reader work. | §0–§7, §9–§12 | Fresh Range 0A report and `CONTRACT_DEFECT_LEDGER.md`; R0A-DEF-001…014. |
| 2026-08-29 | **CHG-045 — observability and contextual-input closure; public contract `5.0.11`; §5 v0.11; packet v1.2.** The fresh `5.0.10` Range 0A completed its materialisation audit: the strict TypeScript graph and generated schema closed, all 86/86 applicable tests passed, and every prior R0A-DEF-001…014 remained **CLOSED**. Its fail-closed contract gate nevertheless found exactly three fresh blocking representability defects (R0A-510-DEF-001…003) plus one non-blocking branch-invalid prose/test residue (R0A-510-DEF-004). This bounded correction applies their adjudications without modifying or rerunning the Range 0A artefacts. **(A)** `TranslationDirectives` gains required invocation-local `diagnostics`, making overlap-drop diagnostics observable without mutating `Analysis`. **(B)** `createEngine` now returns a discriminated `EngineCreationResult`, exposing clean/degraded creation diagnostics and fatal semantic configuration failure with no Engine. **(C)** `ProcessOptions.documentTags` makes persisted document-tag context reachable; exact set semantics and deterministic hash-input normalisation are specified without implementing hashing. **(D)** §5.7.1 and T-API-009 are branch-aware and render assembled Romanisation rather than reading a forbidden canonical `text`. Creation, analysis, projection and live-provider orchestration diagnostics have distinct owners. `5.0.x` and the `5.1.0` compatibility boundary are preserved; no Range 0B, hashing, linguistic, UI or Reader implementation begins. | §0, §4–§7, §9–§12 | Fresh `5.0.10` Range 0A report and ledger; R0A-510-DEF-001…004. |
| 2026-08-29 | **CHG-046 — byte-identity preimage closure; public contract `5.0.12`; §5 v0.12; packet v1.3.** Applied as an authorised public-contract correction after the accepted, preimplementation `5.0.11` Range 0B findings: R0B-DEF-001 (global domain separation), R0B-DEF-002 (sourceHash), R0B-DEF-003 (optionsHash), and R0B-DEF-004 (analysisCacheKey) are merged under the exact byte-preimage rules below. The generic canonical encoder is unchanged; each public identity now has one domain-separated tagged-array preimage with `keyFormatVersion` immediately after the tag, full lower-case SHA-256 over complete canonical bytes, exact UTF-16/lone-surrogate handling, and no raw-digest or object/concatenation alternatives. Omitted ProcessOptions defaults are hash-identical to explicit defaults; `documentTags` are exact-string deduplicated and UTF-16 sorted; style/projection settings remain excluded. Existing `DocumentContext` and `ProviderSnapshot` formulas are unchanged. The accepted `5.0.11` Range 0A package and the first `5.0.11` Range 0B audit package are preserved and neither is modified or rerun. **Residual blocking check:** the live public `userDataVersion: number` declaration is still not a uniquely bounded signed-int64 semantic domain (CHG-046-RES-001); no range, representation or overflow semantics are invented here. `5.0.12` therefore requires an independent contract check before Range 0B can be rerun; no hashing implementation begins. | §0, §5.3, §5.10.2.1, §5.13.2, §5.15, §6, §7, §10, §12 | Accepted 0B preimage findings; CHG-046-RES-001 remains OPEN/BLOCKING. |
| 2026-08-29 | **CHG-047 — `userDataVersion` exact-integer closure; public contract `5.0.13`; §5 v0.13; packet v1.4.** Applied as an authorised public-contract correction. The public representation remains `number`, but every live occurrence now has the exact mathematical domain `0 ≤ n ≤ 9007199254740991` (`2^53−1`), with initial value `0`, one global counter across the three stores, exactly one increment per successfully committed mutating operation (transaction-counted, including multi-row imports), no increment for reads, previews, no-ops, failures or rollbacks, and atomic overflow rejection at the maximum. §5.15 consumes the validated value as a mathematical signed-int64 integer encoded by tag `0x04` plus eight-byte two's-complement big-endian bytes; it is never encoded as IEEE-754 bytes, a decimal string or a `CanonicalValue` wrapper. CHG-046's sourceHash/optionsHash/analysisCacheKey formulas, DocumentContext and ProviderSnapshot formulas are unchanged. `CHG-046-RES-001` is closed. The historical Range 0A/0B packages are preserved and neither is modified or rerun; a fresh Range 0A rematerialisation against `5.0.13` is required before Range 0B resumes. | §0, §1.8, §4.7.3, §5.3, §5.9, §5.15, §6, §7, §10, §11.7, §12 | Exact public numeric/lifecycle/hash-domain closure. |
| 2026-08-29 | **CHG-048 — hash-reachable grouping integer closure; public contract `5.0.14`; §5 v0.14; packet v1.5.** Applied as an authorised public-contract correction after independent final Stage-0 verification of the submitted `5.0.13` Range 0B package. **IV-0B-001 is a genuine blocking public-domain defect:** every live `grouping` member on `AssembledRomanisation`, `AssembledEnglishForm`, `MemoryRomanisation` and `MemoryEnglishForm`, and every `MemoryEnglishForm.styleApplicable.unitIndices` member, is now normatively an exact non-negative mathematical integer, representable exactly by the public number boundary, and strictly less than the owning form's `units.length`; JSON Schema narrows each scalar to `type: "integer", minimum: 0`, while executable cross-field validation enforces the local upper bound. Grouping remains a local unit-index structure; this correction does not decide coverage, ordering beyond array order, overlap, duplicate indices or other grouping policy. The existing §5.15.2 semantic signed-int64 rule is expressly applied to hash-reachable integer fields including `MemoryReading.syllables[].tone` (1…6), grouping indices and `styleApplicable.unitIndices`: they remain ordinary public numbers and are consumed as already-validated mathematical integers, never as IEEE-754 bytes, decimal strings or `CanonicalValue` wrappers. CHG-046/047 formulas and public `ProviderSnapshot` shape are unchanged. IV-0B-002 (typed canonicalisation of legal DocumentContext integers) and IV-0B-003 (ProviderSnapshot CanonicalValue boundary validation) are recorded as implementation defects for the next Range 0B run and are deliberately not repaired here. No Range package is rerun or modified; a fresh Range 0A rematerialisation against `5.0.14` is the next authorised action. | §0, §2.2.4, §4.10, §5.3, §5.6, §5.7, §5.10.2, §5.15.2, §6, §7, §10, §11, §12 | Independent verification found an unrepresentable hash-reachable numeric state; bounded public correction only. |
| 2026-08-31 | **CHG-049 — composite Version-fingerprint byte-preimage closure; public contract `5.0.15`; §5 v0.15; packet v1.6.** S2-P0 accepted a narrow public-identity finding: §5.15.1 required composite dependency coverage but did not specify one byte-exact preimage for the public `lexiconVersion`, `rulesVersion`, and `segmenterVersion` strings consumed by `analysisCacheKey`. The correction freezes three domain-separated tagged arrays, each containing `keyFormatVersion` and an order-significant configured-layer array. Every layer contribution is exactly `[layerId, layerVersionRef, snapshotDate, enabled, ordinal]`; `layerVersionRef` is structurally tagged as either a stable version or lower-case content SHA-256. The correction distinguishes absent from configured-disabled layers, makes tuple ordinal and outer array order independently semantic, defines empty-axis identities, freezes axis membership, and adds the downstream reference-vector/test obligations. §5.15.2 is unchanged. No layer is loaded, no hash/cache implementation or `T-CACHE-005` execution occurs, and no Reader work is authorised. | §0, §5.15/§5.15.1, §6, §10, §12 | S2-P0 HOLD accepted; bounded public-contract correction required before S2-P1. |
| 2026-09-04 | **CHG-050 — style-rendering executable semantic closure; public contract `5.0.16`; §5 v0.16; packet v1.7.** The accepted S2-P6 bounded contract-defect finding established seven live ambiguities: incomplete grouping coverage and joining semantics; incomplete execution rules for the five-member `StyleProfile`; no byte-exact locale-independent `CasingProfile` algorithm; undefined `renderVariants` order and duplicate behaviour; an overbroad unchanged-surname statement conflicting with `surname_caps`; no joining rule for non-contiguous licensed references; and contradictory grouping examples. This correction makes every grouping a non-empty exact ordered partition of all units; defines no separator inside a group and exactly U+0020 SPACE between groups; freezes executable behaviour for all five style profiles, including maximal adjacent licensed runs and the Lab-only `surname_caps` exception; defines ASCII-only casing; makes `renderVariants` an exact one-for-one ordered map; and adds the corresponding schema/runtime gates and collision-free tests. The canonical encoder, cache-key field membership, serialised `schemaVersion: "1.0"`, and unresolved global `givenNameJoin` default are unchanged. No style or other implementation is performed; accepted S2-P1–P5 artefacts are unchanged; formal Stage 2 remains OPEN. The corrected authority next requires affected Stage-0 materialisation/regression, bounded P1 fingerprint/cache-vector regression, independent P2–P5 compatibility rebase, independent control, and only then a fresh S2-P6 restart. | §§0, 2.2.4, 2.4.4, 4.10, 5.6, 5.7, 5.11, 5.19, 6, 7, 9, 10, 11, 12 and directly affected examples | Accepted S2-P6 contract-defect finding; bounded contract correction before implementation. |

### 0.5 Evidence standard (added 2026-08-28, CHG-006)

**Normative for the whole packet.** A form is not recorded as officially or conventionally attested on weaker evidence when stronger evidence is available or obtainable.

**Preferred primary sources**, in order of authority for their own domain:

1. **Hong Kong Lands Department**, Survey and Mapping Office — the place-name database / *A Gazetteer of Place Names*, and gazetted street and place names as published on official maps. Machine-accessible via the DATA.GOV.HK [Geographic Name dataset](https://data.gov.hk/en-data/dataset/hk-landsd-openmap-landsd-geographic-name) (Place Name API, monthly updates) and the [CSDI portal](https://portal.csdi.gov.hk/).
2. **Other Hong Kong government datasets** with authoritative bilingual name pairs — e.g. the [Address Lookup Service](https://data.gov.hk/en-data/dataset/hk-dpo-als_01-als), [GeoAddress Finder](https://tools.csdi.gov.hk/geoaddressfinder/), Lands Department [e-HongKongGuide](https://www.landsd.gov.hk/en/resources/mapping-information/ehkg.html).
3. **The entity's own official source** — an institution's or company's own English name as it publishes it.
4. **Bearer / registered evidence** for personal names — a document or the bearer's own assertion of how they spell their name.

**Supplementary, non-establishing sources.** Descriptive romanisation tables, encyclopaedic compilations and community-maintained surname lists may be used to *supplement* (to enumerate plausible variants, to explain historical mechanisms, to seed a candidate list). They may **not** silently establish a form as officially or conventionally attested. Where such a source is the only evidence, the resulting annotation is capped at the corresponding evidence class (§2.3) and cannot be presented as official.

**Source-instability caution.** Government open datasets change and are withdrawn — the DATA.GOV.HK Street Name dataset page, for example, carries a notice that it was to be removed with effect from 21 January 2025. Any packaged convention data must therefore record its snapshot date and provenance URL (`asOf`, `sourceRef`), and the build must not assume an endpoint is permanent.

### 0.6 Author-supplied constraints from the existing Reader (CHG-022)

**Status: AUTHOR-SUPPLIED FACT.** These are properties the author states the Reader **already has**. They are not proposals, not inspected by this session, and not open to redesign here. They are recorded because the engine must be *capable of serving them*, and a design that cannot is wrong regardless of its other merits.

| # | Existing Reader behaviour | What it obliges the engine to do | What it does **not** license |
|---|---|---|---|
| **RC-1** | Sentence translation is already performed by an existing **GPT-based** workflow. | Supply structured resolution data a translation consumer can act on. Nothing more. | Building an LLM translation provider. Designing prompts or API calls. **Any dependency on a Claude/Anthropic API.** The engine must have no LLM dependency at all. |
| **RC-2** | **Unknown-proper-name policy.** Ordinary prose is translated by GPT; recognised proper nouns are resolved separately; a known English form (user-defined, creator-canonical, bearer, official, or otherwise known) is used **verbatim**; a Chinese proper name with **no** known English form falls back to the engine's HK-style romanisation rather than letting GPT invent or semantically translate it. | Expose, per entity: whether a known English form exists, what kind it is, and — when it does not — an HK-romanisation fallback the consumer can substitute. Model this as an **explicit cross-layer computation**, not cross-store mutation (§4.9). | Merging the HK Romanisation glossary and the translation/English-form glossary. **INV-12 stands.** |
| **RC-3** | **Generated-name style toggle.** The user can switch *generated* personal-name fallbacks between Hyphenated (梁知遙 → Leung Chi-yiu) and Joined (梁知遙 → Leung Chiyiu). | On an assembled **person** form, license only the generated romanised given-name units the toggle may join; literal, translated, surname and non-generated units are never **joining targets**. Literal and translated unit text remains byte-for-byte exact; non-target romanised units may receive the shared ASCII presentation casing defined in §5.11. Expose both renderings when applicable. | Inferring a global default between Hyphenated and Joined, or exposing the Lab-only `surname_caps`, `spaced` or `hyphen_title` profiles as Reader settings. The Reader already exposes this as a user preference; integration preserves it. |
| **RC-4** | Verbatim sources are never restyled: creator-canonical entries, bearer/registered spellings, user glossary forms, official English entity names, and conventional whole-entity forms. | A verbatim discriminant has exact `text`, `assembled:false`, no units and no `styleApplicable`; absence is structural (§4.10/§5.7). | Applying the toggle to anything the engine did not assemble, or to literal/translated units inside an assembly. |

**Consequence for the packet.** RC-2 is the concrete, already-shipping instance of Chain B step 7 (§2.6). §4 models it; §5 defines the wire contract. This session designs neither the GPT layer nor its integration.

### 0.4 Section completion state

| # | Section | Tier | State |
|---|---|---|---|
| 1 | Foundation / Scope / Terminology | 1 | **COMPLETE (v0.2 — amended, see CHG-001…006)** |
| 2 | HK Romanisation System | 1 | **COMPLETE (v0.2 — amended, see CHG-007…018)** |
| 3 | Jyutping Processing System | 1 | **COMPLETE (v0.2 — amended, see CHG-019…021)** |
| 4 | Entity + Resolution + Dictionary Model | 1 | **COMPLETE (v0.2 — amended, see CHG-023…031)** |
| 5 | Engine Architecture + Data/API Contract | 1 | **COMPLETE AS PROSE (v0.16) — contract `5.0.16` (CHG-032/035/036/037/038/039/040/041/042/044/045/046/047/048/049/050); accepted S2-P1–P5 artefacts remain preserved, formal Stage 2 remains OPEN, and S2-P6 may not restart until the affected Stage-0 regression, bounded P1 cache-identity regression, P2–P5 compatibility rebase and independent control pass** |
| 6 | Test Corpus + Correctness Strategy | 2 | **COMPLETE (v0.2 — CHG-033)** |
| 7 | Decision Register + Linguistic Limitations | 2 | **COMPLETE (v0.3 — CHG-040)** — authoritative decision-state register |
| 8 | Implementation / Dependency Options | 2 | **COMPLETE (v0.2 — CHG-034)** |
| 9 | Standalone Language Lab UI | 3 | **COMPLETE (v0.3 — CHG-035, CHG-038)** |
| 10 | Caching / Performance | 3 | **COMPLETE (v0.2 — CHG-037, CHG-038)** |
| 11 | Reader Integration Interface Contract | 3 | **COMPLETE (v0.2 — CHG-040)** |
| 12 | Implementation Sequence + Synthesis | 3 | **COMPLETE (v0.1)** |

Note: the deliverable numbering requested in the original brief (17 headings) is a *presentation* order. This packet is being written in the requested *work* order (Tier 1 → 3). The final mapping from work order to the original seventeen deliverables is provided in **§12.8**.

---

# §1 — Foundation, Scope and Terminology

**Purpose of this section.** Establish the conceptual model that every later section depends on: what the engine is, what it is not, which linguistic layers exist and why conflating them causes real errors, what the output must structurally look like, and which properties must hold no matter how the engine is implemented. Nothing here is about the Reader.

---

## 1.1 One-paragraph definition

**RECOMMENDED.** The Hong Kong Cantonese Language Engine is a deterministic, offline-capable annotation engine. It takes a string of mixed Chinese/Latin text and returns a **structured, span-aligned, provenance-carrying annotation set** describing (a) how the text is segmented, (b) how it is pronounced in Cantonese, (c) which spans are proper-noun entities, (d) what English surface form each entity should take, and (e) how confident the engine is about each of those, and why. It never mutates the source text, never fills a field it cannot justify, and produces output rich enough that any display mode can be rendered without re-processing. The **Language Lab** is a thin standalone UI over that engine, used for authoring dictionaries and debugging the engine's reasoning.

---

## 1.2 The layer model — the core intellectual content of this packet

The single most common failure in Cantonese tooling is treating "romanisation" as one thing. It is at least three unrelated things with different truth conditions. The engine's architecture must reflect that.

### 1.2.1 The layers

| Layer | Question it answers | Kind of truth | Canonical representation |
|---|---|---|---|
| **L0 Source** | What characters are there? | Given. Immutable. | Unicode string |
| **L1 Segmentation** | Where are the token boundaries, and what kind of token is each? | Analytic; often genuinely ambiguous | Ordered partition of spans |
| **L2 Phonology** | How is this pronounced in Cantonese *here*? | **Phonological.** Determined by the language system, and in principle recoverable from linguistic evidence. Ambiguity arises both from the engine's ignorance and from genuine variation (polyphony, 文白異讀, free and registerial variation, ongoing sound change). | Structured syllable objects; Jyutping is the canonical serialisation |
| **L3R HK-style romanisation** | If this Cantonese were written in HK-style Latin spelling, what would it look like? | **Notational.** Correctness is conformity to a declared, versioned spelling convention — internal consistency, not agreement with any real-world name. Applies to **any Cantonese-readable span**, entity or not (CHG-007). | Structured romanised units + spans + provenance |
| **L3E Entity English surface form** | What is this named thing actually called in English? | **Social-fact channel, with an explicit fallback state.** Where known, the operative fact is what the bearer, government or institution actually writes and is not mechanically derivable from pronunciation. Where unknown and policy permits, L3R may supply a structurally marked, explicitly **unattested** fallback; it is never presented as a discovered social fact. | Exact verbatim text **or** structured English assembly units + `formKind` + provenance |
| **L4 Semantics** | What does this mean in English? | Determinate meaning, indeterminate wording | Core `Value<TermRendering>` in `Analysis.termResolutions`; selected concrete `TermDirective` in projection |
| **L5 Presentation** | How is it displayed? | Pure UI. **Outside the engine.** | n/a |

**INV-A (layer independence).** L2, L3R and L3E are computed independently and none is derived from another by a total function. L3R *consults* L2 (a reading is its input), but an L3R value is a notation, not a claim about the world. L3E may *consult* L3R as a last-resort fallback, but an L3E value must never be presented as if it followed from L2 or L3R. **L3R and L3E are never collapsed**, even when their text coincides (CHG-011).

### 1.2.2 Why L2 ≠ L3: Jyutping is not toneless-HK-romanisation

**CONFIRMED.** Jyutping is the romanisation scheme published by the Linguistic Society of Hong Kong (LSHK), using Latin letters plus a trailing tone digit; it is a systematic, fully reversible-at-the-syllable-level phonemic notation. See [LSHK Jyutping Scheme](https://lshk.org/jyutping-scheme/).

**CONFIRMED (with stated limits).** "Hong Kong Government Cantonese Romanisation" is the name given to the toneless, historically-derived spelling convention visible in Hong Kong government place-name and street-name output. It descends from 19th-century systems and is phonemically lossy — tones are omitted, aspirated and unaspirated stops are merged, and long /aː/ and short /ɐ/ are not distinguished. See [Hong Kong Government Cantonese Romanisation](https://en.wikipedia.org/wiki/Hong_Kong_Government_Cantonese_Romanisation) and [Standard Romanization (Cantonese)](https://en.wikipedia.org/wiki/Standard_Romanization_(Cantonese)).

**Refined (CHG-014).** The *naming policy* is published; the *spelling algorithm* is not. See §2.2.1 for the primary evidence and for what this packet does and does not claim.

**CORRECTION (CHG-005).** This packet makes **no claim** that English names on Hong Kong identity documents are produced by mechanical application of that convention. No authoritative current primary source available to this session establishes that; the Immigration Department's published [identity card FAQ](https://www.immd.gov.hk/eng/faq/faq_hkic.html) addresses the procedure for *changing* a registered name and says nothing about how a romanised form is determined. Registered personal-name spelling is therefore modelled as an **attested identity fact** (§2.3, evidence class E2), not as the output of a romanisation rule that the engine could reproduce. See §2.4.3.

Stripping tone digits from Jyutping does **not** yield an HK-style spelling. Worked counterexamples:

| Chinese | Jyutping (L2) | Jyutping minus tone | Actual HK-style form (L3) | Note |
|---|---|---|---|---|
| 梁 | loeng4 | loeng | **Leung** | `oe` is never written `oe` in HK style |
| 張 | zoeng1 | zoeng | **Cheung** | z → ch |
| 謝 | ze6 | ze | **Tse** | z → ts |
| 徐 | ceoi4 | ceoi | **Tsui** / Chui | multiple conventional forms coexist |
| 許 | heoi2 | heoi | **Hui** | |
| 吳 | ng4 | ng | **Ng** | syllabic nasal survives unchanged |
| 李 | lei5 | lei | **Lee** (HK) / Li (PRC/other) | community-dependent |
| 邱 | jau1 | jau | **Yau** / Kau / Chiu | j → y |
| 蔡 | coi3 | coi | **Choi** / Choy / Tsoi | |
| 周 | zau1 | zau | **Chow** / Chau | |

Two structural consequences:

1. **The L2→L3 map is many-to-many and non-invertible.** One Jyutping syllable yields several attested HK spellings (`ceoi4` → Tsui, Chui, Tsui̇); one HK spelling covers several distinct syllables and characters (`Yau` → 邱 jau1, 尤 jau4, 游 jau4, 丘 jau1, 柔 jau4). Therefore neither direction can be treated as a lookup with a unique answer, and **an HK romanisation can never be used to recover a pronunciation**.
2. **A generated form is a notation, and only becomes a claim when consumed as a name.** Precisely (CHG-041): a generated **L3R** form is an *engine-defined notation* — correct or incorrect only against the declared rule pack, asserting nothing about the world. It becomes a claim about a social fact **only** when Chain B consumes it as an **L3E** English-name fallback (§4.9), and that route must never imply attestation: the value carries `assembled: true`, `provenance: rule_engine`, `evidenceClass: E7` and `externalAttestation: "not_attested"`. This is why the packet insists (INV-5, §1.6) that generated forms remain structurally distinguishable from attested ones — the distinction has to survive the crossing.

### 1.2.3 Why "HK Romanisation" is too narrow a name for L3 — RECOMMENDED refinement

The brief treats an entity's English form as "HK Romanisation". Analysis of real Hong Kong data shows at least four *different* mechanisms producing an entity's English form, and they are not interchangeable:

> **Vocabulary note (CHG-039).** The `Kind` labels in this table are the **pre-CHG-027 vocabulary** and are **not** live enum values. The *analysis* stands unchanged; the *names* were superseded when form mechanism was split from evidence (§4.16's migration table gives the mapping, and §5.5.2 is authoritative): `conventional_romanisation` → `formKind: "romanisation"`, `assembled: false` · `generated_romanisation` → `formKind: "romanisation"`, `assembled: true` · `calque_or_hybrid` → `hybrid` · `literal_translation` → `translation`.

| Kind (superseded labels — see note) | Definition | Example | What goes wrong if you romanise instead |
|---|---|---|---|
| `native_original` | The Chinese name is itself a transliteration *of* an English original. The correct English form is recovered, not generated. | 佐敦 → **Jordan**; 士丹利街 → **Stanley Street**; 般咸道 → **Bonham Road** | "Zo Deon" — wrong, and unrecognisable |
| `official_name` | The entity has a registered/official English name that is a translation or a brand, not a romanisation. | 香港大學 → **The University of Hong Kong**; 恒生銀行 → **Hang Seng Bank** (mixed: romanised head + English classifier) | "Hoeng Gong Daai Hok" — never used |
| `conventional_romanisation` | An attested, established romanised spelling exists. | 旺角 → **Mong Kok**; 荃灣 → **Tsuen Wan**; 梁 → **Leung** | none — this is the intended path |
| `calque_or_hybrid` | Part translated, part romanised — very common for streets and roads. | 彌敦道 → **Nathan Road** (native original + calqued 道); 皇后大道中 → **Queen's Road Central** | any uniform treatment fails |
| `generated_romanisation` | No attested form known; produced mechanically by rule. | 梁知遙 → **Leung Chiyiu** under an explicit `joined` profile (surname attested, given name generated) | acceptable provided generated status stays **structurally retrievable** and the form is never presented as an attested or asserted name. The Lab and debug views must expose it; ordinary presentation may remain visually quiet (CHG-007, CHG-042 E) |
| `literal_translation` | Meaning-based rendering, used for common nouns and some org descriptors. | 灣仔街市 → *Wan Chai Market* | |

**DEC-LANG-20260828-001 — ACCEPTED IN PRINCIPLE, AMENDED (CHG-002).** The *finding* stands: an entity's English surface form is broader than HK Romanisation and may be an official English name, a native/original English form, a translation, a hybrid, or a conventional romanisation. The originally proposed *remedy* — collapsing everything into a single `englishForm { text, kind, … }` — is **withdrawn**.

The engine must preserve three separately addressable model elements, because they answer three different questions and are separately useful even when their text coincides:

| Element | Question it answers | Example where they coincide | Example where they diverge |
|---|---|---|---|
| Cantonese reading / **Jyutping** | How is this said? | — | 彌敦道 → `nei4 deon1 dou6` |
| **HK-style romanisation** | How would this be written in HK romanised spelling? | 旺角 → *Mong Kok* (also the official form) | 彌敦道 → *Nei Tun To* (mechanically well-formed, but not the entity's English name) |
| **English surface form** (attested/preferred where known; explicit unattested fallback otherwise) | What is this thing actually called in English, or what marked fallback should stand in when it is unknown? | 旺角 → *Mong Kok* | 彌敦道 → *Nathan Road* |

Collapsing these loses information the Lab and any future Reader genuinely need: a user comparing "what it would be romanised as" against "what it is actually called" is a first-class debugging and learning use case, and a general romanisation display mode (§2.2) needs the romanisation of spans that have no English surface form at all.

The final schema shape — `englishForm` + `hkRomanisation` as sibling fields, a general `forms[]` array keyed by kind, or another clean model — is **deferred to §5**. §2 specifies the *content* of each element and its provenance; §5 chooses the container.

**Practical consequence (CHG-010).** For 彌敦道 the engine holds three distinct, simultaneously valid values, and none replaces another:

| Channel | Value for 彌敦道 | Status |
|---|---|---|
| L2 Jyutping | `nei4 deon1 dou6` | `resolved` |
| L3R HK-style romanisation | *nei tun to* (structured units; casing is presentational) | `fallback` — engine-generated notation |
| L3E English surface form | **Nathan Road** | `resolved`, `formKind: hybrid`, `assembled: false`, E3 |

Which of these a consumer shows, and under what label, is a **presentation decision** and is deliberately not made here. What §1 fixes is only that the English surface form must not silently overwrite the romanisation channel, and vice versa. A design that hard-codes "run the romaniser and call the result the name" produces garbage on the first street name it meets; a design that hard-codes "romanisation means look up the official English name" cannot render general prose at all.

### 1.2.4 Why L3 ≠ L4 (romanisation is not translation)

Romanising 梁知遙 and explicitly projecting it as *Leung Chiyiu* under the `joined` profile carries no semantic content; translating it as *Bright Distant Beam* would be an error of category, not of accuracy. Conversely 香港大學 → *The University of Hong Kong* **is** semantic, and romanising it would be an error in the other direction. The engine therefore must not route proper nouns through the translation path by default, and must not treat a common noun's L3R romanisation as an *English name*. (General L3R romanisation of common nouns is available — DEC-…-009; what is excluded is asserting it as an L3E name.)

**RULE-SCOPE-1 — UNRESOLVED (CHG-003).** *Superseded statement, retained for the record:* "HK Romanisation is applied only to spans classified as entities of a romanisable type, and never to arbitrary running text."

That is now **not assumed**. The product may legitimately support a general "show HK romanisation" display over arbitrary Cantonese-readable Chinese text, in addition to entity-specific conventional forms. What remains firm is the narrower claim that motivated the original rule: **a mechanically generated romanisation must never be presented as an entity's name.** Generating a romanisation and asserting an identity are different acts, and only the second is scope-restricted.

The distinctions §2 must therefore keep apart — general mechanical romanisation, conventional proper-noun romanisation, bearer/registered personal-name spelling, official English entity names, and translation/hybrid/native-original forms — are specified in §2.1.

**DEC-LANG-20260828-009 is SETTLED** (accepted, CHG-007): general non-entity HK romanisation **is** a v1 user-visible capability. The superseded RULE-SCOPE-1 statement above is retained as history only.

### 1.2.5 Notation vs reading (a distinction inside L2)

**RECOMMENDED.** A *reading* is a phonological object (initial, nucleus, coda, tone). *Jyutping* is one serialisation of it; Yale, IPA, Sidney Lau and tone-mark variants are others. The engine stores readings structurally and treats Jyutping as the canonical string form. This costs almost nothing now and prevents a rewrite if Yale or IPA output is ever wanted. See DEC-LANG-20260828-004.

---

## 1.3 What the engine is, and is not

### 1.3.1 In scope (v1)

| # | Capability | Notes |
|---|---|---|
| S1 | Segmentation of mixed Chinese/Latin/numeric/punctuation text into aligned tokens | §3 |
| S2 | Cantonese reading assignment with Jyutping serialisation, word-level then character-level fallback | §3 |
| S3 | Polyphone / contextual reading resolution, with explicit ambiguity when unresolved | §3 |
| S4 | Entity detection (person, place, street, building, institution, organisation) with confidence and boundary-ambiguity states | §4 |
| S5a | **General HK-style romanisation (L3R)** of any Cantonese-readable span, entity or not, as a v1 user-visible capability (CHG-007) | §2.2 |
| S5b | **Entity English surface form resolution (L3E)** — attested, official, native-original, hybrid, translated — with generated romanisation as the marked last resort | §2 |
| S6 | Three user dictionaries (pronunciation, translation, HK romanisation) with full CRUD, enable/disable, import/export, conflict reporting | §4, §7 |
| S7 | A single `processText` producing everything above in one span-aligned document | §5 |
| S8 | Deterministic, versioned, cacheable behaviour | §10 |
| S9 | A standalone Language Lab UI for authoring and debugging | §9 |

### 1.3.2 Explicitly NOT in scope

| # | Non-goal | Why |
|---|---|---|
| N1 | Text-to-speech synthesis | The engine *supplies* pronunciation data (including override readings) for a TTS consumer. It does not synthesise audio. |
| N2 | A general machine-translation system | Translation resolution is a *glossary + delegation* layer. Full-sentence MT, if ever wanted, is an external provider behind an interface (§8). |
| N3 | Mandarin / Pinyin | Out of scope entirely. Any Mandarin support is a future separate engine, not a mode of this one. |
| N4 | Simplified⇄Traditional conversion as a source transformation | Variant handling is a *lookup-key* concern (§1.6 INV-9), never a rewrite of the user's text. |
| N5 | OCR, PDF/Docs parsing, document fetching | The engine's input is a string. |
| N6 | Any Reader code, schema, component or storage decision | Explicitly excluded by the brief and by the absence of access. |
| N7 | Authoritative claims about real people's name spellings | The engine records what the user asserts and what public convention attests; it does not adjudicate identity. |
| N8 | Grammatical parsing / POS tagging beyond what segmentation and entity detection require | Deferred; see OPTIONAL in §3. |

### 1.3.3 Deferred (plausible v2, designed-for but not built)

D1 Yale / IPA / tone-mark output. D2 Full-sentence MT provider. D3 Multi-user or synced dictionaries. D4 Learner features (spaced repetition, quizzes). D5 Audio pronunciation clips. D6 Written-Cantonese ⇄ Standard-Written-Chinese register conversion. D7 Confidence calibration against a labelled corpus.

### 1.3.4 Consumers the engine must serve without modification

1. The Language Lab (this packet, §9).
2. A future document reader (interface contract only, §11).
3. A batch/CLI script for corpus processing and regression testing (§6).
4. A hypothetical TTS front-end consuming pronunciation overrides.

**RULE-ARCH-1 (RECOMMENDED, narrowed by CHG-041).** No **consumer-specific document structure** — pages, paragraph indexes, chunk identity, scroll position, Google Docs identifiers, or any Reader schema — may appear in engine types. The engine's universe is: string in, annotation document out.

**The one deliberate exception, and why it is not one.** `DocumentContext` (§5.10.2) names a document but models none: it is a **generic, opaque cross-call continuity input** carrying entity memory and a host-supplied `id` the engine never interprets. It contains no page, chunk, offset or document-position semantics, and the engine cannot navigate a document with it. The invariant is about *importing a consumer's model of a document*, not about the word appearing in a type name.

---

## 1.4 Terminology (normative)

These terms are used with exactly these meanings throughout the packet. Where common usage is looser, the packet's usage wins.

**Text and structure**

- **Source** — the exact input string. Immutable.
- **Offset** — an index into the source. The unit is declared explicitly (see INV-8), never assumed.
- **Span** — `[start, end)` offset pair. All annotations are addressed by span.
- **Token** — the atomic unit of L1 segmentation. Tokens form a strict partition of the source.
- **Segment** — a token of type `han` that the segmenter believes is one lexical word (可能多字).
- **Entity mention** — a span classified as a proper noun *occurrence*. Distinct from the entity itself.
- **Entity record** — **DEFERRED to v2 (DEC-…-058, §5.10.3).** Would be a durable, reusable description of a named thing that mentions resolve *to*. **Not a v1 storage domain**: in v1 the equivalent facts live as entity-scoped entries in the three stores, and document-local continuity is `EntityMemoryEntry`.
- **Annotation** — any engine-produced value attached to a span.
- **Annotation document** — the complete output object for one `processText` call.

**Phonology**

- **Syllable** — one Cantonese syllable: initial + final + tone.
- **Reading** — the syllable sequence assigned to a token in context.
- **Jyutping** — LSHK romanisation with trailing tone digits (CONFIRMED). Canonical string form of a reading.
- **Tone number** — the digit suffix. Tones 1–6 in standard Jyutping (CONFIRMED). Some corpora use 7/8/9 for checked-tone syllables; the engine normalises these to 1/3/6 on ingest and records that it did (§3).
- **Polyphone (多音字)** — a character with more than one reading.
- **Literary/colloquial reading (文白異讀)** — a register-conditioned reading pair, e.g. 星期 *sing1*, 明星 *sing1* vs colloquial variants. Treated as a variational, not erroneous, ambiguity.
- **Syllabic nasal** — `m`, `ng` as complete syllables (吳 ng4, 唔 m4). Must not be treated as malformed.

**Romanisation and naming**

- **HK Romanisation (L3R)** — an English-alphabet spelling of Cantonese material following Hong Kong spelling conventions. Toneless and phonemically incomplete. **Applicable to any Cantonese-readable span, not only proper nouns** (CHG-018). Where the span is a proper noun and an attested spelling exists, the value is *conventional*; otherwise it is *engine-generated*.
- **Conventional form** — an HK Romanisation with external attestation (§2 defines the evidence classes).
- **Generated form** — an HK Romanisation produced by the engine's rules with no attestation.
- **Bearer spelling** — the spelling the named person or institution actually uses. Highest authority; only knowable if asserted or attested.
- **English surface form** — the umbrella output for an entity (§1.2.3). Verbatim forms preserve exact `text` and any of the five `FormKind` mechanisms. Assembled v1 forms are `romanisation` or `hybrid` and use explicitly typed romanised, literal and translated components; only romanised components carry Cantonese syllable semantics (§5.7).

**Resolution**

- **Provenance / resolution source** — *where a value came from* (user glossary, convention table, rule engine, lexicon, inherited, none). Two members of the union are **reserved with no v1 producer**: `entity_record` (durable records deferred, §5.10.3) and `external` (no confidence derivation, RULE-CONF-3).
- **Status** — *how epistemically solid the value is*. Complete current set (§5.5.2): `resolved`, `fallback`, `ambiguous`, `conflict`, `unresolved`, `unsupported`, `out_of_scope`.
- **Confidence** — a coarse ordinal band, not a calibrated probability (§1.7).
- **Alternatives** — other candidate values the engine considered and rejected or could not choose between. Always retained when they exist.

**Storage**

- **Pronunciation dictionary** — term → preferred Cantonese reading. **Affects L2** at every `entryScope`.
- **Translation / English-form glossary** — term → preferred English rendering. **Scope-dependent** (CHG-041/044): an `entity`-scoped entry carries required `formKind`, preserves its exact string, and affects **L3E** as a verbatim form (Chain B step 1); a `lexical` or `phrase` entry has no `formKind`, enters the typed **L4 core resolution**, and projects to an external consumer as a term directive only when selected. It never becomes an entity or an English *name* (§5.8, CHG-024).
- **HK Romanisation glossary** — source term → exact preferred HK romanised form. **Affects L3R** at `lexical`, `phrase` **and** `entity` scope — it is **not** an "English-form store". It reaches L3E only through the explicit, provenance-preserving cross-layer fallback of §4.9.

These three are **independent stores with independent precedence chains**. An entry in one must never implicitly create an entry in another. (Rationale: knowing that 梁 is spelled *Leung* tells you nothing new about its reading; asserting a reading must not silently change a name's spelling.)

---

## 1.5 Structured output philosophy

Seven principles. All later data-contract decisions must be checkable against these.

1. **Annotation over immutable source.** The engine never returns modified text. It returns spans plus values. A caller can always reconstruct the original by concatenation (INV-1). This is what makes "switch annotation mode without refetching" possible at all.
2. **Everything is addressable.** Every value hangs off a span. There is no free-floating string output. Aligned display (ruby/interlinear) is then a rendering problem, not a parsing problem.
3. **Provenance is mandatory, not decorative.** A value without a source is not a value. This is the difference between a tool the author can trust and one they must double-check by hand.
4. **Uncertainty is data, not absence.** In a present value envelope, `value:null` means "computed, no selected value" and `status` explains why; an absent field means the shape is not applicable. Where available, alternatives are retained. The engine is designed to be *visibly wrong* rather than *invisibly confident*.
5. **Presentation-agnostic completeness.** One pass produces enough for every display mode simultaneously. The consumer filters; the engine does not re-run.
6. **Deterministic and versioned.** Same input + same versions + same options ⇒ byte-identical output. **Memoisation does not create reproducibility** (CHG-037 D): a cached network result is stable only within one machine's history. Non-deterministic components are therefore excluded from the conformant core entirely — a live provider runs in an orchestration layer *outside* `processText` and must materialise a **pinned, content-addressed snapshot** which the core consumes as an ordinary input (§5.13.1, §10.7).
7. **Serialisable, diffable, inspectable.** Output is plain JSON, stable in key order, with no cyclic references and no class instances. A regression test is a diff. The Lab's debug panel is a view over exactly the same object the API returns — never a parallel computation.

### 1.5.1 Illustrative shape (indicative only — normative schema is §5)

```jsonc
{
  "schemaVersion": "1.0",
  "offsetUnit": "utf16",
  "source": "我今日去旺角見梁知遙。",
  "versions": { "engine": "0.1.0", "lexicon": "…", "rules": "…", "userData": 17 },
  "tokens": [
    {
      "id": "t0", "span": [0, 1], "text": "我", "type": "han",
      "reading": {
        "syllables": [{ "jyutping": "ngo5", "initial": "ng", "final": "o", "tone": 5 }],
        "jyutping": "ngo5",
        "provenance": "lexicon", "status": "resolved", "confidence": "high",
        "alternatives": [{ "jyutping": "o5", "note": "common initial-dropping variant" }]
      }
    }
    // …
  ],
  "entities": [
    {
      "id": "e0", "span": [5, 7], "text": "旺角", "type": "place.district",
      "reading": { "jyutping": "wong6 gok3", "provenance": "lexicon", "status": "resolved" },
      "englishForm": {
        "value": { "formKind": "romanisation", "assembled": false, "text": "Mong Kok" },
        "provenance": "convention_table", "evidenceClass": "E3", "externalAttestation": "attested",
        "status": "resolved", "confidence": "high",
        "alternatives": [{ "text": "Wong Kok", "note": "phonetically regular but not the attested form" }]
      }
    },
    {
      "id": "e1", "span": [8, 11], "text": "梁知遙", "type": "person",
      "structure": { "surname": [8, 9], "givenName": [9, 11] },
      "reading": { "jyutping": "loeng4 zi1 jiu4", "provenance": "lexicon", "status": "resolved" },
      "englishForm": {
        "value": {
          "formKind": "romanisation", "assembled": true, "person": true,
          "units": [
            { "kind": "romanised", "id": "u0", "span": [8,9], "text": "leung",
              "syllable": "loeng4", "generated": false, "role": "surname", "provenance": "convention_table",
              "evidenceClass": "E6", "scopeDowngrade": "class_applied_to_individual" },
            { "kind": "romanised", "id": "u1", "span": [9,10], "text": "chi",
              "syllable": "zi1", "generated": true, "role": "given", "provenance": "rule_engine", "evidenceClass": "E7" },
            { "kind": "romanised", "id": "u2", "span": [10,11], "text": "yiu",
              "syllable": "jiu4", "generated": true, "role": "given", "provenance": "rule_engine", "evidenceClass": "E7" }
          ],
          "grouping": [[0], [1, 2]], // complete ordered partition: surname word | given-name word
          "styleApplicable": { "scope": "givenName", "unitIds": ["u1", "u2"] }
        },
        "provenance": "rule_engine", "evidenceClass": "E7", "externalAttestation": "not_attested",
        "status": "fallback", "confidence": "low"
        // no `text`, no `styleVariants` — rendering belongs to @hklang/style (§5, CHG-032)
      }
    }
  ],
  "diagnostics": []
}
```

Note in that example: the *surname* is attested at class level and the *given name* is engine-assembled, within one name. Unit-level provenance is therefore not optional garnish — a whole-name confidence of "low" would understate what is known, and "high" would overstate it. Note also that the engine emits **no `text` at all** for an assembled name: it emits units, and `@hklang/style` renders one when given a profile (§5.11). Developed in §2; frozen in §5 (current contract `5.0.16`).

---

## 1.6 Core invariants

Each is stated so it can be turned into an automated test. §6 will assign test IDs.

| ID | Invariant | Test form | Label |
|---|---|---|---|
| **INV-1** | **Source fidelity.** Concatenating `tokens[i].text` in order reproduces the source exactly, including whitespace, newlines and control characters. | Property test over the whole corpus + fuzzer. | RECOMMENDED (hard requirement) |
| **INV-2** | **Token partition.** Token spans are ordered, contiguous, non-overlapping, and cover `[0, len)`. No gaps. | Property test. | RECOMMENDED |
| **INV-3** | **Entity overlay.** Entity spans align to token boundaries and *may nest* (香港大學 contains 香港) but may not partially overlap. Exactly one entity per position is marked `primary`. | Property test; nesting fixtures. | RECOMMENDED — see DEC-…-005 |
| **INV-4** | **Grapheme safety.** No token or entity boundary falls inside a surrogate pair, a variation-selector sequence, or a combining sequence. | Fuzzer over non-BMP HKSCS characters (e.g. 𡃁, 𠮶). | RECOMMENDED |
| **INV-5** | **No fabricated certainty.** No value may carry a provenance implying evidence the engine does not hold. Specifically: a rule-generated romanisation may never be emitted with provenance `convention_table` or `user_glossary`, nor confidence `high`. | Unit tests asserting the generator's output provenance; a lint rule over the convention data files. | RECOMMENDED (this is the packet's central safety property) |
| **INV-6** | **Provenance completeness.** Every non-null annotation value has non-null `provenance` and `status`. | Schema validation + runtime assertion in dev builds. | RECOMMENDED |
| **INV-7** | **Determinism (CHG-036, narrowed by CHG-037 A).** For a fixed input tuple (§5.15) the serialised output is byte-identical across runs, processes and platforms. This holds **unconditionally for every Analysis the conformant core produces**, because the core admits only two states: no provider (`providerSnapshotId: null`), or an explicit **pinned, content-addressed provider snapshot** supplied through `EngineConfig.providerSnapshot`, whose id is a key input. A **live provider cannot reach `processText`** — it runs in an optional async orchestration layer that materialises a snapshot first (§5.13.1). Caching a network result does not by itself make it deterministic, which is why memoisation is not accepted as a substitute for a snapshot. | Repeat-run hash comparison in CI, with and without a pinned snapshot. | RECOMMENDED |
| **INV-8** | **Declared offset unit.** The output declares `offsetUnit`. Consumers must not assume. | Schema requirement. | RECOMMENDED — see DEC-…-003 |
| **INV-9** | **No source mutation for lookup.** Unicode normalisation, variant folding (異體字), and simplified→traditional mapping are applied to *lookup keys* only, never to the source or to token `text`. Where folding changed the key, the annotation records `keyTransform`. | Test: input containing 裏/裡 and a simplified character returns unchanged `text`. | RECOMMENDED |
| **INV-10** | **Mode completeness.** A single `processText` result contains everything needed to render every display mode (off / Jyutping / HK Romanisation / both / entities-only). Changing mode never requires re-invoking the engine. | Contract test: render all modes from one cached payload. | RECOMMENDED |
| **INV-11** | **Bounded override locality.** Adding, editing, disabling or deleting one dictionary entry changes annotations only within the *segmentation windows* (default: the sentence) that contain a match of that entry. It never changes annotations in unrelated sentences. | Differential test: process corpus, add one entry, re-process, diff must be confined to matching windows. | RECOMMENDED — note this is *bounded*, not *span-local*: a lexical entry can legitimately re-segment its neighbours within the window. |
| **INV-12** | **Store independence.** Writing to one of the three dictionaries never writes to another. Any cross-store suggestion is a UI affordance requiring explicit user confirmation, never an engine side-effect. | Unit test on the storage layer. | RECOMMENDED |
| **INV-13** | **Idempotence.** `process(process(x).source) ≡ process(x)`. The engine's output source field round-trips. | Property test. | RECOMMENDED |

**Deliberate non-invariant.** The engine does **not** guarantee that entity detection is stable across lexicon versions. Improving detection changes output by design. Stability is guaranteed only *within* a version tuple (INV-7); this is precisely why the version tuple is part of every cache key (§10).

---

## 1.7 Confidence, status and provenance — the three-axis model

**DEC-LANG-20260828-002 — ACCEPTED (CHG-001).** The brief proposes a single status vocabulary: `verified / glossary / conventional / generated / ambiguous / unsupported / unresolved`. Analysis shows this conflates two orthogonal questions and creates unrepresentable states.

- `glossary`, `conventional`, `generated` answer **where did this come from?**
- `ambiguous`, `unresolved`, `unsupported` answer **how solid is it?**
- `verified` answers a third thing again — **has a human confirmed it?**

The states that a single enum cannot express, and which occur in practice:

1. Two *enabled user glossary entries* match the same span with different values → the value is simultaneously `glossary` and `ambiguous`.
2. A conventional spelling exists but two conventions conflict (e.g. 蔡 → Choi vs Choy, both attested) → `conventional` and `ambiguous`.
3. A generated form that happens to be reviewed and approved by the user → `generated` in origin, `verified` in trust.
4. A span with a known reading and a known L3R romanisation, but which is not an entity → `resolved` for L2 and L3R, `out_of_scope` for **L3E** (there is no "English name" of a common noun), all on the same token.

Proposed replacement — three independent fields per annotation value:

**`provenance`** (where from) — closed set:

| Value | Meaning |
|---|---|
| `user_glossary` | An enabled entry in one of the three user dictionaries |
| `entity_record` | **Reserved; no v1 producer** (CHG-040 B, §5.10.3). Retained in the union so a future durable-record subsystem is a minor change, not a breaking one |
| `convention_table` | Packaged attested-convention data (surname tables, gazetteer, official names) |
| `lexicon` | Packaged linguistic data (word list, readings) |
| `rule_engine` | Deterministic generation from rules |
| `external` | A value originating outside the engine. **In v1 the core never produces one**: a live provider cannot enter `processText`, and external material reaches output only via a pinned snapshot consumed as `rule_engine` evidence or via a user store entry (§5.13.1, RULE-CONF-3, CHG-040 D). Reserved in the union for a future contract that settles its confidence derivation |
| `inherited` | Copied from a containing or previously resolved entity mention in the same document |
| `none` | No value produced |

**`status`** (how solid) — closed set:

| Value | Meaning | Typical UI treatment |
|---|---|---|
| `resolved` | One value, adequate evidence | normal |
| `ambiguous` | Several candidates, none decisively better; `alternatives` populated | marked, alternatives offered |
| `fallback` | **A selected value produced by a lower-certainty fallback or generative mechanism within its own layer**, because stronger resolution was unavailable (aligned with §5.5.1, CHG-039 E). It carries a usable value. **Not every fallback is generated** — the route and the mechanism are different facts | marked as lower-certainty; the assembled/verbatim distinction is what marks generation |
| `unresolved` | No value could be produced | placeholder, never a guess |
| `unsupported` | Out of the engine's competence (unknown script, corrupt input) | diagnostic |
| `out_of_scope` | The layer does not apply to this span — e.g. **L3E** (entity English form) on a non-entity span, or any Cantonese layer on a Latin token. Note: **L3R general romanisation is *not* out of scope for common nouns** (DEC-…-009) | field hidden |
| `conflict` | Two sources of *equal* precedence disagree; requires user action | flagged for resolution |

**`confidence`** — ordinal band, explicitly **not** a probability:

| Band | Meaning |
|---|---|
| `high` | Attested/asserted; the engine would be surprised to be wrong |
| `medium` | Well-supported inference (e.g. regular reading of a common word) |
| `low` | Rule output or weak heuristic |
| `none` | Not applicable (`unresolved`, `out_of_scope`) |

**RULE-CONF-1 (RECOMMENDED).** Confidence is *derived*, not hand-assigned: it is a pure function of `(provenance, status, layer)` plus a small set of documented modifiers. This prevents drift where different code paths invent their own numbers. **The normative derivation table is §7.3** (moved from §11 by CHG-037 G: confidence derivation is engine semantics, and the Reader integration layer must not become its authority).

**RULE-CONF-2 (RECOMMENDED).** The engine never emits a numeric probability. Nothing in the design is calibrated, and a number like `0.87` would misrepresent a heuristic as a measurement. (If calibration is ever done against a labelled corpus — deferred item D7 — a numeric field may be added *alongside*, never replacing, the band.)

**`verified`** is modelled separately as a boolean/timestamp on the *stored record*, not as a status on the computed value: "the user checked this entry on 2026-08-28" is a property of the dictionary entry, not of this particular annotation.

---

## 1.8 Versioning axes

**RECOMMENDED.** Independent version axes. The canonical list, the composite-fingerprint rule and the full cache-key input set are **normative in §5.15/§5.15.1**; the table below is the introductory view and is not the authority (CHG-037 D). Since CHG-036, `contractVersion` and `providerSnapshotId` are also key inputs, and `lexiconVersion` / `rulesVersion` / `segmenterVersion` are composite fingerprints over their active dependency stacks rather than bare labels.

| Axis | Changes when | Example |
|---|---|---|
| `schemaVersion` | The output contract changes | `1.0` |
| `engineVersion` | Code changes (semver) | `0.3.1` |
| `lexiconVersion` | Packaged linguistic data changes (word lists, readings) | `cc-canto-2026-05` |
| `rulesVersion` | The romanisation convention tables or generation rules change | `hkr-2026-08-01` |
| `userDataVersion` | Any committed user dictionary write; one global exact integer counter per Store-set namespace | `17` |

**CHG-047 exact public domain (normative).** Every public occurrence of `userDataVersion` is still represented as a TypeScript/JSON `number`, but its mathematical value is valid **iff it is an exact integer in the inclusive range `0 ≤ n ≤ 9007199254740991` (`2^53 − 1`)**. This is the complete v1 domain: negative, fractional, non-finite, above-maximum, and otherwise inexact values are rejected at untyped boundaries. All legal values are lossless JSON/IEEE-754 binary64 integers. A newly created Store-set namespace starts at `0`; one global counter covers all three stores. A successfully committed mutating operation that changes persistent state increments it exactly once (transaction-counted, so a multi-row import increments once); reads, previews, no-ops, failed and rolled-back operations do not increment. At the maximum, a mutation is rejected atomically before any record, revision, timestamp or version change. There is no wrap, saturation, silent same-version write or namespace rollover. These lifecycle rules are normative wherever this field appears below.

Rationale for separating `lexiconVersion` from `rulesVersion`: updating a pronunciation lexicon should not invalidate cached *romanisations*, and vice versa. Which caches each axis invalidates is analysed in §10. Rationale for `userDataVersion` being a single counter rather than three: simpler, and dictionary writes are rare relative to reads; the finer-grained alternative (per-store versions) is recorded as a §10 option.

---

## 1.9 Working assumptions (stated so they can be challenged)

These are **assumptions, not findings**. Each is falsifiable by the later agent.

| # | Assumption | If false |
|---|---|---|
| A1 | The engine will run in a browser and/or Node, i.e. a TypeScript implementation is appropriate. | If the Reader is server-side Python, the *contract* survives but the implementation language changes; §5 is written to be language-neutral at the interface level. |
| A2 | The user is a single private user, not a multi-tenant service. Dictionaries are personal; no auth model is needed inside the engine. | Multi-user would add a profile dimension to storage and cache keys. |
| A3 | Offline-capable operation is preferred; network calls, if any, are optional enhancements. | Would change §8's recommendation weighting. |
| A4 | Input is Traditional Chinese as used in Hong Kong, possibly with HKSCS characters and written-Cantonese forms, mixed with English. | Simplified input is handled via key folding (INV-9), not as a first-class mode. |
| A5 | Text volume per call is document-paragraph scale (hundreds to low thousands of characters), not whole-corpus scale. | Would shift §10 toward streaming/worker designs. |
| A6 | The author's priority is *trustworthy uncertainty* over *maximum coverage*. | The entire provenance apparatus is justified by this; if speed/coverage matter more, much of it could be simplified. |

---

## 1.10 Decisions raised by §1 (seed of the register)

Full register format (options, advantages, disadvantages, downstream consequences, recommendation, confidence, must-decide-before-implementation) is §7. Recorded here in short form so nothing is lost.

| ID | Question | Recommended default | Confidence | Must decide before implementation? |
|---|---|---|---|---|
| DEC-LANG-20260828-001 | Is an entity's English output a single `hkRomanisation` string, or something broader? | **ACCEPTED IN PRINCIPLE, AMENDED (CHG-002).** The finding is accepted: English surface form is broader than romanisation. The remedy is amended: `englishForm` must not absorb HK Romanisation. Jyutping, HK-style romanisation and attested English surface form stay separately addressable. Container schema deferred to §5. | High on the finding; the container choice is open | Finding: settled. Container: decide in §5. |
| DEC-LANG-20260828-002 | One status enum, or three orthogonal fields (provenance / status / confidence)? | **ACCEPTED (CHG-001).** Three fields; `verified` is a property of stored records, not a computed status. | High — unrepresentable states demonstrated in §1.7 | Settled. |
| DEC-LANG-20260828-003 | Offset unit: UTF-16 code units, Unicode code points, or grapheme clusters? | UTF-16 code units *with* `offsetUnit` declared, because the likely consumers are JS/DOM; converters supplied for code-point consumers | Medium — depends on A1 | **Yes**, but cheap to change if `offsetUnit` is honoured from day one. |
| DEC-LANG-20260828-004 | Store readings as opaque Jyutping strings, or as structured syllables with Jyutping as serialisation? | Structured, with Jyutping canonical string alongside | Medium-high — enables Yale/IPA and syllable-level alignment cheaply | No — can be added later, but retrofitting alignment is costly. Prefer deciding now. |
| DEC-LANG-20260828-005 | May entity spans nest (香港 inside 香港大學)? | Yes, nesting allowed; partial overlap forbidden; one `primary` per position | Medium | **Yes.** Affects the entity layer's data structure and the Lab's rendering. |
| DEC-LANG-20260828-006 | Implementation language/runtime. | TypeScript, browser+Node, zero required network | Low-medium — contingent on A1, and on the Reader's real stack, which is not inspectable in this session | No — deliberately left open; §5 keeps the contract language-neutral. |
| DEC-LANG-20260828-007 | Unicode normalisation and variant folding policy for lookup keys (NFC? fold 異體字? fold simplified?). | NFC for keys; variant folding as an *explicit, recorded* transform; no folding of the source | Low — needs corpus evidence in §6 before fixing | Configurable; decide with §3 and §6 data. |
| DEC-LANG-20260828-008 | Is `verified` a status on values or a property of stored entries? | A property of stored entries (`verifiedAt`, `verifiedBy`) | Medium-high | No — additive. |

---

## 1.11 Unfinished boundary for §1

Nothing in §1 is left partially specified. Items deliberately *deferred* to named later sections, so they are not mistaken for omissions:

- ~~The confidence derivation table~~ → **discharged in §7.3** (moved from §11, CHG-037 G).
- ~~The evidence classes that make a romanisation "conventional"~~ → **settled in §2.3** (evidence classes E1a–E7, RULE-HKR-5/5a, §2.3.2).
- ~~The entity type taxonomy~~ → **settled in §4.2**.
- ~~Formal data contract for the annotation document~~ → **settled in §5 (schema freeze)**.
- ~~Whether `inherited` provenance creates cross-contamination~~ → **settled in §4.6.2** (RULE-ENT-8/9: memory raises recall only, never confidence; scoped or explicit, never ambient).

**SECTION COMPLETE — §1 Foundation, Scope and Terminology**

---

# §2 — HK Romanisation System

**Purpose.** Specify how the engine produces English-alphabet spellings of Cantonese material: what the distinct kinds of spelling are, what evidence makes a spelling *attested* rather than *generated*, how a deterministic generator works and where it must not be trusted, how provenance is represented, and what the engine does when it cannot know.

**Reading note.** This section is written after the §1 amendments (CHG-002, CHG-003, CHG-005). It therefore treats general mechanical romanisation as in-scope and open, and treats registered personal-name spelling as an attested identity fact rather than a reproducible rule output.

---

## 2.1 Five distinct things that all look like "HK Romanisation"

The brief's amendment is correct that these must be investigated separately. They differ in what question they answer, what would make them right or wrong, what spans they apply to, and what happens when the engine is ignorant.

| # | Mechanism | Question answered | What makes it correct | Applies to | Failure when confused with the others |
|---|---|---|---|---|---|
| **M1** | **General mechanical HK-style romanisation** | "If this Cantonese were written in HK-style Latin spelling, what would it look like?" | Conformity to a **declared, versioned spelling convention**. It is a notation, so correctness is internal consistency with the stated rule pack — not agreement with any real-world name. | Any Cantonese-readable span, entity or not | If presented as a name: fabricates identities. If withheld: a legitimate display mode becomes impossible. |
| **M2** | **Conventional romanisation of a proper noun** | "What is the established romanised spelling of this named thing?" | Agreement with external attestation (gazetteer, official map, established usage). | Entity spans, chiefly places, streets, districts, and surnames at class level | If generated instead: *Nei Tun To* for 彌敦道. If assumed to exist: nothing renders for new or private names. |
| **M3** | **Bearer / registered personal-name spelling** | "How does *this person* spell their name?" | Agreement with the bearer's own usage or their registered documents. **An identity fact, not a linguistic one.** | Individual person entities only | If generated: the engine asserts a stranger's name. If treated as class-derivable: every 陳 becomes *Chan*, which is false for 陳 people who write *Chen*, *Tan* or *Tran*. |
| **M4** | **Official English entity name** | "What is this institution/place officially called in English?" | Agreement with the entity's own or the government's official designation. Often a translation or a brand, not a romanisation at all. | Institutions, organisations, gazetted places, transit stations, buildings | If romanised: *Hoeng Gong Daai Hok* for 香港大學; *Tung Lo Wan* for 銅鑼灣 (officially **Causeway Bay**). |
| **M5** | **Translation / hybrid / native-original English form** | "What English text corresponds to this, by translation, calque, or recovery of an English original?" | Semantic correctness (translation), or correct identification of the English source (native-original). | Mixed — especially street names and transliterated foreign names | 佐敦 romanised as *Tso Tun* rather than recovered as **Jordan**; 彌敦道 romanised rather than recovered as **Nathan Road**. |

**RULE-HKR-1 (RECOMMENDED).** These five are separate resolution paths with separate precedence chains (§2.6), separate provenance values, and separate confidence semantics. They may be *displayed* together, but they are never *merged* in the data model. This is the operative form of the author's amendment CHG-002.

**RULE-HKR-2 (RECOMMENDED — the safety rule).** M1 output may always be produced for a Cantonese-readable span. It may never be labelled, styled, exported or spoken as if it were M2, M3, M4 or M5. Generating a spelling and asserting a name are different acts; only the second requires evidence, and only the second is restricted.

This is a genuine resolution of the tension in the original brief. The brief was right that "not every Chinese phrase should receive HK Romanisation" — but the real constraint is on *assertion*, not on *generation*.

---

## 2.2 M1 — the general mechanical romaniser

### 2.2.1 Is a general HK-style romanisation of arbitrary text coherent?

**Yes, with one honest caveat.** HK-style spelling is a lossy but well-formed mapping from Cantonese syllables to Latin strings. Any Cantonese syllable can be spelled in it. What it cannot do is *round-trip*: the spelling loses tone, aspiration, and the long/short /a/ distinction, so 發 `faat3` and 佛 `fat6` both spell **Fat**, and 溫 `wan1` and 灣 `waan1` both spell **Wan**. That makes M1 a display notation, not a phonemic one — which is exactly why Jyutping (L2) must remain the engine's canonical phonology and M1 must never be used as an input to anything.

**CONFIRMED.** Tones are omitted; aspirated and unaspirated stops are merged; long /aː/ and short /ɐ/ are merged. ([Hong Kong Government Cantonese Romanisation](https://en.wikipedia.org/wiki/Hong_Kong_Government_Cantonese_Romanisation))

### 2.2.1a What the government has and has not published (CHG-014)

The earlier formulation — "the government has never published its method" — was too strong. The correct distinction is between a published **naming policy** and an unpublished **spelling algorithm**.

**CONFIRMED — the naming policy is published.** In a Legislative Council reply of 29 May 2019, the Secretary for Home Affairs stated that for streets and geographical places, named by the Lands Department and the Geographical Place Names Board:

> "In general, when naming a new street and geographical place, the English name is normally the transliterated version of the Chinese name in Cantonese Romanisation, unless the street concerned is named after a particular place/object and there is specific Chinese/English term for that particular place/object in common use, in which case the literal translation is used."

([LCQ14: Determining English names for public places and facilities, streets and government buildings](https://www.info.gov.hk/gia/general/201905/29/P2019052900354p.htm), 29 May 2019)

This is a **direct primary-source confirmation of the M2/M5 split** posited in §2.1: transliteration is the default, literal translation is used where a common term exists. It also confirms that government buildings are named ad hoc by project proponents ("it is hard to make generalisation"), which is why §2.3.4 recommends a small curated E4 list rather than a rule.

**AUTHOR-SUPPLIED, NOT INDEPENDENTLY LOCATED.** The author reports a 1999 government reply describing street-name transcription by reference to the *Three Way Chinese Commercial/Telegraphic Code Book*. This session verified that such a work exists — a Hong Kong government / Royal Hong Kong Police publication giving, per Chinese character, the commercial/telegraphic code alongside romanised Mandarin and romanised Cantonese — but did **not** locate the 1999 reply itself. It is recorded here as author-supplied evidence at that strength, not as a source this packet verified.

If the 1999 account is accurate it is significant for implementation, because it means the operative government mechanism is (or was) a **per-character lookup table**, not a generative rule. That is independent support for RULE-HKR-3's recommendation of a per-character table over a phonological rule, and it explains why the ts/ch and s/sh distinctions survive: a table can carry an etymological distinction that no modern-pronunciation rule could reconstruct.

**CONFIRMED — the spelling algorithm is not published.** What remains absent is any complete public specification from which *all* government spellings could be reproduced from a modern phonemic representation such as Jyutping. The convention is known to outsiders descriptively, from inspection of its outputs — historical maps and the 1960 gazetteer. ([Hong Kong Government Cantonese Romanisation](https://en.wikipedia.org/wiki/Hong_Kong_Government_Cantonese_Romanisation))

**RULE-HKR-1a (RECOMMENDED) — what M1 claims to be.** M1 is an **engine-defined HK-style generated romanisation**: a documented, versioned convention of this engine, fitted to attested government output and measured against it. It is *not* a claim to reproduce an official algorithm, and the packet must not describe it as "the HK Government system". Two consequences:

1. **There is no authoritative rule pack to implement.** Any table the engine ships is a *reconstruction*. It is HEURISTIC by construction, no matter how carefully built.
2. **Therefore the rule pack must be empirically validated, versioned, and its measured accuracy published** (§2.7). A reconstruction whose error rate is unknown cannot support honest confidence bands.

### 2.2.2 The hard blocker: the ts/ch and s/sh split is not recoverable from modern pronunciation

**CONFIRMED (limitation).** The convention preserves a distinction between palatal and alveolar sibilants — *ch* vs *ts*, *sh* vs *s*, *j* vs *z* — that **no longer exists in modern spoken Cantonese**. ([Hong Kong Government Cantonese Romanisation](https://en.wikipedia.org/wiki/Hong_Kong_Government_Cantonese_Romanisation))

This is the single most consequential fact in this section. It means:

> A generator whose only input is Jyutping **cannot** reliably choose between *Ts-* and *Ch-*, or between *S-* and *Sh-*, because modern Jyutping does not encode the distinction that the spelling reflects.

Attested minimal contrasts, all from Jyutping-identical or near-identical onsets:

| Chinese | Jyutping | Attested HK form | Onset chosen |
|---|---|---|---|
| 荔枝角 | `lai6 zi1 gok3` | Lai **Chi** Kok | ch |
| 慈雲山 | `ci4 wan4 saan1` | **Tsz** Wan Shan | ts |
| 尖沙咀 | `zim1 sa1 zeoi2` | **Tsim** Sha **Tsui** | ts |
| 灣仔 | `waan1 zai2` | Wan **Chai** | ch |
| 沙田 | `sa1 tin4` | **Sha** Tin | sh |
| 西貢 | `sai1 gung3` | **Sai** Kung | s |
| 筲箕灣 | `saau1 gei1 waan1` | **Shau** Kei Wan | sh |
| 秀茂坪 | `sau3 mau6 ping4` | **Sau** Mau Ping | s |
| 深水埗 | `sam1 seoi2 bou6` | **Sham Shui** Po | sh, sh |
| 上水 | `soeng6 seoi2` | **Sheung Shui** | sh, sh |

`sa1`→Sha but `sai1`→Sai; `saau1`→Shau but `sau3`→Sau; `zi1`→Chi but `ci4`→Tsz. No function of the modern syllable produces this.

**HEURISTIC — the historical-class hypothesis.** The split tracks Middle Chinese initial series: the 精-series (精清從心邪) tends to *ts-/s-*, and the 知/莊/章-series tends to *ch-/sh-*. This explains most of the table above (慈 從母 → Tsz; 枝 章母 → Chi; 西 心母 → Sai; 沙 生母 → Sha; 上 禪母 → Sheung). It is **not** a law: 灣仔 (仔, 精-series by descent) is attested **Chai**, and 兆康 (兆, 知-series by descent) is attested **Siu**. This packet asserts the hypothesis as a *prior for unseen characters only*, at HEURISTIC strength, and explicitly does not claim it is exceptionless.

**RULE-HKR-3 (RECOMMENDED, amended by CHG-008).** The generator ships a **per-character sibilant-class table** derived empirically from attested pairs (§2.7), not a phonological rule.

- A character **in** the table resolves normally.
- A character **absent** from the table but classifiable by the historical-class prior emits **all materially plausible candidates**, `status: ambiguous`, with the prior used **only to rank** them. The prior may not promote the top candidate to `resolved`.
- A character absent from both emits both candidates, `status: ambiguous`, `caution: sibilant_class_unknown`.

**Engine-data statement only.** This governs what the engine *returns*. It does **not** require any consumer to render every candidate inline. A presentation layer may show the top-ranked candidate and surface the rest on demand; the Lab must expose all of them. Presentation policy is specified separately (§9) and is not an engine concern.

### 2.2.3 Reconstructed correspondence tables

**HEURISTIC — reconstruction, not a published standard.** These tables are induced from attested Hong Kong place names. They are a starting point for the fitting procedure in §2.7, not the final rule pack. Every row should be re-derived from the Lands Department gazetteer before implementation, and the fitted table supersedes this one.

**Initials.** Jyutping → HK-style. Note the systematic mergers.

| Jyutping | HK | Evidence | Note |
|---|---|---|---|
| `b`, `p` | **p** | 埔 `bou3`→Po; 坪 `ping4`→Ping | aspiration merged |
| `d`, `t` | **t** | 大 `daai6`→Tai; 田 `tin4`→Tin | aspiration merged |
| `g`, `k` | **k** | 角 `gok3`→Kok; 橋 `kiu4`→Kiu | aspiration merged |
| `gw`, `kw` | **kw** | 葵 `kwai4`→Kwai | see irregular 觀 `gun1`→**Kwun** |
| `z` | **ch** *or* **ts** | see §2.2.2 | **not predictable from Jyutping** |
| `c` | **ch** *or* **ts** | see §2.2.2 | **not predictable from Jyutping** |
| `s` | **s** *or* **sh** | see §2.2.2 | **not predictable from Jyutping** |
| `j` | **y** | 油 `jau4`→Yau; 元 `jyun4`→Yuen | |
| `w` | **w** | 灣 `waan1`→Wan; 黃 `wong4`→Wong | |
| `h` | **h** | 紅 `hung4`→Hung | |
| `f` | **f** | 粉 `fan2`→Fan | |
| `m` `n` `l` `ng` | **m n l ng** | 藍 `laam4`→Lam; 馬 `maa5`→Ma | n/l are merged in much modern speech; spelling follows the etymological form |
| ∅ | ∅ | 澳 `ou3`→O; 安 `on1`→On | |

**Finals.** Jyutping → HK-style.

| Jyutping | HK | Evidence | Note |
|---|---|---|---|
| `aa` | a | 沙→Sha | |
| `a` (ɐ) | a | 深 `sam1`→Sham | **merged with `aa`** |
| `aai`, `ai` | ai | 大 `daai6`→Tai; 西 `sai1`→Sai | merged |
| `aau`, `au` | au | 筲 `saau1`→Shau; 秀 `sau3`→Sau | merged |
| `aam`, `am` | am | 藍→Lam; 深→Sham | merged; but 磡 `ham3`→**Hom** (irregular) |
| `aan`, `an` | an | 山 `saan1`→Shan; 粉 `fan2`→Fan | merged |
| `aang`, `ang` | ang | 坑 `haang1`→Hang | but 恆 `hang4`→**Heng** (irregular) |
| `ei` | ei | 美 `mei5`→Mei; 箕 `gei1`→Kei | surname 李 `lei5`→**Lee** is a separate convention |
| `i` | i | 衣 `ji1`→Yi; 枝 `zi1`→Chi | after alveolar sibilants often **z**: 慈 `ci4`→Tsz, 詩 `si1`→Sze |
| `iu` | iu | 調 `tiu4`→Tiu; 兆 `siu6`→Siu | |
| `im`/`in`/`ing`/`ip`/`it`/`ik` | im/in/ing/ip/it/ik | 尖→Tsim; 田→Tin; 青 `cing1`→Tsing; 硤 `gip3`→Kip | |
| `o` | o | 火 `fo2`→Fo; 何 `ho4`→Ho | |
| `oi` | oi | 彩 `coi2`→Choi | |
| `ou` | **o** | 埔 `bou3`→Po; 澳 `ou3`→O | note: **not** "ou" |
| `u` | u | 富 `fu3`→Fu | but 孚 `fu1`→**Foo** (irregular) |
| `ui` | ui | 梅 `mui4`→Mui | |
| `un` | un | 門 `mun4`→Mun | |
| `ung`, `uk` | ung, uk | 紅→Hung; 涌 `cung1`→Chung | |
| `oe`, `oeng`, `oek` | eu, eung, euk | 將 `zoeng1`→Tseung; 香 `hoeng1`→Heung; 長 `coeng4`→Cheung | |
| `eoi` | **ui** | 咀 `zeoi2`→Tsui; 水 `seoi2`→Shui | |
| `eon`, `eot` | un, ut | 順 `seon6`→Shun | |
| `yu` | yu / u | 魚 `jyu4`→Yu | |
| `yun`, `yut` | uen, uet | 元 `jyun4`→Yuen; 屯 `tyun4`→Tuen; 荃 `cyun4`→Tsuen | |
| `eng`, `ek` | eng, ek | 嶺 `leng5`→Ling/Leng; 石 `sek6`→Shek | 粉嶺→**Fanling** shows `eng`→ing here |
| `ok`, `ong` | ok, ong | 角→Kok; 塘 `tong4`→Tong | |
| `ap`/`at`/`ak` | ap/at/ak | 鴨 `aap3`→Ap | |
| syllabic `m`, `ng` | m, ng | 吳 `ng4`→**Ng** | preserved unchanged |

**Attested irregulars that no rule pack should try to derive.** These must live in an exception table, and their existence is itself the argument for lookup-before-generate.

| Chinese | Jyutping | Attested | What the rules would give |
|---|---|---|---|
| 香港 | `hoeng1 gong2` | **Hong Kong** | Heung Kong |
| 九龍 | `gau2 lung4` | **Kowloon** | Kau Lung |
| 旺角 | `wong6 gok3` | **Mong Kok** | Wong Kok |
| 觀塘 | `gun1 tong4` | **Kwun Tong** | Kun Tong |
| 紅磡 | `hung4 ham3` | **Hung Hom** | Hung Ham |
| 恆安 | `hang4 on1` | **Heng On** | Hang On |
| 美孚 | `mei5 fu1` | **Mei Foo** | Mei Fu |
| 粉嶺 | `fan2 leng5` | **Fanling** (one word) | Fan Leng (two words) |

The first three are documented pre-1888 survivals: *Kowloon*, *Hong Kong* and *Un Chau Street* are cited as forms that predate and contradict the later convention. ([Hong Kong Government Cantonese Romanisation](https://en.wikipedia.org/wiki/Hong_Kong_Government_Cantonese_Romanisation))

### 2.2.4 M1 returns structured units, not formatted text (CHG-015)

**RULE-HKR-4a (RECOMMENDED; amended CHG-050).** The M1 generator returns a **non-empty sequence of romanised units, each carrying its own source span, together with a structurally valid `grouping`**; it does not return a rendered string. The selected word boundaries may be advisory as a linguistic claim, but the emitted grouping has exact executable semantics. Capitalisation, sentence casing, hyphenation and inline/ruby layout remain presentation-layer decisions.

```jsonc
"romanisation": {
  "units": [
    { "span": [0, 1], "text": "tsim", "syllable": "zim1" },
    { "span": [1, 2], "text": "sha",  "syllable": "sa1"  },
    { "span": [2, 3], "text": "tsui", "syllable": "zeoi2" }
  ],
  "grouping": [[0], [1], [2]],   // orthographic words: "tsim" | "sha" | "tsui"
  "provenance": "rule_engine", "status": "fallback"
}
```

Consequences of this change:

- **General prose is not required to capitalise every syllable.** Romanising a sentence yields lower-case units; a consumer that wants sentence case, title case or all-caps applies it. The earlier rule ("one capitalised orthographic word per syllable") was a presentation decision smuggled into the mapping and is withdrawn.
- **Grouping choice may be advisory; grouping execution is normative (CHG-050).** Concatenation is linguistically unpredictable — *Fanling* is one word, *Sheung Shui* is two, and *Kowloon* is one word for two syllables. Unless supported by attestation, the generator's chosen word boundaries remain a heuristic; once emitted, their execution is exact.
- **Grouping is a complete ordered partition.** For every `AssembledRomanisation` and `AssembledEnglishForm`, and every `assembled:true` branch of `MemoryRomanisation` and `MemoryEnglishForm`, `units` and `grouping` are non-empty; every inner group is non-empty; and `flatten(grouping)` equals exactly `[0, 1, ..., units.length - 1]`. These are the four grouping-bearing assembled surfaces; the discriminated `assembled:false` memory branches retain exact `text` and carry no units or grouping. Omissions, duplicate indices, overlaps and reordering are invalid. Each inner group denotes one orthographic word: concatenate its referenced unit text with no separator, then join consecutive group results using exactly U+0020 SPACE. Preserve units-array order and perform no normalisation. CHG-048's integer/local-index bounds continue to apply; §5.6 is authoritative for validation.
- **Casing is intrinsic only where the form is attested.** An E3 row for 尖沙咀 stores the literal attested string *Tsim Sha Tsui*, casing included, because that casing is part of the attested fact. Generated units carry no casing claim.
- **Hyphenation is never generated.** It is a personal-name style option (§2.4.4) and a place-name exception, not a mapping output.

### 2.2.5 How M1 output is marked (CHG-007)

**RULE-HKR-4 (RECOMMENDED, amended; vocabulary updated by CHG-038).** M1 output carries `provenance: rule_engine`, `status: fallback`, `confidence: low`, **`formKind: "romanisation"` with `assembled: true`** — the L3R channel plus `assembled` already carries the mechanism, and the withdrawn `kind: mechanical_romanisation` value no longer exists (§4.16). It is never written into an entity's name slot (RULE-HKR-2 stands).

**Presentation is not mandated.** The engine's obligation is that provenance is *present and retrievable*. It is **not** required that every consumer render a "generated" label on every annotation. Specifically:

- The **Language Lab and any debug view MUST** expose provenance clearly and unmissably — that is their purpose.
- **Ordinary presentation** — including a future Reader showing romanisation over running prose — **may remain visually quiet.** Labelling every syllable of a paragraph "generated" would be noise, would violate the "annotations subordinate to source text" constraint, and would train the user to ignore the marker precisely where it matters.
- The distinction that must survive in ordinary presentation is between *a generated form* and *an asserted name*. A generated form displayed as pronunciation support is not an assertion; the same string written into a name field is.

---

## 2.3 The evidence hierarchy — when is a spelling *attested*?

This is the core of §2. "Use conventional Hong Kong spelling where available" is not implementable until "available" and "conventional" are defined operationally.

### 2.3.1 Evidence classes

Each class states: what it is, what it establishes, what it does **not** establish, and the maximum confidence it can support.

| Class | Evidence | Establishes | Does **not** establish | Max confidence | Provenance value |
|---|---|---|---|---|---|
| **E1a** | **User preference.** The user has entered a form they want used, without asserting that it is anyone's real spelling. | That this output is **preferred for this user's documents**. | That the form is used by anyone in the world. | `high` for *output precedence*; **no attestation value** | `user_glossary` |
| **E1b** | **Creator-canonical form.** The user is the author/owner of the named thing (a character in their own fiction, a project, an invented place) and is *defining* its English form. | That the form is **canonical by authorial stipulation**. Within the user's own material this is the strongest possible evidence. | Anything about external usage. | `high` | `user_glossary` |
| **E1c** | **Bearer assertion.** The user reports how a specific real person, place or organisation spells its name. | The spelling for **that individual entity**, on the user's report. | Anything about other bearers of the same characters; and it is a report, not a document. | `high` | `user_glossary` (entity-scoped) |
| **E2** | **Registered / documentary evidence.** A form recorded on an identity document, company registry entry, official letterhead, or other record of the individual. | The spelling for **that individual entity**, as an attested identity fact. | Any reproducible rule. See §2.4.3. | `high` | `user_glossary` (entity-scoped, with `attestation`) |
| **E3** | **Government gazetted / official geographic name.** Lands Department place-name database, gazetted street names, official maps. | The official English name of **that place or street**. | That the form is a *romanisation* (it may be a translation or an English original). | `high` | `convention_table` |
| **E4** | **Institutional self-designation.** The organisation's own published English name. | The official English name of **that organisation**. | Anything about how its characters are spelled elsewhere. | `high` | `convention_table` |
| **E5** | **Broad public attestation.** A form in wide, consistent, verifiable Hong Kong usage for a specific entity, without official status. | That the form is **conventional** for that entity. | That it is official; that it is the only conventional form. | `medium` | `convention_table` |
| **E6** | **Class-level descriptive attestation.** Compiled tables of surname spellings, syllable-spelling tables, descriptive romanisation references. | That a spelling is a **recognised conventional spelling of that character/syllable class**. | **That any particular bearer uses it.** This is the most-abused class. | `medium` for the class; `low` when applied to an individual | `convention_table` |
| **E7** | **No attestation.** Rule generation only. | Nothing about the world. Only conformity to the declared rule pack. | Everything else. | `low` | `rule_engine` |

**RULE-HKR-5a (RECOMMENDED, CHG-013) — output precedence is not attestation.** A user entry always wins the *resolution race*: it is what gets displayed and exported. That is a statement about **precedence**, not about **evidence**. The engine must therefore record `evidenceClass` (E1a/E1b/E1c/E2/…) separately from `provenance` (`user_glossary`/`entity_record`/…), and must not report a user-entered form as externally verified.

Practical difference, same input, three meanings:

| The user types 梁知遙 → *Leung Chiyiu* because… | Class | What the Lab may say |
|---|---|---|
| "this is how I want it rendered in my documents" | E1a | "Your preferred form." Never "attested". |
| "this is my character; this is her name" | E1b | "Canonical (your definition)." |
| "I know this person; that is how she spells it" | E1c | "Bearer spelling (reported)." |
| "here is her HKID / business card" | E2 | "Bearer spelling (documented)." |

**RECOMMENDED.** The glossary editor asks which of these applies when an entry is created, with E1a as the default so the low-friction path never overstates. Recording it costs one control and buys the difference between a preference and a claim about the world. `verified` (§1.7) remains a separate boolean on the stored record — a user may mark an E1a preference "verified as my house style" without that making it E2.

**RULE-HKR-5 (RECOMMENDED) — attestation scope is part of the evidence.** Every convention-table row records `attestationScope ∈ { individual, institution, place_instance, class }`. A class-scoped row (E6: 梁 → *Leung*) may be *used* to spell an individual's surname, but the resulting annotation is downgraded to `confidence: low` and marked `scopeDowngrade: class_applied_to_individual`. This single mechanism prevents the most common category error in name tooling: treating "Leung is a conventional spelling of 梁" as "this 梁 person is called Leung".

**RULE-HKR-6 (RECOMMENDED) — recency and drift.** Every convention row carries `sourceRef` and `asOf`. Gazetted names change; datasets are withdrawn (§0.5). A row older than a configurable staleness horizon is still used but flagged `caution: stale_source`.

### 2.3.2 What counts as a "conventional match" — operational definition

A spelling *S* is a **conventional match** for span *X* if and only if all of:

1. **Identity.** There exists a convention-table row whose key matches *X* exactly, after NFC normalisation and the declared variant folding (INV-9), **and** whose `attestationScope` is compatible with how *X* was classified.
2. **Evidence floor.** The row's evidence class is **E1c, E2, E3, E4 or E5** — that is, evidence *about the world* — or E6 *with* the scope downgrade applied. **E1a (user preference) and E1b (creator-canonical) are excluded**: they win the resolution race (RULE-HKR-5a) but they are not external convention, and calling them a "conventional match" would be the precise category error this definition exists to prevent. A value may therefore be `resolved` with `confidence: high` and still not be a conventional match; **`externalAttestation`** is the field that records the difference (contract vocabulary, CHG-039 E).
3. **Enabled and current.** The row is not disabled and not superseded by a later row for the same key.
4. **Uniqueness or resolved competition.** Either the row is the only candidate at its evidence class, or the competition rule (§2.3.3) selects one and records the others as alternatives.

If any condition fails, *S* is not a conventional match. There is no "partial" conventional match: a name whose surname is attested and whose given name is not is represented as a **composite** with per-part provenance (§2.8), not as a conventional name.

### 2.3.3 Conflicts between conventions

Real conflicts are common and are not errors to be smoothed over.

| Conflict type | Example | Resolution | Resulting status |
|---|---|---|---|
| Two forms, **different evidence classes** | Gazetteer (E3) says *Nathan Road*; a compiled table (E6) offers *Nei Tun To* | Higher class wins; lower retained as an alternative with its class shown | `resolved`, `alternatives` populated |
| Two forms, **same evidence class**, both well attested | 蔡 → **Choi** / **Choy**; 周 → **Chow** / **Chau**; 徐 → **Tsui** / **Chui** | **No automatic winner.** Both retained, ordered by attestation count where counts exist | `ambiguous` |
| Two forms, same class, one clearly dominant | count(*Chan*) ≫ count(*Chun*) for 陳 | Dominant selected; `tieBreak: attestation_count` recorded with the counts | `resolved`, `confidence: medium` |
| Two **enabled user glossary entries** matching the same span with different values | user adds both 梁→*Leung* and 梁→*Liang* | **Never auto-resolve.** The engine refuses to choose between two assertions of equal authority | `conflict` — requires user action |
| User glossary contradicts an official gazetted name | user sets 彌敦道 → *Nathan Rd.* | **User wins** (it is their document and their preference), but `caution: overrides_official` is attached and the official form is retained as an alternative | `resolved`, cautioned |
| Same characters, **different real-world referents** with different official forms | 大埔 (Tai Po, HK) vs a same-named place elsewhere | Not resolvable without entity disambiguation; defer to §4 | `ambiguous` |

**RULE-HKR-7 (RECOMMENDED).** The engine never breaks a same-class tie by alphabetical order, table order, hash, or "first match". If it cannot justify a choice, the status is `ambiguous` and every candidate is returned. Arbitrary tie-breaking is the mechanism by which a tool teaches its user a falsehood.

### 2.3.4 Building the convention table — sourcing plan

**RECOMMENDED**, per the §0.5 evidence standard.

| Domain | Primary source | Extraction | Evidence class | Notes |
|---|---|---|---|---|
| Districts, areas, villages, hydrographic and topographic names | Lands Department place-name database via the DATA.GOV.HK [Geographic Name dataset](https://data.gov.hk/en-data/dataset/hk-landsd-openmap-landsd-geographic-name) (Place Name API; monthly; derived from *A Gazetteer of Place Names*, 1960) | Bilingual name pairs → `place_instance` rows | E3 | Snapshot with `asOf`; free re-use subject to DATA.GOV.HK terms |
| Streets and roads | Lands Department street-name data; [GeoAddress Finder](https://tools.csdi.gov.hk/geoaddressfinder/); [Address Lookup Service](https://data.gov.hk/en-data/dataset/hk-dpo-als_01-als) | Bilingual pairs → `place_instance` rows, plus generic-element inventory (§2.5.2) | E3 | The DATA.GOV.HK Street Name dataset page carries a withdrawal notice effective 21.01.2025 — treat the endpoint as unstable and prefer ALS/CSDI |
| Buildings, estates, addresses | Address Lookup Service; CSDI | Bilingual pairs | E3 | High volume; consider on-demand rather than bundled |
| Institutions and organisations | The organisation's own published English name | Manual or curated list | E4 | Small curated set is more valuable than a large scraped one |
| Surnames | **No authoritative government list is known to this session.** | Derive class-level rows empirically from attested corpora, with counts; supplement with descriptive compilations, capped at E6 | E6 | See §2.4.2; do not present as official |
| Syllable-level spellings | Induced from the E3 corpora above (§2.7) | Frequency table | E6 (class) | This is the generator's data, not a name table |

**Open gap, stated honestly.** For personal names the engine has *no* primary source at all beyond what the user supplies. There is no public register of how individuals spell their names. This is not a research shortfall in this session — it is a structural property of the problem, and it is why M3 exists as a separate mechanism whose only inputs are E1 and E2.

---

## 2.4 Personal names

### 2.4.1 Structure

**RECOMMENDED** representation, resolved before spelling:

```
PersonNameStructure {
  surname:    { span, chars, isCompound }      // 陳 | 歐陽 | 司徒
  givenName:  { span, chars[] }                // 1–2 chars typically, 3 occurs
  westernGiven?: { span, text }                // "Peter" in 陳大文 / Peter Chan
  maidenSurname?: { span, chars }              // the 方 in 陳方安生-type forms
  order: "surname_first" | "given_first"
  confidence, ambiguity
}
```

Structural facts that matter for spelling:

- **Compound surnames** (歐陽, 司徒, 諸葛, 上官) must be recognised as one unit; splitting them produces two wrong syllable roles. Their conventional forms are typically hyphenated or fused: 歐陽 → *Au-Yeung*, 司徒 → *Szeto*.
- **Married double-surname forms** (husband's surname + maiden surname + given name) are a real Hong Kong pattern and are frequently rendered with all four elements in English. The structure, not just the characters, determines the spelling layout.
- **Three-character given names** and **two-character surnames** both occur; a 3-character name is *usually* 1+2 but not always, and a 4-character name is genuinely ambiguous between 2+2 and 1+3.
- **Western given names** may precede or follow, and are not romanised — they are already English. In an assembled mixed name they are `LiteralEnglishUnit`s: they carry exact text and a source span, never a Cantonese `syllable`, and are never licensed by `styleApplicable`. The Chinese components use `RomanisedEnglishUnit`s; only generated romanised `role:"given"` units may be toggled (§5.7).

### 2.4.2 Surnames: class-level convention, never individual truth

The most useful and most dangerous table in the system.

**Well-attested class-level conventions (E6)** — a non-exhaustive illustration, offered as *recognised conventional spellings*, not as anyone's name:

| 姓 | Jyutping | Common HK form(s) | Note |
|---|---|---|---|
| 陳 | `can4` | Chan | *Chen* (PRC), *Tan* (Hokkien), *Tran* (Vietnamese) also exist for the same character |
| 李 | `lei5` | Lee, Li | community-dependent |
| 黃 | `wong4` | Wong | |
| 張 | `zoeng1` | Cheung | |
| 梁 | `loeng4` | Leung | |
| 何 | `ho4` | Ho | |
| 劉 | `lau4` | Lau | |
| 林 | `lam4` | Lam | **collides with 藍 Lam** |
| 吳 | `ng4` | Ng | **collides with 伍 Ng** |
| 周 | `zau1` | Chow, Chau | genuinely ambiguous |
| 蔡 | `coi3` | Choi, Choy, Tsoi | genuinely ambiguous |
| 徐 | `ceoi4` | Tsui, Chui | genuinely ambiguous; **Tsui also serves 崔** |
| 許 | `heoi2` | Hui | |
| 謝 | `ze6` | Tse | |
| 鄭 | `zeng6` | Cheng | |
| 曾 | `zang1` | Tsang | |
| 葉 | `jip6` | Yip, Ip | |
| 岑 / 沈 | `sam4` / `sam2` | Shum | **two surnames, one spelling** |
| 歐 / 區 | `au1` / `au1` | Au | **two surnames, one spelling** |
| 邱 / 尤 / 游 / 丘 | `jau1` / `jau4` | Yau | **four surnames, one spelling** |
| 歐陽 | `au1 joeng4` | Au-Yeung | compound |
| 司徒 | `si1 tou4` | Szeto | compound, fused |

Two independent many-to-many relations are visible here and both must be modelled:

- **One character → several conventional spellings** (蔡 → Choi/Choy/Tsoi). Handled as `ambiguous` with alternatives.
- **One spelling → several characters** (Yau ← 邱/尤/游/丘). This makes the reverse direction unusable: **an HK romanisation can never be used to recover characters or pronunciation.** Recorded as a hard non-capability (§2.10).

**RULE-HKR-8 (RECOMMENDED).** A surname spelled from the class table is emitted with `provenance: convention_table`, `attestationScope: class`, `scopeDowngrade: class_applied_to_individual`, `confidence: low`, and — where the character has competing conventions — `status: ambiguous` with all candidates. It is *not* `resolved` merely because a table row existed.

### 2.4.3 Registered spelling is an identity fact, not a rule output (CHG-005)

This packet makes **no claim** that a person's registered English name is derivable from their characters. The Immigration Department's published [identity card FAQ](https://www.immd.gov.hk/eng/faq/faq_hkic.html) describes the documentary process for *changing* a registered name and says nothing about how a romanised form is determined or assigned. Absent an authoritative current primary source, the engine treats registered spelling as class **E2** evidence about one individual, obtainable only if the user supplies it.

Design consequences:

- The engine must make it **easy and low-friction to record a bearer spelling** (one field, one keystroke from the Lab's debug panel), because that is the only route to a `high`-confidence personal name.
- The engine must **never** display a generated personal name in a way that could be copied into a document as if registered. §2.9 specifies the presentation.
- The engine must not "learn" a class convention from a single bearer entry. One person writing 梁 as *Liang* does not change the class table. Class tables are updated only by an explicit curation action with its own evidence class.

### 2.4.4 Joining, capitalisation and ordering

Attested Hong Kong conventions for a two-character given name include hyphenated, spaced and joined forms, plus all-capitals surname presentation. CHG-050 maps them to the complete current five-member `StyleProfile`; the legacy labels formerly shown here are no longer live API values.

| `StyleProfile` | Exact rendering of the canonical assembled 梁知遙 fixture |
|---|---|
| `hyphenated` | `Leung Chi-yiu` |
| `joined` | `Leung Chiyiu` |
| `spaced` | `Leung Chi Yiu` |
| `hyphen_title` | `Leung Chi-Yiu` |
| `surname_caps` | `LEUNG Chi-yiu` |

`given_first` is **not** a style member and no renderer reorders units; name order is represented upstream by `PersonNameStructure.order` and the units-array order. The five profiles are explicit presentation choices only. None sets, implies or resolves the global `givenNameJoin` default. `surname_caps` is a Lab-only presentation profile and is invalid for `GeneratedPersonNameStyle`.

**UNRESOLVED (CHG-009).** `givenNameJoin` is a configurable style parameter. **The global default is deliberately left unset.**

The earlier inference — that 梁知遙 → *Leung Chiyiu* established `concat_title` as the global convention — is withdrawn. That example specifies the desired form **for that entity**, and is correctly modelled as an explicit **entity-scoped HK Romanisation glossary entry** (evidence class E1a/E1b per §2.3.1) — durable entity records are deferred from v1 (§5.10.3) — not as a generator default. Generalising from one entity to a global rule is precisely the class-vs-individual error that RULE-HKR-5 exists to prevent, and it would have been committed by the packet itself.

Until corpus evidence or an explicit product decision settles it, the engine's behaviour is:

- The generator emits **caseless structured units plus a valid grouping** (RULE-HKR-4a); it emits no rendered text and selects no `StyleProfile`.
- At presentation time, grouping composes orthographic words using no separator inside a group and exactly U+0020 SPACE between groups. A selected profile may then transform only its licensed targets and never reorder units; §5.11 defines the exact separator precedence and ASCII-only casing.
- Where an entity has an attested or stipulated form, that form is used verbatim and neither grouping nor a join style is applied.

Deciding the default is not a prerequisite for implementation, because nothing in the engine depends on it.

**Ordering.** Default `surname_first` (HK convention). Configurable. When a western given name is present, the recommended default is `Western Given + Surname + Romanised Given` (e.g. *Peter Chan Tai-man*), which is the dominant HK pattern, but this is HEURISTIC and configurable. The assembled `EnglishForm` is `person:true`, normally `formKind:"hybrid"`, and preserves the Western component as a literal unit; it never fabricates a Cantonese syllable for *Peter*.

**Capitalisation.** A **presentation-profile** concern (CHG-015), not a mapping output. The renderer uses the locale-independent ASCII code-unit operations in §5.11. `hyphenated` lower-cases later elements of each licensed adjacent run; `hyphen_title` title-cases each licensed element. The generator itself emits caseless units.

### 2.4.5 Cases where generating a personal name is actively misleading

**RULE-HKR-9 (RECOMMENDED).** Before emitting a generated personal name, the engine runs a **generation guard** and attaches caution codes. It still emits the form (suppression would be unhelpful), but the cautions drive the UI treatment and block any "looks official" presentation.

| Guard | Trigger | Caution code | Why generation misleads |
|---|---|---|---|
| Non-Cantonese naming convention suspected | Name pattern or context suggests a Mainland, Taiwanese, Singaporean or overseas bearer | `non_hk_convention_suspected` | 王小明 is conventionally *Wang Xiaoming* (Pinyin), not *Wong Siu-ming*. The engine cannot know the bearer's community, and guessing imposes one. |
| Japanese / Korean name suspected | Characters and pattern typical of Japanese or Korean names | `cjk_non_chinese_suspected` | 田中 is *Tanaka*, not *Tin Chung*. Cantonese romanisation of a Japanese name is simply wrong. |
| Transliterated foreign name | The Chinese is itself a transliteration of a non-Chinese name | `foreign_origin_suspected` | 碧咸 is *Beckham*; romanising gives *Pik Ham*. The correct operation is recovery, not romanisation (M5). |
| Sibilant class unknown | The character is absent from the sibilant-class table (§2.2.2) | `sibilant_class_unknown` | Both Ts- and Ch- (or S-/Sh-) are plausible; picking one invents precision. |
| Surname has competing conventions | 蔡, 周, 徐, 葉 … | `multiple_conventions` | The generated form is one of several equally conventional forms. |
| Surname spelling collides | Yau, Shum, Au, Ng, Lam | `spelling_collision` | The output is not uniquely identifying. |
| Bearer spelling likely exists | Entity is a real named person with no glossary entry | `bearer_spelling_unknown` | The right answer exists in the world and the engine does not have it. |

Detection of the first three guards is **HEURISTIC and will have false positives and negatives**. That is acceptable because the guard only adds caution — it never changes or suppresses the value. A false positive costs a redundant warning; a false negative returns the engine to its default behaviour, which is already "generated, low confidence".

---

## 2.5 Places, streets, buildings

### 2.5.1 Lookup first, always

**RULE-HKR-10 (RECOMMENDED).** For any span classified as a place, street, building or estate, the engine attempts convention-table lookup (E3) on the **whole span** before any decomposition or generation. Whole-span lookup is what produces *Causeway Bay* for 銅鑼灣, *Aberdeen* for 香港仔 and *Nathan Road* for 彌敦道 — none of which any decomposition would reach.

Only if whole-span lookup fails does the engine decompose (§2.5.2), and only if decomposition fails does it generate.

### 2.5.2 Specific + generic decomposition

Hong Kong place and street names typically consist of a **specific** element (romanised) plus a **generic** element (translated). The generic inventory is small and should be a table, not a rule.

| Generic | Jyutping | Usual English | Counter-cases |
|---|---|---|---|
| 街 | `gaai1` | Street | |
| 道 | `dou6` | Road | 大道 → Praya / Road / Avenue varies |
| 路 | `lou6` | Road | |
| 徑 | `ging3` | Path | |
| 里 | `lei5` | Lane | |
| 巷 | `hong6` | Lane | |
| 台 | `toi4` | Terrace | |
| 坊 | `fong1` | Square | **蘭桂坊 → Lan Kwai Fong** — romanised, not translated |
| 圍 | `wai4` | Circuit / Wai | genuinely inconsistent |
| 灣 | `waan1` | Bay / Wan | 荃灣 → Tsuen **Wan**; 淺水灣 → Repulse **Bay** |
| 邨 | `cyun1` | Estate | attested as *Tsuen* / *Chuen* in some names |
| 苑 | `jyun2` | Court | |
| 花園 | `faa1 jyun2` | Gardens | |
| 大廈 | `daai6 haa6` | Building / House / Mansion | genuinely inconsistent |
| 中心 | `zung1 sam1` | Centre | |
| 廣場 | `gwong2 coeng4` | Plaza / Square | |
| 山 | `saan1` | Hill / Mountain / Shan | 馬鞍山 → Ma On **Shan**; 鑽石山 → Diamond **Hill** |

**CONFIRMED (pattern).** Generic terms are commonly substituted rather than romanised — *Street* and *Road* in place of *Kai* (街) and *Lo* (路) — with documented exceptions such as *Lan Kwai Fong*, and with *Wan* used for Bay and *Tsuen*/*Chuen* for Estate. ([Hong Kong Government Cantonese Romanisation](https://en.wikipedia.org/wiki/Hong_Kong_Government_Cantonese_Romanisation))

**RULE-HKR-11 (RECOMMENDED).** Generic-element substitution is a **table lookup with per-entry alternatives**, never a rule. Where a generic has more than one attested treatment (灣, 山, 圍, 大廈), decomposition yields `status: ambiguous` with both forms, unless whole-span lookup already succeeded.

### 2.5.3 Structural warning: decomposition output is not a name

A decomposed result (*specific* generated + *generic* translated) is a **composite with mixed provenance**, exactly like a part-attested personal name. 彌敦道, if it were absent from the gazetteer, would decompose to *Nei Tun Road* — well-formed, plausible-looking, and wrong. The composite must therefore carry `status: fallback` and `caution: decomposed_not_attested`, and the UI must not render it as an established name.

In the public shape this is an assembled `EnglishForm` with `formKind:"hybrid"`, `person:false`, romanised units for the specific and translated units for the generic. Only the romanised branch carries syllable semantics. It has no person-style metadata: Hyphenated/Joined never rewrites *Road* or any non-person component.

The illustrative *Nei Tun Road* assembly uses units `["nei", "tun", "Road"]` with grouping `[[0], [1], [2]]`. The former `[[0, 1], [2]]` would encode the first two units as one orthographic word and is not the declared fixture.

---

## 2.6 Precedence chains

Because M1–M5 answer different questions, they need **different chains**. A single chain is what produced the original brief's conflation.

### Chain A — `hkRomanisation` (M1/M2): "how is this written in HK-style spelling?"

| # | Source | Evidence | Status if it fires |
|---|---|---|---|
| 1 | **HK Romanisation glossary** (this store only), enabled, longest match | E1a/E1b/E1c | `resolved`, `high` |
| 2 | Bearer/registered romanised form — an **entity-scoped HK Romanisation entry** carrying E1c/E2 evidence (durable Entity Records are deferred, §5.10.3) | E1c/E2 | `resolved`, `high` |
| 3 | Attested **romanised** form for this entity in the convention table (whole-span) | E3/E5 | `resolved`, `high`/`medium` |
| 4 | Class-level conventional spelling per element (surname table, syllable table) | E6 | `resolved` or `ambiguous`, `low` (scope downgrade) |
| 5 | Deterministic generation (§2.2) | E7 | `fallback`, `low` |
| 6 | — | — | `unresolved` (no Cantonese reading available) |

**Official English names do not enter Chain A.** *Nathan Road* is not an HK-style spelling of 彌敦道, and returning it here would make the field mean two things.

### Chain B — `englishForm` (M2–M5): "what is this actually called in English?"

| # | Source | Evidence | Status if it fires | `formKind` / `assembled` |
|---|---|---|---|---|
| 1 | **Translation / English-form glossary** (this store only — **not** the HK Romanisation glossary), enabled, longest match; entity-scoped entry only | E1a/E1b/E1c/E2 | `resolved`, `high` | exact `StoreEntry.value`, with the entry's required `StoreEntry.formKind`; always `assembled:false` |
| 2 | Bearer/registered form — an **entity-scoped translation/English-form entry** carrying E1c/E2 evidence (§5.10.3) | E1c/E2 | `resolved`, `high` | exact stored string plus the stored `formKind`, `assembled:false`. **Evidence class never determines mechanism** (CHG-039 C/CHG-044 A): E1c/E2 says *how it is known*, not *what kind of form it is* |
| 3 | Official gazetted geographic name | E3 | `resolved`, `high` | `official_name` \| `native_original` \| `romanisation` \| `hybrid` (`assembled:false`) |
| 4 | Institutional self-designation | E4 | `resolved`, `high` | `official_name`, `assembled:false` |
| 5 | Broad public attestation | E5 | `resolved`, `medium` | `romanisation` \| `official_name`, both `assembled:false` |
| 6 | Generic-element decomposition (§2.5.2) | E3+E7 | `fallback`, `low` | assembled `hybrid` with romanised specific and translated generic units |
| 7 | Chain A result, imported — **properties inherited, not flattened** (RULE-ENT-10) | inherited from the L3R value | inherited | `romanisation`; `assembled` inherited |
| 8 | — | — | `unresolved` — the span is reported to the consumer as an **unresolved semantic span** | — |

**Lexical and phrase translations are NOT in this chain (CHG-042 A).** An earlier step 8 resolved a stored lexical or phrase translation into an `englishForm`. That contradicted §4.7.2 and §5.8, which are authoritative: a `lexical`- or `phrase`-scoped translation entry is **core L4 guidance over a span** in `Analysis.termResolutions`; only a selected value projects as a `TermDirective`, while a conflict projects none. It **never becomes an entity's English name**. The step is removed; after the L3R fallback path, an unresolved L3E **stays unresolved**.

Two things remain true and are easy to conflate:

- An **`entity`-scoped** translation/English-form entry is **Chain B step 1**, requires a persisted `formKind`, and may legitimately carry `formKind:"translation"` when that is the stored English form of the entity (灣仔街市 → *Wan Chai Market*). It remains exact/verbatim; StoreEntry never carries assembly units.
- A **`lexical`/`phrase`** entry has no `formKind`, is located independently of Chain B and appears in `Analysis.termResolutions`. Only a selected core value is projected as a `TranslationDirectives.termDirective`; a conflict remains a null-valued core conflict and projects no preferred string. The engine does not **resolve** it into a name.

**No internal translation engine (CHG-030, restated).** The engine performs no full-sentence or free semantic translation and calls no model. Where no English form resolves, the honest output is `unresolved` plus a directive telling an external consumer that the span is theirs to translate (§4.9, §5.8).

### Chain C — general text romanisation (M1 over non-entity spans)

| # | Source | Status |
|---|---|---|
| 1 | **Exact whole-form HK Romanisation glossary** match on the span (this store only) | `resolved`, `high`; `VerbatimRomanisation`, `assembled:false`, exact stored text |
| 2 | Composed per-character attested spelling table (E6, class) | `resolved`, `low`; assembled |
| 3 | Deterministic generation | `fallback`, `low`; assembled |
| 4 | No Cantonese reading | `unresolved` |

Every Chain C result has **`formKind:"romanisation"`** and never populates a name field, but assembly follows the actual mechanism (CHG-044 G): an exact user-supplied whole-form match is `VerbatimRomanisation` with `assembled:false`; composed class-level/per-character and deterministic generated outputs are `assembled:true`. Travelling through Chain C never relabels exact supplied spelling as generated.

### Store independence across the chains (CHG-012)

**RULE-HKR-14 (RECOMMENDED), restating INV-12 for this section.** Each chain consults exactly one user store:

| Chain | Store consulted | Store **not** consulted |
|---|---|---|
| A — `hkRomanisation` | HK Romanisation glossary | translation/English-form glossary; pronunciation dictionary |
| B — `englishForm` | translation / English-form glossary | HK Romanisation glossary |
| C — general romanisation | HK Romanisation glossary | the other two |

An entry in one store **never** silently populates or overrides another. Chain B step 7 imports the **computed** Chain A result — a computation, not a store read. It **preserves that value's material properties** (`provenance`, `evidenceClass`, `status`, `externalAttestation`, `assembled`, attestation) and records only the cross-layer route in `derivedFrom` (RULE-ENT-10, CHG-025). **It does not relabel the value as generated merely because the route was a fallback**: a verbatim user-glossary romanisation arriving this way is still verbatim, still `user_glossary`, still `resolved` (CHG-039 C).

**One `StoreEntry` belongs to exactly one store (CHG-042 B).** `StoreEntry.store` is single-valued and there is no `appliesToBoth` concept — a dual-store entry has no v1 schema representation and would breach INV-12 by construction. Cross-store application therefore has exactly **one** route: an explicit user action ("also use this as the English name") which **creates a second typed entry** after confirmation, visible in its own store. The earlier alternative — "an entry explicitly typed as applying to both at creation time" — is withdrawn.

The computed Chain A → Chain B fallback (§4.9) is **not** a cross-store write and is unaffected: it consumes a *value*, writes nothing, and preserves that value's provenance. The reason is that the stores answer different questions: a user who fixes a *spelling* has not thereby decided what a thing is *called* in English, and a user who supplies an English name has said nothing about how its characters should be romanised in running text.

**Analysis of the brief's original chain.** The brief proposed: user glossary → established entity-specific spelling → known surname/place conventions → deterministic fallback → unresolved. That chain is sound and is preserved as Chain A. The changes are (a) inserting bearer/registered evidence as a distinct step above class conventions, (b) splitting off Chain B so official English names stop competing with romanisations, and (c) adding Chain C so general romanisation has a defined path. No step of the original was found to be wrongly ordered.

**Edge case the chains do not resolve.** When a user glossary entry and an official gazetted name disagree, Chain B step 1 wins. This is deliberate — it is the user's document — but it means the engine will happily render a non-standard name across a document. The `overrides_official` caution and a Lab-level "diverges from official" filter are the mitigations. Whether the Reader should surface that caution is a §11 question, not an engine question.

---

## 2.7 Deriving and validating the rule pack

**RECOMMENDED.** Because no official specification exists (§2.2.1), the rule pack is *fitted* and its accuracy is *measured*. This is the difference between a defensible generator and a plausible-looking one.

**Procedure.**

1. **Ingest.** Pull bilingual name pairs from the Lands Department place-name and street sources (§2.3.4). Record `sourceRef`, `asOf`, and the licence.
2. **Read.** Obtain Jyutping for each Chinese name via the L2 engine (§3). Discard pairs whose reading is itself ambiguous, into a manual queue.
3. **Align.** Align Chinese syllables to English orthographic words. The common case is 1:1 across spaces. Non-1:1 pairs (*Kowloon*, *Fanling*) are diverted to the irregular table, not forced.
4. **Induce.** Build a frequency table keyed by `(character, jyutping_syllable, position)` → English spelling, with counts.
5. **Promote.** A key whose dominant spelling has count ≥ *N* and share ≥ *θ* becomes a convention-table row (class scope, E6-from-E3-corpus). *N* and *θ* are configurable; start at N=3, θ=0.9 and tune against held-out data.
6. **Residualise.** Keys failing the threshold become `ambiguous` rows carrying all candidates and counts. Non-decomposable pairs become irregular whole-name rows.
7. **Fit the fallback.** Fit the initial/final tables (§2.2.3) to the residual, for syllables with no character-level entry.
8. **Measure on held-out data.** Report, per rules version:
   - syllable-level exact-match rate,
   - whole-name exact-match rate,
   - coverage (share of syllables with a character-level entry),
   - the ts/ch and s/sh sub-accuracy specifically, since §2.2.2 predicts it will be the worst component.
9. **Publish.** The measured rates ship with `rulesVersion` and are shown in the Lab's about panel. Confidence bands (§1.7) for `rule_engine` output are justified by reference to these numbers, not asserted.

**Honest expectation.** Whole-name exact match against the gazetteer will be well below 100%, and the ts/ch and s/sh component is expected to be the dominant error source. If the measured whole-name accuracy is low, that is a *finding to display*, not a reason to hide the generator.

**Non-transfer warning.** Accuracy measured on *place names* does **not** transfer to *personal names*. Place names come from a single institutional tradition; personal names come from individual choices across communities and decades. The Lab must not quote a gazetteer-derived accuracy figure next to a generated personal name.

---

## 2.8 Provenance representation

Per CHG-002, romanisation and English surface form remain separately addressable. §5 chooses the container; §2 specifies the content of each.

### 2.8.1 Value shape

> **Superseded illustration (CHG-039).** The two payloads below predate CHG-027 and CHG-032 and use the withdrawn `kind` field. They are retained because the *point* they make — that channels stay separate, and that a verbatim form and an assembled one are different objects — is unchanged. **§5 is authoritative for shape**: `kind` no longer exists; use `formKind` + `assembled`; Case 1 is an `AssembledEnglishForm` (no `text`, no pre-rendered style list) and Case 2 a `VerbatimEnglishForm`. §5.18 carries the current-vocabulary version of exactly these two cases.

Two cases for the same input, showing why the channels stay separate.

**Case 1 — 梁知遙 with no glossary entry.** The engine returns caseless units plus a complete grouping, but no rendered text and no selected join profile (RULE-HKR-4a; CHG-009/050).

```jsonc
{
  "kind": "generated_romanisation",
  "provenance": "rule_engine",          // §1.7 closed set
  "status": "fallback",                 // composite: most severe part status
  "confidence": "low",                  // derived, §1.7 RULE-CONF-1
  "evidenceClass": "E7",
  "units": [
    { "span": [0, 1], "role": "surname", "text": "leung", "syllable": "loeng4",
      "provenance": "convention_table", "status": "resolved", "confidence": "low",
      "evidenceClass": "E6",
      "attestation": { "scope": "class", "sourceRef": "surname-table@2026-08", "asOf": "2026-08-01" },
      "scopeDowngrade": "class_applied_to_individual" },
    { "span": [1, 2], "role": "given", "text": "chi", "syllable": "zi1",
      "provenance": "rule_engine", "status": "fallback", "confidence": "low",
      "sibilantClass": "knowledge_series_ch" },
    { "span": [2, 3], "role": "given", "text": "yiu", "syllable": "jiu4",
      "provenance": "rule_engine", "status": "fallback", "confidence": "low" }
  ],
  "grouping": [[0], [1, 2]],            // complete ordered partition: surname word | given-name word
  // no rendered style list: current §5 projects the five StyleProfile values on demand
  "cautions": ["bearer_spelling_unknown"]
}
```

Note (CHG-017): 知 is **not** marked `sibilant_class_unknown`. It belongs to the 知-series, which the historical prior and attested usage both assign to *ch-*; manufacturing ambiguity for illustrative effect would violate the same honesty rule the packet is built on. The earlier *Leung Tsz-yiu* alternative is withdrawn — no evidence available to this session supports it.

**Case 2 — 梁知遙 with an entry the author created.** The stipulated form is used verbatim; no join style is applied, because the form is given, not assembled.

```jsonc
{
  "text": "Leung Chiyiu",
  "kind": "conventional_romanisation",
  "provenance": "user_glossary",
  "status": "resolved",
  "confidence": "high",                 // output precedence
  "evidenceClass": "E1b",               // creator-canonical — see RULE-HKR-5a
  "attestation": { "scope": "individual", "sourceRef": "user:hkr-glossary#412", "asOf": "2026-08-28" },
  "externalAttestation": "not_attested",  // CHG-013: precedence ≠ attestation
  "alternatives": [],
  "cautions": []
}
```

`externalAttestation: "not_attested"` is the field that keeps the two ideas apart. The value is authoritative for the author's documents and must be used; it is not a claim that anyone outside those documents writes the name that way.

### 2.8.2 Composite status derivation

**RULE-HKR-12 (RECOMMENDED).** For a composite (a name assembled from parts):

- `status` = the **most severe** part status, on the severity order
  `resolved < fallback < ambiguous < conflict < unresolved < unsupported`.
- `confidence` = the **minimum** part confidence band.
- `provenance` of the composite = `rule_engine` if *any* part is `rule_engine`; otherwise the least authoritative part provenance.
- `parts` are **always** retained, never collapsed.

The worked example above is the justification: 梁知遙 has an attested-class surname and a generated given name. Reporting the whole as `resolved`/`high` would overstate; reporting it as merely `unresolved` would discard the surname evidence. Only part-level provenance is honest, and the composite rule makes the summary conservative.

### 2.8.3 What must never happen

Restating INV-5 concretely for this section:

- A `rule_engine` value must never carry `provenance: convention_table` or `user_glossary`.
- A `rule_engine` value must never carry `confidence: high` or `medium`.
- A class-scoped attestation applied to an individual must always carry `scopeDowngrade`.
- A generated form that happens to *equal* an attested form is upgraded **only** if a lookup against the convention table actually matched — never by string comparison against the generator's own output.
- `alternatives` must never be dropped for brevity. Truncation for display is the UI's job, not the engine's.

---

## 2.9 Failure and uncertainty behaviour

| Situation | Engine behaviour | `status` | User-facing treatment |
|---|---|---|---|
| No Cantonese reading for a character (unknown, corrupt, non-Han) | Emit no romanisation for that element; keep the source character in place; composite becomes `unresolved` | `unresolved` | Source character shown, romanisation slot shows a neutral placeholder — **never** a guess, never omitted silently |
| Reading known, no attestation anywhere | Generate (M1) | `fallback` | **Provenance must be present and retrievable; presentation is not mandated** (CHG-007). The **Lab and any debug view MUST** expose generated status unmissably; **ordinary presentation may remain visually quiet**, because labelling every syllable of a paragraph "generated" is noise that trains the reader to ignore the marker. What must survive everywhere is the distinction between *a generated form* and *an asserted name* (RULE-HKR-4) |
| Character absent from the sibilant-class table | Emit **all materially plausible** candidates, ranked by the historical prior | `ambiguous` | **Engine data requirement only** (CHG-008). The Lab shows all candidates and offers one-action pinning; an ordinary consumer may show the top-ranked one and surface the rest on demand |
| Two attested conventions, equal class | Emit all, ordered by attestation count | `ambiguous` | All shown with their counts/sources |
| Two enabled user entries disagree | Emit **no** chosen value; return both | `conflict` | Explicit "you have two entries for this" prompt; blocks silent output |
| Entity boundary uncertain (§4) | Do **not** emit an entity-level name. Fall back to Chain C over the constituent tokens | `ambiguous` at entity level | Entity annotation withheld; general romanisation still available |
| Span is not Cantonese-readable (Latin, digits, symbols, Japanese kana) | No romanisation attempted | `out_of_scope` | Field hidden entirely, not shown as empty |
| External lookup fails (dataset endpoint down, §0.5) | Fall through to the next chain step; attach `caution: source_unavailable`; **never** treat absence of evidence as evidence of absence | as the fallthrough gives | A quiet diagnostic; the result is still produced |
| Generation guard fires (§2.4.5) | Emit the form with caution codes attached | `fallback` | Cautions shown in the debug panel. **Structured and debug exports preserve provenance and cautions; plain-text provenance markers are opt-in**, never forced (RULE-HKR-13 as amended by CHG-016) |
| Generated form has low measured accuracy for its syllable class | Emit with `confidence: low` and expose the per-class accuracy in the inspector | `fallback` | Inspector shows the measured rate rather than a vague hedge |

**RULE-HKR-13 (RECOMMENDED, amended by CHG-016) — export discipline.**

| Channel | Requirement |
|---|---|
| **Structured export** (JSON, debug dump, anything another tool consumes) | **MUST** preserve `provenance`, `status`, `evidenceClass`, `cautions` and `alternatives` in full. Non-negotiable: a structured export that drops provenance is a corrupted export. |
| **The Language Lab** | **MUST** make generated status visible at the point of viewing and at the point of copying. |
| **Plain-text copy** | **MUST NOT** be forced to append `[generated]` by default. Users copy text to use it; a mandatory marker makes the feature hostile and would be worked around immediately. |
| **Provenance markers in text output** | An **explicit, opt-in** copy/export option (e.g. "copy with provenance markers", "export with a provenance column"). |

The residual risk — a generated name pasted into a document acquiring false authority — is real but is mitigated at the point of *viewing* rather than the point of *copying*. A user who has seen a form marked as generated in the Lab and copies it anyway has made an informed choice, and the engine should not second-guess it.

---

## 2.10 Non-capabilities (stated as design facts)

These are not gaps to be filled later. They follow from the linguistics.

| # | Non-capability | Reason |
|---|---|---|
| NC-1 | **HK romanisation cannot be reversed to characters or to pronunciation.** | The map is many-to-one in both directions: *Yau* ← 邱/尤/游/丘; *Fat* ← 發/佛; *Wan* ← 溫/灣/雲/環. |
| NC-2 | **The engine cannot determine an individual's actual name spelling.** | No public source exists; only the bearer or their documents can supply it (E1/E2). |
| NC-3 | **The engine cannot reliably choose Ts-/Ch- or S-/Sh- for characters outside its table.** | The distinction is historical and absent from modern pronunciation (§2.2.2). |
| NC-4 | **The engine cannot detect a bearer's community with confidence.** | Whether 陳 is *Chan*, *Chen*, *Tan* or *Tran* is a fact about the person, not the characters. |
| NC-5 | **The engine cannot guarantee that an attested form is current.** | Gazetted names change and datasets are withdrawn (§0.5). `asOf` mitigates; it does not solve. |
| NC-6 | **Generated place names are not names.** | Decomposition produces well-formed, plausible, and frequently wrong output (§2.5.3). |

---

## 2.11 Test seeds arising from §2

Full corpus is §6. These are the cases §2 obliges the corpus to contain, with their expected *status*, which is often more testable than the expected string.

**Deterministic (exact expected output):**

| ID | Input | Expected | Asserts |
|---|---|---|---|
| T-HKR-001 | 尖沙咀 | *Tsim Sha Tsui*, `resolved`, E3 | whole-span gazetteer lookup |
| T-HKR-002 | 九龍 | *Kowloon*, `resolved`, irregular table | irregulars beat rules |
| T-HKR-003 | 彌敦道 | *Nathan Road* in Chain B; **not** in Chain A | chain separation |
| T-HKR-004 | 銅鑼灣 | *Causeway Bay*, `formKind: "official_name"`, `assembled: false` | translation ≠ romanisation |
| T-HKR-005 | 佐敦 | *Jordan*, `formKind: "native_original"`, `assembled: false` | recovery, not generation |
| T-HKR-006 | 香港大學 | *The University of Hong Kong*, `formKind: "official_name"`, `assembled:false` | institutions |
| T-HKR-007 | 發 / 佛 | both → *Fat* in Chain C | documented lossiness (NC-1) |
| T-HKR-008 | 吳 | *Ng*, syllabic nasal preserved | syllabic nasals |

**Heuristic / ambiguity (expected status, not string):**

| ID | Input | Expected | Asserts |
|---|---|---|---|
| T-HKR-020 | 蔡 (surname) | `ambiguous`, ≥2 alternatives incl. Choi and Choy | same-class conflict, no auto-pick |
| T-HKR-021 | 梁知遙, empty glossary | composite `fallback`; surname unit `convention_table`+`scopeDowngrade`; given units `rule_engine`; assembled units are rendered only by an explicit profile | unit-level provenance; RULE-HKR-4a; §5.11 |
| T-HKR-022 | 梁知遙 with glossary entry | `resolved`, `high`, `user_glossary`, `evidenceClass: E1b`, `externalAttestation: "not_attested"` | override precedence ≠ attestation (CHG-013) |
| T-HKR-028 | 知 in any position | **not** marked `sibilant_class_unknown`; classified to the *ch-* series | CHG-017 — no manufactured ambiguity |
| T-HKR-029 | any general-prose romanisation of a sentence | units are caseless; no per-syllable capitalisation is applied by the engine | CHG-015 |
| T-HKR-030 | an entry in the HK Romanisation glossary | does **not** appear in any Chain B (`englishForm`) result | store independence, RULE-HKR-14 |
| T-HKR-031 | exact whole-form HK Romanisation glossary match in Chain C | `VerbatimRomanisation`, exact text, `assembled:false`; never relabelled generated | CHG-044 G |
| T-HKR-032 | entity-scoped translation entries covering all five `FormKind` values | each exact stored string resolves as `VerbatimEnglishForm`, `assembled:false`; mechanism comes from stored `formKind`, never evidence | CHG-044 A |
| T-HKR-033 | gazetteer miss for a specific+generic place | assembled `hybrid`, `person:false`; romanised specific plus translated generic; no `styleApplicable` | CHG-044 B |
| T-HKR-034 | Peter 陳大文 | mixed person assembly; Peter is literal with no syllable; only generated romanised given units are style-licensed | CHG-044 B / RC-4 |
| T-HKR-023 | two enabled conflicting glossary entries | `conflict`, **no** value chosen | RULE-HKR-7 |
| T-HKR-024 | a character absent from the sibilant table | `ambiguous` with Ts- and Ch- variants | RULE-HKR-3 |
| T-HKR-025 | 田中 | caution `cjk_non_chinese_suspected` present | generation guard |
| T-HKR-026 | 碧咸 | caution `foreign_origin_suspected` present | generation guard |
| T-HKR-027 | user entry contradicting gazetteer | user value wins, `overrides_official` caution present | Chain B step 1 |

**Regression / invariant:**

| ID | Assertion |
|---|---|
| T-HKR-040 | No output anywhere in the corpus has `provenance: rule_engine` with `confidence` above `low` (INV-5). |
| T-HKR-041 | No class-scoped attestation is applied to an individual without `scopeDowngrade`. |
| T-HKR-042 | Every `ambiguous` result has ≥2 `alternatives`; every `conflict` has no chosen `text`. |
| T-HKR-043 | Structured export of any value preserves `provenance`, `status`, `evidenceClass`, `cautions` and `alternatives` in full. Plain-text copy is **not** required to carry a marker (RULE-HKR-13 as amended). |
| T-HKR-044 | Chain A never returns a value whose `formKind` is `official_name`, `native_original` or `translation` (current contract vocabulary). |
| T-HKR-045 | For a three-unit `AssembledRomanisation`, reject `[]`, `[[]]`, `[[0], [2]]`, `[[0, 1], [1, 2]]`, and `[[1], [0], [2]]`; accept structurally complete `[[0], [1], [2]]` and `[[0, 1, 2]]`, whose rendered separators follow the exact grouping rule. |

---

## 2.12 Decisions raised by §2

| ID | Question | Options | Recommended default | Confidence | Must decide before implementation? |
|---|---|---|---|---|---|
| DEC-LANG-20260828-009 | Does the product expose general (non-entity) HK-style romanisation as a user-visible mode? | **ACCEPTED (CHG-007).** Yes — v1 user-visible capability. The engine preserves provenance; the Lab/debug view must expose it clearly; ordinary presentation may remain visually quiet and is not required to label every annotation "generated". | Settled | Settled — Chain C ships |
| DEC-LANG-20260828-010 | How is the ts/ch, s/sh split handled for characters with no attested spelling? | **ACCEPTED at the engine-data level (CHG-008).** Retain all materially plausible candidates; mark `ambiguous`; the historical prior may *rank* but may not resolve. No consumer is thereby obliged to display all candidates inline — presentation policy is separate. | Settled | Settled |
| DEC-LANG-20260828-011 | Is the convention table bundled at build time or fetched from the government API at runtime? | (a) bundled snapshot with `asOf`; (b) runtime fetch; (c) bundled + optional refresh | **(c)** — offline-first (assumption A3) with a refresh path; source instability (§0.5) makes pure (b) fragile | Medium-high | No — but the `asOf`/`sourceRef` fields must exist from day one |
| DEC-LANG-20260828-012 | Default `givenNameJoin` style | explicit consumer-selected `StyleProfile` / none | **REJECTED as a global-default inference (CHG-009).** 梁知遙 → *Leung Chiyiu* is an entity-level override (E1a/E1b), not evidence of a global convention. The global default remains **UNRESOLVED** pending corpus evidence or an explicit product decision. No `StyleProfile` sets or implies it (CHG-050); the generator emits structured units plus required grouping, but no rendered text or selected profile. | — | No — nothing in the engine depends on it |
| DEC-LANG-20260828-013 | Threshold parameters *N* and *θ* for promoting an induced spelling to a convention row (§2.7) | any | N=3, θ=0.9, tuned on held-out data | Low — placeholder pending real data | No — configurable, but must be reported with `rulesVersion` |
| DEC-LANG-20260828-014 | Should a user-supplied bearer spelling ever update the class-level surname table? | (a) never; (b) suggest with confirmation; (c) automatically | **(a)** for the engine; (b) as an explicit Lab curation action | High — automatic promotion would let one person's spelling silently rewrite a class convention | **Yes** — it is an INV-12 (store independence) question |
| DEC-LANG-20260828-015 | Does plain-text copy of a generated form carry a marker by default? | **AMENDED (CHG-016).** No. Structured/debug exports must preserve provenance in full and the Lab must make generated status visible, but plain-text copy is not forced to append a marker; provenance markers are an explicit opt-in copy/export option. | Settled | No — but the opt-in mechanism must exist |
| DEC-LANG-20260828-016 | Where does the presentation/style layer live — inside the engine as a `render()` helper, or entirely in the consumer? | (a) engine ships style profiles as a pure function over units; (b) consumers implement their own | **(a)** — profiles are linguistic knowledge (which joins are attested), and duplicating them across Lab and Reader guarantees divergence. Kept as a separate module with no engine dependency. | Medium | No — but §5 should place the boundary explicitly |

---

## 2.13 Known limitations of §2 as written

Stated so they are not mistaken for completeness.

1. **The correspondence tables in §2.2.3 are a reconstruction from memory of attested place names, cross-checked against a secondary source.** They have not been fitted to the Lands Department dataset. Under the §0.5 evidence standard they are a *starting hypothesis*, and §2.7 is the procedure that must replace them. A later agent should regard any individual row as provisional.
2. **No surname corpus has been built.** The surname table in §2.4.2 illustrates the *phenomena* (many-to-many mapping, collisions, community variation) reliably; the specific spellings are common knowledge but carry no attestation counts and no primary source. It is an E6 sketch, not an E6 table.
3. **Generation-guard detection (§2.4.5) is unspecified at the algorithm level.** Detecting "this looks like a Japanese name" or "this is a transliterated foreign name" is a real classification problem, deferred to §4 with the entity model. §2 specifies only what happens once a guard fires.
4. **The interaction between entity-boundary ambiguity and romanisation is only sketched** (§2.9, row 6). It depends on the entity model and is properly settled in §4.
5. **Nothing here has been validated against Cantonese speakers**, and the single example 梁知遙 → *Leung Chiyiu* is now correctly treated as an entity-level stipulation rather than evidence of a general preference (CHG-009). The packet therefore has **no** corpus evidence about the author's preferred rendering conventions.
6. **The 1999 Three Way Chinese Commercial/Telegraphic Code Book account is author-supplied and was not independently located** in this session (§2.2.1a). If it can be verified it materially strengthens the case for a per-character table over a generative rule, and a later agent should try to retrieve the reply text.

**SECTION COMPLETE — §2 HK Romanisation System**

---

# §3 — Jyutping Processing System

**Purpose.** Specify the L2 layer: how text is segmented, how Cantonese readings are assigned and justified, how written Cantonese and HKSCS characters are handled, how mixed-script input behaves, how source and annotation stay aligned, and how uncertainty is represented.

**Presentation exclusion.** This section specifies the *data* that makes aligned display possible. It does **not** decide whether annotations appear above, below, beside or inline; whether they are shown per character, per word or per sentence; or what any consumer does with them. Those are §9/§11 questions.

---

## 3.1 The phonological object

### 3.1.1 What Jyutping is

**CONFIRMED.** Jyutping is the Cantonese romanisation scheme of the Linguistic Society of Hong Kong. A syllable is **initial + final + tone digit**; tones are numbered **1–6**. ([LSHK Jyutping Scheme](https://lshk.org/jyutping-scheme/))

**CONFIRMED.** Tone 1 covers both the high-level and high-falling realisations; the scheme does not distinguish them. Consequently the engine cannot represent that distinction, and must not pretend to.

**CONFIRMED.** Checked syllables — those with a `-p`, `-t`, `-k` coda — occur only with tones 1, 3 and 6. Some legacy sources notate these as 7, 8, 9.

**RULE-JP-1 (RECOMMENDED).** Tone digits 7/8/9 encountered in any *ingested data source* are normalised to 1/3/6 and the record carries `toneNotationNormalised: true`. The engine's own output never emits 7/8/9. Normalisation happens at data-ingest time, never on user input silently — a user typing `sik7` in the pronunciation dictionary is shown what it was normalised to.

### 3.1.2 Canonical representation

Per DEC-LANG-20260828-004, readings are stored structurally with Jyutping as the canonical serialisation.

```jsonc
{
  "jyutping": "loeng4",
  "initial": "l",          // "" for zero-initial syllables
  "final": "oeng",
  "tone": 4,
  "syllabic": false        // true for the standalone nasals m / ng
}
```

**RULE-JP-2 (RECOMMENDED) — validation, not invention.** A syllable is well-formed iff its initial is in the LSHK initial inventory (19 initials: `b p m f d t n l g k ng h gw kw w z c s j`) or empty, its final is in the LSHK final inventory, and its tone is 1–6, subject to the checked-tone constraint. The engine **validates** against the published inventory; it does not accept a string as Jyutping merely because it looks like one, and it never repairs an invalid syllable into a valid one.

**Marginal finals that implementations routinely omit, and must not.** Colloquial Cantonese uses finals absent from many simplified tables — `eu` (掉 `deu6`), `em` (舐 `lem2`), `ep` (夾 `gep6`), `et`. Omitting them makes the validator reject correct readings of everyday written Cantonese. A validator built from a truncated inventory is a silent correctness bug, and §6 must test for it.

### 3.1.3 Notation is not the reading

Jyutping is the canonical *serialisation*; Yale, IPA, Sidney Lau and tone-mark variants are alternative serialisations of the same structured object (§1.2.5). None is produced in v1 (deferred item D1), but nothing in the L2 design may assume the string form is the object.

---

## 3.2 Alignment — the structural core

The brief is explicit that a plain `Chinese → romanised string` converter is insufficient. Alignment is what makes L2 usable.

### 3.2.1 Three levels

```
source span  ⊇  token span  ⊇  syllable span
```

Every non-grouped syllable carries its own source span. Where several syllables cannot be apportioned individually, the syllables carry `span:null` and one source-bound `GroupedAlignment` carries their shared span plus deterministic local syllable indices. Every token's individual spans and group spans are ordered and non-overlapping within the token. This is what a consumer needs to render annotation without fabricating sub-token alignment.

### 3.2.2 Character-to-syllable is not 1:1

The common case is one Han character to one syllable, and a design that assumes it will break on real input.

| Case | Example | Relation |
|---|---|---|
| Ordinary Han character | 我 → `ngo5` | 1 char : 1 syllable |
| Non-BMP HKSCS character | 𨋢 → `lip1` | 1 char (**2 UTF-16 units**) : 1 syllable |
| Character with no reading | punctuation, whitespace | 1 char : 0 syllables |
| Latin token read as a loanword | *OK* → `ou1 kei1` | 2 chars : 2 syllables, but not char-aligned |
| Latin token with no reading | *busy* | n chars : 0 syllables |
| Numeral read digit-by-digit | *2019* → 4 syllables | 4 chars : 4 syllables, aligned |
| Numeral read as a cardinal | *2019* → 兩千零一十九 | 4 chars : 6 syllables, **not** aligned |
| Variant-selector sequence | base + VS | 2 code points : 1 syllable |

**RULE-JP-3 (RECOMMENDED).** Alignment is an explicit list, not an index correspondence:

```jsonc
"syllables": [
  { "span": [0, 1], "jyutping": "ngo5", "align": "exact" }
],
```

with `align ∈ { exact, spread, grouped, unaligned }`:

- `exact` — this syllable corresponds to this span alone.
- `spread` — one syllable spans several code points (variant sequences, surrogate pairs are handled by the offset unit and are still `exact`).
- `grouped` — several syllables share one span and cannot be individually apportioned (the cardinal-number case). Each individual syllable carries `span:null`; a `Reading.alignmentGroups[]` record carries the shared span and its strictly increasing local `syllableIndices`.
- `unaligned` — a syllable with no source span. **Forbidden in v1.** If a reading would require an epenthetic syllable, the engine returns `ambiguous` instead of inventing alignment.

**INV-14 (RECOMMENDED, amended CHG-044 J).** For every token, every non-null individual syllable span and every grouped-alignment span is contained in the token span, ordered and non-overlapping, and crosses no token boundary. Every `align:"grouped"` syllable belongs to exactly one group; every non-grouped syllable belongs to none. Groups are ordered, may occur independently more than once in one Reading, and use deterministic local syllable indices rather than ids. Testable by property test.

**INV-15 (RECOMMENDED).** Discarding all syllables and concatenating token text still reproduces the source (INV-1 is not weakened by the annotation layer).

### 3.2.3 What this enables, without specifying it

The alignment model supports per-character, per-word and per-phrase annotation display, and supports a consumer that lets the user select a sub-span and see exactly the syllables covering it. **Which of these any consumer does is not decided here.**

---

## 3.3 Token typology and reading policy

**RECOMMENDED** token types and their default L2 behaviour. Type assignment is by Unicode script and category, not by guesswork.

| Token type | Contents | Default reading behaviour | Status when no reading |
|---|---|---|---|
| `han` | CJK Unified Ideographs, Ext-A…Ext-G, Compatibility Ideographs | full reading resolution (§3.5) | `unresolved` |
| `latin` | ASCII/Latin letters | **no reading** by default | `out_of_scope` |
| `digit` | Arabic numerals | **no reading** by default (§3.7.1) | `unresolved` with candidates |
| `punct_cjk` | 。、！？；：「」『』（）—… | none | `out_of_scope` |
| `punct_latin` | . , ! ? ; : " ' ( ) – — | none | `out_of_scope` |
| `space` | space, tab, newline, ideographic space | none | `out_of_scope` |
| `symbol` | ％＄＆＠ etc. | none | `out_of_scope` |
| `emoji` | emoji and ZWJ sequences | none; **must not be split** | `out_of_scope` |
| `script_other` | kana, hangul, Cyrillic, etc. | none; `caution: non_chinese_script` | `out_of_scope` |
| `unknown` | unassigned code points, PUA, lone surrogates | none | `unsupported` |

**RULE-JP-4 (RECOMMENDED).** `out_of_scope` and `unresolved` are **not** the same and must not be collapsed in the UI or the API. `out_of_scope` means "this thing does not have a Cantonese reading" (a comma); `unresolved` means "this thing has one and the engine does not know it" (a rare character). The first is silence; the second is a gap. Conflating them is how a tool hides its own ignorance.

**Latin reading policy — OPTIONAL.** Hong Kong speech routinely reads English acronyms and loanwords aloud (*MTR*, *OK*, *file*). A `latinReadingPolicy ∈ { none, letter_names, loanword_lexicon }` is offered, default `none`. When enabled, output is marked `provenance: lexicon`, `confidence: low`, and the alignment is `grouped` — letter-name readings are not character-aligned in any principled way.

---

## 3.4 Segmentation

### 3.4.1 Why segmentation is a phonological problem, not a convenience

Cantonese polyphones are largely resolved at the word level. Character-level reading assignment cannot be correct in principle.

| Character | Readings | Disambiguated by the word |
|---|---|---|
| 行 | `hang4` / `haang4` / `hong4` | 銀行 `ngan4 hong4` · 行路 `haang4 lou6` · 行為 `hang4 wai4` |
| 樂 | `lok6` / `ngok6` | 快樂 `faai3 lok6` · 音樂 `jam1 ngok6` |
| 覺 | `gok3` / `gaau3` | 覺得 `gok3 dak1` · 睡覺 `seoi6 gaau3` |
| 重 | `zung6` / `cung4` | 重要 `zung6 jiu3` · 重複 `cung4 fuk1` |
| 好 | `hou2` / `hou3` | 好人 `hou2 jan4` · 好奇 `hou3 kei4` |
| 空 | `hung1` / `hung3` | 空氣 `hung1 hei3` · 有空 `jau5 hung3` |
| 長 | `coeng4` / `zoeng2` | 長度 `coeng4 dou6` · 校長 `haau6 zoeng2` |

### 3.4.2 Approach comparison

| Approach | Accuracy | Cantonese suitability | Determinism | Explainability | Verdict |
|---|---|---|---|---|---|
| **Bidirectional maximum matching** over a lexicon | moderate; degrades on OOV and on genuine ambiguity | good — depends only on lexicon coverage, and Cantonese lexicons exist | fully deterministic (INV-7 free) | high — the matched entry *is* the explanation | **Benchmark candidate** — no verdict; DEC-…-017 is unresolved (CHG-019, CHG-039 C) |
| **Cantonese-specific deterministic hybrid** — e.g. the current PyCantonese segmenter (Jieba-style DAG + HMM, trained on Cantonese-specific resources including HKCanCor, rime-cantonese, Common Voice Cantonese and a Cantonese–Traditional Chinese parallel corpus) | plausibly highest of the local options on **written Cantonese** specifically | **good** — trained on Cantonese data, not Standard Written Chinese | **deterministic** — a fixed model with fixed weights satisfies INV-7 | moderate — the DAG path is inspectable; the HMM component is less so | **Live candidate.** Evaluate in §8 |
| **Generic statistical (HMM / CRF / n-gram) trained on Standard Written Chinese** | higher than max-matching on SWC prose | poor for written Cantonese — mis-segments 咗/嘅/喺 constructions | deterministic given fixed weights | low | Weak candidate |
| **Neural / LLM segmentation via a network service** | potentially highest | plausible, unverified | **not deterministic.** Caching it does not make it conformant (CHG-039 C): under the current model the core cannot call a provider at all, so this would require **host orchestration that materialises a pinned `ProviderSnapshot` before the core consumes it** (§5.13.1) — which for segmentation means pinning a snapshot per source, an awkward fit | very low | Outside the core. Not a v1 candidate |

**RULE-JP-5 — UNRESOLVED (CHG-019).** *Superseded statement, retained for the record:* "v1 uses bidirectional maximum matching with a documented tie-break."

The v1 segmentation architecture is **not settled here**. The earlier rationale conflated two things: determinism (which a fixed statistical model also has) and explainability (which max-matching genuinely wins on). Determinism alone does not select max-matching, and the claim that suitable Cantonese-specific statistical resources do not exist is too broad — [PyCantonese](https://github.com/jacksonllee/pycantonese) is a counterexample, and its 5.0 line is reported to expose JavaScript support, which if confirmed removes the usual runtime objection.

**What §3 does fix, and what remains open.**

| Fixed here | Open, decided in §8/§6 |
|---|---|
| The segmenter emits a **lattice**, not a single path (§3.4.3) | Which algorithm builds it |
| The inert/consequential ambiguity rule (RULE-JP-6) | — |
| The tie-break must be documented and deterministic | Which tie-break |
| The window model (§3.4.4) | — |
| User dictionary terms are forced segments | — |
| Pipeline position (§3.4.5) | — |

**RULE-JP-5a (RECOMMENDED) — replaceability.** The segmenter sits behind a stable interface (`Segmenter: (text, window, lexicon, forcedTerms) → Lattice`) with no other component depending on its internals. Swapping implementations must require no change to §3's data contract, to the entity layer, or to the cache-key design beyond a `segmenterVersion` component. This is what makes reopening DEC-…-017 cheap rather than structural.

**Stable `Lattice` boundary (CHG-044 D).** The public lattice is the minimal normalised shape frozen in §5.13: a UTF-16 source window, deterministic local candidate edges with exact spans/text/source, and complete alternative paths expressed as local edge indices. It contains no scores, weights, model states, neural features or implementation-specific selection data. That interface is sufficient for downstream reading/entity work and debug display while leaving DEC-…-017 genuinely unresolved.

### 3.4.3 Segmentation ambiguity — the efficiency/honesty rule

Naively surfacing every segmentation ambiguity makes ordinary text unreadable. Suppressing them hides real errors. The discriminator is whether the ambiguity is *phonologically consequential*.

**RULE-JP-6 (RECOMMENDED).**

1. Build a segmentation **lattice** over the window.
2. For each ambiguous region, compute the reading sequence each path yields.
3. If **all paths yield the same reading sequence**, the ambiguity is phonologically inert: resolve it silently by the tie-break, record `segmentationAmbiguity: inert` in the debug channel, and do not surface it.
4. If **paths differ in readings**, the ambiguity is consequential: mark the affected span `ambiguous`, retain each path's reading as an alternative with its segmentation shown, and rank by lexicon frequency without promoting the top candidate to `resolved`.

This gives quiet output on ordinary text and loud output exactly where the engine's answer actually depends on a guess.

**Tie-break for inert ambiguity (RECOMMENDED, and must be documented rather than emergent):** longest total match, then fewest segments, then higher summed lexicon frequency, then leftmost-longest. Deterministic and stable across runs (INV-7).

### 3.4.4 Window and locality

**RECOMMENDED.** The segmentation window is the **sentence**, delimited by 。！？；…!?; and by line breaks, with quotation and bracket nesting respected so a sentence is not split inside 「」.

This is the unit referenced by INV-11 (bounded override locality): adding a dictionary entry may re-segment its sentence, and may not affect any other sentence. Very long sentences (no terminator for *N* characters) are chunked at a configurable ceiling with the chunk boundary recorded, so a pathological input cannot produce unbounded work (§3.8).

### 3.4.5 The entity → reading dependency

**A real dependency that the pipeline order must respect.** Surname readings frequently differ from the same character's ordinary reading:

| Character | Ordinary reading | Surname reading |
|---|---|---|
| 區 | `keoi1` (district) | `au1` |
| 單 | `daan1` (single) | `sin6` |
| 任 | `jam6` (duty) | **`jam4` and `jam6` are both recorded as surname readings** — see note below |
| 曾 | `cang4` (once) | `zang1` |
| 華 | `waa4` | `waa6` in some name usage |

Therefore **reading resolution cannot precede entity detection**, and entity detection consumes segmentation. The pipeline is:

```
L1 segmentation lattice
    → entity detection over the lattice (§4)
    → reading resolution, conditioned on entity type and role
    → L3R / L3E resolution (§2)
```

**Note on 任 (CHG-020).** Available Cantonese lexical evidence records more than one surname reading for 任 (`jam4` and `jam6`). This does **not** weaken the finding that entity classification conditions pronunciation — for 區 and 單 the conditioning is decisive. It adds a necessary qualification: **entity classification narrows the reading candidate set but does not necessarily collapse it to one.** An entity-conditioned reading may still be `ambiguous`, and the engine must not treat "this is a surname" as automatically licensing `resolved`. This strengthens DEC-…-019 rather than undermining it: the conditioning pass is a filter over candidates, not an oracle.

with a bounded feedback edge: if entity detection needs readings to decide (e.g. a homophone-based heuristic), it uses *unconditioned* readings and the final pass re-resolves. The feedback must not iterate to a fixed point — one pass, then commit, because unbounded iteration destroys determinism and debuggability. Recorded as a §4 dependency and as DEC-LANG-20260828-019.

---

## 3.5 Reading resolution

### 3.5.1 Precedence chain

The brief proposes: user override → lexical/contextual → standard reading → unresolved. That ordering is sound. Two refinements are required by §3.4.5 and by the word/character distinction.

| # | Source | Provenance | Status | Confidence |
|---|---|---|---|---|
| 1 | **Pronunciation dictionary** (this store only), enabled, longest match, context filter satisfied | `user_glossary` | `resolved` | `high` |
| 2 | **Entity-conditioned reading** — surname/place/organisation reading for a span whose entity type is known, plus any **entity-scoped pronunciation entry** for it | `user_glossary` / `lexicon` | `resolved` | `high` / `medium` |
| 3 | **Word-level lexicon reading** for the matched segment | `lexicon` | `resolved` | `medium` |
| 4 | **Character-in-context reading** — character reading conditioned on neighbours where the lexicon records such a constraint | `lexicon` | `resolved` | `medium` |
| 5 | **Character default reading** — the character's dominant reading, where dominance meets the threshold | `lexicon` | `resolved` | `medium` |
| 5b | **Character with contested readings** — no dominant reading | `lexicon` | `ambiguous` | `low` |
| 6 | No reading available | `none` | `unresolved` | `none` |

**Store independence (INV-12).** Step 1 reads the **pronunciation dictionary only**. The HK Romanisation glossary and the translation glossary do not participate in L2 resolution, in either direction. A user who fixes a name's *spelling* has not stated its *pronunciation*, and vice versa.

### 3.5.2 Dominance threshold — when a polyphone is "resolved"

Marking every polyphone `ambiguous` would be technically honest and practically useless: 好 is a polyphone, and `hou2` is right almost always.

**RULE-JP-7 (RECOMMENDED).** A character with multiple readings resolves to its dominant reading when the dominant reading's corpus share ≥ **θ_read** and the observation count ≥ **N_read**; otherwise the result is `ambiguous` with all readings ranked. Provisional values θ_read = 0.9, N_read = 5, to be tuned against the §6 corpus. The chosen value carries `confidence: medium` and the losing readings are retained in `alternatives` regardless — the threshold governs the *status*, never whether alternatives are kept.

This mirrors §2.7's promotion threshold deliberately: the same epistemic question ("is this dominant enough to assert?") should not get two different mechanisms in one engine.

### 3.5.3 Kinds of reading variation — not all ambiguity is the same

**RECOMMENDED.** `alternatives` entries carry a `variation` field, because a UI that treats sociophonetic variation like a lexical error will be wrong constantly.

| `variation` | Meaning | Examples | Default treatment |
|---|---|---|---|
| `lexical` | Different word, different reading | 行 `hong4` / `haang4` | Genuine ambiguity; may block `resolved` |
| `register` | 文白異讀 — literary vs colloquial reading of the same word | literary/colloquial doublets | `resolved` to the register-appropriate default; the other retained |
| `sociophonetic` | Systematic variation in modern speech, not a different word | n/l merger (你 `nei5` ~ `lei5`); ng-dropping (我 `ngo5` ~ `o5`); labialisation loss (國 `gwok3` ~ `gok3`) | **Never** blocks `resolved`. Canonical form is the etymological one; variants retained as alternatives |
| `sandhi` | 變調 — tone change in context | 雞蛋 `gai1 daan2` (citation `daan6`); 金魚 `gam1 jyu2` (citation `jyu4`) | See RULE-JP-8 |
| `uncertain` | The engine does not know which applies | — | Blocks `resolved` |

**RULE-JP-8 (RECOMMENDED) — tone change (變調).** v1 does **not** implement productive tone-sandhi rules. Sandhi forms enter only where they are **lexicalised in the dictionary** (雞蛋 stored as a word with reading `gai1 daan2`). Rationale: productive 變調 in Cantonese is conditioned by semantics and register in ways no rule set available to this session captures reliably, and a wrong sandhi rule silently corrupts every affected reading. Where the lexicon holds both the citation and sandhi forms, both are returned with `variation: sandhi`. Registered as DEC-LANG-20260828-020.

### 3.5.4 The pronunciation dictionary's context filter

An entry may be unconditional or context-scoped. Context scoping is what allows 行 → `hong4` in financial text without breaking 行路.

```jsonc
{
  "term": "行", "reading": "hong4",
  "match": "exact",                       // exact | contextual
  "context": { "precededBy": ["銀"], "followedBy": [] },
  "enabled": true,
  "evidenceClass": "E1a",
  "verifiedAt": null
}
```

Longer matches win over shorter ones; between two entries of equal length whose contexts both apply, the result is `conflict` (never an arbitrary pick — RULE-HKR-7 generalises to L2).

---

## 3.6 Written Cantonese, variants, and HKSCS

### 3.6.1 Written Cantonese is core input, not an edge case

The engine's expected input includes colloquial written Cantonese. Characters such as 嘅 `ge3`, 咗 `zo2`, 喺 `hai2`, 冇 `mou5`, 唔 `m4`, 佢 `keoi5`, 哋 `dei6`, 嘢 `je5`, 睇 `tai2`, 啲 `di1`, 嗰 `go2`, 乜 `mat1`, 嚟 `lei4`, 曬 `saai3`, 諗 `nam2`, 攰 `gui6`, 嬲 `nau1`, 孭 `me1`, 冚 `ham6` must be present in the lexicon with correct readings, and must segment correctly in constructions a Standard-Written-Chinese lexicon has never seen.

**Consequence for lexicon selection (§8).** A lexicon covering only Standard Written Chinese is unsuitable regardless of its size. Coverage of written Cantonese is a *gating* criterion, not a scoring one.

### 3.6.2 Non-BMP characters are everyday, not exotic

**Critical implementation fact.** Several common written-Cantonese characters live outside the Basic Multilingual Plane and therefore occupy **two UTF-16 code units** each:

| Character | Reading | Meaning | Code point |
|---|---|---|---|
| 𨋢 | `lip1` | lift / elevator | U+2A2E2 |
| 𡃁 | `leng1` | (in 𡃁仔, kid) | U+210C1 |
| 𠮶 | `go2` | that | U+20BB6 |
| 𩠐 | `tau4` | head | U+29840 |

These are not corner cases; 𨋢 appears in ordinary Hong Kong writing. Consequences:

- INV-4 (grapheme safety) is exercised by real input, not only by fuzzers.
- Any implementation that iterates a string by UTF-16 index without surrogate-pair handling will split these characters and produce corrupt spans. This is the single most likely low-level bug in the whole engine.
- `offsetUnit` (DEC-…-003) must be honoured by every consumer.
- HKSCS coverage is a lexicon gating criterion alongside written-Cantonese coverage.

### 3.6.3 Variant characters (異體字)

Pairs such as 裡/裏, 為/爲, 群/羣, 峰/峯, 台/臺, 唸/念 are the same word with the same reading, differently written.

**RULE-JP-9 (RECOMMENDED), implementing INV-9.** Variant folding applies to **lookup keys only**. The source and the token `text` are never rewritten. Where folding changed the key, the annotation records `keyTransform: { from, to, kind: "variant_fold" }`, so the debug view can show why a lookup matched something that does not look identical.

### 3.6.4 Simplified input — folding is itself ambiguous

Simplified→Traditional is **one-to-many**, and the branches can have different readings. This is not a cosmetic issue.

| Simplified | Traditional candidates | Readings |
|---|---|---|
| 干 | 干 / 乾 / 幹 | `gon1` / `gon1` / `gon3` — **differ** |
| 发 | 發 / 髮 | `faat3` / `faat3` — coincide |
| 台 | 台 / 臺 / 檯 / 颱 | `toi4` throughout — coincide |
| 里 | 里 / 裡 | `lei5` — coincide |
| 后 | 后 / 後 | `hau6` — coincide |

**RULE-JP-10 (RECOMMENDED).** Simplified input is folded for lookup. If the fold is one-to-many **and the candidates' readings differ**, the result is `ambiguous` with each candidate's reading returned and `keyTransform.kind: "simplified_fold"` recorded. If the readings coincide, resolve normally and note the fold in the debug channel only. The source is never rewritten to Traditional (N4 in §1.3.2).

---

## 3.7 Numbers, Latin, and mixed-script text

### 3.7.1 Arabic numerals — a genuine unknown, not a gap to paper over

*2019* may be read as a year (digit-by-digit), a quantity (`loeng5 cin1 ling4 jat1 sap6 gau2`), a phone number, an ordinal, or part of a code. The correct reading depends on information the engine does not have.

**RULE-JP-11 (RECOMMENDED).** Default `numberReadingPolicy: "none"`: digit tokens receive no reading and are marked `unresolved` with `reason: number_reading_requires_context`, and with the plausible readings supplied as **candidates** (digit-by-digit and cardinal at minimum). Optional policies `digits` and `cardinal` may be selected by a consumer that knows its domain; either marks output `confidence: low` and alignment `grouped` for the cardinal case (4 characters : 6 syllables).

Choosing a default silently would be the exact failure the packet exists to avoid: it would be right often enough to be trusted and wrong often enough to matter.

### 3.7.2 Chinese numerals

Mostly determinate at character level (二 `ji6`, 十 `sap6`, 百 `baak3`, 千 `cin1`, 萬 `maan6`, 零/〇 `ling4`), with real lexical wrinkles the lexicon must carry rather than a rule:

- 一 is `jat1` throughout, but its tone behaviour in compounds is a sandhi question (RULE-JP-8: lexicalised only).
- 兩 `loeng5` vs 二 `ji6` is a lexical choice, not a reading choice — the engine reads what is written and does not substitute.
- Cantonese-specific numerals 廿 `jaa6`, 卅 `saa1` must be in the lexicon.

### 3.7.3 Code-switching and adjacency

Mixed input such as `我today好busy` is ordinary Hong Kong register. Requirements:

- Script transitions create token boundaries **without** requiring whitespace.
- No inserted or normalised whitespace anywhere (INV-1).
- Full-width Latin and digits (ＡＢＣ, ０１２) are typed by their script, not by their width, and are never normalised in the source.
- Latin tokens default to `out_of_scope`, so a mixed paragraph yields readings for its Han spans and silence — not `unresolved` — for its English ones (RULE-JP-4).

---

## 3.8 Failure behaviour

| Situation | Behaviour | Status |
|---|---|---|
| Han character absent from the lexicon | Token preserved; **no reading guessed** | `unresolved` |
| Han character absent, phonetic-component heuristic enabled | Candidate offered, `provenance: rule_engine`, `heuristic: phonetic_component`, never `resolved` | `ambiguous` |
| Unassigned code point, PUA, lone surrogate | Token preserved verbatim; no analysis | `unsupported` |
| Malformed input (invalid sequences, control characters) | **Never throws.** Token preserved; diagnostic emitted | `unsupported` |
| Empty string | Valid input. Empty token list, empty entity list, no diagnostic | — |
| Whitespace-only input | Valid. One or more `space` tokens | `out_of_scope` |
| Extremely long input | Chunked at sentence boundaries; chunk boundaries recorded; INV-1 preserved across chunks | — |
| Sentence exceeding the window ceiling | Hard chunk at the ceiling, `caution: window_ceiling_reached` | — |
| Repeated identical text | Cache hit per window (§10); output identical for identical windows | — |
| Lexicon unavailable / failed to load | Engine returns tokens with `unresolved` readings and a loud diagnostic — **not** an empty result and **not** an exception | `unresolved` |

**RULE-JP-12 (RECOMMENDED) — no phonetic guessing by default.** Guessing a rare character's reading from its phonetic component (諧聲) is tempting and produces confident-looking wrong answers. It is OPTIONAL, off by default, and when on is marked as a heuristic candidate that can never reach `resolved`.

---

## 3.9 L2 output sketch

Indicative; normative schema is §5.

```jsonc
{
  "source": "我today去𨋢口等佢。",
  "offsetUnit": "utf16",
  "tokens": [
    { "id": "t0", "span": [0, 1], "text": "我", "type": "han",
      "segment": { "matched": "我", "source": "lexicon" },
      "reading": {
        "syllables": [ { "span": [0,1], "jyutping": "ngo5", "initial": "ng", "final": "o", "tone": 5, "align": "exact" } ],
        "jyutping": "ngo5",
        "provenance": "lexicon", "status": "resolved", "confidence": "medium",
        "alternatives": [ { "jyutping": "o5", "variation": "sociophonetic" } ]
      } },
    { "id": "t1", "span": [1, 6], "text": "today", "type": "latin",
      "reading": { "syllables": [], "status": "out_of_scope", "provenance": "none", "confidence": "none" } },
    { "id": "t3", "span": [7, 9], "text": "𨋢", "type": "han",
      "note": "one character, two UTF-16 code units",
      "reading": {
        "syllables": [ { "span": [7,9], "jyutping": "lip1", "align": "exact" } ],
        "jyutping": "lip1", "provenance": "lexicon", "status": "resolved", "confidence": "medium" } }
  ],
  "diagnostics": [],
  "debug": { "segmentation": { "inertAmbiguities": 2, "consequentialAmbiguities": 0 } }
}
```

---

## 3.10 Test seeds arising from §3

**Deterministic:**

| ID | Input | Asserts |
|---|---|---|
| T-JP-001 | 𨋢 alone | one token, span length 2 in UTF-16, reading `lip1`, no surrogate split (INV-4) |
| T-JP-002 | 銀行 / 行路 / 行為 | 行 reads `hong4` / `haang4` / `hang4` respectively — word-level disambiguation |
| T-JP-003 | 快樂 / 音樂 | `lok6` / `ngok6` |
| T-JP-004 | 睡覺 / 覺得 | `gaau3` / `gok3` |
| T-JP-005 | 我today好busy | 4 tokens; Latin tokens `out_of_scope`, **not** `unresolved`; INV-1 holds |
| T-JP-006 | `""` | valid; empty tokens; no diagnostic |
| T-JP-007 | 掉 / 舐 / 夾 | finals `eu`, `em`, `ep` validate — truncated-inventory regression |
| T-JP-008 | any ingested `sik7` | normalised to `sik1`, `toneNotationNormalised: true` |
| T-JP-009 | 唔該 | 2 characters, 2 syllables `m4 goi1`; syllabic nasal accepted |
| T-JP-010 | text containing 裡 and 裏 | identical readings, source text unmodified, `keyTransform` recorded |

**Heuristic / ambiguity:**

| ID | Input | Expected |
|---|---|---|
| T-JP-020 | 干 (simplified context) | `ambiguous`; candidates include `gon1` and `gon3` (RULE-JP-10) |
| T-JP-021 | 你 | `resolved` `nei5`; `lei5` present as `variation: sociophonetic`; sociophonetic variation does not block resolution |
| T-JP-022 | 2019 | `unresolved`, `reason: number_reading_requires_context`, ≥2 candidates |
| T-JP-023 | 雞蛋 | if lexicalised, `gai1 daan2` with `variation: sandhi`; **no** productive sandhi rule applied elsewhere |
| T-JP-024 | 區 as surname vs 區 as "district" | different readings; requires entity conditioning (§3.4.5) |
| T-JP-025 | a segmentation ambiguity with identical readings on all paths | resolved silently; `segmentationAmbiguity: inert` in debug only |
| T-JP-026 | a segmentation ambiguity with differing readings | `ambiguous`; each path's segmentation shown |

**Invariant / regression:**

| ID | Assertion |
|---|---|
| T-JP-040 | For the whole corpus, concatenating token text reproduces the source byte-for-byte (INV-1). |
| T-JP-041 | No token or syllable boundary falls inside a surrogate pair (INV-4), tested on a non-BMP-heavy fixture. |
| T-JP-042 | Every non-grouped syllable span and every `GroupedAlignment.span` is contained in its token; group spans are ordered/non-overlapping; every grouped syllable appears in exactly one group by local index and no non-grouped syllable appears in one (INV-14 / CHG-044 J). |
| T-JP-043 | Adding one pronunciation-dictionary entry changes output only within sentences containing a match (INV-11). |
| T-JP-044 | No `out_of_scope` value is ever reported as `unresolved`, or vice versa (RULE-JP-4). |
| T-JP-045 | Repeated runs over the corpus produce byte-identical serialised output (INV-7). |
| T-JP-046 | An entry in the HK Romanisation or translation glossary never changes any L2 reading (INV-12). |

**Performance (thresholds set in §10):** a 5,000-character mixed paragraph; a 100,000-character document; a pathological single sentence with no terminator; text with 10,000 repetitions of one sentence (cache behaviour).

---

## 3.11 Lexicon candidates (scoping note only)

Full comparison is §8. Recorded here so §3's gating criteria are not lost:

**Word-level and general lexicons.** CC-CANTO, the words.hk (粵典) dataset, rime-cantonese, and the Unihan `kCantonese` field.

**Hong Kong government character-level pronunciation resources (CHG-021)** — primary candidates, published via the Digital Policy Office's Common Chinese Language Interface programme:

| Resource | What it appears to be | Why it matters |
|---|---|---|
| [*Cantonese Pronunciation List of the Characters for Computers* 電腦用漢字粵語拼音表](https://www.ccli.gov.hk/en/download/canton_pronun_list.html) | Cantonese pronunciation for **over 29,000 characters** — the 27,484 characters of ISO/IEC 10646-1:2000 plus **4,384 HKSCS-2001 characters** — using the Linguistic Society of Hong Kong's romanisation scheme | Directly addresses §3.6.2 (HKSCS coverage) and §3.1 (Jyutping-scheme readings) at character level, from a government source. An [LSHK repository](https://github.com/lshk-org/jyutping-table) also carries this table |
| HKSCS Cantonese Pronunciation Reference Table | Pronunciation reference for HKSCS characters | Same gap |
| HKSCS character information | Character-set definition and code-point data | Needed for correct `unsupported` vs `unresolved` classification (§3.8) |

**Not selected.** §8 must inspect coverage, file format, licence and terms of use, currentness (the pronunciation list is described against **HKSCS-2001** and ISO/IEC 10646-1:2000 — later HKSCS revisions and Unicode extensions may not be covered), and crucially **how a character-level government table complements a word-level lexicon**. Neither substitutes for the other: §3.4.1 requires word-level entries for polyphone disambiguation, and §3.6.2 requires HKSCS character coverage. The likely outcome is a layered lexicon, but that is §8's finding to make, not §3's.

**This session has not verified any of these resources' current licences, coverage or maintenance status.**

Gating criteria established by §3, in priority order:

1. **Written-Cantonese coverage** — 嘅咗喺冇唔佢哋 and their constructions. Non-negotiable.
2. **HKSCS / non-BMP coverage** — including 𨋢, 𡃁, 𠮶.
3. **Word-level entries with readings**, not merely character readings — required for §3.4.1.
4. **Polyphone frequency data** — required for RULE-JP-7's dominance threshold. A lexicon with readings but no frequencies cannot support the threshold and forces everything to `ambiguous`.
5. **Licence compatible with a private personal application.**
6. Offline-installable (assumption A3).

Criterion 4 is easy to overlook and would quietly break §3.5.2.

---

## 3.12 Decisions raised by §3

| ID | Question | Options | Recommended default | Confidence | Must decide before implementation? |
|---|---|---|---|---|---|
| DEC-LANG-20260828-017 | Segmentation approach for v1 | (a) deterministic bidirectional maximum matching; (b) a Cantonese-specific deterministic hybrid such as the current PyCantonese segmenter, if its runtime/licence/dependency profile is compatible; (c) any other strong local deterministic candidate found in §8 | **REOPENED → UNRESOLVED (CHG-019).** No default asserted. §8 must compare on: measured written-Cantonese accuracy, HKSCS handling, determinism, explainability, latency, bundle/runtime cost, dependency risk. §6 supplies the benchmark. | — | **Yes, before the segmenter ships** — but not before §4/§5, because RULE-JP-5a makes the implementation replaceable |
| DEC-LANG-20260828-018 | θ_read and N_read for polyphone dominance (RULE-JP-7) | any | 0.9 / 5, tuned on the §6 corpus | Low — placeholder | No — configurable, but must be reported with `lexiconVersion` |
| DEC-LANG-20260828-019 | How is the entity→reading dependency handled? | (a) single pass with unconditioned readings then one re-resolve; (b) iterate to fixed point; (c) entity detection without readings | **(a)** — bounded, deterministic, debuggable | Medium-high | **Yes** — it fixes the pipeline order |
| DEC-LANG-20260828-020 | Tone change (變調) | (a) lexicalised only; (b) productive rules; (c) none at all | **(a)** — productive rules risk silently corrupting every affected reading | Medium-high | **Yes** — it determines what the lexicon must store |
| DEC-LANG-20260828-021 | Default `numberReadingPolicy` | none / digits / cardinal | **none**, with candidates supplied | Medium-high | No — configurable |
| DEC-LANG-20260828-022 | Is the phonetic-component heuristic shipped at all? | on / off / absent | **off by default**, present for the Lab | Medium | No |
| DEC-LANG-20260828-023 | Does the segmenter expose the full lattice in the API, or only the chosen path plus consequential alternatives? | full / reduced | **Reduced by default, full behind a debug flag** — the full lattice is large and the Lab is its only real consumer | Medium | No — but §5 must reserve the field |

---

## 3.13 Known limitations of §3

1. **No lexicon has been selected or inspected.** Every claim about coverage is conditional on §8's evaluation. The gating criteria in §3.11 are the durable output; the candidate list is not.
2. **The polyphone examples are common knowledge, not corpus-derived.** They illustrate the phenomena reliably; the specific frequency claims underlying RULE-JP-7 have no data behind them yet.
3. **Register variation (文白異讀) is acknowledged but not specified.** Deciding which register is "default" for a given word requires corpus evidence this session does not have, and is deliberately left to the lexicon rather than to a rule.
4. **Sociophonetic variation is modelled as annotation, not as a user-selectable accent.** Whether a user should be able to say "render everything with ng-dropping" is a product question not raised in the brief; noted as an OPTIONAL enhancement.
5. **Segmentation quality is unmeasured, and the algorithm is unchosen.** DEC-…-017 is UNRESOLVED (CHG-019). §6 must supply the benchmark and §8 the dependency evaluation; RULE-JP-5a keeps the choice cheap by making the segmenter replaceable behind a stable interface.
6. **The entity→reading feedback edge (§3.4.5) is specified only in outline**, because its other half lives in §4. If §4 finds that entity detection needs more than unconditioned readings, DEC-…-019 must be revisited.

**SECTION COMPLETE — §3 Jyutping Processing System**

---

# §4 — Entity, Resolution and Dictionary Model

**Purpose.** Specify how spans become entities, how entity ambiguity is represented, how the three user stores work and interact, how the layers resolve without contaminating one another, and what structured data a later translation consumer needs. This section carries the pipeline-order constraint from §3.4.5 and the author-supplied Reader constraints from §0.6.

**Exclusions.** No LLM translation provider is designed here (RC-1). No prompts, no API calls, no Anthropic dependency. No Reader internals are assumed.

---

## 4.1 Position in the pipeline

```
source
  → L1 segmentation lattice                    (§3.4, implementation replaceable per RULE-JP-5a)
  → entity candidate generation                (§4.3)
  → entity selection / boundary resolution     (§4.4)
  → reading resolution, entity-conditioned     (§3.5)
  → L3R romanisation           (Chain A / C, §2.6)
  → L3E English surface form   (Chain B, §2.6)
  → protected-span projection                  (§4.11)
```

Entity work sits **between** segmentation and reading resolution, because surname readings differ from ordinary readings (§3.4.5). Two constraints follow.

**RULE-ENT-1 (RECOMMENDED) — one feedback pass, then commit.** Candidate generation may consult *unconditioned* readings (a homophone heuristic, say). Selection commits. Reading resolution then runs once with entity type known. There is no iteration to a fixed point: iteration would make output depend on convergence order, destroying INV-7 and making the Lab's debug trace unreadable.

**RULE-ENT-2 (RECOMMENDED) — conditioning narrows, it does not decide.** Per CHG-020, knowing a span is a surname reduces the candidate reading set; it does not guarantee a unique reading. An entity-conditioned reading may still be `ambiguous`, and `entityType: person.surname` is never by itself grounds for `status: resolved`.

---

## 4.2 Entity taxonomy

**RECOMMENDED.** Dotted hierarchical types. Consumers may match on the prefix (`place.*`) without knowing the leaves, so the taxonomy can grow without breaking them.

| Type | Examples | Typical `formKind` prior (HEURISTIC) | `englishFallbackPolicy` |
|---|---|---|---|
| `person` | 梁知遙, 陳大文 | `romanisation` | `romanisation_allowed` |
| `person.surname` | 梁 (standalone) | `romanisation` | `romanisation_allowed` |
| `person.foreign` | 卡爾·馬克思 | `native_original` | **`prefer_original_recovery`** |
| `place.region` | 香港, 新界 | `official_name` / `romanisation` | `romanisation_allowed` |
| `place.district` | 旺角, 荃灣 | `romanisation`; sometimes `official_name` / `native_original` | `romanisation_allowed` |
| `place.area` | 石硤尾 | `romanisation` | `romanisation_allowed` |
| `place.village` | 圍村 names | `romanisation` | `romanisation_allowed` |
| `place.topographic` | 馬鞍山, 淺水灣 | `romanisation` / `hybrid` — Shan vs Hill, Wan vs Bay | `romanisation_allowed` |
| `street` | 彌敦道, 皇后大道中 | **`hybrid` / `native_original`** | `romanisation_allowed` (but lookup-first, RULE-HKR-10) |
| `building` | estates, courts, towers | `official_name` / `hybrid` | `romanisation_allowed` |
| `facility` | stations, hospitals, schools, temples | **`official_name`** dominant | `no_automatic_romanisation` |
| `org.company` | 恒生銀行 | `official_name` (often `hybrid`) | `no_automatic_romanisation` |
| `org.institution` | 香港大學 | **`official_name`** | **`no_automatic_romanisation`** |
| `org.government` | bureaux, departments | `official_name` | **`no_automatic_romanisation`** |
| `work` | 《明報》, book/film titles | `official_name` / `translation` | `no_automatic_romanisation` |
| `event` | 回歸, named events | `translation` | `no_automatic_romanisation` |
| `other` | unclassified proper noun | unknown | `no_automatic_romanisation` until typed |

**RULE-ENT-3 (RECOMMENDED).** The `formKind` prior is a **ranking input to Chain B, never a decision**. Its function is to stop the engine reaching for the romaniser on 香港大學 and reaching for the gazetteer on a person. A wrong prior costs ordering; it must never cost correctness, so a lower-prior `formKind` with better evidence always wins.

**`englishFallbackPolicy` (CHG-028)** replaces the earlier `romanisable: boolean`, which was misleading: general L3R romanisation is available for **any** Cantonese-readable span (DEC-…-009), so no entity type is "not romanisable". What the entity layer actually needs is a policy on whether romanisation is an acceptable *automatic English-name fallback*.

| Policy | Chain B behaviour on miss | L3R annotation |
|---|---|---|
| `romanisation_allowed` | fall back to the Chain A result (§4.9) | available |
| `prefer_original_recovery` | do **not** auto-assert romanisation; emit `unresolved` + `caution: foreign_origin_suspected`; the right answer is the original name, which the engine usually cannot recover | **still available on request** |
| `no_automatic_romanisation` | do **not** auto-assert romanisation; emit `unresolved` + `caution: official_name_expected` | **still available on request** |

The policy governs **Chain B only**. It never disables L3R. A consumer that explicitly asks for the mechanical romanisation of 香港大學 gets it, marked as mechanical; what it does not get is that string presented as the university's English name.

---

## 4.3 Detection mechanisms

Layered. Each mechanism has its own provenance and its own confidence ceiling. They are combined by union of candidates, not by a score.

| ID | Mechanism | Signal | Provenance | Ceiling | Notes |
|---|---|---|---|---|---|
| **D1** | **Entity-scoped store lookup.** A store entry whose `entryScope` is `entity` | exact/longest match | `user_glossary` | `high` | **Only entity-scoped entries qualify** (RULE-ENT-4). Durable Entity Records are deferred from v1 (§5.10.3) |
| **D2** | **Gazetteer match** against the E3 convention table | longest match | `convention_table` | `high` | Places, streets, buildings |
| **D3** | **Structural marker** — generic suffix (街 道 里 徑 邨 苑 大廈 中心 廣場), org suffix (有限公司 公司 大學 中學 醫院 政府), title (先生 小姐 博士 教授 局長), work brackets 《》 | pattern | `rule_engine` | `medium` | Cheap and strong. The marker itself is usually **outside** the entity span (§4.5.4) |
| **D4** | **Interpunct pattern** — `·` between Han runs (卡爾·馬克思) | pattern | `rule_engine` | `medium` | Strong signal for a **transliterated foreign name** → type `person.foreign`, policy `prefer_original_recovery` |
| **D5** | **Surname-initial heuristic** — a known surname character followed by 1–2 characters in a plausible context | pattern + lexicon | `rule_engine` | **`low`** | Notoriously noisy: 李 is also "plum", 黃 "yellow", 周 "week", 王 "king". Must be context-gated |
| **D6** | **Document-local memory** — this string resolved as an entity earlier in the same document | prior mention | `inherited` | **capped at the antecedent's, never higher** | §4.6 |
| **D7** | **External / statistical NER** | model output | *(see below)* | *(see below)* | **Interface-only in v1** (DEC-…-030, corrected CHG-040 D) |

**RULE-ENT-4 (RECOMMENDED, amended by CHG-023) — entry scope gates detection; resolution values are never shared.**

The earlier formulation — "a key in *any* store makes a span an entity candidate" — was wrong, and would have been expensive. It assumed every store entry names something. None of the three stores has that property:

- **Pronunciation** entries are typically ordinary words and characters (行, 重, 好). None of these is an entity.
- **Translation** entries may be ordinary lexical items or phrases (CHG-024) as well as entity names.
- **HK Romanisation** entries may now apply to arbitrary Cantonese-readable text, since general L3R is a v1 capability (DEC-…-009).

Treating every key as an entity candidate would therefore have turned common vocabulary into detected entities — and, via §4.11, into **protected spans withheld from translation**. That is the same failure mode as the ungated surname heuristic (RULE-ENT-5), reached by a different route.

**The rule.** Every store entry carries an explicit scope:

```jsonc
"entryScope": "lexical" | "phrase" | "entity",
"entityTypeHint": "person" | "place.district" | "street" | "org.institution" | ...   // entity scope only
```

| `entryScope` | Affects | Contributes D1 entity evidence? |
|---|---|---|
| `lexical` | its own layer only (a reading, a romanisation, a term translation) | **No** |
| `phrase` | its own layer only, over a multi-token span | **No** |
| `entity` | its own layer, **and** entity detection | **Yes** |

Scope is set at creation. The default is `lexical`, because the low-friction path must not silently manufacture entities. Where an entry is entity-scoped, `entityTypeHint` supplies a type prior (ranking only, per RULE-ENT-3).

**INV-12 is untouched.** Even for an entity-scoped entry, detection evidence and resolution values remain separate: an entity-scoped HK Romanisation entry for 梁知遙 may cause 梁知遙 to be **detected** as a person; it may **not** become that person's `englishForm`. Chain B runs on its own store and, only on failure, consumes Chain A's *computed output* under §4.9.

**D7's actual status (CHG-040 D).** The pre-CHG-037 description — "`external` / `medium` / non-deterministic ⇒ must be cached and marked" — is **withdrawn**. It contradicts both the provider model and RULE-CONF-3:

| Claim | Correction |
|---|---|
| A live external model participates in detection | **It cannot enter `processText`** at all (§5.13.1). The core never calls a provider |
| Caching makes it conformant | **Caching creates no conformance.** Memoisation is not reproducibility (§10.7) |
| Its output is `provenance: "external"`, `confidence: "medium"` | **`external` has no confidence derivation** (§7.3.4). A required field cannot be filled by a value no rule derives, so such a value **does not ship** (RULE-CONF-3) |

The only routes by which external material may legally reach v1 output are the ones RULE-CONF-3 already names: an external result may be **materialised by host orchestration into a pinned `ProviderSnapshot`**, then consumed as evidence for a `rule_engine` decision (deriving `low`), or promoted by the user into a store entry and derived from that entry's evidence class. Until `external` confidence derivation is settled, a literal `provenance: "external"` produced value is not emitted. D7 therefore ships as **interface only**.

**RULE-ENT-5 (RECOMMENDED) — D5 is gated, not merely low-confidence.** The surname heuristic fires only when at least one corroborating signal is present: an adjacent title (D3), an interpunct or name-list punctuation context, a preceding verb of naming/addressing, a prior confident mention of the same string (D6), or a user store hit. Ungated, it turns every 李, 黃 and 周 in ordinary prose into a person, and — because of §4.11 — would then *protect those spans from translation*, which is the worst available failure. An ungated surname heuristic does not merely add noise; it silently corrupts the translation output.

---

## 4.4 Boundary and selection

### 4.4.1 The three relations between candidates

| Relation | Example | Handling |
|---|---|---|
| **Nested** | 香港 inside 香港大學; 大埔 inside 大埔道 | Both retained. `primary` = the longest candidate whose evidence class is not weaker than the nested one. Nested mentions remain addressable |
| **Identical span, different type** | 中大 as `org.institution` vs as an ordinary word | `ambiguous` at that span; both types retained |
| **Partial overlap** (neither contains the other) | 李小龍主演 segmented as 李小龍 \| 主演 vs 李小 \| 龍主演 | Genuine boundary ambiguity — see RULE-ENT-6 |

**RULE-ENT-6 (RECOMMENDED) — partial overlap.**

- If one candidate's evidence class is **materially stronger** (a gazetteer or store hit against a bare heuristic), select it, mark `status: ambiguous`, retain the loser in `alternatives` with its span.
- If the candidates are **comparable**, select **none**. The region is marked `boundaryAmbiguous`, no entity-level English form is produced, and no protected span is emitted.
- In either case **L3R general romanisation of the underlying tokens remains available** (§2.9), and L2 readings are still resolved from the segmentation lattice. Boundary ambiguity suppresses *naming*, not *annotation*.

This is the entity-level application of RULE-HKR-7: the engine does not break a genuine tie by table order.

### 4.4.2 Nesting invariant

**INV-16 (RECOMMENDED).** Entity spans align to token boundaries; they may nest but may not partially overlap in the *committed* output. Partial overlaps exist only in the candidate set and are resolved by RULE-ENT-6 before commit. At most one entity is `primary` at any position. (This discharges DEC-LANG-20260828-005 from §1.)

---

## 4.5 Person-name structure

### 4.5.1 Patterns

| Pattern | Example | Notes |
|---|---|---|
| 1 + 1 | 陳文 | |
| 1 + 2 | 梁知遙 | most common |
| 2 + 1 | 歐陽鋒 | compound surname |
| 2 + 2 | 司徒美堂 | |
| 1 + 3 | rare but attested | **4 characters are genuinely ambiguous between 2+2 and 1+3** |
| Married double-surname | husband's surname + maiden surname + given name | structure, not just characters, determines the English layout |
| Western given + Chinese name | Peter 陳大文 | the Western portion is already English; never romanised |
| Prefix form | 阿明 | 阿 is a familiarity prefix, conventionally rendered *Ah* — so it **is** romanised, as a prefix unit with its own role |

**RULE-ENT-7 (RECOMMENDED).** A 4-character candidate with a known compound surname prefix (歐陽, 司徒, 諸葛, 上官, 慕容, 皇甫…) is parsed 2+2. A 4-character candidate whose first character is a known single surname and whose first two are *also* a known compound surname is **`ambiguous`** with both parses retained — this is a real conflict and must not be silently resolved by list order.

### 4.5.2 Compound surnames must be a table

Splitting 歐陽 into 歐 + 陽 assigns two wrong syllable roles and produces a wrong romanisation. The compound-surname list is small, closed enough to enumerate, and must be consulted before the single-surname table.

### 4.5.3 Foreign names in Chinese characters

D4's interpunct is the reliable signal; without it, detection is HEURISTIC. Type `person.foreign` sets `englishFallbackPolicy: prefer_original_recovery` and attaches `caution: foreign_origin_suspected` (§2.4.5). The correct operation is **recovery of the original name**, which the engine generally cannot perform — so the honest output is an entity with no English form and an explicit caution, not a Cantonese romanisation of a Slavic name.

### 4.5.4 Titles and markers are evidence, not name

先生, 小姐, 博士, 教授, 局長, 主席 raise detection confidence but are **excluded from the entity span**. They are recorded as `detectionEvidence`, so the Lab can show *why* 王 was read as a surname without the title contaminating the name itself. The same applies to 街/道 for streets: 彌敦道 **includes** 道 because the gazetteer entry does, whereas 王先生 does not include 先生 because the name does not.

---

## 4.6 Entity records and document-local memory

### 4.6.1 Entity record — **DEFERRED from v1 (CHG-040 B)**

> **Superseded illustration.** Durable Entity Records are **not** part of the v1 public contract (§5.10.3). The shape below is retained because it documents what such a record *would* hold, and because §7 records the deferral as DEC-…-058. In v1 every fact shown here is expressed as an **entity-scoped entry in the appropriate store** (pronunciation / translation / HK Romanisation) carrying E1a–E2 evidence. The payload also predates CHG-027/032 vocabulary; §5 is authoritative for shape.

The durable, reusable description a mention resolves *to*. Distinct from the mention (§1.4).

```jsonc
{
  "id": "ent_7f3a",
  "canonical": "梁知遙",
  "aliases": ["知遙", "梁小姐"],
  "type": "person",
  "structure": { "surname": "梁", "givenName": "知遙", "compoundSurname": false },
  "readings": [ { "jyutping": "loeng4 zi1 jiu4", "evidenceClass": "E1b", "preferred": true } ],
  "englishForms": [
    { "text": "Leung Chiyiu", "kind": "conventional_romanisation",
      "evidenceClass": "E1b", "externalAttestation": "not_attested", "preferred": true }
  ],
  "notes": "Creator-canonical; author's own character.",
  "verifiedAt": "2026-08-28T00:00:00Z",
  "createdAt": "2026-08-28T00:00:00Z",
  "source": "user"
}
```

`englishForms` is an **array** because one entity legitimately has several — an official name and a conventional short form, or a maiden and married form — each with its own evidence. Exactly one is `preferred`.

### 4.6.2 Document-local memory and the contamination risk

This discharges the open question left at §1.11.

The benefit is real: 梁知遙 is introduced in full, then referred to as 知遙; a first confident mention should help later ones. The risks are equally real.

| Risk | Example | Rule |
|---|---|---|
| **Type leakage** | 李 is a surname in 李先生, then appears meaning "plum" | Memory raises **detection recall** only. It never overrides local counter-evidence, and a memory-driven candidate still competes normally |
| **Confidence inflation** | the same uncertain guess seen five times starts looking certain | **Repetition is not evidence.** `inherited` confidence is capped at the antecedent's and never rises |
| **Value drift** | a later mention silently acquires an earlier mention's English form | Permitted only for the **same `EntityMemoryEntry`** — matched by `text` or a licensed alias (§5.10.2.2) — and recorded with `provenance: inherited` plus a typed `InheritanceRef` (§5.7.4). **No prior-Analysis id is involved**, and durable Entity Records are deferred (§5.10.3) |
| **Determinism loss** | implicit memory carried between calls makes output depend on call history | See RULE-ENT-8 — this is the serious one |
| **Cross-document leakage** | names from one document appear in another | Memory never persists across documents implicitly |

**RULE-ENT-8 (RECOMMENDED) — memory is scoped or explicit, never ambient.** Document-local memory is either (a) **intra-call**: built and discarded within one `processText` invocation, or (b) **explicitly passed** by the consumer as a `documentContext` input — in which case it is part of the input and therefore part of the cache key (§10). There is no implicit cross-call state. Ambient memory would silently violate INV-7: the same text would process differently depending on what was processed before it, which is exactly the kind of unreproducible behaviour that makes a language tool untrustworthy and untestable.

**RULE-ENT-9 (RECOMMENDED, amended by CHG-039 A and CHG-044 K).** Inheritance is an annotation-channel property, not an Entity-wide property. Every selected inherited `Value<T>` and every inherited candidate carries its own typed **`inheritedFrom: InheritanceRef`** (§5.7.4), identifying either an antecedent mention **in the same Analysis** or an **`EntityMemoryEntry` in the `DocumentContext` supplied to this call** — never a prior Analysis's entity id. A selected non-inherited value/candidate carries no such field. Reading, romanisation and English-form channels may inherit from different antecedents, and a local channel may coexist with inherited channels. Every reference resolves and every channel inheritance is independently rejectable in the Lab; rejecting one re-resolves only that channel without it.

---

## 4.7 The three stores

### 4.7.1 Common schema

```jsonc
{
  "id": "e_0412",
  "store": "pronunciation" | "translation" | "hk_romanisation",
  "key": "行",                    // source term
  "value": "hong4",               // store-specific type
  "entryScope": "lexical",        // lexical | phrase | entity   — CHG-023
  "caseSensitive": false,         // persisted; default false — CHG-044 I
  "match": "exact" | "contextual",
  "context": { "precededBy": [], "followedBy": [] },
  "enabled": true,
  "evidenceClass": "E1a",         // §2.3.1 — E1a/E1b/E1c/E2
  "externalAttestation": "not_applicable", // pronunciation/L2, regardless of E1a–E2
  "attestation": null,
  "note": "",
  "verifiedAt": null,
  "createdAt": "...", "updatedAt": "...", "revision": 3,
  "validation": { "ok": true, "errors": [] }
}
```

An entity-scoped **translation** entry additionally carries required `formKind: FormKind`; that field is forbidden on this pronunciation example, on every HK-Romanisation entry, and on lexical/phrase translation entries. The translation/entity `value` is exact stored text and therefore resolves as a verbatim `EnglishForm` (`assembled:false`), never as stored assembly units.

### 4.7.2 Per-store specifics

| | Pronunciation | Translation / English-form | HK Romanisation |
|---|---|---|---|
| Affects | L2 (§3.5 step 1) | **L3E** when `entryScope: entity`; **L4 translation guidance** when `lexical`/`phrase` | L3R (Chains A/C step 1) |
| Value type | Jyutping syllable sequence | free English text; entity scope additionally stores its exact `FormKind` | Latin-script string |
| Validation | **must** satisfy RULE-JP-2 (valid initial/final/tone); `formKind` forbidden | non-empty; `formKind` required exactly for entity scope and forbidden otherwise | warn if it contains Han characters/digits; `formKind` forbidden |
| Typical `entryScope` | `lexical` | any of the three | `lexical` or `entity` |
| Context filter | neighbours (§3.5.4) | entity type, document tag | entity type |

Here, `document tag` means `StoreMatchContext.documentTag`, evaluated only against the current `processText` invocation's `ProcessOptions.documentTags`. Tags are opaque host-supplied labels. They are not derived from `DocumentContext.id`, filenames, Reader state, Google Docs metadata or any consumer-specific document model.

**The translation glossary is not an entity-name store (CHG-024).** It legitimately holds three different kinds of thing, and collapsing them would break the Reader's existing translation workflow (§0.6 RC-1):

| `entryScope` | Example | Where it goes |
|---|---|---|
| `entity` | 香港大學 → *The University of Hong Kong* | **Chain B step 1** — an entity's English surface form |
| `lexical` | 樓面 → *floor area* | **L4 translation guidance** — a term-level constraint offered to the external translation consumer |
| `phrase` | 落單 → *place an order* | **L4 translation guidance** — a phrase-level constraint |

Lexical and phrase entries **never** trigger entity detection (RULE-ENT-4) and **never** produce an `englishForm`. They first produce core `TermResolution` states over their spans (§4.11, §5); only a selected concrete value projects to the consumer as a *translation directive*. An equal-authority conflict stays null-valued in core and projects no directive. The engine neither performs nor supervises the translation — it states selected user constraints and stops.

**User-store evidence domain and applicability (CHG-044 C).** `StoreEvidenceClass` is exactly E1a/E1b/E1c/E2; E3–E7 have no user StoreEntry producer. For pronunciation/L2 and lexical/phrase translation/L4, `externalAttestation` is `not_applicable` for all four classes. For HK Romanisation/L3R and entity-scoped translation/L3E, E1a/E1b are `not_attested` and E1c/E2 are `attested`. Documentary `Attestation` is independent: E2 requires it even in L2/L4; E1c may carry it; E1a/E1b do not.

### 4.7.3 Operations

Create · edit · delete · search · enable/disable · import · export — for each store independently.

**Matching semantics (RECOMMENDED).**

- **Longest match wins** within a store.
- **Equal-length, both applicable → `conflict`.** No arbitrary tie-break (RULE-HKR-7). The engine returns both and produces no value.
- **Context specificity beats generality**: a contextual entry that matches beats an unconditional entry of the same length.
- **Document-tag conditions**: a `StoreMatchContext.documentTag:"x"` condition is satisfied iff the current call's `ProcessOptions.documentTags` contains exactly `"x"`. Matching is exact and case-sensitive; StoreEntry `caseSensitive` affects key matching only and never folds a document tag. Omitted or empty `documentTags` satisfies no document-tag condition. Duplicate tags have no additional effect and input order has no semantic meaning. `DocumentContext.id` is never consulted for this match.
- **No numeric priority field.** A priority number invites arbitrary tie-breaking and hides conflicts that the user should see. Conflicts are surfaced, not ranked.
- **Case sensitivity**: persisted as required `caseSensitive:boolean`, creation default `false`. For Latin-containing keys, false means case-insensitive matching and true means exact case-sensitive matching; output preserves stored casing. For keys with no case distinction the field has no matching effect. It is never inferred from the current spelling of `key`.
- **Normalisation**: keys are matched under NFC and the declared variant folding (INV-9, RULE-JP-9); the stored key text is never rewritten.

**Duplicate and conflict handling on write.** Creating an entry whose key collides with an existing enabled entry in the same store prompts: replace · keep both and add a context filter to one · disable the old. The engine never silently shadows an existing entry.

**Invalid entries.** Stored, **disabled**, with `validation.errors` populated — never silently dropped and never silently corrected. A user who typed `sik7` sees it normalised to `sik1` (RULE-JP-1) with the change shown; a user who typed `xyz9` sees a validation error.

**Versioning (CHG-047, normative).** A newly created Store-set namespace starts at `userDataVersion = 0`. The counter is global across all three stores and is valid only in the exact public domain `0 ≤ n ≤ 9007199254740991` (`2^53−1`). A successfully committed mutating operation that changes persistent Store state — create, update, remove, enable/disable, or an import apply with one or more writes — increments the counter exactly once, regardless of row count. Reads/search/list/get/export, import preview, `writesApplied:false`, validation/no-op operations, failures and rollbacks do not increment it. If the counter is already at the maximum, a mutation is rejected atomically before any record, `revision`, `updatedAt` or counter change; no wrap, saturation, silent same-version write or rollover is permitted. Each entry still carries its own `revision` and `updatedAt` so the Lab can show per-entry history and imports can be merged sensibly.

### 4.7.4 Import / export

**RECOMMENDED — two formats, one canonical.**

| Format | Role | Contents |
|---|---|---|
| **JSON** (canonical) | round-trip, backup, transfer | `{ schemaVersion, store, exportedAt, engineVersion, entries[] }` — full fidelity including conditional `formKind`, `caseSensitive`, evidence, attestation, context filters and validation state |
| **CSV** (convenience) | hand-editing in a spreadsheet | documented escaping; lossy by design, with omitted `formKind`/`caseSensitive` or other fields named in the header rather than silently lost |

**Import is a merge, not a replace, and is previewed.** The importer reports, before writing: entries added, entries updated, entries that would conflict, entries that fail validation. E3–E7 are packaged/reference/rule evidence only and have no user StoreEntry producer: an import row attempting one is invalid in preview and is not applied. Import never enables a disabled entry silently, never changes `evidenceClass` upward, and round-trips `formKind`/`caseSensitive` exactly.

**Portable storage (RECOMMENDED).** One JSON document per store plus a small index; no database required. This satisfies assumption A2 (single private user), keeps the engine embeddable, makes the stores diffable in version control, and makes "export" and "the storage format" the same thing — which removes a whole class of round-trip bugs. A database is an OPTIONAL later swap behind the same store interface.

---

## 4.8 Unified resolution and conflict precedence

### 4.8.1 The five independent resolutions

| Resolution | Store consulted | Chain | Section |
|---|---|---|---|
| Reading (L2) | pronunciation | §3.5 | §3 |
| HK-style romanisation (L3R) | hk_romanisation | A / C | §2.6 |
| English surface form (L3E) | translation | B | §2.6 |
| Lexical/phrase term rendering (L4) | translation | typed `TermResolution` | §5.8 |
| Entity detection | **all three (detection only)** + gazetteer | §4.3 | RULE-ENT-4 |

### 4.8.2 Conflict precedence table

| Conflict | Winner | Status | Surfaced? |
|---|---|---|---|
| Two enabled entries, same store, same length, both applicable | none | `conflict`; for L4, one null-valued `TermResolution` retains both entry/evidence candidates | **Yes — blocks selected output** |
| Longer store entry vs shorter store entry | longer | `resolved` | no |
| Contextual entry vs unconditional entry, same length | contextual | `resolved` | debug only |
| Store entry vs gazetteer/convention | **store** | `resolved` + `caution: overrides_official` | quietly, in the inspector |
| Gazetteer vs class-level convention table | gazetteer | `resolved` | no |
| Two gazetteer rows, same evidence class, different values | none | `ambiguous` | **Yes** |
| *(withdrawn, CHG-040 B)* Entity record vs store entry | Not applicable in v1: durable Entity Records are deferred (§5.10.3), so there is no second source to rank | — | — |
| Reading conflict between entity-conditioned and word-lexicon reading | entity-conditioned, **if** the entity is `resolved`; otherwise `ambiguous` | varies | per RULE-ENT-2 |
| Detection candidates in partial overlap | per RULE-ENT-6 | `ambiguous` or none | **Yes** |

**L4 conflict is core truth, not a projection artefact (CHG-044 H).** A selected lexical/phrase entry yields a resolved `TermResolution`; equal-authority applicable entries yield `status:"conflict"`, `value:null`, `ranked:false` and candidates carrying their StoreEntry ids and evidence. No preferred string is fabricated. `TranslationDirectives.termDirectives` remains a list of concrete selected directives only, so the conflicted resolution contributes no directive until the user resolves the store conflict. This does not create another translation engine and does not change CHG-042: L4 never enters `englishForm`, never creates an entity and never creates a protected proper-name span.

---

## 4.9 Cross-layer fallback without cross-store mutation

This models RC-2 (§0.6) — the Reader's existing unknown-proper-name policy.

### 4.9.1 The mechanism

```
entity mention
  → Chain B (entity-scoped translation store → gazetteer
             → institutional → public attestation)
       (lexical/phrase translation entries are NOT in this chain — CHG-042 A;
        they resolve separately as L4 termResolutions; selected values alone project)
       ├─ hit  → englishForm { formKind: <as resolved>, assembled: false }   ← verbatim
       └─ miss → englishFallbackPolicy?
                   ├─ prefer_original_recovery     → unresolved + caution
                   ├─ no_automatic_romanisation    → unresolved + caution
                   └─ romanisation_allowed         → consume the Chain A RESULT,
                                                     inheriting its material properties
```

**RULE-ENT-10 (RECOMMENDED, amended by CHG-025) — the fallback inherits, it does not flatten.**

The earlier formulation hard-coded every fallback to `kind: generated_romanisation` / `provenance: rule_engine`. That was wrong. **Chain A can resolve from six different places** (§2.6): a user HK Romanisation glossary entry, a creator-canonical romanised form, bearer/registered evidence, a conventional whole-entity romanisation, a class-level convention, or rule generation. Flattening all six to "rule-generated" would destroy exactly the provenance the packet exists to preserve — and, worse, would make the Hyphenated/Joined toggle restyle a verbatim user-supplied form.

**The rule.** A Chain B fallback **inherits the material properties of the actual L3R value**:

| Inherited from the L3R result | Why it must survive |
|---|---|
| `provenance` | a user-glossary romanisation is not rule output |
| `evidenceClass` | E1b ≠ E7 |
| `status` | a `resolved` romanisation does not become a `fallback` value merely by being consumed |
| `externalAttestation` | unchanged by the act of consumption |
| `assembled` | **verbatim vs engine-assembled — assembly is necessary, but not sufficient, for the person-name style toggle** |
| assembly units | an assembled L3R unit becomes a `kind:"romanised"` English assembly unit without losing its syllable, role, generation status, provenance or evidence; no literal/translated component is invented by this route |
| `styleApplicable` eligibility | not copied from L3R (which has no such field). It is constructed only on the resulting assembled `person:true` English form, and only for generated romanised `role:"given"` units; otherwise it is absent |
| `romanisationRef` | the source L3R annotation, for the inspector |

What Chain B *adds* is the fact that this is a fallback route: `fallbackReason: "no_known_english_form"`. `status` records the value's own solidity; `fallbackReason` records how it got here. They are different facts and are stored separately.

**The worked case that must work (CHG-025).** HK Romanisation store: 梁知遙 → *Leung Chi-yiu*. Translation store: no entry.

```jsonc
"englishForm": {
  "text": "Leung Chi-yiu",
  "formKind": "romanisation",
  "assembled": false,                  // verbatim — user supplied this exact string
  "provenance": "user_glossary",       // NOT rule_engine
  "evidenceClass": "E1a",
  "externalAttestation": "not_attested",
  "status": "resolved",                // the value itself is solid
  "confidence": "high",
  "derivedFrom": {
    "layer": "L3R",
    "romanisationRef": { "owner": "entity", "entityId": "e0",
                           "channel": "romanisation" },
    "fallbackReason": "no_known_english_form",
    "directStoreRead": false           // Chain B did not itself read the HK Romanisation store
  }
  // no styleApplicable ⇒ the Hyphenated/Joined toggle does not touch this value
}
```

**`directStoreRead: false`**, renamed from `storeRead` (CHG-025), asserts precisely one thing: *Chain B did not itself read the HK Romanisation store.* It does **not** claim the value is free of store influence upstream — in this example the value came from that store, via Chain A, which is exactly the intended path. The narrower claim is the one INV-12 actually requires, and it is the one §6 asserts (T-ENT-042, T-ENT-048).

### 4.9.2 Why this is not the same as merging the stores

If the stores were merged, an HK Romanisation entry would *become* an English name, and a user who fixed a spelling would silently be asserting what a thing is called in English. Under the fallback model the user's HK Romanisation entry influences the English output only via a path that is (a) explicitly a fallback **route**, recorded in `derivedFrom.fallbackReason`, (b) **provenance- and evidence-preserving** — the L3R value's `provenance`, `evidenceClass`, `status`, `externalAttestation` and `assembled` are inherited, not flattened to rule output (RULE-ENT-10, CHG-025), (c) machine-checkably distinct from a direct store read (`directStoreRead: false`), and (d) reversible — the moment a real English form is supplied, Chain B hits and the fallback disappears with no store edit required.

### 4.9.3 What the engine does not do

The engine does not perform sentence translation, does not call any model, and does not know that GPT exists. It produces the entity data; the consumer decides how to use it. RC-1 is satisfied by omission, and the engine has **no LLM dependency of any kind**.

---

## 4.10 Generated-name style applicability

This models RC-3 and RC-4.

**RULE-ENT-11 (RECOMMENDED, amended CHG-044 B/CHG-050).** `styleApplicable` is OPTIONAL and legal only on an assembled `person:true` English form that contains at least one generated romanised given-name unit. When present, it identifies the non-empty ordered unit references licensed for given-name transformation under all five profiles (`surname_caps` reuses Hyphenated given-name behaviour). References MUST be unique and strictly increasing by resolved unit position. Non-contiguous references form separate maximal adjacent runs; a style operation never crosses an unlicensed unit. It is absent — never `false` — on every verbatim source, every non-person assembly, and every person assembly without licensed generated given units.

**RULE-ENT-11a (RECOMMENDED, amended CHG-044 B/CHG-050).** `assembled:true` is necessary but no longer sufficient for licensed given-name joining. The full gate is: outer Entity is a person; the English form is assembled with `person:true`; every referenced unit is `kind:"romanised"`, `role:"given"`, `generated:true`; and at least one unit is referenced. Literal and translated unit text is preserved byte-for-byte under every profile. Surname, prefix, non-generated romanised and unreferenced romanised units are **not joining targets**; they may still receive the shared assembled-romanisation presentation casing, and romanised surname units receive the explicit Lab-only ASCII-uppercase exception under `surname_caps`. This is the precise meaning of earlier statements that those units are “unchanged”.

**Grouping is independent of style licensing (CHG-050).** Every assembled English form, whether person/non-person and styled/unstyled, carries non-empty units and a complete order-preserving grouping partition. Base rendering concatenates unit text inside each group with no separator and joins group results with exactly U+0020, without normalisation. Person styling never reorders units, changes grouping validity, or expands `styleApplicable`; it overrides only the separators and romanised target casing authorised by §5.11.

| Source of the English form | `assembled` | `styleApplicable` | Effect of person profiles |
|---|---|---|---|
| Creator-canonical entry (E1b) | false | absent | **none** — 梁知遙 → *Leung Chiyiu* stays *Leung Chiyiu* in Hyphenated mode |
| Bearer/registered spelling (E1c/E2) | false | absent | none |
| User glossary form (E1a) — **including one reached via the §4.9 L3R fallback** | false | absent | none |
| Official English entity name (E3/E4) | false | absent | none |
| Conventional whole-entity form (E5) | false | absent | none |
| Engine-assembled non-person romanisation/hybrid | true | absent | none — identical rendering for all five profiles |
| Mixed person assembly with literal Western component | true | present only for generated romanised given units | joining applies only to licensed runs; Western literal remains byte-exact |
| Engine-assembled person with no generated given unit | true | absent | no joining; `surname_caps` may still uppercase romanised surname units |
| **Engine-assembled personal-name fallback with generated given units** | **true** | **present** | joining applies to referenced runs; `surname_caps` also uppercases romanised surname units |

**Executable presentation mapping.** Rendering preserves units-array order. The surname/given boundary is always exactly U+0020 SPACE. For the `leung` / `chi` / `yiu` assembled-person fixture, all three units in separate grouping-defined words and `chi`,`yiu` licensed as one adjacent run, the five profiles are exactly:

| `StyleProfile` | Exact result | Operation |
|---|---|---|
| `hyphenated` | `Leung Chi-yiu` | U+002D inside each licensed run; first element title-cased, later elements lower-cased |
| `joined` | `Leung Chiyiu` | concatenate each licensed run, then title-case the resulting word |
| `spaced` | `Leung Chi Yiu` | U+0020 between licensed units; title-case each |
| `hyphen_title` | `Leung Chi-Yiu` | U+002D between licensed units; title-case each |
| `surname_caps` | `LEUNG Chi-yiu` | Hyphenated given-name behaviour plus ASCII-uppercase on assembled romanised surname units |

A composite whose surname is attested (E6 class table: *Leung*) and whose given name is generated is `styleApplicable`, scoped to the generated romanised given-name ids. A mixed *Peter Chan Tai-man* assembly additionally carries *Peter* as a literal unit with no syllable. Literal and translated text stays byte-exact. Non-target romanised units render identically between `hyphenated` and `joined` after their shared presentation casing. `surname_caps` is a Lab-only exception and remains invalid for `GeneratedPersonNameStyle`.

**No global default (CHG-009), stated precisely (CHG-042 E/CHG-050).** The style-neutral `Analysis` emits no rendered form — an assembled form carries units and no `text` (RULE-API-10). `@hklang/style` can render any requested profile from the same assembled units, and neither a profile nor the profile set implies the unresolved global `givenNameJoin` default. The narrower Reader projection still requires the consumer to supply `hyphenated` or `joined` explicitly.

The variants are **not** stored in the Analysis (CHG-032 item 2). The consumer obtains them from the pure style module:

```ts
renderVariants(form, ["joined", "joined", "hyphenated"])
// → [ { profile: "joined",     text: "Leung Chiyiu"  },
//     { profile: "joined",     text: "Leung Chiyiu"  },
//     { profile: "hyphenated", text: "Leung Chi-yiu" } ]
```

`renderVariants(form, profiles)` is exactly `profiles.map(profile => ({ profile, text: renderPersonName(form, profile) }))`: caller order and duplicates are preserved; `[]` returns `[]`; no sorting, deduplication or implicit default occurs.

### 4.10.1 Style-neutral core, pure projection (CHG-026)

There was a structural contradiction in the packet: an assembled personal name has multiple presentation renderings and no engine default, while a Reader protected span (§4.11) needs **one** concrete `replacement` from its narrower Hyphenated/Joined setting. Resolved by separating analysis from projection.

```
processText(input, options)  ──►  Analysis          (style-NEUTRAL, cacheable, deterministic)
                                   • tokens, readings
                                   • romanisation units
                                   • entities, englishForms
                                   • assembled / typed units / conditional styleApplicable
                                     (NO rendered text for assembled forms)

projectTranslationDirectives(Analysis, { generatedPersonNameStyle })  ──►  TranslationDirectives
                                   (GeneratedPersonNameStyle = "hyphenated" | "joined")
                                   • concrete protectedSpans[] with one replacement each
                                   • projection-local diagnostics[]
```

**RULE-ENT-14 (RECOMMENDED, amended CHG-045 A).** The projection helper is **pure**: same `(Analysis, settings)` ⇒ byte-identical output, including deterministically ordered projection diagnostics; no I/O, no store reads, no engine state. Its diagnostics are return data produced by this invocation, never a side effect: it neither mutates `Analysis`/`Analysis.diagnostics` nor copies unrelated analysis diagnostics. Switching Hyphenated ↔ Joined re-projects only. It must **not** cause re-segmentation, re-running entity detection, re-resolving readings, re-running romanisation, or refetching source text.

This is the concrete instance of INV-10 (mode completeness) and it settles DEC-…-016: style profiles live in a pure module that both the Lab and any future Reader import, so the two cannot diverge, while the module has no dependency on engine internals. The `Analysis` alone is what gets cached (§10); projections are cheap enough to recompute and are never cached against a style setting.

---

## 4.11 Protected spans for an external translation consumer

**RULE-ENT-12 (RECOMMENDED, amended by CHG-026).** `protectedSpans[]` is produced by **`projectTranslationDirectives`**, not by `processText`. This is what allows every entry to carry exactly one concrete `replacement` while the core analysis stays style-neutral.

```jsonc
{
  "span": [8, 11],
  "entityId": "ent_7f3a",
  "entityType": "person",
  "replacement": "Leung Chiyiu",       // concrete: style already applied if applicable
  "formKind": "romanisation",
  "assembled": false,
  "provenance": "user_glossary",
  "evidenceClass": "E1b",
  "externalAttestation": "not_attested",
  "protection": "strict",
  "styleApplied": null,                // null whenever person style is inapplicable
  "rationale": "creator_canonical_form"
}
```

`styleApplied` records which profile the projection used, or `null` when none was applicable — including verbatim, non-person assembled and unstyled person-assembled values. A consumer can therefore distinguish "Joined was applied to licensed generated given units" from "no person-name style was involved".

**Protection levels.**

**Protection level is derived from the value's evidence class, never from the route it took** (CHG-042 E; agrees with §5.12 rule 6). The earlier table defined `fallback` by "reached via the §4.9 L3R route" and then said the route does not determine the level — a self-contradiction. A verbatim E1a romanisation that reaches Chain B by the L3R fallback is `strict`, because E1a is what it is.

| Level | Derived from | Meaning for the consumer |
|---|---|---|
| `strict` | **E1a–E4** — stipulated, creator-canonical, bearer-asserted, documented, official, gazetted | Substitute verbatim. Never translate |
| `preferred` | **E5** — broad public attestation | Substitute; a consumer with better context may override |
| `fallback` | A usable selected English form of **lower authority** — class-level or generated (E6/E7) | Substitute **in preference to letting the consumer invent a name** — precisely RC-2's purpose |

There is no `none` member in `ProtectedSpan.protection`. An entity below the confidence floor remains in `Analysis` but emits no `ProtectedSpan`; a boundary-ambiguous region likewise emits none.

### 4.11.1 The safety analysis that sets the floor

Protection is not free. Protecting a span the engine **wrongly** detected as an entity prevents the consumer from translating an ordinary word — 李 protected as *Lee* when it meant "plum" produces a worse output than no entity detection at all. The failure is silent and looks like a translation bug.

**RULE-ENT-13 (RECOMMENDED).** Only entities at or above a configurable `protectionConfidenceFloor` are emitted as `ProtectedSpan`s. Below it, the Entity remains in `Analysis.entities[]` but projection emits no protected span; `protection` is a `ProtectedSpan` field, not an Entity field. The floor's default excludes bare D5 (ungated surname heuristic) output. Combined with RULE-ENT-5, this means the noisiest detector cannot reach the translation output at all.

This is the one place where a false positive in entity detection causes damage *outside* the engine, so it is the one place where the engine is deliberately conservative rather than merely honest.

### 4.11.2 Overlaps and nesting in protected spans

Protected spans must be **non-overlapping** for a substitution-based consumer to be implementable. Where entities nest (香港 inside 香港大學), only the `primary` is protected. The engine guarantees this (INV-17) rather than leaving the consumer to deduplicate.

**INV-17 (RECOMMENDED).** `protectedSpans[]` contains no two overlapping spans, is sorted by `span.start`, and every entry's `replacement` is non-empty.

After `protectedSpans` is fixed, each selected L4 `TermDirective` is checked against it in the deterministic `Analysis.termResolutions` order (§5.8). If one selected directive overlaps one or more protected spans, protection wins: that directive is omitted and exactly one `Diagnostic` with `code:"TERM_DIRECTIVE_DROPPED_OVERLAP"` is appended to `TranslationDirectives.diagnostics`. The diagnostic `span` is exactly the dropped directive span; `data` may carry its `entryId` and the affected protected entity id or ids. The count is per dropped directive, not per overlap pair. This never mutates `Analysis` or `Analysis.diagnostics`; identical `(Analysis, DirectiveSettings)` inputs yield byte-identical diagnostics.

### 4.11.3 Boundary of responsibility

The projection supplies spans, replacements and its own invocation-local diagnostics. **How** a consumer protects spans — placeholder substitution, instruction, post-hoc restoration, or something else — is entirely the consumer's design, and no prompt, template or API shape is specified here (RC-1).

---

## 4.12 Failure and uncertainty

| Situation | Behaviour |
|---|---|
| No entity detected in a span that is one | Silent. The engine cannot report what it did not find; §6 measures recall |
| Entity detected, type unknown | `type: other`, no `formKind` prior, Chain B runs without a prior, `englishFallbackPolicy: no_automatic_romanisation` until typed. L3R remains available |
| Boundary ambiguous | RULE-ENT-6: no naming, no protection; L2 and L3R still produced |
| Entity resolved, no English form, policy `prefer_original_recovery` / `no_automatic_romanisation` | `englishForm.status: unresolved` + the corresponding caution; the Entity remains in `Analysis`, **no `ProtectedSpan` is emitted**, and the span is reported as an **unresolved semantic span** for the external consumer |
| Entity resolved, no English form, policy `romanisation_allowed` | §4.9 fallback, inheriting the L3R value's properties |
| Two enabled store entries conflict | `conflict`; no value; **no protected span** — an unresolved conflict must not silently pick one and export it |
| *(withdrawn, CHG-040 B)* Entity record and store entry disagree | Not applicable in v1 (§5.10.3) |
| Detection depends on a reading that is itself ambiguous | Candidate generated at reduced confidence; RULE-ENT-2 prevents the entity from laundering the reading into certainty |
| `documentContext` supplied but stale | Treated as input data; no validity check is possible, so it is recorded in provenance and the cache key |

---

## 4.13 Test seeds arising from §4

**Deterministic:**

| ID | Input / setup | Asserts |
|---|---|---|
| T-ENT-001 | 香港大學 | `org.institution`; nested 香港 retained but not `primary`; Chain B yields `official_name`; Chain A fallback **not** used |
| T-ENT-002 | 王先生 | entity span = 王 only; 先生 recorded as `detectionEvidence`, excluded from the name |
| T-ENT-003 | 大埔道 | one `street` entity, not `place.district` 大埔 + 道 |
| T-ENT-004 | 歐陽鋒 | 2+1 parse; compound surname consulted before single-surname table |
| T-ENT-005 | 卡爾·馬克思 | `person.foreign`, `englishFallbackPolicy: prefer_original_recovery`; no romanisation auto-asserted as the English name; explicit L3R request still returns mechanical data (CHG-028) |
| T-ENT-006 | 梁知遙 with creator-canonical entry, Hyphenated mode selected | output remains *Leung Chiyiu*; `styleApplicable` is absent because the form is verbatim (RC-4) |
| T-ENT-007 | 梁知遙 with no entry, both style modes | `renderVariants` yields *Leung Chi-yiu* and *Leung Chiyiu*; surname unchanged in both; the `Analysis` itself contains **neither** rendered string |
| T-ENT-008 | A 4-character name that is both 1+3 and 2+2 parseable | `ambiguous`, both parses retained |

**Heuristic / ambiguity:**

| ID | Setup | Expected |
|---|---|---|
| T-ENT-020 | 李 in ordinary prose meaning "plum", no corroborating signal | **not** detected as a person (RULE-ENT-5); **not** protected |
| T-ENT-021 | 李 preceded by a naming verb and followed by 先生 | detected, `low` confidence, protection governed by the floor |
| T-ENT-022 | Same string entity in one sentence, ordinary word in another | memory raises recall only; the second occurrence is not forced (RULE-ENT-8) |
| T-ENT-023 | An uncertain entity repeated 5 times | confidence does **not** rise |
| T-ENT-024 | Partial-overlap candidates of comparable evidence | no `primary`; `boundaryAmbiguous`; L3R still produced |
| T-ENT-025 | Two enabled conflicting HK Romanisation entries on one entity | `conflict`; no protected span emitted |

**Invariant / regression:**

| ID | Assertion |
|---|---|
| T-ENT-040 | No two spans in `protectedSpans[]` overlap; the array is sorted; every `replacement` is non-empty (INV-17) |
| T-ENT-041 | Entity spans in committed output never partially overlap (INV-16) |
| T-ENT-042 | Every English form reached by the §4.9 route carries `derivedFrom.directStoreRead: false`, and Chain B never reads the HK Romanisation store directly (INV-12 / RULE-ENT-10) |
| T-ENT-048 | **HK Romanisation store: 梁知遙 → *Leung Chi-yiu*; translation store: empty.** The English form resolves to *Leung Chi-yiu* via the L3R fallback with `provenance: user_glossary`, `evidenceClass: E1a`, `assembled: false`, `status: resolved`, `derivedFrom.directStoreRead: false`, **no** `styleApplicable`. It is **not** relabelled `rule_engine`, and selecting Joined mode does **not** rewrite it to *Leung Chiyiu* (CHG-025) |
| T-ENT-049 | A `lexical`- or `phrase`-scoped entry in any store creates **no** entity candidate and **no** protected span (RULE-ENT-4 / CHG-023) |
| T-ENT-050 | A selected `lexical`-scoped translation entry appears first as a resolved core L4 `TermResolution` and then as a projected `TermDirective` over its span, never as an `englishForm` (CHG-024 / CHG-044 H) |
| T-ENT-051 | `projectTranslationDirectives` is pure: identical `(Analysis, settings)` yields byte-identical output including diagnostics; projection does not mutate or copy `Analysis.diagnostics`; switching only `generatedPersonNameStyle` changes only applicable `replacement`/`styleApplied` while geometry and overlap diagnostics remain byte-identical, and re-projection performs no segmentation, detection, reading or romanisation work (RULE-ENT-14) |
| T-ENT-052 | "Conventional" is **derived, never stored**: no object carries a stored conventional-status field, and the derived predicate is `formKind === "romanisation" && !assembled && externalAttestation === "attested" && evidenceClass ∈ {E3,E4,E5,E6}` (CHG-027, vocabulary updated by CHG-038/039) |
| T-ENT-043 | Every form for which `styleApplicable` is absent is invariant under Hyphenated and Joined projection; in particular every verbatim form is unchanged (RC-4) |
| T-ENT-044 | Adding an HK Romanisation entry changes no L2 reading and no translation-store value (INV-12) |
| T-ENT-045 | Processing the same text twice with the same `documentContext` yields byte-identical output; processing with no context does **not** inherit from a previous call (RULE-ENT-8 / INV-7) |
| T-ENT-046 | Every `inherited` annotation has a typed `inheritedFrom` and confidence ≤ its antecedent's |
| T-ENT-054 | **Alias recurrence is licensed, not inferred.** A `DocumentContext` alias matches only where the entry's `MemoryPersonName` justifies it (given-name substring, or text minus a recognised prefix); an alias not so licensed is rejected by the schema check, and an alias match raises recall without raising confidence (RULE-ENT-15) |
| T-ENT-053 | **Cross-call inheritance carries no Analysis id.** Given chunk₀ → `DocumentContext` → chunk₁: every `inheritedFrom` in chunk₁ is either `{kind:"analysis", …}` resolving inside chunk₁, or `{kind:"documentContext", contextId, ref}` resolving against the exact context passed in. **No value anywhere in chunk₁ contains an entity id from chunk₀.** Re-running chunk₀ so its ids change leaves chunk₁ byte-identical, given the same context (RULE-API-19, RULE-INT-4) |
| T-ENT-047 | An entity below `protectionConfidenceFloor` remains in `Analysis` but produces no `ProtectedSpan` |
| T-ENT-055 | An assembled non-person hybrid with units `nei`,`tun`,`Road` uses `[[0],[1],[2]]` and renders *Nei Tun Road*; it has `person:false`, only romanised units carry syllables, no `styleApplicable`, and all five person-name profiles produce the same rendering (CHG-044 B/CHG-050) |
| T-ENT-056 | An assembled mixed person form *Peter Chan Tai-man* represents *Peter* as a literal unit and the Chinese components as romanised units; no Cantonese syllable is assigned to *Peter*, and the toggle reaches only generated romanised given-name unit ids (CHG-044 B) |
| T-ENT-057 | One Entity inherits its reading from Analysis entity A and its English form from DocumentContext entry B while resolving romanisation locally; each inherited selected value carries its own reference and the Entity has no aggregate inheritance slot (CHG-044 K) |
| T-ENT-058 | Two equal-authority lexical/phrase translation entries yield one core L4 `conflict` with null value and unordered candidates; no `TermDirective`, entity, English form or protected span is produced (CHG-044 H) |
| T-ENT-059 | The `leung`/`chi`/`yiu` assembled-person fixture renders exactly `Leung Chi-yiu`, `Leung Chiyiu`, `Leung Chi Yiu`, `Leung Chi-Yiu`, `LEUNG Chi-yiu` for the five `StyleProfile` members respectively; a mixed literal/romanised/translated fixture and an unstyled person prove literal/translated invariance, separated licensed-run boundaries and the Lab-only surname exception (CHG-050) |

---

## 4.14 Decisions raised by §4

| ID | Question | Options | Recommended default | Confidence | Must decide before implementation? |
|---|---|---|---|---|---|
| DEC-LANG-20260828-024 | Where does the `protectionConfidenceFloor` sit? | any band | **`medium`** — excludes ungated D5 output; tune on §6 data | Medium — the asymmetry argument (§4.11.1) is solid, the exact band is not | No — configurable, but the floor must exist |
| DEC-LANG-20260828-025 | Is document-local memory intra-call only, or an explicit `documentContext` input? | (a) intra-call only; (b) optional explicit input; (c) ambient | **AMENDED (CHG-029): (a) and (b) both in v1.** `documentContext` is an **optional v1 API parameter**. Omitted ⇒ intra-call memory only. Supplied ⇒ explicit input, part of the cache key, inherited values provenance-marked and confidence-capped. **(c) ambient remains hard-excluded** — it breaks INV-7. This supports consumers that process one document in chunks or paragraphs | High | Settled |
| DEC-LANG-20260828-031 | What is the default `entryScope` for a newly created store entry? | lexical / phrase / entity | **`lexical`** — the low-friction path must not silently manufacture entities, given that a spurious entity becomes a protected span (§4.11.1) | Medium-high | **Yes** — store schema |
| DEC-LANG-20260828-026 | Do store entries carry a numeric priority? | yes / no | **No.** Surface conflicts instead of ranking them | Medium-high | **Yes** — it is a store schema decision |
| DEC-LANG-20260828-027 | Is an entity record's `preferred` form outranked by a store entry? | record wins / store wins | **SUPERSEDED — NOT APPLICABLE IN V1**, by DEC-…-058 (CHG-040 B, propagated CHG-041). Durable Entity Records are deferred (§5.10.3), so the conflict cannot arise. Retained as v2 reasoning only: were records to return, the store would win, as the more specific and more recent user act | — | No |
| DEC-LANG-20260828-028 | Portable storage: JSON documents, SQLite, or IndexedDB? | any | **JSON documents** — diffable, embeddable, export ≡ storage; others behind the same interface later | Medium-high | No — but the store interface must exist from day one |
| DEC-LANG-20260828-029 | Does the engine ship an entity gazetteer for **persons**? | yes / no | **No — v1 ships no person gazetteer.** No authoritative public source of person names is known to this packet, and no public registry can supply how an arbitrary individual spells their own name (L3E.1, a structural limit). Person mentions arise from §4.3's detection mechanisms and entity-scoped store entries; the **spelling** stays evidence-bound | High | No |
| DEC-LANG-20260828-030 | Is D7 (external NER) in v1? | yes / no / interface only | **Interface only (reaffirmed, CHG-040 D).** Three independent reasons now: the core cannot call a provider (§5.13.1); `external` has no confidence derivation, so such a value cannot legally be constructed (RULE-CONF-3); and RULE-ENT-13 already caps how much detection recall is worth | High | No |

---

## 4.16 Form mechanism vs evidence — vocabulary reconciliation (CHG-027)

The earlier `kind` enum mixed two independent questions and produced values that contradict themselves. `kind: conventional_romanisation` + `evidenceClass: E1b` + `externallyAttested: false` says "this follows an attested external convention" and "this is the author's own invention, unattested" in the same object.

**The split.**

| Field | Question | Values |
|---|---|---|
| `formKind` | **What kind of form is this, linguistically?** | `romanisation` · `official_name` · `native_original` · `translation` · `hybrid` |
| `assembled` | **Did the engine build it, or is it verbatim?** | `true` / `false` — `true` is necessary but not sufficient for the person-name style toggle; RULE-ENT-11a supplies the remaining conditions |
| `provenance` | Where did this value come from? | §1.7 closed set |
| `evidenceClass` | What class of evidence backs it? | E1a…E7 (§2.3.1) |
| `externalAttestation` | Does anyone outside the user's own material use this? | `attested` / `not_attested` / `not_applicable` (tri-state since CHG-032; the earlier boolean is withdrawn) |
| `status` / `confidence` | How solid is it? | §1.7 |

"Conventional" is no longer a stored value; it is **derived**: `formKind == "romanisation" && !assembled && externalAttestation === "attested" && evidenceClass ∈ {E3, E4, E5, E6}`. That makes the contradiction unrepresentable rather than merely discouraged.

**Migration from the superseded vocabulary.** Earlier sections' examples may still show the old values; **§5 is authoritative**.

| Superseded `kind` | Becomes |
|---|---|
| `conventional_romanisation` | `formKind: romanisation`, `assembled: false`, + evidence fields |
| `generated_romanisation` | `formKind: romanisation`, `assembled: true`, `provenance: rule_engine`, `evidenceClass: E7` |
| `bearer_registered` | **not a mechanism.** `formKind: romanisation` (usually), `evidenceClass: E1c` or `E2` |
| `calque_or_hybrid` | `formKind: hybrid` |
| `literal_translation` | `formKind: translation` |
| `official_name` | `formKind: official_name` (unchanged) |
| `native_original` | `formKind: native_original` (unchanged) |
| `mechanical_romanisation` (L3R) | `formKind: romanisation`, `assembled: true` — the L3R channel already implies mechanism |
| `externallyAttested: boolean` | **`externalAttestation: "attested" \| "not_attested" \| "not_applicable"`** (CHG-032 item 6). Earlier §1–§4 examples showing the boolean are superseded by §5 |
| a form carrying both `text` and `units` | **discriminated union** — verbatim has `text`, assembled has `units` and no `text` (CHG-032 item 1) |

**The creator-canonical case, now representable without lying:**

```jsonc
{ "text": "Leung Chiyiu", "formKind": "romanisation", "assembled": false,
  "provenance": "user_glossary", "evidenceClass": "E1b",
  "externalAttestation": "not_attested", "status": "resolved", "confidence": "high" }
```

Not "conventional". Not "externally attested". Not "generated". Authoritative for the author's material, and honest about why.

## 4.15 Known limitations of §4

1. **Detection accuracy is entirely unmeasured.** §4 specifies mechanisms, gating and failure behaviour, not performance. Recall and precision are §6's job, and RULE-ENT-5's gating is a *safety* argument, not an accuracy claim.
2. **The compound-surname list, title list, generic-suffix list and org-suffix list are not enumerated here.** They are small, closed and buildable, but this session has not built them; §6 must include coverage tests for each.
3. **Person-name pattern rules are HEURISTIC throughout.** The 2+2/1+3 ambiguity has no general solution, and the packet correctly declines to invent one.
4. **`person.foreign` detection without an interpunct is weak.** Many transliterated names carry no punctuation cue, and the engine will romanise some of them. The caution machinery limits the damage; it does not prevent it.
5. **The `formKind` prior table (§4.2) is intuition, not data.** It is used only for ranking (RULE-ENT-3), so an error costs ordering rather than correctness — but it should be validated against the gazetteer in §6.
6. **Nothing here has been reconciled with the actual Reader.** RC-1…RC-4 are author-supplied statements about existing behaviour. The engine is designed to be *capable* of serving them; whether the Reader's actual interfaces match is a question only an agent with Reader access can answer.

**SECTION COMPLETE — §4 Entity + Resolution + Dictionary Model**

---

# §5 — Engine Architecture and Public Data Contract

**Contract version: `5.0.16`. §5 editorial revision: v0.16.**

**Governance (CHG-037 E) — `5.0.x` is a pre-implementation corrective series.** The earlier claim that these revisions were "additive only: no field removed, no meaning changed" is **withdrawn as inaccurate**: CHG-036 corrected id semantics, clarified INV-7's scope and changed cache identity semantics, which §5.17's own policy would classify as breaking. Pretending otherwise would make the compatibility policy meaningless on its first real test.

| Phase | Rule |
|---|---|
| **`5.0.x` — now** | Pre-implementation corrective series. Contradictions found by review are fixed in place, the patch component is bumped, and **the change log is the authority** on what changed. §5.17's compatibility policy is *documented but not yet in force*. No consumer exists to break |
| **`5.1.0` — at first implementation release** | The compatibility boundary. From this point §5.17 applies literally: adding an optional field is a patch, adding an enum member is minor, changing a field's meaning or removing one is **major** |

Revisions: `5.0.1` initial freeze · `5.0.2` CHG-032 · `5.0.3` CHG-035 A · `5.0.4` CHG-036 · `5.0.5` CHG-037 (provider representation, governance, residues) · `5.0.6` CHG-039 (`DocumentContext` wire contract, `InheritanceRef`, snapshot identity) · `5.0.7` CHG-040 (span-free memory types, Entity Records deferred, snapshot preimage) · `5.0.8` CHG-041 (single-source preimages, deferral and DEC-032 propagation, section ordering) · `5.0.9` CHG-042 (L4/Chain-B boundary, single-store entries, deferred convenience views, narrowed directive style) · `5.0.10` CHG-044 (Stage-0 materialisation / representability correction) · `5.0.11` CHG-045 (observability and contextual-input closure) · `5.0.12` CHG-046 (domain-separated byte-identity preimages; residual `userDataVersion` integer-domain blocker) · `5.0.13` CHG-047 (exact public `userDataVersion` integer domain, transaction lifecycle, overflow and semantic-int64 closure) · `5.0.14` CHG-048 (hash-reachable grouping integer/local-index closure) · `5.0.15` CHG-049 (byte-exact composite Version-fingerprint preimages; no implementation run) · `5.0.16` CHG-050 (style-rendering executable semantic closure; no implementation run).

**Prior text (CHG-032):** v0.1 contained nine internal contradictions that made it unimplementable as written; they are fixed below and listed in the change log. The freeze holds: these are corrections to make the frozen contract representable and testable, not reopened design.

**STATUS: SCHEMA FREEZE.** This section is authoritative wherever an earlier section's illustrative example uses superseded vocabulary (see §4.16). Earlier sections remain authoritative for *linguistic* rules; §5 is authoritative for *shape*.

**Language neutrality.** TypeScript is used to *illustrate* the contract because it is precise and compact. The contract itself is language-neutral: it is a JSON document shape plus a set of function signatures. A Python, Rust or Go implementation satisfying §5.4–§5.9 and §5.10 is conformant. Nothing in the contract requires TypeScript, and DEC-…-006 (implementation language) stays open.

---

## 5.1 Module boundaries

```
@hklang/core        types, value envelope, invariants, version records.        NO data, NO I/O.
@hklang/phonology   syllable structure, Jyutping validation (RULE-JP-2).       Depends: core.
@hklang/lexicon     Lexicon interface + loaders.                                Depends: core, phonology.
@hklang/segment     Segmenter interface + default implementation.               Depends: core, lexicon.
@hklang/romanise    L3R rule pack, convention tables, generator.                Depends: core, phonology.
@hklang/entity      detection, selection, boundary resolution.                  Depends: core, segment, lexicon.
@hklang/stores      the three user stores; portable JSON persistence.           Depends: core, phonology.
@hklang/engine      orchestration; processText.                                 Depends: all of the above.
@hklang/style       PURE projections: name styling, annotation and             Depends: core ONLY.
                    translation-directive projection.
@hklang/lab         the standalone Language Lab UI (§9).                        Depends: engine, style.
```

**RULE-API-1 (RECOMMENDED).** Dependencies point strictly downward; there are no cycles. `@hklang/style` depends on `@hklang/core` **only** — it never imports the engine. This is what makes it safe for a future Reader to import styling without pulling in lexicons, and it is the structural form of DEC-…-016's answer (§5.11).

**RULE-API-2 (RECOMMENDED, narrowed by CHG-041) — no consumer concepts.** No engine type models a page, paragraph index, chunk, scroll position, Google Docs entity, Reader schema, GPT, or any model. Restates RULE-ARCH-1, including its stated exception: `DocumentContext` is a generic opaque continuity input with no document-position semantics, not an imported consumer model. **No module depends on any LLM or model API** (RC-1).

---

## 5.2 Core conventions

| Convention | Value |
|---|---|
| Offsets | **UTF-16 code units**, declared as `offsetUnit: "utf16"` on every Analysis (INV-8, DEC-…-003). Consumers must read the field, not assume |
| Spans | `[start, end)`, half-open, `start ≤ end` |
| Ids | Opaque strings. **Deterministic** for a fixed input tuple (INV-7 holds), **non-persistent** across any change. Assigned at final composition. Never parse them — see §5.2.1 |
| Enums | Closed **for producers**, open **for consumers** — see §5.17 |
| Null vs absent | `null` = "computed, no value" (with a `status` explaining why). Absent = "not applicable to this shape". Never use `undefined` to mean unresolved |
| Key order | Serialisation is key-ordered and stable, so a diff is a regression test (INV-7) |
| Text | Never normalised, never rewritten (INV-1, INV-9) |

The following supporting vocabularies are public because live §5 fields refer to them. `JsonValue` is the serialisable extension/diagnostic domain; it excludes functions, symbols, `undefined`, non-finite numbers and cyclic values.

```ts
type JsonValue =
  | null | boolean | number | string
  | JsonValue[]
  | { [key: string]: JsonValue };

type NonEmptyArray<T> = [T, ...T[]];
type NonEmptyReadonlyArray<T> = readonly [T, ...T[]];

type TokenType =
  | "han" | "latin" | "digit" | "punct_cjk" | "punct_latin"
  | "space" | "symbol" | "emoji" | "script_other" | "unknown";

type EntityType =
  | "person" | "person.surname" | "person.foreign"
  | "place.region" | "place.district" | "place.area" | "place.village"
  | "place.topographic" | "street" | "building" | "facility"
  | "org.company" | "org.institution" | "org.government"
  | "work" | "event" | "other";
```

### 5.2.1 Id determinism vs id persistence (CHG-036 A)

The v0.1–v0.3 wording — "stable within one Analysis, not stable across calls" — **could not coexist with INV-7**. Ids are serialised into the Analysis, so if they varied between two runs of the same input the output would not be byte-identical. The two statements were conflating two different properties.

| Property | Holds? | Meaning |
|---|---|---|
| **Determinism** | **YES — required** | For an identical input tuple — the full set of `analysisCacheKey` inputs enumerated in §5.15, **including `providerSnapshotId`** —, every generated id is identical. Without this INV-7 is false |
| **Persistence** | **NO — explicitly not** | Ids are not durable identifiers. They may change if *anything* changes: source, options, any version axis, `documentContext`, segmentation, or the composition of the Analysis. A consumer that stores an id and expects it to mean the same thing later is wrong |

**RULE-API-13 (RECOMMENDED) — ids are assigned once, at final composition.** Cached window fragments (§10.3) carry **fragment-local indices only** — never global ids and never global offsets. Global ids are assigned when fragments are composed into the whole Analysis, by this deterministic traversal:

| Kind | Assignment order |
|---|---|
| Tokens | ascending `span.start` → `t0, t1, …` |
| Entities | ascending `span.start`, then **descending** `span.end` (containers before contained), then ascending `type` → `e0, e1, …`; exactly one committed Entity per `(span,type)` — competing interpretations live in candidates/ambiguous regions, not duplicate Entity rows |
| Romanisation units + English assembly units | one shared `u*` namespace. Owning annotations sort by `span.start`, token before entity at the same start, then the Entity order above; within one owner, `romanisation` precedes `englishForm`; within one channel, declared unit-array order (validated non-decreasing by span) → `u0, u1, …` |
| Ambiguous regions | ascending `span.start`, then descending `span.end` → `r0, r1, …`; exact duplicate spans are forbidden |

Span ties are resolved by the explicit secondary keys above; consumers may not infer semantics from the resulting ordinal.

**RULE-API-14.** The id string carries **no parseable semantics**. Its ordinal happens to follow document order as an artefact of the traversal; consumers must order by `span`, never by id, and must never derive a span, a type or a relationship from an id. The only supported operations are equality and reference resolution within the same Analysis.

**Consequence for repeated text.** Two identical sentences at different offsets may share one cached linguistic fragment, and must still receive distinct global spans and distinct ids. This is only possible because ids and offsets live outside the cached fragment (§10.4).

---

## 5.3 Version record

```ts
interface Versions {
  schemaVersion: string;      // "1.0" — document shape
  contractVersion: string;    // current producer emits "5.0.16" (through CHG-050)
  providerSnapshotId: string | null;   // CHG-037 A — id of the PINNED snapshot, or null =
                                       // no pinned provider snapshot was used. One meaning each.
  engineVersion: string;      // semver of @hklang/engine
  lexiconVersion: string;     // packaged linguistic data
  rulesVersion: string;       // romanisation convention tables + generator rules
  segmenterVersion: string;   // identifies the segmenter implementation AND its model/lexicon
  userDataVersion: number;    // exact integer 0..9007199254740991; starts at 0; one global increment per committed mutation
}
```

**CHG-047 exact-integer closure (normative).** `userDataVersion` remains the public `number` type, with mathematical domain `0 ≤ n ≤ 9007199254740991` inclusive (`2^53−1`). Values must satisfy exact-integer semantics at runtime (`Number.isSafeInteger` for JavaScript boundaries), and JSON Schema uses `type: "integer"`, `minimum: 0`, `maximum: 9007199254740991`. The Store-set starts at `0`; the global counter increments exactly once for each successfully committed mutating operation that changes persistent state, including one increment for a multi-row import, and never for reads, previews, no-ops, failures or rollbacks. At the maximum, a would-be mutation fails atomically before any state, revision, timestamp or version change. No wrap, saturation, imprecise value, silent same-version write or rollover is legal. `CHG-046-RES-001` is closed.

`segmenterVersion` is new to §5 and required by RULE-JP-5a: because DEC-…-017 is unresolved and the segmenter is replaceable, the segmenter's identity must be a first-class cache-key and reproducibility input rather than being folded into `engineVersion`.

**Grouping closure (CHG-048/050, normative).** Every instance of `AssembledRomanisation` and `AssembledEnglishForm`, and every `assembled:true` branch of `MemoryRomanisation` and `MemoryEnglishForm`, has a non-empty `units` array and a non-empty `grouping`; every inner group is non-empty. The `assembled:false` memory branches remain verbatim and carry exact `text` instead. Every grouping member is an exact mathematical non-negative safe integer strictly less than the owning `units.length`, and `flatten(grouping)` MUST equal exactly `[0, 1, ..., units.length - 1]`. Consequently every unit occurs exactly once: omissions, duplicates, overlaps and reordering are invalid. `MemoryEnglishForm.styleApplicable.unitIndices` uses the same local-index scalar domain and the additional ordering rule stated in §5.7. JSON Schema expresses non-empty arrays and the scalar integer lower bound; executable cross-field validation enforces the upper bound, exact flattened sequence, and style-reference integrity. No validator may repair, sort, deduplicate, fill or otherwise default malformed input.

---

## 5.4 The Analysis document

The single output of `processText`. **Style-neutral** (CHG-026).

```ts
interface Analysis {
  schemaVersion: string;
  offsetUnit: "utf16";
  source: string;                  // verbatim; INV-1
  sourceHash: string;              // stable hash, for cache and directive binding
  versions: Versions;
  optionsHash: string;             // hash of the normalised options actually used
  documentContextUsed: boolean;    // CHG-029

  tokens: Token[];                 // strict partition of source (INV-2)
  entities: Entity[];              // overlay; nested allowed, no partial overlap (INV-16)
  regions: AmbiguousRegion[];      // boundary-ambiguous regions (RULE-ENT-6)
  termResolutions: TermResolution[]; // core L4 selected/conflict states (CHG-044 H)

  diagnostics: Diagnostic[];        // analysis/content diagnostics from this processText call only
  debug?: DebugPayload;            // present only when requested (§5.16)
  ext?: { [key: string]: JsonValue }; // serialisable extension namespace (§5.17)
}

interface AmbiguousRegion {
  id: string;
  span: [number, number];
  kind: "entity_boundary";
  alternatives: EntityBoundaryCandidate[]; // at least two; source-bound
  ranked: boolean;                         // false for comparable candidates
}

interface EntityBoundaryCandidate {
  span: [number, number];
  text: string;                            // exact source slice
  type: EntityType;
  detectionEvidence: DetectionEvidence[];
  confidence: Confidence;
}
```

**Four independent channels, separately addressable.** L2 lives on tokens (`reading`); L3R lives on both tokens and entities (`romanisation`); L3E lives on entities only (`englishForm`); L4 core truth lives in `termResolutions`. `projectTranslationDirectives` emits a concrete `TermDirective` only from a selected L4 value. Discarding any one channel leaves the others valid (INV-A).

**RULE-API-23 (RECOMMENDED, CHG-044 H).** `Analysis` never fabricates a preferred L4 string to make a conflict fit. Equal-authority applicable lexical/phrase entries remain one `TermResolution` whose `result` is `status:"conflict"`, `value:null`, `ranked:false`, with both entry-bearing candidates. A projection omits that resolution from `TranslationDirectives.termDirectives` until the store conflict is resolved.

---

## 5.5 The value envelope

Every annotated value in the contract uses one shape. This is what makes provenance non-optional (INV-6) and uncertainty representable (§1.5 principle 4).

```ts
interface Value<T> {
  value: T | null;
  status: Status;
  provenance: Provenance;
  confidence: Confidence;
  evidenceClass: EvidenceClass | null;   // E1a|E1b|E1c|E2|E3|E4|E5|E6|E7
  externalAttestation: ExternalAttestation;   // tri-state — CHG-032 item 6
  attestation?: Attestation | null;
  scopeDowngrade?: "class_applied_to_individual";
  alternatives: Candidate<T>[];
  ranked: boolean;                       // are alternatives ordered by a prior?
  cautions: CautionCode[];
  reason?: ReasonCode;                   // why unresolved/unsupported
  derivedFrom?: DerivedFrom;             // cross-layer consumption (§5.7.3)
  inheritedFrom?: InheritanceRef;        // per selected channel; CHG-044 K
}

type ExternalAttestation =
  | "attested"        // someone outside the user's own material demonstrably uses this
  | "not_attested"    // the question is meaningful here, and the answer is no
  | "not_applicable"; // the question is meaningless for this layer — e.g. an L2 reading

interface Attestation {
  scope: "individual"|"institution"|"place_instance"|"class";
  sourceRef: string; asOf: string;
}

// CHG-032 item 4: when status is ambiguous or conflict, `value` is null, so the
// candidates are where ALL the evidence lives. The Lab must be able to answer
// "why is candidate A here, and why is candidate B here?" from this object alone.
interface CandidateBase<T> {
  value: T;
  rank?: number;                         // present iff the parent has ranked === true
  evidenceClass: EvidenceClass | null;
  externalAttestation: ExternalAttestation;
  attestation?: Attestation | null;
  scopeDowngrade?: "class_applied_to_individual";
  support?: Confidence;                  // candidate-level support; NOT the parent's confidence
  attestationCount?: number;             // where counts exist (§2.7 induction)
  cautions: CautionCode[];
  variation?: VariationKind;             // L2 only: lexical|register|sociophonetic|sandhi|uncertain
  note?: string;
}

type Candidate<T> = InheritedCandidate<T> | NonInheritedCandidate<T>;

interface InheritedCandidate<T> extends CandidateBase<T> {
  provenance: "inherited";
  inheritedFrom: InheritanceRef;
}

interface NonInheritedCandidate<T> extends CandidateBase<T> {
  provenance: Exclude<Provenance, "inherited">;
  inheritedFrom?: never;
}
```

**Why candidates carry evidence (CHG-032 item 4).** For `ambiguous` and `conflict` the top-level `value` is null and the top-level `provenance`/`evidenceClass` describe the *resolution attempt*, not any particular candidate. Without per-candidate evidence, a Lab showing "Choi / Choy" could not say that both are E6 class-level with attestation counts 412 and 388, nor that one enabled glossary entry is E1a and the other E1c. Recomputing that in the UI would violate §1.5 principle 7 (the debug panel renders the same object the API returns).

**RULE-API-24 (RECOMMENDED, CHG-044 K) — inheritance is per selected annotation.** If a `Value<T>` has a non-null selected `value` and `provenance:"inherited"`, it MUST carry `inheritedFrom`; a non-null selected value with any other provenance MUST NOT carry it. An inherited `Candidate<T>` carries its own `inheritedFrom`, while every non-inherited candidate structurally forbids the field. Null-value envelopes do not claim a selected inherited value. Consequently one Entity may inherit reading from one antecedent, romanisation from another, and resolve `englishForm` locally; no Entity-wide inheritance slot exists.

### 5.5.1 Exact semantics per status — normative

| `status` | `value` | `alternatives` | `ranked` | `reason` | Meaning |
|---|---|---|---|---|---|
| `resolved` | **non-null** | may be non-empty (rejected candidates retained) | either | absent | One value, adequate evidence |
| `fallback` | **non-null** | may be non-empty | either | absent | **The value itself was produced by a lower-certainty fallback or generative mechanism *within its own layer*, because stronger resolution was unavailable** — e.g. a rule-generated romanisation, a decomposed place name. See RULE-API-3a |
| `ambiguous` | **null** | **≥ 2, required** | **`true`** | absent | Several candidates; a prior may **order** them but must not resolve (CHG-008). A consumer that must show one shows `alternatives[0]` **and is responsible for marking it as unresolved** |
| `conflict` | **null** | **≥ 2, required** | **`false`** | absent | Sources of *equal authority* disagree; no ordering is justified. Requires user action |
| `unresolved` | **null** | may be empty | `false` | **required** | A value exists in the world; the engine does not have it |
| `unsupported` | **null** | empty | `false` | **required** | Outside the engine's competence (unassigned code point, corrupt input) |
| `out_of_scope` | **null** | empty | `false` | absent | The layer does not apply to this span. Note: **L3R is not out of scope for common nouns** (DEC-…-009) |

**RULE-API-3a (RECOMMENDED, CHG-032 item 5) — `fallback` is about the value, not the route.** The v0.1 definition ("a value was produced by a fallback route") contradicted RULE-ENT-10. A `resolved` L3R value consumed by Chain B travels through the cross-layer fallback route while remaining `resolved`.

| Fact | Field |
|---|---|
| How solid is this value, in its own layer? | **`status`** |
| Did it reach this layer by a cross-layer fallback route? | **`derivedFrom.fallbackReason`** |

These are independent. A user-glossary romanisation reaching `englishForm` via §4.9 is `status: "resolved"` **and** has `derivedFrom.fallbackReason: "no_known_english_form"`. A rule-generated romanisation is `status: "fallback"` whether or not it was ever consumed cross-layer. §6 asserts both directions (T-API-014/015).

**RULE-API-3 (RECOMMENDED).** `ambiguous` never carries a `value`. This is the schema-level enforcement of "a prior may rank but may not convert ambiguity into factual resolution". A consumer is free to display the top-ranked candidate; it cannot receive one *labelled* as resolved. §6 asserts this (T-API-002).

**RULE-API-4.** `confidence` is derived from `(provenance, status, layer)` (RULE-CONF-1); it is never independently assigned by a code path. No numeric probability appears anywhere (RULE-CONF-2).

### 5.5.2 Closed vocabularies

```ts
type Status      = "resolved"|"fallback"|"ambiguous"|"conflict"|"unresolved"|"unsupported"|"out_of_scope";
type Provenance  = "user_glossary"|"entity_record"|"convention_table"|"lexicon"
                 | "rule_engine"|"external"|"inherited"|"none";
type Confidence  = "high"|"medium"|"low"|"none";
type EvidenceClass = "E1a"|"E1b"|"E1c"|"E2"|"E3"|"E4"|"E5"|"E6"|"E7";
type StoreEvidenceClass = "E1a"|"E1b"|"E1c"|"E2";                                  // CHG-044 C1
type FormKind    = "romanisation"|"official_name"|"native_original"|"translation"|"hybrid";  // CHG-027
type VariationKind = "lexical"|"register"|"sociophonetic"|"sandhi"|"uncertain";

type ReasonCode =
  | "reading_not_found"
  | "number_reading_requires_context"
  | "lexicon_unavailable"
  | "unsupported_code_point"
  | "malformed_input"
  | "no_known_english_form";

type CautionCode =
  | "stale_source"
  | "overrides_official"
  | "decomposed_not_attested"
  | "source_unavailable"
  | "non_hk_convention_suspected"
  | "cjk_non_chinese_suspected"
  | "foreign_origin_suspected"
  | "sibilant_class_unknown"
  | "multiple_conventions"
  | "spelling_collision"
  | "bearer_spelling_unknown"
  | "non_chinese_script"
  | "window_ceiling_reached"
  | "official_name_expected";
```

`ExternalAttestation` is declared once in §5.5 and referenced here; the duplicate alias formerly present in this block is withdrawn by CHG-044 M.

**Initial producer vocabulary (CHG-044 D).** The unions above are closed for v1 producers and were derived from the packet's live normative producers, not from speculative future cases. `reading_not_found` covers Chain A/C and the L2 no-reading branch; `number_reading_requires_context` is RULE-JP-11; `lexicon_unavailable` is §3.8's failed-lexicon branch; `unsupported_code_point` and `malformed_input` are §3.8's two `unsupported` branches; and `no_known_english_form` is Chain B's unresolved L3E branch. The caution members are the exact live codes in RULE-HKR-3/6/9, §2.5.3, §2.9, §3.3/3.8 and §4.2. Consumers remain tolerant of later unknown strings under RULE-API-9, but a `5.0.16` producer emits only these members.

`FormKind` answers *what kind of form*; authority is carried entirely by `provenance` / `evidenceClass` / `externalAttestation` / `status`. "Conventional" is **derived, never stored** (§4.16): `formKind === "romanisation" && !assembled && externalAttestation === "attested" && evidenceClass ∈ {E3,E4,E5,E6}`.

**Layer applicability of `externalAttestation` (CHG-032 item 6).** The v0.1 boolean forced every value to answer a question that is meaningless for most of them — an L2 Cantonese reading is not "externally attested" or "not externally attested"; the concept does not apply. Forcing `false` would have made "not attested" and "not applicable" indistinguishable, and would have polluted every metric that counts unattested values.

| Layer | Applicability |
|---|---|
| L2 reading | **`not_applicable`** always, including E1c/E2 user-store evidence |
| L3R romanisation | meaningful — user Store E1a/E1b ⇒ `not_attested`; E1c/E2 ⇒ `attested`; packaged/reference E3–E6 and generated E7 follow their own live evidence rules |
| L3E English form | meaningful — entity-store E1a/E1b ⇒ `not_attested`; E1c/E2 ⇒ `attested`; packaged/reference evidence follows its live rule |
| L4 term resolution/directive | **`not_applicable`** for every lexical/phrase user-store entry, including E1c/E2 |

The layer/scope row is evaluated **before** the user evidence class when validating `externalAttestation`. Documentary `attestation` is a separate axis: E2 still requires an `Attestation` in L2 and L4 even though `externalAttestation` is `not_applicable`; E1c may carry one; E1a/E1b carry none. Provenance completeness (INV-6) is unaffected: `provenance`, `status` and `confidence` remain mandatory on every value.

---

## 5.6 Tokens, readings and romanisation units

```ts
interface Token {
  id: string;
  span: [number, number];
  text: string;                        // verbatim slice
  type: TokenType;                     // §3.3
  segment?: { matched: string; source: "lexicon"|"user_glossary"|"character"|"forced" };
  reading: Value<Reading>;             // L2
  romanisation: Value<Romanisation>;   // L3R — available on ANY Cantonese-readable token
  keyTransform?: { from: string; to: string; kind: "variant_fold"|"simplified_fold"|"nfc" };
}

interface Reading {
  jyutping: string;                    // canonical serialisation
  syllables: Syllable[];
  alignmentGroups: GroupedAlignment[]; // [] when no grouped alignment exists
}
interface Syllable {
  span: [number, number] | null;       // null only when align === "grouped"
  jyutping: string;
  initial: string;                     // "" for zero-initial
  final: string;
  tone: 1|2|3|4|5|6;
  syllabic: boolean;
  align: "exact"|"spread"|"grouped";   // "unaligned" is forbidden (RULE-JP-3)
}

interface GroupedAlignment {
  span: [number, number];              // one shared source span
  syllableIndices: [number, number, ...number[]]; // local indices; at least two
}

// CHG-032 item 1: discriminated union. v0.1 required BOTH a canonical `text` and a
// `units` array on every form, which is unsatisfiable: an assembled name has no
// canonical text until a style is applied, and a verbatim form such as "Kowloon" or
// "Fanling" has no meaningful syllable-by-syllable decomposition.
type Romanisation = VerbatimRomanisation | AssembledRomanisation;

interface VerbatimRomanisation {
  formKind: "romanisation";
  assembled: false;
  text: string;                        // exact supplied/attested spelling — casing and
                                       // punctuation preserved; part of the attested fact
  units?: never;
  grouping?: never;
}

interface AssembledRomanisation {
  formKind: "romanisation";
  assembled: true;
  units: NonEmptyArray<RomanisationUnit>; // caseless; declared order is rendering order
  grouping: NonEmptyArray<NonEmptyArray<number>>; // exact ordered partition of LOCAL unit indices
  text?: never;                        // there is no canonical rendering until
                                       // @hklang/style is given a profile. See RULE-API-10.
}

interface RomanisationUnit {
  id: string;                          // opaque. DETERMINISTIC for an identical full input
                                       // tuple; NON-PERSISTENT across any change (RULE-API-13)
  span: [number, number];
  text: string;                        // CASELESS
  syllable: string;
  role?: "surname"|"given"|"prefix"|"specific"|"generic";
  provenance: Provenance;
  evidenceClass: EvidenceClass;
  externalAttestation: ExternalAttestation;
  scopeDowngrade?: "class_applied_to_individual";
  sibilantClass?: string;
}
```

**Grouped-alignment closure (CHG-044 J).** `alignmentGroups` is ordered by ascending `span.start`; group spans are contained in the owning annotation span (`Token.span` or `Entity.span`), ordered and non-overlapping. Indices in each group are strictly increasing, unique and in range. Every syllable with `align:"grouped"` has `span:null` and occurs in exactly one group; a syllable with `align:"exact"` or `"spread"` has a non-null individual span and occurs in no group. Multiple independent groups are legal in one Reading. These are local syllable indices, not ids, and no new durable identity is introduced. `MemoryReading` remains phonology-only and carries neither individual alignment nor groups.

**Grouping executable closure (CHG-050, normative).** On each of the four grouping-bearing surfaces — `AssembledRomanisation`, `AssembledEnglishForm`, and the `assembled:true` branches of `MemoryRomanisation` and `MemoryEnglishForm` — `units`, `grouping` and every inner group are non-empty, and `flatten(grouping)` equals exactly `[0, 1, ..., units.length - 1]`. This single equality makes grouping a complete ordered partition: every unit occurs exactly once, in units-array order; omissions, duplicates, overlaps and reordering are invalid. The discriminated `assembled:false` memory branches remain verbatim and carry exact `text` with no units or grouping. Each inner group denotes one orthographic word. Rendering concatenates the referenced unit texts inside a group with no separator, then joins consecutive groups using exactly U+0020 SPACE. It performs no normalisation. JSON Schema MUST materialise the three non-empty array constraints and the integer lower bound on all four grouping-bearing branches; executable runtime validation MUST additionally enforce the owning-array upper bound and exact flattened sequence before rendering, memory admission or canonical encoding. Invalid input is rejected, never repaired, sorted, deduplicated or defaulted.

**RULE-API-10 (RECOMMENDED, CHG-032 items 1–2; amended CHG-044 B).** An assembled form carries **no** canonical `text` and **no** `styleVariants`. Rendering is `@hklang/style`'s sole responsibility. Assembled L3R contains only `RomanisationUnit`; assembled L3E uses the discriminated `EnglishAssemblyUnit` union, so literal and translated components never acquire Cantonese syllable semantics. A verbatim form carries exact `text` and no units — its casing, hyphens and spacing *are* the fact, and no profile may alter them.

This makes RC-4 unrepresentable-to-violate rather than merely forbidden: there is no field on a verbatim form for a style profile to write into, and no `text` on an assembled form for a consumer to grab without choosing a profile.

**Why `styleVariants` was removed from core (CHG-032 item 2).** v0.1 precomputed `[{hyphenated}, {joined}]` inside `Analysis`. That put rendering logic in two places — the engine and `@hklang/style` — guaranteeing eventual divergence, and it embedded presentation output in a document declared style-neutral. The Lab still shows variants side by side; it obtains them by calling the style module twice, which is what `RULE-API-7` requires anyway.

---

## 5.7 Entities and English forms

```ts
interface Entity {
  id: string;
  span: [number, number];
  text: string;
  type: EntityType;                    // §4.2, dotted; consumers may prefix-match
  primary: boolean;                    // exactly one primary per position (INV-16)
  containedBy?: string;                // parent entity id when nested
  englishFallbackPolicy: "romanisation_allowed"|"prefer_original_recovery"|"no_automatic_romanisation";

  structure?: PersonNameStructure;     // person entities only
  detectionEvidence: DetectionEvidence[];
  detectionConfidence: Confidence;

  reading: Value<Reading>;             // L2, entity-conditioned (RULE-ENT-2)
  romanisation: Value<Romanisation>;   // L3R  ← DEC-…-001 container, part 1
  englishForm: Value<EnglishForm>;     // L3E  ← DEC-…-001 container, part 2
}

// Verbatim vs assembled remains discriminated on `assembled`. CHG-044 B closes
// the assembled branch without weakening the verbatim RC-4 boundary.
type EnglishForm = VerbatimEnglishForm | AssembledEnglishForm;

interface VerbatimEnglishForm {
  formKind: FormKind;                  // any of the five
  assembled: false;
  text: string;                        // exact; style can never alter it (RULE-API-6)
  person?: never;
  units?: never;
  grouping?: never;
  styleApplicable?: never;
}

type AssembledEnglishForm =
  | StyledPersonEnglishForm
  | UnstyledPersonEnglishForm
  | NonPersonEnglishForm;

interface AssembledEnglishFormBase {
  formKind: "romanisation" | "hybrid"; // the complete legal v1 assembled set
  assembled: true;
  units: NonEmptyArray<EnglishAssemblyUnit>;
  grouping: NonEmptyArray<NonEmptyArray<number>>; // exact ordered partition of local indices
  text?: never;
  // deliberately NO `styleVariants`
}

interface StyledPersonEnglishForm extends AssembledEnglishFormBase {
  person: true;
  styleApplicable: { scope: "givenName"; unitIds: NonEmptyArray<string> };
}

interface UnstyledPersonEnglishForm extends AssembledEnglishFormBase {
  person: true;
  styleApplicable?: never;
}

interface NonPersonEnglishForm extends AssembledEnglishFormBase {
  person: false;
  styleApplicable?: never;
}

type EnglishAssemblyUnit =
  | RomanisedEnglishUnit
  | LiteralEnglishUnit
  | TranslatedEnglishUnit;

type EnglishAssemblyRole =
  | "surname" | "given" | "western_given" | "prefix" | "specific" | "generic";
type CantoneseEnglishAssemblyRole = Exclude<EnglishAssemblyRole, "western_given">;

interface EnglishAssemblyUnitBase {
  id: string;                          // Analysis-local, deterministic (RULE-API-13)
  span: [number, number];              // source component represented by this unit
  text: string;
  role?: EnglishAssemblyRole;
  provenance: Provenance;
  evidenceClass: EvidenceClass | null;
  externalAttestation: ExternalAttestation;
  scopeDowngrade?: "class_applied_to_individual";
}

interface RomanisedEnglishUnit extends EnglishAssemblyUnitBase {
  kind: "romanised";
  role?: CantoneseEnglishAssemblyRole;
  text: string;                        // caseless generated/conventional romanised unit
  syllable: string;                    // only this branch carries Cantonese syllable semantics
  generated: boolean;                 // true only when this unit was generated by the engine
  sibilantClass?: string;
}

interface LiteralEnglishUnit extends EnglishAssemblyUnitBase {
  kind: "literal";
  text: string;                        // exact already-English source component
  syllable?: never;
  generated?: never;
  sibilantClass?: never;
}

interface TranslatedEnglishUnit extends EnglishAssemblyUnitBase {
  kind: "translated";
  role?: CantoneseEnglishAssemblyRole;
  text: string;                        // exact translated/generic component, e.g. "Road"
  syllable?: never;
  generated?: never;
  sibilantClass?: never;
}

interface DetectionEvidence {
  mechanism: "D1"|"D2"|"D3"|"D4"|"D5"|"D6"|"D7";
  span?: [number, number];             // e.g. the title 先生, which is OUTSIDE the entity span
  detail?: string;
}
```

**Assembled L3E legality (CHG-044 B; amended CHG-050).** A v1 assembled English form has at least one unit and has `formKind:"romanisation"` **iff every unit is `kind:"romanised"`**. It has `formKind:"hybrid"` **iff it contains at least one romanised unit and at least one literal or translated unit**. An assembled form made only of literal/translated units is forbidden: `official_name`, `native_original` and pure `translation` remain legal **verbatim** `FormKind` values and are not invented as assembled branches. A `role:"western_given"` unit is necessarily literal and therefore never has Cantonese-syllable semantics. Non-person assembly is legal and carries `person:false` with no `styleApplicable`. A person assembly may omit `styleApplicable`; if present, it contains at least one reference, every referenced id resolves to exactly one `kind:"romanised"`, `role:"given"`, `generated:true` unit, and references are unique and strictly increasing by resolved unit position. Non-contiguous references are legal and form separate maximal adjacent licensed runs; an unlicensed unit always breaks a run. These cross-object rules, and the complete ordered grouping rule in §5.6, are enforced by generated schema where structurally expressible and by executable validation for cross-field relations.

### 5.7.1 DEC-LANG-20260828-001 — SETTLED

**Decision: named sibling fields, `romanisation` and `englishForm`, on both the entity and (for `romanisation`) the token.**

Rejected alternatives and why:

| Option | Rejected because |
|---|---|
| Single `hkRomanisation` string | The finding that produced DEC-001 — 彌敦道 is *Nathan Road*, 佐敦 is *Jordan* — is unrepresentable |
| Single `englishForm` absorbing romanisation | Withdrawn by CHG-002; loses the "what would it be romanised as" channel that general L3R (DEC-…-009) requires, and that the Lab's comparison view is built on |
| `forms: Form[]` keyed by kind | Permits duplicates and contradictory entries for one channel; forces every consumer to write a lookup; makes "separately addressable" a convention rather than a type |
| **Named siblings** ✔ | The channel set is small, fixed and known. Named fields make separate addressability literal and type-checked. `entity.romanisation` and `entity.englishForm` cannot collide, cannot duplicate, and cannot be confused by a consumer |

**Consequence.** For the 彌敦道 fixture, `entity.romanisation.value` and `entity.englishForm.value` are independently populated, non-null selected values. The L3R value is interpreted through its `assembled` discriminant: a verbatim Romanisation preserves its exact `text`; an assembled Romanisation has no canonical `text` and its display is obtained through the pure `renderRomanisation` projection using an explicitly selected `CasingProfile`. The L3E value in this fixture is the verbatim English form *Nathan Road*; an assembled L3E would likewise be rendered through the style module rather than read through `.text`. The independently obtained L3R and L3E display strings differ. Neither channel overwrites, supplies or mutates the other. A consumer chooses which channel to display; the engine does not choose for it.

### 5.7.2 Person name structure

```ts
interface PersonNameStructure {
  surname?: { span: [number, number]; compound: boolean };
  givenName?: { span: [number, number] };
  prefix?: { span: [number, number] };          // 阿 — romanised as a unit (Ah)
  westernGiven?: { span: [number, number] };    // already English; never romanised
  maidenSurname?: { span: [number, number] };
  order: "surname_first"|"given_first";
  parseAlternatives?: PersonNameStructure[];    // populated when 2+2 / 1+3 ambiguous (RULE-ENT-7)
}
```

### 5.7.3 Cross-layer derivation

```ts
// CHG-044 E: the owner discriminant makes zero-owner and two-owner states impossible,
// and each branch admits only channels actually present on that owner.
type AnnotationRef = EntityAnnotationRef | TokenAnnotationRef;

interface EntityAnnotationRef {
  owner: "entity";
  entityId: string;
  tokenId?: never;
  channel: "reading" | "romanisation" | "englishForm";
}

interface TokenAnnotationRef {
  owner: "token";
  entityId?: never;
  tokenId: string;
  channel: "reading" | "romanisation";
}

type RomanisationRef = EntityRomanisationRef | TokenRomanisationRef;

interface EntityRomanisationRef {
  owner: "entity";
  entityId: string;
  tokenId?: never;
  channel: "romanisation";
}

interface TokenRomanisationRef {
  owner: "token";
  entityId?: never;
  tokenId: string;
  channel: "romanisation";
}

interface DerivedFrom {
  layer: "L3R";
  romanisationRef: RomanisationRef;    // exact one owner, romanisation only, no parsing
  fallbackReason: "no_known_english_form";
  directStoreRead: false;              // CHG-025 — Chain B did not itself read the HKR store
}
```

**The inheritance rule (RULE-ENT-10) in schema terms.** When Chain B falls back to L3R, the resulting `Value<EnglishForm>` copies `provenance`, `evidenceClass`, `status`, `externalAttestation`, `attestation` and `assembled` **from the L3R value**, and adds `derivedFrom`. It does **not** overwrite them with `rule_engine` / `E7` / `fallback`.

`status` records the value's own solidity; `derivedFrom.fallbackReason` records how it got here. A verbatim user-glossary romanisation reaching Chain B by this route is `status: "resolved"`, `provenance: "user_glossary"`, `assembled: false` — and therefore carries no `styleApplicable`, so the Hyphenated/Joined toggle cannot touch it (T-ENT-048).

### 5.7.4 `InheritanceRef` — typed, resolvable inheritance (CHG-039 A)

`inheritedFrom?: string // antecedent mention id` was sufficient for an antecedent **inside** one composed Analysis and insufficient for one supplied **from a previous call**, where a prior Analysis id must not become a durable cross-call identifier. CHG-044 K also removes the later Entity-wide slot: `InheritanceRef` is now carried independently by each selected `Value<T>` or inherited `Candidate<T>`.

```ts
type InheritanceRef =
  | { kind: "analysis";        entityId: string; contextId?: never; ref?: never }
                                                    // an antecedent mention in THIS Analysis
  | { kind: "documentContext"; contextId: string; ref: string; entityId?: never };
                                                    // an entry in the DocumentContext INPUT
```

**RULE-API-19 (RECOMMENDED) — every inheritance reference resolves.** An emitted `InheritanceRef` on a selected `Value<T>` or `Candidate<T>` must resolve against either (a) an entity present in the same `Analysis`, or (b) an `EntityMemoryEntry` in **the exact `DocumentContext` that was passed to this call** — matched by `contextId` **and** `ref`. No string parsing is involved and no path-like encoding is permitted. Different annotation channels may resolve to different antecedents. A reference that resolves to neither is a bug, asserted by T-ENT-053.

The `contextId` is carried so that a consumer holding several contexts cannot resolve a reference against the wrong one; it is not a claim that the context is durable.

---

## 5.8 Term directives (L4)

Lexical and phrase translation-glossary entries (CHG-024). These are **not** entity names and never appear in `entities`. CHG-044 H separates the core truth state from the selected projection so equal-authority conflicts remain representable.

```ts
interface TermResolution {
  span: [number, number];
  sourceText: string;
  entryScope: "lexical" | "phrase";
  result: Value<TermRendering>;
}

interface TermRendering {
  preferred: string;                   // exact stored value
  entryId: string;                     // source StoreEntry id
  entryScope: "lexical" | "phrase";
  note?: string;
}

interface TermDirective {
  span: [number, number];
  sourceText: string;
  preferred: string;                   // the user's stipulated English rendering
  entryScope: "lexical"|"phrase";
  entryId: string;
  evidenceClass: StoreEvidenceClass;
  note?: string;
}
```

`Analysis.termResolutions` is deterministically ordered by ascending `span.start`, then descending `span.end`, then `entryScope` (`lexical` before `phrase`). There is exactly one resolution per `(span, entryScope)`; competing StoreEntries are candidates inside that resolution, not duplicate array rows. This makes `ResolutionTraceTarget.kind:"termResolution"` indices stable after composition.

For an applicable selected entry, `TermResolution.result` is `resolved` and its non-null `TermRendering` identifies the entry. For two equal-authority applicable entries, the result is `conflict`, `value:null`, `ranked:false`; each `Candidate<TermRendering>` contains its own `entryId` in `value`, its Store evidence in the candidate envelope, and `externalAttestation:"not_applicable"`. No preferred text is fabricated. The engine does not translate, does not verify, and does not know what will consume the selected directive. `TranslationDirectives.termDirectives` contains only concrete `resolved` projections; an unresolved conflict yields no `TermDirective`.

---

## 5.9 Store contract

```ts
type StoreName = "pronunciation" | "translation" | "hk_romanisation";
type StoreEntryScope = "lexical" | "phrase" | "entity";
type StoreMatch = "exact" | "contextual";

interface StoreMatchContext {
  precededBy?: string[];
  followedBy?: string[];
  entityType?: EntityType;
  documentTag?: string;                         // exact membership in current ProcessOptions.documentTags
}

interface StoreEntryBase {
  id: string;
  key: string;
  value: string;
  caseSensitive: boolean;                      // persisted; creation default false (CHG-044 I)
  match: StoreMatch;
  context?: StoreMatchContext;
  note?: string;
  verifiedAt?: string | null;                  // property of the RECORD (DEC-…-008)
  createdAt: string; updatedAt: string; revision: number;
}

type StoreScopeFields =
  | { entryScope: "entity"; entityTypeHint?: EntityType }
  | { entryScope: "lexical" | "phrase"; entityTypeHint?: never };

type ApplicableStoreEvidence =
  | { evidenceClass: "E1a" | "E1b"; externalAttestation: "not_attested";
      attestation: null }
  | { evidenceClass: "E1c"; externalAttestation: "attested";
      attestation?: Attestation | null }
  | { evidenceClass: "E2"; externalAttestation: "attested";
      attestation: Attestation };

type InapplicableStoreEvidence =
  | { evidenceClass: "E1a" | "E1b"; externalAttestation: "not_applicable";
      attestation: null }
  | { evidenceClass: "E1c"; externalAttestation: "not_applicable";
      attestation?: Attestation | null }
  | { evidenceClass: "E2"; externalAttestation: "not_applicable";
      attestation: Attestation };

interface ValidStoreState {
  enabled: boolean;
  validation: { ok: true; errors: [] };
}

type ValidStoreEntry = StoreEntryBase & ValidStoreState & (
  | (StoreScopeFields & { store: "pronunciation"; formKind?: never }
     & InapplicableStoreEvidence)
  | (StoreScopeFields & { store: "hk_romanisation"; formKind?: never }
     & ApplicableStoreEvidence)
  | ({ store: "translation"; entryScope: "entity"; entityTypeHint?: EntityType;
       formKind: FormKind } & ApplicableStoreEvidence)
  | ({ store: "translation"; entryScope: "lexical" | "phrase";
       entityTypeHint?: never; formKind?: never } & InapplicableStoreEvidence)
);

// A draft with a legal user evidence class can still fail cross-field validation
// (for example E2 without Attestation). It is quarantined explicitly, never enabled.
interface InvalidStoreEntry extends StoreEntryBase {
  store: StoreName;
  entryScope: StoreEntryScope;
  entityTypeHint?: EntityType;
  formKind?: FormKind;
  enabled: false;
  evidenceClass: StoreEvidenceClass;
  externalAttestation: ExternalAttestation;
  attestation?: Attestation | null;
  validation: { ok: false; errors: [ValidationError, ...ValidationError[]] };
}

type StoreEntry = ValidStoreEntry | InvalidStoreEntry;

interface ValidationError {
  code: string;                               // stable machine code; consumers preserve unknown codes
  path: (string | number)[];                  // path inside the submitted draft/import row
  message: string;
}

interface StoreListQuery {
  enabled?: boolean;
  entryScope?: StoreEntryScope;
  evidenceClass?: StoreEvidenceClass;
}

interface StoreSearchOptions extends StoreListQuery {
  context?: StoreMatchContext;
}

interface StoreEntryDraft {
  key: string;
  value: string;
  entryScope?: StoreEntryScope;               // default "lexical"
  entityTypeHint?: EntityType;
  formKind?: FormKind;
  caseSensitive?: boolean;                    // default false
  match?: StoreMatch;                         // default "exact"
  context?: StoreMatchContext;
  enabled?: boolean;                          // default true unless validation fails
  evidenceClass?: StoreEvidenceClass;         // default "E1a"
  externalAttestation?: ExternalAttestation;  // validated/normalised by RULE-API-12
  attestation?: Attestation | null;
  note?: string;
  verifiedAt?: string | null;
}

type StoreEntryPatch = Partial<StoreEntryDraft>;

interface StoreCreateResult {
  entry: StoreEntry;
  conflicts: StoreEntry[];
}

interface StoreExport {
  schemaVersion: "1.0";
  store: StoreName;
  exportedAt: string;
  engineVersion: string;
  entries: StoreEntry[];
}

type StoreImportData = JsonValue;
type StoreImportMode = "preview" | "apply";
type StoreImportAction = "add" | "update" | "conflict" | "invalid";

interface StoreImportRow {
  index: number;
  action: StoreImportAction;
  input: JsonValue;                            // exact submitted row for audit
  entry?: StoreEntry;                         // absent when structurally invalid
  conflicts: StoreEntry[];
  errors: ValidationError[];
}

interface ImportPreview {
  mode: "preview";
  store: StoreName;
  writesApplied: false;
  rows: StoreImportRow[];
}

interface ImportResult {
  mode: "apply";
  store: StoreName;
  writesApplied: boolean;                       // true iff at least one row was written
  rows: StoreImportRow[];
  userDataVersion: number;                      // exact integer 0..9007199254740991 after this transaction
}

interface StoreApi {
  list(store: StoreName, query?: StoreListQuery): StoreEntry[];
  get(store: StoreName, id: string): StoreEntry | null;
  create(store: StoreName, draft: StoreEntryDraft): StoreCreateResult;
  update(store: StoreName, id: string, patch: StoreEntryPatch): StoreEntry;
  remove(store: StoreName, id: string): void;
  setEnabled(store: StoreName, id: string, enabled: boolean): StoreEntry;
  search(store: StoreName, text: string, opts?: StoreSearchOptions): StoreEntry[];
  exportJson(store: StoreName): StoreExport;    // canonical, full fidelity
  exportCsv(store: StoreName): string;          // lossy; header declares omitted fields
  importJson(store: StoreName, data: StoreImportData,
             mode: "preview"): ImportPreview;
  importJson(store: StoreName, data: StoreImportData,
             mode: "apply"): ImportResult;
  version(): number;                            // exact public userDataVersion domain; global across all stores
}
```

`StoreMatchContext.documentTag` is a current-call applicability condition. It reads only `ProcessOptions.documentTags`; it never reads or aliases `DocumentContext.id`, and no consumer metadata is inferred. A failed document-tag condition makes that contextual entry inapplicable; it does not change, rewrite or disable the stored entry.

### 5.9.1 Store validation — normative (added in `5.0.3`, CHG-035 A; corrected in `5.0.10`, CHG-044 A/C/I)

§9 exposed the gap: the Lab lets a user record an entry as **E2 "documented spelling"**, but the contract as then frozen had nowhere to put the document. Recording the class without the evidence is exactly the false-certainty pattern this packet exists to prevent — an entry claiming documentary backing with no retrievable reference to it.

**RULE-API-12 (RECOMMENDED).** The **StoreApi / storage layer owns this validation.** The Lab reflects it and never invents evidence semantics. Applicability is evaluated first; documentary evidence is evaluated independently.

| Store/layer/scope | E1a / E1b `externalAttestation` | E1c / E2 `externalAttestation` |
|---|---|---|
| pronunciation / L2, every scope | `"not_applicable"` | `"not_applicable"` |
| translation `lexical`/`phrase` / L4 | `"not_applicable"` | `"not_applicable"` |
| HK Romanisation / L3R, every scope | `"not_attested"` | `"attested"` |
| translation `entity` / L3E | `"not_attested"` | `"attested"` |

| `evidenceClass` | Independent documentary `attestation` rule |
|---|---|
| **E1a** user preference | exactly `null` |
| **E1b** creator-canonical | exactly `null` |
| **E1c** bearer assertion | permitted, not required |
| **E2** documentary evidence | **REQUIRED** — `scope`, `sourceRef` and `asOf` are preserved even in L2/L4 where external applicability is `not_applicable` |

`StoreEvidenceClass` is the complete v1 user-store domain. E3–E7 remain `EvidenceClass` values for packaged reference/rule data but have **no StoreEntry producer**. An import row carrying E3–E7 is `action:"invalid"` in preview, with no `StoreEntry`; apply does not write or enable it. No trusted E3–E7 Store ingest path exists in v1.

**RULE-API-25 (RECOMMENDED, CHG-044 A/I).** `formKind` is REQUIRED exactly when `store:"translation"` and `entryScope:"entity"`, accepts all five `FormKind` values, and is forbidden on every pronunciation, HK-Romanisation and lexical/phrase translation entry. Such an entity translation `value` is the exact stored string and resolves to `VerbatimEnglishForm` with `assembled:false`; StoreEntry never carries assembly units. `caseSensitive` is persisted on every entry: creation defaults to `false`; Latin-containing keys use case-insensitive matching when false and exact matching when true; keys with no case distinction are unaffected. Neither field is inferred from evidence class or key spelling.

An E2 draft without an Attestation, or any other draft whose legal-domain fields conflict, is stored as an `InvalidStoreEntry`: disabled, with at least one validation error, never downgraded and never silently accepted. A structurally invalid import that cannot inhabit even the quarantined StoreEntry domain remains an invalid preview row and is not applied.

**Store invariants restated as contract obligations.**

- `create` **never silently shadows**: it returns `conflicts` and the caller must resolve (§4.7.3).
- Invalid entries are **stored disabled** with `validation.errors`, never dropped, never auto-corrected.
- `importJson` in `preview` mode performs no writes.
- `importJson` in `apply` mode reports `writesApplied:true` iff at least one legal `add`/`update` row was written. An all-invalid import — including E3–E7-only input — returns `writesApplied:false`; invalid rows never count as writes.
- JSON export/import/update preserve `formKind` where applicable and preserve `caseSensitive` on every entry. CSV is explicitly lossy and its header names any omitted field.
- No numeric priority field exists (DEC-…-026).
- Writing to one store never writes to another (INV-12), and no store read crosses layers except through the explicit `derivedFrom` path.

---

## 5.10 Public API

```ts
type EngineCreationResult =
  | EngineCreationSuccess
  | EngineCreationFailure;

interface EngineCreationSuccess {
  ok: true;
  engine: Engine;
  diagnostics: Diagnostic[];
}

interface EngineCreationFailure {
  ok: false;
  engine: null;
  diagnostics: [Diagnostic, ...Diagnostic[]];
}

function createEngine(config: EngineConfig): EngineCreationResult;

interface Engine {
  processText(input: string, options?: ProcessOptions): Analysis;
  versions(): Versions;
  stores: StoreApi;
  validateJyutping(s: string): JyutpingValidationResult;
}

interface JyutpingValidationResult {
  ok: boolean;
  errors: string[];
}

interface DebugOptions {
  lattice?: boolean;
  trace?: boolean;
}

interface ProcessOptions {
  documentContext?: DocumentContext;   // OPTIONAL, v1 (CHG-029)
  documentTags?: string[];             // default []; opaque Store-matching labels (CHG-045 C)
  latinReadingPolicy?: "none"|"letter_names"|"loanword_lexicon";   // default "none"
  numberReadingPolicy?: "none"|"digits"|"cardinal";                // default "none"
  phoneticComponentHeuristic?: boolean;                            // default false
  debug?: DebugOptions;                                           // default off
  // NOTE (CHG-032 item 3): protectionConfidenceFloor is NOT here. Protection exists
  // only in the directive projection, so the floor lives in DirectiveSettings.
}

interface DocumentContext {
  contextFormatVersion: "1";           // scheme version; see §5.10.2.1's ordered preimage
  id: string;                          // consumer-supplied document identity
  entities: EntityMemoryEntry[];       // carried forward from earlier chunks
}
```

`EngineCreationResult` is an executable API boundary, not a serialisable wire-document root: its success branch carries a live `Engine`, while each contained `Diagnostic` retains the serialisable public shape of §5.14.

**Creation result — normative (CHG-045 B).**

| Configuration result | Required public state |
|---|---|
| Clean | `ok:true`; live `engine`; `diagnostics:[]` |
| Degraded but usable — for example `lexicon.coverage().frequencies === false` | `ok:true`; live `engine`; immediate creation diagnostics include `LEXICON_MISSING_CAPABILITY` with appropriate severity. No `processText` call is required to observe it |
| Fatal semantic invalidity for which this contract defines a creation diagnostic — including a supplied ProviderSnapshot with duplicate `inputHash`, an invalid `CanonicalValue`, or an identity that fails RULE-API-20 once that check is implemented | `ok:false`; `engine:null`; non-empty diagnostics include `PROVIDER_SNAPSHOT_INVALID`. The snapshot is not ignored and no Engine is created from it |

Creation diagnostics have no source document and therefore omit `span`. `LEXICON_MISSING_CAPABILITY` is a degraded-success diagnostic; `PROVIDER_SNAPSHOT_INVALID` is a fatal-failure diagnostic. A validly shaped configuration that fails a semantic check defined by this contract is represented by `EngineCreationFailure`, not an ordinary exception. Programmer-language/runtime failures for which the API cannot meaningfully be invoked — for example, a non-object supplied as `EngineConfig` in an untyped runtime, or a dependency throwing while the configuration itself cannot be inspected — remain outside this semantic result. No second startup API exists, and creation diagnostics are not copied into a later `Analysis.diagnostics`.

### 5.10.1 `documentContext` semantics (CHG-029) — normative

- **Omitted** ⇒ entity memory is intra-call only; nothing survives the call.
- **Supplied** ⇒ it is **input data**. It participates in `optionsHash` and therefore in the cache key (§5.15).
- Values inherited from it carry `provenance: "inherited"` and their own typed `inheritedFrom` (§5.7.4), and their confidence is **capped at the antecedent's** — which is computable precisely because `EntityMemoryEntry` carries the antecedent's per-channel `confidence` (§5.10.2, RULE-ENT-8/9). Different channels may inherit from different context entries; local channels remain local.
- **No engine state survives implicitly between calls, ever.** The engine holds no mutable analysis state. This is what lets a consumer process one document in paragraph chunks without breaking INV-7.

**`documentTags` is a separate current-call input.** It supplies opaque labels only to Store contextual matching. Exact duplicates are ignored and order is non-semantic. Omission and an empty array mean that no document-tag condition can match. `DocumentContext.id` remains an opaque continuity/context identity; it is neither a tag nor a source of tags. Neither input is derived from the other.

### 5.10.2 `EntityMemoryEntry` — the cross-call wire contract (CHG-039 A)

`EntityMemoryEntry` was referenced by public v1 API and never defined. That became blocking once §11 established that a host carrying continuity across chunks must carry entity **content**, never a prior Analysis's entity id (RULE-API-13: ids are deterministic but non-persistent).

**Design constraint: the smallest sufficient thing.** This is an explicit cross-call *input*, not a persistent entity database. It carries what document-local memory actually needs — enough to raise detection recall and to keep inherited confidence correctly capped — and nothing more.

**RULE-API-21 (RECOMMENDED, CHG-040 A) — the closure invariant.** The **transitive type graph reachable from `DocumentContext`** contains **no source span**, **no Analysis-local id** (entity, token, unit, region), and **no reference resolvable only against a previous Analysis**. This is a property of the *types*, not of a comment: the memory channel uses dedicated span-free types rather than reusing `Reading`, `Romanisation`, `EnglishForm` or `PersonNameStructure`, all of which carry spans or ids.

```ts
interface EntityMemoryEntry {
  ref: string;                         // CONTEXT-LOCAL identity, unique within THIS
                                       // DocumentContext only (RULE-API-18).
  text: string;                        // the entity's source characters — the semantic anchor
  aliases?: string[];                  // explicitly enumerated, structurally justified (§5.10.2.2)
  type: EntityType;
  name?: MemoryPersonName;             // person entities only

  reading?:      MemoryChannel<MemoryReading>;
  romanisation?: MemoryChannel<MemoryRomanisation>;
  englishForm?:  MemoryChannel<MemoryEnglishForm>;
}

// A channel is PRESENT only when a value was actually selected. Its legal statuses are
// therefore exactly those §5.5.1 permits with a non-null value (CHG-040 A).
interface MemoryChannel<T> {
  value: T;                                     // never null — absence is the absent field
  status: "resolved" | "fallback";              // NOT the full Status union
  provenance: Provenance;
  confidence: Confidence;
  evidenceClass: EvidenceClass | null;
  externalAttestation: ExternalAttestation;
  attestation?: Attestation | null;             // required where the source value had one
  scopeDowngrade?: "class_applied_to_individual";
  cautions: CautionCode[];
}

interface MemoryPersonName {                    // no spans — component TEXT instead
  surnameText?: string;
  givenNameText?: string;
  prefixText?: string;                          // 阿
  westernGivenText?: string;
  maidenSurnameText?: string;
  compoundSurname: boolean;
  order: "surname_first" | "given_first";
}

interface MemoryReading {                       // phonology only; no source alignment
  jyutping: string;
  syllables: ReadonlyArray<{
    jyutping: string; initial: string; final: string;
    tone: 1|2|3|4|5|6; syllabic: boolean;       // no `span`, no `align`
  }>;
}

type MemoryRomanisation =
  | { formKind: "romanisation"; assembled: false; text: string;
      units?: never; grouping?: never }
  | { formKind: "romanisation"; assembled: true; units: NonEmptyReadonlyArray<MemoryUnit>;
      grouping: NonEmptyReadonlyArray<NonEmptyReadonlyArray<number>>; text?: never };
                                                    // indices into `units`, not ids

type MemoryEnglishForm =
  | { formKind: FormKind; assembled: false; text: string; person?: never;
      units?: never; grouping?: never; styleApplicable?: never }
  | MemoryStyledPersonEnglishForm
  | MemoryUnstyledPersonEnglishForm
  | MemoryNonPersonEnglishForm;

interface MemoryAssembledEnglishFormBase {
  formKind: "romanisation" | "hybrid";
  assembled: true;
  units: NonEmptyReadonlyArray<MemoryEnglishAssemblyUnit>;
  grouping: NonEmptyReadonlyArray<NonEmptyReadonlyArray<number>>; // exact ordered partition
  text?: never;
}

interface MemoryStyledPersonEnglishForm extends MemoryAssembledEnglishFormBase {
  person: true;
  styleApplicable: { scope: "givenName"; unitIndices: NonEmptyReadonlyArray<number> }; // unique, increasing local indices
}                                               // local indices only; never Analysis unit ids

interface MemoryUnstyledPersonEnglishForm extends MemoryAssembledEnglishFormBase {
  person: true;
  styleApplicable?: never;
}

interface MemoryNonPersonEnglishForm extends MemoryAssembledEnglishFormBase {
  person: false;
  styleApplicable?: never;
}

interface MemoryUnit {                          // no `id`, no `span`
  text: string; syllable: string;
  role?: "surname"|"given"|"prefix"|"specific"|"generic";
  provenance: Provenance; evidenceClass: EvidenceClass;
  externalAttestation: ExternalAttestation;
  scopeDowngrade?: "class_applied_to_individual";
}

type MemoryEnglishAssemblyUnit =
  | MemoryRomanisedEnglishUnit
  | MemoryLiteralEnglishUnit
  | MemoryTranslatedEnglishUnit;

interface MemoryEnglishAssemblyUnitBase {       // no `id`, no `span`
  text: string;
  role?: EnglishAssemblyRole;
  provenance: Provenance;
  evidenceClass: EvidenceClass | null;
  externalAttestation: ExternalAttestation;
  scopeDowngrade?: "class_applied_to_individual";
}

interface MemoryRomanisedEnglishUnit extends MemoryEnglishAssemblyUnitBase {
  kind: "romanised";
  role?: CantoneseEnglishAssemblyRole;
  syllable: string;
  generated: boolean;
  sibilantClass?: string;
}

interface MemoryLiteralEnglishUnit extends MemoryEnglishAssemblyUnitBase {
  kind: "literal";
  syllable?: never;
  generated?: never;
  sibilantClass?: never;
}

interface MemoryTranslatedEnglishUnit extends MemoryEnglishAssemblyUnitBase {
  kind: "translated";
  role?: CantoneseEnglishAssemblyRole;
  syllable?: never;
  generated?: never;
  sibilantClass?: never;
}
```

**What changed and why each change was required:**

| Was | Now | Because |
|---|---|---|
| `structure?: PersonNameStructure` | `name?: MemoryPersonName` with component **text** | `PersonNameStructure` is spans all the way down; a comment saying "spans omitted" did not remove them from the type |
| `value: Reading` | `MemoryReading` | `Syllable` carries `span` and `align`; both are meaningless — and silently wrong — in another call |
| `value: Romanisation` | `MemoryRomanisation` | `RomanisationUnit` carries `id` **and** `span` |
| `value: EnglishForm` | `MemoryEnglishForm` with memory-only romanised/literal/translated unit branches | source spans and `styleApplicable.unitIds` pointed at a prior Analysis; the old branch also repeated the person-only/romanisation-only assembly defect |
| `status: Status` | `"resolved" \| "fallback"` | The full union permitted `ambiguous` with a non-null `value`, contradicting §5.5.1 and inventing a second status system |
| `attestation` / `scopeDowngrade` / `cautions` absent | **carried** | Otherwise a later call would have to consult the prior Analysis to recover them, which is exactly the dependency this type exists to remove. `scopeDowngrade` in particular is what keeps a class-level surname from silently becoming individual evidence |
| `recordRef?: string` | **removed** | See §5.10.2.3 |

**RULE-API-22.** Only channels with a **selected value** are inherited. `ambiguous`, `conflict`, `unresolved`, `unsupported` and `out_of_scope` never appear in memory — there is no value to carry, and carrying a candidate list would let a later call resolve an ambiguity the earlier one honestly declined to resolve.

For `MemoryEnglishForm`, the assembled legality rule mirrors §5.7 exactly. `styleApplicable` exists only on `person:true`; its `unitIndices` sequence is non-empty, unique and strictly increasing, and every member resolves locally to a `kind:"romanised"`, `role:"given"`, `generated:true` unit. Non-contiguous positions form separate maximal adjacent runs; literal and translated units are never referenced. The memory closure contains no source span, Analysis-local id or previous-Analysis reference. `MemoryReading` remains phonology-only and deliberately does not copy `alignmentGroups`.

**Hash-reachable integer and grouping closure (CHG-048/050, normative).** In the transitive `DocumentContext` closure, `MemoryReading.syllables[].tone` has exact integer domain `1…6`; every memory grouping member is an exact in-range local unit index and the flattened grouping is exactly the complete ascending index sequence; every styled-memory `unitIndices` member is an exact in-range local index, with a non-empty, unique, strictly increasing sequence. These remain ordinary public JSON/TypeScript numbers. After independent validation, the §5.15.2 encoder consumes them through its unchanged semantic signed-int64 route. CHG-050 changes neither that encoder nor any cache-key field membership.

#### 5.10.2.1 Canonical encoding

`DocumentContext` is encoded by §5.15.2's canonical encoder as an **ordered tagged array**, not as an object whose keys the encoder would sort:

```
canonicalEncode([ "hklang.documentContext", contextFormatVersion, id, entities ])
```

CHG-046 leaves this existing `DocumentContext` representation exactly unchanged. Its domain tag remains element 0 and its format version remains element 1; the array is inserted as the `documentContext` slot of the enclosing `optionsHash` preimage.

`entities` is order-significant and encoded in array order. A host that reorders it produces a different `optionsHash` and a different Analysis identity — deterministic, but hosts are advised to emit a stable order.

#### 5.10.2.2 D6 recurrence and alias semantics — settled (CHG-040 A)

§4.6 motivates memory with 梁知遙 introduced in full and later referred to as 知遙, while D6 described memory as "this string resolved as an entity earlier". Those are different capabilities. **v1 supports both, bounded:**

| Supported in v1 | Not supported in v1 |
|---|---|
| **Exact-string recurrence** — `text` matches | Inferred aliases of any kind |
| **Structurally justified alias recurrence** — an alias that `MemoryPersonName` licenses: the `givenNameText` of a person entity, and the `text` minus a recognised `prefixText` | Abbreviations, initialisms, nicknames, or any alias not derivable from the carried structure |

**RULE-ENT-15.** `aliases` is **explicitly enumerated** by whoever builds the entry and each member must be justified by the entry's own `name` structure. The engine populates it only from `MemoryPersonName`; it never guesses. An alias match raises detection recall exactly as an exact match does — and, like any memory match, **cannot raise confidence** (RULE-ENT-9). This is why the alias justification must travel *inside* the span-free contract: without `givenNameText`, 知遙 could not be licensed without inference.

#### 5.10.2.3 `recordRef` withdrawn — see §5.10.3

**Why each field is present, and what is deliberately absent:**

| Excluded from the closure | Reason |
|---|---|
| Any `span` | Offsets are local to one call's source (§11.2) |
| Any Analysis `id` (`e0`, `t3`, `u1`) | Non-persistent by construction (RULE-API-13) |
| `alternatives`, `derivedFrom` | Not needed to raise recall or cap confidence. A later call re-resolves; it does not replay |
| Timestamps, source-document identity beyond `DocumentContext.id` | Not semantic to the engine |
| `recordRef` and any durable record identity | §5.10.3 — the subsystem it named does not exist in v1 |

**RULE-API-18 (RECOMMENDED) — `ref` is context-local and bounded.** `ref` identifies an entry **within one `DocumentContext` object and nowhere else**. It is not an Analysis id, is not durable across contexts, and must not be persisted by a host as an entity identity. Its sole purpose is to let an `InheritanceRef` (§5.7.4) point at the entry that supplied a value.

**Hashing and determinism.** `DocumentContext` enters `optionsHash` **as the ordered tagged array of §5.10.2.1 and in no other form.** The generic object encoder is **not** applied to it: `optionsHash` is computed over an options structure in which the `documentContext` slot holds that array, already canonicalised. Stating this explicitly is the point — an implementer who reached for the object encoder would produce a different, equally "canonical" preimage, and two implementations would then disagree about cache identity while both believing they conformed.

`ProcessOptions.documentTags` is not part of this `DocumentContext` preimage. It is normalised independently in the enclosing ProcessOptions preimage under §5.15.

`entities` is order-significant within the array, so a host that reorders it produces a different `optionsHash` and a different Analysis identity — deterministic, but hosts are advised to emit a stable order. Nothing here introduces ambient state: the context exists only as an argument.

### 5.10.3 Durable Entity Records — DEFERRED from v1 (CHG-040 B)

`recordRef` promised "a durable entity-record id — the one durable identity that may cross a call". Nothing stood behind that promise. The public contract defined **no `EntityRecord` type, no registry or store API, no `EngineConfig` input, no create/update/delete/import/export semantics, no alias or canonical-name rules, no evidence validation, no persistence owner, no version axis, no per-window cache fingerprint, no invalidation rule and no namespace/restoration semantics** — while `provenance: "entity_record"` was already produced by D1, reading resolution, Chain A step 2 and Chain B step 2, and while §4.8.2 gave records a precedence position against the stores.

A durable store cannot exist only in prose. Half-specifying one is worse than omitting it: an implementer would invent the missing half, and every invented half would differ.

**Resolution: durable Entity Records are removed from the v1 public contract.**

| Removed from v1 | Replaced by |
|---|---|
| `EntityMemoryEntry.recordRef` and `Entity.recordRef` | nothing — document-local continuity is `EntityMemoryEntry` itself |
| `provenance: "entity_record"` **as a v1 producer** | `user_glossary`, with the entry's `evidenceClass` carrying what the record's evidence field would have carried |
| Entity-record precedence steps (Chain A step 2, Chain B step 2, the record half of §3.5 step 2, §4.8.2's record-vs-store rows) | **entity-scoped entries in the appropriate independent store** |

**How the same facts are expressed instead.** Every entity-specific linguistic fact a record would have held already has a home, in the store that owns that layer — which also preserves INV-12 rather than quietly introducing a fourth store spanning all three:

| The user knows… | Store | `entryScope` | Evidence class |
|---|---|---|---|
| how this person's name is *pronounced* | pronunciation | `entity` | E1a–E2 |
| what this thing is *called in English* | translation / English-form | `entity` | E1a–E2 |
| how this entity's name is *romanised* | HK Romanisation | `entity` | E1a–E2 |

E1a/E1b/E1c/E2 already carry preference, creator-canonical, bearer-asserted and documentary semantics (§2.3.1), which is the whole of what a record's evidence field would have done. Aliases and canonical names, for v1, are the `aliases` of a `DocumentContext` entry (§5.10.2.2) — document-local, explicit, and not a durable registry.

**`provenance: "entity_record"` remains in the `Provenance` union** as a reserved value with **no v1 producer**, so adding the subsystem later is a minor change rather than a breaking one (RULE-API-9 already requires consumers to tolerate values they do not produce). A conformant v1 engine never emits it, and §6 asserts that (T-API-027).

**Recorded as DEC-LANG-20260828-058.** Durable Entity Records are a plausible v2 extension — a curated registry of the people and places the author cares about is genuinely useful — but they are a *fourth persistence domain* with its own versioning, invalidation, namespace and Lab surface, and §7.6 already lists more than enough buildable work without one.


### 5.10.4 Convenience views — **DEFERRED / NON-v1** (CHG-042 C)

**These are NOT part of the v1 public contract.** DEC-…-034 is authoritative: **v1 exports `processText` only**, and `Engine` (§5.10) declares no other analysis entry point. Presenting the signatures below inside the Public API section while DEC-…-034 said they do not ship was a contradiction; it is resolved by marking the subsection, not by adding the functions to `Engine`.

The design note is retained because the shape is worth preserving for whenever a real consumer asks. The signatures are **illustrative future helpers**:

```ts
getJyutping(text, o?): Pick<Analysis, "source"|"offsetUnit"|"tokens"|"versions">;
detectEntities(text, o?): Pick<Analysis, "source"|"offsetUnit"|"entities"|"regions"|"versions">;
getHKRomanisation(text, o?): Pick<Analysis, "source"|"offsetUnit"|"tokens"|"entities"|"versions">;

// single-term lookups — store + lexicon only, no document pipeline
resolvePronunciation(term: string, ctx?: TermContext): Value<Reading>;
resolveTranslation(term: string, ctx?: TermContext): Value<string>;
```

**RULE-API-5 (scoped to these helpers, CHG-042 C).** *If and when* convenience views are introduced, the first three must run the full pipeline and project a slice, and their documentation must say so — a consumer calling all three on the same text does three times the work unless the cache hits (§5.15). **This is not a requirement on a v1 implementation**, which ships none of them. `processText` is the only analysis entry point in v1.

The two `resolve*` functions are genuinely cheaper: they are store-and-lexicon lookups with no segmentation or entity pass, and they return an envelope whose `status` may legitimately be `ambiguous` because no context was supplied.
---

## 5.11 The style module — DEC-LANG-20260828-016 SETTLED

**Decision: style profiles live in `@hklang/style`, a pure module depending only on `@hklang/core`.**

Rationale: which joining conventions are attested is *linguistic knowledge* (§2.4.4), so duplicating it in the Lab and again in a future Reader guarantees the two will diverge. But it is not *engine* work, and binding it into the pipeline would make a display setting a cache-key input. A pure sibling module gets both properties.

```ts
// The Lab's full presentation range (§9.10). Used only by the generic render helpers.
type StyleProfile = "hyphenated"|"joined"|"spaced"|"hyphen_title"|"surname_caps";

// CHG-042 D — the RC-3 toggle is narrower than StyleProfile and must stay narrower.
// The Reader's setting governs GIVEN-NAME JOINING of an assembled personal name and
// nothing else; `spaced`, `surname_caps` and `hyphen_title` are Lab presentation
// profiles and must not become Reader settings.
type GeneratedPersonNameStyle = "hyphenated" | "joined";

// The complete general-L3R casing range already named by §2.2.4.
type CasingProfile = "lower" | "sentence" | "title" | "upper";

type AnnotationChannel = "reading" | "romanisation" | "englishForm";

interface DisplayOptions {
  channels: ReadonlyArray<AnnotationChannel>;
  romanisationCasing?: CasingProfile;
  personNameStyle?: StyleProfile;
  includeAlternatives?: boolean;
}

interface AnnotationProjection {
  schemaVersion: string;
  sourceHash: string;
  offsetUnit: "utf16";
  annotations: ProjectedAnnotation[];
}

interface ProjectedAnnotation {
  ref: AnnotationRef;
  span: [number, number];
  sourceText: string;
  rendered: string | null;             // null when no selected/renderable value exists
  status: Status;
  confidence: Confidence;
  alternatives: string[];              // [] unless explicitly requested
  cautions: CautionCode[];
}

interface RenderedVariant {
  profile: StyleProfile;
  text: string;
}

// All pure: same inputs ⇒ same output. No I/O, no store reads, no engine state.
function renderPersonName(form: EnglishForm, profile: StyleProfile): string;
function renderRomanisation(r: Romanisation, casing: CasingProfile): string;
function renderVariants(form: EnglishForm, profiles: StyleProfile[]):
         RenderedVariant[];                           // the Lab's side-by-side view
function projectAnnotations(a: Analysis, display: DisplayOptions): AnnotationProjection;
function projectTranslationDirectives(a: Analysis, s: DirectiveSettings): TranslationDirectives;
```

`projectTranslationDirectives` returns diagnostics created by that invocation as ordinary result data, not as a side effect. It neither mutates `a`/`a.diagnostics` nor copies unrelated analysis diagnostics. The same `(Analysis, DirectiveSettings)` produces byte-identical projection diagnostics.

**RULE-API-6 (RECOMMENDED, CHG-032/044; executable closure CHG-050).** `renderPersonName` returns `form.text` exactly whenever `form.assembled === false`, under every `StyleProfile`. Rendering an assembled form never reorders units and never normalises text. Literal and translated unit text is copied byte-for-byte. Romanised unit text receives only the locale-independent ASCII operations below. An assembled non-person form ignores all person transformations and produces one identical rendering for every `StyleProfile`.

### 5.11.1 Locale-independent ASCII casing

The casing functions operate on UTF-16 code units, independently of locale:

- `asciiLower` maps only U+0041…U+005A (`A`…`Z`) to U+0061…U+007A (`a`…`z`).
- `asciiUpper` maps only U+0061…U+007A (`a`…`z`) to U+0041…U+005A (`A`…`Z`).
- Every other UTF-16 code unit is preserved unchanged. No Unicode normalisation, locale-sensitive casing, code-point expansion or surrogate replacement occurs.
- `asciiTitle(s)` is `asciiLower(s)` followed by ASCII-uppercase of the first ASCII letter in the resulting string, if one exists.

For an `AssembledRomanisation`, first compose the grouping-defined words exactly as §5.6 requires. Then:

| `CasingProfile` | Exact operation on the complete composed rendering |
|---|---|
| `lower` | `asciiLower(rendering)` |
| `upper` | `asciiUpper(rendering)` |
| `sentence` | `asciiLower(rendering)`, then ASCII-uppercase the first ASCII letter in the complete rendering |
| `title` | apply `asciiTitle` independently to every grouping-defined orthographic word, then join those words with U+0020 |

For a `VerbatimRomanisation`, `renderRomanisation` returns the exact supplied `text` under every `CasingProfile`; the casing argument has no effect.

### 5.11.2 Base rendering of assembled English forms

The shared presentation base is deterministic and unit-aware:

1. Validate the complete grouping and, for a styled person, all `styleApplicable` references before rendering.
2. Preserve units-array order. For each romanised unit use `asciiLower(unit.text)`; for each literal or translated unit use the exact `unit.text`.
3. For each grouping-defined orthographic word, find the first ASCII letter in its concatenated unit sequence. If that code unit belongs to a romanised unit, ASCII-uppercase it; if it belongs to a literal or translated unit, leave it unchanged. No later letter is promoted. Concatenate units inside the word with no separator and join words with U+0020.
4. On a person form, insert exactly U+0020 SPACE between adjacent surname/given units, in either name order, replacing any grouping-derived separator at that boundary and including the no-separator case where the units share one group.

This is the shared presentation casing. Thus a non-target romanised unit has identical text under `hyphenated` and `joined`; “surname/non-generated/unreferenced units are unchanged” means they are not licensed RC-3 joining targets, not that shared casing is forbidden.

### 5.11.3 Licensed-run styling

Resolve `styleApplicable` references to unit positions. They are non-empty, unique and strictly increasing. Partition them into maximal runs of numerically adjacent positions. An unlicensed unit breaks a run even when later licensed references follow; rendering never joins across that unit. Within every licensed run, override only the separators and casing of its referenced romanised units as follows:

| `StyleProfile` | Separator within each run | Target-unit casing |
|---|---|---|
| `hyphenated` | U+002D HYPHEN-MINUS | first element `asciiTitle`; later elements `asciiLower` |
| `joined` | none | concatenate the `asciiLower` target texts, then apply `asciiTitle` to the resulting word |
| `spaced` | U+0020 SPACE | `asciiTitle` each element |
| `hyphen_title` | U+002D HYPHEN-MINUS | `asciiTitle` each element |
| `surname_caps` | as `hyphenated` | as `hyphenated`, plus `asciiUpper` on every assembled romanised unit whose role is `surname` |

The surname/given U+0020 boundary has precedence over a licensed-run separator, although valid licensed references cannot include surname units. Literal and translated units remain exact under every profile. On an assembled person with no `styleApplicable`, the first four profiles return the shared base unchanged; `surname_caps` still applies its explicit surname transformation. `surname_caps` is a Lab-only presentation exception and is invalid anywhere a `GeneratedPersonNameStyle` is required. No profile sets or implies the unresolved global `givenNameJoin` default.

For the canonical `leung` / `chi` / `yiu` fixture the exact five outputs are, respectively: `Leung Chi-yiu`, `Leung Chiyiu`, `Leung Chi Yiu`, `Leung Chi-Yiu`, and `LEUNG Chi-yiu` in the `StyleProfile` declaration order.

### 5.11.4 `renderVariants`

`renderVariants(form, profiles)` is exactly the following one-for-one ordered map:

```ts
profiles.map(profile => ({
  profile,
  text: renderPersonName(form, profile)
}))
```

Caller order and duplicate profiles are preserved. An empty input returns `[]`. There is no sorting, deduplication or implicit profile.

**RULE-API-7 (RECOMMENDED) — INV-10 in operational form.** Changing any style or display setting re-invokes only the pure projections. It must not cause re-segmentation, re-running entity detection, re-resolving readings, re-running romanisation, or refetching source text. The `Analysis` is what gets cached; projections are recomputed and never cached against a style setting.

---

## 5.12 Translation directives projection

The consumer-facing output for an external translation workflow (RC-2). Produced by projection, never by `processText` — this is what resolves the style-vs-single-replacement contradiction (CHG-026).

```ts
interface DirectiveSettings {
  generatedPersonNameStyle: GeneratedPersonNameStyle;   // narrowed — CHG-042 D
  protectionConfidenceFloor?: Confidence;      // default "medium" — CHG-032 item 3
}

interface TranslationDirectives {
  schemaVersion: string;
  sourceHash: string;                          // binds these directives to one exact source
  offsetUnit: "utf16";
  styleUsed: GeneratedPersonNameStyle;
  protectedSpans: ProtectedSpan[];             // non-overlapping, sorted (INV-17)
  termDirectives: TermDirective[];             // selected L4 guidance only; no conflicts
  unresolvedSemanticSpans: UnresolvedSemanticSpan[];
  diagnostics: Diagnostic[];                   // this projection invocation only; deterministic; [] when none
}

type UnresolvedSemanticSpan =
  | { span: [number, number]; status: "ambiguous" | "conflict"; reason?: never }
  | { span: [number, number]; status: "unresolved" | "unsupported"; reason: ReasonCode };

interface ProtectedSpan {
  span: [number, number];
  entityId: string;
  entityType: EntityType;
  replacement: string;                         // concrete; style already applied if applicable
  formKind: FormKind;
  assembled: boolean;
  provenance: Provenance;
  evidenceClass: EvidenceClass;
  externalAttestation: ExternalAttestation;
  protection: "strict"|"preferred"|"fallback";
  styleApplied: GeneratedPersonNameStyle | null;   // non-null only for licensed person units
  rationale: string;
}
```

**RULE-API-11 (RECOMMENDED, CHG-032 item 3).** `protectionConfidenceFloor` is a **projection** setting. It does not appear in `ProcessOptions`, does not affect `Analysis`, and does not enter `optionsHash` or the analysis cache key. Raising or lowering the floor **re-projects the same cached `Analysis`**; it never re-runs the engine. This follows from CHG-026 and RULE-API-7: protection is a directive-layer concept and nothing in the linguistic analysis depends on it.

`TranslationDirectives.diagnostics` contains only diagnostics produced during this projection invocation. It never copies `Analysis.diagnostics`, is empty when projection produces no diagnostic, and is ordered by the attempted selected `TermDirective` order inherited from `Analysis.termResolutions` (§5.8). Re-projecting the same inputs produces byte-identical diagnostic order and content.

**Projection rules — normative.**

1. Only entities at or above `protectionConfidenceFloor` produce a protected span (RULE-ENT-13). Below it, nothing is emitted — a wrongly detected 李 must not stop a translator from rendering "plum" (§4.11.1).
2. `boundaryAmbiguous` regions produce **no** protected spans.
3. An entity whose `englishForm.status` is `ambiguous`, `conflict`, `unresolved` or `unsupported` produces **no** protected span; it appears in `unresolvedSemanticSpans` instead. Projection copies the source status. For `unresolved`/`unsupported`, it also copies the required source `reason`; for `ambiguous`/`conflict`, `reason` is absent and no synthetic code is invented (CHG-044 L).
4. Where entities nest, only `primary` is protected (INV-17).
5. A selected `termDirective` overlapping one or more protected spans is **dropped**. Protection wins, and exactly one corresponding `TERM_DIRECTIVE_DROPPED_OVERLAP` entry is appended to `TranslationDirectives.diagnostics` per dropped directive, not per overlap pair. Its `span` is required and equals the dropped directive span; optional structured `data` may identify the affected `entryId` and protected entity id or ids. Diagnostics follow attempted directive order. Nothing is written to or copied from `Analysis.diagnostics`.
6. `protection` is set from `evidenceClass`, **not** from the fallback route: a verbatim user-glossary romanisation reaching Chain B by the §4.9 path is `strict`, not `fallback`.
7. `styleApplied` is non-null only if the source `AssembledEnglishForm` is a person form with `styleApplicable`; it records the requested Hyphenated/Joined projection. Verbatim, non-person and unstyled person forms carry `null`.
8. Only a `TermResolution.result` with a non-null selected value becomes a `TermDirective`. A conflict is omitted until resolved; overlap handling then applies to the selected directives.
9. The engine specifies **no** substitution mechanism, placeholder syntax, prompt or API shape. How a consumer honours these directives is entirely its own design (RC-1).

---

## 5.13 Replaceable interfaces

DEC-…-017 is unresolved, so the segmenter must be swappable without touching anything else (RULE-JP-5a).

```ts
interface ForcedTerm {
  span: [number, number];                     // inside `window`, UTF-16 source offsets
  text: string;                               // exact source slice
  entryId: string;                            // StoreEntry that forced the segment
}

interface Lattice {
  window: [number, number];                   // source-bound analysis window
  edges: ReadonlyArray<LatticeEdge>;          // deterministic ascending edge.index
  alternatives: ReadonlyArray<LatticeAlternative>;
}

interface LatticeEdgeBase {
  index: number;                              // local to this Lattice; not a durable id
  span: [number, number];
  text: string;                               // exact source slice
  matchedKey?: string;
}

type LatticeEdge = ReferenceLatticeEdge | StoreLatticeEdge;

interface ReferenceLatticeEdge extends LatticeEdgeBase {
  source: "lexicon" | "character";
  entryId?: never;
}

interface StoreLatticeEdge extends LatticeEdgeBase {
  source: "user_glossary" | "forced";
  entryId: string;                             // StoreEntry that licensed/forced the edge
}

interface LatticeAlternative {
  edgeIndices: [number, ...number[]];         // one complete candidate path through window
}

interface Segmenter {
  id: string;                                  // contributes to segmenterVersion
  segment(text: string, window: [number, number],
          lexicon: Lexicon, forced: ForcedTerm[]): Lattice;
}

interface LexiconReading {
  jyutping: string;                           // canonical RULE-JP-2 spelling
  variation?: VariationKind;
  frequency: number | null;
  sourceRef: string;
}

interface LexEntry {
  key: string;
  readings: ReadonlyArray<LexiconReading>;
}

interface CharEntry {
  character: string;
  readings: ReadonlyArray<LexiconReading>;
}

interface LexiconCoverage {
  writtenCantonese: boolean;
  hkscs: boolean;
  wordLevel: boolean;
  frequencies: boolean;
}

interface Lexicon {
  lookupWord(key: string): LexEntry[];
  lookupChar(cp: string): CharEntry[];
  frequency(key: string): number | null;       // required by RULE-JP-7's dominance threshold
  coverage(): LexiconCoverage;
}

// CHG-037 A — the conformant core NEVER calls a provider. It consumes an already-
// materialised, content-addressed snapshot supplied through EngineConfig.
// CHG-039 B — `id` is the hash of the SNAPSHOT IDENTITY, not of `entries` alone.
interface ProviderSnapshot {
  id: string;                                  // SHA-256 digest of the ordered tagged-array
                                               // preimage in RULE-API-20. There is no other preimage;
                                               // do NOT encode this object generically.
  snapshotFormatVersion: "1";                  // scheme version; see RULE-API-20's preimage
  providerId: string;
  providerConfigHash: string;                  // provider configuration
  createdAt: string;                           // NON-SEMANTIC — excluded from `id` (see below)
  entries: ReadonlyArray<ProviderSnapshotEntry>;
}

interface ProviderSnapshotEntry {
  inputHash: string;                           // hex SHA-256 over the canonical input;
                                               // MUST be unique within a snapshot
  output: CanonicalValue;
}

// The value domain §5.15.2's canonical encoder accepts. Provider outputs must be
// expressible in it, so no implementation invents a second encoding.
type CanonicalValue =
  | null | boolean | string
  | CanonicalInteger
  | ReadonlyArray<CanonicalValue>
  | CanonicalObject;

type CanonicalInt64Decimal = string;           // grammar/range are normative immediately below

interface CanonicalInteger {
  readonly __int: CanonicalInt64Decimal;       // exactly this one property
}

type CanonicalObject =
  { readonly [key: string]: CanonicalValue }
  & { readonly __int?: never };                // reserved key makes the union disjoint

interface EngineConfig {
  engineVersion: string;
  lexiconVersion: string;                      // composite fingerprint (§5.15.1)
  rulesVersion: string;                        // composite fingerprint (§5.15.1)
  segmenterVersion: string;                    // identifies Segmenter + model/lexicon
  keyFormatVersion: string;                    // canonical encoder version (§5.15.2)
  lexicon: Lexicon;
  segmenter: Segmenter;
  stores: StoreApi;
  providerSnapshot?: ProviderSnapshot;         // the ONLY provider input surface; atomically validated by createEngine
}

// A LIVE provider lives outside processText, in an optional async orchestration layer
// that materialises a ProviderSnapshot and then calls the synchronous core.
interface ExternalProvider<I, O> {             // OPTIONAL, orchestration layer only
  id: string;
  deterministic: false;
  call(input: I): Promise<O>;
}
```

**Minimal stable lattice contract (CHG-044 D).** `Lattice` exposes only source-bound candidate edges and complete alternative paths consumed downstream. Its `window` and every edge span use the Analysis UTF-16 coordinate system; edge text is the exact source slice; edge indices are consecutive local integers; every alternative references only in-range edges whose ordered spans form a contiguous, non-overlapping partition of `window`. Duplicate paths are forbidden. There is deliberately no score, weight, probability, HMM state, neural feature or chosen segmenter in this public shape. DEC-…-017 therefore remains unresolved without making the stable interface undefined.

**Exact v1 `EngineConfig` boundary (CHG-044 D; amended CHG-045 B).** The conformant core receives the replaceable `Lexicon`, `Segmenter`, three-store API, their already-computed version fingerprints, the canonical-key format version, and optionally a pinned provider snapshot. `createEngine` reads `Lexicon.coverage()` and validates any supplied snapshot atomically; only a successful result exposes an Engine, and only a valid snapshot can enter it. The packaged romanisation/convention/gazetteer implementation remains inside the frozen modules and is identified by `rulesVersion`; no concrete segmenter, runtime or live-provider behaviour is selected here. `segmenterVersion` must identify the supplied `segmenter`. There is no durable Entity Record input and no live-provider field.

**Canonical integer domain (CHG-044 F).** A `CanonicalInteger` is the ordinary JSON object `{ "__int": "<decimal>" }` with exactly one property and no additional properties. The decimal grammar is `0` or `-?[1-9][0-9]*`; `+`, leading zeroes and `-0` are forbidden. Its mathematical value must lie from `-9223372036854775808` through `9223372036854775807`, inclusive. The ordinary `CanonicalObject` branch explicitly reserves and forbids `__int`, so no object can match both branches. Schema/runtime validation enforces grammar and range before the §5.15.2 encoder consumes the semantic integer.

### 5.13.1 Provider representation — normative (CHG-037 A)

The pre-CHG-037 contract could not express §10.7's three modes. `providerSnapshotId: null` meant either *no provider* or *live provider, unpinned* — materially different states — `Analysis` had no conformance field for RULE-CACHE-9 to set, `analysisCacheKey` could not separate the two, and §5.10 exposed no input surface through which a snapshot could be supplied.

**Resolved by narrowing the core rather than widening the contract.**

| Mode | Where it runs | `providerSnapshotId` | INV-7 |
|---|---|---|---|
| **No provider** | conformant sync core | **`null`** | Full |
| **Pinned snapshot** | conformant sync core after a valid snapshot supplied via `EngineConfig.providerSnapshot` passes creation validation | the snapshot's content-hash id | Full, relative to that snapshot |
| **Live provider** | **outside `processText`**, in an optional async orchestration layer that materialises a snapshot and then calls the core | — the core never sees this mode | n/a — the core is not involved |

**RULE-API-17.** Every `Analysis` the conformant core produces is **strictly INV-7 conformant**. `providerSnapshotId: null` has exactly one meaning: **no pinned provider snapshot was used**. A live provider cannot reach `processText`; the orchestration layer must materialise a snapshot first, at which point the run becomes a pinned-snapshot run.

Consequences: `Analysis` needs **no** non-conformance flag, because the non-conformant case cannot occur inside the contract; and **`processText` stays synchronous** — the async work is snapshot acquisition, which happens before the core is called. **DEC-…-032 is SETTLED for v1** on this basis: the v1 core `processText` is **synchronous**, as the frozen signature declares, and provider acquisition happens in host orchestration outside it. A future async core would be a **new contract decision**, not an open v1 question.

### 5.13.2 Snapshot identity — normative (CHG-039 B)

The pre-CHG-039 contract was internally inconsistent: `id` was defined as the content hash of `entries` alone, while §5.13.1 asserted that provider identity and configuration entered `analysisCacheKey` **through** that id — and `analysisCacheKey` carries only `providerSnapshotId`. Two snapshots with identical entries but different providers or configurations would have shared an id and therefore a cache key, while claiming to be distinguished.

**RULE-API-20 (RECOMMENDED, byte-exact by CHG-040 C).** The preimage is an **ordered tagged array**, not an object — §5.15.2's encoder sorts object keys, so "hashed in this order" and "keys sorted" were two different byte specifications for the same value. There is now exactly one:

```
ProviderSnapshot.id = SHA-256( canonicalEncode([
    "hklang.providerSnapshot",   // domain tag
    keyFormatVersion,            // the ENCODER's version (§5.15.2)
    snapshotFormatVersion,       // this SCHEME's version
    providerId,
    providerConfigHash,
    canonicalEntries             // see below
]) )
```

`keyFormatVersion` is included explicitly rather than assumed: a change to the canonical encoder must invalidate snapshot ids, and relying on `snapshotFormatVersion` to be bumped in sympathy would be the same unstated-coupling error CHG-036 B found in the cache key.

**Canonical entry ordering.** `entries` was declared order-significant with no ordering rule, which silently made *construction order* semantic — two hosts building the same snapshot from the same data in different orders would produce different ids and miss each other's cache. Since entries are keyed by `inputHash`, order carries no meaning:

```
canonicalEntries = entries sorted by ascending inputHash (UTF-16 code-unit order),
                   each encoded as [inputHash, output]
```

**Duplicate `inputHash` values are rejected**, not merged or last-wins: a snapshot containing two outputs for one input has no single meaning. `createEngine` returns `ok:false`, `engine:null`, and non-empty creation diagnostics including `PROVIDER_SNAPSHOT_INVALID`; no Engine is created from it.

Because `providerId` and `providerConfigHash` are inside the hash, the §5.13.1 claim is now true: they reach `analysisCacheKey` via `providerSnapshotId`, and no additional key input is needed.

**`createdAt` is explicitly NON-SEMANTIC and excluded from `id`** — it appears nowhere in the preimage above. Two snapshots with the same provider, the same configuration and the same entries are **intentionally content-identical** and must share an id — that is what makes a snapshot content-addressed and what lets two machines reach the same cache entry. `createdAt` is retained as provenance metadata for a host's own auditing; it never affects identity. Had it been included, re-materialising an identical snapshot would have invalidated every cached Analysis for no semantic reason.

CHG-046 leaves this `ProviderSnapshot` formula and its entry ordering unchanged. It already uses the global domain-separated convention: the tag is element 0 and `keyFormatVersion` is element 1.

**Canonical-hashing domain.** `output: unknown` was too weak for a content-addressed artefact: §5.15.2's encoder has a defined value domain and **forbids non-integer numbers in hashed input**. Snapshot entries are therefore constrained to the disjoint `CanonicalValue` union above. A `__int` object is validated for exact property set, canonical decimal grammar and signed-int64 range before encoding; an ordinary object containing the reserved key is rejected. Out-of-domain data supplied through `EngineConfig.providerSnapshot` takes the same fatal creation route: `ok:false`, `engine:null`, with `PROVIDER_SNAPSHOT_INVALID`, not an ordinary throw. A provider whose natural output is not expressible in this domain — floating-point scores, binary blobs — must have its adapter project it into the domain **before** the snapshot is built, and that projection is part of `providerConfigHash`.

`Lexicon.coverage()` exists so the engine cannot **start quietly** with an unsuitable lexicon: a lexicon without `frequencies` cannot support RULE-JP-7 and would silently force everything to `ambiguous`. This remains usable degradation, so `createEngine` returns `ok:true` with a live Engine and immediate `LEXICON_MISSING_CAPABILITY` creation diagnostics naming exactly what will degrade. The warning is observable before any `processText` call.

---

## 5.14 Errors, diagnostics, and the no-throw contract

**RULE-API-8 (RECOMMENDED, amended CHG-045 B).** `processText` **never throws for content reasons.** Malformed text, unassigned code points, lone surrogates, missing readings, empty input and pathological length all produce a valid `Analysis` plus diagnostics. A returned Engine is configured by construction. `processText` throws only for invocation/programmer errors such as an option of the wrong type or a null input where a string is required. Separately, `createEngine` returns `EngineCreationFailure` rather than throwing for a validly shaped configuration that fails a semantic creation check defined by this contract.

```ts
type DiagnosticCode =
  | "LEXICON_MISSING_CAPABILITY"
  | "WINDOW_CEILING_REACHED"
  | "SOURCE_UNAVAILABLE"
  | "IMPORT_VALIDATION_FAILED"
  | "TERM_DIRECTIVE_DROPPED_OVERLAP"
  | "PROVIDER_SNAPSHOT_INVALID";

interface Diagnostic {
  code: DiagnosticCode;                        // closed for current producers
  severity: "info"|"warning"|"error";
  span?: [number, number];
  message: string;                             // human-readable; NOT for machine dispatch
  data?: { [key: string]: JsonValue };
}
```

Reserved codes include `LEXICON_MISSING_CAPABILITY`, `WINDOW_CEILING_REACHED`, `SOURCE_UNAVAILABLE`, `IMPORT_VALIDATION_FAILED`, `TERM_DIRECTIVE_DROPPED_OVERLAP`, `PROVIDER_SNAPSHOT_INVALID`.

**Diagnostic ownership and production time — normative (CHG-045 A/B).** These channels are independent; the public contract never silently merges or copies one into another.

| Production time / owner | Observable channel | Current owned codes and rule |
|---|---|---|
| Engine creation/configuration | `EngineCreationResult.diagnostics` | `LEXICON_MISSING_CAPABILITY` on degraded success; `PROVIDER_SNAPSHOT_INVALID` on fatal snapshot failure. Creation diagnostics omit `span` |
| Analysis/content processing | `Analysis.diagnostics` | Diagnostics created by that `processText` invocation only; no creation or projection diagnostics are copied into it |
| Translation-directive projection | `TranslationDirectives.diagnostics` | `TERM_DIRECTIVE_DROPPED_OVERLAP`; exactly one per dropped directive, with required dropped-directive span |
| Live-provider acquisition/orchestration | Outside the core | Host/orchestration diagnostics; none is inserted into a core channel |

Reserved codes without a current producer assignment remain reserved; this table does not invent a producer for them. A host or Lab may aggregate channels for presentation only if it retains their origin.

**`EXTERNAL_PROVIDER_FAILED` is withdrawn from the core (CHG-039 D).** The core does not call a provider — it receives a pinned snapshot as an ordinary input — so a live-call failure is not something `processText` can observe or report. Live-provider failures are **host/orchestration diagnostics**, raised before the core is invoked. What creation can report is `PROVIDER_SNAPSHOT_INVALID`: a supplied snapshot whose `id` does not match its recomputed canonical identity (RULE-API-20), whose entries are outside `CanonicalValue`, or whose `inputHash` values are duplicated. The result is `ok:false`, `engine:null`, with a non-empty creation diagnostic tuple; the invalid snapshot is not ignored. The optional orchestration-layer `ExternalProvider` interface remains defined (§5.13) — it is simply not part of the core's failure surface.

**Failure of an external source is never treated as evidence of absence** (§2.9): where an already-created Engine encounters a content/source failure, the chain falls through, an analysis diagnostic is emitted, and the result still carries honest provenance for whatever *did* resolve. A fatally invalid ProviderSnapshot is different: creation fails, so there is no Engine and no Analysis in which to fall through.

---

## 5.15 Determinism and cache keys

CHG-046 establishes one domain-separated convention for every public identity that is specified in this section. The generic canonical encoder of §5.15.2 is unchanged. A public identity preimage is an ordered array whose **element 0 is a fixed domain tag** and whose **element 1 is `keyFormatVersion`** (the first versioned/variable field). The identity is the **full lower-case SHA-256 digest of the complete `canonicalEncode` byte sequence**. The earlier shorthand “`keyFormatVersion` is the first field hashed” means this second array element; it does not displace the domain tag, and it does not alter the already-defined `ProviderSnapshot` preimage in §5.13.2.

### Exact public identity preimages (CHG-046; normative)

```text
sourceHash = SHA-256(canonicalEncode([
  "hklang.sourceHash",
  keyFormatVersion,
  source
]))

optionsHash = SHA-256(canonicalEncode([
  "hklang.optionsHash",
  keyFormatVersion,
  documentContextSlot,
  documentTags,
  latinReadingPolicy,
  numberReadingPolicy,
  phoneticComponentHeuristic,
  debugSlot
]))

analysisCacheKey = SHA-256(canonicalEncode([
  "hklang.analysisCacheKey",
  keyFormatVersion,
  schemaVersion,
  contractVersion,
  engineVersion,
  lexiconVersion,
  rulesVersion,
  segmenterVersion,
  userDataVersion,
  providerSnapshotId,
  optionsHash,
  sourceHash
]))
```

The `sourceHash` preimage contains **only** the domain tag, `keyFormatVersion` and the verbatim source string. It contains no `schemaVersion`, `contractVersion`, JSON serialisation, UTF-8 conversion, text normalisation or raw digest bytes. Strings use the lossless UTF-16 code-unit rule in §5.15.2, including lone surrogates.

`optionsHash` uses the effective, normalised values of `ProcessOptions`; omitted fields are replaced by their explicit defaults before encoding, so omission and an explicit default are byte-identical. `documentContextSlot` is `null` when `documentContext` is omitted; otherwise it is exactly `[ "hklang.documentContext", contextFormatVersion, id, entities ]` from §5.10.2.1. `documentTags` is the exact-string set obtained by validation, duplicate removal and ascending UTF-16 code-unit sorting — with no trimming, case folding or Unicode normalisation. The defaults are `latinReadingPolicy:"none"`, `numberReadingPolicy:"none"`, `phoneticComponentHeuristic:false`, and `debugSlot:[false,false]` for `debug.lattice` and `debug.trace`. No public `NormalizedProcessOptions` type is introduced. Projection settings, `DirectiveSettings`, `GeneratedPersonNameStyle`, protection floors and rendering choices are excluded.

`analysisCacheKey` contains exactly the fields shown, in exactly that order, with `keyFormatVersion` immediately after the domain tag. `schemaVersion`, `contractVersion`, `engineVersion`, `lexiconVersion`, `rulesVersion` and `segmenterVersion` are strings; `providerSnapshotId` is `null` or a validated lower-case hexadecimal id; `optionsHash` and `sourceHash` are validated lower-case hexadecimal **strings**, not raw digest bytes. **CHG-047 closes the former numeric residue:** public `userDataVersion` remains `number` but is valid only as the exact mathematical integer `0 ≤ n ≤ 9007199254740991` (`2^53−1`). Canonical encoding consumes that validated mathematical value as §5.15.2's semantic signed-int64 integer (tag `0x04` followed by eight-byte two's-complement big-endian bytes); it is never encoded as IEEE-754 bytes, a decimal string or a `CanonicalValue` `{ "__int": ... }` wrapper. Every legal public value fits that signed-int64 encoding exactly and deterministically.

These formulas are the only public preimages. There is no generic-object, concatenation or alternate field-order form. Existing `DocumentContext` and `ProviderSnapshot` formulas remain unchanged. `windowCacheKey`, relevant-entry fingerprints and other internal `H(...)` values remain later internal obligations under §10 and are not changed or made public by CHG-046.

**Why `contractVersion` was added (CHG-036 B).** Every Analysis serialises `versions.contractVersion`, but it was not a key input, and **no invariant coupled it to `engineVersion`**. A build could therefore change the contract revision — as `5.0.3` did, altering `StoreEntry` validation and hence which entries are enabled — while all prior pre-CHG-046 key inputs stayed identical, and a cache would return an entry produced under the older contract. Relying on `engineVersion` to move in sympathy is an assumption, not a guarantee; keying it directly costs one string in a hash and removes the assumption. The versioning consequence is intended: **a contract revision invalidates every cached Analysis**, which is correct, because the serialised document's meaning changed.

**`optionsHash`** covers the effective `ProcessOptions` fields listed in the exact preimage above, including `documentContext` and `documentTags`. Supplying a different context or semantic tag set can change resolution, so it must change the key. Before canonical encoding, `documentTags` is normalised as follows:

1. omission is treated as `[]`;
2. every member is validated as a string;
3. exact duplicates are removed without trimming, case-folding or Unicode normalisation;
4. the unique strings are sorted in ascending UTF-16 code-unit order; and
5. that normalised array occupies the `documentTags` slot in the exact `optionsHash` preimage above.

Consequently, omitted and empty tags have the same normalised value; duplicates and host-supplied order cannot change the preimage; changing the unique semantic tag set does change it. This specifies the later hash input only — CHG-046/047 do not implement canonical hashing. `userDataVersion` is validated in the exact public domain before it enters the semantic-int64 slot; this correction does not add a wrapper or alter the formula.

### 5.15.1 Version axes are byte-exact composite fingerprints (CHG-049; normative)

`lexiconVersion`, `rulesVersion` and `segmenterVersion` are public strings, not bare labels. Each is a composite fingerprint over the configured semantic dependency stack for its axis. This section defines their complete canonical byte preimages. The `analysisCacheKey` formula in §5.15 and the canonical binary encoder in §5.15.2 are unchanged.

#### Exact public composite preimages

```text
lexiconVersion = SHA-256(canonicalEncode([
  "hklang.lexiconVersion",
  keyFormatVersion,
  lexiconLayers
]))

rulesVersion = SHA-256(canonicalEncode([
  "hklang.rulesVersion",
  keyFormatVersion,
  rulesLayers
]))

segmenterVersion = SHA-256(canonicalEncode([
  "hklang.segmenterVersion",
  keyFormatVersion,
  segmenterLayers
]))
```

Each `*Layers` value is exactly one order-significant canonical array of every configured semantic layer on that axis, including configured disabled optional layers. The output is the full 256-bit SHA-256 digest encoded as exactly 64 lower-case hexadecimal characters. There is no object-form, concatenation-form, bare-tuple, raw-digest, alternate field-order, or alternate domain-tag form.

Each layer contribution is exactly this five-element array, in this order:

```text
[
  layerId,
  layerVersionRef,
  snapshotDate,
  enabled,
  ordinal
]
```

#### Exact layer value domains

- `layerId` is a non-empty string encoded verbatim: no trimming, case folding or Unicode normalisation.
- `layerVersionRef` is exactly one of `["version", stableVersion]` or `["sha256", contentSha256]`. `stableVersion` is a non-empty stable/immutable upstream version identifier encoded verbatim. `contentSha256` is used only when no stable version is available and is exactly 64 lower-case hexadecimal characters. A content hash is never emitted as an untagged ordinary version string. The two forms are structurally distinct even where their payload strings happen to coincide.
- A layer that can supply neither a stable version nor a content hash is non-loadable under RULE-API-15.
- `snapshotDate` is mandatory in every layer contribution and is either `null` or a full-date `YYYY-MM-DD` string denoting a valid Gregorian calendar date. A commit-backed or otherwise version-pinned layer without an authoritative snapshot date emits `null`; retrieval time is never invented. Omission is illegal and differs from `null`.
- `enabled` is the exact boolean `true` or `false`.
- `ordinal` is a zero-based, non-negative exact mathematical integer not greater than `9007199254740991`; it is unique within one composite axis and is canonical-encoded through §5.15.2's semantic signed-int64 route, never as IEEE-754 bytes or decimal text.

#### Configured, disabled and absent; ordinal and order

There are exactly three states for a potential layer: (1) absent or unconfigured — no tuple exists; (2) configured but disabled — a tuple exists with `enabled:false`; and (3) configured and enabled — a tuple exists with `enabled:true`. Disabled and absent are not interchangeable.

Outer array position is the authorised stack/resolution order and is independently semantic. It is preserved as supplied and must not be reconstructed by sorting `ordinal`. `ordinal` is a separately hashed semantic layer-slot value. Changing only outer array order, or changing only an ordinal while preserving the array order, changes the affected fingerprint. Neither representation is redundant.

An axis with zero configured semantic layers has no placeholder label. Its identity is the relevant formula above with `[]` as the third element; for example, `SHA-256(canonicalEncode(["hklang.lexiconVersion", keyFormatVersion, []]))`. An empty axis is permitted only where no semantic component for that axis participates.

#### Axis-membership boundary

Only configured runtime semantic dependencies are members of a composite axis. Evidence manifests, audit packages and acquisition archives are not automatically members merely because they exist.

| Axis | Configured runtime semantic members | Explicit boundary |
|---|---|---|
| `lexiconVersion` | word lexicon layers; character-reading layers; corpus-frequency layer once semantically authorised; variant-fold/normalisation maps; configured supplementary reading layers | Unresolved rime weights are not silently treated as the frequency layer while DEC-042 remains open. |
| `rulesVersion` | Romanisation rule/generator pack; gazetteer/convention tables; institutional official-name data; surname convention data | The DEC-037 FIT/EVAL split artefact is training/evaluation evidence, not itself a runtime layer. A later fitted/generated runtime rule pack may be a member. |
| `segmenterVersion` | segmenter implementation and every segmentation-model artefact that affects output | Family H candidate material is excluded until it actually participates in the runtime segmenter. |

User stores remain represented by public `userDataVersion` plus the internal per-window fingerprints of §10.5; effective ProcessOptions remain represented by `optionsHash`; source text remains represented by `sourceHash`; and a pinned provider snapshot remains represented by `providerSnapshotId` under §5.13.2. These are not members of the three composite layer arrays.

**RULE-API-15 (RECOMMENDED, byte-exact by CHG-049).** A conforming implementation constructs each composite fingerprint only by the corresponding formula and exact layer contribution above. **No mutable semantic dependency may be absent from its applicable fingerprint merely because it is inconvenient to version.**

### 5.15.2 Canonical hashing — normative (CHG-036 C)

"Hash the JSON" is not a specification, and in this engine it is an actively unsafe one.

**The finding.** The engine deliberately preserves **lone surrogates** as content and must not throw on them (§3.8, RULE-API-8). **UTF-8 cannot represent a lone surrogate.** A `TextEncoder`-style path — or any canonical-JSON scheme, which requires well-formed Unicode strings — replaces unpaired surrogates with U+FFFD. Two distinct sources that differ only in their ill-formed sequences would then produce the **same `sourceHash`**, and the cache would return an Analysis computed for different text. That is a silent correctness failure of exactly the class §10.1 forbids, and it would only ever be caught by a fuzz fixture.

**Therefore key hashing uses a canonical *binary* encoding, not canonical JSON.**

| Aspect | Specification |
|---|---|
| Algorithm | **SHA-256**, full 256-bit digest, hex-encoded lower-case |
| Encoding | A canonical **length-prefixed, type-tagged binary** form (below). Not JSON |
| **Strings** | **UTF-16BE code units**, `uint32` code-unit count prefix, then each code unit as 2 bytes big-endian. **Lossless for lone surrogates.** This matches `offsetUnit: "utf16"` |
| Type tags | 1 byte: `0x01` null · `0x02` false · `0x03` true · `0x04` integer · `0x05` string · `0x06` array · `0x07` object |
| **Absent vs null** | **Distinct.** An absent field contributes nothing — its key is not emitted. A null field emits its key followed by tag `0x01` |
| Objects | Keys sorted by **UTF-16 code-unit order**, ascending; `uint32` field count prefix; each field is key-string then value |
| Arrays | **Order-significant**; `uint32` length prefix; elements in order |
| Integers | Semantic integers are signed int64 and encoded as tag `0x04` plus 8-byte two's-complement big-endian. In `CanonicalValue` JSON they arrive only through the exact `{ "__int": "<canonical signed-int64 decimal>" }` sentinel of §5.13; the encoder validates and consumes the semantic integer, not the wrapper as an ordinary object |
| Numbers | Bare JSON/JavaScript numbers are **forbidden** in `CanonicalValue` and other hashed inputs unless a separately declared keyed-input field is already normatively an integer. Non-integer numbers are always forbidden and never rounded. The already-validated internal encoder may assert/throw at development time if one reaches it; `createEngine` must instead translate an out-of-domain number inside a supplied ProviderSnapshot into `EngineCreationFailure` with `PROVIDER_SNAPSHOT_INVALID` |
| Reserved object key | The ordinary-object branch rejects `__int`; sentinel detection therefore has one meaning and never depends on branch order |
| Format versioning | In every CHG-046 public identity preimage, the domain tag is element 0 and `keyFormatVersion` is element 1. Changing the encoding bumps it and invalidates all caches, by design |

`documentTags` is deduplicated and sorted before reaching the encoder. The encoder still treats the resulting normalised array as order-significant; there is no exception to the canonical array rule.

**CHG-047 keyed integer rule.** `Versions.userDataVersion` is the one public keyed-input number **directly present in the `analysisCacheKey` preimage**. It is admitted only after exact validation against `0 ≤ n ≤ 9007199254740991`; the encoder then operates on that mathematical integer and emits the semantic signed-int64 form (`0x04` + eight-byte two's-complement big-endian). The public number is never encoded as IEEE-754 bytes or decimal text, and the `CanonicalValue` `__int` sentinel is not used for this field. No arbitrary JavaScript number is thereby admitted; the separately declared CHG-048 integer fields below are the only additional numeric fields admitted through their own public contracts.

**CHG-048/050 hash-reachable integer rule.** The same semantic-int64 route applies to already-validated integer fields reachable through `DocumentContext`: `MemoryReading.syllables[].tone` (`1…6`), every memory grouping local index, and every styled-memory `unitIndices` member. CHG-050 additionally requires the complete ascending flattened grouping sequence and non-empty/unique/strictly increasing style-reference sequence to validate before canonicalisation. The canonical encoder, domain tags, wrappers and byte rules are unchanged; no new field is added to any cache key.

**RULE-API-16 (RECOMMENDED).** `sourceHash` is computed over the source's **UTF-16 code-unit sequence**, using the string rule above. It is **not** "the UTF-8 hash of the string". Any implementation that routes the source through a UTF-8 encoder, a JSON serialiser, or a Unicode-scalar-value normaliser before hashing is non-conformant, and §6's fuzz corpus must contain lone-surrogate fixtures that would detect it (T-CACHE-014).

The same rule applies to every string in `optionsHash` and in internal fingerprints, including source-derived `documentContext` text and opaque `documentTags` labels.

| Cached | Not cached |
|---|---|
| `Analysis` (per window and per whole input) | Any style projection |
| Convention-table and lexicon lookups (keyed by their versions) | `TranslationDirectives` — cheap to re-project, and caching it against a style setting would reintroduce the coupling CHG-026 removed |
| Pinned `ProviderSnapshot` artefacts, keyed by snapshot id (§10.9.1) | Live-provider results — the core never produces them (CHG-039 D) |

Full caching design is §10. What §5 freezes is that the key inputs are **exactly those listed above** — and, critically, that style and projection settings are **not** among them.

---

## 5.16 Debug payload

```ts
interface ResolutionTrace {
  target: ResolutionTraceTarget;
  layer: "L2" | "L3R" | "L3E" | "L4";
  chain: string;                               // stable chain id, e.g. "B"
  steps: ResolutionTraceStep[];
}

type ResolutionTraceTarget =
  | { kind: "annotation"; ref: AnnotationRef; index?: never }
  | { kind: "termResolution"; index: number; ref?: never }; // local index into Analysis.termResolutions

interface ResolutionTraceStep {
  ordinal: number;
  source: string;                              // stable source/step id
  outcome: "hit" | "miss" | "not_applicable" | "conflict";
  entryIds?: string[];
  evidenceClass?: EvidenceClass;
  detail?: string;
}

interface DebugPayload {
  lattice?: Lattice;                           // full segmentation lattice, opt-in
  trace?: ResolutionTrace[];                   // per-resolution-target trace: which steps ran, which fired
  segmentation: { inertAmbiguities: number; consequentialAmbiguities: number };
  rulePackAccuracy?: { syllableExactMatch: number; wholeNameExactMatch: number;
                       sibilantSubAccuracy: number; measuredAgainst: string };
}
```

Off by default (DEC-…-023). `trace` is what the Lab's debug panel renders — **the same object the API returns**, never a parallel computation (§1.5 principle 7). `rulePackAccuracy` surfaces §2.7's measured numbers so the Lab can show a real figure instead of a vague hedge.

---

## 5.17 Extensibility and compatibility

**RULE-API-9 (RECOMMENDED, amended by CHG-032 item 7) — enums are closed for producers, open for consumers; tolerance is not coercion.**

A conformant producer emits only values from the applicable closed vocabulary declared in §5 (including §§5.2, 5.5.2, 5.9, 5.14 and 5.16). A conformant consumer must not crash on an unrecognised value — but the v0.1 rule went too far and told consumers to *reinterpret* unknown values as known ones. That is exactly the fabrication this packet exists to prevent, moved into the consumer: an unknown `FormKind` rendered as `translation` would assert a linguistic mechanism nobody claimed, and an unknown `Provenance` shown as `external` would assert a source.

**The distinction: behave conservatively, never rewrite semantics.**

| Consumer obligation | Yes | No |
|---|---|---|
| Preserve the raw unknown value | **required** — keep it, display it, round-trip it | — |
| Enter an explicit unknown-handling branch | **required** | — |
| Degrade behaviour conservatively | **permitted** — e.g. *behave as if* the value were unresolved: do not protect the span, do not export it as authoritative | — |
| Rewrite the stored value to a known member | — | **forbidden** |
| Display an unknown value as a known category | — | **forbidden** |

Concretely, for an unknown `Status` a consumer **may act** as though the value were unresolved, but **must not** store or report `status: "unresolved"`. The honest rendering of an unknown enum is "unrecognised (`<raw value>`)", not a guess. This is what allows the taxonomy to grow without a major version *and* without teaching old consumers to lie.

**Compatibility policy.**

| Change | Version impact |
|---|---|
| Adding an optional field | patch |
| Adding an enum member | minor — consumers already tolerate it (RULE-API-9) |
| Adding a required field | **major** |
| Changing a field's meaning or removing one | **major** |
| Changing `offsetUnit` | **major** |
| Changing a linguistic rule | no schema impact; `rulesVersion`/`lexiconVersion` bump |

`ext` is a reserved namespace for consumer-specific data. The engine never reads it; it round-trips it untouched.

---

## 5.18 Worked example — the case that exercises every decision

Source: `我今日去旺角搵梁知遙。` · HK Romanisation store: 梁知遙 → *Leung Chi-yiu* (`entryScope: entity`, E1a) · translation store: empty.

The following JSONC is an intentionally **abridged semantic excerpt**, not a schema-valid complete `Analysis`; omitted required fields are unrelated to the four decisions demonstrated below.

```jsonc
{
  "schemaVersion": "1.0", "offsetUnit": "utf16",
  "source": "我今日去旺角搵梁知遙。",
  "entities": [
    { "id": "e0", "span": [5, 7], "text": "旺角", "type": "place.district",
      "primary": true, "englishFallbackPolicy": "romanisation_allowed",
      "romanisation": {                                   // L3R — attested, VERBATIM shape
        "value": { "formKind": "romanisation", "assembled": false, "text": "Mong Kok" },
        "status": "resolved", "provenance": "convention_table",
        "evidenceClass": "E3", "externalAttestation": "attested", "confidence": "high",
        "attestation": { "scope": "place_instance",
                         "sourceRef": "landsd-geographic-name", "asOf": "2026-08-01" },
        "alternatives": [], "ranked": false, "cautions": [] },
      "englishForm": {                                    // L3E — same text, different question
        "value": { "formKind": "romanisation", "assembled": false, "text": "Mong Kok" },
        "status": "resolved", "provenance": "convention_table",
        "evidenceClass": "E3", "externalAttestation": "attested", "confidence": "high",
        "alternatives": [], "ranked": false, "cautions": [] } },

    { "id": "e1", "span": [8, 11], "text": "梁知遙", "type": "person",
      "primary": true, "englishFallbackPolicy": "romanisation_allowed",
      "structure": { "surname": {"span":[8,9],"compound":false},
                     "givenName": {"span":[9,11]}, "order": "surname_first" },
      "detectionEvidence": [ { "mechanism": "D1", "detail": "entity-scoped HKR entry" } ],
      "detectionConfidence": "high",
      "romanisation": {                                   // L3R — from the user's store, VERBATIM
        "value": { "formKind": "romanisation", "assembled": false, "text": "Leung Chi-yiu" },
        "status": "resolved", "provenance": "user_glossary",
        "evidenceClass": "E1a", "externalAttestation": "not_attested", "confidence": "high",
        "alternatives": [], "ranked": false, "cautions": [] },
      "englishForm": {                                    // L3E — reached by the §4.9 fallback
        "value": { "formKind": "romanisation", "assembled": false, "text": "Leung Chi-yiu" },
        "status": "resolved",                             // value solidity — NOT "fallback"
        "provenance": "user_glossary",                    // NOT rewritten to "rule_engine"
        "evidenceClass": "E1a", "externalAttestation": "not_attested", "confidence": "high",
        "alternatives": [], "ranked": false, "cautions": [],
        "derivedFrom": { "layer": "L3R",
                         "romanisationRef": { "owner": "entity", "entityId": "e1",
                                               "channel": "romanisation" },
                         "fallbackReason": "no_known_english_form",
                         "directStoreRead": false } } }
  ]
}
```

`projectTranslationDirectives(analysis, { generatedPersonNameStyle: "joined" })` — again shown as an abridged semantic excerpt rather than a complete `TranslationDirectives` value:

```jsonc
{ "styleUsed": "joined",
  "protectedSpans": [
    { "span": [5, 7],  "replacement": "Mong Kok",
      "protection": "strict", "assembled": false, "styleApplied": null },
    { "span": [8, 11], "replacement": "Leung Chi-yiu",
      "protection": "strict", "assembled": false, "styleApplied": null,
      "rationale": "user_supplied_romanisation_via_l3r_fallback" }
  ],
  "termDirectives": [], "unresolvedSemanticSpans": [],
  "diagnostics": [] }
```

**Four things this demonstrates.** (1) Joined mode was requested and *Leung Chi-yiu* was **not** rewritten — because `assembled: false`, and a `VerbatimEnglishForm` has no units for a profile to act on (RULE-API-6). (2) The value kept `provenance: user_glossary` / `E1a` through the fallback rather than being flattened to rule output (RULE-ENT-10, CHG-025). (3) `status` stayed `resolved` while the cross-layer route is recorded only in `derivedFrom.fallbackReason` (RULE-API-3a, CHG-032 item 5). (4) `externalAttestation` distinguishes 旺角 (`attested`, with a gazetteer `sourceRef`) from 梁知遙 (`not_attested` — the question is meaningful and the answer is no), while an L2 reading elsewhere in the same document would carry `not_applicable`.

**Contrast — the assembled case.** With the HK Romanisation store empty, `e1.englishForm.value` would instead be:

```jsonc
{ "formKind": "romanisation", "assembled": true, "person": true,
  "units": [ { "kind": "romanised", "id": "u0", "span": [8,9],
               "text": "leung", "syllable": "loeng4", "generated": false,
               "role": "surname",
               "provenance": "convention_table", "evidenceClass": "E6",
               "externalAttestation": "attested",
               "scopeDowngrade": "class_applied_to_individual" },
             { "kind": "romanised", "id": "u1", "span": [9,10],
               "text": "chi", "syllable": "zi1", "generated": true, "role": "given",
               "provenance": "rule_engine", "evidenceClass": "E7",
               "externalAttestation": "not_attested" },
             { "kind": "romanised", "id": "u2", "span": [10,11],
               "text": "yiu", "syllable": "jiu4", "generated": true, "role": "given",
               "provenance": "rule_engine", "evidenceClass": "E7",
               "externalAttestation": "not_attested" } ],
  "grouping": [[0], [1], [2]],
  "styleApplicable": { "scope": "givenName", "unitIds": ["u1", "u2"] } }
```

with the envelope carrying `status: "fallback"` (the value *itself* was generated) and `confidence: "low"`. **No `text` field exists** until `renderPersonName(form, "joined")` returns *Leung Chiyiu*, or `"hyphenated"` returns *Leung Chi-yiu*. `unitIds` reference `units[].id` — the opaque ids added by CHG-032 item 8.

**Non-person hybrid assembly.** A generated specific plus translated generic is legal without person metadata:

```jsonc
{ "formKind": "hybrid", "assembled": true, "person": false,
  "units": [
    { "kind": "romanised", "id": "u0", "span": [0,1], "text": "nei",
      "syllable": "nei4", "generated": true, "role": "specific",
      "provenance": "rule_engine", "evidenceClass": "E7",
      "externalAttestation": "not_attested" },
    { "kind": "romanised", "id": "u1", "span": [1,2], "text": "tun",
      "syllable": "tyun4", "generated": true, "role": "specific",
      "provenance": "rule_engine", "evidenceClass": "E7",
      "externalAttestation": "not_attested" },
    { "kind": "translated", "id": "u2", "span": [2,3], "text": "Road",
      "role": "generic", "provenance": "convention_table", "evidenceClass": "E3",
      "externalAttestation": "attested" }
  ],
  "grouping": [[0], [1], [2]] }
```

There is no `styleApplicable`: the person-name toggle cannot rewrite *Road* or the generated specific.

**Mixed Western + Chinese personal name.** *Peter Chan Tai-man* uses a literal Western component without pretending it has a Cantonese syllable:

```jsonc
{ "formKind": "hybrid", "assembled": true, "person": true,
  "units": [
    { "kind": "literal", "id": "u0", "span": [0,5], "text": "Peter",
      "role": "western_given", "provenance": "none", "evidenceClass": null,
      "externalAttestation": "not_applicable" },
    { "kind": "romanised", "id": "u1", "span": [6,7], "text": "chan",
      "syllable": "can4", "generated": false, "role": "surname",
      "provenance": "convention_table", "evidenceClass": "E6",
      "externalAttestation": "attested" },
    { "kind": "romanised", "id": "u2", "span": [7,8], "text": "tai",
      "syllable": "daai6", "generated": true, "role": "given",
      "provenance": "rule_engine", "evidenceClass": "E7",
      "externalAttestation": "not_attested" },
    { "kind": "romanised", "id": "u3", "span": [8,9], "text": "man",
      "syllable": "man4", "generated": true, "role": "given",
      "provenance": "rule_engine", "evidenceClass": "E7",
      "externalAttestation": "not_attested" }
  ],
  "grouping": [[0], [1], [2,3]],
  "styleApplicable": { "scope": "givenName", "unitIds": ["u2", "u3"] } }
```

Only `u2`/`u3` change between Hyphenated and Joined. The literal *Peter* and every translated unit are byte-for-byte unchanged under all profiles; *Chan* has identical shared presentation casing in the first four profiles and becomes *CHAN* only under the explicit `surname_caps` exception.

---

## 5.19 Test seeds arising from §5

| ID | Assertion |
|---|---|
| T-API-001 | Every `Value<T>` satisfies the §5.5.1 table: status/value/alternatives/ranked/reason combinations are exhaustively checked |
| T-API-002 | No `Value<T>` with `status: "ambiguous"` has a non-null `value` (RULE-API-3) |
| T-API-003 | Every `conflict` has `ranked: false` and ≥2 alternatives |
| T-API-004 | `renderPersonName(form, p)` returns `form.text` unchanged for every `p` when `assembled === false` (RULE-API-6) |
| T-API-030 | **Directive style is narrow.** `DirectiveSettings.generatedPersonNameStyle`, `TranslationDirectives.styleUsed` and `ProtectedSpan.styleApplied` accept only `"hyphenated"` and `"joined"`; `"spaced"`, `"hyphen_title"` and `"surname_caps"` are rejected by the type and by runtime validation. The Lab's generic `renderPersonName` still accepts the full `StyleProfile` (CHG-042 D) |
| T-API-005 | Re-projecting with a different style performs zero segmentation/detection/reading/romanisation work — asserted by instrumentation counters (RULE-API-7) |
| T-API-006 | `processText` never throws on a fuzz corpus of malformed, empty, lone-surrogate and pathological inputs (RULE-API-8) |
| T-API-007 | `analysisCacheKey` changes when and only when one of the documented key inputs (§5.15) changes; style and projection settings never change it |
| T-API-008 | A consumer stub that rejects unknown enum values fails; the reference consumer tolerating them passes (RULE-API-9) |
| T-API-009 | For 彌敦道, `entity.romanisation.value` and `entity.englishForm.value` are non-null and independently populated. Exercise both legal L3R branches: (a) an assembled mechanical Romanisation has no `text` and is displayed through `renderRomanisation`; (b) an exact whole-form HK-Romanisation glossary result is verbatim and preserves its exact `text`. L3E remains independently selected as verbatim *Nathan Road*. In both cases the resulting L3R display differs from the L3E display, and rendering either channel neither mutates nor overwrites the other (DEC-…-001; RULE-API-10; CHG-044 G) |
| T-API-010 | Supplying `documentContext` changes `optionsHash`; omitting it leaves no cross-call state (CHG-029) |
| T-API-011 | A `Lexicon` reporting `frequencies:false` makes `createEngine` return `ok:true` with a live Engine and immediate `EngineCreationSuccess.diagnostics` containing `LEXICON_MISSING_CAPABILITY`, before any `processText`; the diagnostic is not re-emitted into `Analysis.diagnostics` |
| T-API-012 | `termDirectives` never overlap `protectedSpans`. Each dropped selected directive is absent and yields exactly one `TERM_DIRECTIVE_DROPPED_OVERLAP` in `TranslationDirectives.diagnostics` with `span` equal to the dropped directive; one directive overlapping multiple protected spans still yields one diagnostic. With no overlap the projection diagnostic array is empty; unrelated `Analysis.diagnostics` is not copied, Analysis remains byte-identical, and repeat projection yields byte-identical order/content |
| T-API-013 | Serialising the same Analysis twice yields byte-identical output with stable key order (INV-7) |
| T-API-014 | A user-glossary romanisation reaching `englishForm` via §4.9 has `status: "resolved"` **and** `derivedFrom.fallbackReason` set — route and solidity are independent (RULE-API-3a) |
| T-API-015 | A rule-generated romanisation has `status: "fallback"` **whether or not** it was consumed cross-layer (RULE-API-3a) |
| T-API-016 | No `VerbatimRomanisation`/`VerbatimEnglishForm` has `units`; no assembled form has `text` or `styleVariants` (RULE-API-10) |
| T-API-017 | No `Analysis` anywhere contains a rendered style variant; `renderVariants` is the only producer of them (CHG-032 item 2) |
| T-API-018 | Changing `protectionConfidenceFloor` changes `TranslationDirectives` but leaves `Analysis` and `analysisCacheKey` byte-identical (RULE-API-11) |
| T-API-019 | Every `ambiguous` and `conflict` candidate carries its own `provenance` and `evidenceClass`; the Lab renders both explanations without a second engine call (CHG-032 item 4) |
| T-API-020 | **Ambiguous surname romanisation** (蔡): `status: "ambiguous"`, `ranked: true`, ≥2 candidates, each with `evidenceClass: "E6"`, `externalAttestation: "attested"`, and `attestationCount` where available |
| T-API-021 | **Equal-authority conflict** (two enabled E1a glossary entries on one key): `status: "conflict"`, `ranked: false`, both candidates carry `provenance: "user_glossary"` and `evidenceClass: "E1a"`, and no rank |
| T-API-022 | Every L2 reading and every pronunciation StoreEntry has `externalAttestation:"not_applicable"` for E1a–E2; documentary E2 still carries required `attestation` (CHG-044 C2) |
| T-API-023 | A consumer fed an unknown enum value preserves the raw string and does **not** emit a known member in its place; behaving conservatively is accepted, rewriting is a failure (RULE-API-9) |
| T-API-024 | `AnnotationRef` accepts exactly one owner and only owner-legal channels; every `derivedFrom.romanisationRef` has exactly one owner, channel exactly `romanisation`, and resolves within the current Analysis without string parsing (CHG-044 E) |
| T-API-025 | **An `evidenceClass:"E2"` StoreEntry does not validate without documentary `Attestation` carrying `scope`, `sourceRef` and `asOf`, including in L2/L4 where `externalAttestation` is `not_applicable`**; the rejected entry is disabled with errors, never downgraded or silently accepted (RULE-API-12) |
| T-API-027 | **No v1 producer emits `provenance: "entity_record"`.** Over the whole corpus, zero values carry it; the value remains legal in the union for forward compatibility (CHG-040 B) |
| T-API-028 | **`DocumentContext` closure — semantic, not key-name-based.** Recursive walk of `DocumentContext.entities[]` contains no source span, Analysis-local entity/token/unit/region id, alignment group or previous-Analysis reference; every memory English `styleApplicable` uses local unit indices and references only generated romanised given-name units. `DocumentContext.id` and `EntityMemoryEntry.ref` remain permitted context identities (RULE-API-21, CHG-044 B/J) |
| T-API-029 | **Memory-channel legality.** Every present memory channel has a non-null `value` and `status ∈ {resolved, fallback}`; no `ambiguous`, `conflict`, `unresolved`, `unsupported` or `out_of_scope` channel exists (RULE-API-22) |
| T-API-026 | Store applicability matrix is exhaustive: L2 and L4 are `not_applicable` for E1a–E2; L3R/entity-L3E are E1a/E1b `not_attested`, E1c/E2 `attested`; E1a/E1b have null documentary attestation, E1c may carry it, E2 requires it (RULE-API-12) |
| T-API-031 | Translation/entity StoreEntry requires one of all five `FormKind` values and resolves its exact string as `assembled:false`; `formKind` is rejected on every other store/scope and no StoreEntry carries units (CHG-044 A) |
| T-API-032 | Assembled L3E admits person/non-person `romanisation`/`hybrid` states with romanised/literal/translated units; only romanised units have `syllable`; assembled official/native/pure-translation branches are rejected (CHG-044 B) |
| T-API-033 | Mixed *Peter Chan Tai-man* is representable; style references only generated romanised given units. Peter and translated units remain byte-identical; Chan is identical across the first four profiles and changes only under `surname_caps`. The span/id-free memory equivalent uses local indices (RC-4, CHG-044 B/CHG-050) |
| T-API-034 | `StoreEvidenceClass` rejects E3–E7. An E3–E7 JSON import appears as invalid in preview; an all-invalid apply returns `writesApplied:false`, writes no StoreEntry and never enables one (CHG-044 C1) |
| T-API-035 | Required `caseSensitive` survives create/update/export/import round-trip; creation defaults false; false/true Latin matching is insensitive/exact respectively, and key spelling never infers the field (CHG-044 I) |
| T-API-036 | Every grouped syllable belongs to exactly one ordered/non-overlapping `GroupedAlignment`; no non-grouped syllable belongs, multiple groups work, and indices are local/in-range (CHG-044 J) |
| T-API-037 | Two equal-authority applicable L4 entries produce one conflict `TermResolution` with null value, `ranked:false` and entry-bearing evidence candidates; projection emits no `TermDirective` until resolved (CHG-044 H) |
| T-API-038 | Two Entity channels can inherit from different antecedents while a third remains local; every selected inherited Value/Candidate carries its own resolvable `InheritanceRef`, and every selected non-inherited one forbids it (CHG-044 K) |
| T-API-039 | `UnresolvedSemanticSpan` copies source status: unresolved/unsupported require and preserve `reason`; ambiguous/conflict carry no reason and never fabricate one (CHG-044 L) |
| T-API-040 | Canonical integers accept only exact one-key `__int` sentinels with canonical signed-int64 decimal/range; ordinary objects reject `__int`; no value matches both branches (CHG-044 F) |
| T-API-041 | Every live v1 §5 declaration closes under strict TypeScript and serialisable schema: no undeclared type, implicit/placeholder `any`, `ContractGap`, live ellipsis or duplicate alias; §5.10.4 remains excluded as deferred/non-v1 (CHG-044 D/M) |
| T-API-042 | **Diagnostic ownership.** Creation/configuration, analysis/content and directive-projection diagnostics are observable only through `EngineCreationResult.diagnostics`, `Analysis.diagnostics` and `TranslationDirectives.diagnostics` respectively; none is silently copied or merged, and live-provider orchestration diagnostics remain outside the core (CHG-045 A/B) |
| T-API-043 | **Engine creation union.** Clean creation is `ok:true` + live Engine + `[]`; degraded lexicon creation is `ok:true` + live Engine + immediate warning; duplicate snapshot `inputHash` and out-of-domain `CanonicalValue` each return `ok:false`, `engine:null`, a non-empty tuple including `PROVIDER_SNAPSHOT_INVALID`, and do not throw. Illegal `ok`/engine/diagnostics combinations are rejected. A RULE-API-20 identity mismatch takes the same failure route once Range 0B implements that check (CHG-045 B) |
| T-API-044 | A valid enabled contextual translation entry with `context.documentTag:"legal"` is applicable when `ProcessOptions.documentTags` contains exact tag `"legal"` |
| T-API-045 | The same entry is inapplicable when the tag is absent; case-only `"Legal"` does not match `"legal"` |
| T-API-046 | Omitted `documentTags` and `documentTags:[]` both make every document-tag-constrained entry inapplicable |
| T-API-047 | `documentTags:["legal","court","legal"]` and `["court","legal"]` both normalise to `["court","legal"]` for the ProcessOptions preimage; exact duplicates/order add no semantics |
| T-API-048 | Changing the unique tag set from `["court","legal"]` to `["legal"]` changes the normalised ProcessOptions preimage; this is a Range 0A preimage test, not a hash-digest test |
| T-API-049 | `DocumentContext.id:"legal"` with omitted `documentTags` does not satisfy `StoreMatchContext.documentTag:"legal"`; neither input is derived from the other |
| T-CACHE-031 | `sourceHash` uses exactly `SHA-256(canonicalEncode(["hklang.sourceHash", keyFormatVersion, source]))`, including UTF-16 code units and lone surrogates; no schema/contract field, JSON, UTF-8 or raw-digest alternative is accepted |
| T-CACHE-032 | Omitted `ProcessOptions` defaults and explicit defaults produce the same `optionsHash` preimage; `documentContextSlot`, exact deduped/UTF-16-sorted `documentTags`, the two reading policies, the phonetic flag and `[debugLattice,debugTrace]` occupy the exact CHG-046 positions |
| T-CACHE-033 | `analysisCacheKey` is exactly the twelve-element tagged array in §5.15: key-format version follows the domain tag; all version axes, semantic `userDataVersion`, nullable snapshot id and lower-case hex `optionsHash`/`sourceHash` strings are present in order; styles and projections are absent |
| T-CACHE-034 | Domain separation and version placement are byte-observable: distinct public identities use distinct fixed tags, every tag is element 0, every `keyFormatVersion` is element 1, and changing the format version changes the complete SHA-256 digest; the existing `DocumentContext`/`ProviderSnapshot` tags remain unchanged |
| T-API-050 | `userDataVersion` starts at exactly `0` for a newly created Store-set namespace and every public surface accepts only exact integers in the inclusive domain `0..9007199254740991`; `-1`, `0.5`, `9007199254740992`, `NaN` and `Infinity` are rejected at untyped boundaries |
| T-API-051 | Legal `userDataVersion` values include `0`, `1`, `9007199254740990` and `9007199254740991`; no public occurrence widens the domain to arbitrary JavaScript numbers or to the complete signed-int64 range |
| T-API-052 | One successfully committed mutating StoreApi operation increments the single global counter exactly once; a multi-row import increments once (transaction-counted); create/update/remove/enable-disable are covered; reads/search/list/get/export, preview, `writesApplied:false`, no-op, failed and rolled-back operations do not increment |
| T-API-053 | At `userDataVersion = 9007199254740991`, an attempted mutating operation fails atomically before any Store record, revision, timestamp or version change; no wrap, saturation, silent same-version write or rollover is permitted, and the failure is operational rather than a public DiagnosticCode |
| T-API-054 | `Versions.userDataVersion`, `StoreApi.version()`, `ImportResult.userDataVersion`, JSON Schema and every §1/§4/§5/§6/§7/§10/§11/§12 occurrence impose the same exact integer domain and initial/lifecycle rules |
| T-API-055 | **Strict grouping closure (CHG-048/050).** On all four grouping-bearing surfaces — both assembled form types and both `assembled:true` memory branches — `units`, `grouping` and each inner group are non-empty and `flatten(grouping)` equals exactly `[0…units.length-1]`; the verbatim memory branches retain exact `text` and have no grouping. Reject empty arrays/groups, omissions, duplicates, overlaps, reordering, fractional/negative/non-finite/unsafe/out-of-range indices, and any attempted repair/default; accept both `[[0],[1],[2]]` and `[[0,1,2]]` for three units |
| T-API-056 | **Grouping composition.** Inside each group concatenate unit text with no separator; between consecutive groups emit exactly U+0020; preserve units-array order and every UTF-16 code unit without normalisation. With `[[0],[1],[2]]`, the §2.2.4 unit texts compose first to exact `tsim sha tsui`, then `CasingProfile:title` renders `Tsim Sha Tsui`; the §5.18 unit texts compose first to exact `nei tun Road`, then assembled-English shared presentation casing renders `Nei Tun Road` under every style profile |
| T-API-057 | **Schema/validator parity.** Generated schema enforces non-empty units/grouping/inner groups and non-negative integer members on every affected branch; executable validation enforces the exact flattened sequence, range, and unique/increasing style references for both Analysis and DocumentContext memory forms |
| T-API-058 | **Five-profile total mapping.** For `leung`/`chi`/`yiu`, assert exactly: `hyphenated → Leung Chi-yiu`; `joined → Leung Chiyiu`; `spaced → Leung Chi Yiu`; `hyphen_title → Leung Chi-Yiu`; `surname_caps → LEUNG Chi-yiu` |
| T-API-059 | **Licensed runs and boundary.** References are non-empty, unique, resolvable and strictly increasing by unit position. With singleton groups and licensed positions `[1,3,4]`, `leung/chi/lok/tai/man` forms separate runs `[1]` and `[3,4]`: Hyphenated is exactly `Leung Chi Lok Tai-man`, Joined exactly `Leung Chi Lok Taiman`; neither crosses unlicensed `lok`. With `chan/tai`, grouping `[[0,1]]` and licensed `[1]`, the forced surname/given boundary yields `Chan Tai` (or `CHAN Tai` under `surname_caps`) |
| T-API-060 | **Branch and content invariance.** Every `VerbatimEnglishForm` is exact under all five profiles. Non-person `nei/tun/Road` with singleton groups is exactly `Nei Tun Road` under all five. Unstyled `chan/tai` is `Chan Tai` under the first four and `CHAN Tai` under `surname_caps`. Mixed singleton-group units literal `Peter`, romanised surname `chan`, licensed given `tai/man`, translated `Road` yield exactly `Peter Chan Tai-man Road`, `Peter Chan Taiman Road`, `Peter Chan Tai Man Road`, `Peter Chan Tai-Man Road`, `Peter CHAN Tai-man Road`; literal/translated text and unit order never change |
| T-API-061 | **All casing profiles.** For units `tSIM`,`sHA`,`tSUI` grouped `[[0],[1],[2]]`, assert `lower: tsim sha tsui`, `upper: TSIM SHA TSUI`, `sentence: Tsim sha tsui`, `title: Tsim Sha Tsui`; grouped `[[0,1],[2]]` yields `tsimsha tsui`, `TSIMSHA TSUI`, `Tsimsha tsui`, `Tsimsha Tsui`. Punctuation, non-ASCII code units and lone surrogates remain unchanged |
| T-API-062 | **Verbatim Romanisation invariance.** A `VerbatimRomanisation` containing mixed ASCII case, punctuation, non-ASCII and a lone surrogate returns its exact `text` for every `CasingProfile` |
| T-API-063 | **`renderVariants` ordered map.** `[]` returns `[]`; `["joined","joined","hyphenated"]` returns three entries in that exact order with both duplicate Joined results retained; there is no default, sort or deduplication |
| T-API-064 | **Cross-runtime determinism.** Two independent conforming runtimes produce identical ordered UTF-16 code-unit sequences and identical bytes when each result string is encoded by the existing §5.15.2 length-prefixed UTF-16BE string rule, for every CHG-050 grouping, style, casing, verbatim, mixed-content and `renderVariants` vector. This reuses and does not alter the canonical encoder |
| T-CACHE-035 | A legal `userDataVersion` in `analysisCacheKey` is consumed as the exact mathematical integer and canonical-encoded as semantic signed-int64 (`0x04` + eight-byte two's-complement big-endian), never as IEEE-754 bytes, decimal text or a `CanonicalValue` wrapper; CHG-046's formula is otherwise byte-for-byte unchanged |
| T-CACHE-036 | `analysisCacheKey` differs when only the validated `userDataVersion` value differs, while all other twelve-element CHG-046 preimage positions remain identical |

---

## 5.20 Decisions settled and raised

**Settled here:**

| ID | Resolution |
|---|---|
| DEC-…-001 | **Named sibling fields** `romanisation` (L3R) and `englishForm` (L3E). §5.7.1 |
| DEC-…-003 | `offsetUnit: "utf16"`, declared on every Analysis |
| DEC-…-004 | Structured `Syllable` with `jyutping` canonical string |
| DEC-…-005 | Nesting allowed, partial overlap forbidden, one `primary` per position (INV-16) |
| DEC-…-016 | **`@hklang/style`, pure, depends on core only.** §5.11 |
| DEC-…-023 | Lattice behind `options.debug.lattice`; reduced by default |
| DEC-…-025 | `documentContext` optional in v1; ambient memory excluded |

**Raised here:**

| ID | Question | Recommended | Confidence | Blocking? |
|---|---|---|---|---|
| DEC-LANG-20260828-032 | Is `processText` synchronous, or async to allow `ExternalProvider`? | **SETTLED for v1 (CHG-040 E, propagated CHG-041).** The v1 core is **synchronous**; an async host/worker/orchestration wrapper may exist outside it, and provider acquisition happens there. A public signature cannot be simultaneously frozen and unresolved. A future async core is a new contract decision | High | Settled |
| DEC-LANG-20260828-033 | Is `Analysis` cached per window or per whole input? | **Both**, with window results composing into an input result | Medium | No — §10 |
| DEC-LANG-20260828-034 | Do convenience views (§5.10.4) ship in v1, or only `processText`? | **Only `processText` in v1.** Convenience views invite the misuse RULE-API-5 warns about; add them when a real consumer asks | Medium | No |
| DEC-LANG-20260828-036 | What stability do generated ids (including `RomanisationUnit.id`) carry? | deterministic / persistent / both | **CORRECTED (CHG-037 D), superseding the earlier "within one Analysis" wording, which conflicted with RULE-API-13.** An identical full input tuple ⇒ **deterministic identical ids** (INV-7 requires it). Ids remain **opaque and non-persistent** across any changed Analysis identity, and consumers must never use them as durable identifiers | High | Settled |
| DEC-LANG-20260828-035 | Should `Analysis` carry the source string, or only its hash? | **Carry it.** It is what makes INV-1 checkable by a consumer and makes an Analysis self-contained for the Lab and for regression fixtures. Revisit only if payload size becomes a measured problem | Medium-high | No |

---

## 5.21 Known limitations of §5

1. **The fresh Range 0A audit against `5.0.10` executed and its fail-closed contract gate correctly remained BLOCKED.** Its strict TypeScript graph and generated schema closed, all 86/86 applicable tests passed, and R0A-DEF-001…014 all remained **CLOSED**. It nevertheless found three blocking representability defects, R0A-510-DEF-001…003, and one non-blocking branch-invalid prose/test residue, R0A-510-DEF-004. Those artefacts are authoritative implementation evidence against `5.0.10` and remain unchanged.
2. **Historical Stage-0 and accepted S2-P1–P5 evidence remains unchanged.** CHG-046–049 and their downstream packages are retained as evidence against their declared contract versions. CHG-050 changes the current authority to `5.0.16`, closes only the style-rendering semantic defect, and does not claim those prior artefacts automatically prove the corrected contract. The next gates are the affected Stage-0 schema/validator rematerialisation and regression, bounded P1 fingerprint/cache-vector regression, independent P2–P5 impact rebase, and independent control. S2-P6 may restart from the beginning only after those gates pass.
3. **Payload size is unmeasured.** Carrying source, tokens, syllables, assembly units, alternatives, L4 resolutions and traces for a long document may be large. DEC-…-035 assumes it is affordable; §10 must measure it.
4. **DEC-…-017 remains unresolved.** The public `Lattice` is intentionally algorithm-neutral and contains only the stable source-bound edges and alternative paths downstream code needs; it does not settle segmenter selection.
5. **The contract has not been reconciled with the real Reader.** RC-1…RC-4 shape §5.12 and §5.11, but whether the Reader's existing interfaces accept this shape is answerable only by a separately authorised agent with Reader access.
6. **Two bounded non-blocking scope residues remain genuinely underspecified rather than contradictory.** The common `StoreMatchContext` shape permits `documentTag` on any StoreEntry while §4.7.2 names document-tag filtering only for the translation store; CHG-045 makes any present condition reachable but does not silently broaden or narrow which store editors/producers should offer it. Separately, the current creation contract defines semantic outcomes for lexicon capability and ProviderSnapshot validation, but does not invent validation algorithms or a generic diagnostic code for hypothetical additional `EngineConfig` semantic checks. Any future such check requires an explicit contract rule and code rather than overloading `PROVIDER_SNAPSHOT_INVALID`.

**SECTION COMPLETE — §5 Engine Architecture + Public API/Data Contract**

---

# §6 — Test Corpus and Correctness Strategy

**Purpose.** Build the evaluation substrate that §8's dependency choices and the eventual implementation will run against. §6 does not choose a segmenter, a lexicon or a provider; it builds the material and the metrics by which those choices become answerable on evidence rather than preference.

**Framing.** The contract's first frozen revision contained nine internal contradictions that only careful reading found (CHG-032), and later control gates found further byte-identity and grouping defects. CHG-050 closes the style-rendering semantics in `5.0.16` and adds T-API-055…064 plus G28…G35 as materialisation obligations; it executes none of them. The canonical encoder and cache-key field membership are unchanged. That is the argument for §6: a suite is how the next defect is found. But a suite that manufactures answers for genuinely variable Hong Kong name spellings would be worse than none — it would encode this session's guesses as ground truth and then measure the engine's agreement with them. §6's central discipline is therefore **knowing which questions have gold answers and which do not**.

---

## 6.1 Three kinds of "expected" — the foundational distinction

**RULE-TEST-1 (RECOMMENDED, amended by CHG-033).** Every fixture declares **two independent** fields. Conflating them was an error in v0.1: what kind of truth is available is a fact about the world; whether a mismatch fails CI is a decision about the project.

| Field | Question it answers |
|---|---|
| `goldStatus` | **What kind of truth is available for this fixture?** |
| `testRole` | **What is this fixture for, and what happens on a mismatch?** |

| `goldStatus` | Meaning | Failure semantics | Enters which metrics |
|---|---|---|---|
| `determinate` | A single correct answer exists and is known to the project, with a source | Mismatch = **engine bug** | exact-match metrics |
| `ambiguous_by_nature` | Several answers are legitimately correct; the world has no single answer (蔡 → Choi/Choy) | Producing **one** answer is the bug. Expected result is a *candidate set* and a *status* | ambiguity calibration; **excluded** from exact-match |
| `unknown_to_us` | A single correct answer exists in the world but the project does not have it (a private individual's registered spelling) | **Not scorable.** Present for behaviour observation only | none — reported, never scored |

### 6.1.1 `testRole` (CHG-033 item 1)

| `testRole` | Meaning | Mismatch behaviour |
|---|---|---|
| `conformance` | A normative behaviour the implementation **must** satisfy | **Test failure.** Gates CI |
| `benchmark` | Gold is known, but an imperfect candidate implementation is being *measured* against it | Contributes to a metric. Does **not** by itself fail the suite |
| `observation` | Not scorable; present to observe behaviour | Never fails, never scored |

Typical `conformance` fixtures: schema invariants, source reconstruction, no surrogate splitting, store independence, verbatim forms never restyled, and deterministic Jyutping facts backed by sufficiently strong gold.

Typical `benchmark` fixtures: Family H segmentation, reading accuracy, entity precision/recall, generator held-out accuracy.

**The two fields are orthogonal.** A fixture may be `goldStatus: determinate` + `testRole: benchmark` without contradiction — a gazetteer name has a single correct English form (determinate truth) while a generator that has never seen it is being *measured*, not gated. The v0.1 claim that "every determinate mismatch is an engine bug" is withdrawn.

**RULE-TEST-1a (RECOMMENDED) — gold strength required for hard gating.** A fixture may carry `testRole: conformance` only if its gold reaches `goldConfidence: high` with a citable source. A `common_knowledge` fixture at `goldConfidence: medium` runs as `benchmark` until it is re-sourced; promotion to `conformance` requires the source, not a judgement that the fact is obvious. This prevents the suite from hard-gating on this session's recollection.

### 6.1.2 `unknown_to_us`, refined (CHG-033 item 2)

`unknown_to_us` does **not** assert that exactly one correct answer exists in the world. It asserts only:

> The project does not have sufficient evidence to specify the complete scorable answer **or the legitimate answer set**.

A private person's name may have one documented form, or several simultaneously legitimate ones; the fixture takes no position on which. Promotion is therefore two-way and evidence-driven:

| Evidence obtained | Promote to |
|---|---|
| The fixture's target is uniquely established | `determinate` |
| Several legitimate answers are established | `ambiguous_by_nature` |
| — | **Never promoted by project decision** |

Omitting this class is how a project starts scoring its own ignorance as the engine's failure; mis-defining it as "one answer exists, we just don't know it" is how a project later manufactures that answer.

**RULE-TEST-2 (RECOMMENDED) — no manufactured gold.** No fixture may assert a Hong Kong personal-name spelling as `determinate` without E1–E4 evidence (§2.3.1). Place and street names may be `determinate` on E3 gazetteer evidence. Surname *class* conventions are `ambiguous_by_nature` wherever more than one form is attested — the packet's own §2.4.2 table is a list of such cases, not a list of answers.

---

## 6.2 Gold-data provenance

**RULE-TEST-3 (RECOMMENDED).** Every externally sourced expected value records where it came from and, where relevant, when.

```yaml
provenance:
  origin: lands_dept_gazetteer | ccli_pronunciation_list | institutional_official
        | legco_reply | linguistic_reference | common_knowledge | user_supplied | derived
  sourceRef: "landsd-geographic-name/2026-08"     # dataset, URL, or record id
  asOf: "2026-08-01"
  retrievedAt: "2026-08-28"
  goldConfidence: high | medium | low
```

`origin: common_knowledge` is permitted for uncontroversial linguistic facts (行 in 銀行 is `hong4`) but is capped at `goldConfidence: medium` and must be re-sourced before any published accuracy figure cites it. `origin: derived` marks values induced by the §2.7 fitting procedure — these may **never** be used to evaluate the generator that produced them, and the runner enforces the separation (§6.9).

**Snapshot discipline.** Government datasets change and are withdrawn (§0.5). Gold data is committed as a **snapshot with its `asOf`**, never fetched at test time. A test suite that hits a live endpoint is not a regression suite.

---

## 6.3 Fixture format

One format for all families; assertion *mode* varies rather than shape.

```yaml
id: T-HKR-020
family: romanisation
goldStatus: ambiguous_by_nature
source: "蔡"
context: { entityType: person.surname }
stores: []                       # fixture-local store state; empty = clean engine
options: {}                      # ProcessOptions
directiveSettings: null          # set only for translation-consumer fixtures
expect:
  mode: candidates               # exact | candidates | status_only | forbidden | invariant
  path: "entities[0].romanisation"
  status: ambiguous
  ranked: true
  candidates:
    - value: "Choi"
      evidenceClass: E6
      externalAttestation: attested
    - value: "Choy"
      evidenceClass: E6
      externalAttestation: attested
  minCandidates: 2
provenance: { origin: linguistic_reference, goldConfidence: medium }
notes: "Both forms are attested. Producing a single answer is the failure."
```

**Assertion modes.**

| Mode | Asserts | Used by |
|---|---|---|
| `exact` | A full subtree matches exactly | determinate fixtures |
| `candidates` | Status, `ranked`, and that the candidate *set* contains/equals the expected values — order-checked only when `ranked: true` and an order is justified | ambiguity fixtures |
| `status_only` | Only the status and (optionally) provenance/evidence class | `unknown_to_us` behaviour fixtures |
| `forbidden` | Something must **not** appear — no entity at this span, no protected span, no value | adversarial fixtures |
| `invariant` | A named §1–§5 invariant holds | property tests |

`forbidden` is not a convenience: several of the most important requirements in this packet are negative (RULE-ENT-5, RULE-API-3, RULE-HKR-13), and a suite that can only assert presence cannot test them.

---

## 6.4 Family A — gold deterministic fixtures

**Scope.** Cases where the answer is genuinely determinate: token partition, spans, well-established readings, gazetteer-attested names, schema shapes.

| Group | Content | Target size | Gold source |
|---|---|---|---|
| A1 Tokenisation | script transitions, punctuation, whitespace, full-width forms, emoji, non-BMP | 80 | derived from Unicode properties (`determinate`) |
| A2 Word-disambiguated readings | 銀行/行路/行為, 快樂/音樂, 睡覺/覺得, 重要/重複, 好人/好奇, 空氣/有空, 長度/校長 | 120 | linguistic reference / CCLI list |
| A3 Character readings | high-frequency characters incl. syllabic nasals 吳 `ng4`, 唔 `m4` | 150 | CCLI *Cantonese Pronunciation List* (LSHK scheme) |
| A4 Attested place/street names | whole-span gazetteer hits: 尖沙咀, 荃灣, 深水埗, 石硤尾, 元朗, 觀塘 | 200–400 | **Lands Dept place-name data**, snapshot + `asOf` |
| A5 Irregulars | 九龍, 香港, 旺角, 紅磡, 恆安, 美孚, 粉嶺 | 30 | gazetteer + [LegCo 2019 reply](https://www.info.gov.hk/gia/general/201905/29/P2019052900354p.htm) for policy |
| A6 Official English names | 香港大學, 銅鑼灣 → Causeway Bay, 佐敦 → Jordan | 60 | institutional official sources; gazetteer |
| A7 Document-tag context | Valid enabled lexical translation entry 樓面 → *floor area*, `match:contextual`, `context.documentTag:"legal"`, E1a / `not_applicable`; present, absent, omitted, case-only, duplicate/reordered tags and `DocumentContext.id:"legal"` | 6 contract fixtures | derived from §5.9/§5.10; T-API-044…049 |

**A4 is the backbone of the whole suite** — it is the only large body of genuinely gold Chinese↔English name pairs the project can obtain. It also supplies §2.7's fitting corpus, which creates the leakage hazard §6.9 addresses.

---

## 6.5 Family B — ambiguity fixtures

**Scope.** Cases where producing one answer is the failure. Expected output is a candidate set plus a status.

| Group | Content | Expected |
|---|---|---|
| B1 Surname conventions | 蔡 Choi/Choy/Tsoi · 周 Chow/Chau · 徐 Tsui/Chui · 葉 Yip/Ip | `ambiguous`, `ranked: true`, ≥2 candidates each with E6 evidence |
| B2 Sibilant class unknown | characters absent from the fitted table | `ambiguous`, both Ts-/Ch- or S-/Sh-, `caution: sibilant_class_unknown` |
| B3 Polyphones below threshold | characters whose dominant reading share < θ_read | `ambiguous`, all readings, ranked by frequency |
| B4 Register variation 文白異讀 | literary/colloquial doublets | `resolved` to the register default **with** the other retained, `variation: register` |
| B5 Sociophonetic | 你 `nei5`~`lei5`, 我 `ngo5`~`o5`, 國 `gwok3`~`gok3` | **`resolved`** — `variation: sociophonetic` must **not** block resolution |
| B6 Simplified fold | 干 → 干/乾/幹 (readings differ) vs 台 → 台/臺 (coincide) | `ambiguous` for the first, `resolved` for the second (RULE-JP-10) |
| B7 Equal-authority conflict | two enabled E1a entries on one key | `conflict`, `ranked: false`, no value |
| B8 Number reading | 2019 | `unresolved`, `reason: number_reading_requires_context`, ≥2 candidates |
| B9 Name parse ambiguity | 4-character name parseable 2+2 and 1+3 | `ambiguous`, both parses in `parseAlternatives` |

B4 and B5 exist as a matched pair because the commonest way to get variation wrong is to treat all of it alike: register variation is a real choice the engine should surface, sociophonetic variation is not an error and must not clutter output.

---

## 6.6 Family C — adversarial entity fixtures

**Scope.** Everything designed to make entity detection fail loudly rather than quietly. These are the highest-value fixtures in the suite, because entity false positives escape into translation output (§4.11.1).

| Group | Content | Mode | Asserts |
|---|---|---|---|
| C1 False surnames | 李 as "plum", 黃 as "yellow", 周 as "week", 王 as "king", 石 as "stone" — in ordinary prose with **no** corroborating signal | `forbidden` | no person entity; no protected span (RULE-ENT-5) |
| C2 Gated true positives | the same characters **with** a title, naming verb, or list context | `exact`/`status_only` | detected at `low`; protection governed by the floor |
| C3 Nesting | 香港 in 香港大學; 大埔 in 大埔道; 中環 in 中環街市 | `exact` | both retained, one `primary`, `containedBy` set (INV-16) |
| C4 Partial overlap | competing spans of comparable evidence | `forbidden` + `status_only` | no `primary`; `boundaryAmbiguous`; **L3R still produced** |
| C5 Foreign transliterations | 卡爾·馬克思 (interpunct) and one without an interpunct | `status_only` | `person.foreign`, `prefer_original_recovery`, no auto-asserted English name |
| C6 CJK non-Chinese | 田中, Korean-pattern names | `status_only` | `caution: cjk_non_chinese_suspected` |
| C7 Compound surnames | 歐陽鋒, 司徒美堂, 諸葛 | `exact` | 2+1 / 2+2 parse; compound table consulted first (RULE-ENT-7) |
| C8 Titles excluded | 王先生, 陳博士, 李局長 | `exact` | entity span excludes the title; title present in `detectionEvidence` |
| C9 Creator-canonical vs generated | 梁知遙 with and without an entity-scoped E1b entry | `exact` | verbatim vs assembled shapes; `assembled` flag correct |
| C10 Scope gating | `lexical`-scoped entries for 行, 好, 樓面 in all three stores | `forbidden` | **no entity candidate from any of them** (RULE-ENT-4, CHG-023) |

C1 and C10 are the two fixtures that would have caught the packet's own errors before they were corrected. They stay in the suite permanently as regressions against the class of mistake, not merely the instances.

---

## 6.7 Family D — written-Cantonese coverage

| Group | Content | Target |
|---|---|---|
| D1 Colloquial particles and verbs | 嘅 咗 喺 冇 唔 佢 哋 嘢 睇 啲 嗰 乜 嚟 曬 諗 攰 嬲 孭 冚 | 60 characters + 60 in-sentence uses |
| D2 Non-BMP / HKSCS | 𨋢 `lip1`, 𡃁 `leng1`, 𠮶 `go2`, 𩠐 `tau4`, in isolation and mid-sentence | 40 |
| D3 Marginal finals | `eu` 掉, `em` 舐, `ep` 夾, `et` — validator regression | 20 |
| D4 Mixed script | 我today好busy, code-switching without spaces, full-width Latin/digits, acronyms | 50 |
| D5 Variant characters | 裡/裏, 為/爲, 群/羣, 峰/峯, 台/臺 | 30 |
| D6 Simplified fold | reading-differing and reading-coinciding folds (pairs with B6) | 25 |
| D7 Colloquial constructions | 咗/緊/晒 aspect marking, 有冇, 係咪 — segmentation stress | 60 sentences |

**D7 is the segmenter's real test.** D1 checks that characters have readings; D7 checks that a segmenter trained on Standard Written Chinese does not mangle 我食咗飯未 into nonsense. §8's comparison lives or dies on D7, not on D1.

---

## 6.8 Family E — romanisation evaluation

| Group | Content | `goldStatus` | Metric |
|---|---|---|---|
| E1 Whole-name attested lookup | held-out gazetteer pairs | `determinate` | whole-entity exact match |
| E2 Generator-only | Han strings **absent** from the convention table | `determinate` only where the rule pack's output is definitionally checkable; otherwise `unknown_to_us` | generator conformance to the declared rule pack |
| E3 ts/ch and s/sh split | 荔枝角/慈雲山, 沙田/西貢, 筲箕灣/秀茂坪, 上水/深水埗 | `determinate` (attested) | **sibilant sub-accuracy — reported separately** |
| E4 Irregulars | 九龍, 香港, 旺角 | `determinate` | irregular-table hit rate; rules must **not** be allowed to "win" |
| E5 Surname ambiguity | pairs with B1 | `ambiguous_by_nature` | ambiguity calibration |
| E6 Style and casing projection | assembled person names under all five `StyleProfile` members; assembled Romanisation under all four `CasingProfile` members; verbatim, non-person, unstyled-person, mixed-content, one-run and separated-run fixtures | `determinate` | exact CHG-050 rendering, grouping, casing and verbatim invariance |
| E7 Spelling collisions | Yau ← 邱/尤/游/丘 · Shum ← 岑/沈 · Ng ← 吳/伍 · Lam ← 林/藍 · Au ← 歐/區 | `determinate` (the collision is the fact) | asserts NC-1: no reverse mapping is offered |

**E3 is reported as its own headline number.** §2.2.2 predicts it will be the generator's worst component; a single blended accuracy figure would hide exactly the weakness the packet identified. If the blended number looks good while E3 is poor, the suite has failed at its job.

---

## 6.9 Leakage control — two different evaluations (CHG-033 item 3)

The §2.7 fitting procedure induces the convention table **from** the gazetteer. v0.1 had one hash split, which was necessary but not sufficient: it prevented fitting on eval rows, but did not stop the eval run from simply *looking the name up*. Two distinct evaluations are needed, and conflating them reports lookup coverage as generator accuracy.

**The split (retained).** The gazetteer snapshot is partitioned once, by a committed deterministic hash of the Chinese name, into `fit` (≈80%) and `eval` (≈20%). The split is a committed artefact, never recomputed. Every result records the split id, the partition sizes and **which evaluation mode produced it**.

### 6.9.A Attested-lookup evaluation

**Question:** *can the packaged convention/gazetteer layer retrieve the official or attested form?*

This is a coverage and ingestion test, not a generalisation test. It **may use the complete relevant official snapshot**, because retrieval is exactly what is being measured. A miss here means the ingestion pipeline, key normalisation or variant folding is wrong — not that the generator is weak.

### 6.9.B Generator-holdout evaluation

**Question:** *what does the generator do for an entity it has never seen as a whole entity?*

**RULE-TEST-4 (RECOMMENDED, amended).** For this evaluation the runner must guarantee all of:

1. Every **eval-partition whole-name row** is removed from the convention lookup available to the run.
2. Every **eval irregular / exception row** is likewise withheld — 九龍 and 旺角 are precisely the cases a lookup would trivially win and a generator cannot.
3. **No row derived from eval** enters any fitted character or syllable table.
4. **Only the fit partition** induces or trains the rule pack.
5. **Character- and syllable-level overlap between fit and eval is allowed and expected** — that overlap *is* the generalisation being measured. Removing it would test nothing, since a generator that has never seen a character cannot spell it.

**Contamination detection.** Before scoring, the runner probes the active lookup for each eval whole name. If any is reachable, the generator benchmark **fails as contaminated** rather than reporting an inflated number. Contamination that merely inflates a score is the failure mode most likely to survive review, so it is detected rather than trusted.

**RULE-TEST-4a.** Lookup success is **never** reported as generator accuracy, and the two evaluations are never combined into one figure. §8 must cite which mode any number it uses came from.

---

## 6.10 Family F — translation-consumer contract tests

These test §5.12's projection against the author-supplied Reader policy (RC-1…RC-4). They are contract tests, not linguistic tests.

| ID | Scenario | Asserts |
|---|---|---|
| F1 | Entity with an official English name (香港大學) | `protection: strict`, `replacement` = official name, `styleApplied: null` |
| F2 | Entity with **no** known English form, policy `romanisation_allowed` | L3R fallback used as the replacement (RC-2) |
| F3 | **HKR store has 梁知遙 → *Leung Chi-yiu*; translation store empty** | English form resolves via the L3R route with `provenance: user_glossary`, `evidenceClass: E1a`, `assembled: false`, `status: resolved`, `derivedFrom.directStoreRead: false`; **Joined mode does not rewrite it** (CHG-025, CHG-032 item 5) |
| F4 | Assembled `person:true` fallback with `styleApplicable` over generated romanised given units, Hyphenated then Joined | only licensed units differ in `replacement`; `styleApplied` set; **`Analysis` byte-identical between the two runs** |
| F5 | Verbatim forms from every evidence class with a live verbatim producer (E1a–E5), both style modes | `replacement` identical in both; `styleApplied: null` (RC-4). E6/E7 class-level/composed/generated outputs are excluded because their live producers are assembled |
| F6 | `lexical`/`phrase` translation entries | appear first as core `Analysis.termResolutions`; a selected `resolved` value projects as a concrete `termDirective`, while an equal-authority conflict remains null-valued with candidates and projects no directive; neither state becomes an entity or `englishForm` (CHG-024/044 H) |
| F7 | One selected `termDirective` overlapping one or multiple protected spans | directive dropped; exactly one `TERM_DIRECTIVE_DROPPED_OVERLAP` appears in `TranslationDirectives.diagnostics` with the exact dropped-directive span; `Analysis`/`Analysis.diagnostics` remain byte-identical, and repeat projection reproduces byte-identical diagnostic content/order |
| F8 | Nested entities | only `primary` protected; `protectedSpans` non-overlapping and sorted (INV-17) |
| F9 | Entity with `ambiguous`/`conflict` English form | **no** protected span; appears in `unresolvedSemanticSpans` with the source status preserved and no fabricated `reason` |
| F10 | Entity below `protectionConfidenceFloor` | remains reported in `Analysis`; **no `ProtectedSpan` is emitted** |
| F11 | Floor raised then lowered | `TranslationDirectives` change; `Analysis` and `analysisCacheKey` unchanged (RULE-API-11) |
| F12 | `person.foreign` with no known English form | no protected span; `caution: foreign_origin_suspected`; the span is left to the consumer |
| F13 | Protection false-positive probe: C1 corpus run end-to-end | **zero** protected spans over the whole C1 set |
| F14 | Entity with `unresolved`/`unsupported` English form | no protected span; projected unresolved-semantic span preserves the source status and its required `ReasonCode` |

F13 is the fixture that measures the risk §4.11.1 identifies. It is a suite-level gate, not a per-case assertion.

---

## 6.11 Family G — schema and property tests

Not enumerated as fixtures; run over **every** fixture in every other family.

| ID | Property |
|---|---|
| G1 | **Source reconstruction** — concatenating token text reproduces the source byte-for-byte (INV-1) |
| G2 | **Partition** — token spans ordered, contiguous, gapless, covering `[0, len)` (INV-2) |
| G3 | **Grapheme safety** — no boundary inside a surrogate pair, variation sequence or combining sequence (INV-4); exercised by D2 |
| G4 | **Syllable containment** — every individually aligned syllable span is inside its token; every grouped syllable has `span:null` and belongs to exactly one ordered, non-overlapping `alignmentGroup` whose shared span is inside the token (INV-14, CHG-044 J) |
| G5 | **Entity geometry** — nesting allowed, partial overlap absent, one `primary` per position (INV-16) |
| G6 | **`Value<T>` status table** — every value satisfies §5.5.1 exhaustively, incl. `ambiguous ⇒ value === null` |
| G7 | **Discriminated forms** — no verbatim form has `units`; no assembled form has `text` or rendered variants; assembled forms are only `romanisation|hybrid`, support person and non-person branches, and license style ids only for generated romanised given units (RULE-API-10, CHG-044 B) |
| G8 | **Provenance completeness** — every non-null value has `provenance`, `status`, `confidence` (INV-6) |
| G9 | **Attestation applicability** — every L2 value and every L4 term value/candidate has `externalAttestation:"not_applicable"`; L3R/L3E applicability follows E1a/E1b → `not_attested`, E1c/E2 → `attested`, independently of documentary `Attestation` (CHG-032 item 6, CHG-044 C) |
| G10 | **Candidate evidence** — every `ambiguous`/`conflict` candidate carries its own provenance and evidence class |
| G11 | **Determinism** — double-run byte-identical serialisation with stable key order (INV-7) |
| G12 | **Store independence** — writing to one store changes no other layer's values (INV-12) |
| G13 | **Override locality** — adding one entry changes output only within matching windows (INV-11) |
| G14 | **Projection purity** — style/floor changes alter directives only; instrumentation counters show zero pipeline work (RULE-API-7, RULE-API-11) |
| G15 | **Mode completeness** — every display mode renders from one cached Analysis (INV-10) |
| G16 | **Reference integrity** — every `AnnotationRef` has exactly one legal owner and channel; every `derivedFrom.romanisationRef` has exactly one owner, targets only `romanisation`, and resolves inside the Analysis; every `styleApplicable.unitIds` member resolves to a licensed unit (CHG-032 item 8, CHG-044 E) |
| G17 | **No-throw** — `processText` never throws on the fuzz corpus (RULE-API-8) |
| G18 | **Enum tolerance without coercion** — a consumer fed unknown enum values preserves them and does not substitute known members (RULE-API-9) |
| G19 | **Store shape and evidence** — entity translation entries require exactly one `FormKind`; other store/scope combinations forbid it; every StoreEntry uses E1a–E2, persists `caseSensitive`, and imported E3–E7 rows remain invalid and unapplied (CHG-044 A/C/I) |
| G20 | **Per-channel inheritance** — inherited selected values/candidates carry their own resolvable `InheritanceRef`; non-inherited selected values/candidates forbid it; two channels may cite different antecedents and no Entity-wide slot exists (CHG-044 K) |
| G21 | **DocumentContext closure** — memory remains recursively source-span-free and Analysis-id-free while mirroring literal/translated/romanised English assembly through local unit indices; `MemoryReading` has no source alignment groups (RULE-API-21, CHG-044 B/J) |
| G22 | **L4 conflict/projection split** — equal-authority competing entries are representable as a core `Value<TermRendering>` conflict with no selected value, and only selected resolutions appear in projected `termDirectives` (CHG-044 H) |
| G23 | **Canonical integer disjointness** — every accepted `__int` wrapper has exactly one canonical signed-int64 decimal in range, and every ordinary canonical object forbids the reserved `__int` key (CHG-044 F) |
| G24 | **Public graph closure** — every live v1 §5 TypeScript reference resolves under strict checking, no live declaration contains `any` or an ellipsis placeholder, aliases are unique, and deferred convenience views/Entity Records remain outside the v1 graph (CHG-044 D/M) |
| G25 | **Diagnostic-channel ownership** — creation, analysis and projection diagnostics inhabit only their declared channels; projection overlap counts/spans and creation-result discriminants satisfy T-API-011/012/042/043; live-provider diagnostics remain outside core |
| G26 | **Document-tag reachability and set semantics** — exact/case-sensitive matching uses only current `ProcessOptions.documentTags`; omitted/empty never match; exact dedupe + UTF-16 ordering determines the normalised preimage; `DocumentContext.id` never acts as a tag (T-API-044…049) |
| G27 | **`userDataVersion` exact-integer closure** — every public surface accepts exactly `0..9007199254740991`, starts at `0`, increments once per committed mutating transaction across all stores, does not increment for read/preview/no-op/failure/rollback, rejects maximum overflow atomically, and uses semantic signed-int64 encoding in the cache preimage (T-API-050…054, T-CACHE-035…036) |
| G28 | **Strict grouping closure (CHG-048/050)** — all four grouping-bearing surfaces (both assembled form types and both `assembled:true` memory branches) have non-empty units, grouping and inner groups; every member is an exact in-range local index; the flattened sequence is exactly complete and ascending, so omission, duplication, overlap and reordering fail closed; verbatim memory branches retain exact `text` and have no grouping (T-API-055, T-CACHE-037) |
| G29 | **Grouping rendering** — unit text concatenates with no separator inside each orthographic word; consecutive groups join with exactly U+0020; units-array order and code units are preserved without normalisation (T-API-056) |
| G30 | **Schema/runtime parity** — generated schema and executable cross-field validation jointly enforce every grouping and style-reference invariant on Analysis and DocumentContext branches, without repair or defaults (T-API-057) |
| G31 | **Profile totality and licensed runs** — all five exact outputs, one- and multi-unit runs, separated maximal runs, forced surname/given space and Lab-only surname uppercase pass; style references are non-empty, unique and strictly increasing by unit position (T-API-058/059) |
| G32 | **Style invariance boundaries** — verbatim English, literal/translated text, non-person assemblies, unstyled persons and non-target romanised units obey §5.11 exactly; `surname_caps` is rejected as a `GeneratedPersonNameStyle` (T-API-004/030/060) |
| G33 | **ASCII casing closure** — all four assembled-Romanisation casing profiles match exact vectors; non-ASCII and every other UTF-16 code unit are invariant; verbatim Romanisation is exact under every profile (T-API-061/062) |
| G34 | **Variant-map semantics** — empty, caller-order and duplicate-profile cases are a one-for-one map with no implicit default, sorting or deduplication (T-API-063) |
| G35 | **Cross-runtime projection identity** — two independent runtimes produce byte-identical agreed representations for the full grouping/style/casing vector set (T-API-064) |

**Fuzz corpus for G17/G3:** empty string, whitespace only, lone surrogates, unassigned code points, PUA, control characters, 100k-character input, a sentence with no terminator, 10,000 repetitions of one sentence, deeply nested brackets, mixed RTL.

---

## 6.12 False-certainty violations — a hard gate, not a metric

**RULE-TEST-5 (RECOMMENDED).** The following are **counted, and the count must be zero**. They are not scored as a percentage, because a percentage implies an acceptable non-zero level and there is none: each is the engine asserting something it does not know.

| Violation | Detects |
|---|---|
| `provenance: rule_engine` with `confidence` above `low` | INV-5 |
| `status: ambiguous` with a non-null `value` | RULE-API-3 |
| `status: conflict` with `ranked: true` or a chosen value | RULE-HKR-7 |
| Class-scoped attestation applied to an individual without `scopeDowngrade` | RULE-HKR-5 |
| A value satisfying the derived "conventional" test while `externalAttestation !== "attested"` | CHG-027 |
| An assembled form whose rendering differs from what its units and profile produce | RULE-API-6 |
| A verbatim form altered by any style profile | RC-4 |
| A protected span from an entity below the floor | RULE-ENT-13 |
| An entity candidate created by a `lexical`/`phrase`-scoped entry | RULE-ENT-4 |
| An L2 value with `externalAttestation !== "not_applicable"` | CHG-032 item 6 |

This gate is the packet's central claim made executable. Every other metric can move; this one cannot.

---

## 6.13 Metrics

Reported separately. **No blended score is published**, because a single number would let a strong component conceal the weak one the packet has already predicted (§2.2.2).

| # | Metric | Definition | Notes |
|---|---|---|---|
| M1 | **Segmentation** | word-level precision / recall / F1 against Family H gold | instrumental only — see M2 |
| M2 | **Reading accuracy through segmentation** | share of characters receiving the correct reading, end to end, using the candidate's segmentation | the product-relevant level |
| M2o | **Reading accuracy under oracle segmentation** | as M2, but with gold segmentation and the same resolver | the ceiling imposed by lexicon + resolver |
| M2Δ | **Segmentation-induced reading loss** | M2o − M2 | **the metric that isolates the segmenter** (CHG-033 item 4) |
| M3 | **Entity precision / recall / F1** | by type, and micro-averaged | see asymmetry below |
| M4 | **Protected-span precision / recall** | over F-family and C1 | **asymmetric — see §6.14** |
| M5 | **L3R generator exact match** | syllable-level and whole-name, on the `eval` partition only | with the split id |
| M5a | **Sibilant sub-accuracy** | ts/ch and s/sh decisions only | reported separately, always |
| M6 | **Whole-entity English-form resolution** | share of entities receiving a correct `englishForm`, by `formKind` | breaks out official vs romanised vs hybrid |
| M7 | **HKSCS coverage** | share of the **named denominator inventory** whose characters have a reading in the loaded lexicon — see §6.13.1 | a lexicon gate, not an engine score |
| M8 | **Ambiguity calibration** | two numbers — see §6.15 | |
| M9 | **False-certainty violations** | absolute count | **must be 0** (§6.12) |
| M10 | **Performance** | p50/p95 latency for 500 / 5,000 / 100,000-character inputs; cold vs warm cache; payload size | thresholds set in §10 |

### 6.13.1 The HKSCS coverage denominator (CHG-033 item 6)

"Share of HKSCS characters" is not a definition: HKSCS has had multiple revisions and the available pronunciation resources cover different inventories. M7 is uninterpretable — and not comparable between runs — unless the denominator is pinned.

**RULE-TEST-8 (RECOMMENDED).** Every M7 figure is published with its denominator fully identified:

```yaml
m7_denominator:
  resource: "<exact resource name>"
  revisionBasis: "<the HKSCS revision / standard edition the resource is specified against>"
  version: "<publisher's version or publication basis>"
  snapshotDate: "2026-..-.."
  retrievedAt:  "2026-..-.."
  characterCount: <N>
```

The resource is selected and snapshotted in §8. Two M7 figures computed against different denominators must never be compared, and the runner records the denominator id alongside the score so that comparison is refused rather than mistakenly made.

### 6.14 Asymmetric treatment of protected spans

**RULE-TEST-6 (RECOMMENDED).** For M4, **precision is the primary metric and recall is secondary**, and the two failures are not comparable:

| Failure | Consequence | Visibility |
|---|---|---|
| **False positive** — an ordinary word protected as a name | The downstream translator is prevented from translating it. 李 meaning "plum" is frozen as *Lee* | **Silent.** It reads as a translation bug with no trace back to the engine |
| **False negative** — a real name not protected | The translator handles the name itself and may render it semantically or invent a spelling | **Visible** in the output, and recoverable by adding a glossary entry |

Both are bad; only one is undetectable by the user. But a precision *threshold* is a statistical claim, and v0.1's provisional 0.99 would have been a threshold computed over a sample too small to support it. CHG-033 item 5 splits the requirement into a gate that is valid immediately and a metric that becomes valid later.

**Gate 1 — adversarial hard gate (valid from the first run).** On Family C1 and F13 — the deliberately adversarial ordinary-word set — **zero protected-span false positives**. Any false positive here fails the suite. This is a *conformance* assertion, not a statistical one: these fixtures are constructed so that a correct engine cannot produce a protected span at all, so the expected count is exactly zero and no sample-size argument is needed.

**Gate 2 — representative-corpus metric (reported, not yet gated).** On a representative labelled corpus, report protected-span precision **with its numerator, denominator and an appropriate confidence interval**, alongside recall. A precision figure without n is not a measurement.

**RULE-TEST-6a.** The production precision floor is **not set** until the labelled sample size makes such a threshold meaningful. `0.99` remains an **aspirational provisional target, explicitly not a validated CI threshold**. Declaring it a gate now would either fail spuriously on small n, or pass vacuously — and would give the number a credibility the data does not support.

Reporting F1 alone here would actively mislead, and F1 is deliberately **not** the headline for M4.

The same asymmetry does **not** apply to M3 (entity detection generally): an entity detected but not protected is harmless.

### 6.15 Ambiguity calibration

Two numbers, both needed, neither maximised:

- **Ambiguity recall** — of fixtures marked `ambiguous_by_nature`, what share did the engine mark `ambiguous` or `conflict`? Low means the engine is inventing certainty.
- **Ambiguity precision** — of spans the engine marked `ambiguous`, what share are genuinely ambiguous? Low means the engine flags everything, and users learn to ignore the flag — which destroys the value of the honest flags.

**RULE-TEST-7.** Both are reported as a pair with a target *band*, never as a quantity to maximise. An engine that marks everything ambiguous scores perfect recall and is useless. This is the metric that keeps §1's "visible uncertainty over fabricated certainty" from degrading into noise.

---

## 6.16 Family H — segmenter benchmark corpus

**Purpose.** Let §8 compare candidates on the *same* material. §6 does not choose (DEC-…-017 stays open).

**Requirements.**

1. **Running written Cantonese**, not word lists — 2,000–5,000 tokens minimum, spanning colloquial prose, formal written Chinese, and mixed-script text.
2. **Hand-segmented gold**, with segmentation decisions documented where a competent annotator could disagree.
3. **Paired reading gold**, so M2 (downstream reading accuracy) is computable, not only M1.
4. **HKSCS content included**, so a candidate that mishandles non-BMP fails here rather than in production.
5. **Held separate from any candidate's training data** — a candidate trained on a public Cantonese corpus must not be evaluated on that corpus. §8 must check each candidate's training provenance against Family H's sources and exclude overlaps.

**Comparison protocol for §8 (CHG-033 item 4).** Every candidate runs the same corpus with **everything else held constant**: the same lexicon, the same reading resolver, the same entity rules, the same pronunciation-dictionary state (normally empty), the same `ProcessOptions`. A comparison that varies two things measures neither.

Each candidate reports:

| # | Reported value |
|---|---|
| 1 | **Segmentation precision / recall / F1** against Family H gold |
| 2 | **End-to-end reading accuracy using the candidate's segmentation** (M2) |
| 3 | **Reading accuracy using the gold/oracle segmentation**, same downstream resolver (M2-oracle) |
| 4 | **Segmentation-induced reading loss** = (3) − (2) |
| 5 | HKSCS handling; determinism (double-run identity); explainability; p95 latency; bundle/runtime cost; dependency risk; licence |

**Why the oracle baseline is not optional.** Without (3), every reading error is silently charged to the segmenter. If M2-oracle is 0.91, then no segmenter can exceed 0.91 and the remaining 9% belongs to the lexicon and resolver — an entirely different fix. Value (4) is the only number that isolates the segmenter's own contribution.

**M2 remains the product-relevant deciding metric**, because segmentation exists to serve readings. But §8 **must not attribute all M2 error to the segmenter**: the honest comparison is on (4), with (2) reported as the absolute level the product would actually see.

**Honest blocker.** Hand-segmenting several thousand tokens of written Cantonese is real, slow work and is the single most expensive item in this packet. Two mitigations, both for §8 to evaluate rather than §6 to assume: use an existing segmented Cantonese corpus where licence and suitability permit — noting requirement 5 makes any corpus used for training a candidate unusable for evaluating it — or reduce scope to a smaller, carefully chosen benchmark and report the resulting confidence interval honestly. **Shipping a segmenter chosen without this corpus would mean DEC-…-017 was decided on preference after all**, which is the outcome CHG-019 exists to prevent.

---

## 6.17 Execution model

| Concern | Decision |
|---|---|
| Fixtures are **data** | YAML/JSON files, one runner. No test logic in fixtures |
| **Gold fixtures never auto-update** | A gold mismatch requires a human decision: engine bug, or gold wrong (with a new source) |
| **`testRole` decides gating, not `goldStatus`** | Only `conformance` fixtures gate CI. `benchmark` mismatches move a metric and are reported as a delta. `observation` fixtures never fail (CHG-033 item 1) |
| **`conformance` requires strong gold** | A fixture may not carry `testRole: conformance` below `goldConfidence: high` with a citable source (RULE-TEST-1a) |
| **Snapshot fixtures may be regenerated** | Full-Analysis snapshots for regression; regeneration produces a reviewable diff and requires explicit approval |
| **Determinism check** | Every suite run processes a sample twice and compares hashes (G11) |
| **Version stamping** | Every result file records the full `Versions` record, the gazetteer `asOf`, and the fit/eval split id |
| **CI gates** | Suite fails on: any G-family property failure; any M9 false-certainty violation; **any protected-span false positive on C1/F13**; any `conformance` fixture mismatch; any detected generator-benchmark contamination (§6.9.B) |
| **Non-gates** | M1/M2/M2o/M2Δ/M4-representative/M5/M6 are *reported with a delta against the previous run*, not gated — a linguistic improvement may legitimately change many numbers, and M4's representative floor is not yet statistically valid (RULE-TEST-6a) |
| **Ambiguity fixtures** | Never gate on exact candidate *ordering* unless the ordering itself has evidence (attestation counts) |

---

## 6.18 What §6 deliberately does not measure

1. **Whether the engine's answers are useful to a reader.** That is a product question requiring the author's judgement on real documents, not a corpus.
2. **Translation quality.** The engine performs no translation (RC-1). F-family tests the *contract*, never the output of any downstream translator.
3. **Whether generated romanisations match real people's names.** Unknowable (NC-2); such fixtures are `unknown_to_us` and unscored.
4. **Confidence calibration in a statistical sense.** The bands are ordinal, not probabilities (RULE-CONF-2). M8 measures whether ambiguity is *flagged appropriately*, not whether `medium` means 0.7.
5. **UI behaviour.** §9.

---

## 6.19 Decisions raised by §6

| ID | Question | Recommended | Confidence | Blocking? |
|---|---|---|---|---|
| DEC-LANG-20260828-037 | Fit/eval split ratio and method for the gazetteer | **80/20 by committed deterministic hash of the Chinese name**, split artefact committed | Medium-high | **Yes** — before any generator accuracy figure is published |
| DEC-LANG-20260828-038 | Family H: build a hand-segmented corpus, or adopt an existing one? | **Evaluate adoption in §8 first**, subject to the training-overlap exclusion; build only the shortfall | Medium — depends on licence and overlap findings | **Yes, before DEC-…-017** — the benchmark must exist before the segmenter is chosen |
| DEC-LANG-20260828-039 | M4 protected-span gating | **AMENDED (CHG-033 item 5).** Two-part: (a) **zero-false-positive hard gate on the adversarial C1/F13 set**, valid immediately and gating from the first run; (b) representative-corpus precision **reported with n and a confidence interval**, floor **not set** until the sample supports one. `0.99` is an aspiration, not a CI threshold | **High** on the asymmetry and on (a); the numeric floor is deliberately unset | (a) yes, from the first run; (b) no |
| DEC-LANG-20260828-040 | Target band for ambiguity precision (M8) | No number asserted. Set it after one run against real data; over-flagging is as much a failure as under-flagging | Low | No |
| DEC-LANG-20260828-041 | Are full-Analysis snapshots committed for every fixture, or only for a curated subset? | **Curated subset.** Committing thousands of full payloads makes every diff unreadable and trains reviewers to approve blindly | Medium-high | No |

---

## 6.20 Known limitations of §6

1. **No fixture has been written.** §6 specifies families, formats, provenance rules and metrics. The corpus itself is implementation work, and its size targets are estimates with no measured basis.
2. **Family H is unbuilt and is the critical path.** DEC-…-017 cannot honestly close before it exists (§6.16).
3. **Gold sources have not been retrieved.** The Lands Department and CCLI datasets are identified (§0.5, §3.11) but not downloaded, inspected, licence-checked or snapshotted. Their actual field structure may not support the pairing A4 assumes.
4. **Thresholds are placeholders.** θ_read, N_read, N/θ for convention promotion, the M4 precision floor and the M8 band are all provisional and unbacked by data.
5. **No inter-annotator agreement process is specified** for Family H. With one annotator, segmentation gold is one person's judgement — which should be stated wherever M1 is published.
6. **The suite cannot detect a systematically wrong convention table.** If the fitting procedure learns a wrong-but-consistent spelling rule, E1/E2 will score well and the output will still be wrong. Only external review against real Hong Kong usage catches that, and §6 does not provide it.

**SECTION COMPLETE — §6 Test Corpus + Correctness Strategy**

---

# §8 — Implementation and Dependency Options

**Purpose.** Evaluate the real candidate dependency stack against §6's benchmark requirements, and settle what current evidence actually supports.

**Method and evidence status.** Every finding below was retrieved in this session on **2026-08-28** from the sources cited. Nothing was installed, downloaded, licence-reviewed by a lawyer, or benchmarked. Where a claim rests on a publisher's own description rather than inspection of the artefact, it is marked. **No measured head-to-head accuracy appears in this section**, because Family H does not exist (§6.16); those cells read **BLOCKED**, not "unknown" and not an estimate.

**Ordering note.** §7 is deferred by author decision. §8 carries external findings that change with time; §7 is consolidation of decisions already recorded in place.

---

## 8.1 Summary

| Candidate | Role | Licence (as published) | Classification |
|---|---|---|---|
| **LSHK `jyutping-table`** | character-level readings + HKSCS | CC BY 4.0 | **ADOPT** — character-level layer |
| **rime-cantonese** | word-level Jyutping lexicon | CC BY 4.0 (`jyut6ping3.maps`: ODbL 1.0) | **ADOPT** as a source. Resolver precedence and frequency authority remain benchmark-dependent |
| **Lands Dept Geographic Name (DATA.GOV.HK)** | gazetteer / entity English forms | DATA.GOV.HK terms — commercial + redistribution permitted, attribution required | **ADOPT** — bundled snapshot |
| **CC-Canto / CC-CEDICT Cantonese readings** | supplementary word readings + glosses | CC BY-SA 3.0 | **ADOPT AS LAYER** — isolated, never merged (§8.8) |
| **CCLI HKSCS Cangjie + Pronunciation Reference Table** | HKSCS readings (later-revision basis) | **Dedicated Terms of Use — materially restricts modification and redistribution** | **REFERENCE / CROSS-CHECK ONLY** — do not bundle or derive without terms review |
| **words.hk / 粵典** | rich word-level data | Non-Commercial Open Data Licence 1.0; per-entry | **OPTIONAL** — user-installable local layer, never bundled |
| **Unihan `kCantonese`** | character readings | Unicode licence | **ADOPT AS FALLBACK** — last-resort only |
| **PyCantonese (Rustling engine)** | segmentation | MIT code; bundled data mixed, incl. GPL-3.0 | **EVALUATE IN BENCHMARK** — with a caveat that may disqualify it (§8.5) |
| **Bidirectional maximum matching** | segmentation | n/a — self-built | **EVALUATE IN BENCHMARK** |
| **Self-trained DAG+HMM** | segmentation | n/a — self-built | **EVALUATE IN BENCHMARK** — the only candidate with a verifiable training split |
| **Address Lookup Service / CSDI** | streets, buildings, addresses | DATA.GOV.HK terms | **ADOPT AS LAYER** — optional refresh, not bundled |
| **DATA.GOV.HK Street Name dataset** | street names | — | **REJECT** — carries a withdrawal notice (§0.5) |
| **Institutional official-name list** | org English names | n/a — curated by hand | **ADOPT** — small curated set |
| **Surname convention table** | class-level romanisation | n/a — must be built | **BLOCKED** — no authoritative public source known to this packet; the search was not exhaustive (§8.9) |

---

## 8.2 A — Word-level and lexical resources

### 8.2.1 rime-cantonese — **ADOPT** as the primary word layer

| Property | Finding | Source |
|---|---|---|
| Licence | **CC BY 4.0** for the main work; `jyut6ping3.maps` under **ODbL 1.0**. CC-BY requires attribution, **no share-alike** | [README-en](https://github.com/rime/rime-cantonese/blob/main/README-en.md) |
| Format | Rime `.dict.yaml` — plain text, `text ⇥ code ⇥ weight` | repository |
| Romanisation | Jyutping, native | README |
| Coverage | Word-level Cantonese lexicon incl. colloquial forms; also packaged by LDC as a normalised Jyutping lexicon | [LDC2022L01](https://catalog.ldc.upenn.edu/LDC2022L01) |
| Frequencies | Weight column present; **how each weight was derived is not established** | repository |
| HKSCS / non-BMP | **Not stated.** Must be verified | README (silent) |
| Runtime | Plain text → trivially parsed in Node or the browser; no runtime dependency | — |

**Why adopted.** CC BY 4.0 without share-alike is the most permissive licence among the substantial word-level Cantonese lexicons, it is Jyutping-native so no conversion step is needed, and it covers written Cantonese by design rather than by accident.

**Three claims, only the first of which §8 settles (CHG-034 F).**

| Claim | State |
|---|---|
| **Adoption as a bundled, permissively licensed word-reading source** | **SETTLED** |
| **Precedence** — that it should sit above CC-Canto and below the user store in the resolver | **Provisional.** §8 has measured **no** lexical accuracy or coverage; the ordering in §8.8 is a starting hypothesis for §6 to test |
| **Frequency authority** — that its weights can drive RULE-JP-7 | **UNRESOLVED — see below** |

**The frequency question (CHG-034 E).** Rime dictionaries carry a weight column, and the sources inspected establish that such dictionaries *can* carry frequency information — but they do **not** establish how each rime-cantonese weight was derived. The earlier categorical statement that these are input-method priorities rather than corpus frequencies is **withdrawn as unestablished**.

The conservative implementation policy stands regardless, because the risk is asymmetric: §3.5.2's dominance threshold assumes a frequency distribution over readings in *running text*, and driving it with a quantity that turns out to mean something else would silently mis-set every polyphone resolution in the engine, in a way no test that also used those weights would detect. **Do not use rime weights as RULE-JP-7 frequencies until their provenance and semantics are verified**; take frequencies from a corpus layer in the meantime. DEC-…-042 remains UNRESOLVED and blocking for that use only — it does not block adoption of the lexicon itself.

### 8.2.2 CC-Canto — **ADOPT AS LAYER**, isolated

| Property | Finding | Source |
|---|---|---|
| Licence | **CC BY-SA 3.0**; CC-Canto © 2015–16 Pleco Software Inc.; CC-CEDICT separately copyright | [cantonese.org/download](https://cantonese.org/download.html) |
| Size | CC-Canto "over 120,000 entries"; plus a CC-CEDICT Cantonese readings file | same |
| Format | CC-CEDICT-style text; Jyutping in `{}` after Pinyin | same |
| Currency | **Files dated 170202 (Feb 2017) and 150923 (Sep 2015)** — no evident update in ~9 years | same |
| Caveat | The publisher's own note: "the definition formatting in CC-Canto entries is very rough" | same |

**Verdict.** Genuinely useful breadth, with two considerations. **Share-alike**: whether obligations attach to a combined artefact depends on whether that artefact is a collection, an adaptation, a derivative database or an extraction, and on the specific licence and facts (CHG-034 C) — this packet asserts no universal propagation rule and gives no legal advice. It is loaded as an isolated runtime layer because that **reduces licence coupling and preserves source provenance** (RULE-DEP-1), not because a propagation rule is being claimed. **Staleness** is the firmer point: the files are dated 2015–17, so it should sit *below* rime-cantonese in the resolution order.

### 8.2.3 words.hk / 粵典 — **OPTIONAL**, user-installable, never bundled

| Property | Finding | Source |
|---|---|---|
| Licence | **Non-Commercial Open Data Licence 1.0**; commercial licensing available separately from Hong Kong Lexicography Limited | [words.hk licence page](https://words.hk/base/hoifong/) |
| Scope of the licence | **Per-entry** — "not all entries qualify"; an entry carries a reference to the licence only if it is so licensed | same |
| Commercial definition | Broad: advertisement fees, selling services, publishing for profit, "any use in a commercial setting"; profit or loss is immaterial | same |
| Attribution | Copyright notices, disclaimers, credits, and a prominent source link required | same |
| Quality | Substantial and actively maintained; documented in an academic dataset paper | [Words.hk dataset paper](https://aclanthology.org/2022.dclrl-1.7.pdf) |

**Verdict.** The best-quality Cantonese lexical data in the field, and the one this packet can do least with by default. Two findings stand: **only some entries are licensed** (an entry carries the licence reference only if it is so licensed), and **the licensed material carries non-commercial restrictions**. A default bundle would therefore need entry-level filtering this session cannot verify, and would carry NC obligations on the licensed portion. For the author's **private personal app** it is very likely usable — but "very likely" is not a licence review, and this packet is not legal advice.

Note (CHG-034 C): this is a statement about the words.hk material itself. It is **not** a claim that including it would automatically make every unrelated component of a composite artefact non-commercial.

**Recommended handling.** A `words.hk` layer the *user* installs locally, never shipped. This is a real capability — the engine's layered resolver (§8.9) makes an extra local layer a configuration change — and it keeps the licensing question with the person entitled to answer it.

**Do not assume a resource can be bundled because it is publicly viewable.** words.hk is the case that proves the rule.

### 8.2.4 Unihan `kCantonese` — **ADOPT AS FALLBACK**

Character-level only, one or more Jyutping readings per character, distributed with the Unicode Character Database under the Unicode licence, and updated with each Unicode version so its coverage of newer extensions is the best available. It has **no word-level entries and no usable frequency data**, so it cannot support §3.4.1 or RULE-JP-7. Correct role: the last character-level fallback below the LSHK table, chiefly for characters added to Unicode after HKSCS-2001.

---

## 8.3 B — Hong Kong government pronunciation resources

### 8.3.1 The significant find: the LSHK machine-readable table — **ADOPT**

| Property | Finding | Source |
|---|---|---|
| Content | Cantonese pronunciation for **over 29,000 characters** — 27,484 from ISO/IEC 10646-1:2000 plus **4,384 HKSCS-2001 characters** | [lshk-org/jyutping-table](https://github.com/lshk-org/jyutping-table) |
| Format | **TSV** (`list.tsv`) plus **JSON** versions | same |
| Romanisation | The LSHK Cantonese Romanization Scheme — **Jyutping**, native | same |
| Licence | **CC BY 4.0** | same |
| Provenance | Data originated at iso10646hk.net; the **LSHK Jyutping Workgroup assumed maintenance** to provide a machine-friendly format | same |
| Relationship to the government resource | It is the machine-readable form of the *Cantonese Pronunciation List of the Characters for Computers* (電腦用漢字粵語拼音表), whose government page describes the same inventory | [ccli.gov.hk](https://www.ccli.gov.hk/en/download/canton_pronun_list.html) |

This is the strongest single result of §8. It resolves three §3 requirements at once — HKSCS coverage (§3.6.2), Jyutping-scheme readings (§3.1), and a machine-ingestible format — under a permissive licence, from the body that defines Jyutping.

**It also supplies a candidate M7 denominator** (§6.13.1, CHG-033 item 6): resource = LSHK `jyutping-table`; revision basis = ISO/IEC 10646-1:2000 + HKSCS-2001; characterCount = 4,384 for the HKSCS component, 29,000+ overall. If a later-revision inventory is adopted instead (§8.3.2), the denominator changes and figures computed against the two are not comparable.

### 8.3.2 CCLI direct downloads — **REFERENCE / CROSS-CHECK ONLY** (corrected, CHG-034 D)

The Common Chinese Language Interface [download area](https://www.ccli.gov.hk/en/download/) offers *HKSCS倉頡輸入碼及粵語讀音參考表* (HKSCS Cangjie Input Code and Cantonese Pronunciation Reference Table) as a **7.4 MB PDF, Chinese only**.

**Correction: it is not licence-silent.** An earlier draft recorded "no terms of use stated". That was a reading of one page, not of the resource. **The table has a dedicated Terms of Use page, and those terms materially restrict modification and redistribution**, granting only limited reproduction and distribution permissions under stated conditions.

**Classification: REFERENCE / CROSS-CHECK ONLY — DO NOT BUNDLE OR DERIVE WITHOUT TERMS REVIEW.** It may be consulted; it may not be ingested, transformed or shipped on the strength of anything in this packet. Deriving a data layer from it would require reading its terms in full and, realistically, a licence review.

**Correction: it is not superseded by the LSHK table.** The earlier claim that the LSHK table "gives the same inventory" is **withdrawn**. The two are specified against **different revisions**:

| Resource | Specified against | Status |
|---|---|---|
| LSHK `jyutping-table` | ISO/IEC 10646-1:2000 + **HKSCS-2001** | **ADOPT** — machine-readable character-reading base, CC BY 4.0 |
| CCLI HKSCS Cangjie + pronunciation reference table | the government archive holds an **HKSCS-2008**-basis table | **Independent later-revision cross-check candidate** |

An HKSCS-2008-basis table plausibly covers characters the HKSCS-2001-basis table does not — which makes it *complementary*, not redundant. **Inspect its exact current revision and content before claiming coverage in either direction.** Neither replaces the other, and M7's denominator (§6.13.1) must name whichever is actually used.

**The currency gap, restated.** The LSHK table's HKSCS-2001 basis leaves an **unmeasured** gap against later HKSCS revisions and later Unicode extensions. Unihan (§8.2.4) is one mitigation and the CCLI later-revision table is another. The gap should be measured, not assumed small in either direction.

**Character-level does not substitute for word-level.** Nothing found here changes §3.4.1: these tables give a character's possible readings, not which reading applies in 銀行 versus 行路. They are a fallback and an HKSCS backstop, not a lexicon.

---

## 8.4 C — Segmenters (DEC-…-017)

### 8.4.1 PyCantonese / Rustling

| Property | Finding | Source |
|---|---|---|
| Code licence | **MIT** | [repository](https://github.com/jacksonllee/pycantonese) |
| Bundled data licences | HKCanCor (CC BY), **CantoMap (GPL-3.0)**, rime-cantonese (CC BY 4.0), Common Voice Cantonese (MPL 2.0), Cantonese–Traditional Chinese Parallel Corpus (CC0) | same |
| Engine | Since **v4.0.0**, segmentation and POS run on **Rustling**; PyLangAcq and wordseg dropped | [releases](https://github.com/jacksonllee/pycantonese/releases) |
| Algorithm | "**semi-supervised hybrid approach that combines a DAG and hidden Markov model**" | same |
| Model artefact | **zstd-compressed FlatBuffers binaries** | same |
| Current version | **v5.0.0**, latest in the sequence v4.0.0 → v4.1.0 → v4.2.0 → v4.3.0 → v5.0.0 | releases |
| Release currency | **Official documentation places the v4.0.0 Rustling transition in March 2026.** No maintenance-gap risk is inferred | docs |
| JavaScript / WASM | **CONFIRMED available.** The official Quickstart documents browser **and** Node use through **Pyodide / WebAssembly**, installing Rustling and PyCantonese emscripten wheels | docs |

**Withdrawn (CHG-034 A).** An earlier draft of this section suggested an approximately two-year release gap. That was unsupported: the GitHub releases view rendered day and month **without an explicit year**, and reading v5.0.0's "26 May" as 2024 was an inference, not a reading. The claim and the maintenance-risk it implied are withdrawn.

**Strengths.** Trained on Cantonese-specific material rather than Standard Written Chinese — the single property §3.4.2 identified as decisive. Deterministic in the sense INV-7 requires (fixed model, fixed weights). MIT code. **JavaScript/WASM availability is confirmed**, which removes the runtime objection that would otherwise have ruled it out of a browser-targeted engine.

**Two separate questions, only one of them settled.**

| Question | State |
|---|---|
| Can it run in the target runtimes at all? | **SETTLED YES** — Pyodide/WASM, browser and Node |
| Is it *suitable* there? WASM/package payload, initialisation latency, memory cost, p95 segmentation latency, fit for the actual target environment | **BENCHMARK REQUIRED** |

A Pyodide-based dependency in a browser is a materially different proposition from a few hundred kilobytes of JavaScript; that difference is measurable and unmeasured.

**The caveat that may disqualify it — and it is not about accuracy.** §6.9 and §6.16 require that a candidate is **not evaluated on its own training data**. PyCantonese bundles **HKCanCor**, which is the principal segmented Cantonese corpus and therefore the obvious source for Family H. Worse, the model ships as an opaque zstd/FlatBuffers binary, so **its training split cannot be inspected**: even a claim that some HKCanCor portion was held out is unverifiable from outside.

The consequence is concrete: **if Family H is built from HKCanCor, PyCantonese's benchmark result is meaningless in the flattering direction.** This does not make PyCantonese a bad segmenter. It makes it a candidate that can only be evaluated on text drawn from outside its training data — which is exactly what §8.7 concludes Family H must be.

**Redistribution caution.** Using PyCantonese as a dependency is straightforward under MIT. **Redistributing its bundled data is not** — the GPL-3.0 CantoMap component in particular. The engine should depend on the tool, never vendor its data files.

### 8.4.2 Bidirectional maximum matching

Self-built, no licence question, trivially browser- and Node-compatible, byte-deterministic, and **maximally explainable** — the matched lexicon entry *is* the explanation, which matters because the packet's whole value proposition is that the user can see why the engine said what it said. Weak on out-of-vocabulary text and on genuine ambiguity. Accuracy on written Cantonese: **BLOCKED** pending Family H.

### 8.4.3 Self-trained DAG + HMM — the candidate with a property the others lack

Training a hybrid segmenter locally on an adopted corpus is more work than importing one, and it buys one thing nothing else offers: **a training split this project controls and can verify.** §6.9's contamination detection and §6.16's requirement 5 are both satisfiable by construction rather than by trust.

Given that §6 makes leakage control a *gating* concern rather than a nicety, this changes the comparison's shape. The choice is not simply "best accuracy"; it is between a likely-stronger model whose evaluation validity cannot be established from outside, and a likely-weaker model whose evaluation validity is guaranteed.

### 8.4.4 Comparison as it stands

| Criterion | Max matching | PyCantonese / Rustling | Self-trained hybrid |
|---|---|---|---|
| Written-Cantonese accuracy | **BLOCKED** | **BLOCKED** (trained on Cantonese data — favourable prior, unmeasured) | **BLOCKED** |
| Produces / adapts to §3's lattice | Yes, natively | Needs an adapter; DAG is lattice-shaped, so plausible — **unverified** | Yes, by design |
| Family H leakage | None | **Serious — HKCanCor bundled, split not inspectable** | **None — split controlled** |
| HKSCS / non-BMP | Depends on the lexicon | **Unverified** | Depends on the lexicon |
| Determinism (INV-7) | Yes | Yes (fixed model) | Yes |
| Explainability | **Highest** | Low — opaque binary model | Medium |
| Browser / Node | Trivial | **Available — CONFIRMED** via Pyodide/WASM emscripten wheels. *Suitability* (payload, init latency, memory, p95) **BLOCKED** | Trivial |
| Latency | **BLOCKED** | **BLOCKED** | **BLOCKED** |
| Bundle size | Negligible | Unknown — compressed model, size unmeasured | Model-dependent |
| Maintenance risk | None (own code) | Small-team project; **no release-gap concern** (CHG-034 A) | Own code, own burden |
| Licence | n/a | MIT code; **do not vendor its data** | n/a |

**DEC-…-017 remains UNRESOLVED, and §8 does not close it** — closing it now would be exactly the preference-based decision CHG-019 exists to prevent. What §8 adds is that the deciding constraint may not be accuracy at all: it is whether a valid comparison can be constructed for PyCantonese, which depends entirely on §8.7.

---

## 8.5 D — Gazetteer and English-form sources

### 8.5.1 DATA.GOV.HK terms — the finding that unblocks the gazetteer

| Question | Answer | Source |
|---|---|---|
| Commercial use? | **Permitted** | [DATA.GOV.HK terms](https://data.gov.hk/en/terms-and-conditions) |
| Non-commercial? | Permitted | same |
| Redistribution / bundling? | **Permitted** — "distribute, reproduce", place copies on other websites | same |
| Attribution? | **Required** — identify the source, acknowledge Government and Relevant Organisations' ownership, credit DATA.GOV.HK | same |
| Warranty? | **None.** "AS IS"; no warranty of accuracy, completeness or timeliness | same |
| Other obligations | Users must **indemnify** the Government against infringement claims | same |
| Stability | Government may "revise, omit, edit or suspend" without notice; no commitment to updates | same |

This settles the largest open licensing question in the packet: the Lands Department gazetteer **can be bundled** as a snapshot, with attribution. The AS-IS disclaimer is why §2.3.1 caps gazetteer evidence at E3 rather than treating it as infallible, and the withdrawal clause is why §0.5 requires `asOf` and `sourceRef` on every row.

### 8.5.2 Source-by-source

| Source | Role | Handling | Classification |
|---|---|---|---|
| [Geographic Name (Lands Dept)](https://data.gov.hk/en-data/dataset/hk-landsd-openmap-landsd-geographic-name) — Place Name API, monthly, derived from *A Gazetteer of Place Names* | districts, areas, villages, hydrographic and topographic names | **Bundle a snapshot**; optional refresh | **ADOPT** |
| [Address Lookup Service](https://data.gov.hk/en-data/dataset/hk-dpo-als_01-als) / [GeoAddress Finder](https://tools.csdi.gov.hk/geoaddressfinder/) | streets, buildings, addresses | **Do not bundle** — high volume, high churn. Optional on-demand lookup with caching | **ADOPT AS LAYER** |
| DATA.GOV.HK **Street Name** dataset | street names | Carries a withdrawal notice effective 21.01.2025 (§0.5) | **REJECT** — use ALS/CSDI instead |
| Institutional official English names | `org.*`, `facility.*` | Hand-curated from each institution's own source | **ADOPT** — small set, high value |

**Stable identifiers.** Whether the Lands Department data carries durable per-record identifiers was **not established** in this session. If it does not, snapshot diffing must key on the Chinese name plus feature type, which is fragile across revisions. Recorded as DEC-…-043; it matters because it determines whether a refresh can be a diff or must be a replacement.

**Snapshot strategy (RECOMMENDED).** Bundle one snapshot per release with `sourceRef`, `asOf` and `retrievedAt` on every row (§0.5); ship a refresh command that fetches, diffs and *reports* rather than silently replacing; never fetch at test time (§6.2); attribute in the Lab's about panel and in any export that carries gazetteer-derived values.

---

## 8.6 Licence composition — the constraint that shapes the architecture

**This packet is not legal advice.** What follows is a summary of published terms and an architectural recommendation that reduces exposure to questions this session cannot answer.

| Layer | Licence as published | Consideration if materially merged or derived |
|---|---|---|
| rime-cantonese | CC BY 4.0 (`.maps`: ODbL 1.0) | attribution; ODbL has its own database-specific obligations |
| LSHK jyutping-table | CC BY 4.0 | attribution |
| Lands Dept gazetteer | DATA.GOV.HK terms | attribution + indemnity |
| CC-Canto | **CC BY-SA 3.0** | share-alike obligations may attach to an **adaptation**; whether a given combination is an adaptation or a collection is licence- and fact-specific |
| words.hk | **NC 1.0**, per-entry | non-commercial restrictions attach to the licensed material |
| PyCantonese bundled data | mixed, incl. **GPL-3.0** | do not vendor; depend on the tool instead |

**Withdrawn (CHG-034 C).** Two categorical claims in the earlier draft are withdrawn: that a CC BY-SA layer automatically makes an entire combined dataset share-alike, and that an NC layer automatically makes every other independent component of a composite artefact non-commercial. Creative Commons and ODbL both distinguish **collections / collective databases** from **adaptations / derivative databases**, and whether obligations propagate depends on how the data is combined, transformed, extracted and redistributed. Those are licence-specific questions requiring review, not defaults this packet can assert.

**RULE-DEP-1 (RECOMMENDED, rationale revised) — layer isolation.** Each data layer remains a **separately licensed artefact, loaded independently at runtime**, rather than being fused into one combined derived file at build time.

The rationale is risk and engineering, not a legal conclusion: layer isolation **minimises licence coupling and ambiguity over derivative-dataset obligations**; it preserves independent provenance, so every value can still name its source (§0.5, INV-6); and it makes removal or substitution of a layer possible without re-deriving anything. **A materially merged or derived artefact may trigger additional obligations depending on the source licence and the manner of incorporation, and that requires licence-specific review.** Isolation means the project rarely has to ask the question at all.

It also has a product benefit: the user can install a locally licensed layer — words.hk — that the project would not ship by default.

**One deliberate derived artefact.** The **fitted romanisation rule pack** (§2.7) *is* derived, from the gazetteer. It should be induced from the gazetteer **alone**, never from a mixture — not because a mixture necessarily propagates obligations, but because a single-source derivation has one licence to reason about instead of several.

---

## 8.7 F — Family H acquisition (DEC-…-038)

**Status: REOPENED (CHG-034 B) — evaluate existing independent corpora first; hand-annotate only the shortfall.**

**Withdrawn.** The earlier conclusion — "Family H must be newly annotated" — was stronger than the evidence. What the evidence established was narrower.

| Established | Not established |
|---|---|
| **HKCanCor cannot serve as a fair PyCantonese holdout**, because PyCantonese explicitly uses HKCanCor for model training | That **every** existing segmented Cantonese corpus overlaps PyCantonese's training data |

**A distinction the earlier draft collapsed.** *Bundled in a package* and *used to train the segmentation model* are different facts. PyCantonese ships several corpora as data its users can read; that a corpus is readable through the package is **not** evidence it informed the segmenter. A corpus must not be excluded on packaging alone — only on evidence that it trained the model.

### 8.7.1 A live existing candidate — UD_Cantonese-HK

| Property | Finding | Source |
|---|---|---|
| Content | **1,004 sentences / 13,918 tokens** | [UD_Cantonese-HK](https://universaldependencies.org/treebanks/yue_hk/index.html) |
| Sources | Three student films (subtitle transcription) + Legislative Council proceedings (Presidential Election session, 12 Oct 2016) | same |
| Script / variety | Traditional Chinese, Hong Kong Cantonese, "spoken" genre | same |
| Annotation | **Manual** — UPOS, features and syntactic relations manually annotated by native annotators at City University of Hong Kong; lemmas assigned by a program and not manually checked | same |
| Licence | **CC BY-SA 4.0** | same |
| Phonetic transcription | **None documented** — no Jyutping | same |
| Training-source status | **Not listed among the training sources in the current PyCantonese `segment()` documentation** | author-supplied; consistent with the sources read |

**Do not adopt it automatically as complete Family H.** Three checks first, and one structural gap:

1. **Verify source overlap against every candidate's *actual training sources*** — not its bundled data. This must be done per candidate, including any self-trained model.
2. **Inspect segmentation suitability.** UD tokenisation is annotated for dependency parsing; whether its word boundaries match the segmentation contract §3 needs is a question of annotation guidelines, not of quality.
3. **Genre.** Film subtitles and LegCo proceedings are both "spoken"; neither is the written-Cantonese register (咗/嘅/喺 prose) that §3.6.1 identifies as the engine's core input. Coverage of D7-style constructions must be checked rather than assumed.
4. **It supplies no paired Jyutping gold.** M2 and M2o (reading accuracy through candidate vs oracle segmentation, CHG-033 item 4) require reading gold aligned to the same tokens. UD_Cantonese-HK gives segmentation gold only, so **the reading layer would still have to be annotated** even if the segmentation layer is adopted wholesale.

**Licence note.** CC BY-SA 4.0 is compatible with using the corpus for evaluation and with publishing derived annotations under the same terms; it is a share-alike consideration for any *derived corpus* the project publishes, not for the engine's code.

### 8.7.2 Revised procedure

1. **Inventory** every candidate segmenter's actual training sources, from documentation rather than packaging.
2. **Assess existing independent corpora** — UD_Cantonese-HK first, and any other manually segmented Cantonese corpus found — against overlap, segmentation-guideline fit, and register coverage.
3. **Adopt what survives** as the segmentation-gold portion of Family H.
4. **Annotate the shortfall only.** Two shortfalls are already visible: the **reading gold** (§8.7.1 item 4), which **no currently identified admissible corpus** supplies, and any **written-Cantonese register coverage** the adopted corpus lacks.
5. **Size the remaining hand-annotation by the staged pilot below**, if a shortfall remains.

### 8.7.3 Staged pilot — retained, but only for the shortfall

§6.16's 2,000–5,000-token figure had no basis, and sizing a corpus requires a variance estimate nobody has. If new annotation is still needed after step 4, the honest procedure is two-stage:

1. **Pilot: 500–800 tokens** of fresh written Cantonese, hand-segmented with paired reading gold, drawn from text demonstrably outside the candidates' sources (recent material, the author's own documents, or text the author writes).
2. Run all candidates on the pilot and measure the **spread in M2Δ** (segmentation-induced reading loss, CHG-033 item 4) between them.
3. **Size the full corpus from that observed spread.** If candidates differ widely, the pilot may already separate them and little more is needed. If they cluster, a much larger corpus is required to distinguish them — and that itself is a finding: candidates that cluster within noise can be chosen on the *other* criteria (explainability, bundle size, leakage verifiability) with a clear conscience.

This inverts the problem usefully. The expensive corpus is only needed if the cheap one fails to separate the candidates — and if it fails to separate them, the accuracy argument for the harder-to-verify candidate has evaporated anyway.

**Sourcing constraint for newly annotated material.** It must be verifiably outside every candidate's **actual training sources**. Text the author writes or holds remains the cleanest available source and has the side benefit of matching the register the Reader will actually process — which also addresses the register gap in §8.7.1 item 3.

**Inter-annotator agreement.** With one annotator, segmentation gold is one person's judgement. Where a competent annotator could disagree, the fixture records the alternative rather than asserting one (§6.16 requirement 2), and any published M1 states that it rests on single-annotator gold.

---

## 8.8 E — Recommended layered stack

Recommended on the evidence above, with each layer separately licensed (RULE-DEP-1).

### Readings (L2)

| # | Layer | Source | Licence | Role |
|---|---|---|---|---|
| 1 | User pronunciation dictionary | user | — | override (§3.5 step 1) |
| 2 | Entity-conditioned readings | entity-scoped pronunciation entries + surname table | — | surname/place readings (RULE-ENT-2) |
| 3 | **Word-level lexicon** | **rime-cantonese** | CC BY 4.0 | word-level polyphone disambiguation. Ordering vs layer 4 is a **hypothesis for §6 to test**, not a measured result |
| 4 | Supplementary word layer | CC-Canto | CC BY-SA 3.0 | isolated; breadth below rime-cantonese |
| 4b | Optional local layer | words.hk | NC 1.0 | **user-installed only** |
| 5 | **Character fallback** | **LSHK `jyutping-table`** | CC BY 4.0 | 29k characters incl. HKSCS-2001 |
| 6 | Last-resort character fallback | Unihan `kCantonese` | Unicode | post-HKSCS-2001 additions |
| 7 | — | — | — | `unresolved` |

**Frequencies** come from a separate corpus-frequency layer until DEC-…-042 is resolved.

### English forms and romanisation (L3R / L3E)

| # | Layer | Source | Role |
|---|---|---|---|
| 1 | User HK Romanisation glossary (entity-scoped entries) | user | E1a–E2 |
| 2 | **Official gazetteer** | Lands Dept Geographic Name snapshot | E3, whole-span lookup first (RULE-HKR-10) |
| 3 | Address/street layer | ALS / CSDI, on demand | E3, not bundled |
| 4 | Institutional official names | hand-curated | E4 |
| 5 | Class-level surname/syllable conventions | **must be built** (§8.9) | E6, with scope downgrade |
| 6 | **Fitted HK-style generator** | induced from the gazetteer **fit** partition only | E7 |
| 7 | — | — | `unresolved` |

This is the shape §2.6 and §3.5 already require; §8's contribution is that every layer now has an identified source and **publisher-facing licence terms identified** — artefact-level files and repository-internal licence material remain uninspected (§8.11) — except layer 5.

---

## 8.9 The remaining hole: surname conventions — **BLOCKED**

No authoritative source for Hong Kong surname romanisation conventions was found in this session, and §2.3.4 already recorded that none is known. This is a **structural** gap, not a search failure: there is no register of how people spell their names.

What can be built, and how it must be labelled:

1. Induce candidate surname spellings from the **gazetteer fit partition** where surnames appear in place names (limited but attested).
2. Supplement from descriptive compilations — **capped at E6**, `externalAttestation: "attested"` for the *class*, never for an individual, always with `scopeDowngrade` (RULE-HKR-5, RULE-HKR-8).
3. Record attestation counts where they exist so §2.3.3's dominance rule can operate, and mark competing forms `ambiguous` where they do not (蔡 → Choi/Choy).
4. Never promote a user's bearer entry into the class table (DEC-…-014).

Until built, personal-name romanisation falls straight to the generator, and every generated surname carries `confidence: low`. That is the correct behaviour, not a degraded mode.

---

## 8.10 Decisions

**Settled by §8:**

| ID | Resolution |
|---|---|
| DEC-…-011 | **Bundled snapshot with optional refresh — CONFIRMED.** DATA.GOV.HK terms permit bundling and redistribution with attribution |
| DEC-…-038 | **REOPENED (CHG-034 B).** Not settled. Correct state: **evaluate existing independent corpora first — UD_Cantonese-HK is a live candidate — and hand-annotate only the shortfall.** Exclusion requires evidence a corpus *trained* a candidate, not merely that a package bundles it. The reading-gold layer is a known shortfall that **no currently identified admissible corpus** supplies; the search was not exhaustive |

**Raised by §8:**

| ID | Question | Recommended | Confidence | Blocking? |
|---|---|---|---|---|
| DEC-LANG-20260828-042 | Are rime-cantonese weights usable as reading frequencies for RULE-JP-7? | **UNRESOLVED / BLOCKING for that use only (CHG-034 E).** How each weight was derived is not established either way. Conservative policy: do not use them as RULE-JP-7 frequencies until verified; a separate corpus-frequency layer is the safe provisional plan | The asymmetric risk is well-founded; the underlying fact is unverified | **Yes** for frequency use; **no** for adopting the lexicon |
| DEC-LANG-20260828-043 | Does the Lands Dept data carry stable per-record identifiers? | Unknown. If not, key snapshots on Chinese name + feature type and accept fragile diffs | Low — not established | No, but it shapes the refresh design |
| DEC-LANG-20260828-044 | PyCantonese in the target runtime | **AMENDED (CHG-034 A).** **Availability: SETTLED YES** — official Quickstart documents browser and Node use via Pyodide/WebAssembly with Rustling and PyCantonese emscripten wheels. **Suitability: BENCHMARK REQUIRED** — WASM/package payload, initialisation latency, memory cost, p95 segmentation latency, fit for the actual target environment | High on availability; unmeasured on suitability | Suitability blocks adoption, not evaluation |
| DEC-LANG-20260828-045 | Given the leakage problem, is PyCantonese benchmarked at all? | **Yes — against a Family H assembled per §8.7.2.** The constraint is narrower than the earlier draft implied: it must not be evaluated on HKCanCor, but an independent corpus such as UD_Cantonese-HK may be admissible once overlap is verified against its **actual training sources** | Medium-high | Coupled to DEC-…-038 |
| DEC-LANG-20260828-046 | Bundle a single precompiled lexicon, or keep layers separate at runtime? | **Separate (RULE-DEP-1).** Rationale corrected per CHG-034 C: layer isolation **minimises licence coupling and ambiguity over derivative-dataset obligations**, preserves independent provenance, and keeps layers removable — it is **not** an assertion that merging automatically inherits the most restrictive licence, which depends on the artefact's character and the specific licence and facts | **High** on the engineering rationale | **Yes** — it is a build-architecture decision |

---

## 8.11 Known limitations of §8

1. **Nothing was downloaded, installed or run.** Every finding is from publisher-facing pages read on 2026-08-28. File structures, actual entry counts, real coverage and real licence files inside the repositories are **unverified**.
2. **No licence review by a qualified person.** Licence names and headline terms are reported as published. The CC BY-SA propagation analysis and the NC-bundling conclusion in §8.6 are reasoning about published terms, not legal advice, and the words.hk per-entry question in particular deserves a real answer before anything ships.
3. **Every accuracy cell is BLOCKED.** No segmenter, lexicon or generator has been measured. §8 narrows the field on licence, runtime, verifiability and leakage grounds only.
4. **PyCantonese's runtime cost under Pyodide/WASM is unmeasured** — availability is confirmed, suitability is not (§8.4.1, DEC-…-044).
5. **HKSCS coverage of rime-cantonese is unverified**, and the LSHK table's HKSCS-2001 basis leaves an unmeasured gap against later revisions.
6. **No third strong deterministic segmenter was found** beyond max matching and a self-trained hybrid. The search was not exhaustive, and §8's comparison would improve with one more genuine candidate.
7. **The institutional official-name list does not exist** and its scope has not been defined — how many organisations actually matter for the author's documents is a question only the author can answer.

**SECTION COMPLETE — §8 Implementation / Dependency Options**

---

# §9 — Standalone Language Lab UI

**What the Lab is.** A developer- and author-facing inspection and dictionary-authoring tool over the current engine contract (**`contractVersion 5.0.16`**). Its job is to make the engine's reasoning visible and its dictionaries editable. CHG-050 specifies presentation semantics only and does not implement the Lab.

**What the Lab is not.** It is not the Reader, contains no Reader-specific assumptions, and is not a reading experience. It runs against `@hklang/engine` and `@hklang/style` only.

**RULE-LAB-1 (RECOMMENDED) — no second resolution path.** Every value displayed derives from the exact `Analysis` object the engine returned, or from a pure `@hklang/style` projection of it. The Lab contains **no linguistic logic**: no fallback, no tie-break, no re-derivation, no "helpful" defaulting of a null. If a field is empty on screen it is because the engine returned it empty. A Lab that computes anything itself stops being an instrument and becomes a second implementation to debug.

**RULE-LAB-2 (RECOMMENDED) — the debug view renders the debug payload.** The resolution trace shown to the user is `analysis.debug.trace`, not a reconstruction. Restates §1.5 principle 7.

---

## 9.1 Information architecture

Three **depth levels**, deliberately distinct. Mixing them is how a provenance-rich tool becomes unreadable.

| Level | Question it answers | Density | Default |
|---|---|---|---|
| **Ordinary view** | "What does the text say and sound like?" | Quiet. Source dominant, annotations subordinate. Only *two* provenance signals are ambient (§9.9) | **on** |
| **Inspector** | "Why this value, for this span?" | Dense but scoped to one selection. Full envelope, candidates, evidence | on demand |
| **Debug / trace** | "Which resolution steps ran, and which fired?" | Maximal. Deterministic chain traces and lattice; host/benchmark timing may be displayed alongside, outside `Analysis` | opt-in, off by default |

**RULE-LAB-3 (RECOMMENDED) — density is managed by hierarchy and disclosure, not by badges.** Provenance must be *inspectable and unambiguous*, which is not the same as *permanently visible*. A view that badges every token with provenance, evidence class and confidence trains the reader to ignore all of them — and the badge that matters most (a generated name asserted as fact) is then the one that disappears into the noise. Permanent ambient marking is reserved for the two distinctions that change what a reader should believe (§9.9).

### 9.1.1 Layout

```
┌───────────────────────────────────────────────┬─────────────────────────┐
│  INPUT + CONTROLS                             │  INSPECTOR              │
│  ┌─────────────────────────────────────────┐  │  (selection-driven)     │
│  │ text input / paste                      │  │                         │
│  └─────────────────────────────────────────┘  │  ── Channels ──         │
│  [Analyse]  view: Source │ Jyutping │ HK      │  L2  reading            │
│             Rom │ Entities │ Directives      │  L3R romanisation       │
│                                               │  L3E english form       │
│  ┌─────────────────────────────────────────┐  │                         │
│  │ ANALYSIS SURFACE                        │  │  ── Evidence ──         │
│  │ source text with subordinate annotation │  │  provenance / class /   │
│  │ span selection                          │  │  attestation / source   │
│  └─────────────────────────────────────────┘  │                         │
│                                               │  ── Candidates ──       │
│  ┌─────────────────────────────────────────┐  │  (ambiguous/conflict)   │
│  │ DIAGNOSTICS  (collapsed when empty)     │  │                         │
│  └─────────────────────────────────────────┘  │  [Add to dictionary…]   │
└───────────────────────────────────────────────┴─────────────────────────┘
   Dictionaries · Directives · Data layers & versions · Debug   (top-level tabs)
```

Top-level areas: **Analyse** (above), **Dictionaries** (§9.12), **Directives** (§9.11), **About / Data layers** (§9.15), **Debug** (§9.8).

---

## 9.2 Input and analysis workflow

| Element | Behaviour |
|---|---|
| Text input | Multi-line, monospace-optional, no auto-formatting, no smart quotes, **no normalisation** — INV-1 must survive the input box |
| Analyse | Explicit action, not on every keystroke; long inputs must not lock the UI — see the note below |
| Options | `latinReadingPolicy`, `numberReadingPolicy`, `phoneticComponentHeuristic`, `debug.lattice`, `debug.trace`, and explicit current-call `documentTags`. Each labelled with its default |
| Document context | **Input, not a mode** — see §9.2.1 |
| Document tags | Opaque exact/case-sensitive Store-matching labels with set semantics. The Lab deduplicates them visibly and never infers them from context id, filename, Reader state or external metadata |
| Re-analysis banner | When an option or a dictionary changes, the surface marks itself **stale** and offers re-analysis rather than silently showing mixed state |
| Sample loader | Loads §6 fixtures by id, so the Lab doubles as a fixture viewer |

**Non-blocking execution is a Lab/host concern, not an engine signature change (CHG-035 J).** The requirement that a long analysis must not freeze the interface is satisfied by the **host**: a Web Worker, a worker thread, or an optional async wrapper around the synchronous core. **DEC-…-032 is SETTLED for v1**: core `processText` is synchronous as specified in §5.10, while provider acquisition and any non-blocking wrapper/orchestration remain outside that signature. §9 imposes no additional constraint on the engine's signature.

### 9.2.1 Document context is an input, never a mode (CHG-035 D)

Any "on/off" framing would imply ambient memory that persists between calls, which RULE-ENT-8 forbids and INV-7 would fail on. The Lab's controls are therefore about **constructing an explicit input**:

| Control | Meaning |
|---|---|
| **No document context** | `documentContext` is omitted; entity memory is intra-call only |
| **Use explicit context: `<context id>`** | A specific `DocumentContext` object is passed as input; its id is shown |
| **Import / inspect context** | View or load a context object; its entity list is inspectable before use |
| **Carry selected entities forward** | An explicit user action that **constructs a new `DocumentContext`** from chosen entities |

**RULE-LAB-10 (RECOMMENDED).** The Lab **must not** silently reuse the previous call's entities because a mode remained enabled. Every carry-forward is a user act that produces a visible `DocumentContext` object with an id and a content summary — and therefore changes `optionsHash` and the analysis cache key, exactly as the current contract requires. The Lab displays the resulting `optionsHash` change so the effect on caching is observable rather than assumed.

`ProcessOptions.documentTags` is a different explicit input. It supplies current-call Store-matching labels only; omission/empty means none, exact duplicates and order add no semantics, and `DocumentContext.id` is never treated as a tag. The Lab presents the two inputs separately and derives neither from the other.

**Options that are *not* here.** `protectionConfidenceFloor` and the person-name style profile are **projection** settings and live in the Directives tab (§9.11). Placing them beside the analyse options would imply they re-run the engine, which they must not (RULE-API-11, RULE-API-7).

---

## 9.3 Source display and span selection

- Source text is rendered **verbatim**, at the largest type size in the interface. Everything else is subordinate.
- Token boundaries are shown by faint spacing cues, not boxes or borders.
- **Selection is by span.** Click a token; drag across tokens; click an entity to select its whole span. The current selection is echoed as `[start, end)` in `offsetUnit` (`utf16`), because a developer debugging an offset bug needs the number.
- Non-BMP characters (𨋢, 𡃁) must select as **one character** even though the span length is 2. The Lab is the first place a surrogate-splitting bug would show, so selection is deliberately span-faithful and grapheme-safe.
- Selecting nothing shows document-level summary in the inspector, not an empty panel.

---

## 9.4 Jyutping view (L2)

- Jyutping renders **subordinate** to the source: smaller, lower contrast, positioned consistently (above or below — a single setting, not a per-token choice).
- Alignment follows the syllable spans (§3.2). `align: "grouped"` syllables render against their group's span without fabricating per-character positions.
- **Tone digits are always shown.** The Lab is an instrument; hiding tone would make it a worse one.
- `out_of_scope` tokens (Latin, punctuation) show **nothing** — not an empty slot, not a dash. `unresolved` tokens show a distinct neutral placeholder. **These two must never look alike** (RULE-JP-4): one is silence, the other is a gap.
- Ambiguous readings show the top-ranked candidate **in a visually unresolved treatment** with a candidate count, per RULE-API-3 — the Lab may display `alternatives[0]` but must not present it as resolved.

---

## 9.5 General HK Romanisation view (L3R)

A first-class view, not an entity feature — DEC-…-009 makes general romanisation a v1 capability over any Cantonese-readable span.

- Renders `token.romanisation` for the whole text, aligned like the Jyutping view.
- Assembled units are **caseless in the data**; the view applies a casing profile from `@hklang/style` and **names which profile is applied**. It does not invent casing locally.
- Where an entity has both a verbatim L3R and a different L3E, the ordinary view shows the **L3R** here — this view is "how it would be spelled", not "what it is called". The difference is the point of having two channels, and the inspector shows both side by side (§9.6).

---

## 9.6 Entity inspector — three simultaneous channels

The inspector is where DEC-…-001's named sibling fields earn their keep. For a selected entity, **L2, L3R and L3E are shown together, never merged, never one substituted for another**.

```
梁知遙                                    person · primary · span [8,11)

  L2   reading            loeng4 zi1 jiu4
       lexicon · resolved · medium · attestation n/a

  L3R  romanisation       Leung Chi-yiu                    ← verbatim
       user_glossary · E1a · resolved · high · not attested externally

  L3E  english form       Leung Chi-yiu                    ← verbatim
       user_glossary · E1a · resolved · high · not attested externally
       derived from L3R — no known English form · direct store read: no

  structure  surname 梁 [8,9)   given 知遙 [9,11)
  detection  D1 entity-scoped HKR entry
```

And the contrasting case, which the Lab must make legible at a glance:

```
彌敦道                                    street · primary · span [0,3)

  L2   reading            nei4 deon1 dou6
  L3R  romanisation       nei tun to                       ← assembled (generated)
  L3E  english form       Nathan Road                      ← verbatim
       convention_table · E3 · resolved · high · attested
       source: landsd-geographic-name · asOf 2026-08-01
```

**RULE-LAB-4.** The inspector never shows one channel "instead of" another, never blanks a channel because another is populated, and labels `out_of_scope` explicitly rather than leaving a channel empty.

`derivedFrom` is rendered as a **relationship**, not a badge: a line saying which channel the value came from, why, and whether Chain B read the store directly. A click follows the dedicated `RomanisationRef` to the source romanisation annotation.

---

## 9.7 Ambiguity and conflict inspection

This is why `Candidate<T>` carries its own evidence (CHG-032 item 4): the Lab must answer *"why is candidate A here, and why is candidate B here?"* from the returned object alone, with no second computation.

```
蔡  (surname)                    status: AMBIGUOUS · ranked · 3 candidates

  1  Choi     convention_table · E6 · attested · class scope
              attestation count 412 · support medium
  2  Choy     convention_table · E6 · attested · class scope
              attestation count 388 · support medium
  3  Tsoi     convention_table · E6 · attested · class scope
              attestation count  57 · support low

  ⓘ No value is selected. Ranking reflects attestation counts and does
    not resolve the ambiguity.                        [Pin one to glossary…]
```

| Status | Presentation rules |
|---|---|
| `ambiguous` | Candidates **ranked**, ordering shown, each with its own provenance/evidence/attestation/support/count. An explicit note that **no value was selected** — the UI must not let ranking read as resolution |
| `conflict` | Candidates **unordered**, presented as equals, with a prominent statement that two sources of equal authority disagree and the engine declined to choose. Resolution workflow offered (§9.13) |
| `unresolved` | `reason` shown in plain words; no candidates fabricated |
| `unsupported` | `reason` shown; the raw source shown alongside |
| `out_of_scope` | Channel hidden with a one-line explanation on hover, not an empty row |

**Pinning a candidate** is the Lab's single most valuable action. Two distinct actions, because scope must follow stated intent, not inference (CHG-035 C):

| Action | Pre-filled `entryScope` | Rationale |
|---|---|---|
| **Pin to glossary…** (generic) | **`lexical`** — the DEC-…-031 default, *even when the selected span is an entity* | Selecting an entity span says nothing about whether the user wants an entity-scoped rule. Auto-switching would silently re-introduce the failure DEC-…-031 exists to prevent, since an entity-scoped entry can create protected spans |
| **Save as entity override…** (explicit) | **`entity`** may be preselected | The action's own name states the intent, so preselection reflects a choice the user made |

Both open the dictionary editor pre-filled with the selected span and candidate, with `evidenceClass: E1a` as the default (§9.12.2). **Entity scope still shows the persistent §9.12.1 warning before save**, in both paths — a preselected value is not a confirmed one.

---

## 9.8 Resolution trace / debug

Opt-in (`options.debug.trace`), rendered directly from `analysis.debug.trace` (RULE-LAB-2).

```
L3E  梁知遙                                          Chain B
  1  translation store (entity-scoped)     ─ miss
  2  entity-scoped store entry (E1c/E2)     ─ miss
  3  gazetteer (E3)                        ─ miss
  4  institutional (E4)                    ─ miss
  5  public attestation (E5)               ─ miss
  6  generic decomposition                 ─ n/a (person)
  7  L3R fallback                          ✓ FIRED   → verbatim, user_glossary/E1a
     (no step 8: lexical/phrase translations are L4 directives, not Chain B — CHG-042 A)
```

Also in Debug: the segmentation lattice (`options.debug.lattice`), inert vs consequential ambiguity counts, rule-pack accuracy metadata (`rulePackAccuracy`) including the sibilant sub-accuracy, and the raw `Analysis` JSON with copy. The Lab may show per-stage timings from host/benchmark instrumentation alongside this view, but timings are not serialised into `Analysis`, whose fixed-input bytes remain deterministic (INV-7).

L4 traces render from `analysis.termResolutions`, not from the projected directive list. A resolved term shows its selected entry and the concrete directive it can project; an equal-authority conflict shows the unordered entry-bearing candidates, a null selected value, and the explicit result **“no directive projected”**. The Lab must not infer a preferred string from candidate order (CHG-044 H).

**The raw JSON view is normative, not a convenience.** It is how a developer confirms the Lab is not embellishing.

---

## 9.9 Generated vs verbatim — the two ambient distinctions

**RULE-LAB-5 (RECOMMENDED, corrected by CHG-035 G).** Exactly two distinctions are marked in the **ordinary** view. Everything else is inspector-level.

| Distinction | Why it is ambient | Treatment |
|---|---|---|
| **assembled (engine-generated) vs verbatim** | It is the difference between a form the engine built and a form someone asserted — the one thing a reader must not mistake | A restrained, consistent mark on the value: a subtle differing weight or a hairline underline. Not a coloured badge, not a word |
| **selected value present vs no selected value** | It is the difference between an answer and the absence of one | Two distinct treatments; a candidate count where relevant |

**The status grouping, corrected.** The earlier wording "resolved vs not-resolved" left `fallback` undefined — and `fallback` is the single most common non-`resolved` status in this engine, so leaving it unplaced was a real gap.

| Group | Statuses | Ordinary-view treatment |
|---|---|---|
| **Selected value present** | `resolved`, `fallback` | Normal value treatment. `fallback` is **not** styled as a null state |
| **No selected value** | `ambiguous`, `conflict`, `unresolved`, `unsupported` | Distinct no-answer treatment; candidate count where applicable |
| **Not applicable** | `out_of_scope` | **No ordinary annotation at all** — not an empty slot |

**`fallback` sits in the first group deliberately.** It carries a real value the user can read and use, so styling it like a gap would misrepresent it. But it must never be presented *as* `resolved`: the inspector always shows it as `fallback`, with its provenance and evidence class, and the ambient assembled/verbatim mark usually distinguishes it in the ordinary view anyway, since most fallbacks are assembled. Where a fallback is verbatim (the §4.9 L3R route), the ordinary view shows an ordinary value — which is correct, because that is what it is.

Evidence class, attestation state, exact provenance, cautions, scope downgrades and `derivedFrom` are all **inspector-level**. They are one click away and never hidden; they are simply not competing with the source text for attention.

A legend is available and dismissible. The marks must be legible without colour alone.

---

## 9.10 Person-name style preview

Uses `@hklang/style` only. Its purpose is as much **demonstration as configuration**: it proves RC-4 visually.

```
Person name style
  Hyphenated   Leung Chi-yiu
  Joined       Leung Chiyiu
  Spaced       Leung Chi Yiu
  Hyphen title Leung Chi-Yiu
  Surname caps LEUNG Chi-yiu

  陳大文   E1b creator-canonical  Chan Tai Man                 unchanged ✓
  香港大學 E3 official           The University of Hong Kong   n/a — not a person
```

**RULE-LAB-6.** The generic Lab preview offers all five `StyleProfile` members in declaration order and lists both changed and **unchanged** rows. It preserves caller order and duplicates when displaying a caller-supplied `renderVariants` request. Verbatim forms are marked unchanged explicitly. `surname_caps` is labelled a Lab-only presentation exception and never appears in a `GeneratedPersonNameStyle` control.

Mixed and non-person assemblies make the unit boundary visible in the inspector: in *Peter Chan Tai-man Road*, literal *Peter* and translated *Road* remain byte-exact; licensed given-name runs alone receive joining transformations. Non-target romanised units share the same base casing across the first four profiles; only `surname_caps` may additionally uppercase a romanised surname. *Nei Tun Road* is non-person and renders identically under all five. A person form with no licensed generated given unit shows joining as not applicable, while still previewing the explicit surname-caps exception where a romanised surname exists.

Style changes must be visibly instantaneous and must not trigger re-analysis. The Lab surfaces a small indicator confirming that no pipeline work occurred — the visible counterpart of test T-API-005.

---

## 9.11 Translation-directive inspector

Renders `projectTranslationDirectives(analysis, settings)`. **Settings live here, not in the analyse options**, because they are projection inputs.

| Control | Effect |
|---|---|
| `generatedPersonNameStyle` | **Hyphenated / Joined only** — the type is `GeneratedPersonNameStyle`, not the Lab's wider `StyleProfile` (CHG-042 D). The Lab's other profiles are presentation-only and are not offered here |
| `protectionConfidenceFloor` | **No minimum** / low / medium / high — see below |
| Re-project indicator | Confirms the `Analysis` and its cache key were unchanged (RULE-API-11) |

**Labelling the `none` floor (CHG-035 H).** `Confidence` is `"none" | "low" | "medium" | "high"`, so a floor of `none` means *the lowest confidence threshold* — every detected entity meets that threshold, while all other projection legality rules still apply (selected English form, unambiguous boundary, primary nesting). Rendering it as "None" would read as "protection disabled", which is the **opposite** of what it does. It is therefore labelled **"No minimum"**.

If a genuine "disable protection entirely" control is ever wanted, it is a **separate projection option** and is not invented here.

Four lists, each empty-state-explicit:

1. **Protected spans** — span, source text, replacement, `formKind`, `assembled`, provenance, evidence class, attestation, `protection` level, `styleApplied` (or an explicit *none — not applicable*, with verbatim/non-person/unstyled reason), rationale.
2. **Term directives** — L4 lexical/phrase guidance, with a standing note that these are **not** entities.
3. **Unresolved semantic spans** — with source `status`; `reason` is shown and required only for `unresolved`/`unsupported`, while `ambiguous`/`conflict` deliberately carry no invented reason. All are described as *"left to the consumer to translate"*, never as errors.
4. **Projection diagnostics** — rows from `TranslationDirectives.diagnostics`. For `TERM_DIRECTIVE_DROPPED_OVERLAP`, show the required dropped-directive span and any optional structured entry/entity ids; never infer or read it from `Analysis.diagnostics`.

**A protection-preview toggle** renders the source with protected spans marked in place. This is the fastest way to see a false positive — an ordinary 李 highlighted as protected is immediately visible here and nowhere else — which is why the view exists at all (§4.11.1).

---

## 9.12 Dictionary editors

Three editors, **visually and structurally parallel**, one per store. Parallel presentation reinforces INV-12: they look like three separate things because they are.

Common layout: searchable list · entry detail · validation state · enable/disable · import/export.

| Field | Presentation |
|---|---|
| key / value | store-appropriate input; pronunciation values validated live against RULE-JP-2 with the invalid syllable shown, never silently corrected |
| **`entryScope`** | Three-way control: **lexical** (default) · phrase · entity — see §9.12.1 |
| `entityTypeHint` | Only when scope is `entity`; labelled as a ranking prior, not a decision |
| **`formKind`** | Required and shown only in the translation editor when `entryScope:"entity"`; all five `FormKind` choices are offered. Hidden/forbidden for pronunciation, HK-Romanisation and lexical/phrase translation entries. The editor states that the stored value is exact/verbatim and carries no assembly units |
| **`caseSensitive`** | Persisted checkbox on every entry, default off. For Latin-containing keys, off means case-insensitive matching and on means exact case-sensitive matching; changing key spelling never changes the setting |
| `match` / `context` | exact vs contextual; neighbour, entity-type and document-tag filters. A document-tag filter is an opaque exact/case-sensitive label evaluated against the current analysis call's explicit `documentTags`; it is never inferred from document metadata or affected by StoreEntry `caseSensitive` |
| **`evidenceClass`** | See §9.12.2 |
| `externalAttestation` | See §9.14 |
| `attestation` | Independent documentary fields (`scope`, `sourceRef`, `asOf`): required for E2, permitted for E1c, and exactly null/absent as §5 requires for E1a/E1b. The editor never derives this from `externalAttestation` |
| `enabled` | Disabled entries stay visible and greyed, never hidden |
| `verifiedAt` | A property of the record, with a "mark verified" action — never conflated with `status` |
| `validation` | Errors shown inline; invalid entries are stored **disabled**, never dropped |
| revision / timestamps | shown in detail view |

### 9.12.1 `entryScope` — the warning that must not be buried

Selecting **entity** scope shows a persistent, non-dismissible note in the editor:

> **Entity scope creates entity candidates.** This entry will cause matching spans to be detected as named entities, which can make them *protected from translation*. Use lexical or phrase scope for ordinary words and expressions.

And on **lexical** / **phrase**:

> Lexical and phrase entries affect their own layer only. **They do not create entities** and will never produce a protected span.

The reason for the emphasis is §4.11.1: an over-scoped entry does not merely add noise, it can silently freeze an ordinary word in downstream translation output. `lexical` is the default precisely so the low-friction path cannot manufacture entities (DEC-…-031).

### 9.12.2 Evidence-class control

A four-way choice with plain-language labels, **E1a default**:

| Control label | Class | Helper text |
|---|---|---|
| **My preferred form** | **E1a** *(default)* | How you want it rendered. Makes no claim about outside usage |
| My own creation | E1b | You define this name — a character, project or place you created |
| Someone's own spelling (reported) | E1c | You know how this person or organisation spells it |
| Documented spelling | E2 | You have a document showing this spelling |

**RULE-LAB-7.** The control never presents E3–E7 as user choices — those are engine-side evidence classes and a user cannot confer them. And `evidenceClass` is presented as *"what kind of evidence backs this"*, adjacent to but plainly separate from the fact that **all four win the resolution race equally** (RULE-HKR-5a). The Lab states that once, in the editor, rather than letting the user infer that E1a is somehow weaker in effect.

Import preview applies the same closed domain. A JSON row carrying E3–E7 is shown as invalid and can never be applied or silently enabled. JSON preview/apply/export round-trips the conditional `formKind` and required `caseSensitive` fields; a CSV path identifies either omission as lossy before import (CHG-044 A/C/I).

---

## 9.13 Conflict resolution workflow

Triggered by a `conflict` status, reachable from the inspector, the diagnostics panel, and the dictionary list.

```
Conflict — 梁知遙 · HK Romanisation glossary

  A  Leung Chi-yiu    E1a · enabled · created 2026-08-12 · rev 2
  B  Leung Chiyiu     E1a · enabled · created 2026-08-20 · rev 1

  Two enabled entries of equal authority match this span. The engine
  produced no value and no protected span.

  [Keep A, disable B]  [Keep B, disable A]  [Add a context filter…]  [Leave unresolved]
```

**RULE-LAB-8.** The Lab **never offers "pick one automatically"** and never pre-selects an option. Every route is an explicit user act on a specific entry, with the effect stated. **Leave unresolved** is a first-class, non-punitive choice — an unresolved conflict is a correct engine state, not an error to be cleared.

---

## 9.14 `externalAttestation` presentation

Three states, three distinct presentations. **`not_attested` and `not_applicable` must never render alike** (CHG-032 item 6) — collapsing them is exactly the confusion the tri-state was introduced to remove.

**What this field does and does not answer (corrected, CHG-035 B).** `externalAttestation` answers exactly one question — *is there external attestation for this value?* It does **not** answer output precedence, authority, confidence, or whether the value was engine-generated. **Authority must never be derived from this field alone.**

The earlier helper text glossed `not_attested` as "authoritative for your documents". That is false for **E7 generated output**, which is also `not_attested` and is the weakest value the engine produces. Withdrawn.

| State | Ordinary view | Inspector wording |
|---|---|---|
| `attested` | ambient only where relevant | **"External use is attested."** Show source metadata (`sourceRef`, `asOf`, scope) where available |
| `not_attested` | — | **"No external attestation is carried for this value."** *Inspect provenance, evidence class and status to understand why the value exists and how strongly it should be treated.* |
| `not_applicable` | — | **"External attestation is not a meaningful property of this layer."** e.g. a Cantonese reading |

The two `not_attested` cases the wording must serve equally well: a creator-canonical E1b name (authoritative for the author, unattested outside) and an E7 generated romanisation (a guess). The field is identical; **everything that distinguishes them lives in `provenance`, `evidenceClass` and `status`**, which is why the helper text points there instead of asserting anything itself.

For StoreEntries the editor derives this field from layer/scope before it considers user evidence: pronunciation/L2 and lexical-or-phrase translation/L4 always show `not_applicable`; HK-Romanisation/L3R and entity translation/L3E show E1a/E1b as `not_attested` and E1c/E2 as `attested`. Documentary `attestation` remains a separate field: E2 still requires it even in L2/L4, where external-attestation applicability is `not_applicable` (CHG-044 C).

No view omits the field. Where it is `not_applicable` the inspector says so rather than hiding the row, because a missing row is indistinguishable from a bug.

---

## 9.15 Gazetteer / convention source inspection

**RULE-LAB-11 (RECOMMENDED, CHG-035 E) — display what the contract guarantees; never re-query.** `Analysis` guarantees source *metadata* (`scope`, `sourceRef`, `asOf`). It does **not** guarantee any API for retrieving the underlying gazetteer or convention-table row.

| Capability | Status |
|---|---|
| Display `scope`, `sourceRef`, `asOf` and the originating data layer | **REQUIRED** |
| Copy or open `sourceRef` | **Permitted** |
| **"Show source row"** — render the underlying convention record | **OPTIONAL.** Appears **only** when the Lab host injects a source-inspection adapter; absent otherwise, without a broken affordance |

The Lab **never reconstructs or re-queries linguistic evidence on its own.** Doing so would be a second resolution path (RULE-LAB-1) wearing the costume of a convenience feature: a row fetched independently could disagree with the row the engine actually used, and the Lab would then be displaying evidence for a value it did not produce.

`caution: stale_source` (RULE-HKR-6) renders as a quiet note with the age, not an alarm — an old gazetteer row is usually still correct.

---

## 9.16 Diagnostics panel

Collapsed and silent when empty. Grouped by severity and labelled by origin: **creation**, **current Analysis**, **current directive projection**, and any separately labelled **host/orchestration** notices. Each public diagnostic shows `code`, `severity` and `message`; a span link is shown only when `span` exists.

Creation diagnostics come directly from `EngineCreationResult.diagnostics` and are observable before any Analysis. Warnings from a successful creation are pinned for that Engine's lifetime — `LEXICON_MISSING_CAPABILITY` in particular, since a lexicon without frequency data degrades every polyphone resolution (§5.13). A failed creation displays its non-empty diagnostics even though `engine:null` means no Analysis can exist. Analysis diagnostics come only from the current `Analysis.diagnostics`. Projection diagnostics come only from the current `TranslationDirectives.diagnostics`, refresh whenever source or projection settings change, and disappear when that array is empty. The UI may aggregate these groups for presentation but never silently merges their contract data or loses origin.

---

## 9.17 About / data layers panel

The Lab's honesty surface, and the place attribution obligations are met.

**Its data comes from an explicit manifest (CHG-035 E).** Data-layer identity, versions, snapshot dates and licence text are supplied to the Lab as a **build/runtime manifest**, not inferred from analysis values. A `sourceRef` appearing in an annotation tells the Lab which layer produced that value; it does not tell it what that layer is, what version it is, or what its licence says. Inferring layer metadata from observed values would be operational guesswork presented as fact — and would silently under-report any layer that happened not to fire on the current text.

The manifest is **operational metadata, not a second linguistic resolution path**: nothing in it is used to compute, alter or explain a linguistic value.

| Section | Contents |
|---|---|
| **Versions** | The complete `Versions` record: `schemaVersion`, `contractVersion`, `engineVersion`, `lexiconVersion`, `rulesVersion`, `segmenterVersion`, `userDataVersion` — copyable as one block for bug reports |
| **Active data layers** | Each separately licensed layer (RULE-DEP-1): name, version/snapshot, `asOf`, `retrievedAt`, licence as published, enabled state |
| **Attribution notices** | Rendered in full — DATA.GOV.HK attribution, CC BY attributions, and any share-alike notices. **Not collapsible**, because these are obligations, not decoration |
| **M7 denominator** | The exact inventory backing any HKSCS coverage figure: resource, revision basis, version, snapshot date, character count (§6.13.1) |
| **Rule-pack benchmark metadata** | Shown **only** when supplied by the current `analysis.debug.rulePackAccuracy` payload or by explicit version/build metadata: syllable and whole-name exact match, **sibilant sub-accuracy**, the fit/eval split id, and which evaluation mode produced each figure (§6.9). The Lab **never recomputes it** |
| **Not-legal-advice notice** | One line, matching §8.6 |

**RULE-LAB-9.** Where benchmark metadata is absent — not in the debug payload and not in build metadata — the panel says **"not yet available / not yet measured"**. It never shows a blank, a zero, an estimate, or a figure it derived itself. A tool that displays an unmeasured quantity as a number is doing the thing this entire packet exists to prevent.

---

## 9.18 Unknown enum values (RULE-API-9)

The Lab is the reference implementation of *tolerance without coercion*.

| Requirement | Lab behaviour |
|---|---|
| Preserve the raw value | Displayed verbatim as **`unrecognised (<raw>)`** |
| Explicit unknown branch | A distinct neutral presentation, unlike any known state |
| Degrade conservatively | Treated **as if** unresolved for interaction: no protection preview, not offered as a pinnable candidate |
| **Never coerce** | Never rendered as a known category; never written back as a known member; the stored value is never rewritten |

**Export behaviour, split by export kind (CHG-035 F).** The earlier blanket statement that unknown values are "excluded from exports" was wrong for the export that matters most.

| Export kind | Obligation |
|---|---|
| **Raw / round-trip structured export** (JSON, debug dump, store export) | **MUST preserve unknown raw enum values unchanged.** Dropping them would corrupt the round trip and destroy the forward-compatibility RULE-API-9 exists to provide |
| **Filtered or authority-asserting export** (a protected-span list, a directive projection, anything a downstream consumer will act on) | **MAY** omit a value whose semantics it does not understand — but **MUST state that it did so and why**, naming the field and the raw value |

Silent omission is forbidden in both cases. Encountering an unknown value raises a Lab/consumer-local `info` compatibility notice naming the field and the value — usually a version mismatch, which is worth telling the user. It is not fabricated as a public engine `DiagnosticCode`.

---

## 9.19 States

| State | Presentation |
|---|---|
| Empty (no input) | A short explanation of what the Lab does and a sample-loading affordance. Not a blank canvas |
| Analysing | Non-blocking progress (host-provided — §9.2); the previous result stays visible and marked stale rather than being cleared |
| Empty result (empty input) | Valid, not an error: "no text to analyse" |
| Stale | Result visible, marked stale, with a re-analyse action — never silently mixed state |
| Degraded creation — missing lexicon capability | `EngineCreationSuccess.diagnostics` banner naming exactly what degrades (e.g. "no frequency data: polyphones will be reported as ambiguous"), available before the first Analysis and pinned while the live Engine is used |
| Degraded — layer unavailable | Named layer marked inactive in About; affected values fall through and are marked accordingly |
| Semantic creation failure — invalid ProviderSnapshot | `EngineCreationFailure`: show non-empty `PROVIDER_SNAPSHOT_INVALID` diagnostics; `engine:null`, so no analyse action or Analysis exists |
| Engine error (programmer error only) | Full error, `Versions` block, and a copy-report action. `processText` never throws for content (RULE-API-8), so a thrown error is a bug and is presented as one |
| Store write failure | Explicit; the entry is not silently lost |

---

## 9.20 Keyboard and accessibility

- **Keyboard-first navigation, one composite region (CHG-035 I).** The analysis surface is a **single** keyboard region, not a sequence of focusable tokens. Making every token a Tab stop would give a long document thousands of sequential stops and make the Lab unusable by keyboard — the opposite of the intent.

| Key | Behaviour |
|---|---|
| `Tab` / `Shift+Tab` | Enter and leave the analysis surface as a whole |
| Arrow keys | Move the active selection between tokens and spans **within** the surface |
| `Enter` | Open the inspector for the active selection |
| `Escape` | Close the inspector and return focus to the surface |

Implemented with a **roving `tabindex`** or an **`aria-activedescendant`** pattern, so exactly one element in the surface is tabbable at a time while the active span is announced as it moves.
- Shortcuts for the high-frequency loop: analyse, cycle view, toggle debug, pin selection to a dictionary.
- **No information conveyed by colour alone** — every ambient distinction (§9.9) has a non-colour carrier (weight, underline, glyph).
- Contrast: source text at the highest contrast available within the cold palette; annotations subordinate but still meeting normal text-contrast requirements. **"Subordinate" must be achieved by size and weight, not by contrast so low it fails accessibility** — a constraint the cold, low-noise palette makes easy to violate.
- Chinese text renders in a font stack with HKSCS and non-BMP coverage; where a glyph is missing, the Lab shows the code point rather than a replacement box with no explanation.
- Screen readers: annotations are associated with their source spans; provenance is available as accessible text, not only as a visual mark. Ambiguous values announce as ambiguous.
- Respects reduced-motion preferences; no motion is load-bearing.

---

## 9.21 Visual direction

Constraints given by the author, restated as design rules:

| Constraint | Application |
|---|---|
| Cold palette only; no warm colours | Neutral slate/blue-grey ground; the few accent hues stay on the cool side |
| No pure white, no pure black | Off-white and near-black ground and text |
| Soft, quiet, slightly clinical | Low chroma throughout; instrument, not dashboard |
| Low visual noise | No card shadows, minimal borders, generous whitespace, hairline separators |
| No unnecessary gradients | Flat surfaces; gradients only if they carry information, which here they do not |
| Annotations subordinate to source | Source is the largest, highest-contrast element on screen; annotations smaller and lighter |
| Desktop-first, responsive | See §9.22 |

**Semantic colour is rationed.** At most three semantic signals — unresolved/ambiguous, conflict, and diagnostics severity — each with a non-colour carrier. `assembled` vs `verbatim` is deliberately **not** a colour: it is the most frequent distinction on screen, and colouring it would fill the view with signal that stops being read.

**Do not spend disproportionate effort here before the language architecture is settled.** The palette is a small, late decision; the channel model is not.

---

## 9.22 Responsive behaviour

Desktop-first. Two breakpoints, no more.

| Width | Layout |
|---|---|
| Wide | Analysis surface + inspector side by side, as §9.1.1 |
| Medium | Inspector becomes a right-hand drawer over the surface |
| Narrow | Single column; inspector is a full-height sheet; view switching becomes a segmented control. Dictionary editing remains usable; debug and lattice views may be reduced to raw JSON |

Long content — the source surface, candidate lists, protected-span lists, the raw JSON — scrolls **within its own container**. The page never scrolls horizontally.

---

## 9.23 Decisions raised by §9

| ID | Question | Recommended | Confidence | Blocking? |
|---|---|---|---|---|
| DEC-LANG-20260828-047 | Does the Lab persist stores to disk itself, or accept an injected `StoreApi`? | **Injected**, with a local JSON-file implementation as the default — keeps the Lab free of persistence logic and lets a future host supply its own | Medium-high | No |
| DEC-LANG-20260828-048 | Are Jyutping annotations above or below the source? | Configurable; **above** as the default (ruby convention) | Low — cosmetic | No |
| DEC-LANG-20260828-049 | Does the Lab ship a fixture-runner view for §6? | **Yes, minimally** — load a fixture by id, show expected vs actual. The Lab is already the best diff viewer available and the marginal cost is small | Medium | No |
| DEC-LANG-20260828-050 | Does the Lab expose an "explain this value" narrative generated from the trace? | **Not in v1.** A narrative is a second representation that can drift from the trace. Show the trace | Medium-high | No |

---

## 9.24 Known limitations of §9

1. **No visual design exists** — no palette values, type scale, spacing system or components. §9 is a functional and behavioural specification.
2. **Not usability-tested.** The three-level density model (§9.1) is a reasoned response to the packet's provenance volume, not a validated one; it may prove too shallow or too deep in practice.
3. **The Lab cannot show what the engine did not find.** Missed entities and missed readings are invisible here by construction; only §6's corpus measures recall.
4. **Fixture-viewer scope is undefined** (DEC-…-049) — how much of the §6 runner belongs in the Lab is unsettled.
5. **Font coverage for HKSCS and non-BMP characters is an unsolved practical problem.** §9.20 specifies the fallback behaviour but not which fonts actually achieve coverage on the author's platforms.
6. **Nothing here is reconciled with the Reader**, deliberately. Any resemblance between a Lab view and a future Reader view is coincidental and must not be treated as an integration decision.

**SECTION COMPLETE — §9 Standalone Language Lab UI**

---

# §10 — Caching and Performance

**Purpose.** Specify caching that is provably semantics-preserving, and a measurement protocol that produces real numbers. It does not set performance targets: no cache/performance implementation or benchmark has been built or run. The separate Range 0A/0B packages are bounded historical evidence (§7/§12), not cache work; CHG-046/047/048 update only the public byte-preimage, `userDataVersion` and hash-reachable grouping-number contract and begin no hashing repair or cache execution.

**Gate outcome.** The cache-correctness gate run before writing this section found **three genuine contradictions** in the frozen contract, patched as CHG-036 and summarised at §10.0. Two of them (the id/INV-7 conflict, the `contractVersion` key gap) would have produced wrong-but-plausible cached results; the third (`sourceHash` over UTF-8) would have collapsed distinct sources to one key. A later preimplementation Range 0B audit found four further byte-identity findings; CHG-046 applies their exact domain-separated preimages and CHG-047 closes the `userDataVersion` numeric residue with an exact public domain, transaction lifecycle and semantic-int64 encoding. Independent verification of the submitted `5.0.13` Range 0B package then found IV-0B-001: grouping numbers reachable through `DocumentContext` were not bounded to an integer/local-index domain. CHG-048 closes that public representability defect and adds the grouping-domain obligations in §5.6/§5.19. The corresponding reference-vector and integer-closure tests remain downstream Range 0B work; no hashing repair or cache execution is run in this correction.

---

## 10.0 What the gate found

| # | Contradiction | Consequence had it shipped | Resolution |
|---|---|---|---|
| **A** | §5.2 said ids are "not stable across calls"; INV-7 requires byte-identical serialised output for identical inputs. Ids are serialised, so both could not be true | Either INV-7 was false, or the id rule was — and no test would say which | Determinism and persistence separated (§5.2.1). Ids are deterministic for a fixed input tuple, non-persistent across any change, and assigned once at final composition (RULE-API-13) |
| **B** | `versions.contractVersion` is serialised into every Analysis but was not a cache-key input, and nothing coupled it to `engineVersion` | A cache entry produced under contract `5.0.2` could be returned under `5.0.3`, whose `StoreEntry` validation changes which entries are enabled | `contractVersion` added to the key; the version axes redefined as composite dependency fingerprints; `providerSnapshotId` added (§5.15, §5.15.1) |
| **C** | `sourceHash` was unspecified. Any UTF-8 or canonical-JSON route replaces lone surrogates with U+FFFD, but the engine preserves them as content (§3.8) | Two distinct sources hash equal → the cache returns an Analysis computed for **different text**. Silent, and only a fuzz fixture would catch it | Canonical length-prefixed binary encoding with **UTF-16BE** strings (§5.15.2, RULE-API-16) |

All three were invisible from the linguistic sections and only appeared when asking *what exactly is being compared for equality*.

---

## 10.1 Correctness before speed

**RULE-CACHE-1 (RECOMMENDED) — the governing rule of this section.**

> Caching may change latency and resource use. It **may not** change resolution, provenance, status, candidates, diagnostics, ids, source fidelity, or serialised Analysis identity for a fixed input tuple. **A cache miss and a cache hit must be observationally identical.**

Corollaries, each testable:

1. Running with caching wholly disabled and running with a warm cache produce **byte-identical** serialised Analyses (T-CACHE-001).
2. Eviction changes nothing but timing (T-CACHE-012).
3. A corrupt or unreadable cache entry degrades to recomputation, never to degraded output (§10.14).
4. **Reuse requires proven semantic identity.** A matching text hash is not proof (§10.3). "Probably equivalent" is not a criterion.

A cache that returns a stale provenance field, an old entity classification, a wrong global span, or a result computed under a different context is a **correctness bug**, even when the displayed romanised string happens to be identical. Under §5's model the string is the least of what an Analysis asserts.

---

## 10.2 Cache layers

There is no "the cache". Six independent layers with different lifetimes, key inputs and risk.

| # | Layer | Keyed on | Lifetime | Persistable? | Risk if wrong |
|---|---|---|---|---|---|
| **L-REF** | Reference-data lookups: lexicon, character readings, gazetteer, convention tables, rule tables | layer fingerprint + lookup key | Long — the data is **immutable within a version** | **Yes** — versioned, non-sensitive | Low: a stale entry implies a stale version, which the fingerprint prevents |
| **L-SEG** | Segmentation over a bounded window | window source + segmenter fingerprint + relevant options | Medium | Yes in principle; **memory-only by default** (user content) | Wrong segmentation propagates to everything downstream |
| **L-STAGE** | Downstream linguistic stages: reading resolution, entity resolution, L3R, L3E | stage inputs incl. `contextIn` | Medium | Memory-only by default | Stage-specific |
| **L-WIN** | Whole window result (fragment + `contextOut`) | §10.3's key | Medium | Memory-only by default | The hardest layer to key correctly |
| **L-FULL** | Whole Analysis | `analysisCacheKey` (§5.15) | Short–medium | Memory-only by default | Returns an entire wrong document |
| **L-EXT-P** | **Pinned provider snapshot** | snapshot content-hash id | Artefact lifetime | **Yes** — its creation is an explicit host/user act | Determinism scope |
| **L-EXT-M** | Live-provider memoisation, **outside the core** | provider id + config hash + canonical input | Session | **No — memory-only by default** | Provider requests can be derived from user documents |

**Not cached:** every projection. `@hklang/style` renderings, annotation projections and `TranslationDirectives` are recomputed on demand. This is the operational form of RULE-API-7 and RULE-API-11: **changing display style or `protectionConfidenceFloor` must not invalidate or re-run linguistic analysis**, and caching a projection against a style setting would re-couple exactly what CHG-026 decoupled. If measurement later shows a projection is expensive, cache it *keyed by (analysisCacheKey, settings)* — never inside the Analysis.

**L-STAGE is conditional.** Do not build stage-level caches speculatively. §10.11's stage timings say whether the separation pays; §10.2 records only where it is *safe*: a stage may be cached iff its inputs are fully enumerable and include `contextIn` where the stage consumes entity memory.

---

## 10.3 Window caching and document context

The hardest question in §10. Windows (§3.4.4) are the natural reuse unit, but entity memory means a later window can depend on earlier resolved mentions — so **a cached window is not a pure function of its own text**.

### 10.3.1 The model

```
WindowResult = F( windowSource,            // fragment-local text
                  semanticVersions,        // lexicon/rules/segmenter fingerprints
                  relevantOptions,         // options that reach this stage
                  storeFingerprint,        // §10.5 — relevant entries only
                  contextIn )              // entity memory entering this window
              → { analysisFragment,        // fragment-local spans and indices only
                  contextOut }             // entity memory leaving this window
```

```
windowCacheKey = H( keyFormatVersion, canonical(windowSource), semanticVersions,
                    relevantOptionsHash, storeFingerprint, contextInFingerprint )
```

- `contextIn` for the **first** window = the explicit `documentContext` if supplied, otherwise the empty context. Explicit context is therefore part of the first window's key, exactly as it is part of `optionsHash` (CHG-029).
- `contextIn` for window *k* = `contextOut` of window *k−1*.
- `contextOut` is fingerprinted over its **content**, not its identity, so two different paths reaching the same memory state reuse the same downstream windows.
- **No ambient state participates.** There is no engine-held memory between calls (RULE-ENT-8).

Because document tags can change StoreEntry applicability, `relevantOptionsHash` includes the normalised `documentTags` set for every stage that performs Store matching. Equivalent reordered/duplicated tag inputs reuse safely; a changed unique set cannot reuse a result resolved under different tag applicability.

**RULE-CACHE-2.** A window is reused **only** when its full key matches. **A matching `windowSource` hash alone is never sufficient** — that is the precise error the model exists to prevent.

**Confidence cannot inflate through reuse.** Inherited values are capped at their antecedent's confidence (RULE-ENT-9), and since `contextIn` is a key input, the same `contextIn` deterministically yields the same capped result. Reuse cannot make repetition look like evidence.

### 10.3.2 Finding the safe reuse frontier after an edit

A single **forward pass**, no iteration:

```
for k = 0, 1, 2, …:
    compute windowCacheKey(k)                  // needs contextIn(k), known from k-1
    if cached(k) and key matches:
        reuse fragment(k); contextOut(k) := cached contextOut
    else:
        recompute window k                     // computed at most once
        contextOut(k) := fresh value
```

After the first mismatch, recomputation continues only while `contextOut` differs from the cached value for that window. **The moment a recomputed `contextOut` equals the previously cached `contextOut` for that position, every later window's `contextIn` is unchanged**, so later windows fall back to ordinary key matching and reuse resumes.

**Why this is not a prohibited fixed-point algorithm (RULE-ENT-1).** Each window is computed **at most once**, in ascending order. There is no re-entry, no convergence loop and no dependence on iteration order. The "resume reuse" step is not iteration — it is an ordinary key comparison that happens to succeed once context stops changing. Determinism follows because `contextOut` is a deterministic function of a keyed input tuple.

**Worked case.** A one-character edit in sentence 40 of a 200-sentence document: windows 0–39 reuse on unchanged keys; window 40 recomputes; if its `contextOut` is unchanged (the edit touched no entity), windows 41–199 reuse. If the edit introduced a new person entity, `contextOut` changes, window 41 recomputes, and reuse resumes as soon as the memory state re-converges — which it may never do, in which case the whole tail recomputes. That is correct, not a failure.

---

## 10.4 Composition, offsets and references

Window caches store **fragments**; the public output is one Analysis with global UTF-16 spans.

**RULE-CACHE-3 (RECOMMENDED) — no global state inside a reusable fragment.** A cached fragment stores:

- spans **relative to the window start**;
- **fragment-local indices** for every reference;
- **no global ids**, **no global offsets**, **no final-document coordinates**.

Composition rebases and assigns. This is what makes the repeated-sentence case work at all.

| Item | Composition treatment |
|---|---|
| Token / entity / syllable / unit spans | `+ windowStart`, in `offsetUnit: "utf16"` |
| `GroupedAlignment.span` | `+ windowStart`; `syllableIndices` remain fragment-local indices into the owning Reading's syllable array |
| `TermResolution.span` | `+ windowStart`; after composition, `sourceText` is verified against the exact global source slice |
| Token ids, entity ids, unit ids, region ids | **Assigned at composition** by RULE-API-13's traversal; fragments carry none |
| `containedBy` | fragment-local entity index → composed entity id |
| Per-value / per-candidate `inheritedFrom` | may point **across** windows or **out of the call** entirely. Within a call, each channel's `contextOut` handle is independently remapped at composition to `{ kind: "analysis", entityId }`. Where that channel came from the `DocumentContext` **input**, its reference is emitted as `{ kind: "documentContext", contextId, ref }` and is **not** remapped — there is no composed entity to point at (§5.7.4). The composer never creates an Entity-wide inheritance reference |
| `AnnotationRef` / `RomanisationRef` exact-one-owner unions | fragment-local owner kind + local index + legal channel → exactly one composed token/entity id; `RomanisationRef` is additionally fixed to channel `"romanisation"` |
| `styleApplicable.unitIds` | fragment-local unit indices → composed unit ids |
| Ambiguous-region references | rebased and re-id'd |
| `Analysis.diagnostics[].span` | rebased when window-scoped; analysis-scoped diagnostics do not rebase. Creation and projection diagnostics are not stored or composed in Analysis fragments |
| `ResolutionTraceTarget` | annotation refs remap as above; a fragment-local `termResolution` index remaps to its final index after deterministic `Analysis.termResolutions` ordering. `ResolutionTrace` itself carries no span |
| Source reconstruction | INV-1 verified **after** composition, over the whole document, not per fragment |

**The repeated-sentence test is the discriminating one (T-CACHE-004).** The same sentence at offsets 0 and 500 shares one L-WIN entry *only if the full key matches, including `contextIn`* — and must still yield distinct global spans, distinct ids, and correct cross-references. A design that stored final offsets in the fragment passes every ordinary test and fails this one, which is why it is called out explicitly.

---

## 10.5 User-store invalidation and INV-11

### 10.5.1 The two questions are different

| Question | Answer |
|---|---|
| May an **old whole Analysis** be returned after any committed store write? | **No.** Every committed persistent-state mutation bumps the exact-domain global `userDataVersion` once, which is in `analysisCacheKey`. L-FULL misses. Correct and non-negotiable |
| May **internal window caches** survive a store edit that matches nothing in a given window? | **Yes** — that is exactly what INV-11 asserts, and refusing it would throw away almost all reuse for a one-entry edit |

Keeping the public counter global while making internal reuse finer is not a contradiction: they answer different questions.

### 10.5.2 Options compared

| Option | Reuse after a one-entry edit | Complexity | Verdict |
|---|---|---|---|
| Single global `userDataVersion` in every key | **None** — one edit invalidates the whole document | Trivial | Too coarse; makes dictionary authoring painful, which is the Lab's main loop |
| Per-store versions | Poor — editing any pronunciation entry invalidates all reading work | Low | Insufficient |
| Per-entry revisions used directly | Requires knowing which entries a window consulted; "consulted" is not the same as "could have matched" | Medium | Necessary input, not sufficient alone |
| **Per-window relevant-entry fingerprint**, built from per-entry revisions | **Good** — only windows where an entry could match are invalidated | Medium | **RECOMMENDED** |

### 10.5.3 The relevant-entry fingerprint

**RULE-CACHE-4 (RECOMMENDED).** For each window, `storeFingerprint` is a hash over the **relevant entry set**, computed from the **current** store against the window's text:

> An entry is *relevant* to a window if its key occurs in the window text (after the same NFC and variant folding the resolver uses), **or** if it is a forced-segmentation term whose presence could alter that window's segmentation.

Each relevant entry contributes: `entryId`, `revision`, `key`, `value`, `entryScope`, conditional `formKind`, persisted `caseSensitive`, `entityTypeHint`, `enabled`, `match`, `context`, `evidenceClass`, `externalAttestation`, `attestation`.

Because relevance is recomputed from the *current* store, the awkward cases fall out correctly:

| Change | Why it invalidates |
|---|---|
| **New entry** whose key occurs in the window | It joins the relevant set → fingerprint differs |
| **Deleted** entry | It leaves the relevant set → fingerprint differs |
| **Edited key** (old → new) | Windows containing the **old** key lose it; windows containing the **new** key gain it. **Both** are invalidated, which is the required behaviour |
| **`entryScope` lexical ⇄ entity**, key and value unchanged | `entryScope` is in the fingerprint → every matching window invalidated. Required: the change flips whether entity candidates and protected spans exist |
| **`formKind` edit** on an entity translation entry, stored text unchanged | `formKind` is in the fingerprint → matching windows invalidate because the resulting verbatim English form makes a different linguistic claim |
| **`caseSensitive` edit**, key unchanged | `caseSensitive` is in the fingerprint → matching windows invalidate; for Latin-containing keys the match set itself may change |
| **Evidence-semantic edit** — E1a → E2, `externalAttestation` changed, `attestation` added or changed | These are in the fingerprint and they change the Analysis envelope: the surface string may be identical while `evidenceClass`, `externalAttestation` and `attestation` differ. **Must** invalidate |
| **`verifiedAt`-only edit** | The entry revision changes, so a **conservative miss is permitted**; but `verifiedAt` is a stored-record property (DEC-…-008), is **not** an Analysis input, and does **not** change status, evidence class, provenance or confidence. There is **no requirement that the recomputed Analysis differ** (CHG-037 B, §7.3.3) |

**RULE-CACHE-5.** **"Same displayed text" is never evidence of "same cached value".** Under §5's model an annotation asserts provenance, evidence class, attestation state and status alongside its text; a cache keyed on text alone would return a value whose *claims* are stale even when its string is right.

**Cost.** Computing the relevant set per window means matching all store keys against the window text. A trie or Aho–Corasick automaton over store keys — rebuilt only when `userDataVersion` changes — makes this near-linear in window length, and that automaton is itself the forced-term index the segmenter already needs.

**Public surface unchanged.** `userDataVersion` stays a single global monotonic counter in `Versions` and in `analysisCacheKey`, with the exact public number domain and transaction semantics fixed in §1.8/§5.3/§5.9. The fingerprints are internal.

---

## 10.6 Persistent cache namespaces

`userDataVersion: 17` is **not globally unique**. A restored backup, an imported store, a second machine or a fresh profile can each sit at 17 with entirely different entries. A persistent cache keyed on the exact public monotonic integer alone will eventually return another store's results; namespace isolation remains mandatory. The value itself can never exceed `9007199254740991` and a mutation at that maximum is rejected before any state change.

**RULE-CACHE-6 (RECOMMENDED).** Persistent caches are namespaced by:

```
cacheNamespace = H( storeInstanceId, cacheNamespaceGeneration, engineVersion, contractVersion )
```

| Element | Definition |
|---|---|
| `storeInstanceId` | An opaque id generated when a store set is **created**, and **regenerated** on import, restore, replacement or any operation that can break the monotonicity of `userDataVersion` |
| `cacheNamespaceGeneration` | An integer bumped by an explicit purge, or on detecting a `userDataVersion` that moved backwards or non-monotonically |

**RULE-CACHE-7.** A `userDataVersion` that decreases, repeats with different content, or is otherwise non-monotonic is treated as **namespace replacement**: the persistent cache for that namespace is purged. Purging is cheap; returning another store's Analysis is not. A value outside the exact public domain is an invalid Store state and must be rejected before cache-key construction; it is not coerced, wrapped or rolled over.

The public Analysis does **not** expose the namespace — it is operational state with no linguistic meaning.

---

## 10.7 ExternalProvider determinism

**The claim under scrutiny.** INV-7 said non-deterministic components sit behind `ExternalProvider` "and their results are cached". Caching does not create determinism: a network provider queried on a cold cache on another machine, or six months later, can return a different value, and the resulting Analysis differs. "Cache it" describes *memoisation within one machine's history*, not reproducibility.

**RULE-CACHE-8 (RECOMMENDED) — determinism is scoped, not asserted.** The core admits exactly two Analysis modes; the third row below is an external orchestration case and never an Analysis mode.

| Mode | Determinism guarantee | Mechanism |
|---|---|---|
| **Deterministic core** (default) | **Full INV-7.** Byte-identical across runs, processes, machines and time | No provider is engaged. `providerSnapshotId: null` |
| **Pinned snapshot** | **INV-7 relative to the valid snapshot.** Byte-identical for anyone holding that snapshot | Provider results are captured as a **content-addressed, persisted artefact** with an id, and `createEngine` has succeeded after validating it. That id is an **input**, present in `analysisCacheKey`. The core consumes the snapshot; it does not fetch |
| **Live provider** | **Not a core mode (CHG-037 A).** It cannot reach `processText` | The optional async orchestration layer materialises a `ProviderSnapshot` first; the run then becomes a pinned-snapshot run. There is no "live" Analysis for the contract to describe |

**RULE-CACHE-9 (amended, CHG-037 A).** The case this rule was written for **cannot occur inside the contract**: the core has no live-provider mode, so there is no Analysis to flag and no exemption for G11 to make. The obligation now falls on the **orchestration layer**: it must materialise a `ProviderSnapshot` before calling the core, and must not present a snapshot assembled from a live query as though it were a durable pinned artefact unless it has actually persisted it (§10.9.1). A host that cannot persist the snapshot has produced a result reproducible only within its own session, and should say so in its own terms — not in the engine's.

**Reconciliation with DEC-…-032.** Snapshot *acquisition* is asynchronous and lives **outside** the core, in an orchestration step that produces the artefact. The core `processText` consumes an already-materialised snapshot and remains **synchronous**, as §5.10 specifies. **DEC-…-032 is SETTLED for v1 on exactly this boundary**; an optional provider does not change the core signature.

---

## 10.8 Debug caching

`debug.trace` and `debug.lattice` are `ProcessOptions`, so they are in `optionsHash` and therefore in `analysisCacheKey` — turning debug on **must** miss L-FULL, because the payload genuinely differs. But it must not force the expensive linguistic work to repeat.

**RULE-CACHE-10 (RECOMMENDED).** Debug flags are **excluded from L-SEG, L-STAGE and L-WIN keys**, and included only in `optionsHash` / L-FULL. Toggling debug therefore reuses every core-stage artefact and rebuilds only the debug payload.

| Situation | Behaviour |
|---|---|
| Debug artefact was **retained** alongside the cached stage | Attach it; no recomputation |
| Debug artefact was **not retained** | **Re-run only the stage needed** to produce the real trace or lattice. Other stages stay cached |
| Debug artefact unavailable and the stage cannot be re-run | Report it as **unavailable**. Never fabricate |

**RULE-CACHE-11 — no reconstructed traces.** A trace must be produced by the stage that did the work. Deriving a plausible trace from a final value would be a fiction that looks exactly like evidence, and RULE-LAB-2 already forbids the Lab from doing it — §10 forbids the engine from doing it too. `debug.retainArtefacts` is an OPTIONAL configuration for a Lab session that expects to inspect frequently; it costs memory and buys re-run avoidance.

---

## 10.9 Memory, eviction and persistence

**Correctness and policy are separate.** Nothing in this subsection may affect output.

**RULE-CACHE-12.** Eviction is unconstrained with respect to correctness: any layer may evict any entry at any time, and the only observable effect is latency. T-CACHE-012 asserts this by running the corpus with eviction forced after every insertion.

**Policy candidates**, all provisional:

| Layer | Policy candidate | Budget |
|---|---|---|
| L-REF | LRU or permanent within a version; small and hot | **UNRESOLVED** |
| L-SEG / L-STAGE / L-WIN | LRU with a byte budget, scoped to the current document | **UNRESOLVED** |
| L-FULL | Small LRU by entry count | **UNRESOLVED** |
| L-EXT-P | Content-addressed artefact; retained until the host discards it | **UNRESOLVED** |
| L-EXT-M | Session LRU, memory-only | **UNRESOLVED** |

**No byte limits are chosen here.** §10.11 measures Analysis payload size and per-layer memory first; a budget picked from intuition would be a number the packet cannot defend.

### 10.9.1 What may be persisted

Persistence is a **privacy** decision before it is a performance one. Hit rate is not a reason to write user content to disk.

| Layer | Persist by default? | Reason |
|---|---|---|
| **L-REF** | **Yes** | Derived from shipped, versioned, public reference data. Contains no user content |
| **L-EXT-P** (pinned snapshot) | **Yes** | An artefact the host explicitly created or imported — not ordinary memoisation |
| **L-EXT-M** (live memoisation) | **No — memory-only by default** | Provider inputs may be derived from the user's documents. **"External" is not a synonym for "non-sensitive"** (CHG-037 C) |
| **L-SEG, L-STAGE, L-WIN** | **No — memory-only by default** | Derived from the user's documents; a persisted window cache is a partial copy of what they analysed |
| **L-FULL** | **No — memory-only by default** | Contains the source text verbatim (DEC-…-035) |
| Anything derived from the **user stores** | **No** | Dictionary entries are user-created content |

**RULE-CACHE-13.** Document-derived and store-derived caches are **opt-in** to persistence, per profile, with a visible control and a purge action. No multi-user or auth design is needed (assumption A2), but "single private user" is a reason to be careful with their content, not a reason to be casual with it.

---

## 10.10 Precomputation and startup

Work that can be done once per version, and must not recur per analysis:

| Artefact | Built from | Rebuilt when |
|---|---|---|
| Lexicon indices | word layers | `lexiconVersion` changes |
| Character-reading index | LSHK table, Unihan | `lexiconVersion` |
| Corpus-frequency index | frequency layer | `lexiconVersion` |
| Gazetteer index | convention snapshot | `rulesVersion` |
| Convention / surname tables | rule pack | `rulesVersion` |
| Variant-fold maps | normalisation data | `lexiconVersion` |
| Rule-pack tables | fitted generator | `rulesVersion` |
| Forced-term automaton (§10.5) | user stores | `userDataVersion` |
| Segmenter model initialisation | segmenter artefact | `segmenterVersion` |

`createEngine` exposes configuration diagnostics when creation returns, before any analysis. `Lexicon.coverage()` is checked here: missing frequencies yields degraded success with `LEXICON_MISSING_CAPABILITY`; an invalid supplied ProviderSnapshot yields fatal `EngineCreationFailure` with `PROVIDER_SNAPSHOT_INVALID`, so no Engine reaches the first-analysis stage.

**Startup must be measured in stages**, because they have different fixes:

| Stage | What it costs | Typical remedy |
|---|---|---|
| Download / transferred bytes | network | compression, lazy layers |
| Parse / decompress | CPU | binary formats |
| Index construction | CPU + memory | prebuilt indices |
| Model initialisation | CPU + memory | lazy init, worker |
| **First analysis** (cold) | all of the above | — |
| **Warm analysis** | the actual steady state | — |

### 10.10.1 Measuring PyCantonese / Pyodide — protocol only

§8 established **only** that browser and Node execution exist (DEC-…-044: availability SETTLED YES, suitability BENCHMARK REQUIRED). §10 **invents no suitability conclusion**. It specifies what must be measured before DEC-…-044 can be answered:

| Measurement | Unit | Notes |
|---|---|---|
| Transferred bytes | bytes | Pyodide runtime + Rustling wheel + PyCantonese wheel + data, compressed and uncompressed |
| Installed / on-disk bytes | bytes | after unpacking |
| Initialisation latency | ms, p50/p95 | interpreter boot + module import + model load, measured separately |
| Peak memory | bytes | during init and during analysis |
| Steady-state memory | bytes | after init, idle |
| Segmentation latency | ms, p50/p95 | per §10.11's workloads |
| Cold vs warm | both | cold = first load in a fresh context |

These measurements **feed** DEC-…-044; they do not presuppose it. The same protocol runs unchanged against maximum matching and a self-trained hybrid, which is the point — §6.16 requires everything else held constant.

---

## 10.11 Benchmark protocol

Reuses §6 M10's workloads and adds cache-specific ones.

**Linguistic workloads:** 500 characters · 5,000 characters · 100,000 characters · pathological single sentence with no terminator · 10,000 repeated sentences.

**Cache workloads:**

| # | Workload | Isolates |
|---|---|---|
| C-1 | Identical second run | L-FULL hit path |
| C-2 | One-character edit in one sentence | window reuse frontier (§10.3.2) |
| C-3 | Store edit matching **one** window | fingerprint precision (§10.5) |
| C-4 | Store edit matching **no** window | that INV-11 reuse actually happens |
| C-5 | Context-changing edit near the **start** of a document | worst case for context propagation |
| C-6 | Repeated identical sentence at different positions | fragment reuse + correct rebasing (§10.4) |
| C-7 | Debug off → `debug.trace` on | RULE-CACHE-10: L-FULL miss, stage hits |
| C-8 | Style change only | must be **zero** linguistic work |
| C-9 | Protection floor change only | must be **zero** linguistic work |
| C-10 | Cold persistent cache → warm persistent cache | where persistence is enabled |

**Reported per workload:**

- **p50 and p95** latency, cold and warm, reported separately — never blended;
- **cache-hit ratio by layer** (L-REF, L-SEG, L-STAGE, L-WIN, L-FULL, L-EXT-P, L-EXT-M);
- **serialised Analysis size** in bytes;
- **peak memory**;
- **per-stage timings** (segmentation, reading, entity, L3R, L3E, composition, serialisation);
- **bytes loaded and parsed** where relevant.

**RULE-CACHE-14.** **No single "speed" number is published.** A blended figure would hide the one measurement that decides architecture — for instance a cold-start cost dominated entirely by model initialisation, which no amount of caching addresses.

---

## 10.12 Performance targets — deliberately absent

Three categories, and only the first two are fixed now.

| Category | State |
|---|---|
| **Correctness gates** | **Fixed and testable now.** §10.13's tests; hit/miss byte identity; eviction independence; no ambient leakage. These do not depend on any measurement |
| **Measurement protocol** | **Fixed now.** §10.10.1 and §10.11 |
| **Performance budgets** | **UNRESOLVED — benchmark required.** No latency, memory or payload threshold is stated |

**Why no numbers.** A stated "p95 < 100 ms" would be invented. It would depend on a segmenter not yet chosen (DEC-…-017), a lexicon stack not yet loaded, a runtime whose cost is unmeasured (DEC-…-044), and hardware not yet named. Publishing it would create a target the project would later either quietly miss or quietly redefine. **A packet that leaves the number blank is more rigorous than one that fills it in before running anything** — and this packet's own history supports that: every number it has stated so far (θ_read, N/θ, the 0.99 precision floor, the 2,000–5,000 token corpus) has had to be marked provisional or withdrawn.

What §10 *does* fix is the shape of the eventual answer: budgets are set per workload, per percentile, cold and warm separately, against a named segmenter, lexicon stack and runtime.

---

## 10.13 Cache test requirements

| ID | Assertion |
|---|---|
| T-CACHE-001 | **Hit vs miss byte identity.** Caching disabled vs warm cache → byte-identical serialised Analysis, over the whole §6 corpus (RULE-CACHE-1) |
| T-CACHE-002 | **Deterministic ids on exact rerun.** Same input tuple → identical ids in identical positions (RULE-API-13, INV-7) |
| T-CACHE-003 | **Reference remapping after composition.** Every `containedBy`, `AnnotationRef`, `RomanisationRef` and `styleApplicable.unitIds` resolves after fragments are composed; every term-resolution trace index addresses the deterministically ordered composed `Analysis.termResolutions`; every `inheritedFrom` resolves against the current Analysis **or** the exact `DocumentContext` input (RULE-API-19) |
| T-CACHE-004 | **Repeated identical text at different offsets.** Shared fragment; distinct global spans; distinct ids; correct cross-references; INV-1 holds over the whole document |
| T-CACHE-005 | **Version-axis invalidation.** Under §5.15.1's exact composite preimages, changing any semantically legal component of an affected axis changes that fingerprint, changes the exact `analysisCacheKey`, and yields an L-FULL miss. This gate is not executed by CHG-049. |
| T-CACHE-006 | **Contract-version invalidation.** Changing only `contractVersion` misses L-FULL (CHG-036 B) |
| T-CACHE-007 | **Explicit `documentContext` isolation.** Same source, different context → different key, different result where the context matters |
| T-CACHE-008 | **No ambient leakage.** Two calls with no `documentContext` are independent; the second is unaffected by the first (RULE-ENT-8) |
| T-CACHE-009 | **Context propagation.** Editing an early window so its `contextOut` changes invalidates dependent later windows; where `contextOut` is unchanged, later windows reuse |
| T-CACHE-010 | **Unrelated store edit.** L-FULL misses (userDataVersion moved) **and** non-matching windows are reused (INV-11) |
| T-CACHE-011 | **Old-key + new-key invalidation.** Editing an entry's key invalidates windows containing the old key **and** windows containing the new key |
| T-CACHE-011b | **Scope flip.** `entryScope` lexical ⇄ entity with identical key and value invalidates every matching window |
| T-CACHE-011c | **Evidence-semantic edit.** E1a → E2 with attestation, or a change to `externalAttestation` or `attestation`, changes the Analysis envelope and **must** invalidate affected annotations; the recomputed Analysis **may differ** even though the surface string is unchanged (RULE-CACHE-5) |
| T-CACHE-011d | **`verifiedAt`-only edit.** A conservative cache miss via the changed entry revision is **permitted**; the recomputed Analysis **must be byte-identical**. `verifiedAt` is a stored-record property (DEC-…-008), is not an Analysis input, and **must not** alter `status`, `evidenceClass`, `provenance`, `externalAttestation` or `confidence`. Verification cannot manufacture evidence (CHG-037 B, §7.3.3) |
| T-CACHE-012 | **Eviction independence.** Forcing eviction after every insertion changes no output |
| T-CACHE-013 | **Projection purity.** Style and protection-floor changes perform **zero** linguistic work, asserted by instrumentation counters; `analysisCacheKey` unchanged (RULE-API-7, RULE-API-11) |
| T-CACHE-014 | **`sourceHash` discriminates everything INV-1 discriminates**, including **lone-surrogate** fixtures. Any two fuzz-corpus sources that are not byte-identical must have different `sourceHash`, and the implementation must use the exact CHG-046 tagged preimage (RULE-API-16, CHG-036 C, CHG-046) |
| T-CACHE-015 | **Corruption → miss.** Truncated, checksum-failing and schema-mismatched entries all recompute; no partially deserialised Analysis is ever returned |
| T-CACHE-016 | **Namespace isolation.** Two store instances at the same `userDataVersion` with different content never share a persistent cache entry (RULE-CACHE-6) |
| T-CACHE-017 | **Debug reuse.** Toggling `debug.trace` misses L-FULL but hits L-SEG/L-STAGE; the trace is real, never reconstructed (RULE-CACHE-10/11) |
| T-CACHE-024 | **Entry order is not semantic.** The same semantic entry set constructed in different array order yields the **same** snapshot id (CHG-040 C) |
| T-CACHE-025 | **Duplicate `inputHash`** in one snapshot makes `createEngine` return `ok:false`, `engine:null`, with non-empty diagnostics including `PROVIDER_SNAPSHOT_INVALID`; no Engine is created, and entries are not merged or treated last-wins |
| T-CACHE-026 | **Output is semantic.** Changing the `output` for a given `inputHash` changes the snapshot id |
| T-CACHE-027 | **Cross-platform preimage fixture.** A committed reference vector — a fixed `ProviderSnapshot` and its expected `id` — is reproduced byte-identically by every implementation. Two implementations cannot silently interpret the preimage differently |
| T-CACHE-019 | **Snapshot identity — determinism.** Two independently constructed snapshots with identical `snapshotFormatVersion`, `providerId`, `providerConfigHash` and `entries` produce **identical** `id`, across processes and platforms (RULE-API-20) |
| T-CACHE-020 | **`providerId` is semantic.** Same entries, same config, different `providerId` → **different** `id` |
| T-CACHE-021 | **`providerConfigHash` is semantic.** Same entries, same provider, different config → **different** `id` |
| T-CACHE-022 | **`createdAt` is non-semantic.** Same entries, provider and config, different `createdAt` → **identical** `id`, and the cached Analysis is reused (CHG-039 B) |
| T-CACHE-023 | **Snapshot id reaches the key.** Changing `providerSnapshotId` changes `analysisCacheKey`; supplying no snapshot yields `providerSnapshotId: null` |
| T-CACHE-018 | **Provider scoping.** `processText` accepts no live provider: with `EngineConfig.providerSnapshot` absent, every produced Analysis has `providerSnapshotId: null` and passes G11 unconditionally. With a pinned snapshot supplied, two runs sharing that snapshot are byte-identical, and changing the snapshot id changes `analysisCacheKey` (RULE-API-17, CHG-037 A) |
| T-CACHE-028 | **Store mechanism invalidation.** Changing only an entity translation entry's `formKind` changes the relevant-entry fingerprint and invalidates every matching window although its exact stored text is unchanged (CHG-044 A) |
| T-CACHE-029 | **Case-sensitivity invalidation.** Changing only `caseSensitive` changes the relevant-entry fingerprint; Latin matching changes as specified, while a no-case key may recompute to a byte-identical Analysis (CHG-044 I) |
| T-CACHE-030 | **Document-tag option isolation.** Reordered/duplicated equivalent `documentTags` sets produce the same normalised ProcessOptions input and may reuse matching internal stages; changing the unique tag set changes `optionsHash` and every Store-matching stage's `relevantOptionsHash`, so no window resolved under different tag applicability is reused (CHG-045 C) |
| T-CACHE-031 | **Source preimage exactness.** `sourceHash` is `SHA-256(canonicalEncode(["hklang.sourceHash", keyFormatVersion, source]))`; schema/contract versions, JSON/UTF-8 conversion and raw digest bytes are rejected, and lone UTF-16 surrogates remain distinct |
| T-CACHE-032 | **Options default closure.** Omitted and explicit defaults (`documentContextSlot:null`, empty deduped/sorted tags, both reading policies `"none"`, phonetic heuristic `false`, debug slot `[false,false]`) are byte-identical; equivalent tag sets have one normalised preimage and different sets do not |
| T-CACHE-033 | **Analysis-key preimage exactness.** `analysisCacheKey` is the exact CHG-046 tagged twelve-element array, with `keyFormatVersion` second, semantic integer `userDataVersion`, nullable snapshot id and lower-case hex digest strings; no field may be added, omitted or reordered, and styles/projections are excluded |
| T-CACHE-034 | **Domain separation/key placement.** The fixed tag is first and `keyFormatVersion` second for each public identity; tags are distinct across source/options/analysis identities, and changing the format version changes the complete lower-case SHA-256 digest without changing the existing DocumentContext/ProviderSnapshot formulas |
| T-CACHE-035 | **Semantic integer encoding.** A validated public `userDataVersion` is encoded in the analysis-key preimage as semantic signed int64 (`0x04` + eight-byte two's-complement big-endian), never IEEE-754 bytes, decimal text or a `CanonicalValue` wrapper; the CHG-046 twelve-element formula is otherwise unchanged |
| T-CACHE-036 | **User-data-version key sensitivity.** Holding every other analysis-cache input constant, changing only legal `userDataVersion` values changes `analysisCacheKey`; all legal values use the same exact mathematical-int encoding |
| T-CACHE-037 | **DocumentContext nested-integer and grouping closure.** A full `DocumentContext` containing a `MemoryReading` tone, exact-partition memory groupings and unique/increasing styled-person `unitIndices` has one unambiguous semantic canonical representation after CHG-050 validation: every numeric field is consumed as semantic signed int64; no IEEE-754, decimal-string or `CanonicalValue` interpretation is legal, and malformed grouping/reference sequences are rejected before encoding |
| T-CACHE-038 | **Composite Version preimage exactness.** Each of `lexiconVersion`, `rulesVersion` and `segmenterVersion` is exactly its CHG-049 domain-separated three-element preimage, with `keyFormatVersion` as element 1 and an order-significant configured-layer array as element 2. Each layer is exactly `[layerId, layerVersionRef, snapshotDate, enabled, ordinal]`; objects, concatenation, raw digest bytes, alternate field order and untagged content hashes are rejected. Identical semantic stacks reproduce byte-identical fingerprints across processes and platforms. |
| T-CACHE-039 | **Composite component and state sensitivity.** Holding all other valid input constant, independently changing `layerId`, stable version, content SHA-256, `snapshotDate`, `enabled`, `ordinal`, outer layer order, legal layer addition/removal, or `keyFormatVersion` changes the affected fingerprint. `["version", x]` and `["sha256", x]` cannot collide structurally; configured-disabled differs from absent. Each affected fingerprint change changes the exact `analysisCacheKey` and yields an L-FULL miss. |
| T-CACHE-040 | **Composite empty-axis, domain-separation and reference-vector closure.** Empty configured stacks reproduce the accepted committed deterministic reference values using `[]`; otherwise identical tuples on different axes produce different fingerprints because their fixed domain tags differ. CHG-050's bounded P1 regression must reproduce those vectors and verify the `5.0.16` cache-identity consequence before compatibility is re-established. |

---

## 10.14 Corruption and failure

**A cache is disposable acceleration state, never authority.**

| Failure | Behaviour |
|---|---|
| Schema or key-format version mismatch | **Miss.** Recompute. Optionally purge the namespace |
| Checksum / hash mismatch | **Miss.** Discard the entry |
| Malformed or truncated entry | Discard; emit a diagnostic where it is actionable |
| Partial deserialisation | **Never returned.** All-or-nothing: an entry either deserialises completely and validates, or it is a miss |
| Persistent write failure | The analysis **still succeeds**. A cache write failure is not an analysis failure |
| Persistent store unavailable | Fall back to memory-only, then to uncached. Emit an `info` diagnostic once, not per call |
| Cache implementation throws | Treated as a miss. **The cache layer must not be able to fail an analysis** |

**RULE-CACHE-15.** Every cache read is followed by validation before use: key-format version, schema version, structural validity. An entry that fails any check is a miss. **Cache corruption degrades to slower execution, never to altered linguistic output.**

**RULE-CACHE-16 (RECOMMENDED, CHG-037 H) — the digest is an index, not a proof.** SHA-256 is not mathematically injective, and §10 claims caching is *provably* semantics-preserving rather than merely collision-resistant. Those two statements are only compatible if the key is verified, not merely matched.

Therefore every cache entry stores the **complete canonical key material** (§5.15 and §5.15.2) alongside its value, and every lookup is two steps. For the public whole-analysis key, that material is the exact CHG-046 `analysisCacheKey` tagged array: `optionsHash` and `sourceHash` are the validated lower-case hexadecimal strings shown in the preimage, while `userDataVersion` is the CHG-047-validated exact mathematical integer encoded by the semantic-int64 rule. The former `CHG-046-RES-001` blocker is closed; the CHG-048 grouping domain is now part of the preimage's valid transitive input domain, and its integer-closure tests remain downstream Range 0B work.

1. **Index** — locate a candidate by the digest.
2. **Verify** — compare the stored canonical key material byte-for-byte against the key material computed for the current request. **Only on an exact match is the cached value returned.** A digest match with differing key material is a **miss**, and is worth a diagnostic: it is either a collision or a bug.

The cost is one byte comparison of a small buffer per hit; the benefit is that the correctness argument stops depending on a probabilistic property. This does **not** weaken the UTF-16BE canonical encoding — the encoding is what makes the stored key material meaningful in the first place, and RULE-API-16 stands unchanged.

---

## 10.15 Decisions

**Settled here:**

| ID | Resolution |
|---|---|
| DEC-…-033 | **Both** per-window (L-WIN, §10.3) and whole-input (L-FULL) caching, with distinct keys. Window results compose; they do not substitute for the whole-Analysis key |

**Raised here:**

| ID | Question | Recommended | Confidence | Blocking? |
|---|---|---|---|---|
| DEC-LANG-20260828-051 | Does `userDataVersion` stay a single public counter while internal reuse uses per-window fingerprints? | **Yes.** The two answer different questions (§10.5.1); splitting the public axis would change the contract for no gain | Medium-high | No |
| DEC-LANG-20260828-052 | Do persistent caches ship in v1? | **AMENDED (CHG-037 C).** L-REF **yes**; **L-EXT-P yes** (an explicitly created artefact); **L-EXT-M no** (live memoisation is memory-only by default, since provider inputs can be document-derived); document- and store-derived layers **no** (memory-only, opt-in). Privacy first, hit rate second | Medium-high | No — but the persistence boundary must exist from the first implementation |
| DEC-LANG-20260828-053 | External-provider determinism semantics | **SETTLED (CHG-037 A).** The conformant core admits **two** states — no provider, or an explicit pinned snapshot via `EngineConfig.providerSnapshot`. A live provider runs **outside** `processText` in an optional async orchestration layer. INV-7 therefore holds for every Analysis the core produces, with no "non-conformant" state to represent | High | Settled |
| DEC-LANG-20260828-054 | Eviction policy and byte budgets | **UNRESOLVED.** Benchmark first (§10.11); no number asserted | — | No — eviction cannot affect correctness |
| DEC-LANG-20260828-055 | Is `debug.retainArtefacts` a shipped option? | **Yes, OPTIONAL and off by default** — it trades memory for Lab responsiveness and never changes output | Medium | No |
| DEC-LANG-20260828-056 | Are L-STAGE caches built at all? | **Defer.** Build L-REF, L-SEG, L-WIN, L-FULL first; add stage caches only where §10.11's stage timings justify them | Medium | No |

---

## 10.16 Material unresolved benchmark dependencies

Only the dependencies that actually block, listed without padding:

1. **No performance budget can be set** until a segmenter is chosen (DEC-…-017), which needs Family H (DEC-…-038), which needs the corpus-overlap audit of §8.7.2.
2. **Pyodide runtime cost is unmeasured** (DEC-…-044). Until it is, the browser feasibility of one segmentation candidate is unknown, and so is the cold-start budget for any configuration using it.
3. **Analysis payload size is unmeasured**, so DEC-…-035 (carry the source in the Analysis) remains an assumption, and no L-FULL byte budget can be set.
4. **Window-cache hit rates are unknown** for realistic editing patterns, so the value of the §10.3.2 frontier design is argued, not demonstrated.

---

## 10.17 Known limitations of §10

1. **Nothing has been measured.** Every latency, memory and size figure in this section is absent by design, not by omission.
2. **The window-reuse frontier is proved deterministic, not proved efficient.** §10.3.2's argument establishes that each window is computed at most once and that the result is deterministic; it says nothing about how often reuse actually resumes on real edits.
3. **The relevant-entry fingerprint's cost is estimated, not measured.** The trie argument is standard but unbenchmarked against realistic store sizes.
4. **Cache-layer boundaries are a hypothesis.** L-STAGE in particular may prove worthless; §10.2 says where separation is *safe*, not where it *pays*.
5. **Current cache evidence is not yet rebased to `5.0.16`.** Accepted S2-P1–P5 artefacts remain unchanged, but the contract-version advance intentionally changes analysis cache identity and CHG-050 strengthens validation of hash-reachable memory grouping. The bounded P1 regression and independent P2–P5 compatibility rebase must prove what remains valid. The public preimages, canonical encoder and cache-key field membership are unchanged by this correction.
6. **Persistence policy is stated as a default, not as a threat model.** "Do not persist user content by default" is right, but a real review of what a persistent window cache would reveal has not been done.

**SECTION COMPLETE — §10 Caching / Performance**

---

# §7 — Decision Register and Linguistic Limitations

**Position.** Written after §8–§10 by author decision and appended here; the completion table (§0.4) carries the canonical ordering. §7 is the **authoritative record of decision state**: where an earlier section and this register disagree about whether something is settled, **§7 wins**. Where they disagree about *content*, the section that made the decision wins and §7 records the contradiction.

**Method.** Consolidation, not new research. Where an existing claim is insufficiently established, it is preserved as unresolved rather than resolved by fiat.

---

## 7.1 The register

**State vocabulary.** `SETTLED` — decided, with authority in the packet · `AMENDED` — decided, then revised; the revision is authoritative · `REJECTED` — proposed and declined · `UNRESOLVED` — genuinely open · `BENCHMARK-BLOCKED` — answerable only by measurement that has not been done · `DEFERRED` — deliberately postponed, not blocking.

**Blocks** — E engine implementation · B benchmark work · L Lab implementation · R Reader integration · — nothing.
**Needs** — A author input · M empirical measurement · X external evidence · I implementation evidence.

### 7.1.1 Master register

| ID | Question | State | Authoritative answer | §§ | Blocks | Needs |
|---|---|---|---|---|---|---|
| 001 | Container for an entity's English output | **SETTLED** (accepted-amended, CHG-002) | Named sibling fields `romanisation` (L3R) + `englishForm` (L3E); never merged | 1.2.3, 5.7.1 | — | — |
| 002 | One status enum or three axes | **SETTLED** (CHG-001) | Three: `provenance` / `status` / `confidence`; `verified` is a record property | 1.7 | — | — |
| 003 | Offset unit | **SETTLED** | UTF-16 code units, declared as `offsetUnit` | 5.2 | — | — |
| 004 | Reading representation | **SETTLED** | Structured `Syllable`; Jyutping is the canonical serialisation | 3.1.2, 5.6 | — | — |
| 005 | Entity span nesting | **SETTLED** | Nesting allowed, partial overlap forbidden, one `primary` per position (INV-16) | 4.4.2 | — | — |
| 006 | Implementation language / runtime | **UNRESOLVED** | Deliberately open. §5 is language-neutral | 1.9, 5.1 | — | A |
| 007 | Normalisation and variant-folding policy | **UNRESOLVED** (partly discharged) | NFC keys; variant folding as a recorded transform (RULE-JP-9); **simplified-fold ambiguity rule settled** (RULE-JP-10). Exact fold table open | 3.6.3–4 | — | M, X |
| 008 | Is `verified` a value status or a record property | **SETTLED** (reaffirmed CHG-037 B) | Record property. Not an Analysis input; does not alter confidence | 1.7, 7.3 | — | — |
| 009 | General non-entity HK romanisation as a v1 capability | **SETTLED** (accepted, CHG-007) | Yes. Lab exposes provenance; ordinary presentation may stay quiet | 2.1, 2.2 | — | — |
| 010 | ts/ch and s/sh where unjustifiable | **SETTLED** (accepted, CHG-008) | Retain all plausible candidates, `ambiguous`; prior may rank, never resolve. Engine-data rule only | 2.2.2 | — | — |
| 011 | Convention table bundled or fetched | **SETTLED** (§8.10) | Bundled snapshot + optional refresh; DATA.GOV.HK terms permit it | 8.5 | — | — |
| 012 | Global `givenNameJoin` default | **REJECTED as an inference → UNRESOLVED** (CHG-009; clarified CHG-050) | *Leung Chiyiu* is an entity-level stipulation, not evidence of a global rule. **No default set.** Assembled forms carry structured units/grouping and rendering requires an explicit profile; no profile implies a global default | 2.4.4, 5.11 | — | A, X |
| 013 | Convention-promotion thresholds *N*, θ | **UNRESOLVED** | Placeholder N=3, θ=0.9; must be tuned and reported with `rulesVersion` | 2.7 | — | M |
| 014 | May a bearer entry update the class surname table | **SETTLED** | **Never** automatically. Explicit Lab curation only (INV-12) | 2.12 | — | — |
| 015 | Plain-text copy provenance marker | **SETTLED** (amended, CHG-016) | Not forced. Structured export must preserve provenance; markers are opt-in | 2.9 | — | — |
| 016 | Where style profiles live | **SETTLED** | `@hklang/style`, pure, depends on `@hklang/core` only | 5.11 | — | — |
| 017 | **Segmentation approach** | **BENCHMARK-BLOCKED** (reopened, CHG-019) | No default asserted. Compare max-matching, PyCantonese/Rustling, self-trained hybrid on Family H. RULE-JP-5a keeps it replaceable | 3.4.2, 8.4 | **B** | M |
| 018 | θ_read / N_read for polyphone dominance | **UNRESOLVED** | 0.9 / 5 provisional; depends on 042 | 3.5.2 | — | M |
| 019 | Entity→reading dependency | **SETTLED** | Single forward pass with unconditioned readings, then one re-resolve. **No fixed-point iteration** | 3.4.5, 4.1 | — | — |
| 020 | Tone change (變調) | **SETTLED** | Lexicalised forms only; no productive sandhi in v1 | 3.5.3 | — | — |
| 021 | Default `numberReadingPolicy` | **SETTLED** | `none`, with candidates supplied | 3.7.1 | — | — |
| 022 | Phonetic-component heuristic | **SETTLED** | Shipped, **off by default**, never reaches `resolved` | 3.8 | — | — |
| 023 | Lattice exposure | **SETTLED** | Reduced by default; full lattice behind `debug.lattice` | 5.16 | — | — |
| 024 | `protectionConfidenceFloor` value | **UNRESOLVED** | Default `medium` provisional; the floor **must exist** from the first run | 4.11.1 | — | M |
| 025 | Document-local memory | **SETTLED** (amended, CHG-029) | Optional explicit `documentContext` in v1; intra-call otherwise; **ambient excluded** | 4.6.2, 5.10.1 | — | — |
| 026 | Numeric priority on store entries | **SETTLED** | No. Surface conflicts instead of ranking them | 4.7.3 | — | — |
| 027 | Entity record `preferred` vs store entry | **SUPERSEDED — N/A in v1** (by 058) | Durable Entity Records deferred (§5.10.3); the conflict cannot arise. v2 reasoning retained: store would win | 4.8.2, 5.10.3 | — | — |
| 028 | Portable storage format | **SETTLED** | JSON documents; export ≡ storage; DB behind the same interface later | 4.7.4 | — | — |
| 029 | Ship a person gazetteer | **SETTLED** | **No — v1 ships no person gazetteer.** Person *mentions* may still arise from the permitted detection mechanisms (§4.3) and entity-scoped store entries; what remains evidence-bound is an individual's actual name **spelling**, which no public registry supplies (L3E.1). Records were deferred (DEC-…-058), so this no longer reads on "user records" | 8.9, 5.10.3 | — | — |
| 030 | External NER in v1 | **SETTLED** | Interface only | 4.3 | — | — |
| 031 | Default `entryScope` | **SETTLED** | `lexical`. The low-friction path must not manufacture entities | 4.7.1, 9.12.1 | — | — |
| 032 | Sync vs async `processText` | **SETTLED for v1 (CHG-040 E)** | **v1 core `processText` is synchronous**, as the frozen signature already declares. An async host/worker/orchestration wrapper may exist outside it, and provider acquisition happens there. Any future reason to make the core async is a **new contract decision**, not an open v1 question — a public signature cannot be simultaneously frozen and unresolved. Any async need must be argued on its own merits | 5.10, 5.13.1 | — | I |
| 033 | Per-window and/or whole-input caching | **SETTLED** | Both, with distinct keys; windows compose, they do not substitute | 10.2–10.4 | — | — |
| 034 | Convenience views in v1 | **SETTLED** | `processText` only; add views when a real consumer asks | 5.10.4 | — | — |
| 035 | Does `Analysis` carry the source string | **SETTLED, provisional** | Yes — it makes INV-1 checkable and fixtures self-contained. Revisit only on measured payload cost | 5.20 | — | M |
| 036 | Id stability semantics | **SETTLED** (corrected, CHG-037 D) | Deterministic for an identical input tuple; **non-persistent** across any change; assigned at composition (RULE-API-13) | 5.2.1 | — | — |
| 037 | Fit/eval split for the gazetteer | **UNRESOLVED, recommended** | 80/20 by committed deterministic hash; split artefact committed | 6.9 | **B** | — |
| 038 | **Family H acquisition** | **REOPENED → UNRESOLVED** (CHG-034 B) | Evaluate existing independent corpora first (UD_Cantonese-HK live); hand-annotate only the shortfall. Reading gold is a known shortfall — **no currently identified admissible corpus supplies paired Jyutping reading gold aligned to segmentation gold**; the search was not exhaustive | 6.16, 8.7 | **B** | X, M |
| 039 | Protected-span gating | **SETTLED** (amended, CHG-033) | Zero-false-positive **hard gate** on C1/F13; representative precision reported with n and CI; **no production floor set yet** | 6.14 | — | M |
| 040 | Ambiguity-precision target band (M8) | **UNRESOLVED** | No number asserted; set after one run against real data | 6.15 | — | M |
| 041 | Full-Analysis snapshots per fixture | **SETTLED** | Curated subset only | 6.19 | — | — |
| 042 | **rime-cantonese weights as reading frequencies** | **UNRESOLVED / BLOCKING for that use** (CHG-034 E) | How each weight was derived is not established either way. **Do not use as RULE-JP-7 frequencies until verified**; use a separate corpus-frequency layer | 8.2.1 | **E** (frequency path) | X |
| 043 | Lands Dept stable per-record identifiers | **UNRESOLVED** | Not established. Absent them, snapshot diffs key on Chinese name + feature type and are fragile | 8.5.2 | — | X |
| 044 | **PyCantonese in the target runtime** | **Availability SETTLED YES; suitability BENCHMARK-BLOCKED** (CHG-034 A) | Browser and Node via Pyodide/WASM confirmed. Payload, init latency, memory, p95 unmeasured | 8.4.1, 10.10.1 | **B** | M |
| 045 | Is PyCantonese benchmarked at all | **SETTLED, conditional** | Yes — against a Family H assembled per §8.7.2. Not on HKCanCor | 8.4.1 | **B** | X |
| 046 | Single precompiled lexicon vs runtime layers | **SETTLED** (rationale corrected, CHG-034 C / CHG-037 F) | Separate layers (RULE-DEP-1), for licence-coupling and provenance reasons — **not** an asserted propagation rule | 8.6 | — | — |
| 047 | Lab store persistence | **SETTLED, recommended** | Injected `StoreApi`; local JSON default | 9.23 | — | — |
| 048 | Jyutping above or below the source | **DEFERRED** | Configurable; above by default. Cosmetic | 9.23 | — | — |
| 049 | Fixture-runner view in the Lab | **DEFERRED, recommended** | Yes, minimally | 9.23 | — | — |
| 050 | "Explain this value" narrative | **SETTLED** | Not in v1. Show the trace | 9.23 | — | — |
| 051 | `userDataVersion` global vs finer | **SETTLED** | Public counter stays global; internal reuse uses per-window relevant-entry fingerprints | 10.5 | — | — |
| 052 | Persistent caches in v1 | **SETTLED** (amended, CHG-037 C) | L-REF yes; L-EXT-P yes; L-EXT-M no; document- and store-derived layers memory-only, opt-in | 10.9.1 | — | — |
| 053 | External-provider determinism | **SETTLED** (CHG-037 A) | Core supports no-provider and pinned-snapshot only; live providers run outside `processText` | 5.13.1, 10.7 | — | — |
| 054 | Eviction policy and byte budgets | **UNRESOLVED** | No number asserted. Eviction cannot affect correctness | 10.9 | — | M |
| 055 | `debug.retainArtefacts` | **DEFERRED, OPTIONAL** | Ship, off by default | 10.15 | — | — |
| 056 | Build L-STAGE caches at all | **DEFERRED** | Only if §10.11 stage timings justify them | 10.15 | — | M |
| **058** | Durable Entity Records in v1 | **SETTLED — DEFERRED** (new, CHG-040 B) | **Removed from v1.** No type, API, config input, versioning, invalidation or namespace semantics existed; entity-specific facts are expressed as entity-scoped store entries with E1a–E2. `entity_record` reserved with no v1 producer. A plausible v2 extension, as a fourth persistence domain | 5.10.3 | — | — |
| **057** | **Contract compatibility boundary** | **SETTLED** (new, CHG-037 E) | `5.0.x` is a pre-implementation corrective series; §5.17's policy takes effect at **`5.1.0`**, declared at first implementation release | 5 header | — | — |

### 7.1.2 Contradictions found and their resolution

| Contradiction | Resolution | Authority |
|---|---|---|
| DEC-…-036 said ids are stable "within one Analysis" while RULE-API-13 requires cross-run determinism | Determinism and persistence are different properties; both hold in their own sense | CHG-037 D. Row 036 above is authoritative |
| DEC-…-012 appeared as a recommended default in §2.4.4 and as rejected in §2.12 | Rejected as a global inference; the entity-level stipulation stands | CHG-009 |
| DEC-…-038 was "settled" in §8.10 and reopened in the same section's body | Reopened. Only HKCanCor was shown unusable | CHG-034 B |
| §10.7 defined three provider modes the contract could not represent | Core narrowed to two; the third moved outside `processText` | CHG-037 A |
| §5 claimed `5.0.x` was "additive only" while §5.17 classes meaning-changes as major | `5.0.x` declared a pre-implementation corrective series | CHG-037 E |

**No decision was converted from a recommendation to a settled state by this consolidation.** Rows marked SETTLED carry an explicit decision, an author acceptance, or a structural argument recorded in the section that made them.

---

## 7.2 Blocker and dependency graph

### 7.2.1 The critical path

```
§8.7.2 corpus-overlap audit  (needs external evidence: candidates' ACTUAL training sources)
        │
        ▼
DEC-038  Family H assembled  ── shortfall: reading gold, written-Cantonese register
        │                        (no identified admissible corpus supplies paired Jyutping gold)
        ▼
Family H benchmark  (M1, M2, M2o, M2Δ — oracle baseline mandatory)
        │
        ├────────────────────────────► DEC-017  segmenter chosen
        │                                   │
        ▼                                   ▼
DEC-044  Pyodide runtime measured   §10.11 performance benchmark
   (payload, init, memory, p95)             │
        │                                   ▼
        └──────────────────────────► DEC-054 eviction budgets
                                     §10.12 performance budgets
```

**Everything downstream of DEC-038 is blocked by one piece of unglamorous work**: establishing which corpora actually trained each candidate, then annotating the reading-gold shortfall. No amount of design removes that dependency, and §6.16's staged pilot exists to bound its cost rather than to avoid it.

### 7.2.2 Independent chains

| Chain | Blocks | Note |
|---|---|---|
| **DEC-042** rime weight semantics → RULE-JP-7 (θ_read/N_read, DEC-018) → polyphone `resolved` vs `ambiguous` | The frequency path of the engine | Mitigable now: build the corpus-frequency layer as a separate slot, so the engine works whichever way 042 resolves |
| **Surname convention data** (BLOCKED, §8.9 — no primary source) → personal-name L3R quality → generated-name confidence | Nothing structural | Correct behaviour without it is: fall to the generator, `confidence: low`. That is a **degraded output, not a broken engine** |
| **DEC-043** Lands Dept stable ids → gazetteer refresh/diff design | Refresh only | Bundled snapshot works regardless; only incremental refresh is affected |
| **DEC-053** provider contract | Nothing — resolved | Core is provider-free by construction (CHG-037 A) |
| **DEC-012** `givenNameJoin` default | Nothing | Assembled forms carry units/grouping and no rendered default; every profile is an explicit projection input. **Distinct from the Reader's existing Hyphenated/Joined toggle (RC-3), which is a user preference the engine must serve, not a default the engine sets** |
| **DEC-037** fit/eval split | Publishing any generator accuracy figure | Cheap to do; do it before the first measurement, not after |

### 7.2.3 Decisions that should stay configurable rather than be settled early

DEC-006 (language), 007 (fold policy detail), 013 / 018 / 024 / 040 / 054 (thresholds), 048, 055, 056. Settling any of these now would replace a measurable answer with a guess, and each is cheap to change.

---

## 7.3 Confidence derivation table — normative

Discharges RULE-CONF-1. Moved here from §11 by CHG-037 G: this is engine semantics, and the Reader integration layer must not become its authority.

**Confidence describes confidence in the value.** It is derived, never hand-assigned, and is **never** a numeric probability (RULE-CONF-2).

### 7.3.1 Status gate — applied first

| `status` | Confidence | Reason |
|---|---|---|
| `unresolved`, `unsupported`, `out_of_scope` | **`none`** | No value exists |
| `ambiguous`, `conflict` | **`none`** | `value` is null (§5.5.1, RULE-API-3). There is no value to be confident in; **per-candidate strength lives in `Candidate.support`** |
| `fallback` | **capped at `low`** | The value came from a lower-certainty mechanism within its layer because stronger resolution was unavailable |
| `resolved` | → §7.3.2 | |

**Candidate-level `support`** is derived by the same table as if that candidate had been selected, then capped at `medium` — a candidate that lost or tied is by construction not something the engine is confident in.

### 7.3.2 Derivation for `resolved` values

| Layer | `provenance` | `evidenceClass` | `scopeDowngrade` | Confidence |
|---|---|---|---|---|
| L3R / L3E | `user_glossary` | E1a, E1b | — | **`high`** |
| L3R / L3E | `user_glossary` (entity-scoped) | E1c, E2 | — | **`high`** |
| L3R / L3E | `convention_table` | E3, E4 | — | **`high`** |
| L3R / L3E | `convention_table` | E5 | — | **`medium`** |
| L3R / L3E | `convention_table` | E6 | none (class used *as* a class) | **`medium`** |
| L3R / L3E | `convention_table` | E6 | `class_applied_to_individual` | **`low`** |
| L3R / L3E | `rule_engine` | E7 | — | **`low`** — hard cap (INV-5) |
| L2 | `user_glossary` | E1a–E2 | — | **`high`** |
| L2 | `user_glossary` (entity-scoped pronunciation entry) | — | — | **`high`** |
| L2 | `lexicon` (word or character, dominance met) | — | — | **`medium`** — see UNRESOLVED below |
| L4 | `user_glossary` | E1a–E2 | — | **`high`** |
| any | `inherited` | inherits | — | **min(antecedent, `medium`)** — capped at the antecedent, **never raised** |
| any | `external` | — | — | **UNRESOLVED** — see below |
| any | `none` | — | — | **`none`** |

**Composite values** (a name assembled from units): confidence = **minimum** over units (RULE-HKR-12), and `provenance` = `rule_engine` if any unit is.

### 7.3.3 Modifiers

| Modifier | Effect |
|---|---|
| `scopeDowngrade: class_applied_to_individual` | Forces **`low`**. In the table above rather than applied afterwards, because it is the commonest overstatement risk |
| `variation: sociophonetic` on an alternative | **No effect.** Systematic modern variation is not evidence of doubt (§3.5.3 B5) |
| `variation: register` | No effect on the selected value's confidence |
| `caution` codes | **No mechanical effect.** Cautions are surfaced separately; they qualify *what the value means*, not how confident the engine is in it |
| `caution: stale_source` | **No mechanical reduction.** An old gazetteer row is usually still correct; age is shown, not scored |
| `verifiedAt` set on the source record | **No effect** (CHG-037 B). Verification is a record property, not an Analysis input. Making it raise confidence would let a user's own click manufacture certainty |
| `derivedFrom.fallbackReason` present | **No effect.** The route is not the value's solidity (RULE-API-3a) |

### 7.3.4 What is normative now, and what is reopenable (corrected, CHG-038)

An earlier draft of this subsection said the table left three cells blank. **That was inaccurate** — two of the three are specified and implementable today, and describing them as blank would have made the table look unusable when it is not.

**Normative now, and sufficient to implement:**

| Mapping | Status |
|---|---|
| `resolved` + `lexicon` (word or character) → **`medium`** | **Normative.** Implement this |
| `fallback` (any provenance) → **`low` maximum** | **Normative.** Implement this |

**Separately reopenable by measurement** — these are not gaps, they are ceilings that evidence could raise:

| Question | What would justify a change |
|---|---|
| May a `resolved` lexicon reading ever be `high`? | `high` means "the engine would be surprised to be wrong". No lexicon accuracy has been measured, so promoting above `medium` is currently unearned. §6 M2 on a real lexicon stack could earn it |
| May a `fallback` value ever exceed `low`? | A decomposition whose parts are all E3-attested would arguably be `medium`; §2.5.3 argues decomposed place names are precisely where plausible-looking wrong output arises. §6 Family E data on decomposition accuracy would settle it |

**The one genuinely unmapped cell: `external` provenance.**

`Value<T>.confidence` is a **required** field (§5.5). An unmapped provenance is therefore not an interesting open question — it is a state in which the engine **cannot legally construct a conformant value**.

**RULE-CONF-3 (RECOMMENDED, CHG-038) — the shipping constraint.**

- The **pinned-provider interface may be implemented** now: `EngineConfig.providerSnapshot`, the snapshot type, the cache-key contribution and the version reporting are all specified and independent of this question.
- An **externally sourced value must not ship as a conformant produced value** until its confidence derivation is settled — unless an existing contract rule already supplies a legal value for it. Two such routes exist and are legal today: a provider result consumed as **evidence for a rule-engine decision** derives `low` under the `rule_engine` row, and a provider result the user has promoted into a **store entry** derives from that entry's evidence class like any other stored value. (The earlier "entity record" route is withdrawn — durable records are deferred from v1, §5.10.3.)
- What is **not** legal is emitting a value whose `provenance` is literally `"external"` while no row derives its confidence. Shipping that would either crash a conformant validator or force an implementer to invent a band at the call site — the exact drift RULE-CONF-1 exists to prevent.

This is stated as a constraint rather than a curiosity because hiding a required-field gap behind "future work" is how the gap reaches production.

---

## 7.4 Consolidated linguistic limitations

Four categories, applied throughout: **[NC]** fundamental non-capability · **[V1]** deliberate v1 limitation · **[EMP]** unresolved empirical question · **[GAP]** implementation gap.

**An implementation gap is not a linguistic impossibility**, and the categories are kept apart for exactly that reason.

### L1 — Segmentation

| # | Limitation | Cat |
|---|---|---|
| L1.1 | No segmenter selected; DEC-017 is benchmark-blocked | **[GAP]** |
| L1.2 | Segmentation gold does not exist; candidates' actual training sources are unaudited, so a fair comparison cannot yet be constructed | **[GAP]** |
| L1.3 | Genuine segmentation ambiguity exists in Chinese text and has no general solution. The engine's response is the inert/consequential split (RULE-JP-6), not resolution | **[NC]** |
| L1.4 | Segmentation quality is unmeasured; max-matching was never argued on accuracy grounds | **[EMP]** |

### L2 — Phonology

| # | Limitation | Cat |
|---|---|---|
| L2.1 | Polyphony often cannot be resolved without semantics the engine does not have; the dominance threshold is a stopgap | **[NC]** partly, **[EMP]** on the threshold |
| L2.2 | 文白異讀 register variation is acknowledged but which register is "default" per word is a lexicon question with no corpus behind it | **[EMP]** |
| L2.3 | Sociophonetic variation (n/l, ng-dropping, kw-loss) is annotated, never resolved as error, and never offered as a selectable accent | **[V1]** |
| L2.4 | Tone change (變調) is lexicalised-only; no productive sandhi rules | **[V1]** — a wrong rule would silently corrupt every affected reading |
| L2.5 | Frequency authority is unresolved (DEC-042): rime weight provenance is unestablished, so RULE-JP-7's threshold has no verified input | **[EMP]** |
| L2.6 | HKSCS coverage is bounded by the adopted inventory's revision. The LSHK table is HKSCS-2001-basis; later revisions and later Unicode extensions are an **unmeasured** gap | **[EMP]** |
| L2.7 | Jyutping cannot distinguish high-level from high-falling tone 1 — a property of the scheme, not of the engine | **[NC]** |

### L3R — HK-style romanisation

| # | Limitation | Cat |
|---|---|---|
| L3R.1 | The notation is lossy: tone, aspiration and the long/short /a/ distinction are all discarded (發/佛 → *Fat*) | **[NC]** |
| L3R.2 | **Non-invertible.** *Yau* ← 邱/尤/游/丘; *Wan* ← 溫/灣/雲/環. A romanisation can never recover characters or pronunciation | **[NC]** |
| L3R.3 | The historical ts/ch and s/sh distinction is **not recoverable from modern Jyutping alone** — the contrast it reflects no longer exists in speech | **[NC]** |
| L3R.4 | The rule pack is an **engine-defined reconstruction**, not a published government algorithm. The naming *policy* is published; the spelling algorithm is not | **[NC]** on the absence; **[GAP]** on the fitting |
| L3R.5 | Accuracy measured on **place names does not transfer to personal names** — different institutional traditions | **[NC]** |
| L3R.6 | The §2.2.3 tables are recollection cross-checked against a secondary source, not fitted to the gazetteer | **[GAP]** |

### L3E — English and name forms

| # | Limitation | Cat |
|---|---|---|
| L3E.1 | **A bearer's spelling cannot be inferred from their characters.** There is no register of how individuals spell their names | **[NC]** |
| L3E.2 | Class-level surname convention is **not** individual identity: 梁 → *Leung* is a fact about the spelling, not about any 梁 person | **[NC]** |
| L3E.3 | Official, native-original and hybrid forms cannot be generated from pronunciation — 彌敦道 is *Nathan Road*, 佐敦 is *Jordan* | **[NC]** |
| L3E.4 | Community variation (陳 → Chan/Chen/Tan/Tran) is a fact about the person, undetectable from the characters | **[NC]** |
| L3E.5 | Attested forms can go stale; gazetted names change and datasets are withdrawn. `asOf` mitigates, it does not solve | **[NC]** on drift; **[EMP]** on rate |
| L3E.6 | The surname convention table does not exist. **No authoritative public class-level Hong Kong surname-romanisation source is known to this packet**; §8's search was not exhaustive, so this is a search result, not a proof of non-existence — though L3E.1 bounds how much any such source could help | **[GAP]**, bounded by **[NC]** L3E.1 |
| L3E.7 | The institutional official-name list does not exist and its scope is undefined | **[GAP]** |

### Entity detection

| # | Limitation | Cat |
|---|---|---|
| E.1 | Person detection is heuristic and gated; 李 as "plum" is indistinguishable from 李 as a surname without corroboration | **[NC]** partly, **[EMP]** on rates |
| E.2 | **False positives are especially dangerous when projected as protected spans** — a wrongly protected ordinary word silently corrupts downstream translation and reads as a translation bug | **[NC]** on the asymmetry; mitigated by RULE-ENT-5/13 |
| E.3 | Foreign-name recovery is limited: without an interpunct, transliterated foreign names are often undetectable, and recovery of the original is generally impossible | **[NC]** |
| E.4 | Document memory raises **recall only**; repetition never raises confidence | **[V1]**, deliberate |
| E.5 | 2+2 vs 1+3 four-character name parsing has no general solution | **[NC]** |
| E.6 | Detection precision and recall are entirely unmeasured | **[EMP]** |

### Evidence and licensing

| # | Limitation | Cat |
|---|---|---|
| EV.1 | **Evidence class ≠ output precedence.** E1a wins the resolution race and asserts nothing about the world | **[NC]** conceptual, enforced by RULE-HKR-5a |
| EV.2 | **User preference ≠ external attestation.** `externalAttestation` answers only whether external use is attested — not authority, precedence, confidence, or whether the value was generated | **[NC]** |
| EV.3 | Licence conclusions are resource- and transformation-specific. Whether obligations attach to a combined artefact depends on its character and the specific facts; **this packet is not legal advice** | **[NC]** on the packet's competence |
| EV.4 | words.hk is licensed **per entry** and non-commercially; a default bundle would need filtering this session cannot verify | **[GAP]** + **[NC]** |
| EV.5 | Every source snapshot can become stale; government datasets are withdrawn without notice | **[NC]** |
| EV.6 | No licence has been reviewed by a qualified person; nothing was downloaded or inspected | **[GAP]** |

---

## 7.5 Invariants vs recommendations

The packet contains many emphatic rules. They are **not** equally binding.

| Tier | What it means | Members |
|---|---|---|
| **Hard invariants** — violation is a bug | Testable; no configuration may disable them | INV-1 source fidelity · INV-2 partition · INV-3/16 entity geometry · INV-4 grapheme safety · INV-5 no fabricated certainty · INV-6 provenance completeness · INV-7 determinism (scoped, §5.13.1) · INV-8 declared offset unit · INV-9 no source mutation · INV-10 mode completeness · INV-11 bounded override locality · INV-12 store independence · INV-13 idempotence · INV-14/15 alignment · INV-17 protected-span geometry |
| **Explicitly SETTLED decisions** | Decided with recorded authority — an author acceptance, or a structural argument in the section that made it. Changeable only by a new decision plus a change-log entry | The rows marked SETTLED or AMENDED in §7.1.1, **individually**. A rule's state is the state recorded for it, never inferred from its identifier |
| **Current RECOMMENDED rules / normative defaults** | The packet's working answer, binding on an implementation **until a decision overrides it**. Most `RULE-*` entries live here. They are normative to implement against and overridable on evidence | RULE-API-*, RULE-ENT-*, RULE-HKR-*, RULE-JP-*, RULE-CACHE-*, RULE-LAB-*, RULE-TEST-*, RULE-DEP-1, RULE-CONF-* — **except** those whose own text marks them UNRESOLVED or superseded |
| **Explicitly open rules** | Carry a RULE-* id but are **not** settled and must not be implemented as though they were | **RULE-JP-5** (segmentation approach — UNRESOLVED, CHG-019) · **RULE-SCOPE-1** (superseded, retained for the record, CHG-003) |
| **Benchmark-dependent defaults** | Provisional numbers standing in for measurements. Implement them as configuration, never as constants | θ_read, N_read, N/θ promotion, `protectionConfidenceFloor`, M8 band, eviction budgets, all performance budgets, fit/eval ratio |
| **UI-only recommendations** | Bind the Lab, not the engine | RULE-LAB-1…11 and all of §9. **RULE-LAB-1/2 are the exception** — "no second resolution path" and "the trace is the engine's" are architectural, not cosmetic |
| **Author-supplied Reader constraints** | Given facts the engine must be able to serve; **not** engine design decisions and not open to revision here | RC-1 no LLM dependency · RC-2 unknown-name → L3R fallback · RC-3 generated-name style toggle · RC-4 verbatim forms never restyled |

**Do not infer settlement from the existence of a `RULE-*` identifier** (CHG-038). The earlier version of this table listed whole ranges — "RULE-API-1…17, RULE-JP-1…12" — under settled decisions, which mechanically swept in RULE-JP-5, whose own text marks it UNRESOLVED. A rule's tier is the tier its own text supports.

---

## 7.6 The safe-to-implement boundary

### 7.6.1 CHG-050 correction gate — no implementation authorised

Formal Stage 2 remains **OPEN**. The accepted S2-P1–P5 artefacts are preserved byte-for-byte, but their acceptance against the preceding contract does not automatically establish compatibility with `5.0.16`. No S2-P6 implementation began, and CHG-050 does not resume the stopped S2-P6 authority-audit attempt. The only safe route is the following ordered control sequence:

| Order | Required action | Boundary |
|---:|---|---|
| 1 | Fresh affected Stage-0 schema/validator materialisation and regression against `5.0.16` | Materialise the affected strict types, schema, cross-field validators and contract-test vectors/obligations for grouping, style references and rendering semantics; do not implement style or engine behaviour |
| 2 | Bounded S2-P1 fingerprint/cache-vector regression | Required because `contractVersion` participates in cache identity. Verify the existing primitive/vectors against `5.0.16`; do not change the canonical encoder or cache-key field membership |
| 3 | Independent impact rebase | Retain unaffected S2-P2–P5 closures only where regression proves compatibility; do not rewrite accepted source artefacts |
| 4 | Independent control verification | Verify the rematerialised/rebased evidence and issue a new control disposition |
| 5 | Fresh S2-P6 restart, only if authorised by that control | Restart from the beginning; do not continue the stopped attempt or inherit its unchecked assumptions |

Until all preceding gates pass, no style code, engine creation, projection, cache, segmentation, Reader, translation or TTS work is safe-to-implement under this packet. CHG-050 itself is contract correction only.

### 7.6.2 Must not be frozen yet

| Item | Why |
|---|---|
| **Segmenter choice** (DEC-017) | Family H does not exist; choosing now would be preference, which CHG-019 exists to prevent |
| **Frequency thresholds** (DEC-018) | Their input (DEC-042) is unverified; a threshold on the wrong quantity is worse than none |
| **Performance budgets** | Nothing has been run (§10.12) |
| **Any accuracy claim** — generator, segmenter, entity, coverage | No measurement exists; §6.9's contamination rule must run first |
| **Surname convention table quality claims** | The table does not exist, and **no authoritative public source is currently known to this packet** — the §8 search was not exhaustive (§8.9). Separately and structurally: no public registry can tell the engine how an arbitrary individual spells their own name (L3E.1) |
| **`givenNameJoin` global default** (DEC-012) | Rejected as an inference; distinct from RC-3's user toggle |
| **M7 coverage figures** | The denominator inventory is not yet chosen or snapshotted (§6.13.1) |
| **Live external-provider integration** | Out of the core by construction; the orchestration layer is unspecified and unneeded for v1 |

---

## 7.7 Adversarial consistency scan

Run over the whole packet before closing §7. Genuine live contradictions were patched under CHG-037; historical examples superseded by §5 were **not** cosmetically rewritten.

| Check | Result |
|---|---|
| A decision SETTLED in one section and UNRESOLVED elsewhere | **3 found** — DEC-036, DEC-012, DEC-038. All resolved in §7.1.2 |
| **§7's own claims about what CHG-037 had patched** | **INACCURATE when first written; corrected twice.** CHG-038 materialised the missing edits and CHG-039 finished the residue this row's original text had not caught. A scripted edit pass aborted before writing the file, so roughly half of CHG-037's edits were never materialised while §7 described them as applied. Repaired by CHG-038; this row is retained because a consolidation section that misreports its own inputs is the failure most worth recording |
| Withdrawn vocabulary used as live **normative** text | **7 found by CHG-038**, **4 more by CHG-039**, **and 10 more by CHG-040 F** — T-HKR-022; §4.7.1's common store schema; RULE-ENT-10's inherited-property table; the §4.9 and §4.11 worked payloads; the §4.6 entity-record illustration; §1.2.1's `String + kind + provenance`; §1.2.3's `kind: calque_or_hybrid` status row; §1.4's "one `kind`" gloss; §2.8.1's Case-2 payload. Each earlier pass declared the residue closed and each was wrong, because a grep for one token does not find the same idea spelled differently. **Remaining occurrences are now individually classified**: change-log history; §4.16's migration table (documents the mapping by design); and the §1.2.3, §2.8.1 and §4.6.1 illustrations, each of which carries an explicit superseded note |
| Stale live contract-version reference | **7 found in total** — §9 header, §9.2.1, §5.9.1 heading, packet status line, version-wording paragraph, §0.4 row for §5, §1.5.1 note. All patched; the last four were still live until CHG-038 |
| Old `externallyAttested` boolean treated as authoritative | **The earlier "none found live" was wrong. CHG-040 F found 7** — T-HKR-022, the §2.8.1 Case-2 payload and its explanatory sentence, RULE-ENT-10's inherited-property table, the §4.6 entity-record illustration, the §4.9 worked payload, the §4.11 protected-span payload, and §4.7.1's common store schema. All corrected to the tri-state `externalAttestation`. Remaining occurrences are change-log history and §4.16's migration row, which documents the change by design |
| `styleVariants` or rendered text inside a style-neutral `Analysis` | **None.** The only live occurrences are the prohibitions themselves (RULE-API-10, T-API-016/017) |
| A statement that store precedence implies external attestation | **None found live.** RULE-HKR-5a and §9.14 state the opposite; §9.14's helper text was the one instance and was corrected by CHG-035 B |
| Entity-only HK romanisation reintroduced | **None.** RULE-SCOPE-1 is explicitly marked superseded and retained only for the record |
| Withdrawn licence-propagation generalisation | **2 found** — §8.2.2 and DEC-046. Patched (CHG-037 F; verified materialised by CHG-038) |
| Cache statement treating matching source text as semantic identity | **None.** RULE-CACHE-2 forbids it explicitly and §10.5.3's fingerprint exists to prevent it |
| "The eight key inputs" after the key grew | **2 found** — §5.15 tail, T-API-007. Patched (CHG-037 D; verified materialised by CHG-038) |
| A live-provider Analysis state the core can no longer produce | **4 found by CHG-038** — INV-7's text, §10.7's third mode, RULE-CACHE-9, T-CACHE-018. **A further 3 found by CHG-039** — §5.15's cached-`ExternalProvider`-results row, the dependency-table row, and the core diagnostic `EXTERNAL_PROVIDER_FAILED`. All patched; the core admits only *no provider* and *pinned snapshot*, and live-call failure is a host diagnostic |
| A public type referenced but never defined | **1 found by CHG-039** — `EntityMemoryEntry`, referenced by `DocumentContext` since CHG-029 and never specified. Defined in §5.10.2 |
| **A type whose closure contradicted its own prose** | **1 found by CHG-040 A** — `EntityMemoryEntry` said "spans OMITTED" in a comment while `PersonNameStructure`, `Reading`, `Romanisation` and `styleApplicable.unitIds` all carried spans or Analysis ids. A comment is not a type. Replaced with dedicated span-free memory types and a recursive property test (T-API-028) |
| **A durable store existing only in prose** | **1 found by CHG-040 B** — `recordRef` and `provenance: "entity_record"` named a subsystem with no type, API, config input, versioning, invalidation or namespace semantics, while four subsystems already produced it. Durable Entity Records deferred from v1 (§5.10.3, DEC-…-058) |
| **An illegal status/value combination permitted by a type** | **1 found by CHG-040 A** — memory channels carried `status: Status` with a non-null `value`, permitting `ambiguous` + value, contradicting §5.5.1. Restricted to `resolved \| fallback` (RULE-API-22) |
| **Two byte specifications for one hash preimage** | **1 found by CHG-040 C** — RULE-API-20 said fields were hashed "in this order" while §5.15.2's encoder sorts object keys. Replaced with an ordered tagged array, entries canonicalised by ascending `inputHash`, duplicates rejected |
| **Two byte specifications surviving one correction** | **2 found by CHG-041** — `DocumentContext` had both an ordered tagged array (§5.10.2.1) and a "keys sorted in UTF-16 order" paragraph; `ProviderSnapshot`'s interface comment still showed an object preimage after RULE-API-20 moved to an array. Each was a *second* specification introduced by the very pass that fixed the first. Both deleted; each object now has exactly one preimage |
| **A test asserting an impossible invariant** | **1 found by CHG-041** — T-API-028 banned "any key named `id`" reachable from `DocumentContext`, which `DocumentContext.id` makes unsatisfiable. Rewritten to test semantic type identity over `entities[]`, with `id` and `ref` explicitly permitted as context-contract identities |
| **A deferral not propagated to its dependents** | **6 found by CHG-041** — DEC-…-058 deferred durable Entity Records, but §1.4's terminology, §1.7's provenance introduction, §2.4.4's creator-canonical path, §4.6.2's value-drift rule, RULE-CONF-3's promotion route and DEC-…-027 all still treated records as a live v1 domain. All propagated |
| **An invariant contradicted by the contract's own type name** | **1 found by CHG-041** — RULE-ARCH-1/RULE-API-2 said no engine type may mention a document, while the public API contains `DocumentContext`. Narrowed to consumer-specific *document structure*, with the generic continuity input named as the stated exception |
| **A layer boundary corrected in one authoritative section but left alive in an older resolution chain** | **4 found by CHG-042** — §4.7.2 and §5.8 made lexical/phrase translation entries L4-only, yet Chain B kept a step resolving them into `englishForm`, repeated in §4.9's diagram and §9.8's trace; the "entry applying to both stores" route survived INV-12; §5.10.4 exported convenience views DEC-…-034 had excluded; and the directive style setting took the Lab's whole `StyleProfile` union after RC-3 fixed it to two values. **This is a distinct class from the vocabulary residues.** Nothing here was stale *wording* — each was a live, coherent, older *chain* that a grep for withdrawn terms could never surface, because every token in it was current. Only tracing each layer boundary end to end finds them |
| **Pre-CHG-037 provider semantics surviving in a detection mechanism** | **1 found by CHG-040 D** — D7 still read "`external` / `medium` / must be cached and marked", contradicting both the pinned-snapshot model and RULE-CONF-3. Corrected; DEC-…-030 reaffirmed as interface-only |
| An identity claim the schema does not support | **1 found by CHG-039** — `ProviderSnapshot.id` was the hash of `entries` alone while §5.13.1 claimed provider identity and configuration reached the cache key through it. Corrected (§5.13.2); `createdAt` explicitly excluded as non-semantic |
| A rule presented as settled solely because it has a `RULE-*` id | **1 found** — §7.5's range listing swept in RULE-JP-5, whose own text is UNRESOLVED. Patched by CHG-038 |
| **`5.0.9` compiled public-contract materialisation failures** | **14 adjudicated by CHG-044.** The fresh recovery run found thirteen blocking graph/representability defects plus the duplicate `ExternalAttestation` alias: store mechanism and evidence applicability, assembled L3E, graph closure, exact-owner references, canonical integers, Chain C, L4 conflict, case sensitivity, grouped alignment, per-channel inheritance and unresolved-semantic projection. §5 v0.10 applied the bounded corrections; the fresh `5.0.10` regression audit independently proved every R0A-DEF-001…014 CLOSED |
| **`5.0.10` observability/context-input materialisation findings** | The fresh audit's strict graph/schema closed and all 86/86 applicable tests passed, but its fail-closed contract gate was **BLOCKED** on exactly three representability defects: no projection-diagnostic channel, no engine-creation diagnostic channel, and unreachable `documentTag` context (R0A-510-DEF-001…003). It also found one non-blocking branch-invalid `.text` residue (R0A-510-DEF-004). CHG-045 applies A–D in `5.0.11`; the unchanged `5.0.10` package remains authoritative evidence, while `5.0.11` is untested |
| **CHG-046 preimage closure** | The four accepted preimplementation `5.0.11` Range 0B findings are applied in §5.15: one domain tag per public identity, `keyFormatVersion` immediately after it, exact tagged-array formulas, effective-option defaults, exact tag-set normalisation, and digest inputs as lower-case hex strings. `DocumentContext` and `ProviderSnapshot` remain unchanged. The former `userDataVersion` residue was carried forward for explicit adjudication and is closed by CHG-047 |
| **CHG-047 exact-integer closure** | The public `userDataVersion:number` is now uniquely bounded to the exact integer domain `0..9007199254740991`, starts at `0`, increments once per committed mutating transaction across all stores, does not increment on reads/previews/no-ops/failures/rollbacks, rejects maximum overflow atomically, and is consumed by §5.15.2 as a semantic signed-int64 value rather than IEEE-754 bytes, decimal text or a `CanonicalValue` wrapper. `CHG-046-RES-001` is **CLOSED**; fresh Range 0A rematerialisation against `5.0.13` remained the next gate at that historical revision |
| **CHG-048 hash-reachable grouping closure** | Independent verification of the submitted `5.0.13` Range 0B package found IV-0B-001. At that historical revision, `5.0.14` closed the exact non-negative local-index domain and semantic-int64 consumption but deliberately left grouping coverage/order/overlap/duplicates open; CHG-050 now closes those remaining grouping semantics without changing the encoder |
| **CHG-050 style-rendering closure** | The accepted S2-P6 defect finding identified seven live blockers. Contract `5.0.16` now defines exact grouping, all five style profiles, ASCII casing, licensed adjacent runs, the surname exception and ordered duplicate-preserving variants. No implementation ran; formal Stage 2 remains OPEN and the five-step regression/rebase/control route in §7.6.1 is mandatory |

**CHG-047 residual and non-blocking-residue review.** The earlier Class-D questions remain non-blocking where the live contract does not require a decision: `documentTag` applicability is explicitly defined for contextual Store matching and remains silent outside that use case; hypothetical future `EngineConfig` checks have no diagnostic behaviour beyond the currently defined ProviderSnapshot/lexicon cases. CHG-047 closes the only promoted CHG-046 blocker, `CHG-046-RES-001`, by defining the exact public numeric domain, lifecycle and semantic-int64 encoding. The 5.0.9 and 5.0.10 defect closures and CHG-046's four byte-preimage closures are historical regression evidence and are not reopened.

---

## 7.8 The actual remaining blockers

**Five live blocker classes.** Four are evidence/data constraints; one is the current CHG-050 contract-control gate. Accepted S2-P1–P5 artefacts remain unchanged but require the bounded regression/rebase route before they may support `5.0.16`; no S2-P6 implementation began, the stopped authority-audit attempt is not resumed, and formal Stage 2 remains OPEN.

1. **The corpus-overlap audit** (§8.7.2) — establish each segmenter candidate's *actual training sources*, not its bundled data. Needs external evidence. **Blocks DEC-038 → DEC-017, and the final segmenter-dependent performance adjudication.** It does **not** block performance infrastructure, cache implementation, instrumentation, or any measurement that can validly be run against the provisional baseline behind the replaceable `Segmenter` interface (RULE-JP-5a). What stays provisional until DEC-017 closes is any performance **budget or claim** that materially depends on which segmenter is selected (CHG-043).
2. **Family H's reading-gold shortfall** — **no currently identified admissible corpus** supplies paired Jyutping reading gold aligned to segmentation gold; the search was not exhaustive, so a candidate may yet exist. Needs annotation for whatever remains. The §6.16 staged pilot bounds the cost.
3. **DEC-042** — rime weight provenance. Needs external evidence. Blocks the frequency path only; the mitigation (a separate corpus-frequency layer) can be built now.
4. **The surname convention table** — **no authoritative public source is known to this packet** (§8.9), and the search was not exhaustive. Bounded in any case by a fundamental non-capability (L3E.1), so the correct interim behaviour is already specified: fall to the generator at `confidence: low`.
5. **The corrected `5.0.16` contract-control gate.** CHG-050 closes the accepted S2-P6 style-rendering contract defect without beginning S2-P6 or modifying accepted S2-P1–P5 artefacts. Formal Stage 2 remains OPEN. The mandatory order is: fresh affected Stage-0 schema/validator materialisation and regression; bounded P1 fingerprint/cache-vector regression because `contractVersion` participates in cache identity; independent impact rebase retaining P2–P5 closures only where regression proves compatibility; independent control verification; only then a fresh S2-P6 restart. The canonical encoder and cache-key field membership remain unchanged.

**SECTION COMPLETE — §7 Decision Register + Linguistic Limitations**

---

# §11 — Reader Integration Interface Contract

**What this section is.** An **integration boundary and adapter contract**, written against engine contract `5.0.16`. It defines what a host must supply, what the engine guarantees in return, and where responsibility sits. CHG-050 does not inspect or modify the Reader.

**What this section is not.** The Reader has **not been inspected by this session**. §11 makes no claim about its components, storage, framework, request formats, existing APIs, Google Docs handling, GPT prompts or UI. Nothing here is a recommendation to change it. Its only inputs are the engine contract, RC-1…RC-4 (§0.6), and the Reader behaviours the author has already recorded in this packet.

**RULE-INT-0.** Where this section and the real Reader disagree, the Reader is the fact and §11 is the hypothesis. An agent with actual access should treat §11 as a checklist to test, not a design to impose (§11.13).

---

## 11.1 Responsibility boundary

| Owner | Owns |
|---|---|
| **Reader / host** | Document fetching and parsing · source and chunk lifecycle · the GPT-based translation workflow · TTS and audio playback · UI state · persistence of Reader-specific settings · all network and provider orchestration outside the engine core |
| **Language engine** | Segmentation · L2 readings and Jyutping · L3R HK-style romanisation · entity detection · L3E English-form resolution · store resolution · provenance and uncertainty · the style-neutral `Analysis` |
| **`@hklang/style`** | Display projections · person-name style rendering · `projectTranslationDirectives`, including projection-local diagnostic production |

**RULE-INT-1 — no side reproduces another's linguistic logic.** The host must not re-derive a reading, guess a romanisation, decide an entity boundary, break a conflict, or fabricate a confidence. The engine must not acquire document, network or UI concepts (RULE-ARCH-1, RULE-API-2). Where the host needs a linguistic answer the engine does not currently give, the correct move is a change request against the engine, not a local approximation — a second resolution path is how the two implementations begin to disagree silently.

**RULE-INT-2 — the engine has no LLM dependency** (RC-1). Nothing in this contract requires, permits or anticipates the engine calling a model. A live external provider, if one ever exists, runs in host orchestration and must materialise a pinned snapshot before the core is invoked (§5.13.1).

---

## 11.2 Source and chunk contract

Once `createEngine` succeeds, the engine's processing universe is *string in, `Analysis` out*. A host works in paragraphs, sentences or pages; none of those concepts enter engine types.

**RULE-INT-3.** A host may call `processText` with any contiguous slice of its document — one sentence, one paragraph, several paragraphs, or the whole thing. The engine imposes no chunk semantics. Two consequences the host owns:

1. **Offsets are local to the string passed in.** They are `utf16` (§5.2) and are relative to *that call's* `source`. Mapping engine offsets back to document positions is the host's job, and the host must do it with the same `offsetUnit` — a host that stores code-point offsets and compares them to engine spans will corrupt every non-BMP character (§3.6.2).
2. **A chunk boundary is a linguistic decision the host is making.** Splitting mid-sentence denies the engine the window it needs for polyphone and entity resolution (§3.4.4). Prefer chunk boundaries at sentence terminators; where that is impossible, expect degraded resolution at the seam rather than an error.

### 11.2.1 Continuity across chunks

**RULE-INT-4 — continuity is explicit, never ambient.** Entity memory does not persist inside the engine between calls (RULE-ENT-8). A host that wants chunk *n+1* to know about entities resolved in chunk *n* must construct and pass a `DocumentContext` (§5.10.1).

```
host: analysis₀ = processText(chunk₀, { })
      ctx₁      = hostBuildContext(analysis₀)        // host selects what carries forward
      analysis₁ = processText(chunk₁, { documentContext: ctx₁ })
```

| Obligation | Detail |
|---|---|
| The host constructs the context | The engine does not hand back a ready-made "next context" that could be passed around opaquely; the host chooses what carries forward and can therefore audit it |
| Context is an input | It enters `optionsHash` and the cache key. Two calls with different context are different analyses (T-CACHE-007) |
| Document tags are a separate current-call input | The host supplies opaque `ProcessOptions.documentTags` only when it intends Store document-tag matching. It never derives them from `DocumentContext.id` or consumer metadata; equivalent reordered/duplicated tag sets normalise identically (§5.15) |
| **Ids are not durable** | Engine ids are deterministic for a fixed input tuple and meaningless across any change (RULE-API-13). A host must **not** store an entity id from chunk *n* and expect it to identify the same thing in chunk *n+1*. Carry the entity's **content** via `EntityMemoryEntry` (§5.10.2) — characters, type, licensed aliases, resolved forms and their per-channel evidence — not its id. **No durable identity crosses a call in v1**: `recordRef` was withdrawn with durable Entity Records (§5.10.3, CHG-040 B). Where the host needs a persistent identity for an entity, it uses its own — the engine does not supply one |
| Inherited values are marked and capped per channel | Each selected inherited value/candidate carries its own `inheritedFrom`, and confidence is capped at that channel's antecedent. Different channels may cite different Analysis/DocumentContext antecedents; a local channel may coexist with inherited channels. Repetition never raises certainty (RULE-ENT-9, CHG-044 K) |
| Re-analysis of an edited early chunk may change later ones | This is correct behaviour, not a cache bug (§10.3.2). A host that displays chunk *n+1* while chunk *n* is being re-analysed must be prepared for the later chunk to change |

---

## 11.3 Display contract

**RULE-INT-5 — one `Analysis` serves every display mode** (INV-10). Source only · Jyutping · HK Romanisation · both · entity-related presentation are all projections of the same object. Switching between them must not re-invoke the engine and must not refetch the document.

| Mechanism | Correct | Incorrect |
|---|---|---|
| Display mode | `projectAnnotations(analysis, displayOptions)` | a `ProcessOptions` field |
| Person-name style | `renderPersonName` / `renderVariants` (§11.5) | re-analysis |
| Protection floor | `projectTranslationDirectives` settings (§11.4) | `ProcessOptions` (RULE-API-11) |

**RULE-INT-6 — display toggles are never `ProcessOptions`.** If a setting changes only what the user sees, it belongs in a projection. The test is mechanical: does changing it alter `analysisCacheKey`? If yes, it is a processing option and the host is about to re-run the pipeline for a display change.

**What §11 does not prescribe.** Layout, typography, placement of annotations, colour, and density are the host's. The semantic constraints already fixed elsewhere still hold — annotations are subordinate to source text; `out_of_scope` renders as silence while `unresolved` renders as a marked gap (RULE-JP-4) — but §11 adds no visual requirements of its own and does not import the Lab's density model (§9.1), which was designed for an instrument, not a reading surface.

---

## 11.4 Translation contract (RC-1, RC-2)

**The Reader's GPT translation workflow remains entirely external.** The engine supplies structured resolution data and stops.

```
analysis   = processText(chunk, { … })                       // engine
directives = projectTranslationDirectives(analysis, { … })   // pure projection
host observes directives.diagnostics                          // projection-local
             ↓
             host applies them however it applies them       // host, unspecified here
```

The projection supplies three action/semantic lists (§5.12) — `protectedSpans`, `termDirectives`, `unresolvedSemanticSpans` — plus the separate projection-local `diagnostics` array.

**The host's semantic obligations** — stated as obligations, with **no** prompt, template, placeholder syntax, request format or model call designed or implied:

| # | Obligation |
|---|---|
| **T-1** | A span in `protectedSpans` is rendered using its `replacement`, verbatim. Known, stipulated and attested names are preserved as given |
| **T-2** | An unknown Chinese proper name whose entity policy is `romanisation_allowed` arrives with an L3R-derived `replacement` (§4.9). The host uses it **rather than allowing the translation layer to invent a name or translate it semantically** — this is RC-2's whole purpose |
| **T-3** | An entity whose `englishForm.status` is `ambiguous`, `conflict`, `unresolved` or `unsupported` produces **no** protected span and appears in `unresolvedSemanticSpans` instead. The projection preserves that source status; only `unresolved`/`unsupported` carry their required source reason, while `ambiguous`/`conflict` carry no fabricated reason. The host must **not** promote such a value into a protected replacement |
| **T-4** | Core `Analysis.termResolutions` are **L4 resolution truth**. Only selected `resolved` values project into concrete `termDirectives`; an equal-authority conflict retains null value and entry-bearing candidates and projects no preferred string. Neither form is an entity or `englishForm`, and neither justifies a protected proper-name span (CHG-024/044 H) |
| **T-5** | Where the engine has no answer, the host's translation layer is free to translate. `unresolvedSemanticSpans` is an invitation, not an error |
| **T-6** | The protection floor is a host-supplied projection setting. Lowering it increases protected spans and therefore increases the risk of freezing an ordinary word (§4.11.1); raising it lets more names through to the translator. Neither direction is free, and the choice is the host's |
| **T-7** | The host reads overlap-drop diagnostics from `directives.diagnostics`, never from `analysis.diagnostics`. A missing selected term directive paired with `TERM_DIRECTIVE_DROPPED_OVERLAP` is intentional protection precedence. The diagnostic span is bound to the same exact source by `directives.sourceHash` |

**RULE-INT-7.** `directives.sourceHash` binds a directive set to one exact source string. A host must not apply directives computed for one source to a different one — see §11.10.

---

## 11.5 Generated personal-name style (RC-3, RC-4)

The Reader already exposes a Hyphenated / Joined preference. The contract preserves it.

**RULE-INT-8.** The style preference is supplied to the **projection**, never to `processText`.

```
directives = projectTranslationDirectives(analysis, { generatedPersonNameStyle: "joined" })
// GeneratedPersonNameStyle = "hyphenated" | "joined" — the Lab's wider StyleProfile
// (spaced, hyphen_title, surname_caps) is NOT offered to a Reader (CHG-042 D)
rendered   = renderPersonName(entity.englishForm.value, "joined")
```

Switching the preference:

| Guarantee | Basis |
|---|---|
| Re-projects only | RULE-API-7 |
| Performs **zero** linguistic work | asserted by instrumentation, T-CACHE-013 |
| Does not refetch source | the `Analysis` is unchanged |
| Leaves `analysisCacheKey` byte-identical | style is not a key input (§5.15) |
| Applies joining only to unique, increasing ids licensed by `styleApplicable`; non-contiguous ids form separate maximal adjacent runs and never join across an unlicensed unit | RULE-ENT-11/11a, CHG-050 |
| Keeps the surname/given boundary exactly U+0020, preserves literal/translated unit text byte-for-byte, and gives non-target romanised units identical shared casing in Hyphenated and Joined | §5.11.2–3 |
| **Never** alters a verbatim form — user, creator-canonical, bearer, official, or conventional | RULE-API-6; structurally enforced, since a `VerbatimEnglishForm` has no units for a profile to act on |

**RULE-INT-9 — two different questions, kept apart.** The unresolved **global `givenNameJoin` default** (DEC-…-012) is *not* the Reader's toggle. No `StyleProfile` sets or implies it. The Reader's narrower Hyphenated/Joined value is an explicit user preference; integration preserves that setting and does not wait on, or resolve, DEC-012. `spaced`, `hyphen_title` and `surname_caps` remain invalid for `GeneratedPersonNameStyle`.

---

## 11.6 TTS and pronunciation interface

**The engine does not synthesise speech** (N1, §1.3.2). It supplies pronunciation data a TTS consumer may use.

| A TTS consumer **may** use | Because |
|---|---|
| `token.reading` / `entity.reading` — the L2 Jyutping and structured syllables | This is the pronunciation layer |
| The **pronunciation dictionary** via the engine's resolution (it is already reflected in `reading`, §3.5 step 1) | User overrides are pronunciation facts |
| `reading.alternatives` with their `variation` kind | To choose a register, or to avoid presenting sociophonetic variation as an error |
| `status` and `confidence` on the reading | To decide whether to speak a low-confidence guess |

| A TTS consumer **must not** infer | Why |
|---|---|
| Pronunciation from `romanisation` (L3R) | The notation is lossy and non-invertible: tone, aspiration and the long/short /a/ distinction are gone; *Fat* ← 發/佛 (L3R.1–2). **A romanisation cannot be read back into a pronunciation** |
| Pronunciation from `englishForm` (L3E) | *Nathan Road* is not how 彌敦道 is pronounced in Cantonese |
| That a displayed Latin form should be spoken as Latin | See below |

**RULE-INT-10 — display channel and speech channel are independent.** That an entity is *displayed* as *Leung Chi-yiu* does not mean the speech channel should pronounce the English letters. If the intended speech channel is Cantonese, it speaks the **L2 reading of the Chinese source**; the romanised or English form is a display artefact. A host that wants an English-language speech channel to say the English name is making a separate, legitimate choice — but it is a host choice about which channel is speaking, not something the engine's romanisation implies.

**Not designed here:** voices, languages, prosody, SSML, vendor selection, or how a host decides which channel speaks.

---

## 11.7 Dictionary mutation lifecycle

**RULE-INT-11 — a store write makes the current `Analysis` stale.** Any successfully committed create, update, delete or enable/disable in any of the three stores that changes persistent state increments the single global `userDataVersion` exactly once, which is a cache-key input (§5.15). An import apply with one or more writes is one transaction and increments once, not once per row. Reads/search/list/get/export, import preview, `writesApplied:false`, no-op validation, failures and rollbacks do not increment. The counter starts at `0` for a new Store-set namespace and is valid only in `0..9007199254740991`; at the maximum, a would-be mutation fails atomically before any record, revision, timestamp or version change. The displayed `Analysis` is then historical only after a committed write; an overflow rejection leaves it and the stores unchanged.

| The host **must** | The host **must not** |
|---|---|
| Mark the current view stale and re-analyse | **Patch the old `Analysis` to look current.** A hand-edited annotation would carry provenance the engine never produced, and would then flow into protected spans and exports |
| Re-run `processText`; internal reuse of unaffected windows is the engine's business (§10.5) | Assume a store edit affects only the obviously matching text — segmentation can shift within a window |
| Preserve store independence: a pronunciation write affects L2 only; an HK Romanisation write affects L3R (and L3E only via the explicit §4.9 fallback); a translation write affects L3E or L4 by `entryScope`. Preserve conditional `formKind` and required `caseSensitive` through every mutation/import/export | Write to one store on the user's behalf when they edited another (INV-12). A cross-store convenience must be an explicit, visible second entry; E3–E7 import rows must not become StoreEntries |

**RULE-INT-12 — projection settings are not store writes.** Changing display mode, name style or protection floor does **not** make the `Analysis` stale and must not trigger re-analysis. The two lifecycles are different and a host that conflates them will re-run the pipeline every time a user flips a toggle.

---

## 11.8 Version and compatibility handling

**RULE-INT-13.** A host inspects, at minimum, `schemaVersion` and `contractVersion`, plus `engineVersion` and the data-version axes where it surfaces them to the user or keys its own caches on them.

| Situation | Host behaviour |
|---|---|
| `contractVersion` matches what the host was built against | Normal |
| `contractVersion` differs within `5.0.x` | **Expect breaking changes.** `5.0.x` is a pre-implementation corrective series (§5 governance): the change log is the authority, and no compatibility guarantee applies |
| `contractVersion` ≥ `5.1.0` | §5.17's policy applies: patch and minor are safe, major is not |
| `schemaVersion` differs | Treat as a major change regardless of `contractVersion` |

**RULE-INT-14 — unknown enum values: tolerate, never coerce** (RULE-API-9). A host must preserve an unrecognised value verbatim, enter an explicit unknown branch, and degrade conservatively — *behaving as if* unresolved is permitted; **rewriting the value to a known member is not**. For authority-asserting output specifically: a host may omit a value whose semantics it does not understand from a protected-span list, but must record that it did so and why. Silent omission and silent substitution are both failures.

---

## 11.9 Failure and degraded states

Consumer behaviour per status. The Reader is a reading surface, not the Lab: **it need not surface every provenance field**, but it must not erase the distinctions.

The host first discriminates the creation result and never assumes `createEngine` directly returns an Engine:

```ts
const creation = createEngine(config);
if (!creation.ok) {
  hostSurfaceCreationDiagnostics(creation.diagnostics); // non-empty
  // creation.engine is null; do not call processText
} else {
  hostSurfaceCreationDiagnostics(creation.diagnostics); // [] or degraded warnings
  const engine = creation.engine;
}
```

Creation diagnostics are surfaced once for that Engine/configuration. They are not deferred to the first analysis and are not copied into `Analysis.diagnostics`.

| State | Minimum host behaviour |
|---|---|
| `resolved` | Display normally |
| `fallback` | Display normally — it carries a usable value (§9.9). The generated/verbatim distinction should remain *available*, not necessarily *ambient* |
| `ambiguous` | Must not present a candidate as the answer. May display `alternatives[0]` **only** in a treatment that does not read as resolved. **No protected span** |
| `conflict` | Must not choose. Surface that the user's own entries disagree, since only they can fix it. **No protected span** |
| `unresolved` | Show the source; show a marked gap. **Never** substitute a guess |
| `unsupported` | Show the source verbatim; no annotation |
| `out_of_scope` | **Silence** — no annotation, no empty slot. Must not be rendered like `unresolved` (RULE-JP-4) |
| Missing lexicon capability | `EngineCreationSuccess.diagnostics` immediately includes `LEXICON_MISSING_CAPABILITY`; creation still returns a live Engine. The host surfaces it once, because e.g. absent frequency data makes every polyphone `ambiguous` and the user will otherwise misread the whole document (§5.13) |
| Invalid ProviderSnapshot configuration | `EngineCreationFailure` returns `engine:null` and non-empty diagnostics including `PROVIDER_SNAPSHOT_INVALID`. The host surfaces them and performs no `processText`; the invalid snapshot is never silently ignored |
| Term directive dropped for protected-span overlap | The host observes `TERM_DIRECTIVE_DROPPED_OVERLAP` in `TranslationDirectives.diagnostics`, retains the protected span, and does not search `Analysis.diagnostics` for the projection event |
| Stale source metadata (`caution: stale_source`) | A quiet note at most. An old gazetteer row is usually still correct |
| Provider snapshot absent | The normal case. `providerSnapshotId: null` means no pinned snapshot was used, and the Analysis is fully INV-7 conformant |
| Provider snapshot present | This means creation already validated the snapshot successfully. The host is responsible for its provenance and persistence (§10.9.1); the resulting Engine treats it as a pinned ordinary input |

**RULE-INT-15.** The host must never render a value in a way that implies more certainty than its `status` carries. Beyond that, presentation density is the host's — §9's inspector-level detail is a Lab requirement, not a Reader one.

---

## 11.10 Preload and concurrency

A host may reasonably process upcoming chunks while the current one is displayed or spoken.

**RULE-INT-16 — the safe preload contract.**

| # | Rule |
|---|---|
| **P-1** | Each analysis is an **independent explicit call**. There is no session, no cursor, no engine-held document state |
| **P-2** | Continuity is the explicit `DocumentContext` of §11.2.1. A preloaded chunk analysed with a context that later proves wrong must be **discarded**, not patched |
| **P-3** | **Result application is bound to request identity.** Before applying an asynchronous result, the host compares the result's `sourceHash` (and its own request id) against the current source state. On mismatch, **discard** |
| **P-4** | **An older in-flight result must never overwrite a newer source state.** This is the classic async race, and `sourceHash` is the discriminator the contract already provides |
| **P-5** | Display and style projections may run **immediately** from an already-cached `Analysis` — they need no engine call and no network (§11.3) |
| **P-6** | Concurrency is the host's. **DEC-…-032 is SETTLED for v1**: the engine core is synchronous (§5.10), while running it off the main thread or acquiring provider data asynchronously is host orchestration outside the core signature |

**No latency budgets are stated.** §10.12 deliberately left them unresolved, and §11 does not fill the gap by implication: a host may not infer from "preloading is supported" that any particular chunk size analyses within any particular time.

---

## 11.11 Integration test matrix

Reader-interface contract tests. **Reuse the F-family and the API/cache fixtures** (§6.10, §5.19, §10.13) rather than creating a parallel test philosophy — these assert the *boundary*, not the linguistics.

| ID | Test | Reuses |
|---|---|---|
| I-1 | Source / Jyutping / HK Rom / Both all render from **one** `Analysis`; no second `processText` call | INV-10, T-API-005 |
| I-2 | A display toggle causes **no** source refetch and **no** engine invocation | RULE-INT-5/6 |
| I-3 | Hyphenated ↔ Joined is projection-only: `Analysis` byte-identical, zero linguistic work | F4, T-CACHE-013 |
| I-4 | Verbatim names — user, creator-canonical, bearer, official, conventional — are **invariant** across both styles | F5, T-API-004 |
| I-5 | HKR-store entry with an empty translation store: English form resolves via the L3R fallback **preserving** `provenance: user_glossary`, `evidenceClass: E1a`, `assembled: false`, `status: resolved`; Joined mode does not rewrite it | **F3**, T-ENT-048 |
| I-6 | A `lexical`-scoped translation entry appears as a core `termResolution`; when resolved it projects as a `termDirective`, and when conflicted it projects no directive. It is **never** an entity or a protected span | F6, T-ENT-049/050/058 |
| I-7 | A pronunciation-store write changes L2 only — no L3R, L3E or entity change | T-ENT-044, INV-12 |
| I-8 | `documentContext` carried explicitly across chunks: inherited values marked and confidence-capped; omitting it leaves no cross-call state | T-CACHE-007/008, T-ENT-045 |
| I-9 | A stale asynchronous result is **rejected** by `sourceHash` mismatch and does not overwrite newer state | new — RULE-INT-16 P-3/P-4 |
| I-10 | An `ambiguous` or `conflict` English form produces **no** protected span and appears in `unresolvedSemanticSpans` with its status preserved and no reason invented; `unresolved`/`unsupported` preserve their required reasons; the host promotes none of them | F9/F14 |
| I-11 | An unknown enum value is preserved verbatim, triggers the unknown branch, and is **not** coerced to a known member | T-API-023, T-API-008 |
| I-12 | A `contractVersion` mismatch is detected and handled explicitly — within `5.0.x`, as a breaking change | new — RULE-INT-13 |
| I-13 | A store write marks the view stale; the host re-analyses rather than patching the old `Analysis` | new — RULE-INT-11 |
| I-14 | A protection-floor change re-projects only; `analysisCacheKey` unchanged | T-API-018, F11 |
| I-15 | Entity ids from chunk *n* are **not** used to identify entities in chunk *n+1* | new — RULE-INT-4 / RULE-API-13 |
| I-16 | `generatedPersonNameStyle` rejects `"spaced"`, `"hyphen_title"` and `"surname_caps"`; only `"hyphenated"` and `"joined"` are accepted | T-API-030 |
| I-17 | A `lexical`/`phrase` translation entry never reaches `englishForm` by any chain; it appears in core `termResolutions` and only a selected value reaches projected `termDirectives` | F6, T-ENT-050/058 |
| I-18 | Entity translation StoreEntries preserve all five verbatim `FormKind` values; every store entry round-trips `caseSensitive`; E3–E7 imports are rejected in preview and never applied | G19, T-API-031/035 |
| I-19 | Mixed person and non-person hybrid assemblies render from typed units; Hyphenated/Joined changes only licensed generated romanised given units and never a Western literal or translated generic | T-ENT-055/056, T-API-032 |
| I-20 | Two channels inherited from different antecedents remain independently referenced and rejectable; the host never expects an Entity-wide inheritance pointer | G20, T-ENT-046/053/057 |
| I-21 | A selected term directive overlapping one or more protected spans is absent and produces exactly one exact-span projection diagnostic; the host observes it from `TranslationDirectives.diagnostics`, with `Analysis` unchanged | F7, T-API-012/042 |
| I-22 | Host bootstrap handles clean/degraded/fatal `EngineCreationResult` branches; a fatal ProviderSnapshot result exposes diagnostics and never yields an Engine or calls `processText` | T-API-011/043 |
| I-23 | Explicit `documentTags` reach Store contextual matching; omitted/empty/case-only tags do not match, equivalent sets normalise identically, and `DocumentContext.id` never supplies a tag | T-API-044…049, G26 |

---

## 11.12 Explicitly left unresolved

§11 settles **none** of the following, and an agent must not treat its silence as permission:

| Item | Status |
|---|---|
| The Reader's actual code architecture | Not inspected. Not designed here |
| GPT prompt strategy, request format, model choice | Host-owned (RC-1). Deliberately absent |
| TTS vendor, voices, language selection, prosody | Host-owned. Only the data interface is defined (§11.6) |
| Segmenter choice | DEC-…-017, benchmark-blocked |
| Performance and latency budgets | §10.12, unresolved by design |
| Any visual redesign of the Reader | Out of scope. §11 adds no visual requirements |
| Storage or schema migration in the real Reader | Unknown; cannot be planned without inspection |
| The actual integration work required | Determinable only after inspection — see below |
| Global `givenNameJoin` default | DEC-…-012, and **separate** from the Reader's existing toggle (RULE-INT-9) |
| Live external-provider integration | Outside the core by construction (§5.13.1); no host orchestration is specified |

---

## 11.13 Inspection checklist for an agent with real Reader access

Bounded, ordered, and framed as questions to answer rather than changes to make. Each maps to a rule above that may need revising once the answer is known.

| # | Inspect | Because |
|---|---|---|
| 1 | **How the Reader chunks source text**, and whether chunk boundaries fall at sentence terminators | §11.2 — mid-sentence chunking degrades polyphone and entity resolution at the seam |
| 2 | **What offset unit the Reader uses** for its own positions | §11.2 — a code-point/UTF-16 mismatch corrupts every non-BMP character silently |
| 3 | **Whether any linguistic logic already lives in the Reader** — romanisation, name handling, reading lookup | RULE-INT-1 — this is the likeliest source of divergence, and the most important thing to find early |
| 4 | **How the existing unknown-name fallback is currently implemented** | RC-2 — determines how much of §11.4 is a change versus a formalisation of what already happens |
| 5 | **Where the Hyphenated/Joined preference is stored and applied** | RC-3/RC-4 — it must move to the projection call, not to processing |
| 6 | **How the GPT layer currently receives protected-name information** | §11.4 — the directive shape may need an adapter, or may already fit |
| 7 | **Whether the Reader has anything resembling the three stores**, and what its entries mean | §11.7, INV-12 — a single merged glossary would need splitting by `entryScope` and evidence class |
| 8 | **Whether display toggles currently trigger reprocessing or refetching** | §11.3, INV-10 — if they do, that is the highest-value early fix |
| 9 | **How TTS currently decides what to speak** | §11.6, RULE-INT-10 — specifically whether a displayed Latin form ever drives speech |
| 10 | **What the Reader does with uncertainty today** | §11.9 — whether `ambiguous` and `conflict` have any existing representation, or whether everything is currently presented as resolved |
| 11 | **Whether asynchronous results are bound to a source identity** | §11.10 P-3/P-4 — an existing race is worth finding before adding preloading |
| 12 | **What the Reader persists, and where** | §10.9.1 — document-derived caches should not become persistent by accident |

**Then, and only then**, compare this packet against what was found, challenge it where the Reader's reality contradicts it, and decide what should actually be implemented. That comparison is the task this packet exists to make possible; §11 is one input to it, not its conclusion.

**SECTION COMPLETE — §11 Reader Integration Interface Contract**

---

# §12 — Implementation Sequence and Synthesis

**Purpose.** Synthesis and execution planning. Historically, §12 was written against the **pre-§12 frozen baseline** packet v0.16 and completed in packet v1.0 at public contract `5.0.9`; packet v1.1 through v1.6 then applied CHG-044…049. The current cumulative packet is **v1.7**, §5 revision **v0.16**, public contract **`5.0.16`**, after CHG-050 closed the accepted S2-P6 style-rendering contract defect. §5 remains authoritative for schema shape, §7 for decision state, and this section for sequencing.

### 12.0 Current control status and exact handoff (CHG-050)

The accepted S2-P1–P5 artefacts remain preserved and unchanged. They were accepted against the preceding authority and are not silently re-labelled as proof of `5.0.16`. The accepted S2-P6 contract-defect finding has identity **10,251 bytes / SHA-256 `2a6f90cdb02ffc4785f9ed458827e927663ee5cfc9d8059d6895824c90f8bdf1`**. No S2-P6 implementation began; the stopped S2-P6 authority-audit attempt is not resumed by this correction. Formal Stage 2 remains **OPEN**.

**Exact next route — ordered and non-skippable:** (1) fresh affected Stage-0 schema/validator materialisation and regression against `5.0.16`; (2) bounded S2-P1 fingerprint/cache-vector regression because `contractVersion` participates in cache identity; (3) independent impact rebase, retaining unaffected S2-P2–P5 closures only where regression proves compatibility; (4) independent control verification; and (5) only then, if authorised, restart S2-P6 from the beginning.

CHG-050 authorises none of those downstream actions. It does not implement style code, engine creation, projection, cache, segmentation, Reader, translation or TTS; it does not modify accepted artefacts; and it does not alter the canonical encoder or cache-key field membership.

---

## 12.1 What has actually been designed

A **deterministic, offline-capable annotation engine** with no LLM dependency of any kind, plus a pure projection layer, a standalone inspection tool, and an adapter boundary to a Reader this session has never seen.

| Element | What it is |
|---|---|
| **Language Engine** | String in, span-aligned annotation document out. Same input tuple ⇒ byte-identical output (INV-7). No document, page or chunk model; no network on the default path |
| **L2 — pronunciation** | Cantonese readings, structured syllables, Jyutping as canonical serialisation. Word-level disambiguation, character fallback, explicit variation kinds |
| **L3R — HK-style romanisation** | An **engine-defined notation**, available for *any* Cantonese-readable span, not only entities. Lossy and non-invertible by nature. Attested where the convention data has it, assembled where it does not |
| **L3E — entity English form** | What a named thing is **actually called** in English. Never derived from L3R except by the explicit, provenance-preserving fallback of §4.9 |
| **L4 — term-level translation guidance** | `lexical`/`phrase` translation entries resolved in core `Analysis.termResolutions` using `Value<T>`; only selected values project as `TermDirective`s over spans. Equal-authority conflicts retain candidates and project no preferred string. Never an entity, never a name |
| **Three independent stores** | Pronunciation, translation/English-form, HK Romanisation. One entry belongs to exactly one store; writing to one never writes to another (INV-12) |
| **`@hklang/style`** | Pure projections — person-name rendering, annotation projection, translation directives. Depends on core types only, never on the engine |
| **Standalone Language Lab** | A developer/author instrument over the same `Analysis` the API returns. No second resolution path |
| **Reader adapter boundary** | An interface contract (§11), not a claim about the Reader |

**Six statements that constrain everything else:**

1. **The engine performs no GPT/LLM translation** and depends on no model API (RC-1).
2. **The Reader's existing GPT translation workflow stays external.** The projection supplies protected spans, term directives, unresolved semantic spans and its separate invocation-local diagnostics; how a host honours them is its own design.
3. **Lexical/phrase translation entries are L4 only** — removed from Chain B entirely by CHG-042 A; CHG-044 H makes their core selected/conflict truth representable before projection.
4. **Unknown proper name → L3R is an explicit Chain B fallback policy**, governed by `englishFallbackPolicy`, preserving the L3R value's provenance and evidence rather than flattening it to rule output.
5. **Generated personal-name Hyphenated/Joined styling is projection-only** — the style-neutral `Analysis` emits neither rendering, and the toggle can never touch a verbatim form.
6. **The Reader has not been inspected by this packet.** Every statement about it is either author-supplied (RC-1…RC-4) or an interface hypothesis to be tested.

---

## 12.2 The v1 implementation boundary

Derived from the §7 register, not from recollection.

| IN v1 | DEFERRED / v2 | OPTIONAL | BLOCKED PENDING EVIDENCE |
|---|---|---|---|
| Discriminated `createEngine` result; `processText` as the **only** analysis entry point after successful creation | Durable **Entity Records** (DEC-058, §5.10.3) | `debug.retainArtefacts` (DEC-055) | **Segmenter selection** (DEC-017) — Family H + overlap audit |
| **UTF-16** span contract with declared `offsetUnit` | **Convenience views** §5.10.4 (DEC-034, CHG-042 C) | Yale / IPA / tone-mark output (D1) | **θ_read / N_read** (DEC-018) — depends on DEC-042 |
| **Deterministic ids, non-persistent identity** (RULE-API-13) | Full machine translation (N2) | Phonetic-component heuristic, off by default (DEC-022) | **`protectionConfidenceFloor` value** (DEC-024) |
| Explicit **`DocumentContext`**, span-free and Analysis-id-free; separate opaque current-call `documentTags` | **Productive tone sandhi** — lexicalised only in v1 (DEC-020) | External NER — **interface only** (DEC-030) | **M8 ambiguity band** (DEC-040) |
| **Three independent stores**, one store per entry | **Ambient cross-call memory** — permanently excluded, not deferred (DEC-025) | L-STAGE caches (DEC-056) | **Eviction budgets / performance budgets** (DEC-054) |
| **L2 / L3R / L3E / L4 separation** | **Live-provider calls inside `processText`** — structurally impossible (§5.13.1) | Lab fixture-runner view (DEC-049) | **Fit/eval split parameters** (DEC-037) |
| **General L3R display** over any Cantonese-readable span (DEC-009) | Simplified⇄Traditional source conversion (N4) | Jyutping above/below (DEC-048) | **Global `givenNameJoin` default** (DEC-012) — *does not block the Reader's own toggle* |
| Pure **style** and **translation-directive** projections, with projection-local diagnostics | TTS synthesis (N1) | Persistent document-derived caches — opt-in only (DEC-052) | **rime weight semantics** (DEC-042) |
| **Pinned `ProviderSnapshot`** input capability | Mandarin / Pinyin (N3) | | **Lands Dept stable ids** (DEC-043) |
| Standalone **Lab** | Multi-user / sync (D3) | | |
| **Reader adapter contract** (interface only) | | | |

**RULE-SEQ-1.** Appearing in an interface discussion does not promote a feature. `ExternalProvider` is defined and is **not** a v1 core capability; convenience-view signatures are illustrated and **not** exported; `entity_record` and `external` remain in their unions with **no v1 producer**.

---

## 12.3 Blockers, classified by what they actually block

From §7.8. The linguistic evidence blockers retain their prior scope. The current project-level control blocker is CHG-050's ordered `5.0.16` regression/rebase/control route; no S2-P6 or broader implementation work may bypass it.

### 12.3.1 Blocks segmenter selection only

| Item | Needs |
|---|---|
| Corpus/training-overlap audit (§8.7.2) — each candidate's **actual training sources**, not its bundled data | External evidence |
| Family H: admissible segmentation gold **plus the paired reading-gold shortfall** | Annotation work |
| **DEC-038 → DEC-017** | Both of the above |

**Dependency classification, not current authorisation:** once the CHG-050 regression/rebase/control route passes, the `Segmenter` interface, a baseline behind it, downstream lattice consumers and cache/performance work need not wait for DEC-017. Until that control pass, CHG-050 authorises none of them. RULE-JP-5a exists so the evidence blocker costs an interface, not an architecture.

**What does stay provisional:** any performance **budget or published claim** that materially depends on which segmenter is selected. Those are re-derived once DEC-017 closes; the infrastructure that produced them is not rebuilt.

### 12.3.2 Blocks the reading-frequency path only

**DEC-042** — the provenance and semantics of rime-cantonese weights are unestablished in either direction.

**Mitigation, already documented and unchanged:** build a **separately justified corpus-frequency layer** as its own slot in the lexicon stack. Do not invent authority for the rime weights by using them as corpus frequencies. Everything except RULE-JP-7's dominance threshold proceeds; polyphones resolve conservatively (more `ambiguous`) until the layer exists, which is a degraded output, not a broken engine.

### 12.3.3 Data-quality and coverage work — not a reason to stop the core build

Surname convention table · source snapshot retrieval · gold-fixture construction · HKSCS denominator selection.

Each degrades output quality where absent and none prevents the engine from running correctly: an absent surname table means personal-name L3R falls to the generator at `confidence: low`, which is the specified behaviour.

### 12.3.4 Corrected-contract control requirement — **the one that blocks S2-P6**

CHG-050 is a contract correction against the accepted S2-P6 defect finding, not a Stage-2 implementation range. Accepted S2-P1–P5 artefacts remain unchanged and retain their historical identities. Because the current contract is now `5.0.16`, they may be retained as current closure evidence only through an explicit compatibility rebase.

The required order is: affected Stage-0 schema/validator materialisation and regression; bounded S2-P1 fingerprint/cache-vector regression because `contractVersion` is part of the cache identity; independent impact rebase for S2-P2–P5; independent control verification; then, and only then, a fresh S2-P6 restart. Failure at any step stops the route. No step may alter the canonical encoder or cache-key field membership as part of CHG-050.

---

## 12.4 Implementation sequence

Ten stages. Dependencies are real; the parallelism in **§12.5** is what keeps the critical path short.

### Stage 0 — Contract materialisation (executable specification)

| | |
|---|---|
| **Inputs** | §5 contract `5.0.16` / editorial v0.16; CHG-050; T-HKR-045, T-ENT-059, T-API-055…064 and G28…G35; accepted prior Stage-0 and S2-P1–P5 artefacts as immutable historical evidence |
| **Fresh affected materialisation** | Regenerate only affected strict types, schema, cross-field validators and applicable tests. Prove non-empty exact grouping partitions, ordered style references, five-profile mapping, ASCII casing, verbatim/mixed/non-person/unstyled behaviour and ordered duplicate-preserving variants |
| **Cache-identity regression** | After Stage-0 passes, rerun the bounded P1 fingerprint/cache vectors for `contractVersion: "5.0.16"`; prove expected cache-identity change without changing the encoder, preimage formulas or key field list |
| **Rebase and control** | Independently determine which P2–P5 closures are unaffected and regression-compatible; retain only those, then perform independent control verification. No accepted source artefact is edited |
| **Parallel** | None of S2-P6. Evidence preparation may be read-only, but the five ordered gates are not parallelised or skipped |
| **Exit criteria** | Affected Stage-0 pass; bounded P1 regression pass; explicit P2–P5 compatibility disposition; independent control pass; a separate authorisation to restart S2-P6 |
| **Gating tests** | T-HKR-045; T-ENT-059; T-API-004/030/033/055…064; G7/G14–G16/G28…G35; affected prior regressions and P1 cache vectors |
| **Closes** | Nothing in §7. It **verifies** the contract rather than deciding anything |
| **Does not close** | DEC-017, 042, 024, 037, 040, 054, 012 |
| **If skipped** | Every later stage encodes a *reading* of the prose. The packet's own history shows that multiple distinct classes of contradiction survive careful reading; they would surface as divergent implementations of the same section, discovered late |

**Contract-defect rule.** If affected materialisation proves `5.0.16` internally impossible, stop, name the defect and propose a separately authorised bounded correction. Do not silently amend the contract, reclassify prior artefacts, or begin S2-P6.

### Stage 1 — Reproducible data acquisition and manifests

| | |
|---|---|
| **Inputs** | §8's adopted and provisional sources; §0.5's evidence standard |
| **Build** | Retrieve the **actual artefacts** — LSHK `jyutping-table`, rime-cantonese, Lands Dept Geographic Name snapshot, and whichever HKSCS inventory is selected; record for each a **manifest**: source URL, licence text *as found in the artefact*, content hash, snapshot date, retrieval date, attribution string; implement layered separation per RULE-DEP-1 (no merged blob); select and pin the **M7 denominator inventory** (§6.13.1); build the fit/eval split artefact (DEC-037) |
| **Parallel** | Read-only evidence preparation may occur, but new loader/fingerprint implementation remains behind the CHG-050 affected Stage-0 → bounded P1 regression → P2–P5 rebase → independent-control route |
| **Exit criteria** | Every adopted layer has a manifest with a content hash; no layer is loadable without a version or content hash (RULE-API-15); enough gold/conformance material exists to exercise Stage 2 |
| **Gating tests** | Manifest completeness check; layer-fingerprint composition (T-CACHE-005) |
| **Closes** | DEC-043 if the Lands Dept data proves to carry stable ids; the M7 denominator |
| **Does not close** | DEC-042 — weight *semantics* need upstream documentation, not a download |
| **If skipped** | §8's findings are publisher-page descriptions. **Publisher-page inspection is not artefact inspection** — §8.11 says so explicitly, and building against a described format is how a loader meets its first real file at the worst moment |

### Stage 2 — Deterministic primitives

| | |
|---|---|
| **Inputs** | Stage 0 |
| **Build** | Source preservation and Unicode handling (INV-1, INV-9); UTF-16 span utilities and grapheme safety (INV-4, INV-14/15); Jyutping parser/validator including the marginal finals `eu`/`em`/`ep`/`et` (RULE-JP-2) and 7/8/9 normalisation (RULE-JP-1); integration of the verified Range 0B canonical encoder, hashes and reference vectors into version/fingerprint machinery (§5.15.1); store schema, validation, conflict detection, import/export preview (§4.7, RULE-API-12); value-envelope constructors and the **§7.3 confidence derivation** as a pure function; the discriminated engine-creation boundary and semantic configuration validation; `@hklang/style` with RULE-API-6 and projection-local diagnostics; cache substrate where §10 is settled (keys, verify-on-hit RULE-CACHE-16, L-REF) |
| **Parallel** | All of it after Stage 0 passes; independent of Stages 1, 3, 4 |
| **Exit criteria** | INV-1/2/4/9/14/15 hold on the fuzz corpus; `processText` never throws on it (RULE-API-8); confidence derivation is total over its documented domain and refuses `external`; all CHG-050 grouping, five-profile, casing, invariance and variants semantics reproduce across two runtimes |
| **Gating tests** | G1–G9, G16–G18, G25–G35; T-API-004, 006, 011, 012, 021, 022, 030, 033, 042–049, 055–064; T-CACHE-016 |
| **Closes** | Nothing new — it **discharges** DEC-003/004/016/026/028 into code |
| **Does not close** | Anything benchmark-dependent |
| **If skipped** | Every later stage inherits an unverified span model. INV-4 is exercised by ordinary Hong Kong text (𨋢), not by exotica |

### Stage 3 — Lexical/reading baseline and the replaceable `Segmenter` interface

| | |
|---|---|
| **Inputs** | Stages 1, 2 |
| **Build** | Layered lexicon loading with `Lexicon.coverage()` gating (§5.13); character-reading fallback; the **corpus-frequency layer as its own slot** (§12.3.2); reading resolution chain §3.5 with dominance threshold **parameterised, not constant**; the stable `Segmenter` interface (RULE-JP-5a); the lattice contract; inert/consequential ambiguity handling (RULE-JP-6); **one baseline segmenter behind the interface** |
| **Parallel** | Stage 5's convention data and generator |
| **Exit criteria** | Readings resolve end to end with a baseline segmenter; a `Lexicon` reporting `frequencies:false` returns `EngineCreationSuccess` with immediate `LEXICON_MISSING_CAPABILITY` before any `processText`; swapping the baseline for a stub requires no change outside `@hklang/segment` |
| **Gating tests** | T-JP-001…010, 020…026, 040…046; T-API-011 |
| **Closes** | Nothing |
| **Does not close** | **DEC-017.** The baseline is a benchmark participant, **not the selected v1 segmenter** |
| **If skipped** | Downstream stages hard-code a segmentation model and DEC-017 becomes a rewrite instead of a swap |

**RULE-SEQ-2.** Downstream work may consume the baseline's *output* freely. It may not import the baseline's *type*, branch on its identity, or assume its behaviour. `segmenterVersion` is a fingerprint, not a constant.

### Stage 4 — Family H and segmenter adjudication

| | |
|---|---|
| **Inputs** | Stage 3; the corpus-overlap audit; Family H |
| **Build** | Assemble Family H per §8.7.2 — audit each candidate's actual training sources, adopt what survives, annotate only the shortfall (reading gold at minimum), staged pilot first; run every candidate on identical substrate with lexicon, resolver, entity rules, store state and options **held constant** |
| **Report** | Segmentation P/R/F1 (M1) · end-to-end reading accuracy (M2) · **oracle-segmentation reading accuracy (M2o)** · **segmentation-induced reading loss (M2Δ)** · written-Cantonese behaviour on family D7 · HKSCS handling · determinism (double-run identity) · latency and runtime cost, including the Pyodide measurements of §10.10.1 · explainability · licence and dependency risk · **confirmed training-data overlap** |
| **Parallel** | Stages 5–8 continue against the baseline |
| **Exit criteria** | Every candidate measured on the same corpus with verified non-overlap; M2Δ reported per candidate |
| **Gating tests** | §6 Family H protocol; §6.9's contamination detector must not fire |
| **Closes** | **DEC-017** (this stage only) · DEC-044's suitability half · DEC-045 |
| **Does not close** | DEC-042 |
| **If skipped or pre-empted** | DEC-017 is decided on preference, which is exactly what CHG-019 exists to prevent |

**Do not manufacture a winner.** If candidates cluster within noise, that is itself the finding: choose on explainability, bundle size and leakage-verifiability, and say so.

### Stage 5 — HK Romanisation and convention data

| | |
|---|---|
| **Inputs** | Stages 1, 2 |
| **Build** | L3R representation (verbatim/assembled discriminated union); convention and gazetteer lookup, **whole-span first** (RULE-HKR-10); the fitted generator; per-character sibilant-class table with historical prior as **ranking only** (RULE-HKR-3); irregular whole-entity table; ambiguity behaviour; provenance and evidence preservation with `scopeDowngrade` |
| **Parallel** | Stage 3; Stage 6's detection work |
| **Exit criteria** | **Attested-lookup accuracy and generator-holdout accuracy reported separately** (§6.9.A/B); the contamination detector does not fire; sibilant sub-accuracy (M5a) reported as its own number |
| **Gating tests** | T-HKR-001…008, 020…034, 040…045 |
| **Closes** | DEC-013 once the promotion thresholds are tuned on real data |
| **Does not close** | DEC-012 — and nothing needs it to, because the generator emits structured units/grouping while every renderer requires an explicit presentation input |
| **If skipped** | Entity resolution has no L3R to fall back to, and RC-2 cannot be served |

**RULE-SEQ-3.** A generated L3R form is a **notation**, never a social-name fact. It becomes a claim only when Chain B consumes it as an L3E fallback, and must carry `assembled: true`, `rule_engine`, `E7`, `not_attested` across that boundary.

### Stage 6 — Entity, L3E and cross-layer resolution

| | |
|---|---|
| **Inputs** | Stages 3, 5 |
| **Build** | Detection mechanisms D1–D6 with RULE-ENT-5 gating; entity-conditioned readings (one forward pass, RULE-ENT-1); nesting and boundary ambiguity (RULE-ENT-6, INV-16); person-name structure and compound surnames; explicit document memory with span-free `EntityMemoryEntry` and per-channel typed `InheritanceRef`; explicit `documentTags` Store matching; **Chains A, B and C exactly as frozen** — Chain B has no lexical/phrase step; L3E resolution including typed mixed/non-person assembly; unknown-name → L3R fallback preserving provenance (RULE-ENT-10); protection projection with observable projection-local overlap diagnostics; core L4 `termResolutions` and selected-only term-directive projection |
| **Parallel** | Stage 8's Lab shell |
| **Exit criteria** | **C1/F13 zero protected-span false positives — a hard gate**; T-ENT-048's verbatim-fallback case passes; no `lexical`/`phrase` entry reaches `englishForm` by any path |
| **Gating tests** | T-ENT-001…008, 020…025, 040…059; F1…F14; T-API-009, 012, 027, 031–033, 037–039, 044–049, 055–064 |
| **Closes** | DEC-024 once the floor is tuned |
| **Does not close** | DEC-029, DEC-058 — both already settled as deferrals |
| **If skipped** | RC-2 is unimplementable and the Reader gains nothing |

### Stage 7 — Caching and performance

| | |
|---|---|
| **Inputs** | Stages 2, 3, 6 |
| **Build** | The settled §10 architecture — L-REF, L-SEG, L-WIN, L-FULL, L-EXT-P; window keys including `contextIn`, normalised `documentTags` where Store matching occurs, and the relevant-entry fingerprint; the forward-pass reuse frontier (§10.3.2); composition with id assignment at composition time; namespace isolation (RULE-CACHE-6/7) |
| **Parallel** | Stage 8 |
| **Exit criteria** | **Hit and miss byte-identical** across the corpus (T-CACHE-001); eviction changes nothing (T-CACHE-012); projections perform zero linguistic work (T-CACHE-013); the §10.11 cold/warm latency and payload-size measurements are recorded |
| **Gating tests** | T-CACHE-001…018, 024…030 |
| **Closes** | **Nothing until measured.** DEC-054, DEC-056, DEC-035 and all performance budgets may be revisited **only after** §10.11's measurements exist |
| **Does not close** | Any accuracy decision |
| **If skipped** | The engine works and is slow — the least dangerous omission on this list |

**Do not optimise ahead of measurement.** §10.12 leaves budgets unresolved deliberately; Stage 7 produces the numbers that make them settable.

### Stage 8 — Standalone Language Lab

| | |
|---|---|
| **Inputs** | Stages 2, 6; `@hklang/style` |
| **Build** | §9 over the engine — **never in parallel with duplicate linguistic logic** (RULE-LAB-1). Three-level density (ordinary / inspector / debug); raw `Analysis` and debug-payload inspection rendering the engine's own trace (RULE-LAB-2); origin-labelled creation/analysis/projection diagnostics; provenance and ambiguity inspection with candidate-level evidence; L4 selected/conflict inspection; three-store editing with conditional `formKind`, persisted `caseSensitive`, document-tag context, `entryScope` warning and E1a default; E3–E7 import rejection; the explicit **Save as entity override** action distinct from the generic pin; generated-vs-verbatim ambient distinction; the Lab's **broader `StyleProfile`** for presentation; the **narrower `GeneratedPersonNameStyle`** for the directive preview; import/export preview and validation |
| **Parallel** | Stage 7 |
| **Exit criteria** | Every displayed value traces to the returned `Analysis` or a pure projection; cold-palette and non-aggressive visual constraints met; the Lab surfaces at least one real engine mistake from the §6 corpus |
| **Gating tests** | Lab contract tests; T-API-005, 011, 012, 017, 030, 031, 034, 035, 037, 039, 042–049, 058–064; T-CACHE-013 |
| **Closes** | DEC-047, 048, 049, 050 |
| **Does not close** | Anything linguistic |
| **If skipped** | Engine mistakes stay invisible, and the dictionaries have no authoring surface |

**The Lab must be capable of exposing engine mistakes and must not cosmetically hide them.** A Lab that makes the engine look good is a broken instrument.

### Stage 9 — Reader reconciliation and adapter integration

| | |
|---|---|
| **Inputs** | Stages 0–8 complete; the engine contract executable and tested |
| **Build** | **In this order:** (1) inspect the actual Reader; (2) answer §11.13's twelve-item checklist **from evidence**; (3) map its real source/chunk, translation, TTS and settings interfaces onto the adapter contract; (4) identify duplicate linguistic logic already living in the Reader; (5) **selectively replace or adapt** that logic |
| **Parallel** | Nothing — this stage is gated on the engine being trustworthy |
| **Exit criteria** | §11's I-1…I-23 pass against the real Reader; the existing GPT translation path and the existing unknown-name HK-romanisation behaviour still work |
| **Closes** | Nothing in §7 — it closes *integration* questions the packet deliberately never opened |
| **Does not close** | Any linguistic decision |
| **If reordered before Stage 0–8** | Integration is built against a contract that is prose, and the Reader's existing behaviour becomes the de-facto specification |

**Do not redesign the Reader wholesale, and make no Reader implementation assumption before inspection.**

---

## 12.5 Parallel workstreams

```
Stage 0  ████████████████                      contract materialisation
Stage 1    ██████████████████                  data acquisition + manifests
Stage 2        ████████████████████            deterministic primitives
Stage 3                  ████████████          lexicon + Segmenter interface
Stage 5                  ████████████████      L3R + convention data
Stage 4                        ██████████████  Family H + adjudication   ← external evidence
Stage 6                            ██████████  entity / L3E / directives
Stage 7                                  █████ caching + measurement
Stage 8                              █████████ Lab
Stage 9                                    ███ Reader (after all of the above)
```

**Current control overlay (CHG-050).** The diagram is a long-range dependency view, not present authorisation. Before any further Stage-2 work: perform affected Stage-0 materialisation/regression against `5.0.16`; run the bounded P1 fingerprint/cache-vector regression; independently rebase P2–P5 compatibility; and obtain independent control. Only then may S2-P6 restart from the beginning. Historical and accepted artefacts are not modified, the encoder/key membership remains fixed, and this correction begins none of those activities.

**RULE-SEQ-4.** Parallel work must not hard-code a segmenter. Concretely: no module outside `@hklang/segment` imports a concrete segmenter type; `segmenterVersion` is read as an opaque fingerprint; no test asserts a specific segmentation *unless* it is a Family H gold fixture; and the baseline is never named as "the" segmenter in code, docs or config defaults.

---

## 12.6 Release and version transition

**`5.0.16` is the current design contract.** CHG-046 established tagged identity preimages, CHG-047 closed the `userDataVersion` domain, CHG-048 bounded hash-reachable grouping indices, CHG-049 closed composite Version fingerprints, and CHG-050 closes executable grouping/style/casing/variant semantics. The canonical encoder, exact `ProviderSnapshot` shape and `analysisCacheKey` field list are unchanged. Accepted S2-P1–P5 artefacts remain immutable historical/accepted evidence pending the explicit compatibility rebase; formal Stage 2 remains OPEN and S2-P6 is not authorised. §5 governance is unchanged: `5.0.x` is a pre-implementation corrective series in which the change log is authoritative and §5.17 compatibility policy is not yet in force.

`5.0.16` advances only if another **genuine corrective defect** is found by a later authorised verification or implementation range. Such a correction is proposed and applied explicitly; it is never smuggled into implementation.

**`5.1.0` is declared at first implementation release**, and activates §5.17's compatibility guarantees. Minimum evidence required before calling it:

| # | Required |
|---|---|
| 1 | A **machine-checkable contract** exists and the implementation validates against it |
| 2 | **Conformance tests pass** — the `testRole: conformance` set of §6, not the benchmarks |
| 3 | **No known public-schema contradiction** remains open |
| 4 | **Deterministic and reference-vector tests pass** — INV-7 double-run identity, canonical hashing vectors, `ProviderSnapshot` identity, `DocumentContext` closure |
| 5 | **Dependency artefacts pinned and manifested** — content hashes, licences as found in the artefacts, snapshot dates |

**Explicitly not required for `5.1.0`:** measured accuracy targets, a selected segmenter, performance budgets, a complete surname table, or a finished Family H. Those gate *quality claims*, not the existence of a first implementation. Requiring them would keep the contract in a corrective series indefinitely, which serves nobody — the compatibility boundary is about the **shape** being stable, not about the linguistics being finished.

---

## 12.7 Reader-integration readiness gate

| Question | Answer |
|---|---|
| **What must be true of the engine first?** | Contract executable (Stage 0); conformance tests green; Stages 2, 5, 6 complete; C1/F13 protection gate passing; the Lab able to show what the engine decided and why |
| **What must be inspected in the Reader?** | §11.13's twelve items, from evidence. Highest value early: **chunking boundaries**, **offset unit**, and **whether linguistic logic already lives there** |
| **What may be adapted?** | The source/chunk call shape; how directives are handed to the GPT layer; where the Hyphenated/Joined preference is stored (it must move to the projection call); how display toggles are wired (they must not reprocess) |
| **What must not be duplicated?** | Segmentation · reading resolution · romanisation · entity decisions · conflict-breaking · confidence assignment. If the host needs an answer the engine does not give, that is a change request against the engine, not a local approximation (RULE-INT-1) |
| **What stays owned by the Reader?** | Document fetching and parsing · the **GPT translation workflow** · TTS and voices · UI state · Reader settings persistence · all network and provider orchestration outside the core |

---

## 12.8 Original-deliverable mapping

The brief's seventeen headings, discharged across §§1–12. None is duplicated into a new section.

| # | Original deliverable | Where satisfied |
|---|---|---|
| 1 | Executive Summary | **§12.1**; §1.1 |
| 2 | Product / Scope Specification | §1.3 (in/out of scope, non-goals, consumers); §1.9 assumptions; **§12.2** boundary table |
| 3 | Linguistic Behaviour Specification | §1.2 layer model; §2 (L3R); §3 (L2); §4.2–4.5 (entities) |
| 4 | HK Romanisation Rules and Precedence | **§2** entire — mechanisms §2.1, generator §2.2, evidence hierarchy §2.3, names §2.4, places §2.5, chains §2.6, fitting §2.7, provenance §2.8 |
| 5 | Jyutping Processing Specification | **§3** entire — phonology §3.1, alignment §3.2, tokens §3.3, segmentation §3.4, resolution §3.5, written Cantonese and HKSCS §3.6 |
| 6 | Entity Model | **§4.1–§4.6**; taxonomy §4.2; detection §4.3; boundaries §4.4; person names §4.5; memory §4.6 |
| 7 | Dictionary / Glossary Specification | **§4.7** (schema, scope, operations, import/export); §5.9 (`StoreApi`, RULE-API-12); §5.10.3 (why there is no fourth store) |
| 8 | Engine Architecture | **§5.1–§5.3** modules and conventions; §5.13 replaceable interfaces; §4.1 pipeline order |
| 9 | Public API / Data Contract | **§5.4–§5.12, §5.17** — contract `5.0.16`; §5.5 value envelope; §5.6/§5.7 exact grouping; §5.10 API; §5.11 executable style/casing; §5.15 unchanged identity preimages and CHG-049 composite Version fingerprints |
| 10 | Standalone Language Lab UI | **§9** entire |
| 11 | State / Error Model | **§5.5.1** status truth table; §5.14 diagnostics and the no-throw contract; §2.9, §3.8, §4.12 layer failure behaviour; §7.3 confidence derivation |
| 12 | Caching / Performance Design | **§10** entire; §5.15 cache identity and canonical hashing |
| 13 | Test Corpus and Test Plan | **§6** entire — families, gold-status model, metrics, gates; test seeds distributed through §2.11, §3.10, §4.13, §5.19, §10.13, §11.11 |
| 14 | Reader Integration Interface Contract | **§11** entire; §0.6 author-supplied constraints RC-1…RC-4 |
| 15 | Decision Register | **§7.1** master register (58 entries); §7.2 dependency graph |
| 16 | Risks and Known Linguistic Limitations | **§7.4** consolidated limitations by layer; §2.10 non-capabilities; per-section limitation subsections |
| 17 | Recommended Implementation Sequence | **§12.4** stages with gates; §12.5 parallelism; §12.6 release transition |

Additional material the brief did not request but the work produced: the **status-label convention** (§0.1), the **evidence standard** (§0.5), the **author-supplied Reader constraints** (§0.6), and the **change log** (§0.3) — which is the audit trail for every corrective pass, including CHG-050.

---

## 12.9 Handoff

### Next authorised action — regression and control, not implementation

CHG-050 ends with the corrected prose authority only. Next: (1) fresh affected Stage-0 schema/validator materialisation and regression; (2) bounded P1 fingerprint/cache-vector regression for `contractVersion: "5.0.16"`; (3) independent P2–P5 compatibility rebase; (4) independent control verification. Only a subsequent control authorisation may restart S2-P6 from the beginning. The accepted P1–P5 artefacts themselves remain unchanged.

### Must remain unresolved

| Decision | Waiting on |
|---|---|
| DEC-017 segmenter | Family H + overlap audit |
| DEC-042 rime weight semantics | Upstream documentation |
| DEC-018 θ_read / N_read | DEC-042, then measurement |
| DEC-024 protection floor · DEC-040 ambiguity band · DEC-054 budgets | Measurement |
| DEC-012 global `givenNameJoin` | Corpus evidence or an explicit product decision — **and it blocks nothing**, because structured forms have no implicit profile and the Reader's toggle is a separate explicit user preference |

### Never infer — nine repeatedly violated semantic boundaries from the pre-CHG-044 history

| Boundary | The error it prevents |
|---|---|
| **L3R ≠ L3E** | Treating a mechanical spelling as a name — *Nei Tun To* for 彌敦道 |
| **L3E ≠ L4** | Letting a term-rendering preference become a proper-noun assertion, and then a protected span |
| **User precedence ≠ external attestation** | Reporting E1a as though the world agreed |
| **Fallback route ≠ fallback status** | Flattening a verbatim user form into rule output because of how it arrived |
| **One store entry ≠ several stores** | Breaching INV-12 with a field that has no schema |
| **Verbatim form ≠ assembled form** | Letting a style toggle rewrite a creator-canonical name |
| **Style projection ≠ analysis** | Re-running the pipeline for a display change; caching against a style setting |
| **Cached network result ≠ deterministic provider evidence** | Claiming reproducibility that memoisation cannot give |
| **Deterministic id ≠ durable identity** | Carrying an Analysis id across a call and matching the wrong thing |

Each of these was violated at least once *inside this packet* before CHG-044, by an author who had written the rule forbidding it. They are not abstract cautions; they are observed failure modes. CHG-044 additionally closes structural type-graph, exact-reference, canonical-integer and alignment defects enumerated in the change log; those are not falsely collapsed into this nine-item semantic list.

### First action for the next authorised control chain

**Rematerialise and regress the affected Stage-0 schema/validators against `5.0.16`.** If that passes, perform only the bounded P1 cache-identity regression, then the independent P2–P5 impact rebase and independent control. Do not alter the encoder or key field list, and do not begin S2-P6 or any broader implementation.

Then read §7 for decision state, §5 for shape, and §11.13 before going anywhere near the Reader.

**SECTION COMPLETE — §12 Implementation Sequence + Synthesis**

CHG-050 PASS — STYLE-RENDERING EXECUTABLE SEMANTICS CLOSED — FORMAL STAGE 2 OPEN — S2-P6 NOT AUTHORISED PENDING REGRESSION, REBASE AND INDEPENDENT CONTROL
