
import { IdentityRecord } from '@/types/divyadrishti';

// Generate mock face embeddings (128-dimensional vectors)
const generateMockEmbedding = (): number[] => {
  return Array.from({ length: 128 }, () => Math.random() * 2 - 1);
};

// Indian Government Database - Aadhaar & Election Commission
export const indianGovernmentDatabase: IdentityRecord[] = [
  {
    id: 'AADHAAR-001',
    name: 'Raj Kumar Singh',
    email: 'raj.kumar@gmail.com',
    phone: '+91-9876543210',
    location: {
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
    },
    faceEmbedding: generateMockEmbedding(),
    source: 'Aadhaar Database',
    database: 'Indian Government',
    lastUpdated: new Date('2024-01-15'),
    metadata: {
      aadhaarNumber: '****-****-1234',
      voterIdNumber: 'MVR123456789',
    },
  },
  {
    id: 'VOTER-002',
    name: 'Priya Sharma',
    email: 'priya.sharma@outlook.com',
    phone: '+91-9123456789',
    location: {
      city: 'Delhi',
      state: 'Delhi',
      country: 'India',
    },
    faceEmbedding: generateMockEmbedding(),
    source: 'Election Commission',
    database: 'Indian Government',
    lastUpdated: new Date('2024-02-20'),
    metadata: {
      voterIdNumber: 'DLI987654321',
      constituencyCode: 'DL-05',
    },
  },
  {
    id: 'PAN-003',
    name: 'Amit Patel',
    email: 'amit.patel@company.in',
    phone: '+91-8765432109',
    location: {
      city: 'Ahmedabad',
      state: 'Gujarat',
      country: 'India',
    },
    faceEmbedding: generateMockEmbedding(),
    source: 'Income Tax Department',
    database: 'Indian Government',
    lastUpdated: new Date('2024-03-10'),
    metadata: {
      panNumber: 'ABCDE1234F',
      gstNumber: '24ABCDE1234F1Z5',
    },
  },
  // Generate more records
  ...Array.from({ length: 20 }, (_, i) => ({
    id: `IND-${String(i + 4).padStart(3, '0')}`,
    name: `Indian Citizen ${i + 4}`,
    email: `citizen${i + 4}@india.gov.in`,
    phone: `+91-${String(9000000000 + i).slice(0, 10)}`,
    location: {
      city: ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata'][i % 5],
      state: ['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'West Bengal'][i % 5],
      country: 'India',
    },
    faceEmbedding: generateMockEmbedding(),
    source: ['Aadhaar Database', 'Election Commission', 'Passport Office', 'Income Tax'][i % 4],
    database: 'Indian Government',
    lastUpdated: new Date(2024, Math.floor(Math.random() * 3), Math.floor(Math.random() * 28) + 1),
  })),
];

// Store for dynamically imported records
export let importedRecords: IdentityRecord[] = [];

// Function to add imported records
export const addImportedRecords = (records: IdentityRecord[]) => {
  importedRecords = [...importedRecords, ...records];
  console.log(`Added ${records.length} imported records. Total imported: ${importedRecords.length}`);
};

// Function to clear imported records
export const clearImportedRecords = () => {
  importedRecords = [];
  console.log('Cleared all imported records');
};

// Combined databases registry (only Indian now)
export const governmentDatabases = {
  'Indian Government': indianGovernmentDatabase,
};

export const getAllDatabases = (): IdentityRecord[] => {
  return [
    ...indianGovernmentDatabase,
    ...importedRecords,
  ];
};

export const getImportedRecords = (): IdentityRecord[] => {
  return importedRecords;
};
