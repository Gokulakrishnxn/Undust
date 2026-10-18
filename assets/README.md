# Undust assets

## Brand masters

- [App icon](brand/undust-icon.png): 1254 × 1254 PNG with alpha; blue glass tile, sweeping brush, and sparkles. Concept master requiring edge and small-size review before packaging.
- [Wordmark](brand/undust-wordmark.png): 1661 × 947 RGB PNG, white rounded lettering on opaque black with halftone texture. Presentation concept; not a transparent or vector logo.

## Interface reference

[Approved interface](../design/undust-interface.png): 1586 × 992 RGB PNG with fictional sample data. Keep it as the implementation reference, not a runtime image containing interactive controls.

## Shared tokens

[tokens.css](tokens/tokens.css) holds Undust's approved starting palette, spacing, radii, and core timings. It has no dependencies and is imported by the application stylesheet. Application component styles are in `src/styles.css`. The application implements dark, light, and system appearance; formal contrast validation remains pending.

## Integrity and provenance

[manifest.json](manifest.json) records paths relative to the repository root, dimensions, PNG color type, byte size, SHA-256 digest, role, and readiness of the image masters. Regenerate metadata when an image changes. Preserve source masters and create explicitly named versions rather than silently replacing approved references.

These are generated Undust concepts created in this project from user-provided stylistic references. Competitor reference screenshots are not included. Repository terms are in [LICENSE](../LICENSE); third-party rights and licenses remain separate.

## Remaining production work

The initial isolated hero/banner are in `public/art/` and generated macOS icon resources are in `src-tauri/icons/`. Create a clean editable wordmark and validate all artwork and icon sizes for release. The current PNGs do not establish trademark clearance, production masking, or accessibility compliance. Interface components and icons should be drawn by the implementation rather than cropped from screenshots.
