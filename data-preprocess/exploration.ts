// Load all JSON files in the ./json directory, group them by YEAR in name

import * as fs from 'fs';

const PATH = './json_all_others';

const jsonFiles = fs.readdirSync(PATH).filter(file => file.endsWith('.json'));

const yearToFileMap: Map<string, string[]> = new Map();

jsonFiles.forEach(file => {
    const year = file.split("_FY")[1].split("_")[0];
    if (!yearToFileMap.has(year)) {
        yearToFileMap.set(year, []);
    }
    yearToFileMap.get(year)?.push(file);
});

console.log(yearToFileMap);

// Get the first file of each year, and print the header (0th row)
yearToFileMap.forEach((files, year) => {
    const firstFile = files[0];
    const data = JSON.parse(fs.readFileSync(`${PATH}/${firstFile}`, 'utf-8'));
    console.log(`For year ${year}:`);
    console.log('index : header : sample data');
    data[0].forEach((header: string, index: number) => {
        console.log(`${index} : ${header} : ${data[1][index]}`);
    });
    console.log();
});
