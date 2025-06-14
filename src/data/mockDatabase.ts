
import { IdentityRecord } from '@/types/divyadrishti';

// Generate mock face embeddings (128-dimensional vectors)
const generateMockEmbedding = (): number[] => {
  return Array.from({ length: 128 }, () => Math.random() * 2 - 1);
};

// Mock identity database for testing
export const mockIdentityDatabase: IdentityRecord[] = [
  {
    id: 'ID-001',
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '+1-555-0123',
    location: {
      city: 'New York',
      state: 'New York',
      country: 'United States',
    },
    faceEmbedding: generateMockEmbedding(),
    source: 'FBI Database',
    lastUpdated: new Date('2024-01-15'),
    metadata: {
      height: '6ft 1in',
      weight: '180 lbs',
      eyeColor: 'blue',
    },
  },
  {
    id: 'ID-002',
    name: 'Maria Garcia',
    email: 'maria.garcia@gmail.com',
    phone: '+1-555-0456',
    location: {
      city: 'Los Angeles',
      state: 'California',
      country: 'United States',
    },
    faceEmbedding: generateMockEmbedding(),
    source: 'LAPD Records',
    lastUpdated: new Date('2024-02-20'),
    metadata: {
      height: '5ft 6in',
      weight: '130 lbs',
      eyeColor: 'brown',
    },
  },
  {
    id: 'ID-003',
    name: 'David Johnson',
    email: 'david.j@outlook.com',
    phone: '+1-555-0789',
    location: {
      city: 'Chicago',
      state: 'Illinois',
      country: 'United States',
    },
    faceEmbedding: generateMockEmbedding(),
    source: 'DMV Records',
    lastUpdated: new Date('2024-03-10'),
  },
  {
    id: 'ID-004',
    name: 'Sarah Williams',
    email: 'sarah.williams@company.com',
    phone: '+1-555-0321',
    location: {
      city: 'Houston',
      state: 'Texas',
      country: 'United States',
    },
    faceEmbedding: generateMockEmbedding(),
    source: 'Border Control',
    lastUpdated: new Date('2024-01-28'),
  },
  {
    id: 'ID-005',
    name: 'Michael Brown',
    email: 'mike.brown@email.com',
    phone: '+1-555-0654',
    location: {
      city: 'Phoenix',
      state: 'Arizona',
      country: 'United States',
    },
    faceEmbedding: generateMockEmbedding(),
    source: 'State Police',
    lastUpdated: new Date('2024-02-14'),
  },
  {
    id: 'ID-006',
    name: 'Jennifer Davis',
    email: 'j.davis@university.edu',
    phone: '+1-555-0987',
    location: {
      city: 'Philadelphia',
      state: 'Pennsylvania',
      country: 'United States',
    },
    faceEmbedding: generateMockEmbedding(),
    source: 'University Database',
    lastUpdated: new Date('2024-03-05'),
  },
  {
    id: 'ID-007',
    name: 'Robert Miller',
    email: 'robert.miller@corp.com',
    phone: '+1-555-0147',
    location: {
      city: 'San Antonio',
      state: 'Texas',
      country: 'United States',
    },
    faceEmbedding: generateMockEmbedding(),
    source: 'Corporate Security',
    lastUpdated: new Date('2024-01-30'),
  },
  {
    id: 'ID-008',
    name: 'Lisa Wilson',
    email: 'lisa.wilson@hospital.org',
    phone: '+1-555-0258',
    location: {
      city: 'San Diego',
      state: 'California',
      country: 'United States',
    },
    faceEmbedding: generateMockEmbedding(),
    source: 'Medical Records',
    lastUpdated: new Date('2024-02-25'),
  },
  {
    id: 'ID-009',
    name: 'James Anderson',
    email: 'james.anderson@gov.us',
    phone: '+1-555-0369',
    location: {
      city: 'Dallas',
      state: 'Texas',
      country: 'United States',
    },
    faceEmbedding: generateMockEmbedding(),
    source: 'Government Registry',
    lastUpdated: new Date('2024-03-12'),
  },
  {
    id: 'ID-010',
    name: 'Amanda Taylor',
    email: 'amanda.taylor@social.net',
    phone: '+1-555-0741',
    location: {
      city: 'San Jose',
      state: 'California',
      country: 'United States',
    },
    faceEmbedding: generateMockEmbedding(),
    source: 'Social Media Analysis',
    lastUpdated: new Date('2024-02-18'),
  },
  // Add more mock records for realistic testing
  ...Array.from({ length: 40 }, (_, i) => ({
    id: `ID-${String(i + 11).padStart(3, '0')}`,
    name: `Person ${i + 11}`,
    email: `person${i + 11}@example.com`,
    phone: `+1-555-${String(1000 + i).slice(1)}`,
    location: {
      city: ['Miami', 'Seattle', 'Denver', 'Boston', 'Atlanta'][i % 5],
      state: ['Florida', 'Washington', 'Colorado', 'Massachusetts', 'Georgia'][i % 5],
      country: 'United States',
    },
    faceEmbedding: generateMockEmbedding(),
    source: ['Police Database', 'DMV Records', 'Airport Security', 'Border Control', 'Court Records'][i % 5],
    lastUpdated: new Date(2024, Math.floor(Math.random() * 3), Math.floor(Math.random() * 28) + 1),
  })),
];
