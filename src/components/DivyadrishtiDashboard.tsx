
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SearchPanel } from './SearchPanel';
import { ResultsDisplay } from './ResultsDisplay';
import { QAReportDisplay } from './QAReportDisplay';
import { IdentityRecord, SearchParams, MatchResult, QAReport } from '@/types/divyadrishti';
import { performIdentitySearch } from '@/utils/identityMatcher';
import { generateQAReport } from '@/utils/qaReportGenerator';
import { governmentDatabases, getAllDatabases } from '@/data/governmentDatabases';

export const DivyadrishtiDashboard = () => {
  const [searchResults, setSearchResults] = useState<MatchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchParams, setSearchParams] = useState<SearchParams | null>(null);
  const [qaReport, setQaReport] = useState<QAReport | null>(null);

  const handleSearch = async (params: SearchParams) => {
    setIsSearching(true);
    setSearchParams(params);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const results = await performIdentitySearch(params);
    setSearchResults(results);
    
    // Generate QA report
    const report = generateQAReport(results, params);
    setQaReport(report);
    
    setIsSearching(false);
  };

  const totalRecords = getAllDatabases().length;
  const totalWithFaceEmbeddings = getAllDatabases().filter(r => r.faceEmbedding).length;
  const totalCompleteProfiles = getAllDatabases().filter(r => r.name && r.email && r.phone).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Divyadrishti Identity Engine
          </h1>
          <p className="text-slate-300 text-lg">
            Multi-modal forensic identity matching and correlation system across government databases
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <SearchPanel onSearch={handleSearch} isSearching={isSearching} />
          </div>
          
          <div className="lg:col-span-2">
            <Tabs defaultValue="results" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-slate-700">
                <TabsTrigger value="results" className="data-[state=active]:bg-blue-600">
                  Search Results
                </TabsTrigger>
                <TabsTrigger value="qa-report" className="data-[state=active]:bg-green-600">
                  QA Analysis
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="results">
                <ResultsDisplay 
                  results={searchResults} 
                  isSearching={isSearching}
                  searchParams={searchParams}
                />
              </TabsContent>
              
              <TabsContent value="qa-report">
                {qaReport ? (
                  <QAReportDisplay report={qaReport} />
                ) : (
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-8">
                      <div className="text-center">
                        <p className="text-slate-400">
                          QA report will be generated after performing a search
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-blue-400">Global Database Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-300">Total Records:</span>
                  <span className="text-white font-mono">{totalRecords.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Face Embeddings:</span>
                  <span className="text-white font-mono">{totalWithFaceEmbeddings.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Complete Profiles:</span>
                  <span className="text-white font-mono">{totalCompleteProfiles.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {Object.entries(governmentDatabases).map(([dbName, records]) => (
            <Card key={dbName} className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-green-400">{dbName}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-300">Records:</span>
                    <span className="text-white font-mono">{records.length.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Sources:</span>
                    <span className="text-white font-mono">{[...new Set(records.map(r => r.source))].length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Status:</span>
                    <span className="text-green-400 font-mono">Online</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
