# Research and evidence ledger

October 18, 2026. Public-document analysis plus user-provided visual references. Product decisions are proposals unless explicitly identified as observations.

## Questions and coverage

1. **What flows should inform Undust? Answered at public-document level.** CleanMyMac documents scan, category review, item selection, context actions, and result logs. Its feature overview includes cleanup, app management, performance tools, storage exploration, and cloud features; availability varies by edition. This supports studying an inspect/review/action sequence, not claiming a recovered implementation. Sources: [cleanup workflow](https://macpaw.com/support/cleanmymac/knowledgebase/system-junk), [edition differences](https://macpaw.com/support/cleanmymac/knowledgebase/missing-features).
2. **What should Undust implement? Product decision.** Local cleanup and developer understanding first, narrow supported rules, free core functionality, $10 Pro. No attempt at competitor feature parity.
3. **What visual direction was selected? Answered by owner feedback.** Atmospheric blue glass application, dark sidebar, charcoal dialog, rounded white primary action; shadcn and Motion requested. The owner explicitly approved this direction. Original generated concepts are included; competitor screenshots are not committed.
4. **Were CleanMyMac internals reverse engineered? Unresolved.** No binary was supplied; bounded checks in `/Applications` and the user's Applications location found no named CleanMyMac artifact. This does not prove it is absent everywhere. No native decompilation or runtime observation occurred.
5. **Can this ship safely in the intended stack? Partially answered.** Documentation supports the proposed UI and host capabilities, but permission scope, Trash operations, signing, memory budgets, and cleanup adapters require a technical spike and tests.

## REA setup record

The requested `npx rea-agents@latest setup` resolved to version **6.5.0**. Its first noninteractive execution reported ready with no applied actions. A scoped `npx --yes rea-agents@6.5.0 setup --client codex --yes` subsequently reported `configured_codex` and `installed_skill`. The bundled `reverse-engineer-anything` skill and its connection/recovery guidance were read.

The setup output reported no available native analysis providers. No Ghidra, IDA, JADX, or Hopper engine was installed for this task. MCP registration does not establish an active connection in the current session. This repository does not contain local client configuration, credentials, setup logs, private paths, or purported REA evidence IDs.

Native investigation remains blocked on a selected app artifact and a suitable analysis engine. If pursued later: record the artifact version/hash and scope, inspect resources and metadata first, then trace only the relevant feature paths. Distinguish static findings, observed runtime behavior, inferences, and unknowns. Do not claim original source recovery or copy proprietary assets. Source for tooling: [REA repository](https://github.com/morluto/rea).

## Primary-source implementation references

- [Apple sidebars](https://developer.apple.com/design/human-interface-guidelines/sidebars): platform navigation reference. The web renderer was JavaScript-dependent; no unviewed detailed requirement is asserted here.
- [Apple NavigationSplitView](https://developer.apple.com/documentation/swiftui/navigationsplitview): native split-view reference; useful for design comparison, not the chosen React implementation.
- [Apple notarization](https://developer.apple.com/documentation/security/notarizing-macos-software-before-distribution): informs the proposed signed direct-download release process. Notarization is not proof of cleanup safety.
- [shadcn Dialog](https://ui.shadcn.com/docs/components/radix/dialog) and [shadcn Sidebar](https://ui.shadcn.com/docs/components/base/sidebar): customizable component patterns. Select a consistent primitive family before coding.
- [Motion reduced-motion hook](https://motion.dev/docs/react-use-reduced-motion): supports adapting animations to system preferences.
- [Tauri runtime authority](https://v2.tauri.app/security/runtime-authority/): command access is checked through permissions/capabilities and applicable scopes. Application-specific file validation is still required.

These references were consulted for planning on the date above. Pin actual dependency versions and recheck distribution requirements during implementation. No benchmark, paid conversion, refund, trademark, or security-audit result has been established.

## Design provenance

The user supplied a rounded wordmark reference and two UI references. New Undust artwork was generated from those style directions. The concept UI's sizes and file categories are fictional demonstration data. The repository intentionally omits the earlier personal Mac scan and local filesystem inventory. The wordmark and icon require small-size, vector/asset-catalog, and brand-clearance review before commercial release.
