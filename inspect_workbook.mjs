import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const input = await FileBlob.load("./初台in藤沢懇親会.xlsx");
const workbook = await SpreadsheetFile.importXlsx(input);

const overview = await workbook.inspect({
  kind: "workbook,sheet,table,drawing",
  maxChars: 12000,
  tableMaxRows: 12,
  tableMaxCols: 12,
  tableMaxCellChars: 120,
});
console.log(overview.ndjson);

for (const sheet of workbook.worksheets.items) {
  const used = sheet.getUsedRange();
  if (!used) continue;
  const region = await workbook.inspect({
    kind: "region",
    sheetId: sheet.name,
    range: used.address,
    maxChars: 10000,
    tableMaxRows: 30,
    tableMaxCols: 20,
    tableMaxCellChars: 160,
  });
  console.log(region.ndjson);
}
