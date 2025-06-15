
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Search, Database, FileText, LogOut, User } from 'lucide-react';
import { SearchPanel } from './SearchPanel';
import { ResultsDisplay } from './ResultsDisplay';
import { DatabaseImport } from './DatabaseImport';
import { UnifiedReportGenerator } from './UnifiedReportGenerator';
import { RealTimeMonitor } from './RealTimeMonitor';
import { useAuth } from '@/hooks/useAuth';
import { SearchParams, MatchResult } from '@/types/divyadrishti';
import { performCrossDatabaseSearch } from '@/utils/crossDatabaseSearchEngine';
import { getTotalRecordCount } from '@/data/governmentDatabases';

export const DivyadrishtiDashboard = () => {
  const { isAuthenticated, user, isLoading, logout, requireAuth } = useAuth();
  const [searchResults, setSearchResults] = useState<MatchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [lastSearchParams, setLastSearchParams] = useState<SearchParams | null>(null);
  const [totalRecords, setTotalRecords] = useState(0);

  useEffect(() => {
    requireAuth();
  }, [requireAuth]);

  useEffect(() => {
    // Update record count periodically
    const updateRecordCount = () => {
      setTotalRecords(getTotalRecordCount());
    };
    
    updateRecordCount();
    const interval = setInterval(updateRecordCount, 5000); // Update every 5 seconds
    
    return () => clearInterval(interval);
  }, []);

  const handleSearch = async (searchParams: SearchParams) => {
    setIsSearching(true);
    setLastSearchParams(searchParams);
    
    try {
      console.log('Initiating cross-database search...');
      const result = await performCrossDatabaseSearch(searchParams);
      
      // Extract all matches from database results
      const allMatches = Object.values(result.databaseResults)
        .flatMap(dbResult => dbResult.matches);
      
      setSearchResults(allMatches);
      console.log(`Search completed: ${allMatches.length} total matches found`);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white">Loading Divyadrishti...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Redirect handled by useAuth
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-purple-400" />
              <div>
                <h1 className="text-2xl font-bold text-white">Divyadrishti</h1>
                <p className="text-sm text-slate-400">Identity Intelligence Platform</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="bg-green-600/20 border-green-500">
                {totalRecords} Records Available
              </Badge>
              
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-slate-400" />
                <span className="text-slate-300">{user?.email}</span>
              </div>
              
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="search" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800/50">
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Search
            </TabsTrigger>
            <TabsTrigger value="import" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Import
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="monitor" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Monitor
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SearchPanel onSearch={handleSearch} />
              <ResultsDisplay 
                results={searchResults}
                isSearching={isSearching}
                searchParams={lastSearchParams}
              />
            </div>
          </TabsContent>

          <TabsContent value="import">
            <div className="max-w-2xl mx-auto">
              <DatabaseImport />
            </div>
          </TabsContent>

          <TabsContent value="reports">
            <div className="max-w-4xl mx-auto">
              <UnifiedReportGenerator searchResults={searchResults} />
            </div>
          </TabsContent>

          <TabsContent value="monitor">
            <RealTimeMonitor />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};
