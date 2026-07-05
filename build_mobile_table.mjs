import fs from "node:fs/promises";
import { Workbook, SpreadsheetFile } from "@oai/artifact-tool";

const outDir = "./outputs/mobile-table";
await fs.mkdir(outDir, { recursive: true });

const wb = Workbook.create();
const ws = wb.worksheets.add("収支表");
ws.showGridLines = false;

ws.mergeCells("A1:D1");
ws.getRange("A1").values = [["初台 in 藤沢 2026　懇親会収支表"]];
ws.getRange("A1:D1").format = {
  fill: "#176B5B",
  font: { bold: true, color: "#FFFFFF", size: 16 },
  horizontalAlignment: "center",
  verticalAlignment: "center",
};
ws.getRange("A1:D1").format.rowHeightPx = 42;

ws.getRange("A2:D2").values = [["日付", "内容", "収入", "支出"]];
ws.getRange("A2:D2").format = {
  fill: "#DDF1EB",
  font: { bold: true, color: "#17483E" },
  horizontalAlignment: "center",
  verticalAlignment: "center",
  borders: { preset: "all", style: "thin", color: "#A7C8BE" },
};

const rows = [
  ["6/20（土）", "懇親会費（3,000円 × 12人）", 36000, null],
  ["6/20（土）", "酒類・食品・備品 ①", null, 9336],
  ["6/20（土）", "酒類・食品・備品 ②", null, 3532],
  ["6/20（土）", "酒類・食品・備品 ③", null, 4408],
  ["6/20（土）", "酒類・食品・備品 ④", null, 5429],
  ["6/20（土）", "酒類・食品・備品 ⑤", null, 2640],
  ["6/20（土）", "酒類・食品・備品 ⑥", null, 5400],
  ["6/20（土）", "酒類・食品・備品 ⑦", null, 7716],
  ["6/20（土）", "酒類・食品・備品 ⑧", null, 4510],
  ["6/21（日）", "懇親会費（3,000円 × 16人）", 48000, null],
  ["6/21（日）", "酒類・食品・備品 ①", null, 6402],
  ["6/21（日）", "酒類・食品・備品 ②", null, 10800],
  ["6/21（日）", "酒類・食品・備品 ③", null, 13530],
];
ws.getRange("A3:D15").values = rows;
ws.getRange("A3:D15").format = {
  font: { size: 11, color: "#24332F" },
  verticalAlignment: "center",
  borders: { preset: "all", style: "thin", color: "#D5E2DE" },
};
ws.getRange("A3:A15").format.horizontalAlignment = "center";
ws.getRange("C3:D15").format.numberFormat = "#,##0\"円\"";
ws.getRange("C3:D15").format.horizontalAlignment = "right";

for (let row = 3; row <= 15; row += 2) {
  ws.getRange(`A${row}:D${row}`).format.fill = "#F7FBF9";
}

ws.getRange("A16:B16").merge();
ws.getRange("A16").values = [["合計"]];
ws.getRange("C16").formulas = [["=SUM(C3:C15)"]];
ws.getRange("D16").formulas = [["=SUM(D3:D15)"]];
ws.getRange("A16:D16").format = {
  fill: "#E7F3EF",
  font: { bold: true, color: "#17483E", size: 12 },
  borders: { preset: "all", style: "medium", color: "#7FA99E" },
  verticalAlignment: "center",
};
ws.getRange("A16").format.horizontalAlignment = "center";
ws.getRange("C16:D16").format.numberFormat = "#,##0\"円\"";
ws.getRange("C16:D16").format.horizontalAlignment = "right";

ws.getRange("A17:B17").merge();
ws.getRange("A17").values = [["残金（収入 − 支出）"]];
ws.getRange("C17:D17").merge();
ws.getRange("C17").formulas = [["=C16-D16"]];
ws.getRange("A17:D17").format = {
  fill: "#FFF1BF",
  font: { bold: true, color: "#664D00", size: 13 },
  borders: { preset: "all", style: "medium", color: "#D6B94C" },
  verticalAlignment: "center",
};
ws.getRange("A17:B17").format.horizontalAlignment = "center";
ws.getRange("C17:D17").format.numberFormat = "#,##0\"円\"";
ws.getRange("C17:D17").format.horizontalAlignment = "right";

ws.getRange("A18:D18").merge();
ws.getRange("A18").values = [["確認済み：収入 84,000円 − 支出 73,703円 ＝ 残金 10,297円"]];
ws.getRange("A18:D18").format = {
  fill: "#F5F5F5",
  font: { italic: true, color: "#5C6562", size: 10 },
  horizontalAlignment: "center",
  verticalAlignment: "center",
  wrapText: true,
};

ws.getRange("A:A").format.columnWidthPx = 92;
ws.getRange("B:B").format.columnWidthPx = 238;
ws.getRange("C:D").format.columnWidthPx = 98;
ws.getRange("A2:D18").format.rowHeightPx = 27;
ws.getRange("A18:D18").format.rowHeightPx = 36;
ws.freezePanes.freezeRows(2);

const table = ws.tables.add("A2:D15", true, "ExpenseDetailTable");
table.style = "TableStyleMedium4";
table.showBandedRows = false;

const check = await wb.inspect({
  kind: "table",
  range: "収支表!A1:D18",
  include: "values,formulas",
  tableMaxRows: 20,
  tableMaxCols: 6,
  maxChars: 8000,
});
console.log(check.ndjson);
const errors = await wb.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 50 },
  summary: "formula errors",
});
console.log(errors.ndjson);

const preview = await wb.render({
  sheetName: "収支表",
  range: "A1:D18",
  scale: 1.5,
  format: "png",
});
await fs.writeFile(`${outDir}/初台in藤沢2026_スマホ用収支表.png`, new Uint8Array(await preview.arrayBuffer()));

const xlsx = await SpreadsheetFile.exportXlsx(wb);
await xlsx.save(`${outDir}/初台in藤沢2026_整理済み収支表.xlsx`);
process.exit(0);
