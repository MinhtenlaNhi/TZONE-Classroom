const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const root = path.join(__dirname, "..");
const dist = path.join(root, "client", "dist");

if (fs.existsSync(dist)) {
  process.exit(0);
}

console.log("[ensure-client-build] client/dist missing — running npm run build");
try {
  execSync("npm run build", {
    cwd: root,
    stdio: "inherit",
    env: {
      ...process.env,
      NPM_CONFIG_PRODUCTION: "false",
    },
  });
} catch {
  process.exit(1);
}
