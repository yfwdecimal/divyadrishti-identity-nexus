
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Upload, Database, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface ImportProgress {
  database: string;
  status: 'pending' | 'importing' | 'completed' | 'error';
  progress: number;
  recordsProcessed: number;
  totalRecords: number;
}

export function DatabaseImport() {
  const [selectedDatabase, setSelectedDatabase] = useState('');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importProgress, setImportProgress] = useState<ImportProgress[]>([]);
  const [isImporting, setIsImporting] = useState(false);

  const databases = [
    { id: 'indian_aadhaar', name: 'Indian Aadhaar Database', format: 'CSV/JSON' },
    { id: 'indian_pan', name: 'Indian PAN Database', format: 'XML/CSV' },
    { id: 'indian_voter', name: 'Indian Voter ID Database', format: 'CSV' },
    { id: 'us_ssn', name: 'US Social Security Database', format: 'JSON/CSV' },
    { id: 'us_passport', name: 'US Passport Database', format: 'XML' },
    { id: 'uk_ni', name: 'UK National Insurance Database', format: 'CSV' },
    { id: 'uk_passport', name: 'UK Passport Database', format: 'JSON' },
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImportFile(file);
    }
  };

  const simulateImport = async (database: string, file: File) => {
    const totalRecords = Math.floor(Math.random() * 10000) + 5000;
    const importItem: ImportProgress = {
      database,
      status: 'importing',
      progress: 0,
      recordsProcessed: 0,
      totalRecords,
    };

    setImportProgress(prev => [...prev, importItem]);

    // Simulate import progress
    for (let i = 0; i <= 100; i += 5) {
      await new Promise(resolve => setTimeout(resolve, 200));
      const recordsProcessed = Math.floor((i / 100) * totalRecords);
      
      setImportProgress(prev => 
        prev.map(item => 
          item.database === database 
            ? { ...item, progress: i, recordsProcessed }
            : item
        )
      );
    }

    // Mark as completed
    setImportProgress(prev => 
      prev.map(item => 
        item.database === database 
          ? { ...item, status: 'completed', progress: 100 }
          : item
      )
    );
  };

  const handleImport = async () => {
    if (!selectedDatabase || !importFile) return;

    setIsImporting(true);
    const dbName = databases.find(db => db.id === selectedDatabase)?.name || selectedDatabase;
    
    try {
      await simulateImport(dbName, importFile);
      console.log(`Successfully imported ${importFile.name} to ${dbName}`);
    } catch (error) {
      console.error('Import failed:', error);
      setImportProgress(prev => 
        prev.map(item => 
          item.database === dbName 
            ? { ...item, status: 'error' }
            : item
        )
      );
    } finally {
      setIsImporting(false);
      setImportFile(null);
      setSelectedDatabase('');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'importing': return <RefreshCw className="h-4 w-4 animate-spin text-blue-400" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-400" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'importing': return 'text-blue-400';
      case 'completed': return 'text-green-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-6 w-6 text-purple-400" />
            Government Database Import
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Select Database</Label>
              <Select value={selectedDatabase} onValueChange={setSelectedDatabase}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose database to import" />
                </SelectTrigger>
                <SelectContent>
                  {databases.map(db => (
                    <SelectItem key={db.id} value={db.id}>
                      {db.name} ({db.format})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Upload Data File</Label>
              <Input
                type="file"
                accept=".csv,.json,.xml"
                onChange={handleFileUpload}
                className="cursor-pointer"
              />
            </div>
          </div>

          <Button 
            onClick={handleImport}
            disabled={!selectedDatabase || !importFile || isImporting}
            className="w-full"
          >
            <Upload className="h-4 w-4 mr-2" />
            {isImporting ? 'Importing...' : 'Start Import'}
          </Button>
        </CardContent>
      </Card>

      {importProgress.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Import Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {importProgress.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(item.status)}
                      <span className="font-medium">{item.database}</span>
                      <Badge variant="outline" className={getStatusColor(item.status)}>
                        {item.status}
                      </Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {item.recordsProcessed.toLocaleString()} / {item.totalRecords.toLocaleString()} records
                    </span>
                  </div>
                  <Progress value={item.progress} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
