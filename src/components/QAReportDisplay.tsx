
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { QAReport } from '@/types/divyadrishti';
import { FileText, Download, AlertTriangle, CheckCircle, Database, Calendar } from 'lucide-react';

interface QAReportDisplayProps {
  report: QAReport;
}

export const QAReportDisplay: React.FC<QAReportDisplayProps> = ({ report }) => {
  const exportReport = () => {
    const reportData = {
      ...report,
      generatedAt: report.generatedAt.toISOString(),
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qa-report-${report.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-green-400 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            QA Analysis Report
          </CardTitle>
          <Button onClick={exportReport} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Report Header */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-slate-400 text-sm">Report ID</p>
            <p className="text-white font-mono">{report.id}</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Generated
            </p>
            <p className="text-white">{report.generatedAt.toLocaleString()}</p>
          </div>
        </div>

        <Separator className="bg-slate-700" />

        {/* Summary */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Executive Summary</h3>
          <p className="text-slate-300 leading-relaxed">{report.summary}</p>
        </div>

        <Separator className="bg-slate-700" />

        {/* Statistics */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Search Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-700/50 rounded-lg p-3">
              <p className="text-slate-400 text-sm">Total Matches</p>
              <p className="text-2xl font-bold text-blue-400">{report.totalMatches}</p>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-3">
              <p className="text-slate-400 text-sm">High Confidence</p>
              <p className="text-2xl font-bold text-green-400">{report.highConfidenceMatches}</p>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-3">
              <p className="text-slate-400 text-sm">Cross-DB Matches</p>
              <p className="text-2xl font-bold text-yellow-400">{report.crossDatabaseMatches.length}</p>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-3">
              <p className="text-slate-400 text-sm">Databases</p>
              <p className="text-2xl font-bold text-purple-400">{Object.keys(report.matchesByDatabase).length}</p>
            </div>
          </div>
        </div>

        <Separator className="bg-slate-700" />

        {/* Database Breakdown */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Database className="w-5 h-5" />
            Database Distribution
          </h3>
          <div className="space-y-3">
            {Object.entries(report.matchesByDatabase).map(([database, count]) => (
              <div key={database} className="flex justify-between items-center">
                <span className="text-slate-300">{database}</span>
                <Badge variant="outline" className="bg-slate-700">
                  {count} matches
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Cross-Database Matches */}
        {report.crossDatabaseMatches.length > 0 && (
          <>
            <Separator className="bg-slate-700" />
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                Cross-Database Analysis
              </h3>
              <div className="space-y-4">
                {report.crossDatabaseMatches.map((match, index) => (
                  <Card key={index} className="bg-slate-700/30 border-slate-600">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-white">{match.primaryRecord.name}</h4>
                          <p className="text-sm text-slate-400">
                            Primary: {match.primaryRecord.database} ({match.primaryRecord.source})
                          </p>
                        </div>
                        <Badge variant={match.confidence > 0.8 ? 'default' : 'secondary'}>
                          {Math.round(match.confidence * 100)}% confidence
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-sm text-slate-300">
                          Related records in: {match.relatedRecords.map(r => r.database).join(', ')}
                        </p>
                        
                        {match.discrepancies.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-yellow-400 mb-1">Discrepancies Found:</p>
                            <ul className="list-disc list-inside text-sm text-slate-300 ml-4">
                              {match.discrepancies.map((discrepancy, i) => (
                                <li key={i}>{discrepancy}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </>
        )}

        <Separator className="bg-slate-700" />

        {/* Recommendations */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            Recommendations
          </h3>
          <div className="space-y-2">
            {report.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0" />
                <p className="text-slate-300">{recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
