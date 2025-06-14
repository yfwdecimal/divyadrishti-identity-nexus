
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
