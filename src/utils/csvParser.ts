
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
        console.log('CSV file content loaded, size:', csvText.length, 'characters');
        const result = parseCSVText(csvText);
        resolve(result);
      } catch (error) {
        console.error('Error reading CSV file:', error);
        resolve({
          success: false,
          records: [],
          errors: [`Failed to read file: ${error instanceof Error ? error.message : String(error)}`],
          totalRows: 0,
          validRows: 0,
        });
      }
    };
    
    reader.onerror = () => {
      console.error('FileReader error');
      resolve({
        success: false,
        records: [],
        errors: ['Failed to read file - FileReader error'],
        totalRows: 0,
        validRows: 0,
      });
    };
    
    reader.readAsText(file, 'UTF-8');
  });
};

const parseCSVText = (csvText: string): CSVParseResult => {
  if (!csvText || csvText.trim().length === 0) {
    return {
      success: false,
      records: [],
      errors: ['File is empty or contains no data'],
      totalRows: 0,
      validRows: 0,
    };
  }

  // Normalize line endings and split into lines
  const lines = csvText
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
  
  if (lines.length === 0) {
    return {
      success: false,
      records: [],
      errors: ['File contains no valid lines'],
      totalRows: 0,
      validRows: 0,
    };
  }
  
  console.log(`Processing ${lines.length} lines from CSV`);
  
  // Parse header
  const header = parseCSVRow(lines[0]);
  console.log('CSV Headers:', header);
  
  if (header.length === 0) {
    return {
      success: false,
      records: [],
      errors: ['No valid headers found in CSV'],
      totalRows: 0,
      validRows: 0,
    };
  }
  
  const dataLines = lines.slice(1);
  const records: IdentityRecord[] = [];
  const errors: string[] = [];
  
  // Create column mapping
  const columnMapping = createColumnMapping(header);
  console.log('Column mapping:', columnMapping);
  
  if (Object.keys(columnMapping).length === 0) {
    errors.push('No recognizable columns found. Expected columns like: name, email, phone, city, state, country');
  }
  
  dataLines.forEach((line, index) => {
    try {
      const row = parseCSVRow(line);
      if (row.length === 0) {
        errors.push(`Row ${index + 2}: Empty row`);
        return;
      }
      
      const record = parseRowToIdentityRecord(row, columnMapping, index + 2);
      
      if (record) {
        records.push(record);
        console.log(`Parsed record ${index + 2}:`, record.name);
      } else {
        errors.push(`Row ${index + 2}: Unable to parse - missing required fields (name)`);
      }
    } catch (error) {
      errors.push(`Row ${index + 2}: ${error instanceof Error ? error.message : String(error)}`);
    }
  });
  
  console.log(`Successfully parsed ${records.length} records out of ${dataLines.length} data rows`);
  
  return {
    success: records.length > 0,
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
  let i = 0;
  
  while (i < line.length) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Handle escaped quotes
        current += '"';
        i += 2;
        continue;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
      i++;
      continue;
    } else {
      current += char;
    }
    i++;
  }
  
  result.push(current.trim());
  return result.map(field => {
    // Remove surrounding quotes if present
    if (field.startsWith('"') && field.endsWith('"')) {
      return field.slice(1, -1);
    }
    return field;
  });
};

const createColumnMapping = (header: string[]): Record<string, number> => {
  const mapping: Record<string, number> = {};
  
  header.forEach((col, index) => {
    const normalized = col.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
    
    // Map common variations to standard fields
    if (normalized.includes('name') || normalized.includes('fullname') || normalized.includes('firstname') || normalized.includes('lastname')) {
      mapping.name = index;
    } else if (normalized.includes('email') || normalized.includes('mail') || normalized.includes('emailaddress')) {
      mapping.email = index;
    } else if (normalized.includes('phone') || normalized.includes('mobile') || normalized.includes('contact') || normalized.includes('phonenumber')) {
      mapping.phone = index;
    } else if (normalized.includes('city') || normalized.includes('town')) {
      mapping.city = index;
    } else if (normalized.includes('state') || normalized.includes('province')) {
      mapping.state = index;
    } else if (normalized.includes('country') || normalized.includes('nation')) {
      mapping.country = index;
    } else if (normalized.includes('id') || normalized.includes('aadhaar') || normalized.includes('pan') || normalized.includes('userid')) {
      mapping.id = index;
    } else if (normalized.includes('source') || normalized.includes('database') || normalized.includes('origin')) {
      mapping.source = index;
    } else if (normalized.includes('image') || normalized.includes('photo') || normalized.includes('picture') || normalized.includes('face') || normalized.includes('imageurl')) {
      mapping.image = index;
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
  const nameIndex = mapping.name;
  if (nameIndex === undefined || !row[nameIndex]?.trim()) {
    return null;
  }
  
  const name = row[nameIndex].trim();
  const email = mapping.email !== undefined && row[mapping.email] ? row[mapping.email].trim() : '';
  const phone = mapping.phone !== undefined && row[mapping.phone] ? row[mapping.phone].trim() : '';
  const city = mapping.city !== undefined && row[mapping.city] ? row[mapping.city].trim() : '';
  const state = mapping.state !== undefined && row[mapping.state] ? row[mapping.state].trim() : '';
  const country = mapping.country !== undefined && row[mapping.country] ? row[mapping.country].trim() || 'India' : 'India';
  const id = mapping.id !== undefined && row[mapping.id] ? row[mapping.id].trim() : `IMPORTED-${Date.now()}-${rowNumber}`;
  const source = mapping.source !== undefined && row[mapping.source] ? row[mapping.source].trim() || 'CSV Import' : 'CSV Import';
  const imageUrl = mapping.image !== undefined && row[mapping.image] ? row[mapping.image].trim() : '';
  
  return {
    id,
    name,
    email: email || undefined,
    phone: phone || undefined,
    location: {
      city: city || undefined,
      state: state || undefined,
      country,
    },
    faceImageUrl: imageUrl || undefined,
    faceEmbedding: generateMockEmbedding(),
    source,
    database: 'Imported Data',
    lastUpdated: new Date(),
    metadata: {
      importedAt: new Date().toISOString(),
      csvRow: rowNumber,
      originalData: row.join(','), // Keep original row for debugging
    },
  };
};
