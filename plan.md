# Undust — Design and development plan

Updated: October 18, 2026. Status: planned; application implementation has not started.

## Outcome

Build a Mac cleanup application that matches the approved blue-glass design, makes every cleanup understandable, and supports the Free / US$10 one-time Pro model. Start with an interactive design prototype, prove filesystem behavior in isolated fixtures, then connect the interface to real services.

This file defines delivery order and milestone gates. [work.md](work.md) defines the workflow for each task. Product scope stays in [prd.md](prd.md), feature behavior in [feature.md](feature.md), and appearance in [design.md](design.md). A visual preview does not count as a working cleanup feature.

## Current baseline

- [x] Product requirements and Free/Pro feature boundaries documented.
- [x] Navy-glass interface direction approved by the owner.
- [x] Logo and icon concepts, asset manifest, and starting tokens committed.
- [x] UI copy, interaction rules, and accessibility targets documented.
- [x] Proprietary repository rights notice added.
- [ ] Production artwork and platform icon exports complete.
- [ ] Runnable interface prototype complete.
- [ ] Desktop shell and filesystem engine implemented.
- [ ] Payments, signing, update delivery, and release validation complete.

## Milestone 1 — Finish the design package

**Purpose:** make the approved visual direction implementable across the full journey.

Tasks:

- [ ] D01: Map onboarding → scan → review → confirmation → results/history, including cancellation and partial failure.
- [ ] D02: Design Overview, Cleanup, detailed review, and permission states at preferred and minimum window sizes.
- [ ] D03: Design Developer, Applications, Large files, Startup, History, Settings, and Upgrade states. Show unfinished destinations only in a labeled prototype.
- [ ] D04: Produce isolated glass hero and dialog-banner artwork; refine the wordmark; prepare and inspect macOS icon exports.
- [ ] D05: Define light appearance and opaque/reduced-effects variants. Dark mode is the approved starting point; System/Light/Dark remains the release requirement.
- [ ] D06: Validate text/control contrast, focus states, long strings, and motion alternatives. Update the asset manifest after asset changes.

Deliverable: screen/state map, complete visual references, and reusable assets linked from `design.md` and the asset guide. Use synthetic names and sizes in demonstrations.

**Exit gate:** every core action has an entry, progress, success, failure, and cancellation state where applicable; assets are separate from interface controls; the approved composition is retained. Resolve significant visual changes with a concrete preview rather than reopening the already approved direction.

## Milestone 2 — Build the interactive interface prototype

**Depends on:** D01–D02 and existing tokens; artwork refinement may continue alongside this milestone.

Tasks:

- [ ] U01: Scaffold React + TypeScript, a consistent shadcn primitive family, Tailwind, and Motion; pin dependency versions and document actual run/check commands.
- [ ] U02: Build the shell, sidebar, reusable buttons, dialogs, selection controls, and typography from shared tokens.
- [ ] U03: Implement the full cleanup journey with an explicit mock-data provider and deterministic scenario selection.
- [ ] U04: Add each supporting screen from D03 and its loading/empty/error states.
- [ ] U05: Add short motion transitions after keyboard/focus behavior works; honor reduced motion and reduced transparency.
- [ ] U06: Validate resizing, keyboard navigation, modal focus return, scrolling, and readable text on the target Mac.

Deliverable: a locally runnable prototype with labeled sample data and a short walkthrough. No filesystem changes or real checkout actions.

**Exit gate:** a user can complete the simulated journey without dead controls; “Review files” only opens review; destructive actions are clearly simulated; the layout matches the approved direction at 1280 × 820 and remains usable at 960 × 640.

## Milestone 3 — Prove the desktop and scanning architecture

**Depends on:** U01–U03. Isolated technical spikes can begin earlier without enabling cleanup.

Tasks:

- [ ] E01: Integrate Tauri 2 and native macOS window controls, menus, folder selection, and Settings navigation.
- [ ] E02: Define typed contracts for scan, candidate, selection, operation, and entitlement using the shared contract in `feature.md`.
- [ ] E03: Implement read-only enumeration of user-approved roots, exclusions, cancellation, and partial-permission reporting.
- [ ] E04: Add conservative candidate classification with versioned, explicit rules; unsupported files remain unsupported.
- [ ] E05: Measure scan responsiveness and app resource usage against PRD targets using a fixed fixture and stated hardware/OS.
- [ ] E06: Prove permission persistence, revoked access, cloud-placeholder skipping, file identity, and Trash API behavior in disposable fixtures. Record the architecture decision and any limits.

Deliverable: a desktop app that scans selected locations and presents real findings without modifying them.

**Exit gate:** permission denial remains usable, scans cancel, root boundaries hold, and the UI differentiates partial results from a complete scan. Confirm the proposed host stack and minimum macOS version from evidence before proceeding.

## Milestone 4 — Deliver safe Free cleanup

**Depends on:** Milestone 3 passing its gate.

Tasks:

- [ ] C01: Implement backend candidate revalidation immediately before every operation, including changed identities and escaped paths.
- [ ] C02: Build the operation journal and per-item outcomes before enabling mutations.
- [ ] C03: Implement reviewed Trash actions for supported files; provide restoration only where a valid tracked Trash destination still exists.
- [ ] C04: Add the first tested application-cache adapters; use a separate explicit confirmation for irreversible cache clearing.
- [ ] C05: Connect real results, history, exclusions, and diagnostics export. Show bytes moved to Trash separately from observed free-space changes.
- [ ] C06: Verify mixed success, permission loss, cancellation, crash/relaunch, locked files, restore conflicts, and malicious path substitution against independent fixture manifests.

Deliverable: Free beta with scanning, review, supported cleanup, large-file tools, app inventory, startup guidance, and local history/settings (F01–F04, F06, free F07, F08–F10).

**Exit gate:** no protected or unselected fixture files change; every attempted item has an accurate outcome; permanent clearing is not described as recoverable; no removal occurs without confirmation. Do not validate destructive behavior against the developer's personal files.

## Milestone 5 — Implement Pro features and purchase flow

**Depends on:** safe Free cleanup. Upgrade UI can be mocked earlier; real purchase requires resolved commercial terms.

Tasks:

- [ ] P01: Implement developer adapters one at a time with explicit supported versions, busy checks, exclusions, and rebuild consequences.
- [ ] P02: Implement batch app removal with reviewed associations; preserve shared or ambiguous data.
- [ ] P03: Add saved scan presets and opt-in reminders; retain confirmation before every cleanup.
- [ ] P04: Finalize device allowance, payment provider, refund/support policy, and end-user terms with the owner.
- [ ] P05: Implement signed entitlement verification, activation/restore, offline continuity, and device transfer using a payment sandbox first.
- [ ] P06: Verify Free remains useful, paid gating happens before action, and purchase failures do not double-charge or remove valid offline access.

Deliverable: Pro beta covering F05, paid F07, F11, and F12.

**Exit gate:** each paid feature meets its acceptance criteria; entitlement checks are not frontend-only; commercial copy matches the actual checkout and license policy. The repository rights notice is not a substitute for application terms.

## Milestone 6 — Validate and release

**Depends on:** Milestones 1–5, including production assets and all promised MVP features.

Tasks:

- [ ] R01: Complete keyboard, VoiceOver, contrast, light/dark, reduced-effects, localization-length, and window-size reviews.
- [ ] R02: Perform security review of IPC permissions, filesystem validation, dependencies, journal integrity, diagnostics redaction, and update/entitlement verification.
- [ ] R03: Measure release-build startup, scan latency, cancellation, idle CPU, and memory on supported macOS versions; record failures as unresolved gates.
- [ ] R04: Obtain release credentials, sign and notarize the app, and validate installer/uninstaller and signed updates on a clean test Mac.
- [ ] R05: Run the PRD usability study target and fix confusion around selection, Trash, permanent clearing, and recovery.
- [ ] R06: Prepare privacy notice, application terms, third-party notices, help content, recovery guidance, and support contact.
- [ ] R07: Assemble a versioned release candidate, test upgrade/recovery paths, document rollback and known limitations, then publish within the owner's release authorization.

Deliverable: a tested release package with verifiable provenance and support documentation.

**Exit gate:** all launch requirements in the PRD are satisfied with recorded evidence. No unresolved data-loss, payment-integrity, or signing failures. Prototype screenshots and passing mock tests are insufficient evidence for release.

## Dependencies and sequencing

Core sequence: M1 design → M2 prototype → M3 read-only desktop → M4 Free cleanup → M5 Pro → M6 release.

Asset refinement can overlap interface construction. Adapter research can overlap read-only work, but mutation waits for the validator and journal. Purchase research can overlap development, but live checkout waits for commercial decisions. Work may overlap by readiness; this is not an instruction to create extra agents or chats.

## Scope and estimates

Follow the deferred/excluded scope in `prd.md`. Adding cloud cleanup, antivirus, duplicate detection, or automated service changes requires a separate scope decision.

Estimate effort after the M3 spike, when filesystem/permission constraints are known. Track assumptions and actual task durations; do not promise a ship date from the design alone. If a milestone fails, keep its gate open and resolve the cause before advancing dependent work.

## Immediate next action

Start D01–D02: create a screen/state map and preview the detailed review screen alongside the approved summary dialog. Then scaffold U01 and build the clickable cleanup journey. The current request creates this plan; it does not itself start implementation or authorize publishing a release.
