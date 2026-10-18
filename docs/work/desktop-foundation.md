# Desktop foundation — implementation record

Status: early working build; product release gates remain open.

## Implemented

- React/TypeScript application with shadcn/Radix controls, Motion page transitions, atmospheric background motion, and the approved offset cleanup dialog.
- Isolated hero/banner artwork and generated macOS icon resources.
- Labeled sample scan, detailed findings, filtering/search, inspection, selection, simulated confirmation/results, and persistent local history/exclusions.
- System/Light/Dark preferences, reduced-effects mode, keyboard shortcuts, and accessible dialog primitives.
- Tauri desktop host with native window controls and folder selection.
- Read-only, bounded folder scanner with cancellation, duplicate-root normalization, protected-location exclusions, symlink/hardlink skipping, and stale-candidate validation.
- Read-only inventory of top-level apps in standard Applications folders.
- Explicit Trash flow for eligible selected personal files, with backend selection validation and a durable per-item journal. Cache findings are review-only.
- Startup guidance opens the relevant macOS Settings page.

## Validation

Commands: `npm run build`, `npm test`, `npm run test:native`, and `npm run desktop:build`.

Three browser tests cover selection/confirmation, sample result labeling/history persistence, search/exclusions, theme/reduced-effects settings, constrained layout, and cancellation. Six native tests cover protected scope, symlink escapes, file replacement after scanning, cancellation, selected-item mutation/journaling with an isolated filesystem adapter, and rejection of unknown or review-only IDs. The mutation fixture does not test Finder/NSFileManager against the user's Trash.

Chrome and WebKit previews were inspected. Implemented [home](../screenshots/cleanup-home.png) and [review](../screenshots/cleanup-review.png) screenshots use sample data. The built native application rendered on the development Mac and exposed its controls to the accessibility tree. The first native launch showed a blank window before rendering; startup fallback content and animation-independent page mounting were added. Native cold-start performance is not yet benchmarked.

## Current limitations and release gates

- This is a local early build, not a notarized production release. The build is ad hoc signed; Developer ID signing/notarization, signed updates, and a clean-Mac installation test remain pending.
- No cache adapter performs real removal. No force quit, system repair, cloud cleanup, RAM clearing, batch app removal, or live checkout.
- No completed paid entitlement/purchase integration, saved presets, or reminder scheduler.
- Actual filesystem scanning is limited to approved roots, 100,000 entries, 64 levels, and 1,000 findings per scan. Partial scans are labeled. System locations, selected credential paths, app packages, and standard cloud storage locations are excluded.
- Findings use logical byte sizes; APFS clones/compression may change physical savings. Cache recognition is location-based discovery, not a cleanup-safety classification.
- Trash restoration is manual in Finder. NSFileManager may not expose Finder's Put Back metadata; Undust does not offer automatic restore in this build.
- Journals live locally in the application's data directory. Restart reconciliation, per-item error presentation, and history recovery from an interrupted operation need further work. Do not retry an interrupted operation without checking Trash and rescanning.
- Validation rechecks file identity and scope before mutation, but path-based Trash operations are not an atomic defense against a malicious local process racing filesystem changes. Resolve this before production cleanup release.
- Busy-file verification for actual cache cleanup, cloud-placeholder behavior outside excluded cloud roots, VoiceOver walkthrough, measured contrast, minimum-OS validation, resource budgets, and large-list virtualization remain release work.
- Ambient motion is opt-out through Reduce visual effects and system reduced-motion preferences. It pauses when hidden. Measure its resource cost before release; prior idle CPU targets are not measured achievements.

## Next development slice

Complete real scan progress and interrupted-operation recovery, then validate a single cache adapter with its supported versions and busy-state checks. Keep cache actions review-only until the relevant safety tests and native integration checks pass. Finish application terms and payment-provider decisions before implementing live Pro purchases.
