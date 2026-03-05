import { RawLCADisclosure, RawLCADisclosureSchema } from "./types";

// Export RawLCADisclosure as RawLCARecord for backward compatibility
export type RawLCARecord = RawLCADisclosure;
import { getXlsxStream } from "xlstream";
import { COLUMN_NAMES_TO_EXTRACT } from "./fixture";

type ColumnMapping = Record<keyof RawLCADisclosure, number>;

export class Extract {
  /**
   * Creates a mapping from RawLCADisclosure fields to their column indices in the XLSX file
   * Throws if any of the required columns are not found
   */
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

  /**
   * Converts a row array to a RawLCADisclosure object using the column mapping
   * Validates the data using the Zod schema
   */
  private static rowToRawLCADisclosure(rawRow: any[], formattedRow: any[], columnMapping: ColumnMapping): RawLCADisclosure {
    const disclosure: any = {};
    
    for (const [field, columnIndex] of Object.entries(columnMapping)) {
      const row = field.endsWith('DATE') ? formattedRow : rawRow
      const value = row[columnIndex];
      disclosure[field] = value?.toString() ?? undefined;
    }
    
    // Validate using Zod schema
    const result = RawLCADisclosureSchema.safeParse(disclosure);
    if (!result.success) {
      throw new Error(`Row validation failed: ${result.error.message}, ${JSON.stringify(rawRow, null, 2)}`);
    }
    
    return result.data;
  }

  /**
   * For a given XLSX file path, extract RawLCADisclosures
   */
  static async extractData(filePath: string): Promise<RawLCADisclosure[]> {
    try {
      const xlsxReadStream = await getXlsxStream({
        filePath,
        sheet: 0,
        ignoreEmpty: true,
      });

      return new Promise((resolve, reject) => {
        const results: RawLCADisclosure[] = [];
        let columnMapping: ColumnMapping;
        let isFirstRow = true;

        xlsxReadStream.on('data', (data) => {
          const rawRow = data.raw.arr;
          const formattedRow = data.formatted.arr;

          if (isFirstRow) {
            try {
              columnMapping = this.createColumnMapping(rawRow);
              isFirstRow = false;
            } catch (error) {
              xlsxReadStream.destroy();
              reject(error);
              return;
            }
          } else {
            const disclosure = this.rowToRawLCADisclosure(rawRow, formattedRow, columnMapping);
            results.push(disclosure);
          }
        });

        xlsxReadStream.on('error', (error) => {
          xlsxReadStream.destroy();
          reject(new Error(`Stream error: ${error.message}`));
        });

        xlsxReadStream.on('end', () => {
          resolve(results);
        });
      });
    } catch (error) {
      throw new Error(`Failed to read XLSX file: ${(error as Error).message}`);
    }
  }

  /**
   * Stream XLSX rows and process them in fixed-size batches to limit memory usage.
   * Returns the total number of extracted data rows (excluding headers).
   */
  static async extractDataInBatches(
    filePath: string,
    onBatch: (batch: RawLCADisclosure[]) => Promise<void>,
    batchSize = 5000,
  ): Promise<number> {
    if (!Number.isInteger(batchSize) || batchSize <= 0) {
      throw new Error(`Invalid batchSize '${batchSize}'. Must be a positive integer.`);
    }

    try {
      const xlsxReadStream = await getXlsxStream({
        filePath,
        sheet: 0,
        ignoreEmpty: true,
      });

      return new Promise((resolve, reject) => {
        let columnMapping: ColumnMapping;
        let isFirstRow = true;
        let totalExtracted = 0;
        let batch: RawLCADisclosure[] = [];
        let streamEnded = false;
        let streamFailed = false;
        let processing = Promise.resolve();

        const fail = (error: Error): void => {
          if (streamFailed) {
            return;
          }
          streamFailed = true;
          xlsxReadStream.destroy(error);
          reject(error);
        };

        const scheduleBatchProcessing = (rows: RawLCADisclosure[]): void => {
          processing = processing
            .then(() => onBatch(rows))
            .catch((error) => {
              fail(error as Error);
            })
            .finally(() => {
              if (!streamFailed && !streamEnded) {
                xlsxReadStream.resume();
              }
            });
        };

        xlsxReadStream.on("data", (data) => {
          if (streamFailed) {
            return;
          }

          try {
            const rawRow = data.raw.arr;
            const formattedRow = data.formatted.arr;

            if (isFirstRow) {
              columnMapping = this.createColumnMapping(rawRow);
              isFirstRow = false;
              return;
            }

            const disclosure = this.rowToRawLCADisclosure(rawRow, formattedRow, columnMapping);
            totalExtracted += 1;
            batch.push(disclosure);

            if (batch.length >= batchSize) {
              const rows = batch;
              batch = [];
              xlsxReadStream.pause();
              scheduleBatchProcessing(rows);
            }
          } catch (error) {
            fail(error as Error);
          }
        });

        xlsxReadStream.on("error", (error) => {
          fail(new Error(`Stream error: ${error.message}`));
        });

        xlsxReadStream.on("end", () => {
          streamEnded = true;
          processing
            .then(async () => {
              if (streamFailed) {
                return;
              }
              if (batch.length > 0) {
                await onBatch(batch);
              }
              resolve(totalExtracted);
            })
            .catch((error) => {
              reject(error);
            });
        });
      });
    } catch (error) {
      throw new Error(`Failed to read XLSX file: ${(error as Error).message}`);
    }
  }
}
