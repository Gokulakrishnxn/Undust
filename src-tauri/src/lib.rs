use serde::{Deserialize, Serialize};
#[cfg(unix)]
use std::os::unix::fs::MetadataExt;
use std::{
    collections::HashSet,
    fs,
    io::Write,
    path::{Path, PathBuf},
    process::Command,
    sync::{
        atomic::{AtomicBool, Ordering},
        Arc, Mutex,
    },
    time::{SystemTime, UNIX_EPOCH},
};
use tauri::{Manager, State};
use uuid::Uuid;
use walkdir::WalkDir;

const MAX_ENTRIES: usize = 100_000;
const MIN_LARGE: u64 = 100_000_000;
#[derive(Clone, Serialize, Deserialize)]
struct Candidate {
    id: String,
    name: String,
    path: String,
    bytes: u64,
    category: String,
    reason: String,
    consequence: String,
    action: String,
    modified: u64,
    #[serde(skip)]
    device: u64,
    #[serde(skip)]
    inode: u64,
}
#[derive(Clone, Serialize, Default)]
struct ScanResult {
    id: String,
    candidates: Vec<Candidate>,
    checked: usize,
    skipped: usize,
    complete: bool,
    roots: Vec<String>,
}
#[derive(Default)]
struct Backend {
    result: Mutex<Option<ScanResult>>,
    cancelled: AtomicBool,
    scanning: AtomicBool,
    executing: AtomicBool,
    active: AtomicBool,
}
type Shared = Arc<Backend>;
fn timestamp() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis() as u64
}
fn modified(meta: &fs::Metadata) -> u64 {
    meta.modified()
        .unwrap_or(UNIX_EPOCH)
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis() as u64
}
fn identity(meta: &fs::Metadata) -> (u64, u64) {
    #[cfg(unix)]
    {
        (meta.dev(), meta.ino())
    }
    #[cfg(not(unix))]
    {
        (0, 0)
    }
}
fn protected(path: &Path) -> bool {
    path.components().any(|c| {
        matches!(
            c.as_os_str().to_str().unwrap_or(""),
            ".git"
                | ".ssh"
                | ".aws"
                | ".gnupg"
                | ".Trash"
                | ".env"
                | "Keychains"
                | "Photos Library.photoslibrary"
                | "CloudStorage"
                | "Mobile Documents"
        )
    }) || path.starts_with("/System")
        || path.starts_with("/Library")
        || path.starts_with("/private")
        || path.starts_with("/usr")
        || path.starts_with("/bin")
        || path.starts_with("/sbin")
        || path.starts_with("/Applications")
        || path.starts_with("/opt")
}
fn canonical_roots(roots: Vec<String>) -> Result<Vec<PathBuf>, String> {
    if roots.is_empty() || roots.len() > 16 {
        return Err("Choose between 1 and 16 folders.".into());
    }
    let mut out: Vec<PathBuf> = Vec::new();
    for raw in roots {
        let path = fs::canonicalize(raw).map_err(|_| "A chosen folder is no longer accessible.")?;
        if !path.is_dir() || path.parent().is_none() || protected(&path) {
            return Err("Choose a personal folder, rather than a system location.".into());
        }
        if !out.iter().any(|p| path.starts_with(p)) {
            out.retain(|p| !p.starts_with(&path));
            out.push(path);
        }
    }
    Ok(out)
}
fn classify(
    path: &Path,
    meta: &fs::Metadata,
) -> Option<(&'static str, &'static str, &'static str, &'static str)> {
    let text = path.to_string_lossy();
    let dev = [
        "/.npm/_cacache/",
        "/.cache/uv/",
        "/.gradle/caches/",
        "/node_modules/",
        "/.next/",
    ];
    if dev.iter().any(|part| text.contains(part)) {
        return Some((
            "Developer caches",
            "Generated or downloaded development files; review only in this build.",
            "Your next build or install may require downloads and take longer.",
            "review",
        ));
    }
    if text.contains("/Library/Caches/") || text.contains("/.cache/") {
        return Some((
            "App caches",
            "A file in a cache location; its owner and safety require review.",
            "Cache cleanup is not enabled in this build.",
            "review",
        ));
    }
    if meta.len() < MIN_LARGE {
        return None;
    }
    let ext = path
        .extension()
        .and_then(|x| x.to_str())
        .unwrap_or("")
        .to_ascii_lowercase();
    let age = timestamp().saturating_sub(modified(meta));
    let restricted = path.components().any(|c| {
        let s = c.as_os_str().to_string_lossy();
        s.starts_with('.')
            || s == "Library"
            || s.ends_with(".app")
            || s.ends_with(".photoslibrary")
            || s.ends_with(".bundle")
    });
    if !restricted
        && ["dmg", "pkg", "zip"].contains(&ext.as_str())
        && age > 30 * 24 * 60 * 60 * 1000
    {
        return Some(("Old installers","A download larger than 100 MB, last modified over 30 days ago. Age alone does not mean it is unwanted.","Keep this file if you still need it. Moving it to Trash does not immediately free space.","trash"));
    }
    // Only ordinary personal files are eligible. App data, hidden directories and packages remain review-only.
    let restricted = path.components().any(|c| {
        let s = c.as_os_str().to_string_lossy();
        s.starts_with('.')
            || s == "Library"
            || s.ends_with(".app")
            || s.ends_with(".photoslibrary")
            || s.ends_with(".bundle")
    });
    Some((
        "Large files",
        "A local file larger than 100 MB. Review its contents before deciding.",
        "Moving this file to Trash does not immediately free storage.",
        if restricted { "review" } else { "trash" },
    ))
}
fn scan(roots: Vec<String>, backend: &Backend) -> Result<ScanResult, String> {
    let roots = canonical_roots(roots)?;
    let mut result = ScanResult {
        id: Uuid::new_v4().to_string(),
        complete: true,
        roots: roots
            .iter()
            .map(|x| x.to_string_lossy().into_owned())
            .collect(),
        ..Default::default()
    };
    let mut identities = HashSet::new();
    for root in roots {
        for entry in WalkDir::new(&root)
            .follow_links(false)
            .max_depth(64)
            .into_iter()
            .filter_entry(|e| {
                !protected(e.path())
                    && !e.file_type().is_symlink()
                    && !e
                        .path()
                        .components()
                        .any(|c| c.as_os_str().to_string_lossy().ends_with(".app"))
            })
        {
            if backend.cancelled.load(Ordering::SeqCst) {
                return Err("Scan cancelled. Your files are unchanged.".into());
            }
            if result.checked >= MAX_ENTRIES || result.candidates.len() >= 1000 {
                result.complete = false;
                break;
            }
            let entry = match entry {
                Ok(e) => e,
                Err(_) => {
                    result.skipped += 1;
                    continue;
                }
            };
            result.checked += 1;
            if entry.depth() == 64 && entry.file_type().is_dir() {
                result.skipped += 1;
            }
            if !entry.file_type().is_file() {
                continue;
            }
            let meta = match fs::symlink_metadata(entry.path()) {
                Ok(m) => m,
                Err(_) => {
                    result.skipped += 1;
                    continue;
                }
            };
            #[cfg(unix)]
            if meta.nlink() > 1 {
                result.skipped += 1;
                continue;
            }
            let (device, inode) = identity(&meta);
            if !identities.insert((device, inode)) {
                continue;
            }
            if let Some((category, reason, consequence, action)) = classify(entry.path(), &meta) {
                result.candidates.push(Candidate {
                    id: Uuid::new_v4().to_string(),
                    name: entry.file_name().to_string_lossy().into_owned(),
                    path: entry.path().to_string_lossy().into_owned(),
                    bytes: meta.len(),
                    category: category.into(),
                    reason: reason.into(),
                    consequence: consequence.into(),
                    action: action.into(),
                    modified: modified(&meta),
                    device,
                    inode,
                });
            }
        }
    }
    result.candidates.sort_by(|a, b| b.bytes.cmp(&a.bytes));
    if result.skipped > 0 {
        result.complete = false;
    }
    Ok(result)
}
#[tauri::command]
async fn scan_folders(roots: Vec<String>, state: State<'_, Shared>) -> Result<ScanResult, String> {
    let backend = state.inner().clone();
    if backend.active.swap(true, Ordering::SeqCst) {
        return Err("Another operation is running.".into());
    }
    backend.scanning.store(true, Ordering::SeqCst);
    backend.cancelled.store(false, Ordering::SeqCst);
    let worker = backend.clone();
    let outcome = tauri::async_runtime::spawn_blocking(move || scan(roots, &worker)).await;
    let result = outcome
        .map_err(|_| "The scan could not finish.".to_string())
        .and_then(|x| x);
    let result = result.and_then(|result| {
        *backend
            .result
            .lock()
            .map_err(|_| "Scan state unavailable".to_string())? = Some(result.clone());
        Ok(result)
    });
    backend.scanning.store(false, Ordering::SeqCst);
    backend.active.store(false, Ordering::SeqCst);
    result
}
#[tauri::command]
fn cancel_scan(state: State<'_, Shared>) {
    state.cancelled.store(true, Ordering::SeqCst);
}
fn validate(candidate: &Candidate, roots: &[String]) -> Result<PathBuf, String> {
    let path = PathBuf::from(&candidate.path);
    let canonical = fs::canonicalize(&path).map_err(|_| "File is no longer accessible")?;
    if canonical != path
        || protected(&canonical)
        || !roots
            .iter()
            .any(|r| canonical.starts_with(r) && canonical != Path::new(r))
    {
        return Err("File is outside the approved scope".into());
    }
    let mut ancestor = Some(path.as_path());
    while let Some(p) = ancestor {
        if fs::symlink_metadata(p)
            .map_err(|_| "Cannot validate file")?
            .file_type()
            .is_symlink()
        {
            return Err("Symbolic links cannot be acted on".into());
        }
        ancestor = p.parent();
    }
    let meta = fs::symlink_metadata(&canonical).map_err(|_| "Cannot inspect file")?;
    if !meta.is_file()
        || identity(&meta) != (candidate.device, candidate.inode)
        || meta.len() != candidate.bytes
        || modified(&meta) != candidate.modified
    {
        return Err("File changed since the scan; scan again".into());
    }
    #[cfg(unix)]
    if meta.nlink() > 1 {
        return Err("Shared files cannot be acted on".into());
    }
    Ok(canonical)
}
fn candidate_from(result: &ScanResult, id: &str) -> Result<Candidate, String> {
    result
        .candidates
        .iter()
        .find(|x| x.id == id)
        .cloned()
        .ok_or_else(|| "This scan item is no longer valid".into())
}
#[tauri::command]
fn reveal_candidate(id: String, scan_id: String, state: State<'_, Shared>) -> Result<(), String> {
    let guard = state.result.lock().map_err(|_| "Scan state unavailable")?;
    let result = guard
        .as_ref()
        .filter(|x| x.id == scan_id)
        .ok_or("Scan is stale; scan again")?;
    let item = candidate_from(result, &id)?;
    let path = validate(&item, &result.roots)?;
    Command::new("/usr/bin/open")
        .arg("-R")
        .arg(path)
        .spawn()
        .map_err(|_| "Could not open Finder")?;
    Ok(())
}
#[derive(Serialize, Default)]
struct Outcome {
    completed: usize,
    failed: usize,
    skipped: usize,
    bytes: u64,
}
fn write_record(file: &mut fs::File, value: serde_json::Value) -> Result<(), String> {
    writeln!(file, "{}", value).map_err(|_| "Cannot write operation journal")?;
    file.sync_all()
        .map_err(|_| "Cannot save operation journal".into())
}
fn process_candidates(
    result: &ScanResult,
    ids: Vec<String>,
    journal: &Path,
    move_to_trash: impl Fn(&Path) -> Result<(), String>,
) -> Result<Outcome, String> {
    let unique: HashSet<_> = ids.into_iter().collect();
    if unique.is_empty() || unique.len() > 1000 {
        return Err("Select between 1 and 1,000 files".into());
    }
    let items: Vec<_> = unique
        .iter()
        .map(|id| candidate_from(result, id))
        .collect::<Result<_, _>>()?;
    if items.iter().any(|x| x.action != "trash") {
        return Err("Only eligible personal files can be moved to Trash in this build".into());
    }
    let mut file = fs::OpenOptions::new()
        .write(true)
        .create_new(true)
        .open(journal)
        .map_err(|_| "Cannot create operation journal")?;
    write_record(
        &mut file,
        serde_json::json!({"state":"confirmed","time":timestamp(),"scan_id":result.id,"items":items.iter().map(|x|&x.id).collect::<Vec<_>>()}),
    )?;
    let mut outcome = Outcome::default();
    for item in items {
        write_record(
            &mut file,
            serde_json::json!({"id":item.id,"path":item.path,"state":"pending"}),
        )?;
        let status = match validate(&item, &result.roots) {
            Err(_) => {
                outcome.skipped += 1;
                "skipped"
            }
            Ok(path) => match move_to_trash(&path) {
                Ok(_) => {
                    outcome.completed += 1;
                    outcome.bytes += item.bytes;
                    "completed"
                }
                Err(_) => {
                    outcome.failed += 1;
                    "failed"
                }
            },
        };
        write_record(
            &mut file,
            serde_json::json!({"id":item.id,"state":status,"time":timestamp()}),
        )?;
    }
    write_record(
        &mut file,
        serde_json::json!({"state":"finished","outcome":outcome}),
    )?;
    Ok(outcome)
}
#[tauri::command]
async fn trash_candidates(
    ids: Vec<String>,
    scan_id: String,
    state: State<'_, Shared>,
    app: tauri::AppHandle,
) -> Result<Outcome, String> {
    let backend = state.inner().clone();
    if backend.active.swap(true, Ordering::SeqCst) {
        return Err("Another operation is running".into());
    }
    backend.executing.store(true, Ordering::SeqCst);
    let worker = backend.clone();
    let outcome = tauri::async_runtime::spawn_blocking(move || -> Result<Outcome, String> {
        let mut guard = worker.result.lock().map_err(|_| "Scan state unavailable")?;
        let result = guard
            .as_ref()
            .filter(|x| x.id == scan_id)
            .ok_or("Scan is stale; scan again")?;
        let dir = app
            .path()
            .app_data_dir()
            .map_err(|_| "History location unavailable")?;
        fs::create_dir_all(&dir).map_err(|_| "Cannot create history directory")?;
        let journal = dir.join(format!("operation-{}.jsonl", Uuid::new_v4()));
        let result = process_candidates(result, ids, &journal, |path| {
            use trash::macos::{DeleteMethod, TrashContextExtMacos};
            let mut context = trash::TrashContext::default();
            context.set_delete_method(DeleteMethod::NsFileManager);
            context
                .delete(path)
                .map_err(|_| "Could not move file to Trash".into())
        });
        // Invalidate even if journaling failed after a partial operation. Do not retry stale IDs.
        *guard = None;
        result
    })
    .await;
    backend.executing.store(false, Ordering::SeqCst);
    backend.active.store(false, Ordering::SeqCst);
    outcome.map_err(|_| "Cleanup interrupted. Inspect Trash before retrying.")?
}
#[derive(Serialize)]
struct Storage {
    total: u64,
    available: u64,
}
#[tauri::command]
fn storage_info() -> Result<Storage, String> {
    Ok(Storage {
        total: fs2::total_space("/Users").map_err(|_| "Cannot read storage")?,
        available: fs2::available_space("/Users").map_err(|_| "Cannot read storage")?,
    })
}
#[tauri::command]
fn open_startup() -> Result<(), String> {
    Command::new("/usr/bin/open")
        .arg("x-apple.systempreferences:com.apple.LoginItems-Settings.extension")
        .spawn()
        .map_err(|_| "Open System Settings → General → Login Items & Extensions")?;
    Ok(())
}
#[derive(Serialize)]
struct InstalledApp { id: String, name: String, bytes: u64, path: String }
#[tauri::command]
async fn list_apps() -> Result<Vec<InstalledApp>, String> {
    tauri::async_runtime::spawn_blocking(|| {
        let mut apps = Vec::new();
        let mut roots = vec![PathBuf::from("/Applications")];
        if let Some(home) = std::env::var_os("HOME") { roots.push(PathBuf::from(home).join("Applications")); }
        for root in roots {
            let Ok(entries) = fs::read_dir(root) else { continue; };
            for entry in entries.flatten() {
                let path = entry.path();
                if path.extension().and_then(|x|x.to_str()) != Some("app") || path.is_symlink() {continue;}
                let bytes = WalkDir::new(&path).follow_links(false).into_iter().filter_map(Result::ok).filter(|e|e.file_type().is_file()).filter_map(|e|e.metadata().ok()).map(|m|m.len()).sum();
                apps.push(InstalledApp { id: Uuid::new_v4().to_string(), name: path.file_stem().unwrap_or_default().to_string_lossy().into_owned(), bytes, path: path.to_string_lossy().into_owned() });
            }
        }
        apps.sort_by(|a,b| b.bytes.cmp(&a.bytes));
        Ok(apps)
    }).await.map_err(|_|"Could not inspect installed apps".to_string())?
}
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .manage(Arc::new(Backend::default()))
        .invoke_handler(tauri::generate_handler![
            scan_folders,
            cancel_scan,
            reveal_candidate,
            trash_candidates,
            storage_info,
            open_startup,
            list_apps
        ])
        .run(tauri::generate_context!())
        .expect("Unable to start Undust");
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn scan_respects_scope_and_keeps_personal_files_unchanged() {
        let root = tempfile::Builder::new()
            .prefix("undust-fixture-")
            .tempdir_in(std::env::current_dir().unwrap())
            .unwrap();
        let file = root.path().join("large.mov");
        let f = fs::File::create(&file).unwrap();
        f.set_len(MIN_LARGE + 1).unwrap();
        let secret = root.path().join(".ssh");
        fs::create_dir(&secret).unwrap();
        let s = fs::File::create(secret.join("key")).unwrap();
        s.set_len(MIN_LARGE + 2).unwrap();
        let out = scan(
            vec![root.path().to_str().unwrap().into()],
            &Backend::default(),
        )
        .unwrap();
        assert_eq!(out.candidates.len(), 1);
        assert_eq!(out.candidates[0].name, "large.mov");
        assert!(file.exists());
        assert!(secret.join("key").exists());
    }
    #[test]
    fn replacement_after_scan_is_rejected() {
        let root = tempfile::Builder::new()
            .prefix("undust-fixture-")
            .tempdir_in(std::env::current_dir().unwrap())
            .unwrap();
        let file = root.path().join("large.mov");
        fs::File::create(&file)
            .unwrap()
            .set_len(MIN_LARGE + 1)
            .unwrap();
        let out = scan(
            vec![root.path().to_str().unwrap().into()],
            &Backend::default(),
        )
        .unwrap();
        fs::remove_file(&file).unwrap();
        fs::write(&file, "replacement").unwrap();
        assert!(validate(&out.candidates[0], &out.roots).is_err());
    }
    #[test]
    fn symlink_escape_is_not_a_candidate() {
        let root = tempfile::Builder::new()
            .prefix("undust-fixture-")
            .tempdir_in(std::env::current_dir().unwrap())
            .unwrap();
        let outside = tempfile::Builder::new()
            .prefix("undust-fixture-")
            .tempdir_in(std::env::current_dir().unwrap())
            .unwrap();
        let file = outside.path().join("large.mov");
        fs::File::create(&file)
            .unwrap()
            .set_len(MIN_LARGE + 1)
            .unwrap();
        std::os::unix::fs::symlink(&file, root.path().join("escape.mov")).unwrap();
        let out = scan(
            vec![root.path().to_str().unwrap().into()],
            &Backend::default(),
        )
        .unwrap();
        assert!(out.candidates.is_empty());
    }
    #[test]
    fn cancellation_does_not_modify_files() {
        let root = tempfile::Builder::new()
            .prefix("undust-fixture-")
            .tempdir_in(std::env::current_dir().unwrap())
            .unwrap();
        fs::write(root.path().join("keep.txt"), "keep me").unwrap();
        let backend = Backend::default();
        backend.cancelled.store(true, Ordering::SeqCst);
        assert!(scan(vec![root.path().to_str().unwrap().into()], &backend).is_err());
        assert_eq!(
            fs::read_to_string(root.path().join("keep.txt")).unwrap(),
            "keep me"
        );
    }
    #[test]
    fn cleanup_only_moves_selected_unchanged_items_and_journals_outcomes() {
        let root = tempfile::Builder::new()
            .prefix("undust-fixture-")
            .tempdir_in(std::env::current_dir().unwrap())
            .unwrap();
        for name in ["selected.mov", "keep.mov", "changed.mov"] {
            fs::File::create(root.path().join(name))
                .unwrap()
                .set_len(MIN_LARGE + 1)
                .unwrap();
        }
        let result = scan(
            vec![root.path().to_str().unwrap().into()],
            &Backend::default(),
        )
        .unwrap();
        let ids = result
            .candidates
            .iter()
            .filter(|x| x.name != "keep.mov")
            .map(|x| x.id.clone())
            .collect();
        fs::write(root.path().join("changed.mov"), "changed after review").unwrap();
        let trash_dir = root.path().join("fixture-trash");
        fs::create_dir(&trash_dir).unwrap();
        let journal = root.path().join("journal.jsonl");
        let outcome = process_candidates(&result, ids, &journal, |path| {
            fs::rename(path, trash_dir.join(path.file_name().unwrap())).map_err(|e| e.to_string())
        })
        .unwrap();
        assert_eq!(outcome.completed, 1);
        assert_eq!(outcome.skipped, 1);
        assert_eq!(outcome.failed, 0);
        assert!(root.path().join("keep.mov").exists());
        assert!(root.path().join("changed.mov").exists());
        assert!(trash_dir.join("selected.mov").exists());
        let lines: Vec<serde_json::Value> = fs::read_to_string(journal)
            .unwrap()
            .lines()
            .map(|line| serde_json::from_str(line).unwrap())
            .collect();
        assert_eq!(lines.first().unwrap()["state"], "confirmed");
        assert_eq!(lines.last().unwrap()["state"], "finished");
    }
    #[test]
    fn unknown_ids_and_review_only_items_cannot_reach_mutation() {
        let root = tempfile::Builder::new()
            .prefix("undust-fixture-")
            .tempdir_in(std::env::current_dir().unwrap())
            .unwrap();
        let cache = root.path().join(".cache");
        fs::create_dir(&cache).unwrap();
        fs::write(cache.join("data"), "cache").unwrap();
        let result = scan(
            vec![root.path().to_str().unwrap().into()],
            &Backend::default(),
        )
        .unwrap();
        let journal = root.path().join("journal.jsonl");
        assert!(
            process_candidates(&result, vec!["unknown".into()], &journal, |_| panic!(
                "must not mutate"
            ))
            .is_err()
        );
        assert!(process_candidates(
            &result,
            vec![result.candidates[0].id.clone()],
            &journal,
            |_| panic!("must not mutate")
        )
        .is_err());
        assert!(!journal.exists());
    }
}
