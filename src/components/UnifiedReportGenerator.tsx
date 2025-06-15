import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CrossDatabaseResult, CorrelatedMatch } from '@/utils/crossDatabaseSearchEngine';
import { FileText, Download, AlertTriangle, CheckCircle, Database, Users, Clock, TrendingUp, User, Image } from 'lucide-react';

interface UnifiedReportProps {
  searchResult: CrossDatabaseResult | null;
}

export function UnifiedReportGenerator({ searchResult }: UnifiedReportProps) {
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);

  if (!searchResult) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <FileText className="h-16 w-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Search Data</h3>
          <p className="text-slate-400">Perform a cross-database search to generate unified reports</p>
        </CardContent>
      </Card>
    );
  }

  const generateReport = async () => {
    setIsGeneratingReport(true);
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    setReportGenerated(true);
    setIsGeneratingReport(false);
  };

  const exportReport = (format: 'pdf' | 'json' | 'excel') => {
    const reportData = {
      searchId: searchResult.searchId,
      generatedAt: new Date().toISOString(),
      summary: searchResult.searchSummary,
      databaseResults: searchResult.databaseResults,
      correlatedMatches: searchResult.correlatedMatches,
      recommendations: generateRecommendations(searchResult)
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `unified-report-${searchResult.searchId}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateRecommendations = (result: CrossDatabaseResult): string[] => {
    const recommendations: string[] = [];
    
    if (result.correlatedMatches.length > 0) {
      recommendations.push(`Found ${result.correlatedMatches.length} cross-database correlations requiring investigation`);
    }
    
    const discrepancyCount = result.correlatedMatches.reduce((sum, match) => sum + match.discrepancies.length, 0);
    if (discrepancyCount > 0) {
      recommendations.push(`${discrepancyCount} data discrepancies detected across databases`);
    }
    
    if (result.searchSummary.failedSearches > 0) {
      recommendations.push(`${result.searchSummary.failedSearches} database searches failed - check connectivity`);
    }
    
    const lowConfidenceMatches = Object.values(result.databaseResults)
      .flatMap(db => db.matches)
      .filter(match => match.confidenceTier === 'Low').length;
    
    if (lowConfidenceMatches > 0) {
      recommendations.push(`${lowConfidenceMatches} low-confidence matches need manual review`);
    }

    return recommendations;
  };

  const CorrelatedMatchCard = ({ match }: { match: CorrelatedMatch }) => (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardContent className="p-4">
        <div className="flex items-start gap-4 mb-3">
          {/* Primary Record Image */}
          <div className="flex-shrink-0">
            {match.primaryMatch.record.faceImageUrl ? (
              <div className="relative">
                <img 
                  src={match.primaryMatch.record.faceImageUrl} 
                  alt={`${match.primaryMatch.record.name || 'Unknown'} profile`}
                  className="w-12 h-12 rounded-full object-cover border-2 border-slate-600"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <div className="hidden w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
              </div>
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="font-semibold text-white">{match.primaryMatch.record.name}</h4>
                <p className="text-sm text-slate-400">Primary: {match.primaryMatch.record.database}</p>
              </div>
              <div className="text-right">
                <Badge variant={match.correlationType === 'exact' ? 'default' : 'secondary'}>
                  {match.correlationType}
                </Badge>
                <p className="text-sm text-slate-400 mt-1">
                  {Math.round(match.correlationScore * 100)}% match
                </p>
              </div>
            </div>

            <div className="space-y-2 mb-3">
              <p className="text-sm text-slate-300">
                <strong>Related Databases:</strong> {match.relatedMatches.map(m => m.record.database).join(', ')}
              </p>
              <p className="text-sm text-slate-300">
                <strong>Total Records:</strong> {match.relatedMatches.length + 1}
              </p>
              
              {/* Show related images if available */}
              {match.relatedMatches.some(m => m.record.faceImageUrl) && (
                <div className="flex items-center gap-2">
                  <Image className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-300">Related images available</span>
                  <div className="flex gap-1 ml-2">
                    {match.relatedMatches
                      .filter(m => m.record.faceImageUrl)
                      .slice(0, 3)
                      .map((relatedMatch, idx) => (
                        <img 
                          key={idx}
                          src={relatedMatch.record.faceImageUrl!} 
                          alt={`Related ${idx}`}
                          className="w-6 h-6 rounded-full object-cover border border-slate-500"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {match.discrepancies.length > 0 && (
          <div className="border-t border-slate-700 pt-3">
            <p className="text-sm font-medium text-yellow-400 mb-2">Data Discrepancies:</p>
            <ul className="text-xs text-slate-400 space-y-1">
              {match.discrepancies.slice(0, 3).map((discrepancy, idx) => (
                <li key={idx}>• {discrepancy}</li>
              ))}
              {match.discrepancies.length > 3 && (
                <li>• +{match.discrepancies.length - 3} more...</li>
              )}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Report Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-purple-400" />
              Unified Cross-Database Report
            </CardTitle>
            <div className="flex gap-2">
              <Button 
                onClick={generateReport}
                disabled={isGeneratingReport}
                variant="outline"
              >
                {isGeneratingReport ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-500 border-t-transparent mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Report
                  </>
                )}
              </Button>
              {reportGenerated && (
                <div className="flex gap-1">
                  <Button size="sm" onClick={() => exportReport('json')}>
                    <Download className="h-4 w-4 mr-1" />
                    JSON
                  </Button>
                  <Button size="sm" onClick={() => exportReport('pdf')}>
                    <Download className="h-4 w-4 mr-1" />
                    PDF
                  </Button>
                  <Button size="sm" onClick={() => exportReport('excel')}>
                    <Download className="h-4 w-4 mr-1" />
                    Excel
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isGeneratingReport && (
            <div className="space-y-4">
              <Progress value={75} className="h-2" />
              <p className="text-sm text-slate-400">Correlating data across databases...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Database className="h-8 w-8 text-blue-400" />
              <div>
                <p className="text-2xl font-bold text-white">{searchResult.searchSummary.totalDatabases}</p>
                <p className="text-sm text-slate-400">Databases Searched</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-green-400" />
              <div>
                <p className="text-2xl font-bold text-white">{searchResult.totalMatches}</p>
                <p className="text-sm text-slate-400">Total Matches</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-purple-400" />
              <div>
                <p className="text-2xl font-bold text-white">{searchResult.correlatedMatches.length}</p>
                <p className="text-sm text-slate-400">Cross-DB Matches</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-orange-400" />
              <div>
                <p className="text-2xl font-bold text-white">{Math.round(searchResult.searchSummary.averageResponseTime)}ms</p>
                <p className="text-sm text-slate-400">Avg Response Time</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Report Tabs */}
      <Tabs defaultValue="correlations" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="correlations">Cross-Database Correlations</TabsTrigger>
          <TabsTrigger value="database-breakdown">Database Breakdown</TabsTrigger>
          <TabsTrigger value="discrepancies">Data Discrepancies</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="correlations">
          <Card>
            <CardHeader>
              <CardTitle>Cross-Database Identity Correlations</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {searchResult.correlatedMatches.length === 0 ? (
                    <p className="text-slate-400 text-center py-8">No cross-database correlations found</p>
                  ) : (
                    searchResult.correlatedMatches.map((match, idx) => (
                      <CorrelatedMatchCard key={idx} match={match} />
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database-breakdown">
          <Card>
            <CardHeader>
              <CardTitle>Database Search Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(searchResult.databaseResults).map(([dbName, result]) => (
                  <div key={dbName} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Database className="h-5 w-5 text-cyan-400" />
                      <div>
                        <p className="font-medium text-white">{dbName}</p>
                        <p className="text-sm text-slate-400">{result.matches.length} matches found</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={result.status === 'completed' ? 'default' : 'destructive'}>
                        {result.status}
                      </Badge>
                      <span className="text-sm text-slate-400">{result.searchTime}ms</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="discrepancies">
          <Card>
            <CardHeader>
              <CardTitle>Data Discrepancies Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {searchResult.correlatedMatches.flatMap(match => 
                  match.discrepancies.map((discrepancy, idx) => (
                    <div key={`${match.primaryMatch.record.id}-${idx}`} className="flex items-start gap-3 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />
                      <div>
                        <p className="text-white">{discrepancy}</p>
                        <p className="text-sm text-slate-400">Record: {match.primaryMatch.record.name} ({match.primaryMatch.record.id})</p>
                      </div>
                    </div>
                  ))
                )}
                {searchResult.correlatedMatches.every(match => match.discrepancies.length === 0) && (
                  <div className="text-center py-8">
                    <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
                    <p className="text-slate-400">No data discrepancies detected</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations">
          <Card>
            <CardHeader>
              <CardTitle>Investigation Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {generateRecommendations(searchResult).map((recommendation, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-blue-400 mt-0.5" />
                    <p className="text-white">{recommendation}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
