
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, FileText, Table, BarChart3, Shield, Calendar } from 'lucide-react';

interface ExportOptions {
  format: 'json' | 'csv' | 'xlsx' | 'pdf';
  includeMetadata: boolean;
  includeFaceData: boolean;
  includeConfidenceScores: boolean;
  dateRange: '7days' | '30days' | '90days' | 'all';
  databases: string[];
}

export function ExportReports({ searchResults }: { searchResults: any[] }) {
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'json',
    includeMetadata: true,
    includeFaceData: false,
    includeConfidenceScores: true,
    dateRange: '30days',
    databases: ['indian_government', 'us_federal', 'uk_government']
  });

  const [isExporting, setIsExporting] = useState(false);

  const exportFormats = [
    { value: 'json', label: 'JSON', icon: FileText, description: 'Structured data format' },
    { value: 'csv', label: 'CSV', icon: Table, description: 'Comma-separated values' },
    { value: 'xlsx', label: 'Excel', icon: BarChart3, description: 'Microsoft Excel format' },
    { value: 'pdf', label: 'PDF', icon: FileText, description: 'Portable document format' },
  ];

  const handleExport = async () => {
    setIsExporting(true);
    
    // Simulate export processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        totalRecords: searchResults.length,
        options: exportOptions
      },
      records: searchResults.map(result => ({
        id: result.record.id,
        name: result.record.name,
        email: result.record.email,
        phone: result.record.phone,
        location: result.record.location,
        confidence: exportOptions.includeConfidenceScores ? result.overallConfidence : undefined,
        matchedFields: result.matchedFields,
        source: result.record.source,
        database: result.record.database,
        ...(exportOptions.includeMetadata && { metadata: result.record.metadata }),
        ...(exportOptions.includeFaceData && { faceEmbedding: result.record.faceEmbedding }),
      }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `divyadrishti-export-${new Date().toISOString().split('T')[0]}.${exportOptions.format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setIsExporting(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5 text-cyan-400" />
          Export & Reporting
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Export Format Selection */}
        <div className="space-y-3">
          <h4 className="font-medium text-white">Export Format</h4>
          <div className="grid grid-cols-2 gap-3">
            {exportFormats.map((format) => (
              <div 
                key={format.value}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  exportOptions.format === format.value 
                    ? 'border-purple-500 bg-purple-500/10' 
                    : 'border-muted-foreground/30 hover:border-purple-400/50'
                }`}
                onClick={() => setExportOptions(prev => ({ ...prev, format: format.value as any }))}
              >
                <div className="flex items-center gap-2 mb-1">
                  <format.icon className="h-4 w-4 text-purple-400" />
                  <span className="font-medium text-white">{format.label}</span>
                </div>
                <p className="text-xs text-muted-foreground">{format.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Export Options */}
        <div className="space-y-4">
          <h4 className="font-medium text-white">Export Options</h4>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="metadata"
                checked={exportOptions.includeMetadata}
                onCheckedChange={(checked) => 
                  setExportOptions(prev => ({ ...prev, includeMetadata: !!checked }))
                }
              />
              <label htmlFor="metadata" className="text-sm text-muted-foreground">
                Include metadata and source information
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="confidence"
                checked={exportOptions.includeConfidenceScores}
                onCheckedChange={(checked) => 
                  setExportOptions(prev => ({ ...prev, includeConfidenceScores: !!checked }))
                }
              />
              <label htmlFor="confidence" className="text-sm text-muted-foreground">
                Include confidence scores and match breakdown
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="facedata"
                checked={exportOptions.includeFaceData}
                onCheckedChange={(checked) => 
                  setExportOptions(prev => ({ ...prev, includeFaceData: !!checked }))
                }
              />
              <label htmlFor="facedata" className="text-sm text-muted-foreground">
                Include facial recognition data (classified)
              </label>
              <Badge variant="outline" className="text-xs">
                <Shield className="h-3 w-3 mr-1" />
                Restricted
              </Badge>
            </div>
          </div>
        </div>

        {/* Date Range */}
        <div className="space-y-2">
          <h4 className="font-medium text-white">Date Range</h4>
          <Select 
            value={exportOptions.dateRange} 
            onValueChange={(value: any) => setExportOptions(prev => ({ ...prev, dateRange: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Export Summary */}
        <div className="glass-dark p-4 rounded-lg space-y-2">
          <h4 className="font-medium text-white">Export Summary</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Records:</span>
              <span className="text-white ml-2">{searchResults.length}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Format:</span>
              <span className="text-white ml-2">{exportOptions.format.toUpperCase()}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Size (est):</span>
              <span className="text-white ml-2">
                {Math.round(searchResults.length * 0.5)}KB
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Classification:</span>
              <Badge variant="outline" className="text-xs ml-2">
                {exportOptions.includeFaceData ? 'Top Secret' : 'Confidential'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Export Button */}
        <Button 
          onClick={handleExport} 
          disabled={isExporting || searchResults.length === 0}
          className="w-full"
        >
          {isExporting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
              Generating Export...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Generate Export
            </>
          )}
        </Button>

        {searchResults.length === 0 && (
          <p className="text-center text-sm text-muted-foreground">
            No search results available for export
          </p>
        )}
      </CardContent>
    </Card>
  );
}
