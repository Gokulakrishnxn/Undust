import { invoke, isTauri } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import type { ScanResult } from "./model";
export const desktop = isTauri();
export async function chooseFolders(): Promise<string[]> {
  const result = await open({
    directory: true,
    multiple: true,
    title: "Choose folders for Undust to scan",
  });
  return result ? (Array.isArray(result) ? result : [result]) : [];
}
export const scanFolders = (roots: string[]) =>
  invoke<ScanResult>("scan_folders", { roots });
export const cancelScan = () => invoke("cancel_scan");
export const reveal = (id: string, scanId: string) =>
  invoke("reveal_candidate", { id, scanId });
export const trash = (ids: string[], scanId: string) =>
  invoke<{ completed: number; failed: number; skipped: number; bytes: number }>(
    "trash_candidates",
    { ids, scanId },
  );
export const storage = () =>
  invoke<{ total: number; available: number }>("storage_info");
export const openStartup = () => invoke("open_startup");

export interface InstalledApp {
  id: string;
  name: string;
  bytes: number;
  path: string;
}
export const listApps = () => invoke<InstalledApp[]>("list_apps");
