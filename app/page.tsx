import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { 
  Code2, 
  Wifi, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  TrendingUp 
} from 'lucide-react';

export default function DashboardPage() {
  // Mock data for dashboard
  const stats = {
    codeReviews: {
      total: 24,
      completed: 18,
      pending: 6,
      critical: 2
    },
    iotDevices: {
      total: 15,
      online: 12,
      offline: 3,
      warnings: 1
    },
    agentActivity: {
      requestsToday: 47,
      avgResponseTime: '1.2s',
      successRate: 94.5
    }
  };

  const recentActivity = [
    {
      id: 1,
      type: 'code-review',
      title: 'Repository scan completed for frontend-app',
      timestamp: '2 minutes ago',
      status: 'completed',
      icon: CheckCircle
    },
    {
      id: 2,
      type: 'iot-device',
      title: 'Device sensor-001 status check',
      timestamp: '5 minutes ago',
      status: 'completed',
      icon: Activity
    },
    {
      id: 3,
      type: 'code-review',
      title: 'Critical security issue detected in auth.ts',
      timestamp: '12 minutes ago',
      status: 'warning',
      icon: AlertTriangle
    },
    {
      id: 4,
      type: 'iot-device',
      title: 'Command sent to actuator-001',
      timestamp: '18 minutes ago',
      status: 'completed',
      icon: Wifi
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor your AI agent activities and system status
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Activity className="w-4 h-4 mr-2" />
            View Logs
          </Button>
          <Button size="sm">
            <TrendingUp className="w-4 h-4 mr-2" />
            Analytics
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Code Reviews</CardTitle>
            <Code2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.codeReviews.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.codeReviews.completed} completed, {stats.codeReviews.pending} pending
            </p>
            {stats.codeReviews.critical > 0 && (
              <Badge variant="destructive" className="mt-2">
                {stats.codeReviews.critical} critical
              </Badge>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">IoT Devices</CardTitle>
            <Wifi className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.iotDevices.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.iotDevices.online} online, {stats.iotDevices.offline} offline
            </p>
            {stats.iotDevices.warnings > 0 && (
              <Badge variant="outline" className="mt-2">
                {stats.iotDevices.warnings} warning
              </Badge>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agent Requests</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.agentActivity.requestsToday}</div>
            <p className="text-xs text-muted-foreground">
              Today • {stats.agentActivity.avgResponseTime} avg response
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.agentActivity.successRate}%</div>
            <p className="text-xs text-muted-foreground">
              Last 24 hours
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/code-review">
              <Button variant="outline" className="w-full justify-start">
                <Code2 className="w-4 h-4 mr-2" />
                Start Code Review
              </Button>
            </Link>
            <Link href="/iot-devices">
              <Button variant="outline" className="w-full justify-start">
                <Wifi className="w-4 h-4 mr-2" />
                Check Device Status
              </Button>
            </Link>
            <Link href="/agent">
              <Button variant="outline" className="w-full justify-start">
                <Activity className="w-4 h-4 mr-2" />
                Agent Console
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest agent activities and results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => {
                const Icon = activity.icon;
                return (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className={`p-2 rounded-full ${
                      activity.status === 'completed' ? 'bg-green-100 text-green-600' :
                      activity.status === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                        <Badge 
                          variant={activity.status === 'completed' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {activity.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
