
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
    if (file) {
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        setImportFile(file);
        setParseResult(null);
        setImportProgress(0);
        console.log('CSV file selected:', file.name, 'Size:', file.size, 'bytes');
        toast({
          title: "File Selected",
          description: `Selected ${file.name} (${(file.size / 1024).toFixed(1)} KB)`,
        });
      } else {
        toast({
          title: "Invalid File",
          description: "Please select a valid CSV file.",
          variant: "destructive",
        });
        setImportFile(null);
      }
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
      console.log('Starting CSV import for file:', importFile.name);
      
      // Progress simulation for user feedback
      setImportProgress(10);
      await new Promise(resolve => setTimeout(resolve, 200));
      
      setImportProgress(30);
      console.log('Parsing CSV file...');
      const result = await parseCSVFile(importFile);
      
      setImportProgress(60);
      console.log('Parse result:', result);
      setParseResult(result);
      
      if (!result.success && result.records.length === 0) {
        throw new Error(`No valid records found. Errors: ${result.errors.join(', ')}`);
      }

      setImportProgress(80);
      console.log(`Adding ${result.records.length} records to database...`);
      
      // Add records to the database
      addImportedRecords(result.records);
      
      setImportProgress(100);
      
      toast({
        title: "Import Successful",
        description: `Successfully imported ${result.validRows} records from ${importFile.name}`,
      });

      console.log(`Import completed successfully: ${result.validRows} records added`);
      
    } catch (error) {
      console.error('Import failed:', error);
      setImportProgress(0);
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const resetImport = () => {
    setImportFile(null);
    setParseResult(null);
    setImportProgress(0);
    // Reset file input
    const fileInput = document.getElementById('csv-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="glass-card border-purple-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Database className="h-5 w-5 text-purple-400" />
            Import Identity Database
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="csv-upload" className="text-purple-300">
              Upload CSV File
            </Label>
            <Input
              id="csv-upload"
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileUpload}
              disabled={isImporting}
              className="cursor-pointer glass border-purple-500/30 focus:border-purple-400 file:text-purple-300"
            />
            <p className="text-xs text-muted-foreground">
              Supported columns: name, email, phone, city, state, country, image_url
            </p>
          </div>

          {importFile && (
            <div className="p-3 glass-dark rounded-lg border border-purple-500/20">
              <div className="flex items-center gap-2 mb-1">
                <FileText className="h-4 w-4 text-purple-400" />
                <span className="font-medium text-sm text-white">{importFile.name}</span>
              </div>
              <p className="text-xs text-purple-300">
                Size: {(importFile.size / 1024).toFixed(1)} KB | Type: {importFile.type || 'CSV'}
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
              <div className="flex justify-between text-sm text-purple-300">
                <span>Processing CSV file...</span>
                <span>{importProgress}%</span>
              </div>
              <Progress value={importProgress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {parseResult && !isImporting && (
        <Card className="glass-card border-purple-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
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
                <span className="text-sm text-purple-300">
                  {parseResult.validRows} of {parseResult.totalRows} rows imported
                </span>
              </div>
              
              {parseResult.errors.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 text-sm text-purple-300">Issues Found:</h4>
                  <div className="glass-dark border border-yellow-500/30 rounded p-2 max-h-32 overflow-y-auto">
                    {parseResult.errors.slice(0, 10).map((error, index) => (
                      <p key={index} className="text-xs text-yellow-300 mb-1">{error}</p>
                    ))}
                    {parseResult.errors.length > 10 && (
                      <p className="text-xs text-yellow-300">... and {parseResult.errors.length - 10} more issues</p>
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
