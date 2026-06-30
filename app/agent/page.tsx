import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  MessageSquare, 
  Settings, 
  Zap,
  CheckCircle,
  AlertTriangle,
  Clock,
  Play,
  Pause,
  Square
} from 'lucide-react';

export default function AgentPage() {
  // Mock data for agent console
  const agentStatus = {
    isRunning: true,
    uptime: '2d 14h 32m',
    requestsProcessed: 1247,
    avgResponseTime: '1.2s',
    successRate: 94.5,
    domains: ['code-review', 'iot-device'],
    version: '1.0.0'
  };

  const recentRequests = [
    {
      id: 1,
      domain: 'code-review',
      action: 'repo_scan',
      status: 'completed',
      timestamp: '2 minutes ago',
      responseTime: '850ms',
      confidence: 0.95
    },
    {
      id: 2,
      domain: 'iot-device',
      action: 'device_status',
      status: 'completed',
      timestamp: '5 minutes ago',
      responseTime: '1.1s',
      confidence: 0.92
    },
    {
      id: 3,
      domain: 'code-review',
      action: 'diff_review',
      status: 'warning',
      timestamp: '12 minutes ago',
      responseTime: '2.3s',
      confidence: 0.78
    },
    {
      id: 4,
      domain: 'iot-device',
      action: 'device_command',
      status: 'completed',
      timestamp: '18 minutes ago',
      responseTime: '950ms',
      confidence: 0.88
    }
  ];

  const systemMetrics = {
    cpu: 45,
    memory: 62,
    network: 12,
    disk: 34
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agent Console</h1>
          <p className="text-muted-foreground">
            Monitor and manage your AI agent performance
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button variant="outline" size="sm">
            <Pause className="w-4 h-4 mr-2" />
            Pause
          </Button>
          <Button size="sm">
            <Play className="w-4 h-4 mr-2" />
            Start
          </Button>
        </div>
      </div>

      {/* Agent Status */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agent Status</CardTitle>
            <div className={`w-3 h-3 rounded-full ${agentStatus.isRunning ? 'bg-green-500' : 'bg-red-500'}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {agentStatus.isRunning ? 'Running' : 'Stopped'}
            </div>
            <p className="text-xs text-muted-foreground">
              Uptime: {agentStatus.uptime}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Requests Processed</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agentStatus.requestsProcessed}</div>
            <p className="text-xs text-muted-foreground">
              Total requests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agentStatus.avgResponseTime}</div>
            <p className="text-xs text-muted-foreground">
              Last 24 hours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agentStatus.successRate}%</div>
            <p className="text-xs text-muted-foreground">
              Successful requests
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Agent Console */}
      <Tabs defaultValue="requests" className="space-y-4">
        <TabsList>
          <TabsTrigger value="requests">Recent Requests</TabsTrigger>
          <TabsTrigger value="logs">Agent Logs</TabsTrigger>
          <TabsTrigger value="metrics">System Metrics</TabsTrigger>
          <TabsTrigger value="chat">Agent Chat</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Agent Requests</CardTitle>
              <CardDescription>
                Latest requests processed by the agent
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-full ${
                        request.status === 'completed' ? 'bg-green-100 text-green-600' :
                        request.status === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        <Activity className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-medium">
                          {request.domain} • {request.action}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Request ID: {request.id}
                        </p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-xs text-muted-foreground flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {request.timestamp}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Response: {request.responseTime}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Confidence: {(request.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={
                        request.status === 'completed' ? 'default' :
                        request.status === 'warning' ? 'secondary' :
                        'destructive'
                      }>
                        {request.status}
                      </Badge>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Agent Logs</CardTitle>
              <CardDescription>
                Real-time agent activity and error logs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm h-64 overflow-y-auto">
                <div>[2024-01-15 10:32:15] INFO: Agent started successfully</div>
                <div>[2024-01-15 10:32:15] INFO: MCP server connection established</div>
                <div>[2024-01-15 10:32:16] INFO: Code review domain initialized</div>
                <div>[2024-01-15 10:32:16] INFO: IoT device domain initialized</div>
                <div>[2024-01-15 10:33:42] INFO: Processing repo_scan request for /projects/frontend-app</div>
                <div>[2024-01-15 10:33:43] INFO: Repository scan completed successfully</div>
                <div>[2024-01-15 10:35:18] INFO: Processing device_status request for sensor-001</div>
                <div>[2024-01-15 10:35:19] INFO: Device status retrieved successfully</div>
                <div>[2024-01-15 10:37:22] WARN: Low confidence score for diff_review request</div>
                <div>[2024-01-15 10:37:22] INFO: Additional review recommendations provided</div>
                <div>[2024-01-15 10:39:45] INFO: Processing device_command request for actuator-001</div>
                <div>[2024-01-15 10:39:46] INFO: Device command executed successfully</div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Metrics</CardTitle>
              <CardDescription>
                Agent system performance and resource usage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">CPU Usage</span>
                    <span className="text-sm text-muted-foreground">{systemMetrics.cpu}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${systemMetrics.cpu}%` }}
                    />
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Memory Usage</span>
                    <span className="text-sm text-muted-foreground">{systemMetrics.memory}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${systemMetrics.memory}%` }}
                    />
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Network I/O</span>
                    <span className="text-sm text-muted-foreground">{systemMetrics.network} MB/s</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-yellow-600 h-2 rounded-full" 
                      style={{ width: `${systemMetrics.network}%` }}
                    />
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Disk Usage</span>
                    <span className="text-sm text-muted-foreground">{systemMetrics.disk}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-red-600 h-2 rounded-full" 
                      style={{ width: `${systemMetrics.disk}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chat" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Agent Chat</CardTitle>
              <CardDescription>
                Interact directly with the AI agent
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-64 border rounded-lg p-4 overflow-y-auto">
                  <div className="space-y-4">
                    <div className="flex justify-end">
                      <div className="bg-blue-500 text-white p-3 rounded-lg max-w-xs">
                        Can you scan the repository at /projects/frontend-app?
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="bg-gray-100 p-3 rounded-lg max-w-xs">
                        I'll scan the repository for you. Let me analyze the structure and identify any issues.
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="bg-gray-100 p-3 rounded-lg max-w-xs">
                        Repository scan completed. Found 156 files with 12 issues. Would you like me to review the specific issues?
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Ask the agent something..."
                    className="flex-1 px-3 py-2 border rounded-md"
                  />
                  <Button>Send</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
