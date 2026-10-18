# Undust — UI, UX, and content specification

October 18, 2026 · Approved direction: atmospheric navy glass + charcoal review dialog

## Visual intent

Use the [approved concept](../design/undust-interface.png) as the visual target. Spacious composition, a translucent navy sidebar, an original sculptural glass cleanup motif, quiet silver icons, and a charcoal modal with an icy glass banner. The earlier white utility screen and dense dark dashboard are superseded and are not implementation targets.

Build with React, shadcn/ui and Motion, while preserving native macOS window controls and platform behavior. This is not a website inside browser chrome: omit account avatars, irrelevant command bars, and repeated dashboard cards. Do not reuse competitor artwork, icons, or branding. The generated screenshot is a composition reference, not an asset to screenshot into the application.

## Layout

- Preferred window: 1280 × 820 logical pixels; minimum 960 × 640. Support larger windows without excessively stretching text.
- Native titlebar traffic lights and drag region; exclude interactive controls from dragging.
- Sidebar: 216–240 px, subtle right divider, wordmark near top, 44–48 px navigation rows with 14 px corner radius. Bottom anchors: History, Settings, quiet Pro link.
- Primary navigation: Overview, Cleanup, Developer, Applications, Large files, Startup. Hide unshipped features rather than presenting dead destinations.
- Main cleanup introduction: sculptural artwork left, short heading and action right. The illustration may shrink or disappear at smaller widths; content remains usable.
- Review summary dialog: approximately 520 px wide, maximum 85% window height, 26 px radius, scrollable body, fixed visible footer. Banner height 150–180 px; omit banner if vertical space is limited.
- Detailed review replaces the introduction with a two-column file list and optional inspector. Avoid deeply nested modal stacks.
- All example sizes in the visual are fictional: 4.8 + 6.2 + 1.4 = 12.4 GB. Real UI obtains all numbers from scan data.

## Design tokens — starting values, validate contrast in implementation

The canonical palette is [tokens.css](../assets/tokens/tokens.css): navy canvas/sidebar, charcoal dialog, warm-white primary action, and a blue selection/focus accent. Apply selection translucency over a solid accessible fallback. Semantic warning, error, and success each require an icon and text, not color alone. Define and validate their tokens when those states are implemented.

Use gradients only for atmospheric backdrop/artwork, never under dense text. Blur is bounded to the modal backdrop or sidebar and must have a solid reduced-transparency alternative. Do not animate large full-window filters continuously.

Typography: system UI/SF-like stack for a Mac-first appearance; Geist may be bundled only with its required license notices. Body 14–15 px, labels 12–13 px, section headings 18–20 px, screen title 32–36 px, modal title 24 px. Use tabular numerals for sizes. Body line height 1.45–1.55. Avoid all-caps paragraphs and excessively light weights.

Spacing: 4 px base; common values 8, 12, 16, 24, 32, 48. Modal body padding 28 px; row height 64–72 px including secondary copy. Primary button height 44 px and pill radius. List controls remain rectangular enough to scan efficiently.

## Component plan

- App shell: themed shadcn Sidebar primitives; native titlebar supplied by desktop host.
- Review summary: Dialog with accessible title/description, Checkbox rows, Separator, ScrollArea, Button.
- File review: Table or virtualized list, Checkbox, Tooltip, DropdownMenu, ContextMenu and optional Sheet inspector.
- Final removal confirmation: AlertDialog; focus initially on Cancel. Do not make a destructive action the default Enter target on opening.
- Scan state: Progress when measurable, otherwise labeled stage + Spinner; Cancel remains enabled.
- Settings: Tabs, Switch, Select and native folder-selection bridge.
- Upgrade: Dialog with comparison content, “Buy Pro — $10” and “Continue with Free.”
- Feedback: inline status plus a nonessential toast. Errors and removal results must remain accessible after toasts disappear.

Choose one shadcn primitive family consistently. Preserve focus management and ARIA semantics when wrapping with Motion; do not replace accessible components with styled divs. [shadcn Dialog](https://ui.shadcn.com/docs/components/radix/dialog) and [Sidebar](https://ui.shadcn.com/docs/components/base/sidebar) document the available component patterns; these are separate variants and require a deliberate consistent selection at implementation time.

## Motion specification

- Dialog entrance: opacity 0→1 and scale 0.98→1 over 220 ms, ease-out. Exit 140 ms. Backdrop opacity changes over 160 ms; avoid animating blur radius on low-powered machines.
- Navigation selection: 160–180 ms background transition. Content crossfade 150 ms, at most 6 px vertical movement.
- Revealed result rows: optional 25 ms stagger, capped at the first six visible rows; never delay access to controls.
- Review inspector: spring translation with limited overshoot; target settling within 240 ms. Keyboard focus follows accessibility semantics, not animation completion.
- Buttons: 100 ms color transition; at most scale 0.99 on pointer press. Focus is immediate.
- Scan: progress tied to real stages/bytes; no simulated percentage. Decorative glass artwork remains static when idle.
- Success: subtle checkmark fade, no confetti or repeated pulse.

Use Motion's `useReducedMotion` and a global preference to remove scale, translation, parallax, and stagger when requested. A short opacity change is optional; all information and controls must remain available without animation. Pause nonessential effects when hidden. [Motion reduced-motion documentation](https://motion.dev/docs/react-use-reduced-motion).

## Screen copy and state behavior

### Onboarding

Title: **A little less clutter.**

Body: “Find what you no longer need. Review every cleanup before anything changes.”

Primary: “Choose folders” · Secondary: “Continue with limited access”

Privacy: “Scans run on your Mac. Your file names and contents stay here.”

Permission explanation: “Undust needs access to this folder to inspect its storage. You can continue without it.” Actions: “Choose folder” / “Not now”. Never claim Full Disk Access is mandatory for the whole app.

### Cleanup introduction

Title: **A little less clutter.**

Body: “Find what you no longer need.”

Primary: “Scan your Mac”

Secondary metadata: “Last scanned {relative time}” or “Choose folders to begin.”

### Scanning

Title: “Finding room for what matters.”

Status: “Checking {category}…” · Metadata: “{count} items checked” · Action: “Cancel scan”

Partial: “Some locations couldn’t be checked.” Action: “View skipped locations”

No findings: “Nothing to review here.” Body: “No supported cleanup items were found in the selected folders.” Avoid “Your Mac is perfectly clean.”

### Review summary — matches the approved image

Title: **Your cleanup, reviewed.**

Body: “Choose what goes. Keep what matters.”

Eyebrow: “Ready to review” · Metric: “{size} of potential space”

Categories: “App caches”, “Developer caches”, “Old installers”.

Cache description: “Temporary files can be recreated.” Developer clarification in the inspector: “Your next build may take longer and require downloads.” Installer description: “Review these downloads before removing them.”

Footer: “Nothing is removed until you confirm.” Actions: “Cancel” / “Review files”. Review files may open all results with zero selection; it never starts deletion. Checkboxes in this summary select groups for detailed review, not permission to delete them.

### Detailed review

Title: “Review files” · Filters: “All items”, “Rebuildable”, “Needs review”, “Ignored”.

Inspector sections: “Why this appears”, “What happens next”, “Location”. Actions: “Reveal in Finder”, “Ignore this item”.

Selection bar: “{count} items selected · {estimatedSize}” · Action: “Continue”. Zero selection disables Continue with explanatory text.

Busy item: “{appName} is using these files. Quit it and scan again.” Unknown state: “Undust couldn’t verify that these files are unused. They’ll be skipped.”

### Confirmation

Trash: “Move {count} items to Trash?” Body: “You can restore them while they remain in Trash. Storage is freed only after Trash is emptied.” Actions: “Cancel” / “Move to Trash”.

Permanent cache operation: “Clear {cacheName} permanently?” Body: “These cache files can’t be restored by Undust. They may be downloaded or rebuilt next time.” Actions: “Cancel” / “Clear cache”. Do not offer a misleading universal Undo.

### Completion and recovery

Trash success: “Moved to Trash.” Body: “{count} items · {size}. These files still use storage until Trash is emptied.” Actions: “View history” / “Open Trash”.

Cache success: “Cache cleared.” Body: “{count} items removed.” Only show a measured free-space change when available, with a note that other system activity can affect it.

Partial: “Some items were skipped.” Body: “{completed} completed · {skipped} skipped · {failed} failed.” Action: “Review details”.

Restore conflict: “An item already exists at this location.” Actions: “Choose another location” / “Cancel”.

### Upgrade

Title: “A little more, for $10.”

Body: “Unlock developer cleanup, batch app removal, saved presets, and scan reminders. One payment. No subscription.”

Terms line: “Pro v1 · Up to two personal Macs · v1.x updates included.” Display final applicable tax and policy before purchase.

Actions: “Buy Pro — $10”, “Restore purchase”, “Continue with Free”. No countdown, forced modal, or repeated scan-time interruption.

### Startup

Title: “Choose what starts with your Mac.”

Body: “Review login and background items in macOS Settings.” Action: “Open Login Items”. Note: “Changes here may affect apps you use.”

## Accessibility and keyboard behavior

Tab through visible controls in logical order; Space toggles selection; Escape closes non-destructive review dialogs; Cmd+, opens Settings; Cmd+F focuses list search. Destructive actions require deliberate confirmation. Trap focus only while a modal is open and restore it to the invoking control afterward. Announce stage changes and final results without streaming every scanned filename to VoiceOver.

Validate 4.5:1 contrast for normal text and 3:1 for large text and meaningful controls. Never place secondary text over variable artwork without an opaque surface. Support increased contrast, reduced motion, reduced transparency, long localized strings, 200% text scaling where feasible, and full keyboard operation. The supplied image is not an accessibility audit.

## Handoff constraints

The approved raster is a visual reference. Rebuild text, controls, sidebar, and dialog as real components. Extract/recreate artwork as separate licensed assets; do not ship a single flattened UI image. Generate a production app-icon asset catalog and inspect at 16, 32, 64, 128, 256, 512, and 1024 px. The current concept PNG is not a completed ICNS/Icon Composer package.
