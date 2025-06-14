
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Activity, AlertCircle, CheckCircle, Clock, User, Database } from 'lucide-react';

interface ActivityLog {
  id: string;
  timestamp: Date;
  type: 'search' | 'match' | 'alert' | 'sync';
  message: string;
  user: string;
  database: string;
  severity: 'low' | 'medium' | 'high';
}

const mockActivities: ActivityLog[] = [
  {
    id: '1',
    timestamp: new Date(),
    type: 'match',
    message: 'High confidence match found for facial recognition query',
    user: 'Agent Smith',
    database: 'Indian Government',
    severity: 'high'
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 60000),
    type: 'search',
    message: 'Cross-database search initiated for ID: 4721',
    user: 'Agent Johnson',
    database: 'US Federal',
    severity: 'medium'
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 120000),
    type: 'alert',
    message: 'Potential duplicate identity detected across databases',
    user: 'System',
    database: 'Multiple',
    severity: 'high'
  },
  {
    id: '4',
    timestamp: new Date(Date.now() - 180000),
    type: 'sync',
    message: 'Database synchronization completed successfully',
    user: 'System',
    database: 'UK Government',
    severity: 'low'
  },
];

export function RealTimeMonitor() {
  const [activities, setActivities] = useState<ActivityLog[]>(mockActivities);

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      const newActivity: ActivityLog = {
        id: Date.now().toString(),
        timestamp: new Date(),
        type: ['search', 'match', 'alert', 'sync'][Math.floor(Math.random() * 4)] as any,
        message: 'New system activity detected',
        user: ['Agent Smith', 'Agent Johnson', 'Agent Brown', 'System'][Math.floor(Math.random() * 4)],
        database: ['Indian Government', 'US Federal', 'UK Government'][Math.floor(Math.random() * 3)],
        severity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any
      };
      
      setActivities(prev => [newActivity, ...prev.slice(0, 19)]);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'search': return <User className="h-4 w-4" />;
      case 'match': return <CheckCircle className="h-4 w-4" />;
      case 'alert': return <AlertCircle className="h-4 w-4" />;
      case 'sync': return <Database className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-blue-400';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-green-400" />
          Real-Time Activity Monitor
          <Badge variant="outline" className="ml-auto">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse" />
            Live
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-80">
          <div className="space-y-3">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg glass-dark">
                <div className={`${getSeverityColor(activity.severity)} mt-0.5`}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm text-white">{activity.message}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {activity.user}
                    </span>
                    <span className="flex items-center gap-1">
                      <Database className="h-3 w-3" />
                      {activity.database}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {activity.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${getSeverityColor(activity.severity)} border-current`}
                >
                  {activity.severity}
                </Badge>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
