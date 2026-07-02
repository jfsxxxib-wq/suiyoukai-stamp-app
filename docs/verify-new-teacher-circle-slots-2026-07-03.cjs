const assert = require("node:assert/strict");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..");
const pageUrl = pathToFileURL(path.join(root, "index.html")).href;

const newTeacherIds = ["teacher_extra_03", "teacher_extra_04", "teacher_extra_05"];
const extraTeacherCircleIds = [
  "teacher_extra_01",
  "teacher_extra_02",
  "teacher_extra_03",
  "teacher_extra_04",
  "teacher_extra_05",
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  await page.goto(pageUrl, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("[data-teacher='teacher_extra_05']");

  const structure = await page.evaluate(({ newTeacherIds, extraTeacherCircleIds }) => {
    const teacherTargets = window.stampRules.teacherFairy.targets.map((target) => target.teacherId);
    return {
      teacherCardCount: document.querySelectorAll("[data-teacher]").length,
      flowerGuideTargets: [...document.querySelectorAll("[data-flower-guide-target]")].map((button) => button.dataset.flowerGuideTarget),
      teacherTargets,
      teacherCircleIds: window.stampRules.teacherCircle.teacherIds,
      extraTeacherCircleIds: window.stampRules.extraTeacherCircle.teacherIds,
      newTeacherCards: newTeacherIds.map((id) => Boolean(document.querySelector(`[data-teacher="${id}"]`))),
      newTeacherTargets: newTeacherIds.map((id) => teacherTargets.includes(id)),
      newCircleMatches: JSON.stringify(window.stampRules.extraTeacherCircle.teacherIds) === JSON.stringify(extraTeacherCircleIds),
      templateHasCounts: newTeacherIds.map((id) => Object.hasOwn(window.userProgressTemplate.stamps.teacherLessonCounts, id)),
    };
  }, { newTeacherIds, extraTeacherCircleIds });

  assert.equal(structure.teacherCardCount, 10);
  assert.deepEqual(structure.newTeacherCards, [true, true, true]);
  assert.deepEqual(structure.newTeacherTargets, [true, true, true]);
  assert.deepEqual(structure.templateHasCounts, [true, true, true]);
  assert.deepEqual(structure.teacherCircleIds, ["tsuneishi", "yuki", "koike", "yamashiro", "matsumoto"]);
  assert.equal(structure.newCircleMatches, true);
  for (const id of extraTeacherCircleIds) {
    assert.ok(structure.flowerGuideTargets.includes(id), `missing flower guide target ${id}`);
  }

  const imageStatus = await page.evaluate(() =>
    [...document.querySelectorAll("img[src*='yamabuki'], img[src*='kingyosou'], img[src*='tsuyukusa']")]
      .map((img) => ({ src: img.getAttribute("src"), naturalWidth: img.naturalWidth }))
  );
  assert.ok(imageStatus.length >= 3);
  assert.ok(imageStatus.every((item) => item.naturalWidth > 0), JSON.stringify(imageStatus));

  await page.click("[data-library-owl-viewer]");
  await page.waitForSelector("[data-fairy-viewer]:not([hidden])");
  const owlViewerFrame = await page.locator("[data-fairy-viewer] .fairy-viewer-card").evaluate((card) =>
    getComputedStyle(card).getPropertyValue("--viewer-frame")
  );
  assert.match(owlViewerFrame, /fairy-card-frame/);
  await page.click("[data-fairy-viewer-close]");

  await page.click("[data-library-journal-keeper-viewer]");
  await page.waitForSelector("[data-fairy-viewer]:not([hidden])");
  const keeperViewer = await page.evaluate(() => ({
    image: document.querySelector("[data-fairy-viewer-image]")?.getAttribute("src"),
    name: document.querySelector("[data-fairy-viewer-name]")?.textContent,
    frame: getComputedStyle(document.querySelector("[data-fairy-viewer] .fairy-viewer-card")).getPropertyValue("--viewer-frame"),
  }));
  assert.match(keeperViewer.image, /library-journal-hedgehog-with-book/);
  assert.equal(keeperViewer.name, "冒険日誌の記録係");
  assert.match(keeperViewer.frame, /fairy-card-frame/);
  await page.click("[data-fairy-viewer-close]");

  const seededProgress = await page.evaluate(() => {
    const progress = JSON.parse(JSON.stringify(window.userProgressTemplate));
    progress.stamps.teacherLessonCounts.teacher_extra_03 = 5;
    progress.stamps.teacherLessonCounts.teacher_extra_04 = 5;
    progress.stamps.teacherLessonCounts.teacher_extra_05 = 5;
    localStorage.setItem("suiyoukai-stamp-progress-v1", JSON.stringify(progress));
    return progress;
  });
  assert.equal(seededProgress.stamps.teacherLessonCounts.teacher_extra_03, 5);

  await page.reload({ waitUntil: "domcontentloaded" });
  await page.click("[data-profile-toggle='fairies']");
  const newFairyImages = await page.evaluate(() =>
    [...document.querySelectorAll("[data-profile-fairy-list] img")]
      .map((img) => img.getAttribute("src"))
      .filter((src) => /yamabuki|kingyosou|tsuyukusa/.test(src))
  );
  assert.deepEqual(newFairyImages.sort(), [
    "assets/fairy-companion-kingyosou-rabbit.png",
    "assets/fairy-companion-tsuyukusa-otter.png",
    "assets/fairy-companion-yamabuki-shiba.png",
  ].sort());

  await page.click("[src='assets/fairy-companion-yamabuki-shiba.png']");
  await page.waitForSelector("[data-fairy-viewer]:not([hidden])");
  const fairyFrame = await page.locator("[data-fairy-viewer] .fairy-viewer-card").evaluate((card) =>
    getComputedStyle(card).getPropertyValue("--viewer-frame")
  );
  assert.match(fairyFrame, /fairy-card-frame/);

  await browser.close();
  console.log("new teacher circle slots verified");
})();
