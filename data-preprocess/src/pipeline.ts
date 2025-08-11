#!/usr/bin/env node
import { Extract } from './extract';
import { DataTransformer } from './transform';
import { DataLoader } from './load';
import { readdirSync } from 'fs';
import { join, extname } from 'path';

interface PipelineOptions {
  folderPath?: string;
  filePath?: string;
  clearDatabase?: boolean;
  showStats?: boolean;
}

interface FileResult {
  fileName: string;
  success: boolean;
  error?: string;
  recordCount?: number;
}

export class ETLPipeline {
  private loader: DataLoader;

  constructor() {
    this.loader = new DataLoader();
  }

  async run(options: PipelineOptions): Promise<void> {
    const {
      folderPath,
      filePath,
      clearDatabase = false,
      showStats = true,
    } = options;

    console.log('='.repeat(50));
    console.log(`🚀 Starting LCA Data ETL Pipeline ${filePath ? '(Single File)' : '(Batch Processing)'}`);
    console.log('='.repeat(50));

    const startTime = Date.now();
    const results: FileResult[] = [];

    try {
      // Connect to database
      await this.loader.connect();

      // Clear database if requested
      if (clearDatabase) {
        console.log('🗑️  Clearing existing database data...');
        await this.loader.clearAllData();
      }

      let files: string[] = [];
      let baseDir = '';

      if (filePath) {
        // Single file processing
        files = [filePath.split('/').pop() || ''];
        baseDir = filePath.substring(0, filePath.lastIndexOf('/'));
      } else if (folderPath) {
        // Batch processing - Get all Excel files from folder, sorted alphabetically
        files = readdirSync(folderPath)
          .filter(file => ['.xlsx', '.xls'].includes(extname(file).toLowerCase()))
          .sort();
        baseDir = folderPath;
      } else {
        console.log('❌ Error: Either folderPath or filePath must be provided');
        return;
      }

      if (files.length === 0) {
        console.log('⚠️  No Excel files found');
        return;
      }

      console.log(`📁 Found ${files.length} Excel file${files.length > 1 ? 's' : ''} to process`);
      console.log(`📋 File${files.length > 1 ? 's' : ''}: ${files.join(', ')}`);
      console.log('');

      // Process each file
      for (let i = 0; i < files.length; i++) {
        const fileName = files[i];
        const fullFilePath = filePath || join(baseDir, fileName);
        
        console.log(`📄 Processing file ${i + 1}/${files.length}: ${fileName}`);
        
        try {
          // EXTRACT: Get raw data from xlsx file
          console.log(`📥 EXTRACT: Reading LCA data from ${fileName}...`);
          const rawData = await Extract.extractData(fullFilePath);
          console.log(`✅ Extracted ${rawData.length} records`);

          // TRANSFORM: Process raw data
          console.log('🔄 TRANSFORM: Processing raw data...');
          const transformer = new DataTransformer();
          const transformedData = await transformer.transformData(rawData);
          console.log(`✅ Transformed data: ${transformedData.length} LCA disclosures`);

          // LOAD: Insert into database
          console.log('💾 LOAD: Inserting data into database...');
          await this.loader.addLCADisclosures(transformedData);
          console.log(`✅ ${fileName} completed successfully`);

          results.push({
            fileName,
            success: true,
            recordCount: transformedData.length
          });

        } catch (error) {
          console.error(`❌ Failed to process ${fileName}:`, error);
          results.push({
            fileName,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
        
        console.log(''); // Empty line for readability
      }

      // Show summary
      this.showSummary(results, startTime);

    } catch (error) {
      console.error('❌ ETL Pipeline failed:', error);
      throw error;
    } finally {
      await this.loader.disconnect();
    }
  }

  private showSummary(results: FileResult[], startTime: number): void {
    const duration = (Date.now() - startTime) / 1000;
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;
    const totalRecords = results.filter(r => r.success).reduce((sum, r) => sum + (r.recordCount || 0), 0);

    console.log('='.repeat(60));
    console.log('📊 BATCH PROCESSING SUMMARY');
    console.log('='.repeat(60));
    console.log(`⏱️  Total Duration: ${duration.toFixed(2)}s`);
    console.log(`📁 Total Files: ${results.length}`);
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Failed: ${failureCount}`);
    console.log(`📈 Total Records Processed: ${totalRecords.toLocaleString()}`);
    console.log('');

    if (successCount > 0) {
      console.log('✅ SUCCESSFUL FILES:');
      results.filter(r => r.success).forEach(result => {
        console.log(`   • ${result.fileName} (${result.recordCount?.toLocaleString()} records)`);
      });
      console.log('');
    }

    if (failureCount > 0) {
      console.log('❌ FAILED FILES:');
      results.filter(r => !r.success).forEach(result => {
        console.log(`   • ${result.fileName}: ${result.error}`);
      });
      console.log('');
    }

    if (failureCount === 0) {
      console.log('🎉 All files processed successfully!');
    } else {
      console.log(`⚠️  ${failureCount} file(s) failed processing`);
    }
    console.log('='.repeat(60));
  }

  async clearData(): Promise<void> {
    try {
      await this.loader.connect();
      await this.loader.clearAllData();
      console.log('Database cleared successfully');
    } catch (error) {
      console.error('Failed to clear data:', error);
      throw error;
    } finally {
      await this.loader.disconnect();
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';

  const pipeline = new ETLPipeline();

  try {
    switch (command) {
      case 'run':
        const pathArg = args[1];
        if (!pathArg) {
          console.error('Error: File or folder path is required');
          console.log('Usage: npm run dev run <file-or-folder-path> [--clear]');
          process.exit(1);
        }
        
        const clearFirst = args.includes('--clear');
        const isFile = extname(pathArg).toLowerCase() === '.xlsx' || extname(pathArg).toLowerCase() === '.xls';
        
        await pipeline.run({
          ...(isFile ? { filePath: pathArg } : { folderPath: pathArg }),
          clearDatabase: clearFirst,
          showStats: true,
        });
        break;

      case 'clear':
        await pipeline.clearData();
        break;

      case 'help':
        console.log(`
ETL Pipeline Commands:

  run <file-or-folder-path> [--clear]  Run the ETL pipeline on single file or all Excel files in folder
                                       - file-or-folder-path: path to XLSX file or folder containing XLSX files
                                       - --clear: clear database before loading

  clear                                Clear all data from database

  help                                 Show this help message

Examples:
  npm run dev run ./data.xlsx              # Process single Excel file
  npm run dev run ./data.xlsx --clear      # Clear database then process single Excel file
  npm run dev run ./raw_xlsx               # Process all Excel files in raw_xlsx folder
  npm run dev run ./raw_xlsx --clear       # Clear database then process all Excel files
  npm run dev clear                        # Clear all data
`);
        break;

      default:
        console.error(`Unknown command: ${command}`);
        console.log('Run "npm run dev help" for usage information');
        process.exit(1);
    }
  } catch (error) {
    console.error('Pipeline execution failed:', error);
    process.exit(1);
  }
}

// Run CLI if this file is executed directly
if (require.main === module) {
  main();
}
