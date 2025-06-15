
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Upload, Database, CheckCircle, AlertCircle, RefreshCw, FileText } from 'lucide-react';
import { parseCSVFile, CSVParseResult } from '@/utils/csvParser';
import { addImportedRecords } from '@/data/governmentDatabases';

interface ImportProgress {
  database: string;
  status: 'pending' | 'importing' | 'completed' | 'error';
  progress: number;
  recordsProcessed: number;
  totalRecords: number;
  errors?: string[];
}

export function DatabaseImport() {
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importProgress, setImportProgress] = useState<ImportProgress[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [parseResult, setParseResult] = useState<CSVParseResult | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImportFile(file);
      setParseResult(null);
      console.log('File selected:', file.name, 'Size:', file.size, 'Type:', file.type);
    }
  };

  const handleImport = async () => {
    if (!importFile) return;

    setIsImporting(true);
    console.log('Starting import of file:', importFile.name);
    
    const importItem: ImportProgress = {
      database: importFile.name,
      status: 'importing',
      progress: 0,
      recordsProcessed: 0,
      totalRecords: 0,
    };

    setImportProgress([importItem]);

    try {
      // Parse CSV file
      console.log('Parsing CSV file...');
      const result = await parseCSVFile(importFile);
      setParseResult(result);
      
      if (!result.success) {
        throw new Error(`CSV parsing failed: ${result.errors.join(', ')}`);
      }

      // Update progress during parsing
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setImportProgress([{
          ...importItem,
          progress: i,
          recordsProcessed: Math.floor((i / 100) * result.validRows),
          totalRecords: result.validRows,
        }]);
      }

      // Add records to the searchable database
      console.log(`Adding ${result.records.length} records to database...`);
      addImportedRecords(result.records);
      
      // Mark as completed
      setImportProgress([{
        ...importItem,
        status: 'completed',
        progress: 100,
        recordsProcessed: result.validRows,
        totalRecords: result.validRows,
        errors: result.errors,
      }]);

      console.log(`Successfully imported ${result.validRows} records from ${importFile.name}`);
      
    } catch (error) {
      console.error('Import failed:', error);
      setImportProgress([{
        ...importItem,
        status: 'error',
        progress: 0,
        errors: [String(error)],
      }]);
    } finally {
      setIsImporting(false);
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
            Indian Government Database Import
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Upload CSV Data File</Label>
              <div className="space-y-2">
                <Input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="cursor-pointer"
                />
                <p className="text-sm text-muted-foreground">
                  Supported format: CSV files with columns like name, email, phone, city, state, etc.
                </p>
              </div>
            </div>

            {importFile && (
              <div className="p-4 bg-slate-800/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-purple-400" />
                  <span className="font-medium">Selected File</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  <strong>Name:</strong> {importFile.name}<br />
                  <strong>Size:</strong> {(importFile.size / 1024).toFixed(1)} KB<br />
                  <strong>Type:</strong> {importFile.type || 'text/csv'}
                </p>
              </div>
            )}
          </div>

          <Button 
            onClick={handleImport}
            disabled={!importFile || isImporting}
            className="w-full"
          >
            <Upload className="h-4 w-4 mr-2" />
            {isImporting ? 'Importing...' : 'Import CSV Data'}
          </Button>
        </CardContent>
      </Card>

      {parseResult && (
        <Card>
          <CardHeader>
            <CardTitle>Parse Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant={parseResult.success ? "default" : "destructive"}>
                  {parseResult.success ? "Success" : "Failed"}
                </Badge>
                <span className="text-sm">
                  {parseResult.validRows} of {parseResult.totalRows} rows imported
                </span>
              </div>
              
              {parseResult.errors.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Errors:</h4>
                  <div className="bg-red-900/20 border border-red-500/30 rounded p-3 max-h-32 overflow-y-auto">
                    {parseResult.errors.slice(0, 10).map((error, index) => (
                      <p key={index} className="text-sm text-red-300">{error}</p>
                    ))}
                    {parseResult.errors.length > 10 && (
                      <p className="text-sm text-red-300">... and {parseResult.errors.length - 10} more errors</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

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
                  
                  {item.errors && item.errors.length > 0 && (
                    <div className="text-sm text-red-300">
                      {item.errors.slice(0, 3).join('; ')}
                      {item.errors.length > 3 && '...'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
