# Undust — Product requirements

Version 0.1 · October 18, 2026 · Status: planning, approved visual direction

## 1. Product promise

Undust helps Mac users understand storage clutter and remove selected files with clear explanations. It combines an atmospheric blue glass visual identity with a practical review workflow. Its promise is **“A little less clutter.”** Cleanup can recover storage; responsiveness benefits depend on the actual bottleneck and must not be guaranteed.

## 2. Audience and problem

Primary: everyday Mac owners who cannot tell which large files are disposable. Secondary: developers whose package caches and build output consume storage. Both need confidence about consequences, not a single alarming “health” score.

Jobs to be done:

1. Find what is taking space without manually exploring Library folders.
2. Understand whether an item is replaceable, personal, shared, or currently in use.
3. Review exact files before moving them to Trash or explicitly clearing a cache.
4. Understand why a Mac feels busy through limited factual observations and links to system tools.
5. Return to a clear history of what changed and what can still be restored.

## 3. Positioning and evidence

CleanMyMac provides a broad reference for scan, review, cleanup, app management, and storage exploration. Undust deliberately starts narrower: local storage review, understandable developer cleanup, and a small one-time price. These are original product choices, not claims about recovered competitor internals. See [research](docs/research.md) for evidence and limitations.

## 4. Pricing proposal

**Free:** unlimited scans, basic supported application-cache cleanup, large-file discovery and manual Trash actions, app inventory, startup guidance, exclusions, and local cleanup history. No artificial scan-size quota and no subscription.

**Pro: US$10 one-time:** developer cleanup actions, batch app removal with reviewed associated files, saved cleanup presets, and opt-in scan reminders. All scan results remain visible free; users can reveal files in Finder. Basic safety, explanations, cancellation, and history are never paid features.

Pro proposal: one person, two personally owned Macs, transferable activation. Includes v1.x updates; no promise of perpetual future major versions or lifetime support. Price excludes applicable taxes where required. Payment provider, refund policy, licensing terms, and regional pricing remain prelaunch decisions. Core free use needs no account. A signed local entitlement supports offline Pro use after activation; no deletion of access merely because the license server is temporarily unavailable.

At $10, avoid ongoing cloud computation, malware intelligence, or expensive hosted storage. Track refunds and support cost before adding recurring obligations. This is a commercial hypothesis, not validated unit economics.

## 5. Release scope

MVP includes onboarding, scoped local scans, review lists, supported cache cleanup, large-file discovery, developer adapters, app inventory, reviewed batch app removal, local history, exclusions, settings, and licensing. Startup opens relevant macOS settings; it does not silently disable services. Scheduled features only remind or scan with opt-in permission, never delete unattended.

Deferred: duplicate detection, cloud-provider cleanup, automatic updates for third-party apps, detailed performance monitoring, menu-bar agent, Intel builds, and additional toolchain adapters. Excluded: antivirus, registry-style repair, system-file deletion, automatic RAM purging, blanket Library cleanup, backup/snapshot thinning, and automatic modification of app bundles.

## 6. Core journey

1. Open Undust; see its purpose and privacy statement.
2. Select folders or approve limited supported locations. Explain additional access only when a selected feature requires it.
3. Start a cancellable scan; show examined scope, current stage, and exclusions.
4. See potential cleanup bytes by category and whether results are partial.
5. Open the review dialog, then the detailed file list. Nothing is selected initially.
6. Inspect reason, location, size, consequence, and owner app; select items.
7. Confirm an explicit action and count. Revalidate candidates immediately before acting.
8. See successful, skipped, failed, and cancelled items separately. Restore eligible Trash items or reveal them in Finder.

## 7. Functional requirements

- Scans are read-only, bounded by approved roots, cancellable, and resumable only when the stored scan is still valid.
- Every suggestion includes a reason, risk class, and supported action.
- Unknown folders and ambiguous app data are never classified as disposable by size alone.
- Rebuildable means replaceable with a cost: explain re-downloads, slower next builds, or sign-in consequences where applicable.
- Moving files to Trash does not immediately free storage. Display “Moved to Trash” bytes separately from measured disk-space changes.
- Do not promise universal restore. Cache-tool deletion is irreversible through Undust; Trash restoration works only while items exist and permissions allow it.
- App removal excludes shared containers, credentials, personal documents, databases, and ambiguous associations by default.
- Cloud placeholders are skipped without hydration; cloud deletion behavior is outside MVP.
- Process activity checks are conservative hints. Unknown or busy state means skip and explain.

## 8. Safety and privacy architecture

The UI submits scan IDs and selected candidate IDs, never arbitrary shell commands or unbounded deletion paths. A backend validator resolves identity, rechecks file type, canonical location, owner, modification state, and approved-root membership before each action. Do not follow symlinks outside scope. Account for hard links and APFS shared extents without claiming an exact recoverable total.

Use OS Trash operations where supported. For cache managers that require direct removal, show a separate permanent-clear confirmation and never combine it invisibly with recoverable Trash actions. Maintain a durable operation journal before mutation and record each outcome so cancellation or crash cannot be reported as total success.

Use an explicit cache-adapter allowlist with versioned rules. No privileged helper or administrator access in MVP. Full Disk Access, if needed for a future supported scope, is opt-in and explained; permission denial produces a useful limited scan.

File names, paths, scan results, and cleanup history remain local. Diagnostics are opt-in, scrub paths by default, and previewable before export. Only licensing and update checks need network access. No third-party scripts in the privileged webview. Keep the Tauri command surface small and validate all inputs; capability configuration alone is not a path-validation substitute.

## 9. Technical direction

Proposed target: Apple silicon, macOS 14 or later; test the oldest supported version and current shipping macOS before release. React/TypeScript + shadcn/ui + Tailwind + Motion provide the custom interface. Tauri 2/Rust handles orchestration; narrowly scoped native bridges handle macOS-specific behavior where necessary. Validate permission and Trash behavior in a technical spike before committing to distribution details.

Use native titlebar controls and menus, keyboard shortcuts, file pickers, and system dialogs. shadcn components are web UI primitives, not native AppKit controls. The intended result is a Mac-like experience without claiming all controls are native.

Initial distribution proposal: Developer ID-signed, notarized download with signed updates. App Store distribution is a separate feasibility decision because sandbox restrictions affect cleanup scope. Never require disabling Gatekeeper or System Integrity Protection.

Modules: ScanCoordinator, CandidateClassifier, CacheAdapters, SafetyValidator, CleanupExecutor, OperationJournal, Entitlements, and UI. No filesystem side effects inside presentation components.

## 10. Quality targets and validation

Targets, not measured achievements:

- Window interactive within 2 seconds on an M3/8 GB test Mac.
- Idle foreground CPU below 1% averaged over 60 seconds; no decorative animation loop at idle.
- Combined app-process idle memory below 200 MB, validated on the supported minimum OS.
- First scan results within 3 seconds on a fixed 100,000-entry local fixture; cancellation acknowledged within 1 second, with in-flight operations allowed to finish safely.
- No main-thread stalls from filesystem enumeration; virtualize long lists.
- Full keyboard operation, VoiceOver labels, visible focus, contrast validation, reduced-motion and reduced-transparency support.

Release gates: no protected-path modifications in safety fixtures; link escape and changed-file tests pass; denied permissions and locked files produce partial outcomes; crash recovery preserves journal accuracy; never show “space recovered” for a Trash-only operation; user testing confirms review/confirmation comprehension. Signing, updates, activation, and offline use must pass on a clean Mac.

## 11. Delivery sequence

1. Visual prototype with mock data: approved screen, detailed review, success, errors, onboarding, and upgrade states.
2. Read-only scanning spike: permissions, candidate modeling, filesystem edge cases, performance budgets.
3. Free cleanup beta: reviewed Trash flow, allowlisted caches, history and exclusions.
4. Pro beta: developer adapters, app removal, licensing and restore-purchase flows.
5. Launch hardening: accessibility audit, clean-Mac installation, security review, support documentation and pricing validation.

Do not imply a timeline until engineering capacity and the scanning spike are known.

## 12. Success measures and open decisions

Measure locally or with separate opt-in analytics: scan completion, review-to-action conversion, partial-failure rate, restore requests, time to first useful result, Pro conversion, refunds, and support cases. A design target is at least 4 of 5 usability participants completing a reviewed cleanup without assistance; it is not a market-validation result.

Open decisions: final license policy, payment provider, source-code license, trademark availability, supported adapter versions, update mechanism, support/refund commitments, and minimum OS feasibility. Resolve before launch, not by silently expanding scope.
