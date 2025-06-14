
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SearchPanel } from './SearchPanel';
import { ResultsDisplay } from './ResultsDisplay';
import { IdentityRecord, SearchParams, MatchResult } from '@/types/divyadrishti';
import { performIdentitySearch } from '@/utils/identityMatcher';
import { mockIdentityDatabase } from '@/data/mockDatabase';

export const DivyadrishtiDashboard = () => {
  const [searchResults, setSearchResults] = useState<MatchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchParams, setSearchParams] = useState<SearchParams | null>(null);

  const handleSearch = async (params: SearchParams) => {
    setIsSearching(true);
    setSearchParams(params);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const results = performIdentitySearch(params, mockIdentityDatabase);
    setSearchResults(results);
    setIsSearching(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Divyadrishti Identity Engine
          </h1>
          <p className="text-slate-300 text-lg">
            Multi-modal forensic identity matching and correlation system
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <SearchPanel onSearch={handleSearch} isSearching={isSearching} />
          </div>
          
          <div className="lg:col-span-2">
            <ResultsDisplay 
              results={searchResults} 
              isSearching={isSearching}
              searchParams={searchParams}
            />
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-blue-400">Database Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-300">Total Records:</span>
                  <span className="text-white font-mono">{mockIdentityDatabase.length.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Face Embeddings:</span>
                  <span className="text-white font-mono">{mockIdentityDatabase.filter(r => r.faceEmbedding).length.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Complete Profiles:</span>
                  <span className="text-white font-mono">{mockIdentityDatabase.filter(r => r.name && r.email && r.phone).length.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-green-400">Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-300">Search Time:</span>
                  <span className="text-white font-mono">~1.2s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">FAISS Index:</span>
                  <span className="text-green-400 font-mono">Ready</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Fuzzy Engine:</span>
                  <span className="text-green-400 font-mono">Active</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-purple-400">System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-300">Face Recognition:</span>
                  <span className="text-green-400 font-mono">Online</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Text Matching:</span>
                  <span className="text-green-400 font-mono">Online</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Location Engine:</span>
                  <span className="text-green-400 font-mono">Online</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
