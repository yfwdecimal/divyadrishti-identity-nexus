
import { IdentityRecord, SearchParams, MatchResult, ConfidenceWeights } from '@/types/divyadrishti';

// Simulated face embedding comparison (replaces actual FaceNet/FAISS)
const simulateFaceEmbeddingMatch = (searchEmbedding: number[], recordEmbedding: number[]): number => {
  // Simulate cosine similarity calculation
  if (!searchEmbedding || !recordEmbedding) return 0;
  
  // Generate a realistic similarity score between 0.3 and 0.95
  const randomSimilarity = 0.3 + Math.random() * 0.65;
  
  // Add some variance based on "embedding distance"
  const variance = (Math.random() - 0.5) * 0.2;
  return Math.max(0, Math.min(1, randomSimilarity + variance));
};

// Generate simulated face embedding for uploaded image
const generateFaceEmbedding = async (imageFile: File): Promise<number[]> => {
  // Simulate face detection and embedding generation
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Return a 128-dimensional mock embedding
  return Array.from({ length: 128 }, () => Math.random() * 2 - 1);
};

// Fuzzy string matching (Levenshtein-based)
const calculateStringSimilarity = (str1: string, str2: string): number => {
  if (!str1 || !str2) return 0;
  
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  
  if (s1 === s2) return 1;
  
  // Levenshtein distance implementation
  const matrix = Array(s2.length + 1).fill(null).map(() => Array(s1.length + 1).fill(null));
  
  for (let i = 0; i <= s1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= s2.length; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= s2.length; j++) {
    for (let i = 1; i <= s1.length; i++) {
      const indicator = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator
      );
    }
  }
  
  const distance = matrix[s2.length][s1.length];
  const maxLength = Math.max(s1.length, s2.length);
  
  return maxLength === 0 ? 1 : 1 - distance / maxLength;
};

// Token-based similarity for names (handles partial matches)
const calculateNameSimilarity = (searchName: string, recordName: string): number => {
  if (!searchName || !recordName) return 0;
  
  const searchTokens = searchName.toLowerCase().split(/\s+/);
  const recordTokens = recordName.toLowerCase().split(/\s+/);
  
  let maxSimilarity = 0;
  
  // Check each search token against each record token
  for (const searchToken of searchTokens) {
    for (const recordToken of recordTokens) {
      const similarity = calculateStringSimilarity(searchToken, recordToken);
      maxSimilarity = Math.max(maxSimilarity, similarity);
    }
  }
  
  // Also check full string similarity
  const fullStringSimilarity = calculateStringSimilarity(searchName, recordName);
  
  return Math.max(maxSimilarity, fullStringSimilarity);
};

// Email similarity with domain awareness
const calculateEmailSimilarity = (searchEmail: string, recordEmail: string): number => {
  if (!searchEmail || !recordEmail) return 0;
  
  const [searchUser, searchDomain] = searchEmail.toLowerCase().split('@');
  const [recordUser, recordDomain] = recordEmail.toLowerCase().split('@');
  
  if (!searchDomain || !recordDomain) {
    return calculateStringSimilarity(searchEmail, recordEmail);
  }
  
  const userSimilarity = calculateStringSimilarity(searchUser, recordUser);
  const domainSimilarity = calculateStringSimilarity(searchDomain, recordDomain);
  
  // Weight username more heavily than domain
  return userSimilarity * 0.7 + domainSimilarity * 0.3;
};

// Phone number similarity (handles formatting differences)
const calculatePhoneSimilarity = (searchPhone: string, recordPhone: string): number => {
  if (!searchPhone || !recordPhone) return 0;
  
  // Remove all non-digit characters
  const searchDigits = searchPhone.replace(/\D/g, '');
  const recordDigits = recordPhone.replace(/\D/g, '');
  
  if (searchDigits === recordDigits) return 1;
  
  // Check if one is a substring of the other (partial match)
  if (searchDigits.includes(recordDigits) || recordDigits.includes(searchDigits)) {
    const shorter = Math.min(searchDigits.length, recordDigits.length);
    const longer = Math.max(searchDigits.length, recordDigits.length);
    return shorter / longer;
  }
  
  return calculateStringSimilarity(searchDigits, recordDigits);
};

// Location similarity with hierarchical matching
const calculateLocationSimilarity = (searchLocation: any, recordLocation: any): number => {
  if (!searchLocation || !recordLocation) return 0;
  
  let score = 0;
  let weightSum = 0;
  
  const weights = { city: 0.5, state: 0.3, country: 0.2 };
  
  for (const [field, weight] of Object.entries(weights)) {
    if (searchLocation[field] && recordLocation[field]) {
      const similarity = calculateStringSimilarity(
        searchLocation[field],
        recordLocation[field]
      );
      score += similarity * weight;
      weightSum += weight;
    }
  }
  
  return weightSum > 0 ? score / weightSum : 0;
};

// Main identity search function
export const performIdentitySearch = async (
  searchParams: SearchParams,
  database: IdentityRecord[]
): Promise<MatchResult[]> => {
  const results: MatchResult[] = [];
  
  // Default confidence weights
  const weights: ConfidenceWeights = {
    face: 0.4,
    name: 0.25,
    email: 0.15,
    phone: 0.1,
    location: 0.1,
  };
  
  // Generate face embedding if image provided
  let searchFaceEmbedding: number[] | null = null;
  if (searchParams.faceImage) {
    searchFaceEmbedding = await generateFaceEmbedding(searchParams.faceImage);
  }
  
  for (const record of database) {
    const matchBreakdown: any = {};
    const matchedFields: string[] = [];
    let totalScore = 0;
    let totalWeight = 0;
    
    // Face matching
    if (searchFaceEmbedding && record.faceEmbedding) {
      const faceScore = simulateFaceEmbeddingMatch(searchFaceEmbedding, record.faceEmbedding);
      matchBreakdown.face = faceScore;
      totalScore += faceScore * weights.face;
      totalWeight += weights.face;
      
      if (faceScore > 0.7) {
        matchedFields.push('face');
      }
    }
    
    // Name matching
    if (searchParams.name && record.name) {
      const nameScore = calculateNameSimilarity(searchParams.name, record.name);
      matchBreakdown.name = nameScore;
      totalScore += nameScore * weights.name;
      totalWeight += weights.name;
      
      if (nameScore > 0.6) {
        matchedFields.push('name');
      }
    }
    
    // Email matching
    if (searchParams.email && record.email) {
      const emailScore = calculateEmailSimilarity(searchParams.email, record.email);
      matchBreakdown.email = emailScore;
      totalScore += emailScore * weights.email;
      totalWeight += weights.email;
      
      if (emailScore > 0.8) {
        matchedFields.push('email');
      }
    }
    
    // Phone matching
    if (searchParams.phone && record.phone) {
      const phoneScore = calculatePhoneSimilarity(searchParams.phone, record.phone);
      matchBreakdown.phone = phoneScore;
      totalScore += phoneScore * weights.phone;
      totalWeight += weights.phone;
      
      if (phoneScore > 0.8) {
        matchedFields.push('phone');
      }
    }
    
    // Location matching
    if (searchParams.location && record.location) {
      const locationScore = calculateLocationSimilarity(searchParams.location, record.location);
      matchBreakdown.location = locationScore;
      totalScore += locationScore * weights.location;
      totalWeight += weights.location;
      
      if (locationScore > 0.7) {
        matchedFields.push('location');
      }
    }
    
    // Calculate overall confidence
    const overallConfidence = totalWeight > 0 ? totalScore / totalWeight : 0;
    
    // Apply confidence threshold
    if (overallConfidence >= (searchParams.confidenceThreshold || 0.5)) {
      const confidenceTier = 
        overallConfidence >= 0.8 ? 'High' :
        overallConfidence >= 0.6 ? 'Medium' : 'Low';
      
      results.push({
        record,
        overallConfidence,
        matchBreakdown,
        matchedFields,
        confidenceTier,
      });
    }
  }
  
  // Sort by confidence (highest first)
  return results.sort((a, b) => b.overallConfidence - a.overallConfidence);
};
