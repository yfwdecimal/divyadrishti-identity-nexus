
import { IdentityRecord } from '@/types/divyadrishti';

// Generate mock face embeddings (128-dimensional vectors)
const generateMockEmbedding = (): number[] => {
  return Array.from({ length: 128 }, () => Math.random() * 2 - 1);
};

export interface CSVParseResult {
  success: boolean;
  records: IdentityRecord[];
  errors: string[];
  totalRows: number;
  validRows: number;
}

export const parseCSVFile = async (file: File): Promise<CSVParseResult> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const csvText = event.target?.result as string;
        const result = parseCSVText(csvText);
        resolve(result);
      } catch (error) {
        resolve({
          success: false,
          records: [],
          errors: [`Failed to read file: ${error}`],
          totalRows: 0,
          validRows: 0,
        });
      }
    };
    
    reader.onerror = () => {
      resolve({
        success: false,
        records: [],
        errors: ['Failed to read file'],
        totalRows: 0,
        validRows: 0,
      });
    };
    
    reader.readAsText(file);
  });
};

const parseCSVText = (csvText: string): CSVParseResult => {
  const lines = csvText.split('\n').map(line => line.trim()).filter(line => line);
  
  if (lines.length === 0) {
    return {
      success: false,
      records: [],
      errors: ['File is empty'],
      totalRows: 0,
      validRows: 0,
    };
  }
  
  // Parse header
  const header = parseCSVRow(lines[0]);
  const dataLines = lines.slice(1);
  
  const records: IdentityRecord[] = [];
  const errors: string[] = [];
  
  // Expected columns (flexible mapping)
  const columnMapping = createColumnMapping(header);
  
  dataLines.forEach((line, index) => {
    try {
      const row = parseCSVRow(line);
      const record = parseRowToIdentityRecord(row, columnMapping, index + 2); // +2 for 1-based + header
      
      if (record) {
        records.push(record);
      } else {
        errors.push(`Row ${index + 2}: Unable to parse required fields`);
      }
    } catch (error) {
      errors.push(`Row ${index + 2}: ${error}`);
    }
  });
  
  return {
    success: errors.length === 0 || records.length > 0,
    records,
    errors,
    totalRows: dataLines.length,
    validRows: records.length,
  };
};

const parseCSVRow = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result.map(field => field.replace(/^"|"$/g, '')); // Remove surrounding quotes
};

const createColumnMapping = (header: string[]): Record<string, number> => {
  const mapping: Record<string, number> = {};
  
  header.forEach((col, index) => {
    const normalized = col.toLowerCase().trim();
    
    // Map common variations to standard fields
    if (normalized.includes('name') || normalized.includes('full_name') || normalized.includes('fullname')) {
      mapping.name = index;
    } else if (normalized.includes('email') || normalized.includes('mail')) {
      mapping.email = index;
    } else if (normalized.includes('phone') || normalized.includes('mobile') || normalized.includes('contact')) {
      mapping.phone = index;
    } else if (normalized.includes('city')) {
      mapping.city = index;
    } else if (normalized.includes('state')) {
      mapping.state = index;
    } else if (normalized.includes('country')) {
      mapping.country = index;
    } else if (normalized.includes('id') || normalized.includes('aadhaar') || normalized.includes('pan')) {
      mapping.id = index;
    } else if (normalized.includes('source') || normalized.includes('database')) {
      mapping.source = index;
    }
  });
  
  return mapping;
};

const parseRowToIdentityRecord = (
  row: string[], 
  mapping: Record<string, number>, 
  rowNumber: number
): IdentityRecord | null => {
  // Require at least name for a valid record
  if (!mapping.name || !row[mapping.name]?.trim()) {
    return null;
  }
  
  const name = row[mapping.name].trim();
  const email = mapping.email !== undefined ? row[mapping.email]?.trim() : '';
  const phone = mapping.phone !== undefined ? row[mapping.phone]?.trim() : '';
  const city = mapping.city !== undefined ? row[mapping.city]?.trim() : '';
  const state = mapping.state !== undefined ? row[mapping.state]?.trim() : '';
  const country = mapping.country !== undefined ? row[mapping.country]?.trim() || 'India' : 'India';
  const id = mapping.id !== undefined ? row[mapping.id]?.trim() : `IMPORTED-${Date.now()}-${rowNumber}`;
  const source = mapping.source !== undefined ? row[mapping.source]?.trim() || 'CSV Import' : 'CSV Import';
  
  return {
    id,
    name,
    email,
    phone,
    location: {
      city,
      state,
      country,
    },
    faceEmbedding: generateMockEmbedding(),
    source,
    database: 'Imported Data',
    lastUpdated: new Date(),
    metadata: {
      importedAt: new Date().toISOString(),
      csvRow: rowNumber,
    },
  };
};
