export interface IdentityRecord {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  location?: {
    city?: string;
    state?: string;
    country?: string;
  };
  faceImageUrl?: string;
  faceEmbedding?: number[]; // Simulated face embedding vector
  source: string;
  database: string; // New field to identify which database
  metadata?: Record<string, any>;
  lastUpdated: Date;
}

export interface SearchParams {
  faceImage?: File;
  name?: string;
  email?: string;
  phone?: string;
  location?: {
    city?: string;
    state?: string;
    country?: string;
  };
  confidenceThreshold?: number;
  selectedDatabases?: string[]; // New field for database selection
  includePartialMatches?: boolean;
  query?: string;
}

export interface MatchResult {
  record: IdentityRecord;
  overallConfidence: number;
  matchBreakdown: {
    face?: number;
    name?: number;
    email?: number;
    phone?: number;
    location?: number;
  };
  matchedFields: string[];
  confidenceTier: 'High' | 'Medium' | 'Low';
}

export interface ConfidenceWeights {
  face: number;
  name: number;
  email: number;
  phone: number;
  location: number;
}

export interface QAReport {
  id: string;
  searchParams: SearchParams;
  totalMatches: number;
  matchesByDatabase: Record<string, number>;
  highConfidenceMatches: number;
  crossDatabaseMatches: CrossDatabaseMatch[];
  generatedAt: Date;
  summary: string;
  recommendations: string[];
}

export interface CrossDatabaseMatch {
  primaryRecord: IdentityRecord;
  relatedRecords: IdentityRecord[];
  confidence: number;
  discrepancies: string[];
}
