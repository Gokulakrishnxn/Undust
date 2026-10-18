# Undust

**A little less clutter.** A considered Mac cleanup app with useful free tools and a proposed **$10 one-time Pro upgrade**.

![Approved Undust interface direction](design/undust-interface.png)

## Project status

Product definition and design concept, October 18, 2026. This repository does not yet contain a runnable app, cleanup engine, payment integration, or installer. Images contain fictional sample data. The blue glass interface direction was approved by the project owner; generated assets are concept masters requiring production refinement.

## Start here

- [Product requirements](prd.md): audience, scope, pricing, safety, technical direction, and launch gates.
- [Feature specification](feature.md): Free/Pro boundaries, behavior, edge cases, and acceptance criteria.
- [UI/UX and content](docs/ui-ux.md): screens, shadcn components, visual tokens, motion, accessibility, and exact interface copy.
- [Research and evidence](docs/research.md): public CleanMyMac analysis, sources, REA setup status, and unresolved questions.
- [Design assets](design/README.md): approved visual direction, wordmark, and icon concept.

## Proposed implementation

React + TypeScript, shadcn/ui, Tailwind CSS, and Motion for the interface; Tauri 2 with a small Rust/macOS service layer for desktop access. This is a proposed architecture, not implemented or benchmarked. Native macOS window controls, menus, file selection, permissions, and Trash behavior should complement the custom interface.

## Product principles

- Explain every cleanup suggestion.
- Review before removal; personal files start unselected.
- Keep scanning and file metadata on the device.
- Distinguish potential cleanup size from actual storage recovered.
- No fear-based health score, forced RAM clearing, or guaranteed speed claims.
- Use original branding and implementation; no competitor code or assets are included.

## Commercial status

Free and Pro packaging is proposed in the PRD. No checkout is live. End-user terms and third-party notices must be finalized before distribution.

## License

Undust is **proprietary — all rights reserved**, subject to applicable law and the exceptions in [LICENSE](LICENSE). This repository does not grant open-source reuse permission. Third-party material retains its own license, and GitHub's platform permissions remain applicable. The Free/Pro application terms will be provided separately; purchasing the application does not itself grant source-code redistribution rights.
