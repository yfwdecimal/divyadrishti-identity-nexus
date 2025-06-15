
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Upload, Database, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { parseCSVFile, CSVParseResult } from '@/utils/csvParser';
import { addImportedRecords } from '@/data/governmentDatabases';
import { useToast } from '@/hooks/use-toast';

export function DatabaseImport() {
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [parseResult, setParseResult] = useState<CSVParseResult | null>(null);
  const [importProgress, setImportProgress] = useState(0);
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setImportFile(file);
      setParseResult(null);
      setImportProgress(0);
      console.log('CSV file selected:', file.name);
    } else {
      toast({
        title: "Invalid File",
        description: "Please select a valid CSV file.",
        variant: "destructive",
      });
    }
  };

  const handleImport = async () => {
    if (!importFile) {
      toast({
        title: "No File Selected",
        description: "Please select a CSV file to import.",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);
    setImportProgress(0);
    
    try {
      console.log('Starting CSV import...');
      
      // Simulate progress during parsing
      for (let i = 0; i <= 50; i += 10) {
        setImportProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      const result = await parseCSVFile(importFile);
      setParseResult(result);
      
      if (!result.success || result.records.length === 0) {
        throw new Error(`No valid records found: ${result.errors.join(', ')}`);
      }

      // Complete progress during record addition
      for (let i = 60; i <= 100; i += 10) {
        setImportProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Add records to the database
      addImportedRecords(result.records);
      
      toast({
        title: "Import Successful",
        description: `Successfully imported ${result.validRows} records from ${importFile.name}`,
      });

      console.log(`Import completed: ${result.validRows} records added`);
      
    } catch (error) {
      console.error('Import failed:', error);
      toast({
        title: "Import Failed",
        description: String(error),
        variant: "destructive",
      });
      setImportProgress(0);
    } finally {
      setIsImporting(false);
    }
  };

  const resetImport = () => {
    setImportFile(null);
    setParseResult(null);
    setImportProgress(0);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-400" />
            Import Identity Database
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="csv-upload">Upload CSV File</Label>
            <Input
              id="csv-upload"
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              disabled={isImporting}
              className="cursor-pointer"
            />
            <p className="text-xs text-muted-foreground">
              CSV format: name, email, phone, city, state, country, image_url (optional)
            </p>
          </div>

          {importFile && (
            <div className="p-3 bg-slate-800/30 rounded-lg border border-slate-700">
              <div className="flex items-center gap-2 mb-1">
                <FileText className="h-4 w-4 text-blue-400" />
                <span className="font-medium text-sm">{importFile.name}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Size: {(importFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <Button 
              onClick={handleImport}
              disabled={!importFile || isImporting}
              className="flex-1"
            >
              <Upload className="h-4 w-4 mr-2" />
              {isImporting ? 'Importing...' : 'Import Data'}
            </Button>
            
            {(importFile || parseResult) && (
              <Button 
                variant="outline" 
                onClick={resetImport}
                disabled={isImporting}
              >
                Reset
              </Button>
            )}
          </div>

          {isImporting && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processing...</span>
                <span>{importProgress}%</span>
              </div>
              <Progress value={importProgress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {parseResult && !isImporting && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {parseResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-400" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-400" />
              )}
              Import Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant={parseResult.success ? "default" : "destructive"}>
                  {parseResult.success ? "Success" : "Failed"}
                </Badge>
                <span className="text-sm">
                  {parseResult.validRows} of {parseResult.totalRows} rows imported
                </span>
              </div>
              
              {parseResult.errors.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 text-sm">Issues Found:</h4>
                  <div className="bg-yellow-900/20 border border-yellow-500/30 rounded p-2 max-h-24 overflow-y-auto">
                    {parseResult.errors.slice(0, 5).map((error, index) => (
                      <p key={index} className="text-xs text-yellow-300">{error}</p>
                    ))}
                    {parseResult.errors.length > 5 && (
                      <p className="text-xs text-yellow-300">... and {parseResult.errors.length - 5} more</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
