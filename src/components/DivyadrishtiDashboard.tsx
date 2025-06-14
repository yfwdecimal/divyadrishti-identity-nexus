
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SearchPanel } from './SearchPanel';
import { ResultsDisplay } from './ResultsDisplay';
import { QAReportDisplay } from './QAReportDisplay';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { RealTimeMonitor } from './RealTimeMonitor';
import { FacialRecognitionUpload } from './FacialRecognitionUpload';
import { ExportReports } from './ExportReports';
import { performIdentitySearch } from '@/utils/identityMatcher';
import { generateQAReport } from '@/utils/qaReportGenerator';
import { Eye, Shield, Search, Database, FileText, Zap, Users, AlertTriangle, Activity, BarChart3, Camera, Download } from 'lucide-react';
import type { SearchParams, QAReport } from '@/types/divyadrishti';

export function DivyadrishtiDashboard() {
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [qaReport, setQAReport] = useState<QAReport | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [currentSearchParams, setCurrentSearchParams] = useState<SearchParams | null>(null);

  const handleSearch = async (params: SearchParams) => {
    setIsSearching(true);
    setCurrentSearchParams(params);
    try {
      console.log('Starting search with params:', params);
      const results = await performIdentitySearch(params);
      console.log('Search results:', results);
      setSearchResults(results);

      if (results.length > 0) {
        const report = generateQAReport(results, params);
        setQAReport(report);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleImageUpload = (file: File) => {
    console.log('Image uploaded for facial recognition:', file.name);
    // This would integrate with the search functionality
  };

  const stats = [
    { 
      title: 'Total Records', 
      value: '2.4M+', 
      icon: Database, 
      change: '+12%',
      gradient: 'from-purple-500 to-pink-500'
    },
    { 
      title: 'Active Searches', 
      value: '1,247', 
      icon: Search, 
      change: '+8%',
      gradient: 'from-blue-500 to-cyan-500'
    },
    { 
      title: 'Accuracy Rate', 
      value: '98.7%', 
      icon: Shield, 
      change: '+0.3%',
      gradient: 'from-green-500 to-emerald-500'
    },
    { 
      title: 'Processing Speed', 
      value: '0.8s', 
      icon: Zap, 
      change: '-15%',
      gradient: 'from-orange-500 to-red-500'
    },
  ];

  return (
    <div className="min-h-screen static-bg p-6">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Eye className="h-12 w-12 text-purple-400" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              Divyadrishti
            </h1>
            <Shield className="h-12 w-12 text-cyan-400" />
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Advanced Identity Intelligence System with Multi-Database Cross-Verification
          </p>
          <div className="flex items-center justify-center gap-2">
            <Badge variant="secondary" className="glass text-purple-300 border-purple-500/30">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Classified System
            </Badge>
            <Badge variant="outline" className="border-cyan-500/30 text-cyan-300">
              <Users className="h-3 w-3 mr-1" />
              Multi-Agency Access
            </Badge>
            <Badge variant="outline" className="border-green-500/30 text-green-300">
              <Activity className="h-3 w-3 mr-1" />
              Real-Time Monitoring
            </Badge>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <Card key={stat.title} className="hover:border-purple-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-3xl font-bold text-white">{stat.value}</p>
                    <p className={`text-sm ${stat.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                      {stat.change} from last month
                    </p>
                  </div>
                  <div className={`p-3 rounded-full bg-gradient-to-r ${stat.gradient}`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Tabs Interface */}
        <Tabs defaultValue="search" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-slate-800/50">
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Search
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="monitor" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Monitor
            </TabsTrigger>
            <TabsTrigger value="facial" className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Facial
            </TabsTrigger>
            <TabsTrigger value="export" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export
            </TabsTrigger>
          </TabsList>

          {/* Search Tab */}
          <TabsContent value="search" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-6 w-6 text-purple-400" />
                  Identity Search & Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SearchPanel onSearch={handleSearch} isLoading={isSearching} />
              </CardContent>
            </Card>

            {/* Search Progress */}
            {isSearching && (
              <Card className="glass-card">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-purple-500 border-t-transparent"></div>
                      <span className="text-lg font-medium text-purple-300">Processing Multi-Database Search...</span>
                    </div>
                    <Progress value={75} className="h-2" />
                    <p className="text-sm text-muted-foreground">
                      Scanning across Indian Government, US Federal, and UK Government databases...
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Results Section */}
            {searchResults.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="h-6 w-6 text-cyan-400" />
                      Search Results ({searchResults.length} matches found)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResultsDisplay 
                      results={searchResults} 
                      isSearching={isSearching}
                      searchParams={currentSearchParams}
                    />
                  </CardContent>
                </Card>

                {qaReport && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-6 w-6 text-green-400" />
                        Quality Assurance Report
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <QAReportDisplay report={qaReport} />
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <AnalyticsDashboard />
          </TabsContent>

          {/* Real-Time Monitor Tab */}
          <TabsContent value="monitor">
            <RealTimeMonitor />
          </TabsContent>

          {/* Facial Recognition Tab */}
          <TabsContent value="facial">
            <FacialRecognitionUpload onImageUpload={handleImageUpload} />
          </TabsContent>

          {/* Export & Reports Tab */}
          <TabsContent value="export">
            <ExportReports searchResults={searchResults} />
          </TabsContent>
        </Tabs>

        {/* System Status */}
        <Card className="glass-dark">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-3 w-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-muted-foreground">All systems operational</span>
                <Badge variant="outline" className="text-xs">
                  {searchResults.length} active results
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
