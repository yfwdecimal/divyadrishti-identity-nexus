
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MatchResult, SearchParams } from '@/types/divyadrishti';
import { Download, User, Mail, Phone, MapPin, Calendar, Database } from 'lucide-react';

interface ResultsDisplayProps {
  results: MatchResult[];
  isSearching: boolean;
  searchParams: SearchParams | null;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ 
  results, 
  isSearching, 
  searchParams 
}) => {
  const groupedResults = {
    High: results.filter(r => r.confidenceTier === 'High'),
    Medium: results.filter(r => r.confidenceTier === 'Medium'),
    Low: results.filter(r => r.confidenceTier === 'Low'),
  };

  const exportResults = () => {
    const exportData = results.map(result => ({
      id: result.record.id,
      name: result.record.name,
      email: result.record.email,
      phone: result.record.phone,
      location: result.record.location,
      confidence: result.overallConfidence,
      tier: result.confidenceTier,
      matchedFields: result.matchedFields.join(', '),
      source: result.record.source,
    }));

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `divyadrishti-results-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const MatchCard = ({ result }: { result: MatchResult }) => (
    <Card className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">{result.record.name || 'Unknown'}</h3>
              <p className="text-sm text-slate-400">ID: {result.record.id}</p>
            </div>
          </div>
          <Badge 
            variant={result.confidenceTier === 'High' ? 'default' : 'secondary'}
            className={`
              ${result.confidenceTier === 'High' ? 'bg-green-600' : 
                result.confidenceTier === 'Medium' ? 'bg-yellow-600' : 'bg-red-600'}
            `}
          >
            {result.confidenceTier}
          </Badge>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-slate-300">Overall Confidence</span>
            <span className="font-mono text-white">{Math.round(result.overallConfidence * 100)}%</span>
          </div>
          <Progress value={result.overallConfidence * 100} className="h-2" />
        </div>

        <div className="space-y-2">
          {result.record.email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-slate-400" />
              <span className="text-slate-300">{result.record.email}</span>
              {result.matchedFields.includes('email') && (
                <Badge variant="outline" className="text-xs">Match</Badge>
              )}
            </div>
          )}
          
          {result.record.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-slate-400" />
              <span className="text-slate-300">{result.record.phone}</span>
              {result.matchedFields.includes('phone') && (
                <Badge variant="outline" className="text-xs">Match</Badge>
              )}
            </div>
          )}
          
          {result.record.location && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span className="text-slate-300">
                {[result.record.location.city, result.record.location.state, result.record.location.country]
                  .filter(Boolean).join(', ')}
              </span>
              {result.matchedFields.includes('location') && (
                <Badge variant="outline" className="text-xs">Match</Badge>
              )}
            </div>
          )}

          <div className="flex items-center gap-2 text-sm">
            <Database className="w-4 h-4 text-slate-400" />
            <span className="text-slate-300">Source: {result.record.source}</span>
          </div>
        </div>

        {Object.keys(result.matchBreakdown).length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-700">
            <p className="text-xs text-slate-400 mb-2">Match Breakdown:</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(result.matchBreakdown).map(([field, confidence]) => (
                <Badge key={field} variant="outline" className="text-xs">
                  {field}: {Math.round(confidence * 100)}%
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (isSearching) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-8">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Processing Search</h3>
            <p className="text-slate-400">
              Analyzing face embeddings and performing fuzzy text matching...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!searchParams) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-8">
          <div className="text-center">
            <User className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Ready to Search</h3>
            <p className="text-slate-400">
              Enter search criteria in the panel to begin identity matching
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-green-400">
            Search Results ({results.length} matches found)
          </CardTitle>
          {results.length > 0 && (
            <Button onClick={exportResults} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {results.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-400 text-lg">No matches found</p>
            <p className="text-slate-500 text-sm">Try adjusting your search criteria or lowering the confidence threshold</p>
          </div>
        ) : (
          <Tabs defaultValue="High" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-slate-700 mb-6">
              <TabsTrigger value="High" className="data-[state=active]:bg-green-600">
                High ({groupedResults.High.length})
              </TabsTrigger>
              <TabsTrigger value="Medium" className="data-[state=active]:bg-yellow-600">
                Medium ({groupedResults.Medium.length})
              </TabsTrigger>
              <TabsTrigger value="Low" className="data-[state=active]:bg-red-600">
                Low ({groupedResults.Low.length})
              </TabsTrigger>
            </TabsList>

            {(['High', 'Medium', 'Low'] as const).map(tier => (
              <TabsContent key={tier} value={tier}>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {groupedResults[tier].length === 0 ? (
                    <p className="text-slate-400 text-center py-4">
                      No {tier.toLowerCase()} confidence matches
                    </p>
                  ) : (
                    groupedResults[tier].map(result => (
                      <MatchCard key={result.record.id} result={result} />
                    ))
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};
