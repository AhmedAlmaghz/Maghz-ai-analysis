import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export interface DataRow {
  [key: string]: string | number | null;
}

export interface ParsedData {
  headers: string[];
  rows: DataRow[];
  columns: ColumnInfo[];
}

export interface ColumnInfo {
  name: string;
  type: 'numeric' | 'categorical' | 'date' | 'text';
  uniqueCount: number;
  nullCount: number;
  min?: number;
  max?: number;
  mean?: number;
  sample?: (string | number | null)[];
}

// Parse text (CSV/TSV/delimited) into structured data
export function parseTextData(text: string): ParsedData {
  const trimmed = text.trim();
  if (!trimmed) {
    return { headers: [], rows: [], columns: [] };
  }
  
  const result = Papa.parse(trimmed, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true,
    delimiter: '',
  });
  
  const rows: DataRow[] = (result.data as DataRow[]) || [];
  const headers = result.meta.fields || (rows[0] ? Object.keys(rows[0]) : []);
  const columns = analyzeColumns(headers, rows);
  
  return { headers, rows, columns };
}

// Parse Excel file
export async function parseExcelFile(file: File): Promise<ParsedData> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const firstSheet = workbook.SheetNames[0];
  const sheet = workbook.Sheets[firstSheet];
  const jsonData: DataRow[] = XLSX.utils.sheet_to_json(sheet, { defval: null });
  
  const headers = jsonData.length > 0 ? Object.keys(jsonData[0]) : [];
  const columns = analyzeColumns(headers, jsonData);
  
  return { headers, rows: jsonData, columns };
}

// Parse CSV file
export async function parseCSVFile(file: File): Promise<ParsedData> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => {
        const rows: DataRow[] = (results.data as DataRow[]) || [];
        const headers = results.meta.fields || (rows[0] ? Object.keys(rows[0]) : []);
        const columns = analyzeColumns(headers, rows);
        resolve({ headers, rows, columns });
      },
      error: (err: Error) => reject(err),
    });
  });
}

// Build a ParsedData object from already-structured rows (e.g. API/JSON results).
// Ensures column analysis runs so AI summaries and charts work on imported data.
export function buildParsedData(rows: DataRow[]): ParsedData {
  const headers = rows.length > 0 ? Object.keys(rows[0]) : [];
  const columns = analyzeColumns(headers, rows);
  return { headers, rows, columns };
}

// Analyze column types and stats
export function analyzeColumns(headers: string[], rows: DataRow[]): ColumnInfo[] {
  return headers.map((header) => {
    const values = rows.map((r) => r[header]);
    const nonNull = values.filter((v) => v !== null && v !== undefined && v !== '');
    const nullCount = values.length - nonNull.length;
    
    const numericValues = nonNull
      .map((v) => (typeof v === 'number' ? v : parseFloat(String(v))))
      .filter((n) => !isNaN(n));
    
    const uniqueValues = new Set(nonNull.map(String));
    
    let type: ColumnInfo['type'] = 'text';
    let min: number | undefined;
    let max: number | undefined;
    let mean: number | undefined;
    
    if (numericValues.length > nonNull.length * 0.7 && numericValues.length > 0) {
      type = 'numeric';
      min = Math.min(...numericValues);
      max = Math.max(...numericValues);
      mean = numericValues.reduce((a, b) => a + b, 0) / numericValues.length;
    } else if (uniqueValues.size <= Math.min(20, nonNull.length * 0.5)) {
      type = 'categorical';
    } else if (isDateColumn(nonNull)) {
      type = 'date';
    }
    
    return {
      name: header,
      type,
      uniqueCount: uniqueValues.size,
      nullCount,
      min,
      max,
      mean,
      sample: nonNull.slice(0, 5),
    };
  });
}

// Patterns that strongly indicate a date/datetime string.
const DATE_PATTERNS = [
  // ISO 8601: 2024-01-15, 2024-01-15T10:30:00, 2024-01-15T10:30:00Z
  /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2})?(\.\d+)?(Z|[+-]\d{2}:?\d{2})?)?$/,
  // DD/MM/YYYY or MM/DD/YYYY or DD-MM-YYYY
  /^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}$/,
  // Month name: Jan 2024, January 15 2024, 15 Jan 2024
  /^(\d{1,2}\s+)?(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2}(,?\s+\d{2,4})?$/i,
  // Year-Month: 2024-01, 2024/01
  /^\d{4}[\/\-]\d{2}$/,
  // Quarter: Q1 2024, 2024-Q3
  /^(Q[1-4]\s*\d{4}|\d{4}\s*-?\s*Q[1-4])$/i,
];

function isDateColumn(values: (string | number | null)[]): boolean {
  if (values.length === 0) return false;
  // Sample up to 20 values for better accuracy
  const sample = values.slice(0, 20);
  let dateCount = 0;
  for (const v of sample) {
    if (typeof v === 'number') continue;
    const s = String(v).trim();
    if (!s) continue;
    const matchesPattern = DATE_PATTERNS.some((re) => re.test(s));
    if (matchesPattern) {
      const d = new Date(s);
      if (!isNaN(d.getTime())) {
        dateCount++;
        continue;
      }
    }
    // Fallback: try parsing directly (catches locale-specific formats)
    const d = new Date(s);
    if (!isNaN(d.getTime()) && s.length >= 6) {
      dateCount++;
    }
  }
  return dateCount > sample.length * 0.5;
}

// Build a data summary for AI
export function buildDataSummary(data: ParsedData): string {
  const { rows, columns } = data;
  
  let summary = `عدد الصفوف: ${rows.length}\n`;
  summary += `عدد الأعمدة: ${columns.length}\n\n`;
  summary += `الأعمدة:\n`;
  
  for (const col of columns) {
    summary += `- "${col.name}" (${col.type}): ${col.uniqueCount} قيمة فريدة، ${col.nullCount} قيم فارغة`;
    if (col.type === 'numeric') {
      summary += `، المدى: ${col.min?.toFixed(2)} إلى ${col.max?.toFixed(2)}، المتوسط: ${col.mean?.toFixed(2)}`;
    }
    if (col.sample && col.sample.length > 0) {
      summary += `\n  أمثلة: ${col.sample.slice(0, 3).join(', ')}`;
    }
    summary += '\n';
  }
  
  summary += `\nأول 15 صف (JSON):\n`;
  summary += JSON.stringify(rows.slice(0, 15), null, 2);
  
  return summary;
}

// Get top N values for categorical
export function getTopCategories(data: ParsedData, column: string, topN = 10): { name: string; value: number }[] {
  const counts = new Map<string, number>();
  for (const row of data.rows) {
    const v = row[column];
    if (v !== null && v !== undefined && v !== '') {
      const key = String(v);
      counts.set(key, (counts.get(key) || 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, topN);
}

// Numeric column stats per category
export function getNumericByCategory(
  data: ParsedData,
  categoryCol: string,
  numericCol: string,
  agg: 'sum' | 'avg' = 'sum'
): { name: string; value: number }[] {
  const map = new Map<string, { sum: number; count: number }>();
  for (const row of data.rows) {
    const cat = String(row[categoryCol] ?? '');
    const num = Number(row[numericCol]);
    if (!cat || cat === 'null' || isNaN(num)) continue;
    const curr = map.get(cat) || { sum: 0, count: 0 };
    curr.sum += num;
    curr.count += 1;
    map.set(cat, curr);
  }
  return Array.from(map.entries())
    .map(([name, { sum, count }]) => ({
      name: name.length > 20 ? name.slice(0, 18) + '…' : name,
      value: agg === 'avg' ? sum / count : sum,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 12);
}

// Time series aggregation (auto-detect date column)
export function buildTimeSeries(
  data: ParsedData,
  numericCol: string
): { name: string; value: number }[] {
  const dateCol = data.columns.find((c) => c.type === 'date')?.name;
  if (!dateCol) return [];
  
  const map = new Map<string, { sum: number; count: number }>();
  for (const row of data.rows) {
    const d = new Date(String(row[dateCol]));
    if (isNaN(d.getTime())) continue;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const num = Number(row[numericCol]);
    if (isNaN(num)) continue;
    const curr = map.get(key) || { sum: 0, count: 0 };
    curr.sum += num;
    curr.count += 1;
    map.set(key, curr);
  }
  
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, { sum }]) => ({ name, value: Math.round(sum * 100) / 100 }));
}

// Simple linear regression for forecast
export function linearForecast(values: number[], stepsAhead: number): number[] {
  if (values.length < 2) return Array(stepsAhead).fill(values[0] ?? 0);
  const n = values.length;
  const xs = values.map((_, i) => i);
  const meanX = xs.reduce((a, b) => a + b, 0) / n;
  const meanY = values.reduce((a, b) => a + b, 0) / n;
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - meanX) * (values[i] - meanY);
    den += (xs[i] - meanX) ** 2;
  }
  const slope = den === 0 ? 0 : num / den;
  const intercept = meanY - slope * meanX;
  const forecast: number[] = [];
  for (let i = 0; i < stepsAhead; i++) {
    const y = slope * (n + i) + intercept;
    forecast.push(Math.round(y * 100) / 100);
  }
  return forecast;
}
