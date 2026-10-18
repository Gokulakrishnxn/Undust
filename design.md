# Undust — Design direction

Status: approved visual direction; implementation handoff. October 18, 2026.

## Start with the approved image

![Undust cleanup review](design/undust-interface.png)

Use this composition when building the application: atmospheric navy background, translucent sidebar, sculptural blue glass cleanup artwork, charcoal review dialog, and soft white pill buttons. The visual identity should feel calm, tactile, and unmistakably at home on a Mac.

The white utility-screen and dense dashboard explorations were superseded. The current image shows a modal-open state, not a permanent dialog on the home screen. Its numbers are sample data, not results from a live scan.

## Read the appropriate specification

- For scope, pricing, and release requirements: [prd.md](prd.md).
- For behavior, states, and acceptance criteria: [feature.md](feature.md).
- For layout measurements, components, motion timings, accessibility, and exact UI copy: [UI/UX specification](docs/ui-ux.md).
- For asset paths, provenance, dimensions, and checksums: [asset guide](assets/README.md) and [manifest](assets/manifest.json).
- For visual tokens: [tokens.css](assets/tokens/tokens.css). Change token values there; keep screenshots as references rather than measurement authorities.

## Visual hierarchy

1. Navigation stays quiet: monochrome icons, readable labels, and one blue selected row.
2. The introduction pairs a sculptural glass object with a short heading and a single scan action.
3. The review dialog takes focus using a charcoal surface and dimmed backdrop. Artwork occupies its banner; text and controls sit on solid surfaces.
4. A clear size total introduces the findings. File rows explain their purpose and keep sizes aligned.
5. One primary action advances the current step; the secondary action leaves safely.

Use the atmospheric background and glass motif in entry/summary screens. Use simpler opaque surfaces in dense file lists so repeated review stays legible. Decorative artwork must not compete with filenames, warnings, or selection state.

## Brand treatment

Product name: **Undust**. Wordmark presentation: **undust**. Tagline: **A little less clutter.**

The app icon uses a blue glass tile, luminous sweeping brush, and small sparkles. The wordmark concept uses rounded white lettering on black. The screenshot's simpler readable wordmark is the navigation reference until the custom lettering receives a legibility/vector pass.

Use the existing PNGs for concept previews. The wordmark has an opaque black background and must not be treated as a transparent overlay. The icon has an alpha channel, but its 1254 px master is a concept, not an Apple-ready app-icon export. Before packaging, inspect the outer edge and tiny-size clarity, remove unintended artifacts through an approved asset-editing workflow, and produce platform-sized assets.

## Component and platform boundary

Use shadcn/ui for Sidebar, Dialog, Checkbox, Button, AlertDialog, ScrollArea, and review-list primitives. Use Motion for short state transitions. Follow the detailed [component plan](docs/ui-ux.md#component-plan) and [motion specification](docs/ui-ux.md#motion-specification).

Preserve native macOS traffic lights, window dragging, menu behavior, file pickers, and system permission dialogs through the desktop host. Custom React controls should preserve keyboard and assistive-technology semantics. They are not AppKit controls.

## Interaction sequence

Introduction → scan progress → review summary → detailed file selection → explicit confirmation → per-item results/history.

“Review files” opens inspection and never deletes anything. Confirmation distinguishes moving files to Trash from permanent cache clearing. Background content is inert while a modal is open; focus returns to its trigger when closed. The zero-selection state still lets the user inspect all findings, while execution stays disabled.

## Asset integration sequence

1. Load shared tokens and establish readable solid surfaces before decorative effects.
2. Rebuild navigation, dialog, text, and controls as components; never use the full screenshot as the application UI.
3. Add the existing brand concepts only where their backgrounds and resolution are appropriate.
4. Create separate production hero and banner artwork before implementing those parts of the visual. These isolated images are not yet supplied; the UI reference is not a substitute.
5. Add motion after the static interactions and focus behavior work. Honor reduced motion and reduced transparency.
6. Review against the approved screenshot at the preferred window size, then check minimum window size, long strings, keyboard navigation, and VoiceOver.

## Definition of design-ready

- The approved navy/glass composition is recognizable without flattening the interface into an image.
- All displayed text comes from the content specification; real file counts and sizes come from state.
- Every visible destination has a working screen or is omitted for that release.
- Focus, selections, warnings, progress, partial failures, and disabled states are visually distinct.
- Reduced effects preserve the same information and functionality on opaque surfaces.
- Text and control contrast is measured on actual rendered surfaces, including hover and focus states.
- Production wordmark, background art, and app-icon exports have been reviewed separately from the concept masters.

The repository currently provides the visual target, source concepts, and specifications. It does not yet provide a working interface or completed production asset pack.
