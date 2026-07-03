const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");

const root = path.resolve(__dirname, "..");
const appUrl = pathToFileURL(path.join(root, "index.html")).href;
const progressKey = "suiyoukai-stamp-progress-v1";

const primaryTeacherIds = ["tsuneishi", "yuki", "koike", "yamashiro", "matsumoto"];
const extraTeacherCounts = {
  teacher_extra_01: 15,
  teacher_extra_02: 15,
};

const expectedFairies = [
  { src: "fairy-companion-suzuran-mouse.png", frame: "fairy-card-frame-special-sprout-v2.png" },
  { src: "fairy-companion-mokuren-white-cat.png", frame: "fairy-card-frame-camellia-v2.png" },
  { src: "fairy-companion-hinageshi-squirrel.png", frame: "fairy-card-frame-sunflower-v2.png" },
  { src: "fairy-companion-shirotsumekusa-toy-poodle.png", frame: "fairy-card-frame-special-sprout-v2.png" },
  { src: "fairy-companion-ran-turtle.png", frame: "fairy-card-frame-iris-v2.png" },
  { src: "fairy-companion-hanamizuki-crane.png", frame: "fairy-card-frame-sakura-v2.png" },
];

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

(async () => {
  const html = fs.readFileSync(path.join(__dirname, "stamp-catalog-2026-06-19.html"), "utf8");
  for (const text of [
    "追加先生A",
    "追加先生B",
    "すずらんのネズミ妖精",
    "木蓮の白猫妖精",
    "ひなげしのリス妖精",
    "白詰草のトイプードル妖精",
    "蘭の亀妖精",
    "花水木の鶴妖精",
  ]) {
    assert(html.includes(text), `完成品一覧HTMLに ${text} がありません。`);
  }

  for (const file of [
    "stamp-catalog-flowers-2026-06-19.png",
    "stamp-catalog-fairies-2026-06-19.png",
  ]) {
    assert(fs.existsSync(path.join(__dirname, file)), `完成品一覧画像がありません: ${file}`);
  }

  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const page = await browser.newPage({ viewport: { width: 430, height: 932 } });
  const opened = [];

  try {
    await page.goto(appUrl, { waitUntil: "load" });
    await page.evaluate(([key, primaryIds, extraCounts]) => {
      localStorage.setItem(key, JSON.stringify({
        schemaVersion: 2,
        stamps: {
          participationCount: 0,
          lastParticipationStampDate: "",
          teacherLessonCounts: {
            ...Object.fromEntries(primaryIds.map((teacherId) => [teacherId, 0])),
            ...extraCounts,
          },
          teacherCircleRounds: 0,
        },
        earned: { fairies: [], medals: [], titles: [], companions: [] },
        gameRecords: [],
        operationHistory: [],
      }));
    }, [progressKey, primaryTeacherIds, extraTeacherCounts]);
    await page.reload({ waitUntil: "load" });
    await page.waitForSelector("[data-profile-fairy-list] img", { state: "attached" });
    await page.evaluate(() => {
      document.querySelector("[data-profile-fairy-list]")?.classList.remove("is-collapsed");
    });

    for (const expected of expectedFairies) {
      await page.evaluate((src) => {
        const image = document.querySelector(`[data-profile-fairy-list] img[src*="${src}"]`);
        image?.click();
      }, expected.src);
      await page.locator("[data-fairy-viewer]:not([hidden])").waitFor({ state: "visible" });

      const viewer = await page.locator(".fairy-viewer-card").evaluate((card) => ({
        image: document.querySelector("[data-fairy-viewer-image]")?.getAttribute("src") ?? "",
        frame: card.style.getPropertyValue("--viewer-frame"),
        hidden: document.querySelector("[data-fairy-viewer]")?.hidden ?? true,
      }));

      assert(!viewer.hidden, `拡大ビューが開きません: ${expected.src}`);
      const viewerImage = viewer.image.replace(/\\/g, "/");
      const viewerFrame = viewer.frame.replace(/\\/g, "/");
      assert(viewerImage.includes("fairy-companion"), `拡大ビューの画像が妖精素材ではありません: ${viewer.image}`);
      assert(viewerFrame.includes(expected.frame), `既存フレームが付きません: ${expected.src} / ${viewer.frame}`);
      opened.push(viewer);
      await page.locator(".fairy-viewer-close").click();
    }

    console.log("ALL OK: extra teacher fairy viewer and catalog");
    console.log(JSON.stringify({ opened: opened.length }, null, 2));
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
