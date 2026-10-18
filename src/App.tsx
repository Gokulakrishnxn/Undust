import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  House,
  Brush,
  Code2,
  AppWindow,
  Files,
  Power,
  History,
  Settings,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  ChevronRight,
  Search,
  FolderOpen,
  X,
  Check,
  LoaderCircle,
  Info,
  CircleAlert,
  RefreshCw,
  Trash2,
  Download,
  ExternalLink,
  SlidersHorizontal,
  Plus,
  HardDrive,
  LockKeyhole,
  CheckCircle2,
  Monitor,
  Sun,
  Moon,
  Bell,
  ScanLine,
} from "lucide-react";
import { Button } from "./components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "./components/ui/dialog";
import { Checkbox } from "./components/ui/checkbox";
import { Switch } from "./components/ui/switch";
import {
  sampleResult,
  size,
  total,
  selectedItems,
  type Candidate,
  type Category,
  type HistoryEntry,
  type ScanResult,
} from "./lib/model";
import * as service from "./lib/service";
import { AmbientScene } from "./components/ambient-scene";

type Page =
  | "Overview"
  | "Cleanup"
  | "Developer"
  | "Applications"
  | "Large files"
  | "Startup"
  | "History"
  | "Settings";
type Step = "intro" | "scanning" | "review" | "result";
const nav = [
  { name: "Overview", icon: House },
  { name: "Cleanup", icon: Brush },
  { name: "Developer", icon: Code2 },
  { name: "Applications", icon: AppWindow },
  { name: "Large files", icon: Files },
  { name: "Startup", icon: Power },
] as const;
const reasons = [
  "Review every file before it goes.",
  "Keep your work. Lose the leftovers.",
  "Your files stay on your Mac.",
];
function readStored<T>(key: string, fallback: T): T {
  try {
    return JSON.parse(localStorage.getItem(key) ?? "null") ?? fallback;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [page, setPage] = useState<Page>("Cleanup");
  const [step, setStep] = useState<Step>("intro");
  const [sample, setSample] = useState(!service.desktop);
  const [roots, setRoots] = useState<string[]>(() =>
    readStored("undust-roots", []),
  );
  const [result, setResult] = useState<ScanResult | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [summary, setSummary] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [upgrade, setUpgrade] = useState(false);
  const [about, setAbout] = useState(false);
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState(0);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All items");
  const [inspected, setInspected] = useState<Candidate | null>(null);
  const [entries, setEntries] = useState<HistoryEntry[]>(() =>
    readStored("undust-history", []),
  );
  const [ignored, setIgnored] = useState<string[]>(() =>
    readStored("undust-ignored", []),
  );
  const [theme, setTheme] = useState(() =>
    readStored<string>("undust-theme", "dark"),
  );
  const [reduceEffects, setReduceEffects] = useState(() =>
    readStored<boolean>("undust-reduce", false),
  );
  const [disk, setDisk] = useState<{ total: number; available: number } | null>(
    null,
  );
  const [notice, setNotice] = useState("");
  const [apps, setApps] = useState<service.InstalledApp[]>([]);
  const [appsLoading, setAppsLoading] = useState(false);
  useEffect(() => {
    localStorage.setItem("undust-roots", JSON.stringify(roots));
  }, [roots]);
  useEffect(() => {
    if (page !== "Applications") return;
    if (sample) {
      setApps([
        {
          id: "safari",
          icon: "/art/apps/safari.svg",
          name: "Safari",
          bytes: 385000000,
          path: "Sample workspace/Applications/Safari.app",
        },
        {
          id: "code",
          icon: "/art/apps/code.svg",
          name: "Visual Studio Code",
          bytes: 690000000,
          path: "Sample workspace/Applications/Visual Studio Code.app",
        },
        {
          id: "figma",
          icon: "/art/apps/figma.svg",
          name: "Figma",
          bytes: 412000000,
          path: "Sample workspace/Applications/Figma.app",
        },
      ]);
      return;
    }
    let cancelled = false;
    setAppsLoading(true);
    service
      .listApps()
      .then((data) => {
        if (!cancelled) setApps(data);
      })
      .catch((e) => {
        if (!cancelled) setError(String(e));
      })
      .finally(() => {
        if (!cancelled) setAppsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page, sample]);
  const cancelRef = useRef(false);
  const prefersReduced = useReducedMotion();
  const reduced = reduceEffects || prefersReduced;
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("undust-theme", JSON.stringify(theme));
  }, [theme]);
  useEffect(() => {
    document.documentElement.dataset.reduce = String(reduceEffects);
    localStorage.setItem("undust-reduce", JSON.stringify(reduceEffects));
  }, [reduceEffects]);
  useEffect(() => {
    localStorage.setItem("undust-history", JSON.stringify(entries));
  }, [entries]);
  useEffect(() => {
    localStorage.setItem("undust-ignored", JSON.stringify(ignored));
  }, [ignored]);
  useEffect(() => {
    document.documentElement.dataset.desktop = String(service.desktop);
    if (service.desktop)
      service
        .storage()
        .then(setDisk)
        .catch(() => {});
  }, []);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 4500);
    return () => clearTimeout(timer);
  }, [notice]);
  useEffect(() => {
    const fn = (event: KeyboardEvent) => {
      if (event.metaKey && event.key === ",") {
        event.preventDefault();
        navigate("Settings");
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [busy, result]);
  const candidates = result?.candidates ?? [];
  const chosen = selectedItems(candidates, selected);
  const candidateTotal = total(
    candidates.filter((x) => !ignored.includes(x.path)),
  );
  const filtered = candidates.filter(
    (x) =>
      (filter === "Ignored"
        ? ignored.includes(x.path)
        : !ignored.includes(x.path)) &&
      (page !== "Developer" || x.category === "Developer caches") &&
      (page !== "Large files" ||
        x.category === "Large files" ||
        x.category === "Old installers") &&
      (filter !== "Rebuildable" || x.category.includes("caches")) &&
      (filter !== "Needs review" || !x.category.includes("caches")) &&
      `${x.name} ${x.path}`.toLowerCase().includes(query.toLowerCase()),
  );
  function navigate(next: Page) {
    if (busy) {
      setNotice("Finish or cancel the current operation first.");
      return;
    }
    setPage(next);
    setQuery("");
    setInspected(null);
    setError("");
    if (["Overview", "Cleanup", "Developer", "Large files"].includes(next))
      setStep(result ? "review" : "intro");
  }
  async function choose() {
    try {
      const folders = await service.chooseFolders();
      if (folders.length) {
        setRoots(folders);
        setResult(null);
        setSelected(new Set());
        setStep("intro");
        setNotice(
          `${folders.length} folder${folders.length > 1 ? "s" : ""} added`,
        );
      }
    } catch (e) {
      setError(String(e));
    }
  }
  async function scan() {
    if (busy) return;
    setError("");
    setSelected(new Set());
    setInspected(null);
    cancelRef.current = false;
    setStep("scanning");
    setBusy(true);
    setStage(0);
    const timer = setInterval(() => setStage((s) => Math.min(s + 1, 3)), 650);
    try {
      let next: ScanResult;
      if (sample) {
        await new Promise((resolve) => setTimeout(resolve, 2400));
        next = structuredClone(sampleResult);
      } else {
        if (!roots.length) {
          setStep("intro");
          await choose();
          return;
        }
        next = await service.scanFolders(roots);
      }
      if (cancelRef.current) {
        setStep(result ? "review" : "intro");
        setNotice("Scan cancelled. Your files are unchanged.");
        return;
      }
      setResult(next);
      setStep("review");
      setSummary(true);
    } catch (e) {
      setError(String(e));
      setStep(result ? "review" : "intro");
    } finally {
      clearInterval(timer);
      setBusy(false);
    }
  }
  async function cancel() {
    cancelRef.current = true;
    if (!sample) await service.cancelScan().catch(() => {});
  }
  function toggle(id: string) {
    setSelected((old) => {
      const next = new Set(old);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }
  function ignore(item: Candidate) {
    setIgnored((old) => [...new Set([...old, item.path])]);
    setSelected((old) => {
      const next = new Set(old);
      next.delete(item.id);
      return next;
    });
    setInspected(null);
    setNotice("Item added to your ignore list.");
  }
  async function execute() {
    if (!result || !chosen.length) return;
    setBusy(true);
    setError("");
    try {
      if (!sample && chosen.some((x) => x.action !== "trash")) {
        throw new Error(
          "Cache cleanup is not enabled in this build. Select supported files marked Move to Trash.",
        );
      }
      const outcome = sample
        ? {
            completed: chosen.length,
            failed: 0,
            skipped: 0,
            bytes: total(chosen),
          }
        : await service.trash(
            chosen.map((x) => x.id),
            result.id,
          );
      const entry: HistoryEntry = {
        id: crypto.randomUUID(),
        time: Date.now(),
        count: chosen.length,
        kind: sample ? "sample" : "trash",
        ...outcome,
      };
      setEntries((old) => [entry, ...old].slice(0, 100));
      setConfirm(false);
      setStep("result");
      setSelected(new Set());
      if (!sample) setResult(null);
    } catch (e) {
      setError(String(e));
      setConfirm(false);
    } finally {
      setBusy(false);
    }
  }
  const updateSample = (value: boolean) => {
    if (busy) return;
    setSample(value);
    setResult(null);
    setSelected(new Set());
    setStep("intro");
    setError("");
  };
  const sectionHeader = (
    eyebrow: string,
    title: string,
    description: string,
  ) => (
    <header className="section-heading">
      <span className="eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      <p>{description}</p>
    </header>
  );
  return (
    <div className={`app-shell ${reduced ? "reduce-effects" : ""}`}>
      <AmbientScene reduced={Boolean(reduced)} />
      <aside className="sidebar">
        <div className="window-controls" data-tauri-drag-region>
          <span />
          <span />
          <span />
        </div>
        <button
          className="wordmark"
          onClick={() => navigate("Overview")}
          aria-label="Undust overview"
        >
          <img src="/art/undust-icon.png" alt="" className="brand-app-icon" />
          <span>
            undust<span className="brand-star">✦</span>
          </span>
        </button>
        <nav aria-label="Main navigation">
          {nav.map(({ name, icon: Icon }) => (
            <button
              key={name}
              className={`nav-item ${page === name ? "active" : ""}`}
              onClick={() => navigate(name)}
              aria-current={page === name ? "page" : undefined}
            >
              <span
                className={`nav-icon nav-icon-${name.toLowerCase().replaceAll(" ", "-")}`}
              >
                <Icon size={18} />
              </span>
              <span>{name}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-divider" />
          {[
            { name: "History" as Page, icon: History },
            { name: "Settings" as Page, icon: Settings },
          ].map(({ name, icon: Icon }) => (
            <button
              key={name}
              className={`nav-item ${page === name ? "active" : ""}`}
              onClick={() => navigate(name)}
              aria-current={page === name ? "page" : undefined}
            >
              <span className="nav-icon nav-icon-utility">
                <Icon size={18} />
              </span>
              <span>{name}</span>
            </button>
          ))}
          <button className="upgrade-link" onClick={() => setUpgrade(true)}>
            <span className="pro-icon">
              <Sparkles size={17} />
            </span>
            <span className="upgrade-copy">
              <strong>Undust Pro</strong>
              <span className="muted">$10 · One-time purchase</span>
            </span>
            <ChevronRight size={15} />
          </button>
          <div className="sidebar-footnote">Thoughtfully lighter.</div>
        </div>
      </aside>
      <main className="main">
        <div className="titlebar" data-tauri-drag-region>
          <div className="titlebar-right">
            <button
              className="icon-button"
              aria-label="About Undust"
              onClick={() => setAbout(true)}
            >
              <Info size={16} />
            </button>
          </div>
        </div>
        <AnimatePresence initial={false} mode="popLayout">
          <motion.div
            key={page}
            className="page"
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.18 }}
          >
            {error && (
              <div role="alert" className="error-banner">
                <CircleAlert size={17} />
                <span>{error}</span>
                <button aria-label="Dismiss error" onClick={() => setError("")}>
                  <X size={16} />
                </button>
              </div>
            )}
            {(
              ["Cleanup", "Developer", "Large files", "Overview"] as Page[]
            ).includes(page) && (
              <>
                {(step === "intro" || (step === "review" && summary)) && (
                  <div className="intro-screen">
                    <div className="intro-topline">
                      <span className="eyebrow">
                        {page === "Developer"
                          ? "MADE FOR YOUR NEXT BUILD"
                          : page === "Large files"
                            ? "ROOM FOR WHAT MATTERS"
                            : "A FRESH PERSPECTIVE"}
                      </span>
                      <span className="version-pill">UNDUST 0.1</span>
                    </div>
                    <div className="intro-composition">
                      <div className="hero-art">
                        <div className="art-halo" />
                        <img
                          src="/art/glass-hero.png"
                          alt="Sculptural blue glass with a luminous sweeping brush and sparkles"
                        />
                      </div>
                      <div className="hero-copy">
                        <span className="small-label">
                          {page === "Developer"
                            ? "DEVELOPER CLEANUP"
                            : page === "Large files"
                              ? "LARGE FILES"
                              : page === "Overview"
                                ? "WELCOME TO UNDUST"
                                : "SMARTER CLEANUP"}
                        </span>
                        <h1>
                          {page === "Developer" ? (
                            <>
                              Less cache.
                              <br />
                              More creating.
                            </>
                          ) : page === "Large files" ? (
                            <>
                              Big files.
                              <br />
                              Clear choices.
                            </>
                          ) : (
                            <>
                              A little less
                              <br />
                              <em>clutter.</em>
                            </>
                          )}
                        </h1>
                        <p>
                          {page === "Developer"
                            ? "Understand your build caches and package downloads. Keep the code that matters."
                            : page === "Large files"
                              ? "Find what’s taking up space. Decide what deserves to stay."
                              : "Make room for what matters. Find what you no longer need, and choose what goes."}
                        </p>
                        <Button className="primary-pill" onClick={scan}>
                          <ScanLine size={17} />
                          {sample
                            ? "Explore sample scan"
                            : roots.length
                              ? "Scan selected folders"
                              : "Choose folders to scan"}
                          <ArrowRight size={17} />
                        </Button>
                        {!sample && (
                          <span className="hero-reassurance">
                            {roots.length
                              ? `${roots.length} approved folder${roots.length === 1 ? "" : "s"} · Read-only until you confirm`
                              : "Start with folders you choose. Your files stay private."}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="promise-strip">
                      {reasons.map((reason, i) => (
                        <div key={reason}>
                          <span className="promise-index">0{i + 1}</span>
                          <span>{reason}</span>
                        </div>
                      ))}
                    </div>
                    <div className="intro-footer">
                      <span>
                        <span className="status-dot" />
                        {sample
                          ? "Sample data · 12.4 GB to explore"
                          : disk
                            ? `${size(disk.available)} available on your Mac`
                            : "On-device scanning"}
                      </span>
                      <button onClick={() => navigate("Settings")}>
                        Your preferences <SlidersHorizontal size={13} />
                      </button>
                    </div>
                  </div>
                )}
                {step === "scanning" && (
                  <div className="scan-screen">
                    <div className="scan-orb">
                      <img src="/art/undust-icon.png" alt="" />
                      <svg viewBox="0 0 220 220">
                        <circle cx="110" cy="110" r="100" />
                      </svg>
                    </div>
                    <span className="eyebrow">
                      A LITTLE PATIENCE. A LITTLE MORE SPACE.
                    </span>
                    <h1>
                      Finding room
                      <br />
                      for what matters.
                    </h1>
                    <p role="status" aria-live="polite">
                      {
                        [
                          "Preparing your workspace…",
                          "Checking supported caches…",
                          "Looking at larger files…",
                          "Organizing your results…",
                        ][stage]
                      }
                    </p>
                    <div className="scan-progress">
                      <span />
                    </div>
                    <Button
                      variant="outline"
                      className="secondary-pill"
                      onClick={cancel}
                    >
                      Cancel scan
                    </Button>
                    <small>
                      {sample
                        ? "Preview only. Your real files are untouched."
                        : "Scanning only your selected folders."}
                    </small>
                  </div>
                )}
                {step === "review" && !summary && result && (
                  <div className="review-screen">
                    <div className="review-heading">
                      {sectionHeader(
                        "YOUR STORAGE, WITH CONTEXT",
                        page === "Developer"
                          ? "Your build. A little lighter."
                          : page === "Large files"
                            ? "The bigger picture."
                            : "Room to breathe.",
                        `${result.checked.toLocaleString()} items checked${result.complete ? "" : " · Partial scan"}${result.skipped ? ` · ${result.skipped} skipped locations` : ""}`,
                      )}
                      <Button
                        variant="outline"
                        className="secondary-pill"
                        onClick={scan}
                        disabled={busy}
                      >
                        <RefreshCw size={14} />
                        Scan again
                      </Button>
                    </div>
                    <div className="review-stats">
                      <div>
                        <span className="small-label">AVAILABLE TO REVIEW</span>
                        <strong>{size(candidateTotal)}</strong>
                        <span>
                          {candidates.length} findings ·{" "}
                          {sample ? "Sample data" : "Selected folders"}
                        </span>
                      </div>
                      <div className="storage-visual">
                        <div
                          className={`storage-bar ${sample ? "sample-storage" : "real-storage"}`}
                        >
                          <span />
                          <span />
                          <span />
                        </div>
                        <span>
                          {sample
                            ? "Demo Macintosh HD · 62 GB available"
                            : disk
                              ? `${size(disk.available)} available · ${size(disk.total)} total`
                              : `${roots.length} approved folders`}
                        </span>
                      </div>
                      <button
                        className="text-link"
                        onClick={() => setSummary(true)}
                      >
                        View summary <ArrowRight size={15} />
                      </button>
                    </div>
                    <div className="review-toolbar">
                      <div
                        className="filter-tabs"
                        role="group"
                        aria-label="Filter findings"
                      >
                        {[
                          "All items",
                          "Rebuildable",
                          "Needs review",
                          "Ignored",
                        ].map((x) => (
                          <button
                            key={x}
                            className={filter === x ? "selected" : ""}
                            onClick={() => {
                              setFilter(x);
                              setSelected(new Set());
                            }}
                          >
                            {x}
                          </button>
                        ))}
                      </div>
                      <div className="search-field">
                        <Search size={15} />
                        <input
                          aria-label="Search findings"
                          placeholder="Search files…"
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                        />
                      </div>
                    </div>
                    <div
                      className={`review-content ${inspected ? "has-inspector" : ""}`}
                    >
                      <div className="file-table">
                        <div className="table-head">
                          <Checkbox
                            aria-label="Select visible supported files"
                            checked={
                              filtered.length > 0 &&
                              filtered.every((x) => selected.has(x.id))
                            }
                            onCheckedChange={(value) =>
                              setSelected(
                                new Set(
                                  value
                                    ? filtered
                                        .filter(
                                          (x) => sample || x.action === "trash",
                                        )
                                        .map((x) => x.id)
                                    : [],
                                ),
                              )
                            }
                          />
                          <span>Name</span>
                          <span>Size</span>
                          <span />
                        </div>
                        {filtered.length ? (
                          filtered.map((item) => (
                            <div
                              className={`file-row ${selected.has(item.id) ? "is-selected" : ""}`}
                              key={item.id}
                            >
                              <Checkbox
                                aria-label={`Select ${item.name}`}
                                checked={selected.has(item.id)}
                                disabled={
                                  ignored.includes(item.path) ||
                                  (!sample && item.action !== "trash")
                                }
                                onCheckedChange={() => toggle(item.id)}
                              />
                              <button
                                className="file-name"
                                onClick={() => setInspected(item)}
                              >
                                <span
                                  className={`file-icon ${item.category === "Developer caches" ? "developer" : ""}`}
                                >
                                  {item.category === "Developer caches" ? (
                                    <Code2 size={19} />
                                  ) : item.category === "Old installers" ? (
                                    <Download size={19} />
                                  ) : (
                                    <Files size={19} />
                                  )}
                                </span>
                                <span>
                                  <b>{item.name}</b>
                                  <small>
                                    {item.category}
                                    <span>·</span>
                                    {item.action === "review"
                                      ? "Review only"
                                      : "Move to Trash"}
                                  </small>
                                </span>
                              </button>
                              <span className="file-size">
                                {size(item.bytes)}
                              </span>
                              <button
                                className="icon-button"
                                aria-label={`Inspect ${item.name}`}
                                onClick={() => setInspected(item)}
                              >
                                <ChevronRight size={16} />
                              </button>
                            </div>
                          ))
                        ) : (
                          <div className="empty-inline">
                            <Search size={26} />
                            <h3>
                              {filter === "Ignored"
                                ? "Nothing ignored here."
                                : "Nothing matches your search."}
                            </h3>
                            <p>
                              Try another filter or scan a different folder.
                            </p>
                          </div>
                        )}
                      </div>
                      {inspected && (
                        <aside className="inspector">
                          <button
                            className="inspector-close icon-button"
                            onClick={() => setInspected(null)}
                            aria-label="Close file details"
                          >
                            <X size={16} />
                          </button>
                          <div className="inspector-art">
                            <Files size={32} />
                          </div>
                          <h3>{inspected.name}</h3>
                          <strong>{size(inspected.bytes)}</strong>
                          <label>WHY THIS APPEARS</label>
                          <p>{inspected.reason}</p>
                          <label>WHAT HAPPENS NEXT</label>
                          <p>{inspected.consequence}</p>
                          <label>LOCATION</label>
                          <code>{inspected.path}</code>
                          <Button
                            variant="outline"
                            onClick={() =>
                              sample
                                ? setNotice(
                                    "Finder is available for real scan results in the desktop app.",
                                  )
                                : service
                                    .reveal(inspected.id, result.id)
                                    .catch((e) => setError(String(e)))
                            }
                          >
                            <FolderOpen size={14} />
                            Reveal in Finder
                          </Button>
                          {ignored.includes(inspected.path) ? (
                            <button
                              className="text-link"
                              onClick={() =>
                                setIgnored((x) =>
                                  x.filter((p) => p !== inspected.path),
                                )
                              }
                            >
                              Remove from ignore list
                            </button>
                          ) : (
                            <button
                              className="text-link"
                              onClick={() => ignore(inspected)}
                            >
                              Ignore this item
                            </button>
                          )}
                        </aside>
                      )}
                    </div>
                    {!sample && (
                      <p className="inline-note">
                        <Info size={14} />
                        Caches are review-only in this early build. Only
                        eligible personal files can be moved to Trash.
                      </p>
                    )}
                    <div className="selection-footer">
                      <span>
                        {selected.size ? (
                          <>
                            <b>{selected.size} selected</b>
                            <span className="muted">
                              {" "}
                              · {size(total(chosen))}
                            </span>
                          </>
                        ) : (
                          <>
                            <ShieldCheck size={15} /> You choose what goes.
                          </>
                        )}
                      </span>
                      <Button
                        className="primary-pill"
                        disabled={!chosen.length || busy}
                        onClick={() => setConfirm(true)}
                      >
                        Continue <ArrowRight size={15} />
                      </Button>
                    </div>
                  </div>
                )}
                {step === "result" && entries[0] && (
                  <div className="completion-screen">
                    <div className="success-symbol">
                      <Check size={38} />
                    </div>
                    <span className="eyebrow">
                      {entries[0].kind === "sample"
                        ? "PREVIEW COMPLETE"
                        : "CLEANUP RESULTS"}
                    </span>
                    <h1>
                      {entries[0].kind === "sample"
                        ? "A little lighter."
                        : "Reviewed. Sorted."}
                    </h1>
                    <p>
                      {entries[0].kind === "sample"
                        ? "That’s how Undust works. Your real files haven’t changed."
                        : "Your selected files were processed. Review the details below."}
                    </p>
                    <div className="completion-metrics">
                      <div>
                        <strong>{size(entries[0].bytes)}</strong>
                        <span>
                          {entries[0].kind === "sample"
                            ? "Simulated cleanup"
                            : "Moved to Trash"}
                        </span>
                      </div>
                      <div>
                        <strong>{entries[0].completed}</strong>
                        <span>Completed items</span>
                      </div>
                    </div>
                    <p className="inline-note">
                      <Info size={15} />
                      {entries[0].kind === "sample"
                        ? "Sample results are labeled in your history."
                        : "Files in Trash still use storage until Trash is emptied."}
                    </p>
                    {entries[0].failed + entries[0].skipped > 0 && (
                      <p>
                        {entries[0].failed} failed · {entries[0].skipped}{" "}
                        skipped
                      </p>
                    )}
                    <div className="button-pair">
                      <Button
                        variant="outline"
                        className="secondary-pill"
                        onClick={() => navigate("History")}
                      >
                        View history
                      </Button>
                      <Button
                        className="primary-pill"
                        onClick={() => {
                          setStep("intro");
                          if (sample) setResult(null);
                        }}
                      >
                        Back to cleanup <ArrowRight size={15} />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
            {page === "Applications" && (
              <div className="standard-page">
                {sectionHeader(
                  "ONLY WHAT YOU NEED",
                  "Make space for your favorites.",
                  "A read-only look at your apps. Reviewed removal is coming in Pro.",
                )}
                <div className="applications-toolbar">
                  <span>
                    {appsLoading
                      ? "Reading application sizes…"
                      : `${apps.length} ${sample ? "sample " : ""}applications`}
                  </span>
                  <div className="search-field">
                    <Search size={15} />
                    <input
                      aria-label="Search applications"
                      placeholder="Search applications…"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                  </div>
                </div>
                <div className="list-panel">
                  {appsLoading ? (
                    <div className="empty-inline">
                      <LoaderCircle className="spin" size={26} />
                      <p>Inspecting applications. Your files stay unchanged.</p>
                    </div>
                  ) : (
                    apps
                      .filter((app) =>
                        app.name.toLowerCase().includes(query.toLowerCase()),
                      )
                      .map((app) => (
                        <div className="application-row" key={app.id}>
                          <div
                            className={`application-symbol ${app.icon ? "has-icon" : ""}`}
                          >
                            {app.icon ? (
                              <img
                                src={app.icon}
                                alt=""
                                className="application-icon"
                                onError={(event) => {
                                  event.currentTarget.style.display = "none";
                                  event.currentTarget.parentElement?.classList.remove(
                                    "has-icon",
                                  );
                                }}
                              />
                            ) : null}
                            <AppWindow
                              size={24}
                              className="application-fallback"
                            />
                          </div>
                          <div>
                            <h3>{app.name}</h3>
                            <p>{sample ? "Sample application" : app.path}</p>
                          </div>
                          <strong>{size(app.bytes)}</strong>
                          <span className="tag">INVENTORY</span>
                        </div>
                      ))
                  )}
                </div>
                <p className="inline-note">
                  <ShieldCheck size={14} />
                  App sizes are logical file sizes. Shared files and
                  system-managed apps may not be included.
                </p>
              </div>
            )}
            {page === "Startup" && (
              <div className="standard-page">
                {sectionHeader(
                  "A CALMER START",
                  "Start on your own terms.",
                  "Choose what opens when you turn on your Mac.",
                )}
                <div className="feature-spotlight">
                  <div className="spotlight-icon">
                    <Power size={46} />
                  </div>
                  <h2>A fresh start, your way.</h2>
                  <p>
                    Review login and background items in macOS Settings. Changes
                    may affect apps you use.
                  </p>
                  <Button
                    className="primary-pill"
                    onClick={() =>
                      service.desktop
                        ? service
                            .openStartup()
                            .catch((e) => setError(String(e)))
                        : setNotice(
                            "On your Mac: System Settings → General → Login Items & Extensions.",
                          )
                    }
                  >
                    <ExternalLink size={16} />
                    Open Login Items
                  </Button>
                  <small>
                    Undust never changes startup items automatically.
                  </small>
                </div>
              </div>
            )}
            {page === "History" && (
              <div className="standard-page">
                {sectionHeader(
                  "A CLEAR RECORD",
                  "Every little change.",
                  "Your cleanup history stays on this device.",
                )}
                <div className="list-panel">
                  {entries.length ? (
                    entries.map((e) => (
                      <div className="history-row" key={e.id}>
                        <div className="history-icon">
                          <CheckCircle2 size={20} />
                        </div>
                        <div>
                          <h3>
                            {e.kind === "sample"
                              ? "Sample cleanup"
                              : "Moved to Trash"}
                            <span className="tag">
                              {e.kind === "sample" ? "PREVIEW" : "LOCAL"}
                            </span>
                          </h3>
                          <p>
                            {new Date(e.time).toLocaleString()} · {e.completed}{" "}
                            completed · {e.failed} failed · {e.skipped} skipped
                          </p>
                        </div>
                        <strong>{size(e.bytes)}</strong>
                      </div>
                    ))
                  ) : (
                    <div className="empty-inline">
                      <History size={30} />
                      <h3>Your story starts here.</h3>
                      <p>
                        Completed cleanups will appear here, with a clear record
                        of what changed.
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => navigate("Cleanup")}
                      >
                        Go to cleanup
                      </Button>
                    </div>
                  )}
                </div>
                {entries.length > 0 && (
                  <button
                    className="text-link danger-text"
                    onClick={() => {
                      setEntries([]);
                      setNotice(
                        "Local history cleared. Your files are unchanged.",
                      );
                    }}
                  >
                    Clear local history
                  </button>
                )}
              </div>
            )}
            {page === "Settings" && (
              <div className="standard-page settings-page">
                {sectionHeader(
                  "MAKE IT YOURS",
                  "A thoughtful little setup.",
                  "Simple preferences. Clear choices.",
                )}
                <section className="settings-section">
                  <h2>Workspace</h2>
                  <div className="setting-row">
                    <div>
                      <h3>Sample workspace</h3>
                      <p>Explore the experience with fictional files.</p>
                    </div>
                    <Switch
                      aria-label="Sample workspace"
                      checked={sample}
                      disabled={busy || !service.desktop}
                      onCheckedChange={updateSample}
                    />
                  </div>
                  {!service.desktop && (
                    <p className="inline-note">
                      <Info size={14} />
                      Real folder access is available in the desktop app.
                    </p>
                  )}
                  {!sample && (
                    <div className="setting-row">
                      <div>
                        <h3>Approved folders</h3>
                        <p>
                          {roots.length
                            ? roots.join(" · ")
                            : "Choose folders before your first scan."}
                        </p>
                      </div>
                      <Button variant="outline" onClick={choose}>
                        <Plus size={14} />
                        Choose folders
                      </Button>
                    </div>
                  )}
                </section>
                <section className="settings-section">
                  <h2>Appearance</h2>
                  <div className="setting-row">
                    <div>
                      <h3>Theme</h3>
                      <p>Choose a little light, or a little dark.</p>
                    </div>
                    <div className="theme-picker">
                      {[
                        { value: "system", icon: Monitor },
                        { value: "light", icon: Sun },
                        { value: "dark", icon: Moon },
                      ].map(({ value, icon: Icon }) => (
                        <button
                          aria-label={`${value} theme`}
                          title={`${value} theme`}
                          key={value}
                          className={theme === value ? "selected" : ""}
                          onClick={() => setTheme(value)}
                        >
                          <Icon size={17} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="setting-row">
                    <div>
                      <h3>Reduce visual effects</h3>
                      <p>Solid surfaces and fewer animations.</p>
                    </div>
                    <Switch
                      aria-label="Reduce visual effects"
                      checked={reduceEffects}
                      onCheckedChange={setReduceEffects}
                    />
                  </div>
                </section>
                <section className="settings-section">
                  <h2>Privacy & exclusions</h2>
                  <div className="setting-row">
                    <div>
                      <h3>Your files stay here</h3>
                      <p>
                        No file contents or paths are uploaded. No analytics.
                      </p>
                    </div>
                    <ShieldCheck size={20} />
                  </div>
                  <div className="setting-row">
                    <div>
                      <h3>Ignored items</h3>
                      <p>
                        {ignored.length} item{ignored.length === 1 ? "" : "s"}{" "}
                        excluded from selection.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      disabled={!ignored.length}
                      onClick={() => {
                        setIgnored([]);
                        setNotice("Ignore list reset.");
                      }}
                    >
                      Reset list
                    </Button>
                  </div>
                  <div className="setting-row">
                    <div>
                      <h3>Local history</h3>
                      <p>
                        Stored in this app’s local storage. Clear it any time.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      disabled={!entries.length}
                      onClick={() => setEntries([])}
                    >
                      Clear history
                    </Button>
                  </div>
                </section>
                <section className="settings-section">
                  <h2>Your edition</h2>
                  <div className="setting-row">
                    <div>
                      <h3>
                        Undust Free <span className="tag">EARLY BUILD</span>
                      </h3>
                      <p>
                        Pro is planned at $10, one time. Checkout is not live.
                      </p>
                    </div>
                    <Button variant="outline" onClick={() => setUpgrade(true)}>
                      Explore Pro <ArrowRight size={14} />
                    </Button>
                  </div>
                </section>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
      <Dialog open={summary} onOpenChange={setSummary}>
        <DialogContent
          className="cleanup-dialog"
          overlayClassName="cleanup-backdrop"
          showCloseButton={false}
        >
          <div className="dialog-art" />
          <div className="dialog-body">
            <DialogTitle>Your cleanup, reviewed.</DialogTitle>
            <DialogDescription>
              Choose what goes. Keep what matters.
            </DialogDescription>
            <div className="summary-size">
              <span className="eyebrow">READY TO REVIEW</span>
              <strong>{size(candidateTotal)}</strong>
              <span>of potential space</span>
            </div>
            <div className="summary-categories">
              {(
                [
                  "App caches",
                  "Developer caches",
                  "Old installers",
                  "Large files",
                ] as Category[]
              ).map((category) => {
                const list = candidates.filter(
                  (x) => x.category === category && !ignored.includes(x.path),
                );
                return (
                  list.length > 0 && (
                    <label key={category} className="summary-category">
                      <Checkbox
                        aria-label={`Review ${category}`}
                        checked={list.every((x) => selected.has(x.id))}
                        onCheckedChange={(value) => {
                          setSelected((old) => {
                            const next = new Set(old);
                            for (const item of list) {
                              if (value && (sample || item.action === "trash"))
                                next.add(item.id);
                              else next.delete(item.id);
                            }
                            return next;
                          });
                        }}
                        disabled={
                          !sample && list.every((x) => x.action !== "trash")
                        }
                      />
                      <span>
                        <b>{category}</b>
                        <small>
                          {category.includes("caches")
                            ? "Temporary files can be recreated."
                            : "Review before removing."}
                        </small>
                      </span>
                      <span>{size(total(list))}</span>
                    </label>
                  )
                );
              })}
            </div>
            <p className="dialog-reassurance">
              <Info size={14} />
              Nothing is removed until you confirm.
            </p>
            <div className="dialog-actions">
              <Button
                variant="outline"
                className="secondary-pill"
                onClick={() => setSummary(false)}
              >
                Cancel
              </Button>
              <Button
                className="primary-pill"
                onClick={() => {
                  setSummary(false);
                  setFilter("All items");
                }}
              >
                Review files <ArrowRight size={15} />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog
        open={confirm}
        onOpenChange={(value) => {
          if (!busy) setConfirm(value);
        }}
      >
        <DialogContent className="confirm-dialog">
          <div className="confirm-icon">
            <Trash2 size={25} />
          </div>
          <DialogTitle>
            {sample
              ? "Preview this cleanup?"
              : `Move ${chosen.length} items to Trash?`}
          </DialogTitle>
          <DialogDescription>
            {sample
              ? "This is a simulation. Your real files will stay exactly where they are."
              : "You can restore items while they remain in Trash. Storage is freed only after Trash is emptied."}
          </DialogDescription>
          <div className="confirm-total">
            <span>{chosen.length} selected items</span>
            <strong>{size(total(chosen))}</strong>
          </div>
          <div className="dialog-actions">
            <Button
              autoFocus
              variant="outline"
              className="secondary-pill"
              disabled={busy}
              onClick={() => setConfirm(false)}
            >
              Cancel
            </Button>
            <Button className="primary-pill" onClick={execute} disabled={busy}>
              {busy ? (
                <LoaderCircle className="spin" size={16} />
              ) : sample ? (
                "Simulate cleanup"
              ) : (
                "Move to Trash"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={upgrade} onOpenChange={setUpgrade}>
        <DialogContent className="upgrade-dialog">
          <div className="pro-art">
            <Sparkles size={33} />
          </div>
          <span className="eyebrow">UNDUST PRO</span>
          <DialogTitle>
            A little more.
            <br />
            Yours to keep.
          </DialogTitle>
          <DialogDescription>
            Thoughtful tools for a little extra room.
          </DialogDescription>
          <div className="pro-price">
            $10 <span>one time · planned pricing</span>
          </div>
          <div className="pro-features">
            {[
              "Developer cache cleanup",
              "Reviewed batch app removal",
              "Saved cleanup presets",
              "Opt-in scan reminders",
            ].map((x) => (
              <div key={x}>
                <Check size={16} />
                {x}
              </div>
            ))}
          </div>
          <p className="inline-note">
            <Info size={14} />
            Pro is in development. No payment will be taken.
          </p>
          <Button className="primary-pill" onClick={() => setUpgrade(false)}>
            Continue with Free <ArrowRight size={15} />
          </Button>
          <small>Pro v1 · Up to two personal Macs · No subscription</small>
        </DialogContent>
      </Dialog>
      <Dialog open={about} onOpenChange={setAbout}>
        <DialogContent className="about-dialog">
          <img src="/art/undust-icon.png" alt="Undust icon" />
          <DialogTitle>
            undust <Sparkles size={18} />
          </DialogTitle>
          <DialogDescription>A little less clutter.</DialogDescription>
          <span className="tag">VERSION 0.1.0 · EARLY BUILD</span>
          <p>
            Made for a calmer Mac. This build includes a guided preview and
            read-only folder scanning in the desktop app.
          </p>
          <small>Proprietary · © 2026 Gokulakrishnan</small>
        </DialogContent>
      </Dialog>
      <AnimatePresence>
        {notice && (
          <motion.div
            role="status"
            className="notice"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <CheckCircle2 size={17} />
            {notice}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
