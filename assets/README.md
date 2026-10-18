# Undust assets

## Brand masters

- [App icon](brand/undust-icon.png): 1254 × 1254 PNG with alpha; blue glass tile, sweeping brush, and sparkles. Concept master requiring edge and small-size review before packaging.
- [Wordmark](brand/undust-wordmark.png): 1661 × 947 RGB PNG, white rounded lettering on opaque black with halftone texture. Presentation concept; not a transparent or vector logo.

## Interface reference

[Approved interface](../design/undust-interface.png): 1586 × 992 RGB PNG with fictional sample data. Keep it as the implementation reference, not a runtime image containing interactive controls.

## Shared tokens

[tokens.css](tokens/tokens.css) holds Undust's approved starting palette, spacing, radii, and core timings. It has no dependencies and is not yet wired to an application. Map its custom properties into the chosen shadcn theme when implementing. The current palette covers the approved dark appearance; light mode remains to be designed and validated.

## Integrity and provenance

[manifest.json](manifest.json) records paths relative to the repository root, dimensions, PNG color type, byte size, SHA-256 digest, role, and readiness of the image masters. Regenerate metadata when an image changes. Preserve source masters and create explicitly named versions rather than silently replacing approved references.

These are generated Undust concepts created in this project from user-provided stylistic references. Competitor reference screenshots are not included. Repository terms are in [LICENSE](../LICENSE); third-party rights and licenses remain separate.

## Remaining production work

Create a clean editable wordmark, isolated hero artwork, isolated modal banner, and a validated macOS icon export set. The current PNGs do not establish trademark clearance, production masking, or accessibility compliance. Interface components and icons should be drawn by the implementation rather than cropped from screenshots.
