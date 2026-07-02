const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { PNG } = require("pngjs");

const root = path.resolve(__dirname, "..");
const backupDir = path.join(__dirname, "extra-teacher-placeholder-backup-2026-07-03");

const productionAssets = [
  { rel: "assets/suzuran-stamp-stage-05-list.png", kind: "flower", size: 1254 },
  { rel: "assets/mokuren-stamp-stage-05-list.png", kind: "flower", size: 1254 },
  { rel: "assets/hinageshi-stamp-stage-05-list.png", kind: "flower", size: 1254 },
  { rel: "assets/shirotsumekusa-stamp-stage-05-list.png", kind: "flower", size: 1254 },
  { rel: "assets/ran-stamp-stage-05-list.png", kind: "flower", size: 1254 },
  { rel: "assets/hanamizuki-stamp-stage-05-list.png", kind: "flower", size: 1254 },
  { rel: "assets/fairy-companion-suzuran-mouse.png", kind: "fairy", size: 1024 },
  { rel: "assets/fairy-companion-mokuren-white-cat.png", kind: "fairy", size: 1024 },
  { rel: "assets/fairy-companion-hinageshi-squirrel.png", kind: "fairy", size: 1024 },
  { rel: "assets/fairy-companion-shirotsumekusa-toy-poodle.png", kind: "fairy", size: 1024 },
  { rel: "assets/fairy-companion-ran-turtle.png", kind: "fairy", size: 1024 },
  { rel: "assets/fairy-companion-hanamizuki-crane.png", kind: "fairy", size: 1024 },
];

const participationAssets = [
  { rel: "assets/cosmos-stamp-stage-05-v2.png", kind: "participation-flower" },
  { rel: "assets/fuji-stamp-stage-05-list.png", kind: "participation-flower" },
  { rel: "assets/kinmokusei-stamp-stage-05-list.png", kind: "participation-flower" },
  { rel: "assets/fairy-apollon-flower-style.png", kind: "participation-fairy" },
  { rel: "assets/fairy-companion-fuji-lion.png", kind: "participation-fairy" },
  { rel: "assets/fairy-companion-kinmokusei-elephant.png", kind: "participation-fairy" },
];

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const hashFile = (filePath) => crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");

const readPng = (rel) => {
  const filePath = path.join(root, rel);
  assert(fs.existsSync(filePath), `素材がありません: ${rel}`);
  return {
    filePath,
    png: PNG.sync.read(fs.readFileSync(filePath)),
  };
};

const alphaStats = (png) => {
  let transparent = 0;
  let opaque = 0;
  for (let index = 3; index < png.data.length; index += 4) {
    if (png.data[index] === 0) transparent += 1;
    if (png.data[index] > 220) opaque += 1;
  }
  const total = png.width * png.height;
  return {
    transparentRatio: transparent / total,
    opaqueRatio: opaque / total,
  };
};

const checked = [];

for (const asset of productionAssets) {
  const { filePath, png } = readPng(asset.rel);
  assert(png.width === asset.size && png.height === asset.size, `${asset.rel} のサイズが想定外です: ${png.width}x${png.height}`);
  const stats = alphaStats(png);
  assert(stats.transparentRatio > 0.1, `${asset.rel} に透明余白がほとんどありません。`);
  assert(stats.opaqueRatio > 0.03, `${asset.rel} の本体が小さすぎる可能性があります。`);

  const backupPath = path.join(backupDir, path.basename(asset.rel));
  assert(fs.existsSync(backupPath), `旧仮素材バックアップがありません: ${path.basename(asset.rel)}`);
  assert(hashFile(filePath) !== hashFile(backupPath), `旧仮素材のままです: ${asset.rel}`);
  checked.push({ ...asset, width: png.width, height: png.height, transparentRatio: Number(stats.transparentRatio.toFixed(3)) });
}

for (const asset of participationAssets) {
  const { png } = readPng(asset.rel);
  const stats = alphaStats(png);
  assert(stats.transparentRatio > 0.05, `参加スタンプ素材に透明余白がほとんどありません: ${asset.rel}`);
  assert(!asset.rel.includes("docs/"), `参加スタンプがdocs配下を参照しています: ${asset.rel}`);
  checked.push({ ...asset, width: png.width, height: png.height, transparentRatio: Number(stats.transparentRatio.toFixed(3)) });
}

console.log("ALL OK: production assets are not placeholders");
console.log(JSON.stringify({ checked }, null, 2));
