
import { IdentityRecord, SearchParams, MatchResult } from '@/types/divyadrishti';
import { getAllDatabases, getImportedRecords, indianGovernmentDatabase } from '@/data/governmentDatabases';
import { performIdentitySearch } from './identityMatcher';

export interface CrossDatabaseResult {
  searchId: string;
  totalMatches: number;
  databaseResults: {
    [databaseName: string]: {
      matches: MatchResult[];
      searchTime: number;
      status: 'completed' | 'error' | 'timeout';
    };
  };
  correlatedMatches: CorrelatedMatch[];
  searchSummary: SearchSummary;
}

export interface CorrelatedMatch {
  primaryMatch: MatchResult;
  relatedMatches: MatchResult[];
  correlationScore: number;
  correlationType: 'exact' | 'partial' | 'fuzzy';
  discrepancies: string[];
}

export interface SearchSummary {
  totalDatabases: number;
  successfulSearches: number;
  failedSearches: number;
  highConfidenceMatches: number;
  crossDatabaseMatches: number;
  uniqueIdentities: number;
  averageResponseTime: number;
}

export const performCrossDatabaseSearch = async (
  searchParams: SearchParams
): Promise<CrossDatabaseResult> => {
  const searchId = `SEARCH-${Date.now()}`;
  const startTime = Date.now();
  
  console.log(`Starting cross-database search ${searchId}`, searchParams);

  const databaseResults: CrossDatabaseResult['databaseResults'] = {};
  const allMatches: MatchResult[] = [];

  // Define available databases based on current data
  const availableDatabases: { [key: string]: IdentityRecord[] } = {
    'Indian Government': indianGovernmentDatabase,
  };

  // Add imported data if it exists
  const importedRecords = getImportedRecords();
  if (importedRecords.length > 0) {
    availableDatabases['Imported Data'] = importedRecords;
  }

  // Search each database
  for (const [databaseName, records] of Object.entries(availableDatabases)) {
    const dbStartTime = Date.now();
    
    try {
      console.log(`Searching ${databaseName} database with ${records.length} records...`);
      
      // Perform search on this specific database
      const matches = await performIdentitySearch(searchParams, records);
      const searchTime = Date.now() - dbStartTime;
      
      databaseResults[databaseName] = {
        matches,
        searchTime,
        status: 'completed'
      };
      
      allMatches.push(...matches);
      
      console.log(`${databaseName}: Found ${matches.length} matches in ${searchTime}ms`);
      
    } catch (error) {
      console.error(`Error searching ${databaseName}:`, error);
      databaseResults[databaseName] = {
        matches: [],
        searchTime: Date.now() - dbStartTime,
        status: 'error'
      };
    }
  }

  // Find correlated matches across databases
  const correlatedMatches = findCorrelatedMatches(allMatches);
  
  // Generate search summary
  const searchSummary = generateSearchSummary(databaseResults, correlatedMatches, startTime);
  
  const result: CrossDatabaseResult = {
    searchId,
    totalMatches: allMatches.length,
    databaseResults,
    correlatedMatches,
    searchSummary
  };

  console.log(`Cross-database search ${searchId} completed:`, result);
  return result;
};

const findCorrelatedMatches = (allMatches: MatchResult[]): CorrelatedMatch[] => {
  const correlatedMatches: CorrelatedMatch[] = [];
  const processedMatches = new Set<string>();

  for (const primaryMatch of allMatches) {
    if (processedMatches.has(primaryMatch.record.id)) continue;

    const relatedMatches = allMatches.filter(match => 
      match.record.id !== primaryMatch.record.id &&
      match.record.database !== primaryMatch.record.database &&
      !processedMatches.has(match.record.id) &&
      isCorrelated(primaryMatch.record, match.record)
    );

    if (relatedMatches.length > 0) {
      const correlationScore = calculateCorrelationScore(primaryMatch, relatedMatches);
      const correlationType = determineCorrelationType(primaryMatch, relatedMatches);
      const discrepancies = findDataDiscrepancies(primaryMatch.record, relatedMatches.map(m => m.record));

      correlatedMatches.push({
        primaryMatch,
        relatedMatches,
        correlationScore,
        correlationType,
        discrepancies
      });

      // Mark all related matches as processed
      processedMatches.add(primaryMatch.record.id);
      relatedMatches.forEach(match => processedMatches.add(match.record.id));
    }
  }

  return correlatedMatches.sort((a, b) => b.correlationScore - a.correlationScore);
};

const isCorrelated = (record1: IdentityRecord, record2: IdentityRecord): boolean => {
  // Check for exact matches
  if (record1.email && record2.email && record1.email.toLowerCase() === record2.email.toLowerCase()) {
    return true;
  }
  
  if (record1.phone && record2.phone && normalizePhone(record1.phone) === normalizePhone(record2.phone)) {
    return true;
  }

  // Check for name similarity
  if (record1.name && record2.name) {
    const nameSimilarity = calculateNameSimilarity(record1.name, record2.name);
    if (nameSimilarity > 0.8) return true;
  }

  return false;
};

const calculateCorrelationScore = (primary: MatchResult, related: MatchResult[]): number => {
  let totalScore = 0;
  let factors = 0;

  // Base confidence score
  totalScore += primary.overallConfidence;
  factors++;

  // Related matches average confidence
  const avgRelatedConfidence = related.reduce((sum, match) => sum + match.overallConfidence, 0) / related.length;
  totalScore += avgRelatedConfidence;
  factors++;

  // Number of databases factor
  const uniqueDatabases = new Set([primary.record.database, ...related.map(m => m.record.database)]).size;
  totalScore += Math.min(uniqueDatabases / 3, 1); // Max bonus for 3+ databases
  factors++;

  return totalScore / factors;
};

const determineCorrelationType = (primary: MatchResult, related: MatchResult[]): 'exact' | 'partial' | 'fuzzy' => {
  for (const relatedMatch of related) {
    // Check for exact matches
    if (primary.record.email && relatedMatch.record.email && 
        primary.record.email.toLowerCase() === relatedMatch.record.email.toLowerCase()) {
      return 'exact';
    }
    
    if (primary.record.phone && relatedMatch.record.phone && 
        normalizePhone(primary.record.phone) === normalizePhone(relatedMatch.record.phone)) {
      return 'exact';
    }
  }

  // Check for partial matches
  const hasPartialMatch = related.some(match => 
    primary.matchedFields.some(field => match.matchedFields.includes(field))
  );
  
  return hasPartialMatch ? 'partial' : 'fuzzy';
};

const findDataDiscrepancies = (primary: IdentityRecord, related: IdentityRecord[]): string[] => {
  const discrepancies: string[] = [];

  related.forEach((record, index) => {
    const dbName = record.database;
    
    // Location discrepancies
    if (primary.location && record.location) {
      if (primary.location.city !== record.location.city) {
        discrepancies.push(`City differs in ${dbName}: ${primary.location.city} vs ${record.location.city}`);
      }
      if (primary.location.country !== record.location.country) {
        discrepancies.push(`Country differs in ${dbName}: ${primary.location.country} vs ${record.location.country}`);
      }
    }

    // Name variations
    if (primary.name && record.name && primary.name !== record.name) {
      discrepancies.push(`Name variation in ${dbName}: "${primary.name}" vs "${record.name}"`);
    }
  });

  return [...new Set(discrepancies)]; // Remove duplicates
};

const calculateNameSimilarity = (name1: string, name2: string): number => {
  const tokens1 = name1.toLowerCase().split(/\s+/);
  const tokens2 = name2.toLowerCase().split(/\s+/);
  
  let matches = 0;
  const maxTokens = Math.max(tokens1.length, tokens2.length);
  
  tokens1.forEach(token1 => {
    if (tokens2.some(token2 => token1 === token2 || token1.includes(token2) || token2.includes(token1))) {
      matches++;
    }
  });
  
  return matches / maxTokens;
};

const normalizePhone = (phone: string): string => {
  return phone.replace(/\D/g, '');
};

const generateSearchSummary = (
  databaseResults: CrossDatabaseResult['databaseResults'],
  correlatedMatches: CorrelatedMatch[],
  startTime: number
): SearchSummary => {
  const databases = Object.keys(databaseResults);
  const successfulSearches = databases.filter(db => databaseResults[db].status === 'completed').length;
  const failedSearches = databases.length - successfulSearches;
  
  const allMatches = Object.values(databaseResults).flatMap(result => result.matches);
  const highConfidenceMatches = allMatches.filter(match => match.confidenceTier === 'High').length;
  
  const totalSearchTime = Date.now() - startTime;
  const averageResponseTime = Object.values(databaseResults)
    .reduce((sum, result) => sum + result.searchTime, 0) / databases.length;

  return {
    totalDatabases: databases.length,
    successfulSearches,
    failedSearches,
    highConfidenceMatches,
    crossDatabaseMatches: correlatedMatches.length,
    uniqueIdentities: correlatedMatches.length + (allMatches.length - correlatedMatches.reduce((sum, cm) => sum + cm.relatedMatches.length + 1, 0)),
    averageResponseTime
  };
};
