import * as fs from 'fs'
import { getXlsxStream } from 'xlstream';
import * as JSONStream from 'JSONStream';

interface XlsxRowData {
  formatted: {
    arr: string[];
  }
}

const XLSX_DIR = './xlsx';
const OUT_DIR = './json_all_others'

async function xlsxToJson(inFileDir: string, fileName: string, outFileDir?: string) {
  const path = `${inFileDir}/${fileName}`;
  const outFileName = fileName.replace(".xlsx", ".json");
  const outPath = outFileDir ? `${outFileDir}/${outFileName}` : `${inFileDir}/${outFileName}`;
  console.log(`Processing file: ${path} -> ${outPath}`);
  // Record start time
  const startTime = Date.now();


  const xlsxReadStream = await getXlsxStream({
    filePath: path,
    sheet: 0,
    ignoreEmpty: true,
  });
  const outStream = fs.createWriteStream(outPath);
  const jsonStream = JSONStream.stringify();
  jsonStream.pipe(outStream);

  xlsxReadStream.on("data", (X) => {
    const casted = X as XlsxRowData;
    const { formatted: { arr: row } } = casted;
    jsonStream.write(row);
  });

  xlsxReadStream.on("end", () => {
    // Record end time
    const endTime = Date.now();

    // End the json stream
    jsonStream.end();

    // Calculate and log the time taken
    const timeTaken = (endTime - startTime) / 1000;
    console.log(`Time taken: ${timeTaken} seconds (${outPath})`);
  });
}

async function main() {


  // Make the out directory if it doesn't exist
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR);
  }
  // List all xlsx files in the data directory
  const files = fs.readdirSync(XLSX_DIR).filter((file) => file.endsWith('.xlsx'));

  // Convert each xlsx file to json in parallel
  await Promise.all(files.map((file) => xlsxToJson(XLSX_DIR, file, OUT_DIR)));
}

main().catch(console.error);
