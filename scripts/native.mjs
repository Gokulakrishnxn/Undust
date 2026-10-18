import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join, delimiter } from "node:path";
import { spawn, spawnSync } from "node:child_process";
const candidates = [
  join(homedir(), ".cargo", "bin"),
  join(
    homedir(),
    ".rustup",
    "toolchains",
    `stable-${process.arch === "arm64" ? "aarch64" : "x86_64"}-apple-darwin`,
    "bin",
  ),
];
const env = { ...process.env };
if (spawnSync("cargo", ["--version"], { stdio: "ignore" }).status !== 0) {
  const dir = candidates.find((p) => existsSync(join(p, "cargo")));
  if (!dir) {
    console.error(
      "Rust is required. Install the stable Rust toolchain, then retry.",
    );
    process.exit(1);
  }
  env.PATH = `${dir}${delimiter}${env.PATH ?? ""}`;
}
const [mode, ...args] = process.argv.slice(2);
const cmd = mode === "test" ? "cargo" : process.execPath;
const commandArgs =
  mode === "test"
    ? ["test", "--manifest-path", "src-tauri/Cargo.toml", "--lib", ...args]
    : [join("node_modules", "@tauri-apps", "cli", "tauri.js"), ...args];
const child = spawn(cmd, commandArgs, { env, stdio: "inherit" });
child.on("error", (e) => {
  console.error(e.message);
  process.exit(1);
});
child.on("exit", (code) => process.exit(code ?? 1));
