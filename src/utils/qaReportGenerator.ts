
import { MatchResult, QAReport, CrossDatabaseMatch, SearchParams } from '@/types/divyadrishti';

export const generateQAReport = (
  results: MatchResult[],
  searchParams: SearchParams
): QAReport => {
  const reportId = `QA-${Date.now()}`;
  
  // Count matches by database
  const matchesByDatabase: Record<string, number> = {};
  results.forEach(result => {
    const db = result.record.database;
    matchesByDatabase[db] = (matchesByDatabase[db] || 0) + 1;
  });

  // Count high confidence matches
  const highConfidenceMatches = results.filter(r => r.confidenceTier === 'High').length;

  // Find cross-database matches (same person in multiple databases)
  const crossDatabaseMatches = findCrossDatabaseMatches(results);

  // Generate summary
  const summary = generateSummary(results, matchesByDatabase, crossDatabaseMatches);

  // Generate recommendations
  const recommendations = generateRecommendations(results, crossDatabaseMatches);

  return {
    id: reportId,
    searchParams,
    totalMatches: results.length,
    matchesByDatabase,
    highConfidenceMatches,
    crossDatabaseMatches,
    generatedAt: new Date(),
    summary,
    recommendations,
  };
};

const findCrossDatabaseMatches = (results: MatchResult[]): CrossDatabaseMatch[] => {
  const crossMatches: CrossDatabaseMatch[] = [];
  const processedIds = new Set<string>();

  results.forEach(primaryResult => {
    if (processedIds.has(primaryResult.record.id)) return;

    const relatedRecords = results
      .filter(r => 
        r.record.id !== primaryResult.record.id &&
        r.record.database !== primaryResult.record.database &&
        (
          // Same name with high similarity
          (r.record.name && primaryResult.record.name && 
           calculateNameSimilarity(r.record.name, primaryResult.record.name) > 0.8) ||
          // Same email
          (r.record.email && primaryResult.record.email && 
           r.record.email.toLowerCase() === primaryResult.record.email.toLowerCase()) ||
          // Same phone
          (r.record.phone && primaryResult.record.phone && 
           normalizePhone(r.record.phone) === normalizePhone(primaryResult.record.phone))
        )
      )
      .map(r => r.record);

    if (relatedRecords.length > 0) {
      const discrepancies = findDiscrepancies(primaryResult.record, relatedRecords);
      const avgConfidence = (primaryResult.overallConfidence + 
        results.filter(r => relatedRecords.includes(r.record))
          .reduce((sum, r) => sum + r.overallConfidence, 0) / relatedRecords.length) / 2;

      crossMatches.push({
        primaryRecord: primaryResult.record,
        relatedRecords,
        confidence: avgConfidence,
        discrepancies,
      });

      // Mark all related records as processed
      processedIds.add(primaryResult.record.id);
      relatedRecords.forEach(r => processedIds.add(r.id));
    }
  });

  return crossMatches;
};

const findDiscrepancies = (primary: any, related: any[]): string[] => {
  const discrepancies: string[] = [];

  related.forEach(record => {
    // Check location discrepancies
    if (primary.location && record.location) {
      if (primary.location.city !== record.location.city) {
        discrepancies.push(`City mismatch: ${primary.location.city} vs ${record.location.city}`);
      }
      if (primary.location.country !== record.location.country) {
        discrepancies.push(`Country mismatch: ${primary.location.country} vs ${record.location.country}`);
      }
    }

    // Check metadata discrepancies
    if (primary.metadata && record.metadata) {
      Object.keys(primary.metadata).forEach(key => {
        if (record.metadata[key] && primary.metadata[key] !== record.metadata[key]) {
          discrepancies.push(`${key} mismatch: ${primary.metadata[key]} vs ${record.metadata[key]}`);
        }
      });
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

const generateSummary = (
  results: MatchResult[],
  matchesByDatabase: Record<string, number>,
  crossMatches: CrossDatabaseMatch[]
): string => {
  const totalMatches = results.length;
  const databases = Object.keys(matchesByDatabase);
  const highConfidence = results.filter(r => r.confidenceTier === 'High').length;
  
  let summary = `Identity search completed with ${totalMatches} total matches across ${databases.length} government databases. `;
  
  if (highConfidence > 0) {
    summary += `${highConfidence} high-confidence matches were identified. `;
  }
  
  if (crossMatches.length > 0) {
    summary += `${crossMatches.length} cross-database matches found, indicating potential duplicate identities or data inconsistencies. `;
  }
  
  summary += `Search covered: ${databases.join(', ')}.`;
  
  return summary;
};

const generateRecommendations = (
  results: MatchResult[],
  crossMatches: CrossDatabaseMatch[]
): string[] => {
  const recommendations: string[] = [];
  
  if (crossMatches.length > 0) {
    recommendations.push('Investigate cross-database matches for potential identity fraud or data synchronization issues');
    
    crossMatches.forEach(match => {
      if (match.discrepancies.length > 0) {
        recommendations.push(`Verify discrepancies found in record ${match.primaryRecord.id}: ${match.discrepancies.join(', ')}`);
      }
    });
  }
  
  const lowConfidenceMatches = results.filter(r => r.confidenceTier === 'Low');
  if (lowConfidenceMatches.length > 0) {
    recommendations.push(`Review ${lowConfidenceMatches.length} low-confidence matches for potential false positives`);
  }
  
  const singleDbMatches = results.filter(r => 
    !crossMatches.some(cm => 
      cm.primaryRecord.id === r.record.id || 
      cm.relatedRecords.some(rr => rr.id === r.record.id)
    )
  );
  
  if (singleDbMatches.length > 0) {
    recommendations.push(`${singleDbMatches.length} matches found in single databases only - consider expanding search criteria`);
  }
  
  if (recommendations.length === 0) {
    recommendations.push('No specific recommendations - results appear consistent and reliable');
  }
  
  return recommendations;
};
