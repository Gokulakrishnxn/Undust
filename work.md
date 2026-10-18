# Undust — Design and development workflow

Updated: October 18, 2026. Use for each task in [plan.md](plan.md).

## Where decisions belong

- Product outcomes and pricing: [prd.md](prd.md).
- Feature behavior and acceptance: [feature.md](feature.md).
- Approved visual direction and assets: [design.md](design.md).
- Exact copy, layout, accessibility, and motion: [docs/ui-ux.md](docs/ui-ux.md).
- Delivery order and milestone status: [plan.md](plan.md).
- Day-to-day task workflow: this file.

Update the authoritative document when a decision changes; link it elsewhere rather than maintaining duplicate specifications. The current plan begins with design and a mock prototype. Production filesystem work follows only after the read-only spike and safety gates.

## 1. Select a small, reviewable task

Choose a task ID from the earliest unblocked milestone. Inspect the repository and existing changes before editing. Identify the user-visible outcome, relevant feature IDs, dependencies, and evidence needed to call the task complete.

Create one task note in a GitHub issue or a local `docs/work/<task-id>.md` file, using whichever tracker the owner has selected. Until a tracker workflow is configured, use local task notes and avoid creating speculative GitHub issues. The paths in this document describe future outputs; they are not claims those files exist yet.

Task note fields:

- ID and title.
- Outcome and scope.
- Related feature IDs and specification links.
- Inputs and dependencies.
- Acceptance criteria.
- Status: planned, in progress, blocked, or verified.
- Validation evidence, known limitations, and next step.

**Done when:** another collaborator can tell exactly what behavior will change and how it will be checked.

## 2. Design the interaction before polishing it

For a user-facing task, describe the entry point, user action, resulting state, and recovery path. Include relevant loading, empty, denied-permission, error, cancelled, partial-success, and completed states. Mark states that do not apply with a reason rather than inventing them.

Start with layout and real interface copy. Use synthetic fixture data with realistic long paths, large values, and mixed item types. Keep discovery, selection, confirmation, and execution separate. State what happens to keyboard focus when a screen or dialog changes.

**Done when:** the state map covers the feature's acceptance criteria, and neither empty results nor a failure leaves the user stuck.

## 3. Build and inspect the visual

Apply the existing tokens and approved composition. Reuse components; use native macOS behavior at the desktop boundary. Add only the artwork needed for this screen, with its intended role and source recorded in the asset manifest.

Preview the primary state at 1280 × 820 and the constrained layout at 960 × 640. Inspect actual rendered text, control alignment, content overflow, selection, focus, and contrast. Compare with the approved reference without treating every pixel of generated artwork as an interface requirement.

Show a concrete preview when proposing a significant new visual direction or resolving ambiguity. Routine implementation of the accepted design continues without repeated approval requests.

**Done when:** the screen is readable, coherent with the approved direction, and handles its state variations. Save preview evidence only when it helps assess a design decision; keep personal files out of screenshots.

## 4. Implement one complete interaction

Use a feature branch and focused commits for implementation work. Start with the smallest user journey that can be exercised end to end. Keep filesystem services separate from React components; cross the host boundary with validated typed messages.

During the prototype milestone, supply deterministic mock data through an explicit provider and label it as sample data. Keep mocks isolated so a production build cannot accidentally advertise simulated scan or cleanup results. Replace the provider with a real service only after its milestone gate passes.

For filesystem mutations, write meaningful behavior and safety tests before enabling the action. Cover path escapes, candidate replacement, partial failures, and journal recovery as appropriate. Simple copy or spacing changes need inspection rather than artificial tests that mirror markup.

**Done when:** the task's actual interaction works through the intended layers, and unrelated behavior remains unchanged.

## 5. Add motion and accessibility together

Implement the timings in the UI specification after the static flow works. Keep focus and control availability independent of animation completion. Provide reduced-motion and opaque-surface alternatives; avoid persistent animation at idle.

Check keyboard-only use, VoiceOver labels, focus trapping/return, errors, and live status announcements. Avoid announcing every scanned filename. Long lists must remain usable without rendering every item at once.

**Done when:** the same task can be completed with reduced effects and a keyboard, and transitions do not hide errors or delay essential actions.

## 6. Validate against risk

Run the repository's documented checks once they exist; record exact commands and results. Do not invent test scripts or say a check passed without running it.

Use the smallest sufficient validation set:

- Copy/token changes: rendered inspection, link/asset integrity where relevant, and contrast checks when colors change.
- Component/state changes: type checking, focused interaction tests, and a rendered walkthrough.
- Scan changes: deterministic filesystem fixtures, permission/cancellation cases, and relevant performance measurements.
- Cleanup changes: real operations inside disposable fixtures, independent before/after inventories, journal and restore checks, plus focused security review.
- Licensing changes: sandbox purchase/restore/refund scenarios and offline verification with test credentials.
- Release changes: signing/notarization and clean-Mac install/update checks on supported OS versions.

Treat unavailable validation as an explicit gap. For filesystem testing, never substitute the user's real caches or project folders for fixtures. Record the hardware/OS/build for performance evidence and distinguish measurements from PRD targets.

**Done when:** the selected acceptance criteria are demonstrated, and any remaining gap is visible rather than hidden behind “tests pass.”

## 7. Review and integrate

Inspect the diff for scope, dead controls, unsafe defaults, untracked assets, secrets, and stale documents. Keep task commits readable and bounded. For implementation work, open a PR with the problem, resulting behavior, related task/feature IDs, validation, and relevant screenshots. Repo setup and documentation-only changes may use the owner's existing direct-commit authorization.

Apply relevant installed skills when their task fits: Matt Pocock's TDD for behavior-driven development, diagnosing-bugs for a reproducible failure, and review skills for code review. Configure the Matt Pocock engineering workflow before using skills that depend on its issue-tracker/domain setup. REA is for a selected shipped artifact or runtime investigation; it is not required for ordinary source implementation.

**Done when:** review findings are resolved or explicitly accepted, integration follows repository policy, and the final commit is traceable to its task.

## 8. Record completion and the next step

Mark the task verified only after the relevant checks pass. Add the commit/PR and concise evidence to its task note; update the checkbox in `plan.md`. If blocked, state the exact missing decision, dependency, or failure, and continue only independent authorized work.

Report what changed, what was checked, material limitations, and the next unblocked task. A merged component does not automatically complete its milestone. Evaluate the milestone's exit gate separately.

**Done when:** the next collaborator can continue without reconstructing the chat history.

## Example first implementation slice

Task: U03, cleanup review with synthetic scan data. Related behavior: F02, F03, F09.

Start on the cleanup introduction, simulate scan stages, show the approved summary dialog, open detailed results, select files, confirm a simulated action, and show mixed outcomes. Include zero-selection, cancellation, stale-result, and error scenarios. Keep all filesystem operations disabled in this prototype.

Evidence: screenshots of summary and detailed review at both window sizes; keyboard walkthrough with focus returning correctly; an interaction check showing “Review files” performs no deletion; a result scenario that distinguishes skipped and failed items. Complete the note with actual checks once implemented, not anticipated results.
