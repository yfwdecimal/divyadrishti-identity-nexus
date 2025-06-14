
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle, Shield, Database, Users } from 'lucide-react';

const searchTrends = [
  { month: 'Jan', searches: 1200, matches: 890 },
  { month: 'Feb', searches: 1350, matches: 920 },
  { month: 'Mar', searches: 1180, matches: 850 },
  { month: 'Apr', searches: 1420, matches: 980 },
  { month: 'May', searches: 1680, matches: 1150 },
  { month: 'Jun', searches: 1850, matches: 1280 },
];

const databaseDistribution = [
  { name: 'Indian Government', value: 45, color: '#ff7300' },
  { name: 'US Federal', value: 30, color: '#0088fe' },
  { name: 'UK Government', value: 25, color: '#00c49f' },
];

const threatLevels = [
  { level: 'High Risk', count: 23, color: 'bg-red-500', trend: '+5' },
  { level: 'Medium Risk', count: 67, color: 'bg-yellow-500', trend: '-2' },
  { level: 'Low Risk', count: 156, color: 'bg-green-500', trend: '+12' },
  { level: 'Cleared', count: 892, color: 'bg-blue-500', trend: '+8' },
];

export function AnalyticsDashboard() {
  return (
    <div className="space-y-6">
      {/* Threat Level Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {threatLevels.map((threat) => (
          <Card key={threat.level}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{threat.level}</p>
                  <p className="text-2xl font-bold text-white">{threat.count}</p>
                </div>
                <div className={`w-3 h-8 rounded ${threat.color}`} />
              </div>
              <div className="flex items-center mt-2">
                {threat.trend.startsWith('+') ? (
                  <TrendingUp className="h-4 w-4 text-green-400 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-400 mr-1" />
                )}
                <span className="text-sm text-muted-foreground">{threat.trend} this week</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Search Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-400" />
              Search Activity Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={searchTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
                <Line type="monotone" dataKey="searches" stroke="#8B5CF6" strokeWidth={2} />
                <Line type="monotone" dataKey="matches" stroke="#06B6D4" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Database Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-cyan-400" />
              Database Usage Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={databaseDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {databaseDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-400" />
            System Health & Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Database Sync</span>
                <span className="text-sm text-green-400">98.7%</span>
              </div>
              <Progress value={98.7} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Query Response</span>
                <span className="text-sm text-blue-400">0.8s avg</span>
              </div>
              <Progress value={85} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Accuracy Rate</span>
                <span className="text-sm text-purple-400">97.2%</span>
              </div>
              <Progress value={97.2} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
