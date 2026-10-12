// Restart only this project's session-only server, never a different listener.
const { spawn, execFileSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const pidFile = "/tmp/tide-stone-5204.pid";
const server = path.join(__dirname, "serve.cjs");
if (fs.existsSync(pidFile)) {
  const pid = Number(fs.readFileSync(pidFile, "utf8"));
  if (Number.isSafeInteger(pid) && pid > 1) {
    let command = "";
    try {
      command = execFileSync("ps", ["-p", String(pid), "-o", "command="], {
        encoding: "utf8",
      }).trim();
    } catch {}
    if (command.endsWith(server)) {
      try {
        process.kill(pid, "SIGTERM");
      } catch {}
    }
  }
}
const log = fs.openSync("/tmp/tide-stone-5204.log", "a");
// Delay only startup briefly so the old server can release its listening socket.
setTimeout(() => {
  const child = spawn(process.execPath, [server], {
    cwd: __dirname,
    detached: true,
    stdio: ["ignore", log, log],
  });
  child.unref();
  fs.writeFileSync(pidFile, String(child.pid));
  console.log(`Tide & Stone server PID ${child.pid}: http://127.0.0.1:5204`);
}, 250);
