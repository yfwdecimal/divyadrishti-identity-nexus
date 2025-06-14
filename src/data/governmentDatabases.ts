
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

// US Government Database - FBI, DHS, etc.
export const usGovernmentDatabase: IdentityRecord[] = [
  {
    id: 'FBI-001',
    name: 'John Michael Smith',
    email: 'john.smith@fbi.gov',
    phone: '+1-555-0123',
    location: {
      city: 'Washington',
      state: 'District of Columbia',
      country: 'United States',
    },
    faceEmbedding: generateMockEmbedding(),
    source: 'FBI Database',
    database: 'US Government',
    lastUpdated: new Date('2024-01-15'),
    metadata: {
      ssnLastFour: '1234',
      securityClearance: 'Top Secret',
    },
  },
  {
    id: 'DHS-002',
    name: 'Maria Elena Garcia',
    email: 'maria.garcia@dhs.gov',
    phone: '+1-555-0456',
    location: {
      city: 'Los Angeles',
      state: 'California',
      country: 'United States',
    },
    faceEmbedding: generateMockEmbedding(),
    source: 'Department of Homeland Security',
    database: 'US Government',
    lastUpdated: new Date('2024-02-20'),
    metadata: {
      passportNumber: 'US123456789',
      travelHistory: 'International',
    },
  },
  // Generate more records
  ...Array.from({ length: 15 }, (_, i) => ({
    id: `US-${String(i + 3).padStart(3, '0')}`,
    name: `US Citizen ${i + 3}`,
    email: `citizen${i + 3}@usa.gov`,
    phone: `+1-555-${String(1000 + i).slice(1)}`,
    location: {
      city: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'][i % 5],
      state: ['New York', 'California', 'Illinois', 'Texas', 'Arizona'][i % 5],
      country: 'United States',
    },
    faceEmbedding: generateMockEmbedding(),
    source: ['FBI Database', 'DHS', 'Border Control', 'State Department'][i % 4],
    database: 'US Government',
    lastUpdated: new Date(2024, Math.floor(Math.random() * 3), Math.floor(Math.random() * 28) + 1),
  })),
];

// UK Government Database
export const ukGovernmentDatabase: IdentityRecord[] = [
  {
    id: 'UK-001',
    name: 'James William Thompson',
    email: 'james.thompson@gov.uk',
    phone: '+44-20-7946-0958',
    location: {
      city: 'London',
      state: 'England',
      country: 'United Kingdom',
    },
    faceEmbedding: generateMockEmbedding(),
    source: 'UK Home Office',
    database: 'UK Government',
    lastUpdated: new Date('2024-01-15'),
    metadata: {
      niNumber: 'AB123456C',
      passportNumber: 'GB987654321',
    },
  },
  // Generate more records
  ...Array.from({ length: 10 }, (_, i) => ({
    id: `UK-${String(i + 2).padStart(3, '0')}`,
    name: `UK Citizen ${i + 2}`,
    email: `citizen${i + 2}@gov.uk`,
    phone: `+44-20-${String(7000000 + i).slice(0, 8)}`,
    location: {
      city: ['London', 'Manchester', 'Birmingham', 'Glasgow', 'Liverpool'][i % 5],
      state: ['England', 'England', 'England', 'Scotland', 'England'][i % 5],
      country: 'United Kingdom',
    },
    faceEmbedding: generateMockEmbedding(),
    source: ['Home Office', 'DVLA', 'HMRC', 'Border Force'][i % 4],
    database: 'UK Government',
    lastUpdated: new Date(2024, Math.floor(Math.random() * 3), Math.floor(Math.random() * 28) + 1),
  })),
];

// Combined databases registry
export const governmentDatabases = {
  'Indian Government': indianGovernmentDatabase,
  'US Government': usGovernmentDatabase,
  'UK Government': ukGovernmentDatabase,
};

export const getAllDatabases = (): IdentityRecord[] => {
  return [
    ...indianGovernmentDatabase,
    ...usGovernmentDatabase,
    ...ukGovernmentDatabase,
  ];
};
