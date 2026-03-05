#!/usr/bin/env tsx
import { readdir, stat } from 'fs/promises';
import { extname, join } from 'path';
import { getXlsxStream } from 'xlstream';
import { COLUMN_NAMES_TO_EXTRACT } from './fixture';

const args = process.argv.slice(2);

if (args.length === 0) {
  console.error('Usage: tsx inspect.ts <file1.xlsx> [file2.xlsx] [folder] ...');
  process.exit(1);
}

// Create a Set for O(1) lookup
const columnNamesToExtract = Object.keys(COLUMN_NAMES_TO_EXTRACT);

interface FileIssue {
  file: string;
  issue: string;
  missingColumns?: string[];
}

async function processFile(filePath: string): Promise<FileIssue | null> {
  try {
    const xlsxReadStream = await getXlsxStream({
      filePath,
      sheet: 0,
      ignoreEmpty: true,
    });

    return new Promise((resolve) => {
      let headers: string[] | null = null;
      
      xlsxReadStream.once('data', (data) => {
        headers = data.formatted.arr;
        const headersSet = new Set(headers);
        const missingColumns = columnNamesToExtract.filter(col => !headersSet.has(col));
        
        // Close the stream since we only need the first row
        xlsxReadStream.destroy();
        
        if (missingColumns.length > 0) {
          resolve({ file: filePath, issue: 'Missing required columns', missingColumns });
        } else {
          resolve(null); // No issues
        }
      });
      
      xlsxReadStream.once('error', (error) => {
        // Close the stream since we only need the first row
        xlsxReadStream.destroy();
        resolve({ file: filePath, issue: `Stream error: ${error.message}` });
      });
      
      xlsxReadStream.once('end', () => {
        // Close the stream since we only need the first row
        xlsxReadStream.destroy();
        if (!headers) {
          resolve({ file: filePath, issue: 'No data found in file' });
        }
      });
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { file: filePath, issue: `Error: ${message}` };
  }
}

async function getAllXlsxFiles(dirPath: string): Promise<string[]> {
  const files = await readdir(dirPath);
  return files
    .filter(file => ['.xlsx', '.xls'].includes(extname(file).toLowerCase()))
    .map(file => join(dirPath, file));
}

async function main() {
  const allFiles: string[] = [];
  
  // Collect all files
  for (const path of args) {
    try {
      const statInfo = await stat(path);
      
      if (statInfo.isDirectory()) {
        const xlsxFiles = await getAllXlsxFiles(path);
        allFiles.push(...xlsxFiles);
      } else if (statInfo.isFile()) {
        allFiles.push(path);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`Error accessing ${path}: ${message}`);
    }
  }
  
  if (allFiles.length === 0) {
    console.log('No XLSX files found');
    return;
  }
  
  console.log(`Checking ${allFiles.length} files...`);
  
  // Process all files concurrently
  const results = await Promise.all(allFiles.map(processFile));
  const issues = results.filter(result => result !== null) as FileIssue[];
  
  if (issues.length === 0) {
    console.log('✅ All files have required columns');
  } else {
    console.log(`\n❌ Found ${issues.length} files with issues:\n`);
    issues.forEach(issue => {
      console.log(`${issue.file}: ${issue.issue}`);
      if (issue.missingColumns) {
        console.log(`  Missing: ${issue.missingColumns.join(', ')}`);
      }
    });
  }
}

main().catch(console.error);
