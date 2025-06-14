
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, Search, Database, Users, Globe } from 'lucide-react';
import type { SearchParams } from '@/types/divyadrishti';

interface SearchPanelProps {
  onSearch: (params: SearchParams) => void;
  isLoading: boolean;
}

interface ExtendedSearchParams extends SearchParams {
  databases: string[];
}

export function SearchPanel({ onSearch, isLoading }: SearchPanelProps) {
  const [searchParams, setSearchParams] = useState<ExtendedSearchParams>({
    databases: ['indian_government'],
    includePartialMatches: true,
    confidenceThreshold: 0.8
  });

  const [query, setQuery] = useState('');

  const databases = [
    { 
      id: 'indian_government', 
      name: 'Indian Government', 
      icon: Users,
      description: 'Aadhaar, PAN, Voter ID, Passport records',
      color: 'text-orange-400'
    },
    { 
      id: 'us_federal', 
      name: 'US Federal', 
      icon: Globe,
      description: 'FBI, DHS, SSA databases',
      color: 'text-blue-400'
    },
    { 
      id: 'uk_government', 
      name: 'UK Government', 
      icon: Database,
      description: 'HMRC, DVLA, Home Office records',
      color: 'text-green-400'
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && searchParams.databases.length > 0) {
      onSearch({ 
        ...searchParams, 
        query,
        selectedDatabases: searchParams.databases
      } as SearchParams);
    }
  };

  const toggleDatabase = (databaseId: string) => {
    setSearchParams(prev => ({
      ...prev,
      databases: prev.databases.includes(databaseId)
        ? prev.databases.filter(id => id !== databaseId)
        : [...prev.databases, databaseId]
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Search Input */}
      <div className="space-y-2">
        <Label htmlFor="search-query" className="text-sm font-medium text-purple-300">
          Search Query
        </Label>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="search-query"
            type="text"
            placeholder="Enter name, ID number, or other identifier..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 glass border-purple-500/30 focus:border-purple-400 focus:ring-purple-400/20"
          />
        </div>
      </div>

      {/* Database Selection */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-purple-300">
          Target Databases
        </Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {databases.map((db) => (
            <Card 
              key={db.id} 
              className={`cursor-pointer transition-all duration-200 ${
                searchParams.databases.includes(db.id) 
                  ? 'glass-card border-purple-500/50' 
                  : 'glass-dark border-white/10'
              }`}
              onClick={() => toggleDatabase(db.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={searchParams.databases.includes(db.id)}
                    className="mt-1"
                  />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <db.icon className={`h-4 w-4 ${db.color}`} />
                      <span className="font-medium text-white">{db.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{db.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Search Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="confidence" className="text-sm font-medium text-purple-300">
            Confidence Threshold: {(searchParams.confidenceThreshold! * 100).toFixed(0)}%
          </Label>
          <input
            id="confidence"
            type="range"
            min="0.5"
            max="1"
            step="0.05"
            value={searchParams.confidenceThreshold}
            onChange={(e) => setSearchParams(prev => ({ 
              ...prev, 
              confidenceThreshold: parseFloat(e.target.value) 
            }))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="partial-matches"
            checked={searchParams.includePartialMatches}
            onCheckedChange={(checked) => 
              setSearchParams(prev => ({ ...prev, includePartialMatches: !!checked }))
            }
          />
          <Label htmlFor="partial-matches" className="text-sm text-purple-300">
            Include partial matches
          </Label>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button
          type="submit"
          disabled={isLoading || !query.trim() || searchParams.databases.length === 0}
          className="flex-1"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
              Searching...
            </>
          ) : (
            <>
              <Search className="h-4 w-4 mr-2" />
              Execute Search
            </>
          )}
        </Button>
        
        <Button
          type="button"
          variant="outline"
          className="px-6"
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload Image
        </Button>
      </div>
    </form>
  );
}
