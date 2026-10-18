# Undust — Feature specification

Version 0.1 · October 18, 2026 · Proposed behavior; no features implemented yet

## F01 · Onboarding and access · Free · MVP

Explain local scanning, selectable scope, and review-before-removal. Offer “Choose folders” and “Continue with limited access.” Remember granted roots; denied access never loops into another prompt. Separate onboarding from the upgrade pitch.

Acceptance: first launch works offline; cancelling folder selection leaves a valid empty scope; revoked access is detected on the next scan; no root is added without a user action.

## F02 · Overview and scan · Free · MVP

Show volume capacity, available space, last scan, partial coverage, and potential cleanup size. Use stage-based progress until a meaningful denominator exists. Actions: Scan your Mac, Cancel scan, Review files. A fresh scan replaces stale candidates only after safe completion.

Acceptance: overlapping scans are prevented; cancellation preserves the last completed results; unreadable locations are counted and explained; figures have units and never imply exact physical savings from logical sizes.

## F03 · Cleanup review · Free · MVP

Grouped and detailed views with name, size, owner app, location, reason, consequence, and action. Search and sort locally. Reveal in Finder, exclude item, and preview supported personal files. No initial selection. The category dialog is a summary; the main review view exposes actual files before confirmation.

Acceptance: selection persists while sorting; select-all explicitly applies to filtered visible results; selection count and bytes update together; excluded items cannot be acted on; expired or changed candidates are marked stale and require a new scan.

## F04 · Supported app caches · Free · MVP

Recognize only documented and tested cache locations. Start with a small versioned allowlist; avoid wholesale deletion of Application Support. Check owner activity and skip running applications conservatively. Browser cache support, if shipped, excludes cookies, passwords, history, sessions, and profile databases.

Acceptance: unknown files remain unselected and unsupported; running-app and uncertain ownership states are skipped; next-use rebuild cost appears in the inspector; fixture testing proves protected neighboring files remain unchanged.

## F05 · Developer cleanup · Scan free; actions Pro · MVP

Initial adapter candidates: npm download cache, uv cache, Gradle caches, and generated node_modules/.next in explicitly added projects. Add Homebrew downloads and Xcode DerivedData only after adapter-specific validation. Do not bundle toolchain removal, simulators, archives, virtual machines, local models, or databases into “cache cleanup.”

For each adapter specify supported versions, approved roots, discovery rules, busy detection, removal method, recovery support, and excluded files. Package-manager operations must use fixed argument lists; never interpolate paths into shell text. Display estimated download/rebuild consequences without inventing time estimates.

Project cleanup requires a recognizable manifest and dependency lockfile; otherwise show unsupported/manual review. Preserve source, .git, configuration, lockfiles and user exclusions. Never run lifecycle scripts or install dependencies while scanning.

Acceptance: a running build or uncertain busy state blocks cleanup; changing a manifest invalidates the corresponding candidate; unsupported versions fail closed; Pro gating happens before confirmation, not after partial removal; the free app can reveal findings in Finder.

## F06 · Large files and installers · Free · MVP

Find local files within granted folders, filter by size and modified date, preview, and reveal in Finder. Offer per-item or explicit multi-selection Trash actions. Age and size are discovery filters, not proof a file is unwanted. Preserve cloud placeholders without downloading them.

Acceptance: no personal file is selected automatically; package boundaries and excluded folders are honored; inaccessible files are skipped with reason; an installer remains review-required even if an associated app appears installed.

## F07 · Applications · Inventory free; batch removal Pro · MVP

Inventory apps, show bundle size and location, and reveal in Finder. Pro offers reviewed removal of a selected app and confidently associated files. Ask the user to quit running apps; do not force quit. Keep ambiguous, shared, credential, and document data excluded. For non-removable or privileged components, explain and provide vendor uninstall guidance.

Acceptance: system apps cannot be removed; duplicate bundle IDs do not merge ownership blindly; user sees each associated item; refusing to quit cancels removal; failures produce per-item results; removal never implies all traces are gone.

## F08 · Startup guidance · Free · MVP

Explain startup load and open the relevant macOS Settings page. Do not display a guessed list as a complete inventory or infer performance impact from registration alone. Automated service toggling and launch-agent deletion are out of MVP.

Acceptance: a failed Settings deep link falls back to written navigation; UI does not report an item disabled unless a later observation verifies that change.

## F09 · Execution, history, and recovery · Free · MVP

Confirmation states item count, total estimated bytes, and action type. Separate “Move to Trash” from irreversible “Clear cache permanently.” Record every item as pending, completed, skipped, failed, or cancelled. History is local and deletable by the user. Offer restore only for tracked Trash destinations still present; on conflict, choose another destination or cancel, never overwrite silently.

Acceptance: crash during a batch leaves a recoverable journal; cancel stops new operations; partial failures do not show all-success copy; empty Trash is never automatic; measured free-space deltas are labeled as observations affected by other system activity.

## F10 · Settings and exclusions · Free · MVP

Theme: System/Light/Dark. Follow system motion preference with an additional reduce-effects control. Scope management, ignore list, local history retention, diagnostics consent, update preference, and license status. Reduce transparency uses solid high-contrast surfaces.

Acceptance: exclusions apply during scanning and are rechecked during execution; settings survive restart; exporting diagnostics previews content; disabling telemetry stops further telemetry and never affects cleanup access.

## F11 · Presets and reminders · Pro · MVP after core cleanup

Save category/scope preferences, not unchecked deletion permissions. A saved preset starts a reviewable scan. Reminders are opt-in with a chosen cadence; no background deletion. Avoid persistent background agents in the first release; explain that reminders may require the app to be running until a separately tested scheduling mechanism exists.

Acceptance: preset candidates are freshly validated; every action still needs confirmation; turning reminders off cancels future reminders; notifications never manufacture an urgent health warning.

## F12 · Upgrade and entitlement · Pro · MVP

One-time US$10 upgrade proposal. Show included features, device allowance, update terms, and taxes before checkout. Keep Free available. States: Free, checking, Pro, invalid license, activation limit, offline, and purchase pending. Network failure after purchase offers retry/restore without charging twice.

Acceptance: signed entitlement verified locally; no payment details stored by Undust; temporary server failure preserves previously valid offline access; refund/revocation behavior and device-transfer policy are documented before launch.

## Later exploration

Duplicate-file review (content hashes, never names alone), cloud cleanup (provider-specific deletion semantics), optional performance snapshots, and a menu-bar utility. Each requires separate requirements and tests. Malware protection, RAM purging, system repair, and guaranteed speed increases are not planned.

## Shared data contract

- Scan: identifier, time, approved scope, rule version, completion state, skipped-location reasons.
- Candidate: stable ID, file identity, approved-root ID, display path, type, logical/allocated estimates where available, owner, reason, risk, modification fingerprint, supported action, busy state.
- Selection: scan ID and candidate IDs, separate action groups, total estimate.
- Operation: journal ID, consent time, per-item before/after state, Trash destination if applicable, error code, outcome.
- Entitlement: signed feature grants and device policy; never a frontend-only boolean.

## Global acceptance scenarios

Test denied permissions; symlink escape; hard links; APFS clones; file replacement between scan and action; app starting after review; disk full during journaling; external-volume disconnect; cloud placeholder; Unicode and long filenames; mixed success/failure; cancelled scan; cancelled cleanup; crash/relaunch; expired scan; offline license; VoiceOver; keyboard-only operation; reduced motion; and reduced transparency. File mutations must be checked against an independent fixture manifest, not only mocked success responses.
