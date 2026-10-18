export type Category =
  "App caches" | "Developer caches" | "Old installers" | "Large files";
export interface Candidate {
  id: string;
  name: string;
  path: string;
  bytes: number;
  category: Category;
  reason: string;
  consequence: string;
  action: "review" | "trash";
  modified: number;
}
export interface ScanResult {
  id: string;
  candidates: Candidate[];
  checked: number;
  skipped: number;
  complete: boolean;
  roots: string[];
}
export interface HistoryEntry {
  id: string;
  time: number;
  bytes: number;
  count: number;
  kind: "sample" | "trash";
  completed: number;
  failed: number;
  skipped: number;
}
export const categories: Category[] = [
  "App caches",
  "Developer caches",
  "Old installers",
  "Large files",
];
export function size(bytes: number) {
  if (bytes < 1000) return `${bytes} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let n = bytes / 1000,
    i = 0;
  while (n >= 1000 && i < 3) {
    n /= 1000;
    i++;
  }
  return `${n.toFixed(n >= 100 ? 0 : 1)} ${units[i]}`;
}
export function selectedItems(items: Candidate[], ids: Set<string>) {
  return items.filter((x) => ids.has(x.id));
}
export function total(items: Candidate[]) {
  return items.reduce((sum, x) => sum + x.bytes, 0);
}
export const sampleResult: ScanResult = {
  id: "sample",
  checked: 18432,
  skipped: 0,
  complete: true,
  roots: ["Sample workspace"],
  candidates: [
    {
      id: "npm",
      name: "npm package downloads",
      path: "Sample workspace/.npm/_cacache",
      bytes: 3200000000,
      category: "Developer caches",
      reason: "Downloaded packages that npm can fetch again.",
      consequence:
        "Your next install may need internet access and take longer.",
      action: "review",
      modified: 0,
    },
    {
      id: "next",
      name: "Next.js build cache",
      path: "Sample workspace/portfolio/.next/cache",
      bytes: 1800000000,
      category: "Developer caches",
      reason: "Generated build cache from a sample project.",
      consequence:
        "The next build may take longer. Source files are preserved.",
      action: "review",
      modified: 0,
    },
    {
      id: "uv",
      name: "Python package cache",
      path: "Sample workspace/.cache/uv",
      bytes: 1200000000,
      category: "Developer caches",
      reason: "Reusable package downloads and build artifacts.",
      consequence: "Packages may need to be downloaded or built again.",
      action: "review",
      modified: 0,
    },
    {
      id: "chrome",
      name: "Chrome media cache",
      path: "Sample workspace/Library/Caches/Chrome",
      bytes: 2900000000,
      category: "App caches",
      reason: "Temporary media files from a sample browser profile.",
      consequence: "Pages and media may need to download again.",
      action: "review",
      modified: 0,
    },
    {
      id: "slack",
      name: "Slack image cache",
      path: "Sample workspace/Library/Caches/Slack",
      bytes: 1900000000,
      category: "App caches",
      reason: "Temporary downloaded images.",
      consequence: "Images may load again when you open a conversation.",
      action: "review",
      modified: 0,
    },
    {
      id: "installer",
      name: "Creative Studio.dmg",
      path: "Sample workspace/Downloads/Creative Studio.dmg",
      bytes: 1400000000,
      category: "Old installers",
      reason: "A disk image that you may no longer need.",
      consequence: "Keep it if you need the installer offline.",
      action: "trash",
      modified: 0,
    },
  ],
};
