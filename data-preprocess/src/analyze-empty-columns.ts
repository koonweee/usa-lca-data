import { getXlsxStream } from "xlstream";
import { COLUMN_NAMES_TO_EXTRACT } from "./fixture";
import { RawLCADisclosure } from "./types";

type ColumnMapping = Record<keyof RawLCADisclosure, number>;
type EmptyValueStats = Record<keyof RawLCADisclosure, {
  emptyCount: number;
  totalCount: number;
  percentage: number;
}>;

type AggregatedStats = {
  stats: EmptyValueStats;
  fileCount: number;
  filesProcessed: string[];
};

export class AnalyzeEmptyColumns {
  private static createColumnMapping(headers: string[]): ColumnMapping {
    const columnMapping: Partial<ColumnMapping> = {};
    const requiredColumns = Object.keys(COLUMN_NAMES_TO_EXTRACT) as Array<keyof RawLCADisclosure>;
    const missingColumns: string[] = [];

    for (const column of requiredColumns) {
      const columnIndex = headers.indexOf(column);
      if (columnIndex === -1) {
        missingColumns.push(column);
      } else {
        columnMapping[column] = columnIndex;
      }
    }

    if (missingColumns.length > 0) {
      throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
    }

    return columnMapping as ColumnMapping;
  }

  private static isEmptyValue(value: any): boolean {
    return value === null || 
           value === undefined || 
           value === '' || 
           (typeof value === 'string' && value.trim() === '');
  }

  static async analyzeEmptyColumns(filePath: string): Promise<EmptyValueStats> {
    try {
      const xlsxReadStream = await getXlsxStream({
        filePath,
        sheet: 0,
        ignoreEmpty: true,
      });

      return new Promise((resolve, reject) => {
        let columnMapping: ColumnMapping;
        let isFirstRow = true;
        const stats: EmptyValueStats = {} as EmptyValueStats;
        
        // Initialize stats for all columns
        const columns = Object.keys(COLUMN_NAMES_TO_EXTRACT) as Array<keyof RawLCADisclosure>;
        columns.forEach(column => {
          stats[column] = {
            emptyCount: 0,
            totalCount: 0,
            percentage: 0
          };
        });

        xlsxReadStream.on('data', (data) => {
          const row = data.formatted.arr;

          if (isFirstRow) {
            try {
              columnMapping = this.createColumnMapping(row);
              isFirstRow = false;
            } catch (error) {
              xlsxReadStream.destroy();
              reject(error);
              return;
            }
          } else {
            // Analyze each column for empty values
            for (const [field, columnIndex] of Object.entries(columnMapping)) {
              const column = field as keyof RawLCADisclosure;
              const value = row[columnIndex];
              
              stats[column].totalCount++;
              
              if (this.isEmptyValue(value)) {
                stats[column].emptyCount++;
              }
            }
          }
        });

        xlsxReadStream.on('error', (error) => {
          xlsxReadStream.destroy();
          reject(new Error(`Stream error: ${error.message}`));
        });

        xlsxReadStream.on('end', () => {
          // Calculate percentages
          columns.forEach(column => {
            const stat = stats[column];
            stat.percentage = stat.totalCount > 0 
              ? (stat.emptyCount / stat.totalCount) * 100 
              : 0;
          });
          
          resolve(stats);
        });
      });
    } catch (error) {
      throw new Error(`Failed to read XLSX file: ${error.message}`);
    }
  }

  static async analyzeMultipleFiles(filePaths: string[]): Promise<AggregatedStats> {
    const aggregatedStats: EmptyValueStats = {} as EmptyValueStats;
    const columns = Object.keys(COLUMN_NAMES_TO_EXTRACT) as Array<keyof RawLCADisclosure>;
    const filesProcessed: string[] = [];
    
    // Initialize aggregated stats
    columns.forEach(column => {
      aggregatedStats[column] = {
        emptyCount: 0,
        totalCount: 0,
        percentage: 0
      };
    });

    console.log(`Processing ${filePaths.length} files...\n`);

    for (const filePath of filePaths) {
      try {
        console.log(`📁 Processing: ${filePath}`);
        const fileStats = await this.analyzeEmptyColumns(filePath);
        
        // Aggregate the stats
        columns.forEach(column => {
          aggregatedStats[column].emptyCount += fileStats[column].emptyCount;
          aggregatedStats[column].totalCount += fileStats[column].totalCount;
        });
        
        filesProcessed.push(filePath);
        console.log(`✅ Completed: ${fileStats[columns[0]].totalCount.toLocaleString()} records\n`);
      } catch (error) {
        console.error(`❌ Error processing ${filePath}: ${error.message}\n`);
      }
    }

    // Calculate final percentages
    columns.forEach(column => {
      const stat = aggregatedStats[column];
      stat.percentage = stat.totalCount > 0 
        ? (stat.emptyCount / stat.totalCount) * 100 
        : 0;
    });

    return {
      stats: aggregatedStats,
      fileCount: filesProcessed.length,
      filesProcessed
    };
  }

  static printReport(stats: EmptyValueStats, identifier: string): void {
    console.log(`\n=== Empty Column Analysis for: ${identifier} ===\n`);
    
    const columns = Object.keys(stats) as Array<keyof RawLCADisclosure>;
    const columnsWithEmptyValues = columns.filter(column => stats[column].emptyCount > 0);
    
    if (columnsWithEmptyValues.length === 0) {
      console.log("✅ No empty values found in any of the extracted columns!");
      return;
    }
    
    console.log("📊 Columns with empty values:\n");
    
    // Sort by percentage of empty values (descending)
    columnsWithEmptyValues
      .sort((a, b) => stats[b].percentage - stats[a].percentage)
      .forEach(column => {
        const stat = stats[column];
        console.log(`${column}:`);
        console.log(`  Empty: ${stat.emptyCount.toLocaleString()} / ${stat.totalCount.toLocaleString()} (${stat.percentage.toFixed(2)}%)`);
        console.log();
      });
    
    // Summary
    const totalColumns = columns.length;
    const columnsWithData = columns.filter(column => stats[column].emptyCount === 0).length;
    
    console.log("📈 Summary:");
    console.log(`  Total columns analyzed: ${totalColumns}`);
    console.log(`  Columns with complete data: ${columnsWithData}`);
    console.log(`  Columns with empty values: ${columnsWithEmptyValues.length}`);
    
    if (stats[columns[0]].totalCount > 0) {
      console.log(`  Total records processed: ${stats[columns[0]].totalCount.toLocaleString()}`);
    }
  }

  static printAggregatedReport(aggregatedStats: AggregatedStats): void {
    console.log(`\n=== AGGREGATED ANALYSIS ACROSS ${aggregatedStats.fileCount} FILES ===\n`);
    
    console.log("📁 Files processed:");
    aggregatedStats.filesProcessed.forEach(file => {
      console.log(`  • ${file}`);
    });
    console.log();

    this.printReport(aggregatedStats.stats, `${aggregatedStats.fileCount} files combined`);
  }
}

// CLI usage - check if this script is being run directly
if (require.main === module) {
  const filePaths = process.argv.slice(2);
  
  if (filePaths.length === 0) {
    console.error("Usage:");
    console.error("  Single file:    tsx analyze-empty-columns.ts <path-to-xlsx-file>");
    console.error("  Multiple files: tsx analyze-empty-columns.ts <file1.xlsx> <file2.xlsx> ...");
    console.error("  Glob pattern:   tsx analyze-empty-columns.ts raw_xlsx/*.xlsx");
    process.exit(1);
  }
  
  if (filePaths.length === 1) {
    // Single file analysis
    const filePath = filePaths[0];
    console.log(`Analyzing empty columns in: ${filePath}`);
    
    AnalyzeEmptyColumns.analyzeEmptyColumns(filePath)
      .then(stats => {
        AnalyzeEmptyColumns.printReport(stats, filePath);
      })
      .catch(error => {
        console.error("Error:", error.message);
        process.exit(1);
      });
  } else {
    // Multiple files analysis
    console.log(`Analyzing empty columns across ${filePaths.length} files...`);
    
    AnalyzeEmptyColumns.analyzeMultipleFiles(filePaths)
      .then(aggregatedStats => {
        AnalyzeEmptyColumns.printAggregatedReport(aggregatedStats);
      })
      .catch(error => {
        console.error("Error:", error.message);
        process.exit(1);
      });
  }
}
