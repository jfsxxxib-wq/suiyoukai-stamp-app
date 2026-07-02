const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const assetsDir = path.join(root, "assets");
const scriptPath = path.join(root, "script.js");
const rulesPath = path.join(root, "stamp-rules.js");

const requiredAssets = [
  "suzuran-stamp-stage-05-list.png",
  "mokuren-stamp-stage-05-list.png",
  "hinageshi-stamp-stage-05-list.png",
  "shirotsumekusa-stamp-stage-05-list.png",
  "ran-stamp-stage-05-list.png",
  "hanamizuki-stamp-stage-05-list.png",
  "fairy-companion-suzuran-mouse.png",
  "fairy-companion-mokuren-white-cat.png",
  "fairy-companion-hinageshi-squirrel.png",
  "fairy-companion-shirotsumekusa-toy-poodle.png",
  "fairy-companion-ran-turtle.png",
  "fairy-companion-hanamizuki-crane.png",
];

const script = fs.readFileSync(scriptPath, "utf8");
const rules = fs.readFileSync(rulesPath, "utf8");

const missingFiles = requiredAssets.filter((asset) => !fs.existsSync(path.join(assetsDir, asset)));
const missingReferences = requiredAssets.filter((asset) => !script.includes(asset) && !rules.includes(asset));

if (missingFiles.length > 0 || missingReferences.length > 0) {
  console.error(JSON.stringify({ missingFiles, missingReferences }, null, 2));
  process.exitCode = 1;
} else {
  console.log(`ALL OK: ${requiredAssets.length} extra teacher production asset slots`);
}
